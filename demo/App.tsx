import { ClaudeChat } from '../src';

/**
 * Local dev demo. `npm run dev` opens this page. The chat widget will try to
 * POST /api/chat — that endpoint isn't wired here, so sending a message will
 * show a connection error. The point is to see the UI + interactions live.
 *
 * To connect to a real backend, deploy the PHP proxy from
 * https://github.com/GronskiDeveloper/claude-chat-widget and set `endpoint`
 * to its URL.
 */
export function App() {
  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: '48px 24px' }}>
      <h1 style={{ margin: '0 0 12px', fontSize: 30 }}>
        @grodev/claude-chat-react
      </h1>
      <p style={{ color: '#b9b7d0', lineHeight: 1.6 }}>
        Floating chat launcher — bottom-right corner. Click to open. Sending a
        message will fail here because there is no backend wired to this static
        demo. See the README to plug in the PHP proxy.
      </p>

      <p style={{ color: '#8886a8', marginTop: 28, fontSize: 14 }}>
        Built by{' '}
        <a href="https://grodev.pl/ai" style={{ color: '#5DCAA5' }}>
          GroDev
        </a>{' '}
        · MIT
      </p>

      <ClaudeChat
        endpoint="/api/chat"
        title="Ask GroDev"
        greeting="Hi! I'm a local UI demo — sending will fail without a backend."
        accentColor="#1D9E75"
      />
    </main>
  );
}
