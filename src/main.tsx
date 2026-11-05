import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Não foi encontrado o elemento raiz da aplicação.');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
