import { CARA } from '../datos/cara';
import { COMPANEROS, COMPANEROS_INICIALES, type IdCompanero } from '../datos/companeros';
import { ARENAS, GIRA, NIVEL_JEFE } from '../datos/gira';
import { CATALOGO_TABERNA, esDeUnUso, OBJETOS, type IdObjeto } from '../datos/objetos';
import type { IdRival } from '../datos/rivales';
import { Azar, estadoDesdeSemilla, type EstadoAzar } from '../nucleo/azar';
import { ErrorJugada, type PorLado } from '../nucleo/comun';
import { almacenDelNavegador, borrarClave, cargarConVersion, esPartida, guardarConVersion, type Almacen } from './guardado';
import { apuntar, type CambioNota, type Libreta } from './libreta';
import { nuevaPartida, type Partida, type ResultadoPartida } from './partida';

/**
 * La gira: la partida entera, de arena en arena (docs/gira.md). Lleva la Honra, los reales, la
 * Cara, el compañero y la bolsa, y pasa de un momento a otro: elegir compañero, el mapa, el
 * duelo, lo que se cobra, las paradas (taberna, plaza, era), el premio del jefe y el final.
 * Todo es puro y JSON: cada función devuelve una gira nueva y la interfaz solo la enseña.
 */

export const VERSION_GIRA = 1;
const CLAVE = 'ordago.gira';

export interface Bolsa {
  /** Bebidas y jugarretas (2 huecos). */
  unUso: IdObjeto[];
  /** Amuletos y objetos raros (2 huecos). */
  amuletos: IdObjeto[];
}

export type ResultadoNivel = 'ganado' | 'perdido';

export type ConceptoReales = 'duelo' | 'consolacion' | 'envites' | 'faroles' | 'ordagos' | 'triple' | 'recaudadora' | 'forastero';

export interface LineaReales {
  concepto: ConceptoReales;
  /** Cuántas veces (envites, faroles, órdagos), si hace al caso. */
  veces?: number;
  reales: number;
}

export interface ResumenDuelo {
  rival: IdRival;
  /** Nivel del duelo (0 a 3). */
  nivel: number;
  ganado: boolean;
  marcador: PorLado<number>;
  lineas: LineaReales[];
  total: number;
  reales: { antes: number; despues: number };
  honra: { antes: number; despues: number };
  cara: number;
  /** La apuesta del forastero, si la había. */
  forastero: 'ganada' | 'perdida' | null;
  /** Notas de la Libreta que han subido. */
  libreta: CambioNota[];
  /** Lo que viene: elegir parada, el premio del jefe o el final (sin Honra). */
  siguiente: 'paradas' | 'premio' | 'fin';
}

export type CosaEnVenta = { tipo: 'objeto'; id: IdObjeto; vendida: boolean } | { tipo: 'companero'; id: IdCompanero; vendida: boolean };

export interface OfertaTaberna {
  cosas: CosaEnVenta[];
  /** «Otra ronda» pedidas en esta visita (cada una cuesta uno más). */
  rondas: number;
}

export type EventoPlaza =
  | { tipo: 'forastero' }
  | { tipo: 'fiesta' }
  /** El amuleto es falso o no se sabe hasta comprarlo. */
  | { tipo: 'timador'; objeto: IdObjeto; precio: number; falso: boolean }
  | { tipo: 'monja' };

export type DesenlacePlaza =
  | 'apuestaAceptada'
  | 'apuestaRechazada'
  | 'fiesta'
  | 'timadorFalso'
  | 'timadorBueno'
  | 'timadorRechazado'
  | 'monja';

export type Momento =
  | { tipo: 'companero' }
  | { tipo: 'mapa' }
  | { tipo: 'duelo'; partida: Partida }
  | { tipo: 'resultado'; resumen: ResumenDuelo }
  | { tipo: 'taberna'; oferta: OfertaTaberna }
  | { tipo: 'plaza'; evento: EventoPlaza; desenlace: DesenlacePlaza | null }
  | { tipo: 'era'; antes: number; despues: number }
  | { tipo: 'premio' }
  | { tipo: 'fin'; victoria: boolean };

