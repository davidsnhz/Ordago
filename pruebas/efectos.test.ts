import { describe, expect, it } from 'vitest';
import { efectosDe } from '../src/estado/efectos';
import { aplicarNovedades, mesaInicial } from '../src/estado/mesa';
import { nuevaPartida } from '../src/estado/partida';
import type { EventoDuelo } from '../src/nucleo/eventos';

const sinCartas = { jugador: [], rival: [] };

describe('la mesa viva: lo que se ve y se oye', () => {
  it('cada envite cae como un sello; los gordos y las subidas, con golpe', () => {
    const eventos: EventoDuelo[] = [
      { tipo: 'envite', lance: 'grande', lado: 'rival', accion: { tipo: 'paso' } },
      { tipo: 'envite', lance: 'grande', lado: 'jugador', accion: { tipo: 'envido', piedras: 2 } },
      { tipo: 'envite', lance: 'grande', lado: 'rival', accion: { tipo: 'envido', piedras: 5 } },
      { tipo: 'envite', lance: 'grande', lado: 'jugador', accion: { tipo: 'mas', piedras: 2 } },
      { tipo: 'envite', lance: 'grande', lado: 'rival', accion: { tipo: 'quiero' } },
      { tipo: 'envite', lance: 'chica', lado: 'rival', accion: { tipo: 'noQuiero' } },
    ];
    expect(efectosDe(eventos)).toEqual([
      { tipo: 'sello', lado: 'rival', dice: 'paso', piedras: 0, fuerza: 0, lance: 'grande' },
      { tipo: 'sello', lado: 'jugador', dice: 'envido', piedras: 2, fuerza: 1, lance: 'grande' },
      { tipo: 'sello', lado: 'rival', dice: 'envido', piedras: 5, fuerza: 2, lance: 'grande' },
      { tipo: 'sello', lado: 'jugador', dice: 'mas', piedras: 2, fuerza: 2, lance: 'grande' },
      { tipo: 'sello', lado: 'rival', dice: 'quiero', piedras: 0, fuerza: 1, lance: 'grande' },
      { tipo: 'sello', lado: 'rival', dice: 'noQuiero', piedras: 0, fuerza: 0, lance: 'chica' },
    ]);
  });

  it('el órdago no es un sello: es el momento grande', () => {
    expect(efectosDe([{ tipo: 'envite', lance: 'pares', lado: 'jugador', accion: { tipo: 'ordago' } }])).toEqual([{ tipo: 'ordago', lado: 'jugador', lance: 'pares' }]);
  });

  it('mus y corto, reparto, descarte, cartas vistas y fin del duelo', () => {
    const eventos: EventoDuelo[] = [
      { tipo: 'reparto', numeroMano: 2, quienEsMano: 'jugador', cartas: sinCartas },
      { tipo: 'mus', lado: 'jugador', quiereMus: true },
      { tipo: 'mus', lado: 'rival', quiereMus: false },
      { tipo: 'descarte', lado: 'rival', descartadas: [{ numero: 4, palo: 'oros' }], robadas: [{ numero: 12, palo: 'copas' }] },
      { tipo: 'ordago', lance: 'grande', lanzador: 'rival', ganador: 'jugador', cartas: sinCartas },
      { tipo: 'finDuelo', ganador: 'jugador', motivo: 'ordago', marcador: { jugador: 20, rival: 7 } },
    ];
    expect(efectosDe(eventos)).toEqual([
      { tipo: 'reparto' },
      { tipo: 'sello', lado: 'jugador', dice: 'mus', piedras: 0, fuerza: 0, lance: null },
      { tipo: 'sello', lado: 'rival', dice: 'corto', piedras: 0, fuerza: 0, lance: null },
      { tipo: 'descarte', lado: 'rival', cuantas: 1 },
      { tipo: 'cartasVistas' },
      { tipo: 'finDuelo', ganador: 'jugador' },
    ]);
  });

  it('los «no quiero» y los cobros del recuento que se apuntan, en orden, para que las piedras salgan de su casilla', () => {
    const eventos: EventoDuelo[] = [
      { tipo: 'deje', lance: 'chica', lado: 'rival', piedras: 1, marcador: { jugador: 0, rival: 1 } },
      {
        tipo: 'recuento',
        cobros: [
          { lance: 'grande', lado: 'jugador', piedras: 2, concepto: 'envite' },
          { lance: 'pares', lado: 'jugador', piedras: 3, concepto: 'pares' },
          { lance: 'juego', lado: 'rival', piedras: 2, concepto: 'juego' },
        ],
        aplicados: 2,
        ganadores: {},
        cartas: sinCartas,
        marcador: { jugador: 20, rival: 1 },
      },
    ];
    expect(efectosDe(eventos)).toEqual([
      { tipo: 'cobro', lado: 'rival', lance: 'chica', piedras: 1, orden: 0 },
      { tipo: 'cartasVistas' },
      { tipo: 'cobro', lado: 'jugador', lance: 'grande', piedras: 2, orden: 0 },
      { tipo: 'cobro', lado: 'jugador', lance: 'pares', piedras: 3, orden: 1 },
    ]);
  });

  it('la mesa guarda la última tanda con una clave nueva; si no hay nada que enseñar, no la cambia', () => {
    const inicio = nuevaPartida('viva');
    const mesa = aplicarNovedades(mesaInicial(inicio.partida), inicio);
    expect(mesa.efectos).toContainEqual({ tipo: 'reparto' });
    expect(mesa.claveEfectos).toBe(1);

    const quieta = aplicarNovedades(mesa, { partida: mesa.partida, novedades: { ...inicio.novedades, eventos: [] } });
    expect(quieta.claveEfectos).toBe(1);
    expect(quieta.efectos).toBe(mesa.efectos);
  });
});
