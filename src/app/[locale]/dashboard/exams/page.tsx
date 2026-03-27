import dynamic from 'next/dynamic';

const ReferenceExamsPage = dynamic(
  () => import('@/components/dashboard/reference-assessments').then(m => ({ default: m.ReferenceExamsPage })),
  { ssr: false, loading: () => <div className="animate-pulse h-96 bg-gray-100 rounded-xl" /> }
);

export default function DashboardExamsPage() {
  return <ReferenceExamsPage />;
}
