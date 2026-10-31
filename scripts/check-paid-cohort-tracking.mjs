import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { consentHarness, validConsent } from './lib/consent-harness.mjs';
import { knownPaidCohort, manualCampaignContext } from '../src/scripts/landingAttribution.js';
import { paidBookingHref, applyPaidBookingAttribution } from '../src/scripts/paidBookingAttribution.js';
const base = 'https://banffbound.com/activities/gondola/';
const paid = base + '?utm_source=google&utm_medium=cpc&utm_campaign=bb_ca_winter_50_test&gclid=private-click&email=private@example.test&utm_term=private-keyword&utm_content=private-content';
const target = 'https://www.getyourguide.com/banff-l284/banff-gondola-admission-t256607/?partner_id=QW960HO&cmp=editorial-default';
const anchor = (override = {}) => ({ href: target, dataset: { affiliateTargetPath: '/banff-l284/banff-gondola-admission-t256607/', paidAffiliateCampaign: 'bb_ca_activities_gondola', ...override } });
assert.equal(knownPaidCohort(paid), 'bb_ca_winter_50_test');
for (const query of ['', '?utm_source=google&utm_medium=cpc&utm_campaign=unknown', '?utm_source=Google&utm_medium=cpc&utm_campaign=bb_ca_winter_50_test', '?utm_source=google&utm_medium=email&utm_campaign=bb_ca_winter_50_test']) {
  assert.equal(knownPaidCohort(base + query), null);
  assert.equal(paidBookingHref(anchor(), base + query), null);
}
assert.equal(knownPaidCohort(paid+'&utm_campaign=other'),null);
assert.equal(paidBookingHref({...anchor(),href:target+'&partner_id=OTHER'},paid),null);
const revised = new URL(paidBookingHref(anchor(), paid));
assert.equal(revised.searchParams.get('cmp'), 'bb_ca_activities_gondola');
assert.equal(revised.searchParams.get('partner_id'), 'QW960HO');
assert.equal(revised.pathname, new URL(target).pathname);
assert.equal(revised.searchParams.size, 2);
assert.equal(paidBookingHref(anchor({ paidAffiliateCampaign:'private@example.test' }), paid), null);
assert.equal(paidBookingHref(anchor({ affiliateTargetPath:'/other/' }), paid), null);
assert.equal(paidBookingHref(anchor({ affiliateTargetPath:undefined }), paid), null);
for (const href of [target.replace('https:', 'http:'), target.replace('www.getyourguide.com','www.getyourguide.com.evil.test'), target.replace('QW960HO','OTHER'), target.replace('www.getyourguide.com','name:password@www.getyourguide.com')]) assert.equal(paidBookingHref({ ...anchor(), href }, paid), null);
const search = { href:'https://www.getyourguide.com/s/?q=Banff+gondola&partner_id=QW960HO', dataset:{affiliateTargetPath:'/s/'} };
assert.equal(new URL(paidBookingHref(search, paid, 'bb_ca_winter_50_test')).searchParams.get('q'),'Banff gondola');
assert.deepEqual(manualCampaignContext(base), {});
assert.equal(manualCampaignContext(paid, 'gondola').campaign_content, 'gondola');
assert.equal(manualCampaignContext(paid, 'private@example.test').campaign_content, undefined);
for (const analytics of [false,true]) for (const advertising of [false,true]) {
  const h = consentHarness({stored:validConsent({analytics,advertising}),initTracking:true,landingId:'activity-guide',pageDataset:{contentId:'gondola',contentType:'activity-guide'},pageHref:paid});
  const click = h.linkClick(target,{cta:true,offerId:'gyg-256607',placement:'article-top'});
  assert.equal(click.prevented,0);
  const event = h.commands.find(command=>command[1]==='affiliate_click');
  assert.equal(Boolean(event),analytics);
  if (event) {
    for (const [key,value] of Object.entries({landing_id:'activity-guide',paid_cohort:'bb_ca_winter_50_test',content_id:'gondola',content_type:'activity-guide',offer_id:'gyg-256607',placement:'article-top'})) assert.equal(event[2][key],value);
    assert.equal(event[2].value,undefined); assert.equal(event[2].transaction_id,undefined);
  }
  const config=h.commands.find(command=>command[0]==='config'&&command[1]==='G-2DP7J42ZW0');
  assert.equal(Boolean(config),analytics);
  if(config){assert.equal(config[2].campaign_name,'bb_ca_winter_50_test');assert.equal(config[2].campaign_id,'24416287886');assert.equal(config[2].campaign_content,'gondola');assert.equal(config[2].page_location,base);}
  assert.ok(!/private-click|private@example|private-keyword|private-content/.test(JSON.stringify(h.commands)));
  assert.equal(h.storage.size,1,'Only existing consent choices are stored.');
}
const wrapper={dataset:{affiliateTargetPath:new URL(target).pathname,paidAffiliateCampaign:'bb_ca_activities_gondola'}};
const authored={href:target,dataset:{},closest:()=>wrapper};
assert.equal(new URL(paidBookingHref(authored,paid)).searchParams.get('cmp'),'bb_ca_activities_gondola');
for(const href of [target.replace('t256607/','t999999/'),'https://www.getyourguide.com/s/?q=Banff&partner_id=QW960HO',target.replace('QW960HO','OTHER')]) assert.equal(paidBookingHref({...authored,href},paid),null,'Unrelated native recommendations retain their original href.');
const inlineHarness=consentHarness({stored:validConsent({analytics:true}),initTracking:true,landingId:'activity-guide',pageDataset:{contentId:'gondola',contentType:'activity-guide',affiliateTargetPath:new URL(target).pathname,offerId:'gyg-256607'},pageHref:paid});
assert.equal(inlineHarness.commands.find(c=>c[1]==='page_view')[2].offer_id,undefined,'A page view is not an offer click.');
inlineHarness.linkClick(target);
const inlineEvent=inlineHarness.commands.filter(c=>c[1]==='affiliate_click').at(-1);
assert.equal(inlineEvent[2].offer_id,'gyg-256607');assert.equal(inlineEvent[2].placement,'article-inline');
inlineHarness.linkClick(target.replace('t256607/','t999999/'));
assert.equal(inlineHarness.commands.filter(c=>c[1]==='affiliate_click').at(-1)[2].offer_id,undefined,'Other product links are not assigned the mapped primary offer.');
// Exercise every fixed SSR campaign label, including separately compared products.
const mapBundle=await build({stdin:{contents:"export {activityCampaignTargets,resolveActivityBookingTarget,resolveActivityBookingAlternatives} from './src/data/activityCampaignTargets.ts';",resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'esm'});
const map=await import(`data:text/javascript;base64,${Buffer.from(mapBundle.outputFiles[0].text).toString('base64')}`);
let fixedOffers=0;
for(const group of map.activityCampaignTargets) for(const offer of [map.resolveActivityBookingTarget(group.guidePath),...map.resolveActivityBookingAlternatives(group.guidePath)]) {
  const rendered={href:offer.bookingUrl,dataset:{affiliateTargetPath:new URL(offer.bookingUrl).pathname,paidAffiliateCampaign:offer.paidCampaignLabel}};
  const next=new URL(paidBookingHref(rendered,paid));
  assert.equal(next.searchParams.get('cmp'),offer.paidCampaignLabel);
  assert.equal(next.pathname,new URL(offer.bookingUrl).pathname);
  assert.equal(next.searchParams.get('partner_id'),'QW960HO');
  assert.equal(paidBookingHref(rendered,base),null,'Editorial organic defaults are preserved.');
  assert.equal(offer.label,offer.launchState==='held'?'Find out more':'Book now');
  fixedOffers++;
}
assert.equal(map.resolveActivityBookingAlternatives('/activities/banff-food-tours/')[0].offerId,'gyg-285990');
assert.ok(fixedOffers>map.activityCampaignTargets.length,'Alternative product labels are covered alongside primary targets.');
const originalDocument=globalThis.document, originalWindow=globalThis.window;
try {
  const link=anchor();
  globalThis.document={body:{dataset:{}},querySelector(){return null;},querySelectorAll(){return[link];}};
  globalThis.window={location:{href:paid}};
  assert.equal(applyPaidBookingAttribution(),1,'Native link labelling needs no consent or vendor call.');
  assert.equal(applyPaidBookingAttribution(),0,'Native labelling is idempotent.');
} finally {globalThis.document=originalDocument;globalThis.window=originalWindow;}
console.log('Paid cohort checks passed: exact fixed campaign/config, SSR target/host/partner guards, organic fallback, no raw query forwarding/storage, four consent combinations, idempotent native referrals and no purchase inference.');
