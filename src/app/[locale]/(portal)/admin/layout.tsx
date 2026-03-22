'use client';

import { ReactNode } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Topbar from '@/components/admin/Topbar';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface AdminPortalLayoutProps {
    children: ReactNode;
    params: { locale: string };
}

export default function AdminPortalLayout({ children, params }: AdminPortalLayoutProps) {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Show loading state while checking authentication
    if (status === 'loading') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                    <p className="text-gray-600 dark:text-gray-400">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
        router.push(`/${params.locale}/login/admin`);
        return null;
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
