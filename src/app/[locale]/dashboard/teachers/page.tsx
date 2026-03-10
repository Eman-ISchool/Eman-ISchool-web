'use client';

import ReferencePeopleWorkspace from '@/components/dashboard/ReferencePeopleWorkspace';
import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import { useLocale } from 'next-intl';

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
