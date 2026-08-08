# Project Milestones Roadmap — AI Interview Agent

This document outlines the master roadmap for the development of the AI Interview Agent. The project is divided into 36 granular milestones representing approximately 30–90 minutes of focused work each. This structure provides a transparent, incremental git history suitable for the Stage 2 Authenticity Review.

---

## Team Roles & Ownership

To facilitate collaboration across our three team members, tasks are assigned to:
*   **Lead Architect (LA)**: Focuses on core system logic, API routing, state management, and LLM prompt engineering.
*   **Frontend Engineer (FE)**: Focuses on visual style, glassmorphic UI, transitions, chat layout, and responsiveness.
*   **QA & DevOps Engineer (DE)**: Focuses on validation scripts, testing suites, containerization, monitoring, and compliance reviews.

---

## Phase A — Project Planning

### Milestone 01: Official Requirements Analysis & Retrieval
*   **Milestone Number**: M01
*   **Title**: Official Requirements Analysis & Retrieval
*   **Objective**: Recover and consolidate all official hackathon rules, problem statements, and specifications.
*   **Why this milestone exists**: To ensure all subsequent milestones are grounded in the official rules without external assumptions.
*   **Inputs**: Organizers' resource files (`candidates.json`, `curriculum.json`, `technical-spec.md`).
*   **Deliverables**: Comprehensive Discovery & Requirement Analysis Report (chat verification).
*   **Dependencies**: None.
*   **Success Criteria**: All 10 tasks in Phase 1 analysis are complete and verified.
*   **Estimated Complexity**: Easy.
*   **Recommended Team Member**: Lead Architect (LA).
*   **Recommended Git Commit**: `docs: analyze and verify official hackathon resources`
*   **Definition of Done**:
    *   [x] Code Compiles (N/A)
    *   [x] Linter Passes (N/A)
    *   [x] Manual Test Passed (N/A)
    *   [x] Documentation Updated (Report output verified)
    *   [x] PROMPTS.md Updated (PR-M01 logged)
    *   [x] Git Commit Created

---

### Milestone 02: Define Project Milestones & Development Strategy Document
*   **Milestone Number**: M02
*   **Title**: Define Project Milestones & Development Strategy Document
*   **Objective**: Author the master project roadmap.
*   **Why this milestone exists**: To plan a step-by-step path for development and git commit progression.
*   **Inputs**: M01 analysis results.
*   **Deliverables**: `docs/PROJECT_MILESTONES.md`.
*   **Dependencies**: M01.
*   **Success Criteria**: File created on disk containing a list of 36 distinct milestones.
*   **Estimated Complexity**: Easy.
*   **Recommended Team Member**: Lead Architect (LA).
*   **Recommended Git Commit**: `docs: initialize project milestones roadmap`
*   **Definition of Done**:
    *   [ ] Code Compiles (N/A)
    *   [ ] Linter Passes (N/A)
    *   [ ] Manual Test Passed (N/A)
    *   [x] Documentation Updated (`docs/PROJECT_MILESTONES.md` written)
    *   [x] PROMPTS.md Updated
    *   [x] Git Commit Created

---

### Milestone 03: Define Development Workflow & AI Usage Strategy Documentation
*   **Milestone Number**: M03
*   **Title**: Define Development Workflow & AI Usage Strategy Documentation
*   **Objective**: Document the detailed development workflow and AI prompt tracking strategy.
*   **Why this milestone exists**: To set up prompt-logging mechanisms and coding guidelines before implementation starts.
*   **Inputs**: M02.
*   **Deliverables**: `docs/DEVELOPMENT_WORKFLOW.md`, `docs/AI_USAGE_LOG_STRATEGY.md`, and the `PROMPTS/` folder placeholders.
*   **Dependencies**: M02.
*   **Success Criteria**: Documentation files created, folder placeholders initialized.
*   **Estimated Complexity**: Easy.
*   **Recommended Team Member**: Lead Architect (LA).
*   **Recommended Git Commit**: `docs: document development workflow and AI log strategies`
*   **Definition of Done**:
    *   [ ] Code Compiles (N/A)
    *   [ ] Linter Passes (N/A)
    *   [ ] Manual Test Passed (N/A)
    *   [x] Documentation Updated (`docs/DEVELOPMENT_WORKFLOW.md` & `docs/AI_USAGE_LOG_STRATEGY.md` written)
    *   [x] PROMPTS.md Updated
    *   [x] Git Commit Created

---

## Phase B — Architecture & Design Documents

