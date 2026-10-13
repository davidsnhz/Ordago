import { useCallback } from 'react';
import type { Gira } from '../../../estado/gira';
import { aplicarNovedades, mesaInicial } from '../../../estado/mesa';
import { useGira } from '../../../estado/useGira';
import { ES } from '../../../textos/es';
import { Escenario } from '../../componentes/Escenario';
import { Mesa } from '../Mesa';
import { ElegirCompanero } from './ElegirCompanero';
import { Mapa } from './Mapa';
import { Resultado } from './Resultado';
import { Era, FinDeGira, Plaza, PremioDelJefe } from './Sucesos';
import { Taberna } from './Taberna';
import './gira.css';

/** La gira entera: cada momento con su pantalla. */
export function PantallaGira({
  inicial,
  onLibreta,
  onPortada,
  onOtraGira,
}: {
  inicial: Gira;
  onLibreta: () => void;
  onPortada: () => void;
  onOtraGira: () => void;
}) {
  const g = useGira(inicial);
  const { gira, inicioDuelo } = g;
  const { momento } = gira;

  const partidaEnCurso = momento.tipo === 'duelo' ? momento.partida : null;
  // La mesa empieza contando el reparto si el duelo es nuevo; si se retoma, desde donde se guardó.
  const inicioMesa = useCallback(
    () => (inicioDuelo ? aplicarNovedades(mesaInicial(inicioDuelo.partida), inicioDuelo) : mesaInicial(partidaEnCurso!)),
    // Solo cuenta al montar la mesa (una por duelo).
    [partidaEnCurso?.semilla],
  );

  if (momento.tipo === 'duelo') {
    return (
      <Mesa
        key={momento.partida.semilla}
        modo={{
          tipo: 'gira',
          inicio: inicioMesa,
          alGuardar: g.alGuardar,
          bolsa: gira.bolsa,
          onGastar: g.gastar,
          onTerminar: g.terminar,
          onSalir: onPortada,
        }}
      />
    );
  }

  return (
    <Escenario avisoGirar={ES.mesa.girar}>
      {momento.tipo === 'companero' && <ElegirCompanero onElegir={g.elegirCompanero} />}
      {momento.tipo === 'mapa' && <Mapa gira={gira} onJugar={g.aLaMesa} onLibreta={onLibreta} onSalir={onPortada} />}
      {momento.tipo === 'resultado' && <Resultado gira={gira} resumen={momento.resumen} onParada={g.parada} onSeguir={g.seguir} />}
      {momento.tipo === 'taberna' && (
        <Taberna gira={gira} oferta={momento.oferta} onComprar={g.comprar} onVender={g.vender} onOtraRonda={g.otraRonda} onSalir={g.alMapa} />
      )}
      {momento.tipo === 'plaza' && (
        <Plaza gira={gira} evento={momento.evento} desenlace={momento.desenlace} onResponder={g.responderPlaza} onSeguir={g.alMapa} />
      )}
      {momento.tipo === 'era' && <Era gira={gira} antes={momento.antes} despues={momento.despues} onSeguir={g.alMapa} />}
      {momento.tipo === 'premio' && <PremioDelJefe gira={gira} onElegir={g.premio} />}
      {momento.tipo === 'fin' && <FinDeGira gira={gira} victoria={momento.victoria} onOtra={onOtraGira} onPortada={onPortada} />}
    </Escenario>
  );
}
