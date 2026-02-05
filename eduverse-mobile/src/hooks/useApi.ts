/**
 * useApi hook
 * Generic API hook with loading, error, and retry logic
 */

import { useState, useCallback } from 'react';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  retryCount?: number;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: any[]) => Promise<void>;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = options.retryCount || 3;

  const execute = useCallback(
    async (...args: any[]) => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await apiFunction(...args);
        
        setData(result);
        setLoading(false);
        
        if (options.onSuccess) {
          options.onSuccess(result);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An error occurred');
        
        if (retryCount < maxRetries) {
          setRetryCount(retryCount + 1);
          setError(error);
          setLoading(false);
        } else {
          setError(error);
          setLoading(false);
          
          if (options.onError) {
            options.onError(error);
          }
        }
      }
    },
    [apiFunction, options, retryCount, maxRetries, options.onSuccess, options.onError]
  );

  return {
    data,
    loading,
    error,
    execute,
  };
}

export default useApi;
