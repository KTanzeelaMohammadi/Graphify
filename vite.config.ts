/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const geminiKey = env.gemini_api_key || env.GEMINI_API_KEY || '';

  return {
    base: './',
    plugins: [react()],
    envPrefix: ['VITE_', 'gemini_', 'GEMINI_'],
    define: {
      __GEMINI_API_KEY__: JSON.stringify(geminiKey),
    },
    server: {
      allowedHosts: true,
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/tests/setup.ts',
    },
  };
});
