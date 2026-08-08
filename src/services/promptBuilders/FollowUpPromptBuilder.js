class FollowUpPromptBuilder {
  static build(dayNumber, dayTitle, dialogueHistory, lastMessage, evaluation = null, candidate = {}, difficulty = 'intermediate') {
    const historyText = Array.isArray(dialogueHistory)
      ? dialogueHistory.map(turn => `${turn.role === 'user' ? 'Candidate' : 'Interviewer'}: ${turn.content}`).join('\n')
      : dialogueHistory || '';

    // Classify using evaluation data if present
    const classification = evaluation ? evaluation.classification : "Partially Correct";
    const acknowledgment = evaluation ? evaluation.acknowledgmentText : "Acknowledged.";
    const reasoning = evaluation ? evaluation.reasoningText : "";

    return `You are in a follow-up turn. The candidate has answered your initial question for Day ${dayNumber} - ${dayTitle}.

Dialogue History:
${historyText}

Candidate's Last Message: "${lastMessage}"

Interviewer Directives (Decoupled Evaluation Result):
- Previous Answer Classification: "${classification}"
- Previous Answer Acknowledgment: "${acknowledgment}"
- Previous Answer Evaluation Notes: "${reasoning}"

Instructions:
1. State the Acknowledgment text ("${acknowledgment}") briefly and professionally at the very beginning of your response.
2. Based on the Classification:
   - If "Don't Know" or "Off Topic" or "Incorrect/Unknown" or "Incorrect": Do NOT ask a deeper or harder follow-up. Instead, ask a simplified question or provide a helpful hint about the active day's objectives to guide the candidate.
   - If "Correct" or "Partially Correct": Generate a deeper, challenging follow-up question probing for technical trade-offs, configuration challenges, performance optimizations, or edge-cases.
3. Focus only on this day's concepts. Ask only one question. Conciseness is key.

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

Required schema:
{
  "type": "question",
  "question": "one interviewer question"
}`;
  }
}

module.exports = FollowUpPromptBuilder;
