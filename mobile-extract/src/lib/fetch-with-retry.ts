/**
 * fetchWithRetry - Retry failed fetch requests with exponential backoff
 * 
 * This utility implements Constitution Principle V (Observability & Quality)
 * by providing resilient HTTP client functionality for teacher portal pages.
 * 
 * @param url - The URL to fetch
 * @param options - Fetch options (method, headers, body, etc.)
 * @param maxAttempts - Maximum number of retry attempts (default: 3)
 * @returns Promise<Response> - The fetch response
 * @throws Error - If all retry attempts fail
 */
export async function fetchWithRetry(
  url: string | URL,
  options: RequestInit = {},
  maxAttempts: number = 3
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // If response is OK, return it immediately
      if (response.ok) {
        return response;
      }
      
      // For non-OK responses, check if it's retryable
      // Retry on: 408 (Request Timeout), 429 (Too Many Requests), 500+, 502, 503, 504
      const isRetryableStatus = 
        response.status === 408 ||
        response.status === 429 ||
        response.status >= 500 ||
        [502, 503, 504].includes(response.status);
      
      if (!isRetryableStatus) {
        // Don't retry client errors (4xx except 408, 429)
        return response;
      }
      
      // If this was the last attempt, return the error response
      if (attempt === maxAttempts) {
        return response;
      }
      
      // Calculate exponential backoff delay: 100ms, 200ms, 400ms, etc.
      const delayMs = 100 * Math.pow(2, attempt - 1);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs));
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // If this was the last attempt, throw the error
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      // Calculate exponential backoff delay
      const delayMs = 100 * Math.pow(2, attempt - 1);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('fetchWithRetry failed with unknown error');
}

/**
 * Helper function to parse JSON response with retry
 */
export async function fetchJsonWithRetry<T = any>(
  url: string | URL,
  options: RequestInit = {},
  maxAttempts: number = 3
): Promise<T> {
  const response = await fetchWithRetry(url, options, maxAttempts);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json() as Promise<T>;
}
