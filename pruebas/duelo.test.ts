import { describe, expect, it } from 'vitest';
import { idCarta, type Carta } from '../src/nucleo/carta';
import { ErrorJugada, type Lado } from '../src/nucleo/comun';
import { accionesValidas, aplicarAccion, crearDuelo, type AccionDuelo, type EstadoDuelo } from '../src/nucleo/duelo';
import type { EventoDuelo } from '../src/nucleo/eventos';
import type { Modificador } from '../src/nucleo/modificadores';
import { a, cartas, congelar, dueloCon, jugar, nuevoDuelo, pasanLosDos, todasLasCartas } from './ayudas';

const tipos = (eventos: EventoDuelo[]) => eventos.map((e) => e.tipo);
const ids = (estado: EstadoDuelo, lado: Lado) => estado.cartas[lado].map(idCarta);

const MOZA: Modificador = { id: 'moza', piedrasIniciales: (lado) => (lado === 'jugador' ? 2 : 0) };
const TAHUR: Modificador = { id: 'tahur', rondasMus: (rondas) => rondas + 1 };
const BOINA: Modificador = { id: 'boina', ganaEmpate: () => 'jugador' };

/** Corta la mano y pasa la Grande y la Chica. */
const hastaPares = (mano: Lado = 'jugador'): AccionDuelo[] => [a.corto(mano), ...pasanLosDos(mano), ...pasanLosDos(mano)];

describe('inicio del duelo', () => {
  it('reparte 4 cartas a cada uno y espera el mus de la mano', () => {
    const { estado, eventos } = crearDuelo({ semilla: 1, quienEsMano: 'rival' });
    expect(estado).toMatchObject({ fase: 'mus', turno: 'rival', quienEsMano: 'rival', numeroMano: 1 });
    expect(estado.marcador).toEqual({ jugador: 0, rival: 0 });
    expect(estado.cartas.jugador).toHaveLength(4);
    expect(estado.cartas.rival).toHaveLength(4);
    expect(estado.mazo.cartas).toHaveLength(32);
    expect(tipos(eventos)).toEqual(['reparto']);
  });

  it('la primera mano se sortea con la semilla, de forma reproducible', () => {
    const manos = Array.from({ length: 40 }, (_, i) => crearDuelo({ semilla: i }).estado.quienEsMano);
    expect(new Set(manos)).toEqual(new Set(['jugador', 'rival']));
    expect(crearDuelo({ semilla: 7 }).estado).toEqual(crearDuelo({ semilla: 7 }).estado);
  });

  it('un modificador puede dar piedras iniciales (la Moza)', () => {
    expect(crearDuelo({ semilla: 1, modificadores: [MOZA] }).estado.marcador).toEqual({ jugador: 2, rival: 0 });
  });

  it('las reglas se pueden cambiar y se guardan en el estado', () => {
    const estado = crearDuelo({ semilla: 1, reglas: { piedrasParaGanar: 10 } }).estado;
    expect(estado.reglas.piedrasParaGanar).toBe(10);
    expect(estado.reglas.rondasMus).toBe(2);
  });
});

