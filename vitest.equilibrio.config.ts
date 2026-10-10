import { defineConfig } from 'vitest/config';

/**
 * Simulaciones de equilibrio (npm run equilibrio): cada rival contra un jugador sensato.
 * Tardan unos minutos, así que no van en `npm test`.
 */
export default defineConfig({
  test: {
    include: ['pruebas/**/*.sim.ts'],
    environment: 'node',
    silent: false,
  },
});
