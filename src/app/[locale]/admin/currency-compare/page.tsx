'use client';

import { useMemo, useState, useEffect } from 'react';
import { Coins, ArrowUpRight, RefreshCw, AlertCircle } from 'lucide-react';

const FALLBACK_RATES = {
    USD: 0.032,
    EUR: 0.029,
    GBP: 0.025,
    SAR: 0.12,
    AED: 0.118,
    KWD: 0.0098,
};

const currencyLabels = {
    USD: { label: 'الدولار الأمريكي', symbol: '$', flag: '🇺🇸' },
    EUR: { label: 'اليورو', symbol: '€', flag: '🇪🇺' },
    GBP: { label: 'الجنيه الإسترليني', symbol: '£', flag: '🇬🇧' },
    SAR: { label: 'الريال السعودي', symbol: 'ر.س', flag: '🇸🇦' },
    AED: { label: 'الدرهم الإماراتي', symbol: 'د.إ', flag: '🇦🇪' },
    KWD: { label: 'الدينار الكويتي', symbol: 'د.ك', flag: '🇰🇼' },
};

interface RatesResponse {
    success: boolean;
    base: string;
    rates: Record<string, number>;
    lastUpdated: string;
    fromCache?: boolean;
    fallback?: boolean;
    warning?: string;
}

export default function CurrencyComparePage() {
    const [basePrice, setBasePrice] = useState(500);
    const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [isFallback, setIsFallback] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRates = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/currencies');
            const data: RatesResponse = await response.json();

            if (data.rates) {
                setRates(data.rates);
                setLastUpdated(data.lastUpdated);
                setIsFallback(data.fallback || false);
                if (data.warning) {
                    setError(data.warning);
                }
            }
        } catch (err) {
            setError('فشل في تحميل أسعار العملات، استخدام الأسعار الافتراضية');
            setRates(FALLBACK_RATES);
            setIsFallback(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRates();
    }, []);

    const computed = useMemo(
        () =>
            Object.entries(rates).map(([code, rate]) => {
                const meta = currencyLabels[code as keyof typeof currencyLabels];
                if (!meta) return null;
                return {
                    code,
                    rate,
                    value: basePrice * rate,
                    ...meta,
                };
            }).filter(Boolean),
        [basePrice, rates]
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">مقارنة العملات</h1>
                    <p className="text-gray-500">اعرف تكلفة الطالب بالجنيه المصري مقارنةً بالعملات الأخرى.</p>
                </div>
                <div className="flex items-center gap-2">
                    {lastUpdated && (
                        <span className="text-xs text-gray-400">
                            آخر تحديث: {new Date(lastUpdated).toLocaleDateString('ar-EG')}
                        </span>
                    )}
                    <button
                        onClick={fetchRates}
                        disabled={loading}
                        className="admin-btn admin-btn-ghost admin-btn-icon"
                        title="تحديث الأسعار"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Warning/Error Banner */}
            {(error || isFallback) && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error || 'استخدام الأسعار الافتراضية'}</span>
                </div>
            )}

            <div className="admin-card">
                <div className="admin-card-header flex items-center justify-between">
                    <h3 className="admin-card-title">
                        <Coins className="w-5 h-5 text-teal-500" />
                        السعر الأساسي بالجنيه المصري
                    </h3>
                </div>
                <div className="admin-card-body">
                    <div className="grid md:grid-cols-3 gap-4 items-end">
                        <div className="md:col-span-2">
                            <label className="admin-label" htmlFor="egp-price">قيمة الاشتراك (ج.م)</label>
                            <input
                                id="egp-price"
                                type="number"
                                min={1}
                                value={basePrice}
                                onChange={(event) => setBasePrice(Number(event.target.value))}
                                className="admin-input"
                                placeholder="مثال: 500"
                            />
                        </div>
                        <div className="p-4 rounded-xl bg-teal-50 border border-teal-100 text-center">
                            <p className="text-sm text-teal-700">السعر بالجنيه المصري</p>
                            <p className="text-3xl font-bold text-teal-800">
                                {basePrice.toLocaleString('ar-EG')} ج.م
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {loading ? (
                    // Loading skeleton
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="admin-card p-4 animate-pulse">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gray-200 rounded" />
                                    <div>
                                        <div className="h-3 w-20 bg-gray-200 rounded mb-1" />
                                        <div className="h-4 w-12 bg-gray-200 rounded" />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="h-3 w-16 bg-gray-200 rounded mb-1" />
                                <div className="h-6 w-24 bg-gray-200 rounded" />
                            </div>
                        </div>
                    ))
                ) : (
                    computed.map((currency) => currency && (
                        <div key={currency.code} className="admin-card p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{currency.flag}</span>
                                    <div>
                                        <p className="text-sm text-gray-500">{currency.label}</p>
                                        <p className="font-semibold text-gray-800">{currency.code}</p>
                                    </div>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-teal-500" />
                            </div>
                            <div className="mt-4">
                                <p className="text-sm text-gray-500">القيمة المقابلة</p>
                                <p className="text-xl md:text-2xl font-bold text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis">
                                    {currency.symbol} {currency.value.toFixed(2)}
                                </p>
                            </div>
                            <div className="mt-3 text-xs text-gray-400 truncate">
                                معدل التحويل: 1 ج.م = {currency.rate.toFixed(4)} {currency.code}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
