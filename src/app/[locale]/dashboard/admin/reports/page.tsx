import { redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';

export default function DashboardAdminReportsRedirect({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect(withLocalePrefix('/dashboard/reports', locale));
}
