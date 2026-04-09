import { ReferenceLessonDetailPage } from '@/components/dashboard/reference-courses';

export default function DashboardLessonDetailsPage({ params }: { params: { id: string } }) {
  return <ReferenceLessonDetailPage lessonId={params.id} />;
}
