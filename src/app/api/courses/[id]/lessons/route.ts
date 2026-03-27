import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { supabaseAdmin } from '@/lib/supabase';
import { withRequestId } from '@/lib/request-id';
import { generateMeetLink } from '@/lib/meet-service';
function jsonWithRequestId(body: any, status: number, requestId: string) {
  return withRequestId(NextResponse.json(body, { status }), requestId);
}

export const GET = withAuth(async (req, { user, requestId }, { params }) => {
  const courseId = params.id;
  const { searchParams } = new URL(req.url);
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 50);
  const offset = (page - 1) * limit;
  const status = searchParams.get('status');

  const { data: course, error: courseError } = await supabaseAdmin
    .from('courses')
    .select('id, teacher_id')
    .eq('id', courseId)
    .single();

  if (courseError || !course) {
    return jsonWithRequestId({ error: 'Course not found', code: 'NOT_FOUND', requestId }, 404, requestId);
  }

  if (user.role === 'teacher' && course.teacher_id !== user.id) {
    return jsonWithRequestId({ error: 'Forbidden', code: 'FORBIDDEN', requestId }, 403, requestId);
  }

  if (user.role === 'student') {
    const { data: enrollment } = await supabaseAdmin
      .from('enrollments')
      .select('id')
      .eq('course_id', courseId)
      .eq('student_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (!enrollment) {
      return jsonWithRequestId({ error: 'Forbidden', code: 'FORBIDDEN', requestId }, 403, requestId);
    }
  }

  let countQuery = supabaseAdmin
    .from('lessons')
    .select('id', { head: true, count: 'exact' })
    .eq('course_id', courseId);

  let listQuery = supabaseAdmin
    .from('lessons')
    .select('id, title, description, start_date_time, end_date_time, status, meet_link, teacher_id, teacher:users!lessons_teacher_id_fkey(id, name, image)')
    .eq('course_id', courseId)
    .order('start_date_time', { ascending: true })
    .range(offset, offset + limit - 1);

  if (status) {
    countQuery = countQuery.eq('status', status);
    listQuery = listQuery.eq('status', status);
  }

  const [{ count, error: countError }, { data: lessons, error: lessonsError }] = await Promise.all([
    countQuery,
    listQuery,
  ]);

  if (countError || lessonsError) {
    return jsonWithRequestId({ error: 'Failed to fetch lessons', code: 'FETCH_ERROR', requestId }, 500, requestId);
  }

  return jsonWithRequestId(
    {
      lessons: lessons || [],
      meta: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.max(1, Math.ceil((count || 0) / limit)),
      },
      requestId,
    },
    200,
    requestId
  );
}, { allowedRoles: ['admin', 'supervisor', 'teacher', 'student'] });

export const POST = withAuth(async (req, { user, requestId }, { params }) => {
  const courseId = params.id;
  const body = await req.json();
  const title = String(body.title || '').trim();
  const description = String(body.description || '').trim();
  const startDateTime = body.start_date_time || body.startDateTime;
  const endDateTime = body.end_date_time || body.endDateTime;
  const providedMeetLink = String(body.meet_link || body.meetLink || '').trim() || null;
  if (!title || !startDateTime || !endDateTime) {
    return jsonWithRequestId(
      { error: 'Missing required fields: title, start_date_time, end_date_time', code: 'VALIDATION_ERROR', requestId },
      400,
      requestId
    );
  }

  const { data: course, error: courseError } = await supabaseAdmin
    .from('courses')
    .select('id, teacher_id')
    .eq('id', courseId)
    .single();

  if (courseError || !course) {
    return jsonWithRequestId({ error: 'Course not found', code: 'NOT_FOUND', requestId }, 404, requestId);
  }

  if (user.role === 'teacher' && course.teacher_id !== user.id) {
    return jsonWithRequestId({ error: 'Forbidden', code: 'FORBIDDEN', requestId }, 403, requestId);
  }

  // If user provided a meet link, use it directly; otherwise auto-generate via Google Meet
  if (providedMeetLink) {
    const { data: lesson, error: lessonError } = await supabaseAdmin
      .from('lessons')
      .insert({
        title,
        description: description || null,
        course_id: courseId,
        teacher_id: course.teacher_id || user.id,
        start_date_time: startDateTime,
        end_date_time: endDateTime,
        status: 'scheduled',
        meet_link: providedMeetLink,
        meeting_provider: 'google_meet',
        google_event_id: null,
      })
      .select()
      .single();

    if (lessonError || !lesson) {
      return jsonWithRequestId({ error: 'Failed to create lesson', code: 'CREATE_ERROR', requestId }, 500, requestId);
    }

    return jsonWithRequestId({ lesson, requestId }, 201, requestId);
  }

  // Step 1: Insert lesson first (without meet link)
  const { data: lesson, error: lessonError } = await supabaseAdmin
    .from('lessons')
    .insert({
      title,
      description: description || null,
      course_id: courseId,
      teacher_id: course.teacher_id || user.id,
      start_date_time: startDateTime,
      end_date_time: endDateTime,
      status: 'scheduled',
      meet_link: null,
      meeting_provider: 'google_meet',
      google_event_id: null,
    })
    .select()
    .single();

  if (lessonError || !lesson) {
    return jsonWithRequestId({ error: 'Failed to create lesson', code: 'CREATE_ERROR', requestId }, 500, requestId);
  }

  // Step 2: Generate Google Meet link using meet-service (handles token management automatically)
  try {
    const meetResult = await generateMeetLink(user.id, lesson.id);

    const { data: updatedLesson, error: updateError } = await supabaseAdmin
      .from('lessons')
      .update({
        meet_link: meetResult.meetLink,
        google_event_id: meetResult.googleEventId || null,
        google_calendar_link: meetResult.googleCalendarLink || null,
      })
      .eq('id', lesson.id)
      .select()
      .single();

    if (updateError || !updatedLesson) {
      console.error('[POST /api/courses/[id]/lessons] Failed to persist Meet link — rolling back:', updateError);
      await supabaseAdmin.from('lessons').delete().eq('id', lesson.id);
      return jsonWithRequestId({ error: 'Failed to save Google Meet link. Lesson was not created.', code: 'GOOGLE_CALENDAR_ERROR', requestId }, 500, requestId);
    }

    return jsonWithRequestId({ lesson: updatedLesson, requestId }, 201, requestId);
  } catch (meetError: any) {
    console.error('[POST /api/courses/[id]/lessons] Meet generation failed — rolling back:', meetError.message);
    await supabaseAdmin.from('lessons').delete().eq('id', lesson.id);
    return jsonWithRequestId(
      { error: `Lesson was not created because Google Meet link could not be generated: ${meetError.message}`, code: 'GOOGLE_CALENDAR_ERROR', requestId },
      400,
      requestId
    );
  }
}, { allowedRoles: ['admin', 'teacher'] });
