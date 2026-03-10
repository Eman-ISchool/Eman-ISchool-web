'use client';

import ReferenceScheduleWorkspace from '@/components/dashboard/ReferenceScheduleWorkspace';
import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import { useLocale } from 'next-intl';

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
