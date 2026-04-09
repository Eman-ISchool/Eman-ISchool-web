'use client';

import { useState, useCallback, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Plus, Search, X, Loader2 } from 'lucide-react';
import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';

interface Salary {
  id: string;
  user_id: string;
  base_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  month: string;
  status: string;
  user?: { id: string; name: string; email: string } | null;
  created_at: string;
}

export default function SalariesPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(isArabic ? 'الحالة' : 'Status');
  const [data, setData] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({ user_email: '', base_salary: '', allowances: '0', deductions: '0', month: '', status: 'pending' });

  const columns = isArabic
    ? ['الاسم', 'المنصب', 'الراتب الأساسي', 'البدلات', 'الخصومات', 'صافي الراتب', 'الحالة', 'الإجراءات']
    : ['Name', 'Position', 'Base Salary', 'Allowances', 'Deductions', 'Net Salary', 'Status', 'Actions'];

  const statusValues: Record<string, string> = isArabic
    ? { 'الحالة': 'all', 'مدفوع': 'paid', 'معلق': 'pending', 'متأخر': 'overdue' }
    : { 'Status': 'all', 'Paid': 'paid', 'Pending': 'pending', 'Overdue': 'overdue' };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      const mappedStatus = statusValues[statusFilter] || 'all';
      if (mappedStatus !== 'all') params.set('status', mappedStatus);
      if (query) params.set('search', query);
      const res = await fetch(`/api/admin/salaries?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json.salaries || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, query]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-emerald-50 text-emerald-700',
      pending: 'bg-amber-50 text-amber-700',
      overdue: 'bg-red-50 text-red-700',
    };
    return colors[status] || 'bg-slate-50 text-slate-700';
  };

  const filteredData = data;

  return (
    <ReferenceDashboardShell
      pageTitle={isArabic ? 'الرواتب' : 'Salaries'}
      pageSubtitle={isArabic ? 'إدارة رواتب الموظفين' : 'Manage employee salaries'}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 rounded-full bg-[#171717] px-5 py-3 text-sm font-bold text-white">
            <Plus className="h-4 w-4" />
            {isArabic ? 'إنشاء سجل راتب' : 'Create Salary Record'}
          </button>
        </div>

        {/* Summary cards matching reference */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {[
            { label: isArabic ? 'إجمالي الرواتب' : 'Total Salaries', color: 'bg-blue-500', value: `AED ${data.reduce((s, d) => s + (d.net_salary || 0), 0).toLocaleString()} (${data.length})` },
            { label: isArabic ? 'مدفوع' : 'Paid', color: 'bg-green-500', value: `AED ${data.filter(d => d.status === 'paid').reduce((s, d) => s + (d.net_salary || 0), 0).toLocaleString()} (${data.filter(d => d.status === 'paid').length})` },
            { label: isArabic ? 'معلق' : 'Pending', color: 'bg-yellow-500', value: `AED ${data.filter(d => d.status === 'pending').reduce((s, d) => s + (d.net_salary || 0), 0).toLocaleString()} (${data.filter(d => d.status === 'pending').length})` },
            { label: isArabic ? 'متأخر' : 'Overdue', color: 'bg-red-500', value: `AED ${data.filter(d => d.status === 'overdue').reduce((s, d) => s + (d.net_salary || 0), 0).toLocaleString()} (${data.filter(d => d.status === 'overdue').length})` },
            { label: isArabic ? 'ملغى' : 'Cancelled', color: 'bg-slate-500', value: `AED 0 (0)` },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${card.color}`} />
                <span className="text-sm font-semibold text-slate-600">{card.label}</span>
              </div>
              <p className="mt-2 text-lg font-black text-slate-950">{loading ? '...' : card.value}</p>
            </div>
          ))}
        </div>

        {/* Main content card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">💼</span>
              <h2 className="text-xl font-black text-slate-950">
                {isArabic ? 'المرشحات' : 'Filters'}
              </h2>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isArabic ? 'البحث في الرواتب...' : 'Search salaries...'}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pe-4 ps-10 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700"
            >
              <option>{isArabic ? 'الحالة' : 'Status'}</option>
              <option>{isArabic ? 'مدفوع' : 'Paid'}</option>
              <option>{isArabic ? 'معلق' : 'Pending'}</option>
              <option>{isArabic ? 'متأخر' : 'Overdue'}</option>
            </select>
          </div>

          {/* Table header */}
          <h3 className="text-lg font-black text-slate-950 mb-4">
            {isArabic ? 'سجلات الرواتب' : 'Salary Records'}
          </h3>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-end text-sm font-semibold text-slate-700"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      {columns.map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-12 text-center">
                      <p className="text-sm text-red-600">{error}</p>
                      <button
                        onClick={fetchData}
                        className="mt-2 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
                      >
                        {isArabic ? 'إعادة المحاولة' : 'Retry'}
                      </button>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-slate-500">
                      {isArabic ? 'لا توجد سجلات رواتب' : 'No salary records found'}
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-end text-sm text-slate-900">
                        {item.user?.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-end text-sm text-slate-600">
                        {item.month || '-'}
                      </td>
                      <td className="px-4 py-3 text-end text-sm text-slate-900 font-medium">
                        {item.base_salary?.toLocaleString() || '0'}
                      </td>
                      <td className="px-4 py-3 text-end text-sm text-emerald-600">
                        +{item.allowances?.toLocaleString() || '0'}
                      </td>
                      <td className="px-4 py-3 text-end text-sm text-red-600">
                        -{item.deductions?.toLocaleString() || '0'}
                      </td>
                      <td className="px-4 py-3 text-end text-sm text-slate-900 font-bold">
                        {item.net_salary?.toLocaleString() || '0'}
                      </td>
                      <td className="px-4 py-3 text-end">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-end text-sm text-slate-500">
                        ...
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-lg rounded-[1.7rem] bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto" dir={isArabic ? 'rtl' : 'ltr'} onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between">
              <button type="button" onClick={() => setShowModal(false)} className="mt-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
              <div className="text-right">
                <h3 className="text-2xl font-black text-slate-900">{isArabic ? 'إنشاء سجل راتب' : 'Create Salary Record'}</h3>
                <p className="mt-1 text-sm text-slate-400">{isArabic ? 'إضافة سجل راتب جديد في النظام' : 'Add a new salary record'}</p>
              </div>
            </div>
            <form className="space-y-4 text-right" onSubmit={async (e) => {
              e.preventDefault();
              setCreating(true);
              try {
                const res = await fetch('/api/admin/salaries', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(formData),
                });
                if (res.ok) {
                  setShowModal(false);
                  setFormData({ user_email: '', base_salary: '', allowances: '0', deductions: '0', month: '', status: 'pending' });
                  fetchData();
                }
              } catch {} finally { setCreating(false); }
            }}>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{isArabic ? 'البريد الإلكتروني للمستخدم' : 'User Email'}</label>
                <input type="email" dir="ltr" required value={formData.user_email} onChange={(e) => setFormData(f => ({ ...f, user_email: e.target.value }))} className="w-full h-12 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{isArabic ? 'الراتب الأساسي (درهم)' : 'Base Salary (AED)'}</label>
                <input type="number" step="0.01" required value={formData.base_salary} onChange={(e) => setFormData(f => ({ ...f, base_salary: e.target.value }))} className="w-full h-12 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">{isArabic ? 'البدلات' : 'Allowances'}</label>
                  <input type="number" step="0.01" value={formData.allowances} onChange={(e) => setFormData(f => ({ ...f, allowances: e.target.value }))} className="w-full h-12 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">{isArabic ? 'الخصومات' : 'Deductions'}</label>
                  <input type="number" step="0.01" value={formData.deductions} onChange={(e) => setFormData(f => ({ ...f, deductions: e.target.value }))} className="w-full h-12 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{isArabic ? 'الشهر' : 'Month'}</label>
                <input type="date" required value={formData.month} onChange={(e) => setFormData(f => ({ ...f, month: e.target.value }))} className="w-full h-12 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{isArabic ? 'الحالة' : 'Status'}</label>
                <select value={formData.status} onChange={(e) => setFormData(f => ({ ...f, status: e.target.value }))} className="w-full h-12 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400 appearance-none">
                  <option value="pending">{isArabic ? 'معلق' : 'Pending'}</option>
                  <option value="paid">{isArabic ? 'مدفوع' : 'Paid'}</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-900">{isArabic ? 'إلغاء' : 'Cancel'}</button>
                <button type="submit" disabled={creating} className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-6 py-3 text-sm font-bold text-white disabled:opacity-50">
                  {creating && <Loader2 className="h-4 w-4 animate-spin" />}
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
