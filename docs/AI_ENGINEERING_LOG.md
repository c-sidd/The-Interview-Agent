# AI Collaboration & Engineering Log

## AI Usage Philosophy

This repository was developed using an AI-assisted engineering workflow. 

AI was treated as a collaborative development assistant rather than an autonomous code generator. All architectural decisions, implementation validation, integration, debugging, testing, and final acceptance remained under human supervision.

This log is written as an **Engineering Journal**. It records the step-by-step evolution of design decisions, considered trade-offs, and human choices. Its purpose is to allow both human reviewers and AI-based repository analysis tools to reconstruct the complete development lifecycle.

---

## Log Entry Template

Every development milestone completed with AI assistance must add an entry to this log using the following template:

```markdown
## Entry [Milestone Number]

*   **Milestone**: `MXX` (e.g., M07 - Database & Session Schema Specification)
*   **Date**: YYYY-MM-DD
*   **Time**: HH:MM:SS
*   **Current Branch**: `feature/XYZ`

### Problem
[Describe the technical problem or feature request for this milestone]

### Why This Problem Matters
[Explain the business, product, or architectural impact of the problem]

### Possible Approaches Considered
1.  **Option A**: [Describe first approach, list pros/cons]
2.  **Option B**: [Describe second approach, list pros/cons]

### Chosen Solution
[Describe the selected design path]

### Why This Solution Was Selected
[Provide the architectural reasoning for this choice]

### AI Collaboration
[Explain how the AI assistant contributed (e.g., brainstorming modular schemas, generating SDK boilerplate, suggesting linter fixes)]

### Human Engineering Decisions
*   **Decisions Made**: [Detail what you chose to implement]
*   **Decisions Rejected**: [Detail what suggestions you rejected and why]
*   **Manual Refinements**: [Detail manual edits made to AI-suggested code]

### Files Modified
*   `relative/path/to/file1.js`
*   `relative/path/to/file2.js`

### Git Commit
`[Commit Hash / Tag]` (e.g., `feat: implement session database schema`)
```

---

## Entry M04

*   **Milestone**: `M04`
*   **Date**: 2026-08-08
*   **Time**: 13:02:00
*   **Current Branch**: `main`

### Problem
Initialize version control for the project repository and prevent sensitive files (like API keys) and vendor libraries from being tracked in source control.

### Why This Problem Matters
A clean, secure repository is vital for a collaborative hackathon. Accidentally committing API keys leads to security breaches, and tracking `node_modules` causes repository bloat and dependency mismatch errors on other developer environments.

### Possible Approaches Considered
1.  **Option A**: Standard generic Node.js `.gitignore` template.
2.  **Option B**: Targeted `.gitignore` template specifically ignoring local keys (`.env`), package modules (`node_modules`), workspace specific files, and local logs.

### Chosen Solution
Option B: Created a targeted `.gitignore` file and initialized a local Git repository in the project root.

### Why This Solution Was Selected
Provides a secure environment, preventing secret leakages, and keeps repository footprint small and relevant to the codebase.

### AI Collaboration
AI assistant drafted the `.gitignore` file structure, listing the standard exclusions for Express applications, local environment configurations, and log files.

### Human Engineering Decisions
*   **Decisions Made**: Excluded the `.env` file explicitly, since API keys must be kept private.
*   **Decisions Rejected**: None.
*   **Manual Refinements**: Added IDE-specific configurations to make local development across different platforms robust.

### Files Modified
*   `.gitignore`

### Git Commit
`chore: initialize repository, add gitignore and project structure`

---

## Entry M05

*   **Milestone**: `M05`
*   **Date**: 2026-08-08
*   **Time**: 13:05:00
*   **Current Branch**: `main`

### Problem
Design and document the system's runtime architecture, request flows, session lifecycles, and folder layouts to align development.

### Why This Problem Matters
Without formal sequence and lifecycle designs, multi-developer teams can lose track of session states, route connections, and boundary systems. This leads to spaghetti code and integration issues.

### Possible Approaches Considered
1.  **Option A**: Write text-only architectural descriptions.
2.  **Option B**: Create visual sequence charts, state diagrams, and detailed folder maps using standard markdown diagrams (Mermaid blocks).

### Chosen Solution
Option B: Created `docs/SYSTEM_ARCHITECTURE.md` to map out the request lifecycle, state machine, data flows, and directory hierarchies.

### Why This Solution Was Selected
Visual sequence diagrams provide a clear layout of the runtime environment that can be understood by developers and AI-based repository analysis tools alike.

