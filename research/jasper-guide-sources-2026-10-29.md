# Jasper legacy cluster — full source review, 29 October 2026

## Bounded replacement contract

New files only:

- `src/data/jasperGuideOverrides.ts`: exports `jasperGuideOverrides`, `jasperGuideMetadata` and `jasperGuideFaqs` for exactly `jasper-national-park`, `jasper-town`, `jasper-canada`.
- `scripts/check-jasper-guides.mjs`: meaningful offline model/HTML/link/claim checks.
- This source record.

No legacy source module, hotel record, shared registry, metadata consumer, redirect, layout, image, host, account or booking is changed here. Root owns final integration and image qualification.

| Retained route | Distinct replacement intent | Original publication, retained | New review |
| --- | --- | --- | --- |
| `/blog/jasper-national-park/` | Park recovery/access decisions; exact named Five Lakes routes; seasonal activity boundaries. | 6 April 2026 | 29 October 2026 |
| `/blog/jasper-town/` | Town versus lakeside accommodation, exact kitchen category, arrival evening, meals, local transit and parking. | 8 April 2026 | 29 October 2026 |
| `/blog/jasper-canada/` | Canadian Rockies geography; Edmonton/Calgary/rail/coach approach; directional versus return trip and usable nights. | 6 April 2026 | 29 October 2026 |

All three crosslink the existing, already-reviewed `jasper-alberta` itinerary rather than reproducing its three-day body. That body's content and metadata are protected by the focused check. No alias or consolidation is proposed. Each replacement has three visible FAQs and a source/review section; all substantive content is static HTML and usable without JavaScript.

FAQ completeness follow-up: `jasperGuideFaqs` is the single model for the existing three questions/answers per slug. A private renderer generates both visible `details`/`summary`/answer paragraphs and exactly one `FAQPage` JSON-LD block per body. `acceptedAnswer.text` retains the canonical answer HTML; the Canada closure answer keeps its existing source anchor. JSON escapes `<` in the script text. The focused check parses both outputs, asserts semantic parity, checks exact model/schema strings and protects all nine original Q/A pairs and their source-link markup by SHA256 (`f38b4fc2279b759367a99719a8b417ce3e837296ee9c74609d73be96978093e7`). No factual wording changed in this follow-up.

## Current primary evidence

Sources below were read on 29 October 2026. Source pages can mix new notices and older descriptive material; the replacements distinguish dated access evidence from operating guarantees.

