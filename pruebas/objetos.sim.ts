import { describe, expect, it } from 'vitest';
import type { IdObjeto } from '../src/datos/objetos';
import { CORTES_COMUNES, type IdRival, type PerfilRival } from '../src/datos/rivales';
import {
  cartasDelRivalALaVista,
  jugarJugador,
  jugarRival,
  leTocaAlRival,
  nuevaPartida,
  puedeUsarObjeto,
  usarObjeto,
  type Partida,
} from '../src/estado/partida';
import { Azar } from '../src/nucleo/azar';
import { accionesValidas, type AccionDuelo } from '../src/nucleo/duelo';
import { memoriaInicial } from '../src/nucleo/ia/memoria';
import { decidirRival, vistaDe } from '../src/nucleo/ia/rival';
import { ganadorLance } from '../src/nucleo/lances';

/**
 * Lo que vale cada objeto de la taberna (npm run equilibrio): el jugador sensato contra los
 * cuatro rivales de la facultad, sin nada y con cada objeto, con los mismos repartos. Mide cuántos
 * duelos de cada cien se ganan de más. Los Apuntes de Chema no se miden: el jugador sensato no lee
 * los tics.
 */
const SENSATO: PerfilRival = {
  id: 'ruperto',
  parametros: { agresividad: 5, faroleo: 3, miedoOrdago: 5, memoria: 0, ojo: 0 },
  mus: { corta: CORTES_COMUNES, guarda: ['reyes', 'parejas'], farolDeCorte: 0 },
  tics: [],
};
/** El que farolea mucho: para él sí cuentan la Cara (Orujo) y los faroles pillados (Medalla). */
const FAROLERO: PerfilRival = { ...SENSATO, parametros: { ...SENSATO.parametros, agresividad: 6, faroleo: 8 } };
const FACULTAD: IdRival[] = ['lucia', 'dani', 'ruben', 'chema'];
const DUELOS = 250;

interface Prueba {
  nombre: string;
  amuletos?: IdObjeto[];
  /** El objeto de un uso y cuándo se usa (una vez por duelo). */
  usa?: { id: IdObjeto; cuando: (p: Partida) => boolean };
}

const PRUEBAS: Prueba[] = [
  { nombre: 'sin nada' },
  { nombre: 'Chato, en la 1.ª mano', usa: { id: 'chato', cuando: (p) => p.duelo.numeroMano === 1 } },
  { nombre: 'Orujo, al empezar', usa: { id: 'orujo', cuando: () => true } },
  { nombre: 'Conversación, 1.ª mano', usa: { id: 'conversacion', cuando: (p) => p.duelo.numeroMano === 1 } },
  {
    nombre: 'Conversación, al ir ganando',
    usa: { id: 'conversacion', cuando: (p) => p.duelo.marcador.jugador >= 12 && p.duelo.marcador.jugador > p.duelo.marcador.rival },
  },
  { nombre: 'Medalla (amuleto)', amuletos: ['medalla'] },
  { nombre: 'Boina (amuleto)', amuletos: ['boina'] },
];

/**
 * Con el Chato se ven sus cartas: si sabes que ganas el lance, órdago (o quiero); si sabes que lo
 * pierdes, te retiras. `null` si no se ven o no es un lance.
 */
function decidirSabiendo(p: Partida): AccionDuelo | null {
  const { duelo } = p;
  if (cartasDelRivalALaVista(p).length < 4 || duelo.fase !== 'envite' || !duelo.lanceActual) return null;
  const { opciones } = accionesValidas(duelo);
  const puede = (tipo: AccionDuelo['tipo']) => opciones.some((o) => o.tipo === tipo);
  const empates = p.extras.amuletos.includes('boina') ? 'jugador' : duelo.quienEsMano;
  const gano = ganadorLance(duelo.lanceActual, duelo.cartas, empates, duelo.reglas.modoReyes) === 'jugador';
  if (gano) {
    if (puede('ordago')) return { tipo: 'ordago', lado: 'jugador' };
    if (puede('quiero')) return { tipo: 'quiero', lado: 'jugador' };
    return null;
  }
  if (puede('noQuiero')) return { tipo: 'noQuiero', lado: 'jugador' };
  if (puede('paso')) return { tipo: 'paso', lado: 'jugador' };
  return null;
}

