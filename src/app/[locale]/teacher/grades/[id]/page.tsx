import { getServerSession } from 'next-auth';
import { authOptions, isTeacherOrAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { notFound, redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';
import Link from 'next/link';
import { ArrowLeft, BookOpen, CalendarDays, CreditCard, Info, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { ClassStudentsTab } from '@/components/teacher/ClassStudentsTab';

type GradeTab = 'courses' | 'students' | 'settings';

const TABS: GradeTab[] = ['courses', 'students', 'settings'];

function normalizeTab(tab?: string): GradeTab {
  if (tab && TABS.includes(tab as GradeTab)) {
    return tab as GradeTab;
  }
  return 'courses';
}

export default async function TeacherGradeDetailPage({
  params: { locale, id },
  searchParams,
}: {
  params: { locale: string; id: string };
  searchParams?: { tab?: string | string[] };
}) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!session || !isTeacherOrAdmin(user?.role)) {
    redirect(withLocalePrefix('/', locale));
  }

  const tabParam = Array.isArray(searchParams?.tab) ? searchParams?.tab[0] : searchParams?.tab;
  const activeTab = normalizeTab(tabParam);

  let grade;
  if (process.env.TEST_BYPASS === 'true') {
    const { getMockDb } = await import('@/lib/mockDb');
    const db = getMockDb();
    grade = (db.grades || []).find((g: any) => g.id === id || g.slug === id);
    if (!grade) notFound();
  } else {
    const { data, error: gradeError } = await supabaseAdmin
      .from('grades')
      .select('id, name, name_en, description, slug, sort_order, is_active')
      .eq('id', id)
      .single();

    if (gradeError || !data) {
      notFound();
    }
    grade = data;
  }

  let courses: any[] = [];
  let courseIds: any[] = [];

  if (process.env.TEST_BYPASS === 'true') {
    const { getMockDb } = await import('@/lib/mockDb');
    const db = getMockDb();
    courses = (db.courses || []).filter((c: any) => c.grade_id === id);
    if (user.role === 'teacher') courses = courses.filter((c: any) => c.teacher_id === user.id);
    courseIds = courses.map(c => c.id);
  } else {
    let coursesQuery = supabaseAdmin
      .from('courses')
      .select(`
        id,
        title,
        description,
        price,
        is_published,
        teacher_id,
        subject:subjects(id, title),
        enrollments:enrollments(count)
      `)
      .eq('grade_id', id)
      .order('created_at', { ascending: false });

    if (user.role === 'teacher') {
      coursesQuery = coursesQuery.eq('teacher_id', user.id);
    }

    const { data: coursesData } = await coursesQuery;
    courses = coursesData || [];
    courseIds = courses.map((course: any) => course.id);
  }

  let lessons: any[] = [];
  let students: Array<{ id: string; name: string; email: string; courses: number }> = [];
  let feesSummary = {
    totalCourseFees: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
  };

  if (process.env.TEST_BYPASS === 'true') {
    const { getMockDb } = await import('@/lib/mockDb');
    const db = getMockDb();
    lessons = (db.lessons || []).filter((l: any) => courseIds.includes(l.course_id));

    const enrollments = (db.enrollments || []).filter((e: any) => courseIds.includes(e.course_id));
    const studentMap = new Map();
    enrollments.forEach((e: any) => {
      if (!studentMap.has(e.student_id)) {
        studentMap.set(e.student_id, {
          id: e.student_id,
          name: 'Test Student',
          email: 'student@eduverse.com',
          courses: new Set()
        });
      }
      studentMap.get(e.student_id).courses.add(e.course_id);
    });
    students = Array.from(studentMap.values()).map((s: any) => ({ ...s, courses: s.courses.size }));

    feesSummary = {
      totalCourseFees: courses.reduce((sum: number, course: any) => sum + (course.price || 0), 0),
      paidInvoices: 0,
      pendingInvoices: 0,
    };
  } else {
    const [lessonsRes, enrollmentsRes, invoiceRes] = await Promise.all([
      supabaseAdmin
        .from('lessons')
        .select(`
            id,
            title,
            status,
            start_date_time,
            end_date_time,
            course_id,
            course:courses(id, title)
          `)
        .in('course_id', courseIds)
        .order('start_date_time', { ascending: true })
        .limit(40),
      supabaseAdmin
        .from('enrollments')
        .select(`
            student_id,
            course_id,
            student:users!enrollments_student_id_fkey(id, name, email)
          `)
        .in('course_id', courseIds)
        .eq('status', 'active'),
      supabaseAdmin
        .from('invoice_items')
        .select(`
            id,
            total,
            invoice:invoice_id(status)
          `)
        .in('course_id', courseIds),
    ]);

    lessons = lessonsRes.data || [];

    const studentMap = new Map<string, { id: string; name: string; email: string; courses: Set<string> }>();
    (enrollmentsRes.data || []).forEach((enrollment: any) => {
      const student = enrollment.student;
      if (!student?.id) return;
      if (!studentMap.has(student.id)) {
        studentMap.set(student.id, {
          id: student.id,
          name: student.name || 'Unknown Student',
          email: student.email || 'N/A',
          courses: new Set<string>(),
        });
      }
      studentMap.get(student.id)?.courses.add(enrollment.course_id);
    });

    students = Array.from(studentMap.values()).map((student) => ({
      id: student.id,
      name: student.name,
      email: student.email,
      courses: student.courses.size,
    }));

    const invoiceItems = invoiceRes.data || [];
    feesSummary = {
      totalCourseFees: courses.reduce((sum: number, course: any) => sum + (course.price || 0), 0),
      paidInvoices: invoiceItems.filter((item: any) => item.invoice?.status === 'paid').length,
      pendingInvoices: invoiceItems.filter((item: any) => item.invoice?.status !== 'paid').length,
    };
  }

  const tabHref = (tab: GradeTab) =>
    withLocalePrefix(`/teacher/grades/${id}${tab === 'courses' ? '' : `?tab=${tab}`}`, locale);

  return (
    <div className="space-y-6">
      <Link
        href={withLocalePrefix('/teacher/grades', locale)}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Classes
      </Link>

      <div className="border border-gray-100 rounded-2xl bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{grade.name}</h1>
            {grade.name_en && <p className="text-sm text-gray-500 mt-1">{grade.name_en}</p>}
            {grade.description && <p className="text-sm text-gray-600 mt-3 max-w-2xl">{grade.description}</p>}
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${grade.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
              }`}
          >
            {grade.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-gray-500">
          <span>Slug: {grade.slug}</span>
          <span>Sort: {grade.sort_order}</span>
          <span>{courses.length} courses</span>
          <span>{students.length} students</span>
        </div>
      </div>

      <div className="border-b border-gray-200 bg-white rounded-t-2xl px-4">
        <div className="flex gap-2 -mb-px overflow-x-auto">
          <TabLink href={tabHref('courses')} active={activeTab === 'courses'} icon={<BookOpen className="h-4 w-4" />}>
            Courses
          </TabLink>
          <TabLink href={tabHref('students')} active={activeTab === 'students'} icon={<Users className="h-4 w-4" />}>
            Students
          </TabLink>
          <TabLink href={tabHref('settings')} active={activeTab === 'settings'} icon={<Info className="h-4 w-4" />}>
            Settings
          </TabLink>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-b-2xl rounded-tr-2xl p-6">
        {activeTab === 'settings' && (
          <div className="grid sm:grid-cols-2 gap-4">
            <InfoCard label="Grade Name" value={grade.name} />
            <InfoCard label="English Name" value={grade.name_en || '-'} />
            <InfoCard label="Slug" value={grade.slug} />
            <InfoCard label="Status" value={grade.is_active ? 'Active' : 'Inactive'} />
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Courses in this Class</h2>
              <Link
                href={withLocalePrefix(`/teacher/courses/new?gradeId=${id}`, locale)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Create Course
              </Link>
            </div>

            {courses.length === 0 ? (
              <p className="text-sm text-gray-500">No courses found for this class yet.</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course: any) => (
                  <Link
                    key={course.id}
                    href={withLocalePrefix(`/teacher/courses/${course.id}`, locale)}
                    className="block rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-blue-200 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-gray-900">{course.title}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${course.is_published ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                          }`}
                      >
                        {course.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    {course.description && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{course.description}</p>}
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-3">
                      <span>{course.enrollments?.[0]?.count || 0} students</span>
                      {course.subject?.title && <span>• {course.subject.title}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Lessons</h2>
            {lessons.length === 0 ? (
              <p className="text-sm text-gray-500">No lessons scheduled in this grade.</p>
            ) : (
              <div className="space-y-2">
                {lessons.map((lesson: any) => (
                  <Link
                    key={lesson.id}
                    href={withLocalePrefix(`/teacher/courses/${lesson.course_id}/lessons/${lesson.id}`, locale)}
                    className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 hover:border-blue-200 hover:bg-blue-50/20 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{lesson.title}</p>
                      <p className="text-xs text-gray-500">{lesson.course?.title || 'Course'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">
                        {lesson.start_date_time
                          ? new Date(lesson.start_date_time).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                          : '-'}
                      </p>
                      <p className="text-[11px] text-gray-500 capitalize">{lesson.status || 'scheduled'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'fees' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Fees Overview</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <InfoCard label="Total Course Fees" value={`$${feesSummary.totalCourseFees.toFixed(2)}`} />
              <InfoCard label="Paid Invoice Items" value={String(feesSummary.paidInvoices)} />
              <InfoCard label="Pending Invoice Items" value={String(feesSummary.pendingInvoices)} />
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <ClassStudentsTab
            students={students}
            courses={courses.map((c: any) => ({ id: c.id, title: c.title }))}
            gradeId={id}
          />
        )}
      </div>
    </div>
  );
}

function TabLink({
  href,
  active,
  icon,
  children,
}: {
  href: string;
  active: boolean;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${active
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
    >
      {icon}
      {children}
    </Link>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  );
}
