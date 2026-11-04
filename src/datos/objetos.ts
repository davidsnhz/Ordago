/**
 * Objetos de la taberna (docs/gira.md, «Objetos»). Los cinco de la primera taberna, los que se
 * añaden en el bar y el objeto raro de cada jefe; sus textos están en textos/es.ts.
 */

export type IdObjeto =
  | 'orujo'
  | 'chato'
  | 'conversacion'
  | 'medalla'
  | 'boina'
  | 'apuntesChema'
  | 'copaAnis'
  | 'cafePuchero'
  | 'invitarRonda'
  | 'pelota'
  | 'ristra'
  | 'yesquero'
  | 'hucha'
  | 'navaja'
  | 'jarraManolo';

/** Bebidas (te ayudan) y jugarretas (fastidian al rival) se gastan; amuletos y raros duran toda la gira. */
export type TipoObjeto = 'bebida' | 'jugarreta' | 'amuleto' | 'raro';

export interface DefinicionObjeto {
  id: IdObjeto;
  tipo: TipoObjeto;
  /** Lo que cuesta en la taberna. Los raros no se venden, pero valen esto al venderlos (la mitad). */
  precio: number;
  /** Desde qué arena sale a la venta (0, la facultad, si no se dice). */
  desdeArena?: number;
  /** Objeto raro que va siempre puesto, como un amuleto (los Apuntes de Chema, en cambio, se usan). */
  siemprePuesto?: true;
}

export const OBJETOS: Record<IdObjeto, DefinicionObjeto> = {
  // Precios del 22-10-2026, medidos con pruebas/objetos.sim.ts: el Orujo apenas cambia un duelo
  // (vale como emergencia) y la Boina suma en todos los de la gira.
  orujo: { id: 'orujo', tipo: 'bebida', precio: 2 },
  // Ver todas sus cartas en una mano vale mucho más que el resto de bebidas (decidido por David el 22-10-2026).
  chato: { id: 'chato', tipo: 'bebida', precio: 8 },
  conversacion: { id: 'conversacion', tipo: 'jugarreta', precio: 4 },
  medalla: { id: 'medalla', tipo: 'amuleto', precio: 9 },
  boina: { id: 'boina', tipo: 'amuleto', precio: 12 },
  apuntesChema: { id: 'apuntesChema', tipo: 'raro', precio: 10 },

  // Lo que se añade en el bar: aquí se aprende a querer y a cobrarse los faroles.
  copaAnis: { id: 'copaAnis', tipo: 'bebida', precio: 3, desdeArena: 1 },
  cafePuchero: { id: 'cafePuchero', tipo: 'bebida', precio: 3, desdeArena: 1 },
  invitarRonda: { id: 'invitarRonda', tipo: 'jugarreta', precio: 5, desdeArena: 1 },
  pelota: { id: 'pelota', tipo: 'jugarreta', precio: 4, desdeArena: 1 },
  ristra: { id: 'ristra', tipo: 'amuleto', precio: 7, desdeArena: 1 },
  yesquero: { id: 'yesquero', tipo: 'amuleto', precio: 9, desdeArena: 1 },
  hucha: { id: 'hucha', tipo: 'amuleto', precio: 8, desdeArena: 1 },
  navaja: { id: 'navaja', tipo: 'amuleto', precio: 12, desdeArena: 1 },
  jarraManolo: { id: 'jarraManolo', tipo: 'raro', precio: 10, siemprePuesto: true },
};

/** Lo que puede salir a la venta en la taberna (los raros, no). */
const CATALOGO_TABERNA: readonly IdObjeto[] = [
  'orujo',
  'chato',
  'conversacion',
  'medalla',
  'boina',
  'copaAnis',
  'cafePuchero',
  'invitarRonda',
  'pelota',
  'ristra',
  'yesquero',
  'hucha',
  'navaja',
];

/** Lo que puede salir a la venta en esta arena. */
export const catalogoDe = (arena: number): readonly IdObjeto[] => CATALOGO_TABERNA.filter((id) => (OBJETOS[id].desdeArena ?? 0) <= arena);

/** Lo que no se usa: hace su efecto solo. */
export const vaSiemprePuesto = (id: IdObjeto): boolean => OBJETOS[id].tipo === 'amuleto' || Boolean(OBJETOS[id].siemprePuesto);

/** Bebidas y jugarretas: van en los huecos de un uso y se gastan al usarlas. */
export const esDeUnUso = (id: IdObjeto): boolean => OBJETOS[id].tipo === 'bebida' || OBJETOS[id].tipo === 'jugarreta';
