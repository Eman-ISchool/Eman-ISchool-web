'use client';

import { useEffect, useState } from 'react';
import { initNetworkMonitoring, checkNetworkStatus, NetworkErrorState, resetNetworkError } from '@/lib/capacitor-network';
import { OfflineIndicator } from './OfflineIndicator';
import { ConnectionError } from './ConnectionError';

/**
 * Network Monitor Component
 *
 * Initializes Capacitor network monitoring for offline detection.
 * Renders offline indicator and connection error components when appropriate.
 * Only runs in Capacitor (mobile) environment.
 */
export default function NetworkMonitor() {
  const [networkError, setNetworkError] = useState<NetworkErrorState>(resetNetworkError());
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Initialize network monitoring on component mount
    initNetworkMonitoring();

    // Check initial network status
    checkInitialConnection();

    // Cleanup function (optional, Capacitor handles listener removal)
    return () => {
      // Capacitor Network plugin handles cleanup internally
    };
  }, []);

  const checkInitialConnection = async () => {
    setIsChecking(true);
    try {
      const isConnected = await checkNetworkStatus();
      if (!isConnected) {
        setNetworkError({
          hasError: true,
          message: 'Unable to connect to the server. Please check your internet connection.',
          canRetry: true,
          retryCount: 0,
        });
      }
    } catch (error) {
      setNetworkError({
        hasError: true,
        message: 'Network error occurred. Please try again.',
        canRetry: true,
        retryCount: 0,
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleRetry = () => {
    setNetworkError(prev => ({
      ...prev,
      retryCount: prev.retryCount + 1,
    }));
    checkInitialConnection();
  };

  // Render offline indicator and connection error
  return (
    <>
      <OfflineIndicator />
      {networkError.hasError && !isChecking && (
        <ConnectionError
          message={networkError.message}
          onRetry={networkError.canRetry ? handleRetry : undefined}
        />
      )}
    </>
  );
}
