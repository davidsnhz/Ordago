import type { Lance } from '../nucleo/lances';

/** Rivales: parámetros de la IA, forma de jugar el mus y tics. Sus textos están en textos/es.ts. */

export type IdRival = 'ruperto' | 'engracia' | 'anselmo' | 'fulgencio' | 'bonifacio';

/** De 0 a 10 (tabla «Los 5 rivales» del documento). */
export interface ParametrosRival {
  agresividad: number;
  faroleo: number;
  miedoOrdago: number;
  memoria: number;
  ojo: number;
}

/** Manos con las que se corta el mus. */
export type PatronCorte =
  | 'tresReyes' // tres o cuatro reyes (incluye el solomillo)
  | 'treintaYUna'
  | 'duplesConReyes' // duples con una pareja de reyes: R R C C, R R A A
  | 'dosReyesYFigura' // dos reyes y un caballo o una sota
  | 'parejaDeReyes'
  | 'tresPitos' // tres ases o doses
  | 'solomillo' // R R R A
  | 'treintaYUnaConPareja';

/** Qué cartas se guardan al descartar; el resto se tira. */
export type QueGuarda = 'reyes' | 'parejas' | 'ases' | 'figuras' | 'sietes';

export interface EstiloMus {
  corta: PatronCorte[];
  guarda: QueGuarda[];
  /** Probabilidad de cortar de farol con una mano que no está en su lista. */
  farolDeCorte: number;
}

/** Situaciones que disparan un tic y que solo dependen de las cartas propias. */
export type DisparadorTic = 'pares' | 'duples' | 'juego' | 'treintaYUna';

export interface DefinicionTic {
  id: string;
  disparador: DisparadorTic;
  /** Proporción de veces que el tic es verdad (0–1). */
  fiabilidad: number;
  /** Lances en cuya declaración o envite puede aparecer, además de al recibir cartas. */
  lances: Lance[];
}

export interface PerfilRival {
  id: IdRival;
  parametros: ParametrosRival;
  mus: EstiloMus;
  tics: DefinicionTic[];
  /** Ruperto: si pierde `lancesSeguidos` lances seguidos, acepta todo durante `manos` manos. */
  enfado?: { lancesSeguidos: number; manos: number };
}

/** La lista común: con estas manos corta cualquiera. */
export const CORTES_COMUNES: PatronCorte[] = ['tresReyes', 'treintaYUna', 'duplesConReyes', 'dosReyesYFigura'];

export const RIVALES: Record<IdRival, PerfilRival> = {
  ruperto: {
    id: 'ruperto',
    parametros: { agresividad: 8, faroleo: 3, miedoOrdago: 2, memoria: 2, ojo: 2 },
    // Impaciente: corta también con cualquier pareja de reyes. Busca Grande y Pares.
    mus: { corta: [...CORTES_COMUNES, 'parejaDeReyes'], guarda: ['reyes', 'parejas'], farolDeCorte: 0 },
    tics: [
      { id: 'rascaBarba', disparador: 'pares', fiabilidad: 0.85, lances: ['pares'] },
      { id: 'arremanga', disparador: 'treintaYUna', fiabilidad: 0.8, lances: ['juego'] },
    ],
    enfado: { lancesSeguidos: 3, manos: 2 },
  },
  // Los demás quedan preparados para la fase 3: parámetros y mus. Sus tics necesitan
  // disparadores que no dependen solo de las cartas (farol, sospecha, mano fuerte).
  engracia: {
    id: 'engracia',
    parametros: { agresividad: 3, faroleo: 1, miedoOrdago: 9, memoria: 6, ojo: 7 },
    // Paciente: solo corta con lo mejor.
    mus: { corta: ['solomillo', 'duplesConReyes', 'treintaYUnaConPareja'], guarda: ['parejas', 'figuras'], farolDeCorte: 0 },
    tics: [],
  },
  anselmo: {
    id: 'anselmo',
    parametros: { agresividad: 5, faroleo: 5, miedoOrdago: 5, memoria: 7, ojo: 5 },
    // Busca la Chica y el Juego.
    mus: { corta: [...CORTES_COMUNES, 'tresPitos'], guarda: ['ases'], farolDeCorte: 0 },
    tics: [
      { id: 'bebeVino', disparador: 'juego', fiabilidad: 0.8, lances: ['juego'] },
      { id: 'juntaManos', disparador: 'duples', fiabilidad: 0.85, lances: ['pares'] },
    ],
  },
  fulgencio: {
    id: 'fulgencio',
    parametros: { agresividad: 7, faroleo: 9, miedoOrdago: 4, memoria: 5, ojo: 6 },
    // Busca el Juego y a veces corta de farol para que su corte no diga nada.
    mus: { corta: [...CORTES_COMUNES], guarda: ['figuras', 'sietes'], farolDeCorte: 0.25 },
    tics: [],
  },
  bonifacio: {
    id: 'bonifacio',
    parametros: { agresividad: 6, faroleo: 6, miedoOrdago: 6, memoria: 10, ojo: 9 },
    mus: { corta: [...CORTES_COMUNES], guarda: ['reyes', 'parejas', 'ases'], farolDeCorte: 0 },
    tics: [],
  },
};
