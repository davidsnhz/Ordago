import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import type { Carta } from '../../nucleo/carta';
import { nombreCarta } from '../../textos/es';
import { rutaCarta, rutaReverso } from '../arte';
import './componentes.css';

/** Piezas pequeñas de la guía de estilo. */

const clases = (...nombres: (string | false | null | undefined)[]) => nombres.filter(Boolean).join(' ');

type VarianteBoton = 'papel' | 'gualda' | 'rendirse';

/** PASO y QUIERO en papel; ENVIDO en gualda; NO QUIERO discontinuo y sin sombra, porque es rendirse. */
export function BotonApuesta({
  variante = 'papel',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: VarianteBoton }) {
  return <button type="button" className={clases('boton-apuesta', `boton-apuesta--${variante}`, className)} {...props} />;
}

export type EstadoPaso = 'hecho' | 'actual' | 'falta';

/** Los lances de la mano como pasos: los jugados con ✓, el que se juega en almagre, los que faltan a puntos. */
export function PasosLances({ pasos }: { pasos: { etiqueta: string; estado: EstadoPaso }[] }) {
  return (
    <ol className="pasos">
      {pasos.map(({ etiqueta, estado }, i) => (
        <li key={etiqueta} className="pasos__item">
          {i > 0 && <span className="pasos__raya" aria-hidden="true" />}
          <span className={`pasos__paso pasos__paso--${estado}`} aria-current={estado === 'actual' ? 'step' : undefined}>
            {estado === 'hecho' && '✓ '}
            {etiqueta}
          </span>
        </li>
      ))}
    </ol>
  );
}

export type ZonaCara = 'nota' | 'pillan' | 'creen' | 'temen';

/**
 * La Cara en una barra fina de tres zonas (te pillan, te creen, te temen) con su marca; lo que
 * pasa de la marca, apagado. `children` va encima, a la altura de la marca (la cifra que sube).
 */
export function BarraCara({ valor, etiqueta, children }: { valor: number; etiqueta: string; children?: ReactNode }) {
  const v = Math.max(0, Math.min(100, valor));
  return (
    <div className="barra-cara" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={valor} aria-label={etiqueta}>
      <span className="barra-cara__zonas" aria-hidden="true">
        <span className="barra-cara__zona barra-cara__zona--pillan" />
        <span className="barra-cara__zona barra-cara__zona--creen" />
        <span className="barra-cara__zona barra-cara__zona--temen" />
        <span className="barra-cara__apagado" style={{ left: `${v}%` }} />
      </span>
      <span className="barra-cara__marca" style={{ left: `${v}%` }} aria-hidden="true" />
      {children}
    </div>
  );
}

/** Tu cara, dibujada en tinta: sudando si te pillan, seria si te creen, con media sonrisa si te temen. */
export function Careto({ zona, tamano = 30 }: { zona: ZonaCara; tamano?: number }) {
  const boca = {
    nota: 'M11 25 q3 -4 6 0 q3 4 6 0',
    pillan: 'M11 25 q3 -3 6 0 q3 3 6 0',
    creen: 'M11 24 h12',
    temen: 'M11 23 q7 5 13 -2',
  }[zona];
  return (
    <svg className="careto" viewBox="0 0 34 34" width={tamano} height={tamano} aria-hidden="true">
      <circle cx="17" cy="17" r="15" fill="var(--gualda-claro)" stroke="var(--tinta)" strokeWidth="2.5" />
      <circle cx="12" cy="15" r="2" fill="var(--tinta)" />
      <circle cx="22" cy="15" r="2" fill="var(--tinta)" />
      {zona === 'temen' && <path d="M20 11 l6 -2" stroke="var(--tinta)" strokeWidth="2.2" strokeLinecap="round" />}
      <path d={boca} fill="none" stroke="var(--tinta)" strokeWidth="2.4" strokeLinecap="round" />
      {(zona === 'pillan' || zona === 'nota') && (
        <path d="M28 9 q3 5 0 7 q-3 -2 0 -7z" fill="var(--anil)" stroke="var(--tinta)" strokeWidth="1.2" />
      )}
      {zona === 'nota' && <path d="M6 9 q-3 5 0 7 q3 -2 0 -7z" fill="var(--anil)" stroke="var(--tinta)" strokeWidth="1.2" />}
    </svg>
  );
}

export function CartaVista({ carta, className, style }: { carta: Carta; className?: string; style?: CSSProperties }) {
  return <img className={clases('carta', className)} style={style} src={rutaCarta(carta)} alt={nombreCarta(carta)} draggable={false} />;
}

export function CartaReverso({ className, style }: { className?: string; style?: CSSProperties }) {
  return <img className={clases('carta', className)} style={style} src={rutaReverso('almagre')} alt="Carta boca abajo" draggable={false} />;
}

export { clases };
