import { getServerSession } from 'next-auth';
import { authOptions, isTeacherOrAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';
import { CreateCourseForm } from '@/components/teacher/CreateCourseForm';

export default async function NewCoursePage({
    params: { locale },
    searchParams,
}: {
    params: { locale: string };
    searchParams?: { gradeId?: string };
}) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || !isTeacherOrAdmin(user?.role)) {
        redirect(withLocalePrefix('/', locale));
    }

    // Fetch grades from API endpoint (API-First Architecture compliance)
    const gradesRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/grade-levels`, {
        cache: 'no-store',
    });
    const gradesData = await gradesRes.json();
    const grades = gradesData.grades || [];

    const { data } = await supabaseAdmin
        .from('subjects')
        .select('id, title')
        .eq('teacher_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
    const subjects: any[] = data || [];

    return (
        <div className="space-y-6">
            <CreateCourseForm
                grades={grades}
                subjects={subjects || []}
                locale={locale}
                initialGradeId={searchParams?.gradeId || ''}
            />
        </div>
    );
}
