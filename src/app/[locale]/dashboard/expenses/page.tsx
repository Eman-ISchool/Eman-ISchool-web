'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { Loader2, MoreHorizontal, Plus, Search, X } from 'lucide-react';
import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  status: string;
  created_at: string;
  created_by_user?: { name: string };
}

const CATEGORY_LABELS: Record<string, { ar: string; en: string }> = {
  salary: { ar: 'رواتب', en: 'Salary' },
  rent: { ar: 'إيجار', en: 'Rent' },
  supplies: { ar: 'مستلزمات', en: 'Supplies' },
  utilities: { ar: 'خدمات', en: 'Utilities' },
  general: { ar: 'عام', en: 'General' },
};

const STATUS_STYLES: Record<string, { ar: string; en: string; color: string }> = {
  approved: { ar: 'معتمد', en: 'Approved', color: 'bg-green-100 text-green-700' },
  pending: { ar: 'معلق', en: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  rejected: { ar: 'مرفوض', en: 'Rejected', color: 'bg-red-100 text-red-700' },
};

export default function ExpensesPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({ description: '', amount: '', category: 'supplies', date: '' });

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`/api/admin/expenses?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setExpenses(data.expenses || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, statusFilter]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const filtered = useMemo(() => {
    if (!query.trim()) return expenses;
    const q = query.toLowerCase();
    return expenses.filter((e) => e.title.toLowerCase().includes(q));
  }, [expenses, query]);

  const formatDate = (d: string) =>
    d ? new Date(d).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US') : '—';

  const handleCreateExpense = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/admin/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.description,
          amount: parseFloat(formData.amount),
          category: formData.category,
          date: formData.date,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setShowModal(false);
      setFormData({ description: '', amount: '', category: 'supplies', date: '' });
      fetchExpenses();
    } catch {
      // keep modal open on error
    } finally {
      setCreating(false);
    }
  };

  const columns = isArabic
    ? ['العنوان', 'المبلغ', 'الفئة', 'الحالة', 'التاريخ', 'أنشأ بواسطة', 'الإجراءات']
    : ['Title', 'Amount', 'Category', 'Status', 'Date', 'Created By', 'Actions'];

  return (
    <ReferenceDashboardShell
      pageTitle={isArabic ? 'المصروفات' : 'Expenses'}
      pageSubtitle={isArabic ? 'إدارة وتتبع المصروفات' : 'Manage and track expenses'}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 rounded-full bg-[#171717] px-5 py-3 text-sm font-bold text-white">
            <Plus className="h-4 w-4" />
            {isArabic ? 'إنشاء مصروف' : 'Create Expense'}
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-6 text-end">
            <h2 className="text-2xl font-black text-slate-950">
              {isArabic ? 'المصروفات' : 'Expenses'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isArabic ? 'إدارة وتتبع المصروفات' : 'Manage and track expenses'}
            </p>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isArabic ? 'البحث في المصروفات...' : 'Search expenses...'}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pe-4 ps-10 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700"
            >
              <option value="all">{isArabic ? 'الفئة' : 'Category'}</option>
              <option value="salary">{isArabic ? 'رواتب' : 'Salary'}</option>
              <option value="rent">{isArabic ? 'إيجار' : 'Rent'}</option>
              <option value="supplies">{isArabic ? 'مستلزمات' : 'Supplies'}</option>
              <option value="utilities">{isArabic ? 'خدمات' : 'Utilities'}</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700"
            >
              <option value="all">{isArabic ? 'الحالة' : 'Status'}</option>
              <option value="approved">{isArabic ? 'معتمد' : 'Approved'}</option>
              <option value="pending">{isArabic ? 'معلق' : 'Pending'}</option>
              <option value="rejected">{isArabic ? 'مرفوض' : 'Rejected'}</option>
            </select>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {columns.map((col) => (
                    <th key={col} className="px-4 py-3 text-end text-sm font-semibold text-slate-700">
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
                          <div className="h-4 animate-pulse rounded bg-slate-200" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-red-500">
                      {isArabic ? 'فشل تحميل المصروفات' : 'Failed to load expenses'}
                      <button onClick={fetchExpenses} className="ms-2 text-blue-600 hover:underline">
                        {isArabic ? 'إعادة المحاولة' : 'Retry'}
                      </button>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-slate-500">
                      {isArabic ? 'لا توجد مصروفات' : 'No expenses found'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((exp) => {
                    const st = STATUS_STYLES[exp.status] || STATUS_STYLES.pending;
                    const cat = CATEGORY_LABELS[exp.category];
                    return (
                      <tr key={exp.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                        <td className="px-4 py-3 text-end text-sm text-slate-900">{exp.title}</td>
                        <td className="px-4 py-3 text-end text-sm font-semibold text-slate-900">
                          AED {exp.amount?.toFixed?.(2) || exp.amount}
                        </td>
                        <td className="px-4 py-3 text-end text-sm text-slate-600">
                          {cat ? cat[isArabic ? 'ar' : 'en'] : exp.category}
                        </td>
                        <td className="px-4 py-3 text-end">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${st.color}`}>
                            {st[isArabic ? 'ar' : 'en']}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-end text-sm text-slate-500">{formatDate(exp.created_at)}</td>
                        <td className="px-4 py-3 text-end text-sm text-slate-500">
                          {exp.created_by_user?.name || '—'}
                        </td>
                        <td className="px-4 py-3 text-end">
                          <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
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
        </div>
      </div>
      {/* Create Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-[1.7rem] bg-white p-8 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-950">{isArabic ? 'إنشاء مصروف' : 'Create Expense'}</h3>
                <p className="mt-1 text-sm text-slate-400">{isArabic ? 'أضف مصروف جديد' : 'Add a new expense'}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder={isArabic ? 'الوصف' : 'Description'}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="h-12 w-full rounded-[1rem] border border-slate-200 px-4 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              />
              <input
                type="number"
                placeholder={isArabic ? 'المبلغ (د.إ)' : 'Amount (AED)'}
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="h-12 w-full rounded-[1rem] border border-slate-200 px-4 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="h-12 w-full rounded-[1rem] border border-slate-200 px-4 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
              >
                <option value="supplies">{isArabic ? 'مستلزمات' : 'Supplies'}</option>
                <option value="maintenance">{isArabic ? 'صيانة' : 'Maintenance'}</option>
                <option value="other">{isArabic ? 'أخرى' : 'Other'}</option>
              </select>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="h-12 w-full rounded-[1rem] border border-slate-200 px-4 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
              />
            </div>
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handleCreateExpense}
                disabled={creating || !formData.description || !formData.amount}
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
