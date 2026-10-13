import type { Lado } from './comun';
import type { EstadoDuelo } from './duelo';
import type { Lance } from './lances';
import type { Cobro, CobrosDeLaMano } from './recuento';

/**
 * Efecto de un compañero, un objeto o la regla especial de un rival que cambia las reglas
 * del duelo. Todos los ganchos son opcionales. Los modificadores no se guardan en el estado
 * (que es JSON): se pasan en cada llamada. Los efectos que solo reaccionan a lo que pasa
 * (reales, Honra, Libreta…) leen los eventos que devuelve cada acción.
 */
export interface Modificador {
  readonly id: string;
  /** Piedras extra con las que empieza el duelo `lado` (p. ej. la Moza del Molino). */
  piedrasIniciales?(lado: Lado): number;
  /** Rondas de mus permitidas en la mano actual, partiendo del valor anterior (p. ej. el Tahúr). */
  rondasMus?(rondas: number, estado: Readonly<EstadoDuelo>): number;
  /** Quién gana un empate, partiendo del valor anterior, que es la mano (p. ej. la Boina). */
  ganaEmpate?(lado: Lado, lance: Lance, estado: Readonly<EstadoDuelo>): Lado;
  /**
   * Antes del recuento, si hay envites queridos: quién propone retirarlos y repartirse las
   * piedras (el trato de Aurelio), o null. El otro decide si lo acepta.
   */
  ofreceTrato?(estado: Readonly<EstadoDuelo>): Lado | null;
  /** Cambia los cobros del recuento antes de apuntarlos (p. ej. la Penitencia de Don Francisco). */
  ajustarCobros?(cobros: Cobro[], estado: Readonly<EstadoDuelo>, ganadores: CobrosDeLaMano['ganadores']): Cobro[];
}

export function piedrasIniciales(modificadores: readonly Modificador[], lado: Lado): number {
  return modificadores.reduce((total, m) => total + (m.piedrasIniciales?.(lado) ?? 0), 0);
}

export function rondasMusPermitidas(modificadores: readonly Modificador[], estado: Readonly<EstadoDuelo>): number {
  return modificadores.reduce((rondas, m) => m.rondasMus?.(rondas, estado) ?? rondas, estado.reglas.rondasMus);
}

export function quienGanaEmpate(
  modificadores: readonly Modificador[],
  lance: Lance,
  estado: Readonly<EstadoDuelo>,
): Lado {
  return modificadores.reduce((lado, m) => m.ganaEmpate?.(lado, lance, estado) ?? lado, estado.quienEsMano);
}

export function quienOfreceTrato(modificadores: readonly Modificador[], estado: Readonly<EstadoDuelo>): Lado | null {
  for (const m of modificadores) {
    const lado = m.ofreceTrato?.(estado);
    if (lado) return lado;
  }
  return null;
}

export function ajustarCobros(
  modificadores: readonly Modificador[],
  cobros: Cobro[],
  estado: Readonly<EstadoDuelo>,
  ganadores: CobrosDeLaMano['ganadores'],
): Cobro[] {
  return modificadores.reduce((lista, m) => m.ajustarCobros?.(lista, estado, ganadores) ?? lista, cobros);
}
