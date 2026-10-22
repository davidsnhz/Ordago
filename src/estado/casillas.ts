import type { Lado, PorLado } from '../nucleo/comun';
import type { EstadoDuelo } from '../nucleo/duelo';
import type { Lance } from '../nucleo/lances';
import { tieneJuego, tienePares } from '../nucleo/mano';
import type { Cobro, LanceJugado } from '../nucleo/recuento';

/**
 * La mesa nueva (prototipo, 22 de octubre de 2026): los cuatro lances de la mano como cuatro
 * casillas en el tapete, como las zonas de Marvel Snap. En cada una se queda lo que ha pasado
 * (en paso, querido, «no quiero», quién tiene pares o juego) y, en el recuento, lo que cobra
 * cada uno. Sustituye a lo que contaba el acta de la mesa.
 */
export type EstadoCasilla =
  /** Todavía no se ha llegado. */
  | { tipo: 'falta' }
  /** Se juega ahora; `piedras`, lo que hay envidado y pendiente (0 si nadie ha envidado aún). */
  | { tipo: 'enJuego'; piedras: number; ordago: boolean }
  | { tipo: 'enPaso' }
  | { tipo: 'querido'; piedras: number }
  /** Alguien dijo «no quiero»: el otro ya se ha llevado sus piedras. */
  | { tipo: 'noQuerido'; ganador: Lado; piedras: number }
  | { tipo: 'ordago' }
  /** Pares o Juego que solo lleva uno: lo cobra en el recuento sin envites. */
  | { tipo: 'soloUno'; quien: Lado }
  /** Nadie lleva pares (o juego): no se juega. */
  | { tipo: 'nadie' }
  /** Un envite querido que se retiró por un trato. */
  | { tipo: 'trato' };

export interface CasillaLance {
  /** La cuarta es Juego o, si nadie lo lleva, Punto. */
  lance: Lance;
  /** Es el lance que se está jugando. */
  actual: boolean;
  estado: EstadoCasilla;
  /** Pares y Juego: quién ha dicho que lo lleva, en cuanto se ha declarado. */
  tienen: PorLado<boolean> | null;
  /** Solo en el recuento: lo que se cobra en esta casilla, con su orden y si se llegó a apuntar. */
  cobros: { cobro: Cobro; orden: number; apuntado: boolean }[];
}

export function casillasDe(duelo: EstadoDuelo): CasillaLance[] {
  const hayPunto = duelo.lanceActual === 'punto' || duelo.lances.some((l) => l.lance === 'punto');
  const lances: Lance[] = ['grande', 'chica', 'pares', hayPunto ? 'punto' : 'juego'];
  const recuento = duelo.fase === 'finMano' || duelo.fase === 'finDuelo' ? duelo.recuento : null;
  const lleva = (lance: Lance, lado: Lado) => (lance === 'pares' ? tienePares : tieneJuego)(duelo.cartas[lado], duelo.reglas.modoReyes);

  return lances.map((lance) => {
    const jugado = duelo.lances.find((l) => l.lance === lance);
    const actual = duelo.fase === 'envite' && duelo.lanceActual === lance;
    const declarado = (lance === 'pares' || lance === 'juego') && (actual || Boolean(jugado));
    return {
      lance,
      actual,
      estado: actual
        ? { tipo: 'enJuego', piedras: duelo.envite?.apuesta ?? 0, ordago: Boolean(duelo.envite?.ordago) }
        : jugado
          ? estadoJugado(jugado, (lado) => lleva(lance, lado))
          : { tipo: 'falta' },
      tienen: declarado ? { jugador: lleva(lance, 'jugador'), rival: lleva(lance, 'rival') } : null,
      cobros: recuento
        ? recuento.cobros.map((cobro, orden) => ({ cobro, orden, apuntado: orden < recuento.aplicados })).filter((c) => c.cobro.lance === lance)
        : [],
    };
  });
}

function estadoJugado(jugado: LanceJugado, lleva: (lado: Lado) => boolean): EstadoCasilla {
  if (jugado.modo === 'nadie') return { tipo: 'nadie' };
  if (jugado.modo === 'soloUno') return { tipo: 'soloUno', quien: lleva('jugador') ? 'jugador' : 'rival' };
  if (jugado.trato) return { tipo: 'trato' };
  const resultado = jugado.envite?.resultado;
  switch (resultado?.tipo) {
    case 'querido':
      return { tipo: 'querido', piedras: resultado.piedras };
    case 'noQuerido':
      return { tipo: 'noQuerido', ganador: resultado.ganador, piedras: resultado.piedras };
    case 'ordagoQuerido':
      return { tipo: 'ordago' };
    default:
      return { tipo: 'enPaso' };
  }
}
