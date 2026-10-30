# Fall timing and wider fall travel — October 29, 2026

## Canonical scope and contracts

Actual resolved registry inspection at the start of this task found both guides **unreviewed** in the73-full-review registry:

| Canonical | Original publication | Initial body | Existing anchors/aliases |
| --- | --- | --- | --- |
| `fall-larch-season-banff` |2026-02-16 |~660words |no fragment IDs; no redirect or inbound aliases |
| `banff-in-fall` |2026-02-14 |~676words |no fragment IDs; no redirect or inbound aliases |

Both resolve from `src/data/blogContent.ts` after main→chunk3→reviewed-body precedence. Neither had a later full override. This task adds only `src/data/fallSeasonGuideOverrides.ts`, `scripts/check-fall-season-guides.mjs` and this record. Registration, shared metadata, source counts, workflow, verifier and publication belong to root. PR15 receipts, raw source arrays, other authors' modules, Git and live systems are untouched.

Exports: `reviewDate = '2026-10-29'`; `fallSeasonGuideOverrides`, `fallSeasonGuideMetadata` and `fallSeasonGuideFaqs` keyed exactly by the two canonicals. Each FAQ array has five entries. One keyed renderer generates visible details and one FAQPage per body. Metadata omits `date` and any other publication field; `imageIsIllustrative: true` and generic identity notes support omission of Article photographic identity. No named grove, location, capture date or current colour is inferred from either hero filename.

## Separate visitor purposes

- **Dedicated larch guide:** broad colour timing, choosing an endpoint, the transport chain, snow/group/kit preparation, photography etiquette and dependent bookings. It hands five-profile comparison to `/larch-season/`; route figures and detailed routes stay in the reviewed hiking records. It does not reproduce a predicted-peak table or claim an equivalent quieter route.
- **General fall guide:** choosing the part of September/October, Banff/Lake Louise/Canmore base tradeoffs, dated service changes, three kinds of day, town alternatives and the whole budget. It links the separate larch preparation article and reviewed three-day itinerary instead of duplicating them.

Both link `/trip-cost/` as a tool for the reader's own current CAD quotes, not evidence of market rates or seasonal savings.

## Inherited defects corrected

The larch article imposed a universal four-person larch-season requirement, conflated Healy Pass with Sunshine gondola/Meadows access, described alternate trails as quieter/equally rewarding, gave fixed starts and photography hours, and promoted a generic Banff affiliate result as a verified guided larch tour. It also presented a narrow staged colour calendar without a current year-specific basis.

The general fall article repeated the route/group errors, promised20–30% cheaper hotels, stable weather and absent summer crowds, called one week the absolute best, and prescribed mid-morning starts as assurance of daylight return. It treated changing seasonal access too broadly and gave unqualified temperature ranges as trip expectations.

The replacements preserve useful seasonal purposes while removing those unsupported promises. They use current source dates, named service distinctions and original practical planning prose; no invented personal visit, weather/crowd feed, fixed price, safety approval or annual forecast.

## Primary source inventory

All reads were public GET/research only; no reservation, transaction, account, email, advertisement or provider contact was made.