### Milestone 04: Initialize Git Repository & Set Up Base Folder Hierarchy
*   **Milestone Number**: M04
*   **Title**: Initialize Git Repository & Set Up Base Folder Hierarchy
*   **Objective**: Initialize git repository, configure `.gitignore`, and set up directories.
*   **Why this milestone exists**: Set up repository hygiene.
*   **Inputs**: M03.
*   **Deliverables**: `.gitignore` configured to exclude `.env` and `node_modules`. Base folder structure initialized.
*   **Dependencies**: M03.
*   **Success Criteria**: Git repo initialized, `.gitignore` present and ignoring `.env`.
*   **Estimated Complexity**: Easy.
*   **Recommended Team Member**: QA & DevOps Engineer (DE).
*   **Recommended Git Commit**: `chore: initialize repository, add gitignore and project structure`
*   **Definition of Done**:
    *   [x] Code Compiles (N/A)
    *   [x] Linter Passes (N/A)
    *   [x] Manual Test Passed (Git status verified)
    *   [ ] Documentation Updated
    *   [ ] PROMPTS.md Updated
    *   [ ] Git Commit Created

---

### Milestone 05: System Architecture Design (System & Folders Diagram)
*   **Milestone Number**: M05
*   **Title**: System Architecture Design (System & Folders Diagram)
*   **Objective**: Create the system architecture schema, request flows, and folder structure maps.
*   **Why this milestone exists**: Aligns the team on architecture boundaries before coding starts.
*   **Inputs**: M01, M04.
*   **Deliverables**: `docs/SYSTEM_ARCHITECTURE.md` containing core data flow and module diagrams.
*   **Dependencies**: M04.
*   **Success Criteria**: Diagrams detailing system architecture and folder layouts reviewed.
*   **Estimated Complexity**: Medium.
*   **Recommended Team Member**: Lead Architect (LA).
*   **Recommended Git Commit**: `docs: outline system architecture, data flows, and folder layouts`
*   **Definition of Done**:
    *   [ ] Code Compiles (N/A)
    *   [ ] Linter Passes (N/A)
    *   [ ] Manual Test Passed (N/A)
    *   [x] Documentation Updated (`docs/SYSTEM_ARCHITECTURE.md` created)
    *   [x] PROMPTS.md Updated
    *   [x] Git Commit Created

---

### Milestone 06: Interview Engine Pipeline Design Document
*   **Milestone Number**: M06
*   **Title**: Interview Engine Pipeline Design Document
*   **Objective**: Detail the request processing pipeline, session loads, topic picker choices, and LLM calls.
*   **Why this milestone exists**: Serves as the blueprint for our core interview workflow.
*   **Inputs**: M05.
*   **Deliverables**: `docs/INTERVIEW_ENGINE_DESIGN.md`.
*   **Dependencies**: M05.
*   **Success Criteria**: Document detailing the request processing pipeline reviewed and finalized.
*   **Estimated Complexity**: Medium.
*   **Recommended Team Member**: Lead Architect (LA).
*   **Recommended Git Commit**: `docs: design interview engine request processing pipeline`
*   **Definition of Done**:
    *   [ ] Code Compiles (N/A)
    *   [ ] Linter Passes (N/A)
    *   [ ] Manual Test Passed (N/A)
    *   [x] Documentation Updated (`docs/INTERVIEW_ENGINE_DESIGN.md` created)
    *   [x] PROMPTS.md Updated
    *   [x] Git Commit Created

---

### Milestone 07: Database & Session Schema Specification
*   **Milestone Number**: M07
*   **Title**: Database & Session Schema Specification
*   **Objective**: Define the properties stored in active session states for the interview loop.
*   **Why this milestone exists**: To establish the session schema before writing routing code.
*   **Inputs**: `technical-spec.md`, M06.
*   **Deliverables**: `docs/SESSION_SCHEMA.md` outlining the session object properties.
*   **Dependencies**: M06.
*   **Success Criteria**: Schema fields (sessionId, candidate, selectedDays, questionCount, etc.) clearly documented.
*   **Estimated Complexity**: Easy.
*   **Recommended Team Member**: Lead Architect (LA).
*   **Recommended Git Commit**: `docs: specify session schema and state structures`
*   **Definition of Done**:
    *   [ ] Code Compiles (N/A)
    *   [ ] Linter Passes (N/A)
    *   [ ] Manual Test Passed (N/A)
    *   [x] Documentation Updated (`docs/SESSION_SCHEMA.md` created)
    *   [x] PROMPTS.md Updated
    *   [x] Git Commit Created

---

### Milestone 08: Segregated Prompt Design: System, Interview & Follow-up
*   **Milestone Number**: M08
*   **Title**: Segregated Prompt Design: System, Interview & Follow-up
*   **Objective**: Design the templates for `SystemPromptBuilder`, `InterviewPromptBuilder`, and `FollowUpPromptBuilder`.
*   **Why this milestone exists**: Separates the prompt engineering logic into distinct builders.
*   **Inputs**: `curriculum.json`, `candidates.json`, M06.
*   **Deliverables**: `docs/PROMPT_DESIGNS.md` containing System Prompt V1 and builder layouts.
*   **Dependencies**: M06.
*   **Success Criteria**: Initial templates for the system prompt, interview questions, and follow-ups documented.
*   **Estimated Complexity**: Medium.
*   **Recommended Team Member**: Lead Architect (LA).
*   **Recommended Git Commit**: `docs: design segregated prompt templates for system, interview, and follow-ups`
*   **Definition of Done**:
    *   [ ] Code Compiles (N/A)
    *   [ ] Linter Passes (N/A)
    *   [ ] Manual Test Passed (N/A)
    *   [x] Documentation Updated (`docs/PROMPT_DESIGNS.md` created)
    *   [x] PROMPTS.md Updated
    *   [x] Git Commit Created

