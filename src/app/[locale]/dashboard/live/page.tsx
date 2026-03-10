'use client';

import ReferenceScheduleWorkspace from '@/components/dashboard/ReferenceScheduleWorkspace';
import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import { useLocale } from 'next-intl';

export default function DashboardLivePage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  return (
    <ReferenceDashboardShell
      pageTitle={isArabic ? 'الجلسات المباشرة' : 'Live sessions'}
      pageSubtitle={isArabic ? 'متابعة الجلسات والبث المباشر داخل السطح الجديد' : 'Live session tracking inside the new dashboard surface'}
    >
      <ReferenceScheduleWorkspace scope="live" />
    </ReferenceDashboardShell>
  );
}
