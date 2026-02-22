import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  // Allow importing from parent directories (shared engine, data, lib)
  server: {
    fs: {
      allow: ['.', '..'],
    },
  },

  // Resolve aliases for cleaner imports
  resolve: {
    alias: {
      '@engine': path.resolve(__dirname, '../engine'),
      '@ai': path.resolve(__dirname, '../ai'),
      '@lib': path.resolve(__dirname, '../lib'),
      '@data': path.resolve(__dirname, '../data'),
    },
  },

  // GitHub Pages deployment
  base: '/Simulator/',
});
