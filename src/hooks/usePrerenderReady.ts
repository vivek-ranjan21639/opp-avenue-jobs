import { useEffect, useRef } from 'react';

/**
 * Hook to signal that a page is ready for prerendering
 * Call this when critical data has loaded
 */
export function usePrerenderReady(isReady: boolean) {
  const hasDispatched = useRef(false);

  useEffect(() => {
    if (isReady && !hasDispatched.current) {
      hasDispatched.current = true;
      
      // Mark that this page has handled prerender
      const marker = document.createElement('div');
      marker.setAttribute('data-prerender-ready', 'true');
      marker.style.display = 'none';
      document.body.appendChild(marker);
      
      // Dispatch the prerender-ready event
      document.dispatchEvent(new Event('prerender-ready'));
    }
  }, [isReady]);
}
