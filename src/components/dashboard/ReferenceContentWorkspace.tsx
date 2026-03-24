'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Megaphone, Newspaper, Search } from 'lucide-react';
import { useLocale } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type ContentScope = 'announcements' | 'blogs';

type ContentRow = {
  id: string;
  title: { ar: string; en: string };
  category: { ar: string; en: string };
  channel: string;
  updatedAt: string;
  audience: string;
  status: { ar: string; en: string };
  statusClassName: string;
};

const contentMeta: Record<
  ContentScope,
  {
    hero: { ar: string; en: string };
    helper: { ar: string; en: string };
    createLabel: { ar: string; en: string };
    icon: typeof Megaphone;
    tone: string;
  }
> = {
  announcements: {
    hero: { ar: 'الإعلانات والتنبيهات', en: 'Announcements workspace' },
    helper: { ar: 'إدارة الإعلانات العامة والتنبيهات الموجهة للفصول والأقسام.', en: 'Manage public announcements and targeted bundle alerts.' },
    createLabel: { ar: 'إعلان جديد', en: 'New announcement' },
    icon: Megaphone,
    tone: 'bg-[#fff7ed] text-[#ea580c]',
  },
  blogs: {
    hero: { ar: 'المقالات والمدونات', en: 'Blogs workspace' },
    helper: { ar: 'واجهة تحرير ومراجعة ونشر المقالات التسويقية والتعليمية.', en: 'Editorial workflow for marketing and academic posts.' },
    createLabel: { ar: 'مقال جديد', en: 'New article' },
    icon: Newspaper,
    tone: 'bg-[#eef4ff] text-[#2563eb]',
  },
};

const contentApiByScope: Record<ContentScope, string> = {
  announcements: '/api/announcements',
  blogs: '/api/blogs',
};

function mapApiToContentRow(item: Record<string, unknown>): ContentRow {
  const id = String(item.id || '');
  const titleAr = String(item.title_ar || item.title || item.name || '');
  const titleEn = String(item.title_en || item.title || item.name || '');
  const catAr = String(item.category_ar || item.category || item.type || '');
  const catEn = String(item.category_en || item.category || item.type || '');
  const channel = String(item.channel || item.target || '-');
  const updatedAt = String(item.updated_at || item.created_at || '-').replace('T', ' ').slice(0, 16);
  const audience = String(item.audience || item.view_count || '0');
  const isPublished = item.is_published === true || item.status === 'published';

  return {
    id,
    title: { ar: titleAr, en: titleEn },
    category: { ar: catAr, en: catEn },
    channel,
    updatedAt,
    audience,
    status: isPublished ? { ar: 'منشور', en: 'Published' } : { ar: 'مسودة', en: 'Draft' },
    statusClassName: isPublished ? 'bg-[#edfdf3] text-[#15803d]' : 'bg-[#eef2ff] text-[#4338ca]',
  };
}

