import type { Carta, ModoReyes } from './carta';
import type { Lado, PorLado } from './comun';
import { JUEGO_MINIMO, puntos, rangosDeMayorAMenor, TIPOS_PARES } from './mano';

/** El Punto sustituye al Juego cuando nadie tiene juego. */
export type Lance = 'grande' | 'chica' | 'pares' | 'juego' | 'punto';

export const LANCES: readonly Lance[] = ['grande', 'chica', 'pares', 'juego', 'punto'];

/**
 * Cada mano se resume, para cada lance, en un entero: cuanto mayor, mejor. Comparar dos
 * manos es restar sus claves, lo que permite recorrer miles de combinaciones deprisa
 * (la fuerza F de la IA usará exactamente estas claves).
 */
export function clave(lance: Lance, cartas: readonly Carta[], modo: ModoReyes): number {
  if (lance === 'juego') return claveJuego(puntos(cartas, modo));
  if (lance === 'punto') return puntos(cartas, modo);
  const [r0, r1, r2, r3] = rangosDeMayorAMenor(cartas, modo) as [number, number, number, number];
  if (lance === 'grande') return claveGrande(r0, r1, r2, r3);
  if (lance === 'chica') return claveChica(r0, r1, r2, r3);
  return clavePares(r0, r1, r2, r3);
}

// Claves a partir de los cuatro rangos ya ordenados de mayor a menor (r0 ≥ r1 ≥ r2 ≥ r3).
// Son funciones sueltas y sin memoria para que la fuerza de la IA pueda llamarlas miles de veces.

export function claveGrande(r0: number, r1: number, r2: number, r3: number): number {
  return ((r0 * 16 + r1) * 16 + r2) * 16 + r3;
}

/** En la Chica se compara de la carta más baja a la más alta, y gana la menor. */
export function claveChica(r0: number, r1: number, r2: number, r3: number): number {
  return 0xffff - (((r3 * 16 + r2) * 16 + r1) * 16 + r0);
}

/** Tipo de pares (ninguno 0, pareja 1, medias 2, duples 3) × 256 + rango alto × 16 + rango bajo. */
const PAREJA = TIPOS_PARES.indexOf('pareja') * 256;
const MEDIAS = TIPOS_PARES.indexOf('medias') * 256;
const DUPLES = TIPOS_PARES.indexOf('duples') * 256;

export function clavePares(r0: number, r1: number, r2: number, r3: number): number {
  if (r0 === r3) return DUPLES + r0 * 16 + r0;
  if (r0 === r2 || r1 === r3) return MEDIAS + r1 * 16;
  if (r0 === r1 && r2 === r3) return DUPLES + r0 * 16 + r2;
  if (r0 === r1) return PAREJA + r0 * 16;
  if (r1 === r2) return PAREJA + r1 * 16;
  if (r2 === r3) return PAREJA + r2 * 16;
  return 0;
}

/** 31 > 32 > 40 > 37 > 36 > 35 > 34 > 33. Sin juego, 0. */
export function claveJuego(suma: number): number {
  if (suma < JUEGO_MINIMO) return 0;
  if (suma === 31) return 100;
  if (suma === 32) return 99;
  return suma;
}

/** Positivo si gana `a`, negativo si gana `b` y 0 si empatan (sin aplicar el desempate). */
export function comparar(lance: Lance, a: readonly Carta[], b: readonly Carta[], modo: ModoReyes): number {
  return clave(lance, a, modo) - clave(lance, b, modo);
}

/** Ganador de un lance. En caso de empate gana `ganaEmpate`, que normalmente es la mano. */
export function ganadorLance(
  lance: Lance,
  cartas: PorLado<readonly Carta[]>,
  ganaEmpate: Lado,
  modo: ModoReyes,
): Lado {
  const diferencia = comparar(lance, cartas.jugador, cartas.rival, modo);
  if (diferencia > 0) return 'jugador';
  if (diferencia < 0) return 'rival';
  return ganaEmpate;
}
