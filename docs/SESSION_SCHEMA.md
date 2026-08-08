# Session Schema Specification

This document defines the properties and state transitions of the in-memory session object used to track active interview progress.

---

## 1. Schema Definition

Every interview session registers a state object inside the `SessionService` store, structured as follows:

```json
{
  "sessionId": "abc-123",
  "candidate": {
    "member": {
      "id": "CAND-001",
      "name": "Sarah Johnson",
      "jobRole": "Senior Data Engineer",
      "yearsExperience": 9,
      "education": "MS Computer Science",
      "status": "COMPLETED"
    },
    "missions": [
      { "day": 7, "title": "Embeddings Explained", "passed": true, "attempts": 1 }
    ],
    "signals": {
      "commitDays": 28,
      "missionsCompleted": 30,
      "missionsFirstTry": 20
    }
  },
  "selectedDays": [7, 8, 22, 28],
  "questionCount": 0,
  "history": [
    {
      "role": "user",
      "content": "Hi, I am ready."
    },
    {
      "role": "model",
      "content": "Excellent. Let's start with your environment setup on Day 1..."
    }
  ],
  "currentDayIndex": 0,
  "currentDayTurn": 1,
  "feedback": null,
  "createdAt": 1791244800000,
  "lastActive": 1791244860000
}
```

---

## 2. Properties Detail

*   **`sessionId`** (string): Standard unique identifier provided by the client in the HTTP request header/body. Used as the lookup key in the in-memory Map.
*   **`candidate`** (object): The full candidate profile object as defined in the `candidates.json` schema. Parsed during Turn 0 initialization.
*   **`selectedDays`** (array of numbers): An array of exactly 4 curriculum days selected for this candidate.
*   **`questionCount`** (number): Counter tracking how many interview questions have been asked. Enforced to be strictly between 0 and 8.
*   **`history`** (array of objects): Chronological list of dialogue turns. Structured to align with the Google Gemini API's `contents` format.
    *   `role` (string): Either `user` (candidate response) or `model` (AI interviewer question).
    *   `content` (string): The text content of the message turn.
*   **`currentDayIndex`** (number): Index (0 to 3) pointing to the active day in `selectedDays` being assessed.
*   **`currentDayTurn`** (number): Counter (1 or 2) tracking if the active question is the initial topic question (Turn 1) or the probing follow-up question (Turn 2).
*   **`feedback`** (object | null): Caches the final evaluation report card once the interview is complete (`done: true`).
*   **`createdAt`** (number): Epoch timestamp marking when the session was created. Used for garbage-collection sweeps.
*   **`lastActive`** (number): Epoch timestamp updated on every incoming request turn. Sessions inactive for more than 30 minutes are deleted.

---

## 3. State Transitions

```
[Turn 0: Init POST] ──► Sets selectedDays, sets questionCount=0, history=[]
                              │
                              ▼
[Turn 1: Msg POST]  ──► Sets currentDayIndex=0, currentDayTurn=1, sets questionCount=1
                              │
                              ▼
[Turn 2: Msg POST]  ──► Keeps currentDayIndex=0, sets currentDayTurn=2, sets questionCount=2
                              │
                              ▼
[Turn 3: Msg POST]  ──► Sets currentDayIndex=1, sets currentDayTurn=1, sets questionCount=3
                              │
                              ▼
[Turn 4: Msg POST]  ──► Keeps currentDayIndex=1, sets currentDayTurn=2, sets questionCount=4
                              │
                              ▼
[Turn 5: Msg POST]  ──► Sets currentDayIndex=2, sets currentDayTurn=1, sets questionCount=5
                              │
                              ▼
[Turn 6: Msg POST]  ──► Keeps currentDayIndex=2, sets currentDayTurn=2, sets questionCount=6
                              │
                              ▼
[Turn 7: Msg POST]  ──► Sets currentDayIndex=3, sets currentDayTurn=1, sets questionCount=7
                              │
                              ▼
[Turn 8: Msg POST]  ──► Keeps currentDayIndex=3, sets currentDayTurn=2, sets questionCount=8
                              │
                              ▼
[Turn 9: Msg POST]  ──► Triggers FeedbackService, compiles feedback object, done = true
```

---
