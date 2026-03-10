'use client';

import { useMemo, useState } from 'react';
import { GraduationCap, Search, UserRound, Users, UserSquare2 } from 'lucide-react';
import { useLocale } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type PeopleScope = 'students' | 'teachers' | 'teacherStudents';
type PeopleFilter = 'all' | 'active' | 'followup';

type PeopleRow = {
  id: string;
  name: string;
  segment: { ar: string; en: string };
  lead: string;
  progress: string;
  attendance: string;
  status: { ar: string; en: string };
  statusClassName: string;
  lastSeen: string;
};

const peopleMeta: Record<
  PeopleScope,
  {
    hero: { ar: string; en: string };
    helper: { ar: string; en: string };
    createLabel: { ar: string; en: string };
    icon: typeof Users;
    tone: string;
  }
> = {
  students: {
    hero: { ar: 'إدارة الطلاب', en: 'Students workspace' },
    helper: { ar: 'متابعة الطلاب، مستوياتهم، ونشاطهم اليومي بنفس كثافة المرجع.', en: 'Track students, levels, and daily activity with reference-like density.' },
    createLabel: { ar: 'طالب جديد', en: 'New student' },
    icon: GraduationCap,
    tone: 'bg-[#eef4ff] text-[#2563eb]',
  },
  teachers: {
    hero: { ar: 'إدارة المعلمين', en: 'Teachers workspace' },
    helper: { ar: 'مراجعة حمل التدريس، الحضور، والفصول المسندة لكل معلم.', en: 'Review teaching load, attendance, and assigned bundles for each teacher.' },
    createLabel: { ar: 'معلم جديد', en: 'New teacher' },
    icon: UserSquare2,
    tone: 'bg-[#f5f3ff] text-[#7c3aed]',
  },
  teacherStudents: {
    hero: { ar: 'طلاب المعلم', en: 'Teacher students workspace' },
    helper: { ar: 'قائمة مجمعة لطلاب المعلمين مع حالات المتابعة السريعة.', en: 'Consolidated teacher-student roster with quick follow-up states.' },
    createLabel: { ar: 'إسناد طالب', en: 'Assign student' },
    icon: Users,
    tone: 'bg-[#edfdf3] text-[#15803d]',
  },
};

