import { ReferenceBundleEditorPage } from '@/components/dashboard/reference-courses';

export default function DashboardBundleDetailsPage({ params }: { params: { id: string } }) {
  return <ReferenceBundleEditorPage bundleId={params.id} />;
}
