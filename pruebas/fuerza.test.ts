import { describe, expect, it } from 'vitest';
import { crearBaraja } from '../src/nucleo/baraja';
import { idCarta, type Carta } from '../src/nucleo/carta';
import { calcularFuerza } from '../src/nucleo/ia/fuerza';
import { comparar, type Lance } from '../src/nucleo/lances';
import { tieneJuego, tienePares } from '../src/nucleo/mano';
import { cartas } from './ayudas';

/** Cálculo lento y directo con `comparar`, para contrastar. */
function referencia(propias: Carta[], ganaEmpates: boolean, lance: Lance, filtro: (m: Carta[]) => boolean = () => true) {
  const vistas = new Set(propias.map(idCarta));
  const resto = crearBaraja().filter((c) => !vistas.has(idCarta(c)));
  let total = 0;
  let gana = 0;
  for (let i = 0; i < resto.length; i++)
    for (let j = i + 1; j < resto.length; j++)
      for (let k = j + 1; k < resto.length; k++)
        for (let l = k + 1; l < resto.length; l++) {
          const otra = [resto[i]!, resto[j]!, resto[k]!, resto[l]!];
          if (!filtro(otra)) continue;
          total++;
          const d = comparar(lance, propias, otra, 8);
          if (d > 0 || (d === 0 && ganaEmpates)) gana++;
        }
  return gana / total;
}

describe('fuerza F de una mano', () => {
  it('coincide exactamente con el recuento directo de las 58.905 manos', () => {
    for (const [mano, esMano] of [['R R 7 4', true], ['A 2 5 S', false], ['C C 6 6', true]] as const) {
      const propias = cartas(mano);
      const f = calcularFuerza(propias, esMano, 8);
      expect(f.grande).toBeCloseTo(referencia(propias, esMano, 'grande'), 12);
      expect(f.chica).toBeCloseTo(referencia(propias, esMano, 'chica'), 12);
      expect(f.pares).toBeCloseTo(referencia(propias, esMano, 'pares', (m) => tienePares(m, 8)), 12);
      expect(f.juego).toBeCloseTo(referencia(propias, esMano, 'juego', (m) => tieneJuego(m, 8)), 12);
      expect(f.punto).toBeCloseTo(referencia(propias, esMano, 'punto', (m) => !tieneJuego(m, 8)), 12);
    }
  }, 60_000);

  it('cuatro reyes siendo mano ganan siempre a la Grande; siendo postre, casi siempre', () => {
    expect(calcularFuerza(cartas('R R 3 3'), true, 8).grande).toBe(1);
    const postre = calcularFuerza(cartas('R R 3 3'), false, 8).grande;
    expect(postre).toBeLessThan(1);
    expect(postre).toBeGreaterThan(0.99);
  });

  it('cuatro ases siendo mano ganan siempre a la Chica', () => {
    expect(calcularFuerza(cartas('A A 2 2'), true, 8).chica).toBe(1);
  });

  it('sin pares no se gana a Pares, y sin juego no se gana al Juego', () => {
    const f = calcularFuerza(cartas('R C 7 4'), true, 8);
    expect(f.pares).toBe(0);
    expect(cartas('R C 7 4').length).toBe(4);
    expect(calcularFuerza(cartas('R C 5 4'), true, 8).juego).toBe(0);
  });

  it('el solomillo gana casi siempre a la Grande y C 7 5 4 casi nunca', () => {
    expect(calcularFuerza(cartas('R R R A'), false, 8).grande).toBeGreaterThan(0.99);
    expect(calcularFuerza(cartas('C 7 5 4'), false, 8).grande).toBeLessThan(0.5);
  });

  it('todas las probabilidades están entre 0 y 1 y es rápida', () => {
    const inicio = performance.now();
    const f = calcularFuerza(cartas('S 7 5 2'), false, 8);
    expect(performance.now() - inicio).toBeLessThan(250);
    for (const valor of Object.values(f)) {
      expect(valor).toBeGreaterThanOrEqual(0);
      expect(valor).toBeLessThanOrEqual(1);
    }
    expect(f.otroConPares).toBeGreaterThan(0.3);
    expect(f.otroConJuego).toBeGreaterThan(0.2);
  });
});
