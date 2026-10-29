/** Server-only Alberta 511 integration. No unkeyed or alternate-provider fallback. */
import { normalizeRoadReports, unavailableRoadReport } from '../lib/road-report.mjs';

const API_URL = 'https://511.alberta.ca/api/v3/get/winterroads';
const HTTP_FAILURES = {
  401: ['unauthorized', '511 Alberta authentication was not accepted.'],
  403: ['forbidden', 'Access to 511 Alberta road reports was not authorized.'],
  429: ['rate_limited', 'The 511 Alberta request limit was reached. Check the official report.'],
};

/** Optional inputs support offline checks; the normal build reads only the named server environment variable. */
export async function fetchRoadConditions({ apiKey = process.env.ALBERTA_511_API_KEY, fetchImpl = globalThis.fetch, timeoutMs = 10_000, now = () => new Date() } = {}) {
  if (typeof apiKey !== 'string' || !apiKey.trim()) {
    return unavailableRoadReport('missing_api_key', 'Local road reports are unavailable because server access is not configured. Check the official report.');
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    // The key is used only for this request. Never log/return the URL, key or raw request exception.
    const url = new URL(API_URL);
    url.searchParams.set('key', apiKey.trim());
    url.searchParams.set('format', 'json');
    url.searchParams.set('lang', 'en');
    const response = await fetchImpl(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
    if (!response.ok) {
      const [code, message] = HTTP_FAILURES[response.status] || ['http_error', '511 Alberta road reports could not be retrieved. Check the official report.'];
      return unavailableRoadReport(code, message);
    }
    let reports;
    try {
      reports = await response.json();
    } catch {
      return unavailableRoadReport(controller.signal.aborted ? 'timeout' : 'invalid_response', controller.signal.aborted
        ? '511 Alberta did not finish responding in time. Check the official report.'
        : '511 Alberta returned an unreadable road report. Check the official report.');
    }
    return normalizeRoadReports(reports, now().getTime());
  } catch {
    return unavailableRoadReport(controller.signal.aborted ? 'timeout' : 'request_failed', controller.signal.aborted
      ? '511 Alberta did not finish responding in time. Check the official report.'
      : '511 Alberta road reports could not be retrieved. Check the official report.');
  } finally {
    // Keep the abort active until the response body has been read.
    clearTimeout(timer);
  }
}
