import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
import {build} from 'esbuild';
import {transform} from '@astrojs/compiler';
import {experimental_AstroContainer} from 'astro/container';
import {parseFragment} from 'parse5';
globalThis.fetch=()=>{throw Error('No network in park-pass checks');};
const bundled=await build({stdin:{contents:"export * from './src/data/parkPassPlanning.ts';",resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'esm'});
const d=await import('data:text/javascript;base64,'+Buffer.from(bundled.outputFiles[0].text).toString('base64'));
const {calculateParkPassPlan:plan,defaultParkPassInputs:defaults,parkPassOptions:options}=d;
assert.equal(d.parkPassReviewedAt,'2026-10-29');
assert.deepEqual(d.parkPassRates,{dailyAdult:1225,dailySenior:1075,dailyGroup:2450,annualAdult:8350,annualSenior:7150,annualGroup:16750,youth:0});
assert.deepEqual(plan().rows.map(r=>r.amountCents),[7350,7350,16700,16750]);assert.equal(plan().state,'compare');assert.equal(plan().breakEvenUnits,7);
let mathematicalCases=0;
for(let adults=0;adults<=7;adults++)for(let seniors=0;seniors<=7;seniors++)for(let youth=0;youth<=7;youth++){
 const count=adults+seniors+youth;if(count<1||count>7)continue;
 for(const vehicle of ['yes','no'])for(const units of [1,3,6,7,8,10]){
  const result=plan({...defaults,adults:String(adults),seniors:String(seniors),youth:String(youth),units:String(units),vehicle});
  assert.equal(result.errors.length,0);
  if(adults+seniors===0){assert.equal(result.state,'youth');assert.deepEqual(result.rows,[]);}else{
   const amounts=[(adults*1225+seniors*1075)*units,vehicle==='yes'?2450*units:null,adults*8350+seniors*7150,vehicle==='yes'?16750:null];
   assert.equal(result.state,'compare');assert.deepEqual(result.rows.map(r=>r.amountCents),amounts);
   const bestDaily=Math.min(amounts[0],amounts[1]??Infinity),bestAnnual=Math.min(amounts[2],amounts[3]??Infinity);
   assert.ok(result.summary.includes(d.formatParkPassMoney(bestDaily))&&result.summary.includes(d.formatParkPassMoney(bestAnnual)));
   assert.equal(result.breakEvenUnits,Math.floor(bestAnnual/(bestDaily/units))+1);
  }
  mathematicalCases++;
 }
}
assert.equal(mathematicalCases,1428);
for(const purpose of ['transit','outside']){const result=plan({...defaults,purpose,coverage:'bad',adults:'NaN',seniors:-9,youth:{},units:'bad',vehicle:'bad'});assert.equal(result.state,purpose);assert.equal(result.errors.length,0);assert.equal(result.activePartyFields,false);assert.equal(result.showCoverage,false);assert.deepEqual(result.rows,[]);}
for(const coverage of ['existing','eligibility']){const result=plan({...defaults,coverage,adults:'NaN',units:'bad',vehicle:'bad'});assert.equal(result.state,coverage);assert.equal(result.errors.length,0);assert.equal(result.activePartyFields,false);assert.deepEqual(result.rows,[]);}
const youth=plan({...defaults,adults:'0',seniors:'0',youth:'7',units:'bad',vehicle:'bad'});assert.equal(youth.state,'youth');assert.equal(youth.errors.length,0);
for(const patch of [{adults:'-1'},{adults:'1.5'},{adults:'8'},{adults:'0',seniors:'0',youth:'0'},{adults:'7',youth:'1'},{units:'0'},{units:'1.5'},{units:'61'},{vehicle:'unknown'},{coverage:'unknown'},{purpose:'unknown'}]){const r=plan({...defaults,...patch});assert.equal(r.state,'invalid');assert.ok(r.errors.length);assert.deepEqual(r.rows,[]);}
const poison={toString(){throw Error('Untrusted object must not be coerced');}};for(const value of [null,undefined,[],true,poison]){if(value===undefined)continue;assert.equal(plan(value).state,'invalid');}
assert.equal(plan({...defaults,adults:poison}).state,'invalid');

const filename=path.resolve('src/pages/park-pass.astro'),source=await readFile(filename,'utf8'),compiled=await transform(source,{filename,internalURL:'astro/compiler-runtime',resultScopedSlot:true});assert.deepEqual(compiled.diagnostics.filter(x=>x.severity===1),[]);
const require=createRequire(import.meta.url),code=compiled.code.replace(/,\s*createMetadata as \$\$createMetadata/,'').replace(/^export const \$\$metadata = [^\n]*\n/m,'');
const rendered=await build({stdin:{contents:code,loader:'ts',resolveDir:path.dirname(filename)},bundle:true,write:false,platform:'node',format:'esm',plugins:[{name:'pass-page-shells',setup(b){b.onResolve({filter:/^astro\//},a=>({path:pathToFileURL(require.resolve(a.path)).href,external:true}));b.onResolve({filter:/\?astro&type=style/},a=>({path:a.path,namespace:'style'}));b.onLoad({filter:/.*/,namespace:'style'},()=>({contents:'export {};'}));b.onResolve({filter:/\.astro$/},a=>({path:a.path,namespace:'shell'}));b.onLoad({filter:/.*/,namespace:'shell'},()=>({contents:"import {createComponent,render,renderSlot} from 'astro/runtime/server/index.js';export default createComponent((r,p,s)=>render`${renderSlot(r,s.default)}`);"}));}}]});
let Page;try{Page=(await import('data:text/javascript;base64,'+Buffer.from(rendered.outputFiles[0].text).toString('base64'))).default;}catch(error){throw Error('Park pass SSR import: '+error.message);}
const container=await experimental_AstroContainer.create();let html;try{html=await container.renderToString(Page,{request:new Request('https://banffbound.com/park-pass?email=DO_NOT_FORWARD&gclid=PRIVATE_CLICK_TOKEN&adults=7')});}catch(error){throw Error('Park pass SSR: '+error.message);}
const walk=n=>[n,...(n.childNodes??[]).flatMap(walk)],attr=(n,k)=>n.attrs?.find(a=>a.name===k)?.value,text=n=>n.nodeName==='#text'?n.value:(n.childNodes??[]).map(text).join(''),normal=n=>text(n).replace(/\s+/g,' ').trim(),nodes=walk(parseFragment(html)),byId=id=>nodes.find(n=>attr(n,'id')===id);
assert.equal(attr(byId('park-pass-form'),'hidden'),'');assert.equal(attr(byId('pass-errors'),'hidden'),'');assert.equal(attr(byId('pass-errors'),'role'),'alert');assert.equal(attr(byId('pass-status'),'aria-live'),'polite');assert.equal(attr(byId('pass-comparison-table'),'hidden'),undefined);assert.equal(byId('pass-party-fields').tagName,'fieldset');
for(const [key,tuples]of Object.entries(options)){const select=byId('pass-'+key);assert.equal(select.tagName,'select');assert.deepEqual(walk(select).filter(n=>n.tagName==='option').map(n=>[attr(n,'value'),normal(n)]),tuples.map(t=>[...t]));}
for(const [key,value]of Object.entries(defaults)){const input=byId('pass-'+key);assert.ok(nodes.some(n=>n.tagName==='label'&&attr(n,'for')==='pass-'+key));if(input.tagName==='input')assert.equal(attr(input,'value'),value);}
const rows=nodes.filter(n=>attr(n,'data-pass-option')!==undefined);assert.deepEqual(rows.map(n=>attr(n,'data-pass-option')),d.parkPassOptionIds);for(const row of plan().rows){assert.equal(normal(byId('pass-'+row.id+'-value')),d.formatParkPassMoney(row.amountCents).replace(/\s+/g,' '));assert.equal(normal(byId('pass-'+row.id+'-detail')),row.detail.replace(/\s+/g,' '));}
assert.equal(nodes.filter(n=>attr(n,'data-pass-rate')!==undefined).length,4);
const visibleFaqs=nodes.filter(n=>n.tagName==='details'),schemas=nodes.filter(n=>n.tagName==='script'&&attr(n,'type')==='application/ld+json').map(n=>JSON.parse(text(n))),faq=schemas.find(s=>s['@type']==='FAQPage');assert.equal(visibleFaqs.length,8);assert.deepEqual(faq.mainEntity.map(q=>[q.name,q.acceptedAnswer.text]),d.parkPassFaqs.map(f=>[f.question,f.answer]));for(const [i,node]of visibleFaqs.entries())assert.deepEqual([normal(node.childNodes.find(n=>n.tagName==='summary')),normal(node.childNodes.find(n=>n.tagName==='p'))],[d.parkPassFaqs[i].question,d.parkPassFaqs[i].answer]);
for(const key of ['fees','guide','order','admission','dailySeller','kananaskis','lakeTransport'])assert.ok(nodes.some(n=>n.tagName==='a'&&attr(n,'href')===d.parkPassSources[key]));assert.ok(nodes.some(n=>n.tagName==='noscript'));assert.equal(nodes.filter(n=>n.tagName==='img').length,0);
assert.ok(!/DO_NOT_FORWARD|PRIVATE_CLICK_TOKEN|no exceptions|\$5\.50|\$75\.25|\$151\.00|pays for itself in (?:just )?7 days|open 24\/7|saves 30\+|all 48 national parks|weather-based activity suggestions/i.test(html));
const component=await readFile('src/components/ParkPassPlanningInteractions.astro','utf8'),script=component.match(/<script>([\s\S]*?)<\/script>/)[1],client=await build({stdin:{contents:script,resolveDir:path.resolve('src/components'),loader:'ts'},bundle:true,write:false,platform:'browser',format:'iife'});assert.ok(!/fetch\(|localStorage|sessionStorage|\.cookie|\.innerHTML|navigator\.clipboard|history\.|location\.|\.href\s*=/.test(script));
class Element{constructor(id){this.id=id;this.hidden=false;this.disabled=false;this.value='';this.dataset={};this.textContent='';this.listeners={};this.focused=false;}addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);}focus(){this.focused=true;}dispatch(type){const e={defaultPrevented:false,preventDefault(){this.defaultPrevented=true;}};for(const fn of this.listeners[type]??[])fn(e);return e;}}
function fixture(missing=false){const ids=['park-pass-planner','park-pass-form','pass-status','pass-detail','pass-errors','pass-comparison-table','pass-party-fields','pass-coverage-wrap',...Object.keys(defaults).map(k=>'pass-'+k),...d.parkPassOptionIds.flatMap(id=>['pass-'+id+'-value','pass-'+id+'-detail'])],elements=new Map(ids.map(id=>[id,new Element(id)]));for(const [key,value]of Object.entries(defaults))elements.get('pass-'+key).value=value;const form=elements.get('park-pass-form');form.hidden=true;elements.get('pass-errors').hidden=true;if(missing)elements.delete('pass-units');const document={readyState:'complete',listeners:{},getElementById:id=>elements.get(id)||null,addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);}};vm.runInNewContext(client.outputFiles[0].text,{document,console,Intl});return{elements,form,document};}
const f=fixture();assert.equal(f.form.hidden,false);assert.equal(f.elements.get('park-pass-planner').dataset.passReady,'true');
for(const [purpose]of options.purpose)for(const [coverage]of options.coverage)for(const [vehicle]of options.vehicle){for(const [key,value]of Object.entries({...defaults,purpose,coverage,vehicle}))f.elements.get('pass-'+key).value=value;f.form.dispatch('change');const expected=plan({...defaults,purpose,coverage,vehicle});assert.equal(f.elements.get('pass-status').textContent,expected.summary);assert.equal(f.elements.get('pass-detail').textContent,expected.detail);assert.equal(f.elements.get('pass-party-fields').hidden,!expected.activePartyFields);assert.equal(f.elements.get('pass-party-fields').disabled,!expected.activePartyFields);assert.equal(f.elements.get('pass-coverage-wrap').hidden,!expected.showCoverage);assert.equal(f.elements.get('pass-comparison-table').hidden,expected.state!=='compare');}
f.form.dispatch('reset');f.elements.get('pass-adults').value='7';f.elements.get('pass-youth').value='1';assert.equal(f.form.dispatch('submit').defaultPrevented,true);assert.equal(f.elements.get('pass-errors').hidden,false);assert.equal(f.elements.get('pass-errors').focused,true);assert.equal(f.elements.get('pass-comparison-table').hidden,true);assert.ok(d.parkPassOptionIds.every(id=>f.elements.get('pass-'+id+'-value').textContent==='—'));
assert.equal(f.form.dispatch('reset').defaultPrevented,true);assert.equal(f.elements.get('pass-errors').hidden,true);assert.equal(f.elements.get('pass-status').textContent,plan().summary);assert.equal(f.elements.get('pass-comparison-table').hidden,false);for(const fn of f.document.listeners['astro:page-load'])fn();assert.equal(f.form.listeners.change.length,1);assert.equal(fixture(true).form.hidden,true);
console.log(`Park pass planning passed: ${mathematicalCases} literal-rate/party/unit cases; eight real SSR FAQ/schema pairs, four default option totals and four rate rows, all labels/required sources,24 compiled-client journey/coverage/arrival choices, inactive-field/youth handling, invalid-state clearing/error focus/reset/idempotence/missing-DOM; no input URL/storage/network/merchant construction. No build/network.`);
