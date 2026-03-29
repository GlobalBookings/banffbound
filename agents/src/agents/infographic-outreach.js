import Anthropic from '@anthropic-ai/sdk';
import { Resend } from 'resend';
import { createLogger } from '../core/logger.js';
import { sendSlack, slackHeader, slackSection, slackDivider } from '../core/slack.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const log = createLogger('infographic-outreach');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const INFOGRAPHIC_FILE = path.join(DATA_DIR, 'infographics.json');
const OUTREACH_FILE = path.join(DATA_DIR, 'infographic-outreach-history.json');
const SITE_URL = process.env.SITE_URL || 'https://banffbound.com';

const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN;
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.OUTREACH_FROM_EMAIL || 'hello@banffbound.com';
const REPLY_TO = process.env.OUTREACH_REPLY_TO || FROM_EMAIL;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadInfographics() {
  if (fs.existsSync(INFOGRAPHIC_FILE)) return JSON.parse(fs.readFileSync(INFOGRAPHIC_FILE, 'utf8'));
  return { published: [], lastRun: null };
}

function loadOutreachHistory() {
  ensureDataDir();
  if (fs.existsSync(OUTREACH_FILE)) return JSON.parse(fs.readFileSync(OUTREACH_FILE, 'utf8'));
  return { contacted: [], responses: [], lastRun: null };
}

function saveOutreachHistory(data) {
  ensureDataDir();
  fs.writeFileSync(OUTREACH_FILE, JSON.stringify(data, null, 2));
}

// ── Find bloggers who write about topics matching our infographics ──

const TOPIC_QUERIES = {
  'banff-trip-cost': ['banff trip cost blog', 'banff budget guide blogger', 'how much does banff cost blog', 'banff vacation budget breakdown'],
  'best-time-visit-banff': ['best time visit banff blog', 'when to visit banff blogger', 'banff seasonal guide blog post', 'banff month by month guide'],
  'banff-big3-ski': ['banff ski resort comparison blog', 'sunshine village vs lake louise blog', 'banff skiing guide blogger', 'big 3 banff ski blog'],
  'banff-top-hikes': ['best banff hikes blog', 'banff hiking guide blogger', 'top banff trails blog post', 'banff national park hiking blog'],
  'banff-wildlife-guide': ['banff wildlife blog', 'banff animal spotting guide blog', 'canadian rockies wildlife blogger', 'banff bears elk blog'],
  'icefields-parkway-stops': ['icefields parkway blog', 'icefields parkway stops guide', 'banff to jasper drive blog', 'icefields parkway road trip blogger'],
  'banff-packing-checklist': ['banff packing list blog', 'what to pack banff blogger', 'banff gear checklist blog post', 'canadian rockies packing guide'],
  'banff-lakes-guide': ['banff lakes guide blog', 'best lakes banff blogger', 'lake louise moraine lake blog', 'turquoise lakes canadian rockies blog'],
};

async function findRelevantBloggers(infographicId) {
  const queries = TOPIC_QUERIES[infographicId] || ['banff travel blog', 'canadian rockies guide blogger'];
  const bloggers = new Map();

  if (DATAFORSEO_LOGIN && DATAFORSEO_PASSWORD) {
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
          const skip = ['tripadvisor', 'expedia', 'booking.com', 'reddit', 'youtube', 'wikipedia',
            'instagram', 'facebook', 'twitter', 'pinterest', 'tiktok', 'lonelyplanet', 'viator',
            'getyourguide', 'google', 'yelp', 'alltrails', 'flickr', 'amazon'];
          if (skip.some(s => domain.includes(s))) continue;

          if (url.includes('blog') || url.includes('/post') || url.includes('/guide') || url.match(/\/\d{4}\//)) {
            bloggers.set(domain, {
              domain,
              url,
              title: item.title || '',
              description: item.description || '',
              topicMatch: query,
            });
          }
        }
      } catch (e) {
        log.warn(`SERP query failed: ${e.message}`);
      }
    }
  }

  // Fallback curated list targeted at infographic topics
  if (bloggers.size < 5) {
    const curated = [
      { domain: 'thebanffblog.com', url: 'https://thebanffblog.com', title: 'The Banff Blog', description: 'Local Banff travel blog', topicMatch: 'curated' },
      { domain: 'practicalwanderlust.com', url: 'https://practicalwanderlust.com', title: 'Practical Wanderlust', description: 'Canadian Rockies adventure travel', topicMatch: 'curated' },
      { domain: 'theplanetd.com', url: 'https://theplanetd.com', title: 'The Planet D', description: 'Canadian adventure travel', topicMatch: 'curated' },
      { domain: 'bearfoottheory.com', url: 'https://bearfoottheory.com', title: 'Bearfoot Theory', description: 'Outdoor adventure blog', topicMatch: 'curated' },
      { domain: 'dirtinmyshoes.com', url: 'https://dirtinmyshoes.com', title: 'Dirt In My Shoes', description: 'National parks hiking blog', topicMatch: 'curated' },
      { domain: 'hikebiketravel.com', url: 'https://hikebiketravel.com', title: 'Hike Bike Travel', description: 'Canadian hiking and biking blog', topicMatch: 'curated' },
      { domain: 'freshoffthegrid.com', url: 'https://freshoffthegrid.com', title: 'Fresh Off the Grid', description: 'Camping and outdoor blog', topicMatch: 'curated' },
      { domain: 'y-travel-blog.com', url: 'https://y-travel-blog.com', title: 'Y Travel Blog', description: 'Family travel with Banff content', topicMatch: 'curated' },
      { domain: 'twowesternexplorers.com', url: 'https://twowesternexplorers.com', title: 'Two Western Explorers', description: 'Western Canada adventure blog', topicMatch: 'curated' },
      { domain: 'backpackingcanada.com', url: 'https://backpackingcanada.com', title: 'Backpacking Canada', description: 'Canadian budget travel', topicMatch: 'curated' },
      { domain: 'explorecanmore.ca', url: 'https://explorecanmore.ca', title: 'Explore Canmore', description: 'Canmore & Banff local guide', topicMatch: 'curated' },
      { domain: 'themandagies.com', url: 'https://themandagies.com', title: 'The Mandagies', description: 'PNW & Canadian Rockies', topicMatch: 'curated' },
    ];
    for (const b of curated) {
      if (!bloggers.has(b.domain)) bloggers.set(b.domain, b);
    }
  }

  return [...bloggers.values()];
}

