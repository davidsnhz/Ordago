import { describe, expect, it } from 'vitest';
import { aplicarNovedades, mesaInicial, narrarEnvite, poseDelRival, reaccionDe, sacarTic, ultimoDelRival } from '../src/estado/mesa';
import { nuevaPartida, type Novedades, type ResultadoPartida } from '../src/estado/partida';
import type { EventoDuelo } from '../src/nucleo/eventos';
import type { AccionDuelo, EstadoDuelo } from '../src/nucleo/duelo';
import { ES } from '../src/textos/es';
import { a, dueloCon, jugar, pasanLosDos } from './ayudas';

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
    animo: null,
    efecto: null,
    medalla: false,
    ...extra,
  },
});

describe('lo que enseña la mesa', () => {
  it('empieza con Agustín sentándose a la mesa y su saludo', () => {
    const { saludo } = ES.rivales.ruperto;
    expect(base().acta).toEqual([{ quien: 'rival', texto: 'Agustín se sienta a la mesa', frase: saludo.frase }]);
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
    expect(tuya).toEqual({ quien: 'jugador', texto: 'Has envidado dos.' });
    expect(suya).toMatchObject({ quien: 'rival', texto: 'Agustín sube cinco más' });
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
    expect(primera.acta[0]).toEqual({ quien: null, texto: 'Mano 1: es mano Agustín (habla primero y gana los empates)', aviso: true });
    expect(primera.acta[1]).toMatchObject({ quien: 'rival', texto: 'Agustín se sienta a la mesa' });
    const segunda = aplicarNovedades(primera, con([reparto(2, 'jugador')]));
    expect(segunda.acta).toEqual([{ quien: null, texto: 'Mano 2: eres mano', aviso: true }]);
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
      ['rival', 'Aurelio propone un trato'],
      [null, ES.mesa.tratoExplica('Aurelio')],
      ['jugador', 'Has aceptado el trato.'],
      ['rival', 'Aurelio cierra el trato'],
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
      { quien: 'rival', texto: '¡Agustín se ha enfadado!', frase: ES.rivales.ruperto.frases.enfado },
      { quien: null, texto: 'Durante dos manos lo aceptará todo', aviso: true },
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

  it('cuenta cada envite: lo tuyo en pasado, lo del rival en presente', () => {
    expect(narrarEnvite({ tipo: 'envido', piedras: 10 }, null)).toBe('Has envidado diez.');
    expect(narrarEnvite({ tipo: 'envido', piedras: 10 }, 'Agustín')).toBe('Agustín envida diez');
    expect(narrarEnvite({ tipo: 'mas', piedras: 2 }, 'Doña Ignacia')).toBe('Doña Ignacia sube dos más');
    expect(narrarEnvite({ tipo: 'paso' }, null)).toBe('Has pasado.');
    expect(narrarEnvite({ tipo: 'quiero' }, 'Aurelio')).toBe('Aurelio quiere');
    expect(narrarEnvite({ tipo: 'noQuiero' }, null)).toBe('No has querido.');
    expect(narrarEnvite({ tipo: 'ordago' }, 'Don Rodrigo')).toBe('¡Don Rodrigo echa un órdago!');
  });

  it('cuenta el mus, los descartes y las declaraciones', () => {
    const tras = aplicarNovedades(
      base(),
      con([
        { tipo: 'mus', lado: 'jugador', quiereMus: true },
        { tipo: 'mus', lado: 'rival', quiereMus: false },
        { tipo: 'descarte', lado: 'rival', descartadas: [{ numero: 1, palo: 'oros' }], robadas: [{ numero: 12, palo: 'oros' }] },
        { tipo: 'declaracion', lance: 'pares', lado: 'jugador', tiene: false },
        { tipo: 'declaracion', lance: 'juego', lado: 'rival', tiene: true },
      ]),
    );
    expect(tras.acta.slice(1).map((l) => l.texto)).toEqual([
      'Has pedido mus.',
      'Agustín corta',
      'Agustín pide una carta',
      'No llevas pares.',
      'Agustín lleva juego',
    ]);
  });
});

describe('la cara que pone el rival', () => {
  /** La cara que pone tras jugar las acciones, con su postura de partida. */
  const reaccion = (reparto: { jugador: string; rival: string }, acciones: AccionDuelo[]) => {
    const { estado, eventos } = jugar(dueloCon(reparto), acciones);
    return reaccionDe(eventos, { ...base().partida, duelo: estado });
  };
  const FLOJA = 'A 4 5 6';
  const BUENA = 'R R R 7';

  it('se sorprende cuando le echas un órdago', () => {
    expect(reaccion({ jugador: BUENA, rival: 'C C 5 4' }, [a.corto('jugador'), a.ordago('jugador')])).toEqual({ tipo: 'sorprendido', final: false });
  });

  it('al acabar el duelo se ríe si gana y se enfada si pierde, y se queda así', () => {
    expect(reaccion({ jugador: FLOJA, rival: BUENA }, [a.corto('jugador'), a.ordago('jugador'), a.quiero('rival')])).toEqual({ tipo: 'riendo', final: true });
    expect(reaccion({ jugador: BUENA, rival: FLOJA }, [a.corto('jugador'), a.ordago('jugador'), a.quiero('rival')])).toEqual({ tipo: 'enfadado', final: true });
  });

  it('se ríe cuando te pilla un farol y se enfada cuando le pillas el suyo', () => {
    const tuFarol = [a.corto('jugador'), a.envido('jugador'), a.quiero('rival'), ...pasanLosDos('jugador'), ...pasanLosDos('jugador')];
    expect(reaccion({ jugador: FLOJA, rival: 'C C 5 4' }, tuFarol)).toEqual({ tipo: 'riendo', final: false });
    const suFarol = [a.corto('jugador'), a.paso('jugador'), a.envido('rival'), a.quiero('jugador'), ...pasanLosDos('jugador')];
    expect(reaccion({ jugador: BUENA, rival: FLOJA }, suFarol)).toEqual({ tipo: 'enfadado', final: false });
  });

  it('lo demás no le cambia la cara, y la última se queda hasta que se le pase', () => {
    expect(reaccion({ jugador: BUENA, rival: FLOJA }, [a.corto('jugador'), a.envido('jugador')])).toBeNull();
    const fin: EventoDuelo = { tipo: 'finDuelo', ganador: 'rival', motivo: 'piedras', marcador: { jugador: 4, rival: 20 } };
    const tras = aplicarNovedades(base(), con([fin]));
    expect(tras.reaccion).toMatchObject({ tipo: 'riendo', final: true });
    const paso: EventoDuelo = { tipo: 'envite', lance: 'chica', lado: 'rival', accion: { tipo: 'paso' } };
    expect(aplicarNovedades(tras, con([paso])).reaccion).toBe(tras.reaccion);
  });

  it('su postura: crecido o arrugado según el marcador (Chema); al acabar, como siempre', () => {
    const p = nuevaPartida('pose', 'chema').partida;
    const con = (rival: number, jugador: number, fase: EstadoDuelo['fase'] = p.duelo.fase) => ({ ...p, duelo: { ...p.duelo, fase, marcador: { rival, jugador } } });
    expect(poseDelRival(con(0, 0))).toBeNull();
    expect(poseDelRival(con(12, 6))).toBe('crecido');
    expect(poseDelRival(con(4, 11))).toBe('arrugado');
    expect(poseDelRival(con(20, 6, 'finDuelo'))).toBeNull();
    // Lucía no tiene ánimo.
    const lucia = nuevaPartida('pose', 'lucia').partida;
    expect(poseDelRival({ ...lucia, duelo: { ...lucia.duelo, marcador: { rival: 12, jugador: 2 } } })).toBeNull();
  });
});

