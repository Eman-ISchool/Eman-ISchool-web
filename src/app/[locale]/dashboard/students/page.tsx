'use client';

import dynamic from 'next/dynamic';
import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import { useLocale } from 'next-intl';

const ReferencePeopleWorkspace = dynamic(
  () => import('@/components/dashboard/ReferencePeopleWorkspace'),
  { ssr: false, loading: () => <div className="animate-pulse h-96 bg-gray-100 rounded-xl" /> }
);

export default function DashboardStudentsPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  return (
    <ReferenceDashboardShell
      pageTitle={isArabic ? 'الطلاب' : 'Students'}
      pageSubtitle={isArabic ? 'إدارة الطلاب داخل المسار المرجعي الجديد' : 'Student administration inside the new reference route'}
    >
      <ReferencePeopleWorkspace scope="students" />
    </ReferenceDashboardShell>
  );
}
