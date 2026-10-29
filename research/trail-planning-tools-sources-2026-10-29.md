# Trail planning tools: source review and replacement model

Reviewed October 29, 2026. Scope: `src/pages/quiet-trails.astro`, `src/pages/alternatives.astro`, `src/data/trailAlternatives.ts` and this note. The earlier directory/detail review is recorded separately in `trail-quality-sources-2026-10-28.md`. No shared metadata, sitemap, fetcher, live JSON, build output or hosting configuration was edited here; no build or publishing was run.

## Original behaviour and problems

- Quiet Trails had no server-rendered results. Its JavaScript manufactured a numeric crowd score from the visitor device's hour/day/month, trail name, difficulty and region. It labelled the result live, rewarded remote/difficult routes as quieter and reduced a summer route's crowd score in winter. No occupancy feed supported it. Its FAQ/schema promised empty trails and parking benefits at fixed hours.
- Alternatives contained six groups and eighteen substitutions with unsupported 30–95% visitor reductions, nearly identical/same-reward claims and fixed travel times. It mixed winter variants into generic summer alternatives and suggested continuing through the Johnston Canyon approach to avoid crowds despite that approach's current closure. A fallback link could become `#`.
- Neither model could establish route opening, winter suitability, parking availability or a safe start time. A harder/remote outing is not a justified recommendation merely because fewer visitors are assumed.

## Primary evidence used

| Source | Application and limits |
| --- | --- |
| https://www.parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking | Current route profiles and start points. Fenland 1.9 km loop/rooted surfaces; Marsh Trail 1.5 km one way/uneven wetland and seasonal Route 4; Johnston endpoint/approach distinction; Lake Louise shore versus tea-house climbs; Rockpile loop; Peyto lookout versus steep/rough shore route. Route descriptions and estimates are not current access reports. |
| https://parks.canada.ca/pn-np/bc/kootenay/activ/randonnee-hike/jour-day | Stanley Glacier's Kootenay/BC location and 4.9 km one-way current hiking profile; Marble Canyon 0.9 km one way. Summer duration is not converted to a winter allowance. |
| https://banff.ca/654/Bow-Falls-Trail | Bow River Bridge to Bow Falls 1.2 km one way, separate pedestrian route and winter clifftop closure. The apparent elevation typo was not used. The lower viewing-area approach is distinguished from the summer through-route. |
| https://parks.canada.ca/pn-np/ab/banff/activ/raquette-snowshoeing/lakelouise | Designated winter lakeshore walk; falling-ice/avalanche areas; Lake Agnes/Mirror Lake and Plain of Six Glaciers winter exposure. Neither lake ice nor a summer hiking grade establishes winter access. |
| https://parks.canada.ca/pn-np/ab/banff/activ/skidefond-xcski/banff | Tunnel Mountain's 8 km network, actual campground starting point and Route 2; Spray River West's 5.6 km one-way bridge outing and avalanche paths 4.5–5 km from the trailhead; Cascade's distinct 6.3/15.1 km one-way endpoints. Current grooming and permitted uses still need checking. |
| https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise | Lake Louise/Moraine Lake transport are separate destination/season/booking decisions. No private-car arrival at Moraine Lake or winter operation of the summer shuttle is promised. |
| https://roamtransit.com/schedules-routes/ and https://roamtransit.com/fares/reservations/winter-reservations/ | Route identity and date-specific stops/returns; 8X village/lakeshore versus ski resort/Park and Ride. Routes 4/6 are not assumed winter connections. No fixed bus frequency, fare or protected connection is invented. |
| https://roamtransit.com/schedules-routes/johnston-canyon-regional-route-9/ | Current suspension/construction notice. Its estimate is not an assured restart and does not establish trail reopening. |
| https://parks.canada.ca/pn-np/ab/banff/bulletins/06d4ef61-a3c9-4b65-8dfc-66d056252d6c | Dated Johnston main-trail/day-use/P1 closure. Source record notice remains visibly dated October 28; neither an estimated end nor a different endpoint proves access. An alternative approach is a different outing. |
| https://www.drivebc.ca/ and https://511.alberta.ca/ | Direct road-report destinations for the appropriate province. No condition, journey time, whole-road opening or legal tyre requirement is inferred. |
| https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking/etat-sentiers-trail-conditions and https://parks.canada.ca/pn-np/bc/kootenay/activ/randonnee-hike/etat-sentiers-trail-conditions | Separate current reports linked for the correct park. No report values are copied into permanent comparison data. |

