import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { build } from 'esbuild';
import { transform } from '@astrojs/compiler';
import { experimental_AstroContainer } from 'astro/container';
import { ORIGIN, ROOT, normal, htmlFacts, htmlElements, textInside, schemaNodes, analyseHtml, loadInventory, options, verify, selfTest as foundationSelfTest } from './verify-cycling-consent-release.mjs';

// Reuses the 193-route verifier's bounded GET/nonce/UTC receipt/sitemap/photo/wx
// engine. Only an explicit CLI invocation can request production; imports and
// --self-test never request production or write a receipt.
// node scripts/verify-guide-quality-release.mjs --revision <40hex> --fingerprint <64hex> --report research/<new-local.json>
// --built-dir <directory> reads emitted HTML/sitemaps/photos and a stable local
// build receipt; it does not assert deployed identity, HTTP status or redirects.
const EXPECTED_ROUTES = 244;
const PARTIAL_LABEL = 'Opening paragraph repaired (full guide review pending):';
const ORIGINAL_PUBLICATION = {
  'nightclub-banff':'2026-03-31', 'banff-nightclubs':'2026-04-08', 'new-places-to-eat-in-banff':'2026-04-03',
  'banff-clubs':'2026-04-06', 'banff-bars':'2026-03-28', 'golden-banff':'2026-05-17', 'jasper-town':'2026-04-08',
  'jasper-national-park':'2026-04-06', 'deals-in-banff':'2026-04-14', 'johnsons-canyon':'2026-04-11',
  'calgary-to-jasper':'2026-04-11', 'numtijah-lodge':'2026-03-08', 'num-ti-jah-lodge':'2026-03-04',
};
const FULL_PUBLICATION = {
  'num-ti-jah-lodge':'2026-03-04', 'numtijah-lodge':'2026-03-08',
  'jasper-national-park':'2026-04-06', 'jasper-town':'2026-04-08', 'jasper-canada':'2026-04-06',
  'new-places-to-eat-in-banff':'2026-04-03', 'banff-cabin-rentals':'2026-01-07',
  'banff-nightlife-guide':'2026-02-10', 'banff-live-music':'2026-05-28', 'drink-deals':'2026-03-14',
  'icefields-parkway-guide':'2026-01-05', 'banff-to-jasper-drive':'2026-02-08', 'lake-minnewanka-guide':'2026-02-18',
  'banff-gondola-guide':'2026-02-02', 'banff-gondola-tickets-guide':'2026-03-01',
  'banff-spring-skiing':'2025-09-30', 'peyto-lake-guide':'2026-02-11', 'banff-helicopter-tours':'2025-10-12', 'kananaskis-heli-tours':'2026-03-03',
  'golden-bc-day-trip':'2025-12-10', 'banff-heli-skiing':'2025-11-06',
  'skoki-lodge-guide':'2025-12-27',
  'banff-trip-cost-budget-guide':'2026-03-01', 'fall-larch-season-banff':'2026-02-16', 'banff-in-fall':'2026-02-14',
  'larch-valley-hike':'2025-09-20', 'sentinel-pass-hike':'2026-02-20',
};
const PARTIAL_PUBLICATION = Object.fromEntries(Object.entries(ORIGINAL_PUBLICATION).filter(([slug])=>!Object.hasOwn(FULL_PUBLICATION,slug)));
const NEW_FULL_SLUGS=['banff-trip-cost-budget-guide','fall-larch-season-banff','banff-in-fall','larch-valley-hike','sentinel-pass-hike'];
const NEW_RELEASE_PATHS=[...NEW_FULL_SLUGS.map(slug=>`/blog/${slug}/`),'/park-pass/'];
const jasperContextSlugs=['jasper-town','jasper-national-park','jasper-canada','jasper-alberta','calgary-to-jasper'];
const bowContextSlugs=['numtijah-lodge','num-ti-jah-lodge','skoki-lodge-guide','larch-valley-hike','sentinel-pass-hike'];
function expectedBookingContext(slug,authored=false){
  const jasper=jasperContextSlugs.includes(slug),bow=bowContextSlugs.includes(slug),golden=slug==='golden-bc-day-trip',hotelLabel=jasper?'Jasper':bow?'Lake Louise area':golden?'Golden':'Banff',tourLabel=jasper?'Jasper':bow?'Lake Louise':golden?'Golden':'Banff',destination=jasper?'Jasper, Alberta':bow?'Lake Louise, Alberta':golden?'Golden, British Columbia':'Banff, Alberta';
  return {hotelLabel,tourLabel,hotelHref:'https://www.expedia.ca/Hotel-Search?destination='+encodeURIComponent(destination)+'&camref=1101l3MtWX',tourHref:jasper||bow||golden?'https://www.getyourguide.com/s/?q='+encodeURIComponent(destination)+'&partner_id=QW960HO&cmp=banffboundblog':'https://www.getyourguide.com/banff-l284/?partner_id=QW960HO&cmp=banffboundblog',suppressAutomaticCTA:authored||jasper||bow||golden};
}
const hasClass = (node,name) => (node.attributes.class ?? '').split(/\s+/).includes(name);
const inside = (node,parent) => node.start >= parent.openEnd && node.end <= parent.innerEnd;
const isoDate = date => `${date}T00:00:00.000Z`;
const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
async function moduleData(contents) {
  const result = await build({stdin:{contents,resolveDir:ROOT},absWorkingDir:ROOT,bundle:true,write:false,platform:'node',format:'esm',logLevel:'silent'});
  return import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
}
// Render only these owned planner page bodies in memory. Shared layout/client
// components are replaced by slot-preserving shells: no app build or resources.
async function plannerSourceHtml(relative) {
  const filename=path.join(ROOT,relative),source=await readFile(filename,'utf8');
  const compiled=await transform(source,{filename,internalURL:'astro/compiler-runtime',resultScopedSlot:true});
  assert.deepEqual(compiled.diagnostics.filter(d=>d.severity===1),[],relative+': planner source compiles');
  const code=compiled.code.replace(/,\s*createMetadata as \$\$createMetadata/,'').replace(/^export const \$\$metadata = [^\n]*\n/m,''),require=createRequire(import.meta.url);
  const result=await build({stdin:{contents:code,loader:'ts',resolveDir:path.dirname(filename)},bundle:true,write:false,platform:'node',format:'esm',logLevel:'silent',plugins:[{name:'release-planner-body',setup(b){
    b.onResolve({filter:/^astro\//},a=>({path:pathToFileURL(require.resolve(a.path)).href,external:true}));
    b.onResolve({filter:/\?astro&type=style/},a=>({path:a.path,namespace:'release-style'}));b.onLoad({filter:/.*/,namespace:'release-style'},()=>({contents:'export {};'}));
    b.onResolve({filter:/\.astro$/},a=>({path:a.path,namespace:'release-shell'}));b.onLoad({filter:/.*/,namespace:'release-shell'},()=>({contents:"import {createComponent,render,renderSlot} from 'astro/runtime/server/index.js';export default createComponent((r,p,s)=>render`${renderSlot(r,s.default)}`);"}));
  }}]});
  const Page=(await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'))).default;
  const container=await experimental_AstroContainer.create();return container.renderToString(Page,{request:new Request(ORIGIN+'/'+path.basename(relative,'.astro')+'/')});
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
const plainFragment = value => normal(String(value).replace(/<[^>]*>/g,' '));
const fullMarkers = {
  'num-ti-jah-lodge': {water:'paddling, large inflatables and motorized boating as prohibited',zone:'Water Preservation Zone',connectivity:'no telephones, TVs or Wi-Fi',season:'Chalet accommodation from winter 2027'},
  'numtijah-lodge': {water:'paddling, large inflatables and motorized boating as prohibited',zone:'Water Preservation Zone',history:'1922',cafe:'closed for the season',route:'3.8 kilometres one way'},
  'jasper-national-park': {closure:'Cavell Road and Maligne Canyon remain closed for the 2026 season.',winterClosure:'including winter recreation in the canyon.',fiveLakes:'Wetland Way',emerald:'5.4 km loop',valley:'7.7 km loop',geography:'approximately 232 km'},
  'jasper-town': {recovery:'Jasper is rebuilding after the 2024 wildfire.',closure:"Maligne Canyon's current closure includes winter recreation",geography:'community inside Jasper National Park'},
  'jasper-canada': {geography:'Highway 16 / Yellowhead',endpoints:'approximately 232 km',closure:"Parks Canada's closure prohibits winter recreation there.",arrival:'Edmonton suits a Jasper-first plan via Highway 16.'},
  'new-places-to-eat-in-banff': {date2025:'reopened in December 2025',date2026:'reopened after renovation in April 2026',dateEvidence:'August 20, 2025',otherLocation:'Fairmont Chateau Lake Louise, 111 Lake Louise Drive'},
  'banff-cabin-rentals': {scope:'These are selected examples, not an exhaustive ranking or live room inventory.',defaultCount:'6 cabin-category examples to compare',categories:'Historic-cabin season and winter-suite statements',disclosure:'BanffBound may earn a commission from qualifying Expedia bookings.'},
  'banff-nightlife-guide': {identity:'120 Banff Avenue',age:'18+ entry condition',minors:'no minors are allowed after 10pm',booking:'separate dining and bowling reservations',source:'Guide reviewed October 29, 2026.',season:'fall/winter seasonal service',count:'5 evening formats to explore',journey:'last useful departure'},
  'banff-live-music': {source:'Fully reviewed October 29, 2026',age:'minors welcome until 9:30 p.m.',table:'A table reservation can establish a meal without show admission.',tickets:'original PDF rather than a screenshot',identity:'201 Banff Avenue #2',hotel:'No recurring hotel jazz programme is established by this guide.',journey:'A show ending late can outlast the bus service.'},
  'drink-deals': {source:'Offers checked October 29, 2026.',afternoon:'2–5 p.m.',late:'9–11 p.m.',conflict:'conflicting weekday bowling happy-hour times',holidays:'not available on holidays or long weekends',lane:'A table confirmation does not establish a reserved lane.',skyTime:'Summit Hours from 3–5 p.m.',skyOffer:'50% off local beer, house wine and selected shareable plates',admission:'book Banff Gondola admission separately'},
  'icefields-parkway-guide': {source:'Fully reviewed October 29, 2026',purpose:'choose the stops',origin:'Highway 1 / Highway 93N junction',bow:'36 km north of the junction',peyto:'40 km north of the junction',mistaya:'72 km north of the junction',fuel:'all services are closed for winter',future:'April 2027',tires:'November 1–March 31',glacier:'crossing the barriers onto the Athabasca Glacier',water:'where paddling is prohibited'},
  'banff-to-jasper-drive': {source:'Fully reviewed October 29, 2026',purpose:'the transfer and overnight decisions',route:'approximately 232 km between Lake Louise and Jasper',fuel:'all services are closed for winter',tires:'November 1–March 31',equipment:'snowflake or M+S',transport:'October 2025–April 2026 season',newSeason:'actual 2026/27 date',closure:'winter recreation in Maligne Canyon is prohibited'},
  'lake-minnewanka-guide': {source:'Fully reviewed October 29, 2026',road:'western section of Minnewanka Loop Road closed to driving from November to May',approach:'eastern side via Two Jack Lake',ice:'does not monitor natural ice for safety',zone:'Special Tactics Zone',personal:'Personal canoes, kayaks, paddleboards and large inflatables are prohibited.',rental:'specific exceptions for authorized rental watercraft',fishing:'May 16–September 7, 2026',boats:'ticket office, boat rentals and Black Anchor closed for the 2026 season'},
  'banff-gondola-guide': {source:'Full guide reviewed October 29, 2026',access:'368 shallow stairs each way and is not wheelchair accessible',limits:'31 inches wide by 41 inches long',weight:'320 kg total weight limit',warmth:'gondola cabins are unheated',hike:'5.5 km one way and 655 m of elevation gain',dining:'require separate gondola admission'},
  'banff-gondola-tickets-guide': {source:'Full guide reviewed October 29, 2026',product:'256607',supplier:'Pursuit Collection',terms:'non-refundable',dining:'separate Banff Gondola admission',descent:'paid one-way trip down',stairs:'368 shallow stairs each way and is not wheelchair accessible'},
  'banff-spring-skiing': {source:'Full guide reviewed October 29, 2026',norquay:'April 18, 2027',louise:'May 2, 2027',uncertainty:'A specific 2027 last day for every lift or lesson is not established here.',pricing:'sale dates and pricing are to be confirmed',season:'conditions permitting',ability:'The equipment does not supply the skills.'},
  'peyto-lake-guide': {source:'Fully reviewed October 29, 2026',lookout:'0.6 km one way',accessible:'0.3 km from the upper parking lot',summit:'3 km one way',ascent:'310 m ascent',winter:'570 m loop',junction:'40 km north of the Lake Louise highway junction',village:'43 km reference from Lake Louise village',facilities:'Parks lists toilets and accessible toilets at Peyto Lake / Bow Summit.'},
  'banff-helicopter-tours': {source:'Full guide reviewed October 29, 2026',canmore:'Canmore Municipal Heliport, 91 Bow Valley Trail',nakoda:'888 Nakoda Way',cline:'Cline River and Highway 11, Clearwater County',pastSeason:'Winter 2025/2026',futureSeason:'2026/27',approval:'all flights landing within Banff National Park require advance approval from the Superintendent'},
  'kananaskis-heli-tours': {source:'Full guide reviewed October 29, 2026',nakoda:'888 Nakoda Way',canmore:'91 Bow Valley Trail',oldSeason:'Winter 2025/2026',newSeason:'2026/27',product:'Warrior Lookout',landing:'Great Divide',booking:'Do not treat an invitation to enquire as a reserved seat.'},
  'golden-bc-day-trip': {source:'Full guide reviewed October 29, 2026',identity:'Golden town address is not the resort base',purpose:'Town-focused day',overnight:'Golden overnight',heli:'Do not add a resort morning or promise a Banff return after flying',road:'Rogers Pass is farther west beyond Golden',future:'May 7–October 12, 2027'},
  'banff-heli-skiing': {source:'Full guide reviewed October 29, 2026',golden:'438 Lafontaine Road, Golden, BC',panorama:'2045 Greywolf Drive, Panorama, BC',minimum:'minimum of 5 guests overall',equipment:'Bring your own ski or snowboard boots.',food:'The Purcell page conflicts on meals',scope:'2 operators to compare; no booking or ability approval'},
  'skoki-lodge-guide': {source:'Full guide reviewed October 29, 2026',winter:'December 18, 2026–April 5, 2027',summer:'June 18–October 13, 2027',future:'future operating plans',basis:'11 km from the arranged upper trailhead',ability:'does not recommend the approach for people without ski or snowshoe experience',terms:'distinguish cash refunds from credits'},
};
const reviewedSections={
  'banff-spring-skiing':[{id:'freeride',markers:['expert terrain','457 kHz avalanche transceiver switched on and transmitting','avalanche shovel and probe in a suitable backpack','similarly equipped partner','The equipment does not supply the skills.','current Freeride Zone status'],links:['https://www.skibanff.com/the-mountain/lifts-terrain/freeride-zones']}],
  'peyto-lake-guide':[{id:'peyto-access',markers:['restricted upper parking lot','accessible vehicles and buses','first come, first served','A summer barrier-free description does not establish a cleared winter route'],links:['https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise/commerciaux-commercial']},{id:'peyto-winter',markers:['unplowed upper road','Do not use a winter viewpoint listing to extend onto Bow Summit','does not monitor natural ice for safety'],links:['https://parks.canada.ca/pn-np/ab/banff/activ/patinage-skating']}],
  'banff-helicopter-tours':[{id:'flight-bases',markers:['91 Bow Valley Trail','888 Nakoda Way','Cline River and Highway 11, Clearwater County','past-season information and does not confirm the 2026/27 calendar'],links:['https://canmore.alpinehelicopter.com/','https://stoneynakoda.alpinehelicopter.com/','https://www.rockiesheli.com/contact/']},{id:'flight-park-rules',markers:['all flights landing within Banff National Park require advance approval from the Superintendent','not a blanket statement that every overflight is prohibited'],links:['https://www.parcs.canada.ca/pn-np/ab/banff/securite-safety/regles-rules/vols-flights']}],
  'kananaskis-heli-tours':[{id:'nakoda-season',markers:['Winter 2025/2026','does not establish whether Stoney Nakoda is operating on a particular 2026/27 date','switching bases does not establish a winter landing'],links:['https://stoneynakoda.alpinehelicopter.com/product/2022-sleeping-warrior-istimabi-iyahe-tour/']},{id:'nakoda-journey',markers:['Do not treat an invitation to enquire as a reserved seat.','Public transport into Canmore is not evidence of a bus to Stoney Nakoda.','Cline River/Highway 11 address'],links:['https://roamtransit.com/schedules-routes/canmore-banff-regional-route-3/','https://www.rockiesheli.com/contact/']}],
  'golden-bc-day-trip':[{id:'golden-winter',markers:['does not establish winter clearing or ice-free access','restricts the gear to Dawn Mountain','2025/26 heading and closed service rows','confirms no future opening day','expects previous powder experience','day lodge has no overnight accommodation','Do not add a resort morning or promise a Banff return after flying'],links:['https://goldennordicclub.ca/rentals/','https://kickinghorseresort.com/winter-hours/','https://www.cmhheli.com/heli-skiing/day-heli-skiing']},{id:'golden-summer',markers:['does not establish 2027 operation','May 7–October 12, 2027','future seasonal plans','not winter access','2750 Beaverfoot Road','Do not assign every half-day trip the same rapids'],links:['https://kickinghorseresort.com/summer-hours/','https://www.banffjaspercollection.com/plan-your-trip/opening-dates/','https://wildwater.com/faq/']},{id:'golden-road',markers:['Rogers Pass is farther west beyond Golden','before leaving and again before the return','October 1–April 30','March 31 exceptions','rental’s fitted tires','Takakkaw Falls is not a quick winter driving detour','closes in winter because of avalanche hazard'],links:['https://parks.canada.ca/pn-np/bc/yoho/visit/directions','https://www.drivebc.ca/','https://511.alberta.ca/']},{id:'golden-transport',markers:['not a seat reservation','2025/26 schedule','new season’s stops and last return','each final connection'],links:['https://banfftours.com/activities/banff-to-kicking-horse-ski-shuttle/','https://www.goldenshuttle.ca/kickinghorse-golden-shuttle']},{id:'golden-return',markers:['limited daylight and driver fatigue','actual accommodation options','operator’s own check-in address','no room, rate or late arrival is guaranteed'],links:['/towns/golden/#where-to-stay','/winter-stays/']}],
  'banff-heli-skiing':[{id:'operators',markers:['self-drive arrangement and no included overnight accommodation','CMH Purcell is based in Golden','RK Heliski is based in Panorama','separately priced transfer enquiries','get the check-in time, time zone and return arrangements in writing'],links:['https://www.cmhheli.com/destinations/purcell','https://rkheliski.com/plan-your-trip/getting-here/']},{id:'ability',markers:['recent untracked snow, variable crust, trees','not a first ski lesson','logistics choices below do not assess either activity’s terrain or ability requirements'],links:['https://www.cmhheli.com/destinations/purcell','https://rkheliski.com/plan-your-trip/frequently-asked-questions/','/learn-to-ski/#lesson-fit']},{id:'cost',markers:['actual party, date and programme','Purcell source conflict','safety pack and training','full return'],links:['https://www.cmhheli.com/planning/booking/vertical-guarantee','https://rkheliski.com/details/booking-information/']},{id:'cancellation',markers:['you cannot attend or reach check-in','the operator cannot start the day','the day starts but less skiing is completed','transport exclusion and its ski-package provisions are distinct','relevant season and programme section'],links:[]}],
  'skoki-lodge-guide':[{id:'getting-there',markers:['Lake Louise village, the lakeshore and the ski resort are different destinations.','11 km from the arranged upper trailhead','another 4 km from Fish Creek','14.5 km from the Lake Louise trailhead','ends at the pass, not the lodge'],links:['https://www.parks.canada.ca/pn-np/ab/banff/info/gestion-management/skoki','/trails/deception-pass/']},{id:'winter-access',markers:['It is not the summer Fish Creek shuttle process.','does not include a guide, pack transport','does not recommend the approach for people without ski or snowshoe experience','not a declaration of no avalanche risk','transceiver, shovel and probe','skills to use them','no lake-crossing line or alternative winter route'],links:['https://www.skoki.com/pdf/Skoki-Info-Sheet-Winter.pdf','https://www.parcs.canada.ca/pn-np/mtn/securiteenmontagne-mountainsafety/avalanche/echelle-ratings/eeta-ates-2/simple-1']},{id:'summer-access',markers:['actual departure and return pickup','return also includes an ascent','bear warning issued September 2, 2026','warning, not an asserted closure'],links:['https://skokilodge.com/pdf/Skoki-Info-Sheet-Summer.pdf','https://parks.canada.ca/voyage-travel/securite-safety/bulletins/74085a8f-8138-410f-8956-83929a79d6b8']},{id:'the-lodge',markers:['Main-lodge rooms are upstairs','wash basins and outhouses','alcoholic drinks sold separately','shared kitchen'],links:['https://skokilodge.com/accommodation/index.php']},{id:'booking',markers:['actual minimum stay','no universal two-night rule','weather and road problems','credit or deferral','different refund wording','distinguish cash refunds from credits'],links:['https://www.skoki.com/rates/cancellation.php']},{id:'what-to-bring',markers:['Guests carry their own packs in and out.','lodge cannot provide backcountry rescue','separate Banff portion','These search results are not Skoki Lodge rooms'],links:['/book/lake-louise-stays/','https://www.expedia.ca/Hotel-Search?destination=Banff%2C+Alberta&camref=1101l3MtWX','https://www.getyourguide.com/banff-l284/?partner_id=QW960HO']}],
};
const diningSections = [
  {id:'good-folk',markers:['#1000–600 Banff Avenue','inside the Otter Hotel','August 20, 2025'],href:'https://goodfolkrestaurant.com/'},
  {id:'crave',markers:['201 Lynx Street','reopened in December 2025'],href:'https://cravebanff.com/'},
  {id:'la-terrazza',markers:['reopened after renovation in April 2026'],href:'https://www.banffparklodge.com/la-terrazza/'},
  {id:'sudden-sally',markers:['#2000–600 Banff Avenue','Hotel Canoe & Suites'],href:'https://suddensally.com/'},
  {id:'pizzeria-sophia',markers:['202 Caribou Street','recommends reservations and welcomes walk-ins'],href:'https://www.pizzeriasophiabanff.com/reservations'},
  {id:'fat-ox',markers:['415 Banff Avenue','No opening year is asserted'],href:'https://fatoxbanff.ca/'},
];
const newReviewedSections={
  'banff-trip-cost-budget-guide':[
    {id:'budget-plan',markers:['Seven rows','all in CAD','already paid','blanks unknown','partial budget'],links:[]},
    {id:'accommodation',markers:['actual stop','lakeshore, community and ski resort are different places','not a guaranteed discount','occupancy','cancellation terms'],links:['/book/banff-hotels/','/book/lake-louise-stays/','/towns/canmore/']},
    {id:'park-pass',markers:['youth admission exemption is not free access to every paid service','no universal seven-day break-even','product’s validity'],links:['https://parks.canada.ca/pn-np/ab/banff/visit/tarifs-fees','/park-pass/']},
    {id:'activities',markers:['starts at age 13','beginner Levels 1–2','not a full-mountain ticket','closed to personal vehicles year-round','2026 shuttle season ended October 12','future operating plans'],links:['/learn-to-ski/#lesson-fit','/ski-pass-calculator/']},
    {id:'sample-budgets',markers:['not offers, market rates or suggested spending levels','No monetary amounts are supplied','two adults, five travel days, four nights','four people, six travel days, five nights'],links:['/trip-cost/#trip-budget-planner']},
  ],
  'fall-larch-season-banff':[
    {id:'larch-timing',markers:['late September into early October','no live foliage feed, historical peak chart or year-specific forecast'],links:['https://www.banfflakelouise.com/fall']},
    {id:'larch-objective',markers:['pass profile already includes its approach','Healy Pass is not reached by shortening its hiking profile with the Sunshine gondola','June 25–September 19, 2027','late-September colour trip does not establish gondola access'],links:['/trails/larch-valley-minnestimma-lakes/','/trails/sentinel-pass-via-larch-valley/','https://www.skibanff.com/sunshinemeadows']},
    {id:'larch-arrival',markers:['closed to personal vehicles year-round','2026 Parks lake-shuttle season ended October 12','Work back from the return','walk down'],links:['/shuttle-reservations/','/car-free-banff/']},
    {id:'larch-snow',markers:['mid-October to mid-June','does not turn the summer profiles into winter recommendations','traction devices do not assess a snow slope'],links:['/larch-season/?larch_season=snow#larch-planner']},
    {id:'larch-group',markers:['recommends travelling in tight groups of four or more','specific mandatory group order','least experienced member'],links:[]},
  ],
  'banff-in-fall':[
    {id:'fall-base',markers:['Banff town','Lake Louise','Canmore','actual hotel'],links:['/towns/banff/','/towns/lake-louise/','/towns/canmore/']},
    {id:'fall-journey',markers:['year-round','Park and Ride','Moraine','2026'],links:['https://roamtransit.com/schedules-routes/lake-louise-banff-express-route-8x/','https://roamtransit.com/fares/reservations/winter-reservations/']},
    {id:'fall-notices',markers:['October 13 to early November','does not confirm reopening','scheduled December 11, 2026 end','Reopening remains unconfirmed','June 25–September 19, 2027'],links:['https://parks.canada.ca/pn-np/ab/banff/sources-banff-springs','https://parks.canada.ca/pn-np/ab/banff/bulletins/06d4ef61-a3c9-4b65-8dfc-66d056252d6c','https://www.skibanff.com/sunshinemeadows']},
    {id:'fall-budget',markers:['travel days, accommodation nights, people and rooms','Leave unknown rows unknown','No fixed seasonal discount'],links:['/trip-cost/']},
  ],
  'larch-valley-hike':[
    {id:'trail-overview',markers:['4.5 km one way from Moraine Lake','570 m outward gain; 10 m outward loss','3.5–4 hours estimated return hiking time','Moderate','begin just beyond Moraine Lake Lodge'],links:['https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking','/trails/larch-valley-minnestimma-lakes/']},
    {id:'getting-there',markers:['closed to personal vehicles year-round','Park and Ride at the ski resort','Alpine Start','2026 Moraine shuttle season ended October 12','does not supply 2027 dates','last return'],links:['/shuttle-reservations/']},
    {id:'sentinel-decision',markers:['Difficult continuation','includes the shared valley approach','Do not add the two whole trail distances','Minnestimma Lakes as the stated endpoint'],links:['/blog/sentinel-pass-hike/']},
    {id:'larch-colour',markers:['late-September to early-October','no live colour observations','does not recommend travel from mid-October through mid-June','not a statement that every date outside it is suitable'],links:['https://www.banfflakelouise.com/fall']},
    {id:'after-hike',markers:['actual transport departure','broad searches for the wider trip','not a Lake Louise room offer','cancellation terms'],links:['/towns/lake-louise/','/book/lake-louise-stays/']},
  ],
  'sentinel-pass-hike':[
    {id:'trail-overview',markers:['5.6 km one way from Moraine Lake','750 m outward gain; 50 m outward loss','4.5–5.5 hours estimated return hiking time','Difficult','includes the approach through Larch Valley','Do not add the valley’s full distance again'],links:['https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking']},
    {id:'getting-there',markers:['closed to personal vehicles year-round','Park and Ride at the ski resort','Alpine Start','2026 Moraine shuttle season ended October 12','No future launch date','confirmed last usable departure'],links:['https://reservation.pc.gc.ca','/shuttle-reservations/']},
    {id:'pass-decision',markers:['steep switchbacks','pass is the objective','Mount Temple and Pinnacle Mountain are separate','no summit instructions'],links:[]},
    {id:'return-plan',markers:['A crossing into Paradise Valley is not included','route-finding on steep rocky slopes','not an equivalent exit','not automatically suitable because it is shorter'],links:['/larch-season/?larch_area=moraine&larch_duration=over-four#larch-planner']},
    {id:'season-snow',markers:['summer hiking profile','does not recommend travel from mid-October through mid-June','not a terrain approval','does not provide a winter approach'],links:['https://parks.canada.ca/pn-np/mtn/securiteenmontagne-mountainsafety/avalanche']},
    {id:'guided-options',markers:['written endpoint','pickup/drop-off','Moraine access','general catalogue','not a verified Sentinel Pass offer'],links:['/book/lake-louise-stays/']},
  ],
};
Object.assign(fullMarkers,{
  'banff-trip-cost-budget-guide':{source:'Full guide reviewed October 29, 2026',scope:'No monetary amounts are supplied',unknown:'blanks unknown',units:'room/bed rate multiplied by its actual nights and units'},
  'fall-larch-season-banff':{source:'Full guide reviewed October 29, 2026',timing:'late September into early October',snow:'mid-October to mid-June',future:'June 25–September 19, 2027'},
  'banff-in-fall':{source:'Full guide reviewed October 29, 2026',purpose:'September or October trip',notices:'Reopening remains unconfirmed here',budget:'No fixed seasonal discount'},
  'larch-valley-hike':{source:'Full guide reviewed October 29, 2026',purpose:'Larch Valley / Minnestimma Lakes can be the whole hike',scope:'4.5 km one way from Moraine Lake',return:'full descent'},
  'sentinel-pass-hike':{source:'Full guide reviewed October 29, 2026',purpose:'pass hike from Moraine Lake',scope:'5.6 km one way from Moraine Lake',return:'A crossing into Paradise Valley is not included'},
});
function fullReviewChecks(d) {
  const metadata={...d.bowLakeGuideMetadata,...d.jasperGuideMetadata,...d.diningGuideMetadata,...d.cabinGuideMetadata,...d.nightlifeGuideMetadata,...d.liveMusicGuideMetadata,...d.drinkOfferGuideMetadata,...d.parkwayGuideMetadata,...d.minnewankaGuideMetadata,...d.gondolaGuideMetadata,...d.springSkiGuideMetadata,...d.peytoGuideMetadata,...d.scenicFlightGuideMetadata,...d.goldenDayGuideMetadata,...d.heliSkiGuideMetadata,...d.skokiGuideMetadata,...d.budgetGuideMetadata,...d.fallSeasonGuideMetadata,...d.larchHikingGuideMetadata};
  assert.deepEqual(Object.keys(metadata).sort(),Object.keys(FULL_PUBLICATION).sort());
  assert.equal(Object.keys(d.reviewedBlogBodies).length,78,'Current registry has78 full reviews; historical receipts remain versioned.');
  assert.equal(Object.keys(d.blogRedirects).length,40);assert.equal(d.blogRedirects['norquay-ski-shuttle'],'mt-norquay-guide');
  assert.equal(d.cabinExamples.length,6);assert.equal(d.compareCabinStays({}).selectedIds.length,6);assert.equal(d.compareCabinStays({season:'winter'}).selectedIds.length,4);
  const verifiedIds={'tunnel-mountain-cabin':'16324','baker-family-cabin':'7710611','paradise-wilson-cabin':'7829397'};
  assert.equal(d.cabinExamples.filter(c=>c.affiliate).length,3);
  for(const c of d.cabinExamples.filter(c=>c.affiliate)){const u=new URL(c.bookingHref);assert.equal(u.hostname,'www.expedia.ca');assert.equal(u.pathname.match(/\.h(\d+)\.Hotel-Information/)?.[1],verifiedIds[c.id]);assert.equal(u.searchParams.get('camref'),'1101l3MtWX');}
  return Object.entries(FULL_PUBLICATION).map(([slug,date])=>{
    const post=d.allBlogPosts.find(p=>p.slug===slug),meta=metadata[slug];
    assert.ok(post&&!d.blogRedirects[slug]);assert.equal(post.date,date);assert.equal(meta.lastUpdated,'2026-10-29');for(const key of ['date','datePublished','publishedDate'])assert.ok(!Object.hasOwn(meta,key),'Full reviews must not reset publication.');
    assert.equal(post.title,meta.title);assert.equal(post.lastUpdated,meta.lastUpdated);assert.equal(post.imageIsIllustrative,true);assert.ok(post.imageNote);
    const bodyHtml=d.resolveBlogContent(slug),facts=htmlFacts(`<html><body>${bodyHtml}</body></html>`),schemas=facts.documents.flatMap(doc=>schemaNodes(doc,'FAQPage'));
    assert.equal(schemas.length,1,slug+': source must emit one FAQPage');
    const faqArrays={'banff-cabin-rentals':d.cabinGuideFaqs,'new-places-to-eat-in-banff':d.diningGuideFaqs,'banff-nightlife-guide':d.nightlifeGuideFaqs,'banff-live-music':d.liveMusicGuideFaqs,'drink-deals':d.drinkOfferGuideFaqs,'lake-minnewanka-guide':d.minnewankaGuideFaqs,'banff-spring-skiing':d.springSkiGuideFaqs,'peyto-lake-guide':d.peytoGuideFaqs,'golden-bc-day-trip':d.goldenDayGuideFaqs,'banff-heli-skiing':d.heliSkiPlanningFaqs,'skoki-lodge-guide':d.skokiGuideFaqs,'banff-trip-cost-budget-guide':d.budgetGuideFaqs};
    const fullFaqs=d.jasperGuideFaqs[slug]??d.parkwayGuideFaqs[slug]??d.gondolaGuideFaqs[slug]??d.scenicFlightGuideFaqs[slug]??d.fallSeasonGuideFaqs[slug]??d.larchHikingGuideFaqs[slug]??faqArrays[slug]??schemas[0].mainEntity.map(q=>({question:q.name,answer:q.acceptedAnswer.text}));
    assert.equal(fullFaqs.length,['jasper-national-park','jasper-town','jasper-canada'].includes(slug)?3:['numtijah-lodge','banff-live-music'].includes(slug)?4:5);
    const quality={type:'full',slug,bodyHtml,description:meta.description,published:date,corrected:meta.lastUpdated,imageNote:post.imageNote,fullFaqs};
    if(reviewedSections[slug]||newReviewedSections[slug])quality.sections=[...(reviewedSections[slug]??[]),...(newReviewedSections[slug]??[])];
    if(Object.hasOwn(newReviewedSections,slug)){quality.nativeReferrals=slug==='banff-trip-cost-budget-guide'?[d.budgetGuideAffiliateLinks.banffHotels,d.budgetGuideAffiliateLinks.banffActivities]:[...(slug==='larch-valley-hike'||slug==='banff-in-fall'?['https://www.expedia.ca/Hotel-Search?destination=Banff%2C+Alberta&camref=1101l3MtWX']:[]),...(slug!=='banff-in-fall'?['https://www.getyourguide.com/banff-l284/?partner_id=QW960HO']:[])];}
    if(slug==='banff-trip-cost-budget-guide')quality.budgetGuide=true;
    if(slug==='new-places-to-eat-in-banff')quality.diningSections=diningSections;
    if(slug==='banff-cabin-rentals'){
      quality.controls=[control('cabin-fit-form','form',{hidden:true}),...['base','season','kitchen'].map(key=>control(`cabin-${key}`,'select')),control('cabin-fit-count','p',{role:'status','aria-live':'polite'}),control('cabin-fit-notes','div'),control('cabin-fit-empty','div',{hidden:true})];
      quality.cards={attribute:'data-cabin-id',items:d.cabinExamples.map(c=>({id:c.id,href:c.bookingHref,text:[c.name,c.room,c.cooking,c.seasonNote,c.journey]}))};
      quality.cabinNative=d.cabinExamples.map(c=>({id:c.id,href:c.bookingHref,affiliate:c.affiliate}));quality.cabinOptions=d.cabinFilterOptions;
    }
    if(slug==='banff-nightlife-guide'){
      const defaultEvening=d.buildEveningPlan();assert.equal(d.eveningFormats.length,5);assert.equal(defaultEvening.selectedIds.length,5);assert.equal(defaultEvening.filters.base,'banff');assert.equal(defaultEvening.steps.length,3);
      quality.controls=[control('evening-planner','section'),control('evening-fit-form','form',{hidden:true}),...['style','group','base'].map(key=>control(`evening-${key}`,'select')),control('evening-fit-count','p',{role:'status','aria-live':'polite'}),control('evening-fit-notes','div'),control('evening-fit-empty','div',{hidden:true}),control('evening-steps','ol'),control('evening-journey-link','a')];
      quality.cards={attribute:'data-evening-id',items:d.eveningFormats.map(f=>({id:f.id,href:f.href,text:[f.name,f.idea,f.booking,f.groupNote]}))};
      quality.evening={options:d.eveningFilterOptions,...defaultEvening};
    }
    if(slug==='banff-gondola-tickets-guide'){
      const offer=d.winterActivityOffers.find(o=>o.id==='gyg-256607');assert.ok(offer);const url=new URL(offer.bookingUrl);assert.equal(url.hostname,'www.getyourguide.com');assert.match(url.pathname,/-t256607\/$/);assert.equal(url.searchParams.get('partner_id'),'QW960HO');
      quality.gondolaProduct={href:offer.bookingUrl,id:'256607'};
    }
    if(slug==='banff-heli-skiing'){
      const initial=d.buildHeliSkiPlan();assert.equal(d.heliSkiReviewedAt,'2026-10-29');assert.equal(d.heliSkiOperators.length,2);assert.deepEqual(d.heliSkiOperators.map(o=>o.id),['purcell','rk']);assert.deepEqual(initial.filters,{operator:'all',base:'banff',transport:'undecided',overnight:'undecided',equipment:'undecided'});assert.deepEqual(initial.selectedIds,['purcell','rk']);assert.equal(initial.steps.length,3);
      assert.deepEqual(d.heliSkiOperators.map(o=>[o.base,o.address]),[['Golden, British Columbia','438 Lafontaine Road, Golden, BC'],['Panorama, British Columbia','2045 Greywolf Drive, Panorama, BC']]);
      for(const base of d.heliSkiFilterOptions.base.map(o=>o[0]))assert.deepEqual(d.buildHeliSkiPlan({base}).selectedIds,['purcell','rk'],'A starting base does not select or approve an operator.');
      quality.controls=[control('heli-ski-planner','section'),control('heli-ski-form','form',{hidden:true}),...['operator','base','transport','overnight','equipment'].map(key=>control(`heli-ski-${key}`,'select')),control('heli-ski-status','p',{role:'status','aria-live':'polite'}),control('heli-ski-notes','div'),control('heli-ski-steps','ol'),control('heli-ski-copy-link','button',{type:'button'}),control('heli-ski-copy-brief','button',{type:'button'}),control('heli-ski-copy-status','p',{role:'status','aria-live':'polite'}),control('heli-ski-copy-fallback','div',{hidden:true}),control('heli-ski-copy-label','label',{for:'heli-ski-copy-text'}),control('heli-ski-copy-text','textarea',{readonly:true})];
      quality.cards={attribute:'data-heli-operator',items:d.heliSkiOperators.map(o=>({id:o.id,href:o.href,text:[o.name,o.address,o.idea,o.transport,o.equipment,o.meals,o.terms]}))};
      quality.heli={initial,operators:d.heliSkiOperators,options:d.heliSkiFilterOptions,sources:d.heliSkiSources};
    }
    return {path:`/blog/${slug}/`,kind:'full-guide-review',name:post.title,noindex:false,publishedDate:date,modifiedDate:meta.lastUpdated,affiliateKinds:['expedia-banner','gyg-auto'],markers:fullMarkers[slug],links:[...new Set(facts.links)],quality};
  });
}

export async function loadGuideInventory() {
  const foundation = await loadInventory();
  assert.equal(foundation.checks.length,193);assert.equal(foundation.photos.length,7);
  const tools=foundation.checks.find(c=>c.path==='/tools/');assert.ok(tools);tools.links=[...(tools.links??[]),'/trip-cost','/altitude-guide','/larch-season'];
  const d = await moduleData("export {allBlogPosts} from './src/data/blogPosts.ts'; export {blogRedirects} from './src/data/redirects.mjs'; export {resolveBlogContent,reviewedBlogBodies,authoredBookingGuideSlugs} from './src/data/blogContentRegistry.ts'; export * from './src/data/legacyTextCorrections.ts'; export * from './src/data/lessonPlanning.ts'; export * from './src/data/skiPlanning.ts'; export {towns} from './src/data/towns.ts'; export * from './src/data/townStayPlanning.ts'; export {bowLakeGuideMetadata} from './src/data/bowLakeGuideOverrides.ts'; export {jasperGuideMetadata,jasperGuideFaqs} from './src/data/jasperGuideOverrides.ts'; export {diningGuideMetadata,diningGuideFaqs} from './src/data/diningGuideOverrides.ts'; export {cabinGuideMetadata,cabinGuideFaqs} from './src/data/cabinGuideOverrides.ts'; export * from './src/data/cabinPlanning.ts'; export {nightlifeGuideMetadata,nightlifeGuideFaqs} from './src/data/nightlifeGuideOverrides.ts'; export {liveMusicGuideMetadata,liveMusicGuideFaqs} from './src/data/liveMusicGuideOverrides.ts'; export {drinkOfferGuideMetadata,drinkOfferGuideFaqs} from './src/data/drinkOfferGuideOverrides.ts'; export * from './src/data/eveningPlanning.ts'; export {parkwayGuideMetadata,parkwayGuideFaqs} from './src/data/parkwayGuideOverrides.ts'; export {minnewankaGuideMetadata,minnewankaGuideFaqs} from './src/data/minnewankaGuideOverrides.ts'; export {gondolaGuideMetadata,gondolaGuideFaqs} from './src/data/gondolaGuideOverrides.ts'; export * from './src/data/parkwayPlanning.ts'; export {winterActivityOffers} from './src/data/winterActivityLanding.ts'; export {springSkiGuideMetadata,springSkiGuideFaqs} from './src/data/springSkiGuideOverrides.ts'; export {peytoGuideMetadata,peytoGuideFaqs} from './src/data/peytoGuideOverrides.ts'; export {scenicFlightGuideMetadata,scenicFlightGuideFaqs} from './src/data/scenicFlightGuideOverrides.ts'; export {getArticleBookingContext} from './src/data/articleBookingContext.ts'; export {goldenDayGuideMetadata,goldenDayGuideFaqs} from './src/data/goldenDayGuideOverrides.ts'; export {heliSkiGuideMetadata} from './src/data/heliSkiGuideOverrides.ts'; export * from './src/data/heliSkiPlanning.ts'; export {buildDiningDirectory} from './src/data/restaurantSourceReviews.ts'; export {banffDiningSourceReviews} from './src/data/banffDiningSourceReviews.ts'; export * from './src/data/diningPlanning.ts'; export {skokiGuideMetadata,skokiGuideFaqs} from './src/data/skokiGuideOverrides.ts'; export * from './src/data/altitudePlanning.ts'; export * from './src/data/tripCostPlanning.ts'; export * from './src/data/larchPlanning.ts'; export {trails} from './src/data/trails.ts'; export {budgetGuideMetadata,budgetGuideFaqs,budgetGuideAffiliateLinks} from './src/data/budgetGuideOverrides.ts'; export {fallSeasonGuideMetadata,fallSeasonGuideFaqs} from './src/data/fallSeasonGuideOverrides.ts'; export {larchHikingGuideMetadata,larchHikingGuideFaqs} from './src/data/larchHikingGuideOverrides.ts'; export * from './src/data/parkPassPlanning.ts';");
  assert.deepEqual(Object.keys(d.legacyTextCorrections).sort(),Object.keys(PARTIAL_PUBLICATION).sort());
  assert.equal(d.legacyTextCorrectionDate,'2026-10-29');
  const additions = Object.entries(PARTIAL_PUBLICATION).map(([slug,date])=>{
    const post=d.allBlogPosts.find(post=>post.slug===slug),repair=d.legacyTextCorrections[slug];
    assert.ok(post&&!d.blogRedirects[slug]);assert.equal(post.date,date,'Original publication must remain: '+slug);assert.equal(post.lastUpdated,undefined,'Partial repair cannot reset guide-wide metadata: '+slug);
    assert.equal(repair.correctedAt,d.legacyTextCorrectionDate);assert.equal(repair.paragraph,'opening paragraph');
    const openingHtml=d.resolveBlogContent(slug).match(/<p\b[^>]*>[\s\S]*?<\/p>/i)?.[0];assert.ok(openingHtml);
    return {path:`/blog/${slug}/`,kind:'legacy-text-repair',name:post.title,noindex:false,publishedDate:date,modifiedDate:repair.correctedAt,affiliateKinds:['expedia-banner','gyg-auto'],markers:{partialCorrection:PARTIAL_LABEL},quality:{type:'partial',description:post.description,published:date,corrected:repair.correctedAt,openingHtml,opening:normal(openingHtml.replace(/<[^>]*>/g,' '))}};
  });
  additions.push(...fullReviewChecks(d));
  const contextPost=d.allBlogPosts.find(p=>p.slug==='jasper-alberta');assert.ok(contextPost&&!d.blogRedirects[contextPost.slug]);
  additions.push({path:'/blog/jasper-alberta/',kind:'article-booking-context',name:contextPost.title,noindex:false,affiliateKinds:['expedia-banner','gyg-auto'],quality:{type:'context'}});
  assert.equal(d.authoredBookingGuideSlugs.length,27);
  for(const check of additions){const slug=check.path.split('/')[2],authored=d.authoredBookingGuideSlugs.includes(slug),expected=expectedBookingContext(slug,authored);assert.deepEqual(d.getArticleBookingContext(slug,authored),expected);if(expected.suppressAutomaticCTA)check.quality.bookingContext=expected;}
  assert.equal(additions.filter(c=>c.quality.bookingContext).length,29);
  const hubLinks=[{href:'/blog/banff-nightlife-guide/#evening-planner',label:'Build your Banff evening'},{href:'/blog/new-places-to-eat-in-banff/',label:'Find a dining discovery'},{href:'/blog/banff-live-music/',label:'Find music or a show'},{href:'/blog/drink-deals/',label:'Compare current offer formats'}];
  const dining=d.buildDiningDirectory(d.banffDiningSourceReviews).venues,diningInitial=d.buildDiningPlan(),diningFaqs=await localArray('src/pages/eat-and-drink.astro','faqs');
  assert.equal(dining.length,32);assert.equal(d.diningPlanningRecords.length,32);assert.deepEqual(dining.map(v=>v.slug).sort(),d.diningPlanningRecords.map(v=>v.slug).sort());assert.equal(dining.filter(v=>v.sourceReview.status==='selected-facts').length,30);assert.deepEqual(dining.filter(v=>v.sourceReview.status==='pending').map(v=>v.slug).sort(),['pd3-by-blake','trailhead-cafe']);assert.deepEqual(diningInitial.filters,{area:'all',format:'all'});assert.equal(diningInitial.summary,'32 of 32 listed venues shown');assert.equal(diningFaqs.length,5);
  for(const venue of dining){assert.equal(venue.sourceReview.checkedOn,'2026-10-29');for(const field of ['priceRange','hours','image','lat','lng'])assert.equal(venue[field],null,'No unreviewed directory fact is promoted: '+venue.slug+'.'+field);assert.ok(venue.sourceReview.sources.length>0);}
  const diningStays=[{href:'/book/banff-hotels/',label:'Compare Banff hotel bases'},{href:'/book/lake-louise-stays/',label:'Compare Lake Louise stays'},{href:'/towns/canmore/',label:'Plan a Canmore stay'}];
  additions.push({path:'/eat-and-drink/',kind:'dining-evening-hub',name:'Eat & Drink in Banff & Beyond',noindex:false,faqs:diningFaqs,markers:{eveningNavigation:'Give your evening a shape',directoryScope:'30 entries have selected operator details checked; 2 still need clarification.',filterScope:d.diningPlannerNote,defaultCount:diningInitial.summary},links:[...hubLinks.map(l=>l.href),...diningStays.map(l=>l.href)],quality:{type:'dining-hub',hubLinks,hotelHref:'/book/banff-hotels/',controls:[control('dining-finder','section'),control('dining-form','form',{hidden:true}),control('dining-area','select'),control('dining-format','select'),control('dining-status','p',{role:'status','aria-live':'polite'}),control('dining-empty','div',{hidden:true})],cards:{attribute:'data-dining-slug',items:dining.map(v=>({id:v.slug,href:v.website??v.menuUrl??v.reserveUrl??v.enquiryLinks[0]?.url,text:[v.name,v.description,v.serviceNote,v.journeyNote]}))},dining:{venues:dining,options:d.diningFilterOptions,initial:diningInitial,stays:diningStays}}});
  const parkwayPairs={'lake-louise':[0,233],'herbert-lake':[6,227],'hector-viewpoint':[19,214],crowfoot:[36,197],'bow-lake':[39,194],peyto:[43,190],mistaya:[74,159],crossing:[80,153],'parker-ridge':[121,112],'icefield-centre':[130,103],'tangle-falls':[137,96],sunwapta:[179,54],'athabasca-falls':[203,30],jasper:[233,0]};
  assert.equal(d.parkwayStops.length,14);assert.deepEqual(d.parkwayStops.map(s=>s.id).sort(),Object.keys(parkwayPairs).sort());for(const stop of d.parkwayStops)assert.deepEqual([stop.fromLouiseKm,stop.fromJasperKm],parkwayPairs[stop.id],'Official map community-distance pair: '+stop.id);
  const initialParkway=d.buildParkwayPlan();assert.deepEqual(initialParkway.filters,{direction:'north',season:'winter',interest:'scenic'});assert.deepEqual(initialParkway.selectedIds,[]);assert.equal(initialParkway.checklist.length,3);assert.equal(d.parkwayFaqs.length,6);
  additions.push({path:'/icefields-parkway-planner/',kind:'parkway-planner',name:'Plan your Icefields Parkway stops',noindex:false,modifiedDate:d.parkwayReviewedAt,reviewDate:'29 October 2026',faqs:d.parkwayFaqs,markers:{defaultSelection:'14 places documented · no optional stops selected',distanceScope:'Approximate map distances from Lake Louise village.',winterFuel:'Prepare for no en-route fuel and no dependable walk-in services.',tires:'snow tires or chains November 1–March 31',futureFuel:'planned April 2027 return has no confirmed day',scope:'A rental booking does not establish that the Parkway or any stop is open.'},links:[...Object.values(d.parkwaySources),'https://expedia.com/affiliate/KB6G4xt','/conditions/','/blog/banff-winter-driving/','/blog/icefields-parkway-guide/','/blog/banff-to-jasper-drive/','/book/lake-louise-stays/','/blog/jasper-town/','/blog/jasper-national-park/'],quality:{type:'parkway',controls:[control('parkway-form','form',{hidden:true}),...['direction','season','interest'].map(key=>control(`parkway-${key}`,'select')),control('parkway-status','p',{role:'status','aria-live':'polite'}),control('parkway-origin','p'),control('parkway-notes','div'),control('parkway-shortlist','ul'),control('parkway-stops','div'),control('parkway-checklist','ol'),control('parkway-copy','button',{hidden:true,type:'button'}),control('parkway-copy-status','p',{role:'status','aria-live':'polite'}),control('parkway-copy-fallback','div',{hidden:true}),control('parkway-brief','textarea',{readonly:true})],cards:{attribute:'data-parkway-id',items:d.parkwayStops.map(s=>({id:s.id,href:s.href,text:[s.name,s.idea,s.winter,s.summer]}))},parkway:{stops:d.parkwayStops,options:d.parkwayFilterOptions,initial:initialParkway,carHref:'https://expedia.com/affiliate/KB6G4xt'}}});
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
  const [larchHtml,altitudeHtml,budgetHtml]=await Promise.all(['src/pages/larch-season.astro','src/pages/altitude-guide.astro','src/pages/trip-cost.astro'].map(plannerSourceHtml));
  const larchInitial=d.buildLarchPlan();assert.equal(d.larchRouteChoices.length,5);assert.deepEqual(larchInitial.filters,{area:'all',duration:'all',season:'autumn'});assert.equal(d.larchFaqs.length,5);
  const larchRoutes=d.larchRouteChoices.map(choice=>{const trail=d.trails.find(t=>t.slug===choice.id);assert.ok(trail?.routeVerified&&trail.sourceReview?.status==='reviewed'&&trail.season==='summer');return {...choice,trail};});
  additions.push({path:'/larch-season/',kind:'larch-planner',name:'Larch Season in Banff',noindex:false,reviewDate:'October 29, 2026',faqs:d.larchFaqs,markers:{source:'Selected route and seasonal sources reviewed October 29, 2026',timing:'late September into early October',limits:'They do not rate a route for your group, forecast foliage, or confirm opening, parking or a shuttle seat.',transport:'Moraine Lake Road is closed to personal vehicles year-round.',winter:'Changing the season setting above does not convert these summer profiles into winter hikes.'},links:[...Object.values(d.larchSources),'/blog/skoki-lodge-guide/','/towns/lake-louise/'],quality:{type:'larch',ssrHtml:larchHtml,controls:[control('larch-planner','section'),control('larch-form','form',{hidden:true}),...['area','duration','season'].map(key=>control('larch-'+key,'select')),control('larch-status','p',{role:'status','aria-live':'polite'}),control('larch-season-note','p'),control('larch-empty','aside',{hidden:true})],cards:{attribute:'data-larch-route',items:larchRoutes.map(r=>({id:r.id,href:'/trails/'+r.id+'/',text:[r.title,r.idea,r.boundary,r.trail.distance,r.trail.elevationGain,r.trail.time,r.trail.trailhead,r.trail.transitRoute||r.trail.accessNote,r.trail.winterNote]}))},filters:{prefix:'larch',options:d.larchFilterOptions,initial:larchInitial},larch:{routes:larchRoutes,sources:d.larchSources,seasonNotes:d.larchSeasonNotes}}});
  const altitudeInitial=d.buildAltitudePlan(),pointMetres={'banff-town':1383,'louise-community':1536,'gondola-lower':1583,'sunshine-lower':1659,'louise-lakeshore':1731,moraine:1887,'sunshine-village':2159,'gondola-upper':2281,'louise-ski-top':2637};
  assert.deepEqual(Object.fromEntries(d.altitudePoints.map(p=>[p.id,p.metres])),pointMetres);assert.equal(d.altitudeJourneys.length,5);assert.equal(d.altitudeFaqs.length,6);assert.deepEqual(altitudeInitial.filters,{journey:'all',overnight:'undecided'});assert.deepEqual(d.altitudeJourneys.map(d.altitudeDifference),[898,195,351,500,1101]);
  additions.push({path:'/altitude-guide/',kind:'elevation-planner',name:'Elevation in Banff & Lake Louise',noindex:false,modifiedDate:d.altitudeReviewedAt,reviewDate:'October 29, 2026',faqs:d.altitudeFaqs,markers:{scope:'not a safe/unsafe boundary for an individual',sleep:'unacclimatized travellers sleeping at',threshold:'2,450 m or higher, sometimes lower',fitness:'fitness does not protect against altitude illness',source:'This page has no live medical, weather, trail or operator feed.'},links:[...Object.values(d.altitudeSources).map(s=>s.url),'tel:911','tel:811','tel:+14037624506'],quality:{type:'altitude',ssrHtml:altitudeHtml,controls:[control('elevation-planner','section'),control('elevation-points','section'),control('altitude-form','form',{hidden:true}),control('altitude-journey','select'),control('altitude-overnight','select'),control('altitude-status','p',{role:'status','aria-live':'polite'}),control('altitude-overnight-question','p'),control('altitude-url-note','p',{role:'status',hidden:true}),control('altitude-copy','button',{type:'button'}),control('altitude-copy-status','p',{role:'status','aria-live':'polite'}),control('altitude-copy-fallback','div',{hidden:true}),control('altitude-copy-text','textarea',{readonly:true}),control('altitude-help','section')],cards:{attribute:'data-altitude-journey',items:d.altitudeJourneys.map(j=>({id:j.id,href:j.href,text:[j.name,j.context,j.question,j.scope]}))},filters:{prefix:'altitude',options:d.altitudeFilterOptions,initial:altitudeInitial},altitude:{points:d.altitudePoints,journeys:d.altitudeJourneys,sources:d.altitudeSources,initial:altitudeInitial}}});
  const budgetInitial=d.calculateTripBudget(d.defaultTripBudget),quoteLinks=await localArray('src/pages/trip-cost.astro','quoteLinks');assert.equal(d.tripBudgetCategories.length,7);assert.equal(d.tripBudgetFaqs.length,5);assert.equal(budgetInitial.errors.length,0);assert.equal(budgetInitial.plans.length,1);assert.equal(budgetInitial.plans[0].totalCents,null);assert.equal(budgetInitial.plans[0].missingCount,7);assert.deepEqual(quoteLinks.map(l=>l.href),['/book/banff-hotels/','/book/lake-louise-stays/','/book/banff-winter-activities/','/eat-and-drink/']);
  additions.push({path:'/trip-cost/',kind:'trip-budget-planner',name:'Trip Cost Calculator',noindex:false,modifiedDate:d.tripBudgetReviewedAt,reviewDate:'29 October 2026',faqs:d.tripBudgetFaqs,markers:{currency:'Canadian dollars (CAD), including taxes and required fees',unknown:'A blank stays unknown',scope:'not a live price feed',privacy:'does not save entries or put them into booking links',notQuote:'A calculated budget is not a booking quote or a promise of availability.'},links:[...quoteLinks.map(l=>l.href),'https://parks.canada.ca/pn-np/ab/banff/visit/tarifs-fees','https://roamtransit.com/fares/','https://www.skibig3.com/ski/lift-tickets/'],quality:{type:'budget',ssrHtml:budgetHtml,controls:[control('trip-budget-planner','section'),control('trip-budget-form','form',{hidden:true,novalidate:true}),...['people','days','nights','reserve'].map(key=>control('budget-'+key,'input',{type:'number'})),control('budget-compare','input',{type:'checkbox'}),control('budget-confirmed','input',{type:'checkbox'}),control('budget-errors','div',{role:'alert',hidden:true}),control('budget-comparison','p',{role:'status','aria-live':'polite'}),control('budget-print','button',{type:'button',hidden:true}),control('trip-budget-worksheet','section')],budget:{categories:d.tripBudgetCategories,modes:d.tripBudgetModes,defaults:d.defaultTripBudget,initial:budgetInitial,quoteLinks}}});
  assert.equal(d.parkPassReviewedAt,'2026-10-29');assert.deepEqual(d.parkPassRates,{dailyAdult:1225,dailySenior:1075,dailyGroup:2450,annualAdult:8350,annualSenior:7150,annualGroup:16750,youth:0});
  const passInitial=d.calculateParkPassPlan(),passHtml=await plannerSourceHtml('src/pages/park-pass.astro');
  assert.deepEqual(d.defaultParkPassInputs,{purpose:'visit',coverage:'compare',adults:'2',seniors:'0',youth:'0',units:'3',vehicle:'yes'});assert.equal(passInitial.state,'compare');assert.equal(passInitial.errors.length,0);assert.deepEqual(passInitial.rows.map(row=>[row.id,row.amountCents]),[['individual-daily',7350],['group-daily',7350],['individual-annual',16700],['group-annual',16750]]);assert.equal(d.parkPassFaqs.length,8);
  for(const [changes,state]of [[{purpose:'transit',adults:'bad',units:'bad'},'transit'],[{purpose:'outside',units:'bad'},'outside'],[{coverage:'existing',units:'bad'},'existing'],[{coverage:'eligibility',units:'bad'},'eligibility'],[{adults:'0',seniors:'0',youth:'2',units:'bad'},'youth'],[{adults:'8'},'invalid']])assert.equal(d.calculateParkPassPlan({...d.defaultParkPassInputs,...changes}).state,state,'Distinct admission question: '+state);
  const carFree=d.calculateParkPassPlan({...d.defaultParkPassInputs,vehicle:'no'});assert.deepEqual(carFree.rows.map(row=>row.amountCents),[7350,null,16700,null],'Private-vehicle products are not inferred for car-free arrival.');
  const passSourceLinks=Object.entries(d.parkPassSources).filter(([key])=>key!=='discoverySeller').map(([,href])=>href);
  additions.push({path:'/park-pass/',kind:'park-admission-planner',name:'Banff Park Pass Guide',noindex:false,modifiedDate:d.parkPassReviewedAt,reviewDate:'October 29, 2026',faqs:d.parkPassFaqs,markers:{source:'Official sources and listed fees reviewed',exception:'Highway 1 and Highway 93 South',otherRoads:'Icefields Parkway / 93 North and Bow Valley Parkway / 1A',freePeriod:'September 7, 2026',regular:'regular fees from September 8',unit:'a daily pass is valid until 4 pm the next day',scope:'source-dated visitor guide, not a live fee, eligibility or purchase service'},links:[...passSourceLinks,'/trip-cost/','/shuttle-reservations/','/ski-day-planner/','/towns/'],quality:{type:'park-pass',ssrHtml:passHtml,controls:[control('park-pass-planner','section'),control('park-pass-form','form',{hidden:true,novalidate:true,autocomplete:'off'}),...['purpose','coverage','vehicle'].map(key=>control('pass-'+key,'select')),...['adults','seniors','youth','units'].map(key=>control('pass-'+key,'input',{type:'number'})),control('pass-party-fields','fieldset'),control('pass-coverage-wrap','div'),control('pass-status','p',{role:'status','aria-live':'polite'}),control('pass-detail','p'),control('pass-errors','div',{hidden:true,role:'alert',tabindex:'-1'}),control('pass-comparison-table','div')],parkPass:{initial:passInitial,options:d.parkPassOptions,defaults:d.defaultParkPassInputs,rates:d.parkPassRates,sourceLinks:passSourceLinks,formatted:[7350,7350,16700,16750].map(d.formatParkPassMoney)}}});
  assert.equal(additions.length,51);assert.equal(additions.filter(c=>c.kind==='legacy-text-repair').length,8);assert.equal(additions.filter(c=>c.kind==='full-guide-review').length,27);
  const checks=[...foundation.checks,...additions];assert.equal(checks.length,EXPECTED_ROUTES);assert.equal(new Set(checks.map(c=>c.path)).size,EXPECTED_ROUTES,'Supplements must not replace or double-count foundation routes.');
  for(const base of foundation.checks)assert.equal(checks.find(c=>c.path===base.path),base,'Every foundation check is preserved.');
  const previousSupplementPaths=[...Object.keys(PARTIAL_PUBLICATION).map(slug=>`/blog/${slug}/`),...Object.keys(FULL_PUBLICATION).filter(slug=>!NEW_FULL_SLUGS.includes(slug)).map(slug=>`/blog/${slug}/`),'/blog/jasper-alberta/','/eat-and-drink/','/icefields-parkway-planner/','/learn-to-ski/','/ski-day-planner/','/towns/',...['banff','canmore','lake-louise','field-yoho','golden','kananaskis'].map(slug=>`/towns/${slug}/`),'/larch-season/','/altitude-guide/','/trip-cost/'];
  assert.equal(previousSupplementPaths.length,45);const prior238=[...foundation.checks.map(c=>c.path),...previousSupplementPaths];assert.equal(new Set(prior238).size,238);for(const pathname of prior238)assert.ok(checks.some(c=>c.path===pathname),'Preserved prior238 route: '+pathname);for(const pathname of NEW_RELEASE_PATHS)assert.ok(!prior238.includes(pathname),'New route must not double-count an old contract: '+pathname);assert.deepEqual(checks.filter(c=>!prior238.includes(c.path)).map(c=>c.path).sort(),[...NEW_RELEASE_PATHS].sort());
  return {...foundation,checks,releaseScope:{legacyOpeningRepairs:8,newFullGuides:27,totalFullReviews:78,baselineHtmlRoutes:238,newVerificationContracts:6,fullReviewRegistryAdditions:5,refreshedExistingFullGuides:0,lessonAndDayPlanners:2,townPages:7,contextOnlyGuides:1,eveningDiningHubs:1,diningVenues:{total:32,selectedFacts:30,pending:2},parkwayPlanners:1,larchPlanners:1,elevationPlanners:1,tripBudgetPlanners:1,parkPassPlanners:1,toolsDiscoveryLinks:3,curatedBookingContextPages:29,canonicalAliases:40},supplementData:{lessonProgrammes:d.lessonProgrammes,defaultPlan,family}};
}

export function analyseGuideHtml(html,check,sitemap,headerRobots='') {
  const result=analyseHtml(html,check,sitemap,headerRobots),q=check.quality;
  if(!q)return result;
  const elements=htmlElements(html).filter(n=>!n.inert),facts=htmlFacts(html),errors=result.errors;
  const byId=id=>elements.filter(n=>n.attributes.id===id);
  const visibleLinks=elements.filter(n=>n.tag==='a'&&!n.hidden&&!n.noscript&&n.attributes.href);
  if(q.bookingContext){
    const bodies=elements.filter(n=>hasClass(n,'article-body'));
    if(bodies.length!==1||bodies[0].attributes['data-curated-booking']!=='true')errors.push('Missing curated booking SSR suppression flag');
    for(const [kind,href,label]of [['expedia-banner',q.bookingContext.hotelHref,q.bookingContext.hotelLabel],['gyg-auto',q.bookingContext.tourHref,q.bookingContext.tourLabel]]){
      const slots=elements.filter(n=>n.attributes['data-affiliate-embed']===kind),links=slots.length===1?visibleLinks.filter(n=>inside(n,slots[0])):[];
      if(links.length!==1||links[0].attributes.href!==href||!textInside(html,links[0]).includes(label)||links[0].attributes.target!=='_blank'||!(links[0].attributes.rel??'').split(/\s+/).includes('sponsored'))errors.push(`Incorrect native article booking context: ${kind}`);
    }
  }
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
  if(q.type==='full'){
    const articles=facts.documents.flatMap(doc=>schemaNodes(doc,'Article'));
    if(articles.length!==1)errors.push('Expected exactly one full-review Article schema');
    else{const article=articles[0];if(article.datePublished!==isoDate(q.published))errors.push('Original full-review publication schema date changed');if(article.dateModified!==isoDate(q.corrected))errors.push('Full-review modification schema date differs');if(normal(article.headline??'')!==normal(check.name)||normal(article.description??'')!==normal(q.description))errors.push('Full-review title/description differs');if(Object.hasOwn(article,'image'))errors.push('Illustrative hero must omit Article photographic identity');}
    if(facts.text.includes(PARTIAL_LABEL))errors.push('Full review incorrectly labelled as a partial repair');
    if(!elements.some(n=>hasClass(n,'article-image-note')&&!n.hidden&&/Illustrative.*not (?:a )?verified/i.test(textInside(html,n))))errors.push('Missing visible illustrative hero scope');
    if(!elements.some(n=>n.tag==='img'&&hasClass(n,'article-hero-img')&&/Illustrative/i.test(n.attributes.alt??'')))errors.push('Missing illustrative hero alt context');
    const bodies=elements.filter(n=>hasClass(n,'article-body'));
    if(bodies.length!==1)errors.push('Missing full-review article body');
    else{
      const anchors=elements.filter(n=>n.tag==='a'&&inside(n,bodies[0]));
      if(anchors.some(n=>anchors.some(parent=>parent!==n&&inside(n,parent))))errors.push('Nested anchor in full-review body');
      const bodyText=textInside(html,bodies[0]);
      const bad=/natural skating rink|complimentary wi[ -]?fi|(?:canoe|kayak|paddleboard) rentals? (?:are|is) available|Maligne Canyon trail offers year-round access|Ice climbing opportunities abound in Maligne Canyon|skied the Maligne Lake road multiple times|all six (?:restaurants|venues) (?:are new|opened in 2026)|each cabin has a full kitchen|during my last visit|\$\s*\d|\bCAD\s*\d/i;
      if(bad.test(bodyText))errors.push('Unsupported inherited/current claim in full review');
      // Dated percentages on selected items are legitimate; do not equate a
      // documented 50% offer with an invented dollar price or blanket discount.
      const eveningBad={
        'banff-nightlife-guide':/Dancing Sasquatch (?:is|hosts|offers)|Wild Bill['’]s is|most bars (?:do not|don['’]t) charge (?:a )?cover|(?:taxis?|buses?) are always available|(?:won['’]t|do not) need (?:a )?(?:car|taxi)/i,
        'banff-live-music':/Aurora Lounge (?:hosts|offers|has)|every Banff Centre performance is suitable for children|(?:free|complimentary) hotel shuttles? (?:run|are available) all night|(?:Rose & Crown|Melissa['’]s) (?:has|hosts) live bands every (?:Friday|Saturday)/i,
        'drink-deals':/Sky Bistro includes gondola admission|(?:the )?(?:whole|entire) menu is 50% off|High Rollers bowling happy hour runs from|specials are available on (?:all )?holidays/i,
      }[q.slug];
      if(eveningBad?.test(bodyText))errors.push('Unsupported inherited/current claim in full review');
      const winterBad={
        'icefields-parkway-guide':/fuel is available at (?:Saskatchewan )?(?:River )?Crossing in winter|walk onto the Athabasca Glacier|complete (?:the|this) drive in \d|all stops are accessible/i,
        'banff-to-jasper-drive':/fuel is available at (?:Saskatchewan )?(?:River )?Crossing in winter|Maligne Canyon is open for winter|complete (?:the|this) drive in \d|(?:winter|snow) tires (?:are )?(?:legally )?required (?:from )?October 1/i,
        'lake-minnewanka-guide':/Minnewanka is open for ice fishing|the road is open year-round|personal paddlecraft are allowed|you can paddle your own/i,
        'banff-gondola-guide':/boardwalk is fully accessible|Sky Bistro reservations include gondola admission|gondola cabins are heated|(?:standalone|all|your|these) tickets include hotel pickup/i,
        'banff-gondola-tickets-guide':/boardwalk is fully accessible|Sky Bistro reservations include gondola admission|free cancellation (?:applies|is included)|(?:standalone|all|your|these) tickets include hotel pickup/i,
        'banff-spring-skiing':/quit by 2\s*p\.?m|start skiing by 9\s*a\.?m|follow the sun to south-facing slopes|virtually no lift lines|lift lines are short or nonexistent|Delirium Dive is suitable for beginners|Delirium Dive is open all spring|spring (?:always|automatically) saves/i,
        'peyto-lake-guide':/the main viewpoint trail is wheelchair accessible|there are no washrooms at Bow Summit|Bow Summit gains (?:an additional )?95 metres over 2 km|the upper parking lot is open to all vehicles|the summer route is cleared all winter/i,
        'banff-helicopter-tours':/Rockies Heli is based in Kananaskis Village|flights depart from Banff town|all helicopter overflights are prohibited|all flights include a mountain landing|a visible product page guarantees a winter departure/i,
        'kananaskis-heli-tours':/Stoney Nakoda operates all winter 2026\/27|the base is in Kananaskis Village|Canmore bus tickets include Stoney Nakoda transfers|all flights include a mountain landing|a visible product page guarantees a winter departure/i,
        'golden-bc-day-trip':/\b135\s*km\b|90 minutes west|depart Banff at 8\s*a\.?m|arrive Golden at 9:30|return to Banff by 7\s*p\.?m|book a morning gondola ride and summit hike, then a 1\s*p\.?m rafting trip|half-day trips[^.]*suitable for beginners and families|full-day trips[^.]*include[^.]*lower canyon|Golden Skybridge is open all winter|Takakkaw Falls road is open all winter|Kicking Horse is a SkiBig3 resort|all shuttles cover heli bases|guaranteed clear roads/i,
        'banff-heli-skiing':/CMH Purcell (?:includes transport|is based in Panorama)|RK Heliski is based in Golden|(?:all|both) operators? (?:include|offer) free Banff transfers|a shared shuttle is guaranteed|CMH always includes all meals|CMH never includes food|all safety equipment is optional|KPOW operates every day in winter 2026\/27|ski every heli day then drive back to Banff/i,
        'skoki-lodge-guide':/11 km one way from (?:the )?Fish Creek|775 (?:metres|meters)|the (?:approach|route) is (?:safe for beginners|avalanche-free)|a guide is included|pack delivery is included|all equipment is provided|wine is included|weather cancellations are always refundable|the lodge is an emergency shelter|lodge staff will rescue you|walk across Ptarmigan Lake|guaranteed privacy/i,
      }[q.slug];
      if(winterBad?.test(bodyText))errors.push('Unsupported inherited/current claim in full review');
      const freshBad={
        'banff-trip-cost-budget-guide':/everyone should budget (?:CAD|\$)|Canmore is always cheaper|Discovery Pass pays for itself in seven travel days|all activity bookings include free cancellation|fall hotels are \d+% cheaper|blank costs? (?:are|mean) free/i,
        'fall-larch-season-banff':/peak is guaranteed|\d+% fewer (?:people|crowds)|safe winter (?:hike|route)|all larch trails require (?:a group of )?four|Moraine Lake Road opens to personal vehicles|Sunshine gondola operates through late September 2027/i,
        'banff-in-fall':/fall hotels are \d+% cheaper|all fall trails are open|Johnston Canyon is open throughout October 2026|Upper Hot Springs is open throughout October 2026|Sunshine gondola operates through late September 2027|late-October buses include Moraine Lake/i,
        'larch-valley-hike':/highest.*maintained trail|8\.6 km|535 m|11\.6 km|725 m|20 km return.*Paradise|safe winter (?:hike|route)|bear spray is mandatory|four-person group is always required/i,
        'sentinel-pass-hike':/highest.*maintained trail|11\.6 km|725 m|3\.2 km|2\.6 km|last 500 metres of (?:climbing|gain)|Paradise Valley is an equivalent exit|safe winter (?:hike|route)|bear spray is mandatory|four-person group is always required/i,
      }[q.slug];
      if(freshBad?.test(bodyText))errors.push('Unsupported inherited/current claim in full review');
      for(const href of q.nativeReferrals??[]){const links=anchors.filter(n=>!n.hidden&&n.attributes.href===href);if(links.length!==1||links[0].attributes.target!=='_blank'||!['noopener','sponsored'].every(value=>(links[0].attributes.rel??'').split(/\s+/).includes(value)))errors.push('Missing exact authored native search/referral: '+href);}
      if(q.budgetGuide){
        const legacy=/\/banff-gondola-admission-ticket-t556595\/|\/lake-minnewanka-cruise-tc128\/|\/athabasca-glacier-columbia-icefield-day-trip-t113074\/|\/food-drink-tc36\//;
        if(anchors.some(n=>legacy.test(n.attributes.href??''))||/marketplace routes previously linked|older .*marketplace route/i.test(bodyText))errors.push('Unverified legacy budget marketplace route remains public');
        const tables=elements.filter(n=>n.tag==='table'&&inside(n,bodies[0])),rows=tables[0]?elements.filter(n=>n.tag==='tr'&&inside(n,tables[0])):[];
        const costs=['Accommodation','Food and drinks','Activities and equipment','Getting around','Getting here and home','Admission and permits','Other costs'];
        if(rows.length!==8||costs.some((label,i)=>!textInside(html,rows[i+1]).startsWith(label)))errors.push('Missing whole-trip seven-category budget guide table');
        if(!bodyText.includes('affiliate links')||!bodyText.includes('commission'))errors.push('Missing budget destination-search disclosure');
      }
    }
    // Jasper's trusted static answer HTML is semantically compared, not treated
    // as literal visible angle brackets. The original193 FAQ contract is intact.
    const schemas=facts.documents.flatMap(doc=>schemaNodes(doc,'FAQPage'));
    if(schemas.length!==1||schemas[0].mainEntity?.length!==q.fullFaqs.length)errors.push('Full-review FAQ schema count differs');
    else q.fullFaqs.forEach((expected,index)=>{const actual=schemas[0].mainEntity[index],visible=facts.details.filter(f=>f.question===plainFragment(expected.question));if(actual?.['@type']!=='Question'||actual.acceptedAnswer?.['@type']!=='Answer'||plainFragment(actual.name)!==plainFragment(expected.question)||plainFragment(actual.acceptedAnswer.text)!==plainFragment(expected.answer)||visible.length!==1||visible[0].answer!==plainFragment(expected.answer))errors.push(`Full-review visible/schema FAQ mismatch: ${index+1}`);});
    for(const section of q.diningSections??[]){
      const heading=byId(section.id).find(n=>n.tag==='h3'&&!n.hidden),next=heading&&elements.find(n=>n.start>heading.end&&/^h[23]$/.test(n.tag));
      if(!heading){errors.push(`Missing dining venue section: ${section.id}`);continue;}
      const bounds={openEnd:heading.end,innerEnd:next?.start??html.length},sectionText=plainFragment(html.slice(bounds.openEnd,bounds.innerEnd));
      if(section.markers.some(marker=>!sectionText.includes(normal(marker)))||!visibleLinks.some(n=>inside(n,bounds)&&n.attributes.href===section.href))errors.push(`Missing dated/native dining facts: ${section.id}`);
    }
    for(const section of q.sections??[]){
      const body=bodies[0],heading=byId(section.id).find(n=>n.tag==='h2'&&!n.hidden&&body&&inside(n,body));
      if(!heading){errors.push('Missing reviewed access/season section: '+section.id);continue;}
      const next=elements.find(n=>n.tag==='h2'&&n.start>heading.end&&inside(n,body)),bounds={openEnd:heading.end,innerEnd:next?.start??body.innerEnd};
      const text=plainFragment(html.slice(bounds.openEnd,bounds.innerEnd));
      if(section.markers.some(marker=>!text.includes(normal(marker)))||(section.links??[]).some(href=>!visibleLinks.some(n=>inside(n,bounds)&&n.attributes.href===href)))errors.push('Missing reviewed access/season/base requirements: '+section.id);
    }
    if(q.cabinNative){
      const form=byId('cabin-fit-form')[0];if(!form||elements.filter(n=>n.tag==='button'&&n.attributes.type==='reset'&&inside(n,form)).length!==1)errors.push('Missing native cabin reset control');
      for(const [key,options]of Object.entries(q.cabinOptions)){const select=byId(`cabin-${key}`)[0],actual=select?elements.filter(n=>n.tag==='option'&&inside(n,select)):[];if(actual.map(n=>n.attributes.value).join('|')!==options.map(o=>o[0]).join('|')||actual[0]?.attributes.value!=='all'||actual.some((n,i)=>i>0&&Object.hasOwn(n.attributes,'selected')))errors.push(`Cabin default/whitelist differs: ${key}`);}
      for(const item of q.cabinNative){const card=elements.find(n=>n.attributes['data-cabin-id']===item.id),cta=card&&visibleLinks.filter(n=>inside(n,card)&&hasClass(n,'cabin-book'));if(!cta||cta.length!==1||cta[0].attributes.href!==item.href||cta[0].attributes.target!=='_blank'||!(cta[0].attributes.rel??'').split(/\s+/).includes('noopener')||(cta[0].attributes.rel??'').split(/\s+/).includes('sponsored')!==item.affiliate)errors.push(`Cabin native merchant/operator contract differs: ${item.id}`);}
    }
    if(q.evening){
      const form=byId('evening-fit-form')[0];
      for(const type of ['submit','reset'])if(!form||elements.filter(n=>n.tag==='button'&&n.attributes.type===type&&inside(n,form)).length!==1)errors.push(`Missing native evening ${type} control`);
      for(const [key,options]of Object.entries(q.evening.options)){
        const select=byId(`evening-${key}`)[0],actual=select?elements.filter(n=>n.tag==='option'&&inside(n,select)):[];
        if(actual.length!==options.length||actual.some((n,i)=>n.attributes.value!==options[i]?.[0]||textInside(html,n)!==normal(options[i]?.[1])||(i>0&&Object.hasOwn(n.attributes,'selected')))||actual[0]?.attributes.value!==q.evening.filters[key]||!form||!select||!inside(select,form)||elements.filter(n=>n.tag==='label'&&n.attributes.for===`evening-${key}`&&inside(n,form)).length!==1)errors.push(`Evening default/whitelist/label differs: ${key}`);
      }
      const count=byId('evening-fit-count')[0];if(!count||count.hidden||textInside(html,count)!=='5 evening formats to explore')errors.push('Evening SSR default count differs');
      const notes=byId('evening-fit-notes')[0];if(!notes||q.evening.notes.some(note=>!textInside(html,notes).includes(normal(note))))errors.push('Missing evening planning scope notes');
      const list=byId('evening-steps')[0],steps=list?elements.filter(n=>n.tag==='li'&&inside(n,list)):[];
      if(steps.length!==3||steps.some((n,i)=>textInside(html,n)!==normal(q.evening.steps[i])))errors.push('Missing complete default evening return steps');
      const journey=byId('evening-journey-link')[0],heading=byId('evening-journey-title')[0];
      if(!journey||journey.hidden||journey.attributes.href!==q.evening.journey.href||textInside(html,journey)!==normal(q.evening.journey.label+' ↗')||journey.attributes.target!=='_blank'||!(journey.attributes.rel??'').split(/\s+/).includes('noopener')||!heading||textInside(html,heading)!==normal(q.evening.journey.title))errors.push('Missing exact native default Banff evening journey');
      if(visibleLinks.filter(n=>n.attributes.href==='#evening-planner').length!==1)errors.push('Missing unique Evening planner jump link');
    }
    if(q.gondolaProduct){
      const body=bodies[0],links=body?visibleLinks.filter(n=>inside(n,body)&&n.attributes.href===q.gondolaProduct.href):[];
      if(links.length!==1||links[0].attributes.target!=='_blank'||!['noopener','sponsored'].every(rel=>(links[0].attributes.rel??'').split(/\s+/).includes(rel))||!textInside(html,links[0]).includes('affiliate booking link'))errors.push('Missing exact native Gondola product/affiliate handoff');
    }
    if(q.heli){
      const planner=byId('heli-ski-planner')[0],form=byId('heli-ski-form')[0];
      for(const type of ['submit','reset'])if(!form||elements.filter(n=>n.tag==='button'&&n.attributes.type===type&&inside(n,form)).length!==1)errors.push(`Missing native heli ${type} control`);
      for(const [key,options]of Object.entries(q.heli.options)){
        const select=byId(`heli-ski-${key}`)[0],actual=select?elements.filter(n=>n.tag==='option'&&inside(n,select)):[];
        if(!form||!select||!inside(select,form)||actual.length!==options.length||actual.some((n,i)=>n.attributes.value!==options[i]?.[0]||textInside(html,n)!==normal(options[i]?.[1])||(i>0&&Object.hasOwn(n.attributes,'selected')))||actual[0]?.attributes.value!==q.heli.initial.filters[key]||elements.filter(n=>n.tag==='label'&&n.attributes.for===`heli-ski-${key}`&&inside(n,form)).length!==1)errors.push(`Heli default/whitelist/label differs: ${key}`);
      }
      const count=byId('heli-ski-status')[0],notes=byId('heli-ski-notes')[0],list=byId('heli-ski-steps')[0],steps=list?elements.filter(n=>n.tag==='li'&&inside(n,list)):[];
      if(!count||count.hidden||textInside(html,count)!=='2 operators to compare; no booking or ability approval')errors.push('Heli SSR default scope/count differs');
      if(!notes||notes.hidden||q.heli.initial.notes.some(note=>!textInside(html,notes).includes(normal(note))))errors.push('Missing heli logistics-only/privacy scope');
      if(steps.length!==3||steps.some((n,i)=>textInside(html,n)!==normal(q.heli.initial.steps[i])))errors.push('Missing complete default heli journey confirmations');
      for(const operator of q.heli.operators){
        const card=elements.find(n=>n.attributes['data-heli-operator']===operator.id),questions=q.heli.initial.operatorPlans.find(p=>p.id===operator.id);
        if(!card||!planner||!inside(card,planner))errors.push('Heli operator card outside reviewed planner: '+operator.id);
        if(!card)continue;
        const actions=visibleLinks.filter(n=>inside(n,card)&&hasClass(n,'heli-ski-action'));
        if(actions.length!==1||actions[0].attributes.href!==operator.href||actions[0].attributes.target!=='_blank'||!(actions[0].attributes.rel??'').split(/\s+/).includes('noopener')||(actions[0].attributes.rel??'').split(/\s+/).includes('sponsored')||textInside(html,actions[0])!==normal(operator.linkLabel+' →'))errors.push('Missing native non-affiliate heli enquiry: '+operator.id);
        for(const key of ['journey','transfer','overnight','equipment']){const detail=elements.filter(n=>Object.hasOwn(n.attributes,`data-heli-${key}`)&&inside(n,card));if(detail.length!==1||detail[0].hidden||textInside(html,detail[0])!==normal(questions[key]))errors.push('Missing operator-specific heli question: '+operator.id+'.'+key);}
        for(const [,href]of operator.sources)if(!visibleLinks.some(n=>inside(n,card)&&n.attributes.href===href&&n.attributes.target==='_blank'&&(n.attributes.rel??'').split(/\s+/).includes('noopener')))errors.push('Missing heli primary section source: '+operator.id);
      }
      const cat=elements.filter(n=>hasClass(n,'heli-ski-cat')&&!n.hidden&&planner&&inside(n,planner));
      if(cat.length!==1||['different booking and base','not an automatic alternative for a cancelled flight','2025/26 booking and season information','actual 2026/27 programme','no current departure, powder or terrain approval'].some(marker=>!textInside(html,cat[0]).includes(marker))||!visibleLinks.some(n=>inside(n,cat[0])&&n.attributes.href===q.heli.sources.kpow))errors.push('Missing separate cat-ski season/base/approval boundary');
      if(visibleLinks.filter(n=>n.attributes.href==='#heli-ski-planner').length!==1)errors.push('Missing unique Heli-ski planner jump link');
    }
  }
  if(q.cards){
    const cards=elements.filter(n=>Object.hasOwn(n.attributes,q.cards.attribute));
    if(cards.length!==q.cards.items.length||cards.some(n=>n.tag!=='article'||n.hidden)||new Set(cards.map(n=>n.attributes[q.cards.attribute])).size!==q.cards.items.length)errors.push('Missing/hidden/duplicate full SSR guide cards');
    for(const item of q.cards.items){const card=cards.find(n=>n.attributes[q.cards.attribute]===item.id);if(!card){errors.push(`Missing reviewed guide card: ${item.id}`);continue;}if(!visibleLinks.some(n=>inside(n,card)&&n.attributes.href===item.href&&(!q.cards.linkAttribute||Object.hasOwn(n.attributes,q.cards.linkAttribute))))errors.push(`Missing native guide card link: ${item.id}`);for(const marker of item.text)if(!textInside(html,card).includes(normal(marker)))errors.push(`Missing guide card decision detail: ${item.id}`);}
    if(q.boundaryLocationOnly){if(cards.some(n=>n.attributes[q.cards.attribute]==='banff-boundary-lodge'))errors.push('Location-only Boundary promoted into room matches');if(!elements.some(n=>n.attributes['data-source-scope']==='location-only'&&!n.hidden&&textInside(html,n).includes('unit facilities are not included')))errors.push('Missing Boundary location-only distinction');}
  }
  if(q.filters){
    const {prefix,options,initial}=q.filters,form=byId(prefix+'-form')[0];
    for(const type of ['submit','reset'])if(!form||elements.filter(n=>n.tag==='button'&&n.attributes.type===type&&inside(n,form)).length!==1)errors.push(`Missing native ${prefix} ${type} control`);
    for(const [key,choices]of Object.entries(options)){const select=byId(prefix+'-'+key)[0],actual=select?elements.filter(n=>n.tag==='option'&&inside(n,select)):[];if(!select||!form||!inside(select,form)||actual.length!==choices.length||actual.some((n,i)=>n.attributes.value!==choices[i]?.[0]||textInside(html,n)!==normal(choices[i]?.[1])||(i>0&&Object.hasOwn(n.attributes,'selected')))||actual[0]?.attributes.value!==initial.filters[key]||elements.filter(n=>n.tag==='label'&&n.attributes.for===prefix+'-'+key&&inside(n,form)).length!==1)errors.push(`${prefix} select/default/label differs: ${key}`);}
    const status=byId(prefix+'-status')[0];if(!status||status.hidden||textInside(html,status)!==initial.summary)errors.push(prefix+' SSR default status differs');
  }
  if(q.type==='larch'){
    const planner=byId('larch-planner')[0],note=byId('larch-season-note')[0];
    if(!note||note.hidden||textInside(html,note)!==normal(q.filters.initial.note))errors.push('Missing larch variable-season planning note');
    for(const route of q.larch.routes){const card=elements.find(n=>n.attributes['data-larch-route']===route.id),grade={easy:'Easy',moderate:'Moderate',challenging:'Difficult'}[route.trail.difficulty];if(!card||!planner||!inside(card,planner))errors.push('Larch profile outside planner: '+route.id);else if(!textInside(html,card).includes(grade)||elements.some(n=>n.tag==='img'&&inside(n,card))||![q.larch.sources.hiking,route.larchSource].every(href=>visibleLinks.some(n=>inside(n,card)&&n.attributes.href===href&&n.attributes.target==='_blank')))errors.push('Larch reviewed grade/source/photo scope differs: '+route.id);}
    if(/90% fewer|Predicted Peak|Historical Peak|arrive before 6:30|almost no crowds|the peak is guaranteed|guaranteed larch colour on|these are safe winter hikes/i.test(facts.text))errors.push('Unsupported larch peak/crowd/winter prediction');
    if(!facts.text.includes('mid-October to mid-June')||!facts.text.includes('2026 lake shuttle season ended October 12')||!facts.text.includes('Healy Pass starts at Sunshine’s lower base'))errors.push('Missing larch seasonal transport/terrain/base limits');
  }
  if(q.type==='altitude'){
    const points=elements.filter(n=>n.tag==='tr'&&Object.hasOwn(n.attributes,'data-altitude-point')),number=v=>v.toLocaleString('en-CA');
    if(points.length!==9||points.some(n=>n.hidden)||new Set(points.map(n=>n.attributes['data-altitude-point'])).size!==9)errors.push('Missing nine visible elevation reference points');
    for(const point of q.altitude.points){const row=points.find(n=>n.attributes['data-altitude-point']===point.id);if(!row||![point.label,number(point.metres)+' m',point.note].every(t=>textInside(html,row).includes(normal(t)))||!visibleLinks.some(n=>inside(n,row)&&n.attributes.href===q.altitude.sources[point.source].url))errors.push('Named elevation/source differs: '+point.id);}
    for(const journey of q.altitude.journeys){const card=elements.find(n=>n.attributes['data-altitude-journey']===journey.id),from=q.altitude.points.find(p=>p.id===journey.from),to=q.altitude.points.find(p=>p.id===journey.to);if(!card||![from.label+': '+number(from.metres)+' m',to.label+': '+number(to.metres)+' m','+'+number(to.metres-from.metres)+' m — not total ascent'].every(t=>textInside(html,card).includes(t))||!visibleLinks.some(n=>inside(n,card)&&n.attributes.href===q.altitude.sources[journey.source].url))errors.push('Elevation named-point difference/primary source differs: '+journey.id);}
    const overnight=byId('altitude-overnight-question')[0];if(!overnight||textInside(html,overnight)!==normal(q.altitude.initial.overnightQuestion))errors.push('Missing default overnight distinction');
    const preparation=byId('altitude-preparation')[0],steps=elements.find(n=>n.tag==='ol'&&hasClass(n,'altitude-steps')&&preparation&&inside(n,preparation));if(!steps||elements.filter(n=>n.tag==='li'&&inside(n,steps)).length!==5)errors.push('Missing five altitude preparation questions');
    const help=byId('altitude-help')[0],emergency=elements.find(n=>hasClass(n,'altitude-emergency')&&help&&inside(n,help)),helpText=help?textInside(html,help):'';
    if(!help||['do not continue higher while symptoms remain','Worsening symptoms','Do not leave an ill person to descend alone','not mountain rescue'].some(t=>!helpText.includes(t))||!emergency||['Confusion','difficulty walking straight','breathlessness at rest','urgent medical help','not guaranteed'].some(t=>!textInside(html,emergency).includes(t))||!['tel:911','tel:+14037624506'].every(href=>visibleLinks.some(n=>inside(n,emergency)&&n.attributes.href===href))||!visibleLinks.some(n=>inside(n,help)&&n.attributes.href==='tel:811'))errors.push('Missing altitude illness escalation/distinct Canadian contacts');
    if(/low risk for (?:everyone|all)|safe below 2,?450|fitness prevents altitude illness|continue higher with symptoms|Day 2 guarantees acclimatization|drink (?:3|4)[–-]?(?:3|4)? litres|risk score:\s*\d/i.test(facts.text)||elements.some(n=>n.tag==='input'&&/home|health|symptom|medical/i.test(n.attributes.id??'')))errors.push('Unsupported personal altitude score/timing/treatment claim');
    if(!facts.text.includes('past 2026 season')||!facts.text.includes('does not confirm winter sightseeing')||!facts.text.includes('Moraine Lake Road is closed to personal vehicles year-round'))errors.push('Missing altitude journey current-season/access boundaries');
  }
  if(q.type==='budget'){
    const budget=q.budget,form=byId('trip-budget-form')[0];
    for(const key of ['people','days','nights','reserve']){const field=byId('budget-'+key)[0];if(!field||field.attributes.value!==budget.defaults[key])errors.push('Budget trip shape default differs: '+key);}
    for(const id of ['budget-compare','budget-confirmed']){const field=byId(id)[0];if(!field||Object.hasOwn(field.attributes,'checked'))errors.push('Budget comparison/confirmation prechecked');}
    for(const type of ['submit','reset'])if(!form||elements.filter(n=>n.tag==='button'&&n.attributes.type===type&&inside(n,form)).length!==1)errors.push('Missing native budget '+type+' control');
    for(const id of ['a','b']){
      const fields=byId('budget-'+id+'-fields')[0],result=byId('budget-'+id+'-result')[0];
      if(!fields||fields.tag!=='fieldset'||fields.attributes['data-budget-plan']!==id||Object.hasOwn(fields.attributes,'hidden')!==(id==='b')||Object.hasOwn(fields.attributes,'disabled')!==(id==='b')||!result||result.hidden!==(id==='b'))errors.push('Budget Plan A/B progressive SSR scope differs: '+id);
      const total=byId('budget-'+id+'-total')[0],rows=result?elements.filter(n=>n.tag==='tr'&&Object.hasOwn(n.attributes,'data-budget-row')&&inside(n,result)):[];if(!total||textInside(html,total)!=='No total yet'||rows.length!==7)errors.push('Budget initial missing-cost results differ: '+id);
      for(const category of budget.categories){const mode=byId(`budget-${id}-${category.id}-mode`)[0],amount=byId(`budget-${id}-${category.id}-amount`)[0],basis=byId(`budget-${id}-${category.id}-basis`)[0],modes=mode?elements.filter(n=>n.tag==='option'&&inside(n,mode)):[],row=rows.find(n=>n.attributes['data-budget-row']===category.id),value=row&&elements.find(n=>Object.hasOwn(n.attributes,'data-budget-value')&&inside(n,row));if(!mode||modes.map(n=>n.attributes.value).join('|')!==budget.modes.map(m=>m[0]).join('|')||modes.some((n,i)=>i>0&&Object.hasOwn(n.attributes,'selected'))||!amount||amount.attributes.type!=='number'||(amount.attributes.value??'')!==''||amount.attributes.placeholder!=='Unknown until entered'||!basis||!value||textInside(html,value)!=='Not entered')errors.push('Budget blank/mode/category default differs: '+id+'.'+category.id);if(category.bases.length>1){const options=basis?elements.filter(n=>n.tag==='option'&&inside(n,basis)):[];if(basis?.tag!=='select'||options.map(n=>n.attributes.value).join('|')!==category.bases.map(b=>b[0]).join('|')||options.some((n,i)=>i>0&&Object.hasOwn(n.attributes,'selected')))errors.push('Budget quote-basis whitelist differs: '+category.id);}else if(basis?.attributes.type!=='hidden'||basis.attributes.value!=='trip')errors.push('Budget whole-party trip basis differs: '+category.id);}
    }
    const worksheet=byId('trip-budget-worksheet')[0],table=elements.find(n=>n.tag==='table'&&hasClass(n,'manual-table')&&worksheet&&inside(n,worksheet)),body=table&&elements.find(n=>n.tag==='tbody'&&inside(n,table));if(!worksheet||worksheet.hidden||!body||elements.filter(n=>n.tag==='tr'&&inside(n,body)).length!==10||budget.categories.some(c=>!textInside(html,worksheet).includes(c.label)))errors.push('Missing complete no-JS seven-cost/three-total budget worksheet');
    if(/budget hotel costs? (?:CAD|\$)|typical trip costs? (?:CAD|\$)|guaranteed (?:saving|budget)|blank amounts? (?:are|mean) zero/i.test(facts.text)||facts.documents.some(doc=>schemaNodes(doc,'Offer').length||schemaNodes(doc,'PriceSpecification').length))errors.push('Unsupported budget market-price/zero/offer claim');
    if(!elements.some(n=>n.tag==='img'&&hasClass(n,'page-hero-bg')&&/Illustrative.*not verified/i.test(n.attributes.alt??''))||!elements.some(n=>hasClass(n,'budget-image-note')&&!n.hidden&&/Illustrative.*not a verified/i.test(textInside(html,n))))errors.push('Missing illustrative budget image qualification');
  }
  if(q.type==='park-pass'){
    const pass=q.parkPass,form=byId('park-pass-form')[0],party=byId('pass-party-fields')[0],coverage=byId('pass-coverage-wrap')[0],table=byId('pass-comparison-table')[0],status=byId('pass-status')[0],detail=byId('pass-detail')[0];
    if(!form||Object.hasOwn(form.attributes,'action')||!party||Object.hasOwn(party.attributes,'hidden')||Object.hasOwn(party.attributes,'disabled')||!coverage||Object.hasOwn(coverage.attributes,'hidden')||!table||table.hidden||!elements.some(n=>n.tag==='noscript'))errors.push('Missing complete progressive park-pass SSR scope');
    for(const key of ['purpose','coverage','vehicle']){const select=byId('pass-'+key)[0],actual=select?elements.filter(n=>n.tag==='option'&&inside(n,select)):[],choices=pass.options[key];if(!form||!select||!inside(select,form)||actual.length!==choices.length||actual.some((n,i)=>n.attributes.value!==choices[i]?.[0]||textInside(html,n)!==normal(choices[i]?.[1])||(i>0&&Object.hasOwn(n.attributes,'selected')))||actual[0]?.attributes.value!==pass.defaults[key]||elements.filter(n=>n.tag==='label'&&n.attributes.for==='pass-'+key&&inside(n,form)).length!==1)errors.push('Park-pass select/default/label differs: '+key);}
    for(const key of ['adults','seniors','youth','units']){const input=byId('pass-'+key)[0],min=key==='units'?'1':'0',max=key==='units'?'60':'7';if(!input||!form||!inside(input,form)||input.attributes.value!==pass.defaults[key]||input.attributes.min!==min||input.attributes.max!==max||input.attributes.step!=='1'||Object.hasOwn(input.attributes,'name')||elements.filter(n=>n.tag==='label'&&n.attributes.for==='pass-'+key&&inside(n,form)).length!==1)errors.push('Park-pass numeric default/private-field boundary differs: '+key);}
    for(const type of ['submit','reset'])if(!form||elements.filter(n=>n.tag==='button'&&n.attributes.type===type&&inside(n,form)).length!==1)errors.push('Missing native park-pass '+type+' control');
    const fields=form?elements.filter(n=>['input','select','textarea'].includes(n.tag)&&inside(n,form)):[];
    if(fields.length!==7||fields.some(n=>Object.hasOwn(n.attributes,'name'))||elements.some(n=>form&&inside(n,form)&&Object.hasOwn(n.attributes,'formaction')))errors.push('Unexpected park-pass personal/query submission field');
    if(!status||status.hidden||textInside(html,status)!==normal(pass.initial.summary)||!detail||detail.hidden||textInside(html,detail)!==normal(pass.initial.detail))errors.push('Park-pass default admission arithmetic/scope differs');
    const rows=elements.filter(n=>Object.hasOwn(n.attributes,'data-pass-option'));if(rows.length!==4||rows.some(n=>n.tag!=='tr'||n.hidden||!table||!inside(n,table)))errors.push('Missing complete four-option park-pass SSR table');
    for(const [index,expected]of pass.initial.rows.entries()){const matches=rows.filter(n=>n.attributes['data-pass-option']===expected.id),value=byId('pass-'+expected.id+'-value')[0],basis=byId('pass-'+expected.id+'-detail')[0];if(matches.length!==1||!value||!basis||!inside(value,matches[0])||!inside(basis,matches[0])||textInside(html,value)!==normal(pass.formatted[index])||textInside(html,basis)!==normal(expected.detail)||!textInside(html,matches[0]).includes(normal(expected.label)))errors.push('Park-pass exact published-fee option differs: '+expected.id);}
    const rateRows=elements.filter(n=>Object.hasOwn(n.attributes,'data-pass-rate')),rates=[['Adult · age 18–64','CAD 12.25','CAD 83.50'],['Senior · age 65+','CAD 10.75','CAD 71.50'],['Youth · age 17 and under','Free admission','No paid pass needed for regular youth admission'],['Family/group · up to 7 in one vehicle','CAD 24.50','CAD 167.50']];
    if(rateRows.length!==4||rateRows.some((row,index)=>row.tag!=='tr'||row.hidden||rates[index].some(marker=>!textInside(html,row).includes(marker))))errors.push('Park-pass source-dated rate/youth table differs');
    for(const href of pass.sourceLinks)if(!visibleLinks.some(n=>n.attributes.href===href&&n.attributes.target==='_blank'&&(n.attributes.rel??'').split(/\s+/).includes('noopener')&&!(n.attributes.rel??'').split(/\s+/).includes('sponsored')))errors.push('Missing direct official park-pass purchase/source route: '+href);
    const purchase=elements.find(n=>n.tag==='section'&&hasClass(n,'pass-buy'));
    if(!purchase||['requires printing the pass','displaying it on the vehicle dashboard','must be signed and are not transferable'].some(marker=>!textInside(html,purchase).includes(marker)))errors.push('Missing product-specific park-pass fulfilment/display scope');
    const transit=elements.filter(n=>n.tag==='article'&&elements.some(heading=>heading.tag==='h3'&&inside(heading,n)&&textInside(html,heading)==='Non-stop highway transit'));
    if(transit.length!==1||['exception for travel without stopping','Highway 1 and Highway 93 South','Icefields Parkway / 93 North and Bow Valley Parkway / 1A require park admission'].some(marker=>!textInside(html,transit[0]).includes(marker)))errors.push('Missing route-specific non-stop admission exception');
    const notices=elements.filter(n=>n.tag==='aside'&&hasClass(n,'pass-notice'));
    if(notices.length!==1||['ended September 7, 2026','regular fees from September 8','does not establish free admission for your future winter or summer trip'].some(marker=>!textInside(html,notices[0]).includes(marker)))errors.push('Missing bounded past free-admission period');
    if(/no transit (?:corridor )?exemption|everyone entering[^.]*no exceptions|youth (?:admission|aged 6[^.]*17) costs|Discovery Pass (?:always )?pays for itself in seven travel days|covers ALL Parks Canada|Kananaskis is included|Canada Strong Pass is free all winter|a phone screenshot is always accepted/i.test(facts.text)||facts.documents.some(doc=>schemaNodes(doc,'Offer').length||schemaNodes(doc,'PriceSpecification').length))errors.push('Unsupported universal park-pass admission/eligibility/offer claim');
    if(elements.some(n=>n.tag==='img'&&(hasClass(n,'page-hero-bg')||elements.some(parent=>hasClass(parent,'pass-hero')&&inside(n,parent)))))errors.push('Unverified park-pass hero identity');
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
  if(q.type==='dining-hub'){
    if(/Open\s+1\s*p\.?m\.?\s*(?:to|[–-])\s*2\s*a\.?m\.?\s+daily/i.test(facts.text))errors.push('Unsupported inherited Rose & Crown daily hours');
    const lists=facts.documents.flatMap(doc=>schemaNodes(doc,'ItemList'));
    if(lists.length!==1||!Array.isArray(lists[0].itemListElement)||lists[0].numberOfItems!==32||lists[0].itemListElement.length!==32)errors.push('Missing minimal32 dining name/card-anchor ItemList');
    else if(lists[0].itemListElement.some((item,i)=>item['@type']!=='ListItem'||item.position!==i+1||item.name!==q.dining.venues[i].name||item.url!==ORIGIN+'/eat-and-drink/#dining-'+q.dining.venues[i].slug||Object.keys(item).some(key=>!['@type','position','name','url'].includes(key))))errors.push('Dining ItemList exceeds name/operator-link scope or differs from32 local card anchors');
    const unsupportedSchema=value=>value&&typeof value==='object'&&(Object.entries(value).some(([key,child])=>['openingHours','openingHoursSpecification','priceRange','aggregateRating','review','geo','latitude','longitude','address'].includes(key)||(key==='@type'&&[child].flat().some(type=>['Restaurant','LocalBusiness','FoodEstablishment','GeoCoordinates','Place'].includes(type)))||unsupportedSchema(child)));
    if(facts.documents.some(unsupportedSchema))errors.push('Unsupported dining Restaurant/location/hours/price/rating schema');
    const section=elements.filter(n=>n.tag==='section'&&n.attributes['aria-labelledby']==='evening-guides-title');
    if(section.length!==1)errors.push('Missing unique scoped evening guide hub');
    else for(const target of q.hubLinks){const links=visibleLinks.filter(n=>inside(n,section[0])&&n.attributes.href===target.href);if(links.length!==1||!textInside(html,links[0]).includes(target.label))errors.push('Missing scoped reviewed evening handoff: '+target.href);}
    const staySections=elements.filter(n=>n.tag==='section'&&hasClass(n,'dining-stays'));
    if(staySections.length!==1||!textInside(html,staySections[0]).includes('accommodation affiliate links'))errors.push('Missing honest native hub hotel comparison');
    else for(const target of q.dining.stays){const links=visibleLinks.filter(n=>inside(n,staySections[0])&&n.attributes.href===target.href);if(links.length!==1||!textInside(html,links[0]).includes(target.label))errors.push('Missing honest native hub hotel comparison: '+target.href);}
    const offer=section[0]&&visibleLinks.find(n=>inside(n,section[0])&&n.attributes.href==='/blog/drink-deals/');
    if(!offer||!textInside(html,offer).includes('meal, admission and booking conditions'))errors.push('Missing scoped offer-condition planning handoff');
    const dining=q.dining,form=byId('dining-form')[0],finder=byId('dining-finder')[0],status=byId('dining-status')[0];
    if(!status||status.hidden||textInside(html,status)!==dining.initial.summary)errors.push('Dining default all-venues status differs');
    for(const type of ['submit','reset'])if(!form||elements.filter(n=>n.tag==='button'&&n.attributes.type===type&&inside(n,form)).length!==1)errors.push(`Missing native dining ${type} control`);
    for(const [key,options]of Object.entries(dining.options)){const select=byId(`dining-${key}`)[0],actual=select?elements.filter(n=>n.tag==='option'&&inside(n,select)):[];if(!form||!select||!inside(select,form)||actual.length!==options.length||actual.some((n,i)=>n.attributes.value!==options[i]?.[0]||textInside(html,n)!==normal(options[i]?.[1])||(i>0&&Object.hasOwn(n.attributes,'selected')))||actual[0]?.attributes.value!==dining.initial.filters[key]||elements.filter(n=>n.tag==='label'&&n.attributes.for===`dining-${key}`&&inside(n,form)).length!==1)errors.push(`Dining default/whitelist/label differs: ${key}`);}
    const groups=elements.filter(n=>n.tag==='section'&&Object.hasOwn(n.attributes,'data-dining-group'));
    if(groups.length!==4||groups.some(n=>n.hidden||!finder||!inside(n,finder)))errors.push('Missing four complete SSR dining area groups');
    const areas=['Banff','Lake Louise','Canmore','Highway 1A'];
    for(const venue of dining.venues){
      const card=elements.find(n=>n.attributes['data-dining-slug']===venue.slug);if(!card)continue;
      const group=groups[areas.indexOf(venue.area)],cardText=textInside(html,card),check=elements.filter(n=>hasClass(n,'dining-check')&&inside(n,card)),details=elements.filter(n=>n.tag==='details'&&hasClass(n,'dining-source-details')&&inside(n,card));
      if(card.attributes.id!=='dining-'+venue.slug||!group||!inside(card,group))errors.push('Dining identity/area group differs: '+venue.slug);
      if(check.length!==1||check[0].hidden||textInside(html,check[0])!==venue.sourceReview.label+' · 29 Oct 2026'||hasClass(card,'dining-card-pending')!==(venue.sourceReview.status!=='selected-facts'))errors.push('Missing dated dining status scope: '+venue.slug);
      if(details.length!==1||!textInside(html,details[0]).includes(normal(venue.serviceNote))||!textInside(html,details[0]).includes(normal(venue.journeyNote))||venue.sourceReview.sources.some(source=>!visibleLinks.some(n=>inside(n,details[0])&&n.attributes.href===source.url&&n.attributes.target==='_blank'&&(n.attributes.rel??'').split(/\s+/).includes('noopener'))))errors.push('Missing dining service/journey/primary-source detail: '+venue.slug);
      if(elements.some(n=>inside(n,card)&&(['img','iframe','embed','object'].includes(n.tag)||hasClass(n,'restaurant-price')||Object.keys(n.attributes).some(key=>/^data-(?:lat|lng|latitude|longitude|price|hours)$/.test(key)))))errors.push('Unverified dining photo/price/hours/GPS markup: '+venue.slug);
      const actions=elements.filter(n=>hasClass(n,'dining-actions')&&inside(n,card)),links=actions.length===1?visibleLinks.filter(n=>inside(n,actions[0])):[],urls=[...new Set([venue.website,venue.menuUrl,venue.reserveUrl,...venue.enquiryLinks.map(l=>l.url)].filter(Boolean))];
      if(actions.length!==1||links.length!==urls.length||new Set(links.map(n=>n.attributes.href)).size!==urls.length||urls.some(url=>!links.some(n=>n.attributes.href===url&&n.attributes.target==='_blank'&&(n.attributes.rel??'').split(/\s+/).includes('noopener')&&!(n.attributes.rel??'').split(/\s+/).includes('sponsored'))))errors.push('Dining native deduplicated operator/menu/booking links differ: '+venue.slug);
      if(venue.address&&!cardText.includes(normal(venue.address)))errors.push('Missing selected dining address: '+venue.slug);
      if(venue.phone&&!visibleLinks.some(n=>inside(n,card)&&n.attributes.href==='tel:'+venue.phone.replace(/[^+\d]/g,'')))errors.push('Missing selected dining phone: '+venue.slug);
      for(const notice of venue.notices){const notices=elements.filter(n=>n.tag==='aside'&&hasClass(n,'dining-notice')&&!n.hidden&&inside(n,card)&&textInside(html,n).includes(normal(notice.label))&&textInside(html,n).includes(normal(notice.text)));if(notices.length!==1||details.some(n=>inside(notices[0],n))||actions.length!==1||notices[0].start>actions[0].start||!visibleLinks.some(n=>inside(n,notices[0])&&n.attributes.href===notice.url))errors.push('Missing prominent sourced dining notice: '+venue.slug);}
      if(venue.slug==='lake-louise-station'&&(links.some(n=>/book|reserv|menu/i.test(textInside(html,n)))||!links.some(n=>textInside(html,n).includes('Reopening updates'))))errors.push('Station closure incorrectly promoted as active meal reservation');
    }
    // Selected publisher facts and two pending identities remain bounded;
    // the directory does not certify live service, suitability or availability.
    const scoped=[...section,...staySections,...(finder?[finder]:[])].map(n=>textInside(html,n)).join(' ');
    if(/free (?:dining|drinks?|meals?|shuttle)|(?:meal|dining|drinks?) vouchers?|guaranteed (?:savings|discounts|tables)|every (?:bar|restaurant) (?:offers|has)|happy hour (?:runs|is) (?:from )?3[–-]6|(?:hotel|room) bookings? include (?:dining|drinks?|meals?)/i.test(scoped))errors.push('Unsupported hub offer/booking promise');
  }
  if(q.type==='parkway'){
    const plan=q.parkway,form=byId('parkway-form')[0],container=byId('parkway-stops')[0];
    if(!elements.some(n=>hasClass(n,'filter-note')&&!n.hidden&&textInside(html,n).includes('Changing visit type keeps your shortlist')&&textInside(html,n).includes('Changing season removes choices outside that seasonal comparison')))errors.push('Missing Parkway filter/selection scope explanation');
    for(const type of ['submit','reset'])if(!form||elements.filter(n=>n.tag==='button'&&n.attributes.type===type&&inside(n,form)).length!==1)errors.push(`Missing native Parkway ${type} control`);
    for(const [key,options]of Object.entries(plan.options)){
      const select=byId(`parkway-${key}`)[0],actual=select?elements.filter(n=>n.tag==='option'&&inside(n,select)):[];
      if(!form||!select||!inside(select,form)||actual.length!==options.length||actual.some((n,i)=>n.attributes.value!==options[i]?.[0]||textInside(html,n)!==normal(options[i]?.[1])||(i>0&&Object.hasOwn(n.attributes,'selected')))||actual[0]?.attributes.value!==plan.initial.filters[key]||elements.filter(n=>n.tag==='label'&&n.attributes.for===`parkway-${key}`&&inside(n,form)).length!==1)errors.push(`Parkway select/default/label differs: ${key}`);
    }
    const choices=elements.filter(n=>Object.hasOwn(n.attributes,'data-parkway-choice')),inputs=elements.filter(n=>Object.hasOwn(n.attributes,'data-parkway-select'));
    if(choices.length!==12||inputs.length!==12)errors.push('Parkway needs twelve progressive unselected optional choices');
    for(const stop of plan.stops){
      const card=elements.find(n=>n.attributes['data-parkway-id']===stop.id);if(!card||!container||!inside(card,container))errors.push('Parkway card outside documented stop container: '+stop.id);
      if(!card)continue;
      const distances=elements.filter(n=>Object.hasOwn(n.attributes,'data-parkway-distance')&&inside(n,card));
      if(distances.length!==1||distances[0].hidden||textInside(html,distances[0])!==`About ${stop.fromLouiseKm} km from Lake Louise village`)errors.push('Parkway default map-distance text differs: '+stop.id);
      const winter=elements.filter(n=>Object.hasOwn(n.attributes,'data-parkway-season-note')&&inside(n,card)),summer=elements.filter(n=>n.tag==='details'&&inside(n,card));
      if(winter.length!==1||textInside(html,winter[0])!==normal(stop.winter)||summer.length!==1||!textInside(html,summer[0]).includes(normal(stop.summer))||!textInside(html,summer[0]).includes('Summer planning notes'))errors.push('Missing full SSR seasonal Parkway notes: '+stop.id);
      const labels=choices.filter(n=>inside(n,card)),selects=inputs.filter(n=>inside(n,card));
      if(stop.kind==='endpoint'){if(labels.length||selects.length)errors.push('Parkway endpoint incorrectly offered as optional stop: '+stop.id);}
      else if(labels.length!==1||labels[0].tag!=='label'||!Object.hasOwn(labels[0].attributes,'hidden')||selects.length!==1||selects[0].tag!=='input'||selects[0].attributes.type!=='checkbox'||selects[0].attributes.value!==stop.id||Object.hasOwn(selects[0].attributes,'checked')||!inside(selects[0],labels[0]))errors.push('Parkway optional choice is missing/visible/preselected: '+stop.id);
    }
    const origin=byId('parkway-origin')[0],notes=byId('parkway-notes')[0],shortlist=byId('parkway-shortlist')[0],items=shortlist?elements.filter(n=>n.tag==='li'&&inside(n,shortlist)):[];
    const status=byId('parkway-status')[0];if(!status||status.hidden||textInside(html,status)!=='14 places documented · no optional stops selected')errors.push('Incorrect default Parkway documented/selected count');
    if(!origin||textInside(html,origin)!==`Route order: ${plan.initial.direction}. Approximate map distances from ${plan.initial.origin}.`)errors.push('Incorrect default Parkway order/origin');
    if(!notes||plan.initial.notes.some(note=>!textInside(html,notes).includes(normal(note))))errors.push('Missing Parkway seasonal/source scope');
    if(items.length!==1||textInside(html,items[0])!=='No optional stops selected. Read the cards and choose a few places to investigate.')errors.push('Parkway default shortlist is not empty');
    const ready=byId('parkway-checklist')[0],checks=ready?elements.filter(n=>n.tag==='li'&&inside(n,ready)):[];
    if(checks.length!==3||checks.some((n,i)=>textInside(html,n)!==normal(plan.initial.checklist[i])))errors.push('Missing complete three Parkway journey checks');
    const car=visibleLinks.filter(n=>hasClass(n,'car-cta-btn')&&n.attributes.href===plan.carHref);
    if(car.length!==1||car[0].attributes.target!=='_blank'||!['noopener','sponsored'].every(rel=>(car[0].attributes.rel??'').split(/\s+/).includes(rel))||!textInside(html,car[0]).includes('Search Car Rentals on Expedia')||!facts.text.includes('commission'))errors.push('Missing honest native KB6G4xt car referral/disclosure');
    if(elements.some(n=>n.attributes.id==='total-time'||Object.hasOwn(n.attributes,'data-stop-min'))||/\b(?:2\.5[–-]3|6[–-]9) hours|Parker Ridge is the must-do|winter tires are legally required October 1|gas is essential|fuel is guaranteed|guaranteed fuel is available|complete the drive in \d/i.test(facts.text))errors.push('Unsupported Parkway fixed ETA/fuel/route prescription');
    if(!elements.some(n=>n.tag==='img'&&hasClass(n,'page-hero-bg')&&/Illustrative.*not verified/i.test(n.attributes.alt??''))||!elements.some(n=>hasClass(n,'image-note')&&!n.hidden&&/Illustrative.*not a verified/i.test(textInside(html,n))))errors.push('Missing illustrative Parkway hero qualification');
  }
  return result;
}

const consentFixture='<footer><a href="/privacy">Privacy Policy</a><button type="button" data-open-consent>Privacy choices</button></footer><div id="cookie-banner" role="dialog" aria-describedby="cookie-description" hidden><p id="cookie-description">Choose optional services.</p><button type="button" id="cookie-accept">Accept all</button><button type="button" id="cookie-reject">Reject optional</button><button type="button" id="cookie-manage">Manage preferences</button><div id="cookie-preferences" hidden><input type="checkbox" id="pref-analytics"><input type="checkbox" id="pref-advertising"><input type="checkbox" id="pref-affiliate"><button type="button" id="cookie-save">Save preferences</button></div><p id="cookie-storage-status"></p><button type="button" id="cookie-close" hidden>Close choices</button></div><noscript><p>Optional analytics, advertising and booking widgets are off when JavaScript is disabled. Ordinary booking links remain available.</p></noscript>';
function parkwayFixture(q){
  const p=q.parkway;
  return `<img class="page-hero-bg" alt="Illustrative road; not verified as this route"><p class="image-note">Illustrative image; not a verified view.</p><form id="parkway-form" hidden>${Object.entries(p.options).map(([key,options])=>`<label for="parkway-${key}">${key}</label><select id="parkway-${key}">${options.map(([value,label])=>`<option value="${value}">${esc(label)}</option>`).join('')}</select>`).join('')}<button type="submit">Build</button><button type="reset">Reset</button></form><p id="parkway-status" role="status" aria-live="polite">14 places documented · no optional stops selected</p><p id="parkway-origin">Route order: ${esc(p.initial.direction)}. Approximate map distances from ${p.initial.origin}.</p><div id="parkway-notes">${p.initial.notes.map(n=>`<p>${esc(n)}</p>`).join('')}</div><ul id="parkway-shortlist"><li>No optional stops selected. Read the cards and choose a few places to investigate.</li></ul><button id="parkway-copy" type="button" hidden>Copy</button><p id="parkway-copy-status" role="status" aria-live="polite"></p><div id="parkway-copy-fallback" hidden><textarea id="parkway-brief" readonly></textarea></div><div id="parkway-stops">${p.stops.map(s=>`<article data-parkway-id="${s.id}"><span data-parkway-distance>About ${s.fromLouiseKm} km from Lake Louise village</span><h3>${esc(s.name)}</h3><p>${esc(s.idea)}</p><p data-parkway-season-note>${esc(s.winter)}</p><details><summary>Summer planning notes</summary><p>${esc(s.summer)}</p></details><a href="${esc(s.href)}">${esc(s.linkLabel)}</a>${s.kind==='endpoint'?'':`<label data-parkway-choice hidden><input type="checkbox" data-parkway-select value="${s.id}">Add</label>`}</article>`).join('')}</div><ol id="parkway-checklist">${p.initial.checklist.map(n=>`<li>${esc(n)}</li>`).join('')}</ol><a class="car-cta-btn" href="${p.carHref}" target="_blank" rel="noopener sponsored">Search Car Rentals on Expedia →</a><p>BanffBound may earn a commission.</p>`;
}
function diningFixture(q){
  const d=q.dining,link=(href,label)=>`<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`;
  const cards=area=>d.venues.filter(v=>v.area===area).map(v=>{
    const actions=[...new Set([v.website,v.menuUrl,v.reserveUrl,...v.enquiryLinks.map(l=>l.url)].filter(Boolean))];
    return `<article id="dining-${v.slug}" data-dining-slug="${v.slug}" class="dining-card${v.sourceReview.status==='selected-facts'?'':' dining-card-pending'}"><span class="dining-check">${esc(v.sourceReview.label)} · 29 Oct 2026</span><h3>${esc(v.name)}</h3><p>${esc(v.description)}</p>${v.notices.map(n=>`<aside class="dining-notice"><strong>${esc(n.label)}</strong><p>${esc(n.text)}</p>${link(n.url,'Check the publisher’s notice')}</aside>`).join('')}${v.address?`<p>${esc(v.address)}</p>`:''}${v.phone?`<a href="tel:${v.phone.replace(/[^+\d]/g,'')}">Call ${esc(v.phone)}</a>`:''}<div class="dining-actions">${actions.map(href=>link(href,v.slug==='lake-louise-station'?'Reopening updates':'Venue details')).join('')}</div><details class="dining-source-details"><summary>Visit checks &amp; sources</summary><p>${esc(v.serviceNote)}</p><p>${esc(v.journeyNote)}</p>${v.sourceReview.sources.map(s=>link(s.url,s.label)).join('')}</details></article>`;
  }).join('');
  return `<section aria-labelledby="evening-guides-title"><h2 id="evening-guides-title">Give your evening a shape</h2>${q.hubLinks.map(l=>`<a href="${esc(l.href)}">${esc(l.label)} →${l.href==='/blog/drink-deals/'?' Check the meal, admission and booking conditions behind an offer headline.':''}</a>`).join('')}</section><section id="dining-finder"><form id="dining-form" hidden>${Object.entries(d.options).map(([key,options])=>`<label for="dining-${key}">${key}</label><select id="dining-${key}">${options.map(([value,label])=>`<option value="${value}">${esc(label)}</option>`).join('')}</select>`).join('')}<button type="submit">Show places</button><button type="reset">Show all</button></form><p id="dining-status" role="status" aria-live="polite">${d.initial.summary}</p><div id="dining-empty" hidden>No entries match those choices.</div>${['Banff','Lake Louise','Canmore','Highway 1A'].map(area=>`<section data-dining-group><h2>${area}</h2>${cards(area)}</section>`).join('')}</section><section class="dining-stays"><p>These stay comparisons contain accommodation affiliate links.</p>${d.stays.map(s=>`<a href="${s.href}">${s.label} →</a>`).join('')}</section>`;
}
function fixture(check){
  const q=check.quality;if(q.ssrHtml)return `<html><head><link rel="canonical" href="${ORIGIN+check.path}"></head><body>${q.ssrHtml}${consentFixture}</body></html>`;let body=`<h1>${esc(check.name)}</h1>`;const schemas=[];
  if(q.type!=='full'){
  for(const marker of Object.values(check.markers??{}))body+=`<p>${esc(marker)}</p>`;
  if(q.type==='dining-hub'){
    schemas.push({'@context':'https://schema.org','@type':'ItemList',numberOfItems:q.dining.venues.length,itemListElement:q.dining.venues.map((v,i)=>({'@type':'ListItem',position:i+1,name:v.name,url:ORIGIN+'/eat-and-drink/#dining-'+v.slug}))});
    body+=diningFixture(q);
  }
  else for(const href of check.links??[])body+=`<a href="${esc(href)}">Source or journey</a>`;
  if(check.faqs){schemas.push({'@context':'https://schema.org','@type':'FAQPage',mainEntity:check.faqs.map(f=>({'@type':'Question',name:f.question,acceptedAnswer:{'@type':'Answer',text:f.answer}}))});body+=check.faqs.map(f=>`<details><summary>${esc(f.question)}</summary><p>${esc(f.answer)}</p></details>`).join('');}
  }
  if(q.type==='partial'||q.type==='full'){
    schemas.push({'@context':'https://schema.org','@type':'Article',headline:check.name,description:q.description,datePublished:isoDate(q.published),dateModified:isoDate(q.corrected)});
    body+=`<time datetime="${isoDate(q.published)}">Published</time><time datetime="${isoDate(q.corrected)}">Corrected</time>`;
    if(q.type==='full')body+=`<img class="article-hero-img" alt="Illustrative image; not verified as this place"><p class="article-image-note">${esc(q.imageNote)}</p>`;
    body+=`<div class="article-body"${q.bookingContext?' data-curated-booking="true"':''}>${q.type==='full'?q.bodyHtml:q.openingHtml}</div>`;
  }
  if(q.type==='context')body+='<div class="article-body" data-curated-booking="true"><p>Existing Jasper destination guide.</p></div>';
  if(['partial','full','context'].includes(q.type)){
    const context=q.bookingContext;
    for(const kind of check.affiliateKinds){const href=context?(kind==='gyg-auto'?context.tourHref:context.hotelHref):(kind==='gyg-auto'?'https://www.getyourguide.com/banff-l284/?partner_id=QW960HO':'https://www.expedia.ca/Hotel-Search?camref=1101l3MtWX');const label=context?(kind==='gyg-auto'?`Browse ${context.tourLabel} activity results on GetYourGuide — affiliate link`:`Compare ${context.hotelLabel} stays on Expedia — affiliate link`):'Native referral';body+=`<div data-affiliate-embed="${kind}"><p data-affiliate-status role="status" aria-live="polite">Optional partner content is off.</p><button type="button" data-open-consent>Privacy choices</button><div data-affiliate-mount hidden></div><a href="${esc(href)}" target="_blank" rel="noopener sponsored">${esc(label)}</a></div>`;}
  }
  if(q.type==='parkway')body+=parkwayFixture(q)+`<time datetime="2026-10-29">29 October 2026</time>`;
  if(q.type==='parkway')body+='<p class="filter-note">Changing visit type keeps your shortlist. Changing season removes choices outside that seasonal comparison.</p>';
  if(!['full','parkway','dining-hub'].includes(q.type)){
  for(const spec of q.controls??[]){const a=Object.entries(spec.attributes).map(([k,v])=>v===true?k:`${k}="${esc(v)}"`).join(' ');let inner='';if(q.checklist?.id===spec.id)inner=Array.from({length:q.checklist.count},()=>'<li><input type="checkbox"></li>').join('');if(spec.id==='ski-day-timeline')inner=Array.from({length:q.timelineCount},()=>'<li>Timeline step</li>').join('');body+=`<${spec.tag} id="${spec.id}" ${a}>${inner}${['input'].includes(spec.tag)?'':`</${spec.tag}>`}`;}
  if(q.cards)for(const item of q.cards.items)body+=`<article ${q.cards.attribute}="${item.id}">${item.text.map(t=>`<p>${esc(t)}</p>`).join('')}<a ${q.cards.linkAttribute??''} href="${esc(item.href)}">Native detail</a></article>`;
  if(q.boundaryLocationOnly)body+='<p data-source-scope="location-only">Boundary unit facilities are not included</p>';
  for(const [id,href]of q.operatorLinks??[])body+=`<a id="${id}" href="${esc(href)}">Operator</a>`;
  if(q.type==='town-index'){body+=Array.from({length:q.townCount},()=>'<article class="town-card">Town</article>').join('');for(const value of q.townPriorities)body+=`<button type="button" data-priority="${value}" aria-pressed="${value==='all'?'true':'false'}">Priority</button>`;}
  for(const spec of q.taggedLinks??[])body+=`<a ${spec.attribute} href="${esc(spec.href)}"${spec.external?' target="_blank" rel="noopener"':''}>Journey</a>`;
  if(q.searchUrl)body+=`<a href="${esc(q.searchUrl)}" rel="sponsored">Search ${esc(check.name)} stays on Expedia</a>`;
  }
  if(check.modifiedDate&&!['partial','full'].includes(q.type))body+=`<time datetime="${isoDate(check.modifiedDate)}">Updated ${check.modifiedDate}</time>`;
  if(q.type==='town')body=`<div class="guide-content">${body}</div>`;
  return `<html><head><link rel="canonical" href="${ORIGIN+check.path}">${schemas.map(s=>`<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('')}</head><body>${body}${consentFixture}</body></html>`;
}
export async function selfTest(){
  await foundationSelfTest();const inventory=await loadGuideInventory();
  const supplements=inventory.checks.filter(c=>c.quality);assert.equal(supplements.length,51);
  for(const check of supplements){const html=fixture(check),sitemap=new Set([ORIGIN+check.path]);assert.deepEqual(analyseGuideHtml(html,check,sitemap).errors,[],check.path+': complete supplement fixture');
    assert.ok(analyseGuideHtml(html.replace('rel="canonical"','rel="alternate"'),check,sitemap).errors.length,check.path+': canonical negative');
    assert.ok(analyseGuideHtml(html.replace('</body>','<script src="https://widget.getyourguide.com/sdk.js"></script></body>'),check,sitemap).errors.some(e=>e.includes('Active pre-consent')));
    if(check.quality.type==='partial'){
      assert.ok(analyseGuideHtml(html.replace(PARTIAL_LABEL,'Full guide reviewed:'),check,sitemap).errors.some(e=>e.includes('partialCorrection')));
      assert.ok(analyseGuideHtml(html.replace('"datePublished":"'+isoDate(check.publishedDate)+'"','"datePublished":"2026-10-29T00:00:00.000Z"'),check,sitemap).errors.some(e=>e.includes('Original publication')));
      assert.ok(analyseGuideHtml(html.replace(check.quality.openingHtml,'<p>Unrepaired or missing introduction.</p>'),check,sitemap).errors.some(e=>e.includes('opening paragraph')));
      const bad=check.quality.openingHtml.replace('<a ','<a href="/blog/other/"><a ').replace('</a>','</a></a>');assert.ok(analyseGuideHtml(html.replace(check.quality.openingHtml,bad),check,sitemap).errors.some(e=>e.includes('Nested anchor')));
    }
    if(check.quality.type==='full'){
      assert.ok(analyseGuideHtml(html.replace('"datePublished":"'+isoDate(check.publishedDate)+'"','"datePublished":"2026-10-29T00:00:00.000Z"'),check,sitemap).errors.some(e=>e.includes('publication schema')));
      assert.ok(analyseGuideHtml(html.replace('"@type":"Article"','"@type":"Article","image":"https://example.com/unverified.jpg"'),check,sitemap).errors.some(e=>e.includes('photographic identity')));
      assert.ok(analyseGuideHtml(html.replace('class="article-image-note"','class="missing-image-note"'),check,sitemap).errors.some(e=>e.includes('illustrative hero scope')));
      assert.ok(analyseGuideHtml(html.replace('</body>',`<p>${PARTIAL_LABEL}</p></body>`),check,sitemap).errors.some(e=>e.includes('incorrectly labelled')));
      assert.ok(analyseGuideHtml(html.replace('"@type":"FAQPage"','"@type":"WebPage"'),check,sitemap).errors.some(e=>e.includes('FAQ schema count')));
      const badClaim=check.quality.slug.startsWith('num')?'The frozen lake becomes a natural skating rink.':check.quality.slug.startsWith('jasper')?'The Maligne Canyon trail offers year-round access.':check.quality.slug==='banff-cabin-rentals'?'Each cabin has a full kitchen.':({'banff-nightlife-guide':'Dancing Sasquatch is the current dance venue.','banff-live-music':'Every Banff Centre performance is suitable for children.','drink-deals':'Sky Bistro includes gondola admission.','icefields-parkway-guide':'Fuel is available at Crossing in winter.','banff-to-jasper-drive':'Maligne Canyon is open for winter.','lake-minnewanka-guide':'Minnewanka is open for ice fishing.','banff-gondola-guide':'The boardwalk is fully accessible.','banff-gondola-tickets-guide':'Sky Bistro reservations include gondola admission.','banff-spring-skiing':'Delirium Dive is suitable for beginners.','peyto-lake-guide':'The upper parking lot is open to all vehicles.','banff-helicopter-tours':'Rockies Heli is based in Kananaskis Village.','kananaskis-heli-tours':'Stoney Nakoda operates all winter 2026/27.','golden-bc-day-trip':'Takakkaw Falls road is open all winter.','banff-heli-skiing':'CMH Purcell includes transport.','skoki-lodge-guide':'The approach is safe for beginners.','banff-trip-cost-budget-guide':'Canmore is always cheaper.','fall-larch-season-banff':'The peak is guaranteed on September 25.','banff-in-fall':'Upper Hot Springs is open throughout October 2026.','larch-valley-hike':'The hike is8.6 km return.','sentinel-pass-hike':'Sentinel is the highest maintained trail in the Rockies.'}[check.quality.slug]??'All six restaurants opened in 2026.');
      assert.ok(analyseGuideHtml(html.replace(/class="article-body"[^>]*>/,tag=>tag+`<p>${badClaim}</p>`),check,sitemap).errors.some(e=>e.includes('Unsupported inherited/current claim')));
      if(NEW_FULL_SLUGS.includes(check.quality.slug)){
        const all=htmlElements(html),body=all.find(n=>hasClass(n,'article-body'));
        for(const section of check.quality.sections){
          const heading=all.find(n=>n.tag==='h2'&&n.attributes.id===section.id&&inside(n,body)),next=all.find(n=>n.tag==='h2'&&n.start>heading.end&&inside(n,body)),end=next?.start??body.innerEnd,original=html.slice(heading.end,end),marker=section.markers[0];
          assert.ok(original.includes(marker),'New contract negative changes actual body section, not FAQ: '+check.quality.slug+'/'+section.id);
          const changed=html.slice(0,heading.end)+original.replaceAll(marker,'Changed source boundary')+html.slice(end);
          assert.ok(analyseGuideHtml(changed,check,sitemap).errors.some(e=>e.includes('reviewed access/season/base requirements')),'FAQ cannot mask changed body scope: '+check.quality.slug+'/'+section.id);
        }
        const native=all.find(n=>n.tag==='a'&&inside(n,body)&&n.attributes.href===check.quality.nativeReferrals[0]);assert.ok(native);
        const open=html.slice(native.start,native.openEnd),wrong=html.slice(0,native.start)+open.replace(/href=("[^"]*"|'[^']*')/,'href="https://example.invalid/wrong-destination"')+html.slice(native.openEnd);
        assert.ok(analyseGuideHtml(wrong,check,sitemap).errors.some(e=>e.includes('authored native search/referral')),'Authored native destination cannot be replaced by a footer/search fallback.');
        const sourceSection=check.quality.sections.find(section=>section.links.length),sourceHeading=all.find(n=>n.tag==='h2'&&n.attributes.id===sourceSection.id),sourceNext=all.find(n=>n.tag==='h2'&&n.start>sourceHeading.end&&inside(n,body)),sourceEnd=sourceNext?.start??body.innerEnd,sourceBounds={openEnd:sourceHeading.end,innerEnd:sourceEnd},source=all.find(n=>n.tag==='a'&&inside(n,sourceBounds)&&n.attributes.href===sourceSection.links[0]);assert.ok(source);
        const sourceOpen=html.slice(source.start,source.openEnd),wrongSource=html.slice(0,source.start)+sourceOpen.replace(/href=("[^"]*"|'[^']*')/,'href="https://example.invalid/wrong-source"')+html.slice(source.openEnd);
        assert.ok(analyseGuideHtml(wrongSource,check,sitemap).errors.some(e=>e.includes('reviewed access/season/base requirements')),'A source elsewhere cannot mask a wrong scoped source.');
        if(check.quality.budgetGuide){
          const extra='<details><summary>Quote notes</summary><p>Keep your own current quote notes.</p></details>';
          const withExtra=html.replace('</div><div data-affiliate-embed',extra+'</div><div data-affiliate-embed');assert.notEqual(withExtra,html);assert.deepEqual(analyseGuideHtml(withExtra,check,sitemap).errors,[],'FAQ arrays remain independent of unrelated non-FAQ details.');
          const legacy='<a href="https://www.getyourguide.com/banff-l284/banff-gondola-admission-ticket-t556595/?partner_id=QW960HO" rel="noopener sponsored">Older route</a>';
          assert.ok(analyseGuideHtml(html.replace(/class="article-body"[^>]*>/,tag=>tag+legacy),check,sitemap).errors.some(e=>e.includes('legacy budget marketplace')),'Archived unverified product is not a public offer.');
        }
      }
      if(check.quality.slug.startsWith('num'))assert.ok(analyseGuideHtml(html.replaceAll('as prohibited','as permitted'),check,sitemap).errors.length,'Bow Lake permission reversal must fail.');
      if(check.quality.slug==='jasper-canada')assert.ok(analyseGuideHtml(html.replace('/blog/jasper-national-park/#park-recovery','/wrong-source/'),check,sitemap).errors.some(e=>e.includes('source/photo link')),'HTML-bearing FAQ retains its native source link.');
      if(check.quality.cabinNative)assert.ok(analyseGuideHtml(html.replace('camref=1101l3MtWX','camref=wrong'),check,sitemap).errors.some(e=>e.includes('merchant/operator contract')));
      if(check.quality.slug==='drink-deals'){
        assert.ok(html.includes('50% off local beer'),'Legitimate dated selected-item percentage remains in positive fixture.');
        for(const [before,after]of [['2–5 p.m.','3–6 p.m.'],['9–11 p.m.','10–12 p.m.'],['Summit Hours from 3–5 p.m.','Summit Hours from 4–6 p.m.'],['50% off local beer, house wine and selected shareable plates','50% off the entire menu'],['not available on holidays or long weekends','available on every holiday'],['book Banff Gondola admission separately','gondola admission is included']])assert.ok(analyseGuideHtml(html.replaceAll(before,after),check,sitemap).errors.length,'Dated offer/eligibility/admission reversal must fail: '+before);
      }
      if(check.quality.evening){
        assert.ok(analyseGuideHtml(html.replace('value="banff"','value="wrong-base"'),check,sitemap).errors.some(e=>e.includes('Evening default/whitelist')));
        assert.ok(analyseGuideHtml(html.replace('type="reset" class="evening-reset"','type="button" class="evening-reset"'),check,sitemap).errors.some(e=>e.includes('native evening reset')));
        assert.ok(analyseGuideHtml(html.replace(check.quality.evening.steps[0],'Incomplete evening planning step.'),check,sitemap).errors.some(e=>e.includes('default evening return steps')));
        assert.ok(analyseGuideHtml(html.replace('id="evening-journey-link" href="'+esc(check.quality.evening.journey.href)+'"','id="evening-journey-link" href="https://example.com/wrong"'),check,sitemap).errors.some(e=>e.includes('native default Banff evening journey')));
        assert.ok(analyseGuideHtml(html.replaceAll('no minors are allowed after 10pm','no minors are allowed after 11pm'),check,sitemap).errors.length,'Current minors cutoff reversal must fail.');
      }
      if(['icefields-parkway-guide','banff-to-jasper-drive'].includes(check.quality.slug)){
        assert.ok(analyseGuideHtml(html.replaceAll('November 1–March 31','October 1–April 30'),check,sitemap).errors.length,'93N legal date reversal must fail.');
        assert.ok(analyseGuideHtml(html.replaceAll('all services are closed for winter','all services are open for winter'),check,sitemap).errors.length,'Winter service reversal must fail.');
      }
      if(check.quality.slug==='icefields-parkway-guide')assert.ok(analyseGuideHtml(html.replaceAll('36 km north of the junction','17 km north of the junction'),check,sitemap).errors.length,'Junction-origin route distance regression.');
      if(check.quality.slug==='lake-minnewanka-guide'){
        assert.ok(analyseGuideHtml(html.replaceAll('Personal canoes, kayaks, paddleboards and large inflatables are prohibited.','Personal canoes, kayaks, paddleboards and large inflatables are permitted.'),check,sitemap).errors.length,'Personal craft restriction reversal.');
        assert.ok(analyseGuideHtml(html.replaceAll('May 16–September 7, 2026','November 1–March 31, 2026'),check,sitemap).errors.length,'Closed fishing season cannot become winter fishing.');
      }
      if(check.quality.gondolaProduct){
        assert.ok(analyseGuideHtml(html.replace(`href="${esc(check.quality.gondolaProduct.href)}"`,`href="${esc(check.quality.gondolaProduct.href.replace('partner_id=QW960HO','partner_id=wrong'))}"`),check,sitemap).errors.some(e=>e.includes('native Gondola product/affiliate')));
        assert.ok(analyseGuideHtml(html.replaceAll('368 shallow stairs each way','no stairs'),check,sitemap).errors.length,'Physical access regression.');
        assert.ok(analyseGuideHtml(html.replaceAll('non-refundable','fully refundable'),check,sitemap).errors.length,'Product-specific cancellation regression.');
      }
      for(const section of check.quality.sections??[]){
        const elements=htmlElements(html),heading=elements.find(n=>n.tag==='h2'&&n.attributes.id===section.id),next=elements.find(n=>n.tag==='h2'&&n.start>heading.end),end=next?.start??html.length;
        const fragment=html.slice(heading.end,end),broken=html.slice(0,heading.end)+fragment.replaceAll(esc(section.markers[0]),'Missing reviewed requirement')+html.slice(end);
        assert.ok(analyseGuideHtml(broken,check,sitemap).errors.some(e=>e.includes('reviewed access/season/base requirements')),'FAQ text cannot mask a removed body-section rule: '+section.id);
        const source=section.links?.[0];if(source){const wrong=html.slice(0,heading.end)+fragment.replaceAll(`href="${esc(source)}"`,'href="https://example.com/wrong-source"')+html.slice(end);assert.ok(analyseGuideHtml(wrong,check,sitemap).errors.some(e=>e.includes('reviewed access/season/base requirements')),'Section keeps its actual primary source: '+section.id);}
      }
      if(check.quality.slug==='banff-spring-skiing'){
        for(const rule of ['457 kHz avalanche transceiver switched on and transmitting','avalanche shovel and probe in a suitable backpack','similarly equipped partner','current Freeride Zone status'])assert.ok(analyseGuideHtml(html.replaceAll(rule,'missing requirement'),check,sitemap).errors.some(e=>e.includes('reviewed access/season/base requirements')),'Each separate freeride gate is retained.');
        assert.ok(analyseGuideHtml(html.replaceAll('not established here.','guaranteed here.'),check,sitemap).errors.length,'Unconfirmed spring operation cannot become guaranteed.');
      }
      if(check.quality.slug==='peyto-lake-guide'){
        assert.ok(analyseGuideHtml(html.replaceAll('accessible vehicles and buses','all private vehicles'),check,sitemap).errors.some(e=>e.includes('reviewed access/season/base requirements')),'Restricted accessible approach.');
        assert.ok(analyseGuideHtml(html.replaceAll('310 m ascent','95 m ascent'),check,sitemap).errors.length,'Correct full Bow Summit profile.');
      }
      if(check.quality.slug==='banff-helicopter-tours')assert.ok(analyseGuideHtml(html.replaceAll('past-season information and does not confirm the','past-season information confirms the'),check,sitemap).errors.some(e=>e.includes('reviewed access/season/base requirements')),'Past-season notice cannot establish current winter flights.');
      if(check.quality.slug==='kananaskis-heli-tours')assert.ok(analyseGuideHtml(html.replaceAll('does not establish whether Stoney Nakoda is operating on a particular','confirms Stoney Nakoda is operating on every'),check,sitemap).errors.some(e=>e.includes('reviewed access/season/base requirements')),'Future date availability must remain unconfirmed.');
      if(check.quality.slug==='golden-bc-day-trip'){
        for(const [from,to]of [['confirms no future opening day','guarantees the next opening day'],['May 7–October 12, 2027','January 7–October 12, 2027'],['expects previous powder experience','accepts every first-time skier'],['new season’s stops and last return','a timeless timetable'],['limited daylight and driver fatigue','unlimited evening time']])assert.ok(analyseGuideHtml(html.replaceAll(from,to),check,sitemap).errors.some(e=>e.includes('reviewed access/season/base requirements')),'Golden seasonal/ability/return boundary: '+from);
        for(const claim of ['Return to Banff by 7pm.','Book a morning gondola ride and summit hike, then a 1pm rafting trip.','Half-day trips are suitable for beginners and families.','Golden Skybridge is open all winter.','Kicking Horse is a SkiBig3 resort.'])assert.ok(analyseGuideHtml(html.replace(/class="article-body"[^>]*>/,tag=>tag+`<p>${claim}</p>`),check,sitemap).errors.some(e=>e.includes('Unsupported inherited/current claim')),'Golden former forced itinerary/identity claim: '+claim);
      }
      if(check.quality.heli){
        const heli=check.quality.heli;
        assert.ok(analyseGuideHtml(html.replace('value="banff"','value="wrong-base"'),check,sitemap).errors.some(e=>e.includes('Heli default/whitelist/label')));
        assert.ok(analyseGuideHtml(html.replace('<button type="reset">Reset choices</button>','<button type="button">Reset choices</button>'),check,sitemap).errors.some(e=>e.includes('native heli reset')));
        assert.ok(analyseGuideHtml(html.replace(esc(heli.initial.steps[0]),'Incomplete journey step'),check,sitemap).errors.some(e=>e.includes('default heli journey confirmations')));
        assert.ok(analyseGuideHtml(html.replace('class="heli-ski-action"','class="missing-action"'),check,sitemap).errors.some(e=>e.includes('native non-affiliate heli enquiry')));
        for(const [from,to]of [['438 Lafontaine Road, Golden, BC','Kicking Horse gondola base'],['2045 Greywolf Drive, Panorama, BC','Banff town'],['minimum of 5 guests overall','minimum of 1 guest'],['The Purcell page conflicts on meals','Purcell always includes every meal'],['Bring your own ski or snowboard boots.','Boots are supplied to everyone.'],['transport charges are not refunded','transport charges are refunded'],['2025/26 booking and season information','confirmed current winter departures']])assert.ok(analyseGuideHtml(html.replaceAll(from,to),check,sitemap).errors.length,'Heli base/transfer/food/equipment/season clause: '+from);
        assert.ok(analyseGuideHtml(html.replace('class="heli-ski-cat"','class="missing-cat-boundary"'),check,sitemap).errors.some(e=>e.includes('cat-ski season/base/approval')));
        const rk=htmlElements(html).find(n=>n.attributes['data-heli-operator']==='rk'),rkSection=html.slice(rk.start,rk.end),wrongSource=html.slice(0,rk.start)+rkSection.replace(`href="${heli.sources.rkTransfer}"`,'href="https://example.com/wrong-transfer"')+html.slice(rk.end);
        assert.ok(analyseGuideHtml(wrongSource,check,sitemap).errors.some(e=>e.includes('heli primary section source')),'RK transfer source stays in RK card.');
      }
      if(check.quality.slug==='skoki-lodge-guide'){
        for(const [from,to]of [['11 km from the arranged upper trailhead','11 km from Fish Creek parking'],['not the summer Fish Creek shuttle process','the same process all year'],['transceiver, shovel and probe','a mobile phone'],['warning, not an asserted closure','closure until further notice'],['credit or deferral','automatic cash refunds'],['December 18, 2026–April 5, 2027','December 1, 2026–May 5, 2027']])assert.ok(analyseGuideHtml(html.replaceAll(from,to),check,sitemap).errors.length,'Skoki start/season/ability/notice/terms boundary: '+from);
        for(const claim of ['A guide is included.','Pack delivery is included.','Weather cancellations are always refundable.','The lodge is an emergency shelter.','Walk across Ptarmigan Lake.'])assert.ok(analyseGuideHtml(html.replace(/class="article-body"[^>]*>/,tag=>tag+`<p>${claim}</p>`),check,sitemap).errors.some(e=>e.includes('Unsupported inherited/current claim')),'No invented Skoki inclusion or winter route: '+claim);
      }
    }
    if(check.quality.bookingContext){
      assert.ok(analyseGuideHtml(html.replace('data-curated-booking="true"','data-curated-booking="false"'),check,sitemap).errors.some(e=>e.includes('curated booking SSR')));
      const start=html.indexOf('data-affiliate-embed="expedia-banner"'),wrong=html.slice(0,start)+html.slice(start).replace(`href="${esc(check.quality.bookingContext.hotelHref)}"`,'href="https://www.expedia.ca/Hotel-Search?destination=WrongPlace&amp;camref=1101l3MtWX"');
      assert.ok(analyseGuideHtml(wrong,check,sitemap).errors.some(e=>e.includes('native article booking context')),'Destination mismatch must fail even with the preserved affiliate ID.');
    }
    if(check.quality.cards){const {attribute,items}=check.quality.cards;assert.ok(analyseGuideHtml(html.replace(`${attribute}="${items[0].id}"`,`${attribute}="unknown"`),check,sitemap).errors.some(e=>e.includes('guide card')));const card=htmlElements(html).find(n=>n.attributes[attribute]===items[0].id),wrong=html.slice(0,card.start)+html.slice(card.start,card.end).replace(`href="${esc(items[0].href)}"`,'href="/wrong/"')+html.slice(card.end);assert.ok(analyseGuideHtml(wrong,check,sitemap).errors.some(e=>e.includes(check.quality.type==='dining-hub'?'native deduplicated operator/menu/booking links':'native guide card')));}
    if(check.quality.controls?.length){const id=check.quality.controls[0].id;assert.ok(analyseGuideHtml(html.replace(`id="${id}"`,'id="missing-control"'),check,sitemap).errors.some(e=>e.includes('guide control')));}
    if(check.quality.taggedLinks?.length){const attr=check.quality.taggedLinks[0].attribute;assert.ok(analyseGuideHtml(html.replace(`${attr} href=`,`data-wrong-journey href=`),check,sitemap).errors.some(e=>e.includes('town journey link')));}
    if(check.quality.noSkiPlanner){
      assert.deepEqual(analyseGuideHtml(html.replace('<body>','<body><header><a href="/ski-day-planner">Ski planner navigation</a></header>'),check,sitemap).errors,[],'Shared navigation does not imply destination-specific transport coverage.');
      assert.ok(analyseGuideHtml(html.replace('class="guide-content">','class="guide-content"><a href="/ski-day-planner">Plan this resort day</a>'),check,sitemap).errors.some(e=>e.includes('Unsupported Banff')));
    }
    if(check.quality.type==='dining-hub'){
      for(const target of check.quality.hubLinks){const wrong=html.replace(`href="${esc(target.href)}"`,'href="/wrong/"');assert.ok(analyseGuideHtml(wrong,check,sitemap).errors.some(e=>e.includes('scoped reviewed evening handoff')));}
      assert.ok(analyseGuideHtml(html.replace('aria-labelledby="evening-guides-title"','aria-labelledby="wrong-section"'),check,sitemap).errors.some(e=>e.includes('scoped evening guide hub')));
      assert.ok(analyseGuideHtml(html.replace('Compare Banff hotel bases','Book your hotel with free dining vouchers'),check,sitemap).errors.some(e=>e.includes('hub hotel comparison')));
      assert.ok(analyseGuideHtml(html.replace('meal, admission and booking conditions','guaranteed savings and free drinks'),check,sitemap).errors.some(e=>e.includes('Unsupported hub offer/booking promise')));
      assert.ok(analyseGuideHtml(html.replace('</body>','<p>Open 1pm to 2am daily.</p></body>'),check,sitemap).errors.some(e=>e.includes('Rose & Crown daily hours')));
      const firstName='"name":'+JSON.stringify(check.quality.dining.venues[0].name);
      for(const entity of ['Restaurant','LocalBusiness'])assert.ok(analyseGuideHtml(html.replace(firstName,`${firstName},"item":{"@type":"${entity}","openingHours":"Mo-Su 13:00-02:00"}`),check,sitemap).errors.some(e=>e.includes('ItemList exceeds name/operator-link scope')));
      assert.ok(analyseGuideHtml(html.replace(firstName,firstName+',"openingHours":"Mo-Su 13:00-02:00"'),check,sitemap).errors.some(e=>e.includes('ItemList exceeds name/operator-link scope')));
      assert.ok(analyseGuideHtml(html.replace('"@type":"ItemList"','"@type":"ItemList","geo":{"@type":"GeoCoordinates","latitude":51.2,"longitude":-115.5}'),check,sitemap).errors.some(e=>e.includes('Restaurant/location/hours/price/rating schema')));
      assert.ok(analyseGuideHtml(html.replace('value="all"','value="wrong-default"'),check,sitemap).errors.some(e=>e.includes('Dining default/whitelist/label')));
      assert.ok(analyseGuideHtml(html.replace('<button type="reset">Show all</button>','<button type="button">Show all</button>'),check,sitemap).errors.some(e=>e.includes('native dining reset')));
      assert.ok(analyseGuideHtml(html.replace('data-dining-group','data-wrong-dining-group'),check,sitemap).errors.some(e=>e.includes('four complete SSR dining area groups')));
      const elements=htmlElements(html),station=elements.find(n=>n.attributes['data-dining-slug']==='lake-louise-station'),stationBody=html.slice(station.start,station.end);
      for(const [from,to,message]of [['class="dining-notice"','class="missing-notice"','prominent sourced dining notice'],['Reopening updates','Book dinner now','Station closure incorrectly promoted']]){const wrong=html.slice(0,station.start)+stationBody.replace(from,to)+html.slice(station.end);assert.ok(analyseGuideHtml(wrong,check,sitemap).errors.some(e=>e.includes(message)));}
      const pending=elements.find(n=>n.attributes['data-dining-slug']==='pd3-by-blake'),pendingBody=html.slice(pending.start,pending.end),wrongPending=html.slice(0,pending.start)+pendingBody.replace('Check details','Details checked')+html.slice(pending.end);
      assert.ok(analyseGuideHtml(wrongPending,check,sitemap).errors.some(e=>e.includes('dated dining status scope')),'A pending identity cannot become a checked active restaurant.');
      const card=elements.find(n=>n.attributes['data-dining-slug']==='the-bison-restaurant'),cardBody=html.slice(card.start,card.end);
      for(const addition of ['<img src="https://example.com/unverified.jpg" alt="The restaurant">','<p class="restaurant-price">$$$</p>','<p data-lat="51.2">Precise point</p>'])assert.ok(analyseGuideHtml(html.slice(0,card.openEnd)+addition+html.slice(card.openEnd),check,sitemap).errors.some(e=>e.includes('Unverified dining photo/price/hours/GPS markup')));
      const sourceDetails=elements.find(n=>n.tag==='details'&&hasClass(n,'dining-source-details')&&inside(n,card)),sourceFragment=html.slice(sourceDetails.start,sourceDetails.end),sourceHref=check.quality.dining.venues.find(v=>v.slug==='the-bison-restaurant').sourceReview.sources[0].url;
      assert.ok(analyseGuideHtml(html.slice(0,sourceDetails.start)+sourceFragment.replace(`href="${esc(sourceHref)}"`,'href="https://example.com/wrong-source"')+html.slice(sourceDetails.end),check,sitemap).errors.some(e=>e.includes('dining service/journey/primary-source detail')),'Action link elsewhere cannot mask a missing primary source in visit checks.');
      const menuHref=check.quality.dining.venues.find(v=>v.slug==='the-bison-restaurant').menuUrl,wrongMenu=html.slice(0,card.start)+cardBody.replace(`href="${esc(menuHref)}"`,'href="https://example.com/wrong-menu"')+html.slice(card.end);
      assert.ok(analyseGuideHtml(wrongMenu,check,sitemap).errors.some(e=>e.includes('native deduplicated operator/menu/booking links')));
      assert.deepEqual(analyseGuideHtml(html.replace('</body>','<section><h2>Inherited restaurant catalogue, outside new handoff scope</h2><p>Happy hour is from 3–6.</p></section></body>'),check,sitemap).errors,[],'Scoped handoff checks do not claim a full restaurant-data source review.');
    }
    if(check.quality.type==='parkway'){
      const p=check.quality.parkway;
      assert.ok(analyseGuideHtml(html.replace('About 39 km from Lake Louise village','About 17 km from Lake Louise village'),check,sitemap).errors.some(e=>e.includes('map-distance text differs')));
      assert.ok(analyseGuideHtml(html.replace('data-parkway-select value="herbert-lake"','data-parkway-select checked value="herbert-lake"'),check,sitemap).errors.some(e=>e.includes('optional choice is missing/visible/preselected')));
      assert.ok(analyseGuideHtml(html.replace('data-parkway-choice hidden','data-parkway-choice'),check,sitemap).errors.some(e=>e.includes('optional choice is missing/visible/preselected')));
      assert.ok(analyseGuideHtml(html.replace('value="winter"','value="unknown-season"'),check,sitemap).errors.some(e=>e.includes('Parkway select/default/label')));
      assert.ok(analyseGuideHtml(html.replace('<li>'+esc(p.initial.checklist[0])+'</li>',''),check,sitemap).errors.some(e=>e.includes('complete three Parkway journey checks')));
      assert.ok(analyseGuideHtml(html.replaceAll('https://expedia.com/affiliate/KB6G4xt','https://expedia.com/affiliate/wrong'),check,sitemap).errors.some(e=>e.includes('KB6G4xt car referral')));
      assert.ok(analyseGuideHtml(html.replace('"@type":"FAQPage"','"@type":"WebPage"'),check,sitemap).errors.some(e=>e.includes('FAQPage')));
      for(const added of ['<p>Complete the drive in 3 hours.</p>','<p>Fuel is guaranteed.</p>','<span id="total-time">6 hours</span>','<p data-stop-min="20">Fixed stop minutes</p>'])assert.ok(analyseGuideHtml(html.replace('</body>',added+'</body>'),check,sitemap).errors.some(e=>e.includes('fixed ETA/fuel/route prescription')));
      assert.ok(analyseGuideHtml(html.replaceAll('snow tires or chains November 1–March 31','snow tires or chains October 1–April 30'),check,sitemap).errors.length,'Planner tire-rule regression.');
      assert.ok(analyseGuideHtml(html.replace(/class="image-note"/,'class="missing-note"'),check,sitemap).errors.some(e=>e.includes('illustrative Parkway hero')));
      assert.ok(analyseGuideHtml(html.replace('class="filter-note"','class="missing-filter-note"'),check,sitemap).errors.some(e=>e.includes('filter/selection scope')));
    }
    if(check.quality.filters){
      const f=check.quality.filters,key=Object.keys(f.options)[0],select=htmlElements(html).find(n=>n.attributes.id===f.prefix+'-'+key),fragment=html.slice(select.start,select.end),wrong=html.slice(0,select.start)+fragment.replace('value="'+f.initial.filters[key]+'"','value="unknown"')+html.slice(select.end);
      assert.ok(analyseGuideHtml(wrong,check,sitemap).errors.some(e=>e.includes('select/default/label differs')));
      assert.ok(analyseGuideHtml(html.replace(f.initial.summary,'A live suitability score'),check,sitemap).errors.some(e=>e.includes('SSR default status')));
    }
    if(check.quality.type==='larch'){
      assert.ok(analyseGuideHtml(html.replaceAll(esc(check.quality.filters.initial.note),'Peak guaranteed this year.'),check,sitemap).errors.some(e=>e.includes('variable-season planning note')));
      assert.ok(analyseGuideHtml(html.replaceAll('mid-October to mid-June','safe through all winter'),check,sitemap).errors.some(e=>e.includes('seasonal transport/terrain/base limits')));
      for(const claim of ['90% fewer people.','The peak is guaranteed on September 25.','These are safe winter hikes.'])assert.ok(analyseGuideHtml(html.replace('</body>','<p>'+claim+'</p></body>'),check,sitemap).errors.some(e=>e.includes('peak/crowd/winter prediction')));
    }
    if(check.quality.type==='altitude'){
      assert.ok(analyseGuideHtml(html.replaceAll('1,383 m','1,483 m'),check,sitemap).errors.some(e=>e.includes('Named elevation/source differs')));
      assert.ok(analyseGuideHtml(html.replace('+898 m — not total ascent','+698 m — total ascent'),check,sitemap).errors.some(e=>e.includes('named-point difference')));
      assert.ok(analyseGuideHtml(html.replace(esc(check.quality.altitude.initial.overnightQuestion),'The summit is where everyone sleeps.'),check,sitemap).errors.some(e=>e.includes('overnight distinction')));
      assert.ok(analyseGuideHtml(html.replaceAll('href="tel:911"','href="tel:811"'),check,sitemap).errors.some(e=>e.includes('illness escalation/distinct Canadian contacts')));
      for(const claim of ['Fitness prevents altitude illness.','Safe below 2450 m.','Day 2 guarantees acclimatization.'])assert.ok(analyseGuideHtml(html.replace('</body>','<p>'+claim+'</p></body>'),check,sitemap).errors.some(e=>e.includes('personal altitude score/timing/treatment')));
      assert.ok(analyseGuideHtml(html.replaceAll('does not confirm winter sightseeing','guarantees winter sightseeing'),check,sitemap).errors.some(e=>e.includes('current-season/access boundaries')));
    }
    if(check.quality.type==='park-pass'){
      const all=htmlElements(html),pass=check.quality.parkPass,table=all.find(n=>n.attributes.id==='pass-comparison-table');
      const value=all.find(n=>n.attributes.id==='pass-individual-daily-value'),wrongFee=html.slice(0,value.openEnd)+'CAD 0.00'+html.slice(value.innerEnd);
      assert.ok(analyseGuideHtml(wrongFee,check,sitemap).errors.some(e=>e.includes('published-fee option')),'Exact default admission amount must not become free.');
      const youth=all.find(n=>n.attributes['data-pass-rate']==='Youth · age 17 and under'),wrongYouth=html.slice(0,youth.openEnd)+html.slice(youth.openEnd,youth.innerEnd).replace('Free admission','CAD 5.50')+html.slice(youth.innerEnd);
      assert.ok(analyseGuideHtml(wrongYouth,check,sitemap).errors.some(e=>e.includes('rate/youth table')),'A separate youth service fee cannot become park admission.');
      assert.ok(analyseGuideHtml(html.replace('value="visit"','value="unknown"'),check,sitemap).errors.some(e=>e.includes('select/default/label')));
      assert.ok(analyseGuideHtml(html.replace('id="pass-adults"','id="pass-private"'),check,sitemap).errors.some(e=>e.includes('control')||e.includes('numeric default')));
      const form=all.find(n=>n.attributes.id==='park-pass-form'),open=html.slice(form.start,form.openEnd);
      assert.ok(analyseGuideHtml(html.slice(0,form.start)+open.replace(/\shidden(?:="")?/,'')+html.slice(form.openEnd),check,sitemap).errors.some(e=>e.includes('control attribute')));
      const attack=html.slice(0,form.start)+open.replace('<form','<form action="https://example.invalid/collect"')+html.slice(form.openEnd);assert.ok(analyseGuideHtml(attack,check,sitemap).errors.some(e=>e.includes('progressive park-pass')));
      const personal=html.slice(0,form.openEnd)+'<input type="text" name="email">'+html.slice(form.openEnd);assert.ok(analyseGuideHtml(personal,check,sitemap).errors.some(e=>e.includes('personal/query submission')));
      for(const [before,after]of [['exception for travel without stopping','exception for every route and stop'],['ended September 7, 2026','continues all winter'],['requires printing the pass','accepts every phone screenshot'],['must be signed and are not transferable','can be shared with any party']])assert.ok(analyseGuideHtml(html.replaceAll(before,after),check,sitemap).errors.length,'Park-pass product/route/date scope cannot reverse: '+before);
      const source=all.find(n=>n.tag==='a'&&n.attributes.href===pass.sourceLinks[0]),sourceOpen=html.slice(source.start,source.openEnd),wrong=html.slice(0,source.start)+sourceOpen.replace(/href=("[^"]*"|'[^']*')/,'href="https://example.invalid/buy"')+html.slice(source.openEnd);
      assert.ok(analyseGuideHtml(wrong,check,sitemap).errors.some(e=>e.includes('official park-pass purchase/source')));
      for(const claim of ['There is no transit corridor exemption.','Youth admission costs CAD 5.50.','Discovery Pass always pays for itself in seven travel days.','It covers ALL Parks Canada sites.','Kananaskis is included.','Canada Strong Pass is free all winter.'])assert.ok(analyseGuideHtml(html.replace('</body>','<p>'+claim+'</p></body>'),check,sitemap).errors.some(e=>e.includes('universal park-pass')),'Reject inherited pass claim: '+claim);
      assert.ok(analyseGuideHtml(html.replace('data-pass-option="group-annual"','data-pass-option="individual-annual"'),check,sitemap).errors.some(e=>e.includes('published-fee option')));
      assert.ok(analyseGuideHtml(html.replace('type="reset"','type="button"'),check,sitemap).errors.some(e=>e.includes('native park-pass reset')));
      assert.ok(analyseGuideHtml(html.replace('"@type":"FAQPage"','"@type":"WebPage"'),check,sitemap).errors.some(e=>e.includes('FAQPage')));
      assert.ok(analyseGuideHtml(html.replace(pass.initial.summary,'A universal safe and free trip.'),check,sitemap).errors.some(e=>e.includes('default admission arithmetic')));
      assert.ok(table&&!table.hidden);
    }
    if(check.quality.type==='budget'){
      const nodes=htmlElements(html),amount=nodes.find(n=>n.attributes.id==='budget-a-lodging-amount'),tag=html.slice(amount.start,amount.openEnd),withAmount=html.slice(0,amount.start)+tag.replace('<input','<input value="0"')+html.slice(amount.openEnd);
      assert.ok(analyseGuideHtml(withAmount,check,sitemap).errors.some(e=>e.includes('blank/mode/category default')),'A blank quote cannot become a free default.');
      const fields=nodes.find(n=>n.attributes.id==='budget-b-fields'),open=html.slice(fields.start,fields.openEnd),enabled=html.slice(0,fields.start)+open.replace(/\sdisabled(?:="")?/,'')+html.slice(fields.openEnd);
      assert.ok(analyseGuideHtml(enabled,check,sitemap).errors.some(e=>e.includes('progressive SSR scope')));
      assert.ok(analyseGuideHtml(html.replace('No total yet','CAD 0.00'),check,sitemap).errors.some(e=>e.includes('initial missing-cost results')));
      const worksheet=nodes.find(n=>n.attributes.id==='trip-budget-worksheet'),tableBody=nodes.find(n=>n.tag==='tbody'&&inside(n,worksheet)),row=nodes.find(n=>n.tag==='tr'&&inside(n,tableBody));
      assert.ok(analyseGuideHtml(html.slice(0,row.start)+html.slice(row.end),check,sitemap).errors.some(e=>e.includes('no-JS seven-cost/three-total')));
      assert.ok(analyseGuideHtml(html.replaceAll('/book/banff-winter-activities/','/book/winter-activities/'),check,sitemap).errors.some(e=>e.includes('source/photo link')),'Native quote handoff stays canonical.');
      assert.ok(analyseGuideHtml(html.replace('budget-image-note','missing-image-note'),check,sitemap).errors.some(e=>e.includes('budget image qualification')));
    }
  }
  const toolsCheck=inventory.checks.find(c=>c.path==='/tools/'),toolsFixture=`<html><head><link rel="canonical" href="${ORIGIN}/tools/"></head><body><h1>Banff Planning Tools</h1><p>${Object.values(toolsCheck.markers).map(esc).join(' ')}</p>${toolsCheck.links.map(href=>`<a href="${href}">Planning tool</a>`).join('')}${consentFixture}</body></html>`;
  assert.deepEqual(analyseGuideHtml(toolsFixture,toolsCheck,new Set([ORIGIN+'/tools/'])).errors,[]);for(const href of ['/trip-cost','/altitude-guide','/larch-season'])assert.ok(analyseGuideHtml(toolsFixture.replace(`href="${href}"`,'href="/wrong-tool"'),toolsCheck,new Set([ORIGIN+'/tools/'])).errors.some(e=>e.includes('source/photo link')),'Tools preserves native new-planner discovery.');
  const {stdout,stderr}=await promisify(execFile)(process.execPath,['--input-type=module','-e',`globalThis.fetch=()=>{throw Error('Import attempted network')}; await import(${JSON.stringify(new URL('./verify-cycling-consent-release.mjs',import.meta.url).href)}); await import(${JSON.stringify(import.meta.url)});`],{cwd:ROOT,timeout:15000,maxBuffer:100000});
  assert.equal(stdout,'','Import must not run either CLI/self-test');assert.equal(stderr,'');
  assert.throws(()=>builtLocations('<!DOCTYPE x><urlset><url><loc>https://banffbound.com/</loc></url></urlset>','urlset'));
  assert.throws(()=>builtLocations('<urlset><url><loc>https://example.com/</loc></url></urlset>','urlset'));
  console.log('Guide-quality offline fixtures passed: all238 prior routes preserved plus5 distinct full-guide contracts and park-pass =244 unique HTML routes/7photo hashes;78full-review registry,8partial repairs,27authored/29curated contexts. New raw publication/illustrative/schema/FAQ/native-source/booking checks cover budget quote units and2active searches without archived product links, distinct fall timing/base/closure scopes and valley/pass endpoints/return/snow/transport. Actual park-pass page SSR supplies8FAQ pairs,4source-dated rates/4default amounts, hidden controls and no-JS arithmetic, route-specific transit/ended-free-period/youth/private-vehicle/display rules; model states and hostile field/source/fee/FAQ/canonical negatives pass. Existing193engine and every prior guide, planner, data, alias, consent and photo contract remain intact. No network, receipt writes, Git, host calls or site build.');
}
function builtLocations(xml,kind){
  assert.ok(!/<!DOCTYPE|<!ENTITY/i.test(xml),'Built sitemap cannot declare entities');assert.ok(new RegExp(`<${kind}\\b`).test(xml),'Unexpected built sitemap type');
  const locations=[...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map(m=>normal(m[1]));assert.ok(locations.length>0&&locations.length<10000);
  for(const value of locations){const u=new URL(value);assert.equal(u.origin,ORIGIN);assert.ok(!u.search&&!u.hash&&!u.username&&!u.password);}
  assert.equal(new Set(locations).size,locations.length);return locations;
}
export async function checkBuiltDirectory(directory){
  const root=path.resolve(directory),inventory=await loadGuideInventory();
  const receiptText=await readFile(path.join(root,'build-info.json'),'utf8'),buildReceipt=JSON.parse(receiptText);
  assert.equal(buildReceipt.formatVersion,1);assert.equal(buildReceipt.scope,'app-source-v2');assert.match(buildReceipt.sourceFingerprint,/^[a-f0-9]{64}$/);assert.ok(buildReceipt.sourceRevision===null||/^[a-f0-9]{40}$/.test(buildReceipt.sourceRevision));
  const index=builtLocations(await readFile(path.join(root,'sitemap-index.xml'),'utf8'),'sitemapindex'),locations=[];assert.ok(index.length<=8);
  for(const url of index){const pathname=new URL(url).pathname;assert.match(pathname,/^\/sitemap(?:-\d+)?\.xml$/);locations.push(...builtLocations(await readFile(path.join(root,pathname),'utf8'),'urlset'));}
  const sitemap=new Set(locations);assert.equal(sitemap.size,locations.length);assert.ok(!sitemap.has(ORIGIN+'/build-info.json'));
  const failures=[];let htmlPassed=0,photosPassed=0;
  for(const check of inventory.checks){try{const html=await readFile(path.resolve(root,'.'+check.path,'index.html'),'utf8'),result=analyseGuideHtml(html,check,sitemap);if(result.errors.length)failures.push({path:check.path,errors:result.errors});else htmlPassed++;}catch(error){failures.push({path:check.path,errors:[String(error.message??error.name)]});}}
  for(const photo of inventory.photos){try{const bytes=await readFile(path.resolve(root,'.'+photo.src)),digest=createHash('sha256').update(bytes).digest('hex');assert.equal(digest,photo.sha256);photosPassed++;}catch(error){failures.push({path:photo.src,errors:['Built photo missing or SHA256 differs']});}}
  assert.equal(await readFile(path.join(root,'build-info.json'),'utf8'),receiptText,'Local build receipt changed during HTML inspection');
  return {passed:htmlPassed===EXPECTED_ROUTES&&photosPassed===7&&failures.length===0,mode:'read-only-built-directory',htmlRoutes:inventory.checks.length,htmlPassed,photosPassed,fullReviews:78,remainingPartialRepairs:8,sitemapUrls:sitemap.size,buildReceipt,buildReceiptStable:true,productionIdentityVerified:false,failures};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{if(process.argv.length===3&&process.argv[2]==='--self-test')await selfTest();else if(process.argv.length===4&&process.argv[2]==='--built-dir'){const result=await checkBuiltDirectory(process.argv[3]);console.log(JSON.stringify(result));if(!result.passed)process.exitCode=1;}else await verify(options(process.argv.slice(2)),{inventoryLoader:loadGuideInventory,htmlAnalyser:analyseGuideHtml,userAgent:'BanffBound-guide-quality-release-verification/1.0'});}
  catch(error){console.error(String(error.message??error.name));process.exitCode=1;}
}
