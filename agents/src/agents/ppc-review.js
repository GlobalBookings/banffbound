import { GoogleAdsApi, enums } from 'google-ads-api';
import { createLogger } from '../core/logger.js';
import { sendSlack, slackHeader, slackSection, slackDivider, slackFields } from '../core/slack.js';
import { requestApproval } from '../core/approval.js';
import { fmtMoney, fmtPercent, fmtNumber } from '../utils/currency.js';
import { OPTIMIZATION_RULES } from '../data/ppc-strategy.js';
import { getSalesSummary } from './inbox-monitor.js';

const log = createLogger('ppc-review');

const RULES = {
  HIGH_CPA_MULTIPLIER: OPTIMIZATION_RULES.bidDecreaseThreshold.cpaMultiplier,
  LOW_CTR_THRESHOLD: 0.02,
  LOW_QUALITY_SCORE: 5,
  WASTE_SPEND_THRESHOLD: OPTIMIZATION_RULES.pauseWasteThreshold.spend * 1_000_000,
  NEG_SPEND_THRESHOLD: OPTIMIZATION_RULES.negativeKeywordThreshold.spend * 1_000_000,
  MIN_IMPRESSIONS_FOR_REVIEW: 20,
};

function getCustomer() {
  const client = new GoogleAdsApi({
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
  });
  return client.Customer({
    customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
    login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || process.env.GOOGLE_ADS_CUSTOMER_ID,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
}

// ── Data fetchers ─────────────────────────────────────────

async function getAccountOverview(customer) {
  const [result] = await customer.query(`
    SELECT metrics.impressions, metrics.clicks, metrics.cost_micros,
           metrics.conversions, metrics.ctr, metrics.average_cpc,
           metrics.cost_per_conversion
    FROM customer WHERE segments.date DURING LAST_7_DAYS
  `);
  return result?.metrics || null;
}

async function getCampaignPerformance(customer) {
  return customer.query(`
    SELECT campaign.id, campaign.name, campaign.status,
           metrics.impressions, metrics.clicks, metrics.cost_micros,
           metrics.conversions, metrics.ctr, metrics.average_cpc
    FROM campaign
    WHERE segments.date DURING LAST_7_DAYS
      AND campaign.status != 'REMOVED'
      AND campaign.name LIKE 'BB-%'
    ORDER BY metrics.cost_micros DESC
  `);
}

async function getWastefulKeywords(customer) {
  const results = await customer.query(`
    SELECT ad_group.name, ad_group_criterion.resource_name,
           ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type,
           ad_group_criterion.quality_info.quality_score,
           campaign.name,
           metrics.impressions, metrics.clicks, metrics.cost_micros,
           metrics.conversions, metrics.ctr
    FROM keyword_view
    WHERE segments.date DURING LAST_7_DAYS
      AND metrics.impressions > ${RULES.MIN_IMPRESSIONS_FOR_REVIEW}
      AND campaign.name LIKE 'BB-%'
    ORDER BY metrics.cost_micros DESC
    LIMIT 200
  `);

  const wasteful = [];
  for (const row of results) {
    const m = row.metrics;
    const kw = row.ad_group_criterion?.keyword;
    const qs = row.ad_group_criterion?.quality_info?.quality_score;
    const reasons = [];

    if (m.cost_micros > RULES.WASTE_SPEND_THRESHOLD && m.conversions === 0)
      reasons.push(`Spent ${fmtMoney(m.cost_micros)} with 0 conversions`);
    if (m.ctr < RULES.LOW_CTR_THRESHOLD && m.impressions > 500)
      reasons.push(`CTR ${fmtPercent(m.ctr)}`);
    if (qs && qs < RULES.LOW_QUALITY_SCORE)
      reasons.push(`QS ${qs}/10`);

    if (reasons.length > 0) {
      wasteful.push({
        keyword: kw?.text || '?',
        matchType: kw?.match_type || '?',
        adGroup: row.ad_group?.name || '?',
        resourceName: row.ad_group_criterion?.resource_name,
        spend: m.cost_micros,
        clicks: m.clicks,
        impressions: m.impressions,
        conversions: m.conversions,
        ctr: m.ctr,
        qualityScore: qs,
        reasons,
      });
    }
  }
  return wasteful.sort((a, b) => b.spend - a.spend);
}

async function getSearchTerms(customer) {
  return customer.query(`
    SELECT search_term_view.search_term, search_term_view.status,
           campaign.name, campaign.resource_name,
           metrics.impressions, metrics.clicks, metrics.cost_micros,
           metrics.conversions, metrics.ctr
    FROM search_term_view
    WHERE segments.date DURING LAST_7_DAYS
      AND metrics.impressions > 10
      AND campaign.name LIKE 'BB-%'
    ORDER BY metrics.cost_micros DESC
    LIMIT 200
  `);
}

// ── Propose actions from analysis ─────────────────────────

function buildProposedActions(wasteful, searchTerms) {
  const actions = [];

  // 1. Pause wasteful keywords (high spend, zero conversions)
  for (const w of wasteful) {
    if (w.spend > RULES.WASTE_SPEND_THRESHOLD && w.conversions === 0 && w.resourceName) {
      actions.push({
        type: 'PAUSE_KEYWORD',
        resourceName: w.resourceName,
        keyword: w.keyword,
        matchType: w.matchType,
        adGroup: w.adGroup,
        reason: w.reasons.join('; '),
        spend: w.spend,
      });
    }
  }

  // 2. Add negative keywords from bleeding search terms
  const minClicks = OPTIMIZATION_RULES.negativeKeywordThreshold.minClicks || 5;
  const bleedingTerms = searchTerms.filter(
    s => s.metrics.conversions === 0 &&
         s.metrics.cost_micros > RULES.NEG_SPEND_THRESHOLD &&
         s.metrics.clicks >= minClicks
  );
  for (const s of bleedingTerms) {
    actions.push({
      type: 'ADD_NEGATIVE',
      campaignResourceName: s.campaign?.resource_name,
      campaignName: s.campaign?.name,
      searchTerm: s.search_term_view?.search_term,
      spend: s.metrics.cost_micros,
      clicks: s.metrics.clicks,
    });
  }

  return actions;
}

// ── Execute approved actions ──────────────────────────────

async function executeActions(actions) {
  const customer = getCustomer();
  let paused = 0;
  let negatives = 0;
  const errors = [];

  // Pause keywords
  const toPause = actions.filter(a => a.type === 'PAUSE_KEYWORD');
  if (toPause.length > 0) {
    try {
      await customer.adGroupCriteria.update(
        toPause.map(a => ({
          resource_name: a.resourceName,
          status: enums.AdGroupCriterionStatus.PAUSED,
        }))
      );
      paused = toPause.length;
      log.info(`Paused ${paused} keywords`);
    } catch (err) {
      errors.push(`Pause keywords: ${err.message}`);
      log.error(`Failed to pause keywords: ${err.message}`);
    }
  }

  // Add campaign-level negative keywords
  const toNegate = actions.filter(a => a.type === 'ADD_NEGATIVE');
  // Group by campaign
  const byCampaign = {};
  for (const a of toNegate) {
    if (!a.campaignResourceName) continue;
    if (!byCampaign[a.campaignResourceName]) byCampaign[a.campaignResourceName] = [];
    byCampaign[a.campaignResourceName].push(a.searchTerm);
  }

  for (const [campaignRn, terms] of Object.entries(byCampaign)) {
    try {
      await customer.campaignCriteria.create(
        terms.map(text => ({
          campaign: campaignRn,
          negative: true,
          keyword: {
            text,
            match_type: enums.KeywordMatchType.EXACT,
          },
        }))
      );
      negatives += terms.length;
      log.info(`Added ${terms.length} negatives to ${campaignRn}`);
    } catch (err) {
      errors.push(`Add negatives to ${campaignRn}: ${err.message}`);
      log.error(`Failed to add negatives: ${err.message}`);
    }
  }

  const summary = [];
  if (paused > 0) summary.push(`Paused ${paused} keywords`);
  if (negatives > 0) summary.push(`Added ${negatives} negative keywords`);
  if (errors.length > 0) summary.push(`${errors.length} errors: ${errors.join('; ')}`);

  return summary.join('\n') || 'No changes needed.';
}

// ── Build Slack report ────────────────────────────────────

function buildReport(overview, campaigns, wasteful, searchTerms, proposedActions) {
  const blocks = [];
  const now = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Edmonton' });

  blocks.push(slackHeader(`PPC Daily Review — ${now}`));

  if (overview) {
    blocks.push(slackFields([
      ['Impressions', fmtNumber(overview.impressions)],
      ['Clicks', fmtNumber(overview.clicks)],
      ['Spend', fmtMoney(overview.cost_micros)],
      ['Conversions', String(overview.conversions || 0)],
      ['CTR', fmtPercent(overview.ctr)],
      ['Avg CPC', fmtMoney(overview.average_cpc)],
    ]));
  } else {
    blocks.push(slackSection('_No data yet (campaigns may be paused or new)_'));
  }

  blocks.push(slackDivider());

  // ── Affiliate Revenue & ROAS ──
  let salesSummary;
  try { salesSummary = getSalesSummary(7); } catch { salesSummary = null; }

  if (salesSummary && salesSummary.totalSales > 0) {
    const spendCAD = overview ? (overview.cost_micros || 0) / 1_000_000 : 0;
    const roas = spendCAD > 0 ? (salesSummary.totalCommission / spendCAD).toFixed(2) : 'N/A';
    const roasEmoji = roas === 'N/A' ? ':bar_chart:' : parseFloat(roas) >= 1 ? ':chart_with_upwards_trend:' : ':chart_with_downwards_trend:';

    blocks.push(slackSection(`${roasEmoji} *Affiliate Revenue (7d)*`));
    blocks.push(slackFields([
      ['Sales', String(salesSummary.totalSales)],
      ['Booking Revenue', `$${salesSummary.totalRevenue.toFixed(2)}`],
      ['Commission Earned', `$${salesSummary.totalCommission.toFixed(2)}`],
      ['ROAS (comm/spend)', `${roas}x`],
    ]));

    // Per-partner breakdown
    for (const [partner, stats] of Object.entries(salesSummary.byPartner)) {
      blocks.push(slackSection(
        `• *${partner.toUpperCase()}:* ${stats.count} sales, $${stats.revenue.toFixed(2)} rev, $${stats.commission.toFixed(2)} comm`
      ));
    }

    // Top products
    const topProducts = Object.entries(salesSummary.byProduct)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3);
    if (topProducts.length > 0) {
      const productList = topProducts.map(([name, s]) =>
        `• ${name} (${s.count}x, $${s.revenue.toFixed(2)})`
      ).join('\n');
      blocks.push(slackSection(`*Top Products:*\n${productList}`));
    }

    // All-time running total
    blocks.push(slackSection(
      `_All-time: ${salesSummary.allTime.count} sales, $${salesSummary.allTime.commission.toFixed(2)} commission_`
    ));

    blocks.push(slackDivider());
  } else {
    blocks.push(slackSection(':moneybag: _No affiliate sales recorded in last 7 days_'));
    blocks.push(slackDivider());
  }

  // Campaign breakdown
  const active = campaigns.filter(c => c.campaign?.status === 2 || c.campaign?.status === 'ENABLED');
  const paused = campaigns.filter(c => c.campaign?.status === 3 || c.campaign?.status === 'PAUSED');

  blocks.push(slackSection(`*Campaigns:* ${active.length} active, ${paused.length} paused`));

  for (const c of active.slice(0, 5)) {
    const m = c.metrics;
    blocks.push(slackSection(
      `*${c.campaign.name}*\n` +
      `${fmtNumber(m.impressions)} impr · ${fmtNumber(m.clicks)} clicks · ` +
      `${fmtMoney(m.cost_micros)} spend · ${m.conversions || 0} conv`
    ));
  }

  blocks.push(slackDivider());

  // Waste alerts
  if (wasteful.length > 0) {
    blocks.push(slackSection(`:warning: *${wasteful.length} Wasteful Keywords*`));
    for (const w of wasteful.slice(0, 6)) {
      blocks.push(slackSection(
        `• \`${w.keyword}\` [${w.matchType}] — ${fmtMoney(w.spend)}, ${w.clicks} clicks, ${w.conversions} conv\n  _${w.reasons.join(' · ')}_`
      ));
    }
    if (wasteful.length > 6) blocks.push(slackSection(`_...and ${wasteful.length - 6} more_`));
  } else {
    blocks.push(slackSection(':white_check_mark: No wasteful keywords'));
  }

  blocks.push(slackDivider());

  // Proposed actions summary
  const pauseActions = proposedActions.filter(a => a.type === 'PAUSE_KEYWORD');
  const negActions = proposedActions.filter(a => a.type === 'ADD_NEGATIVE');

  if (proposedActions.length > 0) {
    blocks.push(slackSection(`:robot_face: *Proposed Changes (${proposedActions.length})*`));

    if (pauseActions.length > 0) {
      const kwList = pauseActions.slice(0, 5).map(a =>
        `• Pause \`${a.keyword}\` in ${a.adGroup} (${fmtMoney(a.spend)} wasted)`
      ).join('\n');
      blocks.push(slackSection(`*Pause ${pauseActions.length} keywords:*\n${kwList}`));
      if (pauseActions.length > 5) blocks.push(slackSection(`_...and ${pauseActions.length - 5} more_`));
    }

    if (negActions.length > 0) {
      const negList = negActions.slice(0, 5).map(a =>
        `• Negate "${a.searchTerm}" in ${a.campaignName} (${fmtMoney(a.spend)} spent)`
      ).join('\n');
      blocks.push(slackSection(`*Add ${negActions.length} negative keywords:*\n${negList}`));
      if (negActions.length > 5) blocks.push(slackSection(`_...and ${negActions.length - 5} more_`));
    }

    const totalSaved = proposedActions.reduce((s, a) => s + (a.spend || 0), 0);
    blocks.push(slackSection(`_Estimated weekly savings: *${fmtMoney(totalSaved)}*_`));
  } else {
    blocks.push(slackSection(':white_check_mark: No changes needed — campaigns look healthy.'));
  }

  return blocks;
}

// ── Main ──────────────────────────────────────────────────

export async function run() {
  log.info('Starting PPC Review...');

  const customer = getCustomer();

  const [overview, campaigns, wasteful, searchTerms] = await Promise.all([
    getAccountOverview(customer).catch(e => { log.warn(`Overview: ${e.message}`); return null; }),
    getCampaignPerformance(customer).catch(e => { log.warn(`Campaigns: ${e.message}`); return []; }),
    getWastefulKeywords(customer).catch(e => { log.warn(`Wasteful: ${e.message}`); return []; }),
    getSearchTerms(customer).catch(e => { log.warn(`Search terms: ${e.message}`); return []; }),
  ]);

  const proposedActions = buildProposedActions(wasteful, searchTerms);
  const report = buildReport(overview, campaigns, wasteful, searchTerms, proposedActions);

  if (proposedActions.length > 0) {
    // Send report with approval buttons
    const proposalId = `ppc-${Date.now()}`;
    await requestApproval(proposalId, report, proposedActions, () => executeActions(proposedActions));
    log.info(`Sent ${proposedActions.length} actions for approval (${proposalId})`);
  } else {
    // No actions needed, just send the report
    await sendSlack(report, 'PPC Daily Review');
    log.info('No actions proposed — healthy report sent');
  }

  log.info(`Review complete: ${campaigns.length} campaigns, ${wasteful.length} wasteful, ${proposedActions.length} proposed actions`);

  return {
    campaigns: campaigns.length,
    wastefulKeywords: wasteful.length,
    proposedActions: proposedActions.length,
  };
}
