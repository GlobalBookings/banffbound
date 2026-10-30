/** Full retained-URL review; original publication remains 2026-02-08. */
export const reviewDate = '2026-10-29';
export const shortStayGuideSources: Record<string, Record<string,string>> = {
  "3-day-banff-itinerary": {
    "lakeAccess": "https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise",
    "roamWinter": "https://roamtransit.com/fares/reservations/winter-reservations/",
    "gondola": "https://www.banffjaspercollection.com/attractions/banff-gondola/",
    "cruise": "https://prod.banffjaspercollection.com/attractions/lake-minnewanka-cruise/location-hours/",
    "caveHours": "https://parks.canada.ca/lhn-nhs/ab/caveandbasin/visit/heures-hours",
    "whyte": "https://www.whyte.org/visit",
    "winterWalking": "https://parks.canada.ca/pn-np/ab/banff/activ/marchehiver-winterwalking/banff",
    "johnston": "https://parks.canada.ca/pn-np/ab/banff/bulletins/06d4ef61-a3c9-4b65-8dfc-66d056252d6c",
    "hotSprings": "https://parks.canada.ca/pn-np/ab/banff/sources-banff-springs",
    "skating": "https://banff.ca/110/Outdoor-Ice-Skating",
    "fees": "https://parks.canada.ca/pn-np/ab/banff/visit/tarifs-fees"
  }
};
export const shortStayGuideFaqs: Record<string,{question:string;answer:string}[]> = {
  "3-day-banff-itinerary": [
    {
      "question": "Is three days enough for a first Banff visit?",
      "answer": "Three usable sightseeing days can support a focused first visit, but three calendar days with flights or an onward journey leave less time. Start with arrival, check-in, departure and the full return from each outing. Choose the priority experience and a flexible local day; remove travel-day attractions rather than trying to complete every template card."
    },
    {
      "question": "Can I visit Lake Louise, hike to Lake Agnes and add Moraine Lake on the same default day?",
      "answer": "Do not treat that combination as the default. A tea-house hike, lakeshore visit and separate lake transfer need different preparation and time. Choose a shoreline visit or one complete hiking objective, then confirm its seasonal access and return. Moraine Lake can replace the day’s main outing when an appropriate seasonal journey is confirmed; it is not a winter extension."
    },
    {
      "question": "Do the winter and summer Trip Builder links make reservations?",
      "answer": "No. They open existing editable planning examples: winter-nonski-3 or first-timer-3. The winter example includes a managed-rink suggestion that depends on an officially open facility; the summer example includes a seasonal cruise suggestion. Remove anything that does not fit the actual dates, party or travel days. Loading a plan confirms no room, ticket, transport or suitable conditions."
    },
    {
      "question": "Can I use Johnston Canyon or the hot springs as an automatic fallback?",
      "answer": "Check the dated official notices first. At the October 29, 2026 review, the Johnston Canyon trail and day-use area including P1 were closed under an order issued October 13, with a scheduled December 11 end. Upper Hot Springs announced closure from October 13 to early November for maintenance. Neither an expected end date nor this itinerary confirms reopening. Cave and Basin is a separate heritage visit, not a bathing substitute."
    },
    {
      "question": "Should I change accommodation every night or add Jasper to a three-day stay?",
      "answer": "Compare the actual purpose and complete journeys first. One base can reduce checkouts, luggage moves and duplicated connections. A Lake Louise-based or multi-base trip may fit a different priority, but it is not the same Banff-town sequence. Jasper and a full Parkway journey need their own planning; remove a major day from this short visit rather than inserting a distant return drive between other commitments."
    }
  ]
};
const esc = (value:string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function renderFaqs(): string {
  const entries = shortStayGuideFaqs['3-day-banff-itinerary'];
  return entries.map(faq => '<details><summary>' + esc(faq.question) + '</summary><p>' + esc(faq.answer) + '</p></details>').join('\n') + '<script type="application/ld+json">' + JSON.stringify({ '@context':'https://schema.org', '@type':'FAQPage', mainEntity:entries.map(faq => ({ '@type':'Question', name:faq.question, acceptedAnswer:{ '@type':'Answer',text:faq.answer } })) }).replace(/</g, '\\u003c') + '</script>';
}
export const shortStayGuideOverrides: Record<string,string> = {
  '3-day-banff-itinerary': `
<p>Three days in Banff can give you a mountain view, time beside a lake and a proper feel for the town. The enjoyable version starts with what you most want to do and leaves space around it. A few good experiences, a comfortable base and a meal you can linger over make a stronger short break than a list of landmarks you only reach in a hurry.</p>
<p><strong>Full guide reviewed October 29, 2026.</strong> This guide has separate winter and summer starting plans, plus a shorter version for arrival and departure days. It keeps the complete journey, seasonal access and bookings visible. The examples are editable ideas, not a timetable or confirmation that an activity operates on your date.</p>
<nav aria-label="Three-day Banff guide sections"><p><a href="#short-time">Count usable days</a> · <a href="#short-base">Choose a base</a> · <a href="#short-overview">See the two plans</a> · <a href="#short-day-one">Town and mountain views</a> · <a href="#short-day-two">One lake outing</a> · <a href="#short-day-three">A final focused day</a> · <a href="#short-winter">Winter changes</a> · <a href="#short-backup">Weather and closures</a> · <a href="#short-book">Book the connected trip</a> · <a href="#short-questions">Questions</a></p></nav>

<h2 id="short-time">Three calendar days are not always three sightseeing days</h2>
<p>Write your actual arrival point, flight or onward departure and accommodation nights first. Include baggage, rental collection or the transfer meeting point, the journey to the room and check-in. On departure, include checkout, bags, the airport journey and any rental return. A flight landing in Calgary does not start a Banff sightseeing morning.</p>
<table><caption>Choose the version that fits your actual travel</caption><thead><tr><th scope="col">Time available</th><th scope="col">A useful shape</th><th scope="col">What to remove</th></tr></thead><tbody>
<tr><th scope="row">Arrival afternoon, one full day, departure morning</th><td>Settle into town, use the full day for your main objective, then leave comfortably.</td><td>The extra mountain session and third-day excursion.</td></tr>
<tr><th scope="row">Three full days between travel days</th><td>Town and one attraction, one lake day, then one chosen outing or slower local day.</td><td>Any card that conflicts with weather, access or the party.</td></tr>
<tr><th scope="row">A late flight or early onward connection</th><td>Put the connection first and choose a meal or short local visit only if it fits.</td><td>A distant lake, long hike or timed cruise on the travel day.</td></tr>
</tbody></table>
<p>Use the <a href="/calgary-to-banff/">airport journey guide</a> to join the outward and return legs. A pre-booked hotel or attraction cannot protect a separate flight connection. If you have more time, the <a href="/blog/7-day-banff-itinerary/">winter and summer week plan</a> gives the additional outings their own days instead of squeezing them into this break.</p>

<h2 id="short-base">Choose the room around the mornings that matter</h2>
<p>The examples below start from a <strong>Banff town base</strong>. Compare the actual hotel entrance, meal options, room layout and route to your transport stop. A central room and a hillside suite create different luggage and evening journeys. Confirm the category, occupancy, beds, cooking facilities, accessibility needs and any required fees in the offer you intend to buy.</p>
<p>Use the <a href="/book/banff-hotels/">Banff hotel location and room comparison</a> for native property booking links, or the <a href="/winter-stays/">winter stay finder</a> for room and arrival questions. If your main objective is around Lake Louise, compare <a href="/book/lake-louise-stays/">Lake Louise village, lakeshore and other area stays</a> before choosing. Those locations and the ski resort are separate places. Canmore is another town base, with an extra regional journey for Banff activities; the <a href="/blog/where-to-stay-in-banff/">base comparison</a> explains the tradeoffs.</p>
<p>For a short break, one base often simplifies bags and checkouts. A split stay can still be worthwhile when the second place is part of the holiday itself. Count the moving day honestly rather than assuming a different room gives you a free extra sightseeing day.</p>

<h2 id="short-overview">Open a winter or summer starting plan</h2>
<p>Choose the example closest to your trip, then remove or rearrange outings in <a href="/trip-builder/">Trip Builder</a>. It lets you change the base and transport, reorder days and keep the plan’s actual choices visible. Neither opening a template nor a suggested duration books anything or evaluates present conditions.</p>
<table><caption>Existing three-day examples — revise every card against your dates</caption><thead><tr><th scope="col">Starting plan</th><th scope="col">Suggested sequence</th><th scope="col">The important revision</th></tr></thead><tbody>
<tr><th scope="row"><a href="/trip-builder/?template=winter-nonski-3">Open the slower winter weekend</a></th><td>Town and culture; Lake Louise; a managed-rink idea and dinner.</td><td>Use a rink only when its current official status and session fit. Replace it with town time when unavailable.</td></tr>
<tr><th scope="row"><a href="/trip-builder/?template=first-timer-3">Open the first summer weekend</a></th><td>Town and gondola; Lake Louise; a seasonal Minnewanka cruise and dinner.</td><td>The cruise needs an operating departure and a separate complete journey. Remove the gondola if the first day is mostly travel.</td></tr>
</tbody></table>
<p>Start with the season that fits, then adapt the example to your group. If you arrive late or leave early, delete those travel-day activities. For a first snow-sport visit, replace a whole day with the <a href="/learn-to-ski/#lesson-fit">appropriate ski or snowboard lesson</a>, then use the <a href="/ski-day-planner/">ski-day planner</a> for fitting, check-in and return. A lesson is not an extra before a lake excursion.</p>

<h2 id="short-day-one">Day 1: get comfortable in town, then choose one mountain visit</h2>
<p>Find your room or arrange luggage storage, have a meal and locate the next departure point. Start with a short town outing that fits the group and conditions. <a href="/towns/banff/">Banff’s town guide</a> helps put the centre, Spray Avenue and other areas in context. Bow Falls, Surprise Corner and a riverside walk are choices to assess individually, not a compulsory walking circuit.</p>
<p>If you have a full usable day and want summit sightseeing, the <a href="https://www.banffjaspercollection.com/attractions/banff-gondola/" target="_blank" rel="noopener">Banff Gondola operator page</a> describes the Sulphur Mountain attraction, including indoor interpretation and a theatre. The <a href="/blog/banff-gondola-guide/">gondola planning guide</a> separates the base journey, ticket and outdoor summit areas. Confirm the actual operation, check-in and return before buying a time-specific product.</p>
<p>Visibility, wind, snow and outdoor footing can change the experience. A gondola ticket does not establish that every boardwalk is suitable for your party, and summit dining needs its own product and terms. Have dinner near the room or useful return stop; the <a href="/eat-and-drink/#dining-finder">dining finder</a> can help you choose the type of meal and address without adding another cross-town commitment.</p>

<h2 id="short-day-two">Day 2: let one lake outing be the main event</h2>
<p><strong>Winter:</strong> plan a Lake Louise lakeshore visit from permitted land-based areas, with warm clothing, food and the complete return. <a href="https://roamtransit.com/fares/reservations/winter-reservations/" target="_blank" rel="noopener">Roam’s fall and winter reservation page</a> distinguishes village and lakeshore travel and states that its winter tickets do not include Moraine Lake. Confirm the actual stop and return for your booking. A frozen-looking lake is not a route approval; do not add an unassessed ice crossing or a summer tea-house hike.</p>
<p><strong>Summer:</strong> choose shoreline time or one complete hiking objective, then arrange access through the <a href="/shuttle-reservations/">lake transport comparison</a>. <a href="https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise" target="_blank" rel="noopener">Parks Canada’s access page</a> says Moraine Lake Road is closed to personal vehicles year-round, with specified authorized exceptions. Ordinary Parks shuttle journeys start at the ski-resort Park and Ride; Alpine Start is a different product. The published <strong>2026 Parks lake-shuttle season ended October 12</strong>. Recheck the actual future service before planning around it.</p>
<p><strong>Choose Moraine Lake as a replacement main outing when a suitable seasonal journey is confirmed.</strong> Do not automatically combine Lake Agnes, another lake transfer and a canoe rental. Each adds a separate objective, equipment or booking. The <a href="/towns/lake-louise/">Lake Louise area guide</a> helps distinguish the village, lakeshore and resort; your room location and first boarding point still need to join up.</p>
<p>Choose the return before extending the outing, including any connector and the final walk from the stop. Keep a meal, a warm break and a different local day available. A lakeshore visit can be the complete experience; there is no need to add an upper trail because other people in a photograph reached it.</p>

<h2 id="short-day-three">Day 3: pick the experience you still want, with room to leave</h2>
<p>If this is a full summer day, a separately booked <a href="https://prod.banffjaspercollection.com/attractions/lake-minnewanka-cruise/location-hours/" target="_blank" rel="noopener">Lake Minnewanka Cruise departure</a> can be its main objective. The operator’s location page lists seasonal operating information and a separate walk to the dock check-in. At this review its ticket office, snack shop and boat-rental sections said closed for the 2026 season. A template’s cruise card is not a year-round service or a promise of seats; confirm your exact product, boarding needs and return.</p>
<p>For winter, the example’s <a href="https://banff.ca/110/Outdoor-Ice-Skating" target="_blank" rel="noopener">Town-managed rink suggestion</a> needs an officially open facility, session and any rentals. The Town warns that outdoor rinks can close in warm spells or heavy snow and says not to walk or skate on the Bow River. This plan does not direct you onto natural lake or river ice. If a rink session does not fit, a relaxed town meal and suitable cultural visit are complete alternatives.</p>
<p>A different main day can work better: one lesson, a reviewed winter experience or a <a href="/towns/canmore/">Canmore town visit</a> with its own outward and return journey. Remove the original third-day card before adding it. Do not insert a Jasper return drive or a full <a href="/icefields-parkway-planner/">Icefields Parkway outing</a> between these commitments. If you are leaving, give checkout, bags and the onward connection the day they need.</p>

<h2 id="short-winter">Winter changes the sequence, equipment and alternatives</h2>
<p>Use <a href="https://parks.canada.ca/pn-np/ab/banff/activ/marchehiver-winterwalking/banff" target="_blank" rel="noopener">Parks Canada’s designated winter walking guidance</a> and current reports for the actual route. Conditions can make a short town-area walk difficult. Plan for the least experienced person, daylight, clothing, food and the return; a summer grade or traction rental cannot make that decision. The <a href="/packing-list/">activity packing checklist</a> and <a href="/blog/banff-mobile-connectivity/">offline preparation guide</a> help prepare the chosen outing.</p>
<p>Keep a booked ski day or guided excursion focused on its product. Confirm age or other participant conditions, equipment, meeting time, transfer inclusions and return. Non-participants need their own suitable day. Use the <a href="/book/banff-winter-activities/">reviewed winter activity comparison</a> to distinguish a guided icewalk, a summit attraction and a regional road tour before opening the provider’s offer.</p>

<h2 id="short-backup">Keep a useful alternative and read the closure notice</h2>
<p>At the October 29 review, <a href="https://parks.canada.ca/pn-np/ab/banff/bulletins/06d4ef61-a3c9-4b65-8dfc-66d056252d6c" target="_blank" rel="noopener">Johnston Canyon’s trail and day-use area, including P1, were closed under an October 13 order with a scheduled December 11, 2026 end</a>. That is not confirmed reopening. Do not substitute an unfamiliar approach or describe the canyon as an outing for every fitness level. The <a href="https://parks.canada.ca/pn-np/ab/banff/sources-banff-springs" target="_blank" rel="noopener">official Upper Hot Springs page</a> also announced closure from October 13 to early November for maintenance. A planned soak needs a fresh operating check.</p>
<p>For culture, <a href="https://www.whyte.org/visit" target="_blank" rel="noopener">The Whyte at 111 Bear Street</a> publishes current admission, regular opening and holiday exceptions. <a href="https://parks.canada.ca/lhn-nhs/ab/caveandbasin/visit/heures-hours" target="_blank" rel="noopener">Cave and Basin’s hours</a> distinguish October 16–May 14 Thursday-to-Monday opening and additional closure blocks. It is a separate heritage visit, not hot-springs bathing. Check the actual date and the indoor/outdoor portions that fit your party.</p>
<p>The <a href="/blog/rainy-day-banff/">rain and snow alternatives guide</a> gives these different formats space. Read <a href="/conditions/">dated weather and road sources</a>, official notices and the operator’s instructions before swapping. Cancel or change dependent bookings according to their own terms rather than assuming a weather change refunds the whole trip.</p>

<h2 id="short-book">Book a connected trip, then leave the spare space spare</h2>
<ol><li><strong>Fix the real people, nights and travel windows.</strong> Check the actual room, luggage and any child, mobility or pet arrangements.</li><li><strong>Choose the priority experience.</strong> Confirm its dated access and product before adding optional attractions.</li><li><strong>Join the full return.</strong> Include check-in, stops, final walking legs and any transfer change.</li><li><strong>Compare complete quotes.</strong> Use the <a href="/trip-cost/">trip-cost planner</a> for the same party and dates, with missing costs left unknown.</li><li><strong>Check admission separately.</strong> Consult <a href="https://parks.canada.ca/pn-np/ab/banff/visit/tarifs-fees" target="_blank" rel="noopener">current Parks fees</a> and the <a href="/park-pass/">admission planner</a>; a room, transport ticket and attraction booking cover different things.</li></ol>
<p>The owned hotel and winter-activity comparisons above provide native affiliate links and explain the choices before checkout. BanffBound may earn a commission if you book through those links. Compare each offer’s final total and cancellation terms rather than a generic three-day price. Use the <a href="/blog/banff-first-time-tips/#first-visit-planner">six-step first-visit checklist</a> to revisit the remaining questions, then enjoy the room you deliberately left in the plan.</p>
<h2 id="short-questions">Three-day Banff questions</h2>
${renderFaqs()}
<h2 id="short-sources">Sources and review</h2>
<p><strong>Full guide reviewed October 29, 2026.</strong> Parks Canada supplies access, closure, seasonal walking and admission information; the Town and named operators describe their own facilities and products. The sequence is editorial planning, not a live reservation, transport, weather or suitability service. Original publication is preserved. The hero is illustrative, not verified as a named destination, season or current condition.</p>
`
};
export const shortStayGuideMetadata = {
  "3-day-banff-itinerary": {
    "title": "3 Days in Banff: Winter & Summer Plans, Travel Days and Bookings",
    "description": "Build a realistic three-day Banff visit with winter and summer plans, editable Trip Builder examples, one main outing, seasonal access and connected hotel bookings.",
    "lastUpdated": "2026-10-29",
    "readTime": "12 min read",
    "imageIsIllustrative": true,
    "imageNote": "Illustrative image; not verified as a named Banff destination, trip season or current condition."
  }
} as const;
