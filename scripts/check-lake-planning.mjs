import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { transform } from '@astrojs/compiler';
import vm from 'node:vm';
import path from 'node:path';

const dataBuild=await build({stdin:{contents:"export * from './src/data/lakePlanning.ts';",resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'esm'});
const data=await import('data:text/javascript;base64,'+Buffer.from(dataBuild.outputFiles[0].text).toString('base64'));
assert.equal(data.lakePlans.length,10);
assert.equal(new Set(data.lakePlans.map(lake=>lake.id)).size,10);
assert.equal(data.lakeFaqs.length,9);
assert.deepEqual(data.normalizeLakeFilters({area:'__proto__',interest:'constructor',season:'next-year'}),{area:'all',interest:'all',season:'all'});
assert.equal(data.filterLakePlans({season:'winter',interest:'rental'}).length,0,'A winter land visit must not become a canoe-rental recommendation.');
assert.deepEqual(data.filterLakePlans({season:'winter',interest:'shore'}).map(lake=>lake.id),['lake-louise'],'Only the reviewed designated winter shoreline description is included.');
assert.equal(data.filterLakePlans({season:'summer',interest:'rental'}).length,3);
assert.ok(!data.filterLakePlans({season:'winter'}).some(lake=>lake.id==='moraine-lake'),'A winter road description must not become a lake visit.');
for(const lake of data.lakePlans) {
  assert.ok(data.lakeWaterRules[lake.rule]);
  assert.ok(lake.source.startsWith('https://'));
  assert.ok(!('lat' in lake||'lng' in lake||'frozen' in lake||'temperature' in lake),'No invented location or measured-condition fields.');
}
const pages={};
for(const name of ['lakes','lake-faq']) {
  const source=await readFile('src/pages/'+name+'.astro','utf8');pages[name]=source;
  const compiled=await transform(source,{filename:'src/pages/'+name+'.astro'});
  assert.ok(!compiled.diagnostics.some(item=>item.severity===1),name+' must compile.');
}
assert.ok(!pages.lakes.includes('GeoCoordinates')&&!pages.lakes.includes('isAccessibleForFree'),'A collection must not manufacture shared coordinates or free access.');
assert.ok(pages['lake-faq'].includes('mainEntity:lakeFaqs.map')&&pages['lake-faq'].includes('lakeFaqs.map(faq=>'),'Visible FAQ and schema share their actual data.');

class Element {
  constructor(value='all',dataset={}){this.value=value;this.dataset=dataset;this.hidden=false;this.textContent='';this.events={};}
  addEventListener(type,handler){this.events[type]=handler;}
  fire(type){this.events[type]?.({preventDefault(){}});}
  scrollIntoView(){}
}
async function clientFor(name) {
  const source=pages[name].match(/<script>([\s\S]*?)<\/script>/)[1];
  const result=await build({stdin:{contents:source,loader:'ts',resolveDir:path.resolve('src/pages')},bundle:true,write:false,platform:'browser',format:'iife'});
  return result.outputFiles[0].text;
}
const lakeClient=await clientFor('lakes');
function lakeHarness(query='') {
  const ids=Object.fromEntries(['lake-filters','lake-area','lake-interest','lake-season','lake-count','lake-empty','lake-plans'].map(id=>[id,new Element()]));
  const cards=data.lakePlans.map(lake=>new Element('',{lake:lake.id}));
  const reset=[new Element(),new Element()];
  const presets=[new Element('',{area:'banff',interest:'view',season:'all'}),new Element('',{area:'all',interest:'rental',season:'summer'}),new Element('',{area:'all',interest:'view',season:'winter'})];
  ids['lake-filters'].reset=()=>['lake-area','lake-interest','lake-season'].forEach(id=>{ids[id].value='all';});
  vm.runInNewContext(lakeClient,{document:{querySelector:selector=>ids[selector.slice(1)],getElementById:id=>ids[id],querySelectorAll:selector=>({'[data-lake]':cards,'[data-lake-reset]':reset,'[data-preset]':presets}[selector])},location:{search:query},URLSearchParams,Set});
  return {ids,cards,reset,presets,visible:()=>cards.filter(card=>!card.hidden),choose(id,value){ids[id].value=value;ids[id].fire('change');}};
}
const lakes=lakeHarness();
assert.equal(lakes.visible().length,10);
lakes.choose('lake-season','winter');assert.equal(lakes.visible().length,9);
lakes.choose('lake-interest','rental');assert.equal(lakes.visible().length,0);assert.equal(lakes.ids['lake-empty'].hidden,false);
lakes.reset[0].fire('click');assert.equal(lakes.visible().length,10);assert.equal(lakes.ids['lake-empty'].hidden,true);
lakes.presets[1].fire('click');assert.equal(lakes.visible().length,3);
lakes.presets[0].fire('click');assert.equal(lakes.visible().length,4);
lakes.presets[2].fire('click');assert.equal(lakes.visible().length,9);
assert.equal(lakeHarness('?area=invalid&season=closed&interest=temperature').visible().length,10);
assert.equal(lakeHarness('?area=louise&season=summer&interest=rental').visible().length,2);

const faqClient=await clientFor('lake-faq');
const ids=Object.fromEntries(['faq-filters','lake-question-search','lake-question-topic','faq-count','faq-empty','faq-reset'].map(id=>[id,new Element(id==='lake-question-search'?'':'all')]));
const items=data.lakeFaqs.map(faq=>new Element('',{topic:faq.topic,questionSearch:(faq.question+' '+faq.answer).toLowerCase()}));
ids['faq-filters'].reset=()=>{ids['lake-question-search'].value='';ids['lake-question-topic'].value='all';};
vm.runInNewContext(faqClient,{document:{querySelector:selector=>ids[selector.slice(1)],querySelectorAll:()=>items}});
const visible=()=>items.filter(item=>!item.hidden);
assert.equal(visible().length,9);
ids['lake-question-search'].value='  PEYTO  ';ids['lake-question-search'].fire('input');assert.equal(visible().length,1);
ids['lake-question-topic'].value='water';ids['lake-question-topic'].fire('change');assert.equal(visible().length,0);assert.equal(ids['faq-empty'].hidden,false);
ids['faq-reset'].fire('click');assert.equal(visible().length,9);assert.equal(ids['faq-empty'].hidden,true);
ids['lake-question-topic'].value='ice';ids['lake-question-topic'].fire('change');assert.equal(visible().length,2);
console.log('Lake checks passed: 10 plans, 9 FAQs, joint seasonal rules, invalid filters, actual-client presets/empty/reset/search and both Astro transforms.');
