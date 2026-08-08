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
      const { sessionId, message, candidate } = req.body;

      // 1. Validation checks
      if (!sessionId || typeof sessionId !== 'string' || !sessionId.trim()) {
        return res.status(400).json({ error: "Missing or invalid 'sessionId'." });
      }

      // Must have either a candidate (to initialize) or a message (to converse)
      if (!candidate && (message === undefined || message === null)) {
        return res.status(400).json({
          error: "Invalid request payload: must provide either 'candidate' object (for initialization) or 'message' string (for conversational turns)."
        });
      }

      const cleanSessionId = sessionId.trim();
      const cleanMessage = (message && typeof message === 'string') ? message.trim() : message;

      // 2. Delegate logic to InterviewService
      const result = await this.interviewService.handleRequest(
        cleanSessionId,
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
}

module.exports = InterviewController;
