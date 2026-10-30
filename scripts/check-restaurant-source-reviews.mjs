import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { build } from 'esbuild';

// Actual projection, raw arrays and parallel Banff reviews; no HTTP, booking or site build.
globalThis.fetch = () => { throw new Error('Network is forbidden in this source-projection check'); };
const rawSourceBefore = await readFile('src/data/restaurants.ts', 'utf8');
const { outputFiles } = await build({ stdin: { contents: "export * from './src/data/restaurantSourceReviews.ts';export {restaurants,drinkSpots} from './src/data/restaurants.ts';export {banffDiningSourceReviews} from './src/data/banffDiningSourceReviews.ts';", resolveDir: process.cwd() }, bundle: true, write: false, platform: 'node', format: 'esm' });
const m = await import('data:text/javascript;base64,' + Buffer.from(outputFiles[0].text).toString('base64'));
const { restaurants, drinkSpots, restaurantSourceReviews: reviews, banffDiningSourceReviews: banff, buildDiningDirectory: buildDirectory, projectDiningVenue: project } = m;
const rawBefore = JSON.stringify({ restaurants, drinkSpots });
const localSlugs = ['the-alpine-social','blake-brewpub','the-iron-goat','baker-creek-bistro','pd3-by-blake','lake-louise-station','fairview-dining-room','walliser-stube','trailhead-cafe','bill-peytos-cafe','tavern-1883','crazyweed-kitchen','the-drake-canmore','storm-mountain-lodge'];
assert.equal(restaurants.length, 27); assert.equal(drinkSpots.length, 5);
assert.equal(m.restaurantSourceReviewedAt, '2026-10-29');
assert.deepEqual(new Set(Object.keys(reviews)), new Set(localSlugs));
assert.deepEqual(new Set(Object.keys(reviews)), new Set(restaurants.filter(venue => venue.area !== 'Banff').map(venue => venue.slug)), 'Own exactly the14 existing non-Banff venues; no invented Post Hotel record.');
assert.equal(Object.values(reviews).filter(review => review.status === 'selected-facts').length, 12);
assert.deepEqual(Object.entries(reviews).filter(([,review]) => review.status === 'pending').map(([slug]) => slug).sort(), ['pd3-by-blake','trailhead-cafe']);
assert.equal(Object.keys(banff).length, 18); assert.ok(Object.keys(banff).every(slug => !Object.hasOwn(reviews, slug)));

const local = buildDirectory(), combined = buildDirectory(banff);
assert.deepEqual(local.restaurants, m.directoryRestaurants); assert.deepEqual(local.drinkSpots, m.directoryDrinkSpots); assert.deepEqual(local.venues, m.directoryDiningVenues);
assert.equal(local.venues.filter(venue => venue.sourceReview.status === 'unreviewed').length, 18);
assert.equal(combined.venues.filter(venue => venue.sourceReview.status === 'selected-facts').length, 30);
assert.equal(combined.venues.filter(venue => venue.sourceReview.status === 'pending').length, 2);
assert.equal(combined.venues.filter(venue => venue.sourceReview.status === 'unreviewed').length, 0);
assert.deepEqual(combined.restaurants.map(venue => venue.slug), restaurants.map(venue => venue.slug));
assert.deepEqual(combined.drinkSpots.map(venue => venue.slug), drinkSpots.map(venue => venue.slug));
assert.deepEqual(combined.venues.map(venue => venue.kind), [...restaurants.map(() => 'restaurant'), ...drinkSpots.map(() => 'drink')]);
assert.equal(new Set(combined.venues.map(venue => venue.slug)).size, 32);
for (const [area, count] of [['Banff',13],['Lake Louise',6],['Canmore',6],['Highway 1A',2]]) assert.equal(m.getDirectoryRestaurantsByArea(area, banff).length, count);

