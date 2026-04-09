import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import ReferenceFinanceWorkspace from '@/components/dashboard/ReferenceFinanceWorkspace';

interface Props {
  params: { locale: string };
}

export default function DashboardFeesPage({ params: { locale } }: Props) {
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
