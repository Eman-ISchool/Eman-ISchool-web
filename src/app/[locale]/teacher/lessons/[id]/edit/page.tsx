import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { notFound, redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';
import { LessonForm } from '@/components/teacher/LessonForm';

export default async function EditLessonPage({
    params: { id, locale }
}: {
    params: { id: string; locale: string };
}) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || user?.role !== 'teacher') {
        redirect(withLocalePrefix('/', locale));
    }

    // Fetch lesson
    const { data: lesson } = await supabaseAdmin
        .from('lessons')
        .select(`
            *,
            course:courses(id, teacher_id)
        `)
        .eq('id', id)
        .single();

    if (!lesson) {
        notFound();
    }

    // Verify ownership
    if (lesson.teacher_id !== user.id && lesson.course?.teacher_id !== user.id) {
        return <div className="p-8 text-center text-red-500">Access Denied</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Edit Lesson</h1>
            <LessonForm
                lesson={lesson}
                locale={locale}
            />
        </div>
    );
}
