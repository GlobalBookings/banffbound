import { winterActivityOffers, winterActivityClosureSource } from './winterActivityLanding';

export const winterActivityCatalogueReviewedAt = '2026-10-30';
export const winterActivityCatalogueOrdering = 'An editorial starting order: three distinct experiences with verified booking links, followed by snow sports, outdoor outings and town alternatives. This is not a popularity, price, availability or suitability ranking.';
export const winterActivityCatalogueScope = 'Winter planning choices, not a list of experiences operating today. Check the actual date, access, group requirements, transport and return. A linked product or equipment rental does not override a closure.';

export const winterActivityCategories = [
  { value: 'all', label: 'All 20 experiences' },
  { value: 'sightseeing', label: 'Sightseeing & guided days' },
  { value: 'snow-sports', label: 'Skiing & winter sports' },
  { value: 'winter-outdoors', label: 'Walks, trails & wildlife' },
  { value: 'town-culture', label: 'Town, heritage & evenings' },
  { value: 'specialist', label: 'Specialist guided outings' },
] as const;
export type WinterActivityCategory = typeof winterActivityCategories[number]['value'];
export interface WinterActivityCatalogueImage { src: string; alt: string; caption: string; }
export interface WinterActivityCatalogueEntry {
  id: string; rank: number; name: string;
  category: Exclude<WinterActivityCategory, 'all'>;
  description: string; fit: string; practicalNote: string; internalHref: string;
  bookingOfferId: 'gyg-303253' | 'gyg-256607' | 'gyg-437912' | null;
  gallery: WinterActivityCatalogueImage[];
}

