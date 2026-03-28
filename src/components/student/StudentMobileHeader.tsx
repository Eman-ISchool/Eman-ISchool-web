'use client';

import { Menu } from 'lucide-react';
import { MobileDrawerNav, NavItem } from '@/components/layout/MobileDrawerNav';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getLocaleFromPathname } from '@/lib/locale-path';

export function StudentMobileHeader() {
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
    );
}
