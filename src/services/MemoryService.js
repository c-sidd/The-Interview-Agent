/**
 * MemoryService — Evidence Graph Manager
 *
 * Maintains structured evidence about the candidate inside the interview session.
 * After every answer, processes the extended evaluation to:
 *   1. Store claims made by the candidate
 *   2. Detect contradictions with earlier claims
 *   3. Record misconceptions
 *   4. Update live skill scores
 *   5. Determine the adaptive question strategy for the next turn
 *
 * No database is used. All state lives inside the session object.
 */
class MemoryService {

    // ─── Public API ────────────────────────────────────────────────────────────

    /**
     * Process an extended evaluation result.
     * Mutates session.evidenceGraph in-place.
     */
    processEvaluation(session, evaluation, question, answer, dayNumber, dayTitle, questionId) {
        if (!session || !session.evidenceGraph) return;
        const graph = session.evidenceGraph;

        // 1. Extract claims (from LLM or synthesise a fallback claim)
        const newClaims = [];
        const rawClaims = Array.isArray(evaluation.claims) ? evaluation.claims : [];

        if (rawClaims.length > 0) {
            rawClaims.forEach(c => {
                const claim = {
                    claim: (c.claim || '').substring(0, 300),
                    relatedSkill: c.relatedSkill || dayTitle,
                    status: this._validStatus(c.status),
                    evidence: answer,
                    questionId,
                    day: dayNumber,
                    dayTitle
                };
                newClaims.push(claim);
                graph.claims.push(claim);
            });
        } else {
            // Synthesise one claim from the classification so skill scoring always works
            const fallback = {
                claim: `Answer to question ${questionId}`,
                relatedSkill: dayTitle,
                status: this._classificationToStatus(evaluation.classification),
                evidence: answer,
                questionId,
                day: dayNumber,
                dayTitle
            };
            newClaims.push(fallback);
            graph.claims.push(fallback);
        }

        // 2. Detect contradictions against all earlier claims
        const prevClaims = graph.claims.filter(c => c.questionId < questionId);
        newClaims.forEach(newClaim => {
            const conflict = this._detectContradiction(prevClaims, newClaim);
            if (conflict && !this._contradictionExists(graph.contradictions, conflict, newClaim)) {
                graph.contradictions.push({
                    earlierClaim: conflict.claim,
                    laterClaim: newClaim.claim,
                    relatedSkill: newClaim.relatedSkill,
                    evidence: `Q${conflict.questionId}: "${conflict.claim.substring(0, 100)}" — Q${questionId}: "${newClaim.claim.substring(0, 100)}"`,
                    questionId,
                    addressed: false
                });
                console.log(`[MemoryService] Contradiction detected on skill "${newClaim.relatedSkill}".`);
            }
        });

        // 3. Store misconceptions (deduplicated by concept)
        const rawMisconceptions = Array.isArray(evaluation.misconceptions) ? evaluation.misconceptions : [];
        rawMisconceptions.forEach(m => {
            const already = graph.misconceptions.some(
                x => x.concept === m.concept && !x.followUpAsked
            );
            if (!already) {
                graph.misconceptions.push({
                    concept: m.concept || dayTitle,
                    misunderstanding: m.misunderstanding || '',
                    evidence: answer,
                    severity: this._validSeverity(m.severity),
                    relatedDay: dayNumber,
                    questionId,
                    followUpAsked: false
                });
                console.log(`[MemoryService] Misconception recorded: "${m.concept}" (${m.severity || 'medium'})`);
            }
        });

        // 4. Update skill scores based on new claims
        newClaims.forEach(claim => this._updateSkill(graph.skills, claim, evaluation.scores));
    }

