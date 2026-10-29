// Editorial preparation guidance, not sightings, a risk score or current trail status.
// Keep this module browser-compatible and independent of wildlifeZones.
export const wildlifeReviewedAt = '2026-10-29';

export const wildlifeSources = {
  viewing: 'https://parks.canada.ca/pn-np/ab/banff/visit/faune-wildlife/espace-space',
  safety: 'https://parks.canada.ca/pn-np/ab/banff/securite-safety',
  bears: 'https://parks.canada.ca/pn-np/mtn/ours-bears/securite-safety/ours-humains-bears-people',
  spray: 'https://parks.canada.ca/pn-np/mtn/ours-bears/securite-safety/gaz-spray',
  sprayTraining: 'https://www.alberta.ca/deterrents-bear-spray-and-noisemakers',
  elk: 'https://parks.canada.ca/pn-np/ab/banff/securite-safety/faunesecurite-wildlifesafety/wapiti-elk',
  elkSeasons: 'https://parks.canada.ca/agence-agency/bib-lib/politiques-policies/science/nature/nature04',
  carnivores: 'https://parks.canada.ca/pn-np/ab/banff/securite-safety/faunesecurite-wildlifesafety/securite-carnivores-safety',
  cougars: 'https://www.alberta.ca/cougars-and-outdoor-recreation',
  winter: 'https://parks.canada.ca/pn-np/ab/banff/activ/skidefond-xcski/banff',
  parkway: 'https://parks.canada.ca/pn-np/ab/banff/visit/les10-top10/promenade-de-la-vallee-de-la-bow-bow-valley-parkway',
  bulletins: 'https://parks.canada.ca/pn-np/ab/banff/bulletins',
  flights: 'https://www.catsa-acsta.gc.ca/en/travel-tips/outdoor-adventure',
  border: 'https://www.cbsa-asfc.gc.ca/publications/dm-md/d19/d19-13-2-eng.html',
  aircraft: 'https://tc.canada.ca/en/dangerous-goods/safety-awareness-materials-faq',
  roam: 'https://roamtransit.com/about-us/transportation-policies/',
  poison: 'https://www.canada.ca/en/health-canada/news/2023/03/canada-launches-new-toll-free-1-844-poison-x-number-for-poison-centres.html',
  disposal: 'https://banff.ca/1266/Transfer-Site',
  disposalCalgary: 'https://www.calgary.ca/waste/what-goes-where/chemicals-bear-spray.html',
} as const;

export const wildlifeDistanceGroups = [
  { id: 'carnivores', species: ['Bears', 'Wolves', 'Cougars', 'Coyotes'], metres: 100, source: wildlifeSources.viewing },
  { id: 'hoofed', species: ['Deer', 'Elk', 'Sheep', 'Moose'], metres: 30, source: wildlifeSources.viewing },
] as const;

export const wildlifeContacts = {
  emergency: { label: 'Emergency', phone: '911', href: 'tel:911', note: 'Immediate danger, an attack or an injury needing emergency help. Cell coverage is limited in the park.', source: wildlifeSources.safety },
  backcountryEmergency: { label: 'Emergency by satellite phone', phone: '403-762-4506', href: 'tel:+14037624506', note: 'Parks Canada lists this emergency number for satellite-phone users. Learn your device and emergency procedure before leaving.', source: wildlifeSources.winter },
  wildlifeReport: { label: 'Wildlife reporting — Banff Park Dispatch', phone: '403-762-1470', href: 'tel:+14037621470', note: 'Report bear, cougar, wolf and coyote encounters or sightings, and concerning wildlife behaviour, once you are safe. Give the location, species, description and behaviour.', source: wildlifeSources.safety },
} as const;

