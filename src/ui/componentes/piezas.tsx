import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import type { Carta } from '../../nucleo/carta';
import { nombreCarta } from '../../textos/es';
import { rutaCarta, rutaReverso } from '../arte';
import './componentes.css';

/** Piezas pequeñas de la guía de estilo. */

const clases = (...nombres: (string | false | null | undefined)[]) => nombres.filter(Boolean).join(' ');

export function Panel({
  children,
  sombra = false,
  className,
  style,
}: {
  children: ReactNode;
  sombra?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={clases('panel', sombra && 'panel--sombra', className)} style={style}>
      {children}
    </div>
  );
}

type VarianteBoton = 'papel' | 'gualda' | 'rendirse';

/** PASO y QUIERO en papel; ENVIDO en gualda; NO QUIERO discontinuo y sin sombra, porque es rendirse. */
export function BotonApuesta({
  variante = 'papel',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: VarianteBoton }) {
  return <button type="button" className={clases('boton-apuesta', `boton-apuesta--${variante}`, className)} {...props} />;
}

/** Fila «Grande · Chica · Pares · Juego»: el actual subrayado en almagre, los jugados tachados. */
export function FilaLances({ lances }: { lances: { etiqueta: string; estado: 'jugado' | 'actual' | 'pendiente' }[] }) {
  return (
    <div className="panel fila-lances">
      {lances.map(({ etiqueta, estado }) => (
        <span key={etiqueta} className={`fila-lances__lance fila-lances__lance--${estado}`} aria-current={estado === 'actual' || undefined}>
          {etiqueta}
        </span>
      ))}
    </div>
  );
}

/** Amarracos (5 piedras) y piedras sueltas, con el número a la derecha. */
export function FilaPiedras({ nombre, piedras }: { nombre: string; piedras: number }) {
  const amarracos = Math.floor(piedras / 5);
  const sueltas = piedras % 5;
  return (
    <div className="piedras" aria-label={`${nombre}: ${piedras}`}>
      <span className="piedras__nombre">{nombre}</span>
      {Array.from({ length: amarracos }, (_, i) => (
        <span key={`a${i}`} className="amarraco" />
      ))}
      {Array.from({ length: sueltas }, (_, i) => (
        <span key={`p${i}`} className="piedra" />
      ))}
      <span className="piedras__numero">{piedras}</span>
    </div>
  );
}

export function MarcadorPiedras({
  titulo,
  insignia,
  filas,
}: {
  titulo: string;
  insignia: { texto: string; destacada: boolean } | null;
  filas: { nombre: string; piedras: number }[];
}) {
  return (
    <div className="panel marcador">
      <div className="marcador__cabecera">
        <span className="rotulo">{titulo}</span>
        {insignia && <span className={clases('insignia', insignia.destacada && 'insignia--anil')}>{insignia.texto}</span>}
      </div>
      {filas.map((fila) => (
        <FilaPiedras key={fila.nombre} {...fila} />
      ))}
    </div>
  );
}

/**
 * La Cara: 20 segmentos en tres zonas; los que pasan del valor se pintan en claro. El rótulo
 * (y la etiqueta que lo acompañe) se va al lado contrario de la marca para que no se pisen.
 */
export function BarraCara({
  valor,
  titulo,
  zonas,
  nota,
  etiqueta,
}: {
  valor: number;
  titulo: string;
  zonas: { pillan: string; creen: string; temen: string };
  nota?: string;
  /** Algo junto al rótulo, como «SE TE NOTA». */
  etiqueta?: ReactNode;
}) {
  const llenos = Math.ceil(Math.max(0, Math.min(100, valor)) / 5);
  const zona = (i: number) => (i < 7 ? 'almagre' : i < 14 ? 'gualda' : 'verde');
  return (
    <div className="panel cara" title={nota}>
      <div className={clases('cara__titulo', valor < 50 && 'cara__titulo--derecha')}>
        <span className="rotulo">{titulo}</span>
        {etiqueta}
      </div>
      <div className="cara__marca" style={{ left: `calc(12px + (100% - 24px) * ${valor / 100} - 18px)` }}>
        <span className="cara__numero">{valor}</span>
        <span className="cara__flecha" />
      </div>
      <div className="cara__barra" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={valor} aria-label={titulo}>
        {Array.from({ length: 20 }, (_, i) => (
          <span key={i} className={clases('cara__segmento', `cara__segmento--${zona(i)}`, i >= llenos && 'cara__segmento--claro')} />
        ))}
      </div>
      <div className="cara__zonas">
        <span className="cara__zona--pillan">{zonas.pillan}</span>
        <span className="cara__zona--creen">{zonas.creen}</span>
        <span className="cara__zona--temen">{zonas.temen}</span>
      </div>
    </div>
  );
}

/** Bocadillo del rival: la acción en Alfa Slab almagre y la frase en cursiva, con cola hacia el retrato. */
export function Bocadillo({ accion, frase, className }: { accion: string; frase?: string; className?: string }) {
  return (
    <div className={clases('bocadillo', className)} role="status" aria-live="polite">
      <div className="bocadillo__accion">{accion}</div>
      {frase && <div className="bocadillo__frase">{frase}</div>}
      <span className="bocadillo__cola" aria-hidden="true" />
    </div>
  );
}

/** Nombre del rival en gualda, girado −4°. */
export function EtiquetaNombre({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clases('etiqueta-nombre', className)}>{children}</div>;
}

export function CartaVista({ carta, className, style }: { carta: Carta; className?: string; style?: CSSProperties }) {
  return <img className={clases('carta', className)} style={style} src={rutaCarta(carta)} alt={nombreCarta(carta)} draggable={false} />;
}

export function CartaReverso({ className, style }: { className?: string; style?: CSSProperties }) {
  return <img className={clases('carta', className)} style={style} src={rutaReverso('almagre')} alt="Carta boca abajo" draggable={false} />;
}

export { clases };
