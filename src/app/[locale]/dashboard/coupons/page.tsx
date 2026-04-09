'use client';

import { useState, useCallback, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Loader2, Plus, Search, X } from 'lucide-react';
import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  value: number;
  max_uses: number | null;
  used_count?: number;
  status: string;
  created_at: string;
}

export default function CouponsPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(isArabic ? 'الحالة' : 'Status');
  const [data, setData] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({ code: '', discount_percent: '', max_uses: '', expiry_date: '' });

  const columns = isArabic
    ? ['الكود', 'نوع الخصم', 'القيمة', 'الحد الأقصى للاستخدام', 'المستخدم', 'الحالة', 'الإجراءات']
    : ['Code', 'Discount Type', 'Value', 'Max Usage', 'Used', 'Status', 'Actions'];

  const statusValues: Record<string, string> = isArabic
    ? { 'الحالة': 'all', 'نشط': 'active', 'منتهي': 'expired', 'غير نشط': 'inactive' }
    : { 'Status': 'all', 'Active': 'active', 'Expired': 'expired', 'Inactive': 'inactive' };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      const mappedStatus = statusValues[statusFilter] || 'all';
      if (mappedStatus !== 'all') params.set('status', mappedStatus);
      if (query) params.set('search', query);
      const res = await fetch(`/api/admin/coupons?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json.coupons || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, query]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreateCoupon = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.code,
          discount_percent: parseFloat(formData.discount_percent),
          max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
          expiry_date: formData.expiry_date || null,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setShowModal(false);
      setFormData({ code: '', discount_percent: '', max_uses: '', expiry_date: '' });
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
      expired: 'bg-amber-50 text-amber-700',
      inactive: 'bg-slate-100 text-slate-600',
    };
    return colors[status] || 'bg-slate-50 text-slate-700';
  };

  return (
    <ReferenceDashboardShell
      pageTitle={isArabic ? 'الكوبونات' : 'Coupons'}
      pageSubtitle={isArabic ? 'إدارة الكوبونات والخصومات' : 'Manage coupons and discounts'}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 rounded-full bg-[#171717] px-5 py-3 text-sm font-bold text-white">
            <Plus className="h-4 w-4" />
            {isArabic ? 'إنشاء كوبون' : 'Create Coupon'}
          </button>
        </div>

        {/* Main content card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-black text-slate-950">
              {isArabic ? 'الكوبونات' : 'Coupons'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isArabic ? 'إدارة الكوبونات والخصومات' : 'Manage coupons and discounts'}
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
                placeholder={isArabic ? 'البحث في الكوبونات...' : 'Search coupons...'}
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
              <option>{isArabic ? 'منتهي' : 'Expired'}</option>
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
                      {isArabic ? 'لا توجد كوبونات' : 'No coupons found'}
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-end text-sm text-slate-900 font-mono font-medium">
                        {item.code}
                      </td>
                      <td className="px-4 py-3 text-end text-sm text-slate-600">
                        {item.discount_type}
                      </td>
                      <td className="px-4 py-3 text-end text-sm text-slate-900 font-medium">
                        {item.discount_type === 'percentage' ? `${item.value}%` : item.value?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-end text-sm text-slate-600">
                        {item.max_uses ?? (isArabic ? 'غير محدود' : 'Unlimited')}
                      </td>
                      <td className="px-4 py-3 text-end text-sm text-slate-600">
                        {item.used_count ?? 0}
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
      {/* Create Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-[1.7rem] bg-white p-8 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-950">{isArabic ? 'إنشاء كوبون' : 'Create Coupon'}</h3>
                <p className="mt-1 text-sm text-slate-400">{isArabic ? 'أضف كوبون خصم جديد' : 'Add a new discount coupon'}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder={isArabic ? 'رمز الكوبون' : 'Coupon Code'}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="h-12 w-full rounded-[1rem] border border-slate-200 px-4 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              />
              <input
                type="number"
                min="0"
                max="100"
                placeholder={isArabic ? 'نسبة الخصم %' : 'Discount %'}
                value={formData.discount_percent}
                onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                className="h-12 w-full rounded-[1rem] border border-slate-200 px-4 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              />
              <input
                type="number"
                min="0"
                placeholder={isArabic ? 'الحد الأقصى للاستخدام' : 'Max Uses'}
                value={formData.max_uses}
                onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                className="h-12 w-full rounded-[1rem] border border-slate-200 px-4 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              />
              <input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                className="h-12 w-full rounded-[1rem] border border-slate-200 px-4 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
              />
            </div>
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handleCreateCoupon}
                disabled={creating || !formData.code || !formData.discount_percent}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#111111] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                {isArabic ? 'إنشاء' : 'Create'}
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