---

### Milestone 09: Prompt Engineering Design: Feedback & Evaluation Schema
*   **Milestone Number**: M09
*   **Title**: Prompt Engineering Design: Feedback & Evaluation Schema
*   **Objective**: Design the prompt layout for the `FeedbackPromptBuilder` to return JSON evaluation results.
*   **Why this milestone exists**: To guarantee the output matches the JSON interface defined in the technical specification.
*   **Inputs**: `technical-spec.md`, M08.
*   **Deliverables**: Feedback evaluation prompt layouts documented in `docs/PROMPT_DESIGNS.md`.
*   **Dependencies**: M08.
*   **Success Criteria**: Structured evaluation prompts documented with response validation rules.
*   **Estimated Complexity**: Medium.
*   **Recommended Team Member**: Lead Architect (LA).
*   **Recommended Git Commit**: `docs: design feedback prompt evaluation schemas`
*   **Definition of Done**:
    *   [ ] Code Compiles (N/A)
    *   [ ] Linter Passes (N/A)
    *   [ ] Manual Test Passed (N/A)
    *   [x] Documentation Updated (`docs/PROMPT_DESIGNS.md` updated)
    *   [x] PROMPTS.md Updated
    *   [x] Git Commit Created

---

## Phase C — Core AI Engine Services

### Milestone 10: Curriculum Service Module
*   **Milestone Number**: M10
*   **Title**: Curriculum Service Module
*   **Objective**: Build the `CurriculumService.js` to parse candidate progress and curriculum topics.
*   **Why this milestone exists**: Programmatically handles fetching daily topics, tools, and objectives based on candidate signals.
*   **Inputs**: `candidates.json`, `curriculum.json`, M04.
*   **Deliverables**: `src/services/CurriculumService.js`.
*   **Dependencies**: M04.
*   **Success Criteria**: Class exposes methods to retrieve specific day objectives and candidate profiles.
*   **Estimated Complexity**: Medium.
*   **Recommended Team Member**: Lead Architect (LA).
*   **Recommended Git Commit**: `feat: implement curriculum service module`
*   **Definition of Done**:
    *   [ ] Code Compiles
    *   [ ] Linter Passes
    *   [ ] Manual Test Passed
    *   [ ] Documentation Updated
    *   [ ] PROMPTS.md Updated
    *   [ ] Git Commit Created

---

### Milestone 11: Session Service Module
*   **Milestone Number**: M11
*   **Title**: Session Service Module
*   **Objective**: Build `SessionService.js` to manage active session objects in an in-memory cache.
*   **Why this milestone exists**: Isolates state tracking logic from routing systems.
*   **Inputs**: M07, M10.
*   **Deliverables**: `src/services/SessionService.js`.
*   **Dependencies**: M10.
*   **Success Criteria**: Module successfully stores, retrieves, and increments session data using `sessionId`.
*   **Estimated Complexity**: Medium.
*   **Recommended Team Member**: Lead Architect (LA).
*   **Recommended Git Commit**: `feat: implement session service module for state caching`
*   **Definition of Done**:
    *   [ ] Code Compiles
    *   [ ] Linter Passes
    *   [ ] Manual Test Passed
    *   [ ] Documentation Updated
    *   [ ] PROMPTS.md Updated
    *   [ ] Git Commit Created

---

### Milestone 12: Segregated Prompt Service & Builders Setup
*   **Milestone Number**: M12
*   **Title**: Segregated Prompt Service & Builders Setup
*   **Objective**: Implement the `PromptService.js`, `SystemPromptBuilder.js`, `InterviewPromptBuilder.js`, and `FollowUpPromptBuilder.js` classes.
*   **Why this milestone exists**: Creates a modular prompting engine to support easy prompt evolution.
*   **Inputs**: M08, M10.
*   **Deliverables**: `src/services/PromptService.js` and builder classes in `src/services/promptBuilders/`.
*   **Dependencies**: M10.
*   **Success Criteria**: Prompt builders generate system instructions and follow-up contexts.
*   **Estimated Complexity**: Hard.
*   **Recommended Team Member**: Lead Architect (LA).
*   **Recommended Git Commit**: `feat: implement segregated prompt service and builder sub-classes`
*   **Definition of Done**:
    *   [ ] Code Compiles
    *   [ ] Linter Passes
    *   [ ] Manual Test Passed
    *   [ ] Documentation Updated
    *   [ ] PROMPTS.md Updated
    *   [ ] Git Commit Created

---