// Real photographs only. Creator, source, licence and modification details live in
// winterActivityPhotoCredits.json and are displayed by the page's photo credits.
// A setting photograph is not evidence of a tour, route permission or current operation.
const photo = (id: string, alt: string, caption: string): WinterActivityCatalogueImage => ({ src: '/images/winter-activities/' + id + '.jpg', alt, caption });
const photos: Record<string, WinterActivityCatalogueImage> = {
  'gondola-winter': photo('gondola-winter', 'A gondola cabin above Banff and the snowy Bow Valley.', 'Banff Gondola in winter · 2014'),
  'sulphur-boardwalk-winter': photo('sulphur-boardwalk-winter', 'Snow beside the Sulphur Mountain boardwalk, with mountains beyond.', 'Sulphur Mountain and the Bow Valley · 2015'),
  'johnston-frozen-falls': photo('johnston-frozen-falls', 'Snow and ice around the Lower Falls at Johnston Canyon.', 'Johnston Canyon Lower Falls · 2014'),
  'johnston-winter-trail': photo('johnston-winter-trail', 'A snow-covered catwalk between Johnston Canyon rock walls.', 'Johnston Canyon in winter · 2014'),
  'lake-louise-frozen': photo('lake-louise-frozen', 'Snow covering the frozen expanse of Lake Louise below the mountains.', 'Lake Louise in winter · 2018'),
  'lake-louise-skating': photo('lake-louise-skating', 'People skating in a prepared area at Lake Louise.', 'Skating at Lake Louise · 2017'),
  'lake-louise-skier': photo('lake-louise-skier', 'Ski slopes and mountain views at Lake Louise Ski Resort.', 'Lake Louise Ski Resort · March 2018'),
  'lake-louise-ski-slopes': photo('lake-louise-ski-slopes', 'Snow-covered slopes at Lake Louise Ski Resort.', 'Lake Louise Ski Resort · March 2017'),
  'canmore-nordic-winter': photo('canmore-nordic-winter', 'Snowy trees and mountains seen from Canmore Nordic Centre.', 'Canmore Nordic Centre · 2017'),
  'snowshoe-banff-landscape': photo('snowshoe-banff-landscape', 'Snow-covered Rocky Mountains and trees in Banff National Park.', 'Banff winter landscape · 2018'),
  'dog-sled-alberta': photo('dog-sled-alberta', 'A dog-sled team travelling across snow in Alberta.', 'Dog sledding in Alberta · 2019'),
  'cave-and-basin': photo('cave-and-basin', 'Water beneath the rock walls of the Cave and Basin cavern.', 'Cave and Basin cavern · 2017'),
  'upper-hot-springs': photo('upper-hot-springs', 'Bathers in the Banff Upper Hot Springs outdoor pool in a snow-free scene.', 'Banff Upper Hot Springs · 2012'),
  'whyte-museum': photo('whyte-museum', 'The Whyte Museum exterior and entrance in a snow-free scene.', 'The Whyte Museum · 2012'),
  'banff-winter-town': photo('banff-winter-town', 'Cascade Mountain above a snow-covered playing field in Banff.', 'Cascade Mountain from Banff · 2012'),
  'banff-night-view': photo('banff-night-view', 'Banff town lights at night, viewed from Sulphur Mountain.', 'View of Banff from Sulphur Mountain · 2014'),
  'lake-louise-night-sky': photo('lake-louise-night-sky', 'Orion above trees beside Lake Louise on a winter night.', 'Winter stars above Lake Louise · 2021'),
  'banff-elk': photo('banff-elk', 'An elk at dusk near a road in Banff National Park.', 'Elk in Banff National Park · 2007'),
  'norquay-lodge': photo('norquay-lodge', 'Snow on the roof and deck of the Mount Norquay lodge.', 'Mount Norquay lodge · 2008'),
  'banff-springs-bowling': photo('banff-springs-bowling', 'An illuminated bowling alley at the Banff Springs Hotel.', 'Banff Springs Hotel bowling alley · 2014'),
};
export const winterActivityCataloguePhotoPairs: Record<string, readonly [string, string]> = {
  'banff-gondola': ['gondola-winter', 'sulphur-boardwalk-winter'],
  'guided-johnston-icewalk': ['johnston-frozen-falls', 'johnston-winter-trail'],
  'guided-louise-canyon-day': ['lake-louise-frozen', 'johnston-frozen-falls'],
  'first-ski-lesson': ['lake-louise-skier', 'lake-louise-ski-slopes'],
  'resort-ski-day': ['lake-louise-ski-slopes', 'lake-louise-skier'],
  'snowshoe-outing': ['snowshoe-banff-landscape', 'banff-winter-town'],
  'norquay-tubing': ['norquay-lodge', 'banff-winter-town'],
  'managed-ice-skating': ['lake-louise-skating', 'lake-louise-frozen'],
  'cross-country-skiing': ['canmore-nordic-winter', 'banff-winter-town'],
  'dog-sledding': ['dog-sled-alberta', 'lake-louise-frozen'],
  'winter-fat-biking': ['canmore-nordic-winter', 'banff-winter-town'],
  'cave-and-basin': ['cave-and-basin', 'banff-winter-town'],
  'hot-springs-soak': ['upper-hot-springs', 'banff-winter-town'],
  'whyte-museum': ['whyte-museum', 'banff-winter-town'],
  'winter-photography': ['sulphur-boardwalk-winter', 'banff-night-view'],
  'wildlife-area-visit': ['banff-elk', 'banff-winter-town'],
  'live-performance': ['banff-night-view', 'banff-winter-town'],
  'bowling-evening': ['banff-springs-bowling', 'banff-night-view'],
  'winter-night-sky': ['lake-louise-night-sky', 'banff-night-view'],
  'mountain-scenic-flight': ['sulphur-boardwalk-winter', 'banff-night-view'],
};
const gallery = (id: string): WinterActivityCatalogueImage[] => {
  const pair = winterActivityCataloguePhotoPairs[id];
  if (!pair || pair[0] === pair[1]) throw new Error('Expected two distinct documented photographs: ' + id);
  return pair.map(key => {
    if (!photos[key]) throw new Error('Unknown winter photograph: ' + key);
    return { ...photos[key] };
  });
};

