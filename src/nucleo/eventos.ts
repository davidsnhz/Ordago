import type { AccionEnvite, ResultadoEnvite } from './apuestas';
import type { Carta } from './carta';
import type { Lado, PorLado } from './comun';
import type { Lance } from './lances';
import type { Cobro, CobrosDeLaMano, ModoLance } from './recuento';

export type MotivoFin = 'piedras' | 'ordago';

/**
 * Lo que pasa en el duelo, en orden. Cada acción devuelve sus eventos: la interfaz los
 * anima y la gira los usa para reales, Honra, Cara, Libreta y efectos de objetos.
 * Ojo: algunos eventos llevan las cartas de los dos; la IA no debe leerlas.
 */
export type EventoDuelo =
  | { tipo: 'reparto'; numeroMano: number; quienEsMano: Lado; cartas: PorLado<Carta[]> }
  | { tipo: 'mus'; lado: Lado; quiereMus: boolean }
  | { tipo: 'descarte'; lado: Lado; descartadas: Carta[]; robadas: Carta[] }
  | { tipo: 'rebarajado'; cartas: number }
  | { tipo: 'inicioLance'; lance: Lance }
  | { tipo: 'declaracion'; lance: 'pares' | 'juego'; lado: Lado; tiene: boolean }
  | { tipo: 'envite'; lance: Lance; lado: Lado; accion: AccionEnvite }
  | { tipo: 'deje'; lance: Lance; lado: Lado; piedras: number; marcador: PorLado<number> }
  | { tipo: 'finLance'; lance: Lance; modo: ModoLance; resultado: ResultadoEnvite | null }
  | { tipo: 'ordago'; lance: Lance; lanzador: Lado; ganador: Lado; cartas: PorLado<Carta[]> }
  | {
      tipo: 'recuento';
      cobros: Cobro[];
      /** Cuántos de los cobros se apuntaron antes de que alguien llegara a la meta. */
      aplicados: number;
      ganadores: CobrosDeLaMano['ganadores'];
      cartas: PorLado<Carta[]>;
      marcador: PorLado<number>;
    }
  | { tipo: 'finMano'; numeroMano: number; marcador: PorLado<number> }
  | { tipo: 'finDuelo'; ganador: Lado; motivo: MotivoFin; marcador: PorLado<number> };
