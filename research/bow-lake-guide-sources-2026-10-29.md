# Bow Lake lodge guides — full source review, 2026-10-29

## Owned scope and URL intent

New files only: `src/data/bowLakeGuideOverrides.ts`, `scripts/check-bow-lake-guides.mjs` and this record. No shared registry, metadata list, redirect, raw body, hotel model, layout, verifier, build or host file is changed.

Both original titles promised near-identical lodge getaways. This review gives the retained URLs distinct complete purposes:

- `num-ti-jah-lodge`: **The Lodge at Bow Lake: Rooms, Meals, Seasons & Arrival**. Current accommodation decision: exact building/category, meal format, published season, arrival, booking and alternate bases. Original publication remains **2026-03-04**.
- `numtijah-lodge`: **Former Num-Ti-Jah Lodge: Bow Lake History & Day Visits**. Operator-attributed name/history, day-use visit, café/dinner distinction, summer hiking endpoint and transport/photography planning. Original publication remains **2026-03-08**.

The full bodies cross-link directly. No redirect or new alias is proposed/applied in this implementation.

Exports are `bowLakeGuideOverrides: Record<string,string>` and `bowLakeGuideMetadata: Record<string,{title,description,lastUpdated,readTime,imageIsIllustrative,imageNote}>`, keyed exactly to those two slugs. `lastUpdated` is 2026-10-29; no publication field is exported. Root owns full-review registration, title/description merge, sitemap, counts and superseding the earlier opening-only correction labels. The frozen 215-route verifier's old thirteen-partial-guide contract will need to distinguish these two full reviews in the next release; it is unchanged here.

Both existing hero photographs have no verified identity record for this property. Metadata explicitly carries `imageIsIllustrative: true` and `imageNote: 'Illustrative stock landscape; not verified as The Lodge at Bow Lake, its rooms, or current lake conditions.'` Root should render the note/alt context and omit photographic identity from schema/social image claims as its reviewed-image contract supports. No new image is fetched or created.

## Primary operator facts rechecked

| Source | Facts used and limits |
| --- | --- |
| https://lodgeatbowlake.com/the-lodge | Current name The Lodge at Bow Lake; operator dates original building to 1922 and describes expansion, 2020 pandemic closure and refurbishment. Its explanation attributes the name change to consultation with Stoney Nakoda Elders, reporting that the former name had not been gifted and was misspelled. History is explicitly attributed; no independent etymology or invented personal experience is added. A historical room count is not used as today's inventory. |
| https://lodgeatbowlake.com/ | Current homepage advertises winter late January–early April, Thursday–Monday; separate late-May–mid-October summer/fall season. The dated October 29 check also sees Provision Co. closed for the season, with a spring 2027 return announced. That is not proof of a reopening day. Homepage describes limited non-resident dinner seating with a reservation at least 24 hours ahead. |
| https://lodgeatbowlake.com/stay | Dated 2026 summer/fall window May 29–October 9; Chalet stays advertised from winter 2027. Historic Lodge: Fireweed second floor, Whitebark third floor, Num-Ti-Jah suite fourth floor; stairs-only. Chalet includes distinct room/suite/view categories, with selected first-floor rooms described as accessible without stairs. No blanket accessibility or present completion is inferred. Standard two-night minimum has limited date-specific exceptions. No live room inventory, fixed rate or all-family age rule is copied. |
| https://lodgeatbowlake.com/connect | FAQ states no telephones, TVs or Wi-Fi. Current check-in window 3–5 p.m., no arrival after 5 p.m.; confirmation takes priority. Meal arrangements, dietary discussion, additional charges and weather/road cancellation terms require booking-level review. This is not a guaranteed transfer or late-arrival service. |
| https://lodgeatbowlake.com/dining-at-the-lodge | Advertised stay includes breakfast, packed lunch, afternoon snacks and four-course dinner. Guest meal inclusion, day-visitor dinner booking and drinks are separate decisions. No menu prices or dietary guarantees copied. |
| https://lodgeatbowlake.com/explore | Published day-use parking instructions: highway-side and access-road lots; no roadside parking; designated lake approach. Do not turn that into guaranteed winter clearance or full accessibility. Old café opening copy for the 2026 season is superseded by the homepage's explicit current seasonal closure notice. |
| https://lodgeatbowlake.com/winter | Limited-season winter stays and backcountry activity are promoted. The operator also identifies avalanche/remote-terrain hazards and a required waiver. Its marketing suggestion to cross frozen lake terrain is **not** reproduced as route advice. No included guide, equipment or ski transfer is promised. |
| https://us2.cloudbeds.com/reservation/72Jsch | Exact public Book Now destination reached from the operator FAQ's own link; provider page identity is The Lodge at Bow Lake – Banff National Park, Canada. Used as a direct native operator-linked booking CTA, with no affiliate identifier, query, invented property ID or checkout submission. |

