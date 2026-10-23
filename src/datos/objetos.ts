/**
 * Objetos de la taberna (docs/gira.md, «Objetos»). En la fase 4 están los cinco de la primera
 * taberna y el objeto raro de Chema; sus textos están en textos/es.ts.
 */

export type IdObjeto = 'orujo' | 'chato' | 'conversacion' | 'medalla' | 'boina' | 'apuntesChema';

/** Bebidas (te ayudan) y jugarretas (fastidian al rival) se gastan; amuletos y raros duran toda la gira. */
export type TipoObjeto = 'bebida' | 'jugarreta' | 'amuleto' | 'raro';

export interface DefinicionObjeto {
  id: IdObjeto;
  tipo: TipoObjeto;
  /** Lo que cuesta en la taberna. Los raros no se venden, pero valen esto al venderlos (la mitad). */
  precio: number;
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
};

/** Lo que puede salir a la venta en la taberna. */
export const CATALOGO_TABERNA: readonly IdObjeto[] = ['orujo', 'chato', 'conversacion', 'medalla', 'boina'];

/** Bebidas y jugarretas: van en los huecos de un uso y se gastan al usarlas. */
export const esDeUnUso = (id: IdObjeto): boolean => OBJETOS[id].tipo === 'bebida' || OBJETOS[id].tipo === 'jugarreta';
