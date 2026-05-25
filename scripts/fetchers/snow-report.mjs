/**
 * Snow report fetcher — ski resort conditions for Banff Big 3
 * Uses resort websites + known data patterns
 * In off-season (Jun-Oct), reports "Closed for Season" without fetching
 */

const LOG_PREFIX = '[snow-report]';
const TIMEOUT_MS = 15_000;

async function safeFetch(url) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'BanffBound/1.0 (https://banffbound.com)' },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function parseNorquay(html) {
  if (!html) return null;

  // Norquay has numbers in the page: base depth, season total, etc.
  const cmValues = [...html.matchAll(/(\d+)\s*cm/gi)].map(m => parseInt(m[1]));

  // Check for "Closed" status
  const isClosed = /season.*(?:over|closed|ended)|closed.*season/i.test(html) ||
    html.includes('>Closed<');

  // Look for specific data patterns
  const baseMatch = html.match(/base[^<]*?(\d+)\s*cm/i) ||
    html.match(/(?:snow\s*)?depth[^<]*?(\d+)\s*cm/i);
  const newSnowMatch = html.match(/(?:new|fresh|24)[^<]*?(\d+)\s*cm/i);
  const seasonMatch = html.match(/season[^<]*?(\d+)\s*cm/i);

  return {
    name: 'Mt. Norquay',
    status: isClosed ? 'Closed for Season' : 'Open',
    baseDepth: baseMatch ? `${baseMatch[1]} cm` : null,
    newSnow24h: newSnowMatch ? `${newSnowMatch[1]} cm` : '0 cm',
    seasonTotal: seasonMatch ? `${seasonMatch[1]} cm` : null,
    openRuns: null, totalRuns: 60,
    openLifts: null, totalLifts: 5,
    website: 'https://banffnorquay.com/conditions/',
  };
}

function parseLouise(html) {
  if (!html) return null;

  const isClosed = /season.*(?:over|closed|ended)|closed.*season/i.test(html);

  // Lake Louise shows "open" or "closed" for various facilities
  const openCount = (html.match(/>\s*open\s*</gi) || []).length;
  const closedCount = (html.match(/>\s*closed\s*</gi) || []).length;

  const baseMatch = html.match(/base[^<]*?(\d+)\s*cm/i);
  const newMatch = html.match(/(?:new|24|overnight)[^<]*?(\d+)\s*cm/i);

  return {
    name: 'Lake Louise Ski Resort',
    status: isClosed ? 'Closed for Season' : (openCount > closedCount ? 'Open' : 'Closed for Season'),
    baseDepth: baseMatch ? `${baseMatch[1]} cm` : null,
    newSnow24h: newMatch ? `${newMatch[1]} cm` : null,
    seasonTotal: null,
    openRuns: null, totalRuns: 164,
    openLifts: null, totalLifts: 11,
    website: 'https://www.skilouise.com/conditions/',
  };
}

function parseSunshine(html) {
  if (!html) return null;

  // Sunshine uses Handlebars templates that render client-side,
  // but the page does have some static text
  const isClosed = /season.*(?:over|closed|ended)|closed.*season/i.test(html);

  // Look for "Open Until May 18th" type patterns
  const openUntilMatch = html.match(/open\s+(?:until|through|till)\s+(\w+\s+\d+)/i);

  const baseMatch = html.match(/base[^<]*?(\d+)\s*cm/i);
  const newMatch = html.match(/(?:new|24|overnight)[^<]*?(\d+)\s*cm/i);

  let status = 'Closed for Season';
  if (openUntilMatch) {
    status = `Open until ${openUntilMatch[1]}`;
  } else if (!isClosed) {
    // Check for general open indicators
    if (/currently\s+open|we.re\s+open|now\s+open/i.test(html)) {
      status = 'Open';
    }
  }

  return {
    name: 'Sunshine Village',
    status,
    baseDepth: baseMatch ? `${baseMatch[1]} cm` : null,
    newSnow24h: newMatch ? `${newMatch[1]} cm` : null,
    seasonTotal: null,
    openRuns: null, totalRuns: 137,
    openLifts: null, totalLifts: 12,
    website: 'https://www.skibanff.com/conditions',
  };
}

export async function fetchSnowReport() {
  console.log(`${LOG_PREFIX} Starting snow report fetch…`);

  // In deep off-season (Jul-Sep), skip fetching entirely
  const month = new Date().getMonth(); // 0-indexed
  if (month >= 6 && month <= 8) {
    console.log(`${LOG_PREFIX} Off-season (${['Jul','Aug','Sep'][month-6]}) — skipping resort fetches`);
    return {
      updatedAt: new Date().toISOString(),
      offSeason: true,
      seasonOpens: 'Early November',
      resorts: [
        { name: 'Sunshine Village', status: 'Closed for Season — Opens November', website: 'https://www.skibanff.com/conditions', totalRuns: 137 },
        { name: 'Lake Louise Ski Resort', status: 'Closed for Season — Opens November', website: 'https://www.skilouise.com/conditions/', totalRuns: 164 },
        { name: 'Mt. Norquay', status: 'Closed for Season — Opens November', website: 'https://banffnorquay.com/conditions/', totalRuns: 60 },
      ],
    };
  }

  console.log(`${LOG_PREFIX} Fetching resort conditions pages…`);
  const [sunshineHtml, louiseHtml, norquayHtml] = await Promise.all([
    safeFetch('https://www.skibanff.com/conditions'),
    safeFetch('https://www.skilouise.com/conditions/'),
    safeFetch('https://banffnorquay.com/conditions/'),
  ]);

  const resorts = [
    parseSunshine(sunshineHtml) || { name: 'Sunshine Village', status: 'Check website', website: 'https://www.skibanff.com/conditions' },
    parseLouise(louiseHtml) || { name: 'Lake Louise Ski Resort', status: 'Check website', website: 'https://www.skilouise.com/conditions/' },
    parseNorquay(norquayHtml) || { name: 'Mt. Norquay', status: 'Check website', website: 'https://banffnorquay.com/conditions/' },
  ];

  console.log(`${LOG_PREFIX} Parsed: ${resorts.map(r => `${r.name}: ${r.status}`).join(', ')}`);

  return {
    updatedAt: new Date().toISOString(),
    offSeason: false,
    resorts,
  };
}
