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
  photoCreditId?: string; imageNote?: string;
  comparison?: { caption: string; columns: string[]; rows: string[][] };
  guideSections?: { id: string; title: string; paragraphs: string[] }[];
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
{
  "slug": "ice-climbing",
  "name": "Beginner Ice Climbing Near Banff",
  "tagline": "Choose instruction and the complete meeting plan",
  "description": "A guided beginner ice-climbing day is a hands-on winter course, with equipment fitting, an approach and time at an operator-selected ice venue. Compare the actual course and whole journey before choosing a date.",
  "season": "Winter ice conditions and the selected course date; venue can change",
  "difficulty": "Physical participation, cold-weather preparation and provider eligibility",
  "image": "/images/winter-activities/snowshoe-banff-landscape.jpg",
  "photoCreditId": "snowshoe-banff-landscape",
  "imageNote": "Banff winter landscape, photographed in 2018. A setting photograph, not an ice-climbing venue, course or current-conditions report.",
  "category": "winter",
  "gygSearch": "Banff Beginner Ice Climbing",
  "link": "/activities/ice-climbing",
  "isExternal": false,
  "contexts": [
    "winter"
  ],
  "interests": [
    "climbing"
  ],
  "reviewedAt": "2026-10-30",
  "locations": [
    {
      "name": "The beginner course",
      "description": "Alpine Air Adventures describes one-day instruction for people new to ice climbing, with a minimum age of 14. The verified GetYourGuide product is 432341. Its advertised duration is seven hours; leave additional room for getting to the meeting point and returning to your accommodation."
    },
    {
      "name": "The actual climbing site",
      "description": "The operator chooses the venue around conditions and sends the final location in its logistics information. Its published examples are not a reserved itinerary. Johnston Canyon appears in the operator’s general site list, but the current Parks closure still takes precedence; obtain the actual open venue rather than assuming that canyon is available."
    },
    {
      "name": "Meeting and transport",
      "description": "The direct operator advertises an initial Banff office meeting. The marketplace listing says transport to the field site is not included. Get the exact meeting instructions for the channel and option you buy, and confirm how everyone reaches the final venue and returns."
    }
  ],
  "readiness": [
    "Is everyone at least 14, comfortable with the course’s physical participation and willing to spend the day outside? Ask the guide about the actual approach as well as time climbing.",
    "Which footwear, technical equipment and sizes will be supplied or rented for the selected booking? Describe the people who need to use them instead of assuming that a general equipment list establishes fit.",
    "Does anyone need a different pace, communication arrangement or support? Discuss this directly before payment; the beginner label describes the lesson level, not an individual assessment."
  ],
  "logistics": [
    "Start with the operator confirmation: course date, meeting address, latest joining instructions, transport to the field site and return arrangements. Keep both the Banff meeting and the venue distinct in your itinerary.",
    "Work backwards from that meeting when choosing accommodation and travel. A hotel room, resort shuttle or ski pass does not reserve transport to an ice-climbing site. Leave a separate plan for people who are not taking the course.",
    "The listing requires a minimum of four bookings. Ask how a change of venue, an unmet departure minimum or unsuitable conditions is handled, and read the terms for your particular seller."
  ],
  "tips": [
    "Use the provider’s current clothing and equipment list. Prepare spare warmth, food and the items it requests; ask about lunch and drink arrangements rather than assuming a course includes a meal.",
    "Read the final logistics message before travelling. A public photograph, an older venue list and a published course date do not establish that a particular ice formation is available.",
    "Keep the rest of the day flexible. A timed dinner, long onward drive or flight immediately after the course creates a dependency on a finish time that this guide cannot promise."
  ],
  "guides": [
    {
      "label": "Compare other winter formats",
      "href": "/book/banff-winter-activities/"
    },
    {
      "label": "Plan the base and transport",
      "href": "/car-free-banff/"
    },
    {
      "label": "Prepare for a winter day",
      "href": "/blog/banff-packing-list/"
    }
  ],
  "sources": [
    {
      "label": "Alpine Air beginner course — direct",
      "url": "https://alpineairadventures.com/product/ice-climbing-course-beginner/",
      "checkedAt": "2026-10-30"
    },
    {
      "label": "Exact marketplace course — product 432341",
      "url": "https://www.getyourguide.com/banff-l284/banff-ice-climbing-adventure-beginner-t432341/",
      "checkedAt": "2026-10-30"
    },
    {
      "label": "Parks Canada current Johnston Canyon closure",
      "url": "https://parks.canada.ca/pn-np/ab/banff/bulletins/06d4ef61-a3c9-4b65-8dfc-66d056252d6c",
      "checkedAt": "2026-10-30"
    }
  ],
  "faqs": [
    {
      "question": "Is this the same as a guided icewalk?",
      "answer": "No. The beginner course teaches ice climbing under a guide’s supervision. An icewalk is a walking outing with its own route and equipment. Choose the format everyone wants; a shared winter setting does not make their physical requirements interchangeable."
    },
    {
      "question": "Are children allowed on the beginner course?",
      "answer": "The reviewed Alpine Air beginner course and marketplace listing state a minimum age of 14. Confirm the selected booking’s current participant rules and any family arrangements with the provider."
    },
    {
      "question": "Will the course visit Johnston Canyon?",
      "answer": "No particular venue is promised here. The operator selects the actual site around conditions. Its general list includes Johnston Canyon, but Parks currently lists that trail and day-use area closed through a scheduled 11 December 2026; reopening is not confirmed. Ask for the actual permitted venue."
    },
    {
      "question": "Does the booking include transport and equipment?",
      "answer": "The reviewed marketplace product does not include transport to the climbing site. Confirm the meeting point, onward journey, return, technical gear and footwear for your selected option. Direct-channel descriptions do not automatically establish marketplace inclusions."
    }
  ],
  "bookingNote": "The primary link on this guide is the identified beginner course, not a general marketplace search. Confirm the selected date, venue, people, equipment, transport and complete total before paying.",
  "comparison": {
    "caption": "Choose the activity format before comparing prices",
    "columns": [
      "Format",
      "Main purpose",
      "Decision to make"
    ],
    "rows": [
      [
        "Beginner ice-climbing course",
        "Instruction and supervised participation on ice",
        "Check age, approach, equipment fit and the selected course"
      ],
      [
        "Guided icewalk",
        "A winter walking outing",
        "Read route access and walking requirements separately"
      ],
      [
        "Private or more advanced climbing",
        "A different brief agreed with a guide",
        "Do not assume the beginner listing covers another objective"
      ]
    ]
  },
  "guideSections": [
    {
      "id": "course-fit",
      "title": "Make the course the main event",
      "paragraphs": [
        "Choose this day because you want instruction and the experience of learning, rather than because you want to tick off a particular waterfall. That makes it easier to accept a sensible venue change without feeling that the trip has failed. Ask what the day includes and how much time is normally spent approaching, fitting gear, learning and taking breaks.",
        "In a mixed party, separate the decision to take the course from the decision to visit Banff together. A person who prefers sightseeing can choose a different outing and a shared meeting later. Do not buy overlapping ski products or a guided walk on the assumption that the course replaces them."
      ]
    },
    {
      "id": "course-quote",
      "title": "Compare the complete course booking",
      "paragraphs": [
        "Write down the date, number of participants, course level, seller and what the confirmation actually includes. Then add any footwear rental, transport and food that remain separate. A lower headline amount can represent a different set of arrangements; this guide quotes no fixed price or guaranteed saving.",
        "Use the same group and course date when comparing channels. Read payment timing, cancellation and change terms for that actual offer. If the provider changes the venue, establish what that means for your transport rather than treating a new location as a minor address change."
      ]
    },
    {
      "id": "course-confirmation",
      "title": "Turn the confirmation into a workable day",
      "paragraphs": [
        "Keep the seller’s confirmation and the guide’s joining instructions together. Resolve an unclear meeting point before departure, and make sure each participant receives the clothing and equipment information. Check whether a waiver or other preparation must be completed in advance.",
        "On the day, follow the guide’s briefing and venue decisions. This planning guide does not teach rope systems, climbing technique or route assessment. The useful preparation is choosing the correct course and arriving with the right people, equipment arrangements and return plan."
      ]
    }
  ]
},
{
  "slug": "yoho-kootenay-winter-tours",
  "name": "Yoho & Kootenay Winter Tours from Banff",
  "tagline": "A winter road day with selected outdoor stops",
  "description": "Compare a guided winter outing west of Banff with the shorter idea of visiting one viewpoint. The reviewed Frozen Gems product combines road travel, winter landscapes and optional walks in Yoho and Kootenay; the actual route responds to conditions.",
  "season": "Winter programme; road, weather and operator departure conditions apply",
  "difficulty": "A full road day with optional walks and cold outdoor stops",
  "image": "/images/winter-activities/lake-louise-frozen.jpg",
  "photoCreditId": "lake-louise-frozen",
  "imageNote": "Lake Louise winter setting, photographed in 2018. This is not a photograph of the Yoho/Kootenay tour, its stops or current conditions.",
  "category": "winter",
  "gygSearch": "Yoho Kootenay Winter Tour from Banff",
  "link": "/activities/yoho-kootenay-winter-tours",
  "isExternal": false,
  "contexts": [
    "winter"
  ],
  "interests": [
    "walking"
  ],
  "reviewedAt": "2026-10-30",
  "locations": [
    {
      "name": "The reviewed Frozen Gems outing",
      "description": "GetYourGuide product 1164949 is supplied by Radventures and describes an eight-hour small-group winter road tour with selected Banff pickup. Check the actual pickup offered by your chosen option; a Banff destination label does not establish collection from Canmore or Lake Louise."
    },
    {
      "name": "Yoho landscape stops",
      "description": "The advertised winter itinerary includes Emerald Lake and Natural Bridge. Treat them as places in the operator’s route plan, not guaranteed walking endpoints, open ice or a fixed timetable. A frozen-lake photograph does not establish permission to walk onto the lake."
    },
    {
      "name": "Kootenay outdoor stops",
      "description": "Marble Canyon and Numa Falls are also named in the product. Ask what the selected departure intends to visit and what walking is involved. A stop can be shortened, changed or omitted when road, access or weather conditions require it."
    }
  ],
  "readiness": [
    "Does the group want a day with road travel between several winter stops, rather than one long active walk or a single attraction visit?",
    "Which actual walks, steps, vehicle boarding and cold-weather pauses need discussion with the operator? A small group does not establish a specific access arrangement.",
    "The operator recommends a minimum age of 12 and says children five and under cannot join its small-group tours. Confirm the selected listing’s age rules and the actual arrangements for anyone between those ages."
  ],
  "logistics": [
    "Choose the departure and pickup first, then join it to your room and final return. The road tour and travel to the pickup are separate parts of the day.",
    "Use the seller’s current itinerary and joining instructions. Do not turn an advertised eight-hour duration into a promised hotel return or connect it tightly to a flight or onward bus.",
    "Confirm the lunch arrangement, clothing, water and any required equipment. The product describes a premium picnic-lunch upgrade; read the actual option before assuming a meal is included."
  ],
  "tips": [
    "A winter tour does not provide a summer Moraine Lake visit, glacier excursion or guaranteed natural-ice activity. Select a different product if those are your main objectives.",
    "Ask which walking portions are optional and how the group regathers. A person waiting in the vehicle still needs the operator’s practical plan for that stop.",
    "Keep the actual departure date distinct from the date of this source review. Check the booking confirmation for weather changes and provider contact instructions before travelling."
  ],
  "guides": [
    {
      "label": "Understand the Field and Yoho base",
      "href": "/towns/field-yoho/"
    },
    {
      "label": "Compare winter road choices",
      "href": "/blog/icefields-parkway-guide/"
    },
    {
      "label": "Plan for changing weather",
      "href": "/weather/"
    }
  ],
  "sources": [
    {
      "label": "Radventures winter tours — direct",
      "url": "https://www.radventurescanada.com/winter-tours/",
      "checkedAt": "2026-10-30"
    },
    {
      "label": "Exact Frozen Gems marketplace product 1164949",
      "url": "https://www.getyourguide.com/banff-l284/banff-small-group-tour-of-frozen-gems-of-yoho-and-kootenay-t1164949/",
      "checkedAt": "2026-10-30"
    },
    {
      "label": "Yoho official bulletins",
      "url": "https://parks.canada.ca/pn-np/bc/yoho/bulletins",
      "checkedAt": "2026-10-30"
    },
    {
      "label": "Kootenay official bulletins",
      "url": "https://parks.canada.ca/pn-np/bc/kootenay/bulletins",
      "checkedAt": "2026-10-30"
    }
  ],
  "faqs": [
    {
      "question": "Does the tour always visit every advertised stop?",
      "answer": "No. The reviewed product describes a winter route including Emerald Lake, Natural Bridge, Marble Canyon and Numa Falls, but the operator tailors the day around conditions. Confirm the actual departure and do not treat the list as guaranteed access or a fixed schedule."
    },
    {
      "question": "Is pickup included from every Banff-area hotel?",
      "answer": "No. The reviewed listing offers selected Banff pickup locations. Choose the actual option and confirm its meeting instructions. A room in Canmore, Lake Louise or Field does not establish collection there."
    },
    {
      "question": "Can I join without taking every walk?",
      "answer": "The listing says walking and hiking are optional. Ask about the actual route, waiting arrangements and vehicle access for your selected day; that statement is not an individual access assessment."
    },
    {
      "question": "Is lunch included?",
      "answer": "Check the selected option. The reviewed product describes a premium picnic-lunch upgrade, so a generic tour booking should not be assumed to include a meal. Confirm food, dietary needs and water directly."
    },
    {
      "question": "Does a winter lake stop include skating?",
      "answer": "No skating, assessed lake ice or particular outdoor activity is promised by this guide. A road-tour stop and a prepared skating session are different products and arrangements."
    }
  ],
  "bookingNote": "The primary booking link is the identified winter Frozen Gems product. Match its actual departure, pickup, route, people and meal option before payment.",
  "comparison": {
    "caption": "Three different ways to shape a winter sightseeing day",
    "columns": [
      "Plan",
      "What it gives you",
      "Before committing"
    ],
    "rows": [
      [
        "Guided multi-stop road day",
        "One operator coordinating travel between its selected stops",
        "Read pickup, route flexibility, optional walks and meal choice"
      ],
      [
        "A single local attraction",
        "A shorter visit with a simpler return",
        "Choose admission and transport separately"
      ],
      [
        "Independent winter drive",
        "Control over your own stops and turnaround",
        "Assess roads, closures and the complete return yourself"
      ]
    ]
  },
  "guideSections": [
    {
      "id": "winter-route-choice",
      "title": "Choose the shape of the day, then the route",
      "paragraphs": [
        "The reason to choose a guided road day is that you want several landscapes joined into one operator-led outing. Its value is different from spending most of a day at one viewpoint or taking a guided snowshoe walk. Decide which rhythm suits the least enthusiastic person as well as the keen photographer.",
        "List two or three things that matter to your group: time outside, shorter walks, particular scenery or a simple pickup. Discuss those priorities with the provider. If one named stop is the sole reason for booking, ask how a route change affects that expectation before committing."
      ]
    },
    {
      "id": "winter-day-quote",
      "title": "Compare like with like",
      "paragraphs": [
        "When comparing tours, use the same date and number of participants and read the actual route rather than the destination name alone. Look at the proportion of the day spent travelling, walking and stopping. A shorter list of stops can be a better match for someone who wants a slower day; a longer list is not automatically more value.",
        "Include the journey to pickup, meals, any separate admission and the final return in the total plan. This guide publishes no live fare, available seat count or promised saving. Read payment and cancellation terms for the exact seller and option you intend to use."
      ]
    },
    {
      "id": "winter-flexible-return",
      "title": "Leave space around the tour",
      "paragraphs": [
        "Use a flexible breakfast, an unhurried pickup and a loose evening plan. A tightly booked restaurant or onward connection can make a change of route difficult even when the tour itself remains enjoyable. Choose accommodation and the rest of your schedule around the actual joining instructions.",
        "The photographs and itinerary descriptions help you understand the winter setting. They do not confirm the surface at a particular viewpoint, visibility or an open walking route. Keep the operator’s latest message handy and let the agreed on-the-day plan determine what you do."
      ]
    }
  ]
},
{
  "slug": "banff-food-tours",
  "name": "Banff Food Tours: Town Tastings or the Castle",
  "tagline": "Choose a tasting walk or an indoor food-and-history visit",
  "description": "A town tasting walk and a food experience inside Fairmont Banff Springs solve different afternoons. Compare the venue, walking, dietary arrangements and selected option, then book the actual experience that suits your group.",
  "season": "Year-round operator programmes; actual dates and options need confirmation",
  "difficulty": "Town walking or indoor venue movement; discuss dietary and access needs",
  "image": "/images/winter-activities/banff-winter-town.jpg",
  "photoCreditId": "banff-winter-town",
  "imageNote": "Cascade Mountain from Banff, photographed in 2012. A town setting, not a photograph of the food, tasting venues or either tour.",
  "category": "winter",
  "gygSearch": "Banff Food Walking Tour",
  "link": "/activities/banff-food-tours",
  "isExternal": false,
  "contexts": [
    "winter",
    "summer",
    "shoulder"
  ],
  "interests": [
    "walking"
  ],
  "reviewedAt": "2026-10-30",
  "locations": [
    {
      "name": "Nibble Tours: a town tasting walk",
      "description": "The verified product is Banff: Guided Foodie Walking Tour with Samples, product 698951. Nibble’s matching Taste of Banff programme is advertised year-round. The marketplace describes a three-hour guided walk; its route and menu can change with venue availability and weather."
    },
    {
      "name": "Fairmont Banff Springs: the Castle experience",
      "description": "Alberta Food Tours supplies the separate Castle Food Experience, product 285990. It takes place inside the hotel and is not an ordinary restaurant reservation. The listing states a minimum age of 14 and warns the experience is usually unavailable; confirm the actual date before building other plans around it."
    },
    {
      "name": "Two different meeting points",
      "description": "The Nibble marketplace meeting point is the Banff Visitor Centre steps. The Castle experience meets inside Fairmont Banff Springs’ front lobby. Match the correct address, timing and return to the booking you buy; neither product should be assumed to include hotel pickup."
    }
  ],
  "readiness": [
    "Describe allergies, dietary needs and anyone who needs changes to the menu before booking. Nibble asks vegans, vegetarians, dairy-free guests and people with coeliac requirements to contact it first; the Castle tour says it is not ideal for vegans.",
    "Can everyone manage the actual outdoor walking or indoor venue route? Ask about surfaces, stops, seating, washrooms, wheelchairs, strollers or assistance rather than inferring arrangements from a general listing.",
    "Which people want the standard tasting option and which want a premium drinks version? Check age requirements and inclusions for the actual option; alcohol is not a universal inclusion."
  ],
  "logistics": [
    "Save the chosen tour name and meeting instructions together. Give yourself time to reach the Visitor Centre or the hotel lobby, and plan the return separately from the tasting programme.",
    "Dress for the walking portion of the tour you buy. A winter food walk still includes time moving between stops; an indoor Castle visit has a different travel and clothing plan.",
    "Allow the tasting tour to be the meal experience you actually want. Read what is included before adding a second large meal, and leave time for any separate dinner booking afterwards."
  ],
  "tips": [
    "The menu and venues can change. Book the format because you want the experience rather than relying on an old photograph of a specific dish.",
    "Compare the same date, party and option, including currency, mandatory charges and drinks. This guide quotes no live price, fixed saving or exclusive offer.",
    "Follow the selected seller’s cancellation and late-arrival terms. A restaurant table, a hotel room and a tasting-tour booking are separate confirmations."
  ],
  "guides": [
    {
      "label": "Plan other Banff dining",
      "href": "/eat-and-drink/"
    },
    {
      "label": "Choose a Banff base",
      "href": "/towns/banff/"
    },
    {
      "label": "Build a flexible day",
      "href": "/what-to-do-today/"
    }
  ],
  "sources": [
    {
      "label": "Nibble Taste of Banff — direct year-round programme",
      "url": "https://www.nibbletours.com/service-page/taste-of-banff-food-tour",
      "checkedAt": "2026-10-30"
    },
    {
      "label": "Exact Nibble marketplace product 698951",
      "url": "https://www.getyourguide.com/banff-l284/banff-guided-foodie-walking-tour-with-samples-t698951/",
      "checkedAt": "2026-10-30"
    },
    {
      "label": "Alberta Food Tours Eat the Castle — direct",
      "url": "https://albertafoodtours.ca/tours/eat-the-castle-at-fairmont-banff-springs-hotel/",
      "checkedAt": "2026-10-30"
    },
    {
      "label": "Exact Castle marketplace product 285990",
      "url": "https://www.getyourguide.com/banff-l284/banff-castle-food-experience-at-banff-springs-hotel-t285990/",
      "checkedAt": "2026-10-30"
    }
  ],
  "faqs": [
    {
      "question": "Which tour is better for a winter afternoon?",
      "answer": "Choose from the actual format: Nibble is a guided town tasting walk, while the Castle experience is an indoor food-and-history visit at Fairmont Banff Springs. Match the walking, travel, dietary arrangements and available date to your group; this guide does not rank one as universally better."
    },
    {
      "question": "Are drinks included?",
      "answer": "Read the chosen option. Nibble distinguishes standard and premium versions with different drink inclusions. Do not transfer a premium-drinks description to every booking or assume an old menu still applies."
    },
    {
      "question": "Can the tours accommodate dietary requirements?",
      "answer": "Contact the actual provider before booking. Nibble asks several dietary and access groups to contact it first. The Castle listing describes some dietary accommodations but says it is not ideal for vegans. A menu label does not confirm a particular allergy arrangement."
    },
    {
      "question": "Does the Castle tour include a hotel stay or restaurant reservation?",
      "answer": "No hotel stay or ordinary restaurant table is established by this food-tour booking. It is the selected guided food experience. Arrange any room, separate meal or transport through its own booking route."
    },
    {
      "question": "Can I book the Castle experience for any date?",
      "answer": "No. The operator advertises a year-round programme, but the marketplace listing warns it is usually unavailable. Check the actual date and option before committing to travel or another dependent booking."
    }
  ],
  "bookingNote": "The primary booking link is Nibble’s identified guided food walk. The separate Castle booking below is a different experience with its own availability and participant rules.",
  "comparison": {
    "caption": "Compare the experience before choosing a food-tour booking",
    "columns": [
      "Choice",
      "Setting and format",
      "Check first"
    ],
    "rows": [
      [
        "Nibble guided food walk",
        "A year-round town walk with tastings",
        "Weather, walking, dietary arrangements and selected drinks option"
      ],
      [
        "Castle Food Experience",
        "An indoor food-and-history visit at Banff Springs",
        "Actual availability, ages14+, menu needs and the hotel-lobby meeting point"
      ],
      [
        "An ordinary restaurant meal",
        "A table and menu chosen separately",
        "Restaurant reservation, opening hours and the actual party"
      ]
    ]
  },
  "guideSections": [
    {
      "id": "tasting-choice",
      "title": "Choose the atmosphere you want",
      "paragraphs": [
        "A town walk suits a party that wants to explore Banff between tastings. The Castle experience suits someone who wants a single historic setting and a guided food-and-history visit. Think about how much time you want outside, how much walking everyone enjoys and whether a particular setting matters more than the number of stops.",
        "Keep the choice personal. A keen food enthusiast and someone who mainly wants a relaxed social afternoon may choose differently. Read the actual experience description together instead of treating every food tour as an interchangeable meal package."
      ]
    },
    {
      "id": "dietary-plan",
      "title": "Settle the menu questions before payment",
      "paragraphs": [
        "Send the provider the requirements that affect whether you can enjoy the tour. Ask which parts can change, what remains uncertain and when those arrangements will be confirmed. A booking platform category or a photograph is not a substitute for that conversation.",
        "For a mixed party, confirm whether everyone must select the same option and how non-drinkers or younger guests are handled. Plan the final journey so nobody has to drive after choosing alcoholic drinks. The menu and the transport arrangement belong to your actual booking, not to a general description of Banff."
      ]
    },
    {
      "id": "food-day-plan",
      "title": "Make it the centre of an easy afternoon",
      "paragraphs": [
        "Use a flexible morning and arrive without a rushed connection from another attraction. The town meeting point and the Banff Springs lobby are different destinations. Save the chosen seller’s instructions and leave time to find the right entrance, meet the guide and ask any remaining questions.",
        "After the tour, leave room to decide how hungry everyone still feels rather than locking in a second large meal. If a separate dinner, event or bus is important, compare its time with the actual tour and return journey. The best plan is one your whole party can enjoy without hurrying between confirmations."
      ]
    }
  ]
},
];

export const winterActivities = activities.filter(activity => activity.category === 'winter');
export const summerActivities = activities.filter(activity => activity.category === 'summer');
