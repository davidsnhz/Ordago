import type { Gira } from '../../../estado/gira';
import { ES } from '../../../textos/es';
import { rutaArte } from '../../arte';
import { clases } from '../../componentes/piezas';

const G = ES.gira;

/** La Honra en bolitas: llenas las que quedan (la monja puede dar una cuarta). */
export function Honra({ valor, maximo = 3 }: { valor: number; maximo?: number }) {
  const total = Math.max(maximo, valor);
  return (
    <span className="honra" role="img" aria-label={`${G.hud.honra} ${valor}`}>
      {Array.from({ length: total }, (_, i) => (
        <i key={i} className={clases(i >= valor && 'honra__vacia')} />
      ))}
    </span>
  );
}

export function Moneda() {
  return <img className="moneda" src={rutaArte('palos/oros.webp')} alt="" draggable={false} />;
}

/** Nombre corto para el marcador de un personaje sin dibujo: «Lazarillo», «Recaudadora». */
export const nombreCorto = (nombre: string) => nombre.split(' ').at(-1) ?? nombre;

/** La barra de arriba de la gira: Honra, reales, Cara y el compañero. */
export function Hud({ gira }: { gira: Gira }) {
  const companero = gira.companero ? ES.companeros[gira.companero] : null;
  return (
    <div className="hud">
      <div className="hud__caja">
        <div className="hud__titulo">{G.hud.honra}</div>
        <Honra valor={gira.honra} />
      </div>
      <div className="hud__caja">
        <div className="hud__titulo">{G.hud.reales}</div>
        <div className="hud__valor">
          <Moneda /> {gira.reales}
        </div>
      </div>
      <div className="hud__caja">
        <div className="hud__titulo">{G.hud.cara}</div>
        <div className="hud__valor">{gira.cara}</div>
      </div>
      {companero && (
        <div className="hud__caja hud__compa">
          <span className="marcador marcador--redondo">{nombreCorto(companero.nombre)}</span>
          <b>{companero.nombre}</b>
        </div>
      )}
    </div>
  );
}
