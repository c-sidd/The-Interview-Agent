class SessionService {
  constructor() {
    this.sessions = new Map();
    this.timeoutLimitMs = 30 * 60 * 1000; // 30 minutes in milliseconds
    this.startCleanupInterval();
  }

  createSession(sessionId, candidate, selectedDays) {
    const now = Date.now();
    const sessionState = {
      sessionId,
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
      lastActive: now
    };
    this.sessions.set(sessionId, sessionState);
    return sessionState;
  }

  getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActive = Date.now(); // Update active timestamp
      return session;
    }
    return null;
  }

  updateSession(sessionId, updates) {
    const session = this.sessions.get(sessionId);
    if (session) {
      Object.assign(session, updates);
      session.lastActive = Date.now();
      return session;
    }
    return null;
  }

  deleteSession(sessionId) {
    return this.sessions.delete(sessionId);
  }

  hasSession(sessionId) {
    return this.sessions.has(sessionId);
  }

  /**
   * Periodically checks and deletes sessions that are inactive.
   */
  startCleanupInterval() {
    this.cleanupIntervalId = setInterval(() => {
      const now = Date.now();
      for (const [sessionId, session] of this.sessions.entries()) {
        if (now - session.lastActive > this.timeoutLimitMs) {
          console.log(`[SessionService] Garbage Collection: Deleting expired session ${sessionId}`);
          this.sessions.delete(sessionId);
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
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActive > this.timeoutLimitMs) {
        this.sessions.delete(sessionId);
        count++;
      }
    }
    return count;
  }
}

module.exports = SessionService;
