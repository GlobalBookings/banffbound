import { google } from 'googleapis';
import { getOAuth2Client } from '../core/google-auth.js';
import { createLogger } from '../core/logger.js';
import { sendSlack, slackHeader, slackSection, slackDivider, slackFields } from '../core/slack.js';

const log = createLogger('ga4-briefing');
const PROPERTY_ID = process.env.GA4_PROPERTY_ID || '494425433';

function fmtNum(n) {
  return Number(n || 0).toLocaleString('en-GB');
}

function fmtPct(n) {
  return (Number(n || 0) * 100).toFixed(1) + '%';
}

function delta(current, previous) {
  if (!previous || previous === 0) return '';
  const change = ((current - previous) / previous) * 100;
  const arrow = change > 0 ? '↑' : change < 0 ? '↓' : '→';
  return ` ${arrow}${Math.abs(change).toFixed(0)}%`;
}

async function runReport(analytics, config) {
  const res = await analytics.properties.runReport({
    property: `properties/${PROPERTY_ID}`,
    requestBody: config,
  });
  return res.data;
}

// ── Traffic Overview (today vs yesterday) ─────────────────
async function getOverview(analytics) {
  const today = await runReport(analytics, {
    dateRanges: [{ startDate: '1daysAgo', endDate: '1daysAgo' }],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'screenPageViews' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' },
      { name: 'newUsers' },
    ],
  });

  const prev = await runReport(analytics, {
    dateRanges: [{ startDate: '2daysAgo', endDate: '2daysAgo' }],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'screenPageViews' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' },
      { name: 'newUsers' },
    ],
  });

  const t = today.rows?.[0]?.metricValues || [];
  const p = prev.rows?.[0]?.metricValues || [];

  return {
    sessions: { val: Number(t[0]?.value || 0), prev: Number(p[0]?.value || 0) },
    users: { val: Number(t[1]?.value || 0), prev: Number(p[1]?.value || 0) },
    pageviews: { val: Number(t[2]?.value || 0), prev: Number(p[2]?.value || 0) },
    bounceRate: { val: Number(t[3]?.value || 0), prev: Number(p[3]?.value || 0) },
    avgDuration: { val: Number(t[4]?.value || 0), prev: Number(p[4]?.value || 0) },
    newUsers: { val: Number(t[5]?.value || 0), prev: Number(p[5]?.value || 0) },
  };
}

// ── Source / Medium Breakdown ─────────────────────────────
async function getSources(analytics) {
  const data = await runReport(analytics, {
    dateRanges: [{ startDate: '1daysAgo', endDate: '1daysAgo' }],
    dimensions: [{ name: 'sessionDefaultChannelGroup' }],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'screenPageViews' },
      { name: 'bounceRate' },
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 10,
  });

  return (data.rows || []).map(r => ({
    channel: r.dimensionValues[0].value,
    sessions: Number(r.metricValues[0].value),
    users: Number(r.metricValues[1].value),
    pageviews: Number(r.metricValues[2].value),
    bounceRate: Number(r.metricValues[3].value),
  }));
}

// ── Device Breakdown ──────────────────────────────────────
async function getDevices(analytics) {
  const data = await runReport(analytics, {
    dateRanges: [{ startDate: '1daysAgo', endDate: '1daysAgo' }],
    dimensions: [{ name: 'deviceCategory' }],
    metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
  });

  return (data.rows || []).map(r => ({
    device: r.dimensionValues[0].value,
    sessions: Number(r.metricValues[0].value),
    users: Number(r.metricValues[1].value),
  }));
}

// ── Top Pages ─────────────────────────────────────────────
async function getTopPages(analytics) {
  const data = await runReport(analytics, {
    dateRanges: [{ startDate: '1daysAgo', endDate: '1daysAgo' }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'sessions' },
      { name: 'averageSessionDuration' },
    ],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 10,
  });

  return (data.rows || []).map(r => ({
    path: r.dimensionValues[0].value,
    pageviews: Number(r.metricValues[0].value),
    sessions: Number(r.metricValues[1].value),
    avgDuration: Number(r.metricValues[2].value),
  }));
}

