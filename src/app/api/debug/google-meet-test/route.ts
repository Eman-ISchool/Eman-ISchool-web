import { NextResponse } from 'next/server';
import { google } from 'googleapis';

/**
 * Diagnostic endpoint to test Google Calendar + Meet integration end-to-end.
 *
 * Tests:
 * 1. Environment variables present
 * 2. Refresh token → access token exchange
 * 3. Token info (scopes, expiry)
 * 4. Calendar event creation with conferenceData
 * 5. Meet link extraction from response
 *
 * GET /api/debug/google-meet-test
 */
export async function GET() {
    const diagnostics: Record<string, any> = {
        timestamp: new Date().toISOString(),
        steps: [],
    };

    function log(step: string, status: 'ok' | 'fail' | 'warn', detail: any) {
        diagnostics.steps.push({ step, status, detail });
        console.log(`[MEET-DIAG] ${step}: ${status}`, JSON.stringify(detail));
    }

    // Step 1: Check env vars
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    const nextAuthUrl = process.env.NEXTAUTH_URL;

    log('env_check', 'ok', {
        GOOGLE_CLIENT_ID: clientId ? `${clientId.substring(0, 20)}...` : 'MISSING',
        GOOGLE_CLIENT_SECRET: clientSecret ? `${clientSecret.substring(0, 10)}...` : 'MISSING',
        GOOGLE_REFRESH_TOKEN: refreshToken ? `${refreshToken.substring(0, 15)}...` : 'MISSING',
        NEXTAUTH_URL: nextAuthUrl || 'MISSING',
        GOOGLE_CALENDAR_ID: process.env.GOOGLE_CALENDAR_ID || '(not set, will use "primary")',
    });

    if (!clientId || !clientSecret || !refreshToken) {
        log('env_check', 'fail', 'Missing required Google OAuth env vars');
        return NextResponse.json(diagnostics, { status: 500 });
    }

    // Step 2: Exchange refresh token for access token
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, nextAuthUrl);
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    let accessToken: string | null = null;
    try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        accessToken = credentials.access_token || null;
        log('token_refresh', accessToken ? 'ok' : 'fail', {
            access_token: accessToken ? `${accessToken.substring(0, 20)}...` : null,
            expiry_date: credentials.expiry_date ? new Date(credentials.expiry_date).toISOString() : null,
            token_type: credentials.token_type,
            scope: credentials.scope || '(not returned)',
        });
    } catch (err: any) {
        log('token_refresh', 'fail', {
            error: err.message,
            code: err.code,
            response_data: err.response?.data || null,
        });
        return NextResponse.json(diagnostics, { status: 500 });
    }

    if (!accessToken) {
        log('token_refresh', 'fail', 'No access token returned');
        return NextResponse.json(diagnostics, { status: 500 });
    }

    // Step 3: Check token info (scopes)
    try {
        const tokenInfoRes = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`);
        const tokenInfo = await tokenInfoRes.json();
        log('token_info', tokenInfoRes.ok ? 'ok' : 'warn', {
            scope: tokenInfo.scope,
            email: tokenInfo.email,
            expires_in: tokenInfo.expires_in,
            azp: tokenInfo.azp,
            error_description: tokenInfo.error_description || null,
        });

        // Check if calendar scope is present
        const scopes = (tokenInfo.scope || '').split(' ');
        const hasCalendarScope = scopes.some((s: string) =>
            s.includes('calendar') || s.includes('calendar.events')
        );
        if (!hasCalendarScope) {
            log('scope_check', 'fail', {
                message: 'TOKEN DOES NOT HAVE CALENDAR SCOPE - This is likely the root cause',
                available_scopes: scopes,
                required: 'https://www.googleapis.com/auth/calendar.events OR https://www.googleapis.com/auth/calendar',
                fix: 'Re-authorize the Google account with Calendar scope. Visit Google OAuth playground or re-run the connect flow with the correct scope.',
            });
        } else {
            log('scope_check', 'ok', { scopes });
        }
    } catch (err: any) {
        log('token_info', 'warn', { error: err.message });
    }

    // Step 4: Attempt to create a calendar event with conference data
    oauth2Client.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    const requestId = `diag-test-${Date.now()}`;

    const eventPayload = {
        summary: '[DIAG TEST] Eduverse Meet Test - Safe to Delete',
        description: 'Diagnostic test event. This can be safely deleted.',
        start: { dateTime: now.toISOString(), timeZone: 'UTC' },
        end: { dateTime: oneHourLater.toISOString(), timeZone: 'UTC' },
        conferenceData: {
            createRequest: {
                requestId,
                conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
        },
    };

    log('event_payload', 'ok', eventPayload);

    try {
        const res = await calendar.events.insert({
            calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
            conferenceDataVersion: 1,
            requestBody: eventPayload,
        });

        const eventData = res.data;

        // Extract meet link
        const hangoutLink = eventData.hangoutLink;
        const conferenceEntryPoints = eventData.conferenceData?.entryPoints;
        const videoEntryPoint = conferenceEntryPoints?.find(e => e.entryPointType === 'video');

        const meetLink = hangoutLink || videoEntryPoint?.uri;

        log('calendar_event_created', 'ok', {
            event_id: eventData.id,
            html_link: eventData.htmlLink,
            hangout_link: hangoutLink || '(NOT PRESENT)',
            conference_data: eventData.conferenceData ? {
                conference_id: eventData.conferenceData.conferenceId,
                conference_solution: eventData.conferenceData.conferenceSolution?.name,
                entry_points: eventData.conferenceData.entryPoints?.map(ep => ({
                    type: ep.entryPointType,
                    uri: ep.uri,
                    label: ep.label,
                })),
                create_request_status: eventData.conferenceData.createRequest?.status?.statusCode,
            } : '(NO CONFERENCE DATA IN RESPONSE - This is the problem)',
            status: eventData.status,
        });

        if (meetLink) {
            // Validate the link format
            const MEET_CODE_REGEX = /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/i;
            let isValid = false;
            try {
                const parsed = new URL(meetLink);
                const code = parsed.pathname.replace(/^\//, '').split('/')[0];
                isValid = parsed.hostname === 'meet.google.com' && MEET_CODE_REGEX.test(code || '');
            } catch { /* ignore */ }

            log('meet_link_validation', isValid ? 'ok' : 'fail', {
                meet_link: meetLink,
                is_valid_format: isValid,
                message: isValid
                    ? 'SUCCESS - Valid Google Meet link generated'
                    : 'FAIL - Link does not match expected xxx-xxxx-xxx format',
            });
        } else {
            log('meet_link_extraction', 'fail', {
                message: 'No Meet link found in Google Calendar response',
                possible_causes: [
                    'Google Calendar account may not have Google Meet enabled',
                    'Google Workspace admin may have disabled Meet for this org',
                    'conferenceDataVersion=1 not properly sent',
                    'Race condition - conference may not be created synchronously',
                ],
            });
        }

        // Try to clean up the test event
        try {
            if (eventData.id) {
                await calendar.events.delete({
                    calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
                    eventId: eventData.id,
                });
                log('cleanup', 'ok', 'Test event deleted');
            }
        } catch {
            log('cleanup', 'warn', 'Could not delete test event - delete manually from Google Calendar');
        }

    } catch (err: any) {
        const responseError = err.response?.data?.error;
        log('calendar_event_creation', 'fail', {
            error: err.message,
            code: err.code,
            status: err.response?.status,
            google_error: responseError ? {
                code: responseError.code,
                message: responseError.message,
                status: responseError.status,
                errors: responseError.errors,
            } : null,
            possible_causes: [
                'Refresh token expired or revoked',
                'Missing calendar.events scope',
                'Calendar API not enabled in Google Cloud Console',
                'Quota exceeded',
            ],
        });
    }

    // Summary
    const failures = diagnostics.steps.filter((s: any) => s.status === 'fail');
    diagnostics.summary = {
        total_steps: diagnostics.steps.length,
        failures: failures.length,
        root_cause: failures.length > 0
            ? failures.map((f: any) => `${f.step}: ${JSON.stringify(f.detail)}`).join(' | ')
            : 'All steps passed - Meet link generation is working',
    };

    return NextResponse.json(diagnostics, {
        status: failures.length > 0 ? 500 : 200,
    });
}
