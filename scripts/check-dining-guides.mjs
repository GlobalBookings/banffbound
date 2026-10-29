import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { transform } from '@astrojs/compiler';

// Offline contracts for the full replacement, not a restaurant-availability test.
const filename = 'src/data/diningGuideOverrides.ts';
const { outputFiles } = await build({ stdin: { contents: `export * from './${filename}'; export {allBlogPosts} from './src/data/blogPosts.ts';`, resolveDir: process.cwd() }, bundle: true, write: false, platform: 'node', format: 'esm' });
const data = await import('data:text/javascript;base64,' + Buffer.from(outputFiles[0].text).toString('base64'));
const slug = 'new-places-to-eat-in-banff';
assert.deepEqual(Object.keys(data.diningGuideOverrides), [slug]);
assert.deepEqual(Object.keys(data.diningGuideMetadata), [slug]);
const html = data.diningGuideOverrides[slug];
const metadata = data.diningGuideMetadata[slug];
assert.equal(metadata.lastUpdated, '2026-10-29'); assert.equal(data.diningGuideReviewDate, metadata.lastUpdated);
assert.equal(metadata.date, undefined, 'The original publication is preserved by the metadata merge.');
assert.equal(data.allBlogPosts.find(post => post.slug === slug)?.date, '2026-04-03', 'Keep the existing original publication date.');
assert.ok(!/12|must-try|new.*2026|opened.*2026/i.test(metadata.title));
assert.ok(metadata.description.includes('six Banff restaurants'));
const plain = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const words = plain.split(' ').length;
assert.ok(words >= 1200 && words <= 2300, `Useful bounded guide length, found ${words} words.`);
for (const legacy of ['The Summit Kitchen', 'Mountain Melt', 'Banff Ramen House', 'Himalayan Kitchen Banff', 'Seoul Kitchen', 'The Local Table', 'Canmore Creek Brewing', 'Fresh Valley Kitchen', 'Altitude Coffee Roasters', 'Basecamp Bagels', 'Peak Performance Cafe']) assert.ok(!html.includes(legacy), 'Unverified venue removed: ' + legacy);
assert.ok(!/\$\s*\d|\bCAD\s*\d|\bI(?:'ve|’ve| have| visited| eaten| recommend)|training camp|ultra runner|maximum 15.minute|Most new restaurants.*don.t take reservations/i.test(html));
assert.ok(!/AggregateRating|ratingValue|priceRange|LocalBusiness|<iframe|<form\b|\bonclick\s*=|<script(?! type="application\/ld\+json")/i.test(html));

const entries = [
  ['good-folk', 'Good Folk', '#1000–600 Banff Avenue', 'https://goodfolkrestaurant.com/'],
  ['crave', 'Crave', '201 Lynx Street', 'https://cravebanff.com/'],
  ['la-terrazza', 'La Terrazza', '201 Lynx Street', 'https://www.banffparklodge.com/la-terrazza/'],
  ['sudden-sally', 'Sudden Sally', '#2000–600 Banff Avenue', 'https://suddensally.com/'],
  ['pizzeria-sophia', 'Pizzeria Sophia', '202 Caribou Street', 'https://www.pizzeriasophiabanff.com/'],
  ['fat-ox', 'The Fat Ox', '415 Banff Avenue', 'https://fatoxbanff.ca/'],
];
assert.equal((html.match(/<h3\b/g) || []).length, 6);
for (const [id, name, address, official] of entries) {
  const section = html.match(new RegExp(`<h3 id="${id}">([\\s\\S]*?)(?=<h[23]\\b)`))?.[1];
  assert.ok(section && section.includes(name) && section.includes(address), `Exact identity/address: ${id}`);
  assert.ok(section.includes('<strong>Booking:</strong>'), `Venue-specific booking guidance: ${id}`);
  assert.ok(section.includes(`href="${official}"`), `Direct native operator handoff: ${id}`);
}
assert.ok(html.includes('news item dated August 20, 2025') && html.includes('does not establish a precise restaurant opening month'));
assert.ok(html.includes('reopened in December 2025') && html.includes('reopened after renovation in April 2026'));
assert.ok(html.includes('Discovery recommendation; opening date not asserted'));
assert.ok(html.includes('recommends reservations and welcomes walk-ins'));
assert.ok(html.includes('ordinary dinner menu is not served on buffet nights'));
assert.ok(html.includes('Alpine Social') && html.includes('Fairmont Chateau Lake Louise, 111 Lake Louise Drive'));
assert.ok(html.includes('rather than Banff town') && html.includes('There is no universal walking time'));

const decode = text => text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const schemaBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
assert.equal(schemaBlocks.length, 1);
const schema = JSON.parse(schemaBlocks[0][1]);
assert.equal(schema['@type'], 'FAQPage');
assert.equal(schema['@context'], 'https://schema.org');
assert.equal(data.diningGuideFaqs.length, 5);
const visibleFaqs = [...html.matchAll(/<details><summary>([^<]+)<\/summary><p>([\s\S]*?)<\/p><\/details>/g)].map(([, question, answer]) => ({ question: decode(question), answer: decode(answer) }));
assert.deepEqual(visibleFaqs, data.diningGuideFaqs);
assert.deepEqual(schema.mainEntity.map(faq => ({ question: faq.name, answer: faq.acceptedAnswer.text })), visibleFaqs);
assert.ok(schema.mainEntity.every(faq => faq['@type'] === 'Question' && faq.acceptedAnswer['@type'] === 'Answer'));

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(ids.length, new Set(ids).size, 'Section IDs must be unique.');
const allowedHosts = new Set(['banffcaribouproperties.com', 'goodfolkrestaurant.com', 'cravebanff.com', 'www.banffparklodge.com', 'www.banfflakelouise.com', 'suddensally.com', 'www.pizzeriasophiabanff.com', 'fatoxbanff.ca', 'www.chateau-lake-louise.com']);
let anchorsOpen = 0, internalLinks = 0, externalLinks = 0;
for (const match of html.matchAll(/<\/?a\b[^>]*>/g)) {
  if (match[0].startsWith('</')) { anchorsOpen--; assert.equal(anchorsOpen, 0, 'No unmatched closing anchor.'); continue; }
  anchorsOpen++; assert.equal(anchorsOpen, 1, 'No nested anchors.');
  const href = decode(match[0].match(/\bhref="([^"]+)"/)?.[1] || ''); assert.ok(href);
  if (href.startsWith('#')) assert.ok(ids.includes(href.slice(1)), 'Fragment exists: ' + href);
  else if (href.startsWith('/')) {
    internalLinks++;
    if (href.startsWith('/towns/')) await access('src/pages/towns/[slug].astro');
    else { try { await access(`src/pages${href}.astro`); } catch { await access(`src/pages${href}/index.astro`); } }
  } else {
    const url = new URL(href); externalLinks++; assert.equal(url.protocol, 'https:'); assert.ok(allowedHosts.has(url.hostname), url.hostname);
    assert.match(match[0], /target="_blank"/); assert.match(match[0], /rel="noopener"/);
    assert.ok(!url.searchParams.has('camref') && !url.searchParams.has('partner_id'), 'Dining sources are direct; no invented affiliate offer.');
  }
}
assert.equal(anchorsOpen, 0);
for (const required of ['/towns/banff', '/towns/lake-louise', '/book/banff-hotels', '/winter-stays', '/ski-day-planner', '/winter', '/what-to-do-today', '/car-free-banff']) assert.ok(html.includes(`href="${required}"`));
assert.ok(html.includes('Hotel comparisons contain affiliate booking links') && html.includes('do not reserve a restaurant or promise a dining discount'));
assert.ok(internalLinks >= 8 && externalLinks >= 15);
const transformed = await transform(html, { filename: 'dining-guide-fragment.astro' });
assert.deepEqual(transformed.diagnostics.filter(diagnostic => diagnostic.severity === 1), []);
const sourceRecord = await readFile('research/dining-guide-sources-2026-10-29.md', 'utf8');
for (const [, , , official] of entries) assert.ok(sourceRecord.includes(official), `Primary-source record: ${official}`);
assert.ok(sourceRecord.includes('2026-04-03') && sourceRecord.includes('not a live'));
console.log(`Dining guide checks passed: one full canonical replacement, 6 verified-address venue sections, dated/undated distinctions, ${words} words, 5 visible/schema FAQs, native operator/internal handoffs, no legacy venues/prices/personal visits, balanced links and Astro fragment transform. No network or site build.`);
