import { IA } from '../../datos/ia';
import type { ParametrosRival } from '../../datos/rivales';
import type { AccionEnvite, EstadoEnvite, LimitesEnvite } from '../apuestas';
import type { Azar } from '../azar';

/**
 * Decisiones de envite de un rival (documento de diseño, «IA de los rivales»). Combinan la
 * fuerza F del lance con la personalidad (A agresividad, B faroleo, M miedo al órdago,
 * Me memoria) y un poco de azar.
 */

export interface SituacionEnvite {
  /** Fuerza de la mano en el lance que se juega. */
  F: number;
  envite: EstadoEnvite;
  limites: LimitesEnvite;
  /** Piedras propias menos las del jugador. */
  diferencia: number;
  /** Cara del jugador (0–100). */
  caraJugador: number;
  /** Proporción de envites del jugador que fueron faroles en este duelo. */
  tFarol: number;
  /** Regla especial de Agustín: acepta todo. */
  aceptaTodo: boolean;
  /** Número de la mano en curso. */
  numeroMano?: number;
  /** Doña Ignacia: no acepta órdagos antes de esta mano. */
  ordagoDesdeMano?: number;
  /** Don Francisco: en este lance, si habla sin envite delante, envida siempre. */
  siempreEnvida?: boolean;
  /** Se suma al valor para aceptar un envite (no un órdago): Chema crecido quiere más; arrugado, menos. */
  ajusteAceptar?: number;
  /** «Darle conversación»: en esta mano no puede tirar órdago. */
  sinOrdago?: boolean;
}

export interface DecisionEnvite {
  accion: AccionEnvite;
  /** Explicación para el modo de depuración. */
  motivo: string;
  /** Si envida o sube con F por debajo del umbral de farol. */
  farol: boolean;
  umbral: number;
  valor?: number;
}

export function umbralEnvidar(p: ParametrosRival): number {
  return IA.envido.umbralBase - IA.envido.porAgresividad * (p.agresividad - 5);
}

/** 2 piedras de base y, si A ≥ 6, una más por cada 0,1 que F supere el umbral. */
export function cantidadEnvite(F: number, p: ParametrosRival): number {
  const exceso = Math.max(0, F - umbralEnvidar(p));
  const extra = p.agresividad >= IA.envido.agresividadParaSubir ? Math.floor(exceso / IA.envido.paso + 1e-9) : 0;
  return IA.envido.piedrasBase + extra;
}

/** F + (50 − Cara)/200 + Me/10 · 0,6 · (t_farol − 0,25) + ε */
export function valorParaAceptar(s: SituacionEnvite, p: ParametrosRival, azar: Azar): number {
  const { aceptar } = IA;
  const cara = (aceptar.caraNeutra - s.caraJugador) / aceptar.divisorCara;
  const memoria = (p.memoria / 10) * aceptar.pesoMemoria * (s.tFarol - aceptar.farolesEsperados);
  const ruido = (azar.siguiente() * 2 - 1) * aceptar.ruido;
  return s.F + cara + memoria + cuota(s) + ruido;
}

/**
 * Lo que se arriesga: aceptar un envite pequeño cuesta poco si se pierde, y rechazarlo regala
 * el «no quiero». Con apuesta X y deje d, aceptar compensa si F > (X − d) / 2X; este término
 * acerca el umbral de 0,5 a ese punto en la medida de `pesoCuota` (0: sin efecto).
 */
function cuota(s: SituacionEnvite): number {
  const X = s.envite.apuesta;
  if (X <= 0 || s.envite.ordago) return 0;
  const d = Math.max(s.envite.aceptado, s.limites.deje);
  return IA.aceptar.pesoCuota * (IA.aceptar.umbral - (X - d) / (2 * X));
}

export function umbralOrdago(s: SituacionEnvite, p: ParametrosRival): number {
  const desesperado = s.diferencia <= -IA.ordago.desesperacion;
  return IA.aceptar.umbral + IA.ordago.porMiedo * p.miedoOrdago - (desesperado ? IA.ordago.descuentoDesesperado : 0);
}

