import { describe, expect, it } from 'vitest';
import { accionAleatoria } from '../src/depuracion/jugadorAleatorio';
import { CARA } from '../src/datos/cara';
import { IA } from '../src/datos/ia';
import { ORDEN_RIVALES, RIVALES, type IdRival } from '../src/datos/rivales';
import { ajustarCara, jugarJugador, jugarRival, leTocaAlRival, nuevaPartida, type Partida, type ResultadoPartida } from '../src/estado/partida';
import { Azar } from '../src/nucleo/azar';
import { accionesValidas } from '../src/nucleo/duelo';
import { crearBaraja } from '../src/nucleo/baraja';
import { idCarta } from '../src/nucleo/carta';
import type { EventoDuelo } from '../src/nucleo/eventos';
import { decidirRival, vistaDe } from '../src/nucleo/ia/rival';
import { todasLasCartas } from './ayudas';

/** Una acción de la partida: el rival si le toca y, si no, el jugador al azar. */
function paso(p: Partida, azar: Azar): ResultadoPartida {
  if (leTocaAlRival(p)) return jugarRival(p);
  return jugarJugador(p, p.duelo.fase === 'finMano' ? { tipo: 'siguienteMano' } : accionAleatoria(p.duelo, azar));
}

/** Juega al azar hasta que el jugador pueda tirar un órdago (o se acabe el duelo). */
function hastaQueMePuedaTirarOrdago(p: Partida, azar: Azar): Partida {
  for (let i = 0; i < 500 && p.duelo.fase !== 'finDuelo'; i++) {
    const { lado, opciones } = accionesValidas(p.duelo);
    if (lado === 'jugador' && opciones.some((o) => o.tipo === 'ordago')) return p;
    p = paso(p, azar).partida;
  }
  return p;
}

/** Juega `duelos` duelos completos contra `rival` y devuelve todos los eventos y novedades. */
function jugarDuelos(rival: IdRival, duelos: number, comprobar?: (p: Partida, r: ResultadoPartida) => void) {
  const azar = Azar.conSemilla(`contra-${rival}`);
  const porDuelo: { partida: Partida; eventos: EventoDuelo[]; resultados: ResultadoPartida[] }[] = [];
  for (let s = 0; s < duelos; s++) {
    let { partida: p } = nuevaPartida(`${rival}-${s}`, rival);
    const eventos: EventoDuelo[] = [];
    const resultados: ResultadoPartida[] = [];
    for (let acciones = 0; p.duelo.fase !== 'finDuelo'; acciones++) {
      if (acciones > 5000) throw new Error(`El duelo ${s} contra ${rival} no termina`);
      const r = paso(p, azar);
      comprobar?.(p, r);
      eventos.push(...r.novedades.eventos);
      resultados.push(r);
      p = r.partida;
    }
    porDuelo.push({ partida: p, eventos, resultados });
  }
  return porDuelo;
}

