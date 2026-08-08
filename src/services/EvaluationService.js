const LLMService = require('./LLMService');

class EvaluationService {
  constructor() {
    this.llmService = new LLMService();
  }

  /**
   * Compiles evaluation prompts and queries the LLM for candidate response evaluation metrics.
   */
  async evaluateAnswer(dayNumber, dayTitle, tools, objectives, questionAsked, candidateAnswer) {
    const toolsList = Array.isArray(tools) ? tools.join(', ') : tools || 'None';
    const objectivesList = Array.isArray(objectives)
      ? objectives.map(obj => `- ${obj}`).join('\n')
      : objectives || 'None';

    const systemPrompt = `You are a Technical Interview Evaluator.
Your job is to evaluate the candidate's last response against the active topic's objectives and the question asked.
You must output a structured JSON response matching the schema below. Do not output any other conversational text.

Active Topic: Day ${dayNumber} - ${dayTitle}
Tools: ${toolsList}
Objectives:
${objectivesList}

Question Asked: "${questionAsked}"
Candidate's Response: "${candidateAnswer}"

JSON Response Schema:
{
  "classification": "Correct | Partially Correct | Incorrect | Don't Know | Off Topic",
  "scores": {
    "knowledge": 0,      // Score 0-5
    "reasoning": 0,     // Score 0-5
    "communication": 0, // Score 0-5
    "confidence": 0     // Score 0-5
  },
  "reasoningText": "Brief explanation of the scores and classification choice.",
  "acknowledgmentText": "A natural-language acknowledgment statement to show to the candidate.",
  "claims": [
    {
      "claim": "exact or close paraphrase of a factual claim made by the candidate",
      "relatedSkill": "name of the skill or concept this claim relates to",
      "status": "correct | incorrect | uncertain | unverified"
    }
  ],
  "misconceptions": [
    {
      "concept": "name of the concept the candidate misunderstood",
      "misunderstanding": "brief description of what the candidate got wrong",
      "severity": "low | medium | high"
    }
  ],
  "suggestedQuestionType": "deeper | diagnostic | clarification | challenge | contradiction | curriculum"
}
IMPORTANT: claims and misconceptions arrays may be empty [] if none apply. Do not invent evidence.`;

    const userPrompt = `Evaluate the candidate's response.
Candidate's Response: "${candidateAnswer}"`;

    try {
      const responseText = await this.llmService.generateResponse(systemPrompt, userPrompt);
      console.log(`[EvaluationService] Raw LLM Response: "${responseText}"`);
      const cleanJsonText = this.cleanJsonResponse(responseText);
      const evalResult = JSON.parse(cleanJsonText);

      // Validate schema and apply defaults if values are missing
      return {
        classification: evalResult.classification || 'Incorrect',
        scores: {
          knowledge: Number(evalResult.scores?.knowledge ?? 2),
          reasoning: Number(evalResult.scores?.reasoning ?? 2),
          communication: Number(evalResult.scores?.communication ?? 2),
          confidence: Number(evalResult.scores?.confidence ?? 2)
        },
        reasoningText: evalResult.reasoningText || 'Evaluated answer.',
        acknowledgmentText: evalResult.acknowledgmentText || 'Acknowledged.',
        // Evidence fields (empty array if LLM omitted them)
        claims: Array.isArray(evalResult.claims) ? evalResult.claims : [],
        misconceptions: Array.isArray(evalResult.misconceptions) ? evalResult.misconceptions : [],
        suggestedQuestionType: evalResult.suggestedQuestionType || 'curriculum'
      };
    } catch (err) {
      console.error('[EvaluationService] Error running evaluation, falling back. Error:', err.message);
      // Safe fallback evaluation
      return this.getFallbackEvaluation(candidateAnswer);
    }
  }

  /**
   * Sanitizes JSON markdown formatting tags.
   */
  cleanJsonResponse(text) {
    let clean = text.trim();
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```json\s*/i, '').replace(/```$/, '');
    }
    const match = clean.match(/\{[\s\S]*\}/);
    return match ? match[0] : clean;
  }

  /**
   * Fallback check if LLM call fails.
   */
  getFallbackEvaluation(answer) {
    const text = (answer || '').trim().toLowerCase();
    const base = { claims: [], misconceptions: [], suggestedQuestionType: 'curriculum' };

    if (text === '' || text.includes('know') || text.includes('skip') || text.includes('pass')) {
      return {
        ...base,
        classification: "Don't Know",
        scores: { knowledge: 0, reasoning: 0, communication: 3, confidence: 1 },
        reasoningText: 'Candidate skipped or passed the question.',
        acknowledgmentText: "No problem. Let's simplify."
      };
    }

    if (text.length < 10) {
      return {
        ...base,
        classification: 'Off Topic',
        scores: { accuracy: 1, reasoning: 1, communication: 2, confidence: 2 },
        reasoningText: 'Candidate response was too short or irrelevant.',
        acknowledgmentText: "I don't think that fully answers the question."
      };
    }

    return {
      ...base,
      classification: 'Partially Correct',
      scores: { accuracy: 3, reasoning: 3, communication: 3, confidence: 3 },
      reasoningText: 'Fallback assessment applied.',
      acknowledgmentText: "Acknowledged. Let's go deeper."
    };
  }
}

module.exports = EvaluationService;
