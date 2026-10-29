# Paddling page source review — October 29, 2026

Scope: `src/pages/paddling.astro`, a focused offline check in `scripts/check-paddling.mjs`, and this note. No other content, shared metadata, redirects, live snapshots, hosting or build pipeline changed. This is source review, not confirmation of operation on a visitor's future travel date.

## Material corrections

The original page directed town canoe renters downstream past Bow Falls and called this a gentle outing. Replaced with an early explicit warning not to continue downstream beyond the town canoe docks towards Bow Falls and not to paddle through or over the falls. Independent Bow River routes and a guided scenic float launching below the falls are different outings. No channel, portage or self-rescue directions supplied.

Retained seven useful water settings (six lake comparisons plus the Bow River section) and four named river-product comparisons. Removed unsupported easy/beginner/calm/warm labels, fixed season badges, invented generic duration/transport assumptions and the claim that Kananaskis rafting is south of Banff. Removed unrelated stock photographs presented as particular lakes. All comparisons and preparation content are server-rendered and require no JavaScript.

Added current personal-watercraft restrictions, certification and inter-lake drying requirements, distinct Alberta/BC destinations, dated rental closure information, actual river bases and product-specific age/weight/grade checks. Kept GetYourGuide `partner_id=QW960HO` and Expedia `camref=1101l3MtWX`; the two affiliate calls to action explicitly say search and do not guarantee a specific operator/product or availability. Direct primary-source links are not affiliate links.

## Primary evidence

