'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import {
    Bell,
    Settings,
    Users,
    ClipboardList,
    ChevronRight,
    Clock,
    Video,
    LayoutDashboard,
    BookOpen,
    Layers,
    Calendar,
    ExternalLink,
    RefreshCw,
    Plus,
} from 'lucide-react';
import { useLocale } from 'next-intl';
import { withLocalePrefix } from '@/lib/locale-path';

interface DashboardStats {
    totalCourses: number;
    totalSubjects: number;
    upcomingLessonsToday: number;
    totalUpcomingLessons: number;
    pendingGrading: number;
    totalStudents: number;
}

interface Lesson {
    _id: string;
    title: string;
    description?: string;
    startDateTime: string;
    endDateTime: string;
    meetLink?: string;
    status: string;
    course?: { id: string; title: string };
    teacher?: { id: string; name: string; email: string };
}

export default function TeacherHomeClient({
    initialStats,
    initialLessons,
    user
}: {
    initialStats: DashboardStats;
    initialLessons: Lesson[];
    user: any;
}) {
    const router = useRouter();
    const locale = useLocale();
    const isArabic = locale === 'ar';

    const [stats, setStats] = useState<DashboardStats>(initialStats);
    const [upcomingLessons, setUpcomingLessons] = useState<Lesson[]>(initialLessons);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchDashboard = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            // Fetch stats and upcoming lessons in parallel
            const [statsRes, lessonsRes] = await Promise.all([
                fetch('/api/dashboard/teacher'),
                fetch(`/api/lessons?upcoming=true&teacherId=${user?.id || ''}&limit=10`),
            ]);

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }

            if (lessonsRes.ok) {
                const lessonsData = await lessonsRes.json();
                setUpcomingLessons(Array.isArray(lessonsData) ? lessonsData : []);
            }
        } catch (err: any) {
            console.error('Dashboard fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);



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

    const handleNavigation = (path: string) => {
        router.push(withLocalePrefix(path, locale));
    };

    const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getTimeUntil = (dateStr: string) => {
        const minutes = Math.round((new Date(dateStr).getTime() - Date.now()) / 60000);
        if (minutes <= 0) return isArabic ? 'الآن' : 'Now';
        if (minutes < 60) return isArabic ? `خلال ${minutes} د` : `In ${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return isArabic ? `خلال ${hours} س` : `In ${hours}h`;
        const days = Math.floor(hours / 24);
        return isArabic ? `خلال ${days} يوم` : `In ${days}d`;
    };



    const nextLesson = upcomingLessons[0];
    const minutesUntilNext = nextLesson
        ? Math.round((new Date(nextLesson.startDateTime).getTime() - Date.now()) / 60000)
        : null;

    return (
        <div className={`space-y-8 ${isArabic ? 'rtl' : 'ltr'}`}>
            {/* ── Hero / Greeting Section ──────────────────────────── */}
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 tracking-wide">{greeting()}</p>
                    <h1 className="text-3xl font-bold text-gray-900 mt-1">
                        {isArabic ? `مرحباً، ${user?.name || 'المعلم'}` : `Welcome back, ${user?.name || 'Teacher'}`}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchDashboard()}
                        className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button className="relative p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
                    </button>
                    <button
                        onClick={() => handleNavigation('/teacher/profile')}
                        className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                        <Settings className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {/* ── Quick Stats ──────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={<BookOpen className="h-5 w-5" />}
                    label={isArabic ? 'الدورات' : 'Courses'}
                    value={stats.totalCourses}
                    color="blue"
                    onClick={() => handleNavigation('/teacher/courses')}
                />
                <StatCard
                    icon={<Layers className="h-5 w-5" />}
                    label={isArabic ? 'المواد' : 'Subjects'}
                    value={stats.totalSubjects}
                    color="emerald"
                    onClick={() => handleNavigation('/teacher/subjects')}
                />
                <StatCard
                    icon={<Calendar className="h-5 w-5" />}
                    label={isArabic ? 'حصص اليوم' : 'Sessions Today'}
                    value={stats.upcomingLessonsToday}
                    color="amber"
                />
                <StatCard
                    icon={<ClipboardList className="h-5 w-5" />}
                    label={isArabic ? 'للتصحيح' : 'Pending Grading'}
                    value={stats.pendingGrading}
                    color="rose"
                    onClick={() => handleNavigation('/teacher/assessments')}
                />
            </div>

            {/* ── Next Class Card (if within 2 hours) ─────────────── */}
            {nextLesson && minutesUntilNext !== null && minutesUntilNext > 0 && minutesUntilNext <= 120 && (
                <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest">
                            {isArabic ? 'الحصة القادمة' : 'Next Class'}
                        </p>
                        <span className={`ml-auto rounded-full px-3 py-1 text-xs font-bold ${minutesUntilNext <= 15
                            ? 'bg-red-100 text-red-600 animate-pulse'
                            : 'bg-blue-100 text-blue-600'
                            }`}>
                            {getTimeUntil(nextLesson.startDateTime)}
                        </span>
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 mb-1">{nextLesson.title}</h3>
                    {nextLesson.course && (
                        <p className="text-sm text-gray-500 mb-4">{nextLesson.course.title}</p>
                    )}
                    <div className="flex items-center gap-3">
                        {nextLesson.meetLink && (
                            <a
                                href={nextLesson.meetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors"
                            >
                                <Video className="h-4 w-4" />
                                {isArabic ? 'ابدأ الحصة' : 'Start Class'}
                            </a>
                        )}
                        <span className="text-sm text-gray-500">
                            {formatDateTime(nextLesson.startDateTime)}
                        </span>
                    </div>
                </div>
            )}

            {/* ── Upcoming Lessons ─────────────────────────────────── */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                        {isArabic ? 'الحصص القادمة' : 'Upcoming Lessons'}
                    </h2>
                    <button
                        onClick={() => handleNavigation('/teacher/calendar')}
                        className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1"
                    >
                        {isArabic ? 'عرض الكل' : 'View All'}
                        <ChevronRight className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-gray-50 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : upcomingLessons.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl">
                        <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-4">
                            {isArabic ? 'لا توجد حصص قادمة' : 'No upcoming lessons'}
                        </p>
                        <button
                            onClick={() => handleNavigation('/teacher/lessons/new')}
                            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                            <Plus className="h-4 w-4" />
                            {isArabic ? 'إنشاء حصة جديدة' : 'Schedule a lesson'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {upcomingLessons.slice(0, 5).map((lesson) => (
                            <div
                                key={lesson._id}
                                className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer group"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${lesson.status === 'live' ? 'bg-red-50' : 'bg-blue-50'
                                        }`}>
                                        {lesson.status === 'live' ? (
                                            <Video className="h-5 w-5 text-red-500" />
                                        ) : (
                                            <BookOpen className="h-5 w-5 text-blue-500" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate">
                                            {lesson.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-0.5">
                                            {lesson.course?.title || ''}
                                            {lesson.course?.title ? ' · ' : ''}
                                            {formatDateTime(lesson.startDateTime)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className="text-xs font-medium text-gray-400">
                                        {getTimeUntil(lesson.startDateTime)}
                                    </span>
                                    {lesson.meetLink && (
                                        <a
                                            href={lesson.meetLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition-colors"
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            Join
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Quick Actions ─────────────────────────────────────── */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {isArabic ? 'إجراءات سريعة' : 'Quick Actions'}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <QuickAction
                        icon={<Plus className="h-5 w-5" />}
                        label={isArabic ? 'حصة جديدة' : 'New Lesson'}
                        onClick={() => handleNavigation('/teacher/lessons/new')}
                    />
                    <QuickAction
                        icon={<BookOpen className="h-5 w-5" />}
                        label={isArabic ? 'دورة جديدة' : 'New Course'}
                        onClick={() => handleNavigation('/teacher/courses/create')}
                    />
                    <QuickAction
                        icon={<Layers className="h-5 w-5" />}
                        label={isArabic ? 'مادة جديدة' : 'New Subject'}
                        onClick={() => handleNavigation('/teacher/subjects/create')}
                    />
                    <QuickAction
                        icon={<Users className="h-5 w-5" />}
                        label={isArabic ? 'الطلاب' : 'My Students'}
                        onClick={() => handleNavigation('/teacher/courses')}
                    />
                </div>
            </div>
        </div>
    );
}

const StatCard = React.memo(function StatCard({ icon, label, value, color, onClick }: {
    icon: React.ReactNode;
    label: string;
    value: number;
    color: 'blue' | 'emerald' | 'amber' | 'rose';
    onClick?: () => void;
}) {
    const colorMap = {
        blue: { bg: 'bg-blue-50', icon: 'text-blue-500', value: 'text-blue-700' },
        emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-500', value: 'text-emerald-700' },
        amber: { bg: 'bg-amber-50', icon: 'text-amber-500', value: 'text-amber-700' },
        rose: { bg: 'bg-rose-50', icon: 'text-rose-500', value: 'text-rose-700' },
    };
    const c = colorMap[color];

    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center rounded-2xl ${c.bg} p-5 text-center transition-all hover:shadow-md cursor-pointer`}
        >
            <div className={c.icon}>{icon}</div>
            <p className={`text-3xl font-extrabold ${c.value} mt-2 leading-none`}>{value}</p>
            <p className="mt-1.5 text-xs font-semibold text-gray-500 leading-tight">{label}</p>
        </button>
    );
});

const QuickAction = React.memo(function QuickAction({ icon, label, onClick }: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 bg-white text-gray-600 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50 transition-all"
        >
            {icon}
            <span className="text-xs font-semibold">{label}</span>
        </button>
    );
});
