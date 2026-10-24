import { describe, expect, it } from 'vitest';
import { accionAleatoria } from '../src/depuracion/jugadorAleatorio';
import { CARA } from '../src/datos/cara';
import { GIRA } from '../src/datos/gira';
import {
  comprar,
  cuentaDeReales,
  elegirCompanero,
  elegirParada,
  elegirPremio,
  empezarDuelo,
  gastarDeLaBolsa,
  guardarGira,
  cargarGira,
  borrarGira,
  impedimentoCompra,
  nuevaGira,
  otraRonda,
  precioOtraRonda,
  premioDisponible,
  responderPlaza,
  rivalActual,
  seguirDesdeResultado,
  terminarDuelo,
  vender,
  volverAlMapa,
  type Gira,
  type Momento,
} from '../src/estado/gira';
import type { Almacen } from '../src/estado/guardado';
import { libretaVacia } from '../src/estado/libreta';
import { jugarJugador, jugarRival, leTocaAlRival, type Partida } from '../src/estado/partida';
import { Azar } from '../src/nucleo/azar';

/** Una gira recién empezada con el Lazarillo, en el mapa. */
const enElMapa = (semilla = 'gira') => elegirCompanero(nuevaGira(semilla), 'lazarillo');

/** Juega el duelo en curso hasta el final, el jugador al azar. */
function jugarDuelo(partida: Partida, semilla: string): Partida {
  const azar = Azar.conSemilla(semilla);
  let p = partida;
  for (let n = 0; p.duelo.fase !== 'finDuelo'; n++) {
    if (n > 5000) throw new Error('El duelo no termina');
    if (leTocaAlRival(p)) p = jugarRival(p).partida;
    else p = jugarJugador(p, p.duelo.fase === 'finMano' ? { tipo: 'siguienteMano' } : accionAleatoria(p.duelo, azar)).partida;
  }
  return p;
}

/** El duelo en curso, acabado a mano con el resultado que se quiera. */
function acabado(gira: Gira, ganaJugador: boolean): Partida {
  const p = structuredClone((gira.momento as Extract<Momento, { tipo: 'duelo' }>).partida);
  p.duelo.fase = 'finDuelo';
  p.duelo.ganador = ganaJugador ? 'jugador' : 'rival';
  p.duelo.marcador = ganaJugador ? { jugador: 20, rival: 9 } : { jugador: 11, rival: 20 };
  return p;
}

/** Juega el duelo del nivel en curso con el resultado indicado y vuelve a la gira. */
function duelo(gira: Gira, ganaJugador: boolean): Gira {
  const conDuelo = empezarDuelo(gira).gira;
  return terminarDuelo(conDuelo, acabado(conDuelo, ganaJugador), libretaVacia()).gira;
}

const momento = <T extends Momento['tipo']>(gira: Gira, tipo: T) => {
  expect(gira.momento.tipo).toBe(tipo);
  return gira.momento as Extract<Momento, { tipo: T }>;
};

function almacenEnMemoria(): Almacen & { datos: Map<string, string> } {
  const datos = new Map<string, string>();
  return {
    datos,
    getItem: (k) => datos.get(k) ?? null,
    setItem: (k, v) => void datos.set(k, v),
    removeItem: (k) => void datos.delete(k),
  };
}

