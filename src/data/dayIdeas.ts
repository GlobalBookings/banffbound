import { plannerActivities, activityById, activityFitsSeason, encodeTripPlan, type PlannerActivity, type TripBase, type TripSeason } from './tripPlanner';
export type DayFilters = { season:TripSeason; base:TripBase; time:'any'|'short'|'half'; mood:'all'|'town'|'snow'|'lakes'; nearby:boolean };
export const dayDefaults:DayFilters={season:'winter',base:'banff',time:'any',mood:'all',nearby:false};
const moodIds:Record<string,string[]>={
 town:['town','dinner','culture','cave','canmore','winter-photo'],
 snow:['ski','lesson','snowshoe','skate','nordic','dogs','tube','fatbike'],
 lakes:['lake','moraine','canoe','cruise'],
};
export function readDayFilters(search:string):DayFilters {
 const q=new URLSearchParams(search);
 return {season:q.get('season')==='summer'?'summer':'winter',base:['banff','canmore','louise'].includes(q.get('base')||'')?q.get('base') as TripBase:'banff',time:['short','half'].includes(q.get('time')||'')?q.get('time') as DayFilters['time']:'any',mood:['town','snow','lakes'].includes(q.get('mood')||'')?q.get('mood') as DayFilters['mood']:'all',nearby:q.get('nearby')==='1'};
}
export function matchesDayIdea(activity:PlannerActivity,filters:DayFilters):boolean {
 return activityFitsSeason(activity,filters.season) && (filters.time==='any'||activity.hours<=(filters.time==='short'?2:4)) && (filters.mood==='all'||moodIds[filters.mood].includes(activity.id)) && (!filters.nearby||activity.area===filters.base);
}
export function dayIdeaLink(id:string,filters:DayFilters):string {
 const activity=Object.hasOwn(activityById,id)?activityById[id]:undefined;
 if(!activity||!activityFitsSeason(activity,filters.season)) return '/trip-builder';
 const query=new URLSearchParams({plan:encodeTripPlan({season:filters.season,base:filters.base,transport:'car-free',days:[[id]]})});
 return '/trip-builder/?'+query.toString();
}
export const dayIdeas=plannerActivities;
