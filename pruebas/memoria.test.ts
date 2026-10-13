import { describe, expect, it } from 'vitest';
import { RIVALES } from '../src/datos/rivales';
import type { Lado } from '../src/nucleo/comun';
import type { EventoDuelo } from '../src/nucleo/eventos';
import { memoriaInicial, proporcionFaroles, recordar } from '../src/nucleo/ia/memoria';
import type { Lance } from '../src/nucleo/lances';
import { cartas } from './ayudas';

const RUPERTO = RIVALES.ruperto;

const reparto = (quienEsMano: Lado = 'jugador'): EventoDuelo => ({
  tipo: 'reparto',
  numeroMano: 1,
  quienEsMano,
  cartas: { jugador: [], rival: [] },
});
const envite = (lado: Lado, tipo: 'envido' | 'mas' | 'ordago' | 'quiero', lance: Lance = 'grande'): EventoDuelo => ({
  tipo: 'envite',
  lance,
  lado,
  accion: tipo === 'envido' || tipo === 'mas' ? { tipo, piedras: 2 } : { tipo },
});
function recuento(ganadores: Partial<Record<Lance, Lado | null>>, jugador = 'R R R R', rival = 'A A 4 5'): EventoDuelo {
  const usadas = new Set<string>();
  return {
    tipo: 'recuento',
    cobros: [],
    aplicados: 0,
    ganadores,
    cartas: { jugador: cartas(jugador, usadas), rival: cartas(rival, usadas) },
    marcador: { jugador: 0, rival: 0 },
  };
}

describe('memoria del rival', () => {
  it('cuenta los envites y órdagos del jugador, no los suyos ni los «quiero»', () => {
    const { memoria } = recordar(
      memoriaInicial(),
      [reparto(), envite('jugador', 'envido'), envite('rival', 'mas'), envite('jugador', 'ordago'), envite('jugador', 'quiero')],
      RUPERTO,
      8,
    );
    expect(memoria).toMatchObject({ envitesJugador: 2, ordagosJugador: 1 });
  });

  it('al ver las cartas descubre los faroles: envidar a la Grande con A 4 5 6 lo es; con cuatro reyes, no', () => {
    const conFarol = recordar(memoriaInicial(), [reparto(), envite('jugador', 'envido'), recuento({}, 'A 4 5 6', 'R C 7 7')], RUPERTO, 8);
    expect(conFarol.memoria.farolesDescubiertos).toBe(1);
    expect(proporcionFaroles(conFarol.memoria)).toBe(1);

    const sinFarol = recordar(memoriaInicial(), [reparto(), envite('jugador', 'envido'), recuento({}, 'R R R R', 'A A 4 5')], RUPERTO, 8);
    expect(sinFarol.memoria.farolesDescubiertos).toBe(0);
  });

  it('recuerda entre acciones quién es mano', () => {
    const tras = recordar(memoriaInicial(), [reparto('rival')], RUPERTO, 8).memoria;
    const conEnvite = recordar(tras, [envite('jugador', 'envido')], RUPERTO, 8).memoria;
    expect(conEnvite.envitesDeLaMano).toEqual([{ lance: 'grande', esMano: false }]);
  });

  it('sin envites, t_farol es 0', () => {
    expect(proporcionFaroles(memoriaInicial())).toBe(0);
  });
});

describe('el enfado de Agustín', () => {
  it('si pierde 3 lances seguidos se enfada durante 2 manos', () => {
    let m = memoriaInicial();
    let r = recordar(m, [recuento({ grande: 'jugador', chica: 'jugador', pares: null, juego: 'rival' })], RUPERTO, 8);
    expect(r.seEnfada).toBe(false);
    expect(r.memoria.lancesPerdidosSeguidos).toBe(0);

    r = recordar(r.memoria, [recuento({ grande: 'jugador', chica: 'jugador', pares: 'jugador', juego: 'rival' })], RUPERTO, 8);
    expect(r.seEnfada).toBe(true);
    expect(r.memoria.manosEnfadado).toBe(2);
    m = r.memoria;

    // Las dos manos siguientes las juega enfadado; luego se le pasa.
    m = recordar(m, [recuento({ grande: 'rival' })], RUPERTO, 8).memoria;
    expect(m.manosEnfadado).toBe(1);
    m = recordar(m, [recuento({ grande: 'rival' })], RUPERTO, 8).memoria;
    expect(m.manosEnfadado).toBe(0);
  });

  it('la racha sigue de una mano a otra', () => {
    let r = recordar(memoriaInicial(), [recuento({ grande: 'rival', chica: 'jugador', pares: 'jugador' })], RUPERTO, 8);
    expect(r.memoria.lancesPerdidosSeguidos).toBe(2);
    r = recordar(r.memoria, [recuento({ grande: 'jugador' })], RUPERTO, 8);
    expect(r.seEnfada).toBe(true);
  });

  it('los rivales sin esa regla no se enfadan', () => {
    const r = recordar(memoriaInicial(), [recuento({ grande: 'jugador', chica: 'jugador', pares: 'jugador', juego: 'jugador' })], RIVALES.anselmo, 8);
    expect(r.seEnfada).toBe(false);
    expect(r.memoria.manosEnfadado).toBe(0);
  });
});
