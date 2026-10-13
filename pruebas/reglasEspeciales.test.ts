import { describe, expect, it } from 'vitest';
import { RIVALES } from '../src/datos/rivales';
import { aplicarEnvite, iniciarEnvite } from '../src/nucleo/apuestas';
import { Azar } from '../src/nucleo/azar';
import { idCarta } from '../src/nucleo/carta';
import { ErrorJugada } from '../src/nucleo/comun';
import { accionesValidas, aplicarAccion, cambiarCarta } from '../src/nucleo/duelo';
import type { EventoDuelo } from '../src/nucleo/eventos';
import { decidirEnvite } from '../src/nucleo/ia/decisiones';
import { memoriaInicial, recordar } from '../src/nucleo/ia/memoria';
import type { Modificador } from '../src/nucleo/modificadores';
import { a, cartas, congelar, dueloCon, jugar, pasanLosDos, todasLasCartas } from './ayudas';

const OFRECE: Modificador = { id: 'trato', ofreceTrato: () => 'rival' };

/** Jugador R R R 7 (mano) contra A 4 5 6: envido cinco querido a la Grande y el resto sin envites. */
function hastaElTrato(mods: Modificador[] = [OFRECE]) {
  return jugar(
    dueloCon({ jugador: 'R R R 7', rival: 'A 4 5 6' }),
    [a.corto('jugador'), a.envido('jugador', 5), a.quiero('rival'), ...pasanLosDos('jugador')],
    mods,
  );
}

describe('el trato (Aurelio)', () => {
  it('antes del recuento, si hay envites queridos, se espera la respuesta del otro', () => {
    const { estado, eventos } = hastaElTrato();
    expect(estado).toMatchObject({ fase: 'trato', turno: 'jugador', trato: { ofrece: 'rival' } });
    expect(accionesValidas(estado)).toEqual({ lado: 'jugador', opciones: [{ tipo: 'trato' }] });
    expect(eventos.at(-1)).toEqual({ tipo: 'trato', ofrece: 'rival' });
  });

  it('aceptado: el envite se reparte y la piedra impar es para quien lo propuso', () => {
    const { estado } = hastaElTrato();
    const r = aplicarAccion(estado, { tipo: 'trato', lado: 'jugador', acepta: true }, [OFRECE]);
    expect(r.estado.recuento?.cobros.filter((c) => c.lance === 'grande')).toEqual([
      { lance: 'grande', lado: 'jugador', piedras: 2, concepto: 'trato' },
      { lance: 'grande', lado: 'rival', piedras: 3, concepto: 'trato' },
    ]);
    expect(r.eventos[0]).toEqual({ tipo: 'tratoResuelto', lado: 'jugador', acepta: true });
  });

  it('rechazado: el recuento es el de siempre', () => {
    const { estado } = hastaElTrato();
    const r = aplicarAccion(estado, { tipo: 'trato', lado: 'jugador', acepta: false }, [OFRECE]);
    expect(r.estado.recuento?.cobros[0]).toEqual({ lance: 'grande', lado: 'jugador', piedras: 5, concepto: 'envite' });
  });

  it('sin envites queridos no hay trato', () => {
    const { estado } = jugar(dueloCon({ jugador: 'R R R 7', rival: 'A 4 5 6' }), [a.corto('jugador'), ...pasanLosDos('jugador'), ...pasanLosDos('jugador')], [OFRECE]);
    expect(estado.fase).toBe('finMano');
  });

  it('solo responde a quien le toca', () => {
    const { estado } = hastaElTrato();
    expect(() => aplicarAccion(estado, { tipo: 'trato', lado: 'rival', acepta: true }, [OFRECE])).toThrow(ErrorJugada);
  });
});

describe('ajustar los cobros (la Penitencia)', () => {
  it('un modificador puede añadir cobros antes de apuntarlos', () => {
    const penitencia: Modificador = {
      id: 'penitencia',
      ajustarCobros: (cobros) => [...cobros, { lance: 'juego', lado: 'rival', piedras: 1, concepto: 'penitencia' }],
    };
    const { estado } = jugar(dueloCon({ jugador: 'R R R 7', rival: 'A 4 5 6' }), [a.corto('jugador'), ...pasanLosDos('jugador'), ...pasanLosDos('jugador')], [penitencia]);
    expect(estado.recuento?.cobros.at(-1)).toEqual({ lance: 'juego', lado: 'rival', piedras: 1, concepto: 'penitencia' });
    expect(estado.marcador.rival).toBe(2); // Chica en paso + penitencia.
  });
});

