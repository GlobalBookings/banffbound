/** Full guide review, 2026-10-29. Original publication dates remain in blogPosts.ts. */
const reviewedAt = '2026-10-29';
const sources = {
  home: 'https://lodgeatbowlake.com/',
  stay: 'https://lodgeatbowlake.com/stay',
  contact: 'https://lodgeatbowlake.com/connect',
  history: 'https://lodgeatbowlake.com/the-lodge',
  day: 'https://lodgeatbowlake.com/explore',
  dining: 'https://lodgeatbowlake.com/dining-at-the-lodge',
  winter: 'https://lodgeatbowlake.com/winter',
  booking: 'https://us2.cloudbeds.com/reservation/72Jsch',
  water: 'https://parks.canada.ca/pn-np/ab/banff/activ/nautiques-sports',
  order: 'https://parks.canada.ca/pn-np/ab/banff/bulletins/59933c9d-02a5-4ec9-a2d8-ea0d4dad6429',
  hiking: 'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
  ice: 'https://parks.canada.ca/pn-np/ab/banff/activ/patinage-skating',
  winterSafety: 'https://parks.canada.ca/pn-np/ab/banff/securite-safety/hiver-winter',
};
const esc = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const stayFaqs = [
  { question: 'Is Num-Ti-Jah Lodge the current property name?', answer: 'The current operator calls the property The Lodge at Bow Lake. Num-Ti-Jah is its former name and remains the name of one Historic Lodge suite. Use the current operator and the exact building or room category when booking.' },
  { question: 'Does The Lodge at Bow Lake open in winter?', answer: 'The operator advertises a limited winter season from late January to early April, Thursday to Monday, alongside a separate summer/fall season. Spring and fall closure periods apply. Confirm the actual arrival and departure dates; this guide does not establish an available room or completed opening.' },
  { question: 'Can I work remotely using lodge Wi-Fi?', answer: 'The operator FAQ states that there are no telephones, televisions or Wi-Fi. Save confirmations and directions before travelling, and choose another base if reliable connectivity is essential to the stay. Do not treat an old amenity listing as confirmation of internet access.' },
  { question: 'Are the Historic Lodge and Chalet equally accessible?', answer: 'No blanket access statement covers both. Historic Lodge accommodation is reached by stairs. The operator describes selected first-floor Chalet rooms as accessible without stairs, with Chalet stays advertised from winter 2027. Confirm the entire arrival, room, bathroom and dining route for your needs.' },
  { question: 'Can I bring a canoe or paddleboard to Bow Lake?', answer: 'Parks Canada places Bow Lake in the Water Preservation Zone and lists paddling, large inflatables and motorized boating as prohibited. Do not bring a craft or assume lodge rentals exist. Check the current official order before planning any water activity.' },
];
const historyFaqs = [
  { question: 'Why does this guide use the former Num-Ti-Jah name?', answer: 'The retained article address helps readers who know the historic name find the present property and its story. The current name is The Lodge at Bow Lake. The operator explains that it changed the name following consultation with Stoney Nakoda Elders.' },
  { question: 'Can I visit Bow Lake without staying at the lodge?', answer: 'A lake day visit is separate from an overnight reservation. The operator describes day-use parking and a designated lakeshore approach. Check current access and conditions, and confirm any café, dinner or indoor visit separately rather than assuming lodge facilities are available.' },
  { question: 'Is Provision Co. a confirmed winter café stop?', answer: 'No. At the October 29, 2026 review, the operator homepage said Provision Co. was closed for the season and announced a spring 2027 return. That announcement does not confirm a future opening day. Carry the food and warm clothing needed for your own lake visit.' },
  { question: 'Does a frozen Bow Lake establish a skating or walking route?', answer: 'No. Parks Canada does not monitor natural ice for safety or mark its hazards. Snow, a photograph or another visitor’s tracks do not establish suitable ice or an appropriate winter route. Check current Parks guidance and choose an off-ice plan when you cannot establish the conditions.' },
];
function faqHtml(faqs: { question: string; answer: string }[]): string {
  return `<h2 id="questions">Questions before you go</h2>${faqs.map(faq => `<details><summary>${esc(faq.question)}</summary><p>${esc(faq.answer)}</p></details>`).join('\n')}\n<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) })}</script>`;
}

