# Admin Reports + Google Meet Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix two independent areas: (1) make admin report sub-pages functional with real data tables and correct navigation; (2) create the missing `src/lib/google-meet.ts` library that unblocks three broken API routes.

**Architecture:** Part 1 edits five existing Next.js page files — the four report sub-pages get period selectors + real data tables pulled from existing list APIs (`/api/courses`, `/api/admin/users`), and the main reports page gets corrected hrefs. Part 2 creates one new library file (`src/lib/google-meet.ts`) whose exports the three API routes already import — no route changes needed beyond the import fix.

**Tech Stack:** TypeScript 5.x, Next.js 14 App Router, TailwindCSS v4, next-intl, lucide-react, Google OAuth 2.0 REST API (`accounts.google.com`, `www.googleapis.com`).

---

## File Map

### Part 1 — Admin Reports

| Action | File |
|--------|------|
| Modify | `src/app/[locale]/(portal)/admin/reports/page.tsx` |
| Modify | `src/app/[locale]/(portal)/admin/reports/courses/page.tsx` |
| Modify | `src/app/[locale]/(portal)/admin/reports/students/page.tsx` |
| Modify | `src/app/[locale]/(portal)/admin/reports/teachers/page.tsx` |
| Modify | `src/app/[locale]/(portal)/admin/reports/sales/page.tsx` |

### Part 2 — Google Meet Library

| Action | File |
|--------|------|
| **Create** | `src/lib/google-meet.ts` |
| Test (already exists) | `src/__tests__/lib/google-meet.test.ts` |

---

## Part 1: Admin Reports

---

### Task 1: Fix navigation links in main reports page

The four report module cards in `reports/page.tsx` link to wrong hrefs. Fix them to point to the actual sub-pages.

**Files:**
- Modify: `src/app/[locale]/(portal)/admin/reports/page.tsx:53-114`

- [ ] **Step 1: Locate the four wrong hrefs**

Open `src/app/[locale]/(portal)/admin/reports/page.tsx`. The `reportModules` array (lines 53–114) has these wrong hrefs:
```
students  → '/admin/students'   ← should be '/admin/reports/students'
financial → '/admin/payments'   ← should be '/admin/reports/sales'
courses   → '/admin/lessons'    ← should be '/admin/reports/courses'
teachers  → '/admin/teachers'   ← should be '/admin/reports/teachers'
```

- [ ] **Step 2: Fix the hrefs**

Replace the four `href` values in the `reportModules` array:

```typescript
// students module (line ~63)
href: '/admin/reports/students',

// financial module (line ~78)
href: '/admin/reports/sales',

// courses module (line ~92)
href: '/admin/reports/courses',

// teachers module (line ~107)
href: '/admin/reports/teachers',
```

- [ ] **Step 3: Fix the quick links section**

The quick links section (lines 219–229) also has wrong hrefs. Replace the entire `links` array:

```typescript
{[
    { label: isAr ? 'تقارير الطلاب' : 'Student Reports',   href: '/admin/reports/students' },
    { label: isAr ? 'التقارير المالية' : 'Financial Reports', href: '/admin/reports/sales' },
    { label: isAr ? 'تقارير الدورات' : 'Course Reports',    href: '/admin/reports/courses' },
    { label: isAr ? 'تقارير المعلمين' : 'Teacher Reports',   href: '/admin/reports/teachers' },
].map(link => (
```

- [ ] **Step 4: Verify in browser**

