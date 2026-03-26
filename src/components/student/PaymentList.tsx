'use client';

import { useLanguage } from '@/context/LanguageContext';
import { CreditCard, Clock, CheckCircle } from 'lucide-react';

interface Payment {
    id: string;
    merchant: string;
    description: string;
    amount: number;
    currency: string;
    dueDate: string;
    status: 'pending' | 'paid' | 'overdue';
}

export function PaymentList() {
    const { language } = useLanguage();

    const payments: Payment[] = [
        {
            id: '1',
            merchant: language === 'ar' ? 'مصاريف المدرسة' : 'School Fees',
            description: language === 'ar' ? 'القسط الثاني - ٢٠٢٤' : '2nd Term Installment - 2024',
            amount: 15000,
            currency: 'EGP',
            dueDate: '2024-03-01',
            status: 'pending'
        },
        {
            id: '2',
            merchant: language === 'ar' ? 'مكتبة المدرسة' : 'School Bookstore',
            description: language === 'ar' ? 'كتب الفصل الدراسي الثاني' : 'Second Term Books',
            amount: 4500,
            currency: 'EGP',
            dueDate: '2024-02-15',
            status: 'pending'
        },
        {
            id: '3',
            merchant: language === 'ar' ? 'رسوم الباص' : 'Bus Fees',
            description: language === 'ar' ? 'اشتراك شهر فبراير' : 'February Subscription',
            amount: 2200,
            currency: 'EGP',
            dueDate: '2024-02-05',
            status: 'overdue'
        }
    ];

    const getStatusColor = (status: Payment['status']) => {
        switch (status) {
            case 'paid': return 'text-green-600 bg-green-50 border-green-200';
            case 'pending': return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'overdue': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600';
        }
    };

    const getStatusIcon = (status: Payment['status']) => {
        switch (status) {
            case 'paid': return <CheckCircle className="w-4 h-4" />;
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'overdue': return <AlertCircle className="w-4 h-4" />;
            default: return null;
        }
    };

    const getStatusText = (status: Payment['status']) => {
        const statusMap = {
            paid: { ar: 'مدفوع', en: 'Paid' },
            pending: { ar: 'مستحق', en: 'Pending' },
            overdue: { ar: 'متأخر', en: 'Overdue' }
        };
        return language === 'ar' ? statusMap[status].ar : statusMap[status].en;
    };

    return (
        <div className="card-soft p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[var(--color-primary)]" />
                    {language === 'ar' ? 'المدفوعات القادمة' : 'Upcoming Payments'}
                </h3>
                <button className="text-sm text-[var(--color-primary)] font-medium hover:underline">
                    {language === 'ar' ? 'عرض الكل' : 'View All'}
                </button>
            </div>

            <div className="space-y-3">
                {payments.map(payment => (
                    <div
                        key={payment.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-[var(--color-primary-light)] hover:shadow-sm transition-all duration-200 bg-white"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 text-sm">{payment.merchant}</h4>
                                <p className="text-xs text-gray-500">{payment.description}</p>
                            </div>
                        </div>

                        <div className="text-end">
                            <div className="font-bold text-[var(--color-text-primary)]">
                                {payment.amount.toLocaleString()} <span className="text-xs text-gray-400">{payment.currency}</span>
                            </div>
                            <div className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(payment.status)}`}>
                                {getStatusIcon(payment.status)}
                                {getStatusText(payment.status)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                <span>{language === 'ar' ? 'إجمالي المستحق' : 'Total Due'}</span>
                <span className="font-bold text-lg text-gray-900">
                    21,700 <span className="text-xs font-normal text-gray-400">EGP</span>
                </span>
            </div>
        </div>
    );
}

function AlertCircle({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    );
}
