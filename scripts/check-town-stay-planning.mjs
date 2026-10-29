import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { build, transform as transformJS } from 'esbuild';
import { transform as transformAstro } from '@astrojs/compiler';

// Source/model + real client checks only: no network or full-site build.
const bundle = await build({ stdin: { contents: "export * from './src/data/townStayPlanning.ts'; export { towns } from './src/data/towns.ts'; export { directoryHotels } from './src/data/hotelDirectory.ts'; export { hotels } from './src/data/hotels.ts';", resolveDir: process.cwd() }, bundle: true, write: false, platform: 'node', format: 'esm' });
const model = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const { canmoreStayExamples: examples, normaliseCanmoreStayFilters: normalise, buildCanmoreStayPlan: plan } = model;
const ids = ['lamphouse-canmore', 'malcolm-hotel', 'basecamp-lodge-canmore', 'blackstone-mountain-lodge', 'stoneridge-mountain-resort', 'copperstone-resort'];
const frozenFiles = {
  'src/data/hotels.ts': '2fff1117432d359cfdfea771c5e36153dbf37107e9609e7d5430a7bd9eb34e48',
  'src/data/hotelDirectory.ts': 'bba710c243ef3cd64256e51adb8d54898bf200bc0db8090c5b21b197ed44492f',
  'src/pages/hotel-directory/index.astro': '1125c296d95b40f218c4dad2f2a7af9dbbfc861bdd8a65677be7ba60a396dacf',
  'src/pages/hotel-directory/[slug].astro': 'c5c80421cb748a2307520e698e128887f23c10c825a4cd51fa7b81c93d151b9d',
};
for (const [filename, hash] of Object.entries(frozenFiles)) assert.equal(createHash('sha256').update(await readFile(filename)).digest('hex'), hash, `Frozen hotel source unchanged: ${filename}`);
assert.equal(model.hotels.length, 95);
assert.equal(model.directoryHotels.filter(hotel => hotel.sourceStatus === 'reviewed').length, 49);
assert.equal(model.directoryHotels.filter(hotel => hotel.sourceStatus === 'location-only').length, 1);
assert.equal(model.directoryHotels.filter(hotel => hotel.sourceStatus === 'former-name').length, 2);
assert.equal(model.townStayPlanningReviewedAt, '2026-10-29');
assert.deepEqual(model.townStayUpdatedSlugs, model.towns.map(town => town.slug));
assert.deepEqual(examples.map(example => example.slug), ids);
for (const example of examples) {
  const hotel = model.directoryHotels.find(hotel => hotel.slug === example.slug);
  assert.equal(hotel?.sourceStatus, 'reviewed');
  assert.equal(hotel.checkedOn, example.slug === 'blackstone-mountain-lodge' ? '2026-10-28' : '2026-10-29', 'Original operator-fact date is retained.');
  assert.ok(example.area && example.fit && example.room && example.tradeoff && example.journey);
  assert.ok(!('expediaUrl' in example) && !('price' in example) && !('rating' in example), 'Comparison adds no provider identity or invented quote/rating.');
}
const boundary = model.directoryHotels.find(hotel => hotel.slug === 'banff-boundary-lodge');
assert.equal(boundary.sourceStatus, 'location-only');
assert.ok(!ids.includes(boundary.slug));
assert.match(model.nearbyHamletNotes.map(note => note.text).join(' '), /Dead Man|separate/);
assert.match(model.nearbyHamletNotes.find(note => note.name === 'Harvie Heights').text, /unit facilities and booking offer are not verified/);
assert.match(examples.find(example => example.slug === 'copperstone-resort').area, /Dead Man’s Flats.*separate hamlet/);
assert.match(examples.find(example => example.slug === 'blackstone-mountain-lodge').journey, /in Canmore, not Kananaskis Village/);
const defaults = { priority: 'all', season: 'winter', transport: 'unsure' };
for (const bad of [null, undefined, [], 12, '<script>', { priority: 'best-price', season: '2027', transport: 'free-shuttle' }]) assert.deepEqual(normalise(bad), defaults);
assert.deepEqual(plan({ priority: 'town-walking' }).selectedIds, ids.slice(0, 2));
assert.deepEqual(plan({ priority: 'full-cooking' }).selectedIds, ids.filter(id => id !== 'malcolm-hotel'));
assert.deepEqual(plan({ priority: 'regional-road' }).selectedIds, ['copperstone-resort']);
let combinations = 0;
for (const priority of model.canmoreStayPriorities) for (const season of model.canmoreStaySeasons) for (const transport of model.canmoreStayTransport) {
  const result = plan({ priority: priority.value, season: season.value, transport: transport.value });
  assert.deepEqual(result.selectedIds, plan({ priority: priority.value }).selectedIds, 'Season/transport change journey notes, not room availability or eligibility.');
  assert.match(result.notes[0], /do not establish available rooms/);
  assert.ok(result.notes.length >= 3);
  combinations++;
}
assert.match(plan().notes.join(' '), /fall\/winter Route 12 serves downtown Canmore and Palliser Lane only/);
assert.match(plan({ season: 'summer' }).notes.join(' '), /published 2026.*does not promise service for a later summer/);
assert.match(plan({ transport: 'no-car' }).notes.join(' '), /Route 3 to Banff is separate from resort ski buses/);
assert.match(plan({ transport: 'drive' }).notes.join(' '), /separate ski-trail\/facility requirements/);
const canmore = model.towns.find(town => town.slug === 'canmore');
assert.match(canmore.transport, /fall\/winter Route 12.*Palliser Lane only/);
assert.match(canmore.winter[0].text, /current winter Route 12 does not supply that leg/);
assert.match(canmore.winter[0].text, /ski-trail pass.*separate Kananaskis parking/);
for (const town of model.towns) {
  assert.equal(town.faqs.length, 2);
  for (const slug of town.hotelSlugs) assert.equal(model.directoryHotels.find(hotel => hotel.slug === slug)?.sourceStatus, 'reviewed');
}
assert.equal(model.townBookingJourneys.banff.href, '/book/banff-hotels/');
assert.equal(model.townBookingJourneys['lake-louise'].href, '/book/lake-louise-stays/');
for (const journey of Object.values(model.townBookingJourneys)) await access(`src/pages${journey.href.replace(/\/$/, '')}.astro`);
assert.equal(new URL(model.townResortJourneys.golden.lessons).hostname, 'kickinghorseresort.com');
assert.equal(new URL(model.townResortJourneys.kananaskis.lessons).hostname, 'skinakiska.com');
for (const journey of Object.values(model.townResortJourneys)) {
  assert.ok(journey.lessons !== journey.arrival);
  assert.match(journey.text, /planner does not cover/);
  for (const key of ['lessons', 'arrival']) assert.equal(new URL(journey[key]).protocol, 'https:');
}

