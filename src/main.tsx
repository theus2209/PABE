import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// Prevenir pull-to-refresh no mobile
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', (e) => {
  touchStartY = e.touches[0].clientY;
}, { passive: false });

document.addEventListener('touchmove', (e) => {
  touchEndY = e.touches[0].clientY;
  
  if (window.scrollY === 0 && touchEndY > touchStartY) {
    e.preventDefault();
  }
}, { passive: false });

console.log('✅ PABE v4.1.0 - Módulo Carga Horária adicionado');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
