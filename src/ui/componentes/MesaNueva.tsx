import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { casillasDe, type CasillaLance } from '../../estado/casillas';
import { ultimoDelRival, type LineaActa } from '../../estado/mesa';
import type { Lado, PorLado } from '../../nucleo/comun';
import type { EstadoDuelo } from '../../nucleo/duelo';
import type { Lance } from '../../nucleo/lances';
import { ES } from '../../textos/es';
import type { Punto, RitmoRecuento, SelloVivo } from './MesaViva';
import { clases } from './piezas';
import './mesaNueva.css';

/*
 * La mesa nueva (prototipo, 22 de octubre de 2026): sin el acta a la vista. Lo que pasa lo
 * cuentan los sellos junto a quien habla y las cuatro casillas de los lances en el tapete; el
 * rival habla en bocadillos; las reglas especiales salen como avisos, y el acta entera está
 * detrás de ≡. Medidas en píxeles del escenario de 390 × 844, como en mesaNueva.css.
 */

const N = ES.mesa.nueva;

/** La fila de casillas (`.casillas`): cuatro de 88 px con 6 px entre ellas. */
const CASILLAS = { left: 10, top: 478, ancho: 88, hueco: 6, alto: 72 };
/** El recuento sobre la mesa: la primera casilla cobra a los 0,7 s y cada una medio segundo después. */
export const RITMO_NUEVA: RitmoRecuento = { inicio: 0.7, cada: 0.55 };
const ORDEN_CASILLAS: Lance[] = ['grande', 'chica', 'pares', 'juego'];

export function centroDeCasilla(lance: Lance): Punto {
  const i = lance === 'punto' ? 3 : ORDEN_CASILLAS.indexOf(lance);
  return { x: CASILLAS.left + CASILLAS.ancho / 2 + i * (CASILLAS.ancho + CASILLAS.hueco), y: CASILLAS.top + CASILLAS.alto / 2 };
}

/** Más o menos el centro de los sellos de cada uno (`.sellos-lado--rival` y `--jugador`). */
const CENTRO_SELLO: PorLado<Punto> = { rival: { x: 80, y: 364 }, jugador: { x: 308, y: 590 } };

/** Lo que se desplaza un sello para guardarse en la casilla de su lance; los del mus, ninguno. */
export function retiroDelSello(sello: SelloVivo): Punto | undefined {
  if (!sello.lance) return undefined;
  const casilla = centroDeCasilla(sello.lance);
  return { x: casilla.x - CENTRO_SELLO[sello.lado].x, y: casilla.y - CENTRO_SELLO[sello.lado].y };
}

/* ——— Las casillas de los lances ——— */

/**
 * Los cuatro lances como casillas en el tapete. La que se juega va resaltada, con lo que hay
 * envidado; en las demás se queda lo que pasó. En Pares y Juego, una marca arriba (el rival) y
 * otra abajo (tú) dicen quién lo lleva. En el recuento, cada casilla cobra a su tiempo.
 */
