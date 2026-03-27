import dynamic from 'next/dynamic';

const ReferenceQuizManagePage = dynamic(
  () => import('@/components/dashboard/reference-assessments').then(m => ({ default: m.ReferenceQuizManagePage })),
  { ssr: false, loading: () => <div className="animate-pulse h-96 bg-gray-100 rounded-xl" /> }
);

export default function DashboardQuizManagePage() {
  return <ReferenceQuizManagePage />;
}
