import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { transform } from '@astrojs/compiler';

// Prepared content only. Deliberately independent of the current review registry.
globalThis.fetch = () => { throw Error('Network is forbidden in this focused content check'); };
const root = fileURLToPath(new URL('../', import.meta.url));
const rawSource = await readFile(path.join(root,'src/data/blogPosts.ts'),'utf8');
const rawArray = rawSource.match(/const originalBlogPosts:\s*BlogPost\[\]\s*=\s*(\[[\s\S]*?\n\]);/)?.[1];
assert.ok(rawArray,'Read original publication/canonical identity before any metadata merges.');
async function bundle(contents) {
  const {outputFiles} = await build({stdin:{contents,resolveDir:root},bundle:true,write:false,platform:'node',format:'esm',logLevel:'silent'});
  return import('data:text/javascript;base64,'+Buffer.from(outputFiles[0].text).toString('base64'));
}
const {originals} = await bundle('export const originals = '+rawArray+';');
const data = await bundle("export * from './src/data/scenicFlightGuideOverrides.ts';export {blogRedirects} from './src/data/redirects.mjs';");
const publications = {'banff-helicopter-tours':'2025-10-12','kananaskis-heli-tours':'2026-03-03'};
const slugs = Object.keys(publications);
const primary = {
  entry:'https://alpinehelicopter.com/sightseeing-tours/',
  contact:'https://alpinehelicopter.com/contact-us/',
  canmore:'https://canmore.alpinehelicopter.com/',
  threeSisters:'https://canmore.alpinehelicopter.com/product/three-sisters-peaks-tour/',
  marvel:'https://canmore.alpinehelicopter.com/product/marvel-pass-tour-2/',
  nakoda:'https://stoneynakoda.alpinehelicopter.com/',
  warrior:'https://stoneynakoda.alpinehelicopter.com/product/2022-trickster-i-ktomni-tour/',
  divide:'https://stoneynakoda.alpinehelicopter.com/product/2022-great-divide-othnikta-tour/',
  sleeping:'https://stoneynakoda.alpinehelicopter.com/product/2022-sleeping-warrior-istimabi-iyahe-tour/',
  cline:'https://www.rockiesheli.com/contact/',
  rockiesTours:'https://www.rockiesheli.com/heli-tours/',
  parks:'https://www.parcs.canada.ca/pn-np/ab/banff/securite-safety/regles-rules/vols-flights',
  law:'https://laws-lois.justice.gc.ca/PDF/SOR-97-150.pdf',
  roam:'https://roamtransit.com/schedules-routes/canmore-banff-regional-route-3/',
  road:'https://511.alberta.ca/',
};
const markers = {
  'banff-helicopter-tours':['Canmore Municipal Heliport, 91 Bow Valley Trail','888 Nakoda Way','Cline River and Highway 11, Clearwater County','Scenic flight','Flight with a named landing','Heli-ski or heli-snowboard day','all flights landing within Banff National Park require advance approval from the Superintendent','not a blanket statement that every overflight is prohibited','transfer from a wheelchair into the aircraft seat','separate accommodation affiliate links','Prepare one useful enquiry'],
  'kananaskis-heli-tours':['Stoney Nakoda base at 888 Nakoda Way','different meeting point from Canmore Municipal Heliport and from Kananaskis Village','Warrior Lookout','Spirit Water','Sleeping Warrior','Great Divide','directly rather than book it online','Public transport into Canmore is not evidence of a bus to Stoney Nakoda','This is a landing rule, not a blanket overflight ban','no hotel-and-helicopter package is implied'],
};
const bad = /\$\s*\d|\bCAD\s*\d|\b(?:\d+)\s*(?:–|-)\s*(?:\d+)\s*(?:minute|hour)|\bmedication\b|motion sickness|less turbulent|smooth ride|window seat|113\s*kg|250\s*(?:lb|pound)|(?:all|most) operators require 48|fully refunded|weather guarantees|clearest skies|Kananaskis Lakes Circuit|Mountain Explorer|Grand Rockies|Canadian Rockies Helicopter Tours|\b(?:I|we) (?:visited|flew|booked)\b|local.s note|Rockies Heli (?:Canada )?(?:departs|operates) from Kananaskis Village|Most operators launch from the Kananaskis Village|(?:Flights?|helicopters?) (?:are )?(?:banned|prohibited) (?:over|from flying over) Banff|closed October 14, 2026[–-]May 1, 2027/i;
const decode = value => value.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const plain = html => decode(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim());
function validate(slug,html,metadata) {
  assert.deepEqual(Object.keys(metadata).sort(),['title','description','lastUpdated','readTime','imageIsIllustrative','imageNote'].sort());
  assert.equal(metadata.lastUpdated,'2026-10-29');assert.equal(metadata.imageIsIllustrative,true);assert.match(metadata.imageNote,/Illustrative photograph; not a verified image/);
  assert.ok(metadata.title.length>35&&metadata.title.length<75&&metadata.description.length>100);
  assert.ok(!/2026|prices|discount|guarantee|best/i.test(metadata.title));
  const text=plain(html),words=text.split(' ').length;
  assert.ok(words>=1250&&words<2200,slug+': useful bounded full guide, found '+words+' words');
  assert.ok(!bad.test(text),'No inherited medical, price, physical guarantee, invented product/base, date or blanket flight claim.');
  for(const marker of [...markers[slug],'Full guide reviewed October 29, 2026','Winter 2025/2026','2026/27','past-season','separate','direct'])assert.ok(text.includes(marker),slug+': material distinction '+marker);
  assert.ok(!/<(?:iframe|form|embed|object)\b|\bonclick\s*=|<script(?! type="application\/ld\+json")|AggregateRating|ratingValue|"@type":"(?:Product|Offer)"/.test(html));
  assert.ok(!/partner_id=|camref=|[?&]tag=|data-gyg|data-affiliate-mount/.test(html),'No invented flight affiliate relationship or optional widget.');
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);assert.equal(new Set(ids).size,ids.length);
  assert.ok((html.match(/<h2\b/g)||[]).length>=8);
  const tables=[...html.matchAll(/<table>([\s\S]*?)<\/table>/g)];assert.equal(tables.length,slug==='banff-helicopter-tours'?2:1);
  for(const [,table]of tables){assert.ok(table.includes('<caption>')&&table.includes('<thead>')&&table.includes('<tbody>'));assert.ok((table.match(/scope="row"/g)||[]).length>=3);assert.ok((table.match(/scope="col"/g)||[]).length>=3);}
  let open=0;const hrefs=[];
  for(const [anchor]of html.matchAll(/<\/?a\b[^>]*>/g)){
    if(anchor.startsWith('</')){open--;assert.equal(open,0,'Balanced closing anchors');continue;}
    open++;assert.equal(open,1,'No nested anchors');const href=decode(anchor.match(/\bhref="([^"]+)"/)?.[1]||'');assert.ok(href);hrefs.push(href);
    if(href.startsWith('#'))assert.ok(ids.includes(href.slice(1)),'Existing fragment: '+href);
    else if(!href.startsWith('/')){const url=new URL(href);assert.equal(url.protocol,'https:');assert.ok(Object.values(primary).includes(href),'Exact verified operator/source URL: '+href);assert.equal(url.search,'');assert.equal(url.hash,'');assert.match(anchor,/target="_blank"/);assert.match(anchor,/rel="noopener"/);assert.ok(!anchor.includes('sponsored'),'Direct operator information is not an invented affiliate product.');}
  }
  assert.equal(open,0);
  for(const href of ['/blog/'+slugs.find(other=>other!==slug)+'/', '/blog/banff-heli-skiing/','/blog/banff-ski-touring/','/towns/canmore/','/towns/banff/','/winter','/what-to-do-today',primary.entry,primary.contact,primary.canmore,primary.nakoda,primary.marvel,primary.cline,primary.rockiesTours,primary.parks,primary.road])assert.ok(hrefs.includes(href),'Native source/visitor journey: '+href);
  for(const href of slug==='banff-helicopter-tours'?[primary.law,primary.threeSisters,'/book/banff-hotels/','/accessible-trails']:[primary.warrior,primary.divide,primary.sleeping,primary.roam,'/weather','/car-free-banff','/winter-stays'])assert.ok(hrefs.includes(href),'Distinct article-purpose handoff: '+href);
  const visible=[...html.matchAll(/<details><summary>([^<]+)<\/summary><p>([\s\S]*?)<\/p><\/details>/g)].map(([,question,answer])=>({question:decode(question),answer:decode(answer)}));
  assert.equal(visible.length,5);assert.deepEqual(visible,data.scenicFlightGuideFaqs[slug]);
  const blocks=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];assert.equal(blocks.length,1);
  const schema=JSON.parse(blocks[0][1]);assert.equal(schema['@context'],'https://schema.org');assert.equal(schema['@type'],'FAQPage');
  assert.deepEqual(schema.mainEntity.map(faq=>({question:faq.name,answer:faq.acceptedAnswer.text})),visible);
  assert.ok(schema.mainEntity.every(faq=>faq['@type']==='Question'&&faq.acceptedAnswer['@type']==='Answer'));
  return {words,hrefs};
}
for(const collection of [data.scenicFlightGuideOverrides,data.scenicFlightGuideMetadata,data.scenicFlightGuideFaqs])assert.deepEqual(Object.keys(collection),slugs);
assert.equal(data.reviewDate,'2026-10-29');assert.equal(new Set(Object.values(data.scenicFlightGuideMetadata).map(meta=>meta.title)).size,2);
assert.match(data.scenicFlightGuideMetadata['banff-helicopter-tours'].title,/Bases, Flights & Booking/);
assert.match(data.scenicFlightGuideMetadata['kananaskis-heli-tours'].title,/Stoney Nakoda Trip Guide/);
const results=[];
for(const slug of slugs){
  assert.equal(originals.find(post=>post.slug===slug)?.date,publications[slug],'Exact publication from the original raw array, not current merged metadata.');
  assert.equal(Object.hasOwn(data.blogRedirects,slug),false,'Keep canonical identity.');
  const body=data.scenicFlightGuideOverrides[slug],metadata=data.scenicFlightGuideMetadata[slug],result=validate(slug,body,metadata);results.push({slug,words:result.words,faqs:5});
  for(const href of result.hrefs.filter(href=>href.startsWith('/'))){
    const route=new URL(href,'https://banffbound.com').pathname.replace(/\/$/,'');
    if(route.startsWith('/blog/')){const target=route.slice(6);assert.ok(originals.some(post=>post.slug===target),'Existing original canonical: '+href);assert.equal(Object.hasOwn(data.blogRedirects,target),false,'Avoid retired aliases: '+href);}
    else if(route.startsWith('/towns/'))await access(path.join(root,'src/pages/towns/[slug].astro'));
    else{let exists=false;for(const filename of [path.join(root,'src/pages',route+'.astro'),path.join(root,'src/pages',route,'index.astro')])try{await access(filename);exists=true;}catch{}assert.ok(exists,'Existing visitor journey: '+href);}
  }
  for(const claim of ['Take medication 30 minutes before the flight.','Everyone gets a window seat.','A smooth ride is guaranteed.','The ticket costs $300.','The universal limit is 113 kg.','Rockies Heli departs from Kananaskis Village.','Most operators launch from the Kananaskis Village area.','Helicopters are banned over Banff.','The base is closed October 14, 2026–May 1, 2027.','We flew this route last winter.'])assert.throws(()=>validate(slug,body+'<p>'+claim+'</p>',metadata),'Reject inherited false claim: '+claim);
  assert.throws(()=>validate(slug,body.replace(primary.parks,'https://example.com/flight-rules'),metadata),'Reject unreviewed rule source.');
  assert.throws(()=>validate(slug,body.replace('"@type":"FAQPage"','"@type":"Article"'),metadata),'Require visible/FAQ schema contract.');
  assert.throws(()=>validate(slug,body.replace('<details><summary>','<details><summary>Changed question: '),metadata),'Reject visible/schema mismatch.');
  assert.throws(()=>validate(slug,body.replace('href="'+primary.entry+'"','href="javascript:alert(1)"'),metadata),'Reject unsafe native handoff.');
  assert.throws(()=>validate(slug,body,{...metadata,date:'2026-10-29'}),'Do not reset publication date.');
  assert.throws(()=>validate(slug,body,{...metadata,imageIsIllustrative:false}),'Do not imply route-photo identity.');
  assert.deepEqual((await transform(body,{filename:slug+'.astro'})).diagnostics.filter(diagnostic=>diagnostic.severity===1),[],'Actual generated article HTML compiles.');
}
const sourceRecord=await readFile(path.join(root,'research/scenic-flight-guide-sources-2026-10-29.md'),'utf8');
for(const href of Object.values(primary))assert.ok(sourceRecord.includes(href),'Exact source record: '+href);
for(const marker of ['PREPARED, NOT LIVE','raw `originalBlogPosts`','2025-10-12','2026-03-03','2026/27','September 30, 2026','2022-09-14','subsequent release','No network'])assert.ok(sourceRecord.toLowerCase().includes(marker.toLowerCase()),'Prepared/source scope: '+marker);
console.log('Scenic-flight guide checks passed: '+JSON.stringify(results)+'. Original raw publications/canonical IDs, distinct format/base journeys, 15 exact direct primary links, 10 visible/schema FAQs, dated source limits, illustrative metadata, negative false-claim/link/FAQ regressions and actual Astro fragment transforms. Prepared content only; no registry integration, network or site build.');
