# Final Architecture Decision (FAD) — AI Interview Agent

## 1. Architectural Blueprint & Request Lifecycle

Below is the verified request lifecycle. It maps how the backend server processes initial requests, conversational turns, and the final feedback compilation.

### Initial Request (Turn 0): Session Initialization
When a user selects a candidate and clicks "Start Interview," the frontend sends the candidate profile payload.
1.  The client sends a `POST /api/interview` request containing `sessionId` and `candidate` object.
2.  The `InterviewController` receives the request and delegates it to the `InterviewService`.
3.  The `InterviewService` parses the candidate profile and calls the `CurriculumService` to select 4 distinct curriculum days.
4.  The `SessionService` initializes a session state containing the selected days, question count = 0, and an empty history array.
5.  The backend immediately returns the welcome response `{"reply": "Welcome. Let's begin your interview.", "done": false}` **without querying the LLM**. This ensures low latency and compliance with the initial contract.

### Conversational Turns (Turns 1 to 8): Question and Probing Loop
1.  The candidate types an answer, and the frontend sends a `POST /api/interview` request with `sessionId` and `message`.
2.  The `InterviewController` calls `InterviewService.handleRequest`.
3.  `InterviewService` retrieves the active session from `SessionService`.
4.  If it is the **first conversational turn** (question count = 0), the `PromptService` builds the system instructions using `SystemPromptBuilder` and maps the first curriculum day using `InterviewPromptBuilder`. The `LLMService` is queried to ask the first question.
5.  If it is a **subsequent turn**, the `PromptService` compiles the history and uses `FollowUpPromptBuilder` to decide if the candidate's response requires a follow-up or if the interview should transition to the next topic.
6.  The `LLMService` queries the Gemini API.
7.  The server increments the question count, appends the dialogue to the session history, and returns `{"reply": "Question...", "done": false}`.

### Final Turn (Turn 9): Evaluation Compilation
1.  After the candidate answers the 8th question, the frontend sends the response payload.
2.  The `InterviewService` detects that `questionCount >= 8`.
3.  The `InterviewService` calls `FeedbackService` to compile the final evaluation prompt using `FeedbackPromptBuilder`.
4.  The `LLMService` queries the Gemini API to generate the evaluation feedback.
5.  The response is parsed into the required JSON schema, the session is marked as `done: true`, and the server returns the structured payload containing `done: true` and the `feedback` object.

```
          [POST /api/interview]
                    │
                    ▼
           Retrieve Session
                    │
                    ▼
      Is this the first request?
         ┌──────────┴──────────┐
         │ (Yes)               │ (No)
         ▼                     ▼
Initialize Session      Read State & History
  - Select 4 Days              │
  - Save State                 ▼
         │             Is questionCount >= 8?
         │               ┌─────┴─────┐
         │               │ (No)      │ (Yes)
         │               ▼           ▼
         │         Build Prompt   Build Evaluation
         │         - V1 Persona   - JSON Schema
         │         - Syllabus     - Grade History
         │               │           │
         │               ▼           ▼
         │          LLM Call      LLM Call
         │         - Gemini       - Gemini
         │               │           │
         │               ▼           ▼
         │         Update Session Mark Session Done
         │         - Save Turn    - Save Feedback
         │         - Increment       │
         ├───────────────┘           │
         ▼                           ▼
[Return Response]            [Return Feedback]
```

---

## 2. Decoupled Service Architecture

The codebase is organized into controllers, services, and prompt builders under `src/` to separate responsibilities:

```
src/
├── controllers/
│   └── InterviewController.js         # HTTP routing and input sanitization
│
├── services/
│   ├── InterviewService.js            # Orchestrates the interview loop
│   ├── SessionService.js              # Manages in-memory state caching
│   ├── CurriculumService.js           # Selects topics and daily syllabus details
│   ├── LLMService.js                  # Handles Google Gemini SDK and mock fallback
│   ├── FeedbackService.js             # Formulates evaluation prompts and JSON parsing
│   └── PromptService.js               # Composes prompts using prompt builders
│
└── services/promptBuilders/
    ├── SystemPromptBuilder.js         # Persona, instructions, and guardrails
    ├── InterviewPromptBuilder.js      # Syllabus content and tool listings
    ├── FollowUpPromptBuilder.js       # Probing questions and progression rules
    └── FeedbackPromptBuilder.js       # Structured evaluation prompt design
```

---

## 3. Technology Stack Finalization & Engineering Decisions

### Backend: Express.js
*   **Selected**: Express.js (Node.js)
*   **Rejected**: Fastify, FastAPI (Python), NestJS
*   **Rationale**: Express.js is a lightweight, widely-adopted web framework. It allows us to serve the static frontend files directly from the same port, simplifies container configuration, and minimizes setup boilerplate.
*   **Trade-off**: Lacks built-in dependency injection like NestJS, but can be structured using clean ES6 modules.

