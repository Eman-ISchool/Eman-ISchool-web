'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';

interface AccessDeniedProps {
    locale?: string;
}

export function AccessDenied({ locale = 'en' }: AccessDeniedProps) {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.push(`/${locale}/teacher/courses`);
        }, 2000);

        return () => clearTimeout(timer);
    }, [router, locale]);

    return (
        <div className="flex min-h-[400px] items-center justify-center p-8">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                    <ShieldAlert className="h-8 w-8 text-red-500" />
                </div>
                
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Access Denied
                    </h1>
                    <p className="text-gray-600">
                        You don't have permission to access this course.
                    </p>
                    <p className="text-sm text-gray-500">
                        Redirecting you to your courses page in 2 seconds...
                    </p>
                </div>
            </div>
        </div>
    );
}
