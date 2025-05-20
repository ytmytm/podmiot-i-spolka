# DESIGN

*(Podsumowanie na koniec dnia: Definicja motywu UI (P-02 z `PLAN.md`) została sfinalizowana i jest odzwierciedlona w sekcji "UI/UX". Konfiguracja Dockerfile dla backendu (P-10 z `PLAN.md`) jest zgodna z opisaną architekturą kontenerów. Kolejne prace projektowe będą wspierać implementację zadań o wysokim priorytecie z `PLAN.md`.)*

## Cel techniczny

Zaplanowanie i opis architektury gry edukacyjnej "Podmiot i Spółka" przeznaczonej dla uczniów 5 klasy SP.

## Stack technologiczny

* **Frontend:** HTML5, CSS3 (TailwindCSS), JavaScript (ES6+), Vite jako bundler.
* **Silnik Drag & Drop:** Native HTML5 Drag and Drop API lub biblioteka interact.js.
* **Backend (opcjonalny):** Node.js 20 + Express 4, integracja z OpenAI API do generacji nowych zdań, MongoDB do przechowywania wyników, Redis do cache.
* **Konteneryzacja:** Docker oraz docker‑compose do orkiestracji usług (`frontend`, `backend`, `db`, `proxy`).
* **Testy:** Jest + @testing-library/dom.

## Architektura

### Warstwa prezentacji

* Single Page Application (SPA).
* Komponent `SentenceBoard` pokazuje zdanie w formie listy słów (każde słowo to `WordSlot`).
* Panel boczny `PartsTray` z kartami części zdania (`DragCard`).

### Logika gry

* Moduł `gameEngine` zarządza cyklem: **załaduj zdanie → rozłóż słowa → oceń → przelicz punkty → następne zdanie**.

### Gamifikacja

* **XP:** +10 za poprawne, +3 za częściowo poprawne, −2 za błędne.
* **Poziomy:** Każde 100 XP podnosi poziom.
* **Odznaki:** "Mistrz Podmiotu" (10 poprawnych podmiotów z rzędu) itp.

## UI/UX

* Pastelowa paleta (#8EC5FC, #E0C3FC, #FFF9C4).
* Font: Poppins, wielkość 18 px+.
* Animacje: podświetlenie poprawnych/niepoprawnych pól, przyjemne przejścia.
* Obsługa myszy, wsparcie dotyku (mobile).

## Dane

* Początkowy zbiór 100 prostych zdań w `data/sentences_pl.json`.
* Struktura rekordów jak w przykładzie.

## Struktura katalogów

```text
project/
├─ frontend/
│  ├─ public/
│  │  └─ index.html
│  ├─ src/
│  │  ├─ components/
│  │  │  ├─ SentenceBoard.js
│  │  │  ├─ WordSlot.js
│  │  │  └─ DragCard.js
│  │  ├─ styles/
│  │  │  └─ main.css
│  │  ├─ gameEngine.js
│  │  └─ main.js
│  ├─ tests/
│  │  └─ gameEngine.test.js
│  └─ vite.config.js
├─ backend/ (opcjonalnie)
│  ├─ src/
│  │  ├─ server.js
│  │  ├─ routes/
│  │  │  ├─ sentences.js
│  │  │  └─ scores.js
│  │  └─ services/
│  │     └─ llm.js
│  ├─ package.json
│  └─ Dockerfile
├─ data/
│  └─ sentences_pl.json
├─ docker-compose.yml
└─ README.md
```

## Kontenery

* **frontend:** `node:20-alpine`, etap build + static nginx.
* **backend:** `node:20-alpine`.
* **db:** `mongo:7`.
* **proxy:** `nginx:1.25`.

## Bezpieczeństwo i prywatność

* Brak rejestracji; zapisy tylko pseudonimizowane identyfikatory.

## Rozszerzalność

* Możliwość dodania trybu multiplayer (klasowe wyzwanie).
* Edytor zdań dla nauczyciela.
