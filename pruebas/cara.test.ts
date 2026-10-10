import { describe, expect, it } from 'vitest';
import { CARA } from '../src/datos/cara';
import { aplicarCambiosDeCara, cambiosDeCara, zonaDeCara } from '../src/nucleo/cara';
import type { AccionDuelo } from '../src/nucleo/duelo';
import { a, dueloCon, jugar, pasanLosDos } from './ayudas';

/** Juega las acciones y devuelve los cambios de Cara del jugador que producen. */
function cara(reparto: { jugador: string; rival: string }, acciones: AccionDuelo[]) {
  const { estado, eventos } = jugar(dueloCon(reparto), acciones);
  return cambiosDeCara(eventos, estado).map((c) => [c.motivo, c.delta]);
}

// Jugador mano. A 4 5 6 es casi lo peor a la Grande; R R R 7, casi lo mejor.
const FLOJA = 'A 4 5 6';
const BUENA = 'R R R 7';

describe('la Cara', () => {
  it('farol que el rival no acepta: +8', () => {
    expect(cara({ jugador: FLOJA, rival: 'C C 5 4' }, [a.corto('jugador'), a.envido('jugador'), a.noQuiero('rival')])).toEqual([
      ['farolCreido', 8],
    ]);
  });

  it('envite con buena mano que el rival no acepta: no cambia', () => {
    expect(cara({ jugador: BUENA, rival: 'C C 5 4' }, [a.corto('jugador'), a.envido('jugador'), a.noQuiero('rival')])).toEqual([]);
  });

  it('farol que el rival acepta y se ve en el recuento: −12', () => {
    const acciones = [a.corto('jugador'), a.envido('jugador'), a.quiero('rival'), ...pasanLosDos('jugador')];
    // Tras la Chica: Pares (solo el rival tiene) y Juego (nadie: Punto con envites).
    const resto = [...pasanLosDos('jugador')];
    expect(cara({ jugador: FLOJA, rival: 'C C 5 4' }, [...acciones, ...resto])).toEqual([['farolPillado', -12]]);
  });

  it('envite con buena mano que el rival acepta y pierde: +4', () => {
    const acciones = [a.corto('jugador'), a.envido('jugador'), a.quiero('rival'), ...pasanLosDos('jugador')];
    // Pares: solo el jugador (medias). Juego: el jugador tiene 37 y el rival no: no hay más envites.
    expect(cara({ jugador: BUENA, rival: 'C S 5 4' }, acciones)).toEqual([['enviteCobrado', 4]]);
  });

  it('buena mano que pierde el lance: no cambia', () => {
    // R R C 4 es buena a la Grande, pero R R 3 7 (tres reyes) gana.
    const acciones = [a.corto('jugador'), a.envido('jugador'), a.quiero('rival'), ...pasanLosDos('jugador')];
    // Pares y Juego: los dos tienen, así que hay que pasar los dos lances para llegar al recuento.
    expect(cara({ jugador: 'R R C 4', rival: 'R R 3 7' }, [...acciones, ...pasanLosDos('jugador'), ...pasanLosDos('jugador')])).toEqual([]);
  });

  it('aceptar el envite del rival no cuenta: el farol es tuyo, no suyo', () => {
    const acciones = [a.corto('jugador'), a.paso('jugador'), a.envido('rival'), a.quiero('jugador'), ...pasanLosDos('jugador')];
    expect(cara({ jugador: FLOJA, rival: 'C C 5 4' }, [...acciones, ...pasanLosDos('jugador')])).toEqual([]);
  });

  it('órdago tuyo que pierdes: −15 (y −12 más si era de farol)', () => {
    expect(cara({ jugador: 'R R C 4', rival: 'R R 3 7' }, [a.corto('jugador'), a.ordago('jugador'), a.quiero('rival')])).toEqual([
      ['ordagoPerdido', -15],
    ]);
    expect(cara({ jugador: FLOJA, rival: BUENA }, [a.corto('jugador'), a.ordago('jugador'), a.quiero('rival')])).toEqual([
      ['farolPillado', -12],
      ['ordagoPerdido', -15],
    ]);
  });

  it('órdago del rival que pierdes tú: no cuenta', () => {
    const acciones = [a.corto('jugador'), a.paso('jugador'), a.ordago('rival'), a.quiero('jugador')];
    expect(cara({ jugador: 'R R C 4', rival: 'R R 3 7' }, acciones)).toEqual([]);
  });

  it('se queda entre 0 y 100', () => {
    expect(aplicarCambiosDeCara(5, [{ motivo: 'farolPillado', delta: -12 }])).toBe(0);
    expect(aplicarCambiosDeCara(96, [{ motivo: 'farolCreido', delta: 8 }])).toBe(100);
    expect(aplicarCambiosDeCara(60, [{ motivo: 'farolCreido', delta: 8 }, { motivo: 'enviteCobrado', delta: 4 }])).toBe(72);
    // El Forastero (fase 4) podrá subir el mínimo.
    expect(aplicarCambiosDeCara(35, [{ motivo: 'farolPillado', delta: -12 }], 30)).toBe(30);
  });

  it('zonas: te pillan por debajo de 35, te temen desde 70', () => {
    expect(zonaDeCara(34)).toBe('pillan');
    expect(zonaDeCara(CARA.zonas.baja)).toBe('creen');
    expect(zonaDeCara(69)).toBe('creen');
    expect(zonaDeCara(70)).toBe('temen');
  });
});
