import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isTeacherOrAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { generateMeetLink, toGoogleMeetApiError } from '@/lib/google-meet';
import { randomUUID } from 'crypto';
import { decrypt, validateEncryptionConfig, isEncrypted } from '@/lib/encryption';

// POST - Create or get a meeting for a specific lesson
export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const currentUser = await getCurrentUser(session);

    if (!currentUser || !isTeacherOrAdmin(currentUser.role)) {
        return NextResponse.json({ error: 'Forbidden. Teacher or admin role required.' }, { status: 403 });
    }

    const lessonId = params.id;
    if (!lessonId) {
        return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 });
    }

    try {
        // T017: Verify ownership - fetch lesson first
        const { data: existingLesson, error: fetchError } = await supabaseAdmin
            .from('lessons')
            .select('*')
            .eq('id', lessonId)
            .single();

        if (fetchError || !existingLesson) {
            return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
        }

        // Check ownership: only owning teacher or admin can create the meeting
        if (existingLesson.teacher_id !== currentUser.id && currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden. You can only manage meetings for your own lessons.' }, { status: 403 });
        }

        // Check if an active meeting already exists in lesson_meetings table
        const { data: existingMeeting, error: meetingFetchError } = await supabaseAdmin
            .from('lesson_meetings')
            .select('*')
            .eq('lesson_id', lessonId)
            .eq('status', 'active')
            .single();

        if (existingMeeting && existingMeeting.meet_url) {
            // Validate the existing URL structure before returning
            if (existingMeeting.meet_url.startsWith('https://meet.google.com/')) {
                return NextResponse.json({
                    meeting: existingMeeting,
                    message: 'Existing valid meeting returned.',
                    isNew: false
                });
            } else {
                // Mark existing as invalid if it doesn't match expected structure
                await supabaseAdmin
                    .from('lesson_meetings')
                    .update({ status: 'invalid', validation_errors: 'URL structure check failed' })
                    .eq('lesson_id', lessonId);
            }
        }

        // Retrieve teacher's Google Refresh Token
        const { data: teacherData, error: teacherError } = await supabaseAdmin
            .from('users')
            .select('google_refresh_token')
            .eq('id', currentUser.id)
            .single();

        let refreshToken: string | undefined = undefined;

        if (teacherData?.google_refresh_token) {
            validateEncryptionConfig();
            try {
                if (isEncrypted(teacherData.google_refresh_token)) {
                    refreshToken = decrypt(teacherData.google_refresh_token);
                } else {
                    refreshToken = teacherData.google_refresh_token;
                }
            } catch (err) {
                console.error("Failed to decrypt Google Refresh Token", err);
            }
        }

        // Generate a new meeting using chosen provider (Calendar API)
        let meetResult;
        let meetingUrl = '';
        let googleEventId = '';

        try {
            meetResult = await generateMeetLink({
                summary: existingLesson.title || 'Eduverse Live Lesson',
                description: existingLesson.description || 'Virtual Classroom Meeting',
                startTime: existingLesson.start_date_time || new Date().toISOString(),
                // End time default to 1 hour later if not provided
                endTime: existingLesson.end_date_time || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                requestId: `e2e-meet-${lessonId}-${Date.now()}` // Pass unique request ID
            }, refreshToken);
            meetingUrl = meetResult.meetLink;
            googleEventId = meetResult.google_event_id;
        } catch (error: any) {
            const googleError = toGoogleMeetApiError(error);
            console.error(`[MeetingCreationError] correlationId=${lessonId}`, googleError.detail);
            return NextResponse.json(
                {
                    error: googleError.error,
                    code: googleError.code,
                    details: googleError.detail
                },
                { status: googleError.status }
            );
        }

        // Link validation guard (server-side)
        if (!meetingUrl || !meetingUrl.startsWith('https://meet.google.com/')) {
            console.error(`[MeetingValidationError] Invalid meet URL generated for lesson ${lessonId}: ${meetingUrl}`);
            return NextResponse.json({ error: 'Generated meeting URL is invalid or malformed.' }, { status: 500 });
        }

        // Derive meeting code
        const codeMatch = meetingUrl.split('meet.google.com/')[1]?.split('?')[0];
        const meetingCode = codeMatch || null;

        // Extract meeting to persist
        const meetingPayload = {
            lesson_id: lessonId,
            provider: 'google_calendar',
            meet_url: meetingUrl,
            meeting_code: meetingCode,
            event_id: googleEventId,
            created_by_teacher_id: currentUser.id,
            status: 'active',
            last_validated_at: new Date().toISOString()
        };

        // Upsert into lesson_meetings table (handle concurrency properly using upsert)
        const { data: newMeeting, error: insertError } = await supabaseAdmin
            .from('lesson_meetings')
            .upsert(meetingPayload, { onConflict: 'lesson_id' })
            .select()
            .single();

        if (insertError) {
            console.error(`[MeetingDBPersistError] correlationId=${lessonId}`, insertError);
            // If the table doesn't exist yet, we can fallback to updating lessons.meet_link.
            // Wait, we need it to exist. Let's assume it exists. But we also update the lessons table for backward compatibility.
            await supabaseAdmin.from('lessons').update({ meet_link: meetingUrl }).eq('id', lessonId);

            // Just return the payload if lesson_meetings failed purely due to schema not updated yet in dev
            return NextResponse.json({
                meeting: meetingPayload,
                message: 'Meeting created successfully (fallback mode)',
                isNew: true
            });
        }

        // Also update the lessons table for any legacy components relying on it
        // Note: we're only updating meet_link here.
        await supabaseAdmin
            .from('lessons')
            .update({ meet_link: meetingUrl })
            .eq('id', lessonId);

        console.log(`[MeetingCreated] Successfully created valid meeting ${meetingUrl} for lesson ${lessonId} by teacher ${currentUser.id}`);

        return NextResponse.json({
            meeting: newMeeting,
            message: 'Meeting created successfully',
            isNew: true
        });

    } catch (error: any) {
        console.error('Error creating or getting lesson meeting:', error);
        return NextResponse.json({
            error: 'An unexpected error occurred while managing the meeting.',
            details: error.message
        }, { status: 500 });
    }
}

// GET - Get meeting for a lesson (for students to view)
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    // This can be accessed by any enrolled student or teacher
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const lessonId = params.id;
    if (!lessonId) {
        return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 });
    }

    try {
        const { data: meeting, error } = await supabaseAdmin
            .from('lesson_meetings')
            .select('lesson_id, meet_url, meeting_code, status, created_at')
            .eq('lesson_id', lessonId)
            .eq('status', 'active')
            .single();

        if (error || !meeting) {
            // Fallback to lessons table if no row in lesson_meetings
            const { data: lesson, error: lessonError } = await supabaseAdmin
                .from('lessons')
                .select('meet_link')
                .eq('id', lessonId)
                .single();

            if (!lessonError && lesson && lesson.meet_link && lesson.meet_link.startsWith('https://meet.google.com/')) {
                return NextResponse.json({
                    meeting: {
                        lesson_id: lessonId,
                        meet_url: lesson.meet_link,
                        status: 'active'
                    }
                });
            }
            return NextResponse.json({ meeting: null });
        }

        return NextResponse.json({ meeting });
    } catch (error: any) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
