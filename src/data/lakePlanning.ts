export const lakePlanningReviewedAt = '2026-10-29';
export const lakeSources = {
  water: 'https://parks.canada.ca/pn-np/ab/banff/activ/nautiques-sports',
  order: 'https://parks.canada.ca/pn-np/ab/banff/bulletins/59933c9d-02a5-4ec9-a2d8-ea0d4dad6429',
  ice: 'https://parks.canada.ca/pn-np/ab/banff/activ/patinage-skating',
  hikes: 'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
  winter: 'https://parks.canada.ca/pn-np/ab/banff/activ/raquette-snowshoeing/lakelouise',
  report: 'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking/etat-sentiers-trail-conditions',
  roads: 'https://parks.canada.ca/pn-np/ab/banff/visit/fermetures-closures',
  bus: 'https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise',
  route8: 'https://roamtransit.com/schedules-routes/lake-louise-banff-express-route-8x/',
  route6: 'https://roamtransit.com/schedules-routes/lake-minnewanka-route-6/',
  yoho: 'https://parks.canada.ca/pn-np/bc/yoho/activ/randonnee-hike/jour-day',
  yohoOrder: 'https://parks.canada.ca/pn-np/bc/yoho/bulletins/45b1cb4f-7cfc-4a7a-8b92-00770378ca4f',
  flour: 'https://www.nps.gov/articles/glacialtillandglacialflour.htm',
  colour: 'https://www.nps.gov/glac/learn/nature/waterquality.htm',
  flotation: 'https://tc.canada.ca/en/marine-transportation/marine-safety/boating-safety/choosing-lifejackets-personal-flotation-devices-pfds',
  skating: 'https://www.chateau-lake-louise.com/activities/ice-skating-on-lake-louise/',
};
export const lakeAreaLabels = { banff: 'Banff town and Minnewanka area', louise: 'Lake Louise area', parkway: 'Icefields Parkway', yoho: 'Yoho, British Columbia' };
export const lakeInterestLabels = { view: 'Lake view and a pause', shore: 'A designated shoreline outing', rental: 'Compare on-site canoe rentals' };
export const lakeWaterRules = {
  recreation: { label:'Water Recreation Zone', text:'Permitted personal paddlecraft need the current Clean, Drain, Dry and Self-certification arrangements. Check the actual waterbody and any closure.', url:lakeSources.water },
  preservation: { label:'Water Preservation Zone', text:'Personal paddling and large inflatables are prohibited. Plan a land-based visit and read the current order.', url:lakeSources.order },
  moraine: { label:'Moraine rental exception', text:'Personal watercraft are prohibited. The exception is on-site rental craft that remain at Moraine Lake; check the actual operator and season.', url:lakeSources.water },
  minnewanka: { label:'Minnewanka site-specific rules', text:'Personal paddlecraft are prohibited. Specified inspected motorboats and rental watercraft that remain at the lake have separate exceptions.', url:lakeSources.water },
  yoho: { label:'Yoho watercraft order', text:'The current order prohibits personal watercraft, with exceptions for Emerald Lake rental canoes and authorised commercial operators. It runs through March 31, 2027; check later orders.', url:lakeSources.yohoOrder },
};
type LakeRule = keyof typeof lakeWaterRules;
export interface LakePlan {
  id:string; name:string; area:keyof typeof lakeAreaLabels; park:string;
  interests:(keyof typeof lakeInterestLabels)[]; winterInterests?:(keyof typeof lakeInterestLabels)[]; seasons:('summer'|'winter')[];
  description:string; land:string; winter:string; journey:string;
  rule:LakeRule; guide:{ label:string; href:string }; source:string;
}
export const lakePlans: LakePlan[] = [
  { id:'lake-louise', name:'Lake Louise', area:'louise', park:'Banff National Park, Alberta', interests:['view','shore','rental'], winterInterests:['view','shore'], seasons:['summer','winter'],
    description:'Make the lakeshore the main destination, with time for the view before deciding how far to continue.',
    land:'The designated lakeshore trail is 2.3 km one way. A short lakeshore visit, the whole trail and a teahouse hike are three different plans.',
    winter:'Use the designated winter lakeshore description. Stay away from the Louise Falls falling-ice area and posted avalanche terrain; a shore route does not require crossing lake ice.',
    journey:'Roam 8X serves the village and lakeshore year-round. A reserved seasonal Parks shuttle starts separately at the ski-resort Park and Ride. Check winter resort transport separately from these lakeshore services.',
    rule:'recreation', guide:{label:'Lake Louise visitor guide',href:'/blog/lake-louise-complete-guide'}, source:lakeSources.bus },
  { id:'moraine-lake', name:'Moraine Lake', area:'louise', park:'Banff National Park, Alberta', interests:['view','shore','rental'], seasons:['summer'],
    description:'Choose between the Rockpile view, a shoreline outing and an on-site canoe rental, then book a journey that leaves time for that choice.',
    land:'The Rockpile is a 0.7 km loop with climbing; the lakeshore route is 1.3 km one way. Mountain hikes beyond these are separate commitments.',
    winter:'Ordinary visitor transport is seasonal. The designated winter Moraine Road route ends before large avalanche paths and does not take an ordinary lake visitor to Moraine Lake.',
    journey:'Moraine Lake Road is closed to personal vehicles year-round, with specific authorised exceptions. Compare reserved Parks transport, permitted commercial services and eligible lodge-guest arrangements.',
    rule:'moraine', guide:{label:'Moraine Lake access and visit guide',href:'/blog/moraine-lake-guide'}, source:lakeSources.bus },
  { id:'minnewanka', name:'Lake Minnewanka', area:'banff', park:'Banff National Park, Alberta', interests:['view','shore'], seasons:['summer','winter'],
    description:'A day-use-area view can be the outing, or the start of a separately planned shoreline route.',
    land:'Reaching Stewart Canyon is different from staying near the day-use area. Its approach includes rough paving, roots and rocks; check the full route profile.',
    winter:'Use the permitted road approach and current reports. The western Minnewanka Loop section has a seasonal vehicle closure; do not plan a complete driving loop or infer lake-ice access.',
    journey:'Check seasonal Roam Route 6 or arrange the road journey. A cruise product has its own dates, boarding and return requirements.',
    rule:'minnewanka', guide:{label:'Stewart Canyon route profile',href:'/trails/stewart-canyon'}, source:lakeSources.route6 },
  { id:'two-jack', name:'Two Jack Lake', area:'banff', park:'Banff National Park, Alberta', interests:['view','shore'], seasons:['summer','winter'],
    description:'Build a Banff-based lake pause around the day-use area, with a picnic or a small amount of walking rather than a packed multi-lake circuit.',
    land:'Choose the actual day-use approach. Campground access and an overnight campsite are separate arrangements from a day visit.',
    winter:'Check the road and shoreline approach. A frozen-looking surface and someone else’s tracks do not establish ice conditions.',
    journey:'Roam Route 6 is seasonal, including day-use and campground stops. Resolve the actual stop and return; winter requires a different transport plan.',
    rule:'recreation', guide:{label:'Two Jack Lake visitor guide',href:'/blog/two-jack-lake-guide'}, source:lakeSources.route6 },
  { id:'johnson', name:'Johnson Lake', area:'banff', park:'Banff National Park, Alberta', interests:['view','shore'], seasons:['summer','winter'],
    description:'Choose a short lakefront pause or investigate the full circuit, leaving enough time for the same journey back to your base.',
    land:'Parks lists a 2.9 km loop with roots, rocks, step bridges and narrow sections. An easy hiking grade does not establish stroller or wheelchair access.',
    winter:'The summer circuit description does not establish winter footing or ice access. Ask about the actual designated route and current conditions.',
    journey:'Check the seasonal Route 6 Johnson Lake stop and final return, or arrange road transport. Bring what the outing needs rather than assuming a lakeside rental or shop.',
    rule:'recreation', guide:{label:'Johnson Lake route description',href:'/trails/johnson-lake'}, source:lakeSources.hikes },
  { id:'vermilion', name:'Vermilion Lakes', area:'banff', park:'Banff National Park, Alberta', interests:['view','shore'], seasons:['summer','winter'],
    description:'A town-based viewing plan can leave more time to look and pause, with the return to Banff planned before adding another stop.',
    land:'Choose a specific public roadside viewing location. Protect wetland vegetation, keep away from wildlife and distinguish a road outing from an informal shoreline path.',
    winter:'Check footing and the road approach. Do not use a frozen-water shortcut between viewpoints.',
    journey:'Plan the walk, cycle or road journey from your actual starting point. A town-area location does not establish a step-free approach or a reserved parking space.',
    rule:'recreation', guide:{label:'Compare visitor access features',href:'/accessible-trails'}, source:'https://www.banfflakelouise.com/accessibility' },
  { id:'peyto', name:'Peyto Lake', area:'parkway', park:'Banff National Park, Alberta', interests:['view'], seasons:['summer','winter'],
    description:'The viewpoint is a distinct objective from reaching the lake shore. Pick the viewpoint plan for a Parkway stop rather than casually extending downhill.',
    land:'Use the Bow Summit / Peyto viewpoint approach. Parks also lists a separate difficult shore route; it is not the ordinary viewpoint outing.',
    winter:'Parks publishes a designated winter viewpoint route. Check its map, current snow conditions and the Highway 93N journey; a summer path or parking assumption is insufficient.',
    journey:'Arrange the Parkway road journey or the actual tour product, its stop and return. Do not assume that a Lake Louise or Moraine shuttle serves this stop.',
    rule:'preservation', guide:{label:'Peyto viewpoint planning',href:'/trails/peyto-lake-viewpoint'}, source:lakeSources.winter },
  { id:'bow-lake', name:'Bow Lake', area:'parkway', park:'Banff National Park, Alberta', interests:['view','shore'], seasons:['summer','winter'],
    description:'A lakeside stop and a longer Bow Glacier Falls hike require different time and preparation. Decide which is the objective before leaving your base.',
    land:'Stay with the chosen designated outing. A lodge or roadside stop does not imply a canoe-rental operation or permission to paddle.',
    winter:'Choose a road-access and land-view plan using current reports. Do not extend a summer shoreline description onto lake ice or into avalanche terrain.',
    journey:'Use Highway 93N conditions and actual tour-stop information. Confirm property access, food and washrooms rather than assuming year-round public services.',
    rule:'preservation', guide:{label:'Parkway and weather preparation',href:'/conditions'}, source:lakeSources.water },
  { id:'herbert', name:'Herbert Lake', area:'parkway', park:'Banff National Park, Alberta', interests:['view','shore'], seasons:['summer','winter'],
    description:'Treat a smaller Parkway lake as a chosen stop, with time to park legally and return to the main journey.',
    land:'Check the day-use access and current report. Smaller scale does not establish easier water conditions or a cleared path.',
    winter:'Confirm the road and day-use approach before making this the main winter objective. Choose a different stop if the approach or facilities do not fit the group.',
    journey:'Arrange the Highway 93N road journey or a product that actually includes this stop. There is no assumed spare space, departure or service in this guide.',
    rule:'recreation', guide:{label:'Prepare the road journey',href:'/conditions'}, source:lakeSources.water },
  { id:'emerald', name:'Emerald Lake', area:'yoho', park:'Yoho National Park, British Columbia', interests:['view','shore','rental'], seasons:['summer','winter'],
    description:'Make this a separate Yoho day, with a lake view, a chosen walk or the operator’s actual canoe-rental format.',
    land:'Parks lists a 5.2 km shoreline loop; its east side can be muddy and rooted. A short visit and the full loop are different outings.',
    winter:'Use Yoho’s current winter reports and designated activity descriptions. Do not infer an open full loop, cleared surface, rental operation or usable ice.',
    journey:'Emerald Lake Road is a separate road journey near Field, BC. The Lake Louise–Moraine Lake Connector does not serve Emerald Lake; confirm your driver or commercial transfer.',
    rule:'yoho', guide:{label:'Field and Yoho base guide',href:'/towns/field-yoho'}, source:lakeSources.yoho },
];
export const lakeFaqs = [
  { id:'colour', topic:'science', question:'Why are some mountain lakes turquoise?', answer:'Glaciers grind bedrock into very fine sediment called rock flour. Meltwater can carry it into lakes, where suspended particles scatter sunlight and affect the apparent colour. This explains a mechanism, not a ranking of Banff lakes by sediment concentration or a promise of the colour on your visit.', source:lakeSources.flour, label:'National Park Service: glacial flour' },
  { id:'frozen-now', topic:'ice', question:'Is Lake Louise or Moraine Lake frozen right now?', answer:'This guide has no current, site-specific ice observation. A month, air temperature or old photograph cannot answer that question. Parks Canada does not monitor natural ice surfaces for safety or mark hazards. For a skating visit, check a designated rink’s current status with its operator and keep a land-based alternative.', source:lakeSources.ice, label:'Parks Canada: natural ice' },
  { id:'skating', topic:'ice', question:'Can I walk or skate on the lake because it looks frozen?', answer:'Appearance and other people’s tracks do not establish ice thickness or strength along a route. A prepared skating area does not assess the whole lake. Check the actual managed facility and its operating area; do not extend a shoreline walk onto ice as a shortcut.', source:lakeSources.skating, label:'Fairmont: designated Lake Louise skating' },
  { id:'swimming', topic:'water', question:'Can I swim in Lake Louise or Moraine Lake?', answer:'Parks lists swimming among the activities allowed in the zones containing these lakes, subject to current orders and closures. Permission is different from conditions or suitability. Cold immersion can affect breathing and muscle function rapidly, even for a strong swimmer. No calendar-based water temperature or warm-lake guarantee is supplied here.', source:lakeSources.water, label:'Parks Canada: permitted water activities' },
  { id:'own-boat', topic:'water', question:'Can I bring my own canoe, kayak or paddleboard?', answer:'Rules differ by waterbody. Personal paddling is prohibited at Moraine Lake, Bow Lake and Lake Minnewanka under current rules; specified on-site rental exceptions are separate. Where personal craft are permitted, meet the current cleaning, drying and certification conditions before entering or changing waters. Check Yoho separately for Emerald Lake.', source:lakeSources.order, label:'Current Banff restricted activity order' },
  { id:'moraine-access', topic:'journey', question:'Can I drive to Moraine Lake?', answer:'Moraine Lake Road is closed to personal vehicles year-round, with specific authorised exceptions. Choose the applicable seasonal Parks reservation, authorised commercial service or confirmed lodge-guest arrangement. A future visit needs its own published dates and return plan; a Lake Louise parking space is not Moraine access.', source:lakeSources.bus, label:'Parks Canada: Lake Louise and Moraine access' },
  { id:'canoe-rental', topic:'water', question:'Does a shuttle reservation include a canoe?', answer:'No. Transport, canoe operation and the rental party’s requirements are separate checks. Read the actual boathouse or lodge policy, season, weather limits, equipment and return deadline. A general tour search or a lakeside hotel booking does not reserve a canoe.', source:'https://morainelake.com/day-visits/', label:'Moraine Lake Lodge: canoe arrangements' },
  { id:'peyto-shore', topic:'journey', question:'Is there a trail to the Peyto Lake shore?', answer:'Parks lists a separate difficult shore route, 1.3 km one way from the lookout, with a substantial descent. It is different from the ordinary viewpoint outing. Choose the whole route and return deliberately; do not turn a short view stop into an unplanned shore hike.', source:lakeSources.hikes, label:'Parks Canada: current route descriptions' },
  { id:'best-lake', topic:'journey', question:'Which lake should I choose for my group?', answer:'Start with the experience and the whole journey: a view and a pause, a specific land route, or a seasonal rental. Compare the actual approach, distance, transport, facilities and return. Choose one main objective and leave room to shorten it or change plans. No lake needs to deliver a particular photograph to make a worthwhile day.', source:'/lakes#lake-plans', label:'Compare lake plans' },
];
export interface LakeFilters { area:string; interest:string; season:string }
export function normalizeLakeFilters(input:Partial<LakeFilters>):LakeFilters {
  return {
    area: input.area && Object.hasOwn(lakeAreaLabels,input.area) ? input.area : 'all',
    interest: input.interest && Object.hasOwn(lakeInterestLabels,input.interest) ? input.interest : 'all',
    season: input.season && ['summer','winter'].includes(input.season) ? input.season : 'all',
  };
}
export function filterLakePlans(input:Partial<LakeFilters>):LakePlan[] {
  const filters=normalizeLakeFilters(input);
  return lakePlans.filter(lake => (filters.area==='all'||lake.area===filters.area) && (filters.interest==='all'||(filters.season==='winter' ? (lake.winterInterests || ['view']) : lake.interests).includes(filters.interest as keyof typeof lakeInterestLabels)) && (filters.season==='all'||lake.seasons.includes(filters.season as 'summer'|'winter')));
}
