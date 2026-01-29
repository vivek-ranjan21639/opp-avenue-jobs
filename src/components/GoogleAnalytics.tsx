import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Replace with your GA Measurement ID
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Load GA script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: location.pathname + location.search,
    });

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return null;
};

export default GoogleAnalytics;