describe('los cinco rivales', () => {
  for (const rival of ORDEN_RIVALES) {
    it(`${rival}: 80 duelos sin errores, con las 40 cartas y la Cara entre 0 y 100`, () => {
      const duelos = jugarDuelos(rival, 80, (_, r) => {
        const todas = todasLasCartas(r.partida.duelo).map(idCarta);
        if (todas.length !== 40 || new Set(todas).size !== 40) throw new Error('No hay 40 cartas distintas');
        if (r.partida.caraJugador < CARA.minimo || r.partida.caraJugador > CARA.maximo) throw new Error('Cara fuera de rango');
      });
      expect(duelos.every((d) => d.partida.duelo.ganador)).toBe(true);
    }, 120_000);

    it(`${rival}: no ve tus cartas (cambiarlas no cambia su decisión)`, () => {
      const azar = Azar.conSemilla(`trampas-${rival}`);
      let comprobadas = 0;
      for (let s = 0; s < 15; s++) {
        let p = nuevaPartida(`t-${rival}-${s}`, rival).partida;
        for (let n = 0; n < 200 && p.duelo.fase !== 'finDuelo'; n++) {
          if (leTocaAlRival(p)) {
            const otra = structuredClone(p.duelo);
            const ocupadas = new Set(otra.cartas.rival.map(idCarta));
            otra.cartas.jugador = azar.barajar(crearBaraja().filter((c) => !ocupadas.has(idCarta(c)))).slice(0, 4);
            const ctx = { perfil: RIVALES[rival], memoria: p.memoria, caraJugador: p.caraJugador };
            const original = decidirRival(vistaDe(p.duelo, 'rival'), ctx, new Azar(p.azarIA));
            const cambiada = decidirRival(vistaDe(otra, 'rival'), ctx, new Azar(p.azarIA));
            expect(cambiada.accion).toEqual(original.accion);
            comprobadas++;
          }
          p = paso(p, azar).partida;
        }
      }
      expect(comprobadas).toBeGreaterThan(50);
    }, 120_000);
  }
});

describe('reglas especiales en partida', () => {
  it('Don Rodrigo es mano en el primer reparto', () => {
    for (let s = 0; s < 10; s++) expect(nuevaPartida(`casa-${s}`, 'bonifacio').partida.duelo.quienEsMano).toBe('rival');
  });

  it('Don Rodrigo cambia como mucho una carta por duelo, y alguna vez lo hace', () => {
    const duelos = jugarDuelos('bonifacio', 60);
    const cambios = duelos.map((d) => d.eventos.filter((e) => e.tipo === 'cartaCambiada').length);
    expect(Math.max(...cambios)).toBeLessThanOrEqual(1);
    expect(cambios.reduce((s, n) => s + n, 0)).toBeGreaterThan(0);
  }, 120_000);

  it('Aurelio propone como mucho un trato por duelo, y alguna vez lo hace', () => {
    const duelos = jugarDuelos('fulgencio', 60);
    const tratos = duelos.map((d) => d.eventos.filter((e) => e.tipo === 'trato').length);
    expect(Math.max(...tratos)).toBeLessThanOrEqual(1);
    expect(tratos.reduce((s, n) => s + n, 0)).toBeGreaterThan(0);
  }, 120_000);

  it('Don Francisco cobra penitencia alguna vez', () => {
    const duelos = jugarDuelos('anselmo', 60);
    const penitencias = duelos.flatMap((d) => d.eventos).filter((e) => e.tipo === 'recuento' && e.cobros.some((c) => c.concepto === 'penitencia'));
    expect(penitencias.length).toBeGreaterThan(0);
  }, 120_000);

  it('Agustín se enfada alguna vez', () => {
    const duelos = jugarDuelos('ruperto', 40);
    expect(duelos.some((d) => d.resultados.some((r) => r.novedades.seEnfada))).toBe(true);
  }, 120_000);

  it('Doña Ignacia se ofende si le tiras un órdago antes de la tercera mano, y entonces no hace tics', () => {
    const inicio = hastaQueMePuedaTirarOrdago(nuevaPartida('ofendida', 'engracia').partida, Azar.conSemilla('hasta-ordago'));
    expect(inicio.duelo.fase).not.toBe('finDuelo');
    expect(inicio.duelo.numeroMano).toBeLessThan(3);
    const r = jugarJugador(inicio, { tipo: 'ordago', lado: 'jugador' });
    expect(r.novedades.seOfende).toBe(true);
    expect(r.novedades.tics).toEqual([]);
    const ofendida = r.partida;
    expect(ofendida.memoria.ofendidaHastaMano).toBe(inicio.duelo.numeroMano + 1);

    // Mientras dura, ni un tic.
    const azar = Azar.conSemilla('ofendida');
    let p = ofendida;
    while (p.duelo.numeroMano <= ofendida.memoria.ofendidaHastaMano && p.duelo.fase !== 'finDuelo') {
      const paso1 = paso(p, azar);
      if (paso1.partida.duelo.numeroMano <= ofendida.memoria.ofendidaHastaMano) expect(paso1.novedades.tics).toEqual([]);
      p = paso1.partida;
    }
  });

  it('un órdago desde la tercera mano, o a otro rival, no ofende a nadie', () => {
    const azar = Azar.conSemilla('tercera');
    let p = nuevaPartida('tercera', 'engracia').partida;
    while (p.duelo.numeroMano < 3 && p.duelo.fase !== 'finDuelo') p = paso(p, azar).partida;
    p = hastaQueMePuedaTirarOrdago(p, azar);
    if (p.duelo.fase !== 'finDuelo') {
      expect(p.duelo.numeroMano).toBeGreaterThanOrEqual(3);
      expect(jugarJugador(p, { tipo: 'ordago', lado: 'jugador' }).novedades.seOfende).toBe(false);
    }
    const ruperto = hastaQueMePuedaTirarOrdago(nuevaPartida('ruperto', 'ruperto').partida, Azar.conSemilla('ruperto'));
    expect(jugarJugador(ruperto, { tipo: 'ordago', lado: 'jugador' }).novedades.seOfende).toBe(false);
  });
});

