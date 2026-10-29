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
export const banffTownHotelReviewSlugs = ["banff-park-lodge", "fox-hotel-suites", "banff-caribou-lodge-spa", "buffalo-mountain-lodge", "hotel-canoe-suites", "otter-hotel", "elk-avenue-hotel", "royal-canadian-lodge", "brewster-mountain-lodge", "banff-aspen-lodge", "banff-ptarmigan-inn", "charltons-banff", "peaks-hotel-suites", "canalta-lodge"] as const;

export const regionalHotelReviewSlugs = [
  'banff-rocky-mountain-resort', 'hidden-ridge-resort', 'rundlestone-lodge',
  'juniper-hotel', 'hi-banff-alpine-centre', 'mountaineer-lodge',
  'post-hotel-spa', 'paradise-lodge-bungalows', 'malcolm-hotel',
  'coast-canmore-hotel', 'basecamp-lodge-canmore', 'lamphouse-canmore',
  'pocaterra-inn-waterslide', 'canmore-inn-suites',
] as const;

export const reviewedHotelDirectorySlugs = [
  'moose-hotel-suites', 'mount-royal-hotel', 'tunnel-mountain-resort',
  'blackstone-mountain-lodge', 'lake-louise-inn', 'fairmont-chateau-lake-louise',
  'sunshine-mountain-lodge', 'emerald-lake-lodge', 'hi-lake-louise-alpine-centre',
  'douglas-fir-resort', 'rundle-mountain-lodge',
  'castle-mountain-chalets', 'storm-mountain-lodge', 'hi-castle-mountain-hostel',
  'baker-creek-by-basecamp', 'copperstone-resort', 'stoneridge-mountain-resort',
  'falcon-crest-lodge', 'cathedral-mountain-lodge',
  'fairmont-banff-springs', 'rimrock-banff',
  ...banffTownHotelReviewSlugs,
  ...regionalHotelReviewSlugs,
] as const;
const reviewed = new Set<string>(reviewedHotelDirectorySlugs);

