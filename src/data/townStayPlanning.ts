export const townStayPlanningReviewedAt = '2026-10-29';
export const townStayUpdatedSlugs = ['banff', 'canmore', 'lake-louise', 'field-yoho', 'golden', 'kananaskis'] as const;

export const townBookingJourneys: Record<string, { label: string; href: string; text: string }> = {
  banff: { label: 'Compare six Banff hotel stays', href: '/book/banff-hotels/', text: 'Compare central rooms, kitchen categories, hillside bases and a Spray Avenue resort, then check dates on the named Expedia property pages.' },
  'lake-louise': { label: 'Compare five Lake Louise area stays', href: '/book/lake-louise-stays/', text: 'Compare village, lakeshore and road-base accommodation, with exact room decisions and named Expedia property links.' },
};

export const townResortJourneys: Record<string, { name: string; text: string; arrival: string; lessons: string }> = {
  golden: {
    name: 'Kicking Horse',
    text: 'Choose the town or mountain address first, then confirm the lesson meeting point, rental collection and the actual journey up and back. Kicking Horse has its own snow school and transport arrangements; the Banff three-resort planner does not cover it.',
    arrival: 'https://kickinghorseresort.com/discover-kickinghorse/getting-to-kicking-horse-mountain-resort/',
    lessons: 'https://kickinghorseresort.com/purchase/telus-winter-snow-school/',
  },
  kananaskis: {
    name: 'Nakiska',
    text: 'Match the exact Kananaskis base to Nakiska, the lesson meeting point and your rental collection. The operator publishes road and bus arrival information; confirm the date, stop and return directly. The Banff three-resort planner does not cover Nakiska.',
    arrival: 'https://skinakiska.com/discover-nakiska/getting-to-nakiska/',
    lessons: 'https://skinakiska.com/purchase/telus-winter-sports-school/',
  },
};

export const canmoreStayPriorities = [
  { value: 'all', label: 'Compare all six examples' },
  { value: 'town-walking', label: 'Town restaurants on foot' },
  { value: 'full-cooking', label: 'A full-kitchen category' },
  { value: 'regional-road', label: 'A separate hamlet / road base' },
] as const;
export const canmoreStaySeasons = [
  { value: 'winter', label: 'Winter / fall service' },
  { value: 'summer', label: 'Summer' },
  { value: 'unsure', label: 'Season not decided' },
] as const;
export const canmoreStayTransport = [
  { value: 'unsure', label: 'Transport not decided' },
  { value: 'no-car', label: 'Local transit / arranged rides' },
  { value: 'drive', label: 'Driving' },
] as const;
type Priority = typeof canmoreStayPriorities[number]['value'];
type Season = typeof canmoreStaySeasons[number]['value'];
type Transport = typeof canmoreStayTransport[number]['value'];
export interface CanmoreStayFilters { priority: Priority; season: Season; transport: Transport }

