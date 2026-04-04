'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';
import { ArrowLeft, BookOpen, CalendarDays, ClipboardList, CreditCard, Download, FileText, Info, Search, Users } from 'lucide-react';

type GradeTab = 'info' | 'courses' | 'lessons' | 'assessments' | 'schedule' | 'students' | 'fees';

interface TeacherGradeDetailClientProps {
  locale: string;
  gradeRef: string;
  initialTab: GradeTab;
  userRole: string;
}

interface GradeRecord {
  id: string;
  name: string;
  name_en?: string | null;
  slug?: string | null;
  description?: string | null;
  supervisor_id?: string | null;
  supervisor?: { id: string; name: string; email: string } | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface CourseRow {
  id: string;
  title: string;
  is_published: boolean;
  teacher_name: string;
  teacher_id: string | null;
  students_count: number;
  next_session_time: string | null;
}

interface StudentRow {
  id: string;
  name: string;
  email: string;
  enrollment_status: string;
  payment_status: 'paid' | 'partial' | 'unpaid';
}

interface FeeRow {
  id: string;
  item_name: string;
  amount: number;
  due_date: string;
  status: 'paid' | 'partial' | 'unpaid';
  student_name?: string | null;
}

interface UserOption {
  id: string;
  name: string;
  email: string;
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timeout);
  }, [value, delayMs]);
  return debounced;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, credentials: 'same-origin' });
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error(payload?.error || `Request failed (${response.status})`);
  }

  return payload as T;
}

