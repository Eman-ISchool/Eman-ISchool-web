'use client';

import { useMemo, useState } from 'react';
import { FileQuestion, Search, TimerReset } from 'lucide-react';
import { useLocale } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type AssessmentScope = 'quizzes' | 'exams';
type AssessmentFilter = 'all' | 'published' | 'draft';

type AssessmentRow = {
  id: string;
  title: { ar: string; en: string };
  audience: { ar: string; en: string };
  teacher: string;
  submissions: number;
  completion: string;
  status: { ar: string; en: string };
  statusClassName: string;
  scheduledAt: string;
};

const assessmentMeta: Record<
  AssessmentScope,
  {
    hero: { ar: string; en: string };
    helper: { ar: string; en: string };
    createLabel: { ar: string; en: string };
    tone: string;
  }
> = {
  quizzes: {
    hero: { ar: 'الاختبارات القصيرة', en: 'Quizzes workspace' },
    helper: { ar: 'إدارة الاختبارات المنشورة والمسودات ونسب الإنجاز.', en: 'Manage published quizzes, drafts, and completion ratios.' },
    createLabel: { ar: 'اختبار جديد', en: 'New quiz' },
    tone: 'bg-[#f5f3ff] text-[#7c3aed]',
  },
  exams: {
    hero: { ar: 'الامتحانات', en: 'Exams workspace' },
    helper: { ar: 'متابعة الامتحانات المجدولة ونتائج المحاولات الحالية.', en: 'Track scheduled exams and current attempt outcomes.' },
    createLabel: { ar: 'امتحان جديد', en: 'New exam' },
    tone: 'bg-[#eef4ff] text-[#2563eb]',
  },
};

const assessmentRowsByScope: Record<AssessmentScope, AssessmentRow[]> = {
  quizzes: [
    {
      id: 'quiz-1',
      title: { ar: 'اختبار الفيزياء الأسبوعي', en: 'Weekly physics quiz' },
      audience: { ar: 'الأول الثانوي', en: 'First secondary' },
      teacher: 'Magda zahran',
      submissions: 24,
      completion: '92%',
      status: { ar: 'منشور', en: 'Published' },
      statusClassName: 'bg-[#edfdf3] text-[#15803d]',
      scheduledAt: '2026-03-11 08:00',
    },
    {
      id: 'quiz-2',
      title: { ar: 'اختبار الإنجليزية التأسيسي', en: 'Foundation English quiz' },
      audience: { ar: 'الصف السادس', en: 'Sixth grade' },
      teacher: 'Muzna seth',
      submissions: 18,
      completion: '84%',
      status: { ar: 'منشور', en: 'Published' },
      statusClassName: 'bg-[#edfdf3] text-[#15803d]',
      scheduledAt: '2026-03-12 10:30',
    },
    {
      id: 'quiz-3',
      title: { ar: 'اختبار مراجعات الرياضيات', en: 'Math revision quiz' },
      audience: { ar: 'الثالث الثانوي', en: 'Third secondary' },
      teacher: 'رحاب رائد فيصل',
      submissions: 0,
      completion: '0%',
      status: { ar: 'مسودة', en: 'Draft' },
      statusClassName: 'bg-[#eef2ff] text-[#4338ca]',
      scheduledAt: '2026-03-14 18:00',
    },
  ],
  exams: [
    {
      id: 'exam-1',
      title: { ar: 'الامتحان التجريبي الأول', en: 'First mock exam' },
      audience: { ar: 'الثالث الثانوي', en: 'Third secondary' },
      teacher: 'د. رحمة خليل',
      submissions: 30,
      completion: '87%',
      status: { ar: 'منشور', en: 'Published' },
      statusClassName: 'bg-[#edfdf3] text-[#15803d]',
      scheduledAt: '2026-03-15 09:00',
    },
    {
      id: 'exam-2',
      title: { ar: 'امتحان اللغة العربية النهائي', en: 'Final Arabic exam' },
      audience: { ar: 'الأول الثانوي', en: 'First secondary' },
      teacher: 'لادن ادريس بابكر ادريس',
      submissions: 12,
      completion: '52%',
      status: { ar: 'قيد التنفيذ', en: 'Running' },
      statusClassName: 'bg-[#fff7ed] text-[#c2410c]',
      scheduledAt: '2026-03-10 12:00',
    },
    {
      id: 'exam-3',
      title: { ar: 'امتحان تأسيسي تجريبي', en: 'Foundation mock exam' },
      audience: { ar: 'الصف السادس', en: 'Sixth grade' },
      teacher: 'Muzna seth',
      submissions: 0,
      completion: '0%',
      status: { ar: 'مسودة', en: 'Draft' },
      statusClassName: 'bg-[#eef2ff] text-[#4338ca]',
      scheduledAt: '2026-03-18 16:00',
    },
  ],
};