export const winterActivityCatalogue: WinterActivityCatalogueEntry[] = [
  { id: 'banff-gondola', rank: 1, name: 'Banff Gondola', category: 'sightseeing',
    description: 'Take the Sulphur Mountain gondola to the summit building and permitted viewing areas.',
    fit: 'A single mountain attraction with time inside as well as outdoors.',
    practicalNote: 'Check visibility, operation and the Mountain Avenue return. Building access differs from the stair-filled outdoor boardwalk.',
    internalHref: '/blog/banff-gondola-guide/', bookingOfferId: 'gyg-256607', gallery: gallery('banff-gondola') },
  { id: 'guided-johnston-icewalk', rank: 2, name: 'Johnston Canyon Icewalk', category: 'sightseeing',
    description: 'Make a guide-led canyon walk the main outing, with route and equipment instructions for the selected departure.',
    fit: 'Visitors who want a guided outdoor walk rather than a sightseeing ride.',
    practicalNote: 'Checked 30 October 2026: trail/day-use area closed from 13 October; scheduled end 11 December is not confirmed reopening. Ask the operator about your date.',
    internalHref: '/blog/banff-ice-walk-guide/', bookingOfferId: 'gyg-303253', gallery: gallery('guided-johnston-icewalk') },
  { id: 'guided-louise-canyon-day', rank: 3, name: 'Lake Louise Winter Day Tour', category: 'sightseeing',
    description: 'Compare a guided journey connecting Lake Louise and the Johnston Canyon area, with outdoor stops between road legs.',
    fit: 'A group wanting one operator-led day with transport between destinations.',
    practicalNote: 'Johnston closure affects the advertised route. Confirm the actual departure, pickup and alternative stops; skating and snowshoeing are not guaranteed.',
    internalHref: '/blog/7-day-banff-itinerary/#week-booking', bookingOfferId: 'gyg-437912', gallery: gallery('guided-louise-canyon-day') },
  { id: 'first-ski-lesson', rank: 4, name: 'Ski or Snowboard Lessons', category: 'snow-sports',
    description: 'Choose instruction for the actual age, discipline and experience before buying overlapping rental or lift products.',
    fit: 'A first snow-sport day or a group whose members need different instruction.',
    practicalNote: 'Match the school’s meeting point, equipment fitting, supervision and return. Lesson, lift and transport inclusions vary by product.',
    internalHref: '/learn-to-ski/#lesson-fit', bookingOfferId: null, gallery: gallery('first-ski-lesson') },
  { id: 'resort-ski-day', rank: 5, name: 'Skiing & Snowboarding', category: 'snow-sports',
    description: 'Choose Sunshine, Lake Louise or Norquay from the terrain, group and complete base-to-resort journey.',
    fit: 'Skiers and riders planning a day matched to their existing ability.',
    practicalNote: 'Check current terrain, lift products and shuttle eligibility. A pass or room does not provide instruction or access to closed terrain.',
    internalHref: '/ski-day-planner/', bookingOfferId: null, gallery: gallery('resort-ski-day') },
  { id: 'snowshoe-outing', rank: 6, name: 'Snowshoeing', category: 'winter-outdoors',
    description: 'Pick a named winter route and a manageable turnaround, then rent equipment for the actual surface.',
    fit: 'An outdoor day at the group’s pace, with room to shorten it.',
    practicalNote: 'Snowshoes provide flotation, not avalanche skills. Summer hiking grades, old tracks and a rental do not establish winter access.',
    internalHref: '/blog/banff-snowshoeing-guide/', bookingOfferId: null, gallery: gallery('snowshoe-outing') },
  { id: 'norquay-tubing', rank: 7, name: 'Snow Tubing at Norquay', category: 'snow-sports',
    description: 'Plan a snow-tube-park visit around the resort’s actual ticket session and participant requirements.',
    fit: 'A separate snow activity for a group that is not booking a full ski day.',
    practicalNote: 'Check the current age and height rules, footwear, session calendar and return shuttle. A ski ticket does not automatically include tubing.',
    internalHref: '/blog/banff-tubing-guide/', bookingOfferId: null, gallery: gallery('norquay-tubing') },
  { id: 'managed-ice-skating', rank: 8, name: 'Ice Skating', category: 'snow-sports',
    description: 'Choose a managed indoor or prepared outdoor skating area, with equipment and session information from its operator.',
    fit: 'A short active outing with a planned warm-up and return.',
    practicalNote: 'Check the actual rink and rental status. Parks does not monitor natural ice for safety; preparation of one area does not assess a whole lake.',
    internalHref: '/activities/ice-skating/', bookingOfferId: null, gallery: gallery('managed-ice-skating') },
  { id: 'cross-country-skiing', rank: 9, name: 'Cross-country Skiing', category: 'snow-sports',
    description: 'Compare designated Nordic routes and classic or skate equipment, with instruction where needed.',
    fit: 'A ski-track day that is different from riding resort lifts.',
    practicalNote: 'Check grooming, route demands and trail/facility fees. Canmore Nordic Centre needs a separate journey; do not assume a winter local bus reaches it.',
    internalHref: '/blog/banff-cross-country-skiing/', bookingOfferId: null, gallery: gallery('cross-country-skiing') },
  { id: 'dog-sledding', rank: 10, name: 'Dog Sledding', category: 'winter-outdoors',
    description: 'Choose the operator, staging area and passenger or instructed-driving format before arranging the journey.',
    fit: 'A guided winter experience with an interest in the dogs and their care.',
    practicalNote: 'Lake Louise and Canmore/Kananaskis departures are different places. Confirm group requirements, dog-care information, snow conditions and the full return.',
    internalHref: '/activities/dog-sledding/', bookingOfferId: null, gallery: gallery('dog-sledding') },
  { id: 'winter-fat-biking', rank: 11, name: 'Winter Fat Biking', category: 'snow-sports',
    description: 'Match a designated winter cycling route to the rider, bike and current snow surface.',
    fit: 'Cyclists looking for a snow-season ride rather than an improvised summer-trail loop.',
    practicalNote: 'Check route-specific bike and pedal-assist permissions. Snow, track setting and closures can change the plan; rental equipment is not route approval.',
    internalHref: '/blog/banff-fat-biking/', bookingOfferId: null, gallery: gallery('winter-fat-biking') },
  { id: 'cave-and-basin', rank: 12, name: 'Cave and Basin', category: 'town-culture',
    description: 'Visit exhibitions and permitted thermal-spring viewing areas at the national historic site.',
    fit: 'A heritage-focused change of pace from a snow-sport day.',
    practicalNote: 'There is no bathing here. Winter hours have closed weekdays and temporary closure blocks; check the actual programme and approach.',
    internalHref: '/blog/cave-and-basin-guide/', bookingOfferId: null, gallery: gallery('cave-and-basin') },
  { id: 'hot-springs-soak', rank: 13, name: 'Banff Upper Hot Springs', category: 'town-culture',
    description: 'Choose the public outdoor bathing facility for a different kind of winter rest day.',
    fit: 'A warm-water outing rather than a protected-spring heritage visit.',
    practicalNote: 'Checked 30 October 2026: closed 13 October to early November for maintenance; reopening is unconfirmed. Parks does not offer advance online admission reservations.',
    internalHref: '/blog/banff-hot-springs-guide/', bookingOfferId: null, gallery: gallery('hot-springs-soak') },
  { id: 'whyte-museum', rank: 14, name: 'The Whyte Museum', category: 'town-culture',
    description: 'Make art, exhibitions and mountain heritage the main indoor visit at 111 Bear Street.',
    fit: 'A cultural town day or an alternative when a mountain outing changes.',
    practicalNote: 'Check current exhibitions, admission versus tour tickets and holiday closures. A town-centre address does not settle every access requirement.',
    internalHref: '/blog/rainy-day-banff/#weather-whyte', bookingOfferId: null, gallery: gallery('whyte-museum') },
  { id: 'winter-photography', rank: 15, name: 'Winter Photography', category: 'winter-outdoors',
    description: 'Pick a destination and light conditions from the complete journey, rather than a guaranteed postcard view.',
    fit: 'A patient short outing with time to stop, look and return.',
    practicalNote: 'Use lawful open viewpoints, respect people and wildlife, and keep off unassessed ice. Weather and sun-time resources do not promise a clear scene.',
    internalHref: '/photo-spots/', bookingOfferId: null, gallery: gallery('winter-photography') },
  { id: 'wildlife-area-visit', rank: 16, name: 'Winter Wildlife Watching', category: 'winter-outdoors',
    description: 'Choose a public visitor area for its landscape and habitat, with an outing worthwhile without a sighting.',
    fit: 'Visitors who want to notice wildlife responsibly rather than chase it.',
    practicalNote: 'No live animal positions or sighting guarantee. Check access and viewing guidance; never approach, feed or follow animals for a photo.',
    internalHref: '/wildlife-tracker/', bookingOfferId: null, gallery: gallery('wildlife-area-visit') },
  { id: 'live-performance', rank: 17, name: 'Live Music & Performances', category: 'town-culture',
    description: 'Look for a concert, film screening or other performance that matches the actual visit dates.',
    fit: 'A cultural evening with a clear ticket and return plan.',
    practicalNote: 'Read the specific event’s venue, admission and age restrictions. A calendar entry does not guarantee a show every evening or an all-ages event.',
    internalHref: '/blog/banff-live-music/#find-a-show', bookingOfferId: null, gallery: gallery('live-performance') },
  { id: 'bowling-evening', rank: 18, name: 'Bowling in Banff', category: 'town-culture',
    description: 'Plan a lane and food as a separate evening activity, with a journey back to your base.',
    fit: 'A social indoor alternative after a shorter outdoor day.',
    practicalNote: 'At High Rollers, a table does not reserve a lane and minors are not permitted after 10 pm. Check the selected session and full party.',
    internalHref: '/blog/banff-nightlife-guide/#evening-planner', bookingOfferId: null, gallery: gallery('bowling-evening') },
  { id: 'winter-night-sky', rank: 19, name: 'Stargazing & Northern Lights', category: 'winter-outdoors',
    description: 'Choose legal land access and a warm fallback for a look at the stars, with aurora only a possibility.',
    fit: 'A flexible evening that remains worthwhile without a particular display.',
    practicalNote: 'Check timestamped space weather, clouds, cold and the return. No aurora forecast guarantees a view; a lakeside viewpoint is not permission to use the ice.',
    internalHref: '/activities/northern-lights/', bookingOfferId: null, gallery: gallery('winter-night-sky') },
  { id: 'mountain-scenic-flight', rank: 20, name: 'Scenic Helicopter Flights', category: 'specialist',
    description: 'Compare a scenic helicopter product from its actual operator base and route, separately from heli-skiing.',
    fit: 'A specialist guided outing with flexible weather and transfer plans.',
    practicalNote: 'Canmore and other departure bases are not a Banff town heliport. Confirm flight weather, boarding needs, equipment limits, transport and the actual cancellation terms.',
    internalHref: '/blog/banff-helicopter-tours/', bookingOfferId: null, gallery: gallery('mountain-scenic-flight') },
];

