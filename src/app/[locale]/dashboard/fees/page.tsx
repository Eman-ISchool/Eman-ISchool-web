'use client';

import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import ReferenceFinanceWorkspace from '@/components/dashboard/ReferenceFinanceWorkspace';
import { useLocale } from 'next-intl';

export default function DashboardFeesPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  return (
    <ReferenceDashboardShell
      pageTitle={isArabic ? 'الرسوم' : 'Fees'}
      pageSubtitle={isArabic ? 'مساحة رسوم مرجعية متسقة مع بقية البوابة' : 'Reference-style fee workspace aligned with the rest of the portal'}
    >
      <ReferenceFinanceWorkspace scope="fees" />
    </ReferenceDashboardShell>
  );
}
