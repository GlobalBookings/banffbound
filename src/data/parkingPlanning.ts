import { parkingLots, parkingSources, type ParkingSeason } from './parkingData';

export interface ParkingChoices {
  destination: string; season: ParkingSeason; travel: 'unsure' | 'vehicle' | 'carfree';
  base: 'banff' | 'canmore' | 'lake-louise' | 'other'; timing: 'day' | 'early-late';
  mobility: boolean; children: boolean; largeVehicle: boolean;
}
export const defaultParkingChoices: ParkingChoices = { destination: 'all', season: 'unsure', travel: 'unsure', base: 'banff', timing: 'day', mobility: false, children: false, largeVehicle: false };
export function normaliseParkingChoices(value: unknown = {}): ParkingChoices {
  const input = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const choose = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T => allowed.includes(value as T) ? value as T : fallback;
  const travel = choose(input.travel, ['unsure', 'vehicle', 'carfree'], 'unsure');
  return {
    destination: typeof input.destination === 'string' && (input.destination === 'all' || parkingLots.some(lot => lot.id === input.destination)) ? input.destination : 'all',
    season: choose(input.season, ['unsure', 'winter', 'summer', 'shoulder'], 'unsure'), travel,
    base: choose(input.base, ['banff', 'canmore', 'lake-louise', 'other'], 'banff'),
    timing: choose(input.timing, ['day', 'early-late'], 'day'),
    mobility: input.mobility === true, children: input.children === true,
    largeVehicle: travel === 'vehicle' && input.largeVehicle === true,
  };
}
export function buildParkingPlan(input: unknown = {}) {
  const choices = normaliseParkingChoices(input);
  const lot = parkingLots.find(item => item.id === choices.destination);
  const winterMoraine = lot?.id === 'moraine-lake' && choices.season === 'winter';
  const steps: string[] = [];
  if (lot) {
    steps.push(lot.parkingPlan);
    if (lot.notice) steps.push(lot.notice);
    if (choices.season !== 'unsure') steps.push(lot.seasonAdvice[choices.season]);
    else steps.push('Choose the actual travel date and seasonal programme before relying on any parking, road or bus arrangement.');
    if (choices.travel === 'carfree') steps.push(winterMoraine ? 'For a Lake Louise-only winter alternative, check the actual Roam 8X stop and return. Do not attach the seasonal Lake Connector to that journey.' : lot.transitPlan);
    else if (choices.travel === 'vehicle') steps.push(lot.vehicleNote);
    else steps.push('Compare the driving/parking arrangement with the stated transit or booked-transfer option below.');
    steps.push(winterMoraine ? 'After choosing a different winter destination, establish its own final return and save the boarding point and contacts offline.' : lot.returnPlan);
    if (choices.mobility) steps.push(winterMoraine ? 'The seasonal Parks accessible shuttle is not a winter lake transfer. Confirm the vehicle and final approach for the alternative you actually choose.' : lot.accessNote);
  } else {
    steps.push('Choose an actual destination to see its parking, seasonal transport and return checks. All eleven destination guides remain below.');
    steps.push('A national park pass, attraction ticket, paid-parking receipt and bus reservation are different products. Check exactly what each purchase includes.');
  }
  if (choices.travel === 'carfree' && choices.base === 'canmore') steps.push('From Canmore, Roam 3 connects to Banff. Check the current stop, onward route and final return connection separately; an attraction bus back to Banff is not the whole journey home.');
  if (choices.travel === 'carfree' && choices.base === 'lake-louise') steps.push('Lake Louise village, lakeshore and ski-resort Park and Ride are separate places. Confirm the actual boarding point and any final transfer instead of assuming you can walk between them.');
  if (choices.travel === 'carfree' && choices.base === 'other') steps.push('Confirm how you reach the service’s real departure base and return there. A tour or bus described as “Banff” may not collect at your accommodation.');
  if (choices.travel === 'vehicle') steps.push('If a designated lot cannot accommodate you, continue to another legal, independently planned destination. Do not wait on a highway shoulder or treat a neighbouring property as overflow.');
  if (choices.largeVehicle) steps.push('For the RV, trailer or high vehicle, confirm dimensions, turning space, designated stalls and the storage/return rules before setting out. In Banff, the Town directs RVs to suitable Train Station parking rather than downtown.');
  if (choices.children) steps.push('Confirm the selected operator’s child-ticket, restraint and equipment rules, plus stroller storage, toilets, waiting time and warm-up needs. Include every person when checking a reservation.');
  if (choices.mobility) steps.push('Confirm the actual vehicle, mobility-device fit, companion space, assistance and final pedestrian surface. An accessible placard or ramp-equipped bus does not reserve space or assess the whole visit.');
  if (choices.timing === 'early-late') steps.push('Check the first departure, last usable return, parking gates and road restrictions for the date. An early attraction booking or late hike does not extend a bus timetable; arrange a confirmed alternative before paying.');
  steps.push('Before leaving, recheck official road/service/closure updates and save your ticket, meeting point and return contacts offline. This planner supplies no occupancy or availability estimate.');
  return {
    choices, heading: lot ? `${lot.name}: your journey checks` : 'Build a parking and transport plan',
    selectedIds: lot ? [lot.id] : parkingLots.map(item => item.id), steps,
    links: [...(lot?.sources || [parkingSources.town, parkingSources.lakes]), ...(choices.travel === 'carfree' && choices.base === 'canmore' ? [parkingSources.roam3] : []), ...(choices.mobility ? [parkingSources.roamPolicy] : [])].filter((source, index, all) => all.findIndex(item => item.url === source.url) === index),
  };
}

