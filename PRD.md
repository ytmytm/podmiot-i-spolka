# PRD – Gra „Części Zdania”

## 1. Wstęp

Celem projektu jest zwiększenie motywacji i efektywności nauki rozbioru gramatycznego poprzez interaktywną grę webową, która łączy naukę z elementami zabawy i natychmiastową informacją zwrotną.

## 2. Uzasadnienie problemu

* Tradycyjny rozbiór zdań jest dla uczniów monotonny i mało angażujący.
* Nauczyciele potrzebują narzędzi do szybkiego monitorowania postępów.
* Brak atrakcyjnych, polskojęzycznych gier edukacyjnych dedykowanych częściom zdania.

## 3. Wizja produktu

Uczniowie uczą się, bawiąc się przy komputerze lub tablecie, a nauczyciele zyskują panel raportów. Gra ma prosty interfejs „przeciągnij‑i‑upuść” oraz system punktów i poziomów, który zachęca do regularnych powtórek.

## 4. Cele SMART

1. **S** (Specific) – uruchomić wersję MVP gry webowej zawierającą co najmniej 50 zdań do rozbioru oraz mechanizm punktacji do **30 września 2025 r.**
2. **M** (Measurable) – osiągnąć średnio ≥ 5 min czasu sesji na ucznia w pierwszym miesiącu po premierze.
3. **A** (Achievable) – zdobyć min. 2 szkoły pilotażowe i 60 uczniów aktywnych tygodniowo w ciągu pierwszych 3 miesięcy.
4. **R** (Relevant) – poprawić średni wynik testu z części zdania u uczniów testowych o 15 pp względem grupy kontrolnej.
5. **T** (Time‑bound) – osiągnąć powyższe metryki do **31 grudnia 2025 r.**

## 5. Grupa docelowa

| Segment                      | Charakterystyka                                   | Potrzeby                                           |
| ---------------------------- | ------------------------------------------------- | -------------------------------------------------- |
| Uczniowie klas 5 (10–11 lat) | Lubią gry, krótka koncentracja uwagi, kolorowy UI | Zabawa, szybka nagroda, brak nadmiaru tekstu       |
| Nauczyciele języka polskiego | Zarządzają klasą, ograniczony czas lekcji         | Łatwe monitorowanie postępów, materiały powtórkowe |
| Rodzice                      | Wspierają naukę w domu                            | Bezpieczna, wartościowa gra, brak reklam           |

## 6. Funkcje produktu

### 6.1 Rdzeń rozgrywki

* Wyświetlanie zdania i etykiet części zdania (podmiot, orzeczenie, przydawka, dopełnienie, okolicznik miejsca/czasu/sposobu/celu/przyczyny).
* Przeciąganie etykiet na odpowiednie słowa lub grupy wyrazów.
* System punktów za poprawne odpowiedzi, odejmowanie punktów za błędy.
* Pasek postępu rundy.

### 6.2 Gamifikacja

* Poziomy doświadczenia (XP) i awatar rosnący wraz z postępami.
* Odznaki (badge) za serie poprawnych zdań, czas reakcji < 10 s itp.
* Tabela wyników klasy (opcjonalnie w „trybie nauczycielskim”).

### 6.3 Biblioteka zdań

* 100 pre‑wygenerowanych zdań w pliku JSON (poziom 1: bardzo proste, poziom 2: z przydawkami, poziom 3: z okolicznikami).
* Możliwość dynamicznego generowania nowych zdań poprzez API LLM (po MVP).

### 6.4 Panel nauczyciela (rozszerzenie po MVP)

* Logowanie nauczyciela.
* Tworzenie klasy i nadawanie kodu dostępu.
* Raport wyników (średnia dokładność, liczba prób, ranking uczniów).

### 6.5 Dostępność multiplatformowa

* Responsywny design (≥ 1024 px desktop, ≥ 720 px tablet).
* Obsługa najnowszych wersji Chrome, Edge, Firefox oraz Safari (iPad OS).

## 7. Zakres MVP

| Moduł                 | Wchodzą w MVP | Po MVP                          |
| --------------------- | ------------- | ------------------------------- |
| Rozgrywka DnD         | ✔             | –                               |
| 100 zdań offline      | ✔             | dynamiczne generowanie          |
| Punkty, poziomy       | ✔             | odznaki za serie, ranking klasy |
| UI PL                 | ✔             | lokalizacja ENG                 |
| Panel nauczyciela     | ✖             | ✔                               |
| Logowanie             | ✖             | ✔ (OAuth)                       |
| Zapisywanie w chmurze | ✖             | ✔                               |

## 8. Wymagania niefunkcjonalne

* **Dostępność**: kontrast zgodny z WCAG 2.1 AA.
* **Wydajność**: ładowanie pierwszego ekranu ≤ 2 s przy 3G Fast.
* **Bezpieczeństwo**: brak danych wrażliwych, komunikacja HTTPS.
* **Skalowalność**: kontener Docker z plikiem `Dockerfile`.
* **Środowisko**: Node >= 20, ES2022.

## 9. Kryteria akceptacji

1. Uczeń może przeciągnąć etykietę na słowo; po zwolnieniu otrzymuje feedback (zielona ramka / czerwona x) ≤ 0,3 s.
2. Po ukończeniu zdania pojawia się podsumowanie punktów i przycisk „Następne zdanie”.
3. Gra działa bezbłędnie offline po pierwszym załadowaniu (PWA service worker).
4. W trybie nauczycielskim eksport CSV wyników działa poprawnie.

## 10. Metryki sukcesu (KPI)

| Metryka                         | Cel                       |
| ------------------------------- | ------------------------- |
| Średni czas sesji               | ≥ 5 min                   |
| Dzienni aktywni uczniowie (DAU) | ≥ 40 na klasę testową     |
| Średnia dokładność odpowiedzi   | ≥ 80 % po 2 tyg. używania |
| Retencja 7‑dniowa               | ≥ 60 %                    |

## 11. Harmonogram (wysoki poziom)

| Data       | Milestone                   |
| ---------- | --------------------------- |
| 2025‑05‑31 | Zamrożenie wymagań (PRD)    |
| 2025‑07‑15 | Prototyp UI (figma)         |
| 2025‑08‑31 | Beta (MVP, testy szkoła #1) |
| 2025‑09‑30 | Launch MVP publiczny        |
| 2025‑12‑31 | Panel nauczyciela + ranking |

## 12. Założenia i ryzyka

* **Założenie:** Dostęp do OpenAI API pozostanie w wersji edukacyjnej z obniżoną ceną.
* **Ryzyko:** Uczniowie mogą omijać pytania losowo klikając – mitiger: mechanizm obniżania punktów i blokada 3 s po błędzie.
* **Ryzyko:** Zbyt mała liczba zdań -> plan B: manualne dopisanie przez nauczycieli.

## 13. Załączniki

* DESIGN.md – architektura techniczna.
* PLAN.md – breakdown zadań dla agentów.
* Figma – link do makiet (TBD).
