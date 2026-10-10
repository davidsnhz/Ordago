import { CARA } from '../../datos/cara';
import { IA } from '../../datos/ia';
import type { DefinicionTic, DisparadorTic } from '../../datos/rivales';
import type { Azar } from '../azar';
import { crearBaraja } from '../baraja';
import { rango, type Carta, type ModoReyes } from '../carta';
import type { Lance } from '../lances';
import { analizarPares, puntos, tieneJuego, tienePares } from '../mano';

/**
 * Tics del rival. Cuando se cumple su disparador, el tic aparece con una probabilidad fija
 * (60 %); cuando no, aparece a veces en falso. La frecuencia de los falsos se calcula para
 * que, de todas las veces que se ve el tic, la proporción de verdaderos sea su fiabilidad.
 */

/** Momentos en los que puede aparecer un tic. */
export type MomentoTic = { tipo: 'cartas' } | { tipo: 'declaracion' | 'envite'; lance: Lance };

export interface ContextoTic {
  cartas: readonly Carta[];
  modo: ModoReyes;
  momento: MomentoTic;
  /** Si el rival está decidiendo un envite: si habla sin envite delante, si va de farol y si responde a uno tuyo. */
  decision?: { abre: boolean; farol: boolean; responde: boolean };
  caraJugador: number;
  /** Faroleo del rival (B), para saber con qué frecuencia farolea. */
  faroleo: number;
}

export interface TicDisparado {
  id: string;
  /** Si el disparador se cumplía de verdad (solo para depuración y pruebas). */
  verdadero: boolean;
}

type DisparadorDeCartas = Extract<DisparadorTic, 'pares' | 'duples' | 'juego' | 'treintaYUna' | 'manoFuerte'>;

/** Duples, medias, 31, tres reyes o tres pitos: algo fuerte en algún lance. */
export function esManoFuerte(cartas: readonly Carta[], modo: ModoReyes): boolean {
  const tipo = analizarPares(cartas, modo).tipo;
  const rey = modo === 8 ? 7 : 9;
  const cuenta = (r: number) => cartas.filter((c) => rango(c, modo) === r).length;
  return tipo === 'duples' || tipo === 'medias' || puntos(cartas, modo) === 31 || cuenta(rey) >= 3 || cuenta(0) >= 3;
}

export function cumpleConLasCartas(disparador: DisparadorDeCartas, cartas: readonly Carta[], modo: ModoReyes): boolean {
  switch (disparador) {
    case 'pares':
      return tienePares(cartas, modo);
    case 'duples':
      return analizarPares(cartas, modo).tipo === 'duples';
    case 'juego':
      return tieneJuego(cartas, modo);
    case 'treintaYUna':
      return puntos(cartas, modo) === 31;
    case 'manoFuerte':
      return esManoFuerte(cartas, modo);
  }
}

/** Si se cumple el disparador, o null si en este momento no se puede dar (y el tic no se sortea). */
export function cumpleDisparador(disparador: DisparadorTic, ctx: ContextoTic): boolean | null {
  switch (disparador) {
    case 'farol':
      return ctx.momento.tipo === 'envite' && ctx.decision?.abre ? ctx.decision.farol : null;
    case 'sospecha':
      return ctx.momento.tipo === 'envite' && ctx.decision?.responde ? ctx.caraJugador < CARA.zonas.baja : null;
    case 'ninguno':
      return false;
    default:
      return cumpleConLasCartas(disparador, ctx.cartas, ctx.modo);
  }
}

const tasasBase = new Map<string, number>();

/** Proporción de manos de 4 cartas que cumplen el disparador (se calcula una vez recorriéndolas todas). */
export function tasaBase(disparador: DisparadorDeCartas, modo: ModoReyes): number {
  const clave = `${disparador}/${modo}`;
  const guardada = tasasBase.get(clave);
  if (guardada !== undefined) return guardada;
  const baraja = crearBaraja();
  let total = 0;
  let cumplen = 0;
  for (let i = 0; i < 40; i++)
    for (let j = i + 1; j < 40; j++)
      for (let k = j + 1; k < 40; k++)
        for (let l = k + 1; l < 40; l++) {
          total++;
          if (cumpleConLasCartas(disparador, [baraja[i]!, baraja[j]!, baraja[k]!, baraja[l]!], modo)) cumplen++;
        }
  const tasa = cumplen / total;
  tasasBase.set(clave, tasa);
  return tasa;
}

/** Con qué frecuencia se cumple el disparador en los momentos en que se sortea. */
function frecuencia(disparador: DisparadorTic, ctx: Pick<ContextoTic, 'modo' | 'faroleo'>): number {
  switch (disparador) {
    case 'farol':
      // F es casi uniforme: con F < 0,35 envida de farol con probabilidad 0,04·B.
      return IA.farol.fuerzaMaxima * IA.farol.porFaroleo * ctx.faroleo;
    case 'sospecha':
      return IA.tics.tasaSospecha;
    case 'ninguno':
      return 0;
    default:
      return tasaBase(disparador, ctx.modo);
  }
}

/**
 * Probabilidad de hacer el tic en falso. Con p = probabilidad si se cumple, q = frecuencia y
 * f = fiabilidad: f = p·q / (p·q + falso·(1 − q))  ⇒  falso = p·q·(1 − f) / (f·(1 − q)).
 */
export function probabilidadEnFalso(tic: DefinicionTic, ctx: Pick<ContextoTic, 'modo' | 'faroleo'>): number {
  if (tic.disparador === 'ninguno') return IA.tics.probabilidadSinSentido;
  const p = IA.tics.probabilidadSiCumple;
  const q = frecuencia(tic.disparador, ctx);
  const f = tic.fiabilidad;
  if (q <= 0) return 0;
  return Math.min(1, (p * q * (1 - f)) / (f * (1 - q)));
}

/** Tics que aparecen en este momento. */
export function sortearTics(tics: readonly DefinicionTic[], ctx: ContextoTic, azar: Azar): TicDisparado[] {
  const disparados: TicDisparado[] = [];
  for (const tic of tics) {
    if (ctx.momento.tipo !== 'cartas' && !tic.lances.includes(ctx.momento.lance)) continue;
    const verdadero = cumpleDisparador(tic.disparador, ctx);
    if (verdadero === null) continue;
    const probabilidad = verdadero ? IA.tics.probabilidadSiCumple : probabilidadEnFalso(tic, ctx);
    if (azar.probabilidad(probabilidad)) disparados.push({ id: tic.id, verdadero });
  }
  return disparados;
}

/**
 * Cara a 0: el rival ve tu tic. Te tiembla el pulso cuando llevas buena mano en el lance,
 * con la fiabilidad de datos/ia.ts. Devuelve si se te nota.
 */
export function seTeNota(fuerzaJugador: number, azar: Azar): { seNota: boolean; verdadero: boolean } {
  const { fuerzaJugador: umbral, fiabilidad: f, tasaBase: q } = IA.exposicion;
  const p = IA.tics.probabilidadSiCumple;
  const verdadero = fuerzaJugador >= umbral;
  const probabilidad = verdadero ? p : (p * q * (1 - f)) / (f * (1 - q));
  return { seNota: azar.probabilidad(probabilidad), verdadero };
}
