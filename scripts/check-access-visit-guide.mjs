import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { transform } from '@astrojs/compiler';
import { experimental_AstroContainer } from 'astro/container';
import { htmlFacts, htmlElements, schemaNodes, normal } from './verify-cycling-consent-release.mjs';

globalThis.fetch = () => { throw Error('No network in access-visit author checks'); };
const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const sourceFile = 'src/data/accessVisitGuideOverrides.ts';
const postSource = await readFile(path.join(root, 'src/data/blogPosts.ts'), 'utf8');
const raw = postSource.match(/const originalBlogPosts:\s*BlogPost\[\]\s*=\s*(\[[\s\S]*?\n\]);/)?.[1];
assert.ok(raw, 'Read original publication records rather than projected dates.');
const bundle = await build({ stdin: { contents: `export * from './${sourceFile}';export { blogContent as legacyContent } from './src/data/blogContent.ts';export { blogRedirects } from './src/data/redirects.mjs';export { towns } from './src/data/towns.ts';export { hotels } from './src/data/hotels.ts';export const originalPosts=${raw};`, resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent' });
const d = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const publications = { 'accessible-banff': '2026-02-08' };
const slugs = Object.keys(publications);
const inheritedSearch = 'https://www.expedia.ca/Hotel-Search?destination=Banff%2C+Alberta&camref=1101l3MtWX';
const activitySearch = 'https://www.getyourguide.com/banff-l284/?partner_id=QW960HO';
const inherited = { 'accessible-banff': [inheritedSearch, activitySearch] };
for (const value of [d.accessVisitGuideOverrides, d.accessVisitGuideMetadata, d.accessVisitGuideFaqs, d.accessVisitGuideSources]) assert.deepEqual(Object.keys(value), slugs);
assert.equal(d.reviewDate, '2026-10-29');

const fragment = await transform('---\nconst { body } = Astro.props;\n---\n<article data-access-visit-guide><Fragment set:html={body} /></article>', { filename: path.join(root, 'access-visit-author-check.astro'), internalURL: 'astro/compiler-runtime', resultScopedSlot: true });
assert.deepEqual(fragment.diagnostics.filter(v => v.severity === 1), []);
const renderCode = fragment.code.replace(/,\s*createMetadata as \$\$createMetadata/, '').replace(/^export const \$\$metadata = [^\n]*\n/m, '');
const renderBundle = await build({ stdin: { contents: renderCode, loader: 'ts', resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent', plugins: [{ name: 'astro-runtime-only', setup(b) { b.onResolve({ filter: /^astro\// }, a => ({ path: pathToFileURL(require.resolve(a.path)).href, external: true })); } }] });
const Page = (await import('data:text/javascript;base64,' + Buffer.from(renderBundle.outputFiles[0].text).toString('base64'))).default;
const container = await experimental_AstroContainer.create();
const bodies = {};
for (const slug of slugs) bodies[slug] = '<html><head></head><body>' + await container.renderToString(Page, { props: { body: d.accessVisitGuideOverrides[slug] }, request: new Request(`https://banffbound.com/blog/${slug}/?email=PRIVATE_EMAIL&gclid=PRIVATE_CLICK`) }) + '</body></html>';
const requirements = {
  'accessible-banff': {
    'access-objective': ['one main experience', 'do not need to publish private details', 'An elevator in a building does not describe the walk'],
    'access-airport': ['airline assistance between the aircraft/gate and public areas', 'airport assistance between public areas and the curb', 'actual vehicle', 'motor coaches are not wheelchair accessible', 'return to the airport'],
    'access-transport': ['some devices, especially larger scooters', 'purchased shuttle ticket', 'companions subject to space', '2026 Alpine Start product had no accessible service', 'drivers may have their own physical limitations', '2026 lake-shuttle season ended October 12', 'does not create winter Moraine Lake service or a 2027 timetable'],
    'access-room': ['category and layout', 'bed height', 'Two queens', 'portable shower chair on request', 'approximate 86 cm bathroom doorway', 'patio is not wheelchair accessible', 'steps/stairs and no motorized lift', 'Fairmont Queen Mobility Accessible Rollin Shower', 'main building', 'not a hotel-wide assessment or available rooms'],
    'access-facilities': ['31 inches wide by 41 inches long', '320 kg total weight', '368 shallow stairs each way', 'indoor/outdoor heritage visit', 'October 13 to early November', 'does not confirm reopening', 'personal wheelchairs cannot enter the spring water', 'Do not assume a chair or staff transfer is automatically available'],
    'access-support': ['needed support person', 'depends on that support', 'no documentation or Access 2 Card', 'not a universal free visitor pass', 'at least five business days ahead', 'site-specific health, safety and operational limits', 'do not need your diagnosis'],
    'access-adaptive': ['lessons, experiences, programs and equipment rentals', 'does not automatically include instruction', 'does not allocate an adaptive lesson', 'does not verify free all-terrain chair loans', 'not an accepted lesson'],
    'access-season': ['not a winter clearance report', 'Equipment does not remove those changes', 'actual venue’s access', 'complete approach and return', 'room-access deadline'],
    'access-booking': ['keep missing amounts unknown', 'not a confirmed accessible room', 'not a verified access-approved tour list', 'commission', 'not a public accessibility score'],
  },
};
const requiredInternal = { 'accessible-banff': ['/accessible-trails/#trail-profiles','/calgary-to-banff/','/shuttle-reservations/','/car-free-banff/','/book/banff-hotels/','/book/lake-louise-stays/','/towns/','/park-pass/','/learn-to-ski/#lesson-fit','/ski-day-planner/','/blog/rainy-day-banff/','/blog/banff-mobile-connectivity/','/trip-cost/'] };
const forbidden = /\$\s*\d|\bCAD\s*\d|\d+\s*[%％]|\b(?:I|we) (?:visited|stayed|experienced)|during my last visit|all hotels are wheelchair accessible|all shuttles accommodate every wheelchair|Brewster motor coaches are wheelchair accessible|Moose pool has a motorized lift|every accessible room includes a shower chair|free all-terrain chairs are guaranteed|all visitors with disabilities enter free|Access 2 Card is required for Parks support-person admission|staff will transfer you into the pool|wheelchair-friendly in all seasons|accessible parking guarantees trail access|the gondola boardwalk is wheelchair accessible|a ramp guarantees device fit|the 2027 lake shuttle runs every|Upper Hot Springs is confirmed open|all adaptive equipment is free/i;
function inspect(slug, html, metadata = d.accessVisitGuideMetadata[slug]) {
  assert.deepEqual(Object.keys(metadata).sort(), ['title','description','lastUpdated','readTime','imageIsIllustrative','imageNote'].sort());
  assert.equal(metadata.lastUpdated, d.reviewDate); assert.equal(metadata.imageIsIllustrative, true); assert.match(metadata.imageNote, /Illustrative.*not verified/i); assert.ok(metadata.description.length > 100);
  const facts = htmlFacts(html), elements = htmlElements(html), words = facts.text.split(/\s+/).length;
  assert.ok(words >= 1500 && words <= 2300, `${slug}: bounded useful guide, ${words} words`);
  assert.ok(!forbidden.test(facts.text), 'No invented market/safety/personal/facility claim');
  assert.ok(!/PRIVATE_EMAIL|PRIVATE_CLICK/.test(html), 'Request inputs cannot enter authored HTML');
  const headings = elements.filter(e => e.tag === 'h2');
  for (const [id, markers] of Object.entries(requirements[slug])) {
    const h = headings.find(e => e.attributes.id === id); assert.ok(h && !h.hidden, id);
    const next = headings.find(e => e.start > h.end);
    const section = normal(html.slice(h.end, next?.start ?? html.length).replace(/<[^>]*>/g, ' ')).toLowerCase();
    for (const marker of markers) assert.ok(section.includes(marker.toLowerCase()), `${slug} ${id}: ${marker}`);
  }
  const ids = elements.map(e => e.attributes.id).filter(Boolean); assert.equal(ids.length, new Set(ids).size);
  assert.equal(elements.filter(e => e.tag === 'nav').length, 1);
  assert.equal(elements.filter(e => e.tag === 'table').length, 2);
  assert.ok(elements.filter(e=>e.tag==='table').every(e=>!e.hidden), 'Complete comparisons are visible without JavaScript');
  assert.deepEqual(elements.filter(e=>e.tag==='table').map(table=>elements.filter(e=>e.tag==='tr'&&e.start>table.openEnd&&e.end<table.innerEnd).length),[4,3],'All SSR comparison rows remain complete');
  const anchors = elements.filter(e => e.tag === 'a'), primary = Object.values(d.accessVisitGuideSources[slug]);
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
  for (const [i, faq] of d.accessVisitGuideFaqs[slug].entries()) {
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
  const compiledFragment = await transform(d.accessVisitGuideOverrides[slug], { filename: slug + '.astro' }); assert.deepEqual(compiledFragment.diagnostics.filter(v => v.severity === 1), []);
  for (const a of result.anchors.filter(a => a.attributes.href.startsWith('/'))) {
    const url = new URL(a.attributes.href, 'https://banffbound.com'), route = url.pathname.replace(/\/$/, '');
    if (route.startsWith('/blog/')) { const name = route.slice(6); assert.ok(d.originalPosts.some(p => p.slug === name), name); assert.ok(!d.blogRedirects[name]); if(url.hash){const body = d.accessVisitGuideOverrides[name]; assert.ok(body && htmlElements('<html><body>'+body+'</body></html>').some(n=>n.attributes.id===url.hash.slice(1)), 'Actual authored blog fragment');} }
    else if(route.startsWith('/hotel-directory/')) assert.ok(d.hotels.some(h=>h.slug===route.slice(17)), 'Existing hotel identity');
    else if (route.startsWith('/towns/')) { assert.ok(d.towns.some(t => t.slug === route.slice(7))); if (url.hash) assert.ok((await readFile(path.join(root, 'src/pages/towns/[slug].astro'), 'utf8')).includes(`id="${url.hash.slice(1)}"`)); }
    else { let found; for (const f of [path.join(root, 'src/pages', route + '.astro'), path.join(root, 'src/pages', route, 'index.astro')]) try { await access(f); found = f; break; } catch {} assert.ok(found, route); if (url.hash) assert.ok((await readFile(found, 'utf8')).includes(`id="${url.hash.slice(1)}"`)); }
  }
  for (const text of ['Rooms start at CAD 120.','All hotels are wheelchair accessible.','We stayed here last winter.','All shuttles accommodate every wheelchair.','Every accessible room includes a shower chair.','All visitors with disabilities enter free.','Staff will transfer you into the pool.','The gondola boardwalk is wheelchair accessible.']) assert.throws(() => inspect(slug, bodies[slug].replace('</body>', `<p>${text}</p></body>`)), text);
  for (const [from, to] of [
    ['motor coaches are not wheelchair accessible','motor coaches accommodate all mobility devices'],
    ['2026 Alpine Start product had no accessible service','every Alpine Start departure is accessible'],
    ['patio is not wheelchair accessible','patio is wheelchair accessible'], ['steps/stairs and no motorized lift','step-free aquatic entry with a motorized lift'],
    ['no documentation or Access 2 Card','an Access 2 Card'], ['at least five business days ahead','only on arrival'],
    ['does not confirm reopening','confirms the pool is open'], ['does not verify free all-terrain chair loans','guarantees free all-terrain chair loans'],
    ['not a confirmed accessible room','a confirmed accessible room'], ['not a verified access-approved tour list','a verified access-approved tour list'],
  ]) { assert.ok(bodies[slug].includes(from), 'Mutate actual text'); assert.throws(() => inspect(slug, bodies[slug].replaceAll(from, to)), from); }
  assert.throws(() => inspect(slug, bodies[slug], { ...d.accessVisitGuideMetadata[slug], date: d.reviewDate }));
  assert.throws(() => inspect(slug, bodies[slug].replace('<summary>', '<summary>Different question: ')));
  assert.throws(() => inspect(slug, bodies[slug].replace('"@type":"FAQPage"', '"@type":"WebPage"')));
  const source = Object.values(d.accessVisitGuideSources[slug])[0]; assert.throws(() => inspect(slug, bodies[slug].replaceAll(source, '/towns/')));
  const rendered=htmlElements(bodies[slug]),table=rendered.find(e=>e.tag==='table'),row=rendered.find(e=>e.tag==='tr'&&e.start>table.openEnd&&e.end<table.innerEnd);
  assert.throws(()=>inspect(slug,bodies[slug].slice(0,row.start)+bodies[slug].slice(row.end)),'A comparison row cannot disappear');
}
for (const slug of slugs){ assert.throws(() => inspect(slug, bodies[slug].replace('camref=1101l3MtWX', 'camref=wrong')));assert.throws(() => inspect(slug, bodies[slug].replace('partner_id=QW960HO', 'partner_id=wrong')));}
const source = await readFile(path.join(root, sourceFile), 'utf8'); assert.equal((source.match(/function faqs\(/g) || []).length, 1); assert.equal((source.match(/\$\{faqs\(\)\}/g) || []).length, 1); assert.ok(!/\bfetch\s*\(|process\.env|localStorage|sessionStorage|document\.cookie/.test(source));
const note = await readFile(path.join(root, 'research/access-visit-guide-sources-2026-10-29.md'), 'utf8');
for (const slug of slugs) { assert.ok(note.includes(publications[slug])); for (const url of Object.values(d.accessVisitGuideSources[slug])) assert.ok(note.includes(url), 'Source recorded ' + url); }
assert.ok(note.includes(inheritedSearch)); assert.ok(note.includes(activitySearch));
console.log('Access-visit guide checks passed: ' + results.join('; ') + '. One actual Astro-rendered HTML body; five matching visible/schema FAQs; exact original dates and inherited affiliate set; real internal routes/fragments; airport/carrier/exact-room/facility/support-person/adaptive/winter boundaries and negative regressions. No network, site build, registry requirement or file output.');