export interface Gira {
  semilla: string;
  azar: EstadoAzar;
  /** Arena en curso (0 = la facultad) y nivel dentro de ella (0 a 3; el 3 es el jefe). */
  arena: number;
  nivel: number;
  /** Veces que se ha repetido el duelo en curso (contra el jefe), para la semilla. */
  intento: number;
  /** Cómo fue cada nivel de la arena en curso, para el mapa. */
  resultados: (ResultadoNivel | null)[];
  honra: number;
  reales: number;
  cara: number;
  companero: IdCompanero | null;
  bolsa: Bolsa;
  /** La monja solo sale una vez por gira. */
  monjaUsada: boolean;
  /** Lo que la plaza deja para el siguiente duelo. */
  pendiente: { forastero: boolean; fiesta: boolean };
  /** Para el resumen del final. */
  cuenta: { duelos: number; ganados: number; reales: number };
  momento: Momento;
}

export type Parada = 'taberna' | 'plaza' | 'era';
export type Premio = 'companero' | 'raro' | 'honra';

// ——— Empezar ———

export function nuevaGira(semilla: string): Gira {
  return {
    semilla,
    azar: estadoDesdeSemilla(`${semilla}/gira`),
    arena: 0,
    nivel: 0,
    intento: 0,
    resultados: [null, null, null, null],
    honra: GIRA.honraInicial,
    reales: GIRA.realesIniciales,
    cara: CARA.inicial,
    companero: null,
    bolsa: { unUso: [], amuletos: [] },
    monjaUsada: false,
    pendiente: { forastero: false, fiesta: false },
    cuenta: { duelos: 0, ganados: 0, reales: 0 },
    momento: { tipo: 'companero' },
  };
}

export function elegirCompanero(gira: Gira, id: IdCompanero): Gira {
  exigir(gira, 'companero');
  if (!COMPANEROS_INICIALES.includes(id)) throw new ErrorJugada('Ese compañero no está desbloqueado');
  return { ...gira, companero: id, momento: { tipo: 'mapa' } };
}

// ——— Arenas y niveles ———

export function nivelesDe(arena: number): readonly IdRival[] {
  const niveles = ARENAS[arena]?.niveles;
  if (!niveles) throw new Error(`La arena ${arena} todavía no está hecha`);
  return niveles;
}

export function rivalActual(gira: Gira): IdRival {
  return nivelesDe(gira.arena)[gira.nivel]!;
}

export const esJefe = (nivel: number) => nivel === NIVEL_JEFE;

// ——— El duelo ———

/** Empieza el duelo del nivel en curso. Devuelve también el resultado del reparto, para la mesa. */
export function empezarDuelo(gira: Gira): { gira: Gira; inicio: ResultadoPartida } {
  exigir(gira, 'mapa');
  const semilla = `${gira.semilla}/a${gira.arena}n${gira.nivel}i${gira.intento}`;
  const inicio = nuevaPartida(semilla, rivalActual(gira), gira.cara, {
    companero: gira.companero,
    amuletos: gira.bolsa.amuletos,
    fiesta: gira.pendiente.fiesta,
  });
  return {
    gira: { ...gira, pendiente: { ...gira.pendiente, fiesta: false }, momento: { tipo: 'duelo', partida: inicio.partida } },
    inicio,
  };
}

/** Guarda cómo va el duelo (al final de cada mano). */
export function conPartida(gira: Gira, partida: Partida): Gira {
  exigir(gira, 'duelo');
  return { ...gira, momento: { tipo: 'duelo', partida } };
}

/** Saca de la bolsa una bebida o jugarreta que se acaba de usar en la mesa. */
export function gastarDeLaBolsa(gira: Gira, id: IdObjeto): Gira {
  if (!esDeUnUso(id)) return gira;
  const indice = gira.bolsa.unUso.indexOf(id);
  if (indice < 0) throw new ErrorJugada(`No llevas ${id}`);
  return { ...gira, bolsa: { ...gira.bolsa, unUso: gira.bolsa.unUso.filter((_, i) => i !== indice) } };
}