Navigate to `http://localhost:3000/ar/admin/reports`. Click each "عرض" (View) button and confirm it lands on the correct sub-page.

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/\(portal\)/admin/reports/page.tsx
git commit -m "fix(reports): correct navigation links to report sub-pages"
```

---

### Task 2: Add period selector + course list table to Course Reports page

`courses/page.tsx` hardcodes `period=month` and shows an empty placeholder. Replace with a dynamic period and a real table fetching from `/api/courses`.

**Files:**
- Modify: `src/app/[locale]/(portal)/admin/reports/courses/page.tsx`

- [ ] **Step 1: Add period state and dynamic fetch**

Replace the entire file content with:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { BookOpen, BarChart3, TrendingUp, CheckCircle, Download } from 'lucide-react';
import { LoadingState } from '@/components/admin/StateComponents';
import { useLocale } from 'next-intl';

type Period = 'week' | 'month' | 'quarter' | 'year';

export default function CourseReportsPage() {
    const locale = useLocale();
    const isAr = locale === 'ar';
    const [period, setPeriod] = useState<Period>('month');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [courses, setCourses] = useState<any[]>([]);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetch(`/api/admin/stats?period=${period}`).then(r => r.ok ? r.json() : {}),
            fetch('/api/courses?limit=100&all=1').then(r => r.ok ? r.json() : { courses: [] }),
        ])
            .then(([statsData, coursesData]) => {
                setStats(statsData);
                setCourses(coursesData.courses || []);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [period]);

    if (loading) return <LoadingState message={isAr ? 'جاري تحميل تقارير الدورات...' : 'Loading course reports...'} />;

    const kpis = [
        { label: isAr ? 'الكورسات النشطة' : 'Active Courses',    value: stats?.courses?.published || 0,  icon: BookOpen,   bg: 'bg-purple-500' },
        { label: isAr ? 'إجمالي الكورسات' : 'Total Courses',     value: stats?.courses?.total || 0,      icon: BarChart3,  bg: 'bg-blue-500' },
        { label: isAr ? 'دروس منجزة' : 'Completed Lessons',      value: stats?.lessons?.completed || 0,  icon: CheckCircle, bg: 'bg-green-500' },
        { label: isAr ? 'دروس قادمة' : 'Upcoming Lessons',       value: stats?.lessons?.upcoming || 0,   icon: TrendingUp, bg: 'bg-amber-500' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-purple-600" />
                        {isAr ? 'تقارير الدورات' : 'Course Reports'}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isAr ? 'معدلات إتمام الكورسات، تسليم الدروس، نتائج الاختبارات' : 'Course completion rates, lesson delivery, quiz results'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="admin-card p-1 inline-flex gap-1">
                        {(['week', 'month', 'quarter', 'year'] as Period[]).map(p => (
                            <button key={p} onClick={() => setPeriod(p)}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${period === p ? 'bg-teal-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                                {isAr
                                    ? { week: 'أسبوع', month: 'شهر', quarter: 'ربع', year: 'سنة' }[p]
                                    : { week: 'Week',  month: 'Month', quarter: 'Quarter', year: 'Year' }[p]}
                            </button>
                        ))}
                    </div>
                    <button className="admin-btn admin-btn-ghost">
                        <Download className="w-4 h-4" />
                        {isAr ? 'تصدير' : 'Export'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {kpis.map(kpi => {
                    const Icon = kpi.icon;
                    return (
                        <div key={kpi.label} className="admin-card p-4">
                            <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
                                <Icon className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-xl font-bold text-gray-800">{kpi.value}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
                        </div>
                    );
                })}
            </div>

            <div className="admin-card p-6">
                <h3 className="font-semibold text-gray-700 mb-4">
                    {isAr ? 'قائمة الكورسات' : 'Course List'}
                </h3>
                {courses.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>{isAr ? 'لا توجد كورسات بعد' : 'No courses yet'}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-start py-2 px-3 text-gray-500 font-medium">{isAr ? 'الكورس' : 'Course'}</th>
                                    <th className="text-start py-2 px-3 text-gray-500 font-medium">{isAr ? 'المعلم' : 'Teacher'}</th>
                                    <th className="text-start py-2 px-3 text-gray-500 font-medium">{isAr ? 'الحالة' : 'Status'}</th>
                                    <th className="text-start py-2 px-3 text-gray-500 font-medium">{isAr ? 'الطلاب' : 'Students'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map((course: any) => (
                                    <tr key={course.id} className="border-b border-gray-50 hover:bg-gray-50">
                                        <td className="py-3 px-3 font-medium text-gray-800">{course.title}</td>
                                        <td className="py-3 px-3 text-gray-500">{course.teacher?.name || course.instructor_name || '—'}</td>
                                        <td className="py-3 px-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${course.is_published ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {course.is_published ? (isAr ? 'منشور' : 'Published') : (isAr ? 'مسودة' : 'Draft')}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 text-gray-500">{course.enrolled_count ?? course.enrollments_count ?? '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Verify in browser**

Navigate to `http://localhost:3000/ar/admin/reports/courses`. Confirm KPI cards load, period buttons switch, and the course table renders rows.

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/\(portal\)/admin/reports/courses/page.tsx
git commit -m "feat(reports): course reports — period selector + real course table"
```

---

### Task 3: Add period selector + enrollment table to Student Reports page

**Files:**
- Modify: `src/app/[locale]/(portal)/admin/reports/students/page.tsx`

- [ ] **Step 1: Replace file with period-aware version + student table**

```tsx
'use client';

