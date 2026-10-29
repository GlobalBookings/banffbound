# Banff live music — full guide review, 29 October 2026

## Exact scope

New files only: `src/data/liveMusicGuideOverrides.ts`, `scripts/check-live-music-guide.mjs`, this source note. The module exports `liveMusicGuideOverrides`, `liveMusicGuideMetadata`, `liveMusicGuideFaqs` (one array) and `reviewDate`.

Exactly one existing canonical route is replaced: `/blog/banff-live-music/`. Its original publication remains **28 May 2026**. New metadata records the full review on **29 October 2026**, with title **Live Music in Banff: Pubs, Concerts & Show Planning**. No new route, alias, event inventory, property record or shared file is introduced. Root owns registry/metadata/CI/build integration.

The guide distinguishes pub performances, a concert chosen for listening, general-admission or late-night formats, and a named hotel event. It supplies current discovery links, original booking/meal/arrival/return advice and four FAQs. It does not claim a personal visit, publish a recurring gig timetable, predict admission/transport availability or sell a concert through an unrelated activity affiliate.

## Primary-source inventory

All sources were read on 29 October 2026. The permanent guide links discovery and policy pages; it does not freeze the listed performers or upcoming ticket inventory.

| Primary source | Evidence used / limit |
| --- | --- |
| [Rose & Crown calendar](https://roseandcrown.ca/events/) | Calendar mixes bands, DJs and other events. Use the individual dated entry; “nightlife” is not synonymous with a band. |
| [Rose & Crown homepage](https://roseandcrown.ca/) | Contains differing general music start wording. Also lists the current minors cutoff. Neither a universal start nor late-event family eligibility is inferred. |
| [Rose & Crown contact](https://roseandcrown.ca/contact/) | Publisher address, 202 Banff Avenue. Reservations and group enquiries are distinct from show particulars. |
| [Melissa’s Live Events](https://melissasmissteak.com/live-events/) | Directs readers from event posters to event/ticket pages and offers table booking separately. An image-heavy page does not support guessed show details. |
| [Melissa’s contact](https://melissasmissteak.com/contact/) | Publisher address, 201 Banff Avenue #2; restaurant and bar services are distinct. No fixed opening or kitchen hours copied. |
| [Banff Centre events](https://www.banffcentre.ca/events) | Current event-discovery entry point with different art forms and campus locations. A calendar result is not a booking. |
| [Banff Centre Presents](https://www.banffcentre.ca/banff-centre-presents-1) | Dated concert programme; no future season or fixed show inventory inferred. |
| [CLVB ’33](https://www.banffcentre.ca/clvb-33) | Separate music/cabaret setting rather than an assumption that every Centre event is an assigned-seat theatre concert. |
| [Centre tickets](https://www.banffcentre.ca/box-office/tickets) | Ticket type, age and digital-ticket information. The guide makes no universal refund, discount or sold-out claim. |
| [Attending a performance](https://www.banffcentre.ca/box-office/attending-a-performance) | Venue-specific arrival, late seating and access needs. No blanket step-free route, assigned seat, companion or listening-device guarantee. |
| [Maps and directions](https://www.banffcentre.ca/maps-directions) | Campus approaches and current paid parking. This is the working current page; `/maps` failed retrieval. No fixed walking time or parking price copied. |
| [Fairmont Rundle Bar](https://www.banff-springs-hotel.com/dine/rundle-bar/) | Current named hotel venue and 405 Spray Avenue setting. No recurring jazz or music schedule verified. |
| [Fairmont events](https://www.banff-springs-hotel.com/experience/events-calendar/) | Actual named-event discovery. Hotel stay, dining reservation and event eligibility are separate. |
| [Roam Route 7](https://roamtransit.com/schedules-routes/route-7/) | Current seasonal fall/winter Centre route and separate festival schedule notice. No final departure, year-round service or seat promise copied. |
| [Roam Route 2](https://roamtransit.com/schedules-routes/route-2/) | Fairmont–downtown–Tunnel Mountain public route, distinct from a property shuttle. |
| [Roam Route 3](https://roamtransit.com/schedules-routes/canmore-banff-regional-route-3/) | Canmore–Banff regional leg. Exact stop, return and onward property connection remain date-specific. |

## Material source findings and how they were handled

- Rose & Crown’s general page currently mixes music starting at 10 p.m. with a separate “starts at 9pm” panel. The calendar has dated entries of different types. The guide copies neither into a fixed nightly/weekly timetable and asks readers to resolve contradictory details with the venue.
- The current Rose homepage says minors are welcome until 9:30 p.m. The article and FAQ make clear that an early meal does not grant later-show admission. No other venue inherits that rule.
- Melissa’s official Live Events page separates event poster/ticket discovery from its table booking. The replacement explicitly distinguishes those purposes instead of saying most live music needs no reservation or a table buys a show.
- Centre pages distinguish general admission, assigned seating and event-specific restrictions. As a source check, the [A Brother’s Fountain after-party](https://www.banffcentre.ca/events/music/brothers-fountain) is at CLVB ’33 with an explicit 18+ restriction. It supports the distinction, not a permanent event recommendation or a blanket Centre policy.
- The current [Laila Biali listing](https://www.banffcentre.ca/events/banff-centre-presents/banff-centre-presents-laila-biali-wintersongs) shows a 7:30 p.m. heading and an 8:30 p.m. date field. No reason for the discrepancy is assumed. The guide tells readers to resolve differing card/description times with the venue/box office and copies neither time as a current booking instruction.
- The [specific Fairmont Halloween event](https://www.banff-springs-hotel.com/events/halloween-at-the-castle/) names Rundle Bar and gives its own 18+/non-resident terms. Those event-specific conditions are not generalized to every hotel bar or concert. Search/open retrievals also differed on a sold-out banner, so no availability statement is copied.
- The old “Aurora Lounge” Sunday afternoon jazz assertion was not substantiated by current primary sources and is omitted. The guide does not declare that a venue or past performance never existed.
- No old fixed cover charges, meal/drink prices, summer-festival dates, ski-package entertainment vouchers, universal hotel shuttles, parking-after-7 claims, early-arrival seating guarantees, fabricated training/visits or personal recommendations remain in the replacement.

## Reader journey, booking purpose and static content

The reader chooses a performance format, checks an actual dated event, distinguishes doors/start/finish, chooses the ticket/table/seat, and fits dinner and transport around that anchor. The access section asks about the complete route and specific performance rather than treating a building label as an access guarantee. Winter and nearby-base advice covers the relevant public routes and complete return, with no assumed late hotel shuttle.

The guide links existing canonical nightlife, reviewed dining discoveries and après-ski guides, plus `/events/`, `/towns/canmore/` and `/car-free-banff/`. The genuine accommodation handoff is the existing `/book/banff-hotels/` comparison, with a disclosure and an explicit statement that a room does not include a show, table, voucher or shuttle unless confirmed. No new Expedia/GetYourGuide target, tracking ID or concert affiliate is created. Unrelated old daytime-tour affiliate links are not repurposed as concert tickets; the underlying original module and all its IDs are untouched.

The inherited hero is explicitly illustrative in metadata, with note: **Illustrative image; not verified as a named Banff venue, performer or current event.** No venue/performer photo identity or current-condition claim is introduced.

All substantive content is static HTML with section navigation and a comparison table. `liveMusicGuideFaqs` is the single array for four visible `details`/`summary` answers and one matching `FAQPage` JSON-LD block. HTML text is escaped; `<` is escaped in the serialized schema. The body introduces no client script, live-data fetch, widget, storage, form or synthetic `Event`/`Offer` schema.

## Focused validation and integration

`node scripts/check-live-music-guide.mjs` passes: exact canonical slug; original 28 May publication; metadata/review date and illustrative scope; valid parsed HTML; four exact visible/schema FAQs; 16 primary handoffs; seven existing internal routes and working section anchors; ticket/table/time/age/access/transport distinctions; and rejection of the inherited invented rates/schedules/experience/shuttles and any concert-affiliate inventory. Separate targeted TypeScript and source sanity checks pass.

The check reads the real original-post array for publication and route identities, avoiding another author's temporarily staged metadata import. Root's final shared-registry check remains responsible for resolved body/metadata precedence. Root should include the new full review in that registry, carry its illustrative image metadata and include the authored booking guide in generic-CTA suppression. No shared integration, full build, Git or publishing was performed by this author.
