import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { htmlFacts, htmlElements, schemaNodes, normal } from './verify-cycling-consent-release.mjs';

// Local source/model and in-memory regressions only. No HTTP or site build.
globalThis.fetch = () => { throw new Error('Network is forbidden in this focused check'); };
const root = fileURLToPath(new URL('../', import.meta.url));
const { outputFiles } = await build({ stdin: { contents: "export * from './src/data/parkwayGuideOverrides.ts';export {allBlogPosts} from './src/data/blogPosts.ts';export {blogRedirects} from './src/data/redirects.mjs';export {trails} from './src/data/trails.ts';export {towns} from './src/data/towns.ts';", resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent' });
const data = await import('data:text/javascript;base64,' + Buffer.from(outputFiles[0].text).toString('base64'));
const publications = { 'icefields-parkway-guide': '2026-01-05', 'banff-to-jasper-drive': '2026-02-08' };
const slugs = Object.keys(publications);
const primary = {
  travel: 'https://parks.canada.ca/pn-np/ab/banff/visit/promenadedesglaciers-icefieldsparkway',
  winter: 'https://parks.canada.ca/pn-np/ab/jasper/activ/experience/hiver-winter/pcghiver-ipwinter',
  crossing: 'https://www.thecrossingresort.com/',
  reports: 'https://511.alberta.ca/',
  trails: 'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
  glacier: 'https://parks.canada.ca/pn-np/ab/jasper/activ/itineraires-itineraries/glacier-athabasca',
  water: 'https://parks.canada.ca/pn-np/ab/banff/activ/nautiques-sports',
  opening: 'https://www.banffjaspercollection.com/plan-your-trip/opening-dates/',
  closure: 'https://parks.canada.ca/pn-np/ab/jasper/bulletins/76ecae58-8a63-480c-8304-dc903837eefd',
  roads: 'https://parks.canada.ca/pn-np/ab/jasper/visit/routes-roads',
  recovery: 'https://parks.canada.ca/pn-np/ab/jasper/gestion-management/serviceimmobilier-realty/retablissement-recovery/pc-recovery',
  brewster: 'https://www.banffjaspercollection.com/brewster-express/faqs/',
  sundog: 'https://www.sundogtours.com/package/jasper-lake-louise-banff-calgary',
  lodge: 'https://lodgeatbowlake.com/',
};
const markers = {
  'icefields-parkway-guide': ['choose the stops', 'Highway 1 / Highway 93N junction', '36 km north of the junction', '400 m down', '40 km north of the junction', '72 km north of the junction', '3.8 km one way', '95 m ascent and 20 m descent', '0.6 km one way', '0.3 km from the upper lot', '305 m ascent and 45 m descent', '40 km north of Saskatchewan Crossing or 9 km south of the Icefield Centre', 'where paddling is prohibited', 'crossing the barriers onto the Athabasca Glacier', 'not a calculated arrival guarantee'],
  'banff-to-jasper-drive': ['the transfer and overnight decisions', 'approximately 232 km between Lake Louise and Jasper', 'Banff is farther south', 'Glacier View Lodge closed for the season', 'limited winter season', 'October 2025–April 2026 season', 'actual 2026/27 date', 'May through October', 'no dependable roadside services', 'snowflake or M+S', 'winter recreation in Maligne Canyon is prohibited', 'Edith Cavell Road/area', 'recovery after the 2024 wildfire', 'An old report, an unavailable value or one section’s condition does not establish the whole route.'],
};
const bad = /\$\s*\d|\bCAD\s*\d|\b(?:I|we) (?:visited|stayed|drove|saw)\b|during my last visit|(?:winter tires|snow tires|chains) (?:are )?(?:legally )?required (?:from )?October 1|fuel is available at (?:Saskatchewan )?(?:River )?Crossing in winter|walk onto the Athabasca Glacier|Maligne Canyon is open for winter|complete (?:the|this) (?:drive|journey) in \d|all stops are accessible|no need to check (?:road|weather)|guaranteed (?:arrival|parking|room|view)|(?:free|complimentary) (?:breakfast|cancellation|shuttle)/i;
function validate(slug, body, meta) {
  assert.equal(meta.lastUpdated, '2026-10-29'); assert.equal(meta.imageIsIllustrative, true); assert.match(meta.imageNote, /Illustrative.*not verified/i);
  assert.deepEqual(Object.keys(meta).sort(), ['title','description','lastUpdated','readTime','imageIsIllustrative','imageNote'].sort(), 'Metadata cannot reset publication or add photographic schema identity.');
  assert.ok(meta.title.length > 30 && meta.description.length > 80); assert.match(meta.readTime, /^\d+ min read$/);
  const html = '<html><head></head><body>' + body + '</body></html>', facts = htmlFacts(html), elements = htmlElements(html), text = facts.text;
  const words = text.split(/\s+/).length; assert.ok(words >= 1100 && words <= 2000, `${slug}: substantial bounded guide: ${words}`);
  assert.ok(!bad.test(text), 'No inherited invented visit, service, legal, price, ice or feasibility claim.');
  for (const marker of [...markers[slug], 'October 29, 2026', 'all services are closed for winter', 'April 2027', 'November 1–March 31', 'snow- or ice-covered']) assert.ok(text.includes(marker), slug + ': required distinction ' + marker);
  const ids = elements.map(n => n.attributes.id).filter(Boolean); assert.equal(new Set(ids).size, ids.length);
  assert.ok(elements.filter(n => n.tag === 'h2').length >= 7); assert.ok(elements.some(n => n.tag === 'table')); assert.ok(elements.some(n => n.tag === 'ol'));
  const anchors = elements.filter(n => n.tag === 'a');
  for (const a of anchors) {
    assert.ok(!anchors.some(parent => parent !== a && a.start >= parent.openEnd && a.end <= parent.innerEnd), 'No nested anchor.');
    const href = a.attributes.href; assert.ok(href);
    if (href.startsWith('#')) assert.ok(ids.includes(href.slice(1)), 'Existing in-body jump: ' + href);
    else if (!href.startsWith('/')) {
      const url = new URL(href); assert.equal(url.protocol, 'https:'); assert.ok(['parks.canada.ca','511.alberta.ca','www.thecrossingresort.com','lodgeatbowlake.com','www.banffjaspercollection.com','www.sundogtours.com'].includes(url.hostname), 'Primary source/operator only: ' + href);
      assert.ok(!url.search && !url.hash); assert.equal(a.attributes.target, '_blank'); assert.ok((a.attributes.rel ?? '').split(/\s+/).includes('noopener'));
      assert.ok(!(a.attributes.rel ?? '').split(/\s+/).includes('sponsored'), 'No new external affiliate relationship is invented.');
    }
  }
  for (const href of ['/icefields-parkway-planner/', '/conditions/', `/blog/${slugs.find(s => s !== slug)}/`, ...[primary.travel, primary.winter, primary.crossing, primary.reports, primary.opening]]) assert.ok(anchors.some(a => a.attributes.href === href), 'Native cross-guide/planner/current source handoff: ' + href);
  for (const href of slug === 'icefields-parkway-guide' ? [primary.trails,primary.glacier,primary.water,'/trails/bow-glacier-falls/','/trails/peyto-lake-viewpoint/','/trails/parker-ridge/'] : [primary.closure,primary.roads,primary.recovery,primary.brewster,primary.sundog,primary.lodge,'/blog/jasper-national-park/','/blog/jasper-town/','/blog/num-ti-jah-lodge/','/book/lake-louise-stays/']) assert.ok(anchors.some(a => a.attributes.href === href), 'Purpose-specific sourced journey: ' + href);
  const schemas = facts.documents.flatMap(doc => schemaNodes(doc, 'FAQPage')); assert.equal(schemas.length, 1); assert.equal(schemas[0].mainEntity.length, 5); assert.equal(facts.details.length, 5);
  data.parkwayGuideFaqs[slug].forEach((faq, i) => { const q = schemas[0].mainEntity[i]; assert.equal(q['@type'], 'Question'); assert.equal(q.acceptedAnswer['@type'], 'Answer'); assert.equal(normal(q.name), normal(faq.question)); assert.equal(normal(q.acceptedAnswer.text), normal(faq.answer)); assert.equal(facts.details[i].question, normal(faq.question)); assert.equal(facts.details[i].answer, normal(faq.answer)); });
  assert.ok(elements.filter(n => n.tag === 'script').every(n => n.attributes.type === 'application/ld+json' && !n.attributes.src)); assert.ok(!elements.some(n => ['iframe','embed','object'].includes(n.tag))); assert.equal(facts.documents.flatMap(doc => schemaNodes(doc, 'Article')).length, 0, 'Article schema belongs to the shared layout, with illustrative metadata.');
  return { words, anchors };
}
for (const map of [data.parkwayGuideOverrides,data.parkwayGuideMetadata,data.parkwayGuideFaqs]) assert.deepEqual(Object.keys(map).sort(), [...slugs].sort());
assert.equal(data.reviewDate, '2026-10-29'); assert.equal(new Set(Object.values(data.parkwayGuideMetadata).map(meta => meta.title)).size, 2);
assert.match(data.parkwayGuideMetadata[slugs[0]].title, /Stops: Viewpoints, Walks & Seasonal Choices/); assert.match(data.parkwayGuideMetadata[slugs[1]].title, /Transfers, Overnight Bases & Winter Travel/);
const results = [];
for (const slug of slugs) {
  const body = data.parkwayGuideOverrides[slug], meta = data.parkwayGuideMetadata[slug], result = validate(slug, body, meta); results.push({ slug, words: result.words, faqs: 5 });
  assert.equal(data.allBlogPosts.find(post => post.slug === slug)?.date, publications[slug]); assert.ok(!data.blogRedirects[slug], 'Retained canonical identity.');
  for (const a of result.anchors) { const href = a.attributes.href; if (!href.startsWith('/')) continue; const route = new URL(href, 'https://banffbound.com').pathname.replace(/\/$/, '');
    if (route.startsWith('/blog/')) { assert.ok(data.allBlogPosts.some(post => post.slug === route.slice(6))); assert.ok(!data.blogRedirects[route.slice(6)], 'No retired alias target: ' + href); }
    else if (route.startsWith('/trails/')) assert.ok(data.trails.some(trail => trail.slug === route.slice(8) && trail.routeVerified !== false), 'Reviewed route identity: ' + href);
    else if (route.startsWith('/towns/')) assert.ok(data.towns.some(town => town.slug === route.slice(7)));
    else { let exists = false; for (const file of [path.join(root,'src/pages',route + '.astro'),path.join(root,'src/pages',route,'index.astro')]) try { await access(file); exists = true; } catch {} assert.ok(exists, 'Existing internal page: ' + href); }
  }
  for (const badClaim of ['<p>Fuel is available at Crossing in winter.</p>','<p>Walk onto the Athabasca Glacier.</p>','<p>Maligne Canyon is open for winter.</p>','<p>Complete the drive in 3 hours.</p>','<p>We drove this road last winter.</p>','<p>A room costs $300.</p>']) assert.throws(() => validate(slug,body + badClaim,meta), 'Reject bad claim: ' + badClaim);
  for (const [from,to] of [['November 1–March 31','October 1–April 30'],['all services are closed for winter','all services are open for winter'],[primary.winter,'https://example.com/winter'],['"@type":"FAQPage"','"@type":"Article"']]) assert.throws(() => validate(slug,body.replaceAll(from,to),meta), 'Reject rule/source/FAQ reversal: ' + from);
  assert.throws(() => validate(slug,body,{...meta,date:'2026-10-29'})); assert.throws(() => validate(slug,body,{...meta,imageIsIllustrative:false}));
  assert.throws(() => validate(slug,body.replace('<a ','<a href="/winter/"><a ').replace('</a>','</a></a>'),meta));
}
assert.throws(() => validate(slugs[0],data.parkwayGuideOverrides[slugs[0]].replaceAll('36 km north of the junction','17 km north of the junction'),data.parkwayGuideMetadata[slugs[0]]));
assert.throws(() => validate(slugs[0],data.parkwayGuideOverrides[slugs[0]].replaceAll('where paddling is prohibited','where paddling is permitted'),data.parkwayGuideMetadata[slugs[0]]));
assert.throws(() => validate(slugs[1],data.parkwayGuideOverrides[slugs[1]].replaceAll('winter recreation in Maligne Canyon is prohibited','winter recreation in Maligne Canyon is permitted'),data.parkwayGuideMetadata[slugs[1]]));
const source = await readFile(path.join(root,'src/data/parkwayGuideOverrides.ts'),'utf8'); assert.equal((source.match(/function faqHtml\(/g) ?? []).length, 1); for (const slug of slugs) assert.ok(source.includes(`\${faqHtml('${slug}')}`), 'One renderer consumes the keyed FAQ model.');
const note = await readFile(path.join(root,'research/parkway-guide-sources-2026-10-29.md'),'utf8'); for (const url of Object.values(primary)) assert.ok(note.includes(url), 'Source inventory: ' + url); for (const marker of [...Object.values(publications),'imageIsIllustrative','2026/27','Highway 1 / Highway 93N junction','Lake Louise village','No itinerary feasibility']) assert.ok(note.includes(marker), 'Bounded source/review scope: ' + marker);
console.log('Parkway guide checks passed: ' + JSON.stringify(results) + '. Distinct full guides, retained publication/canonical IDs, source origins, seasonal fuel/tires/transport/closure limits, native internal/operator links, illustrative metadata, keyed FAQ parity and negative regressions. No network, file output or site build.');
