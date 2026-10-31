import { winterActivityOffers, winterActivityClosureSource } from './winterActivityLanding';

export const winterActivityCatalogueReviewedAt = '2026-10-30';
export const winterActivityCatalogueOrdering = 'An editorial order: fifteen published GetYourGuide products first, followed by five other winter plans. Date- and access-dependent choices follow the broadest current product matches. This is not a popularity, price or live-availability ranking.';
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
  bookingOfferId: string | null; informationLabel?: string;
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
  "banff-gondola": [
    "gondola-winter",
    "sulphur-boardwalk-winter"
  ],
  "three-sisters-flight": [
    "canmore-nordic-winter",
    "sulphur-boardwalk-winter"
  ],
  "electric-fat-bike": [
    "canmore-nordic-winter",
    "banff-winter-town"
  ],
  "cross-country-lesson": [
    "canmore-nordic-winter",
    "lake-louise-frozen"
  ],
  "paint-pots-snowshoe": [
    "snowshoe-banff-landscape",
    "banff-winter-town"
  ],
  "kananaskis-snowshoe": [
    "canmore-nordic-winter",
    "snowshoe-banff-landscape"
  ],
  "winter-parkway-tour": [
    "lake-louise-frozen",
    "banff-winter-town"
  ],
  "banff-nightfall": [
    "lake-louise-night-sky",
    "banff-night-view"
  ],
  "banff-food-walk": [
    "banff-winter-town",
    "banff-night-view"
  ],
  "beginner-ice-climbing": [
    "snowshoe-banff-landscape",
    "canmore-nordic-winter"
  ],
  "yoho-kootenay-winter": [
    "banff-winter-town",
    "canmore-nordic-winter"
  ],
  "johnston-icewalk": [
    "johnston-frozen-falls",
    "johnston-winter-trail"
  ],
  "winter-wonderland": [
    "lake-louise-frozen",
    "johnston-frozen-falls"
  ],
  "grotto-canyon-icewalk": [
    "canmore-nordic-winter",
    "banff-winter-town"
  ],
  "castle-food-experience": [
    "banff-night-view",
    "banff-winter-town"
  ],
  "first-ski-lesson": [
    "lake-louise-skier",
    "lake-louise-ski-slopes"
  ],
  "resort-ski-day": [
    "lake-louise-ski-slopes",
    "lake-louise-skier"
  ],
  "norquay-tubing": [
    "norquay-lodge",
    "banff-winter-town"
  ],
  "managed-ice-skating": [
    "lake-louise-skating",
    "lake-louise-frozen"
  ],
  "dog-sledding": [
    "dog-sled-alberta",
    "lake-louise-frozen"
  ]
};
// Context photographs retain their real named location, rather than being presented as product images.
const contextPhotos = new Set(['three-sisters-flight','electric-fat-bike','cross-country-lesson','paint-pots-snowshoe','kananaskis-snowshoe','winter-parkway-tour','banff-nightfall','banff-food-walk','beginner-ice-climbing','yoho-kootenay-winter','grotto-canyon-icewalk','castle-food-experience']);
const gallery = (id: string): WinterActivityCatalogueImage[] => {
 const pair = winterActivityCataloguePhotoPairs[id];
 if (!pair || pair[0] === pair[1]) throw new Error('Expected two distinct documented photographs: ' + id);
 return pair.map(key => {
  if (!photos[key]) throw new Error('Unknown winter photograph: ' + key);
  return {...photos[key],caption:contextPhotos.has(id) ? 'Regional setting: ' + photos[key].caption : photos[key].caption};
 });
};
const guideMap: Record<string, readonly [string,string,Exclude<WinterActivityCategory,'all'>]> = {
  "gyg-256607": [
    "/blog/banff-gondola-guide/",
    "Planning guide",
    "sightseeing"
  ],
  "gyg-841685": [
    "/blog/banff-helicopter-tours/",
    "Flight planning guide",
    "specialist"
  ],
  "gyg-798459": [
    "/blog/banff-fat-biking/",
    "Cycling planning guide",
    "snow-sports"
  ],
  "gyg-292675": [
    "/blog/banff-cross-country-skiing/",
    "Nordic planning guide",
    "snow-sports"
  ],
  "gyg-303208": [
    "/blog/banff-snowshoeing-guide/",
    "Snowshoe planning guide",
    "winter-outdoors"
  ],
  "gyg-1182128": [
    "/blog/kananaskis-day-trip/",
    "Kananaskis planning",
    "winter-outdoors"
  ],
  "gyg-437787": [
    "/blog/icefields-parkway-guide/",
    "Parkway planning guide",
    "sightseeing"
  ],
  "gyg-916190": [
    "/blog/banff-northern-lights/",
    "Night-sky planning guide",
    "sightseeing"
  ],
  "gyg-698951": [
    "/activities/banff-food-tours/",
    "Food-tour planning",
    "town-culture"
  ],
  "gyg-432341": [
    "/activities/ice-climbing/",
    "Ice-climbing planning",
    "specialist"
  ],
  "gyg-1164949": [
    "/activities/yoho-kootenay-winter-tours/",
    "Winter road-tour planning",
    "sightseeing"
  ],
  "gyg-303253": [
    "/blog/banff-ice-walk-guide/",
    "Canyon planning guide",
    "winter-outdoors"
  ],
  "gyg-437912": [
    "/blog/7-day-banff-itinerary/",
    "Build the wider trip",
    "sightseeing"
  ],
  "gyg-303298": [
    "https://banfftours.com/activities/grotto-canyon-icewalk/",
    "Operator information",
    "winter-outdoors"
  ],
  "gyg-285990": [
    "/activities/banff-food-tours/#castle-food-experience",
    "Castle food-tour planning",
    "town-culture"
  ]
};
const independent = [
  {
    "id": "first-ski-lesson",
    "rank": 16,
    "name": "Ski or Snowboard Lessons",
    "category": "snow-sports",
    "description": "Choose instruction for the actual age, discipline and experience before buying overlapping rental or lift products.",
    "fit": "A first snow-sport day or a group whose members need different instruction.",
    "practicalNote": "Match the school’s meeting point, equipment fitting, supervision and return. Lesson, lift and transport inclusions vary by product.",
    "internalHref": "/learn-to-ski/#lesson-fit",
    "bookingOfferId": null
  },
  {
    "id": "resort-ski-day",
    "rank": 17,
    "name": "Skiing & Snowboarding",
    "category": "snow-sports",
    "description": "Choose Sunshine, Lake Louise or Norquay from the terrain, group and complete base-to-resort journey.",
    "fit": "Skiers and riders planning a day matched to their existing ability.",
    "practicalNote": "Check current terrain, lift products and shuttle eligibility. A pass or room does not provide instruction or access to closed terrain.",
    "internalHref": "/ski-day-planner/",
    "bookingOfferId": null
  },
  {
    "id": "norquay-tubing",
    "rank": 18,
    "name": "Snow Tubing at Norquay",
    "category": "snow-sports",
    "description": "Plan a snow-tube-park visit around the resort’s actual ticket session and participant requirements.",
    "fit": "A separate snow activity for a group that is not booking a full ski day.",
    "practicalNote": "Check the current age and height rules, footwear, session calendar and return shuttle. A ski ticket does not automatically include tubing.",
    "internalHref": "/blog/banff-tubing-guide/",
    "bookingOfferId": null
  },
  {
    "id": "managed-ice-skating",
    "rank": 19,
    "name": "Ice Skating",
    "category": "snow-sports",
    "description": "Choose a managed indoor or prepared outdoor skating area, with equipment and session information from its operator.",
    "fit": "A short active outing with a planned warm-up and return.",
    "practicalNote": "Check the actual rink and rental status. Parks does not monitor natural ice for safety; preparation of one area does not assess a whole lake.",
    "internalHref": "/activities/ice-skating/",
    "bookingOfferId": null
  },
  {
    "id": "dog-sledding",
    "rank": 20,
    "name": "Dog Sledding",
    "category": "winter-outdoors",
    "description": "Choose the operator, staging area and passenger or instructed-driving format before arranging the journey.",
    "fit": "A guided winter experience with an interest in the dogs and their care.",
    "practicalNote": "Lake Louise and Canmore/Kananaskis departures are different places. Confirm group requirements, dog-care information, snow conditions and the full return.",
    "internalHref": "/activities/dog-sledding/",
    "bookingOfferId": null
  }
];
export const winterActivityCatalogue: WinterActivityCatalogueEntry[] = [
 ...winterActivityOffers.map((offer,index) => {
  const info=guideMap[offer.id];
  if (!info) throw new Error('Missing winter product information handoff: ' + offer.id);
  return {id:offer.anchor,rank:index+1,name:offer.name,category:info[2],
   description:offer.experience,fit:offer.fit,practicalNote:offer.seasonalNotice,
   internalHref:info[0],informationLabel:info[1],bookingOfferId:offer.id,gallery:gallery(offer.anchor)};
 }),
 ...independent.map(entry => ({...entry,category:entry.category as Exclude<WinterActivityCategory,'all'>,gallery:gallery(entry.id)})),
];
export const winterActivityCatalogueBookingOffers = winterActivityOffers;
export const winterActivityCatalogueSources: Record<string,string[]> = Object.fromEntries([
 ...winterActivityOffers.map(offer => [offer.anchor,[...offer.sourceUrls,...(offer.needsCanyonCheck ? [winterActivityClosureSource] : [])]]),
 ...[
  [
    "first-ski-lesson",
    [
      "https://banffnorquay.com/snow-school/first-time-ski-snowboard/"
    ]
  ],
  [
    "resort-ski-day",
    [
      "https://www.skibig3.com/ski/ski-shuttle/"
    ]
  ],
  [
    "norquay-tubing",
    [
      "https://banffnorquay.com/tubing/"
    ]
  ],
  [
    "managed-ice-skating",
    [
      "https://banff.ca/110/Outdoor-Ice-Skating",
      "https://parks.canada.ca/pn-np/ab/banff/activ/patinage-skating"
    ]
  ],
  [
    "dog-sledding",
    [
      "https://www.snowyowltours.com/",
      "https://kingmikdogsledtours.com/"
    ]
  ]
],
]);
export function normaliseWinterActivityCategory(value: unknown): WinterActivityCategory {
 return typeof value === 'string' && winterActivityCategories.some(category => category.value === value) ? value as WinterActivityCategory : 'all';
}
export function buildWinterActivityCatalogueSelection(value: unknown = 'all') {
 const category=normaliseWinterActivityCategory(value);
 return {category,activityIds:winterActivityCatalogue.filter(entry => category === 'all' || entry.category === category).map(entry => entry.id)};
}
