import { describe, expect, it } from 'vitest';
import { IA } from '../src/datos/ia';
import { RIVALES } from '../src/datos/rivales';
import { Azar } from '../src/nucleo/azar';
import { crearBaraja } from '../src/nucleo/baraja';
import { probabilidadEnFalso, sortearTics, tasaBase } from '../src/nucleo/ia/tics';
import { cartas } from './ayudas';

const TICS = RIVALES.ruperto.tics;

describe('tics de Ruperto', () => {
  it('las tasas base son razonables: pares en muchas manos, 31 en pocas', () => {
    expect(tasaBase('pares', 8)).toBeGreaterThan(0.3);
    expect(tasaBase('pares', 8)).toBeLessThan(0.7);
    expect(tasaBase('treintaYUna', 8)).toBeGreaterThan(0.02);
    expect(tasaBase('treintaYUna', 8)).toBeLessThan(0.2);
  });

  it('la probabilidad de hacerlo en falso da exactamente la fiabilidad de la tabla', () => {
    for (const tic of TICS) {
      const p = IA.tics.probabilidadSiCumple;
      const q = tasaBase(tic.disparador, 8);
      const falso = probabilidadEnFalso(tic, 8);
      expect(falso).toBeGreaterThan(0);
      expect((p * q) / (p * q + falso * (1 - q))).toBeCloseTo(tic.fiabilidad, 10);
    }
  });

  it('jugando muchas manos, la fiabilidad observada es la de la tabla (85 % y 80 %)', () => {
    const azar = Azar.conSemilla('tics');
    const baraja = crearBaraja();
    const vistos = new Map<string, { veces: number; verdaderos: number }>();
    for (let i = 0; i < 150_000; i++) {
      const mano = azar.barajar(baraja).slice(0, 4);
      for (const tic of sortearTics(TICS, mano, { tipo: 'cartas' }, 8, azar)) {
        const cuenta = vistos.get(tic.id) ?? { veces: 0, verdaderos: 0 };
        cuenta.veces++;
        if (tic.verdadero) cuenta.verdaderos++;
        vistos.set(tic.id, cuenta);
      }
    }
    for (const tic of TICS) {
      const { veces, verdaderos } = vistos.get(tic.id)!;
      expect(verdaderos / veces).toBeGreaterThan(tic.fiabilidad - 0.03);
      expect(verdaderos / veces).toBeLessThan(tic.fiabilidad + 0.03);
    }
  }, 60_000);

  it('al declarar o envidar solo aparece el tic de ese lance', () => {
    const azar = { siguiente: () => 0, probabilidad: () => true } as unknown as Azar;
    const mano = cartas('R R 7 4'); // pareja de reyes y 31
    expect(sortearTics(TICS, mano, { tipo: 'cartas' }, 8, azar).map((t) => t.id)).toEqual(['rascaBarba', 'arremanga']);
    expect(sortearTics(TICS, mano, { tipo: 'declaracion', lance: 'pares' }, 8, azar).map((t) => t.id)).toEqual(['rascaBarba']);
    expect(sortearTics(TICS, mano, { tipo: 'envite', lance: 'juego' }, 8, azar).map((t) => t.id)).toEqual(['arremanga']);
    expect(sortearTics(TICS, mano, { tipo: 'envite', lance: 'grande' }, 8, azar)).toEqual([]);
  });

  it('marca si el tic era verdad', () => {
    const siempre = { siguiente: () => 0, probabilidad: () => true } as unknown as Azar;
    expect(sortearTics(TICS, cartas('R R 7 4'), { tipo: 'cartas' }, 8, siempre).every((t) => t.verdadero)).toBe(true);
    expect(sortearTics(TICS, cartas('A 4 5 6'), { tipo: 'cartas' }, 8, siempre).every((t) => !t.verdadero)).toBe(true);
  });
});