export const wildlifeSeasons = [
  {
    id: 'midwinter', title: 'January & February', months: [1, 2], season: 'Winter',
    summary: 'Winter does not remove wildlife preparation from a walking, skiing or snowshoeing day. Bears may wake briefly while denning; other wildlife remains active.',
    preparation: ['Observe tracks without following them towards an animal. Give wildlife room to move and feed.', 'Carry accessible bear spray on the trail and protect it from conditions outside its label limits.', 'Check the winter route, closures, weather and return transport. Snow and ice add hazards independent of wildlife.'],
    sourceKeys: ['winter', 'spray'],
  },
  {
    id: 'spring-transition', title: 'March & April', months: [3, 4], season: 'Winter to spring',
    summary: 'Plan for a transition rather than a fixed bear-emergence date. A calendar month cannot tell you whether an animal is active or a route is snow-free.',
    preparation: ['Refresh encounter advice before the first spring outing; do not wait for a reported sighting to prepare.', 'Check Bow Valley Parkway travel restrictions before a drive, cycle or walk. They also apply to people travelling without a car.', 'Choose daylight travel and make human voices heard, especially near running water, dense vegetation and blind corners.'],
    sourceKeys: ['bears', 'winter', 'parkway'],
  },
  {
    id: 'calving', title: 'May & June', months: [5, 6], season: 'Spring',
    summary: 'Elk calving is a particular concern in late spring. A cow and a hidden calf may be close to paths, lawns or buildings; a town setting does not make an elk tame.',
    preparation: ['Parks Canada’s general guidance places elk calving from mid-May to the end of June. Allow extra space and never get between a cow and calf.', 'Follow temporary closures and turn around when an animal blocks the route. Do not detour off trail towards wildlife.', 'Keep children with the group and dogs leashed; check whether dogs are permitted on the specific trail.'],
    sourceKeys: ['elkSeasons', 'elk', 'bears', 'bulletins'],
  },
  {
    id: 'summer', title: 'July & August', months: [7, 8], season: 'Summer',
    summary: 'Busy trails still cross wildlife habitat. Feeding areas and seasonal restrictions can change; neither a crowded path nor an early start makes an encounter predictable.',
    preparation: ['Read current trail restrictions, including any group-size requirements, rather than treating this calendar as an access report.', 'Keep food, rubbish and scented items controlled; never feed or lure an animal for a photograph.', 'Make noise with your voice. Parks Canada says bear bells are not enough; do not rely on a bell to announce your group.'],
    sourceKeys: ['bears', 'bulletins'],
  },
  {
    id: 'autumn', title: 'September & October', months: [9, 10], season: 'Autumn',
    summary: 'Fall is elk mating season. Bulls may defend groups of females and react aggressively. Maintain caution through autumn instead of using a predicted peak or end date.',
    preparation: ['Keep at least 30 metres from elk and increase the distance if an animal becomes alert or nervous. Never pass through a group.', 'Do not place yourself or a vehicle between a bull and females. Use a different route when needed.', 'Keep bear preparation in place and check advisories before each outing; the season does not guarantee sightings or absence.'],
    sourceKeys: ['elk', 'elkSeasons', 'bulletins', 'bears'],
  },
  {
    id: 'early-winter', title: 'November & December', months: [11, 12], season: 'Early winter',
    summary: 'Prepare for winter conditions without assuming all bears are asleep. Short daylight, changing trail surfaces and unreliable cell coverage affect a wildlife-aware outing.',
    preparation: ['Do not follow fresh tracks, crowd an animal or try to make it move for a photograph.', 'Tell someone your route and expected return, carry an emergency communication option you know how to use, and pack for delays.', 'Check route-specific winter hazards and closures. A wildlife calendar does not assess avalanche terrain or natural ice.'],
    sourceKeys: ['winter', 'viewing'],
  },
] as const;

export function getWildlifeSeason(month: unknown) {
  const value = typeof month === 'number' ? month : typeof month === 'string' && /^(?:[1-9]|1[0-2])$/.test(month) ? Number(month) : NaN;
  if (!Number.isInteger(value) || value < 1 || value > 12) return null;
  return wildlifeSeasons.find(season => (season.months as readonly number[]).includes(value)) ?? null;
}

export const bearSprayProviders = [
  { name: 'Bear Street Outfitters', location: '203A Bear Street, Banff', url: 'https://bearstreetoutfitters.com/Bear-Spray-Rentals', offer: 'Advertises both purchase and rentals from 1 to 30 days.', terms: 'Confirm stock, collection and return times, holster, deposit and demonstration directly.' },
  { name: 'Ultimate Sports', location: '206 Banff Avenue, Banff', url: 'https://ultimatebanff.com/faq/', offer: 'Advertises bear-spray rental. Its FAQ defines a rental day by store opening hours.', terms: 'The bear-spray FAQ requires ID, a credit card and a signed waiver; staff can give a use demonstration. Confirm an overnight or early-start arrangement.' },
  { name: 'Snowtips Bactrax', location: '225 Bear Street, Banff', url: 'https://snowtips-bactrax.com/camping-rentals/', offer: 'Advertises bear-spray rental, subject to equipment availability.', terms: 'Confirm availability for your season, return deadline and any charge if the can is discharged, damaged or returned late.' },
] as const;

