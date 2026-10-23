import { describe, expect, it } from 'vitest';
import { RIVALES } from '../src/datos/rivales';
import { apuntar, cargarLibreta, guardarLibreta, libretaVacia, nivelDe, textoNota } from '../src/estado/libreta';
import {
  cartasDelRivalALaVista,
  jugarJugador,
  jugarRival,
  leTocaAlRival,
  nuevaPartida,
  puedeUsarObjeto,
  puedeUsarSena,
  senasQueQuedan,
  usarObjeto,
  usarSena,
  type ConQueJuegas,
  type Partida,
  type ResultadoPartida,
} from '../src/estado/partida';
import { iniciarEnvite } from '../src/nucleo/apuestas';
import { Azar } from '../src/nucleo/azar';
import { mismaCarta } from '../src/nucleo/carta';
import type { Lado } from '../src/nucleo/comun';
import { accionesValidas, type AccionDuelo } from '../src/nucleo/duelo';
import { decidirEnvite } from '../src/nucleo/ia/decisiones';
import { decidirRival, parametrosConAnimo, vistaDe } from '../src/nucleo/ia/rival';
import { memoriaInicial } from '../src/nucleo/ia/memoria';
import { prepararMano } from './ayudas';

/** Una partida con estas manos y este rival, en la fase de mus, con `mano` hablando primero. */
function partidaCon(rival: Partida['rivalId'], manos: { jugador: string; rival: string }, trae: ConQueJuegas = {}, mano: Lado = 'jugador'): Partida {
  const { partida } = nuevaPartida('bolsa', rival, 60, trae);
  const duelo = prepararMano(partida.duelo, manos);
  duelo.quienEsMano = mano;
  duelo.turno = mano;
  return { ...partida, duelo };
}

/**
 * Juega la mano hasta el recuento: el jugador corta, envida dos en la Grande (o sube si ya le han
 * envidado) si `envidaGrande`, y en lo demás pasa o quiere. Devuelve lo que pasó en cada acción.
 */
function jugarMano(partida: Partida, envidaGrande: boolean): { partida: Partida; resultados: ResultadoPartida[] } {
  let p = partida;
  const resultados: ResultadoPartida[] = [];
  for (let n = 0; n < 60 && p.duelo.fase !== 'finMano' && p.duelo.fase !== 'finDuelo'; n++) {
    let r: ResultadoPartida;
    if (leTocaAlRival(p)) {
      r = jugarRival(p);
    } else {
      const { opciones } = accionesValidas(p.duelo);
      const hay = (tipo: string) => opciones.some((o) => o.tipo === tipo);
      const yaEnvide = p.duelo.envite?.historial.some((h) => h.lado === 'jugador' && h.accion.tipo !== 'paso');
      let accion: AccionDuelo;
      if (hay('corto')) accion = { tipo: 'corto', lado: 'jugador' };
      else if (hay('trato')) accion = { tipo: 'trato', lado: 'jugador', acepta: false };
      else if (envidaGrande && p.duelo.lanceActual === 'grande' && !yaEnvide && hay('envido')) accion = { tipo: 'envido', lado: 'jugador', piedras: 2 };
      else if (envidaGrande && p.duelo.lanceActual === 'grande' && !yaEnvide && hay('mas')) accion = { tipo: 'mas', lado: 'jugador', piedras: 2 };
      else if (p.duelo.envite?.ordago) accion = { tipo: 'noQuiero', lado: 'jugador' };
      else if (hay('quiero')) accion = { tipo: 'quiero', lado: 'jugador' };
      else accion = { tipo: 'paso', lado: 'jugador' };
      r = jugarJugador(p, accion);
    }
    resultados.push(r);
    p = r.partida;
  }
  return { partida: p, resultados };
}