describe('la Cara en partida', () => {
  it('pasa al duelo siguiente y con 0 se te nota desde el principio', () => {
    expect(nuevaPartida('c', 'ruperto', 25).partida).toMatchObject({ caraJugador: 25, expuesto: false });
    expect(nuevaPartida('c', 'ruperto', 0).partida).toMatchObject({ caraJugador: 0, expuesto: true });
  });

  it('a 0, el rival ve tu tic: a veces se te nota y su fuerza cambia', () => {
    const azar = Azar.conSemilla('expuesto');
    let seNota = 0;
    let decisiones = 0;
    for (let s = 0; s < 30; s++) {
      let p = nuevaPartida(`e${s}`, 'ruperto', 0).partida;
      for (let n = 0; n < 300 && p.duelo.fase !== 'finDuelo'; n++) {
        const r = paso(p, azar);
        const d = r.novedades.decision;
        if (d?.tipo === 'envite') {
          decisiones++;
          // Si se te nota, su fuerza baja 0,2; si no, sube 0,1 (sin salirse de 0–1).
          const ajuste = r.novedades.seTeNota ? IA.exposicion.ajusteSiSeNota : IA.exposicion.ajusteSiNo;
          expect(d.fuerzaUsada).toBeCloseTo(Math.max(0, Math.min(1, d.fuerza[d.lance] + ajuste)), 10);
          if (r.novedades.seTeNota) seNota++;
        }
        p = r.partida;
      }
    }
    expect(decisiones).toBeGreaterThan(50);
    expect(seNota).toBeGreaterThan(0);
    expect(seNota).toBeLessThan(decisiones);
  }, 120_000);

  it('con Cara normal no se te nota nunca', () => {
    const azar = Azar.conSemilla('normal');
    let p = nuevaPartida('n', 'ruperto', 60).partida;
    for (let n = 0; n < 300 && p.duelo.fase !== 'finDuelo'; n++) {
      const r = paso(p, azar);
      expect(r.novedades.seTeNota).toBe(false);
      if (r.novedades.decision?.tipo === 'envite') {
        const d = r.novedades.decision;
        expect(d.fuerzaUsada).toBe(d.fuerza[d.lance]);
      }
      p = r.partida;
    }
  });

  it('ajustarla a mano (depuración) respeta los límites y a 0 te expone', () => {
    const p = nuevaPartida('a', 'ruperto', 10).partida;
    expect(ajustarCara(p, -30)).toMatchObject({ caraJugador: 0, expuesto: true });
    expect(ajustarCara(p, 200).caraJugador).toBe(100);
  });
});
