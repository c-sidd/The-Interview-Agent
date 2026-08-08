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
    // Check if the user prompt is a final feedback request
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

    // Check if the prompt relates to specific days to return realistic questions
    if (userPrompt.includes('Day 1 -') || userPrompt.includes('Day 1 ')) {
      return "For Day 1, you configured a Python environment. Can you explain the difference between a global Python installation and a virtual environment (.venv) configured for a project, and why the virtual environment is preferred?";
    }
    if (userPrompt.includes('Day 10 -') || userPrompt.includes('Day 10 ')) {
      return "For Day 10, you built a Retrieval Engine. How did you structure your query router to decide whether a user query should be sent to SQLite or ChromaDB vector search?";
    }
    if (userPrompt.includes('Day 22 -') || userPrompt.includes('Day 22 ')) {
      return "For Day 22, you studied Multi-Agent Orchestration. What communication protocol or message routing strategy did you use to pass state between specialized agents in a Graph?";
    }
    if (userPrompt.includes('Day 28 -') || userPrompt.includes('Day 28 ')) {
      return "For Day 28, you containerized your application. What issues did you face with the local caching directory mapping when running your FastAPI inside a Docker container, and how did you configure the volume?";
    }

    // Default conversational follow-up fallback
    return "That's a sound explanation. Could you go deeper into the trade-offs of that approach and discuss how you would configure it for high concurrency?";
  }
}

module.exports = LLMService;
