'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { defaultLocale } from '@/i18n/config';

export default function VRTestRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace(`/${defaultLocale}/vr-test`);
    }, [router]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                <p className="text-lg text-gray-600">جاري التحويل...</p>
            </div>
        </div>
    );
}
