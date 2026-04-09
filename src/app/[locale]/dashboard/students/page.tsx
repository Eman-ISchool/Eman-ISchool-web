import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import ReferencePeopleWorkspace from '@/components/dashboard/ReferencePeopleWorkspace';

interface Props {
  params: { locale: string };
}

export default function DashboardStudentsPage({ params: { locale } }: Props) {
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
