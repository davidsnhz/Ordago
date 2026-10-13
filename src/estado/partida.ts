import { CARA } from '../datos/cara';
import type { IdCompanero } from '../datos/companeros';
import { COMPANEROS } from '../datos/companeros';
import { GIRA } from '../datos/gira';
import { IA } from '../datos/ia';
import type { IdObjeto } from '../datos/objetos';
import { animoDe, RIVALES, ticsActivos, type AnimoRival, type IdRival, type PerfilRival } from '../datos/rivales';
import { Azar, estadoDesdeSemilla, type EstadoAzar } from '../nucleo/azar';
import { aplicarCambiosDeCara, cambiosDeCara, type CambioCara } from '../nucleo/cara';
import { mismaCarta, rango, type Carta } from '../nucleo/carta';
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
 * con semilla y la Cara del jugador. En la gira lleva además el compañero, los amuletos y los
 * efectos de lo que se usa de la bolsa. Todo es JSON, así que se guarda tal cual.
 */

export const VERSION_PARTIDA = 3;

/** Lo que trae el jugador de la gira y los efectos de lo que va usando en el duelo. */
export interface ExtrasPartida {
  companero: IdCompanero | null;
  /** Señas del compañero ya usadas en este duelo. */
  senasUsadas: number;
  /** Amuletos y objetos raros que lleva (pasivos). */
  amuletos: IdObjeto[];
  /** Fiesta patronal: los dos empezaron con piedras. */
  fiesta: boolean;
  /** Chato de vino: en esta mano el rival canta su mano (0 si no). */
  cartasVistasMano: number;
  /** Darle conversación: en esta mano el rival no puede tirar órdago (0 si no). */
  sinOrdagoMano: number;
  /** La Medalla de la Virgen ya ha librado un farol en este duelo. */
  medallaUsada: boolean;
  /** Los Apuntes de Chema: el próximo tic se explica. */
  explicarTic: boolean;
  apuntesUsados: boolean;
  /** El Lazarillo te ha enseñado esta carta del rival en esta mano. */
  cartaEnsenada: { mano: number; carta: Carta } | null;
  /** La Recaudadora: si ganas el próximo órdago, cobras el triple. */
  triplicaOrdago: boolean;
}

/** Un tic que se vio y luego se vieron las cartas: va a la Libreta. */
export interface TicObservado {
  id: string;
  verdadero: boolean;
}

/** Lo que cuenta para los reales, la plaza y la Libreta al acabar el duelo. */
export interface Estadisticas {
  /** Envites queridos que ganaste. */
  envitesGanados: number;
  /** Faroles tuyos que el rival no quiso. */
  farolesCreidos: number;
  ordagosGanados: number;
  /** Órdagos ganados con la seña de la Recaudadora. */
  ordagosTriplicados: number;
  /** Lances de Grande que se llevó el rival (para la apuesta del forastero). */
  grandesPerdidas: number;
  observaciones: TicObservado[];
}

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
  extras: ExtrasPartida;
  estadisticas: Estadisticas;
  /** Tics de la mano en curso, hasta que se vean las cartas. */
  ticsDeLaMano: TicObservado[];
}

/** Lo que se acaba de usar de la bolsa, para contarlo en el acta. */
export type EfectoUsado =
  | { tipo: 'orujo' | 'chato' | 'conversacion' | 'apuntes' | 'recaudadora' }
  | { tipo: 'lazarillo'; carta: Carta };

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
  /** Rubén o Chema cambian de ánimo con el marcador. */
  animo: { antes: AnimoRival; despues: AnimoRival } | null;
  /** Algo de la bolsa que se acaba de usar. */
  efecto: EfectoUsado | null;
  /** La Medalla de la Virgen acaba de librar un farol pillado. */
  medalla: boolean;
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
  animo: null,
  efecto: null,
  medalla: false,
});

export function extrasVacios(): ExtrasPartida {
  return {
    companero: null,
    senasUsadas: 0,
    amuletos: [],
    fiesta: false,
    cartasVistasMano: 0,
    sinOrdagoMano: 0,
    medallaUsada: false,
    explicarTic: false,
    apuntesUsados: false,
    cartaEnsenada: null,
    triplicaOrdago: false,
  };
}

