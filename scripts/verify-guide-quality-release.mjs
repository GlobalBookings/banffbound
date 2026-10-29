import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { build } from 'esbuild';
import { ORIGIN, ROOT, normal, htmlFacts, htmlElements, textInside, schemaNodes, analyseHtml, loadInventory, options, verify, selfTest as foundationSelfTest } from './verify-cycling-consent-release.mjs';

// Reuses the 193-route verifier's bounded GET/nonce/UTC receipt/sitemap/photo/wx
// engine. Only an explicit CLI invocation can request production; imports and
// --self-test never request production or write a receipt.
// node scripts/verify-guide-quality-release.mjs --revision <40hex> --fingerprint <64hex> --report research/<new-local.json>
// --built-dir <directory> reads emitted HTML/sitemaps/photos and a stable local
// build receipt; it does not assert deployed identity, HTTP status or redirects.
const EXPECTED_ROUTES = 228;
const PARTIAL_LABEL = 'Opening paragraph repaired (full guide review pending):';
const ORIGINAL_PUBLICATION = {
  'nightclub-banff':'2026-03-31', 'banff-nightclubs':'2026-04-08', 'new-places-to-eat-in-banff':'2026-04-03',
  'banff-clubs':'2026-04-06', 'banff-bars':'2026-03-28', 'golden-banff':'2026-05-17', 'jasper-town':'2026-04-08',
  'jasper-national-park':'2026-04-06', 'deals-in-banff':'2026-04-14', 'johnsons-canyon':'2026-04-11',
  'calgary-to-jasper':'2026-04-11', 'numtijah-lodge':'2026-03-08', 'num-ti-jah-lodge':'2026-03-04',
};
const FULL_PUBLICATION = {
  'num-ti-jah-lodge':'2026-03-04', 'numtijah-lodge':'2026-03-08',
  'jasper-national-park':'2026-04-06', 'jasper-town':'2026-04-08', 'jasper-canada':'2026-04-06',
  'new-places-to-eat-in-banff':'2026-04-03', 'banff-cabin-rentals':'2026-01-07',
  'banff-nightlife-guide':'2026-02-10', 'banff-live-music':'2026-05-28', 'drink-deals':'2026-03-14',
  'icefields-parkway-guide':'2026-01-05', 'banff-to-jasper-drive':'2026-02-08', 'lake-minnewanka-guide':'2026-02-18',
  'banff-gondola-guide':'2026-02-02', 'banff-gondola-tickets-guide':'2026-03-01',
};
const PARTIAL_PUBLICATION = Object.fromEntries(Object.entries(ORIGINAL_PUBLICATION).filter(([slug])=>!Object.hasOwn(FULL_PUBLICATION,slug)));
const jasperContextSlugs=['jasper-town','jasper-national-park','jasper-canada','jasper-alberta','calgary-to-jasper'];
const bowContextSlugs=['numtijah-lodge','num-ti-jah-lodge'];
function expectedBookingContext(slug,authored=false){
  const jasper=jasperContextSlugs.includes(slug),bow=bowContextSlugs.includes(slug),hotelLabel=jasper?'Jasper':bow?'Lake Louise area':'Banff',tourLabel=jasper?'Jasper':bow?'Lake Louise':'Banff';
  return {hotelLabel,tourLabel,hotelHref:'https://www.expedia.ca/Hotel-Search?destination='+encodeURIComponent(jasper?'Jasper, Alberta':bow?'Lake Louise, Alberta':'Banff, Alberta')+'&camref=1101l3MtWX',tourHref:jasper||bow?'https://www.getyourguide.com/s/?q='+encodeURIComponent(tourLabel+', Alberta')+'&partner_id=QW960HO&cmp=banffboundblog':'https://www.getyourguide.com/banff-l284/?partner_id=QW960HO&cmp=banffboundblog',suppressAutomaticCTA:authored||jasper||bow};
}
const hasClass = (node,name) => (node.attributes.class ?? '').split(/\s+/).includes(name);
const inside = (node,parent) => node.start >= parent.openEnd && node.end <= parent.innerEnd;
const isoDate = date => `${date}T00:00:00.000Z`;
const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
async function moduleData(contents) {
  const result = await build({stdin:{contents,resolveDir:ROOT},absWorkingDir:ROOT,bundle:true,write:false,platform:'node',format:'esm',logLevel:'silent'});
  return import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
}
async function localArray(relative,name) {
  const source = await readFile(path.join(ROOT,relative),'utf8');
  const frontmatter = source.split('---')[1] ?? '';
  const match = frontmatter.match(new RegExp(`^const ${name} = (\\[[\\s\\S]*?\\]);`, 'm'));
  assert.ok(match,`Expected local literal ${name} in ${relative}`);
  return (await moduleData(`export const value = ${match[1]};`)).value;
}
const control = (id,tag,attributes={}) => ({id,tag,attributes});
const commonTownControls = ['where-to-stay','getting-around','winter-day','seasonal-limits','other-seasons','questions','official-sources'].map(id=>control(id,'section'));
const plainFragment = value => normal(String(value).replace(/<[^>]*>/g,' '));
const fullMarkers = {
  'num-ti-jah-lodge': {water:'paddling, large inflatables and motorized boating as prohibited',zone:'Water Preservation Zone',connectivity:'no telephones, TVs or Wi-Fi',season:'Chalet accommodation from winter 2027'},
  'numtijah-lodge': {water:'paddling, large inflatables and motorized boating as prohibited',zone:'Water Preservation Zone',history:'1922',cafe:'closed for the season',route:'3.8 kilometres one way'},
  'jasper-national-park': {closure:'Cavell Road and Maligne Canyon remain closed for the 2026 season.',winterClosure:'including winter recreation in the canyon.',fiveLakes:'Wetland Way',emerald:'5.4 km loop',valley:'7.7 km loop',geography:'approximately 232 km'},
  'jasper-town': {recovery:'Jasper is rebuilding after the 2024 wildfire.',closure:"Maligne Canyon's current closure includes winter recreation",geography:'community inside Jasper National Park'},
  'jasper-canada': {geography:'Highway 16 / Yellowhead',endpoints:'approximately 232 km',closure:"Parks Canada's closure prohibits winter recreation there.",arrival:'Edmonton suits a Jasper-first plan via Highway 16.'},
  'new-places-to-eat-in-banff': {date2025:'reopened in December 2025',date2026:'reopened after renovation in April 2026',dateEvidence:'August 20, 2025',otherLocation:'Fairmont Chateau Lake Louise, 111 Lake Louise Drive'},
  'banff-cabin-rentals': {scope:'These are selected examples, not an exhaustive ranking or live room inventory.',defaultCount:'6 cabin-category examples to compare',categories:'Historic-cabin season and winter-suite statements',disclosure:'BanffBound may earn a commission from qualifying Expedia bookings.'},
  'banff-nightlife-guide': {identity:'120 Banff Avenue',age:'18+ entry condition',minors:'no minors are allowed after 10pm',booking:'separate dining and bowling reservations',source:'Guide reviewed October 29, 2026.',season:'fall/winter seasonal service',count:'5 evening formats to explore',journey:'last useful departure'},
  'banff-live-music': {source:'Fully reviewed October 29, 2026',age:'minors welcome until 9:30 p.m.',table:'A table reservation can establish a meal without show admission.',tickets:'original PDF rather than a screenshot',identity:'201 Banff Avenue #2',hotel:'No recurring hotel jazz programme is established by this guide.',journey:'A show ending late can outlast the bus service.'},
  'drink-deals': {source:'Offers checked October 29, 2026.',afternoon:'2–5 p.m.',late:'9–11 p.m.',conflict:'conflicting weekday bowling happy-hour times',holidays:'not available on holidays or long weekends',lane:'A table confirmation does not establish a reserved lane.',skyTime:'Summit Hours from 3–5 p.m.',skyOffer:'50% off local beer, house wine and selected shareable plates',admission:'book Banff Gondola admission separately'},
  'icefields-parkway-guide': {source:'Fully reviewed October 29, 2026',purpose:'choose the stops',origin:'Highway 1 / Highway 93N junction',bow:'36 km north of the junction',peyto:'40 km north of the junction',mistaya:'72 km north of the junction',fuel:'all services are closed for winter',future:'April 2027',tires:'November 1–March 31',glacier:'crossing the barriers onto the Athabasca Glacier',water:'where paddling is prohibited'},
  'banff-to-jasper-drive': {source:'Fully reviewed October 29, 2026',purpose:'the transfer and overnight decisions',route:'approximately 232 km between Lake Louise and Jasper',fuel:'all services are closed for winter',tires:'November 1–March 31',equipment:'snowflake or M+S',transport:'October 2025–April 2026 season',newSeason:'actual 2026/27 date',closure:'winter recreation in Maligne Canyon is prohibited'},
  'lake-minnewanka-guide': {source:'Fully reviewed October 29, 2026',road:'western section of Minnewanka Loop Road closed to driving from November to May',approach:'eastern side via Two Jack Lake',ice:'does not monitor natural ice for safety',zone:'Special Tactics Zone',personal:'Personal canoes, kayaks, paddleboards and large inflatables are prohibited.',rental:'specific exceptions for authorized rental watercraft',fishing:'May 16–September 7, 2026',boats:'ticket office, boat rentals and Black Anchor closed for the 2026 season'},
  'banff-gondola-guide': {source:'Full guide reviewed October 29, 2026',access:'368 shallow stairs each way and is not wheelchair accessible',limits:'31 inches wide by 41 inches long',weight:'320 kg total weight limit',warmth:'gondola cabins are unheated',hike:'5.5 km one way and 655 m of elevation gain',dining:'require separate gondola admission'},
  'banff-gondola-tickets-guide': {source:'Full guide reviewed October 29, 2026',product:'256607',supplier:'Pursuit Collection',terms:'non-refundable',dining:'separate Banff Gondola admission',descent:'paid one-way trip down',stairs:'368 shallow stairs each way and is not wheelchair accessible'},
};
const diningSections = [
  {id:'good-folk',markers:['#1000–600 Banff Avenue','inside the Otter Hotel','August 20, 2025'],href:'https://goodfolkrestaurant.com/'},
  {id:'crave',markers:['201 Lynx Street','reopened in December 2025'],href:'https://cravebanff.com/'},
  {id:'la-terrazza',markers:['reopened after renovation in April 2026'],href:'https://www.banffparklodge.com/la-terrazza/'},
  {id:'sudden-sally',markers:['#2000–600 Banff Avenue','Hotel Canoe & Suites'],href:'https://suddensally.com/'},
  {id:'pizzeria-sophia',markers:['202 Caribou Street','recommends reservations and welcomes walk-ins'],href:'https://www.pizzeriasophiabanff.com/reservations'},
  {id:'fat-ox',markers:['415 Banff Avenue','No opening year is asserted'],href:'https://fatoxbanff.ca/'},
];
function fullReviewChecks(d) {
  const metadata={...d.bowLakeGuideMetadata,...d.jasperGuideMetadata,...d.diningGuideMetadata,...d.cabinGuideMetadata,...d.nightlifeGuideMetadata,...d.liveMusicGuideMetadata,...d.drinkOfferGuideMetadata,...d.parkwayGuideMetadata,...d.minnewankaGuideMetadata,...d.gondolaGuideMetadata};
  assert.deepEqual(Object.keys(metadata).sort(),Object.keys(FULL_PUBLICATION).sort());
  assert.equal(Object.keys(d.reviewedBlogBodies).length,67,'Current registry has67 full reviews; historical receipts remain versioned.');
  assert.equal(Object.keys(d.blogRedirects).length,40);assert.equal(d.blogRedirects['norquay-ski-shuttle'],'mt-norquay-guide');
  assert.equal(d.cabinExamples.length,6);assert.equal(d.compareCabinStays({}).selectedIds.length,6);assert.equal(d.compareCabinStays({season:'winter'}).selectedIds.length,4);
  const verifiedIds={'tunnel-mountain-cabin':'16324','baker-family-cabin':'7710611','paradise-wilson-cabin':'7829397'};
  assert.equal(d.cabinExamples.filter(c=>c.affiliate).length,3);
  for(const c of d.cabinExamples.filter(c=>c.affiliate)){const u=new URL(c.bookingHref);assert.equal(u.hostname,'www.expedia.ca');assert.equal(u.pathname.match(/\.h(\d+)\.Hotel-Information/)?.[1],verifiedIds[c.id]);assert.equal(u.searchParams.get('camref'),'1101l3MtWX');}
  return Object.entries(FULL_PUBLICATION).map(([slug,date])=>{
    const post=d.allBlogPosts.find(p=>p.slug===slug),meta=metadata[slug];
    assert.ok(post&&!d.blogRedirects[slug]);assert.equal(post.date,date);assert.equal(meta.lastUpdated,'2026-10-29');for(const key of ['date','datePublished','publishedDate'])assert.ok(!Object.hasOwn(meta,key),'Full reviews must not reset publication.');
    assert.equal(post.title,meta.title);assert.equal(post.lastUpdated,meta.lastUpdated);assert.equal(post.imageIsIllustrative,true);assert.ok(post.imageNote);
    const bodyHtml=d.resolveBlogContent(slug),facts=htmlFacts(`<html><body>${bodyHtml}</body></html>`),schemas=facts.documents.flatMap(doc=>schemaNodes(doc,'FAQPage'));
    assert.equal(schemas.length,1,slug+': source must emit one FAQPage');
    const faqArrays={'banff-cabin-rentals':d.cabinGuideFaqs,'new-places-to-eat-in-banff':d.diningGuideFaqs,'banff-nightlife-guide':d.nightlifeGuideFaqs,'banff-live-music':d.liveMusicGuideFaqs,'drink-deals':d.drinkOfferGuideFaqs,'lake-minnewanka-guide':d.minnewankaGuideFaqs};
    const fullFaqs=d.jasperGuideFaqs[slug]??d.parkwayGuideFaqs[slug]??d.gondolaGuideFaqs[slug]??faqArrays[slug]??schemas[0].mainEntity.map(q=>({question:q.name,answer:q.acceptedAnswer.text}));
    assert.equal(fullFaqs.length,['jasper-national-park','jasper-town','jasper-canada'].includes(slug)?3:['numtijah-lodge','banff-live-music'].includes(slug)?4:5);
    const quality={type:'full',slug,bodyHtml,description:meta.description,published:date,corrected:meta.lastUpdated,imageNote:post.imageNote,fullFaqs};
    if(slug==='new-places-to-eat-in-banff')quality.diningSections=diningSections;
    if(slug==='banff-cabin-rentals'){
      quality.controls=[control('cabin-fit-form','form',{hidden:true}),...['base','season','kitchen'].map(key=>control(`cabin-${key}`,'select')),control('cabin-fit-count','p',{role:'status','aria-live':'polite'}),control('cabin-fit-notes','div'),control('cabin-fit-empty','div',{hidden:true})];
      quality.cards={attribute:'data-cabin-id',items:d.cabinExamples.map(c=>({id:c.id,href:c.bookingHref,text:[c.name,c.room,c.cooking,c.seasonNote,c.journey]}))};
      quality.cabinNative=d.cabinExamples.map(c=>({id:c.id,href:c.bookingHref,affiliate:c.affiliate}));quality.cabinOptions=d.cabinFilterOptions;
    }
    if(slug==='banff-nightlife-guide'){
      const defaultEvening=d.buildEveningPlan();assert.equal(d.eveningFormats.length,5);assert.equal(defaultEvening.selectedIds.length,5);assert.equal(defaultEvening.filters.base,'banff');assert.equal(defaultEvening.steps.length,3);
      quality.controls=[control('evening-planner','section'),control('evening-fit-form','form',{hidden:true}),...['style','group','base'].map(key=>control(`evening-${key}`,'select')),control('evening-fit-count','p',{role:'status','aria-live':'polite'}),control('evening-fit-notes','div'),control('evening-fit-empty','div',{hidden:true}),control('evening-steps','ol'),control('evening-journey-link','a')];
      quality.cards={attribute:'data-evening-id',items:d.eveningFormats.map(f=>({id:f.id,href:f.href,text:[f.name,f.idea,f.booking,f.groupNote]}))};
      quality.evening={options:d.eveningFilterOptions,...defaultEvening};
    }
    if(slug==='banff-gondola-tickets-guide'){
      const offer=d.winterActivityOffers.find(o=>o.id==='gyg-256607');assert.ok(offer);const url=new URL(offer.bookingUrl);assert.equal(url.hostname,'www.getyourguide.com');assert.match(url.pathname,/-t256607\/$/);assert.equal(url.searchParams.get('partner_id'),'QW960HO');
      quality.gondolaProduct={href:offer.bookingUrl,id:'256607'};
    }
    return {path:`/blog/${slug}/`,kind:'full-guide-review',name:post.title,noindex:false,publishedDate:date,modifiedDate:meta.lastUpdated,affiliateKinds:['expedia-banner','gyg-auto'],markers:fullMarkers[slug],links:[...new Set(facts.links)],quality};
  });
}

