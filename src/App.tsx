import { lazy, Suspense } from 'react';
import { Mesa } from './ui/pantallas/Mesa';

// El banco de pruebas del motor (fase 1) sigue disponible en ?banco.
const BancoDePruebas = lazy(() => import('./depuracion/BancoDePruebas').then((m) => ({ default: m.BancoDePruebas })));

export function App() {
  if (new URLSearchParams(window.location.search).has('banco')) {
    return (
      <Suspense fallback={null}>
        <BancoDePruebas />
      </Suspense>
    );
  }
  return <Mesa />;
}