describe('empezar la gira', () => {
  it('se empieza eligiendo compañero, con 3 de Honra, la Cara en 60 y la bolsa vacía', () => {
    const g = nuevaGira('nueva');
    expect(g.momento.tipo).toBe('companero');
    expect(g.honra).toBe(3);
    expect(g.cara).toBe(CARA.inicial);
    expect(g.bolsa).toEqual({ unUso: [], amuletos: [] });
    const conLazarillo = elegirCompanero(g, 'lazarillo');
    expect(conLazarillo.companero).toBe('lazarillo');
    expect(conLazarillo.momento.tipo).toBe('mapa');
  });

  it('la facultad va de Miguel a Chema', () => {
    let g = enElMapa();
    const rivales = [];
    for (let i = 0; i < 4; i++) {
      rivales.push(rivalActual(g));
      g = duelo(g, true);
      if (i < 3) g = volverAlMapa(elegirParada(g, 'era'));
    }
    expect(rivales).toEqual(['lucia', 'dani', 'ruben', 'chema']);
  });

  it('el duelo lleva el compañero, los amuletos y la Cara de la gira', () => {
    const g = { ...enElMapa(), cara: 42, bolsa: { unUso: [], amuletos: ['medalla' as const] } };
    const { gira, inicio } = empezarDuelo(g);
    expect(gira.momento.tipo).toBe('duelo');
    expect(inicio.partida.rivalId).toBe('lucia');
    expect(inicio.partida.caraJugador).toBe(42);
    expect(inicio.partida.extras.companero).toBe('lazarillo');
    expect(inicio.partida.extras.amuletos).toEqual(['medalla']);
  });
});

describe('al acabar un duelo', () => {
  it('se cobra lo que dice la cuenta y la Cara pasa al siguiente duelo', () => {
    const { gira } = empezarDuelo(enElMapa('cuenta'));
    const partida = jugarDuelo((gira.momento as Extract<Momento, { tipo: 'duelo' }>).partida, 'cuenta');
    const tras = terminarDuelo(gira, partida, libretaVacia()).gira;
    const { resumen } = momento(tras, 'resultado');
    expect(resumen.total).toBe(resumen.lineas.reduce((s, l) => s + l.reales, 0));
    expect(tras.reales).toBe(gira.reales + resumen.total);
    expect(tras.cara).toBe(partida.caraJugador);
    expect(resumen.lineas[0]!.concepto).toBe(resumen.ganado ? 'duelo' : 'consolacion');
  });

  it('ganar a un secuaz da los reales de su nivel (4, 5, 6) y pasa al siguiente', () => {
    const g = duelo(enElMapa(), true);
    expect(momento(g, 'resultado').resumen.lineas[0]).toEqual({ concepto: 'duelo', reales: 4 });
    expect(g.nivel).toBe(1);
    expect(g.honra).toBe(3);
    expect(g.resultados[0]).toBe('ganado');
  });

  it('perder contra un secuaz quita 1 de Honra, da 2 de consolación y se sigue al siguiente nivel', () => {
    const g = duelo(enElMapa(), false);
    const { resumen } = momento(g, 'resultado');
    expect(resumen.lineas[0]).toEqual({ concepto: 'consolacion', reales: 2 });
    expect(g.honra).toBe(2);
    expect(g.nivel).toBe(1);
    expect(g.resultados[0]).toBe('perdido');
    expect(resumen.siguiente).toBe('paradas');
  });

  it('perder contra el jefe quita Honra y se repite contra él', () => {
    let g: Gira = { ...enElMapa(), nivel: 3 };
    g = duelo(g, false);
    expect(g.nivel).toBe(3);
    expect(g.intento).toBe(1);
    expect(g.honra).toBe(2);
    g = volverAlMapa(elegirParada(g, 'era'));
    expect(rivalActual(g)).toBe('chema');
    // La revancha contra el jefe sale con otra semilla.
    expect(empezarDuelo(g).inicio.partida.semilla).not.toBe(empezarDuelo({ ...g, intento: 0 }).inicio.partida.semilla);
  });

  it('la gira solo se acaba sin Honra', () => {
    let g: Gira = { ...enElMapa(), nivel: 3, honra: 1 };
    g = duelo(g, false);
    expect(momento(g, 'resultado').resumen.siguiente).toBe('fin');
    expect(() => elegirParada(g, 'era')).toThrow();
    expect(momento(seguirDesdeResultado(g), 'fin').victoria).toBe(false);
  });

  it('ganar al jefe lleva al premio y, sin más arenas hechas, el premio acaba la gira con victoria', () => {
    let g: Gira = { ...enElMapa(), nivel: 3 };
    g = duelo(g, true);
    expect(momento(g, 'resultado').resumen.lineas[0]).toEqual({ concepto: 'duelo', reales: 10 });
    g = seguirDesdeResultado(g);
    expect(g.momento.tipo).toBe('premio');
    expect(premioDisponible(g, 'honra')).toBe(false);
    expect(premioDisponible(g, 'raro')).toBe(true);
    const conRaro = elegirPremio(g, 'raro');
    expect(conRaro.bolsa.amuletos).toContain('apuntesChema');
    expect(momento(conRaro, 'fin').victoria).toBe(true);
    // El compañero de premio es el otro, y el tuyo te deja la mitad de lo que costó.
    const conOtro = elegirPremio(g, 'companero');
    expect(conOtro.companero).toBe('recaudadora');
    expect(conOtro.reales).toBe(g.reales + 4);
  });
});

