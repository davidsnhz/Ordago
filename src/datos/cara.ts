/** La Cara (temple): números del apartado «Faroles, tics y la Cara» del documento. */
export const CARA = {
  inicial: 60,
  minimo: 0,
  maximo: 100,
  /** Cambios en la Cara. */
  farolCreido: 8,
  enviteCobrado: 4,
  farolPillado: -12,
  ordagoPerdido: -15,
  descanso: 20,
  /** Un envite es farol si las cartas tenían menos de esto de ganar el lance. */
  umbralFarol: 0.35,
  /** Y es «con buena mano» si tenían al menos esto (el documento no lo fija). */
  umbralBuenaMano: 0.65,
  /** Zonas: por debajo de `baja`, te pillan; desde `alta`, te temen. */
  zonas: { baja: 35, alta: 70 },
} as const;
