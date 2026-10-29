# Cycling planner and three canonical guide reviews — 2026-10-29

## Bounded ownership and integration

Changed `src/pages/biking.astro`; added `src/data/cyclingPlanning.ts`, `src/data/cyclingGuideOverrides.ts` and `scripts/check-cycling-planning.mjs`. Root owns shared blog body/metadata imports. No BaseLayout, BlogLayout, shared metadata/config/CI, trail-audit data, winter fat-bike override, activity record, Git, full build, host, account or publishing operation is part of this handoff.

Exports:

- `cyclingRoutes`: nine explicitly scoped activity listings, with separate optional `summer` / `winter` profiles, publisher cycling grades, distance basis, endpoints, surface, direction/reverse/return/transport notes, restrictions and evidence.
- `cyclingReviewedAt = '2026-10-29'`; `cyclingSources`; season, bike and direction options.
- `assessCyclingPlan({routeId, season, bike, direction, date?})`: pure assessment returning `route`, `profile`, `errors`, `restrictions`, `notes`, `direction`, `label`, `documented`. `documented` is a filter of published profile/permission evidence, never a live-open or suitability verdict. Unknown inputs fail closed. Optional date checks the recurring Minnewanka prohibition only, with calendar validation; no current conditions, pace, wind, daylight or safe start is calculated.
- `validCyclingDate` / `minnewankaCyclingRestricted`: calendar and inclusive annual-boundary helpers.
- `cyclingGuideOverrides: Record<string,string>` and `cyclingGuideMetadata` with exactly `banff-legacy-trail`, `banff-mountain-biking`, `spray-river-trail`. Metadata matches the established title/description/lastUpdated/readTime shape and contains **no original date override**. Existing publication dates remain 2025-12-26, 2025-12-14 and 2025-12-25 respectively.

## Current primary sources rechecked before implementation

