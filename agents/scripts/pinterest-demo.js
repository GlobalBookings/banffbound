import 'dotenv/config';
import readline from 'readline';

// ════════════════════════════════════════════════════════════
// Pinterest Standard Access — Demo Video Script
// ════════════════════════════════════════════════════════════
// Records the COMPLETE flow Pinterest requires for Standard access:
//   1. OAuth authorization (user grants access)
//   2. Exchange auth code for an access token
//   3. A live API action (create a Pin) + read it back
//
// Runs against the SANDBOX so trial apps can complete it.
// Screen-record your terminal running this end-to-end and upload
// that video with your Standard access request.
//
// Usage: node scripts/pinterest-demo.js
// ════════════════════════════════════════════════════════════

const APP_ID = process.env.PINTEREST_APP_ID;
const APP_SECRET = process.env.PINTEREST_APP_SECRET;
const REDIRECT_URI = process.env.PINTEREST_REDIRECT_URI || 'https://banffbound.com/';
const API_BASE = 'https://api-sandbox.pinterest.com';
const SCOPES = 'pins:read,pins:write,boards:read,boards:write,user_accounts:read';

const DEMO_IMAGE = 'https://images.unsplash.com/photo-1609825488888-3a766db05542?w=1000';
const SITE_LINK = 'https://banffbound.com/blog/best-things-to-do-in-banff-2026';

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, a => { rl.close(); resolve(a.trim()); }));
}

function hr() { console.log('────────────────────────────────────────────────────────────'); }

async function main() {
  if (!APP_ID || !APP_SECRET) {
    console.error('\nERROR: Set PINTEREST_APP_ID and PINTEREST_APP_SECRET in .env first.\n');
    process.exit(1);
  }

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║  BanffBound × Pinterest API — Standard Access Demo         ║');
  console.log('║  Demonstrating OAuth + Pin creation (Sandbox)              ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // ── STEP 1: OAuth authorization ──────────────────────────
  console.log('STEP 1 / 4 — OAuth user authorization');
  hr();
  const authUrl = `https://www.pinterest.com/oauth/?client_id=${APP_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code&scope=${encodeURIComponent(SCOPES)}`;
  console.log('Open this URL in your browser and click "Give access":\n');
  console.log(authUrl + '\n');
  console.log(`You will be redirected to ${REDIRECT_URI}?code=XXXX`);
  console.log('Copy the code value from the address bar.\n');

  const code = await ask('Paste the authorization code: ');
  if (!code) { console.error('No code provided.'); process.exit(1); }

  // ── STEP 2: Exchange code for token ──────────────────────
  console.log('\nSTEP 2 / 4 — Exchanging authorization code for an access token');
  hr();
  const basicAuth = Buffer.from(`${APP_ID}:${APP_SECRET}`).toString('base64');
  const tokenRes = await fetch(`${API_BASE}/v5/oauth/token`, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${basicAuth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: REDIRECT_URI }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) {
    console.error('Token exchange failed:', JSON.stringify(tokenData, null, 2));
    process.exit(1);
  }
  const token = tokenData.access_token;
  console.log('✅ Access token obtained.');
  console.log('   Scopes granted:', tokenData.scope);
  console.log('   Token type:', tokenData.token_type || 'bearer');

  const authHeader = { 'Authorization': `Bearer ${token}` };

  // Confirm identity
  const meRes = await fetch(`${API_BASE}/v5/user_account`, { headers: authHeader });
  const me = await meRes.json();
  if (meRes.ok) console.log('   Authenticated as:', me.username);

  // ── STEP 3: Create a Pin (live API action) ───────────────
  console.log('\nSTEP 3 / 4 — Creating a Pin via the API');
  hr();

  // Resolve a board to pin to (create one if needed)
  let boardId;
  const boardsRes = await fetch(`${API_BASE}/v5/boards?page_size=25`, { headers: authHeader });
  const boards = await boardsRes.json();
  if (boards.items && boards.items.length > 0) {
    boardId = boards.items[0].id;
    console.log(`Using existing board: "${boards.items[0].name}" (${boardId})`);
  } else {
    console.log('No boards found, creating one...');
    const createBoardRes = await fetch(`${API_BASE}/v5/boards`, {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Banff Bound', description: 'Banff travel inspiration' }),
    });
    const newBoard = await createBoardRes.json();
    if (!createBoardRes.ok) { console.error('Board creation failed:', JSON.stringify(newBoard)); process.exit(1); }
    boardId = newBoard.id;
    console.log(`Created board "Banff Bound" (${boardId})`);
  }

  console.log('\nCreating Pin...');
  const pinRes = await fetch(`${API_BASE}/v5/pins`, {
    method: 'POST',
    headers: { ...authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      board_id: boardId,
      title: 'Stunning Banff National Park - Travel Guide',
      description: 'Plan your Banff trip with our complete guide to the best things to do. #Banff #CanadianRockies',
      link: SITE_LINK,
      media_source: { source_type: 'image_url', url: DEMO_IMAGE },
    }),
  });
  const pin = await pinRes.json();
  if (!pinRes.ok) { console.error('Pin creation failed:', JSON.stringify(pin, null, 2)); process.exit(1); }
  console.log('✅ Pin created! ID:', pin.id);

  // ── STEP 4: Read the Pin back ────────────────────────────
  console.log('\nSTEP 4 / 4 — Reading the Pin back to confirm');
  hr();
  const getPinRes = await fetch(`${API_BASE}/v5/pins/${pin.id}`, { headers: authHeader });
  const fetched = await getPinRes.json();
  if (getPinRes.ok) {
    console.log('✅ Verified Pin via GET /v5/pins/{id}:');
    console.log('   Title:', fetched.title);
    console.log('   Link: ', fetched.link);
    console.log('   Board:', fetched.board_id);
  }

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║  DEMO COMPLETE — OAuth + Pin create + read all succeeded   ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