export type BearSprayTransport = 'air' | 'road' | 'roam' | 'other';
export type BearSprayArrangement = 'rent' | 'buy' | 'unsure';
export function getBearSprayTravelAdvice(transport: unknown, arrangement: unknown) {
  const mode: BearSprayTransport | null = typeof transport === 'string' && ['air', 'road', 'roam', 'other'].includes(transport) ? transport as BearSprayTransport : null;
  const plan: BearSprayArrangement | null = typeof arrangement === 'string' && ['rent', 'buy', 'unsure'].includes(arrangement) ? arrangement as BearSprayArrangement : null;
  if (!mode || !plan) return null;
  const travel = {
    air: { title: 'Collect locally after your flight', text: 'Bear spray is prohibited in both carry-on and checked baggage on commercial flights. Arrange local collection after arrival and return or an approved disposal arrangement before flying home.', source: wildlifeSources.flights },
    road: { title: 'Secure the canister for the drive', text: 'Keep the safety clip in place and follow the label’s temperature and storage instructions. Parks Canada recommends the trunk or a sealed container. Do not leave it exposed to heat or puncture risk. Check CBSA rules before an international border crossing.', source: wildlifeSources.spray },
    roam: { title: 'Change storage between bus and trail', text: 'On Roam, keep bear spray properly sealed with its safety cap intact inside your bag for the whole ride. Do not hold it or leave it exposed. After leaving the bus, secure it in an accessible holster before starting the trail.', source: wildlifeSources.roam },
    other: { title: 'Ask the carrier before travelling', text: 'Private shuttles, tours, coaches and specialty aircraft have their own dangerous-goods procedures. Declare bear spray and obtain the operator’s instructions in advance; a local bus rule is not permission on another service.', source: wildlifeSources.aircraft },
  }[mode];
  const preparation = {
    rent: 'Before reserving, confirm ID and card requirements, any deposit, a compatible holster, a demonstration, return hours, and charges for use, damage or lateness. Ensure collection is possible before your first walk.',
    buy: 'Choose a Canadian-registered product labelled for bears, read that can’s instructions and expiry, and arrange its storage and eventual disposal. Ask the seller about eligibility and required identification. Purchase does not make it suitable for a flight.',
    unsure: 'Compare the actual total cost and logistics for your dates: collection, return, holster, deposit and unused-can disposal. There is no universal number of days when buying becomes better than renting.',
  }[plan];
  return { ...travel, preparation };
}

export const wildlifeSafetyFaqs = [
  { question: 'How far should I stay from wildlife in Banff?', answer: 'Parks Canada says at least 100 metres from bears, wolves, cougars and coyotes, and 30 metres from deer, elk, sheep and moose. Give more space if an animal reacts to you. These distances are not a guarantee of safety or permission to approach.' },
  { question: 'Should I play dead if a bear attacks?', answer: 'Parks Canada distinguishes defensive contact from a predatory attack. For defensive contact, lie face down, protect your neck, spread your legs and keep your pack on; remain still until the bear leaves. If the attack continues or is predatory, fight back. Do not play dead in a predatory attack. Read the full official guidance before your trip; species alone does not decide the response.' },
  { question: 'Which number reports wildlife in Banff?', answer: 'Once safe, report bear, cougar, wolf and coyote sightings or encounters and concerning wildlife behaviour to Banff Park Dispatch at 403-762-1470. Use 911 for an emergency. Parks Canada lists 403-762-4506 for emergency calls by satellite phone.' },
];

export const wildlifeCalendarFaqs = [
  { question: 'When is elk rut and calving season in Banff?', answer: 'Elk mating behaviour is a fall concern, and calving is a late-spring concern. Parks Canada’s general guidance gives mid-May to the end of June for calving and mid-September to the end of October for mating, while some local bulletins use different windows. Follow current advisories and give elk space in every season; no calendar date guarantees an animal is less defensive.' },
  { question: 'Do I need wildlife preparation in winter?', answer: 'Yes. Parks Canada says denning bears can wake for short periods, while cougars, wolves and other wildlife remain active. Carry bear spray, know its use, check the winter route and do not follow tracks towards animals.' },
  { question: 'Which month guarantees wildlife sightings?', answer: 'No month guarantees a sighting. This calendar describes seasonal preparation, not animal locations, frequency or a forecast. Plan a worthwhile outing that does not depend on finding an animal and follow current closures and viewing rules.' },
];

export const bearSprayFaqs = [
  { question: 'Can I bring bear spray on a flight to Calgary?', answer: 'Bear spray is prohibited in carry-on and checked baggage on commercial flights. Arrange local purchase or rental after arrival and a return or approved disposal arrangement before departure. Ask the carrier directly about any specialty aircraft transport; do not assume an exemption.' },
  { question: 'Can I rent bear spray in Banff?', answer: 'Bear Street Outfitters, Ultimate Sports and Snowtips Bactrax advertise bear-spray rental directly. Confirm availability for your dates, collection and return hours, identification, payment, deposit, holster and demonstration. This guide does not confirm stock or a live price.' },
  { question: 'Can I carry bear spray on Roam Transit?', answer: 'Roam requires bear spray to be properly sealed, with the safety cap intact, inside a passenger’s bag for the entire bus ride. Do not carry it in your hand or leave it exposed. After leaving the bus, move it to an accessible holster before starting a trail.' },
  { question: 'How do I learn to use bear spray?', answer: 'Read the instructions and expiry on the exact canister, watch Parks Canada’s demonstration and ask the provider for instruction and inert-can practice. Understand the safety clip, grip, range, wind effects and storage limits before setting out. Keep it accessible on the trail; never apply it to yourself or your gear.' },
];