export async function loadGuideInventory() {
  const foundation = await loadInventory();
  assert.equal(foundation.checks.length,193);assert.equal(foundation.photos.length,7);
  const d = await moduleData("export {allBlogPosts} from './src/data/blogPosts.ts'; export {blogRedirects} from './src/data/redirects.mjs'; export {resolveBlogContent,reviewedBlogBodies,authoredBookingGuideSlugs} from './src/data/blogContentRegistry.ts'; export * from './src/data/legacyTextCorrections.ts'; export * from './src/data/lessonPlanning.ts'; export * from './src/data/skiPlanning.ts'; export {towns} from './src/data/towns.ts'; export * from './src/data/townStayPlanning.ts'; export {bowLakeGuideMetadata} from './src/data/bowLakeGuideOverrides.ts'; export {jasperGuideMetadata,jasperGuideFaqs} from './src/data/jasperGuideOverrides.ts'; export {diningGuideMetadata,diningGuideFaqs} from './src/data/diningGuideOverrides.ts'; export {cabinGuideMetadata,cabinGuideFaqs} from './src/data/cabinGuideOverrides.ts'; export * from './src/data/cabinPlanning.ts'; export {nightlifeGuideMetadata,nightlifeGuideFaqs} from './src/data/nightlifeGuideOverrides.ts'; export {liveMusicGuideMetadata,liveMusicGuideFaqs} from './src/data/liveMusicGuideOverrides.ts'; export {drinkOfferGuideMetadata,drinkOfferGuideFaqs} from './src/data/drinkOfferGuideOverrides.ts'; export * from './src/data/eveningPlanning.ts'; export {parkwayGuideMetadata,parkwayGuideFaqs} from './src/data/parkwayGuideOverrides.ts'; export {minnewankaGuideMetadata,minnewankaGuideFaqs} from './src/data/minnewankaGuideOverrides.ts'; export {gondolaGuideMetadata,gondolaGuideFaqs} from './src/data/gondolaGuideOverrides.ts'; export * from './src/data/parkwayPlanning.ts'; export {winterActivityOffers} from './src/data/winterActivityLanding.ts'; export {getArticleBookingContext} from './src/data/articleBookingContext.ts';");
  assert.deepEqual(Object.keys(d.legacyTextCorrections).sort(),Object.keys(PARTIAL_PUBLICATION).sort());
  assert.equal(d.legacyTextCorrectionDate,'2026-10-29');
  const additions = Object.entries(PARTIAL_PUBLICATION).map(([slug,date])=>{
    const post=d.allBlogPosts.find(post=>post.slug===slug),repair=d.legacyTextCorrections[slug];
    assert.ok(post&&!d.blogRedirects[slug]);assert.equal(post.date,date,'Original publication must remain: '+slug);assert.equal(post.lastUpdated,undefined,'Partial repair cannot reset guide-wide metadata: '+slug);
    assert.equal(repair.correctedAt,d.legacyTextCorrectionDate);assert.equal(repair.paragraph,'opening paragraph');
    const openingHtml=d.resolveBlogContent(slug).match(/<p\b[^>]*>[\s\S]*?<\/p>/i)?.[0];assert.ok(openingHtml);
    return {path:`/blog/${slug}/`,kind:'legacy-text-repair',name:post.title,noindex:false,publishedDate:date,modifiedDate:repair.correctedAt,affiliateKinds:['expedia-banner','gyg-auto'],markers:{partialCorrection:PARTIAL_LABEL},quality:{type:'partial',description:post.description,published:date,corrected:repair.correctedAt,openingHtml,opening:normal(openingHtml.replace(/<[^>]*>/g,' '))}};
  });
  additions.push(...fullReviewChecks(d));
  const contextPost=d.allBlogPosts.find(p=>p.slug==='jasper-alberta');assert.ok(contextPost&&!d.blogRedirects[contextPost.slug]);
  additions.push({path:'/blog/jasper-alberta/',kind:'article-booking-context',name:contextPost.title,noindex:false,affiliateKinds:['expedia-banner','gyg-auto'],quality:{type:'context'}});
  assert.equal(d.authoredBookingGuideSlugs.length,15);
  for(const check of additions){const slug=check.path.split('/')[2],authored=d.authoredBookingGuideSlugs.includes(slug),expected=expectedBookingContext(slug,authored);assert.deepEqual(d.getArticleBookingContext(slug,authored),expected);if(expected.suppressAutomaticCTA)check.quality.bookingContext=expected;}
  assert.equal(additions.filter(c=>c.quality.bookingContext).length,17);
  const hubLinks=[{href:'/blog/banff-nightlife-guide/#evening-planner',label:'Build your Banff evening'},{href:'/blog/new-places-to-eat-in-banff/',label:'Find a dining discovery'},{href:'/blog/banff-live-music/',label:'Find music or a show'},{href:'/blog/drink-deals/',label:'Compare current offer formats'}];
  additions.push({path:'/eat-and-drink/',kind:'dining-evening-hub',name:'Eat & Drink in Banff & Beyond',noindex:false,markers:{eveningNavigation:'Give your evening a shape',offerPlanning:'Compare the whole offer'},links:[...hubLinks.map(l=>l.href),'/book/banff-hotels/'],quality:{type:'dining-hub',hubLinks,hotelHref:'/book/banff-hotels/'}});
  const parkwayPairs={'lake-louise':[0,233],'herbert-lake':[6,227],'hector-viewpoint':[19,214],crowfoot:[36,197],'bow-lake':[39,194],peyto:[43,190],mistaya:[74,159],crossing:[80,153],'parker-ridge':[121,112],'icefield-centre':[130,103],'tangle-falls':[137,96],sunwapta:[179,54],'athabasca-falls':[203,30],jasper:[233,0]};
  assert.equal(d.parkwayStops.length,14);assert.deepEqual(d.parkwayStops.map(s=>s.id).sort(),Object.keys(parkwayPairs).sort());for(const stop of d.parkwayStops)assert.deepEqual([stop.fromLouiseKm,stop.fromJasperKm],parkwayPairs[stop.id],'Official map community-distance pair: '+stop.id);
  const initialParkway=d.buildParkwayPlan();assert.deepEqual(initialParkway.filters,{direction:'north',season:'winter',interest:'scenic'});assert.deepEqual(initialParkway.selectedIds,[]);assert.equal(initialParkway.checklist.length,3);assert.equal(d.parkwayFaqs.length,6);
  additions.push({path:'/icefields-parkway-planner/',kind:'parkway-planner',name:'Plan your Icefields Parkway stops',noindex:false,modifiedDate:d.parkwayReviewedAt,reviewDate:'29 October 2026',faqs:d.parkwayFaqs,markers:{defaultSelection:'14 places documented · no optional stops selected',distanceScope:'Approximate map distances from Lake Louise village.',winterFuel:'Prepare for no en-route fuel and no dependable walk-in services.',tires:'snow tires or chains November 1–March 31',futureFuel:'planned April 2027 return has no confirmed day',scope:'A rental booking does not establish that the Parkway or any stop is open.'},links:[...Object.values(d.parkwaySources),'https://expedia.com/affiliate/KB6G4xt','/conditions/','/blog/banff-winter-driving/','/blog/icefields-parkway-guide/','/blog/banff-to-jasper-drive/','/book/lake-louise-stays/','/blog/jasper-town/','/blog/jasper-national-park/'],quality:{type:'parkway',controls:[control('parkway-form','form',{hidden:true}),...['direction','season','interest'].map(key=>control(`parkway-${key}`,'select')),control('parkway-status','p',{role:'status','aria-live':'polite'}),control('parkway-origin','p'),control('parkway-notes','div'),control('parkway-shortlist','ul'),control('parkway-stops','div'),control('parkway-checklist','ol'),control('parkway-copy','button',{hidden:true,type:'button'}),control('parkway-copy-status','p',{role:'status','aria-live':'polite'}),control('parkway-copy-fallback','div',{hidden:true}),control('parkway-brief','textarea',{readonly:true})],cards:{attribute:'data-parkway-id',items:d.parkwayStops.map(s=>({id:s.id,href:s.href,text:[s.name,s.idea,s.winter,s.summer]}))},parkway:{stops:d.parkwayStops,options:d.parkwayFilterOptions,initial:initialParkway,carHref:'https://expedia.com/affiliate/KB6G4xt'}}});
  const lessonFaqs=await localArray('src/pages/learn-to-ski.astro','faqs');
  const plannerFaqs=await localArray('src/pages/ski-day-planner.astro','faqs');
  const townFaqs=await localArray('src/pages/towns/index.astro','faqs');
  assert.equal(lessonFaqs.length,7);assert.equal(plannerFaqs.length,5);assert.equal(d.lessonProgrammes.length,8);
  for(const programme of d.lessonProgrammes){const url=new URL(programme.url);assert.equal(url.protocol,'https:');assert.ok(['banffnorquay.com','www.skilouise.com','www.skibanff.com'].includes(url.hostname),'Lesson cards retain direct school information links.');}
  const defaultPlan=d.makeSkiDayPlan(d.defaultSkiChoices);
  assert.equal(defaultPlan.key,'norquay');
  const family=d.makeSkiDayPlan({...d.defaultSkiChoices,group:'children'});
  assert.equal(family.key,null);assert.equal(family.resort.name,'Choose a suitable snow school first');assert.equal(family.resort.lessonUrl,'/learn-to-ski/#lesson-fit');
  for(const resort of ['norquay','louise','sunshine'])assert.equal(d.makeSkiDayPlan({...d.defaultSkiChoices,group:'children',resort}).key,resort);
  additions.push(
    {path:'/learn-to-ski/',kind:'lesson-planner',name:'Learn to ski in Banff',noindex:false,faqs:lessonFaqs,markers:{sourceReview:'Lesson product information reviewed October 29, 2026',scope:'Results identify age bands to enquire about, not confirmed suitability, places or operating dates.'},links:d.lessonSchoolContacts.map(s=>s.url),quality:{type:'lesson',controls:[control('lesson-fit-form','form',{hidden:true}),control('lesson-age','input',{type:'number',min:'1',max:'120'}),control('lesson-sport','select'),control('lesson-format','select'),control('lesson-fit-count','p',{role:'status','aria-live':'polite'}),control('lesson-fit-empty','div',{hidden:true}),control('lesson-fit-error','p',{hidden:true,role:'alert'}),control('copy-lesson-options','button',{type:'button'}),control('lesson-copy-fallback','div',{hidden:true}),control('first-lesson-checklist','ul')],cards:{attribute:'data-lesson-id',items:d.lessonProgrammes.map(p=>({id:p.id,href:p.url,text:[p.name,p.ageLabel,p.includes,p.check]}))},checklist:{id:'first-lesson-checklist',count:7}}},
    {path:'/ski-day-planner/',kind:'ski-day-planner',name:'Your Banff ski day',noindex:false,faqs:plannerFaqs,markers:{childReview:'Child lesson-age handoff reviewed October 29, 2026',defaultResort:defaultPlan.resort.name,scope:'it does not provide live lift, snow or shuttle information.'},links:[defaultPlan.resort.lessonUrl,defaultPlan.resort.transportUrl,defaultPlan.resort.officialUrl],quality:{type:'planner',controls:[control('ski-planner','form',{hidden:true}),...['ski-ability','ski-base','ski-resort','ski-transport','ski-group'].map(id=>control(id,'select')),control('ski-result-heading','h2'),control('ski-day-timeline','ol'),control('ski-update-status','p',{role:'status','aria-live':'polite'}),control('share-ski-plan','button',{type:'button'}),control('print-ski-plan','button',{type:'button'}),control('reset-ski-plan','button',{type:'button'}),control('ski-share-fallback','div',{hidden:true}),control('ski-ready-list','ul')],timelineCount:defaultPlan.timeline.length,operatorLinks:[['ski-operator-link',defaultPlan.resort.lessonUrl],['ski-transport-link',defaultPlan.resort.transportUrl],['ski-report-link',defaultPlan.resort.officialUrl]],checklist:{id:'ski-ready-list',count:6}}},
    {path:'/towns/',kind:'town-index',name:'Banff & the mountain towns.',noindex:false,faqs:townFaqs,links:d.towns.map(t=>`/towns/${t.slug}/`),markers:{sourceScope:'Guides researched 28 October 2026.'},quality:{type:'town-index',controls:[control('base-match','p',{'aria-live':'polite'})],townPriorities:['all','car-free','ski','family','quiet'],townCount:6}},
  );
  assert.equal(d.towns.length,6);assert.deepEqual(d.towns.map(t=>t.slug).sort(),['banff','canmore','field-yoho','golden','kananaskis','lake-louise']);
  assert.equal(d.canmoreStayExamples.length,6);assert.equal(d.buildCanmoreStayPlan({priority:'town-walking'}).selectedIds.length,2);assert.equal(d.buildCanmoreStayPlan({priority:'full-cooking'}).selectedIds.length,5);assert.deepEqual(d.buildCanmoreStayPlan({priority:'regional-road'}).selectedIds,['copperstone-resort']);
  for(const town of d.towns){
    const booking=d.townBookingJourneys[town.slug],resort=d.townResortJourneys[town.slug];
    const searchUrl=`https://www.expedia.ca/Hotel-Search?destination=${encodeURIComponent(town.hotelArea==='Downtown Banff'?'Banff, Alberta':town.hotelArea)}&camref=1101l3MtWX`;
    const quality={type:'town',controls:[...commonTownControls],searchUrl,taggedLinks:[],noSkiPlanner:Boolean(resort)||town.slug==='field-yoho'};
    if(booking)quality.taggedLinks.push({attribute:'data-town-booking-comparison',href:booking.href,external:false});
    if(resort)quality.taggedLinks.push({attribute:'data-town-resort-lessons',href:resort.lessons,external:true},{attribute:'data-town-resort-arrival',href:resort.arrival,external:true});
    const markers={intro:town.intro,sourceScope:'These sources provide current operating details; this guide is not a live conditions report.'};
    const links=town.sources.map(s=>s.href);
    if(town.slug==='canmore'){
      quality.controls.push(control('canmore-stay-form','form',{hidden:true}),...['canmore-priority','canmore-season','canmore-transport'].map(id=>control(id,'select')),control('canmore-stay-count','p',{role:'status','aria-live':'polite','aria-atomic':'true'}),control('canmore-stay-notes','div'));
      quality.cards={attribute:'data-canmore-stay-id',linkAttribute:'data-canmore-profile',items:d.canmoreStayExamples.map(e=>({id:e.slug,href:`/hotel-directory/${e.slug}/`,text:[e.area,e.fit,e.room,e.tradeoff,e.journey]}))};
      quality.boundaryLocationOnly=true;
      markers.roomScope='Priority narrows the room examples. Season and transport change the journey checklist; they do not confirm room availability or a suitable connection.';
      markers.winterNordic=d.buildCanmoreStayPlan().notes.find(note=>note.startsWith('Winter Nordic leg'));
      links.push(...d.townStayPlanningSources.map(s=>s.href));
    }
    if(d.townStayUpdatedSlugs.includes(town.slug))markers.journeyScope='Stay/transport journey updated';
    additions.push({path:`/towns/${town.slug}/`,kind:'town-guide',name:town.name,noindex:false,...(d.townStayUpdatedSlugs.includes(town.slug)?{modifiedDate:d.townStayPlanningReviewedAt}:{}),faqs:town.faqs,markers,links,quality});
  }
  assert.equal(additions.length,35);assert.equal(additions.filter(c=>c.kind==='legacy-text-repair').length,8);assert.equal(additions.filter(c=>c.kind==='full-guide-review').length,15);
  const checks=[...foundation.checks,...additions];assert.equal(checks.length,EXPECTED_ROUTES);assert.equal(new Set(checks.map(c=>c.path)).size,EXPECTED_ROUTES,'Supplements must not replace or double-count foundation routes.');
  for(const base of foundation.checks)assert.equal(checks.find(c=>c.path===base.path),base,'Every foundation check is preserved.');
  return {...foundation,checks,releaseScope:{legacyOpeningRepairs:8,newFullGuides:15,totalFullReviews:67,lessonAndDayPlanners:2,townPages:7,contextOnlyGuides:1,eveningDiningHubs:1,parkwayPlanners:1,curatedBookingContextPages:17,canonicalAliases:40},supplementData:{lessonProgrammes:d.lessonProgrammes,defaultPlan,family}};
}

