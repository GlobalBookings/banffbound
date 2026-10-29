import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { htmlFacts, htmlElements, schemaNodes, normal } from './verify-cycling-consent-release.mjs';

// Prepared next-release content only. Does not require or change current registry integration.
globalThis.fetch = () => { throw new Error('Network is forbidden in this focused check'); };
const root = fileURLToPath(new URL('../', import.meta.url));
const postSource = await readFile(path.join(root,'src/data/blogPosts.ts'),'utf8');
const originalArray = postSource.match(/const originalBlogPosts:\s*BlogPost\[\]\s*=\s*(\[[\s\S]*?\n\]);/)?.[1];
assert.ok(originalArray,'Read original publication and canonical identity before metadata merges.');
const { outputFiles } = await build({ stdin: { contents: "export * from './src/data/springSkiGuideOverrides.ts';export {blogRedirects} from './src/data/redirects.mjs';export {towns} from './src/data/towns.ts';\nexport const originalPosts = " + originalArray + ';', resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent' });
const d = await import('data:text/javascript;base64,' + Buffer.from(outputFiles[0].text).toString('base64'));
const slug = 'banff-spring-skiing';
const sources = [
  'https://www.skibanff.com/the-mountain/mountain-report/hours-of-operation',
  'https://www.skibanff.com/events/special-experiences/spring-skiing',
  'https://www.skibanff.com/the-mountain/mountain-report/current-conditions',
  'https://www.skibanff.com/the-mountain/lifts-terrain/freeride-zones',
  'https://www.skibanff.com/lessons-rentals/ski-snowboard-school/the-snow-school',
  'https://www.skibanff.com/plan/getting-here/free-shuttle',
  'https://www.skilouise.com/things-to-do/more-mountain-for-2026-27/',
  'https://www.skilouise.com/tickets-passes/season-passes/spring-pass/',
  'https://www.skilouise.com/snow-conditions/',
  'https://www.skilouise.com/rentals-lessons/ski-snowboard-lessons/',
  'https://www.skilouise.com/getting-here/',
  'https://banffnorquay.com/hours-of-operation/',
  'https://banffnorquay.com/conditions/',
  'https://banffnorquay.com/snow-school/',
  'https://banffnorquay.com/shuttle-service/',
];
const bad = /\$\s*\d|\bCAD\s*\d|quit by 2\s*p\.?m|start skiing by 9\s*a\.?m|follow the sun to south-facing slopes|virtually no lift lines|lift lines are short or nonexistent|spring (?:always|automatically) (?:saves|offers cheaper)|spring skiing is safe for everyone|Delirium Dive is suitable for beginners|Delirium Dive is open all spring|guaranteed (?:snow|sunshine|saving|discount|availability)|\b(?:I|we) (?:skied|visited|stayed|drove)\b|during my last visit/i;
function validate(body, meta) {
  assert.equal(meta.lastUpdated,'2026-10-29'); assert.equal(meta.imageIsIllustrative,true); assert.match(meta.imageNote,/Illustrative.*not verified/i);
  assert.deepEqual(Object.keys(meta).sort(),['title','description','lastUpdated','readTime','imageIsIllustrative','imageNote'].sort(),'No publication reset or photographic schema identity.');
  assert.match(meta.title,/Spring Skiing.*Dates, Ability/); assert.ok(meta.description.length > 80); assert.match(meta.readTime,/^\d+ min read$/);
  const html='<html><head></head><body>'+body+'</body></html>',elements=htmlElements(html),facts=htmlFacts(html),text=facts.text;
  const words=text.split(/\s+/).length;assert.ok(words>=1400&&words<=2300,'Substantive bounded late-season guide: '+words);
  assert.ok(!bad.test(text),'No old timing, queues, savings, terrain, price or invented-visit claim.');
  for(const marker of ['October 29, 2026','April 18, 2027','May 2, 2027','conditions permitting','sale dates and pricing are to be confirmed','A specific 2027 last day for every lift or lesson is not established here.','An office’s seasonal date range is not a lift-opening guarantee.','Check the timestamp','A programme appearing in a winter catalogue does not establish an available place near closing day.','village, lakeshore and resort addresses are different places','no shoulder-season discount or availability']){
    const expected=marker==='Check the timestamp'?'Read the timestamp':marker;assert.ok(text.includes(expected),'Bounded season/service/decision marker: '+expected);
  }
  const headings=elements.filter(n=>n.tag==='h2');assert.ok(headings.length>=9);assert.ok(elements.filter(n=>n.tag==='table').length>=2);assert.ok(elements.some(n=>n.tag==='ol'));
  const freeride=headings.find(n=>n.attributes.id==='freeride'),next=freeride&&headings.find(n=>n.start>freeride.end);assert.ok(freeride&&next);
  const zone=normal(html.slice(freeride.end,next.start).replace(/<[^>]*>/g,' '));
  for(const gate of ['expert terrain','complex natural features and avalanche exposure','457 kHz avalanche transceiver switched on and transmitting','avalanche shovel and probe in a suitable backpack','similarly equipped partner','The equipment does not supply the skills.','route-finding demands','current Freeride Zone status','reduces risk without eliminating it'])assert.ok(zone.includes(gate),'Required freeride gate in its own visible section: '+gate);
  const ids=elements.map(n=>n.attributes.id).filter(Boolean);assert.equal(new Set(ids).size,ids.length);
  const anchors=elements.filter(n=>n.tag==='a');for(const a of anchors){assert.ok(!anchors.some(parent=>parent!==a&&a.start>=parent.openEnd&&a.end<=parent.innerEnd),'No nested link.');const href=a.attributes.href;assert.ok(href);if(href.startsWith('#'))assert.ok(ids.includes(href.slice(1)));else if(!href.startsWith('/')){const u=new URL(href);assert.equal(u.protocol,'https:');assert.ok(['www.skibanff.com','www.skilouise.com','banffnorquay.com'].includes(u.hostname),'Only primary resort links.');assert.ok(!u.search&&!u.hash);assert.equal(a.attributes.target,'_blank');assert.ok((a.attributes.rel??'').split(/\s+/).includes('noopener'));assert.ok(!(a.attributes.rel??'').split(/\s+/).includes('sponsored'),'No invented operator affiliate relationship.');}}
  for(const href of [...sources,'/learn-to-ski/#lesson-fit','/ski-day-planner/','/ski-pass-calculator/','/car-free-banff/','/packing-list/','/conditions/','/winter-stays/','/winter/','/book/banff-hotels/','/book/lake-louise-stays/'])assert.ok(anchors.some(a=>a.attributes.href===href),'Useful native source/journey handoff: '+href);
  const faqs=facts.documents.flatMap(doc=>schemaNodes(doc,'FAQPage'));assert.equal(faqs.length,1);assert.equal(faqs[0].mainEntity.length,5);assert.equal(facts.details.length,5);
  d.springSkiGuideFaqs.forEach((faq,i)=>{const q=faqs[0].mainEntity[i];assert.equal(q['@type'],'Question');assert.equal(q.acceptedAnswer['@type'],'Answer');assert.equal(normal(q.name),normal(faq.question));assert.equal(normal(q.acceptedAnswer.text),normal(faq.answer));assert.equal(facts.details[i].question,normal(faq.question));assert.equal(facts.details[i].answer,normal(faq.answer));});
  assert.ok(elements.filter(n=>n.tag==='script').every(n=>n.attributes.type==='application/ld+json'&&!n.attributes.src));assert.ok(!elements.some(n=>['iframe','embed','object'].includes(n.tag)));assert.equal(facts.documents.flatMap(doc=>schemaNodes(doc,'Article')).length,0);
  return {words,anchors};
}
assert.deepEqual(Object.keys(d.springSkiGuideOverrides),[slug]);assert.deepEqual(Object.keys(d.springSkiGuideMetadata),[slug]);assert.equal(d.reviewDate,'2026-10-29');assert.equal(d.springSkiGuideFaqs.length,5);
assert.equal(d.originalPosts.find(p=>p.slug===slug)?.date,'2025-09-30','Original raw post publication before metadata merges, independent of future integration.');assert.ok(!d.blogRedirects[slug]);
const body=d.springSkiGuideOverrides[slug],meta=d.springSkiGuideMetadata[slug],result=validate(body,meta);
for(const a of result.anchors){const href=a.attributes.href;if(!href.startsWith('/'))continue;const u=new URL(href,'https://banffbound.com'),route=u.pathname.replace(/\/$/,'');if(route.startsWith('/blog/')){assert.ok(d.originalPosts.some(p=>p.slug===route.slice(6)));assert.ok(!d.blogRedirects[route.slice(6)]);}else if(route.startsWith('/towns/'))assert.ok(d.towns.some(t=>t.slug===route.slice(7)));else{let exists=false;for(const file of [path.join(root,'src/pages',route+'.astro'),path.join(root,'src/pages',route,'index.astro')])try{await access(file);exists=true;}catch{}assert.ok(exists,'Existing internal route: '+href);}}
assert.ok((await readFile(path.join(root,'src/pages/learn-to-ski.astro'),'utf8')).includes('id="lesson-fit"'),'Real lesson-finder fragment.');
for(const claim of ['Quit by 2pm.','Start skiing by 9am.','Follow the sun to south-facing slopes.','There are virtually no lift lines.','Spring automatically saves money.','Delirium Dive is suitable for beginners.','Delirium Dive is open all spring.','We skied here last May.','Tickets cost $80.'])assert.throws(()=>validate(body+'<p>'+claim+'</p>',meta),'Reject old/unsupported claim: '+claim);
for(const [from,to]of [['457 kHz avalanche transceiver switched on and transmitting','ordinary mobile phone'],['avalanche shovel and probe in a suitable backpack','a small day bag'],['similarly equipped partner','solo traveller'],['current Freeride Zone status','an old photograph'],['May 2, 2027','May 20, 2027'],['April 18, 2027','May 18, 2027'],['not established here','guaranteed here'],['"@type":"FAQPage"','"@type":"WebPage"']])assert.throws(()=>validate(body.replaceAll(from,to),meta),'Require current dated/equipment/FAQ distinction: '+from);
assert.throws(()=>validate(body,{...meta,date:'2026-10-29'}));assert.throws(()=>validate(body,{...meta,imageIsIllustrative:false}));assert.throws(()=>validate(body.replace('<a ','<a href="/winter/"><a ').replace('</a>','</a></a>'),meta));
const source=await readFile(path.join(root,'src/data/springSkiGuideOverrides.ts'),'utf8');assert.equal((source.match(/function renderFaqs\(/g)??[]).length,1);assert.equal((source.match(/\$\{renderFaqs\(\)\}/g)??[]).length,1);
const note=await readFile(path.join(root,'research/spring-ski-guide-sources-2026-10-29.md'),'utf8');for(const url of sources)assert.ok(note.includes(url),'Source inventory: '+url);for(const marker of ['next release','2025-09-30','current67','imageIsIllustrative','No exact departure','office/restaurant date ranges','2025/26'])assert.ok(note.includes(marker),'Preparation/source scope record: '+marker);
console.log(`Spring ski guide checks passed: ${result.words} words, one prepared body/metadata and five matching FAQs; preserved original publication, current dated plans, full section-scoped freeride gates, native source/journey links, illustrative image contract and negative regressions. Registry integration is outside this standalone check; no network, file output or site build.`);
