/**
 * Números de equilibrio de la IA. Salen del apartado «IA de los rivales» del documento
 * de diseño; los que el documento no fija están marcados y explicados en docs/decisiones.md.
 */
export const IA = {
  envido: {
    /** Envida con buena mano si F > umbralBase − porAgresividad · (A − 5). */
    umbralBase: 0.65,
    porAgresividad: 0.03,
    /** Cantidad: piedrasBase, más 1 por cada `paso` que F supere el umbral si A ≥ agresividadParaSubir. */
    piedrasBase: 2,
    paso: 0.1,
    agresividadParaSubir: 6,
  },
  farol: {
    /** Con F por debajo de esto, envida de farol con probabilidad porFaroleo · B. */
    fuerzaMaxima: 0.35,
    porFaroleo: 0.04,
    piedras: 2,
  },
  aceptar: {
    umbral: 0.5,
    /** Ruido ε entre −ruido y +ruido. */
    ruido: 0.05,
    caraNeutra: 50,
    divisorCara: 200,
    pesoMemoria: 0.6,
    farolesEsperados: 0.25,
  },
  ordago: {
    /**
     * Tira órdago con F > fuerzaMinima y probabilidad porAgresividad · A. El documento dice
     * 0,1 · A, pero así Ruperto tiraba órdago en la mitad de las manos (docs/decisiones.md).
     */
    fuerzaMinima: 0.85,
    porAgresividad: 0.03,
    /** De farol, si va perdiendo de `desesperacion` o más, con probabilidad farolPorFaroleo · B. */
    farolPorFaroleo: 0.01,
    desesperacion: 8,
    /** Para aceptar: el umbral sube porMiedo · M y baja `descuentoDesesperado` si va perdiendo. */
    porMiedo: 0.04,
    descuentoDesesperado: 0.1,
  },
  /** Respuesta a un envite con mano muy buena (el documento no lo fija). */
  subir: {
    /** Sube («más») si F supera su umbral de envidar en este margen… */
    margen: 0.2,
    /** …con probabilidad porAgresividad · A, mientras la apuesta no pase de apuestaMaxima. */
    porAgresividad: 0.1,
    apuestaMaxima: 10,
  },
  tics: {
    /** Probabilidad de hacer el tic cuando se cumple su disparador. */
    probabilidadSiCumple: 0.6,
  },
  /** Un envite es farol si las cartas tenían menos de esto de ganar el lance. */
  umbralFarol: 0.35,
  /** Cara del jugador mientras no exista el sistema de Cara (fase 3). */
  caraProvisional: 60,
} as const;