### Milestone 13: LLM Service Client Wrapper
*   **Milestone Number**: M13
*   **Title**: LLM Service Client Wrapper
*   **Objective**: Implement the integration wrapper `LLMService.js` for the Google Gemini SDK.
*   **Why this milestone exists**: Centralizes LLM communication and provides a fallback mock mode.
*   **Inputs**: M06.
*   **Deliverables**: `src/services/LLMService.js`.
*   **Dependencies**: M06.
*   **Success Criteria**: Service connects to the Gemini API (or returns mock values if no API key is set).
*   **Estimated Complexity**: Medium.
*   **Recommended Team Member**: Lead Architect (LA).
*   **Recommended Git Commit**: `feat: implement LLM service client wrapper with mock fallback`
*   **Definition of Done**:
    *   [ ] Code Compiles
    *   [ ] Linter Passes
    *   [ ] Manual Test Passed
    *   [ ] Documentation Updated
    *   [ ] PROMPTS.md Updated
    *   [ ] Git Commit Created

---

### Milestone 14: Prompt Experimentation & Offline Testing
*   **Milestone Number**: M14
*   **Title**: Prompt Experimentation & Offline Testing
*   **Objective**: Test System Prompt V1 prompts using mock candidates to verify interviewer persona quality.
*   **Why this milestone exists**: Verifies prompt quality, tone, and formatting constraints before launching the server.
*   **Inputs**: M08, M12, M13.
*   **Deliverables**: Prompt testing script `src/services/test_prompts.js` and System Prompt V1 audit notes.
*   **Dependencies**: M12, M13.
*   **Success Criteria**: Offline tests confirm the LLM generates realistic questions and follow-ups.
*   **Estimated Complexity**: Medium.
*   **Recommended Team Member**: QA & DevOps Engineer (DE).
*   **Recommended Git Commit**: `test: execute prompt experiments and verify interviewer persona`
*   **Definition of Done**:
    *   [ ] Code Compiles
    *   [ ] Linter Passes
    *   [ ] Manual Test Passed
    *   [ ] Documentation Updated
    *   [ ] PROMPTS.md Updated
    *   [ ] Git Commit Created

---

### Milestone 15: Feedback Service & Prompt Builder
*   **Milestone Number**: M15
*   **Title**: Feedback Service & Prompt Builder
*   **Objective**: Build `FeedbackService.js` and `FeedbackPromptBuilder.js`.
*   **Why this milestone exists**: Decouples evaluation compilation and response validation.
*   **Inputs**: M09, M12.
*   **Deliverables**: `src/services/FeedbackService.js` and `src/services/promptBuilders/FeedbackPromptBuilder.js`.
*   **Dependencies**: M12.
*   **Success Criteria**: Modules generate the evaluation prompt and parse the final output.
*   **Estimated Complexity**: Medium.
*   **Recommended Team Member**: Lead Architect (LA).
*   **Recommended Git Commit**: `feat: implement feedback service and prompt builder`
*   **Definition of Done**:
    *   [ ] Code Compiles
    *   [ ] Linter Passes
    *   [ ] Manual Test Passed
    *   [ ] Documentation Updated
    *   [ ] PROMPTS.md Updated
    *   [ ] Git Commit Created

---

### Milestone 16: Interview Service Coordinator
*   **Milestone Number**: M16
*   **Title**: Interview Service Coordinator
*   **Objective**: Implement the coordinator class `InterviewService.js`.
*   **Why this milestone exists**: Orchestrates all sub-services (Session, Prompt, LLM, Feedback) into a single coordinator class.
*   **Inputs**: M11, M12, M13, M15.
*   **Deliverables**: `src/services/InterviewService.js`.
*   **Dependencies**: M11, M12, M13, M15.
*   **Success Criteria**: Coordinator class exposes `handleRequest(sessionId, message, candidate)` which processes the interview turns.
*   **Estimated Complexity**: Hard.
*   **Recommended Team Member**: Lead Architect (LA).
*   **Recommended Git Commit**: `feat: implement core interview service coordinator`
*   **Definition of Done**:
    *   [ ] Code Compiles
    *   [ ] Linter Passes
    *   [ ] Manual Test Passed
    *   [ ] Documentation Updated
    *   [ ] PROMPTS.md Updated
    *   [ ] Git Commit Created

---

## Phase D — API & Mock Validation

### Milestone 17: Express Server & Backend Setup
*   **Milestone Number**: M17
*   **Title**: Express Server & Backend Setup
*   **Objective**: Configure the package.json, load variables from dotenv, and configure the base Express application.
*   **Why this milestone exists**: Create the runtime environment for the backend server.
*   **Inputs**: M06.
*   **Deliverables**: `package.json`, `.env.example`, and `server.js` boilerplate.
*   **Dependencies**: M06.
*   **Success Criteria**: Server boots locally on the designated port.
*   **Estimated Complexity**: Easy.
*   **Recommended Team Member**: QA & DevOps Engineer (DE).
*   **Recommended Git Commit**: `chore: scaffold backend express app with environmental configuration`
*   **Definition of Done**:
    *   [ ] Code Compiles
    *   [ ] Linter Passes
    *   [ ] Manual Test Passed
    *   [ ] Documentation Updated
    *   [ ] PROMPTS.md Updated
    *   [ ] Git Commit Created

