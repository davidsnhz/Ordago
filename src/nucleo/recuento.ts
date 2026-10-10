import type { Reglas } from '../datos/reglas';
import type { EstadoEnvite } from './apuestas';
import type { Carta } from './carta';
import { LADOS, otroLado, type Lado, type PorLado } from './comun';
import { ganadorLance, type Lance } from './lances';
import { analizarPares, JUEGO_MINIMO, puntos, tieneJuego, tienePares } from './mano';

/**
 * Cómo se jugó un lance:
 * - `envites`: los dos podían envidar (siempre en Grande, Chica y Punto).
 * - `soloUno`: solo uno tenía pares o juego; no hay envites y cobra él.
 * - `nadie`: nadie tenía pares; el lance no se juega.
 */
export type ModoLance = 'envites' | 'soloUno' | 'nadie';

export interface LanceJugado {
  lance: Lance;
  modo: ModoLance;
  /** Ronda de envites ya resuelta (solo en modo `envites`). */
  envite: EstadoEnvite | null;
  /** Envite querido que se retiró por un trato: sus piedras se reparten. */
  trato?: boolean;
}

export type ConceptoCobro = 'enPaso' | 'envite' | 'pares' | 'juego' | 'punto' | 'trato' | 'penitencia';

export interface Cobro {
  lance: Lance;
  lado: Lado;
  piedras: number;
  concepto: ConceptoCobro;
}

export interface DatosRecuento {
  lances: readonly LanceJugado[];
  cartas: PorLado<readonly Carta[]>;
  reglas: Reglas;
  /** Quién gana los empates en cada lance (normalmente la mano). */
  ganaEmpate: (lance: Lance) => Lado;
  /** Quién propuso el trato, si lo hubo: se queda la piedra impar. */
  ofreceTrato?: Lado | null;
}

export interface CobrosDeLaMano {
  /** Todos los cobros, en el orden del recuento: Grande, Chica, Pares, Juego o Punto. */
  cobros: Cobro[];
  /** Quién se llevó cada lance: el que gana la comparación o el que envidó si no se quiso. */
  ganadores: Partial<Record<Lance, Lado | null>>;
}

/**
 * Lo que se cobra en el recuento. Los dejes de los «no quiero» no están aquí: se apuntan
 * en el momento. Sí está lo que el que envidó cobra después por sus pares, su juego o el punto.
 */
export function calcularCobros(datos: DatosRecuento): CobrosDeLaMano {
  const { cartas, reglas } = datos;
  const modo = reglas.modoReyes;
  const cobros: Cobro[] = [];
  const ganadores: CobrosDeLaMano['ganadores'] = {};

  const valorDe = (lance: Lance, lado: Lado): number => {
    if (lance === 'pares') return reglas.valorPares[analizarParesNoVacios(cartas[lado], modo)];
    if (lance === 'juego') {
      const suma = puntos(cartas[lado], modo);
      if (suma < JUEGO_MINIMO) throw new Error('Se intentó cobrar juego de una mano sin juego');
      return suma === 31 ? reglas.valorJuego.treintaYUna : reglas.valorJuego.otro;
    }
    if (lance === 'punto') return reglas.valorPunto;
    return 0;
  };
  const cobrar = (lance: Lance, lado: Lado, piedras: number, concepto: ConceptoCobro): void => {
    if (piedras > 0) cobros.push({ lance, lado, piedras, concepto });
  };
  const conceptoDelLance = (lance: Lance): ConceptoCobro =>
    lance === 'pares' || lance === 'juego' || lance === 'punto' ? lance : 'enPaso';

  for (const jugado of datos.lances) {
    const { lance } = jugado;

    if (jugado.modo === 'nadie') {
      ganadores[lance] = null;
      continue;
    }
    if (jugado.modo === 'soloUno') {
      const tiene = lance === 'pares' ? tienePares : tieneJuego;
      const lado = LADOS.find((l) => tiene(cartas[l], modo));
      if (!lado) throw new Error(`Nadie tiene ${lance} en un lance marcado como «soloUno»`);
      ganadores[lance] = lado;
      cobrar(lance, lado, valorDe(lance, lado), conceptoDelLance(lance));
      continue;
    }

    const resultado = jugado.envite?.resultado;
    if (!resultado) throw new Error(`El lance de ${lance} no tiene los envites resueltos`);

    switch (resultado.tipo) {
      case 'noQuerido': {
        // El deje ya se cobró. Quien envidó se lleva el lance y, en Pares, Juego y Punto,
        // cobra además su jugada aunque la del rival fuera mejor.
        ganadores[lance] = resultado.ganador;
        if (lance !== 'grande' && lance !== 'chica') {
          cobrar(lance, resultado.ganador, valorDe(lance, resultado.ganador), conceptoDelLance(lance));
        }
        break;
      }
      case 'enPaso': {
        const ganador = ganadorLance(lance, cartas, datos.ganaEmpate(lance), modo);
        ganadores[lance] = ganador;
        const piedras = lance === 'grande' || lance === 'chica' ? reglas.piedrasEnPaso : valorDe(lance, ganador);
        cobrar(lance, ganador, piedras, conceptoDelLance(lance));
        break;
      }
      case 'querido': {
        const ganador = ganadorLance(lance, cartas, datos.ganaEmpate(lance), modo);
        ganadores[lance] = ganador;
        if (jugado.trato && datos.ofreceTrato) {
          // Trato: se reparten el envite y quien lo propuso se queda la piedra impar.
          const mitad = Math.floor(resultado.piedras / 2);
          cobrar(lance, otroLado(datos.ofreceTrato), mitad, 'trato');
          cobrar(lance, datos.ofreceTrato, resultado.piedras - mitad, 'trato');
        } else {
          cobrar(lance, ganador, resultado.piedras, 'envite');
        }
        if (lance !== 'grande' && lance !== 'chica') {
          cobrar(lance, ganador, valorDe(lance, ganador), conceptoDelLance(lance));
        }
        break;
      }
      case 'ordagoQuerido':
        throw new Error('Un órdago querido se resuelve en el momento, no en el recuento');
    }
  }

  return { cobros, ganadores };
}

export interface CobrosAplicados {
  marcador: PorLado<number>;
  /** Cobros que se apuntaron. */
  aplicados: Cobro[];
  /** Cobros que ya no hizo falta apuntar porque alguien llegó antes a la meta. */
  sinCobrar: Cobro[];
  ganador: Lado | null;
}

/** Apunta los cobros en orden y se para en cuanto alguien llega a `meta`. */
export function aplicarCobros(marcador: PorLado<number>, cobros: readonly Cobro[], meta: number): CobrosAplicados {
  const nuevo = { ...marcador };
  for (let i = 0; i < cobros.length; i++) {
    const cobro = cobros[i]!;
    nuevo[cobro.lado] += cobro.piedras;
    if (nuevo[cobro.lado] >= meta) {
      return { marcador: nuevo, aplicados: cobros.slice(0, i + 1), sinCobrar: cobros.slice(i + 1), ganador: cobro.lado };
    }
  }
  return { marcador: nuevo, aplicados: [...cobros], sinCobrar: [], ganador: null };
}

function analizarParesNoVacios(cartas: readonly Carta[], modo: Reglas['modoReyes']): 'pareja' | 'medias' | 'duples' {
  const tipo = analizarPares(cartas, modo).tipo;
  if (tipo === 'ninguno') throw new Error('Se intentó cobrar pares de una mano sin pares');
  return tipo;
}
