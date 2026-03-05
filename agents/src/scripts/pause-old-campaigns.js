import 'dotenv/config';
import { GoogleAdsApi, enums } from 'google-ads-api';

const OLD_CAMPAIGNS = ['BB-Hotels-Search', 'BB-Tours-Search', 'BB-Planning-Search'];
const NEW_CAMPAIGNS = ['BB-Hotels-Book', 'BB-Tours-Book'];

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

async function run() {
  const customer = getCustomer();

  // Get all BB- campaigns
  const campaigns = await customer.query(`
    SELECT campaign.id, campaign.name, campaign.resource_name, campaign.status
    FROM campaign
    WHERE campaign.status != 'REMOVED'
      AND campaign.name LIKE 'BB-%'
  `);

  console.log(`Found ${campaigns.length} BB- campaigns:\n`);
  for (const c of campaigns) {
    console.log(`  ${c.campaign.name} — ${c.campaign.status === 2 ? 'ENABLED' : c.campaign.status === 3 ? 'PAUSED' : c.campaign.status}`);
  }

  // Pause old campaigns
  const toPause = campaigns.filter(c =>
    OLD_CAMPAIGNS.includes(c.campaign.name) &&
    (c.campaign.status === 2 || c.campaign.status === 'ENABLED')
  );

  if (toPause.length > 0) {
    console.log(`\nPausing ${toPause.length} old campaigns...`);
    for (const c of toPause) {
      await customer.campaigns.update([{
        resource_name: c.campaign.resource_name,
        status: enums.CampaignStatus.PAUSED,
      }]);
      console.log(`  PAUSED: ${c.campaign.name}`);
    }
  } else {
    console.log('\nNo old campaigns to pause (already paused or not found).');
  }

  // Enable new campaigns
  const toEnable = campaigns.filter(c =>
    NEW_CAMPAIGNS.includes(c.campaign.name) &&
    (c.campaign.status === 3 || c.campaign.status === 'PAUSED')
  );

  if (toEnable.length > 0) {
    console.log(`\nEnabling ${toEnable.length} new lean campaigns...`);
    for (const c of toEnable) {
      await customer.campaigns.update([{
        resource_name: c.campaign.resource_name,
        status: enums.CampaignStatus.ENABLED,
      }]);
      console.log(`  ENABLED: ${c.campaign.name}`);
    }
  } else {
    console.log('\nNew campaigns already enabled or not found.');
  }

  console.log('\nDone. Old campaigns paused, new lean campaigns live.');
}

run().catch(err => {
  console.error('Failed:', err.message);
  process.exit(1);
});
