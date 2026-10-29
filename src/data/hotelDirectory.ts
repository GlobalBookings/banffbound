import { hotels, type Hotel } from './hotels';

export type HotelSourceStatus = 'reviewed' | 'location-only' | 'former-name' | 'unreviewed';
export interface HotelSourceLink { label: string; url: string }
export interface DirectoryHotel extends Hotel {
  sourceStatus: HotelSourceStatus;
  sourceStatusLabel: string;
  sourceScope: string;
  operationNote?: string;
  sourceLinks: HotelSourceLink[];
  photoNote: string;
  providerDestination?: string;
}

// A facilities checkedOn field is not automatic permission to publish every old
// field. This explicit register records the scope accepted in the source notes.
export const reviewedHotelDirectorySlugs = [
  'moose-hotel-suites', 'mount-royal-hotel', 'tunnel-mountain-resort',
  'blackstone-mountain-lodge', 'lake-louise-inn', 'fairmont-chateau-lake-louise',
  'sunshine-mountain-lodge', 'emerald-lake-lodge', 'hi-lake-louise-alpine-centre',
  'douglas-fir-resort', 'rundle-mountain-lodge',
  'castle-mountain-chalets', 'storm-mountain-lodge', 'hi-castle-mountain-hostel',
  'baker-creek-by-basecamp', 'copperstone-resort', 'stoneridge-mountain-resort',
  'falcon-crest-lodge', 'cathedral-mountain-lodge',
  'fairmont-banff-springs', 'rimrock-banff',
] as const;
const reviewed = new Set<string>(reviewedHotelDirectorySlugs);

const additionalSources: Record<string, HotelSourceLink[]> = {
  'fairmont-banff-springs': [
    { label: 'Current official room inventory', url: 'https://www.fairmont.com/en/hotels/banff/fairmont-banff-springs.html' },
    { label: 'Official Gatehouse family layouts', url: 'https://www.banff-springs-hotel.com/stay/gatehouse/' },
    { label: 'Official services, accessibility and transport', url: 'https://www.banff-springs-hotel.com/stay/guest-services/' },
    { label: 'Publisher address and GPS locator', url: 'https://all.accor.com/hotel/A550/index.en.shtml' },
  ],
  'rimrock-banff': [
    { label: 'Current operator and room categories', url: 'https://www.emblemscollection.com/rimrock-banff/' },
    { label: 'Accor opening announcement: October 2026', url: 'https://press.accor.com/emblems-collection-announces-the-opening-of-rimrock-banff/?lang=eng' },
    { label: 'Official Classic Room details', url: 'https://www.emblemscollection.com/rimrock-banff/rooms-suites/classic-room/' },
    { label: 'Official Wellness Studio category', url: 'https://www.emblemscollection.com/rimrock-banff/rooms-suites/wellness-studio-peak-view-private-terrace/' },
    { label: 'Official Bathhouse facilities', url: 'https://www.emblemscollection.com/rimrock-banff/wellness/the-bathhouse/' },
    { label: 'Official address and transport', url: 'https://www.emblemscollection.com/rimrock-banff/contact-directions/' },
    { label: 'Publisher address and GPS locator', url: 'https://all.accor.com/hotel/C1W0/index.en.shtml' },
  ],
  'castle-mountain-chalets': [
    { label: 'Official accommodation categories', url: 'https://www.castlemountain.com/rooms-list.html' },
    { label: 'Official FAQ', url: 'https://www.castlemountain.com/faqs.html' },
    { label: 'Official category and pet policies', url: 'https://www.castlemountain.com/policies.html' },
  ],
  'storm-mountain-lodge': [
    { label: 'Official cabin facilities', url: 'https://stormmountainlodge.com/logcabins/' },
    { label: 'Official home and seasonal schedule', url: 'https://stormmountainlodge.com/' },
    { label: 'Official location and schedule', url: 'https://stormmountainlodge.com/contact/' },
    { label: 'Official dining information', url: 'https://stormmountainlodge.com/cuisine/' },
  ],
  'hi-castle-mountain-hostel': [
    { label: 'Official hostel information', url: 'https://hihostels.ca/en/hostels/hi-castle-mountain' },
    { label: 'HI wilderness operating calendar', url: 'https://hihostels.ca/en/wilderness/calendar' },
  ],
  'baker-creek-by-basecamp': [
    { label: 'Official cabins, suites and café', url: 'https://basecampresorts.com/bakercreek/' },
    { label: 'Operator meal-service distinction', url: 'https://basecampresorts.com/group-details/baker-creek-weddings/' },
  ],
  'copperstone-resort': [
    { label: 'Official address and suite facilities', url: 'https://www.copperstoneresort.com/' },
    { label: 'Official contact details', url: 'https://www.copperstoneresort.com/contact-us' },
  ],
  'stoneridge-mountain-resort': [
    { label: 'Official suites and facilities', url: 'https://www.stoneridgeresort.ca/amenities/' },
    { label: 'Official address, transport and FAQ', url: 'https://www.stoneridgeresort.ca/contact-us/' },
  ],
  'falcon-crest-lodge': [
    { label: 'Official hot tubs and restaurant', url: 'https://www.falconcrestlodge.ca/amenities' },
    { label: 'Official one-bedroom suite facilities', url: 'https://www.falconcrestlodge.ca/rooms/one-bedroom-suite' },
  ],
  'cathedral-mountain-lodge': [
    { label: 'Official seasons, transport and eligibility FAQ', url: 'https://www.cathedralmountainlodge.com/frequently-asked-questions/' },
    { label: 'Official cabin categories', url: 'https://www.cathedralmountainlodge.com/accommodation/' },
  ],
};

