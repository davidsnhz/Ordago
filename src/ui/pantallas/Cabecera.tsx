import { CARA } from '../../datos/cara';
import type { EstadoMesa } from '../../estado/mesa';
import type { Lado } from '../../nucleo/comun';
import type { EstadoDuelo } from '../../nucleo/duelo';
import type { Lance } from '../../nucleo/lances';
import { ES, type TextosRival } from '../../textos/es';
import { BarraCara, BotonApuesta, Careto, clases, PasosLances, type EstadoPaso, type ZonaCara } from '../componentes/piezas';

const M = ES.mesa;
const A = M.ayudaCara;

export function zonaCara(valor: number): ZonaCara {
  if (valor <= CARA.minimo) return 'nota';
  if (valor < CARA.zonas.baja) return 'pillan';
  return valor < CARA.zonas.alta ? 'creen' : 'temen';
}

/** Los lances de la mano como pasos: hechos, el que se juega y los que faltan. */
function pasosDe(duelo: EstadoDuelo): { etiqueta: string; estado: EstadoPaso }[] {
  const jugados = new Set(duelo.lances.map((l) => l.lance));
  const terminada = duelo.fase === 'finMano' || duelo.fase === 'finDuelo' || duelo.fase === 'trato';
  const hayPunto = jugados.has('punto') || duelo.lanceActual === 'punto';
  return (['grande', 'chica', 'pares', hayPunto ? 'punto' : 'juego'] as Lance[]).map((lance) => ({
    etiqueta: ES.lances[lance],
    estado: duelo.lanceActual === lance && !terminada ? 'actual' : jugados.has(lance) || terminada ? 'hecho' : 'falta',
  }));
}

/**
 * La cabecera, en un solo panel bajito: arriba los nombres; en medio los números, quién es mano
 * y los lances como pasos; abajo tu Cara, con tu careto, lo que significa ahora y su barra.
 * Cuando la Cara cambia, la cifra sube un momento sobre la marca. «?» explica la Cara.
 */
export function Cabecera({ estado, textos, onAyuda }: { estado: EstadoMesa; textos: TextosRival; onAyuda: () => void }) {
  const { partida, avisoCara, seTeNota } = estado;
  const { duelo } = partida;
  const zona = zonaCara(partida.caraJugador);
  const mano = (lado: Lado) =>
    duelo.quienEsMano === lado && (
      <span className={clases('insignia', lado === 'jugador' && 'insignia--anil')} title={M.ayudaMano}>
        {M.esMano}
      </span>
    );

  return (
    <div className="panel cabecera" aria-label={`${textos.nombre} ${duelo.marcador.rival}, tú ${duelo.marcador.jugador}`}>
      <div className="cabecera__nombres">
        <span className="rotulo">{textos.nombre}</span>
        <span className="cabecera__meta">{M.marcador}</span>
        <span className="rotulo">{M.tu}</span>
      </div>
      <div className="cabecera__marcador">
        <span className="cabecera__lado">
          <b className="cabecera__numero">{duelo.marcador.rival}</b>
          {mano('rival')}
        </span>
        <PasosLances pasos={pasosDe(duelo)} />
        <span className="cabecera__lado cabecera__lado--tu">
          {mano('jugador')}
          <b className="cabecera__numero">{duelo.marcador.jugador}</b>
        </span>
      </div>
      <div className="cabecera__cara">
        <Careto zona={zona} tamano={28} />
        <div className="cabecera__cara-dentro">
          <div className="cabecera__cara-linea">
            <span className="rotulo">{M.tuCara}</span>
            <span className="cabecera__cara-estado">{M.estadoCara[zona]}</span>
            {partida.expuesto && (
              <span key={seTeNota ?? 0} className={clases('cabecera__expuesto', seTeNota !== null && 'cabecera__expuesto--late')}>
                {M.expuesto}
              </span>
            )}
            <b className="cabecera__cara-valor">{partida.caraJugador}</b>
          </div>
          <BarraCara valor={partida.caraJugador} etiqueta={M.tuCara}>
            {avisoCara && (
              <span
                key={avisoCara.clave}
                className={clases('cabecera__delta', avisoCara.delta < 0 && 'cabecera__delta--baja')}
                style={{ left: `${Math.max(8, Math.min(92, partida.caraJugador))}%` }}
                role="status"
                aria-label={`${M.tuCara} ${M.cambioCara(avisoCara.delta)}: ${avisoCara.motivos.join(', ')}`}
              >
                {M.cambioCara(avisoCara.delta)}
              </span>
            )}
          </BarraCara>
        </div>
        <button type="button" className="cabecera__ayuda" aria-label={A.boton} onClick={onAyuda}>
          ?
        </button>
      </div>
    </div>
  );
}

const firma = (n: number) => (n > 0 ? `+${n}` : `−${-n}`);

/** La ficha de «?»: qué es la Cara, qué la mueve y qué hace, con tu zona resaltada. */
export function AyudaCara({ valor, onCerrar }: { valor: number; onCerrar: () => void }) {
  const zona = zonaCara(valor);
  const { baja, alta } = CARA.zonas;
  const movimientos: [number, string][] = [
    [CARA.farolCreido, A.farolCreido],
    [CARA.enviteCobrado, A.enviteCobrado],
    [CARA.farolPillado, A.farolPillado],
    [CARA.ordagoPerdido, A.ordagoPerdido],
  ];
  const zonas: [ZonaCara, string][] = [
    ['temen', A.temen(alta)],
    ['creen', A.creen(baja, alta - 1)],
    ['pillan', A.pillan(baja)],
    ['nota', A.nota],
  ];
  return (
    <div className="mesa__velo mesa__velo--encima" onClick={onCerrar}>
      <div className="panel panel--sombra ayuda-cara" role="dialog" aria-modal="true" aria-label={A.boton} onClick={(e) => e.stopPropagation()}>
        <div className="ayuda-cara__titulo">{A.titulo(valor)}</div>
        <div className="ayuda-cara__que">{A.queEs}</div>
        <div className="rotulo ayuda-cara__apartado">{A.mueve}</div>
        <ul className="ayuda-cara__mueve">
          {movimientos.map(([n, texto]) => (
            <li key={texto}>
              <b className={n > 0 ? 'ayuda-cara__sube' : 'ayuda-cara__baja'}>{firma(n)}</b>
              <span>{texto}</span>
            </li>
          ))}
        </ul>
        <div className="rotulo ayuda-cara__apartado">{A.hace}</div>
        <ul className="ayuda-cara__zonas">
          {zonas.map(([z, texto]) => (
            <li key={z} className={clases(z === zona && 'ayuda-cara__zona--tuya')}>
              <Careto zona={z} tamano={26} />
              <span>{texto}</span>
            </li>
          ))}
        </ul>
        <BotonApuesta variante="gualda" className="ayuda-cara__entendido" onClick={onCerrar} autoFocus>
          {A.entendido}
        </BotonApuesta>
      </div>
    </div>
  );
}
