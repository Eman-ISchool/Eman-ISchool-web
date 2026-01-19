import { NextResponse } from 'next/server';
import { getCurrencyRates, FALLBACK_RATES } from '@/lib/currencyService';

/**
 * GET /api/currencies
 * Returns current exchange rates from EGP to target currencies
 * 
 * Uses Frankfurter API with caching and fallback support
 */
export async function GET() {
    try {
        const { rates, error } = await getCurrencyRates();

        if (rates) {
            return NextResponse.json({
                success: true,
                base: rates.base,
                rates: rates.rates,
                lastUpdated: rates.lastUpdated.toISOString(),
                fromCache: rates.fromCache,
                warning: error?.message,
            });
        }

        // API failed and no cache available - use fallback rates
        return NextResponse.json({
            success: true,
            base: 'EGP',
            rates: FALLBACK_RATES,
            lastUpdated: new Date().toISOString(),
            fromCache: false,
            fallback: true,
            warning: 'Using fallback rates - API unavailable',
        });
    } catch (err: any) {
        console.error('Currency API error:', err);

        // Return fallback rates even on error
        return NextResponse.json({
            success: true,
            base: 'EGP',
            rates: FALLBACK_RATES,
            lastUpdated: new Date().toISOString(),
            fromCache: false,
            fallback: true,
            error: 'Using fallback rates due to API error',
        });
    }
}