/** Lo que se cobra por un duelo. */
export function cuentaDeReales(gira: Gira, partida: Partida, ganado: boolean): { lineas: LineaReales[]; forastero: ResumenDuelo['forastero'] } {
  const e = partida.estadisticas;
  const lineas: LineaReales[] = [];
  lineas.push(ganado ? { concepto: 'duelo', reales: GIRA.realesPorNivel[gira.nivel]! } : { concepto: 'consolacion', reales: GIRA.consolacion });
  if (e.envitesGanados > 0) lineas.push({ concepto: 'envites', veces: e.envitesGanados, reales: e.envitesGanados * GIRA.porEnvite });
  if (e.farolesCreidos > 0) lineas.push({ concepto: 'faroles', veces: e.farolesCreidos, reales: e.farolesCreidos * GIRA.porFarol });
  if (e.ordagosGanados > 0) lineas.push({ concepto: 'ordagos', veces: e.ordagosGanados, reales: e.ordagosGanados * GIRA.porOrdago });
  if (e.ordagosTriplicados > 0) {
    const extra = e.ordagosTriplicados * GIRA.porOrdago * (GIRA.recaudadora.multiplicaOrdago - 1);
    lineas.push({ concepto: 'triple', veces: e.ordagosTriplicados, reales: extra });
  }
  if (ganado && gira.companero === 'recaudadora') lineas.push({ concepto: 'recaudadora', reales: GIRA.recaudadora.porDuelo });
  let forastero: ResumenDuelo['forastero'] = null;
  if (gira.pendiente.forastero) {
    forastero = ganado && e.grandesPerdidas === 0 ? 'ganada' : 'perdida';
    lineas.push({ concepto: 'forastero', reales: forastero === 'ganada' ? GIRA.plaza.forastero.premio : 0 });
  }
  return { lineas, forastero };
}

/**
 * Cierra el duelo: cobra, apunta en la Libreta, ajusta la Honra y decide qué viene. Perder contra
 * un secuaz quita Honra y se sigue al siguiente nivel; contra el jefe, quita Honra y se repite.
 * La gira solo se acaba sin Honra.
 */
export function terminarDuelo(gira: Gira, partida: Partida, libreta: Libreta): { gira: Gira; libreta: Libreta } {
  exigir(gira, 'duelo');
  const { duelo } = partida;
  if (duelo.fase !== 'finDuelo' || !duelo.ganador) throw new ErrorJugada('El duelo no ha terminado');
  const ganado = duelo.ganador === 'jugador';
  const { lineas, forastero } = cuentaDeReales(gira, partida, ganado);
  const total = lineas.reduce((suma, l) => suma + l.reales, 0);
  const honra = ganado ? gira.honra : gira.honra - 1;

  const apuntado = apuntar(libreta, partida.rivalId, partida.estadisticas.observaciones, gira.companero === 'lazarillo' ? 2 : 1);

  const resultados = [...gira.resultados];
  resultados[gira.nivel] = ganado ? 'ganado' : 'perdido';
  const jefe = esJefe(gira.nivel);
  // El nivel siguiente: tras un secuaz se sigue siempre; tras el jefe, solo si le has ganado.
  const nivel = jefe ? gira.nivel : gira.nivel + 1;
  const intento = jefe && !ganado ? gira.intento + 1 : 0;
  const siguiente: ResumenDuelo['siguiente'] = honra <= 0 ? 'fin' : jefe && ganado ? 'premio' : 'paradas';

  const resumen: ResumenDuelo = {
    rival: partida.rivalId,
    nivel: gira.nivel,
    ganado,
    marcador: { ...duelo.marcador },
    lineas,
    total,
    reales: { antes: gira.reales, despues: gira.reales + total },
    honra: { antes: gira.honra, despues: honra },
    cara: partida.caraJugador,
    forastero,
    libreta: apuntado.cambios,
    siguiente,
  };
  return {
    gira: {
      ...gira,
      nivel,
      intento,
      resultados,
      honra,
      reales: gira.reales + total,
      cara: partida.caraJugador,
      pendiente: { ...gira.pendiente, forastero: false },
      cuenta: { duelos: gira.cuenta.duelos + 1, ganados: gira.cuenta.ganados + (ganado ? 1 : 0), reales: gira.cuenta.reales + total },
      momento: { tipo: 'resultado', resumen },
    },
    libreta: apuntado.libreta,
  };
}

/** Desde el resumen: al final (sin Honra) o al premio del jefe. Las paradas se eligen con `elegirParada`. */
export function seguirDesdeResultado(gira: Gira): Gira {
  const momento = exigir(gira, 'resultado');
  if (momento.resumen.siguiente === 'fin') return { ...gira, momento: { tipo: 'fin', victoria: false } };
  if (momento.resumen.siguiente === 'premio') return { ...gira, momento: { tipo: 'premio' } };
  throw new ErrorJugada('Toca elegir parada');
}

// ——— Paradas ———

