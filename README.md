# AI Interview Agent — Cohort Technical Assessment Platform

An intelligent, stateful mock interview agent built for the **ABTalks Vibe Coding Hackathon**. 

This platform evaluates cohort candidates dynamically by mapping their progress metrics (first-attempt completions, struggles, or skipped assignments) to a 31-day curriculum, selecting exactly 4 custom day topics, conducting a structured 8-question dialogue loop, and compiling a structured JSON evaluation report.

---

## 🚀 Key Features

1.  **Dynamic Day Selection**: Programmatically selects 4 curriculum day topics using candidate progress signals:
    *   *Strength Assessment*: 1 day the candidate passed on the first attempt.
    *   *Growth Assessment*: 1 day they struggled with (multiple attempts or failed).
    *   *Baseline Gap Assessment*: 1 day they skipped.
    *   *Capstone/Core Integration*: 1 core program day (RAG, Agents, MCP, Deployment, etc.).
2.  **Stateful Dialogue Loop**: Conducts a structured conversational loop (2 questions per selected day, strictly enforcing a minimum of 8 turns) and manages states (dialogue history, question indexes, current topic) dynamically using unique `sessionId` handles.
3.  **Decoupled Architecture**: Decouples Express HTTP routes from application services (Session, Curriculum, LLM, Prompt, and Feedback services) to make the code modular and easy to extend.
4.  **Provider-Agnostic LLM Wrapper**: Connects to the Google Generative AI SDK (using Gemini 2.5 Flash as the default) but abstracts all model queries, allowing developers to swap providers (OpenAI, Claude, Groq) via environment variables. Includes a local offline mock responder.
5.  **Premium Glassmorphic UI**: Offers a clean Single Page Application (Vanilla HTML5, CSS3, and JS) that serves candidates lists, displays active topic trackers, runs typing loading indicators, and presents grading report dashboards.

---

## 🛠️ Technology Stack

*   **Backend**: Node.js & Express.js (serving API endpoints and static assets).
*   **Frontend**: Vanilla HTML5, CSS3 (CSS Custom Variables, Flexbox, CSS Grid), and modern JavaScript.
*   **AI Model**: Groq Llama 3.3 70B (default, abstracted).
*   **Session State Store**: In-Memory JavaScript `Map` cache (with 30-minute inactive session garbage collection sweeps).
*   **Context Strategy**: Programmatic JSON Context Injection (injects curriculum syllabus details directly into compiler prompts, avoiding RAG latency).

---

## 📂 Folder Layout

```
Interview_Agent/
│
├── docs/                             # Engineering specs and development logs
│   ├── SYSTEM_ARCHITECTURE.md        # Mermaid sequence, data flow, & lifecycle diagrams
│   ├── FINAL_ARCHITECTURE_DECISION.md# Frozen technology stack & service specifications
│   ├── INTERVIEW_ENGINE_DESIGN.md    # Request processing pipeline design
│   ├── SESSION_SCHEMA.md             # Stateful object model transition specifications
│   ├── PROMPT_DESIGNS.md             # Persona, curriculum, follow-up, and feedback prompts
│   ├── DEVELOPMENT_WORKFLOW.md       # Development lifecycles and Definition of Done guidelines
│   ├── PROJECT_MILESTONES.md         # 36-milestone development roadmap
│   └── AI_ENGINEERING_LOG.md         # Natural-language developer work journal
│
├── PROMPTS/                          # AI collaboration audit templates
│   └── PROMPTS.md                    # Master prompt log directory index
│
├── public/                           # Frontend SPA Assets (Vanilla CSS/JS)
│   ├── index.html                    # Selector, chat, and feedback card layouts
│   ├── style.css                     # Baseline CSS variables & dark-mode styling
│   └── app.js                        # Event handlers, chat buffers, and endpoint wrappers
│
├── src/                              # Source code directory
│   ├── controllers/
│   │   └── InterviewController.js     # Parses HTTP requests and sanitizes inputs
│   ├── routes/
│   │   └── interviewRoutes.js         # REST route maps
│   ├── services/
│   │   ├── InterviewService.js        # Core conversation state machine coordinator
│   │   ├── SessionService.js          # In-memory session store & cache cleaner
│   │   ├── CurriculumService.js       # Syllabus and candidate json selectors
│   │   ├── LLMService.js              # Gemini SDK connector with mock fallbacks
│   │   ├── FeedbackService.js         # Final grading response sanitizers
│   │   └── PromptService.js           # Prompt compiler orchestration service
│   └── services/promptBuilders/
│       ├── SystemPromptBuilder.js     # Personas & experience-based instructions
│       ├── InterviewPromptBuilder.js  # Syllabus daily target questions
│       ├── FollowUpPromptBuilder.js   # Context-aware probing questions
│       └── FeedbackPromptBuilder.js   # Structured feedback evaluation prompts
│
├── Dockerfile                        # Production Alpine package build
├── docker-compose.yml                # Port mappings and environment variables loader
├── server.js                         # Application boot entry point
├── test_api.js                       # HTTP server integration test suite
└── test_edge_cases.js                # Validation and prompt injection safety test runner
```

