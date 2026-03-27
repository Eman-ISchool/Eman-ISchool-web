'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import dynamic from 'next/dynamic';

const ReferenceDashboardOverview = dynamic(
  () => import('@/components/dashboard/ReferenceDashboardOverview'),
  { ssr: false, loading: () => <div className="animate-pulse h-96 bg-gray-100 rounded-xl" /> }
);
import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import { withLocalePrefix } from '@/lib/locale-path';

export default function DashboardPage() {
  const router = useRouter();
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const { data: session, status } = useSession();
  const normalizedRole = (session?.user as { role?: string } | undefined)?.role?.toLowerCase();

  useEffect(() => {
    if (status !== 'authenticated') {
      return;
    }

    if (normalizedRole === 'teacher') {
      router.replace(withLocalePrefix('/teacher/home', locale));
    } else if (normalizedRole === 'student') {
      router.replace(withLocalePrefix('/student/home', locale));
    } else if (normalizedRole === 'parent') {
      router.replace(withLocalePrefix('/parent/home', locale));
    }
  }, [locale, normalizedRole, router, status]);

  if (status === 'authenticated' && normalizedRole && normalizedRole !== 'admin') {
    return null;
  }

  return (
    <ReferenceDashboardShell
      pageTitle={isArabic ? 'لوحة التحكم' : 'Dashboard'}
      // Keep the dashboard available as an unauthenticated preview for parity work.
      pageSubtitle={isArabic ? 'متابعة شاملة للطلبات والإيرادات والحضور والأنشطة اليومية.' : 'A full operational view of applications, revenue, attendance, and daily activity.'}
    >
      <ReferenceDashboardOverview />
    </ReferenceDashboardShell>
  );
}
