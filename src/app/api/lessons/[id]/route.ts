import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdmin } from '@/lib/auth';
import { getMockDb, saveMockDb } from '@/lib/mockDb';
import { withRequestId } from '@/lib/request-id';

function jsonWithRequestId(body: any, status: number, requestId: string) {
  return withRequestId(NextResponse.json(body, { status }), requestId);
}

/**
 * GET /api/lessons/[id]
 * 
 * Get lesson details by ID.
 * Accessible to enrolled students, assigned teachers, supervisors, and admins.
 */
export const GET = withAuth(async (req, { user, requestId }, { params }) => {
  const { id } = params;

  if (process.env.TEST_BYPASS === 'true') {
    const db = getMockDb();
    const lessons = Array.isArray(db.lessons) ? db.lessons : [];
    const courses = Array.isArray(db.courses) ? db.courses : [];
    const enrollments = Array.isArray(db.enrollments) ? db.enrollments : [];
    const meetings = Array.isArray(db.lesson_meetings) ? db.lesson_meetings : [];
    const lesson = lessons.find((row: any) => row.id === id);

    if (!lesson) {
      return jsonWithRequestId({ error: 'Lesson not found', code: 'NOT_FOUND', requestId }, 404, requestId);
    }

    let isAuthorized = isAdmin(user.role);
    if (!isAuthorized && user.role === 'teacher') {
      isAuthorized = lesson.teacher_id === user.id;
    }
    if (!isAuthorized && user.role === 'student') {
      const enrolled = enrollments.find((row: any) => row.course_id === lesson.course_id && row.student_id === user.id && row.status === 'active');
      isAuthorized = Boolean(enrolled);
    }
    if (!isAuthorized && user.role === 'supervisor') {
      isAuthorized = true;
    }
    if (!isAuthorized) {
      return jsonWithRequestId({ error: 'Forbidden', code: 'FORBIDDEN', requestId }, 403, requestId);
    }

    const activeMeeting = meetings.find((row: any) => row.lesson_id === lesson.id && row.status === 'active');
    const course = courses.find((row: any) => row.id === lesson.course_id);
    const normalizedLesson = {
      ...lesson,
      meet_link: activeMeeting?.meet_url || lesson.meet_link || lesson.meetLink || null,
      course: course ? { id: course.id, title: course.title, grade_id: course.grade_id || null } : null,
      teacher: {
        id: lesson.teacher_id,
        name: lesson.teacher_name || 'Test Teacher',
        email: 'teacher@eduverse.com',
      },
      materials: Array.isArray(lesson.materials) ? lesson.materials : [],
    };

    return jsonWithRequestId({ lesson: normalizedLesson, requestId }, 200, requestId);
  }

  // Retrieve lesson with course and teacher
  const { data: lesson, error } = await supabaseAdmin
    .from('lessons')
    .select(`
      *,
      course:courses!lessons_course_id_fkey(id, title, grade_id),
      teacher:users!lessons_teacher_id_fkey(id, name, email, image),
      materials:materials(id, title, type, file_url, file_name, external_url)
    `)
    .eq('id', id)
    .single();

  if (error || !lesson) {
    if (error?.code === 'PGRST116' || !lesson) {
      return jsonWithRequestId({ error: 'Lesson not found', code: 'NOT_FOUND', requestId }, 404, requestId);
    }
    return jsonWithRequestId({ error: 'Failed to fetch lesson', code: 'FETCH_ERROR', requestId }, 500, requestId);
  }

  // Authorization access checks
  let isAuthorized = isAdmin(user.role);

  if (!isAuthorized && user.role === 'teacher') {
    isAuthorized = lesson.teacher_id === user.id;
  }

  if (!isAuthorized && user.role === 'supervisor') {
    // In a full implementation we'd check if grade_id is assigned to this supervisor
    isAuthorized = true;
  }

  if (!isAuthorized && user.role === 'student' && lesson.course_id) {
    // Check enrollment
    const { data: enrollment } = await supabaseAdmin
      .from('enrollments')
      .select('id')
      .eq('course_id', lesson.course_id)
      .eq('student_id', user.id)
      .eq('status', 'active')
      .single();
    if (enrollment) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    return jsonWithRequestId({ error: 'Forbidden', code: 'FORBIDDEN', requestId }, 403, requestId);
  }

  const { data: activeMeeting } = await supabaseAdmin
    .from('lesson_meetings')
    .select('meet_url')
    .eq('lesson_id', lesson.id)
    .eq('status', 'active')
    .maybeSingle();

  if (activeMeeting?.meet_url) {
    lesson.meet_link = activeMeeting.meet_url;
  }

  // Hide sensitive features from unenrolled students or parents
  if (user.role === 'student') {
    // Already checked enrollment above, but double check
    let isEnrolled = false;
    if (lesson.course_id) {
      const { data: enrollment } = await supabaseAdmin
        .from('enrollments')
        .select('id')
        .eq('course_id', lesson.course_id)
        .eq('student_id', user.id)
        .eq('status', 'active')
        .single();
      isEnrolled = !!enrollment;
    }

    if (!isEnrolled) {
      lesson.meet_link = null;
      lesson.meeting_title = null;
      lesson.meeting_provider = null;
      lesson.meeting_duration_min = null;
    }
  }

  return jsonWithRequestId({ lesson, requestId }, 200, requestId);
});

/**
 * PATCH /api/lessons/[id]
 * 
 * Update lesson details.
 * Teachers can edit their own lessons. Admins can edit any lesson.
 */
