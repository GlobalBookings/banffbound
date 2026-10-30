/** Full canonical source review; preserve original publication 2025-12-27. */
export const reviewDate = '2026-10-29';
const sources = {
  lodge: 'https://skokilodge.com/',
  rates: 'https://www.skoki.com/rates/',
  location: 'https://www.skoki.com/location/',
  accommodation: 'https://skokilodge.com/accommodation/index.php',
  faq: 'https://skoki.com/FAQ/index.php',
  contact: 'https://www.skoki.com/contact/',
  winterSheet: 'https://www.skoki.com/pdf/Skoki-Info-Sheet-Winter.pdf',
  summerSheet: 'https://skokilodge.com/pdf/Skoki-Info-Sheet-Summer.pdf',
  cancellation: 'https://www.skoki.com/rates/cancellation.php',
  heritage: 'https://www.pc.gc.ca/apps/dfhd/page_nhs_eng.aspx?i=90606&id=4',
  management: 'https://www.parks.canada.ca/pn-np/ab/banff/info/gestion-management/skoki',
  hiking: 'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
  ates: 'https://www.parcs.canada.ca/pn-np/mtn/securiteenmontagne-mountainsafety/avalanche/echelle-ratings/eeta-ates-2/simple-1',
  touring: 'https://www.parcs.canada.ca/pn-np/mtn/securiteenmontagne-mountainsafety/hiver-winter/randonnee-touring',
  winter: 'https://parks.canada.ca/pn-np/ab/banff/securite-safety/hiver-winter',
  bulletins: 'https://parks.canada.ca/pn-np/ab/banff/bulletins',
  bearNotice: 'https://parks.canada.ca/voyage-travel/securite-safety/bulletins/74085a8f-8138-410f-8956-83929a79d6b8',
};

export const skokiGuideFaqs: { question: string; answer: string }[] = [
  { question: 'Is a winter Skoki stay suitable for a first ski or snowshoe trip?', answer: 'The lodge’s winter preparation sheet does not recommend the approach for people without ski or snowshoe experience. A room reservation includes neither a guide nor an assessment of the party. Discuss the actual journey, skills, equipment and conditions with the operator; arrange qualified guidance separately where needed. A summer hiking grade or ATES terrain class does not approve winter travel.' },
  { question: 'Is the lodge 11 km from Fish Creek parking?', answer: 'The operator’s approximately 11 km approach starts at the arranged upper trailhead. Its summer sheet separately describes a 4 km access-road leg from Fish Creek if the shuttle is missed. Parks Canada’s heritage statement gives an approximately 14.5 km Lake Louise trailhead reference. Confirm the actual seasonal start and connections rather than using these figures interchangeably.' },
  { question: 'What should I expect the stay to include?', answer: 'The operator lists accommodation and meals, with bedding and wash basins in its accommodation information. Confirm the selected room, meal dates, dietary arrangements and full total. Guests carry their own packs and arrange any guide separately. Alcohol, personal equipment, dependent travel and a room before or after the trip should not be assumed included.' },
  { question: 'Which winter and summer dates are currently published?', answer: 'At the October 29, 2026 review, Skoki published December 18, 2026–April 5, 2027 for winter and June 18–October 13, 2027 for summer. These are future operating plans, not confirmation of a room, transfer, trail condition or suitable journey on a particular date. Obtain the actual booking and arrival instructions from the lodge.' },
  { question: 'Will weather or a missed arrival automatically produce a refund?', answer: 'No automatic refund is established. The dedicated cancellation policy excludes refunds for various guest cancellations and disruptions and describes credit or deferral when the lodge cancels. Other operator summaries use different wording. Ask which written terms govern the selected reservation, including the difference between a cash refund, credit and changed dates, before paying for dependent travel.' },
];
const esc = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function renderFaqs(): string {
  const schema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: skokiGuideFaqs.map(faq => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) };
  return skokiGuideFaqs.map(faq => `<details><summary>${esc(faq.question)}</summary><p>${esc(faq.answer)}</p></details>`).join('\n') + `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`;
}

