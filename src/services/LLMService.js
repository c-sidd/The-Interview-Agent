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
    const isMock = this.provider === 'mock' || !this.apiKey;

    console.log(`\n====================================================`);
    console.log(`📡 [LLMService] Outbound request to provider: ${this.provider.toUpperCase()}`);
    console.log(`🏷️  Model: ${this.modelName}`);
    console.log(`⚡ Mode: ${isMock ? 'OFFLINE / FALLBACK MOCK' : 'LIVE API CALL'}`);
    console.log(`📏 Prompt Size: System ${systemPrompt.length} chars, User ${userPrompt.length} chars`);
    console.log(`====================================================`);

    if (isMock) {
      return this.generateMockResponse(systemPrompt, userPrompt);
    }

    const startTime = Date.now();
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
      const elapsed = Date.now() - startTime;
      console.log(`✅ [LLMService] Gemini Success. Response: ${text.length} chars. Time: ${elapsed}ms.`);
      return text.trim();
    } catch (err) {
      const elapsed = Date.now() - startTime;
      console.error(`❌ [LLMService] Gemini Error after ${elapsed}ms: ${err.message}. Falling back to mock.`);
      return this.generateMockResponse(systemPrompt, userPrompt);
    }
  }

  /**
   * Generates realistic, context-aware mock answers when offline or keys are missing.
   */
  generateMockResponse(systemPrompt, userPrompt) {
    // 1. Check if this is an evaluation request
    if (systemPrompt.includes('Technical Interview Evaluator') || systemPrompt.includes('JSON Response Schema:')) {
      const candidateMatch = systemPrompt.match(/Candidate's Response:\s*"(.*)"/i);
      const answer = candidateMatch ? candidateMatch[1].trim() : '';
      const lower = answer.toLowerCase();

      if (lower === '' || lower.includes('know') || lower.includes('skip') || lower.includes('pass')) {
        return JSON.stringify({
          classification: "Don't Know",
          scores: { accuracy: 0, reasoning: 0, communication: 3, confidence: 1 },
          reasoningText: "The candidate explicitly indicated they do not know or chose to skip the active topic.",
          acknowledgmentText: "No problem. Let's simplify."
        }, null, 2);
      }

      if (lower.includes('chatgpt') || lower.includes('chat gpt') || lower.includes('penguin') || lower.includes('banana')) {
        return JSON.stringify({
          classification: "Off Topic",
          scores: { accuracy: 0, reasoning: 0, communication: 1, confidence: 2 },
          reasoningText: "The response was completely off-topic and did not answer the technical question asked.",
          acknowledgmentText: "I don't think that answers the question. I was asking about the active day's objectives."
        }, null, 2);
      }

      // Default high accuracy correct mock response
      return JSON.stringify({
        classification: "Correct",
        scores: { accuracy: 4, reasoning: 4, communication: 5, confidence: 4 },
        reasoningText: "The candidate answered with solid details and demonstrated good conceptual understanding.",
        acknowledgmentText: "Correct. Let's move deeper."
      }, null, 2);
    }

    // 2. Check if the user prompt is a final feedback request
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

    // 3. Extract active day and topic details from compile prompts
    const dayMatch = userPrompt.match(/Day (\d+)\s*-\s*([^\n\r\.]+)/i);
    const isFollowUp = userPrompt.includes('follow-up turn') || userPrompt.includes('Candidate\'s Last Message');

    if (dayMatch) {
      const dayNum = dayMatch[1];
      const dayTitle = dayMatch[2].trim();

      if (isFollowUp) {
        // Intercept skip/unknown phrases and off-topic evaluations to simulate adaptive simplification
        const normalizedPrompt = userPrompt.toLowerCase();
        if (normalizedPrompt.includes('off topic') || normalizedPrompt.includes('offtopic')) {
          return `I don't think that answers the question. I was asking about the tools or systems you configured during Day ${dayNum} (${dayTitle}). For example, can you explain what technologies you remember using?`;
        }
        if (normalizedPrompt.includes("i don't know") || normalizedPrompt.includes("skip") || normalizedPrompt.includes("pass") || normalizedPrompt.includes("don't know")) {
          return `No problem. Let's simplify: for Day ${dayNum} (${dayTitle}), can you explain the basic tools you configured and what you recall about their purposes?`;
        }
        return `Thanks for sharing details about your Day ${dayNum} (${dayTitle}) setup. Can you explain the main trade-offs, constraints, or configuration issues you faced during this implementation?`;
      } else {
        return `Let's discuss Day ${dayNum} which focused on "${dayTitle}". Can you outline the primary tools you used and explain how you achieved the learning objectives for this module?`;
      }
    }

    // 4. Fallback mock answer if no day tags match
    return "That's a sound explanation. Could you go deeper into the trade-offs of that approach and discuss how you would configure it for high concurrency?";
  }
}

module.exports = LLMService;