const peopleRowsByScope: Record<PeopleScope, PeopleRow[]> = {
  students: [
    {
      id: 'student-1',
      name: 'ميرا محمود حسن',
      segment: { ar: 'الأول الثانوي', en: 'First secondary' },
      lead: 'Magda zahran',
      progress: '91%',
      attendance: '100%',
      status: { ar: 'نشط', en: 'Active' },
      statusClassName: 'bg-[#edfdf3] text-[#15803d]',
      lastSeen: '2026-03-10',
    },
    {
      id: 'student-2',
      name: 'رتاج محمد فاروق',
      segment: { ar: 'الأول الثانوي', en: 'First secondary' },
      lead: 'Magda zahran',
      progress: '88%',
      attendance: '97%',
      status: { ar: 'يحتاج متابعة', en: 'Needs follow-up' },
      statusClassName: 'bg-[#fff7ed] text-[#c2410c]',
      lastSeen: '2026-03-09',
    },
    {
      id: 'student-3',
      name: 'ليان عبد الرحمن',
      segment: { ar: 'الصف السادس', en: 'Sixth grade' },
      lead: 'Muzna seth',
      progress: '69%',
      attendance: '93%',
      status: { ar: 'نشط', en: 'Active' },
      statusClassName: 'bg-[#edfdf3] text-[#15803d]',
      lastSeen: '2026-03-08',
    },
    {
      id: 'student-4',
      name: 'يوسف سامي محمود',
      segment: { ar: 'الثالث الثانوي', en: 'Third secondary' },
      lead: 'رحاب رائد فيصل',
      progress: '67%',
      attendance: '84%',
      status: { ar: 'متأخر', en: 'Delayed' },
      statusClassName: 'bg-[#fff1f2] text-[#e11d48]',
      lastSeen: '2026-03-06',
    },
  ],
  teachers: [
    {
      id: 'teacher-1',
      name: 'Magda zahran',
      segment: { ar: '3 فصول نشطة', en: '3 active bundles' },
      lead: 'قسم العلوم',
      progress: '91%',
      attendance: '98%',
      status: { ar: 'نشط', en: 'Active' },
      statusClassName: 'bg-[#edfdf3] text-[#15803d]',
      lastSeen: '2026-03-10',
    },
    {
      id: 'teacher-2',
      name: 'Muzna seth',
      segment: { ar: '2 فصل', en: '2 bundles' },
      lead: 'قسم اللغة الإنجليزية',
      progress: '88%',
      attendance: '94%',
      status: { ar: 'نشط', en: 'Active' },
      statusClassName: 'bg-[#edfdf3] text-[#15803d]',
      lastSeen: '2026-03-09',
    },
    {
      id: 'teacher-3',
      name: 'رحاب رائد فيصل',
      segment: { ar: '1 فصل', en: '1 bundle' },
      lead: 'قسم الرياضيات',
      progress: '79%',
      attendance: '86%',
      status: { ar: 'يحتاج متابعة', en: 'Needs follow-up' },
      statusClassName: 'bg-[#fff7ed] text-[#c2410c]',
      lastSeen: '2026-03-07',
    },
  ],
  teacherStudents: [
    {
      id: 'teacher-student-1',
      name: 'محمد يوسف حسن',
      segment: { ar: 'مجموعة Magda zahran', en: 'Magda zahran group' },
      lead: 'كورس المعلم الإلكتروني',
      progress: '84%',
      attendance: '92%',
      status: { ar: 'نشط', en: 'Active' },
      statusClassName: 'bg-[#edfdf3] text-[#15803d]',
      lastSeen: '2026-03-08',
    },
    {
      id: 'teacher-student-2',
      name: 'فاطمة علي أحمد علي',
      segment: { ar: 'مجموعة د. رحمة خليل', en: 'Dr. Rahma group' },
      lead: 'المراجعات النهائية',
      progress: '77%',
      attendance: '89%',
      status: { ar: 'يحتاج متابعة', en: 'Needs follow-up' },
      statusClassName: 'bg-[#fff7ed] text-[#c2410c]',
      lastSeen: '2026-03-07',
    },
    {
      id: 'teacher-student-3',
      name: 'ملك علي محمد',
      segment: { ar: 'مجموعة Muzna seth', en: 'Muzna seth group' },
      lead: 'تأسيس اللغة الإنجليزية',
      progress: '71%',
      attendance: '82%',
      status: { ar: 'متأخر', en: 'Delayed' },
      statusClassName: 'bg-[#fff1f2] text-[#e11d48]',
      lastSeen: '2026-03-05',
    },
  ],
};

