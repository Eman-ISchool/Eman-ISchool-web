import { redirect } from 'next/navigation';

/**
 * The old E2E Flow Test Dashboard has been replaced by the Instructor Portal.
 * This page now redirects to the teacher dashboard.
 */
export default function E2EFlowPage({ params }: { params: { locale: string } }) {
    redirect(`/${params.locale}/teacher/home`);
}
