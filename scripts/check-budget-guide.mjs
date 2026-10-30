import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { htmlFacts, htmlElements, schemaNodes, normal } from './verify-cycling-consent-release.mjs';

// Focused author contract: current integration can register the new body later.
globalThis.fetch = () => { throw Error('No network in budget guide checks'); };
const root = fileURLToPath(new URL('../', import.meta.url));
const postSource = await readFile(path.join(root, 'src/data/blogPosts.ts'), 'utf8');
const rawPosts = postSource.match(/const originalBlogPosts:\s*BlogPost\[\]\s*=\s*(\[[\s\S]*?\n\]);/)?.[1]; assert.ok(rawPosts);
const output = await build({ stdin: { contents: "export * from './src/data/budgetGuideOverrides.ts';export {blogContent as legacyBlogContent} from './src/data/blogContent.ts';export {blogRedirects} from './src/data/redirects.mjs';export {towns} from './src/data/towns.ts';export * from './src/data/tripCostPlanning.ts';export const originalPosts=" + rawPosts + ';', resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent' });
const d = await import('data:text/javascript;base64,' + Buffer.from(output.outputFiles[0].text).toString('base64'));
const slug = 'banff-trip-cost-budget-guide';
const sourceUrls = [
  'https://parks.canada.ca/pn-np/ab/banff/visit/tarifs-fees',
  'https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise',
  'https://roamtransit.com/fares/',
  'https://www.skibig3.com/ski/lift-tickets/',
  'https://www.skilouise.com/ski-snowboard-lessons/adult-lessons/adult-group-lessons/',
  'https://www.banffjaspercollection.com/dining/sky-bistro/',
  'https://www.banffjaspercollection.com/plan-your-trip/opening-dates/',
];
const nativeAffiliates = [
  'https://www.expedia.ca/Hotel-Search?destination=Banff%2C+Alberta&camref=1101l3MtWX',
  'https://www.getyourguide.com/banff-l284/?partner_id=QW960HO',
];
const archivedAffiliates = [
  'https://www.getyourguide.com/banff-l284/banff-gondola-admission-ticket-t556595/?partner_id=QW960HO',
  'https://www.getyourguide.com/banff-l284/lake-minnewanka-cruise-tc128/?partner_id=QW960HO',
  'https://www.getyourguide.com/banff-l284/athabasca-glacier-columbia-icefield-day-trip-t113074/?partner_id=QW960HO',
  'https://www.getyourguide.com/banff-l284/food-drink-tc36/?partner_id=QW960HO',
];
const internal = ['/trip-cost/','/trip-cost/#trip-budget-planner','/book/banff-hotels/','/book/lake-louise-stays/','/book/banff-winter-activities/','/towns/canmore/','/calgary-to-banff/','/car-free-banff/','/parking/','/park-pass/','/blog/banff-winter-driving/','/eat-and-drink/#dining-finder','/learn-to-ski/#lesson-fit','/ski-day-planner/','/ski-pass-calculator/','/what-to-do-today/','/packing-list/','/winter-stays/'];
const bad = /\$\s*\d|\bCAD\s*\d|\d+\s*%|real 2026 prices|Canmore (?:is always cheaper|saves)|save 30|annual pass saves money after|seven days always|Parks Canada pass is included with (?:all|every) shuttle|shuttle ticket includes (?:the )?national park entry|Moraine Lake Road is open to personal vehicles|cruises operate (?:in winter|year-round)|all tours offer free cancellation|Dark Sky Preserve|groceries[^.]{0,50}are free|(?:I|we) (?:visited|stayed|paid|booked)|during my last visit/i;
function validate(body, meta) {
  assert.deepEqual(Object.keys(meta).sort(), ['title','description','lastUpdated','readTime','imageIsIllustrative','imageNote'].sort());
  assert.equal(meta.lastUpdated, '2026-10-29'); assert.equal(meta.imageIsIllustrative, true); assert.match(meta.imageNote, /Illustrative.*not verified/i);
  assert.match(meta.title, /Banff Trip Budget.*Winter.*Summer/); assert.ok(meta.description.length > 100); assert.match(meta.readTime, /^\d+ min read$/);
  const html = '<html><head></head><body>' + body + '</body></html>', facts = htmlFacts(html), elements = htmlElements(html), text = facts.text;
  const words = text.split(/\s+/).length; assert.ok(words >= 2200 && words <= 3600, 'Substantive quote-based multi-season guide: ' + words); assert.ok(!bad.test(text), 'No price/rate/FX/savings figures, obsolete operations, universal inclusion or invented experience.');
  const headings = elements.filter(node => node.tag === 'h2'); assert.ok(headings.length >= 12);
  function section(id) { const start = headings.find(node => node.attributes.id === id); assert.ok(start, 'Required budget section ' + id); const next = headings.find(node => node.start > start.end); return normal(html.slice(start.end, next?.start ?? html.length).replace(/<[^>]*>/g, ' ')); }
  const requirements = {
    'budget-plan': ['Five travel days might mean four nights, not five','seven','room, an apartment, a bed','Currency', 'blanks unknown','partial budget','amounts already paid'],
    'accommodation': ['lakeshore, community and ski resort are different places','not a guaranteed discount','taxes, required fees, parking and cancellation terms','actual campground, operating season','Neither an early booking nor a shoulder-season date guarantees'],
    'transport': ['whole-trip','actual local and regional routes','not a universal lake or airport transfer','Rental days need not equal hotel nights','actual pickup and return times'],
    'park-pass': ['youth admission exemption is not free access to every paid service','no universal seven-day break-even','valid pass you already hold'],
    'food': ['whole-party daily amount','à la carte dining from Banff Gondola admission','table reservation alone does not pay'],
    'activities': ['age 13','Learning Area ticket','restricted access is not a full-mountain ticket','Moraine Lake Road is closed to personal vehicles year-round','excludes national park entry','2026 shuttle season ended October 12','future operating plans, weather permitting','not winter activities'],
    'sample-budgets': ['illustrative planning examples, not offers, market rates or suggested spending levels','No monetary amounts are supplied','two adults, five travel days, four nights, two ski days','Whole party / trip','four people, six travel days, five nights','two rooms and five nights','whole-party food budget for six days','park, transit and attraction categories need not match'],
    'free-things': ['No attraction ticket does not mean the whole day costs nothing','summer hiking description does not establish a winter route','possessing equipment does not establish terrain ability'],
    'saving-on-activities': ['same people, dates, nights','refund versus credit','Do not assume every marketplace activity offers free cancellation','reserve based on your own tolerance'],
    'book-your-trip': ['destination search, not a named property','We may earn a commission','at no extra cost to you','current winter activity comparison','actual product, dates, meeting place and terms'],
    'budget-sources': ['Full guide reviewed October 29, 2026','No operating prices, exchange rates or savings percentages','no live price, transport, weather or booking feed','hero is illustrative'],
  };
  // Case-insensitive prose markers avoid treating editorial capitalization as a defect.
  for (const [id, markers] of Object.entries(requirements)) for (const marker of markers) assert.ok(section(id).toLowerCase().includes(marker.toLowerCase()), 'Meaningful section boundary ' + id + ': ' + marker);
  const tables = elements.filter(node => node.tag === 'table'); assert.equal(tables.length, 2);
  const firstTable = html.slice(tables[0].openEnd, tables[0].innerEnd); assert.equal((firstTable.match(/<th scope="row">/g) ?? []).length, 7, 'Seven whole-trip categories match the planner.');
  const ids = elements.map(node => node.attributes.id).filter(Boolean); assert.equal(ids.length, new Set(ids).size);
  const anchors = elements.filter(node => node.tag === 'a');
  for (const anchor of anchors) {
    assert.ok(!anchors.some(parent => parent !== anchor && anchor.start >= parent.openEnd && anchor.end <= parent.innerEnd), 'No nested anchors');
    const href = anchor.attributes.href; assert.ok(href);
    if (href.startsWith('#')) assert.ok(ids.includes(href.slice(1)), 'Valid section jump ' + href);
    else if (!href.startsWith('/')) { assert.equal(new URL(href).protocol, 'https:'); assert.ok([...sourceUrls, ...nativeAffiliates].includes(href), 'Only verified source routes and inherited native affiliate URLs'); assert.equal(anchor.attributes.target, '_blank'); const rel = (anchor.attributes.rel ?? '').split(/\s+/); assert.ok(rel.includes('noopener')); assert.equal(rel.includes('sponsored'), nativeAffiliates.includes(href)); }
  }
  for (const href of [...sourceUrls, ...nativeAffiliates, ...internal]) assert.ok(anchors.some(anchor => anchor.attributes.href === href), 'Useful exact native destination ' + href);
  assert.ok(!/budget-existing-links|Other marketplace routes previously linked|older gondola-labelled|older Minnewanka-labelled|older glacier-trip-labelled|older food-and-drink marketplace/i.test(body), 'No public implementation/history reference block');
  for (const href of archivedAffiliates) assert.ok(!body.includes(href), 'Unverified archived route is absent from rendered guide');
  const schemas = facts.documents.flatMap(doc => schemaNodes(doc, 'FAQPage')); assert.equal(schemas.length, 1); assert.equal(schemas[0].mainEntity.length, 5);
  assert.equal(facts.details.length, 5);
  for (const [i, faq] of d.budgetGuideFaqs.entries()) { const item = schemas[0].mainEntity[i]; assert.equal(item['@type'], 'Question'); assert.equal(item.acceptedAnswer['@type'], 'Answer'); assert.equal(normal(item.name), normal(faq.question)); assert.equal(normal(item.acceptedAnswer.text), normal(faq.answer)); const visible = facts.details.filter(detail => detail.question === normal(faq.question)); assert.equal(visible.length, 1); assert.equal(visible[0].answer, normal(faq.answer)); }
  assert.equal(elements.filter(node => node.tag === 'script').length, 1); assert.ok(elements.filter(node => node.tag === 'script').every(node => node.attributes.type === 'application/ld+json' && !node.attributes.src));
  for (const type of ['Article','Product','Offer','AggregateRating']) assert.equal(facts.documents.flatMap(doc => schemaNodes(doc, type)).length, 0);
  assert.ok(!elements.some(node => ['iframe','object','embed','form'].includes(node.tag)));
  return { words, anchors };
}
assert.equal(d.reviewDate, '2026-10-29'); assert.deepEqual(Object.keys(d.budgetGuideOverrides), [slug]); assert.deepEqual(Object.keys(d.budgetGuideMetadata), [slug]); assert.equal(d.budgetGuideFaqs.length, 5);
assert.equal(d.originalPosts.find(post => post.slug === slug)?.date, '2026-03-01'); assert.ok(!d.blogRedirects[slug]);
const legacy = htmlFacts('<html><body>' + d.legacyBlogContent[slug] + '</body></html>');
assert.deepEqual([...new Set(legacy.links.filter(href => href.startsWith('https:')))].sort(), [...nativeAffiliates, ...archivedAffiliates].sort(), 'Baseline exact inherited author URLs/IDs remain recoverable');
const sourceRecord = await readFile(path.join(root, 'research/budget-guide-sources-2026-10-29.md'), 'utf8');
for (const href of archivedAffiliates) assert.ok(sourceRecord.includes(href), 'Archived exact URL retained in research record');
assert.deepEqual(Object.values(d.budgetGuideAffiliateLinks).sort(), [...nativeAffiliates].sort()); assert.deepEqual(Object.values(d.budgetGuideSources).sort(), [...sourceUrls].sort());
assert.equal(d.tripBudgetCategories.length, 7); assert.deepEqual(d.tripBudgetCategories.map(row => row.id), ['lodging','food','activities','transport','arrival','admission','extras']);
const body = d.budgetGuideOverrides[slug], meta = d.budgetGuideMetadata[slug], result = validate(body, meta);
for (const anchor of result.anchors) {
  if (!anchor.attributes.href.startsWith('/')) continue;
  const url = new URL(anchor.attributes.href, 'https://banffbound.com'), route = url.pathname.replace(/\/$/, '');
  if (route.startsWith('/blog/')) { const target = route.slice(6); assert.ok(d.originalPosts.some(post => post.slug === target)); assert.ok(!d.blogRedirects[target]); }
  else if (route.startsWith('/towns/')) assert.ok(d.towns.some(town => town.slug === route.slice(7)));
  else {
    let target; for (const file of [path.join(root, 'src/pages', route + '.astro'), path.join(root, 'src/pages', route, 'index.astro')]) try { await access(file); target = file; break; } catch {}
    assert.ok(target, 'Real internal route ' + url.pathname);
    if (url.hash) assert.ok((await readFile(target, 'utf8')).includes('id="' + url.hash.slice(1) + '"'), 'Actual planning anchor ' + anchor.attributes.href);
  }
}
for (const [from, to] of [
  ['excludes national park entry','includes national park entry'],
  ['two rooms and five nights','two rooms and six nights'],
  ['not a guaranteed discount','always a guaranteed discount'],
  ['camref=1101l3MtWX','camref=wrong'],
  ['"@type":"FAQPage"','"@type":"WebPage"'],
]) { assert.ok(body.includes(from), 'Negative fixture actually changes the body: ' + from); assert.throws(() => validate(body.replace(from, to), meta), 'Material regression rejected: ' + from); }
for (const claim of ['Rooms cost CAD 180 per night.','Canmore is always cheaper.','Save 30% by booking early.','All tours offer free cancellation.']) assert.throws(() => validate(body + '<p>' + claim + '</p>', meta));
for (const href of archivedAffiliates) assert.throws(() => validate(body + '<a href="' + href + '" target="_blank" rel="noopener sponsored">Old offer</a>', meta), 'An archived route cannot return as a public offer');
console.log(`Budget guide checks passed:${result.words} source-rendered words; one canonical body/metadata, preserved2026-03-01 publication, five matching FAQ/schema entries, seven planner-aligned categories, winter/summer unit examples without market amounts, exact2 active original searches and4 source-only archived URLs, native source/real journey links, no prices/FX/savings/false inclusions; material negative regressions. No network, site build or shared integration edits.`);
