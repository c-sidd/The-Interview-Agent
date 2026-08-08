# System Architecture Design

This document details the system design, request flow, session lifecycle, folder layout, and data pipelines for the AI Interview Agent.

---

## 1. Request Flow Sequence Diagram

This diagram shows how different request turns are processed: the initial setup (Turn 0), a conversational loop turn (Turns 1-8), and the final grading turn (Turn 9).

```mermaid
sequenceDiagram
    autonumber
    actor Candidate as Candidate Client
    participant Controller as InterviewController
    participant Service as InterviewService
    participant Session as SessionService
    participant Prompt as PromptService
    participant LLM as LLMService

    %% Case A: Turn 0 (Session Init)
    Note over Candidate, LLM: Turn 0: Start Interview
    Candidate->>Controller: POST /api/interview {"sessionId", candidate}
    Controller->>Service: handleRequest(sessionId, null, candidate)
    Service->>Session: Initialize Session (selectedDays, questionCount=0, empty history)
    Session-->>Service: Session Saved
    Service-->>Controller: Return welcome JSON payload (no LLM call)
    Controller-->>Candidate: {"reply": "Welcome...", "done": false}

    %% Case B: Turns 1 to 8 (Conversational Loop)
    Note over Candidate, LLM: Turns 1 to 8: Dialogue Loop
    Candidate->>Controller: POST /api/interview {"sessionId", "message"}
    Controller->>Service: handleRequest(sessionId, message)
    Service->>Session: Load Session
    Session-->>Service: Active Session
    Service->>Prompt: Compile Prompt context (System + Interview/FollowUp Prompt Builders)
    Prompt-->>Service: Final compiled prompt string
    Service->>LLM: executePrompt(compiledPrompt)
    LLM-->>Service: Next Question text response
    Service->>Session: Save turn to history & increment questionCount
    Session-->>Service: Session Updated
    Service-->>Controller: Return standard turn JSON
    Controller-->>Candidate: {"reply": "Next Question...", "done": false}

    %% Case C: Turn 9 (Final Evaluation)
    Note over Candidate, LLM: Turn 9: Final Feedback Generation
    Candidate->>Controller: POST /api/interview {"sessionId", "message"} (after Q8)
    Controller->>Service: handleRequest(sessionId, message)
    Service->>Session: Load Session (detects questionCount >= 8)
    Session-->>Service: Active Session & full history
    Service->>Prompt: Compile Feedback Prompt (FeedbackPromptBuilder)
    Prompt-->>Service: Final evaluation prompt string
    Service->>LLM: executePrompt(compiledPrompt)
    LLM-->>Service: Grading details JSON string
    Service->>Session: Mark Session done = true & Save feedback details
    Session-->>Service: Session Terminated
    Service-->>Controller: Return feedback JSON payload
    Controller-->>Candidate: {"reply": "Interview completed.", "done": true, "feedback": {...}}
```

---

## 2. Session State Lifecycle

The diagram below tracks the lifecycle of session states:

```mermaid
stateDiagram-v2
    [*] --> Uninitialized: Application start / user idle
    Uninitialized --> Active_Welcome: POST /api/interview (with candidate object)
    note on left of Active_Welcome
        State:
        - questionCount = 0
        - selectedDays = 4 selected days
        - history = []
    end note
    
    Active_Welcome --> Active_Loop: POST /api/interview (with message / turn 1)
    
    state Active_Loop {
        [*] --> Turn_Process: Retrieve state by sessionId
        Turn_Process --> LLM_Generate: Increment questionCount, call LLMService
        LLM_Generate --> Save_Turn: Save response and questions to history
        Save_Turn --> [*]
    }

    Active_Loop --> Active_Loop: questionCount < 8
    Active_Loop --> Final_Grading: questionCount >= 8 + Candidate answer 8
    
    Final_Grading --> Completed: Call FeedbackService to compile JSON report
    Completed --> [*]: done = true & return feedback details
```

---

## 3. Data Flow Diagram

This diagram shows how synthetic files, user messages, and prompt configurations flow to generate final responses:

```mermaid
graph TD
    %% Source Data Inputs
    A[candidates.json] -->|Parse signals| B[CurriculumService]
    C[curriculum.json] -->|Extract topics/tools| B
    
    %% Target Day selection
    B -->|Select 4 Days| D[Session Setup]
    D -->|Initialize State| E[SessionStore Map]

    %% Active Conversational Loop
    F[User POST Request] -->|sessionId| G[SessionStore Lookup]
    F -->|message| H[PromptService]
    G -->|Retrieve history & days| H

    %% Prompt builders compilation
    H -->|System Prompt| I[SystemPromptBuilder]
    H -->|Syllabus Prompt| J[InterviewPromptBuilder]
    H -->|Follow-up Prompt| K[FollowUpPromptBuilder]
    H -->|Feedback Prompt| L[FeedbackPromptBuilder]
    
    I & J & K & L -->|Compile Prompt Context| M[LLMService Client]
    M -->|Query Gemini API| N[Gemini 2.5 Flash]
    N -->|Generate response| O[InterviewService]
    O -->|Update session history| E
    O -->|JSON Payload| P[Candidate Client Response]
```

---

## 4. Folder Structure & Service Mapping

Our directory layout separates concerns by grouping routing controllers, decoupled services, prompt builder modules, public assets, and test suites:

```
Interview_Agent/
│
├── docs/                             # Engineering specifications & logs
│   ├── PROJECT_MILESTONES.md         # Master milestone roadmap
│   ├── DEVELOPMENT_WORKFLOW.md       # Development phases and DoD guidelines
│   ├── FINAL_ARCHITECTURE_DECISION.md# Frozen architectural details
│   ├── INTERVIEW_ENGINE_DESIGN.md    # Request processing pipeline design
│   ├── SYSTEM_ARCHITECTURE.md        # System flow diagrams (this file)
│   └── AI_ENGINEERING_LOG.md         # Natural-language engineering journal
│
├── PROMPTS/                          # AI collaboration audits
│   ├── PROMPTS.md                    # Prompt log master directory index
│   └── [category_logs].md            # Placeholder prompt history logs
│
├── public/                           # Frontend Assets (Vanilla HTML/CSS/JS)
│   ├── index.html                    # Single Page Layout (Card selector & chat panels)
│   ├── style.css                     # Baseline CSS variables & CSS grid rules
│   └── app.js                        # UI controller and API endpoints caller
│
├── src/                              # Source code root
│   ├── controllers/
│   │   └── InterviewController.js     # HTTP request router handler
│   │
│   ├── services/
│   │   ├── InterviewService.js        # Core interview pipeline coordinator
│   │   ├── SessionService.js          # In-memory session store & timeout cleaner
│   │   ├── CurriculumService.js       # Syllabus parser and dynamic day picker
│   │   ├── LLMService.js              # Gemini SDK wrapper & Mock fallback client
│   │   ├── FeedbackService.js         # Final grading compiler & parser
│   │   └── PromptService.js           # Prompt compiler orchestration service
│   │
│   └── services/promptBuilders/
│       ├── SystemPromptBuilder.js     # Instructions, tone, and guardrail prompts
│       ├── InterviewPromptBuilder.js  # Syllabus daily objectives & tools prompts
│       ├── FollowUpPromptBuilder.js   # Probing and context-based prompt logic
│       └── FeedbackPromptBuilder.js   # Structured feedback evaluation templates
│
├── server.js                         # Root application boot loader
├── test_api.js                       # End-to-end integration test runner
├── .env.example                      # Configuration template
└── .gitignore                        # Git exclusion profiles
```

---
