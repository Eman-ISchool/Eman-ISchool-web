import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * POST /api/lessons/[id]/leave
 * 
 * Mark the user's exit time.
 */
export const POST = withAuth(async (req, { user, requestId }, { params }) => {
    const { id } = params;

    // Fetch lesson to get course_id for enrollment verification + teacher_id for endLesson
    const { data: lesson } = await supabaseAdmin
        .from('lessons')
        .select('id, course_id, teacher_id')
        .eq('id', id)
        .single();

    if (!lesson) {
        return NextResponse.json(
            { error: 'Lesson not found', code: 'NOT_FOUND', requestId },
            { status: 404 }
        );
    }

    // For students, verify enrollment before allowing leave
    if (user.role === 'student') {
        if (!lesson.course_id) {
            return NextResponse.json(
                { error: 'Lesson has no associated course', code: 'INVALID_LESSON', requestId },
                { status: 400 }
            );
        }

        const { data: enrollment } = await supabaseAdmin
            .from('enrollments')
            .select('id')
            .eq('student_id', user.id)
            .eq('course_id', lesson.course_id)
            .eq('status', 'active')
            .single();

        if (!enrollment) {
            return NextResponse.json(
                { error: 'Not enrolled in this course', code: 'NOT_ENROLLED', requestId },
                { status: 403 }
            );
        }
    }

    // Retrieve current attendance record
    const { data: existingRecord } = await supabaseAdmin
        .from('attendance_records')
        .select('id, join_time, duration_minutes')
        .eq('lesson_id', id)
        .eq('student_id', user.id)
        .single();

    if (existingRecord && existingRecord.join_time) {
        // Calculate total duration
        const joinTime = new Date(existingRecord.join_time).getTime();
        const leaveTime = new Date().getTime();

        // Convert ms to minutes
        const sessionIdDuration = Math.max(0, Math.floor((leaveTime - joinTime) / 60000));
        const previousDuration = existingRecord.duration_minutes || 0;

        await supabaseAdmin
            .from('attendance_records')
            .update({
                leave_time: new Date().toISOString(),
                duration_minutes: previousDuration + sessionIdDuration
            })
            .eq('id', existingRecord.id);
    }

    // Check if it's the teacher leaving -> Maybe end the lesson if requested
    const body = await req.json().catch(() => ({}));
    if (body.endLesson && user.role === 'teacher' && lesson.teacher_id === user.id) {
        await supabaseAdmin
            .from('lessons')
            .update({ status: 'completed' })
            .eq('id', id);
    }

    return NextResponse.json({ success: true, requestId });
});
