/** Focused offline checks. Never sends an authenticated request or writes live snapshots. */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fetchRoadConditions } from './fetchers/road-conditions.mjs';
import { MAX_ROAD_REPORT_AGE_HOURS, normalizeRoadReports } from './lib/road-report.mjs';

const NOW = Date.parse('2026-10-29T06:00:00Z');
const seconds = NOW / 1000;
const TEST_KEY = 'fixture-only-key+/?=never-a-real-credential';
const row = (changes = {}) => ({
  Id: 0, LocationDescription: 'Banff interchange to Castle Junction',
  'Primary Condition': 'Bare Dry', 'Secondary Conditions': [], Visibility: 'Good',
  AreaName: 'BANFF', RoadwayName: 'Hwy 1', LastUpdated: seconds - 3600, ...changes,
});
const highway = (snapshot, id = 'hwy-1-banff') => snapshot.highways.find(item => item.id === id);
const onlySegment = snapshot => highway(snapshot).segments[0];

// Published 511 example fields and historical times, not a live report or a Banff route-wide status.
const documentedSamples = [
  { Id: 645, LocationDescription: 'St. Julien Way to Tunnel Mountain Rd', 'Primary Condition': 'Closed', 'Secondary Conditions': [], Visibility: null, AreaName: 'BANFF', RoadwayName: 'Tunnel Mountain Dr', LastUpdated: 1572077163 },
  { Id: 647, LocationDescription: 'Lake Minnewanka to Johnson Lake', 'Primary Condition': 'Closed', 'Secondary Conditions': [], Visibility: null, AreaName: 'BANFF', RoadwayName: 'Johnson Lake Road', LastUpdated: 1576485655 },
];
assert(normalizeRoadReports(documentedSamples, NOW).highways.every(item => item.segments.length === 0), 'A place named in a section description does not identify its roadway');
const current = normalizeRoadReports([row()], NOW);
assert.equal(current.schemaVersion, 2);
assert.equal(current.provider, '511 Alberta');
assert.equal(current.retrievedAt, '2026-10-29T06:00:00.000Z');
assert.equal(current.maxReportAgeHours, MAX_ROAD_REPORT_AGE_HOURS);
assert.equal(current.availability, 'partial', 'A single highway cannot prove coverage of all selected roads');
assert.equal(current.highways.length, 6, 'Missing roads retain an unavailable entry and the official source link');
assert.equal(onlySegment(current).id, 0, 'Preserve a reported zero identifier');
assert.equal(onlySegment(current).reportedAt, '2026-10-29T05:00:00.000Z');
assert.equal(onlySegment(current).primaryCondition, 'Bare Dry');
assert.equal(onlySegment(current).availability, 'available');
assert(!('status' in highway(current)) && !('conditions' in highway(current)), 'Do not generate an overall route status or majority condition');
assert.equal(highway(current).coverage, 'Reported sections only; complete route coverage is not verified.');
const mixed = normalizeRoadReports([
  row({ Id: 1, LastUpdated: seconds - 60 }),
  row({ Id: 2, LocationDescription: 'A separate reported section', 'Primary Condition': 'Closed', LastUpdated: seconds - 6 * 3600 - 1 }),
  row({ Id: 3, LocationDescription: 'Another reported section', 'Primary Condition': 'Closed', LastUpdated: seconds - 7200 }),
], NOW);
assert.equal(highway(mixed).availability, 'partial');
assert.equal(highway(mixed).segments.length, 3);
assert.equal(highway(mixed).segments[1].unavailableReason, 'stale_source_time');
assert.equal(highway(mixed).segments[1].closureReported, false);
assert.equal(highway(mixed).segments[2].closureReported, true);
assert.notEqual(highway(mixed).segments[0].reportedAt, highway(mixed).segments[1].reportedAt, 'One report time must not refresh another section');

