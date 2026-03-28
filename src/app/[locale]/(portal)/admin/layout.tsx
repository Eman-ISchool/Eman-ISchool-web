import { ReactNode } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import Topbar from '@/components/admin/Topbar';
import { authOptions } from '@/lib/auth';

interface AdminPortalLayoutProps {
    children: ReactNode;
    params: { locale: string };
}

export default async function AdminPortalLayout({ children, params }: AdminPortalLayoutProps) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect(`/${params.locale}/login/admin`);
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <AdminLayout>
                <Topbar />
                <main className="flex-1">
                    {children}
                </main>
            </AdminLayout>
        </div>
    );
}
