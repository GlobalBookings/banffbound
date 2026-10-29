import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { build } from 'esbuild';
import { transform } from '@astrojs/compiler';
import vm from 'node:vm';
import path from 'node:path';
const bundled=await build({stdin:{contents:"export * from './src/data/wildlifeZones.ts';export * from './src/data/wildlifeFieldGuide.ts';export * from './src/data/trails.ts';export * from './src/data/towns.ts';",resolveDir:process.cwd()},bundle:true,write:false,platform:'browser',format:'esm'});
const data=await import('data:text/javascript;base64,'+Buffer.from(bundled.outputFiles[0].text).toString('base64'));
assert.equal(data.wildlifeZones.length,10);assert.equal(new Set(data.wildlifeZones.map(z=>z.id)).size,10);assert.equal(data.wildlifeSpecies.length,9);
assert.equal(data.filterWildlifeAreas({season:'winter'}).length,9);
assert.equal(data.filterWildlifeAreas({season:'summer',visit:'town'}).length,3);
for(const key of ['__proto__','constructor','toString','<script>','unknown'])assert.equal(data.filterWildlifeAreas({species:key,habitat:key,visit:key,season:key},data.wildlifeSpeciesHabitats).length,10);
let cases=0;
for(const species of ['all',...data.wildlifeSpecies.map(s=>s.id)])for(const season of ['all','spring','summer','fall','winter'])for(const habitat of ['all',...Object.keys(data.wildlifeHabitatLabels)])for(const visit of ['all',...Object.keys(data.wildlifeVisitLabels)]){
 const result=data.filterWildlifeAreas({species,season,habitat,visit},data.wildlifeSpeciesHabitats);
 for(const z of result){if(season!=='all')assert.ok(z.seasons.includes(season));if(habitat!=='all')assert.ok(z.habitat.includes(habitat));if(visit!=='all')assert.equal(z.visit,visit);if(species!=='all')assert.ok(z.habitat.some(h=>data.wildlifeSpeciesHabitats[species].includes(h)));}cases++;
}
for(const z of data.wildlifeZones){assert.ok(!('frequency'in z||'radius'in z||'observations'in z));assert.equal(z.reference.length,2);assert.ok(z.reference.every(n=>Number.isInteger(n*100)||Math.abs(n*100-Math.round(n*100))<1e-8));assert.ok(z.description&&z.access&&z.winter&&z.activity);assert.equal(new URL(z.source).protocol,'https:');}
const photos=JSON.parse(await readFile('src/data/wildlifePhotos.json','utf8'));assert.equal(photos.length,7);
for(const p of photos){assert.ok(p.src.startsWith('/images/wildlife/field-guide/'));const bytes=await readFile('public'+p.src);assert.equal(createHash('sha256').update(bytes).digest('hex'),p.sha256);assert.equal(p.license,'CC BY 4.0');assert.equal(p.observationDataLicense,'cc-by');assert.equal(p.gpsMetadata,false);assert.ok(Number(p.observationYear)<=2024);for(const key of Object.keys(p))assert.ok(!/latitude|longitude|coordinate|observed_on|place_guess/.test(key));}
const pages={};for(const name of ['wildlife','wildlife-tracker']){const s=await readFile('src/pages/'+name+'.astro','utf8');pages[name]=s;const c=await transform(s,{filename:name+'.astro'});assert.deepEqual(c.diagnostics.filter(d=>d.severity===1),[]);assert.ok(s.includes('Faqs.map')&&s.includes('f.question')&&s.includes('f.answer'));assert.ok(s.includes('lastUpdated='));assert.ok(!/innerHTML|images.unsplash.com|almost guaranteed|98%|freq-badge/.test(s));}
for(const z of data.wildlifeZones){const target='src/pages'+z.guide.href;try{await access(target+'.astro');}catch{if(z.guide.href.startsWith('/trails/')){assert.ok(data.trails.some(t=>t.slug===z.guide.href.split('/').at(-1)));continue;}if(z.guide.href.startsWith('/towns/')){assert.ok(data.towns.some(t=>t.slug===z.guide.href.split('/').at(-1)));continue;}await access(target+'/index.astro');}}
const clientSource=pages['wildlife-tracker'].match(/<script>([\s\S]*?)<\/script>/)[1];
const client=(await build({stdin:{contents:clientSource,loader:'ts',resolveDir:path.resolve('src/pages')},bundle:true,write:false,platform:'browser',format:'iife'})).outputFiles[0].text;
class Element{constructor(value='all',dataset={}){this.value=value;this.dataset=dataset;this.hidden=false;this.disabled=false;this.textContent='';this.events={};this.children=[];}addEventListener(type,handler){this.events[type]=handler;}fire(type){return this.events[type]?.({preventDefault(){}});}append(...nodes){this.children.push(...nodes);}remove(){this.removed=true;}scrollIntoView(){}focus(){}}
function harness(){
 const names=['wildlife-filters','species-filter','habitat-filter','season-filter','visit-filter','area-count','wildlife-empty','species-context','wildlife-map','map-feedback','load-wildlife-map'];const ids=Object.fromEntries(names.map(id=>[id,new Element()]));const cards=data.wildlifeZones.map(z=>new Element('',{zoneId:z.id}));const locate=data.wildlifeZones.map(z=>new Element('',{locate:z.id}));const appended=[];const timers=new Map();let next=0;
 const document={querySelector:s=>ids[s.slice(1)]||null,querySelectorAll:s=>s==='[data-zone-id]'?cards:s==='[data-locate]'?locate:[],createElement:()=>new Element(),head:{appendChild:e=>appended.push(e)}};
 const window={};vm.runInNewContext(client,{document,window,Set,Promise,Error,setTimeout:(fn,ms)=>{if(ms===0){fn();return 0;}timers.set(++next,fn);return next;},clearTimeout:id=>timers.delete(id)});
 const state={markers:[],bounds:null,removed:0};const layer={clearLayers(){state.markers=[];},addTo(){return this;}};
 const map={setView(){return this;},fitBounds(b){state.bounds=b;},invalidateSize(){},remove(){state.removed++;}};
 const L={map(){return map;},tileLayer(){return{addTo(){return this;},on(){return this;}};},layerGroup(){return layer;},latLngBounds:b=>b,circleMarker(ref){return{addTo(){state.markers.push(ref);return this;},bindPopup(){return this;}};}};
 return{ids,cards,locate,appended,timers,window,L,state,visible:()=>cards.filter(c=>!c.hidden),change(id,v){ids[id].value=v;ids['wildlife-filters'].fire('change');},script:()=>appended.findLast(e=>e.src?.includes('leaflet.js'))};
}
const h=harness();assert.equal(h.appended.length,0,'No third-party map load before the visitor asks.');assert.equal(h.ids['wildlife-filters'].hidden,false);h.change('season-filter','winter');assert.equal(h.visible().length,9);h.change('habitat-filter','alpine');h.change('visit-filter','town');assert.equal(h.visible().length,0);assert.equal(h.ids['wildlife-empty'].hidden,false);for(const id of ['season-filter','habitat-filter','visit-filter'])h.ids[id].value='all';h.ids['wildlife-filters'].fire('reset');assert.equal(h.visible().length,10);
const failed=h.ids['load-wildlife-map'].fire('click');h.script().onerror();await failed;assert.match(h.ids['map-feedback'].textContent,/could not load/);assert.equal(h.ids['load-wildlife-map'].disabled,false);assert.equal(h.ids['wildlife-map'].hidden,true);
const retry=h.ids['load-wildlife-map'].fire('click');h.window.L=h.L;h.script().onload();await retry;assert.equal(h.state.markers.length,10);h.change('species-filter','mountain-goat');assert.equal(h.state.markers.length,h.visible().length);assert.equal(h.state.markers.length,3);h.change('visit-filter','town');assert.equal(h.state.markers.length,0);assert.equal(h.visible().length,0);
const timeout=harness();const pending=timeout.ids['load-wildlife-map'].fire('click');for(const fn of [...timeout.timers.values()])fn();await pending;assert.match(timeout.ids['map-feedback'].textContent,/could not load/);assert.equal(timeout.ids['load-wildlife-map'].disabled,false);
const partial=harness();partial.window.L={...partial.L,tileLayer(){throw Error('background initialization failure');}};await partial.ids['load-wildlife-map'].fire('click');assert.equal(partial.state.removed,1);partial.window.L=partial.L;await partial.ids['load-wildlife-map'].fire('click');assert.equal(partial.state.markers.length,10);
console.log(`Wildlife planning checks passed: ${cases} filter combinations, seven licensed asset hashes, two Astro transforms, actual-client SSR/filter/map agreement, failure/timeout/retry/partial-init recovery.`);
