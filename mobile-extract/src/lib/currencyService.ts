/**
 * Currency Service - Fetches exchange rates from Frankfurter API
 * 
 * Features:
 * - Server-side caching with TTL
 * - Rate limiting protection
 * - Error handling with retries
 * - Type-safe rate structure
 */

const FRANKFURTER_API = 'https://api.frankfurter.app';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Base currency for the app (Egyptian Pound)
const BASE_CURRENCY = 'EGP';

// Target currencies we need for the app
const TARGET_CURRENCIES = ['USD', 'EUR', 'GBP', 'SAR', 'AED', 'KWD'];

export interface CurrencyRates {
    base: string;
    rates: Record<string, number>;
    lastUpdated: Date;
    fromCache: boolean;
}

export interface CurrencyServiceError {
    message: string;
    code: 'NETWORK_ERROR' | 'RATE_LIMIT' | 'INVALID_RESPONSE' | 'TIMEOUT' | 'UNKNOWN';
    retryable: boolean;
}

// In-memory cache for server-side rates
let cachedRates: CurrencyRates | null = null;
let cacheTimestamp: number = 0;

/**
 * Delay helper for retry logic
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check if cache is still valid
 */
function isCacheValid(): boolean {
    if (!cachedRates) return false;
    return Date.now() - cacheTimestamp < CACHE_TTL;
}

/**
 * Get cached rates if available
 */
export function getCachedRates(): CurrencyRates | null {
    if (isCacheValid()) {
        return { ...cachedRates!, fromCache: true };
    }
    return null;
}

/**
 * Fetch rates from external API with retry logic
 */
async function fetchRatesFromAPI(retryCount = 0): Promise<CurrencyRates> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(
            `${FRANKFURTER_API}/latest?from=${BASE_CURRENCY}&to=${TARGET_CURRENCIES.join(',')}`,
            { signal: controller.signal }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
            if (response.status === 429) {
                throw { code: 'RATE_LIMIT', retryable: true };
            }
            throw { code: 'INVALID_RESPONSE', retryable: false };
        }

        const data = await response.json();

        if (!data.rates || typeof data.rates !== 'object') {
            throw { code: 'INVALID_RESPONSE', retryable: false };
        }

        return {
            base: data.base || BASE_CURRENCY,
            rates: data.rates,
            lastUpdated: new Date(data.date || Date.now()),
            fromCache: false,
        };
    } catch (error: any) {
        // Handle abort (timeout)
        if (error.name === 'AbortError') {
            if (retryCount < MAX_RETRIES) {
                await delay(RETRY_DELAY * (retryCount + 1));
                return fetchRatesFromAPI(retryCount + 1);
            }
            throw { code: 'TIMEOUT', retryable: false, message: 'Request timed out' };
        }

        // Handle rate limiting with retry
        if (error.code === 'RATE_LIMIT' && retryCount < MAX_RETRIES) {
            await delay(RETRY_DELAY * (retryCount + 1));
            return fetchRatesFromAPI(retryCount + 1);
        }

        // Handle network errors
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            throw { code: 'NETWORK_ERROR', retryable: true, message: 'Network unavailable' };
        }

        throw {
            code: error.code || 'UNKNOWN',
            retryable: error.retryable ?? false,
            message: error.message || 'Unknown error occurred',
        };
    }
}

/**
 * Main function to get currency rates
 * Uses cache when available, falls back to API
 */
export async function getCurrencyRates(): Promise<{ rates: CurrencyRates | null; error: CurrencyServiceError | null }> {
    // Check cache first
    if (isCacheValid()) {
        return { rates: { ...cachedRates!, fromCache: true }, error: null };
    }

    try {
        const rates = await fetchRatesFromAPI();

        // Update cache
        cachedRates = rates;
        cacheTimestamp = Date.now();

        return { rates, error: null };
    } catch (error: any) {
        // If we have stale cache, return it as fallback
        if (cachedRates) {
            return {
                rates: { ...cachedRates, fromCache: true },
                error: {
                    code: error.code || 'UNKNOWN',
                    message: 'Using cached rates due to API error',
                    retryable: true,
                },
            };
        }

        return {
            rates: null,
            error: {
                code: error.code || 'UNKNOWN',
                message: error.message || 'Failed to fetch currency rates',
                retryable: error.retryable ?? false,
            },
        };
    }
}

/**
 * Fallback rates if API is unavailable (hardcoded defaults)
 * These should only be used as last resort
 */
export const FALLBACK_RATES: Record<string, number> = {
    USD: 0.032,
    EUR: 0.029,
    GBP: 0.025,
    SAR: 0.12,
    AED: 0.118,
    KWD: 0.0098,
};

/**
 * Clear the cache (useful for testing or force refresh)
 */
export function clearCurrencyCache(): void {
    cachedRates = null;
    cacheTimestamp = 0;
}
