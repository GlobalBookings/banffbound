import 'dotenv/config';
import readline from 'readline';

// ── One-time Pinterest OAuth helper ───────────────────────
// Run: node scripts/pinterest-oauth.js
// This walks you through authorizing the app with WRITE scopes
// (pins:write, boards:write) which the dashboard "Generate token"
// button does NOT provide. Trial apps can still grant write scopes
// to the app owner's own account via this flow.

const APP_ID = process.env.PINTEREST_APP_ID;
const APP_SECRET = process.env.PINTEREST_APP_SECRET;
const REDIRECT_URI = process.env.PINTEREST_REDIRECT_URI || 'https://banffbound.com/';

// Pass --sandbox to mint a sandbox token (trial apps can create pins there).
const SANDBOX = process.argv.includes('--sandbox');
const API_BASE = SANDBOX ? 'https://api-sandbox.pinterest.com' : 'https://api.pinterest.com';

const SCOPES = 'pins:read,pins:write,boards:read,boards:write,user_accounts:read';

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, answer => { rl.close(); resolve(answer.trim()); }));
}

async function main() {
  if (!APP_ID || !APP_SECRET) {
    console.error('\nERROR: Set PINTEREST_APP_ID and PINTEREST_APP_SECRET in .env first.\n');
    console.error('Find these at https://developers.pinterest.com/apps/ → your app → "App ID" and "App secret key"\n');
    process.exit(1);
  }

  // Step 1: build the authorization URL
  const authUrl = `https://www.pinterest.com/oauth/?client_id=${APP_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(SCOPES)}`;

  console.log('\n════════════════════════════════════════════════════════════');
  console.log('STEP 1: Open this URL in your browser and authorize the app:');
  console.log('════════════════════════════════════════════════════════════\n');
  console.log(authUrl);
  console.log('\n────────────────────────────────────────────────────────────');
  console.log(`After authorizing, Pinterest will redirect you to:`);
  console.log(`  ${REDIRECT_URI}?code=XXXXXXXX`);
  console.log('Copy the "code" value from the address bar (everything after code=,');
  console.log('and before any & if present).');
  console.log('────────────────────────────────────────────────────────────\n');

  const code = await ask('STEP 2: Paste the code here: ');
  if (!code) {
    console.error('No code provided. Aborting.');
    process.exit(1);
  }

  // Step 3: exchange the code for an access token
  console.log(`\nExchanging code for ${SANDBOX ? 'SANDBOX' : 'PRODUCTION'} access token...`);
  const basicAuth = Buffer.from(`${APP_ID}:${APP_SECRET}`).toString('base64');
  const res = await fetch(`${API_BASE}/v5/oauth/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('\nToken exchange failed:', JSON.stringify(data, null, 2));
    process.exit(1);
  }

  console.log('\n✅ SUCCESS! Add these to your agents/.env:\n');
  console.log(`PINTEREST_ACCESS_TOKEN=${data.access_token}`);
  if (data.refresh_token) {
    console.log(`PINTEREST_REFRESH_TOKEN=${data.refresh_token}`);
  }
  console.log(`\nScopes granted: ${data.scope || SCOPES}`);
  console.log(`Token expires in: ${data.expires_in ? Math.round(data.expires_in / 86400) + ' days' : 'unknown'}`);
  console.log('\nThe agent will use the refresh token to auto-renew the access token.\n');
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
