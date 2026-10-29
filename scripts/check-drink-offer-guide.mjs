import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { transform } from '@astrojs/compiler';

// Offline content/source contracts. Operator availability and future offers remain external.
const { outputFiles } = await build({ stdin: { contents: "export * from './src/data/drinkOfferGuideOverrides.ts'; export {allBlogPosts} from './src/data/blogPosts.ts'; export {blogRedirects} from './src/data/redirects.mjs';", resolveDir: process.cwd() }, bundle: true, write: false, platform: 'node', format: 'esm' });
const data = await import('data:text/javascript;base64,' + Buffer.from(outputFiles[0].text).toString('base64'));
const slug = 'drink-deals';
assert.deepEqual(Object.keys(data.drinkOfferGuideOverrides), [slug]);
assert.deepEqual(Object.keys(data.drinkOfferGuideMetadata), [slug]);
assert.equal(data.reviewDate, '2026-10-29');
assert.equal(Object.hasOwn(data.blogRedirects, slug), false, 'Preserve the canonical URL.');
const post = data.allBlogPosts.find(post => post.slug === slug);
assert.equal(post?.date, '2026-03-14', 'The original publication date is preserved.');
const metadata = data.drinkOfferGuideMetadata[slug];
assert.equal(metadata.date, undefined);
assert.equal(metadata.lastUpdated, data.reviewDate);
assert.equal(metadata.imageIsIllustrative, true);
assert.match(metadata.imageNote, /not a verified view/);
assert.ok(!/cheapest|guaranteed|2026.*best|\$\d/i.test(metadata.title + metadata.description));
const html = data.drinkOfferGuideOverrides[slug];
const text = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const words = text.split(' ').length;
assert.ok(words >= 1000 && words <= 1900, `A useful three-format guide: ${words} words.`);
assert.ok(html.indexOf('Offers checked October 29, 2026') < html.indexOf('<table>'), 'Date-bound evidence before the comparison.');
assert.equal((html.match(/<th scope="row">/g) || []).length, 3);
assert.ok(html.includes('<caption>Published offer formats reviewed October 29, 2026'));
const offerIds = ['rose-crown-offer', 'high-rollers-offer', 'sky-bistro-offer'];
const sections = Object.fromEntries(offerIds.map(id => [id, html.match(new RegExp(`<h2 id="${id}">([\\s\\S]*?)(?=<h2\\b)`))?.[1]]));
assert.ok(Object.values(sections).every(Boolean));
assert.ok(sections['rose-crown-offer'].includes('2–5 p.m.') && sections['rose-crown-offer'].includes('9–11 p.m.'));
assert.ok(sections['rose-crown-offer'].includes('current happy-hour menu') && sections['rose-crown-offer'].includes('any food requirement'));
const rollers = sections['high-rollers-offer'];
assert.ok(rollers.includes('conflicting weekday bowling happy-hour times') && rollers.includes('confirm the time'));
assert.ok(!/\b(?:3[–-]5|4[–-]6)\s*p\.?m/i.test(rollers), 'Do not pick one assured weekday period from conflicting source sections.');
assert.ok(rollers.includes('not available on holidays or long weekends'));
assert.ok(rollers.includes('“Bowling Lanes”') && rollers.includes('non-refundable') && rollers.includes('charged on booking'));
assert.ok(rollers.includes('https://www.highrollersbanff.com/reserve"') && rollers.includes('https://www.highrollersbanff.com/reserve/bowling"'));
const sky = sections['sky-bistro-offer'];
assert.ok(sky.includes('3–5 p.m.') && sky.includes('50% off local beer, house wine and selected shareable plates'));
assert.ok(sky.includes('book Banff Gondola admission separately'));
assert.ok(sky.includes('Reservations are encouraged; walk-ins depend on availability'));
assert.ok(sky.includes('does not guarantee sunset light'));
assert.ok(html.includes('per person, per lane or for a particular duration'));
assert.ok(html.includes('taxes, mandatory charges') && html.includes('payment and cancellation'));
assert.ok(html.includes('any required purchase') || html.includes('any food purchase'));
for (const legacy of ['Banff Après Week', 'Thirsty Thursday', 'every tenth drink free', 'March 2026', 'Monday Mountain Specials', 'Whiskey Wednesdays']) assert.ok(!html.includes(legacy), `Remove unsupported or obsolete programme: ${legacy}`);
assert.ok(!/\$\s*\d|\bCAD\s*\d|\bI(?:'ve|’ve| have| visited| recommend)|training camp|As someone|guaranteed savings|most hotels offer.*shuttle|Banff Transit operates until/i.test(html));
assert.ok(!/legal drinking age|valid ID|government.issued|AGLC|AggregateRating|ratingValue|priceRange|LocalBusiness/i.test(html), 'No unsourced legal, rating, price or live business schema claims.');
assert.ok(!/<iframe|<form\b|\bonclick\s*=|<script(?! type="application\/ld\+json")/i.test(html));

const decode = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
assert.equal(blocks.length, 1);
const schema = JSON.parse(blocks[0][1]);
const visible = [...html.matchAll(/<details><summary>([^<]+)<\/summary><p>([\s\S]*?)<\/p><\/details>/g)].map(([, question, answer]) => ({ question: decode(question), answer: decode(answer) }));
assert.equal(data.drinkOfferGuideFaqs.length, 5); assert.deepEqual(visible, data.drinkOfferGuideFaqs);
assert.equal(schema['@context'], 'https://schema.org'); assert.equal(schema['@type'], 'FAQPage');
assert.deepEqual(schema.mainEntity.map(faq => ({ question: faq.name, answer: faq.acceptedAnswer.text })), visible);
assert.ok(schema.mainEntity.every(faq => faq['@type'] === 'Question' && faq.acceptedAnswer['@type'] === 'Answer'));

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(ids.length, new Set(ids).size);
const expectedSources = [
  'https://roseandcrown.ca/', 'https://roseandcrown.ca/menu/happy-hour-menu/', 'https://roseandcrown.ca/events/',
  'https://www.highrollersbanff.com/', 'https://www.highrollersbanff.com/reserve', 'https://www.highrollersbanff.com/reserve/bowling',
  'https://www.banffjaspercollection.com/dining/sky-bistro/', 'https://www.banffjaspercollection.com/dining/sky-bistro/reserve-a-table/', 'https://www.banffjaspercollection.com/dining/sky-bistro/location-hours/',
];
const external = new Set(); let open = 0;
for (const match of html.matchAll(/<\/?a\b[^>]*>/g)) {
  if (match[0].startsWith('</')) { open--; assert.equal(open, 0); continue; }
  open++; assert.equal(open, 1, 'No nested anchors.');
  const href = decode(match[0].match(/\bhref="([^"]+)"/)?.[1] || ''); assert.ok(href);
  if (href.startsWith('#')) assert.ok(ids.includes(href.slice(1)), 'Existing fragment: ' + href);
  else if (href.startsWith('/blog/')) {
    const linkedSlug = href.replace(/^\/blog\//, '').replace(/\/$/, '');
    assert.ok(data.allBlogPosts.some(post => post.slug === linkedSlug), 'Existing related canonical: ' + linkedSlug);
    assert.equal(Object.hasOwn(data.blogRedirects, linkedSlug), false);
  } else if (href.startsWith('/towns/')) await access('src/pages/towns/[slug].astro');
  else if (href.startsWith('/')) {
    const route = href.replace(/\/$/, '');
    try { await access('src/pages' + route + '.astro'); } catch { await access('src/pages' + route + '/index.astro'); }
  } else {
    const url = new URL(href); assert.equal(url.protocol, 'https:'); assert.ok(expectedSources.includes(href), 'Identified primary source: ' + href);
    assert.equal(url.search, ''); assert.match(match[0], /target="_blank"/); assert.match(match[0], /rel="noopener"/); external.add(href);
  }
}
assert.equal(open, 0); assert.deepEqual([...external].sort(), expectedSources.slice().sort());
for (const route of ['/blog/new-places-to-eat-in-banff/', '/blog/banff-apres-ski/', '/car-free-banff', '/ski-day-planner', '/towns/banff', '/events', '/book/banff-hotels/']) assert.ok(html.includes(`href="${route}"`));
assert.ok(html.includes('accommodation booking links do not reserve a table or supply a drinks discount'));
const transformed = await transform(html, { filename: 'drink-offer-guide-fragment.astro' });
assert.deepEqual(transformed.diagnostics.filter(diagnostic => diagnostic.severity === 1), []);
const sourceNote = await readFile('research/drink-offer-guide-sources-2026-10-29.md', 'utf8');
for (const url of expectedSources) assert.ok(sourceNote.includes(url));
assert.ok(sourceNote.includes('2026-03-14') && sourceNote.includes('3–5') && sourceNote.includes('4–6') && sourceNote.includes('conflict'));
assert.ok(sourceNote.includes('not a live'));
console.log(`Drink-offer guide checks passed: exact canonical/original publication, 3 dated offer formats, source conflict and total-cost constraints, ${words} words, 5 matching visible/schema FAQs, 9 direct primary URLs/native related links, illustrative hero metadata and Astro fragment transform. No network or site build.`);
