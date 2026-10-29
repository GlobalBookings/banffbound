# Parkway planner review, 29 October 2026

This replaces the inherited planner at the existing `/icefields-parkway-planner/` route. The original automatically selected every stop, added fixed stop minutes to a driving constant, mixed distance origins and attached unqualified seasonal fuel/food and trail claims. The new comparison lets readers choose direction, season and visit type, select optional places, and copy an ordered planning brief with current-source checks.

## Location references

The current Parks Canada discovery page links the official summer map below. The PDF filename is dated 2022; it is used for physical location references, not current opening or operating information. Both pages were rendered and visually inspected, including a close view of the distance chart. The brochure's prose and the current HTML discovery table contain some inconsistent figures; the planner does not mix their origins or derive northbound distances from a different route-length headline.

- Map: https://pcweb2.azureedge.net/-/media/pn-np/ab/jasper/WET4/pdf/visit/depliants-brochures/ete-summer/Summer-on-the-Icefields-Parkway-Guide-2022.pdf
- Current linking page: https://parks.canada.ca/pn-np/ab/jasper/activ/itineraires-itineraries/promenadedesglaciers-icefieldsparkway

The paired approximate community references were read from the map chart:

| Place | km from Lake Louise village | km from Jasper |
| --- | ---: | ---: |
| Lake Louise | 0 | 233 |
| Herbert Lake | 6 | 227 |
| Hector Lake viewpoint | 19 | 214 |
| Crowfoot Glacier viewpoint | 36 | 197 |
| Bow Lake main access | 39 | 194 |
| Peyto / Bow Summit | 43 | 190 |
| Mistaya Canyon | 74 | 159 |
| Saskatchewan River Crossing | 80 | 153 |
| Parker Ridge | 121 | 112 |
| Icefield Centre | 130 | 103 |
| Tangle Falls | 137 | 96 |
| Sunwapta Falls | 179 | 54 |
| Athabasca Falls | 203 | 30 |
| Jasper | 233 | 0 |

These are explicitly approximate map/community references. The separate current Banff hiking source uses the Highway 1/93N junction for Bow Lake 36 km, Peyto 40 km and Mistaya 72 km, with additional access-road details. Those labelled origins remain in the full road guides and trail records, rather than being relabelled as village distances. No odometer navigation, hotel approach distance or arrival-time calculation is supplied.

## Current seasonal and physical scope

- https://parks.canada.ca/pn-np/ab/jasper/activ/experience/hiver-winter/pcghiver-ipwinter and its maintenance page https://parks.canada.ca/pn-np/ab/jasper/activ/experience/hiver-winter/pcghiver-ipwinter/pcg-securite-safety-ip support the current 93N snow-tire/chains requirement, November 1-March 31 and other snow/ice-covered periods, remote fuel/service planning, road reports, closures and no-stopping zones. Highway avalanche control does not assess recreational slopes. No fixed safe driving duration is inferred.
- https://www.thecrossingresort.com/ says all services are winter-closed and announces April 2027 without a confirmed day. The planner does not rely on winter fuel there. Separately reserved lodge stays/meals are distinct from dependable public roadside services.
- The current discovery page scopes Herbert day use and Mistaya's listed visitor trail seasonally. The general winter comparison also omits the Parker summer hike and seasonal centre/tours. The `winterCandidate` flag means inclusion in this bounded planning comparison, not a legal closure, open status, cleared parking or terrain assessment. Remaining landmarks and walking choices still require trip-day checks.
- https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking supports the current Parker profile and distinct viewpoint/trail descriptions. Current detailed hiking profiles take precedence over older brochure hike prose.
- https://parks.canada.ca/pn-np/ab/banff/activ/raquette-snowshoeing/lakelouise distinguishes designated winter outings from summer trails. The planner sends visitors to reviewed trail records and current Parks conditions; it does not approve natural ice, canyon access, a glacier walk or an avalanche route.

## Interaction and rendering

All fourteen complete place cards, seasonal notes, source handoffs, six FAQs and three preparation checks are server rendered. Optional selection controls and the filter form start hidden; no stops start selected. The client reveals controls only after required DOM/card identities exist. Its default winter/scenic view shows four optional landmarks and both endpoints.

Visit-type changes preserve season-allowed selected places in the visible shortlist, URL and copied brief, allowing a mixed view/walk plan. A season change removes examples outside that seasonal comparison, with a visible explanation. Direction changes reorder actual cards and use the other published community reference. Cards are not reparented on checkbox/filter renders with unchanged direction, preserving native keyboard focus; Space on the Bow Lake checkbox was checked in the browser.

Only allowlisted `parkway_direction`, `parkway_season`, `parkway_interest` and bounded canonical `parkway_stops` values enter the model. Unknown, duplicate and endpoint selections are rejected or normalized. Unrelated advertising parameters and fragments are retained. Reader values never build external destinations. The actual component is tested for reset, restored URLs, missing DOM, blocked history and clipboard success/denial fallback. Copy writes only after the user's button action; it supplies public planning choices, not a reservation or readiness verdict.

The existing Expedia rental referral `KB6G4xt` is preserved and labelled as affiliate content. The endpoint hotel handoff uses the existing reviewed Lake Louise comparison. No merchant transaction, provider SDK, new analytics identifier, hosting rule, ad launch or sale is introduced.

## Validation and limits

`check-parkway-planning.mjs` covers 12 model and 12 actual-client combinations, actual Astro SSR, paired map references, no-JS controls, mixed selection preservation, seasonal pruning, URL/copy failure paths and direction-only reparenting. The three source-guide checkers cover the five replacement bodies. The release verifier adds emitted/deployed planner contracts and the five guides to the preserved prior inventory.

The source-review notes are separate for the two Parkway bodies, Minnewanka and the two gondola guides. Spring-skiing, Peyto's old general article, restaurant records and scenic-flight legacy bodies remain separately queued. This release does not imply that all 295 canonical guides have been factually reviewed.
