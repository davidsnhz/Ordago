import { useCallback, useEffect, useMemo, useState } from 'react';
import { IA } from '../../datos/ia';
import { useDuelo } from '../../estado/useDuelo';
import type { EstadoMesa } from '../../estado/mesa';
import { idCarta, type Carta } from '../../nucleo/carta';
import type { Lado } from '../../nucleo/comun';
import { accionesValidas, type AccionDuelo, type EstadoDuelo, type OpcionDuelo } from '../../nucleo/duelo';
import { calcularFuerza } from '../../nucleo/ia/fuerza';
import { LANCES, type Lance } from '../../nucleo/lances';
import { cartaCorta, ES } from '../../textos/es';
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
const RIVAL = ES.rivales.ruperto;
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

/** La mesa: un duelo contra Ruperto. */
export function Mesa() {
  const { estado, jugar, nuevoDuelo, rivalPiensa } = useDuelo();
  const [depuracion, alternarDepuracion] = useDepuracion();
  const duelo = estado.partida.duelo;
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
  const accion = (a: AccionDuelo) => jugar(a);

  return (
    <Escenario avisoGirar={M.girar}>
      <div className="mesa">
        <div className="mesa__pared" />
        <div className="mesa__luz" />
        <Retrato
          id="ruperto"
          nombre={RIVAL.titulo}
          tic={estado.tic}
          acotacion={estado.tic ? (RIVAL.tics[estado.tic.id] ?? null) : null}
          depuracion={depuracion && estado.tic ? M.depuracionTic(estado.tic.verdadero, RIVAL.significadoTics[estado.tic.id] ?? '') : null}
          textoPendiente={M.artePendiente}
        />
        <div className="mesa__madera" />
        <div className="mesa__tapete" />

        <EtiquetaNombre className="mesa__nombre">
          {RIVAL.etiqueta}
          {estado.partida.memoria.manosEnfadado > 0 && <span className="mesa__enfado">{M.enfadado}</span>}
        </EtiquetaNombre>
        <Bocadillo className="mesa__bocadillo" accion={rivalPiensa ? '…' : estado.bocadillo.accion} frase={rivalPiensa ? undefined : estado.bocadillo.frase} />

        <div className="mesa__cartas-rival" aria-label={M.susCartas(RIVAL.nombre)}>
          {ABANICO_RIVAL.map((p, i) => (
            <CartaReverso key={i} className="carta--rival" style={{ left: p.left, top: p.top, transform: `rotate(${p.giro}deg)` }} />
          ))}
        </div>

        <ManoDelJugador
          cartas={duelo.cartas.jugador}
          seleccionables={descartando}
          seleccion={seleccion}
          onAlternar={alternarCarta}
        />
        {estado.delJugador && (
          <div className="mesa__dicho" aria-live="polite">
            <span className="rotulo">{M.tu}</span>
            {estado.delJugador}
          </div>
        )}

        <ColumnaIzquierda duelo={duelo} />
        <Cronica lineas={estado.cronica} />

        <div className="mesa__arriba-derecha">
          <div className="mesa__titulo-duelo">{M.tituloDuelo}</div>
          <button type="button" className="mesa__boton-pequeno" aria-pressed={depuracion} onClick={alternarDepuracion}>
            {M.depurar}
          </button>
        </div>

        <ColumnaDerecha
          duelo={duelo}
          rivalPiensa={rivalPiensa}
          puedo={puedo}
          cantidad={cantidad}
          onCantidad={setCantidad}
          seleccion={seleccion}
          onAccion={accion}
          opciones={opciones}
        />

        {depuracion && <PanelDepuracion estado={estado} />}
        <PanelFinal duelo={duelo} onSiguiente={() => accion({ tipo: 'siguienteMano' })} onOtroDuelo={nuevoDuelo} />
      </div>
    </Escenario>
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

function ColumnaIzquierda({ duelo }: { duelo: EstadoDuelo }) {
  const jugados = new Set(duelo.lances.map((l) => l.lance));
  const terminada = duelo.fase === 'finMano' || duelo.fase === 'finDuelo';
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
            { nombre: RIVAL.nombre, piedras: duelo.marcador.rival },
            { nombre: M.tu, piedras: duelo.marcador.jugador },
          ]}
        />
      </div>
      <div className="mesa__cara">
        <BarraCara valor={IA.caraProvisional} titulo={M.tuCara} zonas={M.zonasCara} nota={M.caraProvisional} />
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
  rivalPiensa,
  puedo,
  cantidad,
  onCantidad,
  seleccion,
  onAccion,
  opciones,
}: {
  duelo: EstadoDuelo;
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
    rotulo = duelo.turno === 'jugador' && duelo.quienEsMano === 'rival' ? M.pideMus(RIVAL.nombre) : M.mano(duelo.numeroMano);
  } else if (duelo.fase === 'descarte') {
    rotulo = M.mano(duelo.numeroMano);
    principal = M.tocaDescartar;
  } else if (duelo.fase === 'envite' && duelo.lanceActual && envite) {
    rotulo = M.enJuego(ES.alLance[duelo.lanceActual]);
    principal = envite.ordago ? M.dueloEntero : envite.apuesta > 0 ? M.piedras(envite.apuesta) : M.sinEnvite;
  } else {
    rotulo = M.mano(duelo.numeroMano);
  }

  const elegir = (
    <div className="cantidades" role="radiogroup" aria-label={M.cantidad}>
      {CANTIDADES.map((n) => (
        <button key={n} type="button" role="radio" aria-checked={cantidad === n} className={clases('cantidad', cantidad === n && 'cantidad--elegida')} onClick={() => onCantidad(n)}>
          {n}
        </button>
      ))}
    </div>
  );

  return (
    <div className="mesa__derecha">
      <Panel className="en-juego">
        <div className="rotulo en-juego__rotulo">{rotulo}</div>
        {principal && <div className={clases('en-juego__principal', principal.length > 11 && 'en-juego__principal--largo')}>{principal}</div>}
        {rivalPiensa && <div className="en-juego__piensa">{M.piensa(RIVAL.nombre)}</div>}
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
            <BotonApuesta variante="gualda" onClick={() => onAccion({ tipo: 'envido', lado: yo, piedras: Math.max(cantidad, minimo('envido')) })}>
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

/** Al acabar la mano: el recuento. Al acabar el duelo: el órdago o el resultado. */
function PanelFinal({ duelo, onSiguiente, onOtroDuelo }: { duelo: EstadoDuelo; onSiguiente: () => void; onOtroDuelo: () => void }) {
  if (duelo.fase !== 'finMano' && duelo.fase !== 'finDuelo') return null;
  const nombre = (lado: Lado) => (lado === 'jugador' ? M.tu : RIVAL.nombre);
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
            <div className="rotulo">{M.tiraOrdago(resultado.lanzador === 'jugador' ? null : RIVAL.nombre)}</div>
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
          {RIVAL.nombre} {duelo.marcador.rival} · {M.tu} {duelo.marcador.jugador}
        </div>
        {duelo.fase === 'finDuelo' && duelo.ganador && (
          <div className="final__resultado">
            {duelo.ganador === 'jugador' ? M.hasGanado : M.teGana(RIVAL.nombre)}
            <span className="final__motivo">{duelo.motivoFin === 'ordago' ? M.porOrdago : M.aPiedras}</span>
          </div>
        )}
        <BotonApuesta variante="gualda" className="final__boton" onClick={duelo.fase === 'finMano' ? onSiguiente : onOtroDuelo} autoFocus>
          {duelo.fase === 'finMano' ? M.botones.siguienteMano : M.botones.otroDuelo}
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

function PanelDepuracion({ estado }: { estado: EstadoMesa }) {
  const duelo = estado.partida.duelo;
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
  const m = estado.partida.memoria;
  return (
    <div className="depuracion" aria-label={M.depuracionTitulo}>
      <div className="depuracion__titulo">{M.depuracionTitulo}</div>
      <div>
        {M.depuracionCartas(RIVAL.nombre)}: {cartas.map(cartaCorta).join(' ')}
      </div>
      <div>
        F ·{' '}
        {LANCES.map((lance) => `${ES.lances[lance].slice(0, 3)} ${fuerza[lance].toFixed(2).replace('.', ',')}`).join(' · ')}
      </div>
      <div>
        {M.depuracionUltima}: {motivo}
      </div>
      <div>{M.depuracionMemoria(m.envitesJugador, m.farolesDescubiertos, m.lancesPerdidosSeguidos, m.manosEnfadado)}</div>
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
