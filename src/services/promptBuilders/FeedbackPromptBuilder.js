class FeedbackPromptBuilder {
  static build(candidate, dialogueHistory) {
    const { name, jobRole } = candidate.member || { name: 'The candidate', jobRole: 'Developer' };
    const historyText = Array.isArray(dialogueHistory)
      ? dialogueHistory.map(turn => `${turn.role === 'user' ? 'Candidate' : 'Interviewer'}: ${turn.content}`).join('\n')
      : dialogueHistory || '';

    return `You are a Senior Technical Evaluator. The mock interview for candidate ${name} (Target Role: ${jobRole}) has been completed.
You must compile a detailed, objective, and actionable feedback report based on the candidate's answers during the interview.

Complete Dialogue History:
${historyText}

Instructions:
Evaluate the candidate's performance across the assessed topics. Identify specific strengths, technical gaps, and concrete recommendations for improvement.
You must output ONLY a valid JSON object matching the schema below. Do not include any markdown fences (like \`\`\`json), leading text, or trailing explanations. The output must be pure, parseable JSON.

Required JSON Schema:
{
  "summary": "A concise paragraph summarizing the candidate's overall technical performance, communication clarity, and readiness.",
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
