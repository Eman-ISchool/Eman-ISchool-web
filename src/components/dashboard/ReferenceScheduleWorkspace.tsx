'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Radio, Search } from 'lucide-react';
import { useLocale } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type ScheduleScope = 'calendar' | 'live' | 'upcomingClasses';
type ScheduleFilter = 'all' | 'today' | 'live';

type ScheduleRow = {
  id: string;
  title: { ar: string; en: string };
  slot: string;
  owner: string;
  room: string;
  attendance: string;
  status: { ar: string; en: string };
  statusClassName: string;
  meetLink: string | null;
};

const scheduleMeta: Record<
  ScheduleScope,
  {
    hero: { ar: string; en: string };
    helper: { ar: string; en: string };
    createLabel: { ar: string; en: string };
    tone: string;
  }
> = {
  calendar: {
    hero: { ar: 'التقويم الأكاديمي', en: 'Calendar workspace' },
    helper: { ar: 'عرض الجلسات والأنشطة اليومية والجدولة القادمة.', en: 'Review sessions, daily activities, and upcoming scheduling.' },
    createLabel: { ar: 'حدث جديد', en: 'New event' },
    tone: 'bg-[#eef4ff] text-[#2563eb]',
  },
  live: {
    hero: { ar: 'الجلسات المباشرة', en: 'Live sessions workspace' },
    helper: { ar: 'متابعة الفصول المباشرة، حالة البث، والمعلمين النشطين.', en: 'Track live classes, stream state, and active instructors.' },
    createLabel: { ar: 'جلسة مباشرة', en: 'New live session' },
    tone: 'bg-[#fff1f2] text-[#e11d48]',
  },
  upcomingClasses: {
    hero: { ar: 'الحصص القادمة', en: 'Upcoming classes workspace' },
    helper: { ar: 'جدول موحد للفصول القادمة والتنبيهات المرتبطة بها.', en: 'Unified upcoming classes board with follow-up alerts.' },
    createLabel: { ar: 'حصة جديدة', en: 'New class' },
    tone: 'bg-[#edfdf3] text-[#15803d]',
  },
};

function mapApiToScheduleRow(item: Record<string, unknown>): ScheduleRow {
  const id = String(item.id || '');
  const titleAr = String(item.title_ar || item.title || item.name || item.course_name || '');
  const titleEn = String(item.title_en || item.title || item.name || item.course_name || '');
  const date = String(item.scheduled_date || item.date || item.start_time || '').split('T')[0];
  const startTime = String(item.start_time || '').split('T')[1]?.slice(0, 5) || '';
  const endTime = String(item.end_time || '').split('T')[1]?.slice(0, 5) || '';
  const slot = startTime ? `${date} \u2022 ${startTime} - ${endTime}` : date;
  const owner = String(item.teacher_name || item.teacher || '-');
  const room = String(item.room || item.location || '-');
  const attendance = String(item.attendance_count || item.student_count || '0');
  const status = String(item.status || 'scheduled');
  const isLive = status === 'live' || status === 'in_progress' || status === 'active';
  const isReady = status === 'ready' || status === 'upcoming';

  const meetLink = String(item.meetLink || item.meet_link || '').trim() || null;

  return {
    id,
    title: { ar: titleAr, en: titleEn },
    slot,
    owner,
    room,
    attendance,
    meetLink,
    status: isLive
      ? { ar: 'مباشر', en: 'Live' }
      : isReady
        ? { ar: 'قادم', en: 'Upcoming' }
        : { ar: 'مجدول', en: 'Scheduled' },
    statusClassName: isLive
      ? 'bg-[#edfdf3] text-[#15803d]'
      : isReady
        ? 'bg-[#fff7ed] text-[#c2410c]'
        : 'bg-[#eef2ff] text-[#4338ca]',
  };
}

