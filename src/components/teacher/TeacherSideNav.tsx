'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Calendar,
    MessageCircle,
    User,
    GraduationCap,
    ClipboardCheck,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getLocaleFromPathname, withLocalePrefix } from '@/lib/locale-path';

interface NavItem {
    href: string;
    icon: React.ReactNode;
    label: string;
}

export const TeacherSideNav = React.memo(function TeacherSideNav() {
    const pathname = usePathname();
    const t = useTranslations('teacher.nav');
    const locale = getLocaleFromPathname(pathname);

    const navItems: NavItem[] = useMemo(() => [
        { href: '/teacher/home', icon: <LayoutDashboard className="w-5 h-5" />, label: t('home') },
        { href: '/teacher/grades', icon: <GraduationCap className="w-5 h-5" />, label: 'My Classes' },
        { href: '/teacher/assessments', icon: <ClipboardCheck className="w-5 h-5" />, label: 'Assessments' },
        { href: '/teacher/calendar', icon: <Calendar className="w-5 h-5" />, label: t('calendar') },
        { href: '/teacher/chat', icon: <MessageCircle className="w-5 h-5" />, label: t('chat') },
        { href: '/teacher/profile', icon: <User className="w-5 h-5" />, label: t('profile') },
    ], [t]);

    return (
        <nav className="side-nav">
            {navItems.map((item) => {
                const localizedHref = withLocalePrefix(item.href, locale);
                const isActive = pathname === localizedHref || pathname?.startsWith(localizedHref + '/');

                return (
                    <Link
                        key={item.href}
                        href={localizedHref}
                        className={`side-nav-item ${isActive ? 'active' : ''}`}
                        prefetch={false}
                    >
                        {item.icon}
                        <span className="text-xs font-medium">{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
});

