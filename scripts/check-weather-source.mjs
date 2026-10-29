/** Offline by default. --live reads ECCC but never writes src/data/live snapshots. */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fetchWeather } from './fetchers/environment-canada.mjs';
import { ECCC_LOCATIONS, ECCC_PROVIDER, normalizeEcccWeather } from './lib/eccc-weather.mjs';

// Reduced fields from the official responses retrieved 2026-10-28 (Mountain date).
// Source URLs and raw-field provenance are recorded in research/weather-source-2026-10-28.md.
const field = (value, units) => ({ value: { en: value }, ...(units ? { units: { en: units } } : {}) });
const banff = { type: 'Feature', properties: {
  identifier: 'ab-49', name: { en: 'Banff' }, lastUpdated: '2026-10-29T05:02:39Z',
  currentConditions: {
    timestamp: { en: '2026-10-29T05:00:00Z' }, station: field('Banff'),
    temperature: field(-4.1, 'C'), relativeHumidity: field(89, '%'),
    wind: { speed: field(4, 'km/h'), gust: field(32, 'km/h'), direction: field('NNE') },
  },
  forecastGroup: { timestamp: { en: '2026-10-28T22:00:00Z' }, forecasts: [
    { period: { value: { en: 'Wednesday night' }, textForecastName: { en: 'Tonight' } }, temperatures: { temperature: [{ ...field(-7, 'C'), class: { en: 'low' } }] }, abbreviatedForecast: { textSummary: { en: 'Periods of snow' } } },
    { period: { textForecastName: { en: 'Thursday' } }, temperatures: { temperature: [{ ...field(1, 'C'), class: { en: 'high' } }] }, abbreviatedForecast: { textSummary: { en: 'Chance of flurries' } } },
  ] },
} };
const lakeLouise = [{
  cgndb: 'IACFT', displayName: 'Lake Louise', province: 'AB', lat: '51.425', lon: '-116.181',
  observation: {
    observedAt: 'Yoho National Park', timeStamp: '2026-10-29T04:00:00.000Z', condition: '',
    temperature: { metric: '-4', metricUnrounded: '-3.6' }, humidity: '87',
    windDirection: 'ENE', windSpeed: { metric: '16' }, windGust: { metric: '' },
  },
  dailyFcst: { dailyIssuedTimeEpoch: '1793224800', daily: [
    { periodLabel: 'Thu, 29 Oct', date: 'Thu, 29 Oct', temperature: { metric: '1', periodHigh: 1 }, summary: 'Chance of flurries' },
    { periodLabel: 'Night', date: 'Thu, 29 Oct', temperature: { metric: '-11', periodLow: -11 }, summary: 'Clearing' },
  ] },
}];
const normalizeBanff = value => normalizeEcccWeather(value, ECCC_LOCATIONS.banff);
const normalizeLouise = value => normalizeEcccWeather(value, ECCC_LOCATIONS.lakeLouise);
const normalizedBanff = normalizeBanff(banff);
assert.equal(normalizedBanff.current.temp, -4.1);
assert.equal(normalizedBanff.current.observedAt, '2026-10-29T05:00:00.000Z');
assert.equal(normalizedBanff.forecastIssuedAt, '2026-10-28T22:00:00.000Z');
assert.equal(normalizedBanff.current.condition, 'Not observed', 'Do not replace missing observations with forecast text');
assert.deepEqual(normalizedBanff.forecast.map(({ day, high, low }) => ({ day, high, low })), [
  { day: 'Wednesday night', high: null, low: -7 }, { day: 'Thursday', high: 1, low: null },
]);
const relativeLabelFallback = structuredClone(banff);
relativeLabelFallback.properties.forecastGroup.forecasts[0].period.value.en = '';
assert.equal(normalizeBanff(relativeLabelFallback).forecast[0].day, 'Tonight', 'Use the relative name only when no explicit period name is reported');
assert.deepEqual(normalizeBanff({ type: 'FeatureCollection', features: [banff] }), normalizedBanff);
const normalizedLouise = normalizeLouise(lakeLouise);
assert.equal(normalizedLouise.current.temp, -3.6);
assert.equal(normalizedLouise.current.station, 'Yoho National Park', 'Never relabel the station as Lake Louise');
assert.equal(normalizedLouise.current.observedAt, '2026-10-29T04:00:00.000Z');
assert.equal(normalizedLouise.forecastIssuedAt, normalizedBanff.forecastIssuedAt);
assert.equal(normalizedLouise.forecast[1].day, 'Night (Thu, 29 Oct)');
assert.equal(normalizedLouise.forecast[1].high, null);
assert.equal(normalizedLouise.forecast[0].low, null);
const malformedRows = [null, undefined, false, 0, 'not a period', [], {}, { period: null }, { periodLabel: null }];
const mixedBanff = structuredClone(banff);
mixedBanff.properties.forecastGroup.forecasts.splice(1, 0, ...malformedRows);
mixedBanff.properties.forecastGroup.forecasts[0].temperatures.temperature.unshift(null, false, 0, '');
assert.deepEqual(normalizeBanff(mixedBanff), normalizedBanff, 'Skip malformed rows and temperature entries while retaining valid Banff data');
const mixedLouise = structuredClone(lakeLouise);
mixedLouise[0].dailyFcst.daily.splice(1, 0, ...malformedRows);
assert.deepEqual(normalizeLouise(mixedLouise), normalizedLouise, 'Skip malformed rows while retaining valid Lake Louise data');

