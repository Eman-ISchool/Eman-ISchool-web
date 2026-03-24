import { google } from 'googleapis';
import { supabaseAdmin } from '@/lib/supabase';
import { getValidGoogleToken } from '@/lib/google-token';
import { isGoogleMeetUrl } from '@/lib/meet-utils';
import { reportError } from '@/lib/crash-reporter';

interface MeetLinkResult {
  meetLink: string;
  googleEventId: string;
  googleCalendarLink?: string;
  method: string;
}

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';

async function getLessonLikeEntity(lessonId: string) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured');
  }

  const { data: lesson } = await supabaseAdmin
    .from('lessons')
    .select('id, title, description, start_date_time, end_date_time')
    .eq('id', lessonId)
    .single();

  if (lesson) {
    return {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description || 'Eduverse Live Session',
      start: lesson.start_date_time,
      end: lesson.end_date_time,
      source: 'lessons' as const,
    };
  }

  const { data: liveClass } = await supabaseAdmin
    .from('live_classes')
    .select('id, title, description, start_time, end_time')
    .eq('id', lessonId)
    .single();

  if (liveClass) {
    return {
      id: liveClass.id,
      title: liveClass.title,
      description: liveClass.description || 'Eduverse Live Class',
      start: liveClass.start_time,
      end: liveClass.end_time,
      source: 'live_classes' as const,
    };
  }

  throw new Error('Lesson/live class not found');
}

/**
 * Create a Google Meet space via the Meet REST API.
 * Requires scope: https://www.googleapis.com/auth/meetings.space.created
 */
async function createMeetViaRestApi(accessToken: string): Promise<string> {
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
    throw new Error(`Meet REST API ${res.status}: ${errorBody}`);
  }

  const data = await res.json();
  const meetLink = data.meetingUri;
  if (!meetLink) {
    throw new Error('Meet REST API returned no meetingUri');
  }
  return meetLink;
}

/**
 * Create via Google Calendar API with conferenceData.
 * Requires scope: https://www.googleapis.com/auth/calendar.events
 */
async function createMeetViaCalendarApi(
  accessToken: string,
  entity: { id: string; title: string; description: string; start: string; end: string }
): Promise<{ meetLink: string; eventId: string; calendarLink?: string }> {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL
  );
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const start = new Date(entity.start);
  const end = new Date(entity.end);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    throw new Error('Invalid lesson time range for meeting creation');
  }

  const res = await calendar.events.insert({
    calendarId: CALENDAR_ID,
    conferenceDataVersion: 1,
    requestBody: {
      summary: entity.title,
      description: entity.description,
      start: { dateTime: start.toISOString(), timeZone: 'UTC' },
      end: { dateTime: end.toISOString(), timeZone: 'UTC' },
      conferenceData: {
        createRequest: {
          requestId: `meet-${entity.id}-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    },
  });

  const meetLink = res.data.hangoutLink
    || res.data.conferenceData?.entryPoints?.find(e => e.entryPointType === 'video')?.uri;

  if (!meetLink) {
    throw new Error('Calendar API created event but returned no Meet link');
  }

  return {
    meetLink,
    eventId: res.data.id || '',
    calendarLink: res.data.htmlLink || undefined,
  };
}

export async function generateMeetLink(userId: string, lessonId: string): Promise<MeetLinkResult> {
  // Get access token (per-user with env fallback)
  const tokenResult = await getValidGoogleToken(userId);
  if (!tokenResult.success || !tokenResult.accessToken) {
    const message = tokenResult.error || 'Google account not connected or token missing';
    reportError(new Error(message), { userId, lessonId, area: 'meet-service' });
    throw new Error(message);
  }

  const accessToken = tokenResult.accessToken;
  const entity = await getLessonLikeEntity(lessonId);

  // Strategy 1: Try Meet REST API first (uses meetings.space.created scope)
  try {
    const meetLink = await createMeetViaRestApi(accessToken);
    console.log(`[meet-service] Created via Meet REST API: ${meetLink}`);

    if (!isGoogleMeetUrl(meetLink)) {
      throw new Error(`Meet REST API returned invalid URL: ${meetLink}`);
    }

    return { meetLink, googleEventId: '', method: 'meet_rest_api' };
  } catch (meetErr: any) {
    console.warn(`[meet-service] Meet REST API failed: ${meetErr.message}, trying Calendar API...`);
  }

  // Strategy 2: Fallback to Calendar API (uses calendar.events scope)
  try {
    const result = await createMeetViaCalendarApi(accessToken, entity);
    console.log(`[meet-service] Created via Calendar API: ${result.meetLink}`);

    if (!isGoogleMeetUrl(result.meetLink)) {
      throw new Error(`Calendar API returned invalid URL: ${result.meetLink}`);
    }

    return {
      meetLink: result.meetLink,
      googleEventId: result.eventId,
      googleCalendarLink: result.calendarLink,
      method: 'calendar_api',
    };
  } catch (calErr: any) {
    const message = `Both Meet REST API and Calendar API failed. Calendar error: ${calErr.message}`;
    reportError(new Error(message), { userId, lessonId, area: 'meet-service' });
    throw new Error(message);
  }
}
