import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { parseFragment } from 'parse5';

// Offline author-scope verification. No live availability check or full site build.
const postSource = await readFile('src/data/blogPosts.ts', 'utf8');
const originalArray = postSource.match(/const originalBlogPosts: BlogPost\[\] = (\[[\s\S]*?\n\]);/)?.[1];
assert.ok(originalArray, 'Read the preserved original publication corpus, independently of pending registry integration.');
const { outputFiles } = await build({ stdin: { contents: "export * from './src/data/minnewankaGuideOverrides.ts'; export {blogRedirects} from './src/data/redirects.mjs'; export {lakePlans,lakeWaterRules} from './src/data/lakePlanning.ts'; export {hikingSourceReviews} from './src/data/trailSourceReviews.ts'; export {towns} from './src/data/towns.ts';\nexport const originalPosts = " + originalArray + ';', resolveDir: process.cwd() }, bundle: true, write: false, platform: 'node', format: 'esm' });
const model = await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`);
const slug = 'lake-minnewanka-guide', html = model.minnewankaGuideOverrides[slug], metadata = model.minnewankaGuideMetadata[slug], faqs = model.minnewankaGuideFaqs;
assert.deepEqual(Object.keys(model.minnewankaGuideOverrides), [slug]);
assert.deepEqual(Object.keys(model.minnewankaGuideMetadata), [slug]);
assert.equal(model.reviewDate, '2026-10-29'); assert.equal(metadata.lastUpdated, model.reviewDate);
assert.equal(model.originalPosts.find(post => post.slug === slug)?.date, '2026-02-18', 'Preserve actual February18 publication.');
assert.equal(model.blogRedirects[slug], undefined, 'Keep the canonical URL, without a new alias.');
assert.equal(metadata.date, undefined); assert.equal(metadata.slug, undefined);
assert.equal(metadata.imageIsIllustrative, true); assert.match(metadata.imageNote, /not verified as Lake Minnewanka.*current road, trail, water or ice conditions/);
assert.match(metadata.title, /Lake Minnewanka.*Winter Shore Visits.*Summer Boats/);
assert.ok(metadata.description.length >= 110);
assert.ok(Array.isArray(faqs) && faqs.length === 5, 'One FAQ array for the one canonical guide.');

const errors = [], tree = parseFragment(html, { onParseError: error => errors.push(error.code) });
assert.deepEqual(errors, []);
const nodes = root => [root, ...(root.childNodes ?? []).flatMap(nodes)];
const attr = (node, key) => node.attrs?.find(attribute => attribute.name === key)?.value;
const text = root => root.tagName === 'script' ? '' : root.nodeName === '#text' ? root.value : (root.childNodes ?? []).map(text).join(' ');
const content = root => text(root).replace(/\s+/g, ' ').trim();
const all = nodes(tree), prose = content(tree), details = all.filter(node => node.tagName === 'details');
assert.ok(prose.split(/\s+/).length >= 1400, 'Substantive visit, arrival, route, seasonal activity and base planning.');
assert.equal(all.filter(node => node.tagName === 'h1').length, 0);
assert.ok(all.filter(node => node.tagName === 'h2').length >= 8);
assert.equal(all.filter(node => ['iframe', 'form', 'img', 'input', 'button'].includes(node.tagName)).length, 0, 'Full no-JS guide without remote booking widgets or inert controls.');
const ids = all.map(node => attr(node, 'id')).filter(Boolean); assert.equal(new Set(ids).size, ids.length);
assert.ok(all.some(node => node.tagName === 'nav' && attr(node, 'aria-label') === 'Lake Minnewanka guide sections'));
const table = all.find(node => node.tagName === 'table');
assert.ok(table && nodes(table).some(node => node.tagName === 'caption'));
assert.equal(nodes(table).filter(node => node.tagName === 'tr').length, 5);
assert.ok(all.filter(node => node.tagName === 'th').every(node => ['row', 'col'].includes(attr(node, 'scope'))));
assert.match(content(table), /Winter views.*shoreline walk.*summer cruise.*rental, motorboat or fishing trip/);
const plan = all.find(node => node.tagName === 'ol'); assert.ok(plan && nodes(plan).filter(node => node.tagName === 'li').length === 4);
assert.match(content(plan), /breakfast.*land-based view.*Return/);

// Verify the actual visible and structured FAQs, not just renderer-source tokens.
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
  'https://parks.canada.ca/pn-np/ab/banff/visit/fermetures-closures',
  'https://www.banfflakelouise.com/experiences/drive-the-minnewanka-loop',
  'https://parks.canada.ca/pn-np/ab/banff/bulletins', 'https://511.alberta.ca/',
  'https://roamtransit.com/schedules-routes/lake-minnewanka-route-6/',
  'https://parks.canada.ca/pn-np/ab/banff/activ/patinage-skating',
  'https://parks.canada.ca/pn-np/ab/banff/activ/marchehiver-winterwalking/banff',
  'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
  'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking/etat-sentiers-trail-conditions',
  'https://parks.canada.ca/pn-np/mtn/ours-bears/gestion-management/ours-bears/minnewanka',
  'https://www.banffjaspercollection.com/attractions/lake-minnewanka-cruise/location-hours/',
  'https://www.banffjaspercollection.com/attractions/lake-minnewanka-cruise/',
  'https://parks.canada.ca/pn-np/ab/banff/bulletins/59933c9d-02a5-4ec9-a2d8-ea0d4dad6429',
  'https://parks.canada.ca/pn-np/ab/banff/activ/nautiques-sports',
  'https://parks.canada.ca/pn-np/ab/banff/bulletins/731c33db-ab1a-4cfb-a3e2-f123d364c877',
  'https://parks.canada.ca/pn-np/ab/banff/activ/peche-fishing',
];
for (const source of requiredSources) assert.ok(hrefs.includes(source), `Decision-changing primary handoff: ${source}`);
for (const href of ['/book/banff-hotels/', '/blog/new-places-to-eat-in-banff/', '/lakes/', '/lake-faq/', '/what-to-do-today/', '/packing-list/', '/conditions/']) assert.ok(hrefs.includes(href));
let internal = 0;
const postSlugs = new Set(model.originalPosts.map(post => post.slug));
for (const anchor of links) {
  const href = attr(anchor, 'href'); assert.ok(href && content(anchor).length > 3);
  assert.equal(nodes(anchor).filter(node => node.tagName === 'a').length, 1, 'No nested links.');
  assert.ok(!/<|>|javascript:|data:/i.test(href));
  if (href.startsWith('#')) { assert.ok(ids.includes(href.slice(1)), `Existing section target ${href}`); continue; }
  if (href.startsWith('/')) {
    const parts = href.split('/').filter(Boolean);
    if (parts[0] === 'blog') { assert.ok(postSlugs.has(parts[1]), `Existing blog route ${href}`); assert.equal(model.blogRedirects[parts[1]], undefined); }
    else if (parts[0] === 'trails') { assert.equal(model.hikingSourceReviews[parts[1]]?.sourceReview?.status, 'reviewed', `Reviewed named trail ${href}`); await access('src/pages/trails/[slug].astro'); }
    else if (parts[0] === 'towns') { assert.ok(model.towns.some(town => town.slug === parts[1]), `Actual town route ${href}`); await access('src/pages/towns/[slug].astro'); }
    else { const route = href.replace(/\/$/, ''); try { await access(`src/pages${route}.astro`); } catch { await access(`src/pages${route}/index.astro`); } }
    internal++; continue;
  }
  const url = new URL(href); assert.equal(url.protocol, 'https:'); assert.equal(url.search, '');
  assert.equal(attr(anchor, 'target'), '_blank'); assert.ok(attr(anchor, 'rel').split(/\s+/).includes('noopener'));
  assert.ok(['parks.canada.ca', 'www.banfflakelouise.com', 'roamtransit.com', '511.alberta.ca', 'www.banffjaspercollection.com'].includes(url.hostname));
}

// Protect substantive distinctions and consistency with existing reviewed planners.
assert.match(prose, /western section of Minnewanka Loop Road closed to driving from November to May/);
assert.match(prose, /eastern side via Two Jack Lake.*returning the same way/);
assert.match(prose, /not a real-time road clearance/);
assert.match(prose, /Route 6 is a summer-only service.*2026 service ended October 4/);
assert.match(prose, /does not monitor natural ice for safety or mark its hazards/);
assert.match(prose, /visit plan stays on land/);
assert.match(prose, /1\.5 km one way.*winter timetable/);
assert.match(prose, /1\.6 km one way.*rough paving.*roots, rocks and some exposure/);
assert.match(prose, /July 10–September 15 restriction.*Stewart Canyon Bridge to the east park boundary/);
assert.match(prose, /at least four.*bear spray.*prohibits dogs and cycling beyond the bridge/);
assert.match(prose, /not a blanket dog ban on the day-use area/);
assert.match(prose, /supplies no winter backcountry route or clearance/);
assert.match(prose, /ticket office, boat rentals and Black Anchor closed for the 2026 season.*2027 cruise programme/);
assert.match(prose, /Published future dates are weather dependent/);
assert.match(prose, /Special Tactics Zone.*issued April 15, 2026/);
assert.match(prose, /Personal canoes, kayaks, paddleboards and large inflatables are prohibited/);
assert.match(prose, /exceptions for authorized rental watercraft that stay at the lake.*qualifying inspected motorboats/);
assert.match(prose, /Waders and wading boots are prohibited.*gas and electric motorboats require a Parks inspection.*48 hours in advance/);
assert.match(prose, /no public boat docks.*ballast-system prohibition/);
assert.match(prose, /May 16–September 7, 2026.*season has ended/);
assert.match(prose, /provincial licence is not valid.*permit does not override a closed season/);
assert.match(prose, /Ice fishing is not a winter alternative/);
assert.match(prose, /accommodation links may earn BanffBound a commission/);
assert.match(prose, /room does not include transport to Minnewanka/);
assert.ok(!/\$\s*\d|\d+\s*%|I've|I’ve|my countless visits|I visited|I recommend|open year.round|year.round access|free parking|before 10 AM|entire length|20.pound|ice thickness.*cm|\b15 cm\b|\b20 cm\b|gas pump|fuel available|44 km|9 PM/.test(prose), 'No invented experience, rates, general ice clearance, complete-loop or boating-service guarantees.');
assert.ok(!/"@type"\s*:\s*"(?:Event|Offer|AggregateRating|Product)"|"price"|"availability"/.test(html));
assert.ok(!/getyourguide|expedia|partner_id=|camref=/.test(html), 'Existing reviewed stay journey carries merchant links; no invented Minnewanka product or new provider IDs.');
const lake = model.lakePlans.find(record => record.id === 'minnewanka');
assert.ok(lake && lake.interests.includes('view') && lake.interests.includes('shore'));
assert.equal(lake.rule, 'minnewanka'); assert.equal(lake.guide.href, '/trails/stewart-canyon');
assert.match(lake.winter, /western.*seasonal vehicle closure.*do not plan a complete driving loop or infer lake-ice access/);
assert.match(model.lakeWaterRules.minnewanka.text, /Personal paddlecraft are prohibited.*inspected motorboats.*rental watercraft/);
assert.equal(model.hikingSourceReviews['stewart-canyon'].distance, '1.6 km one way to Stewart Canyon');
assert.equal(model.hikingSourceReviews['stewart-canyon'].season, 'summer');
assert.match(model.hikingSourceReviews['aylmer-lookout'].winterNote, /separate winter route assessment/);
console.log(`Minnewanka checks passed: one canonical full review, February18 publication retained, five visible/schema-identical FAQs, ${requiredSources.length} primary handoffs, ${internal} valid internal routes, no-JS visit plan, seasonal road/trail/boat/fishing and ice distinctions, existing reviewed lake/trail contracts retained. No network or full site build.`);