describe('los reales', () => {
  const partidaCon = (estadisticas: Partial<Partida['estadisticas']>): Partida => {
    const { inicio } = empezarDuelo(enElMapa());
    return { ...inicio.partida, estadisticas: { ...inicio.partida.estadisticas, ...estadisticas } };
  };

  it('envites, faroles y órdagos suman; la Recaudadora da 2 más y triplica el órdago de su seña', () => {
    const g = { ...enElMapa(), companero: 'recaudadora' as const, nivel: 2 };
    const { lineas } = cuentaDeReales(g, partidaCon({ envitesGanados: 2, farolesCreidos: 1, ordagosGanados: 1, ordagosTriplicados: 1 }), true);
    expect(lineas).toEqual([
      { concepto: 'duelo', reales: 6 },
      { concepto: 'envites', veces: 2, reales: 2 },
      { concepto: 'faroles', veces: 1, reales: 1 },
      { concepto: 'ordagos', veces: 1, reales: 5 },
      { concepto: 'triple', veces: 1, reales: 10 },
      { concepto: 'recaudadora', reales: 2 },
    ]);
  });

  it('la apuesta del forastero: 15 si ganas sin perder una Grande; si no, nada', () => {
    const g = { ...enElMapa(), pendiente: { forastero: true, fiesta: false } };
    expect(cuentaDeReales(g, partidaCon({ grandesPerdidas: 0 }), true).forastero).toBe('ganada');
    expect(cuentaDeReales(g, partidaCon({ grandesPerdidas: 0 }), true).lineas.at(-1)).toEqual({ concepto: 'forastero', reales: 15 });
    expect(cuentaDeReales(g, partidaCon({ grandesPerdidas: 1 }), true).forastero).toBe('perdida');
    expect(cuentaDeReales(g, partidaCon({ grandesPerdidas: 0 }), false).forastero).toBe('perdida');
  });
});

