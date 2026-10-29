import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import vm from 'node:vm';
import { build, transform as transformJS } from 'esbuild';
import { transform as transformAstro } from '@astrojs/compiler';

// Offline model, generated article and actual progressive client. No site build/network.
const { outputFiles } = await build({ stdin: { contents: "export * from './src/data/cabinPlanning.ts'; export * from './src/data/cabinGuideOverrides.ts'; export {directoryHotels} from './src/data/hotelDirectory.ts'; export {banffHotelLandingOffers} from './src/data/banffHotelLanding.ts'; export {lakeLouiseStayChoices} from './src/data/lakeLouiseLanding.ts'; export {allBlogPosts} from './src/data/blogPosts.ts';", resolveDir: process.cwd() }, bundle: true, write: false, platform: 'node', format: 'esm' });
const data = await import('data:text/javascript;base64,' + Buffer.from(outputFiles[0].text).toString('base64'));
const { cabinExamples: examples, cabinFilterOptions: options, normaliseCabinFilters: normalise, compareCabinStays: compare } = data;
const slug = 'banff-cabin-rentals';
const ids = ['tunnel-mountain-cabin', 'castle-deluxe-chalet', 'baker-family-cabin', 'paradise-wilson-cabin', 'storm-log-cabin', 'cathedral-cabin'];
const defaults = { base: 'all', season: 'all', kitchen: 'all' };
assert.equal(data.cabinReviewedAt, '2026-10-29');
assert.deepEqual(examples.map(example => example.id), ids);
assert.equal(new Set(examples.map(example => example.propertySlug)).size, 6);
assert.deepEqual(compare({}).selectedIds, ids);
assert.deepEqual(compare({ season: 'summer' }).selectedIds, ids);
assert.deepEqual(compare({ season: 'winter' }).selectedIds, ['tunnel-mountain-cabin', 'castle-deluxe-chalet', 'baker-family-cabin', 'storm-log-cabin']);
assert.deepEqual(compare({ kitchen: 'full' }).selectedIds, ['tunnel-mountain-cabin', 'castle-deluxe-chalet']);
assert.deepEqual(compare({ kitchen: 'light' }).selectedIds, ['baker-family-cabin', 'paradise-wilson-cabin']);
assert.deepEqual(compare({ kitchen: 'dining' }).selectedIds, ['storm-log-cabin', 'cathedral-cabin']);
assert.deepEqual(compare({ kitchen: 'light', season: 'winter' }).selectedIds, ['baker-family-cabin']);
assert.deepEqual(compare({ base: 'banff', kitchen: 'dining' }).selectedIds, []);
assert.match(compare({ base: 'banff', kitchen: 'dining' }).notes.join(' '), /does not mean rooms are sold out/);
assert.deepEqual(compare({ base: 'castle' }).selectedIds, ['castle-deluxe-chalet', 'storm-log-cabin']);
assert.deepEqual(compare({ base: 'yoho', season: 'winter' }).selectedIds, []);
for (const raw of [null, undefined, [], 'winter', 1, true]) assert.deepEqual(normalise(raw), defaults);
for (const raw of [{ base: '<script>', season: 'open-2027', kitchen: 'guaranteed' }, { base: ['banff'], season: {}, kitchen: true }]) assert.deepEqual(normalise(raw), defaults);
assert.deepEqual(normalise({ base: 'louise', season: 'winter', kitchen: 'light', price: '0' }), { base: 'louise', season: 'winter', kitchen: 'light' });
let combinations = 0;
for (const [base] of options.base) for (const [season] of options.season) for (const [kitchen] of options.kitchen) {
  const result = compare({ base, season, kitchen });
  assert.deepEqual(result.filters, { base, season, kitchen });
  assert.ok(result.notes.length >= 1 && result.notes.every(note => typeof note === 'string'));
  assert.ok(result.selectedIds.every(id => ids.includes(id)));
  if (season === 'winter') assert.ok(!result.selectedIds.some(id => id === 'paradise-wilson-cabin' || id === 'cathedral-cabin'));
  if (base !== 'all' && base !== 'banff') assert.match(result.notes.join(' '), /No town, lake or resort shuttle is assumed/);
  combinations++;
}
const paradise = examples.find(example => example.id === 'paradise-wilson-cabin');
assert.match(paradise.seasonNote, /winter offering is suites/);
assert.match(paradise.seasonNote, /whole property is not described as winter-closed/);
assert.match(examples.find(example => example.id === 'storm-log-cabin').cooking, /prohibits indoor and outdoor cooking/);
assert.equal(examples.find(example => example.id === 'cathedral-cabin').base, 'yoho');
assert.match(examples.find(example => example.id === 'cathedral-cabin').journey, /British Columbia/);

