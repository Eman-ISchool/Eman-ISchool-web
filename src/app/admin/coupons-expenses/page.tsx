'use client';

import { useState, useEffect } from 'react';
import {
    Ticket,
    DollarSign,
    Plus,
    Percent,
    Calendar,
    Tag,
} from 'lucide-react';
import DataTable, { Column } from '@/components/admin/DataTable';
import { LoadingState } from '@/components/admin/StateComponents';

interface Coupon {
    id: string;
    code: string;
    discountType: 'fixed' | 'percent';
    discountValue: number;
    usageLimit: number;
    usedCount: number;
    validFrom: Date;
    validTo: Date;
    isActive: boolean;
}

interface Expense {
    id: string;
    category: string;
    description: string;
    amount: number;
    currency: string;
    date: Date;
}

export default function CouponsExpensesPage() {
    const [activeTab, setActiveTab] = useState<'coupons' | 'expenses'>('coupons');
    const [loading, setLoading] = useState(true);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);

    useEffect(() => {
        const mockCoupons: Coupon[] = [
            {
                id: '1',
                code: 'WELCOME2026',
                discountType: 'percent',
                discountValue: 15,
                usageLimit: 100,
                usedCount: 45,
                validFrom: new Date('2026-01-01'),
                validTo: new Date('2026-03-31'),
                isActive: true,
            },
            {
                id: '2',
                code: 'EARLYBIRD',
                discountType: 'fixed',
                discountValue: 500,
                usageLimit: 50,
                usedCount: 50,
                validFrom: new Date('2025-12-01'),
                validTo: new Date('2025-12-31'),
                isActive: false,
            },
        ];

        const mockExpenses: Expense[] = [
            { id: '1', category: 'رواتب', description: 'رواتب المعلمين - يناير', amount: 50000, currency: 'EGP', date: new Date() },
            { id: '2', category: 'تقنية', description: 'اشتراك خوادم', amount: 2000, currency: 'EGP', date: new Date() },
            { id: '3', category: 'تسويق', description: 'إعلانات فيسبوك', amount: 5000, currency: 'EGP', date: new Date() },
        ];

        setTimeout(() => {
            setCoupons(mockCoupons);
            setExpenses(mockExpenses);
            setLoading(false);
        }, 500);
    }, []);

    const couponColumns: Column<Coupon>[] = [
        {
            key: 'code',
            header: 'الكود',
            render: (coupon) => (
                <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-teal-500" />
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                        {coupon.code}
                    </code>
                </div>
            ),
        },
        {
            key: 'discountType',
            header: 'الخصم',
            render: (coupon) => (
                <div className="flex items-center gap-1">
                    {coupon.discountType === 'percent' ? (
                        <>
                            <Percent className="w-4 h-4 text-blue-500" />
                            <span>{coupon.discountValue}%</span>
                        </>
                    ) : (
                        <>
                            <DollarSign className="w-4 h-4 text-green-500" />
                            <span>{coupon.discountValue} ج.م</span>
                        </>
                    )}
                </div>
            ),
        },
        {
            key: 'usedCount',
            header: 'الاستخدام',
            render: (coupon) => (
                <div>
                    <span className="text-gray-800">{coupon.usedCount}</span>
                    <span className="text-gray-400"> / {coupon.usageLimit}</span>
                </div>
            ),
        },
        {
            key: 'validTo',
            header: 'الصلاحية',
            render: (coupon) => (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                        {coupon.validFrom.toLocaleDateString('ar-EG')} - {coupon.validTo.toLocaleDateString('ar-EG')}
                    </span>
                </div>
            ),
        },
        {
            key: 'isActive',
            header: 'الحالة',
            render: (coupon) => (
                <span className={`admin-badge ${coupon.isActive ? 'admin-badge-success' : 'admin-badge-error'}`}>
                    {coupon.isActive ? 'نشط' : 'منتهي'}
                </span>
            ),
        },
    ];

    const expenseColumns: Column<Expense>[] = [
        {
            key: 'category',
            header: 'الفئة',
            render: (expense) => (
                <span className="admin-badge bg-gray-100 text-gray-700">{expense.category}</span>
            ),
        },
        {
            key: 'description',
            header: 'الوصف',
            render: (expense) => <span className="text-gray-800">{expense.description}</span>,
        },
        {
            key: 'amount',
            header: 'المبلغ',
            sortable: true,
            render: (expense) => (
                <span className="font-medium text-gray-800">
                    {expense.amount.toLocaleString('ar-EG')} {expense.currency === 'EGP' ? 'ج.م' : expense.currency}
                </span>
            ),
        },
        {
            key: 'date',
            header: 'التاريخ',
            sortable: true,
            render: (expense) => (
                <span className="text-gray-600">{expense.date.toLocaleDateString('ar-EG')}</span>
            ),
        },
    ];

    if (loading) {
        return <LoadingState message="جاري التحميل..." />;
    }

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">الكوبونات والمصروفات</h1>
                    <p className="text-gray-500">إدارة أكواد الخصم ومتابعة المصروفات</p>
                </div>
                <button className="admin-btn admin-btn-primary">
                    <Plus className="w-5 h-5" />
                    {activeTab === 'coupons' ? 'كوبون جديد' : 'مصروف جديد'}
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="admin-card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                        <Ticket className="w-5 h-5 text-teal-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{coupons.length}</p>
                        <p className="text-sm text-gray-500">الكوبونات</p>
                    </div>
                </div>
                <div className="admin-card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <Ticket className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">
                            {coupons.filter((c) => c.isActive).length}
                        </p>
                        <p className="text-sm text-gray-500">نشطة</p>
                    </div>
                </div>
                <div className="admin-card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">
                            {totalExpenses.toLocaleString('ar-EG')}
                        </p>
                        <p className="text-sm text-gray-500">إجمالي المصروفات</p>
                    </div>
                </div>
                <div className="admin-card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{expenses.length}</p>
                        <p className="text-sm text-gray-500">عدد المصروفات</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="admin-card p-1 inline-flex">
                <button
                    onClick={() => setActiveTab('coupons')}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'coupons'
                            ? 'bg-teal-500 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <Ticket className="w-4 h-4 inline mr-2" />
                    الكوبونات
                </button>
                <button
                    onClick={() => setActiveTab('expenses')}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'expenses'
                            ? 'bg-teal-500 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    المصروفات
                </button>
            </div>

            {/* Table */}
            {activeTab === 'coupons' ? (
                <DataTable
                    data={coupons}
                    columns={couponColumns}
                    searchKey="code"
                    searchPlaceholder="بحث بالكود..."
                    emptyTitle="لا توجد كوبونات"
                    emptyMessage="قم بإنشاء كوبون جديد"
                />
            ) : (
                <DataTable
                    data={expenses}
                    columns={expenseColumns}
                    searchKey="description"
                    searchPlaceholder="بحث في المصروفات..."
                    emptyTitle="لا توجد مصروفات"
                    emptyMessage="قم بإضافة مصروف جديد"
                />
            )}
        </div>
    );
}