export function elegirParada(gira: Gira, parada: Parada): Gira {
  const momento = exigir(gira, 'resultado');
  if (momento.resumen.siguiente !== 'paradas') throw new ErrorJugada('Ahora no toca parada');
  const azar = new Azar(gira.azar);
  switch (parada) {
    case 'taberna': {
      const cosas = surtirTaberna(gira, azar);
      return { ...gira, azar: azar.estado(), momento: { tipo: 'taberna', oferta: { cosas, rondas: 0 } } };
    }
    case 'plaza': {
      const evento = sortearPlaza(gira, azar);
      return { ...gira, azar: azar.estado(), momento: { tipo: 'plaza', evento, desenlace: null } };
    }
    case 'era': {
      const despues = Math.min(CARA.maximo, gira.cara + GIRA.era);
      return { ...gira, cara: despues, momento: { tipo: 'era', antes: gira.cara, despues } };
    }
  }
}

/** De la era, la plaza o la taberna, de vuelta al mapa. */
export function volverAlMapa(gira: Gira): Gira {
  const { tipo } = gira.momento;
  if (tipo === 'plaza' && gira.momento.desenlace === null) throw new ErrorJugada('Primero hay que responder en la plaza');
  if (tipo !== 'era' && tipo !== 'plaza' && tipo !== 'taberna') throw new ErrorJugada(`No se vuelve al mapa desde ${tipo}`);
  return { ...gira, momento: { tipo: 'mapa' } };
}

// ——— La taberna ———

/** Dos cosas de un uso, un amuleto que no lleves y, a veces, el otro compañero. */
function surtirTaberna(gira: Gira, azar: Azar): CosaEnVenta[] {
  const deUnUso = azar.barajar(CATALOGO_TABERNA.filter(esDeUnUso)).slice(0, GIRA.taberna.deUnUso);
  const amuletos = azar
    .barajar(CATALOGO_TABERNA.filter((id) => !esDeUnUso(id) && !gira.bolsa.amuletos.includes(id)))
    .slice(0, GIRA.taberna.amuletos);
  const cosas: CosaEnVenta[] = [...deUnUso, ...amuletos].map((id) => ({ tipo: 'objeto', id, vendida: false }));
  const otros = COMPANEROS_INICIALES.filter((id) => id !== gira.companero);
  if (otros.length > 0 && azar.probabilidad(GIRA.taberna.probabilidadCompanero)) {
    cosas.push({ tipo: 'companero', id: azar.elegir(otros), vendida: false });
  }
  return cosas;
}

export const precioOtraRonda = (oferta: OfertaTaberna) => GIRA.taberna.otraRonda + oferta.rondas;
export const precioDe = (cosa: CosaEnVenta) => (cosa.tipo === 'objeto' ? OBJETOS[cosa.id].precio : COMPANEROS[cosa.id].precio);
export const precioDeVenta = (id: IdObjeto) => Math.floor(OBJETOS[id].precio * GIRA.taberna.venta);
const devolucionCompanero = (id: IdCompanero) => Math.floor(COMPANEROS[id].precio * GIRA.taberna.venta);

/** Por qué no se puede comprar algo, o null si se puede. */
export function impedimentoCompra(gira: Gira, cosa: CosaEnVenta): 'vendida' | 'sinDinero' | 'sinHueco' | null {
  if (cosa.vendida) return 'vendida';
  if (gira.reales < precioDe(cosa)) return 'sinDinero';
  if (cosa.tipo === 'objeto' && !hayHueco(gira.bolsa, cosa.id)) return 'sinHueco';
  return null;
}

export function hayHueco(bolsa: Bolsa, id: IdObjeto): boolean {
  return esDeUnUso(id) ? bolsa.unUso.length < GIRA.huecos.unUso : bolsa.amuletos.length < GIRA.huecos.amuletos;
}

export function comprar(gira: Gira, indice: number): Gira {
  const momento = exigir(gira, 'taberna');
  const cosa = momento.oferta.cosas[indice];
  if (!cosa) throw new ErrorJugada('No hay nada ahí');
  const impedimento = impedimentoCompra(gira, cosa);
  if (impedimento) throw new ErrorJugada(`No se puede comprar: ${impedimento}`);
  const cosas = momento.oferta.cosas.map((c, i) => (i === indice ? { ...c, vendida: true } : c));
  let { reales, bolsa, companero } = gira;
  reales -= precioDe(cosa);
  if (cosa.tipo === 'objeto') {
    bolsa = esDeUnUso(cosa.id) ? { ...bolsa, unUso: [...bolsa.unUso, cosa.id] } : { ...bolsa, amuletos: [...bolsa.amuletos, cosa.id] };
  } else {
    // El que tenías se despide y te deja la mitad de lo que costó.
    if (companero) reales += devolucionCompanero(companero);
    companero = cosa.id;
  }
  return { ...gira, reales, bolsa, companero, momento: { tipo: 'taberna', oferta: { ...momento.oferta, cosas } } };
}

