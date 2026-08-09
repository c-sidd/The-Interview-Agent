# AI Usage Log & Prompt History — The Interview Agent

This document lists the chronological prompts used to build, refine, and verify the AI Interview Agent. It serves as an authenticity trail for Stage 2 Hackathon reviews, documenting the developer's instructions to the AI coding assistant (Antigravity).

---

## Phase A — Discovery & Planning

### Entry M01: Official Requirements Analysis
*   **Milestone**: M01
*   **Date**: 2026-08-08
*   **Method**: Reconstructed Summary

> **Prompt**: Analyze the provided technical specification (`technical-spec.md`), curriculum schema (`curriculum.json`), and candidate profiles (`candidates.json`). Provide a discovery report summarizing the core business objectives, the target API routes (`POST /api/interview`), state management constraints, and how the adaptive progression needs to work.

---

### Entry M02: Project Roadmap Generation
*   **Milestone**: M02
*   **Date**: 2026-08-08
*   **Method**: Reconstructed Summary

> **Prompt**: Based on the requirement analysis, draft a granular development milestones roadmap (`docs/PROJECT_MILESTONES.md`) dividing the work into distinct, incremental steps spanning environment configuration, service foundations, frontend pages, state machines, and testing.

---

### Entry M03: Setting Up AI Usage Log & Workflow
*   **Milestone**: M03
*   **Date**: 2026-08-08
*   **Method**: Reconstructed Summary

> **Prompt**: Set up the team roles (Lead Architect, Frontend Engineer, QA & DevOps) and define the Definition of Done (DoD) guidelines in `docs/DEVELOPMENT_WORKFLOW.md`. Outline the strategy for tracking prompt histories and logging changes.

---

## Phase B — Backend Foundations & Core Services

### Entry M04: Initial Repository Hygiene
*   **Milestone**: M04
*   **Date**: 2026-08-08
*   **Method**: Reconstructed Summary

> **Prompt**: Create a `.gitignore` file for a standard Node.js/Express web app. Make sure it explicitly ignores `.env`, `node_modules`, and IDE specific config folders to ensure we do not commit private keys or bloat the repository.

---

### Entry M05: Project Skeleton
*   **Milestone**: M05
*   **Date**: 2026-08-08
*   **Method**: Reconstructed Summary

> **Prompt**: Create the basic project folder structure (Express server boilerplate, frontend public static assets folder, and backend source files under `src/`). Set up a basic `package.json` with dependencies like `express`, `dotenv`, and `@google/generative-ai`.

---

### Entry M06: Health Check API Endpoint
*   **Milestone**: M06
*   **Date**: 2026-08-08
*   **Method**: Reconstructed Summary

> **Prompt**: Implement a lightweight GET `/api/health` check route inside the Express app to verify server readiness and configuration states. Return the server timestamp.

---

### Entry M07: Session Store & Schema Design
*   **Milestone**: M07
*   **Date**: 2026-08-08
*   **Method**: Reconstructed Summary

> **Prompt**: Create a stateless/stateful session controller and service (`SessionService.js`). We will store sessions in an in-memory JavaScript `Map` cache with a sweep cleanup interval of 30 minutes to clean up stale sessions. Set up session tracking schema mapping: candidate data, dialogue history, selected curriculum days, activeDay, and evaluation state.

---

### Entry M08: Curriculum Service Setup
*   **Milestone**: M08
*   **Date**: 2026-08-08
*   **Method**: Reconstructed Summary

> **Prompt**: Build the `CurriculumService.js` to parse `curriculum.json` and retrieve modules/day topics. Add a stub method to select target days for the candidate's interview based on their learning profile.

---

### Entry M09: Candidate Profile Loader
*   **Milestone**: M09
*   **Date**: 2026-08-08
*   **Method**: Reconstructed Summary

> **Prompt**: Build the `CandidateService` (integrated inside CurriculumService) to load and search candidates in `candidates.json`. Extract years of experience, target role, education, and past mission completion signals.

---

## Phase C — LLM, Prompts & Adaptive Logic

### Entry M10-M12: Prompt Compiler Architecture
*   **Milestones**: M10, M11, M12
*   **Date**: 2026-08-08
*   **Method**: Reconstructed Summary

> **Prompt**: Design modular prompt builder classes (`SystemPromptBuilder.js`, `InterviewPromptBuilder.js`, `FollowUpPromptBuilder.js`). Ensure they dynamically compile prompts with candidate signals and active syllabus objectives, strictly adjusting difficulty based on candidate experience (Senior vs Junior).

---

### Entry M13-M15: LLM Connector & Decoupled Evaluator
*   **Milestones**: M13, M14, M15
*   **Date**: 2026-08-08
*   **Method**: Reconstructed Summary

> **Prompt**: Create `LLMService.js` supporting both Gemini and Groq API calls with fallback logic. Create `EvaluationService.js` that sends candidate answers to the LLM to get classified into: Correct, Partially Correct, Incorrect, Don't Know, or Off Topic, returning structured JSON containing confidence ratings and rubrics.

---

## Phase D — Frontend UI & Client Controllers

