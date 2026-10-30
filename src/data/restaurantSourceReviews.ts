import { restaurants, drinkSpots, type Area, type Restaurant, type DrinkSpot } from './restaurants';

export const restaurantSourceReviewedAt = '2026-10-29';
export interface DiningSourceLink { label: string; url: string; }
export interface DiningDatedNotice { label: string; text: string; from?: string; through?: string; url: string; }
/** Selected publisher facts only; no live service, availability, image licence or surveyed location assessment. */
export interface DiningSourceReview {
  status: 'selected-facts' | 'pending'; checkedOn: string;
  name: string; area: Area; description: string; type: string | null; cuisine: string | null;
  address: string | null; phone: string | null; website: string | null; menuUrl: string | null; reserveUrl: string | null;
  highlights: string[]; serviceNote: string; journeyNote: string; scope: string; sources: DiningSourceLink[];
  notes?: string[]; enquiryLinks?: DiningSourceLink[]; notices?: DiningDatedNotice[];
}

const checkedOn = restaurantSourceReviewedAt;
const chateauNotice = (url: string): DiningDatedNotice => ({ label: 'Dated hotel access notice', from: '2026-10-26', through: '2026-10-29', text: 'For October 26–29, 2026, the Chateau publisher reserved hotel access and dining for registered overnight guests. This date-specific notice does not establish access on a later date; confirm with the hotel.', url });
const chateauJourney = 'At Fairmont Chateau Lake Louise beside the lake, separate from Lake Louise village and the ski resort. Confirm hotel access before arranging the journey.';

