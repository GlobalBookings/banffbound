import { activityBookingOffers, activityCampaignPartnerId } from './activityCampaignTargets';
/** Identity comes from the central reviewed inventory; this module adds original comparisons. */
export const winterActivityLandingId = 'banff-winter-activities';
export const winterActivityReviewedAt = '2026-10-30';
export const winterActivityCampaign = 'banffboundwinteractivities';
export const winterActivityPaidCampaign = 'bb_ca_winter_50_test';
export const winterActivityPartnerId = activityCampaignPartnerId;
export const winterActivityClosureSource = 'https://parks.canada.ca/pn-np/ab/banff/bulletins/06d4ef61-a3c9-4b65-8dfc-66d056252d6c';
export function winterActivityBookingUrl(productUrl: string): string {
 if (!activityBookingOffers.some(offer => offer.productUrl === productUrl)) throw new Error('Expected an exact reviewed GetYourGuide product URL.');
 const url = new URL(productUrl);
 if (url.origin !== 'https://www.getyourguide.com' || url.search || url.hash) throw new Error('Expected a clean reviewed product URL.');
 url.searchParams.set('partner_id', winterActivityPartnerId);
 url.searchParams.set('cmp', winterActivityCampaign);
 return url.href;
}
const comparisons = [
  {
    "id": "gyg-256607",
    "anchor": "banff-gondola",
    "name": "Banff Gondola admission",
    "experienceType": "summit",
    "format": "Attraction admission",
    "fit": "Choose the gondola when your main goal is a mountain sightseeing ride and a visit to the summit complex, with flexibility to spend time indoors or on the permitted outdoor viewing areas.",
    "experience": "The attraction takes visitors up Sulphur Mountain from Mountain Avenue in Banff. The summit has indoor interpretive spaces and outdoor viewing areas; visibility and access to outdoor sections vary with the weather.",
    "tradeoff": "Admission is an attraction visit, rather than a guided canyon walk or a day tour between destinations. Meals, special packages and transport must be checked against the actual ticket.",
    "transport": "Plan how to reach the Mountain Avenue base and return afterwards. Check current Route 1 and operator transport information; a summer free-shuttle promotion does not establish winter inclusion.",
    "group": "For mobility needs, clarify cabin access, the indoor visit and any outdoor boardwalk or steps separately. A general accessibility label does not establish that every summit feature suits everyone.",
    "bookingCheck": "Select the ticket and arrival time, then read its actual cancellation terms. Check operating hours and visibility expectations before committing; there is no promised clear view."
  },
  {
    "id": "gyg-841685",
    "anchor": "three-sisters-flight",
    "name": "Three Sisters Scenic Helicopter Flight",
    "experienceType": "flight",
    "format": "Scenic flight from Canmore",
    "fit": "A specialist sightseeing outing with flexible weather and transfer plans.",
    "experience": "Alpine’s Three Sisters sightseeing product leaves from Canmore; it is separate from heli-skiing or a landing programme.",
    "tradeoff": "A flight involves different boarding and weather questions from a gondola. A mountain name does not establish a landing.",
    "transport": "Arrange the journey to 91 Bow Valley Trail in Canmore and the full return; a Banff room does not include this transfer.",
    "group": "The product requires two passengers minimum. Ask about boarding, seating, personal equipment and the actual participant requirements.",
    "bookingCheck": "Confirm the departure, aircraft arrangements and weather-change terms before making another dependent booking."
  },
  {
    "id": "gyg-798459",
    "anchor": "electric-fat-bike",
    "name": "Guided Electric Fat-Bike Tour",
    "experienceType": "cycling",
    "format": "Guided Banff cycling outing",
    "fit": "Cyclists wanting a guided local outing rather than an independent rental route.",
    "experience": "Radventures describes year-round electric fat-bike sightseeing around Banff; snow and the riding surface vary.",
    "tradeoff": "A guided tour is a different purchase from a bike rental. Match actual rider requirements and route permissions.",
    "transport": "The operator names Banff Canoe Docks as the meeting point and does not include hotel pickup. Confirm the return.",
    "group": "The operator states ages 15 and over. Explain actual cycling experience, clothing and any support needs.",
    "bookingCheck": "Check the date, bike fit, equipment and riding expectations, including what happens when weather changes the plan."
  },
  {
    "id": "gyg-292675",
    "anchor": "cross-country-lesson",
    "name": "Lake Louise Cross-Country Lesson & Tour",
    "experienceType": "snow-sports",
    "format": "Nordic instruction and guided outing",
    "fit": "A group wanting cross-country instruction rather than downhill resort skiing.",
    "experience": "Freeheelin’ Adventures offers a winter cross-country lesson and tour at Lake Louise, with equipment arranged separately.",
    "tradeoff": "Nordic skiing is separate from downhill lessons and resort lifts. Allow for the lakeshore journey and equipment fitting.",
    "transport": "Confirm the lakeshore meeting point and full return; arriving in Lake Louise village does not complete that journey.",
    "group": "The programme lists ages 14 and over. Bring or rent waxless skis, boots and poles; discuss experience and support needs.",
    "bookingCheck": "Confirm the actual snow, lesson format and equipment preparation before reserving dependent rentals or transport."
  },
  {
    "id": "gyg-303208",
    "anchor": "paint-pots-snowshoe",
    "name": "Paint Pots Guided Snowshoe Tour",
    "experienceType": "snowshoe",
    "format": "Banff departure to Kootenay National Park",
    "fit": "A guided snowshoe outing with transport to a different national park.",
    "experience": "Discover Banff Tours describes a December-to-April Paint Pots programme in Kootenay, with snowshoes and poles listed.",
    "tradeoff": "This is a Kootenay outing, separate from Banff and Lake Louise trails. Do not substitute an independent winter route.",
    "transport": "Use the pickup on the selected option. Confirm the Banff meeting point and return rather than assuming regional collection.",
    "group": "The programme lists ages 8 and over. Check winter clothing, footwear, walking demands and participant requirements.",
    "bookingCheck": "Confirm the date, snow, route and inclusions; a broad seasonal description does not reserve a departure."
  },
  {
    "id": "gyg-1182128",
    "anchor": "kananaskis-snowshoe",
    "name": "Kananaskis Guided Snowshoe Adventure",
    "experienceType": "snowshoe",
    "format": "Guided trek with mountain transport",
    "fit": "An active snowshoe plan with Banff or Canmore meeting options.",
    "experience": "The listing describes a moderate Kananaskis trek with equipment and transport, about 2.5–3 hours and 75 metres of gain.",
    "tradeoff": "This destination and journey differ from Paint Pots. Compare the actual selected option rather than similar tour names.",
    "transport": "Choose the Banff or Canmore meeting option and confirm collection, the mountain journey and complete return.",
    "group": "Match the described snowshoe effort to everyone. Ask about clothing, footwear, participant rules and equipment.",
    "bookingCheck": "Confirm the date, terrain and weather arrangements; the published profile does not promise current conditions."
  },
  {
    "id": "gyg-437787",
    "anchor": "winter-parkway-tour",
    "name": "Icefields Parkway & Ice Bubbles Tour",
    "experienceType": "road-day",
    "format": "Winter road trip with outdoor stops",
    "fit": "Visitors wanting an operator-led road day with flexible winter stops.",
    "experience": "Radventures publishes an Icefields Parkway and Abraham Lake outing with stops responding to road and surface conditions.",
    "tradeoff": "This commits the main day to a road trip. Ice bubbles, skating, snowshoeing and a particular Peyto stop are not guaranteed.",
    "transport": "Confirm the Banff or Lake Louise pickup and return. Keep a separate airport or onward departure flexible.",
    "group": "Discuss outdoor walking, cold and requested equipment. A vehicle transfer does not remove outdoor demands.",
    "bookingCheck": "Read the actual route, equipment and road-change terms. A listing or lake photo does not assess current ice or highway access."
  },
  {
    "id": "gyg-916190",
    "anchor": "banff-nightfall",
    "name": "Banff Nightfall & Stargazing Tour",
    "experienceType": "night-sky",
    "format": "Evening road-and-sky outing",
    "fit": "A flexible evening with mountain scenery and a chance to observe the sky.",
    "experience": "Into the Wild Tours describes Lake Minnewanka and Two Jack Lake stops, with stargazing responding to the actual weather.",
    "tradeoff": "Stars and northern lights are not guaranteed. Choose an evening that still suits the group if clouds change the plan.",
    "transport": "Confirm the selected Banff or Canmore pickup and full return; a hotel address alone does not establish collection.",
    "group": "The listing is for ages 6 and over. Ask about cold exposure, clothing, walking and actual passenger requirements.",
    "bookingCheck": "Confirm winter dates because operator pages differ on the season. Read weather-change terms before committing."
  },
  {
    "id": "gyg-698951",
    "anchor": "banff-food-walk",
    "name": "Banff Foodie Walking Tour",
    "experienceType": "food",
    "format": "Town tasting walk",
    "fit": "A food-focused town outing with walking between tasting stops.",
    "experience": "Nibble Tours describes a year-round Banff tasting walk; drinks and other inclusions differ between standard and premium options.",
    "tradeoff": "This differs from the indoor Banff Springs experience. Allow for winter clothing and the actual walking requirements.",
    "transport": "Confirm the Visitor Centre meeting point and arrival and return to town; a tour purchase does not establish pickup.",
    "group": "Discuss dietary requirements, participant rules and walking or assistance needs. Do not borrow another food tour’s inclusions.",
    "bookingCheck": "Select the date and exact option, then review tastings, meeting instructions and terms; year-round does not mean every departure."
  },
  {
    "id": "gyg-432341",
    "anchor": "beginner-ice-climbing",
    "name": "Beginner Ice-Climbing Adventure",
    "experienceType": "climbing",
    "format": "Guided winter instruction",
    "fit": "Participants looking for instruction in a technical winter activity.",
    "experience": "Alpine Air Adventures describes beginner ice-climbing instruction with a site selected according to conditions.",
    "tradeoff": "Ice climbing is separate from an icewalk. A beginner label does not make independent ice climbing appropriate.",
    "transport": "Own transport to the selected site is required. Establish exact meeting instructions and the complete return.",
    "group": "The programme lists ages 14 and over and four bookings overall minimum. Ask about equipment, effort and support needs.",
    "bookingCheck": "Confirm the date, required bookings, site and equipment; a visible listing does not establish a confirmed departure."
  },
  {
    "id": "gyg-1164949",
    "anchor": "yoho-kootenay-winter",
    "name": "Frozen Gems of Yoho & Kootenay",
    "experienceType": "road-day",
    "format": "Guided winter national-park road day",
    "fit": "A guided day exploring winter destinations beyond Banff National Park.",
    "experience": "Radventures describes a winter road-and-walk outing in Yoho and Kootenay, with optional walks adapted to conditions.",
    "tradeoff": "This differs from the Lake Louise/Johnston and Parkway outings. Compare actual destinations and outdoor demands.",
    "transport": "Confirm the selected Banff pickup, route and return; a park-tour title does not establish every regional pickup.",
    "group": "Ask about walking, cold exposure, participant requirements and assistance or equipment needs for the actual programme.",
    "bookingCheck": "Confirm the departure, roads, stops and return before another timed booking; optional walks and the route can change."
  },
  {
    "id": "gyg-303253",
    "anchor": "johnston-icewalk",
    "name": "Guided Johnston Canyon Icewalk",
    "experienceType": "icewalk",
    "format": "Guided outdoor walk",
    "fit": "Choose the canyon walk when the walk itself is the main event: a guide-led winter outing through Johnston Canyon rather than a sightseeing ride or a multi-stop road day.",
    "experience": "The operator describes a guided walk using the canyon paths and catwalks, with ice cleats and transport from Banff. Frozen-waterfall scenery depends on the season and conditions; your guide determines the permitted route.",
    "tradeoff": "This involves sustained outdoor walking and winter footing. A gondola admission is a different choice for a group that wants a ride-based attraction with time inside.",
    "transport": "Confirm the actual Banff pickup or meeting point shown for the selected departure. Staying in Canmore, Lake Louise or Calgary does not establish pickup there.",
    "group": "Before paying, check the chosen product’s age and mobility requirements, winter footwear, equipment inclusions and everyone’s comfort with snowy paths and heights.",
    "bookingCheck": "Check the current canyon closure and ask how the operator handles your date or a route change. A published departure calendar does not override Parks restrictions."
  },
  {
    "id": "gyg-437912",
    "anchor": "winter-wonderland",
    "name": "Lake Louise & Johnston Canyon winter outing",
    "experienceType": "road-day",
    "format": "Guided road trip with outdoor stops",
    "fit": "Choose this outing when you want a guided winter day linking Lake Louise and the Johnston Canyon area, with transport between stops instead of arranging each journey yourself.",
    "experience": "Radventures describes a winter road outing with guided outdoor stops, winter equipment and selected Banff pickup locations. Its route and outdoor activities respond to conditions; skating or snowshoeing is not guaranteed for every departure.",
    "tradeoff": "A multi-stop outing commits more of the day to the road and the group itinerary. Choose the standalone icewalk if the canyon is your priority, or gondola admission if you want a single attraction.",
    "transport": "Use the meeting or pickup instructions for the GetYourGuide option you select. Confirm any hotel request with the operator; its direct-booking pickup list is not proof that every reseller option includes the same collection.",
    "group": "Discuss the walking, cold-weather stops, ages, mobility needs and any requested skate equipment before paying. Ask about food and equipment in the selected listing rather than transferring inclusions from another sales channel.",
    "bookingCheck": "Confirm the current route around canyon construction and which Lake Louise activities are intended for your date. Do not book on an assumption of accessible natural lake ice or guaranteed wildlife."
  },
  {
    "id": "gyg-303298",
    "anchor": "grotto-canyon-icewalk",
    "name": "Grotto Canyon Icewalk",
    "experienceType": "icewalk",
    "format": "Separate guided canyon walk",
    "fit": "Visitors specifically interested in Grotto Canyon, subject to actual dates.",
    "experience": "Discover Banff Tours publishes a Grotto Canyon icewalk, a separate frozen-creek destination from Johnston Canyon.",
    "tradeoff": "The listing warns it is usually unavailable. Treat this as a date enquiry and keep a different outing available.",
    "transport": "Confirm the pickup or meeting point and return; do not borrow transport instructions from the Johnston Canyon programme.",
    "group": "Read the actual ages, walking, footwear, equipment and participant requirements for the option before paying.",
    "bookingCheck": "Check actual dates and Alberta advisories. A listing or traction device does not establish suitable frozen-creek conditions."
  },
  {
    "id": "gyg-285990",
    "anchor": "castle-food-experience",
    "name": "Banff Springs Castle Food Experience",
    "experienceType": "food",
    "format": "Indoor food and history experience",
    "fit": "A food-and-history outing at Fairmont Banff Springs rather than a town walk.",
    "experience": "Alberta Food Tours publishes an indoor experience at Banff Springs, meeting in the hotel’s main lobby.",
    "tradeoff": "The listing warns it is usually unavailable. Confirm a date before building the day or a dependent journey around it.",
    "transport": "Arrange the journey to Banff Springs and return. A food-tour ticket does not establish a hotel room or transfer.",
    "group": "The experience is for ages 14 and over. Discuss dietary needs directly; the listing says it is not ideal for vegans.",
    "bookingCheck": "Check the date, diet, tastings and terms. The venue name does not include accommodation or every restaurant."
  }
];
export const winterActivityOffers = comparisons.map(comparison => {
 const source = activityBookingOffers.find(offer => offer.id === comparison.id);
 if (!source) throw new Error('Missing reviewed winter product: ' + comparison.id);
 return { ...comparison, productId:source.productId, provider:source.provider, productTitle:source.title,
 productUrl:source.productUrl, operatorUrl:source.sourceUrls.find(url => !url.includes('getyourguide.com')) || source.sourceUrls[0],
 sourceUrls:[...source.sourceUrls], seasonalNotice:source.seasonalNotice, launchState:source.launchState,
 needsCanyonCheck:['gyg-303253','gyg-437912'].includes(source.id),
 cta:source.launchState === 'ready' ? 'Book now' : 'Find out more',
 bookingUrl:winterActivityBookingUrl(source.productUrl) };
});
export const winterActivityFinalOfferIds = ['gyg-256607','gyg-437787','gyg-916190'] as const;
export const winterActivityFinalOffers = winterActivityFinalOfferIds.map(id => winterActivityOffers.find(offer => offer.id === id)!);
export const winterActivityFaqs = [
  {
    "question": "Which winter experience should I choose?",
    "answer": "Choose the format before the ticket: a gondola ride, guided road day, active snow outing, food experience or evening tour solve different trips. This page compares fifteen published GetYourGuide products and five other winter plans. Match the actual date, destination, walking and journey to your group; this is not live operating inventory."
  },
  {
    "question": "Does a tour include pickup from my hotel?",
    "answer": "Use the selected option’s pickup or meeting instructions. Banff, Canmore, Lake Louise, Kananaskis and the national-park destinations are different starting places. Confirm collection and the full return; some products require you to reach a base or site yourself."
  },
  {
    "question": "Is every canyon, lake and snow activity available on my date?",
    "answer": "No. Closures, snow, natural ice, weather and minimum bookings can change the plan. Johnston Canyon has a dated construction closure with reopening unconfirmed. Grotto Canyon and the Castle Food Experience listings warn they are usually unavailable. Ask about the actual date rather than treating a listing as confirmation."
  },
  {
    "question": "Where do I see the final price and cancellation terms?",
    "answer": "On GetYourGuide, select the date, participants and exact option, then read the total, inclusions, meeting instructions and terms before paying. Products can have different cancellation rules. BanffBound provides an independent comparison and does not take your booking or payment."
  }
];
export const winterActivityMessageMap = [
 {queryIntent:'Banff winter activities / things to do in Banff in winter',promise:'Compare fifteen published products and five other winter plans.',target:'#experiences'},
 {queryIntent:'Banff gondola winter tickets',promise:'Find admission and the Mountain Avenue journey.',target:'#banff-gondola'},
 {queryIntent:'Banff guided winter tours',promise:'Compare actual destinations, group needs, transport and date-specific access.',target:'#experiences'},
];
export const winterActivityExperienceOptions = [
 {value:'all',label:'All fifteen products'}, {value:'icewalk',label:'Guided canyon walks'},
 {value:'summit',label:'Gondola admission'}, {value:'road-day',label:'Guided road days'},
 {value:'snowshoe',label:'Guided snowshoeing'}, {value:'snow-sports',label:'Cross-country instruction'},
 {value:'cycling',label:'Guided cycling'}, {value:'flight',label:'Scenic flight'},
 {value:'night-sky',label:'Night-sky tour'}, {value:'food',label:'Food experiences'}, {value:'climbing',label:'Ice climbing'},
] as const;
export type WinterActivityExperience = typeof winterActivityExperienceOptions[number]['value'];
export function normaliseWinterActivityExperience(value: unknown): WinterActivityExperience {
 return typeof value === 'string' && winterActivityExperienceOptions.some(option => option.value === value) ? value as WinterActivityExperience : 'all';
}
export function buildWinterActivitySelection(value: unknown) {
 const experience = normaliseWinterActivityExperience(value);
 return {experience,offerIds:winterActivityOffers.filter(offer => experience === 'all' || offer.experienceType === experience).map(offer => offer.id)};
}
