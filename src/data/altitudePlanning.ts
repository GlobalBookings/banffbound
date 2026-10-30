/** Named publisher reference points, not surveyed entrances or a medical risk model. */
export const altitudeReviewedAt = '2026-10-29';
export const altitudeSources = {
  cdc: {label:'CDC Yellow Book 2026: high-altitude travel',url:'https://www.cdc.gov/yellow-book/hcp/environmental-hazards-risks/high-altitude-travel-and-altitude-illness.html',scope:'Published April 23, 2025; general altitude-illness and sleeping-altitude guidance, not a Banff-specific assessment.'},
  alberta: {label:'MyHealth Alberta: altitude sickness',url:'https://myhealth.alberta.ca/HEALTH/Pages/conditions.aspx?hwid=ug3357&lang=en-ca',scope:'Alberta Health Services-adapted general symptom and response information. The source displays an adaptation date of 12/10/2025.'},
  nhs: {label:'NHS: altitude sickness',url:'https://www.nhs.uk/conditions/altitude-sickness/',scope:'General symptoms, urgent warning signs and prevention information; emergency numbers on this page use Canadian sources.'},
  healthLink: {label:'Alberta Health Services: Health Link 811',url:'https://www.albertahealthservices.ca/findhealth/service.aspx?Id=1001957',scope:'Alberta health advice and navigation service; not the emergency rescue number.'},
  rescue: {label:'Parks Canada: mountain search and rescue',url:'https://www.parks.canada.ca/pn-np/mtn/securiteenmontagne-mountainsafety/programme-program/res-sar',scope:'Emergency communication, location information and satellite-phone contact; no guarantee of cell coverage or immediate rescue.'},
  banff: {label:'Town of Banff: learn about Banff',url:'https://banff.ca/252/Learn-About-Banff',scope:'Published townsite reference elevation, not each accommodation or street.'},
  louiseMap: {label:'Parks Canada: Lake Louise area map, 2025 edition',url:'https://publications.gc.ca/collections/collection_2025/pc/R64-584-2025-eng.pdf',scope:'Page 1 names the community, lakeshore and Moraine Lake elevations. This map does not establish current fares, schedules or trail conditions.'},
  gondola: {label:'Banff Gondola: technical information',url:'https://www.banffjaspercollection.com/attractions/banff-gondola/experience/',scope:'Operator elevations for the lower and upper terminals; not every Sulphur Mountain summit or boardwalk point.'},
  sunshine: {label:'Banff Sunshine: summer gondola and chairlift',url:'https://www.skibanff.com/summer/sightseeing/gondola-chairlift',scope:'Operator reference elevations for the gondola terminals. Its displayed 2026 summer season is past; it does not confirm winter sightseeing or a future summer season.'},
  louiseSki: {label:'Lake Louise Ski Resort: mountain stats',url:'https://www.skilouise.com/explore-winter/winter-ski-ride/mountain-stats/',scope:'Published resort top elevation; not the lakeshore, base lodge, a sightseeing ticket destination or terrain permission.'},
  lakeAccess: {label:'Parks Canada: visiting Lake Louise and Moraine Lake',url:'https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise',scope:'Distinct lake access and seasonal transport; current booking and return arrangements require their own checks.'},
} as const;
export const altitudePoints = [
  {id:'banff-town',label:'Banff townsite reference',metres:1383,source:'banff',note:'A town reference, not the exact elevation of every hotel.'},
  {id:'louise-community',label:'Community of Lake Louise',metres:1536,source:'louiseMap',note:'The community on the Parks map; separate from the lakeshore and ski resort.'},
  {id:'gondola-lower',label:'Banff Gondola lower terminal',metres:1583,source:'gondola',note:'At the gondola, above Banff town; not the start of every town journey.'},
  {id:'sunshine-lower',label:'Sunshine gondola base terminal',metres:1659,source:'sunshine',note:'The lower terminal; separate from the village terminal and ski summits.'},
  {id:'louise-lakeshore',label:'Lake Louise Lakeshore',metres:1731,source:'louiseMap',note:'The lakeshore on the Parks map, not Lake Louise community.'},
  {id:'moraine',label:'Moraine Lake',metres:1887,source:'louiseMap',note:'The lake reference; not a nearby pass, trail high point or winter access statement.'},
  {id:'sunshine-village',label:'Sunshine gondola village terminal',metres:2159,source:'sunshine',note:'The village terminal, not a precise hotel-room or upper ski-terrain elevation.'},
  {id:'gondola-upper',label:'Banff Gondola upper terminal',metres:2281,source:'gondola',note:'The upper terminal; outdoor stairs and hiking beyond it are separate plans.'},
  {id:'louise-ski-top',label:'Lake Louise Ski Resort published top',metres:2637,source:'louiseSki',note:'A resort maximum; your lesson, lift and ski route may remain lower.'},
] as const;
export const altitudeJourneys = [
  {id:'banff-gondola',name:'Banff town to Banff Gondola upper terminal',from:'banff-town',to:'gondola-upper',context:'This combines a town-to-lower-terminal journey with a gondola ride. The operator separately gives the lower terminal as 1,583 m and the cable-car rise as 698 m.',question:'Confirm the actual ticket, town transport, last ride down and return to your stay. The boardwalk and a hike up Sulphur Mountain have separate physical and trail requirements.',scope:'No operating hours, views, queue, walking route or mobility suitability is established.',href:'/blog/banff-gondola-guide/',linkLabel:'Plan the gondola visit',source:'gondola'},
  {id:'louise-lakeshore',name:'Lake Louise community to Lake Louise Lakeshore',from:'louise-community',to:'louise-lakeshore',context:'The community and the lake are different places. The Parks map labels them separately; a village hotel is not automatically a lakeshore hotel.',question:'Choose the actual lake transport and return, then check the walking surface and any proposed trail separately. Reaching the lake does not establish access to Lake Agnes or an alpine pass.',scope:'The difference below does not measure the ascent on a road or a hiking trail.',href:'/parking/',linkLabel:'Compare parking and transport',source:'louiseMap'},
  {id:'moraine-lake',name:'Lake Louise community to Moraine Lake',from:'louise-community',to:'moraine',context:'Moraine Lake is a separate destination from Lake Louise Lakeshore. A small difference between map elevations does not mean a short, simple or available journey.',question:'Check Parks Canada’s actual seasonal access and authorised transport. Moraine Lake Road is closed to personal vehicles year-round; do not turn this comparison into a winter walking or cycling workaround.',scope:'No winter lake outing, shuttle seat, trail access or future season dates are supplied.',href:'/shuttle-reservations/',linkLabel:'Plan the two lakes’ transport',source:'lakeAccess'},
  {id:'sunshine-village',name:'Sunshine gondola base to village terminal',from:'sunshine-lower',to:'sunshine-village',context:'The lower gondola terminal and the village are different elevations. A village visit, upper-mountain skiing and an overnight at the lodge are different plans.',question:'Ask the operator which access product fits the date and activity, and confirm the last descent. For an overnight, confirm the lodge’s arrival, baggage and departure arrangements separately.',scope:'The elevation source is a summer sightseeing page showing the past 2026 season. It does not confirm winter sightseeing or future summer operation.',href:'/ski-day-planner/',linkLabel:'Plan a resort day',source:'sunshine'},
  {id:'louise-ski',name:'Lake Louise community to the resort’s published top',from:'louise-community',to:'louise-ski-top',context:'The published resort top is separate from the community and lakeshore. It is not the elevation of every chair, lesson or beginner area.',question:'Build the actual resort day with the school or resort: ticket, appropriate lesson or terrain, equipment, transport and return. Do not aim for a resort maximum because it appears in this table.',scope:'This comparison does not identify a lift itinerary, approve terrain or establish that a particular lift is operating.',href:'/learn-to-ski/',linkLabel:'Choose a first lesson',source:'louiseSki'},
] as const;
export const altitudeFilterOptions = {
  journey:[['all','Compare all five journeys'],...altitudeJourneys.map(journey=>[journey.id,journey.name] as const)],
  overnight:[['undecided','Overnight plan not decided'],['return','Return to my existing stay'],['different','Use a different overnight base']],
} as const;
export type AltitudeFilters = {journey:'all'|typeof altitudeJourneys[number]['id'];overnight:'undecided'|'return'|'different'};
export const defaultAltitudeFilters:AltitudeFilters={journey:'all',overnight:'undecided'};
export const altitudeUrlKeys={journey:'altitude_journey',overnight:'altitude_overnight'} as const;
const keys=['journey','overnight'] as const;
export function normaliseAltitudeFilters(raw:unknown={}):AltitudeFilters{
  const input=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Record<string,unknown>:{},filters={...defaultAltitudeFilters};
  for(const key of keys)if(typeof input[key]==='string'&&altitudeFilterOptions[key].some(([value])=>value===input[key]))(filters as Record<string,string>)[key]=input[key] as string;
  return filters;
}
export function readAltitudeSettings(search:unknown){
  const params=new URLSearchParams(typeof search==='string'?search:''),raw:Record<string,string>={},invalidKeys:string[]=[];
  for(const key of keys){const values=params.getAll(altitudeUrlKeys[key]);if(!values.length)continue;if(values.length!==1||!altitudeFilterOptions[key].some(([value])=>value===values[0]))invalidKeys.push(key);else raw[key]=values[0];}
  return{filters:normaliseAltitudeFilters(raw),invalidKeys};
}
export function updateAltitudeSettingsUrl(href:string,raw:unknown):string|null{
  try{const url=new URL(href),filters=normaliseAltitudeFilters(raw);if(!['http:','https:'].includes(url.protocol))return null;for(const key of keys){url.searchParams.delete(altitudeUrlKeys[key]);if(filters[key]!==defaultAltitudeFilters[key])url.searchParams.set(altitudeUrlKeys[key],filters[key]);}return url.href;}catch{return null;}
}
export function buildAltitudeShareUrl(raw:unknown={}):string{return updateAltitudeSettingsUrl('https://banffbound.com/altitude-guide/#elevation-planner',raw)!;}
export function buildAltitudePlan(raw:unknown={}){
  const filters=normaliseAltitudeFilters(raw),visibleIds=altitudeJourneys.filter(journey=>filters.journey==='all'||journey.id===filters.journey).map(journey=>journey.id);
  const overnightQuestion=filters.overnight==='return'?'Write down where you will actually sleep after the outing, plus the last transport down and the whole return to that stay. A lower return point is not a guarantee against illness.':filters.overnight==='different'?'Get the actual overnight property or campsite elevation and arrival arrangements. A resort summit, terminal or town reference is not the elevation of your room, and this tool does not calculate a sleeping-ascent schedule.':'Decide where the night before and the night after the outing will be spent. Separate the highest place visited from the place where you will sleep; an attraction ticket does not settle the overnight plan.';
  return{filters,visibleIds,summary:`${visibleIds.length} of ${altitudeJourneys.length} journey comparisons shown`,overnightQuestion,shareUrl:buildAltitudeShareUrl(filters)};
}
export function altitudePointFor(id:string){return altitudePoints.find(point=>point.id===id)!;}
export function altitudeDifference(journey:typeof altitudeJourneys[number]){return altitudePointFor(journey.to).metres-altitudePointFor(journey.from).metres;}
export const altitudeFaqs=[
  {question:'What is the elevation of Banff and Lake Louise?',answer:'The Town of Banff publishes a 1,383 m townsite reference. Parks Canada’s 2025 Lake Louise map labels the community at 1,536 m and Lake Louise Lakeshore at 1,731 m. These are different named points, not exact elevations for every hotel or trail.'},
  {question:'Can I get altitude sickness on a Banff trip?',answer:'Altitude illness is possible on higher outings, and elevation alone cannot predict an individual response. CDC identifies unacclimatized travellers sleeping at 2,450 m or higher, sometimes lower, as at risk. Banff town is lower, but a town stay does not establish readiness for every mountain visit.'},
  {question:'Does the comparison show hiking elevation gain or a safe route?',answer:'No. It subtracts two published point elevations. Roads and trails can rise and fall between them; the difference is not total ascent, distance, duration, effort or route approval. Check the actual trail, weather, closures and transport separately.'},
  {question:'Does a gondola ticket or fitness level show that I am acclimatized?',answer:'No. A ticket only covers its stated product, and physical fitness does not protect against altitude illness. The planner asks about the journey and overnight arrangements; it does not use your home city, health history or symptoms to assign a risk score.'},
  {question:'What should I do if someone becomes unwell higher up?',answer:'Stop going higher, tell companions and get appropriate medical advice. Worsening symptoms require descent and medical help. Confusion, trouble walking straight or breathlessness at rest need emergency help; call 911 in Banff National Park and do not leave the person to descend alone.'},
  {question:'Does sharing settings send my information to a provider?',answer:'No. The copy button creates a public BanffBound link containing only the two allowlisted planning choices. It excludes unrelated address-bar parameters and does not contact an operator, reserve travel or store a health profile.'},
] as const;
