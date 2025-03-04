import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy works only in development, so we keep it for local testing
    proxy: process.env.NODE_ENV === 'development'
      ? {
          '/api/google': {
            target: 'https://maps.googleapis.com',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/google/, ''),
          }
        }
      : undefined,
  },
});