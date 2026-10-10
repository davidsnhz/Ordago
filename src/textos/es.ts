import type { Carta, Numero, Palo } from '../nucleo/carta';
import type { Lado } from '../nucleo/comun';
import type { Lance } from '../nucleo/lances';
import type { TipoPares } from '../nucleo/mano';
import type { ConceptoCobro } from '../nucleo/recuento';

/** Textos visibles del juego en español de España. */
export const ES = {
  lados: { jugador: 'Tú', rival: 'Rival' } satisfies Record<Lado, string>,
  lances: {
    grande: 'Grande',
    chica: 'Chica',
    pares: 'Pares',
    juego: 'Juego',
    punto: 'Punto',
  } satisfies Record<Lance, string>,
  numeros: {
    1: 'As', 2: 'Dos', 3: 'Tres', 4: 'Cuatro', 5: 'Cinco', 6: 'Seis', 7: 'Siete',
    10: 'Sota', 11: 'Caballo', 12: 'Rey',
  } satisfies Record<Numero, string>,
  palos: { oros: 'Oros', copas: 'Copas', espadas: 'Espadas', bastos: 'Bastos' } satisfies Record<Palo, string>,
  pares: { ninguno: 'sin pares', pareja: 'pareja', medias: 'medias', duples: 'duples' } satisfies Record<TipoPares, string>,
  acciones: {
    mus: 'Mus',
    corto: 'Corto',
    descartar: 'Descartar',
    paso: 'Paso',
    envido: 'Envido',
    mas: 'Más',
    quiero: 'Quiero',
    noQuiero: 'No quiero',
    ordago: '¡Órdago!',
    siguienteMano: 'Siguiente mano',
  },
  conceptos: {
    enPaso: 'en paso',
    envite: 'envite',
    pares: 'pares',
    juego: 'juego',
    punto: 'punto',
  } satisfies Record<ConceptoCobro, string>,
} as const;

export function nombreCarta(carta: Carta): string {
  return `${ES.numeros[carta.numero]} de ${ES.palos[carta.palo]}`;
}

/** Forma corta para registros: «Ro» es el rey de oros y «3e» el tres de espadas. */
export function cartaCorta(carta: Carta): string {
  const figura: Partial<Record<Numero, string>> = { 1: 'A', 10: 'S', 11: 'C', 12: 'R' };
  const palo: Record<Palo, string> = { oros: 'o', copas: 'c', espadas: 'e', bastos: 'b' };
  return `${figura[carta.numero] ?? carta.numero}${palo[carta.palo]}`;
}
