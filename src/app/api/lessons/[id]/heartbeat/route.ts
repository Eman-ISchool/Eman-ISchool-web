import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * POST /api/lessons/[id]/heartbeat
 * 
 * Update user's last heartbeat time to prove they are still in the lesson.
 */
export const POST = withAuth(async (req, { user, requestId }, { params }) => {
    const { id } = params;

    // Fetch lesson to get course_id for enrollment verification
    const { data: lesson } = await supabaseAdmin
        .from('lessons')
        .select('id, course_id')
        .eq('id', id)
        .single();

    if (!lesson) {
        return NextResponse.json(
            { error: 'Lesson not found', code: 'NOT_FOUND', requestId },
            { status: 404 }
        );
    }

    // For students, verify enrollment before allowing heartbeat
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

    const { data: existingRecord } = await supabaseAdmin
        .from('attendance_records')
        .select('id')
        .eq('lesson_id', id)
        .eq('student_id', user.id)
        .single();

    if (existingRecord) {
        await supabaseAdmin
            .from('attendance_records')
            .update({
                last_heartbeat_time: new Date().toISOString(),
                status: 'present'
            })
            .eq('id', existingRecord.id);
    } else {
        // If heartbeat fired before join, auto-join them
        await supabaseAdmin
            .from('attendance_records')
            .insert({
                lesson_id: id,
                student_id: user.id,
                status: 'present',
                join_time: new Date().toISOString(),
                last_heartbeat_time: new Date().toISOString()
            });
    }

    return NextResponse.json({ success: true, requestId });
});
