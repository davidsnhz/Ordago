import { describe, expect, it } from 'vitest';
import { accionAleatoria } from '../src/depuracion/jugadorAleatorio';
import { CARA } from '../src/datos/cara';
import { GIRA } from '../src/datos/gira';
import { ORDEN_RIVALES } from '../src/datos/rivales';
import {
  comprar,
  cuentaDeReales,
  elegirCompanero,
  elegirParada,
  elegirPremio,
  empezarCalle,
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
  terminarCalle,
  terminarDuelo,
  vender,
  volverAlMapa,
  type Gira,
  type Momento,
} from '../src/estado/gira';
import type { Almacen } from '../src/estado/guardado';
import { libretaVacia } from '../src/estado/libreta';
import { poseDelRival } from '../src/estado/mesa';
import { jugarJugador, jugarRival, leTocaAlRival, nuevaPartida, type Partida } from '../src/estado/partida';
import { Azar, estadoDesdeSemilla } from '../src/nucleo/azar';

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

describe('las piedras de cada nivel', () => {
  it('cada duelo pide más que el anterior, y el del jefe es el más largo', () => {
    let g = enElMapa('piedras');
    const piedras = [];
    for (let i = 0; i < 4; i++) {
      const conDuelo = empezarDuelo(g).gira;
      piedras.push((conDuelo.momento as Extract<Momento, { tipo: 'duelo' }>).partida.duelo.reglas.piedrasParaGanar);
      g = terminarDuelo(conDuelo, acabado(conDuelo, true), libretaVacia()).gira;
      if (i < 3) g = volverAlMapa(elegirParada(g, 'era'));
    }
    expect(piedras).toEqual([...GIRA.piedrasPorNivel]);
    expect([...piedras].sort((a, b) => a - b)).toEqual(piedras);
    expect(new Set(piedras).size).toBe(4);
  });

  it('la revancha contra el jefe es a las mismas piedras', () => {
    const anteElJefe: Gira = { ...enElMapa('revancha'), nivel: 3, resultados: ['ganado', 'ganado', 'ganado', null] };
    const primera = empezarDuelo(anteElJefe).gira;
    const tras = terminarDuelo(primera, acabado(primera, false), libretaVacia()).gira;
    const revancha = empezarDuelo(volverAlMapa(elegirParada(tras, 'era'))).inicio.partida;
    expect(revancha.duelo.reglas.piedrasParaGanar).toBe(GIRA.piedrasPorNivel[3]);
  });

  it('el duelo suelto sigue siendo a 20', () => {
    expect(nuevaPartida('suelto', 'chema').partida.duelo.reglas.piedrasParaGanar).toBe(20);
  });
});

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

  it('ganar al jefe lleva al premio, y el premio a una parada antes de la arena siguiente', () => {
    let g: Gira = { ...enElMapa(), nivel: 3 };
    g = duelo(g, true);
    expect(momento(g, 'resultado').resumen.lineas[0]).toEqual({ concepto: 'duelo', reales: 10 });
    g = seguirDesdeResultado(g);
    expect(g.momento.tipo).toBe('premio');
    expect(premioDisponible(g, 'honra')).toBe(false);
    expect(premioDisponible(g, 'raro')).toBe(true);
    const conRaro = elegirPremio(g, 'raro');
    expect(conRaro.bolsa.amuletos).toContain('apuntesChema');
    expect(conRaro.arena).toBe(1);
    expect(conRaro.nivel).toBe(0);
    expect(conRaro.resultados).toEqual([null, null, null, null]);
    expect(momento(conRaro, 'resultado').resumen.siguiente).toBe('paradas');
    expect(rivalActual(conRaro)).toBe('tono');
    expect(volverAlMapa(elegirParada(conRaro, 'era')).momento.tipo).toBe('mapa');
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

  it('la fiesta patronal: el siguiente duelo empieza con la cuarta parte de sus piedras cada uno', () => {
    const g = volverAlMapa(responderPlaza(enLaPlaza({ tipo: 'fiesta' }), true));
    const { inicio, gira } = empezarDuelo(g);
    // Es el primer nivel, a 25 piedras: la cuarta parte, redondeando.
    expect(inicio.partida.duelo.reglas.piedrasParaGanar).toBe(25);
    expect(inicio.partida.duelo.marcador).toEqual({ jugador: 6, rival: 6 });
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

describe('el bar', () => {
  /** Una gira en el bar, en el nivel que se pida. */
  const enElBar = (nivel = 0, semilla = 'bar'): Gira => ({ ...enElMapa(semilla), arena: 1, nivel, resultados: [null, null, null, null] });
  const contra = (nivel: number, marcador: { jugador: number; rival: number }, ganador: 'jugador' | 'rival' = 'jugador') => {
    const g = empezarDuelo(enElBar(nivel)).gira;
    const p = structuredClone((g.momento as Extract<Momento, { tipo: 'duelo' }>).partida);
    p.duelo.fase = 'finDuelo';
    p.duelo.ganador = ganador;
    p.duelo.marcador = marcador;
    return terminarDuelo(g, p, libretaVacia()).gira;
  };

  it('va de Toño a Manolo, a las mismas piedras que la facultad', () => {
    const rivales = [];
    let g = enElBar();
    for (let i = 0; i < 4; i++) {
      rivales.push(rivalActual(g));
      const conDuelo = empezarDuelo(g).gira;
      expect((conDuelo.momento as Extract<Momento, { tipo: 'duelo' }>).partida.duelo.reglas.piedrasParaGanar).toBe(GIRA.piedrasPorNivel[i]);
      g = terminarDuelo(conDuelo, acabado(conDuelo, true), libretaVacia()).gira;
      if (i < 3) g = volverAlMapa(elegirParada(g, 'era'));
    }
    expect(rivales).toEqual(['tono', 'ruperto', 'fulgencio', 'manolo']);
  });

  it('el premio de Manolo es su Jarra; con la Montaña Palentina sin hacer, la gira acaba con victoria', () => {
    const g = seguirDesdeResultado(contra(3, { jugador: 40, rival: 22 }));
    expect(premioDisponible(g, 'raro')).toBe(true);
    const fin = elegirPremio(g, 'raro');
    expect(fin.bolsa.amuletos).toContain('jarraManolo');
    expect(momento(fin, 'fin').victoria).toBe(true);
  });

  it('Aurelio le invita: basta con ganarle, y Manolo se suelta una mano antes', () => {
    const ganado = contra(2, { jugador: 35, rival: 34 });
    expect(momento(ganado, 'resultado').resumen.aviso).toBe('aurelioInvita');
    expect(momento(contra(2, { jugador: 34, rival: 35 }, 'rival'), 'resultado').resumen.aviso).toBeNull();
    const { inicio, gira } = empezarDuelo(volverAlMapa(elegirParada(ganado, 'era')));
    expect(rivalActual(gira)).toBe('manolo');
    expect(inicio.novedades.aviso).toBe('aurelioInvita');
    expect(inicio.partida.extras.aviso).toBe('aurelioInvita');
    expect(poseDelRival(inicio.partida)).toBeNull();
    expect(poseDelRival({ ...inicio.partida, duelo: { ...inicio.partida.duelo, numeroMano: 2 } })).toBe('achispado');
  });

  it('la taberna de la facultad no vende lo del bar; la del bar, sí', () => {
    const delBar = new Set<string>(['copaAnis', 'cafePuchero', 'invitarRonda', 'pelota', 'ristra', 'yesquero', 'hucha', 'navaja']);
    const vendido = (g: Gira) => momento(elegirParada(g, 'taberna'), 'taberna').oferta.cosas.map((c) => c.id as string);
    const enLaFacultad: string[] = [];
    const enElBarVenden: string[] = [];
    const trasTono = contra(0, { jugador: 25, rival: 9 });
    for (let i = 0; i < 40; i++) {
      enLaFacultad.push(...vendido(duelo(enElMapa(`tab-${i}`), true)));
      enElBarVenden.push(...vendido({ ...trasTono, azar: estadoDesdeSemilla(`tab-${i}`) }));
    }
    expect(enLaFacultad.filter((id) => delBar.has(id))).toEqual([]);
    expect(enElBarVenden.filter((id) => delBar.has(id)).length).toBeGreaterThan(0);
  });

  it('la Hucha de barro da 1 real por cada 5 ahorrados al acabar la arena, hasta 5', () => {
    const conHucha = (reales: number) => {
      const antes = { ...enElMapa(`hucha-${reales}`), nivel: 3, bolsa: { unUso: [], amuletos: ['hucha' as const] } };
      const g = empezarDuelo(antes).gira;
      const tras = terminarDuelo(g, acabado(g, true), libretaVacia()).gira;
      return { ...seguirDesdeResultado(tras), reales };
    };
    const conDoce = elegirPremio(conHucha(12), 'raro');
    expect(conDoce.reales).toBe(12 + 2);
    expect(momento(conDoce, 'resultado').resumen.lineas.at(-1)).toEqual({ concepto: 'hucha', reales: 2 });
    expect(elegirPremio(conHucha(100), 'raro').reales).toBe(100 + 5);
  });

  it('la Navaja de Albacete: el órdago que ganas te devuelve 1 de Honra, sin pasar de 3', () => {
    const conNavaja = (honra: number, ordagos: number) => {
      const antes = { ...enElMapa('navaja'), honra, bolsa: { unUso: [], amuletos: ['navaja' as const] } };
      const g = empezarDuelo(antes).gira;
      const p = acabado(g, true);
      p.estadisticas.ordagosGanados = ordagos;
      return terminarDuelo(g, p, libretaVacia()).gira.honra;
    };
    expect(conNavaja(2, 1)).toBe(3);
    expect(conNavaja(3, 1)).toBe(3);
    expect(conNavaja(2, 0)).toBe(2);
  });
});

describe('la partida en la calle', () => {
  const enLaPlaza = (reales = 7): Gira => ({
    ...duelo(enElMapa('calle'), true),
    reales,
    cara: 55,
    momento: { tipo: 'plaza', evento: { tipo: 'calle' }, desenlace: null },
  });
  /** La mano en la calle, acabada a mano con el resultado que se quiera. */
  const acabada = (gira: Gira, ganaJugador: boolean, cara = 90): Partida => {
    const p = structuredClone((gira.momento as Extract<Momento, { tipo: 'calle' }>).partida);
    p.duelo.fase = 'finDuelo';
    p.duelo.ganador = ganaJugador ? 'jugador' : 'rival';
    p.caraJugador = cara;
    return p;
  };

  it('es una mano contra el vecino, sin bolsa ni compañero', () => {
    const g = { ...enLaPlaza(), bolsa: { unUso: [], amuletos: ['medalla' as const] } };
    const { gira, inicio } = empezarCalle(g);
    expect(gira.momento.tipo).toBe('calle');
    expect(inicio.partida.rivalId).toBe('vecino');
    expect(inicio.partida.duelo.reglas.unaSolaMano).toBe(true);
    expect(inicio.partida.caraJugador).toBe(55);
    expect(inicio.partida.extras.companero).toBeNull();
    expect(inicio.partida.extras.amuletos).toEqual([]);
  });

  it('si la ganas, 3 reales; si la pierdes, nada, y la Cara se queda como estaba', () => {
    const g = empezarCalle(enLaPlaza(7)).gira;
    const ganada = terminarCalle(g, acabada(g, true));
    expect(ganada.reales).toBe(7 + GIRA.plaza.calle.premio);
    expect(ganada.cuenta.reales).toBe(g.cuenta.reales + GIRA.plaza.calle.premio);
    expect(ganada.cara).toBe(55);
    expect(momento(ganada, 'plaza').desenlace).toBe('calleGanada');

    const perdida = terminarCalle(g, acabada(g, false, 10));
    expect(perdida.reales).toBe(7);
    expect(perdida.cara).toBe(55);
    expect(perdida.honra).toBe(g.honra);
    expect(momento(perdida, 'plaza').desenlace).toBe('callePerdida');
  });

  it('jugada de verdad acaba en una mano, y después se vuelve al mapa', () => {
    for (let i = 0; i < 12; i++) {
      const g = empezarCalle({ ...enLaPlaza(), semilla: `calle-${i}` }).gira;
      const p = jugarDuelo((g.momento as Extract<Momento, { tipo: 'calle' }>).partida, `calle-${i}`);
      expect(p.duelo.numeroMano).toBe(1);
      expect(p.duelo.ganador).not.toBeNull();
      expect(volverAlMapa(terminarCalle(g, p)).momento.tipo).toBe('mapa');
    }
  });

  it('se puede rechazar sin que pase nada, y no se vuelve al mapa sin responder', () => {
    const g = enLaPlaza();
    expect(() => volverAlMapa(g)).toThrow();
    const no = responderPlaza(g, false);
    expect(momento(no, 'plaza').desenlace).toBe('calleRechazada');
    expect(no.reales).toBe(g.reales);
    expect(volverAlMapa(no).momento.tipo).toBe('mapa');
  });

  it('sale en la plaza, y el vecino no está en la lista de los duelos', () => {
    const salen = new Set<string>();
    for (let i = 0; i < 80; i++) salen.add(momento(elegirParada(duelo(enElMapa(`vecino-${i}`), true), 'plaza'), 'plaza').evento.tipo);
    expect(salen).toContain('calle');
    expect(ORDEN_RIVALES).not.toContain('vecino');
  });

  it('se guarda y se retoma a medias', () => {
    const almacen = almacenEnMemoria();
    const g = empezarCalle(enLaPlaza()).gira;
    guardarGira(g, almacen);
    expect(cargarGira(almacen)?.momento.tipo).toBe('calle');
  });
});

describe('Rubén le avisa', () => {
  /** Enfrente de Rubén. */
  const anteRuben = (semilla = 'aviso'): Gira => ({ ...enElMapa(semilla), nivel: 2, resultados: ['ganado', 'ganado', null, null] });
  const contraRuben = (marcador: { jugador: number; rival: number }, ganador: 'jugador' | 'rival' = 'jugador') => {
    const g = empezarDuelo(anteRuben()).gira;
    const p = structuredClone((g.momento as Extract<Momento, { tipo: 'duelo' }>).partida);
    p.duelo.fase = 'finDuelo';
    p.duelo.ganador = ganador;
    p.duelo.marcador = marcador;
    return terminarDuelo(g, p, libretaVacia()).gira;
  };

  it('si le ganas de 10 o más, Rubén se lo cuenta a Chema; si no, no', () => {
    const deDiez = contraRuben({ jugador: 20, rival: 10 });
    expect(momento(deDiez, 'resultado').resumen.aviso).toBe('rubenAvisa');
    expect(deDiez.pendiente.aviso).toBe('rubenAvisa');

    const deNueve = contraRuben({ jugador: 20, rival: 11 });
    expect(momento(deNueve, 'resultado').resumen.aviso).toBeNull();
    expect(deNueve.pendiente.aviso).toBeFalsy();

    const pierdes = contraRuben({ jugador: 2, rival: 20 }, 'rival');
    expect(momento(pierdes, 'resultado').resumen.aviso).toBeNull();
  });

  it('solo Rubén: ganarles de mucho a los otros secuaces no avisa a nadie', () => {
    const g = empezarDuelo(enElMapa()).gira;
    const tras = terminarDuelo(g, acabado(g, true), libretaVacia()).gira;
    expect(momento(tras, 'resultado').resumen.aviso).toBeNull();
    expect(tras.pendiente.aviso).toBeFalsy();
  });

  it('Chema empieza arrugado, y la mesa lo cuenta', () => {
    const conAviso = volverAlMapa(elegirParada(contraRuben({ jugador: 20, rival: 4 }), 'era'));
    expect(rivalActual(conAviso)).toBe('chema');
    const { gira, inicio } = empezarDuelo(conAviso);
    expect(inicio.novedades.aviso).toBe('rubenAvisa');
    expect(inicio.partida.extras.aviso).toBe('rubenAvisa');
    expect(poseDelRival(inicio.partida)).toBe('arrugado');
    expect(gira.pendiente.aviso).toBeNull();
  });

  it('sin aviso, Chema empieza como siempre', () => {
    const sinAviso = volverAlMapa(elegirParada(contraRuben({ jugador: 20, rival: 15 }), 'era'));
    const { inicio } = empezarDuelo(sinAviso);
    expect(inicio.novedades.aviso).toBeNull();
    expect(poseDelRival(inicio.partida)).toBeNull();
  });

  it('si Chema te gana, en la revancha ya no está arrugado', () => {
    const conAviso = volverAlMapa(elegirParada(contraRuben({ jugador: 20, rival: 4 }), 'era'));
    const primera = empezarDuelo(conAviso).gira;
    const tras = terminarDuelo(primera, acabado(primera, false), libretaVacia()).gira;
    const revancha = empezarDuelo(volverAlMapa(elegirParada(tras, 'era')));
    expect(revancha.inicio.partida.extras.aviso).toBeNull();
    expect(poseDelRival(revancha.inicio.partida)).toBeNull();
  });

  it('se le pasa cuando te saca 5 piedras, y ya no vuelve', () => {
    const { partida } = nuevaPartida('se-le-pasa', 'chema', 60, { aviso: 'rubenAvisa' });
    let p = partida;
    expect(poseDelRival({ ...p, duelo: { ...p.duelo, marcador: { rival: 3, jugador: 3 } } })).toBe('arrugado');
    expect(poseDelRival({ ...p, duelo: { ...p.duelo, marcador: { rival: 7, jugador: 3 } } })).toBe('arrugado');
    expect(poseDelRival({ ...p, duelo: { ...p.duelo, marcador: { rival: 8, jugador: 3 } } })).toBe('crecido');
    // Se juega hasta que Chema se crezca: desde ahí ya no está avisado.
    const azar = Azar.conSemilla('se-le-pasa');
    for (let n = 0; p.duelo.fase !== 'finDuelo' && p.duelo.marcador.rival - p.duelo.marcador.jugador < 5; n++) {
      if (n > 5000) throw new Error('No termina');
      if (leTocaAlRival(p)) p = jugarRival(p).partida;
      else p = jugarJugador(p, p.duelo.fase === 'finMano' ? { tipo: 'siguienteMano' } : accionAleatoria(p.duelo, azar)).partida;
    }
    if (p.duelo.marcador.rival - p.duelo.marcador.jugador >= 5) {
      expect(p.extras.aviso).toBeNull();
      expect(poseDelRival({ ...p, duelo: { ...p.duelo, fase: 'finMano', marcador: { rival: 3, jugador: 3 } } })).toBeNull();
    }
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
