# AI Usage Log Strategy & Engineering Log Guidelines

## AI Usage Philosophy

This repository was developed using an AI-assisted engineering workflow. 

AI was treated as a collaborative development assistant rather than an autonomous code generator. All architectural decisions, implementation validation, integration, debugging, testing, and final acceptance remained under human supervision.

The AI Usage Log is designed to provide a transparent chronological record of how AI contributed to the project and how engineering decisions evolved throughout development. Its purpose is to allow both human reviewers and AI-based repository analysis tools to reconstruct the complete development lifecycle.

---

## 1. Shift from Prompt Dumping to an Engineering Journal

Rather than listing raw prompts (e.g., *"Generate Express server"*), we log our progress as a natural-language **Engineering Journal**. 

This approach has two main advantages:
1.  **Professional Clarity**: It documents the engineering decisions and trade-offs considered at each step.
2.  **AI Readability**: If a repository analysis tool (like Antigravity) is asked to explain how a component was built, it can read the journal to understand the architecture, trade-offs, and design choices.

---

## 2. Log Entry Structure

Each entry in the log is organized into the following sections:

*   **Problem**: What technical problem does this milestone address?
*   **Why This Problem Matters**: What is the architectural or product impact?
*   **Possible Approaches Considered**: What design options did we explore?
*   **Chosen Solution**: Which path did we select?
*   **Why This Solution Was Selected**: What is the engineering justification?
*   **AI Collaboration**: How did the AI assist (e.g., boilerplate code, debugging, brainstorming)?
*   **Human Engineering Decisions**: What did the human developer choose, reject, or refine?
*   **Files Modified**: Relative file paths.
*   **Git Commit**: The commit hash or tag.

---

## 3. Storage and Submission Structure

We maintain two tracking files to satisfy both internal planning and submission requirements:
1.  **[docs/AI_ENGINEERING_LOG.md](AI_ENGINEERING_LOG.md)**: The internal engineering journal detailing decisions and trade-offs.
2.  **[PROMPTS/PROMPTS.md](../PROMPTS/PROMPTS.md)**: The official submission index requested by the organizers, listing milestones and corresponding commits.

---