describe('el mus', () => {
  const base = () => dueloCon({ jugador: 'A 4 5 6', rival: 'C S 7 7', mazo: 'R R R R' });

  it('si la mano corta, empieza la Grande hablando la mano', () => {
    const { estado, eventos } = jugar(base(), [a.corto('jugador')]);
    expect(estado).toMatchObject({ fase: 'envite', lanceActual: 'grande', turno: 'jugador' });
    expect(tipos(eventos)).toEqual(['mus', 'inicioLance']);
  });

  it('si la mano pide mus y el otro corta, empieza la Grande', () => {
    const { estado } = jugar(base(), [a.mus('jugador'), a.corto('rival')]);
    expect(estado).toMatchObject({ fase: 'envite', lanceActual: 'grande', turno: 'jugador' });
  });

  it('no se puede hablar fuera de turno', () => {
    expect(() => jugar(base(), [a.mus('rival')])).toThrow(ErrorJugada);
  });

  it('mus y mus: descarta primero la mano, y cada carta nueva ocupa el sitio de la descartada', () => {
    let { estado } = jugar(base(), [a.mus('jugador'), a.mus('rival')]);
    expect(estado).toMatchObject({ fase: 'descarte', turno: 'jugador' });
    expect(() => jugar(estado, [a.descartar('rival', 'C')])).toThrow(ErrorJugada);

    const resultado = jugar(estado, [a.descartar('jugador', '4o 5o')]);
    estado = resultado.estado;
    expect(ids(estado, 'jugador')).toEqual(['01_oros', '12_oros', '12_copas', '06_oros']);
    expect(resultado.eventos[0]).toMatchObject({ tipo: 'descarte', lado: 'jugador' });
    expect(estado.turno).toBe('rival');

    estado = jugar(estado, [a.descartar('rival', 'Co')]).estado;
    expect(ids(estado, 'rival')[0]).toBe('12_espadas');
    expect(estado).toMatchObject({ fase: 'mus', turno: 'jugador', rondasMus: 1 });
  });

  it('tras la segunda ronda de descartes se juega sin volver a preguntar', () => {
    const estado = jugarRondasDeMus(base(), 2);
    expect(estado).toMatchObject({ fase: 'envite', lanceActual: 'grande', rondasMus: 2 });
  });

  it('con una ronda extra (el Tahúr) se permiten tres', () => {
    const tras2 = jugarRondasDeMus(base(), 2, [TAHUR]);
    expect(tras2).toMatchObject({ fase: 'mus', rondasMus: 2 });
    expect(jugarRondasDeMus(tras2, 1, [TAHUR])).toMatchObject({ fase: 'envite', rondasMus: 3 });
  });

  it('con 0 rondas de mus se va directo a la Grande', () => {
    const { estado } = crearDuelo({ semilla: 1, reglas: { rondasMus: 0 } });
    expect(estado).toMatchObject({ fase: 'envite', lanceActual: 'grande' });
  });

  const asDeOros = cartas('Ao')[0]!;
  const descartesIlegales: [string, Carta[]][] = [
    ['ninguna carta', []],
    ['cinco cartas', cartas('Ao 4o 5o 6o Ro')],
    ['una carta ajena', cartas('Co')],
    ['la misma carta dos veces', [asDeOros, asDeOros]],
  ];
  for (const [que, lista] of descartesIlegales) {
    it(`no se puede descartar ${que}, y el estado no cambia`, () => {
      const estado = congelar(jugar(base(), [a.mus('jugador'), a.mus('rival')]).estado);
      expect(() => aplicarAccion(estado, { tipo: 'descartar', lado: 'jugador', cartas: lista })).toThrow(ErrorJugada);
    });
  }

  it('si se acaba el mazo, se rebarajan los descartes de rondas anteriores', () => {
    let estado = crearDuelo({ semilla: 3, quienEsMano: 'jugador', reglas: { rondasMus: 10 } }).estado;
    const eventos: EventoDuelo[] = [];
    for (let ronda = 1; ronda <= 5; ronda++) {
      const descartadasJugador = [...estado.cartas.jugador];
      for (const accion of [a.mus('jugador'), a.mus('rival')]) estado = aplicarAccion(estado, accion).estado;
      for (const lado of ['jugador', 'rival'] as const) {
        const r = aplicarAccion(estado, { tipo: 'descartar', lado, cartas: [...estado.cartas[lado]] });
        estado = r.estado;
        eventos.push(...r.eventos);
        if (ronda === 5 && lado === 'jugador') {
          expect(r.eventos[0]).toEqual({ tipo: 'rebarajado', cartas: 32 });
          // No le vuelven las cartas que acaba de tirar.
          for (const carta of estado.cartas.jugador) expect(descartadasJugador.map(idCarta)).not.toContain(idCarta(carta));
        }
      }
      const todas = todasLasCartas(estado).map(idCarta);
      expect(todas).toHaveLength(40);
      expect(new Set(todas).size).toBe(40);
    }
    expect(eventos.filter((e) => e.tipo === 'rebarajado')).toHaveLength(1);
  });
});

