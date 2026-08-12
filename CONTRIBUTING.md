# Jak współtworzyć — @grodev/claude-chat-react

Chętnie przyjmę pull requesty i sensowne issue.

## Zanim otworzysz issue

1. **Sprawdź [otwarte issue](https://github.com/GronskiDeveloper/claude-chat-react/issues)** — może już ktoś to zgłosił.
2. **Sprawdź [`CLAUDE.md`](CLAUDE.md)** — sekcja *Znane pułapki* i *Kiedy sięgać po Claude* wyjaśnia projekt design decisions (dlaczego CSS Modules, dlaczego zero runtime deps, dlaczego proxy jest wymagany). Jeśli Twoje zgłoszenie idzie wbrew którejś z tych zasad, opisz dlaczego — nie zamykam takich propozycji z automatu, ale trzeba to uzasadnić.
3. **Zgłoszenia bezpieczeństwa** → NIE otwieraj publicznego issue, patrz [`SECURITY.md`](SECURITY.md).

## Setup lokalny

```bash
npm install
npm run dev        # Vite dev server na http://localhost:5182
npm run typecheck  # tsc --noEmit
npm run build      # tsup — generuje dist/ z ESM + CJS + typami + CSS
```

## Pull requesty

- **Małe, skupione zmiany** — jeden PR = jeden temat. Refactor + fix + feature w jednym PR trudno zrecenzować.
- **Trzymaj się konwencji z repo** — spójrz na istniejący kod (`useClaudeStream.ts`, `ClaudeChat.tsx`). CSS Modules dla stylowania, TypeScript strict, brak nowych runtime deps bez uzasadnienia.
- **Test manualny obowiązkowo dla zmian dotykających UI** — uruchom `npm run dev`, sprawdź w prawdziwym browserze (Chrome + Firefox), opisz w PR co uruchomiłeś. `npm run typecheck` przechodzący bez testu w browserze nie wystarczy.
- **Zmiany dotykające publicznych typów** (`src/types.ts`) → wymagają dyskusji przed implementacją. To kontrakt biblioteki — konsumenci polegają na stabilności.
- **Aktualizuj `CLAUDE.md`** jeśli zmieniasz założenia projektu (np. dodajesz nowy niezmiennik do sekcji *Znane pułapki*).

## Semver

- **Patch** (`1.0.0` → `1.0.1`) — bug fixy, dokumentacja, wewnętrzne refactory bez zmiany publicznego API.
- **Minor** (`1.0.0` → `1.1.0`) — nowe fitchy backward-compatible (nowy opcjonalny prop, nowa opcjonalna opcja hooka).
- **Major** (`1.0.0` → `2.0.0`) — breaking changes (usunięcie/rename prop, zmiana kontraktu wire, drop wsparcia dla starszej wersji Reacta).

Jeśli nie jesteś pewny, w opisie PR napisz co proponujesz i dlaczego — dogadamy się przy review.

## Praca z AI (dowolny model — Claude, GitHub Copilot, Cursor)

Nie ukrywaj tego. Jeśli używałeś AI do wygenerowania draftu:

- **Uczciwie o tym napisz** w opisie PR: „Draft wygenerowany przez [narzędzie], zaudytowany ręcznie przed pushem".
- **Zweryfikuj każdą linię, którą podpisujesz swoim commit.** LLM potrafi napisać kod prawdopodobnie wyglądający, który sypie w runtime — Twoja odpowiedzialność jako autora PR to złapanie tego przed pushem. Zwłaszcza w React: reguły hooków, stale closures, race conditions w streamingu.
- **Nie mieszaj wygenerowanego draftu z ręcznymi zmianami w tym samym commicie** — trudno zrecenzować, co pochodzi skąd.

Ten projekt sam jest budowany [AI-first](CLAUDE.md) — więc dokumentowany workflow jest tu wartością, nie problemem.

## Kontakt

Pytania: dominik@grodev.pl.

Autor: [Dominik Groński / GroDev](https://grodev.pl)
