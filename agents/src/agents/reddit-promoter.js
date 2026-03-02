import { google } from 'googleapis';
import { getOAuth2Client } from '../core/google-auth.js';
import { createLogger } from '../core/logger.js';
import { sendSlack, slackHeader, slackSection, slackDivider } from '../core/slack.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const log = createLogger('reddit-promoter');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'reddit-history.json');
const SITE_URL = process.env.SITE_URL || 'https://banffbound.com';
const SC_URL = process.env.SEARCH_CONSOLE_SITE_URL || SITE_URL;

const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
const REDDIT_USERNAME = process.env.REDDIT_USERNAME;
const REDDIT_PASSWORD = process.env.REDDIT_PASSWORD;

const SUBREDDITS = [
  { name: 'banff', flair: null, selfPostOnly: true },
  { name: 'hiking', flair: null, selfPostOnly: true },
  { name: 'TravelAlberta', flair: null, selfPostOnly: false },
  { name: 'canadianrockies', flair: null, selfPostOnly: false },
  { name: 'roadtrip', flair: null, selfPostOnly: true },
  { name: 'camping', flair: null, selfPostOnly: true },
  { name: 'travel', flair: null, selfPostOnly: true },
];

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadHistory() {
  ensureDataDir();
  if (fs.existsSync(HISTORY_FILE)) return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
  return { posts: [], lastSubredditIndex: -1 };
}

function saveHistory(data) {
  ensureDataDir();
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(data, null, 2));
}

