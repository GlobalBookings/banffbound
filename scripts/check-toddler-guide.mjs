import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { transform } from '@astrojs/compiler';
import { experimental_AstroContainer } from 'astro/container';
import { htmlFacts, htmlElements, schemaNodes, normal } from './verify-cycling-consent-release.mjs';

globalThis.fetch = () => { throw Error('No network in toddler author checks'); };
const root = fileURLToPath(new URL('../', import.meta.url)), require = createRequire(import.meta.url);
const read = name => readFile(path.join(root, name), 'utf8');
const slug = 'banff-toddler-guide', publication = '2025-11-11';
const sourceFile = 'src/data/toddlerGuideOverrides.ts';
const original = (await read('src/data/blogPosts.ts')).match(/const originalBlogPosts:\s*BlogPost\[\]\s*=\s*(\[[\s\S]*?\n\]);/)?.[1];
assert.ok(original, 'Read untouched publication records before projected review metadata');
const bundle = await build({ stdin: { contents: `export * from './${sourceFile}';export { blogRedirects } from './src/data/redirects.mjs';export const originalPosts=${original};`, resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent' });
const d = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
for (const value of [d.toddlerGuideOverrides, d.toddlerGuideMetadata, d.toddlerGuideFaqs, d.toddlerGuideSources]) assert.deepEqual(Object.keys(value), [slug]);
assert.equal(d.reviewDate, '2026-10-29');
assert.equal(d.originalPosts.find(p => p.slug === slug)?.date, publication);
assert.ok(!Object.hasOwn(d.blogRedirects, slug));
const referrals = ['https://www.expedia.ca/Hotel-Search?destination=Banff%2C+Alberta&camref=1101l3MtWX', 'https://www.getyourguide.com/banff-l284/?partner_id=QW960HO'];
const rawBody = (await read('src/data/blogContent.ts')).match(new RegExp("['\"]" + slug + "['\"]\\s*:\\s*`([\\s\\S]*?)`"))?.[1];
assert.ok(rawBody);
assert.deepEqual([...new Set([...rawBody.matchAll(/href=["']([^"']+)["']/g)].map(v => v[1]))].sort(), [...referrals].sort(), 'Retain actual authored URLs, not inferred merchant offers');
assert.ok(!/\bid=["']/.test(rawBody), 'Original article has no fragment IDs to preserve');

// Exercise the real Astro set:html boundary in memory, without requiring shared
// registration, running a site build or opening a network connection.
const compiled = await transform('---\nconst { body } = Astro.props;\n---\n<article data-toddler-guide><Fragment set:html={body} /></article>', { filename: path.join(root, 'toddler-author-check.astro'), internalURL: 'astro/compiler-runtime', resultScopedSlot: true });
assert.deepEqual(compiled.diagnostics.filter(v => v.severity === 1), []);
const renderCode = compiled.code.replace(/,\s*createMetadata as \$\$createMetadata/, '').replace(/^export const \$\$metadata = [^\n]*\n/m, '');
const renderedModule = await build({ stdin: { contents: renderCode, loader: 'ts', resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent', plugins: [{ name: 'astro-runtime-only', setup(b) { b.onResolve({ filter: /^astro\// }, a => ({ path: pathToFileURL(require.resolve(a.path)).href, external: true })); } }] });
const Page = (await import('data:text/javascript;base64,' + Buffer.from(renderedModule.outputFiles[0].text).toString('base64'))).default;
const container = await experimental_AstroContainer.create();
const html = '<html><head></head><body>' + await container.renderToString(Page, { props: { body: d.toddlerGuideOverrides[slug] }, request: new Request('https://banffbound.com/blog/banff-toddler-guide/?child=PRIVATE_CHILD&age=PRIVATE_AGE&gclid=PRIVATE_CLICK') }) + '</body></html>';
const native = ['/family-guide/', '/trip-builder/', '/blog/where-to-stay-in-banff/', '/book/banff-hotels/', '/book/lake-louise-stays/', '/calgary-to-banff/', '/car-free-banff/', '/shuttle-reservations/', '/accessible-trails/', '/conditions/', '/blog/banff-family-winter/', '/blog/banff-hot-springs-guide/', '/blog/banff-mobile-connectivity/', '/packing-list/', '/blog/banff-first-time-tips/#first-visit-planner', '/trip-cost/'];
const required = {
  'toddler-day': ['one main outing', 'no universal nap clock', 'Three starting points', 'Town day', 'Lake day', 'Weather-change day', 'Remove an outing', 'does not provide childcare'],
  'toddler-room': ['actual cot or travel-crib product', 'age and size limits', 'not a replacement overnight sleep space', 'microwave, mini fridge and sink', 'rain shower with no bathtub', 'not a full cooking kitchen', 'One Bedroom Condo', 'a full kitchen', 'three-storey walk-up with no elevator', 'do not apply to every room', 'Village, lakeshore and ski-resort addresses are separate'],
  'toddler-food': ['first breakfast', 'current service', 'high chair', 'allergy questions', 'changing option', 'lockers'],
  'toddler-transport': ['separate booked seat for every child or infant', 'appropriate restraint and availability in advance', 'no onboard washrooms', 'scheduled service does not reach Lake Louise', 'permits children without car seats under its own policy', 'does not supply them', 'MCI coach seatbelts are not designed for infant or toddler car seats', 'Strollers may need folding', 'depends on space', 'vehicle-specific exemptions', 'legal exemption does not establish a suitable restraint arrangement', 'closed to personal vehicles year-round', 'specified authorized exceptions', 'summer shuttle is not a winter connection'],
  'toddler-outings': ['paved riverside pathway', 'clifftop section closed in winter', 'Rotary Park for ages 2–5', 'Central Park for ages 5–12', 'neither listing establishes equipment for a child under two', '1.9 km loop', 'minimum width of 62 cm', '2.3 km one way', 'Neither establishes the whole trail as a flat paved stroller route', 'summer profiles are not winter access reports', 'prohibits feeding, enticing or disturbing wildlife', 'Do not chase squirrels'],
  'toddler-winter': ['least active person', 'less active than the adult', 'manufacturer’s instructions', 'summer easy grade', 'Keep off unassessed natural ice and closed paths'],
  'toddler-indoor': ['111 Bear Street', 'holiday exceptions', 'Thursday–Monday winter opening', 'holiday and temporary closure blocks', 'swimming at Cave and Basin is prohibited', 'October 13 to early November, 2026', 'Reopening is unconfirmed here', 'does not recommend strollers', '368 shallow stairs each way', 'does not make the boardwalk step-free', 'Cabins are unheated'],
  'toddler-return': ['full journey', 'Save contacts and confirmations offline', 'actual people, nights', 'does not by itself establish a free room, cot, seat or activity', 'general destination searches', 'not verified toddler-eligible products', 'may earn a commission'],
  'toddler-sources': ['Checked October 29, 2026', 'not an inspection, live reservation, cleared winter path or individual equipment fit'],
};
const forbidden = /\$\s*\d|\bCAD\s*\d|\d+\s*%|\b(?:I|we) (?:visited|stayed|tested)|during my last visit|guaranteed (?:availability|views|sleep|safety)|chasing squirrels|let (?:your )?toddler (?:throw rocks|wade|chase)|all trails are stroller.friendly|all toddlers can|every family room includes a cot|free cots at every hotel|nap (?:12:30|at noon)|walk on (?:the )?frozen lake|safe at any temperature|every rental requires the same child seat by law|Roam supplies child seats/i;
function inspect(output, meta = d.toddlerGuideMetadata[slug]) {
  assert.deepEqual(Object.keys(meta).sort(), ['title', 'description', 'lastUpdated', 'readTime', 'imageIsIllustrative', 'imageNote'].sort());
  assert.equal(meta.lastUpdated, d.reviewDate); assert.equal(meta.imageIsIllustrative, true); assert.match(meta.imageNote, /Illustrative.*not verified/); assert.ok(meta.description.length > 100);
  const facts = htmlFacts(output), elements = htmlElements(output), words = facts.text.split(/\s+/).length;
  assert.ok(words >= 1700 && words <= 3000, `Substantive bounded guide (${words} words)`);
  assert.ok(!forbidden.test(facts.text), 'Reject invented prices, universal suitability, wildlife disturbance, unsafe ice and personal claims');
  assert.ok(!/PRIVATE_CHILD|PRIVATE_AGE|PRIVATE_CLICK/.test(output), 'Request inputs do not enter static authored HTML');
  assert.ok(facts.text.includes('Full guide reviewed October 29, 2026'));
  assert.ok(facts.text.includes('hero image is illustrative'));
  const headings = elements.filter(v => v.tag === 'h2'), ids = elements.map(v => v.attributes.id).filter(Boolean);
  assert.equal(ids.length, new Set(ids).size);
  for (const [id, markers] of Object.entries(required)) {
    const heading = headings.find(v => v.attributes.id === id); assert.ok(heading, id);
    const next = headings.find(v => v.start > heading.end);
    const text = normal(output.slice(heading.start, next?.start ?? output.length).replace(/<[^>]*>/g, ' '));
    for (const marker of markers) assert.ok(text.toLowerCase().includes(marker.toLowerCase()), `${id}: ${marker}`);
  }
  assert.equal(elements.filter(v => v.tag === 'nav').length, 1);
  assert.equal(elements.filter(v => v.tag === 'table').length, 2);
  const anchors = elements.filter(v => v.tag === 'a'), primary = Object.values(d.toddlerGuideSources[slug]);
  for (const a of anchors) {
    const href = a.attributes.href; assert.ok(href); assert.ok(!Object.keys(a.attributes).some(k => /^on/i.test(k)));
    assert.ok(!anchors.some(p => p !== a && a.start >= p.openEnd && a.end <= p.innerEnd), 'No nested anchor corruption');
    if (href.startsWith('#')) assert.ok(ids.includes(href.slice(1)), 'Existing navigation fragment');
    else if (!href.startsWith('/')) {
      assert.equal(new URL(href).protocol, 'https:'); assert.ok([...primary, ...referrals].includes(href), 'Declared exact primary or inherited URL');
      assert.equal(a.attributes.target, '_blank'); assert.ok(a.attributes.rel?.split(/\s+/).includes('noopener'));
      assert.equal(a.attributes.rel?.split(/\s+/).includes('sponsored'), referrals.includes(href));
    }
  }
  for (const href of [...primary, ...referrals, ...native]) assert.ok(anchors.some(v => v.attributes.href === href), 'Required useful source/native link: ' + href);
  assert.deepEqual([...new Set(anchors.filter(v => v.attributes.rel?.split(/\s+/).includes('sponsored')).map(v => v.attributes.href))].sort(), [...referrals].sort());
  const schemas = facts.documents.flatMap(doc => schemaNodes(doc, 'FAQPage'));
  assert.equal(schemas.length, 1); assert.equal(schemas[0].mainEntity.length, 5); assert.equal(facts.details.length, 5);
  for (const [i, faq] of d.toddlerGuideFaqs[slug].entries()) {
    const item = schemas[0].mainEntity[i]; assert.equal(item['@type'], 'Question'); assert.equal(item.acceptedAnswer['@type'], 'Answer');
    assert.equal(normal(item.name), normal(faq.question)); assert.equal(normal(item.acceptedAnswer.text), normal(faq.answer));
    assert.equal(facts.details[i].question, normal(faq.question)); assert.equal(facts.details[i].answer, normal(faq.answer));
  }
  const scripts = elements.filter(v => v.tag === 'script'); assert.equal(scripts.length, 1); assert.equal(scripts[0].attributes.type, 'application/ld+json'); assert.ok(!scripts[0].attributes.src);
  assert.ok(!elements.some(v => ['iframe', 'form', 'input', 'button', 'img', 'object', 'embed'].includes(v.tag)), 'Use the existing family planner; no new tool or provider embed');
  for (const type of ['Article', 'Hotel', 'Product', 'Offer', 'AggregateRating']) assert.equal(facts.documents.flatMap(doc => schemaNodes(doc, type)).length, 0);
  return { words, anchors };
}
const result = inspect(html);
const syntax = await transform(d.toddlerGuideOverrides[slug], { filename: slug + '.astro' }); assert.deepEqual(syntax.diagnostics.filter(v => v.severity === 1), []);
for (const a of result.anchors.filter(a => a.attributes.href.startsWith('/'))) {
  const u = new URL(a.attributes.href, 'https://banffbound.com'), route = u.pathname.replace(/\/$/, '');
  if (route.startsWith('/blog/')) {
    const target = route.slice(6); assert.ok(d.originalPosts.some(p => p.slug === target)); assert.ok(!d.blogRedirects[target]);
    if (u.hash) { assert.equal(target, 'banff-first-time-tips'); assert.equal(u.hash, '#first-visit-planner'); assert.ok((await read('src/components/FirstVisitPlanningInteractions.astro')).includes('id="first-visit-planner"')); }
  } else {
    let found; for (const file of ['src/pages' + route + '.astro', 'src/pages' + route + '/index.astro']) try { await access(path.join(root, file)); found = file; break; } catch {}
    assert.ok(found, 'Existing native route ' + route); if (u.hash) assert.ok((await read(found)).includes(`id="${u.hash.slice(1)}"`));
  }
}
let negatives = 0;
const mustReject = (name, mutated, meta) => { assert.notEqual(mutated, html, 'Mutation changes actual rendered output: ' + name); assert.throws(() => inspect(mutated, meta), name); negatives++; };
for (const claim of ['Rooms cost CAD 150.', 'Save 20%.', 'We stayed here last winter.', 'All trails are stroller-friendly.', 'Every family room includes a cot.', 'Roam supplies child seats.', 'Nap at noon every day.', 'Let your toddler wade in the lake.', 'The day ends with chasing squirrels.', 'Walk on the frozen lake.', 'Your child is safe at any temperature.']) mustReject(claim, html.replace('</body>', `<p>${claim}</p></body>`));
for (const [before, after] of [
  ['no universal nap clock', 'a universal nap clock'], ['does not provide childcare', 'includes childcare'],
  ['actual cot or travel-crib product', 'guaranteed cot in every room'], ['age and size limits', 'no equipment limits'],
  ['not a replacement overnight sleep space', 'an overnight sleep space'], ['rain shower with no bathtub', 'bathtub in every suite'],
  ['not a full cooking kitchen', 'a full cooking kitchen'], ['three-storey walk-up with no elevator', 'step-free elevator building'],
  ['separate booked seat for every child or infant', 'infants may ride on laps'], ['appropriate restraint and availability in advance', 'automatic restraints without arranging'],
  ['no onboard washrooms', 'onboard washrooms'], ['scheduled service does not reach Lake Louise', 'scheduled service reaches Lake Louise'],
  ['permits children without car seats under its own policy', 'requires identical car seats on all services'], ['does not supply them', 'supplies them'],
  ['Strollers may need folding', 'Strollers never need folding'], ['depends on space', 'is always guaranteed'],
  ['vehicle-specific exemptions', 'identical rules for every vehicle'], ['legal exemption does not establish a suitable restraint arrangement', 'legal exemption establishes a suitable restraint arrangement'],
  ['closed to personal vehicles year-round', 'open to rental vehicles in summer'], ['summer shuttle is not a winter connection', 'summer shuttle operates in winter'],
  ['clifftop section closed in winter', 'clifftop section open in winter'], ['Rotary Park for ages 2–5', 'Rotary Park for all babies'], ['Central Park for ages 5–12', 'Central Park for ages 1–3'],
  ['minimum width of 62 cm', 'minimum width of 162 cm'], ['1.9 km loop', '1 km loop'], ['2.3 km one way', '2.3 km return'],
  ['Neither establishes the whole trail as a flat paved stroller route', 'Both establish a flat paved stroller route'], ['summer profiles are not winter access reports', 'summer profiles prove winter access'],
  ['prohibits feeding, enticing or disturbing wildlife', 'permits feeding small wildlife'], ['Do not chase squirrels', 'Chase squirrels'],
  ['Keep off unassessed natural ice and closed paths', 'Walk on unassessed natural ice'], ['Thursday–Monday winter opening', 'daily winter opening'],
  ['swimming at Cave and Basin is prohibited', 'swimming at Cave and Basin is permitted'], ['October 13 to early November, 2026', 'guaranteed open October 30, 2026'],
  ['Reopening is unconfirmed here', 'Reopening is confirmed here'], ['does not recommend strollers', 'recommends strollers'],
  ['368 shallow stairs each way', 'a step-free boardwalk'], ['does not make the boardwalk step-free', 'makes the boardwalk step-free'], ['Cabins are unheated', 'Cabins are heated'],
  ['does not by itself establish a free room, cot, seat or activity', 'establishes a free room, cot, seat and activity'], ['not verified toddler-eligible products', 'verified toddler-eligible products'],
]) mustReject(before, html.replaceAll(before, after));
for (const source of Object.values(d.toddlerGuideSources[slug])) mustReject('Source removed: ' + source, html.replaceAll(source, '/family-guide/'));
for (const [before, after] of [['camref=1101l3MtWX', 'camref=wrong'], ['partner_id=QW960HO', 'partner_id=wrong'], ['destination=Banff%2C+Alberta', 'destination=Calgary'], ['<summary>', '<summary>Changed question: '], ['"@type":"FAQPage"', '"@type":"WebPage"'], ['#toddler-food', '#missing-section']]) mustReject(before, html.replaceAll(before, after));
for (const unsafe of ['<iframe src="https://example.com"></iframe>', '<script src="https://example.com/sdk.js"></script>', '<form><input name="child-name"></form>', '<a href="javascript:alert(1)">Book</a>', '<a href="/family-guide/" onclick="alert(1)">Go</a>', '<a href="/family-guide/">Outer <a href="/packing-list/">Inner</a></a>']) mustReject('Unsafe/duplicate markup', html.replace('</body>', unsafe + '</body>'));
assert.throws(() => inspect(html, { ...d.toddlerGuideMetadata[slug], date: d.reviewDate })); negatives++;
assert.throws(() => inspect(html, { ...d.toddlerGuideMetadata[slug], imageIsIllustrative: false })); negatives++;
const source = await read(sourceFile); assert.equal((source.match(/function faqs\(/g) || []).length, 1); assert.equal((source.match(/\$\{faqs\('/g) || []).length, 1); assert.ok(!/\bfetch\s*\(|process\.env|localStorage|sessionStorage|document\.cookie/.test(source));
const note = await read('research/toddler-guide-sources-2026-10-29.md');
assert.ok(note.includes(publication)); for (const href of [...Object.values(d.toddlerGuideSources[slug]), ...referrals]) assert.ok(note.includes(href), 'Evidence inventory: ' + href);
console.log(`Toddler guide checks passed: ${result.words} actual Astro-rendered words, five identical visible/schema FAQs, ${Object.keys(d.toddlerGuideSources[slug]).length} primary source URLs, original publication and exact inherited referrals, real native routes/fragments, ${negatives} independent negative regressions. No network, shared registration, site build or file output.`);
