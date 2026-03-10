import { redirect } from 'next/navigation';

export default function AdminHomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect(`/${locale}/dashboard`);
}
