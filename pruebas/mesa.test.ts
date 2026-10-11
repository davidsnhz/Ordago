import { describe, expect, it } from 'vitest';
import { aplicarNovedades, mesaInicial, sacarTic, textoEnvite, ultimoDelRival } from '../src/estado/mesa';
import { nuevaPartida, type Novedades, type ResultadoPartida } from '../src/estado/partida';
import type { EventoDuelo } from '../src/nucleo/eventos';
import { ES } from '../src/textos/es';

const base = () => mesaInicial(nuevaPartida('mesa').partida);
const con = (eventos: EventoDuelo[], extra: Partial<Novedades> = {}): ResultadoPartida => ({
  partida: base().partida,
  novedades: {
    eventos,
    tics: [],
    decision: null,
    seEnfada: false,
    imponePenitencia: false,
    cambiosCara: [],
    seTeNota: false,
    seOfende: false,
    ...extra,
  },
});

describe('lo que enseña la mesa', () => {
  it('empieza con el saludo de Ruperto en el acta', () => {
    const { saludo } = ES.rivales.ruperto;
    expect(base().acta).toEqual([{ quien: 'rival', texto: saludo.accion, frase: saludo.frase }]);
  });

  it('cada cosa dicha va una vez al acta, y solo el rival lleva frase', () => {
    const tras = aplicarNovedades(
      base(),
      con([
        { tipo: 'envite', lance: 'grande', lado: 'jugador', accion: { tipo: 'envido', piedras: 2 } },
        { tipo: 'envite', lance: 'grande', lado: 'rival', accion: { tipo: 'mas', piedras: 5 } },
      ]),
    );
    const [, tuya, suya] = tras.acta;
    expect(tuya).toEqual({ quien: 'jugador', texto: 'ENVIDO DOS' });
    expect(suya).toMatchObject({ quien: 'rival', texto: 'CINCO MÁS' });
    expect(ES.rivales.ruperto.frases.mas).toContain(suya!.frase);
    expect(ultimoDelRival(tras.acta)).toBe(2);
  });

  it('las frases del rival van rotando', () => {
    const paso = (): EventoDuelo => ({ tipo: 'envite', lance: 'chica', lado: 'rival', accion: { tipo: 'paso' } });
    const una = aplicarNovedades(base(), con([paso()]));
    const otra = aplicarNovedades(una, con([paso()]));
    expect(una.acta.at(-1)!.frase).not.toBe(otra.acta.at(-1)!.frase);
  });

  it('cada mano empieza un acta nueva que dice quién es mano', () => {
    const reparto = (numeroMano: number, quienEsMano: 'jugador' | 'rival'): EventoDuelo => ({
      tipo: 'reparto',
      numeroMano,
      quienEsMano,
      cartas: { jugador: [], rival: [] },
    });
    const primera = aplicarNovedades(base(), con([reparto(1, 'rival')]));
    expect(primera.acta[0]).toEqual({ quien: null, texto: 'Mano 1: es mano Ruperto (habla primero y gana los empates)' });
    expect(primera.acta[1]).toMatchObject({ quien: 'rival', texto: ES.rivales.ruperto.saludo.accion });
    const segunda = aplicarNovedades(primera, con([reparto(2, 'jugador')]));
    expect(segunda.acta).toEqual([{ quien: null, texto: 'Mano 2: eres mano' }]);
  });

  it('lo que pasa en la mesa se apunta sin dueño', () => {
    const tras = aplicarNovedades(
      base(),
      con([
        { tipo: 'finLance', lance: 'grande', modo: 'envites', resultado: { tipo: 'enPaso' } },
        { tipo: 'finLance', lance: 'chica', modo: 'envites', resultado: { tipo: 'querido', piedras: 5, envidador: 'rival' } },
        { tipo: 'deje', lance: 'pares', lado: 'jugador', piedras: 1, marcador: { jugador: 1, rival: 0 } },
      ]),
    );
    expect(tras.acta.slice(1).map((l) => [l.quien, l.texto])).toEqual([
      [null, 'Grande en paso: se cobra en el recuento'],
      [null, 'Chica: 5 piedras queridas, se ven en el recuento'],
      [null, 'Pares: cobras 1 por el «no quiero»'],
    ]);
  });

  it('el trato: lo propone él, lo explica la mesa y responde a lo que digas', () => {
    const fulgencio = mesaInicial(nuevaPartida('trato', 'fulgencio').partida);
    const tras = aplicarNovedades(fulgencio, {
      ...con([
        { tipo: 'trato', ofrece: 'rival' },
        { tipo: 'tratoResuelto', lado: 'jugador', acepta: true },
      ]),
      partida: fulgencio.partida,
    });
    expect(tras.acta.slice(1).map((l) => [l.quien, l.texto])).toEqual([
      ['rival', ES.mesa.pideTrato],
      [null, ES.mesa.tratoExplica('Fulgencio')],
      ['jugador', ES.mesa.botones.aceptarTrato],
      ['rival', ES.mesa.tratoHecho],
    ]);
  });

  it('el acta no crece sin límite', () => {
    const eventos: EventoDuelo[] = Array.from({ length: 60 }, (_, i) => ({ tipo: 'deje', lance: 'grande', lado: 'jugador', piedras: i + 1, marcador: { jugador: 0, rival: 0 } }));
    const tras = aplicarNovedades(base(), con(eventos));
    expect(tras.acta).toHaveLength(40);
    expect(tras.acta.at(-1)!.texto).toBe('Grande: cobras 60 por el «no quiero»');
  });

  it('el enfado lo dice él y la mesa explica qué significa', () => {
    const tras = aplicarNovedades(base(), con([], { seEnfada: true }));
    expect(tras.acta.slice(-2)).toEqual([
      { quien: 'rival', texto: ES.mesa.enfadado, frase: ES.rivales.ruperto.frases.enfado },
      { quien: null, texto: ES.mesa.acta.enfadado('Ruperto') },
    ]);
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
