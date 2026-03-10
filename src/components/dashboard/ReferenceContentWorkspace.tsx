'use client';

import { useMemo, useState } from 'react';
import { Megaphone, Newspaper, Search } from 'lucide-react';
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

const contentRowsByScope: Record<ContentScope, ContentRow[]> = {
  announcements: [
    {
      id: 'announcement-1',
      title: { ar: 'تحديث مواعيد البث المباشر', en: 'Live-session schedule update' },
      category: { ar: 'الإدارة', en: 'Administration' },
      channel: 'All students',
      updatedAt: '2026-03-10 08:20',
      audience: '1,240',
      status: { ar: 'منشور', en: 'Published' },
      statusClassName: 'bg-[#edfdf3] text-[#15803d]',
    },
    {
      id: 'announcement-2',
      title: { ar: 'فتح باب المراجعات النهائية', en: 'Final revisions enrollment open' },
      category: { ar: 'أكاديمي', en: 'Academic' },
      channel: 'Third secondary',
      updatedAt: '2026-03-09 17:00',
      audience: '218',
      status: { ar: 'مجدول', en: 'Scheduled' },
      statusClassName: 'bg-[#eef2ff] text-[#4338ca]',
    },
    {
      id: 'announcement-3',
      title: { ar: 'تنبيه بخصوص الرسوم المستحقة', en: 'Outstanding fee reminder' },
      category: { ar: 'مالية', en: 'Finance' },
      channel: 'Guardians',
      updatedAt: '2026-03-08 12:10',
      audience: '94',
      status: { ar: 'مراجعة', en: 'Review' },
      statusClassName: 'bg-[#fff7ed] text-[#c2410c]',
    },
  ],
  blogs: [
    {
      id: 'blog-1',
      title: { ar: 'كيف نبني خطة مراجعة فعالة للثانوية؟', en: 'How to build an effective secondary revision plan' },
      category: { ar: 'تعليمي', en: 'Education' },
      channel: 'Website blog',
      updatedAt: '2026-03-10 09:15',
      audience: '1,880',
      status: { ar: 'منشور', en: 'Published' },
      statusClassName: 'bg-[#edfdf3] text-[#15803d]',
    },
    {
      id: 'blog-2',
      title: { ar: 'لماذا يفضل أولياء الأمور التعلم المرن؟', en: 'Why guardians prefer flexible learning' },
      category: { ar: 'تسويق', en: 'Marketing' },
      channel: 'Landing pages',
      updatedAt: '2026-03-07 14:40',
      audience: '940',
      status: { ar: 'مسودة', en: 'Draft' },
      statusClassName: 'bg-[#eef2ff] text-[#4338ca]',
    },
    {
      id: 'blog-3',
      title: { ar: 'قصة نجاح: من المراجعات إلى التفوق', en: 'Success story: from revisions to excellence' },
      category: { ar: 'قصص نجاح', en: 'Success stories' },
      channel: 'Newsletter',
      updatedAt: '2026-03-05 11:00',
      audience: '620',
      status: { ar: 'مراجعة', en: 'Review' },
      statusClassName: 'bg-[#fff7ed] text-[#c2410c]',
    },
  ],
};

export default function ReferenceContentWorkspace({ scope }: { scope: ContentScope }) {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const meta = contentMeta[scope];
  const rows = contentRowsByScope[scope];
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return rows;
    }

    return rows.filter((row) =>
      [row.title.ar, row.title.en, row.category.ar, row.category.en, row.channel]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query, rows]);

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

          <div className="mt-6 relative">
            <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={isArabic ? 'ابحث بعنوان أو قناة نشر' : 'Search by title or channel'}
              className="h-12 rounded-2xl border-slate-200 bg-white pe-11"
            />
          </div>

          <div className="mt-6 grid gap-4">
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
