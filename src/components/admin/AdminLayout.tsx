'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    CreditCard,
    MessageSquare,
    FilePen,
    ChartNoAxesColumn,
    Database,
    Settings,
    ChevronLeft,
    Menu,
    X,
    User,
} from 'lucide-react';
import { withLocalePrefix } from '@/lib/locale-path';
import { useLocale } from 'next-intl';

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const locale = useLocale();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    const navGroups = [
        {
            label: 'الأكاديمي',
            icon: <BookOpen className="mr-2 rtl:mr-0 rtl:ml-2 h-4 w-4" />,
            items: [
                { label: 'المواد الدراسية', href: '/dashboard/courses' },
                { label: 'الفئات', href: '/dashboard/categories' },
                { label: 'الفصول', href: '/dashboard/bundles' },
                { label: 'الامتحانات', href: '/dashboard/exams' },
                { label: 'الاختبارات', href: '/dashboard/quizzes' },
            ]
        },
        {
            label: 'الإدارة',
            icon: <Users className="mr-2 rtl:mr-0 rtl:ml-2 h-4 w-4" />,
            items: [
                { label: 'المستخدمون', href: '/dashboard/users' },
                { label: 'الطلبات', href: '/dashboard/applications' },
                { label: 'البيانات المرجعية', href: '/dashboard/lookups' },
            ]
        },
        {
            label: 'المالية',
            icon: <CreditCard className="mr-2 rtl:mr-0 rtl:ml-2 h-4 w-4" />,
            items: [
                { label: 'المدفوعات', href: '/dashboard/payments' },
                { label: 'المصروفات', href: '/dashboard/expenses' },
                { label: 'الكوبونات', href: '/dashboard/coupons' },
                { label: 'البنوك', href: '/dashboard/banks' },
                { label: 'العملات', href: '/dashboard/currencies' },
                { label: 'الرواتب', href: '/dashboard/salaries' },
                { label: 'قسائم الدفع', href: '/dashboard/payslips' },
            ]
        },
        {
            label: 'التواصل',
            icon: <MessageSquare className="mr-2 rtl:mr-0 rtl:ml-2 h-4 w-4" />,
            items: [
                { label: 'الرسائل', href: '/dashboard/messages' },
                { label: 'الإعلانات', href: '/dashboard/announcements' },
            ]
        },
        {
            label: 'المحتوى',
            icon: <FilePen className="mr-2 rtl:mr-0 rtl:ml-2 h-4 w-4" />,
            items: [
                { label: 'إدارة المحتوى', href: '/dashboard/cms' },
                { label: 'الترجمات', href: '/dashboard/translations' },
            ]
        },
        {
            label: 'التحليلات',
            icon: <ChartNoAxesColumn className="mr-2 rtl:mr-0 rtl:ml-2 h-4 w-4" />,
            items: [
                { label: 'التقارير', href: '/dashboard/admin/reports' },
            ]
        },
        {
            label: 'إدارة البيانات',
            icon: <Database className="mr-2 rtl:mr-0 rtl:ml-2 h-4 w-4" />,
            items: [
                { label: 'النسخ الاحتياطي', href: '/dashboard/backup' },
            ]
        }
    ];

    useEffect(() => {
        const newExpanded: Record<string, boolean> = { ...expandedGroups };
        navGroups.forEach(group => {
            const localizedHrefs = group.items.map(i => withLocalePrefix(i.href, locale));
            if (localizedHrefs.some(href => pathname === href || pathname.startsWith(href + '/'))) {
                newExpanded[group.label] = true;
            }
        });
        setExpandedGroups(newExpanded);
    }, [pathname, locale]);

    const toggleGroup = (label: string) => {
        setExpandedGroups(prev => ({ ...prev, [label]: !prev[label] }));
    };

    if (status === 'loading') {
        return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
    }

    const isActive = (href: string) => {
        const localizedHref = withLocalePrefix(href, locale);
        if (href === '/dashboard' || href === '/dashboard/system-settings' || href === '/dashboard/profile') {
            return pathname === localizedHref;
        }
        return pathname.startsWith(localizedHref);
    };

    const navItemClass = (href: string) => `inline-flex items-center gap-2 whitespace-nowrap rounded-3xl text-sm transition-all h-12 px-4 py-2 w-full justify-start text-left font-normal ${isActive(href) ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}`;

    const direction = locale === 'ar' ? 'rtl' : 'ltr';

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900" dir={direction}>
            <div className="flex h-screen overflow-hidden">
                {/* Mobile overlay */}
                {mobileOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <div className={`fixed inset-y-0 ${direction === 'rtl' ? 'right-0' : 'left-0'} z-50 w-64 bg-white dark:bg-gray-950 border-${direction === 'rtl' ? 'l' : 'r'} border-gray-200 dark:border-gray-800 transform ${mobileOpen ? 'translate-x-0' : direction === 'rtl' ? 'translate-x-full' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-200 ease-in-out flex flex-col h-full`}>

                    {/* User Profile Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full cursor-pointer bg-gray-100 dark:bg-gray-800">
                                {session?.user?.image ? (
                                    <img src={session.user.image} alt="Avatar" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="flex h-full w-full items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold">
                                        {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'A'}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate dark:text-white">{session?.user?.name || 'Admin User'}</p>
                                <p className="text-xs text-gray-500 truncate">{session?.user?.email || 'admin@eduverse.com'}</p>
                            </div>
                            <button className="md:hidden p-1 text-gray-500 hover:bg-gray-100 rounded-full" onClick={() => setMobileOpen(false)}>
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Navigation Scroll Area */}
                    <div className="relative overflow-y-auto flex-1 w-full px-3 py-4 scrollbar-hide">
                        <div className="space-y-1">
                            {/* Dashboard Home */}
                            <Link href={withLocalePrefix('/dashboard', locale)} className={navItemClass('/dashboard')} onClick={() => setMobileOpen(false)}>
                                <LayoutDashboard className="mr-2 rtl:mr-0 rtl:ml-2 h-4 w-4" />
                                <span className="w-full rtl:text-right">الرئيسية</span>
                            </Link>

                            {/* Collapsible Groups */}
                            {navGroups.map((group) => {
                                const isExpanded = expandedGroups[group.label] || false;
                                return (
                                    <div key={group.label} className="w-full">
                                        <button
                                            onClick={() => toggleGroup(group.label)}
                                            className="inline-flex items-center gap-2 whitespace-nowrap rounded-3xl text-sm transition-all h-12 px-4 py-2 w-full justify-start text-left font-normal text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                        >
                                            {group.icon}
                                            <span className="w-full rtl:text-right">{group.label}</span>
                                            <ChevronLeft className={`h-4 w-4 transition-transform ${isExpanded ? '-rotate-90' : ''}`} />
                                        </button>

                                        {isExpanded && (
                                            <div className="mt-1 space-y-1 rtl:pr-6 ltr:pl-6">
                                                {group.items.map(item => (
                                                    <Link
                                                        key={item.href}
                                                        href={withLocalePrefix(item.href, locale)}
                                                        className={`block w-full rounded-2xl px-4 py-2 text-sm transition-colors ${isActive(item.href) ? 'text-blue-600 font-medium bg-blue-50 dark:bg-blue-900/30' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'}`}
                                                        onClick={() => setMobileOpen(false)}
                                                    >
                                                        {item.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}

                            <Link href={withLocalePrefix('/dashboard/system-settings', locale)} className={navItemClass('/dashboard/system-settings')} onClick={() => setMobileOpen(false)}>
                                <Settings className="mr-2 rtl:mr-0 rtl:ml-2 h-4 w-4" />
                                <span className="w-full rtl:text-right">الإعدادات</span>
                            </Link>
                        </div>
                    </div>

                    {/* Bottom Profile / Footer Link */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                        <Link href={withLocalePrefix('/dashboard/profile', locale)} className="inline-flex items-center gap-2 whitespace-nowrap rounded-3xl text-sm transition-all h-12 px-4 py-2 w-full justify-start text-left font-normal text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800" onClick={() => setMobileOpen(false)}>
                            <User className="mr-2 rtl:mr-0 rtl:ml-2 h-4 w-4" />
                            <span className="w-full rtl:text-right">الملف الشخصي</span>
                        </Link>
                    </div>
                </div>

                {/* Mobile Header Trigger */}
                <div className="md:hidden fixed top-4 left-4 rtl:left-auto rtl:right-4 z-30">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-3xl text-sm font-semibold transition-all border bg-white shadow-sm hover:bg-gray-100 h-10 w-10 outline-none"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-auto bg-gray-50/50 dark:bg-gray-900 border-l border-r border-transparent">
                    <main className="p-4 md:p-6 pb-20 md:pb-6 min-h-screen">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
