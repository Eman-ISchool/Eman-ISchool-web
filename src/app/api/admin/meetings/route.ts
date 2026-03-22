import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { countJoinedAttendanceByLesson } from '@/lib/lesson-meetings';
import { getGoogleMeetingSnapshot } from '@/lib/google-meet';
import { getValidGoogleToken } from '@/lib/google-token';
import { supabaseAdmin } from '@/lib/supabase';

export const GET = withAuth(async (req, { requestId }) => {
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const includeSnapshot = url.searchParams.get('includeSnapshot') === 'true';
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 100);

    let query = supabaseAdmin
        .from('lessons')
        .select(`
            id,
            title,
            start_date_time,
            end_date_time,
            status,
            course_id,
            teacher_id,
            course:courses!lessons_course_id_fkey(id, title),
            teacher:users!lessons_teacher_id_fkey(id, name, email, image)
        `)
        .order('start_date_time', { ascending: false })
        .limit(limit);

    if (status) {
        query = query.eq('status', status);
    }

    const { data: lessons, error } = await query;
    if (error) {
        return NextResponse.json(
            { error: 'Failed to load meetings.', code: 'FETCH_ERROR', requestId },
            { status: 500 },
        );
    }

    const lessonIds = (lessons || []).map((lesson) => lesson.id);
    const [{ data: meetingRows }, attendanceCounts] = await Promise.all([
        lessonIds.length > 0
            ? supabaseAdmin
                .from('lesson_meetings')
                .select('*')
                .in('lesson_id', lessonIds)
            : Promise.resolve({ data: [] as any[] }),
        countJoinedAttendanceByLesson(lessonIds),
    ]);

    const meetingsByLesson = new Map(
        (meetingRows || []).map((row: any) => [row.lesson_id, row]),
    );

    const meetingItems = await Promise.all((lessons || []).map(async (lesson: any) => {
        const meeting = meetingsByLesson.get(lesson.id) || null;
        let snapshot = null;

        if (includeSnapshot && meeting?.space_name && meeting?.owner_user_id) {
            const tokenResult = await getValidGoogleToken(meeting.owner_user_id);
            if (tokenResult.success && tokenResult.accessToken) {
                try {
                    snapshot = await getGoogleMeetingSnapshot(tokenResult.accessToken, meeting.space_name);
                } catch (snapshotError) {
                    console.error('[admin-meeting-snapshot-failed]', snapshotError);
                }
            }
        }

        return {
            lessonId: lesson.id,
            title: lesson.title,
            startDateTime: lesson.start_date_time,
            endDateTime: lesson.end_date_time,
            status: lesson.status,
            course: lesson.course,
            teacher: lesson.teacher,
            attendanceCount: attendanceCounts.get(lesson.id) || 0,
            meeting: meeting
                ? {
                    lessonId: meeting.lesson_id,
                    meetUrl: meeting.meet_url,
                    meetingCode: meeting.meeting_code,
                    provider: meeting.provider,
                    status: meeting.status,
                    spaceName: meeting.space_name,
                    ownerGoogleEmail: meeting.owner_google_email,
                    startedAt: meeting.started_at,
                    endedAt: meeting.ended_at,
                }
                : null,
            snapshot,
        };
    }));

    return NextResponse.json({
        meetings: meetingItems,
        requestId,
    });
}, { allowedRoles: ['admin'] });
