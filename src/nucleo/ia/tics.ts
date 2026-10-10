import { IA } from '../../datos/ia';
import type { DefinicionTic, DisparadorTic } from '../../datos/rivales';
import type { Azar } from '../azar';
import { crearBaraja } from '../baraja';
import type { Carta, ModoReyes } from '../carta';
import type { Lance } from '../lances';
import { analizarPares, puntos, tieneJuego, tienePares } from '../mano';

/**
 * Tics del rival. Cuando se cumple su disparador, el tic aparece con una probabilidad fija
 * (60 %); cuando no, aparece a veces en falso. La frecuencia de los falsos se calcula para
 * que, de todas las veces que se ve el tic, la proporción de verdaderos sea su fiabilidad.
 */

/** Momentos en los que puede aparecer un tic. */
export type MomentoTic = { tipo: 'cartas' } | { tipo: 'declaracion' | 'envite'; lance: Lance };

export interface TicDisparado {
  id: string;
  /** Si el disparador se cumplía de verdad (solo para depuración y pruebas). */
  verdadero: boolean;
}

export function cumpleDisparador(disparador: DisparadorTic, cartas: readonly Carta[], modo: ModoReyes): boolean {
  switch (disparador) {
    case 'pares':
      return tienePares(cartas, modo);
    case 'duples':
      return analizarPares(cartas, modo).tipo === 'duples';
    case 'juego':
      return tieneJuego(cartas, modo);
    case 'treintaYUna':
      return puntos(cartas, modo) === 31;
  }
}

const tasasBase = new Map<string, number>();

/** Proporción de manos de 4 cartas que cumplen el disparador (se calcula una vez recorriéndolas todas). */
export function tasaBase(disparador: DisparadorTic, modo: ModoReyes): number {
  const clave = `${disparador}/${modo}`;
  const guardada = tasasBase.get(clave);
  if (guardada !== undefined) return guardada;
  const baraja = crearBaraja();
  let total = 0;
  let cumplen = 0;
  for (let i = 0; i < 40; i++)
    for (let j = i + 1; j < 40; j++)
      for (let k = j + 1; k < 40; k++)
        for (let l = k + 1; l < 40; l++) {
          total++;
          if (cumpleDisparador(disparador, [baraja[i]!, baraja[j]!, baraja[k]!, baraja[l]!], modo)) cumplen++;
        }
  const tasa = cumplen / total;
  tasasBase.set(clave, tasa);
  return tasa;
}

/**
 * Probabilidad de hacer el tic en falso. Con p = probabilidad si se cumple, q = tasa base y
 * f = fiabilidad: f = p·q / (p·q + falso·(1 − q))  ⇒  falso = p·q·(1 − f) / (f·(1 − q)).
 */
export function probabilidadEnFalso(tic: DefinicionTic, modo: ModoReyes): number {
  const p = IA.tics.probabilidadSiCumple;
  const q = tasaBase(tic.disparador, modo);
  const f = tic.fiabilidad;
  return Math.min(1, (p * q * (1 - f)) / (f * (1 - q)));
}

/** Tics que aparecen en este momento. */
export function sortearTics(
  tics: readonly DefinicionTic[],
  cartas: readonly Carta[],
  momento: MomentoTic,
  modo: ModoReyes,
  azar: Azar,
): TicDisparado[] {
  const disparados: TicDisparado[] = [];
  for (const tic of tics) {
    if (momento.tipo !== 'cartas' && !tic.lances.includes(momento.lance)) continue;
    const verdadero = cumpleDisparador(tic.disparador, cartas, modo);
    const probabilidad = verdadero ? IA.tics.probabilidadSiCumple : probabilidadEnFalso(tic, modo);
    if (azar.probabilidad(probabilidad)) disparados.push({ id: tic.id, verdadero });
  }
  return disparados;
}
