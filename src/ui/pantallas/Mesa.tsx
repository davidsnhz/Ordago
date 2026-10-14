import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { COMPANEROS } from '../../datos/companeros';
import { esDeUnUso, OBJETOS, type IdObjeto } from '../../datos/objetos';
import { animoDe, ORDEN_RIVALES, RIVALES, type IdRival } from '../../datos/rivales';
import type { Bolsa } from '../../estado/gira';
import {
  cartasDelRivalALaVista,
  puedeUsarObjeto,
  puedeUsarSena,
  senasQueQuedan,
  usarObjeto,
  usarSena,
  type Partida,
} from '../../estado/partida';
import { empezarSuelto, useDuelo } from '../../estado/useDuelo';
import { poseDelRival, textosDe, ultimoDelRival, type EstadoMesa, type LineaActa } from '../../estado/mesa';
import { idCarta, mismaCarta, type Carta } from '../../nucleo/carta';
import type { Lado } from '../../nucleo/comun';
import { accionesValidas, type AccionDuelo, type EstadoDuelo, type OpcionDuelo } from '../../nucleo/duelo';
import { calcularFuerza } from '../../nucleo/ia/fuerza';
import { LANCES } from '../../nucleo/lances';
import { cartaCorta, ES, type TextosRival } from '../../textos/es';
import { BotonOrdago } from '../componentes/BotonOrdago';
import { Escenario } from '../componentes/Escenario';
import { BotonApuesta, CartaReverso, CartaVista, clases } from '../componentes/piezas';
import { Retrato } from '../componentes/Retrato';
import { AyudaCara, Cabecera } from './Cabecera';
import './mesa.css';

const M = ES.mesa;
const G = ES.gira;
/** Envites rápidos; el resto, con la barra. */
const RAPIDAS = [2, 3];
const BARRA = { minimo: 4, maximo: 19 };
/** Líneas del acta que se ven sin abrirla. */
const LINEAS_VISIBLES = 3;
/** Abanico de la mano: posición y giro de cada carta (escenario vertical de 390 × 844). */
const ABANICO = [
  { left: 0, top: 8, giro: -9 },
  { left: 70, top: 2, giro: -3 },
  { left: 140, top: 2, giro: 3 },
  { left: 210, top: 8, giro: 9 },
];
const ABANICO_RIVAL = [
  { left: 0, top: 3, giro: -8 },
  { left: 30, top: 0, giro: -3 },
  { left: 60, top: 0, giro: 3 },
  { left: 90, top: 3, giro: 8 },
];
/** Lo que hay que mantener pulsado el retrato para empezar a mirar. */
const PULSACION_LARGA = 250;

/** Duelo suelto (contra el rival que elijas) o un duelo de la gira, con la bolsa. */
export type ModoMesa =
  | { tipo: 'suelto'; rival?: IdRival; onSalir: () => void }
  | {
      tipo: 'gira';
      inicio: () => EstadoMesa;
      /** Al final de cada mano y al acabar: para guardar la gira. */
      alGuardar: (partida: Partida) => void;
      bolsa: Bolsa;
      /** Se ha usado en la mesa una bebida o jugarreta: sale de la bolsa. */
      onGastar: (id: IdObjeto) => void;
      onTerminar: (partida: Partida) => void;
      onSalir: () => void;
    };

/** Posturas y caras que se pueden ver con el botón de pruebas (`null`: lo que toque). */
const POSES_DE_PRUEBA: (string | null)[] = [null, 'crecido', 'arrugado', 'sorprendido', 'riendo', 'enfadado'];

