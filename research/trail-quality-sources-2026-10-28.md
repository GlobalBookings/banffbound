# Trail directory, detail and map quality review

Reviewed 28 October 2026 on `codex/site-quality-seo-2026-10-28`. Scope: `src/data/trails.ts`, `src/pages/trails/[slug].astro`, `src/pages/trail-map.astro`, new `src/data/trailPlanning.ts` and this note. No applicable `AGENTS.md` was found in the repository or ancestor paths checked. No shared sitemap, CI, fetcher, polyline source, build output or live snapshot was edited. No build or publishing was run.

## Inventory and concrete consumer problems

The original dataset had **80 records**: 73 hardcoded `open`, 4 `caution`, 3 `closed`; all 80 also had parking-capacity figures and summer/winter crowd ratings. Dates were historic March/June values with no expiry. There were 17 `year-round`, 53 `summer` and 10 `winter` classifications. These were permanent guide records, not a current conditions feed.

The detail page rendered those statuses as current, showed parking capacity and crowd ratings, asserted a vehicle was required whenever its transit Boolean was false, and defaulted a missing status to `open` in its client script. It also generated a “Should I Hike Today?” weather-based numeric verdict and a fixed-MST sunrise/latest-start calculation. These could not establish route suitability, avalanche exposure, access or a safe turnaround.

The detail map selected any GIS feature whose first coordinate fell within a loose latitude/longitude box approximately two kilometres from the record, then presented those lines in the trail's map. Proximity is not route identity. The global map drew all GIS features without verified association, had undated status filters/dots and suggested every listing was in Banff National Park with free/public-access schema claims. The committed GIS feature collection was empty at inspection, but retaining that logic would become misleading when populated.

The map's area breadcrumb query was not applied to filters, and opening a map after filtering reset its markers to all records. Both interactions are corrected. Permanent statuses, fabricated parking counts and crowd ratings are removed from all records; explicit `status: 'unknown'` is retained for compatibility so other consumers cannot fall through to `status || 'open'`. The owned views do not render that field as operating information.

Other consumers inventoried but not edited: `src/pages/quiet-trails.astro` imports these records and has a separate synthetic crowd model; `src/pages/alternatives.astro` combines them with its own alternatives dataset. Their owners need to use `isDirectoryTrail` and independently review claims originating in those pages. Dataset sanitisation does not validate those separate models.

## Current primary sources and priority decisions