    /**
     * Determine the adaptive question strategy for the NEXT turn.
     * Returns a strategy object.  Priority order:
     *   1. Open contradiction
     *   2. High-severity unaddressed misconception
     *   3. Classification result
     *   4. Medium misconception (when Incorrect)
     *   5. Default curriculum
     */
    determineStrategy(evidenceGraph, evaluation) {
        // Priority 1 – contradiction
        const openContradiction = evidenceGraph.contradictions.find(c => !c.addressed);
        if (openContradiction) {
            return {
                type: 'contradiction',
                insight: openContradiction,
                interviewerStatus: '🔎 Revisiting an earlier claim',
                statusDetail: 'Checking consistency in your explanation.'
            };
        }

        // Priority 2 – high severity misconception
        const highM = evidenceGraph.misconceptions.find(m => m.severity === 'high' && !m.followUpAsked);
        if (highM) {
            return {
                type: 'misconception',
                insight: highM,
                interviewerStatus: '🧠 Probing a key concept',
                statusDetail: `Let's explore ${highM.concept} more carefully.`
            };
        }

        // Priority 3 – classification
        const cls = evaluation ? (evaluation.classification || 'Partially Correct') : 'Partially Correct';

        const recentClaims = evaluation ? (evaluation.claims || []) : [];

        if (cls === 'Correct') {
            return {
                type: 'deeper',
                insight: { recentClaims },
                interviewerStatus: '🧠 Probing deeper',
                statusDetail: 'Testing your understanding at a higher level.'
            };
        }
        if (cls === "Don't Know") {
            return {
                type: 'diagnostic',
                insight: { recentClaims },
                interviewerStatus: '🔍 Exploring a knowledge gap',
                statusDetail: "Let's break this down step by step."
            };
        }
        if (cls === 'Off Topic') {
            return {
                type: 'clarification',
                insight: { recentClaims },
                interviewerStatus: '💬 Refocusing the question',
                statusDetail: 'Let me rephrase that for you.'
            };
        }
        if (cls === 'Incorrect') {
            // Priority 4 – any open misconception
            const anyM = evidenceGraph.misconceptions.find(m => !m.followUpAsked);
            if (anyM) {
                return {
                    type: 'misconception',
                    insight: anyM,
                    interviewerStatus: '🧠 Checking your reasoning',
                    statusDetail: `Let's revisit ${anyM.concept}.`
                };
            }
            return {
                type: 'diagnostic',
                insight: { recentClaims },
                interviewerStatus: '🔍 Exploring a knowledge gap',
                statusDetail: "Let's identify where the understanding breaks."
            };
        }

        // Partially Correct
        return {
            type: 'clarification',
            insight: { recentClaims },
            interviewerStatus: '💬 Asking for clarity',
            statusDetail: 'Could you be more specific?'
        };
    }

    /**
     * Mark the strategy's insight as addressed so it won't be re-asked.
     */
    markInsightAddressed(evidenceGraph, strategy) {
        if (!strategy || !strategy.insight) return;
        if (strategy.type === 'contradiction') {
            strategy.insight.addressed = true;
        } else if (strategy.type === 'misconception') {
            strategy.insight.followUpAsked = true;
        }
    }

    /**
     * Return live skill map sorted by score, capped at 8 entries.
     */
    getSkillMap(evidenceGraph) {
        return Object.values(evidenceGraph.skills)
            .sort((a, b) => b.score - a.score)
            .slice(0, 8);
    }

    // ─── Private helpers ───────────────────────────────────────────────────────

    _validStatus(s) {
        return ['correct', 'incorrect', 'uncertain', 'unverified'].includes(s) ? s : 'unverified';
    }

    _validSeverity(s) {
        return ['low', 'medium', 'high'].includes(s) ? s : 'medium';
    }

    _classificationToStatus(cls) {
        if (cls === 'Correct') return 'correct';
        if (cls === 'Incorrect') return 'incorrect';
        if (cls === "Don't Know" || cls === 'Off Topic') return 'uncertain';
        return 'unverified';
    }

    _detectContradiction(prevClaims, newClaim) {
        for (const prev of prevClaims) {
            const sameSkill =
                prev.relatedSkill &&
                newClaim.relatedSkill &&
                prev.relatedSkill.toLowerCase() === newClaim.relatedSkill.toLowerCase();
            if (!sameSkill) continue;
            const opposite =
                (prev.status === 'correct' && newClaim.status === 'incorrect') ||
                (prev.status === 'incorrect' && newClaim.status === 'correct');
            if (opposite) return prev;
        }
        return null;
    }

    _contradictionExists(contradictions, earlier, later) {
        return contradictions.some(
            c => c.earlierClaim === earlier.claim && c.laterClaim === later.claim
        );
    }

    _updateSkill(skills, claim, scores) {
        const name = claim.relatedSkill || 'General';
        if (!skills[name]) {
            skills[name] = { skill: name, score: 50, confidence: 0.2, evidence: [], questionsAssessed: [] };
        }
        const s = skills[name];

        // Base delta from claim status
        let delta = { correct: +10, incorrect: -12, uncertain: -4, unverified: 0 }[claim.status] || 0;

        // Blend with accuracy score if available (maps 0-5 → -10..+10)
        if (scores && typeof scores.knowledge === 'number') {
            const accDelta = (scores.knowledge - 2.5) * 4;
            delta = Math.round((delta + accDelta) / 2);
        }

        s.score = Math.max(5, Math.min(100, s.score + delta));
        s.confidence = Math.min(1.0, s.confidence + 0.15);
        s.evidence.push((claim.evidence || '').substring(0, 120));
        s.questionsAssessed.push(claim.questionId);
    }
}

module.exports = MemoryService;