describe('objetos de un uso', () => {
  it('el orujo sube 15 la Cara', () => {
    const { partida } = nuevaPartida('orujo', 'lucia', 50);
    const r = usarObjeto(partida, 'orujo');
    expect(r.partida.caraJugador).toBe(65);
    expect(r.novedades.cambiosCara).toEqual([{ motivo: 'orujo', delta: 15 }]);
  });

  it('el chato de vino enseña las cartas del rival en esa mano, también tras el descarte', () => {
    const { partida } = nuevaPartida('chato', 'lucia');
    expect(cartasDelRivalALaVista(partida)).toEqual([]);
    const r = usarObjeto(partida, 'chato');
    expect(cartasDelRivalALaVista(r.partida)).toEqual(r.partida.duelo.cartas.rival);
    expect(puedeUsarObjeto(r.partida, 'chato')).toBe(false);
  });

  it('darle conversación: en esa mano el rival ni tira órdago ni sube, aunque lleve la mano perfecta', () => {
    const azarSiempre = { siguiente: () => 0, probabilidad: () => true } as unknown as Azar;
    const situacion = {
      F: 0.99,
      envite: iniciarEnvite('rival'),
      limites: { enviteMinimo: 2, subidaMinima: 2, deje: 1 },
      diferencia: -10,
      caraJugador: 60,
      tFarol: 0,
      aceptaTodo: false,
    };
    expect(decidirEnvite(situacion, RIVALES.chema.parametros, azarSiempre).accion.tipo).toBe('ordago');
    expect(decidirEnvite({ ...situacion, distraido: true }, RIVALES.chema.parametros, azarSiempre).accion.tipo).not.toBe('ordago');
    // Le envidas dos: con esa mano subiría; distraído, solo quiere o no quiere.
    const envidado = { ...situacion, envite: { ...iniciarEnvite('rival'), envidador: 'jugador' as const, apuesta: 2 } };
    expect(decidirEnvite(envidado, RIVALES.chema.parametros, azarSiempre).accion.tipo).toBe('mas');
    expect(['quiero', 'noQuiero']).toContain(decidirEnvite({ ...envidado, distraido: true }, RIVALES.chema.parametros, azarSiempre).accion.tipo);
    const r = usarObjeto(nuevaPartida('charla', 'chema').partida, 'conversacion');
    expect(r.partida.extras.sinOrdagoMano).toBe(r.partida.duelo.numeroMano);
  });

  it('al acabar el duelo ya no se usa nada', () => {
    const { partida } = nuevaPartida('fin', 'lucia');
    const acabada = { ...partida, duelo: { ...partida.duelo, fase: 'finDuelo' as const } };
    expect(puedeUsarObjeto(acabada, 'orujo')).toBe(false);
    expect(() => usarObjeto(acabada, 'orujo')).toThrow();
  });
});

describe('amuletos', () => {
  const manos = { jugador: '4 5 6 7', rival: 'R R R C' };

  it('la Medalla de la Virgen libra los faroles pillados del duelo', () => {
    const enfadado = (p: Partida) => ({ ...p, memoria: { ...memoriaInicial(), manosEnfadado: 3 } });
    const sin = jugarMano(enfadado(partidaCon('ruperto', manos)), true);
    const conMedalla = jugarMano(enfadado(partidaCon('ruperto', manos, { amuletos: ['medalla'] })), true);
    const pillados = (rs: ResultadoPartida[]) => rs.flatMap((r) => r.novedades.cambiosCara).filter((c) => c.motivo === 'farolPillado');
    expect(pillados(sin.resultados).length).toBeGreaterThan(0);
    expect(pillados(conMedalla.resultados)).toEqual([]);
    expect(conMedalla.resultados.some((r) => r.novedades.medalla)).toBe(true);
  });

  it('la Boina de la suerte gana los empates aunque no seas mano', () => {
    const empate = { jugador: 'R 7 6 5', rival: 'R 7 6 5' };
    const ganador = (trae: ConQueJuegas) => {
      const { resultados } = jugarMano(partidaCon('lucia', empate, trae, 'rival'), false);
      const recuento = resultados.flatMap((r) => r.novedades.eventos).find((e) => e.tipo === 'recuento');
      return recuento?.tipo === 'recuento' ? recuento.ganadores.grande : undefined;
    };
    expect(ganador({})).toBe('rival');
    expect(ganador({ amuletos: ['boina'] })).toBe('jugador');
  });

  it('los Apuntes de Chema se activan una vez por duelo', () => {
    const { partida } = nuevaPartida('apuntes', 'lucia', 60, { amuletos: ['apuntesChema'] });
    expect(puedeUsarObjeto(partida, 'apuntesChema')).toBe(true);
    const r = usarObjeto(partida, 'apuntesChema');
    expect(r.partida.extras.explicarTic).toBe(true);
    expect(puedeUsarObjeto(r.partida, 'apuntesChema')).toBe(false);
    expect(puedeUsarObjeto(nuevaPartida('sin', 'lucia').partida, 'apuntesChema')).toBe(false);
  });
});

