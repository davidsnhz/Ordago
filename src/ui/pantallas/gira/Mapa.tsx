import { ARENAS, GIRA, NIVEL_JEFE } from '../../../datos/gira';
import { esJefe, nivelesDe, type Gira } from '../../../estado/gira';
import { ES } from '../../../textos/es';
import { BotonApuesta, clases } from '../../componentes/piezas';
import { Hud } from './Piezas';

const G = ES.gira;
const MAPA = G.mapa;

/** Dónde va cada nivel de la arena en el camino (centro del disco), de abajo arriba. */
const NODOS = [
  { left: 110, top: 632, tamano: 64 },
  { left: 272, top: 560, tamano: 76 },
  { left: 112, top: 474, tamano: 64 },
  { left: 250, top: 376, tamano: 96 },
] as const;

/** El camino punteado que une los cuatro niveles. */
const CAMINO = 'M110 622 C 140 582, 270 582, 272 544 S 120 502, 122 462 S 230 402, 236 367';

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
  const regla = esJefe(gira.nivel) ? MAPA.ayudaRegla[rival] : null;

  return (
    <div className="pantalla">
      {siguienteArena && (
        <>
          <div className="mapa__bar" />
          <div className="mapa__niebla" />
          <div className="cinta cinta--tinta" style={{ top: 128 }}>
            {MAPA.arena(gira.arena + 2, ES.arenas[siguienteArena.id].nombre)}
            <small>{MAPA.cerrada(jefe)}</small>
          </div>
        </>
      )}
      <div className="mapa__facultad" />
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
            <div className="nodo__disco marcador marcador--redondo" style={{ width: p.tamano, height: p.tamano }}>
              {nombre}
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
            </div>
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
          {MAPA.nivel(gira.nivel + 1)} · {MAPA.gana(GIRA.realesPorNivel[gira.nivel]!)}
          {gira.intento > 0 && ` · ${MAPA.otraVez}`}
        </div>
        <div className="siguiente__quien">{textos.titulo}</div>
        {regla && <p className="siguiente__regla">{regla}</p>}
        <BotonApuesta variante="gualda" onClick={onJugar} autoFocus>
          {MAPA.aLaMesa}
        </BotonApuesta>
      </div>
    </div>
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
