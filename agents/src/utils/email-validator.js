import { createLogger } from '../core/logger.js';
import dns from 'dns';
import { promisify } from 'util';

const log = createLogger('email-validator');
const resolveMx = promisify(dns.resolveMx);

const INVALID_DOMAINS = new Set([
  'example.com', 'test.com', 'localhost', 'wixpress.com', 'wordpress.com',
  'sentry.io', 'googleapis.com', 'googleusercontent.com', 'gravatar.com',
  'w3.org', 'schema.org', 'json-ld.org', 'ogp.me', 'purl.org',
]);

const INVALID_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.js', '.css', '.woff', '.woff2'];

const INVALID_PREFIXES = [
  'noreply@', 'no-reply@', 'donotreply@', 'do-not-reply@',
  'mailer-daemon@', 'postmaster@', 'abuse@', 'support@',
  'notifications@', 'alert@', 'alerts@', 'billing@',
  'unsubscribe@', 'bounce@', 'feedback@',
];

// Emails that look like they were scraped from code/metadata rather than contact info
const CODE_PATTERNS = [
  /^[a-f0-9]{8,}@/, // hex hashes
  /\d{10,}@/, // long numeric strings
  /@.*\.(min|bundle|chunk)\./,
];

function isValidEmailFormat(email) {
  const e = email.toLowerCase().trim();
  if (e.length < 6 || e.length > 254) return false;
  if (!e.includes('@')) return false;

  const [local, domain] = e.split('@');
  if (!local || !domain) return false;
  if (local.length > 64) return false;
  if (!domain.includes('.')) return false;

  const domainBase = domain.split('.').slice(-2).join('.');

  if (INVALID_DOMAINS.has(domain) || INVALID_DOMAINS.has(domainBase)) return false;
  if (INVALID_EXTENSIONS.some(ext => e.endsWith(ext))) return false;
  if (INVALID_PREFIXES.some(p => e.startsWith(p))) return false;
  if (CODE_PATTERNS.some(p => p.test(e))) return false;

  return true;
}

function emailMatchesDomain(email, targetDomain) {
  const emailDomain = email.split('@')[1]?.toLowerCase();
  const target = targetDomain.toLowerCase().replace(/^www\./, '');
  if (!emailDomain) return false;

  // Exact match
  if (emailDomain === target) return true;
  if (emailDomain === `www.${target}`) return true;

  // Subdomain match (e.g. mail.thebanffblog.com matches thebanffblog.com)
  if (emailDomain.endsWith(`.${target}`)) return true;

  return false;
}

async function hasMxRecords(domain) {
  try {
    const records = await resolveMx(domain);
    return records && records.length > 0;
  } catch {
    return false;
  }
}

/**
 * Find and validate a contact email from a website.
 * Only returns emails that:
 * 1. Pass format validation
 * 2. Match the target domain
 * 3. Have valid MX records on the domain
 * 4. Are from an actual contact page (not scraped from random HTML)
 */
export async function findContactEmail(domain, url) {
  const emails = new Set();
  const targetDomain = domain.replace(/^www\./, '');

  const contactPages = [
    `https://${domain}/contact`,
    `https://${domain}/contact-us`,
    `https://${domain}/about`,
    `https://${domain}/about-us`,
    `https://${domain}/work-with-me`,
    `https://${domain}/work-with-us`,
    `https://${domain}/write-for-us`,
    `https://${domain}/contribute`,
    `https://www.${domain}/contact`,
    `https://www.${domain}/about`,
    `https://www.${domain}/work-with-me`,
  ];

  for (const pageUrl of contactPages.slice(0, 5)) {
    try {
      const res = await fetch(pageUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BanffBound/1.0)' },
        signal: AbortSignal.timeout(5000),
        redirect: 'follow',
      });
      if (!res.ok) continue;
      const html = await res.text();

      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const found = html.match(emailRegex) || [];

      for (const raw of found) {
        const email = raw.toLowerCase().trim();
        if (!isValidEmailFormat(email)) continue;
        if (!emailMatchesDomain(email, targetDomain)) continue;
        emails.add(email);
      }

      if (emails.size > 0) break;
    } catch {
      // Timeout or network error, continue
    }
  }

  if (emails.size === 0) {
    log.info(`No valid on-domain email found for ${domain}`);
    return null;
  }

  // Prioritize contact-type prefixes
  const priority = ['hello@', 'contact@', 'info@', 'hi@', 'editor@', 'editorial@',
                     'partnerships@', 'collab@', 'submissions@', 'contribute@'];

  const sorted = [...emails].sort((a, b) => {
    const aIdx = priority.findIndex(p => a.startsWith(p));
    const bIdx = priority.findIndex(p => b.startsWith(p));
    if (aIdx === -1 && bIdx === -1) return 0;
    if (aIdx === -1) return 1;
    if (bIdx === -1) return -1;
    return aIdx - bIdx;
  });

  const candidate = sorted[0];

  // Final check: verify the domain has MX records
  const emailDomain = candidate.split('@')[1];
  const hasMx = await hasMxRecords(emailDomain);
  if (!hasMx) {
    log.warn(`Email ${candidate} domain has no MX records — skipping`);
    return null;
  }

  log.info(`Validated email for ${domain}: ${candidate}`);
  return candidate;
}
