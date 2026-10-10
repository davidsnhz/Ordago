import { REGLAS_BASE, type Reglas } from '../datos/reglas';
import {
  aplicarEnvite,
  iniciarEnvite,
  opcionesEnvite,
  type AccionEnvite,
  type EstadoEnvite,
  type LimitesEnvite,
  type OpcionEnvite,
} from './apuestas';
import { Azar, estadoDesdeSemilla, type EstadoAzar } from './azar';
import { CARTAS_POR_MANO, cerrarRondaDeDescartes, crearMazo, repartir, robar, type Mazo } from './baraja';
import { mismaCarta, type Carta } from './carta';
import { ErrorJugada, LADOS, otroLado, type Lado, type PorLado } from './comun';
import type { EventoDuelo, MotivoFin } from './eventos';
import { ganadorLance, type Lance } from './lances';
import { tieneJuego, tienePares } from './mano';
import { piedrasIniciales, quienGanaEmpate, rondasMusPermitidas, type Modificador } from './modificadores';
import { aplicarCobros, calcularCobros, type Cobro, type CobrosDeLaMano, type LanceJugado } from './recuento';

/**
 * Máquina de estados de un duelo a 20 piedras.
 *
 * Una mano: reparto → mus (y descartes, como mucho 2 rondas) → Grande → Chica → Pares →
 * Juego o Punto → recuento. Entre mano y mano se espera la acción `siguienteMano`, para
 * que la interfaz pueda enseñar el recuento y se pueda guardar la partida.
 *
 * `aplicarAccion` no modifica el estado que recibe: devuelve uno nuevo y los eventos.
 * El estado es JSON plano (incluye el del azar), así que se puede guardar y reanudar.
 */

export const VERSION_ESTADO = 1;

export type Fase = 'mus' | 'descarte' | 'envite' | 'finMano' | 'finDuelo';

export interface RecuentoDeLaMano {
  cobros: Cobro[];
  /** Cuántos cobros se apuntaron antes de que alguien llegara a la meta. */
  aplicados: number;
  ganadores: CobrosDeLaMano['ganadores'];
}

export interface EstadoDuelo {
  version: typeof VERSION_ESTADO;
  reglas: Reglas;
  azar: EstadoAzar;
  marcador: PorLado<number>;
  /** Mano en curso, contando desde 1. */
  numeroMano: number;
  /** Quién habla primero y gana los empates. Cambia en cada mano. */
  quienEsMano: Lado;
  fase: Fase;
  /** A quién le toca; `null` entre manos y al acabar el duelo. */
  turno: Lado | null;
  cartas: PorLado<Carta[]>;
  mazo: Mazo;
  /** Rondas de descarte ya hechas en esta mano. */
  rondasMus: number;
  lanceActual: Lance | null;
  envite: EstadoEnvite | null;
  /** Lances ya resueltos en esta mano, en orden. */
  lances: LanceJugado[];
  /** Recuento de la mano recién terminada. */
  recuento: RecuentoDeLaMano | null;
  ganador: Lado | null;
  motivoFin: MotivoFin | null;
}

export type AccionDuelo =
  | { tipo: 'mus'; lado: Lado }
  | { tipo: 'corto'; lado: Lado }
  | { tipo: 'descartar'; lado: Lado; cartas: Carta[] }
  | { tipo: 'paso'; lado: Lado }
  | { tipo: 'envido'; lado: Lado; piedras: number }
  | { tipo: 'mas'; lado: Lado; piedras: number }
  | { tipo: 'quiero'; lado: Lado }
  | { tipo: 'noQuiero'; lado: Lado }
  | { tipo: 'ordago'; lado: Lado }
  | { tipo: 'siguienteMano' };

export type OpcionDuelo =
  | { tipo: 'mus' }
  | { tipo: 'corto' }
  | { tipo: 'descartar'; minimo: number; maximo: number }
  | OpcionEnvite
  | { tipo: 'siguienteMano' };

export interface AccionesValidas {
  /** Quién tiene que actuar; `null` si la acción no es de ningún jugador (repartir otra mano). */
  lado: Lado | null;
  opciones: OpcionDuelo[];
}

export interface ResultadoAccion {
  estado: EstadoDuelo;
  eventos: EventoDuelo[];
}

export interface OpcionesDuelo {
  semilla: number | string;
  /** Quién es mano en el primer reparto. Si no se indica, se sortea. */
  quienEsMano?: Lado;
  reglas?: Partial<Reglas>;
  modificadores?: readonly Modificador[];
}

interface Contexto {
  e: EstadoDuelo;
  azar: Azar;
  eventos: EventoDuelo[];
  mods: readonly Modificador[];
}

