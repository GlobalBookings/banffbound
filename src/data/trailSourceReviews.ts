import type { Trail } from './trails';

// Route figures are the detailed Parks Canada summer profiles checked 2026-10-29.
// They describe an endpoint/direction, never current access, occupancy or winter fitness.
export const HIKING_SOURCE = 'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking';
const LAKE_ACCESS = 'https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise';
const MINNEWANKA_RESTRICTIONS = 'https://parks.canada.ca/pn-np/mtn/ours-bears/gestion-management/ours-bears/minnewanka';
const SUNSHINE = 'https://www.skibanff.com/sunshinemeadows';
const ASSINIBOINE = 'https://bcparks.ca/mount-assiniboine-park/hiking/';
const PARKWAY = 'https://parks.canada.ca/pn-np/ab/banff/visit/les10-top10/glaciers-icefields';
const summerOnly = 'This review covers the summer hiking route. Snow, ice and avalanche terrain require a separate winter route assessment; the summer grade and estimated time are not winter advice.';
const lakeAvalanche = 'Parks Canada identifies avalanche exposure on this summer route and does not recommend travel from mid-October to mid-June. This is not a winter hiking recommendation. Check the current avalanche bulletin, trail report and park restrictions.';
const lakeshoreTransport = 'Lake Louise lakeshore is separate from the village and ski resort. Check Roam Route 8X for the actual date and stops, or reserve the seasonal Parks Canada shuttle from the ski-resort Park and Ride. Verify the last return before committing to the hike.';
const moraineTransport = 'Moraine Lake Road is closed to personal vehicles year-round. Arrange authorized seasonal transport and its return before choosing the hike. Parks Canada shuttle check-in is at the ski-resort Park and Ride, not Lake Louise village or lakeshore. The published 2026 season ended October 12; check the operator for a future season.';
const paradiseTransport = 'Parks Canada lists limited first-come, first-served shuttle seats for the Paradise Valley trailhead. Check the current boarding, drop-off and return arrangements; a Moraine Lake reservation does not guarantee this intermediate stop. Do not assume personal-vehicle access on Moraine Lake Road.';
const parkwayAccess = 'This trailhead is on Highway 93 North, the Icefields Parkway, rather than in Lake Louise village. Plan the actual road journey, fuel, food and return. Check Parks Canada road information and 511 Alberta; no direct public-transit connection to this trailhead is verified here.';
const minnewankaAccess = 'The annual July 10–September 15 restriction covers the Minnewanka Trail beyond Stewart Canyon Bridge and both Aylmer trails: hiking parties of at least four must remain together and carry bear spray; dogs and cycling are prohibited in the restricted section. Read the current notice for the exact boundary and any additional closure before travelling.';

type ReviewDetails = {
  description: string;
  paragraphs: string[];
  highlights: string[];
  basis?: 'one-way' | 'loop' | 'network' | 'connector';
  transit?: string;
  access?: string;
  winter?: string;
  sources?: { label: string; url: string }[];
  name?: string;
  park?: Trail['park'];
};
function review(
  officialName: string, grade: 'easy' | 'moderate' | 'difficult',
  distance: string, gain: string, loss: string | undefined, time: string,
  trailhead: string, details: ReviewDetails,
): Partial<Trail> {
  return {
    ...(details.name ? { name: details.name } : {}),
    description: details.description,
    longDescription: details.paragraphs.join('\n\n'),
    difficulty: grade === 'difficult' ? 'challenging' : grade,
    distance, elevationGain: gain,
    elevationLoss: loss ?? 'Not stated in current detailed profile', time,
    season: 'summer', park: details.park ?? 'Banff National Park',
    province: details.park === 'Banff National Park / Mount Assiniboine Provincial Park' ? 'Alberta / British Columbia' : 'Alberta',
    reviewedAt: '2026-10-29', routeVerified: true, directoryEligible: true,
    sourceReview: {
      status: 'reviewed', officialName, officialGrade: grade,
      distanceBasis: details.basis ?? 'one-way',
      scope: `Summer hiking identity, endpoint/distance basis, published grade, elevation and time estimates, trailhead and stated access. ${details.basis === 'connector' ? 'Connector figures exclude the approach and exit hikes.' : details.basis === 'network' ? 'Network figures are not one compulsory loop.' : 'Figures apply to the stated route, not an extension or a nearby trail.'} No current conditions, parking availability or winter suitability are verified.`,
    },
    trailhead, highlights: details.highlights, parksCanadaUrl: HIKING_SOURCE,
    sourceUrls: [{ label: `Parks Canada: ${officialName} detailed summer profile`, url: HIKING_SOURCE }, ...(details.sources ?? [])],
    accessNote: details.access ?? 'Use the designated trailhead and current official route map. Check the trail report, road access and park bulletins before travelling; a published hiking profile does not confirm that the route or parking is available today.',
    winterNote: details.winter ?? summerOnly,
    transitAccessible: Boolean(details.transit && !/^(Check|If)/.test(details.transit)), transitRoute: details.transit,
    status: 'unknown',
  };
}

