/** Source-reviewed planning article, not a rental quote or road-condition feed. */
export const reviewDate = '2026-10-29';

export const carRentalGuideSources = {
  airport: 'https://www.yyc.com/transportation/car-rentals',
  rental: 'https://www.enterprise.com/en/car-rental-locations/ca/ab/calgary-international-airport-c5ei.html',
  oneWay: 'https://www.enterprise.ca/en/car-rental-faqs/canada-general/one-way-car-rental-policy.html',
  returns: 'https://www.enterprise.ca/en/car-rental-faqs/canada-reservations/late-returns-policy.html',
  albertaTires: 'https://www.alberta.ca/system/files/custom_downloaded_images/tr-swh-winter-tires.pdf',
  albertaDriving: 'https://www.alberta.ca/safer-winter-highways',
  federal: 'https://laws-lois.justice.gc.ca/eng/regulations/C.R.C.,_c._1126/section-40.html',
  bc: 'https://www2.gov.bc.ca/gov/content/transportation/driving-and-cycling/traveller-information/seasonal/winter-driving',
  bcTires: 'https://www2.gov.bc.ca/gov/content/transportation/driving-and-cycling/traveller-information/seasonal/winter-driving/about-winter-tires',
  awd: 'https://rcmp.ca/en/gazette/just-facts-winter-driving',
  parkway: 'https://parks.canada.ca/pn-np/ab/jasper/activ/experience/hiver-winter/pcghiver-ipwinter',
  lakes: 'https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise',
  johnston: 'https://roamtransit.com/schedules-routes/johnston-canyon-regional-route-9/',
  louise: 'https://roamtransit.com/schedules-routes/lake-louise-banff-express-route-8x/',
  closure: 'https://parks.canada.ca/pn-np/ab/banff/bulletins/06d4ef61-a3c9-4b65-8dfc-66d056252d6c',
  airportShuttle: 'https://banffairporter.com/',
  albertaRoads: 'https://511.alberta.ca/',
  bcRoads: 'https://www.drivebc.ca/',
};

export const carRentalGuideFaqs = [
  { question: 'Do I need a rental car for Banff?', answer: 'Choose from your actual base and outings. A walkable Banff stay with confirmed airport transfers, local transit and selected excursions can work without a car. A rental can help with destinations outside those services, luggage or a multi-base journey, but still needs permitted roads, suitable equipment, parking and a complete return. Compare the whole-party total for the same dates.' },
  { question: 'Are winter tires legally required everywhere in Alberta?', answer: 'No blanket Alberta winter-tire mandate is established by the provincial guidance linked here. Separate federal rules apply to named national-park highways, including the Icefields Parkway and Banff–Windermere Highway, November 1–March 31 or when snow or ice covers the highway. British Columbia has its own signed-route requirements. Check the actual route, signs and current official rules rather than treating one province-wide statement as sufficient.' },
  { question: 'Does an AWD rental guarantee winter tires or safe travel?', answer: 'No. Drivetrain and fitted tires are separate specifications. Enterprise’s Calgary Airport page said at the October 29, 2026 review that winter tires could not be reserved and depended on arrival availability. Ask your selected branch what it can confirm, inspect the supplied equipment and keep an alternative if it cannot meet the plan. AWD does not override road closures or remove the need to adjust or postpone a journey.' },
  { question: 'Can I drive a rental car to Moraine Lake?', answer: 'Moraine Lake Road is closed to personal vehicles year-round. Parks Canada lists access for its shuttles, appropriately licensed commercial operators and registered Moraine Lake Lodge guests. A normal rental reservation does not provide an exception. Seasonal transport needs its own operating dates, reservation and return; summer access arrangements do not create a winter road trip.' },
  { question: 'Can I collect at Calgary Airport and return the car in Banff?', answer: 'Only if the selected company accepts and confirms that exact one-way rental. Enterprise says one-way rentals at participating locations must be booked in advance and may have a drop charge, mileage charge or different rate. Compare the revised total and branch hours, then arrange the separate onward journey or airport transfer. Do not assume you can change the return branch after collection without agreement.' },
];

const escapeHtml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const faqHtml = carRentalGuideFaqs.map(faq => `<details><summary>${escapeHtml(faq.question)}</summary><p>${escapeHtml(faq.answer)}</p></details>`).join('\n');
const faqSchema = JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: carRentalGuideFaqs.map(faq => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) }).replace(/</g, '\\u003c');

