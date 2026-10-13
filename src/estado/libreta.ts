import { ORDEN_RIVALES, RIVALES, type IdRival } from '../datos/rivales';
import { ES } from '../textos/es';
import { almacenDelNavegador, cargarConVersion, guardarConVersion, type Almacen } from './guardado';
import type { TicObservado } from './partida';

/**
 * La Libreta: lo que has visto de los tics de cada rival. Cada vez que un rival hace un tic y
 * luego se ven sus cartas, se apunta si acertaba. Las notas se van llenando poco a poco:
 * primero el gesto, luego qué puede querer decir y, con más veces, lo que significa y cuánto
 * acierta. Se guarda aparte y pasa de una gira a otra.
 */

export const VERSION_LIBRETA = 1;
const CLAVE = 'ordago.libreta';

export interface NotaTic {
  /** Veces que se ha visto el tic y luego las cartas (el Lazarillo cuenta doble). */
  vistos: number;
  /** De esas, cuántas era verdad. */
  aciertos: number;
}

export interface Libreta {
  rivales: Partial<Record<IdRival, Record<string, NotaTic>>>;
}

/** 1: el gesto; 2: qué puede querer decir; 3: lo que significa y cuánto acierta. */
export type NivelNota = 0 | 1 | 2 | 3;

/** Veces que hay que verlo para llegar a cada nivel (con el Lazarillo, cada vez cuenta dos). */
const UMBRALES = [1, 4, 10] as const;

export const libretaVacia = (): Libreta => ({ rivales: {} });

export function nivelDe(nota: NotaTic | undefined): NivelNota {
  const vistos = nota?.vistos ?? 0;
  if (vistos >= UMBRALES[2]) return 3;
  if (vistos >= UMBRALES[1]) return 2;
  return vistos >= UMBRALES[0] ? 1 : 0;
}

export interface CambioNota {
  rival: IdRival;
  tic: string;
  nivel: NivelNota;
}

/** Apunta lo visto en un duelo. `peso` 2 con el Lazarillo. Devuelve las notas que han subido de nivel. */
export function apuntar(
  libreta: Libreta,
  rival: IdRival,
  observaciones: readonly TicObservado[],
  peso = 1,
): { libreta: Libreta; cambios: CambioNota[] } {
  if (observaciones.length === 0) return { libreta, cambios: [] };
  const notas: Record<string, NotaTic> = { ...(libreta.rivales[rival] ?? {}) };
  const antes = new Map(Object.entries(notas).map(([tic, nota]) => [tic, nivelDe(nota)]));
  for (const { id, verdadero } of observaciones) {
    const nota = notas[id] ?? { vistos: 0, aciertos: 0 };
    notas[id] = { vistos: nota.vistos + peso, aciertos: nota.aciertos + (verdadero ? peso : 0) };
  }
  const cambios: CambioNota[] = [];
  for (const [tic, nota] of Object.entries(notas)) {
    const nivel = nivelDe(nota);
    if (nivel > (antes.get(tic) ?? 0)) cambios.push({ rival, tic, nivel });
  }
  return { libreta: { rivales: { ...libreta.rivales, [rival]: notas } }, cambios };
}

const mayuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

/** La nota tal como se lee: «Se rasca la barba… ¿pares o mejor?». */
export function textoNota(rival: IdRival, tic: string, nota: NotaTic | undefined): string | null {
  const nivel = nivelDe(nota);
  if (nivel === 0 || !nota) return null;
  const textos = ES.rivales[rival];
  const gesto = mayuscula(textos.tics[tic] ?? tic);
  const significado = textos.significadoTics[tic] ?? '';
  const L = ES.libreta;
  if (nivel === 1) return L.nivel1(gesto);
  if (nivel === 2) return L.nivel2(gesto, significado);
  return L.nivel3(gesto, significado, Math.round((nota.aciertos / nota.vistos) * 10));
}

/** Rivales con algo apuntado, en el orden de la gira, con sus notas en el orden de sus tics. */
export function paginas(libreta: Libreta): { rival: IdRival; notas: { tic: string; texto: string; nivel: NivelNota }[] }[] {
  return ORDEN_RIVALES.flatMap((rival) => {
    const notas = libreta.rivales[rival];
    if (!notas) return [];
    const perfil = RIVALES[rival];
    const orden = [...new Set([...perfil.tics, ...(perfil.fasesDeTics ?? []).flatMap((f) => f.tics)].map((t) => t.id))];
    const lineas = orden.flatMap((tic) => {
      const texto = textoNota(rival, tic, notas[tic]);
      return texto ? [{ tic, texto, nivel: nivelDe(notas[tic]) }] : [];
    });
    return lineas.length > 0 ? [{ rival, notas: lineas }] : [];
  });
}

function esLibreta(valor: unknown): valor is Libreta {
  return !!valor && typeof valor === 'object' && !!(valor as Libreta).rivales && typeof (valor as Libreta).rivales === 'object';
}

export function cargarLibreta(almacen: Almacen | null = almacenDelNavegador()): Libreta {
  return cargarConVersion(CLAVE, VERSION_LIBRETA, esLibreta, almacen) ?? libretaVacia();
}

export function guardarLibreta(libreta: Libreta, almacen: Almacen | null = almacenDelNavegador()): boolean {
  return guardarConVersion(CLAVE, VERSION_LIBRETA, libreta, almacen);
}