const allReviews = { ...banff, ...reviews };
for (const entry of combined.venues) {
  const review = allReviews[entry.slug], raw = [...restaurants, ...drinkSpots].find(venue => venue.slug === entry.slug);
  assert.equal(entry.importedName, raw.name, 'Retain the original identity label separately from current display name.');
  for (const field of ['name','area','description','type','cuisine','address','phone','serviceNote','journeyNote']) assert.equal(entry[field], review[field], 'Only selected review data for ' + entry.slug + ':' + field);
  for (const field of ['website','menuUrl','reserveUrl']) assert.equal(entry[field], review[field], 'Preserve verified native route exactly: ' + entry.slug + ':' + field);
  for (const field of ['hours','priceRange','image','lat','lng']) assert.equal(entry[field], null, 'No unverified raw-field fallback: ' + entry.slug + ':' + field);
  assert.equal(entry.sourceReview.checkedOn, '2026-10-29'); assert.equal(entry.sourceReview.status, review.status);
  assert.equal(entry.sourceReview.label, review.status === 'selected-facts' ? 'Details checked' : 'Check details');
  assert.ok(entry.sourceReview.scope.length > 50); assert.ok(entry.sourceReview.sources.length > 0);
  assert.equal(entry.imageProvenance.status, 'not-verified'); assert.equal(entry.imageProvenance.identityVerified, false); assert.equal(entry.imageProvenance.licenceReviewed, false);
  assert.equal(entry.coordinateProvenance.status, 'not-verified');
  for (const field of ['rating','reviewCount','openingHours','geo','availability','openNow','photoVerified','licensedImage']) assert.equal(entry[field], undefined);
  for (const url of [entry.website,entry.menuUrl,entry.reserveUrl,...entry.sourceReview.sources.map(source => source.url),...entry.enquiryLinks.map(link => link.url),...entry.notices.map(notice => notice.url)].filter(Boolean)) {
    const parsed = new URL(url); assert.equal(parsed.protocol, 'https:'); assert.equal(parsed.username, ''); assert.equal(parsed.password, '');
  }
}

const venue = slug => combined.venues.find(item => item.slug === slug);
for (const slug of ['the-alpine-social','fairview-dining-room','walliser-stube']) {
  const entry = venue(slug); assert.match(entry.address, /^111 Lake Louise Drive/); assert.equal(entry.phone, '(403) 522-1817');
  assert.match(entry.journeyNote, /beside the lake.*separate from Lake Louise village and the ski resort/);
  assert.equal(entry.notices.length, 1); assert.equal(entry.notices[0].from, '2026-10-26'); assert.equal(entry.notices[0].through, '2026-10-29');
  assert.match(entry.notices[0].text, /registered overnight guests.*does not establish access on a later date/);
}
assert.match(venue('the-alpine-social').serviceNote, /summer walk-in seating.*priority for in-house guests/);
assert.equal(venue('the-alpine-social').reserveUrl, null);
assert.match(venue('blake-brewpub').address, /^810 Bow Valley Trail/); assert.equal(venue('blake-brewpub').phone, '(403) 675-3663');
assert.match(venue('blake-brewpub').serviceNote, /first come, first served.*Private functions/); assert.equal(venue('blake-brewpub').reserveUrl, null);
assert.match(venue('the-iron-goat').address, /^703 Benchlands Trail/);
assert.equal(venue('the-iron-goat').reserveUrl, 'https://www.tbdine.com/book/restaurant/the-iron-goat?idApp=100&language=en-us');
assert.match(venue('baker-creek-bistro').name, /Creekside Café/); assert.match(venue('baker-creek-bistro').description, /grab-and-go breakfast, lunch and snacks/);
for (const field of ['phone','menuUrl','reserveUrl']) assert.equal(venue('baker-creek-bistro')[field], null);
assert.match(venue('baker-creek-bistro').sourceReview.scope, /closure or changeover date.*not established/);
const pd3 = venue('pd3-by-blake'); assert.equal(pd3.sourceReview.status, 'pending');
for (const field of ['type','cuisine','address','phone','website','menuUrl','reserveUrl']) assert.equal(pd3[field], null);
assert.match(pd3.serviceNote, /not a closure notice/); assert.equal(pd3.enquiryLinks[0].url, 'https://www.blakecanmore.com/contact');
assert.match(pd3.enquiryLinks[0].label, /not a verified PD3 location/);
const station = venue('lake-louise-station'); assert.equal(station.menuUrl, null); assert.equal(station.reserveUrl, null); assert.equal(station.phone, null);
assert.match(station.description, /renovation closure/); assert.ok(station.notices.some(notice => /extended closure.*does not establish reopening/.test(notice.text)));
assert.match(station.serviceNote, /No reopening date or active meal service is established/);
assert.equal(venue('trailhead-cafe').sourceReview.status, 'pending'); assert.match(venue('trailhead-cafe').sourceReview.scope, /tourism-listed name and mall location only/);
for (const field of ['phone','website','menuUrl','reserveUrl']) assert.equal(venue('trailhead-cafe')[field], null);
assert.match(venue('bill-peytos-cafe').website, /\/en\/hostels\/hi-lake-louise$/); assert.equal(venue('bill-peytos-cafe').menuUrl, null);
assert.match(venue('bill-peytos-cafe').journeyNote, /hostel’s general contact/);
assert.match(venue('tavern-1883').address, /^709 9th Street/); assert.match(venue('tavern-1883').serviceNote, /minors until 10 pm/);
assert.match(venue('crazyweed-kitchen').serviceNote, /patio and bar seating are first come, first served/);
assert.equal(venue('the-drake-canmore').phone, '(403) 675-2206'); assert.match(venue('the-drake-canmore').name, /Screaming Retriever/);
assert.match(venue('the-drake-canmore').serviceNote, /differing opening-hour wording.*not repeated/);
assert.match(venue('storm-mountain-lodge').address, /Highway 93 South/); assert.match(venue('storm-mountain-lodge').serviceNote, /reservations.*conflicting seasonal weekdays/);
assert.equal(venue('storm-mountain-lodge').reserveUrl, 'https://widgets.libroreserve.com/WEB/QC016588618315/book');

