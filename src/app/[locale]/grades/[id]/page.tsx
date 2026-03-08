import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';

export default async function GradeDetailEntryPage({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(withLocalePrefix('/', locale));
  }

  const currentUser = await getCurrentUser(session);

  if (!currentUser) {
    redirect(withLocalePrefix('/', locale));
  }

  if (currentUser.role === 'teacher' || currentUser.role === 'admin') {
    redirect(withLocalePrefix(`/teacher/grades/${id}`, locale));
  }

  if (currentUser.role === 'supervisor') {
    redirect(withLocalePrefix(`/admin/grades/${id}`, locale));
  }

  redirect(withLocalePrefix('/', locale));
}
