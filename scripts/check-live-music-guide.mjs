import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { parseFragment } from 'parse5';

// Offline checks of the authored model/body, not a live calendar or site build.
// Read the actual original corpus separately so publication/link checks do not
// depend on another author's concurrently staged metadata imports. Root checks
// the shared final registry projection after all authored modules are present.
const postSource = await readFile('src/data/blogPosts.ts', 'utf8');
const originalArray = postSource.match(/const originalBlogPosts: BlogPost\[\] = (\[[\s\S]*?\n\]);/)?.[1];
assert.ok(originalArray, 'Find the actual preserved publication corpus.');
const { outputFiles } = await build({ stdin: { contents: "export * from './src/data/liveMusicGuideOverrides.ts'; export {blogRedirects} from './src/data/redirects.mjs';\nexport const originalPosts = " + originalArray + ';', resolveDir: process.cwd() }, bundle: true, write: false, platform: 'node', format: 'esm' });
const model = await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`);
const slug = 'banff-live-music', html = model.liveMusicGuideOverrides[slug], metadata = model.liveMusicGuideMetadata[slug], faqs = model.liveMusicGuideFaqs;
assert.deepEqual(Object.keys(model.liveMusicGuideOverrides), [slug]);
assert.deepEqual(Object.keys(model.liveMusicGuideMetadata), [slug]);
assert.equal(model.reviewDate, '2026-10-29'); assert.equal(metadata.lastUpdated, model.reviewDate);
assert.equal(model.originalPosts.find(post => post.slug === slug)?.date, '2026-05-28', 'Original publication remains unchanged.');
assert.equal(model.blogRedirects[slug], undefined, 'The retained guide is canonical, not a new alias.');
assert.equal(metadata.date, undefined); assert.equal(metadata.slug, undefined);
assert.equal(metadata.imageIsIllustrative, true); assert.match(metadata.imageNote, /not verified as a named Banff venue, performer or current event/);
assert.match(metadata.title, /Live Music in Banff.*Pubs, Concerts/); assert.ok(metadata.description.length >= 110);
assert.ok(Array.isArray(faqs) && faqs.length === 4, 'One canonical FAQ array, not copies keyed to invented routes.');

const errors = [], tree = parseFragment(html, { onParseError: error => errors.push(error.code) });
assert.deepEqual(errors, []);
const nodes = root => [root, ...(root.childNodes ?? []).flatMap(nodes)];
const attr = (node, key) => node.attrs?.find(attribute => attribute.name === key)?.value;
const text = root => root.tagName === 'script' ? '' : root.nodeName === '#text' ? root.value : (root.childNodes ?? []).map(text).join(' ');
const content = root => text(root).replace(/\s+/g, ' ').trim();
const all = nodes(tree), prose = content(tree), details = all.filter(node => node.tagName === 'details');
assert.ok(prose.split(/\s+/).length >= 1200, 'Substantive performance-discovery, booking and arrival guide.');
assert.equal(all.filter(node => node.tagName === 'h1').length, 0);
assert.ok(all.filter(node => node.tagName === 'h2').length >= 8);
assert.equal(all.filter(node => ['iframe', 'form', 'img'].includes(node.tagName)).length, 0, 'Complete no-JS content without remote widgets, unverified venue photos or inert controls.');
const ids = all.map(node => attr(node, 'id')).filter(Boolean); assert.equal(new Set(ids).size, ids.length);
assert.ok(all.some(node => node.tagName === 'nav' && attr(node, 'aria-label') === 'Live music guide sections'));
assert.ok(all.filter(node => node.tagName === 'th').every(node => ['row', 'col'].includes(attr(node, 'scope'))));
const table = all.find(node => node.tagName === 'table');
assert.ok(table && nodes(table).filter(node => node.tagName === 'tr').length === 5);
assert.match(content(table), /202 Banff Avenue.*201 Banff Avenue #2.*107 Tunnel Mountain Drive.*Spray Avenue/);

// Actual visible FAQs and JSON-LD share canonical questions/answers exactly.
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
  'https://roseandcrown.ca/events/', 'https://roseandcrown.ca/contact/', 'https://roseandcrown.ca/',
  'https://melissasmissteak.com/live-events/', 'https://melissasmissteak.com/contact/',
  'https://www.banffcentre.ca/events', 'https://www.banffcentre.ca/banff-centre-presents-1', 'https://www.banffcentre.ca/clvb-33',
  'https://www.banffcentre.ca/box-office/tickets', 'https://www.banffcentre.ca/box-office/attending-a-performance', 'https://www.banffcentre.ca/maps-directions',
  'https://www.banff-springs-hotel.com/dine/rundle-bar/', 'https://www.banff-springs-hotel.com/experience/events-calendar/',
  'https://roamtransit.com/schedules-routes/route-7/', 'https://roamtransit.com/schedules-routes/route-2/', 'https://roamtransit.com/schedules-routes/canmore-banff-regional-route-3/',
];
for (const source of requiredSources) assert.ok(hrefs.includes(source), `Dated factual decision has its actual primary-source entry point: ${source}`);
for (const href of ['/blog/banff-nightlife-guide/', '/blog/new-places-to-eat-in-banff/', '/blog/banff-apres-ski/', '/book/banff-hotels/']) assert.ok(hrefs.includes(href));
let internal = 0;
const postSlugs = new Set(model.originalPosts.map(post => post.slug));
for (const anchor of links) {
  const href = attr(anchor, 'href'); assert.ok(href && content(anchor).length > 3);
  assert.equal(nodes(anchor).filter(node => node.tagName === 'a').length, 1, 'No nested anchor chain.');
  assert.ok(!/<|>|javascript:|data:/i.test(href));
  if (href.startsWith('#')) { assert.ok(ids.includes(href.slice(1)), `Existing section target ${href}`); continue; }
  if (href.startsWith('/')) {
    const parts = href.split('/').filter(Boolean);
    if (parts[0] === 'blog') { assert.ok(postSlugs.has(parts[1]), `Existing blog route ${href}`); assert.equal(model.blogRedirects[parts[1]], undefined); }
    else if (parts[0] === 'towns') { assert.equal(parts[1], 'canmore'); await access('src/pages/towns/[slug].astro'); }
    else { const route = href.replace(/\/$/, ''); try { await access(`src/pages${route}.astro`); } catch { await access(`src/pages${route}/index.astro`); } }
    internal++; continue;
  }
  const url = new URL(href); assert.equal(url.protocol, 'https:');
  assert.equal(attr(anchor, 'target'), '_blank'); assert.ok(attr(anchor, 'rel').split(/\s+/).includes('noopener'));
  assert.ok(['roseandcrown.ca', 'melissasmissteak.com', 'www.banffcentre.ca', 'www.banff-springs-hotel.com', 'roamtransit.com'].includes(url.hostname), 'Direct information links are official venue/transport sources.');
  assert.equal(url.search, '', 'No invented event/date/ticket query, tracking ID or availability inference.');
}
assert.ok(!/www\.getyourguide\.com|www\.expedia\.ca|partner_id=|camref=/.test(html), 'Accommodation conversion uses the existing Banff comparison; no fake concert-affiliate product or new provider ID.');
assert.match(prose, /accommodation links may earn BanffBound a commission/);
assert.match(prose, /A room does not include a concert ticket, entertainment voucher, table or shuttle unless/);

// Decision-changing corrections and dated/source-scope distinctions.
assert.match(prose, /not a live gig inventory/);
assert.match(prose, /differing general start-time wording.*specific event/);
assert.match(prose, /minors welcome until 9:30 p\.m\..*earlier meal does not establish admission to a later show/);
assert.match(prose, /event poster for the event page and tickets.*separately offers a table booking/);
assert.match(prose, /Some events are seated concerts; others are general-admission or late-night formats/);
assert.match(prose, /calendar card and event description show different times.*box office or venue/);
assert.match(prose, /Doors means admission can begin; it is not necessarily the performance start/);
assert.match(prose, /ticket can establish admission without a dinner table or an assigned seat/);
assert.match(prose, /table reservation can establish a meal without show admission/);
assert.match(prose, /original PDF rather than a screenshot/);
assert.match(prose, /access varies by venue/);
assert.match(prose, /Campus parking is now paid/);
assert.match(prose, /Route 7 is the seasonal fall\/winter Banff Centre service/);
assert.match(prose, /Route 2 links the Fairmont, downtown and Tunnel Mountain/);
assert.match(prose, /Canmore base.*regional Route 3/);
assert.match(prose, /show ending late can outlast the bus service/);
assert.match(prose, /not generic hotel shuttles/);
assert.match(prose, /Fully reviewed October 29, 2026/);
assert.ok(!/Aurora|Sunday afternoon jazz|\$\s*\d|\d+\s*%|I've|I’ve|my countless visits|I attended|I recommend|guaranteed seating|guaranteed return|all venues|most hotels offer|9 PM to midnight|Thu-Sat|Fri-Sat/.test(prose), 'No inherited invented experience, rates, schedule or generic shuttle/admission guarantees.');
assert.ok(!/"@type"\s*:\s*"(?:Event|MusicEvent|Offer|AggregateRating)"|"startDate"|"price"/.test(html), 'A planning guide is not a synthetic show/offer inventory.');
console.log(`Live music guide checks passed: one canonical full review, preserved May28 publication, four visible/schema-identical FAQs, ${requiredSources.length} primary source handoffs, ${internal} existing internal routes, event/table/age/access/transport distinctions, qualified hero metadata and no invented concert-affiliate offer. No network or site build.`);
