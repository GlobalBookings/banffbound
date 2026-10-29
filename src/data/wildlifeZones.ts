/** Public visitor-area references, never animal locations or observation coordinates. */
export const wildlifeAreaReviewedAt = '2026-10-29';
export const wildlifeAreaSources = {
  habitats: 'https://parks.canada.ca/pn-np/ab/banff/nature/faune-wildlife',
  hikes: 'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
  closures: 'https://parks.canada.ca/pn-np/ab/banff/visit/fermetures-closures',
  parkway: 'https://parks.canada.ca/pn-np/ab/banff/visit/les10-top10/promenade-de-la-vallee-de-la-bow-bow-valley-parkway',
  moraine: 'https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise',
};
export const wildlifeHabitatLabels = { wetland:'Wetlands and river margins', forest:'Valley and subalpine forest', alpine:'Rocky slopes and alpine habitat' };
export const wildlifeVisitLabels = { town:'Near-town land outing', road:'Road journey', mountain:'Mountain-area visit' };
export type WildlifeSeason = 'spring'|'summer'|'fall'|'winter';
export interface WildlifeZone {
  id:string; name:string; habitat:(keyof typeof wildlifeHabitatLabels)[];
  visit:keyof typeof wildlifeVisitLabels; seasons:WildlifeSeason[];
  reference:[number,number]; description:string; activity:string;
  access:string; winter:string; guide:{href:string;label:string}; source:string;
}
const all:WildlifeSeason[] = ['spring','summer','fall','winter'];
export const wildlifeZones:WildlifeZone[] = [
  { id:'vermilion-lakes', name:'Vermilion Lakes', habitat:['wetland'], visit:'town', seasons:all, reference:[51.18,-115.61],
    description:'An introduction to the low-elevation Bow Valley: open water, marsh edges and mountain views close to Banff.',
    activity:'Bring binoculars and observe from an established public viewpoint. Notice water, vegetation and bird movement without approaching nests or leaving the road or trail.',
    access:'Choose a designated stopping place and keep the road clear. Wildlife on the verge is a reason to give space and continue, not to create a viewing queue.',
    winter:'Plan a land-based view. Snow, ice and a lake photograph do not establish a walkable shoreline or usable ice.',
    guide:{href:'/lakes',label:'Compare lake visits'}, source:wildlifeAreaSources.hikes },
  { id:'bow-valley-parkway', name:'Bow Valley Parkway', habitat:['forest'], visit:'road', seasons:all, reference:[51.30,-115.95],
    description:'A forested road corridor between the Banff and Lake Louise areas. Conservation restrictions shape when and how a visit is possible.',
    activity:'Plan a scenery and interpretation journey with ordinary designated stops. Any wildlife encounter is incidental; do not follow an animal along the road.',
    access:'The eastern 17 km has a March 1–June 25, 8 p.m.–8 a.m. travel restriction applying to everyone. Separate cycling and vehicle-access periods also need checking for the actual year.',
    winter:'Check road conditions and the exact open section. Dawn and dusk are not an instruction to enter a restricted corridor.',
    guide:{href:'/scenic-drives',label:'Plan a scenic drive'}, source:wildlifeAreaSources.parkway },
  { id:'lake-minnewanka', name:'Lake Minnewanka area', habitat:['wetland','forest'], visit:'road', seasons:all, reference:[51.25,-115.50],
    description:'A montane lake setting where a shore visit and a longer backcountry trail are different plans.',
    activity:'Compare the lake, treeline and nearby rocky slopes from a public stopping place. Observe small animals with the same care as large ones.',
    access:'Check the actual road, transit season and chosen trail. Summer restrictions beyond Stewart Canyon affect permitted activities and group arrangements; read the current order.',
    winter:'A scenic road visit does not assess the lake ice or a summer hiking route. Keep the outing on an appropriate land route.',
    guide:{href:'/lakes',label:'Lake and shore planning'}, source:wildlifeAreaSources.closures },
  { id:'fenland-marsh', name:'Fenland and Echo Creek', habitat:['wetland','forest'], visit:'town', seasons:all, reference:[51.19,-115.58],
    description:'A forest-and-creek setting close to town, useful for slowing down and learning to notice habitat rather than searching for a large animal.',
    activity:'Use the designated Fenland route. Listen for birds and look across the creek without stepping into the marsh or blocking an animal’s route.',
    access:'An animal on the path is a reason to wait well back or turn around. A short town-area trail still needs wildlife preparation.',
    winter:'Check trail reports and footing. Its summer distance and grade do not describe an icy or snow-covered surface.',
    guide:{href:'/trails/fenland-trail',label:'Fenland route details'}, source:wildlifeAreaSources.hikes },
  { id:'moraine-lake-road', name:'Moraine Lake and Paradise Valley area', habitat:['forest','alpine'], visit:'mountain', seasons:['summer','fall'], reference:[51.33,-116.18],
    description:'A subalpine-to-alpine landscape reached through a managed seasonal transport system. A lake visit is different from a pass or valley hike.',
    activity:'Choose the destination and route first. Learn how forest gives way to rock from a designated trail or viewpoint; do not seek out feeding bears or leave a route for a photograph.',
    access:'Moraine Lake Road is closed to personal vehicles year-round with specified exceptions. Confirm published seasonal transport, return arrangements and any trail-specific group restriction.',
    winter:'This is not offered as a winter wildlife outing. The road and surrounding terrain include avalanche exposure; summer access arrangements do not carry into winter.',
    guide:{href:'/shuttle-reservations',label:'Moraine transport planning'}, source:wildlifeAreaSources.moraine },
  { id:'cascade-meadows', name:'Cascade Ponds and Bankhead area', habitat:['wetland','forest'], visit:'road', seasons:all, reference:[51.21,-115.55],
    description:'A low-elevation combination of ponds, forest and human history in the Minnewanka road area.',
    activity:'Make the landscape or a designated historical walk the objective. Watch quietly from a public path, and keep picnic food attended and packed away.',
    access:'Choose the actual site and parking or transit plan. Do not assume a picnic facility, path or seasonal road is open from its presence on a map.',
    winter:'Check the applicable road section and site conditions. A pond visit remains a land-based plan unless a separately managed activity is confirmed.',
    guide:{href:'/parking',label:'Plan access and stopping'}, source:wildlifeAreaSources.closures },
  { id:'icefields-pkwy-north', name:'Icefields Parkway — Waterfowl Lakes area', habitat:['wetland','forest','alpine'], visit:'road', seasons:all, reference:[51.85,-116.62],
    description:'A more distant mountain road setting with lakes and changes in elevation. This reference marks a visitor area, not an animal report or a kilometre-by-kilometre hotspot.',
    activity:'Plan a road day with a chosen public viewpoint. Explore the difference between valley wetlands, forest and the alpine using binoculars from a suitable stopping place.',
    access:'Budget the whole road journey, fuel, weather and return. Do not stop in the travel lane or on an unsuitable shoulder for an animal.',
    winter:'Use current Highway 93N information, equipment requirements and closures. A mapped stop does not establish access to an unmaintained summer trail.',
    guide:{href:'/conditions',label:'Check road and weather sources'}, source:wildlifeAreaSources.habitats },
  { id:'spray-valley', name:'Spray River trailhead area', habitat:['forest'], visit:'town', seasons:all, reference:[51.16,-115.56],
    description:'A forested river-valley outing near Banff. Choose a specific designated route rather than treating the whole valley as a viewing site.',
    activity:'Observe forest structure and signs of animal movement from the trail. Tracks are an opportunity to learn; never follow them off-route toward an animal.',
    access:'Use the route’s actual trailhead and current report. Do not drive the golf course road as a winter wildlife workaround: it has a November–May driving closure for the wildlife corridor.',
    winter:'Choose an officially described winter activity and respect its designated track or trail. Keep wildlife space even near developed facilities.',
    guide:{href:'/trails/spray-river-west',label:'Choose a Spray River route'}, source:wildlifeAreaSources.closures },
  { id:'lake-louise-area', name:'Lake Louise village and lakeshore area', habitat:['forest','alpine'], visit:'mountain', seasons:all, reference:[51.42,-116.20],
    description:'A subalpine base where the village, lakeshore and ski-area sightseeing operation are separate destinations.',
    activity:'Use a designated walk or viewpoint to compare dense forest with distant alpine slopes. A sightseeing lift does not guarantee a bear encounter.',
    access:'Choose the exact destination and seasonal transport. A lakeshore bus is not automatically a ski-resort or gondola transfer.',
    winter:'Stay with an appropriate land route or a confirmed managed activity. Snow cover does not make a summer pass hike or the whole lake suitable for travel.',
    guide:{href:'/towns/lake-louise',label:'Lake Louise base guide'}, source:wildlifeAreaSources.habitats },
  { id:'johnston-creek', name:'Johnston Canyon and Ink Pots area', habitat:['forest','wetland'], visit:'road', seasons:all, reference:[51.25,-115.84],
    description:'A creek-and-forest outing where the Lower Falls, Upper Falls and Ink Pots are different route commitments.',
    activity:'Notice flowing water and forest from the designated route. Do not leave the walkway to approach birds, nests or an animal beside the creek.',
    access:'Choose the route length, current footing and transport. Reaching a waterfall does not commit the group to continuing to the Ink Pots.',
    winter:'Check the trail report and traction needs. A popular path can still be icy; the longer summer route is not an automatic winter extension.',
    guide:{href:'/trails/johnston-canyon-lower-falls',label:'Compare canyon route demands'}, source:wildlifeAreaSources.hikes },
];
export interface WildlifeFilters { habitat:string; species:string; season:string; visit:string }
export function filterWildlifeAreas(filters:Partial<WildlifeFilters>, speciesHabitats:Record<string,string[]> = {}):WildlifeZone[] {
  const habitat=Object.hasOwn(wildlifeHabitatLabels,filters.habitat || '') ? filters.habitat : 'all';
  const visit=Object.hasOwn(wildlifeVisitLabels,filters.visit || '') ? filters.visit : 'all';
  const season=['spring','summer','fall','winter'].includes(filters.season || '') ? filters.season : 'all';
  const key=filters.species || '';
  const habitats=Object.hasOwn(speciesHabitats,key)&&Array.isArray(speciesHabitats[key]) ? speciesHabitats[key] : [];
  return wildlifeZones.filter(z => (habitat==='all'||z.habitat.includes(habitat as keyof typeof wildlifeHabitatLabels)) && (visit==='all'||z.visit===visit) && (season==='all'||z.seasons.includes(season as WildlifeSeason)) && (!habitats.length||z.habitat.some(h=>habitats.includes(h))));
}
