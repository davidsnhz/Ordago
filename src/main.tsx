import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { cargarFuentes } from './ui/arte';
import './ui/estilos/tokens.css';
import './ui/estilos/base.css';

const raiz = document.getElementById('raiz');
if (!raiz) throw new Error('Falta el elemento #raiz en index.html');

cargarFuentes();
createRoot(raiz).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