| Primary source | Use and qualification |
| --- | --- |
| [Wildfire-area closure order](https://parks.canada.ca/pn-np/ab/jasper/bulletins/76ecae58-8a63-480c-8304-dc903837eefd) | Issued 13 August, effective 14 August 2026. Canyon winter recreation prohibited; designated reopened corridors do not reopen neighbouring burned land. The stale footer date is not used as the order date. |
| [Park recovery](https://parks.canada.ca/pn-np/ab/jasper/gestion-management/serviceimmobilier-realty/retablissement-recovery/pc-recovery) | Summer trail recovery and continuing Cavell/Canyon closure are dated context. No next-year reopening inferred. |
| [Maligne Canyon winter page](https://parks.canada.ca/pn-np/ab/jasper/activ/experience/hiver-winter/canyon) | Closure banner controls; older guided-walk prose below it does not establish access. |
| [South-of-town routes](https://parks.canada.ca/pn-np/ab/jasper/activ/experience/sentiers-trails/sud-south?wbdisable=true) | Uses current named variants and distance bases. Table says “Emerald Loop”; descriptive prose says “Emerald Circuit.” The replacement acknowledges that naming difference, not a separate fourth route. |
| [Maligne Valley winter routes](https://parks.canada.ca/pn-np/ab/jasper/activ/experience/hiver-winter/lac-maligne-lake) | User-tracked route information and ice qualifications; no unsupported road-ski circuit. |
| [Jasper skating guidance](https://parks.canada.ca/pn-np/ab/jasper/activ/experience/hiver-winter/patin-skate) | No monitored-natural-ice or calendar-based suitability claim. No thickness threshold presented as sufficient clearance. |
| [Road restrictions](https://parks.canada.ca/pn-np/ab/jasper/visit/routes-roads), [Alberta 511](https://511.alberta.ca/) | Road-specific check rather than navigation-app authority. The road table has mixed year headings; no tentative opening dates copied. |
| [Current Parkway guide](https://parks.canada.ca/pn-np/ab/jasper/activ/itineraires-itineraries/promenadedesglaciers-icefieldsparkway) | Approximately 232 km is Lake Louise–Jasper, not Banff town–Jasper. Winter service limitations retained. |
| [Winter Parkway maintenance](https://www.parks.canada.ca/pn-np/ab/jasper/activ/experience/hiver-winter/pcghiver-ipwinter/pcg-securite-safety-ip) | Tire/chain period plus snow/ice condition qualification; maintenance and closure constraints. No fixed drive time or guaranteed detour. |
| [Parks arrival geography](https://www.parks.canada.ca/pn-np/ab/jasper/visit/rendre-gethere) | Highway 16, Parkway and rail approach distinction. Inconsistent kilometre/mile conversions on the page are not repeated. |
| [Tourism Jasper arrival](https://www.jasper.travel/travel-trade/travel-trade-getting-here/) | Edmonton/Calgary approaches and rail context; promotional elapsed travel times are not promises. |
| [Municipal transit](https://www.jasper-alberta.ca/p/transit) | October 13, 2026 schedule basis, exceptions and recovery impacts. Local/regional service is distinguished from airport/park transfers. |
| [Municipal parking](https://www.jasper-alberta.ca/p/parking) | Current annual programme and map. No fee copied or universal free-parking claim. |
| [SunDog Edmonton product](https://www.sundogtours.com/package/jasper-hinton-edson-edmonton) | Actual product and city/pickup distinctions. No departure, fare, seat or pickup availability copied. |
| [Brewster Express FAQ](https://www.banffjaspercollection.com/brewster-express/faqs/) | Its own seasonal Jasper service differs from the airport/Banff leg and winter partner. |
| [SunDog Calgary/Banff/Jasper product](https://www.sundogtours.com/package/jasper-lake-louise-banff-calgary) | The season panel still says October 18, 2025–April 30, 2026. Explicitly does not establish 2026–27 operation; current season/transfer requires confirmation. Conflicting repeated fares and old transfer-point details are not copied. |
| [VIA Vancouver–Jasper](https://www.viarail.ca/en/explore-our-destinations/trains/rockies-and-pacific/vancouver-to-jasper) | Actual rail journey/date-search handoff. No schedule frequency, duration, fare or availability promise. |
| [Marmot Basin travel information](https://www.skimarmot.com/mountain/travel-trade-toolkit/), [resort](https://www.skimarmot.com/) | Actual resort geography; local Marmot Meadows transit name is not ski-resort service. No season opening, age, price or lesson eligibility inferred. |

## Actual stay examples, not new directory reviews

| Primary property source | Exact scope |
| --- | --- |
| [The Crimson location](https://www.banffjaspercollection.com/hotels/the-crimson/location/) | 200 Connaught Drive, Jasper townsite. |
| [The Crimson rooms](https://www.banffjaspercollection.com/hotels/the-crimson/rooms/) | Named Kitchen Suite versus Studio equipment. Broader overview “galley kitchen” wording is not extrapolated to full cooking. |
| [The Crimson property](https://www.banffjaspercollection.com/hotels/the-crimson/) | Terra and pool/hot-tub maintenance qualification. No nightly rate, ranking, unrestricted facility operation or room-wide pet acceptance. |
| [Pyramid Lake Lodge location](https://www.banffjaspercollection.com/hotels/pyramid-lake-lodge/location/) | Separate lakeside base and vehicle-parking distinction; no new GPS record copied. |
| [Pyramid Lake Lodge property](https://www.banffjaspercollection.com/hotels/pyramid-lake-lodge/) | Aalto identity, with current dining confirmation. Promotions, rates, rental inclusions and blanket pet claims are not copied. |

No HI Jasper operating/accommodation claim is carried forward. Its guessed prior URL was inaccessible during research; absence of a reachable page is not treated as proof of current operation or a new closure claim. The replacements do not need this unsupported stay example. No Sawridge/current-brand assumption or Fairmont nightly range is retained.

## Material corrections and editorial decisions

- Removed fabricated personal visits/training/observations and unsupported Jasper-versus-Banff quality, crowd, wildlife and percentage-saving claims.
- Removed undated pass, hotel, meal, tour, rental and ski-ticket prices, universal annual-pass break-even advice and guaranteed seasonal value.
- Removed Maligne Canyon year-round access and recreational winter recommendations. All three articles now explain the restriction or hand off to its exact current source.
- Removed the unsupported 44 km Maligne Lake road ski claim and calendar/frozen-appearance skating inference. No equipment checklist is offered as terrain or ice clearance.
- Replaced the legacy 9.6 km Five Lakes generalisation with the publisher's named options. “Easy” on Wetland Way does not establish that the full network is flat, step-free or suitable in winter.
- Removed speculative SkyTram, cruise and other attraction dates/fees rather than borrowing historical seasons. A park, road, trail and commercial service can have different states.
- Kept a useful booking path using **Jasper** Expedia destination searches with existing `camref=1101l3MtWX`; the activity search uses Jasper and existing `partner_id=QW960HO`. Both are clearly labelled searches, carry disclosure and sponsored relations, and make no property-ID or availability claim. Southern stays hand off to the existing Banff hotel comparison.
- Added a five-night directional outline as an original example, not an asserted optimal itinerary or a second copy of the already-reviewed Jasper three-day activity plan.

## Verification and integration handoff

`node scripts/check-jasper-guides.mjs` passed: exactly three metadata/body/FAQ keys, nine unchanged FAQs with visible/FAQPage semantic parity, valid parsed HTML, non-empty descriptive native links, 23 existing internal targets/fragments, route/closure/season/category regressions, precise affiliate purposes/tags, distinct substantive bodies, retained publication dates and protected `jasper-alberta` content/metadata. Targeted TypeScript checking also passed. The script makes no network requests and performs no site build.

Protected `jasper-alberta` body+metadata SHA256 (`JSON.stringify({body, metadata})`): `e8de17369cab65c62389fee61f4853131f3bd6daf8f957061eeb4acf8411c741`.

Root must merge the new exports into the canonical reviewed-body/metadata registry, remove these three from the partial-only correction presentation, update full-review/sitemap accounting and qualify inherited images as illustrative. This module supplies no duplicate JSON-LD, tracking code or new image. Root owns integrated build/browser/production checks; local checks are not a deployment receipt.
