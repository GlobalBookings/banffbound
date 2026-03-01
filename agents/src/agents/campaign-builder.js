import { GoogleAdsApi, enums, ResourceNames } from 'google-ads-api';
import { createLogger } from '../core/logger.js';
import { sendSlack, slackHeader, slackSection, slackDivider } from '../core/slack.js';
import { CAMPAIGN_STRUCTURE, GLOBAL_NEGATIVES } from '../data/ppc-strategy.js';

const log = createLogger('campaign-builder');
const SITE = process.env.SITE_URL || 'https://banffbound.com';
const CID = process.env.GOOGLE_ADS_CUSTOMER_ID;

function getCustomer() {
  const client = new GoogleAdsApi({
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
  });

  return client.Customer({
    customer_id: CID,
    login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || CID,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
}

// ── Create a campaign budget ──────────────────────────────
async function createBudget(customer, name, dailyAmount) {
  log.info(`  Creating budget: ${name} ($${dailyAmount}/day)`);

  const result = await customer.campaignBudgets.create([{
    name: `${name}-Budget`,
    amount_micros: Math.round(dailyAmount * 1_000_000),
    delivery_method: enums.BudgetDeliveryMethod.STANDARD,
    explicitly_shared: false,
  }]);

  const budgetResourceName = result.results[0].resource_name;
  log.info(`    Budget created: ${budgetResourceName}`);
  return budgetResourceName;
}

// ── Create a campaign ─────────────────────────────────────
async function createCampaign(customer, name, config, budgetResourceName) {
  log.info(`  Creating campaign: ${name}`);

  const campaignData = {
    name,
    status: enums.CampaignStatus.PAUSED,
    advertising_channel_type: enums.AdvertisingChannelType.SEARCH,
    campaign_budget: budgetResourceName,
    contains_eu_political_advertising: enums.EuPoliticalAdvertisingStatus.DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING,
    network_settings: {
      target_google_search: true,
      target_search_network: false,
      target_content_network: false,
      target_partner_search_network: false,
    },
  };

  if (config.biddingStrategy === 'MAXIMIZE_CONVERSIONS') {
    campaignData.maximize_conversions = {};
    if (config.targetCpa) {
      campaignData.maximize_conversions.target_cpa_micros = Math.round(config.targetCpa * 1_000_000);
    }
  } else {
    campaignData.target_spend = {};
    if (config.maxCpc) {
      campaignData.target_spend.cpc_bid_ceiling_micros = Math.round(config.maxCpc * 1_000_000);
    }
  }

  const result = await customer.campaigns.create([campaignData]);
  const campaignResourceName = result.results[0].resource_name;
  log.info(`    Campaign created: ${campaignResourceName}`);
  return campaignResourceName;
}

// ── Create an ad group ────────────────────────────────────
async function createAdGroup(customer, campaignResourceName, agConfig) {
  log.info(`    Creating ad group: ${agConfig.name}`);

  const result = await customer.adGroups.create([{
    campaign: campaignResourceName,
    name: agConfig.name,
    status: enums.AdGroupStatus.ENABLED,
    type: enums.AdGroupType.SEARCH_STANDARD,
  }]);

  const adGroupResourceName = result.results[0].resource_name;

  // Add keywords
  const keywordOps = agConfig.keywords.map(kw => ({
    ad_group: adGroupResourceName,
    status: enums.AdGroupCriterionStatus.ENABLED,
    keyword: {
      text: kw.text,
      match_type: kw.matchType === 'EXACT'
        ? enums.KeywordMatchType.EXACT
        : kw.matchType === 'BROAD'
          ? enums.KeywordMatchType.BROAD
          : enums.KeywordMatchType.PHRASE,
    },
  }));

  if (keywordOps.length > 0) {
    await customer.adGroupCriteria.create(keywordOps);
    log.info(`      Added ${keywordOps.length} keywords`);
  }

  // Add ad-group-level negative keywords
  if (agConfig.negativeKeywords?.length > 0) {
    const negOps = agConfig.negativeKeywords.map(text => ({
      ad_group: adGroupResourceName,
      status: enums.AdGroupCriterionStatus.ENABLED,
      negative: true,
      keyword: {
        text,
        match_type: enums.KeywordMatchType.PHRASE,
      },
    }));
    await customer.adGroupCriteria.create(negOps);
    log.info(`      Added ${negOps.length} ad-group negative keywords`);
  }

  // Create responsive search ads
  for (const adSpec of agConfig.ads) {
    const finalUrl = `${SITE}${agConfig.landingPage}`;
    await customer.adGroupAds.create([{
      ad_group: adGroupResourceName,
      status: enums.AdGroupAdStatus.ENABLED,
      ad: {
        responsive_search_ad: {
          headlines: adSpec.headlines.map((text, i) => ({
            text,
            pinned_field: i === 0 ? enums.ServedAssetFieldType.HEADLINE_1 : null,
          })),
          descriptions: adSpec.descriptions.map(text => ({ text })),
        },
        final_urls: [finalUrl],
        tracking_url_template:
          `${finalUrl}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_content={adgroupid}`,
      },
    }]);
    log.info(`      Created responsive search ad -> ${finalUrl}`);
  }

  return adGroupResourceName;
}

// ── Add global negative keywords to all campaigns ─────────
async function addGlobalNegatives(customer, campaignResourceNames) {
  log.info('  Adding global negative keywords...');

  for (const campaignRn of campaignResourceNames) {
    const negOps = GLOBAL_NEGATIVES.map(text => ({
      campaign: campaignRn,
      negative: true,
      keyword: {
        text,
        match_type: enums.KeywordMatchType.PHRASE,
      },
    }));

    await customer.campaignCriteria.create(negOps);
  }

  log.info(`    Added ${GLOBAL_NEGATIVES.length} negative keywords to ${campaignResourceNames.length} campaigns`);
}

// ── Main: Deploy all campaigns ────────────────────────────
export async function run() {
  log.info('Campaign Builder starting...');

  const customer = getCustomer();
  const campaignResourceNames = [];
  const summary = [];

  for (const [campaignName, config] of Object.entries(CAMPAIGN_STRUCTURE)) {
    try {
      // Step 1: Create budget
      const budgetRn = await createBudget(customer, campaignName, config.budget);

      // Step 2: Create campaign referencing budget
      const campaignRn = await createCampaign(customer, campaignName, config, budgetRn);
      campaignResourceNames.push(campaignRn);

      // Step 3: Create ad groups with keywords and ads
      let totalKeywords = 0;
      let totalAdGroups = 0;

      for (const ag of config.adGroups) {
        await createAdGroup(customer, campaignRn, ag);
        totalAdGroups++;
        totalKeywords += ag.keywords.length;
      }

      summary.push({
        name: campaignName,
        budget: config.budget,
        adGroups: totalAdGroups,
        keywords: totalKeywords,
        status: 'PAUSED (ready for review)',
      });

      log.info(`  ${campaignName}: ${totalAdGroups} ad groups, ${totalKeywords} keywords`);

    } catch (err) {
      const msg = err.message || JSON.stringify(err.errors || err);
      log.error(`Failed to create campaign ${campaignName}: ${msg}`);
      if (err.errors) log.error(`  Details: ${JSON.stringify(err.errors)}`);
      summary.push({ name: campaignName, status: `FAILED: ${msg}` });
    }
  }

  // Step 4: Global negatives
  if (campaignResourceNames.length > 0) {
    try {
      await addGlobalNegatives(customer, campaignResourceNames);
    } catch (err) {
      log.warn(`Failed to add global negatives: ${err.message}`);
    }
  }

  // Step 5: Slack report
  const blocks = [
    slackHeader('Campaign Builder -- Deployment Complete'),
    slackSection(`:rocket: Created ${summary.filter(s => !s.status?.startsWith('FAILED')).length} campaigns`),
    slackDivider(),
  ];

  for (const s of summary) {
    if (s.budget) {
      blocks.push(slackSection(
        `*${s.name}*\n` +
        `${s.adGroups} ad groups | ${s.keywords} keywords | $${s.budget}/day budget\n` +
        `Status: ${s.status}`
      ));
    } else {
      blocks.push(slackSection(`*${s.name}* -- ${s.status}`));
    }
  }

  const totalBudget = summary.reduce((s, c) => s + (c.budget || 0), 0);
  const totalKw = summary.reduce((s, c) => s + (c.keywords || 0), 0);

  blocks.push(slackDivider());
  blocks.push(slackSection(
    `:moneybag: *Total daily budget: $${totalBudget.toFixed(2)} CAD* (~$${(totalBudget * 30).toFixed(0)}/month)\n` +
    `*Total keywords: ${totalKw}*\n\n` +
    `All campaigns created as *PAUSED*. Review in Google Ads, then enable when ready.`
  ));

  await sendSlack(blocks, 'Campaign Builder Complete');

  log.info('Campaign Builder complete');
  return { campaigns: summary.length, totalBudget, totalKeywords: totalKw };
}