export function decidirEnvite(s: SituacionEnvite, p: ParametrosRival, azar: Azar): DecisionEnvite {
  const umbral = umbralEnvidar(p);
  const { envite } = s;
  const farol = s.F < IA.farol.fuerzaMaxima;

  // Le han tirado un órdago.
  if (envite.ordago) {
    const limite = umbralOrdago(s, p);
    if (s.ordagoDesdeMano && (s.numeroMano ?? 0) < s.ordagoDesdeMano) {
      return { accion: { tipo: 'noQuiero' }, motivo: `no acepta órdagos antes de la mano ${s.ordagoDesdeMano}`, farol: false, umbral: limite };
    }
    if (s.aceptaTodo) return { accion: { tipo: 'quiero' }, motivo: 'enfadado: acepta todo', farol: false, umbral: limite };
    const valor = valorParaAceptar(s, p, azar);
    return valor > limite
      ? { accion: { tipo: 'quiero' }, motivo: `acepta el órdago (${fmt(valor)} > ${fmt(limite)})`, farol: false, umbral: limite, valor }
      : { accion: { tipo: 'noQuiero' }, motivo: `rechaza el órdago (${fmt(valor)} ≤ ${fmt(limite)})`, farol: false, umbral: limite, valor };
  }

  // Le han envidado.
  if (envite.envidador) {
    if (
      s.F > umbral + IA.subir.margen &&
      envite.apuesta < IA.subir.apuestaMaxima &&
      azar.probabilidad(IA.subir.porAgresividad * p.agresividad)
    ) {
      const piedras = Math.max(s.limites.subidaMinima, cantidadEnvite(s.F, p));
      return { accion: { tipo: 'mas', piedras }, motivo: `sube ${piedras} (F ${fmt(s.F)})`, farol: false, umbral };
    }
    if (s.aceptaTodo) return { accion: { tipo: 'quiero' }, motivo: 'enfadado: acepta todo', farol: false, umbral: IA.aceptar.umbral };
    const valor = valorParaAceptar(s, p, azar) + (s.ajusteAceptar ?? 0);
    return valor > IA.aceptar.umbral
      ? { accion: { tipo: 'quiero' }, motivo: `quiere (${fmt(valor)} > 0,5)`, farol: false, umbral: IA.aceptar.umbral, valor }
      : { accion: { tipo: 'noQuiero' }, motivo: `no quiere (${fmt(valor)} ≤ 0,5)`, farol: false, umbral: IA.aceptar.umbral, valor };
  }

  // Habla sin envite delante.
  if (!s.sinOrdago && s.F > IA.ordago.fuerzaMinima && azar.probabilidad(IA.ordago.porAgresividad * p.agresividad)) {
    return { accion: { tipo: 'ordago' }, motivo: `órdago con F ${fmt(s.F)}`, farol: false, umbral };
  }
  if (!s.sinOrdago && s.diferencia <= -IA.ordago.desesperacion && azar.probabilidad(IA.ordago.farolPorFaroleo * p.faroleo)) {
    return { accion: { tipo: 'ordago' }, motivo: 'órdago de farol: va perdiendo', farol, umbral };
  }
  if (s.F > umbral) {
    const piedras = Math.max(s.limites.enviteMinimo, cantidadEnvite(s.F, p));
    return { accion: { tipo: 'envido', piedras }, motivo: `envida ${piedras} (F ${fmt(s.F)} > ${fmt(umbral)})`, farol: false, umbral };
  }
  if (s.siempreEnvida) {
    const piedras = Math.max(s.limites.enviteMinimo, cantidadEnvite(s.F, p));
    return { accion: { tipo: 'envido', piedras }, motivo: `envida siempre aquí, lleve lo que lleve (F ${fmt(s.F)})`, farol, umbral };
  }
  if (farol && azar.probabilidad(IA.farol.porFaroleo * p.faroleo)) {
    const piedras = Math.max(s.limites.enviteMinimo, IA.farol.piedras);
    return { accion: { tipo: 'envido', piedras }, motivo: `envida de farol (F ${fmt(s.F)})`, farol: true, umbral };
  }
  return { accion: { tipo: 'paso' }, motivo: `pasa (F ${fmt(s.F)} ≤ ${fmt(umbral)})`, farol: false, umbral };
}

function fmt(x: number): string {
  return x.toFixed(2).replace('.', ',');
}
