/**
 * API Client Helper
 *
 * Provides a unified fetch interface for all API clients.
 * All data comes from the live API — no mock fallback.
 * Includes request deduplication to prevent duplicate concurrent fetches.
 */

// In-flight GET request deduplication map
const inflightRequests = new Map<string, Promise<any>>();

/**
 * Fetch data from an API endpoint.
 * GET requests are deduplicated — concurrent identical fetches share one network call.
 * Throws on error — callers handle errors via try/catch.
 */
export async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const method = options?.method?.toUpperCase() || 'GET';

  // Only deduplicate GET requests
  if (method === 'GET') {
    const existing = inflightRequests.get(url);
    if (existing) return existing as Promise<T>;

    const promise = doFetch<T>(url, options).finally(() => {
      inflightRequests.delete(url);
    });
    inflightRequests.set(url, promise);
    return promise;
  }

  return doFetch<T>(url, options);
}

async function doFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options)
  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${url}`)
  }
  return await response.json()
}

/**
 * Fetch data with query parameters.
 */
export async function fetchApiWithParams<T>(
  url: string,
  params?: Record<string, string | number>
): Promise<T> {
  const queryString = params
    ? '?' + new URLSearchParams(
        Object.entries(params).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {} as Record<string, string>)
      ).toString()
    : ''
  return fetchApi<T>(`${url}${queryString}`)
}