export default function ReferenceScheduleWorkspace({ scope }: { scope: ScheduleScope }) {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const meta = scheduleMeta[scope];
  const [rows, setRows] = useState<ScheduleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ScheduleFilter>('all');
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/lessons?upcoming=true')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const items = Array.isArray(data) ? data : data?.lessons || [];
        setRows(items.map((item: Record<string, unknown>) => mapApiToScheduleRow(item)));
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [scope]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesQuery =
        !normalizedQuery ||
        [row.title.ar, row.title.en, row.owner, row.room, row.slot]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesFilter =
        filter === 'all' ||
        (filter === 'today' && row.slot.includes(new Date().toISOString().slice(0, 10))) ||
        (filter === 'live' && (row.status.en === 'Live' || row.status.en === 'Ready'));

      return matchesQuery && matchesFilter;
    });
  }, [filter, query, rows]);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2400);
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [isArabic ? 'إجمالي الجلسات' : 'Total sessions', rows.length, meta.tone],
          [isArabic ? 'اليوم' : 'Today', rows.filter((row) => row.slot.includes(new Date().toISOString().slice(0, 10))).length, 'bg-[#eef2ff] text-[#4338ca]'],
          [isArabic ? 'نشط / جاهز' : 'Live / ready', rows.filter((row) => row.status.en === 'Live' || row.status.en === 'Ready').length, 'bg-[#edfdf3] text-[#15803d]'],
          [isArabic ? 'إجمالي الحضور' : 'Attendance total', rows.reduce((total, row) => total + Number.parseInt(row.attendance, 10), 0), 'bg-[#fff7ed] text-[#c2410c]'],
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
                {scope === 'live' ? <Radio className="h-5 w-5" /> : <CalendarDays className="h-5 w-5" />}
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
                onClick={() => showNotice(isArabic ? 'تم تحديث الجلسات الحالية.' : 'Session roster refreshed.')}
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

          <div className="mt-6 rounded-[1.6rem] bg-slate-50 p-4">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={isArabic ? 'ابحث بعنوان الجلسة أو المعلم أو القاعة' : 'Search by title, teacher, or room'}
                  className="h-12 rounded-2xl border-slate-200 bg-white pe-11"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {([
                  ['all', isArabic ? 'الكل' : 'All'],
                  ['today', isArabic ? 'اليوم' : 'Today'],
                  ['live', isArabic ? 'نشط' : 'Live'],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilter(value)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      filter === value
                        ? 'bg-slate-950 text-white'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-36 animate-pulse rounded-[1.75rem] bg-slate-100" />
                ))}
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="rounded-[1.75rem] border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
                {isArabic ? 'لا توجد جلسات حالياً.' : 'No sessions available.'}
              </div>
            ) : null}
            {filteredRows.map((row) => (
              <article key={row.id} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-950">{row.title[isArabic ? 'ar' : 'en']}</h3>
                    <p className="mt-1 text-sm text-slate-500">{row.slot}</p>
                    <p className="mt-2 text-xs text-slate-400">
                      {row.owner} • {row.room}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${row.statusClassName}`}>
                    {row.status[isArabic ? 'ar' : 'en']}
                  </span>
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] bg-white px-4 py-3">
                  <p className="text-sm text-slate-500">
                    {isArabic ? 'الحضور المتوقع' : 'Expected attendance'}:{' '}
                    <span className="font-semibold text-slate-950">{row.attendance}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {scope === 'live' ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (row.meetLink) {
                            window.open(row.meetLink, '_blank', 'noopener,noreferrer');
                          } else {
                            showNotice(
                              isArabic ? 'لا يوجد رابط اجتماع متاح' : 'No meeting link available',
                            );
                          }
                        }}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                      >
                        {isArabic ? 'الدخول' : 'Join'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          window.location.href = `/dashboard/lessons/${row.id}`;
                        }}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                      >
                        {isArabic ? 'التفاصيل' : 'Details'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        showNotice(
                          isArabic ? `تم إرسال تنبيه ${row.title.ar}.` : `${row.title.en} notification sent.`,
                        )
                      }
                      className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                    >
                      {isArabic ? 'تنبيه' : 'Notify'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-black text-slate-950">{isArabic ? 'ملخص اليوم' : 'Today summary'}</h3>
            <div className="mt-4 space-y-3">
              {rows.slice(0, 3).map((row) => (
                <div key={row.id} className="rounded-[1.2rem] bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">{row.title[isArabic ? 'ar' : 'en']}</p>
                  <p className="mt-1 text-sm text-slate-500">{row.slot}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-black text-slate-950">{isArabic ? 'جاهزية القاعات' : 'Room readiness'}</h3>
            <div className="mt-4 space-y-3">
              {[
                [isArabic ? 'القاعة أ' : 'Room A', '—'],
                [isArabic ? 'القاعة ب' : 'Room B', '—'],
                [isArabic ? 'القاعة ج' : 'Room C', '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-[1.2rem] bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-500">{label}</span>
                  <span className="font-semibold text-slate-400">{value}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
