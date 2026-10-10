/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Rutas relativas para poder publicar la build en cualquier subcarpeta (GitHub Pages).
  base: './',
  plugins: [react()],
  test: {
    include: ['pruebas/**/*.test.ts'],
    environment: 'node',
  },
});
