'use client';

import { useState, useCallback, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Plus, Search } from 'lucide-react';
import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';

interface Translation {
  id: string;
  key: string;
  ar: string;
  en: string;
  created_at?: string;
}

export default function TranslationsPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [query, setQuery] = useState('');
  const [data, setData] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const columns = isArabic
    ? ['المفتاح', 'العربية', 'الإنجليزية', 'الإجراءات']
    : ['Key', 'Arabic', 'English', 'Actions'];

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query) params.set('search', query);
      const res = await fetch(`/api/admin/translations?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json.translations || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <ReferenceDashboardShell
      pageTitle={isArabic ? 'الترجمة' : 'Translations'}
      pageSubtitle={isArabic ? 'إدارة ترجمات النظام' : 'Manage system translations'}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button className="inline-flex items-center gap-2 rounded-full bg-[#171717] px-5 py-3 text-sm font-bold text-white">
            <Plus className="h-4 w-4" />
            {isArabic ? 'إضافة ترجمة' : 'Add Translation'}
          </button>
        </div>

        {/* Main content card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-black text-slate-950">
              {isArabic ? 'الترجمة' : 'Translations'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isArabic ? 'إدارة ترجمات النظام' : 'Manage system translations'}
            </p>
          </div>

          {/* Search */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isArabic ? 'البحث في الترجمات...' : 'Search translations...'}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pe-4 ps-10 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              />
            </div>
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
                      {isArabic ? 'لا توجد ترجمات' : 'No translations found'}
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-end text-sm text-slate-900 font-mono font-medium">
                        {item.key}
                      </td>
                      <td className="px-4 py-3 text-end text-sm text-slate-700" dir="rtl">
                        {item.ar || '-'}
                      </td>
                      <td className="px-4 py-3 text-end text-sm text-slate-700" dir="ltr">
                        {item.en || '-'}
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
    </ReferenceDashboardShell>
  );
}
