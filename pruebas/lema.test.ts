import { describe, expect, it } from 'vitest';
import type { Almacen } from '../src/estado/guardado';
import { ES } from '../src/textos/es';
import { siguienteLema } from '../src/ui/lema';

const enMemoria = (inicial: Record<string, string> = {}): Almacen => {
  const datos = new Map(Object.entries(inicial));
  return { getItem: (k) => datos.get(k) ?? null, setItem: (k, v) => void datos.set(k, v), removeItem: (k) => void datos.delete(k) };
};

describe('el lema de la portada', () => {
  const lemas = ES.portada.lemas;

  it('hay cinco y ninguno repetido', () => {
    expect(lemas).toHaveLength(5);
    expect(new Set(lemas).size).toBe(5);
  });

  it('cada vez que se abre el juego sale el siguiente, y al acabar vuelve al primero', () => {
    const almacen = enMemoria();
    const salen = Array.from({ length: 7 }, () => siguienteLema(lemas, almacen));
    expect(salen).toEqual([...lemas, lemas[0], lemas[1]]);
  });

  it('si la lista cambia y lo guardado ya no cabe, sigue dando la vuelta', () => {
    expect(siguienteLema(lemas, enMemoria({ 'ordago.lema': '12' }))).toBe(lemas[3]);
    expect(siguienteLema(lemas, enMemoria({ 'ordago.lema': 'roto' }))).toBe(lemas[0]);
  });

  it('sin almacenamiento, o si falla, sale el primero', () => {
    expect(siguienteLema(lemas, null)).toBe(lemas[0]);
    const falla: Almacen = {
      getItem: () => {
        throw new Error('bloqueado');
      },
      setItem: () => {
        throw new Error('bloqueado');
      },
      removeItem: () => {},
    };
    expect(siguienteLema(lemas, falla)).toBe(lemas[0]);
  });
});
