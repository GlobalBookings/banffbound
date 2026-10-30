/** Public logistics preferences only. No booking, ability, terrain or availability assessment. */
export const heliSkiReviewedAt = '2026-10-29';
export const heliSkiSources = {
  purcell: 'https://www.cmhheli.com/destinations/purcell',
  cmhContact: 'https://www.cmhheli.com/contact-us',
  cmhTerms: 'https://www.cmhheli.com/planning/booking/terms-of-booking',
  cmhCancellation: 'https://www.cmhheli.com/planning/booking/insurance-cancellation',
  cmhVertical: 'https://www.cmhheli.com/planning/booking/vertical-guarantee',
  rkArrival: 'https://rkheliski.com/plan-your-trip/getting-here/',
  rkTransfer: 'https://rkheliski.com/plan-your-trip/transportation/',
  rkEquipment: 'https://rkheliski.com/details/heliski-equipment/',
  rkTerms: 'https://rkheliski.com/details/booking-information/',
  rkEnquiry: 'https://rkheliski.com/request-availability/',
  rkFaq: 'https://rkheliski.com/plan-your-trip/frequently-asked-questions/',
  kpow: 'https://www.skifortress.com/kpow-cat-skiing',
} as const;
export const heliSkiFilterOptions = {
  operator: [['all','Compare both operators'],['purcell','CMH Purcell only'],['rk','RK Heliski only']],
  base: [['banff','Banff town'],['canmore','Canmore'],['louise','Lake Louise area'],['golden','Golden / Kicking Horse area'],['panorama','Panorama / Invermere area'],['other','Another base or not decided']],
  transport: [['undecided','Transport not decided'],['self-drive','Plan to drive'],['enquire','Need to enquire about a transfer'],['confirmed','Have a separate transfer confirmation']],
  overnight: [['undecided','Overnight plan not decided'],['near-base','Plan an overnight near the operator'],['same-day','Plan to return to the existing base']],
  equipment: [['undecided','Ski / snowboard not decided'],['ski','Ski equipment questions'],['snowboard','Snowboard equipment questions']],
} as const;
export type HeliSkiFilters = { operator:'all'|'purcell'|'rk'; base:'banff'|'canmore'|'louise'|'golden'|'panorama'|'other'; transport:'undecided'|'self-drive'|'enquire'|'confirmed'; overnight:'undecided'|'near-base'|'same-day'; equipment:'undecided'|'ski'|'snowboard' };
export const defaultHeliSkiFilters: HeliSkiFilters = {operator:'all',base:'banff',transport:'undecided',overnight:'undecided',equipment:'undecided'};
export const heliSkiUrlKeys = {operator:'heli_operator',base:'heli_base',transport:'heli_transport',overnight:'heli_overnight',equipment:'heli_equipment'} as const;
const keys = ['operator','base','transport','overnight','equipment'] as const;
export function normaliseHeliSkiFilters(raw: unknown): HeliSkiFilters {
  const input = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw as Record<string,unknown> : {};
  const filters = {...defaultHeliSkiFilters};
  for (const key of keys) if (typeof input[key] === 'string' && heliSkiFilterOptions[key].some(([value])=>value===input[key])) (filters as Record<string,string>)[key]=input[key] as string;
  return filters;
}
export function readHeliSkiUrlSettings(search: unknown) {
  const params = new URLSearchParams(typeof search === 'string' ? search : '');
  const raw: Record<string,string> = {}, invalidKeys: string[] = [];
  for (const key of keys) {
    const values=params.getAll(heliSkiUrlKeys[key]);
    if (!values.length) continue;
    if (values.length!==1 || !heliSkiFilterOptions[key].some(([value])=>value===values[0])) invalidKeys.push(key);
    else raw[key]=values[0];
  }
  return {filters:normaliseHeliSkiFilters(raw),invalidKeys};
}
export function buildHeliSkiShareUrl(raw: unknown = {}): string {
  const filters=normaliseHeliSkiFilters(raw),url=new URL('https://banffbound.com/blog/banff-heli-skiing/');
  for (const key of keys) if (filters[key]!==defaultHeliSkiFilters[key]) url.searchParams.set(heliSkiUrlKeys[key],filters[key]);
  url.hash='heli-ski-planner';
  return url.href;
}
export const heliSkiOperators = [
  {id:'purcell',name:'CMH Purcell',base:'Golden, British Columbia',address:'438 Lafontaine Road, Golden, BC',
    idea:'A Golden-based day programme with a self-drive staging arrangement. Compare this journey separately from Panorama.',
    transport:'CMH describes Purcell as self-drive. Transportation and overnight accommodation are not included. A separately arranged driver or transfer needs its own written confirmation.',
    equipment:'Bring your own ski or snowboard boots. Purcell lists powder skis/poles and a safety pack; its snowboard supply is limited, so request a board ahead of time.',
    meals:'The Purcell page conflicts on meals: programme inclusions list lunch/snacks, while lower lodging copy says meals are excluded. Ask CMH to confirm food in your selected written quote.',
    terms:'Ask which season and programme terms apply to the Purcell day booking. Guest cancellation, operator cancellation and unachieved vertical are separate questions; do not transfer a lodge/private-trip policy to every day product.',
    href:heliSkiSources.cmhContact,linkLabel:'Enquire directly with CMH about Purcell',sources:[['Purcell programme and staging',heliSkiSources.purcell],['Booking terms by season/programme',heliSkiSources.cmhTerms],['Guest cancellation',heliSkiSources.cmhCancellation],['Vertical and refunds',heliSkiSources.cmhVertical]]},
  {id:'rk',name:'RK Heliski',base:'Panorama, British Columbia',address:'2045 Greywolf Drive, Panorama, BC',
    idea:'A Panorama-based day programme with separately priced Banff/Lake Louise transfer enquiries. Compare the full travel and ski booking together.',
    transport:'RK publishes Banff and Lake Louise shuttles requiring a minimum of 5 guests overall, plus private-shuttle enquiries. Confirm the actual departure, minimum, pickup and return; a request is not a reserved seat.',
    equipment:'Bring your own ski or snowboard boots. RK lists optional powder skis/poles or a snowboard and a mandatory guest safety pack; confirm the requested equipment for the selected package.',
    meals:'Confirm the actual breakfast/lunch, dietary enquiry and check-in arrangements for your selected package. A transfer reservation does not establish meal or ski inclusions.',
    terms:'RK distinguishes non-refundable guest-cancellation payments from operator no-fly/shortened-day provisions. Banff/Lake Louise transport charges are not refunded when weather, mechanical or avalanche conditions prevent flying.',
    href:heliSkiSources.rkEnquiry,linkLabel:'Send a direct RK booking enquiry',sources:[['Panorama address and arrival',heliSkiSources.rkArrival],['Transfer minimum and cancellation scope',heliSkiSources.rkTransfer],['Equipment',heliSkiSources.rkEquipment],['Booking and refund terms',heliSkiSources.rkTerms],['Programme questions',heliSkiSources.rkFaq]]},
] as const;
const baseLabels:Record<HeliSkiFilters['base'],string>={banff:'Banff town',canmore:'Canmore',louise:'Lake Louise area',golden:'Golden / Kicking Horse area',panorama:'Panorama / Invermere area',other:'another base or not decided'};
function operatorQuestions(id:'purcell'|'rk',filters:HeliSkiFilters) {
  const operator=heliSkiOperators.find(operator=>operator.id===id)!;
  const local=id==='purcell'&&filters.base==='golden'||id==='rk'&&filters.base==='panorama';
  const journey=local?`Your chosen area is near this operator’s base, but use the actual lodging and staging addresses. Confirm the check-in time and time zone, local road and return; a nearby area label is not a door-to-door journey.`:`From ${baseLabels[filters.base]}, plan the complete journey to ${operator.address}. Confirm the check-in time and time zone, road reports and return before committing to a same-day connection. No travel time or arrival feasibility is calculated.`;
  let transfer:string;
  if(filters.transport==='self-drive') transfer=`Confirm your actual vehicle, route, winter equipment, parking and check-in instructions. ${id==='purcell'?'Purcell’s published arrangement is self-drive.':'RK also accepts self-drive guests; a ski booking does not reserve a shuttle.'} Leave flexibility if road or flight operations change.`;
  else if(filters.transport==='confirmed') transfer=id==='purcell'?'You selected a separate transfer confirmation. Purcell does not include transport: verify the named provider, actual date, pickup, staging arrival, return and cancellation terms. This tool has not checked your confirmation.':'You selected a separate transfer confirmation. Recheck that RK or your provider confirmed the actual date, pickup, return and applicable minimum; this tool has not checked your confirmation. RK’s published no-fly transport-charge exclusion still needs attention.';
  else if(id==='purcell') transfer='Purcell does not include transport. Ask CMH about the staging requirements and arrange an independent road journey if needed. A shuttle offered by another operator is not a CMH Purcell transfer.';
  else if(filters.base==='banff'||filters.base==='louise') transfer='Ask RK about the published Banff/Lake Louise transfer for your date. Its shared shuttle requires a minimum of 5 guests overall; ask whether that minimum is met, rather than assuming your own party must fill it. Confirm the total charge and return separately from the ski package.';
  else transfer='RK’s published shared-transfer origins are Banff and Lake Louise. A Canmore, Golden, Panorama or other stay does not establish pickup there. Ask about a private/local arrangement or self-drive and obtain the actual date, pickup and return in writing.';
  const overnight=filters.overnight==='near-base'?`Compare an overnight near ${operator.base} before the ski day and, if useful, after it. Confirm the actual lodging-to-staging leg; accommodation is a separate purchase, not supplied by this chooser.`:filters.overnight==='same-day'?'Check the complete outward and return plan against the operator’s check-in and likely changes to the day. Keep the option of an overnight or changed outing if the journey no longer fits; an early meeting or a transfer quote is not a guaranteed same-day connection.':`Decide whether sleeping near ${operator.base} better fits the confirmed meeting and return. Compare the whole trip, including a weather change, instead of treating a helicopter seat as the complete day.`;
  const equipment=filters.equipment==='ski'?'Bring your own ski boots. Ask for the correct powder-ski length, binding compatibility and poles; confirm the operator-supplied safety equipment and required training.':filters.equipment==='snowboard'?`Bring your own snowboard boots. ${id==='purcell'?'CMH’s boards are limited: request one ahead and obtain confirmation, or discuss your own board.':'Ask RK to confirm the board and setup for the actual package, or discuss your own board.'} Confirm the safety pack and training separately.`:'Choose ski or snowboard with the operator, then confirm equipment and compatibility. Both require your own boots; catalogue equipment inclusion is not confirmation of a particular board or size.';
  return {id,journey,transfer,overnight,equipment};
}
export function buildHeliSkiPlan(raw:unknown={}) {
  const filters=normaliseHeliSkiFilters(raw);
  const selectedIds=heliSkiOperators.filter(operator=>filters.operator==='all'||operator.id===filters.operator).map(operator=>operator.id);
  const operatorPlans=heliSkiOperators.map(operator=>operatorQuestions(operator.id,filters));
  const notes=['These are logistics questions, not ability, terrain, avalanche, availability or transport approval. The operator must assess your experience and confirm the actual programme.', 'No names, dates, party sizes, health details or booking references are collected. Add required information only through the operator’s own enquiry process.'];
  const steps=['Confirm the programme and ability requirements with the operator before buying dependent travel.','Obtain the exact staging/pickup, check-in time and time zone, equipment, food and written total.','Read guest cancellation, no-fly/shortened-day and transfer terms separately, then arrange the full return and any overnight.'];
  const labels=keys.map(key=>`${key}: ${heliSkiFilterOptions[key].find(([value])=>value===filters[key])![1]}`);
  const brief=['Heli-ski logistics enquiry outline — public preferences only',...labels,'Please confirm the actual date, party requirements and ability directly; this outline is not a reservation or a suitability assessment.',...selectedIds.flatMap(id=>{const operator=heliSkiOperators.find(operator=>operator.id===id)!,questions=operatorPlans.find(plan=>plan.id===id)!;return [`\n${operator.name} — ${operator.address}`,`Journey: ${questions.journey}`,`Transport: ${questions.transfer}`,`Overnight: ${questions.overnight}`,`Equipment: ${questions.equipment}`,`Food: ${operator.meals}`,`Terms: ${operator.terms}`,`Direct enquiry: ${operator.href}`];}),'\nBefore sending: add your actual dates/party and relevant experience privately through the operator’s official process. Ask for the full quote, confirmations and terms.'].join('\n');
  return {filters,selectedIds,operatorPlans,notes,steps,brief,shareUrl:buildHeliSkiShareUrl(filters)};
}
export const heliSkiPlanningFaqs = [
  {question:'Does this chooser approve me for heli-skiing?',answer:'No. It changes logistics questions using public preferences. The operator must discuss your actual experience, fitness and programme requirements, and determine the day’s terrain and operations. A resort ability label, selected transport or a completed enquiry outline does not establish approval.'},
  {question:'Does CMH Purcell include transport and accommodation?',answer:'The Purcell programme is described as self-drive, with transportation and overnight accommodation excluded. Its day lodge is at 438 Lafontaine Road in Golden. Arrange the real staging journey separately; a transfer published by another heli-ski operator does not apply to CMH.'},
  {question:'Is RK’s Banff or Lake Louise transfer guaranteed?',answer:'No. RK publishes a shared-shuttle minimum of 5 guests overall and separate private-shuttle enquiries. Confirm whether the minimum is met, your actual pickup, date, return and total. Its transport charge is not refunded when weather, mechanical or avalanche conditions prevent flying, even though ski-package no-fly provisions are separate.'},
  {question:'What equipment and food should I confirm?',answer:'Both operators require your own ski or snowboard boots. Confirm the actual skis or board, compatibility, safety equipment and training. CMH’s snowboard supply is limited and needs an advance request. The Purcell page conflicts on meals, so obtain written food inclusions for the selected booking rather than assuming either all food or no food is supplied.'},
  {question:'Does sharing or copying this plan send an operator enquiry?',answer:'No. Sharing copies only the allowlisted public choices into a BanffBound link. Copying the enquiry outline produces text for you to review and use yourself. Neither action contacts a provider, stores a booking, establishes a transfer confirmation or sends personal information.'},
] as const;
const esc=(value:string)=>value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const initial=buildHeliSkiPlan();
const labels={operator:'Operator comparison',base:'Starting area',transport:'Transport plan',overnight:'Overnight plan',equipment:'Equipment questions'};
const controls=keys.map(key=>`<div><label for="heli-ski-${key}">${labels[key]}</label><select id="heli-ski-${key}" name="${key}">${heliSkiFilterOptions[key].map(([value,label])=>`<option value="${value}">${esc(label)}</option>`).join('')}</select></div>`).join('');
const cards=heliSkiOperators.map(operator=>{const questions=initial.operatorPlans.find(plan=>plan.id===operator.id)!;return `<article class="heli-ski-card" data-heli-operator="${operator.id}" aria-labelledby="heli-ski-name-${operator.id}"><h3 id="heli-ski-name-${operator.id}">${operator.name}</h3><p><strong>${esc(operator.address)}</strong></p><p>${esc(operator.idea)}</p><dl><div><dt>Published transport</dt><dd>${esc(operator.transport)}</dd></div><div><dt>Equipment and food</dt><dd>${esc(operator.equipment)} ${esc(operator.meals)}</dd></div><div><dt>Booking terms</dt><dd>${esc(operator.terms)}</dd></div></dl><h4>Questions for your plan</h4>${(['journey','transfer','overnight','equipment'] as const).map(key=>`<p data-heli-${key}>${esc(questions[key])}</p>`).join('')}<a class="heli-ski-action" href="${operator.href}" target="_blank" rel="noopener noreferrer">${operator.linkLabel} →</a><ul class="heli-ski-sources">${operator.sources.map(([label,href])=>`<li><a href="${href}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a></li>`).join('')}</ul></article>`;}).join('');
export const heliSkiPlannerHtml=`<section id="heli-ski-planner" class="heli-ski-planner" aria-labelledby="heli-ski-planner-title"><h2 id="heli-ski-planner-title">Build the journey around the heli-ski day</h2><p>Compare the Golden and Panorama arrangements, then tailor the questions to your starting area, transport, overnight and equipment. All two-operator information and direct enquiry links are available without JavaScript. Changing your base never chooses an operator or approves a same-day journey.</p><form id="heli-ski-form" hidden>${controls}<div class="heli-ski-actions"><button type="submit" class="btn btn-primary">Update logistics questions</button><button type="reset">Reset choices</button><button id="heli-ski-copy-link" type="button">Copy settings link</button><button id="heli-ski-copy-brief" type="button">Copy enquiry outline</button></div></form><p id="heli-ski-url-note" role="status" hidden></p><p id="heli-ski-status" role="status" aria-live="polite">2 operators to compare; no booking or ability approval</p><div id="heli-ski-notes">${initial.notes.map(note=>`<p>${esc(note)}</p>`).join('')}</div><div class="heli-ski-grid">${cards}</div><aside class="heli-ski-summary"><h3>Join the confirmations together</h3><ol id="heli-ski-steps">${initial.steps.map(step=>`<li>${esc(step)}</li>`).join('')}</ol><p id="heli-ski-copy-status" role="status" aria-live="polite"></p><div id="heli-ski-copy-fallback" hidden><label id="heli-ski-copy-label" for="heli-ski-copy-text">Text to copy</label><textarea id="heli-ski-copy-text" rows="10" readonly></textarea></div><p>Settings links contain only these public choices. They exclude other address-bar parameters, booking details and checklist history. Copying does not contact an operator.</p></aside><aside class="heli-ski-cat" aria-labelledby="heli-ski-cat-title"><h3 id="heli-ski-cat-title">Heli-skiing or cat-skiing?</h3><p>A guided heli-ski day uses helicopter access. Cat-skiing uses a snowcat for uphill access; it is a different booking and base, not an automatic alternative for a cancelled flight.</p><p><a href="${heliSkiSources.kpow}" target="_blank" rel="noopener noreferrer">KPOW at Fortress — direct operator information</a> describes guided cat-skiing in Kananaskis for strong intermediate to advanced skiers and snowboarders in variable conditions. At review its page still displayed 2025/26 booking and season information, with inconsistent year text. Ask for the actual 2026/27 programme, access, equipment and terms; no current departure, powder or terrain approval is established here.</p></aside><p class="heli-ski-review">Operator logistics reviewed <time datetime="${heliSkiReviewedAt}">29 October 2026</time>. Direct operator links are information/enquiry routes, not affiliate flight offers. Use <a href="/blog/banff-winter-driving/">winter driving preparation</a>, <a href="/towns/golden/">Golden</a> and <a href="/towns/kananaskis/">Kananaskis base planning</a> for separate journey context; a town guide is not a transfer booking. For Panorama, use RK’s own arrival and accommodation information.</p></section>`;
export const heliSkiPlanningFaqHtml=`<section class="heli-ski-planner heli-ski-faq" aria-labelledby="heli-ski-faq-title"><h2 id="heli-ski-faq-title">Heli-ski logistics questions</h2>${heliSkiPlanningFaqs.map(faq=>`<details><summary>${esc(faq.question)}</summary><p>${esc(faq.answer)}</p></details>`).join('')}<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'FAQPage',mainEntity:heliSkiPlanningFaqs.map(faq=>({'@type':'Question',name:faq.question,acceptedAnswer:{'@type':'Answer',text:faq.answer}}))}).replace(/</g,'\\u003c')}</script></section>`;
