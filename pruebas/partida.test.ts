import { describe, expect, it } from 'vitest';
import { accionAleatoria } from '../src/depuracion/jugadorAleatorio';
import { guardarPartida, cargarPartida, borrarPartida, type Almacen } from '../src/estado/guardado';
import { jugarJugador, jugarRival, leTocaAlRival, nuevaPartida, type Partida } from '../src/estado/partida';
import { RIVALES } from '../src/datos/rivales';
import { Azar } from '../src/nucleo/azar';
import { crearBaraja } from '../src/nucleo/baraja';
import { idCarta } from '../src/nucleo/carta';
import { ErrorJugada } from '../src/nucleo/comun';
import { decidirRival, vistaDe } from '../src/nucleo/ia/rival';

/** Juega hasta que le toque al rival (con un jugador aleatorio). */
function hastaTurnoDelRival(partida: Partida, azar: Azar): Partida {
  let p = partida;
  while (!leTocaAlRival(p) && p.duelo.fase !== 'finDuelo') {
    p = jugarJugador(p, accionAleatoria(p.duelo, azar)).partida;
  }
  return p;
}

function almacenEnMemoria(): Almacen & { datos: Map<string, string> } {
  const datos = new Map<string, string>();
  return {
    datos,
    getItem: (k) => datos.get(k) ?? null,
    setItem: (k, v) => void datos.set(k, v),
    removeItem: (k) => void datos.delete(k),
  };
}

describe('partida contra Ruperto', () => {
  it('se crea igual con la misma semilla', () => {
    expect(nuevaPartida('a').partida).toEqual(nuevaPartida('a').partida);
    expect(nuevaPartida('a').partida.duelo.cartas).not.toEqual(nuevaPartida('b').partida.duelo.cartas);
  });

  it('el jugador no puede jugar por el rival, ni el rival fuera de su turno', () => {
    const { partida } = nuevaPartida('turnos');
    expect(() => jugarJugador(partida, { tipo: 'mus', lado: 'rival' })).toThrow(ErrorJugada);
    const mia = partida.duelo.turno === 'jugador' ? partida : hastaTurnoDelRival(partida, Azar.conSemilla(1));
    if (!leTocaAlRival(mia)) expect(() => jugarRival(mia)).toThrow();
  });

  it('la IA no ve las cartas del jugador: cambiarlas no cambia su decisión', () => {
    const azar = Azar.conSemilla('trampas');
    let comprobadas = 0;
    for (let s = 0; s < 40; s++) {
      let p = nuevaPartida(`t${s}`).partida;
      for (let paso = 0; paso < 30 && p.duelo.fase !== 'finDuelo'; paso++) {
        p = hastaTurnoDelRival(p, azar);
        if (p.duelo.fase === 'finDuelo') break;

        // Mismo estado, pero con otras cartas para el jugador.
        const otra = structuredClone(p.duelo);
        const ocupadas = new Set([...otra.cartas.rival].map(idCarta));
        otra.cartas.jugador = azar.barajar(crearBaraja().filter((c) => !ocupadas.has(idCarta(c)))).slice(0, 4);
        expect(Object.keys(vistaDe(p.duelo, 'rival'))).not.toContain('mazo');

        const ctx = { perfil: RIVALES.ruperto, memoria: p.memoria, caraJugador: p.caraJugador };
        const original = decidirRival(vistaDe(p.duelo, 'rival'), ctx, new Azar(p.azarIA));
        const cambiada = decidirRival(vistaDe(otra, 'rival'), ctx, new Azar(p.azarIA));
        expect(cambiada.accion).toEqual(original.accion);
        comprobadas++;

        p = jugarRival(p).partida;
        if (p.duelo.fase === 'finMano') p = jugarJugador(p, { tipo: 'siguienteMano' }).partida;
      }
    }
    expect(comprobadas).toBeGreaterThan(200);
  }, 120_000);

  it(`300 duelos contra un jugador aleatorio: terminan todos y Ruperto gana casi siempre`, () => {
    const azar = Azar.conSemilla('contra-azar');
    let gana = 0;
    let manos = 0;
    let ordagosRuperto = 0;
    let tics = 0;
    let enfados = 0;
    for (let s = 0; s < 300; s++) {
      let { partida: p } = nuevaPartida(`d${s}`);
      for (let acciones = 0; p.duelo.fase !== 'finDuelo'; acciones++) {
        if (acciones > 5000) throw new Error('El duelo no termina');
        const r = leTocaAlRival(p)
          ? jugarRival(p)
          : jugarJugador(p, p.duelo.fase === 'finMano' ? { tipo: 'siguienteMano' } : accionAleatoria(p.duelo, azar));
        p = r.partida;
        tics += r.novedades.tics.length;
        if (r.novedades.seEnfada) enfados++;
        if (r.novedades.decision?.accion.tipo === 'ordago') ordagosRuperto++;
      }
      if (p.duelo.ganador === 'rival') gana++;
      manos += p.duelo.numeroMano;
    }
    console.info(
      `Ruperto contra el azar: gana ${gana}/300 · ${(manos / 300).toFixed(1)} manos por duelo · ` +
        `${((ordagosRuperto / manos) * 100).toFixed(0)} % de manos con órdago suyo · ` +
        `${(tics / manos).toFixed(2)} tics por mano · ${enfados} enfados`,
    );
    expect(gana).toBeGreaterThan(240);
    expect(tics).toBeGreaterThan(0);
  }, 120_000);
});

describe('guardado', () => {
  it('guarda y carga la partida tal cual', () => {
    const almacen = almacenEnMemoria();
    const { partida } = nuevaPartida('guardar');
    expect(guardarPartida(partida, almacen)).toBe(true);
    expect(cargarPartida(almacen)).toEqual(partida);
    borrarPartida(almacen);
    expect(cargarPartida(almacen)).toBeNull();
  });

  it('una partida cargada sigue exactamente igual que la original', () => {
    const almacen = almacenEnMemoria();
    const azar = Azar.conSemilla('reanudar');
    let p = hastaTurnoDelRival(nuevaPartida('reanudar').partida, azar);
    guardarPartida(p, almacen);
    const cargada = cargarPartida(almacen)!;
    expect(jugarRival(cargada)).toEqual(jugarRival(p));
  });

  it('con datos corruptos, de otra versión o sin almacenamiento, no falla', () => {
    const almacen = almacenEnMemoria();
    almacen.datos.set('ordago.partida', '{esto no es json');
    expect(cargarPartida(almacen)).toBeNull();
    almacen.datos.set('ordago.partida', JSON.stringify({ version: 99, partida: {} }));
    expect(cargarPartida(almacen)).toBeNull();
    almacen.datos.set('ordago.partida', JSON.stringify({ version: 1, partida: { version: 1 } }));
    expect(cargarPartida(almacen)).toBeNull();

    const roto: Almacen = {
      getItem: () => {
        throw new Error('SecurityError');
      },
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
      removeItem: () => {
        throw new Error('SecurityError');
      },
    };
    const { partida } = nuevaPartida('roto');
    expect(guardarPartida(partida, roto)).toBe(false);
    expect(cargarPartida(roto)).toBeNull();
    expect(() => borrarPartida(roto)).not.toThrow();
    expect(guardarPartida(partida, null)).toBe(false);
  });
});
