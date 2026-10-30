import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { transform } from '@astrojs/compiler';
import { experimental_AstroContainer } from 'astro/container';
import { htmlFacts, htmlElements, schemaNodes, normal } from './verify-cycling-consent-release.mjs';

globalThis.fetch = () => { throw Error('No network in first-visit author checks'); };
const root = fileURLToPath(new URL('../', import.meta.url)), require = createRequire(import.meta.url);
const file = 'src/data/firstVisitGuideOverrides.ts', read = filename => readFile(path.join(root, filename), 'utf8');
const originalPosts = (await read('src/data/blogPosts.ts')).match(/const originalBlogPosts:\s*BlogPost\[\]\s*=\s*(\[[\s\S]*?\n\]);/)?.[1];
assert.ok(originalPosts, 'Read original publication records before review metadata.');
const bundled = await build({ stdin: { contents: `export * from './${file}';export {blogRedirects} from './src/data/redirects.mjs';export {towns} from './src/data/towns.ts';export const originalPosts=${originalPosts};`, resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent' });
const d = await import('data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].text).toString('base64'));
const publications = { 'banff-first-time-tips': '2025-11-18', 'banff-mobile-connectivity': '2025-09-10' }, slugs = Object.keys(publications);
const referrals = ['https://www.expedia.ca/Hotel-Search?destination=Banff%2C+Alberta&camref=1101l3MtWX','https://www.getyourguide.com/banff-l284/?partner_id=QW960HO'];
for (const object of [d.firstVisitGuideOverrides,d.firstVisitGuideMetadata,d.firstVisitGuideFaqs,d.firstVisitGuideSources]) assert.deepEqual(Object.keys(object),slugs);
assert.equal(d.reviewDate,'2026-10-29');
for (const slug of slugs) { assert.equal(d.originalPosts.find(p=>p.slug===slug)?.date,publications[slug]);assert.ok(!Object.hasOwn(d.blogRedirects,slug)); }

// Render the actual exported bodies through the same set:html boundary used by
// the blog. No shared registry count or complete site build is needed here.
const compiled=await transform('---\nconst { body } = Astro.props;\n---\n<article data-author-body><Fragment set:html={body} /></article>',{filename:path.join(root,'first-visit-author-check.astro'),internalURL:'astro/compiler-runtime',resultScopedSlot:true});
assert.deepEqual(compiled.diagnostics.filter(v=>v.severity===1),[]);
const renderCode=compiled.code.replace(/,\s*createMetadata as \$\$createMetadata/,'').replace(/^export const \$\$metadata = [^\n]*\n/m,'');
const renderBundle=await build({stdin:{contents:renderCode,loader:'ts',resolveDir:root},bundle:true,write:false,platform:'node',format:'esm',logLevel:'silent',plugins:[{name:'astro-runtime-only',setup(b){b.onResolve({filter:/^astro\//},a=>({path:pathToFileURL(require.resolve(a.path)).href,external:true}));}}]});
const Page=(await import('data:text/javascript;base64,'+Buffer.from(renderBundle.outputFiles[0].text).toString('base64'))).default;
const container=await experimental_AstroContainer.create(), rendered={};
for(const slug of slugs) rendered[slug]='<html><head></head><body>'+await container.renderToString(Page,{props:{body:d.firstVisitGuideOverrides[slug]},request:new Request('https://banffbound.com/blog/'+slug+'/?phone=PRIVATE_PHONE&medical=PRIVATE_MEDICAL&location=PRIVATE_LOCATION&gclid=PRIVATE_CLICK')})+'</body></html>';

const forbidden=/\$\s*\d|\bCAD\s*\d|\d+\s*%|every vehicle entering Banff.*needs a.*pass|you need a car to reach (?:Lake Louise|Moraine)|Discovery Pass.*pays for itself in 7 days|all carriers guarantee full service|full coverage from all major carriers|911 always works|in areas without service,? 911 will not work|every satellite device provides two-way messaging|all (?:Garmin|suspended) devices retain free SOS|every Garmin requires an active subscription for SOS|satellite SOS works on every phone|offline maps send an SOS|make a test call to 911 before|airplane mode guarantees incoming calls|all six checkmarks mean you are safe to travel|guaranteed (?:connection|rescue|Wi-Fi|views)|\b(?:I|we) (?:visited|stayed|tested every|rented)|during my last visit/i;
const requirements={
  'banff-first-time-tips':{
    'first-arrival':['arrival point, first accommodation and final departure','flight arrival time is not the time you are ready','rental car is an option to compare, not a requirement','return'],
    'first-base':['actual address','room category','village, lakeshore and ski resort are separate places','Count people, beds, rooms and nights separately','does not give every room'],
    'first-days':['one main objective','Suggestions are not reservations or route approval','book the suitable instruction','Non-skiers','summer grade','weather-change guide'],
    'first-access':['four questions separate','closed to personal vehicles year-round','specified authorized exceptions','ordinary rental booking does not supply an exception','2026 Parks lake-shuttle season ended October 12','September 8, 2026','no universal seven-travel-day break-even rule','Entry does not book'],
    'first-quotes':['terms separately','same people, dates and coverage','Leave missing amounts unknown','different access and transport requirements','does not establish an available date'],
    'first-backup':['paper fallback','scheduled closure end is not confirmation','town forecast does not describe every mountain','marks cannot confirm present conditions'],
  },
  'banff-mobile-connectivity':{
    'connection-context':['not a reading from your room, trail or current handset','prepare for no cell service','unverified emergency telephone'],
    'connection-provider':['areas are approximate','source links, not carrier recommendations','exact handset, software and voice features','Canada coverage','SIM or eSIM','actual accommodation or venue'],
    'connection-offline':['without data or a fresh account login','may not replace a provider’s required ticket format','offline map is not a communication service','locating itself by satellite is not the same as sending','not in this guide or a public shared itinerary'],
    'connection-power':['temporarily shorten battery life or shut the device down','actual equipment','not a promise of hours outside','do not copy a universal airplane-mode instruction'],
    'connection-emergency':['try 911','may make emergency calls through other carrier networks','not a guarantee','explain where you are','Do not make a test call','ordinary SMS or chat message','satellite phone','+1 403 762 4506','no device guarantees an immediate response or rescue'],
    'connection-satellite':['different features','eligible iPhone 14-or-later','required software','purchase-region and availability conditions','clear sky/horizon','selected compatible models','Garmin Messenger setup and prior active service','cancelled, never-activated and suspended accounts','no blanket active-subscription or free-SOS rule'],
    'connection-routine':['saved material','return instructions remain usable offline','Agree the check-in privately','not an emergency request','another outing'],
    'connection-stays':['actual property’s facilities','ordinary accommodation/activity searches','not verified connected rooms','no SIM comparison'],
  },
};
const requiredNative={
  'banff-first-time-tips':['#first-visit-planner','/calgary-to-banff/','/car-free-banff/','/blog/banff-car-rental-tips/','/towns/','/towns/canmore/#where-to-stay','/book/banff-hotels/','/book/lake-louise-stays/','/winter-stays/','/trip-builder/','/learn-to-ski/#lesson-fit','/ski-day-planner/','/shuttle-reservations/','/parking/','/park-pass/','/trip-cost/','/book/banff-winter-activities/','/blog/banff-mobile-connectivity/','/packing-list/','/conditions/','/altitude-guide/'],
  'banff-mobile-connectivity':['/icefields-parkway-planner/','/shuttle-reservations/','/ski-day-planner/','/packing-list/','/conditions/','/blog/banff-first-time-tips/','/book/banff-hotels/','/book/lake-louise-stays/','tel:911','tel:+14037624506'],
};
function validate(slug,html,meta=d.firstVisitGuideMetadata[slug]){
  assert.deepEqual(Object.keys(meta).sort(),['title','description','lastUpdated','readTime','imageIsIllustrative','imageNote'].sort());assert.equal(meta.lastUpdated,'2026-10-29');assert.equal(meta.imageIsIllustrative,true);assert.match(meta.imageNote,/Illustrative.*not verified/);assert.ok(meta.description.length>100);
  const facts=htmlFacts(html),elements=htmlElements(html),words=facts.text.split(/\s+/).length;
  assert.ok(words>=1500&&words<=2300,`${slug}: substantive bounded output (${words} words)`);assert.ok(!forbidden.test(facts.text),'No stale/invented/universal transport, coverage, emergency or readiness claim.');
  assert.ok(facts.text.includes('Full guide reviewed October 29, 2026'));assert.match(facts.text,/hero (?:image )?is illustrative/i);assert.ok(!/PRIVATE_PHONE|PRIVATE_MEDICAL|PRIVATE_LOCATION|PRIVATE_CLICK/.test(html));
  const h2=elements.filter(n=>n.tag==='h2'),ids=elements.map(n=>n.attributes.id).filter(Boolean);assert.equal(ids.length,new Set(ids).size);
  for(const[id,markers]of Object.entries(requirements[slug])){const heading=h2.find(n=>n.attributes.id===id);assert.ok(heading,'Real section '+id);const next=h2.find(n=>n.start>heading.end);const text=normal(html.slice(heading.end,next?.start??html.length).replace(/<[^>]*>/g,' '));for(const marker of markers)assert.ok(text.toLowerCase().includes(marker.toLowerCase()),`${slug} ${id}: ${marker}`);}
  const anchors=elements.filter(n=>n.tag==='a');
  for(const a of anchors){const href=a.attributes.href;assert.ok(href);assert.ok(!anchors.some(p=>p!==a&&a.start>=p.openEnd&&a.end<=p.innerEnd),'No nested anchors.');assert.ok(!Object.keys(a.attributes).some(k=>/^on/i.test(k)));
    if(href.startsWith('#')){if(href==='#first-visit-planner'&&slug==='banff-first-time-tips')assert.ok(!ids.includes('first-visit-planner'),'Shared appended component owns its one planner ID.');else assert.ok(ids.includes(href.slice(1)),'Existing body fragment '+href);}
    else if(href.startsWith('tel:'))assert.ok(slug==='banff-mobile-connectivity'&&['tel:911','tel:+14037624506'].includes(href),'Only actual cited emergency numbers, without reader data.');
    else if(!href.startsWith('/')){assert.equal(new URL(href).protocol,'https:');assert.ok([...Object.values(d.firstVisitGuideSources[slug]),...referrals].includes(href),'Declared primary/inherited href '+href);assert.equal(a.attributes.target,'_blank');assert.ok(a.attributes.rel.includes('noopener'));assert.equal(a.attributes.rel.split(/\s+/).includes('sponsored'),referrals.includes(href));}
  }
  for(const href of [...Object.values(d.firstVisitGuideSources[slug]),...referrals,...requiredNative[slug]])assert.ok(anchors.some(a=>a.attributes.href===href),'Useful native/source handoff remains: '+href);
  assert.deepEqual([...new Set(anchors.filter(a=>a.attributes.rel?.split(/\s+/).includes('sponsored')).map(a=>a.attributes.href))].sort(),[...referrals].sort());assert.ok(facts.text.includes('may earn a commission'));
  assert.ok(elements.some(n=>n.tag==='table'));assert.ok(!elements.some(n=>['form','input','button','iframe','object','embed','img'].includes(n.tag)),'Authored bodies introduce no duplicate tool, personal fields or provider embeds.');
  const scripts=elements.filter(n=>n.tag==='script');assert.equal(scripts.length,1);assert.equal(scripts[0].attributes.type,'application/ld+json');
  const faqs=facts.documents.flatMap(v=>schemaNodes(v,'FAQPage'));assert.equal(faqs.length,1);assert.equal(faqs[0].mainEntity.length,5);assert.equal(facts.details.length,5);assert.equal(facts.documents.flatMap(v=>schemaNodes(v,'Article')).length,0);
  for(const[i,faq]of d.firstVisitGuideFaqs[slug].entries()){assert.equal(facts.details[i].question,normal(faq.question));assert.equal(facts.details[i].answer,normal(faq.answer));assert.equal(normal(faqs[0].mainEntity[i].name),normal(faq.question));assert.equal(normal(faqs[0].mainEntity[i].acceptedAnswer.text),normal(faq.answer));}
  return{words,anchors};
}
const results=slugs.map(slug=>({slug,...validate(slug,rendered[slug])}));
for(const{anchors}of results)for(const a of anchors){const href=a.attributes.href;if(!href.startsWith('/'))continue;const u=new URL(href,'https://banffbound.com'),route=u.pathname.replace(/\/$/,'');
  if(route.startsWith('/blog/')){const slug=route.slice(6);assert.ok(d.originalPosts.some(p=>p.slug===slug));assert.ok(!d.blogRedirects[slug]);}
  else if(route.startsWith('/towns/')){assert.ok(d.towns.some(t=>t.slug===route.slice(7)));if(u.hash)assert.ok((await read('src/pages/towns/[slug].astro')).includes(`id="${u.hash.slice(1)}"`));}
  else{let filename;for(const name of ['src/pages'+route+'.astro','src/pages'+route+'/index.astro'])try{await access(path.join(root,name));filename=name;break;}catch{}assert.ok(filename,'Existing page '+href);if(u.hash)assert.ok((await read(filename)).includes(`id="${u.hash.slice(1)}"`));}
}
const component=await read('src/components/FirstVisitPlanningInteractions.astro'),blogPage=await read('src/pages/blog/[slug].astro');assert.ok(component.includes('id="first-visit-planner"'));assert.ok(blogPage.includes("post.slug === 'banff-first-time-tips' && <FirstVisitPlanningInteractions"),'Planner fragment supplied by the actual root-owned conditional append.');
const legacy=await read('src/data/blogContent.ts');
for(const slug of slugs){const old=legacy.match(new RegExp("['\"]"+slug+"['\"]\\s*:\\s*`([\\s\\S]*?)`"))?.[1];assert.ok(old);assert.deepEqual([...new Set([...old.matchAll(/href=["']([^"']+)["']/g)].map(v=>v[1]))].sort(),[...referrals].sort(),'Exact original authored referral set retained.');assert.ok(!/\bid=["']/.test(old),'No inherited fragment IDs silently lost.');}
const addedClaims=['A Discovery Pass pays for itself in 7 days.','You need a car to reach Moraine Lake.','All six checkmarks mean you are safe to travel.','All carriers guarantee full service.','911 always works.','In areas without service, 911 will not work.','Every satellite device provides two-way messaging.','Every Garmin requires an active subscription for SOS.','All suspended devices retain free SOS.','Satellite SOS works on every phone.','Offline maps send an SOS.','Make a test call to 911 before hiking.','Airplane mode guarantees incoming calls.','Your hotel has guaranteed Wi-Fi.','Rooms start at CAD 200.','We tested every carrier here.'];
let negatives=0;
for(const slug of slugs)for(const claim of addedClaims){assert.throws(()=>validate(slug,rendered[slug].replace('</body>','<p>'+claim+'</p></body>')),claim);negatives++;}
const changes={
  'banff-first-time-tips':[['closed to personal vehicles year-round','only restricted at peak times'],['ordinary rental booking does not supply an exception','ordinary rental booking grants an exception'],['no universal seven-travel-day break-even rule','always a seven-day break-even rule'],['one main objective','three major destinations'],['marks cannot confirm present conditions','marks confirm current conditions']],
  'banff-mobile-connectivity':[['prepare for no cell service','expect uninterrupted service'],['offline map is not a communication service','offline map transmits emergency messages'],['not a guarantee that another network or a working call is available','guarantees another network is available'],['eligible iPhone 14-or-later','any handset'],['purchase-region and availability conditions','no regional restrictions'],['selected compatible models','all models'],['Garmin Messenger setup and prior active service','no activation or setup'],['no blanket active-subscription or free-SOS rule','free SOS on any suspended device']],
};
for(const[slug,cases]of Object.entries(changes))for(const[from,to]of cases){assert.ok(rendered[slug].includes(from),'Mutation targets produced output');assert.throws(()=>validate(slug,rendered[slug].replaceAll(from,to)),from);negatives++;}
for(const slug of slugs){const primary=slug===slugs[0]?d.firstVisitGuideSources[slug].fees:d.firstVisitGuideSources[slug].garminSuspend;assert.ok(rendered[slug].includes(primary));assert.throws(()=>validate(slug,rendered[slug].replaceAll(primary,'/winter/')),'A removed source must fail even when the claim text survives.');negatives++;}
assert.throws(()=>validate(slugs[0],rendered[slugs[0]].replace('</body>','<section id="first-visit-planner"></section></body>')),'The article cannot duplicate the appended planner section.');negatives++;
for(const slug of slugs){for(const[from,to]of [['camref=1101l3MtWX','camref=wrong'],['partner_id=QW960HO','partner_id=wrong'],['"@type":"FAQPage"','"@type":"WebPage"']]){assert.throws(()=>validate(slug,rendered[slug].replaceAll(from,to)));negatives++;}assert.throws(()=>validate(slug,rendered[slug],{...d.firstVisitGuideMetadata[slug],date:d.reviewDate}));negatives++;assert.throws(()=>validate(slug,rendered[slug],{...d.firstVisitGuideMetadata[slug],imageIsIllustrative:false}));negatives++;assert.throws(()=>validate(slug,rendered[slug].replace('<summary>','<summary>Different question: ')));negatives++;assert.throws(()=>validate(slug,rendered[slug].replace('<a ','<a href="/winter/"><a ').replace('</a>','</a></a>')));negatives++;assert.throws(()=>validate(slug,rendered[slug].replace('</body>','<input name="phone"><script src="https://example.org/vendor.js"></script></body>')));negatives++;}
const source=await read(file);assert.equal((source.match(/function renderFaqs\(/g)??[]).length,1);assert.equal((source.match(/\$\{renderFaqs\('/g)??[]).length,2);assert.ok(!/\bfetch\s*\(|process\.env|localStorage|sessionStorage|document\.cookie|navigator\./.test(source));
const note=await read('research/first-visit-guide-sources-2026-10-29.md');for(const url of [...Object.values(d.firstVisitGuideSources).flatMap(Object.values),...referrals])assert.ok(note.includes(url),'Source/identity record '+url);for(const marker of ['2025-11-18','2025-09-10','83','no fragment IDs','Registration','suspended','JavaScript','No SIM'])assert.ok(note.includes(marker));
console.log('First-visit guides passed: '+results.map(r=>r.slug+' '+r.words+' words').join('; ')+`; actual Astro output, two original publications/exact inherited referral sets, ten visible/schema FAQ pairs, six-stage/appended-planner boundary, declared primary and native links, scoped connectivity/emergency/SOS/image/privacy boundaries and ${negatives} negative regressions. No network, registry-count expectation, site build or file output.`);