| Source | Verified application |
| --- | --- |
| https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking | Current unified Banff hiking inventory, precise route/endpoints and source figures for the priority Banff records. Older regional links redirected to a generic activities page and were replaced. |
| https://parks.canada.ca/pn-np/bc/kootenay/activ/randonnee-hike/jour-day | Current Stanley Glacier and Marble Canyon figures and Kootenay location, replacing the Banff-area source and Alberta assumption. |
| https://www.banfflakelouise.com/experiences/stanley-glacier-trail and https://www.banfflakelouise.com/experiences/hike-lake-louise-lakeshore | Official tourism map centres used only to correct clearly displaced Stanley Glacier and Lake Louise indicative listing pins. Its calendar-style Open/Closed labels and older route figures were not adopted. |
| https://parks.canada.ca/pn-np/bc/kootenay/activ/burgess/stanley | Distinguishes a separately reserved guided fossil programme from the independent Stanley Glacier hike; confirms Highway 93 South access. |
| https://parks.canada.ca/pn-np/ab/banff/bulletins/06d4ef61-a3c9-4b65-8dfc-66d056252d6c | Johnston Canyon trail/day-use/P1 closure issued October 13, 2026, with scheduled end December 11, 2026. Dated notes link to the source; no automatic or guaranteed reopening is inferred. |
| https://banff.ca/654/Bow-Falls-Trail | Bow Falls was absent from the original dataset. Added its 1.2 km one-way pedestrian route from Bow River Bridge, Town estimate of 20–25 minutes one way and winter clifftop closure. The page's apparent “10 miles elevation gain” typo was not copied; elevation is left for the official map. |
| https://parks.canada.ca/pn-np/ab/banff/activ/raquette-snowshoeing/lakelouise | Designated winter lakeshore route, falling-ice/avalanche warnings, tea-house route winter exposure and distinction between shoreline and lake-ice travel. |
| https://parks.canada.ca/pn-np/ab/banff/activ/skidefond-xcski/banff | Current Cascade Valley, Spray River West, Tunnel Mountain, Healy Creek and Goat Creek descriptions, specific endpoints, snow-dependent track setting and Spray River avalanche-path warning. |
| https://parks.canada.ca/pn-np/ab/banff/visit/les10-top10/louise | Lake Louise/Moraine Lake access, seasonal shuttle and winter/spring tea-house route cautions. |
| https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise/~/-/media/4a80e3eb362e49e09e139866ca506327.ashx | Official 2024 Lake Louise hiking map for the retained Rockpile figures; publication age is identified, and current road/transport access is checked separately. |
| https://parks.canada.ca/pn-np/ab/banff/visit/fermetures-closures | Seasonal driving restrictions, including personal vehicles on Moraine Lake Road and Golf Course Road winter driving. No driving restriction is converted into permission for another activity. |
| https://roamtransit.com/schedules-routes/lake-louise-banff-express-route-8x/ | Route 8X serves village and lakeshore; date-specific current schedule/reservation check required. Its embedded FAQ contained an already-expired schedule, so no frequency or future operating date was copied. |
| https://roamtransit.com/schedules-routes/johnston-canyon-regional-route-9/ | Current Route 9 source link; service is conditional on actual date/operation and never overrides a canyon closure. No old winter PDF is represented as the 2026–27 timetable. |
| https://parks.canada.ca/pn-np/bc/kootenay/activ/randonnee-hike/etat-sentiers-trail-conditions | Correct Kootenay report for Stanley Glacier and Marble Canyon. Current conditions are linked rather than copied into permanent records. |

Important findings and source conflicts:

- **Peyto Lake Trail is officially listed.** The full current unified page includes the difficult shore route: 1.3 km one way from Peyto Lookout, 30 m gain, 240 m loss, about two hours return. It remains at the stable `peyto-lake-shore` slug and is distinct from the short lookout route. An early provisional concern that it was unofficial was withdrawn after reading the complete inventory. The lookout approach is explicitly additional planning, not a supplied off-trail descent or verified route line.
- **Stanley Glacier:** the current Kootenay page lists 4.9 km one way, 405 m gain and 115 m loss. Older brochures/pages list different distances (including 4.2/4.4 km). The current page governs this record; all figures are attributed planning estimates. Location is Kootenay National Park, British Columbia.
- **Johnston Canyon:** the current unified guide gives Lower Falls 1.1 km one way / 85 m gain / 55 m loss and Upper Falls 2.4 km / 215 m / 125 m. Additional viewpoints require extra distance. The current closure is a dated source notice, not an undated status badge.
- **Lake Louise Lakeshore:** retained 2.3 km one way; removed the blanket flat/ice-walking claim. The current summer page reports 175 m gain / 75 m loss; the winter page reports 175 m / 25 m; older brochures say minimal. Seasonal source context is visible rather than inventing one universal flat profile.
- **Lake Agnes:** current guide confirms 3.9 km one way / 495 m gain / 80 m loss. **Plain of Six Glaciers:** current page gives 5.9 km one way / 595 m / 250 m, while older brochures give 5.8 km. Summer tea-house services are conditional. Official winter warnings identify avalanche exposure on these routes, including Mirror Lake; summer trail grade is not a winter recommendation.
- **Winter variants:** removed any promise that Lake Louise freezes safely by a calendar month, that Parks Canada provides a maintained path over lake ice, or that a summer Parks shuttle provides winter transport. Spray River's old loop became the explicitly sourced West out-and-back with its stable slug retained; Healy Creek's endpoints and distance were corrected. Current Tunnel Mountain network length is 8 km across all loops, not a guaranteed prepared 5 km route.
- The current unified page calls the former Marsh Loop listing **Marsh Trail**, 1.5 km one way / 15 m gain / 20 m loss; the stable `marsh-loop` slug is retained with the correct endpoint-based description. Fenland is 1.9 km / 20 m gain in that page. Summer Spray River East/West figures differ from the winter guide, so seasonal profiles stay separate. Bow Glacier Falls is 3.8 km one way / 95 m gain / 20 m loss. Goat Creek's official profile is displayed with a direction check rather than preserving an invented downhill-only profile.
- **Golf-course ski legacy:** a Parks-groomed 5 km beginner loop and promised elk encounters were not verified in the current official ski inventory. Its stable page remains as an explanatory legacy listing with no invented distance, ski trailhead or route marker. It has `directoryEligible: false`, `routeVerified: false`, page `noindex`, and no TouristAttraction schema. Root must exclude this noindex URL from the shared sitemap and filter it in other directory consumers; no redirect is invented.

