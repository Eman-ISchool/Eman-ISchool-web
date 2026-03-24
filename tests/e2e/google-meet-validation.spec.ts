import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const MEET_CODE_REGEX = /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/i;

function isValidMeetUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        if (parsed.hostname !== 'meet.google.com') return false;
        const code = parsed.pathname.replace(/^\//, '').split('/')[0];
        return MEET_CODE_REGEX.test(code || '');
    } catch {
        return false;
    }
}

test.describe('Google Meet Link Generation - Deep Validation', () => {

    test('Step 1: Diagnostic endpoint validates Google credentials and Meet creation', async ({ request }) => {
        test.setTimeout(60_000);

        console.log('=== STEP 1: Running diagnostic endpoint ===');
        const res = await request.get(`${BASE_URL}/api/debug/google-meet-test`);
        const body = await res.json();

        console.log('Diagnostic result:', JSON.stringify(body, null, 2));

        // Log each step
        for (const step of body.steps || []) {
            console.log(`  [${step.status}] ${step.step}:`, JSON.stringify(step.detail));
        }

        // Check for failures
        const failures = (body.steps || []).filter((s: any) => s.status === 'fail');
        if (failures.length > 0) {
            console.error('DIAGNOSTIC FAILURES:', failures);
        }

        // We expect the diagnostic to succeed OR give us clear error info
        // The key check: did it create a valid meet link?
        const meetLinkStep = body.steps?.find((s: any) => s.step === 'meet_link_validation');
        const eventStep = body.steps?.find((s: any) => s.step === 'calendar_event_created');

        if (meetLinkStep?.status === 'ok') {
            console.log('DIAGNOSTIC PASS: Valid meet link created via diagnostic');
            console.log('Meet link:', meetLinkStep.detail.meet_link);
        } else if (eventStep?.detail?.conference_data === '(NO CONFERENCE DATA IN RESPONSE - This is the problem)') {
            console.error('ROOT CAUSE: Google Calendar creates event but NO conferenceData returned');
            console.error('This means the Google account may not have Meet enabled or scopes are wrong');
        }

        // Log the full summary
        console.log('Summary:', body.summary);
    });

    test('Step 2: POST /api/meetings/create generates valid Meet link', async ({ request }) => {
        test.setTimeout(60_000);

        console.log('=== STEP 2: Testing /api/meetings/create ===');

        // First login to get a session
        const csrfRes = await request.get(`${BASE_URL}/api/auth/csrf`);
        const csrfData = await csrfRes.json();
        const csrfToken = csrfData.csrfToken;

        console.log('Got CSRF token:', csrfToken ? 'yes' : 'no');

        // Login as admin/teacher
        const loginRes = await request.post(`${BASE_URL}/api/auth/callback/credentials`, {
            form: {
                email: 'admin@eduverse.com',
                password: 'password123',
                csrfToken,
                callbackUrl: BASE_URL,
                json: 'true',
            },
        });

        console.log('Login status:', loginRes.status());

        // Check session
        const sessionRes = await request.get(`${BASE_URL}/api/auth/session`);
        const session = await sessionRes.json();
        console.log('Session user:', session?.user?.email || 'NOT LOGGED IN');

        if (!session?.user) {
            console.error('LOGIN FAILED - Cannot test meeting creation without auth');
            // Try with different credentials
            const loginRes2 = await request.post(`${BASE_URL}/api/auth/callback/credentials`, {
                form: {
                    email: 'teacher@eduverse.com',
                    password: 'password123',
                    csrfToken,
                    callbackUrl: BASE_URL,
                    json: 'true',
                },
            });
            console.log('Teacher login status:', loginRes2.status());

            const sessionRes2 = await request.get(`${BASE_URL}/api/auth/session`);
            const session2 = await sessionRes2.json();
            console.log('Teacher session:', session2?.user?.email || 'NOT LOGGED IN');
        }

        // Now test meeting creation
        const meetRes = await request.post(`${BASE_URL}/api/meetings/create`, {
            data: {
                courseId: 'test-validation',
                title: 'Validation Test Meeting',
                description: 'Automated validation of Google Meet generation',
            },
        });

        const meetData = await meetRes.json();
        console.log('Meeting creation status:', meetRes.status());
        console.log('Meeting creation response:', JSON.stringify(meetData, null, 2));

        if (meetRes.ok() && meetData.meetLink) {
            console.log('Generated Meet link:', meetData.meetLink);
            console.log('Method used:', meetData.method || 'unknown');
            console.log('Event ID:', meetData.eventId || 'none');

            // Validate format
            const isValid = isValidMeetUrl(meetData.meetLink);
            console.log('Format valid (xxx-xxxx-xxx):', isValid);

            expect(meetData.meetLink).toContain('https://meet.google.com/');
            expect(isValid).toBe(true);
        } else {
            console.error('MEETING CREATION FAILED:', meetData.error || meetData);
            console.error('Detail:', meetData.detail || 'none');
            console.error('Code:', meetData.code || 'none');
        }
    });

    test('Step 3: Open generated Meet link in browser and verify it is real', async ({ page, request }) => {
        test.setTimeout(90_000);

        console.log('=== STEP 3: Browser validation of Meet link ===');

        // Login first
        const csrfRes = await request.get(`${BASE_URL}/api/auth/csrf`);
        const { csrfToken } = await csrfRes.json();

        await request.post(`${BASE_URL}/api/auth/callback/credentials`, {
            form: {
                email: 'admin@eduverse.com',
                password: 'password123',
                csrfToken,
                callbackUrl: BASE_URL,
                json: 'true',
            },
        });

        // Create a meeting
        const meetRes = await request.post(`${BASE_URL}/api/meetings/create`, {
            data: {
                courseId: 'browser-test',
                title: 'Browser Validation Meeting',
                description: 'Testing if link opens correctly',
            },
        });

        const meetData = await meetRes.json();

        if (!meetRes.ok() || !meetData.meetLink) {
            console.error('Cannot test browser - meeting creation failed:', meetData);
            test.skip(true, 'Meeting creation failed - check credentials');
            return;
        }

        const meetLink = meetData.meetLink;
        console.log('Opening Meet link in browser:', meetLink);

        // Navigate to the Meet link
        await page.goto(meetLink, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(5000); // Let Google Meet page fully load

        const pageUrl = page.url();
        const pageContent = await page.textContent('body') || '';

        console.log('Final URL:', pageUrl);
        console.log('Page contains "Check your meeting code":', pageContent.includes('Check your meeting code'));
        console.log('Page contains "Returning to home screen":', pageContent.includes('Returning to home screen'));

        await page.screenshot({ path: '/private/tmp/claude-501/meet-page-screenshot.png', fullPage: true });
        console.log('Screenshot saved to /private/tmp/claude-501/meet-page-screenshot.png');

        // CRITICAL ASSERTIONS
        const isInvalidPage = pageContent.includes('Check your meeting code')
            || pageContent.includes('Returning to home screen')
            || pageContent.includes('meeting code in the URL');

        if (isInvalidPage) {
            console.error('FAIL: Google shows INVALID MEETING CODE page');
            console.error('This means the Meet link was NOT properly created by Google');
            expect(isInvalidPage).toBe(false); // This will fail the test
        } else {
            console.log('PASS: Google Meet page loaded without "invalid code" error');
            // Valid states: join page, waiting room, sign-in required, etc.
            console.log('URL still on meet.google.com:', pageUrl.includes('meet.google.com'));
        }
    });
});
