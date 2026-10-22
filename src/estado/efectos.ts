import type { Lado } from '../nucleo/comun';
import type { EventoDuelo } from '../nucleo/eventos';
import type { Lance } from '../nucleo/lances';

/**
 * La mesa viva (prototipo, 22 de octubre de 2026): lo que se ve y se oye por lo que acaba de
 * pasar, además del acta. Sale de los eventos de cada acción, sin efectos secundarios; la
 * interfaz lo anima y lo hace sonar.
 */
export type EfectoMesa =
  /** Mano nueva: las cartas salen del mazo. */
  | { tipo: 'reparto' }
  /** Alguien tira cartas y roba otras tantas. */
  | { tipo: 'descarte'; lado: Lado; cuantas: number }
  /**
   * Lo que dice alguien, como un sello que cae sobre el tapete. `lance` es el lance en que lo
   * dice (`null` en el mus): al acabar ese lance, el sello se guarda en su casilla.
   */
  | { tipo: 'sello'; lado: Lado; dice: DichoSello; piedras: number; fuerza: FuerzaSello; lance: Lance | null }
  /** ¡Órdago! tirado: el momento grande. */
  | { tipo: 'ordago'; lado: Lado; lance: Lance }
  /**
   * Piedras que se cobra alguien ahora mismo: un «no quiero» o cada cobro del recuento, en su
   * `orden`. Sirve para que las piedras salgan de la casilla de su lance.
   */
  | { tipo: 'cobro'; lado: Lado; lance: Lance; piedras: number; orden: number }
  /** Se enseñan las cartas (recuento u órdago querido). */
  | { tipo: 'cartasVistas' }
  | { tipo: 'finDuelo'; ganador: Lado };

/** Lo que se dice. El órdago no cae como sello (tiene su escena), pero la mesa nueva lo deja puesto. */
export type DichoSello = 'mus' | 'corto' | 'paso' | 'envido' | 'mas' | 'quiero' | 'noQuiero' | 'ordago';

/** 0, se dice sin más; 1, golpe en la mesa; 2, golpe que hace temblar la mesa. */
export type FuerzaSello = 0 | 1 | 2;

/** Un envite de tantas piedras o más ya hace temblar la mesa. */
const ENVITE_FUERTE = 5;

export function efectosDe(eventos: readonly EventoDuelo[]): EfectoMesa[] {
  const efectos: EfectoMesa[] = [];
  for (const evento of eventos) {
    switch (evento.tipo) {
      case 'reparto':
        efectos.push({ tipo: 'reparto' });
        break;
      case 'mus':
        efectos.push({ tipo: 'sello', lado: evento.lado, dice: evento.quiereMus ? 'mus' : 'corto', piedras: 0, fuerza: 0, lance: null });
        break;
      case 'descarte':
        efectos.push({ tipo: 'descarte', lado: evento.lado, cuantas: evento.descartadas.length });
        break;
      case 'envite': {
        const { accion, lado, lance } = evento;
        if (accion.tipo === 'ordago') {
          efectos.push({ tipo: 'ordago', lado, lance });
        } else if (accion.tipo === 'envido' || accion.tipo === 'mas') {
          const fuerza: FuerzaSello = accion.tipo === 'mas' || accion.piedras >= ENVITE_FUERTE ? 2 : 1;
          efectos.push({ tipo: 'sello', lado, dice: accion.tipo, piedras: accion.piedras, fuerza, lance });
        } else {
          efectos.push({ tipo: 'sello', lado, dice: accion.tipo, piedras: 0, fuerza: accion.tipo === 'quiero' ? 1 : 0, lance });
        }
        break;
      }
      case 'deje':
        efectos.push({ tipo: 'cobro', lado: evento.lado, lance: evento.lance, piedras: evento.piedras, orden: 0 });
        break;
      case 'ordago':
        efectos.push({ tipo: 'cartasVistas' });
        break;
      case 'recuento':
        efectos.push({ tipo: 'cartasVistas' });
        // Solo lo que se llegó a apuntar: si alguien llega a 20 a mitad, lo demás no se cobra.
        evento.cobros.slice(0, evento.aplicados).forEach((cobro, orden) => {
          efectos.push({ tipo: 'cobro', lado: cobro.lado, lance: cobro.lance, piedras: cobro.piedras, orden });
        });
        break;
      case 'finDuelo':
        efectos.push({ tipo: 'finDuelo', ganador: evento.ganador });
        break;
      default:
        break;
    }
  }
  return efectos;
}
