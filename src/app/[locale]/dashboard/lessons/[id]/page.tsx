import dynamic from 'next/dynamic';

const ReferenceLessonDetailPage = dynamic(
  () => import('@/components/dashboard/reference-courses').then(m => ({ default: m.ReferenceLessonDetailPage })),
  { ssr: false, loading: () => <div className="animate-pulse h-96 bg-gray-100 rounded-xl" /> }
);

export default function DashboardLessonDetailsPage({ params }: { params: { id: string } }) {
  return <ReferenceLessonDetailPage lessonId={params.id} />;
}
