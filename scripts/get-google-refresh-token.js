/**
 * One-time script to obtain a Google OAuth refresh token
 * for the school's Google account.
 *
 * Usage:
 *   1. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env
 *   2. Run: node scripts/get-google-refresh-token.js
 *   3. A browser will open automatically
 *   4. Sign in with azmyhesham2020@gmail.com and click "Allow"
 *   5. The script captures the callback and prints the token
 *
 * IMPORTANT: You must add http://localhost:3333/oauth2callback
 * as an authorized redirect URI in Google Cloud Console:
 *   https://console.cloud.google.com/apis/credentials
 */

const { google } = require('googleapis');
const http = require('http');
const { URL } = require('url');
const path = require('path');
const { exec } = require('child_process');

// Load .env manually (no dotenv package required)
const fs = require('fs');
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8')
    .split('\n')
    .forEach(line => {
      const [key, ...rest] = line.split('=');
      if (key && rest.length) process.env[key.trim()] = rest.join('=').trim();
    });
}
// .env.local overrides
const envLocalPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envLocalPath)) {
  fs.readFileSync(envLocalPath, 'utf-8')
    .split('\n')
    .forEach(line => {
      const [key, ...rest] = line.split('=');
      if (key && rest.length) process.env[key.trim()] = rest.join('=').trim();
    });
}

const CLIENT_ID     = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const PORT = 3333;
const REDIRECT_URI  = `http://localhost:${PORT}/oauth2callback`;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('\n  GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not found in .env\n');
  console.error('   Add them first, then re-run this script.\n');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: SCOPES,
});

// Start a temporary local server to capture the OAuth callback
const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url, `http://localhost:${PORT}`);

  if (reqUrl.pathname !== '/oauth2callback') {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const code = reqUrl.searchParams.get('code');
  const error = reqUrl.searchParams.get('error');

  if (error) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<h1>Error</h1><p>${error}</p><p>Close this tab and try again.</p>`);
    console.error('\n  OAuth error:', error);
    server.close();
    process.exit(1);
    return;
  }

  if (!code) {
    res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>Error</h1><p>No authorization code received.</p>');
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1 style="color:green">Success!</h1><p>Token obtained. You can close this tab now.</p>');

    console.log('\n====================================================');
    console.log('  Success! Add this to your .env.local file:');
    console.log('====================================================\n');
    if (tokens.refresh_token) {
      console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    } else {
      console.warn('  WARNING: No refresh_token returned.');
      console.warn('  This usually means the account was already authorized.');
      console.warn('  Revoke access at: https://myaccount.google.com/permissions');
      console.warn('  Then run this script again.\n');
    }
    console.log('\n====================================================\n');
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<h1>Error</h1><p>${err.message}</p>`);
    console.error('\n  Error exchanging code:', err.message);
  }

  server.close();
});

server.listen(PORT, () => {
  console.log('\n====================================================');
  console.log('  Google OAuth Token Setup');
  console.log('====================================================\n');
  console.log(`Listening on http://localhost:${PORT}`);
  console.log('\nOpening browser...\n');
  console.log('If it does not open, visit this URL manually:\n');
  console.log('  ' + authUrl);
  console.log('\nSign in with: azmyhesham2020@gmail.com');
  console.log('Click "Allow" when prompted.\n');

  // Open browser
  const openCmd = process.platform === 'darwin' ? 'open'
    : process.platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${openCmd} "${authUrl}"`);
});