const SIGUIENTE_LANCE: Record<Lance, Lance | null> = {
  grande: 'chica',
  chica: 'pares',
  pares: 'juego',
  juego: null,
  punto: null,
};

export function crearDuelo(opciones: OpcionesDuelo): ResultadoAccion {
  const mods = opciones.modificadores ?? [];
  const azar = new Azar(estadoDesdeSemilla(opciones.semilla));
  const quienEsMano = opciones.quienEsMano ?? azar.elegir(LADOS);
  const e: EstadoDuelo = {
    version: VERSION_ESTADO,
    reglas: { ...REGLAS_BASE, ...opciones.reglas },
    azar: azar.estado(),
    marcador: { jugador: piedrasIniciales(mods, 'jugador'), rival: piedrasIniciales(mods, 'rival') },
    numeroMano: 1,
    quienEsMano,
    fase: 'mus',
    turno: quienEsMano,
    cartas: { jugador: [], rival: [] },
    mazo: { cartas: [], descartes: [], descartesRonda: [] },
    rondasMus: 0,
    lanceActual: null,
    envite: null,
    lances: [],
    recuento: null,
    ganador: null,
    motivoFin: null,
  };
  const ctx: Contexto = { e, azar, eventos: [], mods };
  nuevaMano(ctx);
  e.azar = azar.estado();
  return { estado: e, eventos: ctx.eventos };
}

/** Aplica una acción. Lanza `ErrorJugada` si no es legal; el estado recibido nunca cambia. */
export function aplicarAccion(
  estado: EstadoDuelo,
  accion: AccionDuelo,
  modificadores: readonly Modificador[] = [],
): ResultadoAccion {
  if (estado.fase === 'finDuelo') throw new ErrorJugada('El duelo ya ha terminado');
  const e = structuredClone(estado) as EstadoDuelo;
  const azar = new Azar(e.azar);
  const ctx: Contexto = { e, azar, eventos: [], mods: modificadores };

  switch (accion.tipo) {
    case 'siguienteMano':
      exigirFase(e, 'finMano', 'repartir otra mano');
      e.quienEsMano = otroLado(e.quienEsMano);
      e.numeroMano += 1;
      nuevaMano(ctx);
      break;
    case 'mus':
    case 'corto':
      hablarDeMus(ctx, accion.lado, accion.tipo === 'mus');
      break;
    case 'descartar':
      descartar(ctx, accion.lado, accion.cartas);
      break;
    default:
      envidar(ctx, accion.lado, aAccionEnvite(accion));
  }

  e.azar = azar.estado();
  return { estado: e, eventos: ctx.eventos };
}

export function accionesValidas(estado: EstadoDuelo): AccionesValidas {
  switch (estado.fase) {
    case 'finDuelo':
      return { lado: null, opciones: [] };
    case 'finMano':
      return { lado: null, opciones: [{ tipo: 'siguienteMano' }] };
    case 'mus':
      return { lado: estado.turno, opciones: [{ tipo: 'mus' }, { tipo: 'corto' }] };
    case 'descarte':
      return { lado: estado.turno, opciones: [{ tipo: 'descartar', minimo: 1, maximo: CARTAS_POR_MANO }] };
    case 'envite':
      return { lado: estado.turno, opciones: opcionesEnvite(enviteEnCurso(estado), limitesEnvite(estado.reglas)) };
  }
}

export function limitesEnvite(reglas: Reglas): LimitesEnvite {
  return { enviteMinimo: reglas.enviteMinimo, subidaMinima: reglas.subidaMinima, deje: reglas.deje };
}

// ——— Fases de la mano ———

function nuevaMano(ctx: Contexto): void {
  const { e, azar } = ctx;
  e.mazo = crearMazo(azar);
  e.cartas = repartir(e.mazo, e.quienEsMano);
  e.rondasMus = 0;
  e.lances = [];
  e.lanceActual = null;
  e.envite = null;
  e.recuento = null;
  emitir(ctx, { tipo: 'reparto', numeroMano: e.numeroMano, quienEsMano: e.quienEsMano, cartas: copiarCartas(e.cartas) });
  if (rondasMusPermitidas(ctx.mods, e) > 0) {
    e.fase = 'mus';
    e.turno = e.quienEsMano;
  } else {
    iniciarLance(ctx, 'grande');
  }
}

