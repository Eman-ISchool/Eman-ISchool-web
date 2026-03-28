import dynamic from 'next/dynamic';
import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';

const ReferenceScheduleWorkspace = dynamic(
  () => import('@/components/dashboard/ReferenceScheduleWorkspace'),
  { ssr: false, loading: () => <div className="animate-pulse h-96 bg-gray-100 rounded-xl" /> }
);

interface Props {
  params: { locale: string };
}

export default function DashboardCalendarPage({ params: { locale } }: Props) {
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
