import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * POST /api/lessons/[id]/join
 * 
 * Mark a user as having joined a lesson.
 * Expected for students, but teachers joining could also trigger status updates.
 */
export const POST = withAuth(async (req, { user, requestId }, { params }) => {
    const { id } = params;

    // Verify lesson exists
    const { data: lesson, error: fetchError } = await supabaseAdmin
        .from('lessons')
        .select('id, status, teacher_id, course_id')
        .eq('id', id)
        .single();

    if (fetchError || !lesson) {
        return NextResponse.json(
            { error: 'Lesson not found', code: 'NOT_FOUND', requestId },
            { status: 404 }
        );
    }

    // If teacher joins, maybe auto-start lesson
    if (user.role === 'teacher' && user.id === lesson.teacher_id && lesson.status === 'scheduled') {
        await supabaseAdmin
            .from('lessons')
            .update({ status: 'live' })
            .eq('id', id);
    }

    // For students, verify enrollment before allowing join
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

    // Record attendance
    const { data: existingRecord } = await supabaseAdmin
        .from('attendance_records')
        .select('id, join_time')
        .eq('lesson_id', id)
        .eq('student_id', user.id)
        .single();

    if (!existingRecord) {
        // Create new attendance record
        await supabaseAdmin
            .from('attendance_records')
            .insert({
                lesson_id: id,
                student_id: user.id,
                status: 'present',
                join_time: new Date().toISOString(),
                last_heartbeat_time: new Date().toISOString()
            });
    } else {
        // Update existing record's heartbeat to show they are active
        await supabaseAdmin
            .from('attendance_records')
            .update({
                last_heartbeat_time: new Date().toISOString(),
                status: 'present'
            })
            .eq('id', existingRecord.id);
    }

    return NextResponse.json({ success: true, message: 'Joined lesson successfully', requestId });
});
