import { CARA } from '../datos/cara';
import { IA } from '../datos/ia';
import { RIVALES, ticsActivos, type IdRival, type PerfilRival } from '../datos/rivales';
import { Azar, estadoDesdeSemilla, type EstadoAzar } from '../nucleo/azar';
import { aplicarCambiosDeCara, cambiosDeCara, type CambioCara } from '../nucleo/cara';
import { rango, type Carta } from '../nucleo/carta';
import { ErrorJugada } from '../nucleo/comun';
import { aplicarAccion, cambiarCarta, crearDuelo, type AccionDuelo, type EstadoDuelo } from '../nucleo/duelo';
import type { EventoDuelo } from '../nucleo/eventos';
import { calcularFuerza } from '../nucleo/ia/fuerza';
import { memoriaInicial, recordar, type MemoriaRival } from '../nucleo/ia/memoria';
import { decidirRival, vistaDe, type DecisionRival } from '../nucleo/ia/rival';
import { seTeNota, sortearTics, type ContextoTic, type MomentoTic, type TicDisparado } from '../nucleo/ia/tics';
import { LANCES } from '../nucleo/lances';
import { tieneJuego, tienePares } from '../nucleo/mano';
import type { Modificador } from '../nucleo/modificadores';
import type { Cobro, CobrosDeLaMano } from '../nucleo/recuento';

/**
 * Un duelo contra un rival con IA: el estado del motor, lo que el rival recuerda, su azar
 * con semilla y la Cara del jugador. Todo es JSON, así que se guarda tal cual.
 */

export const VERSION_PARTIDA = 2;

export interface Partida {
  version: typeof VERSION_PARTIDA;
  semilla: string;
  rivalId: IdRival;
  duelo: EstadoDuelo;
  memoria: MemoriaRival;
  azarIA: EstadoAzar;
  /** Cara del jugador (0–100). Pasa de un duelo al siguiente. */
  caraJugador: number;
  /** Cara a 0: durante este duelo el rival te ve el tic. */
  expuesto: boolean;
}

/** Lo que ha pasado con una acción, para que la interfaz lo enseñe. */
export interface Novedades {
  eventos: EventoDuelo[];
  tics: TicDisparado[];
  /** Decisión del rival, si la acción era suya (modo de depuración). */
  decision: DecisionRival | null;
  seEnfada: boolean;
  imponePenitencia: boolean;
  cambiosCara: CambioCara[];
  /** Cara a 0: al jugador se le ha notado el tic. */
  seTeNota: boolean;
  /** Doña Ignacia se ha dado cuenta de que la mirabas. */
  seOfende: boolean;
}

export interface ResultadoPartida {
  partida: Partida;
  novedades: Novedades;
}

const sinNovedades = (): Novedades => ({
  eventos: [],
  tics: [],
  decision: null,
  seEnfada: false,
  imponePenitencia: false,
  cambiosCara: [],
  seTeNota: false,
  seOfende: false,
});

export function nuevaPartida(semilla: string, rivalId: IdRival = 'ruperto', cara: number = CARA.inicial): ResultadoPartida {
  const perfil = RIVALES[rivalId];
  // La Casa: Don Rodrigo es mano en el primer reparto.
  const { estado, eventos } = crearDuelo({ semilla, quienEsMano: perfil.casa ? 'rival' : undefined });
  const partida: Partida = {
    version: VERSION_PARTIDA,
    semilla,
    rivalId,
    duelo: estado,
    memoria: memoriaInicial(),
    azarIA: estadoDesdeSemilla(`${semilla}/ia`),
    caraJugador: cara,
    expuesto: cara <= CARA.minimo,
  };
  return procesar(partida, eventos, new Azar(partida.azarIA), {});
}

export function leTocaAlRival(partida: Partida): boolean {
  return partida.duelo.fase !== 'finDuelo' && partida.duelo.turno === 'rival';
}

export function jugarJugador(partida: Partida, accion: AccionDuelo): ResultadoPartida {
  if ('lado' in accion && accion.lado !== 'jugador') throw new ErrorJugada('El jugador solo puede jugar por sí mismo');
  const azar = new Azar(partida.azarIA);
  const { estado, eventos } = aplicarAccion(partida.duelo, accion, modificadoresDelRival(partida, azar.siguiente()));
  return procesar({ ...partida, duelo: estado }, eventos, azar, {});
}

