import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { transform } from '@astrojs/compiler';
import { experimental_AstroContainer } from 'astro/container';
import { htmlFacts, htmlElements, schemaNodes, normal } from './verify-cycling-consent-release.mjs';

globalThis.fetch = () => { throw Error('No network in stay-decision author checks'); };
const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const sourceFile = 'src/data/stayDecisionGuideOverrides.ts';
const postSource = await readFile(path.join(root, 'src/data/blogPosts.ts'), 'utf8');
const raw = postSource.match(/const originalBlogPosts:\s*BlogPost\[\]\s*=\s*(\[[\s\S]*?\n\]);/)?.[1];
assert.ok(raw, 'Read original publication records rather than projected dates.');
const bundle = await build({ stdin: { contents: `export * from './${sourceFile}';export { blogContent as legacyContent } from './src/data/blogContent.ts';export { blogRedirects } from './src/data/redirects.mjs';export { towns } from './src/data/towns.ts';export const originalPosts=${raw};`, resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent' });
const d = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const publications = { 'where-to-stay-in-banff': '2026-01-10', 'banff-hostel-guide': '2026-01-08' };
const slugs = Object.keys(publications);
const inheritedSearch = 'https://www.expedia.ca/Hotel-Search?destination=Banff%2C+Alberta&camref=1101l3MtWX';
const inherited = { 'where-to-stay-in-banff': [], 'banff-hostel-guide': [inheritedSearch] };
for (const value of [d.stayDecisionGuideOverrides, d.stayDecisionGuideMetadata, d.stayDecisionGuideFaqs, d.stayDecisionGuideSources]) assert.deepEqual(Object.keys(value), slugs);
assert.equal(d.reviewDate, '2026-10-29');

const fragment = await transform('---\nconst { body } = Astro.props;\n---\n<article data-stay-decision-guide><Fragment set:html={body} /></article>', { filename: path.join(root, 'stay-decision-author-check.astro'), internalURL: 'astro/compiler-runtime', resultScopedSlot: true });
assert.deepEqual(fragment.diagnostics.filter(v => v.severity === 1), []);
const renderCode = fragment.code.replace(/,\s*createMetadata as \$\$createMetadata/, '').replace(/^export const \$\$metadata = [^\n]*\n/m, '');
const renderBundle = await build({ stdin: { contents: renderCode, loader: 'ts', resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent', plugins: [{ name: 'astro-runtime-only', setup(b) { b.onResolve({ filter: /^astro\// }, a => ({ path: pathToFileURL(require.resolve(a.path)).href, external: true })); } }] });
const Page = (await import('data:text/javascript;base64,' + Buffer.from(renderBundle.outputFiles[0].text).toString('base64'))).default;
const container = await experimental_AstroContainer.create();
const bodies = {};
for (const slug of slugs) bodies[slug] = '<html><head></head><body>' + await container.renderToString(Page, { props: { body: d.stayDecisionGuideOverrides[slug] }, request: new Request(`https://banffbound.com/blog/${slug}/?email=PRIVATE_EMAIL&gclid=PRIVATE_CLICK`) }) + '</body></html>';
const requirements = {
  'where-to-stay-in-banff': {
    'stay-base': ['Central Banff', 'Canmore', 'Lake Louise village', 'Lake Louise lakeshore', 'A location comparison', 'two essential mornings', 'checkout, bags'],
    'stay-banff': ['405 Spray Avenue', 'its own resort address', 'microwave, mini fridge and sink', 'not a full cooking kitchen', 'One Bedroom Condo', 'Superior Suite'],
    'stay-canmore': ['not because the name guarantees savings', 'regional service', 'Two Bedroom Suite', 'no shuttle or on-site restaurant', 'Harvie Heights or Dead Man’s Flats address is not downtown Canmore'],
    'stay-louise': ['Lake Louise village is not ski-in/ski-out accommodation', 'three-storey walk-up', 'no elevator', 'double pullout sofa', 'winter schedules and pickup locations would be posted shortly'],
    'stay-nearby': ['Castle Junction', 'Field and Yoho', 'Golden', 'Kananaskis', 'no public transportation in Yoho National Park', 'upper village', 'base-area check-in and luggage handling', 'cannot drive up the restricted access road', 'After-hours transport needs advance arrangements'],
    'stay-room': ['Separate beds', 'Stovetop or oven', 'Building, floor, lift', 'drying arrangements', 'actual category'],
    'stay-winter': ['Banff and Canmore', 'Not every airport service continues to Lake Louise', 'first-come seats', 'local guest transit pass does not automatically include regional travel', 'luggage'],
    'stay-quote': ['same people, dates and nights', 'unresolved cost', 'actual rate', 'does not establish a particular discount'],
    'stay-book': ['exact room', 'rate conditions', 'labels the scope of checked information'],
  },
  'banff-hostel-guide': {
    'hostel-choice': ['A bed booking', 'private room and a privatized dorm', 'whole room', 'quiet hours'],
    'hostel-hi-banff': ['801 Hidden Ridge Way', 'year-round operation', 'local transit pass', 'kitchen', 'ski and bicycle storage', 'government photo ID for each guest', 'children 12 and under', 'accompanied ages 13–17'],
    'hostel-samesun': ['433 Banff Avenue', '18 or older', 'two pieces of ID', 'reception closes at midnight', 'limited parking'],
    'hostel-international': ['private suites for groups with bunks', 'before 11 am', 'source review did not establish', 'Do not apply HI membership'],
    'hostel-louise': ['203 Village Road', 'not at the lakeshore or on the ski resort', 'Bill Peyto’s Café', 'family, ID and pre-check-in storage'],
    'hostel-wilderness': ['Highway 93 North', 'limited solar electricity', 'no running water, showers or flush toilets', 'drinking water supplied in tanks', 'October 18–November 12, 2026 closed', 'Tuesday closures', 'cannot accommodate arrivals outside them', 'not dependable connectivity', 'does not establish road access'],
    'hostel-arrival': ['final walk', 'leaving bags before check-in', 'actual storage arrangements', 'local transit benefit does not automatically reach the mountain', 'alternative if cooking is not available'],
    'hostel-budget': ['per bed or per room', 'same currency and party', 'not a guaranteed amount saved', 'Banff destination results', 'does not confirm that these named hostels are listed or available', 'commission'],
  },
};
const requiredInternal = {
  'where-to-stay-in-banff': ['/towns/', '/winter-stays/', '/book/banff-hotels/', '/book/lake-louise-stays/', '/towns/canmore/#where-to-stay', '/towns/lake-louise/', '/ski-day-planner/', '/trip-cost/', '/hotel-directory/', '/blog/banff-hostel-guide/'],
  'banff-hostel-guide': ['/blog/where-to-stay-in-banff/', '/blog/lake-louise-village-guide/', '/book/lake-louise-stays/', '/book/banff-hotels/', '/learn-to-ski/', '/ski-day-planner/', '/trip-cost/', '/packing-list/', '/icefields-parkway-planner/', '/eat-and-drink/#dining-finder'],
};
const forbidden = /\$\s*\d|\bCAD\s*\d|\d+\s*[%％]|\b(?:I|we) (?:visited|stayed|experienced)|during my last visit|guaranteed (?:savings|availability|quiet|bed)|Canmore is always cheaper|all hostels (?:are|have|include)|all dorms accept children|every hotel includes a ski shuttle|all Lake Louise hotels are lakeside|kitchen saves \d|fixed nightly discount|Mosquito Creek is open year-round|no electricity at Mosquito Creek|Tunnel Mountain Resort has a hot tub/i;
function inspect(slug, html, metadata = d.stayDecisionGuideMetadata[slug]) {
  assert.deepEqual(Object.keys(metadata).sort(), ['title','description','lastUpdated','readTime','imageIsIllustrative','imageNote'].sort());
  assert.equal(metadata.lastUpdated, d.reviewDate); assert.equal(metadata.imageIsIllustrative, true); assert.match(metadata.imageNote, /Illustrative.*not verified/i); assert.ok(metadata.description.length > 100);
  const facts = htmlFacts(html), elements = htmlElements(html), words = facts.text.split(/\s+/).length;
  assert.ok(words >= 1500 && words <= 2300, `${slug}: bounded useful guide, ${words} words`);
  assert.ok(!forbidden.test(facts.text), 'No invented market/safety/personal/facility claim');
  assert.ok(!/PRIVATE_EMAIL|PRIVATE_CLICK/.test(html), 'Request inputs cannot enter authored HTML');
  const headings = elements.filter(e => e.tag === 'h2');
  for (const [id, markers] of Object.entries(requirements[slug])) {
    const h = headings.find(e => e.attributes.id === id); assert.ok(h, id);
    const next = headings.find(e => e.start > h.end);
    const section = normal(html.slice(h.end, next?.start ?? html.length).replace(/<[^>]*>/g, ' ')).toLowerCase();
    for (const marker of markers) assert.ok(section.includes(marker.toLowerCase()), `${slug} ${id}: ${marker}`);
  }
  const ids = elements.map(e => e.attributes.id).filter(Boolean); assert.equal(ids.length, new Set(ids).size);
  assert.equal(elements.filter(e => e.tag === 'nav').length, 1);
  assert.equal(elements.filter(e => e.tag === 'table').length, slug === slugs[0] ? 2 : 1);
  const anchors = elements.filter(e => e.tag === 'a'), primary = Object.values(d.stayDecisionGuideSources[slug]);
  for (const a of anchors) {
    const href = a.attributes.href; assert.ok(href);
    assert.ok(!anchors.some(p => p !== a && a.start >= p.openEnd && a.end <= p.innerEnd), 'No nested anchors');
    if (href.startsWith('#')) assert.ok(ids.includes(href.slice(1)), 'Working navigation ' + href);
    else if (!href.startsWith('/')) {
      assert.equal(new URL(href).protocol, 'https:'); assert.ok([...primary, ...inherited[slug]].includes(href), 'Only exact primary or inherited merchant URL');
      assert.equal(a.attributes.target, '_blank'); const rel = (a.attributes.rel || '').split(/\s+/); assert.ok(rel.includes('noopener')); assert.equal(rel.includes('sponsored'), inherited[slug].includes(href));
    }
  }
  for (const href of [...primary, ...inherited[slug], ...requiredInternal[slug]]) assert.ok(anchors.some(a => a.attributes.href === href), 'Required useful source/handoff: ' + href);
  assert.deepEqual([...new Set(anchors.filter(a => (a.attributes.rel || '').split(/\s+/).includes('sponsored')).map(a => a.attributes.href))], inherited[slug], 'Exact inherited active affiliate set');
  const schemas = facts.documents.flatMap(doc => schemaNodes(doc, 'FAQPage'));
  assert.equal(schemas.length, 1); assert.equal(facts.details.length, 5); assert.equal(schemas[0].mainEntity.length, 5);
  for (const [i, faq] of d.stayDecisionGuideFaqs[slug].entries()) {
    const item = schemas[0].mainEntity[i]; assert.equal(item['@type'], 'Question'); assert.equal(item.acceptedAnswer['@type'], 'Answer');
    assert.equal(normal(item.name), normal(faq.question)); assert.equal(normal(item.acceptedAnswer.text), normal(faq.answer));
    assert.equal(facts.details[i].question, normal(faq.question)); assert.equal(facts.details[i].answer, normal(faq.answer));
  }
  assert.equal(elements.filter(e => e.tag === 'script').length, 1); assert.ok(elements.filter(e => e.tag === 'script').every(e => e.attributes.type === 'application/ld+json' && !e.attributes.src));
  assert.ok(!elements.some(e => ['iframe','form','object','embed'].includes(e.tag)));
  for (const type of ['Article','Hotel','Product','Offer','AggregateRating']) assert.equal(facts.documents.flatMap(doc => schemaNodes(doc, type)).length, 0);
  return { words, anchors };
}
const results = [];
for (const slug of slugs) {
  assert.equal(d.originalPosts.find(p => p.slug === slug)?.date, publications[slug]); assert.ok(!d.blogRedirects[slug]);
  const legacy = htmlFacts('<html><body>' + d.legacyContent[slug] + '</body></html>');
  assert.deepEqual([...new Set(legacy.links.filter(url => url.startsWith('https:')))], inherited[slug], 'Original authored merchant URLs checked before replacement');
  const result = inspect(slug, bodies[slug]); results.push(`${slug}: ${result.words} words`);
  const compiledFragment = await transform(d.stayDecisionGuideOverrides[slug], { filename: slug + '.astro' }); assert.deepEqual(compiledFragment.diagnostics.filter(v => v.severity === 1), []);
  for (const a of result.anchors.filter(a => a.attributes.href.startsWith('/'))) {
    const url = new URL(a.attributes.href, 'https://banffbound.com'), route = url.pathname.replace(/\/$/, '');
    if (route.startsWith('/blog/')) { const name = route.slice(6); assert.ok(d.originalPosts.some(p => p.slug === name), name); assert.ok(!d.blogRedirects[name]); }
    else if (route.startsWith('/towns/')) { assert.ok(d.towns.some(t => t.slug === route.slice(7))); if (url.hash) assert.ok((await readFile(path.join(root, 'src/pages/towns/[slug].astro'), 'utf8')).includes(`id="${url.hash.slice(1)}"`)); }
    else { let found; for (const f of [path.join(root, 'src/pages', route + '.astro'), path.join(root, 'src/pages', route, 'index.astro')]) try { await access(f); found = f; break; } catch {} assert.ok(found, route); if (url.hash) assert.ok((await readFile(found, 'utf8')).includes(`id="${url.hash.slice(1)}"`)); }
  }
  for (const text of ['Rooms start at CAD 120.','Canmore is always cheaper.','Save 30%.','We stayed here last winter.','Every hotel includes a ski shuttle.','Mosquito Creek is open year-round.']) assert.throws(() => inspect(slug, bodies[slug].replace('</body>', `<p>${text}</p></body>`)), text);
  for (const [from, to] of slug === slugs[0] ? [
    ['Lake Louise village is not ski-in/ski-out accommodation','Lake Louise village is ski-in/ski-out accommodation'],
    ['not a full cooking kitchen','a full cooking kitchen'], ['no shuttle or on-site restaurant','a shuttle and on-site restaurant'],
    ['cannot drive up the restricted access road','can drive up to the lodge'], ['no public transportation in Yoho National Park','regular public transport in Yoho National Park'],
  ] : [
    ['18 or older','16 or older'], ['reception closes at midnight','arrive any time'], ['no running water, showers or flush toilets','running water, showers and flush toilets'],
    ['October 18–November 12, 2026 closed','open throughout autumn 2026'], ['does not confirm that these named hostels are listed or available','confirms every listed hostel is available'],
  ]) { assert.ok(bodies[slug].includes(from), 'Mutate actual text'); assert.throws(() => inspect(slug, bodies[slug].replaceAll(from, to)), from); }
  assert.throws(() => inspect(slug, bodies[slug], { ...d.stayDecisionGuideMetadata[slug], date: d.reviewDate }));
  assert.throws(() => inspect(slug, bodies[slug].replace('<summary>', '<summary>Different question: ')));
  assert.throws(() => inspect(slug, bodies[slug].replace('"@type":"FAQPage"', '"@type":"WebPage"')));
  const source = Object.values(d.stayDecisionGuideSources[slug])[0]; assert.throws(() => inspect(slug, bodies[slug].replaceAll(source, '/towns/')));
}
assert.throws(() => inspect(slugs[1], bodies[slugs[1]].replace('camref=1101l3MtWX', 'camref=wrong')));
const source = await readFile(path.join(root, sourceFile), 'utf8'); assert.equal((source.match(/function faqs\(/g) || []).length, 1); assert.equal((source.match(/\$\{faqs\('/g) || []).length, 2); assert.ok(!/\bfetch\s*\(|process\.env|localStorage|sessionStorage|document\.cookie/.test(source));
const note = await readFile(path.join(root, 'research/stay-decision-guide-sources-2026-10-29.md'), 'utf8');
for (const slug of slugs) { assert.ok(note.includes(publications[slug])); for (const url of Object.values(d.stayDecisionGuideSources[slug])) assert.ok(note.includes(url), 'Source recorded ' + url); }
assert.ok(note.includes(inheritedSearch));
console.log('Stay-decision guide checks passed: ' + results.join('; ') + '. Two actual Astro-rendered HTML bodies; ten matching visible/schema FAQs; exact original dates and inherited affiliate set; real internal routes/fragments; room/base/transport/age/arrival/wilderness boundaries and negative regressions. No network, site build, registry requirement or file output.');
