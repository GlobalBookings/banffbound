export const lakeLouiseLandingId = 'lake-louise-stays';
export const lakeLouiseLandingReviewedAt = '2026-10-29';
export const lakeLouiseDestinationSearch = 'https://www.expedia.ca/Hotel-Search?destination=Lake+Louise%2C+Alberta%2C+Canada&camref=1101l3MtWX';

export const lakeLouiseStayChoices = [
  {
    slug: 'fairmont-chateau-lake-louise', name: 'Fairmont Chateau Lake Louise', shortName: 'The Chateau',
    base: 'lakeshore', location: 'At the Lake Louise lakeshore', address: '111 Lake Louise Drive',
    fit: 'Put the lakeshore at the centre of your stay.',
    comparison: 'Lakeshore location; choose a named lake-view category.',
    roomDecision: 'Standard, lakeview, suite and Fairmont Gold categories are different bookings. Choose a category explicitly naming the lake view if that is the reason for your trip.',
    tradeoff: 'A lakeshore address is separate from Lake Louise village and the ski resort. Plan meals, parking and onward transport around this location.',
    journey: 'Confirm your airport arrival and any ski-resort transfer separately. A hotel booking does not include lake shuttles, lift tickets or wellness admission unless the actual rate says so.',
    seasonNote: 'Seasonal rentals, skating and other activities depend on current operation and conditions. A room does not guarantee an activity or a particular view outside.',
    cooking: false, cabinSeasons: [] as string[],
    image: 'https://m.ahstatic.com/is/image/accorhotels/met_p_a099-82:4by3?fmt=jpg&wid=1200&hei=900&qlt=80',
    imageAlt: 'Fairmont Chateau Lake Louise at the lakeshore',
    officialUrl: 'https://www.fairmont.com/en/hotels/lake-louise/fairmont-chateau-lake-louise/rooms.html',
    officialLabel: 'Official room and view categories',
    expediaUrl: 'https://www.expedia.ca/Lake-Louise-Hotels-Fairmont-Chateau-Lake-Louise.h22503.Hotel-Information?camref=1101l3MtWX',
    merchantPropertyId: '22503', merchantEvidence: 'https://www.expedia.ca/Lake-Louise-Hotels-Fairmont-Chateau-Lake-Louise.h22503.Hotel-Information',
  },
  {
    slug: 'lake-louise-inn', name: 'Lake Louise Inn', shortName: 'Lake Louise Inn',
    base: 'village', location: 'Lake Louise village', address: '210 Village Road',
    fit: 'Compare village rooms with a cooking-equipped suite or condo.',
    comparison: 'Village base; some suites and condos have cooking facilities.',
    roomDecision: 'The operator lists cooking facilities in named suite and condo categories, not every room. Match the appliances, beds and exact building to your party.',
    tradeoff: 'The property spans several buildings. Some standard accommodation is a walk-up; ask for the specific floor, entrance and access route rather than relying on a general hotel label.',
    journey: 'The hotel advertises a winter ski-resort shuttle and a separate summer lake-shuttle product. Confirm your date, pickup, reservation terms and last return; these are different journeys.',
    seasonNote: 'Village accommodation is separate from both the lakeshore and the ski resort. Confirm current pool, dining and transport arrangements for your stay.',
    cooking: true, cabinSeasons: [] as string[],
    image: 'https://www.lakelouiseinn.com/wp-content/uploads/2026/04/DSC0734-700x500-1.jpg',
    imageAlt: 'Lake Louise Inn property photograph',
    officialUrl: 'https://www.lakelouiseinn.com/accommodations/', officialLabel: 'Official rooms, kitchens and building notes',
    transportSource: 'https://www.lakelouiseinn.com/at-a-glance/',
    expediaUrl: 'https://www.expedia.ca/Lake-Louise-Hotels-Lake-Louise-Inn.h74992.Hotel-Information?camref=1101l3MtWX',
    merchantPropertyId: '74992', merchantEvidence: 'https://www.expedia.ca/Lake-Louise-Hotels-Lake-Louise-Inn.h74992.Hotel-Information',
  },
  {
    slug: 'mountaineer-lodge', name: 'Mountaineer Lodge', shortName: 'Mountaineer Lodge',
    base: 'village', location: 'Lake Louise village', address: '101 Village Road',
    fit: 'Choose a village hotel with a specific sleeping layout.',
    comparison: 'Village base; Main Lodge and Timber entrances differ.',
    roomDecision: 'Main Lodge rooms have interior access; Timber rooms have exterior entrances. The Mountaineer Suite lists a bedroom, sofa bed, microwave and mini-fridge. It does not establish a full cooking kitchen.',
    tradeoff: 'There is no elevator. Check your exact room and stairs before booking; breakfast is offered for purchase rather than assumed to be included.',
    journey: 'A ski shuttle is advertised, but an airport transfer, lakeshore trip and Moraine Lake visit are separate arrangements. Check the first departure and final return for your date.',
    seasonNote: 'For an early ski lesson, match breakfast, equipment collection and shuttle timing. Obtain the current schedule directly instead of relying on a published driving-time estimate.',
    cooking: false, cabinSeasons: [] as string[],
    image: 'https://mountaineerlodge.com/uploads/field-assets/rooms/17-king-guest-room/_576x432_crop_center-center_60_line/High-Res-MountaineerLodge_Winter24-251.jpg?v=1786558347',
    imageAlt: 'Example room at Mountaineer Lodge',
    officialUrl: 'https://mountaineerlodge.com/the-hotel/', officialLabel: 'Official buildings, breakfast and transport',
    roomSource: 'https://mountaineerlodge.com/rooms/mountaineer-suite',
    expediaUrl: 'https://www.expedia.ca/Lake-Louise-Hotels-Mountaineer-Lodge.h5157510.Hotel-Information?camref=1101l3MtWX',
    merchantPropertyId: '5157510', merchantEvidence: 'https://www.expedia.ca/Lake-Louise-Hotels-Mountaineer-Lodge.h5157510.Hotel-Information',
  },
  {
    slug: 'paradise-lodge-bungalows', name: 'Paradise Lodge & Bungalows', shortName: 'Paradise Lodge',
    base: 'road', location: 'Lake Louise Drive · between village and lakeshore', address: '105 Lake Louise Drive',
    fit: 'Compare a lodge suite with a summer cabin.',
    comparison: 'Lake road base; winter suites and summer cabins differ.',
    roomDecision: 'Fairview and Temple suites list kitchen facilities; Saddleback has a refrigerator and microwave convenience area. Historic cabins have their own layouts and cooking equipment.',
    tradeoff: 'The current operator page offers suites for winter lodging and describes historic cabins as summer accommodation. Do not choose a winter cabin from a summer photograph.',
    journey: 'This is on the road between the village and the lake. Confirm a complete transfer or driving plan; do not assume a lakeshore, ski-resort or airport shuttle is included.',
    seasonNote: 'Winter reception uses Cabin 1 with limited desk hours. Arrange late arrival directly and match the actual unit and season to the quote.',
    cooking: true, cabinSeasons: ['summer'],
    image: 'https://paradiselodge.com/wp-content/uploads/2026/07/Paradise-Lodge-and-Bungalows-3.jpg',
    imageAlt: 'Paradise Lodge and Bungalows property photograph',
    officialUrl: 'https://paradiselodge.com/suites/', officialLabel: 'Official suite categories and cooking facilities',
    seasonSource: 'https://paradiselodge.com/paradise-lodge/',
    expediaUrl: 'https://www.expedia.ca/Lake-Louise-Hotels-Paradise-Lodge-Bungalows.h7829397.Hotel-Information?camref=1101l3MtWX',
    merchantPropertyId: '7829397', merchantEvidence: 'https://www.expedia.ca/Lake-Louise-Hotels-Paradise-Lodge-Bungalows.h7829397.Hotel-Information',
  },
  {
    slug: 'baker-creek-by-basecamp', name: 'Baker Creek by Basecamp', shortName: 'Baker Creek',
    base: 'road', location: 'Bow Valley Parkway · outside Lake Louise village', address: 'Bow Valley Parkway',
    fit: 'Make a cabin and the surrounding landscape part of the stay.',
    comparison: 'Parkway base; cabin, meal and road logistics matter.',
    roomDecision: 'Cabins and lodge suites differ. The Family Superior Two Bedroom Cabin lists a kitchenette with mini-fridge, microwave and hot plate; that is not a promise of a full oven kitchen in every unit.',
    tradeoff: 'You are outside the village. Plan groceries and evening meals; the current operator lists Creekside Café for grab-and-go food, rather than the former full Bistro offer.',
    journey: 'Confirm the approach road, weather and parking before driving. Without a car, arrange an actual property transfer and return; do not assume a village bus stops here.',
    seasonNote: 'The reviewed cabin page notes limited Wi-Fi and potentially patchy cell service. Check your communication needs and current seasonal activity operation.',
    cooking: true, cabinSeasons: ['summer', 'winter'],
    image: 'https://basecampresorts.com/wp-content/uploads/Baker-Creek-Trapper-Cabin-Nick-Fitzhardinge-Low-Res-2-copy.webp',
    imageAlt: 'Example cabin at Baker Creek by Basecamp',
    officialUrl: 'https://basecampresorts.com/bakercreek/', officialLabel: 'Official cabins, suites, café and location',
    roomSource: 'https://basecampresorts.com/room-details/baker-creek-family-superior-two-bedroom-cabin/',
    expediaUrl: 'https://www.expedia.ca/Lake-Louise-Hotels-Baker-Creek-Mountain-Resort.h7710611.Hotel-Information?camref=1101l3MtWX',
    merchantPropertyId: '7710611', merchantEvidence: 'https://www.expedia.ca/Lake-Louise-Hotels-Baker-Creek-Mountain-Resort.h7710611.Hotel-Information',
  },
] as const;

