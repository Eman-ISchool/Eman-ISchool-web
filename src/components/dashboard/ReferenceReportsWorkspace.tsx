'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';

const reportRows = [
  {
    title: 'كورس المعلم الإلكتروني',
    subject: 'الفيزياء',
    schedule: 'MONDAY • 08:00 - 09:00',
    status: { ar: 'نشط', en: 'Active' },
    teacher: 'Magda zahran',
    lessons: 1,
    attendance: '100.0%',
  },
  {
    title: 'كورس المعلم الإلكتروني',
    subject: 'اللغة العربية (٤)',
    schedule: 'MONDAY • 10:00 - 11:00',
    status: { ar: 'نشط', en: 'Active' },
    teacher: 'لادن ادريس بابكر ادريس',
    lessons: 1,
    attendance: '100.0%',
  },
  {
    title: 'كورس المعلم الإلكتروني',
    subject: 'المعلم الإلكتروني',
    schedule: 'TUESDAY • 20:00 - 22:00',
    status: { ar: 'نشط', en: 'Active' },
    teacher: 'د. رحمة خليل',
    lessons: 8,
    attendance: '87.5%',
  },
];

const reportTabs = ['bundle', 'teacher', 'course'] as const;

function PreviewButton({
  children,
  onClick,
  tone = 'light',
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone?: 'light' | 'dark' | 'primary';
}) {
  const toneClass =
    tone === 'dark'
      ? 'bg-slate-950 text-white hover:bg-slate-800'
      : tone === 'primary'
        ? 'bg-[#4f7cff] text-white hover:bg-[#416ce4]'
        : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${toneClass}`}
    >
      {children}
    </button>
  );
}

function PreviewInput({ placeholder, type = 'text' }: { placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#4f7cff]"
    />
  );
}

export default function ReferenceReportsWorkspace() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [tab, setTab] = useState<(typeof reportTabs)[number]>('bundle');
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2500);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-400">
              {isArabic ? 'مؤشرات شاملة للأداء والحضور' : 'Comprehensive performance and attendance insights'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <PreviewButton
              onClick={() => showNotice(isArabic ? 'تم تحديث البيانات الاستعراضية.' : 'Preview data refreshed.')}
            >
              {isArabic ? 'تحديث' : 'Refresh'}
            </PreviewButton>
            <PreviewButton
              tone="dark"
              onClick={() => showNotice(isArabic ? 'تم تجهيز ملف التصدير.' : 'Export prepared.')}
            >
              {isArabic ? 'تصدير' : 'Export'}
            </PreviewButton>
          </div>
        </div>

        <div className="mt-6 rounded-[1.5rem] bg-slate-50 p-4">
          <h2 className="text-lg font-black text-slate-950">{isArabic ? 'عوامل التصفية' : 'Filters'}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-5">
            <PreviewInput type="date" />
            <PreviewInput type="date" />
            <PreviewInput placeholder={isArabic ? 'الفصل الدراسي' : 'Bundle'} />
            <PreviewInput placeholder={isArabic ? 'المعلم' : 'Teacher'} />
            <PreviewInput placeholder={isArabic ? 'المادة الدراسية' : 'Course'} />
          </div>
          <div className="mt-4">
            <PreviewButton
              tone="primary"
              onClick={() =>
                showNotice(isArabic ? 'تم تطبيق الفلاتر على البيانات الحالية.' : 'Filters applied to current data.')
              }
            >
              {isArabic ? 'تطبيق الفلاتر' : 'Apply filters'}
            </PreviewButton>
          </div>
        </div>

        {notice ? (
          <div className="mt-4 rounded-[1.25rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {notice}
          </div>
        ) : null}
      </section>

      <section className="space-y-6">
        <div className="inline-flex flex-wrap gap-2 rounded-[1.4rem] border border-slate-200 bg-white p-1 shadow-sm">
          {reportTabs.map((reportTab) => {
            const label =
              reportTab === 'bundle'
                ? isArabic
                  ? 'جدول الفصول'
                  : 'Bundle schedule'
                : reportTab === 'teacher'
                  ? isArabic
                    ? 'أداء المعلمين'
                    : 'Teacher performance'
                  : isArabic
                    ? 'تحليلات المواد'
                    : 'Course analytics';

            const active = tab === reportTab;

            return (
              <button
                key={reportTab}
                type="button"
                onClick={() => setTab(reportTab)}
                className={`rounded-[1rem] px-5 py-2.5 text-sm font-semibold transition ${
                  active ? 'bg-[#4f7cff] text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {tab === 'bundle' ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {[
                [isArabic ? 'إجمالي الجداول' : 'Total schedules', '18'],
                [isArabic ? 'مع الحصص' : 'With lessons', '7'],
                [isArabic ? 'بدون حصص' : 'Without lessons', '11'],
                [isArabic ? 'إجمالي الحصص' : 'Total lessons', '28'],
                [isArabic ? 'نسبة الحضور' : 'Attendance rate', '36.8%'],
              ].map(([label, value]) => (
                <article
                  key={String(label)}
                  className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-sm text-slate-400">{label}</p>
                  <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
                </article>
              ))}
            </div>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-2xl font-black text-slate-950">
                {isArabic ? 'تفاصيل جدول الفصول' : 'Bundle schedule details'}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {isArabic
                  ? 'عرض تفصيلي للجداول والحضور والمعلم المسؤول.'
                  : 'Detailed view of schedules, attendance, and assigned teachers.'}
              </p>

              <div className="mt-6 grid gap-4">
                {reportRows.map((row) => (
                  <article
                    key={`${row.title}-${row.subject}-${row.teacher}`}
                    className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h4 className="text-lg font-bold text-slate-950">{row.title}</h4>
                        <p className="mt-1 text-sm text-slate-500">{row.subject}</p>
                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          {row.schedule}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {row.status[isArabic ? 'ar' : 'en']}
                      </span>
                    </div>
                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl bg-white p-4">
                        <p className="text-xs text-slate-400">{isArabic ? 'المعلم' : 'Teacher'}</p>
                        <p className="mt-2 font-semibold text-slate-900">{row.teacher}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-4">
                        <p className="text-xs text-slate-400">{isArabic ? 'إجمالي الحصص' : 'Total lessons'}</p>
                        <p className="mt-2 font-semibold text-slate-900">{row.lessons}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-4">
                        <p className="text-xs text-slate-400">{isArabic ? 'نسبة الحضور' : 'Attendance rate'}</p>
                        <p className="mt-2 font-semibold text-slate-900">{row.attendance}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        ) : null}

        {tab === 'teacher' ? (
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 text-sm leading-7 text-slate-500 shadow-sm">
            {isArabic
              ? 'تمت محاذاة هذا القسم مع نمط التبويب والتحليلات في المرجع. يمكن توسيع مؤشرات الأداء التفصيلية بمجرد جاهزية بيانات المعلمين التفصيلية.'
              : 'This section aligns with the tabbed analytics pattern from the reference. Detailed teacher KPIs can be expanded once richer teacher metrics are available.'}
          </section>
        ) : null}

        {tab === 'course' ? (
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 text-sm leading-7 text-slate-500 shadow-sm">
            {isArabic
              ? 'هذا التبويب يحافظ على بنية المرجع ويؤسس لمسار تحليلات المواد الدراسية دون كسر المسارات الحالية.'
              : 'This tab preserves the reference structure and prepares the course analytics path without disturbing current flows.'}
          </section>
        ) : null}
      </section>
    </div>
  );
}
