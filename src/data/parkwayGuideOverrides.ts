/** Full reviews. Original publication dates remain in blogPosts.ts. */
export const reviewDate = '2026-10-29';
const sources = {
  travel: 'https://parks.canada.ca/pn-np/ab/banff/visit/promenadedesglaciers-icefieldsparkway',
  winter: 'https://parks.canada.ca/pn-np/ab/jasper/activ/experience/hiver-winter/pcghiver-ipwinter',
  hiking: 'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
  discovery: 'https://parks.canada.ca/pn-np/ab/jasper/activ/itineraires-itineraries/promenadedesglaciers-icefieldsparkway',
  jasperTrails: 'https://parks.canada.ca/pn-np/ab/jasper/activ/experience/sentiers-trails/glaciers-icefields',
  glacier: 'https://parks.canada.ca/pn-np/ab/jasper/activ/itineraires-itineraries/glacier-athabasca',
  crossing: 'https://www.thecrossingresort.com/',
  lodge: 'https://lodgeatbowlake.com/',
  opening: 'https://www.banffjaspercollection.com/plan-your-trip/opening-dates/',
  water: 'https://parks.canada.ca/pn-np/ab/banff/activ/nautiques-sports',
  recovery: 'https://parks.canada.ca/pn-np/ab/jasper/gestion-management/serviceimmobilier-realty/retablissement-recovery/pc-recovery',
  closure: 'https://parks.canada.ca/pn-np/ab/jasper/bulletins/76ecae58-8a63-480c-8304-dc903837eefd',
  roads: 'https://parks.canada.ca/pn-np/ab/jasper/visit/routes-roads',
  roadReport: 'https://511.alberta.ca/',
  brewster: 'https://www.banffjaspercollection.com/brewster-express/faqs/',
  sundog: 'https://www.sundogtours.com/package/jasper-lake-louise-banff-calgary',
};

export const parkwayGuideFaqs: Record<string, { question: string; answer: string }[]> = {
  'icefields-parkway-guide': [
    { question: 'Do I need to stop at every Icefields Parkway viewpoint?', answer: 'No. Choose a few stops for the scenery and walking your party wants, then keep alternatives. A parking stop, a maintained viewpoint approach and a longer hike have different demands. A list of attractions does not establish that all are accessible or fit the day.' },
    { question: 'Where do the distances in this guide start?', answer: 'The Bow Lake, Peyto and Mistaya trailhead figures use the Highway 1 / Highway 93N junction northward. They do not start at your Banff hotel or Lake Louise village. Parks also publishes distances from other origins, so retain the named reference point instead of combining figures from different maps.' },
    { question: 'Can I buy fuel at Saskatchewan River Crossing in winter?', answer: 'Do not plan on it. Parks identifies the fuel stop as summer-only. At the October 29, 2026 review, The Crossing Resort said all services were closed for winter and its planned April 2027 return date was unconfirmed. Fuel before leaving Lake Louise or Jasper and carry the supplies needed for the journey.' },
    { question: 'Can I walk from the glacier viewpoint onto the Athabasca Glacier?', answer: 'No self-guided glacier entry is recommended here. Parks warns of unstable ice and hidden crevasses and directs visitors not to cross the barriers. A designated viewpoint trail, an operator-led glacier activity and walking onto glacier ice are different activities.' },
    { question: 'Does a summer trail grade apply to a winter stop?', answer: 'No. Snow, an unplowed access road, ice and avalanche exposure can change the outing. Choose a current official winter route and check its approach and conditions separately. A summer distance or easy grade is not a winter access assessment.' },
  ],
  'banff-to-jasper-drive': [
    { question: 'Is the whole Banff-to-Jasper journey 232 kilometres?', answer: 'No. Parks describes the Icefields Parkway section between Lake Louise and Jasper as approximately 232 kilometres. Starting in Banff adds the approach on Highway 1 and the journeys to the actual accommodation addresses. This guide does not turn that distance into a promised arrival time.' },
    { question: 'Which tire rule applies on the Icefields Parkway?', answer: 'Parks requires snow tires marked with a snowflake or M+S symbol, or tire chains, from November 1 to March 31 and during any other period when the Parkway is snow- or ice-covered. Check the actual rental vehicle and route requirements. Rules for a separate British Columbia journey are a different check.' },
    { question: 'Should I book a Parkway lodge as a winter stopover?', answer: 'Only after confirming its exact operating dates, room, meals, arrival window and access. The Crossing is closed for winter at this review, and other properties have their own seasons. Limited winter accommodation at a named lodge is not a dependable public fuel, café or emergency-service stop.' },
    { question: 'Can I use Brewster Express between Banff and Jasper in winter?', answer: 'Its current FAQ describes the Banff–Jasper service as May through October and directs winter travellers to SunDog. The linked SunDog page still displayed a 2025/26 season at this review. Confirm the actual travel dates, stops and connections with the operator before committing to a 2026/27 winter journey.' },
    { question: 'Can I add a Maligne Canyon ice walk after arriving in Jasper?', answer: 'The current Parks closure prohibits winter recreation in Maligne Canyon. Check the official order and the reviewed Jasper guide for the specific area you want to visit. An open road into Jasper or a bookable hotel does not reopen a closed attraction.' },
  ],
};