---

## 📊 Data-Driven Candidates & Curriculum

The platform operates entirely based on dynamic data files without hardcoded candidate listings or curriculum day references:

### 1. Dynamic Candidates (`candidates.json`)
*   **Source of Truth**: All candidate accounts, years of experience, target job roles, education, signal records, and mission histories are loaded directly from [candidates.json](file:///d:/AB_Talks/Interview_Agent/candidates.json).
*   **Adding a Candidate**: Simply append a new candidate JSON object to the `candidates` array. The frontend candidate selector grid automatically renders them on page reload without restarting the Node server.
*   **Personalized Routing**: The interview dynamically tailors System Prompts, objectives, and adaptive question structures using the candidate's custom attributes.

### 2. Dynamic Curriculum (`curriculum.json`)
*   **Source of Truth**: The curriculum modules, Day counts, titles, tools list, and learning objectives are loaded directly from [curriculum.json](file:///d:/AB_Talks/Interview_Agent/curriculum.json).
*   **Adding Curriculum Days**: Simply append a new day object to the `days` array in `curriculum.json`. The Curriculum Service will automatically discover it on the next interview load.
*   **Dynamic Infrastructure Day Filtering**: Infrastructure days (e.g. Docker, Kubernetes, CI/CD) are filtered out for non-technical candidates (e.g. Business Analysts) dynamically by checking the day title, tools, and objectives against regex patterns instead of hardcoded day numbers.
*   **Error Handling**: If a JSON file is missing, empty, or malformed, the platform catches the error and surfaces a descriptive message in the UI instead of crashing.

---

## ⚙️ Setup & Installation

### 1. Configure Environment Variables
Copy the template configuration file to `.env`:
```bash
cp .env.example .env
```
Open `.env` and add your Google Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
LLM_PROVIDER=gemini
GEMINI_MODEL=gemini-2.5-flash
PORT=3000
```
*Note: If `GEMINI_API_KEY` is left blank, the application automatically runs in `mock` offline mode, allowing you to test the conversation loops and frontends without hitting API limits.*

### 2. Install Dependencies
Initialize node modules:
```bash
npm install
```

### 3. Run Locally
Boot the Express web server:
```bash
npm start
```
Open your browser and navigate to: **[http://localhost:3000](http://localhost:3000)**.

---

## 🧪 Verification & Testing

Verify that all service modules, error handlers, and route connections are functional using our automated test scripts:

*   **Offline Prompt Simulations**: Test how prompt builders render candidate attributes and curriculum days offline:
    ```bash
    node src/services/test_prompts.js
    ```
*   **API Router Integration Tests**: Boot the Express listener, assert HTTP health checks, and test Turn 0 session initializations:
    ```bash
    node test_api.js
    ```
*   **Edge Case & Safety Tests**: Verify that the application sanitizes blank inputs, handles missing session lookups, and blocks prompt injection threats:
    ```bash
    node test_edge_cases.js
    ```

---

## 🐳 Docker Deployment

You can package and run the platform inside a lightweight container:

### 1. Build and Start Container
Run docker compose to start the server:
```bash
docker-compose up --build
```
This maps the internal port `3000` to the host port `3000` and automatically mounts your host `.env` file variables.

### 2. Stop Container
Stop the server:
```bash
docker-compose down
```

---

## 📖 Developer Journal & Audits

*   **Engineering Log**: To review the architectural progression, trade-offs, and design choices made throughout the project milestones, see **[docs/AI_ENGINEERING_LOG.md](docs/AI_ENGINEERING_LOG.md)**.
*   **Submission Prompt Index**: To review the official prompt logs for submission audits, see **[PROMPTS/PROMPTS.md](PROMPTS/PROMPTS.md)**.
