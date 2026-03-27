import dynamic from 'next/dynamic';

const ReferenceCoursesCatalogPage = dynamic(
  () => import('@/components/dashboard/reference-courses').then(m => ({ default: m.ReferenceCoursesCatalogPage })),
  { ssr: false, loading: () => <div className="animate-pulse h-96 bg-gray-100 rounded-xl" /> }
);

export default function DashboardCoursesPage() {
  return <ReferenceCoursesCatalogPage />;
}
