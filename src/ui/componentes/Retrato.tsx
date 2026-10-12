import { useEffect, useRef, useState } from 'react';
import { Azar } from '../../nucleo/azar';
import { rutaArte } from '../arte';
import { clases } from './piezas';

/**
 * Retrato del rival, preparado para recibir arte sin tocar código:
 * - public/arte/personajes/indice.json dice qué personajes tienen arte.
 * - Cada uno tiene public/arte/personajes/<id>/manifiesto.json con sus animaciones: `reposo`
 *   (obligatoria), `parpadeo` (si la hay) y una `tic_<id>` por tic. Cada animación es una hoja
 *   de sprites horizontal o una secuencia de WebP, y puede llevar además un efecto dibujado encima
 *   (el brillo del diente de oro); un tic también puede ser solo un efecto sobre el reposo (el humo
 *   del puro). `npm run personajes` los genera desde las hojas de assets/personajes.
 * - El reposo respira, el parpadeo sale cada pocos segundos y el tic entra y sale con un fundido.
 * Sin arte se dibuja el marcador (ARTE PENDIENTE). Un tic sin dibujo, con arte o sin él, se
 * señala con una sacudida y una acotación con el gesto.
 */

/** Efecto de la mesa encima del personaje, en fracciones del fotograma (de 0 a 1). */
export interface EfectoPersonaje {
  efecto: 'humo' | 'destello';
  x: number;
  y: number;
}

export type AnimacionPersonaje =
  | { tipo: 'hoja'; archivo: string; fotogramas: number; fps: number; bucle: boolean; efecto?: EfectoPersonaje }
  | { tipo: 'secuencia'; archivos: string[]; fps: number; bucle: boolean; efecto?: EfectoPersonaje }
  | ({ tipo: 'efecto' } & EfectoPersonaje);

type AnimacionDibujada = Exclude<AnimacionPersonaje, { tipo: 'efecto' }>;

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

/** Fundido entre el reposo y el tic, en milisegundos (igual que en componentes.css). */
const FUNDIDO = 180;
/** Cada cuánto parpadea, en milisegundos. */
const PARPADEO = { minimo: 2600, maximo: 6200 };

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
  const animacionTic = tic ? manifiesto?.animaciones[`tic_${tic.id}`] : undefined;
  const conDibujo = Boolean(animacionTic);

  return (
    <div className="retrato" aria-label={nombre} role="img">
      {manifiesto === undefined ? null : manifiesto ? (
        <Figura personaje={id} manifiesto={manifiesto} tic={tic} />
      ) : (
        <div key={tic ? `tic${tic.clave}` : 'quieto'} className={clases('retrato__marcador', tic && 'retrato__marcador--tic')}>
          <span>{textoPendiente}</span>
        </div>
      )}
      {tic && ((!conDibujo && acotacion) || depuracion) && (
        <div key={`a${tic.clave}`} className="retrato__acotacion">
          {!conDibujo && acotacion && <em>{acotacion}</em>}
          {depuracion && <span className="retrato__depuracion">{depuracion}</span>}
        </div>
      )}
    </div>
  );
}

