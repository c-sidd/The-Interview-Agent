# Workspace Overview & Hackathon Submission Guide

Welcome to the workspace root for the AI Interview Agent project, built for the **ABTalks Vibe Coding Hackathon**. 

This repository contains the primary application code under the [Interview_Agent](file:///d:/AB_Talks/Interview_Agent) directory. This root-level file provides a unified overview of the project structure, verification routines, compliance matrices, and quick references.

---

## 📂 Workspace Structure

*   **[Interview_Agent](file:///d:/AB_Talks/Interview_Agent)**: The self-contained sub-repository containing the application code, local UI assets, specs, and prompts.
    *   **[docs/](file:///d:/AB_Talks/Interview_Agent/docs)**: System specs, architecture decisions, and milestones.
    *   **[src/](file:///d:/AB_Talks/Interview_Agent/src)**: Core backend services and controllers.
    *   **[public/](file:///d:/AB_Talks/Interview_Agent/public)**: Single Page Application (SPA) frontend.
    *   **[PROMPTS/](file:///d:/AB_Talks/Interview_Agent/PROMPTS)**: Prompt logs for LLM audits.

---

## 🎯 Compliance Checklist & Mapping

The table below maps the strict requirements from the [problem_statement.md](file:///d:/AB_Talks/Interview_Agent/problem_statement.md) and [technical-spec.md](file:///d:/AB_Talks/Interview_Agent/technical-spec.md) to their exact implementation files:

| Feature / Requirement | Technical Description | Code Link |
| :--- | :--- | :--- |
| **Unified REST API** | Single endpoint `POST /api/interview` serving Turn 0, Turn N, and completion turns. | [interviewRoutes.js](file:///d:/AB_Talks/Interview_Agent/src/routes/interviewRoutes.js) |
| **Request Controller** | Parses and validates parameters (e.g., `sessionId`, `candidate`, `message`). | [InterviewController.js](file:///d:/AB_Talks/Interview_Agent/src/controllers/InterviewController.js) |
| **Topic Selection** | Programs 4 custom days (Strength, Growth, Gap, Capstone) from candidate progress. | [CurriculumService.js](file:///d:/AB_Talks/Interview_Agent/src/services/CurriculumService.js) |
| **Dialogue Engine** | Handles the stateful conversation, enforcing a minimum of 8 total questions. | [InterviewService.js](file:///d:/AB_Talks/Interview_Agent/src/services/InterviewService.js) |
| **In-Memory Cache** | In-memory `Map` storage mapping `sessionId` keys with inactive GC sweeping. | [SessionService.js](file:///d:/AB_Talks/Interview_Agent/src/services/SessionService.js) |
| **Prompt Orchestration** | Decoupled builders compiling system prompts, target topics, and follow-ups. | [promptBuilders](file:///d:/AB_Talks/Interview_Agent/src/services/promptBuilders) |
| **Evaluation Reporting** | Compiles structured JSON outputs (summary, strengths, gaps, next steps) at the end. | [FeedbackService.js](file:///d:/AB_Talks/Interview_Agent/src/services/FeedbackService.js) |
| **Multi-Provider wrapper** | Decouples LLM interactions. Swappable using `LLM_PROVIDER` in environment vars. | [LLMService.js](file:///d:/AB_Talks/Interview_Agent/src/services/LLMService.js) |
| **Premium UI** | Pure responsive vanilla design featuring a glassmorphism client. | [index.html](file:///d:/AB_Talks/Interview_Agent/public/index.html) & [style.css](file:///d:/AB_Talks/Interview_Agent/public/style.css) |

---

## 🛠️ Developer Commands Cheat-Sheet

Ensure you have your terminal context set to the application directory [Interview_Agent](file:///d:/AB_Talks/Interview_Agent):

### 1. Setup & Environments
```bash
# Move to app directory
cd Interview_Agent

# Copy example environment configuration
cp .env.example .env

# Install Node dependencies
npm install
```

### 2. Running the Application
```bash
# Start local server (defaults to port 3000)
npm start

# Run with hot reloading (development)
npm run dev
```

### 3. Verification & Diagnostic Tests
Run tests locally to check LLM connection logic, endpoint routing, and state maintenance:
```bash
# Verify API Endpoint Integration Flows
node test_api.js

# Test validation, blank inputs, and session safety
node test_edge_cases.js
```

---

## 💡 Stage 2 Authenticity Review Readiness

For a successful submissions audit (as outline in [hackthon.md](file:///d:/AB_Talks/Interview_Agent/hackthon.md)):
- Review [PROMPTS.md](file:///d:/AB_Talks/Interview_Agent/PROMPTS/PROMPTS.md) for pre-curated logs of system and follow-up prompts.
- Ensure your local `.env` has a valid `GEMINI_API_KEY` mapped. If left empty, the application falls back gracefully to a mock offline mode, allowing sandbox test runs without API keys.
