import { esJefe, rivalActual, type Gira, type LineaReales, type Parada, type ResumenDuelo } from '../../../estado/gira';
import { cargarLibreta, textoNota } from '../../../estado/libreta';
import { ES } from '../../../textos/es';
import { BotonApuesta, clases } from '../../componentes/piezas';
import { Honra, Moneda } from './Piezas';

const R = ES.gira.resultado;

function concepto(linea: LineaReales, resumen: ResumenDuelo): string {
  switch (linea.concepto) {
    case 'duelo':
      return R.lineas.duelo(resumen.nivel + 1);
    case 'consolacion':
      return R.lineas.consolacion;
    case 'envites':
      return R.lineas.envites(linea.veces ?? 1);
    case 'faroles':
      return R.lineas.faroles(linea.veces ?? 1);
    case 'ordagos':
      return R.lineas.ordagos(linea.veces ?? 1);
    case 'triple':
      return R.lineas.triple;
    case 'recaudadora':
      return R.lineas.recaudadora;
    case 'forastero':
      return R.lineas.forastero(resumen.forastero === 'ganada');
  }
}

const PARADAS: Parada[] = ['taberna', 'plaza', 'era'];

/**
 * Después del duelo (prototipo R): lo que cobras y por qué, cómo vas, lo apuntado en la Libreta y
 * adónde vas antes del siguiente duelo. Sin Honra, o tras ganar al jefe, se sigue con un botón.
 */
export function Resultado({ gira, resumen, onParada, onSeguir }: { gira: Gira; resumen: ResumenDuelo; onParada: (p: Parada) => void; onSeguir: () => void }) {
  const nombre = ES.rivales[resumen.rival].nombre;
  const libreta = cargarLibreta();
  const notas = resumen.libreta
    .map((c) => textoNota(c.rival, c.tic, libreta.rivales[c.rival]?.[c.tic]))
    .filter((t): t is string => t !== null);
  const siguienteRival = resumen.siguiente === 'paradas' ? rivalActual(gira) : null;

  return (
    <div className="pantalla">
      <div className="resultado">
        <div className="resultado__titulo">
          <div className={clases('resultado__grande', !resumen.ganado && 'resultado__grande--pierde')}>
            {resumen.ganado ? R.gana(nombre) : R.pierde(nombre)}
          </div>
          <div className="resultado__tanteo">{R.tanteo(resumen.marcador.jugador, resumen.marcador.rival)}</div>
        </div>

        <div className="cuenta panel panel--sombra">
          <div className="rotulo">{R.cobras}</div>
          {resumen.lineas.map((linea, i) => (
            <div key={i} className="cuenta__linea">
              <span>{concepto(linea, resumen)}</span>
              <b>+{linea.reales}</b>
            </div>
          ))}
          <div className="cuenta__total">
            <span>{R.total}</span>
            <span>
              <Moneda /> {R.totalReales(resumen.total)}
            </span>
          </div>
        </div>

        <div className="estado-gira">
          <div className="panel">
            <div className="rotulo">{R.reales}</div>
            {/* Solo lo que tienes ahora: lo que has ganado ya está en la cuenta de arriba. */}
            <div className="estado-gira__valor">{resumen.reales.despues}</div>
          </div>
          <div className="panel">
            <div className="rotulo">{R.honra}</div>
            <Honra valor={resumen.honra.despues} />
            {resumen.honra.despues < resumen.honra.antes && <span className="estado-gira__aviso">{R.pierdeHonra}</span>}
          </div>
          <div className="panel">
            <div className="rotulo">{R.cara}</div>
            <div className="estado-gira__valor">{resumen.cara}</div>
          </div>
        </div>

        {notas.length > 0 && (
          <div className="libreta-nota">
            <div className="rotulo">{R.libreta}</div>
            {notas.slice(0, 2).map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>
        )}

        {resumen.siguiente === 'paradas' ? (
          <>
            <div className="ahora">{R.ahora}</div>
            <div className="paradas">
              {PARADAS.map((p) => (
                <button key={p} type="button" className="parada" onClick={() => onParada(p)}>
                  <span className="marcador">{R.paradas[p].nombre.split(' ').at(-1)}</span>
                  <span>
                    <b>{R.paradas[p].nombre}</b>
                    <i>{R.paradas[p].texto}</i>
                  </span>
                </button>
              ))}
            </div>
            {siguienteRival && (
              <div className="resultado__despues">
                {esJefe(gira.nivel) && gira.intento > 0
                  ? R.otraVez(ES.rivales[siguienteRival].nombre)
                  : R.despues(ES.rivales[siguienteRival].nombre, gira.nivel + 1)}
              </div>
            )}
          </>
        ) : (
          <BotonApuesta variante="gualda" className="resultado__seguir" onClick={onSeguir} autoFocus>
            {resumen.siguiente === 'premio' ? R.premio : R.sinHonra}
          </BotonApuesta>
        )}
      </div>
    </div>
  );
}
