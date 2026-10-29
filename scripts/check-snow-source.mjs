#!/usr/bin/env node
/** Focused regressions; never invokes the snapshot-writing orchestrator. */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SNOW_SOURCES, parseSnowReport } from './lib/snow-report.mjs';
import { fetchSnowReport } from './fetchers/snow-report.mjs';

const byId = Object.fromEntries(SNOW_SOURCES.map(source => [source.id, source]));
const parse = (id, html) => parseSnowReport(html, byId[id], { retrievedAt: '2026-10-29T05:00:00.000Z' });
const measurements = ['baseDepth', 'newSnow24h', 'seasonTotal', 'openRuns', 'totalRuns', 'openLifts', 'totalLifts'];
const noMetrics = report => measurements.forEach(field => assert.equal(report[field], null, field + ' must be unavailable'));

// Synthetic minimal markup follows the verified label order, without retaining
// complete operator pages or asserting that fixture values are current conditions.
const sunshine = '<h1>Current Conditions</h1><p>Updated: Wednesday, October 28th, 2026 4:32 PM</p>' +
  '<h3>Summary</h3><p>Check our full report before travelling.</p>' +
  '<h3>Upper Mountain Snow Report</h3><h4>24hr</h4><span>4</span><span>cm</span><span>2 in</span>' +
  '<h4>5 Day</h4><span>75 cm</span><h4>Base</h4><span>31 cm</span><h4>Cumulative</h4><span>94 cm</span>' +
  '<h3>Mid Mountain Snow Report</h3><h4>24 Hours</h4><span>2 cm</span><h4>Settled Base</h4><span>22 cm</span>' +
  '<h2>Extended Forecast</h2><p>Forecast updated: Wednesday, October 28th, 2026 5:00 PM</p><p>Snow 150 cm</p>';
const norquay = '<h1>Daily Conditions Update</h1><h3>Conditions update for Wednesday, October 28, 2026.</h3>' +
  '<p>Our next opening announcement is coming soon.</p><p>Current Temperature:</p><p>-5°C</p>' +
  '<h3>Current Snowfall</h3><p>New Snow</p><h3>2cm</h3><p>Overnight</p>' +
  '<h3>0cm</h3><p>Last 24 Hours</p><h3>19cm</h3><p>Last 7 Days</p>' +
  '<p>Snow Base - Lower Mountain</p><h3>11cm</h3><p>Lower Mountain</p><h3>45cm</h3><p>Year to Date Snowfall</p>' +
  '<p>Snow Base - Upper Mountain</p><h3>21cm</h3><p>Upper Mountain</p><h3>59cm</h3><p>Year to Date Snowfall</p>' +
  '<h3>Today’s Forecast</h3><p>100cm Precipitation</p>' +
  '<h2>Lift and Run Status</h2><p>Runs Open:</p><span>0 of</span><span>81</span><p>Status Legend:</p><p>Open Closed</p>' +
  '<h3>Example Chair Closed</h3><p>Open Open Open</p>';
const louise = '<h1>Conditions &amp; Weather</h1><h3>Today\'s Details</h3><div><span>Updated:</span>' +
  '<span>Wednesday, October 28, 2026 at 11:00 AM</span></div><h4>Check the official daily announcement</h4>' +
  '<script type="application/json">{"oldContent":"Base 200 cm, 24 Hours 90 cm, Open Open Open","runs":164,"lifts":11}</script>' +
  '<!-- Base 150 cm --><template>Snow Depth 140 cm</template><h4>Weather Forecast Provided by RWDI</h4><p>-- ºC</p>';

const sun = parse('sunshine', sunshine);
assert.equal(sun.newSnow24h, '4 cm');
assert.equal(sun.baseDepth, '31 cm');
assert.equal(sun.seasonTotal, '94 cm');
assert.equal(sun.measurements.baseDepth.location, 'Upper Mountain');
assert.equal(sun.sourceReportDate, '2026-10-28');
assert.equal(sun.sourceReportedAtText, 'Wednesday, October 28th, 2026 4:32 PM');
assert.equal(sun.sourceReportedAt, null, 'A local label without offset is not an invented UTC instant');
assert.equal(sun.sourceTimeZone, null);
assert.notEqual(sun.retrievedAt, sun.sourceReportedAtText);
assert.equal(sun.openRuns, null);
assert.equal(sun.totalRuns, null);

const nor = parse('norquay', norquay);
assert.equal(nor.newSnow24h, '0 cm', 'An explicitly reported zero must survive');
assert.equal(nor.baseDepth, '21 cm', 'Use upper base, not lower base or weekly snowfall');
assert.equal(nor.seasonTotal, '59 cm');
assert.equal(nor.openRuns, 0);
assert.equal(nor.totalRuns, 81, 'Read the denominator, never a hardcoded historical total');
assert.equal(nor.openLifts, null, 'Never count arbitrary facility Open/Closed words');
assert.equal(nor.totalLifts, null);
assert.equal(nor.status, null, 'Zero open runs does not establish an overall resort status');

const lake = parse('louise', louise);
noMetrics(lake);
assert.equal(lake.status, null);
assert.equal(lake.sourceReportDate, '2026-10-28');
assert.equal(lake.reportSummary, 'Check the official daily announcement');
assert.equal(parse('louise', '<h4>Unrelated navigation promotion</h4>' + louise).reportSummary, lake.reportSummary);
assert.equal(lake.availability, 'partial');
assert.equal(parse('louise', louise.replace('Open Open Open', 'Closed Closed Closed')).status, null);

