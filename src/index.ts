/**
 * @grodev/claude-chat-react — public entry.
 *
 * Two ways to use this package:
 *   1. Drop-in component:   import { ClaudeChat } from '@grodev/claude-chat-react';
 *   2. Headless hook:       import { useClaudeStream } from '@grodev/claude-chat-react';
 *
 * Both require a server-side proxy that holds your Anthropic API key.
 * Reference implementation: https://github.com/GronskiDeveloper/claude-chat-widget
 */
export { ClaudeChat } from './ClaudeChat';
export { useClaudeStream } from './useClaudeStream';
export type {
  ChatMessage,
  ChatStatus,
  ClaudeChatProps,
  UseClaudeStreamOptions,
} from './types';
