import { TeacherSideNav } from '@/components/teacher/TeacherSideNav';
import { TeacherMobileNav } from '@/components/teacher/TeacherMobileNav';
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isTeacherOrAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';

export default async function TeacherLayout({
    params,
    children,
}: {
    params: { locale: string };
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect(withLocalePrefix('/login/teacher', params.locale));
    }

    const currentUser = await getCurrentUser(session);
    const hasAccess = !!(currentUser && isTeacherOrAdmin(currentUser.role));

    if (!hasAccess) {
        return (
            <div className="min-h-screen bg-white">
                <main className="main-with-sidenav">
                    <div className="max-w-6xl mx-auto px-6 py-8">
                        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-700">
                            Access denied. Teacher or admin role is required.
                        </div>
                    </div>
                </main>
                <TeacherSideNav />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <TeacherMobileNav />
            <main className="main-with-sidenav">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <Suspense fallback={<TeacherLoadingSkeleton />}>
                        {children}
                    </Suspense>
                </div>
            </main>
            <TeacherSideNav />
        </div>
    );
}

/** Lightweight skeleton shown while server components stream in */
function TeacherLoadingSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-8 bg-gray-100 rounded-lg w-48" />
            <div className="h-4 bg-gray-50 rounded w-72" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-48 bg-gray-50 rounded-2xl" />
                ))}
            </div>
        </div>
    );
}
