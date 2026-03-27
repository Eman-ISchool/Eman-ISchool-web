'use client';

import dynamic from 'next/dynamic';
import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import { useLocale } from 'next-intl';

const ReferencePeopleWorkspace = dynamic(
  () => import('@/components/dashboard/ReferencePeopleWorkspace'),
  { ssr: false, loading: () => <div className="animate-pulse h-96 bg-gray-100 rounded-xl" /> }
);

export default function DashboardTeachersPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  return (
    <ReferenceDashboardShell
      pageTitle={isArabic ? 'المعلمون' : 'Teachers'}
      pageSubtitle={isArabic ? 'إدارة المعلمين داخل الهيكل المرجعي الجديد' : 'Teacher administration inside the new reference hierarchy'}
    >
      <ReferencePeopleWorkspace scope="teachers" />
    </ReferenceDashboardShell>
  );
}
