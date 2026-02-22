import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  // Allow importing from parent directories (shared engine, data, lib)
  server: {
    fs: {
      allow: [
        // The web/ directory itself
        '.',
        // Parent project root (engine/, data/, lib/, ai/)
        '..',
      ],
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

  // GitHub Pages: adjust base path if deploying to a subdirectory
  // If your repo is username.github.io/shattered-dungeon, set:
  // base: '/shattered-dungeon/',
  // If deploying to root (username.github.io), leave as '/':
  base: '/',
});
