import { google } from 'googleapis';
import { getOAuth2Client } from '../core/google-auth.js';
import { createLogger } from '../core/logger.js';
import { sendSlack, slackHeader, slackSection, slackDivider, slackFields } from '../core/slack.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const log = createLogger('rank-tracker');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const SNAPSHOT_FILE = path.join(DATA_DIR, 'rank-snapshots.json');

const SITE_URL = process.env.SEARCH_CONSOLE_SITE_URL || process.env.SITE_URL;

// ── Data Helpers ──────────────────────────────────────────

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadSnapshot() {
  ensureDataDir();
  if (fs.existsSync(SNAPSHOT_FILE)) {
    return JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf8'));
  }
  return null;
}

function saveSnapshot(data) {
  ensureDataDir();
  fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(data, null, 2));
}

function fmtNum(n) {
  return Number(n || 0).toLocaleString('en-GB');
}

function stripDomain(url) {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

// ── Search Console Queries ────────────────────────────────

async function getPageData(searchconsole, startDate, endDate) {
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
  return (res.data.rows || []).map(r => ({
    url: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr,
    position: r.position,
  }));
}

async function getQueryData(searchconsole, startDate, endDate) {
  const res = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['query'],
      rowLimit: 1000,
      type: 'web',
    },
  });
  return (res.data.rows || []).map(r => ({
    query: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr,
    position: r.position,
  }));
}

// ── Analysis ──────────────────────────────────────────────

function analyseChanges(currentPages, previousSnapshot) {
  const prevPageMap = new Map();
  if (previousSnapshot && previousSnapshot.pages) {
    for (const p of previousSnapshot.pages) {
      prevPageMap.set(p.url, p);
    }
  }

  const moversUp = [];
  const moversDown = [];
  const newPages = [];

  for (const page of currentPages) {
    const prev = prevPageMap.get(page.url);
    if (!prev) {
      newPages.push(page);
      continue;
    }
    const posChange = prev.position - page.position; // positive = improved
    if (posChange >= 3) {
      moversUp.push({ ...page, prevPosition: prev.position, change: posChange });
    } else if (posChange <= -3) {
      moversDown.push({ ...page, prevPosition: prev.position, change: posChange });
    }
  }

  moversUp.sort((a, b) => b.change - a.change);
  moversDown.sort((a, b) => a.change - b.change);

  return { moversUp, moversDown, newPages };
}

function findLowCtrPages(pages) {
  return pages
    .filter(p => p.impressions >= 100 && p.ctr < 0.02)
    .sort((a, b) => b.impressions - a.impressions);
}

// ── Build Slack Report ────────────────────────────────────