---

### Milestone 18: Candidate & Curriculum GET Routes
*   **Milestone Number**: M18
*   **Title**: Candidate & Curriculum GET Routes
*   **Objective**: Implement routes `GET /api/candidates` and `GET /api/curriculum` calling `CurriculumService.js`.
*   **Why this milestone exists**: Exposes candidate profiles and curriculum modules to the frontend UI.
*   **Inputs**: M10, M17.
*   **Deliverables**: Endpoints configured in `server.js` (or an `InterviewController.js`).
*   **Dependencies**: M10, M17.
*   **Success Criteria**: Making GET requests returns valid JSON data.
*   **Estimated Complexity**: Easy.
*   **Recommended Team Member**: Lead Architect (LA).
*   **Recommended Git Commit**: `feat: expose candidate and curriculum routes via controller`
*   **Definition of Done**:
    *   [ ] Code Compiles
    *   [ ] Linter Passes
    *   [ ] Manual Test Passed
    *   [ ] Documentation Updated
    *   [ ] PROMPTS.md Updated
    *   [ ] Git Commit Created

---

### Milestone 19: POST API Route Mock Integration
*   **Milestone Number**: M19
*   **Title**: POST API Route Mock Integration
*   **Objective**: Connect `POST /api/interview` to `InterviewController.js` and `InterviewService.js` operating with mock replies.
*   **Why this milestone exists**: Confirms endpoint behavior and routes work correctly before connecting the LLM.
*   **Inputs**: M16, M17.
*   **Deliverables**: `src/controllers/InterviewController.js` and route mapping in `server.js`.
*   **Dependencies**: M16, M17.
*   **Success Criteria**: Endpoint returns mock replies matching the payload schema.
*   **Estimated Complexity**: Medium.
*   **Recommended Team Member**: Lead Architect (LA).
*   **Recommended Git Commit**: `feat: implement interview controller and route responses using mocks`
*   **Definition of Done**:
    *   [ ] Code Compiles
    *   [ ] Linter Passes
    *   [ ] Manual Test Passed
    *   [ ] Documentation Updated
    *   [ ] PROMPTS.md Updated
    *   [ ] Git Commit Created

---

### Milestone 20: POST API Route Live Integration
*   **Milestone Number**: M20
*   **Title**: POST API Route Live Integration
*   **Objective**: Enable live LLM calls inside the Express routing handler.
*   **Why this milestone exists**: Integrates the frontend-facing endpoint with the live Gemini client.
*   **Inputs**: M13, M19.
*   **Deliverables**: Live route config in `server.js`.
*   **Dependencies**: M13, M19.
*   **Success Criteria**: Endpoint handles live multi-turn conversations and returns evaluation feedback.
*   **Estimated Complexity**: Medium.
*   **Recommended Team Member**: Lead Architect (LA).
*   **Recommended Git Commit**: `feat: connect interview controller to live gemini engine`
*   **Definition of Done**:
    *   [ ] Code Compiles
    *   [ ] Linter Passes
    *   [ ] Manual Test Passed
    *   [ ] Documentation Updated
    *   [ ] PROMPTS.md Updated
    *   [ ] Git Commit Created

---

### Milestone 21: Early Edge-Case & Input Validation Test
*   **Milestone Number**: M21
*   **Title**: Early Edge-Case & Input Validation Test
*   **Objective**: Test validation handling for empty inputs, skip commands, and basic prompt injection attempts.
*   **Why this milestone exists**: Catch input validation and safety issues early.
*   **Inputs**: M20.
*   **Deliverables**: Validation script `test_edge_cases.js`.
*   **Dependencies**: M20.
*   **Success Criteria**: Server handles edge-case inputs gracefully without throwing exceptions.
*   **Estimated Complexity**: Medium.
*   **Recommended Team Member**: QA & DevOps Engineer (DE).
*   **Recommended Git Commit**: `test: validate api routing against edge cases and prompt injections`
*   **Definition of Done**:
    *   [ ] Code Compiles
    *   [ ] Linter Passes
    *   [ ] Manual Test Passed
    *   [ ] Documentation Updated
    *   [ ] PROMPTS.md Updated
    *   [ ] Git Commit Created

---

## Phase E — Frontend UI & Integration

