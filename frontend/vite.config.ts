import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4000, // PostgreSQL frontend runs on port 4000
    host: '0.0.0.0', // Allow external connections
    proxy: {
      '/api': {
        target: 'http://localhost:4001', // PostgreSQL backend on port 4001
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 4000,
    host: '0.0.0.0',
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});