for (const [value, reason] of [
  [null, 'missing_source_time'], [undefined, 'missing_source_time'], ['', 'missing_source_time'],
  [String(seconds), 'invalid_source_time'], [NOW, 'invalid_source_time'], [-1, 'invalid_source_time'],
  [seconds - 0.5, 'invalid_source_time'], [false, 'invalid_source_time'], [NaN, 'invalid_source_time'],
  [0, 'stale_source_time'], [seconds + 1, 'future_source_time'], [seconds - 6 * 3600 - 1, 'stale_source_time'],
]) {
  const result = normalizeRoadReports([row({ LastUpdated: value })], NOW);
  assert.equal(onlySegment(result).availability, 'unavailable', String(value));
  assert.equal(onlySegment(result).unavailableReason, reason, String(value));
  assert.equal(result.availability, 'unavailable');
}
assert.equal(onlySegment(normalizeRoadReports([row({ LastUpdated: seconds - 6 * 3600 })], NOW)).availability, 'available');
for (const condition of [null, '', ' ', false, 0, 'Unknown', 'Unavailable']) {
  const result = onlySegment(normalizeRoadReports([row({ 'Primary Condition': condition })], NOW));
  assert.equal(result.availability, 'unavailable');
  assert.equal(result.unavailableReason, 'missing_condition');
}
const secondary = onlySegment(normalizeRoadReports([row({ 'Secondary Conditions': ['Icy sections', null, 0, 'Blowing snow'], Visibility: 'Visibility 100 m' })], NOW));
assert.deepEqual(secondary.secondaryConditions, ['Icy sections', 'Blowing snow']);
assert.equal(secondary.visibility, 'Visibility 100 m', 'Preserve reported visibility units instead of interpreting or converting them');
assert.deepEqual(onlySegment(normalizeRoadReports([row({ 'Secondary Conditions': 'Icy sections' })], NOW)).secondaryConditions, ['Icy sections'], 'Support the documented string as well as the array shown in the primary sample');
assert.equal(onlySegment(normalizeRoadReports([row({ 'Primary Condition': 'Closure lifted' })], NOW)).closureReported, false);

for (const changes of [
  { AreaName: null }, { AreaName: 'UNKNOWN' }, { AreaName: 'Not Banff' }, { AreaName: 'Calgary' },
  { RoadwayName: 'Hwy 1A' , AreaName: 'Calgary' }, { RoadwayName: 'Hwy 1 eastbound somewhere' },
  { RoadwayName: 'Hwy 93' }, { RoadwayName: 'Hwy 93 N extension' }, { RoadwayName: 'Johnson Lake Road' },
  { RoadwayName: '' }, { LocationDescription: null },
]) assert(normalizeRoadReports([row(changes)], NOW).highways.every(item => item.segments.length === 0), 'Unrecognised identity or missing section cannot prove coverage');
const known = normalizeRoadReports([
  row(), row({ RoadwayName: 'Hwy 1A' }), row({ RoadwayName: 'Hwy 93 N' }), row({ RoadwayName: 'Hwy 93 S' }),
  row({ RoadwayName: 'Lake Minnewanka Road' }), row({ RoadwayName: 'Golf Course Road' }),
], NOW);
assert(known.highways.every(item => item.segments.length === 1));
assert.equal(known.availability, 'available');
assert(known.highways.every(item => item.coverage.includes('not verified')), 'Available reports are not proof of a complete route');
const malformed = normalizeRoadReports([null, false, 0, 'bad', [], {}, ...[row()]], NOW);
assert.deepEqual(malformed, current, 'Skip malformed rows without discarding a valid section');
for (const payload of [null, {}, 'bad']) {
  const invalid = normalizeRoadReports(payload, NOW);
  assert.equal(invalid.retrievedAt, null);
  assert.equal(invalid.error.code, 'invalid_response');
}
assert.equal(normalizeRoadReports([], NOW).availability, 'unavailable');

