'use client';

import { useMemo, useState } from 'react';
import { BookOpen, CalendarDays, LayoutGrid, Search, Users } from 'lucide-react';
import { useLocale } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type CatalogScope = 'courses' | 'bundles' | 'teacherCourses' | 'categories';

type CatalogCard = {
  id: string;
  title: { ar: string; en: string };
  subtitle: { ar: string; en: string };
  teacher: string;
  students: number;
  lessons: number;
  fee: string;
  status: { ar: string; en: string };
  statusClassName: string;
};

const catalogMeta: Record<
  CatalogScope,
  {
    hero: { ar: string; en: string };
    helper: { ar: string; en: string };
    createLabel: { ar: string; en: string };
    icon: typeof BookOpen;
  }
> = {
  courses: {
    hero: { ar: 'إدارة المواد والدورات', en: 'Courses workspace' },
    helper: { ar: 'عرض الدورات المنشورة والمسودات بنفس كثافة المرجع.', en: 'Review published and draft courses with reference-like density.' },
    createLabel: { ar: 'دورة جديدة', en: 'New course' },
    icon: BookOpen,
  },
  bundles: {
    hero: { ar: 'الفصول والحزم النشطة', en: 'Bundles workspace' },
    helper: { ar: 'تجميع الفصول، الطاقة الاستيعابية، والمعلم المسؤول.', en: 'Track bundles, capacity, and assigned teachers.' },
    createLabel: { ar: 'فصل جديد', en: 'New bundle' },
    icon: CalendarDays,
  },
  teacherCourses: {
    hero: { ar: 'مسارات المعلم', en: 'Teacher courses' },
    helper: { ar: 'واجهة خاصة بمسارات التدريس الحالية ونشاطها.', en: 'Teacher-facing view of active teaching tracks and load.' },
    createLabel: { ar: 'إسناد مسار', en: 'Assign track' },
    icon: LayoutGrid,
  },
  categories: {
    hero: { ar: 'تصنيفات المحتوى والمراحل', en: 'Categories workspace' },
    helper: { ar: 'إدارة التصنيفات الأكاديمية ومجموعات الفصول والمسارات المرتبطة بها.', en: 'Manage academic categories, bundle groups, and linked tracks.' },
    createLabel: { ar: 'تصنيف جديد', en: 'New category' },
    icon: LayoutGrid,
  },
};

