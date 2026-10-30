import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { transform } from '@astrojs/compiler';
import { experimental_AstroContainer } from 'astro/container';
import { htmlFacts, htmlElements, schemaNodes, normal } from './verify-cycling-consent-release.mjs';

globalThis.fetch = () => { throw Error('No network in access-walk author checks'); };
const root = fileURLToPath(new URL('../', import.meta.url)), require = createRequire(import.meta.url);
const read = file => readFile(path.join(root, file), 'utf8');
const slug = 'banff-accessible-hikes', publication = '2025-09-18';
const sourceFile = 'src/data/accessWalkGuideOverrides.ts';
const original = (await read('src/data/blogPosts.ts')).match(/const originalBlogPosts:\s*BlogPost\[\]\s*=\s*(\[[\s\S]*?\n\]);/)?.[1];
assert.ok(original, 'Use untouched publications rather than projected metadata');
const bundle = await build({ stdin: { contents: `export * from './${sourceFile}';export { blogRedirects } from './src/data/redirects.mjs';export { towns } from './src/data/towns.ts';export { accessProfiles } from './src/data/accessibilityPlanning.ts';export const originalPosts=${original};`, resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent' });
const d = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
for (const value of [d.accessWalkGuideOverrides, d.accessWalkGuideMetadata, d.accessWalkGuideFaqs, d.accessWalkGuideSources]) assert.deepEqual(Object.keys(value), [slug]);
assert.equal(d.reviewDate, '2026-10-29'); assert.equal(d.originalPosts.find(p => p.slug === slug)?.date, publication); assert.ok(!Object.hasOwn(d.blogRedirects, slug));
const referrals = ['https://www.expedia.ca/Hotel-Search?destination=Banff%2C+Alberta&camref=1101l3MtWX', 'https://www.getyourguide.com/banff-l284/?partner_id=QW960HO'];
const legacy = (await read('src/data/blogContent.ts')).match(new RegExp("['\"]" + slug + "['\"]\\s*:\\s*`([\\s\\S]*?)`"))?.[1];
assert.ok(legacy); assert.ok(!/\bid=["']/.test(legacy), 'No legacy fragment IDs silently dropped');
assert.deepEqual([...new Set([...legacy.matchAll(/href=["']([^"']+)["']/g)].map(m => m[1]))].sort(), [...referrals].sort(), 'Actual inherited URL set');

// These expected source facts are independent of the new HTML interpolation.
// Also catch drift against the already reviewed shared comparison model.
const expectedFenland = { distance: '1.9 km loop', surface: '83% hard soil; 15% gravel; 2% decking', width: '162 / 62 cm', grade: '3 / 26%', crossSlope: '3 / 21%' };
const sharedFenland = d.accessProfiles.find(p => p.id === 'fenland');
for (const [key, value] of Object.entries(expectedFenland)) assert.equal(sharedFenland[key], value, 'Existing physical-profile source consistency: ' + key);
const compiled = await transform('---\nconst { body } = Astro.props;\n---\n<article data-access-walk-guide><Fragment set:html={body} /></article>', { filename: path.join(root, 'access-walk-author-check.astro'), internalURL: 'astro/compiler-runtime', resultScopedSlot: true });
assert.deepEqual(compiled.diagnostics.filter(v => v.severity === 1), []);
const code = compiled.code.replace(/,\s*createMetadata as \$\$createMetadata/, '').replace(/^export const \$\$metadata = [^\n]*\n/m, '');
const renderer = await build({ stdin: { contents: code, loader: 'ts', resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent', plugins: [{ name: 'astro-runtime-only', setup(b) { b.onResolve({ filter: /^astro\// }, a => ({ path: pathToFileURL(require.resolve(a.path)).href, external: true })); } }] });
const Page = (await import('data:text/javascript;base64,' + Buffer.from(renderer.outputFiles[0].text).toString('base64'))).default;
const container = await experimental_AstroContainer.create();
const html = '<html><head></head><body>' + await container.renderToString(Page, { props: { body: d.accessWalkGuideOverrides[slug] }, request: new Request('https://banffbound.com/blog/banff-accessible-hikes/?device=PRIVATE_DEVICE&medical=PRIVATE_MEDICAL&gclid=PRIVATE_CLICK') }) + '</body></html>';
const required = {
  'walk-endpoint': ['specific purpose', 'not a list of universally accessible routes', 'selected Central Park', 'lower viewing area', 'day-use-area visit', 'do not rank disabilities', 'return differs'],
  'walk-profile': ['one worked example', 'typical / minimum', 'typical / maximum', 'sideways tilt', '237 m counterclockwise', 'does not support calling the whole loop flat, paved or barrier-free', 'not move off the designated path', 'three-profile comparison'],
  'walk-town': ['paved riverside pathway', 'not a winter opening confirmation', 'viewing-area listing does not measure a whole connecting trail', 'clifftop section is closed in winter', 'not plan the full town-to-falls path as a flat paved loop', 'use the river ice as an alternative'],
  'walk-lakes': ['2.3 km one way', 'does not establish a fully paved route', 'village, the lakeshore and the ski resort separate', 'day-use area and the route to Stewart Canyon', 'rough paving followed by natural trail', 'rock and root sections and exposure', 'washroom'],
  'walk-peyto': ['0.3 km barrier-free trail from the upper parking lot', 'restricted to accessible vehicles and buses', 'not every path from the main public parking area', 'summer-only viewing option', 'does not promise a cleared winter path', 'remote road journey'],
  'walk-journey': ['both directions', 'physical assistance', 'possible fit limits', 'driver may be unable to provide physical help', 'pre-purchased ticket for the regular service', 'companions subject to space', '2026 Alpine Start product had no accessible service', 'ended October 12, 2026', 'first-come, first-served and cannot be guaranteed', 'Moraine Lake has no accessible parking'],
  'walk-winter': ['not a promise that it is cleared today', 'does not override a closure', 'October 29, 2026', 'issued October 13', 'including P1 parking and washrooms', 'scheduled December 11 end', 'Reopening is not confirmed here', 'not substitute an unfamiliar approach'],
  'walk-support': ['specific outing, venue, equipment', 'no free all-terrain chair loan', 'accessible indoor/outdoor heritage experience', 'do not establish access along Marsh Trail', '368 shallow stairs each way and is not wheelchair accessible', 'does not establish a step-free route'],
  'walk-booking': ['endpoint and approach', 'washroom, resting places', 'companions and equipment', 'not verified accessible-room inventory', 'broad destination searches', 'may earn a commission'],
  'walk-sources': ['Checked October 29, 2026', 'not a complete accessible-route inventory'],
};
const native = ['/accessible-trails/#trail-profiles', '/blog/accessible-banff/', '/towns/banff/', '/eat-and-drink/#dining-finder', '/blog/lake-louise-village-guide/', '/shuttle-reservations/', '/blog/peyto-lake-guide/', '/icefields-parkway-planner/', '/parking/', '/car-free-banff/', '/conditions/', '/book/banff-hotels/', '/book/lake-louise-stays/', '/packing-list/'];
const forbidden = /\$\s*\d|\bCAD\s*\d|\b(?:I|we) (?:visited|stayed|tested)|during my last visit|10 wheelchair-accessible trails|suitable for all abilities|every trail is barrier.free|fully accessible throughout|all devices fit|every scooter fits|guaranteed (?:parking|views|access|assistance)|all routes are cleared in winter|follow the river ice|Moraine Lake has accessible parking|a free track chair is waiting|accessible tour guaranteed|all room categories are accessible/i;
const profileRows = [
  ['Distance basis', '1.9 km loop.'],
  ['Surface mix', '83% hard soil; 15% hard aggregate/gravel; 2% wood-decking.'],
  ['Width: typical / minimum', '162 / 62 cm.'],
  ['Grade: typical / maximum', '3 / 26%.'],
  ['Cross slope: typical / maximum', '3 / 21%.'],
  ['Obstacle', 'Significant roots; the first identified root obstacle is 237 m counterclockwise from the trailhead.'],
];
function inspect(output, meta = d.accessWalkGuideMetadata[slug]) {
  assert.deepEqual(Object.keys(meta).sort(), ['title', 'description', 'lastUpdated', 'readTime', 'imageIsIllustrative', 'imageNote'].sort());
  assert.equal(meta.lastUpdated, d.reviewDate); assert.equal(meta.imageIsIllustrative, true); assert.match(meta.imageNote, /Illustrative.*not verified/); assert.ok(meta.description.length > 100); assert.ok(!/10|all abilities/i.test(meta.title + meta.description));
  const facts = htmlFacts(output), elements = htmlElements(output), words = facts.text.split(/\s+/).length;
  assert.ok(words >= 1700 && words <= 2800, `Substantive bounded endpoint guide (${words} words)`); assert.ok(!forbidden.test(facts.text), 'No universal access, safety, inventory or invented personal claim');
  assert.ok(!/PRIVATE_DEVICE|PRIVATE_MEDICAL|PRIVATE_CLICK/.test(output)); assert.ok(facts.text.includes('Full guide reviewed October 29, 2026')); assert.ok(facts.text.includes('hero image is illustrative'));
  const headings = elements.filter(v => v.tag === 'h2'), ids = elements.map(v => v.attributes.id).filter(Boolean); assert.equal(ids.length, new Set(ids).size);
  for (const [id, markers] of Object.entries(required)) {
    const h = headings.find(v => v.attributes.id === id); assert.ok(h, id); const next = headings.find(v => v.start > h.end);
    const text = normal(output.slice(h.start, next?.start ?? output.length).replace(/<[^>]*>/g, ' '));
    for (const marker of markers) assert.ok(text.toLowerCase().includes(marker.toLowerCase()), `${id}: ${marker}`);
  }
  const tables = elements.filter(v => v.tag === 'table'); assert.equal(tables.length, 2, 'One format table and one worked profile, not another full comparison tool');
  assert.ok(tables.every(t => !t.hidden));
  const rows = elements.filter(v => v.tag === 'tr' && v.start > tables[1].openEnd && v.end < tables[1].innerEnd);
  assert.equal(rows.length, 7);
  for (const [index, expected] of profileRows.entries()) {
    const cells = elements.filter(v => ['th', 'td'].includes(v.tag) && v.start >= rows[index + 1].openEnd && v.end <= rows[index + 1].innerEnd);
    assert.deepEqual(cells.map(v => normal(output.slice(v.openEnd, v.innerEnd).replace(/<[^>]*>/g, ' '))), expected, 'Actual SSR Fenland values, labels, units and direction');
  }
  assert.equal(elements.filter(v => v.tag === 'nav').length, 1);
  const anchors = elements.filter(v => v.tag === 'a'), primary = Object.values(d.accessWalkGuideSources[slug]);
  for (const e of elements) assert.ok(!Object.keys(e.attributes).some(k => /^on/i.test(k)), 'No event handlers in static authored output');
  for (const a of anchors) {
    const href = a.attributes.href; assert.ok(href); assert.ok(!anchors.some(p => p !== a && a.start >= p.openEnd && a.end <= p.innerEnd), 'No nested anchor corruption');
    if (href.startsWith('#')) assert.ok(ids.includes(href.slice(1)), 'Valid in-body navigation fragment');
    else if (!href.startsWith('/')) { assert.equal(new URL(href).protocol, 'https:'); assert.ok([...primary, ...referrals].includes(href), 'Exact declared primary or inherited URL'); assert.equal(a.attributes.target, '_blank'); assert.ok(a.attributes.rel?.split(/\s+/).includes('noopener')); assert.equal(a.attributes.rel?.split(/\s+/).includes('sponsored'), referrals.includes(href)); }
  }
  for (const href of [...primary, ...referrals, ...native]) assert.ok(anchors.some(a => a.attributes.href === href), 'Useful source/native handoff retained: ' + href);
  assert.deepEqual([...new Set(anchors.filter(a => a.attributes.rel?.split(/\s+/).includes('sponsored')).map(a => a.attributes.href))].sort(), [...referrals].sort());
  const schemas = facts.documents.flatMap(doc => schemaNodes(doc, 'FAQPage')); assert.equal(schemas.length, 1); assert.equal(schemas[0].mainEntity.length, 5); assert.equal(facts.details.length, 5);
  for (const [i, faq] of d.accessWalkGuideFaqs[slug].entries()) { const item = schemas[0].mainEntity[i]; assert.equal(item['@type'], 'Question'); assert.equal(item.acceptedAnswer['@type'], 'Answer'); assert.equal(normal(item.name), normal(faq.question)); assert.equal(normal(item.acceptedAnswer.text), normal(faq.answer)); assert.equal(facts.details[i].question, normal(faq.question)); assert.equal(facts.details[i].answer, normal(faq.answer)); }
  const scripts = elements.filter(v => v.tag === 'script'); assert.equal(scripts.length, 1); assert.equal(scripts[0].attributes.type, 'application/ld+json'); assert.ok(!scripts[0].attributes.src);
  assert.ok(!elements.some(v => ['form', 'input', 'button', 'img', 'iframe', 'object', 'embed'].includes(v.tag)), 'Reuse the current profile tool; no duplicate UI or provider embed');
  for (const type of ['Article', 'Hotel', 'Product', 'Offer', 'AggregateRating']) assert.equal(facts.documents.flatMap(doc => schemaNodes(doc, type)).length, 0);
  return { words, anchors };
}
const result = inspect(html);
for (const a of result.anchors.filter(a => a.attributes.href.startsWith('/'))) {
  const u = new URL(a.attributes.href, 'https://banffbound.com'), route = u.pathname.replace(/\/$/, '');
  if (route.startsWith('/blog/')) { const target = route.slice(6); assert.ok(d.originalPosts.some(p => p.slug === target)); assert.ok(!d.blogRedirects[target]); assert.equal(u.hash, ''); }
  else if (route.startsWith('/towns/')) { assert.ok(d.towns.some(t => t.slug === route.slice(7))); assert.equal(u.hash, ''); }
  else { let found; for (const file of ['src/pages' + route + '.astro', 'src/pages' + route + '/index.astro']) try { await access(path.join(root, file)); found = file; break; } catch {} assert.ok(found, 'Real owned route: ' + route); if (u.hash) assert.ok((await read(found)).includes(`id="${u.hash.slice(1)}"`), 'Real target fragment: ' + a.attributes.href); }
}
let negatives = 0;
function reject(name, changed) { assert.notEqual(changed, html, 'Fixture mutates actual output: ' + name); assert.throws(() => inspect(changed), name); negatives++; }
for (const claim of ['Rooms start at CAD 200.', 'We visited this trail.', 'Every trail is barrier-free.', 'Every scooter fits the buses.', 'All routes are cleared in winter.', 'Follow the river ice.', 'Moraine Lake has accessible parking.', 'A free track chair is waiting.', 'Accessible tour guaranteed.', 'All room categories are accessible.']) reject(claim, html.replace('</body>', `<p>${claim}</p></body>`));
for (const [from, to] of [
  ['1.9 km loop.', '1.9 km one way.'], ['83% hard soil; 15% hard aggregate/gravel; 2% wood-decking.', '100% paved.'],
  ['162 / 62 cm.', '62 / 162 cm.'], ['162 / 62 cm.', '162 / 62 m.'], ['3 / 26%.', '26 / 3%.'], ['3 / 21%.', '3 / 2%.'], ['237 m counterclockwise', '237 m clockwise'],
  ['Width: typical / minimum', 'Width: minimum / typical'], ['Grade: typical / maximum', 'Grade: maximum / typical'], ['Cross slope: typical / maximum', 'Cross slope: maximum / typical'],
  ['not a list of universally accessible routes', 'a list of universally accessible routes'], ['does not support calling the whole loop flat, paved or barrier-free', 'establishes a wholly flat paved loop'],
  ['not move off the designated path', 'move off the designated path'], ['not a winter opening confirmation', 'a guaranteed winter opening'], ['clifftop section is closed in winter', 'clifftop section is open in winter'],
  ['2.3 km one way', '2.3 km return'], ['does not establish a fully paved route', 'establishes a fully paved route'], ['rough paving followed by natural trail', 'smooth paving throughout'],
  ['0.3 km barrier-free trail from the upper parking lot', '0.3 km barrier-free trail from every public parking place'], ['restricted to accessible vehicles and buses', 'open to every vehicle'],
  ['summer-only viewing option', 'year-round cleared viewing option'], ['does not promise a cleared winter path', 'promises a cleared winter path'],
  ['driver may be unable to provide physical help', 'driver guarantees all physical help'], ['companions subject to space', 'unlimited guaranteed companions'],
  ['2026 Alpine Start product had no accessible service', '2026 Alpine Start product included accessible service'], ['ended October 12, 2026', 'operates all winter and 2027'],
  ['first-come, first-served and cannot be guaranteed', 'reserved and guaranteed'], ['Moraine Lake has no accessible parking', 'Moraine Lake has accessible parking'],
  ['not a promise that it is cleared today', 'proof that it is cleared today'], ['does not override a closure', 'overrides a closure'], ['scheduled December 11 end', 'confirmed reopening December 11'], ['Reopening is not confirmed here', 'Reopening is confirmed here'],
  ['no free all-terrain chair loan', 'a free all-terrain chair loan'], ['do not establish access along Marsh Trail', 'establish access along Marsh Trail'], ['368 shallow stairs each way and is not wheelchair accessible', 'a level wheelchair-accessible boardwalk'],
  ['not verified accessible-room inventory', 'verified accessible-room inventory'],
]) reject(from, html.replaceAll(from, to));
for (const url of Object.values(d.accessWalkGuideSources[slug])) reject('Source removed: ' + url, html.replaceAll(url, '/accessible-trails/'));
for (const [from, to] of [['camref=1101l3MtWX', 'camref=wrong'], ['partner_id=QW960HO', 'partner_id=wrong'], ['destination=Banff%2C+Alberta', 'destination=Calgary'], ['<summary>', '<summary>Changed: '], ['"@type":"FAQPage"', '"@type":"WebPage"'], ['#walk-profile', '#missing-section'], ['/accessible-trails/#trail-profiles', '/accessible-trails/#missing-profile']]) reject(from, html.replaceAll(from, to));
for (const unsafe of ['<iframe src="https://example.com"></iframe>', '<script src="https://example.com/sdk.js"></script>', '<form><input name="medical-details"></form>', '<p onclick="alert(1)">Visit</p>', '<a href="javascript:alert(1)">Book</a>', '<a href="/packing-list/">Outer<a href="/conditions/">Inner</a></a>']) reject('Unsafe or duplicate markup', html.replace('</body>', unsafe + '</body>'));
assert.throws(() => inspect(html, { ...d.accessWalkGuideMetadata[slug], date: d.reviewDate })); negatives++;
assert.throws(() => inspect(html, { ...d.accessWalkGuideMetadata[slug], imageIsIllustrative: false })); negatives++;
assert.throws(() => inspect(html, { ...d.accessWalkGuideMetadata[slug], title: '10 Wheelchair-Accessible Trails for All Abilities' })); negatives++;
const source = await read(sourceFile); assert.equal((source.match(/function faqs\(/g) || []).length, 1); assert.equal((source.match(/\$\{faqs\('/g) || []).length, 1); assert.ok(!/\bfetch\s*\(|process\.env|localStorage|sessionStorage|document\.cookie/.test(source));
const syntax = await transform(d.accessWalkGuideOverrides[slug], { filename: slug + '.astro' }); assert.deepEqual(syntax.diagnostics.filter(v => v.severity === 1), []);
const note = await read('research/access-walk-guide-sources-2026-10-29.md'); assert.ok(note.includes(publication)); for (const href of [...Object.values(d.accessWalkGuideSources[slug]), ...referrals]) assert.ok(note.includes(href), 'Source/referral recorded: ' + href);
console.log(`Access-walk guide checks passed: ${result.words} actual Astro-rendered words, five matching visible/schema FAQs, ${Object.keys(d.accessWalkGuideSources[slug]).length} primary source URLs, original publication and inherited affiliate URLs; literal physical-profile labels/values plus shared-model consistency, real native routes/fragments, ${negatives} negative regressions. No network, shared registration, site build or file output.`);
