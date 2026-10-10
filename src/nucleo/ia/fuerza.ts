import { crearBaraja } from '../baraja';
import { idCarta, rango, valorJuego, type Carta, type ModoReyes } from '../carta';
import { claveChica, claveGrande, claveJuego, clavePares, type Lance } from '../lances';
import { JUEGO_MINIMO, rangosDeMayorAMenor, puntos } from '../mano';

/**
 * Fuerza F de una mano: probabilidad de ganar cada lance contra una mano cualquiera del
 * otro jugador, que puede ser cualquier combinación de 4 de las 36 cartas que no se ven
 * (58.905). Solo usa las cartas propias: la IA no ve las del jugador.
 *
 * Las declaraciones ya filtran: a Pares solo se envida si los dos tienen, así que F de
 * Pares se mide contra manos con pares; igual con el Juego, y el Punto contra manos sin juego.
 */
export interface Fuerza {
  grande: number;
  chica: number;
  pares: number;
  juego: number;
  punto: number;
  /** Probabilidad de que el otro tenga pares. */
  otroConPares: number;
  /** Probabilidad de que el otro tenga juego. */
  otroConJuego: number;
}

export function fuerzaDelLance(fuerza: Fuerza, lance: Lance): number {
  return fuerza[lance];
}

/** `ganaEmpates`: si esta mano se lleva los empates (normalmente, si es mano). */
export function calcularFuerza(cartas: readonly Carta[], ganaEmpates: boolean, modo: ModoReyes): Fuerza {
  const vistas = new Set(cartas.map(idCarta));
  const resto = crearBaraja().filter((c) => !vistas.has(idCarta(c)));
  const r = resto.map((c) => rango(c, modo));
  const v = resto.map((c) => valorJuego(c, modo));

  const [p0, p1, p2, p3] = rangosDeMayorAMenor(cartas, modo) as [number, number, number, number];
  const propia = {
    grande: claveGrande(p0, p1, p2, p3),
    chica: claveChica(p0, p1, p2, p3),
    pares: clavePares(p0, p1, p2, p3),
    juego: claveJuego(puntos(cartas, modo)),
    punto: puntos(cartas, modo),
  };
  // Gana si la clave propia es mayor, o igual y se lleva los empates.
  const gana = (mia: number, suya: number) => mia > suya || (mia === suya && ganaEmpates);

  let total = 0;
  let grande = 0;
  let chica = 0;
  let conPares = 0;
  let pares = 0;
  let conJuego = 0;
  let juego = 0;
  let sinJuego = 0;
  let punto = 0;

  const n = resto.length;
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      for (let k = j + 1; k < n; k++)
        for (let l = k + 1; l < n; l++) {
          // Ordenar 4 rangos de mayor a menor con una red de comparaciones.
          let a = r[i]!, b = r[j]!, c = r[k]!, d = r[l]!, t: number;
          if (a < b) { t = a; a = b; b = t; }
          if (c < d) { t = c; c = d; d = t; }
          if (a < c) { t = a; a = c; c = t; }
          if (b < d) { t = b; b = d; d = t; }
          if (b < c) { t = b; b = c; c = t; }

          total++;
          if (gana(propia.grande, claveGrande(a, b, c, d))) grande++;
          if (gana(propia.chica, claveChica(a, b, c, d))) chica++;
          const suyosPares = clavePares(a, b, c, d);
          if (suyosPares > 0) {
            conPares++;
            if (gana(propia.pares, suyosPares)) pares++;
          }
          const suma = v[i]! + v[j]! + v[k]! + v[l]!;
          if (suma >= JUEGO_MINIMO) {
            conJuego++;
            if (gana(propia.juego, claveJuego(suma))) juego++;
          } else {
            sinJuego++;
            if (gana(propia.punto, suma)) punto++;
          }
        }

  const proporcion = (parte: number, todo: number) => (todo === 0 ? 0 : parte / todo);
  return {
    grande: proporcion(grande, total),
    chica: proporcion(chica, total),
    pares: proporcion(pares, conPares),
    juego: proporcion(juego, conJuego),
    punto: proporcion(punto, sinJuego),
    otroConPares: proporcion(conPares, total),
    otroConJuego: proporcion(conJuego, total),
  };
}
