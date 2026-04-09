import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions, getCurrentUser } from '@/lib/auth';
import { withLocalePrefix } from '@/lib/locale-path';

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function DashboardLayout({
  children,
  params: { locale },
}: DashboardLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(withLocalePrefix('/login', locale));
  }

  const currentUser = await getCurrentUser(session);
  const role = currentUser?.role?.toLowerCase();

  // Redirect non-admin users to their portal
  if (role === 'student') {
    redirect(withLocalePrefix('/student/home', locale));
  }
  if (role === 'teacher') {
    redirect(withLocalePrefix('/teacher/home', locale));
  }
  if (role === 'parent') {
    redirect(withLocalePrefix('/parent/home', locale));
  }

  return <>{children}</>;
}
