import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
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
import { poseDelRival, textosDe, type EstadoMesa } from '../../estado/mesa';
import { idCarta, type Carta } from '../../nucleo/carta';
import type { Lado } from '../../nucleo/comun';
import { accionesValidas, type AccionDuelo, type EstadoDuelo, type OpcionDuelo } from '../../nucleo/duelo';
import { calcularFuerza } from '../../nucleo/ia/fuerza';
import { LANCES } from '../../nucleo/lances';
import { cartaCorta, ES, type TextosRival } from '../../textos/es';
import { BotonOrdago } from '../componentes/BotonOrdago';
import { Escenario } from '../componentes/Escenario';
import { FondoVivo } from '../componentes/FondoVivo';
import { Avisos, Bocadillo, BotonHistorial, Casillas, centroDeCasilla, HistorialMano, retiroDelSello, RITMO_NUEVA } from '../componentes/MesaNueva';
import {
  CapaPiedras,
  CartasRivalVivas,
  Confeti,
  DISPOSICION_NUEVA,
  EstallidoOrdago,
  ManoViva,
  Montones,
  SellosPorLado,
  useEfectosVivos,
  useMarcadorVivo,
} from '../componentes/MesaViva';
import { BotonApuesta, CartaVista, clases } from '../componentes/piezas';
import { Retrato } from '../componentes/Retrato';
import { AyudaCara, Cabecera } from './Cabecera';
import './mesa.css';

