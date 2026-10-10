import { describe, expect, it } from 'vitest';
import {
  aplicarEnvite,
  iniciarEnvite,
  opcionesEnvite,
  type AccionEnvite,
  type EstadoEnvite,
  type LimitesEnvite,
} from '../src/nucleo/apuestas';
import { ErrorJugada, type Lado } from '../src/nucleo/comun';
import { congelar } from './ayudas';

const LIMITES: LimitesEnvite = { enviteMinimo: 2, subidaMinima: 2, deje: 1 };

const paso = { tipo: 'paso' } as const;
const quiero = { tipo: 'quiero' } as const;
const noQuiero = { tipo: 'noQuiero' } as const;
const ordago = { tipo: 'ordago' } as const;
const envido = (piedras = 2): AccionEnvite => ({ tipo: 'envido', piedras });
const mas = (piedras: number): AccionEnvite => ({ tipo: 'mas', piedras });

/** Juega las acciones alternando turnos, empezando por la mano (`jugador` salvo que se diga). */
function ronda(acciones: AccionEnvite[], mano: Lado = 'jugador'): EstadoEnvite {
  return acciones.reduce((estado, accion) => aplicarEnvite(estado, estado.turno, accion, LIMITES), iniciarEnvite(mano));
}

describe('la ronda de envites de un lance', () => {
  it('habla primero la mano', () => {
    expect(iniciarEnvite('rival').turno).toBe('rival');
    expect(() => aplicarEnvite(iniciarEnvite('rival'), 'jugador', paso, LIMITES)).toThrow(ErrorJugada);
  });

  it('paso y paso: el lance queda en paso', () => {
    const primero = ronda([paso]);
    expect(primero.resultado).toBeNull();
    expect(primero.turno).toBe('rival');
    expect(ronda([paso, paso]).resultado).toEqual({ tipo: 'enPaso' });
  });

  it('envido y quiero: 2 piedras queridas', () => {
    expect(ronda([envido(), quiero]).resultado).toEqual({ tipo: 'querido', piedras: 2, envidador: 'jugador' });
  });

  it('envido 5 y quiero: 5 piedras', () => {
    expect(ronda([envido(5), quiero]).resultado).toMatchObject({ tipo: 'querido', piedras: 5 });
  });

  it('envido y no quiero: 1 piedra para el que envidó', () => {
    expect(ronda([envido(), noQuiero]).resultado).toEqual({ tipo: 'noQuerido', ganador: 'jugador', piedras: 1 });
    expect(ronda([envido(5), noQuiero]).resultado).toEqual({ tipo: 'noQuerido', ganador: 'jugador', piedras: 1 });
  });

  it('envido 2, cinco más, no quiero: el que subió cobra los 2', () => {
    expect(ronda([envido(), mas(5), noQuiero]).resultado).toEqual({ tipo: 'noQuerido', ganador: 'rival', piedras: 2 });
  });

  it('envido 2, cinco más, diez más, no quiero: el que subió cobra 7', () => {
    expect(ronda([envido(), mas(5), mas(10), noQuiero]).resultado).toEqual({
      tipo: 'noQuerido',
      ganador: 'jugador',
      piedras: 7,
    });
  });

  it('envido 2, cinco más, quiero: 7 piedras', () => {
    expect(ronda([envido(), mas(5), quiero]).resultado).toEqual({ tipo: 'querido', piedras: 7, envidador: 'rival' });
  });

  it('la mano pasa, el otro envida y se sigue jugando', () => {
    expect(ronda([paso, envido(3), mas(2), quiero]).resultado).toEqual({
      tipo: 'querido',
      piedras: 5,
      envidador: 'jugador',
    });
    expect(ronda([paso, envido(), noQuiero]).resultado).toEqual({ tipo: 'noQuerido', ganador: 'rival', piedras: 1 });
  });

  it('órdago de primeras y no quiero: 1 piedra', () => {
    expect(ronda([ordago, noQuiero]).resultado).toEqual({ tipo: 'noQuerido', ganador: 'jugador', piedras: 1 });
  });

  it('órdago sobre un envite y no quiero: lo que había antes del órdago', () => {
    expect(ronda([envido(), ordago, noQuiero]).resultado).toEqual({ tipo: 'noQuerido', ganador: 'rival', piedras: 2 });
    expect(ronda([envido(), mas(3), ordago, noQuiero]).resultado).toEqual({
      tipo: 'noQuerido',
      ganador: 'jugador',
      piedras: 5,
    });
  });

  it('órdago y quiero', () => {
    expect(ronda([ordago, quiero]).resultado).toEqual({ tipo: 'ordagoQuerido', lanzador: 'jugador' });
    expect(ronda([paso, envido(), ordago, quiero]).resultado).toEqual({ tipo: 'ordagoQuerido', lanzador: 'jugador' });
  });

  it('guarda el historial de quién dijo qué', () => {
    expect(ronda([paso, envido(), quiero], 'rival').historial).toEqual([
      { lado: 'rival', accion: paso },
      { lado: 'jugador', accion: envido() },
      { lado: 'rival', accion: quiero },
    ]);
  });

  it('no modifica el estado que recibe', () => {
    const estado = congelar(ronda([envido()]));
    expect(() => aplicarEnvite(estado, 'rival', mas(2), LIMITES)).not.toThrow();
  });
});

describe('acciones válidas e ilegales', () => {
  const tipos = (estado: EstadoEnvite) => opcionesEnvite(estado, LIMITES).map((o) => o.tipo);

  it('sin envite: paso, envido u órdago', () => {
    expect(tipos(iniciarEnvite('jugador'))).toEqual(['paso', 'envido', 'ordago']);
    expect(opcionesEnvite(iniciarEnvite('jugador'), LIMITES)).toContainEqual({ tipo: 'envido', minimo: 2 });
  });

  it('con envite: quiero, no quiero, más u órdago', () => {
    expect(tipos(ronda([envido()]))).toEqual(['quiero', 'noQuiero', 'mas', 'ordago']);
  });

  it('con órdago: solo quiero o no quiero', () => {
    expect(tipos(ronda([ordago]))).toEqual(['quiero', 'noQuiero']);
  });

  it('resuelto: nada', () => {
    expect(tipos(ronda([paso, paso]))).toEqual([]);
  });

  const ilegales: [string, AccionEnvite[], AccionEnvite][] = [
    ['pasar con un envite pendiente', [envido()], paso],
    ['querer sin envite', [], quiero],
    ['no querer sin envite', [paso], noQuiero],
    ['subir sin envite', [], mas(2)],
    ['envidar sobre un envite', [envido()], envido(4)],
    ['subir un órdago', [ordago], mas(2)],
    ['órdago sobre órdago', [ordago], ordago],
    ['envidar menos del mínimo', [], envido(1)],
    ['subir menos del mínimo', [envido()], mas(1)],
    ['envidar una cantidad no entera', [], envido(2.5)],
    ['hablar con el lance resuelto', [paso, paso], envido()],
  ];
  for (const [que, previas, accion] of ilegales) {
    it(`no se puede ${que}`, () => {
      const estado = congelar(ronda(previas));
      expect(() => aplicarEnvite(estado, estado.turno, accion, LIMITES)).toThrow(ErrorJugada);
    });
  }

  it('no se puede hablar fuera de turno', () => {
    expect(() => aplicarEnvite(ronda([envido()]), 'jugador', quiero, LIMITES)).toThrow(ErrorJugada);
  });
});
