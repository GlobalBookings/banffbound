import { Resend } from 'resend';
import Anthropic from '@anthropic-ai/sdk';
import { createLogger } from '../core/logger.js';
import { sendSlack, slackHeader, slackSection, slackDivider, slackFields } from '../core/slack.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const log = createLogger('inbox-monitor');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const CONVERSATIONS_FILE = path.join(DATA_DIR, 'email-conversations.json');
const SALES_FILE = path.join(DATA_DIR, 'affiliate-sales.json');
const SITE_URL = process.env.SITE_URL || 'https://banffbound.com';
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.OUTREACH_FROM_EMAIL || 'hello@banffbound.com';
const REPLY_DELAY_MS = 20 * 60 * 1000 + Math.floor(Math.random() * 10 * 60 * 1000); // 20-30 min

// Intents worth showing in Slack (skip spam, auto-replies, unsubscribes)
const SLACK_WORTHY_INTENTS = ['blogger_reply', 'collaboration_request', 'guest_post_offer', 'link_exchange', 'sponsorship', 'general_enquiry', 'affiliate_sale'];
const PENDING_REPLIES_FILE = path.join(DATA_DIR, 'pending-replies.json');

// ── Affiliate sale detection and tracking ─────────────────
const AFFILIATE_PATTERNS = {
  getyourguide: {
    senders: ['noreply@getyourguide.com', 'no-reply@getyourguide.com', 'getyourguide.com'],
    keywords: ['contributed to the new booking', 'new booking of a GetYourGuide product'],
    commissionRate: 0.08,
  },
  expedia: {
    senders: ['expedia.com', 'expediapartnercentral.com'],
    keywords: ['commission', 'booking confirmation', 'partner booking'],
    commissionRate: 0.05,
  },
  vrbo: {
    senders: ['vrbo.com', 'homeaway.com'],
    keywords: ['commission', 'booking confirmed', 'partner booking'],
    commissionRate: 0.05,
  },
};

function loadSales() {
  ensureDataDir();
  if (fs.existsSync(SALES_FILE)) return JSON.parse(fs.readFileSync(SALES_FILE, 'utf8'));
  return { sales: [], totals: { count: 0, revenue: 0, commission: 0 } };
}

function saveSales(data) {
  ensureDataDir();
  fs.writeFileSync(SALES_FILE, JSON.stringify(data, null, 2));
}

function detectAffiliateSale(from, subject, body) {
  const fromLower = (from || '').toLowerCase();
  const textLower = `${subject} ${body}`.toLowerCase();

  for (const [partner, config] of Object.entries(AFFILIATE_PATTERNS)) {
    const senderMatch = config.senders.some(s => fromLower.includes(s));
    const keywordMatch = config.keywords.some(k => textLower.includes(k.toLowerCase()));

    if (senderMatch && keywordMatch) {
      // Extract price from email body
      const priceMatch = body.match(/(?:Price|Total|Amount|Revenue)[:\s]*\$?([\d,]+\.?\d*)\s*(CAD|USD|EUR|GBP)?/i)
        || body.match(/([\d,]+\.?\d*)\s*(CAD|USD|EUR|GBP)/i);
      const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '')) : 0;
      const currency = priceMatch?.[2] || 'CAD';

      // Extract product name
      const productMatch = body.match(/(?:product|tour|activity|hotel|property)[:\s]*\n?\s*(.+?)(?:\n|$)/i)
        || body.match(/booking of.*?:\s*\n?\s*(.+?)(?:\n|$)/i);
      const product = productMatch ? productMatch[1].trim() : subject;

      // Extract date
      const dateMatch = body.match(/(?:Date|Check.in|Arrival)[:\s]*([\d]{2,4}[-\/][\d]{2}[-\/][\d]{2,4})/i);
      const bookingDate = dateMatch ? dateMatch[1] : null;

      const commission = price > 0 ? parseFloat((price * config.commissionRate).toFixed(2)) : 0;

      return {
        partner,
        product,
        price,
        currency,
        commission,
        commissionRate: config.commissionRate,
        bookingDate,
        detectedAt: new Date().toISOString(),
      };
    }
  }
  return null;
}

