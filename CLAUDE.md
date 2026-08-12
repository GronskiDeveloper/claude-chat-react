# Praca AI-first — notatki dla tego repo

Trzymam ten plik w repozytorium, ponieważ buduję z Claude Code (Anthropic) i chcę, żeby podział „człowiek/AI" był widoczny z drzewa plików, a nie deklarowany w README. Rekruter, klient albo kolega z zespołu ma tu dowody, nie ogólniki.

## Podział pracy człowiek vs AI

| Warstwa | Kto zrobił | Dlaczego tak |
|---|---|---|
| Threat model — kluczowa decyzja „nie wołamy Claude bezpośrednio z browsera" | **Człowiek** | Ten sam threat model co w [`claude-chat-widget`](https://github.com/GronskiDeveloper/claude-chat-widget). Delegowanie decyzji „czy klucz API ma dotknąć browsera" do AI to sposób na wypuszczenie incydentu wycieku klucza. Widget React nie zmienia niczego w tej regule — nadal musisz mieć proxy po stronie serwera. Uczciwie napisane w README. |
| Podział na hook + komponent (`useClaudeStream` + `<ClaudeChat/>`) | **Człowiek** | To design API biblioteki. „Headless hook + gotowy komponent" to wzorzec, którego świadomie chciałem — pozwala konsumentowi wziąć albo samo state management, albo cały gotowy UI. Nie do zlecenia AI. |
| Streaming SSE w hooku (`useClaudeStream`) | **Draft AI, hardening człowieka** | Claude napisał pierwszy szkielet reader/decoder loop; ja dodałem: (1) `AbortController` z możliwością `stop()`, (2) optymistyczne aktualizacje `messages` przez `setMessages(prev => ...)` żeby uniknąć race condition, (3) zachowanie `buffer` między chunkami, (4) `if (payload.error) throw` żeby błędy szły przez ten sam catch. |
| TypeScript types (`ChatMessage`, `ClaudeChatProps`, `UseClaudeStreamOptions`) | **Człowiek** | Publiczny kontrakt biblioteki. Konsumenci będą tego używać w swoich aplikacjach, więc typy muszą być stabilne i wyraziste — nie „whatever AI wygenerowało". |
| Komponent JSX (`<ClaudeChat/>`) + zarządzanie fokusem/scrollem | **Draft AI, cleanup człowieka** | Claude zrobił szkielet drzewa JSX; ja dodałem: `useEffect` do auto-scroll, `ref` do textarea + `focus()` przy open, `aria-label` na przyciskach, `role="dialog"` na panelu, `aria-live="polite"` na logu wiadomości. Dostępność (a11y) to obszar, gdzie LLM często pomija subtelności. |
| CSS Modules + zmienne CSS pod jedno-propowe themowanie (`accentColor`) | **Człowiek** | Decyzja o stylowaniu (bez Tailwinda, bez CSS-in-JS, bez runtime CSS dependency) była moja — biblioteka ma się wpasować w dowolny stack konsumenta. `CSS Modules` daje scoping bez runtime, `@media (prefers-color-scheme)` obsługuje dark mode za darmo. |
| Build (tsup — ESM + CJS + `.d.ts`) | **Draft AI, weryfikacja człowieka** | Standard boilerplate. Sprawdziłem, że `peerDependencies` faktycznie wykluczają React z bundla, i że `exports` w `package.json` poprawnie eksportuje CSS jako osobny wpis (`import '@grodev/claude-chat-react/styles.css'`). |
| README + backlinki | **Człowiek** | Marketing i pozycjonowanie zostają u mnie. |

## Co zweryfikowałem przed wypchnięciem

- `npm run typecheck` (`tsc --noEmit`) → czysto.
- `npm run build` (`tsup`) → generuje `dist/` z ESM + CJS + typami + CSS.
- `npm run dev` (Vite) — załadowany komponent w prawdziwym browserze, kliknięty launcher, otwarty panel, próba wysłania wiadomości → poprawnie pokazuje błąd connection (bo demo nie ma backendu). Zero błędów konsoli poza tym oczekiwanym network error. Testowany na Chrome i Firefox.
- Sprawdziłem, że `AbortController` faktycznie przerywa stream: uruchomiłem długi request, wywołałem `stop()`, potwierdziłem że fetch został zakończony i status wrócił do `idle`.
- Bundle size: `~8 KB gzipped` (weryfikowane przez `du -h dist/index.js.gz`).
- Wersje peer deps: przetestowane na React 18.3 (patrz `package.json`).

## Znane pułapki dla następnej iteracji AI

- **Nigdy nie wołaj Claude API bezpośrednio z browsera.** Ta biblioteka istnieje właśnie dlatego, że nie wolno tego robić — jakakolwiek zmiana, która wprowadzi `import Anthropic from '@anthropic-ai/sdk'` w kod client-side, jest fundamentalnie zła. Klucz zostaje na serwerze, kropka.
- **React JSX osadza tekst przez `textContent`, nie `innerHTML`** — to jest XSS-safe by default, ale każda zmiana wprowadzająca `dangerouslySetInnerHTML` na treści od użytkownika łamie tę gwarancję. Jeśli chcesz Markdown, sanitize server-side i przekaż jako oczyszczony string.
- **`setMessages((prev) => ...)`, nie `setMessages([...messages, ...])`.** Streaming pozwala kilku aktualizacjom stanu wystartować przed re-renderem — używanie stanu-z-closure zamiast callbacka daje race condition (tokeny mogą się zgubić albo zdublować).
- **`AbortController` musi być tworzony per-request i przechowywany w `ref`**, nie w `state`. Zapisywanie AbortController w `useState` powoduje re-render przy każdym `send`, co zresetuje inne komponenty.
- **`peerDependencies` w `package.json` musi mieć React** — inaczej konsument dostanie dwie kopie Reacta w bundlu, co łamie hooki (klasyczny błąd „Invalid hook call").
- **Nie dodawaj `zustand`, `jotai`, `react-query` ani innych state management deps.** Biblioteka ma zero runtime dependencies poza React — świadomie. Konsument już ma swój state management.
- **Nie dodawaj Tailwinda.** CSS Modules to konkretna decyzja, żeby biblioteka wpasowała się do dowolnego stylowego stacku konsumenta.

## Kiedy sięgać po Claude na tym projekcie, a kiedy pisać samodzielnie

- **Sięgnąć po Claude:** dodanie wsparcia dla OpenAI/lokalnego LLM (drugi provider), dodanie retry-with-backoff w hooku, dodanie testów (Vitest + React Testing Library), i18n przez `messages` prop.
- **Zrobić samodzielnie:** cokolwiek dotykającego streaming loop w `useClaudeStream` (race conditions), API publicznych typów (kontrakt biblioteki), decyzji o dependency (chcemy zero runtime deps).

## Powiązanie z resztą stacku

Ten widget jest React-owym odpowiednikiem [`@GronskiDeveloper/claude-chat-widget`](https://github.com/GronskiDeveloper/claude-chat-widget) (vanilla JS). Ten sam kontrakt SSE, ten sam PHP proxy pasuje do obu. Wybierz React-owy dla apki Reactowej, vanilla JS dla statycznej strony / WordPress / dowolnego innego stacku.