### Milestone 22: CSS Design System & Theme Layout Setup
*   **Milestone Number**: M22
*   **Title**: CSS Design System & Theme Layout Setup
*   **Objective**: Establish the layouts, CSS variables, and dark theme.
*   **Why this milestone exists**: Sets up the design tokens (colors, layout grid) before coding UI components.
*   **Inputs**: M06, M17.
*   **Deliverables**: `public/style.css` containing style rules, folder `public/` mounted.
*   **Dependencies**: M17.
*   **Success Criteria**: Styling tokens defined (colors, layout rules).
*   **Estimated Complexity**: Easy.
*   **Recommended Team Member**: Frontend Engineer (FE).
*   **Recommended Git Commit**: `style: establish base CSS variables and global theme styles`
*   **Definition of Done**:
    *   [ ] Code Compiles
    *   [ ] Linter Passes
    *   [ ] Manual Test Passed
    *   [ ] Documentation Updated
    *   [ ] PROMPTS.md Updated
    *   [ ] Git Commit Created

---

### Milestone 23: Candidate Selector UI Layout & Static Cards
*   **Milestone Number**: M23
*   **Title**: Candidate Selector UI Layout & Static Cards
*   **Objective**: Design the HTML/CSS template to list candidate cards.
*   **Why this milestone exists**: Allows the user to select which profile to use for the interview.
*   **Inputs**: M22.
*   **Deliverables**: Candidate selector section inside `public/index.html`.
*   **Dependencies**: M22.
*   **Success Criteria**: Cards render correctly with placeholders.
*   **Estimated Complexity**: Easy.
*   **Recommended Team Member**: Frontend Engineer (FE).
*   **Recommended Git Commit**: `style: design layout structure for candidate selection screen`
*   **Definition of Done**:
    *   [ ] Code Compiles
    *   [ ] Linter Passes
    *   [ ] Manual Test Passed
    *   [ ] Documentation Updated
    *   [ ] PROMPTS.md Updated
    *   [ ] Git Commit Created

---

### Milestone 24: Candidate Selector API Population
*   **Milestone Number**: M24
*   **Title**: Candidate Selector API Population
*   **Objective**: Retrieve profiles from `/api/candidates` and populate the selector cards.
*   **Why this milestone exists**: Displays real candidate profiles in the grid.
*   **Inputs**: M18, M23.
*   **Deliverables**: Dynamic card rendering code in `public/app.js`.
*   **Dependencies**: M18, M23.
*   **Success Criteria**: Profiles are fetched and displayed in the UI.
*   **Estimated Complexity**: Easy.
*   **Recommended Team Member**: Frontend Engineer (FE).
*   **Recommended Git Commit**: `feat: implement dynamic candidate cards rendering`
*   **Definition of Done**:
    *   [ ] Code Compiles
    *   [ ] Linter Passes
    *   [ ] Manual Test Passed
    *   [ ] Documentation Updated
    *   [ ] PROMPTS.md Updated
    *   [ ] Git Commit Created

---

### Milestone 25: Chat Room Layout Design
*   **Milestone Number**: M25
*   **Title**: Chat Room Layout Design
*   **Objective**: Build the visual shell for the chatroom area.
*   **Why this milestone exists**: Standard interface layout for the interview.
*   **Inputs**: M22.
*   **Deliverables**: Main chat containers and message input components in `public/index.html` and `public/style.css`.
*   **Dependencies**: M22.
*   **Success Criteria**: Input box, send button, and chat message panel render correctly.
*   **Estimated Complexity**: Easy.
*   **Recommended Team Member**: Frontend Engineer (FE).
*   **Recommended Git Commit**: `style: create visual structure for the chat room UI`
*   **Definition of Done**:
    *   [ ] Code Compiles
    *   [ ] Linter Passes
    *   [ ] Manual Test Passed
    *   [ ] Documentation Updated
    *   [ ] PROMPTS.md Updated
    *   [ ] Git Commit Created

---

### Milestone 26: Chat Message Bubble & Auto-Scroll Rendering Helper
*   **Milestone Number**: M26
*   **Title**: Chat Message Bubble & Auto-Scroll Rendering Helper
*   **Objective**: Add message bubbles with styles matching user and agent roles.
*   **Why this milestone exists**: Handles message layout and scroll-to-bottom behavior.
*   **Inputs**: M25.
*   **Deliverables**: Dynamic DOM helper functions in `public/app.js`.
*   **Dependencies**: M25.
*   **Success Criteria**: Text bubbles render correctly on the left and right, with automatic scrolling.
*   **Estimated Complexity**: Easy.
*   **Recommended Team Member**: Frontend Engineer (FE).
*   **Recommended Git Commit**: `feat: implement message rendering and scrolling helper functions`
*   **Definition of Done**:
    *   [ ] Code Compiles
    *   [ ] Linter Passes
    *   [ ] Manual Test Passed
    *   [ ] Documentation Updated
    *   [ ] PROMPTS.md Updated
    *   [ ] Git Commit Created

---

