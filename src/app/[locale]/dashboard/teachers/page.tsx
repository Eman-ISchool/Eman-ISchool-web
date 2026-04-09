import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import ReferencePeopleWorkspace from '@/components/dashboard/ReferencePeopleWorkspace';

interface Props {
  params: { locale: string };
}

export default function DashboardTeachersPage({ params: { locale } }: Props) {
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
