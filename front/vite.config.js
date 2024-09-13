import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    open: true,
    port: 3000,
    hmr: true,
    watch: {
      usePolling: true,
    },
  },
  plugins: [
    react({
      include: '**/*.jsx',
    }),
    eslint(),
  ],
});
