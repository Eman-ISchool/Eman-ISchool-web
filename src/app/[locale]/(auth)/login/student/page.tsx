import { redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';

export default function StudentLoginRedirect({ params }: { params: { locale: string } }) {
  redirect(withLocalePrefix('/login', params.locale));
}
