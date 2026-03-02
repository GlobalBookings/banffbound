import Anthropic from '@anthropic-ai/sdk';
import { Resend } from 'resend';
import { createLogger } from '../core/logger.js';
import { sendSlack, slackHeader, slackSection, slackDivider } from '../core/slack.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const log = createLogger('blogger-outreach');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'outreach-history.json');
const SITE_URL = process.env.SITE_URL || 'https://banffbound.com';

const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN;
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.OUTREACH_FROM_EMAIL || 'hello@banffbound.com';
const REPLY_TO = process.env.OUTREACH_REPLY_TO || FROM_EMAIL;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadHistory() {
  ensureDataDir();
  if (fs.existsSync(HISTORY_FILE)) return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
  return { contacted: [], lastRun: null };
}

function saveHistory(data) {
  ensureDataDir();
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(data, null, 2));
}

// ── Find Banff travel bloggers via SERP ───────────────────
async function findBloggers() {
  const queries = [
    'banff travel blog 2026',
    'banff national park guide blog',
    'canadian rockies travel blogger',
    'banff hiking blog post',
    'things to do in banff blog',
    'banff itinerary blog',
    'lake louise travel guide blog',
    'best banff blog posts',
    'banff travel tips blogger',
    'canadian rockies road trip blog',
  ];

  if (DATAFORSEO_LOGIN && DATAFORSEO_PASSWORD) {
    try {
      return await findBloggersViaSERP(queries);
    } catch (e) {
      log.warn(`SERP search failed: ${e.message}, using curated list`);
    }
  }

  return getCuratedBloggers();
}

async function findBloggersViaSERP(queries) {
  const bloggers = new Map();
  const shuffled = queries.sort(() => Math.random() - 0.5).slice(0, 2);

  for (const query of shuffled) {
    try {
      const res = await fetch('https://api.dataforseo.com/v3/serp/google/organic/live/advanced', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{
          keyword: query,
          location_code: 2124,
          language_code: 'en',
          depth: 30,
        }]),
      });

      if (!res.ok) continue;
      const data = await res.json();
      const items = data?.tasks?.[0]?.result?.[0]?.items || [];

      for (const item of items) {
        if (item.type !== 'organic') continue;
        const url = item.url || '';
        const domain = item.domain || '';

        if (domain.includes('banffbound')) continue;
        const skipDomains = ['tripadvisor', 'expedia', 'booking.com', 'reddit', 'youtube', 'wikipedia',
          'instagram', 'facebook', 'twitter', 'pinterest', 'tiktok', 'lonelyplanet', 'viator',
          'getyourguide', 'google', 'yelp', 'alltrails', 'flickr', 'amazon'];
        if (skipDomains.some(s => domain.includes(s))) continue;

        if (url.includes('blog') || url.includes('/post') || url.includes('/article') ||
            url.includes('/guide') || url.match(/\/\d{4}\//)) {
          bloggers.set(domain, { domain, url, title: item.title || '', description: item.description || '' });
        }
      }
    } catch (e) {
      log.warn(`SERP query failed for "${query}": ${e.message}`);
    }
  }

  return [...bloggers.values()];
}

function getCuratedBloggers() {
  return [
    { domain: 'thebanffblog.com', url: 'https://thebanffblog.com', title: 'The Banff Blog', description: 'Local Banff travel blog' },
    { domain: 'practicalwanderlust.com', url: 'https://practicalwanderlust.com', title: 'Practical Wanderlust', description: 'Adventure travel blog featuring Canadian Rockies' },
    { domain: 'themandagies.com', url: 'https://themandagies.com', title: 'The Mandagies', description: 'Pacific Northwest & Canadian Rockies adventure guides' },
    { domain: 'localwanderer.com', url: 'https://localwanderer.com', title: 'Local Wanderer', description: 'Local travel guides' },
    { domain: 'bucketlistly.blog', url: 'https://www.bucketlistly.blog', title: 'Bucketlistly Blog', description: 'Budget travel blog with Canada coverage' },
    { domain: 'theculturetrip.com', url: 'https://theculturetrip.com', title: 'The Culture Trip', description: 'Cultural travel guides worldwide' },
    { domain: 'y-travel-blog.com', url: 'https://y-travel-blog.com', title: 'Y Travel Blog', description: 'Family travel blog with Banff content' },
    { domain: 'hazelandcompany.com', url: 'https://hazelandcompany.com', title: 'Hazel & Company', description: 'Outdoor adventure travel blog' },
    { domain: 'worldofwanderlust.com', url: 'https://worldofwanderlust.com', title: 'World of Wanderlust', description: 'Global travel blog' },
    { domain: 'nomadicmatt.com', url: 'https://nomadicmatt.com', title: 'Nomadic Matt', description: 'Budget travel blog' },
  ];
}

