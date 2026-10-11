import { VERSION_ESTADO } from '../nucleo/duelo';
import { VERSION_PARTIDA, type Partida } from './partida';

/**
 * Guardado en localStorage, en JSON con versión. Si el almacenamiento falla (modo privado,
 * cuota llena, datos corruptos o de otra versión), el juego sigue sin guardar.
 */

const CLAVE = 'ordago.partida';

export type Almacen = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function almacenDelNavegador(): Almacen | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export function guardarPartida(partida: Partida, almacen: Almacen | null = almacenDelNavegador()): boolean {
  if (!almacen) return false;
  try {
    almacen.setItem(CLAVE, JSON.stringify({ version: VERSION_PARTIDA, partida }));
    return true;
  } catch {
    return false;
  }
}

export function cargarPartida(almacen: Almacen | null = almacenDelNavegador()): Partida | null {
  if (!almacen) return null;
  try {
    const texto = almacen.getItem(CLAVE);
    if (!texto) return null;
    const datos: unknown = JSON.parse(texto);
    if (!datos || typeof datos !== 'object' || (datos as { version?: unknown }).version !== VERSION_PARTIDA) return null;
    const partida = (datos as { partida?: unknown }).partida;
    return esPartida(partida) ? partida : null;
  } catch {
    return null;
  }
}

export function borrarPartida(almacen: Almacen | null = almacenDelNavegador()): void {
  try {
    almacen?.removeItem(CLAVE);
  } catch {
    // Sin almacenamiento no hay nada que borrar.
  }
}

function esPartida(valor: unknown): valor is Partida {
  if (!valor || typeof valor !== 'object') return false;
  const p = valor as Partial<Partida>;
  return (
    p.version === VERSION_PARTIDA &&
    typeof p.semilla === 'string' &&
    typeof p.rivalId === 'string' &&
    typeof p.caraJugador === 'number' &&
    Array.isArray(p.azarIA) &&
    !!p.memoria &&
    !!p.duelo &&
    p.duelo.version === VERSION_ESTADO &&
    !!p.duelo.cartas &&
    Array.isArray(p.duelo.cartas.jugador)
  );
}
