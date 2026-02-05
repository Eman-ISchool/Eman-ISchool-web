'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import {
    Users,
    BookOpen,
    GraduationCap,
    Calendar,
    TrendingUp,
    Video,
    MessageSquare,
    FileQuestion,
    CheckCircle,
    Sparkles,
} from 'lucide-react';

// Components
import KPIStatCard from '@/components/admin/KPIStatCard';
import AttendanceWidget from '@/components/admin/widgets/AttendanceWidget';
import TodaySessionsWidget from '@/components/admin/widgets/TodaySessionsWidget';
import PendingActionsWidget from '@/components/admin/widgets/PendingActionsWidget';
import QuickActionsBar from '@/components/admin/widgets/QuickActionsBar';
import InstantChatbotWidget from '@/components/admin/widgets/InstantChatbotWidget';
import { LoadingState, ErrorState, CardSkeleton } from '@/components/admin/StateComponents';
import { getLocaleFromPathname, withLocalePrefix } from '@/lib/locale-path';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

interface DashboardStats {
    users: {
        total: number;
        students: number;
        teachers: number;
        admins: number;
        growth: number;
    };
    courses: {
        total: number;
        published: number;
    };
    lessons: {
        total: number;
        upcoming: number;
        completed: number;
        today: any[];
        thisWeek: number;
    };
    enrollments: {
        active: number;
    };
    attendance: {
        total: number;
        present: number;
        absent: number;
        late: number;
        rate: number;
    };
}

