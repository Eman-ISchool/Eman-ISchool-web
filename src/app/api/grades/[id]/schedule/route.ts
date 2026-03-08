import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isAdmin, isTeacherOrAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { generateRequestId } from '@/lib/request-id';

// GET - Fetch grade schedule (all lessons for all courses in grade)
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const requestId = generateRequestId();
  const gradeId = params.id;
  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

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

    // Fetch grade to verify access
    const { data: grade, error: gradeError } = await supabaseAdmin
      .from('grades')
      .select('*')
      .eq('id', gradeId)
      .single();

    if (gradeError || !grade) {
      return NextResponse.json(
        { error: 'Grade not found', code: 'NOT_FOUND', requestId },
        { status: 404 }
      );
    }

    // Check if user has access to this grade
    const hasAccess = isAdmin(currentUser.role) ||
                     (isTeacherOrAdmin(currentUser.role) && grade.teacher_id === currentUser.id) ||
                     currentUser.role === 'supervisor';

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden', code: 'FORBIDDEN', requestId },
        { status: 403 }
      );
    }

    // Fetch all courses for this grade
    const { data: courses, error: coursesError } = await supabaseAdmin
      .from('courses')
      .select('id, title, teacher_id')
      .eq('grade_id', gradeId);

    if (coursesError) {
      console.error('Error fetching courses:', coursesError);
      return NextResponse.json(
        { error: 'Failed to fetch courses', code: 'COURSES_FETCH_ERROR', requestId },
        { status: 500 }
      );
    }

    if (!courses || courses.length === 0) {
      return NextResponse.json({ schedule: [], requestId });
    }

    const courseIds = courses.map(c => c.id);

    // Build query for lessons
    let lessonsQuery = supabaseAdmin
      .from('lessons')
      .select(`
        id,
        title,
        start_time,
        end_time,
        course_id,
        status,
        courses!lessons_course_id_fkey(
          id,
          title,
          teacher_id,
          users!courses_teacher_id_fkey(
            id,
            name
          )
        )
      `)
      .in('course_id', courseIds)
      .order('start_time', { ascending: true });

    // Apply date filters if provided
    if (startDate) {
      lessonsQuery = lessonsQuery.gte('start_time', startDate);
    }
    if (endDate) {
      lessonsQuery = lessonsQuery.lte('start_time', endDate);
    }

    const { data: lessons, error: lessonsError } = await lessonsQuery;

    if (lessonsError) {
      console.error('Error fetching lessons:', lessonsError);
      return NextResponse.json(
        { error: 'Failed to fetch lessons', code: 'LESSONS_FETCH_ERROR', requestId },
        { status: 500 }
      );
    }

    // Format lessons for calendar
    const schedule = lessons.map((lesson: any) => ({
      id: lesson.id,
      title: lesson.title,
      start_time: lesson.start_time,
      end_time: lesson.end_time,
      course_id: lesson.course_id,
      course_name: lesson.courses?.title || '',
      teacher_name: lesson.courses?.users?.name || '',
      status: lesson.status,
    }));

    return NextResponse.json({ schedule, requestId });
  } catch (error) {
    console.error('Error fetching grade schedule:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', code: 'INTERNAL_SERVER_ERROR', requestId },
      { status: 500 }
    );
  }
}
