'use client';

import { useTranslations } from 'next-intl';
import { MobileDrawerNav, NavItem } from '@/components/layout/MobileDrawerNav';
import { Menu } from 'lucide-react';

export function TeacherMobileNav() {
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
