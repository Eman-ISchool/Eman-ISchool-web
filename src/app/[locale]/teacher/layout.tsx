import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isTeacherOrAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';
import ReferenceTeacherShell from '@/components/teacher/ReferenceTeacherShell';

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
            <ReferenceTeacherShell>
                <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-700">
                    Access denied. Teacher or admin role is required.
                </div>
            </ReferenceTeacherShell>
        );
    }

    return (
        <ReferenceTeacherShell>
            <Suspense fallback={<TeacherLoadingSkeleton />}>
                {children}
            </Suspense>
        </ReferenceTeacherShell>
    );
}

function TeacherLoadingSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-8 bg-gray-100 rounded-lg w-48" />
            <div className="h-4 bg-gray-50 rounded w-72" />
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-36 bg-gray-50 rounded-2xl" />
                ))}
            </div>
        </div>
    );
}
