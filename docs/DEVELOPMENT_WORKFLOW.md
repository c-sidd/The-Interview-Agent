# Project Development Workflow — AI Interview Agent

This document outlines the development lifecycle for the AI Interview Agent, organized into 6 progressive phases (Phases A–F). This workflow is designed to prioritize architecture design, establish clear boundaries between components, and maintain a disciplined process using a Definition of Done.

---

## 1. Architectural Phases (Phases A–F)

```
Phase A: Project Planning (M01-M03)
   ↓
Phase B: Architecture Design (M04-M09)
   ↓
Phase C: Core AI Engine Services (M10-M16)
   ↓
Phase D: API & Mock Validation (M17-M21)
   ↓
Phase E: Frontend UI & Integration (M22-M30)
   ↓
Phase F: Polish, Validation & Deployment (M31-M36)
```

### Why we insert Architecture before Coding
Building stateful AI systems without clear architecture designs leads to code bugs, state loss on refreshes, and API contract errors. Designing sequence charts, session lifecycle states, folder maps, and prompt flows in Phase B ensures that:
1.  All team members understand the system interfaces before writing code.
2.  The application layers remain decoupled and modular.
3.  We are prepared to adapt the codebase during the 20-minute Live Steer Challenge.

---

## 2. Decoupled Service-Oriented Design

The core system logic is divided into modular services under `src/services/`. This separates responsibilities:
*   **`InterviewController.js`**: Route controller handling HTTP data validation and mapping.
*   **`InterviewService.js`**: Coordinates session state, topic picker services, prompt builder outputs, and LLM calls.
*   **`SessionService.js`**: Manages state objects in an in-memory session cache.
*   **`CurriculumService.js`**: Programmatically selects 4 curriculum days based on candidate signals (completed, skipped, struggled, and capstone days).
*   **`LLMService.js`**: Integrates with the Google Gemini API (supporting mock fallbacks).
*   **`FeedbackService.js`**: Compiles the final evaluation prompt and formats JSON feedback report cards.
*   **`PromptService.js`**: Composes system prompts from segregated builders:
    *   `SystemPromptBuilder.js` (personas & tone)
    *   `InterviewPromptBuilder.js` (syllabus content)
    *   `FollowUpPromptBuilder.js` (probing questions)
    *   `FeedbackPromptBuilder.js` (evaluation templates)

---

## 3. Future-Proofing for the Live Steer Challenge

Decoupling the Express routes from the business logic ensures the application is highly adaptable. During the 20-minute challenge, adding new endpoints or features (such as a hint system, scoring adjustments, or restart functionality) only requires modifying a specific service class (e.g., `SessionService` or `PromptService`) without breaking routing interfaces.

---

## 4. Definition of Done (DoD)

To maintain a disciplined development process, every milestone must satisfy this checklist before it is marked complete:

*   [ ] **Code Compiles**: The code runs locally without errors.
*   [ ] **Linter Passes**: No syntax warnings or format issues.
*   [ ] **Manual Test Passed**: The feature is manually verified in a development environment.
*   [ ] **Documentation Updated**: All relevant markdown files are updated.
*   [ ] **PROMPTS.md Updated**: Prompt logs are updated with timestamps and git commits.
*   [ ] **Git Commit Created**: A clean, descriptive git commit is pushed to the branch.

---
