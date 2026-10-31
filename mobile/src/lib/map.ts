import { mapCategories, type MapArea, type MapCategory, type MapPoint } from '../data/map';
export type MapFilters = { query?: string; area?: MapArea | 'all'; categories?: readonly MapCategory[]; menusOnly?: boolean };
const plain = (value: string) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export function validMapCoordinate(latitude: number, longitude: number): boolean {
  return Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= 50 && latitude <= 53 && longitude >= -118 && longitude <= -114;
}
export function filterMapPoints(points: readonly MapPoint[], filters: MapFilters): MapPoint[] {
  const terms = plain((filters.query || '').slice(0, 180)).split(/\s+/).filter(Boolean);
  return points.filter(point => validMapCoordinate(point.latitude, point.longitude)
    && (!filters.area || filters.area === 'all' || point.area === filters.area)
    && (!filters.categories?.length || filters.categories.includes(point.category))
    && (!filters.menusOnly || !!safeMapExternalUrl(point.menuUrl))
    && (!terms.length || terms.every(term => plain([point.name, point.address, point.cuisine, point.category, mapCategories.find(c => c.id === point.category)?.label, point.description, ...point.highlights, ...(point.facilities || []).map(f => `${f.label} ${f.value}`)].filter(Boolean).join(' ')).includes(term))));
}
export function mapCategoryCounts(points: readonly MapPoint[], filters: Omit<MapFilters, 'categories'>): Record<MapCategory, number> {
  const counts = Object.fromEntries(mapCategories.map(c => [c.id, 0])) as Record<MapCategory, number>;
  filterMapPoints(points, filters).forEach(point => counts[point.category]++);
  return counts;
}
/** Public HTTPS pages only. Fixed stored destinations; no trip/device data is added. */
export function safeMapExternalUrl(value: string | undefined): string | null {
  if (!value || value !== value.trim() || value.length > 2400 || /[\s\u0000-\u001f\u007f]/.test(value) || /%0[ad]/i.test(value)) return null;
  try {
    const u = new URL(value);
    return u.protocol === 'https:' && !u.username && !u.password && !u.port && u.hostname.includes('.') && !/^[\d.]+$/.test(u.hostname) && !u.hostname.includes(':') && !/(?:^|\.)(?:localhost|local|internal|test|invalid|example)$/.test(u.hostname) ? value : null;
  } catch { return null; }
}
export function mapLocationUrl(point: MapPoint): string | null {
  if (!validMapCoordinate(point.latitude, point.longitude)) return null;
  return `https://www.openstreetmap.org/?mlat=${point.latitude}&mlon=${point.longitude}#map=17/${point.latitude}/${point.longitude}`;
}
export function mapDistanceKm(point: MapPoint, position: { latitude: number; longitude: number }): number {
  if (!Number.isFinite(position.latitude) || !Number.isFinite(position.longitude) || Math.abs(position.latitude) > 90 || Math.abs(position.longitude) > 180) return Infinity;
  const r = Math.PI / 180, dlat = (point.latitude - position.latitude) * r, dlon = (point.longitude - position.longitude) * r;
  return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(Math.sin(dlat / 2) ** 2 + Math.cos(position.latitude * r) * Math.cos(point.latitude * r) * Math.sin(dlon / 2) ** 2)));
}
