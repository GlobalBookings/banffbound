# Banff nightlife guide: full review, October 29, 2026

## Scope and integration

- Replaces exactly `banff-nightlife-guide`. Its original publication date is **2026-02-10**, retained in `blogPosts.ts`; the metadata override sets only the separate review date, title, description, reading time and image qualification.
- Exports `nightlifeGuideOverrides`, `nightlifeGuideMetadata`, `nightlifeGuideFaqs` (one array) and `reviewDate` from `src/data/nightlifeGuideOverrides.ts`.
- Distinct intent: choose an evening format, combine it with a meal and plan the complete return. The body links to the specialist music, reviewed dining and après-ski guides rather than duplicating lineups, restaurant inventories or resort arrival advice.
- Imports the root-owned `eveningPlannerHtml` from `./eveningGuideMarkup` and includes it once after the introduction/navigation. Its five formats and progressive controls remain root-owned. This author pass does not certify client interaction behaviour.
- The original hero is not verified as a venue or event. `imageIsIllustrative: true` and a generic `imageNote` require a visible qualification and omission of photographic identity from Article schema through the existing layout contract. No stock origin or licence is asserted.
- The hotel handoff is the internal `/book/banff-hotels/` shortlist. Official venue and transport links are native, non-affiliate links. No new affiliate ID, property ID, conversion, reservation or account action is introduced.

## Primary evidence checked

### Dancing identity and admission

- https://www.dustybootbanff.com/ — current public-facing Dusty Boot Dance Hall & Saloon identity; **120 Banff Avenue**, **18+** condition, saloon/dance-hall, food and music format. Exact advertised closing time is deliberately not generalised to Banff nightlife.
- https://www.dustybootbanff.com/live-music-specials — different music/dancing/karaoke sessions. The guide links the programme without reproducing recurring prices, schedules, age exceptions or availability.
- https://www.banffcollective.com/contact-us — hospitality group lists The Dusty Boot at **120 Banff Avenue**; the underlying business mailing record retains Dancing Sasquatch LTD. This is evidence for the current venue/address, not an independently verified rebranding timeline. The old name is mentioned only to direct readers to the current operator.

### Bowling, pub music and audience rules

- https://www.highrollersbanff.com/ — **110 Banff Avenue**, separate dining and bowling reservation routes, no minors after **10pm**, and payment/cancellation conditions for bowling. The article tells younger parties to finish before the cutoff and check the session directly. It does not assert universal child admission, supervision, a quiet room, refunds or a lane available now.
- **Source conflict deliberately omitted:** the same High Rollers page displays weekday bowling promotion windows of **3–5pm** and **4–6pm** in separate blocks. No rate, promotion window or savings appears in this guide.
- https://roseandcrown.ca/events/ — dated calendar mixes bands, DJs and other event types. The article uses the dated listing rather than copying a universal performance time or claiming a particular band plays every weekend. It does not copy the homepage’s varying general nightlife start-time wording.
- https://www.banffcentre.ca/events — current event programme; event and venue must be selected individually. No universal all-ages claim or guaranteed show availability.
- https://www.banffcentre.ca/box-office/tickets — audience ticket requirement with the limited outdoor Shaw Amphitheatre exception for children aged one and under; assigned/general-admission distinction; audience suitability and restrictions vary by performance. FAQ wording and visible guide draw on those specific distinctions.
- https://www.banffcentre.ca/box-office/attending-a-performance — arrival/venue guidance and production-dependent late seating. Venue access differs, so the guide sends readers to the actual venue and Box Office rather than declaring all campus buildings accessible.

### Return journey, winter and base implications

- https://www.banffcentre.ca/maps-directions — campus uphill from downtown, named arrival approaches, paid campus parking, map and access advice, and Route 7 reference. No exact walk time, parking rate, taxi response or guaranteed accessible connection is copied.
- https://roamtransit.com/schedules-routes/ — current local and regional routes, with service updates and timetable links. The guide supplies no last-bus time or blanket late-night coverage claim.
- https://roamtransit.com/schedules-routes/route-7/ — October 5, 2026 fall/winter seasonal service notice and separate October 31–November 8, 2026 festival schedule. The body dates the seasonal-service fact to the review and directs readers to the actual event timetable; it does not imply year-round service or an evening departure on every day.
- https://roamtransit.com/schedules-routes/canmore-banff-regional-route-3/ — Canmore–Banff journey, actual stops/direction/date needed. No universal return hour or connection to every Canmore property is asserted.
- https://roamtransit.com/schedules-routes/lake-louise-banff-express-route-8x/ — Lake Louise–Banff express, date/direction/reservation requirements and onward address must be checked. Village, lakeshore, resort and rural properties are not treated as one endpoint.
- https://roamtransit.com/about-us/transportation-policies/ — transfers depend on schedules and delays; not every connection aligns. The guide does not promise held buses or imply ski/hotel transport covers a nightlife return.

The ordering of meal, activity and return journey is original planning advice, not a quoted operator itinerary. Warm layers, suitable footwear, saving directions, an agreed non-drinking driver, and checking access needs are practical preparation choices; they are not a safety, admission or service guarantee.

## Legacy claims removed from this full body

The raw guide ranked venues as an “undisputed king”, described packed dance floors and local-worker habits, presented Wild Bill’s as a current default, claimed most bars do not charge cover, supplied a general 2am closure, asserted comparative drink prices/crowds, and said visitors would not need a car or taxi because Banff is walkable. The replacement removes those unsupported descriptions and blanket rules. It does not invent a visit, a guaranteed late food stop, queue, shuttle, taxi, price, age exception or opening.

## Focused validation

`node scripts/check-nightlife-guide.mjs` checks the one-body/metadata contract, original publication date, substantial authored prose, exact shared-planner inclusion/order, single-array visible/schema FAQ parity, dated source and current venue/admission markers, existing internal routes, honest native links and illustrative-image metadata. Negative fixtures cover a restored old venue claim, altered age cutoff, fabricated visit/price/transport claim, publication reset, missing source/planner/FAQ and nested links. It performs no network call, site build or file output.

Remaining legacy bars/clubs aliases and other unreplaced bodies are outside this three-guide batch. This full review does not make their old schedules, venue identity or crowd claims current.
