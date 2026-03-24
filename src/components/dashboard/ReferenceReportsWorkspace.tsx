'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';

/* ── Types ───────────────────────────────────────────────── */

type ReportRow = {
  title: string;
  subject: string;
  schedule: string;
  status: { ar: string; en: string };
  teacher: string;
  lessons: number;
  attendance: string;
};

type TeacherRow = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  lessonCount: number;
  courseCount: number;
};

type CourseRow = {
  id: string;
  title: string;
  teacherName: string;
  studentCount: number;
  lessonCount: number;
  isPublished: boolean;
};

type StatsData = {
  users: { total: number; students: number; teachers: number; admins: number };
  courses: { total: number; published: number };
  lessons: { total: number; upcoming: number; completed: number };
  attendance: { rate: number; total: number; present: number; absent: number };
  teacherPerformance: Array<Record<string, unknown>>;
  coursesWithEnrollments: Array<Record<string, unknown>>;
} | null;

function mapApiToReportRow(item: Record<string, unknown>): ReportRow {
  return {
    title: String(item.course_name || item.title || item.name || ''),
    subject: String(item.subject_name || item.subject || ''),
    schedule: String(item.schedule || '-'),
    status: { ar: 'نشط', en: 'Active' },
    teacher: String(item.teacher_name || item.teacher || '-'),
    lessons: Number(item.lesson_count || item.lessons || 0),
    attendance: item.attendance_rate ? `${item.attendance_rate}%` : '-',
  };
}

function mapTeacherPerformance(items: Array<Record<string, unknown>>): TeacherRow[] {
  return items.map((t) => ({
    id: String(t.id || ''),
    name: String(t.name || '—'),
    email: String(t.email || '—'),
    image: t.image ? String(t.image) : null,
    lessonCount: Array.isArray(t.lessons) && t.lessons[0]
      ? Number((t.lessons[0] as Record<string, unknown>).count || 0)
      : Number(t.lessons || 0),
    courseCount: Array.isArray(t.courses) && t.courses[0]
      ? Number((t.courses[0] as Record<string, unknown>).count || 0)
      : Number(t.courses || 0),
  }));
}

function mapCoursesWithEnrollments(
  items: Array<Record<string, unknown>>,
  courseDetails: Array<Record<string, unknown>>,
): CourseRow[] {
  // Build a map from course details (from /api/courses) for richer data
  const detailMap = new Map<string, Record<string, unknown>>();
  for (const c of courseDetails) {
    if (c.id) detailMap.set(String(c.id), c);
  }

  return items.map((c) => {
    const detail = detailMap.get(String(c.id));
    const enrollments = Array.isArray(c.enrollments) && c.enrollments[0]
      ? Number((c.enrollments[0] as Record<string, unknown>).count || 0)
      : Number(c.enrollments || 0);
    const teacher = detail?.teacher as Record<string, unknown> | undefined;
    // lesson count from detail if available
    const lessonCount = detail?.lesson_count != null
      ? Number(detail.lesson_count)
      : (Array.isArray(detail?.lessons) ? (detail?.lessons as unknown[]).length : 0);

    return {
      id: String(c.id || ''),
      title: String(c.title || detail?.title || '—'),
      teacherName: teacher?.name ? String(teacher.name) : String(detail?.teacher_name || '—'),
      studentCount: enrollments,
      lessonCount,
      isPublished: Boolean(c.is_published ?? detail?.is_published),
    };
  });
}

const reportTabs = ['bundle', 'teacher', 'course'] as const;

/* ── Sub-components ──────────────────────────────────────── */

function PreviewButton({
  children,
  onClick,
  tone = 'light',
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone?: 'light' | 'dark' | 'primary';
  disabled?: boolean;
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
      disabled={disabled}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${toneClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
}

function PreviewInput({
  placeholder,
  type = 'text',
  value,
  onChange,
}: {
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#4f7cff]"
    />
  );
}

function SkeletonRows({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />
      ))}
    </div>
  );
}

function EmptyState({ isArabic }: { isArabic: boolean }) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
      {isArabic ? 'لا توجد بيانات متاحة حالياً.' : 'No data available.'}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────── */