export interface LakeLouiseStayFilters { base: 'all' | 'village' | 'lakeshore' | 'road'; room: 'all' | 'cooking' | 'cabin'; season: 'unsure' | 'winter' | 'summer'; }
export function normaliseLakeLouiseStayFilters(value: unknown = {}): LakeLouiseStayFilters {
  const input = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const base = typeof input.base === 'string' && ['all', 'village', 'lakeshore', 'road'].includes(input.base) ? input.base as LakeLouiseStayFilters['base'] : 'all';
  const room = typeof input.room === 'string' && ['all', 'cooking', 'cabin'].includes(input.room) ? input.room as LakeLouiseStayFilters['room'] : 'all';
  const season = typeof input.season === 'string' && ['unsure', 'winter', 'summer'].includes(input.season) ? input.season as LakeLouiseStayFilters['season'] : 'unsure';
  return { base, room, season };
}
export function buildLakeLouiseStayComparison(input: unknown = {}) {
  const filters = normaliseLakeLouiseStayFilters(input);
  const matches = lakeLouiseStayChoices.filter(stay => (filters.base === 'all' || stay.base === filters.base)
    && (filters.room === 'all' || (filters.room === 'cooking' ? stay.cooking : stay.cabinSeasons.length > 0 && (filters.season === 'unsure' || (stay.cabinSeasons as readonly string[]).includes(filters.season)))));
  const notes = ['Matches describe location and room categories, not availability, suitability or a price ranking. Open a quote for your actual dates, party and room.'];
  if (filters.room === 'cooking') notes.push('Cooking facilities are category-specific: compare the actual appliances and groceries plan. A mini-fridge and microwave alone are not treated as a cooking-category match.');
  if (filters.room === 'cabin' && filters.season === 'winter') notes.push('Paradise’s current winter offer is suites, so it is excluded from winter cabin matches. Baker Creek’s listed cabin layout still needs confirmation for your actual dates.');
  if (filters.base === 'road') notes.push('The two road bases are different locations: Paradise is on Lake Louise Drive; Baker Creek is on the Bow Valley Parkway. Confirm the complete transfer or road journey.');
  if (!matches.length) notes.push('No exact category match in these five properties. Clear a preference or compare another base; this does not mean rooms are sold out.');
  return { filters, selectedIds: matches.map(stay => stay.slug), notes };
}

