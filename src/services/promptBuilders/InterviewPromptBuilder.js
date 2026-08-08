class InterviewPromptBuilder {
  static build(dayNumber, dayTitle, tools, objectives) {
    const toolsList = Array.isArray(tools) ? tools.join(', ') : tools || 'None';
    const objectivesList = Array.isArray(objectives) 
      ? objectives.map(obj => `- ${obj}`).join('\n') 
      : objectives || 'None';

    return `Day to Assess: Day ${dayNumber} - ${dayTitle}
Syllabus Context:
- Tools Studied: ${toolsList}
- Learning Objectives:
${objectivesList}

Instructions:
Generate an initial, open-ended technical question to assess the candidate's understanding of the tools and learning objectives listed above.
Do not cover multiple days or other topics at once. Focus only on this day's objectives.
Ensure the question style and depth match the candidate's experience profile (Senior vs. Junior).
Ask only one specific question.`;
  }
}

module.exports = InterviewPromptBuilder;
