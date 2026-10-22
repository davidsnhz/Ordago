import { useSyncExternalStore } from 'react';

/**
 * Lo que el jugador elige en la portada y se recuerda en este navegador: qué mesa (prototipos de
 * octubre de 2026) y el sonido. Si el almacenamiento falla, el juego sigue con lo de siempre.
 * `?mesa=nueva`, `?mesa=viva` o `?mesa=antes` en la dirección la cambia sin guardarlo, para
 * comparar (`?viva=0` y `?viva=1`, de antes, también valen).
 */
export type TipoMesa = 'nueva' | 'viva' | 'antes';

/** En la portada, cada toque pasa a la siguiente. */
export const MESAS: readonly TipoMesa[] = ['nueva', 'viva', 'antes'];

export interface Preferencias {
  /** nueva: sin acta, con casillas y sellos junto a quien habla; viva: la de antes con movimiento y sonido; antes: quieta. */
  mesa: TipoMesa;
  sonido: boolean;
}

const CLAVE = 'ordago.preferencias';
const DE_SIEMPRE: Preferencias = { mesa: 'nueva', sonido: true };

const esMesa = (valor: unknown): valor is TipoMesa => MESAS.includes(valor as TipoMesa);

function almacen(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

function leer(): Preferencias {
  let guardadas: Partial<Preferencias> & { mesaViva?: boolean } = {};
  try {
    guardadas = JSON.parse(almacen()?.getItem(CLAVE) ?? '{}') as typeof guardadas;
  } catch {
    // Guardado roto: lo de siempre.
  }
  const preferencias: Preferencias = {
    // El primer prototipo guardaba solo si la mesa viva estaba encendida.
    mesa: esMesa(guardadas.mesa) ? guardadas.mesa : guardadas.mesaViva === false ? 'antes' : DE_SIEMPRE.mesa,
    sonido: typeof guardadas.sonido === 'boolean' ? guardadas.sonido : DE_SIEMPRE.sonido,
  };
  if (typeof window !== 'undefined') {
    const direccion = new URLSearchParams(window.location.search);
    const mesa = direccion.get('mesa');
    const viva = direccion.get('viva');
    if (esMesa(mesa)) preferencias.mesa = mesa;
    else if (viva === '0' || viva === '1') preferencias.mesa = viva === '1' ? 'viva' : 'antes';
  }
  return preferencias;
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

/** La mesa que viene después de `mesa` en la portada. */
export const siguienteMesa = (mesa: TipoMesa): TipoMesa => MESAS[(MESAS.indexOf(mesa) + 1) % MESAS.length]!;

export function usePreferencias(): Preferencias {
  return useSyncExternalStore(
    (aviso) => {
      avisos.add(aviso);
      return () => avisos.delete(aviso);
    },
    () => actuales,
  );
}
