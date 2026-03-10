'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { StudentSideNav } from '@/components/student/StudentSideNav';
import { MobileDrawerNav, NavItem } from '@/components/layout/MobileDrawerNav';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getLocaleFromPathname } from '@/lib/locale-path';

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const t = useTranslations('student.nav');
    const locale = getLocaleFromPathname(pathname);
    const isRTL = locale === 'ar';

    const navItems: NavItem[] = [
        { href: '/student/home', icon: null, label: t('home') },
        { href: '/student/courses', icon: null, label: t('myCourses') },
        { href: '/student/calendar', icon: null, label: t('calendar') },
        { href: '/student/attendance', icon: null, label: t('attendance') },
        { href: '/student/support', icon: null, label: t('support') },
    ];

    return (
        <div className="min-h-screen bg-[var(--color-bg-soft)]">
            {/* Mobile Header */}
            <div className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3">
                <MobileDrawerNav
                    items={navItems}
                    side={isRTL ? 'right' : 'left'}
                    trigger={
                        <button
                            className="flex items-center gap-2 text-slate-700 hover:text-slate-900"
                            aria-label="Toggle navigation menu"
                        >
                            <Menu className="h-6 w-6" />
                            <span className="font-medium">{t('myCourses')}</span>
                        </button>
                    }
                />
            </div>

            <main className="main-with-sidenav">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    {children}
                </div>
            </main>
            <StudentSideNav />
        </div>
    );
}
