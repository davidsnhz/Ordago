import { Azar } from '../nucleo/azar';
import { aplicarAccion, crearDuelo, type AccionDuelo, type EstadoDuelo, type OpcionesDuelo } from '../nucleo/duelo';
import type { EventoDuelo } from '../nucleo/eventos';
import { accionAleatoria } from './jugadorAleatorio';

export interface DueloSimulado {
  semilla: number | string;
  acciones: AccionDuelo[];
  eventos: EventoDuelo[];
  estado: EstadoDuelo;
}

/**
 * Juega un duelo completo entre dos jugadores aleatorios. Las jugadas salen de un azar
 * propio derivado de la semilla, así que la misma semilla repite el mismo duelo.
 */
export function simularDuelo(
  semilla: number | string,
  opciones: Omit<OpcionesDuelo, 'semilla'> = {},
  maximoAcciones = 20_000,
): DueloSimulado {
  const inicio = crearDuelo({ ...opciones, semilla });
  const azarJugadores = Azar.conSemilla(`${semilla}/jugadores`);
  const acciones: AccionDuelo[] = [];
  const eventos = [...inicio.eventos];
  let estado = inicio.estado;

  while (estado.fase !== 'finDuelo') {
    if (acciones.length >= maximoAcciones) {
      throw new Error(`El duelo con semilla ${semilla} no terminó en ${maximoAcciones} acciones`);
    }
    const accion = accionAleatoria(estado, azarJugadores);
    const resultado = aplicarAccion(estado, accion, opciones.modificadores);
    acciones.push(accion);
    eventos.push(...resultado.eventos);
    estado = resultado.estado;
  }
  return { semilla, acciones, eventos, estado };
}
