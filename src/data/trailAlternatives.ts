import { trails } from './trails';
import { isDirectoryTrail } from './trailPlanning';

export const trailPlanningReviewedAt = '2026-10-29';
export const trailInterests = {
  'forest-river': 'Forest and riverside',
  'lake-viewpoint': 'Lakes and viewpoints',
  'waterfall-canyon': 'Waterfalls and canyons',
  'mountain-hike': 'Mountain hiking',
  'cross-country-ski': 'Cross-country skiing',
} as const;

export interface TrailPlanningOption {
  slug: string;
  /** Description context only; never present access or suitability. */
  seasons: ('summer' | 'winter')[];
  interests: (keyof typeof trailInterests)[];
  demand: string;
  access: string;
  seasonNote: string;
  accessSource?: { label: string; url: string };
}

const roam = 'https://roamtransit.com/schedules-routes/';
const lakes = 'https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise';
const winterLouise = 'https://parks.canada.ca/pn-np/ab/banff/activ/raquette-snowshoeing/lakelouise';

/** Selected reviewed examples in planning order, not a crowd ranking. */
export const trailPlanningOptions: TrailPlanningOption[] = [
  {
    slug: 'fenland-trail', seasons: ['summer'], interests: ['forest-river'],
    demand: 'A 1.9 km loop through spruce forest. Roots and uneven natural surfaces matter even on a short route; this is not a summit outing.',
    access: 'Start at Fenland Trail parking area west of Mount Norquay Road. The walk from downtown is additional to the loop; check the official approach map.',
    seasonNote: 'Summer walking description. Check current flooding, wildlife and surface notices; no winter surface preparation is implied.',
  },
  {
    slug: 'marsh-loop', seasons: ['summer'], interests: ['forest-river'],
    demand: 'Parks Canada now describes Marsh Trail as 1.5 km one way. Its wetland path can be muddy and uneven; plan the actual return instead of assuming the old loop label.',
    access: 'Begin at Cave and Basin, separate from the downtown river bridge. Roam Route 4 is a summer connection; check its dates and the walk to the trail.',
    seasonNote: 'Cave and Basin indoor opening days are a separate check. Stay on designated paths and outside protected thermal water.',
    accessSource: { label: 'Roam routes and operating dates', url: roam },
  },
  {
    slug: 'bow-falls', seasons: ['summer'], interests: ['forest-river', 'waterfall-canyon'],
    demand: 'The Town describes 1.2 km one way from Bow River Bridge, including a climb above the falls. Reaching the lower viewing area by another approach is a different outing.',
    access: 'A Banff-town plan can start at the south end of Bow River Bridge. Use the Town map for pedestrian paths, stairs and the actual return.',
    seasonNote: 'The clifftop section is closed in winter. Do not treat the summer through-route as a winter walk or bypass barriers on river ice.',
  },
  {
    slug: 'lake-louise-lakeshore', seasons: ['summer'], interests: ['lake-viewpoint'],
    demand: 'A shoreline outing of 2.3 km one way, distinct from the climbing tea-house trails. It is not a full lake circuit, and continuing beyond it adds a mountain route.',
    access: 'Start at Lake Louise lakeshore, not the village or ski resort. Check Roam 8X or the seasonal Parks shuttle, its stop and your return booking.',
    seasonNote: 'Summer figures describe this route. For snow season compare the separate designated winter shoreline entry, without assuming a path across lake ice.',
    accessSource: { label: 'Official Lake Louise transport', url: lakes },
  },
  {
    slug: 'lake-agnes', seasons: ['summer'], interests: ['lake-viewpoint', 'mountain-hike'],
    demand: 'A sustained climb: 3.9 km one way with 495 m of ascent in the current Parks guide. Beehive side trips add their own distance and climbing.',
    access: 'The same lakeshore arrival as the shoreline walk, but a substantially longer outing. Fit equipment, food and the full return hike into the confirmed transport day.',
    seasonNote: 'The tea house is seasonal. Parks identifies avalanche exposure on this route, including Mirror Lake, from November to June; it is not an ordinary winter walk.',
    accessSource: { label: 'Official winter terrain warnings', url: winterLouise },
  },
  {
    slug: 'plain-of-six-glaciers', seasons: ['summer'], interests: ['lake-viewpoint', 'mountain-hike'],
    demand: 'A longer mountain outing beyond the lakeshore: 5.9 km one way, with 595 m of ascent and 250 m of descent. A Highline connection is additional route planning.',
    access: 'Begin at Lake Louise lakeshore and arrange a return suited to the entire hike. A booked bus seat does not make this interchangeable with a short lakeshore stop.',
    seasonNote: 'Seasonal tea-house service is not a guaranteed supply stop. The route has winter avalanche exposure; this description includes no glacier travel.',
    accessSource: { label: 'Official winter terrain warnings', url: winterLouise },
  },
  {
    slug: 'rockpile', seasons: ['summer'], interests: ['lake-viewpoint'],
    demand: 'A short viewpoint loop with steps and climbing, rather than a level shoreline route. Its 0.7 km loop does not include the journey to Moraine Lake.',
    access: 'Moraine Lake is a separate destination from Lake Louise. Personal vehicles cannot use its road; arrange the actual seasonal Parks shuttle or authorised commercial service.',
    seasonNote: 'Keep within the published transport season and allow for the return. The summer visit does not provide a winter sightseeing access plan.',
    accessSource: { label: 'Moraine Lake access and reservations', url: lakes },
  },
  {
    slug: 'johnston-canyon-lower-falls', seasons: ['summer'], interests: ['waterfall-canyon'],
    demand: 'An uneven paved canyon path and narrow catwalks: 1.1 km one way to the Lower Falls. A short distance does not make it step-free or remove passing constraints.',
    access: 'Use the Johnston Canyon day-use approach only when permitted. Check the current closure and Route 9 service separately; do not use an old timetable.',
    seasonNote: 'The October 2026 closure notice affects the main approach. Snow-season canyon access and footing need their own current assessment.',
    accessSource: { label: 'Route 9 construction/service notice', url: 'https://roamtransit.com/schedules-routes/johnston-canyon-regional-route-9/' },
  },
  {
    slug: 'johnston-canyon-upper-falls', seasons: ['summer'], interests: ['waterfall-canyon'],
    demand: 'The farther canyon endpoint, 2.4 km one way with more climbing than the Lower Falls. The viewpoint above the Upper Falls adds distance again.',
    access: 'Shares the main canyon approach and its restrictions. A closed lower approach cannot be avoided by simply choosing the Upper Falls card.',
    seasonNote: 'Check the actual approach and closure notice. Another trail towards the Upper Falls or Ink Pots is a separate outing, requiring its own assessment.',
    accessSource: { label: 'Parks Canada canyon closure notice', url: 'https://parks.canada.ca/pn-np/ab/banff/bulletins/06d4ef61-a3c9-4b65-8dfc-66d056252d6c' },
  },
  {
    slug: 'peyto-lake-viewpoint', seasons: ['summer'], interests: ['lake-viewpoint'],
    demand: 'The main lookout approach is 0.6 km one way uphill. The separate 0.3 km barrier-free approach from the upper lot has different access arrangements.',
    access: 'An Icefields Parkway stop north of Lake Louise. Confirm road conditions, the correct parking/approach and your own arranged transport; Roam 8X does not reach it.',
    seasonNote: 'This is the summer lookout description. Snow can change road and path access; use the official winter information for a snow-season visit.',
  },
  {
    slug: 'peyto-lake-shore', seasons: ['summer'], interests: ['lake-viewpoint', 'mountain-hike'],
    demand: 'A steep, rough official trail for experienced hikers: 1.3 km one way from the lookout, with 240 m of descent to regain on the return. Add the lookout approach.',
    access: 'Uses the Peyto parking/lookout area but is a different commitment from viewing the lake above. Use the official map; no shortcut or navigation line is supplied here.',
    seasonNote: 'A summer hiking comparison, not a winter descent recommendation. The lookout and the shore trail are not equivalent access choices.',
  },
  {
    slug: 'stanley-glacier', seasons: ['summer'], interests: ['mountain-hike'],
    demand: 'A mountain hike into an alpine basin: 4.9 km one way in the current Kootenay guide. It does not offer the same distance or terrain as a roadside lookout.',
    access: 'In Kootenay National Park, British Columbia, on Highway 93 South. Plan the road journey and check DriveBC as well as Parks notices; no direct public-transit connection is verified here.',
    seasonNote: 'Summer hiking description. A guided fossil programme is separately reserved; mountain snow and avalanche planning are separate from this summer grade.',
    accessSource: { label: 'DriveBC road information', url: 'https://www.drivebc.ca/' },
  },
  {
    slug: 'lake-louise-lakeshore-snowshoe', seasons: ['winter'], interests: ['lake-viewpoint'],
    demand: 'A designated winter shoreline walk of 2.3 km one way, with a turnaround chosen for the group and actual conditions. It does not require crossing the lake.',
    access: 'Choose the Lake Louise lakeshore stop and confirm Roam 8X for the date. The village, ski resort and seasonal Park and Ride are separate destinations.',
    seasonNote: 'Avoid posted avalanche areas and the falling-ice area near Louise Falls. A calendar date, rental or other visitors’ tracks does not establish suitable lake ice.',
    accessSource: { label: 'Roam fall/winter reservation rules', url: 'https://roamtransit.com/fares/reservations/winter-reservations/' },
  },
  {
    slug: 'marble-canyon-snowshoe', seasons: ['winter'], interests: ['waterfall-canyon'],
    demand: 'A canyon-rim path and bridges in Kootenay National Park. The current hiking guide gives 0.9 km one way; its summer duration is not a winter time allowance.',
    access: 'A separate Highway 93 South journey into British Columbia. Check Kootenay notices, DriveBC and the return plan instead of treating it as a nearby Johnston Canyon stop.',
    seasonNote: 'Snow and ice can change footing and bridge access. Stay on permitted paths, outside the canyon and creek bed; no maintained winter surface is promised.',
    accessSource: { label: 'DriveBC road information', url: 'https://www.drivebc.ca/' },
  },
  {
    slug: 'tunnel-mountain-winter', seasons: ['winter'], interests: ['cross-country-ski'],
    demand: 'A cross-country ski network, not the Tunnel Mountain summit hike. The 8 km figure covers all loops; choose an actual loop and check which activities are permitted.',
    access: 'The official starting point is Tunnel Mountain Trailer Court Campground entrance, with Roam Route 2 noted by Parks. Check the stop, ski equipment and walking approach.',
    seasonNote: 'Check current track setting and surface conditions. A campground network total does not establish a prepared circuit or a skating surface.',
    accessSource: { label: 'Roam route and stop information', url: roam },
  },
  {
    slug: 'spray-river-loop-xc-ski', seasons: ['winter'], interests: ['cross-country-ski', 'forest-river'],
    demand: 'Spray River West is 5.6 km one way to the bridge; returning on the same route is about 11.2 km. Do not assume an East/West loop is prepared.',
    access: 'Start beyond Fairmont Banff Springs at the Spray River West trailhead. Check Route 2 and its walking approach, then match the return to your chosen distance.',
    seasonNote: 'Parks identifies avalanche paths 4.5–5 km from the trailhead. Read that warning and current grooming information; track setting does not remove the exposure.',
    accessSource: { label: 'Official ski routes and avalanche warning', url: 'https://parks.canada.ca/pn-np/ab/banff/activ/skidefond-xcski/banff' },
  },
  {
    slug: 'cascade-valley-xc-ski', seasons: ['winter'], interests: ['cross-country-ski'],
    demand: 'The bridge turnaround is 6.3 km one way; Stoney Creek is 15.1 km one way. These are distinct commitments, with a full return still to ski.',
    access: 'Starts at Lake Minnewanka Day-use Area. Arrange the actual winter journey and return; the summer Route 6 map does not establish winter transport.',
    seasonNote: 'Grooming and permitted uses depend on current conditions. Choose the endpoint before leaving, rather than treating the longer route as a casual extension.',
    accessSource: { label: 'Official ski-route descriptions', url: 'https://parks.canada.ca/pn-np/ab/banff/activ/skidefond-xcski/banff' },
  },
];

