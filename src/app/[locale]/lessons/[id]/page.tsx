import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { notFound, redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';

export default async function LessonDetailEntryPage({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(withLocalePrefix('/', locale));
  }

  const currentUser = await getCurrentUser(session);

  if (!currentUser) {
    redirect(withLocalePrefix('/', locale));
  }

  if (currentUser.role === 'teacher' || currentUser.role === 'admin') {
    redirect(withLocalePrefix(`/teacher/lessons/${id}`, locale));
  }

  if (currentUser.role === 'student') {
    const { data: lesson } = await supabaseAdmin
      .from('lessons')
      .select('course_id')
      .eq('id', id)
      .single();

    if (!lesson?.course_id) {
      notFound();
    }

    redirect(withLocalePrefix(`/student/courses/${lesson.course_id}/lessons/${id}`, locale));
  }

  redirect(withLocalePrefix('/', locale));
}
