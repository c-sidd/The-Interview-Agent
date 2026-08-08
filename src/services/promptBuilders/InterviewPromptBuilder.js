class InterviewPromptBuilder {
  static build(dayNumber, dayTitle, tools, objectives, transitionAck = "", candidate = {}, difficulty = 'intermediate') {
    const toolsList = Array.isArray(tools) ? tools.join(', ') : tools || 'None';
    const objectivesList = Array.isArray(objectives)
      ? objectives.map(obj => `- ${obj}`).join('\n')
      : objectives || 'None';

    let transitionInstruction = "";
    if (transitionAck) {
      transitionInstruction = `
Interviewer Directives (Decoupled Transition Acknowledgment):
- Previous Answer Acknowledgment: "${transitionAck}"

Instructions:
1. State the Acknowledgment text ("${transitionAck}") briefly and professionally at the very beginning of your response.
2. Transition smoothly to the new topic.`;
    }

    return `Day to Assess: Day ${dayNumber} - ${dayTitle}
Target Difficulty: ${difficulty.toUpperCase()}

Candidate Profile:
  Role       : ${candidate.member?.jobRole || 'Unknown'}
  Experience : ${candidate.member?.yearsExperience || 0} years
  Missions   : ${candidate.signals?.missionsCompleted || 0}
  Projects   : ${candidate.member?.projects || 'None specified'}

Syllabus Context:
- Tools Studied: ${toolsList}
- Learning Objectives:
${objectivesList}
${transitionInstruction}

Instructions:
Generate an initial, open-ended technical question to assess the candidate's understanding of the tools and learning objectives listed above.
Do not cover multiple days or other topics at once. Focus only on this day's objectives.
Ensure the question style and depth match the candidate's experience profile (Senior vs. Junior).
CRITICAL: Keep your question extremely concise, between 20 to 40 words. Do not write long paragraphs. Ask only one specific question.

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

module.exports = InterviewPromptBuilder;
