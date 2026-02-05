'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { defaultLocale } from '@/i18n/config';

/**
 * Root page redirect handler for static export.
 * 
 * When using `output: 'export'` in Next.js, middleware is disabled.
 * This page serves as a client-side redirect from the root path `/`
 * to the default locale path `/${defaultLocale}`.
 * 
 * This ensures that users accessing the root URL are automatically
 * redirected to the correct localized path.
 */
export default function RootRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the default locale path
        router.replace(`/${defaultLocale}`);
    }, [router]);

    // Show a loading message while redirecting
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                <p className="text-lg text-gray-600">جاري التحميل...</p>
            </div>
        </div>
    );
}
