import { useEffect, useRef } from 'react';

/**
 * Hook to signal that a page is ready for prerendering.
 * Sets window.prerenderReady = true, which Netlify's Prerender extension checks.
 */
export function usePrerenderReady(isReady: boolean) {
  const hasSignaled = useRef(false);

  useEffect(() => {
    if (isReady && !hasSignaled.current) {
      hasSignaled.current = true;
      window.prerenderReady = true;
    }
  }, [isReady]);
}
