import { google } from 'googleapis';
import { getOAuth2Client } from '../core/google-auth.js';
import { createLogger } from '../core/logger.js';
import { sendSlack, slackHeader, slackSection, slackDivider, slackFields } from '../core/slack.js';
import { fetchSitemapUrls, categorizeUrl } from '../utils/sitemap.js';
import { fmtNumber } from '../utils/currency.js';

const log = createLogger('keyword-miner');

const SITE_URL = process.env.SEARCH_CONSOLE_SITE_URL || process.env.SITE_URL;
const SITEMAP_URL = process.env.SITEMAP_URL;

// ── Search Console Queries ────────────────────────────────
async function getSearchConsoleData(auth, startDate, endDate) {
  const searchconsole = google.searchconsole({ version: 'v1', auth });

  // Top queries (what people search to find us)
  const queryResponse = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['query'],
      rowLimit: 1000,
      type: 'web',
    },
  });

  // Top pages (which pages rank)
  const pageResponse = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['page'],
      rowLimit: 500,
      type: 'web',
    },
  });

  // Query + Page combos (which queries land on which pages)
  const comboResponse = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['query', 'page'],
      rowLimit: 2000,
      type: 'web',
    },
  });

  return {
    queries: queryResponse.data.rows || [],
    pages: pageResponse.data.rows || [],
    combos: comboResponse.data.rows || [],
  };
}

// ── Analysis: Quick Win Keywords ──────────────────────────
// Keywords ranking position 5-20 with decent impressions = low-hanging fruit
function findQuickWins(queries) {
  return queries
    .filter(q => q.position >= 5 && q.position <= 20 && q.impressions >= 50)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 20)
    .map(q => ({
      query: q.keys[0],
      position: q.position.toFixed(1),
      impressions: q.impressions,
      clicks: q.clicks,
      ctr: q.ctr,
      opportunity: Math.round(q.impressions * 0.15), // estimate clicks if position 1-3
    }));
}

// ── Analysis: Content Gaps ────────────────────────────────
// Keywords getting impressions but with very low CTR = page doesn't match intent well
function findContentGaps(queries) {
  return queries
    .filter(q => q.impressions >= 100 && q.ctr < 0.02 && q.position <= 30)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 15)
    .map(q => ({
      query: q.keys[0],
      position: q.position.toFixed(1),
      impressions: q.impressions,
      clicks: q.clicks,
      ctr: q.ctr,
    }));
}

// ── Analysis: Declining Keywords ──────────────────────────
async function findDeclines(auth) {
  const searchconsole = google.searchconsole({ version: 'v1', auth });

  const now = new Date();
  const thisWeekEnd = now.toISOString().split('T')[0];
  const thisWeekStart = new Date(now - 7 * 86400000).toISOString().split('T')[0];
  const lastWeekEnd = new Date(now - 7 * 86400000).toISOString().split('T')[0];
  const lastWeekStart = new Date(now - 14 * 86400000).toISOString().split('T')[0];

  const [thisWeek, lastWeek] = await Promise.all([
    searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: thisWeekStart,
        endDate: thisWeekEnd,
        dimensions: ['query'],
        rowLimit: 500,
        type: 'web',
      },
    }),
    searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: lastWeekStart,
        endDate: lastWeekEnd,
        dimensions: ['query'],
        rowLimit: 500,
        type: 'web',
      },
    }),
  ]);

  const thisMap = new Map((thisWeek.data.rows || []).map(r => [r.keys[0], r]));
  const lastMap = new Map((lastWeek.data.rows || []).map(r => [r.keys[0], r]));

  const declines = [];
  for (const [query, last] of lastMap) {
    const current = thisMap.get(query);
    if (!current) {
      if (last.clicks >= 5) {
        declines.push({
          query,
          lastClicks: last.clicks,
          currentClicks: 0,
          lastPosition: last.position.toFixed(1),
          currentPosition: '-',
          change: -100,
        });
      }
      continue;
    }
    const clickChange = current.clicks - last.clicks;
    const pctChange = last.clicks > 0 ? (clickChange / last.clicks) * 100 : 0;
    if (pctChange < -30 && last.clicks >= 5) {
      declines.push({
        query,
        lastClicks: last.clicks,
        currentClicks: current.clicks,
        lastPosition: last.position.toFixed(1),
        currentPosition: current.position.toFixed(1),
        change: pctChange,
      });
    }
  }

  return declines.sort((a, b) => a.change - b.change).slice(0, 15);
}

// ── Analysis: Pages Without Traffic ───────────────────────
function findOrphanPages(sitemapUrls, pageData) {
  const pagesWithTraffic = new Set(pageData.map(p => p.keys[0]));
  return sitemapUrls
    .filter(url => !pagesWithTraffic.has(url))
    .filter(url => {
      const cat = categorizeUrl(url);
      return cat === 'blog' || cat === 'trail'; // focus on content pages
    })
    .slice(0, 20);
}

// ── Analysis: Keyword Clusters ────────────────────────────
function clusterKeywords(queries) {
  const themes = {
    'hiking': [], 'hotel': [], 'restaurant': [], 'skiing': [],
    'lake': [], 'weather': [], 'things to do': [], 'camping': [],
    'trail': [], 'drive': [], 'winter': [], 'summer': [],
  };

  for (const q of queries) {
    const term = q.keys[0].toLowerCase();
    for (const [theme, arr] of Object.entries(themes)) {
      if (term.includes(theme)) {
        arr.push({ query: q.keys[0], impressions: q.impressions, clicks: q.clicks, position: q.position });
        break;
      }
    }
  }

  return Object.entries(themes)
    .map(([theme, keywords]) => ({
      theme,
      totalImpressions: keywords.reduce((s, k) => s + k.impressions, 0),
      totalClicks: keywords.reduce((s, k) => s + k.clicks, 0),
      count: keywords.length,
      avgPosition: keywords.length > 0
        ? (keywords.reduce((s, k) => s + k.position, 0) / keywords.length).toFixed(1)
        : '-',
    }))
    .filter(t => t.count > 0)
    .sort((a, b) => b.totalImpressions - a.totalImpressions);
}

