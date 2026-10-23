import { useEffect, useState } from 'react';
import { idCarta, type Carta } from '../nucleo/carta';

/**
 * Rutas del arte de public/arte. Se construyen con la base de Vite para que la build
 * funcione igual en la raíz de un dominio que en una subcarpeta (GitHub Pages).
 */
const BASE = import.meta.env.BASE_URL;

export const rutaArte = (ruta: string) => `${BASE}arte/${ruta}`;
export const rutaCarta = (carta: Carta) => rutaArte(`cartas/${idCarta(carta)}.webp`);
export const rutaReverso = (color: 'almagre' | 'anil' = 'almagre') => rutaArte(`cartas/reverso_${color}.webp`);

/** Lo que dice public/arte/personajes/indice.json: quién tiene arte y quién, cara para el mapa. */
export interface IndicePersonajes {
  personajes: string[];
  medallones: Record<string, string>;
}

let indicePersonajes: Promise<IndicePersonajes> | null = null;

/** El índice de personajes, cargado una sola vez. Si no se puede leer, nadie tiene arte. */
export function cargarIndicePersonajes(): Promise<IndicePersonajes> {
  indicePersonajes ??= fetch(rutaArte('personajes/indice.json'))
    .then((r) => r.json())
    .then((d: Partial<IndicePersonajes> | null) => ({
      personajes: Array.isArray(d?.personajes) ? d.personajes : [],
      medallones: d?.medallones && typeof d.medallones === 'object' ? d.medallones : {},
    }))
    .catch(() => ({ personajes: [], medallones: {} }));
  return indicePersonajes;
}

/** La cara de un personaje para el mapa, si la tiene. */
export function useMedallon(id: string): string | null {
  const [ruta, setRuta] = useState<string | null>(null);
  useEffect(() => {
    let vigente = true;
    void cargarIndicePersonajes().then(({ medallones }) => {
      if (vigente) setRuta(medallones[id] ? rutaArte(`personajes/${medallones[id]}`) : null);
    });
    return () => {
      vigente = false;
    };
  }, [id]);
  return ruta;
}

/**
 * Carga las fuentes de la guía. Se hace desde aquí para respetar la base de Vite.
 * Los rótulos, los nombres y los botones tienen un solo grueso (Alegreya Sans SC Bold, Spectral SC
 * SemiBold y Bitter Black), que sirve para cualquier peso que pida el CSS.
 */
export function cargarFuentes(): void {
  if (typeof document === 'undefined' || document.getElementById('fuentes-ordago')) return;
  const fuentes: [familia: string, archivo: string, estilo: string, peso: string][] = [
    ['Alegreya', 'Alegreya-Regular.woff2', 'normal', '400'],
    ['Alegreya', 'Alegreya-Italic.woff2', 'italic', '400'],
    ['Alegreya', 'Alegreya-Bold.woff2', 'normal', '700'],
    ['Alegreya Sans SC', 'AlegreyaSansSC-Bold.woff2', 'normal', '400 900'],
    ['Spectral SC', 'SpectralSC-SemiBold.woff2', 'normal', '400 900'],
    ['Bitter', 'Bitter-Black.woff2', 'normal', '400 900'],
  ];
  const estilo = document.createElement('style');
  estilo.id = 'fuentes-ordago';
  estilo.textContent = fuentes
    .map(([familia, archivo, tipo, peso]) => {
      const formato = archivo.endsWith('.woff2') ? 'woff2' : 'truetype';
      return `@font-face{font-family:'${familia}';font-style:${tipo};font-weight:${peso};font-display:swap;src:url('${rutaArte(`fuentes/${archivo}`)}') format('${formato}')}`;
    })
    .join('\n');
  document.head.appendChild(estilo);
}