## Resulting model and display

There are **81 retained records** after adding Bow Falls, with **80 eligible directory listings**. All original IDs/slugs remain. `Trail` now supports optional `park`, `province`, `reviewedAt`, `sourceUrls`, `accessNote`, `winterNote`, `currentNotice`, `directoryEligible` and `routeVerified`. Existing optional legacy fields remain in the interface for consumer compatibility but no historical conditions/capacity/crowd values are exported.

`trailPlanning.ts` provides `isDirectoryTrail`, `trailSeasonLabel`, `trailPark`, `trailReportUrl` and `trailBulletinsUrl`. `year-round` is displayed as a multiple-season description requiring a current route check, never as an opening guarantee. Kootenay records use the Kootenay report/bulletins and British Columbia schema region. Transport false/unknown is no longer converted into a vehicle-required claim. Existing affiliate identifiers were preserved; none appeared in these assigned files and none were added.

Both maps display indicative listing-area markers only. Final coordinate review found inherited Stanley Glacier and Lake Louise pins displaced from their named starting areas, so those were corrected from official tourism map centres. Other inherited points have not been independently verified as exact trailheads; all visible map copy identifies general destination areas and explicitly disclaims trailhead-coordinate, parking-entrance and route-line accuracy. The maps do not import the shared GIS dataset, associate nearby lines by distance, or draw polylines. The unverified golf-course listing supplies no marker. Official route maps and signs remain the navigation source. The detail page no longer calls OpenWeather, exposes a public weather key, issues a numeric hiking verdict, calculates daylight or provides a generated safe latest start.

## Focused checks and practical limits

Passed: TypeScript transformation/import of data and helper; uniqueness and preservation of all original slugs/IDs; 81 unknown statuses and no condition/parking/crowd payloads; finite indicative coordinates; all priority metrics, province/report identity and winter distinctions; both Astro compiler transforms; and `git diff --check`.

Executed the actual map client script against offline DOM/Leaflet stand-ins. Verified area query selection, filtering before map load, matching markers after load, season/area/search combinations, clear/reset, slug-based detail links, map reopen, and indicative marker-only detail behaviour. A `polyline` call was configured to fail the check, and none occurred. Only expected Astro inline-script hints remain. No full site build or external map/API calls were used in these checks.

This was a full inventory and removal of unsupported operating/parking/crowd assertions, plus a focused primary-source pass on the priority records and related high-risk winter/transport copy. It is not a claim that every inherited route figure, landmark or historical detail across all 81 records was individually re-surveyed. Current source reports, closures, weather, route maps and the user's actual capabilities still govern trip planning.

### Independent review follow-up, 29 October 2026

The excluded golf-course legacy record still carried an inherited `Roam Route 1` field, and the detail template rendered transit text even when `routeVerified` was false. Removed that unsupported field and made the transport paragraph explicitly withhold trailhead/transport directions for every unverified record. This is a defensive rendering rule: restoring a transit field alone cannot turn an unverified legacy listing into journey advice. `node scripts/check-trail-directory.mjs` exercises the actual exported record and the actual template expression with a deliberately injected unsupported route; it also checks documented-route and missing-data behaviour. No full site build was run for this follow-up.

