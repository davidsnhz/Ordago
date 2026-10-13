import type { IdObjeto } from './objetos';
import type { IdRival } from './rivales';

/**
 * La gira (docs/gira.md): cinco arenas de cuatro niveles (tres secuaces y su jefe). En la
 * fase 4 solo está entera la primera, la facultad; las demás se ven en el mapa, cerradas.
 */

export type IdArena = 'facultad' | 'bar' | 'montana' | 'fiestas' | 'casino';

export interface Arena {
  id: IdArena;
  /** Los cuatro niveles, del primer secuaz al jefe; `null` mientras la arena no esté hecha. */
  niveles: readonly [IdRival, IdRival, IdRival, IdRival] | null;
  /** Lo que da el jefe como premio. */
  raro: IdObjeto | null;
}

export const ARENAS: readonly Arena[] = [
  { id: 'facultad', niveles: ['lucia', 'dani', 'ruben', 'chema'], raro: 'apuntesChema' },
  { id: 'bar', niveles: null, raro: null },
  { id: 'montana', niveles: null, raro: null },
  { id: 'fiestas', niveles: null, raro: null },
  { id: 'casino', niveles: null, raro: null },
];

/** El nivel del jefe dentro de cada arena. */
export const NIVEL_JEFE = 3;

export const GIRA = {
  honraInicial: 3,
  /** El premio del jefe no sube la Honra por encima de esto; la monja de la plaza sí. */
  honraMaxima: 3,
  realesIniciales: 0,
  /** Por ganar el duelo de cada nivel: primer secuaz, segundo, mano derecha y jefe. */
  realesPorNivel: [4, 5, 6, 10],
  /** Por perder un duelo. */
  consolacion: 2,
  /** Extras de cada duelo. */
  porEnvite: 1,
  porFarol: 1,
  porOrdago: 5,
  recaudadora: { porDuelo: 2, multiplicaOrdago: 3 },
  /** La era: lo que sube la Cara al descansar. */
  era: 20,
  taberna: {
    /** Cosas a la venta en cada visita: de un uso, amuletos, y a veces un compañero. */
    deUnUso: 2,
    amuletos: 1,
    probabilidadCompanero: 1 / 3,
    /** «Otra ronda»: la primera vez cuesta esto y cada vez, uno más. */
    otraRonda: 2,
    /** Al vender (y al cambiar de compañero) te devuelven esta parte de lo que costó. */
    venta: 0.5,
  },
  huecos: { unUso: 2, amuletos: 2 },
  plaza: {
    forastero: { apuesta: 5, premio: 15 },
    /** Fiesta patronal: con cuántas piedras empiezan los dos el siguiente duelo. */
    fiesta: 5,
    timador: { descuento: 0.5, falso: 1 / 3 },
    /** La monja sale la mitad de veces que las demás, y una vez por gira. */
    pesos: { forastero: 2, fiesta: 2, timador: 2, monja: 1 },
  },
} as const;
