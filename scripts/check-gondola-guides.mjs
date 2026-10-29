import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { transform } from '@astrojs/compiler';

// Actual generated guide HTML and existing product identity; no network or site build.
const { outputFiles } = await build({ stdin: { contents: "export * from './src/data/gondolaGuideOverrides.ts'; export {allBlogPosts} from './src/data/blogPosts.ts'; export {blogRedirects} from './src/data/redirects.mjs'; export {winterActivityOffers} from './src/data/winterActivityLanding.ts';", resolveDir: process.cwd() }, bundle: true, write: false, platform: 'node', format: 'esm' });
const data = await import('data:text/javascript;base64,' + Buffer.from(outputFiles[0].text).toString('base64'));
const originals = { 'banff-gondola-guide': '2026-02-02', 'banff-gondola-tickets-guide': '2026-03-01' };
const slugs = Object.keys(originals);
for (const collection of [data.gondolaGuideOverrides, data.gondolaGuideMetadata, data.gondolaGuideFaqs]) assert.deepEqual(Object.keys(collection), slugs);
assert.equal(data.reviewDate, '2026-10-29');
const offer = data.winterActivityOffers.find(offer => offer.id === 'gyg-256607');
assert.ok(offer);
assert.equal(offer.productId, '256607');
assert.equal(offer.provider, 'Pursuit Collection');
assert.equal(offer.productUrl, 'https://www.getyourguide.com/banff-l284/banff-banff-gondola-admission-ticket-t256607/');
const verifiedUrl = new URL(offer.bookingUrl);
assert.deepEqual([...verifiedUrl.searchParams], [['partner_id', 'QW960HO'], ['cmp', 'banffboundwinteractivities']]);
const primaryUrls = [
  'https://www.banffjaspercollection.com/attractions/banff-gondola/experience/',
  'https://www.banffjaspercollection.com/attractions/banff-gondola/faqs/',
  'https://www.banffjaspercollection.com/attractions/banff-gondola/hours-location/',
  'https://roamtransit.com/schedules-routes/route-1/',
  'https://parks.canada.ca/pn-np/ab/banff/activ/marchehiver-winterwalking/banff',
  'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking/etat-sentiers-trail-conditions',
  'https://parks.canada.ca/pn-np/ab/banff/bulletins',
  'https://www.banffjaspercollection.com/attractions/banff-gondola/tickets/',
  'https://www.banffjaspercollection.com/terms-conditions/',
  'https://www.banffjaspercollection.com/dining/sky-bistro/',
  'https://www.banffjaspercollection.com/dining/sky-bistro/reserve-a-table/',
  'https://www.banffjaspercollection.com/dining/sky-bistro/location-hours/',
  'https://www.banffjaspercollection.com/attractions/pursuit-pass/',
];
const sourceRecord = await readFile('research/gondola-guide-sources-2026-10-29.md', 'utf8');
for (const url of [...primaryUrls, offer.productUrl]) assert.ok(sourceRecord.includes(url), 'Exact source record: ' + url);
const decode = text => text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const wordCounts = {};
let affiliateCount = 0;
const allHtml = Object.values(data.gondolaGuideOverrides).join('\n');
for (const url of primaryUrls) assert.ok(allHtml.includes(`href="${url}"`), 'Visible primary handoff: ' + url);

