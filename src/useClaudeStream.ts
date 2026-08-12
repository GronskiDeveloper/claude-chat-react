import { useCallback, useRef, useState } from 'react';
import type { ChatMessage, ChatStatus, UseClaudeStreamOptions } from './types';

/**
 * Hook that owns the chat state and the streaming request to your proxy.
 *
 * Contract with the endpoint (matches the `claude-chat-widget` PHP proxy):
 *   POST endpoint, JSON body { messages: ChatMessage[] }
 *   Response: text/event-stream — one `data: {"text": "..."}` frame per token,
 *   then `data: {"done": true}` at the end. On error, `data: {"error": "..."}`.
 *
 * The hook does NOT hold your API key. Your server does. See the README.
 */
export function useClaudeStream({
  endpoint,
  headers,
  onFinish,
  onError,
  initialMessages = [],
}: UseClaudeStreamOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (userText: string) => {
      const trimmed = userText.trim();
      if (!trimmed || status === 'streaming') return;

      // Optimistic update — user sees their message immediately
      const userMessage: ChatMessage = { role: 'user', content: trimmed };
      const historyForRequest = [...messages, userMessage];

      // Empty assistant slot that we will fill as tokens stream in
      setMessages([...historyForRequest, { role: 'assistant', content: '' }]);
      setStatus('streaming');
      setError(null);

      const ctrl = new AbortController();
      abortRef.current = ctrl;

      let assembled = '';

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify({ messages: historyForRequest }),
          signal: ctrl.signal,
        });

        if (!res.ok || !res.body) {
          throw new Error(`Request failed (${res.status})`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        // Streaming loop — reads chunks, splits on SSE frame boundary (\n\n),
        // parses each `data: {...}` payload
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const frames = buffer.split('\n\n');
          buffer = frames.pop() ?? ''; // keep last partial frame for next chunk

          for (const raw of frames) {
            const line = raw.trim();
            if (!line.startsWith('data:')) continue;
            let payload: { text?: string; error?: string; done?: boolean };
            try {
              payload = JSON.parse(line.slice(5).trim());
            } catch {
              continue; // ignore malformed frames — never trust the wire
            }
            if (payload.text) {
              assembled += payload.text;
              // Replace the (empty) trailing assistant bubble content each token
              setMessages((prev) => {
                const next = prev.slice();
                const lastIdx = next.length - 1;
                const last = next[lastIdx];
                if (last && last.role === 'assistant') {
                  next[lastIdx] = { role: 'assistant', content: assembled };
                }
                return next;
              });
            }
            if (payload.error) {
              throw new Error(payload.error);
            }
            if (payload.done) {
              setStatus('idle');
              onFinish?.(assembled);
              return;
            }
          }
        }

        // Stream ended without an explicit `done` — treat as complete
        setStatus('idle');
        onFinish?.(assembled);
      } catch (err) {
        // Aborts are user-driven, not errors
        if ((err as Error).name === 'AbortError') {
          setStatus('idle');
          return;
        }
        const e = err instanceof Error ? err : new Error(String(err));
        setStatus('error');
        setError(e);
        onError?.(e);
      } finally {
        abortRef.current = null;
      }
    },
    [endpoint, headers, messages, onError, onFinish, status],
  );

  /** Stops an in-flight stream. Safe to call at any time. */
  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  /** Wipes the conversation. Does not stop an in-flight stream — call `stop()` first. */
  const reset = useCallback(() => {
    setMessages(initialMessages);
    setStatus('idle');
    setError(null);
  }, [initialMessages]);

  return { messages, status, error, sendMessage, stop, reset };
}
