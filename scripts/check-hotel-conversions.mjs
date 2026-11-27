import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';
import { parse } from 'parse5';
import { consentHarness, validConsent } from './lib/consent-harness.mjs';

const bundle = await build({stdin:{contents:"export * from './src/lib/expediaLinks.ts'; export {directoryHotels, isHotelDirectoryIndexable} from './src/data/hotelDirectory.ts'; export {hotelBookingDestinations} from './src/data/hotelBookingDestinations.ts';",resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'esm',logLevel:'silent'});
const api = await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const links = JSON.parse(await readFile('src/data/expediaAffiliateLinks.json','utf8'));
const reviews = JSON.parse(await readFile('src/data/hotelConversionReviews.json','utf8'));
const raw = 'https://www.expedia.ca/Banff-Hotels-Fairmont-Banff-Springs.h13652.Hotel-Information?camref=1101l3MtWX';
for(const [key,href] of Object.entries(links)){
 const url=new URL(href), target=api.expediaDestination(href);
 assert.equal(url.origin,'https://expedia.com'); assert.equal(url.pathname,'/affiliate');
 assert.equal(url.searchParams.get('camref'),'1101l3MtWX');
 assert.equal(url.searchParams.get('creativeref'),'1011l87781'); assert.match(url.searchParams.get('adref'),/^PZ[a-zA-Z0-9_-]+$/);
 assert.ok(target?.hostname==='www.expedia.ca');
 if(key.startsWith('hotel:'))assert.ok(target.pathname.includes('.h'+key.slice(6)+'.Hotel-Information'));
 assert.equal(api.expediaAffiliateHref(href),href,'Generated links are idempotent');
 if(key.startsWith('hotel:'))assert.equal(api.expediaAffiliateHref(target.href+'?camref=1101l3MtWX'),href);
}
assert.equal(api.expediaAffiliateHref(raw),links['hotel:13652']);
assert.equal(api.expediaAffiliateHref('https://www.expedia.ca/Hotel-Search?destination=Canmore&camref=1101l3MtWX'), links['search:Canmore, Alberta']);
assert.equal(api.expediaAffiliateHref('https://www.expedia.ca/Lake-Louise-Hotels-Baker-Creek-Mountain-Resort.h6584769.Hotel-Information?camref=1101l3MtWX'), links['hotel:7710611']);
const dated=new URL(api.expediaAffiliateHref(raw+'&chkin=2026-12-20&chkout=2026-12-23&rm1=a2&gclid=PRIVATE_CLICK&email=PRIVATE_EMAIL'));
const datedTarget=api.expediaDestination(dated.href);
assert.equal(datedTarget.searchParams.get('chkin'),'2026-12-20');assert.equal(datedTarget.searchParams.get('chkout'),'2026-12-23');assert.equal(datedTarget.searchParams.get('rm1'),'a2');
assert.ok(!dated.href.includes('PRIVATE'));
for(const href of [raw.replace('camref=1101l3MtWX','camref=other-publisher'),raw.replace('www.expedia.ca','www.expedia.ca.evil.test'),raw.replace('https:','http:'),'https://www.expedia.com/legal/privacy?camref=1101l3MtWX','https://www.expedia.ca/?camref=other-publisher','not a URL'])assert.equal(api.expediaAffiliateHref(href),href);
assert.equal(api.expediaDestination('https://expedia.com/affiliate?camref=1101l3MtWX&landingPage=https%3A%2F%2Fevil.test%2F'),null);
const html=`<p title="ordinary content">Keep me</p><a href="${raw.replaceAll('&','&amp;')}">Book now</a><script>const text='<a href="${raw}">';</script><style>/* ${raw} */</style>`;
const replaced=api.rewriteExpediaAnchors(html);
assert.ok(replaced.includes(links['hotel:13652'].replaceAll('&','&amp;')));assert.ok(replaced.includes(`<script>const text='<a href="${raw}">';</script>`));assert.ok(replaced.includes('<p title="ordinary content">Keep me</p>'));
assert.equal(api.rewriteExpediaAnchors(replaced),replaced);
for(const [slug,review]of Object.entries(reviews)){
 const hotel=api.directoryHotels.find(h=>h.slug===slug);
 assert.equal(hotel.sourceStatus,'reviewed');assert.equal(hotel.checkedOn,'2026-11-27');assert.ok(api.isHotelDirectoryIndexable(slug));
 assert.equal(hotel.image,review.facts.image);assert.ok(!hotel.image.includes('unsplash'));assert.equal(hotel.images.length,1);
 assert.ok(hotel.sourceLinks.length>=2&&hotel.address&&hotel.overview.split(/\s+/).length>=50);
 assert.equal(hotel.totalRooms,undefined);assert.equal(hotel.yearBuilt,undefined);assert.equal(hotel.lat,null);assert.equal(hotel.coordinateStatus,'unavailable');
}
assert.equal(api.directoryHotels.find(h=>h.slug==='moxy-banff').address,'555 Banff Avenue, Banff, Alberta T1L 1B5');
assert.equal(api.directoryHotels.find(h=>h.slug==='mount-engadine-lodge').area,'Spray Valley, Kananaskis');
assert.match(api.directoryHotels.find(h=>h.slug==='solara-resort').facilityNote,/no on-site Bellstar front desk/);
for(const [slug,pid]of Object.entries({'hidden-ridge-resort':'3845','solara-resort':'3912100','samesun-banff-hostel':'6596428','emerald-lake-lodge':'191535','pocaterra-inn-waterslide':'64043','super-8-canmore':'21990224'}))assert.ok(api.expediaDestination(api.expediaAffiliateHref(api.hotelBookingDestinations[slug])).pathname.includes('.h'+pid+'.'));
for(const analytics of [false,true]){
 const h=consentHarness({stored:validConsent({analytics}),initTracking:true,pageHref:'https://banffbound.com/hotel-directory/fairmont-banff-springs/?utm_source=google&utm_medium=cpc&utm_campaign=bb_ca_hotels_7_day_test&gclid=PRIVATE_CLICK'});
 const click=h.linkClick(raw,{landingId:'banff-hotels',offerId:'fairmont-banff-springs',placement:'property-mobile'});
 assert.equal(click.prevented,0);assert.equal(click.link.href,links['hotel:13652']);
 const event=h.commands.find(c=>c[1]==='affiliate_click');assert.equal(Boolean(event),analytics);
 if(event){assert.equal(event[2].link_url,'https://www.expedia.ca/Banff-Hotels-Fairmont-Banff-Springs.h13652.Hotel-Information');assert.equal(event[2].offer_id,'fairmont-banff-springs');assert.equal(event[2].paid_cohort,'bb_ca_hotels_7_day_test');assert.ok(!JSON.stringify(event).includes('PRIVATE'));}
}
if(process.argv.includes('--built')){
 const attr=(node,key)=>node.attrs?.find(a=>a.name===key)?.value;
 const walk=(node)=>[node,...(node.childNodes||[]).flatMap(walk)];
 async function files(dir){return(await Promise.all((await readdir(dir,{withFileTypes:true})).map(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]))).flat();}
 let anchors=0,generated=0,rawKnown=0; const unmatched=new Map();
 for(const file of (await files('dist')).filter(f=>f.endsWith('.html'))){
  const nodes=walk(parse(await readFile(file,'utf8')));
  for(const node of nodes.filter(n=>n.tagName==='a')){
   const href=attr(node,'href');if(!href)continue;anchors++;
   assert.equal(api.expediaAffiliateHref(href),href,'Build left a mapped raw referral: '+file+' '+href);
   try{const u=new URL(href);if(['www.expedia.ca','www.expedia.com'].includes(u.hostname)&&u.searchParams.get('camref')==='1101l3MtWX'&&!u.pathname.startsWith('/affiliate')){rawKnown++;unmatched.set(href,(unmatched.get(href)||0)+1);}if(u.hostname==='expedia.com'&&u.pathname==='/affiliate')generated++;}catch{}
  }
  const slug=file.match(/^dist\/hotel-directory\/([^/]+)\/index.html$/)?.[1];
  if(slug&&(!['banff-boundary-lodge','num-ti-jah-lodge','banff-boutique-inn'].includes(slug))){
   const mobile=nodes.find(n=>n.tagName==='a'&&attr(n,'data-landing-placement')==='property-mobile');
   const expected=api.hotelBookingDestinations[slug];if(expected){assert.ok(mobile,'Property mobile CTA: '+slug);assert.equal(attr(mobile,'href'),api.expediaAffiliateHref(expected));}
   if(reviews[slug]){assert.ok(nodes.some(n=>n.tagName==='img'&&attr(n,'src')===reviews[slug].facts.image));assert.ok(!nodes.some(n=>n.tagName==='meta'&&attr(n,'name')==='robots'&&attr(n,'content')?.includes('noindex')));}
  }
 }
 assert.ok(generated>100,'Static pages must contain real affiliate referrals before client code runs');
 assert.equal(unmatched.size,0,'Every published own-publisher raw Expedia destination needs a generated referral');
 console.log(JSON.stringify({builtAnchors:anchors,generatedExpediaAnchors:generated,remainingUnmappedRawDestinations:unmatched.size,remainingUnmappedRawAnchors:rawKnown,unmapped:[...unmatched].slice(0,20)},null,2));
}
console.log('Hotel conversion checks passed: generated referrals, exact property targets, native consent-independent navigation, safe GA4 property/cohort context, and seven sourced guide upgrades.');