Goat Creek/Spray River also needed explicit jurisdiction context: the Canmore-side Goat Creek Day Use is in **Spray Valley Provincial Park**, while most of the through route is in Banff National Park. Checked the current [Alberta Parks day-use page](https://www.albertaparks.ca/parks/kananaskis/spray-valley-pp/information-facilities/day-use/goat-creek/) and [Alberta Parks Goat Creek route/report page](https://www.albertaparks.ca/parks/kananaskis/kananaskis-country/advisories-public-safety/trail-reports/canmore-and-area/goat-creek/) against the [Parks Canada winter route](https://parks.canada.ca/pn-np/ab/banff/activ/skidefond-xcski/banff) on 29 October 2026. Added an explicit mixed-park label, Alberta endpoint source links, and a requirement to check access/advisories at both ends. No displayed status from the Alberta page, fixed access assurance or alternate numeric profile was copied. The existing Parks winter metrics remain unchanged. Regression checks verify that the helper honours the explicit park label, both official source hosts remain available and the winter metrics are preserved.

The independent control review reproduced a map-loading race: two Map clicks before the CDN response appended two Leaflet scripts, and the second completion attempted to initialise an already-initialised container. A failed request also left the list hidden without an explanation. The map now shares one in-flight promise, initialises once, and uses a 10-second timeout plus request/library error handling. Failure returns the filtered route list with a visible status and Retry map button; retry removes the failed script and retains filters. The actual-script regression covers double click, network error, timeout, missing library, successful retry, filtered markers, ready-map reopen and a Grid selection made while loading. These checks use offline DOM/Leaflet stand-ins, without external requests or an Astro site build.

## Final record inventory

The table below records the final stable slugs and whether this pass attached an explicit primary-source review date. An omitted date is not a freshness claim.

| Slug | Route context | Review date | Directory |
| --- | --- | --- | --- |
| fenland-trail | year-round | Not individually refreshed | Listed |
| marsh-loop | year-round | 2026-10-28 | Listed |
| spray-river-east | year-round | Not individually refreshed | Listed |
| spray-river-west | year-round | Not individually refreshed | Listed |
| tunnel-campground-loop | year-round | Not individually refreshed | Listed |
| stewart-canyon | year-round | Not individually refreshed | Listed |
| johnson-lake | year-round | Not individually refreshed | Listed |
| sunshine-meadows | summer | Not individually refreshed | Listed |
| johnston-canyon-lower-falls | year-round | 2026-10-28 | Listed |
| johnston-canyon-upper-falls | year-round | 2026-10-28 | Listed |
| silverton-falls | summer | Not individually refreshed | Listed |
| boom-lake | summer | Not individually refreshed | Listed |
| vista-lake | summer | Not individually refreshed | Listed |
| sundance-canyon | year-round | Not individually refreshed | Listed |
| ink-pots | summer | 2026-10-28 | Listed |
| sulphur-mountain | year-round | Not individually refreshed | Listed |
| tunnel-mountain-summit | year-round | Not individually refreshed | Listed |
| surprise-corner-to-hoodoos | year-round | Not individually refreshed | Listed |
| upper-stoney | summer | Not individually refreshed | Listed |
| cascade-amphitheatre | summer | Not individually refreshed | Listed |
| c-level-cirque | summer | Not individually refreshed | Listed |
| healy-pass | summer | Not individually refreshed | Listed |
| bourgeau-lake | summer | Not individually refreshed | Listed |
| harvey-pass | summer | Not individually refreshed | Listed |
| rockbound-lake | summer | Not individually refreshed | Listed |
| arnica-lake | summer | Not individually refreshed | Listed |
| twin-lakes | summer | Not individually refreshed | Listed |
| aylmer-lookout | summer | Not individually refreshed | Listed |
| aylmer-pass | summer | Not individually refreshed | Listed |
| cory-pass-loop | summer | Not individually refreshed | Listed |
| lake-louise-lakeshore | year-round | 2026-10-28 | Listed |
| fairview-lookout | year-round | Not individually refreshed | Listed |
| bow-river-lake-louise | year-round | Not individually refreshed | Listed |
| rockpile | summer | 2026-10-28 | Listed |
| moraine-lake-lakeshore | summer | Not individually refreshed | Listed |
| consolation-lakes | summer | Not individually refreshed | Listed |
| lake-agnes | summer | 2026-10-28 | Listed |
| plain-of-six-glaciers | summer | 2026-10-28 | Listed |
| tramline | year-round | Not individually refreshed | Listed |
| lake-annette | summer | Not individually refreshed | Listed |
| eiffel-lake | summer | Not individually refreshed | Listed |
| larch-valley-minnestimma-lakes | summer | Not individually refreshed | Listed |
| saddleback-pass | summer | Not individually refreshed | Listed |
| fairview-mountain | summer | Not individually refreshed | Listed |
| sheol-paradise-connector | summer | Not individually refreshed | Listed |
| paradise-valley-giant-steps | summer | Not individually refreshed | Listed |
| sentinel-pass-from-paradise-valley | summer | Not individually refreshed | Listed |
| sentinel-pass-via-larch-valley | summer | Not individually refreshed | Listed |
| wenkchemna-pass | summer | Not individually refreshed | Listed |
| hidden-lake | summer | Not individually refreshed | Listed |
| deception-pass | summer | Not individually refreshed | Listed |
| castle-lookout | summer | Not individually refreshed | Listed |
| stanley-glacier | summer | 2026-10-28 | Listed |
| taylor-lake | summer | Not individually refreshed | Listed |
| peyto-lake-viewpoint | summer | 2026-10-28 | Listed |
| bow-summit-viewpoint | summer | Not individually refreshed | Listed |
| mistaya-canyon | summer | Not individually refreshed | Listed |
| bow-glacier-falls | summer | 2026-10-28 | Listed |
| helen-lake | summer | Not individually refreshed | Listed |
| cirque-lake | summer | Not individually refreshed | Listed |
| chephren-lake | summer | Not individually refreshed | Listed |
| nigel-pass | summer | Not individually refreshed | Listed |
| parker-ridge | summer | Not individually refreshed | Listed |
| molar-pass | summer | Not individually refreshed | Listed |
| north-molar-pass | summer | Not individually refreshed | Listed |
| dolomite-pass | summer | Not individually refreshed | Listed |
| peyto-lake-shore | summer | 2026-10-28 | Listed |
| glacier-lake | summer | Not individually refreshed | Listed |
| sunset-lookout | summer | Not individually refreshed | Listed |
| sunset-pass | summer | Not individually refreshed | Listed |
| cascade-valley-xc-ski | winter | 2026-10-28 | Listed |
| spray-river-loop-xc-ski | winter | 2026-10-28 | Listed |
| tunnel-mountain-winter | winter | 2026-10-28 | Listed |
| johnston-canyon-ice-walk | winter | 2026-10-28 | Listed |
| lake-louise-lakeshore-snowshoe | winter | 2026-10-28 | Listed |
| marble-canyon-snowshoe | winter | 2026-10-28 | Listed |
| ink-pots-snowshoe | winter | 2026-10-28 | Listed |
| goat-creek-xc-ski | winter | 2026-10-29 | Listed |
| healy-creek-xc-ski | winter | 2026-10-28 | Listed |
| golf-course-loop-xc-ski | winter | 2026-10-28 | Excluded legacy |
| bow-falls | summer | 2026-10-28 | Listed |

## Final root integration

Approximate listing-area coordinates are omitted from structured-data geo fields, matching the visible map qualification. Canonical trail URLs in schema use the trailing-slash form. The Marsh Trail summary is aligned with the sourced one-way route rather than a loop. Shared sitemap excludes the unverified golf-course legacy page; shared comparison tools use directory eligibility.
