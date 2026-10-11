import type { AccionEnvite } from '../nucleo/apuestas';
import type { Lado } from '../nucleo/comun';
import type { DecisionRival } from '../nucleo/ia/rival';
import type { TicDisparado } from '../nucleo/ia/tics';
import { tieneJuego, tienePares } from '../nucleo/mano';
import { ES, type TextosRival } from '../textos/es';
import type { Partida, ResultadoPartida } from './partida';

/**
 * Una línea del acta de la mano: lo que dice cada uno («ENVIDO DOS») o lo que pasa en la
 * mesa («La Grande queda en paso»).
 */
export interface LineaActa {
  /** Quién habla; `null` para lo que pasa en la mesa. */
  quien: Lado | null;
  texto: string;
  /** Frase del rival, solo en lo que dice él. */
  frase?: string;
}

/**
 * Lo que la mesa enseña además del estado del duelo: el acta de la mano, los tics pendientes
 * y los avisos de la Cara. Se calcula a partir de los eventos de cada acción, sin efectos
 * secundarios.
 */
export interface EstadoMesa {
  partida: Partida;
  /** Todo lo dicho y pasado en la mano en curso, en orden. */
  acta: LineaActa[];
  /** Tics que faltan por enseñar, en orden. */
  colaTics: TicDisparado[];
  /** Tic que se está enseñando. */
  tic: (TicDisparado & { clave: number }) | null;
  /** Última decisión del rival, para el modo de pruebas. */
  decision: DecisionRival | null;
  /** Último cambio de Cara, para enseñarlo junto a la barra. */
  avisoCara: { delta: number; motivos: string[]; clave: number } | null;
  /** Cara a 0: se te acaba de notar el tic. */
  seTeNota: number | null;
  /** Contador para ir rotando las frases del rival. */
  frases: number;
  claveTic: number;
  claveAviso: number;
}

/** Más que de sobra para una mano; lo viejo se descarta. */
const LINEAS_ACTA = 40;
const M = ES.mesa;

export const textosDe = (partida: Partida): TextosRival => ES.rivales[partida.rivalId];

