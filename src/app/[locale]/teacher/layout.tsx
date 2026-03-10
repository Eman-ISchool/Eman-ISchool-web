import { TeacherSideNav } from '@/components/teacher/TeacherSideNav';
import { MobileDrawerNav, NavItem } from '@/components/layout/MobileDrawerNav';
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isTeacherOrAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';
import { Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';

// Parent LocaleLayout already provides NextIntlClientProvider + AuthProvider.
// No need to duplicate them here — doing so caused a redundant getMessages()
// async call on every teacher navigation and doubled i18n initialization cost.

function TeacherMobileNav() {
    const t = useTranslations('teacher.nav');
    const navItems: NavItem[] = [
        { href: '/teacher/home', icon: null, label: t('home') },
        { href: '/teacher/courses', icon: null, label: t('courses') },
        { href: '/teacher/calendar', icon: null, label: t('calendar') },
        { href: '/teacher/chat', icon: null, label: t('chat') },
        { href: '/teacher/profile', icon: null, label: t('profile') },
    ];

    return (
        <div className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3">
            <MobileDrawerNav
                items={navItems}
                side="right"
                trigger={
                    <button
                        className="flex items-center gap-2 text-slate-700 hover:text-slate-900"
                        aria-label="Toggle navigation menu"
                    >
                        <Menu className="h-6 w-6" />
                        <span className="font-medium">{t('home')}</span>
                    </button>
                }
            />
        </div>
    );
}

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