describe('señas del compañero', () => {
  it('el Lazarillo enseña una carta que el rival lleva, una vez por duelo', () => {
    const { partida } = nuevaPartida('lazarillo', 'dani', 60, { companero: 'lazarillo' });
    expect(senasQueQuedan(partida)).toBe(1);
    const r = usarSena(partida);
    const efecto = r.novedades.efecto;
    expect(efecto?.tipo).toBe('lazarillo');
    if (efecto?.tipo !== 'lazarillo') return;
    expect(partida.duelo.cartas.rival.some((c) => mismaCarta(c, efecto.carta))).toBe(true);
    expect(cartasDelRivalALaVista(r.partida)).toEqual([efecto.carta]);
    expect(puedeUsarSena(r.partida)).toBe(false);
    expect(() => usarSena(r.partida)).toThrow();
  });

  it('la Recaudadora deja apuntado el órdago al triple', () => {
    const { partida } = nuevaPartida('recaudadora', 'dani', 60, { companero: 'recaudadora' });
    const r = usarSena(partida);
    expect(r.partida.extras.triplicaOrdago).toBe(true);
    expect(puedeUsarSena(r.partida)).toBe(false);
  });

  it('sin compañero no hay seña', () => {
    expect(puedeUsarSena(nuevaPartida('solo', 'dani').partida)).toBe(false);
  });
});

describe('los rivales de la facultad', () => {
  it('Dani pide mus siempre la primera vez, aunque lleve cuatro reyes', () => {
    const p = partidaCon('dani', { jugador: '4 5 6 7', rival: 'R R R R' }, {}, 'rival');
    const decision = decidirRival(vistaDe(p.duelo, 'rival'), { perfil: RIVALES.dani, memoria: p.memoria, caraJugador: 60 }, new Azar(p.azarIA));
    expect(decision.accion.tipo).toBe('mus');
  });

  it('Chema se viene arriba ganando de 5 y se arruga perdiendo de 5; Rubén solo se crece', () => {
    expect(parametrosConAnimo(RIVALES.chema, 6)).toEqual({ parametros: { ...RIVALES.chema.parametros, faroleo: 10 }, ajusteAceptar: 0.3 });
    expect(parametrosConAnimo(RIVALES.chema, -5)).toEqual({ parametros: { ...RIVALES.chema.parametros, faroleo: 0 }, ajusteAceptar: -0.2 });
    expect(parametrosConAnimo(RIVALES.chema, 4).ajusteAceptar).toBe(0);
    expect(parametrosConAnimo(RIVALES.ruben, 5)).toEqual({ parametros: { ...RIVALES.ruben.parametros, faroleo: 6 }, ajusteAceptar: 0 });
    expect(parametrosConAnimo(RIVALES.ruben, -8).ajusteAceptar).toBe(0);
  });

  it('cuando Chema cambia de ánimo se avisa', () => {
    let p = nuevaPartida('animo', 'chema').partida;
    p = { ...p, duelo: { ...p.duelo, marcador: { jugador: 0, rival: 4 } } };
    // Un «no quiero» del jugador le da la piedra que le pone 5 por delante.
    const enGrande = prepararMano(p.duelo, { jugador: '4 5 6 7', rival: 'R R R C' });
    enGrande.fase = 'envite';
    enGrande.lanceActual = 'grande';
    enGrande.envite = { ...iniciarEnvite('rival'), turno: 'jugador', envidador: 'rival', apuesta: 2, historial: [{ lado: 'rival', accion: { tipo: 'envido', piedras: 2 } }] };
    enGrande.turno = 'jugador';
    const r = jugarJugador({ ...p, duelo: enGrande }, { tipo: 'noQuiero', lado: 'jugador' });
    expect(r.partida.duelo.marcador.rival).toBe(5);
    expect(r.novedades.animo).toEqual({ antes: null, despues: 'crecido' });
  });
});

