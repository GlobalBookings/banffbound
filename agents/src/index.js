import 'dotenv/config';
import { schedule, listJobs } from './core/scheduler.js';
import { createLogger } from './core/logger.js';
import { sendSlack, slackHeader, slackSection } from './core/slack.js';
import { startApprovalServer } from './core/approval.js';
import { run as runPPC } from './agents/ppc-review.js';
import { run as runKeywords } from './agents/keyword-miner.js';
import { run as runContent } from './agents/content-publisher.js';

const log = createLogger('main');

log.info('BanffBound Agent System starting...');

// ── Start approval callback server ────────────────────────
const { registerTrigger } = startApprovalServer();

// Register manual triggers
registerTrigger('ppc-review', runPPC);
registerTrigger('keyword-miner', runKeywords);
registerTrigger('content-publisher', runContent);

// ── Schedule agents (Mountain Time = America/Edmonton) ────
schedule('PPC Review',        '0 8 * * *',  runPPC);       // 8:00 AM GMT daily
schedule('Keyword Miner',    '0 10 * * *', runKeywords);   // 10:00 AM GMT daily
schedule('Content Publisher', '0 12 * * *', runContent);    // 12:00 PM GMT daily

// ── Startup notification ──────────────────────────────────
const jobs = listJobs();
log.info(`${jobs.length} agents scheduled:`);
jobs.forEach(j => log.info(`  ${j.name} → ${j.schedule}`));

await sendSlack([
  slackHeader('BanffBound Agents Online'),
  slackSection(
    jobs.map(j => `• *${j.name}* → \`${j.schedule}\``).join('\n') +
    '\n\n_Approval server running. Proposals expire after 12 hours._'
  ),
], 'Agent system started');

log.info('Agent system running. Press Ctrl+C to stop.');
