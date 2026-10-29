export interface Trail {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
  distance: string;
  elevationGain: string;
  elevationLoss: string;
  time: string;
  season: 'year-round' | 'summer' | 'winter';
  type: 'trail' | 'viewpoint' | 'lake';
  area: 'Banff' | 'Lake Louise' | 'Castle Junction' | 'Icefields Parkway' | 'Kootenay';
  park?: 'Banff National Park' | 'Kootenay National Park' | 'Banff National Park / Spray Valley Provincial Park';
  province?: 'Alberta' | 'British Columbia';
  reviewedAt?: string;
  directoryEligible?: boolean;
  routeVerified?: boolean;
  sourceUrls?: { label: string; url: string }[];
  accessNote?: string;
  winterNote?: string;
  currentNotice?: { checkedAt: string; text: string; url: string };
  lat: number;
  lng: number;
  image: string;
  highlights: string[];
  trailhead: string;
  parksCanadaUrl: string;
  transitAccessible: boolean;
  transitRoute?: string;
  status?: 'open' | 'caution' | 'closed' | 'unknown';
  conditionNote?: string;
  conditionUpdated?: string;
  parkingCapacity?: string;
  parkingNotes?: string;
  crowdLevel?: { summer: 'low' | 'medium' | 'high'; winter: 'low' | 'medium' | 'high' };
}