describe('la secuencia de lances', () => {
  it('Pares y Juego sin envites si solo uno tiene: se cobran en el recuento', () => {
    // Jugador: pareja de reyes y 31. Rival: nada.
    const { estado, eventos } = jugar(dueloCon({ jugador: 'R R 5 6', rival: 'A 4 5 7' }), hastaPares());
    expect(estado.fase).toBe('finMano');
    expect(estado.lances.map((l) => [l.lance, l.modo])).toEqual([
      ['grande', 'envites'],
      ['chica', 'envites'],
      ['pares', 'soloUno'],
      ['juego', 'soloUno'],
    ]);
    expect(eventos.filter((e) => e.tipo === 'declaracion')).toEqual([
      { tipo: 'declaracion', lance: 'pares', lado: 'jugador', tiene: true },
      { tipo: 'declaracion', lance: 'pares', lado: 'rival', tiene: false },
      { tipo: 'declaracion', lance: 'juego', lado: 'jugador', tiene: true },
      { tipo: 'declaracion', lance: 'juego', lado: 'rival', tiene: false },
    ]);
    // Grande 1 (jugador) · Chica 1 (rival) · pareja 1 · 31 = 3.
    expect(estado.marcador).toEqual({ jugador: 5, rival: 1 });
  });

  it('declara primero la mano', () => {
    const { eventos } = jugar(dueloCon({ jugador: 'R R 5 6', rival: 'A 4 5 7' }, { quienEsMano: 'rival' }), hastaPares('rival'));
    const declaraciones = eventos.filter((e) => e.tipo === 'declaracion');
    expect(declaraciones.map((e) => e.lado)).toEqual(['rival', 'jugador', 'rival', 'jugador']);
  });

  it('si nadie tiene pares no se juegan', () => {
    const { estado } = jugar(dueloCon({ jugador: 'R C 5 4', rival: 'A S 6 7' }), hastaPares());
    expect(estado.lances[2]).toMatchObject({ lance: 'pares', modo: 'nadie' });
  });

  it('si nadie tiene juego se juega al Punto, con envites', () => {
    const { estado, eventos } = jugar(dueloCon({ jugador: 'R C 5 4', rival: 'A S 6 7' }), hastaPares());
    expect(estado).toMatchObject({ fase: 'envite', lanceActual: 'punto', turno: 'jugador' });
    expect(eventos.filter((e) => e.tipo === 'inicioLance').map((e) => e.lance)).toEqual([
      'grande',
      'chica',
      'pares',
      'juego',
      'punto',
    ]);
  });

  it('si los dos tienen pares, se envida a Pares', () => {
    const { estado } = jugar(dueloCon({ jugador: 'R R 5 4', rival: 'A A 6 7' }), hastaPares());
    expect(estado).toMatchObject({ fase: 'envite', lanceActual: 'pares' });
  });

  it('si los dos tienen juego, se envida a Juego', () => {
    // Pares: solo el jugador. Juego: los dos (31 y 31).
    const { estado } = jugar(dueloCon({ jugador: 'R R 7 4', rival: 'C S 6 5' }), hastaPares());
    expect(estado).toMatchObject({ fase: 'envite', lanceActual: 'juego' });
    expect(estado.lances[2]).toMatchObject({ lance: 'pares', modo: 'soloUno' });
  });
});

