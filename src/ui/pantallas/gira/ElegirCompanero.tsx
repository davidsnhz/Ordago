import { useState } from 'react';
import { COMPANEROS, COMPANEROS_INICIALES, POR_DESBLOQUEAR, type IdCompanero } from '../../../datos/companeros';
import { ES } from '../../../textos/es';
import { BotonApuesta, clases } from '../../componentes/piezas';
import { nombreCorto } from './Piezas';

const E = ES.gira.elegir;

/** Al empezar la gira: con quién vas. Arriba los que tienes; abajo los que faltan por desbloquear. */
export function ElegirCompanero({ onElegir }: { onElegir: (id: IdCompanero) => void }) {
  const [elegido, setElegido] = useState<IdCompanero>(COMPANEROS_INICIALES[0]!);
  return (
    <div className="pantalla">
      <div className="elegir__cabecera">
        <h2 className="pantalla__titulo">{E.titulo}</h2>
        <p className="pantalla__nota">{E.nota}</p>
      </div>
      <div className="elegir__lista" role="radiogroup" aria-label={E.titulo}>
        {COMPANEROS_INICIALES.map((id) => {
          const t = ES.companeros[id];
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={elegido === id}
              className={clases('compa-carta', elegido === id && 'compa-carta--elegida')}
              onClick={() => setElegido(id)}
            >
              <span className="marcador">{nombreCorto(t.nombre)}</span>
              <span>
                <span className="compa-carta__nombre">{t.nombre}</span>
                <span className="compa-carta__que">{E.siempre}</span>
                <span className="compa-carta__txt">{t.pasiva}</span>
                <span className="compa-carta__que">{E.sena(COMPANEROS[id].senas)}</span>
                <span className="compa-carta__txt">{t.sena}</span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="panel cerrados">
        <div className="rotulo">{E.porDesbloquear(POR_DESBLOQUEAR)}</div>
        <div className="cerrados__rejilla" aria-hidden="true">
          {Array.from({ length: POR_DESBLOQUEAR }, (_, i) => (
            <span key={i}>?</span>
          ))}
        </div>
        <div className="cerrados__pista">{E.pista}</div>
      </div>
      <div className="pantalla__abajo">
        <BotonApuesta variante="gualda" onClick={() => onElegir(elegido)}>
          {E.empezar}
        </BotonApuesta>
      </div>
    </div>
  );
}
