import { eveningPlannerHtml } from './eveningGuideMarkup';

/** Full editorial review. The original publication date remains in blogPosts.ts. */
export const reviewDate = '2026-10-29';
const sources = {
  dusty: 'https://www.dustybootbanff.com/',
  dustyProgramme: 'https://www.dustybootbanff.com/live-music-specials',
  contacts: 'https://www.banffcollective.com/contact-us',
  bowling: 'https://www.highrollersbanff.com/',
  rose: 'https://roseandcrown.ca/events/',
  centre: 'https://www.banffcentre.ca/events',
  tickets: 'https://www.banffcentre.ca/box-office/tickets',
  performance: 'https://www.banffcentre.ca/box-office/attending-a-performance',
  campus: 'https://www.banffcentre.ca/maps-directions',
  roam: 'https://roamtransit.com/schedules-routes/',
  centreBus: 'https://roamtransit.com/schedules-routes/route-7/',
  canmore: 'https://roamtransit.com/schedules-routes/canmore-banff-regional-route-3/',
  louise: 'https://roamtransit.com/schedules-routes/lake-louise-banff-express-route-8x/',
  transfers: 'https://roamtransit.com/about-us/transportation-policies/',
};

export const nightlifeGuideFaqs: { question: string; answer: string }[] = [
  { question: 'What can we do in Banff in the evening besides go drinking?', answer: 'Make dinner, an early bowling session or an appropriate dated performance the main event. An alcohol-free evening does not require a different town itinerary: choose the activity and menu you want, and ask about the setting, admission and any minimum purchase before reserving.' },
  { question: 'Can children go to High Rollers or The Dusty Boot?', answer: 'High Rollers publishes no minors after 10pm, so plan a younger party’s bowling and meal to finish earlier and confirm the session rules. The Dusty Boot publishes an 18+ entry condition. A family dinner or performance elsewhere needs its own age and admission check.' },
  { question: 'Does a restaurant reservation include the bowling lane or live show?', answer: 'Do not assume it does. High Rollers has separate dining and bowling reservations. At a music venue, a table, an event ticket and admission to the session can also be different arrangements. Confirm exactly what the reservation includes before paying.' },
  { question: 'Can we take a late bus back to Canmore or Lake Louise?', answer: 'Check Roam Route 3 for Canmore or Route 8X for the Lake Louise journey on the actual date, direction and stop. Work back from the last useful departure and include the connection to your accommodation. This guide does not establish a late service or a guaranteed transfer.' },
  { question: 'Is every Banff Centre performance suitable for children?', answer: 'No. Read the individual event’s age conditions and content information and ask the Box Office if they are unclear. The Centre’s ticket policy generally requires every audience member to hold a ticket, with a limited exception for children aged one and under at outdoor Shaw Amphitheatre events.' },
];

const esc = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
function faqHtml(): string {
  const schema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: nightlifeGuideFaqs.map(faq => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) };
  return `<h2 id="questions">Questions before an evening out</h2>${nightlifeGuideFaqs.map(faq => `<details><summary>${esc(faq.question)}</summary><p>${esc(faq.answer)}</p></details>`).join('\n')}\n<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`;
}

