import puppeteer from 'puppeteer';
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

const PINTEREST_EMAIL = process.env.PINTEREST_EMAIL;
const PINTEREST_PASSWORD = process.env.PINTEREST_PASSWORD;
const PINTEREST_BOARD_NAME = process.env.PINTEREST_BOARD_NAME || 'Banff Bound';

const PINS_PER_RUN = 3;

// ── Keywords → page mapping for matching photos to site pages ──
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

// ── Get Reddit OAuth token ────────────────────────────────
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

// ── Fetch trending photos from Reddit ─────────────────────
async function fetchRedditPhotos() {
  const subreddits = ['banff', 'EarthPorn', 'canadianrockies'];
  const photos = [];
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

        const url = d.url || '';
        const isImage = /\.(jpg|jpeg|png|webp)(\?|$)/i.test(url) ||
                        url.includes('i.redd.it') ||
                        url.includes('i.imgur.com');
        if (!isImage) continue;

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

  photos.sort((a, b) => b.score - a.score);
  return photos;
}

// ── Fallback: fetch Banff photos from Unsplash ────────────
async function fetchUnsplashPhotos() {
  const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;
  if (!UNSPLASH_KEY) {
    log.warn('No UNSPLASH_ACCESS_KEY set, cannot use Unsplash fallback');
    return [];
  }

  const queries = ['banff national park', 'canadian rockies landscape', 'lake louise canada', 'moraine lake banff', 'banff mountains'];
  const query = queries[Math.floor(Math.random() * queries.length)];

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=30&orientation=portrait&order_by=relevant`,
      { headers: { 'Authorization': `Client-ID ${UNSPLASH_KEY}` } }
    );

    if (!res.ok) {
      log.warn(`Unsplash search failed: ${res.status}`);
      return [];
    }

    const data = await res.json();
    return (data.results || []).map(photo => ({
      id: `unsplash-${photo.id}`,
      title: photo.description || photo.alt_description || query,
      imageUrl: photo.urls.regular,
      score: photo.likes || 0,
      subreddit: 'unsplash',
      permalink: photo.links.html,
      author: photo.user.name,
    }));
  } catch (err) {
    log.error(`Unsplash error: ${err.message}`);
    return [];
  }
}

// ── Match a photo to a relevant site page ─────────────────
function matchToPage(title) {
  const titleLower = title.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;

  for (const page of PAGE_KEYWORDS) {
    let score = 0;
    for (const kw of page.keywords) {
      if (titleLower.includes(kw)) {
        score += kw.split(' ').length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = page;
    }
  }

  if (!bestMatch || bestScore === 0) {
    bestMatch = { path: '/blog/best-things-to-do-in-banff-2026', title: 'Best Things to Do in Banff' };
  }

  return bestMatch;
}

// ── Generate pin description ──────────────────────────────
function generatePinDescription(photoTitle, page) {
  const hashtags = '#Banff #CanadianRockies #BanffNationalPark #Alberta #TravelCanada #ExploreAlberta';
  const cta = `Read our full guide: ${SITE_URL}${page.path}`;
  const cleanTitle = photoTitle
    .replace(/\[OC\]/gi, '')
    .replace(/\[\d+x\d+\]/g, '')
    .replace(/\(OC\)/gi, '')
    .trim();

  return `${cleanTitle}\n\n${cta}\n\n${hashtags}`;
}

// ── Generate pin title (max 100 chars) ────────────────────
function generatePinTitle(photoTitle) {
  const clean = photoTitle
    .replace(/\[OC\]/gi, '')
    .replace(/\[\d+x\d+\]/g, '')
    .replace(/\(OC\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (clean.length <= 100) return clean;
  return clean.substring(0, 97) + '...';
}

// ── Pinterest browser automation ──────────────────────────
async function loginToPinterest(browser) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36');

  log.info('Navigating to Pinterest login...');
  await page.goto('https://www.pinterest.com/login/', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // Fill email
  const emailInput = await page.$('input[name="id"], input[type="email"], input#email');
  if (!emailInput) throw new Error('Could not find email input on login page');
  await emailInput.click({ clickCount: 3 });
  await emailInput.type(PINTEREST_EMAIL, { delay: 50 });

  // Fill password
  const passInput = await page.$('input[name="password"], input[type="password"]');
  if (!passInput) throw new Error('Could not find password input on login page');
  await passInput.click({ clickCount: 3 });
  await passInput.type(PINTEREST_PASSWORD, { delay: 50 });

  // Submit
  const loginBtn = await page.$('button[type="submit"], div[data-test-id="registerFormSubmitButton"]');
  if (loginBtn) {
    await loginBtn.click();
  } else {
    await passInput.press('Enter');
  }

  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 3000));

  // Verify logged in
  const url = page.url();
  if (url.includes('/login')) {
    throw new Error('Login failed - still on login page. Check credentials.');
  }

  log.info('Successfully logged into Pinterest');
  await page.close();
  return true;
}

async function createPinViaBrowser(browser, { imageUrl, title, description, linkUrl, boardName }) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36');

  try {
    log.info(`Creating pin: "${title.substring(0, 50)}..."`);
    await page.goto('https://www.pinterest.com/pin-creation-tool/', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));

    // Click "Save from site" or use the URL upload option
    // Pinterest's pin creation allows importing from URL
    const saveFromSiteBtn = await page.$('[data-test-id="scrape-from-url"], button:has-text("Save from site")');
    if (saveFromSiteBtn) {
      await saveFromSiteBtn.click();
      await new Promise(r => setTimeout(r, 1000));
    }

    // Try to use the "Save from URL" input for the image
    // First check if there's a URL input for media
    const urlInput = await page.$('input[placeholder*="URL"], input[placeholder*="url"], input[data-test-id="scrape-url-input"]');
    if (urlInput) {
      await urlInput.click({ clickCount: 3 });
      await urlInput.type(imageUrl, { delay: 30 });
      await new Promise(r => setTimeout(r, 1000));

      // Submit the URL
      const submitUrlBtn = await page.$('[data-test-id="board-picker-save-button"], button[type="submit"]');
      if (submitUrlBtn) await submitUrlBtn.click();
      await new Promise(r => setTimeout(r, 3000));
    } else {
      // Direct image URL approach: download and upload
      // Download the image to a temp file
      const tmpDir = path.join(DATA_DIR, 'pinterest-tmp');
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
      const tmpFile = path.join(tmpDir, `pin-${Date.now()}.jpg`);

      const imgRes = await fetch(imageUrl);
      if (!imgRes.ok) throw new Error(`Failed to download image: ${imgRes.status}`);
      const buffer = Buffer.from(await imgRes.arrayBuffer());
      fs.writeFileSync(tmpFile, buffer);

      // Find file upload input
      const fileInput = await page.$('input[type="file"]');
      if (!fileInput) throw new Error('Could not find file upload input');
      await fileInput.uploadFile(tmpFile);
      await new Promise(r => setTimeout(r, 4000));

      // Cleanup temp file
      fs.unlinkSync(tmpFile);
    }

    // Fill in title
    const titleInput = await page.$('[data-test-id="pin-draft-title"] textarea, [data-test-id="pin-draft-title"] input, textarea[placeholder*="title" i], input[placeholder*="title" i]');
    if (titleInput) {
      await titleInput.click({ clickCount: 3 });
      await titleInput.type(title.slice(0, 100), { delay: 20 });
    }

    // Fill in description
    const descInput = await page.$('[data-test-id="pin-draft-description"] textarea, textarea[placeholder*="description" i], [data-test-id="pin-draft-description-field"] textarea');
    if (descInput) {
      await descInput.click({ clickCount: 3 });
      await descInput.type(description.slice(0, 500), { delay: 10 });
    }

    // Fill in link
    const linkInput = await page.$('[data-test-id="pin-draft-link"] input, input[placeholder*="link" i], input[placeholder*="url" i][name*="link"]');
    if (linkInput) {
      await linkInput.click({ clickCount: 3 });
      await linkInput.type(linkUrl, { delay: 20 });
    }

    // Select board
    const boardSelector = await page.$('[data-test-id="board-dropdown-select-button"], [data-test-id="board-picker-dropdown"]');
    if (boardSelector) {
      await boardSelector.click();
      await new Promise(r => setTimeout(r, 1500));

      // Search for board name
      const boardSearchInput = await page.$('[data-test-id="board-picker-filter"] input, input[placeholder*="Search" i]');
      if (boardSearchInput) {
        await boardSearchInput.type(boardName, { delay: 30 });
        await new Promise(r => setTimeout(r, 1500));
      }

      // Click the first matching board
      const boardOption = await page.$('[data-test-id="board-row"]');
      if (boardOption) await boardOption.click();
      await new Promise(r => setTimeout(r, 1000));
    }

    // Publish the pin
    const publishBtn = await page.$('[data-test-id="board-picker-save-button"], [data-test-id="create-pin-submit-button"], button:has-text("Publish")');
    if (publishBtn) {
      await publishBtn.click();
      await new Promise(r => setTimeout(r, 4000));
      log.info(`Pin created: "${title.substring(0, 50)}..."`);
      return { success: true };
    }

    // Fallback: try any prominent button
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && (text.includes('Publish') || text.includes('Save') || text.includes('Create'))) {
        await btn.click();
        await new Promise(r => setTimeout(r, 4000));
        log.info(`Pin created via fallback button: "${title.substring(0, 50)}..."`);
        return { success: true };
      }
    }

    throw new Error('Could not find publish/save button');
  } catch (err) {
    // Take screenshot for debugging
    const screenshotPath = path.join(DATA_DIR, `pinterest-error-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
    log.error(`Pin creation failed: ${err.message}. Screenshot saved: ${screenshotPath}`);
    throw err;
  } finally {
    await page.close();
  }
}