const M = ES.mesa;
const G = ES.gira;
/** Envites rápidos; el resto, con la barra. */
const RAPIDAS = [2, 3];
const BARRA = { minimo: 4, maximo: 19 };
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
  const { estado, jugar, aplicar, nuevoDuelo, cambiarCara, ensayarTics, setPausa, rivalPiensa } = useDuelo(
    modo.tipo === 'gira' ? { inicio: modo.inicio, alGuardar: modo.alGuardar } : { inicio: () => empezarSuelto(modo.rival) },
  );
  const pruebas = useModoPruebas();
  const [depuracion, alternarDepuracion] = useDepuracion(pruebas);
  const [eligiendoRival, setEligiendoRival] = useState(false);
  // Modo de pruebas: enseñar a mano cada postura y cada cara del rival, para revisar su arte.
  const [poseDePrueba, setPoseDePrueba] = useState<string | null>(null);
  const siguientePose = () => setPoseDePrueba((p) => POSES_DE_PRUEBA[(POSES_DE_PRUEBA.indexOf(p) + 1) % POSES_DE_PRUEBA.length]!);
  // Mientras lees qué es la Cara, miras la bolsa o repasas la mano, el rival espera.
  const [ayudaCara, setAyudaCara] = useState(false);
  const [bolsaAbierta, setBolsaAbierta] = useState(false);
  const [historial, setHistorial] = useState(false);
  useEffect(() => setPausa(ayudaCara || bolsaAbierta || historial), [ayudaCara, bolsaAbierta, historial, setPausa]);
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

  // La mesa (23 de octubre de 2026, la «mesa nueva» que eligió David): con movimiento, sonido y
  // fondo vivo; sin acta a la vista, con sellos junto a quien habla, las casillas de los lances, el
  // bocadillo del rival, el recuento hecho sobre la mesa y el acta entera detrás de ≡.
  const raiz = useRef<HTMLDivElement>(null);
  const vivo = useEfectosVivos(estado, raiz, RITMO_NUEVA);
  const marcadorVivo = useMarcadorVivo(duelo.marcador, { efectos: estado.efectos, clave: estado.claveEfectos }, centroDeCasilla, RITMO_NUEVA);
  const manoAcabada = duelo.fase === 'finMano' || duelo.fase === 'finDuelo';

  return (
    <Escenario avisoGirar={M.girar}>
      <div ref={raiz} className={clases('mesa', 'mesa--viva', 'mesa--nueva', manoAcabada && 'mesa--mano-acabada')}>
        <div className="mesa__pared" />
        <div className="mesa__luz" />
        <FondoVivo />
        <div className="mesa__vineta" />

        <Cabecera estado={estado} textos={textos} onAyuda={() => setAyudaCara(true)} vivo={marcadorVivo} />

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
        <FondoVivo capa="delante" />
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

        <Bocadillo acta={estado.acta} piensa={rivalPiensa} />
        <Avisos acta={estado.acta} />

        <div className="mesa__madera" />
        <div className="mesa__tapete" />
        <Montones disposicion={DISPOSICION_NUEVA} />
        {/* Al acabar la mano, sus cartas se dan la vuelta en el tapete. */}
        <CartasRivalVivas
          cartas={duelo.cartas.rival}
          aLaVista={manoAcabada ? duelo.cartas.rival : aLaVista}
          numeroMano={duelo.numeroMano}
          abanico={ABANICO_RIVAL}
          etiqueta={M.susCartas(textos.nombre)}
          disposicion={DISPOSICION_NUEVA}
        />
        <Casillas duelo={duelo} nombre={textos.nombre} />
        <ManoViva
          cartas={duelo.cartas.jugador}
          numeroMano={duelo.numeroMano}
          abanico={ABANICO}
          seleccionables={descartando}
          seleccion={seleccion}
          onAlternar={alternarCarta}
          disposicion={DISPOSICION_NUEVA}
        />
        <BotonHistorial onAbrir={() => setHistorial(true)} />

        <Botonera
          duelo={duelo}
          puedo={puedo}
          seleccion={seleccion}
          onAccion={jugar}
          opciones={opciones}
          espera={rivalPiensa ? M.leToca(textos.nombre) : null}
          onSiguiente={duelo.fase === 'finMano' ? () => jugar({ tipo: 'siguienteMano' }) : null}
        />
        {puedo('trato') && <div className="panel panel--sombra mesa__nota-trato">{M.tratoExplica(textos.nombre)}</div>}
        <SellosPorLado sellos={vivo.sellos} nombre={textos.nombre} retiroDe={retiroDelSello} />

        {depuracion && <PanelDepuracion estado={estado} textos={textos} onCara={cambiarCara} />}
        <PanelFinal
          duelo={duelo}
          textos={textos}
          rivalActual={partida.rivalId}
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
        {historial && <HistorialMano acta={estado.acta} numeroMano={duelo.numeroMano} onCerrar={() => setHistorial(false)} />}
        {eligiendoRival && (
          <SelectorDeRival actual={partida.rivalId} onElegir={elegirRival} onCancelar={() => setEligiendoRival(false)} />
        )}
        <CapaPiedras vuelos={marcadorVivo.vuelos} onLlega={marcadorVivo.llega} />
        <EstallidoOrdago ordago={vivo.ordago} nombre={textos.nombre} />
        {vivo.fin?.ganador === 'jugador' && <Confeti key={vivo.fin.clave} />}
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
  onSiguiente,
}: {
  duelo: EstadoDuelo;
  puedo: (tipo: OpcionDuelo['tipo']) => boolean;
  seleccion: string[];
  onAccion: (a: AccionDuelo) => void;
  opciones: OpcionDuelo[];
  /** «Le toca a Agustín» mientras el rival piensa. */
  espera: string | null;
  /** Mesa nueva: el recuento se ve en la mesa y la siguiente mano se pide desde aquí. */
  onSiguiente: (() => void) | null;
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
        {onSiguiente && (
          <BotonApuesta variante="gualda" onClick={onSiguiente} autoFocus>
            {M.botones.siguienteMano}
          </BotonApuesta>
        )}
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

/** Al acabar el duelo: el órdago o el recuento, el resultado y la revancha (o seguir con la gira). */
function PanelFinal({
  duelo,
  textos,
  rivalActual,
  onOtroDuelo,
  alAcabar,
  onSalir,
}: {
  duelo: EstadoDuelo;
  textos: TextosRival;
  rivalActual: IdRival;
  onOtroDuelo: (rival: IdRival) => void;
  /** En la gira: al acabar el duelo se sigue con la gira (en vez de revancha). */
  alAcabar: (() => void) | null;
  onSalir: () => void;
}) {
  // El recuento de cada mano se hace sobre la mesa; el panel solo sale al acabar el duelo.
  if (duelo.fase !== 'finDuelo') return null;
  const nombre = (lado: Lado) => (lado === 'jugador' ? M.tu : textos.nombre);
  const ultimo = duelo.lances[duelo.lances.length - 1];
  const resultado = ultimo?.envite?.resultado;
  const porOrdago = duelo.motivoFin === 'ordago' && ultimo && resultado?.tipo === 'ordagoQuerido';
  const recuento = duelo.recuento;

  // El panel espera a que pase el órdago o a que cobre la última casilla.
  const espera = porOrdago ? 1.5 : RITMO_NUEVA.inicio + (recuento?.aplicados ?? 0) * RITMO_NUEVA.cada + 0.9;
  return (
    <div className="mesa__velo mesa__velo--tarde" style={{ '--espera': `${espera}s` } as CSSProperties}>
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
                <li key={i} className={clases(i >= recuento.aplicados && 'final__cobro--sin-cobrar')} style={{ '--i': i } as CSSProperties}>
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
        {duelo.ganador && (
          <div className="final__resultado">
            {duelo.ganador === 'jugador' ? M.hasGanado : M.teGana(textos.nombre)}
            <span className="final__motivo">{duelo.motivoFin === 'ordago' ? M.porOrdago : M.aPiedras}</span>
          </div>
        )}
        {alAcabar ? (
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
      {(['rival', 'jugador'] as const).map((lado, l) => (
        <div key={lado} className="final__mano">
          <div className="rotulo">{nombre(lado)}</div>
          <div className="final__cartas">
            {/* `--i`: el orden en que se dan la vuelta en la mesa viva. */}
            {duelo.cartas[lado].map((carta, i) => (
              <CartaVista key={idCarta(carta)} carta={carta} className="carta--pequena" style={{ '--i': l * 4 + i } as CSSProperties} />
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
