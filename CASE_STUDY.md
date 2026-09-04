# Case study - jak powstał `@grodev/claude-chat-react`

Krótka uczciwa retrospektywa. Jeśli jesteś rekruterem albo klientem próbującym rozgryźć, jak wygląda „AI-first" w codziennej pracy, jak decyduję o kształcie API biblioteki i gdzie kończy się AI a zaczyna człowiek - to jest to.

Głębsza wersja tego procesu, ze wszystkimi decyzjami o threat modelu i architekturze, jest w [`claude-chat-widget` (CASE_STUDY.md)](https://github.com/GronskiDeveloper/claude-chat-widget/blob/main/CASE_STUDY.md) - PHP proxy + vanilla JS bracia bliźniacy tego pakietu. Ten dokument omawia to, co jest specyficzne dla wersji Reactowej.

## Brief (30 sekund)

Reactowy odpowiednik mojego widgetu na Claude API z trzema wymaganiami:

1. **Klucz API do Claude nie może dotrzeć do browsera.** Ten sam threat model co w `claude-chat-widget` - każdy `fetch('https://api.anthropic.com', ...)` w Reactowej appce leci prosto do DevTools i pierwszej osoby, która zauważy, robi Ci rachunek w nocy. Widget woła Twój proxy, nie Anthropic.
2. **Zero runtime deps poza Reactem.** ~8 KB gzipped. Żadnego `zustand`, `axios`, `swr`, `use-immer`. Jeżeli deweloper doda ten pakiet do apki, jego bundle nie rośnie o 200 KB, tylko o 8.
3. **Dwa poziomy abstrakcji.** Gotowy `<ClaudeChat />` (5 linii dodania do strony) **i** headless hook `useClaudeStream()` (własne UI, kontrola nad renderowaniem). Nie każdy klient chce mój design.

Cały build: ~2 godziny aktywnej pracy, jedna sesja.

## Gdzie faktycznie zdarzyła się praca człowieka

### 1. Design API - decyzja o dwóch poziomach (człowiek, przed jakimkolwiek kodem)

Klucza decyzja: **hook + komponent czy tylko komponent?** Argumenty za tylko komponentem: prostota, mniej powierzchni utrzymania, jedna droga do sukcesu. Za dwoma: dev który buduje SaaS z designerem chce trzymać UI po swojej stronie, komponent wtedy przeszkadza.

Wybrałem oba, z jasnym rozdziałem odpowiedzialności:

- `useClaudeStream()` - **stan i I/O**. Zwraca `{ messages, isStreaming, sendMessage, cancel }`.
- `<ClaudeChat />` - **UI i UX**. Konsumuje ten sam hook wewnętrznie. Ma sensowne domyślne CSS Modules, opcjonalne overrides przez `classNames` prop.

Ta warstwa nie wchodziła do prompta AI - jest w moim TypeScript type file zanim jakikolwiek `.tsx` powstał.

### 2. Kontrakt SSE typów (człowiek)

`RawContentBlockDeltaEvent` / `TextDelta` z Anthropic SDK są source-of-truth. Napisałem odpowiadające typy TypeScript ręcznie (nie generator), bo:

- Backend proxy w tym repo jest referencyjny - realny użytkownik może mieć proxy w Node, Go, Python. Wszystkie muszą trzymać ten sam wire format.
- Wire format jest udokumentowany w `CLAUDE.md` i `README.md` (sekcja „SSE contract"), żeby ktoś kto ma własny proxy mógł podłączyć bez kodu w PHP.

### 3. AI zrobił draft komponentu i CSS Modules (Claude, ~40 min)

Boilerplate `<ClaudeChat />` (JSX + hooks composition), CSS Modules (`chat.module.css`), `tsup` config, `vite.config.ts` dla dev sandbox - to wszystko delegat do Claude Code. Podałem:

- Typ prop komponentu (dokładny)
- Zdefiniowany hook API (dokładny)
- Threat model (żeby nie generował fetch do api.anthropic.com)

Draft trafił do review - poprawiłem 2 rzeczy: (1) accessibility button role i aria-live dla panelu ze streamem, (2) escape key zamykający panel. Reszta poszła bez ingerencji.

### 4. TypeScript strict + eksport types (człowiek)

`package.json` ma `"types"`, `"exports"` z warunkowym importem ESM/CJS, `"engines"` z pinem node. Testowałem ręcznie że działa w:

- Next.js App Router (RSC + `use client`)
- Vite React SPA
- Create React App legacy

## Gdzie to się sprawdza

- SaaS-y i landing pages, gdzie „chat z AI" ma być krokiem trzecim (nie osobnym produktem)
- Wewnętrzne narzędzia (portal HR, panel support) gdzie liczy się szybki deployment
- Klienci z własnym proxy Node/Python/Go - używają hooka, moja implementacja proxy PHP jest tylko referencyjna

## Kiedy nie ten pakiet

- Jeśli szukasz pełnego SaaS chatbot builder (Intercom, Voiceflow, Chatbase) - to jest komponent do samodzielnego wpięcia, nie usługa
- Jeśli backend musi robić function-calling / tool use złożone (agent orchestration) - hook zwróci stream, ale orchestrację robisz sam po stronie proxy

## Wersje i kontakt

Publiczny [npm `@grodev/claude-chat-react`](https://www.npmjs.com/package/@grodev/claude-chat-react). MIT. Repo utrzymywane, issue/PR mile widziane.

Wdrożenie komercyjne pod branding klienta, integracja z Twoim proxy, custom UI: [dominik@grodev.pl](mailto:dominik@grodev.pl) · [grodev.pl](https://grodev.pl/ai).
