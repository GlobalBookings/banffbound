/** Retained-URL full review; original publication is preserved in blogPosts. */
export const reviewDate = '2026-10-29';
export const packingGuideSources: Record<string, Record<string, string>> = {
  "banff-packing-list": {
    "weather": "https://banff.ca/595/Prepare-for-Mountain-Weather",
    "hiking": "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking",
    "winter": "https://parks.canada.ca/pn-np/ab/banff/activ/marchehiver-winterwalking/banff",
    "airport": "https://www.catsa-acsta.gc.ca/en/travel-tips/outdoor-adventure",
    "batteries": "https://www.catsa-acsta.gc.ca/en/what-can-bring/guidelines-batteries",
    "charger": "https://www.catsa-acsta.gc.ca/en/what-can-bring/item/portable-charger",
    "carrier": "https://www.aircanada.com/ca/en/aco/home/plan/baggage/special-items.html",
    "camping": "https://parks.canada.ca/pn-np/mtn/ours-bears/securite-safety/camping-propre-bare-camp.aspx",
    "bearSpray": "https://parks.canada.ca/pn-np/mtn/ours-bears/securite-safety/gaz-spray"
  }
};
const s = packingGuideSources['banff-packing-list'];
export const packingGuideFaqs: Record<string, { question: string; answer: string }[]> = {
  "banff-packing-list": [
    {
      "question": "Can one Banff packing list cover every month and outing?",
      "answer": "No. Start with the actual activity, approach, forecast, current surface, group and return. A town meal, winter walk, first ski lesson and remote hike need different equipment and skills. Use the existing month/activity checklist to organise the plan, then confirm the particular provider’s requirements."
    },
    {
      "question": "Does a jacket’s advertised temperature number establish my whole outfit’s suitability?",
      "answer": "No. A product label or search term does not assess the complete clothing system, wind, wet conditions, activity, time outside or individual needs. Check the actual product specification and fit with the layers you intend to wear. Do not turn a minus-20 search phrase into a tested rating or a universal winter threshold."
    },
    {
      "question": "Can I fly to Banff with bear spray or hiking poles in my hand baggage?",
      "answer": "CATSA’s outdoor-adventure guidance says bear spray is not allowed in either carry-on or checked baggage and hiking poles must be checked. Check the actual airports and carriers for all legs. Arrange bear spray locally, learn its use, and confirm an accepted return or disposal route before the flight home; do not assume an airport collection bin."
    },
    {
      "question": "Where should I pack a power bank for my flight?",
      "answer": "CATSA recommends carrying power banks in your carry-on luggage and checking the airline’s capacity, storage and onboard-use policies. Its overview and item page differ in their checked-baggage wording, so this guide gives no blanket checked-baggage allowance. Keep the item’s rating available and recheck the actual carrier, including any gate-check of your cabin bag."
    },
    {
      "question": "Are the Amazon links a tested equipment shortlist?",
      "answer": "No. These are Amazon Canada category searches and affiliate links. Results, sellers, specifications and prices can change. No particular product, fit, performance rating, stock or airline acceptance was tested here. BanffBound may earn a commission if you buy through them."
    }
  ]
};
const esc = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function faqs(): string { const entries = packingGuideFaqs['banff-packing-list']; return entries.map(faq => `<details><summary>${esc(faq.question)}</summary><p>${esc(faq.answer)}</p></details>`).join('\n') + `<script type="application/ld+json">${JSON.stringify({ '@context':'https://schema.org', '@type':'FAQPage', mainEntity:entries.map(faq => ({ '@type':'Question', name:faq.question, acceptedAnswer:{ '@type':'Answer', text:faq.answer } })) }).replace(/</g, '\\u003c')}</script>`; }
const inheritedCategorySearches = [
  {
    "href": "https://www.amazon.ca/s?k=merino+wool+base+layer&tag=banffbound-20",
    "label": "Base-layer searches"
  },
  {
    "href": "https://www.amazon.ca/s?k=packable+down+jacket&tag=banffbound-20",
    "label": "Packable insulation searches"
  },
  {
    "href": "https://www.amazon.ca/s?k=waterproof+hiking+rain+jacket&tag=banffbound-20",
    "label": "Rain-shell searches"
  },
  {
    "href": "https://www.amazon.ca/s?k=quick+dry+hiking+pants&tag=banffbound-20",
    "label": "Quick-drying trouser searches"
  },
  {
    "href": "https://www.amazon.ca/s?k=waterproof+hiking+boots&tag=banffbound-20",
    "label": "Hiking-boot searches"
  },
  {
    "href": "https://www.amazon.ca/s?k=merino+wool+hiking+socks&tag=banffbound-20",
    "label": "Hiking-sock searches"
  },
  {
    "href": "https://www.amazon.ca/s?k=merino+wool+thermal+base+layer&tag=banffbound-20",
    "label": "Thermal-layer searches"
  },
  {
    "href": "https://www.amazon.ca/s?k=insulated+winter+jacket+-20&tag=banffbound-20",
    "label": "Winter-jacket searches"
  },
  {
    "href": "https://www.amazon.ca/s?k=waterproof+hardshell+jacket&tag=banffbound-20",
    "label": "Hardshell searches"
  },
  {
    "href": "https://www.amazon.ca/s?k=insulated+snow+pants&tag=banffbound-20",
    "label": "Snow-trouser searches"
  },
  {
    "href": "https://www.amazon.ca/s?k=insulated+winter+gloves+touchscreen&tag=banffbound-20",
    "label": "Winter-glove searches"
  },
  {
    "href": "https://www.amazon.ca/s?k=merino+wool+neck+gaiter&tag=banffbound-20",
    "label": "Neck-gaiter searches"
  },
  {
    "href": "https://www.amazon.ca/s?k=thick+merino+wool+winter+socks&tag=banffbound-20",
    "label": "Winter-sock searches"
  },
  {
    "href": "https://www.amazon.ca/s?k=insulated+waterproof+winter+boots&tag=banffbound-20",
    "label": "Winter-boot searches"
  },
  {
    "href": "https://www.amazon.ca/s?k=microspikes+ice+cleats+hiking&tag=banffbound-20",
    "label": "Boot-traction searches"
  },
  {
    "href": "https://www.amazon.ca/s?k=SPF+50+sunscreen+sport&tag=banffbound-20",
    "label": "Sunscreen searches"
  },
  {
    "href": "https://www.amazon.ca/s?k=polarized+hiking+sunglasses&tag=banffbound-20",
    "label": "Sunglasses searches"
  },
  {
    "href": "https://www.amazon.ca/s?k=insulated+water+bottle+hiking&tag=banffbound-20",
    "label": "Water-bottle searches"
  },
  {
    "href": "https://www.amazon.ca/s?k=20L+hiking+daypack&tag=banffbound-20",
    "label": "Daypack searches"
  },
  {
    "href": "https://www.amazon.ca/s?k=portable+charger+power+bank&tag=banffbound-20",
    "label": "Power-bank searches"
  },
  {
    "href": "https://www.amazon.ca/s?k=hiking+first+aid+kit&tag=banffbound-20",
    "label": "First-aid-kit searches"
  }
];
function gearSearches(): string { return [
  { title: 'Layers for an adjustable clothing system', items: inheritedCategorySearches.slice(0, 6) },
  { title: 'Winter clothing and footwear categories', items: inheritedCategorySearches.slice(6, 15) },
  { title: 'Day-bag and personal-equipment categories', items: inheritedCategorySearches.slice(15) },
].map(group => `<h3>${esc(group.title)}</h3><p>${group.items.map(item => `<a href="${esc(item.href)}" target="_blank" rel="noopener sponsored">${esc(item.label)}</a>`).join(' · ')}</p>`).join('\n'); }

