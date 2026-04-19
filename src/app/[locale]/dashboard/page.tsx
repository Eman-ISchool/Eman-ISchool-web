import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import { authOptions, getCurrentUser } from '@/lib/auth';
import { withLocalePrefix } from '@/lib/locale-path';
import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import TeacherHome from '@/components/dashboard/home/TeacherHome';
import StudentHome from '@/components/dashboard/home/StudentHome';
import ParentHome from '@/components/dashboard/home/ParentHome';

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

const TITLE: Record<string, { ar: string; en: string; subAr: string; subEn: string }> = {
  admin: {
    ar: 'لوحة التحكم',
    en: 'Dashboard',
    subAr: 'متابعة شاملة للطلبات والإيرادات والحضور والأنشطة اليومية.',
    subEn: 'A full operational view of applications, revenue, attendance, and daily activity.',
  },
  teacher: {
    ar: 'لوحة المعلم',
    en: 'Teacher dashboard',
    subAr: 'حصصك وتسليماتك ورسائل طلابك في لمحة سريعة.',
    subEn: 'Your classes, submissions, and student messages at a glance.',
  },
  student: {
    ar: 'لوحة الطالب',
    en: 'Student dashboard',
    subAr: 'موادك، حصصك القادمة، واجباتك، وآخر الإعلانات.',
    subEn: 'Your courses, upcoming sessions, assignments, and announcements.',
  },
  parent: {
    ar: 'لوحة ولي الأمر',
    en: 'Parent dashboard',
    subAr: 'متابعة سريعة للأبناء والمدفوعات والحضور والرسائل.',
    subEn: 'Quick overview of your children, payments, attendance, and messages.',
  },
};

export default async function DashboardPage({ params: { locale } }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect(withLocalePrefix('/login', locale));
  }

  const user = await getCurrentUser(session);
  const role = (user?.role || 'admin').toLowerCase();
  const isArabic = locale === 'ar';
  const titleKey = TITLE[role] ? role : 'admin';
  const t = TITLE[titleKey];

  let body: React.ReactNode;
  switch (role) {
    case 'teacher':
      body = <TeacherHome locale={locale} />;
      break;
    case 'student':
      body = <StudentHome locale={locale} />;
      break;
    case 'parent':
      body = <ParentHome locale={locale} />;
      break;
    case 'admin':
    case 'supervisor':
    default:
      body = <ReferenceDashboardOverview />;
      break;
  }

  return (
    <ReferenceDashboardShell
      pageTitle={isArabic ? t.ar : t.en}
      pageSubtitle={isArabic ? t.subAr : t.subEn}
    >
      {body}
    </ReferenceDashboardShell>
  );
}