export function analyseGuideHtml(html,check,sitemap,headerRobots='') {
  const result=analyseHtml(html,check,sitemap,headerRobots),q=check.quality;
  if(!q)return result;
  const elements=htmlElements(html).filter(n=>!n.inert),facts=htmlFacts(html),errors=result.errors;
  const byId=id=>elements.filter(n=>n.attributes.id===id);
  const visibleLinks=elements.filter(n=>n.tag==='a'&&!n.hidden&&!n.noscript&&n.attributes.href);
  if(q.bookingContext){
    const bodies=elements.filter(n=>hasClass(n,'article-body'));
    if(bodies.length!==1||bodies[0].attributes['data-curated-booking']!=='true')errors.push('Missing curated booking SSR suppression flag');
    for(const [kind,href,label]of [['expedia-banner',q.bookingContext.hotelHref,q.bookingContext.hotelLabel],['gyg-auto',q.bookingContext.tourHref,q.bookingContext.tourLabel]]){
      const slots=elements.filter(n=>n.attributes['data-affiliate-embed']===kind),links=slots.length===1?visibleLinks.filter(n=>inside(n,slots[0])):[];
      if(links.length!==1||links[0].attributes.href!==href||!textInside(html,links[0]).includes(label)||links[0].attributes.target!=='_blank'||!(links[0].attributes.rel??'').split(/\s+/).includes('sponsored'))errors.push(`Incorrect native article booking context: ${kind}`);
    }
  }
  for(const spec of q.controls??[]){
    const matches=byId(spec.id);if(matches.length!==1||matches[0].tag!==spec.tag){errors.push(`Missing/duplicate guide control: ${spec.id}`);continue;}
    for(const [key,value]of Object.entries(spec.attributes))if(value===true?!Object.hasOwn(matches[0].attributes,key):matches[0].attributes[key]!==value)errors.push(`Incorrect guide control attribute: ${spec.id}.${key}`);
  }
  if(q.type==='partial'){
    const bodies=elements.filter(n=>hasClass(n,'article-body'));
    if(bodies.length!==1)errors.push('Missing unique repaired article body');
    else{
      const p=elements.find(n=>n.tag==='p'&&!n.hidden&&inside(n,bodies[0]));
      if(!p||textInside(html,p)!==q.opening)errors.push('Repaired opening paragraph differs from source');
      const anchors=elements.filter(n=>n.tag==='a'&&inside(n,bodies[0]));
      if(anchors.some(n=>anchors.some(parent=>parent!==n&&inside(n,parent))))errors.push('Nested anchor remains in repaired article body');
    }
    const articles=facts.documents.flatMap(doc=>schemaNodes(doc,'Article'));
    if(articles.length!==1)errors.push('Expected exactly one repaired Article schema');
    else{const article=articles[0];if(article.datePublished!==isoDate(q.published))errors.push('Original publication schema date changed');if(article.dateModified!==isoDate(q.corrected))errors.push('Partial correction schema date differs');if(normal(article.headline??'')!==normal(check.name)||normal(article.description??'')!==normal(q.description))errors.push('Preserved article headline/description differs');}
  }
  if(q.type==='full'){
    const articles=facts.documents.flatMap(doc=>schemaNodes(doc,'Article'));
    if(articles.length!==1)errors.push('Expected exactly one full-review Article schema');
    else{const article=articles[0];if(article.datePublished!==isoDate(q.published))errors.push('Original full-review publication schema date changed');if(article.dateModified!==isoDate(q.corrected))errors.push('Full-review modification schema date differs');if(normal(article.headline??'')!==normal(check.name)||normal(article.description??'')!==normal(q.description))errors.push('Full-review title/description differs');if(Object.hasOwn(article,'image'))errors.push('Illustrative hero must omit Article photographic identity');}
    if(facts.text.includes(PARTIAL_LABEL))errors.push('Full review incorrectly labelled as a partial repair');
    if(!elements.some(n=>hasClass(n,'article-image-note')&&!n.hidden&&/Illustrative.*not (?:a )?verified/i.test(textInside(html,n))))errors.push('Missing visible illustrative hero scope');
    if(!elements.some(n=>n.tag==='img'&&hasClass(n,'article-hero-img')&&/Illustrative/i.test(n.attributes.alt??'')))errors.push('Missing illustrative hero alt context');
    const bodies=elements.filter(n=>hasClass(n,'article-body'));
    if(bodies.length!==1)errors.push('Missing full-review article body');
    else{
      const anchors=elements.filter(n=>n.tag==='a'&&inside(n,bodies[0]));
      if(anchors.some(n=>anchors.some(parent=>parent!==n&&inside(n,parent))))errors.push('Nested anchor in full-review body');
      const bodyText=textInside(html,bodies[0]);
      const bad=/natural skating rink|complimentary wi[ -]?fi|(?:canoe|kayak|paddleboard) rentals? (?:are|is) available|Maligne Canyon trail offers year-round access|Ice climbing opportunities abound in Maligne Canyon|skied the Maligne Lake road multiple times|all six (?:restaurants|venues) (?:are new|opened in 2026)|each cabin has a full kitchen|during my last visit|\$\s*\d|\bCAD\s*\d/i;
      if(bad.test(bodyText))errors.push('Unsupported inherited/current claim in full review');
      // Dated percentages on selected items are legitimate; do not equate a
      // documented 50% offer with an invented dollar price or blanket discount.
      const eveningBad={
        'banff-nightlife-guide':/Dancing Sasquatch (?:is|hosts|offers)|Wild Bill['’]s is|most bars (?:do not|don['’]t) charge (?:a )?cover|(?:taxis?|buses?) are always available|(?:won['’]t|do not) need (?:a )?(?:car|taxi)/i,
        'banff-live-music':/Aurora Lounge (?:hosts|offers|has)|every Banff Centre performance is suitable for children|(?:free|complimentary) hotel shuttles? (?:run|are available) all night|(?:Rose & Crown|Melissa['’]s) (?:has|hosts) live bands every (?:Friday|Saturday)/i,
        'drink-deals':/Sky Bistro includes gondola admission|(?:the )?(?:whole|entire) menu is 50% off|High Rollers bowling happy hour runs from|specials are available on (?:all )?holidays/i,
      }[q.slug];
      if(eveningBad?.test(bodyText))errors.push('Unsupported inherited/current claim in full review');
      const winterBad={
        'icefields-parkway-guide':/fuel is available at (?:Saskatchewan )?(?:River )?Crossing in winter|walk onto the Athabasca Glacier|complete (?:the|this) drive in \d|all stops are accessible/i,
        'banff-to-jasper-drive':/fuel is available at (?:Saskatchewan )?(?:River )?Crossing in winter|Maligne Canyon is open for winter|complete (?:the|this) drive in \d|(?:winter|snow) tires (?:are )?(?:legally )?required (?:from )?October 1/i,
        'lake-minnewanka-guide':/Minnewanka is open for ice fishing|the road is open year-round|personal paddlecraft are allowed|you can paddle your own/i,
        'banff-gondola-guide':/boardwalk is fully accessible|Sky Bistro reservations include gondola admission|gondola cabins are heated|(?:standalone|all|your|these) tickets include hotel pickup/i,
        'banff-gondola-tickets-guide':/boardwalk is fully accessible|Sky Bistro reservations include gondola admission|free cancellation (?:applies|is included)|(?:standalone|all|your|these) tickets include hotel pickup/i,
      }[q.slug];
      if(winterBad?.test(bodyText))errors.push('Unsupported inherited/current claim in full review');
    }
    // Jasper's trusted static answer HTML is semantically compared, not treated
    // as literal visible angle brackets. The original193 FAQ contract is intact.
    const schemas=facts.documents.flatMap(doc=>schemaNodes(doc,'FAQPage'));
    if(schemas.length!==1||schemas[0].mainEntity?.length!==q.fullFaqs.length)errors.push('Full-review FAQ schema count differs');
    else q.fullFaqs.forEach((expected,index)=>{const actual=schemas[0].mainEntity[index],visible=facts.details.filter(f=>f.question===plainFragment(expected.question));if(actual?.['@type']!=='Question'||actual.acceptedAnswer?.['@type']!=='Answer'||plainFragment(actual.name)!==plainFragment(expected.question)||plainFragment(actual.acceptedAnswer.text)!==plainFragment(expected.answer)||visible.length!==1||visible[0].answer!==plainFragment(expected.answer))errors.push(`Full-review visible/schema FAQ mismatch: ${index+1}`);});
    for(const section of q.diningSections??[]){
      const heading=byId(section.id).find(n=>n.tag==='h3'&&!n.hidden),next=heading&&elements.find(n=>n.start>heading.end&&/^h[23]$/.test(n.tag));
      if(!heading){errors.push(`Missing dining venue section: ${section.id}`);continue;}
      const bounds={openEnd:heading.end,innerEnd:next?.start??html.length},sectionText=plainFragment(html.slice(bounds.openEnd,bounds.innerEnd));
      if(section.markers.some(marker=>!sectionText.includes(normal(marker)))||!visibleLinks.some(n=>inside(n,bounds)&&n.attributes.href===section.href))errors.push(`Missing dated/native dining facts: ${section.id}`);
    }
    if(q.cabinNative){
      const form=byId('cabin-fit-form')[0];if(!form||elements.filter(n=>n.tag==='button'&&n.attributes.type==='reset'&&inside(n,form)).length!==1)errors.push('Missing native cabin reset control');
      for(const [key,options]of Object.entries(q.cabinOptions)){const select=byId(`cabin-${key}`)[0],actual=select?elements.filter(n=>n.tag==='option'&&inside(n,select)):[];if(actual.map(n=>n.attributes.value).join('|')!==options.map(o=>o[0]).join('|')||actual[0]?.attributes.value!=='all'||actual.some((n,i)=>i>0&&Object.hasOwn(n.attributes,'selected')))errors.push(`Cabin default/whitelist differs: ${key}`);}
      for(const item of q.cabinNative){const card=elements.find(n=>n.attributes['data-cabin-id']===item.id),cta=card&&visibleLinks.filter(n=>inside(n,card)&&hasClass(n,'cabin-book'));if(!cta||cta.length!==1||cta[0].attributes.href!==item.href||cta[0].attributes.target!=='_blank'||!(cta[0].attributes.rel??'').split(/\s+/).includes('noopener')||(cta[0].attributes.rel??'').split(/\s+/).includes('sponsored')!==item.affiliate)errors.push(`Cabin native merchant/operator contract differs: ${item.id}`);}
    }
    if(q.evening){
      const form=byId('evening-fit-form')[0];
      for(const type of ['submit','reset'])if(!form||elements.filter(n=>n.tag==='button'&&n.attributes.type===type&&inside(n,form)).length!==1)errors.push(`Missing native evening ${type} control`);
      for(const [key,options]of Object.entries(q.evening.options)){
        const select=byId(`evening-${key}`)[0],actual=select?elements.filter(n=>n.tag==='option'&&inside(n,select)):[];
        if(actual.length!==options.length||actual.some((n,i)=>n.attributes.value!==options[i]?.[0]||textInside(html,n)!==normal(options[i]?.[1])||(i>0&&Object.hasOwn(n.attributes,'selected')))||actual[0]?.attributes.value!==q.evening.filters[key]||!form||!select||!inside(select,form)||elements.filter(n=>n.tag==='label'&&n.attributes.for===`evening-${key}`&&inside(n,form)).length!==1)errors.push(`Evening default/whitelist/label differs: ${key}`);
      }
      const count=byId('evening-fit-count')[0];if(!count||count.hidden||textInside(html,count)!=='5 evening formats to explore')errors.push('Evening SSR default count differs');
      const notes=byId('evening-fit-notes')[0];if(!notes||q.evening.notes.some(note=>!textInside(html,notes).includes(normal(note))))errors.push('Missing evening planning scope notes');
      const list=byId('evening-steps')[0],steps=list?elements.filter(n=>n.tag==='li'&&inside(n,list)):[];
      if(steps.length!==3||steps.some((n,i)=>textInside(html,n)!==normal(q.evening.steps[i])))errors.push('Missing complete default evening return steps');
      const journey=byId('evening-journey-link')[0],heading=byId('evening-journey-title')[0];
      if(!journey||journey.hidden||journey.attributes.href!==q.evening.journey.href||textInside(html,journey)!==normal(q.evening.journey.label+' ↗')||journey.attributes.target!=='_blank'||!(journey.attributes.rel??'').split(/\s+/).includes('noopener')||!heading||textInside(html,heading)!==normal(q.evening.journey.title))errors.push('Missing exact native default Banff evening journey');
      if(visibleLinks.filter(n=>n.attributes.href==='#evening-planner').length!==1)errors.push('Missing unique Evening planner jump link');
    }
    if(q.gondolaProduct){
      const body=bodies[0],links=body?visibleLinks.filter(n=>inside(n,body)&&n.attributes.href===q.gondolaProduct.href):[];
      if(links.length!==1||links[0].attributes.target!=='_blank'||!['noopener','sponsored'].every(rel=>(links[0].attributes.rel??'').split(/\s+/).includes(rel))||!textInside(html,links[0]).includes('affiliate booking link'))errors.push('Missing exact native Gondola product/affiliate handoff');
    }
  }
  if(q.cards){
    const cards=elements.filter(n=>Object.hasOwn(n.attributes,q.cards.attribute));
    if(cards.length!==q.cards.items.length||cards.some(n=>n.tag!=='article'||n.hidden)||new Set(cards.map(n=>n.attributes[q.cards.attribute])).size!==q.cards.items.length)errors.push('Missing/hidden/duplicate full SSR guide cards');
    for(const item of q.cards.items){const card=cards.find(n=>n.attributes[q.cards.attribute]===item.id);if(!card){errors.push(`Missing reviewed guide card: ${item.id}`);continue;}if(!visibleLinks.some(n=>inside(n,card)&&n.attributes.href===item.href&&(!q.cards.linkAttribute||Object.hasOwn(n.attributes,q.cards.linkAttribute))))errors.push(`Missing native guide card link: ${item.id}`);for(const marker of item.text)if(!textInside(html,card).includes(normal(marker)))errors.push(`Missing guide card decision detail: ${item.id}`);}
    if(q.boundaryLocationOnly){if(cards.some(n=>n.attributes[q.cards.attribute]==='banff-boundary-lodge'))errors.push('Location-only Boundary promoted into room matches');if(!elements.some(n=>n.attributes['data-source-scope']==='location-only'&&!n.hidden&&textInside(html,n).includes('unit facilities are not included')))errors.push('Missing Boundary location-only distinction');}
  }
  if(q.checklist){const list=byId(q.checklist.id)[0];if(!list||elements.filter(n=>n.tag==='input'&&n.attributes.type==='checkbox'&&inside(n,list)).length!==q.checklist.count)errors.push('Readiness checklist count differs');}
  if(q.timelineCount){const list=byId('ski-day-timeline')[0];if(!list||elements.filter(n=>n.tag==='li'&&inside(n,list)).length!==q.timelineCount)errors.push('Missing complete SSR ski-day timeline');}
  for(const [id,href]of q.operatorLinks??[]){const a=byId(id)[0];if(!a||a.tag!=='a'||a.hidden||a.attributes.href!==href)errors.push(`Missing default native ski operator link: ${id}`);}
  if(q.type==='town-index'){
    const cards=elements.filter(n=>hasClass(n,'town-card'));
    if(cards.length!==q.townCount||cards.some(n=>n.hidden))errors.push('Missing full six-town SSR comparison');
    for(const value of q.townPriorities){const buttons=elements.filter(n=>n.tag==='button'&&n.attributes['data-priority']===value&&n.attributes.type==='button');if(buttons.length!==1||buttons[0].attributes['aria-pressed']!==(value==='all'?'true':'false'))errors.push(`Missing/incorrect town priority control: ${value}`);}
  }
  for(const spec of q.taggedLinks??[]){const links=visibleLinks.filter(n=>Object.hasOwn(n.attributes,spec.attribute));if(links.length!==1||links[0].attributes.href!==spec.href)errors.push(`Missing exact town journey link: ${spec.attribute}`);else if(spec.external&&(links[0].attributes.target!=='_blank'||!(links[0].attributes.rel??'').split(/\s+/).includes('noopener')))errors.push(`Missing native operator link attributes: ${spec.attribute}`);}
  if(q.searchUrl&&!visibleLinks.some(n=>n.attributes.href===q.searchUrl&&(n.attributes.rel??'').split(/\s+/).includes('sponsored')&&/Search .* stays on Expedia/.test(textInside(html,n))))errors.push('Missing honestly labelled native town search/referral ID');
  if(q.noSkiPlanner){
    const guide=elements.find(n=>hasClass(n,'guide-content'));
    if(!guide)errors.push('Missing scoped town guide content');
    else if(visibleLinks.some(n=>inside(n,guide)&&new URL(n.attributes.href,ORIGIN).pathname.replace(/\/$/,'')==='/ski-day-planner'))errors.push('Unsupported Banff three-resort planner handoff from other base');
  }
  if(q.type==='dining-hub'){
    if(/Open\s+1\s*p\.?m\.?\s*(?:to|[–-])\s*2\s*a\.?m\.?\s+daily/i.test(facts.text))errors.push('Unsupported inherited Rose & Crown daily hours');
    const lists=facts.documents.flatMap(doc=>schemaNodes(doc,'ItemList'));
    if(lists.length!==1||!Array.isArray(lists[0].itemListElement)||lists[0].itemListElement.length<1||lists[0].numberOfItems!==lists[0].itemListElement.length)errors.push('Missing minimal dining name/link ItemList');
    else if(lists[0].itemListElement.some((item,i)=>item['@type']!=='ListItem'||item.position!==i+1||typeof item.name!=='string'||!item.name.trim()||Object.keys(item).some(key=>!['@type','position','name','url'].includes(key))||(item.url&&(!/^https:\/\//.test(item.url)||typeof item.url!=='string'))))errors.push('Dining ItemList exceeds name/operator-link scope (no Restaurant/LocalBusiness openingHours)');
    const section=elements.filter(n=>n.tag==='section'&&n.attributes['aria-labelledby']==='evening-guides-title');
    if(section.length!==1)errors.push('Missing unique scoped evening guide hub');
    else for(const target of q.hubLinks){const links=visibleLinks.filter(n=>inside(n,section[0])&&n.attributes.href===target.href);if(links.length!==1||!textInside(html,links[0]).includes(target.label))errors.push('Missing scoped reviewed evening handoff: '+target.href);}
    const hotel=visibleLinks.filter(n=>n.attributes.href===q.hotelHref&&textInside(html,n).includes('Compare Banff hotel bases'));
    if(hotel.length!==1)errors.push('Missing honest native hub hotel comparison');
    const offer=elements.filter(n=>hasClass(n,'tip-card')&&textInside(html,n).includes('Compare the whole offer'));
    if(offer.length!==1||!textInside(html,offer[0]).includes('food, admission and holiday conditions')||!visibleLinks.some(n=>inside(n,offer[0])&&n.attributes.href==='/blog/drink-deals/'))errors.push('Missing scoped offer-condition planning handoff');
    // This check certifies only new navigation/offer/hotel handoffs. It does
    // not promote the inherited restaurant catalogue to a full source review.
    const hotelSection=hotel[0]&&elements.filter(n=>n.tag==='section'&&inside(hotel[0],n)).sort((a,b)=>(a.end-a.start)-(b.end-b.start))[0];
    const scoped=[...section,...offer,...(hotelSection?[hotelSection]:[])].map(n=>textInside(html,n)).join(' ');
    if(/free (?:dining|drinks?|meals?|shuttle)|(?:meal|dining|drinks?) vouchers?|guaranteed (?:savings|discounts|tables)|every (?:bar|restaurant) (?:offers|has)|happy hour (?:runs|is) (?:from )?3[–-]6|(?:hotel|room) bookings? include (?:dining|drinks?|meals?)/i.test(scoped))errors.push('Unsupported hub offer/booking promise');
  }
  if(q.type==='parkway'){
    const plan=q.parkway,form=byId('parkway-form')[0],container=byId('parkway-stops')[0];
    if(!elements.some(n=>hasClass(n,'filter-note')&&!n.hidden&&textInside(html,n).includes('Changing visit type keeps your shortlist')&&textInside(html,n).includes('Changing season removes choices outside that seasonal comparison')))errors.push('Missing Parkway filter/selection scope explanation');
    for(const type of ['submit','reset'])if(!form||elements.filter(n=>n.tag==='button'&&n.attributes.type===type&&inside(n,form)).length!==1)errors.push(`Missing native Parkway ${type} control`);
    for(const [key,options]of Object.entries(plan.options)){
      const select=byId(`parkway-${key}`)[0],actual=select?elements.filter(n=>n.tag==='option'&&inside(n,select)):[];
      if(!form||!select||!inside(select,form)||actual.length!==options.length||actual.some((n,i)=>n.attributes.value!==options[i]?.[0]||textInside(html,n)!==normal(options[i]?.[1])||(i>0&&Object.hasOwn(n.attributes,'selected')))||actual[0]?.attributes.value!==plan.initial.filters[key]||elements.filter(n=>n.tag==='label'&&n.attributes.for===`parkway-${key}`&&inside(n,form)).length!==1)errors.push(`Parkway select/default/label differs: ${key}`);
    }
    const choices=elements.filter(n=>Object.hasOwn(n.attributes,'data-parkway-choice')),inputs=elements.filter(n=>Object.hasOwn(n.attributes,'data-parkway-select'));
    if(choices.length!==12||inputs.length!==12)errors.push('Parkway needs twelve progressive unselected optional choices');
    for(const stop of plan.stops){
      const card=elements.find(n=>n.attributes['data-parkway-id']===stop.id);if(!card||!container||!inside(card,container))errors.push('Parkway card outside documented stop container: '+stop.id);
      if(!card)continue;
      const distances=elements.filter(n=>Object.hasOwn(n.attributes,'data-parkway-distance')&&inside(n,card));
      if(distances.length!==1||distances[0].hidden||textInside(html,distances[0])!==`About ${stop.fromLouiseKm} km from Lake Louise village`)errors.push('Parkway default map-distance text differs: '+stop.id);
      const winter=elements.filter(n=>Object.hasOwn(n.attributes,'data-parkway-season-note')&&inside(n,card)),summer=elements.filter(n=>n.tag==='details'&&inside(n,card));
      if(winter.length!==1||textInside(html,winter[0])!==normal(stop.winter)||summer.length!==1||!textInside(html,summer[0]).includes(normal(stop.summer))||!textInside(html,summer[0]).includes('Summer planning notes'))errors.push('Missing full SSR seasonal Parkway notes: '+stop.id);
      const labels=choices.filter(n=>inside(n,card)),selects=inputs.filter(n=>inside(n,card));
      if(stop.kind==='endpoint'){if(labels.length||selects.length)errors.push('Parkway endpoint incorrectly offered as optional stop: '+stop.id);}
      else if(labels.length!==1||labels[0].tag!=='label'||!Object.hasOwn(labels[0].attributes,'hidden')||selects.length!==1||selects[0].tag!=='input'||selects[0].attributes.type!=='checkbox'||selects[0].attributes.value!==stop.id||Object.hasOwn(selects[0].attributes,'checked')||!inside(selects[0],labels[0]))errors.push('Parkway optional choice is missing/visible/preselected: '+stop.id);
    }
    const origin=byId('parkway-origin')[0],notes=byId('parkway-notes')[0],shortlist=byId('parkway-shortlist')[0],items=shortlist?elements.filter(n=>n.tag==='li'&&inside(n,shortlist)):[];
    const status=byId('parkway-status')[0];if(!status||status.hidden||textInside(html,status)!=='14 places documented · no optional stops selected')errors.push('Incorrect default Parkway documented/selected count');
    if(!origin||textInside(html,origin)!==`Route order: ${plan.initial.direction}. Approximate map distances from ${plan.initial.origin}.`)errors.push('Incorrect default Parkway order/origin');
    if(!notes||plan.initial.notes.some(note=>!textInside(html,notes).includes(normal(note))))errors.push('Missing Parkway seasonal/source scope');
    if(items.length!==1||textInside(html,items[0])!=='No optional stops selected. Read the cards and choose a few places to investigate.')errors.push('Parkway default shortlist is not empty');
    const ready=byId('parkway-checklist')[0],checks=ready?elements.filter(n=>n.tag==='li'&&inside(n,ready)):[];
    if(checks.length!==3||checks.some((n,i)=>textInside(html,n)!==normal(plan.initial.checklist[i])))errors.push('Missing complete three Parkway journey checks');
    const car=visibleLinks.filter(n=>hasClass(n,'car-cta-btn')&&n.attributes.href===plan.carHref);
    if(car.length!==1||car[0].attributes.target!=='_blank'||!['noopener','sponsored'].every(rel=>(car[0].attributes.rel??'').split(/\s+/).includes(rel))||!textInside(html,car[0]).includes('Search Car Rentals on Expedia')||!facts.text.includes('commission'))errors.push('Missing honest native KB6G4xt car referral/disclosure');
    if(elements.some(n=>n.attributes.id==='total-time'||Object.hasOwn(n.attributes,'data-stop-min'))||/\b(?:2\.5[–-]3|6[–-]9) hours|Parker Ridge is the must-do|winter tires are legally required October 1|gas is essential|fuel is guaranteed|guaranteed fuel is available|complete the drive in \d/i.test(facts.text))errors.push('Unsupported Parkway fixed ETA/fuel/route prescription');
    if(!elements.some(n=>n.tag==='img'&&hasClass(n,'page-hero-bg')&&/Illustrative.*not verified/i.test(n.attributes.alt??''))||!elements.some(n=>hasClass(n,'image-note')&&!n.hidden&&/Illustrative.*not a verified/i.test(textInside(html,n))))errors.push('Missing illustrative Parkway hero qualification');
  }
  return result;
}

const consentFixture='<footer><a href="/privacy">Privacy Policy</a><button type="button" data-open-consent>Privacy choices</button></footer><div id="cookie-banner" role="dialog" aria-describedby="cookie-description" hidden><p id="cookie-description">Choose optional services.</p><button type="button" id="cookie-accept">Accept all</button><button type="button" id="cookie-reject">Reject optional</button><button type="button" id="cookie-manage">Manage preferences</button><div id="cookie-preferences" hidden><input type="checkbox" id="pref-analytics"><input type="checkbox" id="pref-advertising"><input type="checkbox" id="pref-affiliate"><button type="button" id="cookie-save">Save preferences</button></div><p id="cookie-storage-status"></p><button type="button" id="cookie-close" hidden>Close choices</button></div><noscript><p>Optional analytics, advertising and booking widgets are off when JavaScript is disabled. Ordinary booking links remain available.</p></noscript>';
function parkwayFixture(q){
  const p=q.parkway;
  return `<img class="page-hero-bg" alt="Illustrative road; not verified as this route"><p class="image-note">Illustrative image; not a verified view.</p><form id="parkway-form" hidden>${Object.entries(p.options).map(([key,options])=>`<label for="parkway-${key}">${key}</label><select id="parkway-${key}">${options.map(([value,label])=>`<option value="${value}">${esc(label)}</option>`).join('')}</select>`).join('')}<button type="submit">Build</button><button type="reset">Reset</button></form><p id="parkway-status" role="status" aria-live="polite">14 places documented · no optional stops selected</p><p id="parkway-origin">Route order: ${esc(p.initial.direction)}. Approximate map distances from ${p.initial.origin}.</p><div id="parkway-notes">${p.initial.notes.map(n=>`<p>${esc(n)}</p>`).join('')}</div><ul id="parkway-shortlist"><li>No optional stops selected. Read the cards and choose a few places to investigate.</li></ul><button id="parkway-copy" type="button" hidden>Copy</button><p id="parkway-copy-status" role="status" aria-live="polite"></p><div id="parkway-copy-fallback" hidden><textarea id="parkway-brief" readonly></textarea></div><div id="parkway-stops">${p.stops.map(s=>`<article data-parkway-id="${s.id}"><span data-parkway-distance>About ${s.fromLouiseKm} km from Lake Louise village</span><h3>${esc(s.name)}</h3><p>${esc(s.idea)}</p><p data-parkway-season-note>${esc(s.winter)}</p><details><summary>Summer planning notes</summary><p>${esc(s.summer)}</p></details><a href="${esc(s.href)}">${esc(s.linkLabel)}</a>${s.kind==='endpoint'?'':`<label data-parkway-choice hidden><input type="checkbox" data-parkway-select value="${s.id}">Add</label>`}</article>`).join('')}</div><ol id="parkway-checklist">${p.initial.checklist.map(n=>`<li>${esc(n)}</li>`).join('')}</ol><a class="car-cta-btn" href="${p.carHref}" target="_blank" rel="noopener sponsored">Search Car Rentals on Expedia →</a><p>BanffBound may earn a commission.</p>`;
}
function fixture(check){
  const q=check.quality;let body=`<h1>${esc(check.name)}</h1>`;const schemas=[];
  if(q.type!=='full'){
  for(const marker of Object.values(check.markers??{}))body+=`<p>${esc(marker)}</p>`;
  if(q.type==='dining-hub'){
    schemas.push({'@context':'https://schema.org','@type':'ItemList',numberOfItems:1,itemListElement:[{'@type':'ListItem',position:1,name:'Fixture restaurant',url:'https://example.com/'}]});
    body+=`<section aria-labelledby="evening-guides-title"><h2 id="evening-guides-title">Give your evening a shape</h2>${q.hubLinks.map(l=>`<a href="${esc(l.href)}">${esc(l.label)} →</a>`).join('')}</section><section><a href="${q.hotelHref}">Compare Banff hotel bases →</a></section><div class="tip-card"><h3>Compare the whole offer</h3><p>Check the current operator page for food, admission and holiday conditions. Read the <a href="/blog/drink-deals/">drink-offer guide</a>.</p></div>`;
  }
  else for(const href of check.links??[])body+=`<a href="${esc(href)}">Source or journey</a>`;
  if(check.faqs){schemas.push({'@context':'https://schema.org','@type':'FAQPage',mainEntity:check.faqs.map(f=>({'@type':'Question',name:f.question,acceptedAnswer:{'@type':'Answer',text:f.answer}}))});body+=check.faqs.map(f=>`<details><summary>${esc(f.question)}</summary><p>${esc(f.answer)}</p></details>`).join('');}
  }
  if(q.type==='partial'||q.type==='full'){
    schemas.push({'@context':'https://schema.org','@type':'Article',headline:check.name,description:q.description,datePublished:isoDate(q.published),dateModified:isoDate(q.corrected)});
    body+=`<time datetime="${isoDate(q.published)}">Published</time><time datetime="${isoDate(q.corrected)}">Corrected</time>`;
    if(q.type==='full')body+=`<img class="article-hero-img" alt="Illustrative image; not verified as this place"><p class="article-image-note">${esc(q.imageNote)}</p>`;
    body+=`<div class="article-body"${q.bookingContext?' data-curated-booking="true"':''}>${q.type==='full'?q.bodyHtml:q.openingHtml}</div>`;
  }
  if(q.type==='context')body+='<div class="article-body" data-curated-booking="true"><p>Existing Jasper destination guide.</p></div>';
  if(['partial','full','context'].includes(q.type)){
    const context=q.bookingContext;
    for(const kind of check.affiliateKinds){const href=context?(kind==='gyg-auto'?context.tourHref:context.hotelHref):(kind==='gyg-auto'?'https://www.getyourguide.com/banff-l284/?partner_id=QW960HO':'https://www.expedia.ca/Hotel-Search?camref=1101l3MtWX');const label=context?(kind==='gyg-auto'?`Browse ${context.tourLabel} activity results on GetYourGuide — affiliate link`:`Compare ${context.hotelLabel} stays on Expedia — affiliate link`):'Native referral';body+=`<div data-affiliate-embed="${kind}"><p data-affiliate-status role="status" aria-live="polite">Optional partner content is off.</p><button type="button" data-open-consent>Privacy choices</button><div data-affiliate-mount hidden></div><a href="${esc(href)}" target="_blank" rel="noopener sponsored">${esc(label)}</a></div>`;}
  }
  if(q.type==='parkway')body+=parkwayFixture(q)+`<time datetime="2026-10-29">29 October 2026</time>`;
  if(q.type==='parkway')body+='<p class="filter-note">Changing visit type keeps your shortlist. Changing season removes choices outside that seasonal comparison.</p>';
  if(!['full','parkway'].includes(q.type)){
  for(const spec of q.controls??[]){const a=Object.entries(spec.attributes).map(([k,v])=>v===true?k:`${k}="${esc(v)}"`).join(' ');let inner='';if(q.checklist?.id===spec.id)inner=Array.from({length:q.checklist.count},()=>'<li><input type="checkbox"></li>').join('');if(spec.id==='ski-day-timeline')inner=Array.from({length:q.timelineCount},()=>'<li>Timeline step</li>').join('');body+=`<${spec.tag} id="${spec.id}" ${a}>${inner}${['input'].includes(spec.tag)?'':`</${spec.tag}>`}`;}
  if(q.cards)for(const item of q.cards.items)body+=`<article ${q.cards.attribute}="${item.id}">${item.text.map(t=>`<p>${esc(t)}</p>`).join('')}<a ${q.cards.linkAttribute??''} href="${esc(item.href)}">Native detail</a></article>`;
  if(q.boundaryLocationOnly)body+='<p data-source-scope="location-only">Boundary unit facilities are not included</p>';
  for(const [id,href]of q.operatorLinks??[])body+=`<a id="${id}" href="${esc(href)}">Operator</a>`;
  if(q.type==='town-index'){body+=Array.from({length:q.townCount},()=>'<article class="town-card">Town</article>').join('');for(const value of q.townPriorities)body+=`<button type="button" data-priority="${value}" aria-pressed="${value==='all'?'true':'false'}">Priority</button>`;}
  for(const spec of q.taggedLinks??[])body+=`<a ${spec.attribute} href="${esc(spec.href)}"${spec.external?' target="_blank" rel="noopener"':''}>Journey</a>`;
  if(q.searchUrl)body+=`<a href="${esc(q.searchUrl)}" rel="sponsored">Search ${esc(check.name)} stays on Expedia</a>`;
  }
  if(check.modifiedDate&&!['partial','full'].includes(q.type))body+=`<time datetime="${isoDate(check.modifiedDate)}">Updated ${check.modifiedDate}</time>`;
  if(q.type==='town')body=`<div class="guide-content">${body}</div>`;
  return `<html><head><link rel="canonical" href="${ORIGIN+check.path}">${schemas.map(s=>`<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('')}</head><body>${body}${consentFixture}</body></html>`;
}
export async function selfTest(){
  await foundationSelfTest();const inventory=await loadGuideInventory();
  const supplements=inventory.checks.filter(c=>c.quality);assert.equal(supplements.length,35);
  for(const check of supplements){const html=fixture(check),sitemap=new Set([ORIGIN+check.path]);assert.deepEqual(analyseGuideHtml(html,check,sitemap).errors,[],check.path+': complete supplement fixture');
    assert.ok(analyseGuideHtml(html.replace('rel="canonical"','rel="alternate"'),check,sitemap).errors.length,check.path+': canonical negative');
    assert.ok(analyseGuideHtml(html.replace('</body>','<script src="https://widget.getyourguide.com/sdk.js"></script></body>'),check,sitemap).errors.some(e=>e.includes('Active pre-consent')));
    if(check.quality.type==='partial'){
      assert.ok(analyseGuideHtml(html.replace(PARTIAL_LABEL,'Full guide reviewed:'),check,sitemap).errors.some(e=>e.includes('partialCorrection')));
      assert.ok(analyseGuideHtml(html.replace('"datePublished":"'+isoDate(check.publishedDate)+'"','"datePublished":"2026-10-29T00:00:00.000Z"'),check,sitemap).errors.some(e=>e.includes('Original publication')));
      assert.ok(analyseGuideHtml(html.replace(check.quality.openingHtml,'<p>Unrepaired or missing introduction.</p>'),check,sitemap).errors.some(e=>e.includes('opening paragraph')));
      const bad=check.quality.openingHtml.replace('<a ','<a href="/blog/other/"><a ').replace('</a>','</a></a>');assert.ok(analyseGuideHtml(html.replace(check.quality.openingHtml,bad),check,sitemap).errors.some(e=>e.includes('Nested anchor')));
    }
    if(check.quality.type==='full'){
      assert.ok(analyseGuideHtml(html.replace('"datePublished":"'+isoDate(check.publishedDate)+'"','"datePublished":"2026-10-29T00:00:00.000Z"'),check,sitemap).errors.some(e=>e.includes('publication schema')));
      assert.ok(analyseGuideHtml(html.replace('"@type":"Article"','"@type":"Article","image":"https://example.com/unverified.jpg"'),check,sitemap).errors.some(e=>e.includes('photographic identity')));
      assert.ok(analyseGuideHtml(html.replace('class="article-image-note"','class="missing-image-note"'),check,sitemap).errors.some(e=>e.includes('illustrative hero scope')));
      assert.ok(analyseGuideHtml(html.replace('</body>',`<p>${PARTIAL_LABEL}</p></body>`),check,sitemap).errors.some(e=>e.includes('incorrectly labelled')));
      assert.ok(analyseGuideHtml(html.replace('"@type":"FAQPage"','"@type":"WebPage"'),check,sitemap).errors.some(e=>e.includes('FAQ schema count')));
      const badClaim=check.quality.slug.startsWith('num')?'The frozen lake becomes a natural skating rink.':check.quality.slug.startsWith('jasper')?'The Maligne Canyon trail offers year-round access.':check.quality.slug==='banff-cabin-rentals'?'Each cabin has a full kitchen.':({'banff-nightlife-guide':'Dancing Sasquatch is the current dance venue.','banff-live-music':'Every Banff Centre performance is suitable for children.','drink-deals':'Sky Bistro includes gondola admission.','icefields-parkway-guide':'Fuel is available at Crossing in winter.','banff-to-jasper-drive':'Maligne Canyon is open for winter.','lake-minnewanka-guide':'Minnewanka is open for ice fishing.','banff-gondola-guide':'The boardwalk is fully accessible.','banff-gondola-tickets-guide':'Sky Bistro reservations include gondola admission.'}[check.quality.slug]??'All six restaurants opened in 2026.');
      assert.ok(analyseGuideHtml(html.replace(/class="article-body"[^>]*>/,tag=>tag+`<p>${badClaim}</p>`),check,sitemap).errors.some(e=>e.includes('Unsupported inherited/current claim')));
      if(check.quality.slug.startsWith('num'))assert.ok(analyseGuideHtml(html.replaceAll('as prohibited','as permitted'),check,sitemap).errors.length,'Bow Lake permission reversal must fail.');
      if(check.quality.slug==='jasper-canada')assert.ok(analyseGuideHtml(html.replace('/blog/jasper-national-park/#park-recovery','/wrong-source/'),check,sitemap).errors.some(e=>e.includes('source/photo link')),'HTML-bearing FAQ retains its native source link.');
      if(check.quality.cabinNative)assert.ok(analyseGuideHtml(html.replace('camref=1101l3MtWX','camref=wrong'),check,sitemap).errors.some(e=>e.includes('merchant/operator contract')));
      if(check.quality.slug==='drink-deals'){
        assert.ok(html.includes('50% off local beer'),'Legitimate dated selected-item percentage remains in positive fixture.');
        for(const [before,after]of [['2–5 p.m.','3–6 p.m.'],['9–11 p.m.','10–12 p.m.'],['Summit Hours from 3–5 p.m.','Summit Hours from 4–6 p.m.'],['50% off local beer, house wine and selected shareable plates','50% off the entire menu'],['not available on holidays or long weekends','available on every holiday'],['book Banff Gondola admission separately','gondola admission is included']])assert.ok(analyseGuideHtml(html.replaceAll(before,after),check,sitemap).errors.length,'Dated offer/eligibility/admission reversal must fail: '+before);
      }
      if(check.quality.evening){
        assert.ok(analyseGuideHtml(html.replace('value="banff"','value="wrong-base"'),check,sitemap).errors.some(e=>e.includes('Evening default/whitelist')));
        assert.ok(analyseGuideHtml(html.replace('type="reset" class="evening-reset"','type="button" class="evening-reset"'),check,sitemap).errors.some(e=>e.includes('native evening reset')));
        assert.ok(analyseGuideHtml(html.replace(check.quality.evening.steps[0],'Incomplete evening planning step.'),check,sitemap).errors.some(e=>e.includes('default evening return steps')));
        assert.ok(analyseGuideHtml(html.replace('id="evening-journey-link" href="'+esc(check.quality.evening.journey.href)+'"','id="evening-journey-link" href="https://example.com/wrong"'),check,sitemap).errors.some(e=>e.includes('native default Banff evening journey')));
        assert.ok(analyseGuideHtml(html.replaceAll('no minors are allowed after 10pm','no minors are allowed after 11pm'),check,sitemap).errors.length,'Current minors cutoff reversal must fail.');
      }
      if(['icefields-parkway-guide','banff-to-jasper-drive'].includes(check.quality.slug)){
        assert.ok(analyseGuideHtml(html.replaceAll('November 1–March 31','October 1–April 30'),check,sitemap).errors.length,'93N legal date reversal must fail.');
        assert.ok(analyseGuideHtml(html.replaceAll('all services are closed for winter','all services are open for winter'),check,sitemap).errors.length,'Winter service reversal must fail.');
      }
      if(check.quality.slug==='icefields-parkway-guide')assert.ok(analyseGuideHtml(html.replaceAll('36 km north of the junction','17 km north of the junction'),check,sitemap).errors.length,'Junction-origin route distance regression.');
      if(check.quality.slug==='lake-minnewanka-guide'){
        assert.ok(analyseGuideHtml(html.replaceAll('Personal canoes, kayaks, paddleboards and large inflatables are prohibited.','Personal canoes, kayaks, paddleboards and large inflatables are permitted.'),check,sitemap).errors.length,'Personal craft restriction reversal.');
        assert.ok(analyseGuideHtml(html.replaceAll('May 16–September 7, 2026','November 1–March 31, 2026'),check,sitemap).errors.length,'Closed fishing season cannot become winter fishing.');
      }
      if(check.quality.gondolaProduct){
        assert.ok(analyseGuideHtml(html.replace(`href="${esc(check.quality.gondolaProduct.href)}"`,`href="${esc(check.quality.gondolaProduct.href.replace('partner_id=QW960HO','partner_id=wrong'))}"`),check,sitemap).errors.some(e=>e.includes('native Gondola product/affiliate')));
        assert.ok(analyseGuideHtml(html.replaceAll('368 shallow stairs each way','no stairs'),check,sitemap).errors.length,'Physical access regression.');
        assert.ok(analyseGuideHtml(html.replaceAll('non-refundable','fully refundable'),check,sitemap).errors.length,'Product-specific cancellation regression.');
      }
    }
    if(check.quality.bookingContext){
      assert.ok(analyseGuideHtml(html.replace('data-curated-booking="true"','data-curated-booking="false"'),check,sitemap).errors.some(e=>e.includes('curated booking SSR')));
      const start=html.indexOf('data-affiliate-embed="expedia-banner"'),wrong=html.slice(0,start)+html.slice(start).replace(`href="${esc(check.quality.bookingContext.hotelHref)}"`,'href="https://www.expedia.ca/Hotel-Search?destination=WrongPlace&amp;camref=1101l3MtWX"');
      assert.ok(analyseGuideHtml(wrong,check,sitemap).errors.some(e=>e.includes('native article booking context')),'Destination mismatch must fail even with the preserved affiliate ID.');
    }
    if(check.quality.cards){const {attribute,items}=check.quality.cards;assert.ok(analyseGuideHtml(html.replace(`${attribute}="${items[0].id}"`,`${attribute}="unknown"`),check,sitemap).errors.some(e=>e.includes('guide card')));const card=htmlElements(html).find(n=>n.attributes[attribute]===items[0].id),wrong=html.slice(0,card.start)+html.slice(card.start,card.end).replace(`href="${esc(items[0].href)}"`,'href="/wrong/"')+html.slice(card.end);assert.ok(analyseGuideHtml(wrong,check,sitemap).errors.some(e=>e.includes('native guide card')));}
    if(check.quality.controls?.length){const id=check.quality.controls[0].id;assert.ok(analyseGuideHtml(html.replace(`id="${id}"`,'id="missing-control"'),check,sitemap).errors.some(e=>e.includes('guide control')));}
    if(check.quality.taggedLinks?.length){const attr=check.quality.taggedLinks[0].attribute;assert.ok(analyseGuideHtml(html.replace(`${attr} href=`,`data-wrong-journey href=`),check,sitemap).errors.some(e=>e.includes('town journey link')));}
    if(check.quality.noSkiPlanner){
      assert.deepEqual(analyseGuideHtml(html.replace('<body>','<body><header><a href="/ski-day-planner">Ski planner navigation</a></header>'),check,sitemap).errors,[],'Shared navigation does not imply destination-specific transport coverage.');
      assert.ok(analyseGuideHtml(html.replace('class="guide-content">','class="guide-content"><a href="/ski-day-planner">Plan this resort day</a>'),check,sitemap).errors.some(e=>e.includes('Unsupported Banff')));
    }
    if(check.quality.type==='dining-hub'){
      for(const target of check.quality.hubLinks){const wrong=html.replace(`href="${esc(target.href)}"`,'href="/wrong/"');assert.ok(analyseGuideHtml(wrong,check,sitemap).errors.some(e=>e.includes('scoped reviewed evening handoff')));}
      assert.ok(analyseGuideHtml(html.replace('aria-labelledby="evening-guides-title"','aria-labelledby="wrong-section"'),check,sitemap).errors.some(e=>e.includes('scoped evening guide hub')));
      assert.ok(analyseGuideHtml(html.replace('Compare Banff hotel bases','Book your hotel with free dining vouchers'),check,sitemap).errors.some(e=>e.includes('hub hotel comparison')));
      assert.ok(analyseGuideHtml(html.replace('food, admission and holiday conditions','guaranteed savings and free drinks'),check,sitemap).errors.some(e=>e.includes('Unsupported hub offer/booking promise')));
      assert.ok(analyseGuideHtml(html.replace('</body>','<p>Open 1pm to 2am daily.</p></body>'),check,sitemap).errors.some(e=>e.includes('Rose & Crown daily hours')));
      for(const entity of ['Restaurant','LocalBusiness'])assert.ok(analyseGuideHtml(html.replace('"name":"Fixture restaurant"',`"name":"Fixture restaurant","item":{"@type":"${entity}","openingHours":"Mo-Su 13:00-02:00"}`),check,sitemap).errors.some(e=>e.includes('ItemList exceeds name/operator-link scope')));
      assert.ok(analyseGuideHtml(html.replace('"name":"Fixture restaurant"','"name":"Fixture restaurant","openingHours":"Mo-Su 13:00-02:00"'),check,sitemap).errors.some(e=>e.includes('ItemList exceeds name/operator-link scope')));
      assert.deepEqual(analyseGuideHtml(html.replace('</body>','<section><h2>Inherited restaurant catalogue, outside new handoff scope</h2><p>Happy hour is from 3–6.</p></section></body>'),check,sitemap).errors,[],'Scoped handoff checks do not claim a full restaurant-data source review.');
    }
    if(check.quality.type==='parkway'){
      const p=check.quality.parkway;
      assert.ok(analyseGuideHtml(html.replace('About 39 km from Lake Louise village','About 17 km from Lake Louise village'),check,sitemap).errors.some(e=>e.includes('map-distance text differs')));
      assert.ok(analyseGuideHtml(html.replace('data-parkway-select value="herbert-lake"','data-parkway-select checked value="herbert-lake"'),check,sitemap).errors.some(e=>e.includes('optional choice is missing/visible/preselected')));
      assert.ok(analyseGuideHtml(html.replace('data-parkway-choice hidden','data-parkway-choice'),check,sitemap).errors.some(e=>e.includes('optional choice is missing/visible/preselected')));
      assert.ok(analyseGuideHtml(html.replace('value="winter"','value="unknown-season"'),check,sitemap).errors.some(e=>e.includes('Parkway select/default/label')));
      assert.ok(analyseGuideHtml(html.replace('<li>'+esc(p.initial.checklist[0])+'</li>',''),check,sitemap).errors.some(e=>e.includes('complete three Parkway journey checks')));
      assert.ok(analyseGuideHtml(html.replaceAll('https://expedia.com/affiliate/KB6G4xt','https://expedia.com/affiliate/wrong'),check,sitemap).errors.some(e=>e.includes('KB6G4xt car referral')));
      assert.ok(analyseGuideHtml(html.replace('"@type":"FAQPage"','"@type":"WebPage"'),check,sitemap).errors.some(e=>e.includes('FAQPage')));
      for(const added of ['<p>Complete the drive in 3 hours.</p>','<p>Fuel is guaranteed.</p>','<span id="total-time">6 hours</span>','<p data-stop-min="20">Fixed stop minutes</p>'])assert.ok(analyseGuideHtml(html.replace('</body>',added+'</body>'),check,sitemap).errors.some(e=>e.includes('fixed ETA/fuel/route prescription')));
      assert.ok(analyseGuideHtml(html.replaceAll('snow tires or chains November 1–March 31','snow tires or chains October 1–April 30'),check,sitemap).errors.length,'Planner tire-rule regression.');
      assert.ok(analyseGuideHtml(html.replace(/class="image-note"/,'class="missing-note"'),check,sitemap).errors.some(e=>e.includes('illustrative Parkway hero')));
      assert.ok(analyseGuideHtml(html.replace('class="filter-note"','class="missing-filter-note"'),check,sitemap).errors.some(e=>e.includes('filter/selection scope')));
    }
  }
  const {stdout,stderr}=await promisify(execFile)(process.execPath,['--input-type=module','-e',`globalThis.fetch=()=>{throw Error('Import attempted network')}; await import(${JSON.stringify(new URL('./verify-cycling-consent-release.mjs',import.meta.url).href)}); await import(${JSON.stringify(import.meta.url)});`],{cwd:ROOT,timeout:15000,maxBuffer:100000});
  assert.equal(stdout,'','Import must not run either CLI/self-test');assert.equal(stderr,'');
  assert.throws(()=>builtLocations('<!DOCTYPE x><urlset><url><loc>https://banffbound.com/</loc></url></urlset>','urlset'));
  assert.throws(()=>builtLocations('<urlset><url><loc>https://example.com/</loc></url></urlset>','urlset'));
  console.log('Guide-quality offline fixtures passed: preserved193 foundation +8 bounded repairs +15full guides +2lesson/day planners +7town pages +1context-only guide +1scoped dining/evening hub +1Parkway planner =228 unique HTML routes; 67full-review registry/original publication/partial-vs-full labels/illustrative schema, full SSR cards/controls/native links/FAQ and scoped base handoffs; evening defaults, dated offer permissions, no blanket hub promises;14Parkway map pairs/default-distance cards/season notes/unchecked progressive choices/6FAQs/3journey checks/KB6G4xt native referral without ETA/fuel guarantees; negative access/admission/season/price/canonical/provider/control/link/label/date/nested-text fixtures; import-safe shared engine and seven photo hashes. No network, receipt writes, Git, host calls or site build.');
}
function builtLocations(xml,kind){
  assert.ok(!/<!DOCTYPE|<!ENTITY/i.test(xml),'Built sitemap cannot declare entities');assert.ok(new RegExp(`<${kind}\\b`).test(xml),'Unexpected built sitemap type');
  const locations=[...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map(m=>normal(m[1]));assert.ok(locations.length>0&&locations.length<10000);
  for(const value of locations){const u=new URL(value);assert.equal(u.origin,ORIGIN);assert.ok(!u.search&&!u.hash&&!u.username&&!u.password);}
  assert.equal(new Set(locations).size,locations.length);return locations;
}
export async function checkBuiltDirectory(directory){
  const root=path.resolve(directory),inventory=await loadGuideInventory();
  const receiptText=await readFile(path.join(root,'build-info.json'),'utf8'),buildReceipt=JSON.parse(receiptText);
  assert.equal(buildReceipt.formatVersion,1);assert.equal(buildReceipt.scope,'app-source-v2');assert.match(buildReceipt.sourceFingerprint,/^[a-f0-9]{64}$/);assert.ok(buildReceipt.sourceRevision===null||/^[a-f0-9]{40}$/.test(buildReceipt.sourceRevision));
  const index=builtLocations(await readFile(path.join(root,'sitemap-index.xml'),'utf8'),'sitemapindex'),locations=[];assert.ok(index.length<=8);
  for(const url of index){const pathname=new URL(url).pathname;assert.match(pathname,/^\/sitemap(?:-\d+)?\.xml$/);locations.push(...builtLocations(await readFile(path.join(root,pathname),'utf8'),'urlset'));}
  const sitemap=new Set(locations);assert.equal(sitemap.size,locations.length);assert.ok(!sitemap.has(ORIGIN+'/build-info.json'));
  const failures=[];let htmlPassed=0,photosPassed=0;
  for(const check of inventory.checks){try{const html=await readFile(path.resolve(root,'.'+check.path,'index.html'),'utf8'),result=analyseGuideHtml(html,check,sitemap);if(result.errors.length)failures.push({path:check.path,errors:result.errors});else htmlPassed++;}catch(error){failures.push({path:check.path,errors:[String(error.message??error.name)]});}}
  for(const photo of inventory.photos){try{const bytes=await readFile(path.resolve(root,'.'+photo.src)),digest=createHash('sha256').update(bytes).digest('hex');assert.equal(digest,photo.sha256);photosPassed++;}catch(error){failures.push({path:photo.src,errors:['Built photo missing or SHA256 differs']});}}
  assert.equal(await readFile(path.join(root,'build-info.json'),'utf8'),receiptText,'Local build receipt changed during HTML inspection');
  return {passed:htmlPassed===EXPECTED_ROUTES&&photosPassed===7&&failures.length===0,mode:'read-only-built-directory',htmlRoutes:inventory.checks.length,htmlPassed,photosPassed,fullReviews:67,remainingPartialRepairs:8,sitemapUrls:sitemap.size,buildReceipt,buildReceiptStable:true,productionIdentityVerified:false,failures};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{if(process.argv.length===3&&process.argv[2]==='--self-test')await selfTest();else if(process.argv.length===4&&process.argv[2]==='--built-dir'){const result=await checkBuiltDirectory(process.argv[3]);console.log(JSON.stringify(result));if(!result.passed)process.exitCode=1;}else await verify(options(process.argv.slice(2)),{inventoryLoader:loadGuideInventory,htmlAnalyser:analyseGuideHtml,userAgent:'BanffBound-guide-quality-release-verification/1.0'});}
  catch(error){console.error(String(error.message??error.name));process.exitCode=1;}
}