// These are room-category examples from already reviewed profiles, not hotel
// rankings or a live inventory. The page resolves names, source scopes and dates
// through the safe directory projection; this small model can also run offline.
export const canmoreStayExamples = [
  {
    slug: 'lamphouse-canmore', area: 'Downtown Canmore · 8 Street', priorities: ['town-walking', 'full-cooking'],
    fit: 'A town-centre room or a larger apartment',
    room: 'Ordinary King and Double Queen rooms differ from the multi-level three-bedroom Lamphouse Apartment. The Apartment has a full kitchen, laundry and two full plus one half bathrooms.',
    tradeoff: 'Choose the Apartment explicitly for cooking and space. It has stairs and does not accept pets; the dog-friendly King room is a different category.',
    journey: '610 8 Street is a downtown address. Check the actual activity pickup and accessible walking route; the Apartment kitchen does not belong to every hotel room.',
  },
  {
    slug: 'malcolm-hotel', area: 'Spring Creek · Canmore', priorities: ['town-walking'],
    fit: 'A hotel-and-restaurant stay near town',
    room: 'Premium Double Queen has two queens, balcony, walk-in rain shower and a wet bar with mini-fridge. It does not establish a full cooking kitchen and that category does not accept pets.',
    tradeoff: 'A Spring Creek base suits a hotel stay with restaurant meals. The operator currently flags nearby sister-property construction; ask about impacts for your dates.',
    journey: '321 Spring Creek Drive is separate from 8 Street, with a town walking connection. Confirm the route and any required access features rather than relying on a fixed walking time.',
  },
  {
    slug: 'basecamp-lodge-canmore', area: 'Bow Valley Trail · Canmore', priorities: ['full-cooking'],
    fit: 'A hotel room or a compact kitchen suite',
    room: 'The Micro Suite with Kitchen has a queen sleeping space and a full kitchen with oven, fridge, microwave and dishwasher. Standard hotel rooms are different bookings.',
    tradeoff: 'The Micro Suite is not pet friendly. Basecamp Lodge at 1002 Bow Valley Trail is distinct from the nearby Basecamp Resorts apartment property.',
    journey: 'Match this Bow Valley Trail address to the local stop, groceries and any regional pickup. The operator’s requested spa shuttle is not a ski-resort or airport transfer.',
  },
  {
    slug: 'blackstone-mountain-lodge', area: 'Kananaskis Way · Canmore', priorities: ['full-cooking'],
    fit: 'A suite kitchen instead of a hotel-room mini-fridge',
    room: 'Blackstone has both hotel-style rooms and condo-style suites. Full kitchens belong to suite categories; the reviewed two-bedroom suite also lists in-suite laundry.',
    tradeoff: 'Do not transfer a suite’s kitchen to a Deluxe hotel room. The official FAQ says the property has no hotel shuttle; check specific mobility features directly.',
    journey: '170 Kananaskis Way is in Canmore, not Kananaskis Village. Plan the town meal, groceries and regional connection from the exact address.',
  },
  {
    slug: 'stoneridge-mountain-resort', area: 'Lincoln Park · Canmore', priorities: ['full-cooking'],
    fit: 'A multi-bedroom suite and in-suite laundry',
    room: 'One-, two- and three-bedroom suite categories list kitchens and in-suite washer/dryers. Match the actual beds, bathrooms and balcony or patio to the offered suite.',
    tradeoff: 'A condo-style layout can support a longer cooking-led stay. The official airport-transfer information points to a Coast Hotel stop, so arrange the final connection.',
    journey: '30 Lincoln Park is a Canmore address. A named airport stop elsewhere is not a reserved Stoneridge pickup; confirm luggage, onward travel and the return.',
  },
  {
    slug: 'copperstone-resort', area: 'Dead Man’s Flats · separate hamlet', priorities: ['full-cooking', 'regional-road'],
    fit: 'A self-catering road base outside Canmore',
    room: 'The reviewed one- and two-bedroom suite categories list kitchens, living areas and in-suite laundry. Compare the exact sofa-bed and bathroom arrangement.',
    tradeoff: '250 2nd Avenue is in Dead Man’s Flats, a separate hamlet. Plan groceries and dinner journeys; this is not a downtown Canmore accommodation address.',
    journey: 'Arrange the complete property-to-activity journey and return. No property shuttle or Canmore local-bus stop is established by this room comparison.',
  },
] as const;

export const canmoreAreaNotes = [
  { name: 'Downtown and Spring Creek', text: 'Lamphouse’s 8 Street address and Malcolm’s Spring Creek address support different town stays. Compare the room with restaurant plans, the actual walking route and any activity pickup.' },
  { name: 'Bow Valley Trail', text: 'This is an accommodation corridor, not a promise of one walking distance or room type. Basecamp Lodge’s hotel rooms and Micro Suite show why the exact number and category matter.' },
  { name: 'Kananaskis Way and Lincoln Park', text: 'These Canmore addresses include suite properties such as Blackstone and Stoneridge. Kananaskis Way is not Kananaskis Village; confirm the local and regional legs from the selected property.' },
] as const;

export const nearbyHamletNotes = [
  { name: 'Dead Man’s Flats', text: 'A separate Municipal District of Bighorn hamlet in the Bow Valley. Copperstone’s sourced address is 250 2nd Avenue here. Compare it as a road base and confirm each transport leg, rather than treating the address as central Canmore.' },
  { name: 'Harvie Heights', text: 'Another separate Bighorn hamlet, near the eastern Banff park entrance. Banff Boundary Lodge’s 1000 Harvie Heights Road location is reviewed, but its current unit facilities and booking offer are not verified here. It is outside Banff town.' },
] as const;

