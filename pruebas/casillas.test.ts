import { describe, expect, it } from 'vitest';
import { casillasDe } from '../src/estado/casillas';
import { a, dueloCon, jugar, pasanLosDos } from './ayudas';

// Tú (mano) llevas pareja de reyes y 33 de juego; el rival, ni pares ni juego.
const reparto = { jugador: 'R R 7 6', rival: 'A 4 5 6' };

describe('las casillas de los lances (mesa nueva)', () => {
  it('antes de cortar, las cuatro están por jugar y no se sabe quién lleva qué', () => {
    const casillas = casillasDe(dueloCon(reparto));
    expect(casillas.map((c) => c.lance)).toEqual(['grande', 'chica', 'pares', 'juego']);
    expect(casillas.every((c) => c.estado.tipo === 'falta' && !c.actual && c.tienen === null && c.cobros.length === 0)).toBe(true);
  });

  it('la que se juega enseña lo envidado; al quererlo, se queda con lo querido', () => {
    const envidado = jugar(dueloCon(reparto), [a.corto('jugador'), a.envido('jugador', 3)]).estado;
    const [grande] = casillasDe(envidado);
    expect(grande).toMatchObject({ lance: 'grande', actual: true, estado: { tipo: 'enJuego', piedras: 3, ordago: false } });

    const querido = jugar(envidado, [a.quiero('rival')]).estado;
    const [g, chica] = casillasDe(querido);
    expect(g).toMatchObject({ actual: false, estado: { tipo: 'querido', piedras: 3 } });
    expect(chica).toMatchObject({ actual: true, estado: { tipo: 'enJuego', piedras: 0 } });
  });

  it('un «no quiero» dice quién se lo llevó', () => {
    const { estado } = jugar(dueloCon(reparto), [a.corto('jugador'), a.envido('jugador'), a.noQuiero('rival')]);
    expect(casillasDe(estado)[0]!.estado).toMatchObject({ tipo: 'noQuerido', ganador: 'jugador' });
  });

  it('al acabar la mano: en paso, quién lleva pares y juego, y lo que cobra cada uno en el orden del recuento', () => {
    const { estado } = jugar(dueloCon(reparto), [a.corto('jugador'), a.envido('jugador'), a.quiero('rival'), ...pasanLosDos('jugador')]);
    expect(estado.fase).toBe('finMano');
    const [grande, chica, pares, juego] = casillasDe(estado);
    expect(chica!.estado).toEqual({ tipo: 'enPaso' });
    expect(pares).toMatchObject({ estado: { tipo: 'soloUno', quien: 'jugador' }, tienen: { jugador: true, rival: false } });
    expect(juego).toMatchObject({ estado: { tipo: 'soloUno', quien: 'jugador' }, tienen: { jugador: true, rival: false } });

    const todos = [grande, chica, pares, juego].flatMap((c) => c!.cobros);
    expect(todos.map((c) => c.orden).sort()).toEqual(estado.recuento!.cobros.map((_, i) => i));
    expect(grande!.cobros[0]).toMatchObject({ cobro: { lance: 'grande', lado: 'jugador', concepto: 'envite' }, apuntado: true });
    expect(pares!.cobros.every((c) => c.cobro.lado === 'jugador')).toBe(true);
  });

  it('si nadie lleva juego, la cuarta casilla es el Punto', () => {
    const sinJuego = { jugador: 'R 7 6 5', rival: 'A 4 5 6' };
    const { estado } = jugar(dueloCon(sinJuego), [a.corto('jugador'), ...pasanLosDos('jugador'), ...pasanLosDos('jugador')]);
    const casillas = casillasDe(estado);
    expect(casillas[2]!.estado).toEqual({ tipo: 'nadie' });
    expect(casillas[3]).toMatchObject({ lance: 'punto', actual: true, tienen: null });
  });
});