function recordSale(sale) {
  const sales = loadSales();
  sales.sales.push(sale);
  sales.totals.count += 1;
  sales.totals.revenue += sale.price;
  sales.totals.commission += sale.commission;
  saveSales(sales);
  log.info(`Recorded ${sale.partner} sale: ${sale.product} - $${sale.price} (commission: $${sale.commission})`);
  return sales.totals;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadPendingReplies() {
  ensureDataDir();
  if (fs.existsSync(PENDING_REPLIES_FILE)) return JSON.parse(fs.readFileSync(PENDING_REPLIES_FILE, 'utf8'));
  return [];
}

function savePendingReplies(data) {
  ensureDataDir();
  fs.writeFileSync(PENDING_REPLIES_FILE, JSON.stringify(data, null, 2));
}

function scheduleDelayedReply(replyData) {
  const pending = loadPendingReplies();
  const delayMs = 20 * 60 * 1000 + Math.floor(Math.random() * 10 * 60 * 1000); // 20-30 min
  replyData.sendAt = new Date(Date.now() + delayMs).toISOString();
  pending.push(replyData);
  savePendingReplies(pending);

  const delayMin = Math.round(delayMs / 60000);
  log.info(`Reply to ${replyData.to} scheduled in ${delayMin} minutes`);

  // Set timer to send
  setTimeout(async () => {
    try {
      await sendReply(replyData.to, replyData.subject, replyData.body, replyData.inReplyTo, replyData.references);
      log.info(`Delayed reply sent to ${replyData.to}`);

      // Update conversation history
      const conversations = loadConversations();
      const threadKey = replyData.to.toLowerCase();
      if (conversations.threads[threadKey]) {
        conversations.threads[threadKey].messages.push({
          direction: 'outbound',
          date: new Date().toISOString(),
          subject: replyData.subject,
          body: replyData.body,
        });
        saveConversations(conversations);
      }

      // Remove from pending
      const currentPending = loadPendingReplies();
      savePendingReplies(currentPending.filter(p => p.emailId !== replyData.emailId));
    } catch (err) {
      log.error(`Delayed reply to ${replyData.to} failed: ${err.message}`);
    }
  }, delayMs);
}

// ── Send any pending replies on startup ───────────────────
export function processPendingReplies() {
  const pending = loadPendingReplies();
  const now = Date.now();

  for (const reply of pending) {
    const sendAt = new Date(reply.sendAt).getTime();
    const delay = Math.max(0, sendAt - now);

    if (delay === 0) {
      // Past due, send immediately
      sendReply(reply.to, reply.subject, reply.body, reply.inReplyTo, reply.references)
        .then(() => {
          log.info(`Sent overdue reply to ${reply.to}`);
          const current = loadPendingReplies();
          savePendingReplies(current.filter(p => p.emailId !== reply.emailId));
        })
        .catch(err => log.error(`Overdue reply failed: ${err.message}`));
    } else {
      // Schedule for remaining time
      setTimeout(async () => {
        try {
          await sendReply(reply.to, reply.subject, reply.body, reply.inReplyTo, reply.references);
          log.info(`Delayed reply sent to ${reply.to}`);
          const current = loadPendingReplies();
          savePendingReplies(current.filter(p => p.emailId !== reply.emailId));
        } catch (err) {
          log.error(`Delayed reply failed: ${err.message}`);
        }
      }, delay);
      log.info(`Resuming pending reply to ${reply.to} in ${Math.round(delay / 60000)} minutes`);
    }
  }
}

function loadConversations() {
  ensureDataDir();
  if (fs.existsSync(CONVERSATIONS_FILE)) return JSON.parse(fs.readFileSync(CONVERSATIONS_FILE, 'utf8'));
  return { threads: {}, processed: [] };
}

function saveConversations(data) {
  ensureDataDir();
  fs.writeFileSync(CONVERSATIONS_FILE, JSON.stringify(data, null, 2));
}

// ── Classify incoming email intent ────────────────────────
async function classifyEmail(from, subject, body) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [{ role: 'user', content: `Classify this incoming email to a Banff travel guide website (BanffBound).

FROM: ${from}
SUBJECT: ${subject}
BODY:
${body.slice(0, 2000)}

Respond with a JSON object (no markdown, no code fences):
{
  "intent": "one of: blogger_reply, collaboration_request, guest_post_offer, link_exchange, general_enquiry, sponsorship, spam, auto_reply, unsubscribe",
  "sentiment": "positive, neutral, or negative",
  "requires_response": true or false,
  "summary": "1-2 sentence summary of what they want",
  "suggested_action": "what we should do",
  "content_topic": "if they suggest content collaboration, what topic? null otherwise"
}` }],
  });

  try {
    const text = response.content[0].text.trim();
    return JSON.parse(text);
  } catch {
    return {
      intent: 'general_enquiry',
      sentiment: 'neutral',
      requires_response: true,
      summary: 'Could not parse email intent',
      suggested_action: 'Review manually',
      content_topic: null,
    };
  }
}

