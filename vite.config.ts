import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import os from 'os';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  cacheDir: path.join(os.tmpdir(), 'vite-reading-subject-cache'),
  base: process.env.VITE_BASE_PATH || './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 3000,
    open: false,
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          docx: ['docx'],
          n3: ['n3'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
} as any);