describe('la taberna', () => {
  /** Una visita a la taberna con reales de sobra. */
  const enLaTaberna = (semilla = 'taberna', reales = 40) => elegirParada({ ...duelo(enElMapa(semilla), true), reales }, 'taberna');

  it('vende dos cosas de un uso y un amuleto, y a veces el otro compañero', () => {
    let conCompanero = 0;
    for (let i = 0; i < 30; i++) {
      const { oferta } = momento(enLaTaberna(`surtido-${i}`), 'taberna');
      const objetos = oferta.cosas.filter((c) => c.tipo === 'objeto');
      expect(objetos).toHaveLength(3);
      const companeros = oferta.cosas.filter((c) => c.tipo === 'companero');
      if (companeros.length > 0) {
        conCompanero++;
        expect(companeros[0]!.id).toBe('recaudadora');
      }
    }
    expect(conCompanero).toBeGreaterThan(3);
    expect(conCompanero).toBeLessThan(20);
  });

  it('comprar resta los reales, ocupa un hueco y deja la cosa vendida', () => {
    const g = enLaTaberna();
    const { oferta } = momento(g, 'taberna');
    const tras = comprar(g, 0);
    const cosa = oferta.cosas[0]!;
    expect(tras.reales).toBe(40 - 4);
    expect(tras.bolsa.unUso).toEqual([cosa.id]);
    expect(momento(tras, 'taberna').oferta.cosas[0]!.vendida).toBe(true);
    expect(() => comprar(tras, 0)).toThrow();
  });

  it('sin hueco o sin dinero no se puede comprar', () => {
    const lleno = { ...enLaTaberna(), bolsa: { unUso: ['orujo' as const, 'orujo' as const], amuletos: [] } };
    const { oferta } = momento(lleno, 'taberna');
    expect(impedimentoCompra(lleno, oferta.cosas[0]!)).toBe('sinHueco');
    const pobre = { ...enLaTaberna(), reales: 1 };
    expect(impedimentoCompra(pobre, oferta.cosas[0]!)).toBe('sinDinero');
  });

  it('vender devuelve la mitad, redondeando hacia abajo', () => {
    const g = { ...enLaTaberna(), bolsa: { unUso: [], amuletos: ['medalla' as const] } };
    const tras = vender(g, 'amuletos', 0);
    expect(tras.reales).toBe(40 + 4);
    expect(tras.bolsa.amuletos).toEqual([]);
  });

  it('«otra ronda» cuesta 2, luego 3, y cambia lo que hay', () => {
    let g = enLaTaberna();
    expect(precioOtraRonda(momento(g, 'taberna').oferta)).toBe(2);
    g = otraRonda(g);
    expect(g.reales).toBe(38);
    expect(precioOtraRonda(momento(g, 'taberna').oferta)).toBe(3);
    g = otraRonda(g);
    expect(g.reales).toBe(35);
  });

  it('comprar otro compañero: el tuyo se despide y te deja la mitad', () => {
    let g = enLaTaberna();
    g = { ...g, momento: { tipo: 'taberna', oferta: { cosas: [{ tipo: 'companero', id: 'recaudadora', vendida: false }], rondas: 0 } } };
    const tras = comprar(g, 0);
    expect(tras.companero).toBe('recaudadora');
    expect(tras.reales).toBe(40 - 8 + 4);
  });

  it('lo usado en la mesa sale de la bolsa', () => {
    const g = { ...enElMapa(), bolsa: { unUso: ['orujo' as const, 'chato' as const], amuletos: [] } };
    expect(gastarDeLaBolsa(g, 'chato').bolsa.unUso).toEqual(['orujo']);
    expect(() => gastarDeLaBolsa(g, 'conversacion')).toThrow();
  });
});

