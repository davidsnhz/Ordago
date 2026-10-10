import { useCallback, useEffect, useState } from 'react';
import type { AccionDuelo } from '../nucleo/duelo';
import { borrarPartida, cargarPartida, guardarPartida } from './guardado';
import { aplicarNovedades, mesaInicial, sacarTic, type EstadoMesa } from './mesa';
import { jugarJugador, jugarRival, leTocaAlRival, nuevaPartida } from './partida';

/** Ritmo de la mesa, en milisegundos. */
const RITMO = {
  /** Lo que tarda el rival en hablar. */
  rival: 950,
  /** Lo que dura un tic en pantalla. */
  tic: 2200,
  /** Pausa entre dos tics seguidos. */
  entreTics: 400,
};

/** La semilla de cada duelo nuevo sale del reloj; a partir de ahí, todo el azar es reproducible. */
const semillaNueva = () => `duelo-${Date.now().toString(36)}`;

function empezar(): EstadoMesa {
  const guardada = cargarPartida();
  if (guardada && guardada.duelo.fase !== 'finDuelo') return mesaInicial(guardada);
  const inicio = nuevaPartida(semillaNueva());
  return aplicarNovedades(mesaInicial(inicio.partida), inicio);
}

export function useDuelo() {
  const [estado, setEstado] = useState(empezar);
  const { partida } = estado;

  const jugar = useCallback((accion: AccionDuelo) => {
    setEstado((previo) => {
      try {
        return aplicarNovedades(previo, jugarJugador(previo.partida, accion));
      } catch (error) {
        console.error('Jugada rechazada', accion, error);
        return previo;
      }
    });
  }, []);

  const nuevoDuelo = useCallback(() => {
    borrarPartida();
    const inicio = nuevaPartida(semillaNueva());
    setEstado(aplicarNovedades(mesaInicial(inicio.partida), inicio));
  }, []);

  // El rival habla cuando le toca, con una pausa para que se le pueda seguir.
  useEffect(() => {
    if (!leTocaAlRival(partida)) return;
    const reloj = setTimeout(() => {
      setEstado((previo) => (leTocaAlRival(previo.partida) ? aplicarNovedades(previo, jugarRival(previo.partida)) : previo));
    }, RITMO.rival);
    return () => clearTimeout(reloj);
  }, [partida]);

  // Los tics salen de uno en uno.
  useEffect(() => {
    if (estado.tic) {
      const reloj = setTimeout(() => setEstado((previo) => ({ ...previo, tic: null })), RITMO.tic);
      return () => clearTimeout(reloj);
    }
    if (estado.colaTics.length > 0) {
      const reloj = setTimeout(() => setEstado(sacarTic), RITMO.entreTics);
      return () => clearTimeout(reloj);
    }
    return undefined;
  }, [estado.tic, estado.colaTics]);

  // Se guarda al final de cada mano; al acabar el duelo se borra.
  const { fase, numeroMano } = partida.duelo;
  useEffect(() => {
    if (fase === 'finMano') guardarPartida(partida);
    if (fase === 'finDuelo') borrarPartida();
    // Solo al cambiar de fase o de mano: `partida` cambia en cada jugada.
  }, [fase, numeroMano]);

  return { estado, jugar, nuevoDuelo, rivalPiensa: leTocaAlRival(partida) };
}
