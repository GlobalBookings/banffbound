export const eveningReviewedAt = '2026-10-29';
export const eveningFilterOptions = {
  style: [['all','See every format'],['food','Dinner and conversation'],['games','Bowling and games'],['music','Live music or a show'],['dance','Dancing and a lively room']],
  group: [['all','Group not decided'],['adults','Everyone is 18 or older'],['younger','Includes someone under 18']],
  base: [['banff','Banff town'],['canmore','Canmore'],['louise','Lake Louise area'],['road','A cabin or another road base']],
} as const;
export type EveningFilters = {style:'all'|'food'|'games'|'music'|'dance';group:'all'|'adults'|'younger';base:'banff'|'canmore'|'louise'|'road'};
export const defaultEveningFilters:EveningFilters = {style:'all',group:'all',base:'banff'};
type EveningFormat = {id:string;name:string;style:EveningFilters['style'];youngerRoute:boolean;idea:string;booking:string;groupNote:string;href:string;linkLabel:string;sourceHref:string;sourceLabel:string};
export const eveningFormats:EveningFormat[] = [
  {id:'dinner',name:'Make dinner the main event',style:'food',youngerRoute:true,
    idea:'Pick a menu your whole party wants, leave time for conversation, and keep the rest of the evening flexible.',
    booking:'Choose the restaurant first, then check its table booking, actual menu and any special-event conditions.',
    groupNote:'Ask the restaurant about your party, seating and the service you intend to visit; a dinner listing does not establish an age policy.',
    href:'/blog/new-places-to-eat-in-banff/',linkLabel:'Find your dinner venue',sourceHref:'https://www.pizzeriasophiabanff.com/reservations',sourceLabel:'Example: Sophia reservations'},
  {id:'bowling',name:'Pizza, lanes and a little friendly competition',style:'games',youngerRoute:true,
    idea:'High Rollers combines bowling and dining at 110 Banff Avenue. Make the lane the centre of the outing rather than an afterthought.',
    booking:'Use the bowling booking route and select the lane seating type. Read the payment and cancellation terms before reserving; a dining table is a different booking.',
    groupNote:'High Rollers states that under-18 guests cannot remain after 10 p.m. Finish a younger group’s visit earlier and confirm supervision and session rules directly.',
    href:'https://www.highrollersbanff.com/reserve/bowling',linkLabel:'Check the lane booking route',sourceHref:'https://www.highrollersbanff.com/',sourceLabel:'High Rollers venue information'},
  {id:'pub-music',name:'Find a pub performance for your date',style:'music',youngerRoute:false,
    idea:'Start with a dated band listing at Rose & Crown or Melissa’s, then decide whether food and a table belong in the plan.',
    booking:'A table reservation, ticket and permission to enter a particular show can be separate questions. Open the event detail rather than relying on a weekly start time.',
    groupNote:'This adult-group shortlist does not establish admission for a younger party. Venue and session age rules differ; use an explicitly age-appropriate event if someone is under 18.',
    href:'/blog/banff-live-music/',linkLabel:'Compare music and show formats',sourceHref:'https://roseandcrown.ca/events/',sourceLabel:'Rose & Crown dated calendar'},
  {id:'performance',name:'Build the evening around a dated performance',style:'music',youngerRoute:true,
    idea:'Browse Banff Centre’s programme for a concert, film or another performance that gives the evening a clear focus.',
    booking:'Open the individual listing for the actual venue, doors and performance time, ticket or registration requirement, access details and any conflicting fields.',
    groupNote:'Choose an event that explicitly admits your group. Banff Centre programmes include different age restrictions and formats; the calendar is not an all-ages admission promise.',
    href:'https://www.banffcentre.ca/events',linkLabel:'Browse the current programme',sourceHref:'https://www.banffcentre.ca/maps-directions',sourceLabel:'Banff Centre maps and directions'},
  {id:'dance',name:'Choose a saloon or dance-floor evening',style:'dance',youngerRoute:false,
    idea:'The Dusty Boot pairs a saloon and dance-hall format with food and live music at 120 Banff Avenue.',
    booking:'Check the programme, reservation route, entry arrangements and the actual session you want. A dinner booking or guest list does not by itself establish every admission term.',
    groupNote:'The Dusty Boot publishes an 18-plus entry condition. Check identification and event requirements directly before making this your plan.',
    href:'https://www.dustybootbanff.com/',linkLabel:'Check The Dusty Boot programme',sourceHref:'https://www.dustybootbanff.com/',sourceLabel:'The Dusty Boot venue information'},
];
export function normaliseEveningFilters(raw:unknown):EveningFilters {
  const value=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Record<string,unknown>:{};
  const result={...defaultEveningFilters};
  for(const key of ['style','group','base'] as const){
    const candidate=value[key];
    if(typeof candidate==='string'&&eveningFilterOptions[key].some(([option])=>option===candidate)) (result as Record<string,string>)[key]=candidate;
  }
  return result;
}
const journeys:Record<EveningFilters['base'],{title:string;text:string;href:string;label:string}> = {
  banff:{title:'Finish at your actual Banff address',text:'Check the walk or local route to your lodging, including hills, winter surfaces and the last useful departure. A central restaurant and a hillside hotel are different endpoints.',href:'https://roamtransit.com/schedules-routes/',label:'Check local routes and service updates'},
  canmore:{title:'Work back from your return to Canmore',text:'Use Route 3 for the exact date and direction, then plan the final connection from the Canmore stop to your accommodation. Match the show finish to that complete journey before buying tickets.',href:'https://roamtransit.com/schedules-routes/canmore-banff-regional-route-3/',label:'Check Route 3 and the return stops'},
  louise:{title:'Choose an evening that fits the Lake Louise return',text:'Check Route 8X for your date, direction and any reservation needs, plus the separate journey to your village, lakeshore or road-base property. A late show does not establish a late return service.',href:'https://roamtransit.com/schedules-routes/lake-louise-banff-express-route-8x/',label:'Check Route 8X for your trip date'},
  road:{title:'Arrange both directions to the property',text:'Save the exact cabin or lodge address and arrange the outbound and return journeys before booking the outing. A Banff venue listing does not establish a pickup at a rural property. Check current road information for a winter drive.',href:'/conditions/',label:'Open current conditions and road sources'},
};
export function buildEveningPlan(raw:unknown={}) {
  const filters=normaliseEveningFilters(raw);
  const selectedIds=eveningFormats.filter(format=>(filters.style==='all'||format.style===filters.style)&&(filters.group!=='younger'||format.youngerRoute)).map(format=>format.id);
  const notes=['These are formats to investigate, not live events, admission approval or available tables and tickets.'];
  if(filters.group==='younger') notes.push('For a younger party, start with dinner, earlier bowling or a dated event that explicitly welcomes your ages. No pub-music or dance-floor session is verified for that group here.');
  if(!selectedIds.length) notes.push('Try dinner, earlier bowling or an explicitly age-appropriate performance. An empty shortlist does not mean every venue is unavailable.');
  return {filters,selectedIds,notes,journey:journeys[filters.base],steps:[
    'Choose the actual venue and dated session, then check the whole party’s admission and access needs.',
    'Reserve the right thing: a table, bowling lane, ticket or registration. Compare the full cost and cancellation terms.',
    journeys[filters.base].text,
  ]};
}
