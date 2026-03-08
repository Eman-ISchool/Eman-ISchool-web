import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdmin } from '@/lib/auth';

/**
 * GET /api/lessons/[id]
 * 
 * Get lesson details by ID.
 * Accessible to enrolled students, assigned teachers, supervisors, and admins.
 */
export const GET = withAuth(async (req, { user, requestId }, { params }) => {
  const { id } = params;

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
      return NextResponse.json(
        { error: 'Lesson not found', code: 'NOT_FOUND', requestId },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch lesson', code: 'FETCH_ERROR', requestId },
      { status: 500 }
    );
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
    return NextResponse.json(
      { error: 'Forbidden', code: 'FORBIDDEN', requestId },
      { status: 403 }
    );
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

  return NextResponse.json({ lesson, requestId });
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

  const { data: existingLesson, error: fetchError } = await supabaseAdmin
    .from('lessons')
    .select('teacher_id')
    .eq('id', id)
    .single();

  if (fetchError || !existingLesson) {
    return NextResponse.json(
      { error: 'Lesson not found', code: 'NOT_FOUND', requestId },
      { status: 404 }
    );
  }

  if (existingLesson.teacher_id !== user.id && !isAdmin(user.role) && user.role !== 'supervisor') {
    return NextResponse.json(
      { error: 'Forbidden. You can only edit your own lessons.', code: 'FORBIDDEN', requestId },
      { status: 403 }
    );
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
    return NextResponse.json(
      { error: 'Failed to update lesson', code: 'UPDATE_ERROR', requestId },
      { status: 500 }
    );
  }

  return NextResponse.json({ lesson, requestId });
});

/**
 * DELETE /api/lessons/[id]
 * 
 * Delete a lesson. Teachers can delete their own lessons. Admins can delete any.
 */
export const DELETE = withAuth(async (req, { user, requestId }, { params }) => {
  const { id } = params;

  const { data: existingLesson, error: fetchError } = await supabaseAdmin
    .from('lessons')
    .select('teacher_id')
    .eq('id', id)
    .single();

  if (fetchError || !existingLesson) {
    return NextResponse.json(
      { error: 'Lesson not found', code: 'NOT_FOUND', requestId },
      { status: 404 }
    );
  }

  if (existingLesson.teacher_id !== user.id && !isAdmin(user.role)) {
    return NextResponse.json(
      { error: 'Forbidden. You can only delete your own lessons.', code: 'FORBIDDEN', requestId },
      { status: 403 }
    );
  }

  const { error } = await supabaseAdmin
    .from('lessons')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting lesson:', error);
    return NextResponse.json(
      { error: 'Failed to delete lesson', code: 'DELETE_ERROR', requestId },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, message: 'Lesson deleted successfully', requestId });
});