function buildReport(pages, queries, moversUp, moversDown, newPages, lowCtrPages) {
  const blocks = [];
  const today = new Date().toLocaleDateString('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  blocks.push(slackHeader(`Weekly Ranking Report — ${today}`));

  // Overview
  const totalClicks = pages.reduce((s, p) => s + p.clicks, 0);
  const totalImpressions = pages.reduce((s, p) => s + p.impressions, 0);
  const avgPosition = pages.length > 0
    ? (pages.reduce((s, p) => s + p.position, 0) / pages.length).toFixed(1)
    : '-';

  blocks.push(slackFields([
    ['Total Pages Indexed', fmtNum(pages.length)],
    ['Total Clicks (7d)', fmtNum(totalClicks)],
    ['Total Impressions (7d)', fmtNum(totalImpressions)],
    ['Avg Position', String(avgPosition)],
  ]));

  blocks.push(slackDivider());

  // Biggest Movers Up
  if (moversUp.length > 0) {
    const lines = moversUp.slice(0, 5).map(p =>
      `• :chart_with_upwards_trend: \`${stripDomain(p.url)}\` — pos ${p.prevPosition.toFixed(1)} → *${p.position.toFixed(1)}* (+${p.change.toFixed(1)})`
    ).join('\n');
    blocks.push(slackSection(`*:chart_with_upwards_trend: Biggest Movers Up*\n${lines}`));
  } else {
    blocks.push(slackSection('*:chart_with_upwards_trend: Biggest Movers Up*\n_No pages gained 3+ positions this week_'));
  }

  blocks.push(slackDivider());

  // Biggest Drops
  if (moversDown.length > 0) {
    const lines = moversDown.slice(0, 5).map(p =>
      `• :chart_with_downwards_trend: \`${stripDomain(p.url)}\` — pos ${p.prevPosition.toFixed(1)} → *${p.position.toFixed(1)}* (${p.change.toFixed(1)})`
    ).join('\n');
    blocks.push(slackSection(`*:chart_with_downwards_trend: Biggest Drops*\n${lines}`));
  } else {
    blocks.push(slackSection('*:chart_with_downwards_trend: Biggest Drops*\n_No pages dropped 3+ positions this week_'));
  }

  blocks.push(slackDivider());

  // New in Search
  if (newPages.length > 0) {
    const lines = newPages.slice(0, 10).map(p =>
      `• :new: \`${stripDomain(p.url)}\` — pos ${p.position.toFixed(1)}, ${fmtNum(p.impressions)} impr, ${p.clicks} clicks`
    ).join('\n');
    blocks.push(slackSection(`*:new: New in Search* (${newPages.length} pages)\n${lines}`));
    if (newPages.length > 10) {
      blocks.push(slackSection(`_...and ${newPages.length - 10} more_`));
    }
  } else {
    blocks.push(slackSection('*:new: New in Search*\n_No new pages appeared in search this week_'));
  }

  blocks.push(slackDivider());

  // Low CTR Opportunities
  if (lowCtrPages.length > 0) {
    const lines = lowCtrPages.slice(0, 5).map(p =>
      `• :warning: \`${stripDomain(p.url)}\` — ${fmtNum(p.impressions)} impr, CTR ${(p.ctr * 100).toFixed(1)}%, pos ${p.position.toFixed(1)} — _title/meta description needs improvement_`
    ).join('\n');
    blocks.push(slackSection(`*:warning: Low CTR Opportunities*\n${lines}`));
    if (lowCtrPages.length > 5) {
      blocks.push(slackSection(`_...and ${lowCtrPages.length - 5} more pages with low CTR_`));
    }
  } else {
    blocks.push(slackSection('*:warning: Low CTR Opportunities*\n_No pages with high impressions & low CTR found_'));
  }

  blocks.push(slackDivider());

  // Top Pages by Clicks
  const topByClicks = [...pages].sort((a, b) => b.clicks - a.clicks).slice(0, 5);
  if (topByClicks.length > 0) {
    const lines = topByClicks.map((p, i) =>
      `${i + 1}. \`${stripDomain(p.url)}\` — ${fmtNum(p.clicks)} clicks, ${fmtNum(p.impressions)} impr, pos ${p.position.toFixed(1)}`
    ).join('\n');
    blocks.push(slackSection(`*:trophy: Top Pages by Clicks*\n${lines}`));
  }

  blocks.push(slackDivider());

  // Top Queries
  const topQueries = [...queries].sort((a, b) => b.impressions - a.impressions).slice(0, 10);
  if (topQueries.length > 0) {
    const lines = topQueries.map((q, i) =>
      `${i + 1}. "${q.query}" — ${fmtNum(q.impressions)} impr, ${q.clicks} clicks, pos ${q.position.toFixed(1)}`
    ).join('\n');
    blocks.push(slackSection(`*:mag: Top Queries*\n${lines}`));
  }

  blocks.push(slackDivider());
  blocks.push(slackSection('_Rank Tracker Agent — BanffBound_'));

  return blocks;
}

// ── Main ──────────────────────────────────────────────────
export async function run() {
  log.info('Weekly Rank Tracker starting...');

  const auth = getOAuth2Client();
  const searchconsole = google.searchconsole({ version: 'v1', auth });

  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

  log.info(`Querying Search Console: ${startDate} to ${endDate}`);

  const [pages, queries] = await Promise.all([
    getPageData(searchconsole, startDate, endDate),
    getQueryData(searchconsole, startDate, endDate),
  ]);

  log.info(`Got ${pages.length} pages, ${queries.length} queries`);

  // Load previous snapshot and analyse changes
  const previousSnapshot = loadSnapshot();
  const { moversUp, moversDown, newPages } = analyseChanges(pages, previousSnapshot);
  const lowCtrPages = findLowCtrPages(pages);

  log.info(`Movers up: ${moversUp.length}, drops: ${moversDown.length}, new: ${newPages.length}, low CTR: ${lowCtrPages.length}`);

  // Save current snapshot
  saveSnapshot({
    date: new Date().toISOString(),
    pages,
    queries,
  });
  log.info('Snapshot saved to rank-snapshots.json');

  // Build and send Slack report
  const report = buildReport(pages, queries, moversUp, moversDown, newPages, lowCtrPages);
  await sendSlack(report, 'Weekly Ranking Report');

  const totalClicks = pages.reduce((s, p) => s + p.clicks, 0);
  log.info(`Report sent: ${pages.length} pages, ${totalClicks} clicks, ${moversUp.length} up, ${moversDown.length} down`);

  return {
    totalPages: pages.length,
    totalClicks,
    moversUp: moversUp.length,
    moversDown: moversDown.length,
    newPages: newPages.length,
    lowCtrPages: lowCtrPages.length,
  };
}