const listedTrails = new Map(trails.filter(isDirectoryTrail).map(trail => [trail.slug, trail]));
export const trailPlanningRoutes = trailPlanningOptions.flatMap(option => {
  const trail = listedTrails.get(option.slug);
  return trail ? [{ ...option, trail, area: trail.area }] : [];
});

export interface TrailAlternative {
  id: string;
  title: string;
  comparison: string;
  slugs: string[];
}

/** Legacy export name retained; these are comparisons, never equivalent or quieter substitutes. */
export const trailAlternatives: TrailAlternative[] = [
  { id: 'banff-town', title: 'Banff town: forest, wetlands or river views', comparison: 'Fenland, Marsh Trail and Bow Falls start in different places and have different surfaces. Count the walk from your accommodation as well as the route itself. The river outing is not a substitute for a summit hike.', slugs: ['fenland-trail', 'marsh-loop', 'bow-falls'] },
  { id: 'lake-louise', title: 'Lake Louise and Moraine Lake: shoreline, climb or viewpoint', comparison: 'The Lake Louise tea-house trails add substantial climbing and time beyond a shoreline visit. Rockpile is at a different lake with its own seasonal transport. Compare the actual outing and journey before reserving.', slugs: ['lake-louise-lakeshore', 'lake-agnes', 'plain-of-six-glaciers', 'rockpile'] },
  { id: 'canyons', title: 'Canyon visits: endpoint, approach and park all matter', comparison: 'The Johnston endpoints share an approach and its closures. Marble Canyon is in Kootenay, and the entry below describes winter planning. It is a separate road journey with different surfaces, rather than an identical replacement.', slugs: ['johnston-canyon-lower-falls', 'johnston-canyon-upper-falls', 'marble-canyon-snowshoe'] },
  { id: 'mountain-choices', title: 'Lookout stop, steep shore trail or mountain basin', comparison: 'A short lookout approach and a sustained mountain hike demand different preparation. Peyto Lake’s shore trail descends steeply from its lookout; Stanley Glacier is a separate Highway 93 South outing in Kootenay. No scenery or effort equivalence is implied.', slugs: ['peyto-lake-viewpoint', 'peyto-lake-shore', 'stanley-glacier'] },
  { id: 'winter-activities', title: 'Winter: shoreline walking and cross-country skiing', comparison: 'These activities need different footwear, equipment and skills. The Tunnel Mountain network and longer ski corridors are not interchangeable with a short walk. Review route-specific hazards, grooming and transport before choosing.', slugs: ['lake-louise-lakeshore-snowshoe', 'tunnel-mountain-winter', 'spray-river-loop-xc-ski', 'cascade-valley-xc-ski'] },
];