for (const source of SNOW_SOURCES) {
  noMetrics(parse(source.id, ''));
  noMetrics(parse(source.id, '<h1>Unrelated page</h1><p>Base 50cm 24 hours 10cm Open</p>'));
  assert.equal(parse(source.id, '<p>We are open now! Closed for season! November 7</p>').status, null);
}
noMetrics(parse('sunshine', sunshine.replace('Wednesday, October 28th, 2026 4:32 PM', 'Unknown')));
noMetrics(parse('sunshine', sunshine.replace('October 28th', 'February 31st')));
assert.equal(parse('sunshine', sunshine.replace('<h4>24hr</h4><span>4</span><span>cm</span>', '<h4>24hr</h4><span>-- cm</span>')).newSnow24h, null);
assert.equal(parse('sunshine', sunshine.replace('4</span><span>cm', '-4</span><span>cm')).newSnow24h, null);
assert.equal(parse('sunshine', sunshine.replace('4</span><span>cm', '4</span><span>in')).newSnow24h, null);
assert.equal(parse('sunshine', sunshine.replace('<h4>Base</h4>', '<h4>Base</h4><span>99 cm</span><h4>Base</h4>')).baseDepth, null, 'Ambiguous duplicate labels fail closed');
assert.equal(parse('norquay', norquay.replace('<h3>0cm</h3><p>Last 24 Hours</p>', '<h3>--</h3><p>Last 24 Hours</p>')).newSnow24h, null, 'Missing is not zero or the next period');
assert.equal(parse('norquay', norquay.replace('<span>0 of</span><span>81</span>', '<span>90 of</span><span>81</span>')).openRuns, null);
assert.equal(parse('norquay', norquay.replace('<h3>21cm</h3>', '<h3 hidden>900cm</h3><h3>21cm</h3>')).baseDepth, '21 cm');
assert.equal(parse('norquay', norquay.replace('<h3>21cm</h3>', '<div style="display:none"><h3>900cm</h3><p>Upper Mountain</p></div><h3>21cm</h3>')).baseDepth, '21 cm');
assert.equal(parse('norquay', norquay.replace('<h3>Today’s Forecast</h3>', '<div class="elementor-hidden-desktop elementor-hidden-laptop elementor-hidden-tablet elementor-hidden-mobile"><h3>Today’s Forecast</h3><p>900cm</p></div><h3>Weekly Forecast</h3>')).baseDepth, '21 cm');
assert.equal(parse('sunshine', sunshine.replace('Check our full report before travelling.', 'Winter 26&sol;27&period;')).reportSummary, 'Winter 26/27.');

const requests = [];
const fixtureById = { sunshine, louise, norquay };
const snapshot = await fetchSnowReport({
  now: () => new Date('2026-08-15T12:00:00Z'),
  fetchImpl: async (url, options) => {
    requests.push({ url, options });
    const source = SNOW_SOURCES.find(source => source.sourceUrl === url);
    return { ok: true, url, text: async () => fixtureById[source.id] };
  },
});
assert.equal(requests.length, 3, 'Summer must still fetch sources; do not manufacture an off-season report');
assert.equal(snapshot.updatedAt, snapshot.retrievedAt);
assert.equal(snapshot.retrievedAt, '2026-08-15T12:00:00.000Z');
assert.equal(snapshot.experimental, true);
assert(!('offSeason' in snapshot));
assert(!('seasonOpens' in snapshot));
assert(snapshot.resorts.every(report => report.status === null));
assert(requests.every(({ options }) => options.headers['User-Agent'].includes('BanffBound')));
const failure = await fetchSnowReport({ fetchImpl: async () => ({ ok: false, status: 503 }) });
assert(failure.error);
failure.resorts.forEach(report => { noMetrics(report); assert(report.sourceUrl.startsWith('https://')); assert(report.retrievedAt); });
const wrongHost = await fetchSnowReport({ fetchImpl: async () => ({ ok: true, url: 'https://example.com/', text: async () => sunshine }) });
assert(wrongHost.error);
const partial = await fetchSnowReport({ fetchImpl: async url => ({ ok: true, url, text: async () => url === byId.sunshine.sourceUrl ? sunshine : '<h1>Unavailable</h1>' }) });
assert(!partial.error);
assert.equal(partial.resorts[0].newSnow24h, '4 cm');
assert.equal(partial.resorts[1].baseDepth, null);
const timedOut = await fetchSnowReport({
  timeoutMs: 5,
  fetchImpl: async (url, { signal }) => ({ ok: true, url, text: () => new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true })) }),
});
assert(timedOut.error, 'Timeout must cover response-body reading');

const fixtureIndex = process.argv.indexOf('--fixtures');
if (fixtureIndex !== -1) {
  for (const [index, source] of SNOW_SOURCES.entries()) {
    const html = await readFile(process.argv[fixtureIndex + 1 + index], 'utf8');
    const report = parse(source.id, html);
    assert.notEqual(report.availability, 'unavailable', source.id + ': verify report identity');
    assert(report.sourceReportDate, source.id + ': verify source report label');
    console.log(source.id + ': ' + JSON.stringify({ date: report.sourceReportDate, measurements: report.measurements, status: report.status }));
  }
}
if (process.argv.includes('--live')) {
  const live = await fetchSnowReport();
  assert(!live.error, 'All official pages unavailable during live check');
  for (const report of live.resorts) {
    assert.notEqual(report.availability, 'unavailable', report.id + ': report identity or source retrieval failed');
    assert(report.sourceReportDate, report.id + ': source date missing');
    console.log(report.id + ': ' + JSON.stringify({ sourceUrl: report.sourceUrl, date: report.sourceReportDate, retrievedAt: report.retrievedAt, measurements: report.measurements }));
  }
}
console.log('Snow source checks passed: direct evidence, zero/null, metric periods/locations, hidden data, ambiguous labels, failures and timeouts. No snapshots written.');
