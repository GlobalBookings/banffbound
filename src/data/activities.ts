export interface ActivityLocation {
  name: string;
  description: string;
}

export interface Activity {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  season: string;
  difficulty: string;
  image: string;
  category: 'winter' | 'summer';
  gygSearch: string;
  link: string;
  isExternal: boolean;
  locations: ActivityLocation[];
  tips: string[];
}

export const activities: Activity[] = [
  // ═══════════════════════════════════════════════════════════════════════
  // WINTER ACTIVITIES
  // ═══════════════════════════════════════════════════════════════════════
  {
    slug: 'skiing-snowboarding',
    name: 'Skiing & Snowboarding',
    tagline: 'Three World-Class Resorts, One National Park',
    description: 'Three world-class resorts within Banff National Park: Sunshine Village, Lake Louise Ski Resort, and Mt. Norquay. Over 8,000 acres of terrain, champagne powder, and runs for every ability level.',
    season: 'November - May',
    difficulty: 'All Levels',
    image: 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=600&q=80',
    category: 'winter',
    gygSearch: 'Banff Skiing',
    link: '/skiing',
    isExternal: true,
    locations: [
      { name: 'Sunshine Village', description: 'Located 15 minutes from Banff townsite with over 3,300 acres of skiable terrain. Known for receiving the most snow of any Canadian resort — averaging over 9 metres annually. Highest base elevation of any major Canadian ski area at 1,660 m.' },
      { name: 'Lake Louise Ski Resort', description: 'Canada\'s largest ski area with 4,200 acres spread across four mountain faces. Famous for its stunning views of Lake Louise and the Victoria Glacier. Hosts World Cup downhill events. Lift tickets from $139 CAD.' },
      { name: 'Mt. Norquay', description: 'Banff\'s hometown hill, just 6 minutes from town. Great for families and beginners with night skiing available. Also home to a tubing park and the summer Via Ferrata. Lift tickets from $99 CAD.' },
    ],
    tips: [
      'Buy a Tri-Area pass (SkiBig3) to access all three resorts with free shuttle service between them.',
      'Sunshine Village typically opens earliest (early November) and closes latest (late May) thanks to its high elevation.',
      'Mt. Norquay offers the most affordable day passes and is ideal for half-day sessions close to town.',
      'Book ski rentals in Banff town — it\'s often cheaper than renting at the resorts.',
    ],
  },
  {
    slug: 'ice-skating',
    name: 'Ice Skating',
    tagline: 'Glide Across Frozen Mountain Lakes',
    description: 'Glide across the naturally frozen surface of Lake Louise with the iconic Chateau and Victoria Glacier as your backdrop. Skate rentals available on-site. Multiple frozen lakes throughout the park offer unforgettable skating experiences surrounded by towering peaks.',
    season: 'December - March',
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&q=80',
    category: 'winter',
    gygSearch: 'Banff Ice Skating',
    link: '/activities/ice-skating',
    isExternal: false,
    locations: [
      { name: 'Lake Louise', description: 'The iconic frozen lake beneath the Fairmont Chateau Lake Louise. A maintained rink is groomed on the lake surface each winter, surrounded by towering peaks and the Victoria Glacier. Skate rentals available on-site from $12 CAD. Open December to March when ice is thick enough.' },
      { name: 'Vermilion Lakes', description: 'Three shallow lakes just west of Banff townsite off Vermilion Lakes Drive. Less crowded than Lake Louise with stunning views of Mt. Rundle at sunset. Bring your own skates — no rentals on-site. Natural ice conditions vary; check thickness before venturing out.' },
      { name: 'Two Jack Lake', description: 'A beautiful spot near Lake Minnewanka, about 12 km from Banff townsite. Frozen and skateable in deep winter (January–February). Much quieter than Lake Louise with gorgeous views of Mt. Rundle. No facilities — bring your own gear and hot drinks.' },
      { name: 'Johnson Lake', description: 'A small, sheltered lake east of Banff townsite that freezes early and reliably. Popular with locals for a quick after-work skate. Surrounded by forest with views of Cascade Mountain. Free parking and a short walk to the lake shore.' },
    ],
    tips: [
      'Lake Louise rink is maintained by the Fairmont — it\'s the most reliable option with the smoothest ice.',
      'Always check ice thickness before skating on ungroomed natural lakes. Parks Canada posts safety advisories.',
      'Bring warm layers and hand warmers; temperatures can drop well below -20°C in January.',
      'Sunset skates at Vermilion Lakes offer the most photogenic experience with Mt. Rundle turning pink.',
      'Weekday mornings at Lake Louise are the quietest — arrive before 10 AM to avoid crowds.',
    ],
  },
  {
    slug: 'ice-walk-johnston-canyon',
    name: 'Johnston Canyon Ice Walk',
    tagline: 'Explore Frozen Waterfalls on Icy Catwalks',
    description: 'Strap on ice cleats and explore the frozen waterfalls of Johnston Canyon. Guided tours take you past stunning frozen pillars and along icy catwalks bolted to canyon walls for a thrilling winter hiking experience. One of the most popular winter activities in all of Banff National Park.',
    season: 'December - March',
    difficulty: 'Moderate',
    image: 'https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=600&q=80',
    category: 'winter',
    gygSearch: 'Banff Johnston Canyon Ice Walk',
    link: '/activities/ice-walk-johnston-canyon',
    isExternal: false,
    locations: [
      { name: 'Lower Falls', description: 'The first major stop at 1.1 km from the trailhead. A 30-metre frozen waterfall visible from a viewing platform and through a short tunnel carved into the rock. The catwalk trail is well-maintained and suitable for all fitness levels. Allow 30–45 minutes from the parking lot.' },
      { name: 'Upper Falls', description: 'Continue 1.6 km past the Lower Falls to reach the spectacular 30-metre Upper Falls — the tallest frozen waterfall in the canyon. The trail becomes steeper and icier here, making crampons essential. The payoff is a massive wall of blue-white ice cascading into the canyon below.' },
      { name: 'Ink Pots', description: 'For adventurous hikers, continue 3 km past the Upper Falls to the Ink Pots — a collection of colourful mineral springs that remain unfrozen year-round. The springs bubble up in vivid turquoise pools surrounded by snow-covered meadows. Total round trip is about 12 km.' },
      { name: 'Johnston Canyon Trailhead', description: 'Located along the Bow Valley Parkway (Highway 1A), about 25 km west of Banff townsite. Large parking lot that fills quickly on weekends — arrive before 9 AM. The trailhead has washrooms and an information kiosk. Several tour operators offer shuttle service from Banff.' },
    ],
    tips: [
      'Ice cleats or crampons are absolutely essential — the trail is extremely icy in winter. Rent them in Banff for about $10–15 CAD or buy a set at Canadian Tire.',
      'Go early in the morning (before 9 AM) or later in the afternoon to avoid the biggest crowds. This is Banff\'s most popular winter hike.',
      'Guided tours cost $65–85 CAD and include transportation from Banff, ice cleats, and a knowledgeable guide who shares geology and history.',
      'Dress in warm, waterproof layers — the canyon stays shaded and temperatures inside can feel 5–10°C colder than the parking lot.',
      'Trekking poles add extra stability on the icy sections, especially on the steeper climb to the Upper Falls.',
    ],
  },
  {
    slug: 'dog-sledding',
    name: 'Dog Sledding',
    tagline: 'Mush Through a Winter Wonderland',
    description: 'Mush through snow-covered wilderness with a team of eager huskies. Several outfitters offer half-day and full-day tours through the backcountry surrounding Banff and Canmore. An unforgettable way to experience the Rockies in winter — feel the rush of gliding through pristine forest with only the sound of paws on snow.',
    season: 'December - March',
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?w=600&q=80',
    category: 'winter',
    gygSearch: 'Banff Dog Sledding',
    link: '/activities/dog-sledding',
    isExternal: false,
    locations: [
      { name: 'Spray Lakes (Canmore)', description: 'The most popular dog sledding location near Banff, about 20 minutes south of Canmore in Spray Valley Provincial Park. Wide-open frozen reservoir surrounded by the Spray Mountains. Multiple outfitters operate here including Snowy Owl Sled Dog Tours. Tours from $199 CAD per person.' },
      { name: 'Lake Louise Area', description: 'Some operators run tours through the forests near Lake Louise, offering a more intimate, wooded experience through the Bow Valley. Smaller group sizes and beautiful old-growth forest scenery. About 55 km from Banff townsite.' },
      { name: 'Dead Man\'s Flats (Canmore)', description: 'A small community east of Canmore with open terrain perfect for dog sledding. Several operators use trails in the Bow Valley corridor here. Easy access from the Trans-Canada Highway. Free parking at tour staging areas.' },
    ],
    tips: [
      'Book well in advance — dog sledding tours sell out quickly, especially during Christmas and February school breaks.',
      'Most tours last 1–2 hours on the sled plus time to meet and pet the dogs before and after. Budget 3 hours total.',
      'Dress extremely warmly: you\'ll be standing or sitting still on the sled in wind chill that can reach -30°C. Wear ski goggles and a balaclava.',
      'Children as young as 2 can usually ride in the sled basket with an adult. Great family activity.',
      'Tips for your musher are appreciated — $20–40 CAD is standard for a great experience.',
    ],
  },
  {
    slug: 'snowshoeing',
    name: 'Snowshoeing',
    tagline: 'Explore Peaceful Winter Trails',
    description: 'Explore peaceful winter trails through snow-laden forests and across frozen meadows. Snowshoeing is one of the most accessible winter activities in Banff — if you can walk, you can snowshoe. Popular routes include Sundance Canyon, the Spray River loop, and trails around Lake Louise.',
    season: 'November - April',
    difficulty: 'Easy - Moderate',
    image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&q=80',
    category: 'winter',
    gygSearch: 'Banff Snowshoeing',
    link: '/activities/snowshoeing',
    isExternal: false,
    locations: [
      { name: 'Sundance Canyon Trail', description: 'A gentle 4.4 km out-and-back trail starting from Cave and Basin National Historic Site. The paved path follows the Bow River through quiet forest before reaching the frozen Sundance Canyon. Mostly flat and perfect for beginners. Trailhead is a 15-minute walk from downtown Banff.' },
      { name: 'Spray River Loop', description: 'A scenic 12 km loop trail that starts near the Banff Springs Hotel and follows the Spray River through dense spruce forest. Relatively flat with beautiful views of Mt. Rundle and Sulphur Mountain. Allow 3–4 hours. Can be shortened by turning around at the halfway point.' },
      { name: 'Taylor Lake', description: 'A moderately challenging 12.4 km return trail that climbs through subalpine forest to a beautiful frozen lake at 2,065 m elevation. Gains about 585 m. Rewarding views of the surrounding peaks. Trailhead is along the Trans-Canada Highway, 8 km west of Castle Junction.' },
      { name: 'Lake Louise Shoreline', description: 'A flat, easy 4 km return trail that follows the north shore of Lake Louise from the Chateau to the back of the lake. Stunning views of Victoria Glacier the entire way. Perfect for families and beginners. Combine with a hot chocolate at the Chateau afterward.' },
    ],
    tips: [
      'Rent snowshoes in Banff town for $15–25 CAD per day. Several shops on Banff Avenue have rentals.',
      'Carry bear spray even in winter — bears sometimes wake during warm spells. Make noise on the trail.',
      'Adjustable trekking poles are very helpful for balance, especially on hillier terrain.',
      'Layer up but don\'t overdress — snowshoeing is surprisingly cardiovascular and you\'ll warm up fast.',
      'Stay on marked trails to protect wildlife and avoid avalanche terrain. Check Parks Canada trail reports before heading out.',
    ],
  },
  {
    slug: 'northern-lights',
    name: 'Northern Lights Viewing',
    tagline: 'Watch the Aurora Dance Above the Rockies',
    description: 'On clear dark nights, the aurora borealis occasionally dances above the Canadian Rockies in brilliant greens, purples, and pinks. Banff\'s northern latitude (51°N) and dark mountain skies create favourable conditions. Best viewing requires dark skies, clear weather, and elevated solar activity — but when conditions align, the show is absolutely breathtaking.',
    season: 'October - March',
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&q=80',
    category: 'winter',
    gygSearch: 'Banff Northern Lights',
    link: '/activities/northern-lights',
    isExternal: false,
    locations: [
      { name: 'Vermilion Lakes', description: 'Just 5 minutes west of Banff townsite along Vermilion Lakes Drive. The open lakes provide an unobstructed view to the north — the direction you need to watch for auroras. The still water also creates beautiful reflections. Very accessible with roadside parking. One of Banff\'s most popular photography spots.' },
      { name: 'Lake Minnewanka', description: 'Banff\'s largest lake, about 12 km from town. The wide-open shoreline provides expansive views of the northern sky. Much darker than spots closer to town, with minimal light pollution. The parking lot near the dam is the best viewing spot. Dress warmly — it\'s very exposed to wind.' },
      { name: 'Two Jack Lake', description: 'Located near Lake Minnewanka, this smaller lake is a fantastic aurora viewing spot. The iconic Two Jack Lake viewpoint (with the small rock island) faces north perfectly. Less wind exposure than Minnewanka. Arrive early to claim a spot on busy aurora nights.' },
      { name: 'Bow Valley Parkway (Highway 1A)', description: 'Several pullouts along the Bow Valley Parkway between Banff and Lake Louise offer dark skies away from town lights. Look for wide pullouts with northward views. The drive itself is atmospheric at night — keep watch for wildlife on the road.' },
    ],
    tips: [
      'Check the aurora forecast at spaceweatherlive.com or use the My Aurora Forecast app. A Kp index of 4+ gives the best chances for Banff\'s latitude.',
      'The aurora is most active between 10 PM and 2 AM. Be prepared for a late night in very cold temperatures.',
      'Clear skies are essential — check Environment Canada weather forecasts and satellite cloud imagery before driving out.',
      'Your camera can often capture aurora colours invisible to the naked eye. Use a tripod, ISO 1600–3200, and a 10–15 second exposure.',
      'Even if the aurora isn\'t active, Banff\'s dark skies offer incredible stargazing. The Milky Way is clearly visible from these same locations.',
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SUMMER ACTIVITIES
  // ═══════════════════════════════════════════════════════════════════════
  {
    slug: 'hiking',
    name: 'Hiking',
    tagline: 'Over 1,600 km of Mountain Trails',
    description: 'Over 1,600 km of maintained trails ranging from easy lakeside strolls to challenging alpine scrambles. Top picks include Sentinel Pass, Plain of Six Glaciers, Cory Pass, and Sunshine Meadows.',
    season: 'June - October',
    difficulty: 'All Levels',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
    category: 'summer',
    gygSearch: 'Banff Hiking',
    link: '/hiking',
    isExternal: true,
    locations: [
      { name: 'Sentinel Pass', description: 'One of the highest points reachable by maintained trail in the Canadian Rockies at 2,611 m. A challenging 11.6 km return hike from Moraine Lake through the Valley of the Ten Peaks. Breathtaking views from the summit.' },
      { name: 'Plain of Six Glaciers', description: 'A stunning 13.8 km return trail from Lake Louise to a historic teahouse perched below the Victoria Glacier. Moderate difficulty with 365 m elevation gain. The teahouse serves fresh baked goods and hot drinks (summer only).' },
      { name: 'Johnston Canyon', description: 'Banff\'s most popular trail with catwalks bolted to canyon walls leading to the Lower and Upper falls. Easy 5.4 km return to Upper Falls. Continue to the Ink Pots (11.2 km return) for colourful mineral springs.' },
    ],
    tips: [
      'Carry bear spray and know how to use it. Purchase at Parks Canada visitor centres for about $40 CAD.',
      'Start popular trailheads before 8 AM to secure parking and beat the crowds.',
      'Check Parks Canada trail conditions and closures online before heading out.',
      'Bring layers — alpine weather changes quickly and summits can be 10–15°C colder than the valley.',
    ],
  },
  {
    slug: 'canoeing-kayaking',
    name: 'Canoeing & Kayaking',
    tagline: 'Paddle Turquoise Mountain Waters',
    description: 'Paddle the turquoise waters of the Bow River, Lake Louise, Moraine Lake, or Two Jack Lake. Canoe rentals available at most major lakes. An iconic Banff experience that puts you right on the famous glacial waters.',
    season: 'June - September',
    difficulty: 'Easy',
    image: 'https://banfflakelouise.bynder.com/m/1e85056f0193bfe9/1500x915_jpg-2022_LakeLouise_Friends_ROAMCreative.jpg',
    category: 'summer',
    gygSearch: 'Banff Canoe Kayak',
    link: '/paddling',
    isExternal: true,
    locations: [
      { name: 'Lake Louise', description: 'The most iconic paddling spot in the Canadian Rockies. Rent a canoe from the boathouse for $155 CAD per hour and paddle across impossibly turquoise water beneath Victoria Glacier. Arrive before 9 AM to beat the queues.' },
      { name: 'Moraine Lake', description: 'A stunning glacial lake in the Valley of the Ten Peaks. Canoe rentals available on-site for $130 CAD per hour. Smaller and more intimate than Lake Louise. Road open June to October.' },
      { name: 'Bow River', description: 'Gentle current through Banff townsite perfect for beginner paddlers. Several outfitters rent canoes and kayaks from docks along the river. Float trips from Banff to Canmore are a full-day adventure.' },
    ],
    tips: [
      'Lake Louise and Moraine Lake canoe rentals sell out fast — arrive early or book a guided tour.',
      'Water temperatures are near freezing even in summer. Wear layers and bring a dry bag for phones and cameras.',
      'Life jackets are mandatory and provided with all rentals.',
    ],
  },
  {
    slug: 'mountain-biking',
    name: 'Mountain Biking',
    tagline: 'Ride Through Stunning Mountain Scenery',
    description: 'Ride through stunning mountain scenery on trails ranging from gentle paths along the Bow River to technical singletrack in the backcountry. Bike rentals and guided tours available in Banff and Canmore.',
    season: 'May - October',
    difficulty: 'All Levels',
    image: 'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=600&q=80',
    category: 'summer',
    gygSearch: 'Banff Mountain Bike',
    link: '/biking',
    isExternal: true,
    locations: [
      { name: 'Legacy Trail', description: 'A paved 26 km multi-use pathway connecting Banff to Canmore with stunning Bow Valley views. Perfect for road cycling and e-biking.' },
      { name: 'Goat Creek Trail', description: 'A 19 km point-to-point trail from the Smith-Dorrien Road to the Banff Springs Hotel. Mostly downhill when ridden east, with forest singletrack and Spray Valley views.' },
      { name: 'Spray River Loop', description: 'A scenic 12 km loop near the Banff Springs Hotel through dense spruce forest. Well-suited for intermediate riders.' },
    ],
    tips: [
      'Rent bikes in Banff town from $40–80 CAD per day. Most shops include helmets and trail maps.',
      'E-bikes are allowed on paved trails but prohibited on most singletrack in the national park.',
      'Carry bear spray and make noise — wildlife encounters are common on backcountry trails.',
    ],
  },
  {
    slug: 'white-water-rafting',
    name: 'White Water Rafting',
    tagline: 'Ride the Rapids of the Kicking Horse River',
    description: 'Ride the rapids of the Kicking Horse River for class III-IV thrills, or float the gentle Bow River for a family-friendly scenic adventure. Several outfitters run daily trips from Banff throughout the summer season. An adrenaline-pumping way to experience the raw power of the Rocky Mountain rivers.',
    season: 'June - September',
    difficulty: 'Moderate - Hard',
    image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80',
    category: 'summer',
    gygSearch: 'Banff Rafting',
    link: '/activities/white-water-rafting',
    isExternal: false,
    locations: [
      { name: 'Kicking Horse River', description: 'Located near Golden, BC — about 1.5 hours west of Banff via the Trans-Canada Highway. The premier whitewater destination in the Rockies with class III-IV rapids through a dramatic canyon. Full-day trips run the famous "Shotgun" and "Roller Coaster" rapids. Tours from $129 CAD per person including lunch and transport from Banff.' },
      { name: 'Bow River (Banff)', description: 'A gentle scenic float through the heart of Banff townsite and downstream into the Bow Valley. Class I-II rapids suitable for families with children ages 5+. Stunning views of Mt. Rundle, Cascade Mountain, and the Banff Springs Hotel from the water. Half-day trips from $69 CAD.' },
      { name: 'Kananaskis River', description: 'Located about 1 hour southeast of Banff in Kananaskis Country. Class II-III rapids on a dam-controlled river, meaning reliable water levels all summer. Great intermediate option between the gentle Bow and the intense Kicking Horse. Tours from $89 CAD.' },
      { name: 'Horseshoe Canyon (Bow River)', description: 'A scenic stretch of the Bow River west of Canmore featuring class II rapids and beautiful canyon scenery. Perfect for first-time rafters wanting a bit of excitement without the intensity of the Kicking Horse. Suitable for ages 6+. Tours from $79 CAD.' },
    ],
    tips: [
      'The Kicking Horse River peaks in June and early July with snowmelt — this is when the rapids are most intense (class IV). By August, water levels drop to class III.',
      'Wetsuits, helmets, and life jackets are provided by all outfitters. Wear quick-dry clothing underneath — no cotton.',
      'Book morning trips for warmer water and calmer conditions. Afternoon trips can be colder with changing weather.',
      'Most Kicking Horse tours include shuttle service from Banff — the 1.5-hour drive through the mountains is scenic.',
      'Minimum age is usually 12 for the Kicking Horse and 5-6 for the Bow River. Check with your outfitter.',
    ],
  },
  {
    slug: 'wildlife-viewing',
    name: 'Wildlife Viewing',
    tagline: 'Encounter Bears, Elk, and Mountain Goats',
    description: 'Banff is home to grizzly and black bears, elk, bighorn sheep, mountain goats, wolves, and more. Join a guided wildlife safari or keep your eyes peeled on the Bow Valley Parkway. The park\'s protected ecosystem supports an incredible diversity of wildlife — sightings are common year-round.',
    season: 'Year-round',
    difficulty: 'Easy',
    image: 'https://banfflakelouise.bynder.com/m/30543649c0240f70/1500x915_jpg-2024_Wildlife_Wolverine_WillLambert.jpg',
    category: 'summer',
    gygSearch: 'Banff Wildlife',
    link: '/wildlife',
    isExternal: true,
    locations: [
      { name: 'Bow Valley Parkway (Highway 1A)', description: 'The #1 wildlife corridor in Banff. This scenic road between Banff and Lake Louise is famous for bear, elk, deer, and coyote sightings. Drive slowly (60 km/h limit) and scan the meadows, especially at dawn and dusk.' },
      { name: 'Lake Minnewanka Loop', description: 'The road to Lake Minnewanka passes through prime bighorn sheep and deer habitat. Sheep are often seen right on the road. The lake area is also good for osprey, eagles, and occasionally bears.' },
      { name: 'Vermilion Lakes', description: 'Excellent for birdwatching and spotting elk, coyotes, and beavers. The calm waters attract a wide variety of waterfowl. Best at dawn and dusk.' },
    ],
    tips: [
      'Always maintain at least 100 m distance from bears and wolves, and 30 m from elk and deer.',
      'Carry bear spray and know how to use it — available at Parks Canada centres for about $40 CAD.',
      'Dawn and dusk are prime wildlife viewing hours. Bring binoculars and a telephoto lens.',
      'Never feed wildlife — it\'s illegal in national parks and dangerous for both you and the animals.',
    ],
  },
  {
    slug: 'via-ferrata',
    name: 'Via Ferrata at Mt. Norquay',
    tagline: 'Climb the Cliffs with Iron Rungs and Suspension Bridges',
    description: 'A thrilling climbing experience using iron rungs, ladders, and suspension bridges bolted into the cliff face at Mt. Norquay. Guided tours take you to stunning viewpoints with panoramic valley views. No prior climbing experience needed — just a head for heights and a sense of adventure. One of the most unique summer activities in the Canadian Rockies.',
    season: 'June - October',
    difficulty: 'Moderate - Hard',
    image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600&q=80',
    category: 'summer',
    gygSearch: 'Banff Via Ferrata',
    link: '/activities/via-ferrata',
    isExternal: false,
    locations: [
      { name: 'Explorer Route (2.5 hours)', description: 'The introductory route perfect for beginners and families. Features iron rungs, a suspension bridge, and incredible views of the Bow Valley from the cliffs of Mt. Norquay. Minimum age 12. From $159 CAD per person. Includes all safety equipment and a certified guide.' },
      { name: 'Ridgewalker Route (4 hours)', description: 'The intermediate route that extends beyond the Explorer with a dramatic ridge traverse and additional climbing sections. More exposure and longer suspension bridges. Requires reasonable fitness. From $219 CAD per person.' },
      { name: 'Skyline Route (6 hours)', description: 'The ultimate Mt. Norquay Via Ferrata experience — a full-day adventure combining all routes with the highest and most exposed sections. Reaches the summit ridge with 360° panoramic views. From $329 CAD per person. Minimum age 14.' },
      { name: 'Mt. Norquay Base', description: 'Located just 6 km from downtown Banff on Mt. Norquay Road. Free parking at the ski lodge base area. The Cliffhouse Bistro at the top serves food and drinks — a great post-climb reward. Shuttle service available from some Banff hotels.' },
    ],
    tips: [
      'Book well ahead in summer — the Via Ferrata is extremely popular and sells out weeks in advance, especially for weekends.',
      'You don\'t need any climbing experience, but you do need to be comfortable with heights. The exposure is real.',
      'Wear sturdy hiking boots with ankle support — running shoes are not permitted. Long pants recommended to protect against rock scrapes.',
      'All safety gear (harness, helmet, via ferrata set) is provided and the guides are excellent. You\'re clipped in at all times.',
      'The views from the suspension bridges are the highlight — don\'t look down if you\'re nervous, but do look out!',
    ],
  },
];

export const winterActivities = activities.filter(a => a.category === 'winter');
export const summerActivities = activities.filter(a => a.category === 'summer');
