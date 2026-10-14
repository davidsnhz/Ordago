import { LANCES, type Lance } from '../nucleo/lances';

/** Rivales: parámetros de la IA, forma de jugar el mus, tics y reglas especiales. Sus textos están en textos/es.ts. */

/**
 * Los ids de los cinco primeros son los nombres que tenían antes (Ruperto, Engracia, Anselmo,
 * Fulgencio y Bonifacio): los usan el guardado y las carpetas del arte. Los nombres que se ven
 * están en textos/es.ts. Los cuatro de la facultad son los de la primera arena de la gira.
 */
export type IdRival =
  | 'lucia'
  | 'dani'
  | 'ruben'
  | 'chema'
  | 'ruperto'
  | 'engracia'
  | 'anselmo'
  | 'fulgencio'
  | 'bonifacio';

/** Todos los rivales, en el orden de la gira (la lista de los duelos sueltos). */
export const ORDEN_RIVALES: IdRival[] = ['lucia', 'dani', 'ruben', 'chema', 'ruperto', 'fulgencio', 'engracia', 'anselmo', 'bonifacio'];

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

/**
 * Qué dispara un tic:
 * - De las cartas: `pares`, `duples`, `juego`, `treintaYUna` y `manoFuerte` (duples, medias,
 *   31, tres reyes o tres pitos).
 * - De la decisión: `farol` (envida de farol) y `sospecha` (cree que el jugador farolea:
 *   su Cara está baja).
 * - `ninguno`: un tic falso para despistar, que no significa nada.
 */
export type DisparadorTic = 'pares' | 'duples' | 'juego' | 'treintaYUna' | 'manoFuerte' | 'farol' | 'sospecha' | 'ninguno';

export interface DefinicionTic {
  id: string;
  disparador: DisparadorTic;
  /** Proporción de veces que el tic es verdad (0–1). En `ninguno` no se usa. */
  fiabilidad: number;
  /** Lances en cuya declaración o envite puede aparecer, además de al recibir cartas. */
  lances: readonly Lance[];
}

export interface PerfilRival {
  id: IdRival;
  parametros: ParametrosRival;
  mus: EstiloMus;
  tics: DefinicionTic[];
  /** Rodrigo: cambia de tics según cómo va el duelo (piedras del que más lleva). */
  fasesDeTics?: { desdePiedras: number; tics: DefinicionTic[] }[];
  /** Agustín: si pierde `lancesSeguidos` lances seguidos, acepta todo durante `manos` manos. */
  enfado?: { lancesSeguidos: number; manos: number };
  /** Doña Ignacia: nunca acepta un órdago antes de esta mano. */
  ordagoDesdeMano?: number;
  /** Doña Ignacia: si la miras demasiado, se ofende y no hace tics durante `manos` manos. */
  alSerMirado?: { manos: number };
  /** Don Francisco: en estos lances, si habla sin envite delante, envida siempre. */
  siempreEnvidaA?: readonly Lance[];
  /** Don Francisco: si te pilla un farol, tu próximo envite le da `piedras` más si lo gana él. */
  penitencia?: { piedras: number };
  /** Aurelio: una vez por duelo propone un trato antes del recuento. */
  trato?: true;
  /** Don Rodrigo: es mano en el primer reparto y gana los empates de estos lances. */
  casa?: { lances: readonly Lance[] };
  /** Don Rodrigo: una vez por duelo cambia una carta si su mejor lance no llega a esta fuerza. */
  cartasDeLaCasa?: { fuerzaMaxima: number };
  /** Dani: pide mus siempre la primera vez de cada mano. */
  pideMusSiempre?: true;
  /** Rubén: cuando va ganando por `ventaja` piedras o más, farolea el doble. */
  seCrece?: { ventaja: number };
  /**
   * Chema: cuando va ganando por `ventaja` o más, se crece (farolea el doble y te lo quiere
   * todo); cuando va perdiendo por `ventaja` o más, se arruga (no farolea y casi no quiere).
   */
  seVieneArriba?: { ventaja: number };
}

/** Cómo está el rival por el marcador (Rubén y Chema). */
export type AnimoRival = 'crecido' | 'arrugado' | null;

