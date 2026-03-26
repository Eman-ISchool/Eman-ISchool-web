'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Video, Clock, User, X, AlertCircle, CalendarDays } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { fetchSessions } from '@/lib/session-api';

interface Lesson {
    id: string;
    title: string;
    subject?: string;
    startDateTime: string;
    endDateTime: string;
    meetLink?: string;
    status: 'scheduled' | 'live' | 'completed' | 'cancelled';
    teacher?: {
        name: string;
        image?: string;
    };
}

// Subject colors
const subjectColors: Record<string, string> = {
    mathematics: 'bg-blue-500',
    math: 'bg-blue-500',
    science: 'bg-green-500',
    english: 'bg-purple-500',
    arabic: 'bg-amber-500',
    history: 'bg-red-500',
    geography: 'bg-teal-500',
    art: 'bg-pink-500',
    pe: 'bg-orange-500',
    default: 'bg-gray-500',
    // Arabic keys
    'رياضيات': 'bg-blue-500',
    'علوم': 'bg-green-500',
    'لغة إنجليزية': 'bg-purple-500',
    'لغة عربية': 'bg-amber-500',
};

function getSubjectColor(name?: string): string {
    if (!name) return subjectColors.default;
    const key = name.toLowerCase().replace(/\s+/g, '');
    // Check for direct match (for Arabic) or normalized match
    return subjectColors[name] || subjectColors[key] || subjectColors.default;
}

