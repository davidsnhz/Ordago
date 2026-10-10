import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

/** Lo que hay que mantenerlo pulsado para tirarlo. */
const DURACION = 1000;

/**
 * ¡ÓRDAGO! no se pulsa: se mantiene pulsado un segundo mientras se llena, para que nunca
 * salga sin querer y se sienta como un gesto. Si se suelta antes, no pasa nada.
 * Con teclado, mantener Intro o Espacio hace lo mismo.
 */
export function BotonOrdago({ activo, onTirar, texto, ayuda }: { activo: boolean; onTirar: () => void; texto: string; ayuda: string }) {
  const [inicio, setInicio] = useState<number | null>(null);
  const [progreso, setProgreso] = useState(0);
  const tirado = useRef(false);

  useEffect(() => {
    if (inicio === null) return;
    let cuadro = 0;
    const avanzar = () => {
      const p = Math.min(1, (performance.now() - inicio) / DURACION);
      setProgreso(p);
      if (p >= 1 && !tirado.current) {
        tirado.current = true;
        setInicio(null);
        setProgreso(0);
        onTirar();
        return;
      }
      cuadro = requestAnimationFrame(avanzar);
    };
    cuadro = requestAnimationFrame(avanzar);
    // Por si el navegador no dibuja (pestaña en segundo plano), el reloj también lo tira.
    const reloj = setTimeout(avanzar, DURACION + 20);
    return () => {
      cancelAnimationFrame(cuadro);
      clearTimeout(reloj);
    };
  }, [inicio, onTirar]);

  const empezar = () => {
    if (!activo || inicio !== null) return;
    tirado.current = false;
    setInicio(performance.now());
  };
  const soltar = () => {
    setInicio(null);
    setProgreso(0);
  };
  const teclaAbajo = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!e.repeat) empezar();
    }
  };
  const teclaArriba = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') soltar();
  };

  return (
    <button
      type="button"
      className="boton-ordago"
      disabled={!activo}
      aria-label={ayuda}
      onPointerDown={empezar}
      onPointerUp={soltar}
      onPointerLeave={soltar}
      onPointerCancel={soltar}
      onKeyDown={teclaAbajo}
      onKeyUp={teclaArriba}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span className="boton-ordago__relleno" style={{ transform: `scaleX(${progreso})` }} />
      <span className="boton-ordago__texto">{texto}</span>
    </button>
  );
}
