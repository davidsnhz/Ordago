import { rango, valorJuego, type Carta, type ModoReyes } from './carta';

/** Análisis de las 4 cartas de un jugador: puntos, pares y juego. */

/** A partir de 31 puntos se tiene juego. */
export const JUEGO_MINIMO = 31;

export type TipoPares = 'ninguno' | 'pareja' | 'medias' | 'duples';

export const TIPOS_PARES: readonly TipoPares[] = ['ninguno', 'pareja', 'medias', 'duples'];

export interface Pares {
  tipo: TipoPares;
  /** Rango de la pareja, de las medias o de la pareja alta de los duples (0 si no hay). */
  alto: number;
  /** Rango de la pareja baja de los duples (igual a `alto` con cuatro iguales; 0 en los demás). */
  bajo: number;
}

export function puntos(cartas: readonly Carta[], modo: ModoReyes): number {
  let suma = 0;
  for (const carta of cartas) suma += valorJuego(carta, modo);
  return suma;
}

export function tieneJuego(cartas: readonly Carta[], modo: ModoReyes): boolean {
  return puntos(cartas, modo) >= JUEGO_MINIMO;
}

/** Rangos ordenados de mayor a menor. */
export function rangosDeMayorAMenor(cartas: readonly Carta[], modo: ModoReyes): number[] {
  return cartas.map((carta) => rango(carta, modo)).sort((a, b) => b - a);
}

/**
 * Pareja: dos iguales. Medias: tres iguales. Duples: dos parejas o cuatro iguales.
 * A 8 reyes el tres empareja con el rey y el dos con el as; la sota y el caballo
 * son figuras distintas y no hacen pareja aunque valgan 10.
 */
export function analizarPares(cartas: readonly Carta[], modo: ModoReyes): Pares {
  const cuenta = new Array<number>(10).fill(0);
  for (const carta of cartas) cuenta[rango(carta, modo)]! += 1;

  const parejas: number[] = [];
  for (let r = cuenta.length - 1; r >= 0; r--) {
    const n = cuenta[r]!;
    if (n === 4) return { tipo: 'duples', alto: r, bajo: r };
    if (n === 3) return { tipo: 'medias', alto: r, bajo: 0 };
    if (n === 2) parejas.push(r);
  }
  if (parejas.length === 2) return { tipo: 'duples', alto: parejas[0]!, bajo: parejas[1]! };
  if (parejas.length === 1) return { tipo: 'pareja', alto: parejas[0]!, bajo: 0 };
  return { tipo: 'ninguno', alto: 0, bajo: 0 };
}

export function tienePares(cartas: readonly Carta[], modo: ModoReyes): boolean {
  return analizarPares(cartas, modo).tipo !== 'ninguno';
}
