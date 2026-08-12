import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent } from 'react';
import { useClaudeStream } from './useClaudeStream';
import type { ClaudeChatProps } from './types';
import styles from './ClaudeChat.module.css';

/**
 * Drop-in AI chat widget for a React app. Two modes:
 *   - "floating" (default): renders a launcher button + toggleable panel.
 *   - "inline": renders the panel inline for embedding in a page section.
 *
 * The API key is NEVER touched by this component. It calls your `endpoint`,
 * which is a small server-side proxy you deploy. See README for the wire
 * format (matches `@grodev/claude-chat-widget`'s PHP proxy).
 *
 * All user-authored text is inserted via textContent (React JSX) so this
 * component is XSS-safe by default.
 */
export function ClaudeChat({
  endpoint,
  headers,
  onFinish,
  onError,
  initialMessages,
  title = 'Chat',
  greeting,
  placeholder = 'Type a message…',
  accentColor = '#1D9E75',
  position = 'bottom-right',
  mode = 'floating',
  className,
}: ClaudeChatProps) {
  const [open, setOpen] = useState(mode === 'inline');
  const [draft, setDraft] = useState('');
  const [greetingShown, setGreetingShown] = useState(false);

  const { messages, status, error, sendMessage } = useClaudeStream({
    endpoint,
    headers,
    onFinish,
    onError,
    initialMessages,
  });

  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new content + focus input when the panel opens
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const toggle = useCallback(() => setOpen((v) => !v), []);

  const handleSubmit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      const text = draft.trim();
      if (!text || status === 'streaming') return;
      setDraft('');
      void sendMessage(text);
    },
    [draft, sendMessage, status],
  );

  // Enter sends, Shift+Enter inserts a newline
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  // Optional greeting bubble — synthesized, not a real API round-trip
  useEffect(() => {
    if (open && greeting && !greetingShown && messages.length === 0) {
      setGreetingShown(true);
    }
  }, [open, greeting, greetingShown, messages.length]);

  // CSS variables consumed by the module stylesheet — theming via one prop
  const cssVars: CSSProperties = {
    // @ts-expect-error — custom CSS properties aren't in React's typed CSSProperties
    '--cc-accent': accentColor,
    '--cc-bg': 'var(--cc-bg-override, #ffffff)',
    '--cc-fg': 'var(--cc-fg-override, #1a1a1a)',
    '--cc-bubble': 'var(--cc-bubble-override, #f1f0f5)',
    '--cc-border': 'var(--cc-border-override, #e4e3ea)',
  };

  const rootClass = [
    mode === 'floating' ? styles.panelFloating : styles.panelInline,
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const panel = (
    <div
      className={rootClass}
      style={cssVars}
      data-position={position}
      role="dialog"
      aria-label={title}
    >
      <div className={`${styles.panel}`}>
        <div className={styles.header}>
          <span>{title}</span>
          {mode === 'floating' && (
            <button
              type="button"
              className={styles.closeBtn}
              onClick={toggle}
              aria-label="Close chat"
            >
              ×
            </button>
          )}
        </div>

        <div className={styles.log} ref={logRef} aria-live="polite">
          {greetingShown && messages.length === 0 && (
            <div className={`${styles.msg} ${styles.msgBot}`}>{greeting}</div>
          )}

          {messages.map((m, i) => {
            const isEmptyStreamingBot =
              m.role === 'assistant' &&
              m.content === '' &&
              i === messages.length - 1 &&
              status === 'streaming';
            return (
              <div
                key={i}
                className={`${styles.msg} ${m.role === 'user' ? styles.msgUser : styles.msgBot}`}
              >
                {isEmptyStreamingBot ? (
                  <span className={styles.typing} aria-label="Assistant is typing">
                    <i />
                    <i />
                    <i />
                  </span>
                ) : (
                  m.content
                )}
              </div>
            );
          })}

          {status === 'error' && error && (
            <div className={styles.error} role="status">
              {error.message}
            </div>
          )}
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.visuallyHidden} htmlFor="cc-chat-input">
            Message
          </label>
          <textarea
            id="cc-chat-input"
            ref={inputRef}
            className={styles.input}
            rows={1}
            value={draft}
            placeholder={placeholder}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="submit"
            className={styles.send}
            disabled={status === 'streaming' || draft.trim() === ''}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );

  if (mode === 'inline') return panel;

  return (
    <>
      <button
        type="button"
        className={styles.launcher}
        style={{ ['--cc-accent' as string]: accentColor } as CSSProperties}
        data-position={position}
        onClick={toggle}
        aria-label={open ? 'Close chat' : 'Open chat'}
        aria-expanded={open}
      >
        💬
      </button>
      {open && panel}
    </>
  );
}