function hablarDeMus(ctx: Contexto, lado: Lado, quiereMus: boolean): void {
  const { e } = ctx;
  exigirFase(e, 'mus', 'pedir mus ni cortar');
  exigirTurno(e, lado);
  emitir(ctx, { tipo: 'mus', lado, quiereMus });
  if (!quiereMus) {
    iniciarLance(ctx, 'grande');
  } else if (lado === e.quienEsMano) {
    e.turno = otroLado(lado);
  } else {
    e.fase = 'descarte';
    e.turno = e.quienEsMano;
  }
}

function descartar(ctx: Contexto, lado: Lado, cartas: readonly Carta[]): void {
  const { e, azar } = ctx;
  exigirFase(e, 'descarte', 'descartar');
  exigirTurno(e, lado);
  const mano = e.cartas[lado];
  if (cartas.length < 1 || cartas.length > CARTAS_POR_MANO) {
    throw new ErrorJugada(`Hay que descartar entre 1 y ${CARTAS_POR_MANO} cartas`);
  }
  const posiciones = cartas.map((carta) => mano.findIndex((propia) => mismaCarta(propia, carta)));
  if (posiciones.some((p) => p < 0)) throw new ErrorJugada('Solo se pueden descartar cartas propias');
  if (new Set(posiciones).size !== posiciones.length) {
    throw new ErrorJugada('No se puede descartar dos veces la misma carta');
  }

  const descartadas = posiciones.map((p) => mano[p]!);
  e.mazo.descartesRonda.push(...descartadas);
  const { robadas, rebarajadas } = robar(e.mazo, descartadas.length, azar);
  if (rebarajadas > 0) emitir(ctx, { tipo: 'rebarajado', cartas: rebarajadas });
  // Cada carta nueva ocupa el sitio de la descartada.
  posiciones.forEach((p, i) => {
    mano[p] = robadas[i]!;
  });
  emitir(ctx, { tipo: 'descarte', lado, descartadas: [...descartadas], robadas: [...robadas] });

  if (lado === e.quienEsMano) {
    e.turno = otroLado(lado);
    return;
  }
  e.rondasMus += 1;
  cerrarRondaDeDescartes(e.mazo);
  if (e.rondasMus >= rondasMusPermitidas(ctx.mods, e)) {
    iniciarLance(ctx, 'grande');
  } else {
    e.fase = 'mus';
    e.turno = e.quienEsMano;
  }
}

function iniciarLance(ctx: Contexto, lance: Lance): void {
  const { e } = ctx;
  emitir(ctx, { tipo: 'inicioLance', lance });
  if (lance !== 'pares' && lance !== 'juego') {
    abrirEnvites(ctx, lance);
    return;
  }

  // Pares y Juego: cada uno declara, empezando por la mano. Solo se envida si tienen los dos.
  const tiene = lance === 'pares' ? tienePares : tieneJuego;
  const conJugada: Lado[] = [];
  for (const lado of ordenDeHabla(e)) {
    const si = tiene(e.cartas[lado], e.reglas.modoReyes);
    emitir(ctx, { tipo: 'declaracion', lance, lado, tiene: si });
    if (si) conJugada.push(lado);
  }

  if (conJugada.length === 2) {
    abrirEnvites(ctx, lance);
  } else if (lance === 'juego' && conJugada.length === 0) {
    emitir(ctx, { tipo: 'inicioLance', lance: 'punto' });
    abrirEnvites(ctx, 'punto');
  } else {
    registrarLance(ctx, { lance, modo: conJugada.length === 1 ? 'soloUno' : 'nadie', envite: null });
    pasarAlSiguienteLance(ctx, lance);
  }
}

function abrirEnvites(ctx: Contexto, lance: Lance): void {
  const { e } = ctx;
  e.fase = 'envite';
  e.lanceActual = lance;
  e.envite = iniciarEnvite(e.quienEsMano);
  e.turno = e.quienEsMano;
}

function envidar(ctx: Contexto, lado: Lado, accion: AccionEnvite): void {
  const { e } = ctx;
  exigirFase(e, 'envite', 'envidar');
  const lance = e.lanceActual!;
  const envite = aplicarEnvite(enviteEnCurso(e), lado, accion, limitesEnvite(e.reglas));
  e.envite = envite;
  e.turno = envite.turno;
  emitir(ctx, { tipo: 'envite', lance, lado, accion });

  const resultado = envite.resultado;
  if (!resultado) return;

  const jugado: LanceJugado = { lance, modo: 'envites', envite };
  switch (resultado.tipo) {
    case 'noQuerido': {
      // El deje se apunta en el momento, y si llega a la meta el duelo acaba aquí.
      const { ganador, piedras } = resultado;
      e.marcador[ganador] += piedras;
      emitir(ctx, { tipo: 'deje', lance, lado: ganador, piedras, marcador: { ...e.marcador } });
      registrarLance(ctx, jugado);
      if (e.marcador[ganador] >= e.reglas.piedrasParaGanar) {
        terminarDuelo(ctx, ganador, 'piedras');
      } else {
        pasarAlSiguienteLance(ctx, lance);
      }
      return;
    }
    case 'ordagoQuerido': {
      // Se enseñan las cartas de ese lance y el ganador se lleva el duelo.
      registrarLance(ctx, jugado);
      const ganador = ganadorLance(lance, e.cartas, quienGanaEmpate(ctx.mods, lance, e), e.reglas.modoReyes);
      emitir(ctx, { tipo: 'ordago', lance, lanzador: resultado.lanzador, ganador, cartas: copiarCartas(e.cartas) });
      terminarDuelo(ctx, ganador, 'ordago');
      return;
    }
    default:
      registrarLance(ctx, jugado);
      pasarAlSiguienteLance(ctx, lance);
  }
}

