const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

class LLMService {
  constructor() {
    this.provider = process.env.LLM_PROVIDER || 'gemini';
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    this.temperature = parseFloat(process.env.TEMPERATURE || '0.2');
    this.maxTokens = parseInt(process.env.MAX_TOKENS || '800');

    if (this.provider === 'gemini' && this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    } else {
      console.log(`[LLMService] Running in MOCK / OFFLINE mode (provider: ${this.provider})`);
    }
  }

  async generateResponse(systemPrompt, userPrompt) {
    // If provider is set to 'mock' or there is no Gemini API key, return mock responses
    if (this.provider === 'mock' || !this.apiKey) {
      return this.generateMockResponse(systemPrompt, userPrompt);
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        systemInstruction: systemPrompt
      });

      const responseResult = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: this.temperature,
          maxOutputTokens: this.maxTokens
        }
      });

      const text = responseResult.response.text();
      return text.trim();
    } catch (err) {
      console.error(`[LLMService] Gemini API call failed: ${err.message}. Falling back to mock response.`);
      return this.generateMockResponse(systemPrompt, userPrompt);
    }
  }

  /**
   * Generates realistic, context-aware mock answers when offline or keys are missing.
   */
  generateMockResponse(systemPrompt, userPrompt) {
    // 1. Check if the user prompt is a final feedback request
    if (userPrompt.includes('JSON Schema') || userPrompt.includes('Feedback report')) {
      return JSON.stringify({
        summary: "The candidate demonstrated solid technical understanding of the cohort curriculum. They answered questions on databases, prompt techniques, and agents accurately.",
        strengths: [
          "Good understanding of local LLM setup using Ollama and Qwen models.",
          "Clear explanation of SQLite data mapping and text processing."
        ],
        gaps: [
          "Struggled with detailing Kubernetes deployment ingress configurations.",
          "Showed minor vagueness when discussing prompt safety parameters."
        ],
        next: [
          "Review Kubernetes ingress controller documentation.",
          "Practice prompt validation edge cases and safety controls."
        ]
      }, null, 2);
    }

    // 2. Extract active day and topic details from compile prompts
    const dayMatch = userPrompt.match(/Day (\d+)\s*-\s*([^\n\r\.]+)/i);
    const isFollowUp = userPrompt.includes('follow-up turn') || userPrompt.includes('Candidate\'s Last Message');

    if (dayMatch) {
      const dayNum = dayMatch[1];
      const dayTitle = dayMatch[2].trim();

      if (isFollowUp) {
        // Intercept skip/unknown phrases in candidate answers to simulate adaptive simplification
        const normalizedPrompt = userPrompt.toLowerCase();
        if (normalizedPrompt.includes("i don't know") || normalizedPrompt.includes("skip") || normalizedPrompt.includes("pass")) {
          return `No problem. Let's simplify: for Day ${dayNum} (${dayTitle}), can you explain the basic tools you configured and what you recall about their purposes?`;
        }
        return `Thanks for sharing details about your Day ${dayNum} (${dayTitle}) setup. Can you explain the main trade-offs, constraints, or configuration issues you faced during this implementation?`;
      } else {
        return `Let's discuss Day ${dayNum} which focused on "${dayTitle}". Can you outline the primary tools you used and explain how you achieved the learning objectives for this module?`;
      }
    }

    // 3. Fallback mock answer if no day tags match
    return "That's a sound explanation. Could you go deeper into the trade-offs of that approach and discuss how you would configure it for high concurrency?";
  }
}

module.exports = LLMService;
