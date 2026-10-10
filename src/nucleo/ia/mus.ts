import type { EstiloMus, PatronCorte, QueGuarda } from '../../datos/rivales';
import type { Azar } from '../azar';
import { rango, valorJuego, type Carta, type ModoReyes } from '../carta';
import { analizarPares, puntos } from '../mano';

/**
 * Mus y descartes de la IA. Hay una lista común de manos con las que se corta y cada
 * rival añade sus gustos: con qué más corta y qué cartas guarda al descartar.
 */

const rangoDelRey = (modo: ModoReyes) => (modo === 8 ? 7 : 9);
const esRey = (c: Carta, modo: ModoReyes) => rango(c, modo) === rangoDelRey(modo);
const esPito = (c: Carta, modo: ModoReyes) => rango(c, modo) === 0;
const contar = (cartas: readonly Carta[], que: (c: Carta) => boolean) => cartas.filter(que).length;

export function cumplePatron(patron: PatronCorte, cartas: readonly Carta[], modo: ModoReyes): boolean {
  const reyes = contar(cartas, (c) => esRey(c, modo));
  const pares = analizarPares(cartas, modo);
  switch (patron) {
    case 'tresReyes':
      return reyes >= 3;
    case 'treintaYUna':
      return puntos(cartas, modo) === 31;
    case 'duplesConReyes':
      return pares.tipo === 'duples' && pares.alto === rangoDelRey(modo);
    case 'dosReyesYFigura':
      return reyes >= 2 && contar(cartas, (c) => c.numero === 10 || c.numero === 11) >= 1;
    case 'parejaDeReyes':
      return reyes >= 2;
    case 'tresPitos':
      return contar(cartas, (c) => esPito(c, modo)) >= 3;
    case 'solomillo':
      return reyes === 3 && contar(cartas, (c) => esPito(c, modo)) === 1;
    case 'treintaYUnaConPareja':
      return puntos(cartas, modo) === 31 && pares.tipo !== 'ninguno';
  }
}

export interface DecisionMus {
  corta: boolean;
  /** Patrón por el que corta; `farol` si corta sin tener nada de su lista. */
  motivo: PatronCorte | 'farol' | null;
}

export function decidirMus(estilo: EstiloMus, cartas: readonly Carta[], modo: ModoReyes, azar: Azar): DecisionMus {
  const patron = estilo.corta.find((p) => cumplePatron(p, cartas, modo));
  if (patron) return { corta: true, motivo: patron };
  if (estilo.farolDeCorte > 0 && azar.probabilidad(estilo.farolDeCorte)) return { corta: true, motivo: 'farol' };
  return { corta: false, motivo: null };
}

/** Cartas que tira: todas las que no guarda según su estilo, y siempre entre 1 y 4. */
export function elegirDescarte(estilo: EstiloMus, cartas: readonly Carta[], modo: ModoReyes): Carta[] {
  const cuantasDe = new Map<number, number>();
  for (const c of cartas) cuantasDe.set(rango(c, modo), (cuantasDe.get(rango(c, modo)) ?? 0) + 1);

  const guarda = (c: Carta) => estilo.guarda.some((que) => guardaPor(que, c));
  const guardaPor = (que: QueGuarda, c: Carta): boolean => {
    switch (que) {
      case 'reyes':
        return esRey(c, modo);
      case 'ases':
        return esPito(c, modo);
      case 'figuras':
        return valorJuego(c, modo) === 10;
      case 'sietes':
        return c.numero === 7;
      case 'parejas':
        return (cuantasDe.get(rango(c, modo)) ?? 0) >= 2;
    }
  };

  const tira = cartas.filter((c) => !guarda(c));
  if (tira.length > 0) return tira;
  // Hay que pedir al menos una: tira la que menos le sirve (la más alta si busca la Chica).
  const buscaChica = estilo.guarda.includes('ases');
  const peor = [...cartas].sort((a, b) => (buscaChica ? rango(b, modo) - rango(a, modo) : rango(a, modo) - rango(b, modo)))[0]!;
  return [peor];
}
