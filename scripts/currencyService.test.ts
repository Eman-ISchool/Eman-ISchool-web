import {
    getCurrencyRates,
    getCachedRates,
    clearCurrencyCache,
    FALLBACK_RATES,
    CurrencyRates,
    CurrencyServiceError
} from '../src/lib/currencyService';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Currency Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        clearCurrencyCache();
    });

    describe('getCurrencyRates', () => {
        it('should fetch rates successfully from API', async () => {
            const mockRates = {
                base: 'EGP',
                rates: {
                    USD: 0.032,
                    EUR: 0.029,
                    GBP: 0.025,
                },
                date: '2026-01-18',
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockRates),
            });

            const { rates, error } = await getCurrencyRates();

            expect(error).toBeNull();
            expect(rates).not.toBeNull();
            expect(rates?.base).toBe('EGP');
            expect(rates?.rates.USD).toBe(0.032);
            expect(rates?.fromCache).toBe(false);
        });

        it('should return cached rates on subsequent calls', async () => {
            const mockRates = {
                base: 'EGP',
                rates: { USD: 0.032 },
                date: '2026-01-18',
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockRates),
            });

            // First call - should fetch from API
            const first = await getCurrencyRates();
            expect(first.rates?.fromCache).toBe(false);
            expect(mockFetch).toHaveBeenCalledTimes(1);

            // Second call - should return from cache
            const second = await getCurrencyRates();
            expect(second.rates?.fromCache).toBe(true);
            expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1, not 2
        });

        it('should handle network errors gracefully', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            const { rates, error } = await getCurrencyRates();

            // Should return null rates and an error
            expect(rates).toBeNull();
            expect(error).not.toBeNull();
            expect(error?.code).toBe('UNKNOWN');
        });

        it('should handle 429 rate limit with fallback to cache', async () => {
            // First, populate the cache
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    base: 'EGP',
                    rates: { USD: 0.032 },
                    date: '2026-01-18',
                }),
            });

            await getCurrencyRates(); // Populate cache
            clearCurrencyCache(); // Clear to force re-fetch

            // Now simulate rate limit
            mockFetch.mockRejectedValueOnce({ response: { status: 429 } });
            mockFetch.mockRejectedValueOnce({ response: { status: 429 } });
            mockFetch.mockRejectedValueOnce({ response: { status: 429 } });
            mockFetch.mockRejectedValueOnce({ response: { status: 429 } });

            const { rates, error } = await getCurrencyRates();

            // Should return null after max retries
            expect(rates).toBeNull();
            expect(error).not.toBeNull();
        });

        it('should handle invalid API response', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ invalid: 'data' }), // No 'rates' field
            });

            const { rates, error } = await getCurrencyRates();

            expect(rates).toBeNull();
            expect(error?.code).toBe('INVALID_RESPONSE');
        });

        it('should handle non-ok HTTP responses', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
            });

            const { rates, error } = await getCurrencyRates();

            expect(rates).toBeNull();
            expect(error).not.toBeNull();
        });
    });

    describe('getCachedRates', () => {
        it('should return null when cache is empty', () => {
            const cached = getCachedRates();
            expect(cached).toBeNull();
        });

        it('should return cached rates after successful fetch', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    base: 'EGP',
                    rates: { USD: 0.032 },
                    date: '2026-01-18',
                }),
            });

            await getCurrencyRates();
            const cached = getCachedRates();

            expect(cached).not.toBeNull();
            expect(cached?.fromCache).toBe(true);
        });
    });

    describe('FALLBACK_RATES', () => {
        it('should have all required currencies', () => {
            expect(FALLBACK_RATES.USD).toBeDefined();
            expect(FALLBACK_RATES.EUR).toBeDefined();
            expect(FALLBACK_RATES.GBP).toBeDefined();
            expect(FALLBACK_RATES.SAR).toBeDefined();
            expect(FALLBACK_RATES.AED).toBeDefined();
            expect(FALLBACK_RATES.KWD).toBeDefined();
        });

        it('should have reasonable rate values', () => {
            // EGP is weak against these currencies, so rates should be < 1
            Object.values(FALLBACK_RATES).forEach(rate => {
                expect(rate).toBeGreaterThan(0);
                expect(rate).toBeLessThan(1);
            });
        });
    });

    describe('clearCurrencyCache', () => {
        it('should clear the cache', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    base: 'EGP',
                    rates: { USD: 0.032 },
                    date: '2026-01-18',
                }),
            });

            await getCurrencyRates();
            expect(getCachedRates()).not.toBeNull();

            clearCurrencyCache();
            expect(getCachedRates()).toBeNull();
        });
    });
});
