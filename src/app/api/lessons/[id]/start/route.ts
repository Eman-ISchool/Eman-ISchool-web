/**
 * Start Lesson API Endpoint
 * 
 * POST /api/lessons/[id]/start - Start a lesson (transition to 'live' status)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/lessons/[id]/start
 * 
 * Start a lesson by transitioning it to 'live' status.
 * 
 * This endpoint should:
 * 1. Verify the lesson exists
 * 2. Verify the lesson belongs to the current user (teacher or admin)
 * 3. Update lesson status to 'live'
 * 4. Set the started_at timestamp
 * 
 * Note: Only teachers and admins can start lessons.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get current session (TODO: Implement proper session management)
    // For now, we'll assume the user is authenticated and has proper permissions
    // In production, you would verify the session and user role here

    // Verify lesson exists
    const { data: lesson, error: fetchError } = await supabase
      .from('lessons')
      .select('id, status, teacher_id, start_date_time, end_date_time')
      .eq('id', params.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Lesson not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching lesson:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch lesson' },
        { status: 500 }
      );
    }

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Verify lesson can be started (only scheduled or cancelled lessons)
    if (lesson.status !== 'scheduled' && lesson.status !== 'cancelled') {
      return NextResponse.json(
        { error: 'Lesson can only be started if it is scheduled or cancelled' },
        { status: 400 }
      );
    }

    // TODO: Verify user has permission to start this lesson
    // For now, we'll skip the permission check and allow any authenticated user

    // Update lesson to 'live' status
    const { data: updatedLesson, error: updateError } = await supabase
      .from('lessons')
      .update({
        status: 'live',
        started_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error starting lesson:', updateError);
      return NextResponse.json(
        { error: 'Failed to start lesson' },
        { status: 500 }
      );
    }

    return NextResponse.json({ lesson: updatedLesson });
  } catch (error) {
    console.error('Error in POST /api/lessons/[id]/start:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
