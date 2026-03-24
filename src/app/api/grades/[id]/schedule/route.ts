import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { supabaseAdmin } from '@/lib/supabase';
import { withRequestId } from '@/lib/request-id';
import { resolveGradeByRef } from '@/lib/grades';


function jsonWithRequestId(body: any, status: number, requestId: string) {
  return withRequestId(NextResponse.json(body, { status }), requestId);
}

/**
 * Phase 8 scaffold endpoint.
 * Event contract:
 * { sessionId, courseId, title, start, end, teacher }
 */
export const GET = withAuth(async (req, { user, requestId }, { params }) => {
  const gradeRef = await resolveGradeByRef(params.id);
  if (!gradeRef) {
    return jsonWithRequestId({ error: 'Grade not found', code: 'NOT_FOUND', requestId }, 404, requestId);
  }

  if (user.role === 'teacher' && gradeRef.supervisor_id && gradeRef.supervisor_id !== user.id) {
    return jsonWithRequestId({ error: 'Forbidden', code: 'FORBIDDEN', requestId }, 403, requestId);
  }

  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  let coursesQuery = supabaseAdmin.from('courses').select('id').eq('grade_id', gradeRef.id);
  if (user.role === 'teacher') {
    coursesQuery = coursesQuery.eq('teacher_id', user.id);
  }

  const { data: courses, error: coursesError } = await coursesQuery;
  if (coursesError) {
    return jsonWithRequestId({ error: 'Failed to fetch schedule', code: 'FETCH_ERROR', requestId }, 500, requestId);
  }

  const courseIds = (courses || []).map((course: any) => course.id);
  if (courseIds.length === 0) {
    return jsonWithRequestId({ phase: 'Phase 8', events: [], requestId }, 200, requestId);
  }

  let lessonsQuery = supabaseAdmin
    .from('lessons')
    .select(`
      id,
      title,
      course_id,
      start_date_time,
      end_date_time,
      teacher:users!lessons_teacher_id_fkey(name)
    `)
    .in('course_id', courseIds)
    .order('start_date_time', { ascending: true });

  if (startDate) lessonsQuery = lessonsQuery.gte('start_date_time', startDate);
  if (endDate) lessonsQuery = lessonsQuery.lte('start_date_time', endDate);

  const { data: lessons, error: lessonsError } = await lessonsQuery.limit(200);
  if (lessonsError) {
    return jsonWithRequestId({ error: 'Failed to fetch schedule', code: 'FETCH_ERROR', requestId }, 500, requestId);
  }

  const events = (lessons || []).map((lesson: any) => ({
    sessionId: lesson.id,
    courseId: lesson.course_id,
    title: lesson.title,
    start: lesson.start_date_time,
    end: lesson.end_date_time,
    teacher: lesson.teacher?.name || '',
  }));

  return jsonWithRequestId(
    {
      phase: 'Phase 8',
      contract: 'events[] = { sessionId, courseId, title, start, end, teacher }',
      events,
      requestId,
    },
    200,
    requestId
  );
}, { allowedRoles: ['admin', 'supervisor', 'teacher'] });
