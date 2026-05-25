/**
 * Snow report fetcher — ski resort conditions for Banff area resorts
 * Sources: Resort websites (Sunshine, Lake Louise, Norquay)
 */

const LOG_PREFIX = '[snow-report]';
const TIMEOUT_MS = 10_000;

const RESORTS = [
  {
    name: 'Sunshine Village',
    url: 'https://www.skibanff.com/conditions',
    patterns: {
      baseDepth: /base[:\s]*([\d.]+)\s*cm/i,
      newSnow24h: /(?:24\s*h(?:ou)?r?|new\s*snow)[:\s]*([\d.]+)\s*cm/i,
      newSnow48h: /48\s*h(?:ou)?r?[:\s]*([\d.]+)\s*cm/i,
      openRuns: /(\d+)\s*(?:of|\/)\s*(\d+)\s*(?:runs?|trails?)\s*open/i,
      openLifts: /(\d+)\s*(?:of|\/)\s*(\d+)\s*lifts?\s*open/i,
    },
  },
  {
    name: 'Lake Louise Ski Resort',
    url: 'https://www.skilouise.com/conditions/',
    patterns: {
      baseDepth: /base[:\s]*([\d.]+)\s*cm/i,
      newSnow24h: /(?:24\s*h(?:ou)?r?|new\s*snow|overnight)[:\s]*([\d.]+)\s*cm/i,
      newSnow48h: /48\s*h(?:ou)?r?[:\s]*([\d.]+)\s*cm/i,
      openRuns: /(\d+)\s*(?:of|\/)\s*(\d+)\s*(?:runs?|trails?)/i,
      openLifts: /(\d+)\s*(?:of|\/)\s*(\d+)\s*lifts?/i,
    },
  },
  {
    name: 'Mt. Norquay',
    url: 'https://banffnorquay.com/conditions/',
    patterns: {
      baseDepth: /base[:\s]*([\d.]+)\s*cm/i,
      newSnow24h: /(?:24\s*h(?:ou)?r?|new\s*snow)[:\s]*([\d.]+)\s*cm/i,
      newSnow48h: /48\s*h(?:ou)?r?[:\s]*([\d.]+)\s*cm/i,
      openRuns: /(\d+)\s*(?:of|\/)\s*(\d+)\s*(?:runs?|trails?)/i,
      openLifts: /(\d+)\s*(?:of|\/)\s*(\d+)\s*lifts?/i,
    },
  },
];

// Summer months when resorts are closed (June=5 through October=9)
const SUMMER_MONTHS = [5, 6, 7, 8, 9];

function isSummerSeason() {
  return SUMMER_MONTHS.includes(new Date().getMonth());
}

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

function parseResortConditions(html, resort) {
  const base = {
    name: resort.name,
    status: 'unknown',
    baseDepth: null,
    newSnow24h: null,
    newSnow48h: null,
    openRuns: null,
    totalRuns: null,
    openLifts: null,
    totalLifts: null,
  };

  if (!html) return { ...base, status: 'Unable to fetch data' };

  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');

  // Check if the page says closed
  if (/closed\s*for\s*(?:the\s*)?season/i.test(text)) {
    return { ...base, status: 'Closed for Season' };
  }

  // Try to extract data
  const depthMatch = text.match(resort.patterns.baseDepth);
  if (depthMatch) base.baseDepth = `${depthMatch[1]} cm`;

  const snow24Match = text.match(resort.patterns.newSnow24h);
  if (snow24Match) base.newSnow24h = `${snow24Match[1]} cm`;

  const snow48Match = text.match(resort.patterns.newSnow48h);
  if (snow48Match) base.newSnow48h = `${snow48Match[1]} cm`;

  const runsMatch = text.match(resort.patterns.openRuns);
  if (runsMatch) {
    base.openRuns = parseInt(runsMatch[1], 10);
    base.totalRuns = parseInt(runsMatch[2], 10);
  }

  const liftsMatch = text.match(resort.patterns.openLifts);
  if (liftsMatch) {
    base.openLifts = parseInt(liftsMatch[1], 10);
    base.totalLifts = parseInt(liftsMatch[2], 10);
  }

  // Determine status
  if (/open/i.test(text) && base.baseDepth) {
    base.status = 'Open';
  } else if (base.baseDepth || base.openRuns) {
    base.status = 'Open';
  } else {
    base.status = 'Check resort website';
  }

  return base;
}

/**
 * Main export
 */
export async function fetchSnowReport() {
  console.log(`${LOG_PREFIX} Starting snow report fetch…`);

  // In summer, skip fetching — resorts are closed
  if (isSummerSeason()) {
    console.log(`${LOG_PREFIX} Summer season detected — resorts closed for season`);
    return {
      updatedAt: new Date().toISOString(),
      resorts: RESORTS.map(r => ({
        name: r.name,
        status: 'Closed for Season',
        baseDepth: null,
        newSnow24h: null,
        newSnow48h: null,
        openRuns: null,
        totalRuns: null,
        openLifts: null,
        totalLifts: null,
      })),
    };
  }

  // Fetch all resorts in parallel
  const htmlResults = await Promise.all(RESORTS.map(r => safeFetch(r.url)));

  const resorts = RESORTS.map((resort, i) => parseResortConditions(htmlResults[i], resort));

  const data = {
    updatedAt: new Date().toISOString(),
    resorts,
  };

  console.log(`${LOG_PREFIX} Parsed ${resorts.length} resorts`);
  return data;
}
