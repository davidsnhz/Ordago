import { useEffect, useState } from 'react';
import { ARENAS } from '../../datos/gira';
import { ORDEN_RIVALES, type IdRival } from '../../datos/rivales';
import type { Gira } from '../../estado/gira';
import { paginas, cargarLibreta } from '../../estado/libreta';
import { ES } from '../../textos/es';
import { rutaArte } from '../arte';
import { Escenario } from '../componentes/Escenario';
import { BotonApuesta } from '../componentes/piezas';
import { cambiarPreferencia, usePreferencias } from '../preferencias';
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
  // El aviso de los ajustes: cada pulsación lo vuelve a sacar (la cuenta es su clave) y se va solo.
  const [avisoAjustes, setAvisoAjustes] = useState(0);
  const { sonido } = usePreferencias();
  useEffect(() => {
    if (!avisoAjustes) return;
    const quitar = setTimeout(() => setAvisoAjustes(0), 2600);
    return () => clearTimeout(quitar);
  }, [avisoAjustes]);
  return (
    <Escenario avisoGirar={ES.mesa.girar}>
      <div className="pantalla pantalla--portada">
        {/* La taberna con Salamanca al fondo, entera de ancho; debajo, la mesa sigue hasta el borde con su canto. */}
        <div className="portada__fondo" aria-hidden="true">
          <img className="portada__ilustracion" src={rutaArte('fondos/portada.webp')} width={941} height={1670} alt="" draggable={false} />
          <div className="portada__canto" />
        </div>
        {/* El letrero y el lema, en un cartel de papel colgado del techo, para que se lean sobre la ilustración. */}
        <div className="portada__cartel">
          <span className="portada__cuerda portada__cuerda--izq" aria-hidden="true" />
          <span className="portada__cuerda portada__cuerda--der" aria-hidden="true" />
          {/* La O es de Bitter y la tilde, la cuña de Alfa Slab One, dibujada encima; se lee «Órdago». */}
          <h1 className="portada__titulo" aria-label={P.titulo}>
            <span aria-hidden="true">
              O
              <svg className="portada__tilde" viewBox="0 0 360 111">
                <path d="M197 111H0V96L109 0H360V26Z" />
              </svg>
              {P.titulo.slice(1)}
            </span>
          </h1>
          <p className="portada__lema">{P.lema}</p>
        </div>
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
            <div className="portada__fila">
              <BotonSeguir gira={guardada} onClick={onSeguir} />
              {/* Con una gira a medias, empezar otra es el cuadrado de al lado y pide confirmación. */}
              <BotonApuesta className="portada__cuadrado" aria-label={P.otraGira} onClick={() => setConfirmando(true)}>
                <Icono nombre="reiniciar" />
              </BotonApuesta>
            </div>
          ) : (
            <BotonApuesta variante="gualda" onClick={onNueva} autoFocus>
              {P.nueva}
            </BotonApuesta>
          )}
          <BotonApuesta onClick={onSuelto}>{P.dueloSuelto}</BotonApuesta>
          <div className="portada__herramientas">
            <div className="portada__aviso-hueco" role="status">
              {avisoAjustes > 0 && (
                <p key={avisoAjustes} className="portada__aviso">
                  {P.ajustesPronto}
                </p>
              )}
            </div>
            <BotonApuesta className="portada__cuadrado" aria-label={P.libreta} onClick={onLibreta}>
              <Icono nombre="libreta" />
            </BotonApuesta>
            <BotonApuesta
              className="portada__cuadrado"
              aria-label={P.sonido(sonido)}
              aria-pressed={sonido}
              onClick={() => cambiarPreferencia('sonido', !sonido)}
            >
              <Icono nombre={sonido ? 'sonido' : 'sinSonido'} />
            </BotonApuesta>
            <BotonApuesta className="portada__cuadrado" aria-label={P.ajustes} onClick={() => setAvisoAjustes((n) => n + 1)}>
              <Icono nombre="ajustes" />
            </BotonApuesta>
          </div>
        </div>
      </div>
    </Escenario>
  );
}

/** Los iconos de tinta de la portada, dibujados a mano en 24 × 24. */
const ICONOS = {
  sonido: (
    <>
      <path d="M3 9.5h4l5-4.5v14l-5-4.5H3z" fill="var(--tinta)" />
      <path d="M15.5 9a4 4 0 0 1 0 6" />
      <path d="M18.5 6.2a8 8 0 0 1 0 11.6" />
    </>
  ),
  sinSonido: (
    <>
      <path d="M3 9.5h4l5-4.5v14l-5-4.5H3z" fill="var(--tinta)" />
      <path d="M15.5 9.5l5 5M20.5 9.5l-5 5" />
    </>
  ),
  // Ocho dientes alrededor de un aro con su agujero.
  ajustes: (
    <>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((g) => (
        <rect key={g} x="10.4" y="1.6" width="3.2" height="4.4" rx="0.8" fill="var(--tinta)" stroke="none" transform={`rotate(${g} 12 12)`} />
      ))}
      <circle cx="12" cy="12" r="6.6" />
      <circle cx="12" cy="12" r="2.4" />
    </>
  ),
  libreta: (
    <>
      <rect x="5" y="2.8" width="14.5" height="18.4" rx="1.6" />
      <path d="M8.6 2.8v18.4" />
      <path d="M11.6 8h5M11.6 11.6h5M11.6 15.2h3.2" />
    </>
  ),
  reiniciar: (
    <>
      <path d="M4.6 12.5a7.6 7.6 0 1 0 2.4-5.9" />
      <path d="M4.2 3.4v4.4h4.4" />
    </>
  ),
};

function Icono({ nombre }: { nombre: keyof typeof ICONOS }) {
  return (
    <svg className="portada__icono" viewBox="0 0 24 24" aria-hidden="true">
      {ICONOS[nombre]}
    </svg>
  );
}

/** «SEGUIR LA GIRA» con, debajo y en pequeño, por dónde vas: la arena y sus cuatro niveles, el de ahora en almagre. */
function BotonSeguir({ gira, onClick }: { gira: Gira; onClick: () => void }) {
  const arena = ES.arenas[ARENAS[gira.arena]!.id].nombre;
  return (
    <BotonApuesta
      variante="gualda"
      className="portada__seguir"
      onClick={onClick}
      autoFocus
      aria-label={`${P.continuar}. ${P.vasPor(arena, gira.nivel + 1)}`}
    >
      {P.continuar}
      <span className="portada__progreso">
        {arena}
        <span className="portada__niveles">
          {[0, 1, 2, 3].map((n) => (
            <span
              key={n}
              className={`portada__nivel portada__nivel--${n < gira.nivel ? 'hecho' : n === gira.nivel ? 'actual' : 'falta'}`}
            />
          ))}
        </span>
      </span>
    </BotonApuesta>
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
