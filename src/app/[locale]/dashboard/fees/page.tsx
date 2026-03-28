import dynamic from 'next/dynamic';
import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';

const ReferenceFinanceWorkspace = dynamic(
  () => import('@/components/dashboard/ReferenceFinanceWorkspace'),
  { ssr: false, loading: () => <div className="animate-pulse h-96 bg-gray-100 rounded-xl" /> }
);

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
