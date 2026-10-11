import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { ORDEN_RIVALES, type IdRival } from '../../datos/rivales';
import { useDuelo } from '../../estado/useDuelo';
import { textosDe, ultimoDelRival, type EstadoMesa, type LineaActa } from '../../estado/mesa';
import { idCarta, type Carta } from '../../nucleo/carta';
import type { Lado } from '../../nucleo/comun';
import { accionesValidas, type AccionDuelo, type EstadoDuelo, type OpcionDuelo } from '../../nucleo/duelo';
import { calcularFuerza } from '../../nucleo/ia/fuerza';
import { LANCES, type Lance } from '../../nucleo/lances';
import { cartaCorta, ES, type TextosRival } from '../../textos/es';
import { BotonOrdago } from '../componentes/BotonOrdago';
import { Escenario } from '../componentes/Escenario';
import { BarraCara, BotonApuesta, CartaReverso, CartaVista, clases, EtiquetaNombre, FilaLances } from '../componentes/piezas';
import { Retrato } from '../componentes/Retrato';
import './mesa.css';

const M = ES.mesa;
/** Envites rápidos; el resto, con la barra. */
const RAPIDAS = [2, 3];
const BARRA = { minimo: 4, maximo: 19 };
/** Líneas del acta que se ven sin abrirla. */
const LINEAS_VISIBLES = 3;
/** Abanico de la mano: posición y giro de cada carta (escenario vertical de 390 × 844). */
const ABANICO = [
  { left: 0, top: 8, giro: -9 },
  { left: 66, top: 2, giro: -3 },
  { left: 132, top: 2, giro: 3 },
  { left: 198, top: 8, giro: 9 },
];
const ABANICO_RIVAL = [
  { left: 0, top: 3, giro: -8 },
  { left: 32, top: 0, giro: -3 },
  { left: 64, top: 0, giro: 3 },
  { left: 96, top: 3, giro: 8 },
];
/** Lo que hay que mantener pulsado el retrato para empezar a mirar. */
const PULSACION_LARGA = 250;

/** La mesa: un duelo contra uno de los cinco rivales, en vertical. */
export function Mesa() {
  const { estado, jugar, nuevoDuelo, mirar, mirando, setMirando, cambiarCara, rivalPiensa } = useDuelo();
  const pruebas = useModoPruebas();
  const [depuracion, alternarDepuracion] = useDepuracion(pruebas);
  const [eligiendoRival, setEligiendoRival] = useState(false);
  const { partida } = estado;
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

        <Marcador duelo={duelo} textos={textos} />
        <ColumnaCara estado={estado} />

        <Retrato
          id={partida.rivalId}
          nombre={textos.titulo}
          tic={estado.tic}
          acotacion={estado.tic ? (textos.tics[estado.tic.id] ?? null) : null}
          depuracion={depuracion && estado.tic ? M.depuracionTic(estado.tic.verdadero, textos.significadoTics[estado.tic.id] ?? '') : null}
          textoPendiente={M.artePendiente}
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
        <EtiquetaNombre className="mesa__nombre">
          {textos.etiqueta}
          {partida.memoria.manosEnfadado > 0 && <span className="mesa__enfado">{M.enfadado}</span>}
        </EtiquetaNombre>
        {pruebas && (
          <div className="mesa__pruebas">
            <button type="button" className="mesa__boton-pequeno" onClick={() => setEligiendoRival(true)}>
              {M.rival}
            </button>
            <button type="button" className="mesa__boton-pequeno" aria-pressed={depuracion} onClick={alternarDepuracion}>
              {M.depurar}
            </button>
          </div>
        )}

        <Acta duelo={duelo} acta={estado.acta} textos={textos} />

        <div className="mesa__madera" />
        <div className="mesa__tapete" />
        <div className="mesa__cartas-rival" aria-label={M.susCartas(textos.nombre)}>
          {ABANICO_RIVAL.map((p, i) => (
            <CartaReverso key={i} className="carta--rival" style={{ left: p.left, top: p.top, transform: `rotate(${p.giro}deg)` }} />
          ))}
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
        />
        {eligiendoRival && (
          <SelectorDeRival actual={partida.rivalId} onElegir={elegirRival} onCancelar={() => setEligiendoRival(false)} />
        )}
      </div>
    </Escenario>
  );
}

/** Marcador de arriba: solo los números, el rival a la izquierda y tú a la derecha. */
function Marcador({ duelo, textos }: { duelo: EstadoDuelo; textos: TextosRival }) {
  const jugados = new Set(duelo.lances.map((l) => l.lance));
  const terminada = duelo.fase === 'finMano' || duelo.fase === 'finDuelo' || duelo.fase === 'trato';
  const hayPunto = jugados.has('punto') || duelo.lanceActual === 'punto';
  const fila = (['grande', 'chica', 'pares', hayPunto ? 'punto' : 'juego'] as Lance[]).map((lance) => ({
    etiqueta: ES.lances[lance],
    estado: (duelo.lanceActual === lance && !terminada ? 'actual' : jugados.has(lance) || terminada ? 'jugado' : 'pendiente') as
      | 'actual'
      | 'jugado'
      | 'pendiente',
  }));
  const lado = (quien: Lado, nombre: string) => (
    <div className={clases('marcador-simple__lado', quien === 'jugador' && 'marcador-simple__lado--tu')}>
      <span className="rotulo">{nombre}</span>
      <span className="marcador-simple__numero">{duelo.marcador[quien]}</span>
      {duelo.quienEsMano === quien && (
        <span className={clases('insignia', quien === 'jugador' && 'insignia--anil')} title={M.ayudaMano}>
          {M.esMano}
        </span>
      )}
    </div>
  );
  return (
    <div className="panel mesa__marcador" aria-label={`${textos.nombre} ${duelo.marcador.rival}, tú ${duelo.marcador.jugador}`}>
      {lado('rival', textos.nombre)}
      <div className="marcador-simple__centro">
        <span className="rotulo">{M.marcador}</span>
        <FilaLances lances={fila} />
      </div>
      {lado('jugador', M.tu)}
    </div>
  );
}

