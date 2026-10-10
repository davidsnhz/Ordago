import { describe, expect, it } from 'vitest';
import { crearBaraja } from '../src/nucleo/baraja';
import type { Carta, Numero } from '../src/nucleo/carta';
import { PALOS } from '../src/nucleo/carta';
import type { Lado } from '../src/nucleo/comun';
import { clave, comparar, ganadorLance, LANCES, type Lance } from '../src/nucleo/lances';
import { puntos } from '../src/nucleo/mano';
import { cartas } from './ayudas';

/** Gana `a` (+1), gana `b` (−1) o empatan (0), sin desempate. */
const cmp = (lance: Lance, a: string, b: string) => Math.sign(comparar(lance, cartas(a), cartas(b), 8));

/** Ganador con las dos manos repartidas a la vez (sin cartas repetidas). */
function gana(lance: Lance, jugador: string, rival: string, ganaEmpate: Lado): Lado {
  const usadas = new Set<string>();
  const manos = { jugador: cartas(jugador, usadas), rival: cartas(rival, usadas) };
  return ganadorLance(lance, manos, ganaEmpate, 8);
}

describe('Grande', () => {
  it('se compara carta a carta de mayor a menor', () => {
    expect(cmp('grande', 'R R 7 4', 'R C C C')).toBe(1);
    expect(cmp('grande', 'C C C C', 'R A A A')).toBe(-1);
    expect(cmp('grande', 'R C 7 5', 'R C 7 4')).toBe(1);
  });

  it('el tres cuenta como rey', () => {
    expect(cmp('grande', 'R C 7 4', '3 C 7 4')).toBe(0);
    expect(cmp('grande', '3 3 3 3', 'R R R C')).toBe(1);
  });

  it('en empate gana la mano, sea quien sea', () => {
    expect(gana('grande', 'R C 7 4', '3 C 7 4', 'jugador')).toBe('jugador');
    expect(gana('grande', 'R C 7 4', '3 C 7 4', 'rival')).toBe('rival');
  });
});

describe('Chica', () => {
  it('se compara de la carta más baja a la más alta y gana la menor', () => {
    expect(cmp('chica', 'A A 4 5', 'A 4 4 5')).toBe(1);
    expect(cmp('chica', 'A 4 5 6', 'A 4 5 7')).toBe(1);
    expect(cmp('chica', 'A R R R', '4 4 4 4')).toBe(1);
  });

  it('el dos cuenta como as', () => {
    expect(cmp('chica', '2 2 A A', 'A A A A')).toBe(0);
    expect(gana('chica', '2 2 A A', '2 A 2 A', 'rival')).toBe('rival');
  });
});

describe('Pares', () => {
  it('duples > medias > pareja > sin pares', () => {
    expect(cmp('pares', 'A A 4 4', 'R R R 7')).toBe(1);
    expect(cmp('pares', '4 4 4 R', 'R R C S')).toBe(1);
    expect(cmp('pares', 'A A 4 5', 'R C S 7')).toBe(1);
  });

  it('los duples se comparan por la pareja alta y después por la baja', () => {
    expect(cmp('pares', 'R R 5 5', 'R R 4 4')).toBe(1);
    expect(cmp('pares', 'R R 4 4', 'C C S S')).toBe(1);
    expect(cmp('pares', 'C C A A', 'S S 7 7')).toBe(1);
  });

  it('cuatro reyes (R R 3 3) ganan a reyes y caballos', () => {
    expect(cmp('pares', 'R R 3 3', 'R R C C')).toBe(1);
  });

  it('medias y parejas se comparan por su rango', () => {
    expect(cmp('pares', 'R R 3 7', 'C C C 7')).toBe(1);
    expect(cmp('pares', 'R 3 5 6', 'C C 5 6')).toBe(1);
  });

  it('con la misma pareja las cartas sueltas no cuentan: gana la mano', () => {
    expect(cmp('pares', 'R R 5 6', 'R 3 4 7')).toBe(0);
    expect(gana('pares', 'R R 5 6', 'R 3 4 7', 'rival')).toBe('rival');
  });
});

