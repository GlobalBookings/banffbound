import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { htmlFacts, htmlElements, schemaNodes, normal } from './verify-cycling-consent-release.mjs';

// An author check: imports are pure and the next registry integration is not required.
globalThis.fetch = () => { throw new Error('Network is forbidden in this focused author check'); };
const root = fileURLToPath(new URL('../', import.meta.url));
const postSource = await readFile(path.join(root, 'src/data/blogPosts.ts'), 'utf8');
const originalArray = postSource.match(/const originalBlogPosts:\s*BlogPost\[\]\s*=\s*(\[[\s\S]*?\n\]);/)?.[1];
assert.ok(originalArray, 'Read original post metadata before any review metadata merges.');
const { outputFiles } = await build({ stdin: { contents: "export * from './src/data/goldenDayGuideOverrides.ts';export {blogRedirects} from './src/data/redirects.mjs';export {towns} from './src/data/towns.ts';\nexport const originalPosts=" + originalArray + ';', resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent' });
const d = await import('data:text/javascript;base64,' + Buffer.from(outputFiles[0].text).toString('base64'));
const slug = 'golden-bc-day-trip';
const sources = [
  'https://www.tourismgolden.com/activities/winter',
  'https://www.tourismgolden.com/places/rotary-trail',
  'https://kickinghorseresort.com/discover-kickinghorse/getting-to-kicking-horse-mountain-resort/',
  'https://kickinghorseresort.com/winter-hours/',
  'https://kickinghorseresort.com/purchase/telus-winter-snow-school/',
  'https://kickinghorseresort.com/summer-hours/',
  'https://kickinghorseresort.com/purchase/boo-grizzly-bear/',
  'https://goldennordicclub.ca/',
  'https://goldennordicclub.ca/rentals/',
  'https://www.cmhheli.com/destinations/purcell',
  'https://www.cmhheli.com/heli-skiing/day-heli-skiing',
  'https://www.banffjaspercollection.com/plan-your-trip/opening-dates/',
  'https://wildwater.com/faq/',
  'https://banfftours.com/activities/banff-to-kicking-horse-ski-shuttle/',
  'https://www.goldenshuttle.ca/kickinghorse-golden-shuttle',
  'https://parks.canada.ca/pn-np/bc/yoho/visit/directions',
  'https://parks.canada.ca/pn-np/bc/yoho/visit/services',
  'https://www2.gov.bc.ca/gov/content/transportation/driving-and-cycling/traveller-information/seasonal/winter-driving',
  'https://www.drivebc.ca/',
  'https://511.alberta.ca/',
];
const internal = ['/towns/golden/', '/towns/golden/#where-to-stay', '/towns/field-yoho/', '/blog/banff-heli-skiing/', '/blog/banff-winter-driving/', '/conditions/', '/packing-list/', '/car-free-banff/', '/winter-stays/', '/winter/', '/what-to-do-today/'];
const bad = /\$\s*\d|\bCAD\s*\d|\b135\s*km\b|\b90 minutes west\b|\b1\.5 hours driving\b|depart Banff at 8\s*a\.?m|arrive Golden at 9:30|return to Banff by 7\s*p\.?m|book a morning gondola ride and summit hike, then a 1\s*p\.?m rafting trip|half-day trips[^.]*suitable for (?:all )?beginners and families|full-day trips[^.]*include[^.]*lower canyon|Golden Skybridge is open (?:all winter|year-round)|Takakkaw Falls (?:road|is) (?:is )?open (?:all winter|year-round)|Kicking Horse is (?:a |one of the )?SkiBig3 resort|all (?:buses|shuttles) (?:include|cover) heli|guaranteed (?:clear roads|availability|snow|pickup|return)|\b(?:I|we) (?:visited|stayed|drove|skied|rafted)\b|during my last visit/i;

function validate(body, meta) {
  assert.deepEqual(Object.keys(meta).sort(), ['title', 'description', 'lastUpdated', 'readTime', 'imageIsIllustrative', 'imageNote'].sort(), 'Do not reset original publication or invent photographic identity.');
  assert.equal(meta.lastUpdated, '2026-10-29'); assert.equal(meta.imageIsIllustrative, true); assert.match(meta.imageNote, /Illustrative.*not verified/i);
  assert.match(meta.title, /Golden.*Town Visits.*Kicking Horse.*Winter Journeys/); assert.ok(meta.description.length > 100); assert.match(meta.readTime, /^\d+ min read$/);
  const html = '<html><head></head><body>' + body + '</body></html>', elements = htmlElements(html), facts = htmlFacts(html), text = facts.text;
  const words = text.split(/\s+/).length; assert.ok(words >= 1800 && words <= 3200, 'A complete, bounded multi-season journey guide: ' + words);
  assert.ok(!bad.test(text), 'No original fixed schedule, universal activity promise, false winter access, price or invented visit.');
  const headings = elements.filter(n => n.tag === 'h2'); assert.ok(headings.length >= 9); assert.equal(elements.filter(n => n.tag === 'table').length, 2); assert.ok(elements.some(n => n.tag === 'ol'));
  function section(id) { const start = headings.find(n => n.attributes.id === id); assert.ok(start, 'Required visible section: ' + id); const next = headings.find(n => n.start > start.end); return normal(html.slice(start.end, next?.start ?? html.length).replace(/<[^>]*>/g, ' ')); }
  const markers = {
    'golden-places': ['Golden town address is not the resort base', 'Dawn Mountain Nordic Centre', 'actual Golden day-lodge check-in', 'separate from Banff’s SkiBig3 resorts'],
    'golden-winter': ['does not establish winter clearing or ice-free access', 'frozen-looking river is not a walking route', 'separates equipment rental from the trail fee', 'restricts the gear to Dawn Mountain', 'return before closing', '2025/26 heading and closed service rows', 'confirms no future opening day', 'expects previous powder experience', 'not a beginner lesson or a scenic flight', 'day lodge has no overnight accommodation', 'Do not add a resort morning or promise a Banff return after flying'],
    'golden-summer': ['now-past 2026 season', 'does not establish 2027 operation', 'May 7–October 12, 2027', 'future seasonal plans', 'not winter access', '2750 Beaverfoot Road', 'not a winter activity', 'Do not assign every half-day trip the same rapids'],
    'golden-road': ['Highway 1 west', 'Kicking Horse Pass', 'Rogers Pass is farther west beyond Golden', 'before leaving and again before the return', 'source time', 'October 1–April 30', 'March 31 exceptions', 'rental’s fitted tires', 'Takakkaw Falls is not a quick winter driving detour', 'closes in winter because of avalanche hazard', 'mid-June to mid-October', 'weather permitting'],
    'golden-transport': ['actual date, pickup location', 'not a seat reservation', 'general Golden sightseeing bus', 'separate service', '2025/26 schedule', 'new season’s stops and last return', 'each final connection'],
    'golden-return': ['who drives', 'limited daylight and driver fatigue', 'actual accommodation options', 'resort accommodation against a town stay', 'operator’s own check-in address', 'room’s kitchen or dining arrangements', 'no room, rate or late arrival is guaranteed'],
    'golden-plans': ['Town-focused day', 'One booked activity', 'Golden overnight', 'give skiing or heli-skiing its own day', 'without guaranteeing road conditions'],
    'golden-sources': ['Full guide reviewed October 29, 2026', 'no live road, snow, booking or transport feed', 'hero image is illustrative'],
  };
  for (const [id, required] of Object.entries(markers)) for (const marker of required) assert.ok(section(id).includes(marker), `Practical boundary in ${id}: ${marker}`);
  const ids = elements.map(n => n.attributes.id).filter(Boolean); assert.equal(new Set(ids).size, ids.length, 'Unique jump targets.');
  const anchors = elements.filter(n => n.tag === 'a');
  for (const a of anchors) {
    assert.ok(!anchors.some(p => p !== a && a.start >= p.openEnd && a.end <= p.innerEnd), 'No nested link.');
    const href = a.attributes.href; assert.ok(href);
    if (href.startsWith('#')) assert.ok(ids.includes(href.slice(1)), 'Working section jump: ' + href);
    else if (!href.startsWith('/')) {
      const u = new URL(href); assert.equal(u.protocol, 'https:'); assert.ok(sources.includes(href), 'Only exact reviewed primary links.');
      assert.ok(!u.search, 'No invented product, affiliate ID or offer.'); assert.equal(a.attributes.target, '_blank');
      assert.ok((a.attributes.rel ?? '').split(/\s+/).includes('noopener')); assert.ok(!(a.attributes.rel ?? '').split(/\s+/).includes('sponsored'), 'No invented operator affiliate relationship.');
    }
  }
  for (const href of [...sources, ...internal]) assert.ok(anchors.some(a => a.attributes.href === href), 'Native source or real journey handoff: ' + href);
  const faqs = facts.documents.flatMap(doc => schemaNodes(doc, 'FAQPage')); assert.equal(faqs.length, 1); assert.equal(faqs[0].mainEntity.length, 5); assert.equal(facts.details.length, 5);
  d.goldenDayGuideFaqs.forEach((faq, i) => { const q = faqs[0].mainEntity[i]; assert.equal(q['@type'], 'Question'); assert.equal(q.acceptedAnswer['@type'], 'Answer'); assert.equal(normal(q.name), normal(faq.question)); assert.equal(normal(q.acceptedAnswer.text), normal(faq.answer)); assert.equal(facts.details[i].question, normal(faq.question)); assert.equal(facts.details[i].answer, normal(faq.answer)); });
  assert.ok(elements.filter(n => n.tag === 'script').every(n => n.attributes.type === 'application/ld+json' && !n.attributes.src)); assert.ok(!elements.some(n => ['iframe', 'object', 'embed'].includes(n.tag))); assert.equal(facts.documents.flatMap(doc => schemaNodes(doc, 'Article')).length, 0);
  return { words, anchors };
}

assert.deepEqual(Object.keys(d.goldenDayGuideOverrides), [slug]); assert.deepEqual(Object.keys(d.goldenDayGuideMetadata), [slug]); assert.equal(d.goldenDayGuideFaqs.length, 5); assert.equal(d.reviewDate, '2026-10-29');
assert.equal(d.originalPosts.find(p => p.slug === slug)?.date, '2025-12-10', 'Original raw publication survives independently of future integration.'); assert.ok(!d.blogRedirects[slug]);
const body = d.goldenDayGuideOverrides[slug], meta = d.goldenDayGuideMetadata[slug], result = validate(body, meta);
for (const a of result.anchors) {
  if (!a.attributes.href.startsWith('/')) continue;
  const u = new URL(a.attributes.href, 'https://banffbound.com'), route = u.pathname.replace(/\/$/, '');
  if (route.startsWith('/blog/')) { assert.ok(d.originalPosts.some(p => p.slug === route.slice(6))); assert.ok(!d.blogRedirects[route.slice(6)], 'Link canonical reviewed guides, not retired aliases.'); }
  else if (route.startsWith('/towns/')) { assert.ok(d.towns.some(t => t.slug === route.slice(7))); if (u.hash) assert.ok((await readFile(path.join(root, 'src/pages/towns/[slug].astro'), 'utf8')).includes('id="' + u.hash.slice(1) + '"')); }
  else { let exists = false; for (const file of [path.join(root, 'src/pages', route + '.astro'), path.join(root, 'src/pages', route, 'index.astro')]) try { await access(file); exists = true; } catch {} assert.ok(exists, 'Existing internal route: ' + a.attributes.href); }
}
for (const claim of ['Depart Banff at 8am.', 'Arrive Golden at 9:30am.', 'Return to Banff by 7pm.', 'Book a morning gondola ride and summit hike, then a 1pm rafting trip.', 'Half-day trips are suitable for beginners and families.', 'Full-day trips include the lower canyon.', 'Golden Skybridge is open all winter.', 'Takakkaw Falls road is open all winter.', 'Kicking Horse is a SkiBig3 resort.', 'All shuttles cover heli bases.', 'Guaranteed clear roads.', 'We skied here last winter.', 'A ticket costs $80.']) assert.throws(() => validate(body + '<p>' + claim + '</p>', meta), 'Reject unsupported or unsafe claim: ' + claim);
for (const [from, to] of [['2025/26 heading and closed service rows', 'confirmed 2026/27 opening'], ['expects previous powder experience', 'suits first-time skiers'], ['day lodge has no overnight accommodation', 'overnight rooms are included'], ['closes in winter because of avalanche hazard', 'opens all year'], ['May 7–October 12, 2027', 'January 7–October 12, 2027'], ['new season’s stops and last return', 'any old timetable'], ['rental’s fitted tires', 'rental brand'], ['"@type":"FAQPage"', '"@type":"WebPage"']]) assert.throws(() => validate(body.replaceAll(from, to), meta), 'Required boundary is not supplied by a generic FAQ: ' + from);
assert.throws(() => validate(body, { ...meta, date: '2026-10-29' })); assert.throws(() => validate(body, { ...meta, imageIsIllustrative: false }));
assert.throws(() => validate(body.replace('<summary>' + d.goldenDayGuideFaqs[0].question, '<summary>A different visible question'), meta), 'Visible FAQ cannot diverge from the schema/model.');
assert.throws(() => validate(body.replace('<a ', '<a href="/winter/"><a ').replace('</a>', '</a></a>'), meta));
const source = await readFile(path.join(root, 'src/data/goldenDayGuideOverrides.ts'), 'utf8'); assert.equal((source.match(/function renderFaqs\(/g) ?? []).length, 1); assert.equal((source.match(/\$\{renderFaqs\(\)\}/g) ?? []).length, 1);
const note = await readFile(path.join(root, 'research/golden-day-guide-sources-2026-10-29.md'), 'utf8'); for (const url of sources) assert.ok(note.includes(url), 'Source inventory: ' + url); for (const marker of ['2025-12-10', '2025/26', '2027', 'Rogers Pass', 'imageIsIllustrative', 'Registration', 'March 31']) assert.ok(note.includes(marker));
console.log(`Golden day guide checks passed: ${result.words} words; one full body/metadata, five matching visible/schema FAQs, original 2025-12-10 publication, source-linked season/base/road/return boundaries, canonical journey links, illustrative hero and negative regressions. Author scope only: no registry expectation, network, file output or site build.`);