export const packingGuideOverrides: Record<string, string> = {
  'banff-packing-list': `
<p>A useful Banff bag starts with the days you intend to have. Write down the main outing, where it starts, how you will reach it and how you will return. Then decide what you need to wear, carry, arrange locally or leave at your base. A suitcase full of outdoor equipment is not a substitute for choosing an appropriate route.</p>
<p><strong>Full guide reviewed October 29, 2026.</strong> This guide explains selection, fit and pack-versus-rent decisions. Use the <a href="/packing-list/">existing month and activity packing checklist</a> to organise your own items; there is no second checklist to maintain here. The hero image is illustrative, not a verified view of an outing or its present conditions.</p>
<nav aria-label="Packing guide sections"><p><a href="#pack-outing">Start with the outing</a> · <a href="#pack-clothing">Clothing system</a> · <a href="#pack-footwear">Footwear and traction</a> · <a href="#pack-day">The day bag</a> · <a href="#pack-flight">Flight restrictions</a> · <a href="#pack-rent">Pack or rent</a> · <a href="#pack-base">At your base</a> · <a href="#pack-searches">Optional category searches</a> · <a href="#pack-questions">Questions</a></p></nav>

<h2 id="pack-outing">Start with an actual outing, not a season label</h2>
<p>The <a href="${s.weather}" target="_blank" rel="noopener">Town’s mountain-weather guide</a> describes substantial seasonal variation, including cold spring evenings and changeable autumn days. A date on the calendar is not a temperature guarantee. Check the forecast for the actual place, rather than using a town average to decide what a higher or more remote outing requires.</p>
<table><caption>Different plans ask different packing questions</caption><thead><tr><th scope="col">Your plan</th><th scope="col">Resolve before adding gear</th><th scope="col">Useful next step</th></tr></thead><tbody>
<tr><th scope="row">Town time and a meal</th><td>The outside journey, weather, comfortable footwear and where to leave or dry belongings.</td><td>Match the bag to the walking and return, not only the time indoors.</td></tr>
<tr><th scope="row">A selected walk</th><td>Current surface, route demands, food, water, navigation, spare clothing and a turnaround.</td><td>Read the actual trail description and current official report.</td></tr>
<tr><th scope="row">A first ski lesson</th><td>Meeting point, booked equipment, fitting, clothing and what the operator actually includes.</td><td>Use the <a href="/learn-to-ski/">lesson planner</a> before packing for an assumed package.</td></tr>
<tr><th scope="row">A longer mountain day</th><td>The group’s experience, emergency preparation, communication and the complete return.</td><td>Change the outing when the equipment, knowledge or conditions do not match.</td></tr>
<tr><th scope="row">An overnight camp</th><td>The exact reserved site, services, equipment and food-storage arrangement.</td><td>Read the site’s own instructions, not a generic hotel packing list.</td></tr>
</tbody></table>
<p>Put travel days into the plan too. If luggage storage, room access, a rental fitting or a late arrival stands between the flight and the first outing, keep that dependency visible. Use the <a href="/blog/banff-first-time-tips/#first-visit-planner">six-step first-visit plan</a> to join arrival, base, days, access, quotes and backup.</p>

<h2 id="pack-clothing">Check how the clothing works together</h2>
<p>Build from clothing you can adjust rather than a fixed number of shirts or an advertised jacket threshold. Test the actual layers together: can you move comfortably, adjust ventilation and get the outer layer over the insulation? Include a way to keep spare clothing dry, and distinguish what you wear while moving from what you may need while waiting or stopped.</p>
<p><a href="${s.hiking}" target="_blank" rel="noopener">Parks’ hiking guidance</a> says mountain weather changes quickly and snow can occur in any month. It calls for layers, warm clothing, extra food and your own water or appropriate treatment because surface water may be unsafe. Those are preparation categories, not evidence that one fabric, pack volume or water quantity fits every person and route.</p>
<p>For winter, think about the whole exposed journey: the walk to a bus stop, a queue, a lesson meeting point and the return can matter alongside the main activity. Gloves, head covering, suitable footwear and adjustable layers need to work with the equipment you will use. Leave space for the clothing an instructor or operator requires; a purchased ticket does not supply every item.</p>
<p>The winter-jacket category search below includes a minus-20 phrase. That is a search term, not a performance test or a universal outfit rating. Read the actual specification, check the conditions and avoid planning the day around a single advertised number. A shorter or different outing is a valid response when the full system does not meet the plan.</p>

<h2 id="pack-footwear">Try the footwear with the socks and equipment</h2>
<p>Choose footwear for the intended surface and activity, then try it with the socks you will wear. Consider room, rubbing, fastening and how it feels with a loaded day bag. A broad claim such as “waterproof hiking boots are the single most important item” cannot decide every trip: a town visit, a ski fitting and a natural trail are different situations.</p>
<p><a href="${s.winter}" target="_blank" rel="noopener">Parks’ winter-walking guidance</a> recommends poles and ice cleats for icy paths, alongside route descriptions, current reports and changing-weather checks. Confirm the device fits your particular footwear and that you understand its intended use. Traction equipment does not establish a safe route, clear a closure or provide avalanche skills.</p>
<p>A summer hiking grade does not describe a winter surface. Use <a href="/accessible-trails/#trail-profiles">published physical trail profiles</a> where relevant, and ask about the approach and complete return for the person and equipment involved. Avoid making an unplanned route change merely to justify carrying a new item.</p>

<h2 id="pack-day">Pack for the complete day, including a delay</h2>
<p>Choose a bag that holds the actual load and fits the wearer. Put the items you will need during the journey where you can reach them without unpacking everything. Keep food, water, spare layers, navigation, a light and familiar first-aid supplies together with the equipment appropriate to the outing. Do not copy a fixed litre capacity or a universal water minimum as proof that the bag is adequate.</p>
<p>Prepare maps, confirmations and the return contact before leaving a working connection. Parks warns that cell coverage is unreliable throughout the national park; possession of a phone does not establish reception or an emergency response. Learn any communication device’s actual functions before relying on it. The <a href="/blog/banff-mobile-connectivity/">connectivity guide</a> separates saved information from a working connection.</p>
<p>Power is another part of that preparation. Check the phone, light, cables and charger together, and protect equipment according to its manufacturer’s instructions. A charged power bank cannot repair an unsuitable cable or provide a signal. Keep an alternative for essential navigation and enough flexibility to end the outing earlier.</p>

<h2 id="pack-flight">Resolve flight restrictions before the airport</h2>
<p><a href="${s.airport}" target="_blank" rel="noopener">CATSA’s outdoor-adventure page</a> says bear spray is not permitted in either carry-on or checked baggage, while hiking poles must be checked. It also distinguishes clean camping stoves from prohibited fuel. These Canadian screening examples are not a complete worldwide allowance list: check the actual items, departure airports and carriers for every leg.</p>
<p>Arrange bear spray locally when required for your chosen activities, learn its use and check how to return or dispose of it before flying home. Do not assume a rental is available, an unopened can is flight-approved or an airport collection bin exists. <a href="${s.bearSpray}" target="_blank" rel="noopener">Parks’ bear-spray guidance</a> and the <a href="/bear-spray">local planning guide</a> are starting points for preparation, not a product endorsement.</p>
<p>For charging equipment, <a href="${s.batteries}" target="_blank" rel="noopener">CATSA’s battery overview</a> recommends keeping power banks in carry-on and checking airline policies. Its <a href="${s.charger}" target="_blank" rel="noopener">portable-charger item page</a> and overview differ in their checked-baggage wording. This guide therefore gives no blanket checked-baggage allowance or capacity approval. Keep the rating available, check carrier storage and onboard-use rules, and reconsider the contents if your cabin bag is checked at the gate.</p>
<p>Read the carrier’s equipment page before choosing the bag. For example, <a href="${s.carrier}" target="_blank" rel="noopener">Air Canada’s battery instructions</a> require individual protection against short circuits and keeping battery-powered personal electronic devices and spare cells or batteries in the cabin when a bag goes onto its Sky Check cart. Confirm the rules for your own flights, including any connecting carrier, and keep the relevant items accessible before boarding.</p>

<h2 id="pack-rent">Decide what to bring and what to arrange locally</h2>
<p>Separate equipment ownership from an accepted booking. Before relying on a rental, establish the item, size, fitting, collection location, opening hours, return deadline and what happens if the item does not suit the plan. Ask what instruction is included and what knowledge is expected. A shop’s equipment list does not reserve your size or turn a first use into a suitable independent outing.</p>
<p>A useful comparison includes baggage, collection travel, fitting time, rental duration and the return, not just a headline day rate. Keep missing amounts unknown in the <a href="/trip-cost/">two-plan quote tool</a>. If an item is included in a lesson or activity, count that inclusion once and confirm exactly what it means. The <a href="/ski-day-planner/">ski-day planner</a> can keep equipment and the meeting point ahead of the session.</p>
<p>For your arrival day, choose a plan that still works if a fitting or collection takes longer than expected. Do not make the last useful connection depend on an unconfirmed rental return. Save the provider’s actual instructions with your own plan; this page does not collect personal measurements, health information or packing progress.</p>

<h2 id="pack-base">Check what your room or campsite supplies</h2>
<p>Confirm drying space, laundry, equipment storage and cooking facilities for the actual accommodation category. A kitchenette, microwave nook and full kitchen are different meal plans. The <a href="/book/banff-hotels/">Banff hotel comparison</a>, <a href="/book/canmore-stays/">Canmore stay comparison</a> and <a href="/book/lake-louise-stays/">Lake Louise area stay comparison</a> help form those questions; a property search does not confirm a room’s equipment.</p>
<p>Keep food and scented items under the applicable site rules. Parks’ <a href="${s.camping}" target="_blank" rel="noopener">Bare Campsite Program</a> requires unattended food and scented items in a hard-sided vehicle, trailer or motorhome, or a campground food-storage locker. A tent, open truck bed or other soft-sided shelter is not the storage alternative described by that programme. Check the specific campsite; do not assume every trailhead has a locker.</p>
<p>Give the return trip a packing slot as well: dry or contain wet gear, meet the room checkout and transport luggage limits, and resolve any restricted item before the flight. The bag should serve the journey you have arranged, rather than force another outing or purchase.</p>

<h2 id="pack-searches">Optional category searches, after checking what you own</h2>
<p>The following Amazon Canada category searches are affiliate links; BanffBound may earn a commission from qualifying purchases. They are not a tested product shortlist. Results, sellers, prices and specifications can change, and no fit, stock, performance rating or airline acceptance is verified here. Start with what you already have and the operator’s requirements before comparing another item.</p>
${gearSearches()}
<h2 id="pack-questions">Questions about packing for Banff</h2>
${faqs()}
<h2 id="pack-sources">Sources and review</h2>
<p>Reviewed October 29, 2026 against the linked Town, Parks and CATSA pages. Source guidance supports selected preparation and screening facts, not a personal equipment assessment, current route opening, rental allocation or future carrier approval. Use the source for the day and item you intend to take.</p>
`,
};
export const packingGuideMetadata: Record<string, { title: string; description: string; lastUpdated: string; readTime: string; imageIsIllustrative: true; imageNote: string }> = {
  'banff-packing-list': {"title": "Banff Packing: Choose, Fit & Arrange the Gear for Your Trip", "description": "Choose what to pack, rent or arrange for a Banff trip, with clothing and footwear fit, flight restrictions, a complete day bag and the existing packing checklist.", "lastUpdated": reviewDate, "readTime": "12 min read", "imageIsIllustrative": true, "imageNote": "Illustrative image; not verified as a named route, property, equipment arrangement or current condition."}
};