### AI Collaboration
AI assistant drafted the Mermaid markup blocks for the sequence flow, session lifecycle states, and data paths.

### Human Engineering Decisions
*   **Decisions Made**: Refined the request flow chart to guarantee that Turn 0 (Session initialization) returns a static welcome message immediately without querying Gemini, reducing latency.
*   **Decisions Rejected**: Rejected adding complex vector search pathways since dynamic prompt context injection is selected.
*   **Manual Refinements**: Adjusted database layout names and service labels to match the finalized folder structure.

### Files Modified
*   `docs/SYSTEM_ARCHITECTURE.md`

### Git Commit
`docs: outline system architecture, data flows, and folder layouts`

---

## Entry M06

*   **Milestone**: `M06`
*   **Date**: 2026-08-08
*   **Time**: 13:08:00
*   **Current Branch**: `main`

### Problem
Establish the design specifications of the core Interview Engine, including request processing pipelines, state updates, LLM calling procedures, and service layers.

### Why This Problem Matters
The Interview Engine is the core intelligence of the application. Having a clear plan for how requests are coordinated prevents business logic from leaking into API routes, ensuring the codebase is modular.

### Possible Approaches Considered
1.  **Option A**: Integrate all coordination inside a monolithic Express router handler.
2.  **Option B**: Decouple routing, prompt generation, LLM calls, and state management into a clean Controller-Service architecture.

### Chosen Solution
Option B: Created `docs/INTERVIEW_ENGINE_DESIGN.md` to define the modular architecture, pipeline coordinates, and service responsibilities.

### Why This Solution Was Selected
Provides a future-proof, decoupled layer that is easy to extend. This structure prepares the team to handle fast feature requests during the 20-minute Live Steer Challenge.

### AI Collaboration
AI assistant helped structure the pipeline steps and outline the service boundaries (Curriculum, Session, LLM, Prompt, and Feedback services).

### Human Engineering Decisions
*   **Decisions Made**: Segregated the `PromptService` into four specific prompt builders (System, Interview, FollowUp, Feedback) instead of a single builder class.
*   **Decisions Rejected**: Rejected placing state persistence logic inside the controller.
*   **Manual Refinements**: Refined the method signatures for `InterviewService.handleRequest` to handle session initialization and dialog turns cleanly.

### Files Modified
*   `docs/INTERVIEW_ENGINE_DESIGN.md`

### Git Commit
`docs: design interview engine request processing pipeline`

---

## Entry M07

*   **Milestone**: `M07`
*   **Date**: 2026-08-08
*   **Time**: 13:11:00
*   **Current Branch**: `main`

### Problem
Define the session variables, dialogue history schemas, active topic counters, and transition conditions required for managing stateful interviews.

### Why This Problem Matters
HTTP is stateless, meaning the backend has to reconstruct the session state on every turn using `sessionId`. Having a clear schema prevents database model errors.

### Possible Approaches Considered
1.  **Option A**: Store only the dialogue history array and ask the LLM to count questions and decide what topics to cover dynamically.
2.  **Option B**: Enforce structured properties (questionCount, selectedDays, currentDayIndex, currentDayTurn) in session state to guarantee strict compliance with curriculum rules and question limits.

### Chosen Solution
Option B: Created `docs/SESSION_SCHEMA.md` defining session properties and state transitions.

### Why This Solution Was Selected
Explicit session variables prevent prompt drift and guarantee that exactly 8 questions are asked across 4 curriculum days (2 questions per day).

### AI Collaboration
AI assistant drafted the state model properties and formatted the transition table.

### Human Engineering Decisions
*   **Decisions Made**: Added `createdAt` and `lastActive` timestamps to support automatic session timeout cleanups on the server.
*   **Decisions Rejected**: Rejected saving the session to a file database (like SQLite), choosing an in-memory Map instead to minimize latency.
*   **Manual Refinements**: Refined the transition layout to show step-by-step changes from Turn 0 (Session Initialization) to Turn 9 (Feedback Compilation).

### Files Modified
*   `docs/SESSION_SCHEMA.md`

### Git Commit
`docs: specify session schema and state structures`

---

## Entry M08

*   **Milestone**: `M08`
*   **Date**: 2026-08-08
*   **Time**: 13:13:00
*   **Current Branch**: `main`

### Problem
Design the LLM prompt instructions for the system persona, topic-specific initial questions, and context-aware follow-ups to ensure the interviewer acts consistently.

