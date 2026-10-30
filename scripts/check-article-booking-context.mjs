import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
import { build } from 'esbuild';
import { transform as transformAstro } from '@astrojs/compiler';
import { experimental_AstroContainer } from 'astro/container';
import { parseFragment } from 'parse5';

// Fixed helper + real layout/IIFE checks. No fetch, vendor SDK, site build or files written.
const data = await build({ stdin: { contents: "export {getArticleBookingContext} from './src/data/articleBookingContext.ts'; export {authoredBookingGuideSlugs,resolveBlogContent} from './src/data/blogContentRegistry.ts';", resolveDir: process.cwd() }, bundle: true, write: false, platform: 'node', format: 'esm' });
const { getArticleBookingContext: contextFor, authoredBookingGuideSlugs: authored, resolveBlogContent } = await import(`data:text/javascript;base64,${Buffer.from(data.outputFiles[0].text).toString('base64')}`);
const jasper = ['jasper-town', 'jasper-national-park', 'jasper-canada', 'jasper-alberta', 'calgary-to-jasper'];
const bow = ['numtijah-lodge', 'num-ti-jah-lodge'];
const golden = 'golden-bc-day-trip';
const skoki = 'skoki-lodge-guide';
const lakeContexts = ['larch-valley-hike','sentinel-pass-hike','lake-louise-village-guide'];
const canmore = 'canmore-day-trip';
const kananaskis = 'kananaskis-day-trip';
assert.deepEqual([...authored].sort(), [...bow, ...jasper.slice(0, 3), 'new-places-to-eat-in-banff', 'banff-cabin-rentals', 'banff-nightlife-guide', 'banff-live-music', 'drink-deals', 'icefields-parkway-guide', 'banff-to-jasper-drive', 'lake-minnewanka-guide', 'banff-gondola-guide', 'banff-gondola-tickets-guide', 'banff-spring-skiing', 'peyto-lake-guide', 'banff-helicopter-tours', 'kananaskis-heli-tours', golden, 'banff-heli-skiing', skoki, 'banff-trip-cost-budget-guide', 'fall-larch-season-banff', 'banff-in-fall', ...lakeContexts, '7-day-banff-itinerary', 'rainy-day-banff', 'banff-car-rental-tips', canmore, 'where-to-stay-in-banff', 'banff-hostel-guide', 'banff-first-time-tips', 'banff-mobile-connectivity', kananaskis].sort());
assert.equal(new Set(authored).size, 37);
const defaultContext = contextFor(undefined);
assert.deepEqual(defaultContext, {
  hotelLabel: 'Banff', tourLabel: 'Banff',
  hotelHref: 'https://www.expedia.ca/Hotel-Search?destination=Banff%2C%20Alberta&camref=1101l3MtWX',
  tourHref: 'https://www.getyourguide.com/banff-l284/?partner_id=QW960HO&cmp=banffboundblog',
  suppressAutomaticCTA: false,
});
const goldenContext = {
  hotelLabel: 'Golden', tourLabel: 'Golden',
  hotelHref: 'https://www.expedia.ca/Hotel-Search?destination=Golden%2C%20British%20Columbia&camref=1101l3MtWX',
  tourHref: 'https://www.getyourguide.com/s/?q=Golden%2C%20British%20Columbia&partner_id=QW960HO&cmp=banffboundblog',
  suppressAutomaticCTA: true,
};
function expectedContext(slug, curated) {
  if (slug === golden) return goldenContext;
  if (slug === kananaskis) return {hotelLabel:'Kananaskis area',tourLabel:'Kananaskis',hotelHref:'https://www.expedia.ca/Hotel-Search?destination=Kananaskis%2C%20Alberta&camref=1101l3MtWX',tourHref:'https://www.getyourguide.com/s/?q=Kananaskis%2C%20Alberta&partner_id=QW960HO&cmp=banffboundblog',suppressAutomaticCTA:true};
  if (slug === canmore) return {hotelLabel:'Canmore',tourLabel:'Canmore',hotelHref:'https://www.expedia.ca/Hotel-Search?destination=Canmore%2C%20Alberta&camref=1101l3MtWX',tourHref:'https://www.getyourguide.com/s/?q=Canmore%2C%20Alberta&partner_id=QW960HO&cmp=banffboundblog',suppressAutomaticCTA:true};
  if (jasper.includes(slug)) return {hotelLabel:'Jasper',tourLabel:'Jasper',hotelHref:'https://www.expedia.ca/Hotel-Search?destination=Jasper%2C%20Alberta&camref=1101l3MtWX',tourHref:'https://www.getyourguide.com/s/?q=Jasper%2C%20Alberta&partner_id=QW960HO&cmp=banffboundblog',suppressAutomaticCTA:true};
  if (bow.includes(slug) || slug===skoki || lakeContexts.includes(slug)) return {hotelLabel:'Lake Louise area',tourLabel:'Lake Louise',hotelHref:'https://www.expedia.ca/Hotel-Search?destination=Lake%20Louise%2C%20Alberta&camref=1101l3MtWX',tourHref:'https://www.getyourguide.com/s/?q=Lake%20Louise%2C%20Alberta&partner_id=QW960HO&cmp=banffboundblog',suppressAutomaticCTA:true};
  return {...defaultContext,suppressAutomaticCTA:curated===true};
}
for (const slug of [...jasper, ...bow, golden, skoki, ...lakeContexts, canmore, kananaskis, 'banff-heli-skiing', 'ordinary-banff-guide']) for (const curated of [false, true]) {
  const result = contextFor(slug, curated), isJasper = jasper.includes(slug), isBow = bow.includes(slug) || slug===skoki || lakeContexts.includes(slug), isGolden = slug === golden, isCanmore = slug === canmore, isKananaskis = slug === kananaskis;
  assert.deepEqual(result, expectedContext(slug, curated), 'Independent exact native context: ' + slug);
  const hotel = new URL(result.hotelHref), tour = new URL(result.tourHref);
  assert.equal(hotel.origin, 'https://www.expedia.ca'); assert.equal(hotel.pathname, '/Hotel-Search');
  assert.equal(hotel.searchParams.get('destination'), isJasper ? 'Jasper, Alberta' : isBow ? 'Lake Louise, Alberta' : isCanmore ? 'Canmore, Alberta' : isKananaskis ? 'Kananaskis, Alberta' : isGolden ? 'Golden, British Columbia' : 'Banff, Alberta');
  assert.equal(hotel.searchParams.get('camref'), '1101l3MtWX');
  assert.deepEqual([...hotel.searchParams.keys()].sort(), ['camref', 'destination']);
  assert.equal(result.hotelLabel, isJasper ? 'Jasper' : isBow ? 'Lake Louise area' : isCanmore ? 'Canmore' : isKananaskis ? 'Kananaskis area' : isGolden ? 'Golden' : 'Banff');
  assert.equal(result.tourLabel, isJasper ? 'Jasper' : isBow ? 'Lake Louise' : isCanmore ? 'Canmore' : isKananaskis ? 'Kananaskis' : isGolden ? 'Golden' : 'Banff');
  assert.equal(tour.origin, 'https://www.getyourguide.com');
  assert.equal(tour.searchParams.get('partner_id'), 'QW960HO'); assert.equal(tour.searchParams.get('cmp'), 'banffboundblog');
  if (isJasper || isBow || isGolden || isCanmore || isKananaskis) { assert.equal(tour.pathname, '/s/'); assert.equal(tour.searchParams.get('q'), isGolden ? 'Golden, British Columbia' : `${result.tourLabel}, Alberta`); }
  else assert.equal(tour.pathname, '/banff-l284/');
  assert.deepEqual([...tour.searchParams.keys()].sort(), isJasper || isBow || isGolden || isCanmore || isKananaskis ? ['cmp', 'partner_id', 'q'] : ['cmp', 'partner_id']);
  assert.equal(result.suppressAutomaticCTA, curated || isJasper || isBow || isGolden || isCanmore || isKananaskis);
}
const poison = { toString() { throw Error('Reader input must not be coerced into a URL'); } };
for (const slug of [null, undefined, 1, false, Symbol('reader'), poison, [], {}, Object.create(null), '__proto__', 'constructor', 'JASPER-TOWN', 'GOLDEN-BC-DAY-TRIP', 'golden-bc-day-trip ', ' golden-bc-day-trip', 'golden', 'golden-banff', 'golden-bc-day-trip?destination=Golden&gclid=PRIVATE', 'golden-bc-day-trip#book', 'SKOKI-LODGE-GUIDE', 'skoki-lodge-guide ', 'skoki-lodge-guide?destination=Banff', 'KANANASKIS-DAY-TRIP', 'kananaskis-day-trip ', 'kananaskis-day-trip?partner_id=ATTACKER', 'CANMORE-DAY-TRIP', 'canmore-day-trip ', 'canmore-day-trip?gclid=PRIVATE', 'LAKE-LOUISE-VILLAGE-GUIDE', 'lake-louise-village-guide#book', 'LARCH-VALLEY-HIKE', 'larch-valley-hike ', 'sentinel-pass-hike?destination=Banff', 'jasper-town?gclid=PRIVATE&email=private@example.test', 'https://evil.example/?destination=Golden', '<script>PRIVATE</script>']) assert.deepEqual(contextFor(slug), defaultContext);
for (const curated of ['true', 1, poison, null]) assert.equal(contextFor('ordinary-banff-guide', curated).suppressAutomaticCTA, false, 'Only boolean true enables the curated override.');
assert.equal(contextFor(poison, true).suppressAutomaticCTA, true);