const diagnostics = [];
const savedConsole = { log: console.log, warn: console.warn, error: console.error };
for (const method of Object.keys(savedConsole)) console[method] = (...items) => diagnostics.push(items);
try {
  let calls = 0;
  for (const apiKey of [null, '', '   ']) {
    const missing = await fetchRoadConditions({ apiKey, fetchImpl: async () => { calls++; throw Error('must not request'); } });
    assert.equal(missing.retrievedAt, null);
    assert.equal(missing.error.code, 'missing_api_key');
    assert.equal(missing.availability, 'unavailable');
  }
  assert.equal(calls, 0, 'Missing configuration skips the network entirely');
  const success = await fetchRoadConditions({ apiKey: TEST_KEY, now: () => new Date(NOW), fetchImpl: async (request, { signal }) => {
    const url = new URL(request);
    assert.equal(url.origin + url.pathname, 'https://511.alberta.ca/api/v3/get/winterroads');
    assert.equal(url.searchParams.get('key'), TEST_KEY);
    assert.equal(url.searchParams.get('format'), 'json');
    assert.equal(url.searchParams.get('lang'), 'en');
    assert(signal instanceof AbortSignal);
    return { ok: true, json: async () => [row()] };
  } });
  assert.deepEqual(success, current);
  const outcomes = [success];
  for (const [status, code] of [[401, 'unauthorized'], [403, 'forbidden'], [429, 'rate_limited'], [503, 'http_error']]) {
    let attempts = 0;
    const rejected = await fetchRoadConditions({ apiKey: TEST_KEY, fetchImpl: async () => {
      attempts++;
      return { ok: false, status, json: () => { throw Error('Do not inspect or store rejected response bodies'); } };
    } });
    assert.equal(rejected.error.code, code);
    assert.equal(rejected.retrievedAt, null);
    assert.equal(attempts, 1, 'No automatic retries against the rate-limited service');
    outcomes.push(rejected);
  }
  const rawFailure = `Request https://511.alberta.ca/api/v3/get/winterroads?key=${TEST_KEY} failed`;
  const failed = await fetchRoadConditions({ apiKey: TEST_KEY, fetchImpl: async () => { throw Error(rawFailure); } });
  assert.equal(failed.error.code, 'request_failed');
  outcomes.push(failed);
  const unreadable = await fetchRoadConditions({ apiKey: TEST_KEY, fetchImpl: async () => ({ ok: true, json: async () => { throw SyntaxError(rawFailure); } }) });
  assert.equal(unreadable.error.code, 'invalid_response');
  outcomes.push(unreadable);
  const waitForAbort = signal => new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(Error(rawFailure)), { once: true }));
  const bodyTimeout = await fetchRoadConditions({ apiKey: TEST_KEY, timeoutMs: 5, fetchImpl: async (url, { signal }) => ({ ok: true, json: () => waitForAbort(signal) }) });
  assert.equal(bodyTimeout.error.code, 'timeout');
  assert.equal(bodyTimeout.retrievedAt, null);
  outcomes.push(bodyTimeout);
  const headerTimeout = await fetchRoadConditions({ apiKey: TEST_KEY, timeoutMs: 5, fetchImpl: async (url, { signal }) => waitForAbort(signal) });
  assert.equal(headerTimeout.error.code, 'timeout');
  outcomes.push(headerTimeout);
  const encodedKey = encodeURIComponent(TEST_KEY);
  for (const outcome of outcomes) {
    const serialised = JSON.stringify(outcome);
    assert(!serialised.includes(TEST_KEY) && !serialised.includes(encodedKey) && !serialised.includes('/api/v3/get/winterroads?'));
    assert.equal(outcome.sourceUrl, 'https://511.alberta.ca/');
  }
  assert.equal(diagnostics.length, 0, 'No raw request errors, credential URLs or keys are logged');
} finally {
  Object.assign(console, savedConsole);
}
const fetcherSource = await readFile(new URL('./fetchers/road-conditions.mjs', import.meta.url), 'utf8');
assert(fetcherSource.includes('process.env.ALBERTA_511_API_KEY'));
assert(!fetcherSource.includes('/api/v2/'));
assert(!JSON.stringify(current).includes('chains required'), 'Do not invent a route-wide legal equipment advisory');
console.log('Road source checks passed: v3/key handling, section identity, independent source times, null/stale/future/unit rejection, partial reports, HTTP failures, body/header timeouts and secret-safe output. No live requests or snapshot writes.');
