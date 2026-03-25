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
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration.scope);

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
                  console.log('New SW activated — offline ready');
                }
              });
            }
          });
        })
        .catch((err) => {
          console.error('SW registration failed:', err);
        });
    }
  }, []);

  return null;
}
