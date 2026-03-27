'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Calendar, UserCheck, HelpCircle, ClipboardCheck, ClipboardList, FolderOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getLocaleFromPathname, withLocalePrefix } from '@/lib/locale-path';

interface NavItem {
    href: string;
    icon: React.ReactNode;
    label: string;
}

export function StudentSideNav() {
    const pathname = usePathname();
    const t = useTranslations('student.nav');
    const locale = getLocaleFromPathname(pathname);

    const navItems: NavItem[] = [
        { href: '/student/home', icon: <Home className="w-5 h-5" />, label: t('home') },
        { href: '/student/onboarding', icon: <ClipboardList className="w-5 h-5" />, label: 'Onboarding' },
        { href: '/e2e-flow', icon: <BookOpen className="w-5 h-5 text-indigo-500" />, label: 'E2E Flow' },
        { href: '/student/courses', icon: <BookOpen className="w-5 h-5" />, label: t('myCourses') },
        { href: '/student/assessments', icon: <ClipboardCheck className="w-5 h-5" />, label: 'Assessments' },
        { href: '/student/documents', icon: <FolderOpen className="w-5 h-5" />, label: 'Documents' },
        { href: '/student/calendar', icon: <Calendar className="w-5 h-5" />, label: t('calendar') },
        { href: '/student/attendance', icon: <UserCheck className="w-5 h-5" />, label: t('attendance') },
        { href: '/student/support', icon: <HelpCircle className="w-5 h-5" />, label: t('support') },
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