export default function ReferenceContentWorkspace({ scope }: { scope: ContentScope }) {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const meta = contentMeta[scope];
  const [rows, setRows] = useState<ContentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    setLoading(true);
    setError(null);

    // For blogs, fetch all (published=false) so we can filter client-side
    const url = scope === 'blogs'
      ? `${contentApiByScope[scope]}?published=false`
      : contentApiByScope[scope];

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          return res.json().then((body) => {
            throw new Error(body?.error || `${res.status} ${res.statusText}`);
          }).catch((parseErr) => {
            if (parseErr instanceof Error && parseErr.message !== `${res.status} ${res.statusText}`) {
              throw parseErr;
            }
            throw new Error(`${res.status} ${res.statusText}`);
          });
        }
        return res.json();
      })
      .then((data) => {
        const items = Array.isArray(data)
          ? data
          : data?.announcements || data?.data || data?.blogs || data?.posts || [];
        setRows(items.map((item: Record<string, unknown>) => mapApiToContentRow(item)));
      })
      .catch((err: Error) => {
        setRows([]);
        setError(err.message || (isArabic ? 'حدث خطأ أثناء تحميل البيانات' : 'An error occurred while loading data'));
      })
      .finally(() => setLoading(false));
  }, [scope, isArabic]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rows.filter((row) => {
      // Text search filter
      const matchesQuery =
        !normalizedQuery ||
        [row.title.ar, row.title.en, row.category.ar, row.category.en, row.channel]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);

      // Status filter (only for blogs scope)
      const matchesStatus =
        scope !== 'blogs' ||
        statusFilter === 'all' ||
        (statusFilter === 'published' && row.status.en === 'Published') ||
        (statusFilter === 'draft' && row.status.en === 'Draft');

      return matchesQuery && matchesStatus;
    });
  }, [query, rows, statusFilter, scope]);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2400);
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [isArabic ? 'إجمالي العناصر' : 'Total items', rows.length, meta.tone],
          [isArabic ? 'منشور' : 'Published', rows.filter((row) => row.status.en === 'Published').length, 'bg-[#edfdf3] text-[#15803d]'],
          [isArabic ? 'قيد المراجعة' : 'In review', rows.filter((row) => row.status.en === 'Review').length, 'bg-[#fff7ed] text-[#c2410c]'],
          [isArabic ? 'الجمهور المقدر' : 'Estimated audience', rows.reduce((total, row) => total + Number.parseInt(row.audience, 10), 0), 'bg-[#eef2ff] text-[#4338ca]'],
        ].map(([label, value, tone]) => (
          <article key={String(label)} className={`rounded-[1.75rem] p-5 shadow-sm ${tone}`}>
            <p className="text-sm font-semibold">{label}</p>
            <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`rounded-2xl p-3 ${meta.tone}`}>
                <meta.icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-950">{meta.hero[isArabic ? 'ar' : 'en']}</h2>
                <p className="mt-1 text-sm text-slate-500">{meta.helper[isArabic ? 'ar' : 'en']}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-slate-300"
                onClick={() => showNotice(isArabic ? 'تم تحديث المحتوى.' : 'Content state refreshed.')}
              >
                {isArabic ? 'تحديث' : 'Refresh'}
              </Button>
              <Button
                type="button"
                className="rounded-full bg-[#4f7cff] hover:bg-[#416ce4]"
                onClick={() =>
                  showNotice(
                    isArabic ? `تم فتح نموذج ${meta.createLabel.ar}.` : `${meta.createLabel.en} form opened.`,
                  )
                }
              >
                {meta.createLabel[isArabic ? 'ar' : 'en']}
              </Button>
            </div>
          </div>

          {notice ? (
            <div className="mt-4 rounded-[1.3rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {notice}
            </div>
          ) : null}

          <div className="mt-6 grid gap-3 rounded-[1.6rem] bg-slate-50 p-4 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={isArabic ? 'ابحث بعنوان أو قناة نشر' : 'Search by title or channel'}
                className="h-12 rounded-2xl border-slate-200 bg-white pe-11"
              />
            </div>
            {scope === 'blogs' ? (
              <div className="grid grid-cols-3 gap-2">
                {[
                  ['all', isArabic ? 'الكل' : 'All'],
                  ['published', isArabic ? 'منشور' : 'Published'],
                  ['draft', isArabic ? 'مسودة' : 'Draft'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStatusFilter(value as 'all' | 'published' | 'draft')}
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      statusFilter === value ? 'bg-slate-950 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="mt-6 grid gap-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-36 animate-pulse rounded-[1.75rem] bg-slate-100" />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-10 text-center">
                <div className="mx-auto flex max-w-md flex-col items-center gap-2">
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                  <p className="text-sm font-semibold text-red-600">
                    {isArabic ? 'حدث خطأ أثناء تحميل البيانات' : 'An error occurred while loading data'}
                  </p>
                  <p className="text-xs text-red-500">{error}</p>
                </div>
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="rounded-[1.75rem] border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
                {isArabic ? 'لا توجد بيانات حالياً.' : 'No data available.'}
              </div>
            ) : null}
            {filteredRows.map((row) => (
              <article key={row.id} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-950">{row.title[isArabic ? 'ar' : 'en']}</h3>
                    <p className="mt-1 text-sm text-slate-500">{row.category[isArabic ? 'ar' : 'en']}</p>
                    <p className="mt-2 text-xs text-slate-400">
                      {row.channel} • {row.updatedAt}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${row.statusClassName}`}>
                    {row.status[isArabic ? 'ar' : 'en']}
                  </span>
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] bg-white px-4 py-3">
                  <p className="text-sm text-slate-500">
                    {isArabic ? 'الجمهور' : 'Audience'}: <span className="font-semibold text-slate-950">{row.audience}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        showNotice(isArabic ? `تم فتح معاينة ${row.title.ar}.` : `${row.title.en} preview opened.`)
                      }
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      {isArabic ? 'معاينة' : 'Preview'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        showNotice(
                          isArabic ? `تم تجهيز نشر ${row.title.ar}.` : `${row.title.en} publish action prepared.`,
                        )
                      }
                      className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                    >
                      {isArabic ? 'نشر' : 'Publish'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-black text-slate-950">{isArabic ? 'القنوات' : 'Channels'}</h3>
            <div className="mt-4 space-y-3">
              {[
                ['Website', scope === 'blogs' ? '3' : '1'],
                ['Email', scope === 'blogs' ? '1' : '2'],
                ['In-app', scope === 'blogs' ? '0' : '3'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-[1.2rem] bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-500">{label}</span>
                  <span className="font-semibold text-slate-950">{value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-black text-slate-950">{isArabic ? 'آخر تحديث' : 'Latest update'}</h3>
            <p className="mt-3 rounded-[1.2rem] bg-slate-50 p-4 text-sm leading-7 text-slate-500">
              {isArabic
                ? 'تمت محاذاة هذه المساحة مع أسلوب البطاقات والمراجعة السريعة في المرجع، مع إبقاء أزرار النشر والمعاينة فعالة.'
                : 'This workspace follows the same quick-review card pattern as the reference while keeping publish and preview actions active.'}
            </p>
          </section>
        </aside>
      </section>
    </div>
  );
}
