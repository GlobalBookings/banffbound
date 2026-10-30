export const parkPassReviewedAt='2026-10-29';
export const parkPassSources={
  fees:'https://parks.canada.ca/pn-np/ab/banff/visit/tarifs-fees',
  guide:'https://parks.canada.ca/~/~/~/link.aspx?_id=FCF8E7F526E14FFAAA56E097E999F41C&_z=z',
  order:'https://parks.canada.ca/pn-np/ab/banff/bulletins/7d9a90ac-8cd6-4a47-9051-e2e41121e93b',
  admission:'https://parks.canada.ca/voyage-travel/admission',
  dailySeller:'https://www.banfflakelouise.com/park-pass-purchase',
  discoverySeller:'https://reservation.pc.gc.ca/',
  kananaskis:'https://www.alberta.ca/kananaskis-conservation-pass',
  lakeTransport:'https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise',
};
// CAD cents from Parks Canada's Banff fee table, read on the date above.
// These are published admission fees, not a live checkout or service quote.
export const parkPassRates={dailyAdult:1225,dailySenior:1075,dailyGroup:2450,annualAdult:8350,annualSenior:7150,annualGroup:16750,youth:0} as const;
export const parkPassOptions={
  purpose:[['visit','Visit Banff, a lake, a trail or a ski resort'],['parkway','Travel the Icefields or Bow Valley Parkway'],['transit','Non-stop transit on Highway 1 or 93 South'],['outside','Stay outside the national park']],
  coverage:[['compare','Compare new admission purchases'],['existing','Check a pass I already hold'],['eligibility','Check other free-admission eligibility']],
  vehicle:[['yes','Together in one private vehicle'],['no','Car-free or arriving separately']],
} as const;
export const defaultParkPassInputs={purpose:'visit',coverage:'compare',adults:'2',seniors:'0',youth:'0',units:'3',vehicle:'yes'};
export const parkPassOptionIds=['individual-daily','group-daily','individual-annual','group-annual'] as const;
type Row={id:typeof parkPassOptionIds[number];label:string;amountCents:number|null;detail:string};
type Result={state:'compare'|'transit'|'outside'|'existing'|'eligibility'|'youth'|'invalid';activePartyFields:boolean;showCoverage:boolean;errors:{field:string;message:string}[];summary:string;detail:string;rows:Row[];breakEvenUnits:number|null;people:number|null};
export const formatParkPassMoney=(cents:number)=>new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD',currencyDisplay:'code',minimumFractionDigits:2,maximumFractionDigits:2}).format(cents/100);
export function calculateParkPassPlan(value:unknown=defaultParkPassInputs):Result{
  const input=value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:{};
  const result:Result={state:'invalid',activePartyFields:false,showCoverage:true,errors:[],summary:'Check the choices and counts below.',detail:'No admission comparison has been calculated.',rows:[],breakEvenUnits:null,people:null};
  if(!parkPassOptions.purpose.some(([key])=>key===input.purpose)){result.errors.push({field:'pass-purpose',message:'Choose the actual journey.'});return result;}
  if(input.purpose==='transit'){return{...result,state:'transit',showCoverage:false,summary:'Non-stop Highway 1 / Highway 93 South transit has a stated pass exception.',detail:'The September 8, 2026 Banff order excludes travel without stopping on these two highways. A town, trail, viewpoint or other stop changes the plan. The Icefields Parkway and Bow Valley Parkway are not this exception.'};}
  if(input.purpose==='outside'){return{...result,state:'outside',showCoverage:false,summary:'A stay outside Banff National Park does not establish the pass needs of each outing.',detail:'Canmore townsite is outside the national park. Entering Banff for a visit changes the assessment. Alberta’s separate Kananaskis Conservation Pass applies to vehicle parking at covered provincial and public-land sites; the national pass does not replace it.'};}
  if(!parkPassOptions.coverage.some(([key])=>key===input.coverage)){result.errors.push({field:'pass-coverage',message:'Choose whether you need a new comparison, an existing-pass check or free-admission information.'});return result;}
  if(input.coverage==='existing')return{...result,state:'existing',summary:'Check the actual pass, holder and validity before buying another.',detail:'Qualifying annual passes were extended during the 2025 and 2026 Canada Strong Pass periods. Use Parks Canada’s expiry calculator and the applicable holder, vehicle and display conditions. This tool does not inspect or validate a pass.'};
  if(input.coverage==='eligibility')return{...result,state:'eligibility',summary:'Use the official eligibility details before pricing a new pass.',detail:'Parks Canada lists youth admission and other eligibility categories, including qualifying newcomers, support persons and Canadian Armed Forces members, veterans and immediate families. Conditions matter; no personal eligibility or documents are assessed here.'};
  result.activePartyFields=true;
  function integer(key:string,label:string,min:number,max:number){const raw=input[key];const valid=(typeof raw==='string'||typeof raw==='number')&&/^\d+$/.test(String(raw).trim());const number=valid?Number(raw):NaN;if(!Number.isInteger(number)||number<min||number>max){result.errors.push({field:'pass-'+key,message:`${label}: enter a whole number from ${min} to ${max}.`});return null;}return number;}
  const adults=integer('adults','Adults',0,7),seniors=integer('seniors','Seniors',0,7),youth=integer('youth','Youth',0,7);
  if(result.errors.length)return result;
  const people=adults!+seniors!+youth!;result.people=people;
  if(people<1||people>7){result.errors.push({field:'pass-adults',message:'This private-party comparison covers 1–7 people. Ask Parks Canada or your operator about larger or commercial groups.'});return result;}
  if(adults===0&&seniors===0)return{...result,state:'youth',summary:'Youth aged 17 and under have free Parks Canada admission.',detail:'No paid adult or senior admission is calculated for this entered party. Shuttle tickets, parking, camping, hot springs and other services can still have their own charges.'};
  const units=integer('units','Chargeable daily-admission units',1,60);
  if(!parkPassOptions.vehicle.some(([key])=>key===input.vehicle))result.errors.push({field:'pass-vehicle',message:'Choose whether everyone arrives together in one private vehicle.'});
  if(result.errors.length)return result;
  const group=input.vehicle==='yes',daily=adults!*parkPassRates.dailyAdult+seniors!*parkPassRates.dailySenior,annual=adults!*parkPassRates.annualAdult+seniors!*parkPassRates.annualSenior;
  const dailyMinimum=Math.min(daily,group?parkPassRates.dailyGroup:Infinity),annualMinimum=Math.min(annual,group?parkPassRates.annualGroup:Infinity),dailyTotal=dailyMinimum*units!;
  const basis=`${adults} adult(s), ${seniors} senior(s), ${youth} youth; ${units} daily-admission unit(s).`;
  result.rows=[
    {id:'individual-daily',label:'Individual daily admissions',amountCents:daily*units!,detail:`(${adults} adult × ${formatParkPassMoney(parkPassRates.dailyAdult)} + ${seniors} senior × ${formatParkPassMoney(parkPassRates.dailySenior)}) × ${units} unit(s). Youth admission is free.`},
    {id:'group-daily',label:'Family/group daily admission',amountCents:group?parkPassRates.dailyGroup*units!:null,detail:group?`${formatParkPassMoney(parkPassRates.dailyGroup)} × ${units} unit(s), for up to seven people arriving in one vehicle.`:'Not included: you selected car-free or separate arrival. Check the actual group arrangement with Parks Canada.'},
    {id:'individual-annual',label:'Individual Discovery Passes',amountCents:annual,detail:`${adults} adult × ${formatParkPassMoney(parkPassRates.annualAdult)} + ${seniors} senior × ${formatParkPassMoney(parkPassRates.annualSenior)}. Each pass belongs to its holder.`},
    {id:'group-annual',label:'Family/group Discovery Pass',amountCents:group?parkPassRates.annualGroup:null,detail:group?'Different coverage: up to seven people arriving together in one vehicle. Confirm the holder and travel conditions.':'Not included for this selected arrival arrangement.'},
  ];
  const difference=Math.abs(dailyTotal-annualMinimum),comparison=dailyTotal===annualMinimum?'The lowest amounts are equal.':dailyTotal<annualMinimum?`The lowest daily amount is ${formatParkPassMoney(difference)} lower.`:`The lowest new Discovery amount is ${formatParkPassMoney(difference)} lower.`;
  result.state='compare';result.summary=`${basis} Lowest listed daily option: ${formatParkPassMoney(dailyTotal)}. Lowest listed new Discovery option for this party: ${formatParkPassMoney(annualMinimum)}. ${comparison}`;
  result.breakEvenUnits=Math.floor(annualMinimum/dailyMinimum)+1;
  result.detail=`At these rates and with this same party/arrival arrangement, the lowest new Discovery amount becomes lower on chargeable unit ${result.breakEvenUnits}. This is arithmetic for Banff’s published fees, not a universal travel-day rule. Individual and group passes have different future coverage. Recheck eligibility, validity, actual fee units and the seller’s final terms before purchase.`;
  return result;
}
export const parkPassFaqs=[
  {question:'Do I need a pass just to drive through Banff?',answer:'The current Banff travel order, issued September 8, 2026, states an exception for non-stop travel on Highway 1 and Highway 93 South. It does not provide that exception for the Icefields Parkway or Bow Valley Parkway. A visit to a town, viewpoint, trail or ski resort is a different plan. Follow the current order and Parks Canada instructions for your actual route.'},
  {question:'Do children and teenagers pay Banff admission?',answer:'Parks Canada admission is free for youth aged 17 and under. That does not make shuttles, parking, camping, hot springs, lift tickets or private activities free. Check each service’s own age bands and required charges.'},
  {question:'Is a Discovery Pass always better after seven travel days?',answer:'Compare the same party, actual chargeable daily units, existing passes and eligibility first. A travel day is not automatically a separate daily admission. Discovery and daily passes have different coverage, and future parties or other Parks Canada visits may change the decision. The calculator uses the dated Banff fee table and shows its assumptions.'},
  {question:'How do I count daily admission units?',answer:'The Parks Canada Banff pass guide says a daily pass is valid until 4 pm the next day. Do not automatically multiply admission by every calendar date, hotel night or itinerary day. Ask the official seller which dated admission covers your arrival, stops and final departure, then compare that number of chargeable units.'},
  {question:'Does admission include shuttles, campsites, parking or ski tickets?',answer:'No. Park entry and each reserved service or activity are separate. A national pass does not book a lake shuttle, campsite, hotel room, gondola, lesson or lift ticket. Add applicable service, reservation and other charges to the trip budget and confirm actual availability.'},
  {question:'Is Canada Strong Pass free entry still available?',answer:'At the October 29, 2026 review, Parks Canada states that Canada Strong Pass admission ended September 7, 2026 and regular fees resumed September 8. Do not carry a past free period into a future winter or summer booking. Existing qualifying annual passes may have an extension; use the official expiry calculator.'},
  {question:'Does a Parks Canada pass cover Kananaskis or Canmore parking?',answer:'No. Canmore townsite is outside Banff National Park. Alberta’s Kananaskis Conservation Pass is a separate vehicle-parking requirement at covered provincial and public-land sites; Canmore townsite is excluded from that pass area. Check Alberta’s map and conditions for the exact parking location. Other parking or facility charges can still apply.'},
  {question:'Where should I buy and how should I display a pass?',answer:'Use Parks Canada’s current purchase and visitor-centre links, including its named authorized sellers. Follow the issuer’s fulfilment and display instructions for the actual product. Discovery Passes must be signed by their holder and are not transferable. The linked Banff & Lake Louise Tourism seller requires its pass to be printed and displayed on the dashboard. Follow the actual issuer’s requirements for your purchase.'},
];
