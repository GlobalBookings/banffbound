import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';
import { build, transform as transformJS } from 'esbuild';
import { transform as transformAstro } from '@astrojs/compiler';
import { experimental_AstroContainer } from 'astro/container';
import { parseFragment } from 'parse5';

// Independent route expectations and the actual browser script. No HTTP/site build.
globalThis.fetch = () => { throw Error('Network is forbidden in the Parkway check'); };
const root = fileURLToPath(new URL('../', import.meta.url));
const { outputFiles } = await build({ stdin: { contents: "export * from './src/data/parkwayPlanning.ts';export {trails} from './src/data/trails.ts';export {allBlogPosts} from './src/data/blogPosts.ts';export {towns} from './src/data/towns.ts';", resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent' });
const data = await import('data:text/javascript;base64,' + Buffer.from(outputFiles[0].text).toString('base64'));
const { parkwayStops: stops, parkwayFilterOptions: options, defaultParkwayFilters: defaults, normaliseParkwayFilters: normalise, buildParkwayPlan: plan, parkwaySources: sources } = data;
const ids = ['lake-louise','herbert-lake','hector-viewpoint','crowfoot','bow-lake','peyto','mistaya','crossing','parker-ridge','icefield-centre','tangle-falls','sunwapta','athabasca-falls','jasper'];
const distances = [0,6,19,36,39,43,74,80,121,130,137,179,203,233];
const endpoints = new Set(['lake-louise','jasper']);
const optionalIds = ids.filter(id => !endpoints.has(id));
const winterExcluded = ['herbert-lake','mistaya','crossing','parker-ridge','icefield-centre'];
const independentVisible = {
  'winter/scenic': ['lake-louise','hector-viewpoint','crowfoot','bow-lake','tangle-falls','jasper'],
  'winter/walks': ['lake-louise','peyto','sunwapta','athabasca-falls','jasper'],
  'winter/all': ['lake-louise','hector-viewpoint','crowfoot','bow-lake','peyto','tangle-falls','sunwapta','athabasca-falls','jasper'],
  'summer/scenic': ['lake-louise','herbert-lake','hector-viewpoint','crowfoot','bow-lake','tangle-falls','jasper'],
  'summer/walks': ['lake-louise','peyto','mistaya','parker-ridge','sunwapta','athabasca-falls','jasper'],
  'summer/all': ids,
};
assert.equal(data.parkwayReviewedAt, '2026-10-29');
assert.deepEqual(defaults, { direction: 'north', season: 'winter', interest: 'scenic' });
assert.deepEqual(stops.map(stop => stop.id), ids);
assert.deepEqual(stops.map(stop => stop.fromLouiseKm), distances);
assert.deepEqual(stops.map(stop => stop.fromJasperKm), [233,227,214,197,194,190,159,153,112,103,96,54,30,0]);
assert.equal(stops.length, 14); assert.equal(new Set(ids).size, 14);
assert.match(sources.map, /Summer-on-the-Icefields-Parkway-Guide-2022\.pdf$/);
assert.equal(sources.road, 'https://511.alberta.ca/');
for (const stop of stops) {
  assert.equal(stop.source, sources.map, 'One explicitly labelled community-reference map source.');
  assert.equal(stop.fromLouiseKm + stop.fromJasperKm, 233);
  assert.equal(stop.winterCandidate, !winterExcluded.includes(stop.id));
  for (const field of ['name','idea','summer','winter','href','linkLabel']) assert.ok(typeof stop[field] === 'string' && stop[field].length > 5, stop.id + ': useful field ' + field);
  for (const forbidden of ['time','stopMin','duration','durationMinutes','eta','feasible','open','status','available','parkingAvailable','safe']) assert.equal(stop[forbidden], undefined, 'No inferred feasibility/status in the model: ' + forbidden);
  if (stop.href.startsWith('/trails/')) assert.ok(data.trails.some(trail => trail.slug === stop.href.split('/')[2] && trail.routeVerified !== false), 'Existing reviewed route: ' + stop.href);
  else if (stop.href.startsWith('/blog/')) assert.ok(data.allBlogPosts.some(post => post.slug === stop.href.split('/')[2]), 'Existing canonical guide: ' + stop.href);
  else if (stop.href.startsWith('/towns/')) assert.ok(data.towns.some(town => town.slug === stop.href.split('/')[2]), 'Existing town: ' + stop.href);
  else assert.ok(Object.values(sources).includes(stop.href), 'Known native official/operator source: ' + stop.href);
}
assert.match(stops.find(stop => stop.id === 'hector-viewpoint').idea, /separate from a hike/);
assert.match(stops.find(stop => stop.id === 'bow-lake').winter, /Stay off natural lake ice/);
assert.match(stops.find(stop => stop.id === 'peyto').winter, /different approach/);
assert.match(stops.find(stop => stop.id === 'crossing').winter, /all services are closed for winter.*April 2027.*no confirmed date/);
assert.match(stops.find(stop => stop.id === 'parker-ridge').winter, /summer trail rating does not assess avalanche terrain/);
assert.match(stops.find(stop => stop.id === 'icefield-centre').summer, /does not authorise walking onto it or crossing barriers/);
for (const raw of [undefined,null,[],false,true,5,'south']) assert.deepEqual(normalise(raw), defaults);
assert.deepEqual(normalise({ direction: ['south'], season: {}, interest: true }), defaults);
assert.deepEqual(normalise({ direction: 'javascript:alert(1)', season: 'open', interest: '<img>' }), defaults);
assert.deepEqual(normalise({ direction: 'south', season: 'summer', interest: 'walks', href: 'https://evil.invalid/' }), { direction: 'south', season: 'summer', interest: 'walks' });
assert.deepEqual(plan().selectedIds, [], 'The planner does not choose stops for the visitor.');
assert.deepEqual(plan().candidateIds, ['hector-viewpoint','crowfoot','bow-lake','tangle-falls']);
assert.match(plan().brief, /No optional stops selected/);
for (const chosen of [null,undefined,{},'bow-lake',true,7]) assert.deepEqual(plan({}, chosen).selectedIds, []);
assert.deepEqual(plan({}, ['lake-louise','jasper','peyto','crossing','hector-viewpoint','hector-viewpoint',null,{},'__proto__','javascript:alert(1)']).selectedIds, ['hector-viewpoint','peyto'],'Season-allowed selections survive a visit-type filter; endpoints/unknowns and winter-excluded examples do not.');
const originalStops = JSON.stringify(stops);
let combinations = 0;
for (const [direction] of options.direction) for (const [season] of options.season) for (const [interest] of options.interest) {
  const filters = { direction, season, interest };
  const visible = independentVisible[season + '/' + interest];
  const expected = direction === 'north' ? visible : [...visible].reverse();
  const seasonalOptional = independentVisible[season+'/all'].filter(id=>!endpoints.has(id));
  const expectedSelected = direction==='north'?seasonalOptional:[...seasonalOptional].reverse();
  const result = plan(filters, [...ids].reverse().concat(['__proto__','unknown',...ids]));
  assert.deepEqual(result.filters, filters);
  assert.deepEqual(result.visibleIds, expected, `Independent visible set: ${direction}/${season}/${interest}`);
  assert.deepEqual(result.orderedIds, direction === 'north' ? ids : [...ids].reverse());
  assert.deepEqual(result.candidateIds, expected.filter(id => !endpoints.has(id)));
  assert.deepEqual(result.selectedIds, expectedSelected, 'Selections are season-allowed, unique and route-ordered; visit-type filtering preserves a mixed shortlist.');
  assert.equal(result.origin, direction === 'north' ? 'Lake Louise village' : 'Jasper town');
  assert.equal(result.direction, direction === 'north' ? 'Lake Louise → Jasper' : 'Jasper → Lake Louise');
  assert.equal(result.checklist.length, 3);
  assert.match(result.notes.join(' '), /do not calculate travel time or establish a usable stopping place/);
  if (season === 'winter') { assert.ok(winterExcluded.every(id => !result.visibleIds.includes(id))); assert.match(result.notes.join(' '), /no en-route fuel/); }
  if (season === 'winter' && interest !== 'scenic') assert.match(result.notes.join(' '), /avalanche exposure/);
  assert.match(result.brief, /not navigation or an arrival-time estimate/);
  const selectedBriefLines = result.brief.split('\n').filter(line => line.startsWith('- '));
  assert.equal(selectedBriefLines.length, result.selectedIds.length);
  result.selectedIds.forEach((id, i) => {
    const stop = stops.find(stop => stop.id === id), km = direction === 'north' ? stop.fromLouiseKm : stop.fromJasperKm;
    assert.ok(selectedBriefLines[i].startsWith(`- ${stop.name}: about ${km} km; `));
    assert.ok(selectedBriefLines[i].endsWith(stop[season]));
  });
  assert.ok(!/ETA|arrival at \d|\b\d+(?:\.\d+)? (?:minutes?|hours?)\b|journey is safe|road is open/i.test(result.brief));
  combinations++;
}
assert.equal(combinations, 12); assert.equal(JSON.stringify(stops), originalStops, 'Direction changes must not mutate source order.');
assert.deepEqual(plan({ season:'winter',interest:'all' }, plan({ season:'summer',interest:'all' },optionalIds).selectedIds).selectedIds, ['hector-viewpoint','crowfoot','bow-lake','peyto','tangle-falls','sunwapta','athabasca-falls']);
assert.deepEqual(plan({interest:'walks'},['bow-lake']).selectedIds,['bow-lake']);
assert.deepEqual(plan({interest:'all'},plan({interest:'walks'},['bow-lake']).selectedIds).selectedIds,['bow-lake']);

const componentPath = path.join(root,'src/components/ParkwayPlannerInteractions.astro');
const pagePath = path.join(root,'src/pages/icefields-parkway-planner.astro');
const component = await readFile(componentPath,'utf8'), page = await readFile(pagePath,'utf8');
assert.equal((page.match(/<ParkwayPlannerInteractions\s*\/>/g) || []).length, 1);
assert.match(page, /import ParkwayPlannerInteractions from ['"]\.\.\/components\/ParkwayPlannerInteractions\.astro['"]/);
assert.match(page, /\.parkway-planner \[hidden\]\{display:none!important\}/);
assert.ok(!/innerHTML|insertAdjacentHTML|localStorage|sessionStorage|document\.cookie|\bfetch\s*\(|XMLHttpRequest|eval\s*\(|<iframe/.test(component));
assert.ok(!/total-time|stopMin|updateTotal|\btime:\s*\d|driving times, suggested durations|Winter tires are legally required October/i.test(page));
for (const [filename, source] of [[componentPath,component],[pagePath,page]]) assert.deepEqual((await transformAstro(source,{filename})).diagnostics.filter(item=>item.severity===1), []);

// Render the actual rebuilt page and its actual planner component/frontmatter.
// Only unrelated outer layout, breadcrumbs and rental CTA are slot-only fixtures.
// No site build, output directory, server or live source fetch is involved.
const require = createRequire(import.meta.url);
const renderBundle = await build({ entryPoints:[pagePath], bundle:true, write:false, platform:'node', format:'esm', logLevel:'silent', plugins:[{name:'parkway-page-render',setup(builder){
  builder.onResolve({filter:/^astro\//},args=>({path:pathToFileURL(require.resolve(args.path)).href,external:true}));
  builder.onResolve({filter:/\?astro&type=style/},args=>({path:args.path,namespace:'fixture-style'}));
  builder.onLoad({filter:/.*/,namespace:'fixture-style'},()=>({contents:'export {};'}));
  builder.onResolve({filter:/\.astro$/},args=>{
    if (['BaseLayout.astro','Breadcrumbs.astro','CarRentalCTA.astro'].includes(path.basename(args.path))) return {path:args.path,namespace:'fixture-component'};
    return {path:path.isAbsolute(args.path)?args.path:path.resolve(args.resolveDir,args.path),namespace:'actual-astro'};
  });
  builder.onLoad({filter:/.*/,namespace:'fixture-component'},()=>({contents:"import {createComponent,render,renderSlot} from 'astro/runtime/server/index.js';export default createComponent((result,props,slots)=>render`${renderSlot(result,slots.default)}`);"}));
  builder.onLoad({filter:/.*/,namespace:'actual-astro'},async args=>{
    const source=await readFile(args.path,'utf8');
    const compiled=await transformAstro(source,{filename:args.path,internalURL:'astro/compiler-runtime',resultScopedSlot:true});
    assert.deepEqual(compiled.diagnostics.filter(item=>item.severity===1),[]);
    // Installed compiler/runtime pair: discard unused legacy compiler metadata,
    // preserving all actual frontmatter/template expressions and imports.
    const code=compiled.code.replace(/,\s*createMetadata as \$\$createMetadata/,'').replace(/\$\$createMetadata\(/g,'(() => ({}))(');
    return {contents:code,loader:'ts',resolveDir:path.dirname(args.path)};
  });
}}]});
const {default:Page}=await import('data:text/javascript;base64,'+Buffer.from(renderBundle.outputFiles[0].text).toString('base64'));
const container=await experimental_AstroContainer.create();
const html=await container.renderToString(Page,{request:new Request('https://banffbound.com/icefields-parkway-planner/?parkway_season=summer&email=PRIVATE_READER_VALUE&gclid=PRIVATE_CLICK_VALUE')});
const tree=parseFragment(html);
const descendants=node=>[node,...(node.childNodes??[]).flatMap(descendants)];
const elements=descendants(tree);
const attr=(node,name)=>node?.attrs?.find(a=>a.name===name)?.value;
const text=node=>node?.nodeName==='#text'?node.value:(node?.childNodes??[]).map(text).join('');
const normal=value=>String(value).replace(/\s+/g,' ').trim();
const bySsrId=id=>elements.find(node=>attr(node,'id')===id);
const hasClass=(node,name)=>(attr(node,'class')??'').split(/\s+/).includes(name);
const ssrCards=elements.filter(node=>attr(node,'data-parkway-id')!==undefined);
assert.deepEqual(ssrCards.map(card=>attr(card,'data-parkway-id')),ids);
assert.ok(ssrCards.every(card=>attr(card,'hidden')===undefined),'All 14 complete cards are visible without JS.');
assert.equal(attr(bySsrId('parkway-form'),'hidden'),'');
assert.equal(attr(bySsrId('parkway-copy'),'hidden'),'');
assert.equal(attr(bySsrId('parkway-copy-fallback'),'hidden'),'');
assert.equal(attr(bySsrId('parkway-brief'),'readonly'),'');
assert.equal(attr(bySsrId('parkway-status'),'role'),'status');
assert.equal(attr(bySsrId('parkway-status'),'aria-live'),'polite');
assert.equal(attr(bySsrId('parkway-copy-status'),'aria-live'),'polite');
assert.match(text(bySsrId('parkway-status')), /14 places documented.*no optional stops selected/);
assert.match(text(bySsrId('parkway-origin')), /Lake Louise village/);
assert.equal(elements.filter(node=>attr(node,'data-parkway-choice')!==undefined).length,12);
for(const label of elements.filter(node=>attr(node,'data-parkway-choice')!==undefined)) assert.equal(attr(label,'hidden'),'');
for(const [i,card] of ssrCards.entries()){
  const stop=stops[i],children=descendants(card);
  assert.equal(normal(text(children.find(node=>attr(node,'data-parkway-distance')!==undefined))),`About ${distances[i]} km from Lake Louise village`);
  assert.equal(normal(text(children.find(node=>attr(node,'data-parkway-season-note')!==undefined))),normal(stop.winter));
  assert.ok(normal(text(card)).includes(normal(stop.idea)) && normal(text(card)).includes(normal(stop.summer)),'Useful full no-JS seasonal content: '+stop.id);
  const link=children.find(node=>node.tagName==='a');assert.equal(attr(link,'href'),stop.href);
  if(stop.href.startsWith('https:')) {assert.equal(attr(link,'target'),'_blank');assert.ok(attr(link,'rel').split(/\s+/).includes('noopener'));}
  const input=children.find(node=>attr(node,'data-parkway-select')!==undefined);
  if(endpoints.has(stop.id)) assert.equal(input,undefined,'Endpoints have no optional selection control.');
  else {assert.equal(attr(input,'type'),'checkbox');assert.equal(attr(input,'value'),stop.id);assert.equal(attr(input,'checked'),undefined);assert.ok(children.some(label=>label.tagName==='label'&&descendants(label).includes(input)),'Every choice is labelled.');}
}
for(const key of ['direction','season','interest']){
  const select=bySsrId('parkway-'+key);assert.ok(select);
  assert.ok(elements.some(node=>node.tagName==='label'&&attr(node,'for')==='parkway-'+key));
  const optionNodes=descendants(select).filter(node=>node.tagName==='option');
  assert.deepEqual(optionNodes.map(node=>attr(node,'value')),options[key].map(([value])=>value));
  assert.equal(attr(optionNodes[0],'value'),defaults[key],'Native reset defaults match model/client.');
}
const checklist=descendants(bySsrId('parkway-checklist')).filter(node=>node.tagName==='li').map(node=>normal(text(node)));
assert.deepEqual(checklist,plan().checklist);
const faqNodes=elements.filter(node=>node.tagName==='details'&&hasClass(node,'faq-item'));
const visibleFaqs=faqNodes.map(node=>({question:normal(text(descendants(node).find(child=>child.tagName==='summary'))),answer:normal(text(descendants(node).find(child=>child.tagName==='p')))}));
assert.equal(visibleFaqs.length,6);
assert.deepEqual(visibleFaqs,data.parkwayFaqs.map(faq=>({question:normal(faq.question),answer:normal(faq.answer)})));
const schemaDocs=elements.filter(node=>node.tagName==='script'&&attr(node,'type')==='application/ld+json').map(node=>JSON.parse(text(node)));
const faqSchemas=schemaDocs.filter(schema=>schema['@type']==='FAQPage');assert.equal(faqSchemas.length,1);
assert.deepEqual(faqSchemas[0].mainEntity.map(faq=>({question:normal(faq.name),answer:normal(faq.acceptedAnswer.text)})),visibleFaqs);
assert.ok(elements.some(node=>node.tagName==='time'&&attr(node,'datetime')===data.parkwayReviewedAt));
assert.ok(elements.some(node=>node.tagName==='img'&&/Illustrative.*not verified/.test(attr(node,'alt')??'')));
for(const href of Object.values(sources)) assert.ok(elements.some(node=>node.tagName==='a'&&attr(node,'href')===href),'Visible source link: '+href);
for(const href of ['/conditions/','/blog/icefields-parkway-guide/','/blog/banff-to-jasper-drive/','/blog/banff-winter-driving/','/book/lake-louise-stays/','/blog/jasper-town/','/blog/jasper-national-park/']) assert.ok(elements.some(node=>node.tagName==='a'&&attr(node,'href')===href),'Useful native journey: '+href);
assert.ok(!html.includes('PRIVATE_READER_VALUE')&&!html.includes('PRIVATE_CLICK_VALUE'),'Server rendering does not copy raw reader context into content.');
assert.ok(normal(text(elements.find(node=>hasClass(node,'filter-note')))).includes('Changing visit type keeps your shortlist'));
assert.ok(!/total-time|hours with stops|best before 9|fills by 10|must.do|Winter tires are legally required October/i.test(html));

const script=component.match(/<script>([\s\S]*?)<\/script>/)?.[1];assert.ok(script);
const actualClient=(await transformJS(script.replace(/^\s*import .*$/gm,''),{loader:'ts',target:'es2022'})).code;
function harness(href='https://banffbound.com/icefields-parkway-planner/?utm_source=google&gclid=keep&msclkid=keep-too#parkway-planner',settings={}){
  const nodes=new Map(),events={},writes=[];
  const makeNode=(value={})=>({hidden:false,dataset:{},value:'',checked:false,textContent:'',children:[],listeners:{},replaceCalls:0,...value,
    addEventListener(type,callback){(this.listeners[type]??=[]).push(callback);},replaceChildren(...children){this.replaceCalls++;this.children=children;},focus(){this.focused=true;},select(){this.selected=true;}});
  for(const element of elements.filter(node=>attr(node,'id'))){const id=attr(element,'id');nodes.set('#'+id,makeNode({hidden:attr(element,'hidden')!==undefined,textContent:normal(text(element))}));}
  for(const key of ['direction','season','interest']) nodes.get('#parkway-'+key).value=defaults[key];
  const inputs=new Map(),choices=[];
  const cards=ssrCards.slice(0,settings.cardCount??14).map((element,index)=>{
    const id=settings.duplicateCard&&index===1?ids[0]:settings.unknownCard&&index===1?'unknown-card':attr(element,'data-parkway-id');
    const distance=makeNode(),seasonNote=makeNode();
    const input=endpoints.has(ids[index])?null:makeNode({value:ids[index]});
    if(input){inputs.set(ids[index],input);choices.push(makeNode({hidden:true}));}
    return makeNode({dataset:{parkwayId:id},querySelector(selector){if(selector==='[data-parkway-distance]')return distance;if(selector==='[data-parkway-season-note]')return seasonNote;if(selector==='[data-parkway-select]')return input;throw Error('Unexpected card selector: '+selector);}});
  });
  nodes.get('#parkway-stops').children=cards;
  const location={href};
  const window={location,history:{replaceState(_state,_title,next){if(settings.blockHistory)throw Error('History denied');location.href=String(next);}}};
  const document={querySelector(selector){if(settings.missing===selector)return null;assert.ok(nodes.has(selector),'Known real-page selector: '+selector);return nodes.get(selector);},querySelectorAll(selector){if(selector==='[data-parkway-id]')return cards;if(selector==='[data-parkway-choice]')return choices;throw Error('Unexpected document selector: '+selector);},createElement(tagName){assert.ok(['p','li'].includes(tagName),'No scripts/frames/provider nodes are created');return makeNode({tagName});},addEventListener(type,callback){(events[type]??=[]).push(callback);}};
  Object.defineProperty(document,'cookie',{get(){throw Error('No cookie access');}});
  const navigator=settings.clipboard==='absent'?{}:{clipboard:{async writeText(value){if(settings.clipboard==='reject')throw Error('Clipboard denied');writes.push(value);}}};
  const blockedStorage=new Proxy({},{get(){throw Error('No planner storage access');}});
  vm.runInNewContext(actualClient,{document,window,navigator,URL,Array,Map,Set,Object,buildParkwayPlan:plan,defaultParkwayFilters:defaults,parkwayStops:stops,localStorage:blockedStorage,sessionStorage:blockedStorage,fetch(){throw Error('No provider fetch');},XMLHttpRequest(){throw Error('No provider request');}});
  const node=selector=>nodes.get(selector);
  const fire=(type)=>{
    for(const callback of node('#parkway-form').listeners[type]??[])callback({preventDefault(){}});
    if(type==='reset'){for(const key of ['direction','season','interest'])node('#parkway-'+key).value=defaults[key];for(const input of inputs.values())input.checked=false;}
  };
  return {node,location,cards,inputs,choices,writes,visible(){return node('#parkway-stops').children.filter(card=>!card.hidden).map(card=>card.dataset.parkwayId);},selected(){return node('#parkway-stops').children.filter(card=>inputs.get(card.dataset.parkwayId)?.checked).map(card=>card.dataset.parkwayId);},fire,choose(id,checked=true){const input=inputs.get(id);assert.ok(input);input.checked=checked;for(const callback of input.listeners.change??[])callback({});fire('change');},async copy(){for(const callback of node('#parkway-copy').listeners.click??[])await callback({});},again(){for(const callback of events['astro:page-load']??[])callback();}};
}
const client=harness();
assert.equal(client.node('#parkway-form').hidden,false);assert.equal(client.node('#parkway-copy').hidden,false);
assert.ok(client.choices.every(choice=>choice.hidden===false));
assert.deepEqual(client.visible(),independentVisible['winter/scenic']);assert.deepEqual(client.selected(),[]);
assert.match(client.node('#parkway-status').textContent,/4 candidates.*0 optional stops selected/);
assert.match(client.node('#parkway-shortlist').children[0].textContent,/No optional stops selected/);
assert.equal(client.node('#parkway-stops').replaceCalls,0,'Default north SSR order is retained without reparenting focusable cards.');
let clientCombinations=0;
for(const [direction]of options.direction)for(const [season]of options.season)for(const [interest]of options.interest){
  const subject=harness();for(const [key,value]of Object.entries({direction,season,interest}))subject.node('#parkway-'+key).value=value;subject.fire('change');
  const visible=independentVisible[season+'/'+interest],expected=direction==='north'?visible:[...visible].reverse();
  assert.deepEqual(subject.visible(),expected);
  for(const id of optionalIds)subject.choose(id); // Season-invalid choices are pruned; interest-hidden choices remain selected.
  const seasonalOptional=independentVisible[season+'/all'].filter(id=>!endpoints.has(id));
  const expectedSelected=direction==='north'?seasonalOptional:[...seasonalOptional].reverse();
  assert.deepEqual(subject.selected(),expectedSelected);
  assert.equal(subject.node('#parkway-shortlist').children.length,expectedSelected.length);
  assert.equal(subject.node('#parkway-status').textContent,`${expected.length-2} candidates shown · ${expectedSelected.length} optional stops selected`);
  assert.match(subject.node('#parkway-origin').textContent,new RegExp(direction==='north'?'Lake Louise village':'Jasper town'));
  for(const card of subject.cards){const stop=stops.find(stop=>stop.id===card.dataset.parkwayId);assert.equal(card.querySelector('[data-parkway-distance]').textContent,`About ${direction==='north'?stop.fromLouiseKm:stop.fromJasperKm} km from ${direction==='north'?'Lake Louise village':'Jasper town'}`);assert.equal(card.querySelector('[data-parkway-season-note]').textContent,stop[season]);}
  subject.fire('submit');assert.deepEqual(subject.visible(),expected);
  assert.equal(subject.node('#parkway-stops').replaceCalls,direction==='north'?0:1,'Selection/filter rerenders do not reparent cards; only a direction flip does.');
  const next=new URL(subject.location.href);assert.equal(next.searchParams.get('parkway_stops'),expectedSelected.join(','));
  assert.equal(next.searchParams.get('utm_source'),'google');assert.equal(next.searchParams.get('gclid'),'keep');assert.equal(next.searchParams.get('msclkid'),'keep-too');assert.equal(next.hash,'#parkway-planner');
  clientCombinations++;
}
assert.equal(clientCombinations,12);
const prune=harness('https://banffbound.com/icefields-parkway-planner/?parkway_season=summer&parkway_interest=all&parkway_stops='+optionalIds.join(','));
assert.equal(prune.selected().length,12);prune.node('#parkway-season').value='winter';prune.fire('change');
assert.deepEqual(prune.selected(),['hector-viewpoint','crowfoot','bow-lake','peyto','tangle-falls','sunwapta','athabasca-falls']);
prune.node('#parkway-interest').value='scenic';prune.fire('change');assert.deepEqual(prune.selected(),['hector-viewpoint','crowfoot','bow-lake','peyto','tangle-falls','sunwapta','athabasca-falls'],'Visit-type filtering keeps a mixed shortlist.');
prune.node('#parkway-season').value='summer';prune.node('#parkway-interest').value='all';prune.fire('change');assert.deepEqual(prune.selected(),['hector-viewpoint','crowfoot','bow-lake','peyto','tangle-falls','sunwapta','athabasca-falls'],'Season-pruned choices do not silently return when switching back to summer.');
prune.choose('bow-lake',false);assert.ok(!prune.selected().includes('bow-lake'));
const mixed=harness();mixed.choose('bow-lake');mixed.node('#parkway-interest').value='walks';mixed.fire('change');
assert.deepEqual(mixed.visible(),independentVisible['winter/walks']);assert.deepEqual(mixed.selected(),['bow-lake']);assert.equal(mixed.node('#parkway-status').textContent,'3 candidates shown · 1 optional stop selected');
assert.equal(new URL(mixed.location.href).searchParams.get('parkway_stops'),'bow-lake');await mixed.copy();assert.match(mixed.writes[0],/Bow Lake main access: about 39 km/);
mixed.node('#parkway-interest').value='all';mixed.fire('change');assert.deepEqual(mixed.selected(),['bow-lake']);assert.ok(mixed.visible().includes('bow-lake'));assert.equal(mixed.node('#parkway-stops').replaceCalls,0);
client.choose('bow-lake');assert.equal(client.node('#parkway-stops').replaceCalls,0,'Checkbox change, including form bubbling, keeps existing card parents.');client.fire('change');client.fire('submit');assert.equal(client.node('#parkway-stops').replaceCalls,0);
await client.copy();assert.equal(client.writes.length,1);assert.equal(client.writes[0],client.node('#parkway-brief').value);assert.match(client.writes[0],/Bow Lake main access: about 39 km/);assert.match(client.node('#parkway-copy-status').textContent,/Planning brief copied/);
assert.ok(!client.writes[0].includes('utm_source')&&!client.writes[0].includes('gclid'),'The copied brief contains route choices, not raw ad context.');
for(const clipboard of ['absent','reject']){const fallback=harness(undefined,{clipboard});fallback.choose('tangle-falls');await fallback.copy();assert.equal(fallback.node('#parkway-copy-fallback').hidden,false);assert.equal(fallback.node('#parkway-brief').focused,true);assert.equal(fallback.node('#parkway-brief').selected,true);assert.match(fallback.node('#parkway-copy-status').textContent,/Select and copy/);assert.match(fallback.node('#parkway-brief').value,/Tangle Falls/);fallback.node('#parkway-direction').value='south';fallback.fire('change');assert.equal(fallback.node('#parkway-copy-fallback').hidden,true);assert.equal(fallback.node('#parkway-copy-status').textContent,'');}
const restore=harness('https://banffbound.com/icefields-parkway-planner/?parkway_direction=south&parkway_season=summer&parkway_interest=walks&parkway_stops=peyto,mistaya,parker-ridge,peyto,hector-viewpoint,lake-louise,unknown&utm_campaign=keep#return');
assert.deepEqual(restore.selected(),['parker-ridge','mistaya','peyto','hector-viewpoint']);assert.equal(restore.node('#parkway-direction').value,'south');assert.equal(restore.node('#parkway-season').value,'summer');assert.equal(restore.node('#parkway-interest').value,'walks');assert.match(restore.node('#parkway-brief').value,/Parker Ridge: about 112 km/);
assert.equal(restore.node('#parkway-stops').replaceCalls,1,'A restored southbound URL reparents exactly once.');restore.fire('submit');assert.equal(restore.node('#parkway-stops').replaceCalls,1);
restore.fire('reset');assert.deepEqual(restore.visible(),independentVisible['winter/scenic']);assert.deepEqual(restore.selected(),[]);assert.equal(new URL(restore.location.href).searchParams.get('utm_campaign'),'keep');assert.equal(new URL(restore.location.href).hash,'#return');
assert.equal(restore.node('#parkway-stops').replaceCalls,2,'Reset from south to north reparents once more.');restore.fire('reset');assert.equal(restore.node('#parkway-stops').replaceCalls,2,'Repeated reset in north does not reparent.');
for(const key of ['parkway_direction','parkway_season','parkway_interest','parkway_stops'])assert.equal(new URL(restore.location.href).searchParams.has(key),false);
for(const query of ['parkway_direction=bad&parkway_season=open&parkway_interest=%3Cscript%3E&parkway_stops=unknown,crossing,__proto__','parkway_direction=south&parkway_direction=north','parkway_season=summer&parkway_season=winter','parkway_interest=all&parkway_interest=walks','parkway_stops=bow-lake&parkway_stops=crowfoot','parkway_stops='+encodeURIComponent('x'.repeat(501))]){
  const invalid=harness('https://banffbound.com/icefields-parkway-planner/?'+query+'&utm_source=bing#keep');assert.deepEqual(invalid.visible(),independentVisible['winter/scenic']);assert.deepEqual(invalid.selected(),[]);assert.ok(!invalid.node('#parkway-brief').value.includes('<script>'));for(const key of ['parkway_direction','parkway_season','parkway_interest','parkway_stops'])assert.equal(new URL(invalid.location.href).searchParams.has(key),false);assert.equal(new URL(invalid.location.href).hash,'#keep');assert.equal(new URL(invalid.location.href).searchParams.get('utm_source'),'bing');
}
const partial=harness('https://banffbound.com/icefields-parkway-planner/?parkway_direction=south&parkway_direction=north&parkway_season=summer&parkway_interest=walks&parkway_stops=mistaya');assert.deepEqual(partial.visible(),independentVisible['summer/walks']);assert.deepEqual(partial.selected(),['mistaya']);
const blocked=harness(undefined,{blockHistory:true});blocked.node('#parkway-direction').value='south';blocked.choose('crowfoot');assert.deepEqual(blocked.selected(),['crowfoot']);assert.match(blocked.node('#parkway-brief').value,/Crowfoot Glacier viewpoint: about 197 km/);assert.equal(blocked.location.href,'https://banffbound.com/icefields-parkway-planner/?utm_source=google&gclid=keep&msclkid=keep-too#parkway-planner');await blocked.copy();assert.equal(blocked.writes.length,1);blocked.fire('reset');assert.deepEqual(blocked.selected(),[]);
assert.equal(blocked.node('#parkway-stops').replaceCalls,2,'An actual south flip then north reset each reparent once despite blocked history.');
client.again();client.again();for(const type of ['submit','change','reset'])assert.equal(client.node('#parkway-form').listeners[type].length,1);assert.equal(client.node('#parkway-copy').listeners.click.length,1);for(const input of client.inputs.values())assert.equal(input.listeners.change.length,1);
for(const missing of ['#parkway-form','#parkway-direction','#parkway-season','#parkway-interest','#parkway-stops','#parkway-status','#parkway-notes','#parkway-shortlist','#parkway-origin','#parkway-copy','#parkway-copy-status','#parkway-copy-fallback','#parkway-brief']){const incomplete=harness(undefined,{missing});assert.equal(incomplete.node('#parkway-form').hidden,true);assert.equal(incomplete.node('#parkway-copy').hidden,true);assert.deepEqual(incomplete.visible(),ids);assert.ok(incomplete.choices.every(choice=>choice.hidden));}
for(const settings of [{cardCount:13},{duplicateCard:true},{unknownCard:true}]){const incomplete=harness(undefined,settings);assert.equal(incomplete.node('#parkway-form').hidden,true);assert.equal(incomplete.node('#parkway-copy').hidden,true);assert.ok(incomplete.cards.every(card=>!card.hidden));}
console.log(`Parkway planning checks passed: ${combinations} model + ${clientCombinations} actual-client combinations, 14 exact paired map references, no automatic selections/ETA/access verdicts, mixed-interest selection retention and season-allowed pruning, direction/origin/order with reparenting only on direction changes, 14 full no-JS SSR cards/12 hidden choices/6 matching FAQs, real page+component Astro rendering, URL sanitization/restore/reset/idempotence/missing DOM/history failure, native sources and copy/clipboard fallback with ad context retained only in URL. No network or site build.`);
