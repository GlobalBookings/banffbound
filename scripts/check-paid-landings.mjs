import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { transform } from '@astrojs/compiler';
import { consentHarness, validConsent } from './lib/consent-harness.mjs';
const pages=['banff-hotels','lake-louise-stays','banff-winter-activities'];
for(const name of ['src/layouts/PaidLandingLayout.astro','src/components/BookingHeader.astro','src/components/BookingFooter.astro',...pages.map(id=>'src/pages/book/'+id+'.astro')]){
 const source=await readFile(name,'utf8');const compiled=await transform(source,{filename:name});assert.deepEqual(compiled.diagnostics.filter(d=>d.severity===1),[],name);
 if(name.includes('/book/')){assert.ok(source.includes('PaidLandingLayout'));assert.ok(source.includes('data-offer-id=')&&source.includes('data-landing-id='));assert.ok(source.includes('data-landing-placement="detail-card"'),'Actual merchant anchors need a stable placement.');if(name.includes('lake-louise'))assert.ok(source.includes('data-landing-placement="comparison-table"'));assert.ok(!/title="[^"]*\| BanffBound/.test(source),'Brand is appended once by BaseLayout.');assert.ok(!/<iframe\b|<script[^>]+src="https?:/i.test(source),'Paid comparisons never require automatic provider embeds.');}
}
const layout=await readFile('src/layouts/PaidLandingLayout.astro','utf8'),base=await readFile('src/layouts/BaseLayout.astro','utf8');assert.ok(layout.includes('focusedLanding')&&layout.includes('data-landing-page='));assert.ok(layout.includes('commission')&&layout.includes('<h1>'));
assert.ok(base.includes('data-paid-landing=')&&base.includes('BookingHeader')&&base.includes('BookingFooter')&&base.includes('!focusedLanding && <ExploreMoreBar'));
const footer=await readFile('src/components/BookingFooter.astro','utf8');for(const path of ['/contact','/privacy','/terms','/editorial'])assert.ok(footer.includes('href="'+path+'"'));assert.ok(footer.includes('data-open-consent'));
for(const landing of pages)for(const source of ['google','bing']){
 const href=`https://banffbound.com/book/${landing}/?utm_source=${source}&utm_medium=cpc&gclid=private-google&msclkid=private-bing&email=private@example.test#compare`;
 for(const analytics of [false,true])for(const advertising of [false,true]){
  const h=consentHarness({stored:validConsent({analytics,advertising}),initTracking:true,paidLanding:true,landingId:landing,pageHref:href});
  const target='https://www.expedia.ca/Hotel-Search?camref=1101l3MtWX';const click=h.linkClick(target,{landingId:landing,offerId:'reviewed-hotel',placement:'card',cta:true});assert.equal(click.prevented,0);assert.equal(click.link.href,target);assert.equal(h.opened,0);assert.equal(h.providerScripts.some(s=>s.src.includes('googlesyndication')),false);
  const affiliate=h.commands.find(c=>c[1]==='affiliate_click');assert.equal(Boolean(affiliate),analytics);
  if(affiliate){assert.equal(affiliate[2].landing_id,landing);assert.equal(affiliate[2].offer_id,'reviewed-hotel');assert.equal(affiliate[2].paid_source,source);assert.equal(affiliate[2].placement,'card');}
  const conversion=h.commands.find(c=>c[1]==='conversion');assert.equal(Boolean(conversion),advertising);if(conversion){assert.equal(conversion[2].landing_id,landing);assert.equal(conversion[2].value,undefined);assert.equal(conversion[2].transaction_id,undefined);}
  const commands=JSON.stringify(h.commands);assert.ok(!/private-google|private-bing|private@example|utm_source=|msclkid=|gclid=/.test(commands));
 }
}
const h=consentHarness();for(const value of ['https://banffbound.com/?utm_source=unknown&utm_medium=cpc','not a URL','https://banffbound.com/?utm_source=google&utm_medium=email'])assert.equal(h.api.paidTrafficSource(value),'not_tagged_paid');assert.equal(h.api.paidTrafficSource('https://banffbound.com/?utm_source=BING&utm_medium=PPC'),'bing');
assert.deepEqual(JSON.parse(JSON.stringify(h.api.cleanLandingContext({landing_id:'invalid',offer_id:'private'}))),{});const bad=h.api.cleanLandingContext({landing_id:'banff-hotels',offer_id:'email@example.com',paid_source:'private',placement:'https://example.com'});assert.deepEqual(JSON.parse(JSON.stringify(bad)),{landing_id:'banff-hotels'});
console.log('Paid landing checks passed: shared layout/navigation/privacy contracts, six Astro transforms, 24 landing/source/consent cases, native referrals, diagnostic click attribution, no raw click IDs/queries, no invented revenue or display ads.');
