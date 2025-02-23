// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/google': {
        target: 'https://maps.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/google/, ''),
      },
      '/api/yelp': {
        target: 'https://api.yelp.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yelp/, ''),
      },
    },
  },
});