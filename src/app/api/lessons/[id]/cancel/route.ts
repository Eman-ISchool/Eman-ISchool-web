/**
 * Cancel Lesson API Endpoint
 * 
 * POST /api/lessons/[id]/cancel - Cancel a scheduled lesson
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/lessons/[id]/cancel
 * 
 * Cancel a scheduled lesson by transitioning it to 'cancelled' status.
 * 
 * This endpoint should:
 * 1. Verify the lesson exists
 * 2. Verify the lesson is in 'scheduled' status
 * 3. Verify the lesson belongs to the current user (teacher or admin)
 * 4. Update lesson status to 'cancelled'
 * 5. Set the cancellation_reason
 * 
 * Note: Only teachers and admins can cancel lessons.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { cancellation_reason } = body;

    // Validate cancellation reason
    if (!cancellation_reason || cancellation_reason.trim() === '') {
      return NextResponse.json(
        { error: 'Cancellation reason is required' },
        { status: 400 }
      );
    }

    // Get current session (TODO: Implement proper session management)
    // For now, we'll assume the user is authenticated and has proper permissions

    // Verify lesson exists
    const { data: lesson, error: fetchError } = await supabase
      .from('lessons')
      .select('id, status, teacher_id, start_date_time')
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

    // Verify lesson can be cancelled (only scheduled lessons can be cancelled)
    if (lesson.status !== 'scheduled') {
      return NextResponse.json(
        { error: 'Only scheduled lessons can be cancelled' },
        { status: 400 }
      );
    }

    // TODO: Verify user has permission to cancel this lesson
    // For now, we'll skip the permission check and allow any authenticated user

    // Update lesson to 'cancelled' status
    const { data: updatedLesson, error: updateError } = await supabase
      .from('lessons')
      .update({
        status: 'cancelled',
        cancellation_reason: cancellation_reason,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error cancelling lesson:', updateError);
      return NextResponse.json(
        { error: 'Failed to cancel lesson' },
        { status: 500 }
      );
    }

    return NextResponse.json({ lesson: updatedLesson });
  } catch (error) {
    console.error('Error in POST /api/lessons/[id]/cancel:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