export default function ReferencePeopleWorkspace({ scope }: { scope: PeopleScope }) {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const meta = peopleMeta[scope];
  const rows = peopleRowsByScope[scope];
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<PeopleFilter>('all');
  const [notice, setNotice] = useState<string | null>(null);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesQuery =
        !normalizedQuery ||
        [row.name, row.segment.ar, row.segment.en, row.lead]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesFilter =
        filter === 'all' ||
        (filter === 'active' && row.status.en === 'Active') ||
        (filter === 'followup' && row.status.en !== 'Active');

      return matchesQuery && matchesFilter;
    });
  }, [filter, query, rows]);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2400);
  };

  const activeCount = rows.filter((row) => row.status.en === 'Active').length;
  const followUpCount = rows.filter((row) => row.status.en !== 'Active').length;
  const averageAttendance = `${Math.round(
    rows.reduce((total, row) => total + Number.parseInt(row.attendance, 10), 0) / Math.max(rows.length, 1),
  )}%`;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [isArabic ? 'إجمالي السجلات' : 'Total records', rows.length, meta.tone],
          [isArabic ? 'السجلات النشطة' : 'Active records', activeCount, 'bg-[#edfdf3] text-[#15803d]'],
          [isArabic ? 'تحتاج متابعة' : 'Needs follow-up', followUpCount, 'bg-[#fff7ed] text-[#c2410c]'],
          [isArabic ? 'متوسط الحضور' : 'Average attendance', averageAttendance, 'bg-[#eef2ff] text-[#4338ca]'],
        ].map(([label, value, tone]) => (
          <article key={String(label)} className={`rounded-[1.75rem] p-5 shadow-sm ${tone}`}>
            <p className="text-sm font-semibold">{label}</p>
            <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_310px]">
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
                onClick={() => showNotice(isArabic ? 'تم تحديث القائمة الحالية.' : 'Current roster refreshed.')}
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
                  placeholder={isArabic ? 'ابحث بالاسم أو المجموعة أو المشرف' : 'Search by name, group, or lead'}
                  className="h-12 rounded-2xl border-slate-200 bg-white pe-11"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {([
                  ['all', isArabic ? 'الكل' : 'All'],
                  ['active', isArabic ? 'النشط' : 'Active'],
                  ['followup', isArabic ? 'متابعة' : 'Follow-up'],
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

          <div className="mt-6 overflow-auto">
            <table className="w-full min-w-[780px] text-right text-sm">
              <thead className="text-slate-500">
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-4 text-right font-medium">{isArabic ? 'الاسم' : 'Name'}</th>
                  <th className="px-4 py-4 text-right font-medium">{isArabic ? 'المجموعة' : 'Segment'}</th>
                  <th className="px-4 py-4 text-right font-medium">{isArabic ? 'المشرف' : 'Lead'}</th>
                  <th className="px-4 py-4 text-right font-medium">{isArabic ? 'التقدم' : 'Progress'}</th>
                  <th className="px-4 py-4 text-right font-medium">{isArabic ? 'الحضور' : 'Attendance'}</th>
                  <th className="px-4 py-4 text-right font-medium">{isArabic ? 'الحالة' : 'Status'}</th>
                  <th className="px-4 py-4 text-right font-medium">{isArabic ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="px-4 py-4 font-semibold text-slate-900">{row.name}</td>
                    <td className="px-4 py-4 text-slate-600">{row.segment[isArabic ? 'ar' : 'en']}</td>
                    <td className="px-4 py-4 text-slate-600">{row.lead}</td>
                    <td className="px-4 py-4 text-slate-900">{row.progress}</td>
                    <td className="px-4 py-4 text-slate-900">{row.attendance}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${row.statusClassName}`}>
                        {row.status[isArabic ? 'ar' : 'en']}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            showNotice(isArabic ? `تم فتح بطاقة ${row.name}.` : `${row.name} card opened.`)
                          }
                          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                          {isArabic ? 'عرض' : 'View'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            showNotice(
                              isArabic ? `تم إرسال تذكير إلى ${row.name}.` : `Reminder sent to ${row.name}.`,
                            )
                          }
                          className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                        >
                          {isArabic ? 'تذكير' : 'Remind'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="space-y-4">
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-2 text-slate-700">
                <UserRound className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-black text-slate-950">{isArabic ? 'متابعة سريعة' : 'Quick follow-up'}</h3>
                <p className="text-sm text-slate-500">
                  {isArabic ? 'العناصر الأهم لهذا القسم.' : 'Highest-priority items in this section.'}
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {rows
                .filter((row) => row.status.en !== 'Active')
                .slice(0, 3)
                .map((row) => (
                  <article key={row.id} className="rounded-[1.2rem] bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{row.name}</p>
                        <p className="mt-1 text-sm text-slate-500">{row.segment[isArabic ? 'ar' : 'en']}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${row.statusClassName}`}>
                        {row.status[isArabic ? 'ar' : 'en']}
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-slate-400">
                      {isArabic ? 'آخر ظهور' : 'Last seen'}: {row.lastSeen}
                    </p>
                  </article>
                ))}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-black text-slate-950">{isArabic ? 'مؤشر النشاط' : 'Activity pulse'}</h3>
            <div className="mt-4 space-y-3">
              {[
                [isArabic ? 'جلسات اليوم' : 'Today sessions', scope === 'teachers' ? '12' : '28'],
                [isArabic ? 'محدث خلال 24 ساعة' : 'Updated in 24h', `${activeCount}`],
                [isArabic ? 'متوسط الإنجاز' : 'Average completion', `${Math.round(rows.reduce((total, row) => total + Number.parseInt(row.progress, 10), 0) / Math.max(rows.length, 1))}%`],
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
