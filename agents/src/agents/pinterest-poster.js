import { createLogger } from '../core/logger.js';
import { sendSlack, slackHeader, slackSection, slackDivider } from '../core/slack.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const log = createLogger('pinterest-poster');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'pinterest-history.json');
const SITE_URL = process.env.SITE_URL || 'https://banffbound.com';

const PINTEREST_ACCESS_TOKEN = process.env.PINTEREST_ACCESS_TOKEN;
const PINTEREST_BOARD_ID = process.env.PINTEREST_BOARD_ID;

const PINS_PER_RUN = 3;

// ── Keywords → page mapping for matching Reddit content to our pages ──
const PAGE_KEYWORDS = [
  { keywords: ['gondola', 'sulphur', 'banff gondola', 'mountain top'], path: '/blog/banff-gondola-tickets-guide', title: 'Banff Gondola Guide' },
  { keywords: ['lake louise', 'lake agnes', 'fairview', 'plain of six'], path: '/blog/lake-agnes-tea-house', title: 'Lake Agnes Tea House Hike' },
  { keywords: ['moraine lake', 'moraine', 'valley of ten peaks', 'ten peaks'], path: '/blog/moraine-lake-guide', title: 'Moraine Lake Guide' },
  { keywords: ['johnston canyon', 'johnston', 'ink pots', 'inkpots'], path: '/blog/johnston-canyon-guide', title: 'Johnston Canyon Guide' },
  { keywords: ['icefields', 'parkway', 'columbia icefield', 'glacier skywalk'], path: '/blog/icefields-parkway-guide', title: 'Icefields Parkway Guide' },
  { keywords: ['emerald lake', 'emerald'], path: '/blog/emerald-lake-lodge-review', title: 'Emerald Lake Lodge' },
  { keywords: ['camping', 'campground', 'tunnel mountain', 'two jack'], path: '/camping', title: 'Banff Camping Guide' },
  { keywords: ['bear', 'grizzly', 'bear spray', 'wildlife', 'elk', 'moose'], path: '/bear-spray', title: 'Bear Safety Guide' },
  { keywords: ['ski', 'skiing', 'snowboard', 'sunshine village', 'lake louise ski', 'norquay'], path: '/blog/banff-ski-fields', title: 'Banff Ski Guide' },
  { keywords: ['trail', 'hike', 'hiking', 'scramble', 'backpack'], path: '/trail-map', title: 'Banff Trail Map' },
  { keywords: ['restaurant', 'food', 'eat', 'dining', 'brunch', 'cafe'], path: '/blog/best-banff-restaurants-where-to-eat', title: 'Banff Restaurant Guide' },
  { keywords: ['hotel', 'stay', 'accommodation', 'lodge', 'hostel'], path: '/hotels', title: 'Where to Stay in Banff' },
  { keywords: ['sunset', 'sunrise', 'vermilion', 'golden hour'], path: '/blog/banff-sunset-spots', title: 'Best Sunset Spots in Banff' },
  { keywords: ['ice cream', 'cows', 'sweet', 'gelato'], path: '/blog/banff-ice-cream-guide', title: 'Banff Ice Cream Guide' },
  { keywords: ['drive', 'scenic', 'road', 'bow valley parkway'], path: '/scenic-drives', title: 'Scenic Drives in Banff' },
  { keywords: ['canmore', 'three sisters', 'ha ling'], path: '/blog/canmore-guide', title: 'Canmore Guide' },
  { keywords: ['park pass', 'parks canada', 'entry fee', 'discovery pass'], path: '/park-pass', title: 'Banff Park Pass Guide' },
  { keywords: ['shuttle', 'bus', 'roam', 'transport', 'parking'], path: '/shuttle-reservations', title: 'Banff Shuttle Guide' },
  { keywords: ['weather', 'temperature', 'forecast', 'snow', 'rain'], path: '/monthly-weather', title: 'Banff Monthly Weather' },
  { keywords: ['nightlife', 'bar', 'pub', 'drinks', 'night'], path: '/blog/banff-nightlife-guide', title: 'Banff Nightlife Guide' },
  { keywords: ['hot spring', 'upper hot springs', 'soak'], path: '/blog/banff-hot-springs-guide', title: 'Banff Hot Springs' },
  { keywords: ['waterfall', 'bow falls', 'falls'], path: '/blog/banff-waterfalls', title: 'Banff Waterfalls' },
  { keywords: ['budget', 'cheap', 'cost', 'save money', 'free'], path: '/blog/banff-budget-tips', title: 'Banff Budget Travel Guide' },
  { keywords: ['winter', 'cold', 'frozen', 'ice walk', 'december', 'january', 'february'], path: '/blog/banff-winter-guide', title: 'Banff Winter Guide' },
  { keywords: ['summer', 'july', 'august', 'hot', 'swim'], path: '/blog/banff-summer-guide', title: 'Banff Summer Guide' },
  { keywords: ['peyto lake', 'peyto', 'bow lake'], path: '/blog/peyto-lake-guide', title: 'Peyto Lake Guide' },
  { keywords: ['banff', 'town', 'downtown', 'avenue'], path: '/blog/best-things-to-do-in-banff-2026', title: 'Best Things to Do in Banff' },
];

