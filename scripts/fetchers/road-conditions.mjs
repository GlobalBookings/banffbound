/**
 * Road conditions fetcher — Alberta highway status for Banff-area roads
 * Source: 511.alberta.ca API (public, no key needed)
 */

const LOG_PREFIX = '[road-conditions]';
const API_URL = 'https://511.alberta.ca/api/v2/get/winterroads';
const TIMEOUT_MS = 10_000;

// Roads relevant to Banff visitors, identified by RoadwayName patterns
const BANFF_ROADS = [
  { match: /^Hwy 1$/i, areaMatch: /banff/i, name: 'Trans-Canada Highway (Hwy 1)', number: '1' },
  { match: /^Hwy 1A/i, areaMatch: /banff/i, name: 'Bow Valley Parkway (Hwy 1A)', number: '1A' },
  { match: /^Hwy 93 N/i, areaMatch: null, name: 'Icefields Parkway (Hwy 93N)', number: '93N' },
  { match: /^Hwy 93 S|^Hwy 93$/i, areaMatch: /banff|kootenay/i, name: 'Hwy 93 South (Kootenay)', number: '93S' },
  { match: /minnewanka/i, areaMatch: null, name: 'Lake Minnewanka Road', number: '' },
  { match: /golf course/i, areaMatch: /banff/i, name: 'Golf Course Road', number: '' },
];

function matchSegments(segments) {
  const highways = [];

  for (const road of BANFF_ROADS) {
    const matching = segments.filter(s => {
      const nameMatch = road.match.test(s.RoadwayName || '');
      const areaOk = !road.areaMatch || road.areaMatch.test(s.AreaName || '');
      return nameMatch && areaOk;
    });

    if (matching.length === 0) continue;

    // Aggregate conditions across segments
    const conditions = {};
    for (const seg of matching) {
      const cond = seg['Primary Condition'] || 'Unknown';
      conditions[cond] = (conditions[cond] || 0) + 1;
    }

    // Pick the most common condition
    const sortedConditions = Object.entries(conditions).sort((a, b) => b[1] - a[1]);
    const primaryCondition = sortedConditions[0][0];

    // Check for any closures
    const closedSegments = matching.filter(s => /closed/i.test(s['Primary Condition'] || ''));
    const hasClosures = closedSegments.length > 0;

    // Build segment detail
    const segmentDetails = matching.map(s => ({
      section: s.LocationDescription || '',
      condition: s['Primary Condition'] || 'Unknown',
      visibility: s.Visibility || null,
    }));

    // Determine overall status
    let status = primaryCondition;
    if (hasClosures && closedSegments.length === matching.length) {
      status = 'Closed';
    } else if (hasClosures) {
      status = `Partial Closure (${closedSegments.length}/${matching.length} sections)`;
    }

    // Determine advisory
    let advisory = '';
    if (/snow|ice|packed/i.test(primaryCondition)) {
      advisory = 'Winter driving conditions — snow tires or chains required';
    } else if (hasClosures) {
      const closedNames = closedSegments.map(s => s.LocationDescription).filter(Boolean).join('; ');
      advisory = `Closed sections: ${closedNames || 'check 511.alberta.ca'}`;
    }

    const lastUpdated = matching[0]?.LastUpdated || null;

    highways.push({
      name: road.name,
      number: road.number,
      status,
      conditions: primaryCondition,
      advisory,
      segments: segmentDetails.length,
      lastUpdated,
    });
  }

  return highways;
}

export async function fetchRoadConditions() {
  console.log(`${LOG_PREFIX} Starting road conditions fetch…`);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    console.log(`${LOG_PREFIX} Fetching ${API_URL}`);
    const res = await fetch(API_URL, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) {
      console.log(`${LOG_PREFIX} HTTP ${res.status}`);
      return fallback('API returned ' + res.status);
    }

    const segments = await res.json();
    if (!Array.isArray(segments)) {
      console.log(`${LOG_PREFIX} Unexpected response format`);
      return fallback('Unexpected API format');
    }

    console.log(`${LOG_PREFIX} Got ${segments.length} total road segments from 511 Alberta`);

    const highways = matchSegments(segments);
    console.log(`${LOG_PREFIX} Matched ${highways.length} Banff-area roads`);

    return {
      updatedAt: new Date().toISOString(),
      highways,
      source: 'https://511.alberta.ca',
    };
  } catch (err) {
    console.log(`${LOG_PREFIX} Error: ${err.message}`);
    return fallback(err.message);
  }
}

function fallback(reason) {
  return {
    updatedAt: new Date().toISOString(),
    highways: [],
    source: 'https://511.alberta.ca',
    error: reason,
  };
}