/** El rival decide y juega su acción. */
export function jugarRival(partida: Partida): ResultadoPartida {
  const perfil = RIVALES[partida.rivalId];
  const { duelo } = partida;
  const azar = new Azar(partida.azarIA);
  const tiradaTrato = azar.siguiente();

  // Cara a 0: el rival te ve el tic en el lance que se juega.
  let senal: 'seNota' | 'noSeNota' | null = null;
  if (partida.expuesto && duelo.fase === 'envite' && duelo.lanceActual) {
    const fuerzaJugador = calcularFuerza(duelo.cartas.jugador, duelo.quienEsMano === 'jugador', duelo.reglas.modoReyes);
    senal = seTeNota(fuerzaJugador[duelo.lanceActual], azar).seNota ? 'seNota' : 'noSeNota';
  }

  const vista = vistaDe(duelo, 'rival');
  const decision = decidirRival(vista, { perfil, memoria: partida.memoria, caraJugador: partida.caraJugador, senal }, azar);

  // Los tics pueden escaparse justo al decidir un envite.
  const ticsAlDecidir =
    decision.tipo === 'envite' && vista.envite
      ? sortearTicsDelRival(
          partida,
          { tipo: 'envite', lance: decision.lance },
          duelo.cartas.rival,
          {
            abre: !vista.envite.envidador,
            farol: decision.envite.farol && decision.accion.tipo !== 'paso',
            responde: vista.envite.envidador === 'jugador',
          },
          azar,
        )
      : [];

  const { estado, eventos } = aplicarAccion(duelo, decision.accion, modificadoresDelRival(partida, tiradaTrato));
  return procesar({ ...partida, duelo: estado }, eventos, azar, {
    decision,
    ticsPrevios: ticsAlDecidir,
    seTeNota: senal === 'seNota',
  });
}

/**
 * Mirar al rival (pulsación larga en el retrato). Doña Ignacia, si la miras demasiado, puede
 * darse cuenta (según su Ojo) y ofenderse: no hace tics en lo que queda de mano ni en la siguiente.
 */
export function mirarAlRival(partida: Partida, segundos: number): ResultadoPartida {
  const perfil = RIVALES[partida.rivalId];
  const { duelo } = partida;
  if (!perfil.alSerMirado || segundos < IA.mirarDemasiado || duelo.fase === 'finDuelo') {
    return { partida, novedades: sinNovedades() };
  }
  const azar = new Azar(partida.azarIA);
  const seDaCuenta = azar.probabilidad(perfil.parametros.ojo / 10);
  const memoria = seDaCuenta
    ? { ...partida.memoria, ofendidaHastaMano: duelo.numeroMano + perfil.alSerMirado.manos }
    : partida.memoria;
  return { partida: { ...partida, memoria, azarIA: azar.estado() }, novedades: { ...sinNovedades(), seOfende: seDaCuenta } };
}

/** Para probar (modo de depuración): cambia la Cara a mano. */
export function ajustarCara(partida: Partida, delta: number): Partida {
  const caraJugador = Math.max(CARA.minimo, Math.min(CARA.maximo, partida.caraJugador + delta));
  return { ...partida, caraJugador, expuesto: partida.expuesto || caraJugador <= CARA.minimo };
}

// ——— Reglas especiales de los rivales ———

/** Modificadores del motor que salen de las reglas especiales del rival y de su memoria. */
function modificadoresDelRival(partida: Partida, tiradaTrato: number): Modificador[] {
  const perfil = RIVALES[partida.rivalId];
  const mods: Modificador[] = [];
  const { casa, penitencia } = perfil;
  if (casa) {
    mods.push({ id: 'casa', ganaEmpate: (lado, lance) => (casa.lances.includes(lance) ? 'rival' : lado) });
  }
  if (penitencia && partida.memoria.penitencia) {
    mods.push({ id: 'penitencia', ajustarCobros: (cobros, estado, ganadores) => cobrarPenitencia(cobros, estado, ganadores, penitencia.piedras) });
  }
  if (perfil.trato && !partida.memoria.tratoUsado) {
    mods.push({ id: 'trato', ofreceTrato: (estado) => (quiereTrato(estado, tiradaTrato) ? 'rival' : null) });
  }
  return mods;
}

/** Penitencia: en el primer lance de esta mano en que envidaste, si lo gana él, cobra de más. */
function cobrarPenitencia(
  cobros: Cobro[],
  estado: Readonly<EstadoDuelo>,
  ganadores: CobrosDeLaMano['ganadores'],
  piedras: number,
): Cobro[] {
  const envitesTuyos = new Set(['envido', 'mas', 'ordago']);
  const lance = estado.lances.find((l) => l.envite?.historial.some((p) => p.lado === 'jugador' && envitesTuyos.has(p.accion.tipo)))?.lance;
  if (!lance || ganadores[lance] !== 'rival') return cobros;
  const orden = (c: Cobro) => LANCES.indexOf(c.lance);
  const despues = cobros.findIndex((c) => orden(c) > LANCES.indexOf(lance));
  const extra: Cobro = { lance, lado: 'rival', piedras, concepto: 'penitencia' };
  return despues < 0 ? [...cobros, extra] : [...cobros.slice(0, despues), extra, ...cobros.slice(despues)];
}

/**
 * El trato de Aurelio: con sus cartas calcula lo que espera ganar de los envites queridos.
 * Si espera menos de la mitad, lo propone; si espera más, a veces también, de farol.
 */
