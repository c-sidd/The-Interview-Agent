class FeedbackPromptBuilder {
  static build(candidate, dialogueHistory, evaluations = []) {
    const { name, jobRole } = candidate.member || { name: 'The candidate', jobRole: 'Developer' };
    
    const historyText = Array.isArray(dialogueHistory)
      ? dialogueHistory.map(turn => `${turn.role === 'user' ? 'Candidate' : 'Interviewer'}: ${turn.content}`).join('\n')
      : dialogueHistory || '';

    let scoreSummaryText = "";
    if (Array.isArray(evaluations) && evaluations.length > 0) {
      scoreSummaryText = `
Turn-by-Turn Evaluations and Scores:
${evaluations.map((ev, idx) => {
  return `Turn ${idx + 1} - Day ${ev.day} (${ev.title}):
- Candidate Answer: "${ev.answer}"
- Classification: ${ev.evaluation.classification}
- Accuracy Score: ${ev.evaluation.scores.accuracy}/5
- Reasoning Score: ${ev.evaluation.scores.reasoning}/5
- Communication Score: ${ev.evaluation.scores.communication}/5
- Confidence Score: ${ev.evaluation.scores.confidence}/5
- Notes: ${ev.evaluation.reasoningText}`;
}).join('\n\n')}
`;
    }

    return `You are a Senior Technical Evaluator. The mock interview for candidate ${name} (Target Role: ${jobRole}) has been completed.
You must compile a detailed, objective, and actionable feedback report based on the candidate's answers and their turn-by-turn scores.

Complete Dialogue History:
${historyText}
${scoreSummaryText}

Instructions:
Evaluate the candidate's performance across the assessed topics. Identify specific strengths, technical gaps, and concrete recommendations for improvement.
Calculate average scores out of 5 based on the turn-by-turn ratings.
You must output ONLY a valid JSON object matching the schema below. Do not include any markdown fences (like \`\`\`json), leading text, or trailing explanations. The output must be pure, parseable JSON.

Required JSON Schema:
{
  "summary": "A concise paragraph summarizing the candidate's overall technical performance, communication clarity, and readiness.",
  "scores": {
    "accuracy": 0,      // Calculated average accuracy score (0-5, float)
    "reasoning": 0,     // Calculated average reasoning score (0-5, float)
    "communication": 0, // Calculated average communication score (0-5, float)
    "confidence": 0     // Calculated average confidence score (0-5, float)
  },
  "strengths": [
    "At least two specific, technically accurate strengths demonstrated during the interview (e.g. 'Demonstrated solid understanding of indexing settings in ChromaDB')."
  ],
  "gaps": [
    "At least two specific gaps or misunderstandings identified during the interview (e.g. 'Struggled to explain the difference between LoRA parameters and full fine-tuning')."
  ],
  "next": [
    "At least two actionable, concrete next steps or study recommendations mapped directly to their gaps."
  ]
}`;
  }
}

module.exports = FeedbackPromptBuilder;
