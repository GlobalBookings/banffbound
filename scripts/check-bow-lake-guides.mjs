import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';
import { htmlElements, htmlFacts, schemaNodes, normal } from './verify-cycling-consent-release.mjs';

// Current files and in-memory fixtures only. No provider lookup, agent, writes or build.
globalThis.fetch = () => { throw new Error('Network is forbidden in this focused check'); };
const { outputFiles } = await build({ stdin: { contents: "export * from './src/data/bowLakeGuideOverrides.ts'; export {allBlogPosts} from './src/data/blogPosts.ts'; export {trails} from './src/data/trails.ts'; export {towns} from './src/data/towns.ts';", resolveDir: process.cwd() }, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent' });
const data = await import('data:text/javascript;base64,' + Buffer.from(outputFiles[0].text).toString('base64'));
const slugs = ['num-ti-jah-lodge','numtijah-lodge'];
const booking = 'https://us2.cloudbeds.com/reservation/72Jsch';
const water = 'https://parks.canada.ca/pn-np/ab/banff/activ/nautiques-sports';
const order = 'https://parks.canada.ca/pn-np/ab/banff/bulletins/59933c9d-02a5-4ec9-a2d8-ea0d4dad6429';
const required = {
  'num-ti-jah-lodge': ['Historic Lodge','Chalet','winter 2027','Thursday–Monday','May 29–October 9','no telephones, TVs or Wi-Fi','check-in between 3 and 5 p.m.','two-night minimum','packed lunch','A comfortable two-night outline'],
  'numtijah-lodge': ['1922','Stoney Nakoda Elders','pandemic closure in 2020','closed for the season','spring 2027','at least 24 hours','3.8 kilometres one way','95 metres of ascent and 20 metres of descent','approximately 7.6 kilometres','A building story with several chapters'],
};
function validateGuide(slug,body,meta) {
  assert.ok(body&&meta);assert.equal(meta.lastUpdated,'2026-10-29');assert.equal(meta.imageIsIllustrative,true);assert.match(meta.imageNote,/Illustrative.*not verified/i);
  for(const key of ['date','datePublished','publishedAt'])assert.ok(!Object.hasOwn(meta,key),'No publication date can be reset by the override.');
  assert.ok(meta.title.length>30&&meta.description.length>80);assert.match(meta.readTime,/^\d+ min read$/);
  const html='<html><head></head><body>'+body+'</body></html>',elements=htmlElements(html),facts=htmlFacts(html),text=facts.text;
  const words=text.split(/\s+/).length;assert.ok(words>=850&&words<=2400,slug+': substantive bounded guide length: '+words);
  for(const marker of [...required[slug],'October 29, 2026','Water Preservation Zone','paddling, large inflatables and motorized boating as prohibited','does not monitor natural ice for safety'])assert.ok(text.includes(marker),slug+': required source/decision marker '+marker);
  assert.ok(!/natural skating rink|complimentary wi[ -]?fi|free cancellation|25\s+(?:\w+\s+){0,3}rooms|(?:canoe|kayak|paddleboard) rentals? (?:are|is) available|(?:offers?|provides?) (?:canoe|kayak|paddleboard) rentals?|\$\s*\d|\bCAD\s*\d|\bI've (?:visited|stayed|seen)|\bI (?:visited|stayed)|\bmy last (?:visit|stay)|during my/i.test(text),'No inherited rink/rental/WiFi/price/inventory/personal claim.');
  assert.ok(elements.filter(n=>n.tag==='h2').length>=8);assert.ok(elements.some(n=>n.tag==='table'));assert.ok(elements.some(n=>n.tag==='ol'));
  const ids=elements.map(n=>n.attributes.id).filter(Boolean);assert.equal(new Set(ids).size,ids.length,slug+': unique section IDs');
  const anchors=elements.filter(n=>n.tag==='a');for(const anchor of anchors)assert.ok(!anchors.some(parent=>parent!==anchor&&anchor.start>=parent.openEnd&&anchor.end<=parent.innerEnd),slug+': no nested anchors');
  assert.ok(anchors.some(n=>n.attributes.href===water));assert.ok(anchors.some(n=>n.attributes.href===order));
  assert.ok(anchors.some(n=>n.attributes.href===`/blog/${slugs.find(s=>s!==slug)}/`),'Distinct guides must cross-link.');
  const docs=facts.documents.flatMap(doc=>schemaNodes(doc,'FAQPage'));assert.equal(docs.length,1);assert.equal(docs[0].mainEntity.length,slug==='num-ti-jah-lodge'?5:4);assert.equal(facts.details.length,docs[0].mainEntity.length);
  docs[0].mainEntity.forEach((q,index)=>{assert.equal(q['@type'],'Question');assert.equal(q.acceptedAnswer['@type'],'Answer');assert.equal(normal(q.name),facts.details[index].question);assert.equal(normal(q.acceptedAnswer.text),facts.details[index].answer);});
  assert.ok(elements.filter(n=>n.tag==='script').every(n=>n.attributes.type==='application/ld+json'&&!n.attributes.src),'Only inert matching FAQ schema is emitted.');
  assert.ok(!elements.some(n=>['iframe','embed','object'].includes(n.tag)));
  for(const anchor of anchors){const href=anchor.attributes.href;assert.ok(href);if(href.startsWith('/'))continue;const url=new URL(href);assert.equal(url.protocol,'https:');assert.equal(anchor.attributes.target,'_blank');assert.ok((anchor.attributes.rel??'').split(/\s+/).includes('noopener'));
    if(url.hostname==='www.expedia.ca'){assert.equal(url.pathname,'/Hotel-Search');assert.equal(url.searchParams.get('camref'),'1101l3MtWX');assert.equal(url.searchParams.get('destination'),'Lake Louise, Alberta');assert.deepEqual([...url.searchParams.keys()].sort(),['camref','destination']);assert.ok((anchor.attributes.rel??'').split(/\s+/).includes('sponsored'));assert.ok(text.includes('affiliate destination search'));assert.ok(text.includes('commission'));}
    else{assert.ok(['parks.canada.ca','lodgeatbowlake.com','us2.cloudbeds.com'].includes(url.hostname),href);assert.ok(!url.search&&!url.hash);if(url.hostname==='us2.cloudbeds.com')assert.equal(href,booking);assert.ok(!(anchor.attributes.rel??'').split(/\s+/).includes('sponsored'),'Official sources/operator links are not affiliate links.');}
  }
  if(slug==='num-ti-jah-lodge')assert.ok(anchors.some(n=>n.attributes.href===booking),'Current stay guide preserves the operator-linked booking identity.');
  return {words,faqCount:facts.details.length,anchors};
}
assert.deepEqual(Object.keys(data.bowLakeGuideOverrides).sort(),slugs);assert.deepEqual(Object.keys(data.bowLakeGuideMetadata).sort(),slugs);
assert.equal(new Set(Object.values(data.bowLakeGuideMetadata).map(m=>m.title)).size,2);
assert.match(data.bowLakeGuideMetadata['num-ti-jah-lodge'].title,/Rooms, Meals, Seasons & Arrival/);assert.match(data.bowLakeGuideMetadata['numtijah-lodge'].title,/History & Day Visits/);
const results=[];
for(const slug of slugs){
 const body=data.bowLakeGuideOverrides[slug],meta=data.bowLakeGuideMetadata[slug];
 const result=validateGuide(slug,body,meta);results.push({slug,words:result.words,faqs:result.faqCount});
 assert.equal(data.allBlogPosts.find(p=>p.slug===slug)?.date,slug==='num-ti-jah-lodge'?'2026-03-04':'2026-03-08','Original publication retained.');
 for(const {attributes:{href}}of result.anchors){if(!href.startsWith('/'))continue;const url=new URL(href,'https://banffbound.com'),route=url.pathname.replace(/\/$/,'');if(route.startsWith('/blog/'))assert.ok(data.allBlogPosts.some(p=>p.slug===route.slice(6)));else if(route.startsWith('/trails/'))assert.ok(data.trails.some(t=>t.slug===route.slice(8)&&t.routeVerified!==false));else if(route.startsWith('/towns/'))assert.ok(data.towns.some(t=>t.slug===route.slice(7)));else{let exists=false;for(const file of [path.join('src/pages',route+'.astro'),path.join('src/pages',route,'index.astro')])try{await access(file);exists=true;}catch{}assert.ok(exists,'Existing internal page: '+href);}}
 assert.throws(()=>validateGuide(slug,body.replaceAll('as prohibited','as permitted'),meta));
 assert.throws(()=>validateGuide(slug,body+'<p>Canoe rentals are available at the lodge.</p>',meta));
 assert.throws(()=>validateGuide(slug,body+'<p>Complimentary Wi-Fi is offered throughout the property.</p>',meta));
 assert.throws(()=>validateGuide(slug,body+'<p>During my last visit I stayed at the lodge.</p>',meta));
 assert.throws(()=>validateGuide(slug,body+'<p>Rooms cost $300 per night.</p>',meta));
 assert.throws(()=>validateGuide(slug,body.replace('"@type":"FAQPage"','"@type":"Article"'),meta));
 assert.throws(()=>validateGuide(slug,body,{...meta,date:'2026-10-29'}));
 assert.throws(()=>validateGuide(slug,body,{...meta,imageIsIllustrative:false}));
 assert.throws(()=>validateGuide(slug,body.replace('<a ','<a href="/blog/other/"><a ').replace('</a>','</a></a>'),meta));
}
const note=await readFile('research/bow-lake-guide-sources-2026-10-29.md','utf8');
for(const url of [booking,water,order,'https://lodgeatbowlake.com/the-lodge','https://lodgeatbowlake.com/stay','https://lodgeatbowlake.com/connect'])assert.ok(note.includes(url));
assert.match(note,/imageIsIllustrative/);assert.match(note,/2026-03-04/);assert.match(note,/2026-03-08/);assert.match(note,/No availability/);
console.log('Bow Lake guide checks passed: '+JSON.stringify(results)+'. Two distinct full bodies/metadata, preserved publication dates, operator booking identity, current water/ice restrictions, native honest affiliate search, matching FAQ/schema, internal routes, illustrative image contract and negative regressions. No network, file outputs or site build.');