export default function TeacherGradeDetailClient({
  locale,
  gradeRef,
  initialTab,
  userRole,
}: TeacherGradeDetailClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isArabic = locale === 'ar';
  const [activeTab, setActiveTab] = useState<GradeTab>(initialTab);
  const [grade, setGrade] = useState<GradeRecord | null>(null);
  const [supervisors, setSupervisors] = useState<UserOption[]>([]);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({
    name: '',
    slug: '',
    description: '',
    supervisor_id: '',
  });

  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [coursesMeta, setCoursesMeta] = useState<PaginationMeta | null>(null);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const [coursePage, setCoursePage] = useState(1);
  const [courseSearch, setCourseSearch] = useState('');
  const [courseStatus, setCourseStatus] = useState<'all' | 'published' | 'draft'>('all');

  const [students, setStudents] = useState<StudentRow[]>([]);
  const [studentsMeta, setStudentsMeta] = useState<PaginationMeta | null>(null);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [studentPage, setStudentPage] = useState(1);
  const [studentSearch, setStudentSearch] = useState('');
  const [enrollEmail, setEnrollEmail] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [enrollBusy, setEnrollBusy] = useState(false);

  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [scheduleEvents, setScheduleEvents] = useState<any[]>([]);

  const [feesLoading, setFeesLoading] = useState(false);
  const [feesError, setFeesError] = useState<string | null>(null);
  const [feesRows, setFeesRows] = useState<FeeRow[]>([]);
  const [feesSummary, setFeesSummary] = useState<{
    expected_total: number;
    collected_total: number;
    outstanding_total: number;
  } | null>(null);
  const [feeName, setFeeName] = useState('');
  const [feeAmount, setFeeAmount] = useState('');
  const [feeDueDate, setFeeDueDate] = useState('');
  const [feeBusy, setFeeBusy] = useState(false);

  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [lessonsError, setLessonsError] = useState<string | null>(null);
  const [lessons, setLessons] = useState<any[]>([]);

  const [assessmentsLoading, setAssessmentsLoading] = useState(false);
  const [assessmentsError, setAssessmentsError] = useState<string | null>(null);
  const [assessments, setAssessments] = useState<any[]>([]);

  const debouncedCourseSearch = useDebouncedValue(courseSearch, 300);
  const debouncedStudentSearch = useDebouncedValue(studentSearch, 300);

  const tabItems: Array<{ id: GradeTab; label: string; icon: JSX.Element }> = useMemo(
    () => [
      { id: 'info', label: isArabic ? 'المعلومات' : 'Info', icon: <Info className="h-4 w-4" /> },
      { id: 'courses', label: isArabic ? 'المواد الدراسية' : 'Courses', icon: <BookOpen className="h-4 w-4" /> },
      { id: 'lessons', label: isArabic ? 'الدروس' : 'Lessons', icon: <FileText className="h-4 w-4" /> },
      { id: 'assessments', label: isArabic ? 'التقييمات' : 'Assessments', icon: <ClipboardList className="h-4 w-4" /> },
      { id: 'fees', label: isArabic ? 'الرسوم' : 'Fees', icon: <CreditCard className="h-4 w-4" /> },
      { id: 'students', label: isArabic ? 'الطلاب' : 'Students', icon: <Users className="h-4 w-4" /> },
      { id: 'schedule', label: isArabic ? 'الجدول' : 'Schedule', icon: <CalendarDays className="h-4 w-4" /> },
    ],
    [isArabic]
  );

  const syncTabInUrl = useCallback(
    (tab: GradeTab) => {
      const params = new URLSearchParams(window.location.search);
      if (tab === 'info') {
        params.delete('tab');
      } else {
        params.set('tab', tab);
      }
      const next = params.toString();
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  const loadGradeInfo = useCallback(async () => {
    setLoadingInfo(true);
    setPageError(null);
    try {
      const payload = await fetchJson<{ grade: GradeRecord }>(`/api/grades/${gradeRef}`);
      setGrade(payload.grade);
      setInfoForm({
        name: payload.grade.name || '',
        slug: payload.grade.slug || '',
        description: payload.grade.description || '',
        supervisor_id: payload.grade.supervisor_id || '',
      });

      if (userRole === 'admin' || userRole === 'supervisor') {
        const usersPayload = await fetchJson<{ users: UserOption[] }>('/api/users?role=teacher&limit=100');
        setSupervisors(usersPayload.users || []);
      } else if (payload.grade.supervisor) {
        setSupervisors([payload.grade.supervisor]);
      } else {
        setSupervisors([]);
      }
    } catch (error: any) {
      setPageError(error.message || 'Failed to load grade');
    } finally {
      setLoadingInfo(false);
    }
  }, [gradeRef, userRole]);

  const loadCourses = useCallback(async () => {
    setCoursesLoading(true);
    setCoursesError(null);
    try {
      const params = new URLSearchParams({
        page: String(coursePage),
        limit: '20',
      });
      if (debouncedCourseSearch) params.set('search', debouncedCourseSearch);
      if (courseStatus !== 'all') params.set('status', courseStatus);

      const payload = await fetchJson<{ courses: CourseRow[]; meta: PaginationMeta }>(
        `/api/grades/${gradeRef}/courses?${params.toString()}`
      );
      setCourses(payload.courses || []);
      setCoursesMeta(payload.meta);
      if (!selectedCourseId && payload.courses?.length) {
        setSelectedCourseId(payload.courses[0].id);
      }
    } catch (error: any) {
      setCoursesError(error.message || 'Failed to load courses');
    } finally {
      setCoursesLoading(false);
    }
  }, [coursePage, courseStatus, debouncedCourseSearch, gradeRef, selectedCourseId]);

  const loadStudents = useCallback(async () => {
    setStudentsLoading(true);
    setStudentsError(null);
    try {
      const params = new URLSearchParams({
        page: String(studentPage),
        limit: '20',
      });
      if (debouncedStudentSearch) params.set('search', debouncedStudentSearch);

      const payload = await fetchJson<{ students: StudentRow[]; meta: PaginationMeta }>(
        `/api/grades/${gradeRef}/students?${params.toString()}`
      );
      setStudents(payload.students || []);
      setStudentsMeta(payload.meta);
    } catch (error: any) {
      setStudentsError(isArabic ? 'فشل في تحميل الطلاب' : (error.message || 'Failed to load students'));
    } finally {
      setStudentsLoading(false);
    }
  }, [gradeRef, studentPage, debouncedStudentSearch]);

  const loadSchedule = useCallback(async () => {
    setScheduleLoading(true);
    setScheduleError(null);
    try {
      const payload = await fetchJson<{ events: any[] }>(`/api/grades/${gradeRef}/schedule`);
      setScheduleEvents(payload.events || []);
    } catch (error: any) {
      setScheduleError(error.message || 'Failed to load schedule');
    } finally {
      setScheduleLoading(false);
    }
  }, [gradeRef]);

  const loadFees = useCallback(async () => {
    setFeesLoading(true);
    setFeesError(null);
    try {
      const payload = await fetchJson<{
        feeItems: FeeRow[];
        summary: { expected_total: number; collected_total: number; outstanding_total: number };
      }>(`/api/grades/${gradeRef}/fees`);
      setFeesRows(payload.feeItems || []);
      setFeesSummary(payload.summary || null);
    } catch (error: any) {
      setFeesError(error.message || 'Failed to load fees');
    } finally {
      setFeesLoading(false);
    }
  }, [gradeRef]);

  const loadLessons = useCallback(async () => {
    setLessonsLoading(true);
    setLessonsError(null);
    try {
      const data = await fetchJson<{ lessons: any[] }>(`/api/grades/${gradeRef}/lessons`);
      setLessons(data.lessons || []);
    } catch (err: any) {
      setLessonsError(err.message);
    } finally {
      setLessonsLoading(false);
    }
  }, [gradeRef]);

  const loadAssessments = useCallback(async () => {
    setAssessmentsLoading(true);
    setAssessmentsError(null);
    try {
      const data = await fetchJson<{ assessments: any[] }>(`/api/grades/${gradeRef}/assessments`);
      setAssessments(data.assessments || []);
    } catch (err: any) {
      setAssessmentsError(err.message);
    } finally {
      setAssessmentsLoading(false);
    }
  }, [gradeRef]);

  useEffect(() => {
    void loadGradeInfo();
  }, [loadGradeInfo]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (activeTab === 'courses') void loadCourses();
    if (activeTab === 'lessons') void loadLessons();
    if (activeTab === 'assessments') void loadAssessments();
    if (activeTab === 'students') void loadStudents();
    if (activeTab === 'schedule') void loadSchedule();
    if (activeTab === 'fees') void loadFees();
  }, [activeTab, loadCourses, loadLessons, loadAssessments, loadStudents, loadSchedule, loadFees]);

  useEffect(() => {
    if (activeTab === 'students' && courses.length === 0) {
      void loadCourses();
    }
  }, [activeTab, courses.length, loadCourses]);

  useEffect(() => {
    if (activeTab === 'courses') void loadCourses();
  }, [coursePage, courseStatus, debouncedCourseSearch, activeTab, loadCourses]);

  useEffect(() => {
    if (activeTab === 'students') void loadStudents();
  }, [studentPage, debouncedStudentSearch, activeTab, loadStudents]);

  const openTab = (tab: GradeTab) => {
    setActiveTab(tab);
    syncTabInUrl(tab);
  };

  const saveInfo = async () => {
    if (!grade) return;
    if (!infoForm.name.trim()) {
      setPageError('Grade name is required.');
      return;
    }
    if (!infoForm.supervisor_id) {
      setPageError('Supervisor is required.');
      return;
    }

    setPageError(null);
    try {
      const payload = await fetchJson<{ grade: GradeRecord }>(`/api/grades/${grade.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: infoForm.name.trim(),
          slug: infoForm.slug.trim() || undefined,
          description: infoForm.description.trim() || null,
          supervisor_id: infoForm.supervisor_id,
        }),
      });
      setGrade(payload.grade);
      setIsEditingInfo(false);
    } catch (error: any) {
      setPageError(error.message || 'Failed to save grade changes.');
    }
  };

  const exportStudentsCsv = () => {
    const params = new URLSearchParams({ export: 'csv' });
    if (debouncedStudentSearch) params.set('search', debouncedStudentSearch);
    window.open(`/api/grades/${gradeRef}/students?${params.toString()}`, '_blank');
  };

  const enrollStudent = async () => {
    if (!enrollEmail || !selectedCourseId) return;
    setEnrollBusy(true);
    setStudentsError(null);
    try {
      await fetchJson('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: selectedCourseId,
          student_email: enrollEmail.trim(),
        }),
      });
      setEnrollEmail('');
      await loadStudents();
    } catch (error: any) {
      setStudentsError(isArabic ? 'فشل في تسجيل الطالب' : (error.message || 'Failed to enroll student.'));
    } finally {
      setEnrollBusy(false);
    }
  };

  const addFeeItem = async () => {
    const amount = Number(feeAmount);
    if (!feeName.trim() || !feeDueDate || !Number.isFinite(amount) || amount <= 0) {
      setFeesError('Fee name, due date, and amount > 0 are required.');
      return;
    }
    setFeeBusy(true);
    setFeesError(null);
    try {
      await fetchJson(`/api/grades/${gradeRef}/fees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_name: feeName.trim(),
          amount,
          due_date: feeDueDate,
        }),
      });
      setFeeName('');
      setFeeAmount('');
      setFeeDueDate('');
      await loadFees();
    } catch (error: any) {
      setFeesError(error.message || 'Failed to add fee item.');
    } finally {
      setFeeBusy(false);
    }
  };

  if (loadingInfo) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-7 w-48 rounded bg-gray-100" />
        <div className="h-40 rounded-2xl bg-gray-50" />
        <div className="h-56 rounded-2xl bg-gray-50" />
      </div>
    );
  }

  if (pageError && !grade) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-red-700">
        {pageError}
      </div>
    );
  }

  if (!grade) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Link
        href={withLocalePrefix('/teacher/grades', locale)}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        {isArabic ? 'العودة إلى الفصول' : 'Back to Classes'}
      </Link>

      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <h1 className="text-2xl font-bold text-gray-900">{grade.name}</h1>
        {grade.description ? <p className="mt-2 text-sm text-gray-600">{grade.description}</p> : null}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
          <span>{isArabic ? 'الرمز' : 'Code'}: {grade.slug || '-'}</span>
          <span>{isArabic ? 'المشرف' : 'Supervisor'}: {grade.supervisor?.name || (isArabic ? 'غير معين' : 'Unassigned')}</span>
          <span>{isArabic ? 'الحالة' : 'Status'}: {grade.is_active ? (isArabic ? 'نشط' : 'Active') : (isArabic ? 'مؤرشف' : 'Archived')}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white">
        <div className="overflow-x-auto border-b border-gray-100 px-2">
          <div className="flex min-w-max gap-1 py-2">
            {tabItems.map((tab) => (
              <button
                key={tab.id}
                onClick={() => openTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                type="button"
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {pageError ? (
            <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
              {pageError}
            </div>
          ) : null}

          {activeTab === 'info' ? (
            <div className="space-y-4">
              {isEditingInfo ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm font-medium text-gray-700">
                    {isArabic ? 'اسم الفصل *' : 'Grade Name *'}
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                      value={infoForm.name}
                      onChange={(event) => setInfoForm((prev) => ({ ...prev, name: event.target.value }))}
                    />
                  </label>
                  <label className="text-sm font-medium text-gray-700">
                    {isArabic ? 'رمز الفصل' : 'Grade Code'}
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                      value={infoForm.slug}
                      onChange={(event) => setInfoForm((prev) => ({ ...prev, slug: event.target.value }))}
                    />
                  </label>
                  <label className="text-sm font-medium text-gray-700 md:col-span-2">
                    {isArabic ? 'المشرف *' : 'Supervisor *'}
                    <select
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                      value={infoForm.supervisor_id}
                      onChange={(event) => setInfoForm((prev) => ({ ...prev, supervisor_id: event.target.value }))}
                    >
                      <option value="">{isArabic ? 'اختر المشرف' : 'Select supervisor'}</option>
                      {supervisors.map((supervisor) => (
                        <option key={supervisor.id} value={supervisor.id}>
                          {supervisor.name} ({supervisor.email})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-medium text-gray-700 md:col-span-2">
                    {isArabic ? 'الوصف' : 'Description'}
                    <textarea
                      rows={4}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                      value={infoForm.description}
                      onChange={(event) => setInfoForm((prev) => ({ ...prev, description: event.target.value }))}
                    />
                  </label>
                  <div className="flex gap-2 md:col-span-2">
                    <button className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm text-white" type="button" onClick={saveInfo}>
                      {isArabic ? 'حفظ' : 'Save'}
                    </button>
                    <button
                      className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700"
                      type="button"
                      onClick={() => setIsEditingInfo(false)}
                    >
                      {isArabic ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoCard label={isArabic ? 'اسم الفصل' : 'Grade name'} value={grade.name} />
                  <InfoCard label={isArabic ? 'رمز الفصل' : 'Grade code'} value={grade.slug || '-'} />
                  <InfoCard label={isArabic ? 'المشرف' : 'Supervisor'} value={grade.supervisor?.name || (isArabic ? 'غير معين' : 'Unassigned')} />
                  <InfoCard label={isArabic ? 'الحالة' : 'Status'} value={grade.is_active ? (isArabic ? 'نشط' : 'Active') : (isArabic ? 'مؤرشف' : 'Archived')} />
                  <InfoCard label={isArabic ? 'تاريخ الإنشاء' : 'Created'} value={grade.created_at ? new Date(grade.created_at).toLocaleString() : '-'} />
                  <InfoCard label={isArabic ? 'تاريخ التحديث' : 'Updated'} value={grade.updated_at ? new Date(grade.updated_at).toLocaleString() : '-'} />
                  <div className="md:col-span-2">
                    <button
                      className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white"
                      type="button"
                      onClick={() => setIsEditingInfo(true)}
                    >
                      {isArabic ? 'تعديل الفصل' : 'Edit grade'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {activeTab === 'courses' ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute start-2 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      value={courseSearch}
                      onChange={(event) => {
                        setCoursePage(1);
                        setCourseSearch(event.target.value);
                      }}
                      className="w-64 rounded-lg border border-gray-200 py-2 ps-8 pe-3 text-sm"
                      placeholder={isArabic ? "بحث المواد الدراسية" : "Search courses"}
                    />
                  </div>
                  <select
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    value={courseStatus}
                    onChange={(event) => {
                      setCoursePage(1);
                      setCourseStatus(event.target.value as 'all' | 'published' | 'draft');
                    }}
                  >
                    <option value="all">{isArabic ? 'جميع الحالات' : 'All statuses'}</option>
                    <option value="published">{isArabic ? 'منشور' : 'Published'}</option>
                    <option value="draft">{isArabic ? 'مسودة' : 'Draft'}</option>
                  </select>
                </div>
                <Link
                  href={withLocalePrefix(`/teacher/courses/new?gradeId=${grade.id}`, locale)}
                  className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm text-white"
                >
                  {isArabic ? 'إنشاء مادة دراسية' : 'Create course'}
                </Link>
              </div>

              {coursesLoading ? <TabSkeleton /> : null}
              {coursesError ? <InlineError message={coursesError} /> : null}

              {!coursesLoading && !coursesError ? (
                <>
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="min-w-full divide-y divide-gray-100 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-start font-semibold text-gray-600">{isArabic ? 'المادة' : 'Course'}</th>
                          <th className="px-4 py-3 text-start font-semibold text-gray-600">{isArabic ? 'المعلم' : 'Teacher'}</th>
                          <th className="px-4 py-3 text-start font-semibold text-gray-600">{isArabic ? 'الحالة' : 'Status'}</th>
                          <th className="px-4 py-3 text-start font-semibold text-gray-600">{isArabic ? 'الطلاب' : 'Students'}</th>
                          <th className="px-4 py-3 text-start font-semibold text-gray-600">{isArabic ? 'الجلسة القادمة' : 'Next session'}</th>
                          <th className="px-4 py-3 text-start font-semibold text-gray-600">{isArabic ? 'إجراءات' : 'Actions'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {courses.map((course) => (
                          <tr key={course.id}>
                            <td className="px-4 py-3 font-medium text-gray-900">{course.title}</td>
                            <td className="px-4 py-3 text-gray-600">{course.teacher_name || (isArabic ? 'غير معين' : 'Unassigned')}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                  course.is_published ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                                }`}
                              >
                                {course.is_published ? (isArabic ? 'منشور' : 'Published') : (isArabic ? 'مسودة' : 'Draft')}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600">{course.students_count}</td>
                            <td className="px-4 py-3 text-gray-600">
                              {course.next_session_time ? new Date(course.next_session_time).toLocaleString() : '-'}
                            </td>
                            <td className="px-4 py-3">
                              <Link
                                href={withLocalePrefix(`/teacher/courses/${course.id}`, locale)}
                                className="text-sm font-medium text-blue-600 hover:text-blue-700"
                              >
                                {isArabic ? 'عرض التفاصيل' : 'View details'}
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination meta={coursesMeta} page={coursePage} setPage={setCoursePage} />
                </>
              ) : null}
            </div>
          ) : null}

          {activeTab === 'lessons' ? (
            <div className="space-y-4">
              {lessonsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
                </div>
              ) : lessonsError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                  <p className="text-red-600 mb-2">{lessonsError}</p>
                  <button onClick={loadLessons} className="text-sm text-red-500 underline">{isArabic ? 'إعادة المحاولة' : 'Retry'}</button>
                </div>
              ) : lessons.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
                  <FileText className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                  <h3 className="font-semibold text-gray-700 mb-1">{isArabic ? 'لا توجد دروس' : 'No Lessons'}</h3>
                  <p className="text-sm text-gray-500">{isArabic ? 'لم يتم العثور على دروس للمواد في هذا الفصل. أنشئ دروسًا من صفحة تفاصيل المادة.' : 'No lessons found for courses in this grade. Create lessons from the course detail page.'}</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="min-w-full divide-y divide-gray-100 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-start font-semibold text-gray-600">{isArabic ? 'الدرس' : 'Lesson'}</th>
                        <th className="px-4 py-3 text-start font-semibold text-gray-600">{isArabic ? 'المادة' : 'Course'}</th>
                        <th className="px-4 py-3 text-start font-semibold text-gray-600">{isArabic ? 'التاريخ' : 'Date'}</th>
                        <th className="px-4 py-3 text-start font-semibold text-gray-600">{isArabic ? 'الحالة' : 'Status'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {lessons.map((lesson: any) => (
                        <tr key={lesson.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{lesson.title}</td>
                          <td className="px-4 py-3 text-gray-500">{lesson.course_title || '—'}</td>
                          <td className="px-4 py-3 text-gray-500">
                            {lesson.start_date_time ? new Date(lesson.start_date_time).toLocaleDateString() : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              lesson.status === 'completed' ? 'bg-green-100 text-green-700' :
                              lesson.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {lesson.status || 'scheduled'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : null}

          {activeTab === 'assessments' ? (
            <div className="space-y-4">
              {assessmentsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
                </div>
              ) : assessmentsError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                  <p className="text-red-600 mb-2">{assessmentsError}</p>
                  <button onClick={loadAssessments} className="text-sm text-red-500 underline">{isArabic ? 'إعادة المحاولة' : 'Retry'}</button>
                </div>
              ) : assessments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
                  <ClipboardList className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                  <h3 className="font-semibold text-gray-700 mb-1">{isArabic ? 'لا توجد تقييمات' : 'No Assessments'}</h3>
                  <p className="text-sm text-gray-500">{isArabic ? 'لم يتم العثور على اختبارات أو امتحانات للمواد في هذا الفصل.' : 'No quizzes or exams found for courses in this grade.'}</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="min-w-full divide-y divide-gray-100 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-start font-semibold text-gray-600">{isArabic ? 'التقييم' : 'Assessment'}</th>
                        <th className="px-4 py-3 text-start font-semibold text-gray-600">{isArabic ? 'النوع' : 'Type'}</th>
                        <th className="px-4 py-3 text-start font-semibold text-gray-600">{isArabic ? 'المادة' : 'Course'}</th>
                        <th className="px-4 py-3 text-start font-semibold text-gray-600">{isArabic ? 'التسليمات' : 'Submissions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {assessments.map((a: any) => (
                        <tr key={a.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{a.title}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              a.type === 'exam' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {a.type || 'quiz'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500">{a.course_title || '—'}</td>
                          <td className="px-4 py-3 text-gray-500">{a.submission_count ?? 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : null}

          {activeTab === 'schedule' ? (
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                Phase 8
              </div>
              <p className="text-sm text-gray-600">
                Calendar shell is active. This tab already consumes the future contract:
                <code className="ms-1 rounded bg-gray-100 px-1">events[] = {'{sessionId, courseId, title, start, end, teacher}'}</code>
              </p>
              {scheduleLoading ? <TabSkeleton /> : null}
              {scheduleError ? <InlineError message={scheduleError} /> : null}
              {!scheduleLoading && !scheduleError ? (
                <div className="rounded-xl border border-dashed border-gray-200 p-4">
                  <h3 className="mb-2 text-sm font-semibold text-gray-800">Calendar Event Feed</h3>
                  {scheduleEvents.length === 0 ? (
                    <p className="text-sm text-gray-500">No schedule events yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {scheduleEvents.slice(0, 8).map((event: any) => (
                        <li key={event.sessionId} className="rounded-lg border border-gray-100 px-3 py-2 text-sm">
                          <p className="font-medium text-gray-800">{event.title}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(event.start).toLocaleString()} • {event.teacher}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}

          {activeTab === 'students' ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute start-2 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      value={studentSearch}
                      onChange={(event) => {
                        setStudentPage(1);
                        setStudentSearch(event.target.value);
                      }}
                      className="w-64 rounded-lg border border-gray-200 py-2 ps-8 pe-3 text-sm"
                      placeholder={isArabic ? "بحث الطلاب" : "Search students"}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={exportStudentsCsv}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700"
                  >
                    <Download className="h-4 w-4" />
                    {isArabic ? 'تصدير CSV' : 'Export CSV'}
                  </button>
                </div>
              </div>

              <div className="grid gap-2 rounded-xl border border-gray-100 p-3 md:grid-cols-[1fr_220px_140px]">
                <input
                  type="email"
                  value={enrollEmail}
                  onChange={(event) => setEnrollEmail(event.target.value)}
                  placeholder="student@eduverse.com"
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <select
                  value={selectedCourseId}
                  onChange={(event) => setSelectedCourseId(event.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="">{isArabic ? 'اختر المادة' : 'Select course'}</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={enrollStudent}
                  disabled={enrollBusy || !enrollEmail || !selectedCourseId}
                  className="rounded-lg bg-gray-900 px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {enrollBusy ? (isArabic ? 'جاري التسجيل...' : 'Enrolling...') : (isArabic ? 'تسجيل طالب' : 'Enroll Student')}
                </button>
              </div>

              {studentsLoading ? <TabSkeleton /> : null}
              {studentsError ? <InlineError message={studentsError} /> : null}

              {!studentsLoading && !studentsError ? (
                <>
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="min-w-full divide-y divide-gray-100 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-start font-semibold text-gray-600">{isArabic ? 'الطالب' : 'Student'}</th>
                          <th className="px-4 py-3 text-start font-semibold text-gray-600">{isArabic ? 'البريد' : 'Email'}</th>
                          <th className="px-4 py-3 text-start font-semibold text-gray-600">{isArabic ? 'التسجيل' : 'Enrollment'}</th>
                          <th className="px-4 py-3 text-start font-semibold text-gray-600">{isArabic ? 'الدفع' : 'Payment'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {students.map((student) => (
                          <tr key={student.id}>
                            <td className="px-4 py-3 font-medium text-gray-900">{student.name}</td>
                            <td className="px-4 py-3 text-gray-600">{student.email}</td>
                            <td className="px-4 py-3 text-gray-600 capitalize">{student.enrollment_status}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                  student.payment_status === 'paid'
                                    ? 'bg-green-50 text-green-700'
                                    : student.payment_status === 'partial'
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-red-50 text-red-700'
                                }`}
                              >
                                {student.payment_status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination meta={studentsMeta} page={studentPage} setPage={setStudentPage} />
                </>
              ) : null}
            </div>
          ) : null}

          {activeTab === 'fees' ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <InfoCard label={isArabic ? 'المتوقع' : 'Expected'} value={formatMoney(feesSummary?.expected_total || 0)} />
                <InfoCard label={isArabic ? 'المحصّل' : 'Collected'} value={formatMoney(feesSummary?.collected_total || 0)} />
                <InfoCard label={isArabic ? 'المتبقي' : 'Outstanding'} value={formatMoney(feesSummary?.outstanding_total || 0)} />
              </div>

              <div className="grid gap-2 rounded-xl border border-gray-100 p-3 md:grid-cols-[1fr_180px_180px_140px]">
                <input
                  value={feeName}
                  onChange={(event) => setFeeName(event.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  placeholder={isArabic ? "اسم بند الرسوم" : "Fee item name"}
                />
                <input
                  value={feeAmount}
                  onChange={(event) => setFeeAmount(event.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  placeholder={isArabic ? "المبلغ" : "Amount"}
                  type="number"
                  min="1"
                />
                <input
                  value={feeDueDate}
                  onChange={(event) => setFeeDueDate(event.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  type="date"
                />
                <button
                  type="button"
                  onClick={addFeeItem}
                  disabled={feeBusy}
                  className="rounded-lg bg-gray-900 px-3 py-2 text-sm text-white disabled:opacity-50"
                >
                  {feeBusy ? (isArabic ? 'جاري الحفظ...' : 'Saving...') : (isArabic ? 'إضافة رسوم' : 'Add Fee')}
                </button>
              </div>

              {feesLoading ? <TabSkeleton /> : null}
              {feesError ? <InlineError message={feesError} /> : null}

              {!feesLoading && !feesError ? (
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="min-w-full divide-y divide-gray-100 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-start font-semibold text-gray-600">{isArabic ? 'البند' : 'Item'}</th>
                        <th className="px-4 py-3 text-start font-semibold text-gray-600">{isArabic ? 'المبلغ' : 'Amount'}</th>
                        <th className="px-4 py-3 text-start font-semibold text-gray-600">{isArabic ? 'تاريخ الاستحقاق' : 'Due date'}</th>
                        <th className="px-4 py-3 text-start font-semibold text-gray-600">{isArabic ? 'الطالب' : 'Student'}</th>
                        <th className="px-4 py-3 text-start font-semibold text-gray-600">{isArabic ? 'الحالة' : 'Status'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {feesRows.map((row) => (
                        <tr key={row.id}>
                          <td className="px-4 py-3 font-medium text-gray-900">{row.item_name}</td>
                          <td className="px-4 py-3 text-gray-600">{formatMoney(row.amount)}</td>
                          <td className="px-4 py-3 text-gray-600">{new Date(row.due_date).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-gray-600">{row.student_name || '-'}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                row.status === 'paid'
                                  ? 'bg-green-50 text-green-700'
                                  : row.status === 'partial'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-red-50 text-red-700'
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function InlineError({ message }: { message: string }) {
  return <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{message}</div>;
}

function TabSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-10 rounded-lg bg-gray-50" />
      <div className="h-10 rounded-lg bg-gray-50" />
      <div className="h-10 rounded-lg bg-gray-50" />
    </div>
  );
}

function Pagination({
  meta,
  page,
  setPage,
}: {
  meta: PaginationMeta | null;
  page: number;
  setPage: (page: number) => void;
}) {
  if (!meta || meta.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => setPage(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 disabled:opacity-50"
      >
        Previous
      </button>
      <span className="text-sm text-gray-500">
        Page {page} of {meta.totalPages}
      </span>
      <button
        type="button"
        onClick={() => setPage(Math.min(meta.totalPages, page + 1))}
        disabled={page >= meta.totalPages}
        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount || 0);
}
