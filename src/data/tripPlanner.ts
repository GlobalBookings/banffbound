/** Editorial planning ideas, reviewed 2026-10-28. Durations are allowances, not schedules. */
export type TripSeason = 'winter' | 'summer';
export type TripBase = 'banff' | 'canmore' | 'louise';
export type TripTransport = 'car-free' | 'drive';
export type PlannerActivity = {
  id: string; name: string; area: 'banff' | 'louise' | 'canmore' | 'regional';
  season: TripSeason | 'all'; hours: number; fullDay?: boolean; transfer?: boolean;
  description: string; guide: string; source: string; icon: string;
};
export type TripPlan = { season: TripSeason; base: TripBase; transport: TripTransport; days: string[][] };
export const MAX_TRIP_DAYS = 7;
export const MAX_DAY_ACTIVITIES = 3;
export const plannerActivities: PlannerActivity[] = [
  { id:'town', name:'Find your feet in Banff', area:'banff', season:'all', hours:1.5, description:'A short town walk, a warm drink and time to find your transport stop. Choose paths that suit the weather and everyone’s mobility.', guide:'/towns/banff/', source:'https://banff.ca/', icon:'🏘️' },
  { id:'dinner', name:'An unhurried Banff dinner', area:'banff', season:'all', hours:1.5, description:'Choose somewhere near your room or return stop. Check opening hours and make a reservation for holiday or peak-season evenings.', guide:'/eat-and-drink', source:'https://www.banfflakelouise.com/eat-drink', icon:'🍽️' },
  { id:'culture', name:'Galleries & a café stop', area:'banff', season:'all', hours:2, description:'Keep a warm alternative near town. Check the current exhibition, opening hours and accessibility before selecting the venue.', guide:'/arts-culture', source:'https://banff.ca/122/Arts-and-Culture', icon:'🎨' },
  { id:'cave', name:'Cave and Basin history', area:'banff', season:'all', hours:2, description:'Visit the historic site’s exhibits when open. This is separate from swimming at Upper Hot Springs; winter opening days and temporary closures need checking.', guide:'/blog/cave-and-basin-guide', source:'https://parks.canada.ca/lhn-nhs/ab/caveandbasin', icon:'🏛️' },
  { id:'gondola', name:'Banff Gondola views', area:'banff', season:'all', hours:3, transfer:true, description:'Allow time for the journey to the base, ticket collection and weather-dependent sightseeing. Confirm operations, your ticket and the return connection.', guide:'/blog/banff-gondola-guide', source:'https://www.banffjaspercollection.com/attractions/banff-gondola/', icon:'🚡' },
  { id:'canmore', name:'A day around Canmore', area:'canmore', season:'all', hours:4, description:'Explore the town, have lunch and leave time for your return. Roam Route 3 links Banff and Canmore; local attractions need their own connections.', guide:'/towns/canmore/', source:'https://roamtransit.com/', icon:'☕' },
  { id:'lake', name:'Lake Louise lakeshore time', area:'louise', season:'all', hours:3, transfer:true, description:'Make the lakeshore your main outing, with a warm break and confirmed transport. Stay on designated routes and off unassessed natural ice.', guide:'/towns/lake-louise/', source:'https://parks.canada.ca/pn-np/ab/banff/activ/raquette-snowshoeing/lakelouise', icon:'🏔️' },
  { id:'ski', name:'A resort ski or snowboard day', area:'regional', season:'winter', hours:7, fullDay:true, transfer:true, description:'Choose one resort, confirm tickets, rentals and transport, then use the ski-day planner for the morning and return details.', guide:'/ski-day-planner', source:'https://www.skibig3.com/', icon:'🎿' },
  { id:'lesson', name:'Your first ski or snowboard lesson', area:'regional', season:'winter', hours:7, fullDay:true, transfer:true, description:'A lesson day needs time for travel, check-in, rental fitting and warm breaks. Confirm the learning-area ticket and equipment in your package.', guide:'/learn-to-ski', source:'https://www.skibig3.com/', icon:'⛷️' },
  { id:'snowshoe', name:'A modest winter snowshoe outing', area:'regional', season:'winter', hours:4, transfer:true, description:'Pick a winter-designated route with a guide or visitor-centre advice. Traction, weather and avalanche boundaries determine the outing, not this plan.', guide:'/blog/banff-snowshoeing-guide', source:'https://parks.canada.ca/pn-np/ab/banff/activ/raquette-snowshoeing/banff', icon:'❄️' },
  { id:'skate', name:'A managed rink session', area:'banff', season:'winter', hours:2, description:'Use an officially open managed rink, check the session and arrange rentals if needed. This suggestion does not send you onto a frozen lake or river.', guide:'/blog/banff-ice-skating', source:'https://banff.ca/110/Outdoor-Ice-Skating', icon:'⛸️' },
  { id:'nordic', name:'Canmore Nordic lesson or ski', area:'canmore', season:'winter', hours:5, transfer:true, description:'Confirm grooming, passes, lessons and equipment at the Nordic Centre. Town transit is not proof of a direct connection to the venue.', guide:'/blog/banff-cross-country-skiing', source:'https://www.albertaparks.ca/parks/kananaskis/canmore-nordic-centre-pp/', icon:'🌲' },
  { id:'dogs', name:'A booked dog-sledding outing', area:'regional', season:'winter', hours:5, transfer:true, description:'Confirm the operator’s actual meeting point, age/weight requirements, transfers and cancellation terms. Keep the rest of the day light.', guide:'/blog/banff-dog-sledding', source:'https://www.snowyowltours.com/', icon:'🐾' },
  { id:'tube', name:'Norquay tubing session', area:'banff', season:'winter', hours:4, transfer:true, description:'Confirm session times and return transport. Norquay currently requires both age 4+ and height 42in+; check the current rules before booking.', guide:'/blog/banff-tubing-guide', source:'https://banffnorquay.com/tubing/', icon:'🛷' },
  { id:'fatbike', name:'A winter fat-bike outing', area:'regional', season:'winter', hours:4, transfer:true, description:'Arrange suitable rental equipment and choose an officially permitted route. Surface conditions, shared-track etiquette and closures can change the plan.', guide:'/blog/banff-fat-biking', source:'https://parks.canada.ca/pn-np/ab/banff/activ/cyclisme-biking/veloniege-fatbike', icon:'🚲' },
  { id:'winter-photo', name:'A short winter photo walk', area:'banff', season:'winter', hours:1.5, description:'Choose a maintained town viewpoint with a warm indoor stop nearby. Keep batteries warm and stay clear of river ice and closed paths.', guide:'/blog/banff-winter-photography', source:'https://parks.canada.ca/pn-np/ab/banff/activ/marchehiver-winterwalking/banff', icon:'📷' },
  { id:'moraine', name:'Moraine Lake by booked transport', area:'louise', season:'summer', hours:5, transfer:true, description:'Reserve the transport you need and leave room for queues, walking and the return. This is a summer-access outing, not a winter lake stop.', guide:'/blog/moraine-lake-shuttle-guide', source:'https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise', icon:'💎' },
  { id:'agnes', name:'A Lake Agnes hiking day', area:'louise', season:'summer', hours:6, fullDay:true, transfer:true, description:'Check snow, trail access, transport and your group’s ability. The teahouse has its own operating season; a summer label does not establish current conditions.', guide:'/blog/lake-agnes-tea-house', source:'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking/etat-sentiers-trail-conditions', icon:'🥾' },
  { id:'canoe', name:'Lake Louise canoe time', area:'louise', season:'summer', hours:4, transfer:true, description:'Confirm rental operations, weather, terms and your journey to the lakeshore. Keep a walking or indoor alternative if boats are not operating.', guide:'/paddling', source:'https://www.chateau-lake-louise.com/experience/activities/', icon:'🛶' },
  { id:'cruise', name:'Lake Minnewanka cruise', area:'banff', season:'summer', hours:4, transfer:true, description:'Book a sailing that fits your transport. The cruise and seasonal transit have separate calendars; confirm both before setting out.', guide:'/blog/lake-minnewanka-cruise-tickets', source:'https://www.banffjaspercollection.com/attractions/lake-minnewanka-cruise/', icon:'🚤' },
  { id:'parkway', name:'An Icefields Parkway road day', area:'regional', season:'summer', hours:8, fullDay:true, transfer:true, description:'Choose a limited set of stops, plan fuel and check the full route. Arrange a guided transfer or suitable vehicle; this planner does not make road or hiking access decisions.', guide:'/icefields-parkway-planner', source:'https://parks.canada.ca/pn-np/ab/banff/visit/promenadedesglaciers-icefieldsparkway', icon:'🛣️' },
  { id:'via-ferrata', name:'Norquay via ferrata booking', area:'banff', season:'summer', hours:5, fullDay:true, transfer:true, description:'Choose an operator-approved route and check age, height, weight, equipment and weather terms. Confirm the meeting point and shuttle or driving plan.', guide:'/via-ferrata', source:'https://banffnorquay.com/via-ferrata/', icon:'🧗' },
  { id:'hike', name:'A summer hike that fits your group', area:'regional', season:'summer', hours:6, fullDay:true, transfer:true, description:'Select a route using distance, elevation, current conditions and your least experienced member. Check wildlife restrictions and trailhead access separately.', guide:'/trails', source:'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking/etat-sentiers-trail-conditions', icon:'⛰️' },
];
export const activityById = Object.fromEntries(plannerActivities.map(activity => [activity.id, activity]));
export const plannerTemplates = [
  { id:'winter-nonski-3', name:'A slower winter weekend', season:'winter' as TripSeason, description:'Three days of town time, a lake outing and warm alternatives.', days:[['town','culture'],['lake'],['skate','dinner']] },
  { id:'winter-5', name:'Five winter days, your way', season:'winter' as TripSeason, description:'A ski day, a rest day and room for a snow adventure.', days:[['town'],['ski'],['culture','dinner'],['dogs'],['winter-photo']] },
  { id:'winter-family-4', name:'Four family winter days', season:'winter' as TripSeason, description:'One main outing per day, with room for warm breaks.', days:[['town','culture'],['lesson'],['skate'],['canmore']] },
  { id:'first-timer-3', name:'A first summer weekend', season:'summer' as TripSeason, description:'Banff town, a focused Lake Louise day and one main lake outing.', days:[['town','gondola'],['lake'],['cruise','dinner']] },
  { id:'adventure-5', name:'Five summer adventure days', season:'summer' as TripSeason, description:'Separate the longer hikes and bookings instead of racing between them.', days:[['town'],['agnes'],['moraine'],['parkway'],['via-ferrata']] },
  { id:'ultimate-7', name:'A relaxed summer week', season:'summer' as TripSeason, description:'Town, lakes, a road day and two flexible outdoor days.', days:[['town'],['gondola','culture'],['lake','canoe'],['moraine'],['parkway'],['cruise'],['hike']] },
  { id:'family-5', name:'Five family summer days', season:'summer' as TripSeason, description:'A summer-specific family plan with one main destination each day.', days:[['town','culture'],['gondola'],['lake','canoe'],['canmore'],['cruise']] },
];
export const defaultTripPlan = (): TripPlan => createTripPlan('winter-nonski-3');
export function createTripPlan(templateId: string): TripPlan {
  const template = plannerTemplates.find(item => item.id === templateId) || plannerTemplates[0];
  return { season:template.season, base:'banff', transport:'car-free', days:template.days.map(day => [...day]) };
}
export const activityFitsSeason = (activity: PlannerActivity, season: TripSeason) => activity.season === 'all' || activity.season === season;
export function encodeTripPlan(plan: TripPlan): string { return JSON.stringify({ v:1, s:plan.season, b:plan.base, t:plan.transport, d:plan.days }); }
export function decodeTripPlan(value: string): TripPlan | null {
  if (!value || value.length > 6000) return null;
  try {
    const data = JSON.parse(value);
    if (!data || data.v !== 1 || !['winter','summer'].includes(data.s) || !['banff','canmore','louise'].includes(data.b) || !['car-free','drive'].includes(data.t) || !Array.isArray(data.d) || data.d.length < 1 || data.d.length > MAX_TRIP_DAYS) return null;
    if (!data.d.every((day: unknown) => Array.isArray(day) && day.length <= MAX_DAY_ACTIVITIES && new Set(day).size === day.length && day.every(id => typeof id === 'string' && Object.hasOwn(activityById,id) && activityFitsSeason(activityById[id],data.s)))) return null;
    return { season:data.s, base:data.b, transport:data.t, days:data.d.map((day: string[]) => [...day]) };
  } catch { return null; }
}
export function tripPlanWarnings(plan: TripPlan): string[] {
  const warnings: string[] = [];
  plan.days.forEach((ids,index) => {
    const activities = ids.map(id => activityById[id]).filter(Boolean);
    const label = `Day ${index+1}`;
    const hours = activities.reduce((sum,activity) => sum+activity.hours,0);
    if (!activities.length) warnings.push(`${label} is open. Keep it as a rest or travel day, or add an outing.`);
    if (hours > 8 || activities.some(activity => activity.fullDay) && activities.length > 1) warnings.push(`${label} is a big day. Consider keeping only the main outing and a flexible evening.`);
    const areas = new Set(activities.map(activity => activity.area).filter(area => area !== 'regional'));
    if (areas.size > 1) warnings.push(`${label} combines different towns or areas. Check the complete transfer and return before booking.`);
    const baseNames = { banff:'Banff', canmore:'Canmore', louise:'Lake Louise' };
    const awayAreas = [...areas].filter(area => area !== plan.base);
    if (plan.transport === 'car-free') {
      if (awayAreas.length) warnings.push(`${label}: confirm the complete journey from ${baseNames[plan.base]} to ${awayAreas.map(area => baseNames[area]).join(' and ')} and the final return, especially for an evening meal. Town transit and resort shuttles are different services.`);
      else if (activities.some(activity => activity.transfer)) warnings.push(`${label} needs a confirmed activity transfer or public-transit connection. Check the actual stop, date and final return; a town bus is not a resort shuttle.`);
      if (plan.base === 'canmore' && activities.some(activity => activity.area === 'regional')) warnings.push(`${label}: check the separate Canmore connection before booking a resort or regional outing with an early start.`);
    } else if (awayAreas.length) warnings.push(`${label}: allow for the drive from ${baseNames[plan.base]} to ${awayAreas.map(area => baseNames[area]).join(' and ')}, parking and the return. Activity allowances do not include those journeys.`);
  });
  if (plan.transport === 'drive') warnings.push('Driving plan: check road access, weather, parking and the vehicle’s actual equipment. Keep enough flexibility to postpone an outing.');
  return warnings;
}
export function tripStayUrl(base: TripBase) { return `https://www.expedia.ca/Hotel-Search?destination=${encodeURIComponent(base === 'canmore' ? 'Canmore, Alberta' : base === 'louise' ? 'Lake Louise, Alberta' : 'Banff, Alberta')}&camref=1101l3MtWX`; }