// ── Generate smart reply ──────────────────────────────────
async function generateReply(from, subject, body, classification, conversationHistory) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const currentYear = new Date().getFullYear();

  const historyContext = conversationHistory.length > 0
    ? `\nPREVIOUS MESSAGES IN THIS THREAD:\n${conversationHistory.map(m => `[${m.direction}] ${m.body.slice(0, 300)}`).join('\n---\n')}`
    : '';

  const prompt = `You are Jack, the founder of BanffBound (${SITE_URL}), a comprehensive Banff National Park travel guide with 450+ pages covering trails, hotels, restaurants, activities, and trip planning.

Write a reply to this email. Be professional, friendly, and helpful.

FROM: ${from}
SUBJECT: ${subject}
BODY: ${body.slice(0, 2000)}

CLASSIFICATION: ${JSON.stringify(classification)}
${historyContext}

ABOUT BANFFBOUND:
- 450+ pages covering trails, hotels, restaurants, activities, trip planning
- 70+ trail guides with GPS coordinates from Parks Canada data
- 95 hotel listings with interactive map
- Blog with SEO-optimized travel guides updated daily
- We use affiliate links (Expedia, GetYourGuide, Amazon) for monetization
- We're always open to guest posts, content collaborations, and link exchanges
- Current year is ${currentYear}

REPLY GUIDELINES:
1. If it's a blogger replying to our outreach: be enthusiastic, propose specific next steps
2. If it's a collaboration request: suggest a guest post exchange or content partnership
3. If it's a guest post offer: accept if relevant to Banff/Canadian Rockies, ask for topic ideas
4. If it's a link exchange: suggest specific pages on both sites that would benefit
5. If it's a general travel enquiry: provide helpful info and link to relevant pages on ${SITE_URL}
6. If it's spam or auto-reply: return "NO_REPLY"
7. Keep replies under 200 words, professional but warm
8. Sign off as "Jack" or "Jack from BanffBound"
9. If they mention wanting to create content together, mention we'd love that and ask about their timeline

Return ONLY the email body text. No subject line. If no reply needed, return exactly "NO_REPLY".`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }],
  });

  return response.content[0].text.trim();
}

// ── Send reply via Resend (threaded) ──────────────────────
async function sendReply(to, subject, body, inReplyTo, references) {
  const resend = new Resend(RESEND_API_KEY);

  const htmlBody = body.split('\n').map(line =>
    line.trim() ? `<p style="margin: 0 0 12px 0; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333;">${line}</p>` : ''
  ).join('\n');

  const headers = {};
  if (inReplyTo) headers['In-Reply-To'] = inReplyTo;
  if (references && references.length > 0) {
    headers['References'] = [...references, inReplyTo].filter(Boolean).join(' ');
  }

  const replySubject = subject.startsWith('Re:') ? subject : `Re: ${subject}`;

  const { data, error } = await resend.emails.send({
    from: `Jack from BanffBound <${FROM_EMAIL}>`,
    to: [to],
    subject: replySubject,
    html: htmlBody,
    headers,
  });

  if (error) throw new Error(`Resend send error: ${JSON.stringify(error)}`);
  return data.id;
}

