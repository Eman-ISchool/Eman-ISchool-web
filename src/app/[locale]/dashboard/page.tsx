import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import { authOptions } from '@/lib/auth';
import { withLocalePrefix } from '@/lib/locale-path';
import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';

const ReferenceDashboardOverview = dynamic(
  () => import('@/components/dashboard/ReferenceDashboardOverview'),
  { ssr: false, loading: () => <div className="animate-pulse h-96 bg-gray-100 rounded-xl" /> }
);

interface Props {
  params: { locale: string };
}

export default async function DashboardPage({ params: { locale } }: Props) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role?.toLowerCase();

  // Server-side redirect: no client-side flash or waterfall
  if (session && role === 'teacher') {
    redirect(withLocalePrefix('/teacher/home', locale));
  }
  if (session && role === 'student') {
    redirect(withLocalePrefix('/student/home', locale));
  }
  if (session && role === 'parent') {
    redirect(withLocalePrefix('/parent/home', locale));
  }

  const isArabic = locale === 'ar';

  return (
    <ReferenceDashboardShell
      pageTitle={isArabic ? 'لوحة التحكم' : 'Dashboard'}
      pageSubtitle={isArabic ? 'متابعة شاملة للطلبات والإيرادات والحضور والأنشطة اليومية.' : 'A full operational view of applications, revenue, attendance, and daily activity.'}
    >
      <ReferenceDashboardOverview />
    </ReferenceDashboardShell>
  );
}