/** El personaje con arte: reposo que respira, parpadeo y tics con fundido. */
function Figura({ personaje, manifiesto, tic }: { personaje: string; manifiesto: ManifiestoPersonaje; tic: TicEnRetrato | null }) {
  const { animaciones } = manifiesto;
  const mostrado = useConSalida(tic, FUNDIDO);
  const animacionTic = mostrado.valor ? animaciones[`tic_${mostrado.valor.id}`] : undefined;
  const ticDibujado = animacionTic && animacionTic.tipo !== 'efecto' ? animacionTic : null;
  const efecto = animacionTic?.tipo === 'efecto' ? animacionTic : (ticDibujado?.efecto ?? null);
  const tapaReposo = ticDibujado !== null && !mostrado.saliendo;
  const parpadeo = animaciones['parpadeo'];
  const parpadeando = useParpadeo(personaje, parpadeo && parpadeo.tipo !== 'efecto' ? duracion(parpadeo) : 0, tic !== null);

  // Tic sin dibujo: la figura se sacude (sin volver a montar las imágenes).
  const capa = useRef<HTMLDivElement>(null);
  const sinDibujo = tic !== null && !animaciones[`tic_${tic.id}`];
  useEffect(() => {
    if (!sinDibujo || !capa.current?.animate) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    capa.current.animate(SACUDIDA, { duration: 700, easing: 'ease-in-out' });
  }, [sinDibujo, tic?.clave]);

  const reposo = animaciones['reposo'] as AnimacionDibujada;
  return (
    <div className="retrato__figura">
      <div ref={capa} className="retrato__capa">
        <div className={clases('retrato__capa', tapaReposo && 'retrato__capa--oculta')}>
          <Animacion personaje={personaje} animacion={reposo} />
          {parpadeando && parpadeo && parpadeo.tipo !== 'efecto' && (
            <div className="retrato__capa">
              <Animacion personaje={personaje} animacion={parpadeo} />
            </div>
          )}
        </div>
        {ticDibujado && mostrado.valor && (
          <div key={`t${mostrado.valor.clave}`} className={clases('retrato__capa', 'retrato__capa--tic', mostrado.saliendo && 'retrato__capa--saliendo')}>
            <Animacion personaje={personaje} animacion={ticDibujado} />
          </div>
        )}
        {efecto && mostrado.valor && <Efecto key={`e${mostrado.valor.clave}`} {...efecto} saliendo={mostrado.saliendo} />}
      </div>
    </div>
  );
}

const SACUDIDA: Keyframe[] = [
  { transform: 'translate(0, 0) rotate(0)' },
  { transform: 'translate(-6px, 2px) rotate(-1deg)', offset: 0.15 },
  { transform: 'translate(5px, -2px) rotate(1deg)', offset: 0.3 },
  { transform: 'translate(-4px, 1px) rotate(-0.5deg)', offset: 0.45 },
  { transform: 'translate(3px, -1px)', offset: 0.6 },
  { transform: 'translate(-1px, 0)', offset: 0.8 },
  { transform: 'translate(0, 0) rotate(0)' },
];

/** Efectos dibujados encima: bocanadas de humo que suben o el brillo de una estrella de cuatro puntas. */
function Efecto({ efecto, x, y, saliendo }: EfectoPersonaje & { saliendo: boolean }) {
  const posicion = { left: `${x * 100}%`, top: `${y * 100}%` };
  if (efecto === 'destello')
    return (
      <div className={clases('retrato__destello', saliendo && 'retrato__efecto--saliendo')} style={posicion}>
        <svg viewBox="-10 -10 20 20" aria-hidden="true">
          <path d="M0 -9.5 L2.2 -2.2 L9.5 0 L2.2 2.2 L0 9.5 L-2.2 2.2 L-9.5 0 L-2.2 -2.2 Z" />
        </svg>
      </div>
    );
  return (
    <div className={clases('retrato__humo', saliendo && 'retrato__efecto--saliendo')} style={posicion}>
      <span />
      <span />
      <span />
    </div>
  );
}

/** Mantiene el último valor un momento después de que se vaya, para el fundido de salida. */
function useConSalida<T>(valor: T | null, ms: number): { valor: T | null; saliendo: boolean } {
  const [ultimo, setUltimo] = useState<T | null>(valor);
  useEffect(() => {
    if (valor) {
      setUltimo(valor);
      return;
    }
    const reloj = setTimeout(() => setUltimo(null), ms);
    return () => clearTimeout(reloj);
  }, [valor, ms]);
  return { valor: valor ?? ultimo, saliendo: !valor && ultimo !== null };
}

/**
 * Parpadeo cada pocos segundos, nunca durante un tic. Los intervalos salen de un generador con
 * semilla propio (es solo decoración: no toca el azar de la partida).
 */
