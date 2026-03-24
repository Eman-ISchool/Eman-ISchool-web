import { google } from 'googleapis';

// ─── Integration error types ──────────────────────────────────────────────────

type GoogleIntegrationErrorCode =
  | 'GOOGLE_REAUTH_REQUIRED'
  | 'GOOGLE_CONFIG_INVALID'
  | 'GOOGLE_TOKEN_EXCHANGE_FAILED'
  | 'GOOGLE_PROFILE_FETCH_FAILED';

interface GoogleIntegrationErrorOptions {
  status: number;
  requiresReconnect?: boolean;
}

export class GoogleIntegrationError extends Error {
  code: GoogleIntegrationErrorCode;
  status: number;
  requiresReconnect: boolean;

  constructor(
    code: GoogleIntegrationErrorCode,
    message: string,
    options: GoogleIntegrationErrorOptions
  ) {
    super(message);
    this.name = 'GoogleIntegrationError';
    this.code = code;
    this.status = options.status;
    this.requiresReconnect = options.requiresReconnect ?? false;
  }
}

export interface PublicGoogleError {
  error: string;
  code: GoogleIntegrationErrorCode;
  requiresGoogleAuth: boolean;
  status: number;
}

export function toPublicGoogleError(error: GoogleIntegrationError): PublicGoogleError {
  return {
    error: error.message,
    code: error.code,
    requiresGoogleAuth: error.requiresReconnect,
    status: error.status,
  };
}

// ─── OAuth helpers ─────────────────────────────────────────────────────────────

const GOOGLE_MEET_SCOPE = 'https://www.googleapis.com/auth/meetings.space.created';

export function buildGoogleConnectUrl(options: {
  state: string;
  appBaseUrl: string;
}): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new GoogleIntegrationError(
      'GOOGLE_CONFIG_INVALID',
      'GOOGLE_CLIENT_ID is not configured',
      { status: 500 }
    );
  }

  const redirectUri = `${options.appBaseUrl}/api/integrations/google/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GOOGLE_MEET_SCOPE,
    state: options.state,
    access_type: 'offline',
    prompt: 'consent',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function extractMeetingCode(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'meet.google.com') return null;
    const code = parsed.pathname.slice(1);
    return code || null;
  } catch {
    return null;
  }
}

export async function exchangeGoogleAuthCode(
  code: string,
  appBaseUrl: string
): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new GoogleIntegrationError(
      'GOOGLE_CONFIG_INVALID',
      'Google OAuth credentials are not configured',
      { status: 500 }
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    `${appBaseUrl}/api/integrations/google/callback`
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    if (!tokens.access_token) {
      throw new GoogleIntegrationError(
        'GOOGLE_TOKEN_EXCHANGE_FAILED',
        'No access token received from Google',
        { status: 500 }
      );
    }
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? '',
      expires_in: tokens.expiry_date
        ? Math.floor((tokens.expiry_date - Date.now()) / 1000)
        : 3600,
    };
  } catch (err) {
    if (err instanceof GoogleIntegrationError) throw err;
    throw new GoogleIntegrationError(
      'GOOGLE_TOKEN_EXCHANGE_FAILED',
      'Failed to exchange Google auth code',
      { status: 500 }
    );
  }
}

export async function fetchGoogleProfile(
  accessToken: string
): Promise<{ sub: string; email: string }> {
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const oauth2 = google.oauth2({ version: 'v2', auth });
    const { data } = await oauth2.userinfo.get();
    if (!data.id || !data.email) {
      throw new GoogleIntegrationError(
        'GOOGLE_PROFILE_FETCH_FAILED',
        'Incomplete profile data from Google',
        { status: 500 }
      );
    }
    return { sub: data.id, email: data.email };
  } catch (err) {
    if (err instanceof GoogleIntegrationError) throw err;
    throw new GoogleIntegrationError(
      'GOOGLE_PROFILE_FETCH_FAILED',
      'Failed to fetch Google profile',
      { status: 500 }
    );
  }
}

// ─── Calendar / Meet link generation ──────────────────────────────────────────

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

/**
 * Get a snapshot of an active Google Meet meeting via the Meet REST API.
 * Returns participant and status information for the given space.
 */
export async function getGoogleMeetingSnapshot(
  accessToken: string,
  spaceName: string
): Promise<{ activeParticipants: number; participants: any[] }> {
  try {
    const response = await fetch(
      `https://meet.googleapis.com/v2/${spaceName}/participants?pageSize=100`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      return { activeParticipants: 0, participants: [] };
    }

    const data = await response.json();
    const participants = data.participants || [];
    return {
      activeParticipants: participants.filter((p: any) => !p.endTime).length,
      participants,
    };
  } catch {
    return { activeParticipants: 0, participants: [] };
  }
}
