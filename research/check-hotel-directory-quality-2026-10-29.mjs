import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { transformSync } from 'esbuild';
import { transform } from '@astrojs/compiler';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
function evaluate(source, args = {}) {
  const module = { exports: {} };
  new Function('module', 'exports', ...Object.keys(args), transformSync(source, { loader:'ts', format:'cjs' }).code)(module, module.exports, ...Object.values(args));
  return module.exports;
}
const { hotels } = evaluate(read('src/data/hotels.ts'));
const model = evaluate(read('src/data/hotelDirectory.ts').replace(/^import[^\n]+\n/, ''), { hotels });
const { directoryHotels, directoryHotel, hotelDirectorySchema, isHotelDirectoryIndexable, unreviewedHotelDirectorySlugs, banffTownHotelReviewSlugs } = model;
let assertions = 0;
const check = (condition, message) => { assertions++; if (!condition) throw new Error(message); };
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
check(hotels.length === 95 && directoryHotels.length === 95 && new Set(directoryHotels.map(h => h.slug)).size === 95, 'All 95 identities/routes must remain discoverable');
check(digest(hotels.map(h => [h.slug,h.name,h.expediaUrl])) === '18d4c39bbe88ad1221c66f86cf7c535e4e7fb6e173933e4639d6e8d84dec370d', 'Hotel identity/provider URL changed');
const previousTwelve = ['moose-hotel-suites','mount-royal-hotel','tunnel-mountain-resort','blackstone-mountain-lodge','lake-louise-inn','fairmont-chateau-lake-louise','sunshine-mountain-lodge','emerald-lake-lodge','hi-lake-louise-alpine-centre','douglas-fir-resort','banff-boundary-lodge','rundle-mountain-lodge'];
check(digest(previousTwelve.map(slug => hotels.find(h => h.slug === slug))) === '3f2a16ecb3e8415b9baff59c550d2d29367f8116c1796a4979c4a53f6baab858', 'Previously reviewed twelve facts/photos/coordinates changed');
const priorTwentyFour = ["fairmont-banff-springs", "rimrock-banff", "moose-hotel-suites", "tunnel-mountain-resort", "mount-royal-hotel", "sunshine-mountain-lodge", "castle-mountain-chalets", "storm-mountain-lodge", "blackstone-mountain-lodge", "fairmont-chateau-lake-louise", "lake-louise-inn", "baker-creek-by-basecamp", "hi-lake-louise-alpine-centre", "emerald-lake-lodge", "douglas-fir-resort", "falcon-crest-lodge", "stoneridge-mountain-resort", "copperstone-resort", "rundle-mountain-lodge", "hi-castle-mountain-hostel", "cathedral-mountain-lodge", "banff-boundary-lodge", "inns-of-banff", "banff-international-hotel"];
check(digest(priorTwentyFour.map(slug => hotels.find(h => h.slug === slug))) === '68906afcb1a9d241704015b32bdb3c41d2668e252d8ea284dac4d8a0f11b2200', 'Prior 24 raw records changed');
check(digest(priorTwentyFour.map(slug => directoryHotels.find(h => h.slug === slug))) === '079f550fbf26febbab89187adc2ad9c9040c249b88a881266c89fd7f48557b92', 'Prior 24 source scopes/facts/GPS changed');
const statuses = { reviewed:35, 'location-only':1, 'former-name':2, unreviewed:57 };
for (const [status,count] of Object.entries(statuses)) check(directoryHotels.filter(h => h.sourceStatus === status).length === count, 'Source status count mismatch: '+status);
check(unreviewedHotelDirectorySlugs.size === 57 && directoryHotels.filter(h => isHotelDirectoryIndexable(h.slug)).length === 38, 'Indexability coverage mismatch');
check(!isHotelDirectoryIndexable('made-up-property') && !isHotelDirectoryIndexable('banff-boundary-lodge?query=1'), 'Unknown slug became indexable');
check(directoryHotels.filter(h => h.image).length === 34, 'Unexpected public property-image coverage');
let precisePoints = 0;
for (const hotel of directoryHotels) {
  const raw = hotels.find(h => h.slug === hotel.slug);
  check(hotel.name === raw.name && hotel.expediaUrl === raw.expediaUrl, 'Projection changed identity or provider target');
  check(new URL(hotel.expediaUrl).searchParams.get('camref') === '1101l3MtWX', 'Affiliate ID changed');
  check(hotel.reviewScore === undefined && hotel.reviewCount === undefined && hotel.guestLoves === undefined && !/\$\s*\d/.test(hotel.avgPrice), 'Unverified review/rate field exposed');
  const schema = hotelDirectorySchema(hotel), json = JSON.stringify(schema);
  check(!/"(?:aggregateRating|reviewCount|priceRange|offers|starRating)"\s*:/.test(json), 'Unverified booking/review schema emitted');
  if (hotel.sourceStatus === 'unreviewed' || hotel.sourceStatus === 'former-name') {
    check(!hotel.image && !hotel.images.length && !hotel.address && !hotel.roomFeatures?.length && !hotel.amenities?.length && !hotel.dining && !hotel.policies && !hotel.totalRooms && !hotel.checkIn && !hotel.yearBuilt, 'Legacy property claim escaped projection: '+hotel.slug);
    check(schema['@type'] === 'WebPage' && !/GeoCoordinates|PostalAddress|"image"|"Hotel"|"Resort"/.test(json), 'Legacy record asserts unverified lodging schema');
  }
  if (hotel.sourceStatus === 'unreviewed') check(unreviewedHotelDirectorySlugs.has(hotel.slug) && !isHotelDirectoryIndexable(hotel.slug), 'Unreviewed route not excluded');
  else check(isHotelDirectoryIndexable(hotel.slug) && hotel.sourceLinks.length > 0, 'Sourced scope missing evidence/indexability');
  const geo = schema.geo || schema.about?.geo;
  if (geo) {
    precisePoints++;
    check(hotel.coordinateStatus === 'source-verified' && Boolean(hotel.coordinateSource), 'Unverified precise geo emitted');
  }
  if (hotel.coordinateStatus !== 'source-verified') check(hotel.lat === null && hotel.lng === null && !geo, 'Unverified map point escaped projection');
}
check(precisePoints === 6, 'Six directly sourced points must survive');
for (const [slug,lat,lng] of [['fairmont-chateau-lake-louise',51.416787,-116.212386],['lake-louise-inn',51.4286653,-116.1848642],['banff-boundary-lodge',51.125783,-115.3874]]) {
  const h = directoryHotels.find(h => h.slug === slug);check(h.lat === lat && h.lng === lng, 'Protected sourced coordinate changed');
}
for (const [slug,lat,lng,source] of [['fairmont-banff-springs',51.164332,-115.56183,'https://all.accor.com/hotel/A550/index.en.shtml'],['rimrock-banff',51.151834,-115.559831,'https://all.accor.com/hotel/C1W0/index.en.shtml']]) {
  const h = directoryHotels.find(h => h.slug === slug);
  check(h.lat === lat && h.lng === lng && h.coordinateSource === source && h.coordinateCheckedOn === '2026-10-29', 'New publisher point/date mismatch');
  check(h.sourceStatus === 'reviewed' && h.checkedOn === '2026-10-29' && h.image && !h.images.some(i => /unsplash/.test(i)), 'Core Banff review/photo contract missing');
}
const springs = directoryHotels.find(h => h.slug === 'fairmont-banff-springs');
check(springs.totalRooms === 724 && springs.checkOut === 'By 12:00 PM' && springs.area === 'Spray Avenue' && springs.roomFeatures.some(f => f.includes('roll-in')), 'Banff Springs category/count/checkout correction regressed');
const rimrock = directoryHotels.find(h => h.slug === 'rimrock-banff');
check(rimrock.area === 'Sulphur Mountain' && !/Marriott|Eden|Primrose|Larkspur|343|2023/.test(JSON.stringify(rimrock)) && rimrock.roomFeatures.some(f => f.includes('hotel view')) && rimrock.description.includes('October 2026'), 'Rimrock operator/location/category/opening correction regressed');
const poison = directoryHotel({...hotels.find(h => h.slug === 'banff-rocky-mountain-resort'),checkedOn:'2099-01-01',officialUrl:'https://example.com',amenities:['Guaranteed spa'],image:'https://example.com/hotel.jpg',coordinateStatus:'indicative',lat:51,lng:-115});
check(poison.sourceStatus === 'unreviewed' && !poison.image && !poison.amenities.length && poison.lat === null, 'An arbitrary date/provider URL promoted a legacy record');
const copper = directoryHotels.find(h => h.slug === 'copperstone-resort');
check(copper.area === 'Bow Valley' && copper.address.includes('Dead Man') && copper.coordinateStatus === 'unavailable' && !copper.amenities.some(a => /indoor pool/i.test(a)), 'Copperstone location/facility correction regressed');
check(directoryHotels.find(h => h.slug === 'cathedral-mountain-lodge').area === 'Yoho National Park', 'Cathedral geography regressed');
check(directoryHotels.find(h => h.slug === 'hi-castle-mountain-hostel').roomFeatures.some(f => f.includes('14-bed')), 'HI Castle category lost');