- [Parks Canada — Banff water activities and zones](https://parks.canada.ca/pn-np/ab/banff/activ/nautiques-sports): Recreation Zone includes Lake Louise, Johnson, Two Jack, Vermilion and Bow downstream of Hector Lake. Moraine's exception is on-site rental craft that remain there; Bow Lake is a Preservation Zone. Lake Minnewanka prohibits personal paddlecraft. The current certification rules require cleaning/draining/drying, 48 hours after regional use or 30 days after use outside AB/BC/YT/NWT, and a carried permit. Check the actual current permit when switching waterbodies; no same-day wet-gear lake circuit recommended.
- [Parks Canada — paddling and Bow River sections](https://parks.canada.ca/pn-np/ab/banff/activ/nautiques-sports/canotage-canoeing): the town canoe docks are the take-out before Bow Falls, with an explicit warning against continuing past them. Published independent river routes are for experienced canoeists and have current/hazard/rescue demands. The source supports cold-water preparation, fitted PFDs, unreliable communications and unsuitable pool toys; fixed lake temperature ranges and morning-weather guarantees were removed.
- [Parks Canada — Yoho restricted activity order](https://parks.canada.ca/pn-np/bc/yoho/bulletins/45b1cb4f-7cfc-4a7a-8b92-00770378ca4f): issued April 1, 2024, ends March 31, 2027; prohibits watercraft throughout Yoho except Emerald Lake rental canoes and authorised commercial operators. The generic footer modification date is not the order issue date. Expiry is not proof of future permission; page instructs checking replacement orders.
- [Parks Canada — Lake Louise and Moraine access](https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise): Moraine road restrictions, authorised exceptions and seasonal transport; no claim that a bus ticket reserves a canoe or permits personal boat carriage.
- [Chateau Lake Louise — canoeing](https://www.chateau-lake-louise.com/activities/canoeing/): explicitly closed for the season, with a planned summer 2027 return at review. Party limits/first-come arrangements are operator-specific; no fixed rate copied.
- [Moraine Lake Lodge — day visits](https://morainelake.com/day-visits/): first-come canoe rentals, no advance reservations, water-level/weather-dependent operation and a canoe season shorter than the overall lake-transport season. Published rates/hours not copied as current guarantees.
- [CRMR — canoeing](https://crmr.com/activities/canoeing/): Boathouse Trading Co. near Emerald Lake Lodge supplies canoe equipment. Source used for rental location, not a claim that rentals are operating today.
- [Banff Canoe Club](https://banffcanoeclub.com/): Wolf Street/Bow Avenue dock; currently closed for the season with 2027 messaging. No precise reopening date inferred. Rental area, route and return instructions must come from the actual operator.
- [Banff Adventures — Hoodoo scenic float](https://www.banffadventures.com/things-to-do/float-trips/): minimum age 2, sightseeing product departing below Bow Falls near the golf course, return shuttle to its base. The storefront is not the raft launch. An internal return shuttle does not establish hotel transport or transport between bundled activities. No claim that every child/person is eligible or that the trip operates today.
- [Chinook — Kananaskis](https://chinookrafting.com/tours/kananaskis-river/): Class 2–3, minimum age 5, self-drive only to Highway 1A base near Nakoda Lodge. Current page says 2026 finished and advertises 2027 plans. Future dates/rates not copied.
- [Chinook — Horseshoe Canyon](https://chinookrafting.com/tours/horseshoe-canyon/): distinct Bow River whitewater product, Class 3–4, minimum age 12, self-drive only to the same operator base. No universal swim rule or participant suitability asserted.
- [Wild Water — Whitewater Exciter](https://wildwater.com/kicking-horse-rafting-trips/whitewater-exciter/): that exact product publishes minimum age 12 and 90 lb / 41 kg. Gentler products have different eligibility; these numbers are not transferred to other products/providers.
- [Wild Water — directions](https://wildwater.com/getting-here/): all trips depart River Base, 2750 Beaverfoot Road, Golden, BC; Canmore is its administrative office, not the meeting point. Base-to-river transfers do not imply Banff hotel pickup.

## Bounded follow-up outside this change

Read the current final body merge in `src/pages/blog/[slug].astro` (main, content3, then reviewed overrides), filtered existing blog redirect aliases, and inspected currently selected canonical bodies. The following concrete contradictions remain outside the authorised paddling-page scope:

- `/blog/banff-boundary-lodge`: says Bow Lake has “perfect conditions for paddling” and canoe rentals at the lodge. Current Banff water zones prohibit personal paddling there; the named-property/rental claim also needs separate verification.
- `/blog/banff-teen-activities`: calls Two Jack/Johnson “warm enough in summer to fall in without suffering” and asserts lakeside rentals. Cold-water and provider claims need replacement.
- `/blog/two-jack-lake-guide`: describes calm water as ideal for craft, encourages bringing/renting a vessel without the current certification conditions, and calls Johnson Lake “warm-water swimming.” It needs a complete water-rules and cold-water review.
- `/blog/romantic-getaway-banff`: retains a fixed Moraine canoe rate and calmest-morning guarantee; `/blog/fall-banff-itinerary` assumes a Moraine canoe outing without the operator's narrower season.
- `/blog/summer-banff-itinerary`: still says “Shuttle or drive to Moraine Lake” without explaining year-round personal-vehicle restrictions. Other lake itinerary/access articles have similar generic season statements and should be reviewed in their own bounded pass.
- `/blog/jasper-alberta`: includes Lake Minnewanka as a Jasper-area paddling/swimming example with an invented personal training anecdote and broad rental season. Geography, current permissions and operator claims need review.

No other files were edited to repair these follow-ups. The fully reviewed `/blog/moraine-lake-guide` and `/blog/lake-louise-complete-guide` already distinguish lake permissions and are linked from this page.

## Focused verification

`node scripts/check-paddling.mjs` checks the actual page's Astro transform; seven water settings and four river products; the falls warning and below-falls float distinction; Moraine/Minnewanka/Yoho restrictions; certification/drying and dated closure information; operator age/weight/self-drive/base contracts; absence of obsolete warmth/route/rate claims; complete no-JavaScript content; unique anchors/existing internal routes; direct HTTPS sources; and both affiliate IDs/search disclosures. This check makes no network requests and no live-success claim. Root owns final cached build and release verification.
