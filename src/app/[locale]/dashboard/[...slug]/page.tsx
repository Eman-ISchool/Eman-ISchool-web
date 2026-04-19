import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';

import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import { referenceDashboardAliasRoutes } from '@/lib/reference-route-inventory';

const PageSkeleton = () => (
  <div className="animate-pulse space-y-4 p-6">
    <div className="h-8 w-48 rounded bg-slate-200" />
    <div className="h-64 rounded-xl bg-slate-100" />
  </div>
);

const ReferenceDashboardOverview = dynamic(() => import('@/components/dashboard/ReferenceDashboardOverview'), { loading: PageSkeleton });
const ReferenceAssessmentWorkspace = dynamic(() => import('@/components/dashboard/ReferenceAssessmentWorkspace'), { loading: PageSkeleton });
const ReferenceCatalogWorkspace = dynamic(() => import('@/components/dashboard/ReferenceCatalogWorkspace'), { loading: PageSkeleton });
const ReferenceContentWorkspace = dynamic(() => import('@/components/dashboard/ReferenceContentWorkspace'), { loading: PageSkeleton });
const ReferenceFinanceWorkspace = dynamic(() => import('@/components/dashboard/ReferenceFinanceWorkspace'), { loading: PageSkeleton });
const ReferencePeopleWorkspace = dynamic(() => import('@/components/dashboard/ReferencePeopleWorkspace'), { loading: PageSkeleton });
const ReferenceReportsWorkspace = dynamic(() => import('@/components/dashboard/ReferenceReportsWorkspace'), { loading: PageSkeleton });
const ReferenceScheduleWorkspace = dynamic(() => import('@/components/dashboard/ReferenceScheduleWorkspace'), { loading: PageSkeleton });
const ReferenceSettingsWorkspace = dynamic(() => import('@/components/dashboard/ReferenceSettingsWorkspace'), { loading: PageSkeleton });

interface DashboardCatchAllPageProps {
  params: {
    locale: string;
    slug: string[];
  };
}

export default function DashboardCatchAllPage({
  params: { locale, slug },
}: DashboardCatchAllPageProps) {
  const slugKey = slug.join('/');
  const config = referenceDashboardAliasRoutes[slugKey];

  if (!config) {
    notFound();
  }

  const isArabic = locale === 'ar';

  const body =
    slugKey === 'reports' || slugKey === 'admin/reports' ? (
      <ReferenceReportsWorkspace />
    ) : slugKey === 'stats' ? (
      <ReferenceDashboardOverview />
    ) : slugKey === 'announcements' ? (
      <ReferenceContentWorkspace scope="announcements" />
    ) : slugKey === 'blogs' ? (
      <ReferenceContentWorkspace scope="blogs" />
    ) : slugKey === 'cms' ? (
      <ReferenceContentWorkspace scope="blogs" />
    ) : slugKey === 'messages' ? (
      <ReferenceContentWorkspace scope="announcements" />
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
    ) : slugKey === 'courses' ? (
      <ReferenceCatalogWorkspace scope="courses" />
    ) : slugKey === 'bundles' ? (
      <ReferenceCatalogWorkspace scope="bundles" />
    ) : slugKey === 'categories' ? (
      <ReferenceCatalogWorkspace scope="categories" />
    ) : slugKey === 'teacher/courses' ? (
      <ReferenceCatalogWorkspace scope="teacherCourses" />
    ) : slugKey === 'quizzes' ? (
      <ReferenceAssessmentWorkspace scope="quizzes" />
    ) : slugKey === 'exams' ? (
      <ReferenceAssessmentWorkspace scope="exams" />
    ) : slugKey === 'users' || slugKey === 'applications' ? (
      <ReferencePeopleWorkspace scope="students" />
    ) : slugKey === 'teacher/students' ? (
      <ReferencePeopleWorkspace scope="teacherStudents" />
    ) : slugKey === 'lookups' ? (
      <ReferenceSettingsWorkspace scope="lookups" />
    ) : slugKey === 'backup' ? (
      <ReferenceSettingsWorkspace scope="backup" />
    ) : slugKey === 'translations' ? (
      <ReferenceSettingsWorkspace scope="translations" />
    ) : slugKey === 'system-settings' || slugKey === 'profile' ? (
      <ReferenceSettingsWorkspace scope="lookups" />
    ) : slugKey === 'upcoming-classes' ? (
      <ReferenceScheduleWorkspace scope="upcomingClasses" />
    ) : slugKey === 'calendar' ? (
      <ReferenceScheduleWorkspace scope="calendar" />
    ) : slugKey === 'live' ? (
      <ReferenceScheduleWorkspace scope="live" />
    ) : (
      <ReferenceDashboardOverview />
    );

  return (
    <ReferenceDashboardShell
      pageTitle={config.title[isArabic ? 'ar' : 'en']}
      pageSubtitle={config.subtitle[isArabic ? 'ar' : 'en']}
    >
      {body}
    </ReferenceDashboardShell>
  );
}
