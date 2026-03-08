import Anthropic from '@anthropic-ai/sdk';
import { createLogger } from '../core/logger.js';
import { sendSlack, slackHeader, slackSection, slackDivider } from '../core/slack.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const log = createLogger('journalist-pitcher');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'journalist-pitches.json');
const SITE_URL = process.env.SITE_URL || 'https://banffbound.com';

const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN;
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD;

// Keywords that signal a journalist query we can respond to
const TOPIC_SIGNALS = [
  'banff', 'canadian rockies', 'alberta travel', 'canada travel', 'national park',
  'ski resort canada', 'lake louise', 'rocky mountains', 'canmore',
  'winter travel', 'summer travel canada', 'hiking destinations',
  'mountain destinations', 'outdoor adventure', 'travel expert',
  'best places to visit canada', 'road trip canada', 'wildlife viewing',
];

// Search queries to find journalist request pages and travel roundups accepting submissions
const JOURNALIST_QUERIES = [
  'travel writer looking for sources banff',
  'journalist query canadian travel expert',
  '"looking for" travel expert canada mountains',
  '"contribute" OR "guest post" banff travel guide',
  '"write for us" travel canada rockies',
  '"accepting guest posts" travel blog mountains',
  '"contributor guidelines" travel blog canada',
  '"submit a guest post" outdoor adventure travel',
  '"write for us" hiking camping travel',
  '"guest post guidelines" travel adventure blog',
  'travel roundup "best destinations" canada 2026',
  '"resource page" banff OR "canadian rockies" travel',
  '"useful links" OR "recommended resources" banff travel',
  'travel link roundup canada mountains',
  '"suggest a resource" travel canada',
];

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadHistory() {
  ensureDataDir();
  if (fs.existsSync(HISTORY_FILE)) return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
  return { pitches: [], contacted: [], lastRun: null };
}

function saveHistory(data) {
  ensureDataDir();
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(data, null, 2));
}

// ── Find journalist/guest-post opportunities via SERP ──────
async function findOpportunities() {
  const opportunities = new Map();

  const shuffled = JOURNALIST_QUERIES.sort(() => Math.random() - 0.5).slice(0, 3);

  if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
    log.info('No DataForSEO credentials — using curated guest post targets');
    return getCuratedTargets();
  }

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
          depth: 20,
        }]),
      });

      if (!res.ok) continue;
      const data = await res.json();
      const items = data?.tasks?.[0]?.result?.[0]?.items || [];

      for (const item of items) {
        if (item.type !== 'organic') continue;
        const url = item.url || '';
        const domain = item.domain || '';
        const title = (item.title || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();

        if (domain.includes('banffbound')) continue;

        const skipDomains = ['reddit', 'youtube', 'wikipedia', 'facebook', 'twitter',
          'instagram', 'pinterest', 'tiktok', 'quora', 'medium.com'];
        if (skipDomains.some(s => domain.includes(s))) continue;

        // Look for guest post pages, write-for-us pages, resource pages, or roundup posts
        const isOpportunity =
          title.includes('write for us') || title.includes('guest post') ||
          title.includes('contribute') || title.includes('submit') ||
          title.includes('resource') || title.includes('useful links') ||
          title.includes('roundup') || title.includes('best of') ||
          desc.includes('guest post') || desc.includes('write for us') ||
          desc.includes('accepting contributions') || desc.includes('suggest a resource') ||
          url.includes('write-for-us') || url.includes('guest-post') ||
          url.includes('contribute') || url.includes('submit') ||
          url.includes('resources') || url.includes('useful-links');

        if (isOpportunity) {
          opportunities.set(domain, {
            domain,
            url,
            title: item.title || '',
            description: item.description || '',
            type: url.includes('resource') || title.includes('resource') ? 'resource_page' : 'guest_post',
          });
        }
      }
    } catch (e) {
      log.warn(`SERP query failed: ${e.message}`);
    }
  }

  const results = [...opportunities.values()];

  // Supplement with curated targets if SERP didn't find enough
  if (results.length < 5) {
    const curated = getCuratedTargets();
    const existingDomains = new Set(results.map(r => r.domain));
    for (const t of curated) {
      if (!existingDomains.has(t.domain)) results.push(t);
    }
  }

  return results;
}

