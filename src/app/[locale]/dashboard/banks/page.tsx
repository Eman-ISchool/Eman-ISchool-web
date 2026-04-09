'use client';

import { useState, useCallback, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Loader2, Plus, Search, X } from 'lucide-react';
import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';

interface Bank {
  id: string;
  bank_name: string;
  account_number: string;
  account_type: string;
  balance: number;
  status: string;
  created_at: string;
}

export default function BanksPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(isArabic ? 'الحالة' : 'Status');
  const [data, setData] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', account_number: '', branch: '', swift_code: '' });

  const columns = isArabic
    ? ['اسم البنك', 'رقم الحساب', 'نوع الحساب', 'الرصيد', 'الحالة', 'الإجراءات']
    : ['Bank Name', 'Account No.', 'Account Type', 'Balance', 'Status', 'Actions'];

  const statusValues: Record<string, string> = isArabic
    ? { 'الحالة': 'all', 'نشط': 'active', 'غير نشط': 'inactive' }
    : { 'Status': 'all', 'Active': 'active', 'Inactive': 'inactive' };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      const mappedStatus = statusValues[statusFilter] || 'all';
      if (mappedStatus !== 'all') params.set('status', mappedStatus);
      if (query) params.set('search', query);
      const res = await fetch(`/api/admin/banks?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json.banks || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, query]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreateBank = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/admin/banks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bank_name: formData.name,
          account_number: formData.account_number,
          branch: formData.branch,
          swift_code: formData.swift_code,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setShowModal(false);
      setFormData({ name: '', account_number: '', branch: '', swift_code: '' });
      fetchData();
    } catch {
      // keep modal open on error
    } finally {
      setCreating(false);
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-emerald-50 text-emerald-700',
      inactive: 'bg-slate-100 text-slate-600',
    };
    return colors[status] || 'bg-slate-50 text-slate-700';
  };

  return (
    <ReferenceDashboardShell
      pageTitle={isArabic ? 'البنوك' : 'Banks'}
      pageSubtitle={isArabic ? 'إدارة الحسابات البنكية' : 'Manage bank accounts'}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 rounded-full bg-[#171717] px-5 py-3 text-sm font-bold text-white">
            <Plus className="h-4 w-4" />
            {isArabic ? 'إضافة حساب بنكي' : 'Add Bank Account'}
          </button>
        </div>

        {/* Summary cards matching reference */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: isArabic ? 'إجمالي البنوك' : 'Total Banks', icon: '🏦', value: data.length },
            { label: isArabic ? 'البنوك النشطة' : 'Active Banks', icon: '✅', value: data.filter(b => b.status === 'active').length },
            { label: isArabic ? 'البنوك غير النشطة' : 'Inactive Banks', icon: '🚫', value: data.filter(b => b.status !== 'active').length },
            { label: isArabic ? 'مع شعارات' : 'With Logos', icon: '🖼️', value: 0 },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">{card.label}</span>
                <span>{card.icon}</span>
              </div>
              <p className="mt-3 text-3xl font-black text-slate-950">{loading ? '...' : card.value}</p>
            </div>
          ))}
        </div>

        {/* Main content card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-6 text-end">
            <h2 className="text-xl font-black text-slate-950">
              {isArabic ? 'قائمة البنوك' : 'Banks List'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isArabic ? 'إدارة شركاء البنوك' : 'Manage your banking partners'}
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isArabic ? 'البحث في البنوك...' : 'Search banks...'}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pe-4 ps-10 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700"
            >
              <option>{isArabic ? 'الحالة' : 'Status'}</option>
              <option>{isArabic ? 'نشط' : 'Active'}</option>
              <option>{isArabic ? 'غير نشط' : 'Inactive'}</option>
            </select>
          </div>

          {/* Table */}
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
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-slate-500">
                      {isArabic ? 'لا توجد حسابات بنكية' : 'No bank accounts found'}
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-end text-sm text-slate-900 font-medium">
                        {item.bank_name}
                      </td>
                      <td className="px-4 py-3 text-end text-sm text-slate-600 font-mono">
                        {item.account_number}
                      </td>
                      <td className="px-4 py-3 text-end text-sm text-slate-600">
                        {item.account_type}
                      </td>
                      <td className="px-4 py-3 text-end text-sm text-slate-900 font-medium">
                        {item.balance?.toLocaleString() || '0'}
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
      {/* Create Bank Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-[1.7rem] bg-white p-8 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-950">{isArabic ? 'إضافة حساب بنكي' : 'Add Bank Account'}</h3>
                <p className="mt-1 text-sm text-slate-400">{isArabic ? 'أضف حساب بنكي جديد' : 'Add a new bank account'}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder={isArabic ? 'اسم البنك' : 'Bank Name'}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-12 w-full rounded-[1rem] border border-slate-200 px-4 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              />
              <input
                type="text"
                placeholder={isArabic ? 'رقم الحساب' : 'Account Number'}
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                className="h-12 w-full rounded-[1rem] border border-slate-200 px-4 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              />
              <input
                type="text"
                placeholder={isArabic ? 'الفرع' : 'Branch'}
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="h-12 w-full rounded-[1rem] border border-slate-200 px-4 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              />
              <input
                type="text"
                placeholder={isArabic ? 'رمز SWIFT' : 'SWIFT Code'}
                value={formData.swift_code}
                onChange={(e) => setFormData({ ...formData, swift_code: e.target.value })}
                className="h-12 w-full rounded-[1rem] border border-slate-200 px-4 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              />
            </div>
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handleCreateBank}
                disabled={creating || !formData.name || !formData.account_number}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#111111] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                {isArabic ? 'إضافة' : 'Add'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700"
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ReferenceDashboardShell>
  );
}
