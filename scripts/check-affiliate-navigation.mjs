import assert from 'node:assert/strict';
import { consentHarness, validConsent } from './lib/consent-harness.mjs';
const destinations = ['https://www.expedia.ca/Hotel-Search?camref=1101l3MtWX','https://www.expedia.ca/Cars?camref=KB6G4xt','https://expedia.com/affiliate/example','https://www.getyourguide.com/banff-l284/?partner_id=QW960HO','https://www.amazon.ca/s?k=gloves&tag=banffbound-20','https://www.vrbo.com/affiliate/example','https://www.vrbo.com/search?camref=1101l3MtWL'];
let checks=0;
for(const tracker of ['available','absent','throws'])for(const analytics of [false,true])for(const advertising of [false,true])for(const href of destinations){
 const h=consentHarness({stored:validConsent({analytics,advertising}),initTracking:true});
 const baseline=h.commands.filter(c=>c[0]==='event').length;
 if(tracker==='absent')h.window.gtag=undefined;
 if(tracker==='throws')h.window.gtag=()=>{throw Error('Tracker blocked');};
 const result=h.linkClick(href,{cta:true});assert.equal(result.prevented,0,'Native provider navigation never waits for tracking.');assert.equal(h.opened,0,'No callback popup or duplicate target.');assert.equal(result.link.target,'_blank');assert.equal(result.link.href,href,'All original affiliate parameters remain on the native link.');
 const sent=h.commands.slice().filter(c=>c[0]==='event').slice(baseline);
 assert.equal(sent.some(c=>c[1]==='affiliate_click'),tracker==='available'&&analytics);
 assert.equal(sent.some(c=>c[1]==='conversion'),tracker==='available'&&advertising);
 for(const command of sent.filter(c=>c[1]==='conversion')){assert.equal(command[2].send_to,'AW-17246982814/8ptcCPuTheAaEJ6lgKBA');assert.equal(command[2].event_callback,undefined);}
 checks++;
}
for(const modifiers of [{ctrlKey:true},{metaKey:true},{shiftKey:true},{button:1}]){const h=consentHarness({stored:validConsent({analytics:true,advertising:true}),initTracking:true});assert.equal(h.linkClick(destinations[0],modifiers).prevented,0);}
const h=consentHarness({stored:validConsent({analytics:true}),initTracking:true});
for(const href of ['https://getyourguide.com.evil.test/?partner_id=QW960HO','https://example.com/?target=https://www.expedia.ca/','https://www.amazon.ca/?tag=some-other-tag','https://www.expedia.com/legal/privacy','https://www.expedia.com/legal/privacy?camref=1101l3MtWX','https://www.getyourguide.com/c/privacy-policy/','https://www.getyourguide.com/c/privacy-policy/?partner_id=QW960HO','https://www.expedia.ca/Hotel-Search?destination=Banff','https://www.getyourguide.com/s/?q=banff','javascript:void(0)'])assert.equal(h.api.affiliatePartner(href),null);
const policies=consentHarness({stored:validConsent({analytics:true,advertising:true}),initTracking:true});
for(const href of ['https://www.expedia.com/legal/privacy','https://www.getyourguide.com/c/privacy-policy/'])policies.linkClick(href);
assert.equal(policies.commands.filter(c=>c[1]==='affiliate_click'||c[1]==='conversion').length,0,'Policy visits must never be affiliate conversions.');
assert.equal(h.api.reportAffiliateConversion(),true);
h.window.gtag=()=>{throw Error('Blocked');};assert.equal(h.api.reportAffiliateConversion(),true);
console.log(`Affiliate navigation checks passed: ${checks} provider/tracker/category cases, native parameters/targets/gestures, no callbacks/popups, independent analytics/Ads gates and host identity.`);
