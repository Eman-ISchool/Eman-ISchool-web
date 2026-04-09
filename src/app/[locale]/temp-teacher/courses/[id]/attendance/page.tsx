import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function TeacherAttendancePage({
    params: { locale, id } // id is likely courseId or lessonId?? 
    // Wait, the path is /teacher/courses/[courseId]/attendance.
    // But attendance is per lesson. 
    // This page should probably let you SELECT a lesson or show for a specfic lesson.
    // Let's assume this page shows a LIST of lessons to take attendance for, OR
    // we use a different route structure like /teacher/lessons/[lessonId]/attendance.
    // The previous prompt said /teacher/courses/[id]/attendance.
    // Let's make this page list lessons, and clicking one opens the sheet (maybe in a modal or separate page).
    // ACTUALLY, let's make /teacher/lessons/[id]/attendance be the sheet page.
}: {
    params: { locale: string; id: string };
}) {
    // If this is courses/[id]/attendance, 'id' is courseId.
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || user?.role !== 'teacher') {
        redirect(withLocalePrefix('/', locale));
    }

    // Fetch lessons for this course
    const { data: lessons } = await supabaseAdmin
        .from('lessons')
        .select('*')
        .eq('course_id', id)
        .order('start_date_time', { ascending: false }); // Newest first

    const courseId = id;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={withLocalePrefix(`/temp-teacher/courses/${courseId}`, locale)}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Course
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold">Attendance Records</h1>
            </div>

            <div className="grid gap-4">
                {lessons?.map(lesson => (
                    <div key={lesson.id} className="p-4 border rounded-lg bg-white flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold">{lesson.title}</h3>
                            <p className="text-sm text-gray-500">
                                {new Date(lesson.start_date_time).toLocaleDateString(locale)} - {new Date(lesson.start_date_time).toLocaleTimeString(locale)}
                            </p>
                        </div>
                        <Button asChild size="sm">
                            <Link href={withLocalePrefix(`/temp-teacher/lessons/${lesson.id}/attendance`, locale)}>
                                Take Attendance
                            </Link>
                        </Button>
                    </div>
                ))}
                {lessons?.length === 0 && <p className="text-gray-500">No lessons found.</p>}
            </div>
        </div>
    );
}
