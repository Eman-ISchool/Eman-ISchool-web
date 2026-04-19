import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions, getCurrentUser } from '@/lib/auth';
import { hasAccess } from '@/lib/dashboard-permissions';
import { withLocalePrefix } from '@/lib/locale-path';

export type AccessResult =
  | { allowed: true; role: string }
  | { allowed: false; role: string };

export async function requireDashboardAccess(
  locale: string,
  path: string,
): Promise<AccessResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(withLocalePrefix('/login', locale));
  }
  const user = await getCurrentUser(session);
  const role = (user?.role || '').toLowerCase();
  return hasAccess(role, path)
    ? { allowed: true, role }
    : { allowed: false, role };
}
