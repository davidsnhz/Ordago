import { crearBaraja } from '../src/nucleo/baraja';
import { idCarta, PALOS, type Carta, type Numero, type Palo } from '../src/nucleo/carta';
import type { Lado } from '../src/nucleo/comun';
import { aplicarAccion, crearDuelo, type AccionDuelo, type EstadoDuelo, type OpcionesDuelo } from '../src/nucleo/duelo';
import type { EventoDuelo } from '../src/nucleo/eventos';
import type { Modificador } from '../src/nucleo/modificadores';

const FIGURAS: Record<string, Numero> = { R: 12, C: 11, S: 10, A: 1 };
const PALO_POR_LETRA: Record<string, Palo> = { o: 'oros', c: 'copas', e: 'espadas', b: 'bastos' };

/**
 * Cartas en notación corta: «R C S 7», «A 2 3 4», con palo opcional «Ro 3e Cc 4b».
 * R rey, C caballo, S sota, A as; o oros, c copas, e espadas, b bastos. Sin palo se usa
 * el primero libre, sin repetir cartas dentro de `usadas` (que se actualiza).
 */
export function cartas(notacion: string, usadas: Set<string> = new Set()): Carta[] {
  return notacion
    .trim()
    .split(/\s+/)
    .map((ficha) => {
      const coincidencia = /^(R|C|S|A|[1-7]|1[0-2])([ocebOCEB])?$/.exec(ficha);
      if (!coincidencia) throw new Error(`Carta no válida en la notación: ${ficha}`);
      const numero = (FIGURAS[coincidencia[1]!] ?? Number(coincidencia[1])) as Numero;
      const letra = coincidencia[2]?.toLowerCase();
      const palo = letra
        ? PALO_POR_LETRA[letra]!
        : PALOS.find((p) => !usadas.has(idCarta({ numero, palo: p })));
      if (!palo) throw new Error(`No quedan palos libres para ${ficha}`);
      const carta = { numero, palo };
      if (usadas.has(idCarta(carta))) throw new Error(`Carta repetida: ${idCarta(carta)}`);
      usadas.add(idCarta(carta));
      return carta;
    });
}

/** Congela un objeto en profundidad: si el código intenta modificarlo, salta un error. */
export function congelar<T>(valor: T): T {
  if (valor && typeof valor === 'object') {
    Object.values(valor).forEach(congelar);
    Object.freeze(valor);
  }
  return valor;
}

export function nuevoDuelo(opciones: Partial<OpcionesDuelo> = {}): EstadoDuelo {
  return crearDuelo({ semilla: 'pruebas', quienEsMano: 'jugador', ...opciones }).estado;
}

/**
 * Sustituye las cartas de la mano en curso y rehace el mazo con las 32 restantes, en orden
 * fijo salvo que se indique el principio del mazo.
 */
export function prepararMano(
  estado: EstadoDuelo,
  reparto: { jugador: string; rival: string; mazo?: string },
): EstadoDuelo {
  const usadas = new Set<string>();
  const nuevo = structuredClone(estado);
  nuevo.cartas = { jugador: cartas(reparto.jugador, usadas), rival: cartas(reparto.rival, usadas) };
  const principio = reparto.mazo ? cartas(reparto.mazo, usadas) : [];
  const resto = crearBaraja().filter((c) => !usadas.has(idCarta(c)));
  nuevo.mazo = { cartas: [...principio, ...resto], descartes: [], descartesRonda: [] };
  return nuevo;
}

/** Duelo nuevo con las manos dadas, en la fase de mus. */
export function dueloCon(
  reparto: { jugador: string; rival: string; mazo?: string },
  opciones: Partial<OpcionesDuelo> & { marcador?: { jugador: number; rival: number } } = {},
): EstadoDuelo {
  const estado = prepararMano(nuevoDuelo(opciones), reparto);
  if (opciones.marcador) estado.marcador = { ...opciones.marcador };
  return estado;
}

/** Aplica una lista de acciones y junta los eventos. */
export function jugar(
  estado: EstadoDuelo,
  acciones: readonly AccionDuelo[],
  modificadores: readonly Modificador[] = [],
): { estado: EstadoDuelo; eventos: EventoDuelo[] } {
  const eventos: EventoDuelo[] = [];
  let actual = estado;
  for (const accion of acciones) {
    const resultado = aplicarAccion(actual, accion, modificadores);
    actual = resultado.estado;
    eventos.push(...resultado.eventos);
  }
  return { estado: actual, eventos };
}

/** Atajos para escribir acciones en las pruebas. */
export const a = {
  mus: (lado: Lado): AccionDuelo => ({ tipo: 'mus', lado }),
  corto: (lado: Lado): AccionDuelo => ({ tipo: 'corto', lado }),
  descartar: (lado: Lado, notacion: string): AccionDuelo => ({ tipo: 'descartar', lado, cartas: cartas(notacion) }),
  paso: (lado: Lado): AccionDuelo => ({ tipo: 'paso', lado }),
  envido: (lado: Lado, piedras = 2): AccionDuelo => ({ tipo: 'envido', lado, piedras }),
  mas: (lado: Lado, piedras = 2): AccionDuelo => ({ tipo: 'mas', lado, piedras }),
  quiero: (lado: Lado): AccionDuelo => ({ tipo: 'quiero', lado }),
  noQuiero: (lado: Lado): AccionDuelo => ({ tipo: 'noQuiero', lado }),
  ordago: (lado: Lado): AccionDuelo => ({ tipo: 'ordago', lado }),
  siguienteMano: (): AccionDuelo => ({ tipo: 'siguienteMano' }),
};

/** Las dos pasan un lance con envites, empezando por la mano. */
export function pasanLosDos(mano: Lado): AccionDuelo[] {
  return [a.paso(mano), a.paso(mano === 'jugador' ? 'rival' : 'jugador')];
}

/** Todas las cartas del duelo en este momento, para comprobar que siguen siendo 40. */
export function todasLasCartas(estado: EstadoDuelo): Carta[] {
  return [
    ...estado.cartas.jugador,
    ...estado.cartas.rival,
    ...estado.mazo.cartas,
    ...estado.mazo.descartes,
    ...estado.mazo.descartesRonda,
  ];
}
