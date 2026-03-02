import axios from 'axios';
import { createLogger } from '../core/logger.js';
import { sendSlack, slackHeader, slackSection, slackDivider, slackFields } from '../core/slack.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const log = createLogger('backlink-monitor');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'backlinks-history.json');

const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN;
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD;
const TARGET = process.env.SITE_DOMAIN || 'banffbound.com';

const API_BASE = 'https://api.dataforseo.com/v3';

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadHistory() {
  ensureDataDir();
  if (fs.existsSync(HISTORY_FILE)) {
    return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
  }
  return { lastRun: null, domains: {}, summary: null, snapshots: [] };
}

function saveHistory(data) {
  ensureDataDir();
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(data, null, 2));
}

function fmtNum(n) {
  return Number(n || 0).toLocaleString('en-GB');
}

async function apiPost(endpoint, body) {
  const res = await axios.post(`${API_BASE}${endpoint}`, body, {
    auth: { username: DATAFORSEO_LOGIN, password: DATAFORSEO_PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  });
  const task = res.data?.tasks?.[0];
  if (!task || task.status_code !== 20000) {
    throw new Error(`DataForSEO error: ${task?.status_message || 'Unknown'}`);
  }
  return task.result?.[0];
}

// ── Safe API call (returns null on access denied) ─────────
async function safeApiPost(endpoint, body) {
  try {
    return await apiPost(endpoint, body);
  } catch (e) {
    if (e.message.includes('Access denied')) {
      log.warn(`${endpoint}: not available on current plan`);
      return null;
    }
    throw e;
  }
}

// ── Bulk summary stats ────────────────────────────────────
async function getBulkStats() {
  const [domains, backlinks, newLost, ranks] = await Promise.all([
    safeApiPost('/backlinks/bulk_referring_domains/live', [{ targets: [TARGET] }]),
    safeApiPost('/backlinks/bulk_backlinks/live', [{ targets: [TARGET] }]),
    safeApiPost('/backlinks/bulk_new_lost_backlinks/live', [{ targets: [TARGET] }]),
    safeApiPost('/backlinks/bulk_ranks/live', [{ targets: [TARGET] }]),
  ]);

  const d = domains?.items?.[0] || {};
  const b = backlinks?.items?.[0] || {};
  const nl = newLost?.items?.[0] || {};
  const r = ranks?.items?.[0] || {};

  return {
    backlinks: b.backlinks || 0,
    referringDomains: d.referring_domains || 0,
    referringDomainsNofollow: d.referring_domains_nofollow || 0,
    referringMainDomains: d.referring_main_domains || 0,
    newBacklinks: nl.new_backlinks || 0,
    lostBacklinks: nl.lost_backlinks || 0,
    rank: r.rank || 0,
  };
}

// ── Referring Domains (detailed) ──────────────────────────
async function getReferringDomains() {
  const result = await safeApiPost('/backlinks/referring_domains/live', [{
    target: TARGET,
    include_subdomains: true,
    backlinks_status_type: 'live',
    order_by: ['rank,desc'],
    limit: 50,
  }]);
  return result?.items || [];
}

// ── Detect Changes vs History ─────────────────────────────
function detectChanges(currentDomains, history) {
  const prevDomains = history.domains || {};
  const newDomains = [];
  const lostDomains = [];

  for (const [domain, data] of Object.entries(currentDomains)) {
    if (!prevDomains[domain]) {
      newDomains.push({ domain, rank: data.rank, backlinks: data.backlinks });
    }
  }

  for (const [domain, data] of Object.entries(prevDomains)) {
    if (!currentDomains[domain]) {
      lostDomains.push({ domain, rank: data.rank });
    }
  }

  return { newDomains, lostDomains };
}

// ── Classify domain quality ───────────────────────────────
function classifyDomain(item) {
  const spamSignals = ['shortener', 'redirect', 'url', 'shrink', 'link', 'seo', 'buzz', 'toplike', 'video'];
  const domain = (item.domain || '').toLowerCase();
  const isSpammy = item.rank === 0 && spamSignals.some(s => domain.includes(s));
  const isNofollow = item.backlinks_nofollow > 0 && item.backlinks_nofollow >= (item.backlinks || 1);
  return { isSpammy, isNofollow };
}

// ── Build Slack Report ────────────────────────────────────
function buildReport(stats, refDomains, changes, history) {
  const blocks = [];
  const today = new Date().toLocaleDateString('en-GB', { timeZone: 'Europe/London', weekday: 'long', day: 'numeric', month: 'long' });

  blocks.push(slackHeader(`Backlink Monitor — ${today}`));

  // Summary
  const prevStats = history.summary || {};
  const delta = (cur, prev) => {
    const d = (cur || 0) - (prev || 0);
    return d > 0 ? ` (+${d})` : d < 0 ? ` (${d})` : '';
  };

  blocks.push(slackFields([
    ['Total Backlinks', `${fmtNum(stats.backlinks)}${delta(stats.backlinks, prevStats.backlinks)}`],
    ['Referring Domains', `${fmtNum(stats.referringDomains)}${delta(stats.referringDomains, prevStats.referringDomains)}`],
    ['Domain Rank', String(stats.rank)],
    ['Dofollow Domains', fmtNum(stats.referringDomains - stats.referringDomainsNofollow)],
    ['New (recent)', String(stats.newBacklinks)],
    ['Lost (recent)', String(stats.lostBacklinks)],
  ]));

  blocks.push(slackDivider());

  // New domains since last scan
  if (changes.newDomains.length > 0) {
    const newList = changes.newDomains
      .sort((a, b) => (b.rank || 0) - (a.rank || 0))
      .map(d => {
        const quality = d.rank > 0 ? `:star: rank ${d.rank}` : ':grey_question: rank 0';
        return `• *${d.domain}* — ${d.backlinks} link${d.backlinks > 1 ? 's' : ''} (${quality})`;
      })
      .join('\n');
    blocks.push(slackSection(`:new: *New Referring Domains*\n${newList}`));
    blocks.push(slackDivider());
  }

  // Lost domains
  if (changes.lostDomains.length > 0) {
    const lostList = changes.lostDomains
      .map(d => `• ${d.domain} (was rank ${d.rank || 0})`)
      .join('\n');
    blocks.push(slackSection(`:warning: *Lost Referring Domains*\n${lostList}`));
    blocks.push(slackDivider());
  }

  // All referring domains with quality assessment
  if (refDomains.length > 0) {
    const quality = refDomains.map(d => classifyDomain(d));
    const spamCount = quality.filter(q => q.isSpammy).length;
    const nofollowCount = quality.filter(q => q.isNofollow).length;
    const goodCount = quality.filter(q => !q.isSpammy && !q.isNofollow).length;

    const domainList = refDomains.map((d, i) => {
      const q = quality[i];
      const flag = q.isSpammy ? ' :rotating_light: spam' : q.isNofollow ? ' (nofollow)' : ' :white_check_mark:';
      return `${i + 1}. *${d.domain}* — ${d.backlinks} link${d.backlinks > 1 ? 's' : ''}, rank ${d.rank}${flag}`;
    }).join('\n');

    blocks.push(slackSection(`:link: *All Referring Domains* (${goodCount} quality, ${nofollowCount} nofollow, ${spamCount} spam)\n${domainList}`));
    blocks.push(slackDivider());
  }

  // Health assessment
  const spamDomains = refDomains.filter(d => classifyDomain(d).isSpammy);
  if (spamDomains.length > 0) {
    blocks.push(slackSection(
      `:rotating_light: *Spam Alert:* ${spamDomains.length} of ${refDomains.length} referring domains look spammy (rank 0 + suspicious names). ` +
      `These are likely automated link spam. Consider disavowing via Google Search Console if they persist.`
    ));
    blocks.push(slackDivider());
  }

  // Link building suggestions
  const goodDomains = refDomains.filter(d => !classifyDomain(d).isSpammy);
  if (goodDomains.length < 10) {
    blocks.push(slackSection(
      `:bulb: *Link Building Priorities*\n` +
      `You have ${goodDomains.length} quality referring domains. To grow:\n` +
      `• Submit to *Banff & Lake Louise Tourism* directory\n` +
      `• Get listed on *TripAdvisor* and *Yelp* for Banff guides\n` +
      `• Guest post on Canadian travel blogs\n` +
      `• Share trail guides on Reddit (r/banff, r/hiking, r/canadianrockies)\n` +
      `• Reach out to travel bloggers visiting Banff\n` +
      `• Submit to *Parks Canada* partner/affiliate listings\n` +
      `• Create shareable content (infographics, trail maps) that earns links`
    ));
  }

  // Trend if we have history
  if ((history.snapshots || []).length > 1) {
    const snaps = history.snapshots.slice(-4);
    const trend = snaps.map(s => {
      const d = new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      return `${d}: ${s.backlinks} links, ${s.referringDomains} domains`;
    }).join('\n');
    blocks.push(slackDivider());
    blocks.push(slackSection(`:chart_with_upwards_trend: *Trend (last ${snaps.length} scans)*\n${trend}`));
  }

  return blocks;
}

// ── Main ──────────────────────────────────────────────────
export async function run() {
  log.info('Backlink Monitor starting...');

  if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
    throw new Error('Missing DATAFORSEO_LOGIN or DATAFORSEO_PASSWORD in .env');
  }

  const history = loadHistory();

  const [stats, refDomains] = await Promise.all([
    getBulkStats(),
    getReferringDomains(),
  ]);

  // Build domain lookup
  const currentDomains = {};
  for (const item of refDomains) {
    currentDomains[item.domain || 'unknown'] = {
      rank: item.rank || 0,
      backlinks: item.backlinks || 0,
    };
  }

  const changes = detectChanges(currentDomains, history);

  const report = buildReport(stats, refDomains, changes, history);
  await sendSlack(report, 'Backlink Monitor');

  // Save state
  history.lastRun = new Date().toISOString();
  history.domains = currentDomains;
  history.summary = {
    backlinks: stats.backlinks,
    referringDomains: stats.referringDomains,
    rank: stats.rank,
  };
  history.snapshots = [...(history.snapshots || []).slice(-30), {
    date: new Date().toISOString(),
    backlinks: stats.backlinks,
    referringDomains: stats.referringDomains,
    rank: stats.rank,
    newDomains: changes.newDomains.length,
    lostDomains: changes.lostDomains.length,
  }];
  saveHistory(history);

  log.info(`Complete: ${stats.backlinks} backlinks, ${stats.referringDomains} domains, rank ${stats.rank}, ${changes.newDomains.length} new, ${changes.lostDomains.length} lost`);

  return {
    backlinks: stats.backlinks,
    referringDomains: stats.referringDomains,
    rank: stats.rank,
    newDomains: changes.newDomains.length,
    lostDomains: changes.lostDomains.length,
  };
}