export default function ReferenceAssessmentWorkspace({ scope }: { scope: AssessmentScope }) {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const meta = assessmentMeta[scope];
  const rows = assessmentRowsByScope[scope];
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<AssessmentFilter>('all');
  const [notice, setNotice] = useState<string | null>(null);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesQuery =
        !normalizedQuery ||
        [row.title.ar, row.title.en, row.audience.ar, row.audience.en, row.teacher]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesFilter =
        filter === 'all' ||
        (filter === 'published' && row.status.en !== 'Draft') ||
        (filter === 'draft' && row.status.en === 'Draft');

      return matchesQuery && matchesFilter;
    });
  }, [filter, query, rows]);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2400);
  };

  const publishedCount = rows.filter((row) => row.status.en !== 'Draft').length;
  const draftCount = rows.filter((row) => row.status.en === 'Draft').length;
  const averageCompletion = `${Math.round(
    rows.reduce((total, row) => total + Number.parseInt(row.completion, 10), 0) / Math.max(rows.length, 1),
  )}%`;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [isArabic ? 'إجمالي النماذج' : 'Total assessments', rows.length, meta.tone],
          [isArabic ? 'منشور / جاري' : 'Published / running', publishedCount, 'bg-[#edfdf3] text-[#15803d]'],
          [isArabic ? 'مسودات' : 'Drafts', draftCount, 'bg-[#eef2ff] text-[#4338ca]'],
          [isArabic ? 'متوسط الإنجاز' : 'Average completion', averageCompletion, 'bg-[#fff7ed] text-[#c2410c]'],
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
                <FileQuestion className="h-5 w-5" />
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
                onClick={() => showNotice(isArabic ? 'تم تحديث حالة النماذج.' : 'Assessment state refreshed.')}
              >
                <TimerReset className="ml-2 h-4 w-4" />
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
                  placeholder={isArabic ? 'ابحث بعنوان النموذج أو المعلم' : 'Search by title or teacher'}
                  className="h-12 rounded-2xl border-slate-200 bg-white pe-11"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {([
                  ['all', isArabic ? 'الكل' : 'All'],
                  ['published', isArabic ? 'منشور' : 'Published'],
                  ['draft', isArabic ? 'مسودة' : 'Draft'],
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
            {filteredRows.map((row) => (
              <article key={row.id} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-950">{row.title[isArabic ? 'ar' : 'en']}</h3>
                    <p className="mt-1 text-sm text-slate-500">{row.audience[isArabic ? 'ar' : 'en']}</p>
                    <p className="mt-2 text-xs font-semibold text-slate-400">{row.teacher}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${row.statusClassName}`}>
                    {row.status[isArabic ? 'ar' : 'en']}
                  </span>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-4">
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs text-slate-400">{isArabic ? 'الجدولة' : 'Schedule'}</p>
                    <p className="mt-2 font-semibold text-slate-900">{row.scheduledAt}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs text-slate-400">{isArabic ? 'المحاولات' : 'Attempts'}</p>
                    <p className="mt-2 font-semibold text-slate-900">{row.submissions}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs text-slate-400">{isArabic ? 'الإنجاز' : 'Completion'}</p>
                    <p className="mt-2 font-semibold text-slate-900">{row.completion}</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2 rounded-2xl bg-white p-4">
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
                          isArabic
                            ? `تم تجهيز نتائج ${row.title.ar}.`
                            : `${row.title.en} results prepared.`,
                        )
                      }
                      className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                    >
                      {isArabic ? 'النتائج' : 'Results'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-black text-slate-950">{isArabic ? 'الخطوات القادمة' : 'Next steps'}</h3>
            <div className="mt-4 space-y-3">
              {rows.slice(0, 3).map((row) => (
                <div key={row.id} className="rounded-[1.2rem] bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">{row.title[isArabic ? 'ar' : 'en']}</p>
                  <p className="mt-1 text-sm text-slate-500">{row.scheduledAt}</p>
                  <p className="mt-2 text-xs text-slate-400">{row.teacher}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-black text-slate-950">{isArabic ? 'ملخص التنفيذ' : 'Execution summary'}</h3>
            <div className="mt-4 space-y-3">
              {[
                [isArabic ? 'جاهز للنشر' : 'Ready to publish', `${publishedCount}`],
                [isArabic ? 'بحاجة مراجعة' : 'Needs review', `${draftCount}`],
                [isArabic ? 'متوسط المحاولات' : 'Average attempts', `${Math.round(rows.reduce((total, row) => total + row.submissions, 0) / Math.max(rows.length, 1))}`],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex items-center justify-between rounded-[1.2rem] bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-500">{label}</span>
                  <span className="font-semibold text-slate-950">{value}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
