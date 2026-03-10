'use client';

import ReferencePeopleWorkspace from '@/components/dashboard/ReferencePeopleWorkspace';
import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import { useLocale } from 'next-intl';

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
