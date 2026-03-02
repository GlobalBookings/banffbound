import { createLogger } from '../core/logger.js';
import { sendSlack, slackHeader, slackSection, slackDivider, slackFields } from '../core/slack.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const log = createLogger('directory-tracker');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const STATUS_FILE = path.join(DATA_DIR, 'directory-status.json');
const SITE_URL = process.env.SITE_URL || 'https://banffbound.com';

const SITE_INFO = {
  name: 'BanffBound',
  url: SITE_URL,
  description: 'Comprehensive Banff National Park travel guide with 450+ pages covering trails, hotels, restaurants, activities, and trip planning for the Canadian Rockies.',
  shortDescription: 'Your complete guide to Banff National Park - trails, hotels, restaurants & trip planning.',
  category: 'Travel > Canada > Alberta > Banff',
  email: process.env.OUTREACH_FROM_EMAIL || 'hello@banffbound.com',
  keywords: 'banff, banff national park, canadian rockies, banff travel guide, banff hotels, banff trails, lake louise, banff restaurants',
};

const DIRECTORIES = [
  // Auto-submittable (have indexing APIs or ping endpoints)
  { name: 'Google Search Console', url: 'https://search.google.com/search-console', submitUrl: null, category: 'Search', priority: 'high', autoSubmit: 'ping',
    pingUrl: `https://www.google.com/ping?sitemap=${encodeURIComponent(SITE_URL + '/sitemap-index.xml')}` },
  { name: 'Bing Webmaster', url: 'https://www.bing.com/webmasters', submitUrl: null, category: 'Search', priority: 'high', autoSubmit: 'ping',
    pingUrl: `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITE_URL + '/sitemap-index.xml')}` },
  { name: 'IndexNow (Bing/Yandex)', url: 'https://www.indexnow.org', submitUrl: null, category: 'Search', priority: 'high', autoSubmit: 'indexnow' },

  // Tourism boards (manual but high value)
  { name: 'Banff & Lake Louise Tourism', url: 'https://www.banfflakelouise.com', submitUrl: 'https://www.banfflakelouise.com/contact', category: 'Tourism Board', priority: 'high', autoSubmit: false },
  { name: 'Travel Alberta', url: 'https://www.travelalberta.com', submitUrl: 'https://industry.travelalberta.com/marketing-resources/digital-marketing', category: 'Tourism Board', priority: 'high', autoSubmit: false },
  { name: 'Destination Canada', url: 'https://www.destinationcanada.com', submitUrl: 'https://www.destinationcanada.com/en/contact', category: 'Tourism Board', priority: 'high', autoSubmit: false },

  // Review/listing sites
  { name: 'Google Business Profile', url: 'https://business.google.com', submitUrl: 'https://business.google.com/create', category: 'Search', priority: 'high', autoSubmit: false },
  { name: 'TripAdvisor', url: 'https://www.tripadvisor.ca', submitUrl: 'https://www.tripadvisor.ca/owners', category: 'Review Site', priority: 'high', autoSubmit: false },
  { name: 'Yelp', url: 'https://www.yelp.ca', submitUrl: 'https://biz.yelp.ca/signup_business/new', category: 'Review Site', priority: 'high', autoSubmit: false },

  // Wikis (can be edited directly)
  { name: 'Wikitravel Banff', url: 'https://wikitravel.org/en/Banff', submitUrl: 'https://wikitravel.org/en/Banff', category: 'Wiki', priority: 'medium', autoSubmit: false,
    instructions: 'Create account, edit Banff page, add BanffBound as external link in "Get in" or "See" sections' },
  { name: 'Wikivoyage Banff', url: 'https://en.wikivoyage.org/wiki/Banff', submitUrl: 'https://en.wikivoyage.org/wiki/Banff', category: 'Wiki', priority: 'medium', autoSubmit: false,
    instructions: 'Create account, edit Banff page, add BanffBound as external link resource' },

  // Outdoor directories
  { name: 'AllTrails', url: 'https://www.alltrails.com', submitUrl: 'https://www.alltrails.com/contact', category: 'Outdoor', priority: 'medium', autoSubmit: false },
  { name: 'HikingProject', url: 'https://www.hikingproject.com', submitUrl: 'https://www.hikingproject.com', category: 'Outdoor', priority: 'medium', autoSubmit: false },

  // Social platforms
  { name: 'Pinterest Business', url: 'https://pinterest.com', submitUrl: 'https://business.pinterest.com', category: 'Social', priority: 'medium', autoSubmit: false,
    instructions: 'Create business account, verify website, create boards for Banff trails/hotels/restaurants' },
  { name: 'Facebook Page', url: 'https://facebook.com', submitUrl: 'https://www.facebook.com/pages/create', category: 'Social', priority: 'medium', autoSubmit: false },

  // General directories
  { name: 'DMOZ/Curlie', url: 'https://curlie.org', submitUrl: 'https://curlie.org/docs/en/add.html', category: 'Directory', priority: 'low', autoSubmit: false },
  { name: 'Jasmine Directory', url: 'https://www.jasminedirectory.com', submitUrl: 'https://www.jasminedirectory.com/submit.html', category: 'Directory', priority: 'low', autoSubmit: false },
  { name: 'Best of the Web', url: 'https://botw.org', submitUrl: 'https://botw.org/helpcenter/submitasite.aspx', category: 'Directory', priority: 'low', autoSubmit: false },

  // Canadian directories
  { name: 'Canada Business Directory', url: 'https://www.canadabiz.net', submitUrl: 'https://www.canadabiz.net/add-listing/', category: 'Directory', priority: 'low', autoSubmit: false },

  // Travel guides
  { name: 'Fodors Community', url: 'https://www.fodors.com', submitUrl: 'https://www.fodors.com/community', category: 'Travel Guide', priority: 'medium', autoSubmit: false,
    instructions: 'Create account, post Banff travel tips in community forums with link to guides' },
  { name: 'Reddit r/banff', url: 'https://reddit.com/r/banff', submitUrl: 'https://reddit.com/r/banff', category: 'Community', priority: 'medium', autoSubmit: false,
    instructions: 'Share helpful trail guides and hotel comparisons (handled by Reddit Promoter agent)' },
];

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadStatus() {
  ensureDataDir();
  if (fs.existsSync(STATUS_FILE)) return JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
  return { directories: {}, lastRun: null };
}

