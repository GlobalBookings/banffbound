/** Full reviews of two retained canonical URLs; original publication dates stay intact. */
export const reviewDate = '2026-10-29';
const sources = {
  fall: 'https://www.banfflakelouise.com/fall',
  hiking: 'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
  reports: 'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking/etat-sentiers-trail-conditions',
  bulletins: 'https://parks.canada.ca/pn-np/ab/banff/bulletins',
  lakeAccess: 'https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise',
  sunshine: 'https://www.skibanff.com/sunshinemeadows',
  weather: 'https://parks.canada.ca/pn-np/ab/banff/securite-safety/meteo-weather',
  roam: 'https://roamtransit.com/schedules-routes/lake-louise-banff-express-route-8x/',
  roamSeason: 'https://roamtransit.com/fares/reservations/winter-reservations/',
  whyte: 'https://www.whyte.org/',
  cave: 'https://parks.canada.ca/lhn-nhs/ab/caveandbasin',
  springs: 'https://parks.canada.ca/pn-np/ab/banff/sources-banff-springs',
  canyon: 'https://parks.canada.ca/pn-np/ab/banff/bulletins/06d4ef61-a3c9-4b65-8dfc-66d056252d6c',
};

export const fallSeasonGuideFaqs: Record<string, { question: string; answer: string }[]> = {
  'fall-larch-season-banff': [
    { question: 'When should I plan a Banff larch trip?', answer: 'Banff & Lake Louise Tourism describes a typical late-September to early-October colour window. That is broad seasonal context, not a peak-date forecast for a particular year or trail. Book a trip you can enjoy if colour, cloud or snow differs from the photograph you hoped for, and check current access and conditions near departure.' },
    { question: 'Do I need to climb Sentinel Pass to visit Larch Valley?', answer: 'No. Larch Valley / Minnestimma Lakes is a separate published endpoint. Sentinel Pass continues higher and has its own Difficult profile. Choose the endpoint, demands and complete return before leaving, rather than treating the upper pass as a compulsory finish to see larches.' },
    { question: 'Is a group of four always a special larch-season requirement?', answer: 'Parks Canada’s general trail guidance recommends tight groups of four or more. Specific mandatory restrictions come from current orders and posted notices for the actual route. Read those separately; an old seasonal article or a generic tour listing does not establish the rule or confirm that a particular party meets it.' },
    { question: 'Can I drive to Moraine Lake or use any Lake Louise bus?', answer: 'Moraine Lake Road is closed to personal vehicles year-round, with specified authorized access exceptions. Arrange the actual seasonal service, check-in and return. A Lake Louise lakeshore bus is a different journey from a Parks shuttle departing the ski-resort Park and Ride, and neither establishes a future Moraine Lake seat.' },
    { question: 'Does snow make these larch routes winter walks?', answer: 'No. These comparisons use summer hiking profiles. Parks advises against mid-October to mid-June travel on the listed Lake Louise-area routes because of avalanche exposure. Healy Pass also needs its own snow-season assessment. A shorter route, microspikes or a clear road does not approve a snowy mountain outing.' },
  ],
  'banff-in-fall': [
    { question: 'Is September or October the best time for a Banff fall trip?', answer: 'Choose around the purpose and the actual services. A colour-focused mountain trip, a lakeshore visit and a town-based October break need different plans. Check seasonal transport and activities for the dates you have. No single week guarantees larches, stable weather, open trails or an uncrowded visit.' },
    { question: 'Can I visit Lake Louise after the summer shuttles finish?', answer: 'Lake Louise and Moraine Lake have different access. Roam publishes year-round Banff–Lake Louise service and separate fall/winter reservation information. Check the actual stops, product and return; the late-season Lake Louise journey does not supply Moraine Lake access or a transfer to the ski-resort Park and Ride.' },
    { question: 'Are fall hotels always cheaper than summer?', answer: 'No fixed seasonal saving is established. Compare current totals for the same dates, party, room and booking terms, then include transport, meals, admission and activities. The trip-cost tool uses your own CAD quotes and keeps missing costs unknown; a low room quote alone is not the cost of the whole holiday.' },
    { question: 'Can I count on a hot-springs soak as a late-fall backup?', answer: 'Check the current operating notice first. At the October 29, 2026 review, Banff Upper Hot Springs listed maintenance closure from October 13 to early November, with reopening unconfirmed here. Cave and Basin is a separate heritage visit. Confirm its hours and access, or choose another cultural visit and meal that fit the date.' },
    { question: 'Does an October visit include winter resort activities?', answer: 'A fall hotel booking does not establish an operating ski resort, rental, lesson or winter attraction. Check the specific operator’s season and actual product. If snow changes an autumn hike, choose another suitable outing rather than assuming a winter sport or a snowy summer trail is ready to use.' },
  ],
};
const esc = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function renderFaqs(slug: string): string {
  const faqs = fallSeasonGuideFaqs[slug];
  const schema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) };
  return faqs.map(faq => `<details><summary>${esc(faq.question)}</summary><p>${esc(faq.answer)}</p></details>`).join('\n') + `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`;
}