describe('Juego', () => {
  // De mejor a peor: 31 > 32 > 40 > 37 > 36 > 35 > 34 > 33.
  const ORDEN = [
    ['R R 7 4', 31],
    ['R R 7 5', 32],
    ['R R R R', 40],
    ['R R R 7', 37],
    ['R R R 6', 36],
    ['R R R 5', 35],
    ['R R 7 7', 34],
    ['R R 7 6', 33],
  ] as const;

  it('las manos de la tabla suman lo que dicen', () => {
    for (const [mano, suma] of ORDEN) expect(puntos(cartas(mano), 8)).toBe(suma);
  });

  it('respeta el orden completo en las 64 combinaciones', () => {
    ORDEN.forEach(([a], i) => {
      ORDEN.forEach(([b], j) => {
        expect(cmp('juego', a, b)).toBe(Math.sign(j - i));
      });
    });
  });

  it('cualquier juego gana a no tener juego', () => {
    expect(cmp('juego', 'R R 7 6', 'R R 5 5')).toBe(1);
  });

  it('con el mismo juego gana la mano', () => {
    expect(gana('juego', 'R C S A', 'R R 7 4', 'jugador')).toBe('jugador');
    expect(gana('juego', 'R C S A', 'R R 7 4', 'rival')).toBe('rival');
  });
});

describe('Punto', () => {
  it('gana el más cercano a 30', () => {
    expect(cmp('punto', 'R R 5 5', 'R R 5 4')).toBe(1);
    expect(cmp('punto', 'R R 5 4', '2 2 A A')).toBe(1);
  });

  it('en empate gana la mano', () => {
    expect(gana('punto', 'R R 5 5', 'C S 6 4', 'rival')).toBe('rival');
  });
});

// ——— Comprobaciones exhaustivas contra una implementación de referencia ———

/** Orden de la tabla del documento: cada grupo es un rango, de as a rey. */
const RANGOS: readonly (readonly Numero[])[] = [[1, 2], [4], [5], [6], [7], [10], [11], [12, 3]];
const rangoRef = (c: Carta) => RANGOS.findIndex((grupo) => grupo.includes(c.numero));
const valorRef = (c: Carta) => (c.numero >= 10 || c.numero === 3 ? 10 : c.numero === 2 ? 1 : c.numero);
const sumaRef = (m: readonly Carta[]) => m.reduce((s, c) => s + valorRef(c), 0);

function lexico(a: readonly number[], b: readonly number[]): number {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return Math.sign(a[i]! - b[i]!);
  return 0;
}

function paresRef(m: readonly Carta[]): number[] {
  const cuenta = new Map<number, number>();
  for (const c of m) cuenta.set(rangoRef(c), (cuenta.get(rangoRef(c)) ?? 0) + 1);
  const grupos = [...cuenta].filter(([, n]) => n >= 2).sort((x, y) => y[0] - x[0]);
  const [primero, segundo] = grupos;
  if (primero && primero[1] === 4) return [3, primero[0], primero[0]];
  if (primero && segundo) return [3, primero[0], segundo[0]];
  if (primero && primero[1] === 3) return [2, primero[0], 0];
  if (primero) return [1, primero[0], 0];
  return [0, 0, 0];
}

const ORDEN_JUEGO = [31, 32, 40, 37, 36, 35, 34, 33];
const puestoJuego = (s: number) => (s >= 31 ? ORDEN_JUEGO.indexOf(s) : ORDEN_JUEGO.length);

function referencia(lance: Lance, a: readonly Carta[], b: readonly Carta[]): number {
  const desc = (m: readonly Carta[]) => m.map(rangoRef).sort((x, y) => y - x);
  const asc = (m: readonly Carta[]) => m.map(rangoRef).sort((x, y) => x - y);
  switch (lance) {
    case 'grande':
      return lexico(desc(a), desc(b));
    case 'chica':
      return -lexico(asc(a), asc(b));
    case 'pares':
      return lexico(paresRef(a), paresRef(b));
    case 'juego':
      return Math.sign(puestoJuego(sumaRef(b)) - puestoJuego(sumaRef(a)));
    case 'punto':
      return Math.sign(sumaRef(a) - sumaRef(b));
  }
}

