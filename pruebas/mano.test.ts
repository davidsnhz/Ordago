import { describe, expect, it } from 'vitest';
import { analizarPares, puntos, tieneJuego, tienePares } from '../src/nucleo/mano';
import { cartas } from './ayudas';

const pares = (notacion: string, modo: 8 | 4 = 8) => analizarPares(cartas(notacion), modo);
const suma = (notacion: string, modo: 8 | 4 = 8) => puntos(cartas(notacion), modo);

describe('puntos', () => {
  it('suma las figuras a 10, el tres a 10 y el dos a 1 (8 reyes)', () => {
    expect(suma('R C S 7')).toBe(37);
    expect(suma('3 3 3 A')).toBe(31);
    expect(suma('2 2 A A')).toBe(4);
    expect(suma('R R R R')).toBe(40);
    expect(suma('7 7 7 4')).toBe(25);
  });

  it('a 4 reyes el tres suma 3 y el dos suma 2', () => {
    expect(suma('3 3 3 A', 4)).toBe(10);
    expect(suma('R R 7 3', 4)).toBe(30);
    expect(suma('R R 7 3', 8)).toBe(37);
  });

  it('hay juego desde 31', () => {
    expect(tieneJuego(cartas('R R 7 4'), 8)).toBe(true);
    expect(tieneJuego(cartas('R R 5 5'), 8)).toBe(false);
  });
});

describe('pares', () => {
  it('sin pares', () => {
    expect(pares('R C S 7').tipo).toBe('ninguno');
    expect(tienePares(cartas('R C S 7'), 8)).toBe(false);
  });

  it('la sota y el caballo no son pareja aunque valgan 10', () => {
    expect(pares('S C 5 6').tipo).toBe('ninguno');
  });

  it('a 8 reyes, rey y tres son pareja de reyes; as y dos, pareja de ases', () => {
    expect(pares('R 3 5 6')).toEqual(pares('R R 5 6'));
    expect(pares('R 3 5 6').tipo).toBe('pareja');
    expect(pares('2 A 5 6')).toEqual(pares('A A 5 6'));
    expect(pares('2 A 5 6').tipo).toBe('pareja');
  });

  it('a 4 reyes, rey y tres no son pareja', () => {
    expect(pares('R 3 5 6', 4).tipo).toBe('ninguno');
    expect(pares('3 3 5 6', 4).tipo).toBe('pareja');
  });

  it('medias: tres iguales', () => {
    expect(pares('R R 3 7')).toMatchObject({ tipo: 'medias' });
    expect(pares('4 4 4 R').tipo).toBe('medias');
  });

  it('duples: dos parejas', () => {
    expect(pares('R R 4 4').tipo).toBe('duples');
    expect(pares('C C S S').tipo).toBe('duples');
    expect(pares('R R 4 4').alto).toBeGreaterThan(pares('R R 4 4').bajo);
  });

  it('cuatro iguales son duples, con las dos parejas del mismo rango', () => {
    const cuatroReyes = pares('R R 3 3');
    expect(cuatroReyes.tipo).toBe('duples');
    expect(cuatroReyes.alto).toBe(cuatroReyes.bajo);
    expect(pares('5 5 5 5').tipo).toBe('duples');
  });
});
