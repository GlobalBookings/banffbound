/**
 * Parks Canada fetcher — trail conditions + advisories for Banff National Park
 * Sources:
 *   - Trail conditions table: parks.canada.ca/.../etat-sentiers-trail-conditions
 *   - Bulletins/closures: parks.canada.ca/.../bulletins
 */

const LOG_PREFIX = '[parks-canada]';
const TRAILS_URL = 'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking/etat-sentiers-trail-conditions';
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

function normalizeCondition(raw) {
  const c = (raw || '').trim();
  if (!c) return { status: 'unknown', condition: 'Unknown' };

  const lower = c.toLowerCase();
  if (/closed|no access/i.test(lower)) return { status: 'closed', condition: c };
  if (/partially closed/i.test(lower)) return { status: 'caution', condition: c };
  if (/not recommended|hazardous/i.test(lower)) return { status: 'caution', condition: c };
  if (/avalanche/i.test(lower)) return { status: 'caution', condition: c };
  if (/snow covered|icy|variable.*winter|variable.*condition/i.test(lower)) return { status: 'caution', condition: c };
  if (/poor|fair/i.test(lower)) return { status: 'open', condition: c };
  if (/good|mainly dry/i.test(lower)) return { status: 'open', condition: c };
  return { status: 'open', condition: c };
}

function parseTrailsPage(html) {
  if (!html) return [];

  const trails = [];

  // The page has HTML tables with columns: Rating | Trail | Condition | Comment | Links
  // Each row is a <tr> with <td> cells
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;

  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const row = rowMatch[1];
    const cells = [];
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let cellMatch;
    while ((cellMatch = cellRegex.exec(row)) !== null) {
      cells.push(cellMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
    }

    // Expect: [difficulty_icon_alt, trail_name, condition, comment, links]
    if (cells.length < 3) continue;

    // Extract difficulty from the icon alt text or image filename
    const imgMatch = rowMatch[1].match(/(?:circle|square|diamond)\.gif|(?:Easy|Moderate|Difficult)/i);
    let difficulty = 'unknown';
    if (imgMatch) {
      const d = imgMatch[0].toLowerCase();
      if (d.includes('circle') || d.includes('easy')) difficulty = 'Easy';
      else if (d.includes('square') || d.includes('moderate')) difficulty = 'Moderate';
      else if (d.includes('diamond') || d.includes('difficult')) difficulty = 'Difficult';
    }

    // cells[0] might be the difficulty text, cells[1] is trail name, cells[2] is condition
    // But the first cell often contains the image, so the text is in cells after
    let name, conditionRaw, comment;

    if (cells[0].length < 20 && cells.length >= 4) {
      // First cell is difficulty label
      name = cells[1];
      conditionRaw = cells[2];
      comment = cells[3] || '';
    } else {
      name = cells[0];
      conditionRaw = cells[1];
      comment = cells[2] || '';
    }

    if (!name || name.length < 2) continue;
    // Skip header rows
    if (/^trail$/i.test(name) || /^rating$/i.test(name)) continue;
    // Skip the fire danger row
    if (/fire danger|banff national park/i.test(name) && !/trail/i.test(name)) continue;

    const { status, condition } = normalizeCondition(conditionRaw);

    // Extract date from comment
    const dateMatch = comment.match(/\d{4}-\d{2}-\d{2}/);
    const lastUpdated = dateMatch ? dateMatch[0] : null;

    // Clean up comment - remove the date prefix
    const cleanComment = comment
      .replace(/\d{4}-\d{2}-\d{2}:\s*/, '')
      .replace(/;\s*$/, '')
      .trim();

    trails.push({
      name,
      difficulty,
      status,
      condition,
      comment: cleanComment.slice(0, 200),
      lastUpdated,
    });
  }

  return trails;
}

function parseArea(html) {
  // Extract area sections (h3 headers split the tables)
  const areas = [];
  const sectionRegex = /<h3[^>]*>(.*?)<\/h3>([\s\S]*?)(?=<h3|<footer|$)/gi;
  let sectionMatch;

  while ((sectionMatch = sectionRegex.exec(html)) !== null) {
    const areaName = sectionMatch[1].replace(/<[^>]+>/g, '').trim();
    const sectionHtml = sectionMatch[2];
    if (/fire danger|important|related/i.test(areaName)) continue;

    const trails = parseTrailsPage(sectionHtml);
    if (trails.length > 0) {
      areas.push({ area: areaName, trails });
    }
  }

  return areas;
}

function parseBulletins(html) {
  if (!html) return [];

  const advisories = [];
  const mainMatch = html.match(/<main[\s\S]*?<\/main>/i);
  if (!mainMatch) return [];

  const main = mainMatch[0];
  const sections = main.split(/(?=(?:Area Closure|Trail Closure|Wildlife Closure|Road Closure|Warning|Advisory|Notice|Caution)[\s:]*)/i);

  for (const section of sections) {
    if (section.length < 20) continue;

    const titleMatch = section.match(/((?:Area|Trail|Wildlife|Road) Closure|Warning|Advisory|Notice|Caution)[:\s]*(.*?)(?:Issued|<|$)/is);
    if (!titleMatch) continue;

    const type = titleMatch[1].trim();
    const detail = titleMatch[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const title = detail ? `${type}: ${detail.slice(0, 120)}` : type;

    const issuedMatch = section.match(/Issued[:\s]*(\w+ \d{1,2},?\s*\d{4})/i);
    const endsMatch = section.match(/Ends?[:\s]*(\w+ \d{1,2},?\s*\d{4})/i);

    if (title.length > 10) {
      advisories.push({
        title,
        type,
        issued: issuedMatch ? issuedMatch[1].trim() : '',
        ends: endsMatch ? endsMatch[1].trim() : '',
      });
    }
  }

  // Deduplicate
  const seen = new Set();
  return advisories.filter(a => {
    const key = a.title.toLowerCase().slice(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function fetchParksCanada() {
  console.log(`${LOG_PREFIX} Starting Parks Canada data fetch…`);

  const [trailsHtml, bulletinsHtml] = await Promise.all([
    safeFetch(TRAILS_URL),
    safeFetch(BULLETINS_URL),
  ]);

  const areas = trailsHtml ? parseArea(trailsHtml) : [];
  const allTrails = areas.flatMap(a => a.trails.map(t => ({ ...t, area: a.area })));
  const advisories = parseBulletins(bulletinsHtml);

  // Extract fire danger
  let fireDanger = null;
  if (trailsHtml) {
    const fireMatch = trailsHtml.match(/fire danger.*?■\s*(\w+)/is) ||
      trailsHtml.match(/(?:Moderate|Low|High|Very High|Extreme)/i);
    if (fireMatch) fireDanger = fireMatch[1] || fireMatch[0];
  }

  // Summary stats
  const open = allTrails.filter(t => t.status === 'open').length;
  const caution = allTrails.filter(t => t.status === 'caution').length;
  const closed = allTrails.filter(t => t.status === 'closed').length;

  const data = {
    updatedAt: new Date().toISOString(),
    fireDanger,
    summary: { total: allTrails.length, open, caution, closed },
    areas,
    trails: allTrails,
    advisories,
    source: TRAILS_URL,
    ...(!trailsHtml ? { error: 'trail conditions page fetch failed' } : {}),
  };

  console.log(`${LOG_PREFIX} Parsed ${allTrails.length} trails (${open} open, ${caution} caution, ${closed} closed), ${advisories.length} advisories`);
  return data;
}
