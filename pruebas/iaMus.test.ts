import { describe, expect, it } from 'vitest';
import { RIVALES, type PatronCorte } from '../src/datos/rivales';
import { Azar } from '../src/nucleo/azar';
import { idCarta } from '../src/nucleo/carta';
import { cumplePatron, decidirMus, elegirDescarte } from '../src/nucleo/ia/mus';
import { cartas } from './ayudas';

const azar = () => Azar.conSemilla('mus');
const corta = (rival: keyof typeof RIVALES, mano: string) => decidirMus(RIVALES[rival].mus, cartas(mano), 8, azar()).corta;
const tira = (rival: keyof typeof RIVALES, mano: string) =>
  elegirDescarte(RIVALES[rival].mus, cartas(mano), 8).map(idCarta).sort();

describe('patrones de corte', () => {
  const casos: [PatronCorte, string[], string[]][] = [
    ['tresReyes', ['R R R 5', 'R 3 R 7', 'R R R R'], ['R R C 5']],
    ['treintaYUna', ['R C S A', 'R R 7 4', '7 7 7 S'], ['R R 7 5']],
    ['duplesConReyes', ['R R C C', 'R R A A', 'R R 3 3'], ['C C S S', 'R R C 5']],
    ['dosReyesYFigura', ['R R C 5', 'R R S 4', 'R 3 C 5'], ['R R 7 4', 'R C S 5']],
    ['parejaDeReyes', ['R R 5 6', '3 R 4 4'], ['R C 5 6']],
    ['tresPitos', ['A A 2 7', '2 2 2 R'], ['A A 4 7']],
    ['solomillo', ['R R R A', 'R R 3 2'], ['R R R R', 'R R A A']],
    ['treintaYUnaConPareja', ['R R 7 4'], ['R C S A']],
  ];
  for (const [patron, si, no] of casos) {
    it(patron, () => {
      for (const mano of si) expect(cumplePatron(patron, cartas(mano), 8), mano).toBe(true);
      for (const mano of no) expect(cumplePatron(patron, cartas(mano), 8), mano).toBe(false);
    });
  }
});

describe('cuándo corta cada rival', () => {
  it('la lista común: tres reyes, 31, duples con reyes, dos reyes y figura', () => {
    for (const mano of ['R R R 5', 'R C S A', 'R R C C', 'R R C 5', 'R R S 4']) expect(corta('bonifacio', mano), mano).toBe(true);
    // Ojo con el 31: R C 7 4 y R R 5 6 lo suman. Estas no.
    for (const mano of ['R C 6 4', 'A 4 5 6', 'R R 6 4', 'C C S S']) expect(corta('bonifacio', mano), mano).toBe(false);
  });

  it('Ruperto, impaciente, corta también con cualquier pareja de reyes', () => {
    expect(corta('ruperto', 'R R 6 4')).toBe(true);
    expect(corta('ruperto', 'R C 5 4')).toBe(false);
  });

  it('Doña Engracia solo corta con lo mejor', () => {
    expect(corta('engracia', 'R R R 5')).toBe(false);
    expect(corta('engracia', 'R R R A')).toBe(true);
    expect(corta('engracia', 'R R A A')).toBe(true);
    expect(corta('engracia', 'R R 7 4')).toBe(true);
    expect(corta('engracia', 'R C S A')).toBe(false);
  });

  it('Don Anselmo corta con tres pitos', () => {
    expect(corta('anselmo', 'A A 2 7')).toBe(true);
    expect(corta('ruperto', 'A A 2 7')).toBe(false);
  });

  it('Fulgencio corta de farol una de cada cuatro veces con manos malas', () => {
    const a = Azar.conSemilla('fulgencio');
    let cortes = 0;
    for (let i = 0; i < 4000; i++) if (decidirMus(RIVALES.fulgencio.mus, cartas('A 4 5 6'), 8, a).corta) cortes++;
    expect(cortes / 4000).toBeGreaterThan(0.22);
    expect(cortes / 4000).toBeLessThan(0.28);
  });

  it('dice por qué corta', () => {
    expect(decidirMus(RIVALES.ruperto.mus, cartas('R R R 5'), 8, azar()).motivo).toBe('tresReyes');
    expect(decidirMus(RIVALES.ruperto.mus, cartas('A 4 5 6'), 8, azar()).motivo).toBeNull();
  });
});

describe('qué descarta cada rival', () => {
  it('con R 5 A 6, Ruperto guarda el rey y Don Anselmo el as', () => {
    expect(tira('ruperto', 'R 5 A 6')).toEqual(['01_oros', '05_oros', '06_oros']);
    expect(tira('anselmo', 'R 5 A 6')).toEqual(['05_oros', '06_oros', '12_oros']);
  });

  it('Ruperto guarda las parejas', () => {
    expect(tira('ruperto', 'R 5 5 6')).toEqual(['06_oros']);
  });

  it('Fulgencio guarda figuras y sietes', () => {
    expect(tira('fulgencio', 'C 7 4 A')).toEqual(['01_oros', '04_oros']);
  });

  it('si quiere guardarlo todo, tira una: la más baja, o la más alta si busca la Chica', () => {
    expect(tira('ruperto', 'R R 5 5')).toEqual(['05_oros']);
    expect(tira('anselmo', 'A A 2 2')).toHaveLength(1);
  });

  it('siempre descarta entre 1 y 4 cartas propias, en cualquier mano', () => {
    const a = Azar.conSemilla('descartes');
    for (let n = 0; n < 2000; n++) {
      const mano = a.barajar(cartas('A 2 3 4 5 6 7 S C R')).slice(0, 4);
      for (const rival of Object.values(RIVALES)) {
        const descarte = elegirDescarte(rival.mus, mano, 8);
        expect(descarte.length).toBeGreaterThanOrEqual(1);
        expect(descarte.length).toBeLessThanOrEqual(4);
        for (const carta of descarte) expect(mano).toContainEqual(carta);
      }
    }
  });
});