export const carRentalGuideOverrides: Record<string, string> = {
  'banff-car-rental-tips': `
<p>A rental car earns its place when it solves a real journey: a change of base, an outing beyond your chosen transport services, or luggage that is awkward to move. For a Banff town stay, it can also spend paid days parked while you use buses and shuttles. Start with the days you want, then compare a full rental, a shorter rental and a car-free trip.</p>
<p><strong>Full guide reviewed October 29, 2026.</strong> This guide separates road requirements, rental-company terms and equipment requests. It contains no live rental rates or road-access verdict. The retained hero image is illustrative, not a verified rental vehicle, tire specification or current road condition.</p>
<nav aria-label="Banff car rental guide sections"><p><a href="#car-or-car-free">Choose the journey</a> · <a href="#rental-total">Compare real quotes</a> · <a href="#pickup-driver">Pickup and drivers</a> · <a href="#winter-tire-rules">Tires and route rules</a> · <a href="#destination-access">Destination access</a> · <a href="#return-car">Return the car</a> · <a href="#rental-questions">Questions</a></p></nav>

<h2 id="car-or-car-free">Choose the journey before the vehicle</h2>
<table><caption>Three transport plans to compare against the same itinerary</caption><thead><tr><th scope="col">Plan</th><th scope="col">When to consider it</th><th scope="col">Resolve first</th></tr></thead><tbody>
<tr><th scope="row">Full-stay rental</th><td>Several separate destinations or changes of accommodation</td><td>Every driver, equipment, road permissions, overnight parking and airport return</td></tr>
<tr><th scope="row">Selected rental days</th><td>A mostly town-based trip with one independent road outing</td><td>Local collection hours, vehicle supply, collection transport and the complete revised price</td></tr>
<tr><th scope="row">Car-free stay</th><td>A base and outings connected by confirmed transfers, transit or booked excursions</td><td>Real stops, luggage, reservations, first departures and last useful returns</td></tr>
</tbody></table>
<p>Compare <a href="/towns/">Banff, Canmore and Lake Louise as different bases</a>. Plot the accommodation entrance, not just the town name. A room far from your bus stop can change the decision, particularly with luggage or ski gear. Ask about the specific boarding, luggage and assistance arrangements your group needs rather than assuming either a rental or a bus will fit.</p>
<p>For the alternative, use <a href="/car-free-banff/">the car-free journey guide</a> and <a href="/calgary-to-banff/">Calgary Airport arrival planning</a>. <a href="${carRentalGuideSources.airportShuttle}" target="_blank" rel="noopener">Banff Airporter — direct operator</a> serves Banff and a Canmore stop; confirm the actual address and onward connection. It is not an airport-to-every-hotel service across the region. A ski shuttle, regional bus and airport transfer are separate journeys.</p>

<h2 id="rental-total">Compare real quotes with matching units</h2>
<p>Obtain dated quotes for the same party, currency, pickup and return times. Record the quote date and cancellation deadline. A daily vehicle headline and a per-person one-way shuttle fare cannot be compared directly. Keep accommodation nights separate from the rental company’s billed periods.</p>
<ul><li><strong>Rental total:</strong> quoted rental periods, taxes and mandatory fees, selected coverage, additional drivers, equipment, any one-way or mileage charges, fuel or charging, and parking.</li><li><strong>Car-free total:</strong> both airport transfers for every traveller, regional and local journeys, destination reservations and any selected excursion. Count a transfer already included only once.</li><li><strong>Hybrid total:</strong> airport transfers plus the shorter rental, collection/return transport and remaining transit. Re-price the whole booking; fewer rental days do not establish a cheaper total.</li></ul>
<p>Write each supplier’s actual total next to what it covers and what remains payable. Divide a vehicle total by the people sharing it only after adding those costs; multiply passenger fares by the applicable travellers and directions. Use <a href="/trip-cost/">the trip-cost planner</a> with your own quotes, then <a href="/park-pass/">check park admission separately</a>. A rental, parking payment or shuttle ticket should not be assumed to include every other charge.</p>

<h2 id="pickup-driver">Book the branch, drivers and equipment you need</h2>
<p><a href="${carRentalGuideSources.airport}" target="_blank" rel="noopener">YYC’s official rental directory</a> distinguishes on-site and off-site companies. The Rental Car Centre is across the roadway from the Domestic Terminal on the Departures Level; off-site companies use shuttle arrangements. Check the supplier’s actual instructions and hours, flight-delay procedure and return location. An airport search result does not establish that collection is inside the terminal.</p>
<p>Compare an airport booking with an actual local-branch quote without assuming Banff is always dearer or Canmore cheaper. Include reaching that branch, holiday hours and whether a one-day plan leaves enough time to return. A late flight can make the first night in Calgary worth comparing; avoid a non-refundable mountain activity immediately after an uncertain arrival.</p>
<p>Before paying, ask the selected branch these questions and keep its written answers:</p>
<ul><li>Are every driver’s age, licence, licence language and documents accepted for this vehicle class? Must additional drivers attend collection?</li><li>Whose payment card is required, which card types are accepted, and what funds or credit will the deposit hold require?</li><li>What coverage is included or optional, what exclusions and deductibles apply, and what must any existing insurer or card provider confirm?</li><li>Are the planned provinces, roads and return location permitted? Do not infer gravel-road permission from an SUV label.</li><li>Which child seats, ski storage, winter tires and other equipment are confirmed, merely requested or supplied only if available? Can passengers and luggage fit together?</li></ul>
<p>The <a href="${carRentalGuideSources.rental}" target="_blank" rel="noopener">Enterprise Calgary Airport branch policies</a> illustrate why branch-level checking matters: they publish driver and payment conditions, and say winter tires <strong>cannot be reserved and depend on availability at arrival</strong>. That is this branch’s published policy at review, not a promise about all brands. Ask what alternative remains if the actual vehicle cannot meet your route or equipment needs.</p>

<h2 id="winter-tire-rules">Separate Alberta guidance, federal highways and B.C. rules</h2>
<p>Check the complete route, including a day trip across the provincial boundary. “Collecting in Alberta” does not answer which rules apply later. The following is a source summary; follow current signs, restrictions and the actual rental agreement.</p>
<table><caption>Different road-rule scopes, checked October 29, 2026</caption><thead><tr><th scope="col">Scope</th><th scope="col">Official position</th><th scope="col">Booking implication</th></tr></thead><tbody>
<tr><th scope="row">Alberta general guidance</th><td>The province’s tire bulletin states no blanket winter-tire mandate and recommends four winter or all-weather tires for severe winter conditions.</td><td>A lack of a general mandate is not a vehicle or route approval.</td></tr>
<tr><th scope="row">Specified national-park highways</th><td>Federal section 40 requires adequate snow tires or installed tire chains November 1–March 31, or when the highway is snow- or ice-covered, on its listed highways.</td><td>Includes the Icefields Parkway, Banff–Windermere Highway and highways in Yoho; check the exact road.</td></tr>
<tr><th scope="row">B.C. signed routes</th><td>Winter tire and chain signs generally apply October 1–April 30; specified routes end March 31.</td><td>Check the official route information, signs and passenger-vehicle tire definition for the actual B.C. leg.</td></tr>
</tbody></table>
<p>Read <a href="${carRentalGuideSources.albertaTires}" target="_blank" rel="noopener">Alberta’s tire bulletin</a> alongside its <a href="${carRentalGuideSources.albertaDriving}" target="_blank" rel="noopener">current winter-driving guidance</a>, <a href="${carRentalGuideSources.federal}" target="_blank" rel="noopener">federal section 40</a> and <a href="${carRentalGuideSources.bc}" target="_blank" rel="noopener">B.C.’s winter-driving rules</a>. The federal consolidation retrieved was current to September 30, 2026. Alberta’s bulletin is older undated guidance, not a new seasonal announcement.</p>
<p><a href="${carRentalGuideSources.bcTires}" target="_blank" rel="noopener">B.C.’s passenger-vehicle definition</a> includes M+S or mountain/snowflake markings and at least 3.5 mm tread; it also applies to AWD/4WD vehicles. Chains on summer tires do not substitute for legal winter tires on signed B.C. highways. A legal minimum and the best equipment for the expected conditions are different questions. Ask about the actual tires, and check chain permission with the rental company rather than assuming you may fit them.</p>
<p>Choose vehicle size for people, luggage and permitted use. AWD is not a substitute for appropriate tires or a reason to proceed in a storm: the <a href="${carRentalGuideSources.awd}" target="_blank" rel="noopener">RCMP notes that four-wheel drive does not shorten slippery-road stopping</a>. Alberta advises postponing unnecessary storm travel and never travelling a closed road. Confirm winter supplies and controls at pickup, including the scraper, lights, defroster and emergency kit.</p>

<h2 id="destination-access">A car does not settle access or parking</h2>
<p>Use <a href="/parking/">destination-specific parking planning</a> rather than a predicted “full by” time. Check your accommodation’s overnight charge, restrictions and loading arrangement; a vehicle space may be a separate purchase. Plan permitted parking and the final leg before an attraction reservation.</p>
<p><a href="${carRentalGuideSources.lakes}" target="_blank" rel="noopener">Parks Canada’s lake access page</a> says <strong>Moraine Lake Road is closed to personal vehicles year-round</strong>. It lists Parks shuttles, appropriately licensed commercial operators and registered Moraine Lake Lodge guests as permitted access. A rental alone gives no exception. Regular Parks shuttles use the Lake Louise Park and Ride; seasonal service and reservations are separate from the car. The published 2026 season ended October 12; do not project it into winter or infer 2027 dates. Use <a href="/shuttle-reservations/">the shuttle planning guide</a>.</p>
<p><strong>Johnston Canyon is Roam Route 9; Lake Louise is Route 8X.</strong> The <a href="${carRentalGuideSources.johnston}" target="_blank" rel="noopener">Route 9 page</a> carried a construction suspension to approximately November 30 at review, while <a href="${carRentalGuideSources.closure}" target="_blank" rel="noopener">Parks’ closure order</a> lists Johnston Canyon Trail and Day Use Area, including P1 and washrooms, October 13–December 11, 2026. Those are different notices; neither establishes a confirmed reopening. Do not drive there to bypass a closure. Check <a href="${carRentalGuideSources.louise}" target="_blank" rel="noopener">Route 8X</a> for its own dated timetable, reservations and both directions.</p>
<p>For a Parkway outing, use <a href="/icefields-parkway-planner/">the stop and direction planner</a> and <a href="${carRentalGuideSources.parkway}" target="_blank" rel="noopener">Parks’ winter preparation page</a>. Limited services, communications gaps and weather or avalanche closures change the journey. Check <a href="${carRentalGuideSources.albertaRoads}" target="_blank" rel="noopener">Alberta 511</a> and, for B.C. legs, <a href="${carRentalGuideSources.bcRoads}" target="_blank" rel="noopener">DriveBC</a> before departure and again for the return. Keep a shorter alternative; a rental confirmation does not establish that the drive is feasible.</p>

<h2 id="return-car">Plan the return before collecting the keys</h2>
<p><a href="${carRentalGuideSources.oneWay}" target="_blank" rel="noopener">Enterprise’s one-way policy</a> requires advance booking at participating locations and allows different rates, drop or mileage charges. Price the exact airport-to-Banff return rather than assuming you can hand back an airport vehicle at any branch. After a local return, confirm how everyone and the luggage reach the hotel or onward airport transfer.</p>
<p>At collection, record existing damage with the agent and keep dated photographs, the agreement and equipment confirmation. Learn the fuel or charging obligation, mileage allowance, breakdown process and whom to contact if delayed. Resolve discrepancies before leaving.</p>
<p>For the final day, work backwards from your airline’s required airport arrival, adding road-condition flexibility, refuelling or charging, the correct return entrance, inspection and any off-site shuttle. Avoid promising one fixed mountain drive time. Ask about early, late and after-hours returns: <a href="${carRentalGuideSources.returns}" target="_blank" rel="noopener">Enterprise’s Canadian policy</a> says an after-hours vehicle remains the customer’s responsibility until satisfactory check-in the next business day. Your actual branch and agreement govern your arrangements. Keep the return receipt and check the final invoice.</p>

<h2 id="rental-booking">Match the stay and optional outings to the transport</h2>
<p>Compare location trade-offs through <a href="/book/banff-hotels/">Banff stays</a> or <a href="/book/lake-louise-stays/">Lake Louise area stays</a>. The inherited <a href="https://www.expedia.ca/Hotel-Search?destination=Banff%2C+Alberta&camref=1101l3MtWX" target="_blank" rel="noopener sponsored">Expedia Banff accommodation search</a> is a broader accommodation search, not a car-rental offer. The <a href="https://www.getyourguide.com/banff-l284/?partner_id=QW960HO" target="_blank" rel="noopener sponsored">GetYourGuide Banff activity search</a> is a general catalogue; verify the selected product’s pickup, transport, access, return and cancellation terms. Do not assume every listing includes a transfer.</p>
<p>Those two searches are affiliate links; BanffBound may earn a commission if you book. They do not reserve parking, a rental vehicle or lake access. Direct official and operator links above are labelled sources, and native links open their providers with their own policies.</p>

<h2 id="rental-questions">Car rental questions</h2>
${faqHtml}
<script type="application/ld+json">${faqSchema}</script>
<h2 id="rental-sources">Sources and review</h2>
<p><strong>Full guide reviewed October 29, 2026.</strong> The linked airport, rental operator, provincial and federal authorities, Parks Canada, Roam and airport-transfer operator establish the specific scopes described above. Rental examples apply to the named operator, not all suppliers. Review dates record a source check, not a live price, service or road-condition feed. Check current notices and the actual quote before committing.</p>
`,
};

export const carRentalGuideMetadata: Record<string, { title: string; description: string; lastUpdated: string; readTime: string; imageIsIllustrative: true; imageNote: string }> = {
  'banff-car-rental-tips': {
    title: 'Banff Car Rental: Car-Free Choices, Winter Tires & Returns',
    description: 'Compare a rental with car-free Banff, using complete quotes, actual tire and route rules, airport pickup, lake access and a practical return plan.',
    lastUpdated: reviewDate,
    readTime: '12 min read',
    imageIsIllustrative: true,
    imageNote: 'Illustrative image; not verified as a particular rental vehicle, tire specification, road or current driving condition.',
  },
};
