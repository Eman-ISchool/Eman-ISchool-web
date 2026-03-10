import { getServerSession } from 'next-auth';
import { authOptions, isTeacherOrAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';
import TeacherGradeDetailClient from '@/components/teacher/TeacherGradeDetailClient';

type GradeTab = 'info' | 'courses' | 'schedule' | 'students' | 'fees';
const GRADE_TABS: GradeTab[] = ['info', 'courses', 'schedule', 'students', 'fees'];

function normalizeTab(tab?: string): GradeTab {
  if (tab && GRADE_TABS.includes(tab as GradeTab)) {
    return tab as GradeTab;
  }
  return 'info';
}

export default async function TeacherGradeDetailPage({
  params: { locale, id },
  searchParams,
}: {
  params: { locale: string; id: string };
  searchParams?: { tab?: string | string[] };
}) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!session?.user) {
    redirect(withLocalePrefix('/login/teacher', locale));
  }

  if (!isTeacherOrAdmin(user?.role)) {
    redirect(withLocalePrefix('/', locale));
  }

  const tabParam = Array.isArray(searchParams?.tab) ? searchParams?.tab[0] : searchParams?.tab;
  const initialTab = normalizeTab(tabParam);

  return (
    <TeacherGradeDetailClient
      locale={locale}
      gradeRef={id}
      initialTab={initialTab}
      userRole={user?.role || 'teacher'}
    />
  );
}
