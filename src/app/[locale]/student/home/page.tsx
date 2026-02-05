'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Bell, Settings } from 'lucide-react';
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

// Skeleton loader component
function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />;
}

// Mock data types needed locally if strictly typed, but can infer
// ...

export default function StudentHomePage() {
    const router = useRouter();
    const pathname = usePathname();
    const locale = getLocaleFromPathname(pathname);
    const { data: session } = useSession();
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [topAnnouncement, setTopAnnouncement] = useState<ApiAnnouncement | null>(null);

    useEffect(() => {
        // Fetch announcements from API
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
        // TODO: Implement actual upload
        console.log('Uploading file for assignment:', assignmentId, file.name);
        await new Promise(resolve => setTimeout(resolve, 2000));
    };

    const greeting = () => {
        const hour = new Date().getHours();
        if (language === 'ar') {
            if (hour < 12) return 'صباح الخير';
            if (hour < 17) return 'طاب يومك';
            return 'مساء الخير';
        }
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    // Mock Data - Bilingual
    const mockAnnouncement = {
        id: '1',
        title: language === 'ar' ? 'تنبيه: غياب المعلم' : 'Notice: Teacher Absence',
        body: language === 'ar'
            ? 'سيكون المعلم غائباً اليوم. يرجى مراجعة الجدول الدراسي لأي تغييرات أو دروس بديلة.'
            : 'The teacher will be absent today. Please check your schedule for any changes or make-up classes.',
        priority: 'high' as const,
        createdAt: new Date().toISOString(),
    };

    const mockLessons = language === 'ar' ? [
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

    const mockAssignments = language === 'ar' ? [
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

    const mockTeachers = language === 'ar' ? [
        { id: '1', name: 'د. أحمد حسن', subjects: ['رياضيات', 'فيزياء'] },
        { id: '2', name: 'أ. سارة جونسون', subjects: ['لغة إنجليزية', 'أدب'] },
    ] : [
        { id: '1', name: 'Dr. Ahmed Hassan', subjects: ['Mathematics', 'Physics'] },
        { id: '2', name: 'Ms. Sarah Johnson', subjects: ['English', 'Literature'] },
    ];

    const mockSubjects = language === 'ar' ? [
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

    return (
        <div className="space-y-6">
            {/* Top Announcement Bar from Admin */}
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

            {/* Header */}
            <header className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-[var(--color-text-secondary)]">{greeting()}</p>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        {session?.user?.name || (language === 'ar' ? 'طالب' : 'Student')}
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

            {/* Search - Removed per user request */}

            {/* Announcement - Only show when loaded and has content */}
            {!loading && mockAnnouncement && (
                <AnnouncementCard
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
                    title={t('home.upcomingLessons')}
                    onSeeAll={() => console.log('See all lessons')}
                />
            )}

            {/* Assignments & Quizzes */}
            {loading ? (
                <div className="space-y-3">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-20" />
                    <Skeleton className="h-20" />
                </div>
            ) : (
                <AssignmentList
                    assignments={mockAssignments}
                    title={t('home.assignments')}
                    onSeeAll={() => console.log('See all assignments')}
                    onUpload={handleUpload}
                />
            )}

            {/* Teachers */}
            {loading ? (
                <div className="space-y-3">
                    <Skeleton className="h-6 w-32" />
                    <div className="flex gap-4 overflow-hidden">
                        <Skeleton className="flex-shrink-0 w-44 h-40" />
                        <Skeleton className="flex-shrink-0 w-44 h-40" />
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

            {/* Payments List */}
            <PaymentList />

            {/* Subjects */}
            {loading ? (
                <div className="space-y-3">
                    <Skeleton className="h-6 w-28" />
                    <div className="grid grid-cols-4 gap-3">
                        {[...Array(8)].map((_, i) => (
                            <Skeleton key={i} className="h-20" />
                        ))}
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
        </div>
    );
}
