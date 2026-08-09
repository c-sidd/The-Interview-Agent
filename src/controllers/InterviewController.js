class InterviewController {
  constructor(interviewService) {
    this.interviewService = interviewService;
  }

  /**
   * Router endpoint handler for POST /api/interview.
   * Parses body parameters, performs basic input validation, and delegates coordination.
   */
  async handleInterviewTurn(req, res) {
    try {
      const interviewId = req.body.interviewId || req.body.sessionId;
      const { message, candidate } = req.body;

      // 1. Validation checks
      if (!interviewId || typeof interviewId !== 'string' || !interviewId.trim()) {
        return res.status(400).json({ error: "Missing or invalid 'interviewId' or 'sessionId'." });
      }

      // Must have either a candidate (to initialize) or a message (to converse)
      if (!candidate && (message === undefined || message === null)) {
        return res.status(400).json({
          error: "Invalid request payload: must provide either 'candidate' object (for initialization) or 'message' string (for conversational turns)."
        });
      }

      const cleanInterviewId = interviewId.trim();
      const cleanMessage = (message && typeof message === 'string') ? message.trim() : message;

      // 2. Delegate logic to InterviewService
      const result = await this.interviewService.handleRequest(
        cleanInterviewId,
        cleanMessage,
        candidate
      );

      // 3. Return JSON response
      return res.status(200).json(result);
    } catch (err) {
      console.error(`[InterviewController] Error processing interview turn: ${err.message}`);
      return res.status(500).json({ error: `Internal server error: ${err.message}` });
    }
  }

  /**
   * Router endpoint handler for GET /api/session/:id
   */
  async getSessionState(req, res) {
    try {
      const interviewId = req.params.interviewId || req.params.sessionId; // fallback for path param
      if (!interviewId) {
        return res.status(400).json({ error: "Missing interviewId" });
      }

      const sessionService = this.interviewService.sessionService;
      const session = sessionService.getSession(interviewId);

      if (!session) {
        return res.status(404).json({ error: "Session not found or expired" });
      }

      // Compute skillmap since it's transient
      const skillMap = session.evidenceGraph ? this.interviewService.memoryService.getSkillMap(session.evidenceGraph) : [];

      return res.status(200).json({
        interviewId: session.interviewId,
        candidate: session.candidate,
        selectedDays: session.selectedDays,
        questionCount: session.questionCount,
        attempts: session.attempts,
        followUps: session.followUps,
        status: session.status,
        history: session.history,
        activeDay: session.selectedDays[session.currentDayIndex] ? session.selectedDays[session.currentDayIndex].day : null,
        activeDayTitle: session.selectedDays[session.currentDayIndex] ? session.selectedDays[session.currentDayIndex].title : null,
        skillMap: skillMap,
        interviewerStatus: session.interviewState ? session.interviewState.interviewerStatus : null,
        statusDetail: session.interviewState ? session.interviewState.statusDetail : null,
        difficulty: session.interviewState ? session.interviewState.difficulty : 'intermediate',
        done: session.status === 'COMPLETED',
        feedback: session.feedback,
        mockMode: this.interviewService.llmService.fallbackActive || !this.interviewService.llmService.apiKey,
        provider: this.interviewService.llmService.provider
      });
    } catch (err) {
      console.error(`[InterviewController] Error fetching session: ${err.message}`);
      return res.status(500).json({ error: `Internal server error: ${err.message}` });
    }
  }
}

module.exports = InterviewController;
