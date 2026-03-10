import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { supabaseAdmin } from '@/lib/supabase';
import { withRequestId } from '@/lib/request-id';
import { generateMeetLink, toGoogleMeetApiError } from '@/lib/google-meet';
import { getMockDb, saveMockDb } from '@/lib/mockDb';

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

  if (process.env.TEST_BYPASS === 'true') {
    const db = getMockDb();
    const courses = Array.isArray(db.courses) ? db.courses : [];
    const enrollments = Array.isArray(db.enrollments) ? db.enrollments : [];
    const lessons = Array.isArray(db.lessons) ? db.lessons : [];
    const course = courses.find((row: any) => row.id === courseId);

    if (!course) {
      return jsonWithRequestId({ error: 'Course not found', code: 'NOT_FOUND', requestId }, 404, requestId);
    }
    if (user.role === 'teacher' && course.teacher_id !== user.id) {
      return jsonWithRequestId({ error: 'Forbidden', code: 'FORBIDDEN', requestId }, 403, requestId);
    }
    if (user.role === 'student') {
      const enrollment = enrollments.find((row: any) => row.course_id === courseId && row.student_id === user.id && row.status === 'active');
      if (!enrollment) {
        return jsonWithRequestId({ error: 'Forbidden', code: 'FORBIDDEN', requestId }, 403, requestId);
      }
    }

    let rows = lessons.filter((row: any) => row.course_id === courseId);
    if (status) {
      rows = rows.filter((row: any) => row.status === status);
    }
    rows = rows.sort((a: any, b: any) => String(a.start_date_time || '').localeCompare(String(b.start_date_time || '')));
    const total = rows.length;

    return jsonWithRequestId({
      lessons: rows.slice(offset, offset + limit).map((row: any) => ({
        id: row.id,
        title: row.title,
        description: row.description || '',
        start_date_time: row.start_date_time,
        end_date_time: row.end_date_time,
        status: row.status || 'scheduled',
        meet_link: row.meet_link || row.meetLink || null,
        teacher_id: row.teacher_id || course.teacher_id || null,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      requestId,
    }, 200, requestId);
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
    .select('id, title, description, start_date_time, end_date_time, status, meet_link, teacher_id')
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
  const providedMeetLink = String(body.meet_link || body.meetLink || '').trim();

  if (!title || !startDateTime || !endDateTime) {
    return jsonWithRequestId(
      { error: 'Missing required fields: title, start_date_time, end_date_time', code: 'VALIDATION_ERROR', requestId },
      400,
      requestId
    );
  }

  if (process.env.TEST_BYPASS === 'true') {
    const db = getMockDb();
    if (!Array.isArray(db.lessons)) {
      db.lessons = [];
    }
    const courses = Array.isArray(db.courses) ? db.courses : [];
    const course = courses.find((row: any) => row.id === courseId);
    if (!course) {
      return jsonWithRequestId({ error: 'Course not found', code: 'NOT_FOUND', requestId }, 404, requestId);
    }
    if (user.role === 'teacher' && course.teacher_id !== user.id) {
      return jsonWithRequestId({ error: 'Forbidden', code: 'FORBIDDEN', requestId }, 403, requestId);
    }

    const allowManualMeet = process.env.TEST_BYPASS === 'true' || process.env.ALLOW_MANUAL_MEET_LINK === 'true';
    const normalizedProvidedMeetLink = providedMeetLink.startsWith('https://meet.google.com/') ? providedMeetLink : '';
    let meetResult;
    if (normalizedProvidedMeetLink && allowManualMeet) {
      meetResult = { meetLink: normalizedProvidedMeetLink, google_event_id: '' };
    } else {
      try {
        meetResult = await generateMeetLink({
          summary: title,
          description: description || 'Eduverse live lesson',
          startTime: startDateTime,
          endTime: endDateTime,
          requestId,
        });
      } catch (error: any) {
        const googleError = toGoogleMeetApiError(error);
        return jsonWithRequestId(
          { error: googleError.error, code: googleError.code, detail: googleError.detail, requestId },
          googleError.status,
          requestId
        );
      }
    }

    const lesson = {
      id: `lesson-${Date.now()}`,
      title,
      description: description || null,
      course_id: courseId,
      teacher_id: course.teacher_id || user.id,
      start_date_time: startDateTime,
      end_date_time: endDateTime,
      status: 'scheduled',
      meet_link: meetResult.meetLink,
      meetLink: meetResult.meetLink,
      google_event_id: meetResult.google_event_id,
      created_at: new Date().toISOString(),
    };

    db.lessons.push(lesson);
    if (!Array.isArray(db.lesson_meetings)) {
      db.lesson_meetings = [];
    }
    db.lesson_meetings = db.lesson_meetings.filter((row: any) => row.lesson_id !== lesson.id);
    db.lesson_meetings.push({
      lesson_id: lesson.id,
      provider: 'google_calendar',
      meet_url: meetResult.meetLink,
      event_id: meetResult.google_event_id,
      created_by_teacher_id: user.id,
      status: 'active',
    });
    saveMockDb(db);
    return jsonWithRequestId({ lesson, requestId }, 201, requestId);
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

  const allowManualMeet = process.env.TEST_BYPASS === 'true' || process.env.ALLOW_MANUAL_MEET_LINK === 'true';
  const normalizedProvidedMeetLink = providedMeetLink.startsWith('https://meet.google.com/') ? providedMeetLink : '';
  let meetResult;
  if (normalizedProvidedMeetLink && allowManualMeet) {
    meetResult = { meetLink: normalizedProvidedMeetLink, google_event_id: '' };
  } else {
    try {
      meetResult = await generateMeetLink({
        summary: title,
        description: description || 'Eduverse live lesson',
        startTime: startDateTime,
        endTime: endDateTime,
        requestId,
      });
    } catch (error: any) {
      const googleError = toGoogleMeetApiError(error);
      return jsonWithRequestId(
        { error: googleError.error, code: googleError.code, detail: googleError.detail, requestId },
        googleError.status,
        requestId
      );
    }
  }

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
      meet_link: meetResult.meetLink,
      meeting_provider: 'google_meet',
      google_event_id: meetResult.google_event_id,
    })
    .select()
    .single();

  if (lessonError || !lesson) {
    return jsonWithRequestId({ error: 'Failed to create lesson', code: 'CREATE_ERROR', requestId }, 500, requestId);
  }

  const { error: meetingError } = await supabaseAdmin
    .from('lesson_meetings')
    .upsert({
      lesson_id: lesson.id,
      provider: 'google_calendar',
      meet_url: meetResult.meetLink,
      event_id: meetResult.google_event_id,
      created_by_teacher_id: user.id,
      status: 'active',
    }, { onConflict: 'lesson_id' });

  if (meetingError) {
    await supabaseAdmin.from('lessons').delete().eq('id', lesson.id);
    return jsonWithRequestId(
      { error: 'Google Meet persistence failed. Lesson was not created.', code: 'GOOGLE_CALENDAR_ERROR', requestId },
      503,
      requestId
    );
  }

  return jsonWithRequestId({ lesson, requestId }, 201, requestId);
}, { allowedRoles: ['admin', 'teacher'] });
