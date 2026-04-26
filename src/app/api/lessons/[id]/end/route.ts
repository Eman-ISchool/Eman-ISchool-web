/**
 * End Lesson API Endpoint
 * 
 * POST /api/lessons/[id]/end - End a live lesson (transition to 'completed' status)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { canManageLesson } from '@/lib/permissions';
import { computeAttendanceStatusWithLeaveTime } from '@/lib/attendance';

export const dynamic = 'force-dynamic';

/**
 * POST /api/lessons/[id]/end
 * 
 * End a live lesson by transitioning it to 'completed' status.
 * 
 * This endpoint should:
 * 1. Verify lesson exists and is 'live'
 * 2. Verify lesson belongs to current user (teacher or admin)
 * 3. Update lesson status to 'completed'
 * 4. Set ended_at timestamp
 * 5. Trigger attendance computation for all students
 * 
 * Note: Only teachers and admins can end lessons.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || !['teacher', 'admin'].includes(user?.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify lesson exists
    const { data: lesson, error: fetchError } = await supabaseAdmin
      .from('lessons')
      .select('id, status, teacher_id, course_id, start_date_time, end_date_time')
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

    // Verify user has permission to end this lesson
    const canEnd = await canManageLesson(user.id, user.role, lesson.id);
    if (!canEnd) {
      return NextResponse.json(
        { error: 'You do not have permission to end this lesson' },
        { status: 403 }
      );
    }

    // Verify lesson can be ended (only live lessons can be ended)
    if (lesson.status !== 'live') {
      return NextResponse.json(
        { error: 'Only live lessons can be ended' },
        { status: 400 }
      );
    }

    // Fetch all attendance records for this lesson
    const { data: attendanceRecords, error: attendanceError } = await supabaseAdmin
      .from('attendance')
      .select('*')
      .eq('lesson_id', params.id);

    if (attendanceError) {
      console.error('Error fetching attendance:', attendanceError);
      return NextResponse.json(
        { error: 'Failed to fetch attendance records' },
        { status: 500 }
      );
    }

    // Compute attendance for all students who haven't left yet
    const now = new Date();
    const startTime = new Date(lesson.start_date_time);
    const endTime = new Date(lesson.end_date_time);

    const attendanceUpdates = attendanceRecords
      .filter(record => !record.leave_time)
      .map(record => {
        const joinTime = new Date(record.join_time);
        const durationSeconds = Math.floor((now.getTime() - joinTime.getTime()) / 1000);
        const attendanceStatus = computeAttendanceStatusWithLeaveTime(
          startTime,
          endTime,
          joinTime,
          now
        );

        return {
          id: record.id,
          leave_time: now.toISOString(),
          duration_seconds: durationSeconds,
          attendance_status: attendanceStatus
        };
      });

    // Update attendance records in batch
    if (attendanceUpdates.length > 0) {
      const { error: updateAttendanceError } = await supabaseAdmin
        .from('attendance')
        .upsert(attendanceUpdates);

      if (updateAttendanceError) {
        console.error('Error updating attendance:', updateAttendanceError);
        return NextResponse.json(
          { error: 'Failed to update attendance records' },
          { status: 500 }
        );
      }
    }

    // Update lesson to 'completed' status
    const { data: updatedLesson, error: updateError } = await supabaseAdmin
      .from('lessons')
      .update({
        status: 'completed',
        ended_at: now.toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error ending lesson:', updateError);
      return NextResponse.json(
        { error: 'Failed to end lesson' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      lesson: updatedLesson,
      attendanceUpdated: attendanceUpdates.length
    });
  } catch (error) {
    console.error('Error in POST /api/lessons/[id]/end:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
