/** Full review of one canonical guide; its original publication remains May 28, 2026. */
export const reviewDate = '2026-10-29';

export const liveMusicGuideFaqs = [
  { question: 'Where can I find a live band in Banff for my actual dates?', answer: 'Start with Rose & Crown’s date calendar, Melissa’s Missteak’s Live Events page and Banff Centre’s events listings. Open the individual event and check whether it is a live band, solo performance, DJ, karaoke or another format. A venue’s nightlife programme does not make every listing a live concert.' },
  { question: 'Does reserving a dinner table include admission to the show?', answer: 'Only when the specific confirmation says so. A table, a ticket, an assigned seat and a general-admission place are different arrangements. Ask the venue whether a separate ticket or cover applies and whether the table can be used during the performance.' },
  { question: 'Can children attend live music in Banff?', answer: 'Check the exact venue and event before booking. Rose & Crown currently says minors are welcome until 9:30 p.m.; that does not include a later performance. Banff Centre events have their own age and content rules, and a theatre or campus address is not a blanket all-ages policy. Confirm tickets and the full evening for every child.' },
  { question: 'Can I stay in Canmore and go to a Banff show?', answer: 'Yes, if the actual outward trip, show timing and complete return work for your party. Check Route 3’s current stops and last return, then any local connection to your accommodation. A late show may outlast the bus service. Arrange another return or choose a Banff stay rather than assuming a hotel shuttle exists.' },
] as const;

const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const faqHtml = liveMusicGuideFaqs.map(faq => `<details><summary>${escapeHtml(faq.question)}</summary><p>${escapeHtml(faq.answer)}</p></details>`).join('\n');
const faqSchema = JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: liveMusicGuideFaqs.map(faq => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) }).replace(/</g, '\\u003c');

