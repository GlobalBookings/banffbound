import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
const source=await readFile('src/scripts/tracking.js','utf8');
function click({href='https://www.expedia.ca/Hotel-Search?camref=1101l3MtWX',tracker='available',conversion='available',modifiers={}}={}){
 const handlers=[];const events=[];let prevented=0;let opened=0;let conversions=0;
 const context={
  URL,Date,setInterval:()=>0,setTimeout:()=>0,clearTimeout:()=>{},
  document:{title:'Hotel options',hidden:false,documentElement:{scrollHeight:2000},addEventListener(type,handler){if(type==='click')handlers.push(handler);}},
  window:{location:{pathname:'/hotels/',hostname:'banffbound.com'},innerHeight:800,scrollY:0,addEventListener(){},open(){opened++;}},
 };
 if(tracker!=='absent')context.gtag=(...args)=>{if(tracker==='throws')throw new Error('blocked');events.push(args);};
 if(conversion!=='absent')context.gtag_report_conversion=()=>{conversions++;if(conversion==='throws')throw new Error('blocked');/* No callback ever arrives. */};
 vm.runInNewContext(source,context);
 const link={href,textContent:'Check dates',target:'_blank'};
 const event={target:{closest(selector){return selector==='a[href]'?link:null;}},button:0,defaultPrevented:false,preventDefault(){prevented++;this.defaultPrevented=true;},...modifiers};
 for(const handler of handlers)handler(event);
 return {prevented,opened,events,conversions,link};
}
for(const tracker of ['available','absent','throws']){
 for(const conversion of ['available','absent','throws']){
  const result=click({tracker,conversion});
  assert.equal(result.prevented,0,'Provider navigation never waits for analytics');
  assert.equal(result.opened,0,'Do not create callback popups or duplicate the anchor target');
  assert.equal(result.link.target,'_blank');
  if(tracker==='available')assert(result.events.some(event=>event[1]==='affiliate_click'));
 }
}
for(const modifiers of [{ctrlKey:true},{metaKey:true},{shiftKey:true},{button:1}])assert.equal(click({modifiers}).prevented,0,'Keep browser navigation gestures');
for(const href of ['https://www.getyourguide.com/s/?partner_id=QW960HO','https://www.amazon.ca/s?k=gloves&tag=banffbound-20','https://www.vrbo.com/affiliate/example'])assert.equal(click({href}).prevented,0);
const layout=await readFile('src/layouts/BaseLayout.astro','utf8');
const start=layout.indexOf('      window.dataLayer =');
const end=layout.indexOf('</script>',start);
const sandbox={dataLayer:[],open(){throw new Error('Unexpected popup');}};sandbox.window=sandbox;
vm.runInNewContext(layout.slice(start,end),sandbox);
assert.equal(sandbox.gtag_report_conversion('https://example.com'),true);
const event=sandbox.dataLayer.at(-1);
assert.equal(event[1],'conversion');
assert.equal(event[2].send_to,'AW-17246982814/8ptcCPuTheAaEJ6lgKBA');
assert.equal(event[2].event_callback,undefined,'Analytics completion cannot become a navigation gate');
sandbox.gtag=()=>{throw new Error('blocked');};
assert.equal(sandbox.gtag_report_conversion(),true);
console.log('Affiliate navigation checks passed: unavailable/throwing trackers, missing callbacks, native targets and browser gestures.');
