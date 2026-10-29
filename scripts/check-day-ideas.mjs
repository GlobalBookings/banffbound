import assert from 'node:assert/strict';
import { build } from 'esbuild';
const result=await build({entryPoints:['src/data/dayIdeas.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const ideas=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].contents).toString('base64'));
const defaults=ideas.dayDefaults;
const matching=filters=>ideas.dayIdeas.filter(activity=>ideas.matchesDayIdea(activity,{...defaults,...filters})).map(activity=>activity.id);
assert(matching({mood:'snow'}).includes('lesson'),'Winter snow ideas include a first lesson');
assert(!matching({season:'summer',mood:'snow'}).length,'Do not turn snow ideas into summer operations');
assert.deepEqual(matching({base:'canmore',nearby:true,mood:'town'}),['canmore'],'Nearby matches the selected base, not Banff by default');
assert(!matching({base:'louise',nearby:true,time:'short'}).length,'No invented short Lake Louise outing');
assert(!matching({time:'half'}).includes('ski'),'A full ski day does not fit the four-hour activity filter');
assert.deepEqual(ideas.readDayFilters('?season=garbage&base=__proto__&time=0&mood=unknown&nearby=on'),defaults);
for(const activity of ideas.dayIdeas){
 const filters={...defaults,season:activity.season==='summer'?'summer':'winter'};
 const url=new URL(ideas.dayIdeaLink(activity.id,filters),'https://banffbound.com');
 const plan=JSON.parse(url.searchParams.get('plan'));
 assert.deepEqual(plan.d,[[activity.id]]);
 assert.equal(plan.s,filters.season);
 assert.equal(plan.b,'banff');
}
assert.equal(ideas.dayIdeaLink('__proto__',defaults),'/trip-builder');
assert.equal(ideas.dayIdeaLink('moraine',defaults),'/trip-builder','Never encode a summer-only lake outing as winter');
console.log('Day-idea checks passed: season/base/time constraints, empty states, invalid filters and all23 one-day links.');
