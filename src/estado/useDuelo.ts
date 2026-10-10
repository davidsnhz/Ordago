import { useCallback, useEffect, useState } from 'react';
import { CARA } from '../datos/cara';
import { IA } from '../datos/ia';
import { ORDEN_RIVALES, type IdRival } from '../datos/rivales';
import type { AccionDuelo } from '../nucleo/duelo';
import { borrarPartida, cargarCara, cargarPartida, guardarCara, guardarPartida } from './guardado';
import { aplicarNovedades, mesaInicial, sacarTic, type EstadoMesa } from './mesa';
import { ajustarCara, jugarJugador, jugarRival, leTocaAlRival, mirarAlRival, nuevaPartida } from './partida';

/** Ritmo de la mesa, en milisegundos. */
const RITMO = {
  /** Lo que tarda el rival en hablar. */
  rival: 950,
  /** Lo que dura un tic en pantalla. */
  tic: 2200,
  /** Pausa entre dos tics seguidos. */
  entreTics: 400,
  /** Lo que duran los avisos de la Cara y del pulso. */
  aviso: 2600,
};

/** La semilla de cada duelo nuevo sale del reloj; a partir de ahí, todo el azar es reproducible. */
const semillaNueva = () => `duelo-${Date.now().toString(36)}`;

/** `?rival=engracia` en la dirección elige el rival del primer duelo. */
function rivalDeLaDireccion(): IdRival | null {
  const pedido = new URLSearchParams(window.location.search).get('rival');
  return ORDEN_RIVALES.find((id) => id === pedido) ?? null;
}

function empezarDuelo(rival: IdRival, cara: number): EstadoMesa {
  const inicio = nuevaPartida(semillaNueva(), rival, cara);
  return aplicarNovedades(mesaInicial(inicio.partida), inicio);
}

function empezar(): EstadoMesa {
  const pedido = rivalDeLaDireccion();
  const guardada = cargarPartida();
  if (guardada && guardada.duelo.fase !== 'finDuelo' && (!pedido || pedido === guardada.rivalId)) return mesaInicial(guardada);
  return empezarDuelo(pedido ?? 'ruperto', cargarCara() ?? CARA.inicial);
}

export function useDuelo() {
  const [estado, setEstado] = useState(empezar);
  const [mirando, setMirando] = useState(false);
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

  /** Duelo nuevo contra `rival` (o el mismo). La Cara se mantiene. */
  const nuevoDuelo = useCallback((rival?: IdRival) => {
    borrarPartida();
    setEstado((previo) => empezarDuelo(rival ?? previo.partida.rivalId, previo.partida.caraJugador));
  }, []);

  /** Termina una mirada al rival que ha durado `segundos`. */
  const mirar = useCallback((segundos: number) => {
    setEstado((previo) => aplicarNovedades(previo, mirarAlRival(previo.partida, segundos)));
  }, []);

  /** Modo de depuración: subir o bajar la Cara a mano. */
  const cambiarCara = useCallback((delta: number) => {
    setEstado((previo) => ({ ...previo, partida: ajustarCara(previo.partida, delta) }));
  }, []);

  // El rival habla cuando le toca, con una pausa para que se le pueda seguir. Mientras le
  // miras, espera.
  useEffect(() => {
    if (!leTocaAlRival(partida) || mirando) return;
    const reloj = setTimeout(() => {
      setEstado((previo) => (leTocaAlRival(previo.partida) ? aplicarNovedades(previo, jugarRival(previo.partida)) : previo));
    }, RITMO.rival);
    return () => clearTimeout(reloj);
  }, [partida, mirando]);

  // Los tics salen de uno en uno; mirando al rival duran más.
  useEffect(() => {
    if (estado.tic) {
      const duracion = RITMO.tic * (mirando ? IA.tics.duracionMirando : 1);
      const reloj = setTimeout(() => setEstado((previo) => ({ ...previo, tic: null })), duracion);
      return () => clearTimeout(reloj);
    }
    if (estado.colaTics.length > 0) {
      const reloj = setTimeout(() => setEstado(sacarTic), RITMO.entreTics);
      return () => clearTimeout(reloj);
    }
    return undefined;
  }, [estado.tic, estado.colaTics, mirando]);

  // Los avisos de la Cara y del pulso se van solos.
  useEffect(() => {
    if (!estado.avisoCara && !estado.seTeNota) return;
    const reloj = setTimeout(() => setEstado((previo) => ({ ...previo, avisoCara: null, seTeNota: null })), RITMO.aviso);
    return () => clearTimeout(reloj);
  }, [estado.avisoCara, estado.seTeNota]);

  // Se guarda al final de cada mano; al acabar el duelo se borra (la Cara se queda).
  const { fase, numeroMano } = partida.duelo;
  useEffect(() => {
    guardarCara(partida.caraJugador);
    if (fase === 'finMano') guardarPartida(partida);
    if (fase === 'finDuelo') borrarPartida();
    // Solo al cambiar de fase o de mano: `partida` cambia en cada jugada.
  }, [fase, numeroMano]);

  return {
    estado,
    jugar,
    nuevoDuelo,
    mirar,
    mirando,
    setMirando,
    cambiarCara,
    rivalPiensa: leTocaAlRival(partida) && !mirando,
  };
}
