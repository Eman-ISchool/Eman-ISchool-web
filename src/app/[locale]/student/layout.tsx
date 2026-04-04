import { StudentSideNav } from '@/components/student/StudentSideNav';
import { StudentMobileHeader } from '@/components/student/StudentMobileHeader';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';

export default async function StudentLayout({
    params,
    children,
}: {
    params: { locale: string };
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect(withLocalePrefix('/login/student', params.locale));
    }

    const currentUser = await getCurrentUser(session);
    const role = currentUser?.role?.toLowerCase();
    const hasAccess = role === 'student' || role === 'admin';

    if (!hasAccess) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-soft)]">
                <main className="main-with-sidenav">
                    <div className="max-w-4xl mx-auto px-4 py-6">
                        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-700">
                            Access denied. Student role is required.
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg-soft)]">
            <StudentMobileHeader />
            <main className="main-with-sidenav">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    {children}
                </div>
            </main>
            <StudentSideNav />
        </div>
    );
}
