import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { warmInitialRoute } from './lib/routePrefetch';

if (typeof window !== 'undefined') {
  warmInitialRoute(window.location.pathname, window.location.search);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
