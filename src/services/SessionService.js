class SessionService {
  constructor() {
    this.sessions = new Map();
    this.timeoutLimitMs = 30 * 60 * 1000; // 30 minutes in milliseconds
    this.startCleanupInterval();
  }

  createSession(interviewId, candidate, selectedDays) {
    const now = Date.now();
    const sessionState = {
      interviewId,
      candidate,
      selectedDays,
      questionCount: 0,
      attempts: 0,
      followUps: 0,
      status: "WAITING_FOR_ANSWER",
      history: [],
      currentDayIndex: 0,
      feedback: null,
      createdAt: now,
      lastActive: now,
      // Evidence graph — populated by MemoryService after every answer
      evidenceGraph: {
        claims: [],   // All claims extracted from candidate answers
        skills: {},   // { skillName: { skill, score, confidence, evidence[], questionsAssessed[] } }
        misconceptions: [],   // Detected misunderstandings
        contradictions: []    // Detected conflicts between earlier and later claims
      },
      // Adaptive interview state
      interviewState: {
        lastStrategy: null, // Most recent strategy object from MemoryService
        interviewerStatus: null, // Short label surfaced to the candidate
        statusDetail: null,  // One-sentence explanation
        difficulty: 'intermediate',
        difficultyChanges: []
      }
    };
    this.sessions.set(interviewId, sessionState);
    return sessionState;
  }

  getSession(interviewId) {
    const session = this.sessions.get(interviewId);
    if (session) {
      session.lastActive = Date.now(); // Update active timestamp
      return session;
    }
    return null;
  }

  updateSession(interviewId, updates) {
    const session = this.sessions.get(interviewId);
    if (session) {
      Object.assign(session, updates);
      session.lastActive = Date.now();
      return session;
    }
    return null;
  }

  deleteSession(interviewId) {
    return this.sessions.delete(interviewId);
  }

  hasSession(interviewId) {
    return this.sessions.has(interviewId);
  }

  /**
   * Periodically checks and deletes sessions that are inactive.
   */
  startCleanupInterval() {
    this.cleanupIntervalId = setInterval(() => {
      const now = Date.now();
      for (const [interviewId, session] of this.sessions.entries()) {
        if (now - session.lastActive > this.timeoutLimitMs) {
          console.log(`[SessionService] Garbage Collection: Deleting expired session ${interviewId}`);
          this.sessions.delete(interviewId);
        }
      }
    }, 5 * 60 * 1000); // Run sweep every 5 minutes

    // Allow process to exit cleanly if this is the only active handle
    if (this.cleanupIntervalId && typeof this.cleanupIntervalId.unref === 'function') {
      this.cleanupIntervalId.unref();
    }
  }

  /**
   * Helper to manually trigger cleanup (useful for unit tests)
   */
  cleanupExpired() {
    const now = Date.now();
    let count = 0;
    for (const [interviewId, session] of this.sessions.entries()) {
      if (now - session.lastActive > this.timeoutLimitMs) {
        this.sessions.delete(interviewId);
        count++;
      }
    }
    return count;
  }
}

module.exports = SessionService;
