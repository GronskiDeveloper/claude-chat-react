---
description: Audyt bezpieczeństwa komponentu React + hooka przed każdą zmianą
---

Recenzujesz zmianę w `src/ClaudeChat.tsx` albo `src/useClaudeStream.ts` w repo `claude-chat-react`. Ta biblioteka trafia do apki Reactowej konsumenta — ma zerowe runtime dependencies poza React, jest publiczna na npm. Każda regresja bezpieczeństwa lub API breaking change dotyka wszystkich, którzy zainstalowali paczkę.

Zanim zaakceptujesz diff, upewnij się, że wszystkie osiem poniższych warunków zachodzi:

1. **Brak importu z `@anthropic-ai/sdk`** (ani z jakiegokolwiek innego SDK Anthropica) w żadnym pliku w `src/`. Ta biblioteka **nigdy** nie woła Claude API bezpośrednio — zawsze przez proxy konsumenta. Jeśli diff wprowadza taki import, jest fundamentalnie zły — odrzucić.
2. **Brak `dangerouslySetInnerHTML`** w JSX. Cała treść od użytkownika idzie przez `{content}` (React JSX escape'uje automatycznie). Jakakolwiek zmiana wprowadzająca dangerouslySetInnerHTML na treści od użytkownika łamie gwarancję XSS-safe.
3. **`setMessages` używa formy callbackowej `setMessages((prev) => ...)`**, nie `setMessages([...messages, ...])`. Streaming pozwala kilku aktualizacjom stanu wystartować przed re-renderem — closure-based state jest race condition.
4. **`AbortController` jest przechowywany w `useRef`, nie w `useState`.** Zapisywanie w state powoduje re-render przy każdym `send`.
5. **`peerDependencies` w `package.json` zawiera `react` i `react-dom`.** `dependencies` (nie peer) NIE mogą zawierać `react` — inaczej konsument dostanie dwie kopie Reacta i hooki się rozjadą.
6. **Publiczne typy w `src/types.ts` nie łamią backward compatibility.** Zmiana wymaganego prop na opcjonalny — OK. Zmiana opcjonalnego na wymagany — breaking change, wymaga major bump. Usunięcie prop — breaking. Zmiana nazwy prop — breaking.
7. **Brak nowych runtime dependencies.** `zustand`, `jotai`, `react-query`, `axios`, `zod` — nic z tego. Biblioteka ma zero runtime deps poza React. Sprawdzić `dependencies` w `package.json` przed i po diffie.
8. **Dostępność (a11y) nie zostaje regresowana.** `role="dialog"` na panelu, `aria-label` na przyciskach, `aria-live="polite"` na logu, `aria-expanded` na launcherze, focus management (input focus na open panel). Jeśli diff dotyka struktury JSX, potwierdzić że każdy z tych atrybutów ma pokrycie.

Jeśli którykolwiek warunek pęka — zablokuj zmianę i wróć z konkretnym przypadkiem, który się złamie.

Bonus: uruchom `npm run typecheck` + `npm run build` + `npm run dev` przed acceptem. TypeScript-safe kod, który sypie w browser Console, to nadal bug — a bugi w bibliotece publicznej są droższe niż w apce, bo dotyczą N konsumentów.
