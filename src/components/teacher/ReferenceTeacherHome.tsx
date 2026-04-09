'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  Bell,
  BookOpen,
  CalendarDays,
  TrendingUp,
  Users,
  Video,
} from 'lucide-react';
import { withLocalePrefix } from '@/lib/locale-path';

interface TeacherStats {
  notifications: number;
  expectedLessons: number;
  uniqueStudents: number;
  completedLessons: number;
}

interface Course {
  id: string;
  title: string;
  slug?: string;
  studentsCount?: number;
  lessonsCount?: number;
  thumbnail_url?: string;
}

interface LiveClass {
  id: string;
  title: string;
  startDateTime: string;
  endDateTime: string;
  meetLink?: string;
  course?: { id: string; title: string };
}

interface ReferenceTeacherHomeProps {
  initialStats: {
    totalCourses: number;
    totalSubjects: number;
    upcomingLessonsToday: number;
    totalUpcomingLessons: number;
    pendingGrading: number;
    totalStudents: number;
  };
  initialLessons: any[];
  user: any;
}

function formatDateRange(locale: string): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const dateLocale = locale === 'ar' ? 'ar-SA' : 'en-US';
  const fmt = (d: Date) =>
    d.toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' });
  return `${fmt(start)} - ${fmt(end)}`;
}