// ── Process a received email webhook ──────────────────────
export async function processIncomingEmail(webhookData) {
  const emailId = webhookData.data?.email_id;
  if (!emailId) {
    log.warn('No email_id in webhook');
    return;
  }

  const conversations = loadConversations();

  // Skip if already processed
  if (conversations.processed.includes(emailId)) {
    log.info(`Already processed ${emailId}, skipping`);
    return;
  }

  // Fetch full email content
  const resend = new Resend(RESEND_API_KEY);
  let email;
  try {
    const { data, error } = await resend.emails.receiving.get(emailId);
    if (error) throw new Error(JSON.stringify(error));
    email = data;
  } catch (err) {
    log.error(`Failed to fetch email ${emailId}: ${err.message}`);
    return;
  }

  const from = email.from || 'unknown';
  const to = (email.to || []).join(', ');
  const subject = email.subject || '(no subject)';
  const body = email.text || email.html?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ') || '';
  const messageId = email.message_id;

  log.info(`Processing email from ${from}: "${subject}"`);

  // Check if this is an affiliate sale notification BEFORE classification
  const sale = detectAffiliateSale(from, subject, body);
  if (sale) {
    const totals = recordSale(sale);

    const saleBlocks = [
      slackHeader(':money_with_wings: Affiliate Sale!'),
      slackFields([
        ['Partner', sale.partner.toUpperCase()],
        ['Product', sale.product.slice(0, 50)],
        ['Sale Price', `$${sale.price.toFixed(2)} ${sale.currency}`],
        ['Commission', `$${sale.commission.toFixed(2)} (${(sale.commissionRate * 100).toFixed(0)}%)`],
      ]),
      slackDivider(),
      slackSection(
        `:chart_with_upwards_trend: *Running Totals:* ${totals.count} sales | ` +
        `$${totals.revenue.toFixed(2)} revenue | $${totals.commission.toFixed(2)} commission earned`
      ),
    ];

    if (sale.bookingDate) {
      saleBlocks.push(slackSection(`:calendar: Booking date: ${sale.bookingDate}`));
    }

    await sendSlack(saleBlocks, `${sale.partner} Sale: $${sale.price} ${sale.currency}`);

    // Mark as processed and return early -- no need to classify or reply
    conversations.processed.push(emailId);
    if (conversations.processed.length > 500) {
      conversations.processed = conversations.processed.slice(-500);
    }
    saveConversations(conversations);

    return { emailId, type: 'affiliate_sale', sale };
  }

  // Classify the email
  const classification = await classifyEmail(from, subject, body);
  log.info(`Classified as: ${classification.intent} (${classification.sentiment})`);

  // Find or create conversation thread
  const fromEmail = from.match(/<([^>]+)>/)?.[1] || from.replace(/.*<|>.*/g, '').trim();
  const threadKey = fromEmail.toLowerCase();

  if (!conversations.threads[threadKey]) {
    conversations.threads[threadKey] = {
      from: fromEmail,
      fromName: from.replace(/<[^>]+>/, '').trim(),
      messages: [],
      references: [],
      classification: classification.intent,
      startedAt: new Date().toISOString(),
    };
  }

  const thread = conversations.threads[threadKey];

  // Add incoming message to thread
  thread.messages.push({
    direction: 'inbound',
    date: new Date().toISOString(),
    subject,
    body: body.slice(0, 5000),
    messageId,
    emailId,
    classification,
  });

  if (messageId) thread.references.push(messageId);

  // Flag to Slack
  const intentIcon = {
    blogger_reply: ':envelope_with_arrow:',
    collaboration_request: ':handshake:',
    guest_post_offer: ':pencil2:',
    link_exchange: ':link:',
    general_enquiry: ':question:',
    sponsorship: ':moneybag:',
    spam: ':no_entry:',
    auto_reply: ':robot_face:',
    unsubscribe: ':wave:',
  };

  const slackBlocks = [
    slackHeader('Incoming Email'),
    slackFields([
      ['From', from],
      ['To', to],
      ['Subject', subject],
      ['Intent', `${intentIcon[classification.intent] || ':email:'} ${classification.intent}`],
    ]),
    slackDivider(),
    slackSection(`*Summary:* ${classification.summary}`),
    slackSection(`*Body preview:*\n>${body.slice(0, 500).replace(/\n/g, '\n>')}`),
  ];

  // Generate and schedule delayed auto-reply if appropriate
  if (classification.requires_response && classification.intent !== 'spam' && classification.intent !== 'auto_reply') {
    const reply = await generateReply(from, subject, body, classification, thread.messages.slice(0, -1));

    if (reply !== 'NO_REPLY') {
      const replySubject = subject.startsWith('Re:') ? subject : `Re: ${subject}`;

      // Schedule reply with 20-30 min delay
      scheduleDelayedReply({
        to: fromEmail,
        subject: replySubject,
        body: reply,
        inReplyTo: messageId,
        references: [...thread.references],
        emailId,
      });

      slackBlocks.push(slackDivider());
      slackBlocks.push(slackSection(
        `:clock3: *Auto-reply scheduled (20-30 min delay):*\n${reply.slice(0, 500)}`
      ));

      if (classification.content_topic) {
        slackBlocks.push(slackDivider());
        slackBlocks.push(slackSection(
          `:bulb: *Content topic detected:* "${classification.content_topic}"\n` +
          `_Consider triggering Shareable Content agent for this topic._`
        ));
      }
    }
  }

  // Only send to Slack for worthy intents (skip spam, auto-replies, unsubscribes)
  if (SLACK_WORTHY_INTENTS.includes(classification.intent)) {
    await sendSlack(slackBlocks, `Email from ${from}: ${subject}`);
  } else {
    log.info(`Skipping Slack notification for ${classification.intent} email from ${from}`);
  }

  // Mark as processed
  conversations.processed.push(emailId);
  // Keep last 500 processed IDs
  if (conversations.processed.length > 500) {
    conversations.processed = conversations.processed.slice(-500);
  }
  saveConversations(conversations);

  return { emailId, classification, replied: classification.requires_response };
}