### Milestone 27: Chatroom API Connection
*   **Milestone Number**: M27
*   **Title**: Chatroom API Connection
*   **Objective**: Connect the client UI to the backend `/api/interview` endpoint.
*   **Why this milestone exists**: Sends user inputs to the backend and displays the returned questions.
*   **Inputs**: M19, M26.
*   **Deliverables**: Integration handler functions in `public/app.js`.
*   **Dependencies**: M19, M26.
*   **Success Criteria**: Candidate answers are sent to the backend, and the next question displays in the chat.
*   **Estimated Complexity**: Medium.
*   **Recommended Team Member**: Frontend Engineer (FE).
*   **Recommended Git Commit**: `feat: connect chat actions to the interview API endpoint`
*   **Definition of Done**:
    *   [ ] Code Compiles
    *   [ ] Linter Passes
    *   [ ] Manual Test Passed
    *   [ ] Documentation Updated
    *   [ ] PROMPTS.md Updated
    *   [ ] Git Commit Created

---

### Milestone 28: Sidebar Progress & Dynamic Topic Indicator Component
*   **Milestone Number**: M28
*   **Title**: Sidebar Progress & Dynamic Topic Indicator Component
*   **Objective**: Design and connect the status display panel showing the active candidate and assessment progress.
*   **Why this milestone exists**: Provides visual feedback about the interview's progress.
*   **Inputs**: M22, M25.
*   **Deliverables**: Sidebar status component in `public/index.html`.
*   **Dependencies**: M25.
*   **Success Criteria**: Progress bar and question counter update dynamically.
*   **Estimated Complexity**: Easy.
*   **Recommended Team Member**: Frontend Engineer (FE).
*   **Recommended Git Commit**: `style: implement sidebar status and interview progress panels`
*   **Definition of Done**:
    *   [ ] Code Compiles
    *   [ ] Linter Passes
    *   [ ] Manual Test Passed
    *   [ ] Documentation Updated
    *   [ ] PROMPTS.md Updated
    *   [ ] Git Commit Created

---

### Milestone 29: Feedback Dashboard Layout & Custom Scorecards
*   **Milestone Number**: M29
*   **Title**: Feedback Dashboard Layout & Custom Scorecards
*   **Objective**: Build the dashboard container to render the final feedback report card.
*   **Why this milestone exists**: Displays strengths, gaps, and recommendations once the interview is complete.
*   **Inputs**: M22.
*   **Deliverables**: Feedback HTML skeleton and CSS dashboard styles.
*   **Dependencies**: M22.
*   **Success Criteria**: Dashboard panel renders correctly with placeholder data.
*   **Estimated Complexity**: Easy.
*   **Recommended Team Member**: Frontend Engineer (FE).
*   **Recommended Git Commit**: `style: design UI dashboard container for feedback reporting`
*   **Definition of Done**:
    *   [ ] Code Compiles
    *   [ ] Linter Passes
    *   [ ] Manual Test Passed
    *   [ ] Documentation Updated
    *   [ ] PROMPTS.md Updated
    *   [ ] Git Commit Created

---

### Milestone 30: Feedback Integration & Visual Transition
*   **Milestone Number**: M30
*   **Title**: Feedback Integration & Visual Transition
*   **Objective**: Switch the UI to show the feedback dashboard when `done: true` is received.
*   **Why this milestone exists**: Displays the final feedback results when the interview completes.
*   **Inputs**: M20, M29.
*   **Deliverables**: Conditional dashboard renderer code in `public/app.js`.
*   **Dependencies**: M20, M29.
*   **Success Criteria**: Receiving `done: true` hides the chat and displays the feedback dashboard.
*   **Estimated Complexity**: Medium.
*   **Recommended Team Member**: Frontend Engineer (FE).
*   **Recommended Git Commit**: `feat: integrate final feedback dashboard rendering`
*   **Definition of Done**:
    *   [ ] Code Compiles
    *   [ ] Linter Passes
    *   [ ] Manual Test Passed
    *   [ ] Documentation Updated
    *   [ ] PROMPTS.md Updated
    *   [ ] Git Commit Created

---

## Phase F — Polish, Validation & Deployment

### Milestone 31: E2E Automated Integration Test Client Setup
*   **Milestone Number**: M31
*   **Title**: E2E Automated Integration Test Client Setup
*   **Objective**: Create an automated test runner script to simulate a complete interview loop.
*   **Why this milestone exists**: Verifies API compliance and conversational state flows.
*   **Inputs**: `technical-spec.md`, M20.
*   **Deliverables**: `test_api.js`.
*   **Dependencies**: M20.
*   **Success Criteria**: Script can boot, make API calls, and track test runs.
*   **Estimated Complexity**: Medium.
*   **Recommended Team Member**: QA & DevOps Engineer (DE).
*   **Recommended Git Commit**: `test: create automated API testing client script`
*   **Definition of Done**:
    *   [ ] Code Compiles
    *   [ ] Linter Passes
    *   [ ] Manual Test Passed
    *   [ ] Documentation Updated
    *   [ ] PROMPTS.md Updated
    *   [ ] Git Commit Created

---