for (const slug of slugs) {
  assert.equal(Object.hasOwn(data.blogRedirects, slug), false, 'Preserve canonical: ' + slug);
  assert.equal(data.allBlogPosts.find(post => post.slug === slug)?.date, originals[slug], 'Preserve exact original publication: ' + slug);
  const metadata = data.gondolaGuideMetadata[slug];
  assert.equal(metadata.date, undefined);
  assert.equal(metadata.lastUpdated, data.reviewDate);
  assert.equal(metadata.imageIsIllustrative, true);
  assert.match(metadata.imageNote, /^Illustrative photograph; not a verified/);
  assert.ok(metadata.title.length < 75 && metadata.description.length > 100);
  assert.ok(!/2026|discount|guarantee|\$\d/i.test(metadata.title));
  const html = data.gondolaGuideOverrides[slug];
  const text = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  wordCounts[slug] = text.split(' ').length;
  assert.ok(wordCounts[slug] >= 1200 && wordCounts[slug] < 2100, `Substantive bounded article ${slug}: ${wordCounts[slug]} words.`);
  assert.ok(html.includes('Full guide reviewed October 29, 2026'));
  assert.ok(html.includes('368 shallow stairs each way') && html.includes('not wheelchair accessible'));
  assert.ok(html.includes('separate gondola admission') || html.includes('separate Banff Gondola admission'));
  assert.ok(html.includes('last upload') && html.includes('descent') && html.includes('Route 1'));
  assert.ok(html.includes('November') && html.includes('duplicated') && html.includes('confirm'));
  assert.ok(!/\$\s*\d|\bCAD\s*\d|\b(?:save|savings of|discounts? of)\s+\d|t556595|Nightrise|free cancellation up to 24|skip the (?:ticket )?line|shortest lines|clearest skies|fills (?:up )?by|all prices include|Local.s Note|I.ve brought/i.test(html));
  assert.ok(!/boardwalk (?:is |remains )?fully accessible|reservations are recommended and include gondola admission|summit is always \d/i.test(html));
  assert.ok(!/<(?:iframe|form)\b|\bonclick\s*=|<script(?! type="application\/ld\+json")|AggregateRating|ratingValue|"@type":"(?:Product|Offer)"/i.test(html));
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size, 'Unique section IDs: ' + slug);
  const table = html.match(/<table>([\s\S]*?)<\/table>/)?.[1];
  assert.ok(table && table.includes('<caption>') && table.includes('<thead>') && table.includes('<tbody>'));
  assert.ok((table.match(/scope="row"/g) || []).length >= 3);
  assert.ok((table.match(/scope="col"/g) || []).length >= 3);
  let openAnchors = 0;
  for (const match of html.matchAll(/<\/?a\b[^>]*>/g)) {
    const anchor = match[0];
    if (anchor.startsWith('</')) { openAnchors--; assert.equal(openAnchors, 0, 'Balanced closing anchor: ' + slug); continue; }
    openAnchors++; assert.equal(openAnchors, 1, 'No nested anchors: ' + slug);
    const href = decode(anchor.match(/\bhref="([^"]+)"/)?.[1] || ''); assert.ok(href);
    if (href.startsWith('#')) assert.ok(ids.includes(href.slice(1)), 'Local fragment exists: ' + href);
    else if (href.startsWith('/')) {
      const route = new URL(href, 'https://banffbound.com');
      const pathname = route.pathname.replace(/\/$/, '');
      if (pathname.startsWith('/blog/')) assert.ok(data.allBlogPosts.some(post => '/blog/' + post.slug === pathname), 'Canonical blog target exists: ' + href);
      else if (pathname.startsWith('/towns/')) await access('src/pages/towns/[slug].astro');
      else { try { await access(`src/pages${pathname}.astro`); } catch { await access(`src/pages${pathname}/index.astro`); } }
      if (pathname === '/book/banff-winter-activities') {
        assert.equal(route.search, '?experience=summit'); assert.equal(route.hash, '#banff-gondola');
        const page = await readFile('src/pages/book/banff-winter-activities.astro', 'utf8');
        assert.ok(page.includes('offer.anchor') && data.winterActivityOffers.some(entry => entry.anchor === route.hash.slice(1)));
      }
    } else {
      const url = new URL(href); assert.equal(url.protocol, 'https:');
      assert.match(anchor, /target="_blank"/); assert.match(anchor, /\brel="[^"]*\bnoopener\b/);
      if (url.hostname === 'www.getyourguide.com') {
        affiliateCount++; assert.equal(slug, 'banff-gondola-tickets-guide'); assert.equal(href, offer.bookingUrl);
        assert.match(anchor, /\brel="[^"]*\bsponsored\b/);
      } else {
        assert.ok(primaryUrls.includes(href), 'Only reviewed exact primary URLs: ' + href);
        assert.equal(url.search, ''); assert.equal(url.hash, '');
      }
    }
  }
  assert.equal(openAnchors, 0);
  const visible = [...html.matchAll(/<details><summary>([^<]+)<\/summary><p>([\s\S]*?)<\/p><\/details>/g)].map(([, question, answer]) => ({ question: decode(question), answer: decode(answer) }));
  assert.equal(visible.length, 5);
  assert.deepEqual(visible, data.gondolaGuideFaqs[slug]);
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.equal(blocks.length, 1);
  const schema = JSON.parse(blocks[0][1]);
  assert.equal(schema['@context'], 'https://schema.org'); assert.equal(schema['@type'], 'FAQPage');
  assert.deepEqual(schema.mainEntity.map(faq => ({ question: faq.name, answer: faq.acceptedAnswer.text })), visible);
  assert.ok(schema.mainEntity.every(faq => faq['@type'] === 'Question' && faq.acceptedAnswer['@type'] === 'Answer'));
  const compiled = await transform(html, { filename: slug + '.astro' });
  assert.deepEqual(compiled.diagnostics.filter(diagnostic => diagnostic.severity === 1), [], 'Actual article fragment compiles: ' + slug);
  assert.ok(sourceRecord.includes(originals[slug]));
}
assert.equal(affiliateCount, 1, 'One deliberate native product handoff, with disclosure and the existing identity.');
const visit = data.gondolaGuideOverrides['banff-gondola-guide'];
const tickets = data.gondolaGuideOverrides['banff-gondola-tickets-guide'];
assert.ok(visit.includes('31 inches wide by 41 inches long') && visit.includes('320 kg total weight limit'));
assert.ok(visit.includes('between the Cosmic Ray Station and the historic Weather Observatory'));
assert.ok(visit.includes('unheated') && visit.includes('5.5 km one way and 655 m of elevation gain') && visit.includes('hazardous avalanche terrain adjacent'));
for (const id of ['summit-choices', 'gondola-access', 'gondola-transport', 'gondola-winter', 'sulphur-hike']) assert.ok(visit.includes(`id="${id}"`));
for (const id of ['ticket-comparison', 'admission-channels', 'direct-admission', 'marketplace-admission', 'gondola-dining', 'gondola-total', 'gondola-booking-checks']) assert.ok(tickets.includes(`id="${id}"`));
assert.ok(tickets.indexOf('Affiliate disclosure:') < tickets.indexOf(offer.bookingUrl.replace(/&/g, '&amp;')));
assert.ok(tickets.includes('ordinary à-la-carte') && tickets.includes('lounge') && tickets.includes('named dining package'));
assert.ok(tickets.includes('non-refundable') && tickets.includes('product <strong>256607</strong>') && tickets.includes('Pursuit Collection'));
assert.ok(tickets.includes('without enabling optional partner embeds') && tickets.includes('own terms and privacy practices'));
assert.ok(tickets.includes('seasonal operation') || tickets.includes('operating season'));
assert.ok(tickets.includes('paid one-way trip down') && tickets.includes('does not establish hotel pickup'));
assert.ok(sourceRecord.includes('November 20') && sourceRecord.includes('November 21') && sourceRecord.includes('No maintenance closure is invented'));
console.log(`Gondola guide checks passed: 2 canonical replacements with original dates, ${Object.values(wordCounts).join('/')} words, distinct SSR comparisons, 10 matching visible/schema FAQs, physical/transport/dining source contracts, 13 exact primary URLs and 1 existing native affiliate product. Actual Astro fragments compile. No network or site build.`);