// Unknowns remain unknown; a pending local review cannot be overwritten by a
// differently scoped batch, and hostile optional data cannot become a native CTA.
const rawBison = restaurants.find(venue => venue.slug === 'the-bison-restaurant');
const unchecked = project(rawBison, 'restaurant'); assert.equal(unchecked.sourceReview.status, 'unreviewed'); assert.equal(unchecked.sourceReview.checkedOn, null);
for (const field of ['type','cuisine','address','phone','website','menuUrl','reserveUrl','hours','priceRange','image','lat','lng']) assert.equal(unchecked[field], null);
assert.equal(unchecked.name, rawBison.name); assert.equal(unchecked.areaVerified, false);
const malicious = { ...banff['the-bison-restaurant'], website: 'javascript:alert(1)', menuUrl: 'https://user:secret@example.invalid/menu', reserveUrl: 'http://example.invalid/book', sources: [{label:'Unsafe',url:'data:text/html,unsafe'}], enquiryLinks: [{label:'Unsafe',url:'//evil.invalid/'}], notices: [{label:'Unsafe',text:'Unsafe',url:'javascript:alert(1)'}], image:'https://example.invalid/photo', lat:1,lng:2, hours:'Always open',priceRange:'$' };
const guarded = project(rawBison, 'restaurant', { 'the-bison-restaurant': malicious });
for (const field of ['website','menuUrl','reserveUrl','image','lat','lng','hours','priceRange']) assert.equal(guarded[field], null);
assert.deepEqual(guarded.enquiryLinks, []); assert.deepEqual(guarded.notices, []); assert.deepEqual(guarded.sourceReview.sources, []);
assert.equal(project(restaurants.find(venue => venue.slug === 'pd3-by-blake'),'restaurant',{'pd3-by-blake':banff['the-bison-restaurant']}).sourceReview.status,'pending');
assert.equal(buildDirectory({'does-not-exist':banff['the-bison-restaurant']}).venues.length,32);

// Check copy isolation: consumers may sort/filter/edit a view without changing
// the author evidence or raw data used by another page.
const reviewsBefore = JSON.stringify({reviews,banff});
combined.venues[0].highlights.push('test only'); combined.venues[0].sourceReview.sources[0].label = 'test only';
station.notices[0].text = 'test only'; pd3.enquiryLinks[0].label = 'test only'; venue('baker-creek-bistro').sourceReview.notes.push('test only');
assert.equal(JSON.stringify({reviews,banff}),reviewsBefore);
assert.equal(JSON.stringify({restaurants,drinkSpots}),rawBefore);
assert.equal(await readFile('src/data/restaurants.ts','utf8'),rawSourceBefore);
console.log('Restaurant source checks passed:14 non-Banff reviews (12 selected-fact,2 pending), combined30 selected-fact/2 pending across exactly27 restaurants+5 drinks; all32 slugs/kinds/order and raw arrays preserved; native routes, scoped closures/access, unresolved-field suppression, no price/hour/image/GPS leakage, URL guards and copy isolation. No network or site build.');
