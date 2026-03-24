import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isTeacherOrAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { isGoogleMeetUrl } from '@/lib/meet-utils';
import { google } from 'googleapis';

/**
 * Refresh the GOOGLE_REFRESH_TOKEN env var into a fresh access token.
 * Returns the access token string or throws.
 */
async function getAccessTokenFromEnvRefreshToken(): Promise<string> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
        throw new Error('Missing GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or GOOGLE_REFRESH_TOKEN env vars');
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const { credentials } = await oauth2Client.refreshAccessToken();
    if (!credentials.access_token) {
        throw new Error('Google returned no access_token when refreshing');
    }

    console.log('[meetings/create] Token refreshed. Scopes:', credentials.scope || '(not returned)');
    return credentials.access_token;
}

/**
 * Primary method: Create a Google Meet space via the Meet REST API.
 * Requires scope: https://www.googleapis.com/auth/meetings.space.created
 */
async function createMeetViaRestApi(accessToken: string): Promise<string> {
    console.log('[meetings/create] Trying Meet REST API (POST /v2/spaces)...');

    const res = await fetch('https://meet.googleapis.com/v2/spaces', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
    });

    if (!res.ok) {
        const errorBody = await res.text();
        console.error('[meetings/create] Meet REST API failed:', res.status, errorBody);
        throw new Error(`Meet REST API ${res.status}: ${errorBody}`);
    }

    const data = await res.json();
    console.log('[meetings/create] Meet REST API response:', JSON.stringify(data));

    // Response shape: { name: "spaces/xxx-yyyy-zzz", meetingUri: "https://meet.google.com/xxx-yyyy-zzz", meetingCode: "xxx-yyyy-zzz" }
    const meetLink = data.meetingUri;
    if (!meetLink) {
        throw new Error('Meet REST API returned no meetingUri');
    }

    return meetLink;
}

/**
 * Fallback: Create via Google Calendar API with conferenceData.
 * Requires scope: https://www.googleapis.com/auth/calendar.events
 */
async function createMeetViaCalendarApi(
    accessToken: string,
    title: string,
    description: string,
    courseId: string
): Promise<{ meetLink: string; eventId: string }> {
    console.log('[meetings/create] Trying Calendar API fallback...');

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.NEXTAUTH_URL
    );
    oauth2Client.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    const res = await calendar.events.insert({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        conferenceDataVersion: 1,
        requestBody: {
            summary: title || 'Eduverse Course Meeting',
            description: description || 'Virtual classroom meeting',
            start: { dateTime: now.toISOString(), timeZone: 'UTC' },
            end: { dateTime: oneHourLater.toISOString(), timeZone: 'UTC' },
            conferenceData: {
                createRequest: {
                    requestId: `course-meet-${courseId || 'new'}-${Date.now()}`,
                    conferenceSolutionKey: { type: 'hangoutsMeet' },
                },
            },
        },
    });

    console.log('[meetings/create] Calendar API response - hangoutLink:', res.data.hangoutLink,
        'conferenceData:', JSON.stringify(res.data.conferenceData));

    const meetLink = res.data.hangoutLink
        || res.data.conferenceData?.entryPoints?.find(e => e.entryPointType === 'video')?.uri;

    if (!meetLink) {
        throw new Error('Calendar API created event but returned no Meet link (conferenceData missing)');
    }

    return { meetLink, eventId: res.data.id || '' };
}

// POST - Create a Google Meet meeting for a course (admin/teacher use)
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const currentUser = await getCurrentUser(session);

    if (!currentUser || !isTeacherOrAdmin(currentUser.role)) {
        return NextResponse.json({
            error: `Forbidden. Role "${currentUser?.role}" is not admin/teacher.`,
        }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { courseId, title, description } = body;

        // Step 1: Get access token from env refresh token
        let accessToken: string;
        try {
            accessToken = await getAccessTokenFromEnvRefreshToken();
        } catch (tokenErr: any) {
            console.error('[meetings/create] Token refresh failed:', tokenErr.message);
            return NextResponse.json({
                error: 'فشل تجديد رمز Google. يرجى التحقق من إعدادات GOOGLE_REFRESH_TOKEN.',
                detail: tokenErr.message,
                code: 'TOKEN_REFRESH_FAILED',
            }, { status: 500 });
        }

        // Step 2: Try Meet REST API first (uses meetings.space.created scope)
        let meetingUrl = '';
        let eventId = '';
        let method = '';

        try {
            meetingUrl = await createMeetViaRestApi(accessToken);
            method = 'meet_rest_api';
        } catch (meetApiErr: any) {
            console.warn('[meetings/create] Meet REST API failed, trying Calendar API:', meetApiErr.message);

            // Step 3: Fallback to Calendar API (uses calendar.events scope)
            try {
                const calResult = await createMeetViaCalendarApi(
                    accessToken, title || '', description || '', courseId || 'new'
                );
                meetingUrl = calResult.meetLink;
                eventId = calResult.eventId;
                method = 'calendar_api';
            } catch (calErr: any) {
                console.error('[meetings/create] Calendar API also failed:', calErr.message);
                return NextResponse.json({
                    error: 'فشل إنشاء اجتماع Google Meet. تأكد من أن حساب Google لديه صلاحيات التقويم أو الاجتماعات.',
                    detail: `Meet API: ${meetApiErr.message} | Calendar API: ${calErr.message}`,
                    code: 'MEET_CREATION_FAILED',
                }, { status: 500 });
            }
        }

        // Step 4: Validate the link strictly
        if (!isGoogleMeetUrl(meetingUrl)) {
            console.error('[meetings/create] Generated URL failed validation:', meetingUrl);
            return NextResponse.json({
                error: 'تم إنشاء رابط لكنه غير صالح. يرجى المحاولة مرة أخرى.',
                detail: `Invalid URL: ${meetingUrl}`,
            }, { status: 500 });
        }

        // Step 5: Save to course record
        if (courseId && courseId !== 'new' && supabaseAdmin) {
            const { error: dbErr } = await supabaseAdmin
                .from('courses')
                .update({ meet_link: meetingUrl })
                .eq('id', courseId);
            if (dbErr) {
                console.warn('[meetings/create] DB save failed:', dbErr);
            } else {
                console.log('[meetings/create] Saved to course', courseId);
            }
        }

        console.log(`[meetings/create] SUCCESS via ${method}:`, meetingUrl);

        return NextResponse.json({
            meetLink: meetingUrl,
            eventId,
            method,
            message: 'Meeting created successfully',
        });
    } catch (error: any) {
        console.error('[meetings/create] Unexpected error:', error?.message || error);
        return NextResponse.json(
            { error: error?.message || 'فشل إنشاء الاجتماع', code: 'UNEXPECTED_ERROR' },
            { status: 500 }
        );
    }
}
