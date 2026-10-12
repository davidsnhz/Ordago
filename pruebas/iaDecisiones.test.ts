import { describe, expect, it } from 'vitest';
import { IA } from '../src/datos/ia';
import { RIVALES } from '../src/datos/rivales';
import { aplicarEnvite, iniciarEnvite, type AccionEnvite, type EstadoEnvite } from '../src/nucleo/apuestas';
import { Azar } from '../src/nucleo/azar';
import {
  cantidadEnvite,
  decidirEnvite,
  umbralEnvidar,
  umbralOrdago,
  valorParaAceptar,
  type SituacionEnvite,
} from '../src/nucleo/ia/decisiones';

const RUPERTO = RIVALES.ruperto.parametros;
const ENGRACIA = RIVALES.engracia.parametros;
const LIMITES = { enviteMinimo: 2, subidaMinima: 2, deje: 1 };

/** Azar de pega: siempre devuelve el mismo número (ε = 0 con 0,5). */
const azarFijo = (x: number) => ({ siguiente: () => x, probabilidad: (p: number) => x < p }) as unknown as Azar;

/** Ronda en la que el jugador (mano) ya ha hecho estas acciones y le toca al rival. */
function ronda(...acciones: AccionEnvite[]): EstadoEnvite {
  return acciones.reduce((e, a) => aplicarEnvite(e, e.turno, a, LIMITES), iniciarEnvite('jugador'));
}

function situacion(F: number, envite: EstadoEnvite, cambios: Partial<SituacionEnvite> = {}): SituacionEnvite {
  return { F, envite, limites: LIMITES, diferencia: 0, caraJugador: 60, tFarol: 0, aceptaTodo: false, ...cambios };
}

const decide = (F: number, envite: EstadoEnvite, x: number, cambios: Partial<SituacionEnvite> = {}) =>
  decidirEnvite(situacion(F, envite, cambios), RUPERTO, azarFijo(x)).accion;

const sinEnvite = () => ronda({ tipo: 'paso' });
const conEnvite = () => ronda({ tipo: 'envido', piedras: 2 });
const conOrdago = () => ronda({ tipo: 'ordago' });

describe('fórmulas del documento', () => {
  it('umbral para envidar: 0,65 − 0,03·(A − 5)', () => {
    expect(umbralEnvidar(RUPERTO)).toBeCloseTo(0.56);
    expect(umbralEnvidar(ENGRACIA)).toBeCloseTo(0.71);
  });

  it('cantidad: 2 de base y, con A ≥ 6, una más por cada 0,1 sobre el umbral', () => {
    expect(cantidadEnvite(0.95, RUPERTO)).toBe(5);
    expect(cantidadEnvite(0.6, RUPERTO)).toBe(2);
    expect(cantidadEnvite(0.95, ENGRACIA)).toBe(2);
  });

  it('aceptar: F + (50 − Cara)/200 + Me/10·0,6·(t_farol − 0,25) + 0,75·(0,5 − (X − d)/2X) + ε', () => {
    const s = situacion(0.7, conEnvite(), { caraJugador: 60, tFarol: 0.5 });
    // 0,7 − 0,05 + 0,2·0,6·0,25 + 0,75·(0,5 − 0,25) + 0
    expect(valorParaAceptar(s, RUPERTO, azarFijo(0.5))).toBeCloseTo(0.8675);
    // Con Cara baja se acepta más.
    expect(valorParaAceptar({ ...s, caraJugador: 10 }, RUPERTO, azarFijo(0.5))).toBeCloseTo(1.1175);
    // El ruido está entre −0,05 y +0,05.
    expect(valorParaAceptar(s, RUPERTO, azarFijo(0))).toBeCloseTo(0.8175);
  });

  it('lo que se arriesga: un envite pequeño se acepta más que uno grande, y el órdago no cambia', () => {
    // Cara 50 y t_farol 0,25: ni la Cara ni la memoria suman nada.
    const neutro = { caraJugador: 50, tFarol: 0.25 };
    // Envido dos con deje 1: compensa aceptar con F > (2 − 1)/4 = 0,25, así que suma 0,75·(0,5 − 0,25).
    expect(valorParaAceptar(situacion(0.4, conEnvite(), neutro), RUPERTO, azarFijo(0.5))).toBeCloseTo(0.5875);
    // Dos más sobre dos queridos (4 en juego, deje 2): (4 − 2)/8 = 0,25 también.
    const subida = ronda({ tipo: 'envido', piedras: 2 }, { tipo: 'mas', piedras: 2 });
    expect(valorParaAceptar(situacion(0.4, subida, neutro), RUPERTO, azarFijo(0.5))).toBeCloseTo(0.5875);
    // Envido diez: (10 − 1)/20 = 0,45, así que solo suma 0,75·0,05.
    const diez = ronda({ tipo: 'envido', piedras: 10 });
    expect(valorParaAceptar(situacion(0.4, diez, neutro), RUPERTO, azarFijo(0.5))).toBeCloseTo(0.4375);
    // Al órdago no se le aplica.
    expect(valorParaAceptar(situacion(0.4, conOrdago(), neutro), RUPERTO, azarFijo(0.5))).toBeCloseTo(0.4);
    // Con peso 0 es la fórmula original del documento.
    const aceptar = IA.aceptar as { pesoCuota: number };
    const antes = aceptar.pesoCuota;
    try {
      aceptar.pesoCuota = 0;
      expect(valorParaAceptar(situacion(0.4, conEnvite(), neutro), RUPERTO, azarFijo(0.5))).toBeCloseTo(0.4);
    } finally {
      aceptar.pesoCuota = antes;
    }
  });

  it('aceptar un órdago: el umbral sube 0,04·M y baja 0,1 si va perdiendo de 8', () => {
    expect(umbralOrdago(situacion(0.5, conOrdago()), RUPERTO)).toBeCloseTo(0.58);
    expect(umbralOrdago(situacion(0.5, conOrdago()), ENGRACIA)).toBeCloseTo(0.86);
    expect(umbralOrdago(situacion(0.5, conOrdago(), { diferencia: -8 }), RUPERTO)).toBeCloseTo(0.48);
  });
});