The operator has older FAQ wording about child occupancy alongside new Chalet categories for 2027. Specific room pages also mix year-specific child details. The guides therefore require written confirmation of the chosen room, ages, beds and year rather than flattening these into a universal age/capacity statement. Selected stair-free rooms are not described as universally wheelchair accessible. No availability, booking, rate quote, conversion, payment or guaranteed reopening was verified or generated.

## Parks Canada facts and source precedence

- https://parks.canada.ca/pn-np/ab/banff/activ/nautiques-sports explicitly places **Bow Lake in the Water Preservation Zone** and lists paddling, large inflatables and motorized boating as prohibited. Both guides state the dated prohibition, rather than merely advising self-certification.
- https://parks.canada.ca/pn-np/ab/banff/bulletins/59933c9d-02a5-4ec9-a2d8-ea0d4dad6429 is the restricted-activity order, issued April 15, 2026 with start April 1 and end until further notice. It names Bow Lake in the zone. The order includes an exception for authorized on-site rental craft that remain on a waterbody; this review establishes no authorized Bow Lake rental operation. Neither guide infers rentals or tells readers to launch a personal craft. Self-certification does not override a prohibited activity.
- https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking currently gives Bow Glacier Falls **3.8 km one way, 95 m ascent, 20 m descent**, from the Bow Lake parking/access-road approach. Approximately 7.6 km is the arithmetic out-and-back, before extra walking. Older official brochures give a different profile; the current detailed online basis is named and used consistently with the reviewed trail record. These are summer hiking figures, not winter suitability or live access.
- https://parks.canada.ca/pn-np/ab/banff/activ/patinage-skating states that Parks does not monitor natural ice for safety or mark potential hazards. The former “natural skating rink” assertion is removed, with no ice crossing or thickness-based safety verdict supplied.
- https://parks.canada.ca/pn-np/ab/banff/securite-safety/hiver-winter identifies winter hazards including thin ice and avalanches, current reports and visitor-centre planning. The guides link this separate assessment instead of endorsing a summer route or operator marketing as a winter route.

## Affiliate and booking handling

The actual lodge CTA is the operator-published Cloudbeds destination above. It is a native link, not an embedded booking interface or claimed affiliate relationship. Alternate accommodation is useful for a guest needing a different room/arrival/connectivity/base: an internal `/book/lake-louise-stays/` comparison plus a clearly labelled Expedia **destination search** use the existing `camref=1101l3MtWX`. No new property ID is created, no Expedia identity for this lodge is inferred, and no GetYourGuide link or new partner identifier is introduced. Official sources are direct, non-sponsored links. The alternate affiliate search has nearby commission disclosure and `rel="noopener sponsored"`.

## Focused checks

`node scripts/check-bow-lake-guides.mjs` uses current modules and in-memory parsing only. It blocks fetch, validates exactly two complete bodies/metadata records and original publication dates, checks source/season/category/access/prohibition markers, exact operator booking identity, absence of inherited price/Wi-Fi/rental/rink/room-count/personal claims, internal-route existence, section/anchor structure, native affiliate search identifiers and disclosure, illustrative image metadata, and matching visible FAQ/FAQPage entries (five stay questions, four history/day-visit questions). Negative fixtures cover altered water permission, invented rentals, broken FAQ type, accidental publication reset, missing image scope and nested anchors. No site build, network request, file output, agent, account or host action is part of the check.
