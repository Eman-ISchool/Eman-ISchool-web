'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { Plus, DollarSign, CreditCard, CheckCircle, Clock, Filter, MoreHorizontal, Search, X, Loader2 } from 'lucide-react';
import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import { Input } from '@/components/ui/input';

interface Payment {
  id: string;
  user_name: string;
  user_email: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  transaction_id: string;
  created_at: string;
}

const METHOD_LABELS: Record<string, { ar: string; en: string }> = {
  bank_transfer: { ar: 'تحويل بنكي', en: 'Bank Transfer' },
  credit_card: { ar: 'بطاقة ائتمان', en: 'Credit Card' },
  cash: { ar: 'نقداً', en: 'Cash' },
  stripe: { ar: 'سترايب', en: 'Stripe' },
};

const STATUS_LABELS: Record<string, { ar: string; en: string; color: string }> = {
  confirmed: { ar: 'مؤكد', en: 'Confirmed', color: 'bg-green-100 text-green-700' },
  paid: { ar: 'مدفوع', en: 'Paid', color: 'bg-green-100 text-green-700' },
  pending: { ar: 'معلق', en: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  rejected: { ar: 'مرفوض', en: 'Rejected', color: 'bg-red-100 text-red-700' },
  overdue: { ar: 'متأخر', en: 'Overdue', color: 'bg-red-100 text-red-700' },
};

export default function PaymentsPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ user_email: '', amount: '', currency: 'AED', method: 'bank_transfer', status: 'pending', transaction_id: '' });
  const [adding, setAdding] = useState(false);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (methodFilter !== 'all') params.set('method', methodFilter);
      const res = await fetch(`/api/admin/payments?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPayments(data.payments || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, methodFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const filtered = useMemo(() => {
    if (!query.trim()) return payments;
    const q = query.toLowerCase();
    return payments.filter(
      (p) =>
        p.user_name.toLowerCase().includes(q) ||
        p.transaction_id.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q),
    );
  }, [payments, query]);

  const confirmedCount = payments.filter((p) => p.status === 'confirmed' || p.status === 'paid').length;
  const pendingCount = payments.filter((p) => p.status === 'pending').length;
  const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const stats = [
    { label: isArabic ? 'إجمالي المدفوعات' : 'Total Payments', value: String(total), icon: CreditCard },
    {
      label: isArabic ? 'إجمالي المبلغ' : 'Total Amount',
      value: `${payments[0]?.currency || 'AED'} ${totalAmount.toFixed(2)}`,
      icon: DollarSign,
    },
    { label: isArabic ? 'المدفوعات المؤكدة' : 'Confirmed', value: String(confirmedCount), icon: CheckCircle },
    { label: isArabic ? 'المدفوعات المعلقة' : 'Pending', value: String(pendingCount), icon: Clock },
  ];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatMethod = (method: string) =>
    METHOD_LABELS[method]?.[isArabic ? 'ar' : 'en'] || method;

  const formatStatus = (status: string) => {
    const s = STATUS_LABELS[status] || { ar: status, en: status, color: 'bg-slate-100 text-slate-600' };
    return { label: s[isArabic ? 'ar' : 'en'], color: s.color };
  };

  return (
    <ReferenceDashboardShell pageTitle={isArabic ? 'المدفوعات' : 'Payments'}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-2 rounded-full bg-[#171717] px-5 py-3 text-sm font-bold text-white hover:bg-black/85">
            <Plus className="h-4 w-4" />
            {isArabic ? 'إضافة دفعة' : 'Add Payment'}
          </button>
          <h1 className="text-3xl font-black text-slate-950">{isArabic ? 'المدفوعات' : 'Payments'}</h1>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">{stat.label}</span>
                <stat.icon className="h-5 w-5 text-slate-400" />
              </div>
              <p className="mt-3 text-3xl font-black text-slate-950">
                {loading ? <span className="animate-pulse bg-slate-200 rounded h-8 w-16 inline-block" /> : stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">{isArabic ? 'تصفية' : 'Filters'}</span>
          </div>
          <div className="grid gap-3 md:grid-cols-5">
            <div>
              <label className="mb-1 block text-xs text-slate-500">
                {isArabic ? 'البحث في المدفوعات...' : 'Search payments...'}
              </label>
              <div className="relative">
                <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={isArabic ? 'بحث...' : 'Search...'}
                  className="h-10 rounded-xl ps-10"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">
                {isArabic ? 'تصفية حسب الحالة' : 'Filter by status'}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="all">{isArabic ? 'الكل' : 'All'}</option>
                <option value="confirmed">{isArabic ? 'مؤكد' : 'Confirmed'}</option>
                <option value="pending">{isArabic ? 'معلق' : 'Pending'}</option>
                <option value="rejected">{isArabic ? 'مرفوض' : 'Rejected'}</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">
                {isArabic ? 'تصفية حسب طريقة الدفع' : 'Filter by method'}
              </label>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="all">{isArabic ? 'الكل' : 'All'}</option>
                <option value="bank_transfer">{isArabic ? 'تحويل بنكي' : 'Bank Transfer'}</option>
                <option value="credit_card">{isArabic ? 'بطاقة ائتمان' : 'Credit Card'}</option>
                <option value="cash">{isArabic ? 'نقداً' : 'Cash'}</option>
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
            <h2 className="text-xl font-black text-slate-950">
              {isArabic ? 'إدارة المدفوعات' : 'Payment Management'}
            </h2>
          </div>

          {error && (
            <div className="p-6 text-center">
              <p className="text-red-600 mb-2">{isArabic ? 'فشل تحميل المدفوعات' : 'Failed to load payments'}</p>
              <button onClick={fetchPayments} className="text-sm text-blue-600 hover:underline">
                {isArabic ? 'إعادة المحاولة' : 'Retry'}
              </button>
            </div>
          )}

          {!error && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-end text-sm font-semibold text-slate-700">{isArabic ? 'المعرف' : 'ID'}</th>
                    <th className="px-4 py-3 text-end text-sm font-semibold text-slate-700">{isArabic ? 'المستخدم' : 'User'}</th>
                    <th className="px-4 py-3 text-end text-sm font-semibold text-slate-700">{isArabic ? 'المبلغ' : 'Amount'}</th>
                    <th className="px-4 py-3 text-end text-sm font-semibold text-slate-700">{isArabic ? 'طريقة الدفع' : 'Method'}</th>
                    <th className="px-4 py-3 text-end text-sm font-semibold text-slate-700">{isArabic ? 'الحالة' : 'Status'}</th>
                    <th className="px-4 py-3 text-end text-sm font-semibold text-slate-700">{isArabic ? 'رقم المعاملة' : 'Transaction ID'}</th>
                    <th className="px-4 py-3 text-end text-sm font-semibold text-slate-700">{isArabic ? 'تاريخ الإنشاء' : 'Created'}</th>
                    <th className="px-4 py-3 text-end text-sm font-semibold text-slate-700">{isArabic ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-slate-100">
                        {Array.from({ length: 8 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 animate-pulse rounded bg-slate-200" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-500">
                        {isArabic ? 'لا توجد مدفوعات' : 'No payments found'}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p) => {
                      const st = formatStatus(p.status);
                      return (
                        <tr key={p.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                          <td className="px-4 py-3 text-end text-sm font-bold text-slate-900">
                            #{typeof p.id === 'string' ? p.id.slice(0, 8) : p.id}
                          </td>
                          <td className="px-4 py-3 text-end text-sm text-slate-900">{p.user_name}</td>
                          <td className="px-4 py-3 text-end text-sm font-semibold text-slate-900">
                            {p.currency} {p.amount?.toFixed?.(2) || p.amount}
                          </td>
                          <td className="px-4 py-3 text-end text-sm text-slate-600">{formatMethod(p.payment_method)}</td>
                          <td className="px-4 py-3 text-end">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${st.color}`}>
                              {st.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-end font-mono text-xs text-slate-500">
                            {p.transaction_id ? String(p.transaction_id).slice(0, 20) : '—'}
                          </td>
                          <td className="px-4 py-3 text-end text-sm text-slate-500">{formatDate(p.created_at)}</td>
                          <td className="px-4 py-3 text-end">
                            <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="w-full max-w-lg rounded-[1.7rem] bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto" dir={isArabic ? 'rtl' : 'ltr'} onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between">
              <button type="button" onClick={() => setShowAddModal(false)} className="mt-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
              <div className="text-right">
                <h3 className="text-2xl font-black text-slate-900">{isArabic ? 'إضافة دفعة جديدة' : 'Add New Payment'}</h3>
                <p className="mt-1 text-sm text-slate-400">{isArabic ? 'تسجيل دفعة جديدة في النظام' : 'Record a new payment'}</p>
              </div>
            </div>
            <form className="space-y-4 text-right" onSubmit={async (e) => {
              e.preventDefault();
              setAdding(true);
              try {
                const res = await fetch('/api/admin/payments', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(addForm),
                });
                if (res.ok) {
                  setShowAddModal(false);
                  setAddForm({ user_email: '', amount: '', currency: 'AED', method: 'bank_transfer', status: 'pending', transaction_id: '' });
                  fetchPayments();
                }
              } catch {} finally { setAdding(false); }
            }}>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{isArabic ? 'البريد الإلكتروني للمستخدم' : 'User Email'}</label>
                <input type="email" dir="ltr" required value={addForm.user_email} onChange={(e) => setAddForm(f => ({ ...f, user_email: e.target.value }))} className="w-full h-12 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">{isArabic ? 'المبلغ' : 'Amount'}</label>
                  <input type="number" step="0.01" required value={addForm.amount} onChange={(e) => setAddForm(f => ({ ...f, amount: e.target.value }))} className="w-full h-12 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">{isArabic ? 'العملة' : 'Currency'}</label>
                  <select value={addForm.currency} onChange={(e) => setAddForm(f => ({ ...f, currency: e.target.value }))} className="w-full h-12 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400 appearance-none">
                    <option value="AED">AED</option>
                    <option value="USD">USD</option>
                    <option value="SAR">SAR</option>
                    <option value="SDG">SDG</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">{isArabic ? 'طريقة الدفع' : 'Payment Method'}</label>
                  <select value={addForm.method} onChange={(e) => setAddForm(f => ({ ...f, method: e.target.value }))} className="w-full h-12 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400 appearance-none">
                    <option value="bank_transfer">{isArabic ? 'تحويل بنكي' : 'Bank Transfer'}</option>
                    <option value="credit_card">{isArabic ? 'بطاقة ائتمان' : 'Credit Card'}</option>
                    <option value="cash">{isArabic ? 'نقداً' : 'Cash'}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">{isArabic ? 'الحالة' : 'Status'}</label>
                  <select value={addForm.status} onChange={(e) => setAddForm(f => ({ ...f, status: e.target.value }))} className="w-full h-12 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400 appearance-none">
                    <option value="pending">{isArabic ? 'معلق' : 'Pending'}</option>
                    <option value="confirmed">{isArabic ? 'مؤكد' : 'Confirmed'}</option>
                    <option value="paid">{isArabic ? 'مدفوع' : 'Paid'}</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{isArabic ? 'رقم المعاملة' : 'Transaction ID'}</label>
                <input type="text" dir="ltr" value={addForm.transaction_id} onChange={(e) => setAddForm(f => ({ ...f, transaction_id: e.target.value }))} className="w-full h-12 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-900">{isArabic ? 'إلغاء' : 'Cancel'}</button>
                <button type="submit" disabled={adding} className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-6 py-3 text-sm font-bold text-white disabled:opacity-50">
                  {adding && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isArabic ? 'إنشاء' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ReferenceDashboardShell>
  );
}
