import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { useEscala } from './Escenario';

/** Distancia (en píxeles del escenario) que hay que deslizar hacia arriba para tirarlo. */
const RECORRIDO = 70;

/**
 * ¡ÓRDAGO! no se pulsa: se tira deslizando hacia arriba, para que nunca salga sin querer y
 * se sienta como un gesto. Con teclado, la flecha arriba hace lo mismo.
 */
export function BotonOrdago({
  activo,
  onTirar,
  texto,
  pista,
  ayuda,
}: {
  activo: boolean;
  onTirar: () => void;
  texto: string;
  pista: string;
  ayuda: string;
}) {
  const escala = useEscala();
  const inicio = useRef<number | null>(null);
  const [subida, setSubida] = useState(0);

  const soltar = () => {
    inicio.current = null;
    setSubida(0);
  };
  const alPulsar = (e: PointerEvent<HTMLButtonElement>) => {
    if (!activo) return;
    inicio.current = e.clientY;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Algún navegador no deja capturar el puntero: el deslizamiento funciona igual.
    }
  };
  const alMover = (e: PointerEvent<HTMLButtonElement>) => {
    if (inicio.current === null) return;
    const dy = (e.clientY - inicio.current) / escala;
    setSubida(Math.max(-RECORRIDO * 1.2, Math.min(0, dy)));
  };
  // La distancia se mide con el propio evento: en un deslizamiento rápido el estado
  // todavía no se ha actualizado al soltar.
  const alSoltar = (e: PointerEvent<HTMLButtonElement>) => {
    if (inicio.current === null) return;
    const tirado = (e.clientY - inicio.current) / escala <= -RECORRIDO;
    soltar();
    if (tirado && activo) onTirar();
  };
  const alTeclear = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (activo && e.key === 'ArrowUp') {
      e.preventDefault();
      onTirar();
    }
  };

  const progreso = Math.min(1, -subida / RECORRIDO);
  return (
    <div className="ordago">
      <div className="ordago__carril" aria-hidden="true" style={{ opacity: activo ? 0.25 + progreso * 0.75 : 0 }} />
      <button
        type="button"
        className="boton-ordago"
        disabled={!activo}
        aria-label={ayuda}
        style={{ transform: `translateY(${subida}px)` }}
        onPointerDown={alPulsar}
        onPointerMove={alMover}
        onPointerUp={alSoltar}
        onPointerCancel={soltar}
        onKeyDown={alTeclear}
      >
        {texto}
      </button>
      <div className="ordago__pista">{pista}</div>
    </div>
  );
}
