import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isAdmin, isTeacherOrAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { generateRequestId } from '@/lib/request-id';

// GET - Fetch assessment results
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const requestId = generateRequestId();
  const assessmentId = params.id;
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('student_id');

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

    // Only teachers and admins can view results
    if (!isTeacherOrAdmin(currentUser.role)) {
      return NextResponse.json(
        { error: 'Forbidden', code: 'FORBIDDEN', requestId },
        { status: 403 }
      );
    }

    // Fetch assessment to verify access
    const { data: assessment, error: assessmentError } = await supabaseAdmin
      .from('assessments')
      .select(`
        *,
        lesson:lessons!assessments_lesson_id_fkey(id, course_id),
        assessment_questions(count)
      `)
      .eq('id', assessmentId)
      .single();

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { error: 'Assessment not found', code: 'NOT_FOUND', requestId },
        { status: 404 }
      );
    }

    // Verify teacher owns the course or is admin
    if (!isAdmin(currentUser.role) && assessment.teacher_id !== currentUser.id) {
      return NextResponse.json(
        { error: 'Forbidden', code: 'FORBIDDEN', detail: 'You can only view results for your own courses', requestId },
        { status: 403 }
      );
    }

    // Fetch submissions with student info
    let query = supabaseAdmin
      .from('assessment_submissions')
      .select(`
        *,
        student:users!assessment_submissions_student_id_fkey(id, name, email)
      `)
      .eq('assessment_id', assessmentId)
      .order('submitted_at', { ascending: false });

    // Filter by student_id if provided
    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    const { data: submissions, error: submissionsError } = await query;

    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError);
      return NextResponse.json(
        { error: 'Failed to fetch submissions', code: 'SUBMISSIONS_FETCH_ERROR', requestId },
        { status: 500 }
      );
    }

    // Calculate statistics
    const submissionCount = submissions.length;
    const gradedSubmissions = submissions.filter(s => s.score !== null);
    const averageScore = gradedSubmissions.length > 0
      ? gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / gradedSubmissions.length
      : null;
    const maxScore = gradedSubmissions.length > 0
      ? Math.max(...gradedSubmissions.map(s => s.score || 0))
      : null;
    const minScore = gradedSubmissions.length > 0
      ? Math.min(...gradedSubmissions.map(s => s.score || 0))
      : null;

    // Get question count
    const questionCount = assessment.assessment_questions?.count || 0;

    return NextResponse.json({
      assessment: {
        id: assessment.id,
        title: assessment.title,
        assessment_type: assessment.assessment_type,
        duration_minutes: assessment.duration_minutes,
        attempt_limit: assessment.attempt_limit,
        late_submissions_allowed: assessment.late_submissions_allowed,
        question_count: questionCount,
      },
      submissions,
      statistics: {
        submission_count: submissionCount,
        graded_count: gradedSubmissions.length,
        ungraded_count: submissionCount - gradedSubmissions.length,
        average_score: averageScore,
        max_score: maxScore,
        min_score: minScore,
      },
      requestId,
    });
  } catch (error) {
    console.error('Error fetching assessment results:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', code: 'INTERNAL_SERVER_ERROR', requestId },
      { status: 500 }
    );
  }
}
