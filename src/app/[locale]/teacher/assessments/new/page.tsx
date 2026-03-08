import { getServerSession } from 'next-auth';
import { authOptions, isTeacherOrAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';
import { AssessmentBuilder } from '@/components/teacher/AssessmentBuilder';

export default async function NewAssessmentPage({
    params: { locale }
}: {
    params: { locale: string };
}) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || !isTeacherOrAdmin(user?.role)) {
        redirect(withLocalePrefix('/', locale));
    }

    // Fetch contexts to link the assessment to
    const [{ data: courses }, { data: subjects }, { data: lessons }] = await Promise.all([
        supabaseAdmin.from('courses').select('id, title').eq('teacher_id', user.id),
        supabaseAdmin.from('subjects').select('id, title').eq('teacher_id', user.id), // assuming teacher mapping exists
        supabaseAdmin.from('lessons').select('id, title') // lessons don't explicitly have teacher_id but we can pull them
    ]);

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Create New Assessment</h1>
                <p className="text-gray-500">Design your test, set time limits, and add questions.</p>
            </div>

            <AssessmentBuilder
                teacherId={user.id}
                courses={courses || []}
                subjects={subjects || []}
                lessons={lessons || []}
            />
        </div>
    );
}