export const PATCH = withAuth(async (req, { user, requestId }, { params }) => {
  const { id } = params;
  const body = await req.json();

  if (process.env.TEST_BYPASS === 'true') {
    const db = getMockDb();
    const lessons = Array.isArray(db.lessons) ? db.lessons : [];
    const index = lessons.findIndex((row: any) => row.id === id);
    if (index < 0) {
      return jsonWithRequestId({ error: 'Lesson not found', code: 'NOT_FOUND', requestId }, 404, requestId);
    }
    if (lessons[index].teacher_id !== user.id && !isAdmin(user.role) && user.role !== 'supervisor') {
      return jsonWithRequestId({ error: 'Forbidden. You can only edit your own lessons.', code: 'FORBIDDEN', requestId }, 403, requestId);
    }
    lessons[index] = { ...lessons[index], ...body, updated_at: new Date().toISOString() };
    db.lessons = lessons;
    saveMockDb(db);
    return jsonWithRequestId({ lesson: lessons[index], requestId }, 200, requestId);
  }

  const { data: existingLesson, error: fetchError } = await supabaseAdmin
    .from('lessons')
    .select('teacher_id')
    .eq('id', id)
    .single();

  if (fetchError || !existingLesson) {
    return jsonWithRequestId({ error: 'Lesson not found', code: 'NOT_FOUND', requestId }, 404, requestId);
  }

  if (existingLesson.teacher_id !== user.id && !isAdmin(user.role) && user.role !== 'supervisor') {
    return jsonWithRequestId({ error: 'Forbidden. You can only edit your own lessons.', code: 'FORBIDDEN', requestId }, 403, requestId);
  }

  // Build updates safely
  const dbUpdates: any = {};
  if (body.title !== undefined) dbUpdates.title = body.title;
  if (body.description !== undefined) dbUpdates.description = body.description;
  if (body.start_date_time !== undefined) dbUpdates.start_date_time = body.start_date_time;
  if (body.end_date_time !== undefined) dbUpdates.end_date_time = body.end_date_time;
  if (body.recurrence !== undefined) dbUpdates.recurrence = body.recurrence;
  if (body.recurrence_end_date !== undefined) dbUpdates.recurrence_end_date = body.recurrence_end_date;
  if (body.meet_link !== undefined) dbUpdates.meet_link = body.meet_link;
  if (body.meeting_provider !== undefined) dbUpdates.meeting_provider = body.meeting_provider;
  if (body.meeting_duration_min !== undefined) dbUpdates.meeting_duration_min = body.meeting_duration_min;
  if (body.meeting_title !== undefined) dbUpdates.meeting_title = body.meeting_title;
  if (body.image_url !== undefined) dbUpdates.image_url = body.image_url;
  if (body.notes !== undefined) dbUpdates.notes = body.notes;
  if (body.teacher_notes !== undefined) dbUpdates.teacher_notes = body.teacher_notes;
  if (body.cancellation_reason !== undefined) dbUpdates.cancellation_reason = body.cancellation_reason;
  if (body.status !== undefined) dbUpdates.status = body.status;

  const { data: lesson, error } = await supabaseAdmin
    .from('lessons')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating lesson:', error);
    return jsonWithRequestId({ error: 'Failed to update lesson', code: 'UPDATE_ERROR', requestId }, 500, requestId);
  }

  return jsonWithRequestId({ lesson, requestId }, 200, requestId);
});

/**
 * DELETE /api/lessons/[id]
 * 
 * Delete a lesson. Teachers can delete their own lessons. Admins can delete any.
 */
export const DELETE = withAuth(async (req, { user, requestId }, { params }) => {
  const { id } = params;

  if (process.env.TEST_BYPASS === 'true') {
    const db = getMockDb();
    const lessons = Array.isArray(db.lessons) ? db.lessons : [];
    const lesson = lessons.find((row: any) => row.id === id);
    if (!lesson) {
      return jsonWithRequestId({ error: 'Lesson not found', code: 'NOT_FOUND', requestId }, 404, requestId);
    }
    if (lesson.teacher_id !== user.id && !isAdmin(user.role)) {
      return jsonWithRequestId({ error: 'Forbidden. You can only delete your own lessons.', code: 'FORBIDDEN', requestId }, 403, requestId);
    }
    db.lessons = lessons.filter((row: any) => row.id !== id);
    saveMockDb(db);
    return jsonWithRequestId({ success: true, message: 'Lesson deleted successfully', requestId }, 200, requestId);
  }

  const { data: existingLesson, error: fetchError } = await supabaseAdmin
    .from('lessons')
    .select('teacher_id')
    .eq('id', id)
    .single();

  if (fetchError || !existingLesson) {
    return jsonWithRequestId({ error: 'Lesson not found', code: 'NOT_FOUND', requestId }, 404, requestId);
  }

  if (existingLesson.teacher_id !== user.id && !isAdmin(user.role)) {
    return jsonWithRequestId({ error: 'Forbidden. You can only delete your own lessons.', code: 'FORBIDDEN', requestId }, 403, requestId);
  }

  const { error } = await supabaseAdmin
    .from('lessons')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting lesson:', error);
    return jsonWithRequestId({ error: 'Failed to delete lesson', code: 'DELETE_ERROR', requestId }, 500, requestId);
  }

  return jsonWithRequestId({ success: true, message: 'Lesson deleted successfully', requestId }, 200, requestId);
});
