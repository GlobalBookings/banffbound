export interface TownGuide {
  slug: string;
  name: string;
  region: string;
  type: string;
  description: string;
  image: string;
  bestFor: string;
  tags: string[];
  intro: string;
  stay: string;
  transport: string;
  winter: { title: string; text: string }[];
  avoid: string;
  otherSeasons: string;
  hotelArea: string;
  hotelSlugs: string[];
  related: { label: string; href: string }[];
  sources: { label: string; href: string }[];
  faqs: { question: string; answer: string }[];
}

export const towns: TownGuide[] = [
  {
    slug: 'banff', name: 'Banff', region: 'Alberta · Banff National Park', type: 'Mountain town',
    description: 'A practical Banff town guide: where to base yourself, car-free winter days, ski transport, quieter walks and warm places between adventures.',
    image: '/images/blog/banff-town-guide.webp', bestFor: 'A first Rockies trip with easy evenings', tags: ['car-free', 'ski', 'family'],
    intro: 'Choose Banff when the evening matters as much as the mountain. Restaurants, shops and accommodation cluster around Banff Avenue and Bear Street, giving a mixed group room to split up and meet again. The town sits inside Banff National Park; staying in town does not put you on a ski slope. Sunshine, Lake Louise and Norquay all require transport.',
    stay: 'A central address reduces cold walks after dinner. Tunnel Mountain and the northern end of Banff Avenue can suit a quieter stay, but check the exact walk and bus stop rather than relying on a “Banff” address. For a ski trip, map the hotel to the current resort shuttle stop before reserving. A room with space to dry gloves is often more useful than another decorative amenity.',
    transport: 'Banff is our strongest starting choice without a car. Roam serves local routes, Canmore and the Lake Louise area; ski shuttles are a separate service with their own eligibility and stops. Check the operator timetable for your travel date, including the last return. Airport transfers should be booked separately. Snow, icy pavements and luggage make a short-looking walk slower.',
    winter: [
      { title: 'Morning · settle into town', text: 'Start with breakfast near your hotel, collect booked rentals if needed and make a short daylight walk around the town centre. Choose maintained paths that match the day’s conditions. Keep time for a warm drink instead of making arrival day a race to a viewpoint.' },
      { title: 'Afternoon · one main outing', text: 'Pick a resort lesson, a prebooked guided ice walk or an indoor cultural stop. A gondola outing depends on weather and operations. Leave enough daylight and transport margin to return comfortably rather than combining every attraction into one afternoon.' },
      { title: 'Evening · stay close', text: 'Book dinner within a manageable walk of your room. For mixed ski abilities, agree on a town meeting point before heading to different activities. A quiet early night can be the best preparation for the next morning’s lesson.' },
    ],
    avoid: 'Summer hiking descriptions do not establish winter safety. Bow Falls paths, viewpoints and river edges can be icy; stay off river ice and obey closures. Do not assume hot springs, gondolas, museums or special events are operating on your date—check before committing your day.',
    otherSeasons: 'In summer and autumn, use Banff as a base for timed lake transport, lower-elevation walks and longer hiking days. Book popular transport early and keep a weather alternative. Shoulder-season trails can still have winter conditions even when the town is dry.',
    hotelArea: 'Downtown Banff', hotelSlugs: ['moose-hotel-suites', 'mount-royal-hotel', 'tunnel-mountain-resort'],
    related: [{ label: 'Banff town guide', href: '/blog/banff-town-guide' }, { label: 'Car-free Banff', href: '/car-free-banff' }, { label: 'Après-ski ideas', href: '/blog/banff-apres-ski' }],
    sources: [{ label: 'Town of Banff visitor services and updates', href: 'https://banff.ca/' }, { label: 'Roam routes and service updates', href: 'https://roamtransit.com/' }, { label: 'Tourism transit and ski shuttle overview', href: 'https://www.banfflakelouise.com/explore-the-park/transit-shuttles' }],
    faqs: [{ question: 'Can I stay in Banff without a car in winter?', answer: 'Yes, a central hotel, an airport transfer and carefully planned public transit or resort shuttles make this practical. Check each trip and return separately; not every trailhead or attraction has winter transport.' }, { question: 'Are Banff town hotels ski-in, ski-out?', answer: 'No. The three ski resorts are outside the town centre. Sunshine Mountain Lodge is on the mountain at Sunshine Village, rather than in Banff town.' }],
  },
  {
    slug: 'canmore', name: 'Canmore', region: 'Alberta · Bow Valley', type: 'Mountain town',
    description: 'Plan a Canmore stay or day trip: Nordic skiing, winter town time, family suites and realistic connections to Banff and the ski resorts.',
    image: '/images/blog/canmore-day-trip.webp', bestFor: 'Suites, Nordic days and a slower town stay', tags: ['family', 'quiet', 'car-free'],
    intro: 'Canmore is a separate town east of Banff National Park, with its own restaurants, neighbourhoods and winter activities. It works well for a longer stay when a kitchen, grocery stop and relaxed town evening matter. Choose it for Canmore itself, rather than treating every day as a commute to Lake Louise.',
    stay: 'Decide whether you want downtown on foot or a larger suite elsewhere in town. Many accommodation listings sit along Bow Valley Trail or Kananaskis Way, so check the actual distance to dinner and your bus stop. Suite facilities vary by room category: a hotel room in a condo-style property does not necessarily include a kitchen.',
    transport: 'Roam Route 3 links Canmore and Banff, and local Canmore routes cover parts of town. That is not a through ski shuttle. If you plan to connect to a Banff resort bus, check both timetables and allow a generous margin. A vehicle or booked transfer may be more convenient for early ski lessons and activities outside the town centre.',
    winter: [
      { title: 'Morning · learn a new rhythm', text: 'Book a Nordic lesson or rental session at the Canmore Nordic Centre, checking trail status, opening hours and any trail pass first. Treat skate skiing and classic skiing as different equipment choices; the rental desk can help you choose.' },
      { title: 'Afternoon · keep the route local', text: 'Return to town for lunch, shops or an indoor activity. If a riverside path is icy or closed, shorten the walk rather than moving onto the frozen river. A short outing close to a warm stop is a useful option for families.' },
      { title: 'Evening · make the suite work', text: 'Cook an easy meal in a room booked with a full kitchen or choose a nearby restaurant. Dry equipment and check tomorrow’s forecast before deciding whether the next day belongs in Canmore, Banff or Kananaskis.' },
    ],
    avoid: 'Canmore’s summer summit hikes are not beginner winter walks. Ha Ling and similar objectives require a separate winter assessment. Do not assume parking is free everywhere, that a hotel is walkable to downtown, or that Banff ski buses collect from every Canmore property.',
    otherSeasons: 'Warmer months open more walking, biking and hiking possibilities, with trail closures and wildlife restrictions still relevant. Use current Alberta Parks reports for nearby provincial park routes, and Parks Canada information when you enter Banff National Park.',
    hotelArea: 'Canmore', hotelSlugs: ['blackstone-mountain-lodge', 'malcolm-hotel', 'basecamp-lodge-canmore'],
    related: [{ label: 'Canmore day trip', href: '/blog/canmore-day-trip' }, { label: 'Canmore vs Banff', href: '/canmore-vs-banff' }, { label: 'Cross-country skiing', href: '/blog/banff-cross-country-skiing' }],
    sources: [{ label: 'Canmore Kananaskis winter ideas', href: 'https://www.explorecanmore.ca/winter/' }, { label: 'Roam Canmore–Banff Route 3', href: 'https://roamtransit.com/schedules-routes/canmore-banff-regional-route-3/' }, { label: 'Alberta Parks trail reports', href: 'https://www.albertaparks.ca/parks/kananaskis/kananaskis-country/' }],
    faqs: [{ question: 'Do I need a Banff park pass to stay in Canmore?', answer: 'Canmore is outside Banff National Park. Your accommodation there does not itself require Banff park admission, but visiting and stopping in the national park is a separate question. Check current Parks Canada admission rules for your visit.' }, { question: 'Is Canmore always cheaper than Banff?', answer: 'No. Compare the actual dates, room type, fees and transport costs. A suite kitchen can help a longer trip, while daily ski transfers can offset an accommodation saving.' }],
  },
  {
    slug: 'lake-louise', name: 'Lake Louise', region: 'Alberta · Banff National Park', type: 'Village, lakeshore and ski area',
    description: 'Understand Lake Louise village, the lakeshore and the ski resort before booking a winter stay. Practical transport, ski and non-ski planning.',
    image: '/images/blog/lake-louise-village-guide.webp', bestFor: 'Lake Louise ski days and quiet lake scenery', tags: ['ski', 'quiet', 'family'],
    intro: 'Lake Louise has three places that visitors often confuse: the village around Samson Mall, the lake and Chateau farther uphill, and Lake Louise Ski Resort on the other side of the Trans-Canada Highway. They are separate locations. A hotel called “Lake Louise” may be in the village rather than beside the water, and a lakeshore room is not ski-in, ski-out at the resort.',
    stay: 'Choose the village for a practical base near shops and selected ski shuttle pickups. Choose the lakeshore for scenery and a hotel-led stay. If downhill skiing is the priority, confirm the precise route from your accommodation to the ski resort and the first departure that gets you to your lesson in time. Restaurant choice is more limited than in Banff; arrange meals around your transport.',
    transport: 'Roam Route 8X connects Banff and the Lake Louise area year-round, while ski resort buses serve their own stops. The resort’s winter shuttle page had not yet posted the coming winter’s pickup details when checked on 28 October 2026. Use current operator information rather than last winter’s bus times. The Parks Canada lake shuttle is seasonal and is a different service.',
    winter: [
      { title: 'Morning · ski or lakeshore', text: 'Skiers should head straight to their confirmed resort meeting point. Non-skiers can plan a lakeshore visit with a prearranged return. Bring warm footwear even when renting skates; a scenic lake visit need not involve stepping onto the ice.' },
      { title: 'Afternoon · choose the open option', text: 'Use a maintained rink only when the operator confirms it is open. For a walk or snowshoe, ask about a recommended winter route and current hazards. The summer Lake Agnes and Plain of Six Glaciers routes are not casual winter alternatives.' },
      { title: 'Evening · plan around the last ride', text: 'Eat near your accommodation or confirm your ride before booking a lakeshore dinner. Check the ski bus and public transit separately; finishing a ski day does not guarantee an onward lakeshore connection.' },
    ],
    avoid: 'Moraine Lake is not a standard winter sightseeing drive. Do not follow summer hiking plans, walk across unverified lake ice or assume a frozen-looking surface is safe. Ski resort, village and lakeshore travel are separate legs even when all three use the same destination name.',
    otherSeasons: 'Summer and early autumn visits need a different lake-access plan, often built around reserved transport. Turquoise water, canoe rentals and mountain teahouses are seasonal experiences. Check opening dates and trail conditions rather than carrying a winter itinerary into June.',
    hotelArea: 'Lake Louise', hotelSlugs: ['lake-louise-inn', 'fairmont-chateau-lake-louise', 'post-hotel-spa'],
    related: [{ label: 'Lake Louise village guide', href: '/blog/lake-louise-village-guide' }, { label: 'Lake Louise Ski Resort', href: '/blog/lake-louise-ski-resort' }, { label: 'Lake Louise complete guide', href: '/blog/lake-louise-complete-guide' }],
    sources: [{ label: 'Lake Louise official winter ski shuttles', href: 'https://www.skilouise.com/getting-here/by-shuttle/' }, { label: 'Tourism lake and transit access', href: 'https://www.banfflakelouise.com/explore-the-park/transit-shuttles' }, { label: 'Fairmont guest services and winter rentals', href: 'https://www.fairmont.com/en/hotels/lake-louise/fairmont-chateau-lake-louise/guest-services.html' }],
    faqs: [{ question: 'Is Lake Louise Ski Resort at the lake?', answer: 'No. The ski resort, Lake Louise village and Lake Louise lakeshore are three separate places. Confirm the transport for the place you actually want to reach.' }, { question: 'Can I rely on skating for a specific winter date?', answer: 'No. Ice and rink operations depend on conditions. Check with the rink operator and keep an off-ice alternative; a photograph or calendar date does not confirm safe ice.' }],
  },
  {
    slug: 'field-yoho', name: 'Field & Yoho', region: 'British Columbia · Yoho National Park', type: 'Small village and national park',
    description: 'A winter guide to Field and Yoho National Park, including Emerald Lake, realistic road access, quiet lodge stays and important trail limits.',
    image: '/images/blog/emerald-lake-guide.webp', bestFor: 'A quiet overnight stay beyond Lake Louise', tags: ['quiet'],
    intro: 'Field is a small village in Yoho National Park, west of Lake Louise across the provincial border. Yoho is the surrounding national park, not another name for Banff. This is a good choice when you want a quieter overnight stop, a lodge stay or a carefully selected winter outing rather than a full menu of town entertainment.',
    stay: 'A Field guesthouse and an Emerald Lake lodge stay create different trips. Emerald Lake is reached on its own road, outside the village; confirm meals, winter arrival arrangements and transport before reserving. Buy essentials before leaving a larger centre and check opening hours for the small number of local services.',
    transport: 'Plan around a winter-equipped vehicle or a specifically confirmed private transfer. Banff’s local Roam network is not an all-purpose connection to Field or Emerald Lake. Check DriveBC before crossing Kicking Horse Pass and leave room for road delays. A hotel shuttle from its guest car park is not an intercity transfer.',
    winter: [
      { title: 'Morning · arrive with a plan', text: 'Check the road report and Yoho trail bulletins before leaving. Keep the first stop simple: a village look around, a meal if open, or your lodge arrival. Avoid a long outdoor objective after a delayed drive.' },
      { title: 'Afternoon · use the winter trail information', text: 'Choose a short route from Parks Canada’s winter trail guidance that fits the least experienced person. Emerald Lake has avalanche exposure in parts of its surroundings; a summer loop description is not permission to walk the whole shoreline in winter. Follow the current signs and route limits.' },
      { title: 'Evening · enjoy staying put', text: 'Reserve dinner where you are staying or confirm an open local option. A quiet evening is part of this destination’s appeal. Keep next morning’s drive flexible if snow or avalanche control changes the highway.' },
    ],
    avoid: 'Do not plan a winter sightseeing drive to Takakkaw Falls on Yoho Valley Road, or treat Emerald Basin as a casual extension. The Yoho visitor information desk is seasonally closed in winter; use Parks Canada’s current contacts and online bulletins before arrival. Do not cross lake ice on appearance alone.',
    otherSeasons: 'Summer brings more road and hiking access, with opening dates depending on snow and maintenance. Lake O’Hara has its own access and reservation rules; staying in Field does not reserve a bus seat. Keep popular summer access separate from accommodation booking.',
    hotelArea: 'Yoho National Park', hotelSlugs: ['emerald-lake-lodge'],
    related: [{ label: 'Lake Louise base guide', href: '/towns/lake-louise' }, { label: 'Winter driving', href: '/blog/banff-winter-driving' }, { label: 'Quiet winter alternatives', href: '/winter' }],
    sources: [{ label: 'Parks Canada: Yoho recommended winter trails and hazards', href: 'https://parks.canada.ca/pn-np/bc/yoho/activ/pistesdhiver-wintertrails.aspx' }, { label: 'Emerald Lake Lodge arrival and transport FAQ', href: 'https://crmr.com/resorts/emerald-lake/faq/' }, { label: 'DriveBC road reports', href: 'https://www.drivebc.ca/' }],
    faqs: [{ question: 'Is Field in Banff National Park?', answer: 'No. Field is in Yoho National Park in British Columbia, west of Lake Louise. Plan road access and current national park admission accordingly.' }, { question: 'Can I drive to Takakkaw Falls in winter?', answer: 'Yoho Valley Road is not open as a winter sightseeing drive to the falls. Use Parks Canada’s winter access information and do not substitute a summer route description.' }],
  },
  {
    slug: 'golden', name: 'Golden', region: 'British Columbia · Columbia Valley', type: 'Mountain town',
    description: 'Plan Golden in winter: Kicking Horse skiing, Nordic alternatives, heli-ski logistics and why an overnight can beat a rushed Banff day trip.',
    image: '/images/blog/golden-bc-day-trip.webp', bestFor: 'A separate Kicking Horse or powder trip', tags: ['ski', 'quiet'],
    intro: 'Golden is a town in British Columbia beyond Yoho National Park, with Kicking Horse Mountain Resort above it. Make it a destination in its own right if skiing there is central to the trip. Trying to combine an early Banff departure, a full ski day and a winter highway return leaves little room for delays or tired legs.',
    stay: 'Compare town accommodation with a stay up at Kicking Horse. A resort address and a downtown address serve different evenings and require a plan for getting between them. Heli-skiing departures are operator-specific; choose accommodation only after confirming the actual meeting location, check-in time and cancellation terms.',
    transport: 'Check DriveBC for the approach through Kicking Horse Pass and, if travelling farther west, Rogers Pass. Snowfall and avalanche control can change plans. Tourism Golden and Kicking Horse publish transport options, but a seasonal shuttle is not a continuous local bus network. Confirm dates, luggage capacity and reservations directly.',
    winter: [
      { title: 'Morning · commit to one mountain activity', text: 'Skiers can spend the day at Kicking Horse with a lesson or a terrain plan suited to their ability. A reputation for advanced terrain does not replace choosing an appropriate lesson. Check the resort report rather than assuming every lift or bowl is open.' },
      { title: 'Afternoon · choose a different snow pace', text: 'For a non-downhill day, consider a Nordic session at Dawn Mountain, checking trail passes, rentals and conditions. Mixed groups should agree on a return ride before separating. Other guided activities need their own operator confirmation.' },
      { title: 'Evening · keep the road decision honest', text: 'Stay overnight when the plan calls for a long ski day. If returning east, check the road report again before leaving and be prepared to stop. A warm meal and a rested driver matter more than fitting another viewpoint into the dark.' },
    ],
    avoid: 'Golden’s summer attractions and summer opening hours do not establish winter availability. Backcountry skiing around Rogers Pass needs specialised planning, avalanche training and applicable permits; it is not a casual add-on to a resort day. A heli-ski booking is also separate from a scenic helicopter flight.',
    otherSeasons: 'In warmer months, Golden can anchor a longer Rockies route with biking, rafting and seasonal attractions. Book activities for their actual operating season and keep river, road and trail conditions in the plan. Allow time in the town instead of using it only as a fuel stop.',
    hotelArea: 'Golden, British Columbia', hotelSlugs: [],
    related: [{ label: 'Golden day trip', href: '/blog/golden-bc-day-trip' }, { label: 'Heli-skiing near Banff', href: '/blog/banff-heli-skiing' }, { label: 'Field and Yoho', href: '/towns/field-yoho' }],
    sources: [{ label: 'Tourism Golden winter activities and travel', href: 'https://www.tourismgolden.com/activities/winter' }, { label: 'Kicking Horse official transport information', href: 'https://kickinghorseresort.com/discover-kickinghorse/getting-to-kicking-horse-mountain-resort/' }, { label: 'DriveBC highway conditions', href: 'https://www.drivebc.ca/' }],
    faqs: [{ question: 'Is Golden part of Banff?', answer: 'No. Golden is a separate town in British Columbia, west of Yoho National Park. Kicking Horse is not one of the three SkiBig3 resorts.' }, { question: 'Should I day-trip to Kicking Horse from Banff in winter?', answer: 'It can be a long day with a winter highway drive on both sides. If Kicking Horse is a priority, consider staying in Golden or at the resort and build in flexibility for road conditions.' }],
  },
  {
    slug: 'kananaskis', name: 'Kananaskis', region: 'Alberta · Kananaskis Country', type: 'Mountain region, with a resort village',
    description: 'A practical Kananaskis winter guide: Nakiska, village stays, Nordic and snowshoe plans, road closures and the right park information.',
    image: '/images/blog/kananaskis-day-trip.webp', bestFor: 'A self-contained resort or Nordic escape', tags: ['ski', 'family', 'quiet'],
    intro: 'Kananaskis Country is a large mountain region, not a single town beside Banff. Kananaskis Village is one resort hub within it. A hotel or trail labelled “Kananaskis” may be far from another with the same regional name. Start with the exact location, then build a trip around that area.',
    stay: 'A village hotel can suit a trip focused on nearby resort activities, while a remote lodge creates a more isolated stay. Check meal arrangements, spa age restrictions, vehicle access and the route to your chosen ski area. Do not assume that a spa visit, activity or trail pass is included with the room.',
    transport: 'A vehicle or a confirmed transfer is usually the practical starting point for a region-wide itinerary. Check the destination’s actual road access and any seasonal transport before booking. The Highwood Pass section of Highway 40 is seasonally closed; a summer driving loop cannot simply be reused in winter. Kananaskis Conservation Pass requirements are separate from Parks Canada admission.',
    winter: [
      { title: 'Morning · a booked lesson or groomed trail', text: 'Choose Nakiska for a resort lesson, or a designated Nordic venue appropriate to your equipment and experience. Check current trail reports and any pass requirements. Make one main plan close to your accommodation rather than crossing the whole region.' },
      { title: 'Afternoon · a short, checked outing', text: 'Use Alberta Parks winter trail information to select a walk or snowshoe and turn around while everyone is comfortable. Even a short route can enter avalanche terrain. If conditions or knowledge do not support the outing, use an indoor or lodge-based alternative.' },
      { title: 'Evening · stay near your base', text: 'Reserve dinner or use your confirmed meal plan. A spa session needs its own reservation and rules check. For a day trip, start the return with daylight to spare and keep the road report in view.' },
    ],
    avoid: 'Do not route through Highwood Pass in its winter closure, follow a summer summit guide into snow, or assume mobile coverage and fuel are available everywhere. A Banff National Park pass does not replace the applicable Kananaskis vehicle parking pass. Check exemptions and current requirements directly.',
    otherSeasons: 'Summer and autumn open a much wider range of hikes and roads, but wildlife closures, weather and crowding remain part of the decision. Check road reopening and individual trail reports before building a scenic circuit. The region rewards a focused day more than an ambitious drive between distant trailheads.',
    hotelArea: 'Kananaskis, Alberta', hotelSlugs: [],
    related: [{ label: 'Kananaskis day trip', href: '/blog/kananaskis-day-trip' }, { label: 'Canmore base guide', href: '/towns/canmore' }, { label: 'Winter essentials', href: '/packing-list' }],
    sources: [{ label: 'Alberta Parks Kananaskis reports, passes and safety', href: 'https://www.albertaparks.ca/parks/kananaskis/kananaskis-country/' }, { label: 'Alberta Parks annual road closures', href: 'https://www.albertaparks.ca/parks/kananaskis/kananaskis-country/advisories-public-safety/annual-road-closures/' }, { label: 'Canmore Kananaskis winter trip ideas', href: 'https://www.explorecanmore.ca/winter/' }],
    faqs: [{ question: 'Is Kananaskis a town?', answer: 'Kananaskis Country is a broad region with several parks and recreation areas. Kananaskis Village is a specific resort village within it. Check exact addresses when comparing stays and activities.' }, { question: 'Can I drive the Highwood Pass loop in winter?', answer: 'No. The seasonal Highway 40 closure through the Highwood Pass section prevents the summer through-route. Check Alberta Parks for closure boundaries, dates and temporary restrictions.' }],
  },
];