const formerNames: Record<string, { note: string; sources: HotelSourceLink[] }> = {
  'inns-of-banff': {
    note: 'Former-name record. The operator’s July 2025 release says the former Inns of Banff site was redeveloped as Hotel Canoe & Suites and The Otter Hotel. This old name does not identify a separately verified current hotel. The existing provider URL is retained; check which property it now returns.',
    sources: [{ label: 'Operator release: former site and current properties', url: 'https://www.banfflodgingco.com/wp-content/uploads/PReleaseBCP_July2025-FINAL.pdf' }],
  },
  'banff-international-hotel': {
    note: 'Former-name record. The operator identifies Elk + Avenue Hotel at 333 Banff Avenue as formerly Banff International Hotel. Keep the current name and address separate from this legacy listing and confirm which property the retained provider link returns.',
    sources: [
      { label: 'Operator identity and address', url: 'https://prod.banffjaspercollection.com/contact-us/' },
      { label: 'Operator renaming announcement', url: 'https://www.pursuitcollection.com/Website/media/pursuit/press-release-BTC-introduces-Elk-and-Avenue-Hotel.pdf' },
    ],
  },
};

const operationNotes: Record<string, string> = {
  'cathedral-mountain-lodge': 'Summer seasonal property. The official FAQ lists late May to early October; check the actual year and dates. This is not a year-round winter base.',
  'hi-castle-mountain-hostel': 'Dated operating notice: HI’s calendar lists a 12 October–5 November 2026 closure and date-specific winter opening patterns. Confirm reopening and the chosen date.',
  'storm-mountain-lodge': 'Reduced-season midweek operation. Official home/contact schedules differ; confirm opening nights and meals directly.',
};

/** Reviewed scope is explicit; an old checkedOn/date or provider URL is not enough. */
export function isHotelDirectoryIndexable(slug: string): boolean {
  return reviewed.has(slug) || slug === 'banff-boundary-lodge' || Object.hasOwn(formerNames, slug);
}
export const unreviewedHotelDirectorySlugs = new Set(hotels.filter(hotel => !isHotelDirectoryIndexable(hotel.slug)).map(hotel => hotel.slug));

export const hotelDirectoryPlanningChecks = [
  { title: 'Choose the actual room', text: 'Compare bedrooms, sofa beds, stairs, cooking equipment and bathing fixtures for the category offered. A property name does not establish those facilities.' },
  { title: 'Plan the complete journey', text: 'Match the address to groceries, the activity pickup and the final return. Town buses, regional journeys, airport transfers and ski shuttles have different arrangements.' },
  { title: 'Compare the full booking', text: 'Use the same dates and party. Include taxes, fees, parking, meals and transport, then compare deposits and cancellation. An editorial budget tier is not a nightly quote.' },
  { title: 'Confirm access and current operation', text: 'Ask about the exact access features, allocated pet room, seasonal opening and current facilities. Source review and a map locator do not reserve or guarantee them.' },
];

