import dynamic from 'next/dynamic';

const ReferenceQuizzesPage = dynamic(
  () => import('@/components/dashboard/reference-assessments').then(m => ({ default: m.ReferenceQuizzesPage })),
  { ssr: false, loading: () => <div className="animate-pulse h-96 bg-gray-100 rounded-xl" /> }
);

export default function DashboardQuizzesPage() {
  return <ReferenceQuizzesPage />;
}
