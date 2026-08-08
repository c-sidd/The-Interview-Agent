class FeedbackService {
  constructor(promptService, llmService) {
    this.promptService = promptService;
    this.llmService = llmService;
  }

  /**
   * Compiles the dialogue history, queries the LLM for evaluation,
   * strips any markdown fences, parses JSON, and performs schema validation.
   */
  async generateFeedback(candidate, dialogueHistory, evaluations = [], evidenceGraph = null) {
    if (!candidate) {
      throw new Error('[FeedbackService] Candidate profile is required for feedback generation.');
    }
    if (!dialogueHistory || dialogueHistory.length === 0) {
      return this.getDefaultFeedback('No dialogue history provided.');
    }

    try {
      // 1. Build prompt (pass evidenceGraph for enriched feedback)
      const prompt = this.promptService.buildFeedbackPrompt(candidate, dialogueHistory, evaluations, evidenceGraph);

      // 2. Query LLM (using the evaluator instruction system prompt)
      const systemInstruction = "You are a Senior Technical Evaluator. Output ONLY a valid JSON object matching the requested schema. Do not output markdown code fences or conversational text.";
      const rawResponse = await this.llmService.generateResponse(systemInstruction, prompt);

      // 3. Clean and parse response
      const parsedFeedback = this.parseAndValidateResponse(rawResponse);
      return parsedFeedback;
    } catch (err) {
      console.error(`[FeedbackService] Error generating feedback: ${err.message}. Returning default feedback.`);
      return this.getDefaultFeedback(`Error generating feedback: ${err.message}`);
    }
  }

  /**
   * Cleans markdown wrappers (like ```json ... ```) and parses the response into JSON.
   */
  parseAndValidateResponse(rawText) {
    if (!rawText) {
      throw new Error('Empty response received from LLM.');
    }

    let cleaned = rawText.trim();

    // Strip markdown code fences if present
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
      cleaned = cleaned.replace(/\s*```$/, '');
      cleaned = cleaned.trim();
    }

    // Attempt parsing
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      // If parsing fails, try to extract a JSON block using regex as a secondary fallback
      const jsonRegex = /\{[\s\S]*\}/;
      const match = cleaned.match(jsonRegex);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch (subErr) {
          throw new Error(`Failed to parse extracted JSON block: ${subErr.message}`);
        }
      } else {
        throw new Error(`Failed to parse LLM response as JSON: ${err.message}`);
      }
    }

    // Ensure scores structure
    if (!parsed.scores) {
      parsed.scores = {
        accuracy: 3.0,
        reasoning: 3.0,
        communication: 3.0,
        confidence: 3.0
      };
    } else {
      parsed.scores.accuracy = Number(parsed.scores.accuracy ?? 3.0);
      parsed.scores.reasoning = Number(parsed.scores.reasoning ?? 3.0);
      parsed.scores.communication = Number(parsed.scores.communication ?? 3.0);
      parsed.scores.confidence = Number(parsed.scores.confidence ?? 3.0);
    }

    // Validate schema
    const requiredKeys = ['summary', 'strengths', 'gaps', 'next'];
    for (const key of requiredKeys) {
      if (!parsed.hasOwnProperty(key)) {
        throw new Error(`Invalid feedback schema: missing key '${key}'`);
      }
    }

    // Ensure array structures
    if (!Array.isArray(parsed.strengths)) parsed.strengths = [parsed.strengths];
    if (!Array.isArray(parsed.gaps)) parsed.gaps = [parsed.gaps];
    if (!Array.isArray(parsed.next)) parsed.next = [parsed.next];
    if (!Array.isArray(parsed.misconceptions)) parsed.misconceptions = parsed.misconceptions ? [parsed.misconceptions] : [];
    if (!Array.isArray(parsed.contradictions)) parsed.contradictions = parsed.contradictions ? [parsed.contradictions] : [];

    return parsed;
  }

  /**
   * Returns a clean, structured feedback object as a safe fallback.
   */
  getDefaultFeedback(reason = "") {
    return {
      summary: `The interview completed, but we could not compile a custom evaluation report. ${reason}`.trim(),
      scores: {
        accuracy: 3.0,
        reasoning: 3.0,
        communication: 3.0,
        confidence: 3.0
      },
      strengths: [
        "Candidate completed the cohort challenges and engaged in the technical dialogue.",
        "Able to communicate implementation approaches."
      ],
      gaps: [
        "Detailed topic assessments were not fully verified by the grading agent.",
        "Minor gaps in specific day criteria could not be compiled."
      ],
      next: [
        "Review curriculum modules, specifically capstone deployment requirements.",
        "Schedule a follow-up review session with an instructor."
      ]
    };
  }
}

module.exports = FeedbackService;