// ── Data persistence ──────────────────────────────────────
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadHistory() {
  ensureDataDir();
  if (fs.existsSync(HISTORY_FILE)) return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
  return { pins: [], lastRun: null };
}

function saveHistory(data) {
  ensureDataDir();
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(data, null, 2));
}

// ── Get Reddit OAuth token (reuse existing creds from reddit-promoter) ──
async function getRedditToken() {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const username = process.env.REDDIT_USERNAME;
  const password = process.env.REDDIT_PASSWORD;

  if (!clientId || !clientSecret || !username || !password) return null;

  const res = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'BanffBound-Pinterest/1.0 (by /u/' + username + ')',
    },
    body: `grant_type=password&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.access_token || null;
}

// ── Fetch trending photos from r/banff ────────────────────
async function fetchRedditPhotos() {
  const subreddits = ['banff', 'EarthPorn', 'canadianrockies'];
  const photos = [];

  // Try authenticated Reddit API first, fall back to old.reddit.com
  const token = await getRedditToken();

  for (const sub of subreddits) {
    try {
      let res;
      if (token) {
        res = await fetch(`https://oauth.reddit.com/r/${sub}/hot?limit=50`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'BanffBound-Pinterest/1.0 (by /u/' + (process.env.REDDIT_USERNAME || 'bot') + ')',
          },
        });
      } else {
        // old.reddit.com still allows unauthenticated JSON access
        res = await fetch(`https://old.reddit.com/r/${sub}/hot.json?limit=50&raw_json=1`, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36' },
        });
      }

      if (!res.ok) {
        log.warn(`Failed to fetch r/${sub}: ${res.status}`);
        continue;
      }

      const data = await res.json();
      const posts = data.data?.children || [];

      for (const post of posts) {
        const d = post.data;
        if (d.over_18 || d.is_video || d.removed_by_category) continue;

        // Must have an image URL (i.redd.it or imgur)
        const url = d.url || '';
        const isImage = /\.(jpg|jpeg|png|webp)(\?|$)/i.test(url) ||
                        url.includes('i.redd.it') ||
                        url.includes('i.imgur.com');
        if (!isImage) continue;

        // For EarthPorn, only keep Banff/Rockies content
        if (sub === 'EarthPorn') {
          const titleLower = d.title.toLowerCase();
          if (!titleLower.includes('banff') && !titleLower.includes('rocky') &&
              !titleLower.includes('alberta') && !titleLower.includes('canadian rock') &&
              !titleLower.includes('lake louise') && !titleLower.includes('moraine') &&
              !titleLower.includes('jasper') && !titleLower.includes('canmore')) {
            continue;
          }
        }

        photos.push({
          id: d.id,
          title: d.title,
          imageUrl: url,
          score: d.score,
          subreddit: sub,
          permalink: `https://reddit.com${d.permalink}`,
          author: d.author,
        });
      }
    } catch (err) {
      log.error(`Error fetching r/${sub}: ${err.message}`);
    }
  }

  // Sort by score (most upvoted = most viral potential)
  photos.sort((a, b) => b.score - a.score);
  return photos;
}

