class FeedbackPromptBuilder {
  /**
   * @param {Object}   candidate        – full candidate object
   * @param {Array}    dialogueHistory  – full conversation history
   * @param {Array}    evaluations      – per-turn evaluation records
   * @param {Object}   evidenceGraph    – session.evidenceGraph (optional, may be null)
   */
  static build(candidate, dialogueHistory, evaluations = [], evidenceGraph = null) {
    const { name, jobRole } = candidate.member || { name: 'The candidate', jobRole: 'Developer' };

    const historyText = Array.isArray(dialogueHistory)
      ? dialogueHistory.map(t => `${t.role === 'user' ? 'Candidate' : 'Interviewer'}: ${t.content}`).join('\n')
      : dialogueHistory || '';

    let scoreSummaryText = '';
    if (Array.isArray(evaluations) && evaluations.length > 0) {
      scoreSummaryText = `
Turn-by-Turn Evaluations and Scores:
${evaluations.map((ev, idx) => {
        const sc = ev.evaluation.scores;
        return `Turn ${idx + 1} — Day ${ev.day} (${ev.title}):
  Candidate Answer  : "${ev.answer}"
  Classification    : ${ev.evaluation.classification}
  Accuracy Score    : ${sc.accuracy}/5
  Reasoning Score   : ${sc.reasoning}/5
  Communication     : ${sc.communication}/5
  Confidence        : ${sc.confidence}/5
  Notes             : ${ev.evaluation.reasoningText}`;
      }).join('\n\n')}
`;
    }

    // ── Evidence graph section ──────────────────────────────────────────────
    let evidenceSection = '';
    if (evidenceGraph) {
      // Skill scores
      const skillLines = Object.values(evidenceGraph.skills)
        .sort((a, b) => b.score - a.score)
        .map(s => `  ${s.skill}: ${Math.round(s.score)}/100 (assessed ${s.questionsAssessed.length}x, confidence ${Math.round(s.confidence * 100)}%)`)
        .join('\n');

      // Misconceptions
      const misconceptionLines = evidenceGraph.misconceptions.length > 0
        ? evidenceGraph.misconceptions.map(m =>
          `  [${m.severity.toUpperCase()}] ${m.concept}: ${m.misunderstanding}`
        ).join('\n')
        : '  None detected.';

      // Contradictions
      const contradictionLines = evidenceGraph.contradictions.length > 0
        ? evidenceGraph.contradictions.map(c =>
          `  Skill: ${c.relatedSkill}\n  Earlier: "${c.earlierClaim}"\n  Later  : "${c.laterClaim}"`
        ).join('\n\n')
        : '  None detected.';

      // Notable claims
      const correctClaims = evidenceGraph.claims.filter(c => c.status === 'correct').slice(0, 3);
      const incorrectClaims = evidenceGraph.claims.filter(c => c.status === 'incorrect').slice(0, 3);

      const correctLines = correctClaims.length > 0
        ? correctClaims.map(c => `  + "${c.claim}" (${c.relatedSkill})`).join('\n')
        : '  None.';
      const incorrectLines = incorrectClaims.length > 0
        ? incorrectClaims.map(c => `  - "${c.claim}" (${c.relatedSkill})`).join('\n')
        : '  None.';

      evidenceSection = `
Evidence Graph (collected during interview):
Live Skill Scores:
${skillLines || '  No skill data collected.'}

Misconceptions Detected:
${misconceptionLines}

Contradictions Detected:
${contradictionLines}

Verified Correct Claims:
${correctLines}

Identified Incorrect Claims:
${incorrectLines}
`;
    }
    // ────────────────────────────────────────────────────────────────────────

    return `You are a Senior Technical Evaluator. The mock interview for candidate ${name} (Target Role: ${jobRole}) has been completed.
You must compile a detailed, objective, and actionable feedback report based on the candidate's answers, their turn-by-turn scores, and the evidence graph collected during the interview.

Complete Dialogue History:
${historyText}
${scoreSummaryText}${evidenceSection}
Instructions:
Evaluate the candidate's performance across the assessed topics.
Use the evidence graph (skill scores, misconceptions, contradictions, claims) as primary evidence.
Identify specific strengths backed by actual quotes or paraphrases from their answers.
Identify specific technical gaps with evidence.
List detected misconceptions and contradictions if any.
Provide concrete, actionable next steps.
Calculate average scores out of 5 from the turn-by-turn ratings.
You must output ONLY a valid JSON object matching the schema below. Do not include markdown fences, leading text, or trailing explanations.

Required JSON Schema:
{
  "summary": "A concise paragraph summarizing overall technical performance, communication clarity, and readiness.",
  "scores": {
    "accuracy":      0,
    "reasoning":     0,
    "communication": 0,
    "confidence":    0
  },
  "strengths": [
    "Specific, technically accurate strength with evidence from the interview."
  ],
  "gaps": [
    "Specific gap or misunderstanding with evidence from the interview."
  ],
  "misconceptions": [
    "Any misconception detected (concept: what they misunderstood)."
  ],
  "contradictions": [
    "Any contradiction detected (earlier claim vs later claim)."
  ],
  "next": [
    "Actionable, concrete next step or study recommendation."
  ]
}`;
  }
}

module.exports = FeedbackPromptBuilder;
