import type { AccionEnvite } from '../nucleo/apuestas';
import type { Lado } from '../nucleo/comun';
import { cambiosDeCara } from '../nucleo/cara';
import type { EventoDuelo } from '../nucleo/eventos';
import type { DecisionRival } from '../nucleo/ia/rival';
import type { TicDisparado } from '../nucleo/ia/tics';
import { tieneJuego, tienePares } from '../nucleo/mano';
import { animoDe, RIVALES } from '../datos/rivales';
import { ES, nombreCarta, type TextosRival } from '../textos/es';
import type { Partida, ResultadoPartida } from './partida';

/**
 * Una línea del acta de la mano, contada: lo que hace cada uno («Has envidado dos.», «Agustín
 * sube cuatro más») o lo que pasa en la mesa («Grande en paso: se cobra en el recuento»).
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
  /** Tic que se está enseñando; `explicado` si los Apuntes de Chema dicen qué significa. */
  tic: (TicDisparado & { clave: number; explicado?: boolean }) | null;
  /** Última decisión del rival, para el modo de pruebas. */
  decision: DecisionRival | null;
  /** Último cambio de Cara, para enseñarlo junto a la marca de la barra. */
  avisoCara: { delta: number; motivos: string[]; clave: number } | null;
  /** Cara a 0: se te acaba de notar el tic. */
  seTeNota: number | null;
  /** Cara que acaba de poner el rival; `final` si se queda así porque se ha acabado el duelo. */
  reaccion: { tipo: ReaccionRival; final: boolean; clave: number } | null;
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
    acta: [{ quien: 'rival', texto: M.narra.saludo(textosDe(partida).nombre), frase: saludo.frase }],
    colaTics: [],
    tic: null,
    decision: null,
    avisoCara: null,
    seTeNota: null,
    reaccion: null,
    frases: 0,
    claveTic: 0,
    claveAviso: 0,
  };
}

/** Un envite contado: «Has envidado dos.» si es tuyo, «Agustín sube cuatro más» si es suyo. */
export function narrarEnvite(accion: AccionEnvite, rival: string | null): string {
  switch (accion.tipo) {
    case 'paso':
      return M.narra.paso(rival);
    case 'envido':
      return M.narra.envido(rival, accion.piedras);
    case 'mas':
      return M.narra.mas(rival, accion.piedras);
    case 'quiero':
      return M.narra.quiero(rival);
    case 'noQuiero':
      return M.narra.noQuiero(rival);
    case 'ordago':
      return M.narra.ordago(rival);
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
        dice(evento.lado, M.narra.mus(nombre(evento.lado), evento.quiereMus), frase(evento.quiereMus ? 'mus' : 'corto'));
        break;
      case 'descarte':
        dice(evento.lado, M.narra.descarte(nombre(evento.lado), evento.descartadas.length), frase('descarte'));
        break;
      case 'declaracion':
        dice(evento.lado, M.narra.declara(nombre(evento.lado), ES.lances[evento.lance], evento.tiene), frase('declara'));
        break;
      case 'envite':
        dice(evento.lado, narrarEnvite(evento.accion, nombre(evento.lado)), frase(evento.accion.tipo));
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
          dice('rival', M.narra.trato(textos.nombre), textos.frases.trato);
          pasa(M.tratoExplica(textos.nombre));
        }
        break;
      case 'tratoResuelto':
        if (evento.lado === 'jugador') {
          dice('jugador', M.narra.respuestaTrato(evento.acepta));
          if (evento.acepta) dice('rival', M.narra.tratoHecho(textos.nombre), textos.frases.tratoAceptado);
          else dice('rival', M.narra.sinTrato(textos.nombre), textos.frases.tratoRechazado);
        }
        break;
      case 'finDuelo':
        if (evento.ganador === 'rival') dice('rival', M.narra.gana(textos.nombre), textos.frases.gana);
        else dice('rival', M.narra.pierde(textos.nombre), textos.frases.pierde);
        break;
      default:
        break;
    }
  }

  if (novedades.seEnfada) {
    dice('rival', M.narra.enfado(textos.nombre), textos.frases.enfado);
    pasa(M.acta.enfadado);
  }
  if (novedades.imponePenitencia) {
    dice('rival', M.narra.penitencia(textos.nombre), textos.frases.penitencia);
    pasa(M.acta.penitencia);
  }
  if (novedades.seOfende) {
    dice('rival', M.narra.ofendida(textos.nombre), textos.frases.ofendida);
    pasa(M.acta.ofendida);
  }
  if (novedades.animo) {
    const { despues } = novedades.animo;
    const quiereTodo = Boolean(RIVALES[partida.rivalId].seVieneArriba);
    if (despues === 'crecido') {
      dice('rival', M.narra.crecido(textos.nombre), textos.frases.crecido);
      pasa(M.acta.crecido(quiereTodo));
    } else if (despues === 'arrugado') {
      dice('rival', M.narra.arrugado(textos.nombre), textos.frases.arrugado);
      pasa(M.acta.arrugado);
    }
  }
  if (novedades.efecto) {
    const N = ES.gira.narra;
    const e = novedades.efecto;
    if (e.tipo === 'orujo') dice('jugador', N.orujo);
    if (e.tipo === 'chato') pasa(N.chato(textos.nombre));
    if (e.tipo === 'conversacion') pasa(N.conversacion(textos.nombre));
    if (e.tipo === 'apuntes') pasa(N.apuntes);
    if (e.tipo === 'lazarillo') pasa(N.lazarillo(textos.nombre, nombreCarta(e.carta).toLowerCase()));
    if (e.tipo === 'recaudadora') pasa(N.recaudadora);
  }
  if (novedades.medalla) pasa(ES.gira.narra.medalla);
  if (novedades.seTeNota) {
    pasa(M.acta.seTeNota);
    seTeNota = ++claveAviso;
  }
  if (novedades.cambiosCara.length > 0) {
    const motivos = novedades.cambiosCara.map((c) => M.motivosCara[c.motivo]);
    novedades.cambiosCara.forEach((c, i) => pasa(M.acta.cara(c.delta, motivos[i]!)));
    avisoCara = { delta: novedades.cambiosCara.reduce((s, c) => s + c.delta, 0), motivos, clave: ++claveAviso };
  }

  const nueva = reaccionDe(novedades.eventos, partida);
  const reaccion = nueva ? { ...nueva, clave: ++claveAviso } : previo.reaccion;

  return {
    ...previo,
    partida,
    reaccion,
    acta: acta.slice(-LINEAS_ACTA),
    frases,
    avisoCara,
    seTeNota,
    claveAviso,
    colaTics: [...previo.colaTics, ...novedades.tics],
    decision: novedades.decision ?? previo.decision,
  };
}