const esc = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function faqHtml(slug: string): string {
  const faqs = parkwayGuideFaqs[slug];
  const schema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) };
  return `<h2 id="questions">Questions before the journey</h2>${faqs.map(faq => `<details><summary>${esc(faq.question)}</summary><p>${esc(faq.answer)}</p></details>`).join('\n')}\n<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`;
}

export const parkwayGuideOverrides: Record<string, string> = {
  'icefields-parkway-guide': `
<p>The Icefields Parkway links Lake Louise and Jasper through a landscape of lakes, mountain passes, glaciers and waterfalls. Make it a drive with a few chosen experiences: a lake viewpoint, a walk that suits the group, or a separately booked attraction. You do not need to collect every stop to have a rewarding journey.</p>
<p>This guide helps you <strong>choose the stops</strong>. For accommodation, inter-town transport and the onward journey, use the separate <a href="/blog/banff-to-jasper-drive/">Banff–Jasper transfer and overnight guide</a>. Put your selected places into the <a href="/icefields-parkway-planner/">Parkway planner</a>, then check actual access before setting out.</p>
<nav aria-label="Parkway stop guide sections"><p><a href="#choose-stops">Choose the kind of stop</a> · <a href="#southern-stops">Southern viewpoints and walks</a> · <a href="#icefield-and-falls">Icefield and waterfalls</a> · <a href="#season-and-services">Seasons and services</a> · <a href="#day-plan">Shape the day</a> · <a href="#questions">Questions</a></p></nav>

<h2 id="choose-stops">Choose the experience before the mileage</h2>
<table><caption>Different objectives need different amounts of walking and preparation</caption><thead><tr><th scope="col">Your objective</th><th scope="col">A useful starting point</th><th scope="col">What changes the choice</th></tr></thead><tbody>
<tr><th scope="row">Lake and mountain scenery</th><td>A designated Bow Lake stop or Peyto viewpoint approach.</td><td>The actual parking/access arrangement, uphill walking, surfaces and visibility.</td></tr>
<tr><th scope="row">A canyon or waterfall</th><td>Mistaya Canyon in an appropriate season, or an official Jasper-side falls viewpoint.</td><td>Open access, footing, barriers and the walking route you intend to use.</td></tr>
<tr><th scope="row">A longer hike</th><td>A separately assessed Bow Glacier Falls or Parker Ridge outing.</td><td>Group experience, elevation, weather, trail conditions and the onward drive.</td></tr>
<tr><th scope="row">A commercial glacier attraction</th><td>The operator’s actual dated product and meeting instructions.</td><td>Its season, inclusions, access, admission and cancellation terms.</td></tr>
</tbody></table>
<p>Use a viewpoint when the drive is the main activity. Choose a hike when you want the walk itself to occupy a meaningful part of the day. A short distance does not establish an accessible surface, a child-friendly outing or a suitable winter route.</p>

<h2 id="southern-stops">Bow Lake, Peyto and Mistaya: three different stops</h2>
<p><strong>Distance reference:</strong> the following trailhead figures come from <a href="${sources.hiking}" target="_blank" rel="noopener">Parks Canada’s Banff hiking page</a> and run north from the <strong>Highway 1 / Highway 93N junction</strong>. They do not start in Banff town or Lake Louise village. The route lengths are summer walking profiles, separate from road distance.</p>
<table><thead><tr><th scope="col">Place</th><th scope="col">Published reference</th><th scope="col">Choose the actual outing</th></tr></thead><tbody>
<tr><th scope="row">Bow Lake</th><td>Parking reference 36 km north of the junction, 400 m down the Lodge at Bow Lake access road.</td><td>A lake stop and the Bow Glacier Falls hike are separate plans. The latter is 3.8 km one way, with 95 m ascent and 20 m descent.</td></tr>
<tr><th scope="row">Peyto Lake Lookout</th><td>Parking reference 40 km north of the junction.</td><td>The main approach is 0.6 km one way. The separate barrier-free approach is 0.3 km from the upper lot, whose vehicle access is for accessible vehicles and buses. Check the <a href="${sources.discovery}" target="_blank" rel="noopener">Parks access detail</a> for the current arrangement.</td></tr>
<tr><th scope="row">Mistaya Canyon</th><td>Parking reference 72 km north of the junction.</td><td>Use the designated trail and bridge; stay off the canyon-edge rocks. Confirm the current trail detail and conditions.</td></tr>
</tbody></table>
<p>At Bow Lake, decide whether scenery or a hike is the purpose. The <a href="/trails/bow-glacier-falls/">reviewed falls route</a> supplies the longer-walk profile. For the building beside the lake, use the <a href="/blog/numtijah-lodge/">lodge history and day-visit guide</a>. A lakeside building does not establish an open café. Bow Lake is in the <a href="${sources.water}" target="_blank" rel="noopener">Water Preservation Zone, where paddling is prohibited</a>; no lake-crossing or rental plan is supplied here.</p>
<p>At Peyto, keep the lookout, <a href="/trails/bow-summit-viewpoint/">longer Bow Summit route</a> and lakeshore trail distinct. Snow changes the approach; read the <a href="/trails/peyto-lake-viewpoint/">reviewed viewpoint record</a> rather than extending a summer accessibility description into winter.</p>

<h2 id="icefield-and-falls">Choose glacier views, an attraction or a longer walk</h2>
<p>The Columbia Icefield area gives several ways to experience a glacier landscape. A designated viewpoint walk is different from a ticketed Icefield Adventure or Skywalk visit. Check the <a href="${sources.opening}" target="_blank" rel="noopener">operator’s opening-date page</a> and the exact product before adding a timed reservation; an attraction shown on a map is not a year-round service.</p>
<p><a href="${sources.glacier}" target="_blank" rel="noopener">Parks warns against crossing the barriers onto the Athabasca Glacier</a>. Hidden crevasses and unstable ice are serious hazards. Stay on the marked visitor route and follow closures; a photograph, another person’s tracks or the word “toe” does not identify a self-guided route onto ice. Read the <a href="${sources.jasperTrails}" target="_blank" rel="noopener">official Jasper-side trail descriptions</a> for the actual walk.</p>
<p>Sunwapta and Athabasca Falls are different from the glacier stop. Choose the named viewpoint or longer trail you want, check its access and remain behind barriers. For Tangle Falls, use a legal designated stopping place only; do not create a photo stop on the highway shoulder.</p>
<p>If hiking is the priority, consider the <a href="/trails/parker-ridge/">reviewed Parker Ridge route</a> as its own outing. Parks lists 2.7 km one way with 305 m ascent and 45 m descent, with parking 40 km north of Saskatchewan Crossing or 9 km south of the Icefield Centre. Those are the source’s stated origins. The summer profile does not assess a winter hike or promise time for several more walks.</p>

<h2 id="season-and-services">The same road supports different seasonal trips</h2>
<p><strong>Services checked October 29, 2026:</strong> <a href="${sources.travel}" target="_blank" rel="noopener">Parks identifies Saskatchewan River Crossing fuel as summer-only</a>. The <a href="${sources.crossing}" target="_blank" rel="noopener">Crossing Resort currently says all services are closed for winter</a>, with a planned April 2027 return whose date is not confirmed. Fuel before leaving Lake Louise or Jasper. Bring your food and water instead of making a roadside business essential to completing the drive.</p>
<p>Winter visitors need a separate road and outing decision. The <a href="${sources.winter}" target="_blank" rel="noopener">official winter Parkway guidance</a> covers snow/ice, equipment requirements, limited facilities and isolation. On Highway 93N, snow tires marked with a snowflake or M+S, or chains, are required November 1–March 31 and whenever the road is snow- or ice-covered. Do not assume a summer parking lot is cleared, a short trail remains straightforward, or a frozen lake provides a walking surface. Use a current official winter route where that is the objective.</p>

<h2 id="day-plan">Build a short, flexible shortlist</h2>
<ol><li>Pick the main experience: viewpoints, one substantial walk or a confirmed attraction.</li><li>Identify its parking or meeting point and the route your least mobile traveller will actually use.</li><li>Keep alternative stops that need less walking, with permission to skip them if access, weather or energy changes.</li><li>Check the weather and dated <a href="/conditions/">conditions-source handoff</a>, then open <a href="${sources.roadReport}" target="_blank" rel="noopener">Alberta 511</a> for the road before departure.</li><li>Recheck the onward destination and leave room to change the day. Selected stops are ideas, not a calculated arrival guarantee.</li></ol>
<p>Use designated parking, keep paths clear for others and leave wildlife space. If a lot is full, follow traffic controls and move to an appropriate alternative. The <a href="/icefields-parkway-planner/">planner</a> helps organise choices; the <a href="/blog/banff-to-jasper-drive/">transfer guide</a> helps fit them around accommodation and the complete journey.</p>
${faqHtml('icefields-parkway-guide')}
<h2 id="sources">Sources and review</h2><p>Fully reviewed October 29, 2026 using the linked Parks Canada road, hiking, glacier and water guidance, The Crossing’s current closure notice, and the attraction operator’s calendar. Road, trail and business openings are separate checks. This is a stop-selection guide, not a live opening inventory, personal trip report or travel-time assessment.</p>
`,
  'banff-to-jasper-drive': `
<p>Make Banff to Jasper a journey between two destinations, with accommodation and onward travel planned at both ends. The Icefields Parkway is the scenic middle section, but leaving a Banff hotel and reaching a Jasper room involves more than its headline distance. Decide whether you want a transfer with selected stops or a longer trip built around a hike, attraction or lodge stay.</p>
<p>This guide focuses on <strong>the transfer and overnight decisions</strong>. For choosing individual lakes, viewpoints and walks, use the <a href="/blog/icefields-parkway-guide/">separate Parkway stop guide</a> and <a href="/icefields-parkway-planner/">interactive planner</a>. Neither a stop count nor an estimated map time establishes a suitable departure or arrival.</p>
<nav aria-label="Banff to Jasper journey sections"><p><a href="#journey-shape">Choose the journey</a> · <a href="#direction">Direction and endpoints</a> · <a href="#overnight">Overnight bases</a> · <a href="#car-free">Without a car</a> · <a href="#winter-drive">Winter driving</a> · <a href="#jasper-arrival">Jasper arrival</a> · <a href="#questions">Questions</a></p></nav>

<h2 id="journey-shape">Choose a transfer, an outing or an overnight</h2>
<table><caption>Build the journey around the part you most want to experience</caption><thead><tr><th scope="col">Trip shape</th><th scope="col">What to arrange first</th><th scope="col">What to leave flexible</th></tr></thead><tbody>
<tr><th scope="row">Move from Banff to a Jasper stay</th><td>The actual room, check-in arrangement, vehicle or transfer and onward plans.</td><td>A limited shortlist of stops that can be dropped without losing the purpose of the trip.</td></tr>
<tr><th scope="row">Make hiking or an attraction the main event</th><td>The named route or dated product, with group requirements and arrival instructions.</td><td>Additional sightseeing, rather than treating several hikes as compulsory.</td></tr>
<tr><th scope="row">Stay along the Parkway</th><td>A confirmed property season, room, meals, check-in and access.</td><td>The pace around that stay, allowing for the actual road and weather.</td></tr>
<tr><th scope="row">Return to the same base</th><td>The entire outward and return journey, including the driver’s practical limits.</td><td>The farthest objective; a shorter trip may fit better than reaching Jasper and returning.</td></tr>
</tbody></table>
<p>Do not attach a tightly timed flight or another essential commitment to an assumed Parkway arrival. If the road closes, a navigation app’s alternative can mean a very different journey. Check the proposed route, road requirements and booked transport with the actual providers rather than following a diversion automatically.</p>

<h2 id="direction">Use the right origin and actual endpoint</h2>
<p><a href="${sources.travel}" target="_blank" rel="noopener">Parks describes the Parkway as approximately 232 km between Lake Louise and Jasper</a>. Banff is farther south, reached via Highway 1; the journeys to the chosen hotels add separate legs. Distances quoted from Lake Louise village, the Highway 1 / 93N junction and Jasper are not interchangeable. Keep the origin attached to each number.</p>
<p>Northbound, choose the Banff or Lake Louise departure address and the Jasper arrival address. Southbound, reverse the order of your stops and confirm the southern accommodation. Neither direction guarantees favourable light, visibility or easier driving. Compare a one-way rental or inter-town transfer with a return to the same airport, including the provider’s actual drop-off, luggage and cancellation terms.</p>
<p>If flights are still undecided, use the <a href="/blog/jasper-canada/">reviewed Jasper arrival guide</a> to compare a Calgary/Banff-first plan with an Edmonton/Jasper-first plan. Choose the nights and journeys you want rather than assuming Jasper is a short add-on to every Banff holiday.</p>

<h2 id="overnight">Compare gateway stays with a Parkway lodge</h2>
<table><thead><tr><th scope="col">Base</th><th scope="col">Why consider it</th><th scope="col">Resolve before booking</th></tr></thead><tbody>
<tr><th scope="row">Banff or Lake Louise</th><td>A southern base for a deliberately shorter Parkway visit or the night before the transfer.</td><td>Exact village, lakeshore or town address, meals, departure arrangements and vehicle/transfer access.</td></tr>
<tr><th scope="row">The Lodge at Bow Lake</th><td>A lodge-centred stay rather than a generic service stop.</td><td>Actual operating season, building/room, minimum stay, meal arrangement and arrival window.</td></tr>
<tr><th scope="row">The Crossing Resort</th><td>A seasonal Highway 93N/11 junction property.</td><td>Its current closure and the confirmed date of any future reopening; do not assume winter fuel or a room.</td></tr>
<tr><th scope="row">Glacier View Lodge</th><td>An accommodation choice in the Columbia Icefield area when operating.</td><td>The property’s own season and reservation, independently of a glacier tour ticket.</td></tr>
<tr><th scope="row">Jasper</th><td>An endpoint stay with time to experience the community and appropriate current outings.</td><td>Town versus outlying location, the actual room, arrival and onward transport.</td></tr>
</tbody></table>
<p><strong>Operator notices checked October 29, 2026:</strong> <a href="${sources.crossing}" target="_blank" rel="noopener">The Crossing says all services are closed for winter</a> and announces April 2027 without a confirmed reopening date. The <a href="${sources.opening}" target="_blank" rel="noopener">Pursuit calendar lists Glacier View Lodge closed for the season</a>. A future reservation screen is not proof of operation on your arrival day.</p>
<p><a href="${sources.lodge}" target="_blank" rel="noopener">The Lodge at Bow Lake</a> advertises a limited winter season, distinct from its summer/fall season. Use the <a href="/blog/num-ti-jah-lodge/">reviewed stay guide</a> for room, meals and arrival questions, then confirm the actual offer with the operator. Do not interpret Parks’ general warning about winter roadside services as a room calendar, or a lodge booking as a public fuel/café stop.</p>
<p>For a southern gateway, compare the <a href="/book/lake-louise-stays/">reviewed Lake Louise accommodation shortlist</a> and <a href="/towns/lake-louise/">village/lakeshore base guide</a>. For the northern stay, the <a href="/blog/jasper-town/">reviewed Jasper town guide</a> distinguishes central and outlying choices. Book the place and room that fit the actual journey; an accommodation link does not reserve transport or reopen a road.</p>

<h2 id="car-free">Book the actual inter-town service</h2>
<p>A point-to-point coach transfer, a sightseeing tour and a private journey are different products. Ask which stops are included, whether luggage travels throughout, the precise pickup/drop-off, access needs, child arrangements and what happens if the road closes. A Calgary–Banff airport shuttle is not automatically a Banff–Jasper booking.</p>
<p>The <a href="${sources.brewster}" target="_blank" rel="noopener">current Brewster Express FAQ</a> describes Banff–Jasper travel from May through October and directs winter travellers to SunDog. <strong>At this review, its linked <a href="${sources.sundog}" target="_blank" rel="noopener">SunDog connector page</a> still displayed an October 2025–April 2026 season</strong>. Use it as an enquiry route; confirm the actual 2026/27 date, pickup and any connection before committing to the surrounding accommodation or flight. No current seat, schedule or through-connection is established here.</p>

<h2 id="winter-drive">Make a winter road decision before a scenic plan</h2>
<p>The <a href="${sources.winter}" target="_blank" rel="noopener">Parks winter guidance</a> describes a remote drive with no dependable roadside services. Fuel before leaving Lake Louise or Jasper and carry food, water, warm clothing and emergency supplies. Download directions and confirmations; do not depend on mobile coverage to solve a late arrival or vehicle problem.</p>
<p><strong>Highway 93N tire rule:</strong> snow tires marked with a <strong>snowflake or M+S</strong> symbol, or tire chains, are required <strong>November 1–March 31, and whenever the Parkway is snow- or ice-covered</strong>. Check the actual supplied rental tires and the contract; the vehicle category alone is not confirmation. A separate British Columbia leg has its own route-specific requirements.</p>
<p>Read the <a href="/blog/banff-winter-driving/">reviewed winter-driving guide</a>, then check the current forecast and <a href="/conditions/">dated weather and road-source handoff</a>. Open <a href="${sources.roadReport}" target="_blank" rel="noopener">Alberta 511</a> and the <a href="${sources.roads}" target="_blank" rel="noopener">Parks road restrictions</a> for the actual journey. An old report, an unavailable value or one section’s condition does not establish the whole route. Travel within your experience, keep a shorter alternative, and follow a closure rather than trying to complete a prepaid stop list.</p>
<ol><li>Save the actual accommodation address, check-in instructions and contact details before leaving a connected area.</li><li>Recheck the road and forecast for the full journey, then reduce or change the stop list if the day requires it.</li><li>Tell a trusted contact your route and intended arrival arrangement, and update them if the plan changes. Do not make a roadside signal or an open business the only way to communicate.</li></ol>

<h2 id="jasper-arrival">Arrive with a current Jasper plan</h2>
<p>Jasper continues its <a href="${sources.recovery}" target="_blank" rel="noopener">recovery after the 2024 wildfire</a>. An operating town, a road, a specific trail and a commercial attraction can have different access states. The <a href="${sources.closure}" target="_blank" rel="noopener">current closure order</a> includes Edith Cavell Road/area and Maligne Canyon; <strong>winter recreation in Maligne Canyon is prohibited</strong>. Do not attach an old ice-walk recommendation to the end of the drive.</p>
<p>Use the <a href="/blog/jasper-national-park/">reviewed park guide</a> to choose an appropriate present-day outing. Save the lodging’s check-in and late-arrival contact arrangement, confirm where you will eat, and keep the arrival evening simple. Plan the next day from the actual destination rather than adding another long drive automatically.</p>
${faqHtml('banff-to-jasper-drive')}
<h2 id="sources">Sources and review</h2><p>Fully reviewed October 29, 2026 using the linked Parks road, winter and recovery guidance, operator accommodation notices, Brewster FAQ and SunDog page. The page preserves the distinct Banff–Jasper journey purpose; it supplies no fixed itinerary, arrival guarantee, live room inventory or invented personal experience. Recheck dated notices and your actual reservations before travelling.</p>
`,
};

type ParkwayGuideMetadata = {
  title: string; description: string; lastUpdated: string; readTime: string;
  imageIsIllustrative: true; imageNote: string;
};
export const parkwayGuideMetadata: Record<string, ParkwayGuideMetadata> = {
  'icefields-parkway-guide': { title: 'Icefields Parkway Stops: Viewpoints, Walks & Seasonal Choices', description: 'Choose Icefields Parkway viewpoints, walks and glacier experiences using clear distance origins, seasonal fuel and access checks, and a flexible stop shortlist.', lastUpdated: reviewDate, readTime: '8 min read', imageIsIllustrative: true, imageNote: 'Illustrative landscape image; not verified as a named Parkway stop, road section or current condition.' },
  'banff-to-jasper-drive': { title: 'Banff to Jasper: Transfers, Overnight Bases & Winter Travel', description: 'Plan a Banff–Jasper journey with gateway or Parkway stays, seasonal transport, winter fuel and tire requirements, and current Jasper arrival and recovery checks.', lastUpdated: reviewDate, readTime: '9 min read', imageIsIllustrative: true, imageNote: 'Illustrative landscape image; not verified as this driving route, accommodation or current road conditions.' },
};