| Source | Bounded use |
| --- | --- |
| https://www.banfflakelouise.com/fall | Tourism's broad late-September to early-October larch context and September–October fall framing. This is not a route/year peak forecast or proof of quietness, stable weather or available services. Promotional savings/crowd language is not made a measurable promise. |
| https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking | Endpoint and summer-grade distinctions; Larch Valley versus Sentinel; lower-base Healy route versus Meadows; seasonal avalanche guidance. Detailed numeric profiles remain in the already-reviewed route records and planner, avoiding conflicting duplicated figures. The Lake Louise-area mid-October–mid-June advice is not relabelled a blanket closure or a safe window outside those dates. |
| https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking/etat-sentiers-trail-conditions | Current report with source dates and general tight-group-of-four **recommendation**. That guidance is distinguished from a route-specific mandatory order. No permanent Open/Caution status or current larch observation is copied into the articles. |
| https://parks.canada.ca/pn-np/ab/banff/bulletins | Native current-notice handoff. One current fetch timed out; no absence of restrictions or clear trail is inferred from that failure. The specific construction bulletin below fetched successfully, and the index was already read in the preceding same-day source task. |
| https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise | Personal-vehicle restriction on Moraine Lake Road with authorized exceptions; Park and Ride at the ski resort is separate from village/lakeshore;2026lake-shuttle season ended October12. No future2027shuttle calendar, seat, fare, wait or complete hiking access is invented. |
| https://www.skibanff.com/sunshinemeadows | Source currently says closed for summer2026 and announces **June25–September19,2027**. The guide labels those as future plans and does not imply late-September gondola availability. Meadows is separate from the lower-base Healy Pass hiking profile. |
| https://parks.canada.ca/pn-np/ab/banff/securite-safety/meteo-weather | Mountain-weather variability and the distinction between a historical table and the actual forecast. Old telephone/fixed temperature rules on the page are not copied. No numerical weather or daylight forecast is produced. |
| https://roamtransit.com/schedules-routes/lake-louise-banff-express-route-8x/ | Publisher's year-round Banff–Lake Louise identity and named village/lakeshore stops. Some FAQ season/fare text is stale, so no price or old May2026timetable is repeated. An initially tried `/lake-louise-banff-regional-route-8x/` URL failed; the actual publisher-linked Express page is used. |
| https://roamtransit.com/fares/reservations/winter-reservations/ | Current2026/27fall/winter source and dated October13schedule handoff; no Moraine Lake or ski-resort Park and Ride connection supplied by8X. Actual dates, stops, booking and return remain separate. No transfer/ticket guarantee or fare copied. |
| https://www.whyte.org/ | Native museum exhibition/programme discovery, not a fixed event, free admission or unchanged daily schedule promise. |
| https://parks.canada.ca/lhn-nhs/ab/caveandbasin | Heritage exhibits/films and visitor information. A cultural visit is kept separate from hot-pool bathing or a guaranteed indoor day. |
| https://parks.canada.ca/pn-np/ab/banff/sources-banff-springs | Dated closure from October13 to early November at review. No reopening assumed. In-person admission/operation must be checked separately; no hot-springs appointment or pool booking is invented. |
| https://parks.canada.ca/pn-np/ab/banff/bulletins/06d4ef61-a3c9-4b65-8dfc-66d056252d6c | Johnston Canyon trail/day-use/P1 closure issued October13, scheduled end December11,2026. Scheduled end is not reopening proof. The stale generic modified footer is not used as the notice's issue date. |

## Exact authored affiliate destinations retained

- Larch guide: https://www.getyourguide.com/banff-l284/?partner_id=QW960HO — honestly labelled Banff activity **search results**, not a verified larch tour, route-rule confirmation or booking.
- General fall guide: https://www.expedia.ca/Hotel-Search?destination=Banff%2C+Alberta&camref=1101l3MtWX — honestly labelled Banff accommodation **search**, without a fixed rate, room or seasonal discount.

The retained query spelling and identifiers are unchanged; no product ID, new partner, policy permission or commission rate is invented. Current internal stay handoffs use the existing named Banff and Lake Louise comparisons and town planning. They do not claim that a hotel supplies trail access or transport.

## Bounded validation

`node scripts/check-fall-season-guides.mjs` compiles the new module in memory and checks the two original raw publication dates, exact retained references, canonicals/real internal routes and jumps, substantial distinct body structures, source/date/season/transport/group/price limits, five matching visible/schema FAQs per body and illustrative hero metadata. Negative fixtures mutate unsupported peak/crowd/cheap/safe-route/start-time/guide claims, named seasonal dates, body-section gates, FAQ schema, image classification, publication fields and nested anchors.

No current registry integration is expected by this standalone author check. The surrounding reviewed larch planner, detailed Larch Valley/Sentinel author modules and other related fall articles have separate ownership and scopes. This task changes only the two assigned bodies through the dedicated new override module.
