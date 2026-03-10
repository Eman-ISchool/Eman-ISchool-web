import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { notFound, redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';
import LessonDetailPage from '@/components/lessons/LessonDetailPage';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { getMockDb } from '@/lib/mockDb';

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

    let lesson: any = null;
    let enrollment: any = null;
    if (process.env.TEST_BYPASS === 'true') {
        const db = getMockDb();
        const lessons = Array.isArray(db.lessons) ? db.lessons : [];
        const courses = Array.isArray(db.courses) ? db.courses : [];
        const enrollments = Array.isArray(db.enrollments) ? db.enrollments : [];
        lesson = lessons.find((candidate: any) => candidate.id === lessonId) || null;
        const course = courses.find((candidate: any) => candidate.id === id) || null;
        if (lesson) {
            lesson.course = course ? { id: course.id, title: course.title } : null;
        }
        enrollment = enrollments.find((candidate: any) =>
            candidate.course_id === id &&
            candidate.student_id === user.id &&
            candidate.status === 'active'
        ) || null;
    } else {
        // Fetch lesson details
        const { data: dbLesson, error: lessonError } = await supabaseAdmin
            .from('lessons')
            .select('*, course:courses(id, title)')
            .eq('id', lessonId)
            .single();

        if (lessonError || !dbLesson) {
            notFound();
        }
        lesson = dbLesson;

        // Check if student is enrolled in the course
        const { data: dbEnrollment } = await supabaseAdmin
            .from('enrollments')
            .select('*')
            .eq('course_id', id)
            .eq('student_id', user.id)
            .eq('status', 'active')
            .single();
        enrollment = dbEnrollment;
    }

    if (!lesson) {
        notFound();
    }

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
    const { data: attendance } = process.env.TEST_BYPASS === 'true'
        ? { data: null as any }
        : await supabaseAdmin
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
