import dynamic from 'next/dynamic';
import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';

const ReferenceScheduleWorkspace = dynamic(
  () => import('@/components/dashboard/ReferenceScheduleWorkspace'),
  { ssr: false, loading: () => <div className="animate-pulse h-96 bg-gray-100 rounded-xl" /> }
);

interface Props {
  params: { locale: string };
}

export default function DashboardLivePage({ params: { locale } }: Props) {
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
