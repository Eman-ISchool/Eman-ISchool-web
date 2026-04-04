import AdminLayout from '@/components/admin/AdminLayout';
import { ReactNode } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';

export default async function AdminRootLayout({
    params,
    children,
}: {
    params: { locale: string };
    children: ReactNode;
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect(withLocalePrefix('/login/admin', params.locale));
    }

    const currentUser = await getCurrentUser(session);
    const role = currentUser?.role?.toLowerCase();
    const hasAccess = role === 'admin' || role === 'supervisor';

    if (!hasAccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-red-700 max-w-md text-center">
                    <h2 className="text-lg font-bold mb-2">Access Denied</h2>
                    <p>Admin or supervisor role is required to access this area.</p>
                </div>
            </div>
        );
    }

    return <AdminLayout>{children}</AdminLayout>;
}