const additionalSources: Record<string, HotelSourceLink[]> = {
  'banff-rocky-mountain-resort': [
    { label: 'Official suites, condos and kitchen distinctions', url: 'https://rockymountainresort.com/rooms/' },
    { label: 'Official pools, hot tubs and bistro', url: 'https://rockymountainresort.com/amenities/' },
    { label: 'Official town shuttle, pet and parking FAQ', url: 'https://rockymountainresort.com/faq/' },
  ],
  'hidden-ridge-resort': [
    { label: 'Official condo layouts and private-hot-tub category', url: 'https://banffhiddenridge.com/rooms/' },
    { label: 'Official hot pool, wading pool and sauna', url: 'https://banffhiddenridge.com/amenities/' },
    { label: 'Official local-transit, parking and pet FAQ', url: 'https://banffhiddenridge.com/faq/' },
  ],
  'rundlestone-lodge': [
    { label: 'Official room outlooks, lofts and kitchens', url: 'https://rundlestonelodge.com/rooms/' },
    { label: 'Official pool and facilities', url: 'https://rundlestonelodge.com/amenities/' },
    { label: 'Official transport, parking and breakfast FAQ', url: 'https://rundlestonelodge.com/faq/' },
  ],
  'juniper-hotel': [
    { label: 'Official rooms, suites and cabins', url: 'https://thejuniper.com/all-rooms/' },
    { label: 'Official hot tub and guest facilities', url: 'https://thejuniper.com/amenities/' },
    { label: 'Official address, shuttle hours and walking-route caveat', url: 'https://thejuniper.com/transport-location/' },
    { label: 'Official pet and booking FAQ', url: 'https://thejuniper.com/faqs/' },
  ],
  'hi-banff-alpine-centre': [
    { label: 'HI: actual room categories, kitchen, dining, local bus passes and publisher locator', url: 'https://hihostels.ca/en/hostels/hi-banff' },
  ],
  'mountaineer-lodge': [
    { label: 'Official room inventory', url: 'https://mountaineerlodge.com/rooms' },
    { label: 'King Explorer: appliances, beds and stairs', url: 'https://mountaineerlodge.com/rooms/king-explorer-suite' },
    { label: 'Mountaineer Suite: appliances, beds and stairs', url: 'https://mountaineerlodge.com/rooms/mountaineer-suite' },
    { label: 'Official buildings, indoor hot tub, breakfast and transfer information', url: 'https://mountaineerlodge.com/the-hotel/' },
    { label: 'Official pet and booking policies', url: 'https://mountaineerlodge.com/the-hotel/hotel-policies' },
  ],
  'post-hotel-spa': [
    { label: 'Official rooms and railway-side distinction', url: 'https://posthotel.com/stay/rooms' },
    { label: 'Official Family Suite and Family Loft layouts', url: 'https://posthotel.com/stay/family-suites' },
    { label: 'Official pool, spa and facilities', url: 'https://posthotel.com/amenities' },
    { label: 'Official dog-room policy and transfer FAQ', url: 'https://posthotel.com/faqs' },
  ],
  'paradise-lodge-bungalows': [
    { label: 'Official suite kitchens and convenience nooks', url: 'https://paradiselodge.com/suites/' },
    { label: 'Official historic cabin categories', url: 'https://paradiselodge.com/cabins/' },
    { label: 'Current winter-suite operation and arrival instructions', url: 'https://paradiselodge.com/paradise-lodge/' },
    { label: 'Official address and arrival information', url: 'https://paradiselodge.com/about-paradise-lodge-bungalows/' },
  ],
  'malcolm-hotel': [
    { label: 'Official address and current construction notice', url: 'https://www.malcolmhotel.ca/' },
    { label: 'Premium Double Queen: balcony, equipment and no-pets restriction', url: 'https://www.malcolmhotel.ca/Stay/rooms/malcolm-premium-double-queen' },
    { label: 'Official rooftop facilities and weather restrictions', url: 'https://www.malcolmhotel.ca/Stay/amenities' },
  ],
  'coast-canmore-hotel': [
    { label: 'Official property and publisher locator', url: 'https://www.coasthotels.com/coast-canmore-hotel-and-conference-centre' },
    { label: 'Official room categories and accessible features', url: 'https://www.coasthotels.com/coast-canmore-hotel-and-conference-centre/stay/rooms' },
    { label: 'Premium King Suite: fireplace, soaker tub and steam shower', url: 'https://www.coasthotels.com/coast-canmore-hotel-and-conference-centre/stay/rooms/coast-premium-king-suite-with-soaker-tub' },
    { label: 'Official pool, dining and paid parking', url: 'https://www.coasthotels.com/coast-canmore-hotel-and-conference-centre/services/amenities' },
    { label: 'Official address and arrival options', url: 'https://www.coasthotels.com/coast-canmore-hotel-and-conference-centre/contact' },
  ],
  'basecamp-lodge-canmore': [
    { label: 'Current operator: Lodge rooms, Great Room and sauna', url: 'https://basecampresorts.com/canmorelodge/' },
    { label: 'Micro Suite: full kitchen, parking and no-pets restriction', url: 'https://basecampresorts.com/room-details/canmore-lodge-micro-suite-with-kitchen/' },
    { label: 'Official Lodge address', url: 'https://basecampresorts.com/contact/canmorelodge/' },
  ],
  'lamphouse-canmore': [
    { label: 'Current operator: Lamphouse rooms and riverside hot tub', url: 'https://basecampresorts.com/lamphouse/' },
    { label: 'Apartment: actual layout, stairs, kitchen and pet restriction', url: 'https://basecampresorts.com/room-details/lamphouse-apartment/' },
    { label: 'Dog-friendly King is a separate category', url: 'https://basecampresorts.com/room-details/basecamp-lamphouse-canmore-king-room-dog-friendly/' },
    { label: 'Official current address', url: 'https://basecampresorts.com/contact/lamphouse/' },
  ],
  'pocaterra-inn-waterslide': [
    { label: 'Official room categories and cooling distinctions', url: 'https://pocaterrainn.com/rooms/' },
    { label: 'Official pool, waterslide, breakfast and address', url: 'https://pocaterrainn.com/amenities/' },
    { label: 'Official local arrangements FAQ; confirm current booking terms', url: 'https://pocaterrainn.com/faq/' },
  ],
  'canmore-inn-suites': [
    { label: 'Official hotel rooms, railway-side suites and equipment', url: 'https://www.canmoreinn.com/rooms/' },
    { label: 'Official indoor pool, waterslide and facilities', url: 'https://www.canmoreinn.com/amenities/' },
    { label: 'Current official breakfast-rate and pet-room distinctions', url: 'https://www.canmoreinn.com/' },
    { label: 'Official destination-tourism address and property image', url: 'https://www.explorecanmore.ca/listings/canmore-inn-suites-449/' },
  ],
  'banff-park-lodge': [
    { label: "Official rooms and access categories", url: "https://www.banffparklodge.com/rooms/" },
    { label: "Official amenities and transport", url: "https://www.banffparklodge.com/amenities/" },
    { label: "Current guest directory and renovation closures", url: "https://www.banffparklodge.com/faq/" },
    { label: "Official home: ongoing public renovations", url: "https://www.banffparklodge.com/" },
    { label: "Current address and publisher map", url: "https://www.banffparklodge.com/contact-us/" },
  ],
  'fox-hotel-suites': [
    { label: "Official room categories", url: "https://foxhotelandsuites.com/rooms/" },
    { label: "One-bedroom layout and kitchen nook", url: "https://foxhotelandsuites.com/superior-one-bedroom-suite/" },
    { label: "Official facilities and address", url: "https://foxhotelandsuites.com/" },
    { label: "Official transport, parking and pet FAQ", url: "https://foxhotelandsuites.com/faq/" },
  ],
  'banff-caribou-lodge-spa': [
    { label: "Official rooms", url: "https://banffcariboulodge.com/rooms/" },
    { label: "Specific accessible-room features", url: "https://banffcariboulodge.com/accessible-rooms/" },
    { label: "Official hot pool, spa and dining", url: "https://banffcariboulodge.com/amenities/" },
    { label: "Official parking, pets and transit FAQ", url: "https://banffcariboulodge.com/faq/" },
  ],
  'buffalo-mountain-lodge': [
    { label: "Official rooms and cooking facilities", url: "https://crmr.com/resorts/buffalo-mountain/accommodations/" },
    { label: "Official facility, transit and pet FAQ", url: "https://crmr.com/resorts/buffalo-mountain/faq/" },
    { label: "Official address and arrival information", url: "https://crmr.com/resorts/buffalo-mountain/getting-here/" },
  ],
  'hotel-canoe-suites': [
    { label: "Official room, suite and condo categories", url: "https://hotelcanoeandsuites.com/rooms-suites/" },
    { label: "Official amenities and dining", url: "https://hotelcanoeandsuites.com/amenities/" },
    { label: "Official address, local transit and arrival FAQ", url: "https://hotelcanoeandsuites.com/faq/" },
  ],
  'otter-hotel': [
    { label: "Official room categories and nooks", url: "https://otterhotel.com/rooms-suites/" },
    { label: "Official wellness and Good Folk dining", url: "https://otterhotel.com/amenities/" },
    { label: "Official address and transfer options", url: "https://otterhotel.com/contact/" },
  ],
  'elk-avenue-hotel': [
    { label: "Official rooms and loft layouts", url: "https://www.banffjaspercollection.com/hotels/elk-avenue-hotel/rooms/" },
    { label: "Official current facilities and dining", url: "https://www.banffjaspercollection.com/hotels/elk-avenue-hotel/" },
    { label: "Official parking, meals and pet FAQ", url: "https://www.banffjaspercollection.com/hotels/elk-avenue-hotel/experience/faqs/" },
    { label: "Official address", url: "https://www.banffjaspercollection.com/hotels/elk-avenue-hotel/location/" },
  ],
  'royal-canadian-lodge': [
    { label: "Official room configurations", url: "https://royalcanadianlodge.com/rooms/" },
    { label: "Current operator: Banff Collection by InnVest", url: "https://royalcanadianlodge.com/" },
    { label: "Official wellness, parking and dining", url: "https://royalcanadianlodge.com/amenities/" },
    { label: "Official hotel terms", url: "https://royalcanadianlodge.com/hotel-policies/" },
  ],
  'brewster-mountain-lodge': [
    { label: "Official room categories", url: "https://brewstermountainlodge.com/banff-hotel-rooms/" },
    { label: "Official loft stairs, bath and balcony distinction", url: "https://brewstermountainlodge.com/room-type/loft-suite/" },
    { label: "Official breakfast, common areas and parking FAQ", url: "https://brewstermountainlodge.com/brewster-main-faqs/" },
    { label: "Official address", url: "https://brewstermountainlodge.com/contact-us/" },
    { label: "Official destination-tourism image source", url: "https://www.banfflakelouise.com/business/brewsters-mountain-lodge" },
  ],
  'banff-aspen-lodge': [
    { label: "Official room, balcony and access categories", url: "https://www.banffaspenlodge.com/rooms" },
    { label: "Official tubs, sauna, breakfast and pet rules", url: "https://www.banffaspenlodge.com/hotel-amenities" },
    { label: "Official address and transfer information", url: "https://www.banffaspenlodge.com/contact-us" },
  ],
  'banff-ptarmigan-inn': [
    { label: "Official room and split-room layouts", url: "https://banffptarmiganinn.com/rooms/" },
    { label: "Official hot tubs and dining", url: "https://banffptarmiganinn.com/amenities/" },
    { label: "Official local transit, pets and parking FAQ", url: "https://banffptarmiganinn.com/faq/" },
  ],
  'charltons-banff': [
    { label: "Official rooms and suites", url: "https://www.charltonsbanff.com/rooms/" },
    { label: "Official Kitchenette Suite equipment", url: "https://www.charltonsbanff.com/room/kitchenette-suite/" },
    { label: "Official pool and sister-property dining", url: "https://www.charltonsbanff.com/amenities/" },
    { label: "Official hotel address", url: "https://www.charltonsbanff.com/contact/" },
    { label: "Official pet/booking terms", url: "https://www.charltonsbanff.com/hotel-policies/" },
  ],
  'peaks-hotel-suites': [
    { label: "Official Standard room configurations", url: "https://www.peaksbanff.com/standard-rooms" },
    { label: "Official Junior Studio and Suite pantry layouts", url: "https://www.peaksbanff.com/junior-studios-and-suite" },
    { label: "Official sister-property facilities", url: "https://www.peaksbanff.com/amenities" },
    { label: "Official hotel address", url: "https://www.peaksbanff.com/" },
    { label: "Sister-property closure/renovation directory", url: "https://www.banffparklodge.com/faq/" },
  ],
  'canalta-lodge': [
    { label: "Official rooms, kitchens, lofts and pet categories", url: "https://canaltalodge.com/stay/" },
    { label: 'King with Sofa Loft equipment', url: 'https://canaltalodge.com/stay/single-king-sofa-loft-room/' },
    { label: 'King with Sofa and Kitchen Loft equipment', url: 'https://canaltalodge.com/stay/single-king-sofa-kitchen-loft-room/' },
    { label: "Official outdoor courtyard facilities", url: "https://canaltalodge.com/courtyard/" },
    { label: "Official address", url: "https://canaltalodge.com/contact/" },
  ],

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
  'paradise-lodge-bungalows': 'Checked 29 October 2026: the operator now publishes winter suite accommodation; historic cabins are described as summer lodging. Winter check-in uses Cabin 1 and limited front-desk hours. Confirm the chosen unit, actual dates and late arrival directly.',
  'malcolm-hotel': 'Dated notice, checked 29 October 2026: the hotel reports construction of the future Alexander Boutique Hotel & Spa nearby. Ask about impacts for your dates. Outdoor pool/hot-tub operation can change with weather and maintenance.',
  'banff-park-lodge': 'Dated notice, checked 29 October 2026: the operator reports ongoing lobby/public renovations and lists La Terrazza closed for renovations. Confirm the actual entrance and available dining/services.',
  'peaks-hotel-suites': 'Pool, fitness and listed full dining facilities are across the street at Banff Park Lodge. That property currently reports public-area renovations and a La Terrazza closure; confirm usable services and the outdoor route.',
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