check(banffTownHotelReviewSlugs.length === 14 && new Set(banffTownHotelReviewSlugs).size === 14, 'Exactly fourteen unique new reviews required');
for (const slug of banffTownHotelReviewSlugs) {
  const h = directoryHotels.find(h => h.slug === slug), raw = hotels.find(h => h.slug === slug);
  check(!priorTwentyFour.includes(slug) && h.sourceStatus === 'reviewed' && h.checkedOn === '2026-10-29' && isHotelDirectoryIndexable(slug), 'New review scope/date/indexability mismatch');
  check(h.sourceLinks.length >= 3 && h.roomFeatures.length >= 4 && h.amenities.length >= 4 && h.overview.split(/\s+/).length >= 40, 'New profile lacks substantive room/facility/source scope: '+slug);
  check(h.image && h.images.length === 1 && !/unsplash|BanffSprings/i.test(h.image), 'New profile has unsupported gallery: '+slug);
  check(raw.reviewScore === undefined && raw.reviewCount === undefined && raw.guestLoves === undefined && raw.stars === undefined && raw.avgPrice === 'Check your dates', 'New raw record retains synthetic review/rate claim: '+slug);
}
const park = directoryHotels.find(h => h.slug === 'banff-park-lodge');
check(park.lat === 51.177930 && park.lng === -115.573620 && park.coordinateSource === 'https://www.banffparklodge.com/contact-us/' && park.coordinateCheckedOn === '2026-10-29', 'BPL publisher point/date mismatch');
check(park.address.startsWith('201 Lynx') && /222 Lynx/.test(park.overview) && /renovation/i.test(park.operationNote), 'BPL current-address/arrival/renovation caveat missing');
const town = slug => directoryHotels.find(h => h.slug === slug);
check(town('hotel-canoe-suites').address.includes('2000–600') && !town('hotel-canoe-suites').address.includes('Marten'), 'Canoe legacy address survived');
check(town('charltons-banff').address.startsWith('513') && town('charltons-banff').roomFeatures.some(f => /semi-private/.test(f)), 'Charltons location/layout correction missing');
check(town('royal-canadian-lodge').description.includes('InnVest') && !/Marriott|Delta/.test(JSON.stringify(town('royal-canadian-lodge'))), 'Royal Canadian current brand regressed');
check(town('peaks-hotel-suites').address.startsWith('218 Lynx') && town('peaks-hotel-suites').amenities.some(a => /across the street/.test(a)) && /across the street/.test(town('peaks-hotel-suites').operationNote), 'Peaks off-site facility distinction missing');
for (const slug of ['fox-hotel-suites','banff-caribou-lodge-spa','banff-aspen-lodge','banff-ptarmigan-inn','canalta-lodge']) check(!town(slug).amenities.some(a => /swimming pool/i.test(a)), 'Unverified swimming-pool amenity survived: '+slug);
check(town('elk-avenue-hotel').dining.includes('Farm & Fire') && !town('elk-avenue-hotel').dining.includes('Brazen'), 'Elk dining identity regressed');
check(town('buffalo-mountain-lodge').roomFeatures.some(f => /no air conditioning/.test(f)) && town('canalta-lodge').roomFeatures.some(f => /Standard rooms only/.test(f)), 'Material cooling/pet category caveat missing');

