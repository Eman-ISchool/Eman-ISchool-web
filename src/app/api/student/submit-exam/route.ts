import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const user = session?.user as any;
        
        if (!session || user?.role !== 'student') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const { submissionId, assessmentId, answers } = await req.json();
        
        // Rate limiting: Check if student has submitted this exam recently
        const { data: recentSubmission } = await supabaseAdmin
            .from('assessment_submissions')
            .select('id, submitted_at')
            .eq('student_id', user.id)
            .eq('assessment_id', assessmentId)
            .gte('submitted_at', new Date(Date.now() - 60000).toISOString()) // 1 minute ago
            .order('submitted_at', { ascending: false })
            .limit(1)
            .single();
        
        if (recentSubmission && recentSubmission.id !== submissionId) {
            return NextResponse.json({
                error: 'Please wait before submitting again'
            }, { status: 429 });
        }

        // 1. Fetch questions to evaluate answers securely
        const { data: questions, error: qError } = await supabaseAdmin
            .from('assessment_questions')
            .select('*')
            .eq('assessment_id', assessmentId);

        if (qError || !questions) throw qError || new Error("Failed to load questions");

        // 2. Fetch the submission to calculate time taken
        const { data: submission, error: sError } = await supabaseAdmin
            .from('assessment_submissions')
            .select('*')
            .eq('id', submissionId)
            .eq('student_id', user.id)
            .single();

        if (sError || !submission) throw sError || new Error("Invalid submission");
        if (submission.status !== 'in_progress') {
            return NextResponse.json({ error: 'Assessment already submitted' }, { status: 400 });
        }

        let totalScore = 0;
        let maxScore = 0;
        let manualGradingRequired = false;

        // 3. Prepare answers for insertion and score calculations
        const answerInserts = questions.map((q: any) => {
            const studentAnswer = answers[q.id];
            maxScore += q.points;

            let isCorrect = null;
            let pointsAwarded = null;
            let textAnswer = null;
            let fileUrl = null;
            let selectedOptionIndex = null;

            if (q.question_type === 'multiple_choice') {
                selectedOptionIndex = studentAnswer !== undefined ? parseInt(studentAnswer) : null;
                // Evaluate correct answer
                if (selectedOptionIndex !== null && q.options_json && q.options_json[selectedOptionIndex]) {
                    isCorrect = q.options_json[selectedOptionIndex].is_correct === true;
                    pointsAwarded = isCorrect ? q.points : 0;
                    totalScore += pointsAwarded;
                } else {
                    isCorrect = false;
                    pointsAwarded = 0;
                }
            } else if (q.question_type === 'text') {
                textAnswer = studentAnswer || null;
                manualGradingRequired = true;
            } else if (q.question_type === 'file_upload') {
                fileUrl = studentAnswer || null;
                manualGradingRequired = true;
            }

            return {
                submission_id: submissionId,
                question_id: q.id,
                student_id: user.id,
                text_answer: textAnswer,
                selected_option_index: selectedOptionIndex,
                file_url: fileUrl,
                is_correct: isCorrect,
                points_awarded: pointsAwarded
            };
        });

        // 4. Upsert Answers using onConflict to avoid race conditions
        // This ensures atomicity - either all answers are inserted or none are
        if (answerInserts.length > 0) {
            const { error: aError } = await supabaseAdmin
                .from('assessment_answers')
                .upsert(answerInserts, {
                    onConflict: 'submission_id,question_id'
                });
            if (aError) throw aError;
        }

        // 5. Update Submission
        const submittedAt = new Date();
        const startedAt = new Date(submission.started_at);
        const timeTakenMinutes = Math.max(1, Math.round((submittedAt.getTime() - startedAt.getTime()) / 60000));

        const { error: updateError } = await supabaseAdmin
            .from('assessment_submissions')
            .update({
                status: 'submitted',
                submitted_at: submittedAt.toISOString(),
                time_taken_minutes: timeTakenMinutes,
                total_score: totalScore,
                max_score: maxScore,
                manual_grading_required: manualGradingRequired
            })
            .eq('id', submissionId);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true, totalScore, manualGradingRequired });

    } catch (error: any) {
        console.error("Submission error details:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
