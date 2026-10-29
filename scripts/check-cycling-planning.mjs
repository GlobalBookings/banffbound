import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { build } from 'esbuild';
import { transform } from '@astrojs/compiler';
const bundled = await build({ stdin: { contents: "export * from './src/data/cyclingPlanning.ts'; export * from './src/data/cyclingGuideOverrides.ts'; export {allBlogPosts} from './src/data/blogPosts.ts';", resolveDir: process.cwd() }, bundle: true, write: false, platform: 'node', format: 'esm' });
const data = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`);
const { cyclingRoutes: routes, assessCyclingPlan: assess, cyclingGuideOverrides: bodies, cyclingGuideMetadata: metadata, validCyclingDate, minnewankaCyclingRestricted, allBlogPosts } = data;
const ids = ['legacy-trail','sundance','tunnel-campground','tunnel-winter','spray-east','spray-west','goat-creek','rundle-riverside','minnewanka'];
assert.deepEqual(routes.map(r => r.id), ids);
const plan = (routeId, changes = {}) => assess({ routeId, season: 'summer', bike: 'pedal', direction: 'listed', ...changes });
for (const route of routes) {
  assert.ok(route.sources.length >= 2 && route.sources.every(s => new URL(s.url).protocol === 'https:'));
  assert.ok(route.direction && route.reverse && route.returnPlan && route.transport);
  assert.ok(!Object.hasOwn(route, 'status') && !Object.hasOwn(route, 'crowdLevel'));
  assert.ok(route.summer || route.winter);
}
assert.equal(plan('unknown').documented, false);
assert.equal(plan('legacy-trail', { season: 'invalid' }).documented, false);
assert.ok(plan('legacy-trail', { bike: 'throttle' }).errors.length);
assert.equal(plan('legacy-trail').documented, true);
assert.equal(plan('legacy-trail', { season: 'winter', bike: 'fat' }).documented, false);
assert.match(plan('legacy-trail').profile.basis, /26\.8.*2\.2/);
assert.match(plan('legacy-trail', { direction: 'reverse' }).direction, /Towards Banff/);
assert.match(plan('legacy-trail', { direction: 'return' }).direction, /one-way profile is not a complete return/);
for (const id of ['legacy-trail','sundance','tunnel-campground']) assert.equal(plan(id, { bike:'pedal-assist' }).documented, true);
for (const id of ['spray-east','spray-west','goat-creek','rundle-riverside','minnewanka']) {
  const p = plan(id, { bike:'pedal-assist' });
  assert.equal(p.documented, false, `${id}: no invented e-bike exception`);
  assert.match(p.restrictions.join(' '), /not a pedal-assist exception/);
}
assert.equal(plan('spray-east', {season:'winter',bike:'fat'}).documented, true);
assert.equal(plan('spray-west', {season:'winter',bike:'fat'}).documented, false);
assert.match(plan('spray-west', {season:'winter',bike:'fat'}).restrictions.join(' '), /prohibited.*winter/);
const westWinter = plan('spray-west', {season:'winter',bike:'fat'});
const westWinterReason = 'Bikes are prohibited on Spray River West in winter.';
assert.equal([...westWinter.restrictions,...westWinter.notes].filter(reason=>reason===westWinterReason).length,1,
  'A selected restriction repeated in route constraints must appear once across assessment output.');
assert.ok(westWinter.restrictions.includes(westWinterReason), 'Keep the prohibition in the priority restriction list.');
const westAssistedWinter=plan('spray-west',{season:'winter',bike:'assisted-fat'});
assert.equal(westAssistedWinter.restrictions.length,2,'Winter bicycle prohibition and separate e-bike restriction must both survive.');
assert.ok(westAssistedWinter.restrictions.includes(westWinterReason));
assert.ok(westAssistedWinter.restrictions.some(reason=>/not a pedal-assist exception/.test(reason)));
assert.match(westAssistedWinter.notes.join(' '),/avalanche paths/i,'Unrelated route advice must remain intact.');
assert.equal(plan('goat-creek', {season:'winter',bike:'fat'}).documented, false);
assert.match(plan('goat-creek', {direction:'reverse'}).direction, /towards Banff/);
assert.match(plan('goat-creek').direction, /does not finish in downtown Canmore/);
assert.equal(plan('rundle-riverside').profile.grade, 'Difficult');
assert.equal(plan('rundle-riverside').profile.distance, '13.9 km one way');
assert.match(plan('tunnel-winter', {season:'winter',bike:'fat'}).profile.distance, /3\.4.*2\.5/);
assert.equal(plan('tunnel-winter', {season:'winter',bike:'assisted-fat'}).documented, false, 'Unverified assisted winter segments cannot acquire permission.');
assert.match(plan('tunnel-campground').profile.basis, /6\.4.*6\.3/);
assert.match(plan('sundance', {season:'winter',bike:'pedal'}).notes.join(' '), /not a new legal bike-type prohibition/, 'Equipment advice must not invent a bicycle ban.');
assert.match(plan('sundance').route.constraints.join(' '), /All bikes stop/);
assert.equal(plan('minnewanka').profile.distance, '29.4 km one way to the park-boundary corridor');
assert.match(plan('minnewanka', {season:'winter',bike:'fat'}).profile.distance, /7\.8.*Aylmer/);
for (const date of ['2026-07-10','2026-09-15','2027-08-01']) {
  assert.equal(minnewankaCyclingRestricted(date), true);
  assert.equal(plan('minnewanka', {date}).documented, false);
}
for (const date of ['2026-07-09','2026-09-16']) {
  assert.equal(minnewankaCyclingRestricted(date), false);
  const p = plan('minnewanka', {date});
  assert.equal(p.documented, true);
  assert.match(p.notes[0], /Current closures and conditions still need checking/);
}
assert.equal(validCyclingDate('2024-02-29'), true);
for (const date of ['2026-02-29','2026-13-01','2026-07-32','07-10-2026','garbage']) {
  assert.equal(validCyclingDate(date), false);
  assert.ok(plan('minnewanka', {date}).errors.length);
}
assert.match(plan('minnewanka').notes[0], /No date entered/);

const source = await readFile('src/pages/biking.astro','utf8');
const compiled = await transform(source, {filename:'src/pages/biking.astro'});
assert.deepEqual(compiled.diagnostics.filter(d=>d.severity===1), []);
assert.match(source, /<noscript>/);
assert.match(source, /cyclingRoutes\.map/);
assert.match(source, /<details><summary>Direction, return and restrictions/);
assert.match(source, /Illustrative stock photograph/);
assert.ok(!/all trails open|accessible to all fitness|safest routes|\$40|4\.3 km return|alt=\{trail.name\}/.test(source));
assert.match(source, /camref=1101l3MtWX/);
assert.match(source, /partner_id=QW960HO/);

// Exercise the real bundled client script: filters, an impossible selection, reset and direction preview.
const client = source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(client);
const script = await build({stdin:{contents:client,loader:'ts',resolveDir:`${process.cwd()}/src/pages`},bundle:true,write:false,platform:'node',format:'iife'});
const elements = new Map();
function element(id) {
  if (!elements.has(id)) elements.set(id, {value:['cycle-route','cycle-season','cycle-bike'].includes(id)?'all':id==='cycle-direction'?'listed':'', hidden:false, disabled:true, dataset:{}, children:[], listeners:{}, textContent:'', attributes:{}, addEventListener(name,fn){this.listeners[name]=fn;},setAttribute(k,v){this.attributes[k]=v;},replaceChildren(){this.children=[];},append(item){this.children.push(item);},focus(){this.focused=true;} });
  return elements.get(id);
}
const cards=ids.map(id=>({...element(`card-${id}`),dataset:{cycleRoute:id}}));
const timers=[];
const context=vm.createContext({document:{getElementById:element,querySelectorAll(){return cards;},createElement(){return {textContent:''};}},setTimeout(fn){timers.push(fn);},Date,Number,Boolean,URL});
vm.runInContext(script.outputFiles[0].text,context);
assert.equal(element('cycling-controls').disabled,false);
assert.equal(cards.filter(c=>!c.hidden).length,9);
const change = ()=>element('cycling-planner').listeners.change();
element('cycle-season').value='winter';element('cycle-bike').value='assisted-fat';change();
assert.deepEqual(cards.filter(c=>!c.hidden).map(c=>c.dataset.cycleRoute),['sundance']);
element('cycle-route').value='spray-west';element('cycle-bike').value='fat';change();
assert.equal(cards.filter(c=>!c.hidden).length,0);
assert.equal(element('cycle-empty').hidden,false);
assert.equal(element('cycle-plan').hidden,false);
assert.equal(element('cycle-plan-notes').children.filter(n=>n.textContent===westWinterReason).length,1,'The actual selected-route list must render the winter prohibition once.');
element('cycle-route').value='minnewanka';element('cycle-season').value='summer';element('cycle-date').value='2026-07-10';change();
assert.equal(element('cycle-empty').hidden,false);
element('cycle-date').value='2026-07-09';change();assert.equal(cards.filter(c=>!c.hidden).length,1);
element('cycle-date').value='2026-02-29';change();assert.equal(element('cycle-error').hidden,false);assert.equal(element('cycle-plan').hidden,true);
for(const id of ['cycle-route','cycle-season','cycle-bike'])element(id).value='all';element('cycle-date').value='';element('cycle-direction').value='listed';
element('cycling-planner').listeners.reset();timers.splice(0).forEach(fn=>fn());
assert.equal(cards.filter(c=>!c.hidden).length,9);assert.equal(element('cycle-empty').hidden,true);assert.equal(element('cycle-error').hidden,true);
element('cycle-route').value='goat-creek';element('cycle-direction').value='reverse';let prevented=false;
element('cycling-planner').listeners.submit({preventDefault(){prevented=true;}});
assert.equal(prevented,true);assert.match(element('cycle-plan-direction').textContent,/towards Banff/);assert.equal(element('cycle-plan-title').focused,true);

const slugs=['banff-legacy-trail','banff-mountain-biking','spray-river-trail'];
assert.deepEqual(Object.keys(bodies).sort(),[...slugs].sort());
assert.deepEqual(Object.keys(metadata).sort(),[...slugs].sort());
const originalDates={'banff-legacy-trail':'2025-12-26','spray-river-trail':'2025-12-25','banff-mountain-biking':'2025-12-14'};
for (const slug of slugs) {
  const html=bodies[slug];
  assert.equal(Object.hasOwn(metadata[slug],'date'),false);
  assert.equal(allBlogPosts.find(p=>p.slug===slug).date,originalDates[slug]);
  assert.equal(metadata[slug].lastUpdated,'2026-10-29');
  assert.ok(html.replace(/<[^>]*>/g,' ').split(/\s+/).filter(Boolean).length>=850, `${slug}: substantive complete guide`);
  assert.match(html,/Sources and review/);assert.match(html,/October 29, 2026/);
  assert.match(html,/camref=1101l3MtWX/);assert.match(html,/partner_id=QW960HO/);
  assert.ok(!/I hiked|we rode|safest routes|all trails open|suitable for all abilities|Evan-Thomas bike park/.test(html));
  const anchors=[...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
  for(const match of anchors)assert.ok(!/<a\b/.test(match[2]),`${slug}: no nested anchors`);
  assert.equal((html.match(/<table\b/g)||[]).length,(html.match(/<\/table>/g)||[]).length);
}
assert.match(bodies['spray-river-trail'],/bikes on Spray River West in winter/);
assert.match(bodies['banff-legacy-trail'],/26\.8 km[\s\S]*2\.2 km/);
assert.match(bodies['banff-mountain-biking'],/July 10 to September 15 annually/);
console.log('Cycling checks passed: nine route/permission profiles; annual boundaries, direction, winter and e-bike regressions; actual client filters/empty/reset/errors; Astro compile; three full bodies, dates and affiliate IDs.');
