import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { transform } from '@astrojs/compiler';
import { experimental_AstroContainer } from 'astro/container';
import { parseFragment } from 'parse5';

globalThis.fetch = () => { throw new Error('No network in the dining planner check'); };
const { outputFiles } = await build({ stdin: { contents: "export * from './src/data/diningPlanning.ts';export {buildDiningDirectory} from './src/data/restaurantSourceReviews.ts';export {banffDiningSourceReviews} from './src/data/banffDiningSourceReviews.ts';", resolveDir: process.cwd() }, bundle: true, write: false, platform: 'node', format: 'esm' });
const data = await import('data:text/javascript;base64,' + Buffer.from(outputFiles[0].text).toString('base64'));
const {diningPlanningRecords: records,diningFilterOptions: options,defaultDiningFilters: defaults,normaliseDiningFilters: normalize,buildDiningPlan: plan,readDiningFiltersFromUrl: readUrl,updateDiningSettingsUrl: updateUrl}=data;
const actual=data.buildDiningDirectory(data.banffDiningSourceReviews).venues;
assert.equal(records.length,32);assert.equal(new Set(records.map(r=>r.slug)).size,32);
assert.deepEqual(records.map(({slug,area,kind})=>({slug,area,kind})),actual.map(({slug,area,kind})=>({slug,area,kind})), 'Public index exactly matches actual combined source projection, in raw order.');
assert.equal(data.diningPlanningReviewedAt,'2026-10-29');
assert.deepEqual(defaults,{area:'all',format:'all'});
assert.equal(options.area.find(([value])=>value==='parkway')[1],'Parkway & Castle Junction');
assert.deepEqual(options.format.map(([value])=>value),['all','cafe','meal','pub']);
for(const slug of ['pd3-by-blake','trailhead-cafe','lake-louise-station'])assert.deepEqual(records.find(record=>record.slug===slug).formats,[],'No active format inferred for pending/closure '+slug);
for(const record of records){assert.ok(Object.keys(record).every(key=>['slug','area','kind','areaKey','formats'].includes(key)));if(record.formats.length)assert.equal(actual.find(venue=>venue.slug===record.slug).sourceReview.status,'selected-facts');}
const expectedFormats={
  cafe:new Set(['wild-flour-bakery','whitebark-cafe','bill-peytos-cafe','baker-creek-bistro']),
  meal:new Set(['the-bison-restaurant','park-distillery','grizzly-house','block-kitchen-bar','juniper-bistro','eddie-burger-bar','tooloulous','banff-ave-brewing-co','nourish-bistro','magpie-and-stump','coyotes-southwestern-grill','bear-street-tavern','fairview-dining-room','walliser-stube','the-alpine-social','bill-peytos-cafe','the-iron-goat','tavern-1883','crazyweed-kitchen','the-drake-canmore','blake-brewpub','storm-mountain-lodge','high-rollers-bowling-pizza','the-rose-and-crown','three-bears-brewery','elk-and-oarsman']),
  pub:new Set(['park-distillery','block-kitchen-bar','eddie-burger-bar','banff-ave-brewing-co','magpie-and-stump','bear-street-tavern','the-alpine-social','fairview-dining-room','the-iron-goat','tavern-1883','the-drake-canmore','blake-brewpub','high-rollers-bowling-pizza','the-rose-and-crown','three-bears-brewery','elk-and-oarsman']),
};
const areaNames={banff:'Banff','lake-louise':'Lake Louise',canmore:'Canmore',parkway:'Highway 1A'};
const expected=(area,format)=>actual.filter(record=>(area==='all'||record.area===areaNames[area])&&(format==='all'||expectedFormats[format].has(record.slug))).map(record=>record.slug);
let combinations=0;
for(const [area]of options.area)for(const [format]of options.format){
  const result=plan({area,format}),ids=expected(area,format);assert.deepEqual(result.visibleIds,ids);assert.equal(result.shownCount,ids.length);assert.equal(result.totalCount,32);assert.equal(result.empty,ids.length===0);assert.equal(result.summary,`${ids.length} of 32 listed venues shown`);combinations++;
}
assert.equal(combinations,20);assert.equal(plan({area:'canmore',format:'cafe'}).empty,true);
assert.ok(plan().visibleIds.includes('lake-louise-station')&&plan().visibleIds.includes('pd3-by-blake')&&plan().visibleIds.includes('trailhead-cafe'),'All preserves every status/discovery entry.');
for(const value of [null,undefined,[],false,true,5,'banff'])assert.deepEqual(normalize(value),defaults);
assert.deepEqual(normalize({area:['banff'],format:'vegan',price:'free',access:'suitable',availability:'open'}),defaults);
assert.deepEqual(readUrl('https://banffbound.com/eat-and-drink?dining_area=canmore&dining_format=cafe'),{area:'canmore',format:'cafe'});
assert.deepEqual(readUrl('https://banffbound.com/eat-and-drink?dining_area=banff&dining_area=canmore&dining_format=cafe'),{area:'all',format:'cafe'});
assert.deepEqual(readUrl('https://banffbound.com/eat-and-drink?dining_area=all&dining_format=meal&dining_format=pub'),defaults);
assert.deepEqual(readUrl('https://banffbound.com/eat-and-drink?dining_area=%3Csvg%3E&dining_format=javascript%3Aalert(1)'),defaults);
assert.deepEqual(readUrl('not a URL'),defaults);
const settings=new URL(updateUrl('https://banffbound.com/eat-and-drink?keep=1&dining_area=evil&dining_area=banff&dining_format=meal#restaurants',{area:'parkway',format:'cafe',merchant:'https://evil.invalid'}));
assert.equal(settings.pathname,'/eat-and-drink');assert.equal(settings.hash,'#restaurants');assert.equal(settings.searchParams.get('keep'),'1');assert.deepEqual(settings.searchParams.getAll('dining_area'),['parkway']);assert.deepEqual(settings.searchParams.getAll('dining_format'),['cafe']);assert.equal(settings.searchParams.has('merchant'),false);
const resetUrl=new URL(updateUrl(settings.href,defaults));assert.equal(resetUrl.searchParams.has('dining_area'),false);assert.equal(resetUrl.searchParams.has('dining_format'),false);assert.equal(resetUrl.searchParams.get('keep'),'1');
assert.equal(updateUrl('javascript:alert(1)',defaults),null);assert.equal(updateUrl('invalid',defaults),null);

