/**
 * Capacitor Network Status Listener
 *
 * Monitors network connectivity changes and provides offline detection
 * for the Capacitor mobile app.
 */

import { Network } from '@capacitor/network';
import { Capacitor } from '@capacitor/core';

/**
 * Network error state for tracking connection issues
 */
export interface NetworkErrorState {
  hasError: boolean;
  message: string;
  canRetry: boolean;
  retryCount: number;
}

/**
 * Retry configuration
 */
interface RetryConfig {
  maxRetries?: number;
  delayMs?: number;
  onRetry?: (attempt: number) => void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  delayMs: 1000,
  onRetry: () => {},
  onSuccess: () => {},
  onError: () => {},
};

/**
 * Retry a function with exponential backoff
 * @param fn - Async function to retry
 * @param config - Retry configuration
 * @returns Result of the function or throws error after max retries
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const { maxRetries, delayMs, onRetry, onSuccess, onError } = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  };

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      onSuccess();
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = delayMs * Math.pow(2, attempt - 1);
        onRetry(attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        onError(lastError);
      }
    }
  }

  throw lastError || new Error('Retry failed');
}

/**
 * Initialize network status listener
 * Adds event listener for connectivity changes and handles offline/online states
 */
export const initNetworkListener = () => {
  // Only run in Capacitor environment (mobile app)
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  Network.addListener('networkStatusChange', (status) => {
    if (!status.connected) {
      // Show offline UI
      document.body.classList.add('app-offline');
    } else {
      // Hide offline UI and reload
      document.body.classList.remove('app-offline');
      window.location.reload();
    }
  });
};

/**
 * Check current network status
 * Returns true if connected, false otherwise
 */
export const checkNetworkStatus = async (): Promise<boolean> => {
  // Only run in Capacitor environment
  if (!Capacitor.isNativePlatform()) {
    return true; // Assume connected on web
  }

  const status = await Network.getStatus();
  return status.connected;
};

/**
 * Initialize network monitoring on app startup
 * Should be called from the app entry point
 */
export const initNetworkMonitoring = async () => {
  // Only initialize in Capacitor environment
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  // Set initial state
  const isConnected = await checkNetworkStatus();
  if (!isConnected) {
    document.body.classList.add('app-offline');
  }

  // Start listening for changes
  initNetworkListener();
};

/**
 * Wait for network to be available with timeout
 * @param timeoutMs - Maximum time to wait in milliseconds
 * @returns Promise that resolves when network is available
 */
export const waitForNetwork = async (timeoutMs = 30000): Promise<boolean> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const isConnected = await checkNetworkStatus();
    if (isConnected) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return false;
};

/**
 * Create a network error state object
 * @param message - Error message
 * @param canRetry - Whether the operation can be retried
 * @returns Network error state
 */
export const createNetworkError = (
  message: string,
  canRetry: boolean = true
): NetworkErrorState => ({
  hasError: true,
  message,
  canRetry,
  retryCount: 0,
});

/**
 * Reset network error state
 * @returns Clean network error state
 */
export const resetNetworkError = (): NetworkErrorState => ({
  hasError: false,
  message: '',
  canRetry: true,
  retryCount: 0,
});
