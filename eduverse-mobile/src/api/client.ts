/**
 * API client with exponential backoff retry logic
 * Handles authentication, token refresh, and error recovery
 */

import { getAuth, storeAuth, clearAuth } from '@/services/storage';

const API_BASE_URL = 'https://your-domain.com/api';

// Sleep utility for exponential backoff
const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Fetch wrapper with exponential backoff retry
 * Max 3 retries with 1s, 2s, 4s delays
 */
export async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Get current auth credentials
      const auth = await getAuth();
      
      // Add auth headers if available
      const headers: any = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      };

      if (auth?.accessToken) {
        headers['Authorization'] = `Bearer ${auth.accessToken}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized - try token refresh
      if (response.status === 401 && auth?.refreshToken) {
        console.log('Token expired, attempting refresh...');
        
        try {
          // Refresh token
          const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: auth.refreshToken }),
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            await storeAuth({
              accessToken: refreshData.accessToken,
              refreshToken: auth.refreshToken,
              expiresAt: new Date(Date.now() + refreshData.expiresIn * 1000).toISOString(),
            });
            
            // Retry the original request with new token
            continue;
          } else {
            // Token refresh failed, clear auth
            await clearAuth();
            throw new ApiError(401, 'UNAUTHORIZED', 'Session expired and refresh failed', false);
          }
        } catch (refreshError) {
          await clearAuth();
          throw new ApiError(401, 'UNAUTHORIZED', 'Session expired and refresh failed', false);
        }
      }

      // Handle other error status codes
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const apiError = errorData.error || {};
        
        // Don't retry on client errors (4xx except 401)
        if (response.status >= 400 && response.status < 500 && response.status !== 401) {
          throw new ApiError(
            response.status,
            apiError.code || 'UNKNOWN_ERROR',
            apiError.message || 'Request failed',
            false
          );
        }

        // Retry on server errors (5xx)
        lastError = new ApiError(
          response.status,
          apiError.code || 'UNKNOWN_ERROR',
          apiError.message || 'Request failed',
          true
        );
        throw lastError;
      }

      // Success
      return (await response.json()) as T;
    } catch (error) {
      // If this is our ApiError, rethrow it
      if (error instanceof ApiError) {
        throw error;
      }

      // Network errors - retry with exponential backoff
      lastError = error as Error;
      
      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        throw lastError;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
      await sleep(delay);
    }
  }

  // Should never reach here
  throw lastError || new Error('Unknown error');
}

/**
 * GET request helper
 */
export async function get<T>(endpoint: string, options?: RequestInit): Promise<T> {
  return fetchWithRetry<T>(`${API_BASE_URL}${endpoint}`, {
    ...options,
    method: 'GET',
  });
}

/**
 * POST request helper
 */
export async function post<T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
  return fetchWithRetry<T>(`${API_BASE_URL}${endpoint}`, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT request helper
 */
export async function put<T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
  return fetchWithRetry<T>(`${API_BASE_URL}${endpoint}`, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PATCH request helper
 */
export async function patch<T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
  return fetchWithRetry<T>(`${API_BASE_URL}${endpoint}`, {
    ...options,
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE request helper
 */
export async function del<T>(endpoint: string, options?: RequestInit): Promise<T> {
  return fetchWithRetry<T>(`${API_BASE_URL}${endpoint}`, {
    ...options,
    method: 'DELETE',
  });
}
