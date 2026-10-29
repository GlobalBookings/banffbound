/** Original experience comparisons. Product identity checked against GYG; practical facts use operators. */
export const winterActivityLandingId = 'banff-winter-activities';
export const winterActivityReviewedAt = '2026-10-29';
export const winterActivityCampaign = 'banffboundwinteractivities';
export const winterActivityPartnerId = 'QW960HO';
export const winterActivityClosureSource = 'https://parks.canada.ca/pn-np/ab/banff/bulletins/06d4ef61-a3c9-4b65-8dfc-66d056252d6c';

export function winterActivityBookingUrl(productUrl: string): string {
  const url = new URL(productUrl);
  if (url.origin !== 'https://www.getyourguide.com' || !/^\/banff-l284\/[a-z0-9-]+-t\d+\/$/.test(url.pathname) || url.search || url.hash) throw new Error('Expected a verified GetYourGuide product URL.');
  url.searchParams.set('partner_id', winterActivityPartnerId);
  url.searchParams.set('cmp', winterActivityCampaign);
  return url.href;
}
export const winterActivityOffers = [
  {
    id: 'gyg-303253', productId: '303253', experienceType: 'icewalk', anchor: 'johnston-icewalk',
    name: 'Guided Johnston Canyon Icewalk', provider: 'Discover Banff Tours', needsCanyonCheck: true, format: 'Guided outdoor walk',
    productTitle: 'Banff: Morning or Afternoon Johnston Canyon Icewalk',
    productUrl: 'https://www.getyourguide.com/banff-l284/banff-morning-or-afternoon-johnston-canyon-icewalk-t303253/',
    operatorUrl: 'https://banfftours.com/activities/johnston-canyon-icewalk/',
    fit: 'Choose the canyon walk when the walk itself is the main event: a guide-led winter outing through Johnston Canyon rather than a sightseeing ride or a multi-stop road day.',
    experience: 'The operator describes a guided walk using the canyon paths and catwalks, with ice cleats and transport from Banff. Frozen-waterfall scenery depends on the season and conditions; your guide determines the permitted route.',
    tradeoff: 'This involves sustained outdoor walking and winter footing. A gondola admission is a different choice for a group that wants a ride-based attraction with time inside.',
    transport: 'Confirm the actual Banff pickup or meeting point shown for the selected departure. Staying in Canmore, Lake Louise or Calgary does not establish pickup there.',
    group: 'Before paying, check the chosen product’s age and mobility requirements, winter footwear, equipment inclusions and everyone’s comfort with snowy paths and heights.',
    bookingCheck: 'Check the current canyon closure and ask how the operator handles your date or a route change. A published departure calendar does not override Parks restrictions.',
    cta: 'Choose an icewalk date on GetYourGuide',
  },
  {
    id: 'gyg-256607', productId: '256607', experienceType: 'summit', anchor: 'banff-gondola',
    name: 'Banff Gondola admission', provider: 'Pursuit Collection', needsCanyonCheck: false, format: 'Attraction admission',
    productTitle: 'Banff: Banff Gondola Admission Ticket',
    productUrl: 'https://www.getyourguide.com/banff-l284/banff-banff-gondola-admission-ticket-t256607/',
    operatorUrl: 'https://www.banffjaspercollection.com/attractions/banff-gondola/',
    fit: 'Choose the gondola when your main goal is a mountain sightseeing ride and a visit to the summit complex, with flexibility to spend time indoors or on the permitted outdoor viewing areas.',
    experience: 'The attraction takes visitors up Sulphur Mountain from Mountain Avenue in Banff. The summit has indoor interpretive spaces and outdoor viewing areas; visibility and access to outdoor sections vary with the weather.',
    tradeoff: 'Admission is an attraction visit, rather than a guided canyon walk or a day tour between destinations. Meals, special packages and transport must be checked against the actual ticket.',
    transport: 'Plan how to reach the Mountain Avenue base and return afterwards. Check current Route 1 and operator transport information; a summer free-shuttle promotion does not establish winter inclusion.',
    group: 'For mobility needs, clarify cabin access, the indoor visit and any outdoor boardwalk or steps separately. A general accessibility label does not establish that every summit feature suits everyone.',
    bookingCheck: 'Select the ticket and arrival time, then read its actual cancellation terms. Check operating hours and visibility expectations before committing; there is no promised clear view.',
    cta: 'Choose gondola tickets on GetYourGuide',
  },
  {
    id: 'gyg-437912', productId: '437912', experienceType: 'road-day', anchor: 'winter-wonderland',
    name: 'Lake Louise & Johnston Canyon winter outing', provider: 'Radventures', needsCanyonCheck: true, format: 'Guided road trip with outdoor stops',
    productTitle: 'From Banff: Winter Wonderland; Lake Louise & Johnston Canyon',
    productUrl: 'https://www.getyourguide.com/banff-l284/from-banff-winter-wonderland-lake-louise-johnston-canyon-t437912/',
    operatorUrl: 'https://www.radventurescanada.com/day-tours/winter-wonderland/',
    fit: 'Choose this outing when you want a guided winter day linking Lake Louise and the Johnston Canyon area, with transport between stops instead of arranging each journey yourself.',
    experience: 'Radventures describes a winter road outing with guided outdoor stops, winter equipment and selected Banff pickup locations. Its route and outdoor activities respond to conditions; skating or snowshoeing is not guaranteed for every departure.',
    tradeoff: 'A multi-stop outing commits more of the day to the road and the group itinerary. Choose the standalone icewalk if the canyon is your priority, or gondola admission if you want a single attraction.',
    transport: 'Use the meeting or pickup instructions for the GetYourGuide option you select. Confirm any hotel request with the operator; its direct-booking pickup list is not proof that every reseller option includes the same collection.',
    group: 'Discuss the walking, cold-weather stops, ages, mobility needs and any requested skate equipment before paying. Ask about food and equipment in the selected listing rather than transferring inclusions from another sales channel.',
    bookingCheck: 'Confirm the current route around canyon construction and which Lake Louise activities are intended for your date. Do not book on an assumption of accessible natural lake ice or guaranteed wildlife.',
    cta: 'Choose winter-tour dates on GetYourGuide',
  },
].map(offer => ({ ...offer, bookingUrl: winterActivityBookingUrl(offer.productUrl) }));