describe('Ruperto habla sin envite delante', () => {
  it('con F > 0,85 tira órdago una de cada cuatro veces (0,03·8); si no, envida fuerte', () => {
    expect(decide(0.9, sinEnvite(), 0.2)).toEqual({ tipo: 'ordago' });
    expect(decide(0.9, sinEnvite(), 0.3)).toEqual({ tipo: 'envido', piedras: 5 });
    expect(decide(0.9, sinEnvite(), 0.95)).toEqual({ tipo: 'envido', piedras: 5 });
  });

  it('envida con F por encima de su umbral (0,56)', () => {
    expect(decide(0.6, sinEnvite(), 0.5)).toEqual({ tipo: 'envido', piedras: 2 });
  });

  it('pasa con una mano normal', () => {
    expect(decide(0.5, sinEnvite(), 0.5)).toEqual({ tipo: 'paso' });
  });

  it('farolea poco: con F < 0,35 envida 2 con probabilidad 0,04·3 = 0,12', () => {
    expect(decide(0.2, sinEnvite(), 0.05)).toEqual({ tipo: 'envido', piedras: 2 });
    expect(decide(0.2, sinEnvite(), 0.5)).toEqual({ tipo: 'paso' });
  });

  it('perdiendo de 8 puede tirar un órdago de farol (0,01·3)', () => {
    expect(decide(0.2, sinEnvite(), 0.02, { diferencia: -8 })).toEqual({ tipo: 'ordago' });
    expect(decide(0.2, sinEnvite(), 0.02, { diferencia: -7 })).toEqual({ tipo: 'envido', piedras: 2 });
  });

  it('la frecuencia real de faroles es la del documento', () => {
    const azar = Azar.conSemilla('faroles');
    let faroles = 0;
    for (let i = 0; i < 20_000; i++) {
      if (decidirEnvite(situacion(0.2, sinEnvite()), RUPERTO, azar).accion.tipo === 'envido') faroles++;
    }
    expect(faroles / 20_000).toBeCloseTo(0.12, 1);
  });
});

describe('Ruperto responde a un envite', () => {
  it('quiere con mano decente y no quiere con mano mala', () => {
    expect(decide(0.7, conEnvite(), 0.5)).toEqual({ tipo: 'quiero' });
    expect(decide(0.25, conEnvite(), 0.5)).toEqual({ tipo: 'noQuiero' });
  });

  it('con una mano regular quiere un envido dos, que arriesga poco, pero no un envido diez', () => {
    expect(decide(0.4, conEnvite(), 0.5)).toEqual({ tipo: 'quiero' });
    expect(decide(0.4, ronda({ tipo: 'envido', piedras: 10 }), 0.5)).toEqual({ tipo: 'noQuiero' });
  });

  it('sube con mano muy buena', () => {
    expect(decide(0.8, conEnvite(), 0.5)).toEqual({ tipo: 'mas', piedras: 4 });
  });

  it('con F > 0,85 sube fuerte, pero no responde con órdago', () => {
    expect(decide(0.9, conEnvite(), 0.3)).toEqual({ tipo: 'mas', piedras: 5 });
    expect(decide(0.9, conEnvite(), 0.01)).toEqual({ tipo: 'mas', piedras: 5 });
  });

  it('no sube por encima de 10 piedras', () => {
    const grande = ronda({ tipo: 'envido', piedras: 10 });
    expect(decide(0.8, grande, 0.5)).toEqual({ tipo: 'quiero' });
  });

  it('enfadado, acepta todo', () => {
    expect(decide(0.1, conEnvite(), 0.5, { aceptaTodo: true })).toEqual({ tipo: 'quiero' });
    expect(decide(0.1, conOrdago(), 0.5, { aceptaTodo: true })).toEqual({ tipo: 'quiero' });
  });
});

describe('Ruperto responde a un órdago', () => {
  it('acepta por orgullo con poco más de media mano', () => {
    // valor = F − 0,05 − 0,03; umbral 0,58.
    expect(decide(0.6, conOrdago(), 0.5)).toEqual({ tipo: 'noQuiero' });
    expect(decide(0.7, conOrdago(), 0.5)).toEqual({ tipo: 'quiero' });
  });

  it('desesperado, acepta más', () => {
    expect(decide(0.6, conOrdago(), 0.5, { diferencia: -8 })).toEqual({ tipo: 'quiero' });
  });

  it('ante un órdago solo dice quiero o no quiero', () => {
    for (let F = 0; F <= 1; F += 0.05) {
      expect(['quiero', 'noQuiero']).toContain(decide(F, conOrdago(), 0.5).tipo);
    }
  });
});
