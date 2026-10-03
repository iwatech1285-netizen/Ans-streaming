import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

// Guard against multiple mounts from fallback scripts
if (!(window as any).__ANS_ANIME_MOUNTED__) {
  (window as any).__ANS_ANIME_MOUNTED__ = true;

  const rootElement = document.getElementById('root');
  if (rootElement) {
    // Immediately remove HTML preloader
    const preloader = document.getElementById('app-preloader');
    if (preloader) {
      preloader.remove();
    }

    createRoot(rootElement).render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  }
}
