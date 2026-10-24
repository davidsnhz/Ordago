import { almacenDelNavegador, type Almacen } from '../estado/guardado';
import { ES } from '../textos/es';

const CLAVE = 'ordago.lema';

/**
 * El lema de la portada: cada vez que se abre el juego, el siguiente de la lista, para que salgan
 * todos por turnos (24-10-2026, pedido de David). Se recuerda en el navegador cuál tocó la última
 * vez; si el almacenamiento falla, sale el primero.
 */
export function siguienteLema(lemas: readonly string[], almacen: Almacen | null = almacenDelNavegador()): string {
  let anterior = -1;
  try {
    const guardado = Number.parseInt(almacen?.getItem(CLAVE) ?? '', 10);
    if (Number.isInteger(guardado)) anterior = guardado;
  } catch {
    // Sin almacenamiento: el primero.
  }
  // Si la lista ha cambiado y lo guardado ya no cabe, se sigue dando la vuelta.
  const indice = (((anterior + 1) % lemas.length) + lemas.length) % lemas.length;
  try {
    almacen?.setItem(CLAVE, String(indice));
  } catch {
    // Sin almacenamiento vale para esta vez.
  }
  return lemas[indice]!;
}

let deEstaVez: string | null = null;

/** El de esta vez que se abre el juego: volver a la portada desde un duelo no lo cambia. */
export const lemaDeEstaVez = (): string => (deEstaVez ??= siguienteLema(ES.portada.lemas));