function saveStatus(data) {
  ensureDataDir();
  fs.writeFileSync(STATUS_FILE, JSON.stringify(data, null, 2));
}

// ── Auto-submit: ping search engines with sitemap ─────────
async function pingSitemap(dir) {
  try {
    const res = await fetch(dir.pingUrl, { signal: AbortSignal.timeout(10000) });
    if (res.ok) {
      log.info(`Pinged ${dir.name} successfully`);
      return { success: true };
    }
    return { success: false, error: `HTTP ${res.status}` };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ── Auto-submit: IndexNow ─────────────────────────────────
async function submitIndexNow() {
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: new URL(SITE_URL).hostname,
        key: 'banffbound-indexnow-key',
        urlList: [
          SITE_URL,
          `${SITE_URL}/blog`,
          `${SITE_URL}/hotel-directory`,
          `${SITE_URL}/trails`,
          `${SITE_URL}/trail-map`,
          `${SITE_URL}/activities`,
          `${SITE_URL}/eat-and-drink`,
          `${SITE_URL}/skiing`,
        ],
      }),
      signal: AbortSignal.timeout(10000),
    });
    log.info(`IndexNow: ${res.status}`);
    return { success: res.ok || res.status === 202, status: res.status };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ── Build report ──────────────────────────────────────────
function buildReport(status, autoResults) {
  const blocks = [];
  const today = new Date().toLocaleDateString('en-GB', { timeZone: 'Europe/London', weekday: 'long', day: 'numeric', month: 'long' });

  blocks.push(slackHeader(`Directory Tracker — ${today}`));

  // Summary
  const total = DIRECTORIES.length;
  const submitted = Object.values(status.directories).filter(d => d.status === 'submitted' || d.status === 'approved').length;
  const approved = Object.values(status.directories).filter(d => d.status === 'approved').length;

  blocks.push(slackFields([
    ['Total Directories', String(total)],
    ['Submitted/Listed', String(submitted)],
    ['Not Started', String(total - submitted)],
  ]));

  blocks.push(slackDivider());

  // Auto-submission results
  if (autoResults.length > 0) {
    const autoList = autoResults.map(r => {
      const icon = r.success ? ':white_check_mark:' : ':x:';
      return `${icon} *${r.name}* — ${r.success ? 'submitted' : r.error}`;
    }).join('\n');
    blocks.push(slackSection(`:robot_face: *Auto-Submitted:*\n${autoList}`));
    blocks.push(slackDivider());
  }

  // High priority not submitted
  const highTodo = DIRECTORIES.filter(d =>
    d.priority === 'high' && !d.autoSubmit && (!status.directories[d.name] || status.directories[d.name].status === 'not_started')
  );

  if (highTodo.length > 0) {
    const todoList = highTodo.map(d => {
      const instructions = d.instructions ? `\n  _${d.instructions}_` : '';
      return `• :red_circle: *${d.name}* (${d.category})\n  <${d.submitUrl}|Submit here>${instructions}`;
    }).join('\n');
    blocks.push(slackSection(`:rotating_light: *High Priority — Action Needed:*\n${todoList}`));
    blocks.push(slackDivider());
  }

  // Medium priority
  const medTodo = DIRECTORIES.filter(d =>
    d.priority === 'medium' && !d.autoSubmit && (!status.directories[d.name] || status.directories[d.name].status === 'not_started')
  );

  if (medTodo.length > 0) {
    const todoList = medTodo.map(d => {
      const instructions = d.instructions ? `\n  _${d.instructions}_` : '';
      return `• :large_yellow_circle: *${d.name}*\n  <${d.submitUrl}|Submit here>${instructions}`;
    }).join('\n');
    blocks.push(slackSection(`:point_right: *Medium Priority:*\n${todoList}`));
    blocks.push(slackDivider());
  }

  // Completed
  const done = DIRECTORIES.filter(d =>
    status.directories[d.name] && (status.directories[d.name].status === 'submitted' || status.directories[d.name].status === 'approved')
  );

  if (done.length > 0) {
    const doneList = done.map(d => {
      const s = status.directories[d.name];
      const icon = s.status === 'approved' ? ':white_check_mark:' : ':hourglass:';
      return `${icon} ${d.name}`;
    }).join('\n');
    blocks.push(slackSection(`:clipboard: *Done:*\n${doneList}`));
    blocks.push(slackDivider());
  }

  // Pre-filled site info for manual submissions
  blocks.push(slackSection(
    `:page_facing_up: *Copy-paste for submissions:*\n` +
    `*Name:* ${SITE_INFO.name}\n` +
    `*URL:* ${SITE_INFO.url}\n` +
    `*Email:* ${SITE_INFO.email}\n` +
    `*Short:* ${SITE_INFO.shortDescription}\n` +
    `*Full:* ${SITE_INFO.description}\n` +
    `*Keywords:* ${SITE_INFO.keywords}`
  ));

  return blocks;
}

