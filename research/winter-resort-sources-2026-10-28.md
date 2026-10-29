# Canonical winter resort guide review — 28 October 2026

Scope: `src/data/winterResortOverrides.ts`. The module exports five replacement HTML bodies and matching metadata, without importing or modifying the shared post data. Root should merge the content after all legacy modules and add the metadata to the shared post-export merge.

## Delivered guides

| Existing canonical slug | Approximate words | Focus |
| --- | ---: | --- |
| `banff-skiing-guide` | 1,375 | Substantive ski-trip pillar: resort geography, season expectations, direct versus multi-day tickets, beginner bundles, Ikon shared access and blackout dates, rentals, transport, bases and realistic trip plans |
| `sunshine-village-guide` | 795 | Base versus upper-village access, gondola and lesson sequence, terrain choices, specialist freeride requirements, rental collection and gondola-dependent lodge access |
| `lake-louise-ski-resort` | 837 | Resort versus village/lakeshore geography, road/shuttle arrival, terrain and return planning, current lift names, beginner package inclusions and accommodation distinctions |
| `mt-norquay-guide` | 738 | Existing Banff shuttle, first-time package restriction/check-in order, compact resort terrain, separate night/tubing products, activity eligibility and return logistics |
| `banff-snowboarding` | 810 | Snowboard-specific first lesson, stance and rental fitting, progression, connecting routes, expert/gated terrain limits, group plans and recovery days |

All metadata review dates are `2026-10-28`. These are editorial source-review dates, not current snow or lift-status timestamps.

## Primary sources checked

| Source | URL | Evidence and application |
| --- | --- | --- |
| Sunshine current site | https://www.skibanff.com/ | Three-mountain organisation and current paths to maps, reports, lessons and tickets; no current snowfall numbers copied into evergreen prose |
| Sunshine first-visit guide | https://www.skibanff.com/plan/first-time-visitors/first-timers-guide | Base check-in/voucher collection for relevant lesson packages, gondola to upper village, lesson meeting and equipment sequence |
| Sunshine group lessons | https://www.skibanff.com/lessons/group-lessons | Tickets/rentals are add-ons, adult lesson rental helmet exclusion, upper-village meeting area and accompanying-parent access requirement |
| Sunshine rental equipment | https://www.skibanff.com/lessons-rentals/rentals/ski-snowboard-rentals | Base versus village equipment collection, equipment categories and ID/payment/waiver needs; current rates omitted |
| Sunshine freeride zones | https://www.skibanff.com/the-mountain/lifts-terrain/freeride-zones | Delirium Dive/Wild West expert terrain, transmitting transceiver, shovel/probe, similarly equipped partner, equipment competence and conditional openings |
| Sunshine lift/trail report | https://www.skibanff.com/the-mountain/mountain-report/lifts-trails-report | Live operating-detail destination; guide does not freeze an open status into prose |
| Sunshine hours | https://www.skibanff.com/the-mountain/mountain-report/hours-of-operation | Operating-hours destination; no guaranteed opening/closing time copied |
| Sunshine shuttle | https://www.skibanff.com/plan/getting-here/free-shuttle | Actual resort shuttle, distinguished from local Roam services |
| Sunshine lodge | https://www.skibanff.com/plan/lodging/sunshine-mountain-lodge-in-resort | Slope-side lodging and official stay information; package and arrival details must be confirmed |
| Lake Louise current site | https://www.skilouise.com/ | Current season announcements and operational links; scheduled dates remain conditional |
| Lake Louise access | https://www.skilouise.com/getting-here/ | Resort at Whitehorn Road, Banff/Lake Louise winter shuttle information, base road access |
| Lake Louise ski/ride | https://www.skilouise.com/explore-winter/winter-ski-ride/ | Current links for maps, operations, rental equipment and snowboard instruction |
| Lake Louise statistics | https://www.skilouise.com/explore-winter/winter-ski-ride/mountain-stats/ | 4,200 acres; current Summit Quad (removes obsolete Summit Platter directions). Avoid repeating precise lift/run counts as navigation instructions |
| Lake Louise adult/teen beginner snowboard package | https://passes.skilouise.com/en/catalogue/adultteen-full-day-group-beginner-snowboard-package-levels-1-2-age-13_1801/ | Explicit beginner-area access, snowboard equipment and helmet; this product does not establish inclusions for another lesson |
| Norquay current site | https://banffnorquay.com/ | Winter product organisation, Snow School and activity links |
| Norquay first-time ski/snowboard | https://banffnorquay.com/snow-school/first-time-ski-snowboard/ | Two-hour lesson, magic-carpet-only ticket, equipment; at least one-hour check-in lead, Snow School before rental collection |
| Norquay shuttle | https://banffnorquay.com/shuttle-service/ | Shuttle actually exists; selected-night service and changeable schedule, removes legacy no-shuttle statement |
| Norquay rentals | https://banffnorquay.com/rentals-tune-shop/ | Direct equipment/fitting destination; no fabricated rental rate or reservation promise |
| Norquay map | https://banffnorquay.com/trail-map/ | Current official map destination; no small-resort-equals-easy inference |
| Norquay conditions | https://banffnorquay.com/conditions/ | Direct current resort report |
| Norquay hours | https://banffnorquay.com/hours-of-operation/ | Current date and hours source, not a guaranteed evergreen schedule |
| Norquay night skiing | https://banffnorquay.com/night-skiing/ | Specific lit terrain and evening product. Header says opening Jan 1 2027 while body says Jan 1 2026–Mar 13 2027 at review; no exact start date asserted in guide |
| Norquay tubing | https://banffnorquay.com/tubing/ | Age four AND minimum 42 inches, separate booked activity; removes legacy all-ages guarantee |
| SkiBig3 tickets | https://www.skibig3.com/ski/lift-tickets/ | Validity and multi-resort product destination; no automatic savings claim |
| SkiBig3 grace days | https://www.skibig3.com/blog/skibig3-grace-days-how-do-they-work/ | Three ski days within five-day example; rentals retained during rest days can still be charged |
| Ikon FAQ | https://www.ikonpass.com/en/faq | Explicit seven/five days combined across Sunshine/Louise/Norquay, not per mountain |
| SkiBig3 Ikon page | https://www.skibig3.com/season-passes/ikon-pass/ | 2026/27 full/Base/Session product distinctions; Base/Session blackouts Dec 26–30 2026, Jan 16–17 2027, Feb 13–14 2027 |

