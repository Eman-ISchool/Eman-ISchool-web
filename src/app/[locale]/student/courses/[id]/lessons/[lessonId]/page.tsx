import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { notFound, redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';
import { LessonDetailPage } from '@/components/lessons/LessonDetailPage';
import { getTranslations } from 'next-intl/server';

export default async function StudentLessonDetailPage({
    params: { id, lessonId, locale }
}: {
    params: { id: string; lessonId: string; locale: string };
}) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    const t = await getTranslations('student.lessonDetails');

    if (!session || user?.role !== 'student') {
        redirect(withLocalePrefix('/', locale));
    }

    // Fetch lesson details
    const { data: lesson, error: lessonError } = await supabaseAdmin
        .from('lessons')
        .select('*, course:courses(id, title)')
        .eq('id', lessonId)
        .single();

    if (lessonError || !lesson) {
        notFound();
    }

    // Check if student is enrolled in the course
    const { data: enrollment } = await supabaseAdmin
        .from('enrollments')
        .select('*')
        .eq('course_id', id)
        .eq('student_id', user.id)
        .eq('status', 'active')
        .single();

    if (!enrollment) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">{t('notEnrolled')}</h1>
                <p className="text-gray-600">{t('enrollToView')}</p>
                <Link
                    href={withLocalePrefix(`/student/courses/${id}`, locale)}
                    className="inline-block px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 mt-4"
                >
                    {t('viewCourse')}
                </Link>
            </div>
        );
    }

    // Fetch student's attendance record for this lesson
    const { data: attendance } = await supabaseAdmin
        .from('attendance')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('student_id', user.id)
        .single();

    const isJoined = !!attendance?.join_time;
    const now = new Date();
    const startTime = new Date(lesson.start_date_time);
    const endTime = new Date(lesson.end_date_time);
    const isLive = now >= startTime && now <= endTime;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href={withLocalePrefix(`/student/courses/${id}`, locale)}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    ← Back to Course
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">{lesson.title}</h1>
                    <p className="text-gray-500">{lesson.course?.title}</p>
                </div>
            </div>

            {/* Lesson Detail Page */}
            <LessonDetailPage
                lessonId={lessonId}
                courseId={id}
                initialTab="info"
            />
        </div>
    );
}
