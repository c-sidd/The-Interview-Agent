class FollowUpPromptBuilder {
  static build(dayNumber, dayTitle, dialogueHistory, lastMessage) {
    const historyText = Array.isArray(dialogueHistory)
      ? dialogueHistory.map(turn => `${turn.role === 'user' ? 'Candidate' : 'Interviewer'}: ${turn.content}`).join('\n')
      : dialogueHistory || '';

    return `You are in a follow-up turn. The candidate has answered your initial question for Day ${dayNumber} - ${dayTitle}.

Dialogue History:
${historyText}

Candidate's Last Message: "${lastMessage}"

Instructions:
Analyze the candidate's last message in the context of the dialogue history.
1. If the answer is vague, incomplete, or technically incorrect, ask a follow-up question to probe for details or clarify their statement.
2. If the answer shows solid understanding, ask a question challenging their understanding of trade-offs, failure cases, or design alternatives for this day's concepts.
3. Keep the question concise. Do not introduce new days or topics. Focus only on validating their understanding of this day's concepts.
4. Ask only one specific follow-up question.`;
  }
}

module.exports = FollowUpPromptBuilder;
