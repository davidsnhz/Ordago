import { describe, it } from 'vitest';
import type { IdAviso } from '../src/datos/gira';
import { ARENAS, GIRA } from '../src/datos/gira';
import { IA } from '../src/datos/ia';
import { animoDe, CORTES_COMUNES, RIVALES, type IdRival, type PerfilRival } from '../src/datos/rivales';
import { jugarJugador, jugarRival, leTocaAlRival, nuevaPartida } from '../src/estado/partida';
import { Azar } from '../src/nucleo/azar';
import type { AccionDuelo } from '../src/nucleo/duelo';
import { memoriaInicial } from '../src/nucleo/ia/memoria';
import { decidirRival, vistaDe } from '../src/nucleo/ia/rival';

/**
 * Cuánto dura un duelo de la gira (npm run equilibrio): el jugador sensato contra los cuatro de
 * una arena, a las piedras de cada nivel. Mide las manos, las decisiones del jugador, cuántos
 * duelos acaban por órdago, cuántos se ganan y de cuánto, y los reales que da cada uno.
 */
const SENSATO: PerfilRival = {
  id: 'ruperto',
  parametros: { agresividad: 5, faroleo: 3, miedoOrdago: 5, memoria: 0, ojo: 0 },
  mus: { corta: CORTES_COMUNES, guarda: ['reyes', 'parejas'], farolDeCorte: 0 },
  tics: [],
};
/** El que farolea mucho: es quien aprovecha a un rival arrugado, que casi no quiere. */
const FAROLERO: PerfilRival = { ...SENSATO, parametros: { ...SENSATO.parametros, agresividad: 6, faroleo: 8 } };
const JUGADOR = process.env.JUGADOR === 'farolero' ? FAROLERO : SENSATO;
/** El que se fija: con el rival arrugado no quiere sin cartas (no farolea) y le farolea más (casi no quiere). */
const LISTO = process.env.JUGADOR === 'listo';
/** ARENA=1 npm run equilibrio: el bar. */
const ARENA = ARENAS[Number(process.env.ARENA ?? 0)]!;
const NIVELES: readonly IdRival[] = ARENA.niveles!;
/** Se puede probar otro reparto sin tocar datos/: PIEDRAS=20,30,30,40 DUELOS=200 npm run equilibrio */
const PIEDRAS = process.env.PIEDRAS?.split(',').map(Number) ?? GIRA.piedrasPorNivel;
const DUELOS = Number(process.env.DUELOS ?? 300);
if (process.env.AVANCE) (IA.ordago as { desdeAvance: number }).desdeAvance = Number(process.env.AVANCE);

function medir(rival: IdRival, piedras: number, nivel: number, aviso: IdAviso | null = null) {
  const azar = Azar.conSemilla(`duracion-${rival}-${piedras}-${aviso}`);
  const c = { gana: 0, manos: 0, decisiones: 0, ordago: 0, deDiez: 0, cortos: 0, reales: 0, cara: 0 };
  for (let s = 0; s < DUELOS; s++) {
    let { partida: p } = nuevaPartida(`dur-${rival}-${piedras}-${s}`, rival, 60, { reglas: { piedrasParaGanar: piedras }, aviso });
    for (let n = 0; p.duelo.fase !== 'finDuelo'; n++) {
      if (n > 8000) throw new Error('No termina');
      let accion: AccionDuelo | null = null;
      if (!leTocaAlRival(p)) {
        if (p.duelo.fase === 'finMano') accion = { tipo: 'siguienteMano' };
        else if (p.duelo.fase === 'trato') accion = { tipo: 'trato', lado: 'jugador', acepta: azar.probabilidad(0.5) };
        else {
          const decision = decidirRival(vistaDe(p.duelo, 'jugador'), { perfil: JUGADOR, memoria: memoriaInicial(), caraJugador: 50 }, azar);
          accion = decision.accion;
          c.decisiones++;
          const { marcador, envite } = p.duelo;
          if (LISTO && decision.tipo === 'envite' && animoDe(RIVALES[rival], marcador.rival - marcador.jugador, Boolean(p.extras.aviso)) === 'arrugado') {
            if (accion.tipo === 'quiero' && decision.fuerzaUsada < 0.6) accion = { tipo: 'noQuiero', lado: 'jugador' };
            else if (accion.tipo === 'paso' && !envite?.envidador && decision.fuerzaUsada < 0.35 && azar.probabilidad(0.5)) accion = { tipo: 'envido', lado: 'jugador', piedras: 2 };
          }
        }
      }
      p = (accion ? jugarJugador(p, accion) : jugarRival(p)).partida;
    }
    const gana = p.duelo.ganador === 'jugador';
    const e = p.estadisticas;
    if (gana) c.gana++;
    if (p.duelo.motivoFin === 'ordago') c.ordago++;
    if (gana && p.duelo.marcador.jugador - p.duelo.marcador.rival >= 10) c.deDiez++;
    if (p.duelo.numeroMano <= 2) c.cortos++;
    c.manos += p.duelo.numeroMano;
    c.cara += p.caraJugador;
    c.reales += (gana ? GIRA.realesPorNivel[nivel]! : GIRA.consolacion) + e.envitesGanados * GIRA.porEnvite + e.farolesCreidos * GIRA.porFarol + e.ordagosGanados * GIRA.porOrdago;
  }
  return c;
}

const linea = (rival: string, piedras: number, c: ReturnType<typeof medir>) => {
  const pct = (x: number) => `${String(Math.round((x / DUELOS) * 100)).padStart(3)} %`;
  const media = (x: number) => (x / DUELOS).toFixed(1);
  return `${rival.padEnd(14)} a ${piedras} · gana ${pct(c.gana)} · ${media(c.manos)} manos · ${media(c.decisiones)} decisiones · por órdago ${pct(c.ordago)} · de 1 o 2 manos ${pct(c.cortos)} · gana de 10+ ${pct(c.deDiez)} · ${media(c.reales)} reales · Cara ${media(c.cara)}`;
};

describe('cuánto dura un duelo de la gira', () => {
  it.runIf(LISTO)('el jefe, sin aviso, para quien se fija', () => {
    console.info(linea(`${NIVELES[3]} sin aviso`, PIEDRAS[3]!, medir(NIVELES[3]!, PIEDRAS[3]!, 3)));
  }, 3600000);

  it.skipIf(LISTO)('nivel a nivel', () => {
    const medidas = NIVELES.map((rival, nivel) => ({ rival, piedras: PIEDRAS[nivel]!, c: medir(rival, PIEDRAS[nivel]!, nivel) }));
    const manos = medidas.reduce((s, m) => s + m.c.manos, 0) / DUELOS;
    const reales = medidas.reduce((s, m) => s + m.c.reales, 0) / DUELOS;
    console.info(`${medidas.map((m) => linea(m.rival, m.piedras, m.c)).join('\n')}\nLa arena entera: ${manos.toFixed(1)} manos · ${reales.toFixed(1)} reales`);
  }, 3600000);

  it('el jefe, con el aviso de su mano derecha', () => {
    const piedras = PIEDRAS[3]!;
    console.info(linea(`${NIVELES[3]} avisado`, piedras, medir(NIVELES[3]!, piedras, 3, ARENA.aviso?.id ?? null)));
  }, 3600000);
});
