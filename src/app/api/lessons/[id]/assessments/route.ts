import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isAdmin, isTeacherOrAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { generateRequestId } from '@/lib/request-id';

// GET - Fetch assessments for a lesson
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const requestId = generateRequestId();
  const lessonId = params.id;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') as 'quiz' | 'exam';

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

    // Fetch lesson to verify access
    const { data: lesson, error: lessonError } = await supabaseAdmin
      .from('lessons')
      .select(`
        *,
        course:courses!lessons_course_id_fkey(id, title, teacher_id)
      `)
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json(
        { error: 'Lesson not found', code: 'NOT_FOUND', requestId },
        { status: 404 }
      );
    }

    // Check if user has access to this lesson
    const hasAccess = isAdmin(currentUser.role) || 
                     (isTeacherOrAdmin(currentUser.role) && lesson.teacher_id === currentUser.id);

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden', code: 'FORBIDDEN', requestId },
        { status: 403 }
      );
    }

    // Fetch assessments with type filter
    const { data: assessments, error: assessmentsError } = await supabaseAdmin
      .from('assessments')
      .select(`
        *,
        assessment_questions(count)
      `)
      .eq('lesson_id', lessonId)
      .eq('assessment_type', type)
      .order('created_at', { ascending: false });

    if (assessmentsError) {
      console.error('Error fetching assessments:', assessmentsError);
      return NextResponse.json(
        { error: 'Failed to fetch assessments', code: 'ASSESSMENTS_FETCH_ERROR', requestId },
        { status: 500 }
      );
    }

    // For students, only show their submissions (not counts)
    if (currentUser.role === 'student') {
      const { data: submissions, error: submissionsError } = await supabaseAdmin
        .from('assessment_submissions')
        .select(`
          *,
          student:users!assessment_submissions_student_id_fkey(id, name)
        `)
        .eq('assessment_id', assessments.map(a => a.id))
        .in('student_id', currentUser.id)
        .order('submitted_at', { ascending: false });

      if (submissionsError) {
        console.error('Error fetching submissions:', submissionsError);
        return NextResponse.json(
          { error: 'Failed to fetch submissions', code: 'SUBMISSIONS_FETCH_ERROR', requestId },
          { status: 500 }
        );
      }
    }

    // For teachers/admins, include counts
    const assessmentsWithCounts = assessments.map(assessment => ({
      ...assessment,
      submission_count: assessment.assessment_questions?.count || 0,
    }));

    return NextResponse.json({ assessments: assessmentsWithCounts, requestId });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', code: 'INTERNAL_SERVER_ERROR', requestId },
      { status: 500 }
    );
  }
}

// POST - Create assessment
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const requestId = generateRequestId();
  const lessonId = params.id;

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

    // Only teachers and admins can create assessments
    if (!isTeacherOrAdmin(currentUser.role)) {
      return NextResponse.json(
        { error: 'Forbidden', code: 'FORBIDDEN', requestId },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { assessment_type, title, duration_minutes, attempt_limit, late_submissions_allowed } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required', code: 'VALIDATION_ERROR', requestId },
        { status: 400 }
      );
    }

    if (!assessment_type) {
      return NextResponse.json(
        { error: 'Assessment type is required', code: 'VALIDATION_ERROR', requestId },
        { status: 400 }
      );
    }

    // Validate assessment_type is valid
    if (
!['quiz', 'exam'].includes(assessment_type)
    ) {
      return NextResponse.json(
        { error: 'Invalid assessment type. Must be quiz or exam', code: 'VALIDATION_ERROR', requestId },
        { status: 400 }
      );
    }

    // Validate duration_minutes is positive
    if (duration_minutes !== undefined && duration_minutes < 0) {
      return NextResponse.json(
        { error: 'Duration must be a positive number', code: 'VALIDATION_ERROR', requestId },
        { status: 400 }
      );
    }

    // Validate attempt_limit is positive
    if (attempt_limit !== undefined && attempt_limit < 1) {
      return NextResponse.json(
        { error: 'Attempt limit must be at least 1', code: 'VALIDATION_ERROR', requestId },
        { status: 400 }
      );
    }

    // Validate late_submissions_allowed is boolean
    if (late_submissions_allowed !== undefined && typeof late_submissions_allowed !== 'boolean') {
      return NextResponse.json(
        { error: 'Late submissions allowed must be a boolean', code: 'VALIDATION_ERROR', requestId },
        { status: 400 }
      );
    }

    // Fetch lesson to validate lesson_id
    const { data: lesson, error: lessonError } = await supabaseAdmin
      .from('lessons')
      .select('id, course_id')
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json(
        { error: 'Lesson not found', code: 'NOT_FOUND', requestId },
        { status: 404 }
      );
    }

    // Verify teacher owns the course or is admin
    if (lesson.teacher_id !== currentUser.id && !isAdmin(currentUser.role)) {
      return NextResponse.json(
        { error: 'Forbidden', code: 'FORBIDDEN', detail: 'You can only create assessments for your own courses', requestId },
        { status: 403 }
      );
    }

    // Create assessment
    const { data: assessment, error: assessmentError } = await supabaseAdmin
      .from('assessments')
      .insert({
        lesson_id: lessonId,
        assessment_type,
        title,
        duration_minutes: duration_minutes || null,
        attempt_limit: attempt_limit || 1,
        late_submissions_allowed: late_submissions_allowed !== undefined ? late_submissions_allowed : false,
      })
      .select()
      .single();

    if (assessmentError) {
      console.error('Error creating assessment:', assessmentError);
      return NextResponse.json(
        { error: 'Failed to create assessment', code: 'ASSESSMENT_CREATE_ERROR', requestId },
        { status: 500 }
      );
    }

    return NextResponse.json({ assessment, requestId }, { status: 201 });
  } catch (error) {
    console.error('Error creating assessment:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', code: 'INTERNAL_SERVER_ERROR', requestId },
      { status: 500 }
    );
  }
}
