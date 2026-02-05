'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, MessageCircle, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getLocaleFromPathname, withLocalePrefix } from '@/lib/locale-path';

interface NavItem {
    href: string;
    icon: React.ReactNode;
    label: string;
}

export function TeacherSideNav() {
    const pathname = usePathname();
    const t = useTranslations('teacher.nav');
    const locale = getLocaleFromPathname(pathname);

    const navItems: NavItem[] = [
        { href: '/teacher/home', icon: <Home className="w-5 h-5" />, label: t('home') },
        { href: '/teacher/calendar', icon: <Calendar className="w-5 h-5" />, label: t('calendar') },
        { href: '/teacher/chat', icon: <MessageCircle className="w-5 h-5" />, label: t('chat') },
        { href: '/teacher/profile', icon: <User className="w-5 h-5" />, label: t('profile') },
    ];

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
                    >
                        {item.icon}
                        <span className="text-xs font-medium">{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
