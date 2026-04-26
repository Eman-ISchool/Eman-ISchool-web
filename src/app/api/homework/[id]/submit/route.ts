import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { generateRequestId } from '@/lib/request-id';

export const dynamic = 'force-dynamic';
// POST - Submit homework assignment
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const requestId = generateRequestId();
  const assignmentId = params.id;

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

    // Only students can submit homework
    if (currentUser.role !== 'student') {
      return NextResponse.json(
        { error: 'Forbidden', code: 'FORBIDDEN', requestId },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { text_answer, file_url } = body;

    // Validate at least one submission type
    if (!text_answer && !file_url) {
      return NextResponse.json(
        { error: 'At least one of text_answer or file_url is required', code: 'VALIDATION_ERROR', requestId },
        { status: 400 }
      );
    }

    // Fetch assignment to validate
    const { data: assignment, error: assignmentError } = await supabaseAdmin
      .from('assignments')
      .select(`
        *,
        lesson:lessons!assignments_lesson_id_fkey(id, title, is_open, deadline)
      `)
      .eq('id', assignmentId)
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: 'Assignment not found', code: 'NOT_FOUND', requestId },
        { status: 404 }
      );
    }

    // Validate assignment is open
    if (!assignment.is_open) {
      return NextResponse.json(
        { error: 'Assignment is not open for submissions', code: 'ASSIGNMENT_NOT_OPEN', requestId },
        { status: 400 }
      );
    }

    // Fetch lesson to check status
    const { data: lesson, error: lessonError } = await supabaseAdmin
      .from('lessons')
      .select('id, status')
      .eq('id', assignment.lesson_id)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json(
        { error: 'Lesson not found', code: 'NOT_FOUND', requestId },
        { status: 404 }
      );
    }

    // Validate lesson is not completed
    if (lesson.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot submit homework for completed lesson', code: 'LESSON_COMPLETED', requestId },
        { status: 400 }
      );
    }

    // Insert submission
    const { data: submission, error: submissionError } = await supabaseAdmin
      .from('assignment_submissions')
      .insert({
        assignment_id: assignmentId,
        student_id: currentUser.id,
        text_answer: text_answer || null,
        file_url: file_url || null,
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (submissionError) {
      console.error('Error submitting homework:', submissionError);
      return NextResponse.json(
        { error: 'Failed to submit homework', code: 'HOMEWORK_SUBMIT_ERROR', requestId },
        { status: 500 }
      );
    }

    return NextResponse.json({ submission, requestId }, { status: 201 });
  } catch (error) {
    console.error('Error submitting homework:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', code: 'INTERNAL_SERVER_ERROR', requestId },
      { status: 500 }
    );
  }
}
