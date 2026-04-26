import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { generateRequestId } from '@/lib/request-id';

export const dynamic = 'force-dynamic';
// POST - Submit assessment
export async function POST(
  req: Request,
  { params }: { params: { id: string; assessmentId: string } }
) {
  const requestId = generateRequestId();
  const lessonId = params.id;
  const assessmentId = params.assessmentId;

  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured', code: 'DATABASE_NOT_CONFIGURED', requestId },
        { status: 500 }
      );
    }

    const session = await getServerSession(authOptions);
    const currentUser = session?.user ? await getCurrentUser(session) : null;

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED', requestId },
        { status: 401 }
      );
    }

    // Only students can submit assessments
    if (currentUser.role !== 'student') {
      return NextResponse.json(
        { error: 'Forbidden', code: 'FORBIDDEN', detail: 'Only students can submit assessments', requestId },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { answers } = body;

    // Validate answers is an array
    if (!Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Answers must be an array', code: 'VALIDATION_ERROR', requestId },
        { status: 400 }
      );
    }

    // Fetch assessment to validate
    const { data: assessment, error: assessmentError } = await supabaseAdmin
      .from('assessments')
      .select(`
        *,
        lesson:lessons!assessments_lesson_id_fkey(id, course_id)
      `)
      .eq('id', assessmentId)
      .single();

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { error: 'Assessment not found', code: 'NOT_FOUND', requestId },
        { status: 404 }
      );
    }

    // Validate assessment belongs to the lesson
    if (assessment.lesson_id !== lessonId) {
      return NextResponse.json(
        { error: 'Assessment does not belong to this lesson', code: 'VALIDATION_ERROR', requestId },
        { status: 400 }
      );
    }

    // Validate lesson is not completed
    if (assessment.lesson_status === 'completed') {
      return NextResponse.json(
        { error: 'Lesson is completed', code: 'LESSON_COMPLETED', requestId },
        { status: 400 }
      );
    }

    // Validate student is enrolled in the course
    const { data: enrollment, error: enrollmentError } = await supabaseAdmin
      .from('enrollments')
      .select('id')
      .eq('student_id', currentUser.id)
      .eq('course_id', assessment.course_id)
      .single();

    if (enrollmentError || !enrollment) {
      return NextResponse.json(
        { error: 'Not enrolled in this course', code: 'NOT_ENROLLED', requestId },
        { status: 403 }
      );
    }

    // Validate attempt_limit
    if (assessment.attempt_limit) {
      const { count, error: countError } = await supabaseAdmin
        .from('assessment_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('assessment_id', assessmentId)
        .eq('student_id', currentUser.id);

      if (countError) {
        console.error('Error counting submissions:', countError);
        return NextResponse.json(
          { error: 'Failed to validate attempt limit', code: 'ATTEMPT_LIMIT_ERROR', requestId },
          { status: 500 }
        );
      }

      if (count !== null && count >= assessment.attempt_limit) {
        return NextResponse.json(
          { error: 'Attempt limit reached', code: 'ATTEMPT_LIMIT_REACHED', requestId },
          { status: 400 }
        );
      }
    }

    // Fetch assessment questions for auto-grading
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('assessment_questions')
      .select('*')
      .eq('assessment_id', assessmentId);

    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
      return NextResponse.json(
        { error: 'Failed to fetch questions', code: 'QUESTIONS_FETCH_ERROR', requestId },
        { status: 500 }
      );
    }

    // Auto-grade MCQ and True-False questions
    let correctCount = 0;
    const gradedAnswers = answers.map(answer => {
      const question = questions.find(q => q.id === answer.question_id);
      if (!question) {
        return { ...answer, is_correct: false };
      }

      // Auto-grade MCQ and True-False
      if (question.question_type === 'mcq' || question.question_type === 'true_false') {
        const isCorrect = answer.selected_option === question.correct_answer;
        if (isCorrect) {
          correctCount++;
        }
        return {
          ...answer,
          is_correct: isCorrect,
          correct_answer: question.correct_answer,
        };
      }

      // For text and essay questions, manual grading is required
      return { ...answer, is_correct: null };
    });

    // Calculate score
    const score = questions.length > 0 ? (correctCount / questions.length) * 100 : 0;

    // Check if all questions are auto-graded
    const allAutoGraded = questions.every(
      q => q.question_type === 'mcq' || q.question_type === 'true_false'
    );

    // Insert submission
    const { data: submission, error: submissionError } = await supabaseAdmin
      .from('assessment_submissions')
      .insert({
        student_id: currentUser.id,
        assessment_id: assessmentId,
        answers: gradedAnswers,
        score: allAutoGraded ? score : null,
        graded_at: allAutoGraded ? new Date().toISOString() : null,
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (submissionError) {
      console.error('Error creating submission:', submissionError);
      return NextResponse.json(
        { error: 'Failed to submit assessment', code: 'SUBMISSION_ERROR', requestId },
        { status: 500 }
      );
    }

    return NextResponse.json({ submission, requestId }, { status: 201 });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', code: 'INTERNAL_SERVER_ERROR', requestId },
      { status: 500 }
    );
  }
}
