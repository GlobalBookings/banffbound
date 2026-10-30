import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { build } from 'esbuild';
import { transform } from '@astrojs/compiler';
import { experimental_AstroContainer } from 'astro/container';
import { htmlFacts, htmlElements, schemaNodes, normal } from './verify-cycling-consent-release.mjs';

globalThis.fetch = () => { throw Error('No network in short-stay author checks'); };
const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const slug = '3-day-banff-itinerary';
const sourceFile = 'src/data/shortStayGuideOverrides.ts';
const postSource = await readFile(path.join(root, 'src/data/blogPosts.ts'), 'utf8');
const raw = postSource.match(/const originalBlogPosts:\s*BlogPost\[\]\s*=\s*(\[[\s\S]*?\n\]);/)?.[1];
assert.ok(raw);
const bundle = await build({ stdin: { contents: "export * from './" + sourceFile + "';export {blogContent as legacyContent} from './src/data/blogContent.ts';export {blogRedirects} from './src/data/redirects.mjs';export {towns} from './src/data/towns.ts';export {plannerTemplates} from './src/data/tripPlanner.ts';export const originalPosts=" + raw + ';', resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent' });
const d = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
for (const value of [d.shortStayGuideOverrides,d.shortStayGuideMetadata,d.shortStayGuideFaqs,d.shortStayGuideSources]) assert.deepEqual(Object.keys(value), [slug]);
assert.equal(d.reviewDate, '2026-10-29');
assert.equal(d.originalPosts.find(p => p.slug === slug)?.date, '2026-02-08');
assert.ok(!d.blogRedirects[slug]);
assert.deepEqual(htmlFacts('<html><body>' + d.legacyContent[slug] + '</body></html>').links.filter(h => /camref=|partner_id=/.test(h)), [], 'No direct merchant was inherited by this body');

const compiled = await transform('---\nconst { body } = Astro.props;\n---\n<article data-short-stay-guide><Fragment set:html={body} /></article>', { filename: path.join(root,'short-stay-author-check.astro'), internalURL: 'astro/compiler-runtime', resultScopedSlot: true });
assert.deepEqual(compiled.diagnostics.filter(v => v.severity === 1), []);
const renderCode = compiled.code.replace(/,\s*createMetadata as \$\$createMetadata/, '').replace(/^export const \$\$metadata = [^\n]*\n/m, '');
const renderedModule = await build({ stdin: { contents:renderCode, loader:'ts', resolveDir:root }, bundle:true,write:false,platform:'node',format:'esm',logLevel:'silent',plugins:[{name:'astro-runtime-only',setup(b){b.onResolve({filter:/^astro\//},a=>({path:pathToFileURL(require.resolve(a.path)).href,external:true}));}}] });
const Page = (await import('data:text/javascript;base64,' + Buffer.from(renderedModule.outputFiles[0].text).toString('base64'))).default;
const container = await experimental_AstroContainer.create();
const html = '<html><head></head><body>' + await container.renderToString(Page,{props:{body:d.shortStayGuideOverrides[slug]},request:new Request('https://banffbound.com/blog/' + slug + '/?email=PRIVATE_EMAIL&gclid=PRIVATE_CLICK')}) + '</body></html>';
const sections = {
  'short-time':['arrival point','rental return','Three full days','What to remove'],
  'short-base':['Banff town base','actual hotel entrance','category, occupancy','separate places','moving day'],
  'short-overview':['managed-rink','seasonal Minnewanka cruise','Remove the gondola','delete those travel-day activities','replace a whole day'],
  'short-day-one':['luggage storage','not a compulsory walking circuit','indoor interpretation','actual operation, check-in and return'],
  'short-day-two':['winter tickets do not include Moraine Lake','unassessed ice crossing','closed to personal vehicles year-round','specified authorized exceptions','ski-resort Park and Ride','Alpine Start','2026 Parks lake-shuttle season ended October 12','replacement main outing','Do not automatically combine Lake Agnes'],
  'short-day-three':['closed for the 2026 season','officially open facility','not to walk or skate on the Bow River','Remove the original third-day card','If you are leaving'],
  'short-winter':['least experienced person','Non-participants','participant conditions','transfer inclusions and return'],
  'short-backup':['scheduled December 11, 2026 end','not confirmed reopening','early November','Thursday-to-Monday','not hot-springs bathing'],
  'short-book':['real people, nights and travel windows','missing costs left unknown','admission separately','may earn a commission']
};
const requiredInternal = ['/calgary-to-banff/','/book/banff-hotels/','/book/lake-louise-stays/','/winter-stays/','/trip-builder/','/trip-builder/?template=winter-nonski-3','/trip-builder/?template=first-timer-3','/learn-to-ski/#lesson-fit','/ski-day-planner/','/shuttle-reservations/','/book/banff-winter-activities/','/trip-cost/','/park-pass/','/blog/banff-first-time-tips/#first-visit-planner','/blog/rainy-day-banff/'];
const forbidden = /PRIVATE_EMAIL|PRIVATE_CLICK|camref=|partner_id=|three days (?:is|are) enough to (?:see|do) everything|suitable for all fitness|leave Banff by 6:30|guaranteed (?:availability|views|saving)|\bCAD\s*\d|\$\s*\d|during my last visit|we visited/i;
function inspect(value, metadata=d.shortStayGuideMetadata[slug]) {
  assert.deepEqual(Object.keys(metadata).sort(), ['title','description','lastUpdated','readTime','imageIsIllustrative','imageNote'].sort());
  assert.equal(metadata.lastUpdated,d.reviewDate);assert.equal(metadata.imageIsIllustrative,true);assert.match(metadata.imageNote,/Illustrative.*not verified/i);
  const facts=htmlFacts(value),elements=htmlElements(value),anchors=elements.filter(e=>e.tag==='a'&&!e.hidden&&!e.inert);
  assert.ok(!forbidden.test(facts.text + value));
  const words=facts.text.split(/\s+/).length;assert.ok(words>=1900&&words<=2700);
  const ids=elements.filter(e=>e.attributes.id).map(e=>e.attributes.id);assert.equal(new Set(ids).size,ids.length);
  const headings=elements.filter(e=>e.tag==='h2'&&!e.hidden&&!e.inert);
  for(const [id,markers] of Object.entries(sections)){const h=headings.find(e=>e.attributes.id===id);assert.ok(h,id);const next=headings.find(e=>e.start>h.end);const text=normal(value.slice(h.end,next?.start??value.length).replace(/<[^>]*>/g,' ')).toLowerCase();for(const marker of markers)assert.ok(text.includes(marker.toLowerCase()),id+': '+marker);}
  const primary=Object.values(d.shortStayGuideSources[slug]);
  for(const a of anchors){const href=a.attributes.href;assert.ok(href);if(href.startsWith('#'))assert.ok(ids.includes(href.slice(1)));else if(!href.startsWith('/')){assert.ok(primary.includes(href));assert.equal(new URL(href).protocol,'https:');assert.equal(a.attributes.target,'_blank');assert.ok((a.attributes.rel??'').split(/\s+/).includes('noopener'));assert.ok(!(a.attributes.rel??'').includes('sponsored'));}}
  for(const href of [...primary,...requiredInternal])assert.ok(anchors.some(a=>a.attributes.href===href),'Native source/handoff '+href);
  const schemas=facts.documents.flatMap(doc=>schemaNodes(doc,'FAQPage'));assert.equal(schemas.length,1);assert.equal(facts.details.length,5);assert.equal(schemas[0].mainEntity.length,5);
  for(const [i,faq] of d.shortStayGuideFaqs[slug].entries()){const item=schemas[0].mainEntity[i];assert.equal(item['@type'],'Question');assert.equal(item.acceptedAnswer['@type'],'Answer');assert.equal(normal(item.name),normal(faq.question));assert.equal(normal(item.acceptedAnswer.text),normal(faq.answer));assert.equal(facts.details[i].question,normal(faq.question));assert.equal(facts.details[i].answer,normal(faq.answer));}
  assert.equal(elements.filter(e=>e.tag==='script').length,1);assert.ok(elements.filter(e=>e.tag==='script').every(e=>e.attributes.type==='application/ld+json'&&!e.attributes.src));
  assert.ok(!elements.some(e=>['form','iframe','object','embed'].includes(e.tag)));
  for(const type of ['Article','Hotel','Product','Offer','AggregateRating'])assert.equal(facts.documents.flatMap(doc=>schemaNodes(doc,type)).length,0);
  return {words,anchors};
}
const result=inspect(html);
for(const a of result.anchors.filter(a=>a.attributes.href.startsWith('/'))){const url=new URL(a.attributes.href,'https://banffbound.com'),route=url.pathname.replace(/\/$/,'');if(route.startsWith('/blog/')){assert.ok(d.originalPosts.some(p=>p.slug===route.slice(6)));assert.ok(!d.blogRedirects[route.slice(6)]);}else if(route.startsWith('/towns/'))assert.ok(d.towns.some(t=>t.slug===route.slice(7)));else {let found;for(const f of [path.join(root,'src/pages',route+'.astro'),path.join(root,'src/pages',route,'index.astro')])try{await access(f);found=f;break;}catch{}assert.ok(found,route);}}
for(const id of ['winter-nonski-3','first-timer-3'])assert.ok(d.plannerTemplates.some(t=>t.id===id&&t.days.length===3));
const page=await readFile(path.join(root,'src/pages/trip-builder.astro'),'utf8');assert.ok(page.includes("params.get('template')")&&page.includes('plan = createTripPlan(legacyTemplate)'),'Template URLs use supported current input semantics');
let negatives=0;
function rejects(changed,label){assert.notEqual(changed,html,'Mutation applied: '+label);assert.throws(()=>inspect(changed),label);negatives++;}
for(const href of [...Object.values(d.shortStayGuideSources[slug]),...requiredInternal])rejects(html.replaceAll('href="'+href+'"','href="/towns/"'),'missing useful native link '+href);
for(const [from,to] of [['winter tickets do not include Moraine Lake','winter tickets include Moraine Lake'],['closed to personal vehicles year-round','open to personal vehicles'],['2026 Parks lake-shuttle season ended October 12','2027 shuttles run all winter'],['replacement main outing','additional compulsory stop'],['closed for the 2026 season','open throughout winter'],['not to walk or skate on the Bow River','skate on the Bow River'],['not confirmed reopening','confirmed reopening'],['not hot-springs bathing','hot-springs bathing'],['missing costs left unknown','missing costs set to zero']])rejects(html.replaceAll(from,to),from);
rejects(html.replace('<summary>','<summary>Changed question: '),'visible FAQ question');
rejects(html.replace('"@type":"FAQPage"','"@type":"WebPage"'),'FAQ schema');
rejects(html.replace('</body>','<iframe src="https://example.com/"></iframe></body>'),'unexpected embedded provider');
rejects(html.replace('</body>','<p>Rooms from CAD 120. Guaranteed availability.</p></body>'),'invented quote');
assert.throws(()=>inspect(html,{...d.shortStayGuideMetadata[slug],date:d.reviewDate}));negatives++;
const source=await readFile(path.join(root,sourceFile),'utf8');assert.ok(!/\bfetch\s*\(|process\.env|localStorage|sessionStorage|document\.cookie/.test(source));
const note=await readFile(path.join(root,'research/short-stay-guide-sources-2026-10-29.md'),'utf8');assert.ok(note.includes('2026-02-08'));for(const url of Object.values(d.shortStayGuideSources[slug]))assert.ok(note.includes(url),url);
const markup=await transform(d.shortStayGuideOverrides[slug],{filename:slug+'.astro'});assert.deepEqual(markup.diagnostics.filter(v=>v.severity===1),[]);
console.log('Short-stay guide checks passed: actual Astro SSR, '+result.words+' words, 5 matching visible/schema FAQs, 11 primary links, original publication and zero inherited direct merchants, real owned routes and both supported three-day templates; '+negatives+' negative regressions. No network or site build.');
