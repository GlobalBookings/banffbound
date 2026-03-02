import 'dotenv/config';
import { google } from 'googleapis';
import http from 'http';

const REDIRECT_PORT = 3000;
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}/oauth2callback`;

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in agents/.env first.');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);

const ADWORDS_SCOPE = 'https://www.googleapis.com/auth/adwords';
const WEBMASTERS_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const ANALYTICS_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';
const scopes = [ADWORDS_SCOPE, WEBMASTERS_SCOPE, ANALYTICS_SCOPE];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: scopes,
});

console.log('\n=== Google OAuth Setup ===\n');
console.log('1. Open this URL in your browser:\n');
console.log(authUrl);
console.log('\n2. Sign in with the Google account that has access to');
console.log('   your Google Ads account AND Search Console.\n');
console.log('3. Grant all requested permissions.\n');
console.log('4. You will be redirected back automatically.\n');
console.log('Waiting for authorization...\n');

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${REDIRECT_PORT}`);
  if (!url.pathname.startsWith('/oauth2callback')) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const code = url.searchParams.get('code');
  if (!code) {
    res.writeHead(400);
    res.end('Missing authorization code');
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Success!</h1><p>You can close this tab and return to the terminal.</p>');

    console.log('\n=== Success! ===\n');
    console.log('Add this to your agents/.env file:\n');
    const rToken = tokens.refresh_token;
    console.log(`GOOGLE_REFRESH_TOKEN=${rToken}`);
    console.log('\nThis token does not expire. Keep it secret.\n');
  } catch (err) {
    res.writeHead(500);
    res.end(`Error: ${err.message}`);
    console.error(`\nFailed to exchange code: ${err.message}`);
  }

  server.close();
});

server.listen(REDIRECT_PORT, () => {
  console.log(`Listening on http://localhost:${REDIRECT_PORT} for callback...`);
});
