/** Los dos asientos de un duelo. La IA siempre es el rival. */
export type Lado = 'jugador' | 'rival';

export const LADOS: readonly Lado[] = ['jugador', 'rival'];

export type PorLado<T> = Record<Lado, T>;

export function otroLado(lado: Lado): Lado {
  return lado === 'jugador' ? 'rival' : 'jugador';
}

/** Acción ilegal según las reglas: fuera de turno, en la fase equivocada o con datos no válidos. */
export class ErrorJugada extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ErrorJugada';
  }
}
