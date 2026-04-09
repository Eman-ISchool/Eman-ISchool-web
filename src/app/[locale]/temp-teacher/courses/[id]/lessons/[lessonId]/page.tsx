import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { notFound, redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';
import LessonDetailPage from '@/components/lessons/LessonDetailPage';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function TeacherLessonDetailPage({
    params: { id, lessonId, locale }
}: {
    params: { id: string; lessonId: string; locale: string };
}) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    const t = await getTranslations('teacher.lessonDetails');

    if (!session || user?.role !== 'teacher') {
        redirect(withLocalePrefix('/', locale));
    }

    // Verify course ownership
    const courseRes = await supabaseAdmin
        .from('courses')
        .select('id, title, teacher_id')
        .eq('id', id)
        .single();

    const course = courseRes.data;

    if (!course) {
        notFound();
    }

    if (course.teacher_id !== user.id && user.role !== 'admin') {
        redirect(withLocalePrefix('/temp-teacher/courses', locale));
    }

    // Fetch lesson details
    const lessonRes = await supabaseAdmin
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

    const lesson = lessonRes.data;

    if (!lesson) {
        notFound();
    }

    // Verify lesson belongs to this course
    if (lesson.course_id !== id) {
        redirect(withLocalePrefix(`/temp-teacher/courses/${id}`, locale));
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={withLocalePrefix(`/temp-teacher/courses/${id}`, locale)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{lesson.title}</h1>
                    <p className="text-gray-500">{course.title}</p>
                </div>
            </div>

            {/* Lesson Detail Page */}
            <LessonDetailPage
                lesson={lesson}
                course={course}
                userRole="teacher"
                locale={locale}
            />
        </div>
    );
}
