class InterviewPromptBuilder {
  static build(dayNumber, dayTitle, tools, objectives, lastMessage = "") {
    const toolsList = Array.isArray(tools) ? tools.join(', ') : tools || 'None';
    const objectivesList = Array.isArray(objectives) 
      ? objectives.map(obj => `- ${obj}`).join('\n') 
      : objectives || 'None';

    let transitionInstruction = "";
    if (lastMessage) {
      transitionInstruction = `
The candidate just completed the previous topic. Their last answer was: "${lastMessage}".
1. Briefly evaluate and acknowledge their previous answer (e.g. "Good.", "Incorrect.", "Let's move to the next topic.").
2. Transition to the new topic.`;
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