/** La mesa: un duelo contra un rival, en vertical. */
export function Mesa({ modo }: { modo: ModoMesa }) {
  const enGira = modo.tipo === 'gira';
  const { estado, jugar, aplicar, nuevoDuelo, mirar, mirando, setMirando, cambiarCara, ensayarTics, setPausa, rivalPiensa } = useDuelo(
    modo.tipo === 'gira' ? { inicio: modo.inicio, alGuardar: modo.alGuardar } : { inicio: () => empezarSuelto(modo.rival) },
  );
  const pruebas = useModoPruebas();
  const [depuracion, alternarDepuracion] = useDepuracion(pruebas);
  const [eligiendoRival, setEligiendoRival] = useState(false);
  // Modo de pruebas: enseñar a mano cada postura y cada cara del rival, para revisar su arte.
  const [poseDePrueba, setPoseDePrueba] = useState<string | null>(null);
  const siguientePose = () => setPoseDePrueba((p) => POSES_DE_PRUEBA[(POSES_DE_PRUEBA.indexOf(p) + 1) % POSES_DE_PRUEBA.length]!);
  // Mientras lees qué es la Cara o miras la bolsa, el rival espera.
  const [ayudaCara, setAyudaCara] = useState(false);
  const [bolsaAbierta, setBolsaAbierta] = useState(false);
  useEffect(() => setPausa(ayudaCara || bolsaAbierta), [ayudaCara, bolsaAbierta, setPausa]);
  const { partida } = estado;
  const aLaVista = cartasDelRivalALaVista(partida);
  const duelo = partida.duelo;
  const textos = textosDe(partida);
  const { lado: quienActua, opciones } = accionesValidas(duelo);
  const puedo = (tipo: OpcionDuelo['tipo']) => quienActua === 'jugador' && opciones.some((o) => o.tipo === tipo);

  const [seleccion, setSeleccion] = useState<string[]>([]);
  useEffect(() => setSeleccion([]), [duelo.fase, duelo.numeroMano, duelo.rondasMus]);

  const descartando = puedo('descartar');
  const alternarCarta = (carta: Carta) => {
    const id = idCarta(carta);
    setSeleccion((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };
  const elegirRival = (rival: IdRival) => {
    setEligiendoRival(false);
    nuevoDuelo(rival);
  };

  return (
    <Escenario avisoGirar={M.girar}>
      <div className={clases('mesa', mirando && 'mesa--mirando')}>
        <div className="mesa__pared" />
        <div className="mesa__luz" />

        <Cabecera estado={estado} textos={textos} onAyuda={() => setAyudaCara(true)} />

        <Retrato
          id={partida.rivalId}
          nombre={textos.titulo}
          tic={estado.tic}
          pose={poseDePrueba ?? poseDelRival(partida)}
          reaccion={poseDePrueba ? null : estado.reaccion}
          acotacion={estado.tic ? (textos.tics[estado.tic.id] ?? null) : null}
          depuracion={
            estado.tic && estado.tic.explicado
              ? (textos.significadoTics[estado.tic.id] ?? null)
              : depuracion && estado.tic
                ? M.depuracionTic(estado.tic.verdadero, textos.significadoTics[estado.tic.id] ?? '')
                : null
          }
          textoPendiente={`${textos.etiqueta} · ${M.artePendiente}`}
        />
        {mirando && <div className="mesa__penumbra" />}
        <ZonaMirar
          nombre={textos.nombre}
          onEmpieza={() => setMirando(true)}
          onTermina={(segundos) => {
            setMirando(false);
            mirar(segundos);
          }}
        />
        <EstadoDelRival partida={partida} />
        {modo.tipo === 'gira' && (
          <BotonBolsa partida={partida} bolsa={modo.bolsa} onAbrir={() => setBolsaAbierta(true)} />
        )}
        <button type="button" className="mesa__salir" onClick={modo.onSalir} aria-label={ES.gira.mesa.salirAyuda}>
          {ES.gira.mesa.salir}
        </button>
        {pruebas && (
          <div className="mesa__pruebas">
            {!enGira && (
              <button type="button" className="mesa__boton-pequeno" onClick={() => setEligiendoRival(true)}>
                {M.rival}
              </button>
            )}
            <button type="button" className="mesa__boton-pequeno" aria-pressed={depuracion} onClick={alternarDepuracion}>
              {M.depurar}
            </button>
            <button type="button" className="mesa__boton-pequeno" onClick={ensayarTics}>
              {M.ensayarTics}
            </button>
            <button type="button" className="mesa__boton-pequeno" onClick={siguientePose}>
              {M.ensayarPoses(poseDePrueba)}
            </button>
          </div>
        )}

        <Acta duelo={duelo} acta={estado.acta} />

        <div className="mesa__madera" />
        <div className="mesa__tapete" />
        <div className="mesa__cartas-rival" aria-label={M.susCartas(textos.nombre)}>
          {ABANICO_RIVAL.map((p, i) => {
            const carta = duelo.cartas.rival[i];
            const estilo = { left: p.left, top: p.top, transform: `rotate(${p.giro}deg)` };
            // Con el Chato de vino o la seña del Lazarillo, se ven boca arriba.
            return carta && aLaVista.some((c) => mismaCarta(c, carta)) ? (
              <CartaVista key={idCarta(carta)} carta={carta} className="carta--rival carta--rival-vista" style={estilo} />
            ) : (
              <CartaReverso key={i} className="carta--rival" style={estilo} />
            );
          })}
        </div>

        <ManoDelJugador cartas={duelo.cartas.jugador} seleccionables={descartando} seleccion={seleccion} onAlternar={alternarCarta} />

        <Botonera
          duelo={duelo}
          puedo={puedo}
          seleccion={seleccion}
          onAccion={jugar}
          opciones={opciones}
          espera={rivalPiensa ? M.leToca(textos.nombre) : null}
        />

        {depuracion && <PanelDepuracion estado={estado} textos={textos} onCara={cambiarCara} />}
        <PanelFinal
          duelo={duelo}
          textos={textos}
          rivalActual={partida.rivalId}
          onSiguiente={() => jugar({ tipo: 'siguienteMano' })}
          onOtroDuelo={elegirRival}
          alAcabar={modo.tipo === 'gira' ? () => modo.onTerminar(partida) : null}
          onSalir={modo.onSalir}
        />
        {modo.tipo === 'gira' && bolsaAbierta && (
          <PanelBolsa
            partida={partida}
            bolsa={modo.bolsa}
            onUsar={(id) => {
              if (!puedeUsarObjeto(partida, id)) return;
              aplicar((p) => usarObjeto(p, id));
              if (esDeUnUso(id)) modo.onGastar(id);
              setBolsaAbierta(false);
            }}
            onSena={() => {
              if (!puedeUsarSena(partida)) return;
              aplicar(usarSena);
              setBolsaAbierta(false);
            }}
            onCerrar={() => setBolsaAbierta(false)}
          />
        )}
        {ayudaCara && <AyudaCara valor={partida.caraJugador} onCerrar={() => setAyudaCara(false)} />}
        {eligiendoRival && (
          <SelectorDeRival actual={partida.rivalId} onElegir={elegirRival} onCancelar={() => setEligiendoRival(false)} />
        )}
      </div>
    </Escenario>
  );
}

/**
 * Junto al retrato ya no va el nombre (está en el marcador): solo cómo está el rival por sus
 * reglas especiales, mientras dura.
 */
function EstadoDelRival({ partida }: { partida: Partida }) {
  const { memoria, duelo } = partida;
  const perfil = RIVALES[partida.rivalId];
  const animo = duelo.fase === 'finDuelo' ? null : animoDe(perfil, duelo.marcador.rival - duelo.marcador.jugador);
  const estados = [
    memoria.manosEnfadado > 0 ? { texto: M.enfadado, ayuda: M.ayudaEnfadado } : null,
    memoria.ofendidaHastaMano >= duelo.numeroMano ? { texto: M.estadoOfendida, ayuda: M.ayudaOfendida } : null,
    animo === 'crecido' ? { texto: M.crecido, ayuda: M.ayudaCrecido(Boolean(perfil.seVieneArriba)) } : null,
    animo === 'arrugado' ? { texto: M.arrugado, ayuda: M.ayudaArrugado } : null,
  ].filter((e) => e !== null);
  if (estados.length === 0) return null;
  return (
    <div className="mesa__estado-rival">
      {estados.map((e) => (
        <span key={e.texto} className="mesa__estado" title={e.ayuda}>
          {e.texto}
        </span>
      ))}
    </div>
  );
}

/**
 * Mirar al rival: manteniendo pulsado el retrato se le ve de cerca y sus tics duran más.
 * Mientras miras no puedes jugar, y algún rival se da cuenta si le miras demasiado.
 */
function ZonaMirar({ nombre, onEmpieza, onTermina }: { nombre: string; onEmpieza: () => void; onTermina: (segundos: number) => void }) {
  const inicio = useRef<number | null>(null);
  const reloj = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mirando = useRef(false);

  const pulsar = (e: PointerEvent<HTMLButtonElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Algún navegador no deja capturar el puntero: la mirada funciona igual.
    }
    inicio.current = performance.now();
    reloj.current = setTimeout(() => {
      mirando.current = true;
      onEmpieza();
    }, PULSACION_LARGA);
  };
  const soltar = () => {
    if (reloj.current) clearTimeout(reloj.current);
    if (mirando.current && inicio.current !== null) onTermina((performance.now() - inicio.current) / 1000);
    mirando.current = false;
    inicio.current = null;
  };
  return (
    <button
      type="button"
      className="mesa__zona-mirar"
      aria-label={`Mirar a ${nombre}: mantén pulsado`}
      onPointerDown={pulsar}
      onPointerUp={soltar}
      onPointerCancel={soltar}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}

/**
 * El acta de la mano, contada, en un solo panel bajo el retrato. La pestaña dice el lance y la
 * ficha roja, lo que hay en juego; dentro, las últimas cosas: lo tuyo en cursiva azul, lo del
 * rival en versalitas rojas con su frase, y lo que pasa en la mesa en letra corriente. «La mano»
 * la abre entera.
 */
function Acta({ duelo, acta }: { duelo: EstadoDuelo; acta: LineaActa[] }) {
  const [abierta, setAbierta] = useState(false);
  useEffect(() => setAbierta(false), [duelo.numeroMano]);
  const ficha = fichaActa(duelo);
  // Si las últimas líneas no caben (frases largas), se esconden enteras las más antiguas en vez
  // de cortarse a medias; siguen en «Toda la mano».
  const lineas = useRef<HTMLOListElement>(null);
  const [sobran, setSobran] = useState(0);
  useLayoutEffect(() => setSobran(0), [acta.length, abierta]);
  const desde = abierta ? 0 : Math.min(acta.length - 1, Math.max(0, acta.length - LINEAS_VISIBLES) + sobran);
  useLayoutEffect(() => {
    const ol = lineas.current;
    const primera = ol?.firstElementChild;
    // Con las líneas pegadas abajo, lo que no cabe asoma por arriba: la primera empieza antes que la caja.
    if (ol && primera && !abierta && desde < acta.length - 1 && primera.getBoundingClientRect().top < ol.getBoundingClientRect().top - 1) {
      setSobran((s) => s + 1);
    }
  });
  const conFrase = ultimoDelRival(acta);
  const ultima = acta.length - 1;

  return (
    <section className={clases('acta', abierta && 'acta--abierta', ficha && 'acta--con-ficha')} aria-label="Lo que pasa en la mano">
      <div className="acta__caja">
        <ol ref={lineas} className="acta__lineas" aria-live="polite">
          {acta.slice(desde).map((linea, i) => {
            const indice = desde + i;
            return (
              <li
                key={indice}
                className={clases('acta__linea', `acta__linea--${linea.quien ?? 'mesa'}`, indice === ultima && 'acta__linea--ultima')}
              >
                <span className="acta__texto">{linea.texto}</span>
                {linea.frase && indice === conFrase && <span className="acta__frase">{linea.frase}</span>}
              </li>
            );
          })}
        </ol>
      </div>
      <span className="acta__cola" aria-hidden="true" />
      <span className="acta__pestana">{pestanaActa(duelo)}</span>
      {ficha && (
        <span className={clases('acta__ficha', ficha.todo && 'acta__ficha--todo')} aria-label={`${ficha.cifra} ${ficha.pie}`}>
          <b>{ficha.cifra}</b>
          <span>{ficha.pie}</span>
        </span>
      )}
      {(abierta || desde > 0) && (
        <button type="button" className="acta__ver" aria-expanded={abierta} onClick={() => setAbierta((a) => !a)}>
          {abierta ? `▴ ${M.cerrarMano}` : `≡ ${M.verMano}`}
        </button>
      )}
    </section>
  );
}

/** En qué estamos: el lance con su artículo, o la fase con el número de mano. */
function pestanaActa(duelo: EstadoDuelo): string {
  const mano = M.mano(duelo.numeroMano);
  switch (duelo.fase) {
    case 'mus':
      return `${M.fases.mus} · ${mano}`;
    case 'descarte':
      return `${M.fases.descarte} · ${mano}`;
    case 'trato':
      return M.fases.trato;
    case 'envite':
      return duelo.lanceActual ? M.lanceConArticulo[duelo.lanceActual] : mano;
    default:
      return `${M.fases.recuento} · ${mano}`;
  }
}

/** Lo que hay en juego, si hay envite: la cifra, o TODO si es un órdago. */
function fichaActa(duelo: EstadoDuelo): { cifra: string; pie: string; todo: boolean } | null {
  const envite = duelo.fase === 'envite' ? duelo.envite : null;
  if (!envite) return null;
  if (envite.ordago) return { cifra: M.ficha.todo, pie: M.ficha.elDuelo, todo: true };
  return envite.apuesta > 0 ? { cifra: String(envite.apuesta), pie: M.ficha.enJuego, todo: false } : null;
}

function ManoDelJugador({
  cartas,
  seleccionables,
  seleccion,
  onAlternar,
}: {
  cartas: Carta[];
  seleccionables: boolean;
  seleccion: string[];
  onAlternar: (carta: Carta) => void;
}) {
  return (
    <div className={clases('mesa__mano', seleccionables && 'mesa__mano--descarte')}>
      {cartas.map((carta, i) => {
        const p = ABANICO[i]!;
        const elegida = seleccion.includes(idCarta(carta));
        const estilo = { left: p.left, top: p.top, transform: `rotate(${p.giro}deg) translateY(${elegida ? -20 : 0}px)` };
        return seleccionables ? (
          <button
            key={idCarta(carta)}
            type="button"
            className={clases('mesa__carta-boton', elegida && 'mesa__carta-boton--elegida')}
            style={estilo}
            aria-pressed={elegida}
            onClick={() => onAlternar(carta)}
          >
            <CartaVista carta={carta} className="carta--mano" />
          </button>
        ) : (
          <CartaVista key={idCarta(carta)} carta={carta} className="carta--mano mesa__carta" style={estilo} />
        );
      })}
    </div>
  );
}

/**
 * Barra de acciones de abajo, limpia: los botones que tocan en cada momento en una fila y el
 * órdago aparte, pequeño. Cuando le toca al rival, lo dice. Envidar o subir abre encima el
 * selector de cantidad.
 */
function Botonera({
  duelo,
  puedo,
  seleccion,
  onAccion,
  opciones,
  espera,
}: {
  duelo: EstadoDuelo;
  puedo: (tipo: OpcionDuelo['tipo']) => boolean;
  seleccion: string[];
  onAccion: (a: AccionDuelo) => void;
  opciones: OpcionDuelo[];
  /** «Le toca a Agustín» mientras el rival piensa. */
  espera: string | null;
}) {
  const yo: Lado = 'jugador';
  // El selector abierto pertenece a un momento de la jugada; si el momento cambia, se cierra.
  // (Con un efecto se cerraba también si lo abrías justo cuando te llegaba el turno.)
  const momento = `${duelo.numeroMano}-${duelo.fase}-${duelo.lanceActual}-${duelo.turno}-${duelo.envite?.apuesta ?? 0}`;
  const [abierto, setAbierto] = useState<{ tipo: 'envido' | 'mas'; momento: string } | null>(null);
  const eligiendo = abierto?.momento === momento ? abierto.tipo : null;
  const setEligiendo = (tipo: 'envido' | 'mas' | null) => setAbierto(tipo ? { tipo, momento } : null);
  const minimo = (tipo: 'envido' | 'mas') => {
    const opcion = opciones.find((o) => o.tipo === tipo);
    return opcion && 'minimo' in opcion ? opcion.minimo : 2;
  };
  const tirarOrdago = useCallback(() => onAccion({ tipo: 'ordago', lado: yo }), [onAccion]);
  const hayAcciones = ['mus', 'descartar', 'trato', 'noQuiero', 'quiero', 'mas', 'paso', 'envido'].some((t) => puedo(t as OpcionDuelo['tipo']));

  return (
    <div className="botonera">
      {eligiendo && duelo.lanceActual && (
        <SelectorCantidad
          key={eligiendo}
          tipo={eligiendo}
          minimo={minimo(eligiendo)}
          alLance={ES.alLance[duelo.lanceActual]}
          enJuego={duelo.envite && duelo.envite.apuesta > 0 ? M.enJuego(duelo.envite.apuesta) : null}
          onElegir={(piedras) => onAccion(eligiendo === 'envido' ? { tipo: 'envido', lado: yo, piedras } : { tipo: 'mas', lado: yo, piedras })}
          onCerrar={() => setEligiendo(null)}
        />
      )}
      <div className="botonera__acciones">
        {!hayAcciones && espera && (
          <div className="botonera__espera" role="status">
            {espera}
            <span className="botonera__puntos" aria-hidden="true" />
          </div>
        )}
        {puedo('mus') && (
          <>
            <BotonApuesta onClick={() => onAccion({ tipo: 'corto', lado: yo })}>{M.botones.corto}</BotonApuesta>
            <BotonApuesta variante="gualda" onClick={() => onAccion({ tipo: 'mus', lado: yo })}>
              {M.botones.mus}
            </BotonApuesta>
          </>
        )}
        {puedo('descartar') && (
          <BotonApuesta
            variante="gualda"
            disabled={seleccion.length === 0}
            onClick={() => onAccion({ tipo: 'descartar', lado: yo, cartas: duelo.cartas.jugador.filter((c) => seleccion.includes(idCarta(c))) })}
          >
            {seleccion.length > 0 ? M.botones.descartar(seleccion.length) : M.eligeCartas}
          </BotonApuesta>
        )}
        {puedo('trato') && (
          <>
            <BotonApuesta variante="rendirse" onClick={() => onAccion({ tipo: 'trato', lado: yo, acepta: false })}>
              {M.botones.rechazarTrato}
            </BotonApuesta>
            <BotonApuesta variante="gualda" onClick={() => onAccion({ tipo: 'trato', lado: yo, acepta: true })}>
              {M.botones.aceptarTrato}
            </BotonApuesta>
          </>
        )}
        {puedo('noQuiero') && (
          <BotonApuesta variante="rendirse" onClick={() => onAccion({ tipo: 'noQuiero', lado: yo })}>
            {M.botones.noQuiero}
          </BotonApuesta>
        )}
        {puedo('quiero') && <BotonApuesta onClick={() => onAccion({ tipo: 'quiero', lado: yo })}>{M.botones.quiero}</BotonApuesta>}
        {puedo('mas') && (
          <BotonApuesta variante="gualda" aria-expanded={eligiendo === 'mas'} onClick={() => setEligiendo(eligiendo === 'mas' ? null : 'mas')}>
            {M.botones.masCorto}
          </BotonApuesta>
        )}
        {puedo('paso') && <BotonApuesta onClick={() => onAccion({ tipo: 'paso', lado: yo })}>{M.botones.paso}</BotonApuesta>}
        {puedo('envido') && (
          <BotonApuesta variante="gualda" aria-expanded={eligiendo === 'envido'} onClick={() => setEligiendo(eligiendo === 'envido' ? null : 'envido')}>
            {M.botones.envidoCorto}
          </BotonApuesta>
        )}
      </div>
      <BotonOrdago activo={puedo('ordago')} onTirar={tirarOrdago} texto={M.botones.ordago} ayuda={M.ayudaOrdago} />
    </div>
  );
}

/**
 * Cuánto envidar o subir, al estilo Offsuit: dos botones rápidos (dos y tres) y una barra para
 * cualquier cantidad del 4 al 19.
 */
function SelectorCantidad({
  tipo,
  minimo,
  alLance,
  enJuego,
  onElegir,
  onCerrar,
}: {
  tipo: 'envido' | 'mas';
  minimo: number;
  alLance: string;
  /** Lo que ya hay en juego, para no perderlo de vista al subir. */
  enJuego: string | null;
  onElegir: (piedras: number) => void;
  onCerrar: () => void;
}) {
  const desde = Math.max(BARRA.minimo, minimo);
  const [valor, setValor] = useState(desde);
  const nombre = (n: number) => (tipo === 'envido' ? M.botones.envido(n) : M.botones.mas(n));
  const cambiar = (n: number) => setValor(Math.max(desde, Math.min(BARRA.maximo, n)));
  const titulo = tipo === 'envido' ? M.envidar(alLance) : M.subir(alLance);
  const posicion = (valor - desde) / (BARRA.maximo - desde);

  return (
    <div className="panel panel--sombra cantidades" role="group" aria-label={titulo}>
      <div className="cantidades__cabecera">
        <span className="rotulo">{titulo}</span>
        {enJuego && <span className="cantidades__en-juego">{enJuego}</span>}
        <button type="button" className="cantidades__cerrar" aria-label={M.cancelar} onClick={onCerrar}>
          ✕
        </button>
      </div>
      <div className="cantidades__rapidas">
        {RAPIDAS.filter((n) => n >= minimo).map((n) => (
          <BotonApuesta key={n} variante="gualda" onClick={() => onElegir(n)}>
            {nombre(n)}
          </BotonApuesta>
        ))}
      </div>
      <div className="cantidades__barra">
        <button type="button" className="cantidades__paso" aria-label={M.menos} disabled={valor <= desde} onClick={() => cambiar(valor - 1)}>
          −
        </button>
        <div className="cantidades__deslizador">
          {/* El número va encima del tirador (30 px de ancho). */}
          <span className="cantidades__valor" style={{ left: `calc(15px + (100% - 30px) * ${posicion})` }}>
            {valor}
          </span>
          <input
            type="range"
            min={desde}
            max={BARRA.maximo}
            step={1}
            value={valor}
            aria-label={titulo}
            onChange={(e) => cambiar(Number(e.target.value))}
          />
          <div className="cantidades__extremos" aria-hidden="true">
            <span>{desde}</span>
            <span>{BARRA.maximo}</span>
          </div>
        </div>
        <button type="button" className="cantidades__paso" aria-label={M.unoMas} disabled={valor >= BARRA.maximo} onClick={() => cambiar(valor + 1)}>
          +
        </button>
      </div>
      <BotonApuesta variante="gualda" className="cantidades__confirmar" onClick={() => onElegir(valor)}>
        {nombre(valor)}
      </BotonApuesta>
    </div>
  );
}

/** Al acabar la mano: el recuento. Al acabar el duelo: el órdago o el resultado, y la revancha. */
function PanelFinal({
  duelo,
  textos,
  rivalActual,
  onSiguiente,
  onOtroDuelo,
  alAcabar,
  onSalir,
}: {
  duelo: EstadoDuelo;
  textos: TextosRival;
  rivalActual: IdRival;
  onSiguiente: () => void;
  onOtroDuelo: (rival: IdRival) => void;
  /** En la gira: al acabar el duelo se sigue con la gira (en vez de revancha). */
  alAcabar: (() => void) | null;
  onSalir: () => void;
}) {
  if (duelo.fase !== 'finMano' && duelo.fase !== 'finDuelo') return null;
  const nombre = (lado: Lado) => (lado === 'jugador' ? M.tu : textos.nombre);
  const ultimo = duelo.lances[duelo.lances.length - 1];
  const resultado = ultimo?.envite?.resultado;
  const porOrdago = duelo.fase === 'finDuelo' && duelo.motivoFin === 'ordago' && ultimo && resultado?.tipo === 'ordagoQuerido';
  const recuento = duelo.recuento;

  return (
    <div className="mesa__velo">
      <div className={clases('panel panel--sombra final', porOrdago && 'final--ordago')} role="dialog" aria-modal="true">
        {porOrdago ? (
          <>
            <div className="final__titulo">{M.ordagoA(ES.alLance[ultimo.lance])}</div>
            <div className="rotulo">{M.tiraOrdago(resultado.lanzador === 'jugador' ? null : textos.nombre)}</div>
            <ManosVistas duelo={duelo} nombre={nombre} />
          </>
        ) : recuento ? (
          <>
            <div className="final__titulo">
              {M.recuento} · {M.mano(duelo.numeroMano)}
            </div>
            <ManosVistas duelo={duelo} nombre={nombre} />
            <ul className="final__cobros">
              {recuento.cobros.length === 0 && <li>{M.nadaQueCobrar}</li>}
              {recuento.cobros.map((cobro, i) => (
                <li key={i} className={clases(i >= recuento.aplicados && 'final__cobro--sin-cobrar')}>
                  <span>{M.cobro(ES.lances[cobro.lance], ES.conceptos[cobro.concepto])}</span>
                  <span>
                    {nombre(cobro.lado)} +{cobro.piedras}
                    {i >= recuento.aplicados && ` (${M.sinCobrar})`}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <div className="final__marcador">
          {textos.nombre} {duelo.marcador.rival} · {M.tu} {duelo.marcador.jugador}
        </div>
        {duelo.fase === 'finDuelo' && duelo.ganador && (
          <div className="final__resultado">
            {duelo.ganador === 'jugador' ? M.hasGanado : M.teGana(textos.nombre)}
            <span className="final__motivo">{duelo.motivoFin === 'ordago' ? M.porOrdago : M.aPiedras}</span>
          </div>
        )}
        {duelo.fase === 'finMano' ? (
          <BotonApuesta variante="gualda" className="final__boton" onClick={onSiguiente} autoFocus>
            {M.botones.siguienteMano}
          </BotonApuesta>
        ) : alAcabar ? (
          <BotonApuesta variante="gualda" className="final__boton" onClick={alAcabar} autoFocus>
            {ES.gira.finDuelo}
          </BotonApuesta>
        ) : (
          <>
            <BotonApuesta variante="gualda" className="final__boton" onClick={() => onOtroDuelo(rivalActual)} autoFocus>
              {M.botones.revancha}
            </BotonApuesta>
            <ListaDeRivales actual={rivalActual} titulo={M.contra} onElegir={onOtroDuelo} sinElActual />
            <BotonApuesta variante="rendirse" className="final__boton" onClick={onSalir}>
              {ES.gira.mesa.portada}
            </BotonApuesta>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * La bolsa (gira): un botón redondo arriba a la izquierda con cuántas cosas se pueden usar ahora.
 * Al tocarlo se abre el panel con el compañero y lo que llevas.
 */
function BotonBolsa({ partida, bolsa, onAbrir }: { partida: Partida; bolsa: Bolsa; onAbrir: () => void }) {
  const usables =
    bolsa.unUso.filter((id) => puedeUsarObjeto(partida, id)).length +
    bolsa.amuletos.filter((id) => puedeUsarObjeto(partida, id)).length +
    (puedeUsarSena(partida) ? 1 : 0);
  return (
    <button type="button" className="mesa__bolsa" onClick={onAbrir} aria-label={`${G.bolsa.titulo}: ${usables}`}>
      {G.bolsa.boton}
      {usables > 0 && <span className="mesa__bolsa-cuenta">{usables}</span>}
    </button>
  );
}

/** El panel de la bolsa: la seña del compañero y cada objeto, explicados, con su botón. */
function PanelBolsa({
  partida,
  bolsa,
  onUsar,
  onSena,
  onCerrar,
}: {
  partida: Partida;
  bolsa: Bolsa;
  onUsar: (id: IdObjeto) => void;
  onSena: () => void;
  onCerrar: () => void;
}) {
  const { companero } = partida.extras;
  const cosas = [...bolsa.unUso, ...bolsa.amuletos];
  return (
    <div className="mesa__velo mesa__velo--bolsa" onClick={onCerrar}>
      <div className="panel panel--sombra bolsa" role="dialog" aria-modal="true" aria-label={G.bolsa.titulo} onClick={(e) => e.stopPropagation()}>
        <div className="bolsa__cabecera">
          <b className="bolsa__titulo">{G.bolsa.titulo}</b>
          <button type="button" className="bolsa__cerrar" onClick={onCerrar}>
            ✕ {G.bolsa.cerrar}
          </button>
        </div>
        {companero && (
          <div className="bolsa__fila">
            <span className="marcador marcador--redondo bolsa__icono">{ES.companeros[companero].nombre.split(' ').at(-1)}</span>
            <div className="bolsa__texto">
              <b>{G.bolsa.senaDe(ES.companeros[companero].nombre, senasQueQuedan(partida), COMPANEROS[companero].senas)}</b>
              <i>{ES.companeros[companero].sena}</i>
            </div>
            <BotonApuesta variante="gualda" className="bolsa__boton" disabled={!puedeUsarSena(partida)} onClick={onSena}>
              {G.bolsa.sena}
            </BotonApuesta>
          </div>
        )}
        {cosas.map((id, i) => {
          const usable = OBJETOS[id].tipo !== 'amuleto';
          return (
            <div key={`${id}-${i}`} className="bolsa__fila">
              <span className="marcador bolsa__icono">{ES.objetos[id].nombre.split(' ')[0]}</span>
              <div className="bolsa__texto">
                <b>{ES.objetos[id].nombre}</b>
                <i>{ES.objetos[id].efecto}</i>
              </div>
              {usable ? (
                <BotonApuesta className="bolsa__boton" disabled={!puedeUsarObjeto(partida, id)} onClick={() => onUsar(id)}>
                  {G.bolsa.usar}
                </BotonApuesta>
              ) : (
                <span className="bolsa__puesto">{G.bolsa.puesto}</span>
              )}
            </div>
          );
        })}
        {cosas.length === 0 && <p className="bolsa__vacia">{G.bolsa.vacia}</p>}
      </div>
    </div>
  );
}

function ListaDeRivales({
  actual,
  titulo,
  onElegir,
  sinElActual = false,
}: {
  actual: IdRival;
  titulo: string;
  onElegir: (rival: IdRival) => void;
  sinElActual?: boolean;
}) {
  return (
    <div className="rivales">
      {titulo && <div className="rotulo">{titulo}</div>}
      <div className="rivales__lista">
        {ORDEN_RIVALES.filter((id) => !sinElActual || id !== actual).map((id) => (
          <button
            key={id}
            type="button"
            className={clases('rivales__rival', id === actual && 'rivales__rival--actual')}
            onClick={() => onElegir(id)}
          >
            {ES.rivales[id].nombre}
          </button>
        ))}
      </div>
    </div>
  );
}

function SelectorDeRival({ actual, onElegir, onCancelar }: { actual: IdRival; onElegir: (rival: IdRival) => void; onCancelar: () => void }) {
  return (
    <div className="mesa__velo mesa__velo--encima">
      <div className="panel panel--sombra final" role="dialog" aria-modal="true" aria-label={M.elegirRival}>
        <div className="final__titulo">{M.elegirRival}</div>
        <div className="final__motivo">{M.elegirRivalNota}</div>
        <ListaDeRivales actual={actual} titulo="" onElegir={onElegir} />
        <BotonApuesta variante="rendirse" className="final__boton" onClick={onCancelar}>
          {M.cancelar}
        </BotonApuesta>
      </div>
    </div>
  );
}

function ManosVistas({ duelo, nombre }: { duelo: EstadoDuelo; nombre: (lado: Lado) => string }) {
  return (
    <div className="final__manos">
      {(['rival', 'jugador'] as const).map((lado) => (
        <div key={lado} className="final__mano">
          <div className="rotulo">{nombre(lado)}</div>
          <div className="final__cartas">
            {duelo.cartas[lado].map((carta) => (
              <CartaVista key={idCarta(carta)} carta={carta} className="carta--pequena" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PanelDepuracion({ estado, textos, onCara }: { estado: EstadoMesa; textos: TextosRival; onCara: (delta: number) => void }) {
  const { partida } = estado;
  const duelo = partida.duelo;
  const cartas = duelo.cartas.rival;
  const clave = cartas.map(idCarta).join() + duelo.quienEsMano;
  const fuerza = useMemo(
    () => calcularFuerza(cartas, duelo.quienEsMano === 'rival', duelo.reglas.modoReyes),
    // Solo cambia si cambian sus cartas o quién es mano.
    [clave],
  );
  const decision = estado.decision;
  const motivo =
    decision?.tipo === 'envite'
      ? `${ES.lances[decision.lance]}: ${decision.envite.motivo}`
      : decision?.tipo === 'mus'
        ? `${decision.mus.corta ? 'corta' : 'mus'}${decision.mus.motivo ? ` (${decision.mus.motivo})` : ''}`
        : decision?.tipo === 'descarte'
          ? 'descarta'
          : '—';
  const m = partida.memoria;
  return (
    <div className="depuracion" aria-label={M.depuracionTitulo}>
      <div className="depuracion__titulo">{M.depuracionTitulo}</div>
      <div>
        {M.depuracionCartas(textos.nombre)}: {cartas.map(cartaCorta).join(' ')}
      </div>
      <div>F · {LANCES.map((lance) => `${ES.lances[lance].slice(0, 3)} ${fuerza[lance].toFixed(2).replace('.', ',')}`).join(' · ')}</div>
      <div>
        {M.depuracionUltima}: {motivo}
      </div>
      <div>{M.depuracionMemoria(m.envitesJugador, m.farolesDescubiertos, m.lancesPerdidosSeguidos, m.manosEnfadado)}</div>
      <div>{M.depuracionReglas(m.penitencia, m.tratoUsado, m.cambioUsado, m.ofendidaHastaMano)}</div>
      <div className="depuracion__cara">
        {M.depuracionCara(partida.caraJugador, partida.expuesto)}
        <button type="button" onClick={() => onCara(-10)}>
          −10
        </button>
        <button type="button" onClick={() => onCara(10)}>
          +10
        </button>
      </div>
    </div>
  );
}

/**
 * Modo de pruebas: los botones Rival y Depurar, solo mientras el juego está en desarrollo.
 * Se activa con `?pruebas` en la dirección (también en `npm run dev`).
 */
function useModoPruebas(): boolean {
  return useMemo(() => import.meta.env.DEV || new URLSearchParams(window.location.search).has('pruebas'), []);
}

/** Panel de depuración del modo de pruebas: `?depuracion`, la tecla D o el botón «Depurar». */
function useDepuracion(pruebas: boolean): [boolean, () => void] {
  const [activa, setActiva] = useState(() => pruebas && new URLSearchParams(window.location.search).has('depuracion'));
  const alternar = useCallback(() => setActiva((a) => !a), []);
  useEffect(() => {
    if (!pruebas) return undefined;
    const tecla = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'd' && !e.ctrlKey && !e.metaKey && !e.altKey) alternar();
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [alternar, pruebas]);
  return [activa, alternar];
}
