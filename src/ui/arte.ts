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

/** Carga las cuatro fuentes de la guía. Se hace desde aquí para respetar la base de Vite. */
export function cargarFuentes(): void {
  if (typeof document === 'undefined' || document.getElementById('fuentes-ordago')) return;
  const fuentes: [familia: string, archivo: string, estilo: string][] = [
    ['Alfa Slab One', 'AlfaSlabOne-Regular.ttf', 'normal'],
    ['IM Fell English', 'IMFellEnglish-Regular.ttf', 'normal'],
    ['IM Fell English', 'IMFellEnglish-Italic.ttf', 'italic'],
    ['IM Fell English SC', 'IMFellEnglishSC-Regular.ttf', 'normal'],
  ];
  const estilo = document.createElement('style');
  estilo.id = 'fuentes-ordago';
  estilo.textContent = fuentes
    .map(
      ([familia, archivo, tipo]) =>
        `@font-face{font-family:'${familia}';font-style:${tipo};font-display:swap;src:url('${rutaArte(`fuentes/${archivo}`)}') format('truetype')}`,
    )
    .join('\n');
  document.head.appendChild(estilo);
}
