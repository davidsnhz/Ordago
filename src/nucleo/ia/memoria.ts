import { IA } from '../../datos/ia';
import type { PerfilRival } from '../../datos/rivales';
import type { ModoReyes } from '../carta';
import type { Lado } from '../comun';
import type { EventoDuelo } from '../eventos';
import { LANCES, type Lance } from '../lances';
import { calcularFuerza } from './fuerza';

/**
 * Lo que el rival recuerda del duelo: tus envites, tus faroles descubiertos y tus órdagos
 * (con ellos calcula t_farol), más la racha de lances perdidos para el enfado de Ruperto.
 */
export interface MemoriaRival {
  envitesJugador: number;
  farolesDescubiertos: number;
  ordagosJugador: number;
  lancesPerdidosSeguidos: number;
  /** Manos que le quedan enfadado (acepta todo). */
  manosEnfadado: number;
  /** Quién es mano en la mano en curso (lo dice el reparto). */
  quienEsMano: Lado | null;
  /** Envites del jugador en la mano en curso, para juzgarlos al ver las cartas. */
  envitesDeLaMano: { lance: Lance; esMano: boolean }[];
}

export function memoriaInicial(): MemoriaRival {
  return {
    envitesJugador: 0,
    farolesDescubiertos: 0,
    ordagosJugador: 0,
    lancesPerdidosSeguidos: 0,
    manosEnfadado: 0,
    quienEsMano: null,
    envitesDeLaMano: [],
  };
}

export function proporcionFaroles(memoria: MemoriaRival): number {
  return memoria.envitesJugador === 0 ? 0 : memoria.farolesDescubiertos / memoria.envitesJugador;
}

export interface CambiosMemoria {
  memoria: MemoriaRival;
  /** Se acaba de enfadar. */
  seEnfada: boolean;
}

/** Actualiza la memoria con los eventos de una acción. `rival` es el lado de la IA. */
export function recordar(
  memoria: MemoriaRival,
  eventos: readonly EventoDuelo[],
  perfil: PerfilRival,
  modo: ModoReyes,
  rival: Lado = 'rival',
): CambiosMemoria {
  const m: MemoriaRival = { ...memoria, envitesDeLaMano: [...memoria.envitesDeLaMano] };
  let seEnfada = false;

  for (const evento of eventos) {
    switch (evento.tipo) {
      case 'reparto':
        m.quienEsMano = evento.quienEsMano;
        m.envitesDeLaMano = [];
        break;
      case 'envite': {
        if (evento.lado === rival) break;
        const tipo = evento.accion.tipo;
        if (tipo !== 'envido' && tipo !== 'mas' && tipo !== 'ordago') break;
        m.envitesJugador++;
        if (tipo === 'ordago') m.ordagosJugador++;
        m.envitesDeLaMano.push({ lance: evento.lance, esMano: m.quienEsMano !== null && m.quienEsMano !== rival });
        break;
      }
      case 'recuento': {
        // Se ven las cartas: los envites del jugador con menos del 35 % de ganar eran faroles.
        const cartasJugador = rival === 'rival' ? evento.cartas.jugador : evento.cartas.rival;
        const fuerzas = new Map<boolean, ReturnType<typeof calcularFuerza>>();
        for (const envite of m.envitesDeLaMano) {
          let fuerza = fuerzas.get(envite.esMano);
          if (!fuerza) {
            fuerza = calcularFuerza(cartasJugador, envite.esMano, modo);
            fuerzas.set(envite.esMano, fuerza);
          }
          if (fuerza[envite.lance] < IA.umbralFarol) m.farolesDescubiertos++;
        }
        m.envitesDeLaMano = [];

        // Enfado: primero se gasta el de manos anteriores, luego se mira la racha.
        if (m.manosEnfadado > 0) m.manosEnfadado--;
        for (const lance of LANCES) {
          const ganador = evento.ganadores[lance];
          if (ganador === undefined || ganador === null) continue;
          m.lancesPerdidosSeguidos = ganador === rival ? 0 : m.lancesPerdidosSeguidos + 1;
          if (perfil.enfado && m.lancesPerdidosSeguidos >= perfil.enfado.lancesSeguidos) {
            m.manosEnfadado = perfil.enfado.manos;
            m.lancesPerdidosSeguidos = 0;
            seEnfada = true;
          }
        }
        break;
      }
    }
  }
  return { memoria: m, seEnfada };
}
