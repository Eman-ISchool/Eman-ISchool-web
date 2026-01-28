'use client';

import { useState, useEffect } from 'react';
import {
    DollarSign,
    Plus,
    FileText,
    CheckCircle,
    Clock,
    AlertCircle,
    Download,
    RefreshCw,
} from 'lucide-react';
import DataTable, { Column } from '@/components/admin/DataTable';
import { LoadingState } from '@/components/admin/StateComponents';

interface FeePlan {
    id: string;
    name: string;
    grade: string;
    amount: number;
    amountAED: number;
    installments: number;
    studentsCount: number;
}

interface Invoice {
    id: string;
    studentName: string;
    grade: string;
    amount: number;
    paid: number;
    status: 'paid' | 'partial' | 'pending' | 'overdue';
    dueDate: Date;
}

export default function FeesPage() {
    const [activeTab, setActiveTab] = useState<'plans' | 'invoices'>('plans');
    const [loading, setLoading] = useState(true);
    const [feePlans, setFeePlans] = useState<FeePlan[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);

    useEffect(() => {
        const mockPlans: FeePlan[] = [
            { id: '1', name: 'الخطة الأساسية', grade: 'الصف التاسع', amount: 15000, amountAED: 1111, installments: 3, studentsCount: 45 },
            { id: '2', name: 'الخطة المتقدمة', grade: 'الصف العاشر', amount: 18000, amountAED: 1333, installments: 4, studentsCount: 32 },
        ];

        const mockInvoices: Invoice[] = [
            { id: '1', studentName: 'أحمد محمد', grade: 'الصف التاسع', amount: 15000, paid: 15000, status: 'paid', dueDate: new Date() },
            { id: '2', studentName: 'فاطمة علي', grade: 'الصف العاشر', amount: 18000, paid: 9000, status: 'partial', dueDate: new Date() },
            { id: '3', studentName: 'محمد خالد', grade: 'الصف الثامن', amount: 12000, paid: 0, status: 'overdue', dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        ];

        setTimeout(() => {
            setFeePlans(mockPlans);
            setInvoices(mockInvoices);
            setLoading(false);
        }, 500);
    }, []);

    const planColumns: Column<FeePlan>[] = [
        {
            key: 'name',
            header: 'الخطة',
            render: (plan) => (
                <div>
                    <p className="font-medium text-gray-800">{plan.name}</p>
                    <p className="text-sm text-gray-500">{plan.grade}</p>
                </div>
            ),
        },
        {
            key: 'amount',
            header: 'المبلغ (EGP)',
            sortable: true,
            render: (plan) => (
                <span className="font-medium text-gray-800">
                    {plan.amount.toLocaleString('ar-EG')} ج.م
                </span>
            ),
        },
        {
            key: 'amountAED',
            header: 'المبلغ (AED)',
            render: (plan) => (
                <span className="text-gray-600">
                    {plan.amountAED.toLocaleString('ar-EG')} د.إ
                </span>
            ),
        },
        {
            key: 'installments',
            header: 'الأقساط',
            render: (plan) => <span className="text-gray-600">{plan.installments} أقساط</span>,
        },
        {
            key: 'studentsCount',
            header: 'الطلاب',
            render: (plan) => <span className="text-gray-600">{plan.studentsCount}</span>,
        },
    ];

    const invoiceColumns: Column<Invoice>[] = [
        {
            key: 'studentName',
            header: 'الطالب',
            render: (invoice) => (
                <div>
                    <p className="font-medium text-gray-800">{invoice.studentName}</p>
                    <p className="text-sm text-gray-500">{invoice.grade}</p>
                </div>
            ),
        },
        {
            key: 'amount',
            header: 'المبلغ',
            sortable: true,
            render: (invoice) => (
                <div>
                    <p className="font-medium text-gray-800">
                        {invoice.amount.toLocaleString('ar-EG')} ج.م
                    </p>
                    <p className="text-sm text-gray-500">
                        مدفوع: {invoice.paid.toLocaleString('ar-EG')} ج.م
                    </p>
                </div>
            ),
        },
        {
            key: 'dueDate',
            header: 'تاريخ الاستحقاق',
            sortable: true,
            render: (invoice) => (
                <span className="text-gray-600">{invoice.dueDate.toLocaleDateString('ar-EG')}</span>
            ),
        },
        {
            key: 'status',
            header: 'الحالة',
            render: (invoice) => {
                const config = {
                    paid: { badge: 'admin-badge-success', label: 'مدفوع', icon: CheckCircle },
                    partial: { badge: 'admin-badge-warning', label: 'جزئي', icon: Clock },
                    pending: { badge: 'admin-badge-upcoming', label: 'معلق', icon: Clock },
                    overdue: { badge: 'admin-badge-error', label: 'متأخر', icon: AlertCircle },
                };
                const c = config[invoice.status];
                return <span className={`admin-badge ${c.badge}`}>{c.label}</span>;
            },
        },
    ];

    if (loading) {
        return <LoadingState message="جاري تحميل بيانات الرسوم..." />;
    }

    const totalRevenue = invoices.reduce((sum, i) => sum + i.paid, 0);
    const pendingAmount = invoices.reduce((sum, i) => sum + (i.amount - i.paid), 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">الرسوم والمدفوعات</h1>
                    <p className="text-gray-500">إدارة خطط الرسوم والفواتير</p>
                </div>
                <div className="flex gap-2">
                    <button className="admin-btn admin-btn-ghost">
                        <Download className="w-4 h-4" />
                        تصدير
                    </button>
                    <button className="admin-btn admin-btn-primary">
                        <Plus className="w-5 h-5" />
                        {activeTab === 'plans' ? 'خطة جديدة' : 'فاتورة جديدة'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="admin-card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{totalRevenue.toLocaleString('ar-EG')}</p>
                        <p className="text-sm text-gray-500">إجمالي المحصّل</p>
                    </div>
                </div>
                <div className="admin-card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{pendingAmount.toLocaleString('ar-EG')}</p>
                        <p className="text-sm text-gray-500">مبالغ معلقة</p>
                    </div>
                </div>
                <div className="admin-card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{feePlans.length}</p>
                        <p className="text-sm text-gray-500">خطط الرسوم</p>
                    </div>
                </div>
                <div className="admin-card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">
                            {invoices.filter((i) => i.status === 'overdue').length}
                        </p>
                        <p className="text-sm text-gray-500">متأخرة</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="admin-card p-1 inline-flex">
                    <button
                        onClick={() => setActiveTab('plans')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'plans' ? 'bg-teal-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        خطط الرسوم
                    </button>
                    <button
                        onClick={() => setActiveTab('invoices')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'invoices' ? 'bg-teal-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        الفواتير
                    </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <RefreshCw className="w-4 h-4" />
                    <span>سعر الصرف: 1 AED = 13.5 EGP</span>
                </div>
            </div>

            {activeTab === 'plans' ? (
                <DataTable data={feePlans} columns={planColumns} emptyTitle="لا توجد خطط" />
            ) : (
                <DataTable
                    data={invoices}
                    columns={invoiceColumns}
                    searchKey="studentName"
                    searchPlaceholder="بحث بالطالب..."
                />
            )}
        </div>
    );
}
