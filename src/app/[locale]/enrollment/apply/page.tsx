import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';
import { setRequestLocale } from 'next-intl/server';
import EnrollmentWizard from '@/components/enrollment/EnrollmentWizard';

export const metadata = {
  title: 'Enrollment Application | Eduverse',
  description: 'Apply for student enrollment at Eduverse',
};

interface Props {
  params: { locale: string };
  searchParams: { applicationId?: string };
}

export default async function EnrollmentApplyPage({
  params: { locale },
  searchParams,
}: Props) {
  setRequestLocale(locale);

  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  // If logged in but not a parent or admin role, redirect away
  if (session && user?.role && user.role !== 'parent' && user.role !== 'admin') {
    redirect(withLocalePrefix('/', locale));
  }

  // If not logged in, redirect to login with callback
  if (!session) {
    redirect(
      withLocalePrefix(
        `/api/auth/signin?callbackUrl=${encodeURIComponent(`/${locale}/enrollment/apply`)}`,
        locale,
      ),
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-soft)]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <EnrollmentWizard
          locale={locale}
          applicationId={searchParams.applicationId}
          userId={user?.id}
        />
      </div>
    </div>
  );
}
