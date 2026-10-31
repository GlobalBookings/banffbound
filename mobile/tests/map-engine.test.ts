import test from 'node:test';
import assert from 'node:assert/strict';
import { Script, runInNewContext } from 'node:vm';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createMapDocument, decodeMapMessage, isAllowedMapAttributionUrl, MAP_MAX_POINTS, mapUpdateMessage, mapViewState, normaliseMapPoints, safeScriptJson } from '../src/lib/mapDocument.ts';
import { leafletCss, leafletJs } from '../src/lib/vendor/leaflet.ts';
import type { MapMarker } from '../src/data/map.ts';

const marker = (id: string, fields: Partial<MapMarker> = {}): MapMarker => ({ id, name: 'Bow River viewpoint', category: 'viewpoints', latitude: 51.177, longitude: -115.571, ...fields });
const channel = 'bb-map-engine-test';
const bridge = (message: object) => JSON.stringify({ source: 'banffbound-map', channel, ...message });
function engineHelpers() {
  const script = [...createMapDocument(channel).matchAll(/<script>([\s\S]*?)<\/script>/g)][1][1];
  const context = { window: { parent: { postMessage: () => {} } }, clusterPoints: undefined as unknown as (points: { id: string; x: number; y: number }[]) => string[][], shouldFocusSelection: undefined as unknown as (before: string | null, next: string | null, zoom: number, visible: boolean) => boolean };
  runInNewContext(script, context);
  return context;
}

test('marker ingestion rejects corrupt coordinates, duplicate identities and unsupported categories without mutating caller data', () => {
  const input = [marker('valid'), marker('valid'), marker('nan', { latitude: NaN }), marker('range', { longitude: 181 }), marker('pole', { latitude: 90 }), marker('bad id'), marker('empty', { name: '' }), marker('category', { category: 'invented' as never })];
  const before = input.map(p => ({ ...p }));
  assert.deepEqual(normaliseMapPoints(input), [marker('valid')]);
  assert.deepEqual(input, before);
  assert.equal(normaliseMapPoints(Array.from({ length: MAP_MAX_POINTS + 20 }, (_, i) => marker('p-' + i))).length, MAP_MAX_POINTS);
});

test('state snapshots strip extra fields and orphaned selections; invalid location never enters the document', () => {
  const point = { ...marker('known'), notes: 'Private booking note', extra: { token: 'secret' } };
  assert.deepEqual(mapViewState([point], 'missing', { latitude: Infinity, longitude: 1 }), { points: [marker('known')], selectedId: null, position: null });
  assert.equal(mapViewState([point], 'known').selectedId, 'known');
  assert.ok(!mapUpdateMessage(channel, mapViewState([point])).includes('Private'));
});

test('the host bridge accepts only this channel and currently rendered identities', () => {
  const ids = new Set(['known']);
  assert.deepEqual(decodeMapMessage(bridge({ type: 'select', id: 'known' }), channel, ids), { type: 'select', id: 'known' });
  for (const raw of [bridge({ type: 'select', id: 'hidden' }), bridge({ type: 'select', id: '__proto__' }), bridge({ type: 'status', status: 'safe' }), bridge({ type: 'select', id: 'known', channel: 'other' }), '{}', 'null', '{bad', bridge({ type: 'select', id: 'known', padding: 'x'.repeat(2100) }), bridge({ type: 'select', id: 'known', padding: '🙂'.repeat(600) })]) assert.equal(decodeMapMessage(raw, channel, ids), null);
  assert.equal(decodeMapMessage({ type: 'select', id: 'known' }, channel, ids), null);
});

test('external map attribution cannot become an arbitrary browser or app launch', () => {
  for (const url of ['https://www.openstreetmap.org/copyright', 'https://www.openstreetmap.org/fixthemap']) {
    assert.equal(isAllowedMapAttributionUrl(url), true);
    assert.deepEqual(decodeMapMessage(bridge({ type: 'external', url }), channel, new Set()), { type: 'external', url });
  }
  for (const url of ['javascript:alert(1)', 'https://www.openstreetmap.org.attacker.test/copyright', 'https://www.openstreetmap.org/copyright?email=private', 'https://private@www.openstreetmap.org/copyright', 'http://www.openstreetmap.org/copyright']) assert.equal(decodeMapMessage(bridge({ type: 'external', url }), channel, new Set()), null);
});

test('overlapping pins remain selectable as a group without inventing displaced coordinates', () => {
  const points = [{ id: 'restaurant', x: 100, y: 100 }, { id: 'cafe', x: 101, y: 99 }, { id: 'toilet', x: 100, y: 100 }, { id: 'distant', x: 180, y: 150 }];
  const before = structuredClone(points);
  const cluster = engineHelpers().clusterPoints;
  assert.deepEqual(JSON.parse(JSON.stringify(cluster(points))), [['restaurant', 'cafe', 'toilet'], ['distant']]);
  assert.deepEqual(points, before);
  assert.deepEqual(JSON.parse(JSON.stringify(cluster([]))), []);
});

