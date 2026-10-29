import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { build, transform as transformJS } from 'esbuild';
import { transform as transformAstro } from '@astrojs/compiler';

// In-memory model/compiler and actual-client checks. No site build, network or snapshots.
const compiled = await build({ stdin: { contents: "export * from './src/data/parkingData.ts'; export * from './src/data/parkingPlanning.ts'; export { blogPosts } from './src/data/blogPosts.ts'; export { trails } from './src/data/trails.ts';", resolveDir: process.cwd() }, bundle: true, write: false, platform: 'node', format: 'esm' });
const model = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);
const { parkingLots, buildParkingPlan, normaliseParkingChoices, buildLakeJourney } = model;
const ids = ['lake-louise-main', 'moraine-lake', 'lake-minnewanka', 'johnston-canyon', 'banff-gondola', 'tunnel-mountain', 'bow-falls', 'sunshine-village', 'peyto-lake', 'parker-ridge', 'banff-central'];
assert.deepEqual(parkingLots.map(lot => lot.id), ids, 'Preserve all eleven record IDs.');
assert.equal(new Set(ids).size, 11);
for (const lot of parkingLots) {
  for (const retired of ['capacity', 'fillTimes', 'lat', 'lng', 'status', 'available']) assert.equal(lot[retired], undefined, `No unsupported ${retired}: ${lot.id}`);
  assert.ok(lot.summary && lot.parkingPlan && lot.returnPlan && lot.vehicleNote && lot.accessNote && lot.transitPlan);
  assert.deepEqual(Object.keys(lot.seasonAdvice), ['winter', 'summer', 'shoulder']);
  assert.ok(lot.sources.length >= 3 && lot.alternatives.length >= 2);
  for (const source of lot.sources) assert.equal(new URL(source.url).protocol, 'https:');
}
assert.match(parkingLots.find(lot => lot.id === 'moraine-lake').parkingPlan, /registered Moraine Lake Lodge guests/);
assert.match(parkingLots.find(lot => lot.id === 'johnston-canyon').transitPlan, /Roam 9/);
assert.match(parkingLots.find(lot => lot.id === 'bow-falls').transitPlan, /seasonal Roam 4/);
assert.match(parkingLots.find(lot => lot.id === 'banff-gondola').transitPlan, /Roam 1/);
assert.equal(normaliseParkingChoices(null).destination, 'all');
assert.equal(normaliseParkingChoices({ destination: '<img src=x>', season: '2027-open', travel: 'carfree', largeVehicle: true, mobility: 'false' }).destination, 'all');
assert.equal(normaliseParkingChoices({ mobility: 'false' }).mobility, false);
assert.equal(normaliseParkingChoices({ travel: 'carfree', largeVehicle: true }).largeVehicle, false);
let combinations = 0;
for (const destination of ['all', ...ids]) for (const season of ['unsure', 'winter', 'summer', 'shoulder']) for (const travel of ['unsure', 'vehicle', 'carfree']) for (const base of ['banff', 'canmore', 'lake-louise', 'other']) for (const timing of ['day', 'early-late']) for (let flags = 0; flags < 8; flags++) {
  const plan = buildParkingPlan({ destination, season, travel, base, timing, mobility: !!(flags & 1), children: !!(flags & 2), largeVehicle: !!(flags & 4) });
  assert.equal(plan.selectedIds.length, destination === 'all' ? 11 : 1);
  assert.ok(plan.steps.length > 0 && plan.links.length > 0);
  assert.ok(!/fills (at|by)|Already full|Available —|Rarely fills|Capacity:/.test(plan.steps.join(' ')), 'No occupancy verdict from a planning selection.');
  if (travel !== 'vehicle') assert.ok(!plan.steps.some(step => step.startsWith('For the RV,')), 'Vehicle-only advice must not leak into car-free choices.');
  if (destination === 'moraine-lake' && season === 'winter') {
    assert.match(plan.steps.join(' '), /Choose a different winter destination/);
    assert.ok(!plan.steps.join(' ').includes('Super Pass'), 'Do not append summer connector instructions to the winter alternative.');
  }
  combinations++;
}
const winter = buildLakeJourney({ destination: 'moraine', season: 'winter', base: 'canmore', mobility: true, early: true });
assert.match(winter.steps.join(' '), /Choose a different winter destination/);
assert.match(winter.steps.join(' '), /Route 3/);
assert.ok(!winter.steps.join(' ').includes('departing the upper'), 'No Alpine Start departure advice for a winter workaround.');
assert.match(buildLakeJourney({ destination: 'moraine', season: 'summer', base: 'banff' }).steps.join(' '), /regular 8X ticket alone is not/);
assert.match(buildLakeJourney({ season: 'summer', mobility: true }).steps.join(' '), /Alpine Start product did not/);
assert.equal(buildLakeJourney({ base: '<script>', season: 'open' }).base, 'banff');

