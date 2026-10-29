/** Small, fail-closed adapters for official report markup reviewed 2026-10-28.
 * These are experimental HTML extractors, not a live operating-status service.
 */
export const SNOW_SOURCES = Object.freeze([
  { id: 'sunshine', name: 'Sunshine Village', sourceUrl: 'https://www.skibanff.com/the-mountain/mountain-report/current-conditions', heading: 'Current Conditions' },
  { id: 'louise', name: 'Lake Louise Ski Resort', sourceUrl: 'https://www.skilouise.com/snow-conditions/', heading: 'Conditions & Weather' },
  { id: 'norquay', name: 'Mt. Norquay', sourceUrl: 'https://banffnorquay.com/conditions/', heading: 'Daily Conditions Update' },
]);

const fields = ['baseDepth', 'newSnow24h', 'seasonTotal', 'openRuns', 'totalRuns', 'openLifts', 'totalLifts'];
const normalize = value => value.replace(/\s+/g, ' ').trim();
const entities = { amp: '&', nbsp: ' ', lt: '<', gt: '>', quot: '"', apos: "'", rsquo: "'", lsquo: "'", ndash: '–', mdash: '—', deg: '°', sol: '/', period: '.', comma: ',', colon: ':', semi: ';', lpar: '(', rpar: ')' };
function decode(text) {
  return text.replace(/[‘’]/g, "'").replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (original, entity) => {
    if (entity[0] !== '#') return entities[entity.toLowerCase()] ?? original;
    const value = Number.parseInt(entity.slice(entity[1].toLowerCase() === 'x' ? 2 : 1), entity[1].toLowerCase() === 'x' ? 16 : 10);
    return value > 0 && value <= 0x10ffff ? String.fromCodePoint(value) : ' ';
  });
}

/** Keep text/headings, excluding non-rendered data and explicitly hidden subtrees.
 * In particular, Louise's serialized WP editor content is not a report observation.
 */
function reportDocument(html) {
  const cleaned = html.replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|template|noscript|svg)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ');
  const stack = [];
  const parts = [];
  const headings = [];
  const voids = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  const blocks = /^(?:h[1-6]|p|div|section|article|main|header|footer|li|tr|td|th|br|hr)$/;
  let heading = null;
  for (const token of cleaned.matchAll(/<\/?([a-z][\w:-]*)\b[^>]*>|([^<]+)/gi)) {
    if (token[2] !== undefined) {
      if (!stack.at(-1)?.hidden) {
        const text = decode(token[2]);
        parts.push(text);
        if (heading) heading.parts.push(text);
      }
      continue;
    }
    const tag = token[1].toLowerCase();
    const closing = token[0].startsWith('</');
    if (closing) {
      if (heading?.tag === tag) { headings.push({ level: Number(tag[1]), text: normalize(heading.parts.join(' ')) }); heading = null; }
      const index = stack.findLastIndex(frame => frame.tag === tag);
      if (index !== -1) stack.length = index;
      if (blocks.test(tag)) parts.push('\n');
      continue;
    }
    const hidden = Boolean(stack.at(-1)?.hidden)
      || /\shidden(?:\s|=|\/?>)/i.test(token[0])
      || /\saria-hidden\s*=\s*["']true["']/i.test(token[0])
      || /\sstyle\s*=\s*["'][^"']*(?:display\s*:\s*none|visibility\s*:\s*hidden)/i.test(token[0])
      || ['desktop', 'laptop', 'tablet', 'mobile'].every(size => token[0].includes('elementor-hidden-' + size));
    if (!voids.has(tag) && !token[0].endsWith('/>')) stack.push({ tag, hidden });
    if (hidden) continue;
    if (blocks.test(tag)) parts.push('\n');
    if (/^h[1-6]$/.test(tag)) heading = { tag, parts: [] };
  }
  return { text: parts.join(' ').split('\n').map(normalize).filter(Boolean).join('\n'), headings };
}

function uniqueSection(text, start, end) {
  const first = text.indexOf(start);
  if (first < 0 || text.indexOf(start, first + start.length) !== -1) return null;
  const ends = (Array.isArray(end) ? end : [end]).map(label => text.indexOf(label, first + start.length)).filter(index => index > first);
  const last = ends.length ? Math.min(...ends) : -1;
  return last > first ? text.slice(first + start.length, last) : null;
}

function oneMatch(text, expression) {
  if (!text) return null;
  const matches = [...text.matchAll(expression)];
  return matches.length === 1 ? matches[0] : null;
}

function metric(text, expression, label, location) {
  const match = oneMatch(text, expression);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) && value >= 0 && value <= 5000
    ? { value, unit: 'cm', label, location } : null;
}

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function explicitDate(text) {
  const match = text?.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:st|nd|rd|th)?,\s+(\d{4})\b/i);
  if (!match) return null;
  const month = monthNames.findIndex(name => name.toLowerCase() === match[1].toLowerCase()) + 1;
  const day = Number(match[2]);
  const year = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day
    ? [year, String(month).padStart(2, '0'), String(day).padStart(2, '0')].join('-') : null;
}