const filename = path.resolve('src/layouts/BlogLayout.astro');
const layout = await readFile(filename, 'utf8');
const page = await readFile('src/pages/blog/[slug].astro', 'utf8');
assert.match(layout, /bookingContext = getArticleBookingContext\(slug, curatedBookingLinks\)/);
assert.match(layout, /data-curated-booking=\{bookingContext\.suppressAutomaticCTA \? 'true' : 'false'\}/);
for (const field of ['hotelHref', 'hotelLabel', 'tourHref', 'tourLabel']) assert.ok(layout.includes(`bookingContext.${field}`));
assert.match(page, /curatedBookingLinks=\{authoredBookingGuideSlugs\.includes\(post\.slug\)\}/);
assert.ok(layout.includes('initAffiliateEmbeds()') && layout.includes('data-affiliate-mount hidden'), 'Permission-controlled SDK flow remains separate from native context.');
const compiled = await transformAstro(layout, { filename, internalURL: 'astro/compiler-runtime', resultScopedSlot: true });
assert.deepEqual(compiled.diagnostics.filter(item => item.severity === 1), []);
const compiledPage = await transformAstro(page, { filename: 'src/pages/blog/[slug].astro' });
assert.deepEqual(compiledPage.diagnostics.filter(item => item.severity === 1), []);