describe('una mano completa', () => {
  it('calcula el marcador final como en la mesa', () => {
    // Jugador (mano): R R C 4 → pareja de reyes, 34 de juego. Rival: A A 5 6 → pareja de ases, 13.
    const { estado, eventos } = jugar(dueloCon({ jugador: 'R R C 4', rival: 'A A 5 6' }), [
      a.corto('jugador'),
      // Grande: envido y quiero (gana el jugador).
      a.envido('jugador'),
      a.quiero('rival'),
      // Chica: en paso (gana el rival).
      ...pasanLosDos('jugador'),
      // Pares: envido, cinco más, no quiero → el rival cobra 2 al momento y su pareja en el recuento.
      a.envido('jugador'),
      a.mas('rival', 3),
      a.noQuiero('jugador'),
      // Juego: solo lo tiene el jugador.
    ]);

    expect(eventos.find((e) => e.tipo === 'deje')).toMatchObject({ lado: 'rival', piedras: 2, marcador: { jugador: 0, rival: 2 } });
    expect(estado.recuento?.cobros).toEqual([
      { lance: 'grande', lado: 'jugador', piedras: 2, concepto: 'envite' },
      { lance: 'chica', lado: 'rival', piedras: 1, concepto: 'enPaso' },
      { lance: 'pares', lado: 'rival', piedras: 1, concepto: 'pares' },
      { lance: 'juego', lado: 'jugador', piedras: 2, concepto: 'juego' },
    ]);
    expect(estado.recuento?.ganadores).toEqual({ grande: 'jugador', chica: 'rival', pares: 'rival', juego: 'jugador' });
    expect(estado.marcador).toEqual({ jugador: 4, rival: 4 });
    expect(estado).toMatchObject({ fase: 'finMano', turno: null });
    expect(tipos(eventos)).toEqual([
      'mus',
      'inicioLance', 'envite', 'envite', 'finLance',
      'inicioLance', 'envite', 'envite', 'finLance',
      'inicioLance', 'declaracion', 'declaracion', 'envite', 'envite', 'envite', 'deje', 'finLance',
      'inicioLance', 'declaracion', 'declaracion', 'finLance',
      'recuento',
      'finMano',
    ]);
  });

  it('a 19–18 el jugador gana en el recuento con la Chica, antes de que el rival cobre pares y juego', () => {
    const { estado, eventos } = jugar(
      dueloCon({ jugador: 'A 4 5 6', rival: 'R R R 7' }, { marcador: { jugador: 19, rival: 18 } }),
      hastaPares(),
    );
    expect(estado).toMatchObject({ fase: 'finDuelo', ganador: 'jugador', motivoFin: 'piedras' });
    expect(estado.marcador).toEqual({ jugador: 20, rival: 19 });
    expect(estado.recuento).toMatchObject({ aplicados: 2 });
    expect(estado.recuento?.cobros).toHaveLength(4);
    expect(tipos(eventos).slice(-2)).toEqual(['recuento', 'finDuelo']);
  });
});

describe('dejes y fin del duelo a 20', () => {
  it('el «no quiero» se cobra al momento', () => {
    const { estado } = jugar(dueloCon({ jugador: 'R R 5 4', rival: 'A A 6 7' }), [
      a.corto('jugador'),
      a.envido('jugador'),
      a.noQuiero('rival'),
    ]);
    expect(estado.marcador).toEqual({ jugador: 1, rival: 0 });
    expect(estado).toMatchObject({ fase: 'envite', lanceActual: 'chica' });
  });

  it('un deje que llega a 20 acaba el duelo en el acto', () => {
    const { estado, eventos } = jugar(
      dueloCon({ jugador: 'R R 5 4', rival: 'A A 6 7' }, { marcador: { jugador: 19, rival: 10 } }),
      [a.corto('jugador'), a.envido('jugador'), a.noQuiero('rival')],
    );
    expect(estado).toMatchObject({ fase: 'finDuelo', ganador: 'jugador', motivoFin: 'piedras', turno: null });
    expect(estado.marcador.jugador).toBe(20);
    expect(estado.lances).toHaveLength(1);
    expect(tipos(eventos)).toEqual(['mus', 'inicioLance', 'envite', 'envite', 'deje', 'finLance', 'finDuelo']);
  });

  it('tras el fin del duelo no se acepta ninguna acción', () => {
    const { estado } = jugar(
      dueloCon({ jugador: 'R R 5 4', rival: 'A A 6 7' }, { marcador: { jugador: 19, rival: 10 } }),
      [a.corto('jugador'), a.envido('jugador'), a.noQuiero('rival')],
    );
    expect(accionesValidas(estado)).toEqual({ lado: null, opciones: [] });
    expect(() => aplicarAccion(estado, a.siguienteMano())).toThrow(ErrorJugada);
    expect(() => aplicarAccion(estado, a.paso('rival'))).toThrow(ErrorJugada);
  });
});