function registrarLance(ctx: Contexto, jugado: LanceJugado): void {
  const { e } = ctx;
  e.lances.push(jugado);
  e.lanceActual = null;
  e.envite = null;
  emitir(ctx, { tipo: 'finLance', lance: jugado.lance, modo: jugado.modo, resultado: jugado.envite?.resultado ?? null });
}

function pasarAlSiguienteLance(ctx: Contexto, lance: Lance): void {
  const siguiente = SIGUIENTE_LANCE[lance];
  if (siguiente) {
    iniciarLance(ctx, siguiente);
  } else {
    hacerRecuento(ctx);
  }
}

function hacerRecuento(ctx: Contexto): void {
  const { e } = ctx;
  const { cobros, ganadores } = calcularCobros({
    lances: e.lances,
    cartas: e.cartas,
    reglas: e.reglas,
    ganaEmpate: (lance) => quienGanaEmpate(ctx.mods, lance, e),
  });
  const resultado = aplicarCobros(e.marcador, cobros, e.reglas.piedrasParaGanar);
  e.marcador = resultado.marcador;
  e.recuento = { cobros, aplicados: resultado.aplicados.length, ganadores };
  emitir(ctx, {
    tipo: 'recuento',
    cobros: structuredClone(cobros),
    aplicados: resultado.aplicados.length,
    ganadores: { ...ganadores },
    cartas: copiarCartas(e.cartas),
    marcador: { ...e.marcador },
  });

  if (resultado.ganador) {
    terminarDuelo(ctx, resultado.ganador, 'piedras');
    return;
  }
  e.fase = 'finMano';
  e.turno = null;
  emitir(ctx, { tipo: 'finMano', numeroMano: e.numeroMano, marcador: { ...e.marcador } });
}

function terminarDuelo(ctx: Contexto, ganador: Lado, motivo: MotivoFin): void {
  const { e } = ctx;
  e.fase = 'finDuelo';
  e.turno = null;
  e.ganador = ganador;
  e.motivoFin = motivo;
  emitir(ctx, { tipo: 'finDuelo', ganador, motivo, marcador: { ...e.marcador } });
}

// ——— Utilidades ———

function emitir(ctx: Contexto, evento: EventoDuelo): void {
  ctx.eventos.push(evento);
}

function exigirFase(e: EstadoDuelo, fase: Fase, que: string): void {
  if (e.fase !== fase) throw new ErrorJugada(`Ahora no se puede ${que} (fase: ${e.fase})`);
}

function exigirTurno(e: EstadoDuelo, lado: Lado): void {
  if (e.turno !== lado) throw new ErrorJugada(`No le toca a ${lado}`);
}

function enviteEnCurso(e: EstadoDuelo): EstadoEnvite {
  if (!e.envite) throw new Error('Fase de envites sin ronda de envites');
  return e.envite;
}

function ordenDeHabla(e: EstadoDuelo): [Lado, Lado] {
  return [e.quienEsMano, otroLado(e.quienEsMano)];
}

function copiarCartas(cartas: PorLado<Carta[]>): PorLado<Carta[]> {
  return { jugador: [...cartas.jugador], rival: [...cartas.rival] };
}

function aAccionEnvite(accion: Exclude<AccionDuelo, { tipo: 'mus' | 'corto' | 'descartar' | 'siguienteMano' }>): AccionEnvite {
  switch (accion.tipo) {
    case 'envido':
      return { tipo: 'envido', piedras: accion.piedras };
    case 'mas':
      return { tipo: 'mas', piedras: accion.piedras };
    case 'paso':
    case 'quiero':
    case 'noQuiero':
    case 'ordago':
      return { tipo: accion.tipo };
  }
}