/** Cara que pone el rival un momento, o hasta el final si se acaba el duelo. */
export type ReaccionRival = 'sorprendido' | 'riendo' | 'enfadado';

/** Cómo está el rival mientras dura: crecido o arrugado (Rubén y Chema), enfadado (Agustín, Doña Ignacia). */
export type PoseRival = 'crecido' | 'arrugado' | 'enfadado';

/**
 * La cara que pone el rival por lo que acaba de pasar: se ríe si gana el duelo o te pilla un
 * farol, se enfada si lo pierde o le pillas el suyo, y se sorprende cuando le echas un órdago.
 */
export function reaccionDe(eventos: readonly EventoDuelo[], partida: Partida): { tipo: ReaccionRival; final: boolean } | null {
  const fin = eventos.find((e) => e.tipo === 'finDuelo');
  if (fin) return { tipo: fin.ganador === 'rival' ? 'riendo' : 'enfadado', final: true };
  if (eventos.some((e) => e.tipo === 'envite' && e.lado === 'jugador' && e.accion.tipo === 'ordago')) return { tipo: 'sorprendido', final: false };
  const pillado = (lado: Lado) => cambiosDeCara(eventos, partida.duelo, lado).some((c) => c.motivo === 'farolPillado');
  if (pillado('rival')) return { tipo: 'enfadado', final: false };
  if (pillado('jugador')) return { tipo: 'riendo', final: false };
  return null;
}

/** Cómo está el rival ahora por sus reglas especiales; `null` si está como siempre. */
export function poseDelRival(partida: Partida): PoseRival | null {
  const { duelo, memoria } = partida;
  if (duelo.fase === 'finDuelo') return null;
  const animo = animoDe(RIVALES[partida.rivalId], duelo.marcador.rival - duelo.marcador.jugador);
  if (animo) return animo;
  if (memoria.manosEnfadado > 0 || memoria.ofendidaHastaMano >= duelo.numeroMano) return 'enfadado';
  return null;
}

/**
 * Pasa el siguiente tic de la cola a la pantalla. Si están abiertos los Apuntes de Chema, ese tic
 * se explica (una vez por duelo) y se apunta en el acta qué significa.
 */
export function sacarTic(estado: EstadoMesa): EstadoMesa {
  const [siguiente, ...resto] = estado.colaTics;
  if (!siguiente) return estado;
  const { partida } = estado;
  const explicado = partida.extras.explicarTic;
  const tic = { ...siguiente, clave: estado.claveTic + 1, explicado };
  if (!explicado) return { ...estado, tic, claveTic: estado.claveTic + 1, colaTics: resto };
  const significado = textosDe(partida).significadoTics[siguiente.id] ?? '';
  return {
    ...estado,
    partida: { ...partida, extras: { ...partida.extras, explicarTic: false, apuntesUsados: true } },
    acta: [...estado.acta, { quien: null, texto: ES.gira.narra.explicado(significado) }].slice(-LINEAS_ACTA),
    tic,
    claveTic: estado.claveTic + 1,
    colaTics: resto,
  };
}
