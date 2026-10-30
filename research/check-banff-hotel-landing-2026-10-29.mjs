import { restorePriorHotelSource } from './royal-pet-policy-clarification-2026-10-29.mjs';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { transformSync } from 'esbuild';
import { transform } from '@astrojs/compiler';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
function evaluate(source, args = {}) {
  const module = { exports: {} };
  new Function('module', 'exports', ...Object.keys(args), transformSync(source, { loader: 'ts', format: 'cjs' }).code)(module, module.exports, ...Object.values(args));
  return module.exports;
}
const { hotels } = evaluate(read('src/data/hotels.ts'));
const { directoryHotels } = evaluate(read('src/data/hotelDirectory.ts').replace(/^import[^\n]+\n/, ''), { hotels });
const model = evaluate(read('src/data/banffHotelLanding.ts').replace(/^import[^\n]+\n/, ''), { directoryHotels });
const { banffHotelLandingOffers: offers, banffHotelBaseOptions: bases, banffHotelPriorityOptions: priorities, banffHotelLandingSchema: schema } = model;
let assertions = 0;
const check = (condition, message) => { assertions++; if (!condition) throw new Error(message); };
const digest = data => createHash('sha256').update(data).digest('hex');
for (const [file,hash] of Object.entries({
  'src/data/hotels.ts':'2fff1117432d359cfdfea771c5e36153dbf37107e9609e7d5430a7bd9eb34e48',
  'src/data/hotelDirectory.ts':'bba710c243ef3cd64256e51adb8d54898bf200bc0db8090c5b21b197ed44492f',
  'src/pages/hotel-directory/index.astro':'1125c296d95b40f218c4dad2f2a7af9dbbfc861bdd8a65677be7ba60a396dacf',
  'src/pages/hotel-directory/[slug].astro':'c5c80421cb748a2307520e698e128887f23c10c825a4cd51fa7b81c93d151b9d',
})) check(digest(restorePriorHotelSource(file, read(file)))===hash,'Frozen directory foundation changed during landing work: '+file);
const expected = [
  ['moose-hotel-suites', '14703440', '345 Banff'],
  ['mount-royal-hotel', '688930', '138 Banff'],
  ['tunnel-mountain-resort', '16324', '502 Tunnel'],
  ['canalta-lodge', '888459', '545 Banff'],
  ['juniper-hotel', '1216217', '1 Juniper'],
  ['fairmont-banff-springs', '13652', '405 Spray'],
];
check(offers.length === 6 && new Set(offers.map(o => o.slug)).size === 6, 'Exactly six distinct hotel offers required');
check(model.banffHotelLandingId === 'banff-hotels' && model.banffHotelLandingCheckedOn === '2026-10-29', 'Landing attribution/date contract changed');
check(JSON.stringify(offers.map(o => o.slug)) === JSON.stringify(expected.map(o => o[0])), 'Selected stay plans changed without source review');
for (const [slug, id, address] of expected) {
  const offer = offers.find(o => o.slug === slug), property = directoryHotels.find(h => h.slug === slug);
  const booking = new URL(offer.expediaUrl), evidence = new URL(offer.expediaIdentitySource);
  check(property.sourceStatus === 'reviewed' && offer.image === property.image && offer.name === property.name, 'Source-reviewed identity/photo lost: '+slug);
  check(offer.expediaUrl === property.expediaUrl && booking.hostname === 'www.expedia.ca' && booking.protocol === 'https:' && booking.searchParams.get('camref') === '1101l3MtWX', 'Frozen provider URL or affiliate ID changed: '+slug);
  check(offer.bookingTargetKind === 'verified-property' && offer.expediaPropertyId === id && booking.pathname.includes(`.h${id}.Hotel-Information`) && evidence.hostname === 'www.expedia.ca' && evidence.pathname.includes(`.h${id}.`), 'Merchant identity evidence/target mismatch: '+slug);
  check(offer.expediaAddress.startsWith(address) && offer.checkedOn === '2026-10-29', 'Merchant street/date evidence missing: '+slug);
  check(offer.officialSources.length > 0 && offer.officialSources.every(s => new URL(s.url).protocol === 'https:') && offer.profileUrl === `/hotel-directory/${slug}/`, 'Official sources or property route missing: '+slug);
  check(offer.summary.split(/\s+/).length >= 30 && offer.room.length > 60 && offer.kitchen.length > 40 && offer.tradeoff.length > 80, 'Thin comparison card: '+slug);
  check(!('stars' in offer) && !('avgPrice' in offer) && !('reviewScore' in offer) && !('reviewCount' in offer) && !/\$\s*\d|\d+%|guaranteed|best price|free cancellation/i.test(JSON.stringify(offer)), 'Unsupported sales/rate/review promise: '+slug);
}
check(!/aggregateRating|starRating|priceRange|"offers"|availability|GeoCoordinates/.test(JSON.stringify(schema)), 'Booking or location guarantees escaped into schema');
check(schema['@type'] === 'CollectionPage' && schema.mainEntity.numberOfItems === 6 && schema.mainEntity.itemListElement.every(i => new URL(i.url).pathname.startsWith('/hotel-directory/')), 'Collection schema does not describe the actual comparison');
const get = slug => offers.find(o => o.slug === slug);
check(!get('mount-royal-hotel').priorities.includes('soak') && /both rooftop hot tubs closed/.test(get('mount-royal-hotel').notice), 'Mount Royal closure hidden or included as a soak match');
check(get('tunnel-mountain-resort').priorities.includes('cook') && !/hot tub/i.test(get('tunnel-mountain-resort').facilities), 'Tunnel Mountain kitchen/pool distinction regressed');
check(!get('moose-hotel-suites').priorities.includes('cook') && /no full cooking kitchen/.test(get('moose-hotel-suites').kitchen), 'Moose nook presented as full kitchen');
check(/10 AM–6 PM/.test(get('juniper-hotel').tradeoff) && /sidewalks and lighting/.test(get('juniper-hotel').tradeoff), 'Juniper return/walking tradeoff missing');
check(/Family Suite/.test(get('fairmont-banff-springs').room) && /405 Spray/.test(get('fairmont-banff-springs').tradeoff), 'Fairmont room/base distinction missing');
check(/courtyard hot tub/.test(get('canalta-lodge').imageAlt) && /bell service/.test(get('fairmont-banff-springs').imageAlt), 'Image captions no longer identify the inspected content');

