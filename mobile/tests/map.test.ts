import test from 'node:test';
import assert from 'node:assert/strict';
import { filterMapPoints, mapCategoryCounts, mapDistanceKm, mapLocationUrl, safeMapExternalUrl, validMapCoordinate } from '../src/lib/map';
import type { MapPoint } from '../src/data/map';
const base: MapPoint = { id: 'restaurant', name: 'Alpine Café', category: 'restaurants', area: 'banff', latitude: 51.18, longitude: -115.57, description: 'A Bow Valley meal stop.', cuisine: 'Canadian', highlights: ['Coffee and lunch'], menuUrl: 'https://www.thebison.ca/menu', coordinateNote: 'Map feature centre.', sources: [{ label: 'Map', url: 'https://www.openstreetmap.org/node/1', checkedAt: '2026-10-31', kind: 'osm' }] };
const points: MapPoint[] = [base, { ...base, id: 'toilet', name: 'Town public washroom', category: 'toilets', area: 'canmore', menuUrl: undefined, latitude: 51.09, longitude: -115.35, cuisine: undefined }, { ...base, id: 'water', name: 'Water fountain', category: 'water', area: 'louise', menuUrl: undefined, cuisine: undefined }, { ...base, id: 'invalid', latitude: 0 }];
test('map selection composes multi-category, area and accent-insensitive AND search', () => {
 assert.deepEqual(filterMapPoints(points, { categories: ['restaurants', 'toilets'] }).map(p => p.id), ['restaurant', 'toilet']);
 assert.deepEqual(filterMapPoints(points, { categories: ['restaurants', 'toilets'], area: 'banff', query: 'cafe canadian' }).map(p => p.id), ['restaurant']);
 assert.equal(filterMapPoints(points, { categories: ['toilets'], area: 'louise' }).length, 0);
 assert.equal(filterMapPoints(points, {}).length, 3);
});
test('menu filter includes only reviewed public HTTPS links and facet counts ignore category choice', () => {
 assert.deepEqual(filterMapPoints(points, { menusOnly: true }).map(p => p.id), ['restaurant']);
 assert.equal(mapCategoryCounts(points, { area: 'canmore' }).toilets, 1);
 assert.equal(mapCategoryCounts(points, { menusOnly: true }).restaurants, 1);
 assert.equal(mapCategoryCounts(points, { menusOnly: true }).toilets, 0);
 assert.equal(filterMapPoints([{ ...base, menuUrl: 'javascript:alert(1)' }], { menusOnly: true }).length, 0);
});
test('map URLs cannot launch script schemes, local/IP services, credentials or disguised ports', () => {
 for (const url of ['javascript:alert(1)', 'http://thebison.ca/menu', 'https://user:secret@thebison.ca/menu', 'https://thebison.ca:8443/menu', 'https://localhost/menu', 'https://127.0.0.1/menu', 'https://[::1]/menu', 'https://admin.local/menu', 'https://menu.internal/', 'https://thebison.ca/%0Aevil', ' https://thebison.ca/menu', 'https://thebison.ca/a b']) assert.equal(safeMapExternalUrl(url), null, url);
 assert.equal(safeMapExternalUrl(base.menuUrl), base.menuUrl);
 assert.equal(safeMapExternalUrl('https://www.openstreetmap.org/way/123'), 'https://www.openstreetmap.org/way/123');
});
test('only finite regional coordinates can be mapped; source URL uses selected destination only', () => {
 assert.ok(validMapCoordinate(51.18, -115.57));
 for (const [lat, lon] of [[NaN, -115], [Infinity, -115], [0, 0], [51, 0], [54, -115]]) assert.equal(validMapCoordinate(lat, lon), false);
 assert.equal(mapLocationUrl({ ...base, longitude: NaN }), null);
 assert.equal(mapLocationUrl(base), 'https://www.openstreetmap.org/?mlat=51.18&mlon=-115.57#map=17/51.18/-115.57');
});
test('nearby ordering uses straight-line distances with invalid position rejected', () => {
 assert.equal(mapDistanceKm(base, base), 0);
 assert.ok(mapDistanceKm(points[1], base) > 10);
 assert.equal(mapDistanceKm(base, { latitude: 91, longitude: -115 }), Infinity);
 assert.deepEqual(points.map(p => p.id), ['restaurant', 'toilet', 'water', 'invalid']);
});
