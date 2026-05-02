import { google } from 'googleapis';
import Anthropic from '@anthropic-ai/sdk';
import { getOAuth2Client } from '../core/google-auth.js';
import { createLogger } from '../core/logger.js';
import { sendSlack, slackHeader, slackSection, slackDivider, slackFields } from '../core/slack.js';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const log = createLogger('content-refresher');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORK_DIR = path.join(__dirname, '..', '..', 'data', 'repo-checkout');
const SITE_URL = process.env.SEARCH_CONSOLE_SITE_URL || process.env.SITE_URL;
const GH_TOKEN = process.env.GITHUB_TOKEN;
const GH_REPO = process.env.GITHUB_REPO || 'GlobalBookings/banffbound';
const MAX_REFRESHES = 2;

const EXPEDIA_LINK = 'https://www.expedia.ca/Hotel-Search?destination=Banff%2C+Alberta&camref=1101l3MtWX';
const GYG_LINK = 'https://www.getyourguide.com/banff-l284/?partner_id=QW960HO';

const CONTENT_CHUNKS = ['blogContent1.ts', 'blogContent2.ts', 'blogContent3.ts'];

function getRepoPaths() {
  return {
    root: WORK_DIR,
    blogData: path.join(WORK_DIR, 'src', 'data', 'blogPosts.ts'),
    blogContentFiles: CONTENT_CHUNKS.map(f => path.join(WORK_DIR, 'src', 'data', f)),
  };
}

// ── Clone or pull the repo ─────────────────────────────────
function ensureRepoCheckout() {
  if (!GH_TOKEN) throw new Error('GITHUB_TOKEN not set');

  const repoUrl = `https://x-access-token:${GH_TOKEN}@github.com/${GH_REPO}.git`;

  if (fs.existsSync(path.join(WORK_DIR, '.git'))) {
    log.info('Pulling latest from main...');
    execSync('git fetch origin main && git reset --hard origin/main', { cwd: WORK_DIR, stdio: 'pipe' });
  } else {
    log.info('Cloning repo...');
    fs.mkdirSync(WORK_DIR, { recursive: true });
    execSync(`git clone --depth 1 ${repoUrl} "${WORK_DIR}"`, { stdio: 'pipe' });
  }

  execSync('git config user.email "agent@banffbound.com"', { cwd: WORK_DIR, stdio: 'pipe' });
  execSync('git config user.name "BanffBound Agent"', { cwd: WORK_DIR, stdio: 'pipe' });
}

// ── Query Search Console for two periods ──────────────────
async function fetchSearchConsoleData(startDate, endDate) {
  const auth = getOAuth2Client();
  const searchconsole = google.searchconsole({ version: 'v1', auth });

  const res = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['page'],
      rowLimit: 1000,
      type: 'web',
    },
  });

  return res.data.rows || [];
}