function useParpadeo(personaje: string, ms: number, pausado: boolean): boolean {
  const [parpadeando, setParpadeando] = useState(false);
  const azar = useRef<Azar | null>(null);
  useEffect(() => {
    if (!ms || pausado) return;
    azar.current ??= Azar.conSemilla(`parpadeo/${personaje}`);
    let reloj: ReturnType<typeof setTimeout>;
    const programar = () => {
      const espera = PARPADEO.minimo + azar.current!.siguiente() * (PARPADEO.maximo - PARPADEO.minimo);
      reloj = setTimeout(() => {
        setParpadeando(true);
        reloj = setTimeout(() => {
          setParpadeando(false);
          programar();
        }, ms);
      }, espera);
    };
    programar();
    return () => {
      clearTimeout(reloj);
      setParpadeando(false);
    };
  }, [personaje, ms, pausado]);
  return parpadeando;
}

const archivos = (a: AnimacionDibujada) => (a.tipo === 'hoja' ? [a.archivo] : a.archivos);
const fotogramas = (a: AnimacionDibujada) => (a.tipo === 'hoja' ? a.fotogramas : a.archivos.length);
const duracion = (a: AnimacionDibujada) => (fotogramas(a) / a.fps) * 1000;

/**
 * Carga el manifiesto y deja decodificadas todas sus imágenes antes de enseñarlo. Mientras
 * carga devuelve `undefined` (no se pinta nada, para que no asome el marcador); sin arte, `null`.
 */
function useManifiesto(id: string): ManifiestoPersonaje | null | undefined {
  const [manifiesto, setManifiesto] = useState<ManifiestoPersonaje | null | undefined>(undefined);
  useEffect(() => {
    let vigente = true;
    setManifiesto(undefined);
    const sinArte = () => vigente && setManifiesto(null);
    (async () => {
      try {
        const indice = (await (await fetch(rutaArte('personajes/indice.json'))).json()) as { personajes?: unknown };
        if (!Array.isArray(indice.personajes) || !indice.personajes.includes(id)) return sinArte();
        const datos = (await (await fetch(rutaArte(`personajes/${id}/manifiesto.json`))).json()) as ManifiestoPersonaje;
        const reposo = datos?.animaciones?.['reposo'];
        if (!reposo || reposo.tipo === 'efecto') return sinArte();
        const todos = Object.values(datos.animaciones).flatMap((a) => (a.tipo === 'efecto' ? [] : archivos(a)));
        await Promise.all(
          todos.map(async (archivo) => {
            const img = new Image();
            img.src = rutaArte(`personajes/${id}/${archivo}`);
            try {
              await img.decode();
            } catch {
              // Si una imagen falla, el resto se enseña igual.
            }
          }),
        );
        if (vigente) setManifiesto(datos);
      } catch {
        sinArte();
      }
    })();
    return () => {
      vigente = false;
    };
  }, [id]);
  return manifiesto;
}

function Animacion({ personaje, animacion }: { personaje: string; animacion: AnimacionDibujada }) {
  const total = fotogramas(animacion);
  const [fotograma, setFotograma] = useState(0);

  useEffect(() => {
    if (total <= 1) return;
    const reloj = setInterval(() => {
      setFotograma((f) => (f + 1 < total ? f + 1 : animacion.bucle ? 0 : f));
    }, 1000 / animacion.fps);
    return () => clearInterval(reloj);
  }, [animacion, total]);

  if (animacion.tipo === 'secuencia') {
    return <img className="retrato__arte" src={rutaArte(`personajes/${personaje}/${animacion.archivos[fotograma]}`)} alt="" draggable={false} />;
  }
  return (
    <div
      className="retrato__arte"
      style={{
        backgroundImage: `url(${rutaArte(`personajes/${personaje}/${animacion.archivo}`)})`,
        backgroundSize: `${total * 100}% 100%`,
        backgroundPosition: `${total > 1 ? (fotograma / (total - 1)) * 100 : 0}% 0`,
      }}
    />
  );
}