describe('el órdago', () => {
  it('querido: se comparan las cartas de ese lance y el ganador se lleva el duelo', () => {
    const { estado, eventos } = jugar(dueloCon({ jugador: 'R R R 7', rival: 'R C C 4' }), [
      a.corto('jugador'),
      a.ordago('jugador'),
      a.quiero('rival'),
    ]);
    expect(estado).toMatchObject({ fase: 'finDuelo', ganador: 'jugador', motivoFin: 'ordago' });
    expect(estado.lances).toHaveLength(1);
    expect(eventos.find((e) => e.tipo === 'ordago')).toMatchObject({ lance: 'grande', lanzador: 'jugador', ganador: 'jugador' });
    expect(tipos(eventos).slice(-3)).toEqual(['finLance', 'ordago', 'finDuelo']);
  });

  it('quien lo tira puede perderlo', () => {
    const { estado } = jugar(dueloCon({ jugador: 'R R R 7', rival: 'R C C 4' }), [
      a.corto('jugador'),
      a.paso('jugador'),
      a.ordago('rival'),
      a.quiero('jugador'),
    ]);
    expect(estado.ganador).toBe('jugador');
  });

  it('en empate gana la mano, aunque el órdago lo tirara el otro', () => {
    const { estado } = jugar(dueloCon({ jugador: 'R C 7 4', rival: '3 C 7 4' }), [
      a.corto('jugador'),
      a.paso('jugador'),
      a.ordago('rival'),
      a.quiero('jugador'),
    ]);
    expect(estado.ganador).toBe('jugador');
  });

  it('con la Boina, el jugador gana el empate aunque no sea mano', () => {
    const acciones = [a.corto('rival'), a.ordago('rival'), a.quiero('jugador')];
    const sinBoina = jugar(dueloCon({ jugador: 'R C 7 4', rival: '3 C 7 4' }, { quienEsMano: 'rival' }), acciones);
    const conBoina = jugar(dueloCon({ jugador: 'R C 7 4', rival: '3 C 7 4' }, { quienEsMano: 'rival' }), acciones, [BOINA]);
    expect(sinBoina.estado.ganador).toBe('rival');
    expect(conBoina.estado.ganador).toBe('jugador');
  });

  it('a Pares se comparan los pares', () => {
    const { estado } = jugar(dueloCon({ jugador: 'A A 4 4', rival: 'R R R 7' }), [
      ...hastaPares(),
      a.ordago('jugador'),
      a.quiero('rival'),
    ]);
    expect(estado).toMatchObject({ ganador: 'jugador', motivoFin: 'ordago' });
  });

  it('no querido: quien lo tiró cobra 1 y la mano sigue', () => {
    const { estado } = jugar(dueloCon({ jugador: 'A 4 5 6', rival: 'R R R 7' }), [
      a.corto('jugador'),
      a.ordago('jugador'),
      a.noQuiero('rival'),
    ]);
    expect(estado.marcador).toEqual({ jugador: 1, rival: 0 });
    expect(estado).toMatchObject({ fase: 'envite', lanceActual: 'chica' });
  });
});

