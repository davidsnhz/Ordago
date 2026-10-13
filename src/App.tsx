import { lazy, Suspense, useState } from 'react';
import type { IdRival } from './datos/rivales';
import { borrarGira, cargarGira, nuevaGira, type Gira } from './estado/gira';
import { rivalDeLaDireccion } from './estado/useDuelo';
import { PantallaGira } from './ui/pantallas/gira/PantallaGira';
import { Mesa } from './ui/pantallas/Mesa';
import { ElegirRivalSuelto, PantallaLibreta, Portada } from './ui/pantallas/Portada';

// El banco de pruebas del motor (fase 1) sigue disponible en ?banco.
const BancoDePruebas = lazy(() => import('./depuracion/BancoDePruebas').then((m) => ({ default: m.BancoDePruebas })));

type Pantalla =
  | { tipo: 'portada' }
  | { tipo: 'gira'; gira: Gira }
  | { tipo: 'elegirRival' }
  | { tipo: 'suelto'; rival?: IdRival }
  | { tipo: 'libreta'; volver: Pantalla };

/** La semilla de cada gira sale del reloj; a partir de ahí, todo el azar de la gira es reproducible. */
const semillaDeGira = () => `gira-${Date.now().toString(36)}`;

/** `?rival=chema` lleva directo a un duelo suelto (para probar); si no, la portada. */
function pantallaInicial(): Pantalla {
  const rival = rivalDeLaDireccion();
  return rival ? { tipo: 'suelto', rival } : { tipo: 'portada' };
}

export function App() {
  const [pantalla, setPantalla] = useState<Pantalla>(pantallaInicial);

  if (new URLSearchParams(window.location.search).has('banco')) {
    return (
      <Suspense fallback={null}>
        <BancoDePruebas />
      </Suspense>
    );
  }

  const aPortada = () => setPantalla({ tipo: 'portada' });
  const giraNueva = () => {
    borrarGira();
    setPantalla({ tipo: 'gira', gira: nuevaGira(semillaDeGira()) });
  };

  switch (pantalla.tipo) {
    case 'portada': {
      const guardada = cargarGira();
      return (
        <Portada
          guardada={guardada}
          onSeguir={() => guardada && setPantalla({ tipo: 'gira', gira: guardada })}
          onNueva={giraNueva}
          onSuelto={() => setPantalla({ tipo: 'elegirRival' })}
          onLibreta={() => setPantalla({ tipo: 'libreta', volver: pantalla })}
        />
      );
    }
    case 'gira':
      return (
        <PantallaGira
          // Al volver de la Libreta, la gira sigue desde lo guardado.
          key={pantalla.gira.semilla}
          inicial={pantalla.gira}
          onLibreta={() => {
            const guardada = cargarGira();
            setPantalla({ tipo: 'libreta', volver: guardada ? { tipo: 'gira', gira: guardada } : { tipo: 'portada' } });
          }}
          onPortada={aPortada}
          onOtraGira={giraNueva}
        />
      );
    case 'elegirRival':
      return <ElegirRivalSuelto onElegir={(rival) => setPantalla({ tipo: 'suelto', rival })} onVolver={aPortada} />;
    case 'suelto':
      return <Mesa key={pantalla.rival ?? 'suelto'} modo={{ tipo: 'suelto', rival: pantalla.rival, onSalir: aPortada }} />;
    case 'libreta':
      return <PantallaLibreta onCerrar={() => setPantalla(pantalla.volver)} />;
  }
}
