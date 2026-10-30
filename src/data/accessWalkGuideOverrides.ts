/** Retained-URL outdoor planning draft; original publication remains 2025-09-18. */
export const reviewDate = '2026-10-29';
export const accessWalkGuideSources: Record<string, Record<string, string>> = {
  'banff-accessible-hikes': {
    hiking: 'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
    tourism: 'https://www.banfflakelouise.com/accessibility',
    centralPark: 'https://www.banff.ca/833/Central-Park',
    bowFalls: 'https://www.banff.ca/654/Bow-Falls-Trail',
    parkway: 'https://parks.canada.ca/pn-np/ab/jasper/activ/itineraires-itineraries/promenadedesglaciers-icefieldsparkway',
    lakeAccess: 'https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise',
    shuttle: 'https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise/faq',
    roam: 'https://roamtransit.com/about-us/transportation-policies/',
    report: 'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking/etat-sentiers-trail-conditions',
    winter: 'https://parks.canada.ca/pn-np/ab/banff/activ/marchehiver-winterwalking/banff',
    johnston: 'https://parks.canada.ca/pn-np/ab/banff/bulletins/06d4ef61-a3c9-4b65-8dfc-66d056252d6c',
    adaptive: 'https://rockymountainadaptive.com/',
    cave: 'https://parks.canada.ca/lhn-nhs/ab/caveandbasin/activ/activites-activities/introduction-basictour',
    caveHours: 'https://parks.canada.ca/lhn-nhs/ab/caveandbasin/visit/heures-hours',
    gondola: 'https://www.banffjaspercollection.com/attractions/banff-gondola/faqs/',
  },
};
const s = accessWalkGuideSources['banff-accessible-hikes'];
const hotels = 'https://www.expedia.ca/Hotel-Search?destination=Banff%2C+Alberta&camref=1101l3MtWX';
const activities = 'https://www.getyourguide.com/banff-l284/?partner_id=QW960HO';
export const accessWalkGuideFaqs: Record<string, { question: string; answer: string }[]> = {
  'banff-accessible-hikes': [
    { question: 'Does an easy hiking grade mean a whole route suits my wheelchair or stroller?', answer: 'No. Compare the actual surface, narrowest width, maximum grade, cross slope and obstacles, then discuss your equipment, assistance and intended endpoint with the land manager. A paved section, parking symbol or general accessibility label does not describe the whole route or its present condition.' },
    { question: 'Can a viewpoint or selected section be the whole outing?', answer: 'Yes. Choose the actual place you want to reach and confirm the approach, turning space, rest and washroom arrangements, then include the return to your vehicle or stop. Do not invent a shortcut or assume a short outward section means an easy return. A lower viewpoint and a full loop, canyon or uphill trail are different plans.' },
    { question: 'Which approach serves the Peyto Lake barrier-free route?', answer: 'Parks describes a 0.3 km barrier-free trail from the restricted upper parking lot, for accessible vehicles and buses only. This does not describe every path from the main public lot or establish winter clearance. Confirm the actual vehicle access, surface, facilities and assistance for your date; a full parking area does not authorize a road-shoulder alternative.' },
    { question: 'Can I use the published summer measurements to decide winter access?', answer: 'No. Snow, ice, ploughing, hidden edges and closed facilities change the journey. Check the exact winter description and current reports, discuss the approach with Parks or the operator and keep another outing near your base. A measured width, easy grade or rented device does not confirm a cleared path or override a closure.' },
    { question: 'Does an accessible bus or shuttle booking establish access beyond the stop?', answer: 'No. Resolve the actual vehicle, equipment fit, boarding, assistance, drop-off and final path, plus the return. The published regular Parks lake-shuttle arrangement differs from Alpine Start; its 2026 season is past. Confirm the actual future service and companions’ arrangements. A transport ticket does not assess every trail or reserve an accessible parking stall.' },
  ],
};
const esc = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function faqs(slug: string): string {
  const entries = accessWalkGuideFaqs[slug];
  return entries.map(faq => `<details><summary>${esc(faq.question)}</summary><p>${esc(faq.answer)}</p></details>`).join('\n') + `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: entries.map(faq => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) }).replace(/</g, '\\u003c')}</script>`;
}
export const accessWalkGuideOverrides: Record<string, string> = {
  'banff-accessible-hikes': `
<p>A river view, a lake beside the mountains or a short forest outing can be a complete Banff day. Begin with the experience you want and choose the actual place to turn around. Then join that endpoint to the parking space or bus stop, the facilities and the journey home. You do not need to complete a named trail to enjoy being outside.</p>
<p><strong>Full guide reviewed October 29, 2026.</strong> This is an outdoor endpoint-planning guide. Use the <a href="/accessible-trails/#trail-profiles">interactive comparison of published trail profiles</a> for the detailed Fenland, Marsh and Minnewanka measurements, and the <a href="/blog/accessible-banff/">broader accessible-visit guide</a> for arrival, room and service arrangements. The hero image is illustrative, not verified as a particular route, access feature or current surface.</p>
<nav aria-label="Outdoor access guide sections"><p><a href="#walk-endpoint">Choose an endpoint</a> · <a href="#walk-profile">Read a physical profile</a> · <a href="#walk-town">Town views</a> · <a href="#walk-lakes">Lake outings</a> · <a href="#walk-peyto">Peyto approach</a> · <a href="#walk-journey">Join the journey</a> · <a href="#walk-winter">Winter and closures</a> · <a href="#walk-support">Assistance and alternatives</a> · <a href="#walk-booking">Confirm the plan</a> · <a href="#walk-questions">Questions</a></p></nav>

<h2 id="walk-endpoint">Choose what you want to reach</h2>
<p>Give the outing a specific purpose: see the river from a chosen town section, spend time at a lake viewing area, or follow a selected route with the support you need. Explain that purpose when asking Parks, the Town or an operator for advice. “Can I visit the viewpoint from this parking area?” is a more useful question than “Is Banff accessible?”</p>
<table><caption>Different outdoor formats to investigate, not a list of universally accessible routes</caption><thead><tr><th scope="col">Format</th><th scope="col">Possible focus</th><th scope="col">Decision before travelling</th></tr></thead><tbody>
<tr><th scope="row">Town riverside time</th><td>A selected Central Park pathway section and a break nearby.</td><td>The current surface, endpoint and complete return to the actual entrance or stop.</td></tr>
<tr><th scope="row">Waterfall viewing</th><td>A separately confirmed Bow Falls viewing approach.</td><td>The lower viewing area versus the climbing through-route and winter clifftop closure.</td></tr>
<tr><th scope="row">Lake Louise</th><td>The lakeshore view or a specifically selected path segment.</td><td>Where the vehicle or service arrives, facilities, turning space and the return.</td></tr>
<tr><th scope="row">Minnewanka</th><td>A day-use-area visit, or a separately assessed Stewart Canyon outing.</td><td>The change from rough paving to natural trail, with the whole route considered.</td></tr>
<tr><th scope="row">Peyto Lake</th><td>The upper-lot barrier-free approach when available and suitable.</td><td>Restricted vehicle access, actual conditions and the complete Parkway journey.</td></tr>
</tbody></table>
<p>These formats do not rank disabilities or prescribe a distance from a diagnosis. Consider your equipment, fatigue, assistance and preferences, including how the return differs from going out. Agree on an alternative before committing to a distant pickup or timed booking. A shorter visit can leave more space for conversation, photographs or a meal afterwards.</p>

<h2 id="walk-profile">Read the physical detail behind an easy grade</h2>
<p><a href="${s.hiking}" target="_blank" rel="noopener">Parks Canada’s hiking page</a> supplies physical profiles for selected routes. Here is one worked example. <strong>Width is typical / minimum; grade and cross slope are typical / maximum.</strong> Grade is the slope along the route; cross slope is the sideways tilt. The largest or narrowest figure can matter even when it describes only part of the outing.</p>
<table><caption>Fenland Loop: published measurements, not present access or a device verdict</caption><thead><tr><th scope="col">Feature</th><th scope="col">Published detail</th></tr></thead><tbody>
<tr><th scope="row">Distance basis</th><td>1.9 km loop.</td></tr>
<tr><th scope="row">Surface mix</th><td>83% hard soil; 15% hard aggregate/gravel; 2% wood-decking.</td></tr>
<tr><th scope="row">Width: typical / minimum</th><td>162 / 62 cm.</td></tr>
<tr><th scope="row">Grade: typical / maximum</th><td>3 / 26%.</td></tr>
<tr><th scope="row">Cross slope: typical / maximum</th><td>3 / 21%.</td></tr>
<tr><th scope="row">Obstacle</th><td>Significant roots; the first identified root obstacle is 237 m counterclockwise from the trailhead.</td></tr>
</tbody></table>
<p>That profile does not support calling the whole loop flat, paved or barrier-free. Nor does a distance to a photographed obstacle guarantee that everything before it fits your needs. Discuss the intended section, turning space and actual conditions; do not move off the designated path to bypass a difficult part.</p>
<p>Open the <a href="/accessible-trails/#trail-profiles">three-profile comparison</a> to investigate Fenland, Marsh Trail or Minnewanka to Stewart Canyon side by side. It keeps the full published surface, width, grade and cross-slope pairs together. Use those features to prepare questions, rather than converting an “easy” hiking label into a wheelchair, scooter or stroller verdict.</p>

<h2 id="walk-town">Town views: distinguish a short stop from a through-walk</h2>
<p>The <a href="${s.centralPark}" target="_blank" rel="noopener">Town’s Central Park page</a> describes a paved riverside pathway, picnic tables and washroom facilities. It can be a starting point for a deliberately small outing. Ask about the approach from your actual parking place or stop, current work or snow, the facility you need and a place to rest. Its general facility list is not a winter opening confirmation.</p>
<p>Bow Falls is a separate choice. <a href="${s.tourism}" target="_blank" rel="noopener">Banff &amp; Lake Louise Tourism</a> identifies shorter viewing approaches, including Bow Falls, Lake Louise, Bow Lake and Vermilion Lakes, while asking visitors to confirm individual requirements. A viewing-area listing does not measure a whole connecting trail.</p>
<p>The <a href="${s.bowFalls}" target="_blank" rel="noopener">Town’s Bow Falls trail description</a> climbs above the falls and says its clifftop section is closed in winter. Confirm the particular viewing approach independently. Do not plan the full town-to-falls path as a flat paved loop, continue onto a closed section, or use the river ice as an alternative. A lower view and the route above it are different endpoints.</p>
<p>For a town-led day, choose that one confirmed outdoor stop and a meal or indoor visit that fits the return. The <a href="/towns/banff/">Banff base guide</a> helps place the address and stop; the <a href="/eat-and-drink/#dining-finder">dining finder</a> helps locate food. Ask the venue about its actual entrance, seating and washroom arrangements before making it your only break.</p>

<h2 id="walk-lakes">Lake views and complete lakeshore trails are different objectives</h2>
<p>At Lake Louise, decide whether your objective is the familiar lakeshore view or a longer route. Parks lists the full Lakeshore Trail as <strong>2.3 km one way</strong>; that does not establish a fully paved route with one uniform slope. Select an endpoint and discuss the surface and return, rather than relying on a photograph or a universal “first kilometre is accessible” claim.</p>
<p>Keep Lake Louise village, the lakeshore and the ski resort separate in the travel plan. Use <a href="/blog/lake-louise-village-guide/">the place and arrival guide</a> and <a href="/shuttle-reservations/">the lake transport comparison</a> for the actual boarding point and return. A village stop does not finish the lakeshore journey. Your own planned visit need not include Moraine Lake as well.</p>
<p>At Minnewanka, the day-use area and the route to Stewart Canyon are also different outings. Parks’ profile describes rough paving followed by natural trail, with rock and root sections and exposure. Do not turn the presence of paving near the start into an assurance about the canyon route. Read the complete <a href="/accessible-trails/#trail-profiles">Minnewanka physical profile</a>, then choose the actual approach, rest point and turnaround with current advice.</p>
<p>For either lake, ask which washroom is available, how you reach it, and whether assistance or equipment is required. Include the distance from parking or the drop-off, waiting and the final return. A lake name or accessible parking symbol does not answer those questions.</p>

<h2 id="walk-peyto">Peyto: arrange the upper approach explicitly</h2>
<p><a href="${s.parkway}" target="_blank" rel="noopener">Parks’ Parkway guide</a> describes a <strong>0.3 km barrier-free trail from the upper parking lot</strong>, restricted to accessible vehicles and buses. That is a particular approach, not every path from the main public parking area. Confirm vehicle eligibility, the actual path and facilities before setting out; do not use a road shoulder or assume the upper area is general overflow parking.</p>
<p>The <a href="/blog/peyto-lake-guide/">Peyto viewpoint guide</a> distinguishes that approach, the main lookout, Bow Summit Viewpoint and the separate shore trail. Choose one destination. Continuing uphill or down to the lake because the first view was manageable creates another route decision, with another return.</p>
<p>The destination-tourism accessibility page lists Peyto as a summer-only viewing option. Its listing does not promise a cleared winter path. Join any visit to the road journey through the <a href="/icefields-parkway-planner/">Parkway planning tool</a>, including weather, current access, food and a workable return or overnight base. A short published trail does not make the remote road journey short or guarantee a view.</p>

<h2 id="walk-journey">Resolve parking-to-path and the last connection home</h2>
<p>Work through the sequence in both directions: room entrance, stop or parking space, unloading, path entrance, chosen endpoint, washroom or rest, and return. Ask who can provide any physical assistance and what has actually been agreed. Include equipment dimensions, turning, surface transitions and securement when speaking privately with the relevant provider.</p>
<p><a href="${s.roam}" target="_blank" rel="noopener">Roam’s transport policies</a> describe ramps and mobility-aid arrangements, with possible fit limits for some devices and turns inside the vehicle. Confirm the actual device, stop and assistance; a driver may be unable to provide physical help. A ramp-equipped bus does not establish an accessible final path or reserved space for every companion.</p>
<p>The <a href="${s.shuttle}" target="_blank" rel="noopener">Parks lake-shuttle FAQ</a> describes requesting an accessible vehicle at Park and Ride check-in with a pre-purchased ticket for the regular service, with companions subject to space. The published 2026 Alpine Start product had no accessible service. <a href="${s.lakeAccess}" target="_blank" rel="noopener">That Parks shuttle season ended October 12, 2026</a>; confirm the actual future arrangements rather than inventing a winter or next-year service.</p>
<p>The FAQ says accessible lakeshore parking is first-come, first-served and cannot be guaranteed, and that Moraine Lake has no accessible parking. A placard does not reserve a stall or override Moraine’s personal-vehicle restriction. Use <a href="/parking/">parking planning</a> and <a href="/car-free-banff/">car-free journey planning</a> to compare actual connections. A hotel transfer or commercial tour needs its own equipment, boarding, endpoint and return confirmation.</p>

<h2 id="walk-winter">Treat snow season and current closures separately</h2>
<p>Published measurements describe a route, not a promise that it is cleared today. Snow can hide edges and obstacles; ice changes grip, braking and cross-slope effects. Read <a href="${s.winter}" target="_blank" rel="noopener">Parks’ winter walking guidance</a>, the <a href="${s.report}" target="_blank" rel="noopener">current trail report</a> and the actual local notice before choosing the outing. Equipment does not override a closure or provide terrain skills.</p>
<p><strong>Johnston Canyon, checked October 29, 2026:</strong> the <a href="${s.johnston}" target="_blank" rel="noopener">order issued October 13 closes the trail and day-use area, including P1 parking and washrooms, with a scheduled December 11 end</a>. Reopening is not confirmed here. Do not substitute an unfamiliar approach as an accessible workaround. The Bow Falls winter clifftop closure is a separate local restriction.</p>
<p>Choose a different outing when the whole journey, conditions or assistance do not fit. Keep a warm alternative and enough flexibility for the return. The <a href="/conditions/">dated conditions hub</a> links official reports; a town forecast alone does not describe every viewpoint or mountain route.</p>

<h2 id="walk-support">Arrange support and a different kind of visit</h2>
<p><a href="${s.adaptive}" target="_blank" rel="noopener">Rocky Mountain Adaptive</a> publishes adapted programmes in the Bow Valley. Ask about the specific outing, venue, equipment, instructor or assistance and date. An enquiry is not a reserved device or session, and this guide establishes no free all-terrain chair loan at a visitor centre.</p>
<p>For an alternative, Parks describes the <a href="${s.cave}" target="_blank" rel="noopener">Cave and Basics introductory tour</a> as an accessible indoor/outdoor heritage experience. Confirm your intended parts of the visit and the <a href="${s.caveHours}" target="_blank" rel="noopener">actual opening day and closure blocks</a>. The building or programme’s access features do not establish access along Marsh Trail or every surrounding boardwalk.</p>
<p>A gondola is another separate format. The <a href="${s.gondola}" target="_blank" rel="noopener">Banff Gondola operator FAQ</a> distinguishes summit-building elevators from the outdoor boardwalk, which has <strong>368 shallow stairs each way and is not wheelchair accessible</strong>. Check equipment fit, loading and current operation. Building access does not establish a step-free route to every outdoor viewpoint.</p>

<h2 id="walk-booking">Keep the confirmation specific</h2>
<ol><li><strong>Name the endpoint and approach.</strong> Keep the starting place and complete return with the plan.</li><li><strong>Confirm current conditions and facilities.</strong> Include the washroom, resting places and any closure.</li><li><strong>Arrange actual assistance and transport.</strong> Record what the provider has accepted, including companions and equipment.</li><li><strong>Join the base and room.</strong> An allocated room and the route out of it are separate from the outdoor path.</li><li><strong>Keep a different option.</strong> Save contacts and instructions offline and leave room to change the day.</li></ol>
<p>Use the <a href="/blog/accessible-banff/">accessible arrival and room guide</a>, <a href="/book/banff-hotels/">Banff hotel comparison</a> or <a href="/book/lake-louise-stays/">Lake Louise area stay comparison</a> for the overnight decision. Confirm the actual category and access features before payment. The <a href="/packing-list/">packing checklist</a> organises equipment; it does not assess a route.</p>
<p>The inherited <a href="${hotels}" target="_blank" rel="noopener sponsored">Expedia Banff accommodation search</a> and <a href="${activities}" target="_blank" rel="noopener sponsored">GetYourGuide Banff activity catalogue</a> remain broad destination searches. They are not verified accessible-room inventory, adapted excursions or individual device approval. BanffBound may earn a commission from qualifying bookings. Ask the actual property or operator about the precise arrangement you intend to buy.</p>
<h2 id="walk-questions">Questions about outdoor access</h2>
${faqs('banff-accessible-hikes')}
<h2 id="walk-sources">Sources and review</h2>
<p>Checked October 29, 2026 against the linked primary land-manager, Town, destination-tourism and operator sources. Measurements and published features are distinct from current surface, assistance or availability. This guide supplies endpoint-planning examples, not a complete accessible-route inventory or an inspection of your equipment.</p>
`,
};
export const accessWalkGuideMetadata: Record<string, { title: string; description: string; lastUpdated: string; readTime: string; imageIsIllustrative: true; imageNote: string }> = {
  'banff-accessible-hikes': {
    title: 'Banff Outdoor Access: Viewpoints, Walks & the Whole Return',
    description: 'Choose a Banff outdoor endpoint using published physical features, selected viewpoint approaches, actual facilities, transport, assistance and a complete return.',
    lastUpdated: reviewDate, readTime: '12 min read', imageIsIllustrative: true,
    imageNote: 'Illustrative image; not verified as a named route, accessible approach, surface, season or current conditions.',
  },
};
