import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { build } from 'esbuild';
import { ORIGIN, ROOT, normal, htmlFacts, htmlElements, textInside, schemaNodes, analyseHtml, loadInventory, options, verify, selfTest as foundationSelfTest } from './verify-cycling-consent-release.mjs';

// Reuses the 193-route verifier's bounded GET/nonce/UTC receipt/sitemap/photo/wx
// engine. Only an explicit CLI invocation can request production; imports and
// --self-test never request production or write a receipt.
// node scripts/verify-guide-quality-release.mjs --revision <40hex> --fingerprint <64hex> --report research/<new-local.json>
const EXPECTED_ROUTES = 215;
const PARTIAL_LABEL = 'Opening paragraph repaired (full guide review pending):';
const ORIGINAL_PUBLICATION = {
  'nightclub-banff':'2026-03-31', 'banff-nightclubs':'2026-04-08', 'new-places-to-eat-in-banff':'2026-04-03',
  'banff-clubs':'2026-04-06', 'banff-bars':'2026-03-28', 'golden-banff':'2026-05-17', 'jasper-town':'2026-04-08',
  'jasper-national-park':'2026-04-06', 'deals-in-banff':'2026-04-14', 'johnsons-canyon':'2026-04-11',
  'calgary-to-jasper':'2026-04-11', 'numtijah-lodge':'2026-03-08', 'num-ti-jah-lodge':'2026-03-04',
};
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

export async function loadGuideInventory() {
  const foundation = await loadInventory();
  assert.equal(foundation.checks.length,193);assert.equal(foundation.photos.length,7);
  const d = await moduleData("export {allBlogPosts} from './src/data/blogPosts.ts'; export {blogRedirects} from './src/data/redirects.mjs'; export {resolveBlogContent} from './src/data/blogContentRegistry.ts'; export * from './src/data/legacyTextCorrections.ts'; export * from './src/data/lessonPlanning.ts'; export * from './src/data/skiPlanning.ts'; export {towns} from './src/data/towns.ts'; export * from './src/data/townStayPlanning.ts';");
  assert.deepEqual(Object.keys(d.legacyTextCorrections).sort(),Object.keys(ORIGINAL_PUBLICATION).sort());
  assert.equal(d.legacyTextCorrectionDate,'2026-10-29');
  const additions = Object.entries(ORIGINAL_PUBLICATION).map(([slug,date])=>{
    const post=d.allBlogPosts.find(post=>post.slug===slug),repair=d.legacyTextCorrections[slug];
    assert.ok(post&&!d.blogRedirects[slug]);assert.equal(post.date,date,'Original publication must remain: '+slug);assert.equal(post.lastUpdated,undefined,'Partial repair cannot reset guide-wide metadata: '+slug);
    assert.equal(repair.correctedAt,d.legacyTextCorrectionDate);assert.equal(repair.paragraph,'opening paragraph');
    const openingHtml=d.resolveBlogContent(slug).match(/<p\b[^>]*>[\s\S]*?<\/p>/i)?.[0];assert.ok(openingHtml);
    return {path:`/blog/${slug}/`,kind:'legacy-text-repair',name:post.title,noindex:false,publishedDate:date,modifiedDate:repair.correctedAt,affiliateKinds:['expedia-banner','gyg-auto'],markers:{partialCorrection:PARTIAL_LABEL},quality:{type:'partial',description:post.description,published:date,corrected:repair.correctedAt,openingHtml,opening:normal(openingHtml.replace(/<[^>]*>/g,' '))}};
  });
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
  assert.equal(additions.length,22);assert.equal(additions.filter(c=>c.kind==='legacy-text-repair').length,13);
  const checks=[...foundation.checks,...additions];assert.equal(checks.length,EXPECTED_ROUTES);assert.equal(new Set(checks.map(c=>c.path)).size,EXPECTED_ROUTES,'Supplements must not replace or double-count foundation routes.');
  for(const base of foundation.checks)assert.equal(checks.find(c=>c.path===base.path),base,'Every foundation check is preserved.');
  return {...foundation,checks,releaseScope:{legacyOpeningRepairs:13,lessonAndDayPlanners:2,townPages:7},supplementData:{lessonProgrammes:d.lessonProgrammes,defaultPlan,family}};
}

