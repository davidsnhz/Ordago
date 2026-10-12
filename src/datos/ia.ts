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
    /**
     * Cuánto mira lo que arriesga al aceptar: acerca el umbral de 0,5 al punto en que aceptar
     * compensa, F > (X − d) / 2X. Con 0 (la fórmula original del documento) un jugador que
     * envidaba dos en todos los lances ganaba más que uno sensato; con 0,75 ya no
     * (docs/decisiones.md, aprobado por David el 11 de octubre de 2026).
     */
    pesoCuota: 0.75,
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
    /** Con qué frecuencia sale un tic que no significa nada (la vara de Fulgencio). */
    probabilidadSinSentido: 0.15,
    /**
     * Proporción de momentos en que tu Cara está baja, para calibrar la «sospecha» de Doña
     * Engracia (no sale de las cartas, así que se fija aquí).
     */
    tasaSospecha: 0.25,
    /** Mirando al rival, los tics duran más en pantalla. */
    duracionMirando: 1.6,
  },
  /**
   * Cara a 0: «se te nota todo». Durante el duelo el rival ve uno de tus tics: te tiembla el
   * pulso cuando llevas buena mano en el lance. Si lo ve, su fuerza baja; si no, sube.
   */
  exposicion: {
    fuerzaJugador: 0.65,
    fiabilidad: 0.8,
    /** Proporción de lances en los que llevas buena mano (F es casi uniforme). */
    tasaBase: 0.35,
    ajusteSiSeNota: -0.2,
    ajusteSiNo: 0.1,
  },
  /** Trato de Fulgencio: lo propone si espera perder los envites queridos… */
  trato: {
    /** …o, de farol, con esta probabilidad aunque espere ganarlos. */
    farol: 0.3,
  },
  /** Mirar al rival: a partir de estos segundos se considera mirar demasiado. */
  mirarDemasiado: 2,
} as const;
