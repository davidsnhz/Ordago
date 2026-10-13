import { RIVALES } from '../datos/rivales';
import { VERSION_ESTADO } from '../nucleo/duelo';
import { VERSION_PARTIDA, type Partida } from './partida';

/**
 * Guardado en localStorage, en JSON con versión. Si el almacenamiento falla (modo privado,
 * cuota llena, datos corruptos o de otra versión), el juego sigue sin guardar.
 */

/** El duelo suelto en curso. La gira y la Libreta se guardan aparte (estado/gira.ts y estado/libreta.ts). */
const CLAVE = 'ordago.partida';

export type Almacen = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function almacenDelNavegador(): Almacen | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

/** Guarda `datos` con su versión. Devuelve si ha podido. */
export function guardarConVersion(clave: string, version: number, datos: unknown, almacen: Almacen | null = almacenDelNavegador()): boolean {
  if (!almacen) return false;
  try {
    almacen.setItem(clave, JSON.stringify({ version, datos }));
    return true;
  } catch {
    return false;
  }
}

/** Carga lo guardado si es de esta versión y pasa la comprobación; si no, `null`. */
export function cargarConVersion<T>(
  clave: string,
  version: number,
  esValido: (valor: unknown) => valor is T,
  almacen: Almacen | null = almacenDelNavegador(),
): T | null {
  if (!almacen) return null;
  try {
    const texto = almacen.getItem(clave);
    if (!texto) return null;
    const leido: unknown = JSON.parse(texto);
    if (!leido || typeof leido !== 'object' || (leido as { version?: unknown }).version !== version) return null;
    const datos = (leido as { datos?: unknown }).datos;
    return esValido(datos) ? datos : null;
  } catch {
    return null;
  }
}

export function borrarClave(clave: string, almacen: Almacen | null = almacenDelNavegador()): void {
  try {
    almacen?.removeItem(clave);
  } catch {
    // Sin almacenamiento no hay nada que borrar.
  }
}

export function guardarPartida(partida: Partida, almacen: Almacen | null = almacenDelNavegador()): boolean {
  return guardarConVersion(CLAVE, VERSION_PARTIDA, partida, almacen);
}

export function cargarPartida(almacen: Almacen | null = almacenDelNavegador()): Partida | null {
  return cargarConVersion(CLAVE, VERSION_PARTIDA, esPartida, almacen);
}

export function borrarPartida(almacen: Almacen | null = almacenDelNavegador()): void {
  borrarClave(CLAVE, almacen);
}

export function esPartida(valor: unknown): valor is Partida {
  if (!valor || typeof valor !== 'object') return false;
  const p = valor as Partial<Partida>;
  return (
    p.version === VERSION_PARTIDA &&
    typeof p.semilla === 'string' &&
    typeof p.rivalId === 'string' &&
    p.rivalId in RIVALES &&
    typeof p.caraJugador === 'number' &&
    Array.isArray(p.azarIA) &&
    !!p.memoria &&
    !!p.extras &&
    !!p.estadisticas &&
    Array.isArray(p.ticsDeLaMano) &&
    !!p.duelo &&
    p.duelo.version === VERSION_ESTADO &&
    !!p.duelo.cartas &&
    Array.isArray(p.duelo.cartas.jugador)
  );
}
