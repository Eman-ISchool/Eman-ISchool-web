'use client';

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
} from 'lucide-react';
import '@/app/admin/admin.css';

interface NavItem {
    icon: ReactNode;
    label: string;
    labelAr: string;
    href: string;
    badge?: number;
    roles?: string[];
}

const navItems: NavItem[] = [
    {
        icon: <LayoutDashboard className="admin-nav-icon" />,
        label: 'Dashboard',
        labelAr: 'لوحة التحكم',
        href: '/admin',
    },
    {
        icon: <Calendar className="admin-nav-icon" />,
        label: 'Calendar',
        labelAr: 'التقويم والمواعيد',
        href: '/admin/calendar',
    },
    {
        icon: <Video className="admin-nav-icon" />,
        label: 'Live Sessions',
        labelAr: 'الجلسات المباشرة',
        href: '/admin/live',
        badge: 3,
    },
    {
        icon: <BookOpen className="admin-nav-icon" />,
        label: 'Lessons',
        labelAr: 'الدروس',
        href: '/admin/lessons',
    },
    {
        icon: <FileQuestion className="admin-nav-icon" />,
        label: 'Quizzes & Exams',
        labelAr: 'الاختبارات',
        href: '/admin/quizzes-exams',
    },
    {
        icon: <Users className="admin-nav-icon" />,
        label: 'Teachers',
        labelAr: 'المعلمون',
        href: '/admin/teachers',
        roles: ['admin', 'manager'],
    },
    {
        icon: <GraduationCap className="admin-nav-icon" />,
        label: 'Students',
        labelAr: 'الطلاب',
        href: '/admin/students',
    },
    {
        icon: <DollarSign className="admin-nav-icon" />,
        label: 'Fees',
        labelAr: 'الرسوم',
        href: '/admin/fees',
        roles: ['admin', 'manager', 'finance'],
    },
    {
        icon: <Ticket className="admin-nav-icon" />,
        label: 'Coupons & Expenses',
        labelAr: 'الكوبونات والمصروفات',
        href: '/admin/coupons-expenses',
        roles: ['admin', 'manager', 'finance'],
    },
    {
        icon: <FileText className="admin-nav-icon" />,
        label: 'Content',
        labelAr: 'المحتوى',
        href: '/admin/content',
    },
    {
        icon: <Coins className="admin-nav-icon" />,
        label: 'Currency Compare',
        labelAr: 'مقارنة العملات',
        href: '/admin/currency-compare',
        roles: ['admin', 'manager', 'finance'],
    },
    {
        icon: <MessageSquare className="admin-nav-icon" />,
        label: 'Messages & Audit',
        labelAr: 'الرسائل والسجلات',
        href: '/admin/messages-audit',
        roles: ['admin'],
    },
    {
        icon: <Settings className="admin-nav-icon" />,
        label: 'Settings',
        labelAr: 'الإعدادات',
        href: '/admin/settings',
        roles: ['admin'],
    },
];

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Redirect if not admin
    useEffect(() => {
        if (status === 'loading') return;

        // @ts-ignore - role is added to session
        const role = session?.user?.role;

        if (!session || role !== 'admin') {
            router.push('/');
        }
    }, [session, status, router]);

    // @ts-ignore - role is added to session
    const userRole = session?.user?.role;

    if (status === 'loading' || !session) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    // Filter nav items based on user role
    const filteredNavItems = navItems.filter((item) => {
        if (!item.roles) return true;
        return item.roles.includes(userRole);
    });

    const isActive = (href: string) => {
        if (href === '/admin') return pathname === '/admin';
        return pathname.startsWith(href);
    };

    return (
        <div className="admin-layout" dir="rtl">
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
                    <Link href="/admin" className="flex items-center gap-3">
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
                        className="admin-btn admin-btn-ghost admin-btn-icon mr-auto hidden lg:flex"
                    >
                        {collapsed ? (
                            <ChevronLeft className="w-5 h-5" />
                        ) : (
                            <ChevronRight className="w-5 h-5" />
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
                            href={item.href}
                            className={`admin-nav-item ${isActive(item.href) ? 'active' : ''}`}
                            onClick={() => setMobileOpen(false)}
                        >
                            {item.icon}
                            <span className="admin-nav-label">{item.labelAr}</span>
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
                                    {session?.user?.name || 'مدير'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {userRole === 'admin' ? 'مدير' : userRole === 'teacher' ? 'معلم' : 'مدير'}
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
                                placeholder="بحث..."
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