### Entry M16-M17: Glassmorphic UI & SPA Layout
*   **Milestones**: M16, M17
*   **Date**: 2026-08-08
*   **Method**: Reconstructed Summary

> **Prompt**: Build a premium glassmorphic Single Page Application UI inside `public/index.html` and `public/style.css` featuring dark-mode gradients, smooth micro-animations, a grid to select candidates, a chat console, and a sidebar dashboard displaying candidate status.

---

### Entry M18-M21: Live Status & Progress Bars
*   **Milestones**: M18, M19, M20, M21
*   **Date**: 2026-08-08
*   **Method**: Reconstructed Summary

> **Prompt**: Write the client-side JavaScript (`public/app.js`) to handle server polling, message buffers, and state re-hydration (using `localStorage` to resume interviews). Bind connection status badges (Gemini/Groq/Mock), turn progress tracking fills (e.g., Question 3 of 8), and render a visual skill map.

---

## Phase E — Dialogue Engine & Progression Mechanics

### Entry M22-M30: Session Evidence Graphs & Evaluations
*   **Milestones**: M22–M30
*   **Date**: 2026-08-09
*   **Method**: Reconstructed Summary

> **Prompt**: Connect the evaluation loop. For each response, save evaluated claims, update the candidate's skill maps, update average rubric scores, and log evidence in the session graph.

---

### Entry M31-M33: Attempts & Follow-up State Transition limits
*   **Milestones**: M31, M32, M33
*   **Date**: 2026-08-09
*   **Method**: Reconstructed Summary

> **Prompt**: Enforce progression transition constraints. If a candidate struggles (Incorrect / Don't Know / Off Topic), allow up to 3 attempts with hints/simplifications before downgrading their skill score and advancing to the next day. If a response is Partially Correct, allow up to 2 probing follow-up turns before transitioning.

---

### Entry M34-M35: Compilation Reports & Final Feedback Card
*   **Milestones**: M34, M35
*   **Date**: 2026-08-09
*   **Method**: Reconstructed Summary

> **Prompt**: Create a report compiler. Upon completing 8 questions, compile scores, list overall strengths, highlight learning gaps, and render a final report card view on the frontend client.

---

## Phase F — Auditing, Refinements & Deployment

### Entry M36-M38: Progression Bounds Fixes
*   **Milestones**: M36, M37, M38
*   **Date**: 2026-08-09
*   **Method**: Reconstructed Summary

> **Prompt**: Investigate why progression hangs on the 5th question in loops where candidates repeatedly answer incorrectly. Refactor `InterviewService.js` state transitions to handle progression limits safely.

---

### Entry M39: Fix Turn 5 Out-of-Bounds and Redact Injection Keywords
*   **Milestone**: M39
*   **Date**: 2026-08-09
*   **Method**: Exact Prompt

> **Prompt**:
> Fix the Interview Engine progression bug. Introduce a maximum attempt limit (3) and follow-up limit (2). Calculate day index using:
> `currentDayIndex = (questionCount - 1) % selectedDays.length`
> to prevent out-of-bounds errors on question 5. Update InterviewController to support both `interviewId` and `sessionId` payload fields. Redact prompt injection test keywords like `INJECTION_SUCCESS` to prevent assertion failures on mock tests.

---

### Entry M40: Make Candidates and Curriculum Fully Data-Driven
*   **Milestone**: M40
*   **Date**: 2026-08-09
*   **Method**: Exact Prompt

> **Prompt**:
> Make candidates.json and curriculum.json the actual dynamic source of truth. Remove any hardcoded candidate lists or day number mappings.
> 1. Dynamically read candidates.json in getCandidates() and candidates selector UI.
> 2. Parse curriculum.json dynamically in CurriculumService. Select target days dynamically based on candidate signals (skipped, struggled, strength days).
> 3. Filter out DevOps/infrastructure days (Docker, Kubernetes) dynamically for non-technical profiles (like Business Analyst) by matching keywords in tools/objectives instead of checking static day lists.
> 4. Add graceful error handlers (try/catch blocks) inside route controllers to display a descriptive error in the UI if JSON files are malformed or missing.

---

### Entry M41: Deployment Readiness Audit
*   **Milestone**: M41
*   **Date**: 2026-08-09
*   **Method**: Exact Prompt

> **Prompt**:
> Perform a deployment-readiness check. Verify that package.json has a correct production start script, the Express server uses process.env.PORT, binds to 0.0.0.0, .env is git-ignored, static public files are served correctly, and there are no localhost URLs hardcoded. Bind server to '0.0.0.0' explicitly in server.js.

---

### Entry M42: LLM Provider Alignment & Dynamic Connection Badges
*   **Milestone**: M42
*   **Date**: 2026-08-09
*   **Method**: Exact Prompt

> **Prompt**:
> Align the active production LLM provider to Groq (using llama-3.3-70b-versatile). Ensure that LLMService falls back to 'groq' if LLM_PROVIDER env variable is not set. Update backend responses to return the active provider name, and modify the client side badge in public/app.js to display "Groq Connected" dynamically.
