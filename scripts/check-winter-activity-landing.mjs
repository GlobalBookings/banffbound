import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile,access} from 'node:fs/promises';
import {build} from 'esbuild';
import {transform} from '@astrojs/compiler';
const {outputFiles}=await build({stdin:{contents:"export * from './src/data/winterActivityLanding.ts';",resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'esm'});
const data=await import('data:text/javascript;base64,'+Buffer.from(outputFiles[0].text).toString('base64'));
const {winterActivityOffers:offers,winterActivityFaqs:faqs,winterActivityMessageMap:messages,winterActivityBookingUrl:bookingUrl}=data;
assert.equal(data.winterActivityLandingId,'banff-winter-activities');
assert.equal(data.winterActivityReviewedAt,'2026-10-29');
assert.deepEqual(offers.map(o=>o.productId),['303253','256607','437912']);
assert.deepEqual(offers.map(o=>o.provider),['Discover Banff Tours','Pursuit Collection','Radventures']);
assert.equal(new Set(offers.map(o=>o.id)).size,3);assert.equal(new Set(offers.map(o=>o.anchor)).size,3);
assert.equal(new Set(offers.map(o=>o.format)).size,3,'Three distinct activity formats, not three generic searches.');
for(const offer of offers){
 const url=new URL(offer.bookingUrl);
 assert.equal(url.origin,'https://www.getyourguide.com');assert.match(url.pathname,new RegExp('-t'+offer.productId+'/$'));
 assert.equal(url.searchParams.get('partner_id'),'QW960HO');assert.equal(url.searchParams.get('cmp'),'banffboundwinteractivities');
 assert.deepEqual([...url.searchParams.keys()].sort(),['cmp','partner_id']);assert.equal(url.hash,'');
 assert.equal(offer.id,'gyg-'+offer.productId);assert.ok(offer.operatorUrl.startsWith('https://'));
 for(const key of ['fit','experience','tradeoff','transport','group','bookingCheck'])assert.ok(offer[key].length>80,`${offer.id}: useful ${key}`);
 assert.ok(!Object.keys(offer).some(key=>/price|rating|duration|availability|discount|reviewCount/.test(key)),'No volatile offer claim modeled.');
}
for(const input of ['https://example.com/product-t303253/','https://www.getyourguide.com/banff-l284/','https://www.getyourguide.com/banff-l284/example-t303253/?partner_id=other','https://www.getyourguide.com/banff-l284/example-t303253/#x'])assert.throws(()=>bookingUrl(input));
assert.equal(offers.find(o=>o.productId==='256607').needsCanyonCheck,false);
assert.ok(offers.filter(o=>o.needsCanyonCheck).every(o=>['303253','437912'].includes(o.productId)));
const page=await readFile('src/pages/book/banff-winter-activities.astro','utf8');
const compiled=await transform(page,{filename:'src/pages/book/banff-winter-activities.astro'});
assert.deepEqual(compiled.diagnostics.filter(d=>d.severity===1),[]);
assert.match(page,/PaidLandingLayout/);assert.match(page,/slot="hero-detail"/);assert.match(page,/winterActivityOffers\.map/);
assert.match(page,/data-landing-id=\{winterActivityLandingId\}/);assert.match(page,/data-offer-id=\{offer.id\}/);
assert.match(page,/href=\{offer.bookingUrl\}/);assert.match(page,/rel="noopener sponsored"/);
assert.match(page,/Affiliate disclosure/);assert.match(page,/before paying/);assert.match(page,/not confirmation of reopening/);
assert.ok(page.indexOf('offer.needsCanyonCheck')<page.indexOf('class="booking-cta"'),'Material canyon access check appears before the product booking CTA.');
assert.match(page,/winterActivityFaqs\.map\(faq => <details>/);assert.match(page,/'@type': 'FAQPage'/);assert.match(page,/name: faq.question/);assert.match(page,/text: faq.answer/);
assert.ok(!/<iframe\b|<script[^>]*src=|data-gyg-widget|data-gyg-href|aggregateRating|OfferCatalog|InStock|free cancellation|best price|save \d+%|guaranteed views|\$\d+/i.test(page),'No SDK/widget, synthetic commerce schema or unverified selling claim.');
const client=page.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(client,'Find the actual progressive selector script.');
assert.ok(!/\.booking-cta|a\[href|closest\([^)]*['"]a|window\.open|location\.(assign|replace)\(/.test(client),'The selector must not intercept or modify merchant links.');
assert.match(page,/<form id="winter-experience-form"[^>]*hidden/);assert.match(page,/data-winter-offer=\{offer.id\}/);assert.match(page,/role="status" aria-live="polite" aria-atomic="true"/);
assert.match(page,/<noscript><p>All three experiences and their booking links/);
const preCta=page.slice(page.indexOf('{offer.needsCanyonCheck'),page.indexOf('<a class="booking-cta"'));
for(const marker of ['closure — checked October 29, 2026','trail and day-use area closed from October 13','scheduled December 11, 2026','Reopening is not confirmed','confirm the route for your date before booking'])assert.ok(preCta.includes(marker),'Explicit material closure before CTA: '+marker);
const detailTag=page.match(/<a class="booking-cta"[^>]+>/)?.[0];
const finalTag=page.slice(page.indexOf('class="final-links"')).match(/<a [^>]+>/)?.[0];
assert.ok(detailTag&&finalTag);assert.match(detailTag,/data-landing-placement="detail-card"/);assert.match(finalTag,/data-landing-placement="final-shortlist"/);
assert.match(detailTag,/data-offer-id=\{offer.id\}/);assert.match(finalTag,/data-offer-id=\{offer.id\}/);

assert.deepEqual(data.winterActivityExperienceOptions.map(option=>option.value),['all','icewalk','summit','road-day']);
for(const invalid of ['wrong','SUMMIT','<script>',null,{},['summit'],'constructor'])assert.equal(data.normaliseWinterActivityExperience(invalid),'all');
assert.deepEqual(data.buildWinterActivitySelection('icewalk').offerIds,['gyg-303253']);assert.deepEqual(data.buildWinterActivitySelection('summit').offerIds,['gyg-256607']);assert.deepEqual(data.buildWinterActivitySelection('road-day').offerIds,['gyg-437912']);
const clientBuild=await build({stdin:{contents:client,loader:'ts',resolveDir:process.cwd()+'/src/pages/book'},bundle:true,write:false,platform:'browser',format:'iife'});
function selectorHarness(href,{blockHistory=false}={}){
 const nodes=new Map(),events=new Map();
 const element=id=>{if(!nodes.has(id))nodes.set(id,{value:id==='winter-experience'?'all':'',hidden:id==='winter-experience-form',dataset:{},textContent:'',listeners:{},addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);}});return nodes.get(id);};
 const cards=offers.map(offer=>({dataset:{winterOffer:offer.id},hidden:false}));
 const window={location:{href},history:{replaceState(state,title,url){if(blockHistory)throw Error('Unavailable');window.location.href=String(url);}}};
 const document={getElementById:element,querySelectorAll(selector){assert.equal(selector,'[data-winter-offer]','Only offer cards may be selected for hiding; merchant anchors remain untouched.');return cards;},addEventListener(type,fn){(events.get(type)??events.set(type,[]).get(type)).push(fn);}};
 vm.runInNewContext(clientBuild.outputFiles[0].text,{document,window,URL,Set});
 return{nodes,cards,window,change(value){element('winter-experience').value=value;for(const fn of element('winter-experience-form').listeners.change??[])fn();},reset(){let prevented=false;for(const fn of element('winter-experience-form').listeners.reset??[])fn({preventDefault(){prevented=true;}});assert.equal(prevented,true);},reinit(){for(const fn of events.get('astro:page-load')??[])fn();},visible(){return cards.filter(card=>!card.hidden).map(card=>card.dataset.winterOffer);}};
}
const all=selectorHarness('https://banffbound.com/book/banff-winter-activities/?utm_source=google&gclid=example#experiences');
assert.equal(all.nodes.get('winter-experience-form').hidden,false);assert.equal(all.visible().length,3);
all.change('summit');assert.deepEqual(all.visible(),['gyg-256607']);assert.match(all.nodes.get('winter-experience-count').textContent,/1 experience shown/);
let url=new URL(all.window.location.href);assert.equal(url.searchParams.get('experience'),'summit');assert.equal(url.searchParams.get('utm_source'),'google');assert.equal(url.searchParams.get('gclid'),'example');assert.equal(url.hash,'#experiences');
all.reset();assert.equal(all.visible().length,3);url=new URL(all.window.location.href);assert.equal(url.searchParams.has('experience'),false);assert.equal(url.searchParams.get('gclid'),'example');
all.reinit();assert.equal(all.nodes.get('winter-experience-form').listeners.change.length,1,'Repeated initialization must not duplicate control listeners.');
for(const [choice,id]of[['icewalk','gyg-303253'],['summit','gyg-256607'],['road-day','gyg-437912']]){const h=selectorHarness('https://banffbound.com/book/banff-winter-activities/?experience='+choice+'&utm_source=bing&msclkid=example');assert.deepEqual(h.visible(),[id]);assert.equal(new URL(h.window.location.href).searchParams.get('msclkid'),'example');}
for(const query of ['experience=bad','experience=%3Cscript%3E','experience=summit&experience=icewalk']){const h=selectorHarness('https://banffbound.com/book/banff-winter-activities/?'+query+'&utm_campaign=winter');assert.equal(h.visible().length,3);assert.equal(h.nodes.get('winter-experience').value,'all');assert.equal(new URL(h.window.location.href).searchParams.has('experience'),false);assert.equal(new URL(h.window.location.href).searchParams.get('utm_campaign'),'winter');}
const local=selectorHarness('https://banffbound.com/book/banff-winter-activities/?utm_source=google',{blockHistory:true});local.change('road-day');assert.deepEqual(local.visible(),['gyg-437912'],'Filtering still works when history updates are blocked.');

for(const faq of faqs)assert.ok(faq.question&&faq.answer.length>80);assert.equal(faqs.length,4);
for(const message of messages){assert.ok(message.queryIntent&&message.promise);assert.ok(message.target==='#experiences'||offers.some(o=>'#'+o.anchor===message.target));assert.ok(!/GetYourGuide tickets|GYG tickets/i.test(message.queryIntent),'No GYG brand-bidding recommendation.');}
const note=await readFile('research/winter-activity-landing-sources-2026-10-29.md','utf8');
for(const offer of offers)assert.ok(note.includes(offer.productUrl)&&note.includes(offer.operatorUrl));
assert.match(note,/3\.1\.8/);assert.match(note,/3\.1\.10/);assert.match(note,/5\.3/);assert.match(note,/No account-specific paid-traffic approval/);
let layoutPresent=true;try{await access('src/layouts/PaidLandingLayout.astro');}catch{layoutPresent=false;}
console.log(`Winter activity landing checks passed: three exact products/providers and static affiliate links, distinct useful comparisons, access flags before CTA, four matching FAQ schema/visible entries, native SSR links, actual selector/deeplink/reset/ad-parameter regressions, placement attributes, message mapping and source/partner-policy record. Shared layout ${layoutPresent?'present':'integration pending'}; no site build or network request.`);
