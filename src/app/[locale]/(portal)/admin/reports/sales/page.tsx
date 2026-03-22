'use client';

import { useState, useEffect } from 'react';
import { DollarSign, CreditCard, TrendingUp, Wallet, Download } from 'lucide-react';
import { LoadingState } from '@/components/admin/StateComponents';
import { useLocale } from 'next-intl';

export default function SalesReportsPage() {
    const locale = useLocale();
    const isAr = locale === 'ar';
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetch('/api/admin/stats?period=month')
            .then(r => r.ok ? r.json() : Promise.resolve({}))
            .then(data => setStats(data))
            .catch(() => setStats({}))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingState message={isAr ? 'جاري تحميل تقارير المبيعات...' : 'Loading sales reports...'} />;

    const kpis = [
        {
            label: isAr ? 'إجمالي الإيرادات' : 'Total Revenue',
            value: `${(stats?.revenue?.total || 0).toLocaleString()} AED`,
            icon: DollarSign,
            bg: 'bg-green-500',
        },
        {
            label: isAr ? 'المحصّل' : 'Collected',
            value: `${(stats?.revenue?.collected || 0).toLocaleString()} AED`,
            icon: CreditCard,
            bg: 'bg-blue-500',
        },
        {
            label: isAr ? 'معلق' : 'Pending',
            value: `${(stats?.revenue?.pending || 0).toLocaleString()} AED`,
            icon: Wallet,
            bg: 'bg-amber-500',
        },
        {
            label: isAr ? 'النمو' : 'Growth',
            value: `${stats?.revenue?.growth || 0}%`,
            icon: TrendingUp,
            bg: 'bg-teal-500',
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-green-600" />
                        {isAr ? 'تقارير المبيعات' : 'Sales Reports'}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isAr ? 'الإيرادات، المدفوعات، المصاريف، هامش الربح' : 'Revenue, payments, expenses, profit margins'}
                    </p>
                </div>
                <button className="admin-btn admin-btn-ghost">
                    <Download className="w-4 h-4" />
                    {isAr ? 'تصدير' : 'Export'}
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {kpis.map(kpi => {
                    const Icon = kpi.icon;
                    return (
                        <div key={kpi.label} className="admin-card p-4">
                            <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
                                <Icon className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-xl font-bold text-gray-800">{kpi.value}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
                        </div>
                    );
                })}
            </div>

            <div className="admin-card p-6">
                <h3 className="font-semibold text-gray-700 mb-4">
                    {isAr ? 'تفاصيل المبيعات' : 'Sales Details'}
                </h3>
                <div className="text-center py-12 text-gray-400">
                    <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>{isAr ? 'سيتم عرض بيانات المبيعات التفصيلية هنا' : 'Detailed sales data will appear here'}</p>
                </div>
            </div>
        </div>
    );
}
