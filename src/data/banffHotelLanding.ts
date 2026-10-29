import { directoryHotels } from './hotelDirectory';

export const banffHotelLandingId = 'banff-hotels';
export const banffHotelLandingCheckedOn = '2026-10-29';
export const banffHotelLandingUrl = 'https://banffbound.com/book/banff-hotels/';

export const banffHotelBaseOptions = [
  { value: 'all', label: 'All Banff bases' },
  { value: 'central', label: 'Central Banff Avenue' },
  { value: 'avenue', label: 'Outer Banff Avenue' },
  { value: 'hillside', label: 'A hillside base' },
  { value: 'spray', label: 'Spray Avenue resort' },
] as const;

export const banffHotelPriorityOptions = [
  { value: 'all', label: 'See every fit' },
  { value: 'cook', label: 'A full-kitchen category' },
  { value: 'soak', label: 'Hot pools or tubs listed' },
  { value: 'separate', label: 'A separate-bedroom category' },
] as const;

type Base = Exclude<(typeof banffHotelBaseOptions)[number]['value'], 'all'>;
type Priority = Exclude<(typeof banffHotelPriorityOptions)[number]['value'], 'all'>;

interface Selection {
  slug: string;
  base: Base;
  priorities: Priority[];
  fit: string;
  summary: string;
  room: string;
  kitchen: string;
  facilities: string;
  tradeoff: string;
  imageAlt: string;
  imageCaption: string;
  expediaPropertyId: string;
  expediaIdentitySource: string;
  expediaAddress: string;
  officialSources: Array<{ label: string; url: string }>;
  notice?: string;
}

