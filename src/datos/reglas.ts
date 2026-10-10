import type { ModoReyes } from '../nucleo/carta';

/** Números de las reglas del duelo. Los objetos y compañeros pueden cambiar algunos. */
export interface Reglas {
  /** Piedras para ganar el duelo (4 amarracos). */
  piedrasParaGanar: number;
  /** Rondas de descarte permitidas en cada mano. */
  rondasMus: number;
  /** Envite más pequeño («envido» son 2). */
  enviteMinimo: number;
  /** Subida más pequeña («dos más»). */
  subidaMinima: number;
  /** Lo que cobra quien envida si le dicen «no quiero» sin que hubiera nada aceptado. */
  deje: number;
  /** Lo que vale la Grande o la Chica cuando pasan los dos. */
  piedrasEnPaso: number;
  valorPares: { pareja: number; medias: number; duples: number };
  valorJuego: { treintaYUna: number; otro: number };
  /** Lo que vale ganar el Punto, además de lo envidado. */
  valorPunto: number;
  modoReyes: ModoReyes;
}

export const REGLAS_BASE: Reglas = {
  piedrasParaGanar: 20,
  rondasMus: 2,
  enviteMinimo: 2,
  subidaMinima: 2,
  deje: 1,
  piedrasEnPaso: 1,
  valorPares: { pareja: 1, medias: 2, duples: 3 },
  valorJuego: { treintaYUna: 3, otro: 2 },
  valorPunto: 1,
  modoReyes: 8,
};
