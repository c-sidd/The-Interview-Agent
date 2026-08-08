# Interview Engine Architecture & Design

This document details the system design, request processing pipeline, and modular services architecture of the AI Interview Agent. It outlines the decoupled layers that make the system testable, maintainable, and adaptable for future feature steering.

---

## 1. Request Processing Pipeline

Every incoming request to the server passes through a linear, decoupled pipeline. Below is the step-by-step sequence of operations:

```
[Candidate Client]
       │
       ▼ (POST /api/interview)
[InterviewController]
       │
       ▼ (coordinate)
[InterviewService] ────► [SessionService] (Retrieve state / history)
       │
       ▼ (lookup candidate signals)
[CurriculumService] ──► (Filter completed/skipped/struggled days)
       │
       ▼ (compile context)
[PromptService] ──────► [SystemPromptBuilder] (Tone / persona limits)
       │              ├──► [InterviewPromptBuilder] (Syllabus questions)
       │              ├──► [FollowUpPromptBuilder] (Deep probing logic)
       │              └──► [FeedbackPromptBuilder] (Evaluation schemas)
       │
       ▼ (query LLM)
[LLMService] ─────────► [Google Gemini API] (With mock fallbacks)
       │
       ▼ (update session metadata)
[SessionService] ─────► (Increment question count, save logs)
       │
       ▼ (respond JSON)
[InterviewController] ──► [Candidate Client]
```

---

## 2. Decoupled Service Architecture

To keep the codebase maintainable and support future modifications during the Live Steer Challenge, we organize the core backend logic into distinct services under `src/services/`. Each class has a single responsibility:

| Component | Target Location | Responsibility |
|---|---|---|
| **`InterviewController`** | `src/controllers/InterviewController.js` | Parses HTTP request payloads, validates schemas, and maps responses. |
| **`InterviewService`** | `src/services/InterviewService.js` | Orchestrates the session loading, topic selection, prompt compilation, LLM calling, and state updating. |
| **`SessionService`** | `src/services/SessionService.js` | Manages active interview states, tracks question counters, and provides in-memory session caches. |
| **`CurriculumService`** | `src/services/CurriculumService.js` | Programmatically selects 4 curriculum days based on candidate signals (mastered, skipped, struggled, and capstone days). |
| **`LLMService`** | `src/services/LLMService.js` | Integrates with the Google Gemini API, manages token settings, and handles fallback mock responses. |
| **`FeedbackService`** | `src/services/FeedbackService.js` | Compiles the final evaluation prompt and parses LLM outputs into the structured JSON feedback format. |
| **`PromptService`** | `src/services/PromptService.js` | Aggregates the prompt builders to compile the active system prompt. |

### Prompt Builder Segregation
Rather than using a single prompt builder, prompts are divided into specialized modules to make prompt styling easier:
*   **`SystemPromptBuilder.js`**: Generates system instructions, the interviewer's persona, experience adjustments, and guardrails.
*   **`InterviewPromptBuilder.js`**: Formulates questions based on specific daily topics and learning objectives from the curriculum.
*   **`FollowUpPromptBuilder.js`**: Analyzes the candidate's last answer to generate follow-up questions.
*   **`FeedbackPromptBuilder.js`**: Compiles the grading prompt that instructs the LLM to output evaluation metrics matching the required JSON schema.

---

## 3. Future-Proofing for the Live Steer Challenge

In the final round, teams receive a previously unseen feature request to implement within 20 minutes. Decoupling the application logic from Express routes ensures we can implement features quickly:

*   **Scenario A: Adding a "Hint" button**:
    We only need to add a method in `PromptService` to generate a hint prompt, add a route, and call it via `InterviewController` without modifying the core conversation logic.
*   **Scenario B: Adding real-time score tracking**:
    We update `SessionService` to track scores in the session state and modify `PromptService` to request a score from the LLM on each turn.
*   **Scenario C: Implementing interview retries**:
    We expose a clear session method in `SessionService` that resets the question count and deletes the history for a given `sessionId` without affecting the route configuration.

---
