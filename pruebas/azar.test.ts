import { describe, expect, it } from 'vitest';
import { Azar, estadoDesdeSemilla } from '../src/nucleo/azar';

const secuencia = (azar: Azar, n: number) => Array.from({ length: n }, () => azar.entero32());

describe('azar con semilla', () => {
  it('la misma semilla da la misma secuencia', () => {
    expect(secuencia(Azar.conSemilla(42), 100)).toEqual(secuencia(Azar.conSemilla(42), 100));
    expect(secuencia(Azar.conSemilla('Ruperto'), 100)).toEqual(secuencia(Azar.conSemilla('Ruperto'), 100));
  });

  it('semillas distintas dan secuencias distintas', () => {
    expect(secuencia(Azar.conSemilla(1), 20)).not.toEqual(secuencia(Azar.conSemilla(2), 20));
    expect(secuencia(Azar.conSemilla('a'), 20)).not.toEqual(secuencia(Azar.conSemilla('b'), 20));
  });

  it('guardar y restaurar el estado continúa la secuencia igual', () => {
    const original = Azar.conSemilla(7);
    secuencia(original, 50);
    const guardado = JSON.parse(JSON.stringify(original.estado()));
    const restaurado = new Azar(guardado);
    expect(secuencia(restaurado, 100)).toEqual(secuencia(original, 100));
  });

  it('el estado son cuatro enteros de 32 bits sin signo', () => {
    for (const n of estadoDesdeSemilla('x')) {
      expect(Number.isInteger(n)).toBe(true);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(2 ** 32);
    }
  });

  it('siguiente() está en [0, 1)', () => {
    const azar = Azar.conSemilla(3);
    for (let i = 0; i < 10_000; i++) {
      const x = azar.siguiente();
      expect(x >= 0 && x < 1).toBe(true);
    }
  });

  it('entero() respeta los límites y sale uniforme', () => {
    const azar = Azar.conSemilla(99);
    const cuenta = [0, 0, 0, 0, 0, 0];
    for (let i = 0; i < 60_000; i++) {
      const dado = azar.entero(1, 6);
      expect(dado).toBeGreaterThanOrEqual(1);
      expect(dado).toBeLessThanOrEqual(6);
      cuenta[dado - 1]! += 1;
    }
    // Desviación típica ≈ 91: un margen de 500 es más de 5 desviaciones.
    for (const n of cuenta) expect(Math.abs(n - 10_000)).toBeLessThan(500);
  });

  it('entero() rechaza intervalos no válidos', () => {
    const azar = Azar.conSemilla(1);
    expect(() => azar.entero(5, 4)).toThrow(RangeError);
    expect(() => azar.entero(0.5, 4)).toThrow(RangeError);
  });

  it('barajar() es una permutación reproducible que no toca la original', () => {
    const lista = Array.from({ length: 40 }, (_, i) => i);
    const copia = [...lista];
    const barajada = Azar.conSemilla(5).barajar(lista);
    expect(lista).toEqual(copia);
    expect([...barajada].sort((x, y) => x - y)).toEqual(lista);
    expect(barajada).not.toEqual(lista);
    expect(Azar.conSemilla(5).barajar(lista)).toEqual(barajada);
  });

  it('elegir() falla con una lista vacía', () => {
    expect(() => Azar.conSemilla(1).elegir([])).toThrow(RangeError);
  });
});
