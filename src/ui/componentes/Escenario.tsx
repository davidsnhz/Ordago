import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

/** El escenario es vertical, de 390 × 844 (un móvil), y se escala entero para caber en la ventana, con bandas. */
export const ANCHO = 390;
export const ALTO = 844;

const ContextoEscala = createContext(1);

/** Escala actual del escenario: para pasar movimientos del puntero a píxeles del escenario. */
export const useEscala = () => useContext(ContextoEscala);

export function Escenario({ children, avisoGirar }: { children: ReactNode; avisoGirar: string }) {
  const hueco = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(1);

  useEffect(() => {
    const elemento = hueco.current;
    if (!elemento) return;
    const medir = () => {
      const { width, height } = elemento.getBoundingClientRect();
      if (width > 0 && height > 0) setEscala(Math.min(width / ANCHO, height / ALTO));
    };
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(elemento);
    // Por si el navegador no avisa al observador (pestaña en segundo plano, giro del móvil).
    window.addEventListener('resize', medir);
    window.addEventListener('orientationchange', medir);
    return () => {
      observador.disconnect();
      window.removeEventListener('resize', medir);
      window.removeEventListener('orientationchange', medir);
    };
  }, []);

  return (
    <div className="escenario-marco">
      <div className="escenario-hueco" ref={hueco}>
        <ContextoEscala.Provider value={escala}>
          <div className="escenario" style={{ width: ANCHO, height: ALTO, transform: `translate(-50%, -50%) scale(${escala})` }}>
            {children}
          </div>
        </ContextoEscala.Provider>
      </div>
      <div className="aviso-girar" role="alert">
        <span className="aviso-girar__icono" aria-hidden="true">⟳</span>
        {avisoGirar}
      </div>
    </div>
  );
}
