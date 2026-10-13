/**
 * Compañeros (docs/gira.md, «Compañeros»). Se lleva uno a la vez: se elige al empezar la gira y
 * en la taberna se compra y se cambia. En la fase 4 están los dos del principio; sus textos
 * están en textos/es.ts.
 */

export type IdCompanero = 'lazarillo' | 'recaudadora';

export interface DefinicionCompanero {
  id: IdCompanero;
  precio: number;
  /** Veces por duelo que se puede usar su seña. */
  senas: number;
}

export const COMPANEROS: Record<IdCompanero, DefinicionCompanero> = {
  /** Pasiva: la Libreta se rellena el doble de rápido. Seña: te enseña una carta del rival. */
  lazarillo: { id: 'lazarillo', precio: 8, senas: 1 },
  /** Pasiva: +2 reales por duelo ganado. Seña: si ganas el próximo órdago, cobras el triple de reales. */
  recaudadora: { id: 'recaudadora', precio: 8, senas: 1 },
};

/** Los que se pueden elegir desde la primera gira. */
export const COMPANEROS_INICIALES: readonly IdCompanero[] = ['lazarillo', 'recaudadora'];

/** Los que todavía no están en el juego, para enseñarlos como «por desbloquear». */
export const POR_DESBLOQUEAR = 9;