export function estadisticasVacias(): Estadisticas {
  return { envitesGanados: 0, farolesCreidos: 0, ordagosGanados: 0, ordagosTriplicados: 0, grandesPerdidas: 0, observaciones: [] };
}

/** Lo que el jugador trae a un duelo de la gira. */
export interface ConQueJuegas {
  companero?: IdCompanero | null;
  amuletos?: readonly IdObjeto[];
  /** Fiesta patronal: los dos empiezan con piedras. */
  fiesta?: boolean;
}

export function nuevaPartida(
  semilla: string,
  rivalId: IdRival = 'ruperto',
  cara: number = CARA.inicial,
  trae: ConQueJuegas = {},
): ResultadoPartida {
  const perfil = RIVALES[rivalId];
  const extras: ExtrasPartida = {
    ...extrasVacios(),
    companero: trae.companero ?? null,
    amuletos: [...(trae.amuletos ?? [])],
    fiesta: trae.fiesta ?? false,
  };
  const modificadores: Modificador[] = extras.fiesta ? [{ id: 'fiesta', piedrasIniciales: () => GIRA.plaza.fiesta }] : [];
  // La Casa: Don Rodrigo es mano en el primer reparto.
  const { estado, eventos } = crearDuelo({ semilla, quienEsMano: perfil.casa ? 'rival' : undefined, modificadores });
  const partida: Partida = {
    version: VERSION_PARTIDA,
    semilla,
    rivalId,
    duelo: estado,
    memoria: memoriaInicial(),
    azarIA: estadoDesdeSemilla(`${semilla}/ia`),
    caraJugador: cara,
    expuesto: cara <= CARA.minimo,
    extras,
    estadisticas: estadisticasVacias(),
    ticsDeLaMano: [],
  };
  return procesar(partida, eventos, new Azar(partida.azarIA), {});
}

export function leTocaAlRival(partida: Partida): boolean {
  return partida.duelo.fase !== 'finDuelo' && partida.duelo.turno === 'rival';
}

