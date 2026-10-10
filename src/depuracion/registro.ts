import type { AccionEnvite } from '../nucleo/apuestas';
import type { Carta, ModoReyes } from '../nucleo/carta';
import type { Lado, PorLado } from '../nucleo/comun';
import type { EventoDuelo } from '../nucleo/eventos';
import { analizarPares, puntos } from '../nucleo/mano';
import { cartaCorta, ES } from '../textos/es';

/*
 * Registro legible de un duelo para el banco de pruebas. Es una herramienta de desarrollo:
 * sus frases no van en textos/es.ts, pero sí usa el vocabulario del juego que hay allí.
 */

/**
 * En el banco de pruebas no juega nadie de verdad: los dos asientos los ocupan bots que
 * eligen jugadas al azar. Se llaman así para no confundirlos con el jugador.
 */
export const BOTS: Record<Lado, string> = { jugador: 'Bot A', rival: 'Bot B' };

export interface ManoRegistrada {
  numero: number;
  lineas: string[];
}

export function registrarDuelo(eventos: readonly EventoDuelo[], modo: ModoReyes = 8): ManoRegistrada[] {
  const manos: ManoRegistrada[] = [];
  for (const evento of eventos) {
    if (evento.tipo === 'reparto') manos.push({ numero: evento.numeroMano, lineas: [] });
    const actual = manos[manos.length - 1];
    const linea = describirEvento(evento, modo);
    if (actual && linea) actual.lineas.push(linea);
  }
  return manos;
}

export function describirEvento(evento: EventoDuelo, modo: ModoReyes = 8): string | null {
  const quien = (lado: Lado) => BOTS[lado];
  switch (evento.tipo) {
    case 'reparto':
      return `Es mano: ${quien(evento.quienEsMano)}. ${describirManos(evento.cartas, modo)}`;
    case 'mus':
      return `${quien(evento.lado)}: ${evento.quiereMus ? 'mus' : 'corto'}`;
    case 'descarte':
      return `${quien(evento.lado)} descarta ${listar(evento.descartadas)} y roba ${listar(evento.robadas)}`;
    case 'rebarajado':
      return `Se acaba el mazo: se rebarajan ${evento.cartas} descartes`;
    case 'inicioLance':
      return `— ${ES.lances[evento.lance]} —`;
    case 'declaracion':
      return `${quien(evento.lado)}: ${evento.lance} ${evento.tiene ? 'sí' : 'no'}`;
    case 'envite':
      return `${quien(evento.lado)}: ${describirAccion(evento.accion)}`;
    case 'deje':
      return `${quien(evento.lado)} cobra ${evento.piedras} por el «no quiero» (${marcador(evento.marcador)})`;
    case 'finLance':
      if (evento.modo === 'nadie') return `Nadie tiene ${evento.lance}`;
      if (evento.modo === 'soloUno') return `Solo uno tiene ${evento.lance}: lo cobra en el recuento`;
      return evento.resultado?.tipo === 'enPaso' ? 'En paso' : null;
    case 'ordago':
      return `¡Órdago a ${ES.lances[evento.lance]} querido! ${describirManos(evento.cartas, modo)} Gana ${quien(evento.ganador)}.`;
    case 'recuento': {
      const cobros = evento.cobros.map((cobro, i) => {
        const texto = `${ES.lances[cobro.lance]} ${cobro.piedras} (${ES.conceptos[cobro.concepto]}) → ${quien(cobro.lado)}`;
        return i < evento.aplicados ? texto : `${texto} [sin cobrar: ya había ganador]`;
      });
      return `Recuento: ${cobros.length ? cobros.join(' · ') : 'nada'}. ${describirManos(evento.cartas, modo)} ${marcador(evento.marcador)}`;
    }
    case 'finMano':
      return null;
    case 'finDuelo':
      return `FIN: gana ${quien(evento.ganador)} ${evento.motivo === 'ordago' ? 'por órdago' : 'a piedras'} (${marcador(evento.marcador)})`;
  }
}

function describirAccion(accion: AccionEnvite): string {
  switch (accion.tipo) {
    case 'envido':
      return `${ES.acciones.envido} ${accion.piedras}`;
    case 'mas':
      return `${accion.piedras} ${ES.acciones.mas.toLowerCase()}`;
    default:
      return ES.acciones[accion.tipo];
  }
}

function describirManos(cartas: PorLado<Carta[]>, modo: ModoReyes): string {
  const una = (lado: 'jugador' | 'rival') => {
    const pares = analizarPares(cartas[lado], modo).tipo;
    return `${BOTS[lado]}: ${listar(cartas[lado])} (${puntos(cartas[lado], modo)}, ${ES.pares[pares]})`;
  };
  return `${una('jugador')} | ${una('rival')}.`;
}

function listar(cartas: readonly Carta[]): string {
  return cartas.map(cartaCorta).join(' ');
}

function marcador(m: PorLado<number>): string {
  return `${BOTS.jugador} ${m.jugador} – ${BOTS.rival} ${m.rival}`;
}