export const hikingSourceReviews: Record<string, Partial<Trail>> = {
  'fenland-trail': review('Fenland Loop', 'easy', '1.9 km loop', '20 m (loop profile)', undefined, 'About 40 min loop estimate', 'Fenland parking area, west of Mount Norquay Road', {
    basis: 'loop',
    description: 'A short natural-surface forest loop beside wetland on the edge of Banff townsite.',
    paragraphs: [
      'Fenland is a compact choice when the group wants a forest walk rather than a climb to a mountain viewpoint. The designated loop passes through spruce forest and wetland habitat. The profile is short, but soil and root patches mean the route should not be treated as a paved promenade or a guaranteed accessible surface.',
      'Plan the approach from town separately from the 1.9 km loop. Stay on the marked path around wetland areas and give any wildlife space rather than leaving the trail for a photograph. A brief outing can leave room for another town activity without promising a particular animal sighting or a quiet trail.',
    ], highlights: ['Forest loop', 'Wetland habitat', 'Town-edge trailhead'],
  }),
  'spray-river-east': review('Spray River East Trail', 'easy', '5.6 km one way to Spray River bridge', '145 m one way', '100 m one way', '3–4 hr estimated return', 'Spray River East trailhead on Golf Course Road', {
    description: 'The east-bank Spray River route to the upstream bridge, with a separate approach from Bow Falls.',
    paragraphs: [
      'Choose Spray River East for a valley outing with a clear bridge turnaround. Parks Canada measures 5.6 km from the east trailhead to the Spray River bridge; that is not the distance of a complete return outing. The route uses natural and gravel surfaces, with horse use and muddy sections relevant to footwear and passing other users.',
      'Decide before leaving whether to return on the same bank or use a documented East/West connection. The two trailheads are in different places, so joining the banks does not automatically return you to your starting point. If arriving by bus, include the walk from Bow Falls in the day plan rather than counting it inside the trail profile.',
    ], highlights: ['East bank of the Spray River', 'Bridge turnaround', 'Shared-use valley route'],
    transit: 'Parks Canada lists seasonal Roam Route 4 to Bow Falls, followed by an approximately 600 m walking approach to the east trailhead. Confirm operating dates, stop and return.',
  }),
  'spray-river-west': review('Spray River West Trail', 'easy', '5.7 km one way to Spray River bridge', '130 m one way', '125 m one way', '3–4 hr estimated return', 'End of Spray Avenue, beyond Fairmont Banff Springs', {
    description: 'A mostly gravel valley route from the Banff Springs end of town to the Spray River bridge.',
    paragraphs: [
      'The west-bank route gives a different starting point from Spray River East: begin beyond Fairmont Banff Springs and follow the designated valley trail towards the upstream bridge. Its 5.7 km figure is one way. A bridge visit and return is therefore a longer commitment than a short hotel-area walk.',
      'Check the official map if connecting to the east bank, because the return trailhead is not the same place. Keep the summer hiking plan separate from the groomed-ski description: a summer gravel route does not establish a prepared winter loop, and current wildlife restrictions can affect either plan.',
    ], highlights: ['Spray River valley', 'Gravel trail surface', 'Separate east- and west-bank starts'],
    transit: 'Parks Canada lists Roam Route 2 to Banff Springs Hotel and an approximately 500 m walking approach. Check the stop, walking route and last return for the travel date.',
  }),
  'tunnel-campground-loop': review('Tunnel Campground Loop', 'easy', '6.3 km loop', '110 m (loop profile)', undefined, 'About 1.5 hr loop estimate', 'Campground trail connections; no formal trailhead or designated trail parking', {
    basis: 'loop', description: 'A forest loop through the Tunnel Mountain campground area with several possible access points.',
    paragraphs: [
      'This is a longer forest loop rather than the Tunnel Mountain summit trail. Parks Canada describes a 6.3 km circuit linked to the campground area, with gravel, uneven patches and roots. Choose the appropriate signed connection from your accommodation or campsite and keep track of junctions so the return reaches the same access point.',
      'There is no formal trailhead with designated trail parking in the official profile. The Hidden Ridge Resort bus stop is a documented approach, but the walking connection still forms part of the outing. Campground opening dates and trail access are separate questions; do not enter a closed facility or assume every camping road is a public parking space.',
    ], highlights: ['Campground-area forest', 'Loop with multiple connections', 'Distinct from the summit hike'],
    transit: 'Parks Canada lists the Hidden Ridge Resort stop on Roam Route 2 as an approach. Check the current stop and signed connection to the loop.',
  }),
  'stewart-canyon': review('Lake Minnewanka Trail to Stewart Canyon', 'easy', '1.6 km one way to Stewart Canyon', '30 m one way', '10 m one way', 'About 1 hr estimated return', 'Lake Minnewanka Day-use Area', {
    name: 'Stewart Canyon (Lake Minnewanka)', description: 'A lakeside approach to Stewart Canyon that ends well before the long Aylmer routes.',
    paragraphs: [
      'For a shorter Minnewanka visit, select Stewart Canyon as the destination rather than following the shoreline indefinitely. The published endpoint is 1.6 km one way from the day-use area. The initial rough paved section gives way to a natural path with roots, rocks and some exposure, so the easy grade does not describe a continuous level promenade.',
      'The bridge area is also an important boundary when reading Minnewanka seasonal restrictions. Continuing beyond it towards Aylmer is a different, much longer outing with additional rules. Leave room for the walk back to the actual bus stop or parking area and use designated viewpoints rather than the water or canyon edge.',
    ], highlights: ['Minnewanka shoreline', 'Stewart Canyon endpoint', 'Shorter alternative to the Aylmer corridor'],
    transit: 'Parks Canada lists Roam Route 6 in its operating summer season. Confirm dates, the Minnewanka stop and the last return.',
    sources: [{ label: 'Minnewanka seasonal restriction boundary and rules', url: MINNEWANKA_RESTRICTIONS }],
  }),
  'johnson-lake': review('Johnson Lake Loop', 'easy', '2.9 km loop', '90 m (loop profile)', undefined, 'About 1 hr loop estimate', 'Johnson Lake Day-use Area, Johnson Lake Road', {
    basis: 'loop', description: 'A lake circuit with natural paths, roots, steps and narrow shoreline sections.',
    paragraphs: [
      'Johnson Lake is useful when the group wants a circuit rather than an out-and-back. The official loop is 2.9 km with 90 m of gain. The shoreline path includes roots, rocks, stepped bridges and a narrower northern section; choose footwear and the group pace for that surface rather than assuming a flat lakeside stroll.',
      'Keep the hiking circuit distinct from a swimming or paddling plan. Lake temperature, watercraft restrictions and the weather need their own checks, and neither the trail grade nor a sunny forecast establishes comfortable water. Arrive at the designated day-use area and follow the signed loop without cutting through shoreline vegetation.',
    ], highlights: ['Complete lake circuit', 'Forested shoreline', 'Natural-surface walking'],
    transit: 'Parks Canada lists seasonal Roam Route 6 to Johnson Lake. Check the travel date, stop and return service.',
  }),
  'sunshine-meadows': review('Sunshine Meadows trail network', 'easy', '10.3 km of trails (network, not one loop)', '580 m in detailed network profile', undefined, '4–5 hr network overview estimate', 'Sunshine Village upper mountain area, reached by the seasonal sightseeing gondola', {
    basis: 'network', park: 'Banff National Park / Mount Assiniboine Provincial Park',
    description: 'An alpine trail network reached through Sunshine’s seasonal sightseeing operation, with routes crossing the park boundary.',
    paragraphs: [
      'Choose a specific route from the operator’s trail map before buying transport. Standish, Rock Isle and the wider lake loops offer different walking commitments; the Parks Canada network figure is not a single mandatory circuit. The detailed profile gives 10.3 km of trails, while its overview table says 10.2 km, so use the individual route map for a measured day plan.',
      'The summer outing begins at the upper village, not at the bottom gondola parking lot. Gondola and chairlift operation, ticket coverage and the final descent constrain the day. Trails from the village extend into the boundary area of Mount Assiniboine Provincial Park in British Columbia, so follow the current designated network rather than assuming all paths stay in Banff National Park.',
      'As checked October 29, 2026, the operator says the 2026 summer season has finished and publishes a planned 2027 season. Confirm that future schedule and actual operation before travelling. Stay on established paths through the fragile meadow vegetation; a winter ski operation is not permission to use this summer hiking itinerary.',
    ], highlights: ['Choice of alpine routes', 'Seasonal gondola approach', 'Banff–Assiniboine boundary area'],
    transit: 'Check Sunshine’s date-specific summer shuttle and sightseeing gondola arrangements. A winter resort shuttle or lift ticket does not establish summer access or the last descent.',
    access: 'The 10.3 km and 580 m figures belong to the Parks Canada network profile. They do not measure a selected lift-assisted loop or the walk from the base parking area. Use the operator’s map and current operating notice.',
    sources: [{ label: 'Sunshine Meadows current operation and trail choices', url: SUNSHINE }, { label: 'BC Parks: Sunshine Meadows boundary-area day hikes', url: ASSINIBOINE }],
  }),
  'silverton-falls': review('Silverton Falls Trail', 'easy', '0.9 km one way', '85 m one way', '5 m one way', 'About 40 min estimated return', 'Rockbound Lake parking area, Bow Valley Parkway east of Castle Junction', {
    description: 'A short waterfall branch from the Rockbound Lake approach, ending on a narrow natural path.',
    paragraphs: [
      'Silverton Falls shares the first part of the Rockbound Lake approach, then branches off after roughly 300 m. Select the waterfall junction rather than following the much longer lake route. The official 0.9 km distance is one way, and the final hillside section is narrow with exposed roots, rocks and exposure.',
      'This can fit a shorter Castle Junction stop, but the small distance is not an accessibility claim or a reason to step beyond the marked viewpoint. Check Bow Valley Parkway access and the designated parking area before the journey. Rockbound Lake is a separate objective with a substantially greater climb and return commitment.',
    ], highlights: ['Waterfall destination', 'Short branch from Rockbound approach', 'Castle Junction area'],
  }),
  'boom-lake': review('Boom Lake Trail', 'easy', '5.1 km one way', '180 m one way', undefined, '3–4 hr estimated return', 'Boom Lake Day-use Area, Highway 93 South, Banff National Park', {
    description: 'A forest approach to Boom Lake on Highway 93 South within Banff National Park, Alberta.',
    paragraphs: [
      'Boom Lake is a lake destination rather than a roadside viewpoint. Allow for a 5.1 km outward walk and the full return through the forest. The official easy rating sits alongside rocks, boulders, streams and potentially muddy ground; it does not mean that the route is paved or that the distance suits every group.',
      'The trailhead is on Highway 93 South but remains in Banff National Park in Alberta. Do not confuse it with Stanley Glacier farther along the highway in Kootenay National Park, British Columbia. Pack what the group needs for the whole outing and treat lake arrival as the turnaround, without assuming a shoreline circuit or winter access.',
    ], highlights: ['Forest-to-lake outing', 'Banff side of Highway 93 South', 'Defined out-and-back endpoint'],
  }),
  'vista-lake': review('Arnica Lake Trail to Vista Lake', 'easy', '1.4 km one way to Vista Lake', 'Not stated in current detailed profile', '110 m one way', 'About 1.5 hr estimated return', 'Vista Lake viewpoint parking area, east side of Highway 93 South', {
    description: 'The short descending first section of the Arnica Lake route, with a climb back to the road.',
    paragraphs: [
      'Vista Lake is the first endpoint on the longer Arnica–Twin Lakes corridor. The outward path descends from the highway viewpoint to the lake, so the return is uphill. Parks Canada publishes 110 m of outward elevation loss but does not state outward gain; an omitted value should not be read as zero.',
      'Choose the lake as a deliberate turnaround if the group wants the shorter outing. Continuing to Arnica Lake changes both the climb and the time required, and Lower Twin Lake is farther again. Use the designated Vista Lake parking area; a full lot does not justify stopping on the highway shoulder.',
    ], highlights: ['Vista Lake endpoint', 'Downhill outward approach', 'Separate Arnica and Twin Lakes extensions'],
  }),
  'sundance-canyon': review('Sundance Canyon Trail', 'moderate', '3.7 km one-way approach + 2.1 km canyon loop', '190 m in route profile', undefined, 'About 3 hr estimated full return', 'Cave and Basin National Historic Site', {
    basis: 'loop', description: 'A paved approach followed by a steeper hiking-only canyon loop, with a longer return than the loop length suggests.',
    paragraphs: [
      'Plan Sundance Canyon in two parts. The paved approach runs 3.7 km one way from Cave and Basin to the bike-rack area; the canyon itself adds a 2.1 km hiking loop. Walking the approach out and back plus the loop totals approximately 9.5 km. Quoting just the canyon loop leaves most of the day out of the plan.',
      'The canyon section is natural, narrow and steep in places, with rock steps; it is not a continuation of the paved path’s surface. Bicycles stop at the designated rack, and the loop is for hiking. Cave and Basin’s indoor facilities have separate opening hours, so a trail visit does not promise access to the heritage building or its toilets.',
    ], highlights: ['Paved approach', 'Hiking-only canyon loop', 'Cave and Basin starting area'],
    transit: 'Parks Canada lists seasonal Roam Route 4 to Cave and Basin. Check the operating dates and return before adding the full canyon outing.',
    access: 'The detailed approach-plus-loop figures correspond to approximately 9.5 km for a complete walk from Cave and Basin. The official summer grade is Moderate; the canyon loop is not a paved accessible route.',
  }),
  'sulphur-mountain': review('Sulphur Mountain Trail', 'moderate', '4.8 km one way to gondola top; +0.5 km to Sanson Peak', '655 m one way to upper area', undefined, 'About 4 hr estimated return (main trail)', 'Upper Hot Springs parking area on Mountain Avenue', {
    description: 'A sustained uphill hiking route to the gondola’s upper area, with a separate boardwalk continuation.',
    paragraphs: [
      'The walking route climbs from the Upper Hot Springs parking area to the gondola’s upper station. It is a 4.8 km one-way hike with substantial climbing, roots and rock; the boardwalk to Sanson Peak adds another 0.5 km one way and includes steps. Choose whether that continuation fits the group rather than counting it inside the main trail distance.',
      'Plan the descent before starting. A gondola ride down depends on the operator’s current ticket policy, opening hours and operation; it is not assumed free or included with a hike. The west-side route is a different journey with a different endpoint, so it should not be improvised as a shortcut back to the Mountain Avenue start.',
    ], highlights: ['Uphill route to gondola upper area', 'Optional Sanson Peak boardwalk', 'Mountain Avenue start'],
    transit: 'Parks Canada lists Roam Route 1 to the Upper Hot Springs trailhead area. Check the stop and return service; transport to the base is separate from a gondola descent ticket.',
  }),
  'tunnel-mountain-summit': review('Tunnel Mountain Summit Trail', 'moderate', '2.3 km one way (published summit profile)', '275 m one way', undefined, 'About 2 hr estimated return', 'Designated Tunnel Mountain trail access from St. Julien Road or Tunnel Mountain Drive; use the official map for the chosen start', {
    description: 'A town-area summit hike with switchbacks, roots and rock, distinct from the campground loop.',
    paragraphs: [
      'Tunnel Mountain Summit is the climbing route, not the longer campground circuit. The official summit profile is 2.3 km one way with 275 m of gain. Natural steps, roots and rock make it a hiking outing even though the mountain is close to town and its return estimate is shorter than the major alpine routes.',
      'Match the map to the exact access point you intend to use. The lower St. Julien Road and upper Tunnel Mountain Drive approaches should not be assumed to have identical walking totals. If using Banff Centre parking, check that operator’s current parking conditions rather than treating it as free trail parking. Stay on the designated trail through switchbacks.',
    ], highlights: ['Town-area summit objective', 'Switchback ascent', 'Distinct access points'],
  }),
  'surprise-corner-to-hoodoos': review('Surprise Corner to Hoodoos Trail', 'moderate', '4.4 km one way', '115 m one way', '90 m one way', 'About 3 hr estimated return', 'Surprise Corner on Buffalo Street or Hoodoos Day-use Area on Tunnel Mountain Road', {
    description: 'A natural trail between two separate viewpoints, with ups and downs below the cliffs.',
    paragraphs: [
      'This route links Surprise Corner and the Hoodoos area rather than making a short paved viewpoint visit. The 4.4 km figure is one way and includes climbing and descent. Roots, steps and the terrain below the cliffs matter when deciding whether the full connection suits the group.',
      'For an out-and-back, leave time for the whole return. For a point-to-point outing, resolve the walk to the actual bus stop or a pre-arranged return at the other end before setting out. A nearby road or campground stop is not automatically a trailhead, and the two viewpoints do not share one parking area.',
    ], highlights: ['Surprise Corner endpoint', 'Hoodoos endpoint', 'Natural riverside/cliff-base terrain'],
    transit: 'Check Roam Route 2 stops around the Tunnel Mountain campground/Hoodoos end and the walking connection. No through-route or return transfer is included in the hiking distance.',
  }),
  'upper-stoney': review('Upper Stoney Trail', 'moderate', '4.4 km loop', '210 m (loop profile)', undefined, 'About 1.5 hr loop estimate', 'Norquay south parking area trail kiosk', {
    basis: 'loop', description: 'A narrow forest loop in the Norquay area with roots, rocks and an old ski-run connection.',
    paragraphs: [
      'Upper Stoney offers a circuit from the Norquay area without taking on Cascade Amphitheatre’s much longer return. The detailed Parks Canada profile gives a 4.4 km loop with 210 m of gain. This is twisting singletrack with roots, rocks and an old ski-run connection, rather than a smooth resort promenade.',
      'Start at the designated trail kiosk and use the map to keep the loop distinct from resort roads and other trails. If arriving on a resort shuttle, confirm that hikers can use it on that date and that the final departure leaves room for the complete walk. The route’s summer grade does not describe winter resort access.',
    ], highlights: ['Norquay-area circuit', 'Forest singletrack', 'Shorter commitment than Cascade Amphitheatre'],
    transit: 'Check Norquay’s current summer shuttle dates, rider eligibility, stops and last departure directly. A resort connection is conditional, not a year-round public-transit guarantee.',
  }),
  'cascade-amphitheatre': review('Cascade Amphitheatre Trail', 'moderate', '6.8 km one way', '740 m one way', '200 m one way', 'About 6 hr estimated return', 'Norquay day-lodge area; official approach towards the Mystic Express lift', {
    description: 'A forest approach to the Cascade Amphitheatre meadow, ending before Cascade Mountain’s scramble route.',
    paragraphs: [
      'The amphitheatre is a hiking destination in its own right. From the Norquay area, the designated approach uses the resort-side access and then forest trail to reach the meadow. The official 6.8 km one-way profile includes both gain and loss, so the return is more than a simple downhill walk.',
      'End the hiking plan at the maintained route’s amphitheatre destination. Cascade Mountain’s summit is a separate scramble and should not be treated as an automatic extension of this Moderate hike. A bus arrival requires particular attention to the last return: the six-hour profile is an estimate before the group’s stops and delays.',
    ], highlights: ['Cascade Amphitheatre meadow', 'Norquay approach', 'Hike distinct from summit scramble'],
    transit: 'Confirm Norquay’s current summer shuttle operation, hiker eligibility and last return. Resort transport does not establish access to every trail or a guaranteed return after this hike.',
  }),
  'c-level-cirque': review('C-Level Cirque Trail', 'moderate', '3.8 km one way', '440 m one way', undefined, 'About 3 hr estimated return', 'Upper Bankhead Day-use Area, Lake Minnewanka Road', {
    description: 'An uphill forest route past traces of Bankhead’s mining history to the cirque.',
    paragraphs: [
      'C-Level Cirque combines a sustained climb with the former Bankhead mining landscape. The route begins at Upper Bankhead and climbs on a rugged path with roots and rutted sections before reaching the cirque. Choose it for the uphill walk, not as a level history trail or a visit to the lower Bankhead interpretive area.',
      'Mining remains are features to observe from the designated route, not openings to enter or explore. Keep the cirque as the published hiking endpoint rather than adding an unreviewed scramble. Resolve the exact Upper Bankhead access and return before travelling; a bus serving the Minnewanka area does not by itself verify a stop at this trailhead.',
    ], highlights: ['Upper Bankhead start', 'Mining-history context', 'Cirque destination'],
  }),
  'healy-pass': review('Healy Pass Trail', 'moderate', '8.8 km one way', '650 m one way', undefined, '6–7 hr estimated return', 'Behind the main gondola building at Sunshine base parking area', {
    description: 'A long valley-to-pass hike beginning at Sunshine’s base area, separate from the lift-served Meadows network.',
    paragraphs: [
      'Healy Pass starts at the bottom Sunshine parking area behind the gondola building. It does not require arriving at the upper village, and its 8.8 km outward distance is not a walk measured from the gondola’s top. The route follows the creek valley through root and rock patches before reaching higher meadows and the pass.',
      'Build the day around the full return to the base. Alpine weather, snow and the group’s pace can change the commitment beyond the published six-to-seven-hour estimate. Wildflowers and autumn colour vary by season; choose the trail for the route itself rather than a promised display, and remain on the designated track through the meadows.',
    ], highlights: ['Sunshine base trailhead', 'Creek-valley approach', 'Healy Pass endpoint'],
    transit: 'If considering a Sunshine base shuttle, check the actual summer date, hiker eligibility and last departure. The upper-village gondola is a different access arrangement.',
  }),
  'bourgeau-lake': review('Bourgeau Lake Trail', 'moderate', '6.7 km one way to Bourgeau Lake', '730 m one way', undefined, 'About 6 hr estimated return', 'Bourgeau Lake parking area off the Trans-Canada Highway, west of Banff', {
    description: 'A steady forest climb to Bourgeau Lake, with Harvey Pass a separate longer endpoint.',
    paragraphs: [
      'Select the lake as the destination if planning the Bourgeau profile. The path climbs through forest, roots, rock and mountain-stream crossings to the lake basin. Parks Canada now gives 6.7 km one way and 730 m of gain for this endpoint; older figures should not be mixed with the current profile.',
      'Harvey Pass continues beyond the lake on rougher, rockier ground. Its 8.9 km figure is the total from the same trailhead, not an extra 8.9 km after reaching the lake. Decide which endpoint fits the group before leaving, and use only the designated highway-side parking area rather than a shoulder if it is full.',
    ], highlights: ['Bourgeau Lake basin', 'Sustained forest climb', 'Separate Harvey Pass decision'],
  }),
  'harvey-pass': review('Harvey Pass Trail', 'moderate', '8.9 km one way from Bourgeau trailhead', '1,010 m one way', undefined, '6–7 hr estimated return', 'Bourgeau Lake parking area off the Trans-Canada Highway, west of Banff', {
    description: 'The longer Bourgeau corridor hike continuing above the lake to Harvey Pass.',
    paragraphs: [
      'Harvey Pass uses the Bourgeau Lake approach and then climbs another 2.2 km beyond the lake on rough, rocky trail past smaller lakes. The published 8.9 km one-way distance and 1,010 m gain start at the highway trailhead. Do not add the full pass distance to the lake distance a second time.',
      'The higher section changes the outing from a forest-to-lake hike into a longer pass objective. Leave time and energy for the full descent and return, and turn around at an earlier destination if conditions or the group require it. A pass visit does not include an ascent of Mount Bourgeau or another summit.',
    ], highlights: ['Bourgeau approach included', 'Rocky upper section', 'Pass endpoint rather than summit'],
  }),
  'rockbound-lake': review('Rockbound Lake Trail', 'moderate', '8.5 km one way to Rockbound Lake', '765 m one way', undefined, '6–7 hr estimated return', 'Rockbound Lake parking area, Bow Valley Parkway just east of Castle Junction', {
    description: 'A long climb through forest and past Tower Lake to the Rockbound basin.',
    paragraphs: [
      'Rockbound Lake is a substantial out-and-back from Castle Junction, not the short waterfall walk that shares its beginning. The route climbs through forest with roots and rock, passes Tower Lake, and continues through a cliff-band section to Rockbound. The 8.5 km published distance is to Rockbound Lake one way.',
      'Tower Lake provides an earlier destination on the same corridor, while Silverton Falls is a separate short branch near the start. Choose the intended endpoint and a turnaround before leaving. Reaching Rockbound does not establish a maintained route to Castle Mountain’s summit; follow the designated hiking description and return on the planned route.',
    ], highlights: ['Tower Lake on the approach', 'Rockbound Lake basin', 'Castle Junction corridor'],
  }),
  'arnica-lake': review('Arnica Lake Trail to Arnica Lake', 'moderate', '4.6 km one way to Arnica Lake', '580 m one way', '110 m one way', 'About 5 hr estimated return', 'Vista Lake viewpoint parking area, east side of Highway 93 South', {
    description: 'A route that descends first to Vista Lake before climbing through forest and larches to Arnica Lake.',
    paragraphs: [
      'The Arnica Lake walk begins with a descent to Vista Lake, followed by the main climb. That first downhill section must be regained on the way back, so the return is not entirely downhill. Parks Canada’s endpoint profile is 4.6 km one way with 580 m gain and 110 m loss.',
      'Choose Arnica Lake as a complete destination rather than assuming the Twin Lakes are a short add-on. The official Lower Twin Lake profile is farther along this corridor, with additional ups and downs. Plan around the actual road-side trailhead and the full return to the viewpoint parking area; do not stop on the highway outside designated parking.',
    ], highlights: ['Vista Lake approach included', 'Arnica Lake destination', 'Uphill and downhill on the return'],
  }),
  'twin-lakes': review('Arnica Lake Trail to Lower Twin Lake', 'moderate', '7.4 km one way to Lower Twin Lake via Arnica', '700 m one way', '295 m one way', '6–7 hr estimated return', 'Vista Lake viewpoint parking area, east side of Highway 93 South', {
    name: 'Lower Twin Lake via Arnica', description: 'The full Arnica corridor to Lower Twin Lake, passing Vista, Arnica and Upper Twin along the way.',
    paragraphs: [
      'This retained Twin Lakes URL uses the exact Parks Canada endpoint: Lower Twin Lake via the Arnica Lake trail. The route first descends to Vista Lake, climbs to Arnica, crosses rolling ground towards Upper Twin and then descends to Lower Twin. Its 7.4 km one-way figure is measured from the Vista Lake viewpoint trailhead, not from Arnica or Upper Twin.',
      'The amount of descent on the outward journey matters because it becomes climbing on the return. An earlier lake is a different turnaround, not a reason to use the full-route statistics for a shorter visit. Allow for the whole corridor before committing beyond Arnica, and return on the planned route rather than assuming another trailhead has transport waiting.',
    ], highlights: ['Explicit Lower Twin endpoint', 'Vista and Arnica approach included', 'Upper Twin on the corridor'],
  }),
  'aylmer-lookout': review('Aylmer Lookout Trail', 'difficult', '11.6 km one way from Minnewanka day-use area', '770 m one way', '240 m one way', '7–8 hr estimated return', 'Lake Minnewanka Day-use Area', {
    description: 'A long Minnewanka shoreline approach followed by a climb to the former fire-lookout site.',
    paragraphs: [
      'The lookout outing begins with the long rolling Minnewanka shoreline approach before climbing away from the lake. It is 11.6 km one way from the day-use trailhead, not a short hike from a nearby road. Roots, rocks, narrow sections and the full return make this a different commitment from Stewart Canyon.',
      'At the upper junction, choose the lookout branch if this is the intended destination. Aylmer Pass is a separate endpoint with different figures. The annual Minnewanka group-access restriction can determine whether a party may proceed at all; organize the required group and carry bear spray rather than trying to join an assumed group at the trailhead.',
    ], highlights: ['Minnewanka shoreline approach', 'Former lookout endpoint', 'Seasonal group-access rules'],
    access: minnewankaAccess, transit: 'Roam Route 6 is seasonal. Check that its actual final return fits this long outing, including the walk back from the trail and delays; the route estimate is not a bus-connection guarantee.',
    sources: [{ label: 'Minnewanka annual group, dog and cycling restrictions', url: MINNEWANKA_RESTRICTIONS }],
  }),
  'aylmer-pass': review('Aylmer Pass Trail', 'difficult', '13.1 km one way from Minnewanka day-use area', '970 m one way', '190 m one way', '8–9 hr estimated return', 'Lake Minnewanka Day-use Area', {
    description: 'A long shoreline-and-mountain hike to Aylmer Pass, distinct from the lookout branch.',
    paragraphs: [
      'Aylmer Pass is the longer high-country destination on the Minnewanka–Aylmer corridor. The published 13.1 km one-way total includes the shoreline approach and the climb to the pass. Branch distances in the official description are not extra distances to add to that total a second time.',
      'Choose the pass branch deliberately rather than following the lookout signs and treating the destinations as interchangeable. An eight-to-nine-hour return estimate calls for a full day plus margin for the group and conditions. Annual group-access rules and current wildlife notices apply to the corridor, and a seasonal bus must be checked against the realistic return plan.',
    ], highlights: ['Aylmer Pass endpoint', 'Long shoreline approach included', 'Separate lookout branch'],
    access: minnewankaAccess, transit: 'Check Roam Route 6 operating dates and the final return against the complete outing. No bus connection after this long route is promised.',
    sources: [{ label: 'Minnewanka annual group, dog and cycling restrictions', url: MINNEWANKA_RESTRICTIONS }],
  }),
  'cory-pass-loop': review('Cory Pass Loop', 'difficult', '11.7 km loop (detailed Parks Canada profile)', '930 m (loop profile)', undefined, 'About 6 hr loop estimate', 'Fireside Day-use Area near the east entrance of the Bow Valley Parkway', {
    basis: 'loop', description: 'A steep, rocky pass circuit returning via Gargoyle Valley and Edith Pass, with route finding required.',
    paragraphs: [
      'This is a route for experienced hikers comfortable with steep, narrow, exposed and rocky terrain. The loop option goes over Cory Pass, descends into Gargoyle Valley and returns via Edith Pass; an out-and-back to the pass is a different route. Do not treat a nearby summit or scramble as part of the hiking loop.',
      'Parks Canada’s detailed profile gives an 11.7 km loop and 930 m gain, while the overview table on the same page lists a conflicting 13 km one-way figure. This guide uses the detailed loop profile and flags the mismatch so it is not mistaken for precise agreement between sources. Study the official map and junctions, and check Fireside access during the Bow Valley Parkway cycling restrictions.',
    ], highlights: ['Cory and Edith pass circuit', 'Gargoyle Valley connection', 'Route-finding requirement'],
    access: 'Use the detailed loop profile, not the conflicting overview-table figure. Fireside access can be affected by the Bow Valley Parkway cycling program; check the current official road notice and route map.',
  }),
  'fairview-lookout': review('Fairview Lookout Trail', 'easy', '1.2 km one way', '100 m one way', '65 m one way', 'About 45 min estimated return', 'Lake Louise lakeshore, boathouse-side trail access', {
    description: 'A short but steep lakeshore-side climb to a lookout, distinct from Fairview Mountain.',
    paragraphs: [
      'Fairview Lookout is the short objective on the boathouse side of Lake Louise. It is not Fairview Mountain: the lookout’s 1.2 km one-way profile has a much smaller commitment than the summit route, but still includes steep ground and both climbing and descent.',
      'Start at the lakeshore rather than in Lake Louise village. Include the transport arrival, walk to the trail and full return in the visit. A viewpoint is an opportunity to look across the lake when visibility permits, not a guaranteed photograph; use the designated path and leave room for others at the lookout.',
    ], highlights: ['Short lookout objective', 'Lake Louise lakeshore start', 'Distinct from Fairview summit'],
    transit: lakeshoreTransport, sources: [{ label: 'Lake Louise transport and seasonal shuttle information', url: LAKE_ACCESS }],
  }),
  'bow-river-lake-louise': review('Bow River Trail (Lake Louise)', 'easy', 'Up to 5.7 km one way; choose a section', '25 m in published profile', '30 m in published profile', 'About 2 hr published return estimate; varies with section', 'Bow River parking lot opposite the former Lake Louise train station on Sentinel Road', {
    description: 'A village-area riverside route with a choice of sections and a seasonal west-bank restriction.',
    paragraphs: [
      'This Bow River route is near Lake Louise village, not the lakeshore and not Banff’s Bow Falls trail. Parks Canada lists up to 5.7 km one way, so choose a specific section and turnaround instead of assuming that number describes a complete loop. A shorter section can fit a village-based day without taking on an alpine hike.',
      'Part of the west bank is closed from May 15 to October 15 for wildlife habitat. Follow the current map and signs rather than completing an old loop through the closed section. The official two-hour return estimate should be read alongside the chosen section, not used as a promise for every possible 5.7 km out-and-back.',
    ], highlights: ['Lake Louise village area', 'Section-by-section planning', 'Seasonal wildlife-habitat restriction'],
    transit: 'Check Roam Route 8X for a Lake Louise village stop and the walking approach to Sentinel Road. A lakeshore or ski-resort shuttle stop is a different destination.',
    access: 'The west-bank section has a May 15–October 15 seasonal closure. Select a permitted section from the current route map; no complete river loop or winter surface is assumed.',
    sources: [{ label: 'Lake Louise transport information', url: LAKE_ACCESS }],
  }),
  'moraine-lake-lakeshore': review('Moraine Lake Lakeshore Trail', 'easy', '1.3 km one way', 'Minimal (official profile; not a measured zero)', 'Minimal (official profile; not a measured zero)', 'About 45 min estimated return', 'Moraine Lake; trail begins beyond Moraine Lake Lodge', {
    description: 'A designated shoreline out-and-back reached by authorized seasonal transport, rather than a circuit of the whole lake.',
    paragraphs: [
      'The lakeshore trail offers a shorter walking plan after arriving at Moraine Lake. It begins beyond the lodge and follows the designated shoreline path for 1.3 km one way. This is not a route around the entire lake, and the end of the maintained walk is not permission to continue across boulders or shore vegetation.',
      'Make the arrival and return transport part of the plan before choosing additional hikes. Moraine Lake Road is closed to personal vehicles year-round, and the normal shuttle visit is seasonal. The easy summer profile does not make the lake a winter roadside stop or establish ice access.',
    ], highlights: ['Designated shoreline route', 'Shorter Moraine walking choice', 'Seasonal transport required'],
    transit: moraineTransport, sources: [{ label: 'Current Moraine Lake access and shuttle rules', url: LAKE_ACCESS }],
  }),
  'consolation-lakes': review('Consolation Lakes Trail (first lake)', 'easy', '2.9 km one way to first Consolation Lake', '135 m one way', '50 m one way', 'About 2 hr estimated return', 'Moraine Lake, signed Consolation Lakes trail access', {
    description: 'A hike from Moraine Lake to the first Consolation Lake; higher lakes and boulder extensions are outside this profile.',
    paragraphs: [
      'Use the first lake as the endpoint of this official profile. Although the route’s name is plural, the published 2.9 km one-way walk does not verify a maintained continuation to every lake in the basin. Reaching the first lake is a complete outing, with the same trail still to walk back to Moraine.',
      'Choose the hike around the authorized transport schedule and the group’s ability, not just its easy grade. Time spent at Moraine Lake, at junctions and on the return adds to the hiking estimate. Stay on the designated route without treating boulder fields or higher water as an automatic extension, and check any current wildlife restrictions before leaving the lakeshore.',
    ], highlights: ['First Consolation Lake endpoint', 'Moraine Lake approach', 'Defined out-and-back'],
    transit: moraineTransport, sources: [{ label: 'Moraine Lake transport and access', url: LAKE_ACCESS }],
  }),
  'tramline': review('Tramline Trail', 'moderate', '4.3 km one way (current summer profile)', '220 m in village-to-lakeshore direction', '30 m in village-to-lakeshore direction', 'About 2.5 hr estimated return', 'Bow River parking lot on Sentinel Road, or Lake Louise lakeshore', {
    description: 'A walking or cycling connection between the Lake Louise village area and lakeshore, using the current lower alignment.',
    paragraphs: [
      'Tramline is a transport-and-walking choice between the village area and the lake, rather than a trail beginning at the ski resort. The current summer profile gives 4.3 km one way. The 220 m gain and 30 m loss describe travel towards the lakeshore; reversing the direction reverses the main climb.',
      'The historic lower section closes from May 15 to October 15. Parks Canada directs walkers from the Bow River parking lot across the bridge and along the Bow River Trail to the new lower Tramline junction. Use the current map and signs instead of an older distance or alignment. For a one-way walk with a bus return, verify the actual stop and date-specific service before leaving.',
    ], highlights: ['Village-to-lakeshore connection', 'Former tramway corridor', 'Current lower alignment'],
    transit: 'Roam Route 8X can be part of a village/lakeshore journey; check the actual stops, date and capacity. Parks Canada’s ski-resort Park and Ride is a separate location.',
    access: 'Follow the current lower Tramline route during the May 15–October 15 closure of the old lower section. The summer alignment and figures are not a winter grooming or access report.',
    sources: [{ label: 'Lake Louise arrival options', url: LAKE_ACCESS }],
  }),
  'lake-annette': review('Lake Annette Trail (Paradise Valley)', 'moderate', '5.7 km one way', '345 m one way', '110 m one way', 'About 4 hr estimated return', 'Paradise Valley trailhead on Moraine Lake Road; authorized seasonal transit access', {
    name: 'Lake Annette (Paradise Valley)', description: 'A forest approach in Banff’s Paradise Valley to the lake beneath Mount Temple, not the Lake Annette in Jasper.',
    paragraphs: [
      'This Lake Annette is in Paradise Valley in Banff National Park. It is a different destination from the similarly named lake near Jasper. Choose it as a defined lake turnaround on the Paradise Valley corridor, with the official 5.7 km one-way profile measured from the Paradise Valley trailhead.',
      'Transport is a key distinction from starting at Moraine Lake itself: Parks Canada lists only limited first-come shuttle seats for Paradise Valley. Resolve that stop and the return before setting out. Giant Steps, the Sheol connector and Sentinel Pass are longer or different route choices, and their figures should not be folded into a Lake Annette day without replanning.',
    ], highlights: ['Banff Paradise Valley location', 'Mount Temple setting', 'Lake turnaround before longer objectives'],
    transit: paradiseTransport, winter: lakeAvalanche, sources: [{ label: 'Moraine corridor transport arrangements', url: LAKE_ACCESS }],
  }),
  'eiffel-lake': review('Eiffel Lake Trail', 'moderate', '5.7 km one way', '560 m one way', '125 m one way', '4–5 hr estimated return', 'Moraine Lake; trail access beyond Moraine Lake Lodge', {
    description: 'A high valley-side route branching from the Larch Valley approach towards views above Eiffel Lake.',
    paragraphs: [
      'Eiffel Lake shares the initial Larch Valley approach before taking a different branch along the valley side. The official description is a high route overlooking the lake, not a shoreline circuit or a paddling access trail. Use the correct junction and published 5.7 km one-way endpoint rather than assuming every path from Moraine leads to the same destination.',
      'The return goes back through the shared approach to the Moraine transport area. Wenkchemna Pass continues farther and is a separate longer objective; reaching the Eiffel area is not a commitment to that pass. Choose the turnaround around the group, weather and actual return transport, leaving room for time at the lake before boarding.',
    ], highlights: ['High valley-side route', 'Branch from Larch Valley approach', 'Eiffel Lake viewpoint setting'],
    transit: moraineTransport, winter: lakeAvalanche, sources: [{ label: 'Moraine Lake transport and access', url: LAKE_ACCESS }],
  }),
  'larch-valley-minnestimma-lakes': review('Larch Valley / Minnestimma Lakes Trail', 'moderate', '4.5 km one way', '570 m one way', '10 m one way', '3.5–4 hr estimated return', 'Moraine Lake; trail access beyond Moraine Lake Lodge', {
    description: 'A climb from Moraine Lake to the Larch Valley and Minnestimma Lakes area, without automatically continuing to Sentinel Pass.',
    paragraphs: [
      'Select the Larch Valley/Minnestimma Lakes endpoint for this Moderate hike. The 4.5 km one-way profile includes the climb from Moraine Lake. Sentinel Pass is farther and adds a steeper upper section; it has its own route profile and should be a deliberate decision rather than the default finish.',
      'Autumn larch colour varies with weather and season, and its appearance cannot be guaranteed for a booked travel date. The route remains a useful alpine outing outside a peak-colour photograph, provided current conditions and access suit the group. Keep to the designated paths through the meadow and plan the complete return to the seasonal transport stop.',
    ], highlights: ['Larch Valley', 'Minnestimma Lakes area', 'Separate Sentinel Pass continuation'],
    transit: moraineTransport, winter: lakeAvalanche, sources: [{ label: 'Moraine Lake access and seasonal transport', url: LAKE_ACCESS }],
  }),
  'saddleback-pass': review('Saddleback Pass Trail', 'difficult', '3.6 km one way', '600 m one way', '30 m one way', '3–4 hr estimated return', 'Lake Louise lakeshore, boathouse-side access', {
    description: 'A sustained climb from Lake Louise to Saddleback Pass, with a different endpoint from Fairview Mountain.',
    paragraphs: [
      'Saddleback is a pass hike starting on the boathouse side of Lake Louise. Its 3.6 km outward distance includes a substantial 600 m climb, and Parks Canada grades it Difficult. The shorter distance compared with some lake walks does not make the climb an easier substitute.',
      'The pass is a complete turnaround. Fairview Mountain and the Sheol/Paradise connector continue to different objectives with different terrain and return logistics. Decide the destination before leaving the lakeshore, bring the full day’s supplies, and leave time for the descent as well as the transport connection after reaching the bottom.',
    ], highlights: ['Saddleback Pass endpoint', 'Sustained lakeshore ascent', 'Separate summit and connector choices'],
    transit: lakeshoreTransport, winter: lakeAvalanche, sources: [{ label: 'Lake Louise arrival and transport', url: LAKE_ACCESS }],
  }),
  'fairview-mountain': review('Fairview Mountain Trail', 'difficult', '5 km one way', '990 m one way', '85 m one way', '5–6 hr estimated return', 'Lake Louise lakeshore, boathouse-side access via Saddleback', {
    description: 'A substantial summit hike above Lake Louise, distinct from the short Fairview Lookout trail.',
    paragraphs: [
      'Fairview Mountain is the summit objective, not the short lookout. The official profile is 5 km one way with 990 m of gain from the lakeshore approach. Plan for a large ascent and a full return, rather than borrowing the lookout’s short time estimate or easy rating.',
      'The route passes through the Saddleback approach before the upper mountain section. A summit view depends on visibility, and reaching a viewpoint is not a reason to continue when the group or conditions call for a turnaround. Keep the intended return route and the lakeshore transport schedule clear before leaving the base.',
    ], highlights: ['Fairview summit objective', 'Saddleback approach', 'Large elevation commitment'],
    transit: lakeshoreTransport, winter: lakeAvalanche, sources: [{ label: 'Lake Louise transport information', url: LAKE_ACCESS }],
  }),
  'sheol-paradise-connector': review('Sheol / Paradise Connector Trail', 'difficult', '3.9 km one way (connector only; approaches excluded)', '85 m from Saddleback towards Paradise', '540 m from Saddleback towards Paradise', '1–2 hr estimated one way on connector only', 'Saddleback Pass; approach from Lake Louise lakeshore or Paradise Valley is additional', {
    basis: 'connector', name: 'Sheol / Paradise Connector', description: 'A mountain connector between Saddleback Pass and Paradise Valley, not a complete 3.9 km trailhead-to-trailhead outing.',
    paragraphs: [
      'The published figures begin at Saddleback Pass and cover only the connector into Paradise Valley. They exclude the climb from Lake Louise lakeshore and the eventual walk out of Paradise Valley. The 85 m gain and 540 m loss apply in that direction; travelling the opposite way turns the main descent into climbing.',
      'Build a full route from the actual arrival point to the actual exit, using the separate official profiles for each approach. A point-to-point plan also needs a confirmed return arrangement, particularly because Paradise Valley has limited shuttle seats. If those pieces are unresolved, choose a complete out-and-back endpoint instead of treating this connector’s one-to-two-hour estimate as the whole day.',
    ], highlights: ['Saddleback–Paradise link', 'Direction-specific elevation', 'Approach and exit excluded'],
    transit: 'Start access may be through Lake Louise lakeshore or the limited Paradise Valley shuttle stop. Verify both ends and the return; no through transfer is included with the connector profile.',
    access: 'The 3.9 km and one-to-two-hour figures cover the connector only. Do not present them as a full hike from a road, village or bus stop. A complete route and transport plan are required.',
    winter: lakeAvalanche, sources: [{ label: 'Lake Louise and Moraine corridor transport', url: LAKE_ACCESS }],
  }),
  'paradise-valley-giant-steps': review('Paradise Valley and Giant Steps Trail', 'difficult', '9.8 km one way', '595 m one way', '255 m one way', '7–8 hr estimated return', 'Paradise Valley trailhead on Moraine Lake Road', {
    description: 'A long Paradise Valley outing to the Giant Steps area, with Lake Annette a separate earlier endpoint.',
    paragraphs: [
      'The Giant Steps itinerary continues beyond a shorter Lake Annette visit. Its 9.8 km one-way profile and significant ups and downs require planning the entire return to the Paradise Valley start. Choose the intended endpoint before boarding transport rather than using the lake hike’s shorter figures for the full valley.',
      'Limited access to the Paradise Valley shuttle stop is part of the day’s logistics. Include waiting, the walking return and the actual final pickup in the plan. The Sheol connector and Sentinel Pass lead to other routes; they are not interchangeable exits unless the whole mountain journey and transport have been worked out in advance.',
    ], highlights: ['Paradise Valley corridor', 'Giant Steps destination', 'Long return with elevation changes'],
    transit: paradiseTransport, winter: lakeAvalanche, sources: [{ label: 'Moraine corridor transport and access', url: LAKE_ACCESS }],
  }),
  'sentinel-pass-from-paradise-valley': review('Sentinel Pass from Paradise Valley Trail', 'difficult', '14.2 km one way (Parks Canada profile)', '1,160 m one way', '670 m one way', '9–10 hr published return estimate', 'Paradise Valley trailhead on Moraine Lake Road', {
    description: 'The long Paradise Valley approach to Sentinel Pass, with steep rocky route finding near the pass.',
    paragraphs: [
      'This is the Paradise Valley approach to Sentinel Pass, not the shorter route from Moraine Lake through Larch Valley. Parks Canada publishes a 14.2 km one-way profile with large gain and loss, and specifically calls for route finding on the steep rocky approach to the pass. Keep that endpoint and direction distinct when comparing routes.',
      'The published nine-to-ten-hour return estimate is demanding and should not be treated as a promise for every group or as a guaranteed shuttle connection. If planning to cross into Larch Valley and exit at Moraine, obtain a complete route and transport plan first; this profile does not verify that through-journey’s total or a seat at its other end.',
    ], highlights: ['Paradise-side pass approach', 'Steep rocky route finding', 'Distinct from the Moraine route'],
    transit: paradiseTransport, winter: lakeAvalanche,
    access: 'Use the official map with the unusually long published one-way and return-time profile; do not derive a faster pace or a safe start time from it. The Paradise and Larch approaches have different distances and transport needs.',
    sources: [{ label: 'Moraine corridor transport and limited stops', url: LAKE_ACCESS }],
  }),
  'sentinel-pass-via-larch-valley': review('Sentinel Pass via Larch Valley Trail', 'difficult', '5.6 km one way', '750 m one way', '50 m one way', '4.5–5.5 hr estimated return', 'Moraine Lake; Larch Valley trail access beyond the lodge', {
    description: 'The Moraine Lake approach through Larch Valley and up steep switchbacks to Sentinel Pass.',
    paragraphs: [
      'The Larch Valley route is the Moraine Lake side of Sentinel Pass. The official 5.6 km one-way distance is measured from the Moraine start and includes the Larch Valley approach, rather than beginning at Minnestimma Lakes. Steep switchbacks above the valley distinguish the pass outing from the Moderate valley hike.',
      'Return by the route that was planned unless a complete crossing into Paradise Valley has been separately assessed and its transport resolved. Reaching the pass does not verify a convenient exit on the far side. Keep time for the descent and the seasonal Moraine transport, and do not let a photograph determine the turnaround.',
    ], highlights: ['Moraine-side approach', 'Larch Valley included', 'Steep upper switchbacks'],
    transit: moraineTransport, winter: lakeAvalanche, sources: [{ label: 'Moraine Lake access and return transport', url: LAKE_ACCESS }],
  }),
  'wenkchemna-pass': review('Wenkchemna Pass Trail', 'difficult', '9.6 km one way', '1,015 m one way', '265 m one way', '7–8 hr estimated return', 'Moraine Lake; route via the Eiffel Lake branch', {
    description: 'A long pass objective beyond the Eiffel Lake area, with a full return to Moraine Lake.',
    paragraphs: [
      'Wenkchemna Pass is the longer objective reached by continuing along the Eiffel Lake corridor. The 9.6 km one-way total begins at Moraine Lake; it is not an extra distance measured from Eiffel Lake. Its elevation gain and loss make the complete outing substantially more demanding than turning around on the shorter lake-view route.',
      'Choose this pass only within a complete day plan that fits the group, current mountain conditions and the real transport return. Do not combine it casually with another long Moraine hike because they share a trailhead. The pass is the stated endpoint here; no onward backcountry connection or summit extension is included.',
    ], highlights: ['Longer Eiffel corridor objective', 'Wenkchemna Pass endpoint', 'Moraine start and return'],
    transit: moraineTransport, winter: lakeAvalanche, sources: [{ label: 'Moraine Lake transport and access', url: LAKE_ACCESS }],
  }),
  'hidden-lake': review('Hidden Lake Trail', 'difficult', '8.5 km one way', '700 m one way', '80 m one way', '6–7 hr estimated return', 'Fish Creek parking area off Whitehorn Road, Lake Louise area', {
    description: 'A long Fish Creek approach into the Boulder Pass area and on to Hidden Lake.',
    paragraphs: [
      'Hidden Lake begins at Fish Creek parking off Whitehorn Road, not at Lake Louise lakeshore. The official approach includes roughly four kilometres on a wide access road before the alpine trail system. The complete 8.5 km one-way profile should be used from that parking area rather than assuming a lift or a shuttle removes the approach.',
      'Study the Boulder Pass-area junctions and select Hidden Lake as the destination. Deception Pass and the wider Skoki backcountry lead to different, longer plans. Carry the full outing’s supplies and arrange the return to Fish Creek; a bus or sightseeing ticket for the nearby ski resort does not establish transport to this trail’s upper sections.',
    ], highlights: ['Fish Creek start', 'Access-road approach included', 'Hidden Lake endpoint'],
    winter: lakeAvalanche,
    access: 'Fish Creek is off Whitehorn Road near the ski resort, but this hiking profile starts at the parking area. No lift access, road shuttle or ordinary lakeshore-bus connection to the upper trail is verified here.',
  }),
  'deception-pass': review('Deception Pass Trail', 'difficult', '11.5 km one way', '835 m one way', '140 m one way', '8–9 hr estimated return', 'Fish Creek parking area off Whitehorn Road, Lake Louise area', {
    description: 'A long day hike from Fish Creek via Boulder Pass and Ptarmigan Lake towards Deception Pass.',
    paragraphs: [
      'Deception Pass shares the first access-road approach from Fish Creek, then continues through the Boulder Pass and Ptarmigan Lake area. The official 11.5 km one-way figure includes the start from the parking area. It does not begin at an upper lift station or at Boulder Pass.',
      'This is a long out-and-back rather than a complete Skoki circuit. Baker Lake is a separate side trip with extra descent and return climbing; do not include it automatically in the published pass figures. The official overview excepts Deception from one grouped avalanche warning, but that exception is not an assessment of winter safety. This review remains a summer hiking description.',
    ], highlights: ['Boulder Pass approach', 'Ptarmigan Lake corridor', 'Long Deception Pass return'],
    access: 'Use the Fish Creek parking-area start and current official map. No lift-assisted start or transport to the upper trail is assumed; backcountry overnight travel requires its own planning and permits.',
  }),
  'castle-lookout': review('Castle Lookout Trail', 'moderate', '3.7 km one way', '520 m one way', '50 m one way', '3–4 hr estimated return', 'Castle Lookout trailhead on Bow Valley Parkway, 5 km west of Castle Junction', {
    description: 'A sustained climb to the former Castle fire-lookout location, not Castle Mountain’s summit.',
    paragraphs: [
      'Castle Lookout climbs from the Bow Valley Parkway to a former fire-lookout site. The tower is gone, and the destination is the lookout area rather than a building to visit. The official 3.7 km one-way profile has 520 m of gain, so allow for the climbing and full descent rather than treating it as a roadside viewpoint.',
      'Keep the lookout separate from Castle Mountain summit or climbing routes. Choose the marked trailhead west of Castle Junction, check the current Parkway approach, and plan food, water and layers for the full outing. Views across the valley depend on weather and visibility; remain on the established route even if a photograph is obstructed.',
    ], highlights: ['Former fire-lookout site', 'Bow Valley setting', 'Distinct from Castle summit routes'], winter: lakeAvalanche,
  }),
  'taylor-lake': review('Taylor Lake Trail', 'moderate', '6.3 km one way (official area table basis)', '585 m one way', '0 m (explicitly published outward loss)', '4–5 hr estimated return', 'Taylor Creek Day-use Area, south side of the Trans-Canada Highway west of Castle Junction', {
    description: 'A forest climb to Taylor Lake’s subalpine basin, with snow sometimes lingering into the hiking season.',
    paragraphs: [
      'Taylor Lake is a Moderate route in the current Parks Canada guide, rather than a summit scramble. Its 6.3 km one-way profile climbs steadily from the highway-side day-use area to the lake. The published outward loss is explicitly zero; this does not remove the descent on the return or imply a flat route.',
      'Parks Canada notes that snow can linger here early in the hiking season. Choose the route using the current report rather than a fixed calendar promise. The lake is the endpoint for these figures; the O’Brien Lake side trip and higher terrain are separate choices that add to the outing and need their own map and turnaround.',
    ], highlights: ['Taylor Lake destination', 'Forest-to-subalpine climb', 'Moderate official summer grade'], winter: lakeAvalanche,
  }),
  'bow-summit-viewpoint': review('Bow Summit Viewpoint Trail', 'easy', '3 km one way', '310 m one way', '95 m one way', 'About 2.5 hr estimated return', 'Peyto Lake parking lot, Highway 93 North', {
    description: 'A longer route beyond the main Peyto Lake lookout, following an old fire road towards the Bow Summit viewpoint.',
    paragraphs: [
      'Bow Summit Viewpoint is not the short Peyto viewing-platform walk. The official route continues beyond that lookout onto an old fire road, with a 3 km one-way profile and 310 m of gain. Choose it when the group wants a longer walk, rather than assuming the platform’s short distance applies to this destination.',
      'Both listings use the Peyto parking area, so identify the intended junction and turnaround from the official map. Add the complete walk to the Parkway driving day and leave margin for the return; arriving at a highway viewpoint does not establish a cleared winter route or a prepared higher trail.',
    ], highlights: ['Beyond the main Peyto lookout', 'Old fire-road section', 'Longer Bow Summit objective'], access: parkwayAccess,
    sources: [{ label: 'Parks Canada Icefields Parkway journey information', url: PARKWAY }],
  }),
  'mistaya-canyon': review('Mistaya Canyon Trail', 'easy', '0.6 km one way (detailed profile)', '10 m one way', '30 m one way', 'About 30 min estimated return', 'Mistaya Canyon parking lot, Highway 93 North', {
    description: 'A short descent from the Parkway parking area to the canyon footbridge, with an uphill return.',
    paragraphs: [
      'The Mistaya stop includes a walk down from the highway parking area to the footbridge. The detailed Parks Canada profile gives 0.6 km one way, while the overview table says 0.5 km; this guide uses the detailed figure. The outward descent must be climbed on the return, so it is not simply a level roadside viewpoint.',
      'Use the bridge and designated trail for the canyon view. Parks Canada specifically warns against walking onto the rocks at the canyon edge; a photograph is not a reason to leave the route. Fit the complete return into the driving plan rather than counting only the time spent at the bridge.',
    ], highlights: ['Canyon footbridge', 'Short descending approach', 'Designated viewing route'], access: parkwayAccess,
    sources: [{ label: 'Icefields Parkway access and journey planning', url: PARKWAY }],
  }),
  'helen-lake': review('Helen Lake Trail', 'moderate', '5.9 km one way', '530 m one way', '90 m one way', '4–5 hr estimated return', 'Helen Lake parking area on Highway 93 North, opposite Crowfoot Glacier viewpoint', {
    description: 'A climb into the alpine to Helen Lake, with Dolomite Pass a separate longer destination.',
    paragraphs: [
      'Choose Helen Lake as the endpoint of the 5.9 km one-way profile. Its gain and loss describe the outward route, with a full return still required. The trailhead is across the Parkway from Crowfoot Glacier viewpoint, not at Bow Lake’s lodge access or the Peyto parking lot.',
      'Dolomite Pass extends the same corridor but has a different distance, grade and elevation profile. Cirque Peak is also not part of the reviewed lake hike. Plan the lake visit first and make any higher objective a separate decision using the appropriate official route, current snow conditions and the group’s abilities.',
    ], highlights: ['Helen Lake endpoint', 'Alpine setting', 'Separate Dolomite Pass decision'], access: parkwayAccess,
    sources: [{ label: 'Parks Canada Parkway travel information', url: PARKWAY }],
  }),
  'cirque-lake': review('Cirque Lake Trail', 'moderate', '4.6 km one way', '210 m one way', '100 m one way', 'About 3 hr estimated return', 'Hiker parking by Waterfowl Campground, Highway 93 North', {
    description: 'A forested Waterfowl-area route to Cirque Lake, with muddy ground noted in the official profile.',
    paragraphs: [
      'Cirque Lake begins from the Waterfowl hiker parking area, sharing the broader access area with the separate Chephren Lake route. The 4.6 km one-way figure is for Cirque Lake, not a combined two-lake circuit. Read the junction signs and choose the intended branch before continuing.',
      'Parks Canada notes that the route is often muddy. Waterproof footwear may help with wet ground, but stay on the designated trail instead of widening it around wet sections. The forest approach and lake destination make this a different choice from an exposed pass hike, without establishing current surface conditions or a shorter total day.',
    ], highlights: ['Waterfowl trail system', 'Forested lake approach', 'Distinct Cirque Lake branch'], access: parkwayAccess,
    sources: [{ label: 'Icefields Parkway journey information', url: PARKWAY }],
  }),
  'chephren-lake': review('Chephren Lake Trail', 'moderate', '4.1 km one way', '140 m one way', '75 m one way', 'About 3 hr estimated return', 'Hiker parking by Waterfowl Campground, Highway 93 North', {
    description: 'A forest route from the Waterfowl area to Chephren Lake beneath the surrounding mountain walls.',
    paragraphs: [
      'Chephren Lake is the 4.1 km one-way choice from the Waterfowl hiker parking area. Cirque Lake is another branch in the same trail system, not an extra lake already included in this route’s figures. A two-lake day needs its own complete distance and turnaround plan.',
      'The official description notes muddy conditions as a recurring feature, so do not choose this route on the assumption that a smaller elevation gain means dry or smooth walking. Keep to the designated trail and protect the wet forest ground. Check campground-area access and the actual hiking report independently of any campsite opening date.',
    ], highlights: ['Chephren Lake destination', 'Waterfowl-area forest', 'Separate from the Cirque Lake branch'], access: parkwayAccess,
    sources: [{ label: 'Icefields Parkway access and services', url: PARKWAY }],
  }),
  'nigel-pass': review('Nigel Pass Trail', 'moderate', '7.3 km one way', '395 m one way', '60 m one way', '4–5 hr estimated return (detailed profile)', 'Nigel Pass parking lot, Highway 93 North south of the Icefield Centre', {
    description: 'A long approach towards Nigel Pass in the boundary area between Banff and Jasper national parks.',
    paragraphs: [
      'Nigel Pass is a hiking destination near the Banff–Jasper boundary, not a short walk from the Icefield Centre. Parks Canada’s detailed profile gives 7.3 km one way and a four-to-five-hour return estimate; the overview table rounds that estimate to five hours. Plan the real journey from the signed Parkway parking area.',
      'Use the pass as the stated endpoint rather than continuing into another backcountry itinerary without a map, supplies and return plan. The relatively moderate elevation figure does not remove the long walking distance or the need to check snow, weather and park-specific notices around the boundary.',
    ], highlights: ['Nigel Pass endpoint', 'Banff–Jasper boundary area', 'Long out-and-back distance'], access: parkwayAccess,
    sources: [{ label: 'Icefields Parkway road journey', url: PARKWAY }],
  }),
  'parker-ridge': review('Parker Ridge Trail', 'moderate', '2.7 km one way', '305 m one way', '45 m one way', 'About 2.5 hr estimated return', 'Parker Ridge parking lot, Highway 93 North south of the Icefield Centre', {
    description: 'A switchback climb to a ridge viewpoint above the Saskatchewan Glacier valley.',
    paragraphs: [
      'Parker Ridge climbs from its own Parkway parking area by switchbacks. The current profile is 2.7 km one way with 305 m of gain and 45 m of loss. It is a ridge-view hike, not a route onto the Saskatchewan Glacier or a substitute for a guided glacier activity.',
      'Remain on the designated trail through the switchbacks instead of cutting across the vegetation. Snow and visibility can change the value and demands of the outing, even when the road is open. Include the descent and the rest of the driving journey before deciding whether to add the hike to a long Parkway day.',
    ], highlights: ['Switchback ascent', 'Saskatchewan Glacier valley outlook', 'Ridge endpoint rather than glacier access'], access: parkwayAccess,
    sources: [{ label: 'Icefields Parkway journey and seasonal context', url: PARKWAY }],
  }),
  'molar-pass': review('Molar Pass Trail', 'difficult', '9.8 km one way', '560 m one way', '35 m one way', '7–8 hr estimated return', 'Parking area just south of the Mosquito Creek Campground turnoff, Highway 93 North', {
    description: 'A long route into alpine meadows at Molar Pass from the Mosquito Creek area.',
    paragraphs: [
      'Molar Pass starts from the small hiking parking area south of the Mosquito Creek Campground turnoff, not from a lakeshore viewpoint. The official route is 9.8 km one way and graded Difficult. Build the day around the full return through the creek-valley approach and the higher meadow section.',
      'At the pass junction, Molar and North Molar are separate objectives. North Molar’s longer distance should not be used for this pass or treated as a short loop extension. Keep the group together, carry what is needed for a long outing and protect the meadow by following the designated trail.',
    ], highlights: ['Mosquito Creek-area start', 'Molar Pass meadows', 'Separate North Molar branch'], access: parkwayAccess,
    sources: [{ label: 'Icefields Parkway journey planning', url: PARKWAY }],
  }),
  'north-molar-pass': review('North Molar Pass Trail', 'difficult', '11.5 km one way', '795 m one way', '30 m one way', '8–9 hr estimated return', 'Parking area just south of the Mosquito Creek Campground turnoff, Highway 93 North', {
    description: 'The longer, higher pass choice branching from the Molar corridor into rocky alpine terrain.',
    paragraphs: [
      'North Molar uses the Molar corridor before taking the separate branch towards the higher pass. Parks Canada’s 11.5 km one-way profile starts at the highway trailhead, rather than at that junction. The 795 m of outward gain and long return distinguish it from the shorter Molar Pass choice.',
      'The upper landscape includes rocky meadow terrain. Plan for that higher-country section and a complete return rather than assuming the lower approach describes the whole route. If the group, weather or remaining daylight call for an earlier turnaround, do not add the second pass simply because the routes share a start.',
    ], highlights: ['North Molar endpoint', 'Rocky alpine terrain', 'Longer Molar-corridor option'], access: parkwayAccess,
    sources: [{ label: 'Icefields Parkway access and services', url: PARKWAY }],
  }),
  'dolomite-pass': review('Dolomite Pass Trail', 'difficult', '8.9 km one way from Helen Lake trailhead', '655 m one way', '215 m one way', '6–7 hr estimated return', 'Helen Lake parking area on Highway 93 North, opposite Crowfoot Glacier viewpoint', {
    description: 'A longer continuation beyond Helen Lake to Dolomite Pass, with the lake approach included in its figures.',
    paragraphs: [
      'Dolomite Pass extends the Helen Lake route. The published 8.9 km one-way total and 655 m gain begin at the Helen Lake trailhead, not at the lake. Its Difficult rating and additional high-country distance make it a separate decision from the Moderate Helen Lake outing.',
      'The route’s geological surroundings can be appreciated from the designated pass trail without adding a summit scramble. Cirque Peak and Dolomite Peak are not included hiking destinations in this profile. Leave time for the return through the shared lake approach and the drive back from the Parkway trailhead.',
    ], highlights: ['Helen Lake approach included', 'Dolomite Pass objective', 'Separate from nearby summit scrambles'], access: parkwayAccess,
    sources: [{ label: 'Icefields Parkway travel planning', url: PARKWAY }],
  }),
  'glacier-lake': review('Glacier Lake Trail', 'difficult', '8.8 km one way', '260 m one way', '275 m one way', '6–7 hr estimated return', 'Glacier Lake parking lot, Highway 93 North north of Saskatchewan Crossing', {
    description: 'A long rolling forest route to Glacier Lake, with outward descent to regain on the return.',
    paragraphs: [
      'Glacier Lake is a substantial forest walk from the parking area north of Saskatchewan Crossing. Its official 8.8 km one-way profile includes 260 m of gain and 275 m of loss, so a modest net elevation change does not mean flat walking. Descents on the outward route become climbs on the return.',
      'Choose the lake as a day-hike endpoint and bring the supplies needed for the whole return. The lake’s name does not establish a trail onto a glacier, and an arrival at the shore is not a complete lake circuit. Any overnight backcountry stay needs a separate permit and plan rather than being included with this day-route description.',
    ], highlights: ['Glacier Lake destination', 'Rolling forest approach', 'Return climbing as well as descent'], access: parkwayAccess,
    sources: [{ label: 'Icefields Parkway road and services planning', url: PARKWAY }],
  }),
  'sunset-lookout': review('Sunset Lookout Trail', 'difficult', '4.5 km one way', '615 m one way', '90 m one way', '3–4 hr estimated return', 'Sunset Pass parking lot, Highway 93 North north of Saskatchewan Crossing', {
    description: 'A steep climb on the Sunset corridor to a former fire-lookout site, separate from Sunset Pass.',
    paragraphs: [
      'Sunset Lookout branches from the Sunset Pass corridor towards the former lookout location. The 4.5 km one-way profile already includes the approach from the highway parking area; the branch length is not an extra full hike to add again. The 615 m gain makes it a substantial climb despite the shorter distance than the pass.',
      'The name is a destination, not advice to start late or remain until sunset. Plan the complete descent for the group, actual daylight and the return drive, with a headlamp and emergency supplies. Sunset Pass is the longer separate objective at another junction, not a loop automatically included with the lookout.',
    ], highlights: ['Former lookout location', 'Steep Sunset corridor climb', 'Distinct from Sunset Pass'], access: parkwayAccess,
    sources: [{ label: 'Icefields Parkway journey information', url: PARKWAY }],
  }),
  'sunset-pass': review('Sunset Pass Trail', 'difficult', '8.1 km one way', '715 m one way', '40 m one way', '6–7 hr estimated return', 'Sunset Pass parking lot, Highway 93 North north of Saskatchewan Crossing', {
    description: 'A long climb through forest to the meadow at Sunset Pass, with a full return to the Parkway.',
    paragraphs: [
      'Sunset Pass continues farther than the separate lookout branch. Its official profile is 8.1 km one way with 715 m of gain, beginning at the highway parking area. The forest climb leads towards a meadow pass; the shorter lookout figures do not describe this destination.',
      'Use the pass as the planned turnaround and follow the designated route through the meadow. The route name does not recommend hiking after dark, and continuing towards the White Goat Wilderness is a different backcountry journey. Plan the full return, emergency supplies and the Parkway drive before deciding whether this long outing fits the day.',
    ], highlights: ['Sunset Pass meadow', 'Long forest ascent', 'Separate lookout branch'], access: parkwayAccess,
    sources: [{ label: 'Icefields Parkway road journey planning', url: PARKWAY }],
  }),
};

