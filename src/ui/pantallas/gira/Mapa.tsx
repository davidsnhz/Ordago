import type { ReactNode } from 'react';
import { ARENAS, GIRA, NIVEL_JEFE, type IdArena } from '../../../datos/gira';
import { esJefe, nivelesDe, type Gira } from '../../../estado/gira';
import { ES } from '../../../textos/es';
import type { IdRival } from '../../../datos/rivales';
import { useMedallon } from '../../arte';
import { BotonApuesta, clases } from '../../componentes/piezas';
import { Hud } from './Piezas';

const G = ES.gira;
const MAPA = G.mapa;

/** Dónde va cada nivel de la arena en el camino (centro del disco), de abajo arriba. */
const NODOS = [
  { left: 110, top: 622, tamano: 64 },
  { left: 272, top: 560, tamano: 76 },
  { left: 112, top: 474, tamano: 64 },
  { left: 250, top: 376, tamano: 96 },
] as const;

/** El camino punteado que une los cuatro niveles. */
const CAMINO = 'M110 612 C 140 576, 270 582, 272 544 S 120 502, 122 462 S 230 402, 236 367';

/**
 * El mapa (prototipo A1, como las arenas de Clash Royale): la arena en curso ocupa la pantalla con
 * sus cuatro paradas, de abajo arriba hasta el jefe, y la siguiente asoma arriba tapada por la
 * niebla. Abajo, quién es el siguiente y el botón para sentarse a la mesa.
 */
export function Mapa({ gira, onJugar, onLibreta, onSalir }: { gira: Gira; onJugar: () => void; onLibreta: () => void; onSalir: () => void }) {
  const niveles = nivelesDe(gira.arena);
  const arena = ARENAS[gira.arena]!;
  const siguienteArena = ARENAS[gira.arena + 1];
  const rival = niveles[gira.nivel]!;
  const textos = ES.rivales[rival];
  const jefe = ES.rivales[niveles[NIVEL_JEFE]!].nombre;
  const regla = MAPA.ayudaRegla[rival] ?? null;
  const aviso = gira.pendiente.aviso ? G.avisos[gira.pendiente.aviso].mapa : null;

  return (
    <div className="pantalla">
      {siguienteArena && (
        <>
          <div className={clases('mapa__siguiente', `mapa__siguiente--${siguienteArena.id}`)} />
          <div className="mapa__niebla" />
          <div className="cinta cinta--tinta" style={{ top: 128 }}>
            {MAPA.arena(gira.arena + 2, ES.arenas[siguienteArena.id].nombre)}
            <small>{MAPA.cerrada(jefe)}</small>
          </div>
        </>
      )}
      <div className={clases('mapa__suelo', `mapa__suelo--${arena.id}`)} />
      <Fachada arena={arena.id} />
      <div className="cinta" style={{ top: 242 }}>
        {MAPA.arena(gira.arena + 1, ES.arenas[arena.id].nombre)}
      </div>
      <svg className="mapa__camino" viewBox="0 0 390 844" aria-hidden="true">
        <path d={CAMINO} fill="none" stroke="#231915" strokeWidth="4" strokeDasharray="2 10" strokeLinecap="round" />
      </svg>

      {niveles.map((id, nivel) => {
        const p = NODOS[nivel]!;
        const resultado = gira.resultados[nivel];
        const aqui = nivel === gira.nivel;
        const futuro = nivel > gira.nivel;
        const nombre = ES.rivales[id].nombre;
        return (
          <div
            key={id}
            className={clases('nodo', aqui && 'nodo--aqui', !aqui && resultado && 'nodo--hecho', esJefe(nivel) && 'nodo--jefe')}
            // Se coloca por el disco: lo de debajo (nombre, regla) no lo mueve.
            style={{ left: p.left, top: p.top - p.tamano / 2 }}
          >
            {aqui && <div className="nodo__aqui">{MAPA.aquiEstas}</div>}
            <Disco id={id} nombre={nombre} tamano={p.tamano}>
              {esJefe(nivel) && <span className="nodo__jefe">{MAPA.jefe}</span>}
              {!aqui && resultado && (
                <span className={`nodo__sello nodo__sello--${resultado}`} aria-label={resultado}>
                  {resultado === 'ganado' ? '✓' : '✕'}
                </span>
              )}
              {futuro && (
                <span className="nodo__candado" aria-hidden="true">
                  <Candado />
                </span>
              )}
            </Disco>
            <div className="nodo__nombre">{ES.rivales[id].titulo}</div>
            {esJefe(nivel) && MAPA.reglas[id] && (
              <>
                <br />
                <span className="nodo__regla">{MAPA.reglas[id]}</span>
              </>
            )}
          </div>
        );
      })}

      <Hud gira={gira} />
      <div className="mapa__atajos">
        <button type="button" className="mapa__atajo" onClick={onLibreta}>
          {MAPA.libreta}
        </button>
        <button type="button" className="mapa__atajo" onClick={onSalir}>
          {MAPA.salir}
        </button>
      </div>

      <div className="siguiente panel panel--sombra">
        <div className="siguiente__que">
          {MAPA.nivel(gira.nivel + 1)} · {MAPA.aPiedras(GIRA.piedrasPorNivel[gira.nivel]!)} · {MAPA.gana(GIRA.realesPorNivel[gira.nivel]!)}
          {gira.intento > 0 && ` · ${MAPA.otraVez}`}
        </div>
        <div className="siguiente__quien">{textos.titulo}</div>
        {regla && <p className="siguiente__regla">{regla}</p>}
        {aviso && <p className="siguiente__regla siguiente__aviso">{aviso}</p>}
        <BotonApuesta variante="gualda" onClick={onJugar} autoFocus>
          {MAPA.aLaMesa}
        </BotonApuesta>
      </div>
    </div>
  );
}

