/** Full retained-URL reviews; original publication dates remain in blogPosts. */
export const reviewDate = '2026-10-29';
export const petTravelGuideSources: Record<string, Record<string, string>> = {
  'banff-dog-friendly': {
    dogs: 'https://parks.canada.ca/pn-np/ab/banff/visit/faune-wildlife/chiens-dogs',
    regulations: 'https://parks.canada.ca/pn-np/ab/banff/securite-safety/regles-rules',
    federalAnimals: 'https://laws-lois.justice.gc.ca/eng/regulations/SOR-98-177/page-1.html',
    townAnimals: 'https://banff.ca/DocumentCenter/View/163/Animal-Services-Bylaw-46-4',
    bulletins: 'https://parks.canada.ca/pn-np/ab/banff/bulletins',
    trails: 'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking/etat-sentiers-trail-conditions',
    winter: 'https://parks.canada.ca/pn-np/ab/banff/activ/marchehiver-winterwalking/banff',
    seasonal: 'https://parks.canada.ca/pn-np/ab/banff/visit/fermetures-closures',
    minnewanka: 'https://parks.canada.ca/pn-np/mtn/ours-bears/gestion-management/ours-bears/minnewanka',
    parks: 'https://banff.ca/1030/Off-Leash-Dog-Parks',
    townConditions: 'https://banff.ca/conditions',
    bowFalls: 'https://www.banff.ca/654/Bow-Falls-Trail',
    roam: 'https://roamtransit.com/about-us/transportation-policies/',
    lakeShuttle: 'https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise/faq',
    lakeAccess: 'https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise',
    gondola: 'https://www.banffjaspercollection.com/attractions/banff-gondola/faqs/',
    cruise: 'https://www.banffjaspercollection.com/attractions/lake-minnewanka-cruise/faqs/',
    patio: 'https://www.banffcollective.com/restaurant/bear-street-tavern-pizza',
    airport: 'https://banffairporter.com/travel-information/',
    border: 'https://inspection.canada.ca/en/importing-food-plants-animals/pets',
  },
  'banff-pet-friendly-hotels': {
    moose: 'https://moosehotelandsuites.com/pet-friendly/',
    tunnel: 'https://tunnelmountain.com/pet-friendly/',
    springs: 'https://www.banff-springs-hotel.com/stay/guest-services/',
    springsPets: 'https://www.banff-springs-hotel.com/stay/pet-friendly/',
    inn: 'https://www.lakelouiseinn.com/pet-friendly-accommodations/',
    innOverview: 'https://www.lakelouiseinn.com/',
    chateau: 'https://www.chateau-lake-louise.com/stay/guest-services/',
    chateauPets: 'https://www.chateau-lake-louise.com/stay/pet-friendly/',
    royal: 'https://royalcanadianlodge.com/contact/',
    regulations: 'https://parks.canada.ca/pn-np/ab/banff/securite-safety/regles-rules',
  },
};
const dog = petTravelGuideSources['banff-dog-friendly'];
const hotel = petTravelGuideSources['banff-pet-friendly-hotels'];
const banffHotels = 'https://www.expedia.ca/Hotel-Search?destination=Banff%2C+Alberta&camref=1101l3MtWX';
const banffActivities = 'https://www.getyourguide.com/banff-l284/?partner_id=QW960HO';
export const petTravelGuideFaqs: Record<string, { question: string; answer: string }[]> = {
  'banff-dog-friendly': [
    { question: 'Can my dog use Banff buses and airport transfers?', answer: 'Check each service separately. Roam requires an ordinary pet to remain fully enclosed in an animal carrier small enough for the owner’s lap. Parks lake shuttles require a small carrier that fits on the owner’s lap, with the pet enclosed throughout and the carrier held at all times. Banff Airporter says it does not carry ordinary pets. A ticket, hotel transit pass or another operator’s policy does not confirm this dog’s whole journey. Service-animal arrangements are separate.' },
    { question: 'Are all Lake Louise and Moraine Lake trails banned to dogs?', answer: 'Do not use a blanket area claim. Check the exact trail, current bulletin and posted restriction. Reaching Moraine Lake also needs permitted seasonal transport: a public shuttle’s small-carrier rule can exclude a larger dog even when it does not settle trail access. Summer access is not a winter outing, and the lake-shuttle season is separate from a hotel’s operation.' },
    { question: 'Where can a dog go off leash in Banff?', answer: 'Use only a designated area under its posted rules. The Town names Sundance Park and Industrial District dog parks, with seasonal closure conditions. Check current status; the Industrial District area depends on frozen ground and snow cover. Licensing, vaccination and age requirements apply at the dog parks. A trail or quiet roadside is not an off-leash alternative.' },
    { question: 'What if an attraction or restaurant cannot take my dog?', answer: 'Choose a different shared activity or arrange confirmed supervision and care before booking. Do not leave the dog in a vehicle, tied outside or alone in a room as a substitute. A pet-designated hotel booking does not supply sitting, restaurant access or attraction admission. Plan the people’s meal and the dog’s care together.' },
    { question: 'Does a winter walking suggestion establish a suitable dog outing?', answer: 'No. Choose the exact permitted route using current conditions, the people and the dog, and keep a practical turnaround and return. Track-set routes can have dog restrictions. A summer grade, traction equipment, snowshoe rental or frozen-looking surface is not a winter access or suitability decision.' },
  ],
  'banff-pet-friendly-hotels': [
    { question: 'Does a pet-friendly filter reserve a pet room?', answer: 'No. Confirm the exact property, animal, number of pets and room category with the hotel, then ensure the booking records that allocation. A kitchen category, accessible room, connecting room or lake view is a separate requirement. Ask whether all your requirements can be met together before accepting the rate.' },
    { question: 'Can I assume a hotel accepting dogs also accepts cats?', answer: 'No. Lake Louise Inn’s dedicated policy says dogs only and excludes cats and other pets. Other reviewed pages do not consistently enumerate accepted species or sizes. Ask the actual hotel about your animal and room; the word pets on a marketplace result is not an individual acceptance.' },
    { question: 'Can I leave the dog in the hotel while skiing or sightseeing?', answer: 'Do not assume that is permitted or an adequate care plan. Arrange supervision or confirmed care before booking the human-only activity. Moose, Tunnel Mountain and the reviewed Fairmont policies require supervision. Parks Canada’s visitor guidance also says never to leave pets unattended. A kennel, room label or sitting enquiry is not a confirmed supervised arrangement.' },
    { question: 'Can a dog use every hotel patio, restaurant and pool area?', answer: 'No. Fairmont Banff Springs permits dogs on outdoor patios while excluding pets from restaurants and aquatic facilities. Fairmont Chateau Lake Louise excludes pets from food and beverage areas, outdoor patios and its Health Club pool deck. Other hotels have their own restrictions. Confirm the actual space and date, and plan meals with supervision.' },
    { question: 'What pet costs should I include in the quote?', answer: 'Ask for the current pet charge and how it is applied, required fees, taxes, deposits, cleaning or damage terms, parking and any confirmed care. Compare the same party, room and nights. This guide supplies no fixed pet fee or live room price; keep unconfirmed amounts visible in the quote-based budget planner.' },
  ],
};
const esc = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function faqs(slug: string): string {
  const entries = petTravelGuideFaqs[slug];
  return entries.map(faq => `<details><summary>${esc(faq.question)}</summary><p>${esc(faq.answer)}</p></details>`).join('\n') + `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: entries.map(faq => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) }).replace(/</g, '\\u003c')}</script>`;
}

