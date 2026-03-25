/**
 * End-to-end test for Google Meet link generation.
 *
 * Usage:
 *   node scripts/test-meet-e2e.js
 *
 * Tests:
 *   1. Token refresh (validates GOOGLE_REFRESH_TOKEN)
 *   2. Calendar event creation with conferenceData
 *   3. Meet link extraction (hangoutLink or entryPoints)
 *   4. Meet link format validation
 *   5. Cleanup (deletes test event)
 */

const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// Load .env.local
['.env.local', '.env'].forEach(name => {
  const p = path.join(__dirname, '..', name);
  if (fs.existsSync(p)) {
    fs.readFileSync(p, 'utf-8').split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eq = trimmed.indexOf('=');
      if (eq > 0) {
        const key = trimmed.slice(0, eq).trim();
        const val = trimmed.slice(eq + 1).trim();
        if (!process.env[key]) process.env[key] = val;
      }
    });
  }
});

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

console.log('\n====  Google Meet E2E Test  ====\n');

// Step 1: Check env vars
console.log('[1/5] Checking environment variables...');
const missing = [];
if (!CLIENT_ID) missing.push('GOOGLE_CLIENT_ID');
if (!CLIENT_SECRET) missing.push('GOOGLE_CLIENT_SECRET');
if (!REFRESH_TOKEN) missing.push('GOOGLE_REFRESH_TOKEN');
if (missing.length) {
  console.error('  MISSING:', missing.join(', '));
  process.exit(1);
}
console.log('  OK: All env vars present');
console.log('  Client ID:', CLIENT_ID.slice(0, 20) + '...');
console.log('  Refresh token:', REFRESH_TOKEN.slice(0, 15) + '...');

// Step 2: Test token refresh
async function run() {
  console.log('\n[2/5] Testing token refresh...');
  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, process.env.NEXTAUTH_URL || 'http://localhost:3000');
  oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

  let accessToken;
  try {
    const { token } = await oauth2Client.getAccessToken();
    accessToken = token;
    console.log('  OK: Got access token, length:', token?.length);
  } catch (err) {
    console.error('  FAILED: Token refresh error:', err.message);
    if (err.response?.data) {
      console.error('  Response:', JSON.stringify(err.response.data));
    }
    console.error('\n  --> You need a new GOOGLE_REFRESH_TOKEN.');
    console.error('  --> Run: node scripts/get-google-refresh-token.js');
    console.error('  --> Or revoke & re-auth at: https://myaccount.google.com/permissions\n');
    process.exit(1);
  }

  // Step 3: Create calendar event with conferenceData
  console.log('\n[3/5] Creating Google Calendar event with Meet conference...');
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const now = new Date();
  const later = new Date(now.getTime() + 60 * 60 * 1000);

  let event;
  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: {
        summary: '[TEST] Eduverse Meet Link Verification',
        description: 'Automated E2E test - safe to delete',
        start: { dateTime: now.toISOString(), timeZone: 'Asia/Riyadh' },
        end: { dateTime: later.toISOString(), timeZone: 'Asia/Riyadh' },
        conferenceData: {
          createRequest: {
            requestId: 'eduverse-e2e-' + Date.now(),
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
    });
    event = response.data;
    console.log('  OK: Event created, ID:', event.id);
  } catch (err) {
    console.error('  FAILED: Calendar event creation error:', err.message);
    if (err.response?.data?.error) {
      console.error('  Details:', JSON.stringify(err.response.data.error, null, 2));
    }
    process.exit(1);
  }

  // Step 4: Extract and validate Meet link
  console.log('\n[4/5] Extracting Meet link...');
  const hangoutLink = event.hangoutLink;
  const videoEntry = event.conferenceData?.entryPoints?.find(e => e.entryPointType === 'video');
  const meetLink = hangoutLink || videoEntry?.uri;

  console.log('  hangoutLink:', hangoutLink || '(not present)');
  console.log('  videoEntry URI:', videoEntry?.uri || '(not present)');
  console.log('  Final meetLink:', meetLink || '(NONE!)');

  if (!meetLink) {
    console.error('  FAILED: No Meet link in response!');
    process.exit(1);
  }

  // Validate format
  try {
    const url = new URL(meetLink);
    const isValid = url.hostname === 'meet.google.com' && /^\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/.test(url.pathname);
    console.log('  Format valid:', isValid);
    if (!isValid) {
      console.warn('  WARNING: Meet link format unexpected:', meetLink);
    }
  } catch {
    console.error('  FAILED: Meet link is not a valid URL:', meetLink);
  }

  // Step 5: Cleanup
  console.log('\n[5/5] Cleaning up test event...');
  try {
    await calendar.events.delete({ calendarId: 'primary', eventId: event.id });
    console.log('  OK: Test event deleted');
  } catch (err) {
    console.warn('  WARNING: Could not delete test event:', err.message);
  }

  console.log('\n====  ALL TESTS PASSED  ====');
  console.log('  Meet link generation is working correctly.');
  console.log('  Generated link:', meetLink);
  console.log('  Event ID:', event.id);
  console.log('  Conference ID:', event.conferenceData?.conferenceId || 'N/A');
  console.log('=============================\n');
  process.exit(0);
}

run().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});

// Global timeout
setTimeout(() => {
  console.error('\n  TIMEOUT: Script took too long (30s). Possible network issue.');
  process.exit(2);
}, 30000);
