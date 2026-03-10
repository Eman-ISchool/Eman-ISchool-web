import { ComponentType } from 'react';
import { notFound } from 'next/navigation';

import ReferenceDashboardOverview from '@/components/dashboard/ReferenceDashboardOverview';
import ReferenceAssessmentWorkspace from '@/components/dashboard/ReferenceAssessmentWorkspace';
import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import ReferenceCatalogWorkspace from '@/components/dashboard/ReferenceCatalogWorkspace';
import ReferenceContentWorkspace from '@/components/dashboard/ReferenceContentWorkspace';
import ReferenceFinanceWorkspace from '@/components/dashboard/ReferenceFinanceWorkspace';
import ReferencePeopleWorkspace from '@/components/dashboard/ReferencePeopleWorkspace';
import ReferenceReportsWorkspace from '@/components/dashboard/ReferenceReportsWorkspace';
import ReferenceScheduleWorkspace from '@/components/dashboard/ReferenceScheduleWorkspace';
import ReferenceSettingsWorkspace from '@/components/dashboard/ReferenceSettingsWorkspace';
import {
  DashboardModuleKey,
  referenceDashboardAliasRoutes,
} from '@/lib/reference-route-inventory';

import ContentPage from '../../admin/content/page';
import EnrollmentApplicationsPage from '../../admin/enrollment-applications/page';
import EnrollmentReportsPage from '../../admin/enrollment-reports/page';
import CouponsExpensesPage from '../../admin/coupons-expenses/page';
import CurrencyComparePage from '../../admin/currency-compare/page';
import FeesPage from '../../admin/fees/page';
import CalendarPage from '../../admin/calendar/page';
import LessonsPage from '../../admin/lessons/page';
import QuizzesExamsPage from '../../admin/quizzes-exams/page';
import SettingsPage from '../../admin/settings/page';
import StudentsPage from '../../admin/students/page';

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
    slugKey === 'reports' ? (
      <ReferenceReportsWorkspace />
    ) : slugKey === 'announcements' ? (
      <ReferenceContentWorkspace scope="announcements" />
    ) : slugKey === 'blogs' ? (
      <ReferenceContentWorkspace scope="blogs" />
    ) : slugKey === 'payments' ? (
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
    ) : slugKey === 'bundles' ? (
      <ReferenceCatalogWorkspace scope="bundles" />
    ) : slugKey === 'teacher/courses' ? (
      <ReferenceCatalogWorkspace scope="teacherCourses" />
    ) : slugKey === 'teacher/students' ? (
      <ReferencePeopleWorkspace scope="teacherStudents" />
    ) : slugKey === 'exams' ? (
      <ReferenceAssessmentWorkspace scope="exams" />
    ) : slugKey === 'lookups' ? (
      <ReferenceSettingsWorkspace scope="lookups" />
    ) : slugKey === 'backup' ? (
      <ReferenceSettingsWorkspace scope="backup" />
    ) : slugKey === 'translations' ? (
      <ReferenceSettingsWorkspace scope="translations" />
    ) : slugKey === 'categories' ? (
      <ReferenceCatalogWorkspace scope="categories" />
    ) : slugKey === 'upcoming-classes' ? (
      <ReferenceScheduleWorkspace scope="upcomingClasses" />
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
