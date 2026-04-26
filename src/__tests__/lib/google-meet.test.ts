import {
    buildGoogleConnectUrl,
    extractMeetingCode,
    GoogleIntegrationError,
    toPublicGoogleError,
} from '@/lib/google-meet';

const TEST_BASE_URL = 'http://127.0.0.1:3000';

describe('google-meet helpers', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = {
            ...originalEnv,
            GOOGLE_CLIENT_ID: 'client-id',
            GOOGLE_CLIENT_SECRET: 'client-secret',
            NEXTAUTH_URL: TEST_BASE_URL,
        };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('builds a Google connect URL with the Meet scope and callback URI', () => {
        const url = buildGoogleConnectUrl({
            state: 'state-123',
            appBaseUrl: TEST_BASE_URL,
        });

        expect(url).toContain('accounts.google.com');
        expect(url).toContain('state=state-123');
        expect(url).toContain(encodeURIComponent(`${TEST_BASE_URL}/api/integrations/google/callback`));
        expect(url).toContain(encodeURIComponent('https://www.googleapis.com/auth/meetings.space.created'));
    });

    it('extracts the Google Meet code from a meeting URI', () => {
        expect(extractMeetingCode('https://meet.google.com/abc-defg-hij')).toBe('abc-defg-hij');
        expect(extractMeetingCode('https://example.com/not-google')).toBeNull();
    });

    it('maps reconnect-required errors to a public response', () => {
        const publicError = toPublicGoogleError(
            new GoogleIntegrationError(
                'GOOGLE_REAUTH_REQUIRED',
                'Reconnect Google.',
                { status: 401, requiresReconnect: true },
            ),
        );

        expect(publicError.error).toBe('Reconnect Google.');
        expect(publicError.code).toBe('GOOGLE_REAUTH_REQUIRED');
        expect(publicError.requiresGoogleAuth).toBe(true);
        expect(publicError.status).toBe(401);
    });
});
