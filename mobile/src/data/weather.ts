import { ECCC_LOCATIONS, normalizeEcccWeather } from './eccc.generated.mjs';

export type WeatherArea = 'banff' | 'louise' | 'canmore';
export type MobileWeather = {
  temperature: number | null;
  condition: string;
  observedAt: string | null;
  station: string | null;
  sourceUrl: string;
  available: boolean;
  error?: string;
};

export const WEATHER_MAX_AGE_MS = 3 * 60 * 60 * 1000;
const FUTURE_TOLERANCE_MS = 5 * 60 * 1000;
const TIMEOUT_MS = 9000;
const canmoreSource = 'https://weather.gc.ca/en/location/index.html?coords=51.09,-115.36';
const locationForArea = (area: WeatherArea) => area === 'louise' ? ECCC_LOCATIONS.lakeLouise : ECCC_LOCATIONS.banff;

export function unavailableMobileWeather(area: WeatherArea, error = 'Official observation unavailable'): MobileWeather {
  return { temperature: null, condition: 'Unavailable', observedAt: null, station: null,
    sourceUrl: area === 'canmore' ? canmoreSource : locationForArea(area).sourceUrl, available: false, error };
}

/** Validate source identity before exposing any temperature or observation time. */
export function normalizeMobileWeather(payload: unknown, area: WeatherArea, now = Date.now()): MobileWeather {
  if (area === 'canmore') return unavailableMobileWeather(area, 'Use the official Canmore page for local conditions; no Canmore station feed is configured.');
  try {
    const normalized = normalizeEcccWeather(payload, locationForArea(area));
    const observation = normalized.current;
    const timestamp = observation.observedAt ? Date.parse(observation.observedAt) : NaN;
    if (!Number.isFinite(now) || !Number.isFinite(timestamp) || !observation.station || observation.temp === null || !Number.isFinite(observation.temp)) {
      return unavailableMobileWeather(area, 'The source did not provide an identified, dated temperature observation.');
    }
    const age = now - timestamp;
    if (age > WEATHER_MAX_AGE_MS) return unavailableMobileWeather(area, 'The official observation is older than three hours.');
    if (age < -FUTURE_TOLERANCE_MS) return unavailableMobileWeather(area, 'The observation timestamp is in the future; check the device clock.');
    return { temperature: observation.temp, condition: observation.condition, observedAt: observation.observedAt,
      station: observation.station, sourceUrl: normalized.sourceUrl, available: true };
  } catch {
    return unavailableMobileWeather(area, 'The official response did not match the requested location.');
  }
}

/** Fetch the documented public ECCC source. The optional dependency arguments support offline fixture tests. */
export async function fetchEcccWeather(area: WeatherArea, options: { fetcher?: typeof fetch; now?: number; timeoutMs?: number } = {}): Promise<MobileWeather> {
  if (area === 'canmore') return unavailableMobileWeather(area, 'Use the official Canmore page for local conditions; no Canmore station feed is configured.');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? TIMEOUT_MS);
  try {
    const response = await (options.fetcher ?? fetch)(locationForArea(area).apiUrl, {
      signal: controller.signal, headers: { Accept: 'application/json' },
    });
    if (!response.ok) return unavailableMobileWeather(area, 'The official weather service is temporarily unavailable.');
    return normalizeMobileWeather(await response.json(), area, options.now ?? Date.now());
  } catch {
    return unavailableMobileWeather(area, controller.signal.aborted ? 'The official weather request timed out.' : 'Unable to reach the official weather service.');
  } finally {
    clearTimeout(timeout);
  }
}