export const skokiGuideOverrides: Record<string, string> = {
  'skoki-lodge-guide': `
<p>Skoki is a backcountry stay reached through a substantial mountain journey, with a bed and meals at the other end. Choose it for time in the valley and the lodge, and plan the approach and return as carefully as the room. Winter ski or snowshoe travel and a summer hike need different preparation, equipment and arrival arrangements.</p>
<p><strong>Full guide reviewed October 29, 2026.</strong> The operator’s <a href="${sources.rates}" target="_blank" rel="noopener">current dates and booking page</a> lists winter <strong>December 18, 2026–April 5, 2027</strong> and summer <strong>June 18–October 13, 2027</strong>. These are future operating plans, not available-room or route-condition confirmations. Ask the <a href="${sources.contact}" target="_blank" rel="noopener">lodge reservations team</a> about your actual party, room, journey and terms.</p>
<nav aria-label="Skoki Lodge guide sections"><p><a href="#getting-there">Getting there</a> · <a href="#winter-access">Winter approach</a> · <a href="#summer-access">Summer approach</a> · <a href="#the-lodge">The lodge</a> · <a href="#what-to-do">Time in the valley</a> · <a href="#booking">Booking and terms</a> · <a href="#what-to-bring">Packing and return</a> · <a href="#skoki-questions">Questions</a></p></nav>

<h2 id="getting-there">Getting there: separate the village, resort and upper trailhead</h2>
<p>Lake Louise village, the lakeshore and the ski resort are different destinations. Skoki’s seasonal instructions begin with check-in at the resort on <strong>1 Whitehorn Road</strong>, followed by the relevant staging process. A bus to the village or lakeshore does not establish a connection to that check-in or the backcountry trailhead. Give the lodge your actual transport plan before buying dependent tickets.</p>
<table><caption>Read each distance with its starting point</caption><thead><tr><th scope="col">Source</th><th scope="col">What the figure describes</th><th scope="col">Planning implication</th></tr></thead><tbody>
<tr><th scope="row">Operator’s preparation sheets</th><td>Approximately 11 km from the arranged upper trailhead to Skoki.</td><td>The village, parking and check-in journey come before this mountain leg.</td></tr>
<tr><th scope="row">Summer access-road leg</th><td>The summer sheet describes another 4 km from Fish Creek when the shuttle is missed.</td><td>Confirm outward and return shuttles; a late arrival can materially lengthen the day.</td></tr>
<tr><th scope="row">Parks Canada heritage statement</th><td><a href="${sources.management}" target="_blank" rel="noopener">Approximately 14.5 km from the Lake Louise trailhead</a>.</td><td>A broader heritage-location reference, not a replacement for booking-specific arrival instructions.</td></tr>
<tr><th scope="row">Parks Canada summer hiking profile</th><td><a href="${sources.hiking}" target="_blank" rel="noopener">Deception Pass is 11.5 km one way from Fish Creek</a>.</td><td>This ends at the pass, not the lodge. It is a different endpoint and a summer profile.</td></tr>
</tbody></table>
<p>Do not turn one of these figures into a guaranteed elapsed time. A pass, an overnight lodge and the wider Skoki circuit are distinct objectives. Use the <a href="/trails/deception-pass/">reviewed Deception Pass hiking record</a> for that summer endpoint, and the lodge’s instructions for the stay. Check current park entry requirements separately from accommodation and any resort access.</p>

<h2 id="winter-access">Winter: establish the skills and staging before booking</h2>
<p>The linked <a href="${sources.winterSheet}" target="_blank" rel="noopener">winter preparation sheet</a> describes resort lift staging and equipment-dependent instructions. It is not the summer Fish Creek shuttle process. Confirm parking, check-in and both travel directions with your reservation; do not reconstruct the lift journey from an old FAQ or follow somebody else’s ski tracks. The room booking does not include a guide, pack transport or a personal assessment of the route.</p>
<p>Skoki’s winter sheet does not recommend the approach for people without ski or snowshoe experience. Tell the reservations team how the least experienced member manages climbs, descents, changing snow and a loaded pack. Ask about the correct rental setup and fitting before arrival. Learning to make turns at a resort is a different plan: the <a href="/learn-to-ski/#lesson-fit">lesson finder</a> can help with that introduction.</p>
<p>Parks Canada lists the Boulder/Deception approach in <a href="${sources.ates}" target="_blank" rel="noopener">ATES Simple, Class 1</a>. That classification describes terrain exposure; it is not a declaration of no avalanche risk, a daily forecast or novice approval. Read <a href="${sources.touring}" target="_blank" rel="noopener">Parks’ touring preparation guidance</a>, including training, current forecasts, a transceiver, shovel and probe and the skills to use them. Appropriate equipment does not provide navigation or companion-rescue skills.</p>
<p>The <a href="${sources.location}" target="_blank" rel="noopener">lodge’s location guidance</a> directs travellers to Parks Canada or Avalanche Canada for current information; staff cannot provide up-to-the-minute avalanche and weather forecasts. Arrange qualified guidance separately when needed. Changing the trip is a valid outcome if the party cannot meet its demands. The <a href="/blog/banff-ski-touring/">touring readiness guide</a> provides questions to resolve, not approval for this approach.</p>
<p><a href="${sources.winter}" target="_blank" rel="noopener">Parks does not monitor natural ice for safety</a>. This article supplies no lake-crossing line or alternative winter route. Obtain current route information and make a competent assessment rather than substituting summer shoreline directions or treating a frozen surface as a maintained trail.</p>

<h2 id="summer-access">Summer: reserve the arrival chain, then choose the hiking day</h2>
<p>The <a href="${sources.summerSheet}" target="_blank" rel="noopener">summer preparation sheet</a> places lodge check-in before the Fish Creek transfer to the upper trailhead. Confirm the actual departure and return pickup with the operator, and advise them if you are not driving. Do not assume the public Lake Louise/Moraine Lake shuttle, a sightseeing ticket or a village bus includes this lodge transfer.</p>
<p>Carry the whole approach’s food, water, layers and navigation, plus an emergency plan. A packed lunch offered during the stay does not establish your arrival-day trail provisions. The return also includes an ascent back toward the pass before descending toward the resort. Choose a pace and turnaround plan for the entire group rather than the fastest walker’s expectation.</p>
<p><strong>Dated access check:</strong> at review, Parks’ bulletin index listed a <a href="${sources.bearNotice}" target="_blank" rel="noopener">Skoki trails bear warning issued September 2, 2026</a>, including the lodge area and Deception Pass. This is a warning, not an asserted closure. Read the <a href="${sources.bulletins}" target="_blank" rel="noopener">current bulletins</a> again before travel; a future room booking does not resolve later wildlife restrictions, weather or trail conditions.</p>
<p>Stay with the documented route and current park instructions. Parks’ summer hiking information does not establish a snow-free pass on the date your room becomes bookable. If considering separate camping, arrange the appropriate Parks booking and current campsite access; lodge accommodation is not a backcountry camping permit.</p>

<h2 id="the-lodge">The lodge: choose the actual room and rustic facilities</h2>
<p>The operator’s <a href="${sources.accommodation}" target="_blank" rel="noopener">accommodation page</a> describes the main lodge and three guest cabins, with capacity for 22 guests. Main-lodge rooms are upstairs; the named configurations vary, from single-bed rooms to queen-bed options. The Honeymoon cabin lists a king bed, while larger cabin categories have different layouts and occupancy conditions. Ask for the specific category that matches your party and quote rather than assuming every cabin has the same capacity or privacy.</p>
<p>Expect wash basins and outhouses, not a frontcountry hotel bathroom. Bedding is provided. Discuss stairs, night-time bathroom access, children’s arrangements and any assistance needs before paying; neither a cabin label nor an online photograph establishes accessible travel or facilities. Request the current preparation sheet for practical charging and communication arrangements, and keep essential navigation and emergency power independent of lodge facilities.</p>
<p>Food is a substantial part of the stay. Rates state that meals are included; the accommodation page describes breakfasts, packed lunches and evening dining, with alcoholic drinks sold separately. Confirm the meals on arrival and departure days, dietary needs and full total. The operator prepares food in a shared kitchen, so discuss requirements directly rather than assuming an allergen-free service.</p>

<h2 id="what-to-do">Time in the valley: make the lodge stay the occasion</h2>
<p>Choose a book, conversation in the common room or time with the lodge’s historic photographs as part of the holiday. The <a href="${sources.lodge}" target="_blank" rel="noopener">operator’s overview</a> introduces the setting; the <a href="${sources.heritage}" target="_blank" rel="noopener">Parks heritage record</a> explains its early ski-tourism role. Skoki opened to guests in 1931 and was designated a national historic site in 1992. Its rustic buildings are part of the experience, rather than a promise of modern resort amenities.</p>
<p>For an additional outing, choose a specific objective after assessing conditions, navigation and the party’s energy. A nearby peak or lake on the map does not make a short, suitable route. Summer hiking descriptions do not supply winter touring itineraries, and a relaxed afternoon at the lodge can be a complete day without another pass or summit.</p>
<p>Ordinary lodge meals are for overnight guests. The <a href="${sources.faq}" target="_blank" rel="noopener">operator’s FAQ</a> describes a separate afternoon-tea offer for day visitors; its preparation sheets specify outdoor seating. Confirm the actual service before depending on it, and carry your own outing supplies. A tea listing does not reserve indoor shelter, an overnight bed or an easier return route.</p>

<h2 id="booking">Booking: compare the actual room, inclusions and cancellation terms</h2>
<ol><li><strong>Choose the season and party.</strong> Discuss experience, the access journey, desired room and any dietary or facility needs.</li><li><strong>Request the complete quote.</strong> Use the <a href="${sources.rates}" target="_blank" rel="noopener">official booking route</a> for accommodation, meal dates, fees, taxes, deposit and payment schedule. Check the actual minimum stay; no universal two-night rule or fixed per-person rate is established here.</li><li><strong>Read the governing terms before dependent travel.</strong> Ask how a guest cancellation, a missed arrival, a lodge cancellation and changed dates differ.</li><li><strong>Obtain the current preparation sheet and confirmations.</strong> Join the road or bus journey, check-in, equipment, staging, mountain approach and return.</li></ol>
<p><strong>Resolve the source wording:</strong> the <a href="${sources.cancellation}" target="_blank" rel="noopener">dedicated cancellation policy</a> excludes refunds for several guest disruptions, including weather and road problems, and describes credit or deferral if the lodge cancels. Some rates and preparation summaries use different refund wording. Confirm which terms apply to your reservation and distinguish cash refunds from credits before paying. Do not assume a dangerous travel day automatically makes a guest cancellation refundable. Check any insurance against the actual activity and interruption circumstances.</p>

<h2 id="what-to-bring">What to bring, and how to finish the trip</h2>
<p>Guests carry their own packs in and out. A made bed reduces camping equipment but does not replace personal clothing, food and water for travel, route-specific equipment or emergency supplies. Pack suitable footwear, warm and weatherproof layers, gloves, eye protection, a headlamp, blister/first-aid supplies, personal medication and indoor shoes. Use the seasonal lodge list and the <a href="/packing-list/">packing checklist</a> as prompts, then resolve the actual route requirements.</p>
<p>Plan communications and leave a trip plan with a reliable person. Do not depend on a phone signal, another guest or the lodge for immediate rescue. Follow Parks’ emergency guidance; the preparation sheets say the lodge cannot provide backcountry rescue. Keep the option to change the objective before setting out, and reassess the route and return rather than treating checkout as the end of the mountain journey.</p>
<p>Leave room around the stay for rental fitting, the required morning arrival and a changed return. Compare a separate <a href="/towns/lake-louise/">Lake Louise base</a> or the <a href="/book/lake-louise-stays/">frontcountry stay shortlist</a> before and after Skoki. The <a href="/car-free-banff/">car-free guide</a> helps identify public transport legs, while <a href="/conditions/">dated road-source links</a> and <a href="/blog/banff-winter-driving/">winter driving preparation</a> support the road portion. None reserves the lodge’s staging connection.</p>
<p>For a separate Banff portion of the holiday, the retained <a href="https://www.expedia.ca/Hotel-Search?destination=Banff%2C+Alberta&camref=1101l3MtWX" target="_blank" rel="noopener sponsored">Expedia Banff accommodation search</a> and <a href="https://www.getyourguide.com/banff-l284/?partner_id=QW960HO" target="_blank" rel="noopener sponsored">GetYourGuide Banff activity search</a> are affiliate links: BanffBound may earn a commission. These search results are not Skoki Lodge rooms, guiding, pack transport or an included part of its stay. Use <a href="/winter-stays/">winter stay planning</a> or <a href="/winter/">other winter choices</a> if a frontcountry trip fits the group better.</p>

<h2 id="skoki-questions">Skoki Lodge questions</h2>
${renderFaqs()}
<h2 id="skoki-sources">Sources and review</h2>
<p><strong>Full guide reviewed October 29, 2026.</strong> Linked primary sources cover current lodge dates, room and meal descriptions, seasonal arrival sheets, cancellation wording and Parks heritage, hiking, terrain and access information. Future dates are plans; conditions and bookings need their own confirmation. There is no live room, weather or trail feed, fixed journey guarantee or invented personal visit. The retained hero is illustrative and is not verified as Skoki Lodge, its rooms or a current approach.</p>
`,
};

export const skokiGuideMetadata: Record<string, { title: string; description: string; lastUpdated: string; readTime: string; imageIsIllustrative: true; imageNote: string }> = {
  'skoki-lodge-guide': {
    title: 'Skoki Lodge: Winter Ski Access, Summer Hikes & Stay Planning',
    description: 'Plan a Skoki Lodge stay with separate winter and summer approaches, actual trailhead distances, rooms, meal inclusions, booking terms and a complete return journey.',
    lastUpdated: reviewDate,
    readTime: '12 min read',
    imageIsIllustrative: true,
    imageNote: 'Illustrative image; not verified as Skoki Lodge, a guest room, an access route or current conditions.',
  },
};
