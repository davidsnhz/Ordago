export const PALOS = ['oros', 'copas', 'espadas', 'bastos'] as const;
export type Palo = (typeof PALOS)[number];

/** 10 = sota, 11 = caballo, 12 = rey. La baraja española de 40 no tiene ochos ni nueves. */
export const NUMEROS = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12] as const;
export type Numero = (typeof NUMEROS)[number];

export interface Carta {
  readonly numero: Numero;
  readonly palo: Palo;
}

/**
 * A 8 reyes (lo normal) los treses son reyes y los doses son ases.
 * A 4 reyes (la Baraja de 4 reyes de la taberna) cada carta vale lo suyo.
 */
export type ModoReyes = 8 | 4;

/** Identificador estable, igual al nombre del archivo de la carta: `12_oros`. */
export function idCarta(carta: Carta): string {
  return `${String(carta.numero).padStart(2, '0')}_${carta.palo}`;
}

export function cartaDesdeId(id: string): Carta {
  const coincidencia = /^(\d{2})_(oros|copas|espadas|bastos)$/.exec(id);
  const numero = coincidencia ? Number(coincidencia[1]) : NaN;
  if (!coincidencia || !(NUMEROS as readonly number[]).includes(numero)) {
    throw new RangeError(`Identificador de carta no válido: ${id}`);
  }
  return { numero: numero as Numero, palo: coincidencia[2] as Palo };
}

export function mismaCarta(a: Carta, b: Carta): boolean {
  return a.numero === b.numero && a.palo === b.palo;
}

// Rango de 0 (as) a 7 o 9 (rey). Sirve para la Grande, la Chica y los Pares.
const RANGO_8_REYES: Record<Numero, number> = {
  1: 0, 2: 0, 4: 1, 5: 2, 6: 3, 7: 4, 10: 5, 11: 6, 12: 7, 3: 7,
};
const RANGO_4_REYES: Record<Numero, number> = {
  1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 10: 7, 11: 8, 12: 9,
};

export function rango(carta: Carta, modo: ModoReyes): number {
  return (modo === 8 ? RANGO_8_REYES : RANGO_4_REYES)[carta.numero];
}

/** Lo que vale la carta al sumar para el Juego y el Punto. */
export function valorJuego(carta: Carta, modo: ModoReyes): number {
  if (carta.numero >= 10) return 10;
  if (modo === 8) {
    if (carta.numero === 3) return 10;
    if (carta.numero === 2) return 1;
  }
  return carta.numero;
}
