import { useEffect, useState } from 'react';
import { rutaArte } from '../arte';
import { clases } from './piezas';

/**
 * Retrato del rival, preparado para recibir arte sin tocar código:
 * - public/arte/personajes/indice.json dice qué personajes tienen arte.
 * - Cada uno tiene public/arte/personajes/<id>/manifiesto.json con sus animaciones:
 *   como mínimo `reposo`, `parpadeo` y una `tic_<id>` por tic. Cada animación es una hoja
 *   de sprites horizontal o una secuencia de WebP, con fotogramas por segundo y bucle.
 * Sin arte se dibuja el marcador (ARTE PENDIENTE) y el tic se señala con una sacudida, un
 * destello y una acotación con el gesto.
 */

export type AnimacionPersonaje =
  | { tipo: 'hoja'; archivo: string; fotogramas: number; fps: number; bucle: boolean }
  | { tipo: 'secuencia'; archivos: string[]; fps: number; bucle: boolean };

export interface ManifiestoPersonaje {
  ancho: number;
  alto: number;
  animaciones: Record<string, AnimacionPersonaje>;
}

export interface TicEnRetrato {
  id: string;
  /** Cambia en cada aparición, para reiniciar el efecto aunque se repita el mismo tic. */
  clave: number;
}

export function Retrato({
  id,
  nombre,
  tic,
  acotacion,
  depuracion,
  textoPendiente,
}: {
  id: string;
  nombre: string;
  tic: TicEnRetrato | null;
  /** Gesto que se ve («se rasca la barba»). */
  acotacion: string | null;
  /** Significado del tic, solo en modo de depuración. */
  depuracion: string | null;
  textoPendiente: string;
}) {
  const manifiesto = useManifiesto(id);
  const animacionTic = tic && manifiesto?.animaciones[`tic_${tic.id}`];

  return (
    <div className="retrato" aria-label={nombre} role="img">
      {manifiesto ? (
        <Animacion
          key={animacionTic ? `tic${tic.clave}` : 'reposo'}
          personaje={id}
          animacion={animacionTic || manifiesto.animaciones['reposo']!}
          ancho={manifiesto.ancho}
          alto={manifiesto.alto}
        />
      ) : (
        <div key={tic ? `tic${tic.clave}` : 'quieto'} className={clases('retrato__marcador', tic && 'retrato__marcador--tic')}>
          <span>{textoPendiente}</span>
        </div>
      )}
      {tic && (acotacion || depuracion) && (
        <div key={`a${tic.clave}`} className="retrato__acotacion">
          {!manifiesto && acotacion && <em>{acotacion}</em>}
          {depuracion && <span className="retrato__depuracion">{depuracion}</span>}
        </div>
      )}
    </div>
  );
}

function useManifiesto(id: string): ManifiestoPersonaje | null {
  const [manifiesto, setManifiesto] = useState<ManifiestoPersonaje | null>(null);
  useEffect(() => {
    let vigente = true;
    (async () => {
      try {
        const indice = (await (await fetch(rutaArte('personajes/indice.json'))).json()) as { personajes?: unknown };
        if (!Array.isArray(indice.personajes) || !indice.personajes.includes(id)) return;
        const datos = (await (await fetch(rutaArte(`personajes/${id}/manifiesto.json`))).json()) as ManifiestoPersonaje;
        if (vigente && datos?.animaciones?.['reposo']) setManifiesto(datos);
      } catch {
        // Sin arte: se queda el marcador.
      }
    })();
    return () => {
      vigente = false;
    };
  }, [id]);
  return manifiesto;
}

function Animacion({
  personaje,
  animacion,
  ancho,
  alto,
}: {
  personaje: string;
  animacion: AnimacionPersonaje;
  ancho: number;
  alto: number;
}) {
  const total = animacion.tipo === 'hoja' ? animacion.fotogramas : animacion.archivos.length;
  const [fotograma, setFotograma] = useState(0);

  useEffect(() => {
    const reloj = setInterval(() => {
      setFotograma((f) => (f + 1 < total ? f + 1 : animacion.bucle ? 0 : f));
    }, 1000 / animacion.fps);
    return () => clearInterval(reloj);
  }, [animacion, total]);

  if (animacion.tipo === 'secuencia') {
    return <img className="retrato__arte" src={rutaArte(`personajes/${personaje}/${animacion.archivos[fotograma]}`)} alt="" width={ancho} height={alto} />;
  }
  return (
    <div
      className="retrato__arte"
      style={{
        width: ancho,
        height: alto,
        backgroundImage: `url(${rutaArte(`personajes/${personaje}/${animacion.archivo}`)})`,
        backgroundSize: `${total * 100}% 100%`,
        backgroundPosition: `${total > 1 ? (fotograma / (total - 1)) * 100 : 0}% 0`,
      }}
    />
  );
}