// ── Top Landing Pages ─────────────────────────────────────
async function getLandingPages(analytics) {
  const data = await runReport(analytics, {
    dateRanges: [{ startDate: '1daysAgo', endDate: '1daysAgo' }],
    dimensions: [{ name: 'landingPage' }],
    metrics: [{ name: 'sessions' }, { name: 'bounceRate' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 10,
  });

  return (data.rows || []).map(r => ({
    path: r.dimensionValues[0].value,
    sessions: Number(r.metricValues[0].value),
    bounceRate: Number(r.metricValues[1].value),
  }));
}

// ── Affiliate Click Events ────────────────────────────────
async function getAffiliateClicks(analytics) {
  const data = await runReport(analytics, {
    dateRanges: [{ startDate: '1daysAgo', endDate: '1daysAgo' }],
    dimensions: [{ name: 'eventName' }, { name: 'pagePath' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: {
      filter: {
        fieldName: 'eventName',
        inListFilter: {
          values: ['affiliate_click', 'click', 'outbound_click'],
        },
      },
    },
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    limit: 20,
  });

  return (data.rows || []).map(r => ({
    event: r.dimensionValues[0].value,
    page: r.dimensionValues[1].value,
    count: Number(r.metricValues[0].value),
  }));
}

// ── Geo Breakdown ─────────────────────────────────────────
async function getGeo(analytics) {
  const data = await runReport(analytics, {
    dateRanges: [{ startDate: '1daysAgo', endDate: '1daysAgo' }],
    dimensions: [{ name: 'country' }],
    metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 5,
  });

  return (data.rows || []).map(r => ({
    country: r.dimensionValues[0].value,
    sessions: Number(r.metricValues[0].value),
    users: Number(r.metricValues[1].value),
  }));
}

// ── Build Slack Report ────────────────────────────────────
function buildReport(overview, sources, devices, topPages, landingPages, affiliateClicks, geo) {
  const blocks = [];
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-GB', { timeZone: 'Europe/London', weekday: 'long', day: 'numeric', month: 'long' });

  blocks.push(slackHeader(`GA4 Daily Briefing — ${yesterday}`));

  // Overview
  const o = overview;
  blocks.push(slackFields([
    ['Sessions', `${fmtNum(o.sessions.val)}${delta(o.sessions.val, o.sessions.prev)}`],
    ['Users', `${fmtNum(o.users.val)}${delta(o.users.val, o.users.prev)}`],
    ['Pageviews', `${fmtNum(o.pageviews.val)}${delta(o.pageviews.val, o.pageviews.prev)}`],
    ['Bounce Rate', `${fmtPct(o.bounceRate.val)}${delta(o.bounceRate.val, o.bounceRate.prev)}`],
    ['Avg Duration', `${Math.round(o.avgDuration.val)}s${delta(o.avgDuration.val, o.avgDuration.prev)}`],
    ['New Users', `${fmtNum(o.newUsers.val)}${delta(o.newUsers.val, o.newUsers.prev)}`],
  ]));

  blocks.push(slackDivider());

  // Sources
  if (sources.length > 0) {
    const totalSessions = sources.reduce((s, r) => s + r.sessions, 0);
    const sourceLines = sources.map(s => {
      const pct = totalSessions > 0 ? ((s.sessions / totalSessions) * 100).toFixed(0) : 0;
      return `• *${s.channel}*: ${fmtNum(s.sessions)} sessions (${pct}%)`;
    }).join('\n');
    blocks.push(slackSection(`:signal_strength: *Traffic Sources*\n${sourceLines}`));
    blocks.push(slackDivider());
  }

  // Devices
  if (devices.length > 0) {
    const totalDev = devices.reduce((s, r) => s + r.sessions, 0);
    const deviceLine = devices.map(d => {
      const pct = totalDev > 0 ? ((d.sessions / totalDev) * 100).toFixed(0) : 0;
      const icon = d.device === 'desktop' ? ':desktop_computer:' : d.device === 'mobile' ? ':iphone:' : ':ipad:';
      return `${icon} ${d.device}: ${fmtNum(d.sessions)} (${pct}%)`;
    }).join('  |  ');
    blocks.push(slackSection(`*Devices:* ${deviceLine}`));
    blocks.push(slackDivider());
  }

  // Top Pages
  if (topPages.length > 0) {
    const pageLines = topPages.slice(0, 10).map((p, i) =>
      `${i + 1}. \`${p.path}\` — ${fmtNum(p.pageviews)} views`
    ).join('\n');
    blocks.push(slackSection(`:bar_chart: *Top Pages*\n${pageLines}`));
    blocks.push(slackDivider());
  }

  // Landing Pages
  if (landingPages.length > 0) {
    const landingLines = landingPages.slice(0, 5).map((p, i) =>
      `${i + 1}. \`${p.path}\` — ${fmtNum(p.sessions)} entries (${fmtPct(p.bounceRate)} bounce)`
    ).join('\n');
    blocks.push(slackSection(`:door: *Top Landing Pages*\n${landingLines}`));
    blocks.push(slackDivider());
  }

  // Affiliate Clicks
  if (affiliateClicks.length > 0) {
    const totalClicks = affiliateClicks.reduce((s, r) => s + r.count, 0);
    const clickLines = affiliateClicks.slice(0, 8).map(c =>
      `• ${c.event} on \`${c.page}\` — ${c.count}x`
    ).join('\n');
    blocks.push(slackSection(`:moneybag: *Affiliate / Outbound Clicks* (${fmtNum(totalClicks)} total)\n${clickLines}`));
    blocks.push(slackDivider());
  } else {
    blocks.push(slackSection(':moneybag: *Affiliate Clicks:* No click events recorded yesterday.'));
    blocks.push(slackDivider());
  }

  // Geo
  if (geo.length > 0) {
    const geoLine = geo.map(g => `${g.country}: ${fmtNum(g.sessions)}`).join('  •  ');
    blocks.push(slackSection(`:earth_americas: *Top Countries:* ${geoLine}`));
  }

  return blocks;
}

// ── Main ──────────────────────────────────────────────────
export async function run() {
  log.info('GA4 Daily Briefing starting...');

  const auth = getOAuth2Client();
  const analytics = google.analyticsdata({ version: 'v1beta', auth });

  const [overview, sources, devices, topPages, landingPages, affiliateClicks, geo] = await Promise.all([
    getOverview(analytics),
    getSources(analytics),
    getDevices(analytics),
    getTopPages(analytics),
    getLandingPages(analytics),
    getAffiliateClicks(analytics).catch(e => { log.warn(`Affiliate clicks: ${e.message}`); return []; }),
    getGeo(analytics),
  ]);

  const report = buildReport(overview, sources, devices, topPages, landingPages, affiliateClicks, geo);
  await sendSlack(report, 'GA4 Daily Briefing');

  const totalSessions = overview.sessions.val;
  const totalClicks = affiliateClicks.reduce((s, r) => s + r.count, 0);
  log.info(`Briefing sent: ${totalSessions} sessions, ${topPages.length} pages, ${totalClicks} affiliate clicks`);

  return { sessions: totalSessions, affiliateClicks: totalClicks };
}
