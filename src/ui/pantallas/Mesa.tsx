import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { ORDEN_RIVALES, type IdRival } from '../../datos/rivales';
import { useDuelo } from '../../estado/useDuelo';
import { textosDe, type EstadoMesa } from '../../estado/mesa';
import { idCarta, type Carta } from '../../nucleo/carta';
import type { Lado } from '../../nucleo/comun';
import { accionesValidas, type AccionDuelo, type EstadoDuelo, type OpcionDuelo } from '../../nucleo/duelo';
import { calcularFuerza } from '../../nucleo/ia/fuerza';
import { LANCES, type Lance } from '../../nucleo/lances';
import { cartaCorta, ES, type TextosRival } from '../../textos/es';
import { BotonOrdago } from '../componentes/BotonOrdago';
import { Escenario } from '../componentes/Escenario';
import {
  BarraCara,
  Bocadillo,
  BotonApuesta,
  CartaReverso,
  CartaVista,
  clases,
  EtiquetaNombre,
  FilaLances,
  MarcadorPiedras,
  Panel,
} from '../componentes/piezas';
import { Retrato } from '../componentes/Retrato';
import './mesa.css';

const M = ES.mesa;
const CANTIDADES = [2, 3, 5, 10];
/** Abanico de la mano (referencias/pantallas/03_mesa): posición y giro de cada carta. */
const ABANICO = [
  { left: 0, top: 14, giro: -9 },
  { left: 112, top: 2, giro: -3 },
  { left: 224, top: 2, giro: 3 },
  { left: 336, top: 14, giro: 9 },
];
const ABANICO_RIVAL = [
  { left: 0, top: 4, giro: -8 },
  { left: 46, top: 0, giro: -3 },
  { left: 92, top: 0, giro: 3 },
  { left: 138, top: 4, giro: 8 },
];
/** Lo que hay que mantener pulsado el retrato para empezar a mirar. */
const PULSACION_LARGA = 250;