export const petTravelGuideOverrides: Record<string, string> = {
  'banff-dog-friendly': `
<p>A Banff trip with a dog works best when the dog belongs in the whole plan: arrival, walks, meals, room and return. Start with a few things you can enjoy together, then arrange care for anything the dog cannot join. A hotel pet filter or a photograph of a dog beside a lake does not solve the connections.</p>
<p><strong>Full guide reviewed October 29, 2026.</strong> Use the existing <a href="/dog-friendly/#dog-ideas">dog-friendly planning cards</a> to compare base, season and plan type, then read this guide for the whole journey. Those filters organise ideas; they do not establish admission, current opening, dog fitness or a suitable route. The companion <a href="/blog/banff-pet-friendly-hotels/">pet-room comparison</a> covers the exact stay.</p>
<nav aria-label="Banff dog travel guide sections"><p><a href="#dog-first">Choose the trip</a> · <a href="#dog-rules">Park rules</a> · <a href="#dog-transport">Transport</a> · <a href="#dog-lakes">Lake outings</a> · <a href="#dog-town">Town and off-leash areas</a> · <a href="#dog-winter">Winter</a> · <a href="#dog-meals">Meals and care</a> · <a href="#dog-stay">Room and arrival</a> · <a href="#dog-day">A practical day</a> · <a href="#dog-questions">Questions</a></p></nav>

<h2 id="dog-first">Choose a trip the dog can actually join</h2>
<p>Write down the essential activity and how the dog will spend that time before choosing a room. A town-led visit with short outings creates a different routine from a ski holiday, a lake transfer or a long hike. If the main reason for travelling is a series of activities that exclude pets, arrange appropriate care at home or at the destination first rather than relying on an unconfirmed workaround.</p>
<p>For an international arrival, use the <a href="${dog.border}" target="_blank" rel="noopener">Canadian Food Inspection Agency’s pet-entry tool</a> for the actual animal, origin and travel circumstances. Airline and ground-carrier acceptance are separate. Resolve the animal’s travel arrangements directly with each provider; a passenger booking is not a pet reservation.</p>
<table><caption>Start with the whole dog-and-people journey</caption><thead><tr><th scope="col">Trip format</th><th scope="col">What to resolve first</th><th scope="col">A useful next step</th></tr></thead><tbody>
<tr><th scope="row">Banff town stay</th><td>Pet room, actual arrival, permitted short walks and meals with supervision.</td><td><a href="/towns/banff/">Banff base and transport guide</a>.</td></tr>
<tr><th scope="row">A public-bus or lake day</th><td>Carrier eligibility, every connection, actual route and last return.</td><td><a href="/shuttle-reservations/">Lake access planning</a>.</td></tr>
<tr><th scope="row">A ski day or non-pet attraction</th><td>Confirmed care for the dog for the whole absence, including transfers.</td><td>Compare the activity only after that arrangement works.</td></tr>
<tr><th scope="row">Another mountain base</th><td>Actual address, roads, food, animal acceptance and the return.</td><td><a href="/towns/">Compare the distinct towns and regions</a>.</td></tr>
</tbody></table>

<h2 id="dog-rules">Use current park rules and the exact trail</h2>
<p><a href="${dog.dogs}" target="_blank" rel="noopener">Parks Canada requires dogs on leash and under physical control</a>. Pick up waste and use a proper garbage bin; manage pet food and bowls as wildlife attractants. Keep wildlife at a distance and never use a dog to approach, chase or draw an animal out. A quiet town path can still contain wildlife.</p>
<p><strong>Leash length has a jurisdiction.</strong> For national-park areas outside the Town of Banff, the <a href="${dog.federalAnimals}" target="_blank" rel="noopener">federal Domestic Animals Regulations</a> define the dog-leash form of physical control as a leash that does not exceed <strong>3 metres</strong>. Those regulations expressly exclude the Town of Banff. The <a href="${dog.townAnimals}" target="_blank" rel="noopener">Town’s Animal Services bylaw</a> separately defines physical control using a leash no longer than three metres, securely held by a competent, physically capable guardian. Check the applicable posted rules, including designated off-leash areas; a leash does not grant access to a restricted place.</p>
<p><a href="${dog.regulations}" target="_blank" rel="noopener">Parks Canada’s visitor guidance</a> says never to leave pets unattended in a vehicle, campsite, tent or elsewhere. Do not tie a dog outside while the group enters a building. A pet room does not replace the care needed for a day away, and leaving a window open does not make a parked car a care arrangement.</p>
<p>Check the <a href="${dog.bulletins}" target="_blank" rel="noopener">current bulletins</a>, <a href="${dog.trails}" target="_blank" rel="noopener">trail report</a> and signs at the actual route. An open path can still have a dog restriction, and the absence of a named route from an old list is not permission. A park, Town, carrier or property can have different requirements for the particular place and activity.</p>

<h2 id="dog-transport">Transport: ordinary pets and service animals have different arrangements</h2>
<table><caption>Check the animal and the actual service before buying the people’s tickets</caption><thead><tr><th scope="col">Service</th><th scope="col">Published ordinary-pet boundary</th><th scope="col">What remains to arrange</th></tr></thead><tbody>
<tr><th scope="row"><a href="${dog.roam}" target="_blank" rel="noopener">Roam Transit</a></th><td>A clean animal carrier small enough for the owner’s lap; pet fully enclosed. Backpacks, totes and pet strollers do not qualify.</td><td>The stop, complete journey and suitable carrier. Floor placement depends on available space; it is not an entitlement.</td></tr>
<tr><th scope="row"><a href="${dog.lakeShuttle}" target="_blank" rel="noopener">Parks lake shuttles</a></th><td>A small animal carrier that fits on the owner’s lap; pet enclosed throughout and carrier held at all times.</td><td>The actual seasonal service, reservation and every onward leg.</td></tr>
<tr><th scope="row"><a href="${dog.airport}" target="_blank" rel="noopener">Banff Airporter</a></th><td>Its current FAQ says ordinary pets are not allowed in its vehicles.</td><td>A different provider’s confirmed arrangement if travelling with an ordinary pet.</td></tr>
<tr><th scope="row">Private transfer or rental</th><td>The actual provider’s agreement applies.</td><td>Acceptance of this dog, vehicle, restraint/carrier, luggage, charges and both directions.</td></tr>
</tbody></table>
<p>A larger dog that cannot use the required carrier needs a different confirmed transport plan. Do not arrive expecting the driver to waive the policy. Service animals have separate carrier and venue arrangements; consult the particular provider’s documentation and support requirements in advance rather than applying an ordinary-pet rule or one universal certification claim.</p>

<h2 id="dog-lakes">Lake Louise, Moraine and Minnewanka: separate access questions</h2>
<p>Do not treat all Lake Louise and Moraine Lake trails as either dog-banned or dog-permitted. Select the exact destination, read its current restrictions and solve transport separately. <a href="${dog.lakeAccess}" target="_blank" rel="noopener">Parks’ access page</a> explains the permitted services: Moraine Lake Road is closed to personal vehicles year-round, with specified exceptions. The 2026 Parks lake-shuttle season ended October 12. That supplies no winter ride or future-season timetable.</p>
<p>For a dog that cannot board a public shuttle, a private company is only an option after it confirms the animal, authorized journey, date and return. A village hotel does not put you at the lakeshore; use the <a href="/blog/lake-louise-village-guide/">Lake Louise place and arrival guide</a>. No transport confirmation supplies permission for every trail beyond the stop.</p>
<p>At Minnewanka, the <a href="${dog.minnewanka}" target="_blank" rel="noopener">annual July 10–September 15 restriction</a> prohibits dogs beyond Stewart Canyon Bridge in the specified Minnewanka/Aylmer trail area. Read the boundary and current notices; this is not a blanket rule for every shore location or approval outside those dates. The <a href="${dog.cruise}" target="_blank" rel="noopener">cruise operator’s pet decision is discretionary</a>, so an operating sailing is not a guaranteed dog outing or a solution to a bus carrier limit.</p>

<h2 id="dog-town">Town walking and designated off-leash areas</h2>
<p>A short town outing with a known return can be an enjoyable main plan. Choose the actual open section, surface and turnaround for the people and dog. The <a href="${dog.bowFalls}" target="_blank" rel="noopener">Town’s Bow Falls page</a> says its clifftop section closes in winter; do not turn the whole riverside journey into a flat, year-round loop. Remain on permitted paths and away from river edges and wildlife.</p>
<p>The <a href="${dog.parks}" target="_blank" rel="noopener">Town names Sundance Park and Industrial District off-leash parks</a>. Sundance has a spring dry-out closure; the Industrial District area needs frozen ground and snow cover and can close during thaws. Check <a href="${dog.townConditions}" target="_blank" rel="noopener">Town conditions</a> and posted rules rather than assuming a park is open because the calendar says winter.</p>
<p>The posted dog-park rules include licensing and vaccinations, no puppies under five months, and voice and sight control. Read the complete rules for your dog. Those designated areas do not make a surrounding trail, campsite or quiet roadside an off-leash alternative.</p>

<h2 id="dog-winter">Build a modest winter plan with a real warm return</h2>
<p>Use <a href="${dog.winter}" target="_blank" rel="noopener">Parks’ winter walking information</a> for the chosen route and the least experienced person. Its winter guidance calls for current conditions and changing-weather preparation even close to town. Shorten the outing when the dog or people need it; do not use a fixed distance or a dog’s enthusiasm as a suitability test.</p>
<p>The <a href="${dog.seasonal}" target="_blank" rel="noopener">seasonal restriction list</a> identifies dog exclusions on certain track-set ski trails. Read the current trail description, notices and signs. A summer path or an expired winter order does not establish permission for a new season. This guide offers no winter Moraine Lake approach, lake crossing or ski-trail workaround.</p>
<p>Keep the return close enough to work for the dog, with water, food, waste bags and the dog’s appropriate clothing or paw supplies. Ask your vet about individual health or cold-related needs before travel. The <a href="/packing-list/">packing checklist</a> helps organise equipment; it does not confer terrain skills or confirm natural ice. Keep meal and care choices usable if outdoor time becomes shorter.</p>

<h2 id="dog-meals">Meals and human-only attractions need a care plan</h2>
<p><a href="${dog.patio}" target="_blank" rel="noopener">Bear Street Tavern publishes a dog-friendly courtyard patio</a>. Confirm that exact space is operating for your date and can accept the party and dog. A summer patio description is not an indoor or winter dining promise. Arrange another meal or supervised care if outdoor seating does not work; do not rely on every restaurant having the same rule.</p>
<p>The <a href="${dog.gondola}" target="_blank" rel="noopener">Banff Gondola excludes ordinary pets from the ride and facilities</a>. If it is essential to the trip, confirm appropriate care before buying the people’s admission. Otherwise choose a plan everyone can join. Do not use a vehicle, tied leash or unconfirmed room arrangement as the alternative.</p>
<p>For a group with several adults, decide who is with the dog during food collection, check-in and any separate outing. A split plan needs its own timing and return; it should not leave one person or the animal stranded while the other activities run late. The <a href="/eat-and-drink/#dining-finder">dining finder</a> can locate a meal, but its formats do not establish pet admission.</p>

<h2 id="dog-stay">Join the pet room to the arrival</h2>
<p>Confirm the dog and exact pet-room allocation directly, including any size, count, species or supervision rules. Choose the actual room category and entrance, not just the hotel name. Put the animal arrangement on the confirmation and keep the current pet charges and terms with it.</p>
<p>The <a href="/blog/banff-pet-friendly-hotels/">property-specific hotel comparison</a> separates pet-designated rooms, dining restrictions and a property that does not admit pets. Use <a href="/winter-stays/">winter stay planning</a> for the room and transport tradeoffs; its filters do not reserve a pet room. If reaching Banff late, resolve the final vehicle leg and reception instructions before relying on a walk from an unfamiliar stop.</p>
<p>The inherited <a href="${banffHotels}" target="_blank" rel="noopener sponsored">Expedia Banff accommodation search</a> is a broad destination search. Its pet filter is a starting point, not confirmation of this dog’s room or the hotel’s current policy. This is an affiliate link; BanffBound may earn a commission if you book. For actual location/category comparisons, use the <a href="/book/banff-hotels/">reviewed Banff hotel choices</a> and then obtain the property’s pet confirmation.</p>

<h2 id="dog-day">A practical town-led day</h2>
<ol><li><strong>Before leaving:</strong> check the selected path, notices, transport and dog-park status if relevant.</li><li><strong>Main outing:</strong> take a suitable permitted walk with an adjustable turnaround and the dog under control.</li><li><strong>Meal:</strong> use the confirmed patio, a planned takeaway arrangement or supervised care.</li><li><strong>Afternoon:</strong> keep another local option or rest with the dog; a distant attraction is optional.</li><li><strong>Return:</strong> leave time for the actual connection, food, equipment and the room’s rules.</li></ol>
<p>For a longer trip, keep those dependencies visible in <a href="/trip-builder/">Trip Builder</a> and compare actual room, transport and care quotes in <a href="/trip-cost/">the budget planner</a>. Neither tool assesses the dog’s welfare, trail suitability or provider admission.</p>
<h2 id="dog-questions">Questions about visiting Banff with a dog</h2>
${faqs('banff-dog-friendly')}
<h2 id="dog-sources">Sources and review</h2>
<p><strong>Full guide reviewed October 29, 2026.</strong> Linked Parks, Town, carrier and operator pages support selected rules and planning boundaries. Current reports and the actual booking still need checking for your date. No live pet-room, carrier space, patio seat or route opening is established here. The hero is illustrative, not verified as a particular route, dog-permitted location or current season.</p>
`,
  'banff-pet-friendly-hotels': `
<p>A useful pet-hotel choice begins with the room you can actually reserve and how the dog will spend the stay. The right arrangement joins sleeping, meals, walks, transport and supervision. A “pets allowed” search result cannot tell you whether your chosen kitchen suite, connecting rooms or accessible category can also accept your animal.</p>
<p><strong>Full guide reviewed October 29, 2026.</strong> These are selected operator-policy comparisons, not a ranking or a live pet-room inventory. Five starting options and one exclusion are distinguished below. Use the <a href="/blog/banff-dog-friendly/">complete dog travel guide</a> for park rules, carrier limits, winter days and care, and the <a href="/dog-friendly/#dog-ideas">existing dog-friendly filters</a> to organise outing ideas.</p>
<nav aria-label="Banff pet hotel guide sections"><p><a href="#pet-room">Reserve the actual room</a> · <a href="#pet-comparison">Compare policies</a> · <a href="#pet-banff">Banff options</a> · <a href="#pet-louise">Lake Louise</a> · <a href="#pet-exclusion">Royal Canadian Lodge</a> · <a href="#pet-supervision">Supervision</a> · <a href="#pet-meals">Meals and shared areas</a> · <a href="#pet-arrival">Arrival and winter</a> · <a href="#pet-quote">Quote and booking</a> · <a href="#pet-questions">Questions</a></p></nav>

<h2 id="pet-room">Reserve an animal arrangement and a room together</h2>
<p>Tell the property what animal is travelling, the number of animals and any relevant size or other details it requests. Ask which exact room categories can accommodate them. A request in a marketplace notes box is not the same as the hotel accepting that request and allocating the room. Obtain its answer before choosing a rate that would be difficult to change.</p>
<p>Then combine the people’s needs with the animal allocation: separate beds, a real bedroom, cooking appliances, bathroom access, floor and steps. Ask whether those requirements can be met together. Do not select a full-kitchen category on one page and assume the separate pet policy extends to it. If the hotel cannot confirm the combination, compare another actual option rather than treating two independent feature labels as one offer.</p>
<p>Keep the room name, animal acceptance, current charge and essential conditions with the confirmation. Confirm changes if the party, animal or category changes later. A property photo, generic chain policy or previous stay is not the policy for a different hotel or booking.</p>

<h2 id="pet-comparison">Compare selected operator policies</h2>
<table><caption>Five pet-stay starting options and one explicit exclusion — no room or animal acceptance is reserved</caption><thead><tr><th scope="col">Property and base</th><th scope="col">Selected published boundary</th><th scope="col">Useful question before booking</th></tr></thead><tbody>
<tr><th scope="row"><a href="/hotel-directory/moose-hotel-suites/">Moose Hotel &amp; Suites, Banff</a></th><td>Selected pet rooms; notify reservations. No unattended pets; furniture and some public areas restricted.</td><td>Can the actual room category accept this animal, and which meal spaces can you use together?</td></tr>
<tr><th scope="row"><a href="/hotel-directory/tunnel-mountain-resort/">Tunnel Mountain Resort, Banff</a></th><td>Pet-room allocation through reservations; not every room qualifies. No unattended pets.</td><td>Is the required condo/cabin or suite category pet eligible, and what is the route from parking?</td></tr>
<tr><th scope="row"><a href="/hotel-directory/fairmont-banff-springs/">Fairmont Banff Springs, Spray Avenue</a></th><td>Up to two pets per room, supervision and leashes; restaurants and aquatic areas excluded.</td><td>Confirm the animal, room, permitted patio and any separately booked care.</td></tr>
<tr><th scope="row"><a href="/hotel-directory/lake-louise-inn/">Lake Louise Inn, village</a></th><td>Dogs only, maximum two; designated rooms need advance approval.</td><td>Which actual category and building are confirmed under the current dog policy?</td></tr>
<tr><th scope="row"><a href="/hotel-directory/fairmont-chateau-lake-louise/">Fairmont Chateau Lake Louise, lakeshore</a></th><td>Pet-room floor restrictions; no unsupervised pets; dining, patio and pool-deck exclusions.</td><td>How will the people eat and reach activities while the dog remains supervised?</td></tr>
<tr><th scope="row"><a href="/hotel-directory/royal-canadian-lodge/">Royal Canadian Lodge, Banff — exclusion</a></th><td>The current official FAQ says pets are not permitted.</td><td>Choose another property for an ordinary pet; do not apply a legacy Marriott description.</td></tr>
</tbody></table>
<p>The profile links help compare the base and selected room facts. They do not replace the operator policies below or establish all details of a pet stay. These are examples with different practical constraints, not a claim that every Banff-area pet option is listed or that one is cheapest.</p>

<h2 id="pet-banff">Banff: different rooms, settings and meal arrangements</h2>
<h3>Moose Hotel &amp; Suites</h3>
<p>The <a href="${hotel.moose}" target="_blank" rel="noopener">Moose pet policy</a> asks guests to notify the hotel and call reservations for a pet room. It prohibits unattended pets and furniture use and restricts some public areas. It does not identify every accepted species, size or eligible room category. Confirm your animal and chosen category directly.</p>
<p>Pacini’s patio is a separately described dog option with leash, furniture and vaccination conditions; ordinary dogs cannot enter the restaurant. Check the actual patio operation for the date. A kitchenette or a central location may help your routine, but neither removes supervision or meal restrictions.</p>
<h3>Tunnel Mountain Resort</h3>
<p>The <a href="${hotel.tunnel}" target="_blank" rel="noopener">resort’s own pet page</a> requires notification at reservation and a call to allocate a pet room. It says not every room qualifies and prohibits leaving pets unattended. Leash, furniture and public-area limits apply. The page does not settle all species, count, size or category questions.</p>
<p>Resolve the actual suite, condo or cabin, stairs and walking arrangement. A room with cooking facilities can be useful only if that same category is approved for the animal. If the holiday includes town meals or resort skiing, join the whole outward and return journey to a confirmed supervision plan.</p>
<h3>Fairmont Banff Springs</h3>
<p>The <a href="${hotel.springs}" target="_blank" rel="noopener">property’s guest services</a> publish a maximum of two pets per room, supervision at all times, leashes in public places and restaurant/aquatic-facility exclusions. Its <a href="${hotel.springsPets}" target="_blank" rel="noopener">pet page</a> welcomes dogs. Do not infer acceptance of every other animal or every room category.</p>
<p>Outdoor patios are a permitted dog setting under this operator’s policy, with the actual venue and operation to confirm. Pet sitting requires advance arrangements; the published 24-hour notice requirement is not a confirmed sitter. Keep that service and its hours separate from the room booking and the length of your outing.</p>

<h2 id="pet-louise">Lake Louise: village and lakeshore create different routines</h2>
<h3>Lake Louise Inn</h3>
<p>The <a href="${hotel.inn}" target="_blank" rel="noopener">dedicated dog policy</a> says <strong>dogs only: cats and other pets are not accepted</strong>. It allows a maximum of two dogs in designated rooms, with advance approval and a pet agreement at check-in. Food and beverage outlets, meeting spaces and the pool area are restricted.</p>
<p>The dedicated policy and <a href="${hotel.innOverview}" target="_blank" rel="noopener">homepage room-category descriptions</a> do not give identical eligibility lists. Confirm the actual category rather than relying on a universal “all rooms” claim. Building, floor, bedding and cooking equipment are additional checks. This guide does not turn a kennel clause into advice to leave a dog alone; plan supervision and clarify the applicable requirements.</p>
<h3>Fairmont Chateau Lake Louise</h3>
<p>The <a href="${hotel.chateau}" target="_blank" rel="noopener">Chateau guest-services page</a> excludes pet accommodation on the main building’s sixth floor and Mount Temple Wing’s fifth floor. Pets must not be unsupervised in rooms. Food and beverage areas, outdoor patios, restaurant waiting areas and the Health Club pool deck are excluded.</p>
<p>The <a href="${hotel.chateauPets}" target="_blank" rel="noopener">pet page</a> offers advance pet-sitting arrangements, with at least 24 hours’ notice. That is an enquiry to complete, not capacity reserved with the room. Unlike the Banff Springs patio policy, the Chateau’s ordinary-pet rules do not make an outdoor restaurant patio the meal solution.</p>
<p>Use <a href="/towns/lake-louise/">the Lake Louise base guide</a> and <a href="/book/lake-louise-stays/">the village/lakeshore/road-base comparison</a> for geography and room tradeoffs. A village stay is not at the lakeshore, and neither place is the ski resort. Complete the animal’s transport as well as the people’s activity booking.</p>

<h2 id="pet-exclusion">Royal Canadian Lodge is not a pet recommendation</h2>
<p>The <a href="${hotel.royal}" target="_blank" rel="noopener">current official Royal Canadian Lodge FAQ</a> says <strong>pets are not permitted</strong>. Do not book an ordinary-pet stay using an old Delta/Marriott name or a supposed standard chain policy. This guide does not extend that answer into a ruling about service-animal rights; discuss the relevant arrangements directly with the property.</p>
<p>If the original shortlist included this hotel for a dog, choose another confirmed option before paying. Similar names, a provider result or a familiar logo cannot substitute for the actual property’s current answer.</p>

<h2 id="pet-supervision">Make supervision part of the holiday</h2>
<p><a href="${hotel.regulations}" target="_blank" rel="noopener">Parks Canada’s visitor guidance</a> says never to leave an animal unattended. A hotel’s room eligibility or equipment wording does not itself create an appropriate care arrangement. Resolve the property’s conditions, the relevant visitor guidance and your dog’s needs together.</p>
<p>For skiing, an attraction or an indoor meal, confirm who is with the dog for the whole absence, including the journey and possible delays. Obtain the care provider’s acceptance, collection and return arrangements and actual cancellation terms. An enquiry, a list of sitter names or a minimum notice period is not a booking.</p>
<p>When travelling as a group, a planned split can work if everyone agrees to it: one person stays with the dog while another collects food or attends a separate activity. Give both parts of the group a workable day and a complete return. Do not assume a member of hotel staff will supervise the animal.</p>

<h2 id="pet-meals">Check the particular shared space</h2>
<p>A pet room does not confer restaurant, lounge, pool, spa, shuttle or patio access. Ask which entrance and shared areas are permitted, whether the dog can accompany you to food collection and how housekeeping works with supervision. Keep ordinary-pet conditions separate from the arrangements for a qualified service animal.</p>
<p>Build meals around something confirmed: the permitted operating patio, food collected while another adult supervises, or properly arranged care. If cooking matters, verify the actual appliances and grocery journey in the pet-eligible room. A pool or spa photograph is not an invitation to bring the dog through that area.</p>

<h2 id="pet-arrival">Work through arrival, walks and winter mornings</h2>
<p>Follow the journey from the terminal or vehicle to the actual pet-room entrance, with bags and the dog under control. Ask about arrival outside room hours, where the party can wait and where a permitted short walk begins. Confirm parking and any property transfer; a room allocation does not reserve space on a bus or accept the dog on a carrier.</p>
<p>Use the <a href="/blog/banff-dog-friendly/#dog-transport">dog transport comparison</a> before buying airport, regional or lake travel. Its carrier rules are not interchangeable. For winter, identify a suitable open walk and an easy return to the supervised room, then plan breakfast and the people’s activity separately. <a href="/winter-stays/">Winter stay choices</a> compare rooms and bases, not animal eligibility.</p>
<p>Keep the first evening simple enough for an unfamiliar arrival and the final morning clear enough for checkout and the actual airport or onward connection. The <a href="/packing-list/">packing checklist</a> and <a href="/conditions/">dated report hub</a> provide further planning steps; equipment and a hotel booking do not approve terrain or ice.</p>

<h2 id="pet-quote">Compare the complete confirmed quote</h2>
<p>Ask how the current pet charge is applied, whether any required fee, deposit, cleaning or damage terms are additional, and how taxes and parking affect the total. Include confirmed care and both directions of transport. Use the same people, animals, room configuration and nights in <a href="/trip-cost/">the two-plan budget comparison</a>, leaving missing amounts unknown.</p>
<p>Use the <a href="/book/banff-hotels/">reviewed Banff hotel comparison</a> for location and category choices, then confirm the pet allocation with the property. The inherited <a href="${banffHotels}" target="_blank" rel="noopener sponsored">Expedia Banff accommodation search</a> remains a broad Banff search, not a confirmed pet-room quote or Lake Louise room inventory.</p>
<p>The inherited <a href="${banffActivities}" target="_blank" rel="noopener sponsored">GetYourGuide Banff activity catalogue</a> is also a general search, <strong>not a verified dog-admitting tour list</strong>. Establish admission or confirmed care before considering a specific activity. Both search links are affiliate links; BanffBound may earn a commission if you book.</p>
<p>Before paying, retain the room name, written animal acceptance and complete terms, then recheck any dependent transport and care. If the animal or room cannot be accepted, revise the plan rather than assuming another branch or a different category follows the same policy.</p>
<h2 id="pet-questions">Questions about Banff-area pet rooms</h2>
${faqs('banff-pet-friendly-hotels')}
<h2 id="pet-sources">Sources and review</h2>
<p><strong>Full guide reviewed October 29, 2026.</strong> The linked operator policies support selected facts and preserve unresolved allocation, species and category questions. Current charges, rooms, care capacity and operating spaces need the actual property’s confirmation. The hero is illustrative, not verified as a named hotel, pet room or permitted shared area.</p>
`,
};

export const petTravelGuideMetadata: Record<string, { title: string; description: string; lastUpdated: string; readTime: string; imageIsIllustrative: true; imageNote: string }> = {
  'banff-dog-friendly': { title: 'Banff with a Dog: Transport, Walks, Winter & the Whole Visit', description: 'Plan Banff with a dog using current park rules, carrier policies, seasonal walking checks, meals, supervision and an explicitly confirmed pet room.', lastUpdated: reviewDate, readTime: '12 min read', imageIsIllustrative: true, imageNote: 'Illustrative image; not verified as a named dog-permitted route, venue, season or current condition.' },
  'banff-pet-friendly-hotels': { title: 'Banff Pet-Friendly Hotels: Confirm the Room, Care & Policy', description: 'Compare selected Banff and Lake Louise pet-room policies, accepted animals, supervision and meal restrictions, then confirm the actual category and complete quote.', lastUpdated: reviewDate, readTime: '12 min read', imageIsIllustrative: true, imageNote: 'Illustrative image; not verified as a named hotel, pet-designated room, shared area or current facility.' },
};
