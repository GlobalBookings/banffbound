import { GoogleAdsApi, enums } from 'google-ads-api';
import { createLogger } from '../core/logger.js';
import { sendSlack, slackHeader, slackSection, slackDivider } from '../core/slack.js';

const log = createLogger('asset-builder');
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

const SITELINKS = [
  { text: 'Compare 95+ Hotels', description1: 'Browse every Banff hotel.', description2: 'Real reviews, maps & prices.', url: '/hotel-directory' },
  { text: 'Book Tours & Activities', description1: 'Gondola, wildlife & glacier tours.', description2: 'Book online — skip the queue.', url: '/tours' },
  { text: 'Banff Gondola Tickets', description1: 'Ride to 2,281m on Sulphur Mtn.', description2: 'From $76 — book ahead & save.', url: '/blog/banff-gondola-tickets-guide' },
  { text: 'Interactive Trail Map', description1: '70+ hiking trails with GPS data.', description2: 'Filter by difficulty & length.', url: '/trail-map' },
  { text: 'Trip Cost Calculator', description1: 'Budget, mid-range & luxury.', description2: 'Real 2026 prices & tips.', url: '/blog/banff-trip-cost-budget-guide' },
  { text: 'Best Banff Restaurants', description1: '15 local picks for every budget.', description2: 'Menus, hours & reservations.', url: '/blog/best-banff-restaurants-where-to-eat' },
  { text: 'Weather & Webcams', description1: 'Live Banff conditions right now.', description2: 'Snow reports for 3 ski resorts.', url: '/weather-webcams' },
  { text: 'Skiing in Banff', description1: 'Louise, Sunshine & Norquay.', description2: 'Lift passes, snow & deals.', url: '/skiing' },
];

const CALLOUTS = [
  '95+ Hotels Compared',
  'Free Trip Planner Tool',
  '70+ Hiking Trails',
  'Live Weather & Webcams',
  'Expert Local Guides',
  'Book Tours Online',
  'Interactive Maps',
  'Real Reviews & Photos',
  '2026 Updated Prices',
  'Trusted by Thousands',
];

const STRUCTURED_SNIPPETS = [
  { header: 'Destinations', values: ['Banff', 'Lake Louise', 'Canmore', 'Icefields Parkway', 'Moraine Lake', 'Johnston Canyon'] },
  { header: 'Amenities', values: ['Interactive Maps', 'Booking Links', 'Live Webcams', 'Trail GPS Data', 'Weather Forecasts', 'Restaurant Menus'] },
  { header: 'Types', values: ['Hotels', 'Tours', 'Hiking Trails', 'Ski Resorts', 'Restaurants', 'Activities'] },
];

export async function run() {
  log.info('Asset Builder starting...');
  const customer = getCustomer();
  const results = { sitelinks: 0, callouts: 0, snippets: 0, errors: [] };

  // 1. Create sitelink assets
  log.info('Creating sitelink assets...');
  try {
    const sitelinkAssets = SITELINKS.map(sl => ({
      sitelink_asset: {
        link_text: sl.text,
        description1: sl.description1,
        description2: sl.description2,
      },
      final_urls: [`${SITE}${sl.url}`],
    }));

    const slResult = await customer.assets.create(sitelinkAssets);
    const sitelinkResourceNames = slResult.results.map(r => r.resource_name);
    results.sitelinks = sitelinkResourceNames.length;
    log.info(`  Created ${results.sitelinks} sitelink assets`);

    // Link sitelinks at customer level
    const customerResourceName = `customers/${CID}`;
    await customer.customerAssets.create(
      sitelinkResourceNames.map(rn => ({
        asset: rn,
        field_type: enums.AssetFieldType.SITELINK,
      }))
    );
    log.info('  Linked sitelinks to account');
  } catch (err) {
    const msg = err.message || JSON.stringify(err.errors || err);
    log.error(`  Sitelinks failed: ${msg}`);
    results.errors.push(`Sitelinks: ${msg}`);
  }

  // 2. Create callout assets
  log.info('Creating callout assets...');
  try {
    const calloutAssets = CALLOUTS.map(text => ({
      callout_asset: { callout_text: text },
    }));

    const coResult = await customer.assets.create(calloutAssets);
    const calloutResourceNames = coResult.results.map(r => r.resource_name);
    results.callouts = calloutResourceNames.length;
    log.info(`  Created ${results.callouts} callout assets`);

    await customer.customerAssets.create(
      calloutResourceNames.map(rn => ({
        asset: rn,
        field_type: enums.AssetFieldType.CALLOUT,
      }))
    );
    log.info('  Linked callouts to account');
  } catch (err) {
    const msg = err.message || JSON.stringify(err.errors || err);
    log.error(`  Callouts failed: ${msg}`);
    results.errors.push(`Callouts: ${msg}`);
  }

  // 3. Create structured snippet assets
  log.info('Creating structured snippet assets...');
  try {
    const snippetAssets = STRUCTURED_SNIPPETS.map(sn => ({
      structured_snippet_asset: {
        header: sn.header,
        values: sn.values,
      },
    }));

    const snResult = await customer.assets.create(snippetAssets);
    const snippetResourceNames = snResult.results.map(r => r.resource_name);
    results.snippets = snippetResourceNames.length;
    log.info(`  Created ${results.snippets} structured snippet assets`);

    await customer.customerAssets.create(
      snippetResourceNames.map(rn => ({
        asset: rn,
        field_type: enums.AssetFieldType.STRUCTURED_SNIPPET,
      }))
    );
    log.info('  Linked structured snippets to account');
  } catch (err) {
    const msg = err.message || JSON.stringify(err.errors || err);
    log.error(`  Structured snippets failed: ${msg}`);
    results.errors.push(`Snippets: ${msg}`);
  }

  // Slack report
  const blocks = [
    slackHeader('Account Assets Created'),
    slackDivider(),
    slackSection(
      `:link: *${results.sitelinks} Sitelinks* — ${SITELINKS.map(s => s.text).join(', ')}\n\n` +
      `:mega: *${results.callouts} Callouts* — ${CALLOUTS.join(', ')}\n\n` +
      `:clipboard: *${results.snippets} Structured Snippets* — ${STRUCTURED_SNIPPETS.map(s => s.header).join(', ')}`
    ),
  ];

  if (results.errors.length > 0) {
    blocks.push(slackDivider());
    blocks.push(slackSection(`:warning: Errors:\n${results.errors.join('\n')}`));
  }

  await sendSlack(blocks, 'Account Assets Created');
  log.info(`Asset Builder complete: ${results.sitelinks} sitelinks, ${results.callouts} callouts, ${results.snippets} snippets`);

  return results;
}
