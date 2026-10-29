export interface ActivityLocation { name: string; description: string; }
export interface ActivitySource { label: string; url: string; checkedAt: string; }
export interface ActivityLink { label: string; href: string; }
export interface ActivityFAQ { question: string; answer: string; }
export interface Activity {
  slug: string; name: string; tagline: string; description: string;
  season: string; difficulty: string; image: string;
  category: 'winter' | 'summer';
  /** Legacy flag: true means this item links to an existing main guide, not an activity-detail route. */
  isExternal: boolean;
  link: string; gygSearch: string;
  contexts: ('winter' | 'summer' | 'shoulder')[];
  interests: ('snow' | 'walking' | 'water' | 'wildlife' | 'night-sky' | 'climbing' | 'cycling')[];
  reviewedAt: string;
  locations: ActivityLocation[]; tips: string[]; readiness: string[]; logistics: string[];
  sources: ActivitySource[]; guides: ActivityLink[]; faqs: ActivityFAQ[];
  bookingNote: string;
}

const reviewedAt = '2026-10-29';
const source = (label: string, url: string, checkedAt = reviewedAt): ActivitySource => ({ label, url, checkedAt });
export const activityImageNote = 'Illustrative image; this activity, location and conditions are not verified in the photograph.';

export const activities: Activity[] = [
  {
    slug: 'skiing-snowboarding', name: 'Skiing & Snowboarding', tagline: 'Choose the lesson, then build the day',
    description: 'Compare Sunshine Village, Lake Louise and Mt. Norquay for a resort ski day. First lessons, equipment collection and return transport need their own arrangements; an open resort does not mean every lift or run is available.',
    season: 'Winter resort season; actual opening, terrain and programmes vary', difficulty: 'Lesson and terrain choice depend on experience',
    image: 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=600&q=80', category: 'winter',
    gygSearch: 'Banff Skiing', link: '/skiing', isExternal: true, contexts: ['winter'], interests: ['snow'], reviewedAt,
    locations: [
      { name: 'Sunshine Village', description: 'A mountain resort reached through its base area and gondola. Leave time between arriving at the base, collecting equipment and reaching the specified lesson meeting point. Confirm any sightseeing arrangements separately for non-skiers.' },
      { name: 'Lake Louise Ski Resort', description: 'The ski resort is separate from Lake Louise village and lakeshore. Match the booking and shuttle to the ski resort, and choose instruction for the actual ability of each participant.' },
      { name: 'Mt. Norquay', description: 'A separate resort above Banff. Ask about the chosen first-timer or family programme, its age rules and exactly which lift access and equipment it includes. Night skiing and tubing have their own sessions.' },
    ],
    readiness: ['Is this a first lesson, a return after a long break, or independent skiing?', 'Which child ages, equipment sizes and support needs must the snow school accommodate?', 'Does the quoted package include the required lesson, lift access, boots, skis or board, and helmet?'],
    logistics: ['Choose the resort and lesson before reserving transport. Resort shuttles and Roam town/regional buses serve different journeys.', 'Confirm the pickup stop, equipment allowance, arrival buffer, last return and rental-return deadline. Canmore accommodation does not establish a resort pickup.', 'Keep an arrival day flexible. A flight delay can break a timed lesson or transfer connection.'],
    tips: ['A multi-resort pass is a ticket product, not a guarantee of instruction, rentals or transport from every base.', 'Ask the instructor which terrain to use after the lesson. Resort selection and a green-run label do not assess conditions for your group.', 'Check the resort report and operator cancellation terms for the booked date. Tentative opening dates may change.'],
    guides: [{ label: 'First lesson guide', href: '/learn-to-ski' }, { label: 'Build a ski day', href: '/ski-day-planner' }, { label: 'Compare the three resorts', href: '/sunshine-vs-lake-louise-vs-norquay' }],
    sources: [source('SkiBig3 lesson programmes — direct', 'https://www.skibig3.com/ski/lessons/'), source('Sunshine resort information — direct', 'https://www.skibanff.com/'), source('Lake Louise resort information — direct', 'https://www.skilouise.com/'), source('Norquay snow school — direct', 'https://banffnorquay.com/')],
    faqs: [{ question: 'Does a ski pass include a lesson and rentals?', answer: 'Only if the selected product explicitly says so. Check lesson duration, lift access, equipment, helmet, tax and transport as separate inclusions before paying.' }],
    bookingNote: 'Use the resort or snow school for the exact lesson and pass terms. A marketplace search may show different products, destinations or dates.',
  },
  {
    slug: 'ice-skating', name: 'Ice Skating', tagline: 'Start with a managed rink and its current status',
    description: 'Choose a municipal rink or a designated skating area with current visitor information. Outdoor preparation depends on weather and ice; a frozen-looking lake is not an assessed skating destination.',
    season: 'Indoor sessions by timetable; outdoor rinks depend on preparation and weather', difficulty: 'Balance, ice conditions and support needs vary',
    image: 'https://images.unsplash.com/photo-1767627651424-7703491e0ec4?w=600&q=80', category: 'winter',
    gygSearch: 'Banff Ice Skating', link: '/activities/ice-skating', isExternal: false, contexts: ['winter'], interests: ['snow'], reviewedAt,
    locations: [
      { name: 'Fenlands indoor skating', description: 'Check the Town public-skating timetable, admission requirements and equipment rules. A scheduled indoor session is useful when outdoor surfaces are unavailable; it still needs a current session check.' },
      { name: 'Town outdoor rinks', description: 'The Town lists Fenlands Meadow, Sundance Park and Rotary Park. Check which rink is prepared and open, and whether its intended use matches recreational skating or hockey. Warmth and heavy snowfall can close surfaces.' },
      { name: 'Designated Lake Louise skating area', description: 'Check Fairmont’s actual skating and rental information before travelling. On 29 October its rental page described the shop as closed while anticipating the 2026–27 season; no upcoming rink-opening date was supplied. Preparation of one area does not assess the whole lake.' },
    ],
    readiness: ['Can each person stop, turn and get up, or is instruction/support needed?', 'Where are suitable skates and helmets collected and returned, and are the right sizes available?', 'Which surfaces, benches, change areas and accessible approaches are needed? Ask the facility about the actual route from transport to ice.'],
    logistics: ['Check the facility status and public session on the day. Build in time for fitting skates and getting changed.', 'For Lake Louise, confirm both the regional journey and the final lakeshore approach and return. A village stop is not the lakeshore.', 'Keep a land-based or indoor alternative if a rink is closed. Bring footwear suitable for the walk to and from the rink.'],
    tips: ['The Town advises against walking or skating on the Bow River.', 'Parks Canada does not monitor natural ice or mark its hazards. This guide does not recommend unmonitored Two Jack, Johnson or Vermilion lake ice.', 'Ask whether skate aids, helmets, accessible changing space or assistance are actually provided; do not infer them from a rink listing.'],
    guides: [{ label: 'Full rink and skating guide', href: '/blog/banff-ice-skating' }, { label: 'Car-free transport planning', href: '/car-free-banff' }, { label: 'Winter family planning', href: '/blog/banff-family-winter' }],
    sources: [source('Town rink status and sessions — direct', 'https://banff.ca/110/Outdoor-Ice-Skating'), source('Fairmont Lake Louise skating and rentals — direct', 'https://www.chateau-lake-louise.com/activities/ice-skating-on-lake-louise/'), source('Parks Canada winter and ice guidance', 'https://parks.canada.ca/pn-np/ab/banff/securite-safety/hiver-winter')],
    faqs: [{ question: 'Can I skate on a lake because it is winter?', answer: 'No calendar month or photograph establishes ice conditions. Check a designated rink’s current status; Parks Canada does not monitor natural ice or mark hazards. Do not walk or skate on the Bow River.' }, { question: 'Are skate rentals included?', answer: 'Not automatically. Confirm the rental provider, opening hours, sizes, helmet provision, price and return deadline for the actual session.' }],
    bookingNote: 'A tour search is not rink admission or a skate-rental reservation. Use the facility’s direct information for the actual session and equipment.',
  },
  {
    slug: 'ice-walk-johnston-canyon', name: 'Johnston Canyon Ice Walk', tagline: 'Access first, then traction and route choice',
    description: 'Plan the canyon’s designated winter walking route only after checking the current closure notice. Icy catwalks, steps and shaded sections require a route and equipment decision suited to the group.',
    season: 'Winter walking conditions vary; closures take precedence', difficulty: 'Icy walking, steps and climbing; assess the chosen endpoint',
    image: 'https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=600&q=80', category: 'winter',
    gygSearch: 'Banff Johnston Canyon Ice Walk', link: '/activities/ice-walk-johnston-canyon', isExternal: false, contexts: ['winter'], interests: ['walking'], reviewedAt,
    locations: [
      { name: 'Main canyon trail — dated closure', description: 'Checked 29 October 2026: Parks Canada’s remediation notice covers the trail to both falls, day-use facilities and P1 parking, with a scheduled end of 11 December. That end date is not confirmation of reopening. Do not route around barriers or assume a tour overrides the closure.' },
      { name: 'Lower and Upper Falls when the main route is open', description: 'The current hiking inventory lists Lower Falls 1.1 km and Upper Falls 2.4 km one way from the main trailhead. The winter page uses slightly different figures; check the chosen endpoint and approach. Travel time depends on footing, stops and group pace.' },
      { name: 'Ink Pots is a separate longer outing', description: 'The listed summer canyon approach is 5.5 km one way. Its extra distance and climbing need separate winter-route, daylight and closure assessment. Do not treat it as an automatic extension of a short falls visit.' },
    ],
    readiness: ['Can everyone manage the actual icy steps, narrow sections and return climb?', 'Does a guide provide properly fitted traction, and what footwear is required?', 'What endpoint, walking time and turnaround are agreed for the least experienced participant?'],
    logistics: ['Choose guided or independent travel, then verify the exact meeting point or trailhead. Town pickup is product-specific.', 'Check current Route 9 operating dates and the last return if using transit. A bus service does not establish canyon access.', 'Allow time for fitting traction, toilet arrangements and delays. Verify the cancellation terms if access or weather changes.'],
    tips: ['Read the dated Parks closure and winter route page before booking and again before departing.', 'Use appropriate traction and poles as advised for the actual surface; equipment does not make a closed route available.', 'Bring warm layers, a headlamp and a return plan. Keep an alternative in Banff if the canyon is closed.'],
    guides: [{ label: 'Detailed Johnston winter guide', href: '/blog/banff-ice-walk-guide' }, { label: 'Conservative winter walking', href: '/blog/banff-winter-hiking' }, { label: 'Check conditions sources', href: '/conditions' }],
    sources: [source('Parks Canada remediation closure notice', 'https://parks.canada.ca/pn-np/ab/banff/bulletins/06d4ef61-a3c9-4b65-8dfc-66d056252d6c'), source('Parks Canada winter walking', 'https://parks.canada.ca/pn-np/ab/banff/activ/marchehiver-winterwalking/banff'), source('Parks Canada hiking route figures', 'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking'), source('Roam Route 9 — direct', 'https://roamtransit.com/schedules-routes/johnston-canyon-regional-route-9/')],
    faqs: [{ question: 'Is Johnston Canyon currently open for an ice walk?', answer: 'At the 29 October 2026 source check, Parks Canada listed the main trail, day-use facilities and P1 closed for remediation from 13 October, scheduled through 11 December. Check the live notice for changes and reopening; this guide does not confirm access.' }, { question: 'Does an ice-walk booking include Banff pickup?', answer: 'Only when that specific product confirms it. Check the pickup location, return, traction equipment, chosen walking endpoint and cancellation terms before booking.' }],
    bookingNote: 'Marketplace results may remain visible while a destination is closed. Confirm the operator’s actual route and access before paying; a search listing is not a current-open report.',
  },
  {
    slug: 'dog-sledding', name: 'Dog Sledding', tagline: 'Compare the operator, format and meeting point',
    description: 'Compare Lake Louise and Canmore/Kananaskis operators for a guided dog-sled outing. Passenger rides and opportunities to help drive differ by product, as do eligibility, clothing, transport and weather terms.',
    season: 'Snow-dependent winter programmes; confirm the selected operator and date', difficulty: 'Passenger or driving format; operator approval required',
    image: 'https://images.unsplash.com/photo-1708577735772-74aec7ee2286?w=600&q=80', category: 'winter',
    gygSearch: 'Banff Dog Sledding', link: '/activities/dog-sledding', isExternal: false, contexts: ['winter'], interests: ['snow'], reviewedAt,
    locations: [
      { name: 'Lake Louise — Kingmik', description: 'Kingmik operates in the Lake Louise area. Its formats include guided passenger outings and products with a defined opportunity to drive alongside a guide. Ask for the exact trailhead/staging instructions; reaching Lake Louise village is not the whole journey.' },
      { name: 'Canmore/Kananaskis — Snowy Owl', description: 'Snowy Owl is a separate Canmore-based operator with its own check-in and transport arrangements. Confirm the selected itinerary directly. A Canmore office, a trail meeting point and a Banff hotel pickup are different places.' },
    ],
    readiness: ['Give the operator the actual ages, approximate weights and any mobility or medical considerations before choosing a sled arrangement.', 'Who rides, who drives, how much standing or helping is required, and can the operator accommodate your group together?', 'Ask how dogs are trained, rested and cared for, including veterinary care and retirement arrangements. Company descriptions are not independent welfare certification.'],
    logistics: ['Confirm total door-to-door time: check-in, fitting, transfer, briefing, time on the sled and return. Do not use sled time as the whole booking duration.', 'Check provided clothing against your own insulated boots, gloves and face protection. Sitting in a sled can feel colder than an active walk.', 'Read guest-cancellation and operator weather-cancellation terms separately. Travel disruption does not automatically qualify for the same refund; group terms may differ.'],
    tips: ['Avoid booking solely by a “Banff dog sledding” search label. Establish the actual base and meeting point first.', 'Do not assume a universal child age, sled-weight limit, driving opportunity or kennel visit.', 'Ask about transfer loading, toilet access and getting into/out of the sled if these affect participation.'],
    guides: [{ label: 'Detailed dog-sled comparison', href: '/blog/banff-dog-sledding' }, { label: 'Compare Banff, Canmore and Lake Louise bases', href: '/towns' }, { label: 'Winter places to stay', href: '/winter-stays' }],
    sources: [source('Kingmik programmes — direct', 'https://kingmikdogsledtours.com/'), source('Kingmik eligibility and cancellation FAQ — direct', 'https://kingmikdogsledtours.com/faqs/'), source('Snowy Owl operator information — direct; last successful source review', 'https://www.snowyowltours.com/', '2026-10-28')],
    faqs: [{ question: 'Can every child ride and every adult drive a sled?', answer: 'No universal rule applies. Tell the chosen operator the actual ages, weights and support needs, and obtain confirmation for the selected passenger or driving product before paying.' }, { question: 'Is transport from Banff included?', answer: 'It depends on the product. Confirm the check-in address, whether any transfer is included, the final trailhead approach and the return to your accommodation.' }],
    bookingNote: 'Use the operator’s direct confirmation for eligibility and meeting instructions. Marketplace availability, where offered, does not establish those details.',
  },
  {
    slug: 'snowshoeing', name: 'Snowshoeing', tagline: 'Choose a designated winter route for your group',
    description: 'Use Parks Canada’s winter route descriptions to choose a snowshoe outing with a realistic turnaround. Snowshoes provide flotation; they do not assess avalanche terrain, lake ice or whether a route is open.',
    season: 'Snow-dependent winter routes; conditions change with elevation and date', difficulty: 'Route, snow depth and group experience determine effort',
    image: 'https://images.unsplash.com/photo-1707584144334-8b343e88117c?w=600&q=80', category: 'winter',
    gygSearch: 'Banff Snowshoeing', link: '/activities/snowshoeing', isExternal: false, contexts: ['winter'], interests: ['walking', 'snow'], reviewedAt,
    locations: [
      { name: 'Banff winter route inventory', description: 'Compare designated options in the Banff winter guide, including their actual start, route length and recommended activity. A short outing can still involve ice, wildlife and difficult return conditions. Ask a visitor centre for a route matched to current conditions.' },
      { name: 'Lake Louise winter walks and snowshoe routes', description: 'The winter guide distinguishes walking, skiing and snowshoeing destinations. The lakeshore walking route is listed as 2.3 km one way; it is not a flat 4 km lake-ice loop. Stay on the designated open land route and respect avalanche and falling-ice warnings.' },
      { name: 'Summer trails and ski tracks need separate decisions', description: 'Taylor Lake and a summer Spray River loop are not default beginner snowshoe choices. Review the specific winter route and hazards. On shared trails, keep snowshoes out of the classic ski tracks and follow current signs.' },
    ],
    readiness: ['What is the shortest useful turnaround for the least experienced participant?', 'Does the actual surface call for snowshoes, traction or a different activity? Ask about current conditions before renting.', 'Are you trained and equipped for the terrain involved? A marked trail or other people’s tracks do not eliminate avalanche exposure.'],
    logistics: ['Fit rented snowshoes to the boots you will wear; confirm collection, instruction and return hours.', 'Check transport to the exact trailhead and its return, plus daylight, weather and closures. Carry navigation, layers, food, water and a headlamp.', 'Tell someone the route and return plan. Keep a shorter alternative and turn around before the group is exhausted.'],
    tips: ['Use a winter description rather than treating the summer hiking grade as a winter assessment.', 'Do not leave an open route to bypass a barrier, cross unassessed ice or follow wildlife tracks.', 'If booking a guide, ask about the actual route, ability and child requirements, included equipment and weather alternatives.'],
    guides: [{ label: 'First snowshoe trip guide', href: '/blog/banff-snowshoeing-guide' }, { label: 'Route directory and source links', href: '/trail-map' }, { label: 'Packing checklist', href: '/packing-list' }],
    sources: [source('Parks Canada Banff snowshoe routes', 'https://parks.canada.ca/pn-np/ab/banff/activ/raquette-snowshoeing/banff'), source('Parks Canada Lake Louise winter routes', 'https://parks.canada.ca/pn-np/ab/banff/activ/raquette-snowshoeing/lakelouise'), source('Parks Canada winter safety', 'https://parks.canada.ca/pn-np/ab/banff/securite-safety/hiver-winter')],
    faqs: [{ question: 'Do snowshoes make a summer trail suitable for winter?', answer: 'No. They provide flotation on snow. Winter access, avalanche terrain, navigation, ice and the group’s skills need separate assessment using the official winter description and current reports.' }],
    bookingNote: 'A tour search does not identify a suitable route. Confirm the operator’s actual route, preparation requirements and contingency plan.',
  },
  {
    slug: 'northern-lights', name: 'Northern Lights Viewing', tagline: 'Make an optional evening plan, with a warm fallback',
    description: 'Aurora is occasionally visible around Banff when space weather, darkness and local sky conditions align. Check timestamped forecasts and legal land access, and plan an evening you can still enjoy without a sighting.',
    season: 'Possible on dark clear nights; no month guarantees visibility', difficulty: 'Cold, darkness and after-hours transport require planning',
    image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&q=80', category: 'winter',
    gygSearch: 'Banff Northern Lights', link: '/activities/northern-lights', isExternal: false, contexts: ['winter', 'summer', 'shoulder'], interests: ['night-sky'], reviewedAt,
    locations: [
      { name: 'A legal land-based viewpoint', description: 'Choose an open, lawful parking or pedestrian area with a usable view of the sky. Review the approach in daylight, respect barriers and avoid stopping on roads, bridges or private property. A named lakeside viewpoint is not permission to walk on the ice.' },
      { name: 'A viewpoint reachable from your actual base', description: 'Check seasonal road access and the return before leaving town. Do not assume a daytime bus runs after a late evening. If walking, choose an approach and turnaround that work in darkness and the actual weather.' },
      { name: 'A warm fallback', description: 'Agree a waiting limit, a way to warm up and a return time before departing. Clouds or weak aurora may make the outing a short evening walk or an indoor evening instead. You do not need to keep driving farther to justify the plan.' },
    ],
    readiness: ['Have you checked both the space-weather timestamp and the local cloud/weather forecast?', 'Can everyone stay warm while relatively still, and is there a firm return plan?', 'Is the viewing area and its approach legally accessible after dark today?'],
    logistics: ['Keep aurora viewing flexible rather than making a nonrefundable long transfer depend on a sighting.', 'Tell someone your location and return time; bring a light for the approach and extra clothing.', 'If photographing, use a stable position on legal land and adjust your camera to the actual scene. Camera colours can differ from the naked-eye view.'],
    tips: ['No single Kp threshold or clock window promises a Banff sighting.', 'Mountain horizons and local cloud can obscure a display even when a regional forecast is favourable.', 'Stay away from unassessed ice and give wildlife space. Never use a road lane as a tripod position.'],
    guides: [{ label: 'Detailed aurora planning', href: '/blog/banff-northern-lights' }, { label: 'Weather planning', href: '/weather' }, { label: 'Photography locations and access', href: '/photo-spots' }],
    sources: [source('Space Weather Canada conditions and forecasts', 'https://www.spaceweather.gc.ca/forecast-prevision/cond-en.php'), source('NOAA aurora explanation', 'https://www.spaceweather.gov/phenomena/aurora'), source('Parks Canada rules and access responsibilities', 'https://parks.canada.ca/pn-np/ab/banff/securite-safety/regles-rules')],
    faqs: [{ question: 'Does a northern-lights forecast guarantee a sighting in Banff?', answer: 'No. Regional space weather, darkness, local cloud and the mountain horizon all matter. Keep the plan optional, check forecast timestamps and have a warm fallback and return time.' }],
    bookingNote: 'A marketplace search may show stargazing or night tours rather than an aurora-specific product. Read the itinerary and never assume a sighting is included.',
  },
  {
    slug: 'hiking', name: 'Hiking', tagline: 'Choose the actual route and return',
    description: 'Compare lakeside paths and mountain hikes using the current official route description. Distance, climbing, terrain, transport and weather matter more than an “all levels” activity label.',
    season: 'Main mountain hiking season varies; snow can persist into summer', difficulty: 'Route-specific preparation and experience',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80', category: 'summer',
    gygSearch: 'Banff Hiking', link: '/hiking', isExternal: true, contexts: ['summer', 'shoulder'], interests: ['walking'], reviewedAt,
    locations: [
      { name: 'Lake Louise routes', description: 'The lakeshore and higher tea-house routes are different outings. Read the current distance and elevation for the chosen endpoint; tea-house service and an open summer route do not establish winter access.' },
      { name: 'Moraine Lake routes', description: 'Build the access reservation and final return around the hike. Moraine Lake Road is restricted to authorised transport in its operating season; arriving early by private car is not a solution.' },
      { name: 'Banff-area routes', description: 'Use the official inventory and trail report for the chosen start. Current Johnston Canyon closures take precedence over an evergreen hiking suggestion.' },
    ],
    readiness: ['Can the group complete both the approach and return climbing?', 'What is the turnaround, and who knows the trip plan?', 'Are current closures, wildlife restrictions and weather compatible with the outing?'],
    logistics: ['Reserve seasonal transport where required, and include the last return in the turnaround plan.', 'Carry navigation, layers, food, water, a headlamp and suitable emergency supplies. Obtain current wildlife-safety advice.'],
    tips: ['Do not equate maintained trail with a prepared winter surface.', 'Leave room for delays and a shorter alternative instead of relying on a promised start time or crowd forecast.'],
    guides: [{ label: 'Trail directory and official reports', href: '/trail-map' }, { label: 'Winter walking guide', href: '/blog/banff-winter-hiking' }],
    sources: [source('Parks Canada hiking routes', 'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking'), source('Parks Canada Lake Louise and Moraine access', 'https://parks.canada.ca/pn-np/ab/banff/visit/les10-top10/louise')],
    faqs: [], bookingNote: 'A guided hike still needs the operator’s route, ability, equipment and transfer requirements checked.',
  },
  {
    slug: 'canoeing-kayaking', name: 'Canoeing & Kayaking', tagline: 'Check the waterbody rules before bringing equipment',
    description: 'Plan a permitted paddling outing with current waterbody rules, cold-water preparation and an appropriate rental or guide. A lakeside rental and permission to launch your own boat are different arrangements.',
    season: 'Open-water and operator season; weather and restrictions apply', difficulty: 'Cold water, wind and moving water need specific skills',
    image: 'https://banfflakelouise.bynder.com/m/1e85056f0193bfe9/1500x915_jpg-2022_LakeLouise_Friends_ROAMCreative.jpg', category: 'summer',
    gygSearch: 'Banff Canoe Kayak', link: '/paddling', isExternal: true, contexts: ['summer'], interests: ['water'], reviewedAt,
    locations: [
      { name: 'Lake Louise and recreation-zone waters', description: 'Check Parks Canada’s waterbody classification and Clean, Drain, Dry and certification requirements before bringing equipment. Rental hours, boat capacity and prices belong to the actual provider.' },
      { name: 'Moraine Lake', description: 'Current Parks rules allow only on-site rental watercraft that do not leave Moraine Lake. Do not plan to bring your own canoe, kayak or paddleboard. Seasonal road access and a rental queue are separate from permission to paddle.' },
      { name: 'Bow River', description: 'Moving water requires route-specific skills and knowledge of hazards, put-ins and take-outs. Do not turn a town rental description into an unsupported beginner float to Canmore.' },
    ],
    readiness: ['What rescue, cold-water and paddling experience does the group have?', 'Is the selected craft permitted on this waterbody today?', 'Does the provider supply correctly fitted flotation equipment and instruction for everyone?'],
    logistics: ['Check wind, weather and the provider’s cancellation/return rules.', 'Confirm launching assistance, seating, transfer access and the actual on-water versus total duration.'],
    tips: ['Read current waterbody restrictions before purchasing or transporting equipment.', 'Stay within the rental or guide’s permitted area and instructions.'],
    guides: [{ label: 'Paddling guide', href: '/paddling' }, { label: 'Seasonal shuttle planning', href: '/shuttle-reservations' }],
    sources: [source('Parks Canada current water zones and restrictions', 'https://parks.canada.ca/pn-np/ab/banff/activ/nautiques-sports')],
    faqs: [], bookingNote: 'A tour search is not permission to launch equipment or confirmation of an on-site rental.',
  },
  {
    slug: 'mountain-biking', name: 'Mountain Biking', tagline: 'Match the permitted route to the bike and rider',
    description: 'Choose a designated cycling route with the right surface, distance and return plan. Paved riding, mountain biking, e-biking and winter fat biking have different route permissions and preparation.',
    season: 'Main riding season depends on surface; winter rules differ', difficulty: 'Route and equipment dependent',
    image: 'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=600&q=80', category: 'summer',
    gygSearch: 'Banff Mountain Bike', link: '/biking', isExternal: true, contexts: ['summer', 'shoulder'], interests: ['cycling'], reviewedAt,
    locations: [
      { name: 'Paved paths versus mountain trails', description: 'Use Parks Canada’s separate road, Legacy Trail and mountain-bike information. Compare crossings, surface, distance and a realistic return before choosing a rental.' },
      { name: 'Goat Creek / Spray River', description: 'A point-to-point outing requires checks at both the Canmore/Kananaskis and Banff endpoints plus an arranged return. The summer route is not a winter permission; Spray River West prohibits bikes in winter.' },
      { name: 'Winter fat biking', description: 'Use the designated winter inventory and current conditions. A summer trail listing or an e-bike rental does not establish winter access or permission.' },
    ],
    readiness: ['Can riders control the bike on the actual surface and repair a basic breakdown?', 'Is this bike or e-bike permitted on the chosen route?', 'How will riders and bikes return if the route is point-to-point?'],
    logistics: ['Confirm bike fit, helmet, repair equipment, rental-return time and bike transport.', 'Read seasonal wildlife restrictions, closures and current surfaces before setting out.'],
    tips: ['Ride designated open routes and yield to other users.', 'Avoid damaging wet or soft trails; choose another outing when conditions are unsuitable.'],
    guides: [{ label: 'Cycling guide', href: '/biking' }, { label: 'Winter fat-biking guide', href: '/blog/banff-fat-biking' }],
    sources: [source('Parks Canada cycling permissions and routes', 'https://parks.canada.ca/pn-np/ab/banff/activ/cyclisme-biking'), source('Parks Canada winter fat-biking routes', 'https://parks.canada.ca/pn-np/ab/banff/activ/cyclisme-biking/veloniege-fatbike')],
    faqs: [], bookingNote: 'Check the actual bike type, permitted route and transfer before reserving a rental or tour.',
  },
  {
    slug: 'white-water-rafting', name: 'White Water Rafting', tagline: 'Choose the river section and actual meeting base',
    description: 'Rafting sold to Banff visitors may depart in Kananaskis or near Golden, British Columbia. Compare the selected river section, participant requirements and transport rather than treating every Bow River trip as a gentle town float.',
    season: 'Summer operator programmes; water, weather and dates vary', difficulty: 'Trip-specific rapids, participation and equipment fit',
    image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80', category: 'summer',
    gygSearch: 'Banff Rafting', link: '/activities/white-water-rafting', isExternal: false, contexts: ['summer'], interests: ['water'], reviewedAt,
    locations: [
      { name: 'Kicking Horse River, British Columbia', description: 'Operators offer different sections and formats, including gentler and more demanding trips. Establish the exact river base near Golden/Yoho and whether transport is actually included. Leave time for the cross-province road journey and check the meeting time zone.' },
      { name: 'Kananaskis River, Alberta', description: 'A separate whitewater destination. Chinook describes its trip as Class 2–3 with a minimum age of five at the source check; that is one product’s requirement, not universal suitability for every child.' },
      { name: 'Horseshoe Canyon on the Bow River', description: 'This is a separate whitewater trip, not the gentle Banff town float described in the old listing. Chinook lists Class 3–4, age 12+ and self-drive-only transport. Check the selected operator’s full eligibility and meeting instructions.' },
    ],
    readiness: ['Give the operator actual ages, body sizes and medical/support considerations before selecting a trip.', 'What swimming ability, paddling participation and mobility does this specific format require?', 'Can the supplied safety equipment fit each person, and what happens if eligibility is not met at check-in?'],
    logistics: ['Compare total check-in-to-return time with on-water time; leave space for changing and the journey back to your base.', 'Ask whether shuttle means a river transfer or pickup from Banff. Confirm self-drive requirements before booking.', 'Read water-level, weather, guest-cancellation and late-arrival terms. Check the selected season, not a previous summer timetable.'],
    tips: ['Rapids vary by section and conditions. Do not infer their class from the month.', 'Ask for the clothing list, supplied equipment, waiver and facilities at the actual river base.', 'Separate optional activities from the rafting you have booked; no participant should infer an advertised extra is compulsory.'],
    guides: [{ label: 'Compare towns and bases', href: '/towns' }, { label: 'Road and weather sources', href: '/conditions' }, { label: 'Build a flexible trip', href: '/trip-builder' }],
    sources: [source('Chinook Horseshoe Canyon — direct', 'https://chinookrafting.com/tours/horseshoe-canyon/'), source('Chinook Kananaskis River — direct', 'https://chinookrafting.com/tours/kananaskis-river/'), source('Wild Water Kicking Horse sections — direct', 'https://wildwater.com/kicking-horse-white-water-rafting/')],
    faqs: [{ question: 'Does rafting near Banff include pickup from my hotel?', answer: 'Not necessarily. A shuttle may only move participants between the river base and the put-in or take-out. Confirm the exact meeting address and whether your product includes transport from your accommodation.' }, { question: 'Are all Bow River rafting trips gentle?', answer: 'No. A scenic float near Banff and whitewater through Horseshoe Canyon are different trips. Choose the exact river section and operator programme, with its own participation requirements.' }],
    bookingNote: 'Marketplace results may use “Banff” as a search destination while the trip departs elsewhere. Confirm the actual river base and transfer before paying.',
  },
  {
    slug: 'wildlife-viewing', name: 'Wildlife Viewing', tagline: 'Observe from a distance, without a sighting promise',
    description: 'Wildlife may be encountered around Banff in different seasons. Choose lawful viewing behaviour and a flexible outing; neither a tour nor a roadside location guarantees a particular animal.',
    season: 'Different species and behaviour through the year; sightings unpredictable', difficulty: 'Viewing method and route determine demands',
    image: 'https://banfflakelouise.bynder.com/m/30543649c0240f70/1500x915_jpg-2024_Wildlife_Wolverine_WillLambert.jpg', category: 'summer',
    gygSearch: 'Banff Wildlife', link: '/wildlife', isExternal: true, contexts: ['winter', 'summer', 'shoulder'], interests: ['wildlife'], reviewedAt,
    locations: [
      { name: 'An open permitted route', description: 'Check current closures and travel restrictions before driving or walking. Winter road closures and wildlife-protection restrictions can change an otherwise familiar route.' },
      { name: 'Roadside encounters', description: 'Do not block traffic or leave your vehicle to approach an animal. Continue if there is no lawful safe stopping place. Other stopped vehicles do not establish permission.' },
    ],
    readiness: ['Is the outing a drive, guided vehicle trip or walk, and can everyone manage it?', 'Does the route respect current closures and seasonal restrictions?', 'Can you enjoy the outing without a sighting?'],
    logistics: ['For a tour, confirm pickup, vehicle access, walking requirements and return.', 'Carry binoculars or use a long lens rather than moving closer to wildlife.'],
    tips: ['Parks Canada minimum distances are 30 metres for deer, elk, sheep and moose, and 100 metres for bears, wolves, cougars and coyotes. Give more space if behaviour requires it.', 'Never feed, entice, follow or surround wildlife. If you cause an animal to move, you are too close.'],
    guides: [{ label: 'Wildlife guide', href: '/wildlife' }, { label: 'Current source reports', href: '/conditions' }],
    sources: [source('Parks Canada safe wildlife viewing', 'https://parks.canada.ca/pn-np/ab/banff/visit/faune-wildlife/espace-space'), source('Parks Canada current bulletins', 'https://parks.canada.ca/pn-np/ab/banff/bulletins')],
    faqs: [], bookingNote: 'A wildlife tour pays for the stated itinerary and guiding, not a guaranteed sighting.',
  },
  {
    slug: 'via-ferrata', name: 'Via Ferrata at Mt. Norquay', tagline: 'A guided climb with route-specific requirements',
    description: 'Norquay’s guided via ferrata uses fixed cables, ladders and bridges on exposed mountain terrain. Choose the actual route with the operator after checking age, weight, fitness, equipment and comfort with heights.',
    season: 'Summer programme; operator page marked closed for winter at review', difficulty: 'Exposed guided climbing; participant requirements apply',
    image: 'https://images.unsplash.com/photo-1763910496344-0b1473d578b6?w=600&q=80', category: 'summer',
    gygSearch: 'Banff Via Ferrata', link: '/activities/via-ferrata', isExternal: false, contexts: ['summer'], interests: ['climbing'], reviewedAt,
    locations: [
      { name: 'Explorer and Ridgewalker', description: 'Norquay currently lists a minimum age of 12 for these routes. Compare their actual duration, continuous hiking/climbing and exposure with the operator, rather than selecting by price alone.' },
      { name: 'Alpinist, Skyline and Summiteer', description: 'Norquay currently lists a minimum age of 14 for these routes. Longer or more exposed programmes need their own fitness and route discussion; reaching a particular summit is not promised here.' },
      { name: 'Mt. Norquay meeting base', description: 'Confirm check-in location and time, footwear, borrowed equipment and the route-specific arrival buffer. Summer shuttle operation, restaurant hours and a sightseeing-chairlift ticket are separate arrangements.' },
    ],
    readiness: ['The published equipment range is 40–120 kg; ask the operator to confirm fit and current eligibility for each person.', 'Can you hike continuously for the required period and manage exposure, ladders and instruction?', 'Discuss relevant medical, mobility or support needs directly before payment. No previous climbing experience does not mean every person can participate.'],
    logistics: ['Read the operator’s current FAQ, equipment list, waiver and weather cancellation terms.', 'Reserve the selected route and verify its season; the page was marked closed for winter on 29 October 2026.', 'Check how you reach the base and return after your programme. Do not assume a ski-season shuttle or hotel pickup works for a summer climb.'],
    tips: ['Use the operator’s footwear instructions rather than an invented universal shoe rule.', 'Confirm the exact supplied gear and clothing list. Follow the guide’s briefing throughout the climb.', 'Allow for check-in and return travel beyond the published activity duration.'],
    guides: [{ label: 'Compare activities', href: '/activities' }, { label: 'Transport planning', href: '/car-free-banff' }, { label: 'Packing checklist', href: '/packing-list' }],
    sources: [source('Norquay via ferrata routes and eligibility — direct', 'https://banffnorquay.com/via-ferrata/'), source('Norquay via ferrata FAQ — direct', 'https://banffnorquay.com/via-ferrata/faqs/')],
    faqs: [{ question: 'Can I book Norquay via ferrata during winter?', answer: 'The operator page was marked closed for winter at the 29 October 2026 review. Use the direct operator page to check the actual season and route availability; a marketplace listing does not confirm winter operation.' }, { question: 'Is no climbing experience the same as no participant requirements?', answer: 'No. The operator applies route-specific age rules, an equipment weight range, fitness expectations and other participation requirements. Confirm the selected route and any support needs directly before booking.' }],
    bookingNote: 'Compare the named route and its inclusions. A marketplace result is not proof of current operation or participant eligibility.',
  },
];

export const winterActivities = activities.filter(activity => activity.category === 'winter');
export const summerActivities = activities.filter(activity => activity.category === 'summer');
