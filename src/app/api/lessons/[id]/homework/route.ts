import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isAdmin, isTeacherOrAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { generateRequestId } from '@/lib/request-id';

export const dynamic = 'force-dynamic';
// GET - Fetch homework for a lesson
export async function GET(req: Request, { params }: { params: { id: string } }) {
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

    // Fetch homework for this lesson
    const { data: homework, error: homeworkError } = await supabaseAdmin
      .from('assignments')
      .select(`
        *,
        submissions:assignment_submissions(count)
      `)
      .eq('lesson_id', lessonId)
      .order('created_at', { ascending: false });

    if (homeworkError) {
      console.error('Error fetching homework:', homeworkError);
      return NextResponse.json(
        { error: 'Failed to fetch homework', code: 'HOMEWORK_FETCH_ERROR', requestId },
        { status: 500 }
      );
    }

    // For students, include their submission status
    let homeworkWithSubmissions = homework;
    if (currentUser.role === 'student') {
      homeworkWithSubmissions = await Promise.all(
        homework.map(async (hw: any) => {
          const { data: submission } = await supabaseAdmin
            .from('assignment_submissions')
            .select('id, status, submitted_at')
            .eq('assignment_id', hw.id)
            .eq('student_id', currentUser.id)
            .single();
          
          return {
            ...hw,
            submission: submission || null,
          };
        })
      );
    }

    return NextResponse.json({ homework: homeworkWithSubmissions, requestId });
  } catch (error) {
    console.error('Error fetching homework:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', code: 'INTERNAL_SERVER_ERROR', requestId },
      { status: 500 }
    );
  }
}

// POST - Create homework for a lesson
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

    // Only teachers and admins can create homework
    if (!isTeacherOrAdmin(currentUser.role)) {
      return NextResponse.json(
        { error: 'Forbidden', code: 'FORBIDDEN', requestId },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, description, deadline, forms_link } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required', code: 'VALIDATION_ERROR', requestId },
        { status: 400 }
      );
    }

    // Fetch lesson to get course_id
    const { data: lesson, error: lessonError } = await supabaseAdmin
      .from('lessons')
      .select('course_id')
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json(
        { error: 'Lesson not found', code: 'NOT_FOUND', requestId },
        { status: 404 }
      );
    }

    // Verify teacher owns the course
    if (lesson.teacher_id !== currentUser.id && !isAdmin(currentUser.role)) {
      return NextResponse.json(
        { error: 'Forbidden', code: 'FORBIDDEN', detail: 'You can only create homework for your own courses', requestId },
        { status: 403 }
      );
    }

    // Create homework
    const { data: homework, error: homeworkError } = await supabaseAdmin
      .from('assignments')
      .insert({
        lesson_id: lessonId,
        course_id: lesson.course_id,
        title,
        description: description || null,
        deadline: deadline || null,
        forms_link: forms_link || null,
      })
      .select()
      .single();

    if (homeworkError) {
      console.error('Error creating homework:', homeworkError);
      return NextResponse.json(
        { error: 'Failed to create homework', code: 'HOMEWORK_CREATE_ERROR', requestId },
        { status: 500 }
      );
    }

    return NextResponse.json({ homework, requestId }, { status: 201 });
  } catch (error) {
    console.error('Error creating homework:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', code: 'INTERNAL_SERVER_ERROR', requestId },
      { status: 500 }
    );
  }
}
