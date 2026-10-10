import type { Azar } from './azar';
import { NUMEROS, PALOS, type Carta } from './carta';
import { otroLado, type Lado, type PorLado } from './comun';

export const CARTAS_POR_MANO = 4;

/** Las 40 cartas en orden fijo: oros, copas, espadas y bastos, del as al rey. */
export function crearBaraja(): Carta[] {
  return PALOS.flatMap((palo) => NUMEROS.map((numero) => ({ numero, palo })));
}

/**
 * Las cartas que no están en la mano de nadie. Las funciones de este archivo modifican
 * el mazo que reciben; el duelo siempre trabaja sobre una copia de su estado.
 */
export interface Mazo {
  /** Cartas por robar; se roban desde el principio. */
  cartas: Carta[];
  /** Descartes de rondas de mus anteriores: se rebarajan si se acaba el mazo. */
  descartes: Carta[];
  /** Descartes de la ronda de mus en curso: no vuelven al mazo hasta la ronda siguiente. */
  descartesRonda: Carta[];
}

export function crearMazo(azar: Azar): Mazo {
  return { cartas: azar.barajar(crearBaraja()), descartes: [], descartesRonda: [] };
}

/**
 * Roba `n` cartas. Si el mazo se acaba, se reparten las que queden y se rebarajan
 * los descartes de rondas anteriores para seguir, como en la mesa.
 */
export function robar(mazo: Mazo, n: number, azar: Azar): { robadas: Carta[]; rebarajadas: number } {
  const robadas = mazo.cartas.splice(0, n);
  let rebarajadas = 0;
  if (robadas.length < n) {
    rebarajadas = mazo.descartes.length;
    mazo.cartas = azar.barajar(mazo.descartes);
    mazo.descartes = [];
    robadas.push(...mazo.cartas.splice(0, n - robadas.length));
  }
  if (robadas.length < n) {
    throw new Error(`No quedan cartas para robar ${n}`);
  }
  return { robadas, rebarajadas };
}

/** Los descartes de la ronda que acaba pasan a poder rebarajarse. */
export function cerrarRondaDeDescartes(mazo: Mazo): void {
  mazo.descartes.push(...mazo.descartesRonda);
  mazo.descartesRonda = [];
}

/** Reparte 4 cartas a cada uno, de una en una y empezando por la mano. */
export function repartir(mazo: Mazo, quienEsMano: Lado): PorLado<Carta[]> {
  const cartas: PorLado<Carta[]> = { jugador: [], rival: [] };
  let turno = quienEsMano;
  for (let i = 0; i < CARTAS_POR_MANO * 2; i++) {
    const carta = mazo.cartas.shift();
    if (!carta) throw new Error('No quedan cartas para repartir');
    cartas[turno].push(carta);
    turno = otroLado(turno);
  }
  return cartas;
}
