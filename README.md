# Podmiot i Spółka
## Twoja ekipa do rozbioru zdań

Interaktywna gra edukacyjna pomagająca uczniom 5 klasy szkoły podstawowej w nauce rozpoznawania części zdania. Poprzez wciągającą mechanikę drag & drop oraz system punktów i odznak, uczniowie mogą ćwiczyć analizę składniową zdań w języku polskim.

## O Grze

"Podmiot i Spółka" to gra polegająca na przeciąganiu etykiet z częściami zdania na odpowiednie słowa. Za każde poprawne przyporządkowanie gracz otrzymuje punkty XP, które pozwalają mu awansować na wyższe poziomy. Dodatkowo, za szczególne osiągnięcia przyznawane są specjalne odznaki.

### System Punktacji

- +10 XP za poprawne przyporządkowanie
- +3 XP za częściowo poprawne przyporządkowanie
- -2 XP za błędne przyporządkowanie
- Awans na kolejny poziom co 100 XP
- Specjalne odznaki za osiągnięcia (np. "Mistrz Podmiotu" za 10 poprawnych podmiotów z rzędu)

### Części Zdania w Grze

* **Podmiot (Subject)**: Kto lub co wykonuje czynność
* **Orzeczenie (Predicate)**: Czynność wykonywana przez podmiot
* **Przydawka (Adjective/Adverbial modifier)**: Określenie rzeczownika lub innego przysłówka
* **Dopełnienie (Object)**: Rzeczownik lub zaimek bezpośrednio lub pośrednio związany z czynnością orzeczenia
* **Okolicznik (Adverbial)**: Określenie okoliczności, w jakich odbywa się czynność:
  - Okolicznik Miejsca (gdzie?)
  - Okolicznik Czasu (kiedy?)
  - Okolicznik Sposobu (jak?)
  - Okolicznik Celu (po co? w jakim celu?)
  - Okolicznik Przyczyny (dlaczego?)

## Instalacja i Uruchomienie

### Wymagania
- Git
- Docker
- Docker Compose

### Instalacja lokalna (Docker)

1. Sklonuj repozytorium:
   ```bash
   git clone https://github.com/twojuser/czesci-zdania.git
   cd czesci-zdania
   ```

2. Uruchom kontenery za pomocą Docker Compose:
   ```bash
   docker-compose up -d
   ```

3. Otwórz przeglądarkę i przejdź pod adres:
   ```
   http://localhost:8080
   ```

### Instalacja na Heroku

1. Zainstaluj Heroku CLI:
   ```bash
   # Na Ubuntu/Debian
   curl https://cli-assets.heroku.com/install-ubuntu.sh | sh
   # Na macOS
   brew tap heroku/brew && brew install heroku
   ```

2. Zaloguj się do Heroku:
   ```bash
   heroku login
   ```

3. Utwórz aplikację na Heroku:
   ```bash
   heroku create podmiot-i-spolka
   ```

4. Skonfiguruj zmienne środowiskowe:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set PORT=80
   ```

5. Wdróż aplikację:
   ```bash
   git push heroku main
   ```

6. Otwórz aplikację w przeglądarce:
   ```bash
   heroku open
   ```

### Tryb Offline

Aplikacja działa również offline dzięki Service Worker. Po pierwszym załadowaniu, możesz korzystać z gry nawet bez dostępu do internetu.

## Technologie

- Frontend: HTML5, CSS3, JavaScript (ES6+)
- Backend: Node.js 20 + Express 4
- Konteneryzacja: Docker + docker-compose

## Rozwój Projektu

Projekt jest w aktywnym rozwoju. Planowane funkcjonalności:
- Tryb multiplayer (wyzwania klasowe)
- Edytor zdań dla nauczycieli
- Rozszerzona baza zdań generowana przez AI

## Bezpieczeństwo i Prywatność

Gra nie wymaga rejestracji ani logowania. Wyniki są zapisywane lokalnie i pseudonimizowane.

### `data/sentences_pl.json`

Plik JSON zawierający listę zdań. Każde zdanie to obiekt z polami:

*   `id`: Unikalny identyfikator zdania.
*   `sentence`: Pełna treść zdania.
*   `level`: Poziom trudności zdania (1-3).
*   `tokens`: Lista tokenów w zdaniu, gdzie każdy token to obiekt z polami:
    *   `word`: Słowo lub fraza.
    *   `part`: Część zdania (np. "Podmiot", "Orzeczenie", "Przydawka", "Dopełnienie", "Okolicznik Miejsca", "Okolicznik Czasu", "Okolicznik Sposobu", "Okolicznik Celu", "Okolicznik Przyczyny").