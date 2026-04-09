import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import ReferenceScheduleWorkspace from '@/components/dashboard/ReferenceScheduleWorkspace';

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
