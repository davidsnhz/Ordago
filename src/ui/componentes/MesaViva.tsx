import { AnimatePresence, motion } from 'motion/react';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import type { DichoSello, EfectoMesa, FuerzaSello } from '../../estado/efectos';
import type { EstadoMesa } from '../../estado/mesa';
import { idCarta, mismaCarta, type Carta } from '../../nucleo/carta';
import type { Lado, PorLado } from '../../nucleo/comun';
import type { EstadoDuelo } from '../../nucleo/duelo';
import type { Lance } from '../../nucleo/lances';
import { ES, nombreCarta } from '../../textos/es';
import { rutaCarta, rutaReverso } from '../arte';
import { sonar, type Sonido } from '../sonido';
import { useEscala } from './Escenario';
import { clases } from './piezas';
import './mesaViva.css';

/*
 * La mesa viva (prototipo, 22 de octubre de 2026): lo que la hace sentirse como un juego y no
 * como un documento. Las cartas salen del mazo, flotan y se inclinan hacia el dedo; lo que se
 * dice cae como un sello; las piedras vuelan al marcador; el órdago hace temblar la mesa.
 * Medidas en píxeles del escenario de 390 × 844.
 */

const M = ES.mesa;

export interface Punto {
  x: number;
  y: number;
}
export interface Hueco {
  left: number;
  top: number;
  giro: number;
}

/**
 * Dónde están el mazo (a la izquierda del tapete) y los descartes (a la derecha), por su centro,
 * y dónde empiezan tu mano y las cartas del rival (como `.mesa__mano` y `.mesa__cartas-rival`).
 */
export interface Disposicion {
  mazo: Punto;
  descartes: Punto;
  origen: PorLado<Punto>;
}
/** La mesa viva: el tapete en el tercio de abajo, con el acta encima. */
export const DISPOSICION_VIVA: Disposicion = {
  mazo: { x: 76, y: 587 },
  descartes: { x: 314, y: 587 },
  origen: { jugador: { x: 50, y: 622 }, rival: { x: 135, y: 552 } },
};
/** La mesa nueva: sin acta, el tapete sube hasta el rival (`.mesa--nueva` en mesaNueva.css). */
export const DISPOSICION_NUEVA: Disposicion = {
  mazo: { x: 80, y: 444 },
  descartes: { x: 310, y: 444 },
  origen: { jugador: { x: 50, y: 616 }, rival: { x: 135, y: 414 } },
};
const CARTA_MONTON = { ancho: 28, alto: 50 };
const TAMANO: PorLado<{ ancho: number; alto: number }> = { jugador: { ancho: 80, alto: 145 }, rival: { ancho: 30, alto: 54 } };
/** De dónde salen las piedras que se cobran, si no salen de la casilla de su lance: el centro del tapete. */
export const BOTE: Punto = { x: 195, y: 590 };
export const desdeElBote = (): Punto => BOTE;
/** El recuento de la mesa viva va en su panel: el primer cobro a los 0,5 s y cada uno 0,28 s después (como `.final__cobros`). */
export const RITMO_VIVA: RitmoRecuento = { inicio: 0.5, cada: 0.28 };

/** Ritmo, en segundos: el reparto alterna rival y tú; al descartar, las nuevas llegan después de irse las viejas. */
const REPARTO = { inicio: 0.1, cada: 0.12 };
const ROBO = { inicio: 0.4, cada: 0.14 };
/** Cuánto dura cada sello según su fuerza, en milisegundos. */
const DURA_SELLO: Record<FuerzaSello, number> = { 0: 900, 1: 1150, 2: 1400 };
const DURA_ORDAGO = 1500;
const DURA_CONFETI = 3400;
const LADOS: Lado[] = ['rival', 'jugador'];
/** Como mucho, tantas piedras volando por lado: si se cobran más, alguna vale doble. */
const MAX_PIEDRAS = 10;

/** Cuándo llega la carta `orden` de las que entran (por reparto o por descarte). */
function retrasoEntrada(lado: Lado, orden: number, reparto: boolean): number {
  return reparto ? REPARTO.inicio + (2 * orden + (lado === 'jugador' ? 1 : 0)) * REPARTO.cada : ROBO.inicio + orden * ROBO.cada;
}

const quieto = () => typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
const azar = (desde: number, hasta: number) => desde + Math.random() * (hasta - desde);
const enCoordenadas = (p: Punto, origen: Punto): Punto => ({ x: p.x - origen.x, y: p.y - origen.y });

