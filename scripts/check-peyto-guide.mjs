import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { parseFragment } from 'parse5';

// Standalone next-batch author check. Root integrates it in a later release;
// this does not import the new body into the current full-review registry.
const postSource = await readFile('src/data/blogPosts.ts', 'utf8');
const originalArray = postSource.match(/const originalBlogPosts: BlogPost\[\] = (\[[\s\S]*?\n\]);/)?.[1];
assert.ok(originalArray, 'Find actual original publication, independently of pending registry imports.');
const { outputFiles } = await build({ stdin: { contents: "export * from './src/data/peytoGuideOverrides.ts'; export {blogRedirects} from './src/data/redirects.mjs'; export {trails} from './src/data/trails.ts'; export {lakePlans} from './src/data/lakePlanning.ts'; export {parkingLots} from './src/data/parkingData.ts'; export {parkwayStops} from './src/data/parkwayPlanning.ts'; export {towns} from './src/data/towns.ts';\nexport const originalPosts = " + originalArray + ';', resolveDir: process.cwd() }, bundle: true, write: false, platform: 'node', format: 'esm' });
const model = await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`);
const slug = 'peyto-lake-guide', html = model.peytoGuideOverrides[slug], metadata = model.peytoGuideMetadata[slug], faqs = model.peytoGuideFaqs;
assert.deepEqual(Object.keys(model.peytoGuideOverrides), [slug]);
assert.deepEqual(Object.keys(model.peytoGuideMetadata), [slug]);
assert.equal(model.reviewDate, '2026-10-29'); assert.equal(metadata.lastUpdated, model.reviewDate);
assert.equal(model.originalPosts.find(post => post.slug === slug)?.date, '2026-02-11', 'Retain actual February11 publication.');
assert.equal(model.blogRedirects[slug], undefined, 'Retain the canonical URL.');
assert.equal(metadata.date, undefined); assert.equal(metadata.datePublished, undefined); assert.equal(metadata.slug, undefined);
assert.equal(metadata.imageIsIllustrative, true); assert.match(metadata.imageNote, /not verified as Peyto Lake.*current road, parking, trail, water or ice conditions/);
assert.match(metadata.title, /Peyto Lake.*Lookout.*Accessible Approach.*Winter Route/);
assert.ok(metadata.description.length >= 110);
assert.ok(Array.isArray(faqs) && faqs.length === 5, 'One FAQ array for the exact canonical guide.');

const errors = [], tree = parseFragment(html, { onParseError: error => errors.push(error.code) });
assert.deepEqual(errors, []);
const nodes = root => [root, ...(root.childNodes ?? []).flatMap(nodes)];
const attr = (node, key) => node.attrs?.find(attribute => attribute.name === key)?.value;
const text = root => root.tagName === 'script' ? '' : root.nodeName === '#text' ? root.value : (root.childNodes ?? []).map(text).join(' ');
const content = root => text(root).replace(/\s+/g, ' ').trim();
const all = nodes(tree), prose = content(tree), details = all.filter(node => node.tagName === 'details');
assert.ok(prose.split(/\s+/).length >= 1300, 'Substantive route, arrival, access, winter and base decisions.');
assert.equal(all.filter(node => node.tagName === 'h1').length, 0);
assert.ok(all.filter(node => node.tagName === 'h2').length >= 9);
assert.equal(all.filter(node => ['iframe', 'form', 'img', 'input', 'button'].includes(node.tagName)).length, 0, 'Complete no-JS article without remote widgets or inert controls.');
const ids = all.map(node => attr(node, 'id')).filter(Boolean); assert.equal(new Set(ids).size, ids.length);
assert.ok(all.some(node => node.tagName === 'nav' && attr(node, 'aria-label') === 'Peyto Lake guide sections'));
const table = all.find(node => node.tagName === 'table');
assert.ok(table && nodes(table).some(node => node.tagName === 'caption'));
const rows = nodes(table).filter(node => node.tagName === 'tr'); assert.equal(rows.length, 5);
assert.ok(all.filter(node => node.tagName === 'th').every(node => ['row', 'col'].includes(attr(node, 'scope'))));
assert.match(content(rows[1]), /Main Peyto Lake Lookout.*0\.6 km one way.*30 m ascent/);
assert.match(content(rows[2]), /Upper-lot barrier-free approach.*0\.3 km from the upper parking lot.*restricted vehicle access/);
assert.match(content(rows[3]), /Bow Summit Viewpoint.*3 km one way from the Peyto parking area.*310 m ascent/);
assert.match(content(rows[4]), /Winter Peyto Lake viewpoint.*separate snowshoe listing: 570 m loop/);

// Actual visible FAQ answers must exactly match their one structured-data model.
const scripts = all.filter(node => node.tagName === 'script'); assert.equal(scripts.length, 1);
assert.equal(attr(scripts[0], 'type'), 'application/ld+json'); assert.equal(attr(scripts[0], 'src'), undefined);
const schema = JSON.parse(scripts[0].childNodes.map(node => node.value ?? '').join(''));
assert.equal(schema['@context'], 'https://schema.org'); assert.equal(schema['@type'], 'FAQPage');
assert.equal(schema.mainEntity.length, faqs.length); assert.equal(details.length, faqs.length);
for (const [index, faq] of faqs.entries()) {
  assert.equal(schema.mainEntity[index]['@type'], 'Question'); assert.equal(schema.mainEntity[index].name, faq.question);
  assert.equal(schema.mainEntity[index].acceptedAnswer['@type'], 'Answer'); assert.equal(schema.mainEntity[index].acceptedAnswer.text, faq.answer);
  assert.equal(content(details[index].childNodes.find(node => node.tagName === 'summary')), faq.question);
  assert.equal(content(details[index].childNodes.find(node => node.tagName === 'p')), faq.answer);
}

const links = all.filter(node => node.tagName === 'a'), hrefs = links.map(node => attr(node, 'href'));
const requiredSources = [
  'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
  'https://parks.canada.ca/pn-np/ab/jasper/activ/itineraires-itineraries/promenadedesglaciers-icefieldsparkway',
  'https://parks.canada.ca/pn-np/ab/banff/activ/raquette-snowshoeing/lakelouise',
  'https://pcweb2.azureedge.net/-/media/pn-np/ab/jasper/WET4/pdf/visit/depliants-brochures/ete-summer/Summer-on-the-Icefields-Parkway-Guide-2022.pdf',
  'https://511.alberta.ca/', 'https://parks.canada.ca/pn-np/ab/banff/bulletins',
  'https://parks.canada.ca/pn-np/ab/jasper/activ/experience/hiver-winter/pcghiver-ipwinter/pcg-securite-safety-ip',
  'https://www.travelalberta.com/listings/peyto-lake-1483',
  'https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise/commerciaux-commercial',
  'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking/etat-sentiers-trail-conditions',
  'https://parks.canada.ca/pn-np/ab/banff/activ/patinage-skating',
];
for (const source of requiredSources) assert.ok(hrefs.includes(source), `Current factual/seasonal decision has a primary handoff: ${source}`);
for (const href of ['/trails/peyto-lake-viewpoint/', '/trails/bow-summit-viewpoint/', '/trails/peyto-lake-shore/', '/parking/', '/icefields-parkway-planner/', '/book/lake-louise-stays/', '/towns/lake-louise/', '/blog/numtijah-lodge/', '/lakes/', '/lake-faq/']) assert.ok(hrefs.includes(href));
let internal = 0;
const postSlugs = new Set(model.originalPosts.map(post => post.slug));
for (const anchor of links) {
  const href = attr(anchor, 'href'); assert.ok(href && content(anchor).length > 3);
  assert.equal(nodes(anchor).filter(node => node.tagName === 'a').length, 1, 'No nested anchor chain.');
  assert.ok(!/<|>|javascript:|data:/i.test(href));
  if (href.startsWith('#')) { assert.ok(ids.includes(href.slice(1)), `Existing section target ${href}`); continue; }
  if (href.startsWith('/')) {
    const parts = href.split('/').filter(Boolean);
    if (parts[0] === 'blog') { assert.ok(postSlugs.has(parts[1]), `Existing blog route ${href}`); assert.equal(model.blogRedirects[parts[1]], undefined); }
    else if (parts[0] === 'trails') { const trail = model.trails.find(record => record.slug === parts[1]); assert.ok(trail && trail.reviewedAt && trail.routeVerified !== false, `Existing reviewed trail ${href}`); await access('src/pages/trails/[slug].astro'); }
    else if (parts[0] === 'towns') { assert.ok(model.towns.some(town => town.slug === parts[1])); await access('src/pages/towns/[slug].astro'); }
    else { const route = href.replace(/\/$/, ''); try { await access(`src/pages${route}.astro`); } catch { await access(`src/pages${route}/index.astro`); } }
    internal++; continue;
  }
  const url = new URL(href); assert.equal(url.protocol, 'https:'); assert.equal(url.search, '');
  assert.equal(attr(anchor, 'target'), '_blank'); assert.ok(attr(anchor, 'rel').split(/\s+/).includes('noopener'));
  assert.ok(['parks.canada.ca', 'pcweb2.azureedge.net', '511.alberta.ca', 'www.travelalberta.com'].includes(url.hostname));
}

// Regressions must not collapse origins, access scopes or winter into summer.
assert.match(prose, /national park pass is required for the Parkway; it does not reserve parking/);
assert.match(prose, /40 km north of the Lake Louise highway junction/);
assert.match(prose, /43 km reference from Lake Louise village/);
assert.match(prose, /Those origins are different.*rather than converting either number into a fixed journey time/);
assert.match(prose, /upper area is not a general overflow solution/);
assert.match(prose, /restricted upper parking lot.*accessible vehicles and buses.*first come, first served/);
assert.match(prose, /summer barrier-free description does not establish a cleared winter route/);
assert.match(prose, /published distance is measured from the Peyto parking area, not as an extra segment/);
assert.match(prose, /separate difficult trail down to the Peyto Lake shore/);
assert.match(prose, /“Peyto Lake viewpoint \(Icefields Parkway\)”/);
assert.match(prose, /unplowed upper road.*official trail from the north end of the parking lot.*gladed forest/);
assert.match(prose, /does not monitor natural ice for safety or mark hazards/);
assert.match(prose, /does not give an on-ice route or a freeze-date rule/);
assert.match(prose, /Parks lists toilets and accessible toilets at Peyto Lake \/ Bow Summit/);
assert.match(prose, /washroom listing does not establish a café, drinking-water supply or other walk-in service/);
assert.match(prose, /accommodation links may earn BanffBound a commission/);
assert.match(prose, /room does not include a Peyto excursion, a tour pickup or upper-lot access/);
assert.ok(!/\$\s*\d|\d+\s*%|I've|I’ve|my partner|I visited|I recommend|additional 95|95 metres over 2 km|before 10am|after 3pm|fills by|no washrooms|no facilities|new viewing platform \(2023\)|frozen from|safe ice|\b15 cm\b|\b20 cm\b|2\.2 km/.test(prose), 'No inherited invented visits, prices, parking promises, wrong Bow figures, absent-toilet claim or local Peyto ski-trail conflation.');
assert.ok(!/"@type"\s*:\s*"(?:Offer|Product|AggregateRating|Event)"|"price"|"availability"/.test(html));
assert.ok(!/getyourguide|expedia|partner_id=|camref=/.test(html), 'Use the existing located stay comparison, without new/guessed provider IDs or an invented Peyto ticket.');

// Read-only consistency with the already reviewed shared planning records.
const main = model.trails.find(trail => trail.slug === 'peyto-lake-viewpoint');
assert.equal(main.distance, '0.6 km one way (main lookout approach)'); assert.equal(main.season, 'summer');
assert.match(main.longDescription, /0\.3 km route from the upper parking lot/);
const summit = model.trails.find(trail => trail.slug === 'bow-summit-viewpoint');
assert.equal(summit.distance, '3 km one way'); assert.equal(summit.elevationGain, '310 m one way');
const shore = model.trails.find(trail => trail.slug === 'peyto-lake-shore');
assert.equal(shore.distance, '1.3 km one way from Peyto Lookout');
const lake = model.lakePlans.find(record => record.id === 'peyto');
assert.equal(lake.guide.href, '/trails/peyto-lake-viewpoint'); assert.match(lake.winter, /designated winter viewpoint route/);
const parking = model.parkingLots.find(record => record.id === 'peyto-lake');
assert.match(parking.parkingPlan, /upper parking area is designated for accessible vehicles and commercial buses/);
assert.match(parking.accessNote, /short barrier-free summer approach/);
const parkway = model.parkwayStops.find(record => record.id === 'peyto');
assert.equal(parkway.fromLouiseKm, 43); assert.equal(parkway.fromJasperKm, 190);
console.log(`Peyto checks passed: one prepared canonical guide, February11 publication retained, four distinct visit scopes, five visible/schema-identical FAQs, ${requiredSources.length} primary handoffs, ${internal} actual internal routes, complete no-JS content and retained shared trail/lake/parking/distance contracts. No registry integration, network or full site build.`);
