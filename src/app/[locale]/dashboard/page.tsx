import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import { authOptions } from '@/lib/auth';
import { withLocalePrefix } from '@/lib/locale-path';
import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';

const ReferenceDashboardOverview = dynamic(
  () => import('@/components/dashboard/ReferenceDashboardOverview'),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 h-8 w-16 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
    ),
  }
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
