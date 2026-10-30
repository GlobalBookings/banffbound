/** Full canonical review; original publication remains 2025-12-10. */
export const reviewDate = '2026-10-29';

const sources = {
  winter: 'https://www.tourismgolden.com/activities/winter',
  townWalk: 'https://www.tourismgolden.com/places/rotary-trail',
  resortArrival: 'https://kickinghorseresort.com/discover-kickinghorse/getting-to-kicking-horse-mountain-resort/',
  resortHours: 'https://kickinghorseresort.com/winter-hours/',
  school: 'https://kickinghorseresort.com/purchase/telus-winter-snow-school/',
  summer: 'https://kickinghorseresort.com/summer-hours/',
  bear: 'https://kickinghorseresort.com/purchase/boo-grizzly-bear/',
  nordic: 'https://goldennordicclub.ca/',
  nordicRentals: 'https://goldennordicclub.ca/rentals/',
  purcell: 'https://www.cmhheli.com/destinations/purcell',
  heliDay: 'https://www.cmhheli.com/heli-skiing/day-heli-skiing',
  skybridge: 'https://www.banffjaspercollection.com/plan-your-trip/opening-dates/',
  rafting: 'https://wildwater.com/faq/',
  powderExpress: 'https://banfftours.com/activities/banff-to-kicking-horse-ski-shuttle/',
  connector: 'https://www.goldenshuttle.ca/kickinghorse-golden-shuttle',
  yohoArrival: 'https://parks.canada.ca/pn-np/bc/yoho/visit/directions',
  yohoServices: 'https://parks.canada.ca/pn-np/bc/yoho/visit/services',
  winterDriving: 'https://www2.gov.bc.ca/gov/content/transportation/driving-and-cycling/traveller-information/seasonal/winter-driving',
  driveBC: 'https://www.drivebc.ca/',
  alberta511: 'https://511.alberta.ca/',
};

export const goldenDayGuideFaqs: { question: string; answer: string }[] = [
  { question: 'Is Golden in Banff National Park, and is Kicking Horse a SkiBig3 resort?', answer: 'Golden is a separate town in British Columbia beyond Yoho National Park on the Highway 1 journey from Banff. Kicking Horse Mountain Resort is a separate destination above Golden and is not one of the three SkiBig3 resorts. Confirm its own ticket, lesson and arrival arrangements.' },
  { question: 'Can I visit Golden Skybridge and Takakkaw Falls on a winter day trip?', answer: 'Do not build that winter combination. At the October 29, 2026 review, Golden Skybridge’s operator published a future May 7–October 12, 2027 season. The road to Takakkaw Falls closes in winter because of avalanche hazard. Neither listing establishes winter admission or a winter driving detour.' },
  { question: 'Should I drive from Banff for a Kicking Horse ski day?', answer: 'Decide after checking the complete outward and return journeys, current roads, required vehicle equipment and the actual lesson or lift arrangements. A booked ski shuttle may be an option for its confirmed dates and stops. If the mountain activity is the main purpose, compare staying in Golden or at the resort rather than committing to a tired winter return drive.' },
  { question: 'Is CMH Purcell the same meeting point as Kicking Horse Mountain Resort?', answer: 'No. CMH Purcell is a separate Golden-based heli-ski operation, not a resort lift or a sightseeing flight. Its day programme expects previous powder experience and requires an operator ability discussion. Confirm the actual day-lodge meeting point, equipment, check-in, weather and cancellation terms. The day lodge does not provide overnight accommodation.' },
  { question: 'Does a bus to Golden cover every resort, rafting or heli-ski meeting point?', answer: 'No. Confirm the actual inter-town stop and each final connection. A resort ski shuttle is not a general Golden sightseeing or heli-base transfer. The Golden–Kicking Horse Connector is a separate winter service; its page still showed a 2025/26 timetable at review. Verify the current season, seats, equipment carriage and last return directly before relying on it.' },
];

const esc = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function renderFaqs(): string {
  const schema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: goldenDayGuideFaqs.map(faq => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) };
  return goldenDayGuideFaqs.map(faq => `<details><summary>${esc(faq.question)}</summary><p>${esc(faq.answer)}</p></details>`).join('\n') + `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`;
}