// Selection order presents different stay plans, not a quality or price ranking.
// The six merchant identities were matched by name and street address. That
// establishes the property target only: no dates, room offer or rate was checked.
const selections: Selection[] = [
  {
    slug: 'moose-hotel-suites', base: 'central', priorities: ['soak', 'separate'],
    fit: 'Central suites + rooftop hot pools',
    summary: 'Keep Banff Avenue restaurants close and compare a hotel room with a suite that adds a separate living area. This is a useful fit when town evenings and a hotel pool matter more than a full cooking kitchen.',
    room: 'Superior One Bedroom Suite: separate bedroom, living room and gas fireplace. Match king or two-queen beds to your party.',
    kitchen: 'Suite nook with microwave, mini-fridge and sink; no full cooking kitchen.',
    facilities: 'Two rooftop hot pools, an indoor swimming pool and Pacini restaurant.',
    tradeoff: '345 Banff Avenue. Local Roam passes help with town trips; ski resorts and regional journeys need their own transport plan.',
    imageAlt: 'Living room in an official Moose Hotel and Suites one-bedroom suite photograph',
    imageCaption: 'Official one-bedroom suite photograph; choose the actual room category on Expedia.',
    expediaPropertyId: '14703440',
    expediaIdentitySource: 'https://www.expedia.ca/Banff-Hotels-Moose-Hotel-And-Suites.h14703440.Hotel-Information',
    expediaAddress: '345 Banff Ave, Banff',
    officialSources: [
      { label: 'Suite layout and kitchen equipment', url: 'https://moosehotelandsuites.com/superior-one-bedroom-suite/' },
      { label: 'Pools and hotel facilities', url: 'https://moosehotelandsuites.com/amenities/' },
    ],
  },
  {
    slug: 'mount-royal-hotel', base: 'central', priorities: [],
    fit: 'Town restaurants + a central room',
    summary: 'Choose a central Banff Avenue address for shops, restaurants and evenings in town. Brazen is on site; compare the room’s bed configuration and position rather than paying for cooking space you will not use.',
    room: 'Compare the provider’s Heritage and Centennial king or two-bed categories with the needs of your party.',
    kitchen: 'Plan restaurant meals; no full kitchen is established for the rooms in this comparison.',
    facilities: 'Brazen restaurant, Cascade Lounge and a hotel library.',
    tradeoff: '138 Banff Avenue. A central room can simplify town plans; lifts and trailheads still require a journey. Ask about room position and parking.',
    imageAlt: 'Two-bed Centennial room in the official Mount Royal Hotel gallery',
    imageCaption: 'Official Centennial room photograph; beds and room position depend on the selected category.',
    expediaPropertyId: '688930',
    expediaIdentitySource: 'https://www.expedia.ca/Banff-Hotels-Mount-Royal-Hotel.h688930.Hotel-Information',
    expediaAddress: '138 Banff Avenue, Banff',
    officialSources: [
      { label: 'Current hotel facilities and maintenance notice', url: 'https://www.banffjaspercollection.com/hotels/mount-royal-hotel/' },
    ],
    notice: 'Checked 29 October 2026: the official hotel page still reports both rooftop hot tubs closed for maintenance. Choose another fit if a soak is essential, or confirm reopening directly.',
  },
  {
    slug: 'tunnel-mountain-resort', base: 'hillside', priorities: ['cook', 'separate'],
    fit: 'Condo cooking + flexible sleeping layouts',
    summary: 'Compare condos, loft layouts and cabins above central Banff. A selected full-kitchen condo can suit a longer stay or a party planning its own meals; the Superior Suite’s lighter kitchenette is a different choice.',
    room: 'One Bedroom Condo: queen bedroom and living-room sofa bed. Loft categories offer other bed arrangements and introduce stairs.',
    kitchen: 'Full kitchens in named condos; Superior Suites have kitchenettes. Match the exact category.',
    facilities: 'Indoor swimming pool, guest laundry and outdoor guest barbecues.',
    tradeoff: '502 Tunnel Mountain Road. Plan groceries, the hill and your final local-bus return before choosing a car-free stay.',
    imageAlt: 'Tunnel Mountain Resort buildings in the official property gallery',
    imageCaption: 'Official resort photograph; the pictured building does not identify your allocated unit.',
    expediaPropertyId: '16324',
    expediaIdentitySource: 'https://www.expedia.ca/Banff-Hotels-Tunnel-Mountain-Resort.h16324.Hotel-Information',
    expediaAddress: '502 Tunnel Mountain Road, Banff',
    officialSources: [
      { label: 'Condo, loft and suite layouts', url: 'https://tunnelmountain.com/rooms/' },
      { label: 'Pool, barbecues and local transport', url: 'https://tunnelmountain.com/amenities/' },
    ],
  },
  {
    slug: 'canalta-lodge', base: 'avenue', priorities: ['cook', 'soak'],
    fit: 'Courtyard tubs + a kitchen upgrade',
    summary: 'Stay farther along Banff Avenue with courtyard hot tubs, a cold plunge and a barrel sauna. Pick a Standard room for a hotel stay or a specifically named kitchen category when cooking is part of the plan.',
    room: 'King with Sofa and Kitchen Loft adds a king bed, pull-out sofa and full-size kitchen. The other King with Sofa Loft lists a fridge and microwave.',
    kitchen: 'Full kitchen only in the named kitchen categories; check loft stairs and the actual layout.',
    facilities: 'Two outdoor hot tubs, cold plunge, barrel sauna and Happy Camper Coffee Shop.',
    tradeoff: '545 Banff Avenue. Compare the walk or local journey into the central blocks and arrange the activity pickup separately.',
    imageAlt: 'Guests in Canalta Lodge’s outdoor courtyard hot tub in an official property photograph',
    imageCaption: 'Official courtyard hot-tub photograph; a kitchen or loft is a separately selected room category.',
    expediaPropertyId: '888459',
    expediaIdentitySource: 'https://www.expedia.ca/Banff-Hotels-Canalta-Lodge.h888459.Hotel-Information',
    expediaAddress: '545 Banff Ave, Banff',
    officialSources: [
      { label: 'Room and kitchen categories', url: 'https://canaltalodge.com/stay/' },
      { label: 'Kitchen Loft equipment', url: 'https://canaltalodge.com/stay/single-king-sofa-kitchen-loft-room/' },
      { label: 'Courtyard facilities', url: 'https://canaltalodge.com/courtyard/' },
    ],
  },
  {
    slug: 'juniper-hotel', base: 'hillside', priorities: ['soak'],
    fit: 'A hillside outlook + an on-site bistro',
    summary: 'Choose the Mount Norquay Road side of Banff for a hillside hotel and Juniper Bistro. Compare a mountain-facing Deluxe room with a Standard room on the forest side; make transport into town part of the choice.',
    room: 'Deluxe King or Two Queen for a mountain-facing outlook. Standard and accessible room categories have different positions and features.',
    kitchen: 'Hotel-room base with bistro dining; no full kitchen is established for these room categories.',
    facilities: 'Outdoor hot tub, Juniper Bistro, guest parking and a requested town shuttle.',
    tradeoff: '1 Juniper Way. The requested shuttle currently lists 10 AM–6 PM; plan later returns. The walking route lacks continuous sidewalks and lighting.',
    imageAlt: 'Deluxe King room with a mountain-facing window in the official Juniper Hotel gallery',
    imageCaption: 'Official Deluxe King photograph; reserve a matching outlook if it matters to your stay.',
    expediaPropertyId: '1216217',
    expediaIdentitySource: 'https://www.expedia.ca/Banff-Hotels-The-Juniper-Hotel.h1216217.Hotel-Information',
    expediaAddress: '1 Juniper Way, Banff',
    officialSources: [
      { label: 'Room outlooks and categories', url: 'https://thejuniper.com/all-rooms/' },
      { label: 'Facilities', url: 'https://thejuniper.com/amenities/' },
      { label: 'Town shuttle and arrival route', url: 'https://thejuniper.com/transport-location/' },
    ],
  },
  {
    slug: 'fairmont-banff-springs', base: 'spray', priorities: ['separate'],
    fit: 'A resort stay + specific family layouts',
    summary: 'Build the stay around Fairmont’s Spray Avenue resort and its restaurants, with main-building and Gatehouse room choices. Compare the actual family layout, view and booked inclusions before choosing a standard room or suite.',
    room: 'Gatehouse Family Room has a king and twin bunks; the separate Family Suite adds a primary bedroom, built-in bunks and two bathrooms.',
    kitchen: 'Hotel and suite categories in this comparison do not establish a full cooking kitchen.',
    facilities: 'On-site restaurants and lounges, private ski/bike storage and separately arranged spa treatments.',
    tradeoff: '405 Spray Avenue is separate from central Banff Avenue. Include parking, resort fees, meals and the town or ski journey in the complete quote.',
    imageAlt: 'Guest room and bell service in Fairmont Banff Springs’ official guest-services photograph',
    imageCaption: 'Official guest-services photograph; main-building and Gatehouse rooms are distinct choices.',
    expediaPropertyId: '13652',
    expediaIdentitySource: 'https://www.expedia.ca/fr/Banff-Hotels-Fairmont-Banff-Springs.h13652.Description-Hotel',
    expediaAddress: '405 Spray Ave, Banff',
    officialSources: [
      { label: 'Main-building and Gatehouse rooms', url: 'https://www.fairmont.com/en/hotels/banff/fairmont-banff-springs.html' },
      { label: 'Gatehouse family choices', url: 'https://www.banff-springs-hotel.com/stay/gatehouse/' },
      { label: 'Guest services and transport', url: 'https://www.banff-springs-hotel.com/stay/guest-services/' },
    ],
  },
];