## Replacement and finite inventory

`trailAlternatives.ts` retains its existing filename/export name, but replaces the unsupported substitution contract. `TrailAlternative` now contains `id`, `title`, `comparison` and `slugs`; only the owned alternatives page consumed the previous contract. `trailPlanningOptions` contains explicit description seasons, interests, route demands, journey notes, seasonal limits and optional access-source links. `trailPlanningRoutes` joins those examples to the shared route records only after filtering `isDirectoryTrail`; the excluded unverified golf-course listing cannot appear.

There are 17 selected route descriptions: 12 summer descriptions and five winter activity descriptions. This limited selection is not a new certification of all inherited directory content, a clock-based season detector or a crowd ranking.

| Comparison | Stable slugs |
| --- | --- |
| Banff town | `fenland-trail`, `marsh-loop`, `bow-falls` |
| Lake Louise/Moraine Lake | `lake-louise-lakeshore`, `lake-agnes`, `plain-of-six-glaciers`, `rockpile` |
| Canyon endpoints/parks | `johnston-canyon-lower-falls`, `johnston-canyon-upper-falls`, `marble-canyon-snowshoe` |
| Lookout/shore/basin | `peyto-lake-viewpoint`, `peyto-lake-shore`, `stanley-glacier` |
| Winter activity choice | `lake-louise-lakeshore-snowshoe`, `tunnel-mountain-winter`, `spray-river-loop-xc-ski`, `cascade-valley-xc-ski` |

Quiet Trail Planning focuses on one-main-outing logistics, access, return arrangements and choosing a turnaround from the actual conditions/group/daylight. It does not issue a clock threshold. Route demand and season details remain available in native disclosures without JavaScript. Trail Comparisons exposes demands/access/season together and groups genuinely different commitments without suggesting equal reward, safety or effort.

Both pages render their complete content on the server. Filters are initially hidden and are revealed only by the client enhancement. Each has labelled season/area/interest fields, visible reset, a polite result count and an empty state with another reset. Alternatives filters individual route cards and hides empty groups; a surviving card is explicitly a planning lead rather than a recommended substitute. No current date, browser clock, geolocation, occupancy API or crowd/open status drives the selection. No false FAQ schema remains.

The public `/quiet-trails` and `/alternatives` URLs remain. Page titles/descriptions and visible headings now match their actual planning/comparison functions. No affiliate links existed in these files and none were added. Root owns shared metadata, tool-menu/link labels, sitemap dates and rendered production verification.

## Focused checks

Passed the data-module bundle/import and integrity checks: exactly 17 unique eligible plans, 12 summer/five winter descriptions, five groups, no missing/excluded route references and no obsolete crowd-reduction fields. Both Astro compiler transforms passed with zero diagnostics.

Executed each page's actual TypeScript client script after in-memory transformation against offline DOM stand-ins. Checked initial 17-card state, five winter cards, area/interest combinations, zero-result state, hiding empty comparison groups, both reset controls, result counts and form submission handling. A throwing Date stand-in verifies that no device-clock selection occurs. Checked visible labels against control IDs, native no-JavaScript/server-rendered content structure and absence of the old score/FAQ/status-fallback code. `git diff --check` passed. These checks do not claim rendered-browser or production verification; root owns that step.

No full build or external write is part of this task. The shared route facts and dated notices remain planning information, and the official map/report/closure sources govern the actual trip.
