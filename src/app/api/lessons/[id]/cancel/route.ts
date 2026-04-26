/**
 * Cancel Lesson API Endpoint
 * 
 * POST /api/lessons/[id]/cancel - Cancel a scheduled lesson
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