export function animoDe(perfil: PerfilRival, diferencia: number): AnimoRival {
  const regla = perfil.seVieneArriba ?? perfil.seCrece;
  if (!regla) return null;
  if (diferencia >= regla.ventaja) return 'crecido';
  if (perfil.seVieneArriba && diferencia <= -regla.ventaja) return 'arrugado';
  return null;
}

/** La lista común: con estas manos corta cualquiera. */
export const CORTES_COMUNES: PatronCorte[] = ['tresReyes', 'treintaYUna', 'duplesConReyes', 'dosReyesYFigura'];

const TODOS = LANCES;

const TICS_RUPERTO: DefinicionTic[] = [
  { id: 'rascaBarba', disparador: 'pares', fiabilidad: 0.85, lances: ['pares'] },
  { id: 'arremanga', disparador: 'treintaYUna', fiabilidad: 0.8, lances: ['juego'] },
];

const TICS_ANSELMO: DefinicionTic[] = [
  { id: 'bebeVino', disparador: 'juego', fiabilidad: 0.8, lances: ['juego'] },
  { id: 'miraAlCielo', disparador: 'farol', fiabilidad: 0.7, lances: TODOS },
  { id: 'juntaManos', disparador: 'duples', fiabilidad: 0.85, lances: ['pares'] },
];