## Editorial corrections and boundaries

- Removed invented first-person experience and generic local testimony.
- Removed hardcoded ticket, rental and hotel prices, guaranteed savings and parking-fill times.
- Removed world/Canada-best superlatives and guarantees about conditions or terrain safety.
- Replaced the obsolete Lake Louise Summit Platter instruction with current lift information.
- Distinguished village/lakeshore hotels from downhill ski-resort access; Fairmont Chateau is a lakeshore property.
- Distinguished resort transport from Roam, and hotel location from an actually verified shuttle stop.
- Kept resorts separate: one resort per ski day is the planning recommendation.
- Preserved full-scope planning substance in the pillar rather than a short link index.
- Kept non-skiers, parents and mixed-ability groups in the travel and access plan.
- Native `details` trip options and FAQs remain usable without client JavaScript.

## Links and verification

The module uses only the established Expedia `camref=1101l3MtWX` affiliate ID. Affiliate links have `rel="noopener sponsored"`, nearby disclosure and destination-specific search text. All resort, ticket, lesson and source links are direct information links; they do not imply an affiliate arrangement with the resorts.

All five blog slugs exist in `blogPosts.ts`; internal town slugs `banff` and `lake-louise` exist in `towns.ts`. Referenced hotel profiles exist in `hotels.ts`. Static checks confirm paired tables, lists, nav and details elements. No build, publish, fetcher, configuration or shared-data mutation was performed for this subtask.

Integration still needs the root build and rendered page checks, including final metadata/content precedence and internal anchor handling. Any live date or product detail should be rechecked before a later seasonal refresh.
