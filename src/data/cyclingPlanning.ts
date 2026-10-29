/** Activity-specific route profiles; no live access, crowd, surface or grooming feed. */
export const cyclingReviewedAt = '2026-10-29';
export const cyclingSources = {
  rules: 'https://parks.canada.ca/pn-np/ab/banff/activ/cyclisme-biking',
  mountain: 'https://parks.canada.ca/pn-np/ab/banff/activ/cyclisme-biking/velomontagne-mountainbiking/banff',
  legacy: 'https://parks.canada.ca/pn-np/ab/banff/activ/cyclisme-biking/cyclismeroute-roadcycling/heritage-legacy',
  ebikes: 'https://parks.canada.ca/pn-np/ab/banff/bulletins/8942f86e-3565-4b9a-a424-7c86d7c97701',
  winter: 'https://parks.canada.ca/pn-np/ab/banff/activ/cyclisme-biking/veloniege-fatbike',
  ski: 'https://parks.canada.ca/pn-np/ab/banff/activ/skidefond-xcski/banff',
  minnewanka: 'https://parks.canada.ca/pn-np/mtn/ours-bears/gestion-management/ours-bears/minnewanka',
  report: 'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking/etat-sentiers-trail-conditions',
  bulletins: 'https://parks.canada.ca/pn-np/ab/banff/bulletins',
  roam: 'https://roamtransit.com/about-us/transportation-policies/',
  town: 'https://banff.ca/1298/Share-the-Road',
  goat: 'https://www.albertaparks.ca/parks/kananaskis/spray-valley-pp/information-facilities/day-use/goat-creek/',
};
export type CyclingSeason = 'summer' | 'winter';
export type CyclingBike = 'pedal' | 'pedal-assist' | 'fat' | 'assisted-fat';
export type CyclingDirection = 'listed' | 'reverse' | 'return';
export const cyclingSeasonOptions = [
  { value: 'summer', label: 'Summer route / snow-free planning' },
  { value: 'winter', label: 'Winter fat-bike planning' },
] as const;
export const cyclingBikeOptions = [
  { value: 'pedal', label: 'Unassisted bicycle' },
  { value: 'pedal-assist', label: 'Compliant pedal-assist e-bike' },
  { value: 'fat', label: 'Unassisted fat bike' },
  { value: 'assisted-fat', label: 'Compliant pedal-assist fat bike' },
] as const;
export const cyclingDirectionOptions = [
  { value: 'listed', label: 'Listed direction / circuit' },
  { value: 'reverse', label: 'Reverse direction' },
  { value: 'return', label: 'Same-route out and back' },
] as const;
export interface CyclingProfile {
  distance: string;
  grade: 'Easy' | 'Moderate' | 'Difficult';
  surface: string;
  endpoint: string;
  basis: string;
}
export interface CyclingRoute {
  id: string;
  name: string;
  kind: 'one-way' | 'loop' | 'network';
  description: string;
  summer?: CyclingProfile;
  winter?: CyclingProfile;
  assist: 'listed-segment' | 'not-listed' | 'winter-map-check';
  direction: string;
  reverse: string;
  returnPlan: string;
  transport: string;
  constraints: string[];
  sources: { label: string; url: string }[];
  guide: string;
}
const mountain = { label: 'Parks Canada summer bike profiles', url: cyclingSources.mountain };
const winter = { label: 'Parks Canada winter fat-bike profiles', url: cyclingSources.winter };
const assist = { label: 'Current e-bike order and bicycle prohibitions', url: cyclingSources.ebikes };
export const cyclingRoutes: CyclingRoute[] = [
  {
    id: 'legacy-trail', name: 'Legacy Trail corridor', kind: 'one-way',
    description: 'Paved multi-use riding between the Bow Valley Parkway, Banff and Canmore. Choose the actual start rather than using the full corridor distance for a town-to-town section.',
    summer: { distance: '29 km one way including the town connection', grade: 'Easy', surface: 'Paved pathway, roadways and town crossings', endpoint: 'Bow Valley Parkway ↔ Travel Alberta Visitor Information Centre, Canmore', basis: 'Bike inventory: 29 km. The detailed Legacy page counts 26.8 km of segments excluding the separate 2.2 km town connection; these are different measurement bases.' },
    assist: 'listed-segment', direction: 'Towards Canmore from the Bow Valley Parkway end, through Banff. Starting in Banff omits the western corridor; identify the actual section on the official map.',
    reverse: 'Towards Banff and the Bow Valley Parkway from Canmore. Wind, weather and rider ability determine the effort; no easier-direction or headwind guarantee is supplied.',
    returnPlan: 'The full corridor is one way. Choose a shorter turnaround, plan both directions, or arrange transport for riders and their actual bikes. Downtown Canmore connections are additional to the Visitor Information Centre endpoint.',
    transport: 'Roam bike spaces are first-come, capacity/fit dependent and cannot be assumed with a passenger seat. Check the current regional stops and carry a return alternative.',
    constraints: ['Not cleared of snow and ice in winter; Parks warns of plow debris, gates, ice and deep snow from the first fall snow until spring maintenance resumes.', 'Use marked pedestrian gates when walking or accompanying pets; follow posted instructions around electrified wildlife mats.', 'Short steep hills and road crossings remain relevant despite the Easy grade.'],
    sources: [{ label: 'Legacy segments, access and winter warning', url: cyclingSources.legacy }, mountain, assist, { label: 'Roam bike transport policy', url: cyclingSources.roam }], guide: '/blog/banff-legacy-trail',
  },
  {
    id: 'sundance', name: 'Sundance Trail to the bike racks', kind: 'one-way',
    description: 'A paved summer approach from Cave and Basin to the canyon picnic/bike-rack area. The canyon loop beyond is hiking-only.',
    summer: { distance: '3.7 km one way; 7.4 km out and back', grade: 'Easy', surface: 'Paved approach', endpoint: 'Cave and Basin ↔ Sundance Canyon bike-rack/picnic area', basis: 'Summer bike profile; the hiking-only canyon loop is excluded.' },
    winter: { distance: '3.7 km one way', grade: 'Easy', surface: 'Designated winter trail; current snow/ice must be checked', endpoint: 'Cave and Basin ↔ Sundance Canyon bike racks', basis: 'Winter fat-bike profile: 75 m gain / 60 m loss. Bikes stop at the racks.' },
    assist: 'listed-segment', direction: 'From Cave and Basin west of the heritage building towards the bike racks. Bring a lock if adding the permitted canyon hike in its appropriate season.',
    reverse: 'The reverse begins at the bike racks; that endpoint is not an independent road pickup or a promise of transport.',
    returnPlan: 'Return on the approach unless a separately permitted connector has been planned. The unpaved Marsh Loop is not a pedal-assist exception, and e-bikes cannot use the full Healy Creek link to Sundance.',
    transport: 'Check seasonal Roam Route 4 and bike capacity before relying on a bus to Cave and Basin. Heritage-building admission and hours are separate from the trail.',
    constraints: ['All bikes stop before the canyon loop; a paved approach does not make the canyon cycling-permitted.', 'The e-bike exception covers Sundance, not the unpaved Marsh Loop or the prohibited Healy Creek segment.'],
    sources: [mountain, winter, assist], guide: '/biking#rules',
  },
  {
    id: 'tunnel-campground', name: 'Tunnel Campground summer loop', kind: 'loop',
    description: 'A packed-gravel campground circuit, distinct from the summit hike and from the winter fat-bike network.',
    summer: { distance: '6.4 km loop (bike profile)', grade: 'Easy', surface: 'Packed gravel with shared campground traffic', endpoint: 'Tunnel Mountain Campground trail connections', basis: 'The cycling inventory uses 6.4 km / 70 m gain; the separately reviewed hiking profile measures a different 6.3 km / 110 m basis. Do not mix activity profiles.' },
    assist: 'listed-segment', direction: 'Use the official campground loop and signed access points. It is not the Tunnel Mountain summit route.',
    reverse: 'Use current signs and the official loop map for direction; the same circuit remains distinct from the summit and technical trails.',
    returnPlan: 'This is already a loop. An approach from town or your accommodation is additional; no repeated-loop distance is calculated here.',
    transport: 'Roam Route 2 serves the campground area; confirm the actual stop, walking/riding connection and bike capacity.',
    constraints: ['All bicycles are prohibited on Tunnel Mountain Summit Trail, Hoodoos Interpretive Trail and the named corrals connectors in the current order.', 'This summer circuit is not a winter grooming or winter route description.'],
    sources: [mountain, assist], guide: '/blog/banff-mountain-biking',
  },
  {
    id: 'tunnel-winter', name: 'Tunnel Mountain winter fat-bike network', kind: 'network',
    description: 'The designated Trailer Court winter trails and separate fat-bike loop provide a winter choice without using the summit hiking trail.',
    winter: { distance: '3.4 km of trails + separate 2.5 km loop', grade: 'Easy', surface: 'Winter network; use only a firm surface that is not being rutted', endpoint: 'Tunnel Mountain Trailer Court Campground entrance', basis: 'Fat-bike inventory, not the 8 km cross-country ski network or the summer campground loop.' },
    assist: 'winter-map-check', direction: 'Choose a specific designated winter trail or the fat-bike loop on the current map. The network figures are not one compulsory circuit.',
    reverse: 'Follow the current winter signs for the selected trail. No network-wide one-way direction is inferred.',
    returnPlan: 'Choose a short circuit and return to the actual access point. Do not use the summit or a ski-only trail as a connector.',
    transport: 'The official winter profile identifies Roam Route 2. Verify current stops and whether the particular fat bike can be carried.',
    constraints: ['For pedal-assist fat bikes, confirm the exact winter segments inside the order’s maintained Tunnel Bench network; this planner does not extend a summer e-bike map automatically.', 'The summit, Hoodoos Interpretive Trail and named corrals connections prohibit all bicycles.'],
    sources: [winter, assist], guide: '/blog/banff-fat-biking',
  },
  {
    id: 'spray-east', name: 'Spray River East', kind: 'one-way',
    description: 'Rolling valley riding from the Golf Course Road side to the Spray River bridge, with distinct summer and winter profiles.',
    summer: { distance: '5.7 km one way (summer bike profile)', grade: 'Easy', surface: 'Rolling gravel doubletrack', endpoint: 'Spray River East trailhead ↔ upstream Spray River bridge', basis: 'Activity-specific cycling profile. The separate current hiking page gives different East/West measurements; do not transfer them silently.' },
    winter: { distance: '5.7 km one way', grade: 'Easy', surface: 'Designated winter fat-bike route; firm snow required', endpoint: 'Spray River East trailhead ↔ upstream Spray River bridge', basis: 'Winter fat-bike profile: 135 m gain / 80 m loss; this is East, not a winter East–West loop.' },
    assist: 'not-listed', direction: 'From the East trailhead kiosk on Golf Course Road towards the upstream bridge. Verify the signed approach from Bow Falls; the walk/ride from town is additional.',
    reverse: 'The reverse starts at the upstream bridge, not at an independent road-access trailhead. Resolve how you reach that point.',
    returnPlan: 'A same-bank return doubles the selected outward distance. A summer East–West connection exits at a different trailhead; winter bikes cannot return via West.',
    transport: 'Check the Bow Falls/Golf Course Road approach and seasonal road restrictions. No shuttle to the upstream bridge or guaranteed bike-bus connection is supplied.',
    constraints: ['Spray River East is absent from the current pedal-assist exception list; do not use a pedal-assist rental here on the strength of ordinary bicycle permission.', 'Spray River West prohibits bicycles in winter. A summer loop is not a winter fat-bike itinerary.'],
    sources: [mountain, winter, assist, { label: 'Spray River West winter prohibition', url: cyclingSources.ski }], guide: '/blog/spray-river-trail',
  },
  {
    id: 'spray-west', name: 'Spray River West — summer cycling', kind: 'one-way',
    description: 'Summer gravel riding from behind Fairmont Banff Springs to the upstream bridge. Winter West is a ski route with bikes prohibited.',
    summer: { distance: '5.6 km one way (summer bike profile)', grade: 'Easy', surface: 'Rolling gravel doubletrack', endpoint: 'Spray River West trailhead ↔ upstream Spray River bridge', basis: 'The summer bike inventory combines East and West as 11.3 km; connecting the two distinct trailheads is additional.' },
    assist: 'not-listed', direction: 'From the West trailhead behind Fairmont Banff Springs towards the upstream bridge. The approach from downtown Banff is additional.',
    reverse: 'The upstream bridge is not a separate road pickup. A reverse or connecting route must have its own approach and exit planned.',
    returnPlan: 'Return on the same bank in summer or map the East connection and the final link between the two trailheads. Do not use this profile for winter cycling.',
    transport: 'Check the Route 2 Banff Springs stop and trailhead approach if considering transit. Carrying a bike remains capacity and fit dependent.',
    constraints: ['Bikes are prohibited on Spray River West in winter.', 'West is not listed as a pedal-assist exception. Groomed ski lanes do not override either restriction.', 'The winter guide identifies avalanche paths on the Spray corridor; a valley location is not an absence-of-avalanche assessment.'],
    sources: [mountain, assist, { label: 'Winter West restriction and avalanche-path information', url: cyclingSources.ski }], guide: '/blog/spray-river-trail',
  },
  {
    id: 'goat-creek', name: 'Spray River / Goat Creek — summer', kind: 'one-way',
    description: 'A long point-to-point doubletrack journey between Banff and the Goat Creek trailhead above Canmore, crossing park jurisdictions.',
    summer: { distance: '18.7 km one way (summer bike profile)', grade: 'Moderate', surface: 'Rolling gravel/clay doubletrack; not recommended when wet', endpoint: 'Spray River West trailhead, Banff ↔ Goat Creek Day Use above Canmore', basis: 'Summer cycling profile. The 19 km winter ski profile is separate and does not authorize a bike exit on winter Spray River West.' },
    assist: 'not-listed', direction: 'Banff towards the Goat Creek trailhead above Canmore: the Parks description climbs towards the Canmore-side start. It does not finish in downtown Canmore.',
    reverse: 'Arrange a transfer to Goat Creek Day Use and ride towards Banff; Parks describes this as descending much of the way. It still has hills and is not a continuous downhill ride.',
    returnPlan: 'Arrange transport for people and bikes at the chosen endpoints before starting. A return via another trail or the Legacy corridor is a substantially different, longer journey.',
    transport: 'Goat Creek Day Use is in Spray Valley Provincial Park. Check Alberta Parks access and applicable parking/pass requirements; a Roam bus to central Canmore is not a transfer to that upper trailhead.',
    constraints: ['The Banff Spray/Goat corridor is not listed as a pedal-assist exception; Alberta-side permission does not override the national-park order.', 'This planner covers the summer route only. Winter requires a separate permitted exit because bikes are prohibited on Spray River West.', 'Clay-rich sections should not be ridden in wet conditions according to Parks.'],
    sources: [mountain, assist, { label: 'Alberta Parks Goat Creek Day Use access', url: cyclingSources.goat }, { label: 'Separate winter corridor and West restriction', url: cyclingSources.ski }], guide: '/blog/banff-mountain-biking',
  },
  {
    id: 'rundle-riverside', name: 'Rundle Riverside', kind: 'one-way',
    description: 'A difficult rough-and-rooty ride linking the Banff Golf Course Road area with the Canmore Nordic Centre trail system.',
    summer: { distance: '13.9 km one way', grade: 'Difficult', surface: 'Rough, rooty singletrack followed by doubletrack', endpoint: 'Golf Course Road kiosk ↔ Canmore Nordic Centre connections', basis: 'Cycling profile: 265 m gain / 296 m loss. Parks recommends full suspension and a repair kit; it is not a paved alternative to Legacy.' },
    assist: 'not-listed', direction: 'From the Golf Course Road kiosk towards the Canmore Nordic Centre trail system. Confirm the final connector to the actual exit.',
    reverse: 'From the Nordic Centre connections towards Banff. Reversing the ride does not remove the technical singletrack or remoteness.',
    returnPlan: 'Arrange pickup or a separately assessed return. Do not choose this as an easier substitute for the paved Legacy route simply because both link the towns.',
    transport: 'The Nordic Centre is not downtown Canmore. Confirm the actual meeting point and a vehicle/rack that can carry the bikes; no direct return shuttle is assumed.',
    constraints: ['Current Parks grade is Difficult, with extensive rough/rooty terrain and remote breakdown consequences.', 'Rundle Riverside is not listed as a pedal-assist exception in Banff.', 'No winter bike profile is reviewed here; a summer connection is not winter permission.'],
    sources: [mountain, assist], guide: '/blog/banff-mountain-biking',
  },
  {
    id: 'minnewanka', name: 'Lake Minnewanka shoreline', kind: 'one-way',
    description: 'Remote, exposed sidehill riding beyond Stewart Canyon; select a documented endpoint and read the annual cycling restriction.',
    summer: { distance: '29.4 km one way to the park-boundary corridor', grade: 'Moderate', surface: 'Challenging rolling singletrack with steep/exposed sections', endpoint: 'Minnewanka Day-use Area → Devil’s Gap boundary corridor', basis: 'Official summer inventory. Its shorter listed destinations include Aylmer junction (16 km return) and Warden’s Cabin (32 km return); these are not full-route totals.' },
    winter: { distance: '7.8 km one way to Aylmer Pass junction', grade: 'Moderate', surface: 'Designated winter singletrack; may be very icy and exposed', endpoint: 'Minnewanka Day-use Area ↔ Aylmer Pass junction', basis: 'Winter fat-bike profile: 45 m gain / 35 m loss. It does not authorize the full 29.4 km summer destination in winter.' },
    assist: 'not-listed', direction: 'From the Minnewanka day-use kiosk along the shoreline beyond Stewart Canyon. The gentle beginning does not describe the later steep, exposed terrain.',
    reverse: 'The farther endpoint is not a public road pickup. An outward approach or a separately permitted backcountry journey is required.',
    returnPlan: 'Choose the endpoint before setting off and leave time/energy for the complete return. No automatic through transfer or safe latest start is calculated.',
    transport: 'Seasonal Roam Route 6 and bike-rack capacity require date-specific checks; its last return is not guaranteed to fit a long shoreline ride.',
    constraints: ['Cycling is prohibited beyond Stewart Canyon Bridge July 10–September 15 annually. A hiking group of four does not make cycling legal in that window.', 'The official Moderate label accompanies explicit fitness, bike-handling, exposure and remoteness warnings.', 'Minnewanka shoreline is not listed as a pedal-assist exception.'],
    sources: [mountain, winter, assist, { label: 'Annual Minnewanka cycling prohibition and boundary', url: cyclingSources.minnewanka }], guide: '/blog/banff-mountain-biking',
  },
];