export const restaurantSourceReviews: Record<string, DiningSourceReview> = {
  'the-alpine-social': {
    status: 'selected-facts', checkedOn, name: 'Alpine Social', area: 'Lake Louise',
    description: 'A Chateau Lake Louise restaurant and bar offering comfort food and drinks in the lakeside hotel. Choose it as a hotel dining visit, with access and seating checked before the journey.',
    type: 'Restaurant & Bar', cuisine: 'Comfort food', address: '111 Lake Louise Drive, Lake Louise, AB T0L 1E0', phone: '(403) 522-1817',
    website: 'https://www.chateau-lake-louise.com/dine/alpine-social/', menuUrl: 'https://www.chateau-lake-louise.com/dine/alpine-social/', reserveUrl: null,
    highlights: ['Inside Chateau Lake Louise', 'Comfort-food menu', 'Hotel access check'],
    serviceNote: 'The operator describes summer walk-in seating with priority for in-house guests. Check the actual season, food service and hotel access with dining reservations; a bar closing time is not the kitchen closing time.',
    journeyNote: chateauJourney, scope: 'Current venue name, Chateau location, published dining contact, menu and season-qualified seating policy. No live table, hours or admission availability.',
    sources: [{ label: 'Chateau: Alpine Social menu, location and access', url: 'https://www.chateau-lake-louise.com/dine/alpine-social/' }], notices: [chateauNotice('https://www.chateau-lake-louise.com/dine/alpine-social/')],
  },
  'blake-brewpub': {
    status: 'selected-facts', checkedOn, name: 'BLAKE Brewhouse & Distillery', area: 'Canmore',
    description: 'A restaurant, brewhouse and distillery on Bow Valley Trail, with an international-fusion menu and house-produced drinks. Plan the actual Bow Valley Trail address rather than a Main Street pub stop.',
    type: 'Restaurant, Brewhouse & Distillery', cuisine: 'International fusion', address: '810 Bow Valley Trail, Canmore, AB T1W 1N6', phone: '(403) 675-3663',
    website: 'https://www.blakecanmore.com/', menuUrl: 'https://www.blakecanmore.com/blake-menu', reserveUrl: null,
    highlights: ['Bow Valley Trail address', 'Restaurant, brewhouse and distillery', 'Main, drinks and kids menus'],
    serviceNote: 'The contact page says ordinary restaurant seating is first come, first served. Private functions have a separate enquiry route. Confirm current kitchen service; a late-night menu link does not settle a conflicting hours display.',
    journeyNote: 'This is the Bow Valley Trail venue. Do not substitute an old Main Street address or assume these contact and seating rules establish a separate PD3 venue.',
    scope: 'Current BLAKE identity, address, phone, menus and ordinary seating model. No price, specific beer brand, daily service or separate PD3 operation verified.',
    sources: [{ label: 'BLAKE contact and seating', url: 'https://www.blakecanmore.com/contact' }, { label: 'BLAKE current menu routes', url: 'https://www.blakecanmore.com/blake-menu' }, { label: 'BLAKE current venue identity', url: 'https://www.blakecanmore.com/' }],
  },
  'the-iron-goat': {
    status: 'selected-facts', checkedOn, name: 'The Iron Goat Pub & Grill', area: 'Canmore',
    description: 'A pub and grill at the Benchlands Trail address, with a published food-and-drink menu and an online reservation route. It is a separate meal journey from Canmore’s Main Street.',
    type: 'Pub & Grill', cuisine: 'Pub and grill menu', address: '703 Benchlands Trail, Canmore, AB T1W 3G9', phone: '(403) 609-0222',
    website: 'https://www.irongoat.ca/', menuUrl: 'https://www.irongoat.ca/', reserveUrl: 'https://www.tbdine.com/book/restaurant/the-iron-goat?idApp=100&language=en-us',
    highlights: ['Benchlands Trail address', 'Published menu', 'Separate group-dining enquiries'],
    serviceNote: 'The operator links online reservations and asks guests needing immediate assistance to call. Group dining has separate arrangements. Check the current service and confirmation rather than assuming a table or patio.',
    journeyNote: 'Use 703 Benchlands Trail for the meal journey, not the imported Main Street address. Arrange the complete return to your accommodation separately.',
    scope: 'Operator identity, physical address, phone, menu and operator-linked reservation route. No fixed hours, rooftop/patio access or live seating verified.',
    sources: [{ label: 'Iron Goat menus, contact and reservations', url: 'https://www.irongoat.ca/' }],
  },
  'baker-creek-bistro': {
    status: 'selected-facts', checkedOn, name: 'Creekside Café at Baker Creek', area: 'Highway 1A',
    description: 'The current Baker Creek publisher describes a front-office café with grab-and-go breakfast, lunch and snacks. Plan a café stop or supplies enquiry, rather than a fine-dining dinner based on the old bistro name.',
    type: 'Café & Grab-and-go', cuisine: 'Breakfast, lunch and snacks', address: 'Baker Creek, Bow Valley Parkway, Lake Louise, AB T0L 1E0', phone: null,
    website: 'https://basecampresorts.com/bakercreek/', menuUrl: null, reserveUrl: null,
    highlights: ['Creekside Café service', 'Grab-and-go breakfast and lunch', 'Bow Valley Parkway property'],
    serviceNote: 'Confirm café hours, the food available and access for your visit directly with the property. Its published café offer does not establish a dinner restaurant, a table reservation or admission for every visitor.',
    journeyNote: 'At the Baker Creek property on the Bow Valley Parkway, outside Lake Louise village. Confirm the complete road journey and any separately arranged transfer.',
    scope: 'Current publisher’s café identity, stated food format and property address. The historical bistro’s closure or changeover date and a dedicated café phone/menu are not established.',
    sources: [{ label: 'Baker Creek: current Creekside Café and property location', url: 'https://basecampresorts.com/bakercreek/' }, { label: 'Baker Creek arrival information and front-office café', url: 'https://basecampresorts.com/bakercreek/arrival-essentials/' }],
    notes: ['The property homepage and arrival page publish different general and front-desk phone numbers. Use the property contact route to confirm café service; no dedicated café number is asserted.', 'The arrival page has an unrelated Sundance browser title; the Baker Creek heading, address and café section provide the scoped evidence used here.'],
  },
  'pd3-by-blake': {
    status: 'pending', checkedOn, name: 'PD3 by Blake', area: 'Canmore',
    description: 'Keep PD3 on the list of places to ask about, but confirm its current identity and location before planning a meal. The checked BLAKE pages did not establish the separate pizzeria, address or menu described in the older entry.',
    type: null, cuisine: null, address: null, phone: null, website: null, menuUrl: null, reserveUrl: null, highlights: [],
    serviceNote: 'Current PD3 service, opening dates, menu and booking arrangements need checking. This is not a closure notice.',
    journeyNote: 'The older Canmore location has not been verified. A BLAKE enquiry does not make its Bow Valley Trail address the PD3 meeting point.',
    scope: 'BLAKE’s current website, menu and contacts were checked for a PD3 identity. That identity and the older operational/contact claims remain unresolved.',
    sources: [{ label: 'Related BLAKE publisher checked', url: 'https://www.blakecanmore.com/' }, { label: 'Related BLAKE menu checked', url: 'https://www.blakecanmore.com/blake-menu' }],
    enquiryLinks: [{ label: 'Ask BLAKE about PD3; this is not a verified PD3 location', url: 'https://www.blakecanmore.com/contact' }],
  },
  'lake-louise-station': {
    status: 'selected-facts', checkedOn, name: 'The Station Restaurant', area: 'Lake Louise',
    description: 'The heritage railway-station restaurant’s own publisher reports an extended renovation closure under new ownership. Keep it as a place to follow for reopening information, rather than an available meal stop.',
    type: 'Restaurant — renovation notice', cuisine: null, address: '200 Sentinel Road, Lake Louise, AB T0L 1E0', phone: null,
    website: 'https://www.lakelouisestation.com/contact', menuUrl: null, reserveUrl: null, highlights: ['Heritage station location', 'Operator renovation notice'],
    serviceNote: 'The operator says the restaurant is closed for an extended period and will update the reopening timeline. No reopening date or active meal service is established.',
    journeyNote: 'The published address is on Sentinel Road in Lake Louise. Do not make a meal journey dependent on an older menu or opening-hours listing.',
    scope: 'Current operator identity, address and published renovation closure. Current phone, menus, reservations and a reopening day are not established.',
    sources: [{ label: 'Station Restaurant: current contact and renovation notice', url: 'https://www.lakelouisestation.com/contact' }],
    notices: [{ label: 'Renovation closure reported by the operator', text: 'Checked October 29, 2026: the operator reports an extended closure for renovations under new ownership. Its promise of a later update does not establish reopening.', url: 'https://www.lakelouisestation.com/contact' }],
  },
  'fairview-dining-room': {
    status: 'selected-facts', checkedOn, name: 'Fairview Bar & Restaurant', area: 'Lake Louise',
    description: 'A restaurant and bar inside Fairmont Chateau Lake Louise with a contemporary Rocky Mountain menu. Plan a lakeside-hotel dining visit, and confirm hotel access and the intended bar or dinner service.',
    type: 'Restaurant & Bar', cuisine: 'Contemporary Rocky Mountain', address: '111 Lake Louise Drive, Lake Louise, AB T0L 1E0', phone: '(403) 522-1817',
    website: 'https://www.chateau-lake-louise.com/dine/fairview-bar-restaurant/', menuUrl: 'https://www.chateau-lake-louise.com/dine/fairview-bar-restaurant/', reserveUrl: null,
    highlights: ['Inside Chateau Lake Louise', 'Distinct bar and dinner service', 'Direct dining contact'],
    serviceNote: 'The operator prioritises registered hotel guests and provides a direct dining contact for booking. Confirm access and the specific service; a hotel room or a bar visit does not itself establish a dinner table.',
    journeyNote: chateauJourney, scope: 'Current Fairview name, location, dining phone, published menu and guest-priority access note. No table availability, fixed hours or unrestricted public access verified.',
    sources: [{ label: 'Chateau: Fairview menu, contact and access', url: 'https://www.chateau-lake-louise.com/dine/fairview-bar-restaurant/' }], notices: [chateauNotice('https://www.chateau-lake-louise.com/dine/fairview-bar-restaurant/')],
  },
  'walliser-stube': {
    status: 'selected-facts', checkedOn, name: 'Walliser Stube', area: 'Lake Louise',
    description: 'A Chateau Lake Louise dinner venue with European Alpine dishes and fondue on its published menu. It is a hotel dining destination with its own access and booking checks.',
    type: 'Dinner Restaurant', cuisine: 'European Alpine', address: '111 Lake Louise Drive, Lake Louise, AB T0L 1E0', phone: '(403) 522-1817',
    website: 'https://www.chateau-lake-louise.com/dine/walliser-stube/', menuUrl: 'https://www.chateau-lake-louise.com/dine/walliser-stube/', reserveUrl: null,
    highlights: ['European Alpine dinner menu', 'Inside Chateau Lake Louise', 'Direct dining contact'],
    serviceNote: 'The operator prioritises registered hotel guests. Contact dining reservations for the date, admission and dinner arrangement rather than assuming every non-resident visitor can dine.',
    journeyNote: chateauJourney, scope: 'Current dinner-venue identity, location, dining contact, menu and guest-priority note. No current seating, exact hours or universal guest eligibility verified.',
    sources: [{ label: 'Chateau: Walliser Stube menu, contact and access', url: 'https://www.chateau-lake-louise.com/dine/walliser-stube/' }], notices: [chateauNotice('https://www.chateau-lake-louise.com/dine/walliser-stube/')],
  },
  'trailhead-cafe': {
    status: 'pending', checkedOn, name: 'Trailhead Cafe', area: 'Lake Louise',
    description: 'Banff & Lake Louise Tourism lists Trailhead Cafe in Samson Mall in the village. Check the current operator information before making it the meal stop your day depends on.',
    type: 'Café', cuisine: null, address: 'Samson Mall, Lake Louise, AB', phone: null, website: null, menuUrl: null, reserveUrl: null,
    highlights: ['Samson Mall location listed'], serviceNote: 'The tourism publisher links an operator Facebook page that could not be read at review. Current hours, menu, contact and service need checking; no closure is inferred.',
    journeyNote: 'The checked listing places it in Lake Louise village, separate from the lake’s hotel and the ski resort.',
    scope: 'Official tourism-listed name and mall location only. A current operator menu, contact, opening status and service have not been independently confirmed.',
    sources: [{ label: 'Banff & Lake Louise Tourism: Trailhead listing and operator link', url: 'https://www.banfflakelouise.com/business/trailhead-cafe' }],
    enquiryLinks: [{ label: 'Check the tourism listing and its operator link', url: 'https://www.banfflakelouise.com/business/trailhead-cafe' }],
    notes: ['The tourism listing links https://www.facebook.com/lakelouiseAB; it returned a research-tool cache miss. No guessed standalone café domain, old menu PDF, fixed hours or phone is promoted as current operator evidence.'],
  },
  'bill-peytos-cafe': {
    status: 'selected-facts', checkedOn, name: 'Bill Peyto’s Café', area: 'Lake Louise',
    description: 'The café inside HI Lake Louise Alpine Centre is a village meal-and-drink option published by the hostel itself. Use the hostel’s current contact route to check the service that fits your day.',
    type: 'Hostel Café', cuisine: 'Home-style meals', address: '203 Village Road, Lake Louise, AB', phone: '(403) 522-2201',
    website: 'https://www.hihostels.ca/en/hostels/hi-lake-louise', menuUrl: null, reserveUrl: null,
    highlights: ['Inside HI Lake Louise Alpine Centre', 'Village Road location', 'Hostel general enquiry route'],
    serviceNote: 'The current hostel page confirms on-site café meals and drinks. Ask about the exact meal, current menu and seating arrangement; a hostel room booking is separate from a meal.',
    journeyNote: 'Inside the hostel at 203 Village Road in Lake Louise village, separate from the lakeshore and ski resort. The published phone is the hostel’s general contact, not a separately verified café line.',
    scope: 'Current hostel-published café identity, location, general contact and meal/drink offer. Specific meal periods, hours, reservations and takeout rules are not re-established by the current reachable page.',
    sources: [{ label: 'HI Canada: current Lake Louise hostel and on-site café', url: 'https://www.hihostels.ca/en/hostels/hi-lake-louise' }],
    notes: ['The current hostel’s View menus button still targets /en/about/hostels/bill-peytos-cafe, which returned404 at review. Old cached page and menu terms were not copied into the projection.'],
  },
  'tavern-1883': {
    status: 'selected-facts', checkedOn, name: 'Tavern 1883', area: 'Canmore',
    description: 'A Canmore restaurant and bar on 9th Street with published dine-in, pickup and catering routes. Use its actual street address and choose the dining service before fitting it into an evening.',
    type: 'Restaurant & Bar', cuisine: 'Pub menu', address: '709 9th Street, Canmore, AB T1W 2V7', phone: '(403) 609-2000',
    website: 'https://tavern1883.com/', menuUrl: 'https://tavern1883.com/menu/', reserveUrl: null,
    highlights: ['9th Street address', 'Dine-in and pickup menu', 'Separate catering enquiries'],
    serviceNote: 'The operator says larger-party reservations are sometimes available on request, depending on the day, and publishes a separate kitchen cutoff. It currently welcomes minors until 10 pm; confirm the actual party and event rather than assuming late admission.',
    journeyNote: 'The operator gives 709 9th Street, rather than the older Main Street address. Plan the return from this venue to the actual accommodation.',
    scope: 'Operator identity, physical address, phone, dine-in/pickup menu, limited group-reservation route and stated minor-admission cutoff. No fixed weekly hours, promotion or admission availability verified.',
    sources: [{ label: 'Tavern1883: current location, party and admission guidance', url: 'https://tavern1883.com/' }, { label: 'Tavern1883: dine-in/pickup menu', url: 'https://tavern1883.com/menu/' }],
  },
  'crazyweed-kitchen': {
    status: 'selected-facts', checkedOn, name: 'Crazyweed', area: 'Canmore',
    description: 'A Railway Avenue restaurant with globally influenced dishes, small plates, main courses and pizza on its published menu. Choose between a dining-room reservation and the operator’s separate walk-in seating arrangements.',
    type: 'Restaurant', cuisine: 'Globally influenced', address: '1600 Railway Avenue, Canmore, AB T1W 1P6', phone: '(403) 609-2530',
    website: 'https://www.crazyweed.ca/', menuUrl: 'https://www.crazyweed.ca/menu', reserveUrl: 'https://www.tbdine.com/canmore/restaurants/crazyweed-kitchen?language=en-us',
    highlights: ['Railway Avenue location', 'Published food and drinks menu', 'Dining-room reservations'],
    serviceNote: 'The operator accepts dining-room reservations; patio and bar seating are first come, first served. It asks groups of seven or more to enquire by email. Confirm current service and discuss dietary needs directly rather than inferring suitability from a menu label.',
    journeyNote: 'Use 1600 Railway Avenue in Canmore for the complete meal journey and return.',
    scope: 'Operator name, address, phone, menu and venue-linked reservation/party arrangements. No guaranteed table, allergen safety, price or fixed opening schedule verified.',
    sources: [{ label: 'Crazyweed contact, reservations and party guidance', url: 'https://www.crazyweed.ca/contact' }, { label: 'Crazyweed current menu', url: 'https://www.crazyweed.ca/menu' }],
  },
  'the-drake-canmore': {
    status: 'selected-facts', checkedOn, name: 'The Drake Screaming Retriever Restaurant & Brewery', area: 'Canmore',
    description: 'The Drake’s current restaurant-and-brewery identity is at 909 Railway Avenue, with its own food menu, restaurant contact and dated event listings. A meal, late event and nearby inn stay are separate arrangements.',
    type: 'Restaurant & Brewery', cuisine: 'Pub menu', address: '909 Railway Avenue, Canmore, AB T1W 1P3', phone: '(403) 675-2206',
    website: 'https://www.drakecanmore.ca/', menuUrl: 'https://www.drakecanmore.ca/menus', reserveUrl: 'https://www.opentable.ca/r/the-drake-pub-canmore',
    highlights: ['Current restaurant-and-brewery identity', 'Railway Avenue address', 'Date-specific events'],
    serviceNote: 'The restaurant links reservations and welcomes walk-ins. Check the actual event, age rules and kitchen service separately; differing opening-hour wording on its pages is not repeated as a fixed timetable or a late-food promise.',
    journeyNote: 'Use the restaurant’s 403-675-2206 contact and 909 Railway Avenue address. The neighbouring inn’s contact and accommodation booking are different.',
    scope: 'Current operator identity, restaurant address/contact, menu, operator-linked reservations and event-discovery route. No fixed schedule, show admission or universal all-ages/late-food claim verified.',
    sources: [{ label: 'Drake current restaurant identity and events', url: 'https://www.drakecanmore.ca/' }, { label: 'Drake restaurant contact and reservation route', url: 'https://www.drakecanmore.ca/contact' }, { label: 'Drake current food and drinks menus', url: 'https://www.drakecanmore.ca/menus' }],
  },
  'storm-mountain-lodge': {
    status: 'selected-facts', checkedOn, name: 'Storm Mountain Lodge Dining Room', area: 'Highway 1A',
    description: 'A dinner dining room at the lodge on Highway 93 South above Castle Junction, with reservations required. It is a distinct road destination, separate from Banff town and the Bow Valley Parkway itself.',
    type: 'Lodge Dinner Restaurant', cuisine: 'Canadian', address: 'Highway 93 South, Banff National Park, AB', phone: '(403) 762-4155',
    website: 'https://stormmountainlodge.com/cuisine/', menuUrl: 'https://stormmountainlodge.com/cuisine/', reserveUrl: 'https://widgets.libroreserve.com/WEB/QC016588618315/book',
    highlights: ['Highway 93 South location', 'Dinner reservations required', 'Separate seasonal deli service'],
    serviceNote: 'The operator requires restaurant reservations and asks parties over four to contact the front desk. Cuisine and contact pages show conflicting seasonal weekdays: confirm the actual dinner, takeout or lounge service directly before travelling.',
    journeyNote: 'The regional directory group is Highway 1A / Castle Junction; the lodge’s actual approach is Highway 93 South. The publisher warns of a steep winter driveway. Arrange the road journey and complete return separately.',
    scope: 'Operator identity, Highway 93 South physical location, phone, dinner-only indoor service, reservation requirement and operator-linked booking route. No exact weekly schedule or live seating verified.',
    sources: [{ label: 'StormMountain cuisine and dinner reservations', url: 'https://stormmountainlodge.com/cuisine/' }, { label: 'StormMountain physical location and seasonal-operation guidance', url: 'https://stormmountainlodge.com/contact/' }],
    notes: ['The publisher’s Reserve online link is preserved exactly. Its external widget could not be fetched by the research tool; no booking availability was tested or inferred.'],
  },
};

