import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';

export default function AccessDenied({ locale }: { locale: string }) {
  const isArabic = locale === 'ar';
  return (
    <ReferenceDashboardShell pageTitle={isArabic ? 'ممنوع الوصول' : 'Access denied'}>
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-700">
        {isArabic
          ? 'ليس لديك صلاحية للوصول إلى هذه الصفحة.'
          : 'You do not have permission to view this page.'}
      </div>
    </ReferenceDashboardShell>
  );
}