1. [Parks Canada cycling rules](https://parks.canada.ca/pn-np/ab/banff/activ/cyclisme-biking): designated routes, road controls, shared-trail responsibilities and separate cycling disciplines. No blanket shoulder quality, all-trails-open summer claim or universally safe/beginner claim is retained.
2. [Banff summer mountain-bike profiles](https://parks.canada.ca/pn-np/ab/banff/activ/cyclisme-biking/velomontagne-mountainbiking/banff), also readable through [the publisher's www host](https://www.parks.canada.ca/pn-np/ab/banff/activ/cyclisme-biking/velomontagne-mountainbiking/banff). The bare host timed out during one refresh; the publisher's normal www page served the complete profiles, and current search indexing corroborated them. This is public primary content, not a live-open report.
3. [Detailed Legacy guide](https://parks.canada.ca/pn-np/ab/banff/activ/cyclisme-biking/cyclismeroute-roadcycling/heritage-legacy): 26.8 km corridor segments **excluding the 2.2 km town connection**; segment table and start options. The summer bike inventory's 29 km full-corridor figure is explained alongside that basis. The current page includes a winter warning from first fall snow until spring maintenance: no snow/ice clearing, possible plow debris, gates, ice and deep snow. A static month is not an opening promise.
4. [Current e-bike restricted-activity order](https://parks.canada.ca/pn-np/ab/banff/bulletins/8942f86e-3565-4b9a-a424-7c86d7c97701), issued 2025-03-28, until further notice, linked by the current [e-bike page](https://parks.canada.ca/pn-np/ab/banff/activ/cyclisme-biking/veloselectriques-ebikes). This controlling order contains more precise segment boundaries than a generic surface-based permission statement. It explicitly prohibits **all bicycles**, electric and non-electric, on Tunnel Mountain Summit, Hoodoos Interpretive Trail and the named corrals connectors. Named pedal-assist exceptions require the complete equipment definition (500 W, assistance ceasing with pedalling, cut-off at 32 km/h on level ground, specified start safety mechanism). Healy Creek's exception stops at Brewster junction; it does not extend to Sundance. Marsh Loop is not an exception.
5. [Winter fat-bike profiles](https://parks.canada.ca/pn-np/ab/banff/activ/cyclisme-biking/veloniege-fatbike): activity-specific winter endpoints, firm-snow guidance, 2.5 cm rut threshold, classic-track etiquette, equipment and winter hazards. Tunnel winter fat-bike network is not the summer campground loop or the 8 km ski network. Winter Minnewanka profile ends at Aylmer junction, rather than the full summer boundary destination.
6. [Winter ski/corridor information](https://parks.canada.ca/pn-np/ab/banff/activ/skidefond-xcski/banff): explicit winter Spray River West bicycle prohibition; West ski figures, separate 19 km winter Goat/Spray profile and avalanche paths 4.5–5 km from the West trailhead. A summer loop or a ski grooming lane does not authorize bikes.
7. [Minnewanka annual restriction](https://parks.canada.ca/pn-np/mtn/ours-bears/gestion-management/ours-bears/minnewanka): cycling prohibited beyond Stewart Canyon Bridge **July 10–September 15 inclusive annually**. Hiking group-of-four rules do not create a bicycle exception. Outside the window, current bulletins still control.
8. [Current summer hiking profiles](https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking): Spray East 5.6 km / West 5.7 km one way with their hiking elevation figures. These differ from the published cycling bank figures; the Spray article labels each activity instead of silently mixing them. Existing reviewed hiking data is preserved.
9. [Roam transportation policy](https://roamtransit.com/about-us/transportation-policies/): bike spaces first-come, fit/capacity and vehicle dependent, additional interior carriage conditional, drivers can decline, passengers load their own bikes. No reserved bike space, final return or delivery to upper Goat Creek/Nordic Centre is inferred from a passenger journey.
10. [Town of Banff cycling guidance](https://banff.ca/1298/Share-the-Road): helmets for pedal-bike riders/passengers under 18; electric/power-assisted riders/passengers all ages. Shared street/path behaviour remains relevant. No provider-specific rental eligibility is invented.
11. [Alberta Parks Goat Creek Day Use](https://www.albertaparks.ca/parks/kananaskis/spray-valley-pp/information-facilities/day-use/goat-creek/): Spray Valley Provincial Park start above Canmore, its own access and advisories. Provincial-side e-bike permission does not override Banff's restricted-activity order. No current pass fee is copied.
12. [Alberta Parks Canmore Nordic Centre](https://www.albertaparks.ca/parks/kananaskis/canmore-nordic-centre-pp/): separate provincial activity/trail inventory and current reports. At review it also displayed ongoing fireguard access impacts and a bear warning; no evergreen body promises all trails open. The new mountain-bike guide directs readers to its current activity map rather than an unverified “Evan-Thomas bike park”, generic Highline distance or blanket ski-network bike access.
13. [Wilson Mountain Sports contact](https://www.wmsll.com/contact.html): Samson Mall, 101 Lake Louise Drive, **Lake Louise**, not Bear Street Banff.
14. [Banff Adventures contact](https://www.banffadventures.com/plan-your-trip/contact-us/): **211 Bear Street**, not Banff Avenue. Provider range, rates, inclusions, terms, meeting points and transfers remain quote-specific.

All sources were read/rechecked 2026-10-29. Editorial review dates do not represent a provider observation, trail update or operation confirmation.

## Nine-listing route/profile inventory

| Listing | Summer profile | Winter profile | Pedal-assist treatment / material scope |
| --- | --- | --- | --- |
| `legacy-trail` | 29 km full corridor including town connection; Easy; paved paths/roadways | No prepared winter profile; explicit unmaintained snow/ice warning | Named exception; choose actual start. Detailed 26.8 km basis excludes town connection. No guaranteed wind or effortless direction. |
| `sundance` | 3.7 km one way to racks; Easy; paved | 3.7 km one way to racks; Easy | Named segment; all bikes stop before hiking-only canyon; no Marsh/Healy extension inferred. |
| `tunnel-campground` | 6.4 km loop / 70 m gain in cycling source; Easy | This summer circuit is not presented as the winter route | Named maintained network/loop with express all-bicycle exclusions. Hiking source 6.3 km/110 m remains separate and unchanged. |
| `tunnel-winter` | No summer profile for this winter network listing | 3.4 km trails + separate 2.5 km loop; Easy | Ordinary fat-bike profile reviewed; exact assisted winter segments deliberately remain a confirmation check. No automatic transfer of summer permission or ski loops. |
| `spray-east` | Cycling 5.7 km one way; Easy | Fat bike 5.7 km one way / 135 m gain / 80 m loss; Easy | Not a pedal-assist exception. Winter East return is separate from prohibited West. |
| `spray-west` | Cycling 5.6 km one way; Easy | Bikes explicitly prohibited | Not a pedal-assist exception. East/West combined 11.3 km profile does not supply the final connection between different town-side starts. |
| `goat-creek` | 18.7 km one way; Moderate; rolling doubletrack | This planner does not turn the separate 19 km ski profile into a winter bike exit | Not a Banff pedal-assist exception. Reverse from upper Goat Creek towards Banff descends much of the way; not “east” or continuously downhill. Arrange transport; town bus is not upper trailhead transfer. |
| `rundle-riverside` | 13.9 km one way; Difficult; extensive rough/rooty singletrack, then doubletrack | No reviewed winter profile | Not a Banff pedal-assist exception. Nordic Centre endpoint not downtown Canmore; no easier-Legacy substitution. |
| `minnewanka` | 29.4 km one way full corridor; Moderate with strong terrain/fitness/exposure warnings | 7.8 km one way to Aylmer junction; Moderate | Not a pedal-assist exception. Recurring July 10–September 15 prohibition beyond bridge checked inclusively; no live-open conclusion outside it. |

Parks cycling elevation figures are not used to manufacture a travel time, readiness score, safest route or latest departure. Direction advice preserves the actual endpoints, and loops/networks never receive invented out-and-back totals.

## User-visible behaviour and photographs

All nine route cards, both seasonal profiles where reviewed, direction/return/transport details, source links and constraints are present in SSR HTML. Controls are progressively enabled by JavaScript; without it the comparison remains readable and a noscript explanation is visible. Filters compare route, season and bike type. Selected routes show a direction preview and explicit blocking/confirmation reasons even when the filter has no matches. Date errors, result count, empty state and reset are accessible; changing a date does not fetch a current trail state. A selected “all” context clearly identifies the summer/unassisted or winter/fat-bike preview used.

The cycling hero retains the existing stock URL but visibly says illustrative and uses non-location-claiming alt text. Route cards use factual text rather than stock route photographs. No route photo schema, invented map line, exact coordinates or hidden observation feed is added.

The three inherited local blog hero images have **not** been independently verified by this source review. Root was asked to preserve illustrative treatment/omit route photographic identity when wiring shared BlogLayout behaviour. No shared layout file is changed in this pass.

## Affiliate and metadata preservation

Only the established affiliate IDs are used: Expedia `camref=1101l3MtWX` and GetYourGuide `partner_id=QW960HO`. Links are explicitly labelled searches, disclose possible commission and use `rel="noopener sponsored"`. No availability, specific product, operator affiliation, included transfer or current price is inferred. No affiliate link was opened for a conversion, and no booking/account action occurred.

The three article bodies have distinct intent: Legacy segments/paved day and return; mountain-bike terrain/permissions/long-ride comparisons; Spray banks and walking/cycling/ski/winter distinctions. The existing reviewed fat-biking article and activity record are preserved, as are all trail audit records and URLs.

## Focused validation

`node scripts/check-cycling-planning.mjs` passes. It exercises the exported route model, unknown/tampered inputs, exact Minnewanka annual boundaries over different years, real calendar validation including leap years, e-bike exclusions, winter East/West split, conservative assisted winter scope, direction and endpoint profiles, no automatic loop/network totals, and actual bundled browser-script filters, selected-route restriction/empty state, invalid dates, reset and focus on submit. It target-compiles the Astro page and checks exactly three complete article bodies/metadata entries, preserved original publication dates and affiliate IDs, no nested anchors and complete source-review sections. No full site build is run.

The preceding trail source and directory checks are run as preservation regressions, not a new trail edit or conditions assessment. Root owns final combined build, browser QA, metadata/body integration and publication.