describe('cambiar una carta en secreto (cartas de la casa)', () => {
  it('cambia una carta de la mano por una del mazo y conserva las 40', () => {
    const estado = congelar(dueloCon({ jugador: 'R R R 7', rival: 'A 4 5 6', mazo: '3' }));
    const [sale] = cartas('Ao');
    const entra = estado.mazo.cartas[0]!;
    const r = cambiarCarta(estado, 'rival', sale!, entra);
    expect(r.estado.cartas.rival.map(idCarta)).toContain(idCarta(entra));
    expect(r.estado.cartas.rival.map(idCarta)).not.toContain('01_oros');
    expect(new Set(todasLasCartas(r.estado).map(idCarta)).size).toBe(40);
    expect(r.eventos).toEqual([{ tipo: 'cartaCambiada', lado: 'rival', sale, entra }]);
  });

  it('no deja cambiar cartas que no están donde deben', () => {
    const estado = dueloCon({ jugador: 'R R R 7', rival: 'A 4 5 6' });
    expect(() => cambiarCarta(estado, 'rival', cartas('Ro')[0]!, estado.mazo.cartas[0]!)).toThrow(ErrorJugada);
    expect(() => cambiarCarta(estado, 'rival', cartas('Ao')[0]!, cartas('Ro')[0]!)).toThrow(ErrorJugada);
  });
});

describe('reglas de decisión de cada rival', () => {
  const LIMITES = { enviteMinimo: 2, subidaMinima: 2, deje: 1 };
  const azar = { siguiente: () => 0.5, probabilidad: (p: number) => 0.5 < p } as unknown as Azar;
  const conOrdago = aplicarEnvite(iniciarEnvite('jugador'), 'jugador', { tipo: 'ordago' }, LIMITES);
  const base = { limites: LIMITES, diferencia: 0, caraJugador: 60, tFarol: 0, aceptaTodo: false };

  it('Doña Ignacia nunca acepta un órdago antes de la tercera mano', () => {
    // Con su miedo al órdago (9) necesita casi la mano perfecta y que tu Cara esté baja.
    const situacion = { ...base, F: 1, envite: conOrdago, ordagoDesdeMano: 3, caraJugador: 20 };
    expect(decidirEnvite({ ...situacion, numeroMano: 2 }, RIVALES.engracia.parametros, azar).accion).toEqual({ tipo: 'noQuiero' });
    expect(decidirEnvite({ ...situacion, numeroMano: 3 }, RIVALES.engracia.parametros, azar).accion).toEqual({ tipo: 'quiero' });
  });

  it('Don Francisco envida siempre a la Chica, lleve lo que lleve', () => {
    const situacion = { ...base, F: 0.1, envite: iniciarEnvite('rival'), siempreEnvida: true };
    const decision = decidirEnvite(situacion, RIVALES.anselmo.parametros, azar);
    expect(decision.accion).toEqual({ tipo: 'envido', piedras: 2 });
    expect(decision.farol).toBe(true);
    expect(decidirEnvite({ ...situacion, siempreEnvida: false }, RIVALES.anselmo.parametros, azar).accion).toEqual({ tipo: 'paso' });
  });
});

describe('memoria de las reglas especiales', () => {
  const recuento = (jugador: string): EventoDuelo => {
    const usadas = new Set<string>();
    return {
      tipo: 'recuento',
      cobros: [],
      aplicados: 0,
      ganadores: {},
      cartas: { jugador: cartas(jugador, usadas), rival: cartas('C C 5 4', usadas) },
      marcador: { jugador: 0, rival: 0 },
    };
  };
  const envidoDelJugador: EventoDuelo = { tipo: 'envite', lance: 'grande', lado: 'jugador', accion: { tipo: 'envido', piedras: 2 } };
  const reparto: EventoDuelo = { tipo: 'reparto', numeroMano: 1, quienEsMano: 'jugador', cartas: { jugador: [], rival: [] } };

  it('Don Francisco impone penitencia al pillarte un farol, y se paga con tu siguiente envite', () => {
    const r1 = recordar(memoriaInicial(), [reparto, envidoDelJugador, recuento('A 4 5 6')], RIVALES.anselmo, 8);
    expect(r1).toMatchObject({ imponePenitencia: true, memoria: { penitencia: true } });
    // Una mano sin envites tuyos: sigue pendiente.
    const r2 = recordar(r1.memoria, [reparto, recuento('R R R 7')], RIVALES.anselmo, 8);
    expect(r2.memoria.penitencia).toBe(true);
    // Envidas con buena mano: se paga y se acaba.
    const r3 = recordar(r2.memoria, [reparto, envidoDelJugador, recuento('R R R 7')], RIVALES.anselmo, 8);
    expect(r3.memoria.penitencia).toBe(false);
  });

  it('los demás no imponen penitencia', () => {
    const r = recordar(memoriaInicial(), [reparto, envidoDelJugador, recuento('A 4 5 6')], RIVALES.ruperto, 8);
    expect(r.memoria.penitencia).toBe(false);
  });

  it('recuerda que ya ha usado el trato y el cambio de carta', () => {
    const [sale, entra] = cartas('A R');
    const r = recordar(memoriaInicial(), [{ tipo: 'trato', ofrece: 'rival' }, { tipo: 'cartaCambiada', lado: 'rival', sale: sale!, entra: entra! }], RIVALES.fulgencio, 8);
    expect(r.memoria).toMatchObject({ tratoUsado: true, cambioUsado: true });
  });

  it('el azar de la IA se usa igual en cada ejecución', () => {
    expect(Azar.conSemilla('x').siguiente()).toBe(Azar.conSemilla('x').siguiente());
  });
});
