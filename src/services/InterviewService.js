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
        mockMode: this.llmService.fallbackActive || !this.llmService.apiKey
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

    const { selectedDays, candidate } = session;
    let { 
      questionCount = 0, 
      currentDayIndex = 0, 
      attempts = 0, 
      followUps = 0, 
      status = "WAITING_FOR_ANSWER" 
    } = session;

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
          evaluation: evaluation,
          questionId: questionCount,
          attempts: attempts + 1,
          followUps: followUps,
          statusBefore: status
        });
      }
    }

    // Append user response to history
    if (message) {
      session.history.push({ role: "user", content: message });
    }

    // Determine the next state transition
    let transitionToNextQuestion = false;

    if (questionCount === 0) {
      // Transitioning from welcome greeting to first question
      questionCount = 1;
      attempts = 0;
      followUps = 0;
      status = "WAITING_FOR_ANSWER";
      currentDayIndex = 0;
    } else if (evaluation) {
      const classification = evaluation.classification || "Partially Correct";

      if (classification === "Off Topic") {
        attempts += 1;
        status = "RETRY";
      } else if (classification === "Don't Know") {
        if (status !== "HINT") {
          attempts += 1;
          status = "HINT";
        } else {
          transitionToNextQuestion = true;
        }
      } else if (classification === "Correct") {
        transitionToNextQuestion = true;
      } else {
        // Partially Correct or Incorrect
        if (status !== "FOLLOW_UP") {
          attempts += 1;
          followUps += 1;
          status = "FOLLOW_UP";
        } else {
          transitionToNextQuestion = true;
        }
      }
    }

    if (transitionToNextQuestion) {
      if (questionCount >= 8) {
        console.log(`[InterviewService] Interview complete for session ${sessionId}. Compiling final feedback report.`);
        const feedback = await this.feedbackService.generateFeedback(candidate, session.history, session.evaluations || []);
        
        this.sessionService.updateSession(sessionId, { 
          feedback, 
          evaluations: session.evaluations || [],
          questionCount: 8,
          status: "COMPLETED"
        });

        return {
          reply: "Thank you. Your interview has concluded. We are compiling your feedback.",
          done: true,
          feedback,
          mockMode: this.llmService.fallbackActive || !this.llmService.apiKey
        };
      } else {
        questionCount += 1;
        currentDayIndex += 1;
        attempts = 0;
        followUps = 0;
        status = "WAITING_FOR_ANSWER";
      }
    }

    // Generate active day question
    const targetDayObj = selectedDays[currentDayIndex];
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
    const activeDayTurn = (status === "WAITING_FOR_ANSWER") ? 1 : 2;

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
    console.log(`[InterviewService] Generating question ${questionCount} (Day ${targetDayNumber}, Status: ${status}, Attempts: ${attempts}, Follow-ups: ${followUps})`);
    const questionResponse = await this.llmService.generateResponse(systemPrompt, questionPrompt);

    // Save turn to history
    session.history.push({ role: "model", content: questionResponse });

    // Update session state
    this.sessionService.updateSession(sessionId, {
      questionCount,
      currentDayIndex,
      attempts,
      followUps,
      status,
      evaluations: session.evaluations || []
    });

    return {
      reply: questionResponse,
      done: false,
      questionCount,
      activeDay: targetDayNumber,
      activeDayTitle: dayDetails.title,
      evaluation: evaluation,
      attempts,
      followUps,
      status,
      mockMode: this.llmService.fallbackActive || !this.llmService.apiKey
    };
  }
}

module.exports = InterviewService;