const page = read('src/pages/book/banff-hotels.astro');
check(page.includes("../../layouts/PaidLandingLayout.astro") && page.includes('slot="hero-detail"'), 'Shared paid-layout contract missing');
check(page.includes('offers.map(offer => <article') && page.includes('href={offer.expediaUrl}') && !page.includes('innerHTML'), 'Complete native SSR offer cards missing');
check(page.includes('rel="sponsored noopener"') && page.includes('data-landing-id={banffHotelLandingId}') && page.includes('data-offer-id={offer.slug}'), 'Affiliate or consented-measurement anchor contract missing');
check(page.indexOf('Affiliate links:') < page.indexOf('href={offer.expediaUrl}'), 'Disclosure must precede the first affiliate CTA');
check(page.includes('class="fit-controls" hidden') && page.includes('<noscript>') && page.includes('Each booking link works without JavaScript.'), 'No-JS path or progressive controls missing');
for (const id of ['hotel-base','hotel-priority']) check(page.includes(`for="${id}"`) && page.includes(`id="${id}"`), 'Unlabelled native filter: '+id);
check(page.includes('aria-live="polite"') && page.includes('type="reset"') && page.includes(':focus-visible') && page.includes('@media (max-width: 600px)'), 'Accessible responsive/filter/reset handling missing');
const client = page.match(/<script is:inline>\s*([\s\S]*?)<\/script>/)[1];
check(!/fetch\s*\(|sendBeacon|XMLHttpRequest|localStorage|preventDefault\s*\(|window\.open|location\.(?:href|assign)\s*=/.test(client), 'Filter script must not track, store or replace native booking navigation');

class Element {
  constructor(name='') { this.name=name;this.value='all';this.dataset={};this.events={};this.hidden=false;this.textContent='';this.options=[]; }
  addEventListener(type, fn) { this.events[type] = fn; }
  fire(type) { this.events[type]?.(); }
  reset() { this.fire('reset'); }
}
function setup(search='') {
  const ids = Object.fromEntries(['banff-hotel-fit','hotel-base','hotel-priority','hotel-fit-count','hotel-fit-empty','hotel-fit-clear'].map(id => [id,new Element()]));
  ids['hotel-base'].name='base';ids['hotel-base'].options=bases;
  ids['hotel-priority'].name='priority';ids['hotel-priority'].options=priorities;
  ids['banff-hotel-fit'].hidden=true;
  const cards = offers.map(o => Object.assign(new Element(), { dataset:{ base:o.base, priorities:o.priorities.join(' '), slug:o.slug } }));
  const documentEvents = {};
  vm.runInNewContext(client, { document:{ getElementById:id=>ids[id],querySelectorAll:()=>cards,addEventListener:(name,fn)=>documentEvents[name]=fn },window:{location:{search}},URLSearchParams,Array });
  return { ids,cards,shown:()=>cards.filter(c=>!c.hidden),choose(id,value){ids[id].value=value;ids[id].fire('change');},reload(){documentEvents['astro:page-load']();} };
}
const ui=setup();check(ui.shown().length===6&&!ui.ids['banff-hotel-fit'].hidden,'Default six-card comparison not usable');
ui.choose('hotel-base','central');check(ui.shown().length===2,'Central filter mismatch');
ui.choose('hotel-priority','soak');check(ui.shown().length===1&&ui.shown()[0].dataset.slug==='moose-hotel-suites','Closed Mount Royal offered as a central soak match');
ui.ids['banff-hotel-fit'].reset();check(ui.shown().length===6&&ui.ids['hotel-base'].value==='all'&&ui.ids['hotel-priority'].value==='all','Native reset does not restore all cards');
ui.choose('hotel-priority','cook');check(ui.shown().length===2,'Full-kitchen category filter mismatch');
ui.choose('hotel-base','hillside');check(ui.shown().length===1&&ui.shown()[0].dataset.slug==='tunnel-mountain-resort','Combined kitchen/hillside filter mismatch');
ui.choose('hotel-base','spray');check(ui.shown().length===0&&!ui.ids['hotel-fit-empty'].hidden&&ui.ids['hotel-fit-count'].textContent==='0 hotel choices to compare','Empty combination lacks truthful result/reset');
ui.ids['hotel-fit-clear'].fire('click');check(ui.shown().length===6&&ui.ids['hotel-fit-empty'].hidden,'Empty-state reset broken');
ui.choose('hotel-priority','separate');check(ui.shown().length===3,'Separate-bedroom category filter mismatch');
ui.reload();check(ui.shown().length===3,'Repeated page initialization resets active filters');
const valid=setup('?base=hillside&priority=cook&utm_source=google');check(valid.shown().length===1&&valid.shown()[0].dataset.slug==='tunnel-mountain-resort','Bounded ad-message filter link broken');
const invalid=setup('?base=beach&priority=cheapest');check(invalid.shown().length===6,'Invalid query created a misleading filter');

const compiled = await transform(page, { filename:'src/pages/book/banff-hotels.astro' });
check(compiled.diagnostics.length===0,'Landing Astro compiler diagnostics: '+JSON.stringify(compiled.diagnostics));
console.log(JSON.stringify({assertions,offers:6,verifiedMerchantTargets:6,camref:'1101l3MtWX',defaultNoJsCards:6,fullKitchenMatches:2,hotPoolOrTubMatches:3,separateBedroomMatches:3,compilerDiagnostics:0,paidLayoutPresent:fs.existsSync(path.join(root,'src/layouts/PaidLandingLayout.astro'))},null,2));