export const winterActivityFaqs = [
  { question: 'Which experience should I choose for a non-ski day?', answer: 'Choose the icewalk for a guided outdoor walk, the gondola for a ride-based mountain attraction, or the Radventures outing for a guided road day with outdoor stops. Compare the walking, weather exposure and transport with everyone in the group before choosing a date.' },
  { question: 'Does a tour include pickup from my hotel?', answer: 'Use the pickup or meeting point on the specific option you select. Banff, Canmore, Lake Louise and Calgary are different starting locations. Confirm a hotel request and the return with the provider instead of assuming door-to-door collection.' },
  { question: 'Are the canyon and lake activities available on every winter date?', answer: 'No. Closures, snow, ice and weather can change the route or activity. Check the dated Johnston Canyon notice and ask the operator about your departure. A listed product does not establish safe natural ice, an open route or a confirmed place on a specific date.' },
  { question: 'Where do I see the final price and cancellation policy?', answer: 'On GetYourGuide, select the date, participants and exact option, then read the total, inclusions, pickup instructions and terms before paying. These products can have different cancellation rules. BanffBound does not take your booking or payment.' },
];

/** Internal message-to-page planning, not an approval or launch record. */
export const winterActivityMessageMap = [
  { queryIntent: 'Banff winter activities / things to do in Banff in winter', promise: 'Compare three different winter experience formats and choose a date.', target: '#experiences' },
  { queryIntent: 'guided Johnston Canyon ice walk / Johnston Canyon winter tour', promise: 'Compare the guided canyon walk, its walking demands and date-specific access.', target: '#johnston-icewalk' },
  { queryIntent: 'Banff gondola winter tickets / Sulphur Mountain sightseeing tickets', promise: 'Find the attraction admission and plan the journey to Mountain Avenue.', target: '#banff-gondola' },
  { queryIntent: 'Banff Lake Louise winter day tour', promise: 'Compare the guided road outing, pickup and condition-dependent outdoor stops.', target: '#winter-wonderland' },
];

/** A preference filter only: no participant/date data or suitability/availability score. */
export const winterActivityExperienceOptions = [
  { value: 'all', label: 'All three experiences' },
  { value: 'icewalk', label: 'Guided icewalk' },
  { value: 'summit', label: 'Summit views' },
  { value: 'road-day', label: 'Guided road day' },
] as const;
export type WinterActivityExperience = typeof winterActivityExperienceOptions[number]['value'];
export function normaliseWinterActivityExperience(value: unknown): WinterActivityExperience {
  return typeof value === 'string' && winterActivityExperienceOptions.some(option => option.value === value)
    ? value as WinterActivityExperience : 'all';
}
export function buildWinterActivitySelection(value: unknown) {
  const experience = normaliseWinterActivityExperience(value);
  const offerIds = winterActivityOffers.filter(offer => experience === 'all' || offer.experienceType === experience).map(offer => offer.id);
  return { experience, offerIds };
}
