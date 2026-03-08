import { TeacherSideNav } from '@/components/teacher/TeacherSideNav';
import { Suspense } from 'react';

// Parent LocaleLayout already provides NextIntlClientProvider + AuthProvider.
// No need to duplicate them here — doing so caused a redundant getMessages()
// async call on every teacher navigation and doubled i18n initialization cost.
export default function TeacherLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-white">
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