const catalogRowsByScope: Record<CatalogScope, CatalogCard[]> = {
  courses: [
    {
      id: 'course-1',
      title: { ar: 'كورس المعلم الإلكتروني', en: 'Teacher e-course' },
      subtitle: { ar: 'الأول الثانوي', en: 'First secondary' },
      teacher: 'Magda zahran',
      students: 70,
      lessons: 12,
      fee: 'AED 150',
      status: { ar: 'منشور', en: 'Published' },
      statusClassName: 'bg-[#edfdf3] text-[#15803d]',
    },
    {
      id: 'course-2',
      title: { ar: 'تأسيس اللغة الإنجليزية', en: 'English foundation' },
      subtitle: { ar: 'الصف السادس', en: 'Sixth grade' },
      teacher: 'Muzna seth',
      students: 18,
      lessons: 8,
      fee: 'AED 100',
      status: { ar: 'منشور', en: 'Published' },
      statusClassName: 'bg-[#edfdf3] text-[#15803d]',
    },
    {
      id: 'course-3',
      title: { ar: 'مراجعات الرياضيات', en: 'Math revisions' },
      subtitle: { ar: 'الثالث الثانوي', en: 'Third secondary' },
      teacher: 'رحاب رائد فيصل',
      students: 12,
      lessons: 6,
      fee: 'AED 180',
      status: { ar: 'مسودة', en: 'Draft' },
      statusClassName: 'bg-[#eef2ff] text-[#4338ca]',
    },
  ],
  bundles: [
    {
      id: 'bundle-1',
      title: { ar: 'فصل الفيزياء المسائي', en: 'Evening physics bundle' },
      subtitle: { ar: 'المستوى المتقدم', en: 'Advanced level' },
      teacher: 'د. رحمة خليل',
      students: 24,
      lessons: 14,
      fee: 'AED 1650',
      status: { ar: 'نشط', en: 'Active' },
      statusClassName: 'bg-[#edfdf3] text-[#15803d]',
    },
    {
      id: 'bundle-2',
      title: { ar: 'فصل العربية المكثف', en: 'Arabic intensive bundle' },
      subtitle: { ar: 'المرحلة المتوسطة', en: 'Middle stage' },
      teacher: 'لادن ادريس بابكر ادريس',
      students: 16,
      lessons: 10,
      fee: 'AED 750',
      status: { ar: 'قيد التجهيز', en: 'Preparing' },
      statusClassName: 'bg-[#fff7ed] text-[#c2410c]',
    },
    {
      id: 'bundle-3',
      title: { ar: 'فصل المراجعات النهائية', en: 'Final revision bundle' },
      subtitle: { ar: 'اختبارات تجريبية', en: 'Mock exams' },
      teacher: 'Magda zahran',
      students: 30,
      lessons: 5,
      fee: 'AED 950',
      status: { ar: 'نشط', en: 'Active' },
      statusClassName: 'bg-[#edfdf3] text-[#15803d]',
    },
  ],
  teacherCourses: [
    {
      id: 'teacher-1',
      title: { ar: 'مسار فيزياء أول ثانوي', en: 'First secondary physics track' },
      subtitle: { ar: 'مجموعة A', en: 'Group A' },
      teacher: 'Magda zahran',
      students: 22,
      lessons: 12,
      fee: 'AED 150',
      status: { ar: 'نشط', en: 'Active' },
      statusClassName: 'bg-[#edfdf3] text-[#15803d]',
    },
    {
      id: 'teacher-2',
      title: { ar: 'مسار الإنجليزية التأسيسي', en: 'Foundation English track' },
      subtitle: { ar: 'مجموعة B', en: 'Group B' },
      teacher: 'Muzna seth',
      students: 18,
      lessons: 9,
      fee: 'AED 100',
      status: { ar: 'نشط', en: 'Active' },
      statusClassName: 'bg-[#edfdf3] text-[#15803d]',
    },
    {
      id: 'teacher-3',
      title: { ar: 'مسار المراجعات السريعة', en: 'Fast revision track' },
      subtitle: { ar: 'مجموعة C', en: 'Group C' },
      teacher: 'رحاب رائد فيصل',
      students: 10,
      lessons: 4,
      fee: 'AED 180',
      status: { ar: 'قيد المراجعة', en: 'Under review' },
      statusClassName: 'bg-[#eef2ff] text-[#4338ca]',
    },
  ],
  categories: [
    {
      id: 'category-1',
      title: { ar: 'المرحلة الثانوية', en: 'Secondary stage' },
      subtitle: { ar: '12 دورة و4 فصول', en: '12 courses and 4 bundles' },
      teacher: 'فريق الأكاديميات',
      students: 12,
      lessons: 4,
      fee: '8 قواعد',
      status: { ar: 'نشط', en: 'Active' },
      statusClassName: 'bg-[#edfdf3] text-[#15803d]',
    },
    {
      id: 'category-2',
      title: { ar: 'المرحلة الابتدائية', en: 'Primary stage' },
      subtitle: { ar: '6 دورات و3 فصول', en: '6 courses and 3 bundles' },
      teacher: 'فريق التأسيس',
      students: 6,
      lessons: 3,
      fee: '5 قواعد',
      status: { ar: 'مراجعة', en: 'Review' },
      statusClassName: 'bg-[#fff7ed] text-[#c2410c]',
    },
    {
      id: 'category-3',
      title: { ar: 'المراجعات النهائية', en: 'Final revisions' },
      subtitle: { ar: '3 دورات و2 فصل', en: '3 courses and 2 bundles' },
      teacher: 'فريق الامتحانات',
      students: 3,
      lessons: 2,
      fee: '2 قاعدة',
      status: { ar: 'نشط', en: 'Active' },
      statusClassName: 'bg-[#edfdf3] text-[#15803d]',
    },
  ],
};