// ── Daily summary of inbox activity ───────────────────────
export async function run() {
  log.info('Inbox Monitor daily summary starting...');

  const conversations = loadConversations();
  const today = new Date().toISOString().split('T')[0];

  // Count today's activity
  let todayInbound = 0;
  let todayOutbound = 0;
  const todayThreads = [];

  for (const [key, thread] of Object.entries(conversations.threads)) {
    const todayMessages = thread.messages.filter(m => m.date?.startsWith(today));
    if (todayMessages.length > 0) {
      todayInbound += todayMessages.filter(m => m.direction === 'inbound').length;
      todayOutbound += todayMessages.filter(m => m.direction === 'outbound').length;
      todayThreads.push({
        from: thread.fromName || thread.from,
        intent: thread.classification,
        messageCount: todayMessages.length,
      });
    }
  }

  const totalThreads = Object.keys(conversations.threads).length;

  if (todayInbound === 0 && todayOutbound === 0) {
    await sendSlack(
      [slackSection(`:mailbox: *Inbox Summary:* No emails today. ${totalThreads} total conversation threads.`)],
      'Inbox Summary'
    );
    return { inbound: 0, outbound: 0 };
  }

  const blocks = [
    slackHeader('Daily Inbox Summary'),
    slackFields([
      ['Inbound Today', String(todayInbound)],
      ['Auto-Replies Sent', String(todayOutbound)],
      ['Total Threads', String(totalThreads)],
    ]),
    slackDivider(),
  ];

  if (todayThreads.length > 0) {
    const threadList = todayThreads.map(t =>
      `• *${t.from}* — ${t.intent} (${t.messageCount} messages)`
    ).join('\n');
    blocks.push(slackSection(`:speech_balloon: *Active Threads Today:*\n${threadList}`));
  }

  // Affiliate sales summary
  const salesData = loadSales();
  const todaySales = salesData.sales.filter(s => s.detectedAt?.startsWith(today));
  if (todaySales.length > 0) {
    const todayCommission = todaySales.reduce((sum, s) => sum + s.commission, 0);
    const todayRevenue = todaySales.reduce((sum, s) => sum + s.price, 0);
    blocks.push(slackDivider());
    blocks.push(slackSection(
      `:money_with_wings: *Affiliate Sales Today:* ${todaySales.length} sales\n` +
      `Revenue: $${todayRevenue.toFixed(2)} | Commission: $${todayCommission.toFixed(2)}`
    ));
    for (const s of todaySales) {
      blocks.push(slackSection(`• ${s.partner}: ${s.product.slice(0, 60)} — $${s.price.toFixed(2)} ($${s.commission.toFixed(2)} comm.)`));
    }
  }

  if (salesData.totals.count > 0) {
    blocks.push(slackDivider());
    blocks.push(slackSection(
      `:bar_chart: *All-Time Sales:* ${salesData.totals.count} bookings | ` +
      `$${salesData.totals.revenue.toFixed(2)} revenue | $${salesData.totals.commission.toFixed(2)} commission`
    ));
  }

  await sendSlack(blocks, 'Daily Inbox Summary');

  log.info(`Inbox summary: ${todayInbound} in, ${todayOutbound} out, ${totalThreads} total threads`);
  return { inbound: todayInbound, outbound: todayOutbound, totalThreads, todaySales: todaySales.length };
}
