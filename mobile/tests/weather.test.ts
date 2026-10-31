import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeMobileWeather, fetchEcccWeather, WEATHER_MAX_AGE_MS } from '../src/data/weather';

const now = Date.parse('2026-10-30T12:00:00Z');
function banffFixture() {
  return { type: 'Feature', properties: { identifier: 'ab-49', name: { en: 'Banff' }, currentConditions: {
    temperature: { units: { en: 'C' }, value: { en: 0 } }, condition: { en: 'Clear' },
    timestamp: { en: '2026-10-30T11:00:00Z' }, station: { value: { en: 'Banff' } },
  } } };
}
function louiseFixture() {
  return [{ displayName: 'Lake Louise', cgndb: 'IACFT', province: 'AB', lat: 51.425, lon: -116.181,
    observation: { temperature: { metricUnrounded: -3.4 }, condition: 'Cloudy', timeStamp: '2026-10-30T11:00:00Z', observedAt: 'Yoho National Park' } }];
}

test('real zero survives ECCC metric and identity normalization', () => {
  const weather = normalizeMobileWeather(banffFixture(), 'banff', now);
  assert.equal(weather.available, true);
  assert.equal(weather.temperature, 0);
  assert.equal(weather.station, 'Banff');
  assert.equal(weather.observedAt, '2026-10-30T11:00:00.000Z');
  assert.match(weather.sourceUrl, /weather\.gc\.ca/);
});

test('Lake Louise keeps the actual provider station, rather than renaming it Lake Louise', () => {
  const weather = normalizeMobileWeather(louiseFixture(), 'louise', now);
  assert.equal(weather.available, true);
  assert.equal(weather.temperature, -3.4);
  assert.equal(weather.station, 'Yoho National Park');
});

test('wrong city and missing units, time or station remain unknown', () => {
  const wrongCity = banffFixture(); wrongCity.properties.name.en = 'Calgary';
  const wrongUnit = banffFixture(); wrongUnit.properties.currentConditions.temperature.units.en = 'F';
  const missingTime = banffFixture(); missingTime.properties.currentConditions.timestamp.en = '';
  const missingStation = banffFixture(); missingStation.properties.currentConditions.station.value.en = '';
  for (const payload of [wrongCity, wrongUnit, missingTime, missingStation, null, {}]) {
    const weather = normalizeMobileWeather(payload, 'banff', now);
    assert.equal(weather.available, false);
    assert.equal(weather.temperature, null);
    assert.equal(weather.observedAt, null);
  }
  const wrongLouise = louiseFixture(); wrongLouise[0].lat = 51.18;
  assert.equal(normalizeMobileWeather(wrongLouise, 'louise', now).available, false);
});

test('observations older than three hours expire, with a defined boundary and future-clock handling', () => {
  const age = now - Date.parse('2026-10-30T11:00:00Z');
  assert.equal(normalizeMobileWeather(banffFixture(), 'banff', now + WEATHER_MAX_AGE_MS - age).available, true);
  const expired = normalizeMobileWeather(banffFixture(), 'banff', now + WEATHER_MAX_AGE_MS - age + 1);
  assert.equal(expired.available, false);
  assert.equal(expired.temperature, null);
  assert.match(expired.error!, /older than three hours/);
  assert.equal(normalizeMobileWeather(banffFixture(), 'banff', Date.parse('2026-10-30T10:00:00Z')).available, false);
});

test('Canmore has a source-only fallback and never borrows an unlabelled Banff observation', async () => {
  let calls = 0;
  const result = await fetchEcccWeather('canmore', { fetcher: (async () => { calls++; throw new Error('should not fetch'); }) as typeof fetch });
  assert.equal(calls, 0);
  assert.equal(result.temperature, null);
  assert.equal(result.available, false);
  assert.match(result.sourceUrl, /51\.09,-115\.36/);
});

test('fetch failures, non-success responses and expired server payloads keep unknown values', async () => {
  const successful = await fetchEcccWeather('banff', { now, fetcher: (async () => new Response(JSON.stringify(banffFixture()), { status: 200 })) as typeof fetch });
  assert.equal(successful.available, true);
  const failed = await fetchEcccWeather('banff', { fetcher: (async () => { throw new Error('offline'); }) as typeof fetch });
  assert.equal(failed.available, false);
  assert.equal(failed.temperature, null);
  const http = await fetchEcccWeather('banff', { fetcher: (async () => new Response('', { status: 503 })) as typeof fetch });
  assert.equal(http.available, false);
  const stale = await fetchEcccWeather('banff', { now: now + WEATHER_MAX_AGE_MS, fetcher: (async () => new Response(JSON.stringify(banffFixture()), { status: 200 })) as typeof fetch });
  assert.equal(stale.available, false);
});

test('aborted weather requests settle into the timeout fallback', async () => {
  const pending = (async (_url: unknown, init: RequestInit) => new Promise((_resolve, reject) => {
    init.signal!.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
  })) as unknown as typeof fetch;
  const result = await fetchEcccWeather('banff', { fetcher: pending, timeoutMs: 1 });
  assert.equal(result.available, false);
  assert.equal(result.temperature, null);
  assert.match(result.error!, /timed out/);
});
