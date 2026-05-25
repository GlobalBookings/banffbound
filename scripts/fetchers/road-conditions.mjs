/**
 * Road conditions fetcher — Alberta highway conditions for key Banff routes
 * Sources: 511.alberta.ca API or fallback
 */

const LOG_PREFIX = '[road-conditions]';
const API_URL = 'https://511.alberta.ca/api/v2/get/winterroads';
const FALLBACK_URL = 'https://511.alberta.ca';
const TIMEOUT_MS = 10_000;

// Highways we care about
const TARGET_HIGHWAYS = [
  { name: 'Trans-Canada Highway', number: '1', patterns: ['highway 1', 'hwy 1', 'trans-canada', 'trans canada'] },
  { name: 'Icefields Parkway', number: '93', patterns: ['highway 93', 'hwy 93', 'icefields', 'parkway'] },
  { name: 'Highway 1A (Bow Valley Parkway)', number: '1A', patterns: ['highway 1a', 'hwy 1a', 'bow valley'] },
  { name: 'Highway 11 (David Thompson)', number: '11', patterns: ['highway 11', 'hwy 11', 'david thompson'] },
];

async function safeFetch(url) {
  try {
    console.log(`${LOG_PREFIX} Fetching ${url}`);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json, text/html, */*' },
    });
    clearTimeout(timer);
    if (!res.ok) {
      console.log(`${LOG_PREFIX} HTTP ${res.status} for ${url}`);
      return null;
    }
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('json')) {
      return { type: 'json', data: await res.json() };
    }
    return { type: 'text', data: await res.text() };
  } catch (err) {
    console.log(`${LOG_PREFIX} Fetch error for ${url}: ${err.message}`);
    return null;
  }
}

function parseApiResponse(response) {
  if (!response || !response.data) return null;

  // Track which target highways we've already found to avoid duplicates
  const found = new Map();
  const items = Array.isArray(response.data) ? response.data : [response.data];

  for (const item of items) {
    const text = JSON.stringify(item).toLowerCase();
    for (const target of TARGET_HIGHWAYS) {
      // Skip if we already found this highway
      if (found.has(target.number)) continue;
      if (target.patterns.some(p => text.includes(p))) {
        found.set(target.number, {
          name: target.name,
          number: target.number,
          status: item.status || item.condition || 'Check 511.alberta.ca',
          conditions: item.conditions || item.roadCondition || item.description || '',
          advisory: item.advisory || item.message || '',
        });
      }
    }
  }

  const highways = Array.from(found.values());
  return highways.length > 0 ? highways : null;
}

function parseHtmlResponse(html) {
  if (!html) return null;

  const highways = [];
  const text = html.replace(/<[^>]*>/g, ' ').toLowerCase();

  for (const target of TARGET_HIGHWAYS) {
    if (target.patterns.some(p => text.includes(p))) {
      // Try to grab context around the match
      const pattern = target.patterns.find(p => text.includes(p));
      const idx = text.indexOf(pattern);
      const context = text.slice(idx, idx + 200).replace(/\s+/g, ' ').trim();

      const statusMatch = context.match(/(bare|dry|wet|icy|snow|covered|compact|closed|open|seasonal)/i);
      highways.push({
        name: target.name,
        number: target.number,
        status: statusMatch ? statusMatch[1] : 'Check 511.alberta.ca',
        conditions: context.slice(0, 150),
        advisory: '',
      });
    }
  }

  return highways.length > 0 ? highways : null;
}

/**
 * Main export
 */
export async function fetchRoadConditions() {
  console.log(`${LOG_PREFIX} Starting road conditions fetch…`);

  // Try the API first
  const apiResult = await safeFetch(API_URL);
  let highways = null;

  if (apiResult) {
    if (apiResult.type === 'json') {
      highways = parseApiResponse(apiResult);
    } else {
      highways = parseHtmlResponse(apiResult.data);
    }
  }

  // If API didn't work, try the main site
  if (!highways) {
    console.log(`${LOG_PREFIX} API didn't return usable data, trying main site…`);
    const siteResult = await safeFetch(FALLBACK_URL);
    if (siteResult && siteResult.type === 'text') {
      highways = parseHtmlResponse(siteResult.data);
    }
  }

  // If nothing worked, provide static fallback
  if (!highways) {
    console.log(`${LOG_PREFIX} Using static fallback — live data not available`);
    highways = TARGET_HIGHWAYS.map(h => ({
      name: h.name,
      number: h.number,
      status: 'Check 511.alberta.ca for current conditions',
      conditions: '',
      advisory: 'Live road data unavailable — visit 511.alberta.ca for real-time conditions',
    }));
  }

  const data = {
    updatedAt: new Date().toISOString(),
    highways,
    source: 'https://511.alberta.ca',
  };

  console.log(`${LOG_PREFIX} Got conditions for ${highways.length} highways`);
  return data;
}
