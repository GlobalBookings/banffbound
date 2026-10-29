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
const EXPECTED_ROUTES = 218;
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
  const metadata={...d.bowLakeGuideMetadata,...d.jasperGuideMetadata,...d.diningGuideMetadata,...d.cabinGuideMetadata};
  assert.deepEqual(Object.keys(metadata).sort(),Object.keys(FULL_PUBLICATION).sort());
  assert.equal(Object.keys(d.reviewedBlogBodies).length,59,'Current registry has59 full reviews; historical receipts remain versioned.');
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
    const fullFaqs=d.jasperGuideFaqs[slug]??(slug==='banff-cabin-rentals'?d.cabinGuideFaqs:slug==='new-places-to-eat-in-banff'?d.diningGuideFaqs:schemas[0].mainEntity.map(q=>({question:q.name,answer:q.acceptedAnswer.text})));
    assert.equal(fullFaqs.length,slug==='num-ti-jah-lodge'||slug==='banff-cabin-rentals'||slug==='new-places-to-eat-in-banff'?5:slug==='numtijah-lodge'?4:3);
    const quality={type:'full',slug,bodyHtml,description:meta.description,published:date,corrected:meta.lastUpdated,imageNote:post.imageNote,fullFaqs};
    if(slug==='new-places-to-eat-in-banff')quality.diningSections=diningSections;
    if(slug==='banff-cabin-rentals'){
      quality.controls=[control('cabin-fit-form','form',{hidden:true}),...['base','season','kitchen'].map(key=>control(`cabin-${key}`,'select')),control('cabin-fit-count','p',{role:'status','aria-live':'polite'}),control('cabin-fit-notes','div'),control('cabin-fit-empty','div',{hidden:true})];
      quality.cards={attribute:'data-cabin-id',items:d.cabinExamples.map(c=>({id:c.id,href:c.bookingHref,text:[c.name,c.room,c.cooking,c.seasonNote,c.journey]}))};
      quality.cabinNative=d.cabinExamples.map(c=>({id:c.id,href:c.bookingHref,affiliate:c.affiliate}));quality.cabinOptions=d.cabinFilterOptions;
    }
    return {path:`/blog/${slug}/`,kind:'full-guide-review',name:post.title,noindex:false,publishedDate:date,modifiedDate:meta.lastUpdated,affiliateKinds:['expedia-banner','gyg-auto'],markers:fullMarkers[slug],links:[...new Set(facts.links)],quality};
  });
}

export async function loadGuideInventory() {
  const foundation = await loadInventory();
  assert.equal(foundation.checks.length,193);assert.equal(foundation.photos.length,7);
  const d = await moduleData("export {allBlogPosts} from './src/data/blogPosts.ts'; export {blogRedirects} from './src/data/redirects.mjs'; export {resolveBlogContent,reviewedBlogBodies,authoredBookingGuideSlugs} from './src/data/blogContentRegistry.ts'; export * from './src/data/legacyTextCorrections.ts'; export * from './src/data/lessonPlanning.ts'; export * from './src/data/skiPlanning.ts'; export {towns} from './src/data/towns.ts'; export * from './src/data/townStayPlanning.ts'; export {bowLakeGuideMetadata} from './src/data/bowLakeGuideOverrides.ts'; export {jasperGuideMetadata,jasperGuideFaqs} from './src/data/jasperGuideOverrides.ts'; export {diningGuideMetadata,diningGuideFaqs} from './src/data/diningGuideOverrides.ts'; export {cabinGuideMetadata,cabinGuideFaqs} from './src/data/cabinGuideOverrides.ts'; export * from './src/data/cabinPlanning.ts'; export {getArticleBookingContext} from './src/data/articleBookingContext.ts';");
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
  assert.equal(d.authoredBookingGuideSlugs.length,7);
  for(const check of additions){const slug=check.path.split('/')[2],authored=d.authoredBookingGuideSlugs.includes(slug),expected=expectedBookingContext(slug,authored);assert.deepEqual(d.getArticleBookingContext(slug,authored),expected);if(expected.suppressAutomaticCTA)check.quality.bookingContext=expected;}
  assert.equal(additions.filter(c=>c.quality.bookingContext).length,9);
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
  assert.equal(additions.length,25);assert.equal(additions.filter(c=>c.kind==='legacy-text-repair').length,8);assert.equal(additions.filter(c=>c.kind==='full-guide-review').length,7);
  const checks=[...foundation.checks,...additions];assert.equal(checks.length,EXPECTED_ROUTES);assert.equal(new Set(checks.map(c=>c.path)).size,EXPECTED_ROUTES,'Supplements must not replace or double-count foundation routes.');
  for(const base of foundation.checks)assert.equal(checks.find(c=>c.path===base.path),base,'Every foundation check is preserved.');
  return {...foundation,checks,releaseScope:{legacyOpeningRepairs:8,newFullGuides:7,totalFullReviews:59,lessonAndDayPlanners:2,townPages:7,contextOnlyGuides:1,curatedBookingContextPages:9,canonicalAliases:40},supplementData:{lessonProgrammes:d.lessonProgrammes,defaultPlan,family}};
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
  return result;
}

