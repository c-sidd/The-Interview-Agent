class InterviewPromptBuilder {
  static build(dayNumber, dayTitle, tools, objectives, transitionAck = "") {
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
Syllabus Context:
- Tools Studied: ${toolsList}
- Learning Objectives:
${objectivesList}
${transitionInstruction}

Instructions:
Generate an initial, open-ended technical question to assess the candidate's understanding of the tools and learning objectives listed above.
Do not cover multiple days or other topics at once. Focus only on this day's objectives.
Ensure the question style and depth match the candidate's experience profile (Senior vs. Junior).
Ask only one specific question.`;
  }
}

module.exports = InterviewPromptBuilder;
