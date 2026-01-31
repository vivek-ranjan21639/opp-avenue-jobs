import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './index.css'

const root = createRoot(document.getElementById("root")!);
root.render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

// Signal prerenderer that the app shell is ready
// Individual pages will dispatch their own events when data loads
window.addEventListener('load', () => {
  // Fallback: dispatch prerender-ready after 5 seconds if page doesn't dispatch it
  setTimeout(() => {
    if (!document.querySelector('[data-prerender-ready]')) {
      document.dispatchEvent(new Event('prerender-ready'));
    }
  }, 5000);
});