const merchantIds = { 'tunnel-mountain-resort': '16324', 'baker-creek-by-basecamp': '7710611', 'paradise-lodge-bungalows': '7829397' };
const html = data.cabinGuideOverrides[slug];
assert.deepEqual(Object.keys(data.cabinGuideOverrides), [slug]);
assert.deepEqual(Object.keys(data.cabinGuideMetadata), [slug]);
const metadata = data.cabinGuideMetadata[slug];
assert.equal(metadata.lastUpdated, data.cabinReviewedAt);
assert.equal(metadata.imageIsIllustrative, true); assert.match(metadata.imageNote, /not a verified view/);
assert.equal(metadata.date, undefined, 'Do not replace original publication with a source-review date.');
assert.ok(!/price|cheap|guaranteed/i.test(metadata.title));
const decode = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const cards = [...html.matchAll(/<article\b([^>]*data-cabin-id="([^"]+)"[^>]*)>([\s\S]*?)<\/article>/g)];
assert.equal(cards.length, 6);
assert.deepEqual(cards.map(card => card[2]), ids);
assert.ok(cards.every(card => !/\bhidden(?:=|\s|$)/.test(card[1])), 'Every complete example is present and visible in SSR.');
let affiliateCount = 0, directCount = 0;
for (const example of examples) {
  const hotel = data.directoryHotels.find(hotel => hotel.slug === example.propertySlug);
  assert.equal(hotel?.sourceStatus, 'reviewed', 'Existing reviewed property profile: ' + example.propertySlug);
  assert.match(hotel.checkedOn || '', /^\d{4}-\d{2}-\d{2}$/);
  assert.match(hotel.photoNote, /source-reviewed gallery/);
  const card = cards.find(card => card[2] === example.id)[3];
  const image = card.match(/<img\b([^>]+)>/)[1];
  assert.equal(decode(image.match(/src="([^"]+)"/)[1]), hotel.image, 'Reuse the exact reviewed profile image.');
  assert.equal(decode(image.match(/alt="([^"]+)"/)[1]), `Property gallery photograph for ${hotel.name}`);
  assert.ok(card.includes('pictured category is not a booking inclusion'));
  assert.ok(card.includes(`/hotel-directory/${example.propertySlug}/`));
  const bookingTag = card.match(/<a\b[^>]*class="cabin-book"[^>]*>/)[0];
  assert.equal(decode(bookingTag.match(/href="([^"]+)"/)[1]), example.bookingHref);
  assert.match(bookingTag, /target="_blank"/); assert.match(bookingTag, /noopener/); assert.match(bookingTag, /noreferrer/);
  const booking = new URL(example.bookingHref);
  assert.equal(booking.protocol, 'https:');
  if (example.affiliate) {
    affiliateCount++;
    assert.equal(booking.origin, 'https://www.expedia.ca');
    assert.equal(booking.searchParams.get('camref'), '1101l3MtWX');
    assert.deepEqual([...booking.searchParams.keys()], ['camref']);
    assert.match(booking.pathname, new RegExp(`\\.h${merchantIds[example.propertySlug]}\\.Hotel-Information$`));
    const prior = [...data.banffHotelLandingOffers, ...data.lakeLouiseStayChoices].find(offer => offer.slug === example.propertySlug);
    assert.ok(prior, 'Current Banff/Louise landing merchant identity must exist.');
    assert.equal(example.bookingHref, prior.expediaUrl, 'Reuse the current reviewed merchant destination exactly.');
    assert.match(bookingTag, /sponsored/); assert.ok(card.includes('Affiliate link'));
    assert.ok(html.indexOf('class="cabin-disclosure"') < html.indexOf(example.bookingHref.replace(/&/g, '&amp;')), 'Disclosure precedes merchant CTA.');
  } else {
    directCount++; assert.ok(!/expedia|camref|partner_id|tag=/.test(example.bookingHref));
    assert.ok(example.sources.some(([, url]) => url === example.bookingHref));
    assert.ok(!bookingTag.includes('sponsored')); assert.ok(card.includes('Direct operator information'));
  }
  assert.ok(example.sources.length >= 2);
  for (const [, source] of example.sources) { assert.equal(new URL(source).protocol, 'https:'); assert.ok(card.includes(`href="${source}"`)); }
  for (const forbidden of ['price', 'rating', 'available', 'distanceToLifts', 'currentStatus']) assert.equal(example[forbidden], undefined);
}
assert.equal(affiliateCount, 3); assert.equal(directCount, 3);
for (const key of ['base', 'season', 'kitchen']) {
  const select = html.match(new RegExp(`<select id="cabin-${key}"[^>]*>([\\s\\S]*?)<\\/select>`))?.[1]; assert.ok(select);
  assert.deepEqual([...select.matchAll(/<option value="([^"]+)">/g)].map(option => option[1]), options[key].map(option => option[0]));
  assert.match(html, new RegExp(`<label for="cabin-${key}">`));
}
assert.match(html, /<form id="cabin-fit-form" hidden>/);
assert.match(html, /id="cabin-fit-count" role="status" aria-live="polite"/);
assert.match(html, /id="cabin-fit-empty" hidden/); assert.ok(html.includes('All six examples are shown without JavaScript'));
assert.ok(!/<iframe|AggregateRating|priceRange|ratingValue/.test(html));
const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const visibleFaqs = [...html.matchAll(/<details><summary>([^<]+)<\/summary><p>([\s\S]*?)<\/p><\/details>/g)].map(([, question, answer]) => ({ question: decode(question), answer: decode(answer) }));
assert.equal(visibleFaqs.length, 5); assert.deepEqual(visibleFaqs, data.cabinGuideFaqs);
assert.equal(schema['@type'], 'FAQPage'); assert.deepEqual(schema.mainEntity.map(faq => ({ question: faq.name, answer: faq.acceptedAnswer.text })), visibleFaqs);
for (const [, href] of html.matchAll(/href="(\/[^"#?]*)"/g)) {
  if (/^\/(towns|hotel-directory)\//.test(href)) continue;
  const route = href.replace(/\/$/, '');
  try { await access('src/pages' + route + '.astro'); } catch { await access('src/pages' + route + '/index.astro'); }
}

const componentPath = 'src/components/CabinGuideInteractions.astro';
const component = await readFile(componentPath, 'utf8');
for (const [filename, source] of [[componentPath, component], ['cabin-guide-fragment.astro', html]]) {
  const transformed = await transformAstro(source, { filename });
  assert.deepEqual(transformed.diagnostics.filter(diagnostic => diagnostic.severity === 1), []);
}
assert.ok(component.includes('.cabin-comparison [hidden]{display:none!important}'));
assert.ok(!/innerHTML|insertAdjacentHTML|localStorage|sessionStorage|<iframe/.test(component));
const source = component.match(/<script>([\s\S]*?)<\/script>/)[1];
const client = (await transformJS(source.replace(/^\s*import .*$/gm, ''), { loader: 'ts', target: 'es2022' })).code;
function harness(href = 'https://banffbound.com/blog/banff-cabin-rentals/?utm_source=google&gclid=keep-native-context#cabin-comparison', settings = {}) {
  const nodes = new Map(), events = {};
  function node(selector) {
    if (!nodes.has(selector)) nodes.set(selector, { value: /^#cabin-(base|season|kitchen)$/.test(selector) ? 'all' : '', hidden: selector === '#cabin-fit-form' || selector === '#cabin-fit-empty', dataset: {}, textContent: '', children: [], listeners: {},
      addEventListener(type, callback) { (this.listeners[type] ??= []).push(callback); }, replaceChildren(...children) { this.children = children; },
    });
    return nodes.get(selector);
  }
  const cards = ids.map(id => ({ dataset: { cabinId: id }, hidden: false }));
  const location = { href };
  const window = { location, history: { replaceState(_state, _title, next) { if (settings.blockHistory) throw Error('History blocked'); location.href = String(next); } } };
  const document = { querySelector: selector => settings.missing === selector ? null : node(selector), querySelectorAll: () => cards, createElement: () => ({ textContent: '' }), addEventListener(type, callback) { (events[type] ??= []).push(callback); } };
  vm.runInNewContext(client, { document, window, URL, Array, Set, Object, compareCabinStays: compare });
  return { node, cards, location, visible: () => cards.filter(card => !card.hidden).map(card => card.dataset.cabinId), fire(type) {
    for (const callback of node('#cabin-fit-form').listeners[type] ?? []) callback({ preventDefault() {} });
    // Native reset's default action runs after reset listeners. SSR's first options are all.
    if (type === 'reset') for (const key of ['base', 'season', 'kitchen']) node('#cabin-' + key).value = 'all';
  }, again() { for (const callback of events['astro:page-load'] ?? []) callback(); } };
}
const main = harness(); assert.equal(main.node('#cabin-fit-form').hidden, false); assert.equal(main.visible().length, 6);
main.node('#cabin-season').value = 'winter'; main.fire('change'); assert.deepEqual(main.visible(), compare({ season: 'winter' }).selectedIds);
assert.match(main.node('#cabin-fit-count').textContent, /^4 cabin-category examples/);
main.node('#cabin-base').value = 'banff'; main.node('#cabin-kitchen').value = 'dining'; main.fire('submit');
assert.equal(main.visible().length, 0); assert.equal(main.node('#cabin-fit-empty').hidden, false);
assert.ok(main.node('#cabin-fit-notes').children.some(note => note.textContent.includes('does not mean rooms are sold out')));
main.fire('reset'); assert.deepEqual(main.visible(), ids); assert.equal(main.node('#cabin-fit-empty').hidden, true);
const resetUrl = new URL(main.location.href); assert.equal(resetUrl.searchParams.get('utm_source'), 'google'); assert.equal(resetUrl.searchParams.get('gclid'), 'keep-native-context'); assert.equal(resetUrl.hash, '#cabin-comparison');
assert.equal([...resetUrl.searchParams.keys()].filter(key => key.startsWith('cabin_')).length, 0);
main.again(); main.again(); for (const type of ['change', 'reset', 'submit']) assert.equal(main.node('#cabin-fit-form').listeners[type].length, 1);
main.node('#cabin-kitchen').value = 'light'; main.fire('change'); assert.deepEqual(main.visible(), ['baker-family-cabin', 'paradise-wilson-cabin']);
assert.equal(new URL(main.location.href).searchParams.get('cabin_kitchen'), 'light');
const restored = harness('https://banffbound.com/blog/banff-cabin-rentals/?cabin_base=louise&cabin_season=winter&cabin_kitchen=light&msclkid=keep#stay');
assert.deepEqual(restored.visible(), ['baker-family-cabin']); assert.equal(restored.node('#cabin-base').value, 'louise');
assert.equal(new URL(restored.location.href).searchParams.get('msclkid'), 'keep'); assert.equal(new URL(restored.location.href).hash, '#stay');
for (const query of ['cabin_base=%3Cscript%3E&cabin_season=2027&cabin_kitchen=free', 'cabin_base=banff&cabin_base=yoho', 'cabin_season=winter&cabin_season=summer', 'cabin_kitchen=full&cabin_kitchen=dining']) {
  const invalid = harness('https://banffbound.com/blog/banff-cabin-rentals/?' + query);
  assert.deepEqual(invalid.visible(), ids, 'Malformed or duplicate dimensions default safely to all.');
  assert.ok(!invalid.node('#cabin-fit-count').textContent.includes('<script>'));
  for (const key of ['cabin_base', 'cabin_season', 'cabin_kitchen']) assert.equal(new URL(invalid.location.href).searchParams.getAll(key).length, 0);
}
const partialDuplicate = harness('https://banffbound.com/blog/banff-cabin-rentals/?cabin_base=banff&cabin_base=yoho&cabin_season=winter');
assert.deepEqual(partialDuplicate.visible(), compare({ season: 'winter' }).selectedIds, 'Ignore ambiguous dimension while keeping an independently valid choice.');
const blocked = harness('https://banffbound.com/blog/banff-cabin-rentals/?utm_campaign=preserve#stay', { blockHistory: true });
blocked.node('#cabin-kitchen').value = 'full'; blocked.fire('change'); assert.deepEqual(blocked.visible(), ['tunnel-mountain-cabin', 'castle-deluxe-chalet']);
blocked.node('#cabin-base').value = 'yoho'; blocked.fire('change'); assert.equal(blocked.visible().length, 0); blocked.fire('reset'); assert.equal(blocked.visible().length, 6);
assert.equal(blocked.location.href, 'https://banffbound.com/blog/banff-cabin-rentals/?utm_campaign=preserve#stay');
const incomplete = harness(undefined, { missing: '#cabin-kitchen' }); assert.equal(incomplete.node('#cabin-fit-form').hidden, true); assert.equal(incomplete.visible().length, 6);

// Strict integration contract: the conditional component and review/image metadata
// must land with the registry change; the standalone model alone is insufficient.
const page = await readFile('src/pages/blog/[slug].astro', 'utf8');
const registry = await readFile('src/data/blogContentRegistry.ts', 'utf8');
assert.ok(page.includes("import CabinGuideInteractions from '../../components/CabinGuideInteractions.astro'"));
assert.match(page, /post\.slug\s*===\s*['"]banff-cabin-rentals['"]\s*&&\s*<CabinGuideInteractions\s*\/>/);
assert.ok(page.includes('post.imageIsIllustrative') && page.includes('post.imageNote'));
assert.ok(page.includes('imageIsIllustrative={imageIsIllustrative}') && page.includes('imageNote={imageNote}'));
assert.ok(registry.includes('cabinGuideOverrides'));
const integrated = await build({ stdin: { contents: "export {resolveBlogContent,reviewedBlogBodies} from './src/data/blogContentRegistry.ts';", resolveDir: process.cwd() }, bundle: true, write: false, platform: 'node', format: 'esm' });
const integratedData = await import('data:text/javascript;base64,' + Buffer.from(integrated.outputFiles[0].text).toString('base64'));
assert.equal(integratedData.resolveBlogContent(slug), html, 'Actual canonical renderer must use the replacement body.');
assert.equal(integratedData.reviewedBlogBodies[slug], html);
const actualPost = data.allBlogPosts.find(post => post.slug === slug);
assert.equal(actualPost.lastUpdated, metadata.lastUpdated); assert.equal(actualPost.title, metadata.title); assert.equal(actualPost.description, metadata.description);
assert.equal(actualPost.imageIsIllustrative, true); assert.equal(actualPost.imageNote, metadata.imageNote);
console.log(`Cabin planning checks passed: 6 sourced named examples, ${combinations} fit combinations, winter-category distinction, 3 exact prior landing merchant identities + 3 direct CTAs, reviewed photos/profiles, SSR/5 FAQ/schema/Astro, actual-client filters/reset/URL/duplicates/history failure/idempotence and conditional canonical integration. No network or site build.`);
