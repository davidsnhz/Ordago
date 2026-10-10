import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BancoDePruebas } from './depuracion/BancoDePruebas';

const raiz = document.getElementById('raiz');
if (!raiz) throw new Error('Falta el elemento #raiz en index.html');

createRoot(raiz).render(
  <StrictMode>
    <BancoDePruebas />
  </StrictMode>,
);