const zero = structuredClone(banff);
zero.properties.currentConditions.temperature.value.en = 0;
zero.properties.currentConditions.relativeHumidity.value.en = 0;
zero.properties.currentConditions.wind.speed.value.en = 0;
zero.properties.currentConditions.wind.gust.value.en = 0;
zero.properties.forecastGroup.forecasts[1].temperatures.temperature[0].value.en = 0;
assert.equal(normalizeBanff(zero).current.temp, 0);
assert.equal(normalizeBanff(zero).current.humidity, 0);
assert.equal(normalizeBanff(zero).current.wind, 'NNE 0 km/h, gusts 0 km/h');
assert.equal(normalizeBanff(zero).forecast[1].high, 0);
for (const invalid of [null, '', ' ', false, 'not a number']) {
  const missing = structuredClone(lakeLouise);
  missing[0].observation.temperature = { metric: invalid };
  missing[0].observation.humidity = invalid;
  missing[0].observation.windSpeed.metric = invalid;
  missing[0].dailyFcst.daily[0].temperature = { metric: '12', periodHigh: invalid };
  assert.equal(normalizeLouise(missing).current.temp, null);
  assert.equal(normalizeLouise(missing).current.humidity, null);
  assert.equal(normalizeLouise(missing).current.wind, '');
  assert.equal(normalizeLouise(missing).forecast[0].high, null, 'Do not infer high/low from an unclassified temperature');
}
const wrongUnits = structuredClone(banff);
wrongUnits.properties.currentConditions.temperature.units.en = 'F';
assert.equal(normalizeBanff(wrongUnits).current.temp, null);
const undated = structuredClone(banff);
undated.properties.currentConditions.timestamp.en = '2026-10-29 05:00';
undated.properties.forecastGroup.timestamp.en = '';
assert.equal(normalizeBanff(undated).current.temp, null);
assert.deepEqual(normalizeBanff(undated).forecast, []);
const noForecastTime = structuredClone(lakeLouise);
noForecastTime[0].dailyFcst.dailyIssuedTimeEpoch = '1e100';
assert.deepEqual(normalizeLouise(noForecastTime).forecast, []);
for (const property of ['displayName', 'cgndb', 'province', 'lat', 'lon']) {
  const wrongPlace = structuredClone(lakeLouise);
  wrongPlace[0][property] = 'different';
  assert.throws(() => normalizeLouise(wrongPlace), /location identity/);
}
assert.throws(() => normalizeBanff({ type: 'Feature', properties: { identifier: 'bc-68', name: { en: 'Yoho (National Park)' } } }), /location identity/);

const requests = [];
const snapshot = await fetchWeather({
  now: () => new Date('2026-10-29T06:00:00Z'),
  fetchImpl: async (url, options) => {
    requests.push({ url, options });
    return { ok: true, json: async () => url === ECCC_LOCATIONS.banff.apiUrl ? banff : lakeLouise };
  },
});
assert.equal(snapshot.provider, ECCC_PROVIDER);
assert.equal(snapshot.updatedAt, '2026-10-29T06:00:00.000Z');
assert.notEqual(snapshot.updatedAt, snapshot.banff.current.observedAt);
assert.equal(requests.length, 2);
assert(requests.every(({ url, options }) => new URL(url).hostname.endsWith('weather.gc.ca') && options.headers['User-Agent'].includes('BanffBound')));
assert(!JSON.stringify(snapshot).includes('weathericons'), 'No ECCC icon assets are copied');
console.log('Checking expected HTTP failure, identity rejection and timeout cases:');
const failed = await fetchWeather({ fetchImpl: async () => ({ ok: false, status: 503 }) });
assert(failed.error);
for (const place of [failed.banff, failed.lakeLouise]) {
  assert.equal(place.current.temp, null);
  assert.equal(place.current.observedAt, null);
  assert.equal(place.forecastIssuedAt, null);
  assert.deepEqual(place.forecast, []);
  assert(place.sourceUrl.startsWith('https://weather.gc.ca/'));
}
const partial = await fetchWeather({ fetchImpl: async url => ({ ok: true, json: async () => url === ECCC_LOCATIONS.banff.apiUrl ? banff : [{ displayName: 'Yoho' }] }) });
assert(!partial.error, 'One unavailable source must not discard the other location');
assert.equal(partial.banff.current.temp, -4.1);
assert.equal(partial.lakeLouise.current.temp, null);
const timedOut = await fetchWeather({ timeoutMs: 5, fetchImpl: async (url, { signal }) => ({ ok: true, json: () => new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true })) }) });
assert(timedOut.error, 'The timeout covers reading the response body as well as headers');

if (process.argv.includes('--live')) {
  const live = await fetchWeather();
  assert(!live.error, 'Official sources must return usable data during the live check');
  for (const key of Object.keys(ECCC_LOCATIONS)) {
    assert(!live[key].error, `Verify ${key} source identity and schema`);
    assert(live[key].current.observedAt || live[key].forecastIssuedAt);
    console.log(`${key}: station=${live[key].current.station}; observed=${live[key].current.observedAt}; forecastIssued=${live[key].forecastIssuedAt}; periods=${live[key].forecast.length}`);
  }
}
const fixtureIndex = process.argv.indexOf('--fixtures');
if (fixtureIndex !== -1) {
  const banffFixture = JSON.parse(await readFile(process.argv[fixtureIndex + 1], 'utf8'));
  const louiseFixture = JSON.parse(await readFile(process.argv[fixtureIndex + 2], 'utf8'));
  assert(normalizeBanff(banffFixture).current.observedAt);
  assert.equal(normalizeLouise(louiseFixture).current.station, 'Yoho National Park');
  console.log('Full captured ECCC response checks passed.');
}
console.log('ECCC weather checks passed: source identity, UTC times, zero/null values, explicit periods, failures and timeouts. No snapshots written.');
