import { idCarta, type Carta } from '../nucleo/carta';

/**
 * Rutas del arte de public/arte. Se construyen con la base de Vite para que la build
 * funcione igual en la raíz de un dominio que en una subcarpeta (GitHub Pages).
 */
const BASE = import.meta.env.BASE_URL;

export const rutaArte = (ruta: string) => `${BASE}arte/${ruta}`;
export const rutaCarta = (carta: Carta) => rutaArte(`cartas/${idCarta(carta)}.webp`);
export const rutaReverso = (color: 'almagre' | 'anil' = 'almagre') => rutaArte(`cartas/reverso_${color}.webp`);

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
