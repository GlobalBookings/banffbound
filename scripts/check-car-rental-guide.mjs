import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { build } from 'esbuild';
import { transform } from '@astrojs/compiler';
import { parseFragment } from 'parse5';

globalThis.fetch = () => { throw Error('No network in car-rental author check'); };
const root = fileURLToPath(new URL('../', import.meta.url));
const read = file => readFile(path.join(root, file), 'utf8');
const slug = 'banff-car-rental-tips';
const posts = (await read('src/data/blogPosts.ts')).match(/const originalBlogPosts:\s*BlogPost\[\]\s*=\s*(\[[\s\S]*?\n\]);/)?.[1];
assert.ok(posts, 'Extract the untouched raw publication array before metadata overlays.');
const bundle = await build({ stdin: { contents: "export * from './src/data/carRentalGuideOverrides.ts';export {blogRedirects} from './src/data/redirects.mjs';export const originalPosts=" + posts + ';', resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'esm' });
const d = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const referrals = [
  'https://www.expedia.ca/Hotel-Search?destination=Banff%2C+Alberta&camref=1101l3MtWX',
  'https://www.getyourguide.com/banff-l284/?partner_id=QW960HO',
];
const sources = [
  'https://www.yyc.com/transportation/car-rentals',
  'https://www.enterprise.com/en/car-rental-locations/ca/ab/calgary-international-airport-c5ei.html',
  'https://www.enterprise.ca/en/car-rental-faqs/canada-general/one-way-car-rental-policy.html',
  'https://www.enterprise.ca/en/car-rental-faqs/canada-reservations/late-returns-policy.html',
  'https://www.alberta.ca/system/files/custom_downloaded_images/tr-swh-winter-tires.pdf',
  'https://www.alberta.ca/safer-winter-highways',
  'https://laws-lois.justice.gc.ca/eng/regulations/C.R.C.,_c._1126/section-40.html',
  'https://www2.gov.bc.ca/gov/content/transportation/driving-and-cycling/traveller-information/seasonal/winter-driving',
  'https://www2.gov.bc.ca/gov/content/transportation/driving-and-cycling/traveller-information/seasonal/winter-driving/about-winter-tires',
  'https://rcmp.ca/en/gazette/just-facts-winter-driving',
  'https://parks.canada.ca/pn-np/ab/jasper/activ/experience/hiver-winter/pcghiver-ipwinter',
  'https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise',
  'https://roamtransit.com/schedules-routes/johnston-canyon-regional-route-9/',
  'https://roamtransit.com/schedules-routes/lake-louise-banff-express-route-8x/',
  'https://parks.canada.ca/pn-np/ab/banff/bulletins/06d4ef61-a3c9-4b65-8dfc-66d056252d6c',
  'https://banffairporter.com/', 'https://511.alberta.ca/', 'https://www.drivebc.ca/',
];
const routes = ['/towns/', '/car-free-banff/', '/calgary-to-banff/', '/trip-cost/', '/park-pass/', '/parking/', '/shuttle-reservations/', '/icefields-parkway-planner/', '/book/banff-hotels/', '/book/lake-louise-stays/'];
const sections = {
  'car-or-car-free': ['Full-stay rental', 'Selected rental days', 'Car-free stay', 'actual address and onward connection', 'separate journeys'],
  'rental-total': ['same party, currency, pickup and return times', 'per-person one-way', 'billed periods', 'taxes and mandatory fees', 'both airport transfers', 'Re-price the whole booking', 'actual total', 'people sharing it'],
  'pickup-driver': ['on-site and off-site', 'flight-delay procedure', 'age, licence, licence language', 'payment card', 'deposit hold', 'coverage', 'provinces, roads and return location', 'gravel-road permission', 'confirmed, merely requested', 'cannot be reserved and depend on availability at arrival', 'not a promise about all brands'],
  'winter-tire-rules': ['Alberta general guidance', 'no blanket winter-tire mandate', 'Specified national-park highways', 'November 1–March 31', 'snow- or ice-covered', 'Icefields Parkway', 'Banff–Windermere', 'Yoho', 'B.C. signed routes', 'October 1–April 30', 'March 31', 'current to September 30, 2026', 'older undated guidance', '3.5 mm', 'M+S', 'AWD/4WD', 'Chains on summer tires do not substitute', 'check chain permission', 'does not shorten slippery-road stopping', 'never travelling a closed road'],
  'destination-access': ['rather than a predicted', 'closed to personal vehicles year-round', 'licensed commercial operators', 'registered Moraine Lake Lodge guests', '2026 season ended October 12', 'do not project it into winter or infer 2027 dates', 'Johnston Canyon is Roam Route 9; Lake Louise is Route 8X', 'approximately November 30', 'October 13–December 11, 2026', 'neither establishes a confirmed reopening', 'before departure and again for the return'],
  'return-car': ['advance booking at participating locations', 'different rates, drop or mileage charges', 'everyone and the luggage', 'record existing damage', 'fuel or charging obligation', 'airline’s required airport arrival', 'any off-site shuttle', 'after-hours', 'until satisfactory check-in the next business day', 'actual branch and agreement', 'final invoice'],
  'rental-booking': ['not a car-rental offer', 'general catalogue', 'Do not assume every listing includes a transfer', 'affiliate links', 'may earn a commission', 'their own policies'],
};
const walk = node => [node, ...(node.childNodes ?? []).flatMap(walk)];
const attr = (node, name) => node.attrs?.find(item => item.name === name)?.value;
const text = node => node.nodeName === '#text' ? node.value : (node.childNodes ?? []).map(text).join('');
const humanText = node => node.tagName === 'script' ? '' : node.nodeName === '#text' ? node.value : (node.childNodes ?? []).map(humanText).join(' ');
const plain = node => humanText(node).replace(/\s+/g, ' ').trim();
const forbidden = /Alberta law requires winter tires|AWD.{0,20}essential|essential for winter confidence|private vehicles are restricted during peak season|parking.{0,30}fills by|fills by.{0,15}(?:AM|morning)|(?:\$|CAD\s*)\s*\d|competitive pricing|Canmore prices are lower|all (?:major )?rental.{0,20}(?:include|supply).{0,20}winter tires|winter tires are guaranteed|guaranteed (?:access|safe|connection)|all (?:guided )?tours include transport|transportation is always included|\b(?:I|we) (?:drove|rented|visited)|my last visit|\d+(?:\.\d+)?\s*hours?.{0,15}(?:YYC|Calgary|Banff)|1\.5 hours|AggregateRating|ratingValue|priceRange/i;
function validate(body, metadata) {
  const tree = parseFragment(body), all = walk(tree), visibleText = plain(tree);
  const words = visibleText.split(/\s+/).length;
  assert.ok(words >= 1500 && words <= 2250, `Complete bounded guide, actual output ${words} words`);
  assert.ok(!forbidden.test(visibleText), 'Reject unsupported legacy/live/price/safety assertions');
  assert.deepEqual(Object.keys(metadata).sort(), ['title', 'description', 'lastUpdated', 'readTime', 'imageIsIllustrative', 'imageNote'].sort());
  assert.equal(metadata.lastUpdated, '2026-10-29'); assert.equal(metadata.imageIsIllustrative, true);
  assert.match(metadata.imageNote, /Illustrative image; not verified/);
  const ids = all.map(node => attr(node, 'id')).filter(Boolean); assert.equal(new Set(ids).size, ids.length);
  assert.equal(all.filter(node => node.tagName === 'table').length, 2);
  assert.equal(all.filter(node => node.tagName === 'caption').length, 2);
  assert.equal(all.filter(node => node.tagName === 'th' && attr(node, 'scope') === 'row').length, 6);
  assert.ok(all.some(node => node.tagName === 'nav' && attr(node, 'aria-label') === 'Banff car rental guide sections'));
  for (const [id, markers] of Object.entries(sections)) {
    const start = body.indexOf(`id="${id}"`); assert.ok(start >= 0, 'Named decision section: ' + id);
    const from = body.indexOf('</h2>', start) + 5, until = body.indexOf('<h2', from);
    const section = plain(parseFragment(body.slice(from, until === -1 ? body.length : until)));
    for (const marker of markers) assert.ok(section.includes(marker), `${id}: ${marker}`);
  }
  const links = all.filter(node => node.tagName === 'a');
  for (const expected of [...sources, ...referrals, ...routes]) assert.ok(links.some(node => attr(node, 'href') === expected), 'Exact authored handoff: ' + expected);
  for (const link of links) {
    const href = attr(link, 'href'); assert.ok(href); assert.equal(walk(link).filter(node => node.tagName === 'a').length, 1);
    if (href.startsWith('#')) assert.ok(ids.includes(href.slice(1)), 'Working fragment: ' + href);
    else if (href.startsWith('/')) assert.ok(routes.includes(href), 'Only identified internal journey: ' + href);
    else {
      const url = new URL(href); assert.equal(url.protocol, 'https:');
      assert.ok([...sources, ...referrals].includes(href), 'No unknown external destination: ' + href);
      assert.equal(attr(link, 'target'), '_blank');
      const rel = attr(link, 'rel')?.split(/\s+/) ?? []; assert.ok(rel.includes('noopener'));
      assert.equal(rel.includes('sponsored'), referrals.includes(href), 'Honest source/referral purpose');
    }
  }
  const scripts = all.filter(node => node.tagName === 'script'); assert.equal(scripts.length, 1);
  assert.equal(attr(scripts[0], 'type'), 'application/ld+json'); assert.equal(attr(scripts[0], 'src'), undefined);
  const schema = JSON.parse(text(scripts[0])); assert.equal(schema['@context'], 'https://schema.org'); assert.equal(schema['@type'], 'FAQPage');
  const details = all.filter(node => node.tagName === 'details'); assert.equal(details.length, 5); assert.equal(schema.mainEntity.length, 5);
  for (const [index, faq] of d.carRentalGuideFaqs.entries()) {
    assert.equal(plain(details[index].childNodes.find(node => node.tagName === 'summary')), faq.question);
    assert.equal(plain(details[index].childNodes.find(node => node.tagName === 'p')), faq.answer);
    assert.deepEqual(schema.mainEntity[index], { '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } });
  }
  assert.ok(!all.some(node => ['form', 'input', 'iframe', 'img', 'object', 'embed', 'button'].includes(node.tagName)), 'Full static content and native links; no data collection or provider embed');
  assert.ok(!all.some(node => node.attrs?.some(item => /^on/i.test(item.name))), 'No inline handlers');
  assert.ok(visibleText.includes('Full guide reviewed October 29, 2026'));
  return words;
}

assert.equal(d.reviewDate, '2026-10-29');
assert.deepEqual(Object.keys(d.carRentalGuideOverrides), [slug]); assert.deepEqual(Object.keys(d.carRentalGuideMetadata), [slug]);
assert.equal(d.carRentalGuideFaqs.length, 5); assert.deepEqual(Object.values(d.carRentalGuideSources).sort(), sources.slice().sort());
assert.equal(d.originalPosts.find(post => post.slug === slug)?.date, '2025-09-11', 'Raw original publication, independent of future metadata/registry integration');
assert.equal(d.blogRedirects[slug], undefined); assert.equal(Object.values(d.blogRedirects).filter(target => target === slug).length, 0);
const raw = (await read('src/data/blogContent.ts')).split("'" + slug + "': `")[1]?.split('\n`,')[0]; assert.ok(raw);
assert.ok(!/\bid=["']/.test(raw), 'No existing fragments to lose');
const rawReferralHrefs = [...raw.matchAll(/href="([^"]*(?:camref=|partner_id=)[^"]*)"/g)].map(match => match[1]);
assert.deepEqual(rawReferralHrefs, referrals, 'Preserve every useful original referral and its exact encoded query');
const body = d.carRentalGuideOverrides[slug], metadata = d.carRentalGuideMetadata[slug], words = validate(body, metadata);
for (const route of routes) {
  const pathname = route.replace(/\/$/, ''); let found = false;
  for (const file of [pathname + '.astro', pathname + '/index.astro']) try { await access(path.join(root, 'src/pages', file)); found = true; } catch { /* Try alternate static route form. */ }
  assert.ok(found, 'Actual internal route exists: ' + route);
}
const compilation = await transform('---\n---\n' + body, { filename: slug + '.astro' });
assert.deepEqual(compilation.diagnostics.filter(item => item.severity === 1), []);
let negativeCount = 0;
const rejects = (mutant, label, meta = metadata) => { assert.notEqual(mutant, body, 'Mutation must change actual output: ' + label); assert.throws(() => validate(mutant, meta), label); negativeCount++; };
for (const [from, to, label] of [
  ['Johnston Canyon is Roam Route 9; Lake Louise is Route 8X', 'Johnston Canyon is Roam Route 8X; Lake Louise is Route 9', 'Wrong Roam destination'],
  ['no blanket winter-tire mandate', 'Alberta law requires winter tires everywhere', 'Wrong provincial scope'],
  ['November 1–March 31', 'October 1–April 30', 'Wrong federal period'],
  ['closed to personal vehicles year-round', 'restricted to personal vehicles during peak season', 'Moraine year-round rule lost'],
  ['cannot be reserved and depend on availability at arrival', 'are guaranteed with every SUV', 'Requested equipment treated as confirmed'],
  ['advance booking at participating locations', 'unannounced return at any branch', 'One-way agreement lost'],
  ['until satisfactory check-in the next business day', 'until keys are dropped in any box', 'After-hours responsibility changed'],
  ['neither establishes a confirmed reopening', 'both guarantee a confirmed reopening', 'Conflicting source end dates became live access'],
  ['Chains on summer tires do not substitute', 'Chains on summer tires substitute', 'BC passenger equipment conflation'],
  ['partner_id=QW960HO', 'partner_id=WRONG', 'Affiliate partner ID altered'],
  ['camref=1101l3MtWX', 'camref=WRONG', 'Expedia camref altered'],
  ['destination=Banff%2C+Alberta', 'destination=Jasper%2C+Alberta', 'Native accommodation destination changed'],
  ['https://www.yyc.com/transportation/car-rentals', 'https://example.org/car-rentals', 'Primary source swapped'],
  ['href="#rental-total"', 'href="#missing"', 'Broken section navigation'],
  ['<summary>' + d.carRentalGuideFaqs[0].question, '<summary>A different question', 'Visible FAQ divergence'],
  ['<p>' + d.carRentalGuideFaqs[0].answer, '<p>A different answer', 'Visible answer divergence'],
]) rejects(body.replace(from, to), label);
for (const claim of ['AWD is essential for winter confidence.', 'Parking fills by 7 AM.', 'All tours include transport.', 'Rental cars cost $50 per day.', 'We rented one last week.', 'This is guaranteed safe travel.', 'The drive takes1.5 hours.']) rejects(body + '<p>' + claim + '</p>', 'Reject unsupported added claim: ' + claim);
rejects(body + '<script src="https://example.org/vendor.js"></script>', 'Reject provider injection');
rejects(body + '<a href="javascript:alert(1)">Open</a>', 'Reject unsafe native URL');
rejects(body + '<input name="licence-number">', 'Reject personal-data field');
rejects(body + '<a href="#rental-total" onclick="alert(1)">Total</a>', 'Reject inline handler');
assert.throws(() => validate(body, { ...metadata, date: '2026-10-29' })); negativeCount++;
assert.throws(() => validate(body, { ...metadata, imageIsIllustrative: false })); negativeCount++;
const note = await read('research/car-rental-guide-sources-2026-10-29.md');
for (const marker of [...sources, ...referrals, '2025-09-11', 'no fragment IDs', 'no', 'approximately Nov30', '2026-09-30', 'undated', 'No unverified product route']) assert.ok(note.includes(marker), 'Source scope and exact identity note: ' + marker);
console.log(`Car-rental guide passed: ${words} words; exact raw 2025-09-11 publication, 2 useful inherited referral URLs, 18 identified primary links, 10 real internal routes, 2 decision tables, 5 visible/schema FAQ pairs, actual Astro fragment compilation and ${negativeCount} material negative fixtures. No network, site build, registry count assumption or file output.`);
