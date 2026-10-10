import type { AccionEnvite } from '../nucleo/apuestas';
import type { Lado } from '../nucleo/comun';
import type { DecisionRival } from '../nucleo/ia/rival';
import type { TicDisparado } from '../nucleo/ia/tics';
import { tieneJuego, tienePares } from '../nucleo/mano';
import { ES } from '../textos/es';
import type { Partida, ResultadoPartida } from './partida';

/**
 * Lo que la mesa enseña además del estado del duelo: el bocadillo del rival, lo último que
 * dijo el jugador, la crónica y los tics pendientes de enseñar. Se calcula a partir de los
 * eventos de cada acción, sin efectos secundarios.
 */
export interface EstadoMesa {
  partida: Partida;
  bocadillo: { accion: string; frase?: string };
  /** Lo último que dijo el jugador («ENVIDO DOS»). */
  delJugador: string | null;
  cronica: string[];
  /** Tics que faltan por enseñar, en orden. */
  colaTics: TicDisparado[];
  /** Tic que se está enseñando. */
  tic: (TicDisparado & { clave: number }) | null;
  /** Última decisión del rival, para el modo de depuración. */
  decision: DecisionRival | null;
  /** Contador para ir rotando las frases del rival. */
  frases: number;
  claveTic: number;
}

const LINEAS_CRONICA = 5;
const RIVAL = ES.rivales.ruperto;
const M = ES.mesa;

export function mesaInicial(partida: Partida): EstadoMesa {
  return {
    partida,
    bocadillo: { ...RIVAL.saludo },
    delJugador: null,
    cronica: [],
    colaTics: [],
    tic: null,
    decision: null,
    frases: 0,
    claveTic: 0,
  };
}

export function textoEnvite(accion: AccionEnvite): string {
  switch (accion.tipo) {
    case 'paso':
      return M.botones.paso;
    case 'envido':
      return M.botones.envido(accion.piedras);
    case 'mas':
      return M.botones.mas(accion.piedras);
    case 'quiero':
      return M.botones.quiero;
    case 'noQuiero':
      return M.botones.noQuiero;
    case 'ordago':
      return M.botones.ordago;
  }
}

export function aplicarNovedades(previo: EstadoMesa, { partida, novedades }: ResultadoPartida): EstadoMesa {
  let { bocadillo, delJugador, frases } = previo;
  const cronica = [...previo.cronica];
  const rival = (lado: Lado) => (lado === 'rival' ? RIVAL.nombre : null);
  const frase = (tipo: Exclude<keyof typeof RIVAL.frases, 'enfado' | 'gana' | 'pierde'>) => {
    const lista = RIVAL.frases[tipo];
    return lista[frases++ % lista.length];
  };

  for (const evento of novedades.eventos) {
    switch (evento.tipo) {
      case 'reparto':
        delJugador = null;
        break;
      case 'mus':
        cronica.push(M.cronica.mus(rival(evento.lado), evento.quiereMus));
        if (evento.lado === 'rival') {
          bocadillo = { accion: evento.quiereMus ? M.botones.mus : M.botones.corto, frase: frase(evento.quiereMus ? 'mus' : 'corto') };
        } else {
          delJugador = evento.quiereMus ? M.botones.mus : M.botones.corto;
        }
        break;
      case 'descarte': {
        const n = evento.descartadas.length;
        cronica.push(M.cronica.descarta(rival(evento.lado), n));
        if (evento.lado === 'rival') bocadillo = { accion: M.cartasRival(n), frase: frase('descarte') };
        else delJugador = M.cambio(n);
        break;
      }
      case 'declaracion': {
        const lance = ES.lances[evento.lance];
        cronica.push(M.cronica.declara(rival(evento.lado), lance, evento.tiene));
        if (evento.lado === 'rival') bocadillo = { accion: M.declaracion(lance, evento.tiene), frase: frase('declara') };
        else delJugador = M.declaracion(lance, evento.tiene);
        break;
      }
      case 'envite': {
        const texto = textoEnvite(evento.accion);
        cronica.push(M.cronica.envite(rival(evento.lado), texto));
        if (evento.lado === 'rival') bocadillo = { accion: texto, frase: frase(evento.accion.tipo) };
        else delJugador = texto;
        break;
      }
      case 'deje':
        cronica.push(M.cronica.deje(rival(evento.lado), evento.piedras));
        break;
      case 'finLance': {
        const lance = ES.lances[evento.lance];
        if (evento.modo === 'nadie') cronica.push(M.cronica.nadie(lance));
        if (evento.modo === 'soloUno') {
          const tiene = evento.lance === 'pares' ? tienePares : tieneJuego;
          const lado: Lado = tiene(partida.duelo.cartas.jugador, partida.duelo.reglas.modoReyes) ? 'jugador' : 'rival';
          cronica.push(M.cronica.soloUno(rival(lado), lance));
        }
        break;
      }
      case 'finDuelo':
        bocadillo =
          evento.ganador === 'rival'
            ? { accion: M.ganoYo, frase: RIVAL.frases.gana }
            : { accion: M.meHasGanado, frase: RIVAL.frases.pierde };
        break;
      default:
        break;
    }
  }
  if (novedades.seEnfada) bocadillo = { accion: M.enfadado, frase: RIVAL.frases.enfado };

  return {
    ...previo,
    partida,
    bocadillo,
    delJugador,
    frases,
    cronica: cronica.slice(-LINEAS_CRONICA),
    colaTics: [...previo.colaTics, ...novedades.tics],
    decision: novedades.decision ?? previo.decision,
  };
}

/** Pasa el siguiente tic de la cola a la pantalla. */
export function sacarTic(estado: EstadoMesa): EstadoMesa {
  const [siguiente, ...resto] = estado.colaTics;
  if (!siguiente) return estado;
  return { ...estado, tic: { ...siguiente, clave: estado.claveTic + 1 }, claveTic: estado.claveTic + 1, colaTics: resto };
}