export const townStayPlanningSources = [
  { label: 'Roam Route 12: current fall/winter coverage', href: 'https://roamtransit.com/schedules-routes/canmore-local-route-12/' },
  { label: 'Roam’s dated 2026 fall/winter service changes', href: 'https://roamtransit.com/2026-fall-and-winter-schedule-changes/' },
  { label: 'Published 2026 summer Route 12 timetable', href: 'https://roamtransit.com/wp-content/uploads/2026/04/2026-Route-12-Schedule-Summer.final_.pdf' },
  { label: 'Roam Canmore–Banff regional Route 3', href: 'https://roamtransit.com/schedules-routes/canmore-banff-regional-route-3/' },
  { label: 'Alberta Parks Nordic Centre: trail reports, lessons and facilities', href: 'https://www.albertaparks.ca/parks/kananaskis/canmore-nordic-centre-pp/' },
  { label: 'Kananaskis Conservation Pass: parking and separate facility fees', href: 'https://www.alberta.ca/kananaskis-conservation-pass' },
  { label: 'Bighorn’s separate Bow Valley hamlets', href: 'https://www.mdbighorn.ca/160/Hamlets-Open-Ranching' },
  { label: 'Copperstone’s actual Dead Man’s Flats address', href: 'https://www.copperstoneresort.com/contact-us' },
  { label: 'Malcolm’s Spring Creek/town setting', href: 'https://www.malcolmhotel.ca/' },
] as const;

export function normaliseCanmoreStayFilters(value: unknown = {}): CanmoreStayFilters {
  const input = value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
  return {
    priority: canmoreStayPriorities.some(option => option.value === input.priority) ? input.priority as Priority : 'all',
    season: canmoreStaySeasons.some(option => option.value === input.season) ? input.season as Season : 'winter',
    transport: canmoreStayTransport.some(option => option.value === input.transport) ? input.transport as Transport : 'unsure',
  };
}

export function buildCanmoreStayPlan(value: unknown = {}) {
  const filters = normaliseCanmoreStayFilters(value);
  const selectedIds = canmoreStayExamples.filter(example => filters.priority === 'all' || (example.priorities as readonly string[]).includes(filters.priority)).map(example => example.slug);
  const notes = ['The priority narrows room examples; season and transport change this journey checklist. These matches do not establish available rooms, access suitability or a price ranking.'];
  if (filters.priority === 'full-cooking') notes.push('Book the named kitchen category. An ordinary room at the same property can have only convenience appliances; arrange groceries and confirm the equipment you will use.');
  if (filters.priority === 'town-walking') notes.push('The downtown and Spring Creek examples favour town meals on foot. Check winter surfaces, the actual walking route and your activity pickup; they do not establish car-free access to every outing.');
  if (filters.priority === 'regional-road') notes.push('Dead Man’s Flats and Harvie Heights are separate hamlets, not central Canmore. The selected Copperstone example has reviewed room facts; Boundary’s separate record is location-only and is not promoted into these room matches.');
  if (filters.season === 'winter') notes.push('Winter Nordic leg · checked 29 October 2026: Roam’s fall/winter Route 12 serves downtown Canmore and Palliser Lane only. Its summer Nordic Centre/Grassi Lakes leg is not a winter connection. Arrange the Nordic Centre outbound and return separately before booking a lesson.');
  else if (filters.season === 'summer') notes.push('Summer Nordic/Grassi leg: the published 2026 Route 12 timetable included the Nordic Centre and Grassi Lakes. Check the operating season, actual date, downtown stop and last return; that timetable does not promise service for a later summer.');
  else notes.push('Route 12 changes with the season: published summer service included the Nordic Centre, while current fall/winter service is downtown–Palliser. Decide the travel date before relying on that connection.');
  if (filters.transport === 'no-car') notes.push('Match the actual property to a current local stop. Route 3 to Banff is separate from resort ski buses. For a hamlet stay, confirm a property-specific connection and return before reserving; no local pickup is assumed.');
  else if (filters.transport === 'drive') notes.push('Check hotel and municipal parking separately. For a Nordic Centre outing, check the Kananaskis vehicle-parking pass and the separate ski-trail/facility requirements; a Banff park pass does not replace them.');
  else notes.push('Choose how you will reach groceries, the Nordic Centre or the regional pickup and get home. A kitchenette, a town address or a hotel name does not supply that connection.');
  return { filters, selectedIds, notes };
}
