import { useCallback, useEffect, useRef, useState } from 'react';
import { CARA } from '../datos/cara';
import { ORDEN_RIVALES, RIVALES, type IdRival } from '../datos/rivales';
import type { AccionDuelo } from '../nucleo/duelo';
import { borrarPartida, cargarPartida, guardarPartida } from './guardado';
import { apuntar, cargarLibreta, guardarLibreta } from './libreta';
import { aplicarNovedades, mesaInicial, sacarTic, type EstadoMesa } from './mesa';
import {
  ajustarCara,
  jugarJugador,
  jugarRival,
  leTocaAlRival,
  nuevaPartida,
  type Partida,
  type ResultadoPartida,
} from './partida';

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
  /** Lo que le dura al rival la cara que pone (la del final del duelo se queda). */
  reaccion: 2400,
};

/** La semilla de cada duelo nuevo sale del reloj; a partir de ahí, todo el azar es reproducible. */
const semillaNueva = () => `duelo-${Date.now().toString(36)}`;

/** `?rival=engracia` en la dirección elige el rival del primer duelo suelto. */
export function rivalDeLaDireccion(): IdRival | null {
  const pedido = new URLSearchParams(window.location.search).get('rival');
  return ORDEN_RIVALES.find((id) => id === pedido) ?? null;
}

/** Duelo suelto: empieza de cero, Cara incluida. */
function empezarDueloSuelto(rival: IdRival): EstadoMesa {
  const inicio = nuevaPartida(semillaNueva(), rival, CARA.inicial);
  return aplicarNovedades(mesaInicial(inicio.partida), inicio);
}

/** El duelo suelto guardado si lo hay (y es del rival pedido); si no, uno nuevo. */
export function empezarSuelto(rival?: IdRival): EstadoMesa {
  const pedido = rival ?? rivalDeLaDireccion();
  const guardada = cargarPartida();
  if (guardada && guardada.duelo.fase !== 'finDuelo' && (!pedido || pedido === guardada.rivalId)) return mesaInicial(guardada);
  return empezarDueloSuelto(pedido ?? 'lucia');
}

/** Lo que cambia entre el duelo suelto y el de la gira. */
export interface OpcionesDuelo {
  /** Cómo empieza la mesa. */
  inicio: () => EstadoMesa;
  /**
   * Se llama al final de cada mano (para guardar) y al acabar el duelo. Si no se da, es un duelo
   * suelto: se guarda solo y, al acabar, lo visto va a la Libreta.
   */
  alGuardar?: (partida: Partida) => void;
}

export function useDuelo({ inicio, alGuardar }: OpcionesDuelo) {
  const [estado, setEstado] = useState(inicio);
  /** Algo tapa la mesa (la ayuda de la Cara, la bolsa): el rival espera. */
  const [pausa, setPausa] = useState(false);
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

  /** Algo que cambia la partida desde fuera de la jugada (lo que se usa de la bolsa). */
  const aplicar = useCallback((cambio: (partida: Partida) => ResultadoPartida) => {
    setEstado((previo) => {
      try {
        return aplicarNovedades(previo, cambio(previo.partida));
      } catch (error) {
        console.error('No se ha podido usar', error);
        return previo;
      }
    });
  }, []);

  /** Duelo suelto nuevo contra `rival` (o el mismo), de cero. */
  const nuevoDuelo = useCallback((rival?: IdRival) => {
    borrarPartida();
    setEstado((previo) => empezarDueloSuelto(rival ?? previo.partida.rivalId));
  }, []);

  /** Modo de pruebas: subir o bajar la Cara a mano. */
  const cambiarCara = useCallback((delta: number) => {
    setEstado((previo) => ({ ...previo, partida: ajustarCara(previo.partida, delta) }));
  }, []);

  /** Modo de pruebas: enseña seguidos todos los tics que puede hacer el rival, para revisar su arte. */
  const ensayarTics = useCallback(() => {
    setEstado((previo) => {
      const perfil = RIVALES[previo.partida.rivalId];
      const tics = [...perfil.tics, ...(perfil.fasesDeTics ?? []).flatMap((fase) => fase.tics)];
      const ids = [...new Set(tics.map((tic) => tic.id))];
      return { ...previo, colaTics: [...previo.colaTics, ...ids.map((id) => ({ id, verdadero: true }))] };
    });
  }, []);

  // El rival habla cuando le toca, con una pausa para que se le pueda seguir. Mientras lees una
  // ayuda, espera.
  useEffect(() => {
    if (!leTocaAlRival(partida) || pausa) return;
    const reloj = setTimeout(() => {
      setEstado((previo) => (leTocaAlRival(previo.partida) ? aplicarNovedades(previo, jugarRival(previo.partida)) : previo));
    }, RITMO.rival);
    return () => clearTimeout(reloj);
  }, [partida, pausa]);

  // Los tics salen de uno en uno.
  useEffect(() => {
    if (estado.tic) {
      const duracion = RITMO.tic * (estado.tic.explicado ? 1.5 : 1);
      const reloj = setTimeout(() => setEstado((previo) => ({ ...previo, tic: null })), duracion);
      return () => clearTimeout(reloj);
    }
    if (estado.colaTics.length > 0) {
      const reloj = setTimeout(() => setEstado(sacarTic), RITMO.entreTics);
      return () => clearTimeout(reloj);
    }
    return undefined;
  }, [estado.tic, estado.colaTics]);

  // Los avisos de la Cara y del pulso se van solos.
  useEffect(() => {
    if (!estado.avisoCara && !estado.seTeNota) return;
    const reloj = setTimeout(() => setEstado((previo) => ({ ...previo, avisoCara: null, seTeNota: null })), RITMO.aviso);
    return () => clearTimeout(reloj);
  }, [estado.avisoCara, estado.seTeNota]);

  // La cara que pone el rival se le pasa sola, salvo la del final del duelo.
  useEffect(() => {
    if (!estado.reaccion || estado.reaccion.final) return;
    const reloj = setTimeout(() => setEstado((previo) => ({ ...previo, reaccion: null })), RITMO.reaccion);
    return () => clearTimeout(reloj);
  }, [estado.reaccion]);

  // Se guarda al final de cada mano. En el duelo suelto, al acabar se borra y lo visto va a la
  // Libreta (una vez por duelo); en la gira, de eso se encarga la gira.
  const { fase, numeroMano } = partida.duelo;
  const apuntado = useRef<string | null>(null);
  useEffect(() => {
    if (alGuardar) {
      if (fase === 'finMano' || fase === 'finDuelo') alGuardar(partida);
      return;
    }
    if (fase === 'finMano') guardarPartida(partida);
    if (fase === 'finDuelo') {
      borrarPartida();
      if (apuntado.current !== partida.semilla) {
        apuntado.current = partida.semilla;
        guardarLibreta(apuntar(cargarLibreta(), partida.rivalId, partida.estadisticas.observaciones).libreta);
      }
    }
    // Solo al cambiar de fase o de mano: `partida` cambia en cada jugada.
  }, [fase, numeroMano]);

  return {
    estado,
    jugar,
    aplicar,
    nuevoDuelo,
    cambiarCara,
    ensayarTics,
    pausa,
    setPausa,
    rivalPiensa: leTocaAlRival(partida) && !pausa,
  };
}