/** Add review scope without re-dating or rewriting the 23 previously reviewed records. */
export function applyTrailSourceReviews(records: Trail[]): Trail[] {
  return records.map(record => {
    const updated = { ...record, ...hikingSourceReviews[record.slug] };
    // Ink Pots is Moderate in the current official profile; all its valid prior figures stay intact.
    if (record.slug === 'ink-pots') updated.difficulty = 'moderate';
    const unverified = updated.routeVerified === false || !updated.reviewedAt || !updated.sourceUrls?.length;
    return {
      ...updated,
      routeVerified: !unverified,
      ...(unverified ? { directoryEligible: false } : {}),
      sourceReview: updated.sourceReview ?? {
        status: unverified ? 'unverified' : 'reviewed',
        scope: unverified
          ? record.slug === 'golf-course-loop-xc-ski'
            ? 'Retained legacy URL: no exact designated winter golf-course ski loop or trailhead verified. Excluded from recommendations and indexing.'
            : 'No exact primary-source route review is recorded. Excluded from recommendations and indexing until identity, figures and access are verified.'
          : record.season === 'winter'
            ? 'Retained prior winter activity review: stated route, endpoint and access caveats only. No current grooming, snow, ice or operating status is supplied.'
            : record.season === 'year-round'
              ? 'Retained prior route review with separate seasonal access caveats. Summer figures are not a winter route or ice assessment; check current official information.'
              : 'Retained prior summer route review: stated endpoint, figures and access caveats only. No winter suitability or current conditions are supplied.',
      },
      imageStatus: 'illustrative',
      imageNote: 'Illustrative stock photograph; not verified as this route or its current conditions.',
    };
  });
}