### Milestone 32: Run Integration Tests & Fix State/Parsing Bugs
*   **Milestone Number**: M32
*   **Title**: Run Integration Tests & Fix State/Parsing Bugs
*   **Objective**: Run the integration tests and verify that the 8-question limit and final feedback output match the technical spec.
*   **Why this milestone exists**: Validates API integration and schema correctness.
*   **Inputs**: M31.
*   **Deliverables**: Execution of `node test_api.js` and fixes for any issues found.
*   **Dependencies**: M31.
*   **Success Criteria**: Tests run successfully, confirming the API returns the correct response schema.
*   **Estimated Complexity**: Medium.
*   **Recommended Team Member**: QA & DevOps Engineer (DE).
*   **Recommended Git Commit**: `test: execute integration tests and verify endpoint responses`
*   **Definition of Done**:
    *   [ ] Code Compiles
    *   [ ] Linter Passes
    *   [ ] Manual Test Passed
    *   [ ] Documentation Updated
    *   [ ] PROMPTS.md Updated
    *   [ ] Git Commit Created

---

### Milestone 33: Prompt Refinement & System Prompt V2 Compilation
*   **Milestone Number**: M33
*   **Title**: Prompt Refinement & System Prompt V2 Compilation
*   **Objective**: Address conversation quality and safety weaknesses discovered during testing.
*   **Why this milestone exists**: Refines prompt instructions based on test results.
*   **Inputs**: M14, M32.
*   **Deliverables**: System Prompt V2 integration in `src/services/promptBuilders/SystemPromptBuilder.js`.
*   **Dependencies**: M32.
*   **Success Criteria**: Conversations under V2 templates show improved relevance and grading accuracy.
*   **Estimated Complexity**: Medium.
*   **Recommended Team Member**: Lead Architect (LA).
*   **Recommended Git Commit**: `perf: compile system prompt v2 and refine grading templates`
*   **Definition of Done**:
    *   [ ] Code Compiles
    *   [ ] Linter Passes
    *   [ ] Manual Test Passed
    *   [ ] Documentation Updated
    *   [ ] PROMPTS.md Updated
    *   [ ] Git Commit Created

---

### Milestone 34: Docker Containerization Configuration & Local Boot
*   **Milestone Number**: M34
*   **Title**: Docker Containerization Configuration & Local Boot
*   **Objective**: Write the Dockerfile and configure container ignore patterns.
*   **Why this milestone exists**: Standardizes the application environment for hosting.
*   **Inputs**: M17.
*   **Deliverables**: `Dockerfile` and `.dockerignore`.
*   **Dependencies**: M17.
*   **Success Criteria**: The application compiles and runs inside a Docker container.
*   **Estimated Complexity**: Easy.
*   **Recommended Team Member**: QA & DevOps Engineer (DE).
*   **Recommended Git Commit**: `chore: create Dockerfile and configure container settings`
*   **Definition of Done**:
    *   [ ] Code Compiles
    *   [ ] Linter Passes
    *   [ ] Manual Test Passed
    *   [ ] Documentation Updated
    *   [ ] PROMPTS.md Updated
    *   [ ] Git Commit Created

---

### Milestone 35: Final Manual Walkthrough & Visual Layout QA
*   **Milestone Number**: M35
*   **Title**: Final Manual Walkthrough & Visual Layout QA
*   **Objective**: Perform manual testing to verify candidate selection, chat flows, and feedback rendering.
*   **Why this milestone exists**: Confirms frontend and backend interactions work correctly.
*   **Inputs**: M30, M34.
*   **Deliverables**: Bug fixes for frontend layouts and chat animations.
*   **Dependencies**: M30, M34.
*   **Success Criteria**: Complete interview flows are verified manually.
*   **Estimated Complexity**: Easy.
*   **Recommended Team Member**: Frontend Engineer (FE).
*   **Recommended Git Commit**: `style: resolve visual issues and complete QA review`
*   **Definition of Done**:
    *   [ ] Code Compiles
    *   [ ] Linter Passes
    *   [ ] Manual Test Passed
    *   [ ] Documentation Updated
    *   [ ] PROMPTS.md Updated
    *   [ ] Git Commit Created

---

### Milestone 36: AI Usage Log Consolidation & README Finalization
*   **Milestone Number**: M36
*   **Title**: AI Usage Log Consolidation & README Finalization
*   **Objective**: Finalize the repository documentation and double-check submission rules.
*   **Why this milestone exists**: Verifies compliance with Stage 1 rules (AI log, working demo links).
*   **Inputs**: M01, M35.
*   **Deliverables**: `README.md` and consolidated `PROMPTS/PROMPTS.md`.
*   **Dependencies**: M35.
*   **Success Criteria**: Repository is ready for submission.
*   **Estimated Complexity**: Easy.
*   **Recommended Team Member**: QA & DevOps Engineer (DE).
*   **Recommended Git Commit**: `docs: compile final README and AI log for submission`
*   **Definition of Done**:
    *   [ ] Code Compiles
    *   [ ] Linter Passes
    *   [ ] Manual Test Passed
    *   [ ] Documentation Updated
    *   [ ] PROMPTS.md Updated
    *   [ ] Git Commit Created

---