const index = read('src/pages/hotel-directory/index.astro'), detail = read('src/pages/hotel-directory/[slug].astro');
class Element {
  constructor(tag='div') { this.tagName=tag;this.children=[];this.dataset={};this.style={};this.events={};this.value='all';this.options=[];this.attributes={};this.hidden=true;this.textContent='';this.classList={add(){},remove(){}}; }
  addEventListener(name,fn){this.events[name]=fn;} fire(name){this.events[name]?.();} setAttribute(key,value){this.attributes[key]=value;} appendChild(child){this.children.push(child);return child;} remove(){this.removed=true;}
}
const client = index.match(/<script is:inline define:vars=\{\{ hotelData \}\}>([\s\S]*?)<\/script>/)[1];
function setup(query='') {
  const ids=Object.fromEntries(['search-input','area-filter','type-filter','price-filter','source-filter','clear-filters','result-count','grid-view-btn','map-view-btn','map-container','hotel-grid','map-status','map-result-count','filters','view-controls'].map(id=>[id,new Element()]));
  for(const [id,values] of Object.entries({'area-filter':['all',...new Set(directoryHotels.map(h=>h.area))],'type-filter':['all',...new Set(directoryHotels.map(h=>h.type))],'price-filter':['all','$','$$','$$$','$$$$'],'source-filter':['all',...Object.keys(statuses)]}))ids[id].options=values.map(value=>({value}));
  ids['search-input'].value='';ids['map-container'].style.display='none';
  const cards=directoryHotels.map(h=>Object.assign(new Element('a'),{dataset:{slug:h.slug,name:h.name.toLowerCase(),area:h.area,type:h.type,price:h.priceRange,source:h.sourceStatus}}));
  const head=new Element('head'),timers=new Map();let timerId=0;const markers=[],visible=new Set();
  const map={setView(){return this;},fitBounds(points){this.fitted=points;},invalidateSize(){this.invalidations=(this.invalidations||0)+1;},remove(){visible.clear();}};
  const leaflet={map:()=>map,tileLayer:()=>({addTo(){}}),latLngBounds:points=>points,marker(point,options){const marker={point,options,getLatLng(){return point;},addTo(){visible.add(this);return this;},remove(){visible.delete(this);},bindPopup(popup){this.popup=popup;return this;}};markers.push(marker);return marker;}};
  const window={location:{search:query},setTimeout:fn=>{timers.set(++timerId,fn);return timerId;},clearTimeout:id=>timers.delete(id)};
  const hotelData=JSON.stringify(directoryHotels.map(h=>({slug:h.slug,name:h.name,area:h.area,type:h.type,price:h.priceRange,lat:h.lat,lng:h.lng,img:h.image,coordinateStatus:h.coordinateStatus,coordinateSource:h.coordinateSource,coordinateNote:h.coordinateNote,sourceStatus:h.sourceStatus,sourceStatusLabel:h.sourceStatusLabel,destinationSearch:/\/Hotel-Search(?:[/?#]|$)/i.test(h.expediaUrl)})));
  vm.runInNewContext(client,{hotelData,document:{getElementById:id=>ids[id],querySelectorAll:()=>cards,createElement:tag=>new Element(tag),head},window,URLSearchParams,Number,Math,Array,Set,Error,encodeURIComponent});
  return{ids,cards,markers,visible,map,scripts:head.children,timers,shown:()=>cards.filter(c=>c.style.display!=='none'),choose(id,value){ids[id].value=value;ids[id].fire(id==='search-input'?'input':'change');},load(){window.L=leaflet;head.children.at(-1).onload();}};
}
const ui=setup();check(ui.shown().length===95&&!ui.ids.filters.hidden,'Complete default discovery grid/controls missing');
ui.choose('source-filter','reviewed');check(ui.shown().length===35,'Reviewed source filter wrong');
ui.choose('area-filter','Canmore');check(ui.shown().length===4,'Combined reviewed/Canmore filter wrong');
ui.ids['clear-filters'].fire('click');check(ui.shown().length===95&&ui.ids['source-filter'].value==='all','Reset incomplete');
ui.choose('source-filter','location-only');ui.ids['map-view-btn'].fire('click');ui.ids['map-view-btn'].fire('click');check(ui.scripts.length===1,'Duplicate map load request');ui.load();
check(ui.markers.length===6&&ui.visible.size===1&&ui.map.fitted.length===1,'Map source/filter contract wrong');
const boundary=[...ui.visible][0];check(boundary.popup.children.every(c=>c.tagName!=='img')&&boundary.popup.children.some(c=>c.textContent==='Property photo unavailable'),'Boundary popup uses false photo');
ui.choose('source-filter','unreviewed');check(ui.shown().length===57&&ui.visible.size===0,'Legacy source filter exposes pins or loses discovery records');
ui.choose('source-filter','former-name');check(ui.shown().length===2&&ui.visible.size===0,'Former-name filter wrong');
ui.ids['clear-filters'].fire('click');ui.choose('search-input','Copperstone');check(ui.shown().length===1&&ui.visible.size===0,'Copperstone query has wrong point/results');
ui.ids['clear-filters'].fire('click');ui.choose('area-filter','Spray Avenue');check(ui.shown().length===1&&ui.visible.size===1,'Spray Avenue area filter/pin mismatch');
ui.choose('area-filter','Sulphur Mountain');check(ui.shown().length===1&&ui.visible.size===1,'Sulphur Mountain area filter/pin mismatch');
ui.ids['grid-view-btn'].fire('click');ui.ids['map-view-btn'].fire('click');check(ui.scripts.length===1&&ui.ids['map-view-btn'].attributes['aria-pressed']==='true','Map toggles reload or lose accessibility state');
const valid=setup('?source=reviewed&area=Canmore');check(valid.shown().length===4,'Source/area URL filters broken');
const strip=setup('?source=reviewed&area=Banff%20Avenue%20hotel%20strip');check(strip.shown().length===7,'Banff Avenue strip source/area filter broken');
const invalid=setup('?source=unknown&area=nowhere&price=free&type=Boat');check(invalid.shown().length===95,'Invalid URL filters alter results');
const failure=setup();failure.ids['map-view-btn'].fire('click');const obsolete=failure.scripts[0];obsolete.onerror();check(failure.ids['hotel-grid'].style.display===''&&failure.ids['map-status'].textContent.includes('could not load'),'Map failure hides grid');
failure.ids['map-view-btn'].fire('click');failure.load();obsolete.onload();check(failure.markers.length===6,'Late failed load duplicates markers');
const timeout=setup();timeout.ids['map-view-btn'].fire('click');[...timeout.timers.values()][0]();check(timeout.ids['hotel-grid'].style.display===''&&timeout.ids['map-container'].style.display==='none','Map timeout hides complete results');
for(const [filename,source] of [['src/pages/hotel-directory/index.astro',index],['src/pages/hotel-directory/[slug].astro',detail]]) {
  const result=await transform(source,{filename});check(result.diagnostics.length===0,'Astro compiler diagnostics: '+filename+' '+JSON.stringify(result.diagnostics));
}
check(detail.includes('noindex={!isHotelDirectoryIndexable(hotel.slug)}'),'Unreviewed detail noindex contract missing');
check(index.includes('<noscript>')&&index.includes('hotels.map(hotel =>')&&index.includes('hidden>'),'Complete no-JS discovery content missing');
check(index.includes('data-source={hotel.sourceStatus}')&&index.includes('source-filter'),'Source-status controls missing');
check(detail.includes('hotelDirectorySchema(hotel)')&&detail.includes('sourceLinks.map'),'Shared safe schema/source contract bypassed');
console.log(JSON.stringify({assertions,discoveryRecords:95,indexableDetails:38,noindexDetails:57,reviewedFacts:35,locationOnly:1,formerNameHistories:2,newPropertyReviewsThisPhase:14,sourceMapPoints:6,propertyPhotoProfiles:34,protectedPriorScopes:24,identityHash:digest(hotels.map(h=>[h.slug,h.name,h.expediaUrl])),compilerDiagnostics:0},null,2));