export default function AdminDashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const t = useTranslations('admin.dashboard');
    const tNav = useTranslations('admin.nav');
    const locale = useLocale();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'loading') return;

        // @ts-ignore
        if (!session?.user?.role || session.user.role !== 'admin') {
            router.push(withLocalePrefix('/login/admin', locale));
            return;
        }

        fetchStats();
    }, [session, status, router, locale]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/stats');
            if (!res.ok) throw new Error('Failed to fetch stats');
            const data = await res.json();
            setStats(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Transform lessons to sessions format for widget
    const todaySessions = stats?.lessons.today?.map((lesson: any) => ({
        id: lesson.id,
        title: lesson.title,
        teacherName: lesson.teacher?.name || (locale === 'ar' ? 'معلم غير محدد' : 'Unknown Teacher'),
        time: new Date(lesson.start_date_time).toLocaleTimeString(locale === 'ar' ? 'ar-EG' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit',
        }),
        status: lesson.status === 'live' ? 'live' as const :
            lesson.status === 'completed' ? 'completed' as const :
                'upcoming' as const,
        meetLink: lesson.meet_link,
    })) || [];

    // Pending actions data
    const pendingActions = [
        {
            type: 'unpaid_fees' as const,
            count: 12, // TODO: Get from API
            label: tNav('fees'),
            href: withLocalePrefix('/admin/fees?filter=unpaid', locale),
        },
        {
            type: 'missing_conclusions' as const,
            count: 5,
            label: tNav('lessons'),
            href: withLocalePrefix('/admin/lessons?filter=no-conclusion', locale),
        },
        {
            type: 'overdue_grading' as const,
            count: 8,
            label: tNav('quizzes'),
            href: withLocalePrefix('/admin/quizzes-exams?filter=ungraded', locale),
        },
        {
            type: 'unassigned_teachers' as const,
            count: 3,
            label: tNav('teachers'),
            href: withLocalePrefix('/admin/lessons?filter=unassigned', locale),
        },
    ];

    const managementLinks = [
        {
            title: t('stats.students'),
            description: t('highlights.liveDesc'),
            href: withLocalePrefix('/admin/attendance', locale),
            icon: <CheckCircle className="w-5 h-5 text-teal-500" />,
        },
        {
            title: t('stats.teachers'),
            description: t('highlights.groupsDesc'),
            href: withLocalePrefix('/admin/teachers', locale),
            icon: <Users className="w-5 h-5 text-purple-500" />,
        },
        {
            title: tNav('messages'),
            description: t('highlights.platformDesc'),
            href: withLocalePrefix('/admin/messages-audit', locale),
            icon: <MessageSquare className="w-5 h-5 text-blue-500" />,
        },
        {
            title: tNav('quizzes'),
            description: t('highlights.bankDesc'),
            href: withLocalePrefix('/admin/quizzes-exams', locale),
            icon: <FileQuestion className="w-5 h-5 text-orange-500" />,
        },
    ];

    const platformHighlights = [
        {
            title: t('links.live'),
            description: t('highlights.liveDesc'),
            href: withLocalePrefix('/admin/live', locale),
            icon: <Video className="w-5 h-5 text-red-500" />,
        },
        {
            title: t('links.calendar'),
            description: t('highlights.calendarDesc'),
            href: withLocalePrefix('/admin/calendar', locale),
            icon: <Calendar className="w-5 h-5 text-teal-500" />,
        },
        {
            title: t('links.platform'),
            description: t('highlights.platformDesc'),
            href: withLocalePrefix('/admin/content', locale),
            icon: <Sparkles className="w-5 h-5 text-amber-500" />,
        },
        {
            title: t('links.recordings'),
            description: t('highlights.recordingsDesc'),
            href: withLocalePrefix('/admin/lessons', locale),
            icon: <BookOpen className="w-5 h-5 text-indigo-500" />,
        },
        {
            title: t('links.bank'),
            description: t('highlights.bankDesc'),
            href: withLocalePrefix('/admin/quizzes-exams', locale),
            icon: <FileQuestion className="w-5 h-5 text-orange-500" />,
        },
        {
            title: t('links.homework'),
            description: t('highlights.homeworkDesc'),
            href: withLocalePrefix('/admin/lessons', locale),
            icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
        },
        {
            title: t('links.parent'),
            description: t('highlights.parentDesc'),
            href: withLocalePrefix('/admin/users', locale),
            icon: <Users className="w-5 h-5 text-sky-500" />,
        },
    ];

    if (status === 'loading') {
        return <LoadingState message={locale === 'ar' ? "جاري تحميل لوحة التحكم..." : "Loading dashboard..."} />;
    }

    if (error) {
        return <ErrorState message={error} onRetry={fetchStats} />;
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{t('title')}</h1>
                    <p className="text-gray-500">
                        {t('welcome', { name: session?.user?.name })}
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {new Date().toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </div>
            </div>

            {/* Quick Actions */}
            <QuickActionsBar />

            {/* Management Links */}
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {managementLinks.map((link) => (
                    <Link
                        key={link.title}
                        href={link.href}
                        className="admin-card p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
                            {link.icon}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800">{link.title}</p>
                            <p className="text-sm text-gray-500 truncate">{link.description}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {loading ? (
                    <>
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                    </>
                ) : (
                    <>
                        <KPIStatCard
                            title={t('stats.students')}
                            value={stats?.users.students || 0}
                            icon={<GraduationCap className="w-6 h-6 text-white" />}
                            variant="blue"
                            href={withLocalePrefix('/admin/students', locale)}
                            trend={{
                                value: stats?.users.growth || 0,
                                label: t('stats.growth'),
                                isPositive: (stats?.users.growth || 0) > 0,
                            }}
                        />
                        <KPIStatCard
                            title={t('stats.teachers')}
                            value={stats?.users.teachers || 0}
                            icon={<Users className="w-6 h-6 text-white" />}
                            variant="teal"
                            href={withLocalePrefix('/admin/teachers', locale)}
                        />
                        <KPIStatCard
                            title={t('stats.activeCourses')}
                            value={stats?.courses.published || 0}
                            icon={<BookOpen className="w-6 h-6 text-white" />}
                            variant="purple"
                            href={withLocalePrefix('/admin/lessons', locale)}
                            trend={{
                                value: stats?.courses.total ? Math.round((stats.courses.published / stats.courses.total) * 100) : 0,
                                label: t('stats.published'),
                                isPositive: true,
                            }}
                        />
                        <KPIStatCard
                            title={t('stats.lessonsThisWeek')}
                            value={stats?.lessons.thisWeek || 0}
                            icon={<Calendar className="w-6 h-6 text-white" />}
                            variant="orange"
                            href={withLocalePrefix('/admin/calendar', locale)}
                            trend={{
                                value: stats?.lessons.upcoming || 0,
                                label: t('stats.upcoming'),
                                isPositive: true,
                            }}
                        />
                    </>
                )}
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Sessions & Pending */}
                <div className="lg:col-span-2 space-y-6">
                    <TodaySessionsWidget sessions={todaySessions} />
                    <PendingActionsWidget actions={pendingActions} />
                </div>

                {/* Right Column - Attendance */}
                <div className="space-y-6">
                    <AttendanceWidget
                        data={{
                            present: stats?.attendance.present || 0,
                            absent: stats?.attendance.absent || 0,
                            late: stats?.attendance.late || 0,
                            rate: stats?.attendance.rate || 0,
                        }}
                        href={withLocalePrefix('/admin/attendance', locale)}
                    />

                    {/* Recent Activity Card */}
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h3 className="admin-card-title">
                                <TrendingUp className="w-5 h-5 text-teal-500" />
                                {t('recentActivity')}
                            </h3>
                        </div>
                        <div className="admin-card-body">
                            <div className="space-y-4">
                                {[
                                    { action: t('widgets.todaySessions'), time: '5m', type: 'success', href: withLocalePrefix('/admin/students', locale) },
                                    { action: t('widgets.pendingActions'), time: '15m', type: 'info', href: withLocalePrefix('/admin/lessons', locale) },
                                    { action: tNav('fees'), time: '1h', type: 'warning', href: withLocalePrefix('/admin/fees', locale) },
                                ].map((activity, index) => (
                                    <Link
                                        key={index}
                                        href={activity.href}
                                        className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                                    >
                                        <div className={`w-2 h-2 rounded-full ${activity.type === 'success' ? 'bg-green-500' :
                                            activity.type === 'info' ? 'bg-blue-500' : 'bg-yellow-500'
                                            }`} />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-700">{activity.action}</p>
                                            <p className="text-xs text-gray-400">{activity.time}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    <InstantChatbotWidget />
                </div>
            </div>

            {/* Eduverse Highlights */}
            <div className="admin-card">
                <div className="admin-card-header">
                    <h3 className="admin-card-title">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        {t('highlights.title')}
                    </h3>
                </div>
                <div className="admin-card-body space-y-4">
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {platformHighlights.map((item) => (
                            <Link
                                key={item.title}
                                href={item.href}
                                className="p-4 rounded-xl border border-gray-100 bg-white hover:shadow-md transition-shadow flex items-start gap-3"
                            >
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{item.title}</p>
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className="p-4 rounded-xl bg-teal-50 border border-teal-100 flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-teal-700">{t('highlights.groupsTitle')}</p>
                            <p className="text-sm text-teal-600">
                                {t('highlights.groupsDesc')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
