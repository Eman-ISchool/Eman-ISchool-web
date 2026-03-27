import dynamic from 'next/dynamic';

const ReferenceCategoriesPage = dynamic(
  () => import('@/components/dashboard/reference-courses').then(m => ({ default: m.ReferenceCategoriesPage })),
  { ssr: false, loading: () => <div className="animate-pulse h-96 bg-gray-100 rounded-xl" /> }
);

export default function DashboardCategoriesPage() {
  return <ReferenceCategoriesPage />;
}
