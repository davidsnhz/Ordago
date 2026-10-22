import { preferencias } from './preferencias';

/**
 * Sonido provisional de la mesa viva (22 de octubre de 2026): todo se fabrica en el momento con
 * el audio del navegador (ruido filtrado y tonos), sin archivos. Sirve para probar dónde va
 * cada sonido; los definitivos serán grabaciones (cartas, piedras, golpes en la mesa).
 */
export type Sonido =
  /** Una carta que sale del mazo y cae en la mesa. */
  | 'carta'
  /** Tocar una carta para tirarla. */
  | 'toque'
  /** Una piedra que llega al marcador; `tono` sube con cada una. */
  | 'piedra'
  /** «Paso»: dos golpes con los nudillos en la mesa, como en el mus de verdad. */
  | 'paso'
  /** Un sello: lo que se dice en la mesa. */
  | 'sello'
  /** Un sello fuerte: un envite gordo o una subida. */
  | 'golpe'
  | 'ordago'
  | 'ganas'
  | 'pierdes'
  | 'caraSube'
  | 'caraBaja';

interface Opciones {
  /** Segundos de espera antes de sonar. */
  retraso?: number;
  /** Multiplica las frecuencias: 1 es el tono normal. */
  tono?: number;
}

let contexto: AudioContext | null = null;
let salida: GainNode | null = null;
let ruido: AudioBuffer | null = null;

function preparar(): AudioContext | null {
  if (contexto) return contexto;
  const Clase = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Clase) return null;
  try {
    contexto = new Clase();
  } catch {
    return null;
  }
  const compresor = contexto.createDynamicsCompressor();
  compresor.threshold.value = -16;
  compresor.ratio.value = 4;
  salida = contexto.createGain();
  salida.gain.value = 0.7;
  salida.connect(compresor).connect(contexto.destination);
  ruido = contexto.createBuffer(1, contexto.sampleRate, contexto.sampleRate);
  const muestras = ruido.getChannelData(0);
  for (let i = 0; i < muestras.length; i++) muestras[i] = Math.random() * 2 - 1;
  return contexto;
}

// Los navegadores solo dejan sonar después de que el jugador toque algo.
function desbloquear() {
  const c = preparar();
  if (c && c.state === 'suspended') void c.resume();
}
if (typeof window !== 'undefined') {
  for (const evento of ['pointerdown', 'pointerup', 'touchend', 'keydown']) {
    window.addEventListener(evento, desbloquear, { capture: true, passive: true });
  }
}

/** Envolvente corta: sube en `ataque` y se apaga hasta `duracion`. */
function envolvente(c: AudioContext, inicio: number, duracion: number, volumen: number, ataque = 0.004): GainNode {
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, inicio);
  g.gain.linearRampToValueAtTime(volumen, inicio + ataque);
  g.gain.exponentialRampToValueAtTime(0.0001, inicio + duracion);
  g.connect(salida!);
  return g;
}

/** Un tono que puede caer (o subir) de `frecuencia` a `hasta`. */
function tono(
  c: AudioContext,
  inicio: number,
  { onda = 'sine', frecuencia, hasta, duracion, volumen, ataque }: { onda?: OscillatorType; frecuencia: number; hasta?: number; duracion: number; volumen: number; ataque?: number },
) {
  const o = c.createOscillator();
  o.type = onda;
  o.frequency.setValueAtTime(frecuencia, inicio);
  if (hasta) o.frequency.exponentialRampToValueAtTime(hasta, inicio + duracion);
  o.connect(envolvente(c, inicio, duracion, volumen, ataque));
  o.start(inicio);
  o.stop(inicio + duracion + 0.05);
}

/** Un soplo de ruido filtrado: el roce de una carta, el golpe de un sello. */
function soplo(
  c: AudioContext,
  inicio: number,
  { filtro, frecuencia, hasta, q = 1, duracion, volumen }: { filtro: BiquadFilterType; frecuencia: number; hasta?: number; q?: number; duracion: number; volumen: number },
) {
  const s = c.createBufferSource();
  s.buffer = ruido;
  s.loop = true;
  const f = c.createBiquadFilter();
  f.type = filtro;
  f.Q.value = q;
  f.frequency.setValueAtTime(frecuencia, inicio);
  if (hasta) f.frequency.exponentialRampToValueAtTime(hasta, inicio + duracion);
  s.connect(f).connect(envolvente(c, inicio, duracion, volumen, 0.003));
  s.start(inicio, Math.random() * 0.5);
  s.stop(inicio + duracion + 0.05);
}

