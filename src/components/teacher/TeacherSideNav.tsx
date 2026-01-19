'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, MessageCircle, User } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface NavItem {
    href: string;
    icon: React.ReactNode;
    label: string;
}

export function TeacherSideNav() {
    const pathname = usePathname();
    const { t } = useLanguage();

    const navItems: NavItem[] = [
        { href: '/teacher/home', icon: <Home className="w-5 h-5" />, label: t('nav.home') },
        { href: '/teacher/calendar', icon: <Calendar className="w-5 h-5" />, label: t('nav.calendar') },
        { href: '/teacher/chat', icon: <MessageCircle className="w-5 h-5" />, label: t('nav.chat') },
        { href: '/teacher/profile', icon: <User className="w-5 h-5" />, label: t('nav.profile') },
    ];

    return (
        <nav className="side-nav">
            {navItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

                return (
                    <Link
                        key={item.href}
                        href={item.href}
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