### Why This Problem Matters
Without strict boundaries, LLMs tend to drift (e.g., repeating the same question, agreeing with wrong answers, or breaking character under prompt injection). Establishing base prompts early defines the system's logic.

### Possible Approaches Considered
1.  **Option A**: Use a single monolithic prompt describing all curriculum days and rules.
2.  **Option B**: Segregate the prompting engine into dedicated templates (System, Interview, and FollowUp prompt builders) loaded dynamically by a coordinator service.

### Chosen Solution
Option B: Created `docs/PROMPT_DESIGNS.md` to specify the baseline prompt layouts for System, Interview, and FollowUp builders.

### Why This Solution Was Selected
Segregated prompt builders keep prompt templates small, readable, and easy to optimize in isolation.

### AI Collaboration
AI assistant drafted the templates and helped formalize the variables (`candidateRole`, `commitDays`, etc.) to match the candidate JSON files.

### Human Engineering Decisions
*   **Decisions Made**: Explicitly banned standard conversational praise (like "Great job!", "Correct!") in the system guidelines to keep the interviewer objective and professional.
*   **Decisions Rejected**: Rejected letting the LLM decide which day to assess, keeping day selection controlled by the backend code.
*   **Manual Refinements**: Refined the Follow-up Prompt template to force the LLM to address vague or incomplete answers before transitioning topics.

### Files Modified
*   `docs/PROMPT_DESIGNS.md`

### Git Commit
`docs: design segregated prompt templates for system, interview, and follow-ups`

---

## Entry M09

*   **Milestone**: `M09`
*   **Date**: 2026-08-08
*   **Time**: 13:16:00
*   **Current Branch**: `main`

### Problem
Design the prompt instructions for compiling candidate feedback to ensure the LLM returns structured JSON data matching the required schema (summary, strengths, gaps, next steps) without formatting errors.

### Why This Problem Matters
If the LLM outputs natural language explanation wrappers or incorrect JSON keys, the JSON parsing on the backend server will fail, resulting in a HTTP 500 crash on the final interview turn.

### Possible Approaches Considered
1.  **Option A**: Request plain text evaluation from the LLM and use regex selectors to split fields.
2.  **Option B**: Enforce a strict JSON output instruction in the prompt, providing an example schema, and instructing the LLM to output only raw JSON.

### Chosen Solution
Option B: Added the `FeedbackPromptBuilder` specs to `docs/PROMPT_DESIGNS.md` to guide the LLM to output a valid JSON payload.

### Why This Solution Was Selected
Provides a reliable way to map dialogue performance directly to the database API contract.

### AI Collaboration
AI assistant helped format the JSON schema and detail the specific instructions for parsing dialogue histories.

### Human Engineering Decisions
*   **Decisions Made**: Explicitly instructed the LLM to exclude markdown formatting fences (e.g., ````json ... ````) to prevent JSON parsing issues.
*   **Decisions Rejected**: Rejected parsing intermediate feedback, keeping grading concentrated on the final turn to save tokens and costs.
*   **Manual Refinements**: Refined validation rules to require at least two distinct points for strengths, gaps, and recommendations.

### Files Modified
*   `docs/PROMPT_DESIGNS.md`

### Git Commit
`docs: design feedback prompt evaluation schemas`

---

## Entry M10

*   **Milestone**: `M10`
*   **Date**: 2026-08-08
*   **Time**: 13:31:00
*   **Current Branch**: `main`

### Problem
Build the data parsing and topic selection system responsible for reading synthetic curriculum and candidate profile structures, and selecting candidate-specific target days.

### Why This Problem Matters
The AI agent must evaluate candidates dynamically based on their specific curriculum days. We need a clean, structured parser that maps completed, failed, or skipped milestones to day records and selects appropriate target days.

### Possible Approaches Considered
1.  **Option A**: Reload candidate/curriculum JSON files from disk on every single HTTP conversational turn.
2.  **Option B**: Read data files once on module instantiation and cache the parsed structures in memory to reduce server latency.

### Chosen Solution
Option B: Created `src/services/CurriculumService.js` to cache candidate/curriculum properties and expose lookup methods.

### Why This Solution Was Selected
In-memory caching of static metadata reduces file system I/O latency, making the application faster.

### AI Collaboration
AI assistant drafted the JSON file loading and object parsing boilerplate.

### Human Engineering Decisions
*   **Decisions Made**: Designed a targeted topic-selection algorithm that extracts exactly:
    *   1 day they passed on the first try (assessment of strength).
    *   1 day they struggled with (attempts > 1 or passed = false).
    *   1 day they skipped.
    *   1 core/capstone day.
