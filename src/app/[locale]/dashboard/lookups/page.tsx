'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react';
import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';

interface LookupCategory {
  id: number;
  name: string;
  description: string;
  itemCount: number;
  items: { key: string; value: string }[];
  createdAt: string | null;
}

export default function LookupsPage() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] === 'en' ? 'en' : 'ar';
  const isArabic = locale === 'ar';

  const [categories, setCategories] = useState<LookupCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingCategory, setViewingCategory] = useState<LookupCategory | null>(null);

  const fetchLookups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/lookups');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCategories(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLookups();
  }, [fetchLookups]);

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const pageTitle = isArabic ? 'البيانات المرجعية' : 'Lookups';
  const pageSubtitle = isArabic
    ? 'إدارة البيانات المرجعية والقوائم المنسدلة'
    : 'Manage reference data and dropdown lists';

  return (
    <ReferenceDashboardShell pageTitle={pageTitle} pageSubtitle={pageSubtitle}>
      <div className="space-y-6">
        {/* Header with create button and search */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={isArabic ? 'بحث عن الفئات ...' : 'Search categories...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pe-4 ps-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>
          <button className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800">
            <Plus className="h-4 w-4" />
            <span>{isArabic ? 'إنشاء فئة' : 'Create Category'}</span>
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="rounded-lg border border-slate-200 bg-white p-8">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="h-4 w-12 rounded bg-slate-200" />
                    <div className="h-4 w-32 rounded bg-slate-200" />
                    <div className="flex-1" />
                    <div className="h-4 w-20 rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-700">
              {isArabic ? 'فشل تحميل البيانات المرجعية' : 'Failed to load lookups'}
            </p>
            <p className="mt-1 text-sm text-red-500">{error}</p>
            <button
              onClick={fetchLookups}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
            >
              {isArabic ? 'إعادة المحاولة' : 'Retry'}
            </button>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-end text-sm font-semibold text-slate-700">
                    {isArabic ? 'المعرف' : 'ID'}
                  </th>
                  <th className="px-4 py-3 text-end text-sm font-semibold text-slate-700">
                    {isArabic ? 'الاسم' : 'Name'}
                  </th>
                  <th className="px-4 py-3 text-end text-sm font-semibold text-slate-700">
                    {isArabic ? 'الوصف' : 'Description'}
                  </th>
                  <th className="px-4 py-3 text-end text-sm font-semibold text-slate-700">
                    {isArabic ? 'المواد الدراسية' : 'Courses'}
                  </th>
                  <th className="px-4 py-3 text-end text-sm font-semibold text-slate-700">
                    {isArabic ? 'الفصول' : 'Classes'}
                  </th>
                  <th className="px-4 py-3 text-end text-sm font-semibold text-slate-700">
                    {isArabic ? 'تاريخ الإنشاء' : 'Created Date'}
                  </th>
                  <th className="px-4 py-3 text-end text-sm font-semibold text-slate-700">
                    {isArabic ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">
                      {isArabic ? 'لا توجد بيانات مرجعية' : 'No lookup categories found'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((cat) => (
                    <tr
                      key={cat.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 text-end text-sm font-medium text-slate-900">
                        #{cat.id}
                      </td>
                      <td className="px-4 py-3 text-end text-sm text-slate-900">{cat.name}</td>
                      <td className="px-4 py-3 text-end text-sm text-slate-500">
                        {cat.description || (isArabic ? 'لا يوجد وصف' : 'No description')}
                      </td>
                      <td className="px-4 py-3 text-end text-sm text-slate-500">—</td>
                      <td className="px-4 py-3 text-end text-sm text-slate-500">—</td>
                      <td className="px-4 py-3 text-end text-sm text-slate-500">
                        {cat.createdAt
                          ? new Date(cat.createdAt).toLocaleDateString(
                              isArabic ? 'ar-SA' : 'en-US',
                            )
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-end">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewingCategory(cat)}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            title={isArabic ? 'عرض' : 'View'}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            title={isArabic ? 'تحرير' : 'Edit'}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            className="rounded-lg p-1.5 text-red-400 transition hover:bg-red-50 hover:text-red-600"
                            title={isArabic ? 'حذف' : 'Delete'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* View category modal */}
        {viewingCategory && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setViewingCategory(null)}
            />
            <div className="fixed inset-x-4 top-1/2 z-50 max-w-lg -translate-y-1/2 mx-auto rounded-xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">
                  {viewingCategory.name}
                </h3>
                <button
                  onClick={() => setViewingCategory(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  &times;
                </button>
              </div>
              <p className="text-sm text-slate-500 mb-4">{viewingCategory.description}</p>

              <div className="rounded-lg border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-3 py-2 text-end font-medium text-slate-700">
                        {isArabic ? 'المفتاح' : 'Key'}
                      </th>
                      <th className="px-3 py-2 text-end font-medium text-slate-700">
                        {isArabic ? 'القيمة' : 'Value'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingCategory.items.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-100 last:border-0">
                        <td className="px-3 py-2 text-end text-slate-600">{item.key}</td>
                        <td className="px-3 py-2 text-end text-slate-900">{item.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </ReferenceDashboardShell>
  );
}