const filename = 'src/pages/towns/[slug].astro';
const page = await readFile(filename, 'utf8');
const transformed = await transformAstro(page, { filename });
assert.deepEqual(transformed.diagnostics.filter(diagnostic => diagnostic.severity === 1), []);
assert.match(page, /directoryHotels as hotels/);
assert.match(page, /\['banff', 'canmore', 'lake-louise'\]\.includes\(town\.slug\)/);
assert.match(page, /from Field or Emerald Lake/);
assert.match(page, /canmoreExamples\.map\(example => <article[^>]*data-canmore-stay-id=\{example\.slug\}/);
assert.ok(!/<article[^>]*data-canmore-stay-id[^>]*\bhidden/.test(page), 'All six cards are visible in SSR/no-JS output.');
assert.match(page, /<form[^>]*id="canmore-stay-form"[^>]*hidden/);
for (const id of ['canmore-priority', 'canmore-season', 'canmore-transport']) assert.ok(page.includes(`label for="${id}"`) && page.includes(`id="${id}"`));
assert.ok(page.includes('type="reset"') && page.includes('role="status" aria-live="polite" aria-atomic="true"'));
assert.match(page, /<noscript><p>All six room examples and the winter journey checklist are shown/);
assert.match(page, /defaultCanmorePlan\.notes\.map/);
assert.match(page, /datetime=\{example\.hotel\.checkedOn\}/);
for (const marker of ['data-canmore-profile', 'data-source-scope="location-only"', 'data-town-booking-comparison', 'data-town-resort-lessons', 'data-town-resort-arrival', 'id="official-sources"']) assert.ok(page.includes(marker));
assert.match(page, /camref=1101l3MtWX/);
assert.match(page, /rel="noopener sponsored"/);
assert.match(page, /Affiliate link: BanffBound may earn a commission/);
assert.ok(!/innerHTML|insertAdjacentHTML|localStorage|sessionStorage|fetch\(|AggregateRating|OfferCatalog/.test(page));
assert.match(page, /Guide researched 28 October 2026/);
assert.match(page, /earlier operator-fact review dates are retained/);

const script = page.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script);
const code = (await transformJS(script.replace(/^\s*import .*$/gm, ''), { loader: 'ts', target: 'es2022' })).code;
function harness(url = 'https://banffbound.com/towns/canmore/?utm_source=google&gclid=retain-native-context#canmore-stay-comparison', { missing = false, blockedHistory = false } = {}) {
  const elements = new Map(), listeners = {};
  const initial = { 'canmore-priority': 'all', 'canmore-season': 'winter', 'canmore-transport': 'unsure' };
  const element = id => {
    if (!elements.has(id)) elements.set(id, { value: initial[id] ?? '', hidden: id === 'canmore-stay-form', dataset: {}, textContent: '', children: [], listeners: {}, addEventListener(type, handler) { (this.listeners[type] ??= []).push(handler); }, replaceChildren(...children) { this.children = children; } });
    return elements.get(id);
  };
  const cards = ids.map(id => ({ dataset: { canmoreStayId: id }, hidden: false }));
  const location = { href: url };
  const window = { location, history: { replaceState(_state, _title, next) { if (blockedHistory) throw new Error('History unavailable'); location.href = String(next); } } };
  const document = { getElementById: id => missing ? null : element(id), querySelectorAll() { return missing ? [] : cards; }, createElement() { return { textContent: '' }; }, addEventListener(type, handler) { (listeners[type] ??= []).push(handler); } };
  vm.runInNewContext(code, { document, window, URL, Set, Object, buildCanmoreStayPlan: plan, normaliseCanmoreStayFilters: normalise });
  return { element, cards, location, visible: () => cards.filter(card => !card.hidden).map(card => card.dataset.canmoreStayId), fire(type) { for (const handler of element('canmore-stay-form').listeners[type] ?? []) handler({ preventDefault() {} }); }, again() { for (const handler of listeners['astro:page-load'] ?? []) handler(); } };
}
const client = harness();
assert.equal(client.element('canmore-stay-form').hidden, false);
assert.deepEqual(client.visible(), ids);
assert.ok(client.element('canmore-stay-notes').children.some(child => child.textContent.includes('Palliser Lane only')));
client.element('canmore-priority').value = 'full-cooking'; client.fire('change');
assert.deepEqual(client.visible(), ids.filter(id => id !== 'malcolm-hotel'));
client.element('canmore-season').value = 'summer'; client.element('canmore-transport').value = 'no-car'; client.fire('change');
assert.equal(client.visible().length, 5);
assert.ok(client.element('canmore-stay-notes').children.some(child => child.textContent.includes('published 2026')));
assert.ok(client.element('canmore-stay-notes').children.some(child => child.textContent.includes('Route 3 to Banff')));
client.element('canmore-season').value = 'unsure'; client.fire('change');
assert.equal(new URL(client.location.href).searchParams.get('town_season'), 'unsure', 'Undecided season must survive sharing/reload; winter is the default.');
const shared = harness(client.location.href);
assert.equal(shared.element('canmore-season').value, 'unsure'); assert.equal(shared.visible().length, 5);
client.element('canmore-priority').value = 'regional-road'; client.fire('change');
assert.deepEqual(client.visible(), ['copperstone-resort']);
assert.match(client.element('canmore-stay-count').textContent, /^1 room-category example ·/);
client.fire('reset'); assert.deepEqual(client.visible(), ids);
for (const [key, value] of Object.entries(defaults)) assert.equal(client.element(`canmore-${key}`).value, value);
const resetUrl = new URL(client.location.href);
assert.equal(resetUrl.searchParams.get('utm_source'), 'google'); assert.equal(resetUrl.searchParams.get('gclid'), 'retain-native-context'); assert.equal(resetUrl.hash, '#canmore-stay-comparison');
for (const key of ['priority', 'season', 'transport']) assert.equal(resetUrl.searchParams.has(`town_${key}`), false);
client.again(); assert.equal(client.element('canmore-stay-form').listeners.change.length, 1);
const restore = harness('https://banffbound.com/towns/canmore/?town_priority=town-walking&town_season=summer&town_transport=drive');
assert.deepEqual(restore.visible(), ids.slice(0, 2)); assert.equal(restore.element('canmore-transport').value, 'drive');
const invalid = harness('https://banffbound.com/towns/canmore/?town_priority=%3Cscript%3E&town_season=2027&town_transport=free-shuttle');
assert.deepEqual(invalid.visible(), ids); assert.equal(invalid.element('canmore-season').value, 'winter');
const duplicate = harness('https://banffbound.com/towns/canmore/?town_priority=town-walking&town_priority=regional-road&town_season=summer&town_season=winter');
assert.deepEqual(duplicate.visible(), ids); assert.equal(duplicate.element('canmore-season').value, 'winter');
const blocked = harness(undefined, { blockedHistory: true }); blocked.element('canmore-priority').value = 'town-walking'; blocked.fire('change'); assert.deepEqual(blocked.visible(), ids.slice(0, 2));
assert.doesNotThrow(() => harness(undefined, { missing: true }), 'Other town pages have no Canmore form.');
console.log(`Town stay planning checks passed: six sourced Canmore examples, ${combinations} journey combinations, actual-client filter/reset/deep-link/invalid-input/history-failure checks, SSR/control/source/booking handoffs, 95 frozen hotel records and four protected hotel files. No network or site build.`);
