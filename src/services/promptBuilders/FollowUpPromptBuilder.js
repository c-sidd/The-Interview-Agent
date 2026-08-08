class FollowUpPromptBuilder {
  static build(dayNumber, dayTitle, dialogueHistory, lastMessage) {
    const historyText = Array.isArray(dialogueHistory)
      ? dialogueHistory.map(turn => `${turn.role === 'user' ? 'Candidate' : 'Interviewer'}: ${turn.content}`).join('\n')
      : dialogueHistory || '';

    return `You are in a follow-up turn. The candidate has answered your initial question for Day ${dayNumber} - ${dayTitle}.

Dialogue History:
${historyText}

Candidate's Last Message: "${lastMessage}"

Assessment and Questioning Guidelines:
1. Evaluate the candidate's last message:
   - If they say "i don't know", "skip", "pass", or give a completely wrong answer, classify it as "Incorrect/Unknown".
   - If they give a partial answer, classify it as "Partially Correct".
   - If they give a complete answer, classify it as "Correct".
2. Formulate your response:
   - First, provide a brief, professional feedback acknowledgment based on your evaluation (e.g. "That is correct.", "Partially correct.", "No problem. Let's simplify.").
   - If "Incorrect/Unknown", do not probe deeper. Instead, ask a simplified question or offer a helpful hint regarding the active day's objectives to guide them.
   - If "Partially Correct" or "Correct", ask a follow-up question that pushes them deeper into implementation details, trade-offs, configuration settings, or edge-case handling.
3. Keep the response concise. Focus only on this day's concepts. Ask only one question.`;
  }
}

module.exports = FollowUpPromptBuilder;