describe('la Libreta', () => {
  it('apunta lo visto y sube de nivel con las veces', () => {
    let libreta = libretaVacia();
    const una = apuntar(libreta, 'lucia', [{ id: 'mordisqueaBoli', verdadero: true }]);
    expect(una.cambios).toEqual([{ rival: 'lucia', tic: 'mordisqueaBoli', nivel: 1 }]);
    libreta = una.libreta;
    expect(textoNota('lucia', 'mordisqueaBoli', libreta.rivales.lucia!.mordisqueaBoli)).toBe('Mordisquea el boli… ¿qué querrá decir?');
    libreta = apuntar(libreta, 'lucia', [
      { id: 'mordisqueaBoli', verdadero: true },
      { id: 'mordisqueaBoli', verdadero: false },
      { id: 'mordisqueaBoli', verdadero: true },
    ]).libreta;
    expect(textoNota('lucia', 'mordisqueaBoli', libreta.rivales.lucia!.mordisqueaBoli)).toBe('Mordisquea el boli… ¿pares o mejor?');
    const diez = apuntar(libreta, 'lucia', Array.from({ length: 6 }, (_, i) => ({ id: 'mordisqueaBoli', verdadero: i < 5 })));
    expect(diez.cambios[0]?.nivel).toBe(3);
    expect(textoNota('lucia', 'mordisqueaBoli', diez.libreta.rivales.lucia!.mordisqueaBoli)).toBe(
      'Mordisquea el boli: pares o mejor (acierta 8 de cada 10)',
    );
  });

  it('lo apuntado con el nombre antiguo de un tic pasa al nuevo (el café de Chema ahora es un refresco)', () => {
    const { libreta } = apuntar(libretaVacia(), 'chema', [{ id: 'remueveCafe', verdadero: true }]);
    expect(libreta.rivales.chema).toEqual({ bebeRefresco: { vistos: 1, aciertos: 1 } });

    const datos = new Map<string, string>();
    const almacen = { getItem: (k: string) => datos.get(k) ?? null, setItem: (k: string, v: string) => void datos.set(k, v), removeItem: (k: string) => void datos.delete(k) };
    const antigua = { rivales: { chema: { remueveCafe: { vistos: 3, aciertos: 2 }, bajaGafas: { vistos: 1, aciertos: 1 } } } };
    guardarLibreta(antigua, almacen);
    expect(cargarLibreta(almacen).rivales.chema).toEqual({ bebeRefresco: { vistos: 3, aciertos: 2 }, bajaGafas: { vistos: 1, aciertos: 1 } });
  });

  it('con el Lazarillo cuenta doble', () => {
    const { libreta } = apuntar(libretaVacia(), 'dani', [{ id: 'colocaCintas', verdadero: true }], 2);
    expect(nivelDe(libreta.rivales.dani!.colocaCintas)).toBe(1);
    expect(libreta.rivales.dani!.colocaCintas).toEqual({ vistos: 2, aciertos: 2 });
  });

  it('en un duelo, los tics van a la Libreta cuando se ven las cartas', () => {
    let tics = 0;
    let observados = 0;
    for (let s = 0; s < 6; s++) {
      const azar = Azar.conSemilla(`libreta-${s}`);
      let p = nuevaPartida(`libreta-${s}`, 'dani').partida;
      for (let n = 0; n < 3000 && p.duelo.fase !== 'finDuelo'; n++) {
        const r = leTocaAlRival(p) ? jugarRival(p) : jugarJugador(p, p.duelo.fase === 'finMano' ? { tipo: 'siguienteMano' } : accionPrudente(p, azar));
        tics += r.novedades.tics.length;
        p = r.partida;
      }
      observados += p.estadisticas.observaciones.length;
    }
    expect(tics).toBeGreaterThan(0);
    expect(observados).toBeGreaterThan(0);
    expect(observados).toBeLessThanOrEqual(tics);
  });
});

/** Juega sin órdagos, para que el duelo dure varias manos. */
function accionPrudente(p: Partida, azar: Azar): AccionDuelo {
  const { opciones } = accionesValidas(p.duelo);
  const tipos = opciones.map((o) => o.tipo).filter((t) => t !== 'ordago');
  const tipo = azar.elegir(tipos);
  if (tipo === 'descartar') return { tipo, lado: 'jugador', cartas: [p.duelo.cartas.jugador[0]!] };
  if (tipo === 'envido' || tipo === 'mas') return { tipo, lado: 'jugador', piedras: 2 };
  if (tipo === 'trato') return { tipo, lado: 'jugador', acepta: false };
  return { tipo, lado: 'jugador' } as AccionDuelo;
}
