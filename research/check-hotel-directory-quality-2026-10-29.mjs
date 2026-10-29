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
const { directoryHotels, directoryHotel, hotelDirectorySchema, isHotelDirectoryIndexable, unreviewedHotelDirectorySlugs } = model;
let assertions = 0;
const check = (condition, message) => { assertions++; if (!condition) throw new Error(message); };
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
check(hotels.length === 95 && directoryHotels.length === 95 && new Set(directoryHotels.map(h => h.slug)).size === 95, 'All 95 identities/routes must remain discoverable');
check(digest(hotels.map(h => [h.slug,h.name,h.expediaUrl])) === '18d4c39bbe88ad1221c66f86cf7c535e4e7fb6e173933e4639d6e8d84dec370d', 'Hotel identity/provider URL changed');
const previousTwelve = ['moose-hotel-suites','mount-royal-hotel','tunnel-mountain-resort','blackstone-mountain-lodge','lake-louise-inn','fairmont-chateau-lake-louise','sunshine-mountain-lodge','emerald-lake-lodge','hi-lake-louise-alpine-centre','douglas-fir-resort','banff-boundary-lodge','rundle-mountain-lodge'];
check(digest(previousTwelve.map(slug => hotels.find(h => h.slug === slug))) === '3f2a16ecb3e8415b9baff59c550d2d29367f8116c1796a4979c4a53f6baab858', 'Previously reviewed twelve facts/photos/coordinates changed');
const statuses = { reviewed:21, 'location-only':1, 'former-name':2, unreviewed:71 };
for (const [status,count] of Object.entries(statuses)) check(directoryHotels.filter(h => h.sourceStatus === status).length === count, 'Source status count mismatch: '+status);
check(unreviewedHotelDirectorySlugs.size === 71 && directoryHotels.filter(h => isHotelDirectoryIndexable(h.slug)).length === 24, 'Indexability coverage mismatch');
check(!isHotelDirectoryIndexable('made-up-property') && !isHotelDirectoryIndexable('banff-boundary-lodge?query=1'), 'Unknown slug became indexable');
check(directoryHotels.filter(h => h.image).length === 20, 'Unexpected public property-image coverage');
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
check(precisePoints === 5, 'Five directly sourced points must survive');
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
const poison = directoryHotel({...hotels.find(h => h.slug === 'hotel-canoe-suites'),checkedOn:'2099-01-01',officialUrl:'https://example.com',amenities:['Guaranteed spa'],image:'https://example.com/hotel.jpg',coordinateStatus:'indicative',lat:51,lng:-115});
check(poison.sourceStatus === 'unreviewed' && !poison.image && !poison.amenities.length && poison.lat === null, 'An arbitrary date/provider URL promoted a legacy record');
const copper = directoryHotels.find(h => h.slug === 'copperstone-resort');
check(copper.area === 'Bow Valley' && copper.address.includes('Dead Man') && copper.coordinateStatus === 'unavailable' && !copper.amenities.some(a => /indoor pool/i.test(a)), 'Copperstone location/facility correction regressed');
check(directoryHotels.find(h => h.slug === 'cathedral-mountain-lodge').area === 'Yoho National Park', 'Cathedral geography regressed');
check(directoryHotels.find(h => h.slug === 'hi-castle-mountain-hostel').roomFeatures.some(f => f.includes('14-bed')), 'HI Castle category lost');

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
ui.choose('source-filter','reviewed');check(ui.shown().length===21,'Reviewed source filter wrong');
ui.choose('area-filter','Canmore');check(ui.shown().length===4,'Combined reviewed/Canmore filter wrong');
ui.ids['clear-filters'].fire('click');check(ui.shown().length===95&&ui.ids['source-filter'].value==='all','Reset incomplete');
ui.choose('source-filter','location-only');ui.ids['map-view-btn'].fire('click');ui.ids['map-view-btn'].fire('click');check(ui.scripts.length===1,'Duplicate map load request');ui.load();
check(ui.markers.length===5&&ui.visible.size===1&&ui.map.fitted.length===1,'Map source/filter contract wrong');
const boundary=[...ui.visible][0];check(boundary.popup.children.every(c=>c.tagName!=='img')&&boundary.popup.children.some(c=>c.textContent==='Property photo unavailable'),'Boundary popup uses false photo');
ui.choose('source-filter','unreviewed');check(ui.shown().length===71&&ui.visible.size===0,'Legacy source filter exposes pins or loses discovery records');
ui.choose('source-filter','former-name');check(ui.shown().length===2&&ui.visible.size===0,'Former-name filter wrong');
ui.ids['clear-filters'].fire('click');ui.choose('search-input','Copperstone');check(ui.shown().length===1&&ui.visible.size===0,'Copperstone query has wrong point/results');
ui.ids['clear-filters'].fire('click');ui.choose('area-filter','Spray Avenue');check(ui.shown().length===1&&ui.visible.size===1,'Spray Avenue area filter/pin mismatch');
ui.choose('area-filter','Sulphur Mountain');check(ui.shown().length===1&&ui.visible.size===1,'Sulphur Mountain area filter/pin mismatch');
ui.ids['grid-view-btn'].fire('click');ui.ids['map-view-btn'].fire('click');check(ui.scripts.length===1&&ui.ids['map-view-btn'].attributes['aria-pressed']==='true','Map toggles reload or lose accessibility state');
const valid=setup('?source=reviewed&area=Canmore');check(valid.shown().length===4,'Source/area URL filters broken');
const invalid=setup('?source=unknown&area=nowhere&price=free&type=Boat');check(invalid.shown().length===95,'Invalid URL filters alter results');
const failure=setup();failure.ids['map-view-btn'].fire('click');const obsolete=failure.scripts[0];obsolete.onerror();check(failure.ids['hotel-grid'].style.display===''&&failure.ids['map-status'].textContent.includes('could not load'),'Map failure hides grid');
failure.ids['map-view-btn'].fire('click');failure.load();obsolete.onload();check(failure.markers.length===5,'Late failed load duplicates markers');
const timeout=setup();timeout.ids['map-view-btn'].fire('click');[...timeout.timers.values()][0]();check(timeout.ids['hotel-grid'].style.display===''&&timeout.ids['map-container'].style.display==='none','Map timeout hides complete results');
for(const [filename,source] of [['src/pages/hotel-directory/index.astro',index],['src/pages/hotel-directory/[slug].astro',detail]]) {
  const result=await transform(source,{filename});check(result.diagnostics.length===0,'Astro compiler diagnostics: '+filename+' '+JSON.stringify(result.diagnostics));
}
check(detail.includes('noindex={!isHotelDirectoryIndexable(hotel.slug)}'),'Unreviewed detail noindex contract missing');
check(index.includes('<noscript>')&&index.includes('hotels.map(hotel =>')&&index.includes('hidden>'),'Complete no-JS discovery content missing');
check(index.includes('data-source={hotel.sourceStatus}')&&index.includes('source-filter'),'Source-status controls missing');
check(detail.includes('hotelDirectorySchema(hotel)')&&detail.includes('sourceLinks.map'),'Shared safe schema/source contract bypassed');
console.log(JSON.stringify({assertions,discoveryRecords:95,indexableDetails:24,noindexDetails:71,reviewedFacts:21,locationOnly:1,formerNameHistories:2,newPropertyReviews:10,sourceMapPoints:5,propertyPhotoProfiles:20,identityHash:digest(hotels.map(h=>[h.slug,h.name,h.expediaUrl])),compilerDiagnostics:0},null,2));
