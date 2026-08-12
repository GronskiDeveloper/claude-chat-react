import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'demo',
  server: { port: 5182, open: true },
  plugins: [react()],
});