// ── Build Slack Report ────────────────────────────────────
function buildReport(queries, quickWins, contentGaps, declines, orphans, clusters) {
  const blocks = [];
  const now = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Edmonton' });

  blocks.push(slackHeader(`Keyword Miner — ${now}`));

  // Overview
  const totalImpressions = queries.reduce((s, q) => s + q.impressions, 0);
  const totalClicks = queries.reduce((s, q) => s + q.clicks, 0);
  const uniqueQueries = queries.length;

  blocks.push(slackFields([
    ['Unique Queries', fmtNumber(uniqueQueries)],
    ['Total Impressions', fmtNumber(totalImpressions)],
    ['Total Clicks', fmtNumber(totalClicks)],
    ['Avg CTR', `${((totalClicks / totalImpressions) * 100 || 0).toFixed(1)}%`],
  ]));

  blocks.push(slackDivider());

  // Theme clusters
  if (clusters.length > 0) {
    blocks.push(slackSection(':bar_chart: *Keyword Themes*'));
    for (const c of clusters.slice(0, 8)) {
      blocks.push(slackSection(
        `*${c.theme}* — ${c.count} queries, ${fmtNumber(c.totalImpressions)} impr, ` +
        `${fmtNumber(c.totalClicks)} clicks, avg pos ${c.avgPosition}`
      ));
    }
  }

  blocks.push(slackDivider());

  // Quick wins
  if (quickWins.length > 0) {
    blocks.push(slackSection(`:rocket: *Quick Wins* (position 5-20, high impressions)`));
    for (const w of quickWins.slice(0, 10)) {
      blocks.push(slackSection(
        `• "${w.query}" — pos *${w.position}*, ${fmtNumber(w.impressions)} impr, ` +
        `${w.clicks} clicks → est. *+${w.opportunity} clicks* if top 3`
      ));
    }
  } else {
    blocks.push(slackSection('_No quick win keywords found yet (need more search data)_'));
  }

  blocks.push(slackDivider());

  // Content gaps
  if (contentGaps.length > 0) {
    blocks.push(slackSection(`:mag: *Content Gaps* (high impressions, low CTR)`));
    for (const g of contentGaps.slice(0, 8)) {
      blocks.push(slackSection(
        `• "${g.query}" — pos ${g.position}, ${fmtNumber(g.impressions)} impr, ` +
        `CTR ${(g.ctr * 100).toFixed(1)}% — _needs better title/meta or dedicated page_`
      ));
    }
  }

  blocks.push(slackDivider());

  // Declines
  if (declines.length > 0) {
    blocks.push(slackSection(`:chart_with_downwards_trend: *Declining Keywords* (week over week)`));
    for (const d of declines.slice(0, 8)) {
      blocks.push(slackSection(
        `• "${d.query}" — ${d.lastClicks}→${d.currentClicks} clicks (${d.change.toFixed(0)}%), ` +
        `pos ${d.lastPosition}→${d.currentPosition}`
      ));
    }
  }

  blocks.push(slackDivider());

  // Orphan pages
  if (orphans.length > 0) {
    blocks.push(slackSection(`:ghost: *Pages With Zero Search Traffic* (${orphans.length} found)`));
    for (const url of orphans.slice(0, 8)) {
      const path = new URL(url).pathname;
      blocks.push(slackSection(`• \`${path}\``));
    }
    if (orphans.length > 8) {
      blocks.push(slackSection(`_...and ${orphans.length - 8} more_`));
    }
  }

  blocks.push(slackDivider());
  blocks.push(slackSection(`_Keyword Miner Agent — BanffBound_`));

  return blocks;
}

// ── Main ──────────────────────────────────────────────────
export async function run() {
  log.info('Starting Keyword Miner...');

  const auth = getOAuth2Client();
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 28 * 86400000).toISOString().split('T')[0];

  log.info(`Querying Search Console: ${startDate} to ${endDate}`);
  const { queries, pages, combos } = await getSearchConsoleData(auth, startDate, endDate);
  log.info(`Got ${queries.length} queries, ${pages.length} pages, ${combos.length} combos`);

  const quickWins = findQuickWins(queries);
  log.info(`Quick wins: ${quickWins.length}`);

  const contentGaps = findContentGaps(queries);
  log.info(`Content gaps: ${contentGaps.length}`);

  const declines = await findDeclines(auth).catch(e => {
    log.warn(`Decline analysis failed: ${e.message}`);
    return [];
  });
  log.info(`Declines: ${declines.length}`);

  let orphans = [];
  if (SITEMAP_URL) {
    try {
      const sitemapUrls = await fetchSitemapUrls(SITEMAP_URL);
      orphans = findOrphanPages(sitemapUrls, pages);
      log.info(`Orphan pages: ${orphans.length}`);
    } catch (e) {
      log.warn(`Sitemap fetch failed: ${e.message}`);
    }
  }

  const clusters = clusterKeywords(queries);
  log.info(`Keyword clusters: ${clusters.length}`);

  const report = buildReport(queries, quickWins, contentGaps, declines, orphans, clusters);
  await sendSlack(report, 'Keyword Miner Daily Report');

  log.info('Keyword Miner complete');

  return {
    totalQueries: queries.length,
    quickWins: quickWins.length,
    contentGaps: contentGaps.length,
    declines: declines.length,
    orphanPages: orphans.length,
  };
}
