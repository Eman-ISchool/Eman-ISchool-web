'use client';

import { ADMIN_PORTAL_ROLES } from '@/lib/roles';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
    ChevronRight,
} from 'lucide-react';

import dynamic from 'next/dynamic';
import { LoadingState, ErrorState, CardSkeleton } from '@/components/admin/StateComponents';

const KPIStatCard = dynamic(() => import('@/components/admin/KPIStatCard'), { ssr: false, loading: () => <CardSkeleton /> });
const AttendanceWidget = dynamic(() => import('@/components/admin/widgets/AttendanceWidget'), { ssr: false });
const TodaySessionsWidget = dynamic(() => import('@/components/admin/widgets/TodaySessionsWidget'), { ssr: false });
const PendingActionsWidget = dynamic(() => import('@/components/admin/widgets/PendingActionsWidget'), { ssr: false });
const PendingEnrollmentsWidget = dynamic(() => import('@/components/admin/widgets/PendingEnrollmentsWidget'), { ssr: false });
const QuickActionsBar = dynamic(() => import('@/components/admin/widgets/QuickActionsBar'), { ssr: false });
const InstantChatbotWidget = dynamic(() => import('@/components/admin/widgets/InstantChatbotWidget'), { ssr: false });
import { withLocalePrefix } from '@/lib/locale-path';
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
        pending: number;
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
    const t = useTranslations('admin.dashboard');
    const tNav = useTranslations('admin.nav');
    const locale = useLocale();
    const isArabic = locale === 'ar';
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'loading') return;

        // @ts-ignore
        if (!session?.user?.role || !ADMIN_PORTAL_ROLES.includes(session.user.role)) {
            router.push(withLocalePrefix('/login/admin', locale));
            return;
        }

        fetchStats();
    }, [session, status, router, locale]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/stats');
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to fetch stats');
            }
            const data = await res.json();
            setStats(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const greeting = () => {
        const hour = new Date().getHours();
        if (isArabic) {
            if (hour < 12) return 'صباح الخير';
            if (hour < 17) return 'طاب يومك';
            return 'مساء الخير';
        }
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const todaySessions = useMemo(() => stats?.lessons.today?.map((lesson: any) => ({
        id: lesson.id,
        title: lesson.title,
        teacherName: lesson.teacher?.name || (isArabic ? 'معلم غير محدد' : 'Unknown Teacher'),
        time: new Date(lesson.start_date_time).toLocaleTimeString(isArabic ? 'ar-EG' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit',
        }),
        status: lesson.status === 'live' ? 'live' as const :
            lesson.status === 'completed' ? 'completed' as const :
                'upcoming' as const,
        meetLink: lesson.meet_link,
    })) || [], [stats?.lessons.today, isArabic]);

    const pendingActions = useMemo(() => [
        {
            type: 'pending_enrollments' as const,
            count: stats?.enrollments?.pending || 0,
            label: isArabic ? 'تسجيلات معلقة' : 'Pending Enrollments',
            href: withLocalePrefix('/admin/home?tab=enrollments', locale),
        },
        {
            type: 'unpaid_fees' as const,
            count: 12,
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
    ], [stats?.enrollments?.pending, locale, tNav, isArabic]);

    const managementLinks = useMemo(() => [
        {
            title: t('stats.students'),
            description: t('highlights.liveDesc'),
            href: withLocalePrefix('/admin/attendance', locale),
            icon: <CheckCircle className="w-5 h-5 text-teal-600" />,
            bg: 'bg-teal-50',
        },
        {
            title: t('stats.teachers'),
            description: t('highlights.groupsDesc'),
            href: withLocalePrefix('/admin/teachers', locale),
            icon: <Users className="w-5 h-5 text-purple-600" />,
            bg: 'bg-purple-50',
        },
        {
            title: tNav('messages'),
            description: t('highlights.platformDesc'),
            href: withLocalePrefix('/admin/messages-audit', locale),
            icon: <MessageSquare className="w-5 h-5 text-blue-600" />,
            bg: 'bg-blue-50',
        },
        {
            title: tNav('quizzes'),
            description: t('highlights.bankDesc'),
            href: withLocalePrefix('/admin/quizzes-exams', locale),
            icon: <FileQuestion className="w-5 h-5 text-orange-600" />,
            bg: 'bg-orange-50',
        },
    ], [t, tNav, locale]);

    const platformHighlights = useMemo(() => [
        {
            title: t('links.live'),
            description: t('highlights.liveDesc'),
            href: withLocalePrefix('/admin/live', locale),
            icon: <Video className="w-5 h-5 text-red-500" />,
            border: 'border-l-red-400',
            bg: 'bg-red-50',
        },
        {
            title: t('links.calendar'),
            description: t('highlights.calendarDesc'),
            href: withLocalePrefix('/admin/calendar', locale),
            icon: <Calendar className="w-5 h-5 text-teal-500" />,
            border: 'border-l-teal-400',
            bg: 'bg-teal-50',
        },
        {
            title: t('links.platform'),
            description: t('highlights.platformDesc'),
            href: withLocalePrefix('/admin/content', locale),
            icon: <Sparkles className="w-5 h-5 text-amber-500" />,
            border: 'border-l-amber-400',
            bg: 'bg-amber-50',
        },
        {
            title: t('links.recordings'),
            description: t('highlights.recordingsDesc'),
            href: withLocalePrefix('/admin/lessons', locale),
            icon: <BookOpen className="w-5 h-5 text-indigo-500" />,
            border: 'border-l-indigo-400',
            bg: 'bg-indigo-50',
        },
        {
            title: t('links.bank'),
            description: t('highlights.bankDesc'),
            href: withLocalePrefix('/admin/quizzes-exams', locale),
            icon: <FileQuestion className="w-5 h-5 text-orange-500" />,
            border: 'border-l-orange-400',
            bg: 'bg-orange-50',
        },
        {
            title: t('links.homework'),
            description: t('highlights.homeworkDesc'),
            href: withLocalePrefix('/admin/lessons', locale),
            icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
            border: 'border-l-emerald-400',
            bg: 'bg-emerald-50',
        },
        {
            title: t('links.parent'),
            description: t('highlights.parentDesc'),
            href: withLocalePrefix('/admin/users', locale),
            icon: <Users className="w-5 h-5 text-sky-500" />,
            border: 'border-l-sky-400',
            bg: 'bg-sky-50',
        },
    ], [t, locale]);

    if (status === 'loading') {
        return <LoadingState message={isArabic ? 'جاري تحميل لوحة التحكم...' : 'Loading dashboard...'} />;
    }

    if (error) {
        return <ErrorState message={error} onRetry={fetchStats} />;
    }

    return (
        <div className={`space-y-6 ${isArabic ? 'rtl' : 'ltr'}`}>

            {/* ── Admin Hero Banner ─────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-teal-700 via-teal-600 to-emerald-500 px-8 py-6 text-white shadow-xl shadow-teal-200/50">
                {/* Decorative orbs */}
                <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10" />
                <div className="pointer-events-none absolute -bottom-6 left-1/3 h-24 w-24 rounded-full bg-emerald-400/20" />
                <div className="pointer-events-none absolute top-1/2 right-1/4 h-14 w-14 rounded-full bg-teal-300/15" />

                <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    {/* Left: Greeting + name */}
                    <div>
                        <p className="text-teal-100 text-sm font-medium tracking-wide">{greeting()}</p>
                        <h1 className="text-2xl font-extrabold mt-0.5 leading-tight">
                            {session?.user?.name || (isArabic ? 'المدير' : 'Admin')}
                        </h1>
                        <p className="text-teal-200 text-sm mt-1">{t('title')}</p>
                    </div>

                    {/* Right: Date + platform status */}
                    <div className="flex flex-col items-start md:items-end gap-2">
                        <div className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 backdrop-blur-sm">
                            <Calendar className="h-4 w-4 text-teal-100 shrink-0" />
                            <span className="text-sm font-medium text-white">
                                {new Date().toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-full bg-emerald-400/30 px-3 py-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                            <span className="text-xs font-semibold text-emerald-100">
                                {isArabic ? 'المنصة نشطة' : 'Platform Active'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Live stat pills — shown once data loads */}
                {!loading && stats && (
                    <div className="relative mt-5 flex flex-wrap gap-2">
                        {[
                            { label: isArabic ? 'طالب' : 'Students', value: stats.users.students },
                            { label: isArabic ? 'معلم' : 'Teachers', value: stats.users.teachers },
                            { label: isArabic ? 'جلسات اليوم' : "Today's Sessions", value: todaySessions.length },
                            {
                                label: isArabic ? 'تسجيلات معلقة' : 'Pending',
                                value: stats.enrollments.pending,
                                highlight: stats.enrollments.pending > 0,
                            },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className={`flex items-center gap-2 rounded-xl px-4 py-2 ${
                                    stat.highlight ? 'bg-amber-400/30' : 'bg-white/15'
                                } backdrop-blur-sm`}
                            >
                                <span className="text-lg font-extrabold leading-none text-white">
                                    {stat.value}
                                </span>
                                <span className="text-xs font-medium text-teal-100">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Loading shimmer pills */}
                {loading && (
                    <div className="relative mt-5 flex gap-2">
                        {[80, 72, 96, 88].map((w) => (
                            <div
                                key={w}
                                className="h-9 animate-pulse rounded-xl bg-white/15"
                                style={{ width: w }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Quick Actions ─────────────────────────────────────── */}
            <QuickActionsBar />

            {/* ── Management Links ──────────────────────────────────── */}
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {managementLinks.map((link) => (
                    <Link
                        key={link.title}
                        href={link.href}
                        className="admin-card group flex items-center gap-4 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${link.bg}`}>
                            {link.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-800 truncate">{link.title}</p>
                            <p className="text-xs text-gray-400 truncate">{link.description}</p>
                        </div>
                        <ChevronRight className={`h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 ${isArabic ? 'rotate-180' : ''}`} />
                    </Link>
                ))}
            </div>

            {/* ── KPI Cards ─────────────────────────────────────────── */}
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

            {/* ── Main Dashboard Grid ───────────────────────────────── */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left: Sessions + Pending */}
                <div className="lg:col-span-2 space-y-6">
                    <TodaySessionsWidget sessions={todaySessions} />
                    <PendingActionsWidget actions={pendingActions as any} />
                    <PendingEnrollmentsWidget />
                </div>

                {/* Right: Attendance + Activity + Chatbot */}
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

                    {/* Recent Activity */}
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h3 className="admin-card-title">
                                <TrendingUp className="w-5 h-5 text-teal-500" />
                                {t('recentActivity')}
                            </h3>
                        </div>
                        <div className="admin-card-body">
                            <div className="space-y-1">
                                {[
                                    { action: t('widgets.todaySessions'), time: '5m', type: 'success', href: withLocalePrefix('/admin/students', locale) },
                                    { action: t('widgets.pendingActions'), time: '15m', type: 'info', href: withLocalePrefix('/admin/lessons', locale) },
                                    { action: tNav('fees'), time: '1h', type: 'warning', href: withLocalePrefix('/admin/fees', locale) },
                                ].map((activity, index) => (
                                    <Link
                                        key={index}
                                        href={activity.href}
                                        className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-gray-50"
                                    >
                                        <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                                            activity.type === 'success' ? 'bg-emerald-400' :
                                            activity.type === 'info' ? 'bg-blue-400' : 'bg-amber-400'
                                        }`} />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-700 truncate">{activity.action}</p>
                                            <p className="text-xs text-gray-400">{activity.time}</p>
                                        </div>
                                        <ChevronRight className={`h-3.5 w-3.5 shrink-0 text-gray-300 ${isArabic ? 'rotate-180' : ''}`} />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    <InstantChatbotWidget />
                </div>
            </div>

            {/* ── Platform Highlights ───────────────────────────────── */}
            <div className="admin-card">
                <div className="admin-card-header">
                    <h3 className="admin-card-title">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        {t('highlights.title')}
                    </h3>
                </div>
                <div className="admin-card-body space-y-4">
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {platformHighlights.map((item) => (
                            <Link
                                key={item.title}
                                href={item.href}
                                className={`group flex items-start gap-3 rounded-xl border-l-4 ${item.border} bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md`}
                            >
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.bg}`}>
                                    {item.icon}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-gray-800">{item.title}</p>
                                    <p className="text-xs text-gray-400 leading-relaxed mt-0.5 line-clamp-2">
                                        {item.description}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-start gap-3 rounded-xl border border-teal-100 bg-teal-50 p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                            <GraduationCap className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-teal-700">{t('highlights.groupsTitle')}</p>
                            <p className="text-sm text-teal-600 mt-0.5">{t('highlights.groupsDesc')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