*   **Decisions Rejected**: None.
*   **Manual Refinements**: Added a robust fallback loop using a `Set` to ensure that if a candidate has no skipped or struggled days (e.g. Emily Chen), the algorithm still selects 4 unique curriculum days from available completed records.

### Files Created
*   `src/services/CurriculumService.js`

### Verification & Testing
Created a temporary test harness (`test_curriculum.js`) to load profiles and verify day picks. Confirmed that candidate CAND-001 (Sarah Johnson) and CAND-003 (Emily Chen) both result in 4 unique selected days, and that files are loaded successfully.

### Git Commit
`feat: implement curriculum service module`

---

## Entry M11

*   **Milestone**: `M11`
*   **Date**: 2026-08-08
*   **Time**: 13:34:00
*   **Current Branch**: `main`

### Problem
Build the session state caching layer to store active interview states (history, counts, selected days) dynamically and clean up expired records to prevent memory leaks.

### Why This Problem Matters
HTTP transactions are stateless. We must cache conversational records in memory matching the provided `sessionId`. A garbage collector is required to release memory once candidate interviews complete or sessions become inactive.

### Possible Approaches Considered
1.  **Option A**: Save session files to a local database (e.g. SQLite).
2.  **Option B**: Store session objects in an in-memory Map structure, using a periodic garbage-collection check.

### Chosen Solution
Option B: Created `src/services/SessionService.js` using an in-memory Map and configuring a background `setInterval` interval cleaner.

### Why This Solution Was Selected
In-memory Maps are fast, require no database installation, and reduce request latency.

### AI Collaboration
AI assistant drafted the CRUD operations on the Map structure and the standard interval function template.

### Human Engineering Decisions
*   **Decisions Made**: Configured `unref()` on the background interval timer to prevent it from holding the Node.js process open if the server is shutting down.
*   **Decisions Rejected**: None.
*   **Manual Refinements**: Exposed a manual `cleanupExpired()` helper to make automated validation tests reliable without waiting for the 5-minute interval trigger.

### Files Created
*   `src/services/SessionService.js`

### Verification & Testing
Created a temporary test script (`test_session.js`) to create, update, and manually expire sessions. Verified that garbage collection successfully clears records.

### Git Commit
`feat: implement session service module for state caching`

---

## Entry M12

*   **Milestone**: `M12`
*   **Date**: 2026-08-08
*   **Time**: 13:51:00
*   **Current Branch**: `main`

### Problem
Build the prompt engineering layer, separating the instructions for the system persona, curriculum-aligned questions, follow-up questions, and evaluation templates into segregated builders to support easy prompt evolution.

### Why This Problem Matters
A single monolithic prompt is difficult to scale, test, and tune. Dividing prompts into specialized classes allows the team to modify specific prompt instructions (e.g., tweaking the feedback JSON schema) without affecting system personas or dialogue handlers.

### Possible Approaches Considered
1.  **Option A**: Store all prompt strings inside the API controller or as global variables in a config file.
2.  **Option B**: Build a modular prompt service that loads specialized builder classes (System, Interview, FollowUp, Feedback) dynamically.

### Chosen Solution
Option B: Created `src/services/PromptService.js` and the prompt builders inside `src/services/promptBuilders/` to handle specific stages of the interview.

### Why This Solution Was Selected
Maintains clean separation of concerns, keeps logic testable in isolation, and allows us to switch from System Prompt V1 to V2 quickly during the Live Steer Challenge.

### AI Collaboration
AI assistant helped generate the class skeletons and property mapping logic for the five classes.

### Human Engineering Decisions
*   **Decisions Made**: Configured all prompt builders as stateless, static classes to eliminate instance overhead and ensure thread safety.
*   **Decisions Rejected**: Rejected embedding LLM SDK execution code inside prompt builders, keeping them strictly focused on prompt composition.
*   **Manual Refinements**: Configured the `FollowUpPromptBuilder` to format history turns clearly as "Interviewer" vs. "Candidate" dialogue records.

### Files Created
*   `src/services/PromptService.js`
*   `src/services/promptBuilders/SystemPromptBuilder.js`
*   `src/services/promptBuilders/InterviewPromptBuilder.js`
*   `src/services/promptBuilders/FollowUpPromptBuilder.js`
*   `src/services/promptBuilders/FeedbackPromptBuilder.js`

### Verification & Testing
Created a temporary test script (`test_prompt.js`) to compile prompts for turn 1, turn 2, and the final grading turn. Confirmed candidate and curriculum properties are mapped correctly.