export function vender(gira: Gira, hueco: keyof Bolsa, indice: number): Gira {
  exigir(gira, 'taberna');
  const id = gira.bolsa[hueco][indice];
  if (!id) throw new ErrorJugada('No hay nada en ese hueco');
  const bolsa = { ...gira.bolsa, [hueco]: gira.bolsa[hueco].filter((_, i) => i !== indice) };
  return { ...gira, reales: gira.reales + precioDeVenta(id), bolsa };
}

export function otraRonda(gira: Gira): Gira {
  const momento = exigir(gira, 'taberna');
  const precio = precioOtraRonda(momento.oferta);
  if (gira.reales < precio) throw new ErrorJugada('No te llega para otra ronda');
  const azar = new Azar(gira.azar);
  const cosas = surtirTaberna(gira, azar);
  return {
    ...gira,
    azar: azar.estado(),
    reales: gira.reales - precio,
    momento: { tipo: 'taberna', oferta: { cosas, rondas: momento.oferta.rondas + 1 } },
  };
}

// ——— La plaza ———

function sortearPlaza(gira: Gira, azar: Azar): EventoPlaza {
  const pesos = GIRA.plaza.pesos;
  const amuletosLibres = CATALOGO_TABERNA.filter((id) => !esDeUnUso(id) && !gira.bolsa.amuletos.includes(id));
  const posibles: [EventoPlaza['tipo'], number][] = [
    ['forastero', pesos.forastero],
    ['fiesta', pesos.fiesta],
    ...(amuletosLibres.length > 0 ? ([['timador', pesos.timador]] as [EventoPlaza['tipo'], number][]) : []),
    ...(!gira.monjaUsada ? ([['monja', pesos.monja]] as [EventoPlaza['tipo'], number][]) : []),
  ];
  const total = posibles.reduce((s, [, p]) => s + p, 0);
  let tirada = azar.siguiente() * total;
  let tipo = posibles[0]![0];
  for (const [t, p] of posibles) {
    if (tirada < p) {
      tipo = t;
      break;
    }
    tirada -= p;
  }
  if (tipo === 'timador') {
    const objeto = azar.elegir(amuletosLibres);
    const precio = Math.floor(OBJETOS[objeto].precio * GIRA.plaza.timador.descuento);
    return { tipo, objeto, precio, falso: azar.probabilidad(GIRA.plaza.timador.falso) };
  }
  return { tipo } as EventoPlaza;
}

/** Si se puede aceptar lo que te ofrecen en la plaza (te llega el dinero y te cabe). */
export function puedeAceptarPlaza(gira: Gira): boolean {
  const momento = exigir(gira, 'plaza');
  const { evento } = momento;
  if (evento.tipo === 'forastero') return gira.reales >= GIRA.plaza.forastero.apuesta;
  if (evento.tipo === 'timador') return gira.reales >= evento.precio && hayHueco(gira.bolsa, evento.objeto);
  return true;
}

/** Responde a lo que pasa en la plaza. La fiesta y la monja no se pueden rechazar. */
export function responderPlaza(gira: Gira, acepta: boolean): Gira {
  const momento = exigir(gira, 'plaza');
  if (momento.desenlace) throw new ErrorJugada('Ya has respondido');
  const { evento } = momento;
  const con = (cambios: Partial<Gira>, desenlace: DesenlacePlaza): Gira => ({
    ...gira,
    ...cambios,
    momento: { ...momento, desenlace },
  });
  const quiere = acepta && puedeAceptarPlaza(gira);
  switch (evento.tipo) {
    case 'forastero':
      return quiere
        ? con({ reales: gira.reales - GIRA.plaza.forastero.apuesta, pendiente: { ...gira.pendiente, forastero: true } }, 'apuestaAceptada')
        : con({}, 'apuestaRechazada');
    case 'fiesta':
      return con({ pendiente: { ...gira.pendiente, fiesta: true } }, 'fiesta');
    case 'timador': {
      if (!quiere) return con({}, 'timadorRechazado');
      const reales = gira.reales - evento.precio;
      // Si es falso, se rompe en cuanto te lo da: pagas y no te llevas nada.
      if (evento.falso) return con({ reales }, 'timadorFalso');
      return con({ reales, bolsa: { ...gira.bolsa, amuletos: [...gira.bolsa.amuletos, evento.objeto] } }, 'timadorBueno');
    }
    case 'monja':
      // La monja sí puede pasar de la Honra máxima.
      return con({ honra: gira.honra + 1, monjaUsada: true }, 'monja');
  }
}

