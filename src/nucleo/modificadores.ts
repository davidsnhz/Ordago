import type { Lado } from './comun';
import type { EstadoDuelo } from './duelo';
import type { Lance } from './lances';

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
