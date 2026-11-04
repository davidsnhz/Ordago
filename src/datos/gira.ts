import type { IdObjeto } from './objetos';
import type { IdRival } from './rivales';

/** Lo que un secuaz le cuenta a su jefe (docs/gira.md, «En la gira»). */
export type IdAviso = 'rubenAvisa' | 'aurelioInvita';

export interface AvisoAlJefe {
  id: IdAviso;
  /** Hay que ganarle a la mano derecha del jefe por estas piedras o más. */
  ganandoPor: number;
}

/**
 * La gira (docs/gira.md): cinco arenas de cuatro niveles (tres secuaces y su jefe). De momento
 * están la facultad y el bar; la siguiente se ve en el mapa, cerrada.
 */

export type IdArena = 'facultad' | 'bar' | 'montana' | 'fiestas' | 'casino';

export interface Arena {
  id: IdArena;
  /** Los cuatro niveles, del primer secuaz al jefe; `null` mientras la arena no esté hecha. */
  niveles: readonly [IdRival, IdRival, IdRival, IdRival] | null;
  /** Lo que da el jefe como premio. */
  raro: IdObjeto | null;
  /** Lo que le cuenta al jefe su mano derecha, si le ganas de sobra. */
  aviso?: AvisoAlJefe;
}

export const ARENAS: readonly Arena[] = [
  { id: 'facultad', niveles: ['lucia', 'dani', 'ruben', 'chema'], raro: 'apuntesChema', aviso: { id: 'rubenAvisa', ganandoPor: 10 } },
  { id: 'bar', niveles: ['tono', 'ruperto', 'fulgencio', 'manolo'], raro: 'jarraManolo', aviso: { id: 'aurelioInvita', ganandoPor: 1 } },
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
  /** A cuántas piedras se juega cada nivel: como las ciegas de Balatro, cada duelo pide más que el anterior. */
  piedrasPorNivel: [25, 30, 35, 40],
  /** Por ganar el duelo de cada nivel: primer secuaz, segundo, mano derecha y jefe. */
  realesPorNivel: [4, 5, 6, 10],
  /** Por perder un duelo. */
  consolacion: 2,
  /** La Hucha de barro: al acabar cada arena, 1 real por cada tantos ahorrados, hasta este máximo. */
  hucha: { cadaReales: 5, maximo: 5 },
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
    /** Fiesta patronal: los dos empiezan el siguiente duelo con esta parte de sus piedras. */
    fiesta: 1 / 4,
    timador: { descuento: 0.5, falso: 1 / 3 },
    /** La partida en la calle: lo que cobras si le ganas la mano al vecino. */
    calle: { premio: 3 },
    /** La monja sale la mitad de veces que las demás, y una vez por gira. */
    pesos: { forastero: 2, fiesta: 2, timador: 2, calle: 2, monja: 1 },
  },
} as const;

/** Con cuántas piedras empiezan los dos tras la fiesta patronal, según a cuántas se juega. */
export const piedrasDeFiesta = (piedrasParaGanar: number) => Math.round(piedrasParaGanar * GIRA.plaza.fiesta);