/** Existing three verified products and original partner/campaign parameters only. */
export const winterActivityCatalogueBookingOffers = winterActivityOffers;
for (const entry of winterActivityCatalogue) {
  if (entry.bookingOfferId !== null && !winterActivityOffers.some(offer => offer.id === entry.bookingOfferId)) throw new Error('Unknown verified winter booking offer: ' + entry.id);
}

export const winterActivityCatalogueSources: Record<string, string[]> = {
  'banff-gondola': [winterActivityOffers.find(offer => offer.id === 'gyg-256607')!.operatorUrl],
  'guided-johnston-icewalk': [winterActivityOffers.find(offer => offer.id === 'gyg-303253')!.operatorUrl, winterActivityClosureSource],
  'guided-louise-canyon-day': [winterActivityOffers.find(offer => offer.id === 'gyg-437912')!.operatorUrl, winterActivityClosureSource],
  'first-ski-lesson': ['https://banffnorquay.com/snow-school/first-time-ski-snowboard/'],
  'resort-ski-day': ['https://www.skibig3.com/ski/ski-shuttle/'],
  'snowshoe-outing': ['https://parks.canada.ca/pn-np/ab/banff/activ/raquette-snowshoeing/banff'],
  'norquay-tubing': ['https://banffnorquay.com/tubing/'],
  'managed-ice-skating': ['https://banff.ca/110/Outdoor-Ice-Skating', 'https://parks.canada.ca/pn-np/ab/banff/activ/patinage-skating'],
  'cross-country-skiing': ['https://www.albertaparks.ca/parks/kananaskis/canmore-nordic-centre-pp/activities/cross-country-skiing/'],
  'dog-sledding': ['https://www.snowyowltours.com/', 'https://kingmikdogsledtours.com/'],
  'winter-fat-biking': ['https://parks.canada.ca/pn-np/ab/banff/activ/cyclisme-biking/veloniege-fatbike'],
  'cave-and-basin': ['https://parks.canada.ca/lhn-nhs/ab/caveandbasin/visit/heures-hours'],
  'hot-springs-soak': ['https://parks.canada.ca/pn-np/ab/banff/sources-banff-springs'],
  'whyte-museum': ['https://www.whyte.org/visit'],
  'winter-photography': ['https://parks.canada.ca/pn-np/ab/banff/securite-safety/regles-rules'],
  'wildlife-area-visit': ['https://parks.canada.ca/pn-np/ab/banff/visit/faune-wildlife/espace-space'],
  'live-performance': ['https://www.banffcentre.ca/events'],
  'bowling-evening': ['https://www.highrollersbanff.com/'],
  'winter-night-sky': ['https://www.spaceweather.gc.ca/forecast-prevision/cond-en.php'],
  'mountain-scenic-flight': ['https://www.alpinehelicopter.com/'],
};

export function normaliseWinterActivityCategory(value: unknown): WinterActivityCategory {
  return typeof value === 'string' && winterActivityCategories.some(category => category.value === value) ? value as WinterActivityCategory : 'all';
}
export function buildWinterActivityCatalogueSelection(value: unknown = 'all') {
  const category = normaliseWinterActivityCategory(value);
  return { category, activityIds: winterActivityCatalogue.filter(entry => category === 'all' || entry.category === category).map(entry => entry.id) };
}