export default function ReferenceReportsWorkspace() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [tab, setTab] = useState<(typeof reportTabs)[number]>('bundle');
  const [notice, setNotice] = useState<string | null>(null);
  const [reportRows, setReportRows] = useState<ReportRow[]>([]);
  const [teacherRows, setTeacherRows] = useState<TeacherRow[]>([]);
  const [courseRows, setCourseRows] = useState<CourseRow[]>([]);
  const [stats, setStats] = useState<StatsData>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Filter state
  const [filterBundle, setFilterBundle] = useState('');
  const [filterTeacher, setFilterTeacher] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({ bundle: '', teacher: '', course: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch stats and courses in parallel
      const [statsRes, coursesRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/courses?limit=50'),
      ]);

      const statsData = statsRes.ok ? await statsRes.json() : null;
      const coursesData = coursesRes.ok ? await coursesRes.json() : null;

      if (statsData) {
        setStats(statsData);

        // Bundle tab: report rows from courses data
        const items = Array.isArray(statsData.courses)
          ? statsData.courses
          : Array.isArray(statsData.teacherPerformance)
            ? statsData.teacherPerformance
            : [];
        setReportRows(
          (Array.isArray(items) ? items : []).map((item: Record<string, unknown>) =>
            mapApiToReportRow(item),
          ),
        );

        // Teacher tab
        const teachers = mapTeacherPerformance(statsData.teacherPerformance || []);
        setTeacherRows(teachers);

        // Course tab
        const coursesList = mapCoursesWithEnrollments(
          statsData.coursesWithEnrollments || [],
          coursesData?.courses || [],
        );
        setCourseRows(coursesList);
      } else {
        setReportRows([]);
        setTeacherRows([]);
        setCourseRows([]);
        setStats(null);
      }
    } catch {
      setReportRows([]);
      setTeacherRows([]);
      setCourseRows([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2500);
  };

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
    showNotice(isArabic ? 'جارٍ تحديث البيانات...' : 'Refreshing data...');
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ bundle: filterBundle, teacher: filterTeacher, course: filterCourse });
    showNotice(isArabic ? 'تم تطبيق الفلاتر.' : 'Filters applied.');
  };

  // Filtered data
  const filteredTeachers = teacherRows.filter((t) => {
    if (!appliedFilters.teacher) return true;
    const q = appliedFilters.teacher.toLowerCase();
    return t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q);
  });

  const filteredCourses = courseRows.filter((c) => {
    if (!appliedFilters.course) return true;
    const q = appliedFilters.course.toLowerCase();
    return c.title.toLowerCase().includes(q) || c.teacherName.toLowerCase().includes(q);
  });

  // Stat card values computed from real data
  const bundleStats: [string, string][] = [
    [isArabic ? 'إجمالي المواد' : 'Total courses', stats ? String(stats.courses.total) : '—'],
    [isArabic ? 'المواد المنشورة' : 'Published', stats ? String(stats.courses.published) : '—'],
    [
      isArabic ? 'إجمالي الحصص' : 'Total lessons',
      stats ? String(stats.lessons.total) : '—',
    ],
    [
      isArabic ? 'حصص قادمة' : 'Upcoming lessons',
      stats ? String(stats.lessons.upcoming) : '—',
    ],
    [
      isArabic ? 'نسبة الحضور' : 'Attendance rate',
      stats ? `${stats.attendance.rate}%` : '—',
    ],
  ];

  const teacherStats: [string, string][] = [
    [isArabic ? 'إجمالي المعلمين' : 'Total teachers', stats ? String(stats.users.teachers) : '—'],
    [
      isArabic ? 'إجمالي الحصص' : 'Total lessons',
      stats ? String(stats.lessons.total) : '—',
    ],
    [
      isArabic ? 'حصص مكتملة' : 'Completed lessons',
      stats ? String(stats.lessons.completed) : '—',
    ],
  ];

  const courseStats: [string, string][] = [
    [isArabic ? 'إجمالي المواد' : 'Total courses', stats ? String(stats.courses.total) : '—'],
    [isArabic ? 'المواد المنشورة' : 'Published', stats ? String(stats.courses.published) : '—'],
    [
      isArabic ? 'إجمالي الطلاب' : 'Total students',
      stats ? String(stats.users.students) : '—',
    ],
  ];

  const activeStats =
    tab === 'teacher' ? teacherStats : tab === 'course' ? courseStats : bundleStats;

  return (
    <div className="space-y-6">
      {/* Header + filters */}
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-400">
              {isArabic
                ? 'مؤشرات شاملة للأداء والحضور'
                : 'Comprehensive performance and attendance insights'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <PreviewButton onClick={handleRefresh} disabled={loading}>
              {loading
                ? isArabic
                  ? 'جارٍ التحميل...'
                  : 'Loading...'
                : isArabic
                  ? 'تحديث'
                  : 'Refresh'}
            </PreviewButton>
            <PreviewButton
              tone="dark"
              onClick={() =>
                showNotice(isArabic ? 'تم تجهيز ملف التصدير.' : 'Export prepared.')
              }
            >
              {isArabic ? 'تصدير' : 'Export'}
            </PreviewButton>
          </div>
        </div>

        <div className="mt-6 rounded-[1.5rem] bg-slate-50 p-4">
          <h2 className="text-lg font-black text-slate-950">
            {isArabic ? 'عوامل التصفية' : 'Filters'}
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <PreviewInput
              placeholder={isArabic ? 'الفصل الدراسي' : 'Bundle'}
              value={filterBundle}
              onChange={setFilterBundle}
            />
            <PreviewInput
              placeholder={isArabic ? 'المعلم' : 'Teacher'}
              value={filterTeacher}
              onChange={setFilterTeacher}
            />
            <PreviewInput
              placeholder={isArabic ? 'المادة الدراسية' : 'Course'}
              value={filterCourse}
              onChange={setFilterCourse}
            />
          </div>
          <div className="mt-4">
            <PreviewButton tone="primary" onClick={handleApplyFilters}>
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

      {/* Tabs + content */}
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

        {/* Stat cards (dynamic per tab) */}
        <div className={`grid gap-4 sm:grid-cols-2 ${activeStats.length === 5 ? 'xl:grid-cols-5' : 'xl:grid-cols-3'}`}>
          {activeStats.map(([label, value]) => (
            <article
              key={String(label)}
              className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-slate-400">{label}</p>
              <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
            </article>
          ))}
        </div>

        {/* ── Bundle tab ───────────────────────────────────── */}
        {tab === 'bundle' ? (
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
              {loading ? (
                <SkeletonRows count={3} />
              ) : reportRows.length === 0 ? (
                <EmptyState isArabic={isArabic} />
              ) : null}
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
                      <p className="text-xs text-slate-400">
                        {isArabic ? 'المعلم' : 'Teacher'}
                      </p>
                      <p className="mt-2 font-semibold text-slate-900">{row.teacher}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs text-slate-400">
                        {isArabic ? 'إجمالي الحصص' : 'Total lessons'}
                      </p>
                      <p className="mt-2 font-semibold text-slate-900">{row.lessons}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs text-slate-400">
                        {isArabic ? 'نسبة الحضور' : 'Attendance rate'}
                      </p>
                      <p className="mt-2 font-semibold text-slate-900">{row.attendance}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {/* ── Teacher performance tab ──────────────────────── */}
        {tab === 'teacher' ? (
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-2xl font-black text-slate-950">
              {isArabic ? 'أداء المعلمين' : 'Teacher Performance'}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {isArabic
                ? 'قائمة المعلمين مع عدد المواد والحصص.'
                : 'List of teachers with course and lesson counts.'}
            </p>

            <div className="mt-6">
              {loading ? (
                <SkeletonRows count={4} />
              ) : filteredTeachers.length === 0 ? (
                <EmptyState isArabic={isArabic} />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="px-4 py-3 text-start font-semibold">
                          {isArabic ? 'الاسم' : 'Name'}
                        </th>
                        <th className="px-4 py-3 text-start font-semibold">
                          {isArabic ? 'البريد الإلكتروني' : 'Email'}
                        </th>
                        <th className="px-4 py-3 text-center font-semibold">
                          {isArabic ? 'المواد' : 'Courses'}
                        </th>
                        <th className="px-4 py-3 text-center font-semibold">
                          {isArabic ? 'الحصص' : 'Lessons'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTeachers.map((teacher) => (
                        <tr
                          key={teacher.id}
                          className="border-b border-slate-100 transition hover:bg-slate-50"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {teacher.image ? (
                                <img
                                  src={teacher.image}
                                  alt=""
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4f7cff]/10 text-xs font-bold text-[#4f7cff]">
                                  {teacher.name.charAt(0)}
                                </div>
                              )}
                              <span className="font-medium text-slate-900">{teacher.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-500">{teacher.email}</td>
                          <td className="px-4 py-3 text-center font-semibold text-slate-700">
                            {teacher.courseCount}
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-slate-700">
                            {teacher.lessonCount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        ) : null}

        {/* ── Course analytics tab ─────────────────────────── */}
        {tab === 'course' ? (
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-2xl font-black text-slate-950">
              {isArabic ? 'تحليلات المواد الدراسية' : 'Course Analytics'}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {isArabic
                ? 'نظرة عامة على المواد مع عدد الطلاب المسجلين.'
                : 'Overview of courses with enrollment counts.'}
            </p>

            <div className="mt-6">
              {loading ? (
                <SkeletonRows count={4} />
              ) : filteredCourses.length === 0 ? (
                <EmptyState isArabic={isArabic} />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="px-4 py-3 text-start font-semibold">
                          {isArabic ? 'المادة' : 'Course'}
                        </th>
                        <th className="px-4 py-3 text-start font-semibold">
                          {isArabic ? 'المعلم' : 'Teacher'}
                        </th>
                        <th className="px-4 py-3 text-center font-semibold">
                          {isArabic ? 'الطلاب' : 'Students'}
                        </th>
                        <th className="px-4 py-3 text-center font-semibold">
                          {isArabic ? 'الحالة' : 'Status'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCourses.map((course) => (
                        <tr
                          key={course.id}
                          className="border-b border-slate-100 transition hover:bg-slate-50"
                        >
                          <td className="px-4 py-3 font-medium text-slate-900">{course.title}</td>
                          <td className="px-4 py-3 text-slate-500">{course.teacherName}</td>
                          <td className="px-4 py-3 text-center font-semibold text-slate-700">
                            {course.studentCount}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                                course.isPublished
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {course.isPublished
                                ? isArabic
                                  ? 'منشور'
                                  : 'Published'
                                : isArabic
                                  ? 'مسودة'
                                  : 'Draft'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        ) : null}
      </section>
    </div>
  );
}
