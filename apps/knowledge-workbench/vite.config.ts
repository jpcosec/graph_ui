import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Mock-only for now, on purpose (DESIGN.md §3). No SLDB proxy yet.
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: {
    host: '127.0.0.1',
    port: 5174,
    // Same-origin proxy so the browser never needs CORS on sldb serve.
    proxy: {
      '/sldb': {
        target: process.env.VITE_SLDB_TARGET || 'http://127.0.0.1:8810',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/sldb/, ''),
      },
    },
  },
  test: {
    environment: 'node',
    globals: true,
  },
});
