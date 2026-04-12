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
  area: 'Banff' | 'Lake Louise' | 'Castle Junction' | 'Icefields Parkway';
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
    id: 'fenland-trail',
    name: 'Fenland Trail',
    slug: 'fenland-trail',
    description:
      'A peaceful self-guided interpretive loop winding through old-growth white spruce forest on the edge of Banff townsite.',
    longDescription:
      'The Fenland Trail offers a tranquil escape just minutes from downtown Banff, guiding hikers through a lush montane wetland shaded by towering old-growth spruce. Interpretive signs along the boardwalk explain the delicate ecosystem, while elk, beaver, and a variety of bird species are commonly spotted. It is an ideal year-round stroll for families and nature lovers seeking serenity without significant elevation.',
    difficulty: 'easy',
    distance: '2.1 km loop',
    elevationGain: '0 m',
    elevationLoss: '0 m',
    time: '40 min',
    season: 'year-round',
    type: 'trail',
    area: 'Banff',
    lat: 51.1854,
    lng: -115.5834,
    image:
      'https://images.unsplash.com/photo-1511497584788-876760111969?w=600&q=80',
    highlights: [
      'Old-growth white spruce forest',
      'Interpretive signs along the route',
      'Beaver and elk sightings',
    ],
    trailhead: 'Fenland Trail parking area',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/banff',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: 'Groomed, good conditions',
    conditionUpdated: '2026-04-12',
  },
  {
    id: 'marsh-loop',
    name: 'Marsh Loop',
    slug: 'marsh-loop',
    description:
      'A gentle wetland loop fed by the Cave and Basin hot springs, showcasing a unique warm-water ecosystem.',
    longDescription:
      'Starting from the Cave and Basin National Historic Site, this easy loop meanders through a rare warm-water wetland created by mineral-rich hot springs. The boardwalk passes lush vegetation, endangered Banff Springs snails, and bird-rich marshes with the Bow River as a backdrop. Accessible year-round via Roam Route 4, it provides a fascinating glimpse into geothermal ecology.',
    difficulty: 'easy',
    distance: '2.6 km loop',
    elevationGain: '0 m',
    elevationLoss: '0 m',
    time: '1 hr',
    season: 'year-round',
    type: 'trail',
    area: 'Banff',
    lat: 51.1545,
    lng: -115.5847,
    image:
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80',
    highlights: [
      'Hot springs-fed wetland',
      'Endangered Banff Springs snail habitat',
      'Cave and Basin National Historic Site',
    ],
    trailhead: 'Cave and Basin NHS',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/banff',
    transitAccessible: true,
    transitRoute: 'Roam Route 4',
  
    status: 'open',
    conditionNote: 'Groomed for cross-country skiing and walking',
    conditionUpdated: '2026-04-12',
  },
  {
    id: 'spray-river-east',
    name: 'Spray River East',
    slug: 'spray-river-east',
    description:
      'A forested riverside trail along the east bank of the Spray River, passing beneath the Fairmont Banff Springs.',
    longDescription:
      'This one-way route follows the eastern shore of the Spray River through mixed coniferous forest, with occasional glimpses of the iconic Banff Springs Hotel perched above. The gentle terrain makes it popular with cyclists and joggers as well as hikers. Birdsong and the rush of the Spray River accompany you through a corridor that feels remote despite its proximity to town.',
    difficulty: 'easy',
    distance: '5.7 km one way',
    elevationGain: '135 m',
    elevationLoss: '80 m',
    time: '3-4 hrs',
    season: 'year-round',
    type: 'trail',
    area: 'Banff',
    lat: 51.1644,
    lng: -115.5562,
    image:
      'https://images.unsplash.com/photo-1511497584788-876760111969?w=600&q=80',
    highlights: [
      'Spray River scenery',
      'Views of Banff Springs Hotel',
      'Shared cycling and hiking path',
    ],
    trailhead: 'Golf Course Road',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/banff',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: 'Groomed for cross-country skiing and snowshoeing.',
    conditionUpdated: '2026-03-30',
  },
  {
    id: 'spray-river-west',
    name: 'Spray River West',
    slug: 'spray-river-west',
    description:
      'The quieter western bank companion to the Spray River East trail, offering solitude through dense forest.',
    longDescription:
      'Running along the opposite bank from its eastern counterpart, the Spray River West trail provides a slightly wilder feel as it winds through dense forest with the river rushing below. The gentle descent makes for a relaxing one-way trek, and combining both east and west routes creates an excellent loop. Keep an eye out for elk and deer grazing in riverside clearings.',
    difficulty: 'easy',
    distance: '5.6 km one way',
    elevationGain: '70 m',
    elevationLoss: '105 m',
    time: '3-4 hrs',
    season: 'year-round',
    type: 'trail',
    area: 'Banff',
    lat: 51.1644,
    lng: -115.5562,
    image:
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80',
    highlights: [
      'Quiet western riverbank',
      'Dense mixed forest',
      'Combinable with East trail for a loop',
    ],
    trailhead: 'Spray River bridge',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/banff',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
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
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/banff',
    transitAccessible: true,
    transitRoute: 'Roam Route 2',
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },
  {
    id: 'stewart-canyon',
    name: 'Stewart Canyon',
    slug: 'stewart-canyon',
    description:
      'A short lakeside walk to a scenic bridge spanning a narrow limestone canyon on Lake Minnewanka.',
    longDescription:
      'Beginning at the Lake Minnewanka day-use area, this easy walk follows the north shore before arriving at a bridge that spans the impressive Stewart Canyon. The turquoise water of the Cascade River cuts through vertical limestone walls far below, creating a dramatic natural spectacle. It is an excellent add-on to a Lake Minnewanka visit and accessible via Roam Route 6.',
    difficulty: 'easy',
    distance: '1.5 km one way',
    elevationGain: '0 m',
    elevationLoss: '0 m',
    time: '1 hr',
    season: 'year-round',
    type: 'trail',
    area: 'Banff',
    lat: 51.2350,
    lng: -115.4910,
    image:
      'https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=600&q=80',
    highlights: [
      'Limestone canyon bridge',
      'Lake Minnewanka shoreline',
      'Cascade River gorge',
    ],
    trailhead: 'Lake Minnewanka Day-use',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/banff',
    transitAccessible: true,
    transitRoute: 'Roam Route 6',
  
    status: 'caution',
    conditionNote: 'Very icy, ice cleats essential',
    conditionUpdated: '2026-04-12',
  },
  {
    id: 'johnson-lake',
    name: 'Johnson Lake',
    slug: 'johnson-lake',
    description:
      'A family-friendly loop around a warm swimming lake, home to some of Alberta\'s oldest Douglas fir trees.',
    longDescription:
      'Circling one of the warmest lakes in Banff National Park, this easy loop passes through a montane forest that shelters some of the oldest Douglas fir specimens in all of Alberta. The calm waters are popular for swimming in summer and the shoreline picnic areas make it a favourite family destination. Roam Route 6 provides convenient access from Banff townsite.',
    difficulty: 'easy',
    distance: '2.8 km loop',
    elevationGain: '0 m',
    elevationLoss: '0 m',
    time: '1 hr',
    season: 'year-round',
    type: 'trail',
    area: 'Banff',
    lat: 51.2148,
    lng: -115.4944,
    image:
      'https://images.unsplash.com/photo-1511497584788-876760111969?w=600&q=80',
    highlights: [
      'Alberta\'s oldest Douglas fir trees',
      'Warm swimming lake',
      'Lakeside picnic areas',
    ],
    trailhead: 'Johnson Lake Day-use',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/banff',
    transitAccessible: true,
    transitRoute: 'Roam Route 6',
  
    status: 'closed',
    conditionNote: 'Access road closed for winter',
    conditionUpdated: '2026-04-12',
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
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/banff',
    transitAccessible: false,
  
    status: 'closed',
    conditionNote: 'Road access closed for winter season.',
    conditionUpdated: '2026-04-09',
  },
  {
    id: 'johnston-canyon-lower-falls',
    name: 'Johnston Canyon Lower Falls',
    slug: 'johnston-canyon-lower-falls',
    description:
      'A catwalk trail bolted into limestone canyon walls leading to a stunning lower waterfall.',
    longDescription:
      'Engineered catwalks cling to the limestone walls of Johnston Canyon, guiding visitors above the turquoise creek to an impressive lower waterfall that plunges into a deep pool. The trail is well-maintained and accessible in all seasons — winter transforms the falls into a spectacular ice formation. Roam Route 9 makes this one of the most accessible canyon experiences in the Rockies.',
    difficulty: 'easy',
    distance: '1.2 km one way',
    elevationGain: '50 m',
    elevationLoss: '0 m',
    time: '1 hr',
    season: 'year-round',
    type: 'trail',
    area: 'Banff',
    lat: 51.2455,
    lng: -115.8388,
    image:
      'https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=600&q=80',
    highlights: [
      'Catwalks through limestone canyon',
      'Turquoise creek views',
      'Accessible lower waterfall',
    ],
    trailhead: 'Johnston Canyon Day-use',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/banff',
    transitAccessible: true,
    transitRoute: 'Roam Route 9',
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },
  {
    id: 'johnston-canyon-upper-falls',
    name: 'Johnston Canyon Upper Falls',
    slug: 'johnston-canyon-upper-falls',
    description:
      'Continue deeper into the canyon to a thundering 30-metre upper waterfall viewpoint.',
    longDescription:
      'Building on the Lower Falls trail, this extension pushes deeper into Johnston Canyon to reveal the towering 30-metre Upper Falls — a wall of water crashing over ancient limestone with tremendous force. An observation platform provides a dramatic vantage point where mist from the falls keeps the air cool even on hot summer days. The extra distance rewards hikers with far fewer crowds than the lower section.',
    difficulty: 'easy',
    distance: '2.5 km one way',
    elevationGain: '120 m',
    elevationLoss: '0 m',
    time: '2 hrs',
    season: 'year-round',
    type: 'trail',
    area: 'Banff',
    lat: 51.2455,
    lng: -115.8388,
    image:
      'https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=600&q=80',
    highlights: [
      '30-metre thundering waterfall',
      'Observation platform at the falls',
      'Deeper canyon exploration',
    ],
    trailhead: 'Johnston Canyon Day-use',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/banff',
    transitAccessible: true,
    transitRoute: 'Roam Route 9',
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },
  {
    id: 'silverton-falls',
    name: 'Silverton Falls',
    slug: 'silverton-falls',
    description:
      'A short climb to a hidden waterfall cascading over narrow rock ledges in a quiet forest setting.',
    longDescription:
      'Tucked away near the Rockbound Lake trailhead, Silverton Falls offers a brief but rewarding ascent through coniferous forest to a graceful waterfall that spills over a series of narrow limestone ledges. The secluded location means you may have the falls entirely to yourself, making it an excellent detour for those seeking quieter corners of the park. The trail gains elevation quickly but the payoff comes fast.',
    difficulty: 'easy',
    distance: '0.9 km one way',
    elevationGain: '90 m',
    elevationLoss: '0 m',
    time: '40 min',
    season: 'summer',
    type: 'trail',
    area: 'Banff',
    lat: 51.2234,
    lng: -116.1133,
    image:
      'https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=600&q=80',
    highlights: [
      'Secluded cascading waterfall',
      'Narrow limestone ledges',
      'Quiet forest setting',
    ],
    trailhead: 'Rockbound Lake parking',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/banff',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },
  {
    id: 'boom-lake',
    name: 'Boom Lake',
    slug: 'boom-lake',
    description:
      'A gentle forested trail leading to a large turquoise alpine lake backed by dramatic Boom Mountain cliffs.',
    longDescription:
      'Boom Lake rewards a straightforward forest walk with one of the most picturesque alpine lake settings in the park. The turquoise water stretches beneath the imposing walls of Boom Mountain, and the quiet shoreline invites lingering. Unlike busier destinations, this trail offers peaceful reflection and the chance to enjoy a classic Rockies lake without the crowds.',
    difficulty: 'easy',
    distance: '5.1 km one way',
    elevationGain: '175 m',
    elevationLoss: '0 m',
    time: '3-4 hrs',
    season: 'summer',
    type: 'trail',
    area: 'Banff',
    lat: 51.2344,
    lng: -116.2833,
    image:
      'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&q=80',
    highlights: [
      'Turquoise alpine lake',
      'Boom Mountain cliffs backdrop',
      'Quiet and less crowded',
    ],
    trailhead: 'Boom Lake Day-use',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/banff',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },
  {
    id: 'vista-lake',
    name: 'Vista Lake',
    slug: 'vista-lake',
    description:
      'A short descent from the highway to a serene lake tucked in a forested valley along Highway 93 South.',
    longDescription:
      'Vista Lake sits in a quiet depression below the highway, reached by a pleasant downhill trail through mature forest. The lake offers calm reflections of the surrounding peaks and a peaceful setting far removed from the busier attractions. It serves as an excellent introduction to the area for those heading toward Kootenay National Park, and the short distance makes it suitable for all ages.',
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
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/banff',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },

  // ── Banff Easy/Moderate ───────────────────────────────────────────────

  {
    id: 'sundance-canyon',
    name: 'Sundance Canyon',
    slug: 'sundance-canyon',
    description:
      'A paved path from Cave and Basin leads to a rocky canyon loop with dramatic water-carved formations.',
    longDescription:
      'The journey to Sundance Canyon begins on a wide, paved path along the Bow River from the Cave and Basin, making the first portion accessible to strollers and wheelchairs. Once at the canyon itself, a rugged loop trail weaves between towering water-carved rock walls where Sundance Creek cascades through narrow slots. The combination of easy approach and dramatic payoff makes this a favourite half-day outing accessible via Roam Route 4.',
    difficulty: 'easy',
    distance: '3.7 km one way + 1.6 km loop',
    elevationGain: '155 m',
    elevationLoss: '60 m',
    time: '3 hrs',
    season: 'year-round',
    type: 'trail',
    area: 'Banff',
    lat: 51.1548,
    lng: -115.6044,
    image:
      'https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=600&q=80',
    highlights: [
      'Water-carved canyon walls',
      'Paved approach along Bow River',
      'Sundance Creek cascades',
    ],
    trailhead: 'Cave and Basin NHS',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/banff',
    transitAccessible: true,
    transitRoute: 'Roam Route 4',
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },
  {
    id: 'ink-pots',
    name: 'Ink Pots',
    slug: 'ink-pots',
    description:
      'Extend past Johnston Canyon Upper Falls to vivid cold-water mineral springs in an open meadow.',
    longDescription:
      'Beyond the Upper Falls of Johnston Canyon, the trail leaves the canyon confines and emerges into expansive meadows where five cold-water springs bubble up through the earth, each tinted a unique shade of green and blue by dissolved minerals. The colourful pools contrast beautifully with the surrounding wildflower meadows and rugged peaks. This extension transforms the popular canyon walk into a full-day adventure and is accessible via Roam Route 9.',
    difficulty: 'easy',
    distance: '5.7 km one way',
    elevationGain: '330 m',
    elevationLoss: '140 m',
    time: '4 hrs',
    season: 'summer',
    type: 'trail',
    area: 'Banff',
    lat: 51.2455,
    lng: -115.8388,
    image:
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80',
    highlights: [
      'Five vivid cold-water mineral springs',
      'Wildflower meadows',
      'Extension of Johnston Canyon trail',
    ],
    trailhead: 'Johnston Canyon Day-use',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/banff',
    transitAccessible: true,
    transitRoute: 'Roam Route 9',
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },

  // ── Banff Moderate ────────────────────────────────────────────────────

  {
    id: 'sulphur-mountain',
    name: 'Sulphur Mountain',
    slug: 'sulphur-mountain',
    description:
      'A well-graded switchback trail climbing to the Banff Gondola summit station with sweeping Bow Valley panoramas.',
    longDescription:
      'Ascending through dense forest via dozens of well-engineered switchbacks, the Sulphur Mountain trail delivers hikers to the gondola summit station at 2,281 metres. A boardwalk extends to the historic Cosmic Ray Station with 360-degree views of six mountain ranges, the Bow Valley, and the Spray River valley below. Those who prefer a one-way challenge can hike up and ride the gondola down, accessible via Roam Route 1.',
    difficulty: 'moderate',
    distance: '5.5 km one way + 0.5 km boardwalk',
    elevationGain: '655 m',
    elevationLoss: '0 m',
    time: '4 hrs',
    season: 'year-round',
    type: 'trail',
    area: 'Banff',
    lat: 51.1503,
    lng: -115.5819,
    image:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
    highlights: [
      'Summit boardwalk & Cosmic Ray Station',
      'Six mountain range panorama',
      'Option to gondola down',
    ],
    trailhead: 'Upper Hot Springs parking',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/banff',
    transitAccessible: true,
    transitRoute: 'Roam Route 1',
  
    status: 'open',
    conditionNote: 'Good conditions, packed snow',
    conditionUpdated: '2026-04-12',
  },
  {
    id: 'tunnel-mountain-summit',
    name: 'Tunnel Mountain Summit',
    slug: 'tunnel-mountain-summit',
    description:
      'The shortest summit hike in Banff, climbing through Douglas fir to panoramic views of the Bow Valley and townsite.',
    longDescription:
      'Tunnel Mountain is Banff\'s quintessential introductory summit, gaining just enough elevation through fragrant Douglas fir forest to deliver rewarding 360-degree views of the town, the Bow Valley, and surrounding peaks. The trail is well-maintained with wide switchbacks and is popular at sunrise and sunset when the light paints the mountains in warm alpenglow. It is one of the most frequently hiked trails in the park for good reason.',
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
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/banff',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },
  {
    id: 'surprise-corner-to-hoodoos',
    name: 'Surprise Corner to Hoodoos',
    slug: 'surprise-corner-to-hoodoos',
    description:
      'A scenic riverside trail from Surprise Corner to Banff\'s famous hoodoo rock formations along the Bow River.',
    longDescription:
      'Beginning at the dramatic Surprise Corner viewpoint overlooking the Banff Springs Hotel, this trail follows the Bow River past lush riverside meadows to the fascinating hoodoo formations — tall pillars of cemented glacial till that have been sculpted by millennia of erosion. Wildlife sightings are common along the river corridor, and the gentle terrain makes this a wonderful year-round walk connecting two of Banff\'s iconic landmarks.',
    difficulty: 'moderate',
    distance: '4.8 km one way',
    elevationGain: '115 m',
    elevationLoss: '90 m',
    time: '3 hrs',
    season: 'year-round',
    type: 'trail',
    area: 'Banff',
    lat: 51.1657,
    lng: -115.5588,
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
    highlights: [
      'Hoodoo rock formations',
      'Banff Springs Hotel views',
      'Bow River wildlife corridor',
    ],
    trailhead: 'Surprise Corner, Buffalo Street',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/banff',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
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
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/banff',
    transitAccessible: true,
    transitRoute: 'Norquay Shuttle',
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
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
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/banff',
    transitAccessible: true,
    transitRoute: 'Norquay Shuttle',
  
    status: 'open',
    conditionNote: 'Good conditions for skiing and snowshoeing.',
    conditionUpdated: '2026-04-09',
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
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/banff',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },
  {
    id: 'healy-pass',
    name: 'Healy Pass',
    slug: 'healy-pass',
    description:
      'A long but rewarding alpine traverse through meadows to a high pass with views into the Egypt Lake region.',
    longDescription:
      'The Healy Pass trail climbs steadily through dense subalpine forest before breaking into vast alpine meadows painted with wildflowers. At the pass itself, hikers are rewarded with expansive views into the remote Egypt Lake wilderness and across to the Monarch Ramparts. This trail provides a genuine backcountry feel without requiring overnight gear, and the Sunshine Shuttle offers convenient access to the trailhead.',
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
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/banff',
    transitAccessible: true,
    transitRoute: 'Sunshine Shuttle',
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
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
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/banff',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
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
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/banff',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },
  {
    id: 'rockbound-lake',
    name: 'Rockbound Lake',
    slug: 'rockbound-lake',
    description:
      'A long forested approach rewarded by a stunning alpine lake ringed by towering rock walls near Castle Junction.',
    longDescription:
      'The trail to Rockbound Lake begins with a sustained climb through dense forest before opening to reveal an extraordinary alpine lake enclosed by sheer rock walls on three sides. The remote setting and the effort required to reach it mean far fewer visitors than the park\'s more accessible lakes. The brilliant turquoise water and imposing cliff scenery make it one of the most rewarding lake destinations in Banff National Park.',
    difficulty: 'moderate',
    distance: '8.4 km one way',
    elevationGain: '760 m',
    elevationLoss: '0 m',
    time: '6-7 hrs',
    season: 'summer',
    type: 'trail',
    area: 'Banff',
    lat: 51.2597,
    lng: -115.9290,
    image:
      'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&q=80',
    highlights: [
      'Turquoise alpine lake',
      'Dramatic rock wall amphitheatre',
      'Remote backcountry feel',
    ],
    trailhead: 'Rockbound Lake parking',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/banff',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },
  {
    id: 'arnica-lake',
    name: 'Arnica Lake',
    slug: 'arnica-lake',
    description:
      'A moderate climb from the Vista Lake viewpoint to a tranquil subalpine lake surrounded by wildflowers.',
    longDescription:
      'Arnica Lake sits in a quiet subalpine basin reached via a steady climb from the Vista Lake viewpoint on Highway 93 South. The trail passes through regenerating forest and open meadows bursting with arnica and other wildflowers in midsummer. The lake itself is a calm jewel reflecting surrounding peaks, and the relative obscurity of this trail means peaceful solitude is virtually guaranteed.',
    difficulty: 'moderate',
    distance: '5 km one way',
    elevationGain: '580 m',
    elevationLoss: '120 m',
    time: '5 hrs',
    season: 'summer',
    type: 'trail',
    area: 'Banff',
    lat: 51.1876,
    lng: -116.2043,
    image:
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&q=80',
    highlights: [
      'Subalpine wildflower meadows',
      'Peaceful mountain lake',
      'Quiet and secluded trail',
    ],
    trailhead: 'Vista Lake viewpoint',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/banff',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },
  {
    id: 'twin-lakes',
    name: 'Twin Lakes',
    slug: 'twin-lakes',
    description:
      'A longer route from the Vista Lake viewpoint to a pair of scenic alpine lakes in a remote valley.',
    longDescription:
      'The Twin Lakes trail extends well beyond Arnica Lake into a remote alpine valley where two pristine lakes sit side by side beneath towering ridgelines. The route involves significant elevation change in both directions, passing through varied terrain from dense forest to open alpine tundra. This full-day commitment rewards experienced hikers with genuine backcountry solitude and some of the most unspoiled lake scenery in the park.',
    difficulty: 'moderate',
    distance: '8 km one way',
    elevationGain: '715 m',
    elevationLoss: '315 m',
    time: '6-7 hrs',
    season: 'summer',
    type: 'trail',
    area: 'Banff',
    lat: 51.1876,
    lng: -116.2043,
    image:
      'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&q=80',
    highlights: [
      'Twin alpine lakes',
      'Remote backcountry valley',
      'Diverse terrain and ecosystems',
    ],
    trailhead: 'Vista Lake viewpoint',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/banff',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },

  // ── Banff Challenging ─────────────────────────────────────────────────

  {
    id: 'aylmer-lookout',
    name: 'Aylmer Lookout',
    slug: 'aylmer-lookout',
    description:
      'A strenuous hike along Lake Minnewanka to a historic fire lookout with commanding views of the lake and ranges.',
    longDescription:
      'Following the north shore of Lake Minnewanka through forest and across rockslides, the trail eventually switchbacks up to the Aylmer Lookout — a historic fire watch site perched high above the lake. The views stretch the full 21-kilometre length of the lake and across to the Palliser Range. This is a demanding full-day hike that rewards with one of the most dramatic vantage points in the Banff area, accessible via Roam Route 6.',
    difficulty: 'challenging',
    distance: '11.8 km one way',
    elevationGain: '560 m',
    elevationLoss: '0 m',
    time: '7-8 hrs',
    season: 'summer',
    type: 'trail',
    area: 'Banff',
    lat: 51.2565,
    lng: -115.4342,
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
    highlights: [
      'Historic fire lookout',
      'Full-length Lake Minnewanka views',
      'Palliser Range panorama',
    ],
    trailhead: 'Lake Minnewanka Day-use',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/banff',
    transitAccessible: true,
    transitRoute: 'Roam Route 6',
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },
  {
    id: 'aylmer-pass',
    name: 'Aylmer Pass',
    slug: 'aylmer-pass',
    description:
      'An extended version of the Aylmer Lookout trail, continuing to a high alpine pass above Lake Minnewanka.',
    longDescription:
      'Building on the already challenging Aylmer Lookout trail, Aylmer Pass pushes further into the alpine zone above Lake Minnewanka, crossing exposed terrain and gaining over 800 metres of elevation. The pass offers a gateway to the remote backcountry north of the lake with sweeping views across the Ghost Wilderness. This is one of the most physically demanding day hikes in the Banff area and requires strong fitness and early starts.',
    difficulty: 'challenging',
    distance: '13.5 km one way',
    elevationGain: '805 m',
    elevationLoss: '0 m',
    time: '8-9 hrs',
    season: 'summer',
    type: 'trail',
    area: 'Banff',
    lat: 51.2565,
    lng: -115.4342,
    image:
      'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=600&q=80',
    highlights: [
      'High alpine pass at 2,288 m',
      'Ghost Wilderness panorama',
      'Remote backcountry access',
    ],
    trailhead: 'Lake Minnewanka Day-use',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/banff',
    transitAccessible: true,
    transitRoute: 'Roam Route 6',
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
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
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/banff',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // LAKE LOUISE AREA (21 trails)
  // ═══════════════════════════════════════════════════════════════════════

  // ── Lake Louise Easy ──────────────────────────────────────────────────

  {
    id: 'lake-louise-lakeshore',
    name: 'Lake Louise Lakeshore',
    slug: 'lake-louise-lakeshore',
    description:
      'A flat shoreline walk along one of the world\'s most photographed lakes, beneath the Victoria Glacier.',
    longDescription:
      'The Lake Louise Lakeshore trail follows the water\'s edge from the Fairmont Château to the far end of the lake where glacial sediment creates the famous turquoise colour. Victoria Glacier gleams at the head of the valley while surrounding peaks reflect in the calm water on still mornings. Accessible year-round with winter ice walking, this is the essential Lake Louise experience and serves as the starting point for several longer hikes.',
    difficulty: 'easy',
    distance: '2.3 km one way',
    elevationGain: '0 m',
    elevationLoss: '0 m',
    time: '1 hr',
    season: 'year-round',
    type: 'trail',
    area: 'Lake Louise',
    lat: 51.4167,
    lng: -116.1773,
    image:
      'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&q=80',
    highlights: [
      'Iconic turquoise lake',
      'Victoria Glacier views',
      'Fairmont Château Lake Louise',
    ],
    trailhead: 'Lake Louise Lakeshore parking',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/lakelouise',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },
  {
    id: 'fairview-lookout',
    name: 'Fairview Lookout',
    slug: 'fairview-lookout',
    description:
      'A short forest climb near Lake Louise to an elevated viewpoint overlooking the lake and Victoria Glacier.',
    longDescription:
      'Branching from the Lakeshore trail, this brief climb through spruce forest leads to a lookout platform with a slightly elevated perspective of Lake Louise and the surrounding amphitheatre of peaks. It provides a different vantage from the shoreline and is quiet enough that you can often enjoy the view in solitude. The short distance makes it an easy add-on to the Lakeshore walk.',
    difficulty: 'easy',
    distance: '1.2 km one way',
    elevationGain: '100 m',
    elevationLoss: '65 m',
    time: '45 min',
    season: 'year-round',
    type: 'viewpoint',
    area: 'Lake Louise',
    lat: 51.4167,
    lng: -116.1773,
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
    highlights: [
      'Elevated Lake Louise view',
      'Quiet forest setting',
      'Easy add-on to lakeshore walk',
    ],
    trailhead: 'Lake Louise parking',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/lakelouise',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },
  {
    id: 'bow-river-lake-louise',
    name: 'Bow River (Lake Louise)',
    slug: 'bow-river-lake-louise',
    description:
      'A flat riverside trail through the Lake Louise village area along the Bow River.',
    longDescription:
      'This gentle riverside path winds along the Bow River near the Lake Louise village, offering peaceful walking through mature forest with the river as a constant companion. It connects several trailheads and day-use areas, making it a versatile route for warming up or cooling down from bigger objectives. Wildlife is frequently spotted along the river corridor, and the flat terrain is suitable for all fitness levels.',
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
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/lakelouise',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },
  {
    id: 'rockpile',
    name: 'Rockpile',
    slug: 'rockpile',
    description:
      'A short scramble up a glacial debris mound to the iconic Valley of the Ten Peaks viewpoint at Moraine Lake.',
    longDescription:
      'The Rockpile trail is one of the shortest yet most rewarding walks in the Canadian Rockies, climbing a mound of glacial debris to reveal the legendary view of Moraine Lake backed by the Valley of the Ten Peaks. This vista once graced the Canadian twenty-dollar bill and remains one of the most photographed scenes in the country. Despite its brevity, arriving early is essential as the parking area fills quickly in summer.',
    difficulty: 'easy',
    distance: '0.7 km loop',
    elevationGain: '35 m',
    elevationLoss: '35 m',
    time: '30 min',
    season: 'summer',
    type: 'viewpoint',
    area: 'Lake Louise',
    lat: 51.3217,
    lng: -116.1860,
    image:
      'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&q=80',
    highlights: [
      'Iconic $20 bill viewpoint',
      'Valley of the Ten Peaks panorama',
      'Turquoise glacial lake',
    ],
    trailhead: 'Moraine Lake',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/lakelouise',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },
  {
    id: 'moraine-lake-lakeshore',
    name: 'Moraine Lake Lakeshore',
    slug: 'moraine-lake-lakeshore',
    description:
      'A gentle shoreline trail along the edge of Moraine Lake with close-up views of the Ten Peaks.',
    longDescription:
      'Following the southern shore of Moraine Lake, this easy trail offers intimate views of the impossibly blue glacial water and the towering Ten Peaks that rise above. The path meanders through boulder fields and shoreline forest, providing constantly changing perspectives of the lake and surrounding mountains. It pairs perfectly with the Rockpile viewpoint for a complete Moraine Lake experience.',
    difficulty: 'easy',
    distance: '1.3 km one way',
    elevationGain: '0 m',
    elevationLoss: '0 m',
    time: '45 min',
    season: 'summer',
    type: 'trail',
    area: 'Lake Louise',
    lat: 51.3217,
    lng: -116.1860,
    image:
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&q=80',
    highlights: [
      'Shoreline glacial lake walk',
      'Ten Peaks close-up views',
      'Boulder field scrambling',
    ],
    trailhead: 'Moraine Lake',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/lakelouise',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },
  {
    id: 'consolation-lakes',
    name: 'Consolation Lakes',
    slug: 'consolation-lakes',
    description:
      'A moderate walk from Moraine Lake through boulder fields to a pair of peaceful alpine lakes beneath rugged peaks.',
    longDescription:
      'Departing from the Moraine Lake parking area, this trail threads through a massive boulder field created by ancient rockslides before arriving at the serene Consolation Lakes, backed by the imposing Quadra Mountain and Babel Tower. The lakes earned their name as a "consolation prize" for those who couldn\'t reach Moraine Lake in earlier times. Today they offer a quieter alternative with equally stunning mountain scenery.',
    difficulty: 'easy',
    distance: '2.9 km one way',
    elevationGain: '135 m',
    elevationLoss: '50 m',
    time: '2 hrs',
    season: 'summer',
    type: 'lake',
    area: 'Lake Louise',
    lat: 51.3190,
    lng: -116.1790,
    image:
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&q=80',
    highlights: [
      'Peaceful alpine lakes',
      'Tower of Babel backdrop',
      'Boulder field crossing',
    ],
    trailhead: 'Moraine Lake',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/lakelouise',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },

  // ── Lake Louise Moderate ──────────────────────────────────────────────

  {
    id: 'lake-agnes',
    name: 'Lake Agnes',
    slug: 'lake-agnes',
    description:
      'A classic switchback climb from Lake Louise to a heritage tea house perched beside alpine Lake Agnes.',
    longDescription:
      'Ascending through subalpine forest with Lake Louise shrinking below, this iconic trail reaches Mirror Lake before the final push to Lake Agnes, where a historic tea house (established 1901) serves fresh brews earned by honest effort. The crystal-clear alpine lake sits in a dramatic cirque, and side trips to Big Beehive and Little Beehive add panoramic viewpoints. This is one of the most beloved day hikes in the Canadian Rockies.',
    difficulty: 'moderate',
    distance: '3.9 km one way',
    elevationGain: '495 m',
    elevationLoss: '80 m',
    time: '2.5-3 hrs',
    season: 'summer',
    type: 'trail',
    area: 'Lake Louise',
    lat: 51.4167,
    lng: -116.1773,
    image:
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&q=80',
    highlights: [
      'Historic tea house (est. 1901)',
      'Alpine Lake Agnes',
      'Side trips to Big and Little Beehive',
    ],
    trailhead: 'Lake Louise parking',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/lakelouise',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },
  {
    id: 'plain-of-six-glaciers',
    name: 'Plain of Six Glaciers',
    slug: 'plain-of-six-glaciers',
    description:
      'A spectacular trail from Lake Louise into a glacial amphitheatre with a rustic tea house and six glacier views.',
    longDescription:
      'From the far end of Lake Louise, this trail climbs along lateral moraines into a vast amphitheatre where six glaciers tumble from the surrounding peaks. A rustic tea house near the 5.5 km mark offers hot drinks and baked goods in one of the most dramatic settings imaginable. Beyond the tea house, the trail continues to a viewpoint where the full scale of the glacial landscape unfolds, with ice falls and crevasses visible on the glacier faces.',
    difficulty: 'moderate',
    distance: '5.8 km one way',
    elevationGain: '595 m',
    elevationLoss: '250 m',
    time: '4 hrs',
    season: 'summer',
    type: 'trail',
    area: 'Lake Louise',
    lat: 51.4167,
    lng: -116.1773,
    image:
      'https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=600&q=80',
    highlights: [
      'Six glacier panorama',
      'Rustic mountain tea house',
      'Glacial moraine landscape',
    ],
    trailhead: 'Lake Louise parking',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/lakelouise',
    transitAccessible: false,
  
    status: 'caution',
    conditionNote: 'Avalanche risk, check conditions',
    conditionUpdated: '2026-04-12',
  },
  {
    id: 'tramline',
    name: 'Tramline',
    slug: 'tramline',
    description:
      'A historic trail following the old tramway route that once connected the Lake Louise railway station to the Château.',
    longDescription:
      'The Tramline trail traces the route of a historic tramway that once carried visitors from the Canadian Pacific Railway station up to the Château Lake Louise. The gentle grade through mixed forest provides a pleasant connection between the village and the lake, passing interpretive markers explaining the area\'s transportation history. It offers a quieter alternative to driving and can be combined with other Lake Louise trails for a full day.',
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
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/lakelouise',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
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
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/lakelouise',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },
  {
    id: 'eiffel-lake',
    name: 'Eiffel Lake',
    slug: 'eiffel-lake',
    description:
      'A sustained climb from Moraine Lake to a vivid alpine lake beneath Eiffel Peak and the Valley of Ten Peaks.',
    longDescription:
      'The Eiffel Lake trail branches off the Larch Valley route to reach a strikingly coloured alpine lake sitting in the shadow of Eiffel Peak. The route climbs through larch forest and alpine meadows, offering ever-expanding views of the Valley of the Ten Peaks behind. The lake itself changes colour with the season and light, ranging from deep teal to milky turquoise, set against a backdrop of scree slopes and glacial remnants.',
    difficulty: 'moderate',
    distance: '5.7 km one way',
    elevationGain: '560 m',
    elevationLoss: '125 m',
    time: '4-5 hrs',
    season: 'summer',
    type: 'lake',
    area: 'Lake Louise',
    lat: 51.3217,
    lng: -116.1860,
    image:
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&q=80',
    highlights: [
      'Vivid alpine lake',
      'Eiffel Peak views',
      'Valley of Ten Peaks panorama',
    ],
    trailhead: 'Moraine Lake',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/lakelouise',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },
  {
    id: 'larch-valley-minnestimma-lakes',
    name: 'Larch Valley / Minnestimma Lakes',
    slug: 'larch-valley-minnestimma-lakes',
    description:
      'A popular climb through golden larch forest to alpine meadows and pristine Minnestimma Lakes.',
    longDescription:
      'Famous for its golden larch display in late September, Larch Valley draws hikers up from Moraine Lake through one of the most photogenic subalpine forests in the Rockies. Above the treeline, the trail opens to meadows dotted with the Minnestimma Lakes and framed by the towering Ten Peaks. The combination of fall colour, alpine water features, and dramatic mountain scenery makes this one of the most iconic seasonal hikes in western Canada.',
    difficulty: 'moderate',
    distance: '4.5 km one way',
    elevationGain: '570 m',
    elevationLoss: '10 m',
    time: '3.5-4 hrs',
    season: 'summer',
    type: 'trail',
    area: 'Lake Louise',
    lat: 51.3217,
    lng: -116.1860,
    image:
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80',
    highlights: [
      'Golden larch trees in autumn',
      'Minnestimma Lakes',
      'Valley of the Ten Peaks views',
    ],
    trailhead: 'Moraine Lake',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/lakelouise',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
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
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/lakelouise',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },
  {
    id: 'fairview-mountain',
    name: 'Fairview Mountain',
    slug: 'fairview-mountain',
    description:
      'A demanding summit hike offering one of the most expansive panoramas in the Lake Louise area.',
    longDescription:
      'Beyond Saddleback Pass, the route to Fairview Mountain\'s summit involves a steep scramble up loose scree to reach nearly 2,745 metres, where the panorama is simply staggering. Lake Louise appears as a tiny turquoise gem far below, while the full sweep of the Bow Range, the Ten Peaks, and distant icefields stretches to every horizon. This is a serious undertaking requiring strong fitness, proper footwear, and fair weather for safe passage.',
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
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/lakelouise',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
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
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/lakelouise',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
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
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/lakelouise',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
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
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/lakelouise',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },
  {
    id: 'sentinel-pass-via-larch-valley',
    name: 'Sentinel Pass via Larch Valley',
    slug: 'sentinel-pass-via-larch-valley',
    description:
      'The classic approach to Sentinel Pass through golden larch forest from Moraine Lake.',
    longDescription:
      'The most popular route to Sentinel Pass follows the Larch Valley trail from Moraine Lake, climbing through forests that blaze gold in September before ascending the final steep scree slope to the pass at 2,611 metres. At the top, hikers stand between Pinnacle Mountain and Mount Temple with staggering views in every direction — down into Paradise Valley on one side and back to the Ten Peaks on the other. This is one of the most iconic high-alpine experiences in Canada.',
    difficulty: 'challenging',
    distance: '5.6 km one way',
    elevationGain: '750 m',
    elevationLoss: '50 m',
    time: '4.5-5.5 hrs',
    season: 'summer',
    type: 'trail',
    area: 'Lake Louise',
    lat: 51.3217,
    lng: -116.1860,
    image:
      'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=600&q=80',
    highlights: [
      'Pass at 2,611 m elevation',
      'Golden larch forest in autumn',
      'Views into Paradise Valley and Ten Peaks',
    ],
    trailhead: 'Moraine Lake',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/lakelouise',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },
  {
    id: 'wenkchemna-pass',
    name: 'Wenkchemna Pass',
    slug: 'wenkchemna-pass',
    description:
      'A demanding high-alpine route through the Valley of Ten Peaks to a remote pass on the Continental Divide.',
    longDescription:
      'Wenkchemna Pass sits at the head of the legendary Valley of the Ten Peaks, reached by a long and challenging trail from Moraine Lake. The route passes through the Eiffel Lake area before continuing into increasingly remote and barren terrain where glaciers and scree dominate the landscape. At the pass, hikers stand on the Continental Divide with views stretching deep into Kootenay National Park — a truly wild and unforgettable destination.',
    difficulty: 'challenging',
    distance: '9.6 km one way',
    elevationGain: '1010 m',
    elevationLoss: '265 m',
    time: '7-8 hrs',
    season: 'summer',
    type: 'trail',
    area: 'Lake Louise',
    lat: 51.3217,
    lng: -116.1860,
    image:
      'https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=600&q=80',
    highlights: [
      'Continental Divide crossing',
      'Valley of the Ten Peaks',
      'Remote glacial landscape',
    ],
    trailhead: 'Moraine Lake',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/lakelouise',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },
  {
    id: 'hidden-lake',
    name: 'Hidden Lake',
    slug: 'hidden-lake',
    description:
      'A challenging backcountry trail to a secluded alpine lake near the Skoki area east of Lake Louise.',
    longDescription:
      'Hidden Lake lives up to its name, tucked away in a remote basin accessible via a lengthy trail from Fish Creek parking. The route climbs through dense forest and crosses alpine meadows before descending to the hidden shores of this peaceful lake. The solitude and pristine setting make it a favourite among experienced hikers looking to escape the crowds of the Lake Louise corridor. Early starts are recommended for this full-day commitment.',
    difficulty: 'challenging',
    distance: '8.5 km one way',
    elevationGain: '700 m',
    elevationLoss: '80 m',
    time: '6-7 hrs',
    season: 'summer',
    type: 'lake',
    area: 'Lake Louise',
    lat: 51.4380,
    lng: -116.1570,
    image:
      'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&q=80',
    highlights: [
      'Secluded alpine lake',
      'Skoki backcountry access',
      'True wilderness solitude',
    ],
    trailhead: 'Fish Creek parking, Whitehorn Road',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/lakelouise',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
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
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/lakelouise',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
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
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/1A',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },
  {
    id: 'stanley-glacier',
    name: 'Stanley Glacier',
    slug: 'stanley-glacier',
    description:
      'A fascinating hike through fire-regenerated forest into a hanging valley dominated by the Stanley Glacier.',
    longDescription:
      'The Stanley Glacier trail crosses into the Kootenay National Park boundary and climbs through a striking landscape of fire-regenerated forest — the result of a 1968 burn that created a natural laboratory of ecological renewal. The trail enters a dramatic hanging valley where the Stanley Glacier clings to massive rock walls above. Wildflowers carpet the regenerated slopes in summer, and the contrast between fire-scarred terrain and glacial ice provides a powerful lesson in natural forces.',
    difficulty: 'moderate',
    distance: '4.2 km one way',
    elevationGain: '395 m',
    elevationLoss: '0 m',
    time: '3 hrs',
    season: 'summer',
    type: 'trail',
    area: 'Castle Junction',
    lat: 51.1758,
    lng: -116.2080,
    image:
      'https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=600&q=80',
    highlights: [
      'Stanley Glacier views',
      'Fire-regenerated forest',
      'Hanging valley landscape',
    ],
    trailhead: 'Kootenay NP, 13 km SW of Castle Junction on Hwy 93S',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/1A',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },
  {
    id: 'taylor-lake',
    name: 'Taylor Lake',
    slug: 'taylor-lake',
    description:
      'A challenging climb through dense forest to a pristine alpine lake with optional side trip to O\'Brien Lake.',
    longDescription:
      'Taylor Lake rewards a steep, sustained forest climb with a stunning alpine lake framed by rugged peaks and subalpine meadows. The trail gains elevation quickly through dense Engelmann spruce forest before emerging at the lake, which sits in a tranquil cirque. An optional side trip to nearby O\'Brien Lake adds another gem to the day. This is a quieter alternative to the more famous Lake Louise area lakes and appeals to hikers seeking solitude.',
    difficulty: 'challenging',
    distance: '6.3 km one way',
    elevationGain: '585 m',
    elevationLoss: '0 m',
    time: '4-5 hrs',
    season: 'summer',
    type: 'lake',
    area: 'Castle Junction',
    lat: 51.3450,
    lng: -116.1800,
    image:
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&q=80',
    highlights: [
      'Pristine alpine cirque lake',
      'Optional O\'Brien Lake side trip',
      'Quiet and less visited',
    ],
    trailhead: 'Taylor Creek day use',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/1A',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ICEFIELDS PARKWAY (16 trails)
  // ═══════════════════════════════════════════════════════════════════════

  // ── Icefields Parkway Easy ────────────────────────────────────────────

  {
    id: 'peyto-lake-viewpoint',
    name: 'Peyto Lake Viewpoint',
    slug: 'peyto-lake-viewpoint',
    description:
      'A short uphill walk to one of the most iconic viewpoints in the Canadian Rockies overlooking wolf-head-shaped Peyto Lake.',
    longDescription:
      'From the Bow Summit parking lot — the highest point on the Icefields Parkway — a brief paved trail leads to a viewing platform with a jaw-dropping panorama of Peyto Lake. The glacially-fed lake glows an otherworldly blue from rock flour and its distinctive wolf-head shape is instantly recognizable. This is one of the most accessible yet spectacular viewpoints in all of the Canadian Rockies, and a must-stop on any Icefields Parkway drive.',
    difficulty: 'easy',
    distance: '0.6 km one way',
    elevationGain: '30 m',
    elevationLoss: '10 m',
    time: '30 min',
    season: 'summer',
    type: 'viewpoint',
    area: 'Icefields Parkway',
    lat: 51.7253,
    lng: -116.5092,
    image:
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&q=80',
    highlights: [
      'Wolf-head shaped turquoise lake',
      'Highest point on Icefields Parkway',
      'Paved accessible trail',
    ],
    trailhead: 'Peyto Lake parking lot, 40 km N of Lake Louise junction',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/93N',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
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
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/93N',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
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
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/93N',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },

  // ── Icefields Parkway Moderate ────────────────────────────────────────

  {
    id: 'bow-glacier-falls',
    name: 'Bow Glacier Falls',
    slug: 'bow-glacier-falls',
    description:
      'A scenic trail from Bow Lake to the waterfall at the toe of the Bow Glacier, source of the Bow River.',
    longDescription:
      'Starting from the historic Num-Ti-Jah Lodge on the shore of Bow Lake, this trail follows the lakeshore before climbing along glacial moraines to a powerful waterfall fed by meltwater from the Bow Glacier above. This is the birthplace of the Bow River, which flows all the way through Banff and Calgary to the prairies. The combination of a glacier-fed waterfall, turquoise lake, and historic lodge creates one of the most complete mountain experiences on the Icefields Parkway.',
    difficulty: 'moderate',
    distance: '4.4 km one way',
    elevationGain: '190 m',
    elevationLoss: '20 m',
    time: '3 hrs',
    season: 'summer',
    type: 'trail',
    area: 'Icefields Parkway',
    lat: 51.6710,
    lng: -116.4492,
    image:
      'https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=600&q=80',
    highlights: [
      'Source of the Bow River',
      'Bow Glacier waterfall',
      'Historic Num-Ti-Jah Lodge',
    ],
    trailhead: 'Bow Lake parking, 36 km N of Lake Louise junction',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/93N',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
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
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/93N',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },
  {
    id: 'cirque-lake',
    name: 'Cirque Lake',
    slug: 'cirque-lake',
    description:
      'A moderate hike from Waterfowl Campground to a scenic lake nestled in an alpine cirque.',
    longDescription:
      'The trail to Cirque Lake departs from Waterfowl Campground and climbs through mature forest before arriving at a beautiful alpine lake cupped in a classic glacial cirque. Towering walls rise on three sides, creating a natural amphitheatre that amplifies the sense of wilderness. The hike is manageable for most fit hikers and provides excellent alpine scenery without the crowds found at more famous destinations along the Icefields Parkway.',
    difficulty: 'moderate',
    distance: '4.6 km one way',
    elevationGain: '210 m',
    elevationLoss: '100 m',
    time: '3 hrs',
    season: 'summer',
    type: 'lake',
    area: 'Icefields Parkway',
    lat: 51.8400,
    lng: -116.5600,
    image:
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&q=80',
    highlights: [
      'Classic glacial cirque setting',
      'Alpine lake beneath towering walls',
      'Quieter Icefields Parkway destination',
    ],
    trailhead: 'Waterfowl Campground, 57.5 km N of Lake Louise junction',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/93N',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },
  {
    id: 'chephren-lake',
    name: 'Chephren Lake',
    slug: 'chephren-lake',
    description:
      'A forested trail to a dramatic lake backed by the pyramidal form of Howse Peak.',
    longDescription:
      'Sharing a trailhead with the Cirque Lake trail at Waterfowl Campground, the route to Chephren Lake passes through thick subalpine forest before opening to reveal a deep alpine lake beneath the striking pyramidal form of Howse Peak. The lake\'s remote feel and impressive mountain backdrop make it a rewarding destination for hikers looking for a quieter alternative to the park\'s more famous lakes. The moderate difficulty and reasonable distance make it a solid half-day option.',
    difficulty: 'moderate',
    distance: '4.1 km one way',
    elevationGain: '140 m',
    elevationLoss: '75 m',
    time: '3 hrs',
    season: 'summer',
    type: 'lake',
    area: 'Icefields Parkway',
    lat: 51.8400,
    lng: -116.5600,
    image:
      'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&q=80',
    highlights: [
      'Howse Peak backdrop',
      'Deep alpine lake',
      'Quieter alternative destination',
    ],
    trailhead: 'Waterfowl Campground, 57.5 km N of Lake Louise junction',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/93N',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
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
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/93N',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
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
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/93N',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
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
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/93N',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },
  {
    id: 'north-molar-pass',
    name: 'North Molar Pass',
    slug: 'north-molar-pass',
    description:
      'An extended version of the Molar Pass trail pushing deeper into remote alpine terrain.',
    longDescription:
      'North Molar Pass extends the Molar Pass route further into the alpine, gaining nearly 800 metres of elevation through increasingly barren and windswept terrain. The pass offers sweeping views of the Molar Creek valley and distant peaks that define the northern boundaries of Banff National Park. This is a full-day commitment that appeals to experienced hikers seeking true solitude and the raw beauty of the high alpine environment.',
    difficulty: 'challenging',
    distance: '11.5 km one way',
    elevationGain: '795 m',
    elevationLoss: '30 m',
    time: '8-9 hrs',
    season: 'summer',
    type: 'trail',
    area: 'Icefields Parkway',
    lat: 51.5900,
    lng: -116.4300,
    image:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
    highlights: [
      'Nearly 800 m elevation gain',
      'Remote Molar Creek valley views',
      'True high-alpine solitude',
    ],
    trailhead: 'Near Mosquito Creek Campground, 24 km N of Lake Louise junction',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/93N',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
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
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/93N',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },
  {
    id: 'peyto-lake-shore',
    name: 'Peyto Lake (Shore)',
    slug: 'peyto-lake-shore',
    description:
      'A steep and challenging descent from the viewpoint to the shore of Peyto Lake, for experienced hikers only.',
    longDescription:
      'While millions of visitors view Peyto Lake from the summit viewpoint, a much more demanding trail descends to the actual lakeshore. The steep, unmaintained descent drops over 240 metres through loose terrain and thick vegetation, requiring solid route-finding skills and confidence on unstable ground. At the shore, hikers are rewarded with an intimate perspective of the glacially-fed waters and the towering walls of the surrounding valley — a view shared by very few.',
    difficulty: 'challenging',
    distance: '1.3 km one way',
    elevationGain: '30 m',
    elevationLoss: '240 m',
    time: '2 hrs',
    season: 'summer',
    type: 'lake',
    area: 'Icefields Parkway',
    lat: 51.7253,
    lng: -116.5092,
    image:
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&q=80',
    highlights: [
      'Intimate lakeshore perspective',
      'Experienced hikers only',
      'Glacially-fed turquoise waters',
    ],
    trailhead: 'Peyto Lake parking lot',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/93N',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },
  {
    id: 'glacier-lake',
    name: 'Glacier Lake',
    slug: 'glacier-lake',
    description:
      'A long forested trail to one of the largest backcountry lakes in Banff, near Saskatchewan Crossing.',
    longDescription:
      'Glacier Lake is one of the largest backcountry lakes in Banff National Park, reached by a lengthy trail that undulates through dense forest with relatively modest elevation change. The lake stretches over 3 kilometres and is backed by glaciated peaks, offering a genuine wilderness lake experience. The flat terrain and reasonable net elevation make this accessible to persistent hikers, though the sheer distance demands an early start and a full day\'s commitment.',
    difficulty: 'challenging',
    distance: '8.8 km one way',
    elevationGain: '260 m',
    elevationLoss: '275 m',
    time: '6-7 hrs',
    season: 'summer',
    type: 'lake',
    area: 'Icefields Parkway',
    lat: 51.9010,
    lng: -116.6960,
    image:
      'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&q=80',
    highlights: [
      'One of Banff\'s largest backcountry lakes',
      'Glaciated peak backdrop',
      'True wilderness lake experience',
    ],
    trailhead: '1 km N of Saskatchewan Crossing',
    parksCanadaUrl:
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/93N',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
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
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/93N',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
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
      'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/93N',
    transitAccessible: false,
  
    status: 'open',
    conditionNote: '',
    conditionUpdated: '2026-03-29',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // WINTER TRAILS — Cross-Country Skiing, Snowshoeing, Ice Walks
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: 'cascade-valley-xc-ski',
    name: 'Cascade Valley Cross-Country Ski Trail',
    slug: 'cascade-valley-xc-ski',
    description: 'A groomed classic cross-country ski trail following the Cascade River through quiet valley forest north of Banff.',
    longDescription: 'The Cascade Valley trail is one of the most popular groomed cross-country ski routes in Banff National Park. Following the Cascade River north from the trailhead near Lake Minnewanka Road, the trail winds through peaceful spruce forest with mountain views. Parks Canada grooms this trail regularly throughout winter for classic technique. Wildlife sightings are common — watch for elk, coyotes, and the occasional wolf track in the snow.',
    difficulty: 'moderate',
    distance: '14 km return',
    elevationGain: '100 m',
    elevationLoss: '100 m',
    time: '2-3 hrs',
    season: 'winter',
    type: 'trail',
    area: 'Banff',
    lat: 51.2101,
    lng: -115.5302,
    image: 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=600&q=80',
    highlights: ['Groomed classic track', 'Cascade River valley views', 'Wildlife corridor'],
    trailhead: 'Cascade Fire Road parking, Lake Minnewanka Road',
    parksCanadaUrl: 'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/banff',
    transitAccessible: false,
    status: 'open',
    conditionNote: 'Groomed regularly Dec-Mar',
    conditionUpdated: '2026-03-29',
    parkingCapacity: '20 vehicles',
    crowdLevel: { summer: 'low', winter: 'medium' },
  },
  {
    id: 'spray-river-loop-xc-ski',
    name: 'Spray River Loop Cross-Country Ski',
    slug: 'spray-river-loop-xc-ski',
    description: 'A popular groomed loop along the Spray River past the Fairmont Banff Springs, ideal for intermediate cross-country skiers.',
    longDescription: 'The Spray River Loop is a classic Banff winter trail offering groomed cross-country skiing through the Spray Valley. The trail passes directly below the Fairmont Banff Springs hotel before following the Spray River south into quiet forest. Parks Canada grooms this route for both classic and skate techniques. The relatively flat terrain with gentle rolling hills makes it accessible for intermediate skiers, while the mountain backdrop and river scenery keep it interesting.',
    difficulty: 'moderate',
    distance: '12 km loop',
    elevationGain: '75 m',
    elevationLoss: '75 m',
    time: '2-3 hrs',
    season: 'winter',
    type: 'trail',
    area: 'Banff',
    lat: 51.1618,
    lng: -115.5575,
    image: 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=600&q=80',
    highlights: ['Groomed classic & skate', 'Fairmont Banff Springs views', 'Spray River scenery'],
    trailhead: 'Spray River trailhead, Bow Falls parking area',
    parksCanadaUrl: 'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/banff',
    transitAccessible: true,
    transitRoute: 'Roam Route 1 to Banff Springs',
    status: 'open',
    conditionNote: 'Groomed regularly Dec-Mar',
    conditionUpdated: '2026-03-29',
    parkingCapacity: '30 vehicles',
    crowdLevel: { summer: 'low', winter: 'medium' },
  },
  {
    id: 'tunnel-mountain-winter',
    name: 'Tunnel Mountain Winter Trails',
    slug: 'tunnel-mountain-winter',
    description: 'A network of groomed winter trails around Tunnel Mountain, perfect for beginner cross-country skiers and snowshoers.',
    longDescription: 'The Tunnel Mountain winter trail network offers the most accessible cross-country skiing in Banff National Park. Located right in Banff townsite, the trails wind through the campground area and surrounding forest. Parks Canada grooms several loops for classic technique, ranging from 1-5 km. The gentle terrain and proximity to town make this the ideal spot for beginners, families, and anyone wanting a quick ski without a long drive to a trailhead.',
    difficulty: 'easy',
    distance: '5 km network',
    elevationGain: '30 m',
    elevationLoss: '30 m',
    time: '1-2 hrs',
    season: 'winter',
    type: 'trail',
    area: 'Banff',
    lat: 51.1782,
    lng: -115.5512,
    image: 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=600&q=80',
    highlights: ['Beginner-friendly groomed loops', 'Walking distance from town', 'Family-friendly'],
    trailhead: 'Tunnel Mountain campground area',
    parksCanadaUrl: 'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/banff',
    transitAccessible: true,
    transitRoute: 'Roam Route 2',
    status: 'open',
    conditionNote: 'Groomed regularly Dec-Mar',
    conditionUpdated: '2026-03-29',
    parkingCapacity: '15 vehicles',
    crowdLevel: { summer: 'low', winter: 'medium' },
  },
  {
    id: 'johnston-canyon-ice-walk',
    name: 'Johnston Canyon Ice Walk',
    slug: 'johnston-canyon-ice-walk',
    description: 'A spectacular winter walk through frozen Johnston Canyon to see ice-encased waterfalls and dramatic ice formations.',
    longDescription: 'Johnston Canyon transforms into an ice wonderland in winter, with frozen waterfalls creating towering walls of blue and white ice. The catwalks and trail to the Lower Falls (1.1 km) and Upper Falls (2.7 km) remain accessible throughout winter, though ice cleats are essential. Guided ice walk tours are popular and include icecleats and interpretation. The experience is completely different from summer — quieter, more dramatic, and the frozen falls are genuinely awe-inspiring.',
    difficulty: 'easy',
    distance: '5.4 km return to Upper Falls',
    elevationGain: '120 m',
    elevationLoss: '120 m',
    time: '2-3 hrs',
    season: 'winter',
    type: 'trail',
    area: 'Castle Junction',
    lat: 51.2454,
    lng: -115.8396,
    image: 'https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=600&q=80',
    highlights: ['Frozen waterfalls', 'Ice cleats required', 'Guided tours available'],
    trailhead: 'Johnston Canyon parking lot, Bow Valley Parkway',
    parksCanadaUrl: 'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/1A',
    transitAccessible: false,
    status: 'open',
    conditionNote: 'Ice cleats essential Nov-Apr',
    conditionUpdated: '2026-03-29',
    parkingCapacity: '50 vehicles',
    crowdLevel: { summer: 'high', winter: 'medium' },
  },
  {
    id: 'lake-louise-lakeshore-snowshoe',
    name: 'Lake Louise Lakeshore Snowshoe',
    slug: 'lake-louise-lakeshore-snowshoe',
    description: 'A magical winter snowshoe along frozen Lake Louise with Victoria Glacier towering above — one of the most iconic winter scenes in the Rockies.',
    longDescription: 'Walking across frozen Lake Louise in winter is a bucket-list experience. The lake freezes solid from December, and Parks Canada maintains a cleared walking path across the surface. Snowshoeing along the lakeshore and onto the frozen lake provides completely different perspectives of Victoria Glacier and the surrounding peaks. Snowshoe rentals are available at the Fairmont Chateau Lake Louise and several shops in Lake Louise village. The combination of the frozen turquoise ice, snow-covered peaks, and the grand Chateau backdrop is unforgettable.',
    difficulty: 'easy',
    distance: '4 km return',
    elevationGain: '0 m',
    elevationLoss: '0 m',
    time: '1.5 hrs',
    season: 'winter',
    type: 'lake',
    area: 'Lake Louise',
    lat: 51.4167,
    lng: -116.1767,
    image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&q=80',
    highlights: ['Frozen Lake Louise', 'Victoria Glacier views', 'Snowshoe rental available'],
    trailhead: 'Fairmont Chateau Lake Louise',
    parksCanadaUrl: 'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/lakelouise',
    transitAccessible: true,
    transitRoute: 'Parks Canada shuttle (seasonal)',
    status: 'open',
    conditionNote: 'Lake frozen Dec-Apr',
    conditionUpdated: '2026-03-29',
    parkingCapacity: '400 vehicles (fills early)',
    crowdLevel: { summer: 'high', winter: 'high' },
  },
  {
    id: 'marble-canyon-snowshoe',
    name: 'Marble Canyon Snowshoe',
    slug: 'marble-canyon-snowshoe',
    description: 'A quiet snowshoe through a narrow marble canyon in Kootenay National Park, just 30 minutes from Banff — far fewer crowds than Johnston Canyon.',
    longDescription: 'Marble Canyon is the insider alternative to Johnston Canyon in winter. Located just across the border in Kootenay National Park (30 minutes from Banff), this short trail follows a narrow canyon carved through marble and limestone. In winter, ice formations coat the canyon walls and the creek below runs beneath a layer of blue ice. The trail crosses several bridges over the canyon, each offering increasingly dramatic views. Snowshoes or microspikes are recommended. You will need a Parks Canada pass for Kootenay as well.',
    difficulty: 'easy',
    distance: '1.6 km return',
    elevationGain: '35 m',
    elevationLoss: '35 m',
    time: '45 min',
    season: 'winter',
    type: 'trail',
    area: 'Castle Junction',
    lat: 51.1794,
    lng: -116.1172,
    image: 'https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=600&q=80',
    highlights: ['Frozen canyon walls', 'Far fewer crowds than Johnston Canyon', 'Kootenay National Park'],
    trailhead: 'Marble Canyon parking, Highway 93 South',
    parksCanadaUrl: 'https://www.pc.gc.ca/en/pn-np/bc/kootenay',
    transitAccessible: false,
    status: 'open',
    conditionNote: 'Microspikes recommended Nov-Apr',
    conditionUpdated: '2026-03-29',
    parkingCapacity: '25 vehicles',
    crowdLevel: { summer: 'medium', winter: 'low' },
  },
  {
    id: 'ink-pots-snowshoe',
    name: 'Ink Pots Winter Snowshoe',
    slug: 'ink-pots-snowshoe',
    description: 'A longer snowshoe through Johnston Canyon and beyond to the Ink Pots — bubbling mineral springs that stay unfrozen all winter.',
    longDescription: 'The Ink Pots snowshoe extends beyond Johnston Canyon Upper Falls to reach a group of natural mineral springs in an open meadow. The springs bubble up through coloured pools that remain unfrozen even in the deepest cold, creating a surreal contrast against the snowy landscape. The route follows the Johnston Canyon trail (ice cleats needed for the canyon section) then continues through forest to the open meadow. At 11.6 km return, this is a solid half-day winter outing requiring good fitness and proper gear.',
    difficulty: 'moderate',
    distance: '11.6 km return',
    elevationGain: '310 m',
    elevationLoss: '310 m',
    time: '4-5 hrs',
    season: 'winter',
    type: 'trail',
    area: 'Castle Junction',
    lat: 51.2531,
    lng: -115.8561,
    image: 'https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=600&q=80',
    highlights: ['Unfrozen mineral springs in winter', 'Through Johnston Canyon', 'Remote meadow setting'],
    trailhead: 'Johnston Canyon parking lot, Bow Valley Parkway',
    parksCanadaUrl: 'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/1A',
    transitAccessible: false,
    status: 'open',
    conditionNote: 'Ice cleats + snowshoes needed',
    conditionUpdated: '2026-03-29',
    parkingCapacity: '50 vehicles',
    crowdLevel: { summer: 'medium', winter: 'low' },
  },
  {
    id: 'goat-creek-xc-ski',
    name: 'Goat Creek Cross-Country Ski Trail',
    slug: 'goat-creek-xc-ski',
    description: 'A classic point-to-point ski trail from Canmore to Banff following Goat Creek through spectacular Spray Valley scenery.',
    longDescription: 'Goat Creek is one of the signature cross-country ski routes in the Canadian Rockies, running from the Smith-Dorrien Highway near Canmore down to the Banff Springs Golf Course. The trail follows Goat Creek through the Spray Valley with views of Mount Rundle, Ha Ling Peak, and the Spray Range. It is predominantly downhill from the Canmore end, losing about 300 m over 19 km, making it a fast and exhilarating classic ski. Most people arrange a shuttle or taxi for the return. Not groomed by Parks Canada but well-tracked by regular use.',
    difficulty: 'moderate',
    distance: '19 km one way',
    elevationGain: '50 m',
    elevationLoss: '350 m',
    time: '4-6 hrs',
    season: 'winter',
    type: 'trail',
    area: 'Banff',
    lat: 51.1181,
    lng: -115.4406,
    image: 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=600&q=80',
    highlights: ['Point-to-point Canmore to Banff', 'Predominantly downhill', 'Spray Valley scenery'],
    trailhead: 'Smith-Dorrien Highway parking (Canmore end)',
    parksCanadaUrl: 'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/banff',
    transitAccessible: false,
    status: 'caution',
    conditionNote: 'Variable conditions, check current reports.',
    conditionUpdated: '2026-03-30',
    parkingCapacity: '10 vehicles at trailhead',
    crowdLevel: { summer: 'low', winter: 'medium' },
  },
  {
    id: 'healy-creek-xc-ski',
    name: 'Healy Creek Cross-Country Ski Trail',
    slug: 'healy-creek-xc-ski',
    description: 'A groomed backcountry ski trail following Healy Creek toward Sunshine Village, offering peaceful forest skiing with mountain views.',
    longDescription: 'The Healy Creek trail follows the summer hiking route toward Sunshine Meadows, but in winter it becomes a lovely cross-country ski through dense forest along Healy Creek. Parks Canada grooms the first section for classic technique. The terrain is gently rolling with a few short climbs, making it suitable for intermediate skiers. The surrounding peaks and quiet forest provide a genuine backcountry feel despite being relatively close to the Sunshine Village access road.',
    difficulty: 'moderate',
    distance: '9 km return',
    elevationGain: '150 m',
    elevationLoss: '150 m',
    time: '2-3 hrs',
    season: 'winter',
    type: 'trail',
    area: 'Banff',
    lat: 51.1352,
    lng: -115.7558,
    image: 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=600&q=80',
    highlights: ['Groomed classic track', 'Backcountry forest skiing', 'Mountain creek scenery'],
    trailhead: 'Sunshine Village access road, Bourgeau parking lot',
    parksCanadaUrl: 'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/banff',
    transitAccessible: false,
    status: 'open',
    conditionNote: 'Groomed regularly Dec-Mar',
    conditionUpdated: '2026-03-29',
    parkingCapacity: '15 vehicles',
    crowdLevel: { summer: 'low', winter: 'low' },
  },
  {
    id: 'golf-course-loop-xc-ski',
    name: 'Banff Golf Course Loop',
    slug: 'golf-course-loop-xc-ski',
    description: 'The easiest and most accessible cross-country ski loop in Banff — flat terrain on the golf course with elk sightings almost guaranteed.',
    longDescription: 'The Banff Golf Course transforms into a beginner-friendly cross-country ski area in winter. The flat, open terrain is perfect for first-timers learning Nordic technique, and Parks Canada grooms several loops for classic skiing. The open fairways provide clear views of Mount Rundle, Cascade Mountain, and Sulphur Mountain. Elk commonly graze on the golf course throughout winter — you will almost certainly see them. This is the best place in Banff for a first-ever cross-country ski experience.',
    difficulty: 'easy',
    distance: '5 km loop',
    elevationGain: '10 m',
    elevationLoss: '10 m',
    time: '1-1.5 hrs',
    season: 'winter',
    type: 'trail',
    area: 'Banff',
    lat: 51.1908,
    lng: -115.5642,
    image: 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=600&q=80',
    highlights: ['Flat beginner-friendly terrain', 'Almost guaranteed elk sightings', 'Mountain panorama'],
    trailhead: 'Banff Springs Golf Course parking',
    parksCanadaUrl: 'https://www.pc.gc.ca/en/pn-np/ab/banff/activ/randonnee-hiking/banff',
    transitAccessible: true,
    transitRoute: 'Roam Route 1',
    status: 'open',
    conditionNote: 'Groomed regularly Dec-Mar',
    conditionUpdated: '2026-03-29',
    parkingCapacity: '30 vehicles',
    crowdLevel: { summer: 'low', winter: 'medium' },
  },
];