function medir(prueba: Prueba, rival: IdRival, jugador: PerfilRival): { ganados: number; piedras: number } {
  let ganados = 0;
  let piedras = 0;
  for (let s = 0; s < DUELOS; s++) {
    // Mismos repartos y mismas tiradas en cada prueba: así la diferencia es el objeto.
    const azar = Azar.conSemilla(`objetos-${rival}-${s}`);
    let { partida: p } = nuevaPartida(`objetos-${rival}-${s}`, rival, undefined, { amuletos: prueba.amuletos ?? [] });
    let usado = false;
    for (let n = 0; p.duelo.fase !== 'finDuelo'; n++) {
      if (n > 5000) throw new Error('No termina');
      if (prueba.usa && !usado && prueba.usa.cuando(p) && puedeUsarObjeto(p, prueba.usa.id)) {
        p = usarObjeto(p, prueba.usa.id).partida;
        usado = true;
      }
      if (leTocaAlRival(p)) {
        p = jugarRival(p).partida;
        continue;
      }
      let accion: AccionDuelo;
      if (p.duelo.fase === 'finMano') accion = { tipo: 'siguienteMano' };
      else if (p.duelo.fase === 'trato') accion = { tipo: 'trato', lado: 'jugador', acepta: azar.probabilidad(0.5) };
      else {
        accion =
          decidirSabiendo(p) ??
          decidirRival(vistaDe(p.duelo, 'jugador'), { perfil: jugador, memoria: memoriaInicial(), caraJugador: 50 }, azar).accion;
      }
      p = jugarJugador(p, accion).partida;
    }
    if (p.duelo.ganador === 'jugador') ganados++;
    piedras += p.duelo.marcador.jugador - p.duelo.marcador.rival;
  }
  return { ganados, piedras };
}

/** El Orujo cuando hace falta (te pillan) y los amuletos, para el farolero. */
const PRUEBAS_FAROLERO: Prueba[] = [
  { nombre: 'farolero, sin nada' },
  { nombre: 'farolero, Orujo si te pillan', usa: { id: 'orujo', cuando: (p) => p.caraJugador < 35 } },
  { nombre: 'farolero, Medalla', amuletos: ['medalla'] },
  { nombre: 'farolero, Boina', amuletos: ['boina'] },
  { nombre: 'farolero, Chato 1.ª mano', usa: { id: 'chato', cuando: (p) => p.duelo.numeroMano === 1 } },
];

function tabla(pruebas: Prueba[], jugador: PerfilRival) {
  const total = FACULTAD.length * DUELOS;
  const filas = pruebas.map((prueba) => {
    const porRival = FACULTAD.map((rival) => medir(prueba, rival, jugador));
    const ganados = porRival.reduce((s, r) => s + r.ganados, 0);
    const piedras = porRival.reduce((s, r) => s + r.piedras, 0);
    return { prueba, ganados, piedras, porRival };
  });
  const base = filas[0]!;
  for (const f of filas) {
    const pct = (f.ganados / total) * 100;
    const mas = ((f.ganados - base.ganados) / total) * 100;
    console.info(
      `${f.prueba.nombre.padEnd(30)} gana ${pct.toFixed(1)} % (${mas >= 0 ? '+' : ''}${mas.toFixed(1)}) · ` +
        `diferencia media ${(f.piedras / total).toFixed(1)} piedras · ` +
        f.porRival.map((r, i) => `${FACULTAD[i]} ${Math.round((r.ganados / DUELOS) * 100)} %`).join(', '),
    );
  }
  return base.ganados / total;
}

describe('lo que vale cada objeto de la taberna', () => {
  it('jugador sensato contra la facultad, con los mismos repartos', () => {
    expect(tabla(PRUEBAS, SENSATO)).toBeGreaterThan(0.2);
  }, 1_800_000);

  it('jugador farolero contra la facultad', () => {
    expect(tabla(PRUEBAS_FAROLERO, FAROLERO)).toBeGreaterThan(0.05);
  }, 1_800_000);
});