export function directoryHotel(hotel: Hotel): DirectoryHotel {
  const status: HotelSourceStatus = formerNames[hotel.slug] ? 'former-name' : hotel.slug === 'banff-boundary-lodge' ? 'location-only' : reviewed.has(hotel.slug) ? 'reviewed' : 'unreviewed';
  const factual = status === 'reviewed';
  const locationOnly = status === 'location-only';
  const former = formerNames[hotel.slug];
  const sourceLinks = additionalSources[hotel.slug] || former?.sources || (hotel.officialUrl ? [{ label: locationOnly ? 'Condominium-management source' : 'Official property information', url: hotel.officialUrl }] : []);
  const sourceStatusLabel = { reviewed: 'Selected facts reviewed', 'location-only': 'Location reviewed', 'former-name': 'Former-name record', unreviewed: 'Legacy lead: not source-reviewed' }[status];
  const scope = factual ? 'Selected location, room, facility and policy information was checked against the linked sources. This is a dated source review, not live availability or an access guarantee.'
    : locationOnly ? 'The condominium location is sourced. Current unit facilities, operator and booking policies require confirmation; this is not a verified property-wide hotel offer.'
    : former ? former.note
    : 'This name and provider link are retained from the earlier directory. Current identity, address, operation, photos, facilities and policies have not been source-reviewed here. Use the provider identity check and reviewed alternatives below.';
  const sourcedPoint = (factual || locationOnly) && hotel.coordinateStatus === 'source-verified'
    && Number.isFinite(hotel.lat) && Number.isFinite(hotel.lng)
    && typeof hotel.coordinateSource === 'string' && hotel.coordinateSource.startsWith('https://');
  const images = factual ? [...new Set([hotel.image, ...(hotel.images || [])].filter(image => typeof image === 'string' && image.trim()))] : [];
  const description = factual || locationOnly ? hotel.description : former ? former.note : `${hotel.name} is a retained directory lead. Compare the current identity and exact address with the provider before choosing a room or arranging transport.`;
  let providerDestination: string | undefined;
  try { providerDestination = new URL(hotel.expediaUrl).searchParams.get('destination') || undefined; } catch { /* Retain the URL; the focused check rejects invalid provider URLs. */ }
  return {
    ...hotel,
    sourceStatus: status, sourceStatusLabel, sourceScope: scope, sourceLinks,
    operationNote: operationNotes[hotel.slug],
    providerDestination,
    photoNote: images.length ? 'Property image from a source-reviewed gallery; the pictured category or facility is not a booking inclusion.' : factual ? 'No visually verified property photo is available in this review.' : 'Unverified legacy imagery is withheld; no other property is used as a substitute.',
    description, overview: factual || locationOnly ? hotel.overview : scope,
    image: images[0] || '', images,
    highlights: factual || locationOnly ? hotel.highlights : [],
    nearbyAttractions: factual ? hotel.nearbyAttractions : [],
    amenities: factual ? hotel.amenities : [], roomFeatures: factual ? hotel.roomFeatures : [],
    dining: factual || locationOnly ? hotel.dining : undefined,
    policies: factual || locationOnly ? hotel.policies : undefined,
    address: factual || locationOnly ? hotel.address : undefined,
    checkIn: factual ? hotel.checkIn : undefined, checkOut: factual ? hotel.checkOut : undefined,
    totalRooms: factual ? hotel.totalRooms : undefined,
    yearBuilt: factual ? hotel.yearBuilt : undefined, lastRenovated: factual ? hotel.lastRenovated : undefined,
    officialUrl: sourceLinks[0]?.url,
    checkedOn: factual || locationOnly ? hotel.checkedOn : former ? '2026-10-29' : undefined,
    facilityNote: factual || locationOnly ? hotel.facilityNote : undefined,
    stars: undefined, avgPrice: 'Check the current quote', reviewScore: undefined, reviewLabel: undefined, reviewCount: undefined, guestLoves: undefined,
    lat: sourcedPoint ? hotel.lat : null, lng: sourcedPoint ? hotel.lng : null,
    coordinateStatus: sourcedPoint ? 'source-verified' : 'unavailable',
    coordinateSource: sourcedPoint ? hotel.coordinateSource : undefined,
    coordinateCheckedOn: sourcedPoint ? hotel.coordinateCheckedOn : undefined,
    coordinateNote: sourcedPoint ? hotel.coordinateNote : 'No source-documented directory map point is published. Confirm the exact address and arrival directions directly.',
  };
}

export const directoryHotels = hotels.map(directoryHotel).sort((a, b) => {
  const order = { reviewed: 0, 'location-only': 1, 'former-name': 2, unreviewed: 3 };
  return order[a.sourceStatus] - order[b.sourceStatus];
});

export function hotelDirectorySchema(hotel: DirectoryHotel) {
  const url = `https://banffbound.com/hotel-directory/${hotel.slug}/`;
  if (hotel.sourceStatus !== 'reviewed') return {
    '@context': 'https://schema.org', '@type': 'WebPage', name: `${hotel.name}: directory record`, url,
    description: hotel.description,
    ...(hotel.sourceStatus === 'location-only' ? { about: { '@type': 'Place', name: hotel.name,
      ...(hotel.address ? { address: hotel.address } : {}),
      ...(hotel.coordinateStatus === 'source-verified' ? { geo: { '@type': 'GeoCoordinates', latitude: hotel.lat, longitude: hotel.lng } } : {}),
    } } : {}),
  };
  const types: Record<string, string> = { Hotel: 'Hotel', Resort: 'Resort', Hostel: 'Hostel', Motel: 'Motel', 'B&B': 'BedAndBreakfast' };
  return {
    '@context': 'https://schema.org', '@type': types[hotel.type] || 'LodgingBusiness', name: hotel.name, url,
    description: hotel.description,
    ...(hotel.image ? { image: new URL(hotel.image, 'https://banffbound.com').href } : {}),
    ...(hotel.address ? { address: { '@type': 'PostalAddress', streetAddress: hotel.address } } : {}),
    ...(hotel.coordinateStatus === 'source-verified' ? { geo: { '@type': 'GeoCoordinates', latitude: hotel.lat, longitude: hotel.lng } } : {}),
  };
}
