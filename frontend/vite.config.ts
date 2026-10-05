import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // A production build must know where the API is; it never falls back to localhost (src/services/apiConfig.ts).
  const apiBase = process.env.VITE_API_BASE_URL || loadEnv(mode, process.cwd(), 'VITE_').VITE_API_BASE_URL;
  if (command === 'build' && mode === 'production' && !apiBase) {
    throw new Error('VITE_API_BASE_URL is required for a production build (for example https://api.example.org/api).');
  }
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  };
});