// ── Match a Reddit photo to a relevant site page ──────────
function matchToPage(redditTitle) {
  const titleLower = redditTitle.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;

  for (const page of PAGE_KEYWORDS) {
    let score = 0;
    for (const kw of page.keywords) {
      if (titleLower.includes(kw)) {
        score += kw.split(' ').length; // Multi-word matches score higher
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = page;
    }
  }

  // Fall back to generic "things to do" page if no good match
  if (!bestMatch || bestScore === 0) {
    bestMatch = { path: '/blog/best-things-to-do-in-banff-2026', title: 'Best Things to Do in Banff' };
  }

  return bestMatch;
}

// ── Generate pin description ──────────────────────────────
function generatePinDescription(redditTitle, page) {
  const hashtags = '#Banff #CanadianRockies #BanffNationalPark #Alberta #TravelCanada #ExploreAlberta';
  const cta = `Read our full guide: ${SITE_URL}${page.path}`;
  const cleanTitle = redditTitle
    .replace(/\[OC\]/gi, '')
    .replace(/\[\d+x\d+\]/g, '')
    .replace(/\(OC\)/gi, '')
    .trim();

  return `${cleanTitle}\n\n${cta}\n\n${hashtags}`;
}

// ── Generate pin title (Pinterest max 100 chars) ──────────
function generatePinTitle(redditTitle, page) {
  const clean = redditTitle
    .replace(/\[OC\]/gi, '')
    .replace(/\[\d+x\d+\]/g, '')
    .replace(/\(OC\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (clean.length <= 100) return clean;
  return clean.substring(0, 97) + '...';
}

// ── Create a pin via Pinterest API ────────────────────────
async function createPin(imageUrl, title, description, linkUrl, boardId) {
  const res = await fetch('https://api.pinterest.com/v5/pins', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PINTEREST_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      board_id: boardId,
      title: title.slice(0, 100),
      description: description.slice(0, 500),
      link: linkUrl,
      media_source: {
        source_type: 'image_url',
        url: imageUrl,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Pinterest API error ${res.status}: ${body}`);
  }

  return await res.json();
}

// ── Main ──────────────────────────────────────────────────
export async function run() {
  log.info('Pinterest Poster starting...');

  const history = loadHistory();
  const postedIds = new Set(history.pins.map(p => p.redditId));

  // Fetch trending photos
  const photos = await fetchRedditPhotos();
  log.info(`Found ${photos.length} candidate photos from Reddit`);

  if (photos.length === 0) {
    log.warn('No photos found, skipping run');
    return;
  }

  // Filter out already-posted and select top candidates
  const candidates = photos
    .filter(p => !postedIds.has(p.id))
    .slice(0, PINS_PER_RUN);

  if (candidates.length === 0) {
    log.info('All top photos already posted, nothing to do');
    return;
  }

  const results = [];

  for (const photo of candidates) {
    const page = matchToPage(photo.title);
    const pinTitle = generatePinTitle(photo.title, page);
    const pinDescription = generatePinDescription(photo.title, page);
    const linkUrl = `${SITE_URL}${page.path}?utm_source=pinterest&utm_medium=social&utm_campaign=auto-pin`;

    if (!PINTEREST_ACCESS_TOKEN || !PINTEREST_BOARD_ID) {
      // Dry-run mode: log what would be posted
      log.info(`[DRY RUN] Would pin: "${pinTitle}"`);
      log.info(`  Image: ${photo.imageUrl}`);
      log.info(`  Link: ${linkUrl}`);
      log.info(`  Board: ${PINTEREST_BOARD_ID || 'NOT SET'}`);

      results.push({
        redditId: photo.id,
        title: pinTitle,
        imageUrl: photo.imageUrl,
        linkUrl,
        pagePath: page.path,
        pageTitle: page.title,
        redditScore: photo.score,
        subreddit: photo.subreddit,
        pinId: null,
        dryRun: true,
        postedAt: new Date().toISOString(),
      });
      continue;
    }

    try {
      const pin = await createPin(photo.imageUrl, pinTitle, pinDescription, linkUrl, PINTEREST_BOARD_ID);
      log.info(`Pinned: "${pinTitle}" → ${pin.id}`);

      results.push({
        redditId: photo.id,
        title: pinTitle,
        imageUrl: photo.imageUrl,
        linkUrl,
        pagePath: page.path,
        pageTitle: page.title,
        redditScore: photo.score,
        subreddit: photo.subreddit,
        pinId: pin.id,
        dryRun: false,
        postedAt: new Date().toISOString(),
      });

      // Rate limit: wait 2s between pins
      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      log.error(`Failed to pin "${pinTitle}": ${err.message}`);
      results.push({
        redditId: photo.id,
        title: pinTitle,
        error: err.message,
        postedAt: new Date().toISOString(),
      });
    }
  }

  // Save history
  history.pins.push(...results.filter(r => !r.error));
  history.lastRun = new Date().toISOString();
  // Keep last 500 entries
  if (history.pins.length > 500) history.pins = history.pins.slice(-500);
  saveHistory(history);

  // Slack summary
  const successful = results.filter(r => !r.error);
  const dryRuns = results.filter(r => r.dryRun);
  const errors = results.filter(r => r.error);

  const modeLabel = dryRuns.length > 0 ? ' (DRY RUN - no API keys)' : '';
  const blocks = [
    slackHeader(`Pinterest Poster${modeLabel}`),
    slackSection(
      `*${successful.length} pins${dryRuns.length ? ' queued' : ' created'}*${errors.length ? ` | ${errors.length} failed` : ''}\n\n` +
      successful.map(r =>
        `• *${r.title}*\n  → ${r.pageTitle} (r/${r.subreddit}, ${r.redditScore} upvotes)${r.pinId ? `\n  Pin: https://pinterest.com/pin/${r.pinId}` : ''}`
      ).join('\n\n')
    ),
  ];

  if (errors.length > 0) {
    blocks.push(slackDivider());
    blocks.push(slackSection('*Errors:*\n' + errors.map(e => `• ${e.title}: ${e.error}`).join('\n')));
  }

  if (dryRuns.length > 0) {
    blocks.push(slackDivider());
    blocks.push(slackSection('_Set PINTEREST_ACCESS_TOKEN and PINTEREST_BOARD_ID in .env to enable live posting._'));
  }

  await sendSlack(blocks, `Pinterest: ${successful.length} pins ${dryRuns.length ? 'queued' : 'posted'}`);
  log.info(`Pinterest Poster complete. ${successful.length} pins processed.`);
}
