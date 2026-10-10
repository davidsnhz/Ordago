import { IA } from '../datos/ia';
import { RIVALES, type IdRival } from '../datos/rivales';
import { Azar, estadoDesdeSemilla, type EstadoAzar } from '../nucleo/azar';
import { ErrorJugada } from '../nucleo/comun';
import { aplicarAccion, crearDuelo, type AccionDuelo, type EstadoDuelo } from '../nucleo/duelo';
import type { EventoDuelo } from '../nucleo/eventos';
import { memoriaInicial, recordar, type MemoriaRival } from '../nucleo/ia/memoria';
import { decidirRival, vistaDe, type DecisionRival } from '../nucleo/ia/rival';
import { sortearTics, type MomentoTic, type TicDisparado } from '../nucleo/ia/tics';

/**
 * Un duelo contra un rival con IA: el estado del motor más lo que el rival recuerda y su
 * propio azar con semilla. Todo es JSON, así que se guarda tal cual al final de cada mano.
 */

export const VERSION_PARTIDA = 1;

export interface Partida {
  version: typeof VERSION_PARTIDA;
  semilla: string;
  rivalId: IdRival;
  duelo: EstadoDuelo;
  memoria: MemoriaRival;
  azarIA: EstadoAzar;
  /** Cara del jugador; fija hasta que exista el sistema de Cara (fase 3). */
  caraJugador: number;
}

/** Lo que ha pasado con una acción, para que la interfaz lo enseñe. */
export interface Novedades {
  eventos: EventoDuelo[];
  tics: TicDisparado[];
  /** Decisión del rival, si la acción era suya (modo de depuración). */
  decision: DecisionRival | null;
  seEnfada: boolean;
}

export interface ResultadoPartida {
  partida: Partida;
  novedades: Novedades;
}

export function nuevaPartida(semilla: string, rivalId: IdRival = 'ruperto'): ResultadoPartida {
  const { estado, eventos } = crearDuelo({ semilla });
  const partida: Partida = {
    version: VERSION_PARTIDA,
    semilla,
    rivalId,
    duelo: estado,
    memoria: memoriaInicial(),
    azarIA: estadoDesdeSemilla(`${semilla}/ia`),
    caraJugador: IA.caraProvisional,
  };
  return procesar(partida, eventos, null, []);
}

export function leTocaAlRival(partida: Partida): boolean {
  return partida.duelo.fase !== 'finDuelo' && partida.duelo.turno === 'rival';
}

export function jugarJugador(partida: Partida, accion: AccionDuelo): ResultadoPartida {
  if ('lado' in accion && accion.lado !== 'jugador') throw new ErrorJugada('El jugador solo puede jugar por sí mismo');
  const { estado, eventos } = aplicarAccion(partida.duelo, accion);
  return procesar({ ...partida, duelo: estado }, eventos, null, []);
}

/** El rival decide y juega su acción. */
export function jugarRival(partida: Partida): ResultadoPartida {
  const perfil = RIVALES[partida.rivalId];
  const azar = new Azar(partida.azarIA);
  const decision = decidirRival(
    vistaDe(partida.duelo, 'rival'),
    { perfil, memoria: partida.memoria, caraJugador: partida.caraJugador },
    azar,
  );
  // Los tics pueden escaparse justo al decidir un envite.
  const ticsAlDecidir =
    decision.tipo === 'envite'
      ? sortearTics(perfil.tics, partida.duelo.cartas.rival, { tipo: 'envite', lance: decision.lance }, partida.duelo.reglas.modoReyes, azar)
      : [];
  const { estado, eventos } = aplicarAccion(partida.duelo, decision.accion);
  return procesar({ ...partida, duelo: estado, azarIA: azar.estado() }, eventos, decision, ticsAlDecidir);
}

function procesar(
  partida: Partida,
  eventos: EventoDuelo[],
  decision: DecisionRival | null,
  ticsPrevios: TicDisparado[],
): ResultadoPartida {
  const perfil = RIVALES[partida.rivalId];
  const modo = partida.duelo.reglas.modoReyes;
  const azar = new Azar(partida.azarIA);
  const tics = [...ticsPrevios];

  const momento = (m: MomentoTic, cartas = partida.duelo.cartas.rival) => {
    tics.push(...sortearTics(perfil.tics, cartas, m, modo, azar));
  };
  for (const evento of eventos) {
    if (evento.tipo === 'reparto') momento({ tipo: 'cartas' }, evento.cartas.rival);
    if (evento.tipo === 'descarte' && evento.lado === 'rival') momento({ tipo: 'cartas' });
    if (evento.tipo === 'declaracion' && evento.lado === 'rival') momento({ tipo: 'declaracion', lance: evento.lance });
  }

  const { memoria, seEnfada } = recordar(partida.memoria, eventos, perfil, modo);
  return {
    partida: { ...partida, memoria, azarIA: azar.estado() },
    novedades: { eventos, tics, decision, seEnfada },
  };
}
