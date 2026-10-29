import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { build } from 'esbuild';

// Read and exercise the actual data/template expression without a site build or network.
const { outputFiles } = await build({
  stdin: {
    contents: "export { trails } from './src/data/trails.ts'; export { trailPark } from './src/data/trailPlanning.ts';",
    resolveDir: process.cwd(),
  },
  bundle: true,
  write: false,
  platform: 'node',
  format: 'esm',
});
const { trails, trailPark } = await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`);
const legacy = trails.find(trail => trail.slug === 'golf-course-loop-xc-ski');
assert.ok(legacy, 'The retained legacy URL should remain explicit.');
assert.equal(legacy.directoryEligible, false, 'An unverified legacy route must stay out of the directory.');
assert.equal(legacy.routeVerified, false, 'An unverified legacy route must not become a recommended route.');
assert.equal(legacy.transitRoute, undefined, 'The legacy route must not retain unsupported transit directions.');

const template = await readFile('src/pages/trails/[slug].astro', 'utf8');
const section = template.slice(template.indexOf('<strong>Transport planning</strong>'));
const expression = section.match(/<p>\{([\s\S]*?)\}<\/p>/)?.[1];
assert.ok(expression, 'Find the transport paragraph in the actual detail template.');
const renderTransport = new Function('trail', `return (${expression});`);
const unsupportedDirections = 'UNVERIFIED FIXTURE BUS TO LEGACY TRAILHEAD';
assert.ok(!renderTransport({ ...legacy, transitRoute: unsupportedDirections }).includes(unsupportedDirections),
  'Even accidentally restored transit directions must be suppressed on an unverified route.');
assert.match(renderTransport(legacy), /No transport or trailhead directions are verified/);
assert.equal(renderTransport({ routeVerified: true, transitRoute: 'Verified seasonal operator connection' }),
  'Verified seasonal operator connection', 'A verified route keeps its documented transport advice.');
assert.match(renderTransport({}), /No direct public-transit connection is verified/,
  'Missing transport data must remain unknown instead of requiring a car.');

const goatCreek = trails.find(trail => trail.slug === 'goat-creek-xc-ski');
assert.equal(trailPark(goatCreek), 'Banff National Park / Spray Valley Provincial Park',
  'An explicit mixed-jurisdiction park label must override directory-area inference.');
assert.match(goatCreek.accessNote, /Alberta Parks/);
assert.match(goatCreek.accessNote, /Banff National Park trail report/);
assert.ok(goatCreek.sourceUrls.some(source => new URL(source.url).hostname.endsWith('albertaparks.ca')));
assert.ok(goatCreek.sourceUrls.some(source => new URL(source.url).hostname === 'parks.canada.ca'));
assert.equal(goatCreek.distance, '19 km one way');
assert.equal(goatCreek.elevationGain, '435 m in official profile; confirm direction');
assert.equal(goatCreek.elevationLoss, '160 m in official profile; confirm direction');

const mapTemplate = await readFile('src/pages/trail-map.astro', 'utf8');
const mapScript = mapTemplate.match(/<script define:vars=\{\{ trailData \}\}>([\s\S]*?)<\/script>/)?.[1];
assert.ok(mapScript, 'Exercise the actual map client script.');

function mapHarness() {
  const elements = new Map();
  const scripts = [];
  const timers = new Map();
  const fixtureTrails = trails.filter(trail => trail.directoryEligible !== false).slice(0, 2);
  const cards = fixtureTrails.map(trail => ({
    style: {},
    dataset: { id: trail.id, name: trail.name.toLowerCase(), difficulty: trail.difficulty,
      type: trail.type, season: trail.season, area: trail.area },
  }));
  let timerId = 0;
  let mapCalls = 0;
  const markers = [];
  const element = id => {
    if (!elements.has(id)) elements.set(id, {
      value: id === 'search-input' ? '' : 'all', style: {}, hidden: false, textContent: '',
      classList: { add() {}, remove() {} }, listeners: {},
      addEventListener(type, listener) { this.listeners[type] = listener; },
    });
    return elements.get(id);
  };
  const map = { setView() { return this; }, invalidateSize() {} };
  const leaflet = {
    map() { mapCalls++; assert.equal(mapCalls, 1, 'Map initialisation must be idempotent.'); return map; },
    tileLayer() { return { addTo() {} }; },
    divIcon(value) { return value; },
    marker() {
      const marker = { active: false, addTo() { this.active = true; return this; },
        bindPopup() {}, remove() { this.active = false; } };
      markers.push(marker);
      return marker;
    },
  };
  const window = { location: { search: '' } };
  const context = vm.createContext({
    trailData: JSON.stringify(fixtureTrails), window, URLSearchParams, Set,
    setTimeout(callback) { timers.set(++timerId, callback); return timerId; },
    clearTimeout(id) { timers.delete(id); },
    document: {
      getElementById: element,
      querySelectorAll() { return cards; },
      createElement() { return { removed: false, remove() { this.removed = true; } }; },
      head: { appendChild(script) { scripts.push(script); } },
    },
  });
  vm.runInContext(mapScript, context);
  return {
    element, scripts, timers, markers,
    click(id) { return element(id).listeners.click(); },
    supplyLeaflet() { window.L = leaflet; context.L = leaflet; },
    get mapCalls() { return mapCalls; },
  };
}

const doubleClick = mapHarness();
const firstClick = doubleClick.click('map-view-btn');
const secondClick = doubleClick.click('map-view-btn');
assert.equal(doubleClick.scripts.length, 1, 'Two clicks during loading must share one script request.');
doubleClick.supplyLeaflet();
doubleClick.scripts[0].onload();
await Promise.all([firstClick, secondClick]);
assert.equal(doubleClick.mapCalls, 1);
assert.equal(doubleClick.timers.size, 0, 'Successful loading must cancel its timeout.');
assert.equal(doubleClick.element('map-load-feedback').hidden, true);
await doubleClick.click('map-view-btn');
assert.equal(doubleClick.scripts.length, 1, 'Reopening a ready map must not load another script.');

for (const failure of ['error', 'timeout', 'missing-library']) {
  const harness = mapHarness();
  const pending = harness.click('map-view-btn');
  if (failure === 'timeout') [...harness.timers.values()][0]();
  else if (failure === 'missing-library') harness.scripts[0].onload();
  else harness.scripts[0].onerror();
  await pending;
  assert.equal(harness.element('trail-grid').style.display, '', `${failure}: the route list must return.`);
  assert.equal(harness.element('map-container').style.display, 'none');
  assert.equal(harness.element('retry-map-btn').hidden, false);
  assert.equal(harness.element('map-load-feedback').hidden, false);
  assert.match(harness.element('map-load-message').textContent, /route list and filters remain available/);
  assert.equal(harness.scripts[0].removed, true, 'A failed script must be removed before retry.');
  assert.equal(harness.timers.size, 0);
  harness.element('search-input').value = fixtureSearch();
  harness.element('search-input').listeners.input();
  const retry = harness.click('retry-map-btn');
  assert.equal(harness.scripts.length, 2, 'Retry must start one new request after failure.');
  harness.supplyLeaflet();
  harness.scripts[1].onload();
  await retry;
  assert.equal(harness.mapCalls, 1, `${failure}: a successful retry must initialise once.`);
  assert.equal(harness.element('map-load-feedback').hidden, true);
  assert.equal(harness.markers.filter(marker => marker.active).length, 1,
    'Retry must retain filters applied while the map was unavailable.');
}

function fixtureSearch() { return trails.filter(trail => trail.directoryEligible !== false)[0].name.toLowerCase(); }

const changedView = mapHarness();
const loading = changedView.click('map-view-btn');
changedView.click('grid-view-btn');
changedView.supplyLeaflet();
changedView.scripts[0].onload();
await loading;
assert.equal(changedView.element('trail-grid').style.display, '', 'A completed load must not override a later Grid selection.');
assert.equal(changedView.element('map-container').style.display, 'none');

console.log('Trail transport, mixed-jurisdiction and actual-script map regressions passed.');
