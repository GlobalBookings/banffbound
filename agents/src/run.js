import 'dotenv/config';
import { createLogger } from './core/logger.js';

const log = createLogger('runner');
const agent = process.argv[2];

if (!agent) {
  console.log('Usage: node src/run.js <agent-name>');
  console.log('  ppc-review         — Run PPC Review audit');
  console.log('  keyword-miner      — Run Keyword Miner');
  console.log('  campaign-builder   — Deploy PPC campaigns from strategy');
  console.log('  campaign-updater   — Update existing ads with new landing pages & copy');
  console.log('  asset-builder      — Create account-level sitelinks, callouts & snippets');
  console.log('  content-publisher  — Generate blog posts from content gaps');
  console.log('  test               — Verify configuration');
  process.exit(1);
}

if (agent === 'test') {
  log.info('Testing agent configuration...');

  const checks = [
    ['GOOGLE_CLIENT_ID', process.env.GOOGLE_CLIENT_ID],
    ['GOOGLE_CLIENT_SECRET', process.env.GOOGLE_CLIENT_SECRET],
    ['GOOGLE_REFRESH_TOKEN', process.env.GOOGLE_REFRESH_TOKEN],
    ['GOOGLE_ADS_CUSTOMER_ID', process.env.GOOGLE_ADS_CUSTOMER_ID],
    ['GOOGLE_ADS_DEVELOPER_TOKEN', process.env.GOOGLE_ADS_DEVELOPER_TOKEN],
    ['SEARCH_CONSOLE_SITE_URL', process.env.SEARCH_CONSOLE_SITE_URL],
    ['SLACK_WEBHOOK_URL', process.env.SLACK_WEBHOOK_URL],
  ];

  let allGood = true;
  for (const [name, value] of checks) {
    const status = value ? 'OK' : 'MISSING';
    const icon = value ? '✓' : '✗';
    if (!value) allGood = false;
    console.log(`  ${icon} ${name}: ${status}`);
  }

  if (allGood) {
    log.info('All credentials configured. Testing Slack...');
    const { sendSlack, slackSection } = await import('./core/slack.js');
    await sendSlack([slackSection(':white_check_mark: BanffBound Agent test — all systems go!')], 'Agent test');
    log.info('Slack test sent.');
  } else {
    log.warn('Some credentials are missing. See .env.example for required values.');
  }

  process.exit(0);
}

const agents = {
  'ppc-review': () => import('./agents/ppc-review.js'),
  'keyword-miner': () => import('./agents/keyword-miner.js'),
  'campaign-builder': () => import('./agents/campaign-builder.js'),
  'campaign-updater': () => import('./agents/campaign-updater.js'),
  'asset-builder': () => import('./agents/asset-builder.js'),
  'content-publisher': () => import('./agents/content-publisher.js'),
};

const loader = agents[agent];
if (!loader) {
  log.error(`Unknown agent: ${agent}`);
  log.info(`Available: ${Object.keys(agents).join(', ')}`);
  process.exit(1);
}

try {
  log.info(`Running ${agent}...`);
  const start = Date.now();
  const mod = await loader();
  const result = await mod.run();
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  log.info(`${agent} completed in ${elapsed}s`);
  if (result) log.info(`Result: ${JSON.stringify(result)}`);
} catch (err) {
  log.error(`${agent} failed: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
}
