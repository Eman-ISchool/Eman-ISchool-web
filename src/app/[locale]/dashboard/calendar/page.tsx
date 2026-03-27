'use client';

import dynamic from 'next/dynamic';
import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import { useLocale } from 'next-intl';

const ReferenceScheduleWorkspace = dynamic(
  () => import('@/components/dashboard/ReferenceScheduleWorkspace'),
  { ssr: false, loading: () => <div className="animate-pulse h-96 bg-gray-100 rounded-xl" /> }
);

export default function DashboardCalendarPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  return (
    <ReferenceDashboardShell
      pageTitle={isArabic ? 'التقويم' : 'Calendar'}
      pageSubtitle={isArabic ? 'جدولة الفصول والأنشطة ضمن المسار المرجعي' : 'Scheduling workspace inside the reference route family'}
    >
      <ReferenceScheduleWorkspace scope="calendar" />
    </ReferenceDashboardShell>
  );
}