describe('la plaza y la era', () => {
  /** La plaza, con el suceso que se pida. */
  const enLaPlaza = (evento: Extract<Momento, { tipo: 'plaza' }>['evento'], reales = 20): Gira => ({
    ...enElMapa(),
    reales,
    momento: { tipo: 'plaza', evento, desenlace: null },
  });

  it('el forastero: aceptar cuesta 5 y la apuesta va al siguiente duelo', () => {
    const g = responderPlaza(enLaPlaza({ tipo: 'forastero' }), true);
    expect(g.reales).toBe(15);
    expect(g.pendiente.forastero).toBe(true);
    expect(momento(g, 'plaza').desenlace).toBe('apuestaAceptada');
    // Sin reales, no hay apuesta aunque digas que sí.
    expect(momento(responderPlaza(enLaPlaza({ tipo: 'forastero' }, 3), true), 'plaza').desenlace).toBe('apuestaRechazada');
  });

  it('la fiesta patronal: el siguiente duelo empieza 5 a 5', () => {
    const g = volverAlMapa(responderPlaza(enLaPlaza({ tipo: 'fiesta' }), true));
    const { inicio, gira } = empezarDuelo(g);
    expect(inicio.partida.duelo.marcador).toEqual({ jugador: 5, rival: 5 });
    expect(gira.pendiente.fiesta).toBe(false);
  });

  it('el timador: si es falso, pagas y se rompe; si no, el amuleto va a la bolsa', () => {
    const falso = responderPlaza(enLaPlaza({ tipo: 'timador', objeto: 'medalla', precio: 4, falso: true }), true);
    expect(falso.reales).toBe(16);
    expect(falso.bolsa.amuletos).toEqual([]);
    expect(momento(falso, 'plaza').desenlace).toBe('timadorFalso');
    const bueno = responderPlaza(enLaPlaza({ tipo: 'timador', objeto: 'medalla', precio: 4, falso: false }), true);
    expect(bueno.bolsa.amuletos).toEqual(['medalla']);
  });

  it('la monja da 1 de Honra aunque ya tengas 3, y no vuelve a salir en la gira', () => {
    const g = responderPlaza(enLaPlaza({ tipo: 'monja' }), true);
    expect(g.honra).toBe(4);
    expect(g.monjaUsada).toBe(true);
    for (let i = 0; i < 40; i++) {
      const plaza = elegirParada({ ...duelo(enElMapa(`monja-${i}`), true), monjaUsada: true }, 'plaza');
      expect(momento(plaza, 'plaza').evento.tipo).not.toBe('monja');
    }
  });

  it('la monja sale menos que el resto', () => {
    const veces: Record<string, number> = {};
    for (let i = 0; i < 300; i++) {
      const plaza = elegirParada(duelo(enElMapa(`plaza-${i}`), true), 'plaza');
      const tipo = momento(plaza, 'plaza').evento.tipo;
      veces[tipo] = (veces[tipo] ?? 0) + 1;
    }
    expect(veces['monja']!).toBeGreaterThan(10);
    expect(veces['monja']!).toBeLessThan(veces['forastero']!);
    expect(veces['monja']!).toBeLessThan(veces['fiesta']!);
  });

  it('no se puede volver al mapa sin responder en la plaza', () => {
    expect(() => volverAlMapa(enLaPlaza({ tipo: 'forastero' }))).toThrow();
  });

  it('la era sube 20 la Cara, sin pasar de 100', () => {
    const g = duelo(enElMapa(), true);
    const era = momento(elegirParada({ ...g, cara: 50 }, 'era'), 'era');
    expect([era.antes, era.despues]).toEqual([50, 70]);
    expect(momento(elegirParada({ ...g, cara: 95 }, 'era'), 'era').despues).toBe(100);
  });
});

describe('guardado de la gira', () => {
  it('se guarda y se carga tal cual, también en mitad de un duelo', () => {
    const almacen = almacenEnMemoria();
    const g = empezarDuelo(enElMapa('guardar')).gira;
    expect(guardarGira(g, almacen)).toBe(true);
    expect(cargarGira(almacen)).toEqual(g);
    borrarGira(almacen);
    expect(cargarGira(almacen)).toBeNull();
  });

  it('una gira acabada o con datos rotos no se carga', () => {
    const almacen = almacenEnMemoria();
    guardarGira({ ...enElMapa(), momento: { tipo: 'fin', victoria: false } }, almacen);
    expect(cargarGira(almacen)).toBeNull();
    almacen.datos.set('ordago.gira', '{roto');
    expect(cargarGira(almacen)).toBeNull();
    almacen.datos.set('ordago.gira', JSON.stringify({ version: 1, datos: { semilla: 'x' } }));
    expect(cargarGira(almacen)).toBeNull();
  });
});

describe('los números de la gira', () => {
  it('son los del documento', () => {
    expect(GIRA.realesPorNivel).toEqual([4, 5, 6, 10]);
    expect(GIRA.huecos).toEqual({ unUso: 2, amuletos: 2 });
  });
});