function sourceTime(text, id) {
  const expression = id === 'norquay'
    ? /^Conditions update for\s+([^\n]+)$/gmi
    : /^Updated:\s*((?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+[^\n]+)$/gmi;
  const match = oneMatch(text, expression);
  const label = match ? match[1].replace(/\.$/, '').trim() : null;
  return { sourceReportedAtText: label, sourceReportDate: explicitDate(label) };
}

export function unavailableSnowReport(source, { retrievedAt = null, error = 'Official report values could not be verified.' } = {}) {
  return {
    id: source.id, name: source.name, website: source.sourceUrl, sourceUrl: source.sourceUrl,
    retrievedAt, sourceReportedAt: null, sourceReportedAtText: null, sourceReportDate: null,
    // The reviewed human-readable labels do not specify an offset/time zone.
    sourceTimeZone: null, status: null, reportSummary: null,
    ...Object.fromEntries(fields.map(field => [field, null])),
    measurements: {}, parser: 'experimental-html-v1', availability: 'unavailable', error,
  };
}

/** No resort operation or dates are inferred from the calendar, snow, or facility words. */
export function parseSnowReport(html, source, { retrievedAt = null } = {}) {
  const report = unavailableSnowReport(source, { retrievedAt });
  if (typeof html !== 'string' || !html.trim()) return report;
  const document = reportDocument(html);
  const reportHeadings = document.headings.filter(heading => heading.level === 1 && heading.text === source.heading);
  if (reportHeadings.length !== 1) return report;
  Object.assign(report, sourceTime(document.text, source.id));
  delete report.error;
  report.availability = 'partial';

  if (source.id === 'sunshine') {
    report.reportSummary = normalize(uniqueSection(document.text, 'Summary', 'Upper Mountain Snow Report') || '').slice(0, 240) || null;
  } else if (source.id === 'louise') {
    // Numeric editor/template/forecast data is intentionally unsupported until a
    // labelled, rendered snow-report section has been verified and regression-tested.
    const headingIndex = document.headings.indexOf(reportHeadings[0]);
    const summary = document.headings.slice(headingIndex + 1).find(heading => heading.level === 4)?.text;
    report.reportSummary = summary && !/^Weather Forecast/i.test(summary) ? summary.slice(0, 240) : null;
  } else if (source.id === 'norquay' && report.sourceReportedAtText) {
    report.reportSummary = normalize(uniqueSection(document.text, 'Conditions update for ' + report.sourceReportedAtText + '.', 'Current Temperature:') || '').slice(0, 240) || null;
  }

  // A newly retrieved page does not make an undated measurement current.
  if (!report.sourceReportDate) {
    report.error = 'Source report date unavailable; numeric values withheld.';
    return report;
  }
  const put = (field, measurement) => {
    if (!measurement) return;
    report.measurements[field] = measurement;
    report[field] = measurement.unit === 'cm' ? measurement.value + ' cm' : measurement.value;
  };
  if (source.id === 'sunshine') {
    const upper = uniqueSection(document.text, 'Upper Mountain Snow Report', 'Mid Mountain Snow Report');
    put('newSnow24h', metric(upper, /\b24hr\s+(\d+(?:\.\d+)?)\s*cm\b/gi, '24hr', 'Upper Mountain'));
    put('baseDepth', metric(upper, /\bBase\s+(\d+(?:\.\d+)?)\s*cm\b/gi, 'Base', 'Upper Mountain'));
    put('seasonTotal', metric(upper, /\bCumulative\s+(\d+(?:\.\d+)?)\s*cm\b/gi, 'Cumulative', 'Upper Mountain'));
  } else if (source.id === 'norquay') {
    const snowfall = uniqueSection(document.text, 'Current Snowfall', 'Snow Base - Lower Mountain');
    const upper = uniqueSection(document.text, 'Snow Base - Upper Mountain', ["Today's Forecast", 'Weekly Forecast']);
    // Norquay renders the value BEFORE its period/location label.
    put('newSnow24h', metric(snowfall, /(?:^|\s)(\d+(?:\.\d+)?)\s*cm\s+Last 24 Hours\b/gi, 'Last 24 Hours', null));
    put('baseDepth', metric(upper, /(?:^|\s)(\d+(?:\.\d+)?)\s*cm\s+Upper Mountain\b/gi, 'Snow Base', 'Upper Mountain'));
    put('seasonTotal', metric(upper, /(?:^|\s)(\d+(?:\.\d+)?)\s*cm\s+Year to Date Snowfall\b/gi, 'Year to Date Snowfall', 'Upper Mountain'));
    const runsSection = uniqueSection(document.text, 'Lift and Run Status', 'Status Legend:');
    const runs = oneMatch(runsSection, /Runs Open:\s*(\d+)\s+of\s+(\d+)\b/gi);
    if (runs && Number(runs[1]) <= Number(runs[2]) && Number(runs[2]) > 0 && Number(runs[2]) <= 1000) {
      put('openRuns', { value: Number(runs[1]), unit: 'runs', label: 'Runs Open', location: null });
      put('totalRuns', { value: Number(runs[2]), unit: 'runs', label: 'Reported run denominator', location: null });
    }
  }
  if (Object.keys(report.measurements).length) report.availability = 'reported-values';
  return report;
}
