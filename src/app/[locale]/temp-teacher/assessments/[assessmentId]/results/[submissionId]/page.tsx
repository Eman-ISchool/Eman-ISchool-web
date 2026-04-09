import { getServerSession } from 'next-auth';
import { authOptions, isTeacherOrAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';
import { SubmissionGrader } from '@/components/teacher/SubmissionGrader';

export default async function AssessmentSubmissionPage({
    params: { locale, assessmentId, submissionId }
}: {
    params: { locale: string; assessmentId: string; submissionId: string };
}) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || !isTeacherOrAdmin(user?.role)) {
        redirect(withLocalePrefix('/', locale));
    }

    // Fetch submission with student info
    const { data: submission } = await supabaseAdmin
        .from('assessment_submissions')
        .select(`
            *,
            student:users(id, name, email)
        `)
        .eq('id', submissionId)
        .eq('assessment_id', assessmentId)
        .single();

    if (!submission) {
        redirect(withLocalePrefix(`/temp-teacher/assessments/${assessmentId}/results`, locale));
    }

    // Fetch assessment & questions
    const { data: assessment } = await supabaseAdmin
        .from('assessments')
        .select('*, questions:assessment_questions(*)')
        .eq('id', assessmentId)
        .eq('teacher_id', user.id)
        .single();

    if (!assessment) {
        redirect(withLocalePrefix('/temp-teacher/assessments', locale));
    }

    // Fetch student's answers
    const { data: answers } = await supabaseAdmin
        .from('assessment_answers')
        .select('*')
        .eq('submission_id', submissionId);

    // Merge questions with answers for the grader
    const mergedData = assessment.questions.map((q: any) => {
        const answer = answers?.find((a: any) => a.question_id === q.id) || null;
        return {
            question: q,
            answer: answer
        };
    }).sort((a: any, b: any) => a.question.sort_order - b.question.sort_order);

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <SubmissionGrader
                submission={submission}
                assessment={assessment}
                mergedData={mergedData}
                locale={locale}
            />
        </div>
    );
}
