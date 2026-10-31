import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultDirectory = fileURLToPath(new URL('../../data/analytics-history/', import.meta.url));
// Aggregate operational snapshots only. No OAuth tokens, client identifiers or raw API errors.
export function analyticsSnapshot({ propertyId, overview, sources, devices, topPages, landingPages, affiliateClicks, geo, errors = [], capturedAt = new Date().toISOString() }) {
  const unavailable = new Set(errors.map(error => error.label));
  const section = (name, data) => ({ status: unavailable.has(name) ? 'unavailable' : 'available', data: unavailable.has(name) ? null : data });
  const zone = overview?.propertyTimeZone;
  let reportDate = null;
  if (zone) {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(capturedAt)).map(part => [part.type, part.value]));
    reportDate = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day) - 1)).toISOString().slice(0, 10);
  }
  return {
    schemaVersion: 1, capturedAt, propertyId: String(propertyId), source: 'GA4 Data API',
    dateRange: { startDate: reportDate, endDate: reportDate, requestedRange: '1daysAgo', propertyTimeZone: zone || null, calendar: 'GA4 property timezone; capturedAt is UTC', processing: 'Previous local day; GA4 can revise recent aggregates.' },
    measurement: 'Consent-observed aggregates; affiliate clicks are not bookings or commissions.',
    sections: {
      overview: section('overview', overview), sources: section('sources', sources), devices: section('devices', devices),
      topPages: { ...section('topPages', topPages), limit: 10 }, landingPages: { ...section('landingPages', landingPages), limit: 10 },
      affiliateClicks: section('affiliateClicks', affiliateClicks), geo: { ...section('geo', geo), limit: 5 },
    },
    failedSections: [...unavailable],
  };
}
export function archiveAnalyticsSnapshot(snapshot, directory = process.env.GA4_HISTORY_DIR || defaultDirectory) {
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  const filename = `ga4-${snapshot.capturedAt.replace(/[^0-9TZ]/g, '')}-${process.pid}.json`;
  const target = path.join(directory, filename);
  fs.writeFileSync(target, JSON.stringify(snapshot, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  return target;
}
