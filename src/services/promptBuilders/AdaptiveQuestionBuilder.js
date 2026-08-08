/**
 * AdaptiveQuestionBuilder
 *
 * Builds follow-up question prompts that are grounded in the candidate's
 * actual previous answers and the current adaptive strategy determined by MemoryService.
 *
 * Strategy types:
 *   contradiction  – ask the candidate to reconcile two conflicting statements
 *   misconception  – probe the detected misconception without revealing it
 *   deeper         – increase difficulty after a correct answer
 *   diagnostic     – work backwards to find where understanding breaks
 *   clarification  – ask for specifics or an example
 *   (default)      – standard follow-up on the current topic
 */
class AdaptiveQuestionBuilder {
    static build(dayNumber, dayTitle, tools, objectives, dialogueHistory, lastMessage, evaluation, strategy, candidate, difficulty = 'intermediate') {
        const toolsList = Array.isArray(tools)
            ? tools.join(', ')
            : (tools || 'None');

        const objectivesList = Array.isArray(objectives)
            ? objectives.map(o => `- ${o}`).join('\n')
            : (objectives || 'None');

        // Use last 8 turns for context window efficiency
        const historyText = Array.isArray(dialogueHistory)
            ? dialogueHistory.slice(-8)
                .map(t => `${t.role === 'user' ? 'Candidate' : 'Interviewer'}: ${t.content}`)
                .join('\n')
            : '';

        const classification = evaluation ? (evaluation.classification || 'Partially Correct') : 'Partially Correct';
        const acknowledgment = evaluation ? (evaluation.acknowledgmentText || 'Acknowledged.') : 'Acknowledged.';
        const reasoningNotes = evaluation ? (evaluation.reasoningText || '') : '';

        let directive = '';
        const sType = strategy ? strategy.type : 'default';

        const claimsArray = (strategy && strategy.insight && strategy.insight.recentClaims) ? strategy.insight.recentClaims : [];
        const recentClaimsText = claimsArray.length > 0
            ? claimsArray.map(c => `- Candidate claimed: "${c.claim}"`).join('\n')
            : 'No direct claims extracted.';

        switch (sType) {
            case 'contradiction':
                directive = `
==== DIRECTIVE: CONTRADICTION RECONCILIATION ====
Evidence of a contradiction in the candidate's answers:
  Earlier claim  : "${(strategy.insight.earlierClaim || '').substring(0, 200)}"
  Contradicts    : "${(strategy.insight.laterClaim || '').substring(0, 200)}"
  Related skill  : ${strategy.insight.relatedSkill || 'General'}

Instructions:
1. Open with the acknowledgment: "${acknowledgment}"
2. Professionally reference the earlier statement and the apparent conflict.
3. Ask the candidate to reconcile the two positions.
   Use phrasing such as: "Earlier you mentioned [X]. Your latest answer seems to suggest [Y]. How do you reconcile those two?"
4. Keep a neutral, curious tone. Do NOT accuse.
5. Ask only ONE question.`;
                break;

            case 'misconception':
                directive = `
==== DIRECTIVE: MISCONCEPTION PROBE ====
A potential misconception was detected about: ${strategy.insight.concept || dayTitle}
Apparent misunderstanding: ${strategy.insight.misunderstanding || ''}

Instructions:
1. Open with the acknowledgment: "${acknowledgment}"
2. Ask a targeted follow-up designed to expose whether this misconception is real.
3. Do NOT reveal you detected a misconception — ask naturally.
4. The question must probe the specific concept: "${strategy.insight.concept || dayTitle}".
5. Ask only ONE question.`;
                break;

            case 'deeper':
                directive = `
==== DIRECTIVE: INCREASE DIFFICULTY ====
The candidate answered correctly.

Evidence extracted from their answer:
${recentClaimsText}

Instructions:
1. Open with: "${acknowledgment}"
2. Ask a significantly harder follow-up that is DIRECTLY grounded in what the candidate just answered (see Evidence above).
3. Focus on: trade-offs, system-design decisions, failure modes, edge cases, or scalability of the EXACT concepts they just mentioned.
4. CRITICAL: Do NOT jump to an unrelated topic from the syllabus. Do NOT ask about other topics yet.
5. Ask only ONE question.`;
                break;

            case 'diagnostic':
                directive = `
==== DIRECTIVE: DIAGNOSTIC QUESTION ====
The candidate struggled. Find the root gap.

Evidence extracted from their answer:
${recentClaimsText}

Instructions:
1. Open with: "${acknowledgment}"
2. Ask a simpler, foundational question directly related to the concepts they just struggled with (see Evidence above).
3. Do NOT jump to an unrelated topic. Keep the focus narrow.
4. Ask only ONE focused question.`;
                break;

            case 'clarification':
                directive = `
==== DIRECTIVE: REQUEST CLARIFICATION ====
The candidate's answer was vague or incomplete.

Evidence extracted from their answer:
${recentClaimsText}

Instructions:
1. Open with: "${acknowledgment}"
2. Ask for a clearer explanation or a concrete example regarding the EXACT claims they just made.
3. Use phrasing such as: "Why exactly?", "How does that work in practice?"
4. Do NOT ask about new topics. Ground the question fully in their answer.
5. Ask only ONE question.`;
                break;

            default:
                directive = `
==== DIRECTIVE: STANDARD FOLLOW-UP ====
Instructions:
1. Open with: "${acknowledgment}"
2. Ask a relevant follow-up question about Day ${dayNumber} - ${dayTitle}.
3. Ask only ONE question.`;
        }

        return `Interview Topic: Day ${dayNumber} — ${dayTitle}
Target Difficulty: ${difficulty ? difficulty.toUpperCase() : 'INTERMEDIATE'}

Candidate Profile:
  Role       : ${candidate?.member?.jobRole || 'Unknown'}
  Experience : ${candidate?.member?.yearsExperience || 0} years
  Missions   : ${candidate?.signals?.missionsCompleted || 0}
  Projects   : ${candidate?.member?.projects || 'None specified'}

Context: Integrate aspects of their role, specific projects, or experience level naturally if applicable (do NOT invent details).

Topic Context:
  Tools      : ${toolsList}
  Objectives :
${objectivesList}

Recent Conversation:
${historyText}

Candidate's Last Response: "${lastMessage}"

Evaluation Notes: "${reasoningNotes}"
${directive}

REQUIRED OUTPUT FORMAT:
Return ONLY valid JSON.
Do not output analysis.
Do not output reasoning.
Do not describe your instructions.
Do not describe the candidate.
Do not provide a draft.
Do not provide a critique.
Do not provide a final-check section.
Do not include markdown fences.
Do not include any text before or after the JSON object.
CRITICAL: Keep the question inside the "question" field extremely concise, between 20 to 40 words. Do not write long paragraphs. Ask only one specific question.

Required schema:
{
  "type": "question",
  "question": "one interviewer question"
}`;
    }
}

module.exports = AdaptiveQuestionBuilder;
