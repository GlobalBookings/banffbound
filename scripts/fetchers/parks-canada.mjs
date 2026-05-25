/**
 * Parks Canada fetcher — trail conditions and park advisories for Banff
 * Sources: pc.gc.ca trail and bulletin pages (HTML, parsed with regex)
 */

const LOG_PREFIX = '[parks-canada]';
const TRAILS_URL = 'https://www.pc.gc.ca/en/pn-np/ab/banff/visit/les-sentiers-trails';
const BULLETINS_URL = 'https://www.pc.gc.ca/en/pn-np/ab/banff/bulletins';
const TIMEOUT_MS = 10_000;

/**
 * Fetch a URL with a 10-second timeout, return text or null.
 */
async function safeFetch(url) {
  try {
    console.log(`${LOG_PREFIX} Fetching ${url}`);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) {
      console.log(`${LOG_PREFIX} HTTP ${res.status} for ${url}`);
      return null;
    }
    return await res.text();
  } catch (err) {
    console.log(`${LOG_PREFIX} Fetch error for ${url}: ${err.message}`);
    return null;
  }
}

/**
 * Parse trail status entries from the trails HTML page.
 * Looks for common patterns in Parks Canada trail pages.
 */
function parseTrails(html) {
  const trails = [];
  if (!html) return trails;

  // Try to find trail-status table rows or list items
  // Parks Canada uses various patterns — try several

  // Pattern 1: table rows with trail name and status
  const tableRowRegex = /<tr[^>]*>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/gi;
  let match;
  while ((match = tableRowRegex.exec(html)) !== null) {
    const name = stripHtml(match[1]).trim();
    const statusRaw = stripHtml(match[2]).trim().toLowerCase();
    if (!name || name.length > 120 || /^trail|^name/i.test(name)) continue;
    const status = inferStatus(statusRaw);
    if (name.length > 2) {
      trails.push({ name, status, note: statusRaw !== status ? statusRaw : '' });
    }
  }

  // Pattern 2: heading + paragraph or list combos
  if (trails.length === 0) {
    const headingRegex = /<h[2-4][^>]*>(.*?)<\/h[2-4]>/gi;
    while ((match = headingRegex.exec(html)) !== null) {
      const name = stripHtml(match[1]).trim();
      // Grab text after the heading up to the next heading
      const afterIdx = match.index + match[0].length;
      const nextHeading = html.indexOf('<h', afterIdx);
      const block = html.slice(afterIdx, nextHeading > 0 ? nextHeading : afterIdx + 500);
      const text = stripHtml(block).trim();
      const status = inferStatus(text.toLowerCase());
      if (name.length > 2 && name.length < 100 && /trail|path|route|lake|canyon/i.test(name)) {
        trails.push({ name, status, note: text.slice(0, 200) });
      }
    }
  }

  return trails.slice(0, 60); // cap at 60 entries
}

/**
 * Parse advisory / bulletin entries from the bulletins page.
 */
function parseAdvisories(html) {
  const advisories = [];
  if (!html) return advisories;

  // Try to extract article-like blocks with date and title
  const articleRegex = /<article[^>]*>([\s\S]*?)<\/article>/gi;
  let match;
  while ((match = articleRegex.exec(html)) !== null) {
    const block = match[1];
    const titleMatch = block.match(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/i);
    const dateMatch = block.match(/<time[^>]*(?:datetime="([^"]*)")?[^>]*>([\s\S]*?)<\/time>/i);
    const pMatch = block.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    if (titleMatch) {
      advisories.push({
        title: stripHtml(titleMatch[1]).trim(),
        date: dateMatch ? (dateMatch[1] || stripHtml(dateMatch[2]).trim()) : '',
        summary: pMatch ? stripHtml(pMatch[1]).trim().slice(0, 300) : '',
      });
    }
  }

  // Fallback: look for list items with links that look like actual advisories
  // Be very selective — only match items that reference bulletins, closures, warnings, etc.
  if (advisories.length === 0) {
    const contentKeywords = /closure|advisory|warning|alert|bulletin|wildfire|flood|bear|road|trail|campground|restriction|update|notice|avalanche|storm/i;
    const liRegex = /<li[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>[\s\S]*?<\/li>/gi;
    while ((match = liRegex.exec(html)) !== null) {
      const text = stripHtml(match[1]).trim();
      if (text.length > 15 && text.length < 200 && contentKeywords.test(text)) {
        advisories.push({ title: text, date: '', summary: '' });
      }
    }
  }

  return advisories.slice(0, 20);
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#?\w+;/g, ' ').replace(/\s+/g, ' ');
}

function inferStatus(text) {
  if (/closed|ferm[eé]/i.test(text)) return 'closed';
  if (/caution|warning|advisory|partial/i.test(text)) return 'caution';
  if (/open|ouvert/i.test(text)) return 'open';
  return 'unknown';
}

/**
 * Main export — fetches and returns trail conditions data.
 */
export async function fetchParksCanada() {
  console.log(`${LOG_PREFIX} Starting Parks Canada data fetch…`);

  const [trailsHtml, bulletinsHtml] = await Promise.all([
    safeFetch(TRAILS_URL),
    safeFetch(BULLETINS_URL),
  ]);

  const hasError = !trailsHtml && !bulletinsHtml;
  const trails = parseTrails(trailsHtml);
  const advisories = parseAdvisories(bulletinsHtml);

  const data = {
    updatedAt: new Date().toISOString(),
    trails,
    advisories,
    ...(hasError ? { error: 'fetch failed' } : {}),
  };

  console.log(`${LOG_PREFIX} Parsed ${trails.length} trails, ${advisories.length} advisories`);
  return data;
}