export function jugarJugador(partida: Partida, accion: AccionDuelo): ResultadoPartida {
  if ('lado' in accion && accion.lado !== 'jugador') throw new ErrorJugada('El jugador solo puede jugar por sí mismo');
  const azar = new Azar(partida.azarIA);
  const { estado, eventos } = aplicarAccion(partida.duelo, accion, modificadoresDe(partida, azar.siguiente()));
  return procesar({ ...partida, duelo: estado }, eventos, azar, { marcadorAntes: partida.duelo.marcador });
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
  const sinOrdago = partida.extras.sinOrdagoMano === duelo.numeroMano;
  const decision = decidirRival(vista, { perfil, memoria: partida.memoria, caraJugador: partida.caraJugador, senal, sinOrdago }, azar);

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

  const { estado, eventos } = aplicarAccion(duelo, decision.accion, modificadoresDe(partida, tiradaTrato));
  return procesar({ ...partida, duelo: estado }, eventos, azar, {
    decision,
    ticsPrevios: ticsAlDecidir,
    seTeNota: senal === 'seNota',
    marcadorAntes: duelo.marcador,
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

// ——— La bolsa: objetos y la seña del compañero ———

const manoEnCurso = (duelo: EstadoDuelo) => duelo.fase !== 'finMano' && duelo.fase !== 'finDuelo';

/** Si ahora se puede usar este objeto (los amuletos pasivos no se usan; los Apuntes, sí). */
export function puedeUsarObjeto(partida: Partida, id: IdObjeto): boolean {
  const { duelo, extras } = partida;
  if (duelo.fase === 'finDuelo') return false;
  switch (id) {
    case 'orujo':
      return partida.caraJugador < CARA.maximo;
    case 'chato':
      return manoEnCurso(duelo) && extras.cartasVistasMano !== duelo.numeroMano;
    case 'conversacion':
      return manoEnCurso(duelo) && extras.sinOrdagoMano !== duelo.numeroMano;
    case 'apuntesChema':
      return extras.amuletos.includes('apuntesChema') && !extras.apuntesUsados && !extras.explicarTic;
    default:
      return false;
  }
}

/** Usa un objeto de la bolsa. Quien lo saca de la bolsa es la gira; aquí solo se aplica su efecto. */
export function usarObjeto(partida: Partida, id: IdObjeto): ResultadoPartida {
  if (!puedeUsarObjeto(partida, id)) throw new ErrorJugada(`Ahora no se puede usar ${id}`);
  const { duelo, extras } = partida;
  const novedades = sinNovedades();
  switch (id) {
    case 'orujo': {
      const cambio: CambioCara = { motivo: 'orujo', delta: CARA.orujo };
      const caraJugador = aplicarCambiosDeCara(partida.caraJugador, [cambio]);
      return { partida: { ...partida, caraJugador }, novedades: { ...novedades, cambiosCara: [cambio], efecto: { tipo: 'orujo' } } };
    }
    case 'chato':
      return {
        partida: { ...partida, extras: { ...extras, cartasVistasMano: duelo.numeroMano } },
        novedades: { ...novedades, efecto: { tipo: 'chato' } },
      };
    case 'conversacion':
      return {
        partida: { ...partida, extras: { ...extras, sinOrdagoMano: duelo.numeroMano } },
        novedades: { ...novedades, efecto: { tipo: 'conversacion' } },
      };
    default:
      return {
        partida: { ...partida, extras: { ...extras, explicarTic: true } },
        novedades: { ...novedades, efecto: { tipo: 'apuntes' } },
      };
  }
}

export function senasQueQuedan(partida: Partida): number {
  const { companero, senasUsadas } = partida.extras;
  return companero ? Math.max(0, COMPANEROS[companero].senas - senasUsadas) : 0;
}

export function puedeUsarSena(partida: Partida): boolean {
  const { companero, triplicaOrdago } = partida.extras;
  if (!companero || senasQueQuedan(partida) <= 0) return false;
  if (companero === 'lazarillo') return manoEnCurso(partida.duelo);
  return partida.duelo.fase !== 'finDuelo' && !triplicaOrdago;
}

/**
 * La seña del compañero. El Lazarillo te enseña una carta del rival (al azar, de las que lleva
 * ahora); la Recaudadora apunta que el próximo órdago que ganes cobra el triple.
 */
export function usarSena(partida: Partida): ResultadoPartida {
  if (!puedeUsarSena(partida)) throw new ErrorJugada('Ahora no se puede usar la seña');
  const { extras, duelo } = partida;
  const senasUsadas = extras.senasUsadas + 1;
  if (extras.companero === 'lazarillo') {
    const azar = new Azar(partida.azarIA);
    const carta = azar.elegir(duelo.cartas.rival);
    return {
      partida: { ...partida, azarIA: azar.estado(), extras: { ...extras, senasUsadas, cartaEnsenada: { mano: duelo.numeroMano, carta } } },
      novedades: { ...sinNovedades(), efecto: { tipo: 'lazarillo', carta } },
    };
  }
  return {
    partida: { ...partida, extras: { ...extras, senasUsadas, triplicaOrdago: true } },
    novedades: { ...sinNovedades(), efecto: { tipo: 'recaudadora' } },
  };
}

/** Cartas del rival que ves ahora: todas con el Chato, o la que te enseñó el Lazarillo si aún la lleva. */
export function cartasDelRivalALaVista(partida: Partida): Carta[] {
  const { duelo, extras } = partida;
  if (extras.cartasVistasMano === duelo.numeroMano) return [...duelo.cartas.rival];
  const ensenada = extras.cartaEnsenada;
  if (ensenada && ensenada.mano === duelo.numeroMano && duelo.cartas.rival.some((c) => mismaCarta(c, ensenada.carta))) {
    return [ensenada.carta];
  }
  return [];
}

// ——— Reglas especiales de los rivales ———

/** Modificadores del motor: la Boina, si la llevas, y las reglas especiales y la memoria del rival. */
function modificadoresDe(partida: Partida, tiradaTrato: number): Modificador[] {
  const perfil = RIVALES[partida.rivalId];
  const mods: Modificador[] = [];
  // La Boina va antes que la Casa: en la Grande de Don Rodrigo manda su casa.
  if (partida.extras.amuletos.includes('boina')) mods.push({ id: 'boina', ganaEmpate: () => 'jugador' });
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

const diferenciaDelRival = (marcador: EstadoDuelo['marcador']) => marcador.rival - marcador.jugador;

/** Envites ganados, faroles creídos, órdagos y Grandes perdidas: lo que cuenta al acabar el duelo. */
function contarEstadisticas(
  previas: Estadisticas,
  eventos: readonly EventoDuelo[],
  duelo: EstadoDuelo,
  cambiosCara: readonly CambioCara[],
  extras: ExtrasPartida,
): { estadisticas: Estadisticas; extras: ExtrasPartida } {
  const e: Estadisticas = { ...previas, observaciones: [...previas.observaciones] };
  let x = extras;
  e.farolesCreidos += cambiosCara.filter((c) => c.motivo === 'farolCreido').length;
  for (const evento of eventos) {
    if (evento.tipo === 'recuento') {
      for (const l of duelo.lances) {
        if (l.envite?.resultado?.tipo === 'querido' && !l.trato && evento.ganadores[l.lance] === 'jugador') e.envitesGanados++;
      }
      if (evento.ganadores.grande === 'rival') e.grandesPerdidas++;
    }
    if (evento.tipo === 'ordago') {
      if (evento.ganador === 'jugador') e.ordagosGanados++;
      if (x.triplicaOrdago) {
        if (evento.ganador === 'jugador') e.ordagosTriplicados++;
        x = { ...x, triplicaOrdago: false };
      }
    }
  }
  return { estadisticas: e, extras: x };
}

function procesar(
  partida: Partida,
  eventos: EventoDuelo[],
  azar: Azar,
  extra: { decision?: DecisionRival; ticsPrevios?: TicDisparado[]; seTeNota?: boolean; marcadorAntes?: EstadoDuelo['marcador'] },
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

  // La Medalla de la Virgen libra el primer farol pillado del duelo.
  let cambiosCara = cambiosDeCara(todos, duelo);
  let extras = partida.extras;
  let medalla = false;
  const pillado = cambiosCara.findIndex((c) => c.motivo === 'farolPillado');
  if (pillado >= 0 && extras.amuletos.includes('medalla') && !extras.medallaUsada) {
    cambiosCara = cambiosCara.filter((_, i) => i !== pillado);
    extras = { ...extras, medallaUsada: true };
    medalla = true;
  }
  const caraJugador = aplicarCambiosDeCara(partida.caraJugador, cambiosCara);

  const contadas = contarEstadisticas(partida.estadisticas, todos, duelo, cambiosCara, extras);
  extras = contadas.extras;
  const estadisticas = contadas.estadisticas;

  // Los tics de la mano esperan a que se vean las cartas para ir a la Libreta.
  let ticsDeLaMano = todos.some((e) => e.tipo === 'reparto') ? [] : [...partida.ticsDeLaMano];
  ticsDeLaMano.push(...tics.map((t) => ({ id: t.id, verdadero: t.verdadero })));
  if (todos.some((e) => e.tipo === 'recuento' || e.tipo === 'ordago')) {
    estadisticas.observaciones.push(...ticsDeLaMano);
    ticsDeLaMano = [];
  }

  // Rubén y Chema se vienen arriba (o se arrugan) según el marcador.
  const antes = animoDe(perfil, diferenciaDelRival(extra.marcadorAntes ?? duelo.marcador));
  const despues = animoDe(perfil, diferenciaDelRival(duelo.marcador));
  const animo = antes !== despues && duelo.fase !== 'finDuelo' ? { antes, despues } : null;

  return {
    partida: {
      ...partida,
      duelo,
      memoria,
      azarIA: azar.estado(),
      caraJugador,
      expuesto: partida.expuesto || caraJugador <= CARA.minimo,
      extras,
      estadisticas,
      ticsDeLaMano,
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
      animo,
      medalla,
    },
  };
}