function quiereTrato(estado: Readonly<EstadoDuelo>, tirada: number): boolean {
  const queridos = estado.lances.filter((l) => l.envite?.resultado?.tipo === 'querido');
  if (queridos.length === 0) return false;
  const fuerza = calcularFuerza(estado.cartas.rival, estado.quienEsMano === 'rival', estado.reglas.modoReyes);
  let total = 0;
  let esperado = 0;
  for (const l of queridos) {
    const resultado = l.envite!.resultado;
    if (resultado?.tipo !== 'querido') continue;
    total += resultado.piedras;
    esperado += fuerza[l.lance] * resultado.piedras;
  }
  return esperado < total / 2 || tirada < IA.trato.farol;
}

/**
 * Cartas de la casa: si su mejor lance no llega a la fuerza indicada, Don Rodrigo cambia su
 * carta más baja por un rey del mazo (o la carta más alta que quede).
 */
function elegirCambio(duelo: EstadoDuelo, fuerzaMaxima: number): { sale: Carta; entra: Carta } | null {
  const modo = duelo.reglas.modoReyes;
  const cartas = duelo.cartas.rival;
  const fuerza = calcularFuerza(cartas, duelo.quienEsMano === 'rival', modo);
  const mejor = Math.max(
    fuerza.grande,
    fuerza.chica,
    tienePares(cartas, modo) ? fuerza.pares : 0,
    tieneJuego(cartas, modo) ? fuerza.juego : fuerza.punto,
  );
  if (mejor >= fuerzaMaxima || duelo.mazo.cartas.length === 0) return null;
  const porRango = (a: Carta, b: Carta) => rango(a, modo) - rango(b, modo);
  const sale = [...cartas].sort(porRango)[0]!;
  const entra = [...duelo.mazo.cartas].sort(porRango).at(-1)!;
  return rango(entra, modo) > rango(sale, modo) ? { sale, entra } : null;
}

// ——— Después de cada acción ———

function sortearTicsDelRival(
  partida: Partida,
  momento: MomentoTic,
  cartas: readonly Carta[],
  decision: ContextoTic['decision'],
  azar: Azar,
): TicDisparado[] {
  const perfil = RIVALES[partida.rivalId];
  const { duelo, memoria } = partida;
  if (memoria.ofendidaHastaMano >= duelo.numeroMano) return [];
  const tics = ticsActivos(perfil, Math.max(duelo.marcador.jugador, duelo.marcador.rival));
  return sortearTics(
    tics,
    { cartas, modo: duelo.reglas.modoReyes, momento, decision, caraJugador: partida.caraJugador, faroleo: perfil.parametros.faroleo },
    azar,
  );
}

function procesar(
  partida: Partida,
  eventos: EventoDuelo[],
  azar: Azar,
  extra: { decision?: DecisionRival; ticsPrevios?: TicDisparado[]; seTeNota?: boolean },
): ResultadoPartida {
  const perfil: PerfilRival = RIVALES[partida.rivalId];
  const modo = partida.duelo.reglas.modoReyes;
  let duelo = partida.duelo;
  const todos = [...eventos];

  // Cartas de la casa: al empezar la Grande, una vez por duelo, si su mano es floja.
  const empiezaLaGrande = eventos.some((e) => e.tipo === 'inicioLance' && e.lance === 'grande');
  if (perfil.cartasDeLaCasa && !partida.memoria.cambioUsado && empiezaLaGrande && duelo.fase !== 'finDuelo') {
    const cambio = elegirCambio(duelo, perfil.cartasDeLaCasa.fuerzaMaxima);
    if (cambio) {
      const r = cambiarCarta(duelo, 'rival', cambio.sale, cambio.entra);
      duelo = r.estado;
      todos.push(...r.eventos);
    }
  }

  const conDuelo = { ...partida, duelo };
  const tics = [...(extra.ticsPrevios ?? [])];
  for (const evento of todos) {
    if (evento.tipo === 'reparto') {
      tics.push(...sortearTicsDelRival(conDuelo, { tipo: 'cartas' }, evento.cartas.rival, undefined, azar));
    } else if (evento.tipo === 'descarte' && evento.lado === 'rival') {
      tics.push(...sortearTicsDelRival(conDuelo, { tipo: 'cartas' }, duelo.cartas.rival, undefined, azar));
    } else if (evento.tipo === 'declaracion' && evento.lado === 'rival') {
      tics.push(...sortearTicsDelRival(conDuelo, { tipo: 'declaracion', lance: evento.lance }, duelo.cartas.rival, undefined, azar));
    }
  }

  const { memoria, seEnfada, imponePenitencia } = recordar(partida.memoria, todos, perfil, modo);
  const cambiosCara = cambiosDeCara(todos, duelo);
  const caraJugador = aplicarCambiosDeCara(partida.caraJugador, cambiosCara);

  return {
    partida: {
      ...partida,
      duelo,
      memoria,
      azarIA: azar.estado(),
      caraJugador,
      expuesto: partida.expuesto || caraJugador <= CARA.minimo,
    },
    novedades: {
      ...sinNovedades(),
      eventos: todos,
      tics,
      decision: extra.decision ?? null,
      seEnfada,
      imponePenitencia,
      cambiosCara,
      seTeNota: extra.seTeNota ?? false,
    },
  };
}