### Git Commit
`feat: implement segregated prompt service and builder sub-classes`

---

## Entry M13

*   **Milestone**: `M13`
*   **Date**: 2026-08-08
*   **Time**: 14:07:00
*   **Current Branch**: `main`

### Problem
Build the LLM wrapper service responsible for connecting to the Google Generative AI SDK, checking API configurations, and providing a robust mock fallback for offline validation.

### Why This Problem Matters
If the server makes direct calls to Gemini, it depends entirely on network connections, API limits, and valid credentials. A mock fallback allows development and automated testing to continue offline when the keys are missing or the API limits are exceeded.

### Possible Approaches Considered
1.  **Option A**: Write raw Gemini API SDK calls inside the routing layer, returning standard HTTP errors if keys are missing.
2.  **Option B**: Build a unified wrapper `src/services/LLMService.js` that checks for environmental variables and defaults to a local mock generator if no key is present.

### Chosen Solution
Option B: Implemented the `LLMService` class with a mock responder fallback.

### Why This Solution Was Selected
Maintains the provider-agnostic abstraction pattern and ensures that the application remains fully testable without active API keys.

### AI Collaboration
AI assistant helped write the Gemini SDK `getGenerativeModel` initialization and generated mock interview response templates.

### Human Engineering Decisions
*   **Decisions Made**: Configured the mock feedback responder to output valid JSON matching the target schema, preventing JSON parsing crashes.
*   **Decisions Rejected**: Rejected incorporating multiple cloud API providers (GPT/Claude) in the initial code to keep dependencies minimal, relying on the environment configuration to swap them out.
*   **Manual Refinements**: Sanitized the returned LLM string responses using `.trim()` to remove leading/trailing whitespaces.

### Files Created
*   `src/services/LLMService.js`

### Verification & Testing
Created a temporary test script (`test_llm.js`) and verified that under `mock` mode the service returns realistic questions for Day 1, 10, 22, and 28, and generates valid JSON feedback reports.

### Git Commit
`feat: implement LLM service client wrapper with mock fallback`

---

## Entry M14

*   **Milestone**: `M14`
*   **Date**: 2026-08-08
*   **Time**: 14:09:00
*   **Current Branch**: `main`

### Problem
Build an offline simulation framework to run full conversational loops, testing how the System Prompt, Curriculum Questions, and Evaluation Prompts are compiled and parsed before launching the HTTP server.

### Why This Problem Matters
Testing prompt engineering manually by copying/pasting strings is slow and prone to human error. Programmatically running full dialogue turns offline lets developers catch syntax mismatches, missing fields, or API response errors early.

### Possible Approaches Considered
1.  **Option A**: Conduct manual prompt testing inside Google AI Studio.
2.  **Option B**: Create a dedicated node script `src/services/test_prompts.js` that coordinates Curriculum, Prompt, and LLM services to run offline multi-turn simulations automatically.

### Chosen Solution
Option B: Created `src/services/test_prompts.js` to simulate conversational loops and parse prompt outputs.

### Why This Solution Was Selected
Provides a repeatable verification method, validating that all components work together correctly.

### AI Collaboration
AI assistant drafted the test orchestrator outline and simulated candidate answers.

### Human Engineering Decisions
*   **Decisions Made**: Configured the simulation to use candidate CAND-001 (Sarah Johnson), as her Senior Data Engineer status tests the experience-level conditional prompts.
*   **Decisions Rejected**: None.
*   **Manual Refinements**: Added try/catch JSON parsing checks on the mock evaluation outputs to ensure it parses successfully.

### Files Created
*   `src/services/test_prompts.js`

### Verification & Testing
Ran `node src/services/test_prompts.js` in the project root. Confirmed that selected days, system prompts, initial/follow-up questions, and final evaluations parse and execute correctly.

### Git Commit
`test: add offline prompt simulation and validation test script`

---

## Entry M15

*   **Milestone**: `M15`
*   **Date**: 2026-08-08
*   **Time**: 14:15:00
*   **Current Branch**: `main`

### Problem
Build the feedback parser and grading service responsible for invoking final evaluations, stripping Markdown fences, verifying structural keys, and mapping responses to JSON.

