import 'dotenv/config';
import { schedule, listJobs } from './core/scheduler.js';
import { createLogger } from './core/logger.js';
import { sendSlack, slackHeader, slackSection } from './core/slack.js';
import { startApprovalServer } from './core/approval.js';
// PPC agents disabled — campaign paused, organic-only strategy
// import { run as runPPC } from './agents/ppc-review.js';
// import { run as runKeywords } from './agents/keyword-miner.js';
import { run as runContent } from './agents/content-publisher.js';
import { run as runGA4 } from './agents/ga4-briefing.js';
import { run as runBacklinks } from './agents/backlink-monitor.js';
import { run as runReddit } from './agents/reddit-promoter.js';
import { run as runOutreach } from './agents/blogger-outreach.js';
import { run as runDirectories } from './agents/directory-tracker.js';
import { run as runShareable } from './agents/shareable-content.js';
import { run as runInbox, processIncomingEmail, processPendingReplies } from './agents/inbox-monitor.js';

const log = createLogger('main');

log.info('BanffBound Agent System starting...');

// ── Start approval callback server ────────────────────────
const { registerTrigger, registerEmailHandler } = startApprovalServer();

// Register email webhook handler
registerEmailHandler(processIncomingEmail);

// Resume any pending delayed replies from before restart
processPendingReplies();

// Register manual triggers (PPC agents disabled)
// registerTrigger('ppc-review', runPPC);
registerTrigger('ga4-briefing', runGA4);
// registerTrigger('keyword-miner', runKeywords);
registerTrigger('backlink-monitor', runBacklinks);
registerTrigger('content-publisher', runContent);
registerTrigger('reddit-promoter', runReddit);
registerTrigger('blogger-outreach', runOutreach);
registerTrigger('directory-tracker', runDirectories);
registerTrigger('shareable-content', runShareable);
registerTrigger('inbox-monitor', runInbox);

// ── Schedule agents (Mountain Time = America/Edmonton) ────
// schedule('PPC Review',     '0 8 * * *',  runPPC);       // DISABLED — PPC paused
schedule('GA4 Briefing',     '0 9 * * *',  runGA4);        // 9:00 AM GMT daily
// schedule('Keyword Miner', '0 10 * * *', runKeywords);   // DISABLED — PPC paused
schedule('Backlink Monitor', '0 10 * * 1', runBacklinks);   // 10:00 AM GMT every Monday
schedule('Content Publisher', '0 12 * * *', runContent);    // 12:00 PM GMT daily
schedule('Inbox Summary',    '0 18 * * *', runInbox);       // 6:00 PM GMT daily
schedule('Reddit Promoter',  '0 14 * * 2,5', runReddit);   // 2:00 PM GMT Tue & Fri
schedule('Blogger Outreach',  '0 11 * * 1', runOutreach);  // 11:00 AM GMT Monday
schedule('Directory Tracker', '0 10 1 * *', runDirectories); // 10:00 AM GMT 1st of month
schedule('Shareable Content', '0 12 * * 3', runShareable);  // 12:00 PM GMT Wednesday

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
