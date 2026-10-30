import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { transform } from '@astrojs/compiler';
import { htmlFacts, htmlElements, schemaNodes, normal } from './verify-cycling-consent-release.mjs';

// Author-only checks: registration/metadata integration is a separate contract.
globalThis.fetch = () => { throw Error('No network in local-base guide checks'); };
const root = fileURLToPath(new URL('../', import.meta.url));
const postSource = await readFile(path.join(root, 'src/data/blogPosts.ts'), 'utf8');
const raw = postSource.match(/const originalBlogPosts:\s*BlogPost\[\]\s*=\s*(\[[\s\S]*?\n\]);/)?.[1]; assert.ok(raw);
const compiled = await build({ stdin: { contents: "export * from './src/data/localBaseGuideOverrides.ts';export {blogContent as legacyContent} from './src/data/blogContent.ts';export {blogRedirects} from './src/data/redirects.mjs';export {towns} from './src/data/towns.ts';export const originalPosts=" + raw + ';', resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent' });
const d = await import('data:text/javascript;base64,' + Buffer.from(compiled.outputFiles[0].text).toString('base64'));
const slugs = ['lake-louise-village-guide', 'canmore-day-trip'];
const publications = { 'lake-louise-village-guide': '2026-01-05', 'canmore-day-trip': '2026-01-28' };
const hotelSearch = 'https://www.expedia.ca/Hotel-Search?destination=Banff%2C+Alberta&camref=1101l3MtWX', activitySearch = 'https://www.getyourguide.com/banff-l284/?partner_id=QW960HO';
const inherited = { 'lake-louise-village-guide': [hotelSearch, activitySearch], 'canmore-day-trip': [hotelSearch] };
const urls = {
  'lake-louise-village-guide': [
    'https://parks.canada.ca/pn-np/ab/banff/visit/les10-top10/louise.aspx',
    'https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise',
    'https://roamtransit.com/schedules-routes/lake-louise-banff-express-route-8x/',
    'https://banffairporter.com/schedule-rates/',
    'https://www.banffjaspercollection.com/brewster-express/schedule/',
    'https://www.banffjaspercollection.com/brewster-express/locations/',
    'https://www.skilouise.com/getting-here/by-shuttle/',
    'https://parks.canada.ca/pn-np/ab/banff/activ/raquette-snowshoeing/lakelouise',
    'https://parks.canada.ca/pn-np/ab/banff/activ/patinage-skating',
    'https://www.chateau-lake-louise.com/activities/ice-skating-on-lake-louise/',
    'https://hihostels.ca/en/hostels/hi-lake-louise',
    'https://www.banfflakelouise.com/business/laggans-mountain-bakery-and-deli',
    'https://www.wmsll.com/',
    'https://www.lakelouisestation.com/contact',
  ],
  'canmore-day-trip': [
    'https://www.canmore.ca/your-community/recreation/trails-and-pathways/walking-trails',
    'https://www.canmore.ca/your-community/parking-transportation-and-roads/parking',
    'https://roamtransit.com/schedules-routes/canmore-banff-regional-route-3/',
    'https://roamtransit.com/schedules-routes/canmore-local-route-12/',
    'https://roamtransit.com/2026-fall-and-winter-schedule-changes/',
    'https://roamtransit.com/about-us/transportation-policies/',
    'https://www.albertaparks.ca/parks/kananaskis/canmore-nordic-centre-pp/',
    'https://www.albertaparks.ca/parks/kananaskis/canmore-nordic-centre-pp/activities/cross-country-skiing/',
    'https://www.albertaparks.ca/parks/kananaskis/canmore-nordic-centre-pp/trail-report/trail-report-cnc/',
    'https://www.albertaparks.ca/parks/kananaskis/kananaskis-country/advisories-public-safety/trail-reports/canmore-and-area/grassi-lakes-upper/',
    'https://www.albertaparks.ca/parks/kananaskis/kananaskis-country/advisories-public-safety/trail-reports/canmore-and-area/grassi-lakes-interpretive/',
    'https://www.alberta.ca/kananaskis-conservation-pass',
    'https://www.canmoremuseum.com/plan-your-visit',
    'https://www.crazyweed.ca/',
    'https://www.irongoat.ca/',
    'https://parks.canada.ca/pn-np/ab/banff/activ/cyclisme-biking/cyclismeroute-roadcycling/heritage-legacy',
  ],
};
const requiredInternal = {
  'lake-louise-village-guide': ['/towns/lake-louise/', '/book/lake-louise-stays/', '/calgary-to-banff/', '/learn-to-ski/#lesson-fit', '/ski-day-planner/', '/lakes/', '/blog/larch-valley-hike/', '/blog/sentinel-pass-hike/', '/trip-cost/'],
  'canmore-day-trip': ['/towns/canmore/', '/towns/canmore/#where-to-stay', '/parking/', '/park-pass/', '/blog/banff-cross-country-skiing/', '/biking/', '/blog/banff-legacy-trail/', '/eat-and-drink/#dining-finder', '/what-to-do-today/', '/packing-list/', '/trip-cost/', '/calgary-to-banff/'],
};
const requirements = {
  'lake-louise-village-guide': {
    'lake-louise-places': ['visitor centre next to the mall at 201 Village Road', 'lakeside stay is not ski-in/ski-out', 'not a ski or sightseeing ticket', 'separate lake'],
    'village-arrival': ['no scheduled Lake Louise service', 'Not every departure reaches Lake Louise', 'winter schedules and pickup locations would be posted shortly', 'dated eastbound/westbound', 'one accessible stage does not establish the whole chain'],
    'village-food': ['small grocery', 'breakfast/lunch service', '203 Village Road', 'renting gear does not establish a suitable route', 'extended renovation closure', 'not a reopened restaurant'],
    'village-winter': ['identify the return stop', 'If the visitor centre is open', 'Summer tea-house or summit destinations are not default winter walks', 'rental shop was closed awaiting the 2026/27 season', 'does not monitor natural ice for safety', 'did not establish an opening day'],
    'village-summer': ['Moraine Lake Road is closed to personal vehicles year-round', '2026 Parks shuttle season ended October 12', 'not a guided hike', 'not walks starting at Samson Mall'],
    'village-stays': ['actual property locations and room categories', 'kitchen', 'last connection', 'No hotel is called the cheapest'],
    'village-return': ['rental return, meal, luggage collection', 'separate Banff stay', 'Banff destination searches, not Lake Louise rooms', 'commission'],
    'village-sources': ['Full guide reviewed October 29, 2026', 'no live weather, road, ice, seat or room feed', 'hero is illustrative'],
  },
  'canmore-day-trip': {
    'canmore-arrival': ['temporary 10th Street stop', 'downtown–Palliser Lane', 'not a winter connection', 'different temporary-stop instructions', 'not free everywhere', 'passenger space is not a guaranteed bicycle space'],
    'canmore-town': ['west boardwalk entrance has stairs', 'not universally step-free', '902B 7th Avenue', '609 8th Street', 'Wednesday–Sunday', 'neither is an automatic every-day bad-weather backup'],
    'canmore-nordic': ['distinct destination', 'classic or skate instruction', 'not suitable for beginner skiers', 'early-season products are not interchangeable', 'fireguard work and affected trails', 'not a blanket statement that the whole park is closed', 'separate ski-trail/facility requirements'],
    'canmore-grassi': ['old road', 'steeper', 'seasonal winter closure because of ice flows', 'Upper page instead carried an icy-conditions warning', 'no winter route approval', 'designated-trail restrictions', "does not establish a later season's service"],
    'canmore-cycling': ['not cleared of snow and ice in winter', 'available racks, fit, vehicle equipment and driver discretion', 'realistic alternative', 'every rider', 'Keep a bike day distinct'],
    'canmore-food': ['1600 Railway Avenue', '703 Benchlands Trail', 'neither address should be described as the same Main Street storefront', 'specific group', 'prices, promotions and current hours with the operators'],
    'canmore-plans': ['A winter town day', 'A booked winter Nordic day', 'A warmer-season outing', 'a kit list does not assess terrain ability'],
    'canmore-stays': ['Kananaskis Way in Canmore is not Kananaskis Village', 'Dead Man\'s Flats and Harvie Heights are separate hamlets', 'not guaranteed to cost less', 'Banff destination search, not Canmore hotel inventory', 'commission'],
    'canmore-sources': ['Full guide reviewed October 29, 2026', 'not live reports', 'hero is illustrative'],
  },
};
const bad = /\$\s*\d|\bCAD\s*\d|\d+\s*[%％]|consistent powder|most affordable hotel|most photographed scene in Canada|mandatory Parks Canada shuttle|(?:all|every) (?:bus|shuttle) (?:goes|continues) to Lake Louise|Airporter (?:runs|offers) a scheduled Lake Louise service|Station Restaurant is open|frozen lake becomes a skating rink|skating is guaranteed|Grassi (?:Lakes|Interpretive) is open (?:all winter|year-round)|Route 12 (?:always|in winter) serves the Nordic Centre|e-bikes? (?:make|makes) (?:it|the trail) accessible to all|bike (?:space|carriage) is guaranteed|Canmore (?:is always cheaper|saves)|\b(?:I|we) (?:visited|stayed|learned|waited|rode)|last time I was here|during my last visit/i;
function validate(slug, body, meta) {
  assert.deepEqual(Object.keys(meta).sort(), ['title','description','lastUpdated','readTime','imageIsIllustrative','imageNote'].sort());
  assert.equal(meta.lastUpdated, '2026-10-29'); assert.equal(meta.imageIsIllustrative, true); assert.match(meta.imageNote, /Illustrative.*not verified/i); assert.ok(meta.description.length > 100); assert.match(meta.readTime, /^\d+ min read$/);
  const html = '<html><head></head><body>' + body + '</body></html>', facts = htmlFacts(html), elements = htmlElements(html), words = facts.text.split(/\s+/).length;
  assert.ok(words >= 1700 && words <= 2500, slug + ': substantive bounded guide ' + words); assert.ok(!bad.test(facts.text), slug + ': no invented cost/visit/fitness/transport/ice/opening claim');
  const headings = elements.filter(node => node.tag === 'h2'); assert.ok(headings.length >= 9);
  for (const [id, markers] of Object.entries(requirements[slug])) {
    const heading = headings.find(node => node.attributes.id === id); assert.ok(heading, 'Real section ' + id);
    const next = headings.find(node => node.start > heading.end), section = normal(html.slice(heading.end, next?.start ?? html.length).replace(/<[^>]*>/g, ' ')).toLowerCase();
    for (const marker of markers) assert.ok(section.includes(marker.toLowerCase()), slug + ': section ' + id + ' needs ' + marker);
  }
  const ids = elements.map(node => node.attributes.id).filter(Boolean); assert.equal(ids.length, new Set(ids).size);
  assert.equal(elements.filter(node => node.tag === 'nav').length, 1); assert.equal(elements.filter(node => node.tag === 'table').length, slug === slugs[0] ? 2 : 1);
  const anchors = elements.filter(node => node.tag === 'a');
  for (const anchor of anchors) {
    const href = anchor.attributes.href; assert.ok(href);
    assert.ok(!anchors.some(parent => parent !== anchor && anchor.start >= parent.openEnd && anchor.end <= parent.innerEnd), 'No nested links');
    if (href.startsWith('#')) assert.ok(ids.includes(href.slice(1)), 'Working jump ' + href);
    else if (!href.startsWith('/')) { assert.equal(new URL(href).protocol, 'https:'); assert.ok([...urls[slug], ...inherited[slug]].includes(href), 'Only exact primary/inherited links: ' + href); assert.equal(anchor.attributes.target, '_blank'); const rel = (anchor.attributes.rel ?? '').split(/\s+/); assert.ok(rel.includes('noopener')); assert.equal(rel.includes('sponsored'), inherited[slug].includes(href)); }
  }
  for (const href of [...urls[slug], ...inherited[slug], ...requiredInternal[slug]]) assert.ok(anchors.some(anchor => anchor.attributes.href === href), 'Useful native route: ' + href);
  assert.deepEqual([...new Set(anchors.filter(anchor => (anchor.attributes.rel ?? '').split(/\s+/).includes('sponsored')).map(anchor => anchor.attributes.href))].sort(), [...inherited[slug]].sort(), 'Exact prior author affiliate URLs; no newly invented offers');
  const schemas = facts.documents.flatMap(doc => schemaNodes(doc, 'FAQPage')); assert.equal(schemas.length, 1); assert.equal(schemas[0].mainEntity.length, 5); assert.equal(facts.details.length, 5);
  d.localBaseGuideFaqs[slug].forEach((faq, i) => { const item = schemas[0].mainEntity[i]; assert.equal(item['@type'], 'Question'); assert.equal(item.acceptedAnswer['@type'], 'Answer'); assert.equal(normal(item.name), normal(faq.question)); assert.equal(normal(item.acceptedAnswer.text), normal(faq.answer)); assert.equal(facts.details[i].question, normal(faq.question)); assert.equal(facts.details[i].answer, normal(faq.answer)); });
  assert.equal(elements.filter(node => node.tag === 'script').length, 1); assert.ok(elements.filter(node => node.tag === 'script').every(node => node.attributes.type === 'application/ld+json' && !node.attributes.src));
  assert.ok(!elements.some(node => ['iframe','form','object','embed'].includes(node.tag)));
  for (const type of ['Article','Product','Offer','AggregateRating']) assert.equal(facts.documents.flatMap(doc => schemaNodes(doc, type)).length, 0);
  return { words, anchors };
}
assert.equal(d.reviewDate, '2026-10-29');
for (const object of [d.localBaseGuideOverrides, d.localBaseGuideMetadata, d.localBaseGuideFaqs, d.localBaseGuideSources]) assert.deepEqual(Object.keys(object).sort(), [...slugs].sort());
const reports = [];
for (const slug of slugs) {
  assert.equal(d.originalPosts.find(post => post.slug === slug)?.date, publications[slug]); assert.ok(!d.blogRedirects[slug]);
  assert.deepEqual([...new Set(htmlFacts('<html><body>' + d.legacyContent[slug] + '</body></html>').links.filter(href => href.startsWith('https:')))].sort(), [...inherited[slug]].sort(), 'Actual prior affiliate set unchanged');
  assert.deepEqual(Object.values(d.localBaseGuideSources[slug]).sort(), [...urls[slug]].sort());
  const body = d.localBaseGuideOverrides[slug], meta = d.localBaseGuideMetadata[slug], result = validate(slug, body, meta);
  const astro = await transform(body, { filename: slug + '.astro' }); assert.deepEqual(astro.diagnostics.filter(item => item.severity === 1), [], 'Actual produced Astro/HTML fragment compiles');
  for (const anchor of result.anchors) {
    if (!anchor.attributes.href.startsWith('/')) continue;
    const url = new URL(anchor.attributes.href, 'https://banffbound.com'), route = url.pathname.replace(/\/$/, '');
    if (route.startsWith('/blog/')) { const name = route.slice(6); assert.ok(d.originalPosts.some(post => post.slug === name), 'Real canonical blog ' + name); assert.ok(!d.blogRedirects[name]); }
    else if (route.startsWith('/towns/')) { assert.ok(d.towns.some(town => town.slug === route.slice(7))); if (url.hash) assert.ok((await readFile(path.join(root, 'src/pages/towns/[slug].astro'), 'utf8')).includes('id="' + url.hash.slice(1) + '"')); }
    else { let file; for (const candidate of [path.join(root, 'src/pages', route + '.astro'), path.join(root, 'src/pages', route, 'index.astro')]) try { await access(candidate); file = candidate; break; } catch {} assert.ok(file, 'Real page route ' + route); if (url.hash) assert.ok((await readFile(file, 'utf8')).includes('id="' + url.hash.slice(1) + '"')); }
  }
  for (const [from, to] of slug === slugs[0] ? [
    ['no scheduled Lake Louise service', 'a scheduled Lake Louise service'], ['extended renovation closure', 'confirmed reopening'], ['closed awaiting the 2026/27 season', 'open throughout the 2026/27 season'], ['Banff destination searches, not Lake Louise rooms', 'verified Lake Louise rooms'],
  ] : [
    ['temporary 10th Street stop', 'permanent 9th Street stop'], ['not a winter connection', 'a guaranteed winter connection'], ['not suitable for beginner skiers', 'suitable for beginner skiers'], ['seasonal winter closure because of ice flows', 'year-round opening'], ['not Canmore hotel inventory', 'verified Canmore hotel inventory'],
  ]) { assert.ok(body.includes(from), 'Negative fixture changes actual body'); assert.throws(() => validate(slug, body.replace(from, to), meta)); }
  for (const [from, to] of [['"@type":"FAQPage"','"@type":"WebPage"'],['camref=1101l3MtWX','camref=wrong']]) assert.throws(() => validate(slug, body.replace(from, to), meta));
  for (const text of ['Rooms start at CAD 180.','Canmore saves 30%.','Bike carriage is guaranteed.','Skating is guaranteed.']) assert.throws(() => validate(slug, body + '<p>' + text + '</p>', meta));
  reports.push(slug + ':' + result.words + 'words');
}
console.log('Local-base guides passed:' + reports.join(', ') + '; two original publications, exact inherited affiliate sets in separate-Banff contexts, 30 primary source routes,10visible/schemaFAQpairs, place/transport/season/closure distinctions, native planner/stay handoffs and actual Astro fragments; material negative regressions. No network, registry expectation, Git, file output or site build.');
