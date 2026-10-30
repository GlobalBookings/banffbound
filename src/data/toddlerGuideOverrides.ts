/** Full toddler-trip review; original publication remains 2025-11-11. */
export const reviewDate = '2026-10-29';
export const toddlerGuideSources: Record<string, Record<string, string>> = {
  'banff-toddler-guide': {
    playgrounds: 'https://www.banff.ca/831/Community-Parks',
    centralPark: 'https://www.banff.ca/833/Central-Park',
    bowFalls: 'https://www.banff.ca/654/Bow-Falls-Trail',
    hiking: 'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
    winterWalking: 'https://parks.canada.ca/pn-np/ab/banff/activ/marchehiver-winterwalking/banff',
    wildlife: 'https://parks.canada.ca/pn-np/ab/banff/visit/faune-wildlife/espace-space',
    lakeAccess: 'https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise',
    roam: 'https://roamtransit.com/general-route-faq/',
    airporter: 'https://banffairporter.com/travel-information/',
    childSeats: 'https://www.alberta.ca/child-seats',
    restraintLaw: 'https://www.alberta.ca/occupant-restraint-laws',
    sleep: 'https://www.canada.ca/en/public-health/services/safe-sleep/on-the-go.html',
    moose: 'https://moosehotelandsuites.com/superior-one-bedroom-suite/',
    tunnel: 'https://tunnelmountain.com/rooms/',
    louiseInn: 'https://www.lakelouiseinn.com/rooms/',
    whyte: 'https://www.whyte.org/visit',
    caveActivities: 'https://parks.canada.ca/lhn-nhs/ab/caveandbasin/activ',
    caveHours: 'https://parks.canada.ca/lhn-nhs/ab/caveandbasin/visit/heures-hours',
    protectedSprings: 'https://parks.canada.ca/voyage-travel/experiences/sources-springs',
    upperSprings: 'https://parks.canada.ca/pn-np/ab/banff/sources-banff-springs',
    gondola: 'https://www.banffjaspercollection.com/attractions/banff-gondola/faqs/',
  },
};
const s = toddlerGuideSources['banff-toddler-guide'];
const banffSearch = 'https://www.expedia.ca/Hotel-Search?destination=Banff%2C+Alberta&camref=1101l3MtWX';
const activitySearch = 'https://www.getyourguide.com/banff-l284/?partner_id=QW960HO';

export const toddlerGuideFaqs: Record<string, { question: string; answer: string }[]> = {
  'banff-toddler-guide': [
    { question: 'Can we visit Banff with a toddler without renting a car?', answer: 'Yes, when the actual journeys work for your family. Choose a base around meals, an indoor alternative and the transport you need. Roam has its own stroller and child-travel rules; airport and private transfers have different restraint and reservation requirements. Confirm every outward and return leg, including the walk with your bags and stroller.' },
    { question: 'Which Banff trails are suitable for a stroller?', answer: 'Choose a specific approach using its published surface, width, slope and current conditions. Central Park has a paved riverside pathway, but that does not describe the entire Bow Falls route. Fenland has roots and narrow sections. Lake Louise’s full lakeshore trail is not established here as a flat paved stroller route. Snow and ice require a separate decision; use the physical-profile comparison and ask about the actual section.' },
    { question: 'Does a family hotel booking include a cot or travel crib?', answer: 'Do not assume it. Confirm the exact product, allocation, setup, age and size limits, permitted occupancy and any charge with the property. A sofa bed, separate bedroom and cot are different arrangements. If travelling with a younger baby, use Health Canada’s safe-sleep guidance for the actual equipment; a car seat or stroller is not a replacement overnight sleep space.' },
    { question: 'What should we plan for a winter day with a toddler?', answer: 'Start with one modest outing, a checked warm indoor alternative and the whole return. Pack for the child’s less-active time, spare dry clothing, food and changing needs. Check the current approach, weather, operating day and transport. A summer easy grade, snow-covered playground or frozen-looking lake does not establish a suitable winter outing.' },
    { question: 'Are Cave and Basin and Upper Hot Springs interchangeable family activities?', answer: 'No. Cave and Basin is a heritage visit with protected thermal water and no swimming; its winter opening days and closure blocks need checking. Upper Hot Springs is a separate bathing facility. At the October 29, 2026 review, Parks listed maintenance from October 13 to early November, without a confirmed reopening in this guide. Confirm actual operation and child-specific facility rules before arranging a pool visit.' },
  ],
};
const esc = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function faqs(slug: string): string {
  const entries = toddlerGuideFaqs[slug];
  return entries.map(faq => `<details><summary>${esc(faq.question)}</summary><p>${esc(faq.answer)}</p></details>`).join('\n') + `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: entries.map(faq => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) }).replace(/</g, '\\u003c')}</script>`;
}

