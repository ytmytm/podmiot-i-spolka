# MDC Rules for AI/LLM Agents - Project "Części Zdania"

## 1. General Principles

*   **Adherence to PRD and DESIGN:** All development must strictly follow the specifications outlined in `PRD.md` and `DESIGN.md`.
*   **Task-Specific Focus:** Each agent should focus on the specific task assigned in `PLAN.md`.
*   **Modularity:** Code should be modular and well-documented to facilitate parallel work and future maintenance.
*   **Testing:** All functional code must be accompanied by unit tests as specified (e.g., Jest, @testing-library/dom, Playwright).
*   **Iterative Development:** Deliver tasks in manageable chunks, ideally as pull requests.
*   **Communication:** If a task dependency is blocked or clarification is needed, raise it immediately.

## 2. Task Execution Guidelines (from PLAN.md)

*   **P-01 (Data Generation):**
    *   Output: `sentences_pl.json`.
    *   Content: 100 simple Polish sentences with parts of speech clearly marked (subject, predicate, adjective, adverb of place/time/manner/purpose/cause).
    *   Input: Grammatical guidelines (to be provided or inferred from PRD).
*   **P-02 (UI Design):**
    *   Output: `ui_theme.json` (or directly applied styles).
    *   Content: Color palette (#8EC5FC, #E0C3FC, #FFF9C4) and fonts (Poppins, 18px+) suitable for 10-year-olds, ensuring WCAG 2.1 AA contrast.
*   **P-03 (Frontend - SentenceBoard):**
    *   Output: `frontend/src/components/SentenceBoard.js` and associated tests.
    *   Functionality: Display a sentence, tokenizing it into words. Each word becomes a `WordSlot`.
    *   Input: `SentenceBoard.spec` (to be defined if not existing).
*   **P-04 (Frontend - Drag & Drop):**
    *   Output: `frontend/src/drag.js` (or integrated into components).
    *   Functionality: Implement drag and drop for labels (parts of speech) onto words. Use Native HTML5 Drag and Drop API or `interact.js` as per `DESIGN.md`.
    *   Input: `drag_spec.md` (to be defined).
*   **P-05 (Logic - Scorer):**
    *   Output: `gameEngine.js` (or a dedicated `scorer.js`) and tests.
    *   Functionality: Evaluate the correctness of matched labels to words.
    *   Input: Grammatical rules for parts of speech.
*   **P-06 (Frontend - Results Screen):**
    *   Output: `frontend/src/components/ResultView.js`.
    *   Functionality: Display results screen and a leaderboard (using localStorage for MVP).
    *   Input: Mockup/UI design.
*   **P-07 (Gamification):**
    *   Output: `frontend/src/gamification.js`.
    *   Functionality: Implement scoring (+10 correct, +3 partial, -2 incorrect), levels (every 100 XP), and badges (e.g., "Mistrz Podmiotu").
    *   Input: KPIs from `PRD.md`.
*   **P-08 (Backend - Get Sentences):**
    *   Output: `backend/src/routes/sentences.js`.
    *   Functionality: GET `/sentences/random` endpoint serving sentences from `data/sentences_pl.json`.
    *   Priority: Low (Post-MVP).
*   **P-09 (Backend - Sentence Generator):**
    *   Output: `backend/src/services/generator.js` (or `llm.js`).
    *   Functionality: Generate new sentences using GPT-4o (or specified LLM).
    *   Input: Prompt template.
    *   Priority: Low (Post-MVP).
*   **P-10 (DevOps - Backend Dockerfile):**
    *   Output: `backend/Dockerfile`.
    *   Content: Dockerfile for the Node.js backend (`node:20-alpine`).
    *   Input: `backend/package.json`.
*   **P-11 (CI - GitHub Actions):**
    *   Output: `.github/workflows/ci.yml`.
    *   Functionality: Setup GitHub Actions for automated testing and building.
*   **P-12 (Testing - E2E):**
    *   Output: E2E tests (e.g., `e2e.spec.ts`).
    *   Functionality: Write Playwright tests for the "Happy Path" user flow.
    *   Input: MVP UI.
*   **P-13 (Docs - README):**
    *   Output: Updates to `README.md`.
    *   Content: Instructions on how to run the project.
*   **P-14 (UX - Onboarding):**
    *   Output: `onboarding.json` or similar spec.
    *   Content: Propose onboarding flow and tooltips.
    *   Input: Mockups.
*   **P-15 (Analytics - Tracking Plan):**
    *   Output: `analytics_plan.md`.
    *   Content: Propose event tracking plan for GA4 based on KPIs.
    *   Input: List of KPIs.

## 3. Technical Stack Adherence

*   **Frontend:** HTML5, CSS3 (TailwindCSS), JavaScript (ES6+), Vite.
*   **Drag & Drop:** Native HTML5 API or `interact.js`.
*   **Backend (Post-MVP):** Node.js 20, Express 4, MongoDB, Redis.
*   **Testing:** Jest, @testing-library/dom, Playwright.
*   **Environment:** Node >= 20, ES2022.

## 4. File Structure

*   Follow the directory structure outlined in `DESIGN.md`. All new files should be placed in their designated locations.

## 5. Non-Functional Requirements

*   **Accessibility:** WCAG 2.1 AA (contrast).
*   **Performance:** First screen load ≤ 2s on 3G Fast.
*   **Security:** HTTPS, no sensitive data storage for MVP.
*   **Scalability:** Dockerized application.

## 6. MVP Focus

*   Prioritize tasks marked as "wysoki" in `PLAN.md` for the MVP.
*   MVP features include: Drag & Drop gameplay, 100 offline sentences, points/levels, Polish UI.
*   Post-MVP: Teacher panel, login, cloud save, dynamic sentence generation, badges, class ranking, English localization.

## 7. Code Style and Quality

*   Write clean, readable, and maintainable code.
*   Use ESLint/Prettier (if configured) for consistent formatting.
*   Comments should explain non-obvious logic.

## 8. Dockerization

*   **Frontend:** `node:20-alpine` for build stage, then static `nginx`.
*   **Backend:** `node:20-alpine`.
*   **DB (Post-MVP):** `mongo:7`.
*   **Proxy (Post-MVP):** `nginx:1.25`.
*   Ensure `docker-compose.yml` orchestrates these services correctly.

By following these rules, AI agents can contribute effectively and cohesively to the "Części Zdania" project. 