export default function ReferenceCatalogWorkspace({ scope }: { scope: CatalogScope }) {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const meta = catalogMeta[scope];
  const rows = catalogRowsByScope[scope];
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'live' | 'draft'>('all');
  const [notice, setNotice] = useState<string | null>(null);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesQuery =
        !normalizedQuery ||
        [row.title.ar, row.title.en, row.subtitle.ar, row.subtitle.en, row.teacher]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesFilter =
        filter === 'all' ||
        (filter === 'live' && (row.status.en === 'Published' || row.status.en === 'Active')) ||
        (filter === 'draft' && row.status.en !== 'Published' && row.status.en !== 'Active');

      return matchesQuery && matchesFilter;
    });
  }, [filter, query, rows]);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2500);
  };

  const totalStudents = rows.reduce((total, row) => total + row.students, 0);
  const totalLessons = rows.reduce((total, row) => total + row.lessons, 0);
  const summaryCards =
    scope === 'categories'
      ? [
          [isArabic ? 'إجمالي التصنيفات' : 'Total categories', rows.length, 'bg-[#eef4ff] text-[#2563eb]'],
          [isArabic ? 'الدورات المرتبطة' : 'Linked courses', totalStudents, 'bg-[#edfdf3] text-[#15803d]'],
          [isArabic ? 'الفصول المرتبطة' : 'Linked bundles', totalLessons, 'bg-[#fff7ed] text-[#c2410c]'],
          [isArabic ? 'التصنيفات النشطة' : 'Active categories', rows.filter((row) => row.status.en === 'Published' || row.status.en === 'Active').length, 'bg-[#f5f3ff] text-[#7c3aed]'],
        ]
      : [
          [isArabic ? 'إجمالي المسارات' : 'Total tracks', rows.length, 'bg-[#eef4ff] text-[#2563eb]'],
          [isArabic ? 'الطلاب' : 'Students', totalStudents, 'bg-[#edfdf3] text-[#15803d]'],
          [isArabic ? 'الدروس' : 'Lessons', totalLessons, 'bg-[#fff7ed] text-[#c2410c]'],
          [isArabic ? 'المسارات النشطة' : 'Live tracks', rows.filter((row) => row.status.en === 'Published' || row.status.en === 'Active').length, 'bg-[#f5f3ff] text-[#7c3aed]'],
        ];

  const statLabels =
    scope === 'categories'
      ? {
          first: isArabic ? 'الدورات' : 'Courses',
          second: isArabic ? 'الفصول' : 'Bundles',
          third: isArabic ? 'القواعد' : 'Rules',
        }
      : {
          first: isArabic ? 'الطلاب' : 'Students',
          second: isArabic ? 'الدروس' : 'Lessons',
          third: isArabic ? 'الرسوم' : 'Fee',
        };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(([label, value, tone]) => (
          <article key={String(label)} className={`rounded-[1.75rem] p-5 shadow-sm ${tone}`}>
            <p className="text-sm font-semibold">{label}</p>
            <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-[#eef4ff] p-3 text-[#2563eb]">
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
                onClick={() => showNotice(isArabic ? 'تم تجهيز تقرير العرض.' : 'View report prepared.')}
              >
                {isArabic ? 'عرض التقرير' : 'View report'}
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
                placeholder={isArabic ? 'ابحث بالعنوان أو المعلم' : 'Search by title or teacher'}
                className="h-12 rounded-2xl border-slate-200 bg-white pe-11"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                ['all', isArabic ? 'الكل' : 'All'],
                ['live', isArabic ? 'نشط' : 'Live'],
                ['draft', isArabic ? 'مسودات' : 'Draft'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value as 'all' | 'live' | 'draft')}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    filter === value ? 'bg-slate-950 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            {filteredRows.map((row) => (
              <article key={row.id} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-950">{row.title[isArabic ? 'ar' : 'en']}</h3>
                    <p className="mt-2 text-sm text-slate-500">{row.subtitle[isArabic ? 'ar' : 'en']}</p>
                    <p className="mt-3 text-xs font-semibold text-slate-400">
                      {isArabic ? 'المعلم:' : 'Teacher:'} {row.teacher}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${row.statusClassName}`}>
                    {row.status[isArabic ? 'ar' : 'en']}
                  </span>
                </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-4">
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs text-slate-400">{statLabels.first}</p>
                      <p className="mt-2 font-semibold text-slate-900">{row.students}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs text-slate-400">{statLabels.second}</p>
                      <p className="mt-2 font-semibold text-slate-900">{row.lessons}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs text-slate-400">{statLabels.third}</p>
                      <p className="mt-2 font-semibold text-slate-900">{row.fee}</p>
                    </div>
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs text-slate-400">{isArabic ? 'حالة النشر' : 'Status'}</p>
                    <p className="mt-2 font-semibold text-slate-900">{row.status[isArabic ? 'ar' : 'en']}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full border-slate-300"
                    onClick={() =>
                      showNotice(
                        isArabic ? `تم فتح عرض ${row.title.ar}.` : `${row.title.en} preview opened.`,
                      )
                    }
                  >
                    {isArabic ? 'معاينة' : 'Preview'}
                  </Button>
                  <Button
                    type="button"
                    className="rounded-full bg-slate-950 hover:bg-slate-800"
                    onClick={() =>
                      showNotice(
                        isArabic ? `تم فتح إعدادات ${row.title.ar}.` : `${row.title.en} settings opened.`,
                      )
                    }
                  >
                    {isArabic ? 'الإعدادات' : 'Settings'}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-950">
            {isArabic ? 'ملخص التشغيل' : 'Operations summary'}
          </h2>
          <div className="mt-5 space-y-3">
            {[
              [isArabic ? 'المقاعد المشغولة' : 'Occupied seats', `${totalStudents}`],
              [isArabic ? 'الدروس المجدولة' : 'Scheduled lessons', `${totalLessons}`],
              [isArabic ? 'المعلمين المرتبطين' : 'Assigned teachers', `${new Set(rows.map((row) => row.teacher)).size}`],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-[1.2rem] bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-400">{label}</p>
                <p className="mt-1 text-sm font-black text-slate-900">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[1.4rem] border border-dashed border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Users className="h-4 w-4 text-[#2563eb]" />
              {isArabic ? 'إشارات سريعة' : 'Quick notes'}
            </div>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-500">
              <li>{isArabic ? 'مراجعة الطاقة الاستيعابية قبل فتح تسجيل جديد.' : 'Review capacity before opening new enrollment.'}</li>
              <li>{isArabic ? 'تحقق من المسودات غير المنشورة هذا الأسبوع.' : 'Check unpublished drafts this week.'}</li>
              <li>{isArabic ? 'وازن توزيع المعلمين بين الحزم النشطة.' : 'Balance teacher allocation across active bundles.'}</li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}
