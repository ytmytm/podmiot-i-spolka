# PLAN – Zadania dla agentów AI

Dokument rozbija projekt na małe jednostki pracy możliwe do wykonania równolegle przez mniejsze modele LLM.

| Nr   | Moduł            | Zadanie                                                      | Wejście                | Oczekiwane wyjście         | Priorytet |
| ---- | ---------------- | ------------------------------------------------------------ | ---------------------- | -------------------------- | --------- |
| P‑01 | **Dane**         | Wygeneruj 100 prostych zdań z oznaczeniem części zdania      | Wytyczne gramatyczne   | `sentences_pl.json`        | wysoki    |
| P‑02 | **UI**           | Zaproponuj schemat kolorów i fontów przyjazny 10‑latkom      | Paleta bazowa, WCAG AA | `ui_theme.json`            | ZROBIONE  |
| P‑03 | **Frontend**     | Zaimplementuj komponent *SentenceBoard* z tokenizacją zdania | `SentenceBoard.spec`   | `SentenceBoard.js` + testy | wysoki    |
| P‑04 | **Frontend**     | Zaimplementuj logikę drag & drop dla etykiet                 | `drag_spec.md`         | `drag.js`                  | wysoki    |
| P‑05 | **Logic**        | Stwórz funkcję scorer() oceniającą poprawność dopasowań      | Reguły gramatyczne     | `scorer.js` + testy        | wysoki    |
| P‑06 | **Frontend**     | Ekran wyników + tabela rankingowa (localStorage)             | Makieta                | `ResultView.js`            | średni    |
| P‑07 | **Gamification** | System punktacji, poziomy, odznaki                           | KPI                    | `gamification.js`          | średni    |
| P‑08 | **Backend**      | Endpoint GET `/sentences/random`                             | `sentences_pl.json`    | `sentences.js`             | niski     |
| P‑09 | **Backend**      | Generator nowych zdań z GPT‑4o                               | Prompt template        | `generator.js`             | średni    |
| P‑10 | **DevOps**       | Przygotuj Dockerfile dla backendu                            | package.json           | Dockerfile                 | ZROBIONE  |
| P‑11 | **CI**           | Skonfiguruj workflow GitHub Actions (test + build)           | repo                   | `.github/workflows/ci.yml` | niski     |
| P‑12 | **Testing**      | Napisz testy Playwright dla ścieżki Happy Path               | MVP UI                 | `e2e.spec.ts`              | niski     |
| P‑13 | **Docs**         | Uzupełnij README o instrukcję uruchomienia                   | Cały projekt           | `README.md`                | średni    |
| P‑14 | **UX**           | Zaproponuj onboarding i tooltipy                             | Makiety                | `onboarding.json`          | wysoki    |
| P‑15 | **Analytics**    | Zaproponuj plan event tracking (GA4)                         | Lista KPI              | `analytics_plan.md`        | średni    |
| P‑16 | **PWA**          | Implementacja Service Worker dla trybu offline               | Wymagania PRD          | Service Worker             | wysoki    |

**Legenda priorytetów:** wysoki → wymagane na MVP, średni → beta, niski → v1+, ZROBIONE → zadanie ukończone

Każde zadanie należy dostarczyć w pull requeście wraz z testami i opisem.
