'use client';

import { useLocale } from 'next-intl';

import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import ReferenceReportsWorkspace from '@/components/dashboard/ReferenceReportsWorkspace';

export default function ReportsPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  return (
    <ReferenceDashboardShell
      pageTitle={isArabic ? 'التقارير والتحليلات' : 'Reports and analytics'}
      pageSubtitle={isArabic ? 'لوحة تحليلات وتقارير شاملة' : 'Comprehensive analytics and reporting'}
    >
      <ReferenceReportsWorkspace />
    </ReferenceDashboardShell>
  );
}
