import { getServerSession } from 'next-auth';
import { authOptions, isTeacherOrAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { notFound, redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';

export default async function LessonDetailsPage({
    params: { id, locale }
}: {
    params: { id: string; locale: string };
}) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || !isTeacherOrAdmin(user?.role)) {
        redirect(withLocalePrefix('/', locale));
    }

    // Fetch lesson details to get course_id
    const { data: lesson } = await supabaseAdmin
        .from('lessons')
        .select('course_id')
        .eq('id', id)
        .single();

    if (!lesson || !lesson.course_id) {
        notFound();
    }

    // Redirect to new route
    redirect(withLocalePrefix(`/temp-teacher/courses/${lesson.course_id}/lessons/${id}`, locale));
}