/* ——— Las cartas ——— */

/**
 * Las cartas que acaban de entrar y en qué orden, comparando con lo que había antes. Si entran
 * todas, es un reparto.
 */
function useOrdenDeEntrada(claves: string[]): { orden: Map<string, number>; reparto: boolean } {
  const previas = useRef<Set<string>>(new Set());
  const nuevas = claves.filter((clave) => !previas.current.has(clave));
  useEffect(() => {
    previas.current = new Set(claves);
  });
  return { orden: new Map(nuevas.map((clave, i) => [clave, i])), reparto: nuevas.length === claves.length };
}

/**
 * Una carta que sale del mazo, se coloca en su hueco del abanico con un muelle, se da la vuelta
 * si es tuya, flota un poco mientras espera y se inclina hacia el puntero (o el dedo). Al irse,
 * vuela a los descartes.
 */
function CartaViva({
  lado,
  frente,
  nombre,
  bocaArriba,
  hueco,
  alza = 0,
  retraso,
  indice,
  boton,
  disposicion,
}: {
  lado: Lado;
  /** La cara de la carta; `null` si no se puede ver (las del rival). */
  frente: string | null;
  nombre: string;
  bocaArriba: boolean;
  hueco: Hueco;
  /** Cuánto sube (elegida para tirarla). */
  alza?: number;
  /** Segundos hasta que sale del mazo (solo al entrar). */
  retraso: number;
  indice: number;
  boton?: { elegida: boolean; onClick: () => void } | null;
  disposicion: Disposicion;
}) {
  const { ancho, alto } = TAMANO[lado];
  const [espera] = useState(retraso);
  const [entrando, setEntrando] = useState(true);
  const mazo = enCoordenadas(disposicion.mazo, disposicion.origen[lado]);
  const descartes = enCoordenadas(disposicion.descartes, disposicion.origen[lado]);
  const pequena = CARTA_MONTON.ancho / ancho;
  const demora = entrando ? espera : 0;

  return (
    <motion.div
      className={clases('carta-viva', `carta-viva--${lado}`, boton?.elegida && 'carta-viva--elegida')}
      style={{ zIndex: indice, width: ancho, height: alto }}
      initial={{ x: mazo.x - ancho / 2, y: mazo.y - alto / 2, rotate: -14, scale: pequena }}
      animate={{ x: hueco.left, y: hueco.top - alza, rotate: hueco.giro, scale: 1 }}
      exit={{
        x: descartes.x - ancho / 2,
        y: descartes.y - alto / 2,
        rotate: hueco.giro + 100,
        scale: pequena,
        opacity: 0,
        transition: { duration: 0.42, ease: 'easeIn', opacity: { delay: 0.34, duration: 0.08 } },
      }}
      transition={{ type: 'spring', stiffness: 240, damping: 22, delay: demora }}
      onAnimationComplete={() => setEntrando(false)}
    >
      <div className="carta-viva__flota" style={{ '--i': indice } as CSSProperties}>
        <Inclina activa={lado === 'jugador'} boton={boton} nombre={nombre}>
          {/* Solo se da la vuelta al llegar: si la carta pasa a ser un botón (descarte), no repite. */}
          <motion.div
            className="carta-viva__caras"
            initial={entrando ? { rotateY: 180 } : false}
            animate={{ rotateY: bocaArriba ? 0 : 180 }}
            transition={{ type: 'spring', stiffness: 170, damping: 17, delay: entrando ? espera + 0.2 : 0 }}
          >
            {frente && <img className="carta carta-viva__cara carta-viva__frente" src={frente} alt={nombre} draggable={false} />}
            <img
              className="carta carta-viva__cara carta-viva__dorso"
              src={rutaReverso('almagre')}
              alt={frente ? '' : nombre}
              draggable={false}
            />
            {frente && (
              <span
                className="carta-viva__brillo"
                style={{ WebkitMaskImage: `url(${frente})`, maskImage: `url(${frente})` }}
                aria-hidden="true"
              />
            )}
          </motion.div>
        </Inclina>
      </div>
    </motion.div>
  );
}

