import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { htmlFacts, htmlElements, schemaNodes, normal } from './verify-cycling-consent-release.mjs';

// This author check is independent of shared registry, workflow or release integration.
globalThis.fetch = () => { throw new Error('Network is forbidden in this focused author check'); };
const root = fileURLToPath(new URL('../', import.meta.url));
const postSource = await readFile(path.join(root, 'src/data/blogPosts.ts'), 'utf8');
const originalArray = postSource.match(/const originalBlogPosts:\s*BlogPost\[\]\s*=\s*(\[[\s\S]*?\n\]);/)?.[1];
assert.ok(originalArray, 'Read raw original publication before review metadata merges.');
const { outputFiles } = await build({ stdin: { contents: "export * from './src/data/skokiGuideOverrides.ts';export {blogRedirects} from './src/data/redirects.mjs';export {towns} from './src/data/towns.ts';export {trails} from './src/data/trails.ts';\nexport const originalPosts=" + originalArray + ';', resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent' });
const d = await import('data:text/javascript;base64,' + Buffer.from(outputFiles[0].text).toString('base64'));
const slug = 'skoki-lodge-guide';
const sources = [
  'https://skokilodge.com/',
  'https://www.skoki.com/rates/',
  'https://www.skoki.com/location/',
  'https://skokilodge.com/accommodation/index.php',
  'https://skoki.com/FAQ/index.php',
  'https://www.skoki.com/contact/',
  'https://www.skoki.com/pdf/Skoki-Info-Sheet-Winter.pdf',
  'https://skokilodge.com/pdf/Skoki-Info-Sheet-Summer.pdf',
  'https://www.skoki.com/rates/cancellation.php',
  'https://www.pc.gc.ca/apps/dfhd/page_nhs_eng.aspx?i=90606&id=4',
  'https://www.parks.canada.ca/pn-np/ab/banff/info/gestion-management/skoki',
  'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
  'https://www.parcs.canada.ca/pn-np/mtn/securiteenmontagne-mountainsafety/avalanche/echelle-ratings/eeta-ates-2/simple-1',
  'https://www.parcs.canada.ca/pn-np/mtn/securiteenmontagne-mountainsafety/hiver-winter/randonnee-touring',
  'https://parks.canada.ca/pn-np/ab/banff/securite-safety/hiver-winter',
  'https://parks.canada.ca/pn-np/ab/banff/bulletins',
  'https://parks.canada.ca/voyage-travel/securite-safety/bulletins/74085a8f-8138-410f-8956-83929a79d6b8',
];
const referrals = [
  'https://www.expedia.ca/Hotel-Search?destination=Banff%2C+Alberta&camref=1101l3MtWX',
  'https://www.getyourguide.com/banff-l284/?partner_id=QW960HO',
];
const internal = ['/trails/deception-pass/', '/learn-to-ski/#lesson-fit', '/blog/banff-ski-touring/', '/packing-list/', '/towns/lake-louise/', '/book/lake-louise-stays/', '/car-free-banff/', '/conditions/', '/blog/banff-winter-driving/', '/winter-stays/', '/winter/'];
const bad = /\$\s*\d|\bCAD\s*\d|\b775 (?:metres|meters|m)\b|11 km one way from (?:the )?Fish Creek|(?:the |this )?(?:approach|route|trail) is (?:safe for beginners|avalanche-free|safe year-round)|Skoki is suitable for first-time (?:skiers|snowshoers)|a guide is included|pack delivery is included|all equipment is provided|wine is included|weather cancellations are always refundable|all weather cancellations receive cash refunds|the lodge is an emergency shelter|lodge staff will rescue you|walk across Ptarmigan Lake|follow the frozen lake|absolutely zero light pollution|guaranteed (?:privacy|availability|safe|snow|views)|\b(?:I|we) (?:visited|stayed|skied|hiked)\b|during my last visit/i;

function validate(body, meta) {
  assert.deepEqual(Object.keys(meta).sort(), ['title','description','lastUpdated','readTime','imageIsIllustrative','imageNote'].sort(), 'Publication metadata and photo identity remain separate.');
  assert.equal(meta.lastUpdated, '2026-10-29'); assert.equal(meta.imageIsIllustrative, true); assert.match(meta.imageNote, /Illustrative.*not verified/i); assert.match(meta.title, /Skoki Lodge.*Winter.*Summer/); assert.ok(meta.description.length > 100);
  const html = '<html><head></head><body>' + body + '</body></html>', elements = htmlElements(html), facts = htmlFacts(html), text = facts.text;
  const words = text.split(/\s+/).length; assert.ok(words >= 1700 && words <= 3000, 'Substantial winter and summer stay planning: ' + words); assert.ok(!bad.test(text), 'No inherited price, novice/safety, transport, equipment, rescue, ice-route or fictional visit claim.');
  const headings = elements.filter(n => n.tag === 'h2'); assert.ok(headings.length >= 9); assert.ok(elements.some(n => n.tag === 'table')); assert.ok(elements.some(n => n.tag === 'ol'));
  const section = id => { const heading = headings.find(n => n.attributes.id === id); assert.ok(heading, 'Meaningful stay section: ' + id); const next = headings.find(n => n.start > heading.end); return normal(html.slice(heading.end, next?.start ?? html.length).replace(/<[^>]*>/g, ' ')); };
  const required = {
    'getting-there': ['1 Whitehorn Road','11 km from the arranged upper trailhead','another 4 km from Fish Creek','14.5 km from the Lake Louise trailhead','11.5 km one way from Fish Creek','ends at the pass, not the lodge','guaranteed elapsed time'],
    'winter-access': ['not the summer Fish Creek shuttle process','does not include a guide, pack transport','does not recommend the approach for people without ski or snowshoe experience','ATES Simple, Class 1','not a declaration of no avalanche risk','transceiver, shovel and probe','skills to use them','qualified guidance separately','does not monitor natural ice for safety','no lake-crossing line or alternative winter route'],
    'summer-access': ['check-in before the Fish Creek transfer','actual departure and return pickup','not driving','return also includes an ascent','bear warning issued September 2, 2026','warning, not an asserted closure','not a backcountry camping permit'],
    'the-lodge': ['main lodge and three guest cabins','22 guests','Main-lodge rooms are upstairs','Honeymoon cabin lists a king bed','wash basins and outhouses','Bedding is provided','meals are included','alcoholic drinks sold separately','shared kitchen'],
    'what-to-do': ['opened to guests in 1931','designated a national historic site in 1992','Summer hiking descriptions do not supply winter touring itineraries','Ordinary lodge meals are for overnight guests','outdoor seating','does not reserve indoor shelter'],
    'booking': ['actual minimum stay','no universal two-night rule','dedicated cancellation policy','weather and road problems','credit or deferral','different refund wording','distinguish cash refunds from credits'],
    'what-to-bring': ['Guests carry their own packs in and out','does not replace','lodge cannot provide backcountry rescue','separate Banff portion','These search results are not Skoki Lodge rooms','affiliate links','commission'],
    'skoki-sources': ['Full guide reviewed October 29, 2026','no live room, weather or trail feed','hero is illustrative'],
  };
  for (const [id, markers] of Object.entries(required)) for (const marker of markers) assert.ok(section(id).includes(marker), `Section-specific requirement ${id}: ${marker}`);
  for (const marker of ['December 18, 2026–April 5, 2027','June 18–October 13, 2027','future operating plans','not available-room or route-condition confirmations']) assert.ok(text.includes(marker), 'Dated future-season boundary: ' + marker);
  const ids = elements.map(n => n.attributes.id).filter(Boolean); assert.equal(new Set(ids).size, ids.length);
  const anchors = elements.filter(n => n.tag === 'a');
  for (const a of anchors) { assert.ok(!anchors.some(p => p !== a && a.start >= p.openEnd && a.end <= p.innerEnd), 'No nested anchor.'); const href = a.attributes.href; assert.ok(href); if (href.startsWith('#')) assert.ok(ids.includes(href.slice(1))); else if (!href.startsWith('/')) { assert.equal(new URL(href).protocol, 'https:'); assert.ok([...sources,...referrals].includes(href), 'Only exact official/referral links: ' + href); assert.equal(a.attributes.target, '_blank'); assert.ok((a.attributes.rel ?? '').split(/\s+/).includes('noopener')); assert.equal((a.attributes.rel ?? '').split(/\s+/).includes('sponsored'), referrals.includes(href), 'Only retained separate-Banff searches are affiliate links.'); } }
  for (const href of [...sources, ...referrals, ...internal]) assert.ok(anchors.some(a => a.attributes.href === href), 'Useful exact source/journey link: ' + href);
  const faqs = facts.documents.flatMap(doc => schemaNodes(doc, 'FAQPage')); assert.equal(faqs.length, 1); assert.equal(faqs[0].mainEntity.length, 5); assert.equal(facts.details.length, 5);
  d.skokiGuideFaqs.forEach((faq, i) => { const q = faqs[0].mainEntity[i]; assert.equal(q['@type'], 'Question'); assert.equal(q.acceptedAnswer['@type'], 'Answer'); assert.equal(normal(q.name), normal(faq.question)); assert.equal(normal(q.acceptedAnswer.text), normal(faq.answer)); assert.equal(facts.details[i].question, normal(faq.question)); assert.equal(facts.details[i].answer, normal(faq.answer)); });
  assert.ok(elements.filter(n => n.tag === 'script').every(n => n.attributes.type === 'application/ld+json' && !n.attributes.src)); assert.ok(!elements.some(n => ['iframe','embed','object','form'].includes(n.tag))); assert.equal(facts.documents.flatMap(doc => schemaNodes(doc, 'Article')).length, 0);
  return { words, anchors };
}
assert.deepEqual(Object.keys(d.skokiGuideOverrides), [slug]); assert.deepEqual(Object.keys(d.skokiGuideMetadata), [slug]); assert.equal(d.skokiGuideFaqs.length, 5); assert.equal(d.reviewDate, '2026-10-29'); assert.equal(d.originalPosts.find(p => p.slug === slug)?.date, '2025-12-27'); assert.ok(!d.blogRedirects[slug]); assert.equal(Object.values(d.blogRedirects).filter(value => value === slug).length, 0);
const body = d.skokiGuideOverrides[slug], meta = d.skokiGuideMetadata[slug], result = validate(body, meta);
for (const a of result.anchors) { if (!a.attributes.href.startsWith('/')) continue; const u = new URL(a.attributes.href, 'https://banffbound.com'), route = u.pathname.replace(/\/$/, ''); if (route.startsWith('/blog/')) { assert.ok(d.originalPosts.some(p => p.slug === route.slice(6))); assert.ok(!d.blogRedirects[route.slice(6)]); } else if (route.startsWith('/towns/')) assert.ok(d.towns.some(t => t.slug === route.slice(7))); else if (route.startsWith('/trails/')) assert.ok(d.trails.some(t => t.slug === route.slice(8) && t.routeVerified !== false)); else { let exists = false; for (const file of [path.join(root, 'src/pages', route + '.astro'), path.join(root, 'src/pages', route, 'index.astro')]) try { await access(file); exists = true; } catch {} assert.ok(exists, 'Existing internal handoff: ' + a.attributes.href); } }
assert.ok((await readFile(path.join(root, 'src/pages/learn-to-ski.astro'), 'utf8')).includes('id="lesson-fit"'));
const rawBody = (await readFile(path.join(root, 'src/data/blogContent.ts'), 'utf8')).split("'skoki-lodge-guide': `")[1]?.split('\n`,')[0]; assert.ok(rawBody, 'Keep original raw owner intact; replacement is a dedicated module.'); for (const href of referrals) assert.ok(rawBody.includes(href), 'Preserve the exact inherited search URL, with clarified separate-trip purpose.');
for (const claim of ['The approach is safe for beginners.','The route is avalanche-free.','Skoki is suitable for first-time skiers.','A guide is included.','Pack delivery is included.','All equipment is provided.','Wine is included.','Weather cancellations are always refundable.','The lodge is an emergency shelter.','Lodge staff will rescue you.','Walk across Ptarmigan Lake.','The cabin has guaranteed privacy.','We stayed here last winter.','Rates are $300 per person.','11 km one way from the Fish Creek parking area.']) assert.throws(() => validate(body + '<p>' + claim + '</p>', meta), 'Reject unsupported inherited/current claim: ' + claim);
for (const [from,to] of [['11 km from the arranged upper trailhead','11 km from any parking space'],['does not include a guide, pack transport','includes a guide and pack transport'],['not the summer Fish Creek shuttle process','the same process all year'],['does not recommend the approach for people without ski or snowshoe experience','welcomes all first-time skiers'],['transceiver, shovel and probe','a mobile phone'],['warning, not an asserted closure','closure until further notice'],['credit or deferral','automatic cash refunds'],['December 18, 2026–April 5, 2027','December 1, 2026–May 5, 2027'],['June 18–October 13, 2027','June 1–November 13, 2027'],['"@type":"FAQPage"','"@type":"WebPage"']]) assert.throws(() => validate(body.replaceAll(from,to), meta), 'Separate FAQ cannot mask a changed body boundary: ' + from);
assert.throws(() => validate(body, {...meta,date:'2026-10-29'})); assert.throws(() => validate(body, {...meta,imageIsIllustrative:false})); assert.throws(() => validate(body.replace('<summary>' + d.skokiGuideFaqs[0].question, '<summary>Different visible question'), meta)); assert.throws(() => validate(body.replace('<a ', '<a href="/winter/"><a ').replace('</a>', '</a></a>'), meta)); assert.throws(() => validate(body.replace('camref=1101l3MtWX','camref=wrong'), meta));
const source = await readFile(path.join(root, 'src/data/skokiGuideOverrides.ts'), 'utf8'); assert.equal((source.match(/function renderFaqs\(/g) ?? []).length, 1); assert.equal((source.match(/\$\{renderFaqs\(\)\}/g) ?? []).length, 1);
const note = await readFile(path.join(root, 'research/skoki-guide-sources-2026-10-29.md'), 'utf8'); for (const url of [...sources,...referrals]) assert.ok(note.includes(url), 'Source record: ' + url); for (const marker of ['2025-12-27','72','no fragment IDs','Simple, Class 1','warning','cancellation','imageIsIllustrative','Registration']) assert.ok(note.includes(marker));
console.log(`Skoki guide checks passed: ${result.words} words, one dedicated full body/metadata, five identical visible/schema FAQs; original 2025-12-27 publication, exact inherited referral URLs, separate season/start/endpoint/ability/terms/return gates, real internal links, illustrative-image contract and negative regressions. No network, site build, registry expectation or file output.`);
