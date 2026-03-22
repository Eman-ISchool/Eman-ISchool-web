/**
 * API Client Helper
 *
 * Provides a unified interface for switching between mock and live data.
 * All API clients use this helper to fetch data.
 */

/**
 * Mock data delay in milliseconds (configurable via environment variable)
 */
const MOCK_DELAY = parseInt(process.env.NEXT_PUBLIC_MOCK_DELAY || '500', 10)

/**
 * Check if mock data mode is enabled
 */
export const isMockDataEnabled = (): boolean => {
  const value = process.env.NEXT_PUBLIC_USE_MOCK_DATA?.toLowerCase()
  return value === 'true' || value === '1' || value === 'yes'
}

/**
 * Generic fetch function with mock/live switch
 */
export async function fetchWithFallback<T>(
  mockData: T,
  liveUrl: string,
  options?: RequestInit
): Promise<T> {
  if (isMockDataEnabled()) {
    // Simulate network delay for realistic loading states
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY))
    return mockData
  }

  try {
    const response = await fetch(liveUrl, options)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Failed to fetch from ${liveUrl}:`, error)
    // Fallback to mock data if live API fails
    return mockData
  }
}

/**
 * Generic fetch function with params
 */
export async function fetchWithParams<T>(
  mockData: T,
  liveUrl: string,
  params?: Record<string, string | number>
): Promise<T> {
  const queryString = params
    ? '?' + new URLSearchParams(params as Record<string, string>).toString()
    : ''
  return fetchWithFallback(mockData, `${liveUrl}${queryString}`)
}
