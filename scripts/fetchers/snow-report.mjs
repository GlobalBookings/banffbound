/** Official resort pages only; experimental, source-labelled HTML extraction.
 * Run scripts/check-snow-source.mjs for checks without writing live snapshots.
 */
import { SNOW_SOURCES, parseSnowReport, unavailableSnowReport } from '../lib/snow-report.mjs';

async function fetchResort(source, { fetchImpl, timeoutMs, now }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(source.sourceUrl, {
      signal: controller.signal,
      headers: { Accept: 'text/html', 'User-Agent': 'BanffBoundSnow/2.0 (+https://banffbound.com/conditions)' },
    });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    if (response.url && (new URL(response.url).protocol !== 'https:' || new URL(response.url).hostname !== new URL(source.sourceUrl).hostname)) throw new Error('Unexpected report host');
    const html = await response.text();
    if (html.length > 3_000_000) throw new Error('Report exceeds parser size limit');
    return parseSnowReport(html, source, { retrievedAt: now().toISOString() });
  } catch (error) {
    console.log('[snow-report] ' + source.name + ' unavailable: ' + error.message);
    return unavailableSnowReport(source, { retrievedAt: now().toISOString() });
  } finally {
    // Covers response-body reading as well as the initial request.
    clearTimeout(timer);
  }
}

/** Injectable clock/transport support offline regression checks; no calendar branch. */
export async function fetchSnowReport({ fetchImpl = globalThis.fetch, timeoutMs = 15_000, now = () => new Date() } = {}) {
  const resorts = await Promise.all(SNOW_SOURCES.map(source => fetchResort(source, { fetchImpl, timeoutMs, now })));
  const retrievedAt = now().toISOString();
  return {
    schemaVersion: 2,
    provider: 'Official resort report pages',
    experimental: true,
    // Compatibility alias for the retrieval clock, never the source report clock.
    updatedAt: retrievedAt,
    retrievedAt,
    resorts,
    ...(resorts.every(resort => resort.availability === 'unavailable') ? { error: 'Official snow report values unavailable.' } : {}),
  };
}
