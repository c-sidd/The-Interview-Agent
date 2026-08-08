class InterviewService {
  constructor(sessionService, curriculumService, promptService, llmService, feedbackService) {
    this.sessionService = sessionService;
    this.curriculumService = curriculumService;
    this.promptService = promptService;
    this.llmService = llmService;
    this.feedbackService = feedbackService;
  }

  /**
   * Main entry point for processing incoming interview requests.
   * Handles Turn 0 (Session Initialization) and Turns 1 to 9 (Dialogue Loop & Evaluation).
   */
  async handleRequest(sessionId, message, candidateInput) {
    // 1. Session Initialization (Turn 0)
    if (candidateInput) {
      // Programmatically select 4 unique curriculum days
      const targetDays = this.curriculumService.selectTargetDays(candidateInput);
      
      // Save state to SessionService
      this.sessionService.createSession(sessionId, candidateInput, targetDays);

      // Return welcome reply immediately without invoking LLM
      return {
        reply: "Welcome. Let's begin your interview.",
        done: false
      };
    }

    // 2. dialogue loops (Turns 1 to 9)
    const session = this.sessionService.getSession(sessionId);
    if (!session) {
      return {
        reply: "Session not found or has expired. Please select a candidate and restart.",
        done: false
      };
    }

    // If session is already completed, return final feedback directly
    if (session.feedback) {
      return {
        reply: "Your interview is completed. Thank you.",
        done: true,
        feedback: session.feedback
      };
    }

    // Append the candidate's response to history
    if (message) {
      session.history.push({ role: "user", content: message });
    }

    const { questionCount, selectedDays, currentDayIndex, currentDayTurn, candidate } = session;

    // Check if the candidate has just answered the 8th question (Turn 9)
    if (questionCount >= 8) {
      console.log(`[InterviewService] Interview complete for session ${sessionId}. Compiling final feedback report.`);
      
      // Call FeedbackService to compile structured report card
      const feedback = await this.feedbackService.generateFeedback(candidate, session.history);
      
      // Update session state
      this.sessionService.updateSession(sessionId, { feedback });

      return {
        reply: "Thank you. Your interview has concluded. We are compiling your feedback.",
        done: true,
        feedback
      };
    }

    // Otherwise, generate the next interview question (Turns 1 to 8)
    let activeDayIndex = currentDayIndex;
    let activeDayTurn = currentDayTurn;

    // Determine target day and day turn transition
    if (questionCount > 0) {
      if (currentDayTurn === 1) {
        // Ask follow-up question for same day
        activeDayTurn = 2;
      } else {
        // Move to the next day in list
        activeDayIndex = currentDayIndex + 1;
        activeDayTurn = 1;
      }
    }

    const targetDayNumber = selectedDays[activeDayIndex];
    const dayDetails = this.curriculumService.getDayDetails(targetDayNumber);

    if (!dayDetails) {
      return {
        reply: `Error retrieving syllabus details for Day ${targetDayNumber}. Let's skip to the next topic.`,
        done: false
      };
    }

    // Compile Prompt Context
    const systemPrompt = this.promptService.buildSystemPrompt(candidate);
    const questionPrompt = this.promptService.buildQuestionPrompt(
      targetDayNumber,
      dayDetails.title,
      dayDetails.tools,
      dayDetails.objectives,
      activeDayTurn,
      session.history,
      message || ""
    );

    // Call LLM Service
    console.log(`[InterviewService] Generating question ${questionCount + 1} (Day ${targetDayNumber}, Turn ${activeDayTurn})`);
    const questionResponse = await this.llmService.generateResponse(systemPrompt, questionPrompt);

    // Save turn to history
    session.history.push({ role: "model", content: questionResponse });

    // Update session state
    this.sessionService.updateSession(sessionId, {
      questionCount: questionCount + 1,
      currentDayIndex: activeDayIndex,
      currentDayTurn: activeDayTurn
    });

    return {
      reply: questionResponse,
      done: false
    };
  }
}

module.exports = InterviewService;