### Why This Problem Matters
The final turn of the interview requires returning a structured JSON feedback payload to the client. Because LLMs sometimes wrap JSON outputs in markdown fences (like `\`\`\`json ... \`\`\`) or include conversational text, a direct `JSON.parse` can fail, causing the server to crash.

### Possible Approaches Considered
1.  **Option A**: Run a simple `JSON.parse` directly on the raw text and return a 500 error if it fails.
2.  **Option B**: Clean markdown block formatting, use regular expressions to locate the JSON block as a fallback, and enforce array schemas for safety.

### Chosen Solution
Option B: Created `src/services/FeedbackService.js` to process and sanitize LLM feedback responses.

### Why This Solution Was Selected
Provides a crash-proof parser that can handle raw LLM text and fall back to structured reports if necessary.

### AI Collaboration
AI assistant drafted the regex block filter and the basic schema validator keys check.

### Human Engineering Decisions
*   **Decisions Made**: Added a schema validation wrapper that forces the fields `strengths`, `gaps`, and `next` to parse as array structures.
*   **Decisions Rejected**: None.
*   **Manual Refinements**: Configured a `getDefaultFeedback` method that returns a clean, realistic evaluation block if the parser fails.

### Files Created
*   `src/services/FeedbackService.js`

### Verification & Testing
Created a temporary test script (`test_feedback.js`) and verified that the service correctly strips markdown fences, catches parsing failures, and resolves default evaluations.

### Git Commit
`feat: implement feedback service for structured evaluation parsing`

---

## Entry M16

*   **Milestone**: `M16`
*   **Date**: 2026-08-08
*   **Time**: 14:19:00
*   **Current Branch**: `main`

### Problem
Build the core orchestrator service `src/services/InterviewService.js` that coordinates session state caching, candidate day selection, prompt compilation, LLM execution, and grading triggers.

### Why This Problem Matters
The Interview Service is the core coordination pipeline of the application. Keeping it decoupled from Express routing ensures that we can write automated simulation tests, run offline, and swap out endpoints without changing interview mechanics.

### Possible Approaches Considered
1.  **Option A**: Manage session loading, prompt construction, LLM requests, and evaluation triggers directly inside route handlers.
2.  **Option B**: Build a unified coordinator service that exposes a single `handleRequest` interface for all turn-based requests.

### Chosen Solution
Option B: Implemented the `InterviewService` class as the centralized system coordinator.

### Why This Solution Was Selected
Provides a clean, modular structure where the API controller only serves as a thin wrapper.

### AI Collaboration
AI assistant drafted the dialogue turn state machine skeleton and transition logic checks.

### Human Engineering Decisions
*   **Decisions Made**: Configured Turn 0 initialization to bypass LLM queries entirely, saving API cost and latency. The actual questioning loop begins on the candidate's first response (Turn 1).
*   **Decisions Rejected**: Rejected saving dialog transcripts to local text logs to keep system file output footprint small.
*   **Manual Refinements**: Enforced strict validation checks to return descriptive help instructions if active session lookups fail.

### Files Created
*   `src/services/InterviewService.js`

### Verification & Testing
Created a temporary test script (`test_interview.js`) running a complete 9-turn interview sequence from start to finish. Verified correct question count tracking, topic transitions, and final feedback generation.

### Git Commit
`feat: implement interview service coordinator module`

---

## Entry M17

*   **Milestone**: `M17`
*   **Date**: 2026-08-08
*   **Time**: 14:22:00
*   **Current Branch**: `main`

### Problem
Build the server entry point loader responsible for booting Express, configuring security and parsing middlewares, and loading environmental configurations.

### Why This Problem Matters
The application requires a listener layer to parse client requests, serve static assets (like CSS and JavaScript pages), and map API calls. 

### Possible Approaches Considered
1.  **Option A**: Launch routes and services from separate scripts.
2.  **Option B**: Create a single application loader `server.js` that handles config parsing, service instantiation, middleware integration, and listener boots.

### Chosen Solution
Option B: Programmed the application entry point in `server.js`.

### Why This Solution Was Selected
Provides a consolidated layout where the server lifecycle is managed in one file.

### AI Collaboration
AI assistant drafted the Express middleware settings, CORS integration, and server logging format.

### Human Engineering Decisions
*   **Decisions Made**: Attached service singletons directly to the Express context via `app.set('interviewService', ...)` to avoid namespace pollution and share class instances with controllers.
*   **Decisions Rejected**: None.
*   **Manual Refinements**: Configured a `/api/health` status route to allow automated deployment checks to verify the server state.

### Files Created
*   `server.js`

### Verification & Testing
Ensured that the file executes without syntax or load errors. Final testing will be conducted once routes are mounted.

### Git Commit
`feat: configure express server and service initializations`

---

## Entry M18

*   **Milestone**: `M18`
*   **Date**: 2026-08-08
*   **Time**: 14:25:00
*   **Current Branch**: `main`

### Problem
Build the HTTP router handler to validate payload schemas, parse body properties, clean variables, and delegate traffic to the InterviewService.

### Why This Problem Matters
API endpoints are vulnerable to invalid structures, missing variables, and garbage payloads. Enforcing boundaries at the entry layer protects downstream AI services from execution failures and runtime crashes.

### Possible Approaches Considered
1.  **Option A**: Forward request body directly to the services and capture thrown exceptions.
2.  **Option B**: Validate the parameters (checking types, formats, and required inputs) in a dedicated controller layer before calling any services.

### Chosen Solution
Option B: Created `src/controllers/InterviewController.js` to serve as a sanitizing layer.

### Why This Solution Was Selected
Validating requests early allows the system to return immediate HTTP 400 Bad Request status codes for missing variables, saving server CPU cycles.

### AI Collaboration
AI assistant drafted the controller class skeleton and the standard try/catch request handling pattern.

### Human Engineering Decisions
*   **Decisions Made**: Added a check requiring at least one of `candidate` (for Turn 0 initialization) or `message` (for conversational turns) to be present.
*   **Decisions Rejected**: Rejected incorporating regex validators for candidate names to keep the validation simple and fast.
*   **Manual Refinements**: Trimmed whitespace from strings like `sessionId` and `message` to clean up incoming payloads.

### Files Created
*   `src/controllers/InterviewController.js`

### Verification & Testing
Validated that the controller handles missing session IDs and returns appropriate status codes. Full integration testing will be run once the route is mounted.

### Git Commit
`feat: implement interview controller with input validation`

---

## Entry M19

*   **Milestone**: `M19`
*   **Date**: 2026-08-08
*   **Time**: 14:28:00
*   **Current Branch**: `main`

### Problem
Map the REST endpoints (specifically `POST /api/interview`) to the Express routing controller pipeline and mount it within the application routing tree.

### Why This Problem Matters
Binds the HTTP route configurations to the active controller instances. Having a dedicated routes module separates endpoint declarations from boot loaders.

### Possible Approaches Considered
1.  **Option A**: Define route endpoints directly in `server.js`.
2.  **Option B**: Create a dedicated `src/routes/interviewRoutes.js` file and mount it in `server.js` using middleware pipelines.

### Chosen Solution
Option B: Created `src/routes/interviewRoutes.js` and mounted it under `/api` in `server.js`.

### Why This Solution Was Selected
Separates server boot orchestration from API route configurations, improving code structure.

### AI Collaboration
AI assistant drafted the router setup imports and export conventions.

### Human Engineering Decisions
*   **Decisions Made**: Configured the route handler to dynamically instantiate the controller using the shared service cached on the app object context (`req.app.get('interviewService')`).
*   **Decisions Rejected**: Rejected hardcoding service instances inside routers, preventing dependency injection issues.
*   **Manual Refinements**: Mounts the endpoints cleanly under `/api/interview`.

### Files Created or Modified
*   `src/routes/interviewRoutes.js`
*   `server.js`

### Verification & Testing
Ensured the router imports compile cleanly and the server boots without module resolution issues.

### Git Commit
`feat: mount interview routes to Express application`

---

## Entry M20

*   **Milestone**: `M20`
*   **Date**: 2026-08-08
*   **Time**: 14:31:00
*   **Current Branch**: `main`

### Problem
Verify that the Express server boots cleanly, binds to the designated port, and handles incoming HTTP requests on `/api/health` and `/api/interview`.

### Why This Problem Matters
Unit tests mock individual service functions, but integration tests verify that the network routing interfaces, body parsing middleware, and controller variables map together correctly.

### Possible Approaches Considered
1.  **Option A**: Run the server and manually issue curl requests in a separate terminal.
2.  **Option B**: Create an automated integration test script `test_api.js` that boots the server, makes HTTP requests using the native node `http` package, asserts status codes and response bodies, and closes the server.

### Chosen Solution
Option B: Created and executed the integration test script `test_api.js`.

### Why This Solution Was Selected
Provides a repeatable, self-contained test runner that cleans up after itself, preventing port binding locks.

### AI Collaboration
AI assistant drafted the HTTP client request wrappers for POST and GET requests.

### Human Engineering Decisions
*   **Decisions Made**: Configured the script to automatically close the Express listener via `server.close()` upon test completion to ensure the testing process terminates cleanly.
*   **Decisions Rejected**: None.
*   **Manual Refinements**: Added validation assertions that check the status code for missing request variables.

### Files Created or Modified
*   `test_api.js`

### Verification & Testing
Executed `node test_api.js`. The test successfully completed all asserts:
*   `GET /api/health` responds with HTTP 200 OK.
*   `POST /api/interview` (Turn 0 Initial) responds with HTTP 200 Welcome.
*   `POST /api/interview` (Invalid payload) responds with HTTP 400 Bad Request.

### Git Commit
`test: implement server integration tests for health and initial turns`

---

## Entry M21

*   **Milestone**: `M21`
*   **Date**: 2026-08-08
*   **Time**: 14:34:00
*   **Current Branch**: `main`

### Problem
Test the application's resilience to API edge cases (e.g., missing parameter structures, blank strings, non-existent session lookups, and prompt injection attempts) before starting frontend development.

### Why This Problem Matters
If the API endpoints fail to handle blank replies or non-existent session IDs, the server can crash or output raw errors, exposing vulnerabilities.

### Possible Approaches Considered
1.  **Option A**: Conduct manual prompt injection testing using tools like Postman.
2.  **Option B**: Create an automated, scriptable edge-case runner `test_edge_cases.js` that tests specific payloads and asserts expected error fields.

### Chosen Solution
Option B: Created and executed the edge-case test suite `test_edge_cases.js`.

### Why This Solution Was Selected
Provides a repeatable verification method, verifying that the controller validations and service safety layers block injection threats.

### AI Collaboration
AI assistant drafted simulated prompt injection messages.

### Human Engineering Decisions
*   **Decisions Made**: Assured that non-existent session lookups return a user-friendly instruction JSON payload rather than crashing the request controller.
*   **Decisions Rejected**: None.
*   **Manual Refinements**: Verified that empty strings (e.g., `"   "`) are caught, trimmed, and processed cleanly.

### Files Created or Modified
*   `test_edge_cases.js`

### Verification & Testing
Ran `node test_edge_cases.js`. The test successfully completed all asserts, verifying:
*   Missing `sessionId` returns HTTP 400.
*   Non-existent `sessionId` returns user-friendly help text.
*   Blank messages are handled gracefully.
*   Prompt injections do not alter the system prompt rules.

### Git Commit
`test: implement edge case and prompt injection test runner`

---

## Entry M22-M30

*   **Milestone**: `M22-M30`
*   **Date**: 2026-08-08
*   **Time**: 14:45:00
*   **Current Branch**: `main`

### Problem
Implement a premium, responsive Single Page Application (SPA) frontend that enables users to select candidates, conduct real-time mock interviews with turn counts and active topic displays, and review grading reports.

### Why This Problem Matters
A command-line or headless interface is fine for backend tests, but a clean, modern user interface is vital for human review and presentation. The frontend must serve static assets, display candidate properties, drive dialogue states, handle inputs, and present evaluations.

### Possible Approaches Considered
1.  **Option A**: Build a React client structure using a local Vite config.
2.  **Option B**: Create a Vanilla HTML5, CSS3, and JavaScript SPA served directly by the Express backend.

### Chosen Solution
Option B: Programmed the client files inside `public/` (index.html, style.css, app.js).

### Why This Solution Was Selected
Eliminating node build servers, bundlers, and configuration files ensures that edits are instantaneous, layout rendering is fast, and there are zero compiling risks during the 20-minute Live Steer Challenge.

### AI Collaboration
AI assistant drafted the CSS custom layout variables, SVG icon files, and standard DOM query bindings.

### Human Engineering Decisions
*   **Decisions Made**: Added a dynamic typing bubble animation to indicate model calculations. Shared active metadata (questionCount, dayTitle) in the backend handler response payloads to make the frontend progress meters and labels sync automatically.
*   **Decisions Rejected**: Rejected incorporating external frontend component libraries (such as Bootstrap) to maintain 100% control over design styles and minimize package loading weights.
*   **Manual Refinements**: Applied glassmorphism cards and dark-mode gradient colors to align with modern web design aesthetics.

### Files Created or Modified
*   `public/index.html`
*   `public/style.css`
*   `public/app.js`
*   `src/routes/interviewRoutes.js`

### Verification & Testing
Launched the local Express server in the background and spawned a headless browser agent to load `http://localhost:3000`. Verified that:
*   The page loads successfully.
*   The cohort candidate grid renders candidate details and supports clicks.
*   Static assets serve cleanly. Captured a screenshot confirming CSS styling layout.

### Git Commit
`feat: implement modern frontend SPA client and static assets`
