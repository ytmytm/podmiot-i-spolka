## Części zdania

W grze wykorzystywane są następujące części zdania:

*   **Podmiot (Subject)**: Kto lub co wykonuje czynność.
*   **Orzeczenie (Predicate)**: Czynność wykonywana przez podmiot.
*   **Przydawka (Adjective/Adverbial modifier)**: Określenie rzeczownika lub innego przysłówka.
*   **Dopełnienie (Object)**: Rzeczownik lub zaimek, który jest bezpośrednio lub pośrednio związany z czynnością orzeczenia.
*   **Okolicznik (Adverbial)**: Określenie czasownika, przymiotnika lub innego przysłówka, wskazujące na okoliczności (miejsce, czas, sposób itp.).

### `data/sentences_pl.json`

Plik JSON zawierający listę zdań. Każde zdanie to obiekt z polami:

*   `id`: Unikalny identyfikator zdania.
*   `text`: Pełna treść zdania.
*   `words`: Lista słów w zdaniu, gdzie każde słowo to obiekt z polami:
    *   `text`: Słowo.
    *   `part`: Część zdania (np. "Podmiot", "Orzeczenie", "Przydawka", "Dopełnienie", "Okolicznik"). 