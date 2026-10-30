import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { htmlFacts, htmlElements, schemaNodes, normal } from './verify-cycling-consent-release.mjs';

globalThis.fetch = () => { throw new Error('No network in this focused fall author check'); };
const root = fileURLToPath(new URL('../', import.meta.url)), filename = 'src/data/fallSeasonGuideOverrides.ts';
const postSource = await readFile(path.join(root, 'src/data/blogPosts.ts'), 'utf8');
const original = postSource.match(/const originalBlogPosts:\s*BlogPost\[\]\s*=\s*(\[[\s\S]*?\n\]);/)?.[1]; assert.ok(original);
const compiled = await build({ stdin: { contents: `export * from './${filename}';export {blogRedirects} from './src/data/redirects.mjs';export {towns} from './src/data/towns.ts';export {trails} from './src/data/trails.ts';export const originalPosts=${original};`, resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent' });
const d = await import('data:text/javascript;base64,' + Buffer.from(compiled.outputFiles[0].text).toString('base64'));
const publications = { 'fall-larch-season-banff': '2026-02-16', 'banff-in-fall': '2026-02-14' }, slugs = Object.keys(publications);
const referrals = { 'fall-larch-season-banff': 'https://www.getyourguide.com/banff-l284/?partner_id=QW960HO', 'banff-in-fall': 'https://www.expedia.ca/Hotel-Search?destination=Banff%2C+Alberta&camref=1101l3MtWX' };
const sources = [
  'https://www.banfflakelouise.com/fall',
  'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
  'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking/etat-sentiers-trail-conditions',
  'https://parks.canada.ca/pn-np/ab/banff/bulletins',
  'https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise',
  'https://www.skibanff.com/sunshinemeadows',
  'https://parks.canada.ca/pn-np/ab/banff/securite-safety/meteo-weather',
  'https://roamtransit.com/schedules-routes/lake-louise-banff-express-route-8x/',
  'https://roamtransit.com/fares/reservations/winter-reservations/',
  'https://www.whyte.org/',
  'https://parks.canada.ca/lhn-nhs/ab/caveandbasin',
  'https://parks.canada.ca/pn-np/ab/banff/sources-banff-springs',
  'https://parks.canada.ca/pn-np/ab/banff/bulletins/06d4ef61-a3c9-4b65-8dfc-66d056252d6c',
];
const bad = /\$\s*\d|\bCAD\s*\d|hotels are 20[–-]30% cheaper|90% fewer|all larch trails are quiet|all larch hikes are safe in winter|the peak is guaranteed on|the last week of September guarantees stable weather|groups of 4\+ are mandatory on Larch Valley all season|Healy Pass is reached by the Sunshine gondola|start before 8\s*a\.?m|mid-morning starts ensure a daylight return|morning light from 7[–-]10\s*a\.?m is always best|\b(?:I|we) (?:visited|hiked|stayed|photographed)\b|during my last visit/i;
const sections = {
  'fall-larch-season-banff': {
    'larch-timing': ['late September into early October','no live foliage feed, historical peak chart or year-specific forecast'],
    'larch-objective': ['separate published profiles','Saddleback is graded Difficult','not quieter or easier equivalents','pass profile already includes its approach','Healy Pass is not reached by shortening its hiking profile with the Sunshine gondola','lower base','closed for summer 2026','June 25–September 19, 2027','future summer dates'],
    'larch-arrival': ['different places','closed to personal vehicles year-round','specified authorized exceptions','2026 Parks lake-shuttle season ended October 12','do not copy that date into another year','turnaround plan','no occupancy prediction'],
    'larch-snow': ['mid-October to mid-June','Healy Pass needs its own snow-season assessment','does not turn the summer profiles into winter recommendations','another person’s tracks or traction devices do not assess a snow slope'],
    'larch-group': ['recommends travelling in tight groups of four or more','specific mandatory group order','Read the actual notice for the route','least experienced','Stay together'],
    'larch-photography': ['designated trail or viewpoint','no fixed morning clock','Keep paths and boarding areas clear','return plan ahead of one more photograph'],
    'larch-booking': ['Compare accommodation and transport together','trip-cost calculator','unknown amounts visibly unknown','search results, not a verified larch tour or a reservation','affiliate link','commission'],
  },
  'banff-in-fall': {
    'fall-dates': ['September and October','late September into early October','A hiking-led September trip','An early-October lake visit','A later-October stay','does not reserve better weather'],
    'fall-base': ['Lake Louise','village, lakeshore and ski-resort addresses are separate','Canmore','regional connection','no fixed autumn hotel discount or quieter-base guarantee'],
    'fall-journey': ['2026 lake shuttles ended October 12','restricts personal vehicles on Moraine Lake Road year-round','2026/27 fall and winter reservation information','not a ride to the ski-resort Park and Ride','does not include later-fall Moraine Lake access','complete return'],
    'fall-days': ['A mountain day with one chosen objective','A town day for art, history and food','A viewing day with time to pause','A table, show ticket and return bus are separate arrangements'],
    'fall-weather': ['Historical averages do not describe your travel week','no universal mid-morning start that ensures a daylight finish','headlamp and emergency supplies','does not make a snow-covered summer hike suitable'],
    'fall-notices': ['Checked October 29, 2026','October 13 to early November','does not confirm reopening','heritage site, not a substitute hot-pool booking','scheduled December 11, 2026 end','Reopening remains unconfirmed','June 25–September 19, 2027 as future dates'],
    'fall-budget': ['travel days, accommodation nights, people and rooms','same party, dates, currency and coverage','Leave unknown rows unknown','affiliate link','commission','No fixed seasonal discount'],
  },
};
function validate(slug, body, meta) {
  assert.deepEqual(Object.keys(meta).sort(), ['title','description','lastUpdated','readTime','imageIsIllustrative','imageNote'].sort()); assert.equal(meta.lastUpdated, '2026-10-29'); assert.equal(meta.imageIsIllustrative, true); assert.match(meta.imageNote, /Illustrative.*not verified/i); assert.ok(meta.description.length > 100);
  const html = '<html><head></head><body>' + body + '</body></html>', facts = htmlFacts(html), elements = htmlElements(html), headings = elements.filter(n => n.tag === 'h2');
  const words = facts.text.split(/\s+/).length; assert.ok(words >= 1200 && words <= 2500, slug + ': substantial distinct purpose: ' + words); assert.ok(!bad.test(facts.text), 'No unsupported timing/quiet/saving/route/guide/personal claim.'); assert.ok(headings.length >= 9); assert.ok(elements.some(n => n.tag === 'table'));
  const section = id => { const h = headings.find(n => n.attributes.id === id); assert.ok(h, 'Distinct section: ' + id); const next = headings.find(n => n.start > h.end); return normal(html.slice(h.end, next?.start ?? html.length).replace(/<[^>]*>/g,' ')); };
  for (const [id, markers] of Object.entries(sections[slug])) for (const marker of markers) assert.ok(section(id).includes(marker), `${slug} ${id} bounded decision: ${marker}`);
  assert.ok(facts.text.includes('Full guide reviewed October 29, 2026')); assert.ok(facts.text.includes('hero image is illustrative'));
  const ids = elements.map(n => n.attributes.id).filter(Boolean); assert.equal(ids.length, new Set(ids).size);
  const anchors = elements.filter(n => n.tag === 'a'); for (const a of anchors) { assert.ok(!anchors.some(p => p !== a && a.start >= p.openEnd && a.end <= p.innerEnd), 'No nested links.'); const href = a.attributes.href; assert.ok(href); if (href.startsWith('#')) assert.ok(ids.includes(href.slice(1))); else if (!href.startsWith('/')) { assert.ok([...sources, referrals[slug]].includes(href), 'Exact primary or inherited search route: ' + href); assert.equal(a.attributes.target,'_blank'); assert.ok((a.attributes.rel ?? '').split(/\s+/).includes('noopener')); assert.equal((a.attributes.rel ?? '').split(/\s+/).includes('sponsored'),href===referrals[slug]); } }
  for (const href of ['/larch-season/','/trip-cost/',referrals[slug],slug==='fall-larch-season-banff'?'/blog/banff-in-fall/':'/blog/fall-larch-season-banff/']) assert.ok(anchors.some(a => a.attributes.href===href), 'Authentic planner/cross-guide/search handoff: '+href);
  const faqs = facts.documents.flatMap(doc => schemaNodes(doc,'FAQPage')); assert.equal(faqs.length,1); assert.equal(faqs[0].mainEntity.length,5); assert.equal(facts.details.length,5);
  d.fallSeasonGuideFaqs[slug].forEach((f,i)=>{const actual=faqs[0].mainEntity[i]; assert.equal(actual['@type'],'Question');assert.equal(actual.acceptedAnswer['@type'],'Answer');assert.equal(normal(actual.name),normal(f.question));assert.equal(normal(actual.acceptedAnswer.text),normal(f.answer));assert.equal(facts.details[i].question,normal(f.question));assert.equal(facts.details[i].answer,normal(f.answer));});
  assert.ok(elements.filter(n=>n.tag==='script').every(n=>n.attributes.type==='application/ld+json'&&!n.attributes.src));assert.ok(!elements.some(n=>['iframe','form','embed','object'].includes(n.tag)));assert.equal(facts.documents.flatMap(doc=>schemaNodes(doc,'Article')).length,0);
  return {words,anchors};
}
assert.deepEqual(Object.keys(d.fallSeasonGuideOverrides),slugs);assert.deepEqual(Object.keys(d.fallSeasonGuideMetadata),slugs);assert.deepEqual(Object.keys(d.fallSeasonGuideFaqs),slugs);assert.equal(d.reviewDate,'2026-10-29');
const results=[];
for (const slug of slugs) {
  assert.equal(d.originalPosts.find(p=>p.slug===slug)?.date,publications[slug]);assert.ok(!d.blogRedirects[slug]);assert.equal(Object.values(d.blogRedirects).filter(v=>v===slug).length,0);
  const body=d.fallSeasonGuideOverrides[slug],meta=d.fallSeasonGuideMetadata[slug],result=validate(slug,body,meta);results.push({slug,...result});
  for(const a of result.anchors){if(!a.attributes.href.startsWith('/'))continue;const u=new URL(a.attributes.href,'https://banffbound.com'),route=u.pathname.replace(/\/$/,'');if(route.startsWith('/blog/')){assert.ok(d.originalPosts.some(p=>p.slug===route.slice(6)));assert.ok(!d.blogRedirects[route.slice(6)]);}else if(route.startsWith('/towns/'))assert.ok(d.towns.some(t=>t.slug===route.slice(7)));else if(route.startsWith('/trails/'))assert.ok(d.trails.some(t=>t.slug===route.slice(8)&&t.routeVerified));else{let exists=false;for(const file of [path.join(root,'src/pages',route+'.astro'),path.join(root,'src/pages',route,'index.astro')])try{await access(file);exists=true;}catch{}assert.ok(exists,'Existing internal handoff: '+a.attributes.href);}}
  for(const claim of ['Hotels are 20–30% cheaper.','90% fewer people.','All larch trails are quiet.','All larch hikes are safe in winter.','The peak is guaranteed on September 25.','The last week of September guarantees stable weather.','Groups of 4+ are mandatory on Larch Valley all season.','Healy Pass is reached by the Sunshine gondola.','Start before 8am.','Mid-morning starts ensure a daylight return.','We hiked here last September.','A tour costs $100.'])assert.throws(()=>validate(slug,body+'<p>'+claim+'</p>',meta),'Reject old/unsupported claim: '+claim);
  for(const [id,markers]of Object.entries(sections[slug]))assert.throws(()=>validate(slug,body.replaceAll(markers[0],'Missing reviewed body requirement'),meta),'FAQ cannot mask missing section requirement: '+id);
  assert.throws(()=>validate(slug,body.replace('<summary>'+esc(d.fallSeasonGuideFaqs[slug][0].question),'<summary>Different visible question'),meta),'Visible FAQ and schema must remain identical.');
  assert.throws(()=>validate(slug,body.replace(referrals[slug],referrals[slug].replace(slug==='fall-larch-season-banff'?'QW960HO':'1101l3MtWX','wrong')),meta),'Preserve exact authored referral identity.');
  assert.throws(()=>validate(slug,body.replaceAll('June 25–September 19, 2027','June 1–October 31, 2027'),meta));assert.throws(()=>validate(slug,body.replace('"@type":"FAQPage"','"@type":"WebPage"'),meta));assert.throws(()=>validate(slug,body,{...meta,date:'2026-10-29'}));assert.throws(()=>validate(slug,body,{...meta,imageIsIllustrative:false}));assert.throws(()=>validate(slug,body.replace('<a ','<a href="/winter/"><a ').replace('</a>','</a></a>'),meta));
  const raw=(await readFile(path.join(root,'src/data/blogContent.ts'),'utf8')).split("'"+slug+"': `")[1]?.split('\n`,')[0];assert.ok(raw?.includes(referrals[slug]),'Exact inherited authored referral preserved.');
}
const plannerSource=await readFile(path.join(root,'src/pages/larch-season.astro'),'utf8');assert.ok(plannerSource.includes('id="larch-planner"'),'Real fragment for source-owned larch planner handoffs.');
assert.notEqual(d.fallSeasonGuideMetadata[slugs[0]].title,d.fallSeasonGuideMetadata[slugs[1]].title);assert.notEqual(d.fallSeasonGuideOverrides[slugs[0]].match(/<p>(.*?)<\/p>/s)?.[1],d.fallSeasonGuideOverrides[slugs[1]].match(/<p>(.*?)<\/p>/s)?.[1]);
const source=await readFile(path.join(root,filename),'utf8');assert.equal((source.match(/function renderFaqs\(/g)??[]).length,1);assert.equal((source.match(/\$\{renderFaqs\('/g)??[]).length,2);
const note=await readFile(path.join(root,'research/fall-season-guide-sources-2026-10-29.md'),'utf8');for(const url of [...sources,...Object.values(referrals)])assert.ok(note.includes(url),'Source inventory: '+url);for(const marker of ['2026-02-16','2026-02-14','no fragment IDs','unreviewed','Registration','73','recommendation','2026/27','imageIsIllustrative'])assert.ok(note.includes(marker));
console.log('Fall season guide checks passed: '+results.map(r=>r.slug+' '+r.words+' words').join('; ')+'. Two distinct full bodies/metadata,10 matching visible/schema FAQs, original publications/exact referrals, primary source/season/transport/route/price boundaries, working canonical links, illustrative images and negative regressions. No network, registry expectation, site build, file output or shared-source mutation.');