// Render the actual BlogLayout template/frontmatter in Astro's container. Unrelated
// outer layout/components/styles are slot-only fixtures. Discard unused legacy
// compiler metadata (not template/frontmatter) for this installed runtime pair.
const renderCode = compiled.code.replace(/,\s*createMetadata as \$\$createMetadata/, '').replace(/export const \$\$metadata =[\s\S]*?\nconst \$\$Astro/, () => 'const $$Astro');
const require = createRequire(import.meta.url);
const renderBundle = await build({ stdin: { contents: renderCode, loader: 'ts', resolveDir: path.dirname(filename) }, bundle: true, write: false, platform: 'node', format: 'esm', plugins: [{ name: 'article-layout-fixtures', setup(builder) {
  builder.onResolve({ filter: /^astro\// }, args => ({ path: pathToFileURL(require.resolve(args.path)).href, external: true }));
  builder.onResolve({ filter: /\?astro&type=style/ }, args => ({ path: args.path, namespace: 'fixture-style' }));
  builder.onLoad({ filter: /.*/, namespace: 'fixture-style' }, () => ({ contents: 'export {};' }));
  builder.onResolve({ filter: /\.astro$/ }, args => ({ path: args.path, namespace: 'fixture-component' }));
  builder.onLoad({ filter: /.*/, namespace: 'fixture-component' }, () => ({ contents: "import {createComponent,render,renderSlot} from 'astro/runtime/server/index.js'; export default createComponent((result,props,slots)=>render`${renderSlot(result,slots.default)}`);" }));
} }] });
const { default: Component } = await import(`data:text/javascript;base64,${Buffer.from(renderBundle.outputFiles[0].text).toString('base64')}`);
const container = await experimental_AstroContainer.create();
const nodes = root => [root, ...(root.childNodes ?? []).flatMap(nodes)];
const attr = (node, name) => node.attrs?.find(attribute => attribute.name === name)?.value;
const text = node => node.nodeName === '#text' ? node.value : (node.childNodes ?? []).map(text).join('');
const hasClass = (node, name) => (attr(node, 'class') ?? '').split(/\s+/).includes(name);
const cases = [...new Set([...jasper, ...bow, ...authored, 'ordinary-banff-guide'])];
const ssrCases = [...cases.map(slug=>({slug,curated:authored.includes(slug)})),{slug:golden,curated:false},{slug:'banff-heli-skiing',curated:false},{slug:skoki,curated:false},...lakeContexts.map(slug=>({slug,curated:false})),{slug:canmore,curated:false},{slug:kananaskis,curated:false}];
const flags = new Map();
for (const {slug,curated} of ssrCases) {
  const expected = expectedContext(slug, curated);
  const authoredBody = curated ? resolveBlogContent(slug) : '<h2>First fixture section</h2><p>Original fixture content</p><h2>Second fixture section</h2>';
  const html = await container.renderToString(Component, { request: new Request(`https://banffbound.com/blog/${slug}/?email=PRIVATE_READER_VALUE&gclid=PRIVATE_CLICK_VALUE&destination=PRIVATE_DESTINATION&q=PRIVATE_TOUR&camref=ATTACKER&partner_id=ATTACKER&cmp=ATTACKER`), props: { title: 'Booking fixture', description: 'Native purpose fixture', date: '2026-10-29', category: 'Guides', image: '/fixture.jpg', readTime: '5 min read', slug, curatedBookingLinks: curated }, slots: { default: authoredBody } });
  const tree = parseFragment(html), all = nodes(tree);
  const body = all.find(node => hasClass(node, 'article-body'));
  assert.ok(body); assert.equal(attr(body, 'data-curated-booking'), String(expected.suppressAutomaticCTA));
  flags.set(slug+'/'+curated, attr(body, 'data-curated-booking'));
  const panels = all.filter(node => hasClass(node, 'affiliate-panel'));
  assert.equal(panels.length, 2);
  for (const [index, panel] of panels.entries()) {
    const links = nodes(panel).filter(node => node.tagName === 'a'); assert.equal(links.length, 1);
    assert.equal(attr(links[0], 'href'), index === 0 ? expected.hotelHref : expected.tourHref);
    assert.ok(text(links[0]).includes(index === 0 ? expected.hotelLabel : expected.tourLabel));
    assert.equal(attr(links[0], 'target'), '_blank'); assert.ok(attr(links[0], 'rel').includes('sponsored'));
    assert.ok(nodes(panel).some(node => attr(node, 'data-affiliate-mount') !== undefined && attr(node, 'hidden') !== undefined));
    assert.ok(nodes(panel).some(node => attr(node, 'data-open-consent') !== undefined));
  }
  if (curated) for (const anchor of nodes(parseFragment(authoredBody)).filter(node => node.tagName === 'a' && (attr(node, 'rel') ?? '').includes('sponsored'))) assert.ok(nodes(body).some(node => node.tagName === 'a' && attr(node, 'href') === attr(anchor, 'href')), `${slug}: authored native affiliate href survives the actual slot render`);
  for (const privateValue of ['PRIVATE_READER_VALUE','PRIVATE_CLICK_VALUE','PRIVATE_DESTINATION','PRIVATE_TOUR','ATTACKER']) assert.ok(!html.includes(privateValue), 'Hostile request/query values are not copied into rendered native fallbacks.');
}
assert.equal(flags.get(kananaskis+'/false'),'true','Kananaskis keeps its regional native context even without authored registration.');
assert.equal(flags.get(canmore+'/false'),'true','Canmore retains local native context without the authored registration.');
assert.equal(flags.get('lake-louise-village-guide/false'),'true','Lake Louise village retains the correct base without the authored registration.');
assert.equal(flags.get(golden+'/false'),'true','Golden suppresses automatic CTAs without relying on authored registration.');
assert.equal(flags.get('banff-heli-skiing/false'),'false','Heli remains a generic two-base article when not curated.');
assert.equal(flags.get('banff-heli-skiing/true'),'true','The explicit authored flag suppresses automatic CTAs for heli.');

const inline = layout.match(/<script is:inline>([\s\S]*?)<\/script>/)?.[1];
assert.ok(inline && inline.includes('body.dataset.curatedBooking'));
function runInline({ flag = 'false', category = 'Guides', missing = false, short = false } = {}) {
  const created = [], inserted = [], appended = [], events = {}, queried = [];
  const hero = { offsetHeight: 500, offsetTop: 100 };
  const body = { dataset: { curatedBooking: flag }, querySelectorAll(selector) {
    assert.notEqual(flag, 'true', 'Suppression returns before heading lookup.'); assert.equal(selector, 'h2');
    const heading = widget => ({ closest(selector) { assert.equal(selector, '.gyg-widget-container'); return widget ? {} : null; }, parentNode: { insertBefore(element, before) { inserted.push({ element, before }); } } });
    return short ? [heading(false)] : [heading(false), heading(false), heading(true)];
  } };
  Object.defineProperty(body.dataset, 'category', { get() { assert.notEqual(flag, 'true', 'Suppression returns before even reading category.'); return category; } });
  const document = { body: { appendChild(element) { appended.push(element); } }, querySelector(selector) { queried.push(selector); return selector === '.article-body' ? missing ? null : body : selector === '.article-hero' ? hero : null; }, createElement(tag) { assert.notEqual(flag, 'true', 'Suppressed context cannot create a DOM node.'); assert.equal(tag, 'div'); const element = { className: '', innerHTML: '', toggles: [], classList: { toggle(name, value) { element.toggles.push([name, value]); } } }; created.push(element); return element; } };
  const window = { scrollY: 0, addEventListener(type, handler) { assert.notEqual(flag, 'true', 'Suppressed context cannot add a sticky listener.'); (events[type] ??= []).push(handler); } };
  Object.defineProperty(window, 'location', { get() { throw Error('CTA script must not read raw reader URL'); } });
  vm.runInNewContext(inline, { document, window });
  return { created, inserted, appended, events, queried, scroll(y) { window.scrollY = y; for (const handler of events.scroll ?? []) handler(); } };
}
for (const [slug, flag] of flags) if (flag === 'true') {
  const suppressed = runInline({ flag });
  assert.equal(suppressed.created.length + suppressed.inserted.length + suppressed.appended.length, 0, `${slug}: actual inline IIFE makes no injected CTA`);
  assert.deepEqual(suppressed.queried, ['.article-body']); assert.equal(Object.keys(suppressed.events).length, 0);
}
for (const [category, heading, firstHref] of [['Guides', 'Plan Your Banff Trip', '/hotel-directory'], ['Hiking', 'Plan Your Hike', '/trails']]) {
  const legacy = runInline({ category });
  assert.equal(legacy.created.length, 2); assert.equal(legacy.inserted.length, 1); assert.equal(legacy.appended.length, 1);
  assert.match(legacy.created[0].innerHTML, new RegExp(heading));
  const links = nodes(parseFragment(legacy.created[0].innerHTML)).filter(node => node.tagName === 'a');
  assert.equal(attr(links[0], 'href'), firstHref);
  const tour = new URL(attr(links[1], 'href')), hotel = new URL(attr(links[2], 'href'));
  assert.equal(tour.searchParams.get('partner_id'), 'QW960HO'); assert.equal(tour.pathname, '/banff-l284/');
  assert.equal(tour.searchParams.get('q'), category === 'Hiking' ? 'hiking' : null);
  assert.equal(hotel.searchParams.get('camref'), '1101l3MtWX'); assert.equal(hotel.searchParams.get('destination'), 'Banff, Alberta');
  assert.equal(legacy.events.scroll.length, 1); legacy.scroll(601); legacy.scroll(601); legacy.scroll(0);
  assert.equal(legacy.created[1].toggles.length, 2); assert.deepEqual(legacy.created[1].toggles.map(toggle => toggle[1]), [true, false]);
}
assert.equal(runInline({ missing: true }).created.length, 0);
assert.equal(runInline({ short: true }).created.length, 0);
console.log(`Article booking context checks passed: fixed Jasper5/Bow2/Golden/Skoki/Lake-hikes/Lake-Louise-village/Canmore/Kananaskis/default destinations and native IDs, hostile input exclusion, authored${authored.length} integration, ${ssrCases.length} actual BlogLayout SSR contexts including uncurated Golden/Skoki/Lake-hikes/village/Canmore/Kananaskis and generic heli, preserved authored links, actual-IIFE early suppression/no DOM injections and retained legacy mid/sticky behavior. No network or site build.`);
