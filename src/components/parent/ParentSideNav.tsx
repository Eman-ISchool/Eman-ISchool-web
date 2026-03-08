'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, School, CreditCard, Settings, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getLocaleFromPathname, withLocalePrefix } from '@/lib/locale-path';

interface NavItem {
    href: string;
    icon: React.ReactNode;
    label: string;
}

export function ParentSideNav() {
    const pathname = usePathname();
    const t = useTranslations('parent.nav');
    const locale = getLocaleFromPathname(pathname);

    const navItems: NavItem[] = [
        { href: '/parent/home', icon: <Home className="w-5 h-5" />, label: t('home') },
        { href: '/parent/students', icon: <Users className="w-5 h-5" />, label: t('students') },
        { href: '/courses', icon: <Search className="w-5 h-5" />, label: t('browse') },
        { href: '/parent/enrollments', icon: <School className="w-5 h-5" />, label: t('enrollments') },
        { href: '/parent/payments', icon: <CreditCard className="w-5 h-5" />, label: t('payments') },
        { href: '/parent/settings', icon: <Settings className="w-5 h-5" />, label: t('settings') },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:border-t-0 md:bg-transparent md:static md:block z-50 md:z-auto p-2 md:p-0 flex md:flex-col justify-around md:justify-start gap-1 md:gap-2 shadow-lg md:shadow-none side-nav">
            {/* Note: styles for side-nav might need adjustment if they are teacher-specific. 
                 Assuming a global or similar CSS class 'side-nav' exists. 
                 If not, I might need to implement the styles directly. 
                 Based on teacher/layout.tsx, it uses 'side-nav'. */}
            {navItems.map((item) => {
                // Ensure double slashes are avoided
                const localizedHref = withLocalePrefix(item.href, locale);
                const isActive = pathname === localizedHref || pathname?.startsWith(item.href === '/parent/home' ? localizedHref + '$' : localizedHref + '/');

                return (
                    <Link
                        key={item.href}
                        href={localizedHref}
                        className={`flex flex-col md:flex-row items-center md:gap-3 p-2 rounded-lg transition-colors
                            ${isActive
                                ? 'text-brand-primary bg-brand-primary/10 font-bold'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                    >
                        {item.icon}
                        <span className="text-[10px] md:text-sm font-medium">{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