export function Casillas({ duelo, nombre }: { duelo: EstadoDuelo; nombre: string }) {
  return (
    <ol className="casillas" aria-label={N.casillas}>
      {casillasDe(duelo).map((casilla, i) => (
        <li key={i} className={clases('casilla', `casilla--${casilla.estado.tipo}`, casilla.actual && 'casilla--actual')}>
          <span className="casilla__nombre">{ES.lances[casilla.lance]}</span>
          <span key={claveContenido(casilla)} className="casilla__contenido">
            {contenido(casilla, nombre)}
          </span>
          {casilla.tienen &&
            (['rival', 'jugador'] as const).map((lado) => (
              <span
                key={lado}
                className={clases('casilla__tiene', `casilla__tiene--${lado}`, casilla.tienen![lado] && 'casilla__tiene--si')}
                title={N.lleva(lado === 'rival' ? nombre : null, casilla.tienen![lado], ES.lances[casilla.lance].toLowerCase())}
              >
                {casilla.tienen![lado] ? '✓' : '✗'}
              </span>
            ))}
          {casilla.cobros.length > 0 && (
            <span className="casilla__cobros">
              {casilla.cobros.map(({ cobro, orden, apuntado }) => (
                <span
                  key={orden}
                  className={clases('casilla__cobro', `casilla__cobro--${cobro.lado}`, !apuntado && 'casilla__cobro--sin')}
                  style={{ animationDelay: `${RITMO_NUEVA.inicio + orden * RITMO_NUEVA.cada}s` }}
                  title={`${quien(cobro.lado, nombre)}: ${ES.conceptos[cobro.concepto]}`}
                >
                  +{cobro.piedras}
                </span>
              ))}
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

const quien = (lado: Lado, nombre: string) => (lado === 'jugador' ? N.tu : nombre);

/** Cambia cuando cambia lo que enseña la casilla: así lo nuevo entra con un golpe. */
function claveContenido({ estado }: CasillaLance): string {
  return 'piedras' in estado ? `${estado.tipo}-${estado.piedras}` : estado.tipo;
}

/** El montón de amarracos con la cifra: lo que hay en juego (o lo querido) en la casilla. */
function Bote({ piedras }: { piedras: number }) {
  return (
    <span className="bote">
      {Array.from({ length: Math.min(3, piedras) }, (_, i) => (
        <span key={i} className="bote__ficha" style={{ left: i * 5, top: -i * 3 }} />
      ))}
      <b className="bote__cifra">{piedras}</b>
    </span>
  );
}

function contenido({ estado }: CasillaLance, nombre: string): ReactNode {
  switch (estado.tipo) {
    case 'falta':
      return null;
    case 'enJuego':
      if (estado.ordago) return <b className="casilla__grito">{N.ordago}</b>;
      return estado.piedras > 0 ? <Bote piedras={estado.piedras} /> : <i>{N.seJuega}</i>;
    case 'enPaso':
      return <i>{N.enPaso}</i>;
    case 'querido':
      return (
        <>
          <Bote piedras={estado.piedras} />
          <i>{N.querido}</i>
        </>
      );
    case 'noQuerido':
      return (
        <>
          <i>{N.noQuiso}</i>
          <b className={`casilla__para casilla__para--${estado.ganador}`}>
            +{estado.piedras} {quien(estado.ganador, nombre)}
          </b>
        </>
      );
    case 'ordago':
      return <b className="casilla__grito">{N.ordago}</b>;
    case 'soloUno':
      return <i>{N.solo(quien(estado.quien, nombre))}</i>;
    case 'nadie':
      return <i>{N.noVa}</i>;
    case 'trato':
      return <i>{N.trato}</i>;
  }
}

/* ——— Lo que dice el rival, los avisos y el acta entera ——— */

/**
 * El rival habla en un bocadillo junto a su cara: su frase de la última jugada, un momento
 * (más cuanto más larga). Mientras piensa, «…».
 */
export function Bocadillo({ acta, piensa }: { acta: LineaActa[]; piensa: boolean }) {
  const ultima = acta[ultimoDelRival(acta)];
  const [frase, setFrase] = useState<{ texto: string; clave: number } | null>(null);
  const vista = useRef<LineaActa | null>(null);
  const claves = useRef(0);
  useEffect(() => {
    if (!ultima?.frase || ultima === vista.current) return;
    vista.current = ultima;
    setFrase({ texto: ultima.frase, clave: ++claves.current });
  }, [ultima]);
  useEffect(() => {
    if (!frase) return;
    const reloj = setTimeout(() => setFrase(null), Math.min(5200, 1700 + frase.texto.length * 45));
    return () => clearTimeout(reloj);
  }, [frase]);

  const texto = frase?.texto ?? (piensa ? '…' : null);
  return (
    <div className="bocadillo-hueco" aria-live="polite">
      <AnimatePresence>
        {texto && (
          <motion.div
            key={frase ? frase.clave : 'piensa'}
            className={clases('bocadillo', !frase && 'bocadillo--piensa')}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 520, damping: 28 }}
          >
            {texto}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Lo que hay que contar aunque no se vea el acta (quién es mano, las reglas especiales del
 * rival, lo que hace un objeto): una tira de papel bajo el marcador, un rato y se va.
 */
export function Avisos({ acta }: { acta: LineaActa[] }) {
  const vistas = useRef(new WeakSet<LineaActa>());
  const claves = useRef(0);
  const [aviso, setAviso] = useState<{ textos: string[]; clave: number } | null>(null);
  useEffect(() => {
    const nuevas = acta.filter((linea) => linea.aviso && !vistas.current.has(linea));
    acta.forEach((linea) => vistas.current.add(linea));
    if (nuevas.length > 0) setAviso({ textos: nuevas.slice(-2).map((l) => l.texto), clave: ++claves.current });
  }, [acta]);
  useEffect(() => {
    if (!aviso) return;
    const reloj = setTimeout(() => setAviso(null), Math.min(6500, 2400 + aviso.textos.join(' ').length * 45));
    return () => clearTimeout(reloj);
  }, [aviso]);

  return (
    <div className="avisos" role="status" aria-live="polite">
      <AnimatePresence>
        {aviso && (
          <motion.div
            key={aviso.clave}
            className="aviso"
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          >
            {aviso.textos.map((texto, i) => (
              <p key={i}>{texto}</p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** ≡: el botón que abre el acta entera de la mano. */
export function BotonHistorial({ onAbrir }: { onAbrir: () => void }) {
  return (
    <button type="button" className="mesa__historial" aria-label={N.verMano} title={N.verMano} onClick={onAbrir}>
      ≡
    </button>
  );
}

/** La mano entera, contada como en el acta: para repasarla o para aprender. */
export function HistorialMano({ acta, numeroMano, onCerrar }: { acta: LineaActa[]; numeroMano: number; onCerrar: () => void }) {
  const titulo = N.titulo(numeroMano);
  return (
    <div className="mesa__velo mesa__velo--encima" onClick={onCerrar}>
      <div className="panel panel--sombra historial" role="dialog" aria-modal="true" aria-label={titulo} onClick={(e) => e.stopPropagation()}>
        <div className="historial__cabecera">
          <b className="historial__titulo">{titulo}</b>
          <button type="button" className="historial__cerrar" onClick={onCerrar} autoFocus>
            ✕ {N.cerrar}
          </button>
        </div>
        <ol className="historial__lineas">
          {acta.map((linea, i) => (
            <li key={i} className={clases('acta__linea', `acta__linea--${linea.quien ?? 'mesa'}`)}>
              <span className="acta__texto">{linea.texto}</span>
              {linea.frase && <span className="acta__frase">{linea.frase}</span>}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
