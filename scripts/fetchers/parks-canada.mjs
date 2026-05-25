/**
 * Parks Canada fetcher — trail advisories and closures for Banff National Park
 * Source: parks.canada.ca bulletins page (server-rendered HTML)
 */

const LOG_PREFIX = '[parks-canada]';
const BULLETINS_URL = 'https://parks.canada.ca/pn-np/ab/banff/bulletins';
const TIMEOUT_MS = 15_000;

async function safeFetch(url) {
  try {
    console.log(`${LOG_PREFIX} Fetching ${url}`);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'BanffBound/1.0 (https://banffbound.com)' },
    });
    clearTimeout(timer);
    if (!res.ok) {
      console.log(`${LOG_PREFIX} HTTP ${res.status} for ${url}`);
      return null;
    }
    return await res.text();
  } catch (err) {
    console.log(`${LOG_PREFIX} Fetch error: ${err.message}`);
    return null;
  }
}

function parseBulletins(html) {
  if (!html) return { trails: [], advisories: [] };

  const advisories = [];

  // The bulletins page has content like:
  // "Area Closure: Tunnel Toe Wildfire Risk Reduction Project"
  // "Issued: May 15, 2026  Ends: July 01, 2026"
  // Parse advisory blocks - they appear in the main content
  const mainMatch = html.match(/<main[\s\S]*?<\/main>/i);
  if (!mainMatch) return { trails: [], advisories: [] };

  const main = mainMatch[0];

  // Split on "Issued:" to find individual bulletins
  const sections = main.split(/(?=(?:Area Closure|Trail Closure|Wildlife Closure|Road Closure|Warning|Advisory|Notice|Caution)[\s:]*)/i);

  for (const section of sections) {
    if (section.length < 20) continue;

    // Extract title (first meaningful text)
    const titleMatch = section.match(/((?:Area|Trail|Wildlife|Road) Closure|Warning|Advisory|Notice|Caution)[:\s]*(.*?)(?:Issued|<|$)/is);
    if (!titleMatch) continue;

    const type = titleMatch[1].trim();
    const detail = titleMatch[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const title = detail ? `${type}: ${detail.slice(0, 120)}` : type;

    // Extract dates
    const issuedMatch = section.match(/Issued[:\s]*(\w+ \d{1,2},?\s*\d{4})/i);
    const endsMatch = section.match(/Ends?[:\s]*(\w+ \d{1,2},?\s*\d{4})/i);
    const issued = issuedMatch ? issuedMatch[1].trim() : '';
    const ends = endsMatch ? endsMatch[1].trim() : '';

    // Extract summary text (strip HTML)
    const summaryText = section.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const summary = summaryText.slice(0, 300);

    if (title.length > 10) {
      advisories.push({ title, type, issued, ends, summary });
    }
  }

  // Deduplicate by title similarity
  const unique = [];
  const seen = new Set();
  for (const adv of advisories) {
    const key = adv.title.toLowerCase().slice(0, 50);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(adv);
    }
  }

  // Derive trail status from advisories
  const trails = [];
  for (const adv of unique) {
    const lowerTitle = adv.title.toLowerCase();
    if (lowerTitle.includes('trail closure') || lowerTitle.includes('area closure')) {
      trails.push({
        name: adv.title.replace(/^(Trail|Area) Closure:\s*/i, ''),
        status: 'closed',
        note: adv.ends ? `Closed until ${adv.ends}` : 'Closed',
      });
    } else if (lowerTitle.includes('warning') || lowerTitle.includes('caution') || lowerTitle.includes('wildlife')) {
      trails.push({
        name: adv.title.replace(/^(Warning|Caution|Wildlife Closure):\s*/i, ''),
        status: 'caution',
        note: adv.summary.slice(0, 100),
      });
    }
  }

  return { trails, advisories: unique };
}

export async function fetchParksCanada() {
  console.log(`${LOG_PREFIX} Starting Parks Canada data fetch…`);

  const html = await safeFetch(BULLETINS_URL);
  const { trails, advisories } = parseBulletins(html);

  const data = {
    updatedAt: new Date().toISOString(),
    trails,
    advisories,
    source: BULLETINS_URL,
    ...(!html ? { error: 'fetch failed' } : {}),
  };

  console.log(`${LOG_PREFIX} Parsed ${trails.length} trail alerts, ${advisories.length} advisories`);
  return data;
}