// ── Find contact email ────────────────────────────────────

async function findContactEmail(domain) {
  const emails = new Set();
  const pages = [
    `https://${domain}/contact`, `https://${domain}/contact-us`,
    `https://${domain}/about`, `https://${domain}/work-with-me`,
    `https://www.${domain}/contact`, `https://www.${domain}/about`,
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
      const found = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
      for (const email of found) {
        const lower = email.toLowerCase();
        if (lower.includes('example.com') || lower.includes('wixpress') || lower.includes('sentry')
            || lower.includes('wordpress') || lower.endsWith('.png') || lower.endsWith('.jpg')
            || lower.endsWith('.js') || lower.endsWith('.css')) continue;
        emails.add(lower);
      }
      if (emails.size > 0) break;
    } catch { /* timeout or network error */ }
  }

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

// ── Draft infographic outreach email ──────────────────────

async function draftInfographicEmail(blogger, infographic) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const year = new Date().getFullYear();

  const postUrl = `${SITE_URL}/blog/${infographic.slug}`;
  const svgUrl = `${SITE_URL}${infographic.infographicUrl}`;

  const prompt = `Draft a short, personalized outreach email to a travel blogger offering a FREE infographic for their website.

MY SITE: BanffBound (${SITE_URL}) — a comprehensive Banff National Park travel guide.

THEIR SITE: ${blogger.title} (${blogger.url})
Description: ${blogger.description}
They rank for: ${blogger.topicMatch}

WHAT I'M OFFERING (all free):
1. A professionally designed infographic: "${infographic.title}"
   - View it: ${postUrl}
   - Direct SVG: ${svgUrl}
2. A ready-to-publish companion blog post (they can edit/customize it)
3. Embed code they can just paste into their site

WHAT I'M ASKING:
- Just a credit link back to BanffBound.com — that's it. No payment, no catches.

REQUIREMENTS:
1. Keep under 150 words — bloggers are busy
2. Be direct, not salesy — lead with the value (free professional infographic)
3. Reference their specific content/niche
4. Mention the specific infographic by name and why it fits their audience
5. Include the link to view the infographic
6. Make the ask clear: use the infographic, link back to BanffBound
7. Sign off as "Jack from BanffBound"
8. Current year is ${year}
9. Don't use "I came across" or generic flattery
10. Keep it casual and genuine

Return ONLY the email body text. No subject line, no formatting instructions.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  });
  const body = response.content[0].text.trim();

  const subjectResponse = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 50,
    messages: [{ role: 'user', content: `Write a short email subject line (under 50 chars) for an outreach email offering a free Banff infographic "${infographic.title}" to ${blogger.title}. Make it natural and intriguing. Return ONLY the subject line text, no quotes.` }],
  });
  const subject = subjectResponse.content[0].text.trim().replace(/^["']|["']$/g, '');

  return { subject, body };
}

// ── Send email ────────────────────────────────────────────

async function sendEmail(to, subject, body) {
  if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY not configured');

  const resend = new Resend(RESEND_API_KEY);
  const htmlBody = body.split('\n').map(line =>
    line.trim() ? `<p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#333;">${line}</p>` : ''
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
  log.info('Infographic Outreach starting...');

  // Load available infographics
  const infographicState = loadInfographics();
  if (infographicState.published.length === 0) {
    log.info('No infographics published yet — run infographic-generator first');
    await sendSlack(
      [slackSection(':warning: Infographic Outreach: no infographics available. Run `infographic-generator` first.')],
      'Infographic Outreach'
    );
    return { sent: 0, reason: 'no_infographics' };
  }

  const history = loadOutreachHistory();
  const contactedDomains = new Set(history.contacted.map(c => c.domain));

  // Pick a random infographic to promote this run
  const infographic = infographicState.published[Math.floor(Math.random() * infographicState.published.length)];
  log.info(`Promoting: "${infographic.title}"`);

  // Find bloggers relevant to this infographic's topic
  const bloggers = await findRelevantBloggers(infographic.id);
  const newBloggers = bloggers.filter(b => !contactedDomains.has(b.domain));
  log.info(`Found ${bloggers.length} bloggers, ${newBloggers.length} not yet contacted`);

  if (newBloggers.length === 0) {
    await sendSlack(
      [slackSection(`:white_check_mark: Infographic Outreach: all known bloggers contacted for "${infographic.title}". Will discover new ones next run.`)],
      'Infographic Outreach'
    );
    return { sent: 0, reason: 'all_contacted' };
  }

  const results = [];

  // Process up to 5 bloggers per run
  for (const blogger of newBloggers.slice(0, 5)) {
    try {
      log.info(`Finding email for ${blogger.domain}...`);
      const email = await findContactEmail(blogger.domain);

      if (!email) {
        results.push({ blogger, status: 'no_email' });
        continue;
      }

      log.info(`Found: ${email} — drafting email...`);
      const draft = await draftInfographicEmail(blogger, infographic);

      let status = 'drafted';
      let emailId = null;

      if (RESEND_API_KEY) {
        try {
          emailId = await sendEmail(email, draft.subject, draft.body);
          status = 'sent';
          log.info(`Sent to ${email} (${emailId})`);
        } catch (err) {
          log.error(`Send failed: ${err.message}`);
          status = 'send_failed';
        }
      }

      results.push({ blogger, email, draft, status, emailId });

      history.contacted.push({
        domain: blogger.domain,
        url: blogger.url,
        email,
        date: new Date().toISOString(),
        infographicId: infographic.id,
        infographicTitle: infographic.title,
        subject: draft.subject,
        status,
        emailId,
      });
    } catch (err) {
      log.error(`Failed for ${blogger.domain}: ${err.message}`);
      results.push({ blogger, status: 'error', error: err.message });
    }
  }

  // Slack report
  const sent = results.filter(r => r.status === 'sent');
  const drafted = results.filter(r => r.status === 'drafted');
  const noEmail = results.filter(r => r.status === 'no_email');
  const failed = results.filter(r => r.status === 'send_failed' || r.status === 'error');

  const blocks = [
    slackHeader(`Infographic Outreach — ${results.length} Bloggers`),
    slackSection(`:art: Promoting: *${infographic.title}*\n${SITE_URL}/blog/${infographic.slug}`),
    slackDivider(),
  ];

  if (sent.length > 0) {
    for (const r of sent) {
      blocks.push(slackSection(
        `:white_check_mark: *Sent to ${r.blogger.title}*\nTo: ${r.email}\nSubject: ${r.draft.subject}\n\n${r.draft.body.slice(0, 200)}...`
      ));
      blocks.push(slackDivider());
    }
  }

  if (drafted.length > 0) {
    blocks.push(slackSection(':pencil: *Drafted (no Resend key):*'));
    for (const r of drafted) {
      blocks.push(slackSection(`*${r.blogger.title}* (${r.email})\nSubject: ${r.draft.subject}\n\n${r.draft.body}`));
    }
    blocks.push(slackDivider());
  }

  if (noEmail.length > 0) {
    blocks.push(slackSection(`:grey_question: *No email found:*\n${noEmail.map(r => `• ${r.blogger.domain}`).join('\n')}`));
  }

  if (failed.length > 0) {
    blocks.push(slackSection(`:x: *Failed:*\n${failed.map(r => `• ${r.blogger.domain} — ${r.error || 'send failed'}`).join('\n')}`));
  }

  blocks.push(slackDivider());
  blocks.push(slackSection(
    `:bar_chart: *Summary:* ${sent.length} sent, ${drafted.length} drafted, ${noEmail.length} no email, ${failed.length} failed\n` +
    `_Total infographic outreach to date: ${history.contacted.filter(c => c.status === 'sent').length}_`
  ));

  await sendSlack(blocks, `Infographic Outreach: ${sent.length} sent for "${infographic.title}"`);

  history.lastRun = new Date().toISOString();
  saveOutreachHistory(history);

  return { sent: sent.length, drafted: drafted.length, infographic: infographic.title };
}
