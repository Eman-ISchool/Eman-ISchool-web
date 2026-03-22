import { supabaseAdmin } from '@/lib/supabase';

export interface MeetingActor {
    id: string;
    email: string;
    name: string;
    role: string;
    googleId?: string;
}

export interface LessonMeetingLesson {
    id: string;
    title: string;
    description: string | null;
    start_date_time: string;
    end_date_time: string;
    status: string;
    course_id: string | null;
    teacher_id: string | null;
    meet_link: string | null;
    course?: {
        id: string;
        title: string;
    } | null;
    teacher?: {
        id: string;
        name: string;
        email: string;
    } | null;
}

export interface LessonMeetingRecord {
    lesson_id: string;
    provider: string;
    meet_url: string;
    meeting_code?: string | null;
    event_id?: string | null;
    status: string;
    created_by_teacher_id?: string | null;
    space_name?: string | null;
    meeting_uri?: string | null;
    owner_user_id?: string | null;
    owner_google_email?: string | null;
    conference_record_name?: string | null;
    started_at?: string | null;
    ended_at?: string | null;
    last_synced_at?: string | null;
    metadata?: Record<string, unknown>;
    last_error?: string | null;
    created_at?: string;
    updated_at?: string;
}

export async function getLessonForMeetingAccess(
    lessonId: string,
): Promise<LessonMeetingLesson | null> {
    const { data, error } = await supabaseAdmin
        .from('lessons')
        .select(`
            id,
            title,
            description,
            start_date_time,
            end_date_time,
            status,
            course_id,
            teacher_id,
            meet_link,
            course:courses!lessons_course_id_fkey(id, title),
            teacher:users!lessons_teacher_id_fkey(id, name, email)
        `)
        .eq('id', lessonId)
        .single();

    if (error || !data) {
        return null;
    }

    return data as LessonMeetingLesson;
}

export async function canViewLessonMeeting(
    actor: MeetingActor,
    lesson: LessonMeetingLesson,
): Promise<boolean> {
    if (actor.role === 'admin' || actor.role === 'supervisor') {
        return true;
    }

    if (actor.role === 'teacher') {
        return lesson.teacher_id === actor.id;
    }

    if (actor.role === 'student' && lesson.course_id) {
        const { data: enrollment } = await supabaseAdmin
            .from('enrollments')
            .select('id')
            .eq('student_id', actor.id)
            .eq('course_id', lesson.course_id)
            .eq('status', 'active')
            .single();

        return !!enrollment;
    }

    return false;
}

export function canManageLessonMeeting(actor: MeetingActor, lesson: LessonMeetingLesson) {
    return actor.role === 'admin' || (actor.role === 'teacher' && lesson.teacher_id === actor.id);
}

export async function getLessonMeetingRecord(
    lessonId: string,
): Promise<LessonMeetingRecord | null> {
    const { data, error } = await supabaseAdmin
        .from('lesson_meetings')
        .select('*')
        .eq('lesson_id', lessonId)
        .single();

    if (error || !data) {
        return null;
    }

    return data as LessonMeetingRecord;
}

export async function upsertLessonMeetingRecord(record: Partial<LessonMeetingRecord> & { lesson_id: string }) {
    const { data, error } = await supabaseAdmin
        .from('lesson_meetings')
        .upsert(record, { onConflict: 'lesson_id' })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data as LessonMeetingRecord;
}

export async function syncLegacyLessonMeetingFields(params: {
    lessonId: string;
    meetUrl: string | null;
    meetingProvider?: 'google_meet' | 'zoom' | 'teams' | 'other' | null;
    meetingTitle?: string | null;
    googleEventId?: string | null;
}) {
    await supabaseAdmin
        .from('lessons')
        .update({
            meet_link: params.meetUrl,
            meeting_provider: params.meetingProvider ?? 'google_meet',
            meeting_title: params.meetingTitle ?? null,
            google_event_id: params.googleEventId ?? null,
        })
        .eq('id', params.lessonId);
}

export async function logMeetingEvent(params: {
    lessonId: string;
    eventType: string;
    userId?: string | null;
    metadata?: Record<string, unknown>;
}) {
    try {
        await supabaseAdmin
            .from('meeting_logs')
            .insert({
                lesson_id: params.lessonId,
                event_type: params.eventType,
                user_id: params.userId ?? null,
                metadata: params.metadata ?? {},
            });
    } catch (error) {
        console.error('[meeting-log-failed]', {
            lessonId: params.lessonId,
            eventType: params.eventType,
            error,
        });
    }
}

export async function countJoinedAttendanceByLesson(lessonIds: string[]) {
    if (lessonIds.length === 0) {
        return new Map<string, number>();
    }

    const { data } = await supabaseAdmin
        .from('attendance')
        .select('lesson_id')
        .in('lesson_id', lessonIds)
        .not('joined_at', 'is', null);

    const counts = new Map<string, number>();
    for (const row of data || []) {
        const lessonId = (row as { lesson_id: string }).lesson_id;
        counts.set(lessonId, (counts.get(lessonId) || 0) + 1);
    }
    return counts;
}
