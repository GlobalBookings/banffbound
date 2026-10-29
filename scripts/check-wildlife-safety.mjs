import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { build, transform as transformJS } from 'esbuild';
import { transform as transformAstro } from '@astrojs/compiler';

// Pure-model and actual client-script checks. No network, snapshots or site build.
const bundled = await build({ entryPoints: ['src/data/wildlifeSafety.ts'], bundle: true, write: false, platform: 'browser', format: 'esm' });
const model = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`);
const { wildlifeSources, wildlifeDistanceGroups, wildlifeContacts, wildlifeSeasons, getWildlifeSeason, getBearSprayTravelAdvice, bearSprayProviders } = model;
assert.equal(model.wildlifeReviewedAt, '2026-10-29');
assert.deepEqual(wildlifeDistanceGroups.map(group => [group.metres, group.species]), [[100, ['Bears', 'Wolves', 'Cougars', 'Coyotes']], [30, ['Deer', 'Elk', 'Sheep', 'Moose']]]);
assert.equal(wildlifeContacts.emergency.phone, '911');
assert.equal(wildlifeContacts.backcountryEmergency.phone, '403-762-4506');
assert.equal(wildlifeContacts.wildlifeReport.phone, '403-762-1470');
assert.match(wildlifeContacts.backcountryEmergency.label, /satellite/);
assert.match(wildlifeContacts.wildlifeReport.note, /once you are safe/);
assert.equal(wildlifeSeasons.length, 6);
assert.deepEqual(wildlifeSeasons.flatMap(season => season.months).sort((a, b) => a - b), Array.from({ length: 12 }, (_, i) => i + 1));
for (let month = 1; month <= 12; month++) {
  assert.ok(getWildlifeSeason(month)?.months.includes(month));
  assert.equal(getWildlifeSeason(String(month)), getWildlifeSeason(month));
}
for (const value of [null, undefined, '', 'all', '01', '1.0', '1x', '<script>', {}, [], 0, -1, 13, 1.1, NaN, Infinity]) assert.equal(getWildlifeSeason(value), null);
for (const season of wildlifeSeasons) {
  assert.ok(season.summary && season.preparation.length >= 3);
  for (const key of season.sourceKeys) assert.ok(wildlifeSources[key]);
  assert.ok(!/latitude|longitude|lat|lng|probability|sightings/.test(Object.keys(season).join(' ')));
}
let combinations = 0;
for (const mode of ['air', 'road', 'roam', 'other']) for (const arrangement of ['rent', 'buy', 'unsure']) {
  const advice = getBearSprayTravelAdvice(mode, arrangement);
  assert.ok(advice?.title && advice.text && advice.preparation && new URL(advice.source).protocol === 'https:');
  if (mode === 'air') assert.match(advice.text, /prohibited in both carry-on and checked baggage/);
  if (mode === 'roam') assert.match(advice.text, /inside your bag for the whole ride/);
  if (arrangement === 'rent') assert.match(advice.preparation, /return hours/);
  if (arrangement === 'unsure') assert.match(advice.preparation, /no universal number of days/);
  combinations++;
}
for (const value of [null, undefined, 1, '', 'plane', 'AIR', {}, { toString() { throw Error('Do not coerce arbitrary input'); } }]) {
  assert.equal(getBearSprayTravelAdvice(value, 'rent'), null);
  assert.equal(getBearSprayTravelAdvice('air', value), null);
}
for (const url of Object.values(wildlifeSources)) assert.equal(new URL(url).protocol, 'https:');
assert.equal(bearSprayProviders.length, 3);
assert.ok(bearSprayProviders.every(provider => provider.location.endsWith('Banff') && provider.offer && provider.terms));
assert.match(bearSprayProviders.find(provider => provider.name === 'Ultimate Sports').terms, /ID, a credit card and a signed waiver/);

const paths = ['src/pages/wildlife-safety.astro', 'src/pages/wildlife-calendar.astro', 'src/pages/bear-spray.astro'];
const pages = await Promise.all(paths.map(path => readFile(path, 'utf8')));
for (let index = 0; index < pages.length; index++) {
  const page = pages[index];
  const transformed = await transformAstro(page, { filename: paths[index] });
  assert.deepEqual(transformed.diagnostics.filter(diagnostic => diagnostic.severity === 1), [], paths[index]);
  assert.ok(page.includes('lastUpdated={wildlifeReviewedAt}') && page.includes('faq.question') && page.includes('faq.answer') && page.includes('JSON.stringify(faqSchema)'));
  assert.ok(!/<main\b/.test(page), 'BaseLayout already owns the main landmark.');
  assert.ok(!/innerHTML|insertAdjacentHTML|92%|50\+? metres|ships anywhere|play dead.*grizzly|GPS sightings|realtime sightings|setInterval/.test(page), 'Retired unsafe claims/insertion must not return.');
  assert.ok(!page.includes('images.unsplash.com'), 'Do not present unverified stock wildlife as local photographs.');
  for (const [, href] of page.matchAll(/href="(\/[^"#?]*)"/g)) {
    try { await access(`src/pages${href}.astro`); } catch { await access(`src/pages${href}/index.astro`); }
  }
}
for (const name of ['wildlifeSafetyFaqs', 'wildlifeCalendarFaqs', 'bearSprayFaqs']) {
  assert.ok(model[name].length >= 3);
  for (const faq of model[name]) assert.ok(faq.question && faq.answer);
}
assert.ok(pages[1].includes('wildlifeSeasons.map') && pages[1].includes('season.preparation.map'));
assert.ok(!/<article[^>]*data-season[^>]*\bhidden/.test(pages[1]), 'All six model-driven cards start visible without JavaScript.');
assert.ok(/<form[^>]*id="wildlife-month-filter"[^>]*hidden/.test(pages[1]));
assert.ok(/<form[^>]*id="spray-planner"[^>]*hidden/.test(pages[2]));
assert.ok(pages[2].includes('bearSprayProviders.map') && pages[2].includes('The full transport advice is below'));
assert.ok(pages[2].includes('tag=banffbound-20') && pages[2].includes('rel="noopener noreferrer sponsored"') && pages[2].includes('affiliate link'));
assert.ok(!/amazon[^\n]*(?:frontiersman|sab[e]?r[e]? bear spray)/i.test(pages[2]));
assert.ok(pages[2].includes('1-844-764-7669') && pages[2].includes('403-762-1240') && pages[2].includes('visitor drop-off terms'));

async function harness(page, kind, url = 'https://banffbound.com/wildlife-calendar') {
  const script = page.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, `Actual ${kind} script exists.`);
  const code = (await transformJS(script.replace(/^\s*import .*$/gm, ''), { loader: 'ts', target: 'es2020' })).code;
  const elements = new Map();
  const labels = ['All months', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const element = id => {
    if (!elements.has(id)) elements.set(id, {
      dataset: {}, hidden: id === '#wildlife-month-filter' || id === '#spray-planner', value: id === '#wildlife-month' ? 'all' : id === '#spray-transport' ? 'air' : id === '#spray-arrangement' ? 'unsure' : '',
      textContent: '', listeners: {}, href: '',
      get selectedOptions() { return [{ textContent: labels[this.value === 'all' ? 0 : Number(this.value)] }]; },
      addEventListener(event, listener) { (this.listeners[event] ??= []).push(listener); },
      removeAttribute(attribute) { if (attribute === 'href') this.href = ''; },
    });
    return elements.get(id);
  };
  const cards = wildlifeSeasons.map(season => ({ hidden: false, dataset: { season: season.id } }));
  const listeners = {};
  const document = { querySelector: element, querySelectorAll() { return cards; }, addEventListener(event, listener) { (listeners[event] ??= []).push(listener); } };
  vm.runInNewContext(code, { getWildlifeSeason, getBearSprayTravelAdvice, URL, window: { location: { href: url } }, document });
  const fire = (id, event) => { for (const listener of element(id).listeners[event] ?? []) listener({ preventDefault() {} }); };
  return { element, cards, fire, again() { for (const listener of listeners['astro:page-load'] ?? []) listener(); } };
}
const calendar = await harness(pages[1], 'calendar');
assert.equal(calendar.element('#wildlife-month-filter').hidden, false);
assert.equal(calendar.cards.filter(card => !card.hidden).length, 6);
for (let month = 1; month <= 12; month++) {
  calendar.element('#wildlife-month').value = String(month); calendar.fire('#wildlife-month', 'change');
  const shown = calendar.cards.filter(card => !card.hidden);
  assert.equal(shown.length, 1);
  assert.equal(shown[0].dataset.season, getWildlifeSeason(month).id);
  assert.match(calendar.element('#wildlife-month-count').textContent, /1 seasonal card shown/);
}
calendar.fire('#wildlife-month-filter', 'reset');
assert.equal(calendar.element('#wildlife-month').value, 'all');
assert.equal(calendar.cards.filter(card => !card.hidden).length, 6);
calendar.element('#wildlife-month').value = '<img src=x>'; calendar.fire('#wildlife-month', 'change');
assert.equal(calendar.element('#wildlife-month').value, 'all');
calendar.again(); assert.equal(calendar.element('#wildlife-month').listeners.change.length, 1, 'Repeat Astro init must not double-bind.');
const restored = await harness(pages[1], 'calendar', 'https://banffbound.com/wildlife-calendar?month=5');
assert.equal(restored.element('#wildlife-month').value, '5');
assert.equal(restored.cards.find(card => !card.hidden).dataset.season, 'calving');
for (const invalid of ['13', '01', '%3Cscript%3E', 'all']) {
  const invalidRestore = await harness(pages[1], 'calendar', `https://banffbound.com/wildlife-calendar?month=${invalid}`);
  assert.equal(invalidRestore.cards.filter(card => !card.hidden).length, 6);
}
const spray = await harness(pages[2], 'spray');
assert.equal(spray.element('#spray-planner').hidden, false);
assert.match(spray.element('#spray-result-travel').textContent, /prohibited in both carry-on and checked baggage/);
spray.element('#spray-transport').value = 'roam'; spray.element('#spray-arrangement').value = 'rent'; spray.fire('#spray-planner', 'change');
assert.match(spray.element('#spray-result-travel').textContent, /inside your bag for the whole ride/);
assert.equal(spray.element('#spray-result-source').href, wildlifeSources.roam);
assert.match(spray.element('#spray-result-preparation').textContent, /return hours/);
spray.element('#spray-transport').value = 'road'; spray.fire('#spray-planner', 'change');
assert.match(spray.element('#spray-result-travel').textContent, /trunk or a sealed container/);
assert.ok(!spray.element('#spray-result-travel').textContent.includes('Roam'));
spray.element('#spray-transport').value = '<script>'; spray.fire('#spray-planner', 'change');
assert.equal(spray.element('#spray-result-source').hidden, true);
assert.equal(spray.element('#spray-result-source').href, '');
assert.ok(!spray.element('#spray-result-travel').textContent.includes('<script>'));
spray.fire('#spray-planner', 'reset');
assert.equal(spray.element('#spray-transport').value, 'air');
assert.equal(spray.element('#spray-arrangement').value, 'unsure');
assert.equal(spray.element('#spray-result-source').hidden, false);
assert.match(spray.element('#spray-result-travel').textContent, /prohibited/);
spray.again(); assert.equal(spray.element('#spray-planner').listeners.change.length, 1);
console.log(`Wildlife safety checks passed: 3 Astro pages, 12 months, ${combinations} logistics combinations, contact/distance/source/FAQ/affiliate contracts and actual-client filters, URL restore, reset, invalid recovery and repeat init. No site build or network.`);