/** La parte que se inclina hacia el puntero; si se puede tirar la carta, es un botón. */
function Inclina({
  activa,
  boton,
  nombre,
  children,
}: {
  activa: boolean;
  boton?: { elegida: boolean; onClick: () => void } | null;
  nombre: string;
  children: ReactNode;
}) {
  const mover = (e: PointerEvent<HTMLElement>) => {
    if (!activa) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--ry', `${(px * 24).toFixed(1)}deg`);
    el.style.setProperty('--rx', `${(-py * 18).toFixed(1)}deg`);
    // La franja de brillo sigue al puntero (con el fondo al 300 %, así cae justo debajo).
    el.style.setProperty('--bx', `${Math.round(((1 - px) / 2) * 100)}%`);
    el.classList.add('carta-viva__inclina--activa');
  };
  const soltar = (e: PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--rx', '0deg');
    el.classList.remove('carta-viva__inclina--activa');
  };
  const eventos = {
    onPointerMove: mover,
    onPointerDown: mover,
    onPointerLeave: soltar,
    onPointerCancel: soltar,
    // Con el ratón sigue inclinada mientras esté encima; con el dedo, al levantarlo vuelve.
    onPointerUp: (e: PointerEvent<HTMLElement>) => e.pointerType !== 'mouse' && soltar(e),
  };
  return boton ? (
    <button type="button" className="carta-viva__inclina carta-viva__boton" aria-pressed={boton.elegida} aria-label={nombre} onClick={boton.onClick} {...eventos}>
      {children}
    </button>
  ) : (
    <div className="carta-viva__inclina" {...eventos}>
      {children}
    </div>
  );
}

