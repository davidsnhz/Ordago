import { ErrorJugada, otroLado, type Lado } from './comun';

/**
 * La ronda de envites de un lance. Habla primero la mano y luego se alternan:
 * - sin envite: paso, envido (2 o más) u órdago. Si pasan los dos, el lance queda en paso.
 * - con envite: quiero, no quiero, más (subir) u órdago.
 * - con órdago: quiero o no quiero.
 * Si dicen «no quiero», el último que envidó cobra lo que ya estaba aceptado antes de
 * su envite (el deje: 1 piedra si no había nada).
 */

export type AccionEnvite =
  | { tipo: 'paso' }
  | { tipo: 'envido'; piedras: number }
  | { tipo: 'mas'; piedras: number }
  | { tipo: 'quiero' }
  | { tipo: 'noQuiero' }
  | { tipo: 'ordago' };

export type ResultadoEnvite =
  | { tipo: 'enPaso' }
  | { tipo: 'querido'; piedras: number; envidador: Lado }
  | { tipo: 'noQuerido'; ganador: Lado; piedras: number }
  | { tipo: 'ordagoQuerido'; lanzador: Lado };

export type OpcionEnvite =
  | { tipo: 'paso' }
  | { tipo: 'envido'; minimo: number }
  | { tipo: 'mas'; minimo: number }
  | { tipo: 'quiero' }
  | { tipo: 'noQuiero' }
  | { tipo: 'ordago' };

export interface LimitesEnvite {
  enviteMinimo: number;
  subidaMinima: number;
  deje: number;
}

export interface EstadoEnvite {
  turno: Lado;
  /** Total pendiente de respuesta; 0 si no hay envite. */
  apuesta: number;
  /** Lo aceptado antes del último envite: lo que cobra quien envidó si le dicen «no quiero». */
  aceptado: number;
  /** Último que envidó, subió o tiró el órdago. */
  envidador: Lado | null;
  ordago: boolean;
  historial: { lado: Lado; accion: AccionEnvite }[];
  resultado: ResultadoEnvite | null;
}

export function iniciarEnvite(quienEsMano: Lado): EstadoEnvite {
  return {
    turno: quienEsMano,
    apuesta: 0,
    aceptado: 0,
    envidador: null,
    ordago: false,
    historial: [],
    resultado: null,
  };
}

export function opcionesEnvite(estado: EstadoEnvite, limites: LimitesEnvite): OpcionEnvite[] {
  if (estado.resultado) return [];
  if (estado.ordago) return [{ tipo: 'quiero' }, { tipo: 'noQuiero' }];
  if (estado.envidador) {
    return [
      { tipo: 'quiero' },
      { tipo: 'noQuiero' },
      { tipo: 'mas', minimo: limites.subidaMinima },
      { tipo: 'ordago' },
    ];
  }
  return [{ tipo: 'paso' }, { tipo: 'envido', minimo: limites.enviteMinimo }, { tipo: 'ordago' }];
}

/** Devuelve el nuevo estado sin tocar el recibido. Lanza `ErrorJugada` si la acción no vale. */
export function aplicarEnvite(
  estado: EstadoEnvite,
  lado: Lado,
  accion: AccionEnvite,
  limites: LimitesEnvite,
): EstadoEnvite {
  if (estado.resultado) throw new ErrorJugada('Este lance ya está resuelto');
  if (lado !== estado.turno) throw new ErrorJugada(`No le toca hablar a ${lado}`);

  const siguiente: EstadoEnvite = {
    ...estado,
    turno: otroLado(lado),
    historial: [...estado.historial, { lado, accion }],
  };
  const hayEnvite = estado.envidador !== null;

  switch (accion.tipo) {
    case 'paso': {
      if (hayEnvite) throw new ErrorJugada('No se puede pasar con un envite pendiente');
      const yaHabiaPasado = estado.historial.some((paso) => paso.accion.tipo === 'paso');
      if (yaHabiaPasado) siguiente.resultado = { tipo: 'enPaso' };
      return siguiente;
    }
    case 'envido':
      if (hayEnvite) throw new ErrorJugada('Ya hay un envite: se responde con quiero, no quiero, más u órdago');
      comprobarCantidad(accion.piedras, limites.enviteMinimo, 'El envite');
      siguiente.apuesta = accion.piedras;
      siguiente.aceptado = 0;
      siguiente.envidador = lado;
      return siguiente;
    case 'mas':
      if (!hayEnvite) throw new ErrorJugada('No hay envite que subir');
      if (estado.ordago) throw new ErrorJugada('Un órdago no se puede subir');
      comprobarCantidad(accion.piedras, limites.subidaMinima, 'La subida');
      siguiente.aceptado = estado.apuesta;
      siguiente.apuesta = estado.apuesta + accion.piedras;
      siguiente.envidador = lado;
      return siguiente;
    case 'ordago':
      if (estado.ordago) throw new ErrorJugada('Ya hay un órdago sobre la mesa');
      siguiente.aceptado = hayEnvite ? estado.apuesta : 0;
      siguiente.ordago = true;
      siguiente.envidador = lado;
      return siguiente;
    case 'quiero':
      if (!estado.envidador) throw new ErrorJugada('No hay envite que querer');
      siguiente.resultado = estado.ordago
        ? { tipo: 'ordagoQuerido', lanzador: estado.envidador }
        : { tipo: 'querido', piedras: estado.apuesta, envidador: estado.envidador };
      return siguiente;
    case 'noQuiero':
      if (!estado.envidador) throw new ErrorJugada('No hay envite que rechazar');
      siguiente.resultado = {
        tipo: 'noQuerido',
        ganador: estado.envidador,
        piedras: estado.aceptado > 0 ? estado.aceptado : limites.deje,
      };
      return siguiente;
  }
}

function comprobarCantidad(piedras: number, minimo: number, que: string): void {
  if (!Number.isInteger(piedras) || piedras < minimo) {
    throw new ErrorJugada(`${que} tiene que ser de al menos ${minimo} piedras (no ${piedras})`);
  }
}
