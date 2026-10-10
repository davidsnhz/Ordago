/**
 * Generador pseudoaleatorio con semilla (sfc32). Todo el azar del juego pasa por aquí
 * para poder repetir una partida exacta. Su estado son cuatro enteros de 32 bits sin
 * signo y se guarda tal cual en el JSON de la partida.
 */
export type EstadoAzar = [number, number, number, number];

const DOS_A_LA_32 = 4294967296;

export class Azar {
  private a: number;
  private b: number;
  private c: number;
  private d: number;

  constructor(estado: Readonly<EstadoAzar>) {
    [this.a, this.b, this.c, this.d] = estado;
  }

  static conSemilla(semilla: number | string): Azar {
    return new Azar(estadoDesdeSemilla(semilla));
  }

  estado(): EstadoAzar {
    return [this.a >>> 0, this.b >>> 0, this.c >>> 0, this.d >>> 0];
  }

  /** Entero de 32 bits sin signo. */
  entero32(): number {
    const t = (((this.a + this.b) | 0) + this.d) | 0;
    this.d = (this.d + 1) | 0;
    this.a = this.b ^ (this.b >>> 9);
    this.b = (this.c + (this.c << 3)) | 0;
    this.c = (this.c << 21) | (this.c >>> 11);
    this.c = (this.c + t) | 0;
    return t >>> 0;
  }

  /** Número en [0, 1). */
  siguiente(): number {
    return this.entero32() / DOS_A_LA_32;
  }

  /** Entero entre `min` y `max`, ambos incluidos. */
  entero(min: number, max: number): number {
    if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) {
      throw new RangeError(`Intervalo no válido: [${min}, ${max}]`);
    }
    return min + Math.floor(this.siguiente() * (max - min + 1));
  }

  /** `true` con probabilidad `p`. */
  probabilidad(p: number): boolean {
    return this.siguiente() < p;
  }

  elegir<T>(lista: readonly T[]): T {
    if (lista.length === 0) throw new RangeError('No se puede elegir de una lista vacía');
    return lista[this.entero(0, lista.length - 1)] as T;
  }

  /** Copia barajada (Fisher-Yates). No toca la lista original. */
  barajar<T>(lista: readonly T[]): T[] {
    const copia = [...lista];
    for (let i = copia.length - 1; i > 0; i--) {
      const j = this.entero(0, i);
      [copia[i], copia[j]] = [copia[j] as T, copia[i] as T];
    }
    return copia;
  }
}

/** Convierte cualquier semilla en un estado inicial bien mezclado (hash cyrb128). */
export function estadoDesdeSemilla(semilla: number | string): EstadoAzar {
  const texto = String(semilla);
  let h1 = 1779033703;
  let h2 = 3144134277;
  let h3 = 1013904242;
  let h4 = 2773480762;
  for (let i = 0; i < texto.length; i++) {
    const k = texto.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  h1 ^= h2 ^ h3 ^ h4;
  h2 ^= h1;
  h3 ^= h1;
  h4 ^= h1;
  const azar = new Azar([h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0]);
  // Las primeras salidas de sfc32 dependen mucho de la semilla: se descartan.
  for (let i = 0; i < 15; i++) azar.entero32();
  return azar.estado();
}
