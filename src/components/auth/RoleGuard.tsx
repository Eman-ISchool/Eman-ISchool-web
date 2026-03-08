'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface RoleGuardProps {
    children: ReactNode;
    allowedRoles: string[];
    fallback?: ReactNode;
    redirectTo?: string;
}

/**
 * Component to protect routes or sections entirely based on User roles.
 * Displays a fallback or redirects if the user doesn't have the correct role.
 */
export function RoleGuard({
    children,
    allowedRoles,
    fallback = null,
    redirectTo
}: RoleGuardProps) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated' && redirectTo) {
            router.push(redirectTo);
        }
    }, [status, router, redirectTo]);

    if (status === 'loading') {
        return <div className="p-8 w-full flex justify-center text-gray-500">جاري التحقق من الصلاحيات...</div>;
    }

    const userRole = (session?.user as any)?.role;
    const isAuthorized = userRole && allowedRoles.includes(userRole);

    if (!isAuthorized) {
        if (fallback !== null) return <>{fallback}</>;

        return (
            <div className="p-8 text-center rounded bg-red-50 border border-red-200 m-4">
                <h2 className="text-xl font-bold text-red-700 mb-2">غير مصرح</h2>
                <p className="text-red-600">ليس لديك الصلاحيات الكافية لعرض هذا المحتوى.</p>
            </div>
        );
    }

    return <>{children}</>;
}
