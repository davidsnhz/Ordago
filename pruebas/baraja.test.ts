import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { Azar } from '../src/nucleo/azar';
import { cerrarRondaDeDescartes, crearBaraja, crearMazo, repartir, robar } from '../src/nucleo/baraja';
import { cartaDesdeId, idCarta, rango, valorJuego, type Carta } from '../src/nucleo/carta';
import { cartas } from './ayudas';

const ids = (lista: readonly Carta[]) => lista.map(idCarta);

describe('la baraja', () => {
  const baraja = crearBaraja();

  it('tiene 40 cartas distintas, 10 por palo y sin ochos ni nueves', () => {
    expect(baraja).toHaveLength(40);
    expect(new Set(ids(baraja)).size).toBe(40);
    for (const palo of ['oros', 'copas', 'espadas', 'bastos']) {
      expect(baraja.filter((c) => c.palo === palo)).toHaveLength(10);
    }
    expect(baraja.some((c) => (c.numero as number) === 8 || (c.numero as number) === 9)).toBe(false);
  });

  it('los identificadores coinciden con los archivos de assets/cartas', () => {
    const carpeta = fileURLToPath(new URL('../assets/cartas/', import.meta.url));
    const archivos = readdirSync(carpeta)
      .filter((nombre) => !nombre.startsWith('reverso'))
      .map((nombre) => nombre.replace('.webp', ''))
      .sort();
    expect([...ids(baraja)].sort()).toEqual(archivos);
  });

  it('el identificador va y vuelve', () => {
    for (const carta of baraja) expect(cartaDesdeId(idCarta(carta))).toEqual(carta);
    expect(() => cartaDesdeId('08_oros')).toThrow();
    expect(() => cartaDesdeId('12_tréboles')).toThrow();
  });
});

describe('8 reyes y 4 reyes', () => {
  const [rey, tres, dos, as, caballo, sota] = cartas('R 3 2 A C S');

  it('a 8 reyes el tres es un rey y el dos es un as', () => {
    expect(rango(tres!, 8)).toBe(rango(rey!, 8));
    expect(rango(dos!, 8)).toBe(rango(as!, 8));
    expect(valorJuego(tres!, 8)).toBe(10);
    expect(valorJuego(dos!, 8)).toBe(1);
  });

  it('el orden a 8 reyes es R > C > S > 7 > 6 > 5 > 4 > A', () => {
    const orden = cartas('R C S 7 6 5 4 A').map((c) => rango(c, 8));
    expect(orden).toEqual([...orden].sort((x, y) => y - x));
    expect(new Set(orden).size).toBe(8);
  });

  it('las figuras valen 10 y las demás su número', () => {
    expect([rey, caballo, sota].map((c) => valorJuego(c!, 8))).toEqual([10, 10, 10]);
    expect(cartas('7 6 5 4 A').map((c) => valorJuego(c, 8))).toEqual([7, 6, 5, 4, 1]);
  });

  it('a 4 reyes el tres y el dos valen lo suyo', () => {
    expect(rango(tres!, 4)).toBeLessThan(rango(rey!, 4));
    expect(rango(dos!, 4)).toBeGreaterThan(rango(as!, 4));
    expect(valorJuego(tres!, 4)).toBe(3);
    expect(valorJuego(dos!, 4)).toBe(2);
  });
});

describe('el mazo', () => {
  it('el reparto da 4 cartas a cada uno, alternando y empezando por la mano', () => {
    const mazo = crearMazo(Azar.conSemilla(1));
    const primeras = mazo.cartas.slice(0, 8);
    const reparto = repartir(mazo, 'rival');
    expect(reparto.rival).toEqual([primeras[0], primeras[2], primeras[4], primeras[6]]);
    expect(reparto.jugador).toEqual([primeras[1], primeras[3], primeras[5], primeras[7]]);
    expect(mazo.cartas).toHaveLength(32);
    expect(new Set(ids([...reparto.jugador, ...reparto.rival, ...mazo.cartas])).size).toBe(40);
  });

  it('robar saca las cartas del principio del mazo', () => {
    const mazo = crearMazo(Azar.conSemilla(2));
    const principio = mazo.cartas.slice(0, 3);
    expect(robar(mazo, 3, Azar.conSemilla(0)).robadas).toEqual(principio);
    expect(mazo.cartas).toHaveLength(37);
  });

  it('si se acaba el mazo se rebarajan los descartes anteriores, nunca los de la ronda en curso', () => {
    const azar = Azar.conSemilla(3);
    const usadas = new Set<string>();
    const viejos = cartas('R C S 7 6', usadas);
    const deEstaRonda = cartas('R R', usadas);
    const quedan = cartas('A', usadas);
    const mazo = { cartas: [...quedan], descartes: [...viejos], descartesRonda: [...deEstaRonda] };

    const { robadas, rebarajadas } = robar(mazo, 4, azar);
    expect(rebarajadas).toBe(5);
    expect(robadas[0]).toEqual(quedan[0]);
    expect(robadas).toHaveLength(4);
    for (const carta of robadas.slice(1)) expect(ids(viejos)).toContain(idCarta(carta));
    expect(mazo.descartesRonda).toEqual(deEstaRonda);
    expect(mazo.cartas).toHaveLength(2);
    expect(mazo.descartes).toHaveLength(0);
  });

  it('cerrar la ronda pasa sus descartes a los rebarajables', () => {
    const mazo = { cartas: [], descartes: cartas('R'), descartesRonda: cartas('C S') };
    cerrarRondaDeDescartes(mazo);
    expect(mazo.descartes).toHaveLength(3);
    expect(mazo.descartesRonda).toHaveLength(0);
  });
});
