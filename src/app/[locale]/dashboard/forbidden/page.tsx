import AccessDenied from '@/components/dashboard/AccessDenied';

export default function ForbiddenPage({ params }: { params: { locale: string } }) {
  return <AccessDenied locale={params.locale} />;
}
