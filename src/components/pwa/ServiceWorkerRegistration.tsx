'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker on mount.
 * next-pwa handles generation, but in dev mode it's disabled.
 * This component ensures SW registration in production.
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      // Defer SW registration until after the page is interactive
      // to avoid competing with critical resource loading
      const registerSW = () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            // Check for updates periodically
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (
                    newWorker.state === 'activated' &&
                    navigator.serviceWorker.controller
                  ) {
                    // New SW activated, content has been cached for offline
                  }
                });
              }
            });
          })
          .catch(() => {
            // SW registration failed — non-critical, degrade gracefully
          });
      };

      // Wait until page is idle before registering SW
      if ('requestIdleCallback' in window) {
        requestIdleCallback(registerSW);
      } else {
        setTimeout(registerSW, 2000);
      }
    }
  }, []);

  return null;
}
