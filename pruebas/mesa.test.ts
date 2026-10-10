import { describe, expect, it } from 'vitest';
import { aplicarNovedades, mesaInicial, sacarTic, textoEnvite } from '../src/estado/mesa';
import { nuevaPartida, type Novedades, type ResultadoPartida } from '../src/estado/partida';
import type { EventoDuelo } from '../src/nucleo/eventos';
import { ES } from '../src/textos/es';

const base = () => mesaInicial(nuevaPartida('mesa').partida);
const con = (eventos: EventoDuelo[], extra: Partial<Novedades> = {}): ResultadoPartida => ({
  partida: base().partida,
  novedades: { eventos, tics: [], decision: null, seEnfada: false, ...extra },
});

describe('lo que enseña la mesa', () => {
  it('empieza con el saludo de Ruperto', () => {
    expect(base().bocadillo).toEqual(ES.rivales.ruperto.saludo);
  });

  it('lo que dice el rival va al bocadillo y lo del jugador a su etiqueta', () => {
    const tras = aplicarNovedades(
      base(),
      con([
        { tipo: 'envite', lance: 'grande', lado: 'jugador', accion: { tipo: 'envido', piedras: 2 } },
        { tipo: 'envite', lance: 'grande', lado: 'rival', accion: { tipo: 'mas', piedras: 5 } },
      ]),
    );
    expect(tras.delJugador).toBe('ENVIDO DOS');
    expect(tras.bocadillo.accion).toBe('CINCO MÁS');
    expect(ES.rivales.ruperto.frases.mas).toContain(tras.bocadillo.frase);
    expect(tras.cronica).toEqual(['Tú: envido dos', 'Ruperto: cinco más']);
  });

  it('las frases del rival van rotando', () => {
    const paso = (): EventoDuelo => ({ tipo: 'envite', lance: 'chica', lado: 'rival', accion: { tipo: 'paso' } });
    const una = aplicarNovedades(base(), con([paso()]));
    const otra = aplicarNovedades(una, con([paso()]));
    expect(una.bocadillo.frase).not.toBe(otra.bocadillo.frase);
  });

  it('la crónica guarda solo las últimas cinco líneas', () => {
    const eventos: EventoDuelo[] = Array.from({ length: 8 }, (_, i) => ({ tipo: 'deje', lance: 'grande', lado: 'jugador', piedras: i + 1, marcador: { jugador: 0, rival: 0 } }));
    const tras = aplicarNovedades(base(), con(eventos));
    expect(tras.cronica).toHaveLength(5);
    expect(tras.cronica.at(-1)).toBe('Cobras 8 por el «no quiero»');
  });

  it('el enfado se anuncia en el bocadillo', () => {
    const tras = aplicarNovedades(base(), con([], { seEnfada: true }));
    expect(tras.bocadillo).toEqual({ accion: ES.mesa.enfadado, frase: ES.rivales.ruperto.frases.enfado });
  });

  it('los tics se enseñan de uno en uno', () => {
    let mesa = aplicarNovedades(base(), con([], { tics: [{ id: 'rascaBarba', verdadero: true }, { id: 'arremanga', verdadero: false }] }));
    expect(mesa.colaTics).toHaveLength(2);
    mesa = sacarTic(mesa);
    expect(mesa.tic).toMatchObject({ id: 'rascaBarba', clave: 1 });
    mesa = sacarTic({ ...mesa, tic: null });
    expect(mesa.tic).toMatchObject({ id: 'arremanga', clave: 2 });
    expect(mesa.colaTics).toHaveLength(0);
    expect(sacarTic(mesa)).toBe(mesa);
  });

  it('nombra cada envite como se dice en la mesa', () => {
    expect(textoEnvite({ tipo: 'envido', piedras: 10 })).toBe('ENVIDO DIEZ');
    expect(textoEnvite({ tipo: 'mas', piedras: 2 })).toBe('DOS MÁS');
    expect(textoEnvite({ tipo: 'noQuiero' })).toBe('NO QUIERO');
    expect(textoEnvite({ tipo: 'ordago' })).toBe('¡ÓRDAGO!');
  });
});