/** Tu mano, viva: el abanico de siempre, con las cartas que llegan, flotan y se van. */
export function ManoViva({
  cartas,
  numeroMano,
  abanico,
  seleccionables,
  seleccion,
  onAlternar,
  disposicion,
}: {
  cartas: Carta[];
  numeroMano: number;
  abanico: Hueco[];
  seleccionables: boolean;
  seleccion: string[];
  onAlternar: (carta: Carta) => void;
  disposicion: Disposicion;
}) {
  const claves = cartas.map((carta) => `${numeroMano}-${idCarta(carta)}`);
  const { orden, reparto } = useOrdenDeEntrada(claves);
  return (
    <div className={clases('mesa__mano', seleccionables && 'mesa__mano--descarte')}>
      <AnimatePresence>
        {cartas.map((carta, i) => {
          const clave = claves[i]!;
          const elegida = seleccion.includes(idCarta(carta));
          return (
            <CartaViva
              key={clave}
              lado="jugador"
              frente={rutaCarta(carta)}
              nombre={nombreCarta(carta)}
              bocaArriba
              hueco={abanico[i]!}
              alza={elegida ? 20 : 0}
              retraso={retrasoEntrada('jugador', orden.get(clave) ?? 0, reparto)}
              indice={i}
              disposicion={disposicion}
              boton={
                seleccionables
                  ? {
                      elegida,
                      onClick: () => {
                        sonar('toque', { tono: elegida ? 0.85 : 1 });
                        onAlternar(carta);
                      },
                    }
                  : null
              }
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/** Las cartas del rival, boca abajo (o boca arriba con el Chato o la seña del Lazarillo: se dan la vuelta). */
export function CartasRivalVivas({
  cartas,
  aLaVista,
  numeroMano,
  abanico,
  etiqueta,
  disposicion,
}: {
  cartas: Carta[];
  aLaVista: Carta[];
  numeroMano: number;
  abanico: Hueco[];
  etiqueta: string;
  disposicion: Disposicion;
}) {
  const claves = cartas.map((carta) => `${numeroMano}-${idCarta(carta)}`);
  const { orden, reparto } = useOrdenDeEntrada(claves);
  return (
    <div className="mesa__cartas-rival" aria-label={etiqueta}>
      <AnimatePresence>
        {cartas.map((carta, i) => {
          const clave = claves[i]!;
          const vista = aLaVista.some((c) => mismaCarta(c, carta));
          return (
            <CartaViva
              key={clave}
              lado="rival"
              frente={vista ? rutaCarta(carta) : null}
              nombre={vista ? nombreCarta(carta) : 'Carta boca abajo'}
              bocaArriba={vista}
              hueco={abanico[i]!}
              retraso={retrasoEntrada('rival', orden.get(clave) ?? 0, reparto)}
              indice={i}
              disposicion={disposicion}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/** El mazo y los descartes, dos montones de reversos sobre el tapete. */
export function Montones({ disposicion }: { disposicion: Disposicion }) {
  const monton = (centro: Punto) => ({ left: centro.x - CARTA_MONTON.ancho / 2, top: centro.y - CARTA_MONTON.alto / 2 });
  return (
    <>
      <div className="monton" style={monton(disposicion.mazo)} aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <img key={i} className="carta monton__carta" src={rutaReverso('almagre')} alt="" draggable={false} style={{ transform: `translate(${i * 1.5}px, ${-i * 1.5}px)` }} />
        ))}
      </div>
      <div className="monton" style={monton(disposicion.descartes)} aria-hidden="true">
        {[16, -9, 32].map((giro) => (
          <img key={giro} className="carta monton__carta" src={rutaReverso('almagre')} alt="" draggable={false} style={{ transform: `rotate(${giro}deg)` }} />
        ))}
      </div>
    </>
  );
}

/* ——— Las piedras que vuelan al marcador ——— */

export interface Vuelo {
  id: number;
  lado: Lado;
  /** Cuántas piedras suma al llegar. */
  vale: number;
  retraso: number;
  desde: Punto;
}

/** Cuándo se resuelve cada cobro del recuento, en segundos: el primero y cada cuánto el siguiente. */
export interface RitmoRecuento {
  inicio: number;
  cada: number;
}

/** Hasta `maximo` piedras que salen de `desde` desde el segundo `empieza`, que suman `piedras`. */
function piedrasDe(lado: Lado, piedras: number, desde: Punto, empieza: number, maximo: number, siguiente: () => number): Vuelo[] {
  const piezas = Math.min(piedras, maximo);
  return Array.from({ length: piezas }, (_, i) => ({
    id: siguiente(),
    lado,
    vale: Math.floor(piedras / piezas) + (i < piedras % piezas ? 1 : 0),
    retraso: empieza + i * 0.085,
    desde: { x: desde.x + azar(-16, 16), y: desde.y + azar(-8, 8) },
  }));
}

/**
 * El marcador que se ve: cuando alguien cobra, las piedras vuelan al marcador y el número sube
 * de una en una al llegar cada una. Si la tanda de efectos trae cobros (un «no quiero» o el
 * recuento), salen de `origenDe(lance)` y, en el recuento, cobro a cobro con su `ritmo`; si no,
 * del centro del tapete. `golpes` cambia con cada llegada, para que el número salte.
 */
export function useMarcadorVivo(
  marcador: PorLado<number>,
  viva: boolean,
  tanda: { efectos: EfectoMesa[]; clave: number },
  origenDe: (lance: Lance) => Punto,
  ritmo: RitmoRecuento,
) {
  const [mostrado, setMostrado] = useState(marcador);
  const [golpes, setGolpes] = useState<PorLado<number>>({ jugador: 0, rival: 0 });
  const [vuelos, setVuelos] = useState<Vuelo[]>([]);
  const enCamino = useRef<PorLado<number>>({ jugador: 0, rival: 0 });
  const siguiente = useRef(0);
  const racha = useRef(0);
  /** La última tanda cuyos cobros ya han salido volando. */
  const usada = useRef(tanda.clave);

  useEffect(() => {
    if (!viva) {
      enCamino.current = { jugador: 0, rival: 0 };
      setVuelos([]);
      if (mostrado.jugador !== marcador.jugador || mostrado.rival !== marcador.rival) setMostrado(marcador);
      return;
    }
    const cobros = usada.current === tanda.clave ? [] : tanda.efectos.filter((e) => e.tipo === 'cobro');
    const enRecuento = tanda.efectos.some((e) => e.tipo === 'cartasVistas');
    const nuevos: Vuelo[] = [];
    const id = () => ++siguiente.current;
    for (const lado of LADOS) {
      const objetivo = marcador[lado];
      if (objetivo < mostrado[lado]) {
        // Duelo nuevo: el marcador vuelve a cero sin vuelos.
        enCamino.current[lado] = 0;
        setVuelos((v) => v.filter((x) => x.lado !== lado));
        setMostrado((m) => ({ ...m, [lado]: objetivo }));
        continue;
      }
      let falta = objetivo - mostrado[lado] - enCamino.current[lado];
      if (falta <= 0) continue;
      enCamino.current[lado] += falta;
      for (const cobro of cobros) {
        if (cobro.lado !== lado || falta <= 0) continue;
        const piedras = Math.min(cobro.piedras, falta);
        falta -= piedras;
        const empieza = enRecuento ? ritmo.inicio + cobro.orden * ritmo.cada : 0.15;
        nuevos.push(...piedrasDe(lado, piedras, origenDe(cobro.lance), empieza, 6, id));
      }
      if (falta > 0) nuevos.push(...piedrasDe(lado, falta, BOTE, 0.15 + nuevos.length * 0.085, MAX_PIEDRAS, id));
    }
    if (nuevos.length > 0) {
      usada.current = tanda.clave;
      setVuelos((v) => [...v, ...nuevos]);
    }
    // `origenDe` no cambia de significado entre jugadas: solo se lee al salir las piedras.
  }, [marcador.jugador, marcador.rival, viva, mostrado, tanda.clave, tanda.efectos, ritmo.inicio, ritmo.cada]);

  const llega = useCallback((vuelo: Vuelo) => {
    enCamino.current[vuelo.lado] -= vuelo.vale;
    setVuelos((v) => v.filter((x) => x.id !== vuelo.id));
    setMostrado((m) => ({ ...m, [vuelo.lado]: m[vuelo.lado] + vuelo.vale }));
    setGolpes((g) => ({ ...g, [vuelo.lado]: g[vuelo.lado] + 1 }));
    sonar('piedra', { tono: 1 + Math.min(racha.current++, 12) * 0.045 });
  }, []);
  useEffect(() => {
    if (vuelos.length === 0) racha.current = 0;
  }, [vuelos.length]);

  return { marcador: viva ? mostrado : marcador, golpes, vuelos, llega };
}

/** Si no se encuentra el número del marcador, más o menos aquí está. */
const DESTINO_FIJO: PorLado<Punto> = { rival: { x: 35, y: 46 }, jugador: { x: 355, y: 46 } };

export function CapaPiedras({ vuelos, onLlega }: { vuelos: Vuelo[]; onLlega: (vuelo: Vuelo) => void }) {
  const capa = useRef<HTMLDivElement>(null);
  const escala = useEscala();
  const [destinos, setDestinos] = useState<PorLado<Punto> | null>(null);
  const hay = vuelos.length > 0;
  useLayoutEffect(() => {
    const el = capa.current;
    if (!hay || !el) return;
    const base = el.getBoundingClientRect();
    const medir = (lado: Lado): Punto => {
      const r = el.parentElement?.querySelector(`[data-numero="${lado}"]`)?.getBoundingClientRect();
      return r ? { x: (r.left + r.width / 2 - base.left) / escala, y: (r.top + r.height / 2 - base.top) / escala } : DESTINO_FIJO[lado];
    };
    setDestinos({ jugador: medir('jugador'), rival: medir('rival') });
  }, [hay, escala]);

  return (
    <div ref={capa} className="capa-piedras" aria-hidden="true">
      {destinos &&
        vuelos.map((vuelo) => {
          const { desde } = vuelo;
          const hacia = destinos[vuelo.lado];
          // Un arco: sube hacia su lado antes de caer en el número.
          const medio = { x: desde.x + (hacia.x - desde.x) * 0.3 + (vuelo.lado === 'jugador' ? 46 : -46), y: desde.y - (desde.y - hacia.y) * 0.55 };
          return (
            <motion.span
              key={vuelo.id}
              className="piedra-viva"
              initial={{ x: desde.x - 9, y: desde.y - 9, scale: 0.3, opacity: 0 }}
              animate={{ x: [desde.x - 9, medio.x - 9, hacia.x - 9], y: [desde.y - 9, medio.y - 9, hacia.y - 9], scale: [0.3, 1.3, 0.75], opacity: [0, 1, 1] }}
              transition={{ duration: 0.62, delay: vuelo.retraso, ease: 'easeInOut', times: [0, 0.42, 1] }}
              onAnimationComplete={() => onLlega(vuelo)}
            >
              {vuelo.vale > 1 && <b>{vuelo.vale}</b>}
            </motion.span>
          );
        })}
    </div>
  );
}

/* ——— Sellos, órdago, final ——— */

export interface SelloVivo {
  lado: Lado;
  dice: DichoSello;
  piedras: number;
  fuerza: FuerzaSello;
  /** El lance en que se dijo (`null` en el mus). */
  lance: Lance | null;
  clave: number;
}

const SONIDO_SELLO: Record<DichoSello, (fuerza: FuerzaSello) => Sonido> = {
  mus: () => 'toque',
  corto: () => 'sello',
  paso: () => 'paso',
  envido: (fuerza) => (fuerza === 2 ? 'golpe' : 'sello'),
  mas: () => 'golpe',
  quiero: () => 'sello',
  noQuiero: () => 'toque',
  ordago: () => 'golpe',
};

/** Lo que tarda el sello en golpear la mesa desde que aparece, en segundos: ahí suena y tiembla. */
const GOLPE = 0.15;

/** La mesa entera tiembla un momento (con «reducir movimiento», no). */
function sacudir(el: HTMLElement | null, fuerte: boolean, retraso = 0) {
  if (!el || quieto() || !el.animate) return;
  const a = fuerte ? 9 : 4;
  const giro = fuerte ? 0.6 : 0;
  el.animate(
    [
      { transform: 'none' },
      { transform: `translate(${-a}px, ${a * 0.5}px) rotate(${-giro}deg)` },
      { transform: `translate(${a * 0.8}px, ${-a * 0.4}px) rotate(${giro}deg)` },
      { transform: `translate(${-a * 0.5}px, ${a * 0.3}px)` },
      { transform: `translate(${a * 0.25}px, 0)` },
      { transform: 'none' },
    ],
    { duration: fuerte ? 480 : 300, easing: 'ease-out', delay: retraso * 1000 },
  );
}

/** El rival da un saltito al hablar. */
function saltaRetrato(raiz: HTMLElement | null) {
  if (!raiz || quieto()) return;
  raiz.querySelector<HTMLElement>('.retrato')?.animate?.(
    [{ transform: 'none' }, { transform: 'translateY(-9px) scale(1.025)' }, { transform: 'none' }],
    { duration: 340, easing: 'cubic-bezier(.3, 1.5, .5, 1)' },
  );
}

/** En qué parte de la mano estamos: el mus, un lance o el final. */
export type Etapa = 'mus' | Lance | 'fin';

export function etapaDe(duelo: EstadoDuelo): Etapa {
  if (duelo.fase === 'mus' || duelo.fase === 'descarte') return 'mus';
  if (duelo.fase === 'envite' && duelo.lanceActual) return duelo.lanceActual;
  return 'fin';
}

/** Lo que se queda a la vista un sello de un lance ya acabado antes de guardarse en su casilla, en ms. */
const RETIRO = 1200;

/**
 * Lo que se ve y se oye por cada tanda de efectos de la mesa: los sellos, el órdago, el
 * temblor, el saltito del rival, el confeti y los sonidos. También suena la Cara al cambiar.
 * `sello` es el último que se ha dicho (mesa viva: uno en el centro, que se va solo); `sellos`,
 * lo último de cada uno (mesa nueva: se queda junto a quien lo dijo hasta que acaba su lance).
 */
export function useEfectosVivos(estado: EstadoMesa, viva: boolean, raiz: RefObject<HTMLDivElement | null>, ritmo: RitmoRecuento) {
  const [sello, setSello] = useState<SelloVivo | null>(null);
  const [sellos, setSellos] = useState<PorLado<SelloVivo | null>>({ jugador: null, rival: null });
  const [ordago, setOrdago] = useState<{ lado: Lado; clave: number } | null>(null);
  const [fin, setFin] = useState<{ ganador: Lado; clave: number } | null>(null);
  const visto = useRef(0);
  const { efectos, claveEfectos: clave, avisoCara } = estado;

  useEffect(() => {
    if (clave === visto.current) return;
    visto.current = clave;
    if (!viva) return;
    const enRecuento = efectos.some((e) => e.tipo === 'cartasVistas');
    for (const efecto of efectos) {
      switch (efecto.tipo) {
        case 'reparto':
          for (let j = 0; j < 4; j++) {
            for (const lado of LADOS) sonar('carta', { retraso: retrasoEntrada(lado, j, true), tono: azar(0.9, 1.1) });
          }
          break;
        case 'descarte':
          for (let j = 0; j < efecto.cuantas; j++) {
            sonar('carta', { retraso: j * 0.05, tono: 0.8 });
            sonar('carta', { retraso: retrasoEntrada(efecto.lado, j, false), tono: azar(1, 1.15) });
          }
          if (efecto.lado === 'rival') saltaRetrato(raiz.current);
          break;
        case 'sello': {
          const nuevo = { ...efecto, clave };
          setSello(nuevo);
          setSellos((s) => ({ ...s, [efecto.lado]: nuevo }));
          sonar(SONIDO_SELLO[efecto.dice](efecto.fuerza), { retraso: GOLPE });
          if (efecto.fuerza === 2) sacudir(raiz.current, false, GOLPE);
          if (efecto.lado === 'rival') saltaRetrato(raiz.current);
          break;
        }
        case 'ordago':
          setSello(null);
          // En la mesa nueva, el órdago se queda puesto junto a quien lo tira hasta que le contestan.
          setSellos((s) => ({ ...s, [efecto.lado]: { lado: efecto.lado, dice: 'ordago', piedras: 0, fuerza: 2, lance: efecto.lance, clave } }));
          setOrdago({ lado: efecto.lado, clave });
          sonar('ordago');
          sacudir(raiz.current, true);
          break;
        case 'cartasVistas':
          for (let j = 0; j < 8; j++) sonar('carta', { retraso: 0.25 + j * 0.07, tono: 1.25 });
          break;
        case 'cobro':
          // Cada cobro del recuento golpea su casilla (los «no quiero» ya suenan con su sello).
          if (enRecuento) sonar('sello', { retraso: ritmo.inicio + efecto.orden * ritmo.cada });
          break;
        case 'finDuelo':
          setFin({ ganador: efecto.ganador, clave });
          sonar(efecto.ganador === 'jugador' ? 'ganas' : 'pierdes', { retraso: 0.35 });
          break;
      }
    }
  }, [clave, efectos, viva, raiz, ritmo]);

  const caraVista = useRef(avisoCara?.clave ?? 0);
  useEffect(() => {
    if (!avisoCara || avisoCara.clave === caraVista.current) return;
    caraVista.current = avisoCara.clave;
    if (viva) sonar(avisoCara.delta > 0 ? 'caraSube' : 'caraBaja', { retraso: 0.15 });
  }, [avisoCara, viva]);

  // Mesa nueva: lo dicho en un lance que ya ha acabado se queda un momento y se guarda en su casilla.
  const etapa = etapaDe(estado.partida.duelo);
  useEffect(() => {
    const reloj = setTimeout(() => {
      const sigue = (s: SelloVivo | null) => (s && (s.lance ?? 'mus') === etapa ? s : null);
      setSellos((s) => (sigue(s.jugador) === s.jugador && sigue(s.rival) === s.rival ? s : { jugador: sigue(s.jugador), rival: sigue(s.rival) }));
    }, RETIRO);
    return () => clearTimeout(reloj);
  }, [etapa]);

  useEffect(() => {
    if (!sello) return;
    const reloj = setTimeout(() => setSello(null), DURA_SELLO[sello.fuerza]);
    return () => clearTimeout(reloj);
  }, [sello]);
  useEffect(() => {
    if (!ordago) return;
    const reloj = setTimeout(() => setOrdago(null), DURA_ORDAGO);
    return () => clearTimeout(reloj);
  }, [ordago]);
  useEffect(() => {
    if (!fin) return;
    const reloj = setTimeout(() => setFin(null), DURA_CONFETI);
    return () => clearTimeout(reloj);
  }, [fin]);

  return { sello, sellos, ordago, fin };
}

function textoSello({ dice, piedras }: SelloVivo): string {
  switch (dice) {
    case 'envido':
      return M.botones.envido(piedras);
    case 'mas':
      return M.botones.mas(piedras);
    default:
      return M.botones[dice];
  }
}

/** Sombra dura en el aire (más lejos y más clara), al golpear (casi pegada) y en reposo. */
const SOMBRAS = ['10px 12px 0px rgba(35, 25, 21, 0.25)', '1px 1px 0px rgba(35, 25, 21, 1)', '4px 4px 0px rgba(35, 25, 21, 1)'];

/**
 * Un sello: baja desde arriba ya entero, golpea la mesa (se aplasta un poco, la sombra se pega y
 * se abre una onda de tinta) y se queda quieto, sin rebotes. Al irse, o se apaga o, si tiene
 * casilla, vuela a guardarse en ella (`retiro`, lo que se desplaza hasta allí).
 */
function SelloImpreso({ sello, nombre, giro, retiro }: { sello: SelloVivo; nombre: string; giro: number; retiro?: Punto }) {
  // NO QUIERO no lleva sombra: es rendirse, como su botón.
  const sombra = sello.dice === 'noQuiero' ? {} : { boxShadow: SOMBRAS };
  return (
    <motion.div
      className={clases('sello', `sello--${sello.dice}`, `sello--${sello.lado}`, `sello--fuerza-${sello.fuerza}`)}
      initial={{ opacity: 0, y: -34, scale: 1.3, rotate: giro * 1.8 }}
      animate={{ opacity: 1, y: [-34, 0, 0], scale: [1.3, 0.93, 1], rotate: giro, ...sombra }}
      transition={{
        duration: 0.3,
        times: [0, GOLPE / 0.3, 1],
        ease: ['easeIn', 'easeOut'],
        opacity: { duration: 0.06 },
        rotate: { duration: GOLPE, ease: 'easeIn' },
      }}
      exit={
        retiro
          ? { x: retiro.x, y: retiro.y, scale: 0.2, opacity: 0, transition: { duration: 0.45, ease: 'easeIn', opacity: { delay: 0.3, duration: 0.15 } } }
          : { opacity: 0, scale: 0.96, transition: { duration: 0.18 } }
      }
    >
      <span className="sello__quien">{sello.lado === 'rival' ? nombre : M.tu}</span>
      <span className="sello__texto">{textoSello(sello)}</span>
      <span className="sello__onda" />
    </motion.div>
  );
}

/** Mesa viva: lo que se dice cae en el centro del tapete y se va solo. */
export function Sellos({ sello, nombre }: { sello: SelloVivo | null; nombre: string }) {
  return (
    <div className="sellos" aria-hidden="true">
      <AnimatePresence>{sello && <SelloImpreso key={sello.clave} sello={sello} nombre={nombre} giro={sello.lado === 'rival' ? -6 : 5} />}</AnimatePresence>
    </div>
  );
}

/**
 * Mesa nueva: lo último que ha dicho cada uno, junto a él (el rival bajo su retrato, tú encima
 * de tus cartas), hasta que acaba el lance; entonces vuela a su casilla (`retiroDe`).
 */
export function SellosPorLado({
  sellos,
  nombre,
  retiroDe,
}: {
  sellos: PorLado<SelloVivo | null>;
  nombre: string;
  retiroDe: (sello: SelloVivo) => Punto | undefined;
}) {
  return (
    <>
      {LADOS.map((lado) => {
        const sello = sellos[lado];
        return (
          <div key={lado} className={`sellos-lado sellos-lado--${lado}`} aria-hidden="true">
            <AnimatePresence>
              {sello && <SelloImpreso key={sello.clave} sello={sello} nombre={nombre} giro={lado === 'rival' ? -5 : 4} retiro={retiroDe(sello)} />}
            </AnimatePresence>
          </div>
        );
      })}
    </>
  );
}

/** ¡ÓRDAGO!: la pantalla se pone almagre con rayos y el grito cae encima, un segundo y medio. */
export function EstallidoOrdago({ ordago, nombre }: { ordago: { lado: Lado; clave: number } | null; nombre: string }) {
  return (
    <AnimatePresence>
      {ordago && (
        <motion.div
          key={ordago.clave}
          className="estallido"
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.08 } }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
        >
          <div className="estallido__rayos" />
          <motion.div
            className="estallido__texto"
            initial={{ scale: 3.2, rotate: -18 }}
            animate={{ scale: 1, rotate: -5 }}
            transition={{ type: 'spring', stiffness: 520, damping: 15 }}
          >
            {M.botones.ordago}
          </motion.div>
          <motion.div className="estallido__quien" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
            {M.tiraOrdago(ordago.lado === 'rival' ? nombre : null)}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const COLORES_CONFETI = ['var(--gualda)', 'var(--almagre)', 'var(--papel)', 'var(--verde)', 'var(--anil)'];

/** Has ganado el duelo: llueven trocitos de papel de las cinco tintas. */
export function Confeti() {
  const trozos = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => ({
        left: azar(-10, 390),
        ancho: azar(6, 12),
        color: COLORES_CONFETI[i % COLORES_CONFETI.length]!,
        retraso: azar(0, 0.7),
        dura: azar(1.8, 2.8),
        giro: azar(-720, 720),
        deriva: azar(-70, 70),
      })),
    [],
  );
  return (
    <div className="confeti" aria-hidden="true">
      {trozos.map((t, i) => (
        <span
          key={i}
          style={
            {
              left: t.left,
              width: t.ancho,
              background: t.color,
              animationDelay: `${t.retraso}s`,
              animationDuration: `${t.dura}s`,
              '--giro': `${t.giro}deg`,
              '--deriva': `${t.deriva}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