// ── Find contact email from a website ─────────────────────
async function findContactEmail(domain, url) {
  const emails = new Set();

  // Try common contact page URLs
  const contactPages = [
    `https://${domain}/contact`,
    `https://${domain}/contact-us`,
    `https://${domain}/about`,
    `https://${domain}/about-us`,
    `https://${domain}/collaborate`,
    `https://${domain}/work-with-me`,
    `https://${domain}/work-with-us`,
    `https://www.${domain}/contact`,
    `https://www.${domain}/about`,
    `https://www.${domain}/work-with-me`,
  ];

  for (const pageUrl of contactPages.slice(0, 4)) {
    try {
      const res = await fetch(pageUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BanffBound/1.0)' },
        signal: AbortSignal.timeout(5000),
        redirect: 'follow',
      });

      if (!res.ok) continue;
      const html = await res.text();

      // Extract emails from page content
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const found = html.match(emailRegex) || [];

      for (const email of found) {
        const lower = email.toLowerCase();
        // Skip obvious non-contact emails
        if (lower.includes('example.com')) continue;
        if (lower.includes('wixpress')) continue;
        if (lower.includes('sentry.io')) continue;
        if (lower.includes('wordpress')) continue;
        if (lower.includes('.png') || lower.includes('.jpg')) continue;
        if (lower.endsWith('.js') || lower.endsWith('.css')) continue;
        emails.add(lower);
      }

      if (emails.size > 0) break;
    } catch {
      // Timeout or network error, continue to next page
    }
  }

  // Prioritize emails: hello@ > contact@ > info@ > anything else
  const sorted = [...emails].sort((a, b) => {
    const priority = ['hello@', 'contact@', 'info@', 'hi@', 'partnerships@', 'collab@'];
    const aIdx = priority.findIndex(p => a.startsWith(p));
    const bIdx = priority.findIndex(p => b.startsWith(p));
    if (aIdx === -1 && bIdx === -1) return 0;
    if (aIdx === -1) return 1;
    if (bIdx === -1) return -1;
    return aIdx - bIdx;
  });

  return sorted[0] || null;
}

// ── Draft outreach email via Claude ───────────────────────
async function draftOutreach(blogger) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const currentYear = new Date().getFullYear();

  const prompt = `Draft a short, personalized outreach email to a travel blogger about a potential collaboration.

MY SITE: BanffBound (${SITE_URL}) - A comprehensive Banff National Park travel guide with 450+ pages covering trails, hotels, restaurants, activities, and trip planning.

THEIR SITE: ${blogger.title} (${blogger.url})
Description: ${blogger.description}

GOAL: Either a guest post exchange, content collaboration, or natural backlink opportunity.

REQUIREMENTS:
1. Keep it under 150 words -- bloggers are busy
2. Be genuine, not salesy -- reference their site specifically
3. Propose a specific collaboration idea (guest post, resource link, content swap)
4. Include a clear call-to-action
5. Sign off as "Jack from BanffBound"
6. The current year is ${currentYear}
7. Don't be overly flattering or generic
8. Don't use phrases like "I came across your site" -- be direct

Return ONLY the email body text. No subject line, no greetings header (I'll add "Hi" separately), no formatting instructions.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  });

  const emailBody = response.content[0].text.trim();

  const subjectPrompt = `Write a short email subject line (under 50 chars) for an outreach email to ${blogger.title} about a Banff travel content collaboration. Make it natural, not spammy. Return ONLY the subject line text, no quotes.`;

  const subjectResponse = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 50,
    messages: [{ role: 'user', content: subjectPrompt }],
  });

  const subject = subjectResponse.content[0].text.trim().replace(/^["']|["']$/g, '');

  return { subject, body: emailBody };
}

// ── Send email via Resend ─────────────────────────────────
async function sendEmail(to, subject, body) {
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY not configured');
  }

  const resend = new Resend(RESEND_API_KEY);

  // Convert plain text body to simple HTML
  const htmlBody = body.split('\n').map(line =>
    line.trim() ? `<p style="margin: 0 0 12px 0; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333;">${line}</p>` : ''
  ).join('\n');

  const { data, error } = await resend.emails.send({
    from: `Jack from BanffBound <${FROM_EMAIL}>`,
    to: [to],
    replyTo: REPLY_TO,
    subject,
    html: htmlBody,
  });

  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`);

  return data.id;
}

