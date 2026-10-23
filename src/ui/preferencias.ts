import { useSyncExternalStore } from 'react';

/**
 * Lo que el jugador elige en la portada y se recuerda en este navegador: el sonido. Si el
 * almacenamiento falla, el juego sigue con lo de siempre. (Hasta el 23 de octubre de 2026 también
 * se elegía la mesa, entre tres prototipos; David se quedó con la nueva y las otras se quitaron.)
 */
export interface Preferencias {
  sonido: boolean;
}

const CLAVE = 'ordago.preferencias';
const DE_SIEMPRE: Preferencias = { sonido: true };

function almacen(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

function leer(): Preferencias {
  let guardadas: Partial<Preferencias> = {};
  try {
    guardadas = JSON.parse(almacen()?.getItem(CLAVE) ?? '{}') as Partial<Preferencias>;
  } catch {
    // Guardado roto: lo de siempre.
  }
  return { sonido: typeof guardadas.sonido === 'boolean' ? guardadas.sonido : DE_SIEMPRE.sonido };
}

let actuales = leer();
const avisos = new Set<() => void>();

export const preferencias = (): Preferencias => actuales;

export function cambiarPreferencia<K extends keyof Preferencias>(clave: K, valor: Preferencias[K]): void {
  actuales = { ...actuales, [clave]: valor };
  try {
    almacen()?.setItem(CLAVE, JSON.stringify(actuales));
  } catch {
    // Sin almacenamiento vale para esta sesión.
  }
  avisos.forEach((aviso) => aviso());
}

export function usePreferencias(): Preferencias {
  return useSyncExternalStore(
    (aviso) => {
      avisos.add(aviso);
      return () => avisos.delete(aviso);
    },
    () => actuales,
  );
}
