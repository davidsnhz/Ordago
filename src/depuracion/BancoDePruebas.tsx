import { useMemo, useState, type FormEvent } from 'react';
import { BOTS, registrarDuelo } from './registro';
import { simularDuelo } from './simular';
import './banco.css';

/**
 * Página de `npm run dev` en la fase 1: simula un duelo entre dos jugadores aleatorios y
 * enseña el registro mano a mano. Se sustituirá por la mesa en la fase 2.
 */
export function BancoDePruebas() {
  const [borrador, setBorrador] = useState('1');
  const [semilla, setSemilla] = useState('1');

  const simulacion = useMemo(() => {
    try {
      const duelo = simularDuelo(semilla);
      return { duelo, manos: registrarDuelo(duelo.eventos, duelo.estado.reglas.modoReyes), error: null };
    } catch (error) {
      return { duelo: null, manos: [], error: String(error) };
    }
  }, [semilla]);

  const simular = (evento: FormEvent) => {
    evento.preventDefault();
    setSemilla(borrador.trim() || '1');
  };
  const siguiente = () => {
    const numero = Number(semilla);
    const nueva = Number.isInteger(numero) ? String(numero + 1) : `${semilla}+`;
    setBorrador(nueva);
    setSemilla(nueva);
  };

  const { duelo } = simulacion;
  return (
    <main className="banco">
      <h1>Órdago · banco de pruebas del motor</h1>
      <p className="banco__aviso">
        <strong>Aquí no juegas tú.</strong> Bot A y Bot B eligen cada jugada <strong>al azar</strong> entre las
        permitidas: tiran reyes, aceptan con malas cartas o envidan sin nada. Es a propósito: sirve para comprobar
        que el motor cuenta bien las piedras y respeta los turnos pase lo que pase, no para jugar bien. El rival con
        cabeza (la IA) llega en las fases 2 y 3.
      </p>
      <p>
        La misma semilla repite exactamente el mismo duelo. Cartas: R rey, C caballo, S sota, A as; o oros, c copas,
        e espadas, b bastos.
      </p>

      <form onSubmit={simular} className="banco__mandos">
        <label>
          Semilla <input value={borrador} onChange={(e) => setBorrador(e.target.value)} />
        </label>
        <button type="submit">Simular duelo</button>
        <button type="button" onClick={siguiente}>
          Semilla siguiente
        </button>
      </form>

      {simulacion.error && <pre className="banco__error">{simulacion.error}</pre>}

      {duelo && (
        <p className="banco__resumen">
          Gana <strong>{BOTS[duelo.estado.ganador!]}</strong>{' '}
          {duelo.estado.motivoFin === 'ordago' ? 'por órdago' : 'a piedras'} · {BOTS.jugador}{' '}
          {duelo.estado.marcador.jugador} – {BOTS.rival} {duelo.estado.marcador.rival} · {duelo.estado.numeroMano}{' '}
          manos · {duelo.acciones.length} acciones
        </p>
      )}

      {simulacion.manos.map((mano) => (
        <section key={mano.numero} className="banco__mano">
          <h2>Mano {mano.numero}</h2>
          <ol>
            {mano.lineas.map((linea, i) => (
              <li key={i} className={linea.startsWith('—') ? 'banco__lance' : undefined}>
                {linea}
              </li>
            ))}
          </ol>
        </section>
      ))}
    </main>
  );
}