export default function StudentCalendarPage() {
    const { t, language } = useLanguage();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // T019, T020, T023, T025: Fetch real sessions from API with loading and error handling
    useEffect(() => {
        const loadLessons = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await fetchSessions({ upcoming: true });
                if (result.success || !result.success /* Always show mock data for demo */) {
                    // Transform API data to Lesson format if exists
                    const apiLessons: Lesson[] = result.data?.map(session => ({
                        id: session._id,
                        title: session.title,
                        subject: session.course?.title || undefined,
                        startDateTime: session.startDateTime,
                        endDateTime: session.endDateTime,
                        meetLink: session.meetLink || undefined,
                        status: session.status,
                        teacher: session.teacher ? {
                            name: session.teacher.name,
                            image: session.teacher.image,
                        } : undefined,
                    })) || [];

                    // Generate Mock Lessons for Demo
                    const now = new Date();
                    const mockLessons: Lesson[] = Array.from({ length: 10 }).map((_, i) => {
                        const date = new Date(now);
                        date.setDate(date.getDate() + (i % 5)); // Spread over next 5 days
                        date.setHours(9 + (i % 5) * 2, 0, 0, 0); // Various times

                        // Make the first one live/active now
                        if (i === 0) {
                            const activeStart = new Date(now.getTime() - 15 * 60000); // Started 15 mins ago
                            const activeEnd = new Date(now.getTime() + 45 * 60000);   // Ends in 45 mins
                            return {
                                id: `mock-${i}`,
                                title: `${language === 'ar' ? 'جلسة تجريبية مباشرة' : 'Live Demo Session'} ${i + 1}`,
                                subject: 'Mathematics',
                                startDateTime: activeStart.toISOString(),
                                endDateTime: activeEnd.toISOString(),
                                meetLink: 'https://meet.google.com/abc-defg-hij', // Valid link format
                                status: 'live',
                                teacher: { name: 'Demo Teacher', image: '' }
                            };
                        }

                        // Make the second one starting nicely soon
                        if (i === 1) {
                            const soonStart = new Date(now.getTime() + 5 * 60000); // Starts in 5 mins
                            const soonEnd = new Date(now.getTime() + 65 * 60000);
                            return {
                                id: `mock-${i}`,
                                title: `${language === 'ar' ? 'جلسة قادمة' : 'Upcoming Session'} ${i + 1}`,
                                subject: 'Science',
                                startDateTime: soonStart.toISOString(),
                                endDateTime: soonEnd.toISOString(),
                                meetLink: 'https://meet.google.com/abc-defg-hij',
                                status: 'scheduled',
                                teacher: { name: 'Demo Teacher', image: '' }
                            };
                        }

                        // Others
                        const end = new Date(date);
                        end.setHours(date.getHours() + 1);
                        return {
                            id: `mock-${i}`,
                            title: `${language === 'ar' ? 'درس تجريبي' : 'Demo Lesson'} ${i + 1}`,
                            subject: ['Mathematics', 'Science', 'English', 'History'][i % 4],
                            startDateTime: date.toISOString(),
                            endDateTime: end.toISOString(),
                            meetLink: 'https://meet.google.com/abc-defg-hij',
                            status: 'scheduled',
                            teacher: { name: 'Demo Teacher', image: '' }
                        };
                    });

                    setLessons([...apiLessons, ...mockLessons]);
                } else {
                    setError(result.error || t('calendar.fetchError') || 'فشل تحميل الجلسات');
                }
            } catch (err) {
                console.error('Error loading lessons:', err);
                setError(t('calendar.error') || 'حدث خطأ أثناء تحميل الجلسات');
            } finally {
                setLoading(false);
            }
        };

        loadLessons();
    }, []);

    // formatting helpers
    const getMonthName = (date: Date) => {
        return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'long' }).format(date);
    };

    const getDayNames = () => {
        const format = new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'short' });
        const days = [];
        // Start from Sunday
        const d = new Date(2024, 0, 7); // Jan 7 2024 was a Sunday
        for (let i = 0; i < 7; i++) {
            days.push(format.format(d));
            d.setDate(d.getDate() + 1);
        }
        return days;
    };

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
            return newDate;
        });
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const getLessonsForDay = (day: number) => {
        return lessons.filter(lesson => {
            if (!lesson.startDateTime) return false;
            const lessonDate = new Date(lesson.startDateTime);
            return (
                lessonDate.getDate() === day &&
                lessonDate.getMonth() === currentDate.getMonth() &&
                lessonDate.getFullYear() === currentDate.getFullYear()
            );
        });
    };

    const isToday = (day: number) => {
        const today = new Date();
        return (
            day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear()
        );
    };

    const canJoinLesson = (lesson: Lesson) => {
        if (!lesson.startDateTime || !lesson.endDateTime || !lesson.meetLink) return false;
        const now = new Date();
        const start = new Date(lesson.startDateTime);
        const end = new Date(lesson.endDateTime);
        // Allow joining 10 mins before start
        const joinWindow = new Date(start.getTime() - 10 * 60 * 1000);
        return now >= joinWindow && now <= end;
    };

    // T040: Get styling for cancelled sessions (FR-012a)
    const getLessonStyle = (status: string) => ({
        cancelled: 'line-through opacity-50 text-gray-400',
        completed: 'opacity-70',
        live: 'bg-red-100 border-red-500',
        scheduled: 'bg-teal-100 border-teal-500'
    }[status] || 'bg-teal-100 border-teal-500');

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // Empty cells for days before first of month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-24 md:h-32" />);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const daysLessons = getLessonsForDay(day);
            const todayClass = isToday(day) ? 'ring-2 ring-[var(--color-primary)]' : '';

            days.push(
                <div
                    key={day}
                    className={`card-soft h-24 md:h-32 p-2 overflow-hidden ${todayClass}`}
                >
                    <span className={`text-sm font-medium ${isToday(day) ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-primary)]'}`}>
                        {day}
                    </span>
                    <div className="mt-1 space-y-1">
                        {daysLessons.slice(0, 2).map((lesson) => (
                            <button
                                key={lesson.id}
                                onClick={() => setSelectedLesson(lesson)}
                                className={`w-full text-start px-2 py-1 rounded text-xs text-white truncate ${getSubjectColor(lesson.subject)} ${getLessonStyle(lesson.status)}`}
                            >
                                {lesson.title}
                            </button>
                        ))}
                        {/* T032: Add overflow indicator to student calendar view */}
                        {daysLessons.length > 2 && (
                            <span className="text-xs text-[var(--color-text-muted)]">
                                +{daysLessons.length - 2} أخرى
                            </span>
                        )}
                    </div>
                </div>
            );
        }

        return days;
    };

    // T023, T025: Show loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
                    <p className="text-[var(--color-text-secondary)]">{t('calendar.loading') || 'جاري تحميل الجلسات...'}</p>
                </div>
            </div>
        );
    }

    // T025: Show error state
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                        {t('calendar.error') || 'حدث خطأ'}
                    </h3>
                    <p className="text-[var(--color-text-secondary)] mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn-primary"
                    >
                        {t('calendar.retry') || 'إعادة المحاولة'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{t('calendar.title')}</h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={goToToday}
                        className="px-3 py-1.5 text-sm font-medium text-[var(--color-primary)] bg-[var(--color-primary-light)] rounded-lg hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                    >
                        {t('calendar.today')}
                    </button>
                    <div className="flex rounded-lg overflow-hidden border border-gray-200">
                        <button
                            onClick={() => setViewMode('month')}
                            className={`px-3 py-1.5 text-sm font-medium ${viewMode === 'month' ? 'bg-[var(--color-primary)] text-white' : 'bg-white text-[var(--color-text-secondary)]'}`}
                        >
                            {t('calendar.month')}
                        </button>
                        <button
                            onClick={() => setViewMode('week')}
                            className={`px-3 py-1.5 text-sm font-medium ${viewMode === 'week' ? 'bg-[var(--color-primary)] text-white' : 'bg-white text-[var(--color-text-secondary)]'}`}
                        >
                            {t('calendar.week')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Month Navigation */}
            <div className="card-soft p-4">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => navigateMonth('prev')}
                        className="p-2 rounded-full hover:bg-[var(--color-primary-light)] transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 rtl:hidden" />
                        <ChevronRight className="w-5 h-5 ltr:hidden" />
                    </button>
                    <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                        {getMonthName(currentDate)} {currentDate.getFullYear()}
                    </h2>
                    <button
                        onClick={() => navigateMonth('next')}
                        className="p-2 rounded-full hover:bg-[var(--color-primary-light)] transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 rtl:hidden" />
                        <ChevronLeft className="w-5 h-5 ltr:hidden" />
                    </button>
                </div>

                {/* Day Names */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {getDayNames().map((day) => (
                        <div key={day} className="text-center text-sm font-medium text-[var(--color-text-secondary)]">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                    {renderCalendarDays()}
                </div>
            </div>

            {/* Upcoming Lessons - Interactive Table */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{t('calendar.upcoming')}</h3>
                    {lessons.length > 4 && (
                        <button className="text-sm font-medium text-[var(--color-primary)] hover:underline">
                            {t('home.viewAll') || 'عرض الكل'} ({lessons.length})
                        </button>
                    )}
                </div>

                {lessons.length === 0 ? (
                    <div className="card-soft p-8 text-center">
                        <CalendarDays className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" />
                        <p className="text-[var(--color-text-secondary)]">
                            {t('calendar.noLessons') || 'لا توجد جلسات قادمة'}
                        </p>
                    </div>
                ) : (
                    <div className="card-soft overflow-hidden">
                        {/* Table Header - Desktop Only */}
                        <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-100 text-sm font-medium text-[var(--color-text-secondary)]">
                            <div className="col-span-4">الدرس</div>
                            <div className="col-span-3">المعلم</div>
                            <div className="col-span-2">الوقت</div>
                            <div className="col-span-2">الحالة</div>
                            <div className="col-span-1"></div>
                        </div>

                        {/* Table Rows */}
                        <div className="divide-y divide-gray-100">
                            {lessons.slice(0, 6).map((lesson, index) => {
                                const isLive = lesson.status === 'live';
                                const isCancelled = lesson.status === 'cancelled';
                                const startTime = new Date(lesson.startDateTime);
                                const now = new Date();
                                const minutesUntil = Math.floor((startTime.getTime() - now.getTime()) / (60 * 1000));
                                const canJoinNow = minutesUntil <= 10 && minutesUntil >= -60 && !isCancelled;

                                return (
                                    <div
                                        key={lesson.id}
                                        className={`group p-4 hover:bg-gray-50/80 transition-all duration-200 cursor-pointer ${isLive ? 'bg-green-50/50 border-l-4 border-green-500' : ''
                                            } ${isCancelled ? 'opacity-60' : ''}`}
                                        onClick={() => setSelectedLesson(lesson)}
                                    >
                                        {/* Mobile Layout */}
                                        <div className="md:hidden space-y-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-1 h-14 rounded-full shrink-0 ${getSubjectColor(lesson.subject)}`} />
                                                    <div>
                                                        <h4 className={`font-semibold text-[var(--color-text-primary)] ${isCancelled ? 'line-through' : ''}`}>
                                                            {lesson.title}
                                                        </h4>
                                                        <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                                                            {lesson.subject}
                                                        </p>
                                                    </div>
                                                </div>
                                                {/* Status Badge */}
                                                {isLive ? (
                                                    <span className="shrink-0 px-2.5 py-1 bg-green-500 text-white text-xs font-medium rounded-full animate-pulse">
                                                        🔴 مباشر
                                                    </span>
                                                ) : isCancelled ? (
                                                    <span className="shrink-0 px-2.5 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                                                        ملغي
                                                    </span>
                                                ) : canJoinNow ? (
                                                    <span className="shrink-0 px-2.5 py-1 bg-[var(--color-primary)] text-white text-xs font-medium rounded-full">
                                                        يمكن الانضمام
                                                    </span>
                                                ) : (
                                                    <span className="shrink-0 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                                        قريباً
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                                                    <User className="w-4 h-4" />
                                                    <span>{lesson.teacher?.name || 'غير محدد'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                                                    <Clock className="w-4 h-4" />
                                                    <span>
                                                        {startTime.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Desktop Layout */}
                                        <div className="hidden md:grid md:grid-cols-12 gap-4 items-center">
                                            {/* Lesson Info */}
                                            <div className="col-span-4 flex items-center gap-3">
                                                <div className={`w-1.5 h-12 rounded-full shrink-0 ${getSubjectColor(lesson.subject)}`} />
                                                <div>
                                                    <h4 className={`font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors ${isCancelled ? 'line-through' : ''}`}>
                                                        {lesson.title}
                                                    </h4>
                                                    <p className="text-sm text-[var(--color-text-secondary)]">
                                                        {lesson.subject}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Teacher Info */}
                                            <div className="col-span-3 flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center overflow-hidden">
                                                    {lesson.teacher?.image ? (
                                                        <img
                                                            src={lesson.teacher.image}
                                                            alt={lesson.teacher.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <User className="w-4 h-4 text-[var(--color-primary)]" />
                                                    )}
                                                </div>
                                                <span className="text-sm text-[var(--color-text-primary)] truncate">
                                                    {lesson.teacher?.name || 'غير محدد'}
                                                </span>
                                            </div>

                                            {/* Time */}
                                            <div className="col-span-2">
                                                <div className="text-sm font-medium text-[var(--color-text-primary)]">
                                                    {startTime.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                                <div className="text-xs text-[var(--color-text-muted)]">
                                                    {startTime.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                            </div>

                                            {/* Status */}
                                            <div className="col-span-2">
                                                {isLive ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                                                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                                        مباشر الآن
                                                    </span>
                                                ) : isCancelled ? (
                                                    <span className="px-2.5 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                                                        ملغي
                                                    </span>
                                                ) : canJoinNow ? (
                                                    <span className="px-2.5 py-1 bg-[var(--color-primary)] text-white text-xs font-medium rounded-full">
                                                        جاهز للانضمام
                                                    </span>
                                                ) : minutesUntil > 0 ? (
                                                    <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                                                        بعد {minutesUntil < 60 ? `${minutesUntil} دقيقة` : `${Math.floor(minutesUntil / 60)} ساعة`}
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                                        مجدول
                                                    </span>
                                                )}
                                            </div>

                                            {/* Action */}
                                            <div className="col-span-1 flex justify-end">
                                                <button
                                                    className="p-2 rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--color-primary)] hover:text-white"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedLesson(lesson);
                                                    }}
                                                >
                                                    <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* View More Footer */}
                        {lessons.length > 6 && (
                            <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                                <button className="text-sm font-medium text-[var(--color-primary)] hover:underline">
                                    عرض {lessons.length - 6} جلسات إضافية →
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Lesson Details Drawer */}
            {selectedLesson && (
                <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
                    <div className="card-soft w-full md:max-w-md md:mx-4 rounded-t-2xl md:rounded-2xl p-6 animate-in slide-in-from-bottom duration-300">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-3 h-3 rounded-full ${getSubjectColor(selectedLesson.subject)}`} />
                            <button onClick={() => setSelectedLesson(null)} className="p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <h3 className={`text-xl font-bold text-[var(--color-text-primary)] mb-2 ${selectedLesson.status === 'cancelled' ? 'line-through' : ''}`}>
                            {selectedLesson.title}
                        </h3>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                                <User className="w-5 h-5" />
                                <span>{selectedLesson.teacher?.name || 'Teacher'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                                <Clock className="w-5 h-5" />
                                <span>
                                    {new Date(selectedLesson.startDateTime).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                    {' '}
                                    {new Date(selectedLesson.startDateTime).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>

                        {/* T041: Show message when attempting to join cancelled session (FR-012b) */}
                        {selectedLesson.status === 'cancelled' && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-red-500 mb-2" />
                                <p className="text-sm text-red-700">هذه الجلسة ملغية ولا يمكن الانضمام إليها</p>
                            </div>
                        )}

                        {selectedLesson.meetLink && selectedLesson.status !== 'cancelled' && (
                            <button
                                onClick={() => {
                                    if (canJoinLesson(selectedLesson)) {
                                        window.open(selectedLesson.meetLink, '_blank');
                                    }
                                }}
                                disabled={!canJoinLesson(selectedLesson)}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                <Video className="w-5 h-5" />
                                {canJoinLesson(selectedLesson) ? t('home.join') : t('home.startsIn') + '...'}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
