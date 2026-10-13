import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { ORDEN_RIVALES, RIVALES, type IdRival } from '../src/datos/rivales';
import type { ManifiestoPersonaje } from '../src/ui/componentes/Retrato';

/** El arte que genera `npm run personajes` tiene que cuadrar con lo que el retrato sabe leer. */

const CARPETA = 'public/arte/personajes';
const leer = <T>(ruta: string): T => JSON.parse(fs.readFileSync(path.join(CARPETA, ruta), 'utf8')) as T;
const indice = leer<{ personajes: string[] }>('indice.json');

/** Todos los tics que puede hacer un rival, también los de las fases de Don Rodrigo. */
const ticsDe = (id: IdRival) => {
  const perfil = RIVALES[id];
  return new Set([...perfil.tics, ...(perfil.fasesDeTics ?? []).flatMap((f) => f.tics)].map((t) => t.id));
};

describe('arte de los personajes', () => {
  it('el índice solo nombra rivales que existen', () => {
    for (const id of indice.personajes) expect(ORDEN_RIVALES).toContain(id);
  });

  for (const id of indice.personajes as IdRival[]) {
    describe(id, () => {
      const manifiesto = leer<ManifiestoPersonaje>(`${id}/manifiesto.json`);

      it('tiene reposo dibujado', () => {
        expect(manifiesto.animaciones['reposo']?.tipo).not.toBe('efecto');
        expect(manifiesto.animaciones['reposo']).toBeDefined();
      });

      it('sus animaciones apuntan a imágenes que existen', () => {
        for (const animacion of Object.values(manifiesto.animaciones)) {
          if (animacion.tipo === 'efecto') {
            expect(animacion.x).toBeGreaterThanOrEqual(0);
            expect(animacion.x).toBeLessThanOrEqual(1);
            expect(animacion.y).toBeGreaterThanOrEqual(0);
            expect(animacion.y).toBeLessThanOrEqual(1);
            continue;
          }
          if (animacion.efecto) {
            expect(animacion.efecto.x).toBeGreaterThanOrEqual(0);
            expect(animacion.efecto.x).toBeLessThanOrEqual(1);
            expect(animacion.efecto.y).toBeGreaterThanOrEqual(0);
            expect(animacion.efecto.y).toBeLessThanOrEqual(1);
          }
          const archivos = animacion.tipo === 'hoja' ? [animacion.archivo] : animacion.archivos;
          expect(archivos.length).toBeGreaterThan(0);
          for (const archivo of archivos) expect(fs.existsSync(path.join(CARPETA, id, archivo)), `${id}/${archivo}`).toBe(true);
        }
      });

      it('cada tic dibujado es un tic de verdad del rival', () => {
        const tics = ticsDe(id);
        for (const nombre of Object.keys(manifiesto.animaciones).filter((n) => n.startsWith('tic_')))
          expect(tics.has(nombre.slice(4)), `${id}: ${nombre}`).toBe(true);
      });
    });
  }
});