/** Una mano por cada combinación de 4 rangos (con repetición): 330 clases. */
function clasesDeRangos(): Carta[][] {
  const representante: Numero[] = [1, 4, 5, 6, 7, 10, 11, 12];
  const clases: Carta[][] = [];
  for (let a = 0; a < 8; a++)
    for (let b = a; b < 8; b++)
      for (let c = b; c < 8; c++)
        for (let d = c; d < 8; d++) {
          const vistos = new Map<number, number>();
          clases.push(
            [a, b, c, d].map((r) => {
              const n = vistos.get(r) ?? 0;
              vistos.set(r, n + 1);
              return { numero: representante[r]!, palo: PALOS[n]! };
            }),
          );
        }
  return clases;
}

describe('comprobaciones exhaustivas (8 reyes)', () => {
  const clases = clasesDeRangos();

  it('hay 330 combinaciones de rangos', () => {
    expect(clases).toHaveLength(330);
  });

  for (const lance of LANCES) {
    it(`${lance}: coincide con la referencia en las 330 × 330 parejas y es un orden total`, () => {
      for (const a of clases) {
        expect(comparar(lance, a, a, 8)).toBe(0);
        for (const b of clases) {
          const motor = Math.sign(comparar(lance, a, b, 8));
          if (motor !== referencia(lance, a, b)) {
            throw new Error(`${lance}: ${JSON.stringify(a)} contra ${JSON.stringify(b)}`);
          }
          // Antisimetría.
          if (motor !== -Math.sign(comparar(lance, b, a, 8))) throw new Error('No es antisimétrico');
        }
      }
    });
  }

  it('las 91.390 manos posibles valen lo mismo que su clase de rangos (el 3 es rey y el 2 es as)', () => {
    const baraja = crearBaraja();
    const porClase = new Map<string, number[]>();
    for (const clase of clases) {
      porClase.set(
        clase.map(rangoRef).join(','),
        LANCES.map((l) => clave(l, clase, 8)),
      );
    }
    let total = 0;
    const sumasConJuego = new Set<number>();
    for (let i = 0; i < 40; i++)
      for (let j = i + 1; j < 40; j++)
        for (let k = j + 1; k < 40; k++)
          for (let l = k + 1; l < 40; l++) {
            const mano = [baraja[i]!, baraja[j]!, baraja[k]!, baraja[l]!];
            const esperado = porClase.get(mano.map(rangoRef).sort((x, y) => x - y).join(','))!;
            const obtenido = LANCES.map((lance) => clave(lance, mano, 8));
            if (obtenido.some((v, n) => v !== esperado[n])) throw new Error(`Mano distinta de su clase: ${JSON.stringify(mano)}`);
            const suma = puntos(mano, 8);
            if (suma >= 31) sumasConJuego.add(suma);
            total++;
          }
    expect(total).toBe(91_390);
    // 38 y 39 son imposibles.
    expect([...sumasConJuego].sort((x, y) => x - y)).toEqual([31, 32, 33, 34, 35, 36, 37, 40]);
  });
});

describe('4 reyes', () => {
  it('el rey gana al tres y el dos gana al as', () => {
    expect(Math.sign(comparar('grande', cartas('R 4 5 6'), cartas('3 4 5 6'), 4))).toBe(1);
    expect(Math.sign(comparar('chica', cartas('A 4 5 6'), cartas('2 4 5 6'), 4))).toBe(1);
  });

  it('R R 7 3 no tiene juego (30) y sí lo tiene a 8 reyes (37)', () => {
    expect(clave('juego', cartas('R R 7 3'), 4)).toBe(0);
    expect(clave('juego', cartas('R R 7 3'), 8)).toBeGreaterThan(0);
  });
});
