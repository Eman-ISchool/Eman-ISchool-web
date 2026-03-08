import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';
import { ExamTaker } from '@/components/student/ExamTaker';

export default async function TakeAssessmentPage({
    params: { locale, assessmentId }
}: {
    params: { locale: string; assessmentId: string };
}) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || user?.role !== 'student') {
        redirect(withLocalePrefix('/', locale));
    }

    // Fetch assessment with questions
    const { data: assessment } = await supabaseAdmin
        .from('assessments')
        .select('*, questions:assessment_questions(*)')
        .eq('id', assessmentId)
        .eq('is_published', true)
        .single();

    if (!assessment) {
        redirect(withLocalePrefix('/student/assessments', locale));
    }

    // Sanitize questions: Remove 'is_correct' from options so students can't cheat via DevTools
    const sanitizedQuestions = assessment.questions.map((q: any) => {
        let sanitizedOptions = q.options_json;
        if (q.question_type === 'multiple_choice' && Array.isArray(q.options_json)) {
            sanitizedOptions = q.options_json.map((opt: any) => ({
                id: opt.id || Math.random().toString(), // fallback if id is missing
                text: opt.text
            }));
        }
        return {
            ...q,
            options_json: sanitizedOptions
        };
    }).sort((a: any, b: any) => a.sort_order - b.sort_order);

    // Create a new submission OR find an in_progress one for this student
    let { data: submission } = await supabaseAdmin
        .from('assessment_submissions')
        .select('*')
        .eq('assessment_id', assessmentId)
        .eq('student_id', user.id)
        .eq('status', 'in_progress')
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

    // If no in_progress submission, create one. 
    // This allows "Retake" to just start a new row.
    if (!submission) {
        const { data: newSub, error } = await supabaseAdmin
            .from('assessment_submissions')
            .insert([{
                assessment_id: assessmentId,
                student_id: user.id,
                status: 'in_progress',
                started_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) {
            console.error(error);
            return <div className="p-8 text-center text-red-500">Failed to start assessment.</div>;
        }
        submission = newSub;
    }

    // Fetch existing answers if they are resuming an in_progress attempt
    const { data: existingAnswers } = await supabaseAdmin
        .from('assessment_answers')
        .select('*')
        .eq('submission_id', submission.id);

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            <ExamTaker
                assessment={assessment}
                questions={sanitizedQuestions}
                submission={submission}
                existingAnswers={existingAnswers || []}
                locale={locale}
            />
        </div>
    );
}
