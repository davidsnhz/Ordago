import { describe, expect, it } from 'vitest';
import { CORTES_COMUNES, ORDEN_RIVALES, type IdRival, type PerfilRival } from '../src/datos/rivales';
import { jugarJugador, jugarRival, leTocaAlRival, nuevaPartida, type Partida } from '../src/estado/partida';
import { Azar } from '../src/nucleo/azar';
import { accionesValidas, type AccionDuelo } from '../src/nucleo/duelo';
import { memoriaInicial, proporcionFaroles } from '../src/nucleo/ia/memoria';
import { decidirRival, vistaDe } from '../src/nucleo/ia/rival';
import { IA } from '../src/datos/ia';

// Para probar otros números sin tocar datos/: PESO_MEMORIA=1.5 npm run equilibrio
if (process.env.PESO_MEMORIA) (IA.aceptar as { pesoMemoria: number }).pesoMemoria = Number(process.env.PESO_MEMORIA);
if (process.env.PESO_CUOTA) (IA.aceptar as { pesoCuota: number }).pesoCuota = Number(process.env.PESO_CUOTA);
if (process.env.FAROLES_ESPERADOS) (IA.aceptar as { farolesEsperados: number }).farolesEsperados = Number(process.env.FAROLES_ESPERADOS);

/**
 * El farolero: un jugador que abre envidando en todos los lances, lleve lo que lleve; a los
 * envites del rival responde con sentido.
 * Si gana mucho más que un jugador sensato, los rivales no castigan bien los faroles.
 * Solo informa: con IA.aceptar.pesoCuota = 0 el farolero gana unos puntos más que el sensato
 * contra Doña Ignacia, Don Francisco y Aurelio (docs/decisiones.md). Con PESO_CUOTA=0.75 no.
 */
const SENSATO: PerfilRival = {
  id: 'ruperto',
  parametros: { agresividad: 5, faroleo: 3, miedoOrdago: 5, memoria: 0, ojo: 0 },
  mus: { corta: CORTES_COMUNES, guarda: ['reyes', 'parejas'], farolDeCorte: 0 },
  tics: [],
};

type Estilo = 'sensato' | 'farolero';

function accionDe(estilo: Estilo, p: Partida, azar: Azar): AccionDuelo {
  const d = p.duelo;
  if (d.fase === 'finMano') return { tipo: 'siguienteMano' };
  if (d.fase === 'trato') return { tipo: 'trato', lado: 'jugador', acepta: azar.probabilidad(0.5) };
  if (estilo === 'farolero' && d.fase === 'envite') {
    const opciones = accionesValidas(d).opciones.map((o) => o.tipo);
    if (opciones.includes('envido')) return { tipo: 'envido', lado: 'jugador', piedras: 2 };
  }
  return decidirRival(vistaDe(d, 'jugador'), { perfil: SENSATO, memoria: memoriaInicial(), caraJugador: 50 }, azar).accion;
}

function ganaJugador(rival: IdRival, estilo: Estilo, duelos: number): { gana: number; cara: number; faroles: number } {
  const azar = Azar.conSemilla(`farolero-${rival}-${estilo}`);
  let gana = 0;
  let cara = 0;
  let faroles = 0;
  for (let s = 0; s < duelos; s++) {
    let { partida: p } = nuevaPartida(`far-${rival}-${s}`, rival);
    for (let n = 0; p.duelo.fase !== 'finDuelo'; n++) {
      if (n > 5000) throw new Error('No termina');
      const r = leTocaAlRival(p) ? jugarRival(p) : jugarJugador(p, accionDe(estilo, p, azar));
      p = r.partida;
    }
    if (p.duelo.ganador === 'jugador') gana++;
    cara += p.caraJugador;
    faroles += proporcionFaroles(p.memoria);
  }
  return { gana: gana / duelos, cara: cara / duelos, faroles: faroles / duelos };
}

describe('el farolero contra el jugador sensato', () => {
  const DUELOS = Number(process.env.DUELOS ?? 300);
  for (const rival of ORDEN_RIVALES) {
    it(rival, () => {
      const sensato = ganaJugador(rival, 'sensato', DUELOS);
      const farolero = ganaJugador(rival, 'farolero', DUELOS);
      const pct = (x: number) => `${Math.round(x * 100)} %`;
      console.info(
        `${rival.padEnd(10)} sensato gana ${pct(sensato.gana)} (faroles ${pct(sensato.faroles)}) · farolero gana ${pct(farolero.gana)} (faroles ${pct(farolero.faroles)}, Cara media ${Math.round(farolero.cara)})`,
      );
      expect(farolero.gana).toBeGreaterThanOrEqual(0);
    }, 600_000);
  }
});
