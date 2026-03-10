import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { supabaseAdmin } from '@/lib/supabase';
import { withRequestId } from '@/lib/request-id';
import { resolveGradeByRef } from '@/lib/grades';
import { getMockDb } from '@/lib/mockDb';

function jsonWithRequestId(body: any, status: number, requestId: string) {
  return withRequestId(NextResponse.json(body, { status }), requestId);
}

export const GET = withAuth(async (req, { user, requestId }, { params }) => {
  const gradeRef = await resolveGradeByRef(params.id);
  if (!gradeRef) {
    return jsonWithRequestId({ error: 'Grade not found', code: 'NOT_FOUND', requestId }, 404, requestId);
  }

  if (user.role === 'teacher' && gradeRef.supervisor_id && gradeRef.supervisor_id !== user.id) {
    return jsonWithRequestId({ error: 'Forbidden', code: 'FORBIDDEN', requestId }, 403, requestId);
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 50);
  const offset = (page - 1) * limit;
  const search = searchParams.get('search')?.trim() || '';
  const status = searchParams.get('status');

  if (process.env.TEST_BYPASS === 'true') {
    const db = getMockDb();
    const courses = Array.isArray(db.courses) ? db.courses : [];
    const lessons = Array.isArray(db.lessons) ? db.lessons : [];
    const enrollments = Array.isArray(db.enrollments) ? db.enrollments : [];
    const nowIso = new Date().toISOString();

    let rows = courses.filter((course: any) => course.grade_id === gradeRef.id);
    if (user.role === 'teacher') {
      rows = rows.filter((course: any) => course.teacher_id === user.id);
    }
    if (status === 'published') {
      rows = rows.filter((course: any) => course.is_published === true);
    } else if (status === 'draft') {
      rows = rows.filter((course: any) => !course.is_published);
    }
    if (search) {
      const needle = search.toLowerCase();
      rows = rows.filter((course: any) => String(course.title || '').toLowerCase().includes(needle));
    }

    const mapped = rows.map((course: any) => {
      const nextLesson = lessons
        .filter((lesson: any) => lesson.course_id === course.id && String(lesson.start_date_time || '') > nowIso)
        .sort((a: any, b: any) => String(a.start_date_time).localeCompare(String(b.start_date_time)))[0];
      const studentsCount = enrollments.filter((enrollment: any) => enrollment.course_id === course.id && enrollment.status === 'active').length;
      return {
        id: course.id,
        title: course.title || '',
        is_published: Boolean(course.is_published),
        teacher_id: course.teacher_id || null,
        teacher_name: course.teacher?.name || 'Test Teacher',
        students_count: studentsCount,
        next_session_time: nextLesson?.start_date_time || null,
      };
    });

    const total = mapped.length;
    const paged = mapped.slice(offset, offset + limit);
    return jsonWithRequestId({
      courses: paged,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      requestId,
    }, 200, requestId);
  }

  let countQuery = supabaseAdmin
    .from('courses')
    .select('id', { count: 'exact', head: true })
    .eq('grade_id', gradeRef.id);

  let listQuery = supabaseAdmin
    .from('courses')
    .select(`
      id,
      title,
      is_published,
      teacher_id,
      created_at,
      teacher:users!courses_teacher_id_fkey(id, name, email),
      enrollments:enrollments(count)
    `)
    .eq('grade_id', gradeRef.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (user.role === 'teacher') {
    countQuery = countQuery.eq('teacher_id', user.id);
    listQuery = listQuery.eq('teacher_id', user.id);
  }

  if (status === 'published') {
    countQuery = countQuery.eq('is_published', true);
    listQuery = listQuery.eq('is_published', true);
  } else if (status === 'draft') {
    countQuery = countQuery.eq('is_published', false);
    listQuery = listQuery.eq('is_published', false);
  }

  if (search) {
    countQuery = countQuery.ilike('title', `%${search}%`);
    listQuery = listQuery.ilike('title', `%${search}%`);
  }

  const [{ count, error: countError }, { data: courses, error: coursesError }] = await Promise.all([
    countQuery,
    listQuery,
  ]);

  if (countError || coursesError) {
    return jsonWithRequestId({ error: 'Failed to fetch courses', code: 'FETCH_ERROR', requestId }, 500, requestId);
  }

  const courseIds = (courses || []).map((course: any) => course.id);
  const { data: nextLessons } = courseIds.length
    ? await supabaseAdmin
        .from('lessons')
        .select('id, course_id, start_date_time')
        .in('course_id', courseIds)
        .gt('start_date_time', new Date().toISOString())
        .order('start_date_time', { ascending: true })
    : { data: [] as any[] };

  const nextByCourse = new Map<string, string>();
  for (const lesson of nextLessons || []) {
    if (!nextByCourse.has(lesson.course_id)) {
      nextByCourse.set(lesson.course_id, lesson.start_date_time);
    }
  }

  const rows = (courses || []).map((course: any) => ({
    id: course.id,
    title: course.title,
    is_published: course.is_published,
    teacher_id: course.teacher_id,
    teacher_name: course.teacher?.name || '',
    students_count: course.enrollments?.[0]?.count || 0,
    next_session_time: nextByCourse.get(course.id) || null,
  }));

  const total = count || 0;
  const meta = {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };

  return jsonWithRequestId({ courses: rows, meta, requestId }, 200, requestId);
}, { allowedRoles: ['admin', 'supervisor', 'teacher'] });