export const trails: Trail[] = [
  // ═══════════════════════════════════════════════════════════════════════
  // BANFF AREA (30 trails)
  // ═══════════════════════════════════════════════════════════════════════

  // ── Banff Easy ────────────────────────────────────────────────────────

  {
    "id": "fenland-trail",
    "name": "Fenland Trail",
    "slug": "fenland-trail",
    "description": "A peaceful self-guided interpretive loop winding through old-growth white spruce forest on the edge of Banff townsite.",
    "longDescription": "Fenland is a short forest loop near Banff townsite, with wetland habitat and interpretive features. Keep to the designated route and give wildlife space. The short distance and limited climbing do not establish the condition of boardwalks or paths on a particular day. Check Parks Canada for current access and seasonal surface information.",
    "difficulty": "easy",
    "distance": "1.9 km loop",
    "elevationGain": "20 m",
    "elevationLoss": "Not stated in current route overview",
    "time": "40 min",
    "season": "year-round",
    "type": "trail",
    "area": "Banff",
    "lat": 51.1854,
    "lng": -115.5834,
    "image": "https://images.unsplash.com/photo-1511497584788-876760111969?w=600&q=80",
    "highlights": [
      "Old-growth white spruce forest",
      "Interpretive signs along the route",
      "Beaver and elk sightings"
    ],
    "trailhead": "Fenland Trail parking area",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": false,
    "status": "unknown"
  },
  {
    "id": "marsh-loop",
    "name": "Marsh Trail (Cave and Basin)",
    "slug": "marsh-loop",
    "description": "A wetland trail from Cave and Basin beside the Bow River, with an uneven natural surface.",
    "longDescription": "The Marsh Trail begins near Cave and Basin National Historic Site and explores wetland beside the Bow River. Use the designated trail and viewing areas without entering protected thermal water or disturbing wildlife. Check current surface conditions, flood or wildlife notices and the actual return route before starting.\n\nCave and Basin’s indoor visitor facilities have their own opening days. Roam Route 4 is seasonal, so check the timetable for the day of travel rather than assuming year-round service.",
    "difficulty": "easy",
    "distance": "1.5 km one way (3 km return)",
    "elevationGain": "15 m one way",
    "elevationLoss": "20 m one way",
    "time": "About 1 hr return",
    "season": "year-round",
    "type": "trail",
    "area": "Banff",
    "lat": 51.1545,
    "lng": -115.5847,
    "image": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80",
    "highlights": [
      "Wetland landscape",
      "Cave and Basin area",
      "Designated wildlife viewing areas"
    ],
    "trailhead": "Cave and Basin NHS",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": true,
    "transitRoute": "Roam Route 4 in its operating season — check dates",
    "status": "unknown",
    "reviewedAt": "2026-10-28",
    "sourceUrls": [
      {
        "label": "Official route information",
        "url": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking"
      }
    ]
  },
  {
    "id": "spray-river-east",
    "name": "Spray River East",
    "slug": "spray-river-east",
    "description": "A forested riverside trail along the east bank of the Spray River, passing beneath the Fairmont Banff Springs.",
    "longDescription": "This one-way route follows the eastern shore of the Spray River through mixed coniferous forest, with occasional glimpses of the iconic Banff Springs Hotel perched above. The gentle terrain makes it popular with cyclists and joggers as well as hikers. Birdsong and the rush of the Spray River accompany you through a corridor that feels remote despite its proximity to town.",
    "difficulty": "easy",
    "distance": "5.6 km one way to Spray River bridge",
    "elevationGain": "145 m one way",
    "elevationLoss": "100 m one way",
    "time": "3-4 hrs",
    "season": "year-round",
    "type": "trail",
    "area": "Banff",
    "lat": 51.1644,
    "lng": -115.5562,
    "image": "https://images.unsplash.com/photo-1511497584788-876760111969?w=600&q=80",
    "highlights": [
      "Spray River scenery",
      "Views of Banff Springs Hotel",
      "Shared cycling and hiking path"
    ],
    "trailhead": "Golf Course Road",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": true,
    "status": "unknown",
    "transitRoute": "Roam Route 4 to Bow Falls in summer, then the official walking approach"
  },
  {
    "id": "spray-river-west",
    "name": "Spray River West",
    "slug": "spray-river-west",
    "description": "A forested route on the western side of the Spray River, with a separate winter ski description.",
    "longDescription": "Spray River West follows the valley from the trailhead beyond the Fairmont Banff Springs. Plan the exact turnaround or connection before starting: a one-way trail distance is not the length of a complete return outing. Check current route, wildlife and surface restrictions before choosing any East/West connection.\n\nFor skiing, use the current Parks Canada winter guide and grooming report. Its summer description does not establish a groomed loop or remove the avalanche-path warning on the Spray River corridor.",
    "difficulty": "easy",
    "distance": "5.7 km one way to Spray River bridge (summer guide)",
    "elevationGain": "130 m one way (summer guide)",
    "elevationLoss": "125 m one way (summer guide)",
    "time": "3-4 hrs",
    "season": "year-round",
    "type": "trail",
    "area": "Banff",
    "lat": 51.1644,
    "lng": -115.5562,
    "image": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80",
    "highlights": [
      "Spray River valley",
      "Forested route",
      "Separate summer and winter planning"
    ],
    "trailhead": "End of Spray Avenue past Fairmont Banff Springs",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": true,
    "status": "unknown",
    "transitRoute": "Roam Route 2 to Banff Springs Hotel, then verify the walking approach"
  },
  {
    id: 'tunnel-campground-loop',
    name: 'Tunnel Campground Loop',
    slug: 'tunnel-campground-loop',
    description:
      'A pleasant forested loop circling the base of Tunnel Mountain with Bow Valley views.',
    longDescription:
      'This easy loop trail winds through montane forest around the base of Tunnel Mountain, offering glimpses of the Bow Valley and surrounding peaks without significant climbing. It connects several campgrounds and day-use areas, making it a popular evening walk for visitors staying nearby. Accessible via Roam Route 2, it suits all fitness levels and provides a gentle introduction to Banff hiking.',
    difficulty: 'easy',
    distance: '6.4 km loop',
    elevationGain: '70 m',
    elevationLoss: '70 m',
    time: '1.5 hrs',
    season: 'year-round',
    type: 'trail',
    area: 'Banff',
    lat: 51.1752,
    lng: -115.5469,
    image:
      'https://images.unsplash.com/photo-1511497584788-876760111969?w=600&q=80',
    highlights: [
      'Gentle forested loop',
      'Bow Valley views',
      'Accessible from multiple campgrounds',
    ],
    trailhead: 'Hidden Ridge Resort',
    parksCanadaUrl:
      'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
    transitAccessible: true,
    transitRoute: 'Roam Route 2',
  
    status: 'unknown',
  },
  {
    "id": "stewart-canyon",
    "name": "Stewart Canyon",
    "slug": "stewart-canyon",
    "description": "A short lakeside walk to a scenic bridge spanning a narrow limestone canyon on Lake Minnewanka.",
    "longDescription": "Beginning at the Lake Minnewanka day-use area, this easy walk follows the north shore before arriving at a bridge that spans the impressive Stewart Canyon. The turquoise water of the Cascade River cuts through vertical limestone walls far below, creating a dramatic natural spectacle. It is an excellent add-on to a Lake Minnewanka visit and accessible via Roam Route 6.",
    "difficulty": "easy",
    "distance": "1.5 km one way",
    "elevationGain": "0 m",
    "elevationLoss": "0 m",
    "time": "1 hr",
    "season": "year-round",
    "type": "trail",
    "area": "Banff",
    "lat": 51.235,
    "lng": -115.491,
    "image": "https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=600&q=80",
    "highlights": [
      "Limestone canyon bridge",
      "Lake Minnewanka shoreline",
      "Cascade River gorge"
    ],
    "trailhead": "Lake Minnewanka Day-use",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": true,
    "transitRoute": "Roam Route 6 in its operating season — check the date-specific timetable",
    "status": "unknown"
  },
  {
    "id": "johnson-lake",
    "name": "Johnson Lake",
    "slug": "johnson-lake",
    "description": "A family-friendly loop around a warm swimming lake, home to some of Alberta's oldest Douglas fir trees.",
    "longDescription": "Circling one of the warmest lakes in Banff National Park, this easy loop passes through a montane forest that shelters some of the oldest Douglas fir specimens in all of Alberta. The calm waters are popular for swimming in summer and the shoreline picnic areas make it a favourite family destination. Roam Route 6 provides convenient access from Banff townsite.",
    "difficulty": "easy",
    "distance": "2.8 km loop",
    "elevationGain": "0 m",
    "elevationLoss": "0 m",
    "time": "1 hr",
    "season": "year-round",
    "type": "trail",
    "area": "Banff",
    "lat": 51.2148,
    "lng": -115.4944,
    "image": "https://images.unsplash.com/photo-1511497584788-876760111969?w=600&q=80",
    "highlights": [
      "Alberta's oldest Douglas fir trees",
      "Warm swimming lake",
      "Lakeside picnic areas"
    ],
    "trailhead": "Johnson Lake Day-use",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": true,
    "transitRoute": "Roam Route 6 in its operating season — check stop and dates",
    "status": "unknown"
  },
  {
    id: 'sunshine-meadows',
    name: 'Sunshine Meadows',
    slug: 'sunshine-meadows',
    description:
      'Expansive alpine meadows along the Continental Divide, accessed by gondola from Sunshine Village ski resort.',
    longDescription:
      'Riding the Sunshine Village gondola above the treeline opens the door to some of the finest alpine meadow hiking in the Canadian Rockies. Trails crisscross the Continental Divide, connecting pristine lakes like Rock Isle, Grizzly, and Larix while carpets of wildflowers bloom in every direction during July and August. Standing on the divide, hikers straddle the border between Alberta and British Columbia with panoramic views stretching to the horizon.',
    difficulty: 'easy',
    distance: '10 km of trails',
    elevationGain: '200 m',
    elevationLoss: '200 m',
    time: '4-5 hrs',
    season: 'summer',
    type: 'trail',
    area: 'Banff',
    lat: 51.0715,
    lng: -115.7722,
    image:
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80',
    highlights: [
      'Continental Divide crossing',
      'Rock Isle, Grizzly & Larix Lakes',
      'Explosive summer wildflower blooms',
    ],
    trailhead: 'Sunshine Village gondola',
    parksCanadaUrl:
      'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
    transitAccessible: false,
  
    status: 'unknown',
  },
  {
    "id": "johnston-canyon-lower-falls",
    "name": "Johnston Canyon Lower Falls",
    "slug": "johnston-canyon-lower-falls",
    "description": "A narrow paved canyon path and catwalks to the Lower Falls viewpoint, subject to current access restrictions.",
    "longDescription": "The Lower Falls route follows an uneven paved path and narrow bridges with railings through Johnston Canyon. The current Parks Canada guide gives 1.1 km one way, with 85 m of cumulative ascent and 55 m of descent; allow about one hour for the return outing before additional stops or delays. Narrow sections can be difficult to pass, and Parks Canada does not recommend strollers.\n\nThis is a route description, not an assurance that the canyon is open. In winter, ice and snow change the footing. Stay on designated paths, follow barriers and check the current closure notice, trail report and weather before deciding on the outing.",
    "difficulty": "easy",
    "distance": "1.1 km one way (2.2 km return)",
    "elevationGain": "85 m one way",
    "elevationLoss": "55 m one way",
    "time": "About 1 hr return",
    "season": "year-round",
    "type": "trail",
    "area": "Banff",
    "lat": 51.2455,
    "lng": -115.8388,
    "image": "https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=600&q=80",
    "highlights": [
      "Canyon catwalks",
      "Lower Falls viewpoint",
      "Narrow, uneven paved path"
    ],
    "trailhead": "Johnston Canyon Day-use",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": true,
    "transitRoute": "Roam Route 9 — check the current operating dates and return service",
    "status": "unknown",
    "accessNote": "Use the Johnston Canyon Day-use Area on the Bow Valley Parkway. Verify the approach road, parking and Route 9 operation for your date; published summer service does not establish winter transport.",
    "winterNote": "Snow and ice can affect paths and catwalks. A traction aid does not override a closure or establish safe access.",
    "currentNotice": {
      "checkedAt": "2026-10-28",
      "text": "At review, Parks Canada listed a temporary Johnston Canyon closure beginning October 13, 2026, affecting the trail to both falls and the P1 facilities. Check the current notice before planning access; no reopening is assumed here.",
      "url": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking"
    },
    "reviewedAt": "2026-10-28",
    "sourceUrls": [
      {
        "label": "Official route information",
        "url": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking"
      }
    ]
  },
  {
    "id": "johnston-canyon-upper-falls",
    "name": "Johnston Canyon Upper Falls",
    "slug": "johnston-canyon-upper-falls",
    "description": "The longer Johnston Canyon outing to the Upper Falls, with more climbing and the same access checks as the Lower Falls.",
    "longDescription": "The Upper Falls route continues beyond the Lower Falls through Johnston Canyon. Parks Canada currently lists 2.4 km one way, 215 m of cumulative ascent and 125 m of descent, with about two hours for the return outing. The separate viewpoint above the Upper Falls adds distance; choose your actual endpoint before using an estimate.\n\nThe paved sections are uneven and the canyon bridges narrow. Check the current Parks Canada notice for the entire approach rather than assuming that a farther viewpoint is accessible when a lower section is closed.",
    "difficulty": "easy",
    "distance": "2.4 km one way (4.8 km return)",
    "elevationGain": "215 m one way",
    "elevationLoss": "125 m one way",
    "time": "About 2 hrs return",
    "season": "year-round",
    "type": "trail",
    "area": "Banff",
    "lat": 51.2455,
    "lng": -115.8388,
    "image": "https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=600&q=80",
    "highlights": [
      "Upper Falls viewpoints",
      "Longer canyon outing",
      "Uneven paths and narrow bridges"
    ],
    "trailhead": "Johnston Canyon Day-use",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": true,
    "transitRoute": "Roam Route 9 — verify operating dates and the return trip",
    "status": "unknown",
    "accessNote": "The approach uses the Johnston Canyon trailhead. Confirm the current trail and parking notice as well as transport; do not rely on an old bus timetable.",
    "winterNote": "Ice and snow alter the summer route. Check current canyon access and winter conditions before choosing an endpoint.",
    "currentNotice": {
      "checkedAt": "2026-10-28",
      "text": "At review, Parks Canada listed a temporary Johnston Canyon closure beginning October 13, 2026, affecting the trail to both falls and the P1 facilities. Check the current notice before planning access; no reopening is assumed here.",
      "url": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking"
    },
    "reviewedAt": "2026-10-28",
    "sourceUrls": [
      {
        "label": "Official route information",
        "url": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking"
      }
    ]
  },
  {
    "id": "silverton-falls",
    "name": "Silverton Falls",
    "slug": "silverton-falls",
    "description": "A short forest climb to a waterfall cascading over narrow rock ledges.",
    "longDescription": "Silverton Falls is a short forest trail from the Rockbound Lake trailhead area to a waterfall viewpoint. The route climbs despite its short distance. Stay on the designated path and check the current report for surface conditions and access before adding the walk to a Bow Valley Parkway outing.",
    "difficulty": "easy",
    "distance": "0.9 km one way",
    "elevationGain": "90 m",
    "elevationLoss": "0 m",
    "time": "40 min",
    "season": "summer",
    "type": "trail",
    "area": "Banff",
    "lat": 51.2234,
    "lng": -116.1133,
    "image": "https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=600&q=80",
    "highlights": [
      "Cascading waterfall viewpoint",
      "Narrow limestone ledges"
    ],
    "trailhead": "Rockbound Lake parking",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": false,
    "status": "unknown"
  },
  {
    "id": "boom-lake",
    "name": "Boom Lake",
    "slug": "boom-lake",
    "description": "A gentle forested trail leading to a large turquoise alpine lake backed by dramatic Boom Mountain cliffs.",
    "longDescription": "Boom Lake is reached by a forest trail to an alpine lake below Boom Mountain. Plan the full return outing, including food, layers and a turnaround suited to the group. Check the current official report for access and surface conditions; a lake destination does not establish a quiet shoreline or winter suitability.",
    "difficulty": "easy",
    "distance": "5.1 km one way",
    "elevationGain": "175 m",
    "elevationLoss": "0 m",
    "time": "3-4 hrs",
    "season": "summer",
    "type": "trail",
    "area": "Banff",
    "lat": 51.2344,
    "lng": -116.2833,
    "image": "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&q=80",
    "highlights": [
      "Turquoise alpine lake",
      "Boom Mountain cliffs backdrop"
    ],
    "trailhead": "Boom Lake Day-use",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": false,
    "status": "unknown"
  },
  {
    id: 'vista-lake',
    name: 'Vista Lake',
    slug: 'vista-lake',
    description:
      'A short descent from the highway to a serene lake tucked in a forested valley along Highway 93 South.',
    longDescription:
      'Vista Lake is reached by descending from the Highway 93 South trailhead through forest. The return requires climbing back to the road, so the short distance should be considered alongside the elevation change and actual footing. Check the official route and current report before starting or continuing towards Arnica Lake.',
    difficulty: 'easy',
    distance: '1.4 km one way',
    elevationGain: '0 m',
    elevationLoss: '120 m',
    time: '1.5 hrs',
    season: 'summer',
    type: 'trail',
    area: 'Banff',
    lat: 51.1876,
    lng: -116.2043,
    image:
      'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&q=80',
    highlights: [
      'Serene forested lake',
      'Downhill approach',
      'Peaceful and secluded',
    ],
    trailhead: 'Vista Lake viewpoint, Hwy 93S',
    parksCanadaUrl:
      'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
    transitAccessible: false,
  
    status: 'unknown',
  },

  // ── Banff Easy/Moderate ───────────────────────────────────────────────

  {
    "id": "sundance-canyon",
    "name": "Sundance Canyon",
    "slug": "sundance-canyon",
    "description": "A paved path from Cave and Basin leads to a rocky canyon loop with dramatic water-carved formations.",
    "longDescription": "The journey to Sundance Canyon begins on a wide, paved path along the Bow River from the Cave and Basin, making the first portion accessible to strollers and wheelchairs. Once at the canyon itself, a rugged loop trail weaves between towering water-carved rock walls where Sundance Creek cascades through narrow slots. The combination of easy approach and dramatic payoff makes this a favourite half-day outing accessible via Roam Route 4.",
    "difficulty": "easy",
    "distance": "3.7 km one way + 1.6 km loop",
    "elevationGain": "155 m",
    "elevationLoss": "60 m",
    "time": "3 hrs",
    "season": "year-round",
    "type": "trail",
    "area": "Banff",
    "lat": 51.1548,
    "lng": -115.6044,
    "image": "https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=600&q=80",
    "highlights": [
      "Water-carved canyon walls",
      "Paved approach along Bow River",
      "Sundance Creek cascades"
    ],
    "trailhead": "Cave and Basin NHS",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": true,
    "transitRoute": "Roam Route 4 when operating — check seasonal dates",
    "status": "unknown",
    "winterNote": "The canyon loop and access route require current winter checks. Cave and Basin facilities and Route 4 have their own seasonal schedules."
  },
  {
    "id": "ink-pots",
    "name": "Ink Pots",
    "slug": "ink-pots",
    "description": "Extend past Johnston Canyon Upper Falls to vivid cold-water mineral springs in an open meadow.",
    "longDescription": "The Ink Pots are reached beyond Johnston Canyon or by the separate Moose Meadows approach. The current Parks Canada guide lists 5.5 km one way, 425 m of cumulative ascent and 215 m of descent for its listed route. Choose and check the actual approach before travelling; the route through Johnston Canyon is affected by any canyon closure. Remain on designated paths around the spring pools.",
    "difficulty": "easy",
    "distance": "5.5 km one way (11 km return)",
    "elevationGain": "425 m one way",
    "elevationLoss": "215 m one way",
    "time": "About 4 hrs return",
    "season": "summer",
    "type": "trail",
    "area": "Banff",
    "lat": 51.2455,
    "lng": -115.8388,
    "image": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80",
    "highlights": [
      "Five vivid cold-water mineral springs",
      "Wildflower meadows",
      "Extension of Johnston Canyon trail"
    ],
    "trailhead": "Johnston Canyon Day-use",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": true,
    "transitRoute": "Roam Route 9",
    "status": "unknown",
    "currentNotice": {
      "checkedAt": "2026-10-28",
      "text": "Parks Canada listed the Johnston Canyon trail and day-use area closed for work from October 13 to December 11, 2026. Check the actual bulletin and approach before planning the Ink Pots; an announced end date is not proof of completed reopening.",
      "url": "https://parks.canada.ca/pn-np/ab/banff/bulletins/06d4ef61-a3c9-4b65-8dfc-66d056252d6c"
    },
    "reviewedAt": "2026-10-28",
    "sourceUrls": [
      {
        "label": "Official route information",
        "url": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking"
      }
    ]
  },

  // ── Banff Moderate ────────────────────────────────────────────────────

  {
    "id": "sulphur-mountain",
    "name": "Sulphur Mountain",
    "slug": "sulphur-mountain",
    "description": "A well-graded switchback trail climbing to the Banff Gondola summit station with sweeping Bow Valley panoramas.",
    "longDescription": "The Sulphur Mountain trail climbs through forest switchbacks towards the gondola summit area, with a separate summit boardwalk. Plan the hiking distance, climbing and return before starting. A gondola descent requires its own current ticket and operating check; it should not be assumed as an unarranged return. Snow-season terrain and access need a separate assessment from the summer trail description.",
    "difficulty": "moderate",
    "distance": "5.5 km one way + 0.5 km boardwalk",
    "elevationGain": "655 m",
    "elevationLoss": "0 m",
    "time": "4 hrs",
    "season": "year-round",
    "type": "trail",
    "area": "Banff",
    "lat": 51.1503,
    "lng": -115.5819,
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
    "highlights": [
      "Summit boardwalk & Cosmic Ray Station",
      "Six mountain range panorama",
      "Option to gondola down"
    ],
    "trailhead": "Upper Hot Springs parking",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": true,
    "transitRoute": "Roam Route 1",
    "status": "unknown"
  },
  {
    id: 'tunnel-mountain-summit',
    name: 'Tunnel Mountain Summit',
    slug: 'tunnel-mountain-summit',
    description:
      'The shortest summit hike in Banff, climbing through Douglas fir to panoramic views of the Bow Valley and townsite.',
    longDescription:
      'Tunnel Mountain is a summit outing from Banff townsite, climbing through forest on switchbacks towards views of the town and Bow Valley. A maintained trail designation does not establish today\'s surface condition. Check current notices and footing, and carry a headlamp if the outing could extend into darkness.',
    difficulty: 'moderate',
    distance: '2.4 km one way',
    elevationGain: '260 m',
    elevationLoss: '0 m',
    time: '2 hrs',
    season: 'year-round',
    type: 'trail',
    area: 'Banff',
    lat: 51.1797,
    lng: -115.5567,
    image:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
    highlights: [
      '360° Bow Valley panorama',
      'Banff townsite views',
      'Sunrise and sunset favourite',
    ],
    trailhead: 'St. Julien Road',
    parksCanadaUrl:
      'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
    transitAccessible: false,
  
    status: 'unknown',
  },
  {
    "id": "surprise-corner-to-hoodoos",
    "name": "Surprise Corner to Hoodoos",
    "slug": "surprise-corner-to-hoodoos",
    "description": "A scenic riverside trail from Surprise Corner to Banff's famous hoodoo rock formations along the Bow River.",
    "longDescription": "This route links the Surprise Corner area and the Hoodoos viewpoint through riverside and forest terrain. Plan the one-way distance and return connection rather than assuming a short loop. Check current trail, wildlife and seasonal surface notices, and use the official map for the exact route. Snow-season access is a separate assessment from the summer description.",
    "difficulty": "moderate",
    "distance": "4.8 km one way",
    "elevationGain": "115 m",
    "elevationLoss": "90 m",
    "time": "3 hrs",
    "season": "year-round",
    "type": "trail",
    "area": "Banff",
    "lat": 51.1657,
    "lng": -115.5588,
    "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    "highlights": [
      "Hoodoo rock formations",
      "Banff Springs Hotel views",
      "Bow River wildlife corridor"
    ],
    "trailhead": "Surprise Corner, Buffalo Street",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": false,
    "status": "unknown"
  },
  {
    id: 'upper-stoney',
    name: 'Upper Stoney',
    slug: 'upper-stoney',
    description:
      'A short, steep climb from Mount Norquay parking to views over the Bow Valley and Vermilion Range.',
    longDescription:
      'Starting from the Mount Norquay ski area parking lot, this compact trail packs a lot of elevation into a short distance, switchbacking through subalpine forest to open viewpoints above the Bow Valley. It is often used as a warm-up or conditioning hike and connects to the longer Cascade Amphitheatre network. The Norquay Shuttle provides convenient access during peak season.',
    difficulty: 'moderate',
    distance: '2.1 km one way',
    elevationGain: '190 m',
    elevationLoss: '0 m',
    time: '1.5 hrs',
    season: 'summer',
    type: 'trail',
    area: 'Banff',
    lat: 51.2032,
    lng: -115.5711,
    image:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
    highlights: [
      'Bow Valley panoramic views',
      'Quick elevation gain',
      'Connects to Cascade Amphitheatre',
    ],
    trailhead: 'Mount Norquay parking',
    parksCanadaUrl:
      'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
    transitAccessible: true,
    transitRoute: 'Norquay Shuttle',
  
    status: 'unknown',
  },
  {
    id: 'cascade-amphitheatre',
    name: 'Cascade Amphitheatre',
    slug: 'cascade-amphitheatre',
    description:
      'A rewarding day hike into a massive natural amphitheatre beneath the summit of Cascade Mountain.',
    longDescription:
      'The Cascade Amphitheatre trail traverses subalpine meadows exploding with wildflowers before entering a dramatic glacial cirque carved into the flank of Cascade Mountain. The sheer scale of the amphitheatre is breathtaking, with towering rock walls encircling hikers in a natural arena. Mountain goats and pikas are frequently spotted among the boulders, making this one of the most rewarding day hikes accessible from Banff via the Norquay Shuttle.',
    difficulty: 'moderate',
    distance: '7.7 km one way',
    elevationGain: '640 m',
    elevationLoss: '150 m',
    time: '6 hrs',
    season: 'summer',
    type: 'trail',
    area: 'Banff',
    lat: 51.2032,
    lng: -115.5711,
    image:
      'https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=600&q=80',
    highlights: [
      'Massive natural amphitheatre',
      'Alpine wildflower meadows',
      'Mountain goats and pikas',
    ],
    trailhead: 'Mount Norquay parking',
    parksCanadaUrl:
      'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
    transitAccessible: true,
    transitRoute: 'Norquay Shuttle',
  
    status: 'unknown',
  },
  {
    id: 'c-level-cirque',
    name: 'C-Level Cirque',
    slug: 'c-level-cirque',
    description:
      'A steady climb past historic coal mine ruins into a dramatic glacial cirque beneath Cascade Mountain.',
    longDescription:
      'Named after the mining operation that once extracted coal here, the C-Level Cirque trail passes crumbling mine ruins and concrete foundations before climbing into a stunning glacial amphitheatre. The cirque walls rise hundreds of metres overhead, and the trail offers excellent views across Lake Minnewanka. Interpretive elements about Banff\'s coal mining history add educational depth to this scenic and moderately challenging hike.',
    difficulty: 'moderate',
    distance: '3.9 km one way',
    elevationGain: '455 m',
    elevationLoss: '0 m',
    time: '3 hrs',
    season: 'summer',
    type: 'trail',
    area: 'Banff',
    lat: 51.2287,
    lng: -115.5267,
    image:
      'https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=600&q=80',
    highlights: [
      'Historic coal mine ruins',
      'Glacial cirque amphitheatre',
      'Lake Minnewanka views',
    ],
    trailhead: 'Upper Bankhead Day-use',
    parksCanadaUrl:
      'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
    transitAccessible: false,
  
    status: 'unknown',
  },
  {
    id: 'healy-pass',
    name: 'Healy Pass',
    slug: 'healy-pass',
    description:
      'A long but rewarding alpine traverse through meadows to a high pass with views into the Egypt Lake region.',
    longDescription:
      'The Healy Pass trail climbs through subalpine forest into alpine meadows and towards the pass above the Egypt Lake area. This is a substantial mountain outing whose equipment and turnaround must match the route, weather and group. If using a Sunshine shuttle, verify its operating dates, actual stop and last return before relying on it for trailhead access.',
    difficulty: 'moderate',
    distance: '8.8 km one way',
    elevationGain: '655 m',
    elevationLoss: '0 m',
    time: '6-7 hrs',
    season: 'summer',
    type: 'trail',
    area: 'Banff',
    lat: 51.0698,
    lng: -115.7754,
    image:
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80',
    highlights: [
      'Expansive alpine meadows',
      'Egypt Lake region views',
      'Monarch Ramparts panorama',
    ],
    trailhead: 'Sunshine Village parking',
    parksCanadaUrl:
      'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
    transitAccessible: true,
    transitRoute: 'Sunshine Shuttle',
  
    status: 'unknown',
  },
  {
    id: 'bourgeau-lake',
    name: 'Bourgeau Lake',
    slug: 'bourgeau-lake',
    description:
      'A sustained climb through forest to a stunning alpine lake cradled in a cirque beneath Mount Bourgeau.',
    longDescription:
      'The Bourgeau Lake trail ascends steadily through spruce and larch forest, crossing several avalanche paths before arriving at a pristine alpine lake nestled in a dramatic cirque. The turquoise water reflects the towering walls of Mount Bourgeau and the surrounding ridgeline, creating one of the most photogenic lake settings in Banff. Strong hikers can continue to Harvey Pass for even more expansive views.',
    difficulty: 'moderate',
    distance: '7.5 km one way',
    elevationGain: '725 m',
    elevationLoss: '0 m',
    time: '6 hrs',
    season: 'summer',
    type: 'trail',
    area: 'Banff',
    lat: 51.1459,
    lng: -115.7744,
    image:
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&q=80',
    highlights: [
      'Alpine cirque lake',
      'Mount Bourgeau views',
      'Extension to Harvey Pass',
    ],
    trailhead: 'Bourgeau Lake parking',
    parksCanadaUrl:
      'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
    transitAccessible: false,
  
    status: 'unknown',
  },
  {
    id: 'harvey-pass',
    name: 'Harvey Pass',
    slug: 'harvey-pass',
    description:
      'An extension beyond Bourgeau Lake climbing to a high mountain pass with panoramic alpine views.',
    longDescription:
      'For those with energy remaining after reaching Bourgeau Lake, the trail continues steeply up to Harvey Pass, gaining over a kilometre of total elevation from the trailhead. The pass rewards with sweeping views across the Sunshine Meadows region and into the heart of the Massive Range. This is a full-day commitment that puts hikers deep into the alpine zone with a genuine sense of wilderness and accomplishment.',
    difficulty: 'moderate',
    distance: '9.7 km one way',
    elevationGain: '1020 m',
    elevationLoss: '0 m',
    time: '6-7 hrs',
    season: 'summer',
    type: 'trail',
    area: 'Banff',
    lat: 51.1459,
    lng: -115.7744,
    image:
      'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=600&q=80',
    highlights: [
      'Over 1,000 m of elevation gain',
      'Sunshine Meadows panorama',
      'Remote alpine pass experience',
    ],
    trailhead: 'Bourgeau Lake parking',
    parksCanadaUrl:
      'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
    transitAccessible: false,
  
    status: 'unknown',
  },
  {
    "id": "rockbound-lake",
    "name": "Rockbound Lake",
    "slug": "rockbound-lake",
    "description": "A long forested approach rewarded by a stunning alpine lake ringed by towering rock walls near Castle Junction.",
    "longDescription": "Rockbound Lake is reached by a sustained mountain climb through forest into an alpine basin below high rock walls. Plan the full return distance, elevation changes, weather and daylight rather than choosing it for an assumed low crowd level. Stay on the designated trail and check Parks Canada for current route restrictions.",
    "difficulty": "moderate",
    "distance": "8.4 km one way",
    "elevationGain": "760 m",
    "elevationLoss": "0 m",
    "time": "6-7 hrs",
    "season": "summer",
    "type": "trail",
    "area": "Banff",
    "lat": 51.2597,
    "lng": -115.929,
    "image": "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&q=80",
    "highlights": [
      "Turquoise alpine lake",
      "Dramatic rock wall amphitheatre",
      "Remote backcountry feel"
    ],
    "trailhead": "Rockbound Lake parking",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": false,
    "status": "unknown"
  },
  {
    "id": "arnica-lake",
    "name": "Arnica Lake",
    "slug": "arnica-lake",
    "description": "A moderate climb from the Vista Lake viewpoint to a tranquil subalpine lake surrounded by wildflowers.",
    "longDescription": "Arnica Lake is reached from the Vista Lake trailhead on Highway 93 South, with elevation changes through forest and alpine terrain. This is a mountain outing requiring a complete return plan. Check weather, current conditions and the official route description before deciding on any continuation towards Twin Lakes.",
    "difficulty": "moderate",
    "distance": "5 km one way",
    "elevationGain": "580 m",
    "elevationLoss": "120 m",
    "time": "5 hrs",
    "season": "summer",
    "type": "trail",
    "area": "Banff",
    "lat": 51.1876,
    "lng": -116.2043,
    "image": "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&q=80",
    "highlights": [
      "Subalpine wildflower meadows",
      "Peaceful mountain lake"
    ],
    "trailhead": "Vista Lake viewpoint",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": false,
    "status": "unknown"
  },
  {
    "id": "twin-lakes",
    "name": "Twin Lakes",
    "slug": "twin-lakes",
    "description": "A longer route from the Vista Lake viewpoint to a pair of scenic alpine lakes in a remote valley.",
    "longDescription": "The Twin Lakes trail extends well beyond Arnica Lake into a remote alpine valley where two pristine lakes sit side by side beneath towering ridgelines. The route involves significant elevation change in both directions, passing through varied terrain from dense forest to open alpine tundra.",
    "difficulty": "moderate",
    "distance": "8 km one way",
    "elevationGain": "715 m",
    "elevationLoss": "315 m",
    "time": "6-7 hrs",
    "season": "summer",
    "type": "trail",
    "area": "Banff",
    "lat": 51.1876,
    "lng": -116.2043,
    "image": "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&q=80",
    "highlights": [
      "Twin alpine lakes",
      "Remote backcountry valley",
      "Diverse terrain and ecosystems"
    ],
    "trailhead": "Vista Lake viewpoint",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": false,
    "status": "unknown"
  },

  // ── Banff Challenging ─────────────────────────────────────────────────

  {
    "id": "aylmer-lookout",
    "name": "Aylmer Lookout",
    "slug": "aylmer-lookout",
    "description": "A strenuous hike along Lake Minnewanka to a historic fire lookout with commanding views of the lake and ranges.",
    "longDescription": "Following the north shore of Lake Minnewanka through forest and across rockslides, the trail eventually switchbacks up to the Aylmer Lookout — a historic fire watch site perched high above the lake. The views stretch the full 21-kilometre length of the lake and across to the Palliser Range. This is a demanding full-day hike that rewards with one of the most dramatic vantage points in the Banff area, accessible via Roam Route 6.",
    "difficulty": "challenging",
    "distance": "11.8 km one way",
    "elevationGain": "560 m",
    "elevationLoss": "0 m",
    "time": "7-8 hrs",
    "season": "summer",
    "type": "trail",
    "area": "Banff",
    "lat": 51.2565,
    "lng": -115.4342,
    "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    "highlights": [
      "Historic fire lookout",
      "Full-length Lake Minnewanka views",
      "Palliser Range panorama"
    ],
    "trailhead": "Lake Minnewanka Day-use",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": true,
    "transitRoute": "Roam Route 6 in its operating season — verify the last return",
    "status": "unknown",
    "accessNote": "Lake Minnewanka access, wildlife restrictions and transport require separate checks. Route 6 is seasonal; a late bus does not extend the safe daylight or pace of a long hike."
  },
  {
    "id": "aylmer-pass",
    "name": "Aylmer Pass",
    "slug": "aylmer-pass",
    "description": "An extended version of the Aylmer Lookout trail, continuing to a high alpine pass above Lake Minnewanka.",
    "longDescription": "Building on the already challenging Aylmer Lookout trail, Aylmer Pass pushes further into the alpine zone above Lake Minnewanka, crossing exposed terrain and gaining over 800 metres of elevation. The pass offers a gateway to the remote backcountry north of the lake with sweeping views across the Ghost Wilderness. This is one of the most physically demanding day hikes in the Banff area and requires strong fitness and early starts.",
    "difficulty": "challenging",
    "distance": "13.5 km one way",
    "elevationGain": "805 m",
    "elevationLoss": "0 m",
    "time": "8-9 hrs",
    "season": "summer",
    "type": "trail",
    "area": "Banff",
    "lat": 51.2565,
    "lng": -115.4342,
    "image": "https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=600&q=80",
    "highlights": [
      "High alpine pass at 2,288 m",
      "Ghost Wilderness panorama",
      "Remote backcountry access"
    ],
    "trailhead": "Lake Minnewanka Day-use",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": true,
    "transitRoute": "Roam Route 6 in its operating season — verify the last return",
    "status": "unknown",
    "accessNote": "Check current Lake Minnewanka trail restrictions and the exact outward/return transport. Do not assume a seasonal bus serves the trailhead in winter."
  },
  {
    id: 'cory-pass-loop',
    name: 'Cory Pass Loop',
    slug: 'cory-pass-loop',
    description:
      'A strenuous scramble to an exposed mountain pass with vertigo-inducing views down into Gargoyle Valley.',
    longDescription:
      'The Cory Pass Loop is one of Banff\'s most thrilling and demanding day hikes, climbing steeply through forest before traversing an exposed ridge with dramatic drop-offs into the rugged Gargoyle Valley below. The loop connects Cory Pass with Edith Pass, providing varied scenery from dense forest to barren alpine rock. Loose footing and exposure demand experience and confidence, but the payoff is among the most spectacular in the park.',
    difficulty: 'challenging',
    distance: '13 km loop',
    elevationGain: '915 m',
    elevationLoss: '915 m',
    time: '6 hrs',
    season: 'summer',
    type: 'trail',
    area: 'Banff',
    lat: 51.1918,
    lng: -115.6339,
    image:
      'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=600&q=80',
    highlights: [
      'Exposed ridge scrambling',
      'Gargoyle Valley views',
      'Mount Louis panorama',
    ],
    trailhead: 'Fireside Day-use',
    parksCanadaUrl:
      'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
    transitAccessible: false,
  
    status: 'unknown',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // LAKE LOUISE AREA (21 trails)
  // ═══════════════════════════════════════════════════════════════════════

  // ── Lake Louise Easy ──────────────────────────────────────────────────

  {
    "id": "lake-louise-lakeshore",
    "name": "Lake Louise Lakeshore",
    "slug": "lake-louise-lakeshore",
    "description": "A designated shoreline route from Lake Louise lakeshore, distinct from travelling on the lake ice.",
    "longDescription": "This route starts at the Lake Louise lakeshore near the Chateau and follows the designated shoreline trail. Parks Canada lists 2.3 km one way and about one hour for a return outing. Its current summer page reports 175 m of cumulative ascent and 75 m of descent, which differs from older brochures describing minimal gain. Allow for undulations and check the official route map rather than treating the entire outing as flat.\n\nLake, glacier and mountain views depend on weather and light. The trail is not a circuit around the lake and does not require crossing lake ice. Choose a turnaround that fits conditions and the group; continuing towards Plain of Six Glaciers is a separate, longer mountain route.",
    "difficulty": "easy",
    "distance": "2.3 km one way (4.6 km return)",
    "elevationGain": "175 m (current summer guide)",
    "elevationLoss": "75 m (current summer guide)",
    "time": "About 1 hr return; conditions vary",
    "season": "year-round",
    "type": "trail",
    "area": "Lake Louise",
    "lat": 51.41636,
    "lng": -116.21347,
    "image": "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&q=80",
    "highlights": [
      "Designated shoreline path",
      "Lake and mountain setting",
      "Separate from lake-ice travel"
    ],
    "trailhead": "Lake Louise Lakeshore parking",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": true,
    "status": "unknown",
    "transitRoute": "Roam Route 8X; Parks Canada shuttle in its operating season",
    "accessNote": "The trailhead is at Lake Louise lakeshore, separate from the village. Check Roam Route 8X for your date and the seasonal Parks Canada shuttle reservation rules. A bus or parking space does not establish trail access.",
    "winterNote": "Use the official winter lakeshore route and current notices. Lake appearance and calendar dates do not establish ice safety. Avoid the avalanche slopes and falling-ice area near the back of the lake.",
    "reviewedAt": "2026-10-28",
    "sourceUrls": [
      { "label": "Official tourism lakeshore location", "url": "https://www.banfflakelouise.com/experiences/hike-lake-louise-lakeshore" },
      {
        "label": "Official route information",
        "url": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking"
      }
    ]
  },
  {
    "id": "fairview-lookout",
    "name": "Fairview Lookout",
    "slug": "fairview-lookout",
    "description": "A short forest climb near Lake Louise to an elevated viewpoint overlooking the lake and Victoria Glacier.",
    "longDescription": "This short but steep route starts near the Lake Louise boathouse and climbs to a viewpoint above the lakeshore. Use the designated route and return by the same trail. It is a separate outing from the lakeshore walk, with additional climbing and its own surface conditions.\n\nParks Canada lists a winter out-and-back route but warns that the loop option requires avalanche training and equipment. Do not extend a walk into that loop from a summer description.",
    "difficulty": "easy",
    "distance": "1.2 km one way",
    "elevationGain": "100 m",
    "elevationLoss": "65 m",
    "time": "45 min",
    "season": "year-round",
    "type": "viewpoint",
    "area": "Lake Louise",
    "lat": 51.4167,
    "lng": -116.1773,
    "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    "highlights": [
      "Elevated Lake Louise view",
      "Easy add-on to lakeshore walk"
    ],
    "trailhead": "Lake Louise parking",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": false,
    "status": "unknown",
    "winterNote": "Use the official out-and-back winter route. Parks Canada warns that the loop option requires avalanche training and equipment."
  },
  {
    id: 'bow-river-lake-louise',
    name: 'Bow River (Lake Louise)',
    slug: 'bow-river-lake-louise',
    description:
      'A flat riverside trail through the Lake Louise village area along the Bow River.',
    longDescription:
      'This riverside route follows the Bow River near Lake Louise village through forest and day-use areas. Choose the actual start, turnaround and walking distance from the official map. A low elevation profile does not establish step-free access, winter footing or suitability for every visitor. Remain on designated paths and give wildlife space.',
    difficulty: 'easy',
    distance: 'up to 5.7 km',
    elevationGain: '0 m',
    elevationLoss: '0 m',
    time: '2 hrs',
    season: 'year-round',
    type: 'trail',
    area: 'Lake Louise',
    lat: 51.4247,
    lng: -116.1800,
    image:
      'https://images.unsplash.com/photo-1511497584788-876760111969?w=600&q=80',
    highlights: [
      'Peaceful Bow River scenery',
      'Wildlife corridor',
      'Connects multiple trailheads',
    ],
    trailhead: 'Bow River parking, Sentinel Road',
    parksCanadaUrl:
      'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
    transitAccessible: false,
  
    status: 'unknown',
  },
  {
    "id": "rockpile",
    "name": "Rockpile",
    "slug": "rockpile",
    "description": "A short scramble up a glacial debris mound to the iconic Valley of the Ten Peaks viewpoint at Moraine Lake.",
    "longDescription": "The Rockpile route climbs to the Moraine Lake viewpoint using the designated path and steps. The short distance does not make every surface level or step-free. Travel to Moraine Lake must be arranged separately: the road is closed to personal vehicles. Check the actual seasonal shuttle or authorised commercial service and its return arrangements.\n\nRemain on designated paths, allow time for your reserved transport and check current conditions. The summer description does not provide a winter walking route to Moraine Lake.",
    "difficulty": "easy",
    "distance": "0.7 km loop",
    "elevationGain": "35 m",
    "elevationLoss": "35 m",
    "time": "30 min",
    "season": "summer",
    "type": "viewpoint",
    "area": "Lake Louise",
    "lat": 51.3217,
    "lng": -116.186,
    "image": "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&q=80",
    "highlights": [
      "Iconic $20 bill viewpoint",
      "Valley of the Ten Peaks panorama",
      "Turquoise glacial lake"
    ],
    "trailhead": "Moraine Lake",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": true,
    "status": "unknown",
    "reviewedAt": "2026-10-28",
    "sourceUrls": [
      {
        "label": "Parks Canada Lake Louise hiking map (2024 publication)",
        "url": "https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise/~/-/media/4a80e3eb362e49e09e139866ca506327.ashx"
      },
      {
        "label": "Current lake access information",
        "url": "https://parks.canada.ca/pn-np/ab/banff/visit/les10-top10/louise"
      }
    ],
    "transitRoute": "Seasonal Parks Canada shuttle or authorised commercial transport",
    "accessNote": "Moraine Lake Road is closed to personal vehicles. Reserve the actual seasonal transport and check return arrangements; this is not a standard winter sightseeing drive."
  },
  {
    "id": "moraine-lake-lakeshore",
    "name": "Moraine Lake Lakeshore",
    "slug": "moraine-lake-lakeshore",
    "description": "A gentle shoreline trail along the edge of Moraine Lake with close-up views of the Ten Peaks.",
    "longDescription": "Following the southern shore of Moraine Lake, this easy trail offers intimate views of the impossibly blue glacial water and the towering Ten Peaks that rise above. The path meanders through boulder fields and shoreline forest, providing constantly changing perspectives of the lake and surrounding mountains. It pairs perfectly with the Rockpile viewpoint for a complete Moraine Lake experience.",
    "difficulty": "easy",
    "distance": "1.3 km one way",
    "elevationGain": "0 m",
    "elevationLoss": "0 m",
    "time": "45 min",
    "season": "summer",
    "type": "trail",
    "area": "Lake Louise",
    "lat": 51.3217,
    "lng": -116.186,
    "image": "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&q=80",
    "highlights": [
      "Shoreline glacial lake walk",
      "Ten Peaks close-up views",
      "Boulder field scrambling"
    ],
    "trailhead": "Moraine Lake",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": true,
    "status": "unknown",
    "transitRoute": "Seasonal Parks Canada shuttle or authorised commercial transport",
    "accessNote": "Moraine Lake Road is closed to personal vehicles. Check the actual shuttle season and reservation; do not drive to the former public lot or use the summer shoreline route as a winter recommendation."
  },
  {
    "id": "consolation-lakes",
    "name": "Consolation Lakes",
    "slug": "consolation-lakes",
    "description": "A moderate walk from Moraine Lake through boulder fields to a pair of peaceful alpine lakes beneath rugged peaks.",
    "longDescription": "This route begins at Moraine Lake and travels through forest and rocky terrain towards Consolation Lakes. Arrange the actual seasonal transport to Moraine Lake and its return before selecting the outing. The lake destination does not establish a low crowd level, and current wildlife or route restrictions can change access. Use the official route description and remain on designated trails.",
    "difficulty": "easy",
    "distance": "2.9 km one way",
    "elevationGain": "135 m",
    "elevationLoss": "50 m",
    "time": "2 hrs",
    "season": "summer",
    "type": "lake",
    "area": "Lake Louise",
    "lat": 51.319,
    "lng": -116.179,
    "image": "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&q=80",
    "highlights": [
      "Peaceful alpine lakes",
      "Tower of Babel backdrop",
      "Boulder field crossing"
    ],
    "trailhead": "Moraine Lake",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": true,
    "status": "unknown",
    "transitRoute": "Seasonal transport to Moraine Lake — verify reservation and return"
  },

  // ── Lake Louise Moderate ──────────────────────────────────────────────

  {
    "id": "lake-agnes",
    "name": "Lake Agnes",
    "slug": "lake-agnes",
    "description": "A summer mountain hike from Lake Louise to Lake Agnes and a seasonal tea house.",
    "longDescription": "The Lake Agnes route climbs from Lake Louise lakeshore through forest and past Mirror Lake. The current Parks Canada guide gives 3.9 km one way, 495 m of cumulative ascent and 80 m of descent, with an estimated 2.5–3 hours for the return hike. Time at the lake and any tea-house stop are additional planning choices.\n\nThe tea house is seasonal: carry the food and water needed for your own outing and confirm operation independently. Big Beehive and Little Beehive are separate side trips with additional distance and climbing, rather than included viewpoints on this return route.",
    "difficulty": "moderate",
    "distance": "3.9 km one way (7.8 km return)",
    "elevationGain": "495 m one way",
    "elevationLoss": "80 m one way",
    "time": "About 2.5–3 hrs return",
    "season": "summer",
    "type": "trail",
    "area": "Lake Louise",
    "lat": 51.41636,
    "lng": -116.21347,
    "image": "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&q=80",
    "highlights": [
      "Lake Agnes",
      "Forest climb via Mirror Lake",
      "Seasonal tea house"
    ],
    "trailhead": "Lake Louise parking",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": true,
    "status": "unknown",
    "transitRoute": "Roam Route 8X; seasonal Parks Canada shuttle to lakeshore",
    "accessNote": "The trailhead is at Lake Louise lakeshore, separate from the village. Check Roam Route 8X for your date and the seasonal Parks Canada shuttle reservation rules. A bus or parking space does not establish trail access.",
    "winterNote": "Parks Canada identifies avalanche exposure on the Lake Agnes/Mirror Lake and Plain of Six Glaciers summer routes from November to June. These are not ordinary winter walks. Check the official winter route information and avalanche guidance; a summer grade or distance is not a winter recommendation.",
    "reviewedAt": "2026-10-28",
    "sourceUrls": [
      { "label": "Official tourism lakeshore location", "url": "https://www.banfflakelouise.com/experiences/hike-lake-louise-lakeshore" },
      {
        "label": "Official route information",
        "url": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking"
      }
    ]
  },
  {
    "id": "plain-of-six-glaciers",
    "name": "Plain of Six Glaciers",
    "slug": "plain-of-six-glaciers",
    "description": "A summer hike beyond Lake Louise into a glacial valley, with a seasonal tea-house option.",
    "longDescription": "Starting at Lake Louise lakeshore, this outing continues beyond the shoreline into the mountain valley. The current Parks Canada guide lists 5.9 km one way, 595 m of cumulative ascent and 250 m of descent, with about four hours for the return hike. Older publications give 5.8 km; use the current guide and your actual endpoint when planning.\n\nThe tea house is seasonal and is not a guaranteed food or water stop. A viewpoint extension or the Highline connection towards Lake Agnes adds its own distance and route choices. Remain on designated trails; this hiking description does not include glacier travel.",
    "difficulty": "moderate",
    "distance": "5.9 km one way (11.8 km return)",
    "elevationGain": "595 m one way",
    "elevationLoss": "250 m one way",
    "time": "About 4 hrs return",
    "season": "summer",
    "type": "trail",
    "area": "Lake Louise",
    "lat": 51.41636,
    "lng": -116.21347,
    "image": "https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=600&q=80",
    "highlights": [
      "Glacial valley scenery",
      "Summer mountain trail",
      "Seasonal tea house"
    ],
    "trailhead": "Lake Louise parking",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": true,
    "status": "unknown",
    "transitRoute": "Roam Route 8X; seasonal Parks Canada shuttle to lakeshore",
    "accessNote": "The trailhead is at Lake Louise lakeshore, separate from the village. Check Roam Route 8X for your date and the seasonal Parks Canada shuttle reservation rules. A bus or parking space does not establish trail access.",
    "winterNote": "Parks Canada identifies avalanche exposure on the Lake Agnes/Mirror Lake and Plain of Six Glaciers summer routes from November to June. These are not ordinary winter walks. Check the official winter route information and avalanche guidance; a summer grade or distance is not a winter recommendation.",
    "reviewedAt": "2026-10-28",
    "sourceUrls": [
      { "label": "Official tourism lakeshore location", "url": "https://www.banfflakelouise.com/experiences/hike-lake-louise-lakeshore" },
      {
        "label": "Official route information",
        "url": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking"
      }
    ]
  },
  {
    id: 'tramline',
    name: 'Tramline',
    slug: 'tramline',
    description:
      'A historic trail following the old tramway route that once connected the Lake Louise railway station to the Château.',
    longDescription:
      'The Tramline trail follows the historic transport corridor between Lake Louise village and the lakeshore through forest. Plan the actual endpoint and return journey: walking uphill to the lake is an outing in its own right. Check designated uses and current seasonal conditions before combining it with another route.',
    difficulty: 'moderate',
    distance: '4.3 km one way',
    elevationGain: '220 m',
    elevationLoss: '30 m',
    time: '2.5 hrs',
    season: 'year-round',
    type: 'trail',
    area: 'Lake Louise',
    lat: 51.4230,
    lng: -116.1780,
    image:
      'https://images.unsplash.com/photo-1511497584788-876760111969?w=600&q=80',
    highlights: [
      'Historic tramway route',
      'Village-to-lake connection',
      'Interpretive heritage markers',
    ],
    trailhead: 'Bow River parking / Lake Louise parking',
    parksCanadaUrl:
      'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
    transitAccessible: false,
  
    status: 'unknown',
  },
  {
    id: 'lake-annette',
    name: 'Lake Annette',
    slug: 'lake-annette',
    description:
      'A moderate hike through Paradise Valley to a serene alpine lake ringed by towering peaks.',
    longDescription:
      'Lake Annette lies along the approach to the grander Paradise Valley, but the lake itself is a worthy destination with still waters reflecting the massive walls of Mount Temple and surrounding peaks. The trail winds through dense subalpine forest, crossing creeks and passing through meadows before reaching the peaceful shores. It provides a taste of the Paradise Valley experience without committing to the full-day trek.',
    difficulty: 'moderate',
    distance: '5.7 km one way',
    elevationGain: '345 m',
    elevationLoss: '110 m',
    time: '4 hrs',
    season: 'summer',
    type: 'lake',
    area: 'Lake Louise',
    lat: 51.3750,
    lng: -116.2200,
    image:
      'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&q=80',
    highlights: [
      'Serene alpine lake',
      'Mount Temple reflections',
      'Paradise Valley approach',
    ],
    trailhead: 'Paradise Valley trailhead',
    parksCanadaUrl:
      'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
    transitAccessible: false,
  
    status: 'unknown',
  },
  {
    "id": "eiffel-lake",
    "name": "Eiffel Lake",
    "slug": "eiffel-lake",
    "description": "A sustained climb from Moraine Lake to a vivid alpine lake beneath Eiffel Peak and the Valley of Ten Peaks.",
    "longDescription": "The Eiffel Lake trail branches off the Larch Valley route to reach a strikingly coloured alpine lake sitting in the shadow of Eiffel Peak. The route climbs through larch forest and alpine meadows, offering ever-expanding views of the Valley of the Ten Peaks behind. The lake itself changes colour with the season and light, ranging from deep teal to milky turquoise, set against a backdrop of scree slopes and glacial remnants.",
    "difficulty": "moderate",
    "distance": "5.7 km one way",
    "elevationGain": "560 m",
    "elevationLoss": "125 m",
    "time": "4-5 hrs",
    "season": "summer",
    "type": "lake",
    "area": "Lake Louise",
    "lat": 51.3217,
    "lng": -116.186,
    "image": "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&q=80",
    "highlights": [
      "Vivid alpine lake",
      "Eiffel Peak views",
      "Valley of Ten Peaks panorama"
    ],
    "trailhead": "Moraine Lake",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": true,
    "status": "unknown",
    "transitRoute": "Seasonal transport to Moraine Lake — verify reservation and return"
  },
  {
    "id": "larch-valley-minnestimma-lakes",
    "name": "Larch Valley / Minnestimma Lakes",
    "slug": "larch-valley-minnestimma-lakes",
    "description": "A popular climb through golden larch forest to alpine meadows and pristine Minnestimma Lakes.",
    "longDescription": "Famous for its golden larch display in late September, Larch Valley draws hikers up from Moraine Lake through one of the most photogenic subalpine forests in the Rockies. Above the treeline, the trail opens to meadows dotted with the Minnestimma Lakes and framed by the towering Ten Peaks. The combination of fall colour, alpine water features, and dramatic mountain scenery makes this one of the most iconic seasonal hikes in western Canada.",
    "difficulty": "moderate",
    "distance": "4.5 km one way",
    "elevationGain": "570 m",
    "elevationLoss": "10 m",
    "time": "3.5-4 hrs",
    "season": "summer",
    "type": "trail",
    "area": "Lake Louise",
    "lat": 51.3217,
    "lng": -116.186,
    "image": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80",
    "highlights": [
      "Golden larch trees in autumn",
      "Minnestimma Lakes",
      "Valley of the Ten Peaks views"
    ],
    "trailhead": "Moraine Lake",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": true,
    "status": "unknown",
    "transitRoute": "Seasonal transport to Moraine Lake — verify reservation and return"
  },

  // ── Lake Louise Challenging ───────────────────────────────────────────

  {
    id: 'saddleback-pass',
    name: 'Saddleback Pass',
    slug: 'saddleback-pass',
    description:
      'A steep climb from Lake Louise to a high alpine pass between Mount Temple and Fairview Mountain.',
    longDescription:
      'The Saddleback Pass trail rises steeply from the shores of Lake Louise through dense forest and alpine meadows to reach a windswept pass wedged between Mount Temple and Fairview Mountain. At the pass, views open in both directions — back over Lake Louise and the Bow Valley, and forward into the remote Sheol Valley. The trail is the starting point for the Fairview Mountain summit scramble and connects to Paradise Valley via the Sheol connector.',
    difficulty: 'challenging',
    distance: '3.6 km one way',
    elevationGain: '600 m',
    elevationLoss: '30 m',
    time: '3-4 hrs',
    season: 'summer',
    type: 'trail',
    area: 'Lake Louise',
    lat: 51.4167,
    lng: -116.1773,
    image:
      'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=600&q=80',
    highlights: [
      'High alpine pass',
      'Mount Temple and Fairview views',
      'Connects to Paradise Valley',
    ],
    trailhead: 'Lake Louise parking',
    parksCanadaUrl:
      'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
    transitAccessible: false,
  
    status: 'unknown',
  },
  {
    id: 'fairview-mountain',
    name: 'Fairview Mountain',
    slug: 'fairview-mountain',
    description:
      'A demanding summit hike offering one of the most expansive panoramas in the Lake Louise area.',
    longDescription:
      'Beyond Saddleback Pass, the Fairview Mountain summit route climbs steep, loose mountain terrain. This is a substantially different commitment from a lakeshore walk or the separate Fairview Lookout trail. Use the current official description and assess route-finding, footing, weather and turnaround needs; fitness and fair weather alone do not establish suitable access.',
    difficulty: 'challenging',
    distance: '5 km one way',
    elevationGain: '990 m',
    elevationLoss: '85 m',
    time: '5-6 hrs',
    season: 'summer',
    type: 'trail',
    area: 'Lake Louise',
    lat: 51.4167,
    lng: -116.1773,
    image:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
    highlights: [
      'Summit at nearly 2,745 m',
      'Lake Louise bird\'s-eye view',
      'Bow Range and Ten Peaks panorama',
    ],
    trailhead: 'Lake Louise parking',
    parksCanadaUrl:
      'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
    transitAccessible: false,
  
    status: 'unknown',
  },
  {
    id: 'sheol-paradise-connector',
    name: 'Sheol/Paradise Connector',
    slug: 'sheol-paradise-connector',
    description:
      'A connecting trail between Saddleback Pass and Paradise Valley, descending steeply through the Sheol Valley.',
    longDescription:
      'This connector trail links Saddleback Pass to Paradise Valley, dropping quickly through the rugged Sheol Valley. It allows strong hikers to create a point-to-point route combining Lake Louise, Saddleback, and Paradise Valley into one epic traverse. The descent is steep and the terrain rough, requiring sure footing and confidence on loose ground. The reward is a complete tour of the Lake Louise area\'s most dramatic alpine landscapes.',
    difficulty: 'challenging',
    distance: '3.9 km one way',
    elevationGain: '85 m',
    elevationLoss: '540 m',
    time: '1-2 hrs',
    season: 'summer',
    type: 'trail',
    area: 'Lake Louise',
    lat: 51.3750,
    lng: -116.2200,
    image:
      'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=600&q=80',
    highlights: [
      'Saddleback to Paradise Valley link',
      'Sheol Valley traverse',
      'Epic point-to-point routing',
    ],
    trailhead: 'Saddleback Pass / Paradise Valley trailhead',
    parksCanadaUrl:
      'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
    transitAccessible: false,
  
    status: 'unknown',
  },
  {
    id: 'paradise-valley-giant-steps',
    name: 'Paradise Valley and Giant Steps',
    slug: 'paradise-valley-giant-steps',
    description:
      'A full-day journey through a stunning alpine valley to the Giant Steps waterfall beneath Mount Temple.',
    longDescription:
      'Paradise Valley lives up to its name with a long trail winding through pristine forest and alpine meadows to reach the Giant Steps — a dramatic tiered waterfall cascading over massive rock slabs. Mount Temple, the highest peak in the Lake Louise area, towers above the valley floor. The full circuit is a demanding all-day outing that passes through some of the most spectacular and unspoiled landscape in the park.',
    difficulty: 'challenging',
    distance: '9.8 km one way',
    elevationGain: '595 m',
    elevationLoss: '255 m',
    time: '7-8 hrs',
    season: 'summer',
    type: 'trail',
    area: 'Lake Louise',
    lat: 51.3750,
    lng: -116.2200,
    image:
      'https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=600&q=80',
    highlights: [
      'Giant Steps waterfall',
      'Mount Temple views',
      'Pristine alpine valley',
    ],
    trailhead: 'Paradise Valley trailhead',
    parksCanadaUrl:
      'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
    transitAccessible: false,
  
    status: 'unknown',
  },
  {
    id: 'sentinel-pass-from-paradise-valley',
    name: 'Sentinel Pass from Paradise Valley',
    slug: 'sentinel-pass-from-paradise-valley',
    description:
      'The long approach to Sentinel Pass from Paradise Valley, gaining over 1,100 metres through stunning alpine terrain.',
    longDescription:
      'Approaching Sentinel Pass from the Paradise Valley side adds significant distance and elevation to this already challenging objective. The trail winds through the full length of Paradise Valley before ascending steeply to one of the highest trail-accessible passes in the Canadian Rockies at 2,611 metres. This route offers a completely different perspective from the Moraine Lake approach and rewards the extra effort with a through-hike option connecting two iconic valleys.',
    difficulty: 'challenging',
    distance: '14.2 km one way',
    elevationGain: '1160 m',
    elevationLoss: '670 m',
    time: '9-10 hrs',
    season: 'summer',
    type: 'trail',
    area: 'Lake Louise',
    lat: 51.3750,
    lng: -116.2200,
    image:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
    highlights: [
      'Highest trail-accessible pass in the Rockies',
      'Through-hike to Moraine Lake',
      'Over 1,100 m of elevation gain',
    ],
    trailhead: 'Paradise Valley trailhead',
    parksCanadaUrl:
      'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
    transitAccessible: false,
  
    status: 'unknown',
  },
  {
    "id": "sentinel-pass-via-larch-valley",
    "name": "Sentinel Pass via Larch Valley",
    "slug": "sentinel-pass-via-larch-valley",
    "description": "The classic approach to Sentinel Pass through golden larch forest from Moraine Lake.",
    "longDescription": "The most popular route to Sentinel Pass follows the Larch Valley trail from Moraine Lake, climbing through forests that blaze gold in September before ascending the final steep scree slope to the pass at 2,611 metres. At the top, hikers stand between Pinnacle Mountain and Mount Temple with staggering views in every direction — down into Paradise Valley on one side and back to the Ten Peaks on the other. This is one of the most iconic high-alpine experiences in Canada.",
    "difficulty": "challenging",
    "distance": "5.6 km one way",
    "elevationGain": "750 m",
    "elevationLoss": "50 m",
    "time": "4.5-5.5 hrs",
    "season": "summer",
    "type": "trail",
    "area": "Lake Louise",
    "lat": 51.3217,
    "lng": -116.186,
    "image": "https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=600&q=80",
    "highlights": [
      "Pass at 2,611 m elevation",
      "Golden larch forest in autumn",
      "Views into Paradise Valley and Ten Peaks"
    ],
    "trailhead": "Moraine Lake",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": true,
    "status": "unknown",
    "transitRoute": "Seasonal transport to Moraine Lake — verify reservation and return"
  },
  {
    "id": "wenkchemna-pass",
    "name": "Wenkchemna Pass",
    "slug": "wenkchemna-pass",
    "description": "A demanding high-alpine route through the Valley of Ten Peaks to a remote pass on the Continental Divide.",
    "longDescription": "Wenkchemna Pass sits at the head of the legendary Valley of the Ten Peaks, reached by a long and challenging trail from Moraine Lake. The route passes through the Eiffel Lake area before continuing into increasingly remote and barren terrain where glaciers and scree dominate the landscape. At the pass, hikers stand on the Continental Divide with views stretching deep into Kootenay National Park — a truly wild and unforgettable destination.",
    "difficulty": "challenging",
    "distance": "9.6 km one way",
    "elevationGain": "1010 m",
    "elevationLoss": "265 m",
    "time": "7-8 hrs",
    "season": "summer",
    "type": "trail",
    "area": "Lake Louise",
    "lat": 51.3217,
    "lng": -116.186,
    "image": "https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=600&q=80",
    "highlights": [
      "Continental Divide crossing",
      "Valley of the Ten Peaks",
      "Remote glacial landscape"
    ],
    "trailhead": "Moraine Lake",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": true,
    "status": "unknown",
    "transitRoute": "Seasonal transport to Moraine Lake — verify reservation and return"
  },
  {
    "id": "hidden-lake",
    "name": "Hidden Lake",
    "slug": "hidden-lake",
    "description": "A challenging backcountry trail to a secluded alpine lake near the Skoki area east of Lake Louise.",
    "longDescription": "Hidden Lake lives up to its name, tucked away in a remote basin accessible via a lengthy trail from Fish Creek parking. The route climbs through dense forest and crosses alpine meadows before descending to the hidden shores of this peaceful lake. Early starts are recommended for this full-day commitment.",
    "difficulty": "challenging",
    "distance": "8.5 km one way",
    "elevationGain": "700 m",
    "elevationLoss": "80 m",
    "time": "6-7 hrs",
    "season": "summer",
    "type": "lake",
    "area": "Lake Louise",
    "lat": 51.438,
    "lng": -116.157,
    "image": "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&q=80",
    "highlights": [
      "Secluded alpine lake",
      "Skoki backcountry access"
    ],
    "trailhead": "Fish Creek parking, Whitehorn Road",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": false,
    "status": "unknown"
  },
  {
    id: 'deception-pass',
    name: 'Deception Pass',
    slug: 'deception-pass',
    description:
      'A long backcountry trail providing access to the renowned Skoki area via a high mountain pass.',
    longDescription:
      'Deception Pass serves as the main gateway to the historic Skoki Lodge and surrounding backcountry, climbing from Fish Creek parking through varied terrain to a high pass with views across the Slate Range. The trail passes through subalpine forest, open meadows, and barren alpine zones, providing a cross-section of Rocky Mountain ecosystems in a single day. Strong hikers can make it a day trip, though many use it as the start of a multi-day Skoki adventure.',
    difficulty: 'challenging',
    distance: '11.5 km one way',
    elevationGain: '835 m',
    elevationLoss: '140 m',
    time: '8-9 hrs',
    season: 'summer',
    type: 'trail',
    area: 'Lake Louise',
    lat: 51.4380,
    lng: -116.1570,
    image:
      'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=600&q=80',
    highlights: [
      'Gateway to Skoki Lodge',
      'High mountain pass views',
      'Multi-day backcountry access',
    ],
    trailhead: 'Fish Creek parking, Whitehorn Road',
    parksCanadaUrl:
      'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
    transitAccessible: false,
  
    status: 'unknown',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CASTLE JUNCTION AREA (3 unique trails)
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: 'castle-lookout',
    name: 'Castle Lookout',
    slug: 'castle-lookout',
    description:
      'A steep climb to a historic fire lookout site with panoramic views of the Bow Valley and Castle Mountain.',
    longDescription:
      'The Castle Lookout trail climbs steadily from the Bow Valley Parkway through dense forest to the site of a former fire lookout perched on a rocky promontory. The views from the top are outstanding, encompassing the massive wall of Castle Mountain, the Bow Valley stretching in both directions, and the distant peaks of the Continental Divide. The concentrated elevation gain makes this a satisfying half-day outing for moderate hikers.',
    difficulty: 'moderate',
    distance: '3.7 km one way',
    elevationGain: '520 m',
    elevationLoss: '0 m',
    time: '3-4 hrs',
    season: 'summer',
    type: 'viewpoint',
    area: 'Castle Junction',
    lat: 51.2400,
    lng: -115.9000,
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
    highlights: [
      'Historic fire lookout site',
      'Castle Mountain panorama',
      'Bow Valley views in both directions',
    ],
    trailhead: '5 km west of Castle Junction on Bow Valley Parkway',
    parksCanadaUrl:
      'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
    transitAccessible: false,
  
    status: 'unknown',
  },
  {
    "id": "stanley-glacier",
    "name": "Stanley Glacier",
    "slug": "stanley-glacier",
    "description": "A Kootenay National Park mountain hike from Highway 93 South to an alpine basin below Stanley Glacier.",
    "longDescription": "Stanley Glacier is in Kootenay National Park, British Columbia. Its trailhead is on Highway 93 South; it is not a Banff town trail or an extension reached by walking across the park boundary. The current Parks Canada Kootenay guide lists 4.9 km one way, 405 m of cumulative ascent and 115 m of descent, with an estimated three-hour return outing.\n\nThe trail leads through forest and into an alpine basin beneath high rock walls and the glacier. Keep to the official route and choose a turnaround suited to conditions. A guided Burgess Shale fossil hike is a separately arranged programme, not an inclusion with an independent hike. Older route figures differ from the current guide, so check the route description and report before travelling.",
    "difficulty": "moderate",
    "distance": "4.9 km one way (9.8 km return)",
    "elevationGain": "405 m one way",
    "elevationLoss": "115 m one way",
    "time": "About 3 hrs return (Parks guide)",
    "season": "summer",
    "type": "trail",
    "area": "Kootenay",
    "lat": 51.20567,
    "lng": -116.081,
    "image": "https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=600&q=80",
    "highlights": [
      "Stanley Glacier views",
      "Fire-regenerated forest",
      "Hanging valley landscape"
    ],
    "trailhead": "Stanley Glacier parking lot, Highway 93 South, Kootenay National Park",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/bc/kootenay/activ/randonnee-hike/jour-day",
    "transitAccessible": false,
    "status": "unknown",
    "park": "Kootenay National Park",
    "province": "British Columbia",
    "accessNote": "Plan the Highway 93 South journey and check DriveBC as well as Parks Canada bulletins. No direct public-transit connection is verified here.",
    "winterNote": "This is a summer hiking description. Snow-covered mountain terrain needs separate winter planning; the summer difficulty grade is not a winter suitability rating.",
    "reviewedAt": "2026-10-28",
    "sourceUrls": [
      { "label": "Official tourism indicative location", "url": "https://www.banfflakelouise.com/experiences/stanley-glacier-trail" },
      { "label": "Parks Canada guided fossil hike (separate programme)", "url": "https://parks.canada.ca/pn-np/bc/kootenay/activ/burgess/stanley" },
      {
        "label": "Official route information",
        "url": "https://parks.canada.ca/pn-np/bc/kootenay/activ/randonnee-hike/jour-day"
      }
    ]
  },
  {
    "id": "taylor-lake",
    "name": "Taylor Lake",
    "slug": "taylor-lake",
    "description": "A challenging climb through dense forest to a pristine alpine lake with optional side trip to O'Brien Lake.",
    "longDescription": "Taylor Lake involves a sustained forest climb to an alpine lake and meadows. Check the complete return distance, cumulative climbing, weather and daylight before starting. An O’Brien Lake extension is a separate route choice with additional time and distance; consult current official information rather than assuming it is included in the base outing.",
    "difficulty": "challenging",
    "distance": "6.3 km one way",
    "elevationGain": "585 m",
    "elevationLoss": "0 m",
    "time": "4-5 hrs",
    "season": "summer",
    "type": "lake",
    "area": "Castle Junction",
    "lat": 51.345,
    "lng": -116.18,
    "image": "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&q=80",
    "highlights": [
      "Pristine alpine cirque lake",
      "Optional O'Brien Lake side trip"
    ],
    "trailhead": "Taylor Creek day use",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": false,
    "status": "unknown"
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ICEFIELDS PARKWAY (16 trails)
  // ═══════════════════════════════════════════════════════════════════════

  // ── Icefields Parkway Easy ────────────────────────────────────────────

  {
    "id": "peyto-lake-viewpoint",
    "name": "Peyto Lake Viewpoint",
    "slug": "peyto-lake-viewpoint",
    "description": "A short uphill route to Peyto Lake Lookout, with a separate barrier-free approach from the upper parking area.",
    "longDescription": "Parks Canada lists the main Peyto Lake Lookout route as 0.6 km one way from the parking area, with 30 m of ascent and 10 m of descent. The short barrier-free approach is a different 0.3 km route from the upper parking lot. Do not treat the entire main approach as level or assume the same access arrangements for every vehicle.\n\nThis is a viewpoint above the lake, separate from the difficult Peyto Lake shore trail and the longer Bow Summit Viewpoint route. Check current parking, access and conditions before selecting an outing.",
    "difficulty": "easy",
    "distance": "0.6 km one way (main lookout approach)",
    "elevationGain": "30 m",
    "elevationLoss": "10 m",
    "time": "About 30 min return",
    "season": "summer",
    "type": "viewpoint",
    "area": "Icefields Parkway",
    "lat": 51.7253,
    "lng": -116.5092,
    "image": "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&q=80",
    "highlights": [
      "Peyto Lake viewing platform",
      "Separate upper-lot accessible approach",
      "Distinct from the shore trail"
    ],
    "trailhead": "Peyto Lake parking lot, 40 km N of Lake Louise junction",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": false,
    "status": "unknown",
    "winterNote": "Snow changes the approach and the upper road may be unplowed. Read the official winter viewpoint route and current conditions rather than following summer accessibility descriptions.",
    "reviewedAt": "2026-10-28",
    "sourceUrls": [
      {
        "label": "Official route information",
        "url": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking"
      }
    ]
  },
  {
    id: 'bow-summit-viewpoint',
    name: 'Bow Summit Viewpoint',
    slug: 'bow-summit-viewpoint',
    description:
      'An extended trail beyond the Peyto Lake viewpoint to higher vantage points along Bow Summit.',
    longDescription:
      'Going beyond the main Peyto Lake viewpoint, the Bow Summit trail climbs through alpine meadows and sparse tree cover to reach higher vantage points with expanding views of the Mistaya River valley, Bow Glacier, and the surrounding Waputik Range. The additional elevation provides perspectives unavailable from the main platform and gives hikers a taste of above-treeline hiking with relatively modest effort. Wildflowers carpet the meadows in July and August.',
    difficulty: 'easy',
    distance: '3 km one way',
    elevationGain: '310 m',
    elevationLoss: '95 m',
    time: '2.5 hrs',
    season: 'summer',
    type: 'viewpoint',
    area: 'Icefields Parkway',
    lat: 51.7269,
    lng: -116.4975,
    image:
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80',
    highlights: [
      'Extended Peyto Lake panorama',
      'Waputik Range views',
      'Alpine meadow wildflowers',
    ],
    trailhead: 'Peyto Lake parking lot, 40 km N of Lake Louise junction',
    parksCanadaUrl:
      'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
    transitAccessible: false,
  
    status: 'unknown',
  },
  {
    id: 'mistaya-canyon',
    name: 'Mistaya Canyon',
    slug: 'mistaya-canyon',
    description:
      'A brief walk to a powerful canyon where the Mistaya River thunders through carved limestone.',
    longDescription:
      'One of the easiest and most dramatic stops on the Icefields Parkway, Mistaya Canyon is reached by a short downhill walk from the parking area. The Mistaya River has carved a deep, narrow gorge through the limestone, creating swirling potholes and smooth curved walls that demonstrate millennia of water erosion. The bridge spanning the canyon provides vertiginous views straight down into the churning turquoise water.',
    difficulty: 'easy',
    distance: '0.5 km one way',
    elevationGain: '10 m',
    elevationLoss: '30 m',
    time: '30 min',
    season: 'summer',
    type: 'trail',
    area: 'Icefields Parkway',
    lat: 51.8084,
    lng: -116.5439,
    image:
      'https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=600&q=80',
    highlights: [
      'Carved limestone gorge',
      'Swirling turquoise potholes',
      'Bridge over the canyon',
    ],
    trailhead: 'Mistaya Canyon parking, 72 km N of Lake Louise junction',
    parksCanadaUrl:
      'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
    transitAccessible: false,
  
    status: 'unknown',
  },

  // ── Icefields Parkway Moderate ────────────────────────────────────────

  {
    "id": "bow-glacier-falls",
    "name": "Bow Glacier Falls",
    "slug": "bow-glacier-falls",
    "description": "A scenic trail from Bow Lake to the waterfall at the toe of the Bow Glacier, source of the Bow River.",
    "longDescription": "Starting from the historic Num-Ti-Jah Lodge on the shore of Bow Lake, this trail follows the lakeshore before climbing along glacial moraines to a powerful waterfall fed by meltwater from the Bow Glacier above. This is the birthplace of the Bow River, which flows all the way through Banff and Calgary to the prairies. The combination of a glacier-fed waterfall, turquoise lake, and historic lodge creates one of the most complete mountain experiences on the Icefields Parkway.",
    "difficulty": "moderate",
    "distance": "3.8 km one way (7.6 km return)",
    "elevationGain": "95 m one way",
    "elevationLoss": "20 m one way",
    "time": "About 3 hrs return",
    "season": "summer",
    "type": "trail",
    "area": "Icefields Parkway",
    "lat": 51.671,
    "lng": -116.4492,
    "image": "https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=600&q=80",
    "highlights": [
      "Source of the Bow River",
      "Bow Glacier waterfall",
      "Historic Num-Ti-Jah Lodge"
    ],
    "trailhead": "Bow Lake parking, 36 km N of Lake Louise junction",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": false,
    "status": "unknown",
    "reviewedAt": "2026-10-28",
    "sourceUrls": [
      {
        "label": "Official route information",
        "url": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking"
      }
    ]
  },
  {
    id: 'helen-lake',
    name: 'Helen Lake',
    slug: 'helen-lake',
    description:
      'A sustained climb through subalpine forest to expansive alpine meadows and a pristine glacial lake.',
    longDescription:
      'Helen Lake is one of the finest moderate day hikes on the Icefields Parkway, climbing steadily through subalpine forest before bursting into vast alpine meadows where marmots whistle and wildflowers bloom in profusion. The lake itself sits in a dramatic cirque beneath Cirque Peak, its waters reflecting the surrounding rock walls and patches of permanent snow. Mountain goats, pikas, and even grizzly bears frequent the alpine meadows, making wildlife viewing a highlight.',
    difficulty: 'moderate',
    distance: '5.9 km one way',
    elevationGain: '530 m',
    elevationLoss: '90 m',
    time: '4-5 hrs',
    season: 'summer',
    type: 'lake',
    area: 'Icefields Parkway',
    lat: 51.6840,
    lng: -116.5120,
    image:
      'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&q=80',
    highlights: [
      'Alpine meadow wildflowers',
      'Pristine glacial lake',
      'Wildlife viewing opportunities',
    ],
    trailhead: '33 km N of Lake Louise junction',
    parksCanadaUrl:
      'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
    transitAccessible: false,
  
    status: 'unknown',
  },
  {
    "id": "cirque-lake",
    "name": "Cirque Lake",
    "slug": "cirque-lake",
    "description": "A moderate hike from Waterfowl Campground to a scenic lake nestled in an alpine cirque.",
    "longDescription": "The Cirque Lake outing starts in the Waterfowl Lakes area and climbs through forest towards an alpine lake. Use the official map and current report for the route and junctions, and plan the full return distance with the group. Choose the outing for its actual demands rather than a promised crowd reduction.",
    "difficulty": "moderate",
    "distance": "4.6 km one way",
    "elevationGain": "210 m",
    "elevationLoss": "100 m",
    "time": "3 hrs",
    "season": "summer",
    "type": "lake",
    "area": "Icefields Parkway",
    "lat": 51.84,
    "lng": -116.56,
    "image": "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&q=80",
    "highlights": [
      "Classic glacial cirque setting",
      "Alpine lake beneath towering walls",
      "Waterfowl Lakes approach"
    ],
    "trailhead": "Waterfowl Campground, 57.5 km N of Lake Louise junction",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": false,
    "status": "unknown"
  },
  {
    "id": "chephren-lake",
    "name": "Chephren Lake",
    "slug": "chephren-lake",
    "description": "A forested trail to a dramatic lake backed by the pyramidal form of Howse Peak.",
    "longDescription": "The route to Chephren Lake starts in the Waterfowl Lakes area and travels through forest towards a mountain lake. Check the official map for the junctions, full return distance and current surface conditions. Its distance and moderate grade are planning descriptions, not a guarantee of quiet conditions or an easy snow-season walk.",
    "difficulty": "moderate",
    "distance": "4.1 km one way",
    "elevationGain": "140 m",
    "elevationLoss": "75 m",
    "time": "3 hrs",
    "season": "summer",
    "type": "lake",
    "area": "Icefields Parkway",
    "lat": 51.84,
    "lng": -116.56,
    "image": "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&q=80",
    "highlights": [
      "Howse Peak backdrop",
      "Deep alpine lake",
      "Waterfowl Lakes approach"
    ],
    "trailhead": "Waterfowl Campground, 57.5 km N of Lake Louise junction",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": false,
    "status": "unknown"
  },
  {
    id: 'nigel-pass',
    name: 'Nigel Pass',
    slug: 'nigel-pass',
    description:
      'A scenic alpine pass hike through meadows with views stretching into the remote Brazeau River valley.',
    longDescription:
      'Nigel Pass offers one of the most rewarding moderate hikes in the northern reaches of Banff National Park, climbing gradually through open meadows to a broad pass with views stretching into the wild and remote Brazeau River valley. The approach crosses several creek drainages and passes through terrain frequented by bighorn sheep and mountain goats. At the pass, the sense of vast wilderness is palpable, with peaks and valleys extending to the horizon in every direction.',
    difficulty: 'moderate',
    distance: '7.3 km one way',
    elevationGain: '395 m',
    elevationLoss: '60 m',
    time: '5 hrs',
    season: 'summer',
    type: 'trail',
    area: 'Icefields Parkway',
    lat: 52.0540,
    lng: -116.8700,
    image:
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80',
    highlights: [
      'Brazeau River valley views',
      'Bighorn sheep habitat',
      'Vast alpine wilderness',
    ],
    trailhead: '37 km N of Saskatchewan Crossing',
    parksCanadaUrl:
      'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
    transitAccessible: false,
  
    status: 'unknown',
  },
  {
    id: 'parker-ridge',
    name: 'Parker Ridge',
    slug: 'parker-ridge',
    description:
      'A short above-treeline trail revealing a stunning panorama of the Saskatchewan Glacier and Columbia Icefield outflow.',
    longDescription:
      'Parker Ridge is one of the most rewarding short hikes in the Canadian Rockies, climbing above the treeline in just a few kilometres to reveal the immense Saskatchewan Glacier — the largest outflow of the Columbia Icefield. Wildflowers carpet the exposed ridgeline in summer while the glacier and surrounding peaks create an icescape of breathtaking scale. The trail is exposed to weather, so layers are essential, but on a clear day the views are absolutely world-class.',
    difficulty: 'moderate',
    distance: '2.7 km one way',
    elevationGain: '305 m',
    elevationLoss: '45 m',
    time: '2.5 hrs',
    season: 'summer',
    type: 'trail',
    area: 'Icefields Parkway',
    lat: 51.9828,
    lng: -116.8350,
    image:
      'https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=600&q=80',
    highlights: [
      'Saskatchewan Glacier viewpoint',
      'Above-treeline alpine tundra',
      'Wildflower-covered ridgeline',
    ],
    trailhead: 'Parker Ridge parking, 40 km N of Saskatchewan Crossing',
    parksCanadaUrl:
      'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
    transitAccessible: false,
  
    status: 'unknown',
  },

  // ── Icefields Parkway Challenging ─────────────────────────────────────

  {
    id: 'molar-pass',
    name: 'Molar Pass',
    slug: 'molar-pass',
    description:
      'A challenging backcountry trail climbing to a high pass with sweeping views near Mosquito Creek.',
    longDescription:
      'The Molar Pass trail ascends from near the Mosquito Creek Campground through dense forest and alpine meadows to a broad pass offering expansive views across the front ranges and into the remote backcountry beyond. The sustained elevation gain demands good fitness, but the reward is a genuine sense of wilderness immersion that few trails along the Icefields Parkway can match. Marmots and pikas inhabit the rocky terrain near the pass.',
    difficulty: 'challenging',
    distance: '9.8 km one way',
    elevationGain: '560 m',
    elevationLoss: '35 m',
    time: '7-8 hrs',
    season: 'summer',
    type: 'trail',
    area: 'Icefields Parkway',
    lat: 51.5900,
    lng: -116.4300,
    image:
      'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=600&q=80',
    highlights: [
      'Expansive front range views',
      'Remote backcountry atmosphere',
      'Alpine marmot and pika habitat',
    ],
    trailhead: 'Near Mosquito Creek Campground, 24 km N of Lake Louise junction',
    parksCanadaUrl:
      'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
    transitAccessible: false,
  
    status: 'unknown',
  },
  {
    "id": "north-molar-pass",
    "name": "North Molar Pass",
    "slug": "north-molar-pass",
    "description": "An extended version of the Molar Pass trail pushing deeper into remote alpine terrain.",
    "longDescription": "North Molar Pass extends the Molar Pass route further into the alpine, gaining nearly 800 metres of elevation through increasingly barren and windswept terrain. The pass offers sweeping views of the Molar Creek valley and distant peaks that define the northern boundaries of Banff National Park.",
    "difficulty": "challenging",
    "distance": "11.5 km one way",
    "elevationGain": "795 m",
    "elevationLoss": "30 m",
    "time": "8-9 hrs",
    "season": "summer",
    "type": "trail",
    "area": "Icefields Parkway",
    "lat": 51.59,
    "lng": -116.43,
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
    "highlights": [
      "Nearly 800 m elevation gain",
      "Remote Molar Creek valley views"
    ],
    "trailhead": "Near Mosquito Creek Campground, 24 km N of Lake Louise junction",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": false,
    "status": "unknown"
  },
  {
    id: 'dolomite-pass',
    name: 'Dolomite Pass',
    slug: 'dolomite-pass',
    description:
      'A challenging trail to a high alpine pass with views of the Dolomite Peak massif and surrounding glaciers.',
    longDescription:
      'Dolomite Pass climbs through subalpine forest and open meadows to a dramatic high pass beneath the rugged Dolomite Peak massif. The route passes several small tarns and crosses terrain where glacial remnants and alpine wildflowers coexist. At the pass, views stretch across a vast expanse of peaks and valleys, with the Waputik Icefield visible in the distance. This demanding hike rewards with some of the finest high-alpine scenery along the Icefields Parkway corridor.',
    difficulty: 'challenging',
    distance: '8.9 km one way',
    elevationGain: '655 m',
    elevationLoss: '215 m',
    time: '6-7 hrs',
    season: 'summer',
    type: 'trail',
    area: 'Icefields Parkway',
    lat: 51.6840,
    lng: -116.5120,
    image:
      'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=600&q=80',
    highlights: [
      'Dolomite Peak massif views',
      'Alpine tarns and meadows',
      'Waputik Icefield panorama',
    ],
    trailhead: '33 km N of Lake Louise junction',
    parksCanadaUrl:
      'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
    transitAccessible: false,
  
    status: 'unknown',
  },
  {
    "id": "peyto-lake-shore",
    "name": "Peyto Lake Trail (Shore)",
    "slug": "peyto-lake-shore",
    "description": "An officially listed difficult summer trail descending from Peyto Lookout to the lake, separate from the short lookout walk.",
    "longDescription": "Parks Canada lists Peyto Lake Trail as a difficult route beginning at Peyto Lookout. It is a steep, rough outing for experienced hikers, rather than the short walk to the viewing platform. The official figures are 1.3 km one way, 30 m of cumulative ascent and 240 m of descent, with about two hours for the return outing.\n\nThe climb back is part of the trip. The lookout approach and any additional wandering also need to be allowed for. Check the current trail report, remain on the designated route and use the official map; this page does not provide an off-trail shortcut or a verified navigation line.",
    "difficulty": "challenging",
    "distance": "1.3 km one way from Peyto Lookout",
    "elevationGain": "30 m one way",
    "elevationLoss": "240 m one way",
    "time": "About 2 hrs return; add lookout approach",
    "season": "summer",
    "type": "lake",
    "area": "Icefields Parkway",
    "lat": 51.7253,
    "lng": -116.5092,
    "image": "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&q=80",
    "highlights": [
      "Official difficult summer route",
      "Descent and return climb",
      "Separate from Peyto Lookout walk"
    ],
    "trailhead": "Peyto Lake parking lot",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": false,
    "status": "unknown",
    "accessNote": "Use the official Peyto Lake parking and route instructions on the Icefields Parkway. The marker on this page is an indicative parking-area location, not the start of a mapped descent.",
    "winterNote": "This steep summer route is not presented as a winter walk. Use the official winter viewpoint information when planning a snow-season stop.",
    "reviewedAt": "2026-10-28",
    "sourceUrls": [
      {
        "label": "Official route information",
        "url": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking"
      }
    ]
  },
  {
    "id": "glacier-lake",
    "name": "Glacier Lake",
    "slug": "glacier-lake",
    "description": "A long forested trail to one of the largest backcountry lakes in Banff, near Saskatchewan Crossing.",
    "longDescription": "Glacier Lake is a long return outing through forest near Saskatchewan River Crossing. A modest net elevation change does not describe every climb or descent along the trail. Plan the full distance, weather, daylight and emergency arrangements before starting, and use the current official route description and trail report.",
    "difficulty": "challenging",
    "distance": "8.8 km one way",
    "elevationGain": "260 m",
    "elevationLoss": "275 m",
    "time": "6-7 hrs",
    "season": "summer",
    "type": "lake",
    "area": "Icefields Parkway",
    "lat": 51.901,
    "lng": -116.696,
    "image": "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&q=80",
    "highlights": [
      "One of Banff's largest backcountry lakes",
      "Glaciated peak backdrop",
      "True wilderness lake experience"
    ],
    "trailhead": "1 km N of Saskatchewan Crossing",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": false,
    "status": "unknown"
  },
  {
    id: 'sunset-lookout',
    name: 'Sunset Lookout',
    slug: 'sunset-lookout',
    description:
      'A steep climb to a former fire lookout with dramatic views over the North Saskatchewan River valley.',
    longDescription:
      'The Sunset Lookout trail climbs aggressively from the valley floor through dense forest to the site of a former fire lookout, where stunning views unfold over the North Saskatchewan River valley and the surrounding peaks. Named for the spectacular light show that paints the western peaks in the evening, this trail rewards strong hikers with one of the most scenic viewpoints along the Icefields Parkway. The concentrated elevation gain makes it a satisfying half-day challenge.',
    difficulty: 'challenging',
    distance: '4.5 km one way',
    elevationGain: '615 m',
    elevationLoss: '90 m',
    time: '3-4 hrs',
    season: 'summer',
    type: 'viewpoint',
    area: 'Icefields Parkway',
    lat: 51.9400,
    lng: -116.6700,
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
    highlights: [
      'Former fire lookout site',
      'North Saskatchewan River valley panorama',
      'Dramatic sunset lighting',
    ],
    trailhead: 'Sunset Pass parking, 16.5 km N of Saskatchewan Crossing',
    parksCanadaUrl:
      'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
    transitAccessible: false,
  
    status: 'unknown',
  },
  {
    id: 'sunset-pass',
    name: 'Sunset Pass',
    slug: 'sunset-pass',
    description:
      'An extension beyond Sunset Lookout climbing to a high mountain pass with expansive alpine views.',
    longDescription:
      'Continuing past the Sunset Lookout, this trail pushes into increasingly open alpine terrain before reaching Sunset Pass, a broad saddle with views stretching across the backcountry of Banff\'s northern reaches. The additional elevation beyond the lookout takes hikers above the treeline where the landscape becomes stark and beautiful, with wind-sculpted rock and sparse alpine vegetation. This full-day hike combines the lookout viewpoint with genuine high-alpine exploration.',
    difficulty: 'challenging',
    distance: '8.1 km one way',
    elevationGain: '715 m',
    elevationLoss: '40 m',
    time: '6-7 hrs',
    season: 'summer',
    type: 'trail',
    area: 'Icefields Parkway',
    lat: 51.9400,
    lng: -116.6700,
    image:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
    highlights: [
      'High alpine pass',
      'Above-treeline exploration',
      'Northern Banff backcountry views',
    ],
    trailhead: 'Sunset Pass parking, 16.5 km N of Saskatchewan Crossing',
    parksCanadaUrl:
      'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
    transitAccessible: false,
  
    status: 'unknown',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // WINTER TRAILS — Cross-Country Skiing, Snowshoeing, Ice Walks
  // ═══════════════════════════════════════════════════════════════════════

  {
    "id": "cascade-valley-xc-ski",
    "name": "Cascade Valley Cross-Country Ski Trail",
    "slug": "cascade-valley-xc-ski",
    "description": "A designated winter ski route from Lake Minnewanka Day-use Area, with distance chosen by turnaround.",
    "longDescription": "The current Parks Canada winter guide lists 6.3 km one way to Cascade River bridge and 15.1 km one way to Stoney Creek. Choose the intended turnaround before estimating the outing: these are different commitments. Track setting depends on operating conditions and snow; check the current grooming report rather than assuming a freshly prepared trail.\n\nFollow the designated winter trail and activity signs. Plan the journey to Lake Minnewanka Day-use Area and the return transport separately; a summer transit route does not establish winter access.",
    "difficulty": "moderate",
    "distance": "6.3 km one way to Cascade River bridge",
    "elevationGain": "135 m one way to bridge",
    "elevationLoss": "50 m one way to bridge",
    "time": "Depends on turnaround and ski conditions",
    "season": "winter",
    "type": "trail",
    "area": "Banff",
    "lat": 51.2101,
    "lng": -115.5302,
    "image": "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=600&q=80",
    "highlights": [
      "Cascade River bridge turnaround",
      "Longer Stoney Creek option",
      "Current track-setting report required"
    ],
    "trailhead": "Lake Minnewanka Day-use Area parking lot",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/skidefond-xcski/banff",
    "transitAccessible": false,
    "status": "unknown",
    "reviewedAt": "2026-10-28",
    "sourceUrls": [
      {
        "label": "Official route information",
        "url": "https://parks.canada.ca/pn-np/ab/banff/activ/skidefond-xcski/banff"
      }
    ]
  },
  {
    "id": "spray-river-loop-xc-ski",
    "name": "Spray River West Cross-Country Ski",
    "slug": "spray-river-loop-xc-ski",
    "description": "A winter ski outing on Spray River West, with the official bridge turnaround distinguished from a loop.",
    "longDescription": "Parks Canada lists Spray River West as 5.6 km one way from its trailhead past the Fairmont Banff Springs to the Spray River bridge. A return on the same trail is about 11.2 km. Check the current report for track setting, permitted uses and the exact route before skiing; this listing does not assume an East/West loop is prepared.\n\nParks Canada identifies avalanche paths crossing the Spray River corridor 4.5–5 km from the Spray River trailhead. Review the official warning and do not treat a groomed lane or an easy summer grade as eliminating mountain hazards.",
    "difficulty": "moderate",
    "distance": "5.6 km one way (11.2 km return)",
    "elevationGain": "105 m one way",
    "elevationLoss": "70 m one way",
    "time": "Depends on ski conditions and group pace",
    "season": "winter",
    "type": "trail",
    "area": "Banff",
    "lat": 51.1618,
    "lng": -115.5575,
    "image": "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=600&q=80",
    "highlights": [
      "Spray River West route",
      "Bridge turnaround",
      "Avalanche-path warning on official guide"
    ],
    "trailhead": "Spray River West trailhead, past Fairmont Banff Springs",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/skidefond-xcski/banff",
    "transitAccessible": true,
    "transitRoute": "Roam Route 2 to the Fairmont area — verify stop and approach",
    "status": "unknown",
    "reviewedAt": "2026-10-28",
    "sourceUrls": [
      {
        "label": "Official route information",
        "url": "https://parks.canada.ca/pn-np/ab/banff/activ/skidefond-xcski/banff"
      }
    ]
  },
  {
    "id": "tunnel-mountain-winter",
    "name": "Tunnel Mountain Winter Trails",
    "slug": "tunnel-mountain-winter",
    "description": "A designated winter trail network in Tunnel Mountain Trailer Court Campground, with current grooming checked before use.",
    "longDescription": "Parks Canada currently lists 8 km across all Tunnel Mountain winter loops, with no elevation gain in its overview. Choose an actual loop rather than interpreting the total network length as one circuit. The trailhead is at the Trailer Court Campground entrance, with Roam Route 2 noted in the official guide.\n\nCheck whether tracks have been set, which activities are permitted and the day’s surface conditions before travelling. A beginner classification does not guarantee an ice-free surface or prepared snow.",
    "difficulty": "easy",
    "distance": "8 km across all loops",
    "elevationGain": "No elevation gain in official overview",
    "elevationLoss": "Depends on chosen loop",
    "time": "Depends on chosen loop and conditions",
    "season": "winter",
    "type": "trail",
    "area": "Banff",
    "lat": 51.1782,
    "lng": -115.5512,
    "image": "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=600&q=80",
    "highlights": [
      "Choice of winter loops",
      "Campground trail network",
      "Current track-setting information"
    ],
    "trailhead": "Tunnel Mountain Trailer Court Campground entrance",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/skidefond-xcski/banff",
    "transitAccessible": true,
    "transitRoute": "Roam Route 2",
    "status": "unknown",
    "reviewedAt": "2026-10-28",
    "sourceUrls": [
      {
        "label": "Official route information",
        "url": "https://parks.canada.ca/pn-np/ab/banff/activ/skidefond-xcski/banff"
      }
    ]
  },
  {
    "id": "johnston-canyon-ice-walk",
    "name": "Johnston Canyon Ice Walk",
    "slug": "johnston-canyon-ice-walk",
    "description": "Winter planning for Johnston Canyon viewpoints, with current closures and footing checked before choosing a walk.",
    "longDescription": "A Johnston Canyon winter visit uses the designated canyon trail when it is open. Parks Canada lists the Lower Falls at 1.1 km one way and Upper Falls at 2.4 km one way in its current hiking guide. Winter conditions and stop time can change the outing considerably.\n\nSnow, ice and narrow catwalks require an assessment suited to the group. Verify access before reserving a tour or transfer. Read the operator’s actual endpoint, equipment, transport and cancellation terms; a booking does not override a Parks Canada closure.",
    "difficulty": "easy",
    "distance": "Up to 4.8 km return to Upper Falls",
    "elevationGain": "215 m one way to Upper Falls",
    "elevationLoss": "125 m one way to Upper Falls",
    "time": "Allow extra time for winter conditions",
    "season": "winter",
    "type": "trail",
    "area": "Castle Junction",
    "lat": 51.2454,
    "lng": -115.8396,
    "image": "https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=600&q=80",
    "highlights": [
      "Designated canyon viewpoints",
      "Winter footing and access checks",
      "Separate Lower and Upper Falls endpoints"
    ],
    "trailhead": "Johnston Canyon parking lot, Bow Valley Parkway",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": true,
    "status": "unknown",
    "transitRoute": "Roam Route 9 when operating — check the date-specific timetable",
    "winterNote": "Current restrictions govern access. Do not leave catwalks, enter closed sections or walk onto creek ice to reach a viewpoint.",
    "currentNotice": {
      "checkedAt": "2026-10-28",
      "text": "At review, Parks Canada listed a temporary Johnston Canyon closure beginning October 13, 2026, affecting the trail to both falls and the P1 facilities. Check the current notice before planning access; no reopening is assumed here.",
      "url": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking"
    },
    "reviewedAt": "2026-10-28",
    "sourceUrls": [
      {
        "label": "Official route information",
        "url": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking"
      }
    ]
  },
  {
    "id": "lake-louise-lakeshore-snowshoe",
    "name": "Lake Louise Lakeshore Winter Walk",
    "slug": "lake-louise-lakeshore-snowshoe",
    "description": "Winter planning for the designated Lake Louise shoreline route, without assuming access over lake ice.",
    "longDescription": "Parks Canada lists the Lake Louise Lakeshore as a winter walking route, 2.3 km one way. This is a shoreline outing rather than a recommendation to cross the frozen lake. Footwear and equipment depend on the actual surface; confirm the route and conditions with Parks Canada before departing.\n\nNo calendar date guarantees lake ice is suitable for travel. Follow signs and avoid avalanche slopes and the falling-ice area near Louise Falls at the back of the lake. A snowshoe rental or other visitors’ tracks do not establish that an area is safe.",
    "difficulty": "easy",
    "distance": "2.3 km one way (4.6 km return)",
    "elevationGain": "175 m (official winter guide)",
    "elevationLoss": "25 m (official winter guide)",
    "time": "Allow time for actual winter conditions",
    "season": "winter",
    "type": "trail",
    "area": "Lake Louise",
    "lat": 51.41636,
    "lng": -116.21347,
    "image": "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&q=80",
    "highlights": [
      "Designated shoreline route",
      "Winter access checks",
      "No assumed lake-ice crossing"
    ],
    "trailhead": "Fairmont Chateau Lake Louise",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/raquette-snowshoeing/lakelouise",
    "transitAccessible": true,
    "transitRoute": "Roam Route 8X — confirm the current timetable and reservations",
    "status": "unknown",
    "accessNote": "Parks Canada’s lake shuttle is seasonal; no winter service is assumed here. Check Roam’s actual date-specific service between Banff, Lake Louise village and lakeshore.",
    "winterNote": "Stay with the designated winter route and posted restrictions. Lake ice and avalanche terrain require separate assessments.",
    "reviewedAt": "2026-10-28",
    "sourceUrls": [
      { "label": "Official tourism lakeshore location", "url": "https://www.banfflakelouise.com/experiences/hike-lake-louise-lakeshore" },
      {
        "label": "Official route information",
        "url": "https://parks.canada.ca/pn-np/ab/banff/activ/raquette-snowshoeing/lakelouise"
      }
    ]
  },
  {
    "id": "marble-canyon-snowshoe",
    "name": "Marble Canyon Snowshoe",
    "slug": "marble-canyon-snowshoe",
    "description": "A canyon-rim winter visit in Kootenay National Park, subject to the current trail and bridge notices.",
    "longDescription": "Marble Canyon is in Kootenay National Park, British Columbia, reached from Highway 93 South. The current Parks Canada hiking guide lists 0.9 km one way, 65 m of ascent and 35 m of descent. Its summer time estimate does not establish a winter visit duration.\n\nSnow and ice can affect the rim path and bridges. Check the Kootenay trail report and bulletins before travelling, remain on open designated paths and do not enter the canyon or creek bed. No crowd level, maintained winter surface or fixed journey time from Banff is guaranteed here.",
    "difficulty": "easy",
    "distance": "0.9 km one way (1.8 km return)",
    "elevationGain": "65 m one way",
    "elevationLoss": "35 m one way",
    "time": "Depends on winter conditions",
    "season": "winter",
    "type": "trail",
    "area": "Kootenay",
    "lat": 51.1794,
    "lng": -116.1172,
    "image": "https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=600&q=80",
    "highlights": [
      "Kootenay National Park",
      "Designated canyon-rim path",
      "Current bridge and trail notices"
    ],
    "trailhead": "Marble Canyon parking, Highway 93 South",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/bc/kootenay/activ/randonnee-hike/jour-day",
    "transitAccessible": false,
    "status": "unknown",
    "park": "Kootenay National Park",
    "province": "British Columbia",
    "reviewedAt": "2026-10-28",
    "sourceUrls": [
      {
        "label": "Official route information",
        "url": "https://parks.canada.ca/pn-np/bc/kootenay/activ/randonnee-hike/jour-day"
      }
    ]
  },
  {
    "id": "ink-pots-snowshoe",
    "name": "Ink Pots Winter Snowshoe",
    "slug": "ink-pots-snowshoe",
    "description": "Winter planning for the longer Ink Pots outing, requiring its own current route and approach assessment.",
    "longDescription": "The Ink Pots are beyond Johnston Canyon’s Upper Falls. This is a longer outing with additional climbing, rather than an automatic extension of a short canyon visit. The current Parks Canada hiking guide lists 5.5 km one way from the canyon approach; winter time and route conditions require a separate assessment.\n\nCheck the current trail report, weather, winter-route information and any approach closure. Do not enter closed canyon sections or infer a route is suitable from tracks, unfrozen pools or a summer difficulty grade.",
    "difficulty": "moderate",
    "distance": "5.5 km one way on the listed summer approach",
    "elevationGain": "425 m (listed summer approach)",
    "elevationLoss": "215 m (listed summer approach)",
    "time": "Requires separate winter planning",
    "season": "winter",
    "type": "trail",
    "area": "Castle Junction",
    "lat": 51.2455,
    "lng": -115.8388,
    "image": "https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=600&q=80",
    "highlights": [
      "Longer mountain outing",
      "Approach closure checks",
      "Separate from short canyon viewpoints"
    ],
    "trailhead": "Johnston Canyon parking lot, Bow Valley Parkway",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "transitAccessible": false,
    "status": "unknown",
    "currentNotice": {
      "checkedAt": "2026-10-28",
      "text": "At review, Parks Canada listed a temporary Johnston Canyon closure beginning October 13, 2026, affecting the trail to both falls and the P1 facilities. Check the current notice before planning access; no reopening is assumed here.",
      "url": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking"
    },
    "reviewedAt": "2026-10-28",
    "sourceUrls": [
      {
        "label": "Official route information",
        "url": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking"
      }
    ]
  },
  {
    "id": "goat-creek-xc-ski",
    "name": "Goat Creek Cross-Country Ski Trail",
    "slug": "goat-creek-xc-ski",
    "description": "A point-to-point winter ski route between Goat Creek above Canmore and Spray River West near Banff.",
    "longDescription": "Parks Canada lists Goat Creek and Spray River as a 19 km one-way route. It is track set when conditions allow, and can be travelled in either direction; the guide notes that many visitors start at the Goat Creek trailhead above Canmore and descend much of the way towards Banff.\n\nArrange the vehicle shuttle or other confirmed return before starting. The endpoint is Spray River West behind the Fairmont Banff Springs, rather than an assumed pickup on the winter-closed Golf Course Road. Review the official avalanche-path warning for the Spray River corridor and the current grooming and permitted-use information.",
    "difficulty": "moderate",
    "distance": "19 km one way",
    "elevationGain": "435 m in official profile; confirm direction",
    "elevationLoss": "160 m in official profile; confirm direction",
    "time": "A separate point-to-point plan is required",
    "season": "winter",
    "type": "trail",
    "area": "Banff",
    "park": "Banff National Park / Spray Valley Provincial Park",
    "province": "Alberta",
    "lat": 51.1181,
    "lng": -115.4406,
    "image": "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=600&q=80",
    "highlights": [
      "Point-to-point route",
      "Prearranged return transport",
      "Official grooming and hazard reports"
    ],
    "trailhead": "Goat Creek trailhead on Spray Lakes Road, above Canmore",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/skidefond-xcski/banff",
    "transitAccessible": false,
    "status": "unknown",
    "accessNote": "This journey crosses park jurisdictions. The Canmore-side start is Goat Creek Day Use in Spray Valley Provincial Park; check Alberta Parks for its current access, advisories and applicable parking/pass requirements. Check the Banff National Park trail report and bulletins for the Spray River corridor and Banff endpoint. Arrange the point-to-point return and verify both ends before departing; one park's report does not establish the other endpoint's access.",
    "reviewedAt": "2026-10-29",
    "sourceUrls": [
      {
        "label": "Parks Canada winter route and avalanche-path information",
        "url": "https://parks.canada.ca/pn-np/ab/banff/activ/skidefond-xcski/banff"
      },
      {
        "label": "Alberta Parks Goat Creek Day Use access and advisories",
        "url": "https://www.albertaparks.ca/parks/kananaskis/spray-valley-pp/information-facilities/day-use/goat-creek/"
      },
      {
        "label": "Alberta Parks Goat Creek route and Canmore-area report",
        "url": "https://www.albertaparks.ca/parks/kananaskis/kananaskis-country/advisories-public-safety/trail-reports/canmore-and-area/goat-creek/"
      }
    ]
  },
  {
    "id": "healy-creek-xc-ski",
    "name": "Healy Creek Cross-Country Ski Trail",
    "slug": "healy-creek-xc-ski",
    "description": "A winter route between Healy Creek/Brewster Creek trailhead and Sundance Canyon junction.",
    "longDescription": "The current Parks Canada ski guide lists 5.5 km one way from Healy Creek/Brewster Creek trailhead on the Sunshine Village Access Road to Sundance Canyon junction. Track setting occurs when sufficient snow is available; it is not a guaranteed daily service.\n\nDecide between returning to the start and a separately arranged point-to-point trip before travelling. Connections towards Cave and Basin or other routes add their own distance. Use current signs and reports to check permitted uses and the route actually available.",
    "difficulty": "moderate",
    "distance": "5.5 km one way between listed endpoints",
    "elevationGain": "95 m one way",
    "elevationLoss": "100 m one way",
    "time": "Depends on route and snow conditions",
    "season": "winter",
    "type": "trail",
    "area": "Banff",
    "lat": 51.1352,
    "lng": -115.7558,
    "image": "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=600&q=80",
    "highlights": [
      "Forested winter route",
      "Defined junction endpoints",
      "Snow-dependent track setting"
    ],
    "trailhead": "Healy Creek/Brewster Creek trailhead, Sunshine Village Access Road",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/skidefond-xcski/banff",
    "transitAccessible": false,
    "status": "unknown",
    "reviewedAt": "2026-10-28",
    "sourceUrls": [
      {
        "label": "Official route information",
        "url": "https://parks.canada.ca/pn-np/ab/banff/activ/skidefond-xcski/banff"
      }
    ]
  },
  {
    "id": "golf-course-loop-xc-ski",
    "name": "Golf Course Winter Skiing: Check Designated Routes",
    "slug": "golf-course-loop-xc-ski",
    "description": "A legacy listing whose claimed groomed winter golf-course loop has not been verified against the current official ski guide.",
    "longDescription": "The current Parks Canada recommended ski-trail list does not verify the groomed 5 km golf-course loop previously described here. This page therefore does not provide that route, its distance, a trailhead instruction or a promise of wildlife sightings. Use the official current winter guide to choose a designated ski outing.\n\nGolf Course Road has a seasonal driving closure. That road restriction does not by itself establish permission to ski across the golf property or a prepared winter route. Check Parks Canada and the property operator before making any plan in this area.",
    "difficulty": "easy",
    "distance": "Winter loop not verified",
    "elevationGain": "Not verified",
    "elevationLoss": "Not verified",
    "time": "Choose a verified designated route",
    "season": "winter",
    "type": "trail",
    "area": "Banff",
    "lat": 51.1908,
    "lng": -115.5642,
    "image": "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=600&q=80",
    "highlights": [
      "Current official ski-route information",
      "Seasonal road restrictions",
      "Separate property-access check"
    ],
    "trailhead": "No winter ski trailhead verified for this legacy listing",
    "parksCanadaUrl": "https://parks.canada.ca/pn-np/ab/banff/activ/skidefond-xcski/banff",
    "transitAccessible": false,
    "status": "unknown",
    "directoryEligible": false,
    "routeVerified": false,
    "reviewedAt": "2026-10-28",
    "sourceUrls": [
      {
        "label": "Official route information",
        "url": "https://parks.canada.ca/pn-np/ab/banff/activ/skidefond-xcski/banff"
      }
    ]
  },
  {
    "id": "bow-falls",
    "slug": "bow-falls",
    "name": "Bow Falls Trail",
    "description": "A riverside walk from Banff’s Bow River Bridge towards Bow Falls, with a clifftop section closed in winter.",
    "longDescription": "The Town of Banff describes a 1.2 km one-way walk from the Bow River Bridge to Bow Falls, taking about 20–25 minutes one way. Follow the pedestrian route on the south side of the river and the posted access information. The route is distinct from simply arriving at the lower Bow Falls parking/viewing area.\n\nThe clifftop section is closed in winter, and bicycles are not permitted on that section. Do not use a summer through-route in snow season or walk onto river ice to bypass a barrier. Check the Town’s route map and current park notices before choosing the portion of the visit suited to your group.",
    "difficulty": "easy",
    "distance": "1.2 km one way from Bow River Bridge",
    "elevationGain": "Check official route map",
    "elevationLoss": "Check official route map",
    "time": "About 20–25 min one way (Town guide)",
    "season": "summer",
    "type": "trail",
    "area": "Banff",
    "lat": 51.1714,
    "lng": -115.5707,
    "image": "https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=600&q=80",
    "highlights": [
      "Bow River pedestrian route",
      "Bow Falls setting",
      "Seasonal clifftop restriction"
    ],
    "trailhead": "South end of Bow River Bridge; indicative marker only",
    "parksCanadaUrl": "https://banff.ca/654/Bow-Falls-Trail",
    "transitAccessible": false,
    "status": "unknown",
    "reviewedAt": "2026-10-28",
    "winterNote": "The Town of Banff lists the clifftop section closed in winter. Check permitted access to any other viewpoint separately.",
    "sourceUrls": [
      {
        "label": "Town of Banff: Bow Falls Trail",
        "url": "https://banff.ca/654/Bow-Falls-Trail"
      }
    ]
  },
];
