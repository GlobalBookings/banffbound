export interface Trail {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
  distance: string;
  elevationGain: string;
  time: string;
  season: 'year-round' | 'summer' | 'winter';
  type: 'trail' | 'viewpoint' | 'lake';
  lat: number;
  lng: number;
  image: string;
  highlights: string[];
}

export const trails: Trail[] = [
  // ── Hiking Trails ─────────────────────────────────────────────────────
  {
    id: 'johnston-canyon-lower-falls',
    name: 'Johnston Canyon Lower Falls',
    description:
      'A well-maintained catwalk trail bolted into limestone canyon walls leading to a stunning lower waterfall. The path crosses the creek multiple times and offers incredible views of the turquoise water below.',
    difficulty: 'easy',
    distance: '2.4 km return',
    elevationGain: '30 m',
    time: '1-1.5 hours',
    season: 'year-round',
    type: 'trail',
    lat: 51.2455,
    lng: -115.8388,
    image:
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80',
    highlights: [
      'Catwalks through limestone canyon',
      'Turquoise creek views',
      'Accessible lower waterfall',
    ],
  },
  {
    id: 'johnston-canyon-upper-falls-ink-pots',
    name: 'Johnston Canyon Upper Falls + Ink Pots',
    description:
      'Continue past the lower falls to a thundering 30-metre upper waterfall, then onward through open meadows to the Ink Pots — five cold-water springs with vivid green and blue pools. A rewarding full-day hike.',
    difficulty: 'moderate',
    distance: '11.6 km return',
    elevationGain: '215 m',
    time: '4-5 hours',
    season: 'summer',
    type: 'trail',
    lat: 51.2455,
    lng: -115.8388,
    image:
      'https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=600&q=80',
    highlights: [
      '30-metre upper waterfall',
      'Ink Pots cold-water springs',
      'Wildflower meadows',
    ],
  },
  {
    id: 'tunnel-mountain',
    name: 'Tunnel Mountain',
    description:
      'The shortest and most accessible summit hike in Banff, climbing through Douglas fir forest to panoramic views of the Bow Valley, Banff townsite, and surrounding peaks. Perfect for a morning warm-up.',
    difficulty: 'easy',
    distance: '4.3 km return',
    elevationGain: '260 m',
    time: '1.5-2 hours',
    season: 'year-round',
    type: 'trail',
    lat: 51.1797,
    lng: -115.5567,
    image:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
    highlights: [
      '360° Bow Valley panorama',
      'Banff townsite views',
      'Family-friendly summit hike',
    ],
  },
  {
    id: 'bow-river-hoodoos',
    name: 'Bow River / Hoodoos Trail',
    description:
      'A scenic riverside trail from Surprise Corner to the famous Hoodoos — towering pillars of cemented sand and gravel. Flat and easy, with excellent wildlife spotting opportunities along the Bow River.',
    difficulty: 'easy',
    distance: '4.8 km one way',
    elevationGain: '60 m',
    time: '1.5-2 hours',
    season: 'year-round',
    type: 'trail',
    lat: 51.1687,
    lng: -115.5544,
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
    highlights: [
      'Hoodoo rock formations',
      'Bow River scenery',
      'Wildlife spotting along the river',
    ],
  },
  {
    id: 'fenland-trail',
    name: 'Fenland Trail',
    description:
      'A peaceful loop through a montane wetland ecosystem on the edge of Banff. Boardwalks wind through old-growth spruce forest with chances to see elk, beaver, and great blue herons.',
    difficulty: 'easy',
    distance: '2.1 km loop',
    elevationGain: '10 m',
    time: '0.5-1 hour',
    season: 'year-round',
    type: 'trail',
    lat: 51.1854,
    lng: -115.5834,
    image:
      'https://images.unsplash.com/photo-1511497584788-876760111969?w=600&q=80',
    highlights: [
      'Montane wetland ecosystem',
      'Old-growth spruce forest',
      'Beaver and elk sightings',
    ],
  },
  {
    id: 'lake-louise-lakeshore',
    name: 'Lake Louise Lakeshore',
    description:
      "A flat, paved shoreline walk along one of the world's most photographed lakes. Victoria Glacier gleams at the far end while the turquoise water reflects surrounding peaks.",
    difficulty: 'easy',
    distance: '3.8 km return',
    elevationGain: '20 m',
    time: '1-1.5 hours',
    season: 'year-round',
    type: 'trail',
    lat: 51.4167,
    lng: -116.1773,
    image:
      'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&q=80',
    highlights: [
      'Iconic turquoise lake',
      'Victoria Glacier views',
      'Wheelchair-accessible path',
    ],
  },
  {
    id: 'lake-agnes-tea-house',
    name: 'Lake Agnes Tea House',
    description:
      'A classic Rockies hike ascending through subalpine forest to a heritage tea house perched beside alpine Lake Agnes. Enjoy fresh tea and treats earned by switchbacks and stunning views.',
    difficulty: 'moderate',
    distance: '7.0 km return',
    elevationGain: '400 m',
    time: '3-4 hours',
    season: 'summer',
    type: 'trail',
    lat: 51.4167,
    lng: -116.1773,
    image:
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&q=80',
    highlights: [
      'Historic tea house (est. 1901)',
      'Alpine Lake Agnes',
      'Mirror Lake en route',
    ],
  },
  {
    id: 'sulphur-mountain',
    name: 'Sulphur Mountain',
    description:
      'A well-graded switchback trail climbing through dense forest to the Banff Gondola summit station. Sweeping 360° views of the Bow Valley, Spray Valley, and six mountain ranges await at the top.',
    difficulty: 'moderate',
    distance: '11.0 km return',
    elevationGain: '700 m',
    time: '4-5 hours',
    season: 'year-round',
    type: 'trail',
    lat: 51.1503,
    lng: -115.5819,
    image:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
    highlights: [
      'Summit boardwalk & cosmic ray station',
      'Six mountain range panorama',
      'Option to gondola down',
    ],
  },
  {
    id: 'sunshine-meadows',
    name: 'Sunshine Meadows',
    description:
      'Alpine meadows exploding with wildflowers above the treeline, accessed via shuttle from Sunshine Village ski resort. The Continental Divide trail connects several pristine alpine lakes.',
    difficulty: 'moderate',
    distance: '8.0 km loop',
    elevationGain: '250 m',
    time: '3-4 hours',
    season: 'summer',
    type: 'trail',
    lat: 51.0715,
    lng: -115.7722,
    image:
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80',
    highlights: [
      'Alpine wildflower meadows',
      'Continental Divide views',
      'Rock Isle, Grizzly & Larix Lakes',
    ],
  },
  {
    id: 'c-level-cirque',
    name: 'C-Level Cirque',
    description:
      'A steady climb past old coal mine ruins into a dramatic glacial cirque beneath Cascade Mountain. The amphitheatre of sheer rock walls rewards hikers with solitude and stunning geology.',
    difficulty: 'moderate',
    distance: '7.8 km return',
    elevationGain: '455 m',
    time: '3-4 hours',
    season: 'summer',
    type: 'trail',
    lat: 51.2287,
    lng: -115.5267,
    image:
      'https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=600&q=80',
    highlights: [
      'Historic coal mine ruins',
      'Glacial cirque amphitheatre',
      'Lake Minnewanka views',
    ],
  },
  {
    id: 'sentinel-pass',
    name: 'Sentinel Pass',
    description:
      'One of the highest points reachable by trail in the Canadian Rockies at 2,611 m. The route climbs steeply through Larch Valley past golden larches in fall, then up a final scree slope to the pass.',
    difficulty: 'challenging',
    distance: '11.6 km return',
    elevationGain: '725 m',
    time: '5-6 hours',
    season: 'summer',
    type: 'trail',
    lat: 51.3185,
    lng: -116.2082,
    image:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
    highlights: [
      'Highest trail-accessible pass in the Rockies',
      'Golden larch trees in fall',
      'Valley of the Ten Peaks views',
    ],
  },
  {
    id: 'plain-of-six-glaciers',
    name: 'Plain of Six Glaciers',
    description:
      'A spectacular trail from the far end of Lake Louise into a glacial amphitheatre surrounded by six glaciers. A rustic tea house at the 5.5 km mark offers refreshments and jaw-dropping scenery.',
    difficulty: 'moderate',
    distance: '13.8 km return',
    elevationGain: '365 m',
    time: '4-5 hours',
    season: 'summer',
    type: 'trail',
    lat: 51.4167,
    lng: -116.1773,
    image:
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&q=80',
    highlights: [
      'Six glacier panorama',
      'Rustic tea house',
      'Glacial moraine landscape',
    ],
  },
  {
    id: 'moraine-lake-rockpile',
    name: 'Moraine Lake Rockpile',
    description:
      'A short, steep scramble up a glacial debris pile to the most iconic viewpoint in the Canadian Rockies — the Valley of the Ten Peaks reflected in vivid turquoise water. The old twenty-dollar bill view.',
    difficulty: 'easy',
    distance: '0.6 km return',
    elevationGain: '24 m',
    time: '0.5 hours',
    season: 'summer',
    type: 'trail',
    lat: 51.3217,
    lng: -116.1860,
    image:
      'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&q=80',
    highlights: [
      'Valley of the Ten Peaks panorama',
      'Iconic $20 bill viewpoint',
      'Turquoise glacial lake',
    ],
  },
  {
    id: 'cascade-amphitheatre',
    name: 'Cascade Amphitheatre',
    description:
      'A challenging day hike into a massive natural amphitheatre beneath the summit of Cascade Mountain. The trail traverses alpine meadows bursting with wildflowers before entering a dramatic cirque.',
    difficulty: 'challenging',
    distance: '13.2 km return',
    elevationGain: '640 m',
    time: '5-7 hours',
    season: 'summer',
    type: 'trail',
    lat: 51.2032,
    lng: -115.5711,
    image:
      'https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=600&q=80',
    highlights: [
      'Massive natural amphitheatre',
      'Alpine wildflower meadows',
      'Cascade Mountain views',
    ],
  },
  {
    id: 'cory-pass',
    name: 'Cory Pass',
    description:
      "A strenuous scramble to an exposed mountain pass with vertigo-inducing views down into Gargoyle Valley. Narrow ridges and loose rock make this one of Banff's most thrilling and demanding day hikes.",
    difficulty: 'challenging',
    distance: '13.0 km loop',
    elevationGain: '915 m',
    time: '6-8 hours',
    season: 'summer',
    type: 'trail',
    lat: 51.1918,
    lng: -115.6339,
    image:
      'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=600&q=80',
    highlights: [
      'Exposed ridge scrambling',
      'Gargoyle Valley views',
      'Mount Louis panorama',
    ],
  },
  {
    id: 'parker-ridge',
    name: 'Parker Ridge',
    description:
      'A short but rewarding trail above the treeline on the Icefields Parkway, revealing a stunning panorama of the Saskatchewan Glacier — the largest outflow of the Columbia Icefield. Wildflowers carpet the ridge in summer.',
    difficulty: 'moderate',
    distance: '4.4 km return',
    elevationGain: '210 m',
    time: '1.5-2 hours',
    season: 'summer',
    type: 'trail',
    lat: 51.9828,
    lng: -116.8350,
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
    highlights: [
      'Saskatchewan Glacier viewpoint',
      'Above-treeline alpine tundra',
      'Wildflower-covered ridgeline',
    ],
  },
  {
    id: 'helen-lake',
    name: 'Helen Lake',
    description:
      'A steady climb through subalpine forest opening to expansive alpine meadows and a pristine glacial lake ringed by towering peaks. One of the finest moderate day hikes along the Icefields Parkway.',
    difficulty: 'moderate',
    distance: '12.0 km return',
    elevationGain: '455 m',
    time: '4-5 hours',
    season: 'summer',
    type: 'trail',
    lat: 51.9320,
    lng: -116.7540,
    image:
      'https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=600&q=80',
    highlights: [
      'Alpine meadow wildflowers',
      'Pristine glacial lake',
      'Cirque Peak backdrop',
    ],
  },
  {
    id: 'boom-lake',
    name: 'Boom Lake',
    description:
      'A gentle forested trail leading to a large turquoise lake backed by the dramatic Boom Mountain cliffs. Quieter than many Banff classics, it offers peaceful shoreline exploration and reflection.',
    difficulty: 'easy',
    distance: '10.2 km return',
    elevationGain: '175 m',
    time: '3-4 hours',
    season: 'summer',
    type: 'trail',
    lat: 51.2344,
    lng: -116.2833,
    image:
      'https://images.unsplash.com/photo-1511497584788-876760111969?w=600&q=80',
    highlights: [
      'Turquoise alpine lake',
      'Boom Mountain cliffs',
      'Quiet forested trail',
    ],
  },
  {
    id: 'stanley-glacier',
    name: 'Stanley Glacier',
    description:
      'A fascinating hike through a fire-regenerated forest into a hanging valley dominated by the Stanley Glacier. The landscape showcases the power of both fire and ice in shaping the Rockies.',
    difficulty: 'moderate',
    distance: '8.4 km return',
    elevationGain: '350 m',
    time: '3-4 hours',
    season: 'summer',
    type: 'trail',
    lat: 51.1758,
    lng: -116.2080,
    image:
      'https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=600&q=80',
    highlights: [
      'Stanley Glacier views',
      'Fire-regenerated forest',
      'Hanging valley landscape',
    ],
  },

  // ── Viewpoints ────────────────────────────────────────────────────────
  {
    id: 'surprise-corner',
    name: 'Surprise Corner',
    description:
      "A short walk from downtown Banff to a dramatic viewpoint revealing the Fairmont Banff Springs Hotel framed by the Bow River gorge and Sulphur Mountain. A photographer's favourite any season.",
    difficulty: 'easy',
    distance: '0.5 km return',
    elevationGain: '15 m',
    time: '15 minutes',
    season: 'year-round',
    type: 'viewpoint',
    lat: 51.1657,
    lng: -115.5588,
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
    highlights: [
      'Banff Springs Hotel vista',
      'Bow River gorge',
      'Spray Valley panorama',
    ],
  },
  {
    id: 'banff-gondola-summit',
    name: 'Banff Gondola Summit',
    description:
      'Ride the Banff Gondola to the summit of Sulphur Mountain at 2,281 m for sweeping views of the Bow Valley and six mountain ranges. A boardwalk leads to the historic Cosmic Ray Station.',
    difficulty: 'easy',
    distance: '1.0 km boardwalk',
    elevationGain: '0 m (gondola)',
    time: '1-2 hours',
    season: 'year-round',
    type: 'viewpoint',
    lat: 51.1483,
    lng: -115.5586,
    image:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
    highlights: [
      'Six mountain range panorama',
      'Summit boardwalk',
      'Cosmic Ray Station National Historic Site',
    ],
  },
  {
    id: 'peyto-lake-viewpoint',
    name: 'Peyto Lake Viewpoint',
    description:
      'A short uphill walk from Bow Summit to one of the most iconic viewpoints in the Canadian Rockies. The wolf-head-shaped Peyto Lake glows an otherworldly blue from glacial rock flour.',
    difficulty: 'easy',
    distance: '1.4 km return',
    elevationGain: '45 m',
    time: '30 minutes',
    season: 'summer',
    type: 'viewpoint',
    lat: 51.7253,
    lng: -116.5092,
    image:
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&q=80',
    highlights: [
      'Wolf-head shaped turquoise lake',
      'Mistaya River valley views',
      'Highest point on Icefields Parkway',
    ],
  },
  {
    id: 'lake-minnewanka-viewpoint',
    name: 'Lake Minnewanka Viewpoint',
    description:
      "A scenic viewpoint overlooking Banff's largest lake, stretching 21 km beneath the Palliser Range. The area is rich in wildlife and the lake conceals the ghost town of Minnewanka Landing beneath its surface.",
    difficulty: 'easy',
    distance: '0.3 km return',
    elevationGain: '5 m',
    time: '15 minutes',
    season: 'year-round',
    type: 'viewpoint',
    lat: 51.2350,
    lng: -115.4910,
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
    highlights: [
      "Banff's largest lake",
      'Submerged ghost town history',
      'Palliser Range backdrop',
    ],
  },
  {
    id: 'morants-curve',
    name: "Morant's Curve",
    description:
      'A legendary railway photography spot on the Bow Valley Parkway where freight trains curve through the Bow Valley with storm-capped peaks behind. Named after CPR photographer Nicholas Morant.',
    difficulty: 'easy',
    distance: '0.1 km',
    elevationGain: '0 m',
    time: '15-30 minutes',
    season: 'year-round',
    type: 'viewpoint',
    lat: 51.2678,
    lng: -115.9225,
    image:
      'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=600&q=80',
    highlights: [
      'Iconic railway photography spot',
      'Bow Valley panorama',
      'Freight trains against mountain peaks',
    ],
  },
  {
    id: 'bow-summit',
    name: 'Bow Summit',
    description:
      'The highest point accessible by road on the Icefields Parkway at 2,069 m, offering access to the Peyto Lake viewpoint and panoramic views of the Waputik Range and Bow Glacier.',
    difficulty: 'easy',
    distance: '0.8 km return',
    elevationGain: '25 m',
    time: '20 minutes',
    season: 'summer',
    type: 'viewpoint',
    lat: 51.7269,
    lng: -116.4975,
    image:
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80',
    highlights: [
      'Highest driveable point on Icefields Parkway',
      'Waputik Range panorama',
      'Gateway to Peyto Lake trail',
    ],
  },

  // ── Lakes ─────────────────────────────────────────────────────────────
  {
    id: 'lake-louise',
    name: 'Lake Louise',
    description:
      'The crown jewel of the Canadian Rockies, this emerald-turquoise lake sits beneath Victoria Glacier at 1,750 m. In summer the water glows vivid turquoise; in winter it becomes a natural skating rink.',
    difficulty: 'easy',
    distance: '3.8 km lakeshore',
    elevationGain: '20 m',
    time: '1-1.5 hours',
    season: 'year-round',
    type: 'lake',
    lat: 51.4167,
    lng: -116.1773,
    image:
      'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&q=80',
    highlights: [
      'Victoria Glacier backdrop',
      'Vivid turquoise water',
      'Fairmont Château Lake Louise',
    ],
  },
  {
    id: 'moraine-lake',
    name: 'Moraine Lake',
    description:
      'Nestled in the Valley of the Ten Peaks, Moraine Lake is arguably the most photogenic spot in all of Canada. The impossibly blue water is fed by glacial meltwater and framed by jagged summits.',
    difficulty: 'easy',
    distance: '3.2 km shoreline',
    elevationGain: '30 m',
    time: '1-2 hours',
    season: 'summer',
    type: 'lake',
    lat: 51.3217,
    lng: -116.1860,
    image:
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&q=80',
    highlights: [
      'Valley of the Ten Peaks',
      'Former $20 bill scene',
      'Canoe rentals available',
    ],
  },
  {
    id: 'lake-minnewanka',
    name: 'Lake Minnewanka',
    description:
      "Banff's longest lake at 21 km, framed by the Palliser Range and popular for boating, fishing, and scuba diving over the submerged ghost town of Minnewanka Landing. A scenic drive from Banff townsite.",
    difficulty: 'easy',
    distance: '4.0 km lakeshore',
    elevationGain: '40 m',
    time: '1-2 hours',
    season: 'year-round',
    type: 'lake',
    lat: 51.2337,
    lng: -115.4900,
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
    highlights: [
      'Scuba diving to a ghost town',
      'Boat cruises',
      'Palliser Range shoreline',
    ],
  },
  {
    id: 'two-jack-lake',
    name: 'Two Jack Lake',
    description:
      'A smaller gem near Lake Minnewanka, beloved for its photogenic shoreline with Mount Rundle reflected in calm morning water. Popular for picnics, kayaking, and lakeside camping.',
    difficulty: 'easy',
    distance: '2.5 km shoreline',
    elevationGain: '10 m',
    time: '0.5-1 hour',
    season: 'year-round',
    type: 'lake',
    lat: 51.2200,
    lng: -115.5050,
    image:
      'https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=600&q=80',
    highlights: [
      'Mount Rundle reflections',
      'Lakeside campground',
      'Sunrise photography hotspot',
    ],
  },
  {
    id: 'vermilion-lakes',
    name: 'Vermilion Lakes',
    description:
      'Three shallow lakes just west of Banff offering world-class sunset photography with Mount Rundle as the backdrop. The marshy shoreline attracts elk, osprey, and bald eagles throughout the year.',
    difficulty: 'easy',
    distance: '4.3 km road',
    elevationGain: '0 m',
    time: '1-2 hours',
    season: 'year-round',
    type: 'lake',
    lat: 51.1790,
    lng: -115.6044,
    image:
      'https://images.unsplash.com/photo-1511497584788-876760111969?w=600&q=80',
    highlights: [
      'Sunset photography mecca',
      'Mount Rundle reflections',
      'Elk and osprey habitat',
    ],
  },
  {
    id: 'emerald-lake',
    name: 'Emerald Lake',
    description:
      'The largest lake in Yoho National Park, Emerald Lake gets its vivid green colour from glacial rock flour. A peaceful 5.2 km circuit trail loops the shoreline through avalanche paths and old-growth forest.',
    difficulty: 'easy',
    distance: '5.2 km loop',
    elevationGain: '30 m',
    time: '1.5-2 hours',
    season: 'year-round',
    type: 'lake',
    lat: 51.4430,
    lng: -116.5393,
    image:
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80',
    highlights: [
      'Vivid emerald-green water',
      'Canoe and lodge rentals',
      'Natural bridge nearby',
    ],
  },
  {
    id: 'peyto-lake',
    name: 'Peyto Lake',
    description:
      'A glacially-fed lake on the Icefields Parkway famous for its wolf-head shape and electric-blue colour. Best viewed from the Bow Summit lookout, it is one of the most photographed lakes in the world.',
    difficulty: 'easy',
    distance: '1.4 km to viewpoint',
    elevationGain: '45 m',
    time: '30 minutes',
    season: 'summer',
    type: 'lake',
    lat: 51.7253,
    lng: -116.5092,
    image:
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&q=80',
    highlights: [
      'Wolf-head shaped lake',
      'Glacial rock flour blue',
      'Bow Summit access',
    ],
  },
  {
    id: 'bow-lake',
    name: 'Bow Lake',
    description:
      'A serene lake at the foot of Bow Glacier along the Icefields Parkway. The historic Num-Ti-Jah Lodge sits on its shore, and the lake serves as the headwaters of the Bow River flowing through Banff and Calgary.',
    difficulty: 'easy',
    distance: '3.0 km shoreline',
    elevationGain: '15 m',
    time: '1-1.5 hours',
    season: 'year-round',
    type: 'lake',
    lat: 51.6710,
    lng: -116.4492,
    image:
      'https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=600&q=80',
    highlights: [
      'Bow Glacier headwaters',
      'Historic Num-Ti-Jah Lodge',
      'Icefields Parkway gem',
    ],
  },
];