describe('entre manos', () => {
  const terminada = () => jugar(dueloCon({ jugador: 'R R 5 6', rival: 'A 4 5 7' }), hastaPares()).estado;

  it('al acabar la mano se espera «siguienteMano»', () => {
    const estado = terminada();
    expect(accionesValidas(estado)).toEqual({ lado: null, opciones: [{ tipo: 'siguienteMano' }] });
    expect(() => aplicarAccion(estado, a.mus('jugador'))).toThrow(ErrorJugada);
  });

  it('la mano pasa al otro y se reparte con la baraja completa', () => {
    const { estado, eventos } = jugar(terminada(), [a.siguienteMano()]);
    expect(estado).toMatchObject({ quienEsMano: 'rival', turno: 'rival', numeroMano: 2, fase: 'mus', rondasMus: 0 });
    expect(estado.lances).toEqual([]);
    expect(estado.recuento).toBeNull();
    expect(estado.mazo.cartas).toHaveLength(32);
    expect(new Set(todasLasCartas(estado).map(idCarta)).size).toBe(40);
    expect(eventos).toHaveLength(1);
    expect(eventos[0]).toMatchObject({ tipo: 'reparto', numeroMano: 2, quienEsMano: 'rival' });
  });

  it('no se puede repartir otra mano a mitad de una', () => {
    expect(() => aplicarAccion(nuevoDuelo(), a.siguienteMano())).toThrow(ErrorJugada);
  });
});

describe('acciones válidas y fases', () => {
  it('cada fase ofrece lo suyo', () => {
    const inicio = dueloCon({ jugador: 'R R 5 4', rival: 'A A 6 7' });
    expect(accionesValidas(inicio)).toEqual({ lado: 'jugador', opciones: [{ tipo: 'mus' }, { tipo: 'corto' }] });

    const descarte = jugar(inicio, [a.mus('jugador'), a.mus('rival')]).estado;
    expect(accionesValidas(descarte)).toEqual({ lado: 'jugador', opciones: [{ tipo: 'descartar', minimo: 1, maximo: 4 }] });

    const grande = jugar(inicio, [a.corto('jugador')]).estado;
    expect(accionesValidas(grande).opciones.map((o) => o.tipo)).toEqual(['paso', 'envido', 'ordago']);

    const envidado = jugar(grande, [a.envido('jugador')]).estado;
    expect(accionesValidas(envidado)).toMatchObject({ lado: 'rival' });
    expect(accionesValidas(envidado).opciones.map((o) => o.tipo)).toEqual(['quiero', 'noQuiero', 'mas', 'ordago']);
  });

  it('las acciones de otra fase se rechazan', () => {
    const inicio = dueloCon({ jugador: 'R R 5 4', rival: 'A A 6 7' });
    expect(() => aplicarAccion(inicio, a.paso('jugador'))).toThrow(ErrorJugada);
    expect(() => aplicarAccion(inicio, a.descartar('jugador', 'Ro'))).toThrow(ErrorJugada);
    const grande = jugar(inicio, [a.corto('jugador')]).estado;
    expect(() => aplicarAccion(grande, a.mus('jugador'))).toThrow(ErrorJugada);
    expect(() => aplicarAccion(grande, a.paso('rival'))).toThrow(ErrorJugada);
  });

  it('nunca modifica el estado que recibe', () => {
    const estado = congelar(dueloCon({ jugador: 'R R 5 4', rival: 'A A 6 7' }));
    expect(() => jugar(estado, [a.mus('jugador'), a.mus('rival'), a.descartar('jugador', 'Ro'), a.descartar('rival', 'Ac')])).not.toThrow();
  });
});

/** Juega `rondas` rondas de mus descartando la primera carta de cada uno. */
function jugarRondasDeMus(estado: EstadoDuelo, rondas: number, mods: Modificador[] = []): EstadoDuelo {
  let actual = estado;
  for (let i = 0; i < rondas; i++) {
    actual = jugar(actual, [a.mus('jugador'), a.mus('rival')], mods).estado;
    for (const lado of ['jugador', 'rival'] as const) {
      actual = aplicarAccion(actual, { tipo: 'descartar', lado, cartas: [actual.cartas[lado][0]!] }, mods).estado;
    }
  }
  return actual;
}