const consentFixture='<footer><a href="/privacy">Privacy Policy</a><button type="button" data-open-consent>Privacy choices</button></footer><div id="cookie-banner" role="dialog" aria-describedby="cookie-description" hidden><p id="cookie-description">Choose optional services.</p><button type="button" id="cookie-accept">Accept all</button><button type="button" id="cookie-reject">Reject optional</button><button type="button" id="cookie-manage">Manage preferences</button><div id="cookie-preferences" hidden><input type="checkbox" id="pref-analytics"><input type="checkbox" id="pref-advertising"><input type="checkbox" id="pref-affiliate"><button type="button" id="cookie-save">Save preferences</button></div><p id="cookie-storage-status"></p><button type="button" id="cookie-close" hidden>Close choices</button></div><noscript><p>Optional analytics, advertising and booking widgets are off when JavaScript is disabled. Ordinary booking links remain available.</p></noscript>';
function fixture(check){
  const q=check.quality;let body=`<h1>${esc(check.name)}</h1>`;const schemas=[];
  if(q.type!=='full'){
  for(const marker of Object.values(check.markers??{}))body+=`<p>${esc(marker)}</p>`;
  for(const href of check.links??[])body+=`<a href="${esc(href)}">Source or journey</a>`;
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
  if(q.type!=='full'){
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
  const supplements=inventory.checks.filter(c=>c.quality);assert.equal(supplements.length,25);
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
      const badClaim=check.quality.slug.startsWith('num')?'The frozen lake becomes a natural skating rink.':check.quality.slug.startsWith('jasper')?'The Maligne Canyon trail offers year-round access.':check.quality.slug==='banff-cabin-rentals'?'Each cabin has a full kitchen.':'All six restaurants opened in 2026.';
      assert.ok(analyseGuideHtml(html.replace(/class="article-body"[^>]*>/,tag=>tag+`<p>${badClaim}</p>`),check,sitemap).errors.some(e=>e.includes('Unsupported inherited/current claim')));
      if(check.quality.slug.startsWith('num'))assert.ok(analyseGuideHtml(html.replaceAll('as prohibited','as permitted'),check,sitemap).errors.length,'Bow Lake permission reversal must fail.');
      if(check.quality.slug==='jasper-canada')assert.ok(analyseGuideHtml(html.replace('/blog/jasper-national-park/#park-recovery','/wrong-source/'),check,sitemap).errors.some(e=>e.includes('source/photo link')),'HTML-bearing FAQ retains its native source link.');
      if(check.quality.cabinNative)assert.ok(analyseGuideHtml(html.replace('camref=1101l3MtWX','camref=wrong'),check,sitemap).errors.some(e=>e.includes('merchant/operator contract')));
    }
    if(check.quality.bookingContext){
      assert.ok(analyseGuideHtml(html.replace('data-curated-booking="true"','data-curated-booking="false"'),check,sitemap).errors.some(e=>e.includes('curated booking SSR')));
      const start=html.indexOf('data-affiliate-embed="expedia-banner"'),wrong=html.slice(0,start)+html.slice(start).replace(`href="${esc(check.quality.bookingContext.hotelHref)}"`,'href="https://www.expedia.ca/Hotel-Search?destination=WrongPlace&amp;camref=1101l3MtWX"');
      assert.ok(analyseGuideHtml(wrong,check,sitemap).errors.some(e=>e.includes('native article booking context')),'Destination mismatch must fail even with the preserved affiliate ID.');
    }
    if(check.quality.cards){const {attribute,items}=check.quality.cards;assert.ok(analyseGuideHtml(html.replace(`${attribute}="${items[0].id}"`,`${attribute}="unknown"`),check,sitemap).errors.some(e=>e.includes('guide card')));assert.ok(analyseGuideHtml(html.replace(`href="${esc(items[0].href)}"`,'href="/wrong/"'),check,sitemap).errors.some(e=>e.includes('native guide card')));}
    if(check.quality.controls?.length){const id=check.quality.controls[0].id;assert.ok(analyseGuideHtml(html.replace(`id="${id}"`,'id="missing-control"'),check,sitemap).errors.some(e=>e.includes('guide control')));}
    if(check.quality.taggedLinks?.length){const attr=check.quality.taggedLinks[0].attribute;assert.ok(analyseGuideHtml(html.replace(`${attr} href=`,`data-wrong-journey href=`),check,sitemap).errors.some(e=>e.includes('town journey link')));}
    if(check.quality.noSkiPlanner){
      assert.deepEqual(analyseGuideHtml(html.replace('<body>','<body><header><a href="/ski-day-planner">Ski planner navigation</a></header>'),check,sitemap).errors,[],'Shared navigation does not imply destination-specific transport coverage.');
      assert.ok(analyseGuideHtml(html.replace('class="guide-content">','class="guide-content"><a href="/ski-day-planner">Plan this resort day</a>'),check,sitemap).errors.some(e=>e.includes('Unsupported Banff')));
    }
  }
  const {stdout,stderr}=await promisify(execFile)(process.execPath,['--input-type=module','-e',`globalThis.fetch=()=>{throw Error('Import attempted network')}; await import(${JSON.stringify(new URL('./verify-cycling-consent-release.mjs',import.meta.url).href)}); await import(${JSON.stringify(import.meta.url)});`],{cwd:ROOT,timeout:15000,maxBuffer:100000});
  assert.equal(stdout,'','Import must not run either CLI/self-test');assert.equal(stderr,'');
  assert.throws(()=>builtLocations('<!DOCTYPE x><urlset><url><loc>https://banffbound.com/</loc></url></urlset>','urlset'));
  assert.throws(()=>builtLocations('<urlset><url><loc>https://example.com/</loc></url></urlset>','urlset'));
  console.log('Guide-quality offline fixtures passed: preserved193 foundation +8 bounded repairs +7full guides +2lesson/day planners +7town pages +1context-only guide =218 unique HTML routes; 59full-review registry/original publication/partial-vs-full labels/illustrative schema, full SSR cards/controls/native links/FAQ and scoped base handoffs; negative canonicals/providers/missing controls/links/labels/dates/nested text; import-safe shared engine and seven photo hashes. No network, receipt writes, Git, host calls or site build.');
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
  return {passed:htmlPassed===EXPECTED_ROUTES&&photosPassed===7&&failures.length===0,mode:'read-only-built-directory',htmlRoutes:inventory.checks.length,htmlPassed,photosPassed,fullReviews:59,remainingPartialRepairs:8,sitemapUrls:sitemap.size,buildReceipt,buildReceiptStable:true,productionIdentityVerified:false,failures};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{if(process.argv.length===3&&process.argv[2]==='--self-test')await selfTest();else if(process.argv.length===4&&process.argv[2]==='--built-dir'){const result=await checkBuiltDirectory(process.argv[3]);console.log(JSON.stringify(result));if(!result.passed)process.exitCode=1;}else await verify(options(process.argv.slice(2)),{inventoryLoader:loadGuideInventory,htmlAnalyser:analyseGuideHtml,userAgent:'BanffBound-guide-quality-release-verification/1.0'});}
  catch(error){console.error(String(error.message??error.name));process.exitCode=1;}
}