function getCuratedTargets() {
  return [
    { domain: 'matadornetwork.com', url: 'https://matadornetwork.com/community/contribute/', title: 'Matador Network - Contribute', description: 'Global travel media accepting contributor pitches', type: 'guest_post' },
    { domain: 'travelwritersexchange.com', url: 'https://travelwritersexchange.com', title: 'Travel Writers Exchange', description: 'Travel writing community', type: 'guest_post' },
    { domain: 'worldnomads.com', url: 'https://www.worldnomads.com/create/write-for-us', title: 'World Nomads - Write For Us', description: 'Travel stories and guides', type: 'guest_post' },
    { domain: 'goabroad.com', url: 'https://www.goabroad.com/write-for-us', title: 'GoAbroad - Write For Us', description: 'Travel and adventure blog', type: 'guest_post' },
    { domain: 'tripsavvy.com', url: 'https://www.tripsavvy.com', title: 'TripSavvy', description: 'Travel planning guides — often cites expert sources', type: 'resource_page' },
    { domain: 'theglobeandmail.com', url: 'https://www.theglobeandmail.com/life/travel/', title: 'Globe and Mail Travel', description: 'Canadian newspaper travel section', type: 'resource_page' },
    { domain: 'cbc.ca', url: 'https://www.cbc.ca/news/canada/calgary', title: 'CBC Calgary', description: 'Canadian media — Banff stories', type: 'resource_page' },
    { domain: 'outsideonline.com', url: 'https://www.outsideonline.com/write-for-us/', title: 'Outside Magazine', description: 'Outdoor adventure publication', type: 'guest_post' },
    { domain: 'adventure.com', url: 'https://adventure.com/write-for-us/', title: 'Adventure.com', description: 'Adventure travel stories', type: 'guest_post' },
    { domain: 'lonelyplanet.com', url: 'https://www.lonelyplanet.com/articles/write-for-us', title: 'Lonely Planet - Write for Us', description: 'Major travel publisher', type: 'guest_post' },
    { domain: 'roughguides.com', url: 'https://www.roughguides.com', title: 'Rough Guides', description: 'Travel guide publisher', type: 'resource_page' },
    { domain: 'travelandleisure.com', url: 'https://www.travelandleisure.com', title: 'Travel + Leisure', description: 'Premium travel magazine', type: 'resource_page' },
    { domain: 'afar.com', url: 'https://www.afar.com/contributor-guidelines', title: 'AFAR - Contributor Guidelines', description: 'Experiential travel publication', type: 'guest_post' },
    { domain: 'themanual.com', url: 'https://www.themanual.com', title: 'The Manual', description: 'Lifestyle publication with outdoor/travel', type: 'resource_page' },
    { domain: 'switchbacktravel.com', url: 'https://switchbacktravel.com', title: 'Switchback Travel', description: 'Outdoor gear and travel guides', type: 'resource_page' },
  ];
}

// ── Find contact email ────────────────────────────────────
async function findContactEmail(domain) {
  const pages = [
    `https://${domain}/contact`, `https://${domain}/about`,
    `https://${domain}/write-for-us`, `https://${domain}/contribute`,
    `https://www.${domain}/contact`, `https://www.${domain}/write-for-us`,
  ];

  for (const pageUrl of pages.slice(0, 4)) {
    try {
      const res = await fetch(pageUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BanffBound/1.0)' },
        signal: AbortSignal.timeout(5000),
        redirect: 'follow',
      });
      if (!res.ok) continue;
      const html = await res.text();

      const emails = (html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [])
        .map(e => e.toLowerCase())
        .filter(e => !e.includes('example.com') && !e.includes('wixpress') &&
                     !e.includes('wordpress') && !e.endsWith('.png') && !e.endsWith('.js'));

      if (emails.length > 0) {
        return emails.sort((a, b) => {
          const pri = ['editor@', 'editorial@', 'contribute@', 'submissions@', 'hello@', 'contact@', 'info@'];
          const aI = pri.findIndex(p => a.startsWith(p));
          const bI = pri.findIndex(p => b.startsWith(p));
          if (aI === -1 && bI === -1) return 0;
          if (aI === -1) return 1;
          if (bI === -1) return -1;
          return aI - bI;
        })[0];
      }
    } catch { /* timeout or network error */ }
  }
  return null;
}

// ── Draft pitch via Claude ────────────────────────────────
async function draftPitch(opportunity) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const year = new Date().getFullYear();
  const isGuestPost = opportunity.type === 'guest_post';

  const prompt = isGuestPost
    ? `Draft a short guest post pitch email (under 150 words) to a travel publication.

MY SITE: BanffBound (${SITE_URL}) — a comprehensive Banff National Park guide with 450+ pages.
MY EXPERTISE: Banff travel, Canadian Rockies hiking trails, hotel reviews, activity guides, seasonal planning.

THEIR SITE: ${opportunity.title} (${opportunity.url})
Description: ${opportunity.description}

Propose 2-3 specific article ideas I could write for them about Banff/Canadian Rockies.
Topic ideas should be genuinely useful to their audience — not promotional.
Example angles: "X Hidden Gems in Banff Most Tourists Miss", "Month-by-Month Guide to the Canadian Rockies", "How to Visit Banff on a Budget in ${year}".

Sign off as "Jack Chittenden, BanffBound". Be direct and professional. Return ONLY the email body.`

    : `Draft a short outreach email (under 120 words) suggesting BanffBound as a resource.

MY SITE: BanffBound (${SITE_URL}) — a comprehensive Banff National Park guide with 450+ pages, 95 hotel listings, trail maps, restaurant guides.
THEIR SITE: ${opportunity.title} (${opportunity.url})
Description: ${opportunity.description}

Suggest that BanffBound would be a useful addition to their resource page or article as a comprehensive Banff travel guide.
Reference a specific page on BanffBound that would be relevant (e.g. our hotel directory, hiking trail guide, or trip planner).

Sign off as "Jack from BanffBound". Be direct. Return ONLY the email body.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  });

  const body = response.content[0].text.trim();

  const subjectPrompt = isGuestPost
    ? `Write a short email subject line (under 50 chars) for a guest post pitch to ${opportunity.title} about Banff/Canadian Rockies content. Return ONLY the subject line, no quotes.`
    : `Write a short email subject line (under 50 chars) suggesting BanffBound as a resource to ${opportunity.title}. Return ONLY the subject line, no quotes.`;

  const subjectRes = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 50,
    messages: [{ role: 'user', content: subjectPrompt }],
  });

  return {
    subject: subjectRes.content[0].text.trim().replace(/^["']|["']$/g, ''),
    body,
  };
}

// ── Send email via Resend ─────────────────────────────────
async function sendEmail(to, subject, body) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY not configured');

  const { Resend } = await import('resend');
  const resend = new Resend(RESEND_API_KEY);
  const FROM = process.env.OUTREACH_FROM_EMAIL || 'hello@banffbound.com';
  const REPLY_TO = process.env.OUTREACH_REPLY_TO || FROM;

  const htmlBody = body.split('\n').map(line =>
    line.trim() ? `<p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#333;">${line}</p>` : ''
  ).join('\n');

  const { data, error } = await resend.emails.send({
    from: `Jack from BanffBound <${FROM}>`,
    to: [to],
    replyTo: REPLY_TO,
    subject,
    html: htmlBody,
  });

  if (error) throw new Error(`Resend: ${JSON.stringify(error)}`);
  return data.id;
}