export interface DiningDirectoryEntry {
  kind: 'restaurant' | 'drink'; slug: string; name: string; importedName: string; area: Area; areaVerified: boolean;
  description: string; type: string | null; cuisine: string | null; address: string | null; phone: string | null;
  website: string | null; menuUrl: string | null; reserveUrl: string | null;
  priceRange: null; hours: null; image: null; lat: null; lng: null;
  highlights: string[]; serviceNote: string; journeyNote: string; enquiryLinks: DiningSourceLink[]; notices: DiningDatedNotice[];
  sourceReview: { status: 'selected-facts' | 'pending' | 'unreviewed'; label: string; checkedOn: string | null; scope: string; sources: DiningSourceLink[]; notes: string[] };
  imageProvenance: { status: 'not-verified'; identityVerified: false; licenceReviewed: false; note: string };
  coordinateProvenance: { status: 'not-verified'; note: string };
}

function safePublisherUrl(value: unknown): string | null {
  if (typeof value !== 'string' || value !== value.trim()) return null;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? value : null; } catch { return null; }
}
const copyLinks = (links: DiningSourceLink[] = []): DiningSourceLink[] => links.flatMap(link => { const url = safePublisherUrl(link.url); return url ? [{ label: link.label, url }] : []; });

/** Additional same-contract reviews let the page combine a separate Banff batch without a circular import. */
export function projectDiningVenue(raw: Restaurant | DrinkSpot, kind: 'restaurant' | 'drink', additionalReviews: Record<string, DiningSourceReview> = {}): DiningDirectoryEntry {
  const review = Object.hasOwn(restaurantSourceReviews, raw.slug) ? restaurantSourceReviews[raw.slug] : Object.hasOwn(additionalReviews, raw.slug) ? additionalReviews[raw.slug] : undefined;
  const status = review?.status ?? 'unreviewed';
  return {
    kind, slug: raw.slug, name: review?.name ?? raw.name, importedName: raw.name, area: review?.area ?? raw.area,
    areaVerified: status === 'selected-facts',
    description: review?.description ?? 'Check this venue’s current location, menu and service before making it part of your day. Its details have not been checked in this directory review.',
    type: review?.type ?? null, cuisine: review?.cuisine ?? null, address: review?.address ?? null, phone: review?.phone ?? null,
    website: safePublisherUrl(review?.website), menuUrl: safePublisherUrl(review?.menuUrl), reserveUrl: safePublisherUrl(review?.reserveUrl),
    priceRange: null, hours: null, image: null, lat: null, lng: null,
    highlights: [...(review?.highlights ?? [])], serviceNote: review?.serviceNote ?? 'Check the current service, hours and seating with the venue.',
    journeyNote: review?.journeyNote ?? 'The area is a starting point for checking the venue, not a verified address or transport plan.',
    enquiryLinks: copyLinks(review?.enquiryLinks),
    notices: (review?.notices ?? []).flatMap(notice => { const url = safePublisherUrl(notice.url); return url ? [{ ...notice, url }] : []; }),
    sourceReview: {
      status, label: status === 'selected-facts' ? 'Details checked' : 'Check details', checkedOn: review?.checkedOn ?? null,
      scope: review?.scope ?? 'Name and area are retained for discovery only. Operational, contact, menu, reservation and location details have not been source-reviewed in this projection. Other reviewed guides may have their own separate scopes.',
      sources: copyLinks(review?.sources), notes: [...(review?.notes ?? [])],
    },
    imageProvenance: { status: 'not-verified', identityVerified: false, licenceReviewed: false, note: 'The imported photograph is withheld. Its venue identity and licence have not been verified; a hosting domain is not evidence of either.' },
    coordinateProvenance: { status: 'not-verified', note: 'Imported coordinates are withheld. A verified street address or a map link does not establish a surveyed venue point, entrance or accessible approach.' },
  };
}

export function buildDiningDirectory(additionalReviews: Record<string, DiningSourceReview> = {}) {
  const projectedRestaurants = restaurants.map(venue => projectDiningVenue(venue, 'restaurant', additionalReviews));
  const projectedDrinks = drinkSpots.map(venue => projectDiningVenue(venue, 'drink', additionalReviews));
  return { restaurants: projectedRestaurants, drinkSpots: projectedDrinks, venues: [...projectedRestaurants, ...projectedDrinks] };
}
const localDirectory = buildDiningDirectory();
export const directoryRestaurants = localDirectory.restaurants;
export const directoryDrinkSpots = localDirectory.drinkSpots;
export const directoryDiningVenues = localDirectory.venues;
export function getDirectoryRestaurantsByArea(area: Area, additionalReviews: Record<string, DiningSourceReview> = {}): DiningDirectoryEntry[] {
  return buildDiningDirectory(additionalReviews).restaurants.filter(venue => venue.area === area);
}
