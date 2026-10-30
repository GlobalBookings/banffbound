export const larchReviewedAt='2026-10-29';
export const larchSources={
  fall:'https://www.banfflakelouise.com/fall',
  hiking:'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
  access:'https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise',
  reports:'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking/etat-sentiers-trail-conditions',
  notices:'https://parks.canada.ca/pn-np/ab/banff/bulletins',
  avalanche:'https://parks.canada.ca/pn-np/mtn/securiteenmontagne-mountainsafety/avalanche',
};
export const larchFilterOptions={
  area:[['all','All starting areas'],['moraine','Moraine Lake'],['lakeshore','Lake Louise lakeshore'],['highway','Taylor Creek / Highway 1'],['sunshine','Sunshine base area']],
  duration:[['all','All published return estimates'],['up-to-four','Up to 4 hours'],['over-four','More than 4 hours']],
  season:[['autumn','Autumn / larch trip'],['snow','Snow-season planning'],['other','Other travel dates']],
} as const;
export type LarchFilters={area:'all'|'moraine'|'lakeshore'|'highway'|'sunshine';duration:'all'|'up-to-four'|'over-four';season:'autumn'|'snow'|'other'};
export const defaultLarchFilters:LarchFilters={area:'all',duration:'all',season:'autumn'};
export const larchQueryKeys={area:'larch_area',duration:'larch_duration',season:'larch_season'} as const;
// Public choice index. The page renders figures from the shared reviewed trail
// projection; the client never imports the raw trail, photo or map records.
export const larchRouteChoices=[
  {id:'larch-valley-minnestimma-lakes',area:'moraine',duration:'up-to-four',title:'Larch Valley / Minnestimma Lakes',idea:'Make the valley and lakes your destination, with the full descent and seasonal transport still ahead.',boundary:'Sentinel Pass is a separate, steeper continuation. Reaching the larch forest does not require making that upper pass your objective.',larchSource:larchSources.hiking},
  {id:'sentinel-pass-via-larch-valley',area:'moraine',duration:'over-four',title:'Sentinel Pass via Larch Valley',idea:'Compare the longer pass objective only after considering the valley endpoint on its own.',boundary:'The pass profile includes the approach through Larch Valley. Do not add both full distances together or use this as a through-route into Paradise Valley.',larchSource:larchSources.hiking},
  {id:'saddleback-pass',area:'lakeshore',duration:'up-to-four',title:'Saddleback Pass',idea:'An uphill lakeshore-to-pass outing with a different start from Moraine Lake.',boundary:'Parks grades this route Difficult. Its shorter published distance does not make it an easy alternative, and Fairview Mountain is a separate objective.',larchSource:larchSources.hiking},
  {id:'taylor-lake',area:'highway',duration:'over-four',title:'Taylor Lake',idea:'Plan the climb from the highway-side day-use area to the lake, rather than a shuttle-served lake visit.',boundary:'The published profile ends at Taylor Lake. An O’Brien Lake extension adds another route decision; no quieter-trail or parking guarantee is made.',larchSource:larchSources.fall},
  {id:'healy-pass',area:'sunshine',duration:'over-four',title:'Healy Pass',idea:'A longer walk from Sunshine’s lower base parking area through the valley to the pass.',boundary:'The trail starts behind the main gondola building at the base. It is distinct from the lift-served Sunshine Meadows network; a gondola ticket does not shorten this profile.',larchSource:larchSources.hiking},
] as const;
export const larchSeasonNotes={
  autumn:'Plan around a variable autumn window. Banff & Lake Louise Tourism describes typical larch colour from late September into early October, rather than a guaranteed peak for a particular year or route. Check recent official trail information and ask the visitor centre about the actual outing.',
  snow:'These are summer hiking profiles, not winter route recommendations. Parks identifies avalanche exposure and advises against mid-October to mid-June travel on the listed Lake Louise-area routes. Healy Pass also needs its own snow-season assessment. A colour trip, a clear road or this selection does not establish a suitable winter hike.',
  other:'Outside the short autumn colour window, choose an outing for the actual landscape and route. Do not expect golden needles or treat a summer hiking estimate as year-round access. Check current reports, seasonal transport and the whole return before making a plan.',
} as const;
export function normaliseLarchFilters(value:unknown):LarchFilters{
  const input=value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:{};
  const output={...defaultLarchFilters};
  for(const key of Object.keys(larchFilterOptions) as (keyof LarchFilters)[]){
    const candidate=input[key];
    if(typeof candidate==='string'&&larchFilterOptions[key].some(([id])=>id===candidate))(output as Record<string,string>)[key]=candidate;
  }
  return output;
}
export function buildLarchPlan(value:unknown=defaultLarchFilters){
  const filters=normaliseLarchFilters(value);
  const visibleIds=larchRouteChoices.filter(route=>(filters.area==='all'||route.area===filters.area)&&(filters.duration==='all'||route.duration===filters.duration)).map(route=>route.id);
  return{filters,visibleIds,summary:`${visibleIds.length} of ${larchRouteChoices.length} route profiles shown`,empty:visibleIds.length===0,note:larchSeasonNotes[filters.season]};
}
export function readLarchFiltersFromUrl(value:string):LarchFilters{
  try{const url=new URL(value),input:Record<string,unknown>={};for(const key of Object.keys(larchQueryKeys) as (keyof LarchFilters)[]){const values=url.searchParams.getAll(larchQueryKeys[key]);if(values.length===1)input[key]=values[0];}return normaliseLarchFilters(input);}catch{return{...defaultLarchFilters};}
}
export function updateLarchSettingsUrl(value:string,filters:unknown):string|null{
  try{const url=new URL(value);if(!['http:','https:'].includes(url.protocol))return null;const valid=normaliseLarchFilters(filters);for(const key of Object.keys(larchQueryKeys) as (keyof LarchFilters)[]){url.searchParams.delete(larchQueryKeys[key]);if(valid[key]!==defaultLarchFilters[key])url.searchParams.set(larchQueryKeys[key],valid[key]);}return url.href;}catch{return null;}
}
export const larchFaqs=[
  {question:'When is larch season in Banff?',answer:'Banff & Lake Louise Tourism describes a typical late-September to early-October colour window. Weather and the actual location affect the display. This page provides seasonal context, not live foliage observations, a year-specific peak forecast or a guarantee for a booked trip.'},
  {question:'Do I need to reach Sentinel Pass to see Larch Valley?',answer:'No. Larch Valley / Minnestimma Lakes is its own published hiking endpoint from Moraine Lake. Sentinel Pass continues farther and has a Difficult route profile. Choose the endpoint and complete return before leaving; do not treat the upper pass as a compulsory finish.'},
  {question:'Can I drive my own car to Moraine Lake for a larch hike?',answer:'Moraine Lake Road is closed to personal vehicles year-round. Arrange an authorized seasonal transport option and its return. The Parks Canada 2026 shuttle season ended October 12; check the published dates and reservation instructions for your actual future trip. Arrival at the Park and Ride is distinct from arrival at the trailhead.'},
  {question:'Does an estimate of up to four hours mean an easy half-day?',answer:'No. These are Parks Canada summer round-trip hiking estimates, excluding your approach journey, transport waits and other stops. Saddleback Pass, for example, is graded Difficult despite its three-to-four-hour return estimate. Assess the terrain, climb, current conditions, group and full return separately.'},
  {question:'Can I use these routes for a winter larch walk?',answer:'Do not use this autumn comparison as a winter recommendation. The listed Lake Louise-area hikes are covered by Parks Canada’s avalanche warning against travel from mid-October through mid-June. Healy Pass needs its own snow-season route assessment. Selecting Snow-season planning changes the preparation notes; it does not confirm access or approve an outing.'},
];
