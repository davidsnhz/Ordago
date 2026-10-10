import type { Carta, ModoReyes } from './carta';
import type { Lado, PorLado } from './comun';
import { analizarPares, JUEGO_MINIMO, puntos, rangosDeMayorAMenor, TIPOS_PARES } from './mano';

/** El Punto sustituye al Juego cuando nadie tiene juego. */
export type Lance = 'grande' | 'chica' | 'pares' | 'juego' | 'punto';

export const LANCES: readonly Lance[] = ['grande', 'chica', 'pares', 'juego', 'punto'];

/**
 * Cada mano se resume, para cada lance, en un entero: cuanto mayor, mejor. Comparar dos
 * manos es restar sus claves, lo que permite recorrer miles de combinaciones deprisa
 * (la fuerza F de la IA usará exactamente estas claves).
 */
export function clave(lance: Lance, cartas: readonly Carta[], modo: ModoReyes): number {
  switch (lance) {
    case 'grande':
      return empaquetar(rangosDeMayorAMenor(cartas, modo));
    case 'chica':
      // En la Chica se compara de la carta más baja a la más alta, y gana la menor.
      return 0xffff - empaquetar(rangosDeMayorAMenor(cartas, modo).reverse());
    case 'pares': {
      const pares = analizarPares(cartas, modo);
      return TIPOS_PARES.indexOf(pares.tipo) * 256 + pares.alto * 16 + pares.bajo;
    }
    case 'juego':
      return claveJuego(puntos(cartas, modo));
    case 'punto':
      return puntos(cartas, modo);
  }
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

function empaquetar(rangos: readonly number[]): number {
  let valor = 0;
  for (const r of rangos) valor = valor * 16 + r;
  return valor;
}
