import { ComponentType } from 'react';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';

import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import {
  DashboardModuleKey,
  referenceDashboardAliasRoutes,
} from '@/lib/reference-route-inventory';

// Shared loading skeleton to reduce CLS during code-splitting
const PageSkeleton = () => (
  <div className="animate-pulse space-y-4 p-6">
    <div className="h-8 w-48 rounded bg-slate-200" />
    <div className="h-64 rounded-xl bg-slate-100" />
  </div>
);

// Dynamic imports — only the visited page's code is loaded
const ReferenceDashboardOverview = dynamic(() => import('@/components/dashboard/ReferenceDashboardOverview'), { loading: PageSkeleton });
const ReferenceAssessmentWorkspace = dynamic(() => import('@/components/dashboard/ReferenceAssessmentWorkspace'), { loading: PageSkeleton });
const ReferenceCatalogWorkspace = dynamic(() => import('@/components/dashboard/ReferenceCatalogWorkspace'), { loading: PageSkeleton });
const ReferenceContentWorkspace = dynamic(() => import('@/components/dashboard/ReferenceContentWorkspace'), { loading: PageSkeleton });
const ReferenceFinanceWorkspace = dynamic(() => import('@/components/dashboard/ReferenceFinanceWorkspace'), { loading: PageSkeleton });
const ReferencePeopleWorkspace = dynamic(() => import('@/components/dashboard/ReferencePeopleWorkspace'), { loading: PageSkeleton });
const ReferenceReportsWorkspace = dynamic(() => import('@/components/dashboard/ReferenceReportsWorkspace'), { loading: PageSkeleton });
const ReferenceScheduleWorkspace = dynamic(() => import('@/components/dashboard/ReferenceScheduleWorkspace'), { loading: PageSkeleton });
const ReferenceSettingsWorkspace = dynamic(() => import('@/components/dashboard/ReferenceSettingsWorkspace'), { loading: PageSkeleton });

const ContentPage = dynamic(() => import('../../admin/content/page'), { loading: PageSkeleton });
const EnrollmentApplicationsPage = dynamic(() => import('../../admin/enrollment-applications/page'), { loading: PageSkeleton });
const EnrollmentReportsPage = dynamic(() => import('../../admin/enrollment-reports/page'), { loading: PageSkeleton });
const CouponsExpensesPage = dynamic(() => import('../../admin/coupons-expenses/page'), { loading: PageSkeleton });
const CurrencyComparePage = dynamic(() => import('../../admin/currency-compare/page'), { loading: PageSkeleton });
const FeesPage = dynamic(() => import('../../admin/fees/page'), { loading: PageSkeleton });
const CalendarPage = dynamic(() => import('../../admin/calendar/page'), { loading: PageSkeleton });
const LessonsPage = dynamic(() => import('../../admin/lessons/page'), { loading: PageSkeleton });
const QuizzesExamsPage = dynamic(() => import('../../admin/quizzes-exams/page'), { loading: PageSkeleton });
const SettingsPage = dynamic(() => import('../../admin/settings/page'), { loading: PageSkeleton });
const StudentsPage = dynamic(() => import('../../admin/students/page'), { loading: PageSkeleton });

interface DashboardCatchAllPageProps {
  params: {
    locale: string;
    slug: string[];
  };
}
const moduleComponentMap: Record<DashboardModuleKey, ComponentType> = {
  adminHome: ReferenceDashboardOverview,
  calendar: CalendarPage,
  content: ContentPage,
  couponsExpenses: CouponsExpensesPage,
  currencyCompare: CurrencyComparePage,
  enrollmentApplications: EnrollmentApplicationsPage,
  enrollmentReports: EnrollmentReportsPage,
  fees: FeesPage,
  lessons: LessonsPage,
  quizzesExams: QuizzesExamsPage,
  settings: SettingsPage,
  students: StudentsPage,
};

export default function DashboardCatchAllPage({
  params: { locale, slug },
}: DashboardCatchAllPageProps) {
  const slugKey = slug.join('/');
  const config = referenceDashboardAliasRoutes[slugKey];

  if (!config) {
    notFound();
  }

  const isArabic = locale === 'ar';

  const customPage =
    // --- Analytics ---
    slugKey === 'reports' ? (
      <ReferenceReportsWorkspace />
    ) : // --- Content ---
    slugKey === 'announcements' ? (
      <ReferenceContentWorkspace scope="announcements" />
    ) : slugKey === 'blogs' ? (
      <ReferenceContentWorkspace scope="blogs" />
    ) : slugKey === 'cms' ? (
      <ReferenceContentWorkspace scope="blogs" />
    ) : // --- Finance ---
    slugKey === 'payments' ? (
      <ReferenceFinanceWorkspace scope="payments" />
    ) : slugKey === 'banks' ? (
      <ReferenceFinanceWorkspace scope="banks" />
    ) : slugKey === 'currencies' ? (
      <ReferenceFinanceWorkspace scope="currencies" />
    ) : slugKey === 'expenses' ? (
      <ReferenceFinanceWorkspace scope="expenses" />
    ) : slugKey === 'coupons' ? (
      <ReferenceFinanceWorkspace scope="coupons" />
    ) : slugKey === 'salaries' ? (
      <ReferenceFinanceWorkspace scope="salaries" />
    ) : slugKey === 'payslips' ? (
      <ReferenceFinanceWorkspace scope="payslips" />
    ) : // --- Catalog ---
    slugKey === 'courses' ? (
      <ReferenceCatalogWorkspace scope="courses" />
    ) : slugKey === 'bundles' ? (
      <ReferenceCatalogWorkspace scope="bundles" />
    ) : slugKey === 'categories' ? (
      <ReferenceCatalogWorkspace scope="categories" />
    ) : slugKey === 'teacher/courses' ? (
      <ReferenceCatalogWorkspace scope="teacherCourses" />
    ) : // --- Assessments ---
    slugKey === 'quizzes' ? (
      <ReferenceAssessmentWorkspace scope="quizzes" />
    ) : slugKey === 'exams' ? (
      <ReferenceAssessmentWorkspace scope="exams" />
    ) : // --- People ---
    slugKey === 'users' ? (
      <ReferencePeopleWorkspace scope="students" />
    ) : slugKey === 'teacher/students' ? (
      <ReferencePeopleWorkspace scope="teacherStudents" />
    ) : // --- Settings ---
    slugKey === 'lookups' ? (
      <ReferenceSettingsWorkspace scope="lookups" />
    ) : slugKey === 'backup' ? (
      <ReferenceSettingsWorkspace scope="backup" />
    ) : slugKey === 'translations' ? (
      <ReferenceSettingsWorkspace scope="translations" />
    ) : slugKey === 'system-settings' ? (
      <ReferenceSettingsWorkspace scope="lookups" />
    ) : // --- Schedule ---
    slugKey === 'upcoming-classes' ? (
      <ReferenceScheduleWorkspace scope="upcomingClasses" />
    ) : slugKey === 'calendar' ? (
      <ReferenceScheduleWorkspace scope="calendar" />
    ) : slugKey === 'live' ? (
      <ReferenceScheduleWorkspace scope="live" />
    ) : null;

  const Page = moduleComponentMap[config.module];

  return (
    <ReferenceDashboardShell
      pageTitle={config.title[isArabic ? 'ar' : 'en']}
      pageSubtitle={config.subtitle[isArabic ? 'ar' : 'en']}
    >
      {customPage ?? <Page />}
    </ReferenceDashboardShell>
  );
}