test('new selections reveal remote or zoomed-out places while repeated selection and filtering preserve the viewport', () => {
  const focus = engineHelpers().shouldFocusSelection;
  assert.equal(focus(null, 'new-place', 9, true), true);
  assert.equal(focus('old-place', 'new-place', 16, false), true);
  assert.equal(focus('old-place', 'new-place', 16, true), false);
  assert.equal(focus('same-place', 'same-place', 9, false), false);
  assert.equal(focus('old-place', null, 9, false), false);
});

test('device location updates draw a local marker without moving the tile viewport', () => {
  const moved: unknown[] = [], drawn: unknown[] = [];
  const element = () => ({ hidden: true, className: '', textContent: '', style: {}, setAttribute() {}, addEventListener() {}, replaceChildren() {}, appendChild() {} });
  const nodes = new Map<string, ReturnType<typeof element>>();
  const map: any = { setView: (...args: unknown[]) => { moved.push(args); return map; }, fitBounds: (...args: unknown[]) => { moved.push(args); return map; }, getZoom: () => 15, getBounds: () => ({ contains: () => true }), latLngToContainerPoint: () => ({ x: 100, y: 100 }), on() {}, invalidateSize() {} };
  const layer: any = { addTo: () => layer, clearLayers() {}, remove() {} };
  const tile: any = { on: () => tile, addTo: () => tile };
  const pin: any = { on: () => pin, addTo: () => pin, getElement: element };
  const win: any = { parent: { postMessage() {} }, addEventListener() {}, L: { map: () => map, control: { zoom: () => ({ addTo() {} }) }, layerGroup: () => layer, tileLayer: () => tile, divIcon: () => ({}), marker: () => pin, circleMarker: (coords: unknown) => { drawn.push(coords); return layer; } } };
  const script = [...createMapDocument(channel).matchAll(/<script>([\s\S]*?)<\/script>/g)][1][1];
  runInNewContext(script, { window: win, document: { getElementById: (id: string) => { if (!nodes.has(id)) nodes.set(id, element()); return nodes.get(id); }, createElement: element, querySelectorAll: () => [] }, setTimeout: () => 0 });
  const update = (position: unknown) => win.BanffBoundMap.update({ source: 'banffbound-host', type: 'update', channel, state: { points: [marker('venue')], selectedId: null, position } });
  update(null);
  moved.length = 0;
  update({ latitude: 51.18, longitude: -115.58 });
  update({ latitude: 51.19, longitude: -115.59 });
  assert.equal(moved.length, 0, 'GPS must not select a tile viewport or expose a location-derived region');
  assert.deepEqual(JSON.parse(JSON.stringify(drawn)), [[51.18, -115.58], [51.19, -115.59]]);
});

test('script serialization preserves hostile public names as inert data', () => {
  const data = mapViewState([marker('hostile', { name: '</script><img src=x onerror=alert(1)>&\u2028\u2029' })]);
  const encoded = safeScriptJson(data);
  assert.ok(!encoded.includes('</script>'));
  assert.deepEqual(JSON.parse(encoded), data);
  assert.throws(() => createMapDocument('</script>'));
});

test('the shipped document is standalone parseable JS and reports a missing engine through the bounded bridge', () => {
  const html = createMapDocument(channel);
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  assert.equal(scripts.length, 2);
  scripts.forEach(script => new Script(script));
  const messages: string[] = [];
  runInNewContext(scripts[1], { window: { parent: { postMessage: (raw: string) => messages.push(raw) } } });
  assert.deepEqual(decodeMapMessage(messages[0], channel, new Set()), { type: 'status', status: 'unavailable' });
  assert.ok(!/<script[^>]+src=|<link[^>]+href=/i.test(html));
  assert.ok(html.includes('https://tile.openstreetmap.org/{z}/{x}/{y}.png'));
  assert.ok(html.includes('referrerPolicy:\'origin\''));
  assert.ok(html.includes('OpenStreetMap contributors · ODbL'));
  assert.ok(!html.includes('sourceMappingURL='));
});

test('bundled library bytes match the official Leaflet 1.9.4 release integrity after the documented footer-only change', () => {
  const provenance = JSON.parse(readFileSync(new URL('../src/lib/vendor/leaflet.provenance.json', import.meta.url), 'utf8'));
  assert.equal(createHash('sha256').update(leafletCss).digest('hex'), provenance.files.css.upstreamSha256);
  assert.equal(provenance.files.js.upstreamIntegrity, 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=');
  assert.equal(createHash('sha256').update(leafletJs).digest('hex'), provenance.files.js.vendoredSha256);
  assert.ok(leafletJs.includes('1.9.4'));
});