// ── Main ──────────────────────────────────────────────────
export async function run() {
  log.info('Blogger Outreach starting...');

  const history = loadHistory();
  const contactedDomains = new Set(history.contacted.map(c => c.domain));

  // Find bloggers
  const bloggers = await findBloggers();
  log.info(`Found ${bloggers.length} potential bloggers`);

  // Filter out already contacted
  const newBloggers = bloggers.filter(b => !contactedDomains.has(b.domain));
  log.info(`${newBloggers.length} not yet contacted`);

  if (newBloggers.length === 0) {
    await sendSlack(
      [slackSection(':white_check_mark: Blogger Outreach: all known bloggers already contacted. Will discover new ones next week.')],
      'Blogger Outreach'
    );
    return { drafted: 0, sent: 0 };
  }

  const results = [];

  // Process up to 3 bloggers per run
  for (const blogger of newBloggers.slice(0, 3)) {
    try {
      // Step 1: Find their email
      log.info(`Finding email for ${blogger.domain}...`);
      const email = await findContactEmail(blogger.domain, blogger.url);

      if (!email) {
        log.info(`No email found for ${blogger.domain}, skipping`);
        results.push({ blogger, status: 'no_email' });
        continue;
      }

      log.info(`Found email: ${email} for ${blogger.domain}`);

      // Step 2: Draft the email
      const draft = await draftOutreach(blogger);
      log.info(`Drafted email for ${blogger.domain}`);

      // Step 3: Send if Resend is configured, otherwise just report
      let status = 'drafted';
      let emailId = null;

      if (RESEND_API_KEY) {
        try {
          emailId = await sendEmail(email, draft.subject, draft.body);
          status = 'sent';
          log.info(`Email sent to ${email} (${emailId})`);
        } catch (err) {
          log.error(`Send failed for ${email}: ${err.message}`);
          status = 'send_failed';
        }
      }

      results.push({ blogger, email, draft, status, emailId });

      // Record in history
      history.contacted.push({
        domain: blogger.domain,
        url: blogger.url,
        email,
        date: new Date().toISOString(),
        subject: draft.subject,
        status,
        emailId,
      });

    } catch (err) {
      log.error(`Failed for ${blogger.domain}: ${err.message}`);
      results.push({ blogger, status: 'error', error: err.message });
    }
  }

  // Build Slack report
  const sent = results.filter(r => r.status === 'sent');
  const drafted = results.filter(r => r.status === 'drafted');
  const noEmail = results.filter(r => r.status === 'no_email');
  const failed = results.filter(r => r.status === 'send_failed' || r.status === 'error');

  const blocks = [
    slackHeader(`Blogger Outreach — ${results.length} Bloggers Processed`),
    slackDivider(),
  ];

  if (sent.length > 0) {
    for (const r of sent) {
      blocks.push(slackSection(
        `:white_check_mark: *Sent to ${r.blogger.title}*\n` +
        `To: ${r.email}\n` +
        `Subject: ${r.draft.subject}\n\n` +
        `${r.draft.body.slice(0, 200)}...`
      ));
      blocks.push(slackDivider());
    }
  }

  if (drafted.length > 0) {
    blocks.push(slackSection(':pencil: *Drafted but not sent (no Resend API key):*'));
    for (const r of drafted) {
      blocks.push(slackSection(
        `*${r.blogger.title}* (${r.email})\n` +
        `Subject: ${r.draft.subject}\n\n` +
        `${r.draft.body}`
      ));
      blocks.push(slackDivider());
    }
  }

  if (noEmail.length > 0) {
    const noEmailList = noEmail.map(r => `• ${r.blogger.domain} — no contact email found`).join('\n');
    blocks.push(slackSection(`:grey_question: *No email found:*\n${noEmailList}`));
    blocks.push(slackDivider());
  }

  if (failed.length > 0) {
    const failList = failed.map(r => `• ${r.blogger.domain} — ${r.error || 'send failed'}`).join('\n');
    blocks.push(slackSection(`:x: *Failed:*\n${failList}`));
    blocks.push(slackDivider());
  }

  blocks.push(slackSection(
    `:bar_chart: *Summary:* ${sent.length} sent, ${drafted.length} drafted, ${noEmail.length} no email, ${failed.length} failed\n` +
    `_Total bloggers contacted to date: ${history.contacted.filter(c => c.status === 'sent').length}_`
  ));

  await sendSlack(blocks, `Blogger Outreach: ${sent.length} sent, ${drafted.length} drafted`);

  history.lastRun = new Date().toISOString();
  saveHistory(history);

  log.info(`Outreach complete: ${sent.length} sent, ${drafted.length} drafted, ${noEmail.length} no email`);
  return { sent: sent.length, drafted: drafted.length, noEmail: noEmail.length };
}