// ── Reddit OAuth ──────────────────────────────────────────
async function getRedditToken() {
  const res = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'BanffBound/1.0',
    },
    body: `grant_type=password&username=${encodeURIComponent(REDDIT_USERNAME)}&password=${encodeURIComponent(REDDIT_PASSWORD)}`,
  });

  if (!res.ok) throw new Error(`Reddit auth failed: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(`Reddit auth error: ${data.error}`);
  return data.access_token;
}

// ── Post to Reddit ────────────────────────────────────────
async function postToReddit(token, subreddit, title, text) {
  const res = await fetch('https://oauth.reddit.com/api/submit', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'BanffBound/1.0',
    },
    body: new URLSearchParams({
      sr: subreddit,
      kind: 'self',
      title,
      text,
      resubmit: 'true',
    }),
  });

  if (!res.ok) throw new Error(`Reddit post failed: ${res.status}`);
  const data = await res.json();

  if (data.json?.errors?.length > 0) {
    throw new Error(`Reddit error: ${JSON.stringify(data.json.errors)}`);
  }

  const postUrl = data.json?.data?.url || 'unknown';
  return postUrl;
}

// ── Find best content from Search Console ─────────────────
async function findBestContent() {
  const auth = getOAuth2Client();
  const searchconsole = google.searchconsole({ version: 'v1', auth });

  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

  const res = await searchconsole.searchanalytics.query({
    siteUrl: SC_URL,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['page'],
      rowLimit: 50,
      type: 'web',
    },
  });

  const rows = res.data.rows || [];

  // Filter to blog posts and trail guides only (shareable content)
  const shareable = rows.filter(r => {
    const page = r.keys[0];
    return page.includes('/blog/') ||
           page.includes('/trails/') ||
           page.includes('/trail-map') ||
           page.includes('/activities/') ||
           page.includes('/skiing') ||
           page.includes('/eat-and-drink');
  });

  // Sort by impressions (most visibility = most interest)
  shareable.sort((a, b) => b.impressions - a.impressions);

  return shareable.map(r => ({
    url: r.keys[0],
    path: r.keys[0].replace(SITE_URL, '').replace(SC_URL, ''),
    impressions: r.impressions,
    clicks: r.clicks,
    position: r.position,
  }));
}

// ── Generate Reddit-style post text ───────────────────────
function generateRedditPost(page, subreddit) {
  const pagePath = page.path;
  const fullUrl = `${SITE_URL}${pagePath}`;

  // Extract a readable topic from the path
  const topic = pagePath
    .replace(/^\/blog\/|^\/trails\/|^\/activities\/|^\//g, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  // Tailor the post to the subreddit
  let intro = '';
  if (subreddit === 'banff') {
    intro = `Hey r/banff! I put together a detailed guide on ${topic.toLowerCase()} that I thought might be helpful for anyone planning a visit.`;
  } else if (subreddit === 'hiking') {
    intro = `Just finished writing up a comprehensive guide about ${topic.toLowerCase()} in Banff National Park, Canadian Rockies.`;
  } else if (subreddit === 'TravelAlberta' || subreddit === 'canadianrockies') {
    intro = `Sharing a guide on ${topic.toLowerCase()} for anyone exploring the Canadian Rockies.`;
  } else if (subreddit === 'roadtrip') {
    intro = `If you're planning a road trip through the Canadian Rockies, here's a guide on ${topic.toLowerCase()} in Banff that might help.`;
  } else {
    intro = `I wrote a guide about ${topic.toLowerCase()} in Banff, Canada that I thought travelers might find useful.`;
  }

  const body = `${intro}\n\nCovers practical details like current prices, tips from locals, and things most guides miss.\n\nFull guide: ${fullUrl}\n\nHappy to answer any questions about visiting Banff!`;

  const title = pagePath.includes('/trails/')
    ? `Guide: ${topic} - Banff National Park Trail Guide`
    : pagePath.includes('/blog/')
    ? `${topic} - Banff Travel Guide`
    : `${topic} - Banff, Canadian Rockies`;

  return { title: title.slice(0, 300), body };
}

// ── Main ──────────────────────────────────────────────────
export async function run() {
  log.info('Reddit Content Promoter starting...');

  if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET || !REDDIT_USERNAME || !REDDIT_PASSWORD) {
    log.warn('Reddit credentials not configured -- sending preview to Slack only');

    const pages = await findBestContent();
    if (pages.length === 0) {
      log.info('No shareable content found');
      return { posted: 0 };
    }

    const history = loadHistory();
    const sharedUrls = new Set(history.posts.map(p => p.pageUrl));

    // Find first unshared page
    const page = pages.find(p => !sharedUrls.has(p.url));
    if (!page) {
      log.info('All top content already shared');
      return { posted: 0 };
    }

    // Pick next subreddit in rotation
    const subIndex = (history.lastSubredditIndex + 1) % SUBREDDITS.length;
    const sub = SUBREDDITS[subIndex];
    const { title, body } = generateRedditPost(page, sub.name);

    await sendSlack([
      slackHeader('Reddit Promoter -- Preview (No Credentials)'),
      slackSection(
        `:pencil: *Would post to r/${sub.name}:*\n` +
        `*Title:* ${title}\n\n` +
        `*Body:*\n${body}\n\n` +
        `_Set REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD in .env to enable auto-posting._`
      ),
    ], 'Reddit Promoter Preview');

    return { posted: 0, preview: true };
  }

  // Full run with Reddit API
  const token = await getRedditToken();
  log.info('Reddit authenticated');

  const pages = await findBestContent();
  if (pages.length === 0) {
    log.info('No shareable content found');
    return { posted: 0 };
  }

  const history = loadHistory();
  const sharedUrls = new Set(history.posts.map(p => p.pageUrl));

  // Find first unshared page
  const page = pages.find(p => !sharedUrls.has(p.url));
  if (!page) {
    log.info('All top content already shared');
    await sendSlack(
      [slackSection(':white_check_mark: Reddit Promoter: all top content already shared. Waiting for new posts.')],
      'Reddit Promoter'
    );
    return { posted: 0 };
  }

  // Pick next subreddit in rotation
  const subIndex = (history.lastSubredditIndex + 1) % SUBREDDITS.length;
  const sub = SUBREDDITS[subIndex];

  const { title, body } = generateRedditPost(page, sub.name);

  try {
    const postUrl = await postToReddit(token, sub.name, title, body);
    log.info(`Posted to r/${sub.name}: ${postUrl}`);

    // Save to history
    history.posts.push({
      date: new Date().toISOString(),
      subreddit: sub.name,
      pageUrl: page.url,
      redditUrl: postUrl,
      title,
    });
    history.lastSubredditIndex = subIndex;
    saveHistory(history);

    await sendSlack([
      slackHeader('Reddit Content Shared'),
      slackSection(
        `:mega: Posted to *r/${sub.name}*\n` +
        `*Title:* ${title}\n` +
        `*Page:* ${page.path} (${page.impressions} impressions last 7d)\n` +
        `*Reddit:* ${postUrl}`
      ),
    ], 'Reddit post published');

    return { posted: 1, subreddit: sub.name, url: postUrl };
  } catch (err) {
    log.error(`Reddit post failed: ${err.message}`);
    await sendSlack(
      [slackSection(`:x: Reddit Promoter failed: ${err.message}`)],
      'Reddit Promoter Error'
    );
    return { posted: 0, error: err.message };
  }
}
