import { google } from 'googleapis';

interface MeetEventDetails {
  summary: string;
  description: string;
  startTime: string;
  endTime: string;
  requestId?: string;
}

interface MeetResult {
  meetLink: string;
  google_event_id: string;
}

type MeetErrorCode =
  | 'GOOGLE_CALENDAR_CONFIG_ERROR'
  | 'GOOGLE_CALENDAR_REFRESH_TOKEN_MISSING'
  | 'GOOGLE_CALENDAR_REFRESH_TOKEN_INVALID'
  | 'GOOGLE_CALENDAR_SCOPE_INSUFFICIENT'
  | 'GOOGLE_CALENDAR_ERROR';

export interface GoogleMeetError extends Error {
  code: MeetErrorCode;
  status: number;
  detail: string;
}

interface GoogleMeetApiErrorShape {
  status: number;
  code: MeetErrorCode;
  error: string;
  detail: string;
}

const REQUIRED_MEET_SCOPE = 'https://www.googleapis.com/auth/calendar.events';

function createGoogleMeetError(
  code: MeetErrorCode,
  status: number,
  message: string,
  detail?: string
): GoogleMeetError {
  const error = new Error(message) as GoogleMeetError;
  error.code = code;
  error.status = status;
  error.detail = detail || message;
  return error;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw createGoogleMeetError(
      'GOOGLE_CALENDAR_CONFIG_ERROR',
      500,
      `Missing required environment variable: ${name}`
    );
  }
  return value;
}

export function toGoogleMeetApiError(error: unknown): GoogleMeetApiErrorShape {
  const meetError = error as Partial<GoogleMeetError> | undefined;
  if (meetError?.code && meetError?.status && typeof meetError.message === 'string') {
    return {
      status: meetError.status,
      code: meetError.code as MeetErrorCode,
      error: meetError.message,
      detail: meetError.detail || meetError.message,
    };
  }

  const fallbackDetail = error instanceof Error ? error.message : 'Unknown Google Calendar error';
  return {
    status: 503,
    code: 'GOOGLE_CALENDAR_ERROR',
    error: 'Google Meet creation failed',
    detail: fallbackDetail,
  };
}

export async function generateMeetLink(
  eventDetails: MeetEventDetails,
  providedRefreshToken?: string
): Promise<MeetResult> {
  const clientId = getRequiredEnv('GOOGLE_CLIENT_ID');
  const clientSecret = getRequiredEnv('GOOGLE_CLIENT_SECRET');
  const refreshToken = providedRefreshToken || process.env.GOOGLE_REFRESH_TOKEN;

  if (!refreshToken) {
    throw createGoogleMeetError(
      'GOOGLE_CALENDAR_REFRESH_TOKEN_MISSING',
      400,
      'Missing Google refresh token. Set GOOGLE_REFRESH_TOKEN or reconnect Google account.',
      `Missing Google refresh token. Required OAuth scope: ${REQUIRED_MEET_SCOPE}.`
    );
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, process.env.NEXTAUTH_URL);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: {
        summary: eventDetails.summary,
        description: eventDetails.description,
        start: {
          dateTime: eventDetails.startTime,
        },
        end: {
          dateTime: eventDetails.endTime,
        },
        conferenceData: {
          createRequest: {
            requestId: eventDetails.requestId || `eduverse-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
    });

    const eventId = response.data.id || '';
    const hangoutLink =
      response.data.hangoutLink ||
      response.data.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === 'video')?.uri;

    if (!hangoutLink) {
      throw new Error('Google Calendar response did not include a Meet URL.');
    }

    return {
      meetLink: hangoutLink,
      google_event_id: eventId,
    };
  } catch (error: any) {
    const responseError = error?.response?.data?.error;
    const message = responseError?.message || error?.message || 'Unknown Google Calendar error';
    const reason = responseError?.errors?.[0]?.reason || responseError?.status || '';
    const detailReason = responseError?.details?.[0]?.reason || '';
    const rawErrorCode = typeof error?.response?.data?.error === 'string' ? error.response.data.error : '';
    const errorDescription = error?.response?.data?.error_description || '';
    const lowerMessage = String(message).toLowerCase();
    const lowerReason = String(reason).toLowerCase();
    const lowerDetailReason = String(detailReason).toLowerCase();
    const lowerRawCode = String(rawErrorCode).toLowerCase();
    const lowerDescription = String(errorDescription).toLowerCase();

    const scopeInsufficient =
      lowerReason.includes('insufficientpermissions') ||
      lowerDetailReason.includes('access_token_scope_insufficient') ||
      lowerMessage.includes('insufficient authentication scopes') ||
      lowerMessage.includes('insufficient permission');

    if (scopeInsufficient) {
      throw createGoogleMeetError(
        'GOOGLE_CALENDAR_SCOPE_INSUFFICIENT',
        400,
        `Google token does not include required Calendar scope (${REQUIRED_MEET_SCOPE}). Re-authorize and grant Calendar access.`,
        message
      );
    }

    const invalidGrant =
      lowerRawCode.includes('invalid_grant') ||
      lowerDescription.includes('invalid_grant') ||
      lowerMessage.includes('invalid_grant') ||
      lowerMessage.includes('token has been expired') ||
      lowerMessage.includes('token has been revoked');

    if (invalidGrant) {
      throw createGoogleMeetError(
        'GOOGLE_CALENDAR_REFRESH_TOKEN_INVALID',
        401,
        'Google refresh token is invalid or revoked. Reconnect Google account to continue.',
        message
      );
    }

    throw createGoogleMeetError(
      'GOOGLE_CALENDAR_ERROR',
      503,
      'Google Calendar API failed while creating Meet link.',
      message
    );
  }
}