export const nightlifeGuideOverrides: Record<string, string> = {
  'banff-nightlife-guide': `
<p>Build a Banff evening around something your whole party wants to do: dinner and conversation, a bowling lane, a band, a ticketed performance or a dance floor. Choose that centrepiece first, then fit the meal and journey home around it. You can have a complete evening without moving between several bars or staying out late.</p>
<p>This guide helps you choose the shape of the evening. Use the <a href="/blog/banff-live-music/">live-music guide</a> for performance formats, the <a href="/blog/new-places-to-eat-in-banff/">reviewed dining guide</a> for a restaurant decision, and the <a href="/blog/banff-apres-ski/">après-ski guide</a> when the evening follows a resort day.</p>
<nav aria-label="Evening guide sections"><p><a href="#evening-planner">Evening planner</a> · <a href="#choose-your-anchor">Choose a format</a> · <a href="#younger-and-alcohol-free">Earlier and alcohol-free evenings</a> · <a href="#return-plan">Getting home</a> · <a href="#winter-base">Winter bases</a> · <a href="#questions">Questions</a></p></nav>
${eveningPlannerHtml}

<h2 id="choose-your-anchor">Choose the anchor, then add the rest</h2>
<table><caption>Different bookings create different kinds of evening</caption><thead><tr><th scope="col">If you want…</th><th scope="col">Start with…</th><th scope="col">Make the plan work</th></tr></thead><tbody>
<tr><th scope="row">A meal and time to talk</th><td>A menu and table that suit the group.</td><td>Ask whether an event, music or a shared seating arrangement changes the room you intend to book.</td></tr>
<tr><th scope="row">Something to do together</th><td>A bowling reservation, with food arranged around the lane.</td><td>Book the lane itself and check the whole party’s session conditions.</td></tr>
<tr><th scope="row">A pub band or dancing</th><td>The actual venue programme and admission arrangements.</td><td>Decide whether you want a meal, a standing music session or the dance-floor part of the evening.</td></tr>
<tr><th scope="row">A performance with a clear focus</th><td>A dated event and its named venue.</td><td>Buy the appropriate ticket, allow for arrival, and connect the finish to your return journey.</td></tr>
</tbody></table>
<p>For conversation, ask about the particular room and service rather than treating “pub”, “cocktail bar” or “restaurant” as a sound-level guarantee. For a larger party, give the venue the actual group size and ages and ask whether it needs a group arrangement. Agree on the shared meal or activity first; people can make different choices about a later adults-only outing.</p>

<h2 id="dancing">Dancing: use the current venue identity</h2>
<p><strong>Venue identity checked October 29, 2026:</strong> <a href="${sources.dusty}" target="_blank" rel="noopener">The Dusty Boot Dance Hall &amp; Saloon</a> is at <strong>120 Banff Avenue</strong> and publishes an <strong>18+ entry condition</strong>. The operator presents a saloon and dance-hall format with food and live music. Its <a href="${sources.dustyProgramme}" target="_blank" rel="noopener">programme page</a> distinguishes music, dancing and other sessions; choose the format you actually want.</p>
<p>Use the current public-facing name when checking directions or making an enquiry. The hospitality group’s <a href="${sources.contacts}" target="_blank" rel="noopener">contact record</a> lists The Dusty Boot at that address; an older Dancing Sasquatch listing is not the current programme. Check identification, event entry and what a reservation covers directly. A dinner reservation or guest-list entry should not be treated as a promise of every later activity.</p>

<h2 id="music-or-performance">Pub music or a ticketed performance?</h2>
<p>The <a href="${sources.rose}" target="_blank" rel="noopener">Rose &amp; Crown calendar</a> lists dated bands, DJs and other events. Open the entry for your day instead of assuming the same weekend band or a single start time. If sitting together matters, resolve the table and event arrangements with the venue. The live-music guide develops these choices without turning a recurring promotion into a confirmed performance.</p>
<p>For a concert, film or another scheduled performance, browse <a href="${sources.centre}" target="_blank" rel="noopener">Banff Centre’s current programme</a>. Read the individual listing for the actual venue, date, admission and audience conditions. The <a href="${sources.tickets}" target="_blank" rel="noopener">ticket policy</a> distinguishes assigned seats from general admission, and children’s attendance has specific conditions. An event calendar is not a blanket all-ages invitation.</p>
<p>Make dinner the supporting plan: tell the restaurant about the performance time, allow room for the venue’s arrival instructions, and avoid making the next booking depend on an assumed exact finish. Check the <a href="${sources.performance}" target="_blank" rel="noopener">performance arrival and access information</a> for the named venue. Late seating can depend on the production.</p>

<h2 id="younger-and-alcohol-free">Earlier evenings and an alcohol-free plan</h2>
<p>For a family or mixed-age group, start with dinner, earlier bowling, or a dated performance whose admission and content fit everyone. At <a href="${sources.bowling}" target="_blank" rel="noopener">High Rollers, 110 Banff Avenue</a>, <strong>no minors are allowed after 10pm</strong>. Plan the visit to finish earlier, not merely to begin before the cutoff. The operator has separate dining and bowling reservations; a table does not secure a lane. Read the payment and cancellation conditions for the booking you select.</p>
<p>For an alcohol-free evening, choose food, the game or the performance as the reason to go. Ask about the drinks menu and any purchase conditions if those affect the decision. Bowling can be a sociable outing, while a seated show offers a different focus; neither label guarantees a quiet setting. If you want an early night, a meal followed by time at your own accommodation is a complete plan.</p>

<h2 id="return-plan">Make the return journey part of the booking</h2>
<ol><li><strong>Save the actual accommodation address.</strong> “Banff area” is not a stop or an arrival point. Include the final walk or onward connection.</li><li><strong>Check the service for the date and direction.</strong> Use <a href="${sources.roam}" target="_blank" rel="noopener">Roam’s current routes and service updates</a>, with <a href="${sources.canmore}" target="_blank" rel="noopener">Route 3 for Canmore–Banff</a> or <a href="${sources.louise}" target="_blank" rel="noopener">Route 8X for Lake Louise–Banff</a> where appropriate.</li><li><strong>Work back from the last useful departure.</strong> Include getting from the venue to the stop and any onward service. Roam’s <a href="${sources.transfers}" target="_blank" rel="noopener">transfer policy</a> explains that connections depend on schedules and delays; they are not guaranteed.</li><li><strong>Choose an alternative in advance if the timetable does not fit.</strong> Arrange the actual return with a transport provider, or choose an earlier evening. If someone is driving, agree on a driver who will not drink.</li></ol>
<p>For a Banff Centre outing, use the <a href="${sources.campus}" target="_blank" rel="noopener">campus map and access information</a>, not just the town name. The campus is uphill from downtown and has paid parking. <strong>At this review, <a href="${sources.centreBus}" target="_blank" rel="noopener">Route 7</a> is advertised as a fall/winter seasonal service</strong>, with a separate festival schedule. Check the timetable that covers the event, and ask the Box Office about the entrance and access route you need. An uphill winter walking connection deserves its own decision.</p>

<h2 id="winter-base">Choose a winter base that fits the evening</h2>
<p>A central Banff address can reduce the journey between dinner and the evening’s anchor, while a hillside hotel or accommodation outside town adds another connection. Compare the exact address and transport with the <a href="/book/banff-hotels/">Banff hotel booking shortlist</a> and <a href="/towns/banff/">Banff town guide</a>. Those differences matter more than a generic claim that every Banff stay is walkable.</p>
<p>For <a href="/towns/canmore/">Canmore</a> or <a href="/towns/lake-louise/">Lake Louise</a>, plan the complete regional journey before buying an evening ticket. The village, lakeshore, resort and road-base addresses around Lake Louise are different endpoints. A ski-day transfer or a hotel’s general shuttle description does not confirm a late-night ride. Ask the named operator about the particular journey.</p>
<p>Keep a warm layer and footwear suitable for the actual walking connections; save tickets, directions and the return plan before leaving. Use <a href="/winter/">winter planning</a> and <a href="/car-free-banff/">car-free transport planning</a> to fit the evening to the rest of the trip. Let the next morning’s plans help decide how long you want to stay out.</p>

<h2 id="evening-outlines">Three complete evenings to adapt</h2>
<ul><li><strong>Food and a game:</strong> choose an early bowling session, arrange the meal and check when your whole party needs to leave. Keep the return simple rather than adding another venue automatically.</li><li><strong>Dinner and a performance:</strong> select the dated event first, then book a meal and the journey to the named venue. Leave space for arrival and the trip back.</li><li><strong>An adults-only dancing evening:</strong> check The Dusty Boot’s actual session and entry conditions, decide whether to eat there or beforehand, and arrange the return before starting.</li></ul>
${faqHtml()}
<h2 id="sources">Sources and review</h2>
<p><strong>Guide reviewed October 29, 2026.</strong> Venue identity, format and admission notes use the linked current Dusty Boot, High Rollers, Rose &amp; Crown and Banff Centre operator pages. Journey planning uses Roam’s route and transfer information. These sources support the distinctions above; they do not establish available tables, tickets, transport or a future event going ahead. Follow the actual dated booking and service information when making the plan.</p>
`,
};

type NightlifeGuideMetadata = {
  title: string; description: string; lastUpdated: string; readTime: string;
  imageIsIllustrative: true; imageNote: string;
};
export const nightlifeGuideMetadata: Record<string, NightlifeGuideMetadata> = {
  'banff-nightlife-guide': {
    title: 'Banff Nightlife: Music, Bowling, Dancing & Getting Home',
    description: 'Choose a Banff evening around dinner, bowling, pub music, a dated performance or dancing, with age checks, winter base choices and a complete return plan.',
    lastUpdated: reviewDate,
    readTime: '10 min read',
    imageIsIllustrative: true,
    imageNote: 'Illustrative image; not verified as a named Banff venue, event, audience or current evening conditions.',
  },
};
