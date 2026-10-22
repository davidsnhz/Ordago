import { useState } from 'react';
import { ARENAS } from '../../datos/gira';
import { ORDEN_RIVALES, type IdRival } from '../../datos/rivales';
import type { Gira } from '../../estado/gira';
import { paginas, cargarLibreta } from '../../estado/libreta';
import { ES } from '../../textos/es';
import { rutaArte } from '../arte';
import { Escenario } from '../componentes/Escenario';
import { BotonApuesta } from '../componentes/piezas';
import { cambiarPreferencia, siguienteMesa, usePreferencias } from '../preferencias';
import './gira/gira.css';

const P = ES.portada;

/** La portada: seguir o empezar la gira, un duelo suelto o la Libreta. */
export function Portada({
  guardada,
  onSeguir,
  onNueva,
  onSuelto,
  onLibreta,
}: {
  guardada: Gira | null;
  onSeguir: () => void;
  onNueva: () => void;
  onSuelto: () => void;
  onLibreta: () => void;
}) {
  const [confirmando, setConfirmando] = useState(false);
  const { mesa, sonido } = usePreferencias();
  return (
    <Escenario avisoGirar={ES.mesa.girar}>
      <div className="pantalla">
        <img className="portada__marca" src={rutaArte('marca/ordago_wordmark.webp')} alt="Órdago" draggable={false} />
        <p className="portada__lema">{P.lema}</p>
        <div className="portada__botones">
          {confirmando ? (
            <div className="panel panel--sombra portada__confirmar">
              <p>{P.confirmar}</p>
              <div className="fila-botones">
                <BotonApuesta variante="rendirse" onClick={() => setConfirmando(false)}>
                  {P.no}
                </BotonApuesta>
                <BotonApuesta variante="gualda" onClick={onNueva}>
                  {P.siEmpezar}
                </BotonApuesta>
              </div>
            </div>
          ) : guardada ? (
            <>
              <BotonApuesta variante="gualda" onClick={onSeguir} autoFocus>
                {P.continuar}
              </BotonApuesta>
              <div className="portada__vas">{P.vasPor(ES.arenas[ARENAS[guardada.arena]!.id].nombre, guardada.nivel + 1)}</div>
              <button type="button" className="enlace" onClick={() => setConfirmando(true)}>
                {P.otraGira}
              </button>
            </>
          ) : (
            <BotonApuesta variante="gualda" onClick={onNueva} autoFocus>
              {P.nueva}
            </BotonApuesta>
          )}
          <BotonApuesta onClick={onSuelto}>{P.dueloSuelto}</BotonApuesta>
          <BotonApuesta onClick={onLibreta}>{P.libreta}</BotonApuesta>
        </div>
        <div className="portada__ajustes">
          <button type="button" className="portada__ajuste" aria-pressed={mesa !== 'antes'} title={P.ayudaMesa} onClick={() => cambiarPreferencia('mesa', siguienteMesa(mesa))}>
            {P.mesa(P.nombresMesa[mesa])}
          </button>
          <button type="button" className="portada__ajuste" aria-pressed={sonido} onClick={() => cambiarPreferencia('sonido', !sonido)}>
            {P.sonido(sonido)}
          </button>
        </div>
      </div>
    </Escenario>
  );
}

/** La Libreta: lo apuntado de cada rival. */
export function PantallaLibreta({ onCerrar }: { onCerrar: () => void }) {
  const L = ES.libreta;
  const lista = paginas(cargarLibreta());
  return (
    <Escenario avisoGirar={ES.mesa.girar}>
      <div className="pantalla pantalla--madera">
        <div className="taberna__titulo">{L.titulo}</div>
        <p className="pantalla__nota libreta__nota">{L.nota}</p>
        <div className="libreta">
          {lista.length === 0 && <p className="libreta__vacia">{L.vacia}</p>}
          {lista.map(({ rival, notas }) => (
            <section key={rival}>
              <h4>{ES.rivales[rival].titulo}</h4>
              <ul>
                {notas.map((n) => (
                  <li key={n.tic} className={n.nivel === 3 ? 'libreta__nivel3' : undefined}>
                    {n.texto}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <div className="pantalla__abajo">
          <BotonApuesta variante="gualda" onClick={onCerrar} autoFocus>
            {L.cerrar}
          </BotonApuesta>
        </div>
      </div>
    </Escenario>
  );
}

/** Duelo suelto: contra quien quieras, sin gira. Los rivales, agrupados por su arena. */
export function ElegirRivalSuelto({ onElegir, onVolver }: { onElegir: (rival: IdRival) => void; onVolver: () => void }) {
  const grupos = new Map<string, IdRival[]>();
  for (const id of ORDEN_RIVALES) {
    const sitio = ES.rivales[id].comarca;
    grupos.set(sitio, [...(grupos.get(sitio) ?? []), id]);
  }
  return (
    <Escenario avisoGirar={ES.mesa.girar}>
      <div className="pantalla">
        <div className="elegir__cabecera">
          <h2 className="pantalla__titulo">{P.dueloSuelto}</h2>
          <p className="pantalla__nota">{P.sueltoNota}</p>
        </div>
        <div className="sueltos">
          {[...grupos].map(([sitio, rivales]) => (
            <div key={sitio} className="sueltos__grupo">
              <div className="rotulo">{sitio}</div>
              <div className="sueltos__lista">
                {rivales.map((id) => (
                  <button key={id} type="button" className="sueltos__rival" onClick={() => onElegir(id)}>
                    {ES.rivales[id].nombre}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="pantalla__abajo">
          <BotonApuesta variante="rendirse" onClick={onVolver}>
            {P.volver}
          </BotonApuesta>
        </div>
      </div>
    </Escenario>
  );
}