export function mesaInicial(partida: Partida): EstadoMesa {
  const { saludo } = textosDe(partida);
  return {
    partida,
    acta: [{ quien: 'rival', texto: saludo.accion, frase: saludo.frase }],
    colaTics: [],
    tic: null,
    decision: null,
    avisoCara: null,
    seTeNota: null,
    frases: 0,
    claveTic: 0,
    claveAviso: 0,
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

type FrasesEnLista = 'mus' | 'corto' | 'descarte' | 'paso' | 'envido' | 'mas' | 'quiero' | 'noQuiero' | 'ordago' | 'declara';

/** Lo último que ha dicho el rival en el acta (lo que va con su frase). */
export function ultimoDelRival(acta: LineaActa[]): number {
  for (let i = acta.length - 1; i >= 0; i--) if (acta[i]!.quien === 'rival') return i;
  return -1;
}

export function aplicarNovedades(previo: EstadoMesa, { partida, novedades }: ResultadoPartida): EstadoMesa {
  const textos = textosDe(partida);
  let { frases, avisoCara, seTeNota, claveAviso } = previo;
  let acta = [...previo.acta];
  const frase = (tipo: FrasesEnLista) => {
    const lista = textos.frases[tipo];
    return lista[frases++ % lista.length];
  };
  /** Lo que dice alguien; el rival lo acompaña de una frase suya. */
  const dice = (quien: Lado, texto: string, fraseRival?: string) =>
    acta.push(quien === 'rival' && fraseRival ? { quien, texto, frase: fraseRival } : { quien, texto });
  const pasa = (texto: string) => acta.push({ quien: null, texto });
  const nombre = (lado: Lado) => (lado === 'rival' ? textos.nombre : null);

  for (const evento of novedades.eventos) {
    switch (evento.tipo) {
      case 'reparto': {
        // Cada mano empieza un acta nueva; la primera, con el saludo del rival.
        const saludo = evento.numeroMano === 1 ? acta.find((l) => l.quien === 'rival') : undefined;
        acta = [];
        pasa(M.acta.reparto(evento.numeroMano, nombre(evento.quienEsMano), evento.numeroMano === 1));
        if (saludo) acta.push(saludo);
        break;
      }
      case 'mus':
        dice(evento.lado, evento.quiereMus ? M.botones.mus : M.botones.corto, frase(evento.quiereMus ? 'mus' : 'corto'));
        break;
      case 'descarte':
        dice(evento.lado, M.cartas(evento.descartadas.length), frase('descarte'));
        break;
      case 'declaracion':
        dice(evento.lado, M.declaracion(ES.lances[evento.lance], evento.tiene), frase('declara'));
        break;
      case 'envite':
        dice(evento.lado, textoEnvite(evento.accion), frase(evento.accion.tipo));
        break;
      case 'deje':
        pasa(M.acta.deje(nombre(evento.lado), evento.piedras, ES.lances[evento.lance]));
        break;
      case 'finLance': {
        const lance = ES.lances[evento.lance];
        if (evento.modo === 'nadie') pasa(M.acta.nadie(lance));
        if (evento.modo === 'soloUno') {
          const tiene = evento.lance === 'pares' ? tienePares : tieneJuego;
          const lado: Lado = tiene(partida.duelo.cartas.jugador, partida.duelo.reglas.modoReyes) ? 'jugador' : 'rival';
          pasa(M.acta.soloUno(nombre(lado), lance));
        }
        if (evento.resultado?.tipo === 'enPaso') pasa(M.acta.enPaso(lance));
        if (evento.resultado?.tipo === 'querido') pasa(M.acta.querido(lance, evento.resultado.piedras));
        break;
      }
      case 'trato':
        if (evento.ofrece === 'rival') {
          dice('rival', M.pideTrato, textos.frases.trato);
          pasa(M.tratoExplica(textos.nombre));
        }
        break;
      case 'tratoResuelto':
        dice(evento.lado, evento.acepta ? M.botones.aceptarTrato : M.botones.rechazarTrato);
        if (evento.lado === 'jugador') {
          if (evento.acepta) dice('rival', M.tratoHecho, textos.frases.tratoAceptado);
          else dice('rival', M.sinTrato, textos.frases.tratoRechazado);
        }
        break;
      case 'finDuelo':
        if (evento.ganador === 'rival') dice('rival', M.ganoYo, textos.frases.gana);
        else dice('rival', M.meHasGanado, textos.frases.pierde);
        break;
      default:
        break;
    }
  }

  if (novedades.seEnfada) {
    dice('rival', M.enfadado, textos.frases.enfado);
    pasa(M.acta.enfadado(textos.nombre));
  }
  if (novedades.imponePenitencia) {
    dice('rival', M.penitencia, textos.frases.penitencia);
    pasa(M.acta.penitencia);
  }
  if (novedades.seOfende) {
    dice('rival', M.ofendida, textos.frases.ofendida);
    pasa(M.acta.ofendida(textos.nombre));
  }
  if (novedades.seTeNota) {
    pasa(M.acta.seTeNota);
    seTeNota = ++claveAviso;
  }
  if (novedades.cambiosCara.length > 0) {
    const motivos = novedades.cambiosCara.map((c) => M.motivosCara[c.motivo]);
    novedades.cambiosCara.forEach((c, i) => pasa(M.acta.cara(c.delta, motivos[i]!)));
    avisoCara = { delta: novedades.cambiosCara.reduce((s, c) => s + c.delta, 0), motivos, clave: ++claveAviso };
  }

  return {
    ...previo,
    partida,
    acta: acta.slice(-LINEAS_ACTA),
    frases,
    avisoCara,
    seTeNota,
    claveAviso,
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
