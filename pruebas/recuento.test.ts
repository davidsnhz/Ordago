import { describe, expect, it } from 'vitest';
import { REGLAS_BASE } from '../src/datos/reglas';
import { aplicarEnvite, iniciarEnvite, type AccionEnvite } from '../src/nucleo/apuestas';
import type { Lado } from '../src/nucleo/comun';
import type { Lance } from '../src/nucleo/lances';
import { aplicarCobros, calcularCobros, type Cobro, type LanceJugado } from '../src/nucleo/recuento';
import { cartas } from './ayudas';

const LIMITES = { enviteMinimo: 2, subidaMinima: 2, deje: 1 };
const paso = { tipo: 'paso' } as const;
const quiero = { tipo: 'quiero' } as const;
const noQuiero = { tipo: 'noQuiero' } as const;
const envido = (piedras = 2): AccionEnvite => ({ tipo: 'envido', piedras });
const mas = (piedras: number): AccionEnvite => ({ tipo: 'mas', piedras });

/** Lance jugado con envites; habla primero `mano`. */
function conEnvites(lance: Lance, acciones: AccionEnvite[], mano: Lado = 'jugador'): LanceJugado {
  const envite = acciones.reduce((e, accion) => aplicarEnvite(e, e.turno, accion, LIMITES), iniciarEnvite(mano));
  return { lance, modo: 'envites', envite };
}
const sinEnvites = (lance: Lance, modo: 'soloUno' | 'nadie'): LanceJugado => ({ lance, modo, envite: null });

function cobrosDe(jugador: string, rival: string, lances: LanceJugado[], mano: Lado = 'jugador'): Cobro[] {
  const usadas = new Set<string>();
  return calcularCobros({
    lances,
    cartas: { jugador: cartas(jugador, usadas), rival: cartas(rival, usadas) },
    reglas: REGLAS_BASE,
    ganaEmpate: () => mano,
  }).cobros;
}

describe('Grande y Chica', () => {
  it('en paso: 1 piedra al ganador', () => {
    expect(cobrosDe('R C 7 4', 'A A 4 5', [conEnvites('grande', [paso, paso])])).toEqual([
      { lance: 'grande', lado: 'jugador', piedras: 1, concepto: 'enPaso' },
    ]);
    expect(cobrosDe('R C 7 4', 'A A 4 5', [conEnvites('chica', [paso, paso])])).toEqual([
      { lance: 'chica', lado: 'rival', piedras: 1, concepto: 'enPaso' },
    ]);
  });

  it('querida: lo envidado, sin la piedra de paso', () => {
    expect(cobrosDe('R C 7 4', 'A A 4 5', [conEnvites('grande', [envido(5), quiero])])).toEqual([
      { lance: 'grande', lado: 'jugador', piedras: 5, concepto: 'envite' },
    ]);
  });

  it('el ganador de un envite querido es el de mejores cartas, no el que envidó', () => {
    expect(cobrosDe('A A 4 5', 'R C 7 4', [conEnvites('grande', [envido(), quiero])])).toEqual([
      { lance: 'grande', lado: 'rival', piedras: 2, concepto: 'envite' },
    ]);
  });

  it('no querida: nada en el recuento (el deje se cobró al momento)', () => {
    expect(cobrosDe('A A 4 5', 'R C 7 4', [conEnvites('grande', [envido(), noQuiero])])).toEqual([]);
  });

  it('empate en paso: gana la mano', () => {
    expect(cobrosDe('R C 7 4', '3 C 7 4', [conEnvites('grande', [paso, paso], 'rival')], 'rival')).toEqual([
      { lance: 'grande', lado: 'rival', piedras: 1, concepto: 'enPaso' },
    ]);
  });
});

describe('Pares', () => {
  it('solo uno tiene: cobra su pareja, medias o duples', () => {
    expect(cobrosDe('R R 5 6', 'A 4 5 7', [sinEnvites('pares', 'soloUno')])[0]).toMatchObject({ lado: 'jugador', piedras: 1 });
    expect(cobrosDe('A 4 5 7', 'R R R 6', [sinEnvites('pares', 'soloUno')])[0]).toMatchObject({ lado: 'rival', piedras: 2 });
    expect(cobrosDe('R R 4 4', 'A 5 6 7', [sinEnvites('pares', 'soloUno')])[0]).toMatchObject({ lado: 'jugador', piedras: 3 });
  });

  it('nadie tiene: no se cobra nada', () => {
    expect(cobrosDe('R C 5 4', 'A S 6 7', [sinEnvites('pares', 'nadie')])).toEqual([]);
  });

  it('en paso: el ganador cobra sus pares y el perdedor nada', () => {
    expect(cobrosDe('R R 4 4', 'C C 5 6', [conEnvites('pares', [paso, paso])])).toEqual([
      { lance: 'pares', lado: 'jugador', piedras: 3, concepto: 'pares' },
    ]);
  });

  it('querido: envite más los pares del ganador', () => {
    expect(cobrosDe('C C 5 6', 'R R 4 4', [conEnvites('pares', [envido(3), quiero])])).toEqual([
      { lance: 'pares', lado: 'rival', piedras: 3, concepto: 'envite' },
      { lance: 'pares', lado: 'rival', piedras: 3, concepto: 'pares' },
    ]);
  });

  it('no querido: el que envidó cobra sus pares aunque los del rival fueran mejores', () => {
    expect(cobrosDe('A A 5 6', 'R R 4 4', [conEnvites('pares', [envido(), noQuiero])])).toEqual([
      { lance: 'pares', lado: 'jugador', piedras: 1, concepto: 'pares' },
    ]);
  });
});