async function checkRoute(href) {
  const path = new URL(href, 'https://banffbound.com').pathname.replace(/\/$/, '');
  if (path.startsWith('/blog/')) return assert.ok(model.blogPosts.some(post => path === `/blog/${post.slug}`), href);
  if (path.startsWith('/trails/')) return assert.ok(model.trails.some(trail => path === `/trails/${trail.slug}`), href);
  if (path.startsWith('/activities/')) { await access('src/pages/activities/[slug].astro'); return; }
  try { await access(`src/pages${path}.astro`); } catch { await access(`src/pages${path}/index.astro`); }
}
for (const lot of parkingLots) for (const guide of lot.guides) await checkRoute(guide.href);
const paths = ['src/pages/parking.astro', 'src/pages/shuttle-reservations.astro'];
const pages = await Promise.all(paths.map(path => readFile(path, 'utf8')));
for (let index = 0; index < pages.length; index++) {
  const result = await transformAstro(pages[index], { filename: paths[index] });
  assert.equal(result.diagnostics.filter(diagnostic => diagnostic.severity === 1).length, 0, paths[index]);
  assert.ok(pages[index].includes('faq.question') && pages[index].includes('faq.answer'), 'Visible FAQ/schema share data.');
  assert.ok(!/RESERVATION_OPEN|setInterval|innerHTML|predict\(|fillTimes|lot-available/.test(pages[index]), 'No legacy countdown/prediction/unsafe insertion.');
  assert.ok(pages[index].includes('Illustrative') && pages[index].includes('without JavaScript'));
  for (const [, href] of pages[index].matchAll(/href="(\/[^"#?]*)"/g)) await checkRoute(href);
}
assert.ok(pages[0].includes('<CarRentalCTA') && pages[0].includes('heading="Compare car rentals if driving fits your trip"'));
const rental = await readFile('src/components/CarRentalCTA.astro', 'utf8');
assert.ok(rental.includes('https://expedia.com/affiliate/KB6G4xt'));
assert.ok(pages[1].includes('partner_id=QW960HO') && pages[1].includes('rel="noopener sponsored"'));
assert.ok(/<form[^>]*id="parking-form"[^>]*hidden/.test(pages[0]));
assert.ok(/<form[^>]*id="lake-journey-form"[^>]*hidden/.test(pages[1]));
assert.ok(!/<article class="destination-card"[^>]*\bhidden/.test(pages[0]), 'All destination content starts visible without JS.');

async function harness(page, kind) {
  const source = page.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(source);
  const code = (await transformJS(source.replace(/^\s*import .*$/gm, ''), { loader: 'ts', target: 'es2020' })).code;
  const defaults = kind === 'parking' ? { '#parking-destination': 'all', '#parking-season': 'unsure', '#parking-travel': 'unsure', '#parking-base': 'banff', '#parking-timing': 'day' } : { '#lake-base': 'banff', '#lake-destination': 'both', '#lake-season': 'unsure' };
  const elements = new Map();
  const element = id => {
    if (!elements.has(id)) elements.set(id, { value: defaults[id] || '', checked: false, hidden: id.endsWith('-form'), disabled: false, listeners: {}, children: [], addEventListener(type, listener) { this.listeners[type] = listener; }, replaceChildren(...items) { this.children = items; } });
    return elements.get(id);
  };
  const cards = ids.map(destination => ({ hidden: false, dataset: { destination } }));
  let prints = 0;
  vm.runInNewContext(code, { buildParkingPlan, buildLakeJourney, Set, Array, window: { print() { prints++; } }, document: { querySelector: element, querySelectorAll() { return cards; }, createElement(tag) { return { tag, textContent: '' }; } } });
  return { element, cards, get prints() { return prints; }, texts(id) { return element(id).children.map(item => item.textContent).join(' '); } };
}
const parking = await harness(pages[0], 'parking');
assert.equal(parking.element('#parking-form').hidden, false);
assert.equal(parking.cards.filter(card => !card.hidden).length, 11);
parking.element('#parking-destination').value = 'moraine-lake'; parking.element('#parking-season').value = 'winter'; parking.element('#parking-travel').value = 'carfree'; parking.element('#parking-base').value = 'canmore'; parking.element('#parking-mobility').checked = true; parking.element('#parking-large-vehicle').checked = true;
parking.element('#parking-form').listeners.change();
assert.equal(parking.cards.filter(card => !card.hidden).length, 1);
assert.equal(parking.cards.find(card => !card.hidden).dataset.destination, 'moraine-lake');
assert.match(parking.texts('#parking-plan-steps'), /Choose a different winter destination/);
assert.match(parking.texts('#parking-plan-steps'), /Roam 3/);
assert.equal(parking.element('#parking-large-vehicle').disabled, true);
assert.ok(!parking.texts('#parking-plan-steps').includes('For the RV,'));
parking.element('#parking-travel').value = 'vehicle'; parking.element('#parking-form').listeners.change();
assert.equal(parking.element('#parking-large-vehicle').disabled, false);
assert.match(parking.texts('#parking-plan-steps'), /For the RV,/);
parking.element('#parking-form').listeners.reset({ preventDefault() {} });
assert.equal(parking.cards.filter(card => !card.hidden).length, 11);
assert.equal(parking.element('#parking-mobility').checked, false);
assert.equal(parking.element('#parking-large-vehicle').checked, false);
assert.equal(parking.element('#parking-large-vehicle').disabled, true);
parking.element('#parking-print').listeners.click(); assert.equal(parking.prints, 1);
const lake = await harness(pages[1], 'lake');
assert.equal(lake.element('#lake-journey-form').hidden, false);
lake.element('#lake-base').value = 'canmore'; lake.element('#lake-destination').value = 'moraine'; lake.element('#lake-season').value = 'summer'; lake.element('#lake-mobility').checked = lake.element('#lake-early').checked = true;
lake.element('#lake-journey-form').listeners.change();
assert.match(lake.texts('#lake-plan-steps'), /Super Pass/);
assert.match(lake.texts('#lake-plan-steps'), /Alpine Start was a separate 2026 product/);
lake.element('#lake-season').value = 'winter'; lake.element('#lake-journey-form').listeners.change();
assert.match(lake.texts('#lake-plan-steps'), /Choose a different winter destination/);
assert.ok(!lake.texts('#lake-plan-steps').includes('Alpine Start was a separate'));
assert.match(lake.texts('#lake-plan-steps'), /seasonal Parks accessible shuttle/);
lake.element('#lake-journey-form').listeners.reset({ preventDefault() {} });
assert.equal(lake.element('#lake-season').value, 'unsure');
assert.equal(lake.element('#lake-mobility').checked, false);
assert.equal(lake.element('#lake-early').checked, false);
console.log(`Parking/shuttle checks passed: 11 records; ${combinations} validated planning combinations; canonical/source/affiliate/FAQ contracts; both Astro transforms; actual-client filtering, constraints, reset, winter transition and print.`);
