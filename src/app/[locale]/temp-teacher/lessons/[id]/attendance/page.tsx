import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';
import { AttendanceSheet } from '@/components/teacher/AttendanceSheet';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function LessonAttendancePage({
    params: { locale, id } // id is lessonId
}: {
    params: { locale: string; id: string };
}) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || user?.role !== 'teacher') {
        redirect(withLocalePrefix('/', locale));
    }

    // Fetch lesson to get courseId
    const { data: lesson } = await supabaseAdmin
        .from('lessons')
        .select('*, course:courses(id, title)')
        .eq('id', id)
        .single();

    if (!lesson) {
        return <div>Lesson not found</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                    {/* Go back to course attendance list */}
                    <Link href={withLocalePrefix(`/temp-teacher/courses/${lesson.course_id}/attendance`, locale)}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to List
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Mark Attendance</h1>
                    <p className="text-gray-500">{lesson.course.title} - {lesson.title}</p>
                </div>
            </div>

            <AttendanceSheet lessonId={lesson.id} courseId={lesson.course_id} />
        </div>
    );
}
