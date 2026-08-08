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