const RECETAS: Record<Sonido, (c: AudioContext, t: number, k: number) => void> = {
  carta: (c, t, k) => {
    soplo(c, t, { filtro: 'bandpass', frecuencia: 3400 * k, hasta: 1300 * k, q: 0.9, duracion: 0.13, volumen: 0.45 });
    soplo(c, t + 0.08, { filtro: 'lowpass', frecuencia: 700, duracion: 0.05, volumen: 0.18 });
  },
  toque: (c, t, k) => {
    tono(c, t, { onda: 'triangle', frecuencia: 1400 * k, hasta: 1000 * k, duracion: 0.05, volumen: 0.12 });
    soplo(c, t, { filtro: 'highpass', frecuencia: 3000, duracion: 0.025, volumen: 0.14 });
  },
  piedra: (c, t, k) => {
    tono(c, t, { frecuencia: 2100 * k, hasta: 1850 * k, duracion: 0.08, volumen: 0.2 });
    tono(c, t, { onda: 'triangle', frecuencia: 3350 * k, duracion: 0.05, volumen: 0.07 });
    soplo(c, t, { filtro: 'bandpass', frecuencia: 4200, q: 2, duracion: 0.03, volumen: 0.25 });
  },
  paso: (c, t) => {
    for (const d of [0, 0.12]) {
      tono(c, t + d, { frecuencia: 200, hasta: 120, duracion: 0.08, volumen: 0.5 });
      soplo(c, t + d, { filtro: 'lowpass', frecuencia: 1300, duracion: 0.035, volumen: 0.3 });
    }
  },
  sello: (c, t) => {
    tono(c, t, { frecuencia: 150, hasta: 55, duracion: 0.2, volumen: 0.8 });
    soplo(c, t, { filtro: 'lowpass', frecuencia: 900, hasta: 200, duracion: 0.09, volumen: 0.45 });
    tono(c, t, { onda: 'triangle', frecuencia: 420, hasta: 300, duracion: 0.05, volumen: 0.1 });
  },
  golpe: (c, t) => {
    tono(c, t, { frecuencia: 115, hasta: 40, duracion: 0.38, volumen: 1 });
    soplo(c, t, { filtro: 'lowpass', frecuencia: 2200, hasta: 150, duracion: 0.22, volumen: 0.6 });
    soplo(c, t, { filtro: 'bandpass', frecuencia: 2500, duracion: 0.04, volumen: 0.3 });
  },
  ordago: (c, t) => {
    tono(c, t, { frecuencia: 85, hasta: 30, duracion: 0.9, volumen: 1 });
    soplo(c, t, { filtro: 'lowpass', frecuencia: 5000, hasta: 200, duracion: 0.8, volumen: 0.55 });
    // Un acorde menor que se queda sonando.
    for (const f of [196, 233.08, 293.66, 392]) tono(c, t + 0.02, { onda: 'triangle', frecuencia: f, duracion: 1.7, volumen: 0.07, ataque: 0.01 });
  },
  ganas: (c, t) => {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tono(c, t + i * 0.1, { onda: 'triangle', frecuencia: f, duracion: 0.35, volumen: 0.15 }));
    for (const f of [523.25, 659.25, 783.99]) tono(c, t + 0.45, { onda: 'triangle', frecuencia: f, duracion: 1.1, volumen: 0.08, ataque: 0.01 });
  },
  pierdes: (c, t) => {
    [392, 349.23, 311.13, 261.63].forEach((f, i) => tono(c, t + i * 0.22, { onda: 'triangle', frecuencia: f, duracion: 0.55, volumen: 0.14 }));
  },
  caraSube: (c, t) => {
    [880, 1318.5].forEach((f, i) => tono(c, t + i * 0.07, { frecuencia: f, duracion: 0.18, volumen: 0.1 }));
  },
  caraBaja: (c, t) => {
    [440, 330].forEach((f, i) => tono(c, t + i * 0.09, { onda: 'triangle', frecuencia: f, duracion: 0.22, volumen: 0.1 }));
  },
};

/** Hace sonar `sonido` si el sonido está puesto y el navegador ya deja. */
export function sonar(sonido: Sonido, { retraso = 0, tono: k = 1 }: Opciones = {}): void {
  if (!preferencias().sonido || typeof window === 'undefined') return;
  const c = preparar();
  // Sin un toque del jugador el audio está parado: mejor callar que soltarlo todo de golpe luego.
  if (!c || c.state !== 'running') return;
  RECETAS[sonido](c, c.currentTime + 0.01 + retraso, k);
}
