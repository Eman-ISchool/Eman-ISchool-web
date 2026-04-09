import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import ReferenceScheduleWorkspace from '@/components/dashboard/ReferenceScheduleWorkspace';

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