export const parkingFaqs = [
  { question: 'Can this planner tell me whether a parking space will be available?', answer: 'No. It supplies destination-specific parking, access and transport planning. It does not have a verified live occupancy feed or a defensible fill-time prediction. Check official sources and follow current signs and staff directions.' },
  { question: 'Can I drive a private or rental car to Moraine Lake by arriving early?', answer: 'Moraine Lake Road is closed to personal vehicles year-round. Parks lists authorised shuttles, licensed commercial operators with the required road permission and registered Moraine Lake Lodge guests. Early arrival and an accessible placard are not general access exceptions.' },
  { question: 'Does paid parking or a park pass reserve a space?', answer: 'No. Park admission, parking payment, attraction admission and transport reservations have different terms. Confirm which product you need; an ordinary parking receipt is not a reservation for another lot or a bus.' },
  { question: 'Can I use summer buses for a winter lake or ski visit?', answer: 'Check the actual service. Parks lake shuttles and Roam 4 and 6 are seasonal; Roam 8X serves Lake Louise with a separate timetable. Ski-resort shuttles are separate services, and none of those labels establishes a winter Moraine Lake journey.' },
];

export function buildLakeJourney(value: unknown = {}) {
  const input = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const base = ['banff', 'canmore', 'lake-louise', 'other'].includes(String(input.base)) ? String(input.base) : 'banff';
  const destination = ['louise', 'moraine', 'both'].includes(String(input.destination)) ? String(input.destination) : 'both';
  const season = ['winter', 'summer', 'unsure'].includes(String(input.season)) ? String(input.season) : 'unsure';
  const mobility = input.mobility === true;
  const early = input.early === true;
  const steps: string[] = [];
  const wantsMoraine = destination !== 'louise';
  if (season === 'winter') {
    steps.push('The Parks lake shuttle and Lake Connector are seasonal summer services, not a winter Moraine Lake connection. Check the actual Roam 8X timetable for Lake Louise lakeshore.');
    if (wantsMoraine) steps.push('Choose a different winter destination instead of a private-car, walking or cycling workaround to Moraine Lake. A closed road and a designated winter route do not establish access to the lake.');
  } else if (season === 'summer') {
    steps.push('First confirm an operating season and reservation product for the actual travel year. The reviewed Parks pages describe the ended 2026 season; no 2027 Parks launch or service dates are verified here.');
    if (base === 'banff' || base === 'canmore') steps.push(wantsMoraine ? 'Compare a date-valid Roam Super Pass journey via 8X and the Lake Connector with an authorised commercial departure from your actual pickup. A regular 8X ticket alone is not a connector reservation.' : 'Compare a reserved Roam 8X journey to Lake Louise lakeshore with a confirmed commercial transfer. Check the return as well as the outward seat.');
    else steps.push('Compare a regular Parks reservation starting at the ski-resort Park and Ride with an authorised commercial operator. Reaching Lake Louise village or lakeshore is not check-in at the Park and Ride.');
  } else steps.push('Set the actual date and check which services are published for that year. Roam 8X, the Parks Park and Ride service, the Lake Connector and Alpine Start are different arrangements; do not select from an old countdown.');
  if (base === 'canmore') steps.push('If using Roam, include Route 3 between Canmore and Banff plus the onward 8X reservation and the final Route 3 return. Verify the current stop and transfer times; do not assume a through pickup.');
  if (base === 'lake-louise') steps.push('Confirm how you reach the exact departure point from your Lake Louise accommodation. Village, lakeshore and ski-resort Park and Ride are separate locations with different access.');
  if (base === 'other') steps.push('Arrange the full journey to the selected pickup or Park and Ride, including vehicle parking, time limits and the final return to your original base.');
  if (mobility) steps.push(season === 'winter' ? 'Ask Roam or the selected operator about the actual vehicle, device fit, companion space and final lakeshore surface. Do not rely on the seasonal Parks accessible shuttle for a winter journey.' : 'The regular 2026 Parks service provided an on-demand accessible vehicle at Park and Ride check-in with a purchased ticket; its Alpine Start product did not. Confirm the actual future service, device fit, companion space and final approach before paying.');
  if (early) steps.push(season === 'winter' ? 'Check the first 8X or commercial departure and last usable return. An early activity booking does not create a bus service; arrange a confirmed transfer if schedules do not fit.' : 'Alpine Start was a separate 2026 product departing the upper Lake Louise lakeshore lot, with its own paid parking and return instructions. Do not go to the regular Park and Ride for that product or assume it operates in a future season.');
  steps.push('Save tickets, the exact first boarding location, every connection and the last usable return offline. Leave time for queues, the final path and equipment; no connection or seat is guaranteed by this planning tool.');
  return { base, destination, season, mobility, early, heading: season === 'winter' ? 'Winter lake-journey checks' : 'Your lake-journey checks', steps };
}
export const shuttleFaqs = [
  { question: 'Are Parks Canada lake shuttles running now?', answer: 'This guide does not report live operation. At the 29 October 2026 review, Parks published the completed 2026 season ending October 12. No 2027 reservation-launch or operating dates are verified here. Check Parks Canada for your actual year and date.' },
  { question: 'Can I drive to Moraine Lake in a private or rental car?', answer: 'Moraine Lake Road is closed to personal vehicles year-round. Parks lists authorised Parks shuttles, licensed commercial operators with the required road licence and registered Moraine Lake Lodge guests. Follow the specific authorised arrangement; early arrival or an accessible placard is not a general exception.' },
  { question: 'Where does a regular Parks lake shuttle depart?', answer: 'The regular reserved service uses the Lake Louise Ski Resort Park and Ride, where passengers check in. It is separate from Lake Louise village and lakeshore. The published 2026 Alpine Start product instead departed the upper lakeshore parking lot.' },
  { question: 'Does a Roam 8X ticket include Moraine Lake?', answer: 'A normal 8X ticket is a Banff–Lake Louise journey. Connector access requires an eligible ticket, such as the date-valid seasonal Super Pass under its actual terms. The reviewed Super Pass page states its 2026 period; do not assume an ordinary 8X fare or a winter ticket includes Moraine access.' },
  { question: 'Are accessible shuttle arrangements the same for Alpine Start?', answer: 'No. The regular 2026 Parks service offered an on-demand accessible vehicle at the Park and Ride with a purchased ticket; the 2026 Alpine Start product had no accessible vehicle. Confirm the actual season’s service, device, companion and final-approach arrangements directly.' },
  { question: 'Can I cycle or walk to Moraine Lake when the shuttle is unavailable?', answer: 'This guide does not provide a winter cycling or walking workaround. The road has seasonal restrictions, avalanche terrain and designated winter-route limits. Check Parks Canada’s actual route and access information, and choose a different destination when your visitor transport plan does not work.' },
  { question: 'What if my chosen reservation is unavailable?', answer: 'Check the actual year’s release and cancellation process, compare a verified authorised operator or plan a Lake Louise-only or town-based outing. A tour marketplace result does not confirm road permission, operation, eligibility or transport from your accommodation.' },
];
