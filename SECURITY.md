# Zgłaszanie podatności

Bezpieczeństwo tego projektu jest dla mnie ważne — jeśli znalazłeś podatność, zgłoś ją **prywatnie** zamiast otwierać publicznego issue.

## Kanały zgłoszenia

- **Preferowany:** [Security Advisory na GitHubie](https://github.com/GronskiDeveloper/claude-chat-react/security/advisories/new) (prywatny, tylko dla mnie do przejrzenia).
- **Alternatywnie:** e-mail bezpośrednio na **dominik@grodev.pl** z tematem `[SECURITY] claude-chat-react`.

## Co warto zawrzeć w zgłoszeniu

- Opis podatności (co jest do wykorzystania, jak).
- Kroki reprodukcji (albo minimalny PoC).
- Ocena wpływu (co atakujący może zrobić — kradzież danych, wykonanie kodu, DoS itd.).
- Ewentualnie sugerowany fix.

## Reakcja

- **Potwierdzenie odbioru:** w ciągu 72h.
- **Wstępna ocena:** w ciągu 7 dni.
- **Fix + release na npm:** zależnie od skali (krytyczne — priorytetowo).

Podziękuję imiennie w release notes (o ile nie prosisz o anonimowość).

## Kontekst tego projektu

Ta biblioteka **nigdy nie woła Claude API bezpośrednio** — konsument musi mieć własne proxy po stronie serwera trzymające klucz API. Widget React tylko rozmawia z tym proxy przez SSE. Dlatego najkrytyczniejsze klasy podatności to:

- **XSS przez treść wiadomości** — jeśli komukolwiek uda się wprowadzić `dangerouslySetInnerHTML` albo nieoczyszczoną injekcję DOM, każdy konsument tej biblioteki dostaje regresję. Cała treść od użytkownika i asystenta musi iść przez normalny React JSX escape (`{content}`).
- **Prototype pollution / injection przez `initialMessages` prop** — jeśli konsument przekazuje historię z niezaufanego źródła (np. z URL query stringa), zły input nie może korumpować state hooka. Aktualnie hook nie manipuluje kluczami obiektu wiadomości, ale każda zmiana która dodaje `merge`/`Object.assign` powinna być audytowana.
- **Cross-Origin misconfiguration w przykładach README** — pokazywanie `endpoint: '*'` albo linków do publicznych proxy jako „just works" prowadziłoby konsumentów do wycieku klucza. README utrzymuje disciplinowany komunikat: „musisz mieć własne proxy".

Podatności w kodzie proxy PHP zgłaszaj do [`claude-chat-widget`](https://github.com/GronskiDeveloper/claude-chat-widget/blob/main/SECURITY.md) — to osobny projekt.

Autor: [Dominik Groński / GroDev](https://grodev.pl)