export const goldenDayGuideOverrides: Record<string, string> = {
  'golden-bc-day-trip': `
<p>Golden can be a town visit, a Nordic outing or the base for a mountain holiday. Choose that purpose before adding attractions to the drive from Banff. A meal and a riverside walk have different commitments from a ski lesson, a rafting departure or a heli-ski day.</p>
<p>This guide was fully reviewed <strong>October 29, 2026</strong>. It separates published seasonal plans from current operations and leaves room for the journey home. Start with the <a href="/towns/golden/">Golden base guide</a> if you are deciding where to stay; a full mountain day can be a better reason for an overnight than for a tightly packed round trip.</p>
<nav aria-label="Golden day guide sections"><p><a href="#golden-places">Know the places</a> · <a href="#golden-winter">Winter choices</a> · <a href="#golden-summer">Warmer-season choices</a> · <a href="#golden-road">The Highway 1 journey</a> · <a href="#golden-transport">Transport</a> · <a href="#golden-return">Return and overnight</a> · <a href="#golden-plans">Choose a day format</a> · <a href="#golden-questions">Questions</a></p></nav>

<h2 id="golden-places">Golden, the resort and the meeting point are different places</h2>
<table><caption>Choose the actual destination before arranging transport</caption><thead><tr><th scope="col">Place</th><th scope="col">Useful purpose</th><th scope="col">What needs its own plan</th></tr></thead><tbody>
<tr><th scope="row">Golden town</th><td>A meal, local services and a town-focused visit.</td><td>Your parking or bus stop, walking conditions and the journey to any out-of-town activity.</td></tr>
<tr><th scope="row">Kicking Horse Mountain Resort</th><td>A resort ski day or a separately operating summer mountain visit.</td><td>The mountain-road connection, ticket, rentals, lesson and return. A Golden town address is not the resort base.</td></tr>
<tr><th scope="row">Dawn Mountain Nordic Centre</th><td>A dedicated Nordic or snowshoe outing under the centre’s current rules.</td><td>Trail information, equipment, lesson and separate arrival. A downhill ticket does not cover it.</td></tr>
<tr><th scope="row">CMH Purcell</th><td>A booked heli-ski programme with its own ability and travel requirements.</td><td>The operator’s actual Golden day-lodge check-in. Do not navigate to Kicking Horse’s gondola instead.</td></tr>
<tr><th scope="row">Yoho National Park</th><td>A park visit en route, with Field as a separate community.</td><td>Seasonal roads, park admission for intended stops and the time each detour needs.</td></tr>
</tbody></table>
<p>Follow the <a href="${sources.resortArrival}" target="_blank" rel="noopener">resort’s arrival information</a> for Kicking Horse. Its ticket and school are separate from Banff’s SkiBig3 resorts. For the heli operation, use <a href="${sources.purcell}" target="_blank" rel="noopener">CMH Purcell’s own planning information</a>. Similar mountain names do not make the bookings or pickup points interchangeable.</p>

<h2 id="golden-winter">Choose one main winter outing</h2>
<p>Use <a href="${sources.winter}" target="_blank" rel="noopener">Tourism Golden’s winter directory</a> to explore local options, then open the actual provider’s current instructions. Choose by the experience your group wants, not by the number of activities that fit on a brochure.</p>
<h3>A town visit with room to change the plan</h3>
<p>The Kicking Horse Pedestrian Bridge and <a href="${sources.townWalk}" target="_blank" rel="noopener">Rotary Trail</a> provide a town-focused starting point. Choose a short section that suits the actual surface, daylight and group; the tourism route description does not establish winter clearing or ice-free access. Pair it with a meal and time in town rather than treating the entire trail network as a compulsory circuit. Stay on land and use designated crossings; a frozen-looking river is not a walking route.</p>
<h3>A Nordic day at Dawn Mountain</h3>
<p>Use <a href="${sources.nordic}" target="_blank" rel="noopener">Golden Nordic Ski Club’s current conditions and visitor information</a> to choose the outing. Beginners can ask about lessons before choosing equipment. The <a href="${sources.nordicRentals}" target="_blank" rel="noopener">rental policy</a> separates equipment rental from the trail fee, restricts the gear to Dawn Mountain and requires its return before closing. Confirm the particular equipment and lesson before travelling; a listed rental category is not stock reserved for your party.</p>
<h3>A full Kicking Horse resort day</h3>
<p>Give skiing or snowboarding the day’s main booking. Match the <a href="${sources.school}" target="_blank" rel="noopener">snow school</a> to each learner’s age, discipline and experience, then confirm ticket inclusions, rental fitting and the real meeting point. A resort’s reputation for steep terrain does not select a suitable lesson or run for everyone. Non-skiers should confirm their own sightseeing access, facilities and return arrangements rather than assuming a ski lift ticket or summit meal works for the whole group.</p>
<p><strong>Read the season on the source.</strong> At review, the <a href="${sources.resortHours}" target="_blank" rel="noopener">winter-hours page</a> still carried a 2025/26 heading and closed service rows, alongside references to winter 2026/27. This guide therefore confirms no future opening day or individual service. Check the dated mountain report, school and transport separately before buying a linked plan.</p>
<h3>A heli-ski commitment, with a separate overnight decision</h3>
<p><a href="${sources.heliDay}" target="_blank" rel="noopener">CMH’s Purcell day programme</a> expects previous powder experience; discuss fitness and skills in variable backcountry snow with the operator. It is not a beginner lesson or a scenic flight. Confirm the actual base, check-in, equipment, weather and cancellation arrangements. The day lodge has no overnight accommodation: arrange a separate stay if needed, and decide whether to stay before, after or both. Do not add a resort morning or promise a Banff return after flying. The <a href="/blog/banff-heli-skiing/">reviewed heli-ski planning guide</a> explains the wider choice.</p>

<h2 id="golden-summer">Summer attractions need their own season and booking</h2>
<table><caption>Different outings, with different operating calendars</caption><thead><tr><th scope="col">Choice</th><th scope="col">What to compare</th><th scope="col">Season boundary checked October 29, 2026</th></tr></thead><tbody>
<tr><th scope="row">Kicking Horse sightseeing</th><td>Gondola sightseeing, summit dining and any guided activity need their own service and ticket checks.</td><td>The <a href="${sources.summer}" target="_blank" rel="noopener">summer-hours page</a> described the now-past 2026 season. It does not establish 2027 operation.</td></tr>
<tr><th scope="row">Grizzly Bear Refuge</th><td>Use the operator’s <a href="${sources.bear}" target="_blank" rel="noopener">Boo refuge visit</a> information for the tour and access. This is a managed refuge, not a promise of wild-bear sightings.</td><td>A summer refuge programme is not a winter ski-day add-on.</td></tr>
<tr><th scope="row">Golden Skybridge</th><td>Choose the actual admission and activities; confirm participation rules for each person.</td><td>The operator’s <a href="${sources.skybridge}" target="_blank" rel="noopener">opening-date page</a> lists May 7–October 12, 2027. These are future seasonal plans, not winter access or guaranteed operation.</td></tr>
<tr><th scope="row">Kicking Horse rafting</th><td>Choose an operator and exact trip, river section, eligibility, equipment and meeting point.</td><td>For example, <a href="${sources.rafting}" target="_blank" rel="noopener">Wild Water Adventures</a> describes a mid-May to mid-September season and a river base at 2750 Beaverfoot Road, near Golden. Recheck actual dates; this is not a winter activity.</td></tr>
</tbody></table>
<p>A rafting company’s office, the river base and Golden town may be different addresses. Do not assign every half-day trip the same rapids or assume every family qualifies. Reserve the outing that actually fits your group, then work around its check-in and finish; a mountain visit can be a separate day. Wetlands paddling also needs its own route, skills and current water-access research, rather than a casual unsupervised addition to this road trip.</p>

<h2 id="golden-road">Plan Highway 1 through Yoho, including winter limits</h2>
<p>From Banff, the usual approach follows Highway 1 west past the Lake Louise area, over Kicking Horse Pass and through Yoho toward Golden. <a href="${sources.yohoArrival}" target="_blank" rel="noopener">Parks Canada’s Yoho arrival page</a> distinguishes Field from the full-service towns outside the park. Rogers Pass is farther west beyond Golden on a journey toward Revelstoke; it is not the pass you must cross to reach Golden from Banff. Do not use a fixed driving-time estimate to establish whether the activity and return are feasible.</p>
<p>Check <a href="${sources.alberta511}" target="_blank" rel="noopener">511 Alberta</a> for the Alberta leg and <a href="${sources.driveBC}" target="_blank" rel="noopener">DriveBC</a> for the British Columbia leg before leaving and again before the return. Read the actual report section, source time, restrictions and forecast. Roadwork, closures and weather can change the journey; an old screenshot or this article does not establish an open road. The <a href="/conditions/">conditions page</a> provides dated source handoffs.</p>
<p>For vehicle preparation, British Columbia’s <a href="${sources.winterDriving}" target="_blank" rel="noopener">winter-driving guidance</a> requires following the signed winter tire and chain routes: October 1–April 30, with March 31 exceptions on designated lower-snow routes. Check the actual route and vehicle requirements, including a rental’s fitted tires; crossing from Alberta does not remove them. Carry warm clothing and trip supplies and allow the option to postpone. See <a href="/blog/banff-winter-driving/">winter road planning</a> and the <a href="/packing-list/">packing checklist</a>.</p>
<p><strong>Takakkaw Falls is not a quick winter driving detour.</strong> Parks Canada says the Yoho Valley access road closes in winter because of avalanche hazard. Its <a href="${sources.yohoServices}" target="_blank" rel="noopener">services page</a> describes the usual mid-June to mid-October road season, weather permitting. An open main highway does not open that road or establish a suitable snowy walk. Use the <a href="/towns/field-yoho/">Field and Yoho guide</a> for a separate park visit, and check current park notices before choosing any stop.</p>

<h2 id="golden-transport">Join the actual transport legs</h2>
<p>For a car-free ski day, investigate the <a href="${sources.powderExpress}" target="_blank" rel="noopener">Kicking Horse Powder Express</a> linked by the resort. Confirm your actual date, pickup location, ticket inclusions, equipment arrangements and return. A published winter product is not a seat reservation, a general Golden sightseeing bus or transport to a heli-ski base.</p>
<p>The <a href="${sources.connector}" target="_blank" rel="noopener">Golden–Kicking Horse Connector</a> is a separate service between Golden locations and the resort. At review its page still displayed a 2025/26 schedule, with operation tied to the resort’s winter season. Confirm the new season’s stops and last return directly. Do not infer a usable connection from the two services appearing on the same resort page. For any inter-town coach or transfer, confirm the exact drop-off and onward leg before purchasing.</p>
<p>Check each final connection in the whole chain: accommodation to stop; stop to town or resort; equipment collection to meeting point; and the reverse after the activity. Ask about baggage, ski carriage, child arrangements and accessibility where relevant. The <a href="/car-free-banff/">car-free Banff guide</a> helps plan your Banff-side connection; it does not establish service to every Golden address.</p>

<h2 id="golden-return">Choose the return and the overnight together</h2>
<p>Before committing, agree who drives, which source checks trigger changing the plan and what happens if the outing runs late or the return road is disrupted. Keep a winter day modest enough to account for limited daylight and driver fatigue. A paid activity or an existing Banff room does not make a difficult return necessary; check actual accommodation options and contact the relevant providers if plans change.</p>
<p>For a town visit, a town address can keep dinner and local errands together. For repeated Kicking Horse days, compare resort accommodation against a town stay plus the confirmed mountain connection. For CMH Purcell, choose the base around the operator’s own check-in address instead. Confirm the particular room’s kitchen or dining arrangements, parking, check-in, cancellation terms and any shuttle stop. Use <a href="/towns/golden/#where-to-stay">Golden stay planning</a> and <a href="/winter-stays/">winter base comparisons</a>; no room, rate or late arrival is guaranteed here.</p>

<h2 id="golden-plans">Three useful trip formats</h2>
<ol><li><strong>Town-focused day:</strong> Check the two road legs, choose a short suitable town walk and a meal, and retain flexibility to turn back or shorten the visit. Add a Yoho stop only if its current access and the remaining journey fit.</li><li><strong>One booked activity:</strong> Build the day around a confirmed Nordic lesson, resort visit or warm-season attraction. Leave the activity’s check-in, equipment return and transport intact. Keep other attractions optional rather than purchasing a second incompatible departure.</li><li><strong>Golden overnight:</strong> Travel separately from the main mountain commitment, settle into the actual town or resort base, and give skiing or heli-skiing its own day. Decide on the onward journey after checking roads and how the party feels; an overnight reduces scheduling pressure without guaranteeing road conditions.</li></ol>
<p>If the return or specialist activity does not fit, choose a closer day from <a href="/winter/">Banff winter planning</a> or the <a href="/what-to-do-today/">day-choice tool</a>. Golden remains a useful separate destination rather than a checklist to complete between two fixed Banff hotel nights.</p>

<h2 id="golden-questions">Golden day-trip questions</h2>
${renderFaqs()}
<h2 id="golden-sources">Sources and review</h2>
<p><strong>Full guide reviewed October 29, 2026.</strong> Linked sources are Tourism Golden, the actual resort, Nordic club, CMH, attraction and transport operators, Parks Canada, the Province of British Columbia and official road-report services. Past-season headings and future seasonal plans are identified above. This is a planning guide with no live road, snow, booking or transport feed. The hero image is illustrative and is not verified as a named Golden location or current conditions.</p>
`,
};

export const goldenDayGuideMetadata: Record<string, { title: string; description: string; lastUpdated: string; readTime: string; imageIsIllustrative: true; imageNote: string }> = {
  'golden-bc-day-trip': {
    title: 'Golden from Banff: Town Visits, Kicking Horse & Winter Journeys',
    description: 'Choose a Golden town visit, Nordic outing or Kicking Horse stay with seasonal activity checks, real meeting points, Highway 1 travel and a complete return plan.',
    lastUpdated: reviewDate,
    readTime: '13 min read',
    imageIsIllustrative: true,
    imageNote: 'Illustrative image; not verified as Golden town, Kicking Horse Mountain Resort, a specific activity or current conditions.',
  },
};