const component=await readFile('src/components/DiningPlanningInteractions.astro','utf8');
const compiled=await transform(component,{filename:'src/components/DiningPlanningInteractions.astro'});assert.ok(compiled.code);
const script=component.match(/<script>([\s\S]*?)<\/script>/)?.[1];assert.ok(script);
const client=await build({stdin:{contents:script,resolveDir:path.join(process.cwd(),'src/components'),sourcefile:'DiningPlanningInteractions.ts',loader:'ts'},bundle:true,write:false,platform:'browser',format:'iife',metafile:true});
const code=client.outputFiles[0].text;
assert.ok(Object.keys(client.metafile.inputs).every(file=>!/(restaurants|restaurantSourceReviews|banffDiningSourceReviews)\.ts$/.test(file)),'Browser artifact must not bundle raw legacy operational/photo/GPS claims.');
assert.ok(!/localStorage|sessionStorage|navigator\.clipboard|fetch\(|document\.cookie|\.innerHTML|\.href\s*=|setAttribute\(['"]href/.test(script),'No storage, network, clipboard, HTML or native booking-link construction.');

// Render the actual root-owned page/frontmatter. Only outer layout/components
// and style loading use slot fixtures; its32 cards/options/actions are real SSR.
const pageFilename=path.resolve('src/pages/eat-and-drink.astro'),pageSource=await readFile(pageFilename,'utf8');
const pageCompiled=await transform(pageSource,{filename:pageFilename,internalURL:'astro/compiler-runtime',resultScopedSlot:true});
assert.deepEqual(pageCompiled.diagnostics.filter(item=>item.severity===1),[]);
// This page has no Astro-global initializer after metadata. Remove only the
// compiler's one-line unused metadata declaration, not template/frontmatter.
assert.equal(pageCompiled.code.split('\n').filter(line=>/^export const \$\$metadata = /.test(line)).length,1);
const renderCode=pageCompiled.code.replace(/,\s*createMetadata as \$\$createMetadata/,'').replace(/^export const \$\$metadata = [^\n]*\n/m,'');
const require=createRequire(import.meta.url);
const ssrBundle=await build({stdin:{contents:renderCode,loader:'ts',resolveDir:path.dirname(pageFilename)},bundle:true,write:false,platform:'node',format:'esm',plugins:[{name:'dining-page-fixtures',setup(builder){
  builder.onResolve({filter:/^astro\//},args=>({path:pathToFileURL(require.resolve(args.path)).href,external:true}));
  builder.onResolve({filter:/\?astro&type=style/},args=>({path:args.path,namespace:'dining-style'}));builder.onLoad({filter:/.*/,namespace:'dining-style'},()=>({contents:'export {};'}));
  builder.onResolve({filter:/\.astro$/},args=>({path:args.path,namespace:'dining-component'}));builder.onLoad({filter:/.*/,namespace:'dining-component'},()=>({contents:"import {createComponent,render,renderSlot} from 'astro/runtime/server/index.js';export default createComponent((result,props,slots)=>render`${renderSlot(result,slots.default)}`);"}));
}}]});
let Component;
try{Component=(await import('data:text/javascript;base64,'+Buffer.from(ssrBundle.outputFiles[0].text).toString('base64'))).default;}catch(error){throw new Error('Dining SSR fixture import: '+error.message);}
const container=await experimental_AstroContainer.create();
let html;
try{html=await container.renderToString(Component,{request:new Request('https://banffbound.com/eat-and-drink?dining_area=canmore&private=DO_NOT_FORWARD&camref=ATTACKER')});}catch(error){throw new Error('Dining SSR fixture render: '+error.message);}
const nodes=root=>[root,...(root.childNodes??[]).flatMap(nodes)];const attr=(node,key)=>node.attrs?.find(item=>item.name===key)?.value;
const text=node=>node.nodeName==='#text'?node.value:(node.childNodes??[]).map(text).join('');const content=node=>text(node).replace(/\s+/g,' ').trim();
const tree=parseFragment(html),all=nodes(tree),hasAttr=(node,key)=>attr(node,key)!==undefined;
const ssrCards=all.filter(node=>hasAttr(node,'data-dining-slug')),ssrGroups=all.filter(node=>hasAttr(node,'data-dining-group'));
assert.equal(ssrCards.length,32);assert.equal(ssrGroups.length,4);assert.ok([...ssrCards,...ssrGroups].every(node=>!hasAttr(node,'hidden')),'Complete SSR list visible without JS.');
const ssrCardSlugs=ssrCards.map(node=>attr(node,'data-dining-slug'));assert.deepEqual(new Set(ssrCardSlugs),new Set(records.map(record=>record.slug)));
const ssrGroupSlugs=ssrGroups.map(group=>nodes(group).filter(node=>hasAttr(node,'data-dining-slug')).map(node=>attr(node,'data-dining-slug')));
const formNode=all.find(node=>attr(node,'id')==='dining-form'),emptyNode=all.find(node=>attr(node,'id')==='dining-empty'),statusNode=all.find(node=>attr(node,'id')==='dining-status');
assert.ok(formNode&&hasAttr(formNode,'hidden'));assert.ok(emptyNode&&hasAttr(emptyNode,'hidden'));assert.equal(attr(statusNode,'role'),'status');assert.equal(attr(statusNode,'aria-live'),'polite');
assert.ok(all.some(node=>node.tagName==='noscript'));assert.ok(nodes(formNode).some(node=>node.tagName==='button'&&attr(node,'type')==='reset'));
for(const key of ['area','format']){const select=all.find(node=>attr(node,'id')==='dining-'+key);assert.equal(select.tagName,'select');assert.equal(attr(select,'name'),'dining_'+key);assert.deepEqual(nodes(select).filter(node=>node.tagName==='option').map(node=>[attr(node,'value'),content(node)]),options[key].map(tuple=>[...tuple]));assert.ok(all.some(node=>node.tagName==='label'&&attr(node,'for')==='dining-'+key));}
for(const card of ssrCards){const venue=actual.find(venue=>venue.slug===attr(card,'data-dining-slug')),hrefs=nodes(card).filter(node=>node.tagName==='a').map(node=>attr(node,'href'));for(const url of [venue.website,venue.menuUrl,venue.reserveUrl,...venue.enquiryLinks.map(link=>link.url)].filter(Boolean))assert.ok(hrefs.includes(url),'Actual native card route retained: '+venue.slug+':'+url);assert.ok(content(card).includes(venue.sourceReview.label));assert.equal(nodes(card).filter(node=>node.tagName==='img').length,0);}
const stationCard=ssrCards.find(node=>attr(node,'data-dining-slug')==='lake-louise-station');assert.ok(nodes(stationCard).some(node=>node.tagName==='aside'&&/renovation|closure/i.test(content(node))));
assert.ok(!nodes(stationCard).filter(node=>node.tagName==='a').some(node=>/^(?:Current menu|Booking details|Reserve)/.test(content(node))));
assert.ok(!/DO_NOT_FORWARD|ATTACKER|images\.unsplash\.com|810 Main St|703 Main St|817 Main St/.test(html));
const schemas=all.filter(node=>node.tagName==='script'&&attr(node,'type')==='application/ld+json').map(node=>JSON.parse(text(node)));
assert.equal(schemas.filter(schema=>schema['@type']==='ItemList').length,1);assert.equal(schemas.find(schema=>schema['@type']==='ItemList').numberOfItems,32);
assert.ok(!schemas.some(schema=>['Restaurant','Offer','AggregateRating'].includes(schema['@type'])));
const faqSection=all.find(node=>attr(node,'aria-labelledby')==='dining-faq-title'),visibleFaqs=nodes(faqSection).filter(node=>node.tagName==='details'),faqSchema=schemas.find(schema=>schema['@type']==='FAQPage');
assert.equal(visibleFaqs.length,5);assert.equal(faqSchema.mainEntity.length,5);
for(const [index,faq]of visibleFaqs.entries()){assert.equal(content(faq.childNodes.find(node=>node.tagName==='summary')),faqSchema.mainEntity[index].name);assert.equal(content(faq.childNodes.find(node=>node.tagName==='p')),faqSchema.mainEntity[index].acceptedAnswer.text);}
assert.ok(pageSource.includes('<DiningPlanningInteractions />'));

// Execute the actual compiled controller. Minimal DOM preserves node identity,
// tracks focus/events, and deliberately lacks any reparent/rebuild API.
function fixture({href='https://banffbound.com/eat-and-drink',missing=null,duplicate=false,historyFails=false,statusFailure=false}={}){
  let doc;class Element{
    constructor(id=''){this.id=id;this.dataset={};this.hidden=false;this.value='all';this.defaultValue='all';this.listeners=new Map();this.children=[];this._text='';}
    get textContent(){return this._text;}set textContent(value){if(this.failTextOnce){this.failTextOnce=false;throw Error('Status node failed');}this._text=String(value);}
    addEventListener(type,fn){const list=this.listeners.get(type)||[];list.push(fn);this.listeners.set(type,list);}
    removeEventListener(type,fn){this.listeners.set(type,(this.listeners.get(type)||[]).filter(item=>item!==fn));}
    focus(){doc.activeElement=this;}
    querySelectorAll(selector){return selector==='[data-dining-slug]'?this.children:[];}
    dispatch(type,extra={}){const event={type,defaultPrevented:false,preventDefault(){this.defaultPrevented=true;},...extra};for(const fn of [...(this.listeners.get(type)||[])])fn(event);return event;}
  }
  const form=new Element('dining-form');form.hidden=true;
  const area=new Element('dining-area'),format=new Element('dining-format'),status=new Element('dining-status'),empty=new Element('dining-empty'),resetButton=new Element('reset');empty.hidden=true;status._text='32 entries documented';
  const cards=ssrCardSlugs.map(slug=>{const card=new Element(slug);card.dataset.diningSlug=slug;const source=actual.find(item=>item.slug===slug);card.nativeLinks=Object.freeze([source.website,source.menuUrl,source.reserveUrl]);return card;});
  if(duplicate)cards.at(-1).dataset.diningSlug=cards[0].dataset.diningSlug;
  const groups=ssrGroupSlugs.map((slugs,index)=>{const group=new Element('group-'+index);group.children=cards.filter(card=>slugs.includes(card.id));return group;});
  const nodes=new Map([form,area,format,status,empty].map(node=>['#'+node.id,node]));if(missing)nodes.delete('#'+missing);
  doc={activeElement:null,listeners:new Map(),querySelector:selector=>nodes.get(selector)||null,querySelectorAll:selector=>selector==='[data-dining-slug]'?cards:selector==='[data-dining-group]'?groups:[],addEventListener(type,fn){this.listeners.set(type,[...(this.listeners.get(type)||[]),fn]);}};
  const historyCalls=[],window={location:{href},history:{replaceState(_state,_title,value){if(historyFails)throw Error('History unavailable');window.location.href=String(value);historyCalls.push(String(value));}}};
  if(statusFailure)status.failTextOnce=true;
  const nativeBefore=JSON.stringify(cards.map(card=>card.nativeLinks)),originalNodes=[...cards];
  vm.runInNewContext(code,{document:doc,window,URL,Set,Map,Array,console,fetch:()=>{throw Error('Unexpected network');}});
  return{doc,form,area,format,status,empty,cards,groups,window,historyCalls,nativeBefore,originalNodes,resetButton};
}
const f=fixture();assert.equal(f.form.hidden,false);assert.equal(f.form.dataset.ready,'true');assert.ok(f.cards.every(card=>!card.hidden));assert.equal(f.status.textContent,'32 of 32 listed venues shown');
for(const [area]of options.area)for(const [format]of options.format){
  f.area.focus();f.area.value=area;f.format.value=format;f.form.dispatch('change',{key:'ArrowDown',target:f.area});
  assert.equal(f.doc.activeElement,f.area,'Keyboard select changes retain focus.');assert.equal(f.form.hidden,false);
  const allowed=new Set(expected(area,format)),ids=ssrCardSlugs.filter(slug=>allowed.has(slug));assert.deepEqual(f.cards.filter(card=>!card.hidden).map(card=>card.dataset.diningSlug),ids);
  assert.equal(f.empty.hidden,ids.length!==0);assert.equal(f.status.textContent,`${ids.length} of 32 listed venues shown`);
  for(const group of f.groups)assert.equal(group.hidden,group.children.every(card=>card.hidden));
  assert.deepEqual(f.cards,f.originalNodes,'Nodes/order remain intact.');assert.equal(JSON.stringify(f.cards.map(card=>card.nativeLinks)),f.nativeBefore,'Native SSR routes stay unchanged.');
}
f.area.value='canmore';f.format.value='cafe';f.form.dispatch('change');assert.equal(f.empty.hidden,false);
f.resetButton.focus();const resetEvent=f.form.dispatch('reset');assert.equal(resetEvent.defaultPrevented,true);assert.equal(f.doc.activeElement,f.resetButton);assert.equal(f.area.value,'all');assert.equal(f.format.value,'all');assert.ok(f.cards.every(card=>!card.hidden));assert.equal(f.empty.hidden,true);
assert.equal(new URL(f.window.location.href).searchParams.has('dining_area'),false);assert.equal(new URL(f.window.location.href).searchParams.has('dining_format'),false);
assert.equal(f.form.dispatch('submit').defaultPrevented,true);
for(const fn of f.doc.listeners.get('astro:page-load')||[])fn();assert.equal(f.form.listeners.get('change').length,1,'Idempotent page load.');
const restored=fixture({href:'https://banffbound.com/eat-and-drink?dining_area=parkway&dining_format=cafe&keep=yes'});assert.deepEqual(restored.cards.filter(card=>!card.hidden).map(card=>card.id),['baker-creek-bistro']);assert.equal(new URL(restored.window.location.href).searchParams.get('keep'),'yes');
const duplicates=fixture({href:'https://banffbound.com/eat-and-drink?dining_area=banff&dining_area=canmore&dining_format=cafe'});assert.equal(duplicates.area.value,'all');assert.equal(duplicates.format.value,'cafe');assert.equal(duplicates.cards.filter(card=>!card.hidden).length,4);
const deniedHistory=fixture({historyFails:true});deniedHistory.area.value='canmore';deniedHistory.form.dispatch('change');assert.equal(deniedHistory.form.hidden,false);assert.equal(deniedHistory.cards.filter(card=>!card.hidden).length,6);
for(const bad of [fixture({missing:'dining-format'}),fixture({duplicate:true}),fixture({statusFailure:true})]){assert.equal(bad.form.hidden,true);assert.ok(bad.cards.every(card=>!card.hidden));assert.ok(bad.groups.every(group=>!group.hidden));assert.equal(bad.empty.hidden,true);assert.equal(bad.form.dataset.ready,undefined);}
f.status.failTextOnce=true;f.area.value='canmore';f.format.value='cafe';f.form.dispatch('change');assert.equal(f.form.hidden,true);assert.ok(f.cards.every(card=>!card.hidden));assert.ok(f.groups.every(group=>!group.hidden));assert.equal(f.form.listeners.get('change').length,0,'Failure cleanup removes installed listeners.');
console.log(`Dining planning checks passed:actual page SSR32 visible cards/4groups, hidden controls/empty, exact option tuples/native reset, native routes and FAQ/schema parity;32 source-projection/index identities,${combinations} area/format combinations; actual compiled client on that SSR card/group contract, keyboard-focus/reset/URL/count/empty/failure cleanup, preserved hrefs and client artifact without raw restaurant data. No network or site build.`);
