'use client';

import { ADMIN_PORTAL_ROLES } from '@/lib/roles';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    LayoutDashboard,
    Calendar,
    Video,
    BookOpen,
    FileQuestion,
    Users,
    GraduationCap,
    DollarSign,
    Coins,
    Ticket,
    FileText,
    MessageSquare,
    Settings,
    ChevronLeft,
    ChevronRight,
    Bell,
    Search,
    Menu,
    X,
    LogOut,
    User,
    UserPlus,
} from 'lucide-react';
import { getLocaleFromPathname, withLocalePrefix } from '@/lib/locale-path';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const t = useTranslations('admin.nav');
    const locale = useLocale();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [pendingEnrollmentsCount, setPendingEnrollmentsCount] = useState(0);

    // Filter nav items based on user role
    // @ts-ignore - role is added to session
    const userRole = session?.user?.role;

    // Fetch pending enrollments count on mount
    useEffect(() => {
        const fetchPendingCount = async () => {
            try {
                const res = await fetch('/api/enrollments?status=pending&limit=1');
                if (res.ok) {
                    const data = await res.json();
                    setPendingEnrollmentsCount(data.total || 0);
                }
            } catch (err) {
                console.error('Failed to fetch pending enrollments count:', err);
            }
        };
        fetchPendingCount();
    }, []);

    const navItems = [
        {
            icon: <LayoutDashboard className="admin-nav-icon" />,
            label: t('dashboard'),
            href: '/admin',
            badge: pendingEnrollmentsCount > 0 ? pendingEnrollmentsCount : undefined,
        },
        {
            icon: <Video className="admin-nav-icon text-indigo-500" />,
            label: 'E2E Flow',
            href: '/e2e-flow',
        },
        {
            icon: <Calendar className="admin-nav-icon" />,
            label: t('calendar'),
            href: '/admin/calendar',
        },
        {
            icon: <Video className="admin-nav-icon" />,
            label: t('live'),
            href: '/admin/live',
            badge: 3,
        },
        {
            icon: <BookOpen className="admin-nav-icon" />,
            label: t('lessons'),
            href: '/admin/lessons',
        },
        {
            icon: <FileQuestion className="admin-nav-icon" />,
            label: t('quizzes'),
            href: '/admin/quizzes-exams',
        },
        {
            icon: <Users className="admin-nav-icon" />,
            label: t('teachers'),
            href: '/admin/teachers',
            roles: ['admin', 'manager'],
        },
        {
            icon: <GraduationCap className="admin-nav-icon" />,
            label: t('students'),
            href: '/admin/students',
        },
        {
            icon: <UserPlus className="admin-nav-icon" />,
            label: 'Enrollments', // Ideally from translation, hardcoded for now
            href: '/admin/enrollment-applications',
            roles: ['admin', 'manager'],
            badge: pendingEnrollmentsCount > 0 ? pendingEnrollmentsCount : undefined,
        },
        {
            icon: <FileText className="admin-nav-icon" />,
            label: 'Enrollment Reports',
            href: '/admin/enrollment-reports',
            roles: ['admin', 'manager', 'finance'],
        },
        {
            icon: <DollarSign className="admin-nav-icon" />,
            label: t('fees'),
            href: '/admin/fees',
            roles: ['admin', 'manager', 'finance'],
        },
        {
            icon: <Ticket className="admin-nav-icon" />,
            label: t('coupons'),
            href: '/admin/coupons-expenses',
            roles: ['admin', 'manager', 'finance'],
        },
        {
            icon: <FileText className="admin-nav-icon" />,
            label: t('content'),
            href: '/admin/content',
        },
        {
            icon: <Coins className="admin-nav-icon" />,
            label: t('currency'),
            href: '/admin/currency-compare',
            roles: ['admin', 'manager', 'finance'],
        },
        {
            icon: <MessageSquare className="admin-nav-icon" />,
            label: t('messages'),
            href: '/admin/messages-audit',
            roles: ['admin'],
        },
        {
            icon: <Settings className="admin-nav-icon" />,
            label: t('settings'),
            href: '/admin/settings',
            roles: ['admin'],
        },
    ];

    // Redirect if not admin
    useEffect(() => {
        if (status === 'loading') return;

        // @ts-ignore - role is added to session
        const role = session?.user?.role;

        if (!session) {
            router.push(withLocalePrefix('/login/admin', locale));
        } else if (role && !ADMIN_PORTAL_ROLES.includes(role)) {
            // Only redirect to dashboard if we definitively know they are NOT in an allowed role
            router.push(withLocalePrefix('/dashboard', locale));
        }
    }, [session, status, router, locale]);


    if (status === 'loading' || !session) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    const filteredNavItems = navItems.filter((item) => {
        if (!item.roles) return true;
        // @ts-ignore
        return item.roles.includes(userRole);
    });

    const isActive = (href: string) => {
        const localizedHref = withLocalePrefix(href, locale);
        if (href === '/admin') return pathname === localizedHref;
        return pathname.startsWith(localizedHref);
    };

    const direction = locale === 'ar' ? 'rtl' : 'ltr';

    return (
        <div className="admin-layout" dir={direction}>
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`admin-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''
                    }`}
            >
                {/* Sidebar Header */}
                <div className="admin-sidebar-header">
                    <Link href={withLocalePrefix('/admin', locale)} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">E</span>
                        </div>
                        {!collapsed && (
                            <span className="font-bold text-lg text-gray-800">
                                Eman ISchool
                            </span>
                        )}
                    </Link>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="admin-btn admin-btn-ghost admin-btn-icon ms-auto hidden lg:flex"
                    >
                        {collapsed ? (
                            <ChevronLeft className="w-5 h-5 rtl:hidden" />
                        ) : (
                            <ChevronLeft className="w-5 h-5 hidden rtl:block" />
                        )}
                        {collapsed ? (
                            <ChevronRight className="w-5 h-5 hidden rtl:block" />
                        ) : (
                            <ChevronRight className="w-5 h-5 rtl:hidden" />
                        )}
                    </button>
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="admin-btn admin-btn-ghost admin-btn-icon lg:hidden"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="admin-sidebar-nav">
                    {filteredNavItems.map((item) => (
                        <Link
                            key={item.href}
                            href={withLocalePrefix(item.href, locale)}
                            className={`admin-nav-item ${isActive(item.href) ? 'active' : ''}`}
                            onClick={() => setMobileOpen(false)}
                        >
                            {item.icon}
                            <span className="admin-nav-label">{item.label}</span>
                            {item.badge && (
                                <span className="admin-nav-badge">{item.badge}</span>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div className="admin-sidebar-footer">
                    <div className="flex items-center gap-3 p-2">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {session?.user?.image ? (
                                <img
                                    src={session.user.image}
                                    alt={session.user.name || ''}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="w-5 h-5 text-gray-500" />
                            )}
                        </div>
                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">
                                    {session?.user?.name || 'Admin'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {userRole === 'admin' ? 'Admin' : userRole === 'teacher' ? 'Teacher' : 'Manager'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                {/* Top Bar */}
                <header className="admin-topbar">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="admin-btn admin-btn-ghost admin-btn-icon lg:hidden"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="relative hidden md:block">
                            <input
                                type="text"
                                placeholder={locale === 'ar' ? 'بحث...' : 'Search...'}
                                className="admin-input admin-search-input w-64"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="admin-btn admin-btn-ghost admin-btn-icon relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                5
                            </span>
                        </button>
                        <Link
                            href="/api/auth/signout"
                            className="admin-btn admin-btn-ghost admin-btn-icon"
                        >
                            <LogOut className="w-5 h-5" />
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <div className="admin-content">{children}</div>
            </main>
        </div>
    );
}
