import { GoogleAdsApi, enums } from 'google-ads-api';
import { createLogger } from '../core/logger.js';
import { sendSlack, slackHeader, slackSection, slackDivider } from '../core/slack.js';
import { CAMPAIGN_STRUCTURE } from '../data/ppc-strategy.js';

const log = createLogger('campaign-updater');
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

// ── Fetch existing campaigns and ad groups ────────────────
async function getExistingStructure(customer) {
  const campaigns = await customer.query(`
    SELECT campaign.id, campaign.name, campaign.resource_name
    FROM campaign
    WHERE campaign.status != 'REMOVED'
      AND campaign.name LIKE 'BB-%'
  `);

  const structure = {};
  for (const c of campaigns) {
    const adGroups = await customer.query(`
      SELECT ad_group.id, ad_group.name, ad_group.resource_name
      FROM ad_group
      WHERE ad_group.campaign = '${c.campaign.resource_name}'
        AND ad_group.status != 'REMOVED'
    `);

    structure[c.campaign.name] = {
      resourceName: c.campaign.resource_name,
      id: c.campaign.id,
      adGroups: {},
    };

    for (const ag of adGroups) {
      structure[c.campaign.name].adGroups[ag.ad_group.name] = {
        resourceName: ag.ad_group.resource_name,
        id: ag.ad_group.id,
      };
    }
  }

  return structure;
}

// ── Remove old ads from an ad group ───────────────────────
async function removeOldAds(customer, adGroupResourceName) {
  const ads = await customer.query(`
    SELECT ad_group_ad.resource_name, ad_group_ad.ad.id
    FROM ad_group_ad
    WHERE ad_group_ad.ad_group = '${adGroupResourceName}'
      AND ad_group_ad.status != 'REMOVED'
  `);

  for (const ad of ads) {
    try {
      await customer.adGroupAds.update([{
        resource_name: ad.ad_group_ad.resource_name,
        status: enums.AdGroupAdStatus.REMOVED,
      }]);
    } catch (err) {
      log.warn(`  Failed to remove ad: ${err.message}`);
    }
  }

  return ads.length;
}

// ── Create new responsive search ad ───────────────────────
async function createAd(customer, adGroupResourceName, adSpec, landingPage) {
  const finalUrl = `${SITE}${landingPage}`;

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

  return finalUrl;
}

// ── Main ──────────────────────────────────────────────────
export async function run() {
  log.info('Campaign Updater starting...');

  const customer = getCustomer();
  const existing = await getExistingStructure(customer);

  log.info(`Found ${Object.keys(existing).length} existing BB- campaigns`);

  const results = [];

  for (const [campaignName, config] of Object.entries(CAMPAIGN_STRUCTURE)) {
    const campaign = existing[campaignName];
    if (!campaign) {
      log.warn(`Campaign "${campaignName}" not found in Google Ads -- skipping`);
      results.push({ campaign: campaignName, status: 'NOT FOUND' });
      continue;
    }

    log.info(`Updating campaign: ${campaignName}`);

    for (const agConfig of config.adGroups) {
      const ag = campaign.adGroups[agConfig.name];
      if (!ag) {
        log.warn(`  Ad group "${agConfig.name}" not found -- skipping`);
        results.push({ campaign: campaignName, adGroup: agConfig.name, status: 'NOT FOUND' });
        continue;
      }

      // Remove old ads
      const removed = await removeOldAds(customer, ag.resourceName);
      log.info(`  ${agConfig.name}: removed ${removed} old ads`);

      // Create new ads with 15 headlines + 4 descriptions
      for (const adSpec of agConfig.ads) {
        const url = await createAd(customer, ag.resourceName, adSpec, agConfig.landingPage);
        log.info(`  ${agConfig.name}: created new RSA -> ${url}`);
      }

      results.push({
        campaign: campaignName,
        adGroup: agConfig.name,
        landingPage: agConfig.landingPage,
        headlines: agConfig.ads[0]?.headlines.length || 0,
        descriptions: agConfig.ads[0]?.descriptions.length || 0,
        status: 'UPDATED',
      });
    }
  }

  // Slack report
  const updated = results.filter(r => r.status === 'UPDATED');
  const blocks = [
    slackHeader('Campaign Updater -- Ads Refreshed'),
    slackSection(`:white_check_mark: Updated ${updated.length} ad groups across ${Object.keys(existing).length} campaigns`),
    slackDivider(),
  ];

  for (const r of updated) {
    blocks.push(slackSection(
      `*${r.adGroup}* (${r.campaign})\n` +
      `→ ${r.landingPage} | ${r.headlines}h/${r.descriptions}d`
    ));
  }

  const notFound = results.filter(r => r.status !== 'UPDATED');
  if (notFound.length > 0) {
    blocks.push(slackDivider());
    blocks.push(slackSection(
      `:warning: ${notFound.length} not found:\n` +
      notFound.map(r => `• ${r.adGroup || r.campaign}`).join('\n')
    ));
  }

  await sendSlack(blocks, 'Campaign Updater Complete');
  log.info(`Campaign Updater complete: ${updated.length} updated, ${notFound.length} not found`);

  return { updated: updated.length, notFound: notFound.length };
}
