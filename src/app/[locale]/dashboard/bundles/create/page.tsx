import dynamic from 'next/dynamic';

const ReferenceBundleEditorPage = dynamic(
  () => import('@/components/dashboard/reference-courses').then(m => ({ default: m.ReferenceBundleEditorPage })),
  { ssr: false, loading: () => <div className="animate-pulse h-96 bg-gray-100 rounded-xl" /> }
);

export default function DashboardBundleCreatePage() {
  return <ReferenceBundleEditorPage />;
}
