'use client';

import { useState, useCallback, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Loader2, Plus, Search, X } from 'lucide-react';
import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';

interface Currency {
  id: string;
  name: string;
  code: string;
  exchange_rate: number;
  status: string;
  created_at: string;
  updated_at?: string;
}

export default function CurrenciesPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(isArabic ? 'الحالة' : 'Status');
  const [data, setData] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', symbol: '', exchange_rate: '' });

  const columns = isArabic
    ? ['العملة', 'الرمز', 'سعر الصرف', 'الحالة', 'آخر تحديث', 'الإجراءات']
    : ['Currency', 'Code', 'Exchange Rate', 'Status', 'Last Updated', 'Actions'];

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
      const res = await fetch(`/api/admin/currencies?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json.currencies || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, query]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreateCurrency = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/admin/currencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          code: formData.code,
          symbol: formData.symbol,
          exchange_rate: parseFloat(formData.exchange_rate),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setShowModal(false);
      setFormData({ name: '', code: '', symbol: '', exchange_rate: '' });
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
      pageTitle={isArabic ? 'العملات' : 'Currencies'}
      pageSubtitle={isArabic ? 'إدارة العملات وأسعار الصرف' : 'Manage currencies and exchange rates'}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 rounded-full bg-[#171717] px-5 py-3 text-sm font-bold text-white">
            <Plus className="h-4 w-4" />
            {isArabic ? 'إضافة عملة' : 'Add Currency'}
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: isArabic ? 'إجمالي العملات' : 'Total Currencies', value: data.length },
            { label: isArabic ? 'العملات النشطة' : 'Active', value: data.filter(c => c.status === 'active').length },
            { label: isArabic ? 'العملات المعطلة' : 'Inactive', value: data.filter(c => c.status !== 'active').length },
            { label: isArabic ? 'عدد الدول' : 'Countries', value: data.length },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5">
              <span className="text-sm font-semibold text-slate-600">{card.label}</span>
              <p className="mt-3 text-3xl font-black text-slate-950">{loading ? '...' : card.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Add Popular Currencies */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-black text-slate-950 mb-1">
            {isArabic ? 'إضافة سريعة للعملات الشائعة' : 'Quick Add Popular Currencies'}
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            {isArabic ? 'أضف العملات الأكثر شيوعاً بضغطة واحدة' : 'Add most common currencies with a single click'}
          </p>
          <div className="flex flex-wrap gap-3">
            {[
              { code: 'USD', name: isArabic ? 'دولار أمريكي' : 'US Dollar', rate: '3.67' },
              { code: 'EUR', name: isArabic ? 'يورو' : 'Euro', rate: '4.00' },
              { code: 'GBP', name: isArabic ? 'جنيه إسترليني' : 'British Pound', rate: '4.65' },
              { code: 'SAR', name: isArabic ? 'ريال سعودي' : 'Saudi Riyal', rate: '0.98' },
            ].map((c) => (
              <button key={c.code} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm hover:bg-slate-50 transition">
                <span className="font-bold text-slate-900">{c.code}</span>
                <span className="text-slate-500 ms-2">{c.rate} د.إ</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main content card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-6 text-end">
            <h2 className="text-xl font-black text-slate-950">
              {isArabic ? 'قائمة العملات' : 'Currencies List'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isArabic ? 'إدارة العملات وأسعار الصرف' : 'Manage currencies and exchange rates'}
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
                placeholder={isArabic ? 'البحث في العملات...' : 'Search currencies...'}
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
                      {isArabic ? 'لا توجد عملات' : 'No currencies found'}
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-end text-sm text-slate-900 font-medium">
                        {item.name}
                      </td>
                      <td className="px-4 py-3 text-end text-sm text-slate-600 font-mono">
                        {item.code}
                      </td>
                      <td className="px-4 py-3 text-end text-sm text-slate-900 font-medium">
                        {item.exchange_rate}
                      </td>
                      <td className="px-4 py-3 text-end">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-end text-sm text-slate-500">
                        {item.updated_at ? new Date(item.updated_at).toLocaleDateString(isArabic ? 'ar' : 'en') : '-'}
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
      {/* Create Currency Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-[1.7rem] bg-white p-8 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-950">{isArabic ? 'إضافة عملة' : 'Add Currency'}</h3>
                <p className="mt-1 text-sm text-slate-400">{isArabic ? 'أضف عملة جديدة' : 'Add a new currency'}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder={isArabic ? 'اسم العملة' : 'Currency Name'}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-12 w-full rounded-[1rem] border border-slate-200 px-4 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              />
              <input
                type="text"
                placeholder={isArabic ? 'الرمز (مثل USD)' : 'Code (e.g. USD)'}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="h-12 w-full rounded-[1rem] border border-slate-200 px-4 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              />
              <input
                type="text"
                placeholder={isArabic ? 'الرمز (مثل $)' : 'Symbol (e.g. $)'}
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                className="h-12 w-full rounded-[1rem] border border-slate-200 px-4 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              />
              <input
                type="number"
                step="0.01"
                placeholder={isArabic ? 'سعر الصرف' : 'Exchange Rate'}
                value={formData.exchange_rate}
                onChange={(e) => setFormData({ ...formData, exchange_rate: e.target.value })}
                className="h-12 w-full rounded-[1rem] border border-slate-200 px-4 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              />
            </div>
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handleCreateCurrency}
                disabled={creating || !formData.name || !formData.code || !formData.exchange_rate}
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