// ── Parse blog post metadata from blogPosts.ts ────────────
function parseBlogMetadata() {
  const { blogData } = getRepoPaths();
  const content = fs.readFileSync(blogData, 'utf8');

  const posts = [];
  const entryRegex = /\{\s*slug:\s*'([^']+)',\s*title:\s*'([^']*(?:\\.[^']*)*)',\s*description:\s*'([^']*(?:\\.[^']*)*)',\s*date:\s*'([^']+)',\s*category:\s*'([^']+)',\s*image:\s*'([^']+)',\s*readTime:\s*'([^']+)',?\s*\}/g;

  let match;
  while ((match = entryRegex.exec(content)) !== null) {
    posts.push({
      slug: match[1],
      title: match[2].replace(/\\'/g, "'"),
      description: match[3].replace(/\\'/g, "'"),
      date: match[4],
      category: match[5],
      image: match[6],
      readTime: match[7],
    });
  }

  return posts;
}

// ── Read HTML content for a slug from blogContent chunk files ──
function readSlugContent(slug) {
  const { blogContentFiles } = getRepoPaths();
  const escapedSlug = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`'${escapedSlug}':\\s*\`([\\s\\S]*?)\`\\s*,`);

  for (const filePath of blogContentFiles) {
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(regex);
    if (match) return match[1].replace(/\\`/g, '`').replace(/\\\$/g, '$');
  }
  return null;
}

// ── Find declining and underperforming posts ──────────────
async function findRefreshCandidates() {
  const now = Date.now();
  const DAY = 86400000;

  // Current period: last 28 days
  const currentEnd = new Date(now).toISOString().split('T')[0];
  const currentStart = new Date(now - 28 * DAY).toISOString().split('T')[0];

  // Previous period: 56-29 days ago
  const prevEnd = new Date(now - 29 * DAY).toISOString().split('T')[0];
  const prevStart = new Date(now - 56 * DAY).toISOString().split('T')[0];

  log.info(`Querying Search Console: current ${currentStart}→${currentEnd}, previous ${prevStart}→${prevEnd}`);

  const [currentRows, prevRows] = await Promise.all([
    fetchSearchConsoleData(currentStart, currentEnd),
    fetchSearchConsoleData(prevStart, prevEnd),
  ]);

  log.info(`Search Console data: ${currentRows.length} current pages, ${prevRows.length} previous pages`);

  // Index previous period by page URL
  const prevByPage = {};
  for (const row of prevRows) {
    const page = row.keys[0];
    prevByPage[page] = {
      clicks: row.clicks,
      impressions: row.impressions,
      position: row.position,
    };
  }

  // Build current period map (only /blog/ pages)
  const currentByPage = {};
  for (const row of currentRows) {
    const page = row.keys[0];
    if (!page.includes('/blog/')) continue;
    currentByPage[page] = {
      clicks: row.clicks,
      impressions: row.impressions,
      position: row.position,
    };
  }

  // Parse blog metadata to get dates and slugs
  const blogPosts = parseBlogMetadata();
  const postBySlug = {};
  for (const post of blogPosts) {
    postBySlug[post.slug] = post;
  }

  const candidates = [];
  const ninetyDaysAgo = new Date(now - 90 * DAY).toISOString().split('T')[0];

  // Strategy 1: Posts LOSING rankings (position worse by 3+ or clicks down 30%+)
  for (const [page, current] of Object.entries(currentByPage)) {
    const slug = page.replace(/.*\/blog\//, '').replace(/\/$/, '');
    const prev = prevByPage[page];
    const meta = postBySlug[slug];

    if (!prev || !meta) continue;

    const positionDelta = current.position - prev.position; // positive = worse
    const clicksDelta = prev.clicks > 0
      ? ((current.clicks - prev.clicks) / prev.clicks) * 100
      : 0;

    const isLosingPosition = positionDelta >= 3;
    const isLosingClicks = prev.clicks > 0 && clicksDelta <= -30;

    if (isLosingPosition || isLosingClicks) {
      candidates.push({
        slug,
        page,
        meta,
        reason: isLosingPosition
          ? `Position dropped ${positionDelta.toFixed(1)} (${prev.position.toFixed(1)} → ${current.position.toFixed(1)})`
          : `Clicks dropped ${Math.abs(clicksDelta).toFixed(0)}% (${prev.clicks} → ${current.clicks})`,
        currentPosition: current.position,
        previousPosition: prev.position,
        positionDelta,
        currentClicks: current.clicks,
        previousClicks: prev.clicks,
        impressions: current.impressions,
        type: 'declining',
      });
    }
  }

  // Strategy 2: Old posts with high impressions but poor ranking (position > 15)
  for (const [page, current] of Object.entries(currentByPage)) {
    const slug = page.replace(/.*\/blog\//, '').replace(/\/$/, '');
    const meta = postBySlug[slug];

    if (!meta) continue;
    if (meta.date > ninetyDaysAgo) continue; // Skip posts newer than 90 days
    if (current.position <= 15) continue; // Already ranking well enough
    if (current.impressions < 10) continue; // Not enough data

    // Skip if already added as declining
    if (candidates.some(c => c.slug === slug)) continue;

    candidates.push({
      slug,
      page,
      meta,
      reason: `Old post (${meta.date}), position ${current.position.toFixed(1)} with ${current.impressions} impressions`,
      currentPosition: current.position,
      previousPosition: prevByPage[page]?.position || current.position,
      positionDelta: current.position - (prevByPage[page]?.position || current.position),
      currentClicks: current.clicks,
      previousClicks: prevByPage[page]?.clicks || 0,
      impressions: current.impressions,
      type: 'underperforming',
    });
  }

  // Sort by impressions descending (highest visibility = most value)
  candidates.sort((a, b) => b.impressions - a.impressions);

  log.info(`Found ${candidates.length} refresh candidates (${candidates.filter(c => c.type === 'declining').length} declining, ${candidates.filter(c => c.type === 'underperforming').length} underperforming)`);

  return candidates;
}

// ── Refresh content via Claude ────────────────────────────
async function refreshContent(candidate) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const currentHtml = readSlugContent(candidate.slug);
  if (!currentHtml) {
    log.warn(`Could not read HTML for slug "${candidate.slug}", skipping`);
    return null;
  }

  const { meta } = candidate;
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString('en-GB', { month: 'long' });
  const currentDate = new Date().toISOString().split('T')[0];

  const prompt = `You are refreshing an existing blog post on BanffBound, a Banff travel guide website. The post is LOSING search rankings and needs a content refresh to signal freshness to Google.

TODAY'S DATE: ${currentDate}
CURRENT YEAR: ${currentYear}
CURRENT MONTH: ${currentMonth}

POST TITLE: "${meta.title}"
POST CATEGORY: ${meta.category}
ORIGINAL PUBLISH DATE: ${meta.date}
SEARCH PERFORMANCE: Position ${candidate.currentPosition.toFixed(1)}, ${candidate.impressions} impressions
DECLINE REASON: ${candidate.reason}

CURRENT HTML CONTENT:
${currentHtml}

YOUR TASK — Refresh this content while keeping the same overall structure and topic:

1. KEEP the same overall structure, topic, and tone
2. UPDATE any outdated prices, dates, or seasonal info for ${currentYear}
3. ADD 100-300 words of new, fresh content:
   - New sections with updated tips
   - Expanded details on existing sections
   - Fresh practical information for ${currentYear}
4. VOICE & STYLE — This is critical for quality:
   - Write from first-person where natural ("I recommend", "When I last hiked this", "My go-to spot")
   - The author is Jack Chittenden, an ultra runner, Ironman triathlete, and skier who visits Banff regularly
   - Be direct and specific. Say "The parking lot fills by 7:30 AM in July" not "it can get busy"
   - REMOVE these AI cliches wherever they appear: "nestled in the heart", "whether you're seeking", "unforgettable experience", "hidden gem", "breathtaking", "world-class" (unless literally true), "pristine", "look no further", "memories that last a lifetime"
   - Replace vague superlatives with specific details
5. AFFILIATE LINKS — Keep existing ones. Ensure Expedia and GetYourGuide links appear naturally:
   - Expedia: <a href="${EXPEDIA_LINK}" target="_blank" rel="noopener sponsored">Expedia</a>
   - GetYourGuide: <a href="${GYG_LINK}" target="_blank" rel="noopener sponsored">GetYourGuide</a>
6. INTERNAL LINKS — Ensure 2-4 internal links to other BanffBound pages exist. Keep existing ones, add more if needed:
   - Hotel directory: <a href="/hotel-directory">Compare 95+ Banff hotels</a>
   - Hiking guide: <a href="/blog/best-banff-hiking-trails-guide">best Banff hiking trails</a>
   - Where to stay: <a href="/blog/where-to-stay-in-banff">where to stay in Banff</a>
   - 3-day itinerary: <a href="/blog/3-day-banff-itinerary">3-day Banff itinerary</a>
   - Food guide: <a href="/blog/best-banff-restaurants-where-to-eat">best Banff restaurants</a>
7. KEEP all existing internal links intact
8. All year references MUST say ${currentYear} or ${currentYear + 1}. NEVER reference past years as current.
9. Include practical details: prices in CAD, distances in km, real names

CRITICAL: Return ONLY the refreshed HTML content. No markdown, no code fences, no preamble. Start with <p> and end with </p>.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    messages: [{ role: 'user', content: prompt }],
  });

  let html = response.content[0].text.trim();
  // Strip markdown code fences if Claude wraps the HTML
  html = html.replace(/^```html?\n?/i, '').replace(/\n?```$/i, '').trim();

  return html;
}

// ── Write refreshed content back to files ─────────────────
function writeRefreshedContent(slug, newHtml) {
  const { blogContentFiles } = getRepoPaths();
  const escapedSlug = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`('${escapedSlug}':\\s*\`)([\\s\\S]*?)(\`\\s*,)`);

  let sanitized = newHtml
    .replace(/\\'/g, "'")
    .replace(/'[a-z-]+':\s*`/g, '')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${')
    .replace(/(?<!\\)\$/g, '\\$');

  for (const filePath of blogContentFiles) {
    if (!fs.existsSync(filePath)) continue;
    let content = fs.readFileSync(filePath, 'utf8');
    if (regex.test(content)) {
      content = content.replace(regex, `$1\n${sanitized}\n$3`);
      fs.writeFileSync(filePath, content);
      log.info(`Replaced HTML content for "${slug}" in ${path.basename(filePath)}`);
      return true;
    }
  }

  log.error(`Could not find content block for slug "${slug}" in any blogContent chunk`);
  return false;
}

// ── Update post date in blogPosts.ts ──────────────────────
function updatePostDate(slug, newDate) {
  const { blogData } = getRepoPaths();
  let content = fs.readFileSync(blogData, 'utf8');

  const escapedSlug = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Check if lastUpdated already exists for this slug
  const hasLastUpdated = new RegExp(`slug:\\s*'${escapedSlug}',[\\s\\S]*?lastUpdated:`).test(content);

  if (hasLastUpdated) {
    // Update existing lastUpdated
    const regex = new RegExp(`(slug:\\s*'${escapedSlug}',[\\s\\S]*?lastUpdated:\\s*')([^']+)(')`);
    content = content.replace(regex, `$1${newDate}$3`);
  } else {
    // Add lastUpdated after the date line
    const regex = new RegExp(`(slug:\\s*'${escapedSlug}',[\\s\\S]*?date:\\s*'[^']+'),(\\s*)`);
    if (!regex.test(content)) {
      log.error(`Could not find date entry for slug "${slug}" in blogPosts.ts`);
      return false;
    }
    content = content.replace(regex, `$1,\n    lastUpdated: '${newDate}',$2`);
  }

  fs.writeFileSync(blogData, content);
  log.info(`Set lastUpdated for "${slug}" to ${newDate} in blogPosts.ts`);
  return true;
}

// ── Git commit and push ───────────────────────────────────
function gitCommitAndPush(refreshedPosts) {
  const { root } = getRepoPaths();
  const titles = refreshedPosts.map(p => p.meta.title).join(', ');
  const message = `Refresh ${refreshedPosts.length} aging blog posts: ${titles.slice(0, 200)}`;

  try {
    execSync('git add src/data/blogPosts.ts src/data/blogContent1.ts src/data/blogContent2.ts src/data/blogContent3.ts', { cwd: root, stdio: 'pipe' });
    execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { cwd: root, stdio: 'pipe' });
    execSync('git push origin main', { cwd: root, stdio: 'pipe' });
    log.info('Pushed to GitHub — site rebuild triggered');
    return true;
  } catch (err) {
    log.error(`Git push failed: ${err.message}`);
    return false;
  }
}

// ── Main ──────────────────────────────────────────────────
export async function run() {
  log.info('Content Refresher starting...');

  // 1. Clone/pull latest repo
  ensureRepoCheckout();

  // 2. Find posts that need refreshing
  const candidates = await findRefreshCandidates();

  if (candidates.length === 0) {
    log.info('No posts need refreshing — all content holding steady');
    await sendSlack(
      [slackSection(':white_check_mark: Content Refresher: no declining posts found. Rankings steady.')],
      'Content Refresher'
    );
    return { refreshed: 0, totalImpressionsAtStake: 0 };
  }

  log.info(`Top candidates: ${candidates.slice(0, 5).map(c => `"${c.slug}" (${c.impressions} impr, pos ${c.currentPosition.toFixed(1)})`).join(', ')}`);

  // 3. Refresh top candidates (max 2 per run)
  const refreshed = [];
  const toRefresh = candidates.slice(0, MAX_REFRESHES);

  for (const candidate of toRefresh) {
    try {
      log.info(`Refreshing "${candidate.meta.title}" — ${candidate.reason}`);

      const newHtml = await refreshContent(candidate);
      if (!newHtml) continue;

      const today = new Date().toISOString().split('T')[0];

      const wroteContent = writeRefreshedContent(candidate.slug, newHtml);
      const wroteDate = updatePostDate(candidate.slug, today);

      if (wroteContent && wroteDate) {
        refreshed.push(candidate);
        log.info(`Successfully refreshed "${candidate.meta.title}"`);
      }
    } catch (err) {
      log.error(`Failed to refresh "${candidate.slug}": ${err.message}`);
    }
  }

  if (refreshed.length === 0) {
    log.info('No posts were successfully refreshed');
    return { refreshed: 0, totalImpressionsAtStake: 0 };
  }

  // 4. Git commit and push
  const pushed = gitCommitAndPush(refreshed);

  // 5. Calculate total impressions at stake
  const totalImpressionsAtStake = refreshed.reduce((sum, c) => sum + c.impressions, 0);

  // 6. Slack report
  const blocks = [
    slackHeader(`Content Refresh — ${refreshed.length} Posts Updated`),
    slackDivider(),
  ];

  for (const candidate of refreshed) {
    const posDir = candidate.positionDelta > 0 ? '↓' : '↑';
    blocks.push(slackSection(
      `*${candidate.meta.title}*\n` +
      `/blog/${candidate.slug} | ${candidate.type === 'declining' ? ':chart_with_downwards_trend:' : ':hourglass:'} ${candidate.type}\n` +
      `_${candidate.reason}_`
    ));
    blocks.push(slackFields([
      ['Position', `${candidate.previousPosition.toFixed(1)} → ${candidate.currentPosition.toFixed(1)} (${posDir}${Math.abs(candidate.positionDelta).toFixed(1)})`],
      ['Impressions', `${candidate.impressions}`],
      ['Clicks', `${candidate.previousClicks} → ${candidate.currentClicks}`],
      ['Status', wroteAndPushed(pushed)],
    ]));
    blocks.push(slackDivider());
  }

  blocks.push(slackSection(
    `:bar_chart: *Total impressions at stake:* ${totalImpressionsAtStake}\n` +
    (pushed
      ? ':rocket: Pushed to GitHub — site rebuild triggered automatically.'
      : ':warning: Content refreshed locally but git push failed. Manual push needed.')
  ));

  await sendSlack(blocks, `Refreshed ${refreshed.length} blog posts`);

  log.info(`Content Refresher complete: ${refreshed.length} posts refreshed, ${totalImpressionsAtStake} impressions at stake`);
  return { refreshed: refreshed.length, totalImpressionsAtStake };
}

function wroteAndPushed(pushed) {
  return pushed ? ':white_check_mark: Refreshed & pushed' : ':warning: Refreshed, push failed';
}