export const fallSeasonGuideOverrides: Record<string, string> = {
  'fall-larch-season-banff': `
<p>A larch trip works best when the whole outing matters: the forest, the mountain setting and time together, as well as golden needles. Start with a route your group wants to walk, then connect the seasonal transport, conditions and return. Colour is one part of the plan, rather than a condition a reservation can deliver.</p>
<p><strong>Full guide reviewed October 29, 2026.</strong> This guide helps with timing and preparation. The <a href="/larch-season/">larch route planner</a> compares five reviewed summer profiles by starting area and published return estimate. For the wider choice of September or October bases and activities, use <a href="/blog/banff-in-fall/">the fall travel guide</a>.</p>
<nav aria-label="Larch trip guide sections"><p><a href="#larch-timing">Timing</a> · <a href="#larch-objective">Choose the endpoint</a> · <a href="#larch-arrival">Arrival and return</a> · <a href="#larch-snow">Snow and route limits</a> · <a href="#larch-group">Group preparation</a> · <a href="#larch-photography">Photography</a> · <a href="#larch-booking">Bookings</a> · <a href="#larch-questions">Questions</a></p></nav>

<h2 id="larch-timing">Use a broad colour window, then look at the actual trip</h2>
<p>Larches change colour and shed their needles, unlike the evergreens around them. <a href="${sources.fall}" target="_blank" rel="noopener">Banff &amp; Lake Louise Tourism</a> describes the typical display from <strong>late September into early October</strong>. It does not establish one peak day for every elevation, aspect or year. This guide contains no live foliage feed, historical peak chart or year-specific forecast.</p>
<p>Choose travel dates that also suit the party’s availability and the activities you value if colour is patchy or gone. If hiking is the main reason to travel, investigate transport and route demands before choosing a room. If you mainly want a scenic autumn break, allow a town or lakeshore day to be worthwhile without a high pass.</p>
<p>Close to departure, read the <a href="${sources.reports}" target="_blank" rel="noopener">official trail report</a> and note the observation date, not just the route name or summer grade. A picture from another week can help you understand a landscape but does not establish today’s colour, surface or access.</p>

<h2 id="larch-objective">Choose an endpoint, not a list of interchangeable hikes</h2>
<table><caption>Three decisions that change a larch outing</caption><thead><tr><th scope="col">Choice</th><th scope="col">What changes</th><th scope="col">Useful next step</th></tr></thead><tbody>
<tr><th scope="row">Larch Valley or Sentinel Pass</th><td>The valley/lakes endpoint and the higher pass have separate published profiles. The upper pass adds demands; it is not a compulsory extension.</td><td>Compare <a href="/trails/larch-valley-minnestimma-lakes/">Larch Valley / Minnestimma Lakes</a> with <a href="/trails/sentinel-pass-via-larch-valley/">Sentinel Pass</a>.</td></tr>
<tr><th scope="row">A shorter published estimate</th><td>A shorter return estimate does not mean easy terrain. Saddleback is graded Difficult.</td><td>Read the complete <a href="/trails/saddleback-pass/">Saddleback profile</a> and its lakeshore starting point.</td></tr>
<tr><th scope="row">A different starting area</th><td>Taylor Lake and Healy Pass create separate highway/base-area journeys; they are not quieter or easier equivalents of a Moraine Lake hike.</td><td>Use the <a href="/larch-season/#larch-planner">planner’s starting-area filter</a> and the route’s full source checks.</td></tr>
</tbody></table>
<p>For figures, grades and endpoints, read the <a href="${sources.hiking}" target="_blank" rel="noopener">Parks Canada profiles</a> linked through each reviewed trail. Avoid adding a full Sentinel distance to a full Larch Valley distance: the pass profile already includes its approach. Choose the complete return for the least experienced member, including the descent, before adding another stop.</p>
<p><strong>Healy Pass is not reached by shortening its hiking profile with the Sunshine gondola.</strong> Its reviewed route begins at Sunshine’s lower base, while Sunshine Meadows is a separate lift-served network. At this review, the <a href="${sources.sunshine}" target="_blank" rel="noopener">operator marked Meadows closed for summer 2026</a> and published <strong>June 25–September 19, 2027</strong> as future summer dates. Confirm the actual product; a late-September colour trip does not establish gondola access.</p>

<h2 id="larch-arrival">Resolve the starting point and the last useful return</h2>
<p>Moraine Lake, Lake Louise lakeshore, the village and the ski-resort Park and Ride are different places. Under <a href="${sources.lakeAccess}" target="_blank" rel="noopener">Parks’ lake-access rules</a>, Moraine Lake Road is closed to personal vehicles year-round, with specified authorized exceptions. Confirm which service and check-in applies to your party, then the journey from your accommodation to that departure.</p>
<p><strong>The published 2026 Parks lake-shuttle season ended October 12.</strong> Recheck the actual future season and reservation instructions; do not copy that date into another year. A transport ticket can establish its stated journey without establishing a suitable mountain hike or a spare seat at a different stop.</p>
<ol><li><strong>Choose the route and start.</strong> Read the whole profile, current report and any restriction.</li><li><strong>Join the outward legs.</strong> Include reaching the departure point, check-in and getting from the drop-off to the trail.</li><li><strong>Work back from the return.</strong> Account for the walk down, waiting and the final accommodation connection. Set a turnaround plan with room for a slower party or changed conditions.</li><li><strong>Choose a different day when needed.</strong> A paid room or ticket does not require completing a mountain objective.</li></ol>
<p>Use <a href="/shuttle-reservations/">lake transport planning</a> and <a href="/car-free-banff/">the car-free guide</a>. If driving to another starting area, use designated parking and check the actual road leg. This guide supplies no occupancy prediction or arrival clock that guarantees a space.</p>

<h2 id="larch-snow">A colour window does not approve a snowy summer route</h2>
<p>The Lake Louise-area routes in this comparison carry Parks’ avalanche warning against travel from <strong>mid-October to mid-June</strong>. Healy Pass needs its own snow-season assessment. The <a href="/larch-season/?larch_season=snow#larch-planner">snow-season setting</a> changes preparation notes; it does not turn the summer profiles into winter recommendations.</p>
<p>Check conditions, weather and the <a href="${sources.bulletins}" target="_blank" rel="noopener">current park notices</a>. A clean highway, a summer route marker, another person’s tracks or traction devices do not assess a snow slope. If the planned hike no longer fits, choose a different kind of outing from <a href="/what-to-do-today/">the day-choice tool</a>, rather than moving to another alpine trail on the assumption it is safer.</p>

<h2 id="larch-group">Prepare the group and the whole day’s kit</h2>
<p>Parks’ trail-report guidance recommends travelling in tight groups of four or more. A specific mandatory group order, when posted, has its own area and conditions. Read the actual notice for the route; do not infer a special rule for every larch trail from an old article. If booking a guide, confirm the route, party arrangements, skills expected and what changes if the objective is unavailable.</p>
<p>Carry appropriate footwear, warm and weatherproof layers, gloves, a hat, food, water, navigation, a headlamp and emergency supplies for the outing. Resolve bear-spray carriage and use before leaving. The <a href="/packing-list/?season=summer&amp;activities=hiking">hiking packing checklist</a> can organise equipment; its summer label does not establish summer conditions in autumn.</p>
<p>Plan for the least experienced member and discuss everyone’s pace, recent hiking experience and assistance needs before choosing the route. Stay together and tell a reliable person the plan and expected return. A faster walker, guide or emergency device does not make it sensible to separate the group or continue beyond the agreed objective.</p>

<h2 id="larch-photography">Keep photography inside the outing you can complete</h2>
<p>Look for compositions from the designated trail or viewpoint: a small branch, the contrast with darker forest or a wider mountain scene can all tell the story. Work with the light and weather you find. There is no fixed morning clock that makes every grove photogenic or makes an early departure suitable for every transport plan.</p>
<p>Keep paths and boarding areas clear when stopping. Protect vegetation, give wildlife space and keep the return plan ahead of one more photograph. Use <a href="/photo-spots/">photo-location planning</a> for other subjects; sunset or stars are separate outings requiring their own access and journey checks.</p>

<h2 id="larch-booking">Book the complete trip and preserve another kind of day</h2>
<p>Compare accommodation and transport together. A room close to the wrong departure point may not simplify the outing. Use <a href="/towns/lake-louise/">Lake Louise base planning</a> and <a href="/book/lake-louise-stays/">the reviewed stay comparison</a> to distinguish village, lakeshore and wider road locations.</p>
<p>The <a href="/trip-cost/">trip-cost calculator</a> can compare your own room, transport, food and activity quotes in CAD. Leave unknown amounts visibly unknown and check the cancellation terms of each dependent booking. Neither a quoted room nor a published colour window guarantees the outing.</p>
<p>The retained <a href="https://www.getyourguide.com/banff-l284/?partner_id=QW960HO" target="_blank" rel="noopener sponsored">GetYourGuide Banff activity search</a> is an affiliate link; BanffBound may earn a commission. These are search results, not a verified larch tour or a reservation. Check the actual operator, route, date, transport, group rules and terms on the selected listing.</p>

<h2 id="larch-questions">Larch trip questions</h2>
${renderFaqs('fall-larch-season-banff')}
<h2 id="larch-sources">Sources and review</h2><p><strong>Full guide reviewed October 29, 2026.</strong> Tourism’s broad colour window, Parks’ route/access/report guidance and Sunshine’s dated summer information inform this guide. Current reports and actual confirmations remain separate. The hero image is illustrative and is not verified as a named grove, route, season or present colour.</p>
`,

  'banff-in-fall': `
<p>A September or October trip to Banff can be built around mountain time, a lakeshore visit, art and history, meals or a slower stay in town. Choose the experience first, then check which journeys and seasonal services fit your actual dates. A fall booking does not need to deliver peak larches to be a worthwhile holiday.</p>
<p><strong>Full guide reviewed October 29, 2026.</strong> This is a guide to the wider fall trip. Use the separate <a href="/blog/fall-larch-season-banff/">larch timing and preparation guide</a> for a colour-focused outing, or the <a href="/blog/fall-banff-itinerary/">reviewed three-day fall itinerary</a> for a possible sequence. Keep the choice of base, transport and return at the centre of either plan.</p>
<nav aria-label="Banff fall guide sections"><p><a href="#fall-dates">Choose the part of fall</a> · <a href="#fall-base">Choose a base</a> · <a href="#fall-journey">Plan the journeys</a> · <a href="#fall-days">Three kinds of day</a> · <a href="#fall-weather">Weather and daylight</a> · <a href="#fall-notices">Current seasonal notices</a> · <a href="#fall-budget">Compare the budget</a> · <a href="#fall-questions">Questions</a></p></nav>

<h2 id="fall-dates">Choose the part of fall for the trip you want</h2>
<p>The <a href="${sources.fall}" target="_blank" rel="noopener">destination’s fall overview</a> treats September and October as the autumn travel period. Its typical larch window is late September into early October; that does not make every week a colour trip. Instead of choosing an “absolute best” week, identify the one or two experiences that matter most and check their actual access.</p>
<table><caption>Different planning priorities within September and October</caption><thead><tr><th scope="col">Your priority</th><th scope="col">Check before choosing dates</th><th scope="col">Keep flexibility for</th></tr></thead><tbody>
<tr><th scope="row">A hiking-led September trip</th><td>The specific route, current surface, whole-party demands and seasonal transport.</td><td>A different outing if snow, a restriction or the group’s pace changes the objective.</td></tr>
<tr><th scope="row">A colour-focused break</th><td>The broad window, the trailhead and a trip that works without a peak display.</td><td>Cloud, patchy colour and an enjoyable town or lakeshore day.</td></tr>
<tr><th scope="row">An early-October lake visit</th><td>The actual dated transport and attraction season, plus the return.</td><td>Separate availability for rental craft, restaurants and other activities.</td></tr>
<tr><th scope="row">A later-October stay</th><td>Town-based options, operating days and current fall/winter transport.</td><td>Snow, shorter daylight and summer services already finished for the year.</td></tr>
</tbody></table>
<p>A longer stay can leave room to move an outdoor day, but it does not reserve better weather. Avoid building every day around one narrow seasonal outcome. A cultural visit, a relaxed meal and a comfortable base can be primary reasons to travel.</p>

<h2 id="fall-base">Choose a base by the whole journey</h2>
<p><a href="/towns/banff/">Banff town</a> keeps town dining, shops and local transit within the same part of the trip. Match the actual hotel address to the walks and stops you intend to use; a town label does not establish an easy walk from every property.</p>
<p><a href="/towns/lake-louise/">Lake Louise</a> needs a location choice within the location: village, lakeshore and ski-resort addresses are separate. A lakeshore room solves a different stay from a village room near the onward road journey. Compare the <a href="/book/lake-louise-stays/">reviewed Lake Louise stay options</a> using the actual room category and dates.</p>
<p><a href="/towns/canmore/">Canmore</a> adds its own town and accommodation choices, plus a regional connection for Banff activities. Include that connection and the final return before comparing its room quote with a Banff hotel. The <a href="/book/banff-hotels/">Banff hotel comparison</a> and <a href="/winter-stays/">base-planning guide</a> help make these tradeoffs explicit.</p>
<p>For a couple, group or family, resolve the room layout, cooking plans, stairs or access needs, parking and cancellation terms. Confirm any hotel pool or spa access separately. There is no fixed autumn hotel discount or quieter-base guarantee established here.</p>

<h2 id="fall-journey">Separate the lake journey from the transport season</h2>
<p><strong>Parks Canada’s published 2026 lake shuttles ended October 12.</strong> The <a href="${sources.lakeAccess}" target="_blank" rel="noopener">official access page</a> also restricts personal vehicles on Moraine Lake Road year-round, with specified authorized exceptions. Check the next published season and actual service; a future hotel booking does not provide a Moraine Lake transfer.</p>
<p>For Lake Louise, <a href="${sources.roam}" target="_blank" rel="noopener">Roam Route 8X</a> is a separate Banff–Lake Louise service. Use the operator’s <a href="${sources.roamSeason}" target="_blank" rel="noopener">2026/27 fall and winter reservation information</a> and dated timetable, rather than an old summer product. Confirm both directions and the actual stop. Its Lake Louise trip is not a ride to the ski-resort Park and Ride and does not include later-fall Moraine Lake access.</p>
<p>Plan the final legs too: hotel to stop, stop to the chosen destination and the return after the outing. A timed dinner or another booking does not move you ahead of an unreserved bus queue. The <a href="/car-free-banff/">car-free guide</a> and <a href="/parking/">parking and transport tool</a> help identify these questions.</p>
<p>If driving, check your actual route, forecast, vehicle equipment and <a href="/conditions/">dated road-source handoffs</a>. A sightseeing drive needs fuel, permitted stops and the complete return. Use the <a href="/icefields-parkway-planner/">Icefields Parkway planner</a> for that distinct road journey; a scenic label supplies no fixed completion time or open-road guarantee.</p>

<h2 id="fall-days">Three useful kinds of fall day</h2>
<h3>A mountain day with one chosen objective</h3>
<p>Use <a href="/larch-season/">the larch route comparison</a> if the main outing is a hike. Choose its start and endpoint, then check access, the group and the return. Keep a second alpine route out of the automatic backup slot: different terrain can have different conditions and demands. A lakeshore visit and a high pass are different plans.</p>
<h3>A town day for art, history and food</h3>
<p>The <a href="${sources.whyte}" target="_blank" rel="noopener">Whyte Museum</a> publishes current exhibitions and programmes, while <a href="${sources.cave}" target="_blank" rel="noopener">Cave and Basin</a> offers a heritage visit with exhibits and films. Confirm the actual opening days, ticket or event and the journey; an outdoor site visit can still involve cold or slippery surfaces.</p>
<p>Choose a meal through the <a href="/eat-and-drink/">sourced dining directory</a>, and use <a href="/blog/banff-live-music/">dated music and performance planning</a> for an evening. A table, show ticket and return bus are separate arrangements. Keeping those together can make a complete day without an alpine walk or a promise of indoor space everywhere.</p>
<h3>A viewing day with time to pause</h3>
<p>A permitted viewpoint, a suitable lakeshore visit and a meal can fit a slower trip. The <a href="/photo-spots/">photo-location guide</a> helps choose subjects and access; plan for the actual light rather than a guaranteed sunset or stars. Use the <a href="/wildlife/">wildlife guide</a> for observation practices. Stay at designated places, give animals space and avoid making a road stop depend on a sighting.</p>

<h2 id="fall-weather">Use current weather and daylight to shape the day</h2>
<p><a href="${sources.weather}" target="_blank" rel="noopener">Parks Canada’s weather information</a> explains how mountain conditions can differ between nearby places and change during the day. Historical averages do not describe your travel week or a high trail. Read a location-specific forecast and the <a href="${sources.reports}" target="_blank" rel="noopener">trail report</a> close to departure.</p>
<p>Shortening autumn daylight makes the whole return important. Choose the start and turnaround from the route, party, forecast and actual transport; there is no universal mid-morning start that ensures a daylight finish. Carry a headlamp and emergency supplies instead of using the sunset time as the only margin.</p>
<p>Pack adjustable warm and weatherproof layers, footwear for the outing, gloves, food and water. Use <a href="/packing-list/">the packing checklist</a> for the activity, then check the specific conditions. A coat or traction device does not make a snow-covered summer hike suitable. For later-season alternatives, <a href="/winter/">winter planning</a> separates available kinds of outing from current operating or terrain approval.</p>

<h2 id="fall-notices">Read seasonal notices before choosing the backup</h2>
<p><strong>Checked October 29, 2026:</strong> <a href="${sources.springs}" target="_blank" rel="noopener">Banff Upper Hot Springs</a> listed maintenance closure from October 13 to early November. That estimated window does not confirm reopening. Use the <a href="/wellness/">warm-up guide</a> to compare other cultural or separately booked options; Cave and Basin is a heritage site, not a substitute hot-pool booking.</p>
<p>The <a href="${sources.canyon}" target="_blank" rel="noopener">Johnston Canyon trail/day-use and P1 closure</a> began October 13, with a scheduled December 11, 2026 end. Reopening remains unconfirmed here. Check the <a href="${sources.bulletins}" target="_blank" rel="noopener">current notices</a> rather than treating the canyon as an always-open bad-weather fallback.</p>
<p>The <a href="${sources.sunshine}" target="_blank" rel="noopener">Sunshine Meadows operator</a> marked summer 2026 closed and published June 25–September 19, 2027 as future dates. Each attraction, rental, restaurant and winter resort has its own season; a general destination calendar cannot confirm all of them.</p>

<h2 id="fall-budget">Compare the whole holiday using current quotes</h2>
<p>Use the <a href="/trip-cost/">trip-cost calculator</a> to separate travel days, accommodation nights, people and rooms. Compare the same party, dates, currency and coverage. Add meals, admission, activities, transfers, local transport and any vehicle costs before judging the room total.</p>
<p>Check which costs a package already includes and the change/cancellation terms. Leave unknown rows unknown; neither an advertised room rate nor an empty entry proves a low-cost trip. You can compare different bases or a paid activity against a simpler day without inventing a market-average budget.</p>
<p>The retained <a href="https://www.expedia.ca/Hotel-Search?destination=Banff%2C+Alberta&camref=1101l3MtWX" target="_blank" rel="noopener sponsored">Expedia Banff accommodation search</a> is an affiliate link; BanffBound may earn a commission. It opens current search results rather than an article-guaranteed rate, room or saving. No fixed seasonal discount is established by this guide.</p>

<h2 id="fall-questions">Banff fall-trip questions</h2>
${renderFaqs('banff-in-fall')}
<h2 id="fall-sources">Sources and review</h2><p><strong>Full guide reviewed October 29, 2026.</strong> Linked Parks, Roam, destination and venue sources support seasonal journeys and the dated notices. The suggestions are planning choices, not live availability, a crowd measurement, weather forecast or price promise. The hero image is illustrative and is not verified as a named Banff location, season or present conditions.</p>
`,
};

export const fallSeasonGuideMetadata: Record<string, { title: string; description: string; lastUpdated: string; readTime: string; imageIsIllustrative: true; imageNote: string }> = {
  'fall-larch-season-banff': { title: 'Banff Larch Season: Timing, Trail Choices & Trip Preparation', description: 'Plan a larch-focused trip around a variable colour window, distinct trail endpoints, seasonal lake transport, group preparation, snow limits and the complete return.', lastUpdated: reviewDate, readTime: '10 min read', imageIsIllustrative: true, imageNote: 'Illustrative image; not verified as a named larch grove, Banff trail, autumn date or current colour.' },
  'banff-in-fall': { title: 'Banff in September & October: Fall Travel and Base Planning', description: 'Choose a September or October Banff trip with practical base comparisons, seasonal transport, town activities, current access checks and your own complete budget.', lastUpdated: reviewDate, readTime: '11 min read', imageIsIllustrative: true, imageNote: 'Illustrative image; not verified as a named Banff location, season or current conditions.' },
};