function ColumnaCara({ estado }: { estado: EstadoMesa }) {
  const { partida, avisoCara, seTeNota } = estado;
  return (
    <div className="mesa__cara">
      <BarraCara
        valor={partida.caraJugador}
        titulo={M.tuCara}
        zonas={M.zonasCara}
        etiqueta={partida.expuesto ? <span className="mesa__expuesto">{M.expuesto}</span> : undefined}
      />
      <div className="mesa__avisos">
        {avisoCara && (
          <div key={avisoCara.clave} className={clases('mesa__aviso', avisoCara.delta < 0 && 'mesa__aviso--baja')} role="status">
            <strong>{M.cambioCara(avisoCara.delta)}</strong> {avisoCara.motivos.join(' · ')}
          </div>
        )}
        {seTeNota && (
          <div key={seTeNota} className="mesa__aviso mesa__aviso--pulso" role="status">
            {M.seTeNota}
          </div>
        )}
      </div>
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
 * El acta de la mano, en un solo sitio bajo el retrato: arriba en qué lance estamos y qué hay
 * en juego; debajo, lo último que se ha dicho (lo más reciente, más marcado). Se puede abrir
 * para ver la mano entera.
 */
function Acta({ duelo, acta, textos }: { duelo: EstadoDuelo; acta: LineaActa[]; textos: TextosRival }) {
  const [abierta, setAbierta] = useState(false);
  useEffect(() => setAbierta(false), [duelo.numeroMano]);
  const { titulo, enJuego, destacado } = cabeceraActa(duelo);
  const desde = abierta ? 0 : Math.max(0, acta.length - LINEAS_VISIBLES);
  const conFrase = ultimoDelRival(acta);
  const ultima = acta.length - 1;

  return (
    <section className={clases('panel panel--sombra acta', abierta && 'acta--abierta')} aria-label="Lo que pasa en la mano">
      <span className="acta__cola" aria-hidden="true" />
      <div className="acta__cabecera">
        <span className="rotulo">{titulo}</span>
        {enJuego && <span className={clases('acta__en-juego', destacado && 'acta__en-juego--destacado')}>{enJuego}</span>}
      </div>
      <ol className="acta__lineas" aria-live="polite">
        {acta.slice(desde).map((linea, i) => {
          const indice = desde + i;
          return (
            <li
              key={indice}
              className={clases('acta__linea', `acta__linea--${linea.quien ?? 'mesa'}`, indice === ultima && 'acta__linea--ultima')}
            >
              {linea.quien && <span className="acta__quien">{linea.quien === 'rival' ? textos.nombre : M.tu}</span>}
              <span className="acta__texto">{linea.texto}</span>
              {linea.frase && indice === conFrase && <span className="acta__frase">{linea.frase}</span>}
            </li>
          );
        })}
      </ol>
      {acta.length > LINEAS_VISIBLES && (
        <button type="button" className="acta__ver" aria-expanded={abierta} onClick={() => setAbierta((a) => !a)}>
          {abierta ? `▴ ${M.cerrarMano}` : `▾ ${M.verMano}`}
        </button>
      )}
    </section>
  );
}

function cabeceraActa(duelo: EstadoDuelo): { titulo: string; enJuego: string; destacado: boolean } {
  const mano = M.mano(duelo.numeroMano);
  switch (duelo.fase) {
    case 'mus':
      return { titulo: `${M.fases.mus} · ${mano}`, enJuego: '', destacado: false };
    case 'descarte':
      return { titulo: `${M.fases.descarte} · ${mano}`, enJuego: '', destacado: false };
    case 'trato':
      return { titulo: M.fases.trato, enJuego: '', destacado: false };
    case 'envite': {
      const envite = duelo.envite;
      const titulo = duelo.lanceActual ? ES.lances[duelo.lanceActual] : mano;
      if (!envite) return { titulo, enJuego: '', destacado: false };
      if (envite.ordago) return { titulo, enJuego: M.dueloEntero, destacado: true };
      return envite.apuesta > 0
        ? { titulo, enJuego: M.enJuego(envite.apuesta), destacado: true }
        : { titulo, enJuego: M.sinEnvite, destacado: false };
    }
    default:
      return { titulo: `${M.fases.recuento} · ${mano}`, enJuego: '', destacado: false };
  }
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
  /** «Le toca a Ruperto» mientras el rival piensa. */
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
}: {
  duelo: EstadoDuelo;
  textos: TextosRival;
  rivalActual: IdRival;
  onSiguiente: () => void;
  onOtroDuelo: (rival: IdRival) => void;
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
        ) : (
          <>
            <BotonApuesta variante="gualda" className="final__boton" onClick={() => onOtroDuelo(rivalActual)} autoFocus>
              {M.botones.revancha}
            </BotonApuesta>
            <ListaDeRivales actual={rivalActual} titulo={M.contra} onElegir={onOtroDuelo} sinElActual />
          </>
        )}
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