describe('Juego', () => {
  it('solo uno tiene: 3 por 31 y 2 por cualquier otro juego', () => {
    expect(cobrosDe('R R 7 4', 'A 4 5 6', [sinEnvites('juego', 'soloUno')])[0]).toMatchObject({ lado: 'jugador', piedras: 3 });
    expect(cobrosDe('A 4 5 6', 'R R R R', [sinEnvites('juego', 'soloUno')])[0]).toMatchObject({ lado: 'rival', piedras: 2 });
  });

  it('en paso: el 31 gana al 40', () => {
    expect(cobrosDe('R R R R', 'C S 7 4', [conEnvites('juego', [paso, paso])])).toEqual([
      { lance: 'juego', lado: 'rival', piedras: 3, concepto: 'juego' },
    ]);
  });

  it('querido: envite más el juego del ganador (37 gana a 33)', () => {
    expect(cobrosDe('R R R 7', 'C S 7 6', [conEnvites('juego', [envido(), mas(2), quiero])])).toEqual([
      { lance: 'juego', lado: 'jugador', piedras: 4, concepto: 'envite' },
      { lance: 'juego', lado: 'jugador', piedras: 2, concepto: 'juego' },
    ]);
  });

  it('no querido: el que envidó cobra su juego', () => {
    expect(cobrosDe('R R 7 6', 'R R 7 4', [conEnvites('juego', [envido(), noQuiero])])).toEqual([
      { lance: 'juego', lado: 'jugador', piedras: 2, concepto: 'juego' },
    ]);
  });
});

describe('Punto', () => {
  it('en paso: 1 piedra', () => {
    expect(cobrosDe('R R 5 5', 'R 7 7 4', [conEnvites('punto', [paso, paso])])).toEqual([
      { lance: 'punto', lado: 'jugador', piedras: 1, concepto: 'punto' },
    ]);
  });

  it('querido: envite más 1', () => {
    expect(cobrosDe('R 7 7 4', 'R R 5 5', [conEnvites('punto', [envido(4), quiero])])).toEqual([
      { lance: 'punto', lado: 'rival', piedras: 4, concepto: 'envite' },
      { lance: 'punto', lado: 'rival', piedras: 1, concepto: 'punto' },
    ]);
  });

  it('no querido: el que envidó cobra además 1 en el recuento', () => {
    expect(cobrosDe('A A 4 4', 'R R 5 5', [conEnvites('punto', [envido(), noQuiero])])).toEqual([
      { lance: 'punto', lado: 'jugador', piedras: 1, concepto: 'punto' },
    ]);
  });
});

describe('orden del recuento y victoria a mitad', () => {
  it('se cobra en el orden de los lances', () => {
    const lances = [
      conEnvites('grande', [paso, paso]),
      conEnvites('chica', [paso, paso]),
      sinEnvites('pares', 'soloUno'),
      sinEnvites('juego', 'soloUno'),
    ];
    expect(cobrosDe('A 4 5 6', 'R R R 7', lances).map((c) => c.lance)).toEqual(['grande', 'chica', 'pares', 'juego']);
  });

  it('a 19–18, la Chica lleva al jugador a 20 y ya no se cobran los pares ni el juego del rival', () => {
    const lances = [
      conEnvites('grande', [paso, paso]),
      conEnvites('chica', [paso, paso]),
      sinEnvites('pares', 'soloUno'),
      sinEnvites('juego', 'soloUno'),
    ];
    const cobros = cobrosDe('A 4 5 6', 'R R R 7', lances);
    const resultado = aplicarCobros({ jugador: 19, rival: 18 }, cobros, 20);
    expect(resultado.ganador).toBe('jugador');
    expect(resultado.marcador).toEqual({ jugador: 20, rival: 19 });
    expect(resultado.aplicados.map((c) => c.lance)).toEqual(['grande', 'chica']);
    expect(resultado.sinCobrar.map((c) => c.lance)).toEqual(['pares', 'juego']);
  });

  it('a 19–19 gana el rival con la Grande, antes de que el jugador cobre la Chica', () => {
    const lances = [conEnvites('grande', [paso, paso]), conEnvites('chica', [paso, paso])];
    const resultado = aplicarCobros({ jugador: 19, rival: 19 }, cobrosDe('A 4 5 6', 'R R R 7', lances), 20);
    expect(resultado.ganador).toBe('rival');
    expect(resultado.marcador).toEqual({ jugador: 19, rival: 20 });
  });

  it('si nadie llega, se cobra todo', () => {
    const resultado = aplicarCobros({ jugador: 0, rival: 0 }, [
      { lance: 'grande', lado: 'jugador', piedras: 2, concepto: 'envite' },
      { lance: 'chica', lado: 'rival', piedras: 1, concepto: 'enPaso' },
    ], 20);
    expect(resultado).toMatchObject({ ganador: null, marcador: { jugador: 2, rival: 1 }, sinCobrar: [] });
  });

  it('pasar de 20 también gana', () => {
    const resultado = aplicarCobros({ jugador: 15, rival: 0 }, [
      { lance: 'grande', lado: 'jugador', piedras: 10, concepto: 'envite' },
    ], 20);
    expect(resultado.ganador).toBe('jugador');
    expect(resultado.marcador.jugador).toBe(25);
  });
});
