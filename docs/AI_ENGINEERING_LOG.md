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
