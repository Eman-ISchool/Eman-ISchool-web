import { google } from 'googleapis';

export interface MeetEventDetails {
    summary: string;
    description: string;
    startTime: string; // ISO string
    endTime: string;   // ISO string
}

export interface MeetResponse {
    success: boolean;
    meetLink?: string;
    eventId?: string;
    htmlLink?: string;
    error?: string;
    requiresReauth?: boolean;
}

export class MeetError extends Error {
    public requiresReauth: boolean;
    public retryable: boolean;

    constructor(message: string, requiresReauth = false, retryable = false) {
        super(message);
        this.name = 'MeetError';
        this.requiresReauth = requiresReauth;
        this.retryable = retryable;
    }
}

/**
 * Create a Google Meet event with retry logic and error handling
 */
export async function createGoogleMeet(
    accessToken: string,
    eventDetails: MeetEventDetails,
    retryCount = 0
): Promise<MeetResponse> {
    const MAX_RETRIES = 3;
    const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff

    // Validate access token
    if (!accessToken || accessToken.trim() === '') {
        return {
            success: false,
            error: 'لا يوجد رمز وصول صالح. يرجى تسجيل الدخول مرة أخرى.',
            requiresReauth: true,
        };
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = {
        summary: eventDetails.summary,
        description: eventDetails.description,
        start: {
            dateTime: eventDetails.startTime,
            timeZone: 'UTC',
        },
        end: {
            dateTime: eventDetails.endTime,
            timeZone: 'UTC',
        },
        conferenceData: {
            createRequest: {
                requestId: `meet-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                conferenceSolutionKey: {
                    type: 'hangoutsMeet',
                },
            },
        },
    };

    try {
        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
            conferenceDataVersion: 1,
        });

        if (!response.data.hangoutLink) {
            console.warn('Event created but no Meet link generated');
        }

        return {
            success: true,
            meetLink: response.data.hangoutLink || undefined,
            eventId: response.data.id || undefined,
            htmlLink: response.data.htmlLink || undefined,
        };
    } catch (error: any) {
        console.error(`Error creating Google Meet (attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`, error);

        // Handle specific error cases
        const status = error?.response?.status || error?.code;
        const errorMessage = error?.message || 'خطأ غير معروف';

        // Token expired or invalid
        if (status === 401 || status === 403) {
            return {
                success: false,
                error: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.',
                requiresReauth: true,
            };
        }

        // Rate limiting
        if (status === 429) {
            if (retryCount < MAX_RETRIES) {
                await delay(RETRY_DELAYS[retryCount] || 4000);
                return createGoogleMeet(accessToken, eventDetails, retryCount + 1);
            }
            return {
                success: false,
                error: 'تم تجاوز الحد المسموح. يرجى المحاولة لاحقاً.',
            };
        }

        // Server errors - retryable
        if (status >= 500 && status < 600) {
            if (retryCount < MAX_RETRIES) {
                await delay(RETRY_DELAYS[retryCount] || 4000);
                return createGoogleMeet(accessToken, eventDetails, retryCount + 1);
            }
            return {
                success: false,
                error: 'خطأ في الخادم. يرجى المحاولة لاحقاً.',
            };
        }

        // Network errors - retryable
        if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
            if (retryCount < MAX_RETRIES) {
                await delay(RETRY_DELAYS[retryCount] || 4000);
                return createGoogleMeet(accessToken, eventDetails, retryCount + 1);
            }
            return {
                success: false,
                error: 'خطأ في الاتصال. يرجى التحقق من الإنترنت.',
            };
        }

        // Generic error
        return {
            success: false,
            error: `فشل إنشاء الاجتماع: ${errorMessage}`,
        };
    }
}

/**
 * Delay helper for retry logic
 */
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validate if a Meet link is properly formatted
 */
export function isValidMeetLink(link: string | null | undefined): boolean {
    if (!link) return false;
    return link.startsWith('https://meet.google.com/');
}
