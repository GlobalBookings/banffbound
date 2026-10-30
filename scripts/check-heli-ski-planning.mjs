import assert from 'node:assert/strict';
import {access,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
import {build,transform as transformJS} from 'esbuild';
import {transform as transformAstro} from '@astrojs/compiler';
import {parseFragment} from 'parse5';

// Standalone real model/markup/controller check. Root owns article integration.
globalThis.fetch=()=>{throw Error('No network in the heli-ski check');};
const root=fileURLToPath(new URL('../',import.meta.url));
const rawPostSource=await readFile(path.join(root,'src/data/blogPosts.ts'),'utf8');
const rawPosts=rawPostSource.match(/const originalBlogPosts:\s*BlogPost\[\]\s*=\s*(\[[\s\S]*?\n\]);/)?.[1];assert.ok(rawPosts,'Original post array before metadata merges.');
const {outputFiles}=await build({stdin:{contents:"export * from './src/data/heliSkiPlanning.ts';export * from './src/data/heliSkiGuideOverrides.ts';export {winterGuideOverrides} from './src/data/winterGuideOverrides.ts';export {blogRedirects} from './src/data/redirects.mjs';\nexport const originalPosts="+rawPosts+';',resolveDir:root},bundle:true,write:false,platform:'node',format:'esm',logLevel:'silent'});
const d=await import('data:text/javascript;base64,'+Buffer.from(outputFiles[0].text).toString('base64'));
const {heliSkiOperators:operators,heliSkiFilterOptions:options,defaultHeliSkiFilters:defaults,heliSkiUrlKeys:urlKeys,normaliseHeliSkiFilters:normalise,readHeliSkiUrlSettings:readUrl,buildHeliSkiPlan:plan,buildHeliSkiShareUrl:share,heliSkiSources:sources,heliSkiPlannerHtml:html,heliSkiPlanningFaqHtml:faqHtml}=d;
const keys=['operator','base','transport','overnight','equipment'];
const ids=['purcell','rk'];
assert.equal(d.heliSkiReviewedAt,'2026-10-29');
assert.deepEqual(defaults,{operator:'all',base:'banff',transport:'undecided',overnight:'undecided',equipment:'undecided'});
assert.deepEqual(operators.map(operator=>operator.id),ids);
assert.deepEqual(operators.map(operator=>operator.address),['438 Lafontaine Road, Golden, BC','2045 Greywolf Drive, Panorama, BC']);
assert.deepEqual(operators.map(operator=>operator.href),['https://www.cmhheli.com/contact-us','https://rkheliski.com/request-availability/']);
for(const raw of [null,undefined,false,true,[],4,'rk'])assert.deepEqual(normalise(raw),defaults);
assert.deepEqual(normalise(Object.fromEntries(keys.map(key=>[key,[]]))),defaults);
assert.deepEqual(normalise({operator:'__proto__',base:'javascript:alert(1)',transport:'guaranteed',overnight:'<img>',equipment:'expert'}),defaults);
assert.deepEqual(readUrl(null),{filters:defaults,invalidKeys:[]});
assert.deepEqual(readUrl('?heli_operator=rk&heli_operator=purcell&heli_base=golden&heli_transport=enquire&email=PRIVATE').filters,{...defaults,base:'golden',transport:'enquire'});
assert.deepEqual(readUrl('?heli_operator=rk&heli_operator=purcell&heli_base=INVALID').invalidKeys,['operator','base']);
assert.equal(share(), 'https://banffbound.com/blog/banff-heli-skiing/#heli-ski-planner');
assert.equal(share({operator:'rk',base:'louise',email:'PRIVATE',gclid:'PRIVATE'}),'https://banffbound.com/blog/banff-heli-skiing/?heli_operator=rk&heli_base=louise#heli-ski-planner');
assert.deepEqual(plan().selectedIds,ids);assert.equal(plan().operatorPlans.length,2);assert.equal(plan().steps.length,3);
const originalOperators=JSON.stringify(operators);
let combinations=0;
for(const [operator]of options.operator)for(const [base]of options.base)for(const [transport]of options.transport)for(const [overnight]of options.overnight)for(const [equipment]of options.equipment){
  const filters={operator,base,transport,overnight,equipment},result=plan(filters),expected=operator==='all'?ids:[operator];
  assert.deepEqual(result.filters,filters);assert.deepEqual(result.selectedIds,expected,'Only the explicit operator control narrows the comparison.');
  assert.deepEqual(result.operatorPlans.map(plan=>plan.id),ids);assert.match(result.notes[0],/not ability, terrain, avalanche, availability or transport approval/);
  assert.match(result.brief,/not a reservation or a suitability assessment/);assert.equal(result.shareUrl,share(filters));
  const url=new URL(result.shareUrl);assert.equal(url.origin+url.pathname,'https://banffbound.com/blog/banff-heli-skiing/');assert.equal(url.hash,'#heli-ski-planner');
  for(const [key,value]of url.searchParams){assert.ok(Object.values(urlKeys).includes(key));assert.ok(Object.values(filters).includes(value));}
  for(const question of result.operatorPlans){assert.ok(question.journey.length>100&&question.transfer.length>100&&question.overnight.length>100&&question.equipment.length>100);if(transport==='confirmed')assert.match(question.transfer,/tool has not checked your confirmation/);if(equipment==='snowboard'&&question.id==='purcell')assert.match(question.equipment,/boards are limited.*request one ahead/);if(equipment==='ski')assert.match(question.equipment,/own ski boots/);}
  for(const forbidden of ['score','ability','approved','available','safe','arrivalTime','drivingMinutes','price'])assert.equal(result[forbidden],undefined);
  assert.ok(!/PRIVATE_(?:READER|CLICK)|\$\s*\d|\bCAD\s*\d|guaranteed pickup|you are eligible|you are approved|this route is safe/i.test(result.brief));
  combinations++;
}
assert.equal(combinations,648);assert.equal(JSON.stringify(operators),originalOperators);
for(const base of ['canmore','golden','panorama','other'])assert.match(plan({operator:'rk',base,transport:'enquire'}).operatorPlans[1].transfer,/does not establish pickup there/);
for(const base of ['banff','louise'])assert.match(plan({operator:'rk',base,transport:'enquire'}).operatorPlans[1].transfer,/minimum of 5 guests overall.*whether that minimum is met/);
assert.match(plan({transport:'confirmed'}).operatorPlans[0].transfer,/Purcell does not include transport/);
assert.match(operators[0].meals,/page conflicts on meals.*inclusions list lunch\/snacks.*lower lodging copy says meals are excluded/);
assert.match(operators[1].terms,/non-refundable guest-cancellation.*operator no-fly\/shortened-day.*transport charges are not refunded.*weather, mechanical or avalanche/);
assert.match(plan({base:'golden'}).operatorPlans[0].journey,/near this operator/);
assert.match(plan({base:'golden'}).operatorPlans[1].journey,/2045 Greywolf Drive/);
assert.match(plan({base:'panorama'}).operatorPlans[1].journey,/near this operator/);
assert.match(plan({base:'panorama'}).operatorPlans[0].journey,/438 Lafontaine Road/);

const descendants=node=>[node,...(node.childNodes??[]).flatMap(descendants)];
const attr=(node,key)=>node?.attrs?.find(item=>item.name===key)?.value;
const text=node=>node?.nodeName==='#text'?node.value:(node?.childNodes??[]).map(text).join('');
const normal=value=>String(value).replace(/\s+/g,' ').trim();
const parseErrors=[];const tree=parseFragment(html+faqHtml,{onParseError:error=>parseErrors.push(error.code)}),elements=descendants(tree);assert.deepEqual(parseErrors,[]);
const byId=id=>elements.find(node=>attr(node,'id')===id);
const cards=elements.filter(node=>attr(node,'data-heli-operator')!==undefined);assert.deepEqual(cards.map(card=>attr(card,'data-heli-operator')),ids);
assert.ok(cards.every(card=>attr(card,'hidden')===undefined),'Both full cards stay visible in no-JS HTML.');
const allIds=elements.map(node=>attr(node,'id')).filter(Boolean);assert.equal(new Set(allIds).size,allIds.length);
assert.equal(attr(byId('heli-ski-form'),'hidden'),'');assert.equal(attr(byId('heli-ski-copy-fallback'),'hidden'),'');assert.equal(attr(byId('heli-ski-copy-text'),'readonly'),'');
assert.equal(attr(byId('heli-ski-status'),'aria-live'),'polite');assert.equal(attr(byId('heli-ski-copy-status'),'role'),'status');
assert.equal(elements.filter(node=>node.tagName==='select').length,5);assert.equal(elements.filter(node=>node.tagName==='input').length,0,'No party, age, health, date or booking-reference input.');
for(const key of keys){const select=byId('heli-ski-'+key);assert.ok(select);assert.ok(elements.some(node=>node.tagName==='label'&&attr(node,'for')==='heli-ski-'+key));const optionNodes=descendants(select).filter(node=>node.tagName==='option');assert.deepEqual(optionNodes.map(node=>attr(node,'value')),options[key].map(([value])=>value));assert.equal(attr(optionNodes[0],'value'),defaults[key]);}
for(const [index,card]of cards.entries()){
  const operator=operators[index],body=normal(text(card));assert.ok(body.includes(operator.address)&&body.includes(operator.transport)&&body.includes(operator.equipment)&&body.includes(operator.meals)&&body.includes(operator.terms));
  for(const key of ['journey','transfer','overnight','equipment'])assert.ok(descendants(card).some(node=>attr(node,'data-heli-'+key)!==undefined));
  assert.ok(descendants(card).some(node=>node.tagName==='a'&&attr(node,'href')===operator.href));
}
for(const href of Object.values(sources))assert.ok(elements.some(node=>node.tagName==='a'&&attr(node,'href')===href),'Visible exact primary source/enquiry: '+href);
for(const anchor of elements.filter(node=>node.tagName==='a')){const href=attr(anchor,'href');assert.ok(href);assert.equal(descendants(anchor).filter(node=>node.tagName==='a').length,1);if(href.startsWith('https:')){assert.ok(Object.values(sources).includes(href));assert.equal(attr(anchor,'target'),'_blank');assert.ok(attr(anchor,'rel').includes('noopener'));assert.ok(!attr(anchor,'rel').includes('sponsored'));assert.equal(new URL(href).search,'');}else assert.ok(['/blog/banff-winter-driving/','/towns/golden/','/towns/kananaskis/'].includes(href));}
assert.match(normal(text(byId('heli-ski-cat-title'))),/Heli-skiing or cat-skiing/);assert.match(html,/2025\/26 booking and season information.*inconsistent year text.*2026\/27/);
assert.match(html,/not an automatic alternative for a cancelled flight/);
const visibleFaqs=elements.filter(node=>node.tagName==='details').map(node=>({question:normal(text(descendants(node).find(child=>child.tagName==='summary'))),answer:normal(text(descendants(node).find(child=>child.tagName==='p')))}));assert.deepEqual(visibleFaqs,d.heliSkiPlanningFaqs);
const scripts=elements.filter(node=>node.tagName==='script');assert.equal(scripts.length,1);assert.equal(attr(scripts[0],'type'),'application/ld+json');const schema=JSON.parse(text(scripts[0]));assert.equal(schema['@type'],'FAQPage');assert.equal(schema.mainEntity.length,5);assert.deepEqual(schema.mainEntity.map(faq=>({question:faq.name,answer:faq.acceptedAnswer.text})),visibleFaqs);
assert.equal((html.match(/application\/ld\+json/g)??[]).length,0,'FAQ markup is a separate export so root can replace, rather than duplicate, the old FAQ block.');
assert.ok(!/\$\s*\d|\bCAD\s*\d|camref=|partner_id=|<iframe|data-affiliate|ratingValue|AggregateRating/.test(html+faqHtml));
const componentPath=path.join(root,'src/components/HeliSkiPlanningInteractions.astro'),component=await readFile(componentPath,'utf8');
assert.ok(component.includes('.heli-ski-planner [hidden]{display:none!important}'));
assert.ok(!/innerHTML|insertAdjacentHTML|localStorage|sessionStorage|document\.cookie|\bfetch\s*\(|XMLHttpRequest|eval\s*\(|<iframe|\.href\s*=/.test(component));
for(const [filename,source]of [[componentPath,component],['heli-ski-planner-fragment.astro',html],['heli-ski-faq-fragment.astro',faqHtml]])assert.deepEqual((await transformAstro(source,{filename})).diagnostics.filter(diagnostic=>diagnostic.severity===1),[]);
const source=component.match(/<script>([\s\S]*?)<\/script>/)?.[1];assert.ok(source);
const actualClient=(await transformJS(source.replace(/^\s*import .*$/gm,''),{loader:'ts',target:'es2022'})).code;
function harness(href='https://banffbound.com/blog/banff-heli-skiing/?utm_source=google&gclid=PRIVATE_CLICK&email=PRIVATE_READER#keep',settings={}){
  const nodes=new Map(),events={},writes=[];
  const makeNode=(initial={})=>({hidden:false,value:'',textContent:'',dataset:{},children:[],listeners:{},...initial,addEventListener(type,callback){(this.listeners[type]??=[]).push(callback);},replaceChildren(...children){this.children=children;},focus(){this.focused=true;},select(){this.selected=true;}});
  for(const element of elements.filter(node=>attr(node,'id')))nodes.set('#'+attr(element,'id'),makeNode({hidden:attr(element,'hidden')!==undefined,textContent:normal(text(element))}));
  for(const key of keys)nodes.get('#heli-ski-'+key).value=defaults[key];
  const clientCards=cards.slice(0,settings.cardCount??2).map((card,index)=>{const fields={};for(const key of ['journey','transfer','overnight','equipment'])fields['[data-heli-'+key+']']=makeNode();return makeNode({dataset:{heliOperator:settings.duplicateCard&&index===1?'purcell':settings.unknownCard&&index===1?'unknown':attr(card,'data-heli-operator')},querySelector(selector){if(settings.missingCardField===selector)return null;assert.ok(fields[selector],'Known card field: '+selector);return fields[selector];},replaceChildren(){throw Error('Never reparent operator cards/links during a control update');}});});
  const location={href};
  const window={location,history:{replaceState(_state,_title,next){if(settings.blockHistory)throw Error('History denied');location.href=String(next);}}};
  const document={querySelector(selector){if(settings.missing===selector)return null;assert.ok(nodes.has(selector),'Known SSR selector: '+selector);return nodes.get(selector);},querySelectorAll(selector){assert.equal(selector,'[data-heli-operator]');return clientCards;},createElement(tagName){assert.ok(['p','li'].includes(tagName));return makeNode({tagName});},addEventListener(type,callback){(events[type]??=[]).push(callback);}};
  const navigator=settings.clipboard==='absent'?{}:{clipboard:{async writeText(value){if(settings.clipboard==='reject')throw Error('Clipboard denied');writes.push(value);}}};
  const blockedStorage=new Proxy({},{get(){throw Error('No planner storage');}});
  vm.runInNewContext(actualClient,{document,window,navigator,URL,Map,Set,Object,Array,buildHeliSkiPlan:plan,defaultHeliSkiFilters:defaults,heliSkiOperators:operators,heliSkiUrlKeys:urlKeys,readHeliSkiUrlSettings:readUrl,localStorage:blockedStorage,sessionStorage:blockedStorage,fetch(){throw Error('No provider fetch');},XMLHttpRequest(){throw Error('No provider request');}});
  const node=selector=>nodes.get(selector);
  return {node,cards:clientCards,location,writes,visible(){return clientCards.filter(card=>!card.hidden).map(card=>card.dataset.heliOperator);},fire(type){for(const callback of node('#heli-ski-form').listeners[type]??[])callback({preventDefault(){}});if(type==='reset')for(const key of keys)node('#heli-ski-'+key).value=defaults[key];},async copy(kind){for(const callback of node('#heli-ski-copy-'+kind).listeners.click??[])await callback({});},again(){for(const callback of events['astro:page-load']??[])callback();}};
}
const client=harness();assert.equal(client.node('#heli-ski-form').hidden,false);assert.deepEqual(client.visible(),ids);assert.equal(client.node('#heli-ski-steps').children.length,3);
let clientCombinations=0;
for(const [operator]of options.operator)for(const [base]of options.base)for(const [transport]of options.transport)for(const [overnight]of options.overnight)for(const [equipment]of options.equipment){
  for(const [key,value]of Object.entries({operator,base,transport,overnight,equipment}))client.node('#heli-ski-'+key).value=value;client.fire('change');
  const expected=operator==='all'?ids:[operator];assert.deepEqual(client.visible(),expected);
  assert.match(client.node('#heli-ski-status').textContent,new RegExp('^'+expected.length+' operator'));
  if(transport==='confirmed')for(const card of client.cards)assert.match(card.querySelector('[data-heli-transfer]').textContent,/tool has not checked your confirmation/);
  if(equipment==='snowboard')assert.match(client.cards[0].querySelector('[data-heli-equipment]').textContent,/boards are limited/);
  assert.equal(new URL(client.location.href).searchParams.get('utm_source'),'google');assert.equal(new URL(client.location.href).searchParams.get('email'),'PRIVATE_READER');assert.equal(new URL(client.location.href).hash,'#keep');
  clientCombinations++;
}
assert.equal(clientCombinations,648);
client.node('#heli-ski-operator').value='rk';client.node('#heli-ski-base').value='canmore';client.node('#heli-ski-transport').value='enquire';client.fire('submit');assert.deepEqual(client.visible(),['rk']);assert.match(client.cards[1].querySelector('[data-heli-transfer]').textContent,/does not establish pickup there/);
await client.copy('link');const copiedUrl=new URL(client.writes.at(-1));assert.equal(copiedUrl.origin+copiedUrl.pathname,'https://banffbound.com/blog/banff-heli-skiing/');assert.equal(copiedUrl.hash,'#heli-ski-planner');for(const key of copiedUrl.searchParams.keys())assert.ok(Object.values(urlKeys).includes(key));assert.ok(!client.writes.at(-1).includes('PRIVATE')&&!client.writes.at(-1).includes('utm_'));
await client.copy('brief');assert.match(client.writes.at(-1),/RK Heliski — 2045 Greywolf Drive/);assert.ok(!client.writes.at(-1).includes('CMH Purcell —'));assert.ok(!client.writes.at(-1).includes('PRIVATE'));
client.fire('reset');assert.deepEqual(client.visible(),ids);for(const key of keys){assert.equal(client.node('#heli-ski-'+key).value,defaults[key]);assert.equal(new URL(client.location.href).searchParams.has(urlKeys[key]),false);}assert.equal(new URL(client.location.href).hash,'#keep');
const restored=harness('https://banffbound.com/blog/banff-heli-skiing/?heli_operator=purcell&heli_base=golden&heli_transport=confirmed&heli_overnight=near-base&heli_equipment=snowboard');assert.deepEqual(restored.visible(),['purcell']);assert.match(restored.cards[0].querySelector('[data-heli-journey]').textContent,/near this operator/);assert.match(restored.cards[0].querySelector('[data-heli-transfer]').textContent,/does not include transport/);
for(const query of ['heli_operator=rk&heli_operator=purcell','heli_base=golden&heli_base=panorama','heli_transport=confirmed&heli_transport=self-drive','heli_overnight=same-day&heli_overnight=near-base','heli_equipment=ski&heli_equipment=snowboard','heli_operator=__proto__&heli_base=%3Cscript%3E&heli_transport=javascript%3Aalert(1)&heli_equipment=expert']){const invalid=harness('https://banffbound.com/blog/banff-heli-skiing/?'+query);assert.deepEqual(invalid.visible(),ids);assert.equal(invalid.node('#heli-ski-url-note').hidden,false);assert.ok(!invalid.node('#heli-ski-url-note').textContent.includes('<script>'));for(const key of keys)assert.equal(new URL(invalid.location.href).searchParams.has(urlKeys[key]),false);}
const partial=harness('https://banffbound.com/blog/banff-heli-skiing/?heli_operator=rk&heli_base=golden&heli_base=panorama&heli_equipment=snowboard');assert.deepEqual(partial.visible(),['rk']);assert.equal(partial.node('#heli-ski-base').value,'banff');assert.equal(partial.node('#heli-ski-equipment').value,'snowboard');partial.fire('reset');assert.equal(partial.node('#heli-ski-url-note').hidden,true);
for(const clipboard of ['absent','reject'])for(const kind of ['link','brief']){const fallback=harness(undefined,{clipboard});fallback.node('#heli-ski-operator').value='rk';await fallback.copy(kind);assert.equal(fallback.node('#heli-ski-copy-fallback').hidden,false);assert.equal(fallback.node('#heli-ski-copy-text').focused,true);assert.equal(fallback.node('#heli-ski-copy-text').selected,true);assert.ok(!fallback.node('#heli-ski-copy-text').value.includes('PRIVATE'));assert.equal(fallback.node('#heli-ski-copy-label').textContent,kind==='link'?'Public settings link':'Public enquiry outline');fallback.fire('reset');assert.equal(fallback.node('#heli-ski-copy-fallback').hidden,true);}
const blocked=harness(undefined,{blockHistory:true});blocked.node('#heli-ski-operator').value='rk';blocked.node('#heli-ski-base').value='louise';blocked.fire('change');await blocked.copy('link');assert.deepEqual(blocked.visible(),['rk']);assert.equal(new URL(blocked.writes[0]).searchParams.get('heli_base'),'louise');assert.ok(blocked.location.href.includes('PRIVATE_READER'));blocked.fire('reset');assert.deepEqual(blocked.visible(),ids);
client.again();client.again();for(const type of ['change','submit','reset'])assert.equal(client.node('#heli-ski-form').listeners[type].length,1);for(const kind of ['link','brief'])assert.equal(client.node('#heli-ski-copy-'+kind).listeners.click.length,1);
for(const missing of ['#heli-ski-form',...keys.map(key=>'#heli-ski-'+key),'#heli-ski-status','#heli-ski-notes','#heli-ski-steps','#heli-ski-url-note','#heli-ski-copy-link','#heli-ski-copy-brief','#heli-ski-copy-status','#heli-ski-copy-fallback','#heli-ski-copy-label','#heli-ski-copy-text']){const incomplete=harness(undefined,{missing});assert.equal(incomplete.node('#heli-ski-form').hidden,true);assert.deepEqual(incomplete.visible(),ids);}
for(const settings of [{cardCount:1},{duplicateCard:true},{unknownCard:true},{missingCardField:'[data-heli-transfer]'}]){const incomplete=harness(undefined,settings);assert.equal(incomplete.node('#heli-ski-form').hidden,true);assert.ok(incomplete.cards.every(card=>!card.hidden));}
const note=await readFile(path.join(root,'research/heli-ski-planning-sources-2026-10-29.md'),'utf8');for(const href of Object.values(sources))assert.ok(note.includes(href),'Source note: '+href);for(const marker of ['648','5 guests','meals','2025/26','2026/27','not registered','FAQ'])assert.ok(note.includes(marker));
const guideSlug='banff-heli-skiing';
assert.deepEqual(Object.keys(d.heliSkiGuideOverrides),[guideSlug]);assert.deepEqual(Object.keys(d.heliSkiGuideMetadata),[guideSlug]);
assert.equal(d.originalPosts.find(post=>post.slug===guideSlug)?.date,'2025-11-06','Preserve the original raw publication before metadata merges.');assert.equal(d.blogRedirects[guideSlug],undefined);
const guide=d.heliSkiGuideOverrides[guideSlug],metadata=d.heliSkiGuideMetadata[guideSlug];
const goldenHtmlHref='https://www.expedia.ca/Hotel-Search?destination=Golden%2C+British+Columbia&amp;camref=1101l3MtWX';
assert.equal(d.winterGuideOverrides[guideSlug].match(/href="(https:\/\/www\.expedia\.ca\/Hotel-Search\?destination=Golden[^"]+)"/)?.[1],goldenHtmlHref,'Keep the original exact destination-search href.');
function validateGuide(body,meta){
  assert.deepEqual(Object.keys(meta).sort(),['title','description','lastUpdated','readTime','imageIsIllustrative','imageNote'].sort());assert.equal(meta.lastUpdated,d.heliSkiReviewedAt);assert.equal(meta.imageIsIllustrative,true);assert.match(meta.imageNote,/Illustrative.*not a verified image/);assert.match(meta.title,/Operators, Transfers & Trip Planner/);
  assert.equal(body.indexOf(html),body.lastIndexOf(html));assert.ok(body.includes(html),'Actual planner markup appears once in the full body.');assert.equal(body.indexOf(faqHtml),body.lastIndexOf(faqHtml));assert.ok(body.includes(faqHtml),'Actual planning FAQ appears once and replaces the old details.');
  const errors=[],all=descendants(parseFragment(body,{onParseError:error=>errors.push(error.code)}));assert.deepEqual(errors,[]);
  const bodyIds=all.map(node=>attr(node,'id')).filter(Boolean);assert.equal(bodyIds.length,new Set(bodyIds).size);
  for(const id of ['operators','ability','cost','day','cancellation','heli-ski-planner','heli-ski-faq-title'])assert.ok(bodyIds.includes(id),'Retain existing and new guide fragments: '+id);
  assert.equal(all.filter(node=>attr(node,'data-heli-operator')!==undefined).length,2);assert.equal(all.filter(node=>node.tagName==='form').length,1);assert.equal(all.filter(node=>node.tagName==='select').length,5);
  const details=all.filter(node=>node.tagName==='details');assert.equal(details.length,5,'Only the new model FAQ block, without old duplicated FAQ details.');
  const schemaNodes=all.filter(node=>node.tagName==='script');assert.equal(schemaNodes.length,1);assert.equal(attr(schemaNodes[0],'type'),'application/ld+json');
  const faq=JSON.parse(text(schemaNodes[0]));assert.equal(faq['@type'],'FAQPage');assert.deepEqual(faq.mainEntity.map(item=>({question:item.name,answer:item.acceptedAnswer.text})),d.heliSkiPlanningFaqs);
  let affiliateCount=0;
  for(const anchor of all.filter(node=>node.tagName==='a')){const href=attr(anchor,'href');assert.ok(href);assert.equal(descendants(anchor).filter(node=>node.tagName==='a').length,1);if(href.startsWith('#'))assert.ok(bodyIds.includes(href.slice(1)));else if(href.startsWith('https:')){if(href.startsWith('https://www.expedia.ca/')){affiliateCount++;assert.equal(href,goldenHtmlHref.replace('&amp;','&'));assert.equal(new URL(href).searchParams.get('camref'),'1101l3MtWX');assert.ok(attr(anchor,'rel').includes('sponsored'));}else{assert.ok(Object.values(sources).includes(href));assert.ok(!attr(anchor,'rel').includes('sponsored'));}assert.equal(attr(anchor,'target'),'_blank');assert.ok(attr(anchor,'rel').includes('noopener'));}else assert.ok(href.startsWith('/'),'Native link only.');}
  assert.equal(affiliateCount,1);assert.ok(body.includes(`href="${goldenHtmlHref}"`));
  const words=normal(text(parseFragment(body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'')))).split(' ').length;assert.ok(words>=1700&&words<2900,'Concise full guide with complete planner: '+words);
  const publicText=normal(body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replace(/<[^>]*>/g,' '));
  for(const marker of ['Full guide reviewed October 29, 2026','Golden and Panorama in British Columbia','actual ability','run allowance','Food:','confirmation','accommodation search, not a heli-ski package']){
    const expected=marker==='Food:'?'Food':marker;assert.ok(publicText.includes(expected),'Full guide decision: '+expected);
  }
  assert.ok(!/\$\s*\d|\bCAD\s*\d|unlimited runs|shuttle is guaranteed|transport is included with CMH|CMH Purcell includes all meals|easy terrain for everyone|we skied|I visited|free cancellation|guaranteed powder/i.test(publicText));
  assert.ok(!/<iframe|AggregateRating|ratingValue|"@type":"(?:Product|Offer)"/.test(body));
  return {all,words};
}
const guideResult=validateGuide(guide,metadata);
for(const anchor of guideResult.all.filter(node=>node.tagName==='a'&&attr(node,'href')?.startsWith('/'))){const href=attr(anchor,'href'),route=new URL(href,'https://banffbound.com').pathname.replace(/\/$/,'');if(route.startsWith('/blog/')){assert.ok(d.originalPosts.some(post=>post.slug===route.slice(6)));assert.equal(d.blogRedirects[route.slice(6)],undefined);}else if(route.startsWith('/towns/'))await access(path.join(root,'src/pages/towns/[slug].astro'));else{let exists=false;for(const filename of [path.join(root,'src/pages',route+'.astro'),path.join(root,'src/pages',route,'index.astro')])try{await access(filename);exists=true;}catch{}assert.ok(exists,'Existing guide journey: '+href);}}
assert.deepEqual((await transformAstro(guide,{filename:'heli-ski-full-guide.astro'})).diagnostics.filter(item=>item.severity===1),[]);
for(const mutation of [guide+faqHtml,guide.replace(goldenHtmlHref,goldenHtmlHref.replace('1101l3MtWX','WRONG')),guide+'<p>CMH Purcell includes all meals.</p>',guide+'<p>The shuttle is guaranteed.</p>'])assert.throws(()=>validateGuide(mutation,metadata));
assert.throws(()=>validateGuide(guide,{...metadata,date:'2026-10-29'}));assert.throws(()=>validateGuide(guide,{...metadata,imageIsIllustrative:false}));
const digest=value=>createHash('sha256').update(value).digest('hex');
const hashes={originalPublication:'2025-11-06',legacyBodySha256:digest(d.winterGuideOverrides[guideSlug]),bodySha256:digest(guide),metadataJsonSha256:digest(JSON.stringify(metadata)),moduleSha256:digest(await readFile(path.join(root,'src/data/heliSkiGuideOverrides.ts')))};
console.log(`Heli-ski planning checks passed: ${combinations} model + ${clientCombinations} actual-client combinations, two complete SSR operator cards, full ${guideResult.words}-word canonical body with preserved raw publication and exact Golden affiliate href, one matching five-entry FAQ block, source/transport/equipment distinctions, public-only sharing/copy fallbacks and progressive DOM/URL/reset guards. No shared article integration, network or site build.`);
console.log(JSON.stringify(hashes));
