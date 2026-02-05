'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Bell, Settings } from 'lucide-react';
import { AnnouncementBar } from '@/components/teacher/AnnouncementBar';
import { LessonCarousel } from '@/components/student/LessonCarousel';
import { StudentQuizList } from '@/components/teacher/StudentQuizList';
import { SubjectGrid } from '@/components/student/SubjectGrid';
import { AIVideoGenerator } from '@/components/teacher/AIVideoGenerator';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

// Skeleton loader component
function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />;
}

export default function TeacherHomePage() {
    const { data: session } = useSession();
    const t = useTranslations('teacher.home');
    const locale = useLocale();
    const [loading, setLoading] = useState(true);

    const isArabic = locale === 'ar';

    useEffect(() => {
        // Simulate API loading
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

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

    // Mock Data - Teacher Announcement (Yellow Bar)
    const mockAnnouncement = {
        id: '1',
        text: t('announcements'),
        createdAt: new Date().toISOString(),
    };

    // Mock Lessons - Teacher's scheduled lessons
    const mockLessons = isArabic ? [
        {
            id: '1',
            title: 'مقدمة في الجبر',
            subject: 'رياضيات',
            startDateTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
            endDateTime: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
            meetLink: 'https://meet.google.com/abc-defg-hij',
            status: 'scheduled' as const,
            teacher: { name: session?.user?.name || 'المعلم', image: session?.user?.image || '' },
        },
        {
            id: '2',
            title: 'حل المعادلات التربيعية',
            subject: 'رياضيات',
            startDateTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
            endDateTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
            meetLink: 'https://meet.google.com/xyz-uvwx-yz',
            status: 'scheduled' as const,
            teacher: { name: session?.user?.name || 'المعلم' },
        },
        {
            id: '3',
            title: 'مبادئ الفيزياء',
            subject: 'فيزياء',
            startDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            endDateTime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
            meetLink: 'https://meet.google.com/qrs-tuvw-xyz',
            status: 'scheduled' as const,
            teacher: { name: session?.user?.name || 'المعلم' },
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
            teacher: { name: session?.user?.name || 'Teacher', image: session?.user?.image || '' },
        },
        {
            id: '2',
            title: 'Solving Quadratic Equations',
            subject: 'Mathematics',
            startDateTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
            endDateTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
            meetLink: 'https://meet.google.com/xyz-uvwx-yz',
            status: 'scheduled' as const,
            teacher: { name: session?.user?.name || 'Teacher' },
        },
        {
            id: '3',
            title: 'Physics Fundamentals',
            subject: 'Physics',
            startDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            endDateTime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
            meetLink: 'https://meet.google.com/qrs-tuvw-xyz',
            status: 'scheduled' as const,
            teacher: { name: session?.user?.name || 'Teacher' },
        },
    ];

    // Mock Student Submissions for tracking
    const mockSubmissions = isArabic ? [
        { studentId: 's1', studentName: 'علي محمد', assignmentId: 'a1', assignmentTitle: 'واجب الجبر - الفصل 5', status: 'submitted' as const, submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
        { studentId: 's2', studentName: 'سارة أحمد', assignmentId: 'a1', assignmentTitle: 'واجب الجبر - الفصل 5', status: 'pending' as const },
        { studentId: 's3', studentName: 'محمد خالد', assignmentId: 'a1', assignmentTitle: 'واجب الجبر - الفصل 5', status: 'late' as const, submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
        { studentId: 's4', studentName: 'فاطمة علي', assignmentId: 'a1', assignmentTitle: 'واجب الجبر - الفصل 5', status: 'graded' as const, grade: 'A' },
        { studentId: 's5', studentName: 'أحمد حسن', assignmentId: 'a2', assignmentTitle: 'اختبار الفيزياء', status: 'pending' as const },
    ] : [
        { studentId: 's1', studentName: 'Ali Mohammed', assignmentId: 'a1', assignmentTitle: 'Algebra Homework - Ch 5', status: 'submitted' as const, submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
        { studentId: 's2', studentName: 'Sara Ahmed', assignmentId: 'a1', assignmentTitle: 'Algebra Homework - Ch 5', status: 'pending' as const },
        { studentId: 's3', studentName: 'Mohammed Khaled', assignmentId: 'a1', assignmentTitle: 'Algebra Homework - Ch 5', status: 'late' as const, submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
        { studentId: 's4', studentName: 'Fatima Ali', assignmentId: 'a1', assignmentTitle: 'Algebra Homework - Ch 5', status: 'graded' as const, grade: 'A' },
        { studentId: 's5', studentName: 'Ahmed Hassan', assignmentId: 'a2', assignmentTitle: 'Physics Quiz', status: 'pending' as const },
    ];

    // Mock Subjects the teacher teaches
    const mockSubjects = isArabic ? [
        { id: '1', name: 'رياضيات' },
        { id: '2', name: 'فيزياء' },
        { id: '3', name: 'كيمياء' },
    ] : [
        { id: '1', name: 'Mathematics' },
        { id: '2', name: 'Physics' },
        { id: '3', name: 'Chemistry' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-[var(--color-text-secondary)]">{greeting()}</p>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        {t('welcome', { name: session?.user?.name || (isArabic ? 'المعلم' : 'Teacher') })}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-full hover:bg-[var(--color-bg-card)] transition-colors relative">
                        <Bell className="w-6 h-6 text-[var(--color-text-secondary)]" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-[var(--color-bg-card)] transition-colors">
                        <Settings className="w-6 h-6 text-[var(--color-text-secondary)]" />
                    </button>
                </div>
            </header>

            {/* Yellow Announcement Bar */}
            {loading ? (
                <Skeleton className="h-12" />
            ) : (
                <AnnouncementBar
                    announcement={mockAnnouncement}
                    onViewAll={() => console.log('View all announcements')}
                />
            )}

            {/* Upcoming Lessons Carousel */}
            {loading ? (
                <div className="space-y-3">
                    <Skeleton className="h-6 w-40" />
                    <div className="flex gap-4 overflow-hidden">
                        <Skeleton className="flex-shrink-0 w-72 h-48" />
                        <Skeleton className="flex-shrink-0 w-72 h-48" />
                    </div>
                </div>
            ) : (
                <LessonCarousel
                    lessons={mockLessons}
                    title={t('upcomingLessons')}
                    onSeeAll={() => console.log('See all lessons')}
                />
            )}

            {/* AI Video Generator */}
            {!loading && (
                <AIVideoGenerator
                    classId={mockLessons[0]?.id} // Use first lesson as class context
                    subject={mockSubjects[0]?.name}
                    gradeLevel="8"
                />
            )}


            {/* Student Submissions Tracking */}
            {loading ? (
                <div className="space-y-3">
                    <Skeleton className="h-6 w-48" />
                    <div className="flex gap-4 overflow-hidden">
                        <Skeleton className="flex-shrink-0 w-44 h-40" />
                        <Skeleton className="flex-shrink-0 w-44 h-40" />
                    </div>
                </div>
            ) : (
                <StudentQuizList
                    submissions={mockSubmissions}
                    title={t('submissions')}
                    onSeeAll={() => console.log('See all submissions')}
                    onDownload={(studentId, assignmentId) => console.log('Download:', studentId, assignmentId)}
                />
            )}

            {/* Subjects I Teach */}
            {loading ? (
                <div className="space-y-3">
                    <Skeleton className="h-6 w-28" />
                    <div className="grid grid-cols-4 gap-3">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-20" />
                        ))}
                    </div>
                </div>
            ) : (
                <SubjectGrid
                    subjects={mockSubjects}
                    title={t('mySubjects')}
                    onSeeAll={() => console.log('See all subjects')}
                    onSubjectClick={(id) => console.log('Subject clicked:', id)}
                />
            )}
        </div>
    );
}