// ——— El premio del jefe y el final ———

/** El compañero que te ofrecen de premio: uno que no lleves. */
export function companeroDePremio(gira: Gira): IdCompanero | null {
  return COMPANEROS_INICIALES.find((id) => id !== gira.companero) ?? null;
}

export function premioDisponible(gira: Gira, premio: Premio): boolean {
  switch (premio) {
    case 'companero':
      return companeroDePremio(gira) !== null;
    case 'raro': {
      const raro = ARENAS[gira.arena]?.raro;
      return !!raro && !gira.bolsa.amuletos.includes(raro) && gira.bolsa.amuletos.length < GIRA.huecos.amuletos;
    }
    case 'honra':
      return gira.honra < GIRA.honraMaxima;
  }
}

/**
 * El premio del jefe. Mientras solo esté hecha la facultad, después del premio la gira acaba
 * con victoria; cuando estén las demás arenas, se abrirá la siguiente.
 */
export function elegirPremio(gira: Gira, premio: Premio): Gira {
  exigir(gira, 'premio');
  if (!premioDisponible(gira, premio)) throw new ErrorJugada('Ese premio no está disponible');
  let { companero, reales, bolsa, honra } = gira;
  if (premio === 'companero') {
    if (companero) reales += devolucionCompanero(companero);
    companero = companeroDePremio(gira);
  } else if (premio === 'raro') {
    bolsa = { ...bolsa, amuletos: [...bolsa.amuletos, ARENAS[gira.arena]!.raro!] };
  } else {
    honra += 1;
  }
  const siguiente = gira.arena + 1;
  if (ARENAS[siguiente]?.niveles) {
    return {
      ...gira,
      companero,
      reales,
      bolsa,
      honra,
      arena: siguiente,
      nivel: 0,
      intento: 0,
      resultados: [null, null, null, null],
      momento: { tipo: 'mapa' },
    };
  }
  return { ...gira, companero, reales, bolsa, honra, momento: { tipo: 'fin', victoria: true } };
}

// ——— Guardado ———

function esGira(valor: unknown): valor is Gira {
  if (!valor || typeof valor !== 'object') return false;
  const g = valor as Partial<Gira>;
  const ok =
    typeof g.semilla === 'string' &&
    Array.isArray(g.azar) &&
    typeof g.arena === 'number' &&
    typeof g.nivel === 'number' &&
    typeof g.honra === 'number' &&
    typeof g.reales === 'number' &&
    typeof g.cara === 'number' &&
    !!g.bolsa &&
    Array.isArray(g.bolsa.unUso) &&
    Array.isArray(g.bolsa.amuletos) &&
    Array.isArray(g.resultados) &&
    !!g.pendiente &&
    !!g.cuenta &&
    !!g.momento &&
    typeof g.momento.tipo === 'string' &&
    !!ARENAS[g.arena]?.niveles;
  if (!ok) return false;
  return g.momento!.tipo !== 'duelo' || esPartida(g.momento!.partida);
}

export function guardarGira(gira: Gira, almacen: Almacen | null = almacenDelNavegador()): boolean {
  return guardarConVersion(CLAVE, VERSION_GIRA, gira, almacen);
}

/** La gira guardada, si la hay y no ha terminado. */
export function cargarGira(almacen: Almacen | null = almacenDelNavegador()): Gira | null {
  const gira = cargarConVersion(CLAVE, VERSION_GIRA, esGira, almacen);
  return gira && gira.momento.tipo !== 'fin' ? gira : null;
}

export function borrarGira(almacen: Almacen | null = almacenDelNavegador()): void {
  borrarClave(CLAVE, almacen);
}

// ——— Utilidades ———

function exigir<T extends Momento['tipo']>(gira: Gira, tipo: T): Extract<Momento, { tipo: T }> {
  if (gira.momento.tipo !== tipo) throw new ErrorJugada(`Ahora no toca eso (estamos en ${gira.momento.tipo})`);
  return gira.momento as Extract<Momento, { tipo: T }>;
}
