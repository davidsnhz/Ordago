import { CARA } from '../datos/cara';
import type { Lado } from './comun';
import type { EstadoDuelo } from './duelo';
import type { EventoDuelo } from './eventos';
import { calcularFuerza, type Fuerza } from './ia/fuerza';
import type { Lance } from './lances';
import type { LanceJugado } from './recuento';

/**
 * La Cara (temple) del jugador. El juego decide solo qué fue un farol: un envite, subida u
 * órdago en un lance en el que tus cartas tenían menos de un 35 % de ganar.
 * - Farol que el rival no acepta: +8.
 * - Envite con buena mano (65 % o más) que el rival acepta y pierde: +4.
 * - Farol que el rival acepta y se ve en el recuento: −12.
 * - Órdago tuyo que pierdes: −15.
 */

export type MotivoCara = 'farolCreido' | 'enviteCobrado' | 'farolPillado' | 'ordagoPerdido' | 'descanso';

export interface CambioCara {
  motivo: MotivoCara;
  delta: number;
  lance?: Lance;
}

const ENVITES = new Set(['envido', 'mas', 'ordago']);

function envido(jugado: LanceJugado | undefined, lado: Lado): boolean {
  return !!jugado?.envite?.historial.some((paso) => paso.lado === lado && ENVITES.has(paso.accion.tipo));
}

/** Cambios de Cara que producen los eventos de una acción. `estado` es el de después de la acción. */
export function cambiosDeCara(eventos: readonly EventoDuelo[], estado: EstadoDuelo, lado: Lado = 'jugador'): CambioCara[] {
  let fuerza: Fuerza | null = null;
  const fuerzaEn = (lance: Lance) => {
    fuerza ??= calcularFuerza(estado.cartas[lado], estado.quienEsMano === lado, estado.reglas.modoReyes);
    return fuerza[lance];
  };
  const jugado = (lance: Lance) => estado.lances.find((l) => l.lance === lance);
  const cambios: CambioCara[] = [];

  for (const evento of eventos) {
    switch (evento.tipo) {
      case 'deje':
        // El rival se ha retirado de tu envite.
        if (evento.lado === lado && envido(jugado(evento.lance), lado) && fuerzaEn(evento.lance) < CARA.umbralFarol) {
          cambios.push({ motivo: 'farolCreido', delta: CARA.farolCreido, lance: evento.lance });
        }
        break;
      case 'recuento':
        for (const l of estado.lances) {
          if (l.envite?.resultado?.tipo !== 'querido' || !envido(l, lado)) continue;
          const f = fuerzaEn(l.lance);
          if (f < CARA.umbralFarol) {
            cambios.push({ motivo: 'farolPillado', delta: CARA.farolPillado, lance: l.lance });
          } else if (f >= CARA.umbralBuenaMano && evento.ganadores[l.lance] === lado) {
            cambios.push({ motivo: 'enviteCobrado', delta: CARA.enviteCobrado, lance: l.lance });
          }
        }
        break;
      case 'ordago':
        if (evento.lanzador !== lado) break;
        if (fuerzaEn(evento.lance) < CARA.umbralFarol) {
          cambios.push({ motivo: 'farolPillado', delta: CARA.farolPillado, lance: evento.lance });
        }
        if (evento.ganador !== lado) cambios.push({ motivo: 'ordagoPerdido', delta: CARA.ordagoPerdido, lance: evento.lance });
        break;
      default:
        break;
    }
  }
  return cambios;
}

export function aplicarCambiosDeCara(cara: number, cambios: readonly CambioCara[], minimo: number = CARA.minimo): number {
  const total = cambios.reduce((suma, c) => suma + c.delta, cara);
  return Math.max(minimo, Math.min(CARA.maximo, total));
}

export type ZonaCara = 'pillan' | 'creen' | 'temen';

export function zonaDeCara(cara: number): ZonaCara {
  if (cara < CARA.zonas.baja) return 'pillan';
  if (cara >= CARA.zonas.alta) return 'temen';
  return 'creen';
}
