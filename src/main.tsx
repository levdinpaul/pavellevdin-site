import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './i18n';
import './index.css';

const rootElement = document.getElementById('root')!;

const app = (
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);

// Если разметка уже отрендерена пререндером — гидрируем, иначе обычный рендер.
// Гидрацию откладываем до простоя главного потока: пререндер уже показал первый экран,
// а гидрация React — самая тяжёлая задача при загрузке (~1.7s на 4× throttle мобиле) и,
// запускаясь до первого paint, отодвигает LCP/FCP. Отложив её за requestIdleCallback,
// даём браузеру покрасить контент сразу, а интерактив «доезжает» в простое (cap 1.5s).
if (rootElement.hasChildNodes()) {
  const hydrate = () => ReactDOM.hydrateRoot(rootElement, app);
  if ('requestIdleCallback' in window) {
    requestIdleCallback(hydrate, { timeout: 1500 });
  } else {
    setTimeout(hydrate, 200);
  }
} else {
  ReactDOM.createRoot(rootElement).render(app);
}