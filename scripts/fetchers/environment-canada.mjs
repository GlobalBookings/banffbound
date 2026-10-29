/** Official ECCC observations and explicitly named forecast periods; no third-party fallback. */
import { ECCC_LOCATIONS, ECCC_PROVIDER, normalizeEcccWeather, unavailableWeather } from '../lib/eccc-weather.mjs';

async function fetchLocation(location, { fetchImpl, timeoutMs }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(location.apiUrl, {
      signal: controller.signal,
      headers: {
        Accept: 'application/geo+json, application/json',
        'User-Agent': 'BanffBoundWeather/1.0 (+https://banffbound.com/weather)',
      },
    });
    if (!response.ok) throw new Error(`ECCC returned HTTP ${response.status}`);
    return normalizeEcccWeather(await response.json(), location);
  } catch (error) {
    console.log(`[weather] ${location.name} unavailable: ${error.message}`);
    return unavailableWeather(location, 'Official weather data could not be verified. Open the source report.');
  } finally {
    clearTimeout(timer);
  }
}

/** Options allow focused offline checks without running the snapshot-writing orchestrator. */
export async function fetchWeather({ fetchImpl = globalThis.fetch, timeoutMs = 10_000, now = () => new Date() } = {}) {
  const [banff, lakeLouise] = await Promise.all(
    Object.values(ECCC_LOCATIONS).map(location => fetchLocation(location, { fetchImpl, timeoutMs })),
  );
  const hasData = location => location.current.temp !== null || location.forecast.length > 0;
  return {
    provider: ECCC_PROVIDER,
    licenceUrl: 'https://eccc-msc.github.io/open-data/licence/readme_en/',
    // Retrieval completion is deliberately separate from the provider's observation and issue times.
    updatedAt: now().toISOString(),
    banff,
    lakeLouise,
    ...(!hasData(banff) && !hasData(lakeLouise) ? { error: 'Official weather data unavailable' } : {}),
  };
}
