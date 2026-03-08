'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Bell, Settings, BookOpen, Calendar, ChevronRight, Clock, UserCheck } from 'lucide-react';
import { AnnouncementCard } from '@/components/student/AnnouncementCard';
import { AnnouncementBar } from '@/components/teacher/AnnouncementBar';
import { LessonCarousel } from '@/components/student/LessonCarousel';
import { AssignmentList } from '@/components/student/AssignmentList';
import { TeacherCardList } from '@/components/student/TeacherCardList';
import { SubjectGrid } from '@/components/student/SubjectGrid';
import { PaymentList } from '@/components/student/PaymentList';
import { useLanguage } from '@/context/LanguageContext';
import { getLocaleFromPathname, withLocalePrefix } from '@/lib/locale-path';

interface ApiAnnouncement {
    id: string;
    title: string;
    content: string;
    priority: 'high' | 'medium' | 'low';
    target: string;
    publishedAt: string;
    isPinned: boolean;
}

function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-teal-100/70 rounded-2xl ${className}`} />;
}


export default function StudentHomePage() {
    const router = useRouter();
    const pathname = usePathname();
    const locale = getLocaleFromPathname(pathname);
    const { data: session } = useSession();
    const { t, language } = useLanguage();
    const isRTL = language === 'ar';
    const [loading, setLoading] = useState(true);
    const [topAnnouncement, setTopAnnouncement] = useState<ApiAnnouncement | null>(null);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const response = await fetch('/api/announcements?role=student');
                const data = await response.json();
                if (data.success && data.data.length > 0) {
                    setTopAnnouncement(data.data[0]);
                }
            } catch (error) {
                console.error('Failed to fetch announcements:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnnouncements();
    }, []);

    const handleUpload = async (assignmentId: string, file: File) => {
        console.log('Uploading file for assignment:', assignmentId, file.name);
        await new Promise(resolve => setTimeout(resolve, 2000));
    };

    const greeting = () => {
        const hour = new Date().getHours();
        if (isRTL) {
            if (hour < 12) return 'صباح الخير';
            if (hour < 17) return 'طاب يومك';
            return 'مساء الخير';
        }
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const mockAnnouncement = {
        id: '1',
        title: isRTL ? 'تنبيه: غياب المعلم' : 'Notice: Teacher Absence',
        body: isRTL
            ? 'سيكون المعلم غائباً اليوم. يرجى مراجعة الجدول الدراسي لأي تغييرات أو دروس بديلة.'
            : 'The teacher will be absent today. Please check your schedule for any changes or make-up classes.',
        priority: 'high' as const,
        createdAt: new Date().toISOString(),
    };

    const mockLessons = isRTL ? [
        {
            id: '1',
            title: 'مقدمة في الجبر',
            subject: 'رياضيات',
            startDateTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
            endDateTime: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
            meetLink: 'https://meet.google.com/abc-defg-hij',
            status: 'scheduled' as const,
            teacher: { name: 'د. أحمد حسن', image: '' },
        },
        {
            id: '2',
            title: 'الأدب الإنجليزي: شكسبير',
            subject: 'لغة إنجليزية',
            startDateTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
            endDateTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
            meetLink: 'https://meet.google.com/xyz-uvwx-yz',
            status: 'scheduled' as const,
            teacher: { name: 'أ. سارة جونسون' },
        },
    ] : [
        {
            id: '1',
            title: 'Introduction to Algebra',
            subject: 'Mathematics',
            startDateTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
            endDateTime: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
            meetLink: 'https://meet.google.com/abc-defg-hij',
            status: 'scheduled' as const,
            teacher: { name: 'Dr. Ahmed Hassan', image: '' },
        },
        {
            id: '2',
            title: 'English Literature: Shakespeare',
            subject: 'English',
            startDateTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
            endDateTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
            meetLink: 'https://meet.google.com/xyz-uvwx-yz',
            status: 'scheduled' as const,
            teacher: { name: 'Ms. Sarah Johnson' },
        },
    ];

    const mockAssignments = isRTL ? [
        {
            id: '1',
            type: 'assignment' as const,
            title: 'مقال عن التغير المناخي',
            subject: 'علوم',
            dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            fileUrl: '/files/assignment1.pdf',
            submissionStatus: 'pending' as const,
        },
        {
            id: '2',
            type: 'quiz' as const,
            title: 'اختبار الرياضيات الفصل الخامس',
            subject: 'رياضيات',
            dueAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            submissionStatus: 'pending' as const,
        },
    ] : [
        {
            id: '1',
            type: 'assignment' as const,
            title: 'Essay on Climate Change',
            subject: 'Science',
            dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            fileUrl: '/files/assignment1.pdf',
            submissionStatus: 'pending' as const,
        },
        {
            id: '2',
            type: 'quiz' as const,
            title: 'Math Chapter 5 Quiz',
            subject: 'Mathematics',
            dueAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            submissionStatus: 'pending' as const,
        },
    ];

    const mockTeachers = isRTL ? [
        { id: '1', name: 'د. أحمد حسن', subjects: ['رياضيات', 'فيزياء'] },
        { id: '2', name: 'أ. سارة جونسون', subjects: ['لغة إنجليزية', 'أدب'] },
    ] : [
        { id: '1', name: 'Dr. Ahmed Hassan', subjects: ['Mathematics', 'Physics'] },
        { id: '2', name: 'Ms. Sarah Johnson', subjects: ['English', 'Literature'] },
    ];

    const mockSubjects = isRTL ? [
        { id: '1', name: 'رياضيات' },
        { id: '2', name: 'علوم' },
        { id: '3', name: 'لغة إنجليزية' },
        { id: '4', name: 'لغة عربية' },
    ] : [
        { id: '1', name: 'Math' },
        { id: '2', name: 'Science' },
        { id: '3', name: 'English' },
        { id: '4', name: 'Arabic' },
    ];

    const nextLesson = mockLessons[0];
    const minutesUntilNext = nextLesson
        ? Math.round((new Date(nextLesson.startDateTime).getTime() - Date.now()) / 60000)
        : null;

    const formatCountdown = (minutes: number) => {
        if (minutes <= 0) return isRTL ? 'الآن' : 'Now';
        if (minutes < 60) return isRTL ? `خلال ${minutes} د` : `In ${minutes}m`;
        return isRTL
            ? `خلال ${Math.floor(minutes / 60)} س`
            : `In ${Math.floor(minutes / 60)}h`;
    };

    return (
        <div className={`space-y-5 pb-6 ${isRTL ? 'rtl' : 'ltr'}`}>
            {/* System-level announcement bar */}
            {topAnnouncement && (
                <AnnouncementBar
                    announcement={{
                        id: topAnnouncement.id,
                        text: topAnnouncement.title,
                        createdAt: topAnnouncement.publishedAt,
                    }}
                    onViewAll={() => console.log('View all announcements')}
                />
            )}

            {/* ── Hero Section ─────────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-teal-700 via-teal-600 to-emerald-500 p-6 text-white shadow-2xl shadow-teal-200/60">
                {/* Decorative orbs */}
                <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-white/10" />
                <div className="pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-emerald-400/25" />
                <div className="pointer-events-none absolute top-1/2 right-1/3 h-12 w-12 rounded-full bg-teal-300/20" />

                {/* Greeting row */}
                <div className="relative flex items-start justify-between mb-5">
                    <div>
                        <p className="text-teal-100 text-sm font-medium tracking-wide">{greeting()}</p>
                        <h1 className="text-2xl font-extrabold mt-0.5 leading-tight">
                            {session?.user?.name || (isRTL ? 'طالب' : 'Student')}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="relative rounded-full bg-white/20 p-2 backdrop-blur-sm hover:bg-white/30 transition-colors">
                            <Bell className="h-5 w-5 text-white" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-400 ring-2 ring-teal-600" />
                        </button>
                        <button className="rounded-full bg-white/20 p-2 backdrop-blur-sm hover:bg-white/30 transition-colors">
                            <Settings className="h-5 w-5 text-white" />
                        </button>
                    </div>
                </div>

                {/* Next lesson card — embedded in hero */}
                {nextLesson && minutesUntilNext !== null && minutesUntilNext > 0 && (
                    <div className="relative rounded-2xl border border-white/20 bg-white/15 backdrop-blur-sm p-4">
                        <div className="flex items-center gap-1.5 mb-2">
                            <Clock className="h-3.5 w-3.5 text-teal-100" />
                            <p className="text-teal-100 text-xs font-semibold uppercase tracking-widest">
                                {isRTL ? 'الدرس القادم' : 'Next Lesson'}
                            </p>
                        </div>
                        <p className="font-bold text-lg leading-snug mb-2">{nextLesson.title}</p>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-sm text-teal-100 truncate">{nextLesson.subject}</span>
                                <span className="text-teal-300 opacity-60">·</span>
                                <span className="text-sm text-teal-100 truncate">{nextLesson.teacher?.name}</span>
                            </div>
                            <span
                                className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold transition-all ${
                                    minutesUntilNext <= 15
                                        ? 'bg-red-400/90 text-white animate-pulse'
                                        : 'bg-white/25 text-white'
                                }`}
                            >
                                {formatCountdown(minutesUntilNext)}
                            </span>
                        </div>
                        {nextLesson.meetLink && (
                            <a
                                href={nextLesson.meetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-bold text-teal-700 hover:bg-teal-50 transition-colors active:scale-[0.98]"
                            >
                                {isRTL ? 'انضم الآن' : 'Join Now'}
                                <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                            </a>
                        )}
                    </div>
                )}
            </div>

            {/* ── Quick Stats Strip ─────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center rounded-2xl bg-teal-50 p-3 text-center shadow-sm">
                    <Calendar className="h-4 w-4 text-teal-500 mb-1.5" />
                    <p className="text-xl font-extrabold text-teal-700 leading-none">2</p>
                    <p className="mt-1 text-[11px] font-semibold text-teal-500 leading-tight">
                        {isRTL ? 'دروس اليوم' : 'Today'}
                    </p>
                </div>
                <div className="flex flex-col items-center rounded-2xl bg-amber-50 p-3 text-center shadow-sm">
                    <BookOpen className="h-4 w-4 text-amber-500 mb-1.5" />
                    <p className="text-xl font-extrabold text-amber-700 leading-none">3</p>
                    <p className="mt-1 text-[11px] font-semibold text-amber-500 leading-tight">
                        {isRTL ? 'مهام معلقة' : 'Pending'}
                    </p>
                </div>
                <div className="flex flex-col items-center rounded-2xl bg-emerald-50 p-3 text-center shadow-sm">
                    <UserCheck className="h-4 w-4 text-emerald-500 mb-1.5" />
                    <p className="text-xl font-extrabold text-emerald-700 leading-none">92%</p>
                    <p className="mt-1 text-[11px] font-semibold text-emerald-500 leading-tight">
                        {isRTL ? 'الحضور' : 'Attendance'}
                    </p>
                </div>
            </div>

            {/* ── Announcement Card ─────────────────────────────────── */}
            {!loading && mockAnnouncement && (
                <AnnouncementCard
                    announcement={mockAnnouncement}
                    onViewAll={() => console.log('View all announcements')}
                />
            )}

            {/* ── Upcoming Lessons ──────────────────────────────────── */}
            <section>
                {loading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-5 w-36" />
                        <div className="flex gap-4 overflow-hidden">
                            <Skeleton className="h-44 w-64 shrink-0" />
                            <Skeleton className="h-44 w-64 shrink-0" />
                        </div>
                    </div>
                ) : (
                    <LessonCarousel
                        lessons={mockLessons}
                        title={t('home.upcomingLessons')}
                        onSeeAll={() => console.log('See all lessons')}
                    />
                )}
            </section>

            {/* ── Assignments & Quizzes ─────────────────────────────── */}
            <section>
                {loading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-5 w-44" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                ) : (
                    <AssignmentList
                        assignments={mockAssignments}
                        title={t('home.assignments')}
                        onSeeAll={() => console.log('See all assignments')}
                        onUpload={handleUpload}
                    />
                )}
            </section>

            {/* ── Teachers ──────────────────────────────────────────── */}
            <section>
                {loading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-5 w-28" />
                        <div className="flex gap-4 overflow-hidden">
                            <Skeleton className="h-36 w-40 shrink-0" />
                            <Skeleton className="h-36 w-40 shrink-0" />
                        </div>
                    </div>
                ) : (
                    <TeacherCardList
                        teachers={mockTeachers}
                        title={t('home.teachers')}
                        onSeeAll={() => router.push(withLocalePrefix('/student/chat', locale))}
                        onMessage={(id) => router.push(withLocalePrefix(`/student/chat?teacher=${id}`, locale))}
                    />
                )}
            </section>

            {/* ── Payments ──────────────────────────────────────────── */}
            <PaymentList />

            {/* ── Subjects ──────────────────────────────────────────── */}
            <section>
                {loading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-5 w-24" />
                        <div className="grid grid-cols-4 gap-3">
                            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16" />)}
                        </div>
                    </div>
                ) : (
                    <SubjectGrid
                        subjects={mockSubjects}
                        title={t('home.subjects')}
                        onSeeAll={() => console.log('See all subjects')}
                        onSubjectClick={(id) => console.log('Subject clicked:', id)}
                    />
                )}
            </section>
        </div>
    );
}