export default function ReferenceTeacherHome({
  initialStats,
  initialLessons,
  user,
}: ReferenceTeacherHomeProps) {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const stats: TeacherStats = {
    notifications: 0,
    expectedLessons: initialStats.totalUpcomingLessons,
    uniqueStudents: initialStats.totalStudents,
    completedLessons: initialStats.totalCourses,
  };

  const liveClasses: LiveClass[] = initialLessons
    .filter((l: any) => {
      const start = new Date(l.startDateTime || l.start_date_time);
      const end = new Date(l.endDateTime || l.end_date_time);
      const now = new Date();
      return start <= now && end >= now;
    })
    .map((l: any) => ({
      id: l._id || l.id,
      title: l.title,
      startDateTime: l.startDateTime || l.start_date_time,
      endDateTime: l.endDateTime || l.end_date_time,
      meetLink: l.meetLink || l.meet_link,
      course: l.course,
    }));

  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoadingCourses(false);
      return;
    }
    fetch(`/api/courses?teacherId=${user.id}&limit=6`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setCourses(Array.isArray(data) ? data : data?.courses || []))
      .catch(() => setCourses([]))
      .finally(() => setLoadingCourses(false));
  }, [user?.id]);

  const statCards = [
    {
      label: { ar: 'الإشعارات', en: 'Notifications' },
      value: stats.notifications,
      icon: Bell,
      color: 'from-orange-50 to-orange-100',
      iconBg: 'bg-orange-500',
      textColor: 'text-orange-700',
      valueColor: 'text-orange-900',
      subtitle: { ar: 'رسائل غير مقروءة', en: 'Unread messages' },
    },
    {
      label: { ar: 'الدروس المتوقعة', en: 'Expected Lessons' },
      value: stats.expectedLessons,
      icon: TrendingUp,
      color: 'from-purple-50 to-purple-100',
      iconBg: 'bg-purple-500',
      textColor: 'text-purple-700',
      valueColor: 'text-purple-900',
      subtitle: { ar: 'الدروس المتوقعة', en: 'Expected lessons' },
    },
    {
      label: { ar: 'الطلاب', en: 'Students' },
      value: stats.uniqueStudents,
      icon: Users,
      color: 'from-green-50 to-green-100',
      iconBg: 'bg-green-500',
      textColor: 'text-green-700',
      valueColor: 'text-green-900',
      subtitle: { ar: 'طلاب مسجلين', en: 'Unique students' },
    },
    {
      label: { ar: 'الدروس', en: 'Lessons' },
      value: stats.completedLessons,
      icon: BookOpen,
      color: 'from-blue-50 to-blue-100',
      iconBg: 'bg-blue-500',
      textColor: 'text-blue-700',
      valueColor: 'text-blue-900',
      subtitle: { ar: 'الدروس المكتملة', en: 'Completed lessons' },
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header with notification bell and user greeting */}
      <div className="flex items-center justify-between">
        <button className="relative rounded-full border border-slate-200 bg-white p-3 text-slate-500 shadow-sm hover:bg-slate-50 transition">
          <Bell className="h-5 w-5" />
        </button>
        <div className="text-right">
          <p className="text-lg font-semibold text-slate-950">{user?.name || (isArabic ? 'المعلم' : 'Teacher')}</p>
        </div>
      </div>

      {/* Date range bar */}
      <div className="flex justify-end">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
          <CalendarDays className="h-4 w-4" />
          <span>{formatDateRange(locale)}</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <div
            key={i}
            className={`rounded-2xl bg-gradient-to-br ${card.color} border-0 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md`}
          >
            <div className="flex items-center justify-between p-5 pb-2">
              <h3 className={`text-sm font-medium ${card.textColor}`}>
                {card.label[isArabic ? 'ar' : 'en']}
              </h3>
              <div className={`rounded-lg p-2 ${card.iconBg}`}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="px-5 pb-5">
              <p className={`text-4xl font-bold ${card.valueColor}`}>{card.value}</p>
              <p className={`mt-2 flex items-center gap-1 text-xs ${card.textColor}`}>
                <TrendingUp className="h-3.5 w-3.5" />
                {card.subtitle[isArabic ? 'ar' : 'en']}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Subjects / Courses section */}
      <div>
        <h2 className="mb-4 text-center text-2xl font-black text-slate-950">
          {isArabic ? 'المواد الدراسية' : 'Subjects'}
        </h2>

        {loadingCourses ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 6).map((course) => (
              <Link
                key={course.id}
                href={withLocalePrefix(`/teacher/courses/${course.id}`, locale)}
                className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-slate-200 hover:shadow-md"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-slate-900 line-clamp-1">{course.title}</h3>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  {course.studentsCount !== undefined && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {course.studentsCount} {isArabic ? 'طالب' : 'students'}
                    </span>
                  )}
                  {course.lessonsCount !== undefined && (
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {course.lessonsCount} {isArabic ? 'درس' : 'lessons'}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex justify-center">
            <Link
              href={withLocalePrefix('/teacher/courses', locale)}
              className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              {isArabic ? 'عرض جميع المواد الدراسية' : 'View all subjects'}
            </Link>
          </div>
        )}
      </div>

      {/* Live Classes section */}
      <div>
        <h2 className="mb-1 text-center text-2xl font-black text-slate-950">
          {isArabic ? 'الفصول المباشرة' : 'Live Classes'}
        </h2>
        <p className="mb-4 text-center text-sm text-slate-500">
          {isArabic ? 'جدولة والانضمام إلى الفصول المباشرة' : 'Schedule and join live classes'}
        </p>

        {liveClasses.length > 0 ? (
          <div className="space-y-3">
            {liveClasses.map((lc) => (
              <div
                key={lc.id}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                    <Video className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{lc.title}</h3>
                    <p className="text-xs text-slate-500">{lc.course?.title}</p>
                  </div>
                </div>
                {lc.meetLink && (
                  <a
                    href={lc.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-red-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-600"
                  >
                    {isArabic ? 'انضم' : 'Join'}
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-100 bg-white px-6 py-10 text-center shadow-sm">
            <p className="text-sm text-slate-400">
              {isArabic ? 'لم يتم العثور على فصول' : 'No classes found'}
            </p>
          </div>
        )}
      </div>

      {/* Classes / Bundles section */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-black text-slate-950">
              <BookOpen className="h-5 w-5" />
              {isArabic ? 'الفصول' : 'Classes'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isArabic ? 'الفصول التي تشرف عليها' : 'Classes you supervise'}
            </p>
          </div>
          <Link
            href={withLocalePrefix('/teacher/grades', locale)}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {isArabic ? 'عرض الكل' : 'View All'}
          </Link>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {courses.slice(0, 4).map((course) => (
              <Link
                key={course.id}
                href={withLocalePrefix(`/teacher/courses/${course.id}`, locale)}
                className="rounded-xl border border-slate-100 p-4 transition hover:border-slate-200 hover:shadow-sm"
              >
                <h3 className="font-semibold text-slate-900">{course.title}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {course.studentsCount || 0} {isArabic ? 'طالب' : 'students'}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-slate-200" />
            <p className="mt-3 font-medium text-slate-500">
              {isArabic ? 'لا يوجد فصول' : 'No classes found'}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {isArabic ? 'لا توجد اي فصول في ملفك' : 'No classes in your profile'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