export const liveMusicGuideOverrides: Record<string, string> = {
  'banff-live-music': `
<p>A Banff music night can mean a band in a pub, a solo performance, a listening-focused concert or a ticketed late-night event. Choose the kind of evening first: do you want to hear a particular artist, sit through a performance, eat while music plays, or leave room for dancing? Those choices lead to different reservations, seating and arrival times.</p>
<p>This guide shows where to look and how to join the evening together. The venue sources were checked <strong>October 29, 2026</strong>; this is not a live gig inventory. Use the event for your actual date, rather than an old weekly schedule or a generic bar description.</p>
<nav aria-label="Live music guide sections"><p><a href="#music-choices">Choose a format</a> · <a href="#find-a-show">Find a show</a> · <a href="#tickets-and-tables">Tickets and tables</a> · <a href="#music-arrival">Arrival and access</a> · <a href="#music-return">The return</a> · <a href="#music-questions">Questions</a></p></nav>

<h2 id="music-choices">Choose the evening, then the venue</h2>
<table><caption>Music discovery routes, rather than a fixed list of tonight’s shows</caption><thead><tr><th scope="col">Starting point</th><th scope="col">Location and purpose</th><th scope="col">What to look for</th></tr></thead><tbody>
<tr><th scope="row"><a href="https://roseandcrown.ca/events/" target="_blank" rel="noopener">Rose &amp; Crown calendar</a></th><td>202 Banff Avenue, in downtown Banff</td><td>Date-specific bands, DJs and other pub events; read the individual listing rather than treating every nightlife entry as live music.</td></tr>
<tr><th scope="row"><a href="https://melissasmissteak.com/live-events/" target="_blank" rel="noopener">Melissa’s Missteak Live Events</a></th><td>201 Banff Avenue #2, downtown</td><td>The operator’s event posters and ticket routes, separate from its table booking.</td></tr>
<tr><th scope="row"><a href="https://www.banffcentre.ca/events" target="_blank" rel="noopener">Banff Centre events</a></th><td>Campus venues at 107 Tunnel Mountain Drive, plus occasional off-site events</td><td>The actual artist, venue, music category and seating or general-admission format.</td></tr>
<tr><th scope="row"><a href="https://www.banff-springs-hotel.com/experience/events-calendar/" target="_blank" rel="noopener">Fairmont Banff Springs event calendar</a></th><td>A separate Spray Avenue hotel setting</td><td>A specifically announced performance or celebration, its named room and guest eligibility; a hotel bar is not itself a music booking.</td></tr>
</tbody></table>

<h3>Rose &amp; Crown: read the date calendar</h3>
<p>The <a href="https://roseandcrown.ca/contact/" target="_blank" rel="noopener">operator’s contact page</a> confirms the 202 Banff Avenue address. Its calendar mixes performers with DJs and non-music events, so open the entry that actually interests you. A dinner reservation and a late performance can be different parts of the business.</p>
<p>The <a href="https://roseandcrown.ca/" target="_blank" rel="noopener">homepage</a> has differing general start-time wording, while the calendar supplies dated entries. Use the specific event and contact the pub if details disagree. It currently lists minors welcome until 9:30 p.m.; an earlier meal does not establish admission to a later show.</p>

<h3>Melissa’s Missteak: event tickets and meals are separate</h3>
<p>The official Live Events page tells readers to open the event poster for the event page and tickets, and separately offers a table booking. Use those different routes for their actual purposes. If a poster is difficult to read or does not show the details your party needs, ask the venue rather than inferring a start, admission price or age policy.</p>
<p>The <a href="https://melissasmissteak.com/contact/" target="_blank" rel="noopener">contact page</a> confirms 201 Banff Avenue #2 and separates restaurant and bar service. Check which service you are reserving and whether food will be available at the time you intend to eat. A bar’s opening hours are not a promise of kitchen service or a live band.</p>

<h3>Banff Centre: a concert is not the same as a pub set</h3>
<p>Use the events page or the <a href="https://www.banffcentre.ca/banff-centre-presents-1" target="_blank" rel="noopener">Banff Centre Presents programme</a> for a dated concert. Jenny Belzberg Theatre, Rolston Recital Hall and <a href="https://www.banffcentre.ca/clvb-33" target="_blank" rel="noopener">CLVB ’33</a> are different settings. Some events are seated concerts; others are general-admission or late-night formats. Read the specific venue and ticket type before choosing the evening.</p>
<p>For a listening-focused performance, make the concert the main booking and fit dinner around it. For a late-night campus event, check its own age restriction and return plan. A festival pass, a film screening and a music after-party are separate products unless their actual terms say otherwise.</p>

<h3>Fairmont: confirm the named venue and event</h3>
<p><a href="https://www.banff-springs-hotel.com/dine/rundle-bar/" target="_blank" rel="noopener">Rundle Bar</a> is a current Fairmont Banff Springs venue at 405 Spray Avenue. Use the hotel’s own event calendar for a specifically advertised evening and confirm whether non-resident visitors can attend. A table, guest activity or special-event ticket may have different terms. No recurring hotel jazz programme is established by this guide.</p>

<h2 id="find-a-show">Find a show that fits the whole party</h2>
<ol><li><strong>Set the date and format.</strong> Search the venue’s current calendar for live music, not just nightlife. Check whether the entry describes a band, solo artist, DJ, karaoke or a different event.</li><li><strong>Open the individual event.</strong> Confirm the date, venue address, doors, performance start and any expected finish or interval. If a calendar card and event description show different times, resolve that with the box office or venue.</li><li><strong>Choose the admission.</strong> Read the ticket or cover arrangement, seat type, age/content guidance and booking terms. A missing online purchase option is a reason to ask, not proof of a free show.</li><li><strong>Fit the journeys.</strong> Add the meal, arrival buffer and complete return before paying for a tightly timed evening.</li></ol>
<p>Our <a href="/events/">events page</a> can help discover other dated local happenings, but use the music venue’s own listing for admission and performance details. For a broader evening with pubs or dancing, continue with the <a href="/blog/banff-nightlife-guide/">Banff nightlife guide</a>.</p>

<h2 id="tickets-and-tables">Doors, start time, ticket and table</h2>
<p><strong>Doors</strong> means admission can begin; it is not necessarily the performance start. The restaurant may open earlier still. Save the distinct times and leave enough room for food, the walk or ride, collecting tickets and finding the right entrance. If the start matters, do not rely on a universal pub-music hour.</p>
<p>A <strong>ticket</strong> can establish admission without a dinner table or an assigned seat. A <strong>table reservation</strong> can establish a meal without show admission. Ask whether a ticketed event clears or reassigns the room, whether your table can remain during the music, and which part of the venue the reservation covers.</p>
<p><a href="https://www.banffcentre.ca/box-office/tickets" target="_blank" rel="noopener">Banff Centre’s ticket guide</a> distinguishes general admission from assigned seating and sets event-specific age and ticket rules. Its digital-ticket instructions call for the original PDF rather than a screenshot. Save the confirmation and the ticket for each member of the party before travelling.</p>
<p>If you want to hear the full set, compare the expected finish with the journey home. If you need to leave earlier, decide whether that still makes the booking worthwhile. Avoid buying a performance around the assumption that an encore, delayed start or extra set will finish at a particular time.</p>

<h2 id="music-arrival">Arrive at the right room, with access arranged</h2>
<p>Downtown pub addresses, Banff Centre’s hillside campus and Fairmont’s Spray Avenue setting require different final legs. The <a href="https://www.banffcentre.ca/maps-directions" target="_blank" rel="noopener">Centre’s campus map and directions</a> show the approaches and parking areas. Campus parking is now paid; use its current instructions rather than assuming the parkade is free or that every lot is equally close to the performance venue.</p>
<p>The <a href="https://www.banffcentre.ca/box-office/attending-a-performance" target="_blank" rel="noopener">attending-a-performance guide</a> explains that late seating can depend on the production and access varies by venue. Ask in advance about the complete step-free route, accessible seating, companion arrangements or assisted listening you need. A building described as accessible does not specify every entrance or seat.</p>
<p>For a pub or hotel event, ask the venue directly about entrance level, seating, toilets and the performance format. Do not assume that a table provides a clear view or that a general-admission event is seated. Confirm the actual child, identification and content rules; different venues and events can admit different parties.</p>

<h2 id="music-dinner">Make dinner and the show work together</h2>
<p>Choose one anchor for the evening. If you have concert tickets, work backwards from arrival at the venue to the meal and transport. If you mainly want a meal with music, ask whether the chosen dining service overlaps the performance and whether a table is available in that room.</p>
<p>The <a href="/blog/new-places-to-eat-in-banff/">reviewed dining discoveries guide</a> compares actual Banff addresses and services. For the transition from a ski day, use the <a href="/blog/banff-apres-ski/">après-ski guide</a>. A ski-resort return, changing clothes and dinner all take time; a mountain activity booking does not guarantee arrival for an evening performance.</p>

<h2 id="music-return">Plan the winter evening and the return</h2>
<p><a href="https://roamtransit.com/schedules-routes/route-7/" target="_blank" rel="noopener">Roam Route 7</a> is the seasonal fall/winter Banff Centre service, with a distinct festival schedule when published. <a href="https://roamtransit.com/schedules-routes/route-2/" target="_blank" rel="noopener">Route 2</a> links the Fairmont, downtown and Tunnel Mountain. Check the operating date, exact stop and last return for the actual event; these are public routes, not generic hotel shuttles.</p>
<p>For a Canmore base, use <a href="https://roamtransit.com/schedules-routes/canmore-banff-regional-route-3/" target="_blank" rel="noopener">regional Route 3</a> and check the complete connection back to the property. Harvie Heights, Dead Man’s Flats and more distant bases need their own arrangements. A show ending late can outlast the bus service. Arrange a suitable taxi or other return in advance, choose a designated driver or stay in Banff; no transport availability is promised here.</p>
<p>In winter, leave time for cold-weather clothing, snowy or icy surfaces and waiting outside. Take the actual walking gradient and footwear into account rather than relying on a short map distance. Choose an earlier or simpler evening if the return would depend on rushing.</p>
<p>If the music is a main reason for the stay, compare the hotel address with the venues you intend to use. The <a href="/book/banff-hotels/">Banff hotel comparison</a> helps distinguish central, kitchen-equipped and hillside room choices; its accommodation links may earn BanffBound a commission. A room does not include a concert ticket, entertainment voucher, table or shuttle unless the specific confirmation says so. Use the <a href="/towns/canmore/">Canmore area guide</a> or <a href="/car-free-banff/">car-free planning guide</a> when the evening involves another base.</p>

<h2 id="music-questions">Live music questions</h2>
${faqHtml}
<script type="application/ld+json">${faqSchema}</script>
<h2 id="music-sources">Sources and review</h2><p>Fully reviewed October 29, 2026 using Rose &amp; Crown’s current calendar and contact information, Melissa’s Missteak’s official Live Events and contact pages, Banff Centre’s events/ticket/visitor guidance, Fairmont’s named venue and event calendar, and Roam’s route pages. Event programmes change. Confirm the particular show, ticket, access and return for the date you choose; this guide does not establish live availability or a fixed weekly music schedule.</p>
`,
};

export const liveMusicGuideMetadata: Record<string, { title: string; description: string; lastUpdated: string; readTime: string; imageIsIllustrative: true; imageNote: string }> = {
  'banff-live-music': {
    title: 'Live Music in Banff: Pubs, Concerts & Show Planning',
    description: 'Find live music in Banff through current pub and concert calendars. Compare tickets, tables, age and access rules, dinner timing and the complete return.',
    lastUpdated: reviewDate,
    readTime: '10 min read',
    imageIsIllustrative: true,
    imageNote: 'Illustrative image; not verified as a named Banff venue, performer or current event.',
  },
};
