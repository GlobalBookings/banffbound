import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { transform } from '@astrojs/compiler';
import { experimental_AstroContainer } from 'astro/container';
import { htmlFacts, htmlElements, schemaNodes, normal } from './verify-cycling-consent-release.mjs';

globalThis.fetch = () => { throw Error('No network in pet-travel author checks'); };
const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const sourceFile = 'src/data/petTravelGuideOverrides.ts';
const postSource = await readFile(path.join(root, 'src/data/blogPosts.ts'), 'utf8');
const raw = postSource.match(/const originalBlogPosts:\s*BlogPost\[\]\s*=\s*(\[[\s\S]*?\n\]);/)?.[1];
assert.ok(raw, 'Read original publication records rather than projected dates.');
const bundle = await build({ stdin: { contents: `export * from './${sourceFile}';export { blogContent as legacyContent } from './src/data/blogContent.ts';export { blogRedirects } from './src/data/redirects.mjs';export { towns } from './src/data/towns.ts';export { hotels } from './src/data/hotels.ts';export const originalPosts=${raw};`, resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent' });
const d = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const publications = { 'banff-dog-friendly': '2026-02-09', 'banff-pet-friendly-hotels': '2025-09-07' };
const slugs = Object.keys(publications);
const inheritedSearch = 'https://www.expedia.ca/Hotel-Search?destination=Banff%2C+Alberta&camref=1101l3MtWX';
const activitySearch = 'https://www.getyourguide.com/banff-l284/?partner_id=QW960HO';
const inherited = { 'banff-dog-friendly': [inheritedSearch], 'banff-pet-friendly-hotels': [inheritedSearch, activitySearch] };
for (const value of [d.petTravelGuideOverrides, d.petTravelGuideMetadata, d.petTravelGuideFaqs, d.petTravelGuideSources]) assert.deepEqual(Object.keys(value), slugs);
assert.equal(d.reviewDate, '2026-10-29');

const fragment = await transform('---\nconst { body } = Astro.props;\n---\n<article data-pet-travel-guide><Fragment set:html={body} /></article>', { filename: path.join(root, 'pet-travel-author-check.astro'), internalURL: 'astro/compiler-runtime', resultScopedSlot: true });
assert.deepEqual(fragment.diagnostics.filter(v => v.severity === 1), []);
const renderCode = fragment.code.replace(/,\s*createMetadata as \$\$createMetadata/, '').replace(/^export const \$\$metadata = [^\n]*\n/m, '');
const renderBundle = await build({ stdin: { contents: renderCode, loader: 'ts', resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent', plugins: [{ name: 'astro-runtime-only', setup(b) { b.onResolve({ filter: /^astro\// }, a => ({ path: pathToFileURL(require.resolve(a.path)).href, external: true })); } }] });
const Page = (await import('data:text/javascript;base64,' + Buffer.from(renderBundle.outputFiles[0].text).toString('base64'))).default;
const container = await experimental_AstroContainer.create();
const bodies = {};
for (const slug of slugs) bodies[slug] = '<html><head></head><body>' + await container.renderToString(Page, { props: { body: d.petTravelGuideOverrides[slug] }, request: new Request(`https://banffbound.com/blog/${slug}/?email=PRIVATE_EMAIL&gclid=PRIVATE_CLICK`) }) + '</body></html>';
const requirements = {
  'banff-dog-friendly': {
    'dog-first': ['whole dog-and-people journey', 'animal’s travel arrangements directly', 'passenger booking is not a pet reservation'],
    'dog-rules': ['on leash and under physical control', 'outside the Town of Banff', 'does not exceed 3 metres', 'regulations expressly exclude the Town of Banff', 'Town’s Animal Services bylaw', 'no longer than three metres', 'never to leave pets unattended', 'wildlife attractants', 'current bulletins', 'posted rules'],
    'dog-transport': ['carrier small enough for the owner’s lap', 'fully enclosed', 'Backpacks, totes and pet strollers do not qualify', 'Floor placement depends on available space', 'fits on the owner’s lap', 'pet enclosed throughout and carrier held at all times', 'ordinary pets are not allowed', 'Service animals have separate'],
    'dog-lakes': ['Do not treat all Lake Louise and Moraine Lake trails as either dog-banned or dog-permitted', 'closed to personal vehicles year-round', '2026 Parks lake-shuttle season ended October 12', 'July 10–September 15', 'beyond Stewart Canyon Bridge', 'Minnewanka/Aylmer', 'pet decision is discretionary'],
    'dog-town': ['clifftop section closes in winter', 'Sundance Park and Industrial District', 'spring dry-out closure', 'frozen ground and snow cover', 'no puppies under five months'],
    'dog-winter': ['least experienced person', 'certain track-set ski trails', 'expired winter order does not establish permission for a new season', 'no winter Moraine Lake approach', 'does not confer terrain skills or confirm natural ice'],
    'dog-meals': ['dog-friendly courtyard patio', 'not an indoor or winter dining promise', 'excludes ordinary pets', 'confirm appropriate care'],
    'dog-stay': ['actual room category', 'broad destination search', 'not confirmation of this dog’s room', 'commission'],
  },
  'banff-pet-friendly-hotels': {
    'pet-room': ['exact room categories', 'accepting that request and allocating the room', 'cooking appliances', 'requirements can be met together'],
    'pet-comparison': ['Five pet-stay starting options and one explicit exclusion', 'No unattended pets', 'Dogs only', 'Royal Canadian Lodge', 'pets are not permitted', 'not a claim that every'],
    'pet-banff': ['notify the hotel and call reservations', 'does not identify every accepted species', 'not every room qualifies', 'maximum of two pets per room', 'restaurant/aquatic-facility exclusions', '24-hour notice requirement is not a confirmed sitter'],
    'pet-louise': ['dogs only: cats and other pets are not accepted', 'maximum of two dogs', 'do not give identical eligibility lists', 'does not turn a kennel clause into advice to leave a dog alone', 'sixth floor', 'Mount Temple Wing’s fifth floor', 'outdoor patios', 'must not be unsupervised'],
    'pet-exclusion': ['pets are not permitted', 'old Delta/Marriott name', 'not extend that answer into a ruling about service-animal rights'],
    'pet-supervision': ['never to leave an animal unattended', 'whole absence', 'not a booking', 'Do not assume a member of hotel staff will supervise'],
    'pet-meals': ['does not confer restaurant', 'Ask which entrance', 'pet-eligible room'],
    'pet-quote': ['current pet charge', 'leaving missing amounts unknown', 'broad Banff search', 'not a verified dog-admitting tour list', 'commission'],
  },
};
const requiredInternal = {
  'banff-dog-friendly': ['/dog-friendly/#dog-ideas', '/blog/banff-pet-friendly-hotels/', '/towns/banff/', '/towns/', '/shuttle-reservations/', '/blog/lake-louise-village-guide/', '/eat-and-drink/#dining-finder', '/winter-stays/', '/packing-list/', '/book/banff-hotels/', '/trip-builder/', '/trip-cost/'],
  'banff-pet-friendly-hotels': ['/dog-friendly/#dog-ideas', '/blog/banff-dog-friendly/', '/blog/banff-dog-friendly/#dog-transport', '/book/banff-hotels/', '/book/lake-louise-stays/', '/towns/lake-louise/', '/winter-stays/', '/trip-cost/', '/packing-list/', '/conditions/'],
};
const forbidden = /\$\s*\d|\bCAD\s*\d|\d+\s*[%％]|\b(?:I|we) (?:visited|stayed|experienced)|during my last visit|bear bells?|leash(?:es)?.{0,30}2\s*(?:m\b|metres|meters)|the leash limit is 3 metres everywhere|Banff Airporter carries ordinary pets|all Lake Louise trails prohibit dogs|all Moraine Lake trails prohibit dogs|all patios accept dogs|Leave your dog alone at the hotel|pets can be left unattended|dogs can be left unattended|Royal Canadian Lodge welcomes pets|Marriott standard pet policy applies|all pet rooms have full kitchens|guaranteed (?:pet acceptance|availability|patio access|transport)/i;
function inspect(slug, html, metadata = d.petTravelGuideMetadata[slug]) {
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
  assert.equal(elements.filter(e => e.tag === 'table').length, slug === slugs[0] ? 2 : 1);
  assert.ok(elements.filter(e=>e.tag==='table').every(e=>!e.hidden), 'Complete comparisons are visible without JavaScript');
  assert.deepEqual(elements.filter(e=>e.tag==='table').map(table=>elements.filter(e=>e.tag==='tr'&&e.start>table.openEnd&&e.end<table.innerEnd).length),slug===slugs[0]?[5,5]:[7],'All SSR comparison rows remain complete');
  if(slug==='banff-pet-friendly-hotels'){
    const table=elements.find(e=>e.tag==='table'),rows=elements.filter(e=>e.tag==='tr'&&e.start>table.openEnd&&e.end<table.innerEnd);
    assert.equal(rows.length,7,'Five selected property options and the explicit exclusion remain in the comparison');
    const profileSlugs=['moose-hotel-suites','tunnel-mountain-resort','fairmont-banff-springs','lake-louise-inn','fairmont-chateau-lake-louise','royal-canadian-lodge'];
    assert.deepEqual(rows.slice(1).map(row=>elements.find(e=>e.tag==='a'&&e.start>row.openEnd&&e.end<row.innerEnd)?.attributes.href),profileSlugs.map(s=>'/hotel-directory/'+s+'/'));
    for(const row of rows.slice(1)){const cells=elements.filter(e=>e.tag==='td'&&e.start>=row.openEnd&&e.end<=row.innerEnd);assert.equal(cells.length,2);assert.ok(cells.every(e=>normal(html.slice(e.openEnd,e.innerEnd).replace(/<[^>]*>/g,' ')).length>25),'Every property has a real policy and useful booking question');}
    assert.match(normal(html.slice(rows[6].openEnd,rows[6].innerEnd).replace(/<[^>]*>/g,' ')),/exclusion.*pets are not permitted/,'Royal remains an exclusion, not a pet recommendation');
  }
  const anchors = elements.filter(e => e.tag === 'a'), primary = Object.values(d.petTravelGuideSources[slug]);
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
  for (const [i, faq] of d.petTravelGuideFaqs[slug].entries()) {
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
  const compiledFragment = await transform(d.petTravelGuideOverrides[slug], { filename: slug + '.astro' }); assert.deepEqual(compiledFragment.diagnostics.filter(v => v.severity === 1), []);
  for (const a of result.anchors.filter(a => a.attributes.href.startsWith('/'))) {
    const url = new URL(a.attributes.href, 'https://banffbound.com'), route = url.pathname.replace(/\/$/, '');
    if (route.startsWith('/blog/')) { const name = route.slice(6); assert.ok(d.originalPosts.some(p => p.slug === name), name); assert.ok(!d.blogRedirects[name]); if(url.hash){const body = d.petTravelGuideOverrides[name]; assert.ok(body && htmlElements('<html><body>'+body+'</body></html>').some(n=>n.attributes.id===url.hash.slice(1)), 'Actual authored blog fragment');} }
    else if(route.startsWith('/hotel-directory/')) assert.ok(d.hotels.some(h=>h.slug===route.slice(17)), 'Existing hotel identity');
    else if (route.startsWith('/towns/')) { assert.ok(d.towns.some(t => t.slug === route.slice(7))); if (url.hash) assert.ok((await readFile(path.join(root, 'src/pages/towns/[slug].astro'), 'utf8')).includes(`id="${url.hash.slice(1)}"`)); }
    else { let found; for (const f of [path.join(root, 'src/pages', route + '.astro'), path.join(root, 'src/pages', route, 'index.astro')]) try { await access(f); found = f; break; } catch {} assert.ok(found, route); if (url.hash) assert.ok((await readFile(found, 'utf8')).includes(`id="${url.hash.slice(1)}"`)); }
  }
  for (const text of ['Rooms start at CAD 120.','All patios accept dogs.','We stayed here last winter.','Banff Airporter carries ordinary pets.','Leave your dog alone at the hotel.','Royal Canadian Lodge welcomes pets.','Bear bells protect your dog.','The leash limit is 3 metres everywhere.']) assert.throws(() => inspect(slug, bodies[slug].replace('</body>', `<p>${text}</p></body>`)), text);
  for (const [from, to] of slug === slugs[0] ? [
    ['regulations expressly exclude the Town of Banff','regulations cover the Town too'], ['no longer than three metres','no longer than two metres'], ['ordinary pets are not allowed','ordinary pets are welcome'], ['pet enclosed throughout and carrier held at all times','pet can ride loose on the seat'],
    ['2026 Parks lake-shuttle season ended October 12','the shuttle runs all winter'], ['pet decision is discretionary','pet admission is guaranteed'],
    ['frozen ground and snow cover','year-round opening'], ['expired winter order does not establish permission for a new season','old order confirms future access'],
  ] : [
    ['dogs only: cats and other pets are not accepted','all animal species are accepted'], ['not every room qualifies','all rooms qualify'],
    ['pets are not permitted','all pets are permitted'], ['24-hour notice requirement is not a confirmed sitter','sitting is guaranteed'],
    ['do not give identical eligibility lists','guarantee every category is pet eligible'], ['not a verified dog-admitting tour list','a verified dog-admitting tour list'],
  ]) { assert.ok(bodies[slug].includes(from), 'Mutate actual text'); assert.throws(() => inspect(slug, bodies[slug].replaceAll(from, to)), from); }
  assert.throws(() => inspect(slug, bodies[slug], { ...d.petTravelGuideMetadata[slug], date: d.reviewDate }));
  assert.throws(() => inspect(slug, bodies[slug].replace('<summary>', '<summary>Different question: ')));
  assert.throws(() => inspect(slug, bodies[slug].replace('"@type":"FAQPage"', '"@type":"WebPage"')));
  const source = Object.values(d.petTravelGuideSources[slug])[0]; assert.throws(() => inspect(slug, bodies[slug].replaceAll(source, '/towns/')));
  const rendered=htmlElements(bodies[slug]),table=rendered.find(e=>e.tag==='table'),row=rendered.find(e=>e.tag==='tr'&&e.start>table.openEnd&&e.end<table.innerEnd);
  assert.throws(()=>inspect(slug,bodies[slug].slice(0,row.start)+bodies[slug].slice(row.end)),'A comparison row cannot disappear');
}
for (const slug of slugs) assert.throws(() => inspect(slug, bodies[slug].replace('camref=1101l3MtWX', 'camref=wrong')));
assert.throws(() => inspect(slugs[1], bodies[slugs[1]].replace('partner_id=QW960HO', 'partner_id=wrong')));
const source = await readFile(path.join(root, sourceFile), 'utf8'); assert.equal((source.match(/function faqs\(/g) || []).length, 1); assert.equal((source.match(/\$\{faqs\('/g) || []).length, 2); assert.ok(!/\bfetch\s*\(|process\.env|localStorage|sessionStorage|document\.cookie/.test(source));
const note = await readFile(path.join(root, 'research/pet-travel-guide-sources-2026-10-29.md'), 'utf8');
for (const slug of slugs) { assert.ok(note.includes(publications[slug])); for (const url of Object.values(d.petTravelGuideSources[slug])) assert.ok(note.includes(url), 'Source recorded ' + url); }
assert.ok(note.includes(inheritedSearch)); assert.ok(note.includes(activitySearch));
console.log('Pet-travel guide checks passed: ' + results.join('; ') + '. Two actual Astro-rendered HTML bodies; ten matching visible/schema FAQs; exact original dates and inherited affiliate set; real internal routes/fragments; park/carrier/winter/property-allocation/supervision boundaries and negative regressions. No network, site build, registry requirement or file output.');
