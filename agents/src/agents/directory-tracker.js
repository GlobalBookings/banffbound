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

const DIRECTORIES = [
  // Tourism boards
  { name: 'Banff & Lake Louise Tourism', url: 'https://www.banfflakelouise.com', submitUrl: 'https://www.banfflakelouise.com/contact', category: 'Tourism Board', priority: 'high' },
  { name: 'Travel Alberta', url: 'https://www.travelalberta.com', submitUrl: 'https://industry.travelalberta.com/marketing-resources/digital-marketing', category: 'Tourism Board', priority: 'high' },
  { name: 'Destination Canada', url: 'https://www.destinationcanada.com', submitUrl: 'https://www.destinationcanada.com/en/contact', category: 'Tourism Board', priority: 'high' },
  { name: 'Parks Canada', url: 'https://www.pc.gc.ca', submitUrl: 'https://www.pc.gc.ca/en/pn-np/ab/banff/info/contact', category: 'Government', priority: 'high' },

  // Travel directories
  { name: 'TripAdvisor', url: 'https://www.tripadvisor.ca', submitUrl: 'https://www.tripadvisor.ca/owners', category: 'Review Site', priority: 'high' },
  { name: 'Yelp', url: 'https://www.yelp.ca', submitUrl: 'https://biz.yelp.ca/signup_business/new', category: 'Review Site', priority: 'high' },
  { name: 'Google Business Profile', url: 'https://business.google.com', submitUrl: 'https://business.google.com/create', category: 'Search', priority: 'high' },

  // Travel aggregators
  { name: 'Lonely Planet', url: 'https://www.lonelyplanet.com', submitUrl: 'https://www.lonelyplanet.com/contact', category: 'Travel Guide', priority: 'medium' },
  { name: 'Wikitravel Banff', url: 'https://wikitravel.org/en/Banff', submitUrl: 'https://wikitravel.org/en/Banff', category: 'Wiki', priority: 'medium' },
  { name: 'Wikivoyage Banff', url: 'https://en.wikivoyage.org/wiki/Banff', submitUrl: 'https://en.wikivoyage.org/wiki/Banff', category: 'Wiki', priority: 'medium' },

  // Hiking/outdoor directories
  { name: 'AllTrails', url: 'https://www.alltrails.com', submitUrl: 'https://www.alltrails.com/contact', category: 'Outdoor', priority: 'medium' },
  { name: 'HikingProject', url: 'https://www.hikingproject.com', submitUrl: 'https://www.hikingproject.com', category: 'Outdoor', priority: 'medium' },

  // General directories
  { name: 'DMOZ/Curlie', url: 'https://curlie.org', submitUrl: 'https://curlie.org/docs/en/add.html', category: 'Directory', priority: 'low' },
  { name: 'Jasmine Directory', url: 'https://www.jasminedirectory.com', submitUrl: 'https://www.jasminedirectory.com/submit.html', category: 'Directory', priority: 'low' },
  { name: 'Best of the Web', url: 'https://botw.org', submitUrl: 'https://botw.org/helpcenter/submitasite.aspx', category: 'Directory', priority: 'low' },

  // Social/community
  { name: 'Reddit r/banff wiki', url: 'https://reddit.com/r/banff/wiki', submitUrl: 'https://reddit.com/r/banff', category: 'Community', priority: 'medium' },
  { name: 'Pinterest', url: 'https://pinterest.com', submitUrl: 'https://business.pinterest.com', category: 'Social', priority: 'medium' },
  { name: 'Facebook Page', url: 'https://facebook.com', submitUrl: 'https://www.facebook.com/pages/create', category: 'Social', priority: 'medium' },

  // Canadian directories
  { name: 'Canada Business Directory', url: 'https://www.canadabiz.net', submitUrl: 'https://www.canadabiz.net/add-listing/', category: 'Directory', priority: 'low' },
  { name: 'Canadian Tourism Commission', url: 'https://www.canada.ca/en/services/culture/tourism.html', submitUrl: 'https://www.canada.ca/en/services/culture/tourism.html', category: 'Government', priority: 'medium' },

  // Niche travel
  { name: 'Fodors', url: 'https://www.fodors.com', submitUrl: 'https://www.fodors.com/community', category: 'Travel Guide', priority: 'medium' },
  { name: 'Rough Guides', url: 'https://www.roughguides.com', submitUrl: 'https://www.roughguides.com/contact-us', category: 'Travel Guide', priority: 'low' },
  { name: 'Frommers', url: 'https://www.frommers.com', submitUrl: 'https://www.frommers.com/contact', category: 'Travel Guide', priority: 'low' },
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

// ── Check if site is listed on a directory ────────────────
async function checkListing(directory) {
  try {
    // Try searching for our site on the directory
    const searchUrl = `https://www.google.com/search?q=site:${new URL(directory.url).hostname}+"banffbound"`;

    // We can't actually scrape Google, so we track status manually
    // The agent's value is in organizing and reminding
    return null; // Unknown status
  } catch {
    return null;
  }
}

// ── Build report ──────────────────────────────────────────
function buildReport(status) {
  const blocks = [];
  const today = new Date().toLocaleDateString('en-GB', { timeZone: 'Europe/London', weekday: 'long', day: 'numeric', month: 'long' });

  blocks.push(slackHeader(`Directory Submission Tracker -- ${today}`));

  // Summary stats
  const total = DIRECTORIES.length;
  const submitted = Object.values(status.directories).filter(d => d.status === 'submitted' || d.status === 'approved').length;
  const approved = Object.values(status.directories).filter(d => d.status === 'approved').length;
  const pending = Object.values(status.directories).filter(d => d.status === 'submitted').length;
  const notStarted = total - submitted;

  blocks.push(slackFields([
    ['Total Directories', String(total)],
    ['Submitted', String(submitted)],
    ['Approved/Listed', String(approved)],
    ['Not Yet Submitted', String(notStarted)],
  ]));

  blocks.push(slackDivider());

  // High priority not submitted
  const highPriorityTodo = DIRECTORIES.filter(d =>
    d.priority === 'high' && (!status.directories[d.name] || status.directories[d.name].status === 'not_started')
  );

  if (highPriorityTodo.length > 0) {
    const todoList = highPriorityTodo.map(d =>
      `• :red_circle: *${d.name}* (${d.category})\n  Submit: ${d.submitUrl}`
    ).join('\n');
    blocks.push(slackSection(`:rotating_light: *High Priority -- Submit Now*\n${todoList}`));
    blocks.push(slackDivider());
  }

  // Medium priority
  const medPriorityTodo = DIRECTORIES.filter(d =>
    d.priority === 'medium' && (!status.directories[d.name] || status.directories[d.name].status === 'not_started')
  );

  if (medPriorityTodo.length > 0) {
    const todoList = medPriorityTodo.map(d =>
      `• :large_yellow_circle: *${d.name}* (${d.category})\n  Submit: ${d.submitUrl}`
    ).join('\n');
    blocks.push(slackSection(`:point_right: *Medium Priority*\n${todoList}`));
    blocks.push(slackDivider());
  }

  // Already submitted/approved
  const done = DIRECTORIES.filter(d =>
    status.directories[d.name] && (status.directories[d.name].status === 'submitted' || status.directories[d.name].status === 'approved')
  );

  if (done.length > 0) {
    const doneList = done.map(d => {
      const s = status.directories[d.name];
      const icon = s.status === 'approved' ? ':white_check_mark:' : ':hourglass:';
      const date = s.date ? ` (${new Date(s.date).toLocaleDateString('en-GB')})` : '';
      return `${icon} ${d.name}${date}`;
    }).join('\n');
    blocks.push(slackSection(`:clipboard: *Submitted/Approved*\n${doneList}`));
    blocks.push(slackDivider());
  }

  // Site details for submissions
  blocks.push(slackSection(
    `:page_facing_up: *Your Submission Details:*\n` +
    `*Site Name:* BanffBound\n` +
    `*URL:* ${SITE_URL}\n` +
    `*Category:* Travel > Canada > Alberta > Banff\n` +
    `*Description:* Comprehensive Banff National Park travel guide with 450+ pages covering trails, hotels, restaurants, activities, and trip planning for the Canadian Rockies.\n` +
    `*Contact:* jack@globalbookings.co`
  ));

  // Instructions
  blocks.push(slackDivider());
  blocks.push(slackSection(
    `:bulb: *How to update status:*\n` +
    `Reply to this message with the directory name and status.\n` +
    `The agent tracks submissions weekly and will remind you about pending items.`
  ));

  return blocks;
}

// ── Main ──────────────────────────────────────────────────
export async function run() {
  log.info('Directory Submission Tracker starting...');

  const status = loadStatus();

  // Initialize any new directories
  for (const dir of DIRECTORIES) {
    if (!status.directories[dir.name]) {
      status.directories[dir.name] = { status: 'not_started', date: null, notes: '' };
    }
  }

  const report = buildReport(status);
  await sendSlack(report, 'Directory Submission Tracker');

  status.lastRun = new Date().toISOString();
  saveStatus(status);

  const notStarted = DIRECTORIES.filter(d => status.directories[d.name]?.status === 'not_started').length;
  log.info(`Directory Tracker complete: ${DIRECTORIES.length} directories, ${notStarted} not yet submitted`);

  return {
    total: DIRECTORIES.length,
    notStarted,
    submitted: DIRECTORIES.length - notStarted,
  };
}