export const lakeLouiseStayFaqs = [
  { question: 'Is Lake Louise village the same place as the lakeshore or ski resort?', answer: 'No. The village, lakeshore and Lake Louise Ski Resort are separate locations. The Chateau is at the lakeshore; Lake Louise Inn and Mountaineer Lodge are village bases. Paradise is on Lake Louise Drive and Baker Creek is on the Bow Valley Parkway. Check the actual journey between your hotel and each outing.' },
  { question: 'Which Lake Louise stays have cooking facilities?', answer: 'Selected Lake Louise Inn suites and condos, Paradise suites and cabins, and Baker Creek categories offer cooking facilities of different kinds. Confirm the exact appliances and unit. Mountaineer’s reviewed suite lists a microwave and mini-fridge; that is not a verified full kitchen.' },
  { question: 'Does a hotel booking include ski tickets or lake transport?', answer: 'Only if the actual rate and booking terms explicitly include them. Hotel accommodation, ski lift tickets, airport transfers, ski shuttles and summer lake shuttles are separate products. Confirm the season, pickup, reservation and final return directly.' },
  { question: 'Are these live prices or guaranteed room offers?', answer: 'No. Property and merchant identity sources were reviewed on 29 October 2026. Expedia supplies the dated quote, room availability, total and cancellation terms. Match the property address and selected room before paying; no booking is made on BanffBound.' },
];
