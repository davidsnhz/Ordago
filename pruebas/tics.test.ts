import { describe, expect, it } from 'vitest';
import { IA } from '../src/datos/ia';
import { RIVALES, ticsActivos, type DefinicionTic } from '../src/datos/rivales';
import { Azar } from '../src/nucleo/azar';
import { crearBaraja } from '../src/nucleo/baraja';
import type { Carta } from '../src/nucleo/carta';
import {
  cumpleDisparador,
  esManoFuerte,
  probabilidadEnFalso,
  seTeNota,
  sortearTics,
  tasaBase,
  type ContextoTic,
  type MomentoTic,
} from '../src/nucleo/ia/tics';
import { cartas } from './ayudas';

const RUPERTO = RIVALES.ruperto.tics;
const siempre = { siguiente: () => 0, probabilidad: () => true } as unknown as Azar;

function ctx(mano: Carta[], momento: MomentoTic = { tipo: 'cartas' }, extra: Partial<ContextoTic> = {}): ContextoTic {
  return { cartas: mano, modo: 8, momento, caraJugador: 60, faroleo: 5, ...extra };
}

/** Fiabilidad observada de cada tic en muchas manos al azar. */
function fiabilidadObservada(tics: readonly DefinicionTic[], manos: number, momento: (azar: Azar) => Omit<ContextoTic, 'cartas'>) {
  const azar = Azar.conSemilla('tics');
  const baraja = crearBaraja();
  const vistos = new Map<string, { veces: number; verdaderos: number }>();
  for (let i = 0; i < manos; i++) {
    const mano = azar.barajar(baraja).slice(0, 4);
    for (const tic of sortearTics(tics, { cartas: mano, ...momento(azar) }, azar)) {
      const cuenta = vistos.get(tic.id) ?? { veces: 0, verdaderos: 0 };
      cuenta.veces++;
      if (tic.verdadero) cuenta.verdaderos++;
      vistos.set(tic.id, cuenta);
    }
  }
  return vistos;
}

describe('tics que salen de las cartas', () => {
  it('las tasas base son razonables: pares en muchas manos, 31 en pocas', () => {
    expect(tasaBase('pares', 8)).toBeGreaterThan(0.3);
    expect(tasaBase('pares', 8)).toBeLessThan(0.7);
    expect(tasaBase('treintaYUna', 8)).toBeGreaterThan(0.02);
    expect(tasaBase('treintaYUna', 8)).toBeLessThan(0.2);
    expect(tasaBase('manoFuerte', 8)).toBeGreaterThan(0.1);
    expect(tasaBase('manoFuerte', 8)).toBeLessThan(0.5);
  });

  it('la probabilidad de hacerlo en falso da exactamente la fiabilidad de la tabla', () => {
    for (const tic of [...RUPERTO, ...RIVALES.engracia.tics.filter((t) => t.disparador === 'manoFuerte')]) {
      if (tic.disparador === 'farol' || tic.disparador === 'sospecha' || tic.disparador === 'ninguno') continue;
      const p = IA.tics.probabilidadSiCumple;
      const q = tasaBase(tic.disparador, 8);
      const falso = probabilidadEnFalso(tic, { modo: 8, faroleo: 0 });
      expect(falso).toBeGreaterThan(0);
      expect((p * q) / (p * q + falso * (1 - q))).toBeCloseTo(tic.fiabilidad, 10);
    }
  });

  it('jugando muchas manos, la fiabilidad observada es la de la tabla', () => {
    const tics = [...RUPERTO, RIVALES.engracia.tics[0]!, RIVALES.anselmo.tics[0]!, RIVALES.anselmo.tics[2]!];
    const vistos = fiabilidadObservada(tics, 150_000, () => ({ modo: 8, momento: { tipo: 'cartas' }, caraJugador: 60, faroleo: 5 }));
    for (const tic of tics) {
      const { veces, verdaderos } = vistos.get(tic.id)!;
      expect(verdaderos / veces, tic.id).toBeGreaterThan(tic.fiabilidad - 0.03);
      expect(verdaderos / veces, tic.id).toBeLessThan(tic.fiabilidad + 0.03);
    }
  }, 60_000);

  it('mano fuerte: duples, medias, 31, tres reyes o tres pitos', () => {
    for (const mano of ['R R C C', 'C C C 4', 'R C S A', 'R R 3 5', 'A 2 A 7']) expect(esManoFuerte(cartas(mano), 8), mano).toBe(true);
    // Ojo: R R 5 6 suma 31. Estas no tienen nada fuerte.
    for (const mano of ['R R 6 4', 'C S 7 6', 'A 4 5 6']) expect(esManoFuerte(cartas(mano), 8), mano).toBe(false);
  });

  it('al declarar o envidar solo aparece el tic de ese lance', () => {
    const mano = cartas('R R 7 4'); // pareja de reyes y 31
    const ids = (m: MomentoTic) => sortearTics(RUPERTO, ctx(mano, m), siempre).map((t) => t.id);
    expect(ids({ tipo: 'cartas' })).toEqual(['rascaBarba', 'arremanga']);
    expect(ids({ tipo: 'declaracion', lance: 'pares' })).toEqual(['rascaBarba']);
    expect(ids({ tipo: 'envite', lance: 'juego' })).toEqual(['arremanga']);
    expect(ids({ tipo: 'envite', lance: 'grande' })).toEqual([]);
  });

  it('marca si el tic era verdad', () => {
    expect(sortearTics(RUPERTO, ctx(cartas('R R 7 4')), siempre).every((t) => t.verdadero)).toBe(true);
    expect(sortearTics(RUPERTO, ctx(cartas('A 4 5 6')), siempre).every((t) => !t.verdadero)).toBe(true);
  });
});