export const toddlerGuideOverrides: Record<string, string> = {
  'banff-toddler-guide': `
<p>A Banff holiday with a toddler can revolve around a small discovery: a river view, a playground visit or a few pictures in a museum before lunch. Give the day one main purpose and make the ordinary details work around it. A comfortable place to sleep, food when you need it and a straightforward return often matter more than adding another attraction.</p>
<p><strong>Full guide reviewed October 29, 2026.</strong> Use the <a href="/family-guide/">family outing filters</a> for ideas by youngest-child band, season and outing style. This guide adds the room, care and journey decisions for very young children. The hero image is illustrative; it does not verify a named outing, season or present conditions.</p>
<nav aria-label="Toddler guide sections"><p><a href="#toddler-day">Shape the day</a> · <a href="#toddler-room">Room and sleep</a> · <a href="#toddler-food">Food and supplies</a> · <a href="#toddler-transport">Transport</a> · <a href="#toddler-outings">Short outings</a> · <a href="#toddler-winter">Winter</a> · <a href="#toddler-indoor">Warm alternatives</a> · <a href="#toddler-return">Return and booking</a> · <a href="#toddler-questions">Questions</a></p></nav>

<h2 id="toddler-day">Give the day a flexible shape</h2>
<p>Start with your child’s familiar meals and rest needs, then choose an outing that leaves room around them. Count dressing, loading, waiting, changing and finding somewhere to eat as part of the excursion. There is no universal nap clock, hike distance or number of attractions that fits every toddler. Keep the return possible before everyone is exhausted.</p>
<table><caption>Three starting points to adapt, without prescribed times</caption><thead><tr><th scope="col">Kind of day</th><th scope="col">One main outing</th><th scope="col">How to keep it flexible</th></tr></thead><tbody>
<tr><th scope="row">Town day</th><td>A chosen riverside section or age-appropriate playground.</td><td>Have food and a nearby room or checked indoor stop available; shorten the outing when needed.</td></tr>
<tr><th scope="row">Lake day</th><td>A Lake Louise viewing visit with the actual journey arranged.</td><td>Keep a short endpoint, food, clothing and the useful return together. Leave a second lake for a separately planned day.</td></tr>
<tr><th scope="row">Weather-change day</th><td>A short cultural visit when operating.</td><td>Check opening, bags, stroller access and food arrangements before leaving; returning to the room is also an option.</td></tr>
</tbody></table>
<p>For a longer holiday, use the <a href="/trip-builder/">editable winter and summer itinerary builder</a>. Remove an outing when arrival, departure or a needed rest fills the day. If adults want different activities, agree who is caring for the child and where the group will reunite. A child’s ticket or a general family label does not provide childcare.</p>

<h2 id="toddler-room">Choose the room around sleep and care</h2>
<p>Write down the sleeping arrangement before comparing prices: everyone travelling, the permitted room occupancy, beds, space for the confirmed cot and where the adults will be during rest. Ask the hotel for the actual cot or travel-crib product, age and size limits, setup, availability and any charge. Do not treat a request entered at checkout as confirmation that one has been allocated.</p>
<p>A separate bedroom can help organise the evening, while stairs, a balcony or a loft create different supervision questions. Ask about the entrance, floor, elevator, stroller storage and bathroom. If travelling with a younger baby too, follow <a href="${s.sleep}" target="_blank" rel="noopener">Health Canada’s travel sleep guidance</a> for that child and equipment. A car seat or stroller is not a replacement overnight sleep space; the guidance asks caregivers to transfer babies to an appropriate sleep space on arrival.</p>
<table><caption>Published room examples; cot allocation and suitability remain separate</caption><thead><tr><th scope="col">Category</th><th scope="col">Documented distinction</th><th scope="col">What to ask next</th></tr></thead><tbody>
<tr><th scope="row"><a href="${s.moose}" target="_blank" rel="noopener">Moose Superior One Bedroom Suite</a></th><td>Microwave, mini fridge and sink; rain shower with no bathtub.</td><td>Actual sleeping layout, cot placement and the washing arrangements you need. The kitchenette is not a full cooking kitchen.</td></tr>
<tr><th scope="row"><a href="${s.tunnel}" target="_blank" rel="noopener">Tunnel Mountain Resort One Bedroom Condo</a></th><td>Queen bed in the bedroom, pullout sofa in the living room and a full kitchen.</td><td>Exact unit, stairs, equipment and transport. These features do not apply to every room at the property.</td></tr>
<tr><th scope="row"><a href="${s.louiseInn}" target="_blank" rel="noopener">Lake Louise Inn Standard rooms</a></th><td>Building 4 is a three-storey walk-up with no elevator; bedding differs by category.</td><td>The floor and luggage/stroller journey before selecting this building.</td></tr>
</tbody></table>
<p>Use the <a href="/blog/where-to-stay-in-banff/">base and room decision guide</a>, then the <a href="/book/banff-hotels/">Banff hotel comparison</a> or <a href="/book/lake-louise-stays/">Lake Louise area stay comparison</a>. Village, lakeshore and ski-resort addresses are separate. Include the journey back for a rest before choosing a base for its photographs or an apparent room saving.</p>

<h2 id="toddler-food">Make food and changing arrangements ordinary</h2>
<p>Plan the first breakfast and an easy arrival meal before a long shopping or sightseeing day. Check what the room actually contains: a mini fridge, microwave, cooking kitchen and washing space solve different needs. Ask about equipment you depend on rather than assuming that “family suite” includes it. Keep an alternative if room access starts later than your arrival.</p>
<p>Carry familiar food, drinking water and the supplies needed for the whole outing and return. Ask a restaurant about a high chair, stroller space, allergy questions and current service before making it the only meal option. Pack changing supplies and a spare set of clothes where you can reach them. Locate a toilet and changing option for the specific stop; a facility symbol does not confirm its winter operation.</p>
<p>At museums, check where food and bags belong. <a href="${s.whyte}" target="_blank" rel="noopener">The Whyte’s visit page</a> lists lockers for belongings, food and beverages. Plan the snack break around the venue’s arrangements rather than treating exhibition rooms as a picnic area.</p>

<h2 id="toddler-transport">Join the seat, stroller and return journey</h2>
<p>A car-free trip can work around confirmed connections and a useful base. The <a href="/calgary-to-banff/">airport arrival and flight-home guide</a> separates baggage, collection and road travel; <a href="/car-free-banff/">car-free planning</a> joins town, regional and resort services. Give the provider the child’s actual requirements privately when making the booking.</p>
<ul>
<li><strong>Airport coach:</strong> <a href="${s.airporter}" target="_blank" rel="noopener">Banff Airporter</a> requires a separate booked seat for every child or infant and says it can provide child safety seats. Arrange the appropriate restraint and availability in advance. It lists no onboard washrooms, so discuss practical needs before the journey. Its scheduled service does not reach Lake Louise.</li>
<li><strong>Local or regional bus:</strong> <a href="${s.roam}" target="_blank" rel="noopener">Roam’s FAQ</a> permits children without car seats under its own policy; it does not supply them. Its MCI coach seatbelts are not designed for infant or toddler car seats. Strollers may need folding to keep the aisle clear. Remaining in a stroller in the accessible area depends on space, and another passenger’s access needs may require it to be folded. Large folded models can also obstruct the aisle.</li>
<li><strong>Rental car or private transfer:</strong> resolve the actual child restraint, vehicle fit, installation, bags and return with the provider. Use <a href="${s.childSeats}" target="_blank" rel="noopener">Alberta’s child-seat guidance</a> and <a href="${s.restraintLaw}" target="_blank" rel="noopener">occupant-restraint rules</a>, which include vehicle-specific exemptions. A legal exemption does not establish a suitable restraint arrangement. Follow the equipment and vehicle instructions; do not apply a public-bus policy to a rental car.</li>
</ul>
<p>For lake visits, use <a href="${s.lakeAccess}" target="_blank" rel="noopener">Parks Canada’s access page</a> and <a href="/shuttle-reservations/">the lake transport comparison</a> to confirm the departure base, child reservation, stroller loading and last return with the actual carrier. Moraine Lake Road is closed to personal vehicles year-round, with specified authorized exceptions. A rental car does not create access, and a summer shuttle is not a winter connection.</p>

<h2 id="toddler-outings">Pick an endpoint, not a blanket stroller label</h2>
<p>A short outing can feel complete without reaching a named trail’s end. Choose the section and turnaround from the child, equipment and conditions. The <a href="/accessible-trails/">physical-profile comparison</a> explains surfaces, widths and slopes without deciding suitability for your stroller.</p>
<ul>
<li><strong>Town riverside time:</strong> <a href="${s.centralPark}" target="_blank" rel="noopener">Central Park</a> has a paved riverside pathway and picnic facilities. That does not describe the whole route to Bow Falls: the <a href="${s.bowFalls}" target="_blank" rel="noopener">Town’s Bow Falls trail page</a> describes a climb above the falls and a clifftop section closed in winter. Choose the actual approach and keep clear of the river edge.</li>
<li><strong>A playground visit:</strong> the <a href="${s.playgrounds}" target="_blank" rel="noopener">Town’s equipment-age list</a> identifies Rotary Park for ages 2–5 and Central Park for ages 5–12. Check posted ages and current conditions; neither listing establishes equipment for a child under two. The Town notes seasonal swing removal during the elk rut.</li>
<li><strong>A forest or lake walk:</strong> <a href="${s.hiking}" target="_blank" rel="noopener">Parks’ hiking profiles</a> describe Fenland as a 1.9 km loop with roots and a minimum width of 62 cm. The Lake Louise Lakeshore listing is 2.3 km one way. Neither establishes the whole trail as a flat paved stroller route. Plan a selected section and its return; summer profiles are not winter access reports.</li>
</ul>
<p>Look at wildlife from a distance and let children enjoy spotting shapes, colours and sounds without approaching animals. <a href="${s.wildlife}" target="_blank" rel="noopener">Parks Canada prohibits feeding, enticing or disturbing wildlife</a>, including small animals. Do not chase squirrels, offer food or encourage an animal to move for a photograph. Stay on permitted paths and leave natural objects in place.</p>

<h2 id="toddler-winter">Make a winter plan for the least active person</h2>
<p>Begin with a modest outing near a checked warm alternative. A child riding in a stroller or carrier is less active than the adult doing the walking; plan clothing, breaks and observation accordingly. Carry spare dry layers, mittens, food and the changing kit. Follow the carrier or stroller manufacturer’s instructions for the child and equipment rather than treating one type as suitable for every winter trail.</p>
<p>Read <a href="${s.winterWalking}" target="_blank" rel="noopener">Parks’ winter walking guidance</a> and <a href="/conditions/">current source reports</a> before choosing the approach. Ice, snow, cold, visibility and daylight can change the plan. A summer easy grade, snow-covered playground or frozen-looking lake does not establish a suitable winter outing. Keep off unassessed natural ice and closed paths. Use the <a href="/blog/banff-family-winter/">family winter guide</a> for managed activity choices and operator-specific checks.</p>

<h2 id="toddler-indoor">Keep a real warm alternative</h2>
<p><strong>The Whyte:</strong> at 111 Bear Street, this offers a cultural visit to adapt to your child’s attention. Its visit page lists holiday exceptions, so confirm the actual day, current exhibitions, stroller route and food arrangements. A short look followed by a snack elsewhere can be the whole outing; no particular programme or toddler session is promised.</p>
<p><strong>Cave and Basin:</strong> <a href="${s.caveActivities}" target="_blank" rel="noopener">Parks lists interpretation, theatre and outdoor trails</a>. Choose the permitted parts of the heritage visit, asking about your stroller and current conditions. The <a href="${s.caveHours}" target="_blank" rel="noopener">hours page checked October 29</a> lists Thursday–Monday winter opening, with holiday and temporary closure blocks. Check your date before leaving. Under <a href="${s.protectedSprings}" target="_blank" rel="noopener">Parks’ thermal-habitat protection</a>, swimming at Cave and Basin is prohibited; it is not a wading or bathing alternative.</p>
<p><strong>Pool plans:</strong> ask the actual facility about children, supervision, changing, the booked session and current operation. At this review, <a href="${s.upperSprings}" target="_blank" rel="noopener">Parks’ Upper Hot Springs notice</a> lists maintenance from October 13 to early November, 2026. Reopening is unconfirmed here. The separate <a href="/blog/banff-hot-springs-guide/">hot-springs guide</a> helps you check the facility; do not build a toddler day around an assumed soak or casual lake wading.</p>
<p><strong>A gondola visit:</strong> treat this as its own booked outing. The <a href="${s.gondola}" target="_blank" rel="noopener">Banff Gondola operator FAQ</a> does not recommend strollers and identifies 368 shallow stairs each way on the outdoor summit boardwalk. Elevators serve the summit-building levels; that does not make the boardwalk step-free. Cabins are unheated. Check current operation, equipment and the return before choosing this over a town day.</p>

<h2 id="toddler-return">Finish the plan with the return and the actual booking</h2>
<p>Keep the day bag ready for the full journey: food, water, changes, weather layers, tickets and the useful return instructions. Save contacts and confirmations offline through the <a href="/blog/banff-mobile-connectivity/">connectivity preparation guide</a>, and adapt the <a href="/packing-list/">activity packing checklist</a>. Agree what will make you turn back or choose the room instead of adding another stop.</p>
<p>Use the <a href="/blog/banff-first-time-tips/#first-visit-planner">six-step first-visit planning checklist</a> to join arrival, room, outings, access, quotes and backup. In the <a href="/trip-cost/">quote-based trip-cost planner</a>, include the actual people, nights, room layout, transfers and confirmed inclusions. A child’s age does not by itself establish a free room, cot, seat or activity.</p>
<p>For a broader search, <a href="${banffSearch}" target="_blank" rel="noopener sponsored">compare Banff destination accommodation on Expedia</a> and <a href="${activitySearch}" target="_blank" rel="noopener sponsored">browse Banff activities on GetYourGuide</a>. These inherited links are general destination searches, not verified toddler-eligible products, confirmed cot inventory or childcare. BanffBound may earn a commission from qualifying bookings. Use the named operator’s rules and the exact accommodation confirmation before payment.</p>

<h2 id="toddler-questions">Questions about visiting with a toddler</h2>
${faqs('banff-toddler-guide')}
<h2 id="toddler-sources">Sources and review</h2>
<p>Checked October 29, 2026 against the linked Town, Parks Canada, Alberta, Health Canada and operator pages. They establish selected published features and policies, not an inspection, live reservation, cleared winter path or individual equipment fit. Recheck current notices and your actual confirmations before the outing.</p>
`,
};

export const toddlerGuideMetadata: Record<string, { title: string; description: string; lastUpdated: string; readTime: string; imageIsIllustrative: true; imageNote: string }> = {
  'banff-toddler-guide': {
    title: 'Banff with Toddlers: Rooms, Short Outings & Winter Plans',
    description: 'Plan a flexible Banff toddler trip with actual room and cot questions, short outings, stroller and child-travel policies, food, winter alternatives and the return.',
    lastUpdated: reviewDate, readTime: '13 min read', imageIsIllustrative: true,
    imageNote: 'Illustrative image; not verified as a named family outing, location, season or current conditions.',
  },
};
