import { ReferenceCourseEditorPage } from '@/components/dashboard/reference-courses';

export default function DashboardCourseDetailsPage({ params }: { params: { id: string } }) {
  return <ReferenceCourseEditorPage courseId={params.id} />;
}
