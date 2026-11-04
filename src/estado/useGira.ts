import { useCallback, useEffect, useRef, useState } from 'react';
import type { IdCompanero } from '../datos/companeros';
import type { IdObjeto } from '../datos/objetos';
import { ErrorJugada } from '../nucleo/comun';
import {
  borrarGira,
  comprar,
  conPartida,
  elegirCompanero,
  empezarCalle,
  elegirParada,
  elegirPremio,
  empezarDuelo,
  gastarDeLaBolsa,
  guardarGira,
  otraRonda,
  responderPlaza,
  seguirDesdeResultado,
  terminarCalle,
  terminarDuelo,
  vender,
  volverAlMapa,
  type Bolsa,
  type Gira,
  type Parada,
  type Premio,
} from './gira';
import { cargarLibreta, guardarLibreta } from './libreta';
import type { Partida, ResultadoPartida } from './partida';

/**
 * La gira en la interfaz: guarda sola en cada cambio (durante el duelo, al final de cada mano) y
 * pasa lo visto en cada duelo a la Libreta. Si algo no se puede hacer, no pasa nada.
 */
export function useGira(inicial: Gira) {
  const [gira, setGira] = useState(inicial);
  /** El reparto del duelo que acaba de empezar, para que la mesa lo cuente. No se guarda. */
  const [inicioDuelo, setInicioDuelo] = useState<ResultadoPartida | null>(null);
  const actual = useRef(gira);
  actual.current = gira;

  useEffect(() => {
    if (gira.momento.tipo === 'fin') borrarGira();
    else if (gira.momento.tipo !== 'duelo') guardarGira(gira);
  }, [gira]);

  /** Aplica un paso de la gira; si no se puede (ErrorJugada), lo deja como estaba. */
  const paso = useCallback((cambio: (g: Gira) => Gira) => {
    setGira((g) => {
      try {
        return cambio(g);
      } catch (error) {
        if (!(error instanceof ErrorJugada)) throw error;
        console.warn(error.message);
        return g;
      }
    });
  }, []);

  const aLaMesa = useCallback(() => {
    try {
      const { gira: conDuelo, inicio } = empezarDuelo(actual.current);
      guardarGira(conDuelo);
      setInicioDuelo(inicio);
      setGira(conDuelo);
    } catch (error) {
      if (!(error instanceof ErrorJugada)) throw error;
    }
  }, []);

  /** En la plaza: aceptar la partida en la calle lleva a la mesa; lo demás se resuelve allí mismo. */
  const responder = useCallback(
    (acepta: boolean) => {
      const { momento } = actual.current;
      if (!acepta || momento.tipo !== 'plaza' || momento.evento.tipo !== 'calle') {
        paso((g) => responderPlaza(g, acepta));
        return;
      }
      try {
        const { gira: enLaCalle, inicio } = empezarCalle(actual.current);
        guardarGira(enLaCalle);
        setInicioDuelo(inicio);
        setGira(enLaCalle);
      } catch (error) {
        if (!(error instanceof ErrorJugada)) throw error;
      }
    },
    [paso],
  );

  /** Al final de cada mano: se guarda la gira con el duelo como va. */
  const alGuardar = useCallback((partida: Partida) => {
    if (actual.current.momento.tipo === 'duelo') guardarGira(conPartida(actual.current, partida));
  }, []);

  const terminar = useCallback((partida: Partida) => {
    const libreta = cargarLibreta();
    try {
      const r = terminarDuelo(actual.current, partida, libreta);
      guardarLibreta(r.libreta);
      setInicioDuelo(null);
      setGira(r.gira);
    } catch (error) {
      if (!(error instanceof ErrorJugada)) throw error;
    }
  }, []);

  return {
    gira,
    inicioDuelo,
    elegirCompanero: (id: IdCompanero) => paso((g) => elegirCompanero(g, id)),
    aLaMesa,
    alGuardar,
    gastar: (id: IdObjeto) => paso((g) => gastarDeLaBolsa(g, id)),
    terminar,
    seguir: () => paso(seguirDesdeResultado),
    parada: (p: Parada) => paso((g) => elegirParada(g, p)),
    alMapa: () => paso(volverAlMapa),
    comprar: (indice: number) => paso((g) => comprar(g, indice)),
    vender: (hueco: keyof Bolsa, indice: number) => paso((g) => vender(g, hueco, indice)),
    otraRonda: () => paso(otraRonda),
    responderPlaza: responder,
    terminarCalle: (partida: Partida) => {
      setInicioDuelo(null);
      paso((g) => terminarCalle(g, partida));
    },
    premio: (p: Premio) => paso((g) => elegirPremio(g, p)),
  };
}
