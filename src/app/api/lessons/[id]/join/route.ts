import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { supabaseAdmin } from '@/lib/supabase';
import { getMockDb, saveMockDb } from '@/lib/mockDb';
import { withRequestId } from '@/lib/request-id';

function jsonWithRequestId(body: any, status: number, requestId: string) {
    return withRequestId(NextResponse.json(body, { status }), requestId);
}

/**
 * POST /api/lessons/[id]/join
 * 
 * Mark a user as having joined a lesson.
 * Expected for students, but teachers joining could also trigger status updates.
 */
export const POST = withAuth(async (req, { user, requestId }, { params }) => {
    const { id } = params;

    if (process.env.TEST_BYPASS === 'true') {
        const db = getMockDb();
        const lessons = Array.isArray(db.lessons) ? db.lessons : [];
        const enrollments = Array.isArray(db.enrollments) ? db.enrollments : [];
        const meetings = Array.isArray(db.lesson_meetings) ? db.lesson_meetings : [];
        const attendance = Array.isArray(db.attendance_records) ? db.attendance_records : [];
        const lesson = lessons.find((row: any) => row.id === id);

        if (!lesson) {
            return jsonWithRequestId({ error: 'Lesson not found', code: 'NOT_FOUND', requestId }, 404, requestId);
        }

        if (user.role === 'teacher' && user.id === lesson.teacher_id && lesson.status === 'scheduled') {
            lesson.status = 'live';
        }

        if (user.role === 'student') {
            const enrollment = enrollments.find((row: any) => (
                row.student_id === user.id &&
                row.course_id === lesson.course_id &&
                row.status === 'active'
            ));
            if (!enrollment) {
                return jsonWithRequestId({ error: 'Not enrolled in this course', code: 'NOT_ENROLLED', requestId }, 403, requestId);
            }
        }

        const meeting = meetings.find((row: any) => row.lesson_id === id && row.status === 'active');
        const meetLink = meeting?.meet_url || lesson.meet_link || lesson.meetLink;
        if (!meetLink) {
            return jsonWithRequestId({ error: 'Meet link not available for this lesson', code: 'MEET_LINK_MISSING', requestId }, 404, requestId);
        }

        const existing = attendance.find((row: any) => row.lesson_id === id && row.student_id === user.id);
        if (existing) {
            existing.last_heartbeat_time = new Date().toISOString();
            existing.status = 'present';
        } else {
            attendance.push({
                id: `att-${Date.now()}`,
                lesson_id: id,
                student_id: user.id,
                status: 'present',
                join_time: new Date().toISOString(),
                last_heartbeat_time: new Date().toISOString(),
            });
        }

        db.attendance_records = attendance;
        db.lessons = lessons;
        saveMockDb(db);

        return jsonWithRequestId({
            lesson_id: lesson.id,
            meet_link: meetLink,
            status: lesson.status,
            requestId
        }, 200, requestId);
    }

    const { data: lesson, error: fetchError } = await supabaseAdmin
        .from('lessons')
        .select('id, status, teacher_id, course_id, meet_link')
        .eq('id', id)
        .single();

    if (fetchError || !lesson) {
        return jsonWithRequestId({ error: 'Lesson not found', code: 'NOT_FOUND', requestId }, 404, requestId);
    }

    // If teacher joins, auto-start scheduled lesson
    if (user.role === 'teacher' && user.id === lesson.teacher_id && lesson.status === 'scheduled') {
        await supabaseAdmin
            .from('lessons')
            .update({ status: 'live' })
            .eq('id', id);
    }

    // Students must be enrolled in the lesson's course
    if (user.role === 'student') {
        if (!lesson.course_id) {
            return jsonWithRequestId({ error: 'Lesson has no associated course', code: 'INVALID_LESSON', requestId }, 400, requestId);
        }

        const { data: enrollment } = await supabaseAdmin
            .from('enrollments')
            .select('id')
            .eq('student_id', user.id)
            .eq('course_id', lesson.course_id)
            .eq('status', 'active')
            .single();

        if (!enrollment) {
            return jsonWithRequestId({ error: 'Not enrolled in this course', code: 'NOT_ENROLLED', requestId }, 403, requestId);
        }
    }

    // Read persisted meeting URL from lesson_meetings first, then fallback to lessons.meet_link.
    const { data: activeMeeting } = await supabaseAdmin
        .from('lesson_meetings')
        .select('meet_url')
        .eq('lesson_id', id)
        .eq('status', 'active')
        .maybeSingle();

    const meetLink = activeMeeting?.meet_url || lesson.meet_link;

    if (!meetLink) {
        return jsonWithRequestId({ error: 'Meet link not available for this lesson', code: 'MEET_LINK_MISSING', requestId }, 404, requestId);
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

    return jsonWithRequestId({
        lesson_id: lesson.id,
        meet_link: meetLink,
        status: lesson.status === 'scheduled' && user.role === 'teacher' ? 'live' : lesson.status,
        requestId
    }, 200, requestId);
});