export interface CyclingPlanInput {
  routeId: string;
  season: CyclingSeason;
  bike: CyclingBike;
  direction: CyclingDirection;
  date?: string;
}
export interface CyclingAssessment {
  route?: CyclingRoute;
  profile?: CyclingProfile;
  errors: string[];
  restrictions: string[];
  notes: string[];
  direction: string;
  label: string;
  documented: boolean;
}
export function validCyclingDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
export function minnewankaCyclingRestricted(date: string): boolean {
  if (!validCyclingDate(date)) return false;
  const day = date.slice(5);
  return day >= '07-10' && day <= '09-15';
}
export function assessCyclingPlan(input: CyclingPlanInput): CyclingAssessment {
  const route = cyclingRoutes.find(item => item.id === input.routeId);
  const errors: string[] = [];
  if (!route) errors.push('Choose one of the reviewed routes.');
  if (!cyclingSeasonOptions.some(item => item.value === input.season)) errors.push('Choose a listed route season.');
  if (!cyclingBikeOptions.some(item => item.value === input.bike)) errors.push('Choose a listed bike type.');
  if (!cyclingDirectionOptions.some(item => item.value === input.direction)) errors.push('Choose a listed direction.');
  if (input.date && !validCyclingDate(input.date)) errors.push('Enter a real date in YYYY-MM-DD format, or leave it blank.');
  if (errors.length || !route) return { errors, restrictions: [], notes: [], direction: '', label: 'Check the selections', documented: false };
  const profile = route[input.season];
  const restrictions: string[] = [];
  const notes = [...route.constraints];
  if (!profile) restrictions.push(input.season === 'winter' && route.id === 'spray-west'
    ? 'Bikes are prohibited on Spray River West in winter.'
    : `No ${input.season === 'winter' ? 'winter cycling' : 'summer cycling'} profile is reviewed for this listing. Choose a route with evidence for that season.`);
  const assisted = input.bike === 'pedal-assist' || input.bike === 'assisted-fat';
  if (assisted && route.assist === 'not-listed') restrictions.push('This route is not a pedal-assist exception in the current Banff order. Ordinary bicycle permission does not authorize an e-bike here.');
  if (assisted && route.assist === 'winter-map-check') restrictions.push('The exact pedal-assist winter segments are not verified in this planner. Confirm the current order map with Parks Canada before selecting this network for an assisted fat bike.');
  if (route.id === 'minnewanka') {
    if (input.date && minnewankaCyclingRestricted(input.date)) restrictions.push('On this date, the annual July 10–September 15 prohibition covers cycling beyond Stewart Canyon Bridge, including this shoreline route.');
    else if (!input.date) notes.unshift('No date entered: check the July 10–September 15 annual cycling prohibition before selecting a shoreline outing.');
    else notes.unshift('The entered date falls outside the published annual cycling-prohibition window. Current closures and conditions still need checking.');
  }
  if (input.season === 'winter' && (input.bike === 'pedal' || input.bike === 'pedal-assist')) notes.unshift('The winter profile is for fat-bike planning. A regular bicycle is not assessed for the actual snow/ice; discuss equipment and the current surface with Parks Canada or the rental provider. This is not a new legal bike-type prohibition.');
  const direction = route.kind !== 'one-way'
    ? `${route.direction} This is a ${route.kind}; selecting reverse or out-and-back does not generate an invented total.`
    : input.direction === 'reverse' ? route.reverse
      : input.direction === 'return' ? `${route.direction} Plan the same route back as well: the one-way profile is not a complete return distance.` : route.direction;
  // A route constraint can also become a selected-plan restriction. Keep it once,
  // in the restriction list, while preserving differently worded/separate rules.
  const uniqueRestrictions = [...new Set(restrictions)];
  const restrictionReasons = new Set(uniqueRestrictions);
  const uniqueNotes = [...new Set(notes)].filter(note => !restrictionReasons.has(note));
  return { route, profile, errors, restrictions: uniqueRestrictions, notes: uniqueNotes, direction,
    documented: Boolean(profile) && uniqueRestrictions.length === 0,
    label: uniqueRestrictions.length ? 'Selection needs a different route or permission check' : 'Published route profile — check current access',
  };
}
