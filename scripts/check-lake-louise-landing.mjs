import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import vm from 'node:vm';
import { build, transform as transformJS } from 'esbuild';
import { transform as transformAstro } from '@astrojs/compiler';

// Local model, template and real client-script checks. No network/site build.
const bundle = await build({ stdin: { contents: "export * from './src/data/lakeLouiseLanding.ts'; export {directoryHotels} from './src/data/hotelDirectory.ts';", resolveDir: process.cwd() }, bundle: true, write: false, platform: 'node', format: 'esm' });
const model = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const { lakeLouiseStayChoices: stays, normaliseLakeLouiseStayFilters: normalise, buildLakeLouiseStayComparison: compare, lakeLouiseStayFaqs: faqs } = model;
const ids = ['fairmont-chateau-lake-louise', 'lake-louise-inn', 'mountaineer-lodge', 'paradise-lodge-bungalows', 'baker-creek-by-basecamp'];
assert.equal(model.lakeLouiseLandingId, 'lake-louise-stays'); assert.equal(model.lakeLouiseLandingReviewedAt, '2026-10-29');
assert.deepEqual(stays.map(stay => stay.slug), ids);
assert.ok(model.directoryHotels.filter(hotel => hotel.sourceStatus === 'reviewed').length >= 49);
for (const stay of stays) {
  const existing = model.directoryHotels.find(hotel => hotel.slug === stay.slug);
  assert.equal(existing?.sourceStatus, 'reviewed'); assert.equal(existing.name, stay.name);
  const url = new URL(stay.expediaUrl);
  assert.equal(url.origin, 'https://www.expedia.ca');
  assert.equal(url.searchParams.get('camref'), '1101l3MtWX');
  assert.deepEqual([...url.searchParams.keys()], ['camref'], 'No invented dates/rooms/rate or campaign modifications.');
  assert.match(url.pathname, new RegExp(`\\.h${stay.merchantPropertyId}\\.Hotel-Information$`));
  assert.equal(stay.merchantEvidence, url.origin + url.pathname);
  assert.ok(stay.fit && stay.roomDecision && stay.tradeoff && stay.journey && stay.seasonNote && stay.comparison);
  assert.equal(stay.image, existing.image, 'Reuse reviewed imagery, not a new unverified property substitute.');
  assert.equal(new URL(stay.officialUrl).protocol, 'https:');
  for (const removed of ['price', 'rating', 'available', 'commission', 'discount', 'cancellation']) assert.equal(stay[removed], undefined);
}
assert.deepEqual(stays.map(stay => stay.merchantPropertyId), ['22503', '74992', '5157510', '7829397', '7710611']);
assert.deepEqual(normalise({ base: '<script>', room: 'full-kitchen-everywhere', season: 'open-2027' }), { base: 'all', room: 'all', season: 'unsure' });
for (const value of [null, undefined, [], 1, '<img src=x>']) assert.deepEqual(normalise(value), { base: 'all', room: 'all', season: 'unsure' });
assert.deepEqual(compare({ room: 'cooking' }).selectedIds, ['lake-louise-inn', 'paradise-lodge-bungalows', 'baker-creek-by-basecamp']);
assert.deepEqual(compare({ room: 'cabin', season: 'winter' }).selectedIds, ['baker-creek-by-basecamp']);
assert.deepEqual(compare({ room: 'cabin', season: 'summer' }).selectedIds, ['paradise-lodge-bungalows', 'baker-creek-by-basecamp']);
assert.deepEqual(compare({ base: 'village' }).selectedIds, ['lake-louise-inn', 'mountaineer-lodge']);
assert.deepEqual(compare({ base: 'lakeshore', room: 'cabin' }).selectedIds, []);
assert.match(compare({ base: 'lakeshore', room: 'cabin' }).notes.join(' '), /does not mean rooms are sold out/);
let combinations = 0;
for (const base of ['all', 'village', 'lakeshore', 'road']) for (const room of ['all', 'cooking', 'cabin']) for (const season of ['unsure', 'winter', 'summer']) {
  const result = compare({ base, room, season });
  assert.ok(result.selectedIds.every(id => ids.includes(id)) && result.notes.length > 0);
  if (season === 'winter' && room === 'cabin') assert.ok(!result.selectedIds.includes('paradise-lodge-bungalows'));
  assert.ok(!result.notes.join(' ').includes('available now'));
  combinations++;
}
const filename = 'src/pages/book/lake-louise-stays.astro';
const page = await readFile(filename, 'utf8');
const transformed = await transformAstro(page, { filename });
assert.deepEqual(transformed.diagnostics.filter(diagnostic => diagnostic.severity === 1), []);
assert.ok(page.includes('PaidLandingLayout') && page.includes('slot="hero-detail"'));
assert.match(stays[0].imageAlt, /^Lake Louise and surrounding mountains/);
assert.ok(page.includes('Pictured: Lake Louise in Fairmont’s official gallery.'));
assert.ok(page.includes('lakeLouiseStayFaqs.map(faq') && page.includes('faq.question') && page.includes('faq.answer'));
assert.equal(faqs.length, 4);
assert.ok(page.includes('data-landing-id={lakeLouiseLandingId}') && page.includes('data-offer-id={stay.slug}'));
assert.equal((page.match(/href=\{stay\.expediaUrl\}/g) ?? []).length, 2, 'Quick table and detailed cards both have native provider CTAs.');
assert.ok(page.includes('rel="noopener noreferrer sponsored"'));
assert.ok(page.indexOf('class="affiliate-disclosure"') < page.indexOf('href={stay.expediaUrl}'), 'Disclosure precedes the first merchant link.');
assert.ok(/<form[^>]*id="louise-fit-form"[^>]*hidden/.test(page));
assert.ok(!/<article[^>]*data-stay-id[^>]*\bhidden/.test(page));
assert.ok(page.includes('work without JavaScript') && page.includes('stay.roomDecision') && page.includes('stay.tradeoff') && page.includes('stay.journey'));
assert.ok(!/innerHTML|insertAdjacentHTML|localStorage|<iframe|<script[^>]*\bsrc=|Best price|free cancellation|guaranteed savings|AggregateRating/.test(page));
for (const [, href] of page.matchAll(/href="(\/[^"#?]*)"/g)) {
  if (href.startsWith('/towns/')) await access('src/pages/towns/[slug].astro');
  else { try { await access(`src/pages${href}.astro`); } catch { await access(`src/pages${href}/index.astro`); } }
}
const script = page.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script);
const code = (await transformJS(script.replace(/^\s*import .*$/gm, ''), { loader: 'ts', target: 'es2022' })).code;
function harness(url = 'https://banffbound.com/book/lake-louise-stays/?utm_source=google&gclid=keep-native-context#compare-stays') {
  const listeners = {}, elements = new Map();
  const initial = { '#louise-base': 'all', '#louise-room': 'all', '#louise-season': 'unsure' };
  const element = id => {
    if (!elements.has(id)) elements.set(id, { value: initial[id] ?? '', hidden: id === '#louise-fit-form' || id === '#louise-fit-empty', dataset: {}, textContent: '', children: [], listeners: {},
      addEventListener(type, handler) { (this.listeners[type] ??= []).push(handler); }, replaceChildren(...children) { this.children = children; },
    });
    return elements.get(id);
  };
  const cards = ids.map(id => ({ dataset: { stayId: id }, hidden: false }));
  const location = { href: url };
  const window = { location, history: { replaceState(_state, _title, next) { location.href = String(next); } } };
  const document = { querySelector: element, querySelectorAll() { return cards; }, createElement() { return { textContent: '' }; }, addEventListener(type, handler) { (listeners[type] ??= []).push(handler); } };
  vm.runInNewContext(code, { document, window, URL, Set, Object, buildLakeLouiseStayComparison: compare, normaliseLakeLouiseStayFilters: normalise });
  return { element, cards, location, fire(type) { for (const handler of element('#louise-fit-form').listeners[type] ?? []) handler({ preventDefault() {} }); }, again() { for (const handler of listeners['astro:page-load'] ?? []) handler(); } };
}
const client = harness();
assert.equal(client.element('#louise-fit-form').hidden, false); assert.equal(client.cards.filter(card => !card.hidden).length, 5);
client.element('#louise-room').value = 'cabin'; client.element('#louise-season').value = 'winter'; client.fire('change');
assert.deepEqual(client.cards.filter(card => !card.hidden).map(card => card.dataset.stayId), ['baker-creek-by-basecamp']);
assert.match(client.element('#louise-fit-count').textContent, /^1 property/);
assert.ok(client.element('#louise-fit-notes').children.some(child => child.textContent.includes('excluded from winter cabin')));
client.element('#louise-base').value = 'lakeshore'; client.fire('change');
assert.equal(client.cards.filter(card => !card.hidden).length, 0); assert.equal(client.element('#louise-fit-empty').hidden, false);
client.fire('reset'); assert.equal(client.cards.filter(card => !card.hidden).length, 5); assert.equal(client.element('#louise-fit-empty').hidden, true);
const resetUrl = new URL(client.location.href); assert.equal(resetUrl.searchParams.get('utm_source'), 'google'); assert.equal(resetUrl.searchParams.get('gclid'), 'keep-native-context'); assert.equal(resetUrl.hash, '#compare-stays');
assert.ok(!resetUrl.searchParams.has('stay_base') && !resetUrl.searchParams.has('stay_room') && !resetUrl.searchParams.has('stay_season'));
client.again(); assert.equal(client.element('#louise-fit-form').listeners.change.length, 1);
const restore = harness('https://banffbound.com/book/lake-louise-stays/?stay_base=village&stay_room=cooking&stay_season=winter');
assert.deepEqual(restore.cards.filter(card => !card.hidden).map(card => card.dataset.stayId), ['lake-louise-inn']);
const launchPlan = JSON.parse(await readFile('research/paid-search-launch-plan-2026-10-29.json', 'utf8'));
const planned = launchPlan.adGroups.find(page => page.id === 'lake-louise-stays');
for (const [key, expected] of Object.entries({ village: ['lake-louise-inn', 'mountaineer-lodge'], cooking: ['lake-louise-inn', 'paradise-lodge-bungalows', 'baker-creek-by-basecamp'], winterCabin: ['baker-creek-by-basecamp'] })) {
  const adClient = harness('https://banffbound.com/book/lake-louise-stays/' + planned.deepLinks[key]);
  assert.deepEqual(adClient.cards.filter(card => !card.hidden).map(card => card.dataset.stayId), expected, `Planned ${key} ad link selects the intended shortlist.`);
}
const invalid = harness('https://banffbound.com/book/lake-louise-stays/?stay_base=%3Cscript%3E&stay_room=live-price&stay_season=2027');
assert.equal(invalid.cards.filter(card => !card.hidden).length, 5);
assert.ok(!invalid.element('#louise-fit-count').textContent.includes('<script>'));
console.log(`Lake Louise landing checks passed: 5 reviewed properties/merchant identities, ${combinations} fit combinations, exact affiliate IDs, FAQ/SSR/native CTA contracts, Astro transform and actual-client filter/reset/URL/context/idempotence. No network or site build.`);