// ── Main ──────────────────────────────────────────────────
export async function run() {
  log.info('Directory Tracker starting...');

  const status = loadStatus();

  // Initialize directories
  for (const dir of DIRECTORIES) {
    if (!status.directories[dir.name]) {
      status.directories[dir.name] = { status: 'not_started', date: null };
    }
  }

  // Run auto-submissions
  const autoResults = [];

  for (const dir of DIRECTORIES.filter(d => d.autoSubmit)) {
    let result;
    if (dir.autoSubmit === 'ping') {
      result = await pingSitemap(dir);
    } else if (dir.autoSubmit === 'indexnow') {
      result = await submitIndexNow();
    }

    if (result) {
      autoResults.push({ name: dir.name, ...result });
      if (result.success) {
        status.directories[dir.name] = { status: 'submitted', date: new Date().toISOString() };
      }
    }
  }

  const report = buildReport(status, autoResults);
  await sendSlack(report, 'Directory Tracker');

  status.lastRun = new Date().toISOString();
  saveStatus(status);

  const notStarted = DIRECTORIES.filter(d => !d.autoSubmit && status.directories[d.name]?.status === 'not_started').length;
  log.info(`Directory Tracker complete: ${autoResults.filter(r => r.success).length} auto-submitted, ${notStarted} manual pending`);

  return { autoSubmitted: autoResults.filter(r => r.success).length, manualPending: notStarted };
}