// ── Main ──────────────────────────────────────────────────
export async function run() {
  log.info('Pinterest Poster starting...');

  if (!PINTEREST_EMAIL || !PINTEREST_PASSWORD) {
    log.warn('PINTEREST_EMAIL and PINTEREST_PASSWORD not set. Running in preview mode.');
  }

  const history = loadHistory();
  const postedIds = new Set(history.pins.map(p => p.redditId));

  // Fetch photos (Reddit first, Unsplash fallback)
  let photos = await fetchRedditPhotos();
  log.info(`Found ${photos.length} candidate photos from Reddit`);

  if (photos.length === 0) {
    log.info('Reddit unavailable, trying Unsplash fallback...');
    photos = await fetchUnsplashPhotos();
    log.info(`Found ${photos.length} photos from Unsplash`);
  }

  if (photos.length === 0) {
    log.warn('No photos from any source, skipping run');
    return;
  }

  // Filter out already-posted and select candidates
  const candidates = photos
    .filter(p => !postedIds.has(p.id))
    .slice(0, PINS_PER_RUN);

  if (candidates.length === 0) {
    log.info('All top photos already posted, nothing to do');
    return;
  }

  // Prepare pins
  const pinData = candidates.map(photo => {
    const page = matchToPage(photo.title);
    return {
      photo,
      page,
      title: generatePinTitle(photo.title),
      description: generatePinDescription(photo.title, page),
      linkUrl: `${SITE_URL}${page.path}?utm_source=pinterest&utm_medium=social&utm_campaign=auto-pin`,
    };
  });

  const results = [];

  if (!PINTEREST_EMAIL || !PINTEREST_PASSWORD) {
    // Preview mode
    for (const pin of pinData) {
      log.info(`[PREVIEW] Would pin: "${pin.title}"`);
      log.info(`  Image: ${pin.photo.imageUrl}`);
      log.info(`  Link: ${pin.linkUrl}`);
      results.push({
        redditId: pin.photo.id,
        title: pin.title,
        imageUrl: pin.photo.imageUrl,
        linkUrl: pin.linkUrl,
        pagePath: pin.page.path,
        pageTitle: pin.page.title,
        redditScore: pin.photo.score,
        subreddit: pin.photo.subreddit,
        dryRun: true,
        postedAt: new Date().toISOString(),
      });
    }
  } else {
    // Live mode: use Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
    });

    try {
      await loginToPinterest(browser);

      for (const pin of pinData) {
        try {
          await createPinViaBrowser(browser, {
            imageUrl: pin.photo.imageUrl,
            title: pin.title,
            description: pin.description,
            linkUrl: pin.linkUrl,
            boardName: PINTEREST_BOARD_NAME,
          });

          results.push({
            redditId: pin.photo.id,
            title: pin.title,
            imageUrl: pin.photo.imageUrl,
            linkUrl: pin.linkUrl,
            pagePath: pin.page.path,
            pageTitle: pin.page.title,
            redditScore: pin.photo.score,
            subreddit: pin.photo.subreddit,
            dryRun: false,
            postedAt: new Date().toISOString(),
          });

          // Wait between pins to avoid rate limits
          await new Promise(r => setTimeout(r, 5000));
        } catch (err) {
          log.error(`Failed to pin "${pin.title}": ${err.message}`);
          results.push({
            redditId: pin.photo.id,
            title: pin.title,
            error: err.message,
            postedAt: new Date().toISOString(),
          });
        }
      }
    } finally {
      await browser.close();
    }
  }

  // Save history
  history.pins.push(...results.filter(r => !r.error));
  history.lastRun = new Date().toISOString();
  if (history.pins.length > 500) history.pins = history.pins.slice(-500);
  saveHistory(history);

  // Slack summary
  const successful = results.filter(r => !r.error);
  const dryRuns = results.filter(r => r.dryRun);
  const errors = results.filter(r => r.error);

  const modeLabel = dryRuns.length > 0 ? ' (PREVIEW - set PINTEREST_EMAIL/PASSWORD to go live)' : '';
  const blocks = [
    slackHeader(`Pinterest Poster${modeLabel}`),
    slackSection(
      `*${successful.length} pins${dryRuns.length ? ' queued' : ' published'}*${errors.length ? ` | ${errors.length} failed` : ''}\n\n` +
      successful.map(r =>
        `• *${r.title}*\n  → ${r.pageTitle} (${r.subreddit}, ${r.redditScore} upvotes)`
      ).join('\n\n')
    ),
  ];

  if (errors.length > 0) {
    blocks.push(slackDivider());
    blocks.push(slackSection('*Errors:*\n' + errors.map(e => `• ${e.title}: ${e.error}`).join('\n')));
  }

  if (dryRuns.length > 0) {
    blocks.push(slackDivider());
    blocks.push(slackSection('_Set PINTEREST_EMAIL and PINTEREST_PASSWORD in .env to enable live posting via browser automation._'));
  }

  await sendSlack(blocks, `Pinterest: ${successful.length} pins ${dryRuns.length ? 'queued' : 'published'}`);
  log.info(`Pinterest Poster complete. ${successful.length} pins processed.`);
}
