/**
 * Public types for @grodev/claude-chat-react.
 * See ClaudeChat.tsx and useClaudeStream.ts for the values that consume them.
 *
 * Built by GroDev — https://grodev.pl/ai — custom AI assistants on the Claude API.
 */

/** One message in the conversation. Matches the shape the server proxy expects. */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** Which state the hook is currently in. */
export type ChatStatus = 'idle' | 'streaming' | 'error';

/** Options accepted by the useClaudeStream hook. */
export interface UseClaudeStreamOptions {
  /**
   * URL of your server-side proxy — the thing that holds the Anthropic API key
   * and forwards to Claude. This library NEVER calls api.anthropic.com directly;
   * doing so would leak your key to every visitor. See the README.
   */
  endpoint: string;

  /** Optional headers merged into every request (e.g. auth cookies, CSRF). */
  headers?: Record<string, string>;

  /** Called after the assistant reply completes, with the full string. */
  onFinish?: (assistantMessage: string) => void;

  /** Called on network or upstream error. */
  onError?: (error: Error) => void;

  /**
   * If provided, seeds the conversation. Useful for restoring a session from
   * storage. Defaults to []. Not required — you can start empty and let users
   * type the first message.
   */
  initialMessages?: ChatMessage[];
}

/** Options accepted by the <ClaudeChat /> component. Superset of hook options. */
export interface ClaudeChatProps extends UseClaudeStreamOptions {
  /** Title in the panel header. Defaults to "Chat". */
  title?: string;

  /** Greeting shown as the first bot bubble when the panel opens. Optional. */
  greeting?: string;

  /** Placeholder text in the input. Defaults to a localized string. */
  placeholder?: string;

  /**
   * CSS color for the accent (launcher, user bubbles, send button).
   * Defaults to GroDev green (#1D9E75). Any valid CSS color works.
   */
  accentColor?: string;

  /**
   * Where the floating launcher sits. Defaults to bottom-right.
   * Ignored if `mode="inline"`.
   */
  position?: 'bottom-right' | 'bottom-left';

  /**
   * "floating" (default) renders a launcher + toggleable panel.
   * "inline"  renders the panel inline (no launcher, always visible).
   */
  mode?: 'floating' | 'inline';

  /** Extra className applied to the root element. */
  className?: string;
}
