import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { htmlElements, htmlFacts, normal, schemaNodes } from './verify-cycling-consent-release.mjs';

// Local source and in-memory regressions only: no HTTP, site build or file output.
globalThis.fetch = () => { throw new Error('Network is forbidden in this focused check'); };
const root = fileURLToPath(new URL('../', import.meta.url));
const { outputFiles } = await build({ stdin: { contents: "export * from './src/data/nightlifeGuideOverrides.ts'; export { eveningPlannerHtml } from './src/data/eveningGuideMarkup.ts'; export { allBlogPosts } from './src/data/blogPosts.ts'; export { towns } from './src/data/towns.ts';", resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent' });
const data = await import('data:text/javascript;base64,' + Buffer.from(outputFiles[0].text).toString('base64'));
const slug = 'banff-nightlife-guide';
const body = data.nightlifeGuideOverrides[slug], metadata = data.nightlifeGuideMetadata[slug];
const requiredSources = [
  'https://www.dustybootbanff.com/',
  'https://www.dustybootbanff.com/live-music-specials',
  'https://www.banffcollective.com/contact-us',
  'https://www.highrollersbanff.com/',
  'https://roseandcrown.ca/events/',
  'https://www.banffcentre.ca/events',
  'https://www.banffcentre.ca/box-office/tickets',
  'https://www.banffcentre.ca/box-office/attending-a-performance',
  'https://www.banffcentre.ca/maps-directions',
  'https://roamtransit.com/schedules-routes/',
  'https://roamtransit.com/schedules-routes/route-7/',
  'https://roamtransit.com/schedules-routes/canmore-banff-regional-route-3/',
  'https://roamtransit.com/schedules-routes/lake-louise-banff-express-route-8x/',
  'https://roamtransit.com/about-us/transportation-policies/',
];
const badClaims = /\$\s*\d|\bCAD\s*\d|\b(?:I|we) (?:visited|stayed|went|saw)\b|\bmy last (?:visit|stay)|\bWild Bill['’]s\b|Dancing Sasquatch (?:is|offers|hosts|opens)|most bars (?:do not|don't|don’t) charge (?:a )?cover|(?:won't|won’t|do not|don't|don’t) need (?:a )?(?:car|taxi)|(?:taxis?|buses?|shuttles?) (?:are |is )?(?:always available|guaranteed|free all night)|(?:all|every) (?:bars?|venues?|performances?) (?:close|are all-ages|welcome children)/i;

function validate(content, meta) {
  assert.equal(meta.lastUpdated, '2026-10-29');
  for (const key of ['date', 'datePublished', 'publishedAt']) assert.ok(!Object.hasOwn(meta, key), 'Original publication is not reset.');
  assert.equal(meta.imageIsIllustrative, true); assert.match(meta.imageNote, /Illustrative.*not verified/i);
  assert.ok(meta.title.length > 30 && meta.description.length > 80); assert.match(meta.readTime, /^\d+ min read$/);
  const html = '<html><head></head><body>' + content + '</body></html>';
  const facts = htmlFacts(html), elements = htmlElements(html), text = facts.text;
  const authored = htmlFacts('<html><body>' + content.replace(data.eveningPlannerHtml, '') + '</body></html>').text;
  const words = authored.split(/\s+/).length;
  assert.ok(words >= 1100 && words <= 2000, 'Substantive, bounded authored guide: ' + words);
  assert.ok(!badClaims.test(text), 'No inherited or invented current venue, crowd, price, visit or transport claim.');
  for (const marker of ['October 29, 2026', '120 Banff Avenue', '18+ entry condition', '110 Banff Avenue', 'no minors are allowed after 10pm', 'separate dining and bowling reservations', 'Route 7', 'fall/winter seasonal service', 'paid parking', 'uphill from downtown', 'not guaranteed', 'Early', 'alcohol-free', 'assigned seats', 'last useful departure', 'village, lakeshore, resort and road-base addresses']) {
    assert.ok(text.toLowerCase().includes(marker.toLowerCase()), 'Current source/decision marker: ' + marker);
  }
  assert.equal(content.split(data.eveningPlannerHtml).length - 1, 1, 'Shared planner included once without duplicating its definition.');
  const nav = elements.find(n => n.tag === 'nav' && n.attributes['aria-label'] === 'Evening guide sections');
  const planner = elements.find(n => n.tag === 'section' && n.attributes.id === 'evening-planner');
  const next = elements.find(n => n.tag === 'h2' && n.attributes.id === 'choose-your-anchor');
  assert.ok(nav && planner && next && nav.end < planner.start && planner.end < next.start, 'Introduction/nav, exact shared planner, then authored guide.');
  assert.ok(elements.filter(n => n.tag === 'h2').length >= 10 && elements.some(n => n.tag === 'table') && elements.some(n => n.tag === 'ol'));
  const ids = elements.map(n => n.attributes.id).filter(Boolean); assert.equal(new Set(ids).size, ids.length, 'Unique section/control IDs.');
  const anchors = elements.filter(n => n.tag === 'a');
  for (const a of anchors) {
    assert.ok(!anchors.some(parent => parent !== a && a.start >= parent.openEnd && a.end <= parent.innerEnd), 'No nested anchors.');
    const href = a.attributes.href; assert.ok(href, 'Every native link has a destination.');
    if (href.startsWith('#')) assert.ok(ids.includes(href.slice(1)), 'Valid in-body jump target: ' + href);
    else if (!href.startsWith('/')) {
      const url = new URL(href); assert.equal(url.protocol, 'https:');
      assert.ok(['www.dustybootbanff.com', 'www.banffcollective.com', 'www.highrollersbanff.com', 'roseandcrown.ca', 'www.banffcentre.ca', 'roamtransit.com', 'www.pizzeriasophiabanff.com'].includes(url.hostname), 'Only primary operator/transport links: ' + href);
      assert.equal(a.attributes.target, '_blank'); assert.ok((a.attributes.rel ?? '').split(/\s+/).includes('noopener'));
      assert.ok(!url.searchParams.has('camref') && !url.searchParams.has('partner_id') && !/sponsored/.test(a.attributes.rel ?? ''), 'Official links are not presented as affiliate links.');
    }
  }
  for (const source of requiredSources) assert.ok(anchors.some(a => a.attributes.href === source), 'Required visible native primary source: ' + source);
  for (const href of ['/blog/banff-live-music/', '/blog/new-places-to-eat-in-banff/', '/blog/banff-apres-ski/', '/book/banff-hotels/', '/winter/', '/car-free-banff/', '/towns/banff/', '/towns/canmore/', '/towns/lake-louise/']) assert.ok(anchors.some(a => a.attributes.href === href), 'Useful existing handoff: ' + href);
  const schemas = facts.documents.flatMap(d => schemaNodes(d, 'FAQPage')); assert.equal(schemas.length, 1);
  assert.equal(schemas[0].mainEntity.length, data.nightlifeGuideFaqs.length); assert.equal(facts.details.length, data.nightlifeGuideFaqs.length);
  data.nightlifeGuideFaqs.forEach((faq, i) => {
    const q = schemas[0].mainEntity[i]; assert.equal(q['@type'], 'Question'); assert.equal(q.acceptedAnswer['@type'], 'Answer');
    assert.equal(normal(q.name), normal(faq.question)); assert.equal(normal(q.acceptedAnswer.text), normal(faq.answer));
    assert.equal(facts.details[i].question, normal(faq.question)); assert.equal(facts.details[i].answer, normal(faq.answer));
  });
  assert.ok(elements.filter(n => n.tag === 'script').every(n => n.attributes.type === 'application/ld+json' && !n.attributes.src), 'Only inert matching FAQ schema.');
  assert.ok(!elements.some(n => ['iframe', 'embed', 'object'].includes(n.tag)), 'No embedded providers.');
  return { words, anchors };
}

assert.deepEqual(Object.keys(data.nightlifeGuideOverrides), [slug]); assert.deepEqual(Object.keys(data.nightlifeGuideMetadata), [slug]);
assert.equal(data.reviewDate, '2026-10-29'); assert.equal(data.nightlifeGuideFaqs.length, 5);
assert.equal(data.allBlogPosts.find(post => post.slug === slug)?.date, '2026-02-10', 'Original publication preserved.');
const result = validate(body, metadata);
for (const a of result.anchors) {
  const href = a.attributes.href; if (!href.startsWith('/')) continue;
  const route = new URL(href, 'https://banffbound.com').pathname.replace(/\/$/, '');
  if (route.startsWith('/blog/')) assert.ok(data.allBlogPosts.some(post => post.slug === route.slice(6)), 'Existing canonical blog link: ' + href);
  else if (route.startsWith('/towns/')) assert.ok(data.towns.some(town => town.slug === route.slice(7)), 'Existing town: ' + href);
  else { let exists = false; for (const file of [path.join(root, 'src/pages', route + '.astro'), path.join(root, 'src/pages', route, 'index.astro')]) try { await access(file); exists = true; } catch {} assert.ok(exists, 'Existing internal page: ' + href); }
}
for (const bad of ["<p>Dancing Sasquatch is Banff’s current dance venue.</p>", '<p>Wild Bill’s is the place to dance.</p>', '<p>Most bars do not charge a cover.</p>', '<p>Taxis are always available.</p>', '<p>You won’t need a taxi.</p>', '<p>We visited last winter.</p>', '<p>A lane costs $20.</p>']) assert.throws(() => validate(body + bad, metadata), 'Reject unsupported inherited claim: ' + bad);
assert.throws(() => validate(body.replaceAll('no minors are allowed after 10pm', 'no minors are allowed after 11pm'), metadata), 'Admission regression.');
assert.throws(() => validate(body.replace(data.eveningPlannerHtml, ''), metadata), 'Shared planner required.');
assert.throws(() => validate(body.replaceAll('https://roamtransit.com/schedules-routes/route-7/', 'https://example.com/route'), metadata), 'Primary seasonal route source required.');
assert.throws(() => validate(body.replace('"@type":"FAQPage"', '"@type":"Article"'), metadata), 'Matching FAQ schema required.');
assert.throws(() => validate(body.replace('<a ', '<a href="/winter/"><a ').replace('</a>', '</a></a>'), metadata), 'Nested link regression.');
assert.throws(() => validate(body, { ...metadata, date: '2026-10-29' }), 'No publication reset.');
assert.throws(() => validate(body, { ...metadata, imageIsIllustrative: false }), 'Unverified photo identity excluded.');
const source = await readFile(path.join(root, 'src/data/nightlifeGuideOverrides.ts'), 'utf8');
assert.match(source, /import\s*\{\s*eveningPlannerHtml\s*\}\s*from ['"]\.\/eveningGuideMarkup['"]/);
assert.equal((source.match(/\$\{eveningPlannerHtml\}/g) ?? []).length, 1);
const note = await readFile(path.join(root, 'research/nightlife-guide-sources-2026-10-29.md'), 'utf8');
for (const url of requiredSources) assert.ok(note.includes(url), 'Source inventory: ' + url);
for (const marker of ['2026-02-10', 'imageIsIllustrative', '3–5pm', '4–6pm', 'No new affiliate ID', 'five formats']) assert.ok(note.includes(marker), 'Bounded source/integration record: ' + marker);
console.log(`Nightlife guide checks passed: ${result.words} authored words plus shared planner; one full guide/metadata, original publication, five matching FAQs, current venue/age/source distinctions, native routes, illustrative image contract and negative regressions. No network, site build or file output.`);