/** La mesa: un duelo contra uno de los cinco rivales. */
export function Mesa() {
  const { estado, jugar, nuevoDuelo, mirar, mirando, setMirando, cambiarCara, rivalPiensa } = useDuelo();
  const [depuracion, alternarDepuracion] = useDepuracion();
  const [eligiendoRival, setEligiendoRival] = useState(false);
  const { partida } = estado;
  const duelo = partida.duelo;
  const textos = textosDe(partida);
  const { lado: quienActua, opciones } = accionesValidas(duelo);
  const puedo = (tipo: OpcionDuelo['tipo']) => quienActua === 'jugador' && opciones.some((o) => o.tipo === tipo);

  const [seleccion, setSeleccion] = useState<string[]>([]);
  const [cantidad, setCantidad] = useState(2);
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
        <Retrato
          id={partida.rivalId}
          nombre={textos.titulo}
          tic={estado.tic}
          acotacion={estado.tic ? (textos.tics[estado.tic.id] ?? null) : null}
          depuracion={depuracion && estado.tic ? M.depuracionTic(estado.tic.verdadero, textos.significadoTics[estado.tic.id] ?? '') : null}
          textoPendiente={M.artePendiente}
        />
        {mirando && <div className="mesa__penumbra" />}
        <div className="mesa__madera" />
        <div className="mesa__tapete" />
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
        <Bocadillo
          className="mesa__bocadillo"
          accion={rivalPiensa ? '…' : estado.bocadillo.accion}
          frase={rivalPiensa ? undefined : estado.bocadillo.frase}
        />

        <div className="mesa__cartas-rival" aria-label={M.susCartas(textos.nombre)}>
          {ABANICO_RIVAL.map((p, i) => (
            <CartaReverso key={i} className="carta--rival" style={{ left: p.left, top: p.top, transform: `rotate(${p.giro}deg)` }} />
          ))}
        </div>

        <ManoDelJugador cartas={duelo.cartas.jugador} seleccionables={descartando} seleccion={seleccion} onAlternar={alternarCarta} />
        {estado.delJugador && (
          <div className="mesa__dicho" aria-live="polite">
            <span className="rotulo">{M.tu}</span>
            {estado.delJugador}
          </div>
        )}
        {estado.seTeNota && (
          <div key={estado.seTeNota} className="mesa__se-te-nota" role="status">
            {M.seTeNota}
          </div>
        )}

        <ColumnaIzquierda estado={estado} textos={textos} />
        <Cronica lineas={estado.cronica} />

        <div className="mesa__arriba-derecha">
          <div className="mesa__titulo-duelo">{M.tituloDuelo(textos.comarca)}</div>
          <button type="button" className="mesa__boton-pequeno" onClick={() => setEligiendoRival(true)}>
            {M.rival}
          </button>
          <button type="button" className="mesa__boton-pequeno" aria-pressed={depuracion} onClick={alternarDepuracion}>
            {M.depurar}
          </button>
        </div>

        <ColumnaDerecha
          duelo={duelo}
          textos={textos}
          rivalPiensa={rivalPiensa}
          puedo={puedo}
          cantidad={cantidad}
          onCantidad={setCantidad}
          seleccion={seleccion}
          onAccion={jugar}
          opciones={opciones}
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

function ColumnaIzquierda({ estado, textos }: { estado: EstadoMesa; textos: TextosRival }) {
  const { partida, avisoCara } = estado;
  const duelo = partida.duelo;
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
  const esManoJugador = duelo.quienEsMano === 'jugador';
  return (
    <>
      <div className="mesa__lances">
        <FilaLances lances={fila} />
      </div>
      <div className="mesa__marcador">
        <MarcadorPiedras
          titulo={M.marcador}
          insignia={{ texto: esManoJugador ? M.eresMano : M.esMano, destacada: esManoJugador }}
          filas={[
            { nombre: textos.nombre, piedras: duelo.marcador.rival },
            { nombre: M.tu, piedras: duelo.marcador.jugador },
          ]}
        />
      </div>
      <div className="mesa__cara">
        <BarraCara valor={partida.caraJugador} titulo={M.tuCara} zonas={M.zonasCara} />
        {partida.expuesto && <span className="mesa__expuesto">{M.expuesto}</span>}
        {avisoCara && (
          <div key={avisoCara.clave} className={clases('mesa__aviso-cara', avisoCara.delta < 0 && 'mesa__aviso-cara--baja')} role="status">
            <strong>{M.cambioCara(avisoCara.delta)}</strong>
            {avisoCara.motivos.join(' · ')}
          </div>
        )}
      </div>
    </>
  );
}

function Cronica({ lineas }: { lineas: string[] }) {
  if (lineas.length === 0) return null;
  return (
    <ol className="mesa__cronica" aria-label="Lo último">
      {lineas.map((linea, i) => (
        <li key={`${i}-${linea}`}>{linea}</li>
      ))}
    </ol>
  );
}

function ColumnaDerecha({
  duelo,
  textos,
  rivalPiensa,
  puedo,
  cantidad,
  onCantidad,
  seleccion,
  onAccion,
  opciones,
}: {
  duelo: EstadoDuelo;
  textos: TextosRival;
  rivalPiensa: boolean;
  puedo: (tipo: OpcionDuelo['tipo']) => boolean;
  cantidad: number;
  onCantidad: (n: number) => void;
  seleccion: string[];
  onAccion: (a: AccionDuelo) => void;
  opciones: OpcionDuelo[];
}) {
  const yo: Lado = 'jugador';
  const envite = duelo.envite;
  const minimo = (tipo: 'envido' | 'mas') => {
    const opcion = opciones.find((o) => o.tipo === tipo);
    return opcion && 'minimo' in opcion ? opcion.minimo : 2;
  };

  let rotulo = '';
  let principal = '';
  if (duelo.fase === 'mus') {
    principal = M.musOCorto;
    rotulo = duelo.turno === 'jugador' && duelo.quienEsMano === 'rival' ? M.pideMus(textos.nombre) : M.mano(duelo.numeroMano);
  } else if (duelo.fase === 'descarte') {
    rotulo = M.mano(duelo.numeroMano);
    principal = M.tocaDescartar;
  } else if (duelo.fase === 'envite' && duelo.lanceActual && envite) {
    rotulo = M.enJuego(ES.alLance[duelo.lanceActual]);
    principal = envite.ordago ? M.dueloEntero : envite.apuesta > 0 ? M.piedras(envite.apuesta) : M.sinEnvite;
  } else if (duelo.fase === 'trato') {
    rotulo = M.trato;
    principal = M.tratoExplica(textos.nombre);
  } else {
    rotulo = M.mano(duelo.numeroMano);
  }

  const elegir = (
    <div className="cantidades" role="radiogroup" aria-label={M.cantidad}>
      {CANTIDADES.map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={cantidad === n}
          className={clases('cantidad', cantidad === n && 'cantidad--elegida')}
          onClick={() => onCantidad(n)}
        >
          {n}
        </button>
      ))}
    </div>
  );

  return (
    <div className="mesa__derecha">
      <Panel className="en-juego">
        <div className="rotulo en-juego__rotulo">{rotulo}</div>
        {principal && (
          <div
            className={clases(
              'en-juego__principal',
              principal.length > 11 && 'en-juego__principal--largo',
              principal.length > 40 && 'en-juego__principal--explicacion',
            )}
          >
            {principal}
          </div>
        )}
        {rivalPiensa && <div className="en-juego__piensa">{M.piensa(textos.nombre)}</div>}
      </Panel>

      <div className="mesa__botones">
        {puedo('mus') && (
          <>
            <BotonApuesta variante="gualda" onClick={() => onAccion({ tipo: 'mus', lado: yo })}>
              {M.botones.mus}
            </BotonApuesta>
            <BotonApuesta onClick={() => onAccion({ tipo: 'corto', lado: yo })}>{M.botones.corto}</BotonApuesta>
          </>
        )}
        {puedo('descartar') && (
          <BotonApuesta
            variante="gualda"
            disabled={seleccion.length === 0}
            onClick={() => {
              const cartas = duelo.cartas.jugador.filter((c) => seleccion.includes(idCarta(c)));
              onAccion({ tipo: 'descartar', lado: yo, cartas });
            }}
          >
            {M.botones.descartar(seleccion.length)}
          </BotonApuesta>
        )}
        {puedo('trato') && (
          <>
            <BotonApuesta variante="gualda" onClick={() => onAccion({ tipo: 'trato', lado: yo, acepta: true })}>
              {M.botones.aceptarTrato}
            </BotonApuesta>
            <BotonApuesta variante="rendirse" onClick={() => onAccion({ tipo: 'trato', lado: yo, acepta: false })}>
              {M.botones.rechazarTrato}
            </BotonApuesta>
          </>
        )}
        {puedo('quiero') && (
          <>
            <BotonApuesta onClick={() => onAccion({ tipo: 'quiero', lado: yo })}>{M.botones.quiero}</BotonApuesta>
            <BotonApuesta variante="rendirse" onClick={() => onAccion({ tipo: 'noQuiero', lado: yo })}>
              {M.botones.noQuiero}
            </BotonApuesta>
          </>
        )}
        {puedo('mas') && (
          <>
            <BotonApuesta variante="gualda" onClick={() => onAccion({ tipo: 'mas', lado: yo, piedras: Math.max(cantidad, minimo('mas')) })}>
              {M.botones.mas(Math.max(cantidad, minimo('mas')))}
            </BotonApuesta>
            {elegir}
          </>
        )}
        {puedo('paso') && <BotonApuesta onClick={() => onAccion({ tipo: 'paso', lado: yo })}>{M.botones.paso}</BotonApuesta>}
        {puedo('envido') && (
          <>
            <BotonApuesta
              variante="gualda"
              onClick={() => onAccion({ tipo: 'envido', lado: yo, piedras: Math.max(cantidad, minimo('envido')) })}
            >
              {M.botones.envido(Math.max(cantidad, minimo('envido')))}
            </BotonApuesta>
            {elegir}
          </>
        )}
      </div>

      <BotonOrdago
        activo={puedo('ordago')}
        onTirar={() => onAccion({ tipo: 'ordago', lado: yo })}
        texto={M.botones.ordago}
        pista={M.deslizaOrdago}
        ayuda={M.ayudaOrdago}
      />
    </div>
  );
}

/** Al acabar la mano: el recuento. Al acabar el duelo: el órdago o el resultado, y el siguiente rival. */
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
              {M.botones.otroDuelo}
            </BotonApuesta>
            <ListaDeRivales actual={rivalActual} titulo={M.contra} onElegir={onOtroDuelo} />
          </>
        )}
      </div>
    </div>
  );
}

function ListaDeRivales({ actual, titulo, onElegir }: { actual: IdRival; titulo: string; onElegir: (rival: IdRival) => void }) {
  return (
    <div className="rivales">
      <div className="rotulo">{titulo}</div>
      <div className="rivales__lista">
        {ORDEN_RIVALES.map((id) => (
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

/** Modo de depuración: `?depuracion` en la dirección, la tecla D o el botón «Depurar». */
function useDepuracion(): [boolean, () => void] {
  const [activa, setActiva] = useState(() => new URLSearchParams(window.location.search).has('depuracion'));
  const alternar = useCallback(() => setActiva((a) => !a), []);
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'd' && !e.ctrlKey && !e.metaKey && !e.altKey) alternar();
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [alternar]);
  return [activa, alternar];
}
