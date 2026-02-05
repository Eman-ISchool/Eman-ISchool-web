'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, MessageCircle, User, Film } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { getLocaleFromPathname, withLocalePrefix } from '@/lib/locale-path';

interface NavItem {
    href: string;
    icon: React.ReactNode;
    label: string;
}

export function SideNav() {
    const pathname = usePathname();
    const { t } = useLanguage();
    const locale = getLocaleFromPathname(pathname);

    const navItems: NavItem[] = [
        { href: '/student/home', icon: <Home className="w-5 h-5" />, label: t('nav.home') },
        { href: '/student/reels', icon: <Film className="w-5 h-5" />, label: t('nav.reels') },
        { href: '/student/calendar', icon: <Calendar className="w-5 h-5" />, label: t('nav.calendar') },
        { href: '/student/chat', icon: <MessageCircle className="w-5 h-5" />, label: t('nav.chat') },
        { href: '/student/profile', icon: <User className="w-5 h-5" />, label: t('nav.profile') },
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
