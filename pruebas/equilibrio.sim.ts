import { describe, expect, it } from 'vitest';
import { CORTES_COMUNES, ORDEN_RIVALES, type IdRival, type PerfilRival } from '../src/datos/rivales';
import { jugarJugador, jugarRival, leTocaAlRival, nuevaPartida } from '../src/estado/partida';
import { Azar } from '../src/nucleo/azar';
import type { AccionDuelo } from '../src/nucleo/duelo';
import { memoriaInicial } from '../src/nucleo/ia/memoria';
import { decidirRival, vistaDe } from '../src/nucleo/ia/rival';
import { IA } from '../src/datos/ia';

// Para probar otro peso de la cuota sin tocar datos/: PESO_CUOTA=0.5 npm run equilibrio
if (process.env.PESO_CUOTA) (IA.aceptar as { pesoCuota: number }).pesoCuota = Number(process.env.PESO_CUOTA);

/**
 * Equilibrio: cada rival contra un jugador sensato (la misma IA con una personalidad neutra).
 * Imprime las cifras para ajustar los números de datos/ y comprueba que ningún rival se sale
 * de lo razonable.
 */
const SENSATO: PerfilRival = {
  id: 'ruperto',
  parametros: { agresividad: 5, faroleo: 3, miedoOrdago: 5, memoria: 0, ojo: 0 },
  mus: { corta: CORTES_COMUNES, guarda: ['reyes', 'parejas'], farolDeCorte: 0 },
  tics: [],
};

interface Cifras {
  ganaRival: number;
  manos: number;
  ordagosRival: number;
  porOrdago: number;
  envitesJugador: number;
  aceptados: number;
  tratos: number;
  penitencias: number;
  tics: number;
}

function medir(rival: IdRival, duelos: number): Cifras {
  const azar = Azar.conSemilla(`equilibrio-${rival}`);
  const c: Cifras = { ganaRival: 0, manos: 0, ordagosRival: 0, porOrdago: 0, envitesJugador: 0, aceptados: 0, tratos: 0, penitencias: 0, tics: 0 };
  for (let s = 0; s < duelos; s++) {
    let { partida: p } = nuevaPartida(`eq-${rival}-${s}`, rival);
    let ordagoEnLaMano = false;
    for (let n = 0; p.duelo.fase !== 'finDuelo'; n++) {
      if (n > 5000) throw new Error('No termina');
      let accion: AccionDuelo | null = null;
      if (!leTocaAlRival(p)) {
        if (p.duelo.fase === 'finMano') accion = { tipo: 'siguienteMano' };
        else if (p.duelo.fase === 'trato') accion = { tipo: 'trato', lado: 'jugador', acepta: azar.probabilidad(0.5) };
        else accion = decidirRival(vistaDe(p.duelo, 'jugador'), { perfil: SENSATO, memoria: memoriaInicial(), caraJugador: 50 }, azar).accion;
      }
      const r = accion ? jugarJugador(p, accion) : jugarRival(p);
      for (const e of r.novedades.eventos) {
        if (e.tipo === 'reparto') ordagoEnLaMano = false;
        if (e.tipo === 'envite' && e.lado === 'rival' && e.accion.tipo === 'ordago' && !ordagoEnLaMano) {
          c.ordagosRival++;
          ordagoEnLaMano = true;
        }
        if (e.tipo === 'envite' && e.lado === 'jugador' && (e.accion.tipo === 'envido' || e.accion.tipo === 'mas')) c.envitesJugador++;
        if (e.tipo === 'envite' && e.lado === 'rival' && e.accion.tipo === 'quiero') c.aceptados++;
        if (e.tipo === 'trato') c.tratos++;
        if (e.tipo === 'recuento' && e.cobros.some((x) => x.concepto === 'penitencia')) c.penitencias++;
      }
      c.tics += r.novedades.tics.length;
      p = r.partida;
    }
    if (p.duelo.ganador === 'rival') c.ganaRival++;
    if (p.duelo.motivoFin === 'ordago') c.porOrdago++;
    c.manos += p.duelo.numeroMano;
  }
  return c;
}

describe('equilibrio de los cinco rivales contra un jugador sensato', () => {
  const DUELOS = 300;
  for (const rival of ORDEN_RIVALES) {
    it(rival, () => {
      const c = medir(rival, DUELOS);
      const pct = (x: number, de: number) => `${Math.round((x / de) * 100)} %`;
      console.info(
        `${rival.padEnd(10)} gana ${pct(c.ganaRival, DUELOS)} · ${(c.manos / DUELOS).toFixed(1)} manos · ` +
          `órdago suyo en ${pct(c.ordagosRival, c.manos)} de manos · ${pct(c.porOrdago, DUELOS)} acaban en órdago · ` +
          `acepta ${pct(c.aceptados, c.envitesJugador)} de tus envites · ${(c.tics / c.manos).toFixed(2)} tics/mano` +
          (c.tratos ? ` · ${c.tratos} tratos` : '') +
          (c.penitencias ? ` · ${c.penitencias} penitencias` : ''),
      );
      // Ningún rival debería ganar casi siempre ni casi nunca a un jugador sensato.
      expect(c.ganaRival / DUELOS).toBeGreaterThan(0.25);
      expect(c.ganaRival / DUELOS).toBeLessThan(0.8);
    }, 300_000);
  }
});
