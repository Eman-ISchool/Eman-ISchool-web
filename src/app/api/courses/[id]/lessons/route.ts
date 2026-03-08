/**
 * Lessons API Endpoint for Courses
 * 
 * GET /api/courses/[id]/lessons - List all lessons for a course
 * POST /api/courses/[id]/lessons - Create a new lesson
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/courses/[id]/lessons
 * 
 * List all lessons for a specific course.
 * 
 * Query parameters:
 * - status: Filter by lesson status (scheduled, live, completed, cancelled)
 * - start_date: Filter lessons starting from this date
 * - end_date: Filter lessons ending before this date
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    let query = supabase
      .from('lessons')
      .select(`
        *,
        course:courses!lessons_course_id_fkey(id, title, grade_id),
        teacher:users!lessons_teacher_id_fkey(id, name, email, image)
      `)
      .eq('course_id', params.id)
      .order('start_date_time', { ascending: false });

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Apply date range filter
    if (startDate) {
      query = query.gte('start_date_time', startDate);
    }

    if (endDate) {
      query = query.lte('start_date_time', endDate);
    }

    const { data: lessons, error } = await query;

    if (error) {
      console.error('Error fetching lessons:', error);
      return NextResponse.json(
        { error: 'Failed to fetch lessons' },
        { status: 500 }
      );
    }

    return NextResponse.json({ lessons });
  } catch (error) {
    console.error('Error in GET /api/courses/[id]/lessons:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses/[id]/lessons
 * 
 * Create a new lesson for a course.
 * 
 * Request body:
 * {
 *   title: string (required)
 *   description: string (optional)
 *   start_date_time: string (required, ISO timestamp)
 *   end_date_time: string (required, ISO timestamp)
 *   recurrence: string (optional, e.g., 'weekly', 'biweekly')
 *   recurrence_end_date: string (optional, ISO timestamp)
 *   meet_link: string (optional)
 *   meeting_provider: 'google_meet' | 'zoom' | 'teams' | 'other' | null
 *   meeting_duration_min: number (optional)
 *   meeting_title: string (optional)
 *   image_url: string (optional)
 *   notes: string (optional)
 *   teacher_notes: string (optional)
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.start_date_time || !body.end_date_time) {
      return NextResponse.json(
        { error: 'Missing required fields: title, start_date_time, end_date_time' },
        { status: 400 }
      );
    }

    // Validate dates
    const startDate = new Date(body.start_date_time);
    const endDate = new Date(body.end_date_time);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Get course to verify it exists
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title, grade_id, teacher_id')
      .eq('id', params.id)
      .single();

    if (courseError || !course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check for schedule conflicts with other lessons in the same grade
    const { data: existingLessons, error: conflictError } = await supabase
      .from('lessons')
      .select('id, title, start_date_time, end_date_time')
      .eq('course_id', params.id)
      .neq('status', 'cancelled');

    if (conflictError) {
      console.error('Error checking for conflicts:', conflictError);
      // Continue with lesson creation even if conflict check fails
    }

    // Check for overlapping time slots
    if (existingLessons && existingLessons.length > 0) {
      const newStart = new Date(body.start_date_time).getTime();
      const newEnd = new Date(body.end_date_time).getTime();

      const hasConflict = existingLessons.some((lesson) => {
        const existingStart = new Date(lesson.start_date_time).getTime();
        const existingEnd = new Date(lesson.end_date_time).getTime();

        // Check if time ranges overlap
        return (
          (newStart >= existingStart && newStart < existingEnd) ||
          (newEnd > existingStart && newEnd <= existingEnd) ||
          (newStart <= existingStart && newEnd >= existingEnd)
        );
      });

      if (hasConflict) {
        return NextResponse.json(
          {
            error: 'Schedule conflict detected',
            code: 'SCHEDULE_CONFLICT',
            message: 'This lesson overlaps with an existing lesson in the same course',
          },
          { status: 409 }
        );
      }
    }

    // Create lesson
    const { data: lesson, error } = await supabase
      .from('lessons')
      .insert({
        title: body.title,
        description: body.description || null,
        start_date_time: body.start_date_time,
        end_date_time: body.end_date_time,
        recurrence: body.recurrence || null,
        recurrence_end_date: body.recurrence_end_date || null,
        meet_link: body.meet_link || null,
        meeting_title: body.meeting_title || null,
        meeting_provider: body.meeting_provider || null,
        meeting_duration_min: body.meeting_duration_min || null,
        google_event_id: null,
        google_calendar_link: null,
        status: 'scheduled',
        course_id: params.id,
        teacher_id: course.teacher_id,
        recording_url: null,
        recording_drive_file_id: null,
        recording_drive_view_link: null,
        recording_started_at: null,
        recording_ended_at: null,
        sort_order: 0,
        image_url: body.image_url || null,
        notes: body.notes || null,
        teacher_notes: body.teacher_notes || null,
        cancellation_reason: null,
        rescheduled_from: null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating lesson:', error);
      return NextResponse.json(
        { error: 'Failed to create lesson' },
        { status: 500 }
      );
    }

    return NextResponse.json({ lesson }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/courses/[id]/lessons:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
