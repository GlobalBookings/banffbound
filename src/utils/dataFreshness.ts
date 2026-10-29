export type SnapshotFreshness = {
  status: 'fresh' | 'stale' | 'unavailable';
  updatedAt: string | null;
  expiresAt: string | null;
  label: string;
};

/** updatedAt is a retrieval timestamp, not proof of the provider's observation time. */
export function dataFreshness(updatedAt: unknown, maxAgeHours: number, now = Date.now()): SnapshotFreshness {
  const timestamp = typeof updatedAt === 'number'
    ? (updatedAt < 1e12 ? updatedAt * 1000 : updatedAt)
    : typeof updatedAt === 'string' && updatedAt ? Date.parse(updatedAt) : NaN;
  if (!Number.isFinite(timestamp) || timestamp > now || !Number.isFinite(maxAgeHours) || maxAgeHours <= 0) {
    return { status: 'unavailable', updatedAt: null, expiresAt: null, label: 'No reliable snapshot time available' };
  }
  const expires = timestamp + maxAgeHours * 60 * 60 * 1000;
  const label = new Date(timestamp).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Edmonton' }) + ' (Mountain Time)';
  return { status: now <= expires ? 'fresh' : 'stale', updatedAt: new Date(timestamp).toISOString(), expiresAt: new Date(expires).toISOString(), label };
}

/** Recheck static HTML on load, periodically, and when returning to an open tab. */
export function installSnapshotExpiry() {
  const refresh = () => {
    document.querySelectorAll<HTMLElement>('[data-fresh-until]').forEach(panel => {
      const expires = Date.parse(panel.dataset.freshUntil || '');
      const updated = Date.parse(panel.dataset.snapshotTime || '');
      if (!Number.isFinite(expires) || !Number.isFinite(updated) || updated > Date.now() || Date.now() > expires) {
        panel.querySelectorAll<HTMLElement>('[data-snapshot-fresh]').forEach(el => { el.hidden = true; });
        panel.querySelectorAll<HTMLElement>('[data-snapshot-unavailable]').forEach(el => { el.hidden = false; });
      }
    });
  };
  refresh();
  window.setInterval(refresh, 60_000);
  document.addEventListener('visibilitychange', refresh);
  window.addEventListener('pageshow', refresh);
}