export const bowLakeGuideOverrides: Record<string, string> = {
  'num-ti-jah-lodge': `
<p><strong>The Lodge at Bow Lake is the current name of the property formerly called Num-Ti-Jah Lodge.</strong> It is a lakeside accommodation on the Icefields Parkway north of Lake Louise, with meals built into the advertised stay. Choose it for time at the lodge and a deliberately paced mountain visit. For the earlier name, the building’s story and a shorter stop, read our separate <a href="/blog/numtijah-lodge/">history and day-visit guide</a>.</p>
<p>The useful booking questions are concrete: Historic Lodge or Chalet, which room and floor, who can share it, which meals apply, and how arrival fits the road journey. Start with the <a href="${sources.stay}" target="_blank" rel="noopener">operator’s room comparison</a> or <a href="${sources.booking}" target="_blank" rel="noopener">check dates in the operator-linked booking system</a>. The operator publishes this Cloudbeds link for its reservations.</p>

<h2 id="seasons">Choose the season before choosing the room</h2>
<p><strong>Schedule checked October 29, 2026:</strong> the <a href="${sources.home}" target="_blank" rel="noopener">operator homepage</a> advertises winter from late January to early April, Thursday–Monday, and a separate late-May–mid-October summer/fall period. Its dated stay page specifies May 29–October 9 for the <strong>2026 summer/fall season</strong>. Seasonal spring and fall closures interrupt that calendar; neither a winter photograph nor a booking link establishes operation on a particular day.</p>
<p>The operator is advertising <strong>Chalet accommodation from winter 2027</strong>. Read the year on the actual offer. An old Historic Lodge room description should not be used to choose a new Chalet room, and a future booking announcement is not confirmation that construction, access or your reservation is complete. Match the arrival and departure days to the published operating window before adding flights or activities.</p>

<h2 id="rooms">Compare the building and exact category</h2>
<table><caption>Decisions supported by the current operator room information</caption><thead><tr><th scope="col">Choice</th><th scope="col">Published distinction</th><th scope="col">What to resolve for your stay</th></tr></thead><tbody>
<tr><th scope="row">Historic Lodge</th><td>Fireweed rooms are listed on the second floor, Whitebark on the third, and the Num-Ti-Jah suite on the fourth. Access is by stairs.</td><td>Choose the actual category, bed arrangement and floor. Ask how luggage, dining and any support needs fit the building.</td></tr>
<tr><th scope="row">Chalet</th><td>The advertised 2027 offering includes separate room and suite categories with forest or lake orientations. Selected first-floor rooms have access without stairs.</td><td>Check the named room and the whole entrance-to-bathroom route. A stair-free room description does not establish every access feature.</td></tr>
<tr><th scope="row">Children or additional guests</th><td>Occupancy conditions differ by category and stay year.</td><td>Give the operator everyone’s ages and required beds. Ask for written confirmation of the selected occupancy, additional charges and any pet requirements.</td></tr>
</tbody></table>
<p>Use a room decision rather than a generic “family lodge” label. The site has older FAQ wording alongside new Chalet categories, so applying one blanket age rule would be unreliable. Confirm the exact year and category directly. The operator publishes a standard two-night minimum with limited date-specific exceptions; check the actual stay length offered instead of planning around an assumed single night.</p>

<h2 id="meals">Build the day around the meal arrangement</h2>
<p>The advertised stay includes breakfast, a packed lunch, afternoon snacks and a four-course dinner. This is a different comparison from a room-only hotel with meals bought elsewhere. The <a href="${sources.dining}" target="_blank" rel="noopener">dining information</a> and <a href="${sources.contact}" target="_blank" rel="noopener">operator FAQ</a> explain the set-meal format. Tell the property about allergies and medical dietary requirements before reserving; a remote kitchen needs advance notice.</p>
<p>Plan the outing around the confirmed meal times and lunch collection. Do not book a distant dinner automatically when a lodge meal is part of your rate. Equally, confirm drinks, additional guests, the tourism levy and cancellation terms in the complete quote; “meals included” is not a promise that every purchase or charge is covered.</p>

<h2 id="arrival">Make arrival work without relying on a signal</h2>
<p>The operator identifies the property on Highway 93N, the Icefields Parkway, north of Lake Louise. Its mailing address does not put the lodge in Lake Louise village. The FAQ currently requests <strong>check-in between 3 and 5 p.m.</strong> and says it cannot accommodate arrivals after 5 p.m. Make that window part of the journey, with the booking confirmation taking priority.</p>
<p>Save directions, the reservation, contact details and road information before leaving a connected area. The operator states that the lodge has <strong>no telephones, TVs or Wi-Fi</strong>. If connectivity is essential, choose a different base. Confirm guest parking, luggage arrangements and any transfer directly; a Lake Louise address does not establish a shuttle from the village, airport or ski resort.</p>
<p>Check <a href="/conditions">dated road information and official report links</a> before departure. Leave flexibility for the Icefields Parkway, and read how the booking terms handle weather or road disruption. For a Lake Louise ski day, confirm the separate resort journey and return rather than equating a lakeside stay with accommodation at the ski base.</p>

<h2 id="stay-plan">A comfortable two-night outline</h2>
<ol><li><strong>Arrival afternoon:</strong> reach the confirmed check-in, settle into the chosen room and organise tomorrow’s lunch and equipment. Keep the first evening at the lodge.</li><li><strong>Main day:</strong> choose one appropriate outing or time indoors. Agree on the return around meals, daylight and the current conditions instead of stacking several distant stops.</li><li><strong>Departure morning:</strong> confirm breakfast and checkout arrangements, pack offline information and keep the onward road journey realistic.</li></ol>
<p>For packing and the choice of a winter activity, use the <a href="/packing-list/">packing checklist</a> and <a href="/winter/">winter planning guide</a>. The operator’s <a href="${sources.winter}" target="_blank" rel="noopener">winter page</a> identifies backcountry hazards and a required guest waiver. A stay does not supply the skills, route assessment or guide needed for an independent winter tour.</p>

<h2 id="water-and-ice">Keep lake use separate from the accommodation</h2>
<p><strong>Water rules checked October 29, 2026:</strong> Parks Canada places <strong>Bow Lake in the Water Preservation Zone</strong>, where it lists <strong>paddling, large inflatables and motorized boating as prohibited</strong>. Do not bring a canoe, kayak or paddleboard or plan around an assumed lodge rental. Read the <a href="${sources.water}" target="_blank" rel="noopener">current water-activity rules</a> and <a href="${sources.order}" target="_blank" rel="noopener">restricted-activity order</a>; a self-certification permit does not override a prohibited activity.</p>
<p>In winter, Parks Canada <a href="${sources.ice}" target="_blank" rel="noopener">does not monitor natural ice for safety</a>. This stay guide provides no lake-crossing, skating or backcountry route. Ask about an appropriate current outing, and keep a warm alternative. See <a href="${sources.winterSafety}" target="_blank" rel="noopener">Parks’ winter hazards and planning guidance</a> for the separate outdoor assessment.</p>

<h2 id="other-bases">When another base fits better</h2>
<p>If late arrival, reliable connectivity, a different room layout or independent restaurant choices are essential, compare a <a href="/towns/lake-louise/">Lake Louise base</a> and the <a href="/book/lake-louise-stays/">reviewed Lake Louise stay comparison</a>. You can also <a href="https://www.expedia.ca/Hotel-Search?destination=Lake%20Louise%2C%20Alberta&amp;camref=1101l3MtWX" target="_blank" rel="noopener sponsored">search Lake Louise accommodation on Expedia</a>. That is an affiliate destination search, not a verified booking link for this lodge; BanffBound may earn a commission from qualifying bookings.</p>
${faqHtml(stayFaqs)}
<h2 id="sources">Sources and review</h2><p>Reviewed October 29, 2026 using the linked Lodge at Bow Lake room, dining, FAQ, season and booking information, plus Parks Canada’s water restrictions and winter guidance. The seasonal details describe published offers, not live operation, room availability or a confirmed outdoor route.</p>
`,

  'numtijah-lodge': `
<p><strong>The red-roofed Bow Lake property formerly known as Num-Ti-Jah Lodge is now The Lodge at Bow Lake.</strong> This guide follows the former name, the operator’s account of the building’s history, and the choices involved in visiting for the day. For accommodation categories, meals, the seasonal calendar and arrival, use our separate <a href="/blog/num-ti-jah-lodge/">current Lodge at Bow Lake stay guide</a>.</p>
<p>A lake visit, an indoor café stop, a reserved dinner and an overnight stay are different plans. Decide which you want before leaving Lake Louise or adding the stop to an Icefields Parkway drive. That keeps a scenic visit useful even when a business is closed or the weather changes.</p>

<h2 id="name">Why the name changed</h2>
<p>The <a href="${sources.history}" target="_blank" rel="noopener">operator’s history page</a> explains that it consulted Stoney Nakoda Elders and Indigenous advisers. According to that account, the former name was neither formally gifted to Jimmy Simpson nor correctly spelled, and the Elders recommended removing it. Use the property’s current name in directions and booking enquiries. Do not turn an old travel-site translation into an authoritative account of the language or community’s relationship with the place.</p>
<p>Finding the lodge’s name on a visitor map is also not a complete history of Bow Lake. The operator acknowledges longstanding Indigenous connections to the area. Read that context alongside the outfitting story rather than treating the arrival of a European guide as the beginning of the place’s history.</p>

<h2 id="history">A building story with several chapters</h2>
<table><caption>Timeline from the current operator’s published account</caption><thead><tr><th scope="col">Chapter</th><th scope="col">What the account establishes</th></tr></thead><tbody>
<tr><th scope="row">Early lodge</th><td>The operator dates the original building to 1922 and attributes it to mountain guide Jimmy Simpson.</td></tr>
<tr><th scope="row">Later expansion</th><td>The original cabin developed into a larger lodge serving travellers on the Banff–Jasper highway. Its historic room count is not a present accommodation inventory.</td></tr>
<tr><th scope="row">Closure and renewal</th><td>The account describes a pandemic closure in 2020 and subsequent refurbishment by new owners.</td></tr>
</tbody></table>
<p>Look for the relationship between the building, lake and road when you visit. A historic exterior can remain recognisable while room layouts, management, visitor services and opening dates change. For those present-day decisions, follow current operator information rather than a historic photograph or an old lodge review.</p>

<h2 id="day-choices">Choose the kind of day visit</h2>
<table><thead><tr><th scope="col">Your objective</th><th scope="col">How to plan it</th></tr></thead><tbody>
<tr><th scope="row">Bow Lake scenery</th><td>Use designated visitor parking and an appropriate permitted lakeshore path. Bring what the group needs without depending on a café or lodge interior.</td></tr>
<tr><th scope="row">Provision Co.</th><td>Check the business’s actual season and opening notice before making it the food or warm-up stop.</td></tr>
<tr><th scope="row">Dinner at the lodge</th><td>Arrange the actual date and seating in advance; this is a separate reservation from a lake visit.</td></tr>
<tr><th scope="row">An overnight stay</th><td>Compare the building and room, meals and arrival window in the current stay guide.</td></tr>
</tbody></table>
<p><strong>Café notice checked October 29, 2026:</strong> the <a href="${sources.home}" target="_blank" rel="noopener">operator homepage</a> lists Provision Co. <strong>closed for the season</strong> and announces a spring 2027 return. That is a planned season, not confirmation of a reopening day. The page also describes limited dinner seating for day visitors with a reservation at least 24 hours ahead. Confirm the chosen date through the <a href="${sources.dining}" target="_blank" rel="noopener">dining page</a> before arranging the journey.</p>

<h2 id="arrival">Reach the actual lake stop</h2>
<p>The property is beside Bow Lake on Highway 93N north of Lake Louise, not in Lake Louise village or at Lake Louise Ski Resort. The <a href="${sources.day}" target="_blank" rel="noopener">operator’s day-visit instructions</a> identify two day-use parking areas, one by the highway and another along the access road. Use designated spaces and keep the roadside clear. Ask about the practical approach if mobility, a stroller, snow or luggage affects your visit.</p>
<p>If travelling with a tour or transfer, confirm that Bow Lake is an actual stop, where it leaves you, how long you have and the return arrangement. A drive through the Parkway does not supply a walking visit. Keep weather, available daylight and the onward journey in the plan, using <a href="/conditions/">current official road links</a> and the <a href="/parking/">parking and transport guide</a>.</p>

<h2 id="walks">A lake stop and a waterfall hike are different outings</h2>
<p>For a brief visit, remain on the designated visitor paths that suit the conditions and the group. Do not follow the edge farther simply because a photograph suggests a better angle. A farther objective needs its own map, supplies and return time.</p>
<p>The current <a href="${sources.hiking}" target="_blank" rel="noopener">Parks Canada hiking page</a> lists <strong>Bow Glacier Falls as 3.8 kilometres one way</strong>, with 95 metres of ascent and 20 metres of descent on its published profile. Returning on that route is approximately 7.6 kilometres before extra walking. This is a summer hiking description, not a winter-access assessment. Consult the <a href="/trails/bow-glacier-falls/">reviewed route record</a> and actual trail report if the falls are your objective.</p>
<p>For photography, give other visitors room to pass and keep equipment on permitted surfaces. Leave the shoreline and vegetation undisturbed, and follow wildlife guidance instead of approaching an animal to improve a composition. Water colour, reflections, visibility and an unobstructed view depend on the day; leave space in the itinerary for a different scene.</p>

<h2 id="water-and-winter">Water rules and winter change the plan</h2>
<p><strong>Rules checked October 29, 2026:</strong> Bow Lake is in Parks Canada’s <strong>Water Preservation Zone</strong>. Its <a href="${sources.water}" target="_blank" rel="noopener">water-activity page</a> lists <strong>paddling, large inflatables and motorized boating as prohibited</strong>. Do not treat a lakeside building or a generic self-certification station as evidence of canoe rentals or permission to launch. The <a href="${sources.order}" target="_blank" rel="noopener">current order</a> governs the activity.</p>
<p>Winter does not convert a summer walk into a confirmed route. Parks Canada <a href="${sources.ice}" target="_blank" rel="noopener">does not monitor natural ice for safety</a>, and its <a href="${sources.winterSafety}" target="_blank" rel="noopener">winter guidance</a> identifies thin ice and avalanche hazards. This guide supplies no lake-crossing directions. Choose an appropriate current outing, or keep the visit off the ice and use the <a href="/winter/">winter planning guide</a> for another activity.</p>

<h2 id="day-plan">Make one coherent Parkway stop</h2>
<ol><li>Choose lake scenery, a separately assessed hike or a confirmed business reservation as the main objective.</li><li>Check access, road conditions, food and the actual parking/meeting point before departure.</li><li>On arrival, keep the visit within the permitted area and the group’s practical walking limit.</li><li>Leave time for the onward road journey instead of adding every nearby viewpoint or trail.</li></ol>
<p>Put the stop into the <a href="/trip-builder/">trip builder</a>, compare <a href="/lakes/">lake planning choices</a> or choose a <a href="/towns/lake-louise/">Lake Louise base</a>. If the lodge itself is the reason for the trip, return to the <a href="/blog/num-ti-jah-lodge/">room, meals and arrival guide</a> and check the actual stay through the operator.</p>
${faqHtml(historyFaqs)}
<h2 id="sources">Sources and review</h2><p>Reviewed October 29, 2026 using the operator’s history, current café/dining notice and day-visit information, and the linked Parks Canada hiking, water and winter sources. The history is attributed to the operator; this article does not claim a personal visit, current availability or a verified property photograph.</p>
`,
};

type BowLakeGuideMetadata = {
  title: string; description: string; lastUpdated: string; readTime: string;
  imageIsIllustrative: true; imageNote: string;
};
const imageNote = 'Illustrative landscape image; not verified as The Lodge at Bow Lake, its rooms, or current lake conditions.';
export const bowLakeGuideMetadata: Record<string, BowLakeGuideMetadata> = {
  'num-ti-jah-lodge': { title: 'The Lodge at Bow Lake: Rooms, Meals, Seasons & Arrival', description: 'Plan a Lodge at Bow Lake stay with Historic Lodge and Chalet room decisions, meals, published seasons, check-in, winter travel and current lake-use rules.', lastUpdated: reviewedAt, readTime: '8 min read', imageIsIllustrative: true, imageNote },
  'numtijah-lodge': { title: 'Former Num-Ti-Jah Lodge: Bow Lake History & Day Visits', description: 'Understand the former Num-Ti-Jah name and Bow Lake lodge history, then plan a separate lake visit, café check, dinner reservation or summer waterfall hike.', lastUpdated: reviewedAt, readTime: '7 min read', imageIsIllustrative: true, imageNote },
};
