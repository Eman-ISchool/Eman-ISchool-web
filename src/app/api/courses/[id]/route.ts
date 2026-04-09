import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isTeacherOrAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { generateRequestId } from '@/lib/request-id';

// GET - Fetch a single course by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const requestId = generateRequestId();
  const courseId = params.id;

  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured', code: 'DATABASE_NOT_CONFIGURED', requestId },
        { status: 500 }
      );
    }

    const session = await getServerSession(authOptions);
    const currentUser = session?.user ? await getCurrentUser(session) : null;
    const canSeeUnpublished = !!(currentUser && isTeacherOrAdmin(currentUser.role));

    let query = supabaseAdmin
      .from('courses')
      .select(`
        *,
        teacher:users!courses_teacher_id_fkey(id, name, email, image),
        grade:grades(id, name, slug),
        enrollments:enrollments(count)
      `)
      .eq('id', courseId)
      .single();

    const { data: course, error } = await query;

    if (error || !course) {
      return NextResponse.json(
        { error: 'Course not found', code: 'NOT_FOUND', requestId },
        { status: 404 }
      );
    }

    // Non-admin/teacher users cannot see unpublished courses
    if (!canSeeUnpublished && !course.is_published) {
      return NextResponse.json(
        { error: 'Course not found', code: 'NOT_FOUND', requestId },
        { status: 404 }
      );
    }

    const enrichedCourse = {
      ...course,
      teacher_name: course.teacher?.name || '',
    };

    const response = NextResponse.json({ course: enrichedCourse, requestId });
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');
    return response;
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', code: 'INTERNAL_SERVER_ERROR', requestId },
      { status: 500 }
    );
  }
}