export const banffHotelLandingOffers = selections.map(selection => {
  const hotel = directoryHotels.find(hotel => hotel.slug === selection.slug);
  if (!hotel || hotel.sourceStatus !== 'reviewed' || !hotel.image) {
    throw new Error(`Banff hotel landing requires a reviewed profile and verified photo: ${selection.slug}`);
  }
  const bookingUrl = new URL(hotel.expediaUrl);
  if (bookingUrl.hostname !== 'www.expedia.ca' || bookingUrl.searchParams.get('camref') !== '1101l3MtWX'
    || !bookingUrl.pathname.includes(`.h${selection.expediaPropertyId}.Hotel-Information`)) {
    throw new Error(`Recheck the merchant property identity before changing the landing target: ${selection.slug}`);
  }
  return {
    ...selection,
    name: hotel.name, image: hotel.image, address: hotel.address || selection.expediaAddress,
    expediaUrl: hotel.expediaUrl,
    bookingTargetKind: 'verified-property' as const,
    checkedOn: banffHotelLandingCheckedOn,
    profileUrl: `/hotel-directory/${hotel.slug}/`,
  };
});

export const banffHotelLandingFaqs = [
  { question: 'Which choices have full kitchens?', answer: 'Tunnel Mountain Resort lists full kitchens in named condo categories. Canalta lists specifically named kitchen rooms and a Kitchen Loft. Moose suites have a microwave, mini-fridge and sink nook. Select the exact category and confirm its equipment in the booking offer.' },
  { question: 'Which choices put me in central Banff?', answer: 'Mount Royal is at 138 Banff Avenue and Moose at 345 Banff Avenue. Canalta is farther along the avenue; Tunnel Mountain and Juniper are hillside bases. Fairmont Banff Springs is on Spray Avenue. Choose the address around your evenings, groceries and activity pickup.' },
  { question: 'Are these ski-in, ski-out hotels?', answer: 'These six Banff bases require a journey to the ski resorts. A town Roam pass and a resort ski shuttle are different services. Confirm the pickup and final return for the resort you plan to visit.' },
  { question: 'What should I compare on Expedia?', answer: 'Use the same dates, adults, children’s ages and number of rooms. Match the exact bed layout, kitchen and view, then read the total with taxes and fees, parking, payment timing and the selected rate’s cancellation terms. You choose the room and complete the booking on Expedia.' },
];

export const banffHotelLandingSchema = {
  '@context': 'https://schema.org', '@type': 'CollectionPage',
  name: 'Compare Banff hotels by the stay you want', url: banffHotelLandingUrl,
  dateModified: banffHotelLandingCheckedOn,
  description: 'Six sourced Banff hotel choices compared by location, room layout, cooking facilities and the complete stay.',
  mainEntity: {
    '@type': 'ItemList', itemListOrder: 'https://schema.org/ItemListUnordered',
    numberOfItems: banffHotelLandingOffers.length,
    itemListElement: banffHotelLandingOffers.map((offer, index) => ({
      '@type': 'ListItem', position: index + 1, name: offer.name,
      url: new URL(offer.profileUrl, 'https://banffbound.com').href,
    })),
  },
};