export const RIVALES: Record<IdRival, PerfilRival> = {
  // ——— La facultad (arena 1) ———
  lucia: {
    id: 'lucia',
    // Aprendió ayer: envida cuando lleva algo y no farolea nunca.
    parametros: { agresividad: 4, faroleo: 0, miedoOrdago: 3, memoria: 1, ojo: 1 },
    mus: { corta: [...CORTES_COMUNES, 'parejaDeReyes'], guarda: ['reyes', 'parejas'], farolDeCorte: 0 },
    tics: [{ id: 'mordisqueaBoli', disparador: 'pares', fiabilidad: 0.9, lances: ['pares'] }],
  },
  dani: {
    id: 'dani',
    parametros: { agresividad: 4, faroleo: 2, miedoOrdago: 4, memoria: 2, ojo: 2 },
    mus: { corta: [...CORTES_COMUNES], guarda: ['reyes', 'figuras'], farolDeCorte: 0 },
    tics: [
      { id: 'rasgueaBandurria', disparador: 'treintaYUna', fiabilidad: 0.8, lances: ['juego'] },
      { id: 'colocaCintas', disparador: 'duples', fiabilidad: 0.8, lances: ['pares'] },
    ],
    pideMusSiempre: true,
  },
  ruben: {
    id: 'ruben',
    parametros: { agresividad: 6, faroleo: 3, miedoOrdago: 3, memoria: 2, ojo: 2 },
    mus: { corta: [...CORTES_COMUNES, 'parejaDeReyes'], guarda: ['reyes', 'parejas'], farolDeCorte: 0 },
    tics: [
      { id: 'muerdeBocadillo', disparador: 'pares', fiabilidad: 0.8, lances: ['pares'] },
      { id: 'ajustaGorra', disparador: 'treintaYUna', fiabilidad: 0.8, lances: ['juego'] },
    ],
    seCrece: { ventaja: 5 },
  },
  chema: {
    id: 'chema',
    parametros: { agresividad: 7, faroleo: 5, miedoOrdago: 3, memoria: 3, ojo: 3 },
    mus: { corta: [...CORTES_COMUNES], guarda: ['reyes', 'parejas'], farolDeCorte: 0.1 },
    tics: [
      { id: 'bajaGafas', disparador: 'manoFuerte', fiabilidad: 0.8, lances: TODOS },
      { id: 'bebeRefresco', disparador: 'farol', fiabilidad: 0.7, lances: TODOS },
    ],
    seVieneArriba: { ventaja: 5 },
  },

  // ——— Los cinco que ya estaban (el bar, las fiestas y el casino) ———
  ruperto: {
    id: 'ruperto',
    parametros: { agresividad: 8, faroleo: 3, miedoOrdago: 2, memoria: 2, ojo: 2 },
    // Impaciente: corta también con cualquier pareja de reyes. Busca Grande y Pares.
    mus: { corta: [...CORTES_COMUNES, 'parejaDeReyes'], guarda: ['reyes', 'parejas'], farolDeCorte: 0 },
    tics: TICS_RUPERTO,
    enfado: { lancesSeguidos: 3, manos: 2 },
  },
  engracia: {
    id: 'engracia',
    parametros: { agresividad: 3, faroleo: 1, miedoOrdago: 9, memoria: 6, ojo: 7 },
    // Paciente: solo corta con lo mejor.
    mus: { corta: ['solomillo', 'duplesConReyes', 'treintaYUnaConPareja'], guarda: ['parejas', 'figuras'], farolDeCorte: 0 },
    tics: [
      { id: 'rosario', disparador: 'manoFuerte', fiabilidad: 0.75, lances: TODOS },
      { id: 'miraFijamente', disparador: 'sospecha', fiabilidad: 0.9, lances: TODOS },
    ],
    ordagoDesdeMano: 3,
    alSerMirado: { manos: 1 },
  },
  anselmo: {
    id: 'anselmo',
    parametros: { agresividad: 5, faroleo: 5, miedoOrdago: 5, memoria: 7, ojo: 5 },
    // Busca la Chica y el Juego.
    mus: { corta: [...CORTES_COMUNES, 'tresPitos'], guarda: ['ases'], farolDeCorte: 0 },
    tics: TICS_ANSELMO,
    siempreEnvidaA: ['chica'],
    penitencia: { piedras: 1 },
  },
  fulgencio: {
    id: 'fulgencio',
    parametros: { agresividad: 7, faroleo: 9, miedoOrdago: 4, memoria: 5, ojo: 6 },
    // Busca el Juego y a veces corta de farol para que su corte no diga nada.
    mus: { corta: [...CORTES_COMUNES], guarda: ['figuras', 'sietes'], farolDeCorte: 0.25 },
    tics: [
      { id: 'dienteDeOro', disparador: 'farol', fiabilidad: 0.75, lances: TODOS },
      { id: 'quitaSombrero', disparador: 'manoFuerte', fiabilidad: 0.7, lances: TODOS },
      { id: 'golpeaVara', disparador: 'ninguno', fiabilidad: 0, lances: TODOS },
    ],
    trato: true,
  },
  bonifacio: {
    id: 'bonifacio',
    parametros: { agresividad: 6, faroleo: 6, miedoOrdago: 6, memoria: 10, ojo: 9 },
    mus: { corta: [...CORTES_COMUNES], guarda: ['reyes', 'parejas', 'ases'], farolDeCorte: 0 },
    // Empieza con los tics del Herrero; a 10 piedras, los del Cura; a 15, solo el humo del puro.
    tics: TICS_RUPERTO,
    fasesDeTics: [
      { desdePiedras: 10, tics: TICS_ANSELMO },
      { desdePiedras: 15, tics: [{ id: 'humoPuro', disparador: 'manoFuerte', fiabilidad: 0.65, lances: TODOS }] },
    ],
    casa: { lances: ['grande'] },
    cartasDeLaCasa: { fuerzaMaxima: 0.6 },
  },
};

/** Tics que usa el rival ahora mismo (Rodrigo cambia según las piedras). */
export function ticsActivos(perfil: PerfilRival, piedrasMaximas: number): DefinicionTic[] {
  let tics = perfil.tics;
  for (const fase of perfil.fasesDeTics ?? []) if (piedrasMaximas >= fase.desdePiedras) tics = fase.tics;
  return tics;
}

/**
 * Tics que han cambiado de nombre: lo apuntado en la Libreta con el nombre de antes pasa al nuevo.
 * Chema remueve el café → bebe un refresco (15 de octubre de 2026; significa lo mismo).
 */
export const TICS_RENOMBRADOS: Partial<Record<IdRival, Record<string, string>>> = {
  chema: { remueveCafe: 'bebeRefresco' },
};

/** El nombre de hoy de un tic. */
export const ticVigente = (rival: IdRival, tic: string): string => TICS_RENOMBRADOS[rival]?.[tic] ?? tic;
