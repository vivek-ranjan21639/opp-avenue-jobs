import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './index.css'

// Initialize prerenderReady for Netlify's Prerender extension
window.prerenderReady = false;

const root = createRoot(document.getElementById("root")!);
root.render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

// Fallback: if no page signals ready within 5 seconds, signal anyway
window.addEventListener('load', () => {
  setTimeout(() => {
    if (!window.prerenderReady) {
      window.prerenderReady = true;
    }
  }, 5000);
});