// ── Main ──────────────────────────────────────────────────
export async function run() {
  log.info('Journalist Pitcher starting...');

  const history = loadHistory();
  const contactedDomains = new Set(history.contacted);

  const opportunities = await findOpportunities();
  log.info(`Found ${opportunities.length} opportunities`);

  const fresh = opportunities.filter(o => !contactedDomains.has(o.domain));
  log.info(`${fresh.length} not yet contacted`);

  if (fresh.length === 0) {
    await sendSlack(
      [slackSection(':white_check_mark: Journalist Pitcher: all known targets contacted. SERP will discover new ones next run.')],
      'Journalist Pitcher'
    );
    return { pitched: 0, sent: 0 };
  }

  const results = [];

  for (const opp of fresh.slice(0, 3)) {
    try {
      log.info(`Processing ${opp.domain} (${opp.type})...`);
      const email = await findContactEmail(opp.domain);

      if (!email) {
        log.info(`No email for ${opp.domain}`);
        results.push({ opp, status: 'no_email' });
        history.contacted.push(opp.domain);
        continue;
      }

      const pitch = await draftPitch(opp);
      log.info(`Drafted pitch for ${opp.domain}`);

      let status = 'drafted';
      let emailId = null;

      if (process.env.RESEND_API_KEY) {
        try {
          emailId = await sendEmail(email, pitch.subject, pitch.body);
          status = 'sent';
          log.info(`Sent to ${email}`);
        } catch (err) {
          log.error(`Send failed: ${err.message}`);
          status = 'send_failed';
        }
      }

      results.push({ opp, email, pitch, status, emailId });
      history.contacted.push(opp.domain);
      history.pitches.push({
        domain: opp.domain,
        type: opp.type,
        email,
        subject: pitch.subject,
        status,
        date: new Date().toISOString(),
      });

    } catch (err) {
      log.error(`Failed for ${opp.domain}: ${err.message}`);
      results.push({ opp, status: 'error', error: err.message });
    }
  }

  // Slack report
  const sent = results.filter(r => r.status === 'sent');
  const drafted = results.filter(r => r.status === 'drafted');
  const noEmail = results.filter(r => r.status === 'no_email');

  const blocks = [
    slackHeader(`Journalist Pitcher — ${results.length} Targets Processed`),
    slackDivider(),
  ];

  for (const r of [...sent, ...drafted]) {
    const icon = r.status === 'sent' ? ':white_check_mark:' : ':pencil:';
    const typeLabel = r.opp.type === 'guest_post' ? 'Guest Post Pitch' : 'Resource Suggestion';
    blocks.push(slackSection(
      `${icon} *${r.opp.title}* (${typeLabel})\n` +
      `To: ${r.email}\nSubject: ${r.pitch.subject}\n\n` +
      `${r.pitch.body.slice(0, 200)}...`
    ));
    blocks.push(slackDivider());
  }

  if (noEmail.length > 0) {
    blocks.push(slackSection(
      `:grey_question: *No email found:* ${noEmail.map(r => r.opp.domain).join(', ')}`
    ));
  }

  blocks.push(slackSection(
    `:bar_chart: *Summary:* ${sent.length} sent, ${drafted.length} drafted, ${noEmail.length} skipped\n` +
    `_Total publications pitched to date: ${history.pitches.length}_`
  ));

  await sendSlack(blocks, `Journalist Pitcher: ${sent.length} sent`);

  history.lastRun = new Date().toISOString();
  saveHistory(history);

  return { pitched: results.length, sent: sent.length };
}
