'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Video, Clock, User, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

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

// Mock lessons data - English
const mockLessonsEn: Lesson[] = [
    {
        id: '1',
        title: 'Introduction to Algebra',
        subject: 'Mathematics',
        startDateTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        endDateTime: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
        meetLink: 'https://meet.google.com/abc-defg-hij',
        status: 'scheduled',
        teacher: { name: 'Dr. Ahmed Hassan' },
    },
    {
        id: '2',
        title: 'English Literature',
        subject: 'English',
        startDateTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        endDateTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        meetLink: 'https://meet.google.com/xyz-uvwx-yz',
        status: 'scheduled',
        teacher: { name: 'Ms. Sarah Johnson' },
    },
    {
        id: '3',
        title: 'Physics Lab',
        subject: 'Science',
        startDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endDateTime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        meetLink: 'https://meet.google.com/qrs-tuvw-xyz',
        status: 'scheduled',
        teacher: { name: 'Prof. Michael Chen' },
    },
    {
        id: '4',
        title: 'Arabic Grammar',
        subject: 'Arabic',
        startDateTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        endDateTime: new Date(Date.now() + 49 * 60 * 60 * 1000).toISOString(),
        meetLink: 'https://meet.google.com/abc-xyz-123',
        status: 'scheduled',
        teacher: { name: 'Mrs. Fatima Ali' },
    },
];

// Mock lessons data - Arabic
const mockLessonsAr: Lesson[] = [
    {
        id: '1',
        title: 'مقدمة في الجبر',
        subject: 'رياضيات',
        startDateTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        endDateTime: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
        meetLink: 'https://meet.google.com/abc-defg-hij',
        status: 'scheduled',
        teacher: { name: 'د. أحمد حسن' },
    },
    {
        id: '2',
        title: 'الأدب الإنجليزي',
        subject: 'لغة إنجليزية',
        startDateTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        endDateTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        meetLink: 'https://meet.google.com/xyz-uvwx-yz',
        status: 'scheduled',
        teacher: { name: 'أ. سارة جونسون' },
    },
    {
        id: '3',
        title: 'معمل الفيزياء',
        subject: 'علوم',
        startDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endDateTime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        meetLink: 'https://meet.google.com/qrs-tuvw-xyz',
        status: 'scheduled',
        teacher: { name: 'د. مايكل تشين' },
    },
    {
        id: '4',
        title: 'قواعد النحو',
        subject: 'لغة عربية',
        startDateTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        endDateTime: new Date(Date.now() + 49 * 60 * 60 * 1000).toISOString(),
        meetLink: 'https://meet.google.com/abc-xyz-123',
        status: 'scheduled',
        teacher: { name: 'أ. فاطمة علي' },
    },
];

export default function StudentCalendarPage() {
    const { t, language } = useLanguage();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

    // Select lessons based on language
    const lessons = language === 'ar' ? mockLessonsAr : mockLessonsEn;

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
        const now = new Date();
        const start = new Date(lesson.startDateTime);
        const end = new Date(lesson.endDateTime);
        const joinWindow = new Date(start.getTime() - 10 * 60 * 1000);
        return now >= joinWindow && now <= end && !!lesson.meetLink;
    };

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
                                className={`w-full text-start px-2 py-1 rounded text-xs text-white truncate ${getSubjectColor(lesson.subject)}`}
                            >
                                {lesson.title}
                            </button>
                        ))}
                        {daysLessons.length > 2 && (
                            <span className="text-xs text-[var(--color-text-muted)]">
                                +{daysLessons.length - 2}
                            </span>
                        )}
                    </div>
                </div>
            );
        }

        return days;
    };

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

            {/* Upcoming Lessons List */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{t('calendar.upcoming')}</h3>
                <div className="space-y-2">
                    {lessons.slice(0, 4).map((lesson) => (
                        <div
                            key={lesson.id}
                            className="card-soft p-4 flex items-center gap-4 cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => setSelectedLesson(lesson)}
                        >
                            <div className={`w-1 h-12 rounded-full ${getSubjectColor(lesson.subject)}`} />
                            <div className="flex-1">
                                <h4 className="font-medium text-[var(--color-text-primary)]">{lesson.title}</h4>
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    {new Date(lesson.startDateTime).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    {' • '}
                                    {new Date(lesson.startDateTime).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            {lesson.meetLink && (
                                <Video className="w-5 h-5 text-[var(--color-primary)]" />
                            )}
                        </div>
                    ))}
                </div>
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

                        <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
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

                        {selectedLesson.meetLink && (
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
