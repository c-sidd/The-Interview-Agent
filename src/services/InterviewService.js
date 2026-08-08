const EvaluationService = require('./EvaluationService');

class InterviewService {
  constructor(sessionService, curriculumService, promptService, llmService, feedbackService) {
    this.sessionService = sessionService;
    this.curriculumService = curriculumService;
    this.promptService = promptService;
    this.llmService = llmService;
    this.feedbackService = feedbackService;
    this.evaluationService = new EvaluationService();
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

      // Programmatically build a personalized welcome message based on candidate signals
      const firstName = candidateInput.member.name.split(' ')[0];
      const jobRole = candidateInput.member.jobRole;
      const missionsCompleted = candidateInput.signals ? candidateInput.signals.missionsCompleted : 0;
      
      const selectedTopics = targetDays.map(dayNum => {
        const details = this.curriculumService.getDayDetails(dayNum);
        return {
          day: dayNum,
          title: details ? details.title : `Day ${dayNum}`
        };
      });

      const topicTitlesText = selectedTopics.map(t => `${t.title} (Day ${t.day})`);
      const topicsText = topicTitlesText.slice(0, -1).join(', ') + ', and ' + topicTitlesText.slice(-1);

      const personalizedWelcome = `Welcome ${firstName}. I have reviewed your learning profile for the ${jobRole} target track. You completed ${missionsCompleted} curriculum missions with strong performance.

Today, I would like to evaluate your understanding of: ${topicsText}.

Let's begin.`;

      return {
        reply: personalizedWelcome,
        done: false,
        questionCount: 0,
        activeDay: targetDays[0],
        activeDayTitle: "Initialization",
        selectedDays: selectedTopics,
        mockMode: !this.llmService.apiKey
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

    const { questionCount, selectedDays, currentDayIndex, currentDayTurn, candidate } = session;

    // 1. Evaluate candidate's last response if they just answered a question
    let evaluation = null;
    let lastQuestion = "";
    
    if (questionCount > 0 && message) {
      // Find the last model message in history
      if (session.history.length > 0) {
        for (let i = session.history.length - 1; i >= 0; i--) {
          if (session.history[i].role === 'model') {
            lastQuestion = session.history[i].content;
            break;
          }
        }
      }

      if (lastQuestion) {
        const targetDayObj = selectedDays[currentDayIndex];
        const activeDayNumber = (targetDayObj && typeof targetDayObj === 'object') ? targetDayObj.day : targetDayObj;
        const activeDayDetails = this.curriculumService.getDayDetails(activeDayNumber);
        
        console.log(`[InterviewService] Evaluating answer for Day ${activeDayNumber} (${activeDayDetails.title})...`);
        evaluation = await this.evaluationService.evaluateAnswer(
          activeDayNumber,
          activeDayDetails.title,
          activeDayDetails.tools,
          activeDayDetails.objectives,
          lastQuestion,
          message
        );

        if (!session.evaluations) {
          session.evaluations = [];
        }
        session.evaluations.push({
          day: activeDayNumber,
          title: activeDayDetails.title,
          question: lastQuestion,
          answer: message,
          evaluation: evaluation
        });
      }
    }

    // Append the candidate's response to history
    if (message) {
      session.history.push({ role: "user", content: message });
    }

    // Check if the candidate has completed all 8 questions (Turn 9)
    if (questionCount >= 8) {
      console.log(`[InterviewService] Interview complete for session ${sessionId}. Compiling final feedback report.`);
      
      // Call FeedbackService to compile structured report card, passing accumulated evaluations
      const feedback = await this.feedbackService.generateFeedback(candidate, session.history, session.evaluations || []);
      
      // Update session state
      this.sessionService.updateSession(sessionId, { feedback, evaluations: session.evaluations || [] });

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

    const targetDayObj = selectedDays[activeDayIndex];
    const targetDayNumber = (targetDayObj && typeof targetDayObj === 'object') ? targetDayObj.day : targetDayObj;
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
      message || "",
      evaluation
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
      currentDayTurn: activeDayTurn,
      evaluations: session.evaluations || []
    });

    return {
      reply: questionResponse,
      done: false,
      questionCount: questionCount + 1,
      activeDay: targetDayNumber,
      activeDayTitle: dayDetails.title,
      evaluation: evaluation
    };
  }
}

module.exports = InterviewService;