describe('tics que salen de la decisión', () => {
  const miraAlCielo = RIVALES.anselmo.tics.find((t) => t.id === 'miraAlCielo')!;
  const miraFijamente = RIVALES.engracia.tics.find((t) => t.id === 'miraFijamente')!;
  const vara = RIVALES.fulgencio.tics.find((t) => t.id === 'golpeaVara')!;
  const envite = { tipo: 'envite', lance: 'grande' } as const;

  it('el tic de farol solo se sortea cuando decide un envite sin nada delante', () => {
    expect(cumpleDisparador('farol', ctx([], envite, { decision: { abre: true, farol: true, responde: false } }))).toBe(true);
    expect(cumpleDisparador('farol', ctx([], envite, { decision: { abre: true, farol: false, responde: false } }))).toBe(false);
    expect(cumpleDisparador('farol', ctx([], envite, { decision: { abre: false, farol: false, responde: true } }))).toBeNull();
    expect(cumpleDisparador('farol', ctx([], { tipo: 'cartas' }))).toBeNull();
  });

  it('la sospecha de Doña Ignacia: al responder a tu envite, si tu Cara está baja', () => {
    const responde = { abre: false, farol: false, responde: true };
    expect(cumpleDisparador('sospecha', ctx([], envite, { decision: responde, caraJugador: 20 }))).toBe(true);
    expect(cumpleDisparador('sospecha', ctx([], envite, { decision: responde, caraJugador: 60 }))).toBe(false);
    expect(cumpleDisparador('sospecha', ctx([], envite, { decision: { ...responde, responde: false, abre: true } }))).toBeNull();
  });

  it('el farol de Don Francisco acierta más o menos su 70 % cuando farolea como dice su Faroleo', () => {
    const vistos = fiabilidadObservada([miraAlCielo], 120_000, (azar) => {
      // Decisiones de abrir: con F uniforme, farolea si F < 0,35 y sale el 0,04·B.
      const farol = azar.siguiente() < IA.farol.fuerzaMaxima && azar.siguiente() < IA.farol.porFaroleo * 5;
      return { modo: 8, momento: envite, caraJugador: 60, faroleo: 5, decision: { abre: true, farol, responde: false } };
    });
    const { veces, verdaderos } = vistos.get('miraAlCielo')!;
    expect(verdaderos / veces).toBeGreaterThan(0.66);
    expect(verdaderos / veces).toBeLessThan(0.74);
  }, 60_000);

  it('la vara de Aurelio no significa nada: nunca es verdad y sale a menudo', () => {
    const azar = Azar.conSemilla('vara');
    let veces = 0;
    for (let i = 0; i < 10_000; i++) {
      const salen = sortearTics([vara], ctx(cartas('R R R R')), azar);
      veces += salen.length;
      expect(salen.every((t) => !t.verdadero)).toBe(true);
    }
    expect(veces / 10_000).toBeCloseTo(IA.tics.probabilidadSinSentido, 1);
  });

  it('la sospecha está calibrada para su 90 %', () => {
    const p = IA.tics.probabilidadSiCumple;
    const q = IA.tics.tasaSospecha;
    const falso = probabilidadEnFalso(miraFijamente, { modo: 8, faroleo: 1 });
    expect((p * q) / (p * q + falso * (1 - q))).toBeCloseTo(0.9, 10);
  });
});

describe('Don Rodrigo cambia de tics según las piedras', () => {
  const ids = (piedras: number) => ticsActivos(RIVALES.bonifacio, piedras).map((t) => t.id);
  it('empieza con los del Herrero, a 10 pasa a los del Cura y a 15 solo le delata el puro', () => {
    expect(ids(0)).toEqual(['rascaBarba', 'arremanga']);
    expect(ids(9)).toEqual(['rascaBarba', 'arremanga']);
    expect(ids(10)).toEqual(['bebeVino', 'miraAlCielo', 'juntaManos']);
    expect(ids(15)).toEqual(['humoPuro']);
  });
});

describe('Cara a 0: se te nota', () => {
  it('te tiembla el pulso con buena mano, y acierta su 80 %', () => {
    const azar = Azar.conSemilla('pulso');
    let veces = 0;
    let verdaderos = 0;
    for (let i = 0; i < 100_000; i++) {
      const r = seTeNota(azar.siguiente(), azar);
      if (r.seNota) {
        veces++;
        if (r.verdadero) verdaderos++;
      }
    }
    expect(verdaderos / veces).toBeGreaterThan(0.77);
    expect(verdaderos / veces).toBeLessThan(0.83);
  });
});