export function analyseGuideHtml(html,check,sitemap,headerRobots='') {
  const result=analyseHtml(html,check,sitemap,headerRobots),q=check.quality;
  if(!q)return result;
  const elements=htmlElements(html).filter(n=>!n.inert),facts=htmlFacts(html),errors=result.errors;
  const byId=id=>elements.filter(n=>n.attributes.id===id);
  const visibleLinks=elements.filter(n=>n.tag==='a'&&!n.hidden&&!n.noscript&&n.attributes.href);
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
  for(const marker of Object.values(check.markers??{}))body+=`<p>${esc(marker)}</p>`;
  for(const href of check.links??[])body+=`<a href="${esc(href)}">Source or journey</a>`;
  if(check.faqs){schemas.push({'@context':'https://schema.org','@type':'FAQPage',mainEntity:check.faqs.map(f=>({'@type':'Question',name:f.question,acceptedAnswer:{'@type':'Answer',text:f.answer}}))});body+=check.faqs.map(f=>`<details><summary>${esc(f.question)}</summary><p>${esc(f.answer)}</p></details>`).join('');}
  if(q.type==='partial'){
    schemas.push({'@context':'https://schema.org','@type':'Article',headline:check.name,description:q.description,datePublished:isoDate(q.published),dateModified:isoDate(q.corrected)});
    body+=`<time datetime="${isoDate(q.published)}">Published</time><time datetime="${isoDate(q.corrected)}">Corrected</time><div class="article-body">${q.openingHtml}</div>`;
    for(const kind of check.affiliateKinds)body+=`<div data-affiliate-embed="${kind}"><p data-affiliate-status role="status" aria-live="polite">Optional partner content is off.</p><button type="button" data-open-consent>Privacy choices</button><div data-affiliate-mount hidden></div><a href="${kind==='gyg-auto'?'https://www.getyourguide.com/banff-l284/?partner_id=QW960HO':'https://www.expedia.ca/Hotel-Search?camref=1101l3MtWX'}">Native referral</a></div>`;
  }
  for(const spec of q.controls??[]){const a=Object.entries(spec.attributes).map(([k,v])=>v===true?k:`${k}="${esc(v)}"`).join(' ');let inner='';if(q.checklist?.id===spec.id)inner=Array.from({length:q.checklist.count},()=>'<li><input type="checkbox"></li>').join('');if(spec.id==='ski-day-timeline')inner=Array.from({length:q.timelineCount},()=>'<li>Timeline step</li>').join('');body+=`<${spec.tag} id="${spec.id}" ${a}>${inner}${['input'].includes(spec.tag)?'':`</${spec.tag}>`}`;}
  if(q.cards)for(const item of q.cards.items)body+=`<article ${q.cards.attribute}="${item.id}">${item.text.map(t=>`<p>${esc(t)}</p>`).join('')}<a ${q.cards.linkAttribute??''} href="${esc(item.href)}">Native detail</a></article>`;
  if(q.boundaryLocationOnly)body+='<p data-source-scope="location-only">Boundary unit facilities are not included</p>';
  for(const [id,href]of q.operatorLinks??[])body+=`<a id="${id}" href="${esc(href)}">Operator</a>`;
  if(q.type==='town-index'){body+=Array.from({length:q.townCount},()=>'<article class="town-card">Town</article>').join('');for(const value of q.townPriorities)body+=`<button type="button" data-priority="${value}" aria-pressed="${value==='all'?'true':'false'}">Priority</button>`;}
  for(const spec of q.taggedLinks??[])body+=`<a ${spec.attribute} href="${esc(spec.href)}"${spec.external?' target="_blank" rel="noopener"':''}>Journey</a>`;
  if(q.searchUrl)body+=`<a href="${esc(q.searchUrl)}" rel="sponsored">Search ${esc(check.name)} stays on Expedia</a>`;
  if(check.modifiedDate&&q.type!=='partial')body+=`<time datetime="${isoDate(check.modifiedDate)}">Updated ${check.modifiedDate}</time>`;
  if(q.type==='town')body=`<div class="guide-content">${body}</div>`;
  return `<html><head><link rel="canonical" href="${ORIGIN+check.path}">${schemas.map(s=>`<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('')}</head><body>${body}${consentFixture}</body></html>`;
}
export async function selfTest(){
  await foundationSelfTest();const inventory=await loadGuideInventory();
  const supplements=inventory.checks.filter(c=>c.quality);assert.equal(supplements.length,22);
  for(const check of supplements){const html=fixture(check),sitemap=new Set([ORIGIN+check.path]);assert.deepEqual(analyseGuideHtml(html,check,sitemap).errors,[],check.path+': complete supplement fixture');
    assert.ok(analyseGuideHtml(html.replace('rel="canonical"','rel="alternate"'),check,sitemap).errors.length,check.path+': canonical negative');
    assert.ok(analyseGuideHtml(html.replace('</body>','<script src="https://widget.getyourguide.com/sdk.js"></script></body>'),check,sitemap).errors.some(e=>e.includes('Active pre-consent')));
    if(check.quality.type==='partial'){
      assert.ok(analyseGuideHtml(html.replace(PARTIAL_LABEL,'Full guide reviewed:'),check,sitemap).errors.some(e=>e.includes('partialCorrection')));
      assert.ok(analyseGuideHtml(html.replace('"datePublished":"'+isoDate(check.publishedDate)+'"','"datePublished":"2026-10-29T00:00:00.000Z"'),check,sitemap).errors.some(e=>e.includes('Original publication')));
      assert.ok(analyseGuideHtml(html.replace(check.quality.openingHtml,'<p>Unrepaired or missing introduction.</p>'),check,sitemap).errors.some(e=>e.includes('opening paragraph')));
      const bad=check.quality.openingHtml.replace('<a ','<a href="/blog/other/"><a ').replace('</a>','</a></a>');assert.ok(analyseGuideHtml(html.replace(check.quality.openingHtml,bad),check,sitemap).errors.some(e=>e.includes('Nested anchor')));
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
  console.log('Guide-quality offline fixtures passed: preserved193 foundation +13 bounded repairs +2lesson/day planners +7town pages =215 unique HTML routes; original publication/partial labels/schema/openings, full SSR cards/controls/native links/FAQ and scoped base handoffs; negative canonicals/providers/missing controls/links/labels/dates/nested text; import-safe shared engine and seven photo hashes. No network, receipt writes, Git, host calls or site build.');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{if(process.argv.length===3&&process.argv[2]==='--self-test')await selfTest();else await verify(options(process.argv.slice(2)),{inventoryLoader:loadGuideInventory,htmlAnalyser:analyseGuideHtml,userAgent:'BanffBound-guide-quality-release-verification/1.0'});}
  catch(error){console.error(String(error.message??error.name));process.exitCode=1;}
}
