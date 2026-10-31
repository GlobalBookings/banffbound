#!/usr/bin/env node
/**
 * Publish a deterministic mobile snapshot from reviewed website content.
 * Run from the repository after npm ci: node mobile/scripts/sync-content.mjs
 * --check fails on drift without writing. No network requests or live-status imports.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';

const root = fileURLToPath(new URL('../../', import.meta.url));
const destination = path.join(root, 'mobile/src/data');
const require = createRequire(path.join(root, 'package.json'));
const { build } = require('esbuild'); // Astro's installed build tool; generation only.
const check = process.argv.includes('--check');
const sourceModules = {
  lakes: 'src/data/lakePlanning.ts',
  trails: 'src/data/trails.ts',
  hotels: 'src/data/hotelDirectory.ts',
  dining: 'src/data/restaurantSourceReviews.ts',
  banffDining: 'src/data/banffDiningSourceReviews.ts',
  winter: 'src/data/winterActivityCatalogue.ts',
  planner: 'src/data/tripPlanner.ts',
  pass: 'src/data/parkPassPlanning.ts',
  budget: 'src/data/tripCostPlanning.ts',
  packing: 'src/data/packingGuideOverrides.ts',
  car: 'src/data/carRentalGuideOverrides.ts',
};
const result = await build({
  stdin: { contents: Object.entries(sourceModules).map(([name, file]) => `export * as ${name} from './${file}';`).join('\n'), resolveDir: root },
  bundle: true, write: false, format: 'esm', platform: 'node', target: 'es2022', logLevel: 'silent',
});
const source = await import('data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64'));
const hash = value => createHash('sha256').update(value).digest('hex');
const absolute = value => value.startsWith('/') ? 'https://banffbound.com' + value : value;
const area = value => /canmore/i.test(value) ? 'canmore' : /louise/i.test(value) ? 'louise' : /parkway|yoho|highway|bow valley|castle/i.test(value) ? 'regional' : 'banff';
const trails = new Map(source.trails.trails.filter(item => item.directoryEligible !== false && item.routeVerified).map(item => [item.slug, item]));
const places = [];
const add = place => {
  if (places.some(item => item.id === place.id)) throw new Error('Duplicate place: ' + place.id);
  places.push(place);
};
const lakeImage = {
  'lake-louise': '/images/winter-activities/lake-louise-frozen.jpg',
  'moraine-lake': '/images/blog/moraine-lake-guide.webp',
  minnewanka: '/images/blog/lake-minnewanka-guide.webp',
  'two-jack': '/images/blog/two-jack-lake-guide.webp',
  johnson: '/images/blog/johnson-lake.webp',
  vermilion: '/images/blog/vermilion-lakes.webp',
  peyto: '/images/blog/peyto-lake-guide.webp',
  'bow-lake': '/images/blog/bow-lake-guide.webp',
};
const lakeTrail = { 'lake-louise': 'lake-louise-lakeshore', 'moraine-lake': 'moraine-lake-lakeshore', minnewanka: 'stewart-canyon', johnson: 'johnson-lake', peyto: 'peyto-lake-viewpoint' };
for (const lake of source.lakes.lakePlans.filter(item => item.area !== 'yoho')) {
  const point = trails.get(lakeTrail[lake.id]);
  let image = lakeImage[lake.id];
  if (image) { try { await readFile(path.join(root, 'public', image)); } catch { image = undefined; } }
  add({
    id: lake.id, name: lake.name, category: 'lakes', area: lake.area === 'parkway' ? 'regional' : lake.area,
    description: lake.description, ...(image ? { image: absolute(image), imageNote: lake.id === 'lake-louise' ? 'Lake Louise in winter, 2018. Photograph is not a current conditions report.' : 'Existing BanffBound editorial image; illustrative, not current conditions.' } : {}),
    ...(point ? { latitude: point.lat, longitude: point.lng } : {}), coordinateStatus: point ? 'indicative' : 'unavailable',
    ...(point ? { coordinateNote: 'Indicative website route locator, not a surveyed meeting point or navigation instruction.' } : {}),
    season: lake.seasons.length === 2 ? 'all' : lake.seasons[0], guideUrl: absolute(lake.guide.href), sourceUrl: lake.source,
    reviewedAt: source.lakes.lakePlanningReviewedAt,
    tips: [lake.land, lake.journey, lake.winter],
    bookingRequired: lake.id === 'moraine-lake',
    ...(lake.id === 'lake-louise' ? { plannerActivityId: 'lake', offlineGuideId: 'lake-louise' } : lake.id === 'moraine-lake' ? { plannerActivityId: 'moraine', offlineGuideId: 'moraine-lake' } : { offlineGuideId: 'lake-visits' }),
  });
}

const trailSlugs = ['fenland-trail', 'tunnel-mountain-summit', 'stewart-canyon', 'johnston-canyon-lower-falls', 'lake-agnes', 'bow-river-lake-louise', 'sunshine-meadows', 'surprise-corner-to-hoodoos'];
for (const slug of trailSlugs) {
  const trail = trails.get(slug);
  if (!trail) throw new Error('Missing reviewed trail: ' + slug);
  const townArea = /lake-louise|lake-agnes/.test(slug) ? 'louise' : 'banff';
  add({
    id: slug, name: trail.name, category: 'walks', area: townArea,
    description: trail.description, latitude: trail.lat, longitude: trail.lng, coordinateStatus: 'indicative',
    coordinateNote: 'Indicative trail locator retained from the website; use the official route map and signed trailhead.',
    season: 'summer', guideUrl: absolute('/trails/' + slug), sourceUrl: trail.parksCanadaUrl,
    reviewedAt: trail.reviewedAt,
    tips: [trail.distance + '; ' + trail.time + '. This is the reviewed summer route profile.', trail.accessNote, trail.winterNote],
    plannerActivityId: slug === 'lake-agnes' ? 'agnes' : 'hike', offlineGuideId: 'walking-and-hiking',
  });
}

const winterSelection = ['banff-gondola', 'first-ski-lesson', 'norquay-tubing', 'managed-ice-skating', 'cross-country-skiing', 'cave-and-basin', 'whyte-museum'];
const winterSources = {
  'banff-gondola': 'https://www.banffjaspercollection.com/attractions/banff-gondola/',
  'first-ski-lesson': 'https://www.skibig3.com/ski/lessons/',
  'norquay-tubing': 'https://banffnorquay.com/tubing/',
  'managed-ice-skating': 'https://banff.ca/110/Outdoor-Ice-Skating',
  'cross-country-skiing': 'https://www.albertaparks.ca/parks/kananaskis/canmore-nordic-centre-pp/',
  'cave-and-basin': 'https://parks.canada.ca/lhn-nhs/ab/caveandbasin',
  'whyte-museum': 'https://www.whyte.org/',
};
const winterPlanner = { 'banff-gondola': 'gondola', 'first-ski-lesson': 'lesson', 'norquay-tubing': 'tube', 'managed-ice-skating': 'skate', 'cross-country-skiing': 'nordic', 'cave-and-basin': 'cave', 'whyte-museum': 'culture' };
for (const id of winterSelection) {
  const entry = source.winter.winterActivityCatalogue.find(item => item.id === id);
  if (!entry) throw new Error('Missing reviewed winter entry: ' + id);
  const allSeason = ['banff-gondola', 'cave-and-basin', 'whyte-museum'].includes(id);
  const activity = source.planner.activityById[winterPlanner[id]];
  add({ id, name: entry.name, category: allSeason ? 'attractions' : 'winter', area: id === 'cross-country-skiing' ? 'canmore' : id === 'first-ski-lesson' ? 'regional' : 'banff',
    description: entry.description, image: absolute(entry.gallery[0].src), imageNote: entry.gallery[0].caption + '. This photograph does not establish current operations.',
    coordinateStatus: 'unavailable', season: allSeason ? 'all' : 'winter', durationHours: activity.hours,
    guideUrl: absolute(entry.internalHref), sourceUrl: winterSources[id], reviewedAt: source.winter.winterActivityCatalogueReviewedAt,
    tips: [entry.fit, entry.practicalNote], bookingRequired: ['banff-gondola', 'first-ski-lesson', 'norquay-tubing'].includes(id),
    plannerActivityId: winterPlanner[id], offlineGuideId: allSeason ? 'town-and-culture' : 'winter-days',
  });
}

const diningReviews = { ...source.dining.restaurantSourceReviews, ...source.banffDining.banffDiningSourceReviews };
const diningSelection = ['the-bison-restaurant', 'park-distillery', 'wild-flour-bakery', 'nourish-bistro', 'bear-street-tavern', 'blake-brewpub', 'the-iron-goat', 'fairview-dining-room'];
for (const id of diningSelection) {
  const venue = diningReviews[id];
  if (!venue || venue.status !== 'selected-facts') throw new Error('Missing reviewed dining entry: ' + id);
  add({ id, name: venue.name, category: 'food', area: area(venue.area), description: venue.description,
    coordinateStatus: 'unavailable', season: 'all', guideUrl: absolute('/eat-and-drink'), sourceUrl: venue.website || venue.sources[0].url,
    reviewedAt: venue.checkedOn, tips: [venue.serviceNote, venue.journeyNote], plannerActivityId: area(venue.area) === 'banff' ? 'dinner' : undefined, offlineGuideId: 'food-and-drink' });
}

const hotelSelection = ['fairmont-banff-springs', 'moose-hotel-suites', 'banff-park-lodge', 'hi-banff-alpine-centre', 'fairmont-chateau-lake-louise', 'lake-louise-inn', 'malcolm-hotel', 'coast-canmore-hotel'];
for (const id of hotelSelection) {
  const hotel = source.hotels.directoryHotels.find(item => item.slug === id && item.sourceStatus === 'reviewed');
  if (!hotel) throw new Error('Missing reviewed hotel: ' + id);
  const hasPoint = Number.isFinite(hotel.lat) && Number.isFinite(hotel.lng);
  add({ id, name: hotel.name, category: 'stays', area: area(hotel.area), description: hotel.description,
    ...(hasPoint ? { latitude: hotel.lat, longitude: hotel.lng } : {}),
    coordinateStatus: hotel.coordinateStatus === 'source-verified' ? 'verified' : hasPoint ? 'indicative' : 'unavailable',
    coordinateSource: hotel.coordinateSource, coordinateNote: hotel.coordinateNote,
    season: 'all', guideUrl: absolute('/hotel-directory/' + id), sourceUrl: hotel.officialUrl || hotel.sourceLinks[0].url,
    reviewedAt: hotel.checkedOn, tips: [hotel.facilityNote || hotel.sourceScope, 'Confirm the exact room, total price, access requirements and cancellation conditions directly before booking.'],
    bookingRequired: true, offlineGuideId: 'where-to-stay',
  });
}

const guide = (id, title, category, summary, sourceUrl, sections, reviewedAt = '2026-10-29') => ({ id, title, category, summary, sourceUrl, sections, reviewedAt });
const faqSections = faqs => faqs.map(item => ({ title: item.question, body: item.answer }));
const lakeGuide = id => {
  const lake = source.lakes.lakePlans.find(item => item.id === id);
  return guide(id, lake.name + ' essentials', 'Lakes and transport', lake.description, lake.source,
    [{ title: 'Choose the outing', body: lake.land }, { title: 'Getting there and back', body: lake.journey }, { title: 'Winter is a separate plan', body: lake.winter }]);
};
const guides = [
  guide('first-visit', 'Your first Banff trip', 'Getting started', 'Choose your base, main outings and complete journeys before filling every day.', 'https://parks.canada.ca/pn-np/ab/banff/visit', [
    { title: 'Start with a base', body: 'Banff town, Canmore and Lake Louise are different places. Match the room entrance to the actual transport stop. Lake Louise village, lakeshore and ski resort also require separate journeys.' },
    { title: 'One main outing at a time', body: 'Leave room for transport, meals and changes. A long hike, lesson or regional road day can fill the day. Activity allowances in the itinerary exclude unconfirmed transfers.' },
    { title: 'Save what you will need', body: 'Keep meeting points, provider contacts, booking confirmations and the return journey offline. Downloading this app content does not reserve a ticket or provide offline navigation.' },
  ]),
  lakeGuide('lake-louise'), lakeGuide('moraine-lake'),
  guide('lake-visits', 'Choose your lake day', 'Lakes and transport', 'Decide whether the goal is a view, a shoreline outing or a booked activity.', source.lakes.lakeSources.bus, [
    { title: 'Separate the decisions', body: 'Park admission, parking, transport, canoe hire and other activities are separate arrangements. A shuttle booking does not reserve a canoe, and a hotel room does not necessarily establish dining access.' },
    { title: 'Read the exact water rules', body: 'Rules differ by waterbody. Check the current official water-recreation order before bringing personal craft; on-site rental exceptions do not allow every visitor to launch a private boat.' },
    { title: 'Keep a land-based alternative', body: 'A photograph, calendar month, temperature or another person’s tracks does not assess natural ice. Follow current designated routes and the actual managed facility’s instructions.' },
  ]),
  guide('car-free', 'Banff without a car', 'Transport', 'Connect your base, outward journey, actual stop and final return.', 'https://roamtransit.com/', [
    { title: 'Plan the whole chain', body: 'Roam town routes, regional buses, resort shuttles, airport transfers and Parks lake shuttles are different services. Confirm the stop, date, reservation product, luggage and return for each leg.' },
    { title: 'Banff, Canmore and Lake Louise', body: 'Canmore regional travel can require a separate connection before an early activity departure. Roam 8X serves Lake Louise village and lakeshore; a ski-resort booking needs the ski resort, not just a Lake Louise destination label.' },
    { title: 'Before paying', body: 'Confirm the full journey with each operator and check ticket inclusions. Save return instructions and contacts offline. Do not choose an evening activity beyond the last usable return.' },
  ]),
  guide('winter-days', 'Build a winter day', 'Winter', 'Choose an outing for the actual group, route, weather and available transport.', 'https://parks.canada.ca/pn-np/ab/banff/activ/marchehiver-winterwalking/banff', [
    { title: 'Keep the route specific', body: 'A summer hiking description does not establish winter access. Use current winter-designated routes and official reports; snowshoes or traction do not provide avalanche skills.' },
    { title: 'For a ski or lesson day', body: 'Choose one resort, then confirm the lesson meeting point, equipment fitting, relevant lift access, transfer and final return. Leave time for warm breaks and rental returns.' },
    { title: 'Leave room to change', body: 'Keep a nearby indoor or town alternative. A resort being open does not mean every lift, run, lesson or shuttle is available, and a frozen lake is not a managed rink.' },
  ]),
  guide('walking-and-hiking', 'Walking and hiking essentials', 'Outdoors', 'Match the whole route and return to the least experienced person in your group.', 'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking', [
    { title: 'Read the complete profile', body: 'Check distance basis, elevation, surface, trailhead and the time needed for the approach and return. An easy hiking grade does not establish a paved, stroller-friendly or wheelchair-accessible route.' },
    { title: 'Check before leaving', body: 'Read the current trail report, park bulletins, weather and transport information. A published route profile is not proof of current opening, parking availability or suitability.' },
    { title: 'Prepare to turn around', body: 'Carry equipment and clothing for your actual outing, tell someone your route and return, and leave enough daylight and transport margin. Cell service can be absent. Keep wildlife space and follow posted restrictions.' },
  ]),
  guide('park-admission', 'Park admission explained', 'Practical tools', 'Keep admission separate from services and compare the actual party and chargeable units.', source.pass.parkPassSources.fees, faqSections(source.pass.parkPassFaqs.filter((_, index) => [1, 2, 3, 4, 6].includes(index))), source.pass.parkPassReviewedAt),
  guide('trip-budget', 'Budget your actual trip', 'Practical tools', 'Use current quotes and keep days, nights, rooms and people as separate units.', 'https://banffbound.com/trip-cost/', faqSections(source.budget.tripBudgetFaqs.slice(0, 4)), source.budget.tripBudgetReviewedAt),
  guide('packing', 'Pack for the day you choose', 'Preparation', 'A town meal, snow outing, lesson and long hike need different preparation.', source.packing.packingGuideSources['banff-packing-list'].weather, faqSections(source.packing.packingGuideFaqs['banff-packing-list'].slice(0, 4))),
  guide('rental-and-arrival', 'Airport arrival and rental decisions', 'Transport', 'Compare the whole journey and actual vehicle requirements before booking.', source.car.carRentalGuideSources.airport, faqSections(source.car.carRentalGuideFaqs.slice(0, 4))),
  guide('where-to-stay', 'Choose the right base', 'Accommodation', 'Select a room and location that fit the activities and transport you will use.', 'https://banffbound.com/towns/', [
    { title: 'Banff town', body: 'Compare the exact hotel entrance with the places and stops you will use. Downtown, the Banff Avenue hotel strip, Tunnel Mountain and Sulphur Mountain involve different approaches. A hotel bus pass does not establish airport or ski transfers.' },
    { title: 'Lake Louise', body: 'The village, lakeshore and ski resort are different destinations. Check the actual room location, food options and full transport chain before choosing a base for winter or car-free outings.' },
    { title: 'Canmore', body: 'Canmore is outside Banff National Park and has its own town services. Price the additional journeys for Banff, Lake Louise and ski days. A property listed in Canmore does not establish pickup by a resort shuttle.' },
  ]),
  guide('food-and-drink', 'Plan your meals', 'Food and drink', 'Choose a real venue and allow for the meal journey and return.', 'https://www.banfflakelouise.com/eat-drink', [
    { title: 'Check the actual service', body: 'Opening times, kitchen service, reservations, menus and dietary arrangements can change. Confirm directly for your date. A late bar closing time does not establish a late kitchen.' },
    { title: 'Hotel dining', body: 'A lakeshore hotel restaurant may prioritise overnight guests or have access restrictions. A hotel view, shuttle ticket or room booking at another property does not reserve a table.' },
    { title: 'Keep it practical', body: 'Choose a meal near your room or final return stop when possible. Check the whole address in Canmore or on the Bow Valley Parkway rather than assuming every venue is in the town centre.' },
  ]),
  guide('wildlife', 'Give wildlife space', 'Responsible travel', 'A town setting or a busy trail does not make wildlife tame.', 'https://parks.canada.ca/pn-np/ab/banff/visit/faune-wildlife/espace-space', [
    { title: 'Observe without approaching', body: 'Keep a respectful distance, follow current official viewing guidance and posted restrictions, and increase space if an animal reacts. Do not follow wildlife, surround it or use food to create a photograph.' },
    { title: 'Keep the group together', body: 'Keep children close and pets leashed where permitted. Do not walk between an elk and its group or calf. Use another route when an animal blocks the path.' },
    { title: 'Before an outdoor trip', body: 'Read current park restrictions and bear-preparation guidance. Learn the use and limitations of the equipment you carry. This guide does not provide live wildlife locations or predict an encounter.' },
  ]),
  guide('accessibility', 'Plan access around your needs', 'Accessibility', 'Ask about the particular route, entrance, vehicle and assistance you need.', 'https://www.banfflakelouise.com/accessibility', [
    { title: 'A label is a starting point', body: 'Check distance, grade, surface, steps, washrooms, rest points and seasonal maintenance. A short trail or an accessible room label does not establish the entire journey from your base.' },
    { title: 'Transport and attractions', body: 'Contact the actual operator about boarding, mobility-device dimensions, companion arrangements and the arrival point. An attraction building and its outdoor boardwalk can have very different access.' },
    { title: 'Confirm the room and route', body: 'Reserve the exact room category and required equipment, and ask for the route from drop-off to entrance and facilities. Keep a second outing that fits your group if the original approach does not.' },
  ]),
  guide('town-and-culture', 'Town time and warm alternatives', 'Things to do', 'Leave space for culture, a meal and slower time between mountain outings.', 'https://banff.ca/122/Arts-and-Culture', [
    { title: 'Choose a particular venue', body: 'Cave and Basin, the Whyte Museum, galleries and local performances have their own admission, opening and programme details. Check the actual date and venue instead of treating town attractions as always open.' },
    { title: 'A simple town day', body: 'Make a café, selected exhibition or short maintained walk the main stop, with time for a meal and the return. Use a route that fits current footing and everyone’s mobility.' },
    { title: 'Use an alternative deliberately', body: 'A weather alternative should suit the party and have a real transport plan. Check holiday hours and event tickets before relying on an indoor venue.' },
  ]),
];

for (const entry of [
  { id: 'banff-visitor-centre', name: 'Banff Visitor Centre', area: 'banff', description: 'Start with official visitor information for routes, park rules and current planning questions.', guideUrl: 'https://banffbound.com/towns/banff/', sourceUrl: 'https://parks.canada.ca/pn-np/ab/banff/visit/installations-facilities' },
  { id: 'lake-louise-visitor-centre', name: 'Lake Louise Visitor Centre', area: 'louise', description: 'Ask about the actual Lake Louise outing, current reports and the journey between village, lakeshore and resort.', guideUrl: 'https://banffbound.com/towns/lake-louise/', sourceUrl: 'https://parks.canada.ca/pn-np/ab/banff/visit/installations-facilities' },
]) add({ ...entry, category: 'essentials', coordinateStatus: 'unavailable', season: 'all', reviewedAt: '2026-10-29', tips: ['Check the official location, opening details and available service before travelling.'], offlineGuideId: 'first-visit' });

const provenance = {};
for (const file of Object.values(sourceModules)) provenance[file] = hash(await readFile(path.join(root, file)));
provenance['scripts/lib/eccc-weather.mjs'] = hash(await readFile(path.join(root, 'scripts/lib/eccc-weather.mjs')));
const photoCredits = JSON.parse(await readFile(path.join(root, 'src/data/winterActivityPhotoCredits.json'), 'utf8'));
const versionHash = hash(JSON.stringify({ places, guides, provenance, photoCredits })).slice(0, 12);
const contentVersion = '2026-10-30-' + versionHash;
const templateIds = ['winter-nonski-3', 'winter-family-4', 'winter-5', 'first-timer-3', 'family-5', 'adventure-5'];
for (const id of templateIds) {
  const plan = source.planner.createTripPlan(id);
  if (!source.planner.decodeTripPlan(source.planner.encodeTripPlan(plan))) throw new Error('Invalid template: ' + id);
}

await mkdir(destination, { recursive: true });
let changed = false;
async function publish(name, content) {
  const target = path.join(destination, name);
  const old = await readFile(target, 'utf8').catch(() => null);
  if (old === content) return;
  changed = true;
  if (!check) await writeFile(target, content);
  console.log((check ? 'Drift: ' : 'Updated: ') + path.relative(root, target));
}
const header = '// Generated by mobile/scripts/sync-content.mjs. Do not edit by hand.\n';
for (const [file, output] of [['src/data/tripPlanner.ts', 'planner.generated.ts'], ['src/data/parkPassPlanning.ts', 'parkPass.generated.ts'], ['src/data/tripCostPlanning.ts', 'tripCost.generated.ts']]) {
  const text = await readFile(path.join(root, file), 'utf8');
  if (/^import\s/m.test(text)) throw new Error('Generated pure module unexpectedly has imports: ' + file);
  await publish(output, header + '// Source: ' + file + '; SHA-256 ' + provenance[file] + '\n' + text);
}
await publish('eccc.generated.mjs', header + '// Source: scripts/lib/eccc-weather.mjs; SHA-256 ' + provenance['scripts/lib/eccc-weather.mjs'] + '\n' + await readFile(path.join(root, 'scripts/lib/eccc-weather.mjs'), 'utf8'));
await publish('catalog.generated.ts', header + "import type { Place, Guide } from './catalog';\n" +
  'export const dataVersion = ' + JSON.stringify(contentVersion) + ';\n' +
  'export const places: Place[] = ' + JSON.stringify(places, null, 2) + ';\n' +
  'export const guides: Guide[] = ' + JSON.stringify(guides, null, 2) + ';\n' +
  'export const plannerTemplatesForApp: string[] = ' + JSON.stringify(templateIds) + ';\n' +
  'export const contentProvenance = ' + JSON.stringify(provenance, null, 2) + ';\n' +
  'export const photoCredits = ' + JSON.stringify(photoCredits, null, 2) + ';\n');
if (check && changed) process.exitCode = 1;
console.log(`${places.length} places, ${guides.length} guides, ${templateIds.length} templates; ${contentVersion}${check ? ' (check)' : ''}`);