### Frontend: Vanilla HTML5, CSS3, & JavaScript
*   **Selected**: Vanilla HTML5, CSS3, and JavaScript
*   **Rejected**: React + Vite, Next.js
*   **Rationale**: Vanilla assets have zero build overhead, webpack dependencies, or version mismatch risks. This is critical for the 20-minute Live Steer Challenge, where adding UI features must be done quickly and without compile errors. The static public folder is served directly by Express.
*   **Trade-off**: Requires manual DOM updates instead of declarative state bindings, but this is managed using helper functions.

### LLM Provider
*   **Default Provider**: Google Gemini 2.5 Flash (configured via `LLM_PROVIDER=gemini` and `GEMINI_MODEL=gemini-2.5-flash` in the environment)
*   **Supported Alternatives**: OpenAI (GPT models), Anthropic (Claude models), Groq (Llama models), or Mock Fallback.
*   **Rationale**: Decoupling the LLM client through an adapter pattern in `LLMService` ensures that the architecture is provider-agnostic. Google Gemini 2.5 Flash is selected as the default due to its ultra-low latency (averaging under 1.5 seconds), high reasoning capabilities for technical jargon, large context window, and native JSON output options.
*   **Trade-off**: Requires writing provider adapters, but this abstraction makes the code future-proof for the Live Steer Challenge.

### Session Storage: In-Memory Map
*   **Selected**: In-Memory JavaScript Map (with timeout cleanup)
*   **Rejected**: Redis, SQLite
*   **Rationale**: The technical specification does not require long-term storage or accounts. Storing session objects in memory avoids database connection overhead and simplifies the Docker environment. A timeout cleanup prevents memory leaks during automated testing.
*   **Trade-off**: Session states are lost if the server restarts, but this is acceptable within the hackathon's scope.

### Retrieval Strategy: Dynamic Context Injection
*   **Selected**: Programmatic JSON Context Injection
*   **Rejected**: Full Vector Database RAG (ChromaDB, Pinecone)
*   **Rationale**: The curriculum dataset is small (~18KB) and candidate records are small (~26KB). Loading both datasets in memory and dynamically injecting the relevant day's details (topics, tools, objectives) directly into the LLM prompt is fast, 100% accurate, and avoids vector indexing latency.
*   **Trade-off**: Does not scale to thousands of documents, but is optimal for this specific dataset.

### Agent Orchestration: Custom Interview Engine
*   **Selected**: Custom Stateful Orchestrator
*   **Rejected**: LangChain, LangGraph, CrewAI
*   **Rationale**: A custom state machine gives us exact control over the question count (strictly >= 8), selected days, follow-up decisions, and final feedback triggers. Frameworks like LangChain or LangGraph add significant overhead, abstraction, and risk of version mismatch or unpredictability during the Live Steer Challenge.
*   **Trade-off**: We must manually coordinate the dialogue history, but this is handled by `InterviewService` and `PromptService`.

---

## 4. Validation Against Hackathon Requirements

We verify that this architecture satisfies all hackathon requirements:

*   **Conversational Interview**: Handled by the dialogue loop in `POST /api/interview` using the Gemini API.
*   **Minimum 8 Questions**: Tracked by `questionCount` in `SessionService` and enforced before triggering feedback.
*   **Coverage of at least 4 curriculum days**: The `CurriculumService` dynamically selects 4 distinct day objects for each candidate.
*   **Follow-Up Questions**: Managed by the `FollowUpPromptBuilder` which decides whether to probe further or move to the next day.
*   **Conversation Context**: Dialogue turns are appended to the session history array and sent with each LLM request.
*   **Structured Feedback**: Generated on the 9th request using the `FeedbackService` and matching the exact JSON schema.
*   **API Contract & Session Management**: Handled by the `POST /api/interview` route and `SessionService`.

---

## 5. Future-Proofing for the Live Steer Challenge

This controller-service-builder architecture makes it easy to implement unexpected feature requests:
*   **Hints**: Add a route that calls `PromptService.buildHintPrompt()` and returns a hint.
*   **Scoring**: The `FeedbackService` can grade individual answers on the fly and store a running score in the session object.
*   **Difficulty Levels**: Inject the difficulty setting into the prompt compiler to adjust the interviewer's style.
*   **Retry Interview**: Clear the history and reset the question count for the active `sessionId`.
*   **Multiple LLM Providers**: Implement a provider adapter pattern in `LLMService` to switch between Gemini and OpenAI/Anthropic using environment variables.
*   **Interview Timer**: Store the start time in the session object and compare it on each request.

---