/** El edificio de cada arena, con formas planas hasta que esté su dibujo. */
function Fachada({ arena }: { arena: IdArena }) {
  if (arena === 'bar')
    return (
      <svg className="mapa__edificio" viewBox="0 0 330 120" aria-hidden="true">
        <rect x="20" y="24" width="290" height="96" fill="#e7dcc0" stroke="#231915" strokeWidth="3" />
        <rect x="34" y="2" width="114" height="34" rx="4" fill="#b02a1e" stroke="#231915" strokeWidth="3" />
        <text className="mapa__rotulo" x="91" y="28" textAnchor="middle">
          {MAPA.rotuloBar}
        </text>
        <g stroke="#231915" strokeWidth="2.5">
          <path d="M34 48 H148 L156 66 H26 Z" fill="#2c54a0" />
          <path d="M182 48 H296 L304 66 H174 Z" fill="#2c54a0" />
          <rect x="40" y="66" width="96" height="40" fill="#8fb2b8" />
          <rect x="194" y="66" width="96" height="40" fill="#8fb2b8" />
          <rect x="146" y="72" width="38" height="48" fill="#8c5629" />
        </g>
      </svg>
    );
  return (
    <svg className="mapa__edificio" viewBox="0 0 330 120" aria-hidden="true">
      <rect x="20" y="30" width="290" height="90" fill="#c99c55" stroke="#231915" strokeWidth="3" />
      <polygon points="10,32 165,0 320,32" fill="#b98a45" stroke="#231915" strokeWidth="3" />
      <g fill="#8c5629" stroke="#231915" strokeWidth="2.5">
        <path d="M45 120 V70 a15 15 0 0 1 30 0 V120" />
        <path d="M95 120 V70 a15 15 0 0 1 30 0 V120" />
        <path d="M150 120 V62 a15 15 0 0 1 30 0 V120" />
        <path d="M205 120 V70 a15 15 0 0 1 30 0 V120" />
        <path d="M255 120 V70 a15 15 0 0 1 30 0 V120" />
      </g>
    </svg>
  );
}

function Candado() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path d="M7 11 V8 a5 5 0 0 1 10 0 V11" fill="none" stroke="#f2e8d2" strokeWidth="2.5" />
      <rect x="5" y="11" width="14" height="10" rx="2" fill="#f2e8d2" stroke="#231915" strokeWidth="1.5" />
    </svg>
  );
}

/** El disco de un nivel: la cara del rival si tiene dibujo; si no, el marcador con su nombre. */
function Disco({ id, nombre, tamano, children }: { id: IdRival; nombre: string; tamano: number; children: ReactNode }) {
  const medallon = useMedallon(id);
  if (medallon)
    return (
      <div className="nodo__disco nodo__disco--cara" style={{ width: tamano, height: tamano }}>
        <img className="nodo__cara" src={medallon} alt={nombre} draggable={false} />
        {children}
      </div>
    );
  return (
    <div className="nodo__disco marcador marcador--redondo" style={{ width: tamano, height: tamano }}>
      {nombre}
      {children}
    </div>
  );
}
