'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Plus, Search, DollarSign, CreditCard, CheckCircle, Filter } from 'lucide-react';
import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import { Input } from '@/components/ui/input';
import {
  Table as ReferenceTable,
  TableBody as ReferenceTableBody,
  TableCell as ReferenceTableCell,
  TableHead as ReferenceTableHead,
  TableHeader as ReferenceTableHeader,
  TableRow as ReferenceTableRow,
} from '@/components/admin/ReferenceTable';

const mockPayments = [
  {
    id: '#PAY-001',
    user: 'أسيل خليل',
    amount: '$300.00',
    method: 'Bank Transfer',
    status: 'مؤكد',
    statusColor: 'bg-green-100 text-green-700',
    transactionId: 'BT_P000001_PAYALLL0070001',
    date: 'Nov 30, 2025, 11:14 AM',
  },
];

export default function PaymentsPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(isArabic ? 'الكل' : 'All');
  const [methodFilter, setMethodFilter] = useState(isArabic ? 'الكل' : 'All');

  const stats = [
    { label: isArabic ? 'إجمالي المدفوعات' : 'Total Payments', value: '1', icon: CreditCard },
    { label: isArabic ? 'إجمالي المبلغ' : 'Total Amount', value: '$100.00', icon: DollarSign },
    { label: isArabic ? 'المدفوعات المؤكدة' : 'Confirmed', value: '1', icon: CheckCircle },
  ];

  return (
    <ReferenceDashboardShell pageTitle={isArabic ? 'المدفوعات' : 'Payments'}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button className="inline-flex items-center gap-2 rounded-full bg-[#171717] px-5 py-3 text-sm font-bold text-white">
            <Plus className="h-4 w-4" />
            {isArabic ? 'إضافة دفعة' : 'Add Payment'}
          </button>
          <h1 className="text-3xl font-black text-slate-950">{isArabic ? 'المدفوعات' : 'Payments'}</h1>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">{stat.label}</span>
                <stat.icon className="h-5 w-5 text-slate-400" />
              </div>
              <p className="mt-3 text-3xl font-black text-slate-950">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2 text-right">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">Filters</span>
          </div>
          <div className="grid gap-3 md:grid-cols-5">
            <div>
              <label className="mb-1 block text-xs text-slate-500">{isArabic ? 'بحث...' : 'Search...'}</label>
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={isArabic ? 'بحث...' : 'Search...'} className="h-10 rounded-xl" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">{isArabic ? 'تصفية حسب الحالة' : 'Filter by status'}</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm">
                <option>{isArabic ? 'الكل' : 'All'}</option>
                <option>{isArabic ? 'مؤكد' : 'Confirmed'}</option>
                <option>{isArabic ? 'معلق' : 'Pending'}</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">{isArabic ? 'تصفية حسب طريقة الدفع' : 'Filter by method'}</label>
              <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm">
                <option>{isArabic ? 'الكل' : 'All'}</option>
                <option>Bank Transfer</option>
                <option>Credit Card</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">{isArabic ? 'تاريخ البداية' : 'Start date'}</label>
              <Input type="date" className="h-10 rounded-xl" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">{isArabic ? 'تاريخ النهاية' : 'End date'}</label>
              <Input type="date" className="h-10 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Payment table */}
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-right text-xl font-black text-slate-950">{isArabic ? 'إدارة المدفوعات' : 'Payment Management'}</h2>
          </div>
          <div className="overflow-x-auto">
            <ReferenceTable>
              <ReferenceTableHeader>
                <ReferenceTableRow>
                  <ReferenceTableHead>{isArabic ? 'المعرف' : 'ID'}</ReferenceTableHead>
                  <ReferenceTableHead>{isArabic ? 'المستخدم' : 'User'}</ReferenceTableHead>
                  <ReferenceTableHead>{isArabic ? 'المبلغ' : 'Amount'}</ReferenceTableHead>
                  <ReferenceTableHead>{isArabic ? 'طريقة الدفع' : 'Method'}</ReferenceTableHead>
                  <ReferenceTableHead>{isArabic ? 'الحالة' : 'Status'}</ReferenceTableHead>
                  <ReferenceTableHead>{isArabic ? 'رقم المعاملة' : 'Transaction ID'}</ReferenceTableHead>
                  <ReferenceTableHead>{isArabic ? 'تاريخ الإنشاء' : 'Created'}</ReferenceTableHead>
                  <ReferenceTableHead>{isArabic ? 'الإجراءات' : 'Actions'}</ReferenceTableHead>
                </ReferenceTableRow>
              </ReferenceTableHeader>
              <ReferenceTableBody>
                {mockPayments.map((p) => (
                  <ReferenceTableRow key={p.id}>
                    <ReferenceTableCell className="font-bold">{p.id}</ReferenceTableCell>
                    <ReferenceTableCell>{p.user}</ReferenceTableCell>
                    <ReferenceTableCell className="font-semibold">{p.amount}</ReferenceTableCell>
                    <ReferenceTableCell>{p.method}</ReferenceTableCell>
                    <ReferenceTableCell>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${p.statusColor}`}>{p.status}</span>
                    </ReferenceTableCell>
                    <ReferenceTableCell className="font-mono text-xs">{p.transactionId}</ReferenceTableCell>
                    <ReferenceTableCell>{p.date}</ReferenceTableCell>
                    <ReferenceTableCell>
                      <button className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                        ...
                      </button>
                    </ReferenceTableCell>
                  </ReferenceTableRow>
                ))}
              </ReferenceTableBody>
            </ReferenceTable>
          </div>
        </div>
      </div>
    </ReferenceDashboardShell>
  );
}