import { useState, useEffect } from 'react';
import { GraduationCap, Users, TrendingUp, UserCheck, Clock, Download } from 'lucide-react';
import { LoadingState } from '@/components/admin/StateComponents';
import { useLocale } from 'next-intl';

type Period = 'week' | 'month' | 'quarter' | 'year';

export default function StudentReportsPage() {
    const locale = useLocale();
    const isAr = locale === 'ar';
    const [period, setPeriod] = useState<Period>('month');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetch(`/api/admin/stats?period=${period}`).then(r => r.ok ? r.json() : {}),
            fetch('/api/admin/users?role=student&limit=100').then(r => r.ok ? r.json() : { users: [] }),
        ])
            .then(([statsData, usersData]) => {
                setStats(statsData);
                setStudents(usersData.users || usersData || []);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [period]);

    if (loading) return <LoadingState message={isAr ? 'جاري تحميل تقارير الطلاب...' : 'Loading student reports...'} />;

    const kpis = [
        { label: isAr ? 'إجمالي الطلاب' : 'Total Students',          value: stats?.users?.students || 0,    icon: Users,       bg: 'bg-blue-500' },
        { label: isAr ? 'التسجيلات النشطة' : 'Active Enrollments',   value: stats?.enrollments?.active || 0,  icon: UserCheck,   bg: 'bg-green-500' },
        { label: isAr ? 'في انتظار الموافقة' : 'Pending Approval',   value: stats?.enrollments?.pending || 0, icon: Clock,       bg: 'bg-amber-500' },
        { label: isAr ? 'نسبة الحضور' : 'Attendance Rate',            value: `${stats?.attendance?.rate || 0}%`, icon: TrendingUp, bg: 'bg-teal-500' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <GraduationCap className="w-6 h-6 text-blue-600" />
                        {isAr ? 'تقارير الطلاب' : 'Student Reports'}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isAr ? 'اتجاهات التسجيل، نسب الحضور، تحليل الأداء' : 'Enrollment trends, attendance rates, performance analytics'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="admin-card p-1 inline-flex gap-1">
                        {(['week', 'month', 'quarter', 'year'] as Period[]).map(p => (
                            <button key={p} onClick={() => setPeriod(p)}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${period === p ? 'bg-teal-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                                {isAr
                                    ? { week: 'أسبوع', month: 'شهر', quarter: 'ربع', year: 'سنة' }[p]
                                    : { week: 'Week',  month: 'Month', quarter: 'Quarter', year: 'Year' }[p]}
                            </button>
                        ))}
                    </div>
                    <button className="admin-btn admin-btn-ghost">
                        <Download className="w-4 h-4" />
                        {isAr ? 'تصدير' : 'Export'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {kpis.map(kpi => {
                    const Icon = kpi.icon;
                    return (
                        <div key={kpi.label} className="admin-card p-4">
                            <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
                                <Icon className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-xl font-bold text-gray-800">{kpi.value}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
                        </div>
                    );
                })}
            </div>

            <div className="admin-card p-6">
                <h3 className="font-semibold text-gray-700 mb-4">
                    {isAr ? 'قائمة الطلاب' : 'Student List'}
                </h3>
                {students.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>{isAr ? 'لا يوجد طلاب بعد' : 'No students yet'}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-start py-2 px-3 text-gray-500 font-medium">{isAr ? 'الاسم' : 'Name'}</th>
                                    <th className="text-start py-2 px-3 text-gray-500 font-medium">{isAr ? 'البريد الإلكتروني' : 'Email'}</th>
                                    <th className="text-start py-2 px-3 text-gray-500 font-medium">{isAr ? 'تاريخ الانضمام' : 'Joined'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student: any) => (
                                    <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50">
                                        <td className="py-3 px-3 font-medium text-gray-800">{student.name}</td>
                                        <td className="py-3 px-3 text-gray-500">{student.email}</td>
                                        <td className="py-3 px-3 text-gray-500">
                                            {student.created_at
                                                ? new Date(student.created_at).toLocaleDateString(isAr ? 'ar' : 'en')
                                                : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Verify in browser**

Navigate to `http://localhost:3000/ar/admin/reports/students`. KPIs load, period buttons work, student table renders.

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/\(portal\)/admin/reports/students/page.tsx
git commit -m "feat(reports): student reports — period selector + real student table"
```

---

### Task 4: Add period selector + teacher table to Teacher Reports page

**Files:**
- Modify: `src/app/[locale]/(portal)/admin/reports/teachers/page.tsx`

- [ ] **Step 1: Read current file**

```bash
cat src/app/[locale]/\(portal\)/admin/reports/teachers/page.tsx
```

- [ ] **Step 2: Replace with period-aware + teacher table version**

Follow the same pattern as Task 3, but for teachers. Replace the file:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Users, BookOpen, CheckCircle, TrendingUp, Download } from 'lucide-react';
import { LoadingState } from '@/components/admin/StateComponents';
import { useLocale } from 'next-intl';

type Period = 'week' | 'month' | 'quarter' | 'year';

export default function TeacherReportsPage() {
    const locale = useLocale();
    const isAr = locale === 'ar';
    const [period, setPeriod] = useState<Period>('month');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [teachers, setTeachers] = useState<any[]>([]);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetch(`/api/admin/stats?period=${period}`).then(r => r.ok ? r.json() : {}),
            fetch('/api/admin/users?role=teacher&limit=100').then(r => r.ok ? r.json() : { users: [] }),
        ])
            .then(([statsData, usersData]) => {
                setStats(statsData);
                setTeachers(usersData.users || usersData || []);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [period]);

    if (loading) return <LoadingState message={isAr ? 'جاري تحميل تقارير المعلمين...' : 'Loading teacher reports...'} />;

    const completionPct = stats?.lessons?.total
        ? Math.round((stats.lessons.completed / stats.lessons.total) * 100)
        : 0;

    const kpis = [
        { label: isAr ? 'معلمون نشطون' : 'Active Teachers',     value: stats?.users?.teachers || 0,  icon: Users,       bg: 'bg-orange-500' },
        { label: isAr ? 'إجمالي الدروس' : 'Total Lessons',      value: stats?.lessons?.total || 0,   icon: BookOpen,    bg: 'bg-blue-500' },
        { label: isAr ? 'دروس منجزة' : 'Completed Lessons',     value: stats?.lessons?.completed || 0, icon: CheckCircle, bg: 'bg-green-500' },
        { label: isAr ? 'متوسط الإنجاز' : 'Avg Completion',     value: `${completionPct}%`,          icon: TrendingUp,  bg: 'bg-teal-500' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Users className="w-6 h-6 text-orange-600" />
                        {isAr ? 'تقارير المعلمين' : 'Teacher Reports'}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isAr ? 'معدلات تسليم الدروس، تقييمات الطلاب، سجلات النشاط' : 'Lesson delivery rates, student feedback, activity logs'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="admin-card p-1 inline-flex gap-1">
                        {(['week', 'month', 'quarter', 'year'] as Period[]).map(p => (
                            <button key={p} onClick={() => setPeriod(p)}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${period === p ? 'bg-teal-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                                {isAr
                                    ? { week: 'أسبوع', month: 'شهر', quarter: 'ربع', year: 'سنة' }[p]
                                    : { week: 'Week',  month: 'Month', quarter: 'Quarter', year: 'Year' }[p]}
                            </button>
                        ))}
                    </div>
                    <button className="admin-btn admin-btn-ghost">
                        <Download className="w-4 h-4" />
                        {isAr ? 'تصدير' : 'Export'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {kpis.map(kpi => {
                    const Icon = kpi.icon;
                    return (
                        <div key={kpi.label} className="admin-card p-4">
                            <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
                                <Icon className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-xl font-bold text-gray-800">{kpi.value}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
                        </div>
                    );
                })}
            </div>

            <div className="admin-card p-6">
                <h3 className="font-semibold text-gray-700 mb-4">
                    {isAr ? 'قائمة المعلمين' : 'Teacher List'}
                </h3>
                {teachers.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>{isAr ? 'لا يوجد معلمون بعد' : 'No teachers yet'}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-start py-2 px-3 text-gray-500 font-medium">{isAr ? 'الاسم' : 'Name'}</th>
                                    <th className="text-start py-2 px-3 text-gray-500 font-medium">{isAr ? 'البريد الإلكتروني' : 'Email'}</th>
                                    <th className="text-start py-2 px-3 text-gray-500 font-medium">{isAr ? 'تاريخ الانضمام' : 'Joined'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teachers.map((teacher: any) => (
                                    <tr key={teacher.id} className="border-b border-gray-50 hover:bg-gray-50">
                                        <td className="py-3 px-3 font-medium text-gray-800">{teacher.name}</td>
                                        <td className="py-3 px-3 text-gray-500">{teacher.email}</td>
                                        <td className="py-3 px-3 text-gray-500">
                                            {teacher.created_at
                                                ? new Date(teacher.created_at).toLocaleDateString(isAr ? 'ar' : 'en')
                                                : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/\(portal\)/admin/reports/teachers/page.tsx
git commit -m "feat(reports): teacher reports — period selector + real teacher table"
```

---

### Task 5: Fix currency + add period selector + revenue table to Sales Reports page

`sales/page.tsx` uses "AED" — the rest of the platform uses "EGP". Fix it and add period selector + revenue summary table.

**Files:**
- Modify: `src/app/[locale]/(portal)/admin/reports/sales/page.tsx`

- [ ] **Step 1: Replace with corrected version**

```tsx
'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Clock, BarChart3, Download } from 'lucide-react';
import { LoadingState } from '@/components/admin/StateComponents';
import { useLocale } from 'next-intl';

type Period = 'week' | 'month' | 'quarter' | 'year';

export default function SalesReportsPage() {
    const locale = useLocale();
    const isAr = locale === 'ar';
    const [period, setPeriod] = useState<Period>('month');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/admin/stats?period=${period}`)
            .then(r => r.ok ? r.json() : {})
            .then(data => setStats(data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [period]);

    if (loading) return <LoadingState message={isAr ? 'جاري تحميل التقارير المالية...' : 'Loading financial reports...'} />;

    const rev = stats?.revenue || {};
    const growthPct = rev.total > 0 ? Math.round(((rev.collected || 0) / rev.total) * 100) : 0;

    const kpis = [
        { label: isAr ? 'إجمالي الإيرادات' : 'Total Revenue', value: `${(rev.total || 0).toLocaleString()} EGP`,     icon: DollarSign,  bg: 'bg-green-500' },
        { label: isAr ? 'المحصّل' : 'Collected',               value: `${(rev.collected || 0).toLocaleString()} EGP`, icon: TrendingUp,  bg: 'bg-teal-500' },
        { label: isAr ? 'معلق' : 'Pending',                    value: `${(rev.pending || 0).toLocaleString()} EGP`,   icon: Clock,       bg: 'bg-amber-500' },
        { label: isAr ? 'نسبة التحصيل' : 'Collection Rate',   value: `${growthPct}%`,                                icon: BarChart3,   bg: 'bg-blue-500' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-green-600" />
                        {isAr ? 'التقارير المالية' : 'Financial Reports'}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isAr ? 'الإيرادات، المدفوعات، المصاريف، هامش الربح' : 'Revenue, payments, expenses, profit margins'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="admin-card p-1 inline-flex gap-1">
                        {(['week', 'month', 'quarter', 'year'] as Period[]).map(p => (
                            <button key={p} onClick={() => setPeriod(p)}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${period === p ? 'bg-teal-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                                {isAr
                                    ? { week: 'أسبوع', month: 'شهر', quarter: 'ربع', year: 'سنة' }[p]
                                    : { week: 'Week',  month: 'Month', quarter: 'Quarter', year: 'Year' }[p]}
                            </button>
                        ))}
                    </div>
                    <button className="admin-btn admin-btn-ghost">
                        <Download className="w-4 h-4" />
                        {isAr ? 'تصدير' : 'Export'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {kpis.map(kpi => {
                    const Icon = kpi.icon;
                    return (
                        <div key={kpi.label} className="admin-card p-4">
                            <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
                                <Icon className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-xl font-bold text-gray-800">{kpi.value}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Revenue breakdown summary */}
            <div className="admin-card p-6">
                <h3 className="font-semibold text-gray-700 mb-4">
                    {isAr ? 'ملخص الإيرادات' : 'Revenue Summary'}
                </h3>
                <div className="space-y-3">
                    {[
                        { label: isAr ? 'إجمالي الإيرادات' : 'Total Revenue', value: rev.total || 0, color: 'bg-gray-200' },
                        { label: isAr ? 'المحصّل' : 'Collected',              value: rev.collected || 0, color: 'bg-green-400' },
                        { label: isAr ? 'معلق' : 'Pending',                   value: rev.pending || 0, color: 'bg-amber-400' },
                    ].map(row => (
                        <div key={row.label} className="flex items-center gap-3">
                            <span className="w-32 text-sm text-gray-500 shrink-0">{row.label}</span>
                            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${row.color}`}
                                    style={{ width: rev.total ? `${Math.min((row.value / rev.total) * 100, 100)}%` : '0%' }}
                                />
                            </div>
                            <span className="w-28 text-sm font-semibold text-gray-700 text-end">
                                {row.value.toLocaleString()} EGP
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Verify in browser**

Navigate to `http://localhost:3000/ar/admin/reports/sales`. Confirm "EGP" appears (not "AED"), period selector works, revenue bars render.

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/\(portal\)/admin/reports/sales/page.tsx
git commit -m "fix(reports): sales — currency EGP, period selector, revenue bar chart"
```

---

## Part 2: Google Meet Integration Library

**Context:** Three API routes import from `@/lib/google-meet` which doesn't exist. This causes runtime crashes when those routes are hit. The test file at `src/__tests__/lib/google-meet.test.ts` already specifies the exact contract.

---

### Task 6: Create `src/lib/google-meet.ts` and make tests pass

**Files:**
- Create: `src/lib/google-meet.ts`
- Test: `src/__tests__/lib/google-meet.test.ts` (already written — do not modify)

- [ ] **Step 1: Run the existing tests to confirm they fail**

```bash
npx jest src/__tests__/lib/google-meet.test.ts --no-coverage 2>&1 | tail -20
```

Expected: `Cannot find module '@/lib/google-meet'` error — all 3 tests fail.

- [ ] **Step 2: Create the library file**

Create `src/lib/google-meet.ts`:

```typescript
/**
 * Google Meet / Google OAuth integration utilities.
 *
 * Used by:
 *   - /api/integrations/google/connect
 *   - /api/integrations/google/callback
 *   - /api/admin/meetings
 */

// ─── Custom error class ────────────────────────────────────────────────────────

export interface GoogleIntegrationErrorOptions {
    status?: number;
    requiresReconnect?: boolean;
}

export class GoogleIntegrationError extends Error {
    readonly code: string;
    readonly status: number;
    readonly requiresReconnect: boolean;

    constructor(code: string, message: string, options: GoogleIntegrationErrorOptions = {}) {
        super(message);
        this.name = 'GoogleIntegrationError';
        this.code = code;
        this.status = options.status ?? 500;
        this.requiresReconnect = options.requiresReconnect ?? false;
    }
}

// ─── OAuth helpers ─────────────────────────────────────────────────────────────

const GOOGLE_SCOPES = [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/meetings.space.created',
].join(' ');

/**
 * Build the Google OAuth2 authorization URL for the Google Meet integration.
 */
export function buildGoogleConnectUrl({
    state,
    appBaseUrl,
}: {
    state: string;
    appBaseUrl: string;
}): string {
    const redirectUri = `${appBaseUrl}/api/integrations/google/callback`;
    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID ?? '',
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: GOOGLE_SCOPES,
        state,
        access_type: 'offline',
        prompt: 'consent',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchange an authorization code for OAuth tokens.
 * Returns { access_token, refresh_token?, expires_in, token_type }.
 */
export async function exchangeGoogleAuthCode(
    code: string,
    appOrigin: string,
): Promise<{ access_token: string; refresh_token?: string; expires_in: number; token_type: string }> {
    const redirectUri = `${appOrigin}/api/integrations/google/callback`;
    const body = new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID ?? '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
    });

    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new GoogleIntegrationError(
            'GOOGLE_TOKEN_EXCHANGE_FAILED',
            err.error_description ?? 'Failed to exchange Google authorization code.',
            { status: res.status },
        );
    }

    return res.json();
}

/**
 * Fetch the authenticated Google user's profile (email + sub).
 */
export async function fetchGoogleProfile(
    accessToken: string,
): Promise<{ sub: string; email: string; name?: string; picture?: string }> {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
        throw new GoogleIntegrationError(
            'GOOGLE_PROFILE_FETCH_FAILED',
            'Failed to fetch Google profile.',
            { status: res.status },
        );
    }

    return res.json();
}

// ─── Meeting helpers ───────────────────────────────────────────────────────────

/**
 * Extract the meeting code (e.g. "abc-defg-hij") from a Google Meet URL.
 * Returns null if the URL is not a meet.google.com link.
 */
export function extractMeetingCode(uri: string): string | null {
    try {
        const url = new URL(uri);
        if (url.hostname !== 'meet.google.com') return null;
        // pathname is like "/abc-defg-hij"
        const code = url.pathname.replace(/^\//, '').split('/')[0];
        return code || null;
    } catch {
        return null;
    }
}

/**
 * Fetch a live snapshot of a Google Meet space via the Meet REST API.
 * Requires the `meetings.space.created` scope.
 */
export async function getGoogleMeetingSnapshot(
    accessToken: string,
    spaceName: string,
): Promise<Record<string, unknown>> {
    const res = await fetch(
        `https://meet.googleapis.com/v2/${spaceName}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (res.status === 401 || res.status === 403) {
            throw new GoogleIntegrationError(
                'GOOGLE_REAUTH_REQUIRED',
                'Google Meet access expired. Please reconnect.',
                { status: res.status, requiresReconnect: true },
            );
        }
        throw new GoogleIntegrationError(
            'GOOGLE_MEET_FETCH_FAILED',
            body?.error?.message ?? 'Failed to fetch meeting snapshot.',
            { status: res.status },
        );
    }

    return res.json();
}

// ─── Error serialization ───────────────────────────────────────────────────────

export interface PublicGoogleError {
    error: string;
    code: string;
    status: number;
    requiresGoogleAuth?: boolean;
}

/**
 * Convert a GoogleIntegrationError into a safe client-facing JSON payload.
 */
export function toPublicGoogleError(error: GoogleIntegrationError): PublicGoogleError {
    return {
        error: error.message,
        code: error.code,
        status: error.status,
        ...(error.requiresReconnect ? { requiresGoogleAuth: true } : {}),
    };
}
```

- [ ] **Step 3: Run tests — expect all 3 to pass**

```bash
npx jest src/__tests__/lib/google-meet.test.ts --no-coverage 2>&1
```

Expected output:
```
PASS src/__tests__/lib/google-meet.test.ts
  google-meet helpers
    ✓ builds a Google connect URL with the Meet scope and callback URI
    ✓ extracts the Google Meet code from a meeting URI
    ✓ maps reconnect-required errors to a public response

Tests: 3 passed, 3 total
```

If any test fails, read the failure message and fix the specific function — do not change the test file.

- [ ] **Step 4: Commit**

```bash
git add src/lib/google-meet.ts
git commit -m "feat(google-meet): create missing library — OAuth helpers, meeting snapshot, error serialization"
```

---

### Task 7: Verify the three API routes now compile without import errors

The routes were already written correctly; they just needed the library to exist. Verify they start up cleanly.

**Files:**
- Reference (do not modify): `src/app/api/integrations/google/connect/route.ts`
- Reference (do not modify): `src/app/api/integrations/google/callback/route.ts`
- Reference (do not modify): `src/app/api/admin/meetings/route.ts`

- [ ] **Step 1: Check for TypeScript errors in the three routes**

```bash
npx tsc --noEmit --isolatedModules \
  src/lib/google-meet.ts \
  src/app/api/integrations/google/connect/route.ts \
  src/app/api/integrations/google/callback/route.ts \
  src/app/api/admin/meetings/route.ts \
  2>&1 | head -30
```

Expected: no output (clean compile). If there are errors, fix only `src/lib/google-meet.ts` — do not modify the route files.

- [ ] **Step 2: Smoke-test the connect endpoint in browser**

With the dev server running, open:
```
http://localhost:3000/api/integrations/google/connect?returnTo=/dashboard
```

Expected: redirect to Google OAuth (or redirect to login if not authenticated). The key test is **no 500 error** — previously it would crash on the missing import.

- [ ] **Step 3: Smoke-test the meetings endpoint**

In a browser tab where you're logged in as admin, open:
```
http://localhost:3000/api/admin/meetings?limit=5
```

Expected: JSON response `{ meetings: [...], requestId: "..." }`. No 500 crash.

- [ ] **Step 4: Commit final state**

```bash
git add src/lib/google-meet.ts
git commit -m "chore: verify google-meet integration routes load cleanly after library creation"
```

_(If no files changed in this step, skip the commit.)_

---

## Done

All tasks complete when:

- [ ] All four "View" links on `/admin/reports` go to correct sub-pages
- [ ] All four report sub-pages show period selector + real data table
- [ ] Sales page shows EGP (not AED)
- [ ] `npx jest src/__tests__/lib/google-meet.test.ts` → 3/3 pass
- [ ] `/api/admin/meetings` returns JSON (no crash)
- [ ] `/api/integrations/google/connect` redirects (no crash